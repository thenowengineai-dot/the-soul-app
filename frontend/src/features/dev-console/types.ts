export type UserConsoleRole = 'admin' | 'creator' | 'player'

export type AgentType = 'actor' | 'director' | 'evaluator'

export interface AgentDebugData {
  prompt?: string
  response?: any
  thinking?: string
}

export interface TurnLogEntry {
  id: string | number
  type: 'turn' | 'system_alert'
  turnNumber?: number
  userMsg?: string
  alertType?: 'info' | 'success' | 'warning' | 'error'
  message?: string
  detail?: string
  actor?: AgentDebugData
  director?: AgentDebugData
  evaluator?: AgentDebugData
  timestamp: number
}

export interface QuestBeatState {
  eventId?: string | null
  eventName?: string | null
  phaseId?: string | null
  beatId?: string | null
  beatTurnCount: number
  sandboxTurnCount: number
  pacingStatus: 'advancing' | 'holding' | 'completed' | 'idle'
  conditionHint?: string | null
}

export interface LiveStateGauges {
  affection: number
  desire: number
  tension: number
  stance: string
  chaosLevel: string
  actorPosture?: string
  playerPosture?: string
  currentOutfit?: string
  dominanceState?: string
  actionLock?: boolean
  contactPoints?: string[]
}

export interface CompanionInspectorProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToHud?: () => void
  role?: UserConsoleRole
  isCreator?: boolean
  characterName?: string
  turnLogs: TurnLogEntry[]
  questState?: QuestBeatState
  liveGauges?: LiveStateGauges
}
