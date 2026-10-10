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
  model_name?: string
  current_actor_posture?: string
}

export type CanonicalOutcome = 'MISSED' | 'PARRIED' | 'GRAZED' | 'LATCHED'

export interface TelemetryVerdict {
  contact_occurred: boolean
  outcome: CanonicalOutcome | string
  active_contacts?: string[]
}

export interface SandboxTelemetry {
  latency_ms: number
  model: string
  thinking?: string
  a_pos?: string
  p_pos?: string
  verdict?: TelemetryVerdict | null
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

export interface MatrixTestCase {
  id: string
  name: string
  spacing: 'distant' | 'reach' | 'intimate'
  boundary_level: number
  player_input: string
  expected_outcome: string
  expected_contact?: boolean
}

export interface MatrixCaseResult {
  case_id: string
  name: string
  expected_outcome: string
  actual_outcome: string
  contact_occurred: boolean
  passed: boolean
  latency_ms: number
  action_snippet: string
  dialogue_snippet: string
}

export interface SandboxMatrixRequest {
  base_prompt?: string
  thinking_budget?: number
  custom_cases?: MatrixTestCase[]
}

export interface SandboxMatrixResponse {
  total_cases: number
  passed_cases: number
  pass_rate_pct: number
  all_passed: boolean
  results: MatrixCaseResult[]
}
