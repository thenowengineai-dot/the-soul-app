import { useState, useEffect, useRef } from 'react'
import ChatRoomHeader from './ChatRoomHeader'
import MessageList from './MessageList'
import ChatInputBar from './ChatInputBar'
import { MOCK_MESSAGES, MOCK_CHATS } from '../../mockData'
import type { ChatRoomProps, ChatMessage } from '../../types'
import {
  ensureGuestAccount,
  startNewSession,
  loadSession,
  streamChatMessage,
} from '../../chatApi'

export type { ChatRoomProps }

export function ChatRoom({
  chat = MOCK_CHATS[0],
  messages = MOCK_MESSAGES,
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
  const [isSessionLoading, setIsSessionLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [prevChatId, setPrevChatId] = useState<string | number>(currentChat.id)

  if (currentChat.id !== prevChatId) {
    setPrevChatId(currentChat.id)
    setIsSessionLoading(true)
  }

  // 1. ลงทะเบียน Guest Account ครั้งแรกในเบื้องหลัง
  useEffect(() => {
    ensureGuestAccount().catch(err => {
      console.warn('[AUTH GUEST] Background register warning:', err)
    })
  }, [])

  // 2. เมื่อสลับตัวละคร: โหลดข้อมูล Session เก่า (ถ้ามี) หรือเตรียมพื้นที่แชท
  useEffect(() => {
    let isCancelled = false

    const isPublishedCampaign = String(currentChat.id).startsWith('campaign_')

    loadSession(String(currentChat.id))
      .then(res => {
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
            onHudUpdate?.({
              affection: res.characterStats.affection,
              desire: res.characterStats.desire,
              actor_posture: res.actorPosture,
              player_posture: res.playerPosture,
              tension: res.tensionGauge,
              stance: res.currentStance,
              dominance_state: res.dominanceState,
            })
          }
        } else {
          // ถ้ายังไม่เคยเริ่มเซฟ: ถ้าเป็นตัวละครจริง ให้แสดงข้อความต้อนรับ
          if (isPublishedCampaign) {
            setSessionId(null)
            setChatMessages([
              {
                id: `intro_${currentChat.id}`,
                type: 'vo',
                text: `${currentChat.name} กำลังรอคุณอยู่... พิมพ์ข้อความเพื่อเริ่มต้นบทสนทนา`,
              },
            ])
          } else {
            // ตัวละคร Mock เดิม
            setSessionId(null)
            setChatMessages(messages)
          }
        }
      })
      .catch(err => {
        if (isCancelled) return
        console.warn('[LOAD SESSION] Fallback to default:', err)
        setChatMessages(messages)
      })
      .finally(() => {
        if (!isCancelled) setIsSessionLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [currentChat.id, currentChat.name, messages, onHudUpdate])

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
          })
        }
      }

      const turnTimestamp = Date.now()
      const historyPayload = chatMessages
        .filter(m => m.type === 'msg')
        .map(m => ({
          role: m.sender === 'me' ? 'user' : 'assistant',
          content: m.text,
        }))

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
    <div className="flex-1 h-full flex flex-col bg-app-bg z-0 overflow-hidden relative min-w-0">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto flex flex-col no-scrollbar relative">
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
