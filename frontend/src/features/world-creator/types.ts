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
