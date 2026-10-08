export interface SandboxPreset {
  id: string
  title: string
  subtitle: string
  badge: string
  badgeColor?: string
  character_id: string
  player_input: string
  distance: 'distant' | 'reach' | 'intimate'
  inhibition_shield: 'active' | 'cracked' | 'shattered'
  desire_level: number
  climate: string
  held_prop: string
  actor_posture: string
  player_posture: string
}

export interface SandboxSimulateRequest {
  character_id: string
  player_input: string
  distance: string
  inhibition_shield: string
  desire_level: number
  climate: string
  held_prop: string
  actor_posture: string
  player_posture: string
  thinking_budget?: number
}

export interface SandboxTelemetry {
  latency_ms: number
  model: string
  thinking?: string
  a_pos?: string
  p_pos?: string
  dominance_state?: string
  action_lock?: boolean
  contact_points?: string[]
}

export interface SandboxResponseSegment {
  type: string
  content: string
}

export interface SandboxSimulateResponse {
  status: string
  character_id: string
  character_name: string
  player_input: string
  response_sequence: SandboxResponseSegment[]
  telemetry: SandboxTelemetry
}
