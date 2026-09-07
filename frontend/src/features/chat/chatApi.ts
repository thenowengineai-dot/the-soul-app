import { API_BASE_URL } from '../../config'
import type { UnifiedInteractionRound } from './types'

export interface UserIdentity {
  user_id: string
  name: string
  email?: string
  avatar_url?: string
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

export interface StreamChatCallbacks {
  onVoiceOver?: (text: string) => void
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
    history?: Array<{ role: string; content: string }>
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
          // 2. Chat Message Array (Actor sequences)
          else if (parsed.type === 'chat_message_array' && Array.isArray(parsed.sequence)) {
            callbacks.onActorSegments?.(parsed.sequence)
          }
          // 3. Physics & Kinematics Update
          else if (parsed.system_event === 'physics_update') {
            callbacks.onPhysicsUpdate?.(parsed)
          }
          // 4. Complete Unified Interaction Round
          else if (parsed.type === 'unified_round' && parsed.data) {
            callbacks.onUnifiedRound?.(parsed.data)
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
