export type CreatorMode = 'world' | 'character';

export interface CharacterPsychology {
  the_core?: string;
  the_mask?: string;
  the_conflict?: string;
}

export interface CharacterAppearance {
  wardrobe?: {
    outfit_1?: string[];
    outfit_2?: string[];
  };
  anatomy_features?: string[];
  signature_postures?: string[];
}

export interface PassivePerk {
  perk_name: string;
  trigger: string;
  effect: string;
}

export interface CharacterPreferences {
  likes?: string[];
  dislikes?: string[];
}

export interface DynamicEvolutionPhase {
  requirements?: {
    desire_min?: number;
    affection_min?: number;
  };
  phase_description?: string;
}

export interface MicroExpressions {
  when_desire_high?: string[];
  when_shy_but_deadpan?: string[];
  when_happy_but_hiding?: string[];
}

export interface VaultDraft {
  id: string;
  title: string;          // ชื่อตัวละคร (Character Name)
  worldTitle: string;     // ชื่อโลกที่คู่กัน (Paired World Name)
  mode?: CreatorMode;     // โหมดที่โฟกัส
  createdAt?: string;     // วันที่สร้าง
  updatedAt: string;      // เวลาที่อัปเดตล่าสุด
  description?: string;
  status: 'draft' | 'published';
  isPinned?: boolean;     // ปักหมุดไว้บนสุด
  authorName?: string;
  themeColor?: string;
  image?: string;         // รูปภาพหลักของตัวละคร (Main Character Portrait)
  images?: string[];      // ชุดรูปภาพเพิ่มเติม / เครื่องแต่งกาย / สีหน้า (Gallery / Outfits)
  stats?: Record<string, number>;
  hashtags?: string[];
  quote?: string;         // สเตตัสคำพูดตัวละคร (Character Quote / Status)
  views?: string;         // ยอดวิว / สถิติเข้าชม
  messages?: string;      // ยอดจำนวนข้อความแชท
  worldVisual?: string;
  worldSound?: string;
  worldConflict?: string;

  // Real-world character model extensions
  archetype?: string;
  psychology?: CharacterPsychology;
  appearance?: CharacterAppearance;
  core_stats?: Record<string, number>;
  max_desire?: number;
  preferences?: CharacterPreferences;
  passive_perks?: PassivePerk[];
  background_story?: string[];
  dynamic_evolution?: Record<string, DynamicEvolutionPhase>;
  micro_expressions?: MicroExpressions;

  // Real-world Event / Scenario Engine
  scenario?: WorldScenario;
  // Real-world World schema (Production Architecture)
  thai_name?: string;
  world_id?: string;
  prologue?: WorldPrologue;
  player_persona?: PlayerPersona;
  initial_states?: WorldInitialStates;
  starting_state?: WorldStartingState;
  real_locations?: WorldLocationsMap;
  time_periods?: WorldTimePeriodsMap;
  weather_system?: WorldWeatherSystem;
}

export type PlayerTriggerAction =
  | 'progress'
  | 'loop'
  | 'illusion_trigger'
  | 'chaos_escalation';

export interface PlayerTrigger {
  action_result: PlayerTriggerAction;
  next_beat?: string;
  next_scene?: string;
  feedback?: string;
}

export interface PacingControl {
  max_turns: number;
  action_result: PlayerTriggerAction;
  inevitable_consequence: string;
}

export interface WorldBeat {
  beat_id: string;
  director_setup?: string; // VO / Gear 1
  actor_state: string;     // 4 physical dimensions
  hidden_evaluation_criteria: Record<string, PlayerTrigger>;
  pacing_control: PacingControl;
}

export interface WorldScene {
  scene_id: string;
  scene_objective: string;
  forced_chaos_level: 'low' | 'medium' | 'high';
  event_mood: string;
  director_vision: string;
  director_setup: string;
  premise: string;
  beats: WorldBeat[];
}

export interface WorldScenario {
  id?: string;
  name?: string;
  scenes: WorldScene[];
}

// =========================================================================
// 🌍 WORLD ARCHITECTURE TYPES (1:1 PRODUCTION ENGINE SCHEMA)
// =========================================================================

export interface WorldPrologueChoice {
  text: string;
  hidden_trait: string;
}

export interface WorldPrologue {
  premise: string;
  question: string;
  choices: WorldPrologueChoice[];
}

export interface PlayerPersonaIdentity {
  brief: string;
  title: string;
}

export interface PlayerPersonaDynamicAndPower {
  label: string;
  actor_secret: string;
  power_balance: string;
}

export interface PlayerPersona {
  identity: PlayerPersonaIdentity;
  pronouns: string;
  nicknames: string;
  main_quest: string;
  personality_vibe: string;
  dynamic_and_power: PlayerPersonaDynamicAndPower;
}

export interface WorldInitialStates {
  desire: number;
  affection: number;
  shatter_count: number;
}

export interface WorldStartingState {
  time: string;
  weather: string;
  location: string;
  initial_a_pos: string;
  initial_p_pos: string;
  initial_outfit_key: string;
}

export interface WorldLocationSensoryCues {
  ambient_cues: string[];
}

export interface WorldLocationItem {
  base_mood: string;
  choke_points: string;
  key_furniture: string;
  spatial_layout: string;
  sensory_cues: WorldLocationSensoryCues;
}

export type WorldLocationsMap = Record<string, WorldLocationItem>;

export interface WorldTimePeriodItem {
  atmosphere: string;
}

export type WorldTimePeriodsMap = Record<string, WorldTimePeriodItem>;

export interface WeatherLogicalNode {
  next: string[];
}

export interface WorldWeatherSystem {
  logical_chain: Record<string, WeatherLogicalNode>;
}

export interface FullWorldData {
  world_id?: string;
  name?: string;
  thai_name?: string;
  description?: string;
  prologue?: WorldPrologue;
  player_persona?: PlayerPersona;
  initial_states?: WorldInitialStates;
  starting_state?: WorldStartingState;
  locations?: WorldLocationsMap;
  time_periods?: WorldTimePeriodsMap;
  weather_system?: WorldWeatherSystem;
  opening_scenarios?: WorldScenario[];
}

export interface MuseMessage {
  id: string;
  sender: 'muse' | 'user';
  text: string;
  timestamp: string;
  actionSuggestions?: string[];
  isTyping?: boolean;
}

export interface WorldCreatorState {
  mode: CreatorMode;
  activeDraftId: string | null;
  rightPanelWidth: number;
  isRightPanelCollapsed: boolean;
}
