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
  attach_telemetry_schema?: boolean
  telemetry_schema_prompt?: string
}

export type CanonicalOutcome = 'MISSED' | 'PARRIED' | 'GRAZED' | 'LATCHED'

export interface TelemetryVerdict {
  contact_occurred: boolean
  outcome: CanonicalOutcome | string
  active_contacts?: string[]
}

export type KineticTempoMode =
  | 'STILLNESS'
  | 'MICRO_SHIFT'
  | 'HIGH_VELOCITY_SNAP'
  | 'LOW_VELOCITY_UNHOOK'

export interface KineticDecision {
  tempo: KineticTempoMode | string
  somatic_tension?: string
}

export type AttireZoneId = 'head_hair_face' | 'upper_body' | 'lower_body' | 'feet_footwear'

export type AttireLifecycleStage = 'DORMANT' | 'FRESH' | 'LINGERING'

export interface SurfaceMutationItem {
  target: 'actor' | 'player' | string
  zone: AttireZoneId | string
  condition: string
}

export interface SandboxTelemetry {
  latency_ms: number
  model: string
  thinking?: string
  a_pos?: string
  p_pos?: string
  kinetic_decision?: KineticDecision | null
  verdict?: TelemetryVerdict | null
  surface_mutations?: SurfaceMutationItem[] | null
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

export interface StagePreset {
  id: string
  title: string
  desc: string
  prompt: string
  genre: string
}

export interface WorldStageConfig {
  prompt: string
  genreHint?: string
  lastGeneratedText?: string
  latencyMs?: number
  modelUsed?: string
}

export interface MacroWorldPreset {
  id: string
  title: string
  subtitle: string
  lore: string
}

export interface IncitingSparkPreset {
  id: string
  title: string
  subtitle: string
  spark: string
}

export interface LoreCard {
  id: string
  title: string
  category: 'faction' | 'location' | 'rule' | 'lore' | string
  summary?: string
  content: string
  tags: string[]
  created_at?: number
  isPinnedToStage?: boolean
  isSavedToCabinet?: boolean
  sourceNoteId?: string
}

export interface ExpansionNote {
  id: string
  title: string
  content: string
  category?: string
  summary?: string
  isPlayerEdited?: boolean
  isSavedToCabinet?: boolean
  tags: string[]
  childCards: LoreCard[]
  created_at: number
}

export interface StageCellItem {
  id: string
  title: string
  description: string
  pinnedCardIds: string[]
  created_at: number
  attirePresetId?: string
  attireCustomState?: any
}


export interface WorldLoreBlock {
  id: string
  title?: string
  content: string
  created_at: number
}

export interface WorldWorkspace {
  id: string
  title: string
  rawLore: string
  extraLoreBlocks?: WorldLoreBlock[]
  sparkText: string
  notes: ExpansionNote[]
  stageCells: StageCellItem[]
  cabinetCards: LoreCard[]
  pinnedCardIds: string[]
  created_at: number
}

export interface GenerateStageCellPayload {
  prompt: string
  genre_hint?: string
  world_context?: string
  pinned_cards?: Array<{
    id?: string
    title: string
    content: string
    tags?: string[]
  }>
  existing_spark?: string
}

export interface StageCellGenerateResponse {
  raw_text: string
  latency_ms: number
  model: string
}

export interface WorldDissectResponse {
  cards: LoreCard[]
  latency_ms: number
  model: string
}


