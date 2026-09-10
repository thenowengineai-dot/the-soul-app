import { useState, useEffect, useRef, useCallback } from 'react'
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
import { CompanionInspectorDrawer } from '../../../dev-console'
import type {
  UserConsoleRole,
  TurnLogEntry,
  QuestBeatState,
  LiveStateGauges,
} from '../../../dev-console'

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
  userEmail = '',
  planName = 'Free Plan',
  isLoggedIn = false,
  onLoginClick,
  onSignupClick,
  isProfileDropdownOpen = false,
  onCloseProfileDropdown,
  onEditProfileClick,
  onSignOut,
  isInspectorOpen: propIsInspectorOpen,
  onToggleInspector,
  onCloseInspector,
  onSwitchToHud,
  onCoinBalanceUpdate,
  onHudUpdate,
  onStreamingChange,
  onLatestMessageChange,
}: ChatRoomProps) {
  const currentChat = chat || MOCK_CHATS[0]
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isSessionLoading, setIsSessionLoading] = useState(true)
  const [insufficientCoinsModal, setInsufficientCoinsModal] = useState<{
    isOpen: boolean
    message: string
    balance: number
    required: number
  } | null>(null)

  // 🧭 Dev Console / Quest & Beat Inspector State
  const [internalIsInspectorOpen, setInternalIsInspectorOpen] = useState(false)
  const isInspectorOpen = propIsInspectorOpen !== undefined ? propIsInspectorOpen : internalIsInspectorOpen
  const toggleInspector = onToggleInspector || (() => setInternalIsInspectorOpen(prev => !prev))
  const closeInspector = () => {
    if (onCloseInspector) {
      onCloseInspector()
    } else if (onToggleInspector && isInspectorOpen) {
      onToggleInspector()
    } else {
      setInternalIsInspectorOpen(false)
    }
  }

  const [turnLogs, setTurnLogs] = useState<TurnLogEntry[]>([])
  const [questState, setQuestState] = useState<QuestBeatState | undefined>(undefined)
  const [liveGauges, setLiveGauges] = useState<LiveStateGauges | undefined>(undefined)
  const currentTurnIdRef = useRef<string | number | null>(null)
  const turnCountRef = useRef<number>(0)

  // Gating Role:
  const isSuperAdmin = Boolean(
    (userEmail && (
      userEmail.toLowerCase().includes('admin') ||
      userEmail.toLowerCase().includes('alice') ||
      userEmail.toLowerCase() === 'traveler@gmail.com'
    )) ||
    import.meta.env.DEV ||
    localStorage.getItem('the_soul_role') === 'admin'
  )

  const isCreator = Boolean(
    localStorage.getItem('the_soul_role') === 'creator' ||
    (userEmail && userEmail.toLowerCase().includes('creator')) ||
    currentChat.isCreator
  )

  const consoleRole: UserConsoleRole = isSuperAdmin ? 'admin' : (isCreator ? 'creator' : 'admin')

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

  // 1. ลงทะเบียน Guest Account ครั้งแรกในเบื้องหลัง (ตัดการยิงซ้ำถ้าเคย Sync แล้ว)
  useEffect(() => {
    const isSynced = localStorage.getItem('the_soul_guest_synced')
    if (isSynced === 'true') return

    ensureGuestAccount()
      .then(() => {
        localStorage.setItem('the_soul_guest_synced', 'true')
      })
      .catch(err => {
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
        const actualWorld = currentChat.defaultWorld || charKey
        const newSess = await startNewSession(charKey, actualWorld)
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
          setLiveGauges({
            affection: newSess.initial_state.affection,
            desire: newSess.initial_state.desire,
            tension: 0,
            stance: newSess.initial_state.stance || 'NEUTRAL',
            chaosLevel: 'LOW',
            actorPosture: newSess.initial_state.a_pos,
            playerPosture: newSess.initial_state.p_pos,
            currentOutfit: newSess.initial_state.current_outfit,
          })
        }

        const openingTimestamp = Date.now()
        const turn0Id = `turn_0_${openingTimestamp}`
        currentTurnIdRef.current = turn0Id
        turnCountRef.current = 0
        setTurnLogs([
          {
            id: turn0Id,
            type: 'turn',
            turnNumber: 0,
            userMsg: '[SYSTEM] เริ่มต้นเกม (Prologue)',
            timestamp: openingTimestamp,
          },
        ])

        await streamChatMessage(
          {
            sessionId: activeSessionId,
            characterId: charKey,
            worldId: actualWorld,
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
            onActorSegment: (segment, index) => {
              if (isCancelled) return
              const msgId = `opening_${openingTimestamp}_${index}`
              setChatMessages(prev => {
                const existingIndex = prev.findIndex(m => m.id === msgId)
                const newMsg: ChatMessage = {
                  id: msgId,
                  type: segment.type === 'action' ? 'action' : 'msg',
                  text: segment.content,
                  sender: 'them',
                }
                if (existingIndex >= 0) {
                  return prev.map((m, idx) => idx === existingIndex ? newMsg : m)
                }
                return [...prev, newMsg]
              })
            },
            onActorSegments: (segments) => {
              if (isCancelled) return
              setChatMessages(prev => {
                const next = prev.filter(m => !String(m.id).startsWith(`opening_${openingTimestamp}_`))
                const segMessages: ChatMessage[] = segments.map((s, idx) => ({
                  id: `opening_${openingTimestamp}_${idx}`,
                  type: s.type === 'action' ? 'action' : 'msg',
                  text: s.content,
                  sender: 'them',
                }))
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
              setLiveGauges(prev => ({
                affection: prev?.affection ?? 0,
                desire: prev?.desire ?? 0,
                tension: typeof phys.tension === 'number' ? phys.tension : (prev?.tension ?? 0),
                stance: phys.stance || prev?.stance || 'NEUTRAL',
                chaosLevel: prev?.chaosLevel || 'LOW',
                actorPosture: phys.actor_posture || prev?.actorPosture,
                playerPosture: phys.player_posture || prev?.playerPosture,
                dominanceState: phys.dominance_state || prev?.dominanceState,
              }))
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
                setLiveGauges(prev => ({
                  affection: round.state.affection ?? prev?.affection ?? 0,
                  desire: round.state.desire ?? prev?.desire ?? 0,
                  tension: prev?.tension ?? 0,
                  stance: prev?.stance || 'NEUTRAL',
                  chaosLevel: prev?.chaosLevel || 'LOW',
                  actorPosture: round.state.a_pos || prev?.actorPosture,
                  playerPosture: round.state.p_pos || prev?.playerPosture,
                  dominanceState: prev?.dominanceState,
                }))
              }
            },
            onDebugPrompt: (debug) => {
              if (isCancelled) return
              const agentKey = debug.agent as 'evaluator' | 'director' | 'actor'
              setTurnLogs(prev => prev.map(item => {
                if (item.id !== turn0Id) return item
                return {
                  ...item,
                  [agentKey]: {
                    ...item[agentKey],
                    prompt: debug.prompt,
                  },
                }
              }))
            },
            onDebugResponse: (debug) => {
              if (isCancelled) return
              const agentKey = debug.agent as 'evaluator' | 'director' | 'actor'
              setTurnLogs(prev => prev.map(item => {
                if (item.id !== turn0Id) return item
                return {
                  ...item,
                  [agentKey]: {
                    ...item[agentKey],
                    response: debug.response,
                    thinking: debug.thinking,
                  },
                }
              }))
            },
            onBeatStatus: (beatData) => {
              if (isCancelled) return
              setQuestState({
                eventId: beatData.event_id || beatData.current_quest,
                eventName: beatData.event_name || beatData.quest_title,
                phaseId: beatData.phase_id || beatData.current_scene,
                beatId: beatData.beat_id || beatData.current_beat_id,
                beatTurnCount: beatData.beat_turn_count ?? beatData.turns_in_beat ?? 0,
                sandboxTurnCount: beatData.sandbox_turn_count ?? 0,
                pacingStatus: (beatData.pacing_status === 'advancing' || beatData.pacing_status === 'holding' || beatData.pacing_status === 'completed') ? beatData.pacing_status : 'idle',
                conditionHint: beatData.condition_hint || beatData.trigger_condition,
              })
              if (beatData.gauges) {
                setLiveGauges(prev => ({
                  ...prev,
                  ...beatData.gauges,
                }))
              }
            },
            onSystemEvent: (sys) => {
              if (isCancelled) return
              const alertId = `alert_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
              setTurnLogs(prev => [
                {
                  id: alertId,
                  type: 'system_alert',
                  message: sys.message || sys.event || 'System Event Triggered',
                  detail: sys.detail || (typeof sys.data === 'object' ? JSON.stringify(sys.data) : sys.data),
                  alertType: sys.type || 'info',
                  timestamp: Date.now(),
                },
                ...prev,
              ])
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
            setLiveGauges({
              affection: res.characterStats.affection,
              desire: res.characterStats.desire,
              tension: res.tensionGauge ?? 0,
              stance: res.currentStance || 'NEUTRAL',
              chaosLevel: 'LOW',
              actorPosture: res.actorPosture,
              playerPosture: res.playerPosture,
              dominanceState: res.dominanceState,
            })
          }
          if (res.activeEventId) {
            setQuestState({
              eventId: res.activeEventId,
              eventName: res.activeEventId,
              phaseId: res.activeEventPhase || undefined,
              beatId: res.activeBeatId || undefined,
              beatTurnCount: res.beatTurnCount ?? 0,
              sandboxTurnCount: res.sandboxTurnCount ?? 0,
              pacingStatus: 'holding',
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
  }, [currentChat.id, currentChat.sessionTriggerKey, currentChat.forceNewSession, currentChat.defaultWorld])

  // 3. เลื่อน Scroll ลงด้านล่างสุดเสมอเมื่อมีข้อความใหม่หรือกำลังสตรีม (Twitter Style Auto-Scroll)
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }, [])

  useEffect(() => {
    // เมื่อกำลังสตรีมข้อความใช้ 'auto' เพื่อความนิ่ง ไม่กระตุก เมื่อจบหรือมีข้อความใหม่ใช้ 'smooth'
    scrollToBottom(isStreaming ? 'auto' : 'smooth')
  }, [chatMessages, isStreaming, scrollToBottom])

  // แจ้งสถานะกำลังพิมพ์และข้อความล่าสุดให้ ChatList ทราบ
  useEffect(() => {
    onStreamingChange?.(isStreaming)
  }, [isStreaming, onStreamingChange])

  useEffect(() => {
    if (chatMessages.length > 0) {
      const lastMsg = chatMessages[chatMessages.length - 1]
      if (lastMsg && lastMsg.text && lastMsg.type !== 'vo') {
        onLatestMessageChange?.(lastMsg.text)
      }
    }
  }, [chatMessages, onLatestMessageChange])

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
    setTimeout(() => scrollToBottom('smooth'), 40)

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
      const nextTurnNum = (turnCountRef.current += 1)
      const currentTurnId = `turn_${nextTurnNum}_${turnTimestamp}`
      currentTurnIdRef.current = currentTurnId
      setTurnLogs(prev => [
        {
          id: currentTurnId,
          type: 'turn',
          turnNumber: nextTurnNum,
          userMsg: text,
          timestamp: turnTimestamp,
        },
        ...prev,
      ])
      const historyPayload = buildTurnHistory(chatMessages, 6)

      await streamChatMessage(
        {
          sessionId: activeSessionId,
          characterId: String(currentChat.id),
          worldId: currentChat.defaultWorld || String(currentChat.id),
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
          onActorSegment: (segment, index) => {
            const msgId = `act_${turnTimestamp}_${index}`
            setChatMessages(prev => {
              const existingIndex = prev.findIndex(m => m.id === msgId)
              const newMsg: ChatMessage = {
                id: msgId,
                type: segment.type === 'action' ? 'action' : 'msg',
                text: segment.content,
                sender: 'them',
              }
              if (existingIndex >= 0) {
                return prev.map((m, idx) => idx === existingIndex ? newMsg : m)
              }
              return [...prev, newMsg]
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
            setLiveGauges(prev => ({
              affection: prev?.affection ?? 0,
              desire: prev?.desire ?? 0,
              tension: typeof phys.tension === 'number' ? phys.tension : (prev?.tension ?? 0),
              stance: phys.stance || prev?.stance || 'NEUTRAL',
              chaosLevel: prev?.chaosLevel || 'LOW',
              actorPosture: phys.actor_posture || prev?.actorPosture,
              playerPosture: phys.player_posture || prev?.playerPosture,
              dominanceState: phys.dominance_state || prev?.dominanceState,
            }))
          },
          onUnifiedRound: (round) => {
            if (round.state) {
              onHudUpdate?.({
                affection: round.state.affection,
                desire: round.state.desire,
                actor_posture: round.state.a_pos,
                player_posture: round.state.p_pos,
              })
              setLiveGauges(prev => ({
                affection: round.state.affection ?? prev?.affection ?? 0,
                desire: round.state.desire ?? prev?.desire ?? 0,
                tension: prev?.tension ?? 0,
                stance: prev?.stance || 'NEUTRAL',
                chaosLevel: prev?.chaosLevel || 'LOW',
                actorPosture: round.state.a_pos || prev?.actorPosture,
                playerPosture: round.state.p_pos || prev?.playerPosture,
                dominanceState: prev?.dominanceState,
              }))
            }
          },
          onDebugPrompt: (debug) => {
            const agentKey = debug.agent as 'evaluator' | 'director' | 'actor'
            setTurnLogs(prev => prev.map(item => {
              if (item.id !== currentTurnId) return item
              return {
                ...item,
                [agentKey]: {
                  ...item[agentKey],
                  prompt: debug.prompt,
                },
              }
            }))
          },
          onDebugResponse: (debug) => {
            const agentKey = debug.agent as 'evaluator' | 'director' | 'actor'
            setTurnLogs(prev => prev.map(item => {
              if (item.id !== currentTurnId) return item
              return {
                ...item,
                [agentKey]: {
                  ...item[agentKey],
                  response: debug.response,
                  thinking: debug.thinking,
                },
              }
            }))
          },
          onBeatStatus: (beatData) => {
            setQuestState({
              eventId: beatData.event_id || beatData.current_quest,
              eventName: beatData.event_name || beatData.quest_title,
              phaseId: beatData.phase_id || beatData.current_scene,
              beatId: beatData.beat_id || beatData.current_beat_id,
              beatTurnCount: beatData.beat_turn_count ?? beatData.turns_in_beat ?? 0,
              sandboxTurnCount: beatData.sandbox_turn_count ?? 0,
              pacingStatus: (beatData.pacing_status === 'advancing' || beatData.pacing_status === 'holding' || beatData.pacing_status === 'completed') ? beatData.pacing_status : 'idle',
              conditionHint: beatData.condition_hint || beatData.trigger_condition,
            })
            if (beatData.gauges) {
              setLiveGauges(prev => ({
                ...prev,
                ...beatData.gauges,
              }))
            }
          },
          onSystemEvent: (sys) => {
            const alertId = `alert_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
            setTurnLogs(prev => [
              {
                id: alertId,
                type: 'system_alert',
                message: sys.message || sys.event || 'System Event Triggered',
                detail: sys.detail || (typeof sys.data === 'object' ? JSON.stringify(sys.data) : sys.data),
                alertType: sys.type || 'info',
                timestamp: Date.now(),
              },
              ...prev,
            ])
          },
          onWalletUpdate: (walletData) => {
            if (typeof walletData.remaining_coins === 'number') {
              onCoinBalanceUpdate?.(walletData.remaining_coins)
            }
          },
          onInsufficientCoins: (data) => {
            setIsStreaming(false)
            setInsufficientCoinsModal({
              isOpen: true,
              message: data.message,
              balance: data.balance,
              required: data.required,
            })
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
          isInspectorOpen={isInspectorOpen}
          onToggleInspector={toggleInspector}
          coinBalance={coinBalance}
          notificationCount={notificationCount}
          onCoinClick={onCoinClick}
          onNotificationClick={onNotificationClick}
          onProfileClick={onProfileClick}
          userInitial={userInitial}
          userName={userName}
          userEmail={userEmail}
          planName={planName}
          isLoggedIn={isLoggedIn}
          onLoginClick={onLoginClick}
          onSignupClick={onSignupClick}
          isProfileDropdownOpen={isProfileDropdownOpen}
          onCloseProfileDropdown={onCloseProfileDropdown}
          onEditProfileClick={onEditProfileClick}
          onSignOut={onSignOut}
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

        {/* Sticky Bottom Bar with Docked Typing Indicator (Twitter X Style) */}
        <ChatInputBar
          inputMessage={inputText}
          onInputChange={setInputText}
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          chatName={currentChat.name}
        />
      </div>

      {/* Insufficient Coins Alert Modal (Dark Luxury) */}
      {insufficientCoinsModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121214]/95 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-[420px] w-full text-center shadow-2xl relative">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
              🪙
            </div>
            <h3 className="text-xl font-bold text-[#F2F2F5] mb-2 tracking-tight">
              เหรียญไม่เพียงพอสำหรับการสนทนา
            </h3>
            <p className="text-[14px] text-[#ACACB2] leading-relaxed mb-3">
              {insufficientCoinsModal.message}
            </p>
            <div className="bg-white/[0.04] border border-white/5 rounded-2xl p-3 mb-6 flex items-center justify-between text-[13.5px]">
              <span className="text-[#ACACB2]">ยอดคงเหลือของคุณ</span>
              <span className="font-semibold text-amber-400">
                {insufficientCoinsModal.balance.toLocaleString()} / {insufficientCoinsModal.required} เหรียญ
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setInsufficientCoinsModal(null)
                  onCoinClick?.()
                }}
                className="w-full py-3 px-4 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white font-semibold text-[15px] transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                กรอกรหัสคูปองเพื่อรับเหรียญเพิ่ม 🪙
              </button>
              <button
                type="button"
                onClick={() => setInsufficientCoinsModal(null)}
                className="w-full py-2.5 px-4 rounded-full text-[14px] text-[#ACACB2] hover:text-[#F2F2F5] hover:bg-white/5 transition-all cursor-pointer"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Companion Quest & Dev Inspector Drawer */}
      <CompanionInspectorDrawer
        isOpen={isInspectorOpen}
        onClose={closeInspector}
        onSwitchToHud={onSwitchToHud}
        role={consoleRole}
        characterName={currentChat.name}
        turnLogs={turnLogs}
        questState={questState}
        liveGauges={liveGauges}
      />
    </div>
  )
}

export default ChatRoom
