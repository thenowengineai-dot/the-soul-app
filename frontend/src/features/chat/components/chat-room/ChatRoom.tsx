import { useState, useEffect, useRef } from 'react'
import ChatRoomHeader from './ChatRoomHeader'
import MessageList from './MessageList'
import ChatInputBar from './ChatInputBar'
import { MOCK_CHATS } from '../../mockData'
import type { ChatRoomProps, ChatMessage } from '../../types'
import {
  ensureGuestAccount,
  startNewSession,
  loadSession,
  streamChatMessage,
} from '../../chatApi'

export type { ChatRoomProps }

interface TurnHistoryItem {
  role: 'user' | 'assistant'
  content: string
  action?: string
  voice_over?: string
}

/**
 * 🌟 รวม ChatMessages ให้กลายเป็น Turn-based History แท้จริงเหมือนแอปเก่า
 * - 1 เทิร์น = ผู้เล่น 1 ข้อความ (user) + บอท 1 ข้อความ (assistant)
 * - บอท 1 เทิร์นจะรวบทั้ง Action (*...*) และ Dialogue เข้าด้วยกัน พร้อมแนบ voice_over
 * - คืนค่าประวัติย้อนหลังตามจำนวน maxTurns (6 เทิร์น = 12 ข้อความ)
 */
function buildTurnHistory(messages: ChatMessage[], maxTurns = 6): TurnHistoryItem[] {
  const turns: TurnHistoryItem[] = []
  let pendingUser: TurnHistoryItem | null = null
  let botActions: string[] = []
  let botDialogues: string[] = []
  let botVo: string | undefined = undefined

  const flushBot = () => {
    if (pendingUser) {
      turns.push(pendingUser)
      pendingUser = null
    }
    if (botActions.length > 0 || botDialogues.length > 0) {
      const actionText = botActions.join(' ').trim()
      const dialogueText = botDialogues.join(' ').trim()

      let content = ''
      if (actionText && dialogueText) {
        content = `*(${actionText})* ${dialogueText}`
      } else if (actionText) {
        content = `*(${actionText})*`
      } else {
        content = dialogueText
      }

      turns.push({
        role: 'assistant',
        content,
        action: actionText || undefined,
        voice_over: botVo,
      })

      botActions = []
      botDialogues = []
      botVo = undefined
    } else if (botVo) {
      turns.push({
        role: 'assistant',
        content: `[บรรยายฉาก]: ${botVo}`,
        voice_over: botVo,
      })
      botVo = undefined
    }
  }

  for (const m of messages) {
    if (m.type === 'date') continue

    if (m.sender === 'me') {
      flushBot()
      pendingUser = {
        role: 'user',
        content: m.text,
      }
    } else if (m.type === 'vo') {
      botVo = m.text
    } else if (m.type === 'action') {
      botActions.push(m.text)
    } else if (m.type === 'msg' || !m.type) {
      botDialogues.push(m.text)
    }
  }

  flushBot()

  // 1 เทิร์น = 2 ข้อความ (User 1 + Assistant 1)
  // ตัดประวัติย้อนหลัง maxTurns เทิร์น (6 เทิร์น = 12 ข้อความ)
  const maxItems = maxTurns * 2
  return turns.slice(-maxItems)
}

export function ChatRoom({
  chat = MOCK_CHATS[0],
  messages: _messages = [],
  isChatListOpen = true,
  onToggleChatList,
  isHudOpen = true,
  onToggleHud,
  coinBalance = 1250,
  notificationCount = 3,
  onCoinClick,
  onNotificationClick,
  onProfileClick,
  userInitial = 'A',
  userName = 'Alice',
  onHudUpdate,
}: ChatRoomProps) {
  const currentChat = chat || MOCK_CHATS[0]
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isSessionLoading, setIsSessionLoading] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const currentKey = `${currentChat.id}_${currentChat.sessionTriggerKey || 0}`
  const [prevKey, setPrevKey] = useState<string>(currentKey)

  if (currentKey !== prevKey) {
    setPrevKey(currentKey)
    setIsSessionLoading(true)
  }

  // ป้องกันการเด้งดึ๋ง (Elastic Rubber-Band Bounce) เมื่อเลื่อนถึงบนสุดและล่างสุด ให้หยุดนิ่งสนิท
  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      const canScroll = el.scrollHeight > el.clientHeight
      if (!canScroll) {
        e.preventDefault()
        return
      }

      const isAtTop = el.scrollTop <= 0
      const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1

      if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
        e.preventDefault()
      }
    }

    let touchStartY = 0
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY || 0
    }

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0]?.clientY || 0
      const deltaY = touchStartY - currentY
      const canScroll = el.scrollHeight > el.clientHeight

      if (!canScroll) {
        if (e.cancelable) e.preventDefault()
        return
      }

      const isAtTop = el.scrollTop <= 0
      const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1

      if ((isAtTop && deltaY < 0) || (isAtBottom && deltaY > 0)) {
        if (e.cancelable) e.preventDefault()
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      el.removeEventListener('wheel', handleWheel)
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  // 1. ลงทะเบียน Guest Account ครั้งแรกในเบื้องหลัง
  useEffect(() => {
    ensureGuestAccount().catch(err => {
      console.warn('[AUTH GUEST] Background register warning:', err)
    })
  }, [])

  const onHudUpdateRef = useRef(onHudUpdate)
  useEffect(() => {
    onHudUpdateRef.current = onHudUpdate
  }, [onHudUpdate])

  const openingTriggeredRef = useRef<string | null>(null)

  // 2. เมื่อสลับตัวละคร หรือเริ่มเซสชันใหม่: โหลดข้อมูล Session เก่า (ถ้ามี) หรือเริ่มฉากเปิดตัวอัตโนมัติ (Turn 0: Prologue)
  useEffect(() => {
    let isCancelled = false
    const charKey = String(currentChat.id)
    const triggerKey = currentChat.sessionTriggerKey 
      ? `${charKey}_${currentChat.sessionTriggerKey}` 
      : `${charKey}_active`

    const runOpeningPrologue = async () => {
      if (openingTriggeredRef.current === triggerKey) {
        setIsSessionLoading(false)
        return
      }
      openingTriggeredRef.current = triggerKey

      setSessionId(null)
      setChatMessages([])
      setIsSessionLoading(false)
      setIsStreaming(true)

      try {
        const newSess = await startNewSession(charKey)
        if (isCancelled) return

        const activeSessionId = newSess.session_id
        setSessionId(activeSessionId)

        if (newSess.initial_state) {
          onHudUpdateRef.current?.({
            affection: newSess.initial_state.affection,
            desire: newSess.initial_state.desire,
            actor_posture: newSess.initial_state.a_pos,
            player_posture: newSess.initial_state.p_pos,
            stance: newSess.initial_state.stance,
            current_outfit: newSess.initial_state.current_outfit,
            environment: newSess.initial_state.environment,
          })
        }

        const openingTimestamp = Date.now()
        await streamChatMessage(
          {
            sessionId: activeSessionId,
            characterId: charKey,
            worldId: charKey,
            message: '[SYSTEM] เริ่มต้นเกม',
            history: [],
          },
          {
            onVoiceOver: (voText) => {
              if (isCancelled) return
              const voId = `vo_${openingTimestamp}`
              setChatMessages(prev => {
                const existingIndex = prev.findIndex(m => m.id === voId)
                if (existingIndex >= 0) {
                  return prev.map((m, idx) => idx === existingIndex ? { ...m, text: voText } : m)
                }
                return [...prev, { id: voId, type: 'vo', text: voText }]
              })
            },
            onActorSegments: (segments) => {
              if (isCancelled) return
              setChatMessages(prev => {
                const next = prev.filter(m => !String(m.id).startsWith(`opening_${openingTimestamp}`))
                const segMessages: ChatMessage[] = segments.map((s, idx) => {
                  if (s.type === 'action') {
                    return {
                      id: `opening_${openingTimestamp}_act_${idx}`,
                      type: 'action',
                      text: s.content,
                      sender: 'them',
                    }
                  }
                  return {
                    id: `opening_${openingTimestamp}_dia_${idx}`,
                    type: 'msg',
                    text: s.content,
                    sender: 'them',
                  }
                })
                return [...next, ...segMessages]
              })
            },
            onPhysicsUpdate: (phys) => {
              if (isCancelled) return
              onHudUpdateRef.current?.({
                actor_posture: phys.actor_posture,
                player_posture: phys.player_posture,
                tension: phys.tension,
                stance: phys.stance,
                dominance_state: phys.dominance_state,
              })
            },
            onUnifiedRound: (round) => {
              if (isCancelled) return
              if (round.state) {
                onHudUpdateRef.current?.({
                  affection: round.state.affection,
                  desire: round.state.desire,
                  actor_posture: round.state.a_pos,
                  player_posture: round.state.p_pos,
                })
              }
            },
            onError: (err) => {
              console.error('[OPENING STREAM ERROR]:', err)
              if (!isCancelled) setIsStreaming(false)
            },
            onDone: () => {
              if (!isCancelled) setIsStreaming(false)
            },
          }
        )
      } catch (initErr) {
        console.error('[OPENING INIT FAILED]:', initErr)
        if (!isCancelled) setIsStreaming(false)
      } finally {
        if (!isCancelled) {
          setIsSessionLoading(false)
          setIsStreaming(false)
        }
      }
    }

    // 1. ถ้าสั่งบังคับเริ่ม Session ใหม่ (เช่น กดจากปุ่ม "เริ่มคุยใหม่" ในหน้ารายละเอียดตัวละคร)
    if (currentChat.forceNewSession) {
      runOpeningPrologue()
      return () => {
        isCancelled = true
      }
    }

    // 2. ถ้าเข้าแบบปกติ ให้พยายามโหลดเซสชันเก่าก่อน
    loadSession(charKey)
      .then(async res => {
        if (isCancelled) return

        if (res.has_started && res.messages && res.messages.length > 0) {
          setSessionId(res.session_id || null)

          const mapped: ChatMessage[] = res.messages.map((m, idx) => {
            if (m.role === 'user') {
              return { id: m.id || `u_${idx}`, type: 'msg', text: m.content || '', sender: 'me' }
            } else if (m.role === 'vo' || m.role === 'intro_brief') {
              return { id: m.id || `vo_${idx}`, type: 'vo', text: m.content || '' }
            } else if (m.role === 'ai') {
              if (m.action) {
                return { id: m.id || `act_${idx}`, type: 'action', text: m.action, sender: 'them' }
              }
              return { id: m.id || `dia_${idx}`, type: 'msg', text: m.dialogue || m.content || '', sender: 'them' }
            }
            return { id: m.id || `m_${idx}`, type: 'msg', text: m.content || '', sender: 'them' }
          })

          setChatMessages(mapped)

          if (res.characterStats) {
            onHudUpdateRef.current?.({
              affection: res.characterStats.affection,
              desire: res.characterStats.desire,
              actor_posture: res.actorPosture,
              player_posture: res.playerPosture,
              tension: res.tensionGauge,
              stance: res.currentStance,
              dominance_state: res.dominanceState,
            })
          }
          setIsSessionLoading(false)
        } else {
          await runOpeningPrologue()
        }
      })
      .catch(err => {
        if (isCancelled) return
        console.warn('[LOAD SESSION] Error:', err)
        setIsSessionLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [currentChat.id, currentChat.sessionTriggerKey, currentChat.forceNewSession])

  // 3. เลื่อน Scroll ลงด้านล่างสุดเสมอเมื่อมีข้อความใหม่หรือกำลังสตรีม
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isStreaming])

  // 4. ส่งข้อความและเชื่อมต่อ Real-time SSE Stream กับ Cloud Run Backend
  const handleSendMessage = async () => {
    const text = inputText.trim()
    if (!text || isStreaming) return

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'msg',
      text: text,
      sender: 'me',
    }

    setChatMessages(prev => [...prev, userMsg])
    setInputText('')
    setIsStreaming(true)

    try {
      let activeSessionId = sessionId

      // ถ้ายังไม่มี Session ให้สร้างใหม่บน Neon PostgreSQL + Upstash Redis ทันที
      if (!activeSessionId) {
        const newSess = await startNewSession(
          String(currentChat.id),
          currentChat.statusMessage ? String(currentChat.id) : undefined
        )
        activeSessionId = newSess.session_id
        setSessionId(activeSessionId)

        if (newSess.initial_state) {
          onHudUpdate?.({
            affection: newSess.initial_state.affection,
            desire: newSess.initial_state.desire,
            actor_posture: newSess.initial_state.a_pos,
            player_posture: newSess.initial_state.p_pos,
            stance: newSess.initial_state.stance,
            current_outfit: newSess.initial_state.current_outfit,
            environment: newSess.initial_state.environment,
          })
        }
      }

      const turnTimestamp = Date.now()
      const historyPayload = buildTurnHistory(chatMessages, 6)

      await streamChatMessage(
        {
          sessionId: activeSessionId,
          characterId: String(currentChat.id),
          worldId: String(currentChat.id),
          message: text,
          history: historyPayload,
        },
        {
          onVoiceOver: (voText) => {
            const voId = `vo_${turnTimestamp}`
            setChatMessages(prev => {
              const existingIndex = prev.findIndex(m => m.id === voId)
              if (existingIndex >= 0) {
                return prev.map((m, idx) => idx === existingIndex ? { ...m, text: voText } : m)
              }
              return [...prev, { id: voId, type: 'vo', text: voText }]
            })
          },
          onActorSegments: (segments) => {
            setChatMessages(prev => {
              const base = prev.filter(m => !String(m.id).startsWith(`act_${turnTimestamp}_`))
              const newItems: ChatMessage[] = segments.map((seg, idx) => ({
                id: `act_${turnTimestamp}_${idx}`,
                type: seg.type === 'action' ? 'action' : 'msg',
                text: seg.content,
                sender: 'them',
              }))
              return [...base, ...newItems]
            })
          },
          onPhysicsUpdate: (phys) => {
            onHudUpdate?.({
              actor_posture: phys.actor_posture,
              player_posture: phys.player_posture,
              tension: phys.tension,
              stance: phys.stance,
              dominance_state: phys.dominance_state,
            })
          },
          onUnifiedRound: (round) => {
            if (round.state) {
              onHudUpdate?.({
                affection: round.state.affection,
                desire: round.state.desire,
                actor_posture: round.state.a_pos,
                player_posture: round.state.p_pos,
              })
            }
          },
          onError: (err) => {
            console.error('[STREAM ERROR]:', err)
            setIsStreaming(false)
          },
          onDone: () => {
            setIsStreaming(false)
          },
        }
      )
    } catch (err) {
      console.error('[CHAT ERROR]:', err)
      setIsStreaming(false)
    }
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-app-bg z-0 overflow-hidden relative min-w-0 overscroll-none">
      {/* Messages Area */}
      <div 
        ref={scrollContainerRef}
        style={{ overscrollBehavior: 'none', overscrollBehaviorY: 'none' }}
        className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col no-scrollbar relative overscroll-none touch-pan-y"
      >
        {/* Floating Sticky Header (Frameless Glassmorphism Pills) */}
        <ChatRoomHeader
          chat={currentChat}
          isChatListOpen={isChatListOpen}
          onToggleChatList={onToggleChatList}
          isHudOpen={isHudOpen}
          onToggleHud={onToggleHud}
          coinBalance={coinBalance}
          notificationCount={notificationCount}
          onCoinClick={onCoinClick}
          onNotificationClick={onNotificationClick}
          onProfileClick={onProfileClick}
          userInitial={userInitial}
          userName={userName}
        />

        {/* Loading Spinner for Session Fetch */}
        {isSessionLoading && (
          <div className="w-full flex items-center justify-center py-4 select-none">
            <span className="text-[12px] text-app-secondary/60 animate-pulse tracking-wide">
              กำลังเชื่อมต่อความทรงจำ...
            </span>
          </div>
        )}

        {/* Main Conversation Column */}
        <MessageList
          messages={chatMessages}
          chatAvatar={currentChat.avatar}
          chatName={currentChat.name}
          endRef={messagesEndRef}
        />

        {/* Streaming Indicator */}
        {isStreaming && (
          <div className="w-full max-w-[800px] mx-auto px-4 sm:px-6 pb-2 select-none">
            <div className="flex items-center gap-2 text-[12px] text-app-secondary/70">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C] animate-pulse" />
              <span>{currentChat.name} กำลังตอบกลับ...</span>
            </div>
          </div>
        )}

        {/* Sticky Bottom Bar */}
        <ChatInputBar
          inputMessage={inputText}
          onInputChange={setInputText}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  )
}

export default ChatRoom
