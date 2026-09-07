import { API_BASE_URL } from '../../config'
import type { Character, CharacterStat } from './types'
import { DEFAULT_CHARACTER_STATS, DEFAULT_CHARACTER_EVENTS } from './mockData'

/**
 * โครงสร้างข้อมูลดิบที่ส่งกลับมาจาก Backend /api/published_campaigns
 */
export interface SupabaseCampaignRaw {
  id: string
  name: string
  status?: string
  photos?: string[]
  hashtags?: string[]
  age?: string
  distance?: string
  default_world?: string
  background_story?: string[] | string
  core_stats?: Record<string, number>
  stats?: Record<string, number>
  initial_environment?: {
    time: string
    location: string
    weather: string
  }
  initial_outfit?: string
  initial_pose?: string
  memories?: unknown[]
  comments?: unknown[]
}

export interface PublishedCampaignsResponse {
  status: string
  data?: SupabaseCampaignRaw[]
  cached?: boolean
  stale?: boolean
}

const STAT_METADATA: Record<string, { label: string; subLabel: string }> = {
  initiative: { label: 'Initiative', subLabel: 'ความรุกเข้าหา' },
  playfulness: { label: 'Playfulness', subLabel: 'ความขี้แกล้ง' },
  dominance: { label: 'Dominance', subLabel: 'ความเป็นผู้นำ/ข่ม' },
  physicality: { label: 'Physicality', subLabel: 'ความโหยหาสัมผัส' },
  honesty: { label: 'Honesty', subLabel: 'ความปากตรงกับใจ' },
  sensibility: { label: 'Sensibility', subLabel: 'ความไวต่อสัมผัส' },
  expressiveness: { label: 'Expressiveness', subLabel: 'การแสดงสีหน้า' },
  emotional_stability: { label: 'Emotional Stability', subLabel: 'ความมั่นคงอารมณ์' },
  logic: { label: 'Logic', subLabel: 'เหตุผลและการวิเคราะห์' },
  empathy: { label: 'Empathy', subLabel: 'ความเห็นอกเห็นใจ' },
  intuition: { label: 'Intuition', subLabel: 'สัญชาตญาณ' },
  charm: { label: 'Charisma', subLabel: 'เสน่ห์และแรงดึงดูด' },
};

/**
 * แปลงข้อมูลจาก Supabase Campaign ให้อยู่ในรูป Interface Character
 * โดยคงทุกองค์ประกอบตามมาตรฐาน UI Design 100% (ป้ายใหม่, สถิติ, Creator)
 */
export function transformSupabaseCharacter(
  item: SupabaseCampaignRaw, 
  index: number
): Character {
  const photos = Array.isArray(item.photos) && item.photos.length > 0 
    ? item.photos.filter(Boolean)
    : [];

  const mainImage = photos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800';

  // แปลง Hashtags ให้มีเครื่องหมาย # เสมอ
  const rawTags = Array.isArray(item.hashtags) ? item.hashtags : [];
  const hashtags = rawTags.length > 0 
    ? rawTags.map(tag => tag.startsWith('#') ? tag : `#${tag}`)
    : ['#ตัวละครใหม่', '#พรีเมียม', '#AIสตอรี่'];

  // สถิติยอดเข้าชมและข้อความเพื่อคงความสวยงามของแถบสถิติใน CharacterCard
  const mockViews = ['18.9k', '16.4k', '14.2k', '12.8k'];
  const mockMessages = ['4.8k', '4.1k', '3.5k', '2.9k'];

  // แยกชื่อสำหรับแสดง Creator Studio
  const cleanName = item.name.replace(/\s*\(.*?\)/, '').trim();

  // แปลง Background Story
  let storyIntroduction = '';
  if (Array.isArray(item.background_story)) {
    storyIntroduction = item.background_story.filter(Boolean).join('\n\n');
  } else if (typeof item.background_story === 'string') {
    storyIntroduction = item.background_story;
  }

  // แปลง Core Stats หากมีข้อมูล
  const rawStats = item.core_stats || item.stats;
  let stats: CharacterStat[] = DEFAULT_CHARACTER_STATS;
  if (rawStats && typeof rawStats === 'object' && Object.keys(rawStats).length > 0) {
    const parsedStats: CharacterStat[] = [];
    for (const [key, value] of Object.entries(rawStats)) {
      if (typeof value === 'number') {
        const meta = STAT_METADATA[key.toLowerCase()] || {
          label: key.charAt(0).toUpperCase() + key.slice(1),
          subLabel: key,
        };
        parsedStats.push({
          key,
          label: meta.label,
          subLabel: meta.subLabel,
          value,
        });
      }
    }
    if (parsedStats.length > 0) {
      stats = parsedStats;
    }
  }

  // อัปเดตรูปของอีเวนต์แรกให้เป็นรูปตัวละครจริง
  const events = DEFAULT_CHARACTER_EVENTS.map((ev, idx) => 
    idx === 0 ? { ...ev, isUnlocked: true, image: mainImage } : ev
  );

  return {
    id: item.id,
    name: item.name,
    quote: item.status || 'พร้อมจะเริ่มต้นบทสนทนาที่มีความหมายกับคุณแล้ววันนี้',
    views: mockViews[index % mockViews.length],
    messages: mockMessages[index % mockMessages.length],
    image: mainImage,
    images: photos.length > 0 ? photos : [mainImage],
    badge: 'ใหม่',
    creator: {
      name: `Studio ${cleanName}`,
      subscribers: '128K ผู้ติดตาม',
      totalInteractions: '2.1M การตอบโต้',
      isFollowed: false,
    },
    hashtags,
    updatedTime: 'เมื่อสักครู่นี้',
    storyIntroduction: storyIntroduction || undefined,
    stats,
    events,
    initialEnvironment: item.initial_environment,
    initialOutfit: item.initial_outfit,
    initialPose: item.initial_pose,
    defaultWorld: item.default_world || item.id,
  };
}

/**
 * ดึงรายการตัวละครที่เผยแพร่แล้ว (Published Campaigns) จาก Backend API
 * มี Timeout และ Fallback เพื่อความปลอดภัยสูงสุด 100%
 */
export async function fetchPublishedCharacters(): Promise<Character[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/api/published_campaigns`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[Characters API] Server returned ${response.status}: ${response.statusText}`);
      return [];
    }

    const payload: PublishedCampaignsResponse = await response.json();
    if (payload.status === 'success' && Array.isArray(payload.data)) {
      return payload.data.map((item, idx) => transformSupabaseCharacter(item, idx));
    }

    return [];
  } catch (error) {
    console.warn('[Characters API] Unable to fetch published characters from backend:', error);
    return [];
  }
}
