import { useState, useMemo } from 'react';
import {
  Pencil,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Target,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import type { VaultDraft, WorldScene, WorldBeat, PlayerTriggerAction } from '../../types';
import { computeSceneChainOrder, getCleanSceneTitle } from '../railroad/RailroadCableOverlay';

interface WorldBeatCardProps {
  draft: VaultDraft;
  onUpdateDraft?: (updated: Partial<VaultDraft>) => void;
  isEditable?: boolean;
}

interface EditTriggerItem {
  id: string;
  key: string;
  feedback: string;
  action: PlayerTriggerAction;
}

// Sample fallback scene if draft.scenario has no scenes yet
const FALLBACK_DEFAULT_SCENE: WorldScene = {
  scene_id: 'scene_1',
  title: 'ฉากที่ 1: ห้องโถงเสื่อทาทามิเรียวกัง',
  location_key: 'ห้องโถงเสื่อทาทามิเรียวกัง',
  scene_objective: "พา [PLAYER] เดินทางขึ้นเขาไปเก็บสมุนไพร 'เฟิร์นหมอกอัคคี' และหลบเข้าซอกถ้ำร้าง",
  forced_chaos_level: 'low',
  event_mood: 'อบอุ่น อึดอัด ชื้นแฉะ ลื่นไถล แนบเนื้อ',
  director_vision: 'The Slow Burn: สร้างความกระอักกระอ่วน ห้ามรีบร้อน ค่อยๆ กดดันจากบรรยากาศอบอุ่นสู่ความแปรปรวนของธรรมชาติ',
  director_setup: 'ไอน้ำชาเขียวอุ่นกรุ่นโชยฟุ้งตัดกับไอเย็นยามบ่ายภายในห้องโถงเสื่อทาทามิอันสงบเงียบของเรียวกัง [PLAYER] ยืนสะพายกระเป๋าอุปกรณ์พฤกษศาสตร์ใบโตหนักอึ้งอยู่ตรงกลางห้องท่ามกลางสายตาเกี่ยงงานของสมาชิกคนอื่น ขณะที่ [ACTOR] ในชุดเสื้อเชิ้ตสีขาวบางสวมแว่นตากรอกหนากำลังใช้นิ้วดันดั้งแว่นด้วยความประหม่า ก่อนที่ทั้งสองจะต้องเดินพ้นชายคาออกไปสู่เนินเขาป่าทึบที่สายฝนเริ่มตั้งเค้าแปรปรวนครึ้มฟ้าครึ้มฝน',
  premise: 'ไอน้ำชาเขียวอบอุ่นในห้องโถงเสื่อทาทามิถูกขัดจังหวะด้วยข้ออ้างการเกี่ยงงานของสมาชิกคนอื่น [PLAYER] ยืนแบกกระเป๋าเก็บตัวอย่างพฤกษศาสตร์ด้วยความจำใจจากการสั่งการของประธานชมรม ขณะที่ [ACTOR] นั่งก้มหน้านิ่งในชุดเสื้อเชิ้ตสีขาวบางผ้าฝ้าย ยืนขึ้นปรับกรอบแว่นหนาด้วยท่าทางประหม่า ก่อนที่ทั้งคู่จะก้าวพ้นชายคาเรียวกังออกไปเผชิญกับสภาพอากาศที่แปรปรวนกลางป่า',
  beats: [
    {
      beat_id: 'scene_1_beat_1',
      actor_state: 'Player Anchor: ยืนระยะห่าง 1 เมตรตรงหน้า [PLAYER] | 3D Geometry: จุดศูนย์ถ่วงทิ้งลงส้นเท้าทั้งสองข้าง แขนสองข้างประสานไว้ระดับเอว กำนิ้วมือแน่น องศากระดูกสันหลังยืดตรงแต่อ่อนน้อม Head Pitch ก้มลงเล็กน้อย | Skin Micro-Details: แก้มขาวซับสีชมพูระเรื่อบางเบา สายตาหลังกรอบแว่นแอบสบตา [PLAYER] สั้นๆ ลมหายใจเข้าออกเป็นจังหวะสม่ำเสมอ | Wardrobe Continuity: เสื้อเชิ้ตสีขาวผ้าฝ้ายติดกระดุมเม็ดบนสุด ตึงรั้งเล็กน้อยบริเวณหน้าอกอวบอิ่ม',
      hidden_evaluation_criteria: {
        'ยอมรับกระเป๋าอุปกรณ์และเดินตาม': {
          action_result: 'progress',
          feedback: 'เธอแอบส่งยิ้มขอบคุณบางเบาผ่านกรอบแว่น ก่อนจะก้าวเดินนำออกพ้นประตู',
        },
        'พยายามปฏิเสธหรือไม่ยอมเดินตาม': {
          action_result: 'loop',
          feedback: 'ประธานชมรมกดดันหนักขึ้น บังคับยัดกระเป๋าใส่มืออย่างเลี่ยงไม่ได้',
        },
      },
      pacing_control: {
        max_turns: 3,
        action_result: 'progress',
        inevitable_consequence: 'ประธานชมรมยัดกระเป๋าอุปกรณ์ใส่มือ [PLAYER] อย่างไม่ยอมให้ปฏิเสธ พร้อมผลักหลัง [PLAYER] ให้เดินตาม [ACTOR] ออกพ้นประตูเรียวกังทันที',
      },
    },
    {
      beat_id: 'scene_1_beat_2',
      actor_state: 'Player Anchor: ยืนเดินนำหน้า [PLAYER] ระยะ 0.5 เมตรบนทางเดินดินโคลน | 3D Geometry: ลำตัวท่อนบนเอียงไปข้างหน้า 15 องศาเพื่อฝ่าสายลม สะโพกผึ่งผายขยับยักย้ายตามจังหวะก้าวเดิน เข่าทั้งสองข้างสั่นระริกเล็กน้อยจากความหนาว สายตาหลุบต่ำ | Skin Micro-Details: หยดน้ำฝนเกาะแพรวพราวตามแก้มและซอกคอ ไอน้ำระเหยออกจากผิวเนื้อที่ร้อนผ่าว ดวงตาหลังแว่นตากรอกหนาที่เริ่มขึ้นฝ้าหรี่ลงเล็กน้อย | Wardrobe Continuity: เสื้อเชิ้ตสีขาวเปียกโชกแนบสนิทไปกับผิวเนื้อจนโปร่งแสง เผยให้เห็นบราเซียลูกไม้สีดำสนิทที่พยุงหน้าอกอวบอิ่มชูชันขัดกับมาดสุภาพ',
      hidden_evaluation_criteria: {
        'เอ่ยเตือนเรื่องเสื้อเปียกหรือยื่นเสื้อบังฝน': {
          action_result: 'progress',
          feedback: 'เธอหน้าแดงก่ำ ก้มหน้าดึงเสื้อด้วยความประหม่า ลมหายใจเริ่มติดขัด',
        },
        'ทำเป็นไม่สนใจหรือเดินหนีออกห่าง': {
          action_result: 'loop',
          feedback: 'ลมพัดกรรโชกแรงขึ้น ฝนสาดจนเสื้อแนบเนื้อโปร่งใสยิ่งกว่าเดิม',
        },
      },
      pacing_control: {
        max_turns: 3,
        action_result: 'progress',
        inevitable_consequence: 'สายฝนเทกระหน่ำลงมารุนแรงยิ่งขึ้น ลมพัดแรงจนเสื้อเชิ้ตขาวเปียกแนบเนื้อ [ACTOR] จนเห็นลายลูกไม้สีดำชัดเจน [ACTOR] หันกลับมาใช้นิ้วดันแว่นที่ขึ้นฝ้าด้วยความประหม่า',
      },
    },
    {
      beat_id: 'scene_1_beat_3',
      actor_state: 'Player Anchor: ทอดตัวลื่นไถลทับอยู่บนเรือนร่างของ [PLAYER] ตรงเนินดินโคลน | 3D Geometry: ทรวงอกอวบอิ่มบดเบียดแผงอก [PLAYER] เต็มแรง แขนสองข้างโอบรอบคอ [PLAYER] ขาขวาก่ายเกยระหว่างขาของ [PLAYER] องศากระดูกสันหลังแอ่นโค้งรองรับการกระแทก | Skin Micro-Details: ลมหายใจร้อนระอุเป่ารดซอกคอ [PLAYER] ผิวเนื้อสั่นสะท้านระริก อุณหภูมิร่างกายสูงขึ้นกะทันหัน แว่นตาเอียงกระเท่เร่บนดั้ง | Wardrobe Continuity: เสื้อเชิ้ตเปียกฝนเปรอะคราบโคลนบางจุด กระดุมเม็ดบนหลุดออกเผยเนินอกขาวผ่อง',
      hidden_evaluation_criteria: {
        'ช่วยโอบพยุงและเอ่ยถามอาการบาดเจ็บ': {
          action_result: 'progress',
          feedback: 'เธอทิ้งน้ำหนักตัวซบอกคุณเต็มแรง เสียงหอบกระเส่าสะท้อนทั่วถ้ำ',
        },
        'ผลักออกอย่างแรงหรือพยายามวิ่งหนี': {
          action_result: 'loop',
          feedback: 'ดินโคลนสไลด์ปิดปากทางถ้ำ บีบให้ทั้งคู่ติดอยู่ในความมืดสลัวด้วยกัน',
        },
      },
      pacing_control: {
        max_turns: 3,
        action_result: 'progress',
        inevitable_consequence: '[ACTOR] ส่งเสียงกรีดร้องสั้นๆ ก่อนจะล้มเสียหลักทับร่าง [PLAYER] ทั้งสองกลิ้งคลุกโคลนไถลลงเนินชัน ลื่นไหลพรวดเข้าไปหยุดอยู่ภายในซอกถ้ำหินแกรนิตร้างอันมืดสลัว',
      },
    },
  ],
};

export default function WorldBeatCard({
  draft,
  onUpdateDraft,
  isEditable = true,
}: WorldBeatCardProps) {
  // Extract scenes from draft or fallback
  const scenes = draft.scenario?.scenes && draft.scenario.scenes.length > 0
    ? draft.scenario.scenes
    : [FALLBACK_DEFAULT_SCENE];

  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [selectedBeatIndex, setSelectedBeatIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpandedCard, setIsExpandedCard] = useState(false);
  const [isSelectingScene, setIsSelectingScene] = useState(false);

  // Safe scene and beat references
  const currentScene = scenes[selectedSceneIndex] || scenes[0];

  // Dynamic Sequential Scene Order Map (Recalculated on connection changes)
  const sceneOrderMap = useMemo(() => computeSceneChainOrder(scenes), [scenes]);
  const currentOrder = sceneOrderMap.get(currentScene?.scene_id) ?? null;
  const currentCleanTitle = getCleanSceneTitle(currentScene?.title);
  const currentRawLocation = currentScene?.location_key ? currentScene.location_key.trim() : '';
  const isRedundantWithLocation =
    Boolean(
      currentRawLocation &&
        currentCleanTitle &&
        (currentCleanTitle.toLowerCase() === currentRawLocation.toLowerCase() ||
          currentCleanTitle.includes(currentRawLocation) ||
          currentRawLocation.includes(currentCleanTitle))
    ) ||
    currentCleanTitle === 'สถานการณ์' ||
    currentCleanTitle === 'ฉาก' ||
    currentCleanTitle === 'ฉากใหม่' ||
    currentCleanTitle === 'ฉากอิสระ' ||
    currentCleanTitle === '';

  const currentPremise = !isRedundantWithLocation ? currentCleanTitle : null;

  const currentFullTitleTooltip = currentOrder
    ? currentPremise
      ? `ฉากที่ ${currentOrder} · ${currentPremise}`
      : `ฉากที่ ${currentOrder}`
    : currentPremise
    ? `ฉากอิสระ · ${currentPremise}`
    : currentCleanTitle || 'ฉากอิสระ';

  const beats = currentScene?.beats || [];
  const safeBeatIndex = Math.min(selectedBeatIndex, Math.max(0, beats.length - 1));
  const currentBeat: WorldBeat = beats[safeBeatIndex] || {
    beat_id: 'Beat 01: จังหวะเริ่มต้น',
    actor_state: 'ตัวละครกำลังเตรียมพร้อม...',
    hidden_evaluation_criteria: {
      'ทักทาย': { action_result: 'progress', feedback: 'เธอพยักหน้าตอบ' },
    },
    pacing_control: {
      max_turns: 3,
      action_result: 'progress',
      inevitable_consequence: 'เหตุการณ์ดำเนินสู่ขั้นถัดไป',
    },
  };

  // Edit form states
  const [editBeatId, setEditBeatId] = useState(currentBeat.beat_id || '');
  const [editActorState, setEditActorState] = useState(currentBeat.actor_state || '');
  const [editTriggers, setEditTriggers] = useState<EditTriggerItem[]>(() => {
    const entries = Object.entries(currentBeat.hidden_evaluation_criteria || {});
    if (entries.length === 0) {
      return [{ id: 'trg_0', key: 'เข้าใกล้', feedback: 'เธอสะดุ้งแต่ไม่ขยับหนี', action: 'progress' }];
    }
    return entries.map(([k, v], idx) => ({
      id: `trg_${idx}`,
      key: k,
      feedback: v.feedback || '',
      action: v.action_result || 'progress',
    }));
  });
  const [editMaxTurns, setEditMaxTurns] = useState(currentBeat.pacing_control?.max_turns || 3);
  const [editConsequence, setEditConsequence] = useState(
    currentBeat.pacing_control?.inevitable_consequence || ''
  );

  // Helper to commit scenario changes
  const commitScenes = (newScenes: WorldScene[]) => {
    if (!onUpdateDraft) return;
    onUpdateDraft({
      scenario: {
        ...(draft.scenario || {}),
        scenes: newScenes,
      },
    });
  };

  // Switch beat
  const handleSelectBeat = (idx: number) => {
    setSelectedBeatIndex(idx);
    setIsEditing(false);
    const targetBeat = beats[idx];
    if (targetBeat) {
      setEditBeatId(targetBeat.beat_id || '');
      setEditActorState(targetBeat.actor_state || '');
      const entries = Object.entries(targetBeat.hidden_evaluation_criteria || {});
      setEditTriggers(
        entries.length > 0
          ? entries.map(([k, v], i) => ({
              id: `trg_${i}`,
              key: k,
              feedback: v.feedback || '',
              action: v.action_result || 'progress',
            }))
          : [{ id: 'trg_0', key: 'เข้าใกล้', feedback: '', action: 'progress' }]
      );
      setEditMaxTurns(targetBeat.pacing_control?.max_turns || 3);
      setEditConsequence(targetBeat.pacing_control?.inevitable_consequence || '');
    }
  };

  // Reorder beats: Move Left
  const handleMoveBeatLeft = (idx: number) => {
    if (idx <= 0) return;
    const updatedBeats = [...beats];
    const temp = updatedBeats[idx];
    updatedBeats[idx] = updatedBeats[idx - 1];
    updatedBeats[idx - 1] = temp;
    const updatedScenes = [...scenes];
    updatedScenes[selectedSceneIndex] = { ...currentScene, beats: updatedBeats };
    commitScenes(updatedScenes);
    setSelectedBeatIndex(idx - 1);
  };

  // Reorder beats: Move Right
  const handleMoveBeatRight = (idx: number) => {
    if (idx >= beats.length - 1) return;
    const updatedBeats = [...beats];
    const temp = updatedBeats[idx];
    updatedBeats[idx] = updatedBeats[idx + 1];
    updatedBeats[idx + 1] = temp;
    const updatedScenes = [...scenes];
    updatedScenes[selectedSceneIndex] = { ...currentScene, beats: updatedBeats };
    commitScenes(updatedScenes);
    setSelectedBeatIndex(idx + 1);
  };

  // Insert beat right after specified index
  const handleInsertBeatAfter = (afterIdx: number) => {
    const newBeatNumber = beats.length + 1;
    const newBeat: WorldBeat = {
      beat_id: `Beat 0${newBeatNumber}: จังหวะแทรกใหม่`,
      actor_state: 'ตัวละครมีท่าทางตอบสนองต่อเหตุการณ์ใหม่...',
      hidden_evaluation_criteria: {
        'สบตา': { action_result: 'progress', feedback: 'เธอเบือนหน้าหลบแต่ไม่ขยับหนี' },
      },
      pacing_control: {
        max_turns: 3,
        action_result: 'progress',
        inevitable_consequence: 'เรื่องราวดำเนินสู่จุดสำคัญต่อไป',
      },
    };

    const updatedBeats = [...beats];
    updatedBeats.splice(afterIdx + 1, 0, newBeat);
    const updatedScenes = [...scenes];
    updatedScenes[selectedSceneIndex] = {
      ...currentScene,
      beats: updatedBeats,
    };
    commitScenes(updatedScenes);
    setSelectedBeatIndex(afterIdx + 1);
  };

  // Start edit
  const handleStartEdit = () => {
    setIsEditing(true);
    setEditBeatId(currentBeat.beat_id || '');
    setEditActorState(currentBeat.actor_state || '');
    const entries = Object.entries(currentBeat.hidden_evaluation_criteria || {});
    setEditTriggers(
      entries.length > 0
        ? entries.map(([k, v], i) => ({
            id: `trg_${i}_${Date.now()}`,
            key: k,
            feedback: v.feedback || '',
            action: v.action_result || 'progress',
          }))
        : [{ id: 'trg_0', key: 'เข้าใกล้', feedback: '', action: 'progress' }]
    );
    setEditMaxTurns(currentBeat.pacing_control?.max_turns || 3);
    setEditConsequence(currentBeat.pacing_control?.inevitable_consequence || '');
  };

  // Save edit
  const handleSaveEdit = () => {
    setIsEditing(false);
    const updatedBeats = [...beats];
    const triggerObj: Record<string, { action_result: PlayerTriggerAction; feedback?: string }> = {};
    editTriggers.forEach((trg) => {
      const cleanKey = trg.key.trim();
      if (cleanKey) {
        triggerObj[cleanKey] = {
          action_result: trg.action || 'progress',
          feedback: trg.feedback.trim() || undefined,
        };
      }
    });

    updatedBeats[safeBeatIndex] = {
      ...currentBeat,
      beat_id: editBeatId.trim() || `Beat ${safeBeatIndex + 1}`,
      actor_state: editActorState.trim(),
      hidden_evaluation_criteria: triggerObj,
      pacing_control: {
        max_turns: editMaxTurns,
        action_result: 'progress',
        inevitable_consequence: editConsequence.trim(),
      },
    };

    const updatedScenes = [...scenes];
    updatedScenes[selectedSceneIndex] = {
      ...currentScene,
      beats: updatedBeats,
    };
    commitScenes(updatedScenes);
  };

  // Add new trigger row in edit mode
  const handleAddEditTrigger = () => {
    setEditTriggers((prev) => [
      ...prev,
      {
        id: `trg_${Date.now()}`,
        key: '',
        feedback: '',
        action: 'progress',
      },
    ]);
  };

  // Remove trigger row in edit mode
  const handleRemoveEditTrigger = (id: string) => {
    setEditTriggers((prev) => (prev.length > 1 ? prev.filter((t) => t.id !== id) : prev));
  };

  // Add new beat at the end
  const handleAddBeatEnd = () => {
    handleInsertBeatAfter(beats.length - 1);
  };

  // Delete current beat
  const handleDeleteCurrentBeat = () => {
    if (beats.length <= 1) return;
    const updatedBeats = beats.filter((_, idx) => idx !== safeBeatIndex);
    const updatedScenes = [...scenes];
    updatedScenes[selectedSceneIndex] = {
      ...currentScene,
      beats: updatedBeats,
    };
    commitScenes(updatedScenes);
    setSelectedBeatIndex(Math.max(0, safeBeatIndex - 1));
  };

  // Triggers for display
  const triggerEntries = Object.entries(currentBeat.hidden_evaluation_criteria || {});
  const maxTurns = currentBeat.pacing_control?.max_turns ?? 3;

  return (
    <div
      className={`col-span-2 ${
        isExpandedCard ? 'row-span-auto min-h-[346px] h-auto pb-6 z-20' : 'row-span-2 h-[346px]'
      } w-[346px] rounded-[24px] bg-[#141419]/95 backdrop-blur-2xl border border-white/10 hover:border-white/18 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.10)] p-4 flex flex-col justify-between transition-all select-none relative group`}
    >
      {/* ✦ AMBIENT CORNER GLOW */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#EF264C]/[0.05] rounded-full blur-2xl pointer-events-none" />

      {/* ===================================================================== */}
      {/* 1. TOP HEADER & BEAT SELECTOR DOCK                                    */}
      {/* ===================================================================== */}
      <div className="shrink-0 space-y-2">
        {/* Top Control Bar: Scene Dropdown & Turn Gauge & Edit Actions */}
        <div className="flex items-center justify-between gap-1.5">
          {/* Scene Dropdown Anchor */}
          <div className="relative min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setIsSelectingScene(!isSelectingScene)}
              className="text-left flex items-center gap-1 text-white/80 hover:text-white transition-colors truncate cursor-pointer group/scn max-w-full"
              title={currentFullTitleTooltip}
            >
              <span className="font-semibold text-[15px] sm:text-[16px] text-white tracking-tight shrink-0 group-hover/scn:text-white">
                {currentOrder ? `ฉากที่ ${currentOrder}` : 'ฉากอิสระ'}
              </span>
              {currentPremise && (
                <span className="text-[12px] sm:text-[12.5px] text-white/45 font-normal truncate">
                  · {currentPremise}
                </span>
              )}
              <ChevronDown size={12} className="text-white/40 shrink-0 ml-0.5" />
            </button>

            {/* Scene Selector Popup */}
            {isSelectingScene && (
              <div className="absolute left-0 top-full mt-1 w-[240px] rounded-[14px] bg-[#181820] border border-white/15 shadow-[0_12px_36px_rgba(0,0,0,0.85)] p-1 z-30 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] uppercase font-mono text-white/40 px-2 py-1">
                  เลือกฉาก
                </div>
                {scenes.map((sc, scIdx) => {
                  const scOrder = sceneOrderMap.get(sc.scene_id) ?? null;
                  const scClean = getCleanSceneTitle(sc.title);
                  const scLoc = sc.location_key ? sc.location_key.trim() : '';
                  const isScRedundant =
                    Boolean(
                      scLoc &&
                        scClean &&
                        (scClean.toLowerCase() === scLoc.toLowerCase() ||
                          scClean.includes(scLoc) ||
                          scLoc.includes(scClean))
                    ) ||
                    scClean === 'สถานการณ์' ||
                    scClean === 'ฉาก' ||
                    scClean === 'ฉากใหม่' ||
                    scClean === 'ฉากอิสระ' ||
                    scClean === '';
                  const scPremise = !isScRedundant ? scClean : null;
                  const scDisplay = scOrder
                    ? scPremise
                      ? `ฉากที่ ${scOrder} · ${scPremise}`
                      : `ฉากที่ ${scOrder}`
                    : scPremise
                    ? `ฉากอิสระ · ${scPremise}`
                    : scClean || 'ฉากอิสระ';

                  return (
                    <button
                      key={sc.scene_id || scIdx}
                      type="button"
                      onClick={() => {
                        setSelectedSceneIndex(scIdx);
                        setSelectedBeatIndex(0);
                        setIsSelectingScene(false);
                        setIsEditing(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-[8px] text-[12px] transition-colors truncate cursor-pointer flex items-center justify-between ${
                        scIdx === selectedSceneIndex
                          ? 'bg-[#EF264C]/20 text-white font-medium'
                          : 'text-white/70 hover:bg-white/[0.08] hover:text-white'
                      }`}
                    >
                      <span className="truncate">{scDisplay}</span>
                      {scOrder && (
                        <span className="text-[9.5px] font-mono text-white/30 ml-1 shrink-0">
                          #{scOrder}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Edit / Save Button */}
          {isEditable && (
            <div className="flex items-center gap-1 shrink-0">
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="w-6 h-6 rounded-full bg-[#EF264C] text-white flex items-center justify-center cursor-pointer shadow-[0_2px_8px_rgba(239,38,76,0.4)] active:scale-95 transition-all"
                  title="บันทึกบีต"
                >
                  <Check size={11} strokeWidth={2.4} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="w-6 h-6 rounded-full bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 text-white/60 hover:text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  title="แก้ไขข้อมูลบีตนี้"
                >
                  <Pencil size={10} strokeWidth={2} />
                </button>
              )}
              {beats.length > 1 && !isEditing && (
                <button
                  type="button"
                  onClick={handleDeleteCurrentBeat}
                  className="w-6 h-6 rounded-full bg-white/[0.04] hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white/40 hover:text-red-300 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  title="ลบบีตนี้"
                >
                  <Trash2 size={10} strokeWidth={2} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ✦ BEAT SELECTOR PILL DOCK WITH REORDERING ARROWS & MID-INSERTION */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-0.5">
          {beats.map((b, bIdx) => (
            <div key={b.beat_id || bIdx} className="flex items-center gap-1 shrink-0">
              {/* Mid-Pill Insertion Button (Before Beat if not first) */}
              {isEditable && bIdx > 0 && (
                <button
                  type="button"
                  onClick={() => handleInsertBeatAfter(bIdx - 1)}
                  className="w-3.5 h-3.5 rounded-full bg-white/[0.04] hover:bg-white/12 text-white/30 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                  title={`แทรกบีตคั่นกลางระหว่างบีต ${bIdx} และ ${bIdx + 1}`}
                >
                  <Plus size={8} strokeWidth={2.5} />
                </button>
              )}

              {/* Beat Pill with Reorder Controls when active */}
              <div
                onClick={() => handleSelectBeat(bIdx)}
                className={`px-2 py-0.5 rounded-full text-[10.5px] sm:text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  bIdx === safeBeatIndex
                    ? 'bg-white/12 text-white border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] font-semibold'
                    : 'bg-white/[0.03] text-white/45 hover:text-white/80 border border-transparent'
                }`}
              >
                {/* Move Left Arrow on Active Beat */}
                {isEditable && bIdx === safeBeatIndex && beats.length > 1 && (
                  <button
                    type="button"
                    disabled={bIdx === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveBeatLeft(bIdx);
                    }}
                    className="w-3 h-3 rounded hover:bg-white/20 flex items-center justify-center disabled:opacity-20 cursor-pointer transition-colors"
                    title="เลื่อนบีตนี้ไปทางซ้าย"
                  >
                    <ChevronLeft size={9} strokeWidth={2.4} />
                  </button>
                )}

                <span className="text-[#EF264C] text-[9px] font-mono">✦</span>
                <span>บีต {bIdx + 1}</span>

                {/* Move Right Arrow on Active Beat */}
                {isEditable && bIdx === safeBeatIndex && beats.length > 1 && (
                  <button
                    type="button"
                    disabled={bIdx === beats.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveBeatRight(bIdx);
                    }}
                    className="w-3 h-3 rounded hover:bg-white/20 flex items-center justify-center disabled:opacity-20 cursor-pointer transition-colors"
                    title="เลื่อนบีตนี้ไปทางขวา"
                  >
                    <ChevronRight size={9} strokeWidth={2.4} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add Beat at End Button */}
          {isEditable && (
            <button
              type="button"
              onClick={handleAddBeatEnd}
              className="px-1.5 py-0.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] text-white/40 hover:text-white text-[10px] sm:text-[10.5px] font-medium flex items-center gap-0.5 transition-all cursor-pointer shrink-0"
              title="เพิ่มบีตใหม่ต่อท้าย"
            >
              <Plus size={9} strokeWidth={2} />
              <span>บีต</span>
            </button>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. BODY: THE 3 CORE ORGANS (APPROACH 1: ถ้าทำ... ถ้าไม่ทำ...)           */}
      {/* ===================================================================== */}
      {!isEditing ? (
        <div className="flex-1 flex flex-col justify-between gap-2 py-1 overflow-hidden">
          {/* Layer 1: 🎭 The Open Stage Direction (ผืนเรื่องเล่าแบบเปิด ไร้กรอบขัง) */}
          <div className="flex flex-col gap-1 px-1 py-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[#FF375F] text-[10px] font-mono">✦</span>
              <span className="text-[11px] font-medium text-white/50 tracking-wide">
                1. ตัวละครกำลังทำอะไร
              </span>
            </div>
            <p
              className={`text-[12px] sm:text-[12.5px] text-[#F1F1F4] font-normal leading-[19px] tracking-tight ${
                isExpandedCard ? 'leading-relaxed' : 'line-clamp-2'
              }`}
            >
              {currentBeat.actor_state || 'ยังไม่ได้ระบุท่าทางตัวละคร...'}
            </p>
          </div>

          {/* Layer 2: 🎯 The Choice Dock (ถาดทรงแคปซูลทางเลือก มีรูปทรงปุ่มชอยส์) */}
          <div className="rounded-[14px] bg-white/[0.04] border border-white/[0.08] p-2.5 flex flex-col gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-1.5 text-[#30D158]">
              <Target size={11.5} className="shrink-0" />
              <span className="text-[11px] font-semibold text-white/80 tracking-tight">
                2. ถ้าผู้เล่นทำแบบนี้
              </span>
            </div>

            {/* ✦ 1. ตอนหด (Collapsed): บรรทัดเดียวจบ [Pill] ➔ Feedback... [→ ไปต่อ] */}
            {!isExpandedCard ? (
              triggerEntries.length > 0 ? (
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Interactive Pill Button */}
                    <span className="px-2.5 py-0.5 rounded-full bg-white/[0.08] border border-white/15 text-[10.5px] sm:text-[11px] font-medium text-white shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                      {triggerEntries[0][0]}
                    </span>
                    {/* Feedback text: 1 line with truncate */}
                    {triggerEntries[0][1].feedback && (
                      <span className="text-[11px] sm:text-[11.5px] text-white/65 italic truncate">
                        ➔ {triggerEntries[0][1].feedback}
                      </span>
                    )}
                  </div>
                  {/* ปุ่มไปต่อ/อยู่ที่เดิม อยู่ตรงขวาสุดของการกระทำข้อนั้นโดยตรง */}
                  <span
                    className={`text-[9.5px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                      triggerEntries[0][1].action_result === 'loop' ||
                      (triggerEntries[0][1].action_result as string) === 'chaos_escalation'
                        ? 'text-[#FF9F0A] bg-[#FF9F0A]/12 border border-[#FF9F0A]/25'
                        : 'text-[#FF375F] bg-[#FF375F]/12 border border-[#FF375F]/25'
                    }`}
                  >
                    {triggerEntries[0][1].action_result === 'loop' ||
                    (triggerEntries[0][1].action_result as string) === 'chaos_escalation'
                      ? '↺ อยู่ที่เดิม'
                      : '→ ไปต่อ'}
                  </span>
                </div>
              ) : (
                <div className="text-[11px] text-white/40 italic">
                  ยังไม่ได้กำหนดทางเลือก
                </div>
              )
            ) : (
              /* ✦ 2. ตอนขยาย (Expanded): ปลดล็อคกล่องซ้อน ใช้ Hairline คั่นอย่างประณีต */
              <div className="flex flex-col divide-y divide-white/[0.06] pt-1">
                {triggerEntries.length > 0 ? (
                  triggerEntries.map(([key, val]) => {
                    const isLoop =
                      val.action_result === 'loop' ||
                      (val.action_result as string) === 'chaos_escalation';
                    return (
                      <div
                        key={key}
                        className="py-2 first:pt-0.5 last:pb-0 flex flex-col gap-1.5"
                      >
                        {/* แถวบน: ปุ่ม Pill ซ้าย <---------------> ปุ่มไปต่อ/อยู่ที่เดิม ขวา */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-white/[0.08] border border-white/15 text-[10.5px] sm:text-[11px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                            {key}
                          </span>
                          <span
                            className={`text-[9.5px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                              isLoop
                                ? 'text-[#FF9F0A] bg-[#FF9F0A]/12 border border-[#FF9F0A]/25'
                                : 'text-[#FF375F] bg-[#FF375F]/12 border border-[#FF375F]/25'
                            }`}
                          >
                            {isLoop ? '↺ อยู่ที่เดิม' : '→ ไปต่อ'}
                          </span>
                        </div>

                        {/* แถวล่าง: ข้อความตอบสนองแบบเต็มพื้นที่ 100% ไม่มีตัดคำ */}
                        {val.feedback && (
                          <p className="text-[11px] sm:text-[11.5px] text-white/70 italic leading-[18px] pl-1">
                            <span className="text-white/35 mr-1 font-mono not-italic">➔</span>
                            {val.feedback}
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-[11px] text-white/40 italic">
                    ยังไม่ได้กำหนดทางเลือก
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Layer 3: ⏱ The Pacing Footnote Strip (แถบสรุปจังหวะบางๆ ชิดล่าง) */}
          <div className="rounded-[10px] bg-white/[0.02] border border-white/[0.05] px-2.5 py-1.5 flex items-center gap-2">
            <div className="flex items-center gap-1 shrink-0 text-[#FF9F0A]">
              <Clock size={11} strokeWidth={2.2} />
              <span className="text-[10px] sm:text-[10.5px] font-mono text-[#FF9F0A]/85">
                ครบ {maxTurns} รอบ
              </span>
            </div>
            <p
              className={`text-[11px] sm:text-[11.5px] text-white/60 font-normal leading-[16px] tracking-tight min-w-0 flex-1 ${
                isExpandedCard ? 'leading-relaxed' : 'truncate'
              }`}
              title={
                currentBeat.pacing_control?.inevitable_consequence ||
                'เรื่องราวดำเนินสู่ขั้นถัดไปอัตโนมัติ'
              }
            >
              <span className="text-white/30 mr-1 font-mono">➔</span>
              {currentBeat.pacing_control?.inevitable_consequence ||
                'เรื่องราวดำเนินสู่ขั้นถัดไปอัตโนมัติ'}
            </p>
          </div>
        </div>
      ) : (
        /* =================================================================== */
        /* IN-PLACE INLINE EDIT MODE                                           */
        /* =================================================================== */
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 py-1 pr-1">
          {/* Edit Beat Title & Turns */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[9.5px] uppercase font-mono text-white/40 block mb-0.5">
                ชื่อบีต
              </label>
              <input
                type="text"
                value={editBeatId}
                onChange={(e) => setEditBeatId(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-[10px] px-2 py-1 text-[11px] text-white outline-none focus:border-[#EF264C]"
                placeholder="เช่น Beat 01: บรรยากาศเปิดตัว"
              />
            </div>
            <div className="w-[80px]">
              <label className="text-[9.5px] uppercase font-mono text-white/40 block mb-0.5">
                โควตา (รอบ)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={editMaxTurns}
                onChange={(e) => setEditMaxTurns(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-black/40 border border-white/15 rounded-[10px] px-2 py-1 text-[11px] text-white outline-none focus:border-[#EF264C]"
              />
            </div>
          </div>

          {/* Edit 1: ตัวละครกำลังทำอะไร */}
          <div>
            <label className="text-[9.5px] font-semibold text-[#F1F1F1] flex items-center gap-1 mb-0.5">
              <Sparkles size={10} className="text-[#EF264C]" />
              1. ตัวละครกำลังทำอะไร (สิ่งที่ทำเพื่อเปิดจังหวะ)
            </label>
            <textarea
              rows={2}
              value={editActorState}
              onChange={(e) => setEditActorState(e.target.value)}
              className="w-full bg-black/40 border border-white/15 rounded-[10px] p-2 text-[11px] text-white outline-none focus:border-[#EF264C] leading-relaxed resize-none custom-scrollbar"
              placeholder="บรรยายภาษากายและการกระทำของตัวละคร..."
            />
          </div>

          {/* Edit 2: ทางเลือกของผู้เล่น (เพิ่มได้ไม่จำกัด + Dropdown 'ไปต่อ' vs 'อยู่ที่เดิม') */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[9.5px] font-semibold text-emerald-400 flex items-center gap-1">
                <Target size={10} />
                2. ถ้าผู้เล่นทำแบบนี้ (กำหนดทางเลือก)
              </label>
              <button
                type="button"
                onClick={handleAddEditTrigger}
                className="text-[9.5px] text-[#EF264C] hover:text-white flex items-center gap-0.5 cursor-pointer"
              >
                <Plus size={10} />
                <span>เพิ่มทางเลือก</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {editTriggers.map((trg) => (
                <div key={trg.id} className="flex items-center gap-1 bg-black/30 p-1.5 rounded-[8px] border border-white/10">
                  <input
                    type="text"
                    value={trg.key}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditTriggers((prev) =>
                        prev.map((t) => (t.id === trg.id ? { ...t, key: val } : t))
                      );
                    }}
                    placeholder="คำทำ (เช่น เข้าใกล้)"
                    className="w-[90px] bg-black/40 border border-white/15 rounded px-1.5 py-0.5 text-[10.5px] text-white outline-none focus:border-emerald-400"
                  />
                  <input
                    type="text"
                    value={trg.feedback}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditTriggers((prev) =>
                        prev.map((t) => (t.id === trg.id ? { ...t, feedback: val } : t))
                      );
                    }}
                    placeholder="ผลตอบสนอง..."
                    className="flex-1 min-w-0 bg-black/40 border border-white/15 rounded px-1.5 py-0.5 text-[10.5px] text-white outline-none focus:border-emerald-400"
                  />
                  {/* Dropdown: ไปต่อ vs อยู่ที่เดิม */}
                  <select
                    value={trg.action}
                    onChange={(e) => {
                      const val = e.target.value as PlayerTriggerAction;
                      setEditTriggers((prev) =>
                        prev.map((t) => (t.id === trg.id ? { ...t, action: val } : t))
                      );
                    }}
                    className={`text-[9.5px] font-mono rounded px-1 py-0.5 border outline-none cursor-pointer bg-[#181820] ${
                      trg.action === 'loop'
                        ? 'text-amber-300 border-amber-500/30'
                        : 'text-[#EF264C] border-[#EF264C]/30'
                    }`}
                  >
                    <option value="progress">→ ไปต่อ</option>
                    <option value="loop">↺ อยู่ที่เดิม</option>
                  </select>
                  {editTriggers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEditTrigger(trg.id)}
                      className="text-white/30 hover:text-red-400 p-0.5 cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Edit 3: ถ้าผู้เล่นไม่ทำอะไร */}
          <div>
            <label className="text-[9.5px] font-semibold text-amber-300 flex items-center gap-1 mb-0.5">
              <Clock size={10} />
              3. ถ้าผู้เล่นไม่ทำอะไร (ครบโควตา เรื่องจะเดินต่อเองว่า)
            </label>
            <textarea
              rows={2}
              value={editConsequence}
              onChange={(e) => setEditConsequence(e.target.value)}
              className="w-full bg-black/40 border border-amber-500/30 rounded-[10px] p-2 text-[11px] text-white outline-none focus:border-amber-400 leading-relaxed resize-none custom-scrollbar"
              placeholder="เหตุการณ์ที่ตัวละครหรือโลกผลักดันเรื่องเองเมื่อครบโควตาคุยเล่น..."
            />
          </div>
        </div>
      )}


      {/* ===================================================================== */}
      {/* 4. THE RED EXPAND ORB (ปุ่มลูกศรลงสีแดงทรงกลมยืดการ์ดอ่านเต็มความยาว)      */}
      {/* ===================================================================== */}
      <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-30">
        <button
          type="button"
          onClick={() => setIsExpandedCard(!isExpandedCard)}
          className="w-7 h-7 rounded-full bg-[#141419] border-2 border-[#EF264C] text-[#EF264C] hover:bg-[#EF264C] hover:text-white shadow-[0_2px_12px_rgba(239,38,76,0.45)] flex items-center justify-center transition-all cursor-pointer active:scale-90"
          title={isExpandedCard ? 'พับเก็บการ์ดสู่ขนาดกะทัดรัด' : 'ยืดการ์ดอ่านเต็มความยาวจริง'}
        >
          {isExpandedCard ? (
            <ChevronUp size={13} strokeWidth={2.8} />
          ) : (
            <ChevronDown size={13} strokeWidth={2.8} />
          )}
        </button>
      </div>
    </div>
  );
}
