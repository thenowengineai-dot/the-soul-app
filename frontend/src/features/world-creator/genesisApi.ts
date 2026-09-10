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
  return result.data || [];
}

/**
 * 📂 โหลดข้อมูล Draft ฉบับเต็มจาก Neon
 */
export async function fetchDraftDetail(userId: string, worldId: string) {
  const response = await fetch(`${GENESIS_API_BASE_URL}/api/genesis/drafts/${encodeURIComponent(userId)}/${encodeURIComponent(worldId)}`);
  if (!response.ok) {
    throw new Error(`Failed to load draft detail (${response.status})`);
  }
  const result = await response.json();
  return result.data;
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
    await fetch(`${API_BASE_URL}/api/clear_cache?world_id=${encodeURIComponent(worldId)}`, {
      method: 'POST',
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
    await fetch(`${API_BASE_URL}/api/clear_cache?world_id=${encodeURIComponent(worldId)}`, {
      method: 'POST',
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
  const response = await fetch(`${GENESIS_API_BASE_URL}/api/genesis/muse/${encodeURIComponent(draftId)}`);
  if (!response.ok) return [];
  const result = await response.json();
  return result.data?.messages || [];
}
