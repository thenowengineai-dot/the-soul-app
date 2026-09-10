import { useState, useRef, useEffect, useCallback } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import CreatorSidebar from './components/CreatorSidebar';
import CharacterVisualAnchor from './components/CharacterVisualAnchor';
import TheMuseChat from './components/TheMuseChat';
import ResizableSplitter from './components/ResizableSplitter';
import InspectorPanel from './components/InspectorPanel';
import CelebrationPublishModal from './components/CelebrationPublishModal';
import { INITIAL_VAULT_DRAFTS, INITIAL_MUSE_MESSAGES } from './mockData';
import {
  sendMuseMessage,
  fetchUserDrafts,
  fetchDraftDetail,
  saveDraftToVault,
  deleteDraftFromVault,
  fetchMuseHistory,
  compileBlueprint,
  publishWorldCampaign,
} from './genesisApi';
import { getCurrentUser } from '../chat/chatApi';
import type {
  CreatorMode,
  VaultDraft,
  MuseMessage,
  WorldLocationsMap,
  WorldTimePeriodsMap,
  WorldWeatherSystem,
  WorldScene,
} from './types';

interface WorldCreatorViewProps {
  onExit: () => void;
  onPlayCampaign?: (campaign: {
    id: string;
    name: string;
    avatar?: string;
    defaultWorld?: string;
  }) => void;
}

export default function WorldCreatorView({ onExit, onPlayCampaign }: WorldCreatorViewProps) {
  const [activeMode, setActiveMode] = useState<CreatorMode>('world');
  const [drafts, setDrafts] = useState<VaultDraft[]>(INITIAL_VAULT_DRAFTS);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(
    INITIAL_VAULT_DRAFTS[0]?.id || null
  );
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [isCelebrationModalOpen, setIsCelebrationModalOpen] = useState<boolean>(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sidebar Expanded State (เริ่มต้นจะขยายแถบด้านซ้ายเสมอ ทุกครั้งที่เข้าหน้านี้มา)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true);
  const sidebarContainerRef = useRef<HTMLDivElement>(null);

  // Character Visual Anchor State (คอลัมน์รูปภาพตัวละคร + รูปแบบปุ่มตัวเลือกที่ 2)
  const [visualAnchorWidth, setVisualAnchorWidth] = useState<number>(340);
  const [isVisualAnchorCollapsed, setIsVisualAnchorCollapsed] = useState<boolean>(false);

  // Inspector Panel State (ความกว้างและการเปิด/ปิด พร้อมจดจำขนาดไว้ใน localStorage)
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(() => {
    const saved = localStorage.getItem('solccai_inspector_width');
    const parsed = saved ? parseInt(saved, 10) : 460;
    return isNaN(parsed) ? 460 : parsed;
  });
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState<boolean>(false);

  // The Muse Chat Messages State
  const [messages, setMessages] = useState<MuseMessage[]>(INITIAL_MUSE_MESSAGES);

  // ดึงข้อมูล Draft ปัจจุบันที่กำลังโฟกัส
  const activeDraft = drafts.find((d) => d.id === activeDraftId) || drafts[0];

  // 1. โหลดรายการ Drafts จาก Neon PostgreSQL เมื่อเปิดหน้าจอ
  useEffect(() => {
    let isMounted = true;
    async function loadVault() {
      try {
        const user = getCurrentUser();
        const serverDrafts = await fetchUserDrafts(user.user_id);
        if (isMounted && serverDrafts && serverDrafts.length > 0) {
          setDrafts(serverDrafts);
          setActiveDraftId(serverDrafts[0].id);
        }
      } catch (err) {
        console.warn('Could not load drafts from Neon, using default:', err);
      }
    }
    loadVault();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. โหลดข้อมูลรายละเอียดและประวัติ Muse Chat เมื่อสลับ Active Draft
  useEffect(() => {
    if (!activeDraftId) return;
    const targetDraftId = activeDraftId;
    let isMounted = true;
    async function loadDraftContext() {
      try {
        const user = getCurrentUser();
        // โหลดประวัติแชท The Muse ของ Draft นี้จาก Neon
        const history = await fetchMuseHistory(targetDraftId);
        if (isMounted && history && history.length > 0) {
          setMessages(history);
        } else if (isMounted) {
          // ถ้าเป็นร่างใหม่ที่ยังไม่มีประวัติแชท ให้เปิดด้วยคำทักทายของ The Muse
          const target = drafts.find((d) => d.id === targetDraftId);
          const charTitle = target?.title || 'ตัวละครใหม่';
          const worldTitle = target?.worldTitle || 'โลกใบใหม่';
          setMessages([
            {
              id: `muse-${Date.now()}`,
              sender: 'muse',
              text: `ยินดีต้อนรับสู่สตูดิโอสร้างโลกครับ! เรากำลังโฟกัสอยู่ที่ **${charTitle}** ในโลก **${worldTitle}** 🚀\n\nอยากให้ฉากเปิดและบุคลิกของตัวละครนี้มีความขัดแย้งหรือเสน่ห์แบบไหนดีครับ?`,
              timestamp: 'ตอนนี้',
              actionSuggestions: [
                '🏙️ โลกยุคปัจจุบันที่มีความลับดำมืด',
                '🏰 มหาอาณาจักรแฟนตาซีเวทมนตร์',
                '🌌 ไซไฟอวกาศและการเอาชีวิตรอด',
              ],
            },
          ]);
        }

        // โหลดข้อมูลรายละเอียดการ์ดของ Draft นี้จาก Neon
        const detail = await fetchDraftDetail(user.user_id, targetDraftId);
        if (isMounted && detail) {
          setDrafts((prev) =>
            prev.map((d) => (d.id === targetDraftId ? { ...d, ...detail } : d))
          );
        }
      } catch (err) {
        console.warn('Could not load draft context:', err);
      }
    }
    loadDraftContext();
    return () => {
      isMounted = false;
    };
  }, [activeDraftId, drafts]);

  // ปักหมุด / ยกเลิกการปักหมุด Draft (พร้อมบันทึกลง Neon)
  const handleTogglePin = async (id: string) => {
    const user = getCurrentUser();
    let nextPinned = false;
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          nextPinned = !d.isPinned;
          return { ...d, isPinned: nextPinned };
        }
        return d;
      })
    );

    try {
      const target = drafts.find((d) => d.id === id);
      if (target) {
        await saveDraftToVault({
          userId: user.user_id,
          data: { ...target, isPinned: nextPinned } as Record<string, unknown>,
          mode: activeMode,
        });
      }
    } catch (err) {
      console.error('Failed to sync pin to Neon:', err);
    }
  };

  // ลบ Draft (พร้อมลบออกจาก Neon)
  const handleDeleteDraft = async (id: string) => {
    const user = getCurrentUser();
    setDrafts((prev) => {
      const remaining = prev.filter((d) => d.id !== id);
      if (activeDraftId === id) {
        setActiveDraftId(remaining[0]?.id || null);
      }
      return remaining;
    });

    try {
      await deleteDraftFromVault(user.user_id, id);
    } catch (err) {
      console.error('Failed to delete draft from Neon:', err);
    }
  };

  // สร้าง Draft ตัวละครและโลกคู่กันใหม่ (พร้อมบันทึกลง Neon)
  const handleNewDraft = async () => {
    const user = getCurrentUser();
    const newId = `world_${Date.now()}`;
    const newCharId = `char_${Date.now()}`;
    const newTitle = 'ตัวละครใหม่ (New Character)';
    const newWorld = 'โลกใบใหม่ (New World)';
    const newDraft: VaultDraft = {
      id: newId,
      title: newTitle,
      worldTitle: newWorld,
      mode: 'character',
      createdAt: 'วันนี้',
      updatedAt: 'เมื่อสักครู่',
      description: 'ตัวละครและโลกคู่กันที่พร้อมให้คุณสร้างสรรค์ร่วมกับ The Muse',
      status: 'draft',
      isPinned: false,
      authorName: user.name || 'You',
      themeColor: '#EF264C',
    };

    setDrafts((prev) => [newDraft, ...prev]);
    setActiveDraftId(newId);

    try {
      await saveDraftToVault({
        userId: user.user_id,
        data: {
          ...newDraft,
          character_id: newCharId,
        } as Record<string, unknown>,
        mode: 'character',
      });
    } catch (err) {
      console.error('Failed to save new draft to Neon:', err);
    }
  };

  // อัปเดตข้อมูล Draft ปัจจุบัน (แก้ไขแบบ Real-time พร้อม Debounced Auto-save สู่ Neon)
  const handleUpdateDraft = useCallback((updated: Partial<VaultDraft>) => {
    if (!activeDraft?.id) return;
    const updatedDraft = { ...activeDraft, ...updated, updatedAt: 'เมื่อสักครู่' };
    setDrafts((prev) =>
      prev.map((d) => (d.id === activeDraft.id ? updatedDraft : d))
    );

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        const user = getCurrentUser();
        await saveDraftToVault({
          userId: user.user_id,
          data: updatedDraft as unknown as Record<string, unknown>,
          mode: activeMode,
        });
      } catch (err) {
        console.warn('Auto-save draft to Neon failed:', err);
      }
    }, 1500);
  }, [activeDraft, activeMode]);

  // ส่งข้อความคุยกับ The Muse จริงผ่าน Cloud Run & Vertex AI
  const handleSendMessage = async (text: string) => {
    const userMsg: MuseMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'ตอนนี้',
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsThinking(true);

    try {
      const currentUser = getCurrentUser();
      const response = await sendMuseMessage({
        message: text,
        history: newMessages,
        mode: activeMode,
        draftId: activeDraftId,
        userId: currentUser.user_id,
      });

      const botReply: MuseMessage = {
        id: `muse-${Date.now()}`,
        sender: 'muse',
        text: response.text,
        timestamp: 'ตอนนี้',
        actionSuggestions: response.actionSuggestions,
        thinking: response.thinking,
        extractedIdeas: response.rawIdeas,
        part1: response.part1,
        part2: response.part2,
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error('The Muse Chat Error:', err);
      const fallbackReply: MuseMessage = {
        id: `muse-${Date.now()}`,
        sender: 'muse',
        text: 'ขออภัยครับ เกิดข้อขัดข้องชั่วคราวในการเชื่อมต่อกับสมองกล The Muse กรุณาลองใหม่อีกครั้งนะครับ',
        timestamp: 'ตอนนี้',
        actionSuggestions: ['ลองส่งใหม่อีกครั้ง'],
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsThinking(false);
    }
  };

  // สังเคราะห์และแปลงข้อมูล JSON ที่ได้รับจาก Vertex AI / The Muse Backend ให้เข้ากับโครงสร้าง VaultDraft
  const normalizeCompiledData = useCallback(
    (
      compiled: Record<string, unknown>,
      mode: CreatorMode,
      currentDraft: VaultDraft
    ): Partial<VaultDraft> => {
      if (mode === 'world') {
        const updates: Partial<VaultDraft> = {};
        if (compiled.name && typeof compiled.name === 'string') updates.worldTitle = compiled.name;
        if (compiled.thai_name && typeof compiled.thai_name === 'string') updates.thai_name = compiled.thai_name;
        if (compiled.description && typeof compiled.description === 'string') updates.description = compiled.description;
        if (compiled.world_id && typeof compiled.world_id === 'string') updates.world_id = compiled.world_id;
        if (compiled.prologue) updates.prologue = compiled.prologue as VaultDraft['prologue'];
        if (compiled.player_persona) updates.player_persona = compiled.player_persona as VaultDraft['player_persona'];
        if (compiled.initial_states) updates.initial_states = compiled.initial_states as VaultDraft['initial_states'];
        if (compiled.starting_state) updates.starting_state = compiled.starting_state as VaultDraft['starting_state'];

        // Normalize locations
        if (Array.isArray(compiled.locations)) {
          const locMap: WorldLocationsMap = {};
          compiled.locations.forEach((loc: Record<string, unknown>) => {
            const key = String(loc.name || loc.id || 'สถานที่');
            const desc = String(loc.description || loc.base_mood || '');
            locMap[key] = {
              base_mood: desc,
              choke_points: String(loc.choke_points || 'ทางเข้าออกหลัก'),
              key_furniture: String(loc.key_furniture || 'อุปกรณ์และโต๊ะทำงาน'),
              spatial_layout: String(loc.spatial_layout || desc),
              sensory_cues: {
                ambient_cues: Array.isArray((loc.sensory_cues as Record<string, unknown>)?.ambient_cues)
                  ? ((loc.sensory_cues as Record<string, unknown>).ambient_cues as string[])
                  : [desc || 'บรรยากาศโดยรอบ'],
              },
            };
          });
          updates.real_locations = locMap;
        } else if (compiled.locations && typeof compiled.locations === 'object') {
          updates.real_locations = compiled.locations as WorldLocationsMap;
        }

        // Normalize time periods
        if (Array.isArray(compiled.time_periods)) {
          const tpMap: WorldTimePeriodsMap = {};
          compiled.time_periods.forEach((tp: Record<string, unknown>) => {
            const key = String(tp.name || tp.id || 'ช่วงเวลา');
            tpMap[key] = {
              atmosphere: String(tp.description || tp.atmosphere || ''),
            };
          });
          updates.time_periods = tpMap;
        } else if (compiled.time_periods && typeof compiled.time_periods === 'object') {
          updates.time_periods = compiled.time_periods as WorldTimePeriodsMap;
        }

        // Normalize weather system
        if (Array.isArray(compiled.weather_system)) {
          const chain: Record<string, { next: string[] }> = {};
          const rawArr = compiled.weather_system as Array<Record<string, unknown>>;
          rawArr.forEach((w, idx) => {
            const key = String(w.name || w.id || `สภาพอากาศ ${idx + 1}`);
            const nextItem = rawArr[idx + 1]?.name || rawArr[idx + 1]?.id;
            chain[key] = { next: nextItem ? [String(nextItem)] : [] };
          });
          updates.weather_system = { logical_chain: chain };
        } else if (compiled.weather_system && typeof compiled.weather_system === 'object') {
          updates.weather_system = compiled.weather_system as WorldWeatherSystem;
        }

        // Normalize opening_scenarios
        const rawScenarios = compiled.opening_scenarios as Record<string, unknown> | Array<unknown> | undefined;
        if (rawScenarios) {
          if (typeof rawScenarios === 'object' && 'scenes' in rawScenarios && Array.isArray((rawScenarios as { scenes: unknown[] }).scenes)) {
            updates.scenario = {
              id: currentDraft.scenario?.id || 'scenario_01',
              name: String(rawScenarios.name || compiled.name || 'ฉากเปิดเรื่องราว'),
              scenes: (rawScenarios as { scenes: unknown[] }).scenes as WorldScene[],
            };
          } else if (Array.isArray(rawScenarios)) {
            updates.scenario = {
              id: currentDraft.scenario?.id || 'scenario_01',
              name: String(compiled.name || 'ฉากเปิดเรื่องราว'),
              scenes: rawScenarios as WorldScene[],
            };
          }
        }

        return updates;
      } else {
        // Character mode
        const updates: Partial<VaultDraft> = {};
        if (compiled.name && typeof compiled.name === 'string') updates.title = compiled.name;
        if (compiled.archetype && typeof compiled.archetype === 'string') updates.archetype = compiled.archetype;
        if (Array.isArray(compiled.hashtag_dna)) updates.hashtags = compiled.hashtag_dna as string[];
        else if (Array.isArray(compiled.hashtags)) updates.hashtags = compiled.hashtags as string[];

        if (compiled.appearance) updates.appearance = compiled.appearance as VaultDraft['appearance'];
        if (compiled.psychology) updates.psychology = compiled.psychology as VaultDraft['psychology'];
        if (compiled.core_stats && typeof compiled.core_stats === 'object') {
          updates.core_stats = compiled.core_stats as Record<string, number>;
          updates.stats = compiled.core_stats as Record<string, number>;
        }
        if (compiled.preferences) updates.preferences = compiled.preferences as VaultDraft['preferences'];
        if (Array.isArray(compiled.background_story)) updates.background_story = compiled.background_story as string[];
        if (Array.isArray(compiled.passive_perks)) updates.passive_perks = compiled.passive_perks as VaultDraft['passive_perks'];
        if (compiled.micro_expressions) updates.micro_expressions = compiled.micro_expressions as VaultDraft['micro_expressions'];
        if (typeof compiled.max_desire === 'number') updates.max_desire = compiled.max_desire;

        return updates;
      }
    },
    []
  );

  // 🏭 ซิงค์และสังเคราะห์พิมพ์เขียวร่วมกับ The Muse AI (Build Blueprint)
  const handleSyncBlueprint = async () => {
    if (!activeDraft?.id || isSyncing) return;
    setIsSyncing(true);
    try {
      const user = getCurrentUser();
      const compiled = await compileBlueprint({
        history: messages,
        mode: activeMode,
        characterData: activeDraft as unknown as Record<string, unknown>,
        masterBrief: activeDraft.description,
      });

      if (compiled && Object.keys(compiled).length > 0) {
        const updates = normalizeCompiledData(compiled, activeMode, activeDraft);
        const updatedDraft = { ...activeDraft, ...updates, updatedAt: 'เมื่อสักครู่' };

        setDrafts((prev) =>
          prev.map((d) => (d.id === activeDraft.id ? updatedDraft : d))
        );

        // บันทึกลง Neon PostgreSQL ทันที
        await saveDraftToVault({
          userId: user.user_id,
          data: updatedDraft as unknown as Record<string, unknown>,
          mode: activeMode,
        });

        // ส่งข้อความแจ้งในประวัติแชท The Muse
        setMessages((prev) => [
          ...prev,
          {
            id: `muse-${Date.now()}`,
            sender: 'muse',
            text: `✨ **The Muse ได้สังเคราะห์พิมพ์เขียวและลงบันทึกในแผง Inspector เรียบร้อยแล้วครับ!**\n\nข้อมูลโครงสร้าง ${activeMode === 'world' ? 'โลก (บทนำ, เควสฉากเปิด, สถาปัตยกรรมฉาก, และสภาพอากาศ)' : 'ตัวละคร (จิตวิทยาสองขั้ว, สเตตัส, สรีระ, และสกิล)'} ได้รับการถักทอเข้าสู่ระบบแล้ว ตรวจสอบและปรับแก้ต่อได้ตามต้องการเลยครับ 🏛️`,
            timestamp: 'ตอนนี้',
            actionSuggestions: [
              '⚡ เผยแพร่สู่ห้องเล่นทันที',
              'ปรับแต่งรายละเอียดบีตฉากเพิ่มเติม',
            ],
          },
        ]);
      }
    } catch (err) {
      console.error('Compile Blueprint Failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `muse-${Date.now()}`,
          sender: 'muse',
          text: 'ขออภัยครับ เกิดข้อขัดข้องระหว่างการสังเคราะห์พิมพ์เขียว กรุณาลองใหม่อีกครั้งนะครับ',
          timestamp: 'ตอนนี้',
        },
      ]);
    } finally {
      setIsSyncing(false);
    }
  };

  // ⚡ เผยแพร่สู่ห้องเล่น (Publish to Upstash Redis Hot Cache & Neon PostgreSQL)
  const handlePublishCampaign = async () => {
    if (!activeDraft?.id || isPublishing) return;
    setIsPublishing(true);
    try {
      const user = getCurrentUser();
      // 1. บันทึก Draft ล่าสุดลง Neon ก่อน
      await saveDraftToVault({
        userId: user.user_id,
        data: activeDraft as unknown as Record<string, unknown>,
        mode: activeMode,
      });

      // 2. เผยแพร่สู่ Neon (status = 'published') และอัดฉีดเข้า Upstash Redis Hot Cache
      const success = await publishWorldCampaign(activeDraft.id, user.user_id);
      if (success) {
        const updatedDraft = {
          ...activeDraft,
          status: 'published' as const,
          updatedAt: 'เมื่อสักครู่',
        };
        setDrafts((prev) =>
          prev.map((d) => (d.id === activeDraft.id ? updatedDraft : d))
        );

        // 3. เปิด Modal แสดงความยินดีและปุ่ม Play Now
        setIsCelebrationModalOpen(true);
      }
    } catch (err) {
      console.error('Publish Campaign Failed:', err);
      alert('เกิดข้อผิดพลาดในการเผยแพร่แคมเปญ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsPublishing(false);
    }
  };

  // 🎮 เข้าเล่นทันที (Play Now)
  const handlePlayNow = () => {
    setIsCelebrationModalOpen(false);
    if (onPlayCampaign && activeDraft) {
      onPlayCampaign({
        id: activeDraft.id,
        name: activeDraft.title,
        avatar: activeDraft.image || activeDraft.images?.[0],
        defaultWorld: activeDraft.id,
      });
    } else {
      onExit();
    }
  };

  // ปรับขนาดหน้าต่าง Inspector ฝั่งขวา พร้อมจดจำค่า
  const handleResize = (newWidth: number) => {
    setRightPanelWidth(newWidth);
    localStorage.setItem('solccai_inspector_width', newWidth.toString());
    if (isRightPanelCollapsed) {
      setIsRightPanelCollapsed(false);
    }
  };

  // รีเซ็ตขนาดหน้าต่าง Inspector กลับสู่ค่าเริ่มต้น (460px)
  const handleResetWidth = () => {
    setRightPanelWidth(460);
    localStorage.setItem('solccai_inspector_width', '460');
    setIsRightPanelCollapsed(false);
  };

  return (
    <div className="h-screen w-full bg-[#090909] text-[#F2F2F5] font-sans flex relative overflow-hidden select-none">
      {/* 1. Left Sidebar: The Vault (Characters + Paired Worlds) */}
      <div ref={sidebarContainerRef} className="shrink-0 flex relative z-20">
        <CreatorSidebar
          isSidebarExpanded={isSidebarExpanded}
          setIsSidebarExpanded={setIsSidebarExpanded}
          drafts={drafts}
          activeDraftId={activeDraftId}
          onSelectDraft={(id) => setActiveDraftId(id)}
          onNewDraft={handleNewDraft}
          onTogglePin={handleTogglePin}
          onDeleteDraft={handleDeleteDraft}
          onExit={onExit}
        />

        {/* Option 2: Reopen Character Visual Anchor Button when collapsed */}
        {isVisualAnchorCollapsed && (
          <button
            type="button"
            onClick={() => setIsVisualAnchorCollapsed(false)}
            title="แสดงภาพตัวละคร (Image)"
            className="absolute -right-4 top-[104px] z-30 w-8 h-8 rounded-full bg-[#141416]/95 backdrop-blur-xl border border-white/[0.12] hover:border-[#EF264C]/70 hover:bg-[#1D1D22] text-[#ACACB2] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 group"
          >
            <ImageIcon
              size={15}
              strokeWidth={2}
              className="group-hover:text-[#EF264C] transition-colors"
            />
          </button>
        )}
      </div>

      {/* 2. Character Visual Anchor (คอลัมน์รูปภาพตัวละครและแกลเลอรีชุด/คอนเซปต์) */}
      {!isVisualAnchorCollapsed && (
        <CharacterVisualAnchor
          key={activeDraft?.id}
          draft={activeDraft}
          width={visualAnchorWidth}
        />
      )}

      {/* 3. Left Resizable Splitter (ระหว่าง Visual Anchor กับ The Muse Chat พร้อมปุ่มพับเก็บ Option 2) */}
      {!isVisualAnchorCollapsed && (
        <ResizableSplitter
          side="left"
          getLeftOffset={() =>
            sidebarContainerRef.current?.getBoundingClientRect().right ??
            (isSidebarExpanded ? 280 : 70)
          }
          onResize={(newWidth) => setVisualAnchorWidth(newWidth)}
          onReset={() => setVisualAnchorWidth(340)}
          onCollapse={() => setIsVisualAnchorCollapsed(true)}
          minWidth={260}
          maxWidth={540}
          collapseThreshold={160}
        >
          {/* Option 2: ปุ่มซ่อนภาพตัวละคร ลอยเด่นบนเส้นคั่นแยกรูปทรงและไอคอนเฉพาะ */}
          <button
            type="button"
            onClick={() => setIsVisualAnchorCollapsed(true)}
            title="ซ่อนภาพตัวละคร (Image)"
            className="w-8 h-8 rounded-full bg-[#141416]/95 backdrop-blur-xl border border-white/[0.12] hover:border-[#EF264C]/70 hover:bg-[#1D1D22] text-[#ACACB2] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 group"
          >
            <ImageIcon
              size={15}
              strokeWidth={2}
              className="group-hover:text-[#EF264C] transition-colors"
            />
          </button>
        </ResizableSplitter>
      )}

      {/* 4. Center Panel: The Muse AI Architect Chat */}
      <TheMuseChat
        messages={messages}
        onSendMessage={handleSendMessage}
        onSelectSuggestion={handleSendMessage}
        isRightPanelCollapsed={isRightPanelCollapsed}
        onToggleRightPanel={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
        activeMode={activeMode}
        activeDraftTitle={activeDraft?.title}
        isThinking={isThinking}
      />

      {/* 5. Right Resizable Splitter (ลากเมาส์เพื่อยืด/หดพื้นที่ฝั่งขวา) */}
      {!isRightPanelCollapsed && (
        <ResizableSplitter
          side="right"
          onResize={handleResize}
          onReset={handleResetWidth}
          onCollapse={() => setIsRightPanelCollapsed(true)}
          minWidth={320}
          maxWidth={750}
        />
      )}

      {/* 6. Right Panel: Dynamic Inspector & Cards (เปิด/ปิดได้) */}
      <InspectorPanel
        width={rightPanelWidth}
        onWidthChange={handleResize}
        isCollapsed={isRightPanelCollapsed}
        onCollapse={() => setIsRightPanelCollapsed(true)}
        activeMode={activeMode}
        onModeChange={setActiveMode}
        activeDraftTitle={activeDraft?.title}
        activeWorldTitle={activeDraft?.worldTitle}
        draft={activeDraft}
        onUpdateDraft={handleUpdateDraft}
        onSyncBlueprint={handleSyncBlueprint}
        onPublishCampaign={handlePublishCampaign}
        isSyncing={isSyncing}
        isPublishing={isPublishing}
      />

      {/* 7. Celebration Modal when campaign is published to Hot Cache */}
      {activeDraft && (
        <CelebrationPublishModal
          isOpen={isCelebrationModalOpen}
          onClose={() => setIsCelebrationModalOpen(false)}
          onPlayNow={handlePlayNow}
          draft={activeDraft}
        />
      )}
    </div>
  );
}
