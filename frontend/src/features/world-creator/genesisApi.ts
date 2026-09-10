import { GENESIS_API_BASE_URL, API_BASE_URL } from '../../config';
import type { CreatorMode, MuseMessage, VaultDraft } from './types';

export interface MuseChatResponse {
  text: string;
  actionSuggestions: string[];
  rawIdeas?: Array<{ type: string; text: string }>;
  thinking?: string;
  part1?: string;
  part2?: string;
}

/**
 * แปลงประวัติ MuseMessage ให้อยู่ในฟอร์แมตที่ Vertex AI / The Muse Backend รองรับ
 */
function formatHistoryForBackend(messages: MuseMessage[]) {
  return messages.map((m) => ({
    role: m.sender === 'user' ? 'user' : 'model',
    content: m.text,
  }));
}

/**
 * 🏛️ ส่งข้อความคุยกับ The Muse (AI Co-Architect)
 */
export async function sendMuseMessage(params: {
  message: string;
  history: MuseMessage[];
  mode: CreatorMode;
  draftId?: string | null;
  userId?: string;
  scratchpadState?: Record<string, unknown> | null;
}): Promise<MuseChatResponse> {
  const payload = {
    message: params.message,
    history: formatHistoryForBackend(params.history),
    mode: params.mode,
    draft_id: params.draftId || undefined,
    user_id: params.userId || undefined,
    scratchpad_state: params.scratchpadState || undefined,
  };

  const response = await fetch(`${GENESIS_API_BASE_URL}/api/genesis/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`The Muse API Error (${response.status}): ${errText}`);
  }

  const result = await response.json();
  const rawResponse = result.response;

  // ทำความสะอาด Markdown Code Blocks ก่อนพยายาม Parse JSON
  let cleanStr = typeof rawResponse === 'string' ? rawResponse.trim() : '';
  if (cleanStr.startsWith('```json')) cleanStr = cleanStr.slice(7);
  if (cleanStr.startsWith('```')) cleanStr = cleanStr.slice(3);
  if (cleanStr.endsWith('```')) cleanStr = cleanStr.slice(0, -3);
  cleanStr = cleanStr.trim();

  // พยายาม Parse ผลลัพธ์ที่เป็น JSON จาก The Muse Engine
  try {
    const parsed =
      typeof cleanStr === 'string' && (cleanStr.startsWith('{') || cleanStr.startsWith('['))
        ? JSON.parse(cleanStr)
        : rawResponse;

    const part1 = parsed.reply_text_part1 || '';
    const part2 = parsed.reply_text_part2 || '';
    const fullText = [part1, part2].filter(Boolean).join('\n\n') || parsed.text || cleanStr;

    const suggestions: string[] = [];
    if (Array.isArray(parsed.extracted_ideas)) {
      parsed.extracted_ideas.forEach((item: { text?: string; type?: string }) => {
        if (item.text) {
          const prefix = item.type === 'vo' ? '🎬 ' : item.type === 'actor_state' ? '🎭 ' : item.type === 'illusion' ? '✨ ' : '⚡ ';
          suggestions.push(`${prefix}${item.text}`);
        }
      });
    }

    return {
      text: fullText,
      actionSuggestions: suggestions.length > 0 ? suggestions : (parsed.actionSuggestions || []),
      rawIdeas: parsed.extracted_ideas || [],
      thinking: parsed.thinking || '',
      part1,
      part2,
    };
  } catch {
    // ถ้าผลลัพธ์เป็นข้อความธรรมดา
    return {
      text: String(rawResponse || 'The Muse ได้รับข้อความแล้ว'),
      actionSuggestions: [],
    };
  }
}

/**
 * 🗄️ ดึงรายการ Drafts ทั้งหมดของผู้ใช้จาก The Vault (Neon PostgreSQL)
 */
export async function fetchUserDrafts(userId: string): Promise<VaultDraft[]> {
  const response = await fetch(`${GENESIS_API_BASE_URL}/api/genesis/drafts/${encodeURIComponent(userId)}`);
  if (!response.ok) {
    throw new Error(`Failed to load drafts (${response.status})`);
  }
  const result = await response.json();
  const rawDrafts = result.data || [];
  return rawDrafts.map((d: any) => {
    const images: string[] = Array.isArray(d.images) && d.images.length > 0
      ? d.images
      : d.image
      ? [d.image]
      : d.avatar_url
      ? [d.avatar_url]
      : [];
    const mainImg = d.image || d.avatar_url || images[0] || '';
    return {
      ...d,
      images,
      image: mainImg,
      avatar_url: mainImg,
    };
  });
}

/**
 * 📂 โหลดข้อมูล Draft ฉบับเต็มจาก Neon
 */
export async function fetchDraftDetail(userId: string, worldId: string) {
  try {
    const response = await fetch(`${GENESIS_API_BASE_URL}/api/genesis/drafts/${encodeURIComponent(userId)}/${encodeURIComponent(worldId)}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      console.warn(`Draft detail returned status ${response.status}`);
      return null;
    }
    const result = await response.json();
    const data = result.data;
    if (!data) return null;

    const worldData = (typeof data.world_data === 'object' && data.world_data) ? data.world_data : {};
    const charData = (typeof data.character_data === 'object' && data.character_data) ? data.character_data : {};

    const rawImages = (
      (Array.isArray(data.images) && data.images.length > 0 ? data.images : null) ||
      (Array.isArray(worldData.images) && worldData.images.length > 0 ? worldData.images : null) ||
      (Array.isArray(charData.images) && charData.images.length > 0 ? charData.images : null) ||
      (data.image ? [data.image] : null) ||
      (data.avatar_url ? [data.avatar_url] : null) ||
      (charData.avatar_url ? [charData.avatar_url] : [])
    );

    const images: string[] = Array.isArray(rawImages) ? rawImages.filter(Boolean) : [];
    const cover = data.image || worldData.image || charData.avatar_url || images[0] || '';

    return {
      ...data,
      ...worldData,
      images,
      image: cover,
      avatar_url: cover,
      world_data: worldData,
      character_data: charData,
    };
  } catch (err) {
    console.warn('Could not fetch draft detail:', err);
    return null;
  }
}

/**
 * 💾 บันทึก Draft ลง Neon PostgreSQL
 */
export async function saveDraftToVault(params: {
  userId: string;
  data: Record<string, unknown>;
  mode: CreatorMode;
}): Promise<string> {
  const response = await fetch(`${GENESIS_API_BASE_URL}/api/genesis/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: params.userId,
      data: params.data,
      mode: params.mode,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to save draft (${response.status})`);
  }
  const result = await response.json();
  return result.world_id;
}

/**
 * 🗑️ ลบ Draft ออกจาก The Vault
 */
export async function deleteDraftFromVault(userId: string, worldId: string): Promise<boolean> {
  const response = await fetch(`${GENESIS_API_BASE_URL}/api/genesis/drafts/${encodeURIComponent(userId)}/${encodeURIComponent(worldId)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete draft (${response.status})`);
  }
  const result = await response.json();
  return !!result.deleted;
}

/**
 * ⚡ Publish โลกและตัวละครขึ้น Upstash Redis Hot Cache
 */
export async function publishWorldCampaign(worldId: string, userId: string): Promise<boolean> {
  const response = await fetch(`${GENESIS_API_BASE_URL}/api/genesis/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      world_id: worldId,
      user_id: userId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to publish campaign (${response.status})`);
  }
  const result = await response.json();

  // ล้างแคชใน the-soul-backend เพื่อให้ Hub Catalog ที่หน้า Home อัปเดตทันที
  try {
    await fetch(`${API_BASE_URL}/api/clear_cache`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ world_id: worldId }),
    });
  } catch (err) {
    console.warn('Cache clear trigger on backend failed:', err);
  }

  return result.status === 'success';
}

/**
 * 🔙 ยกเลิกการเผยแพร่แคมเปญกลับเป็นร่างแบบ (Unpublish)
 */
export async function unpublishWorldCampaign(worldId: string, userId: string): Promise<boolean> {
  const response = await fetch(`${GENESIS_API_BASE_URL}/api/genesis/unpublish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      world_id: worldId,
      user_id: userId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to unpublish campaign (${response.status})`);
  }
  const result = await response.json();

  try {
    await fetch(`${API_BASE_URL}/api/clear_cache`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ world_id: worldId }),
    });
  } catch (err) {
    console.warn('Cache clear trigger on backend failed:', err);
  }

  return result.status === 'success';
}

/**
 * 🏭 สร้างหรือซิงค์พิมพ์เขียวฉบับสมบูรณ์ (Character or World Blueprint) ผ่าน Vertex AI บน Cloud Run
 */
export async function compileBlueprint(params: {
  history: MuseMessage[];
  mode: CreatorMode;
  characterData?: Record<string, unknown>;
  masterBrief?: string;
}): Promise<Record<string, unknown>> {
  const payload = {
    history: formatHistoryForBackend(params.history),
    mode: params.mode,
    character_data: params.characterData || undefined,
    master_brief: params.masterBrief || undefined,
  };

  const response = await fetch(`${GENESIS_API_BASE_URL}/api/genesis/build`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Compile Blueprint Error (${response.status}): ${errText}`);
  }

  const result = await response.json();
  return result.data || {};
}

/**
 * 📜 โหลดประวัติแชท The Muse ของ Draft นั้นๆ
 */
export async function fetchMuseHistory(draftId: string): Promise<MuseMessage[]> {
  try {
    const response = await fetch(`${GENESIS_API_BASE_URL}/api/genesis/muse/${encodeURIComponent(draftId)}`);
    if (!response.ok) return [];
    const result = await response.json();
    const rawMessages = result.data?.messages;
    if (!Array.isArray(rawMessages)) return [];

    return rawMessages.map((m: any, idx: number) => ({
      id: m.id || `muse-hist-${idx}-${Date.now()}`,
      sender: m.sender === 'user' ? 'user' : 'muse',
      text: typeof m.text === 'string' ? m.text : (typeof m.content === 'string' ? m.content : ''),
      timestamp: m.timestamp || 'ตอนนี้',
      actionSuggestions: Array.isArray(m.actionSuggestions)
        ? m.actionSuggestions.map((s: any) => (typeof s === 'string' ? s : (s?.text || String(s))))
        : [],
      thinking: typeof m.thinking === 'string' ? m.thinking : undefined,
      extractedIdeas: Array.isArray(m.extractedIdeas) ? m.extractedIdeas : undefined,
      part1: typeof m.part1 === 'string' ? m.part1 : undefined,
      part2: typeof m.part2 === 'string' ? m.part2 : undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * ☁️ อัปโหลดรูปภาพขึ้น Google Cloud Storage (GCS Bucket: the-soul-media-storage)
 * รองรับทั้ง Base64 และ Data URL คืนค่าเป็น URL ถาวรบน GCS CDN
 */
export async function uploadImageToStorage(
  imageBase64: string,
  userId?: string,
  folder: string = 'characters'
): Promise<string> {
  // หากเป็น URL ภายนอกหรือ GCS URL อยู่แล้ว ให้คืนค่าเดิมทันที
  if (imageBase64.startsWith('http://') || imageBase64.startsWith('https://')) {
    return imageBase64;
  }

  const payload = {
    image_base64: imageBase64,
    user_id: userId || 'anonymous',
    folder,
  };

  // ยิงไปที่ Genesis API เป็นหลัก และมี Fallback ไปที่ Main Backend API
  const endpoints = [
    `${GENESIS_API_BASE_URL}/api/genesis/upload-image`,
    `${API_BASE_URL}/upload-image`,
    `${API_BASE_URL}/api/upload-image`,
  ];

  let lastError: unknown = null;
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.url) {
          return result.url;
        }
      } else {
        const errText = await response.text();
        lastError = new Error(`Upload to ${endpoint} failed (${response.status}): ${errText}`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  console.warn('GCS upload endpoint unavailable, keeping local data URL as fallback:', lastError);
  return imageBase64;
}
