import { API_BASE_URL } from '../../config'
import type { UnifiedInteractionRound } from './types'

export interface UserIdentity {
  user_id: string
  name: string
  username?: string
  email?: string
  avatar_url?: string
  pronouns?: string
  about_me?: string
  is_guest: boolean
  migrated_sessions?: number
}

export interface StartSessionResponse {
  status: string
  session_id: string
  user_id: string
  character_id: string
  world_id: string
  initial_state: {
    affection: number
    desire: number
    a_pos: string
    p_pos: string
    scene_id: string
    beat_id: string
    stance: string
    current_outfit?: string
    environment?: {
      time: string
      location: string
      weather: string
    }
  }
  message: string
}

export interface LoadedSessionData {
  has_started: boolean
  session_id?: string
  messages?: Array<{
    id: string | number
    role: 'user' | 'ai' | 'vo' | 'intro_brief'
    content?: string
    action?: string | null
    dialogue?: string | null
  }>
  chatHistory?: Array<{
    role: string
    content: string
  }>
  characterStats?: {
    affection: number
    affUnlock: number
    desire: number
    desUnlock: number
    phase: number
  }
  playerPosture?: string
  actorPosture?: string
  dominanceState?: string
  currentStance?: string
  tensionGauge?: number
  actionLock?: boolean
  activeEventId?: string | null
  activeEventPhase?: string | null
  activeBeatId?: string | null
  sandboxTurnCount?: number
  beatTurnCount?: number
  worldState?: {
    time: string
    location: string
    weather: string
  }
}

const GUEST_ID_KEY = 'the_soul_guest_id'
const USER_KEY = 'the_soul_user'

/**
 * ดึงหรือสร้าง Guest ID (gst_<uuid>)
 */
export function getGuestId(): string {
  let gid = localStorage.getItem(GUEST_ID_KEY)
  if (!gid || !gid.startsWith('gst_')) {
    gid = `gst_${crypto.randomUUID()}`
    localStorage.setItem(GUEST_ID_KEY, gid)
  }
  return gid
}

/**
 * ดึงข้อมูลผู้ใช้ปัจจุบัน (ถ้าล็อกอิน Google จะได้ member, ถ้าไม่ จะได้ Guest)
 */
export function getCurrentUser(): UserIdentity {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (raw) {
      const user = JSON.parse(raw) as UserIdentity
      if (user && user.user_id) return user
    }
  } catch (e) {
    console.warn('Failed to parse user from localStorage:', e)
  }

  return {
    user_id: getGuestId(),
    name: 'นักเดินทางนิรนาม',
    is_guest: true,
  }
}

/**
 * ยืนยัน Guest Account กับ Backend (Neon PostgreSQL)
 */
export async function ensureGuestAccount(): Promise<UserIdentity> {
  const guestId = getGuestId()
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guest_id: guestId, name: 'นักเดินทางนิรนาม' }),
    })
    if (res.ok) {
      const data = await res.json()
      return {
        user_id: data.user_id || guestId,
        name: data.name || 'นักเดินทางนิรนาม',
        is_guest: true,
      }
    }
  } catch (err) {
    console.warn('[AUTH] Error ensuring guest account:', err)
  }
  return { user_id: guestId, name: 'นักเดินทางนิรนาม', is_guest: true }
}

/**
 * ล็อกอินด้วย Google Credential และโอนย้าย Session จาก Guest โดยอัตโนมัติ
 */
export async function loginWithGoogle(credential: string): Promise<UserIdentity> {
  const guestId = getGuestId()
  const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential, guest_id: guestId }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Google Auth failed: ${errorText}`)
  }

  const data = await res.json()
  const user: UserIdentity = {
    user_id: data.user_id,
    name: data.name,
    email: data.email,
    avatar_url: data.avatar_url,
    is_guest: false,
    migrated_sessions: data.migrated_sessions || 0,
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
}

/**
 * บันทึกการอัปเดตข้อมูลผู้ใช้ลง LocalStorage
 */
export function saveUserIdentity(user: UserIdentity): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * ออกจากระบบ (สลับกลับเป็น Guest Mode)
 */
export function signOutUser(): UserIdentity {
  localStorage.removeItem(USER_KEY)
  return getCurrentUser()
}

/**
 * เริ่มเซฟเกมใหม่ (New Game) บน Neon PostgreSQL + Upstash Redis
 */
export async function startNewSession(
  characterId: string,
  worldId?: string
): Promise<StartSessionResponse> {
  const user = getCurrentUser()
  const res = await fetch(`${API_BASE_URL}/api/start_session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: user.user_id,
      character_id: characterId,
      world_id: worldId || characterId,
      trigger_initial_vo: false,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Failed to start session: ${errText}`)
  }

  return await res.json()
}

/**
 * โหลดเซฟเกมเก่า (อ่านจาก Redis Hot Cache หรือ Neon PostgreSQL JSONB)
 */
export async function loadSession(
  characterId: string,
  sessionId?: string
): Promise<LoadedSessionData> {
  const user = getCurrentUser()
  const res = await fetch(`${API_BASE_URL}/api/load_session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: user.user_id,
      character_id: characterId,
      session_id: sessionId || null,
    }),
  })

  if (!res.ok) {
    console.warn(`[CHAT API] Failed to load session (${res.status})`)
    return { has_started: false }
  }

  return await res.json()
}

export interface WalletBalanceResponse {
  status: string
  user_id: string
  balance: number
  total_earned: number
  total_spent: number
}

export interface RedeemCouponResponse {
  status: 'success' | 'error'
  message: string
  coins_added?: number
  new_balance?: number
}

/**
 * ดึงยอดเหรียญคงเหลือของผู้ใช้จาก Backend (Neon Postgres + Redis)
 */
export async function fetchWalletBalance(userId: string): Promise<WalletBalanceResponse> {
  const res = await fetch(`${API_BASE_URL}/api/wallet/balance/${userId}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch wallet balance: ${res.statusText}`)
  }
  return await res.json()
}

/**
 * แลกรับรหัสคูปองกับ Backend (Neon Postgres)
 */
export async function redeemCouponApi(
  userId: string,
  code: string
): Promise<RedeemCouponResponse> {
  const res = await fetch(`${API_BASE_URL}/api/wallet/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, code }),
  })
  if (!res.ok) {
    const errText = await res.text()
    return {
      status: 'error',
      message: `ไม่สามารถแลกรับได้ (${res.status}): ${errText}`,
    }
  }
  return await res.json()
}

export interface StreamChatCallbacks {
  onVoiceOver?: (text: string) => void
  onActorSegment?: (segment: { type: 'action' | 'dialogue'; content: string }, index: number) => void
  onActorSegments?: (segments: Array<{ type: 'action' | 'dialogue'; content: string }>) => void
  onPhysicsUpdate?: (data: {
    stance?: string
    tension?: number
    player_posture?: string
    actor_posture?: string
    dominance_state?: string
    action_lock?: boolean
    current_outfit?: string
  }) => void
  onUnifiedRound?: (round: UnifiedInteractionRound) => void
  onWalletUpdate?: (data: { coins_deducted: number; remaining_coins?: number }) => void
  onInsufficientCoins?: (data: { balance: number; required: number; message: string }) => void
  onDebugPrompt?: (data: { agent: 'evaluator' | 'director' | 'actor'; prompt: string }) => void
  onDebugResponse?: (data: { agent: 'evaluator' | 'director' | 'actor'; response: any; thinking?: string }) => void
  onBeatStatus?: (data: {
    event_id?: string | null
    event_name?: string | null
    quest_title?: string | null
    current_quest?: string | null
    phase_id?: string | null
    current_scene?: string | null
    beat_id?: string | null
    current_beat_id?: string | null
    beat_turn_count?: number
    turns_in_beat?: number
    sandbox_turn_count?: number
    pacing_status?: 'advancing' | 'holding' | 'completed' | 'idle' | string
    chaos_level?: string
    stance?: string
    tension?: number
    condition_hint?: string | null
    trigger_condition?: string | null
    gauges?: any
    [key: string]: any
  }) => void
  onSystemEvent?: (data: {
    system_event?: string
    event?: string
    event_id?: string | null
    phase_id?: string | null
    new_phase?: string | null
    new_beat?: string | null
    beat_turn_count?: number
    affection_delta?: number
    desire_delta?: number
    message?: string
    detail?: string
    type?: 'info' | 'success' | 'warning' | 'error'
    data?: any
    [key: string]: any
  }) => void
  onError?: (err: Error) => void
  onDone?: () => void
}

/**
 * ยิงข้อความแชทและรับสตรีมผลลัพธ์ (SSE Stream) จาก Backend
 */
export async function streamChatMessage(
  params: {
    sessionId: string
    characterId: string
    worldId?: string
    message: string
    history?: Array<{ role: string; content: string; action?: string; voice_over?: string }>
  },
  callbacks: StreamChatCallbacks
): Promise<void> {
  const user = getCurrentUser()

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        session_id: params.sessionId,
        user_id: user.user_id,
        character_id: params.characterId,
        world_id: params.worldId || params.characterId,
        message: params.message,
        history: params.history || [],
      }),
    })

    if (!response.ok) {
      if (response.status === 402) {
        try {
          const errJson = await response.json()
          const detail = errJson.detail || {}
          callbacks.onInsufficientCoins?.({
            balance: detail.balance ?? 0,
            required: detail.required ?? 10,
            message: detail.message || 'เหรียญไม่เพียงพอสำหรับการสนทนา',
          })
          return
        } catch {
          callbacks.onInsufficientCoins?.({
            balance: 0,
            required: 10,
            message: 'เหรียญไม่เพียงพอสำหรับการสนทนา',
          })
          return
        }
      }
      const errText = await response.text()
      throw new Error(`Chat API Error (${response.status}): ${errText}`)
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported by browser/response')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data:')) continue

        const dataContent = trimmed.slice(5).trim()
        if (dataContent === '[DONE]') {
          callbacks.onDone?.()
          return
        }

        try {
          const parsed = JSON.parse(dataContent)

          // 1. Voice Over (VO)
          if (parsed.type === 'voice_over' && parsed.content) {
            callbacks.onVoiceOver?.(parsed.content)
          }
          // 2. Incremental Actor Segment (Individual Bubble)
          else if (parsed.type === 'actor_segment' && parsed.segment) {
            callbacks.onActorSegment?.(parsed.segment, typeof parsed.index === 'number' ? parsed.index : 0)
          }
          // 3. Chat Message Array (Actor sequences fallback / sync)
          else if (parsed.type === 'chat_message_array' && Array.isArray(parsed.sequence)) {
            callbacks.onActorSegments?.(parsed.sequence)
          }
          // 4. Physics & Kinematics Update
          else if (parsed.system_event === 'physics_update') {
            callbacks.onPhysicsUpdate?.(parsed)
          }
          // 5. Complete Unified Interaction Round
          else if (parsed.type === 'unified_round' && parsed.data) {
            callbacks.onUnifiedRound?.(parsed.data)
          }
          // 6. Wallet Balance Update
          else if (parsed.type === 'wallet_update') {
            callbacks.onWalletUpdate?.(parsed)
          }
          // 7. Dev Console & Inspector: Debug Prompt
          else if (parsed.type === 'debug_prompt' && parsed.agent && parsed.prompt) {
            callbacks.onDebugPrompt?.({ agent: parsed.agent, prompt: parsed.prompt })
          }
          // 8. Dev Console & Inspector: Debug Response (Thinking & Decisions)
          else if (parsed.type === 'debug_response' && parsed.agent && parsed.response) {
            const rawThinking = parsed.thinking || parsed.response?.thinking || parsed.response?.reasoning || parsed.response?.director_analysis
            callbacks.onDebugResponse?.({ agent: parsed.agent, response: parsed.response, thinking: rawThinking })
          }
          // 9. Dev Console & Inspector: Beat & Scene Status
          else if (parsed.type === 'beat_status') {
            callbacks.onBeatStatus?.(parsed)
          }
          // 10. System Event Alerts (Quest, Scene, Beat changes)
          else if (parsed.system_event && parsed.system_event !== 'physics_update') {
            callbacks.onSystemEvent?.(parsed)
          }
        } catch {
          // Skip non-JSON or heartbeat data lines
        }
      }
    }

    callbacks.onDone?.()
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    callbacks.onError?.(error)
  }
}
