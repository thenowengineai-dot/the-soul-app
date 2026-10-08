export interface PromptModule {
  id: string
  name: string
  description?: string
  prompt_snippet: string
  enabled: boolean
}

export interface SandboxSimulateRequest {
  player_input: string
  base_prompt?: string
  active_modules?: Array<{
    id: string
    name: string
    prompt_snippet: string
  }>
  thinking_budget?: number
}

export interface SandboxTelemetry {
  latency_ms: number
  model: string
  thinking?: string
  a_pos?: string
  p_pos?: string
}

export interface SandboxResponseSegment {
  type: string
  content: string
}

export interface SandboxSimulateResponse {
  status: string
  full_prompt_used: string
  player_input: string
  response_sequence: SandboxResponseSegment[]
  telemetry: SandboxTelemetry
}
