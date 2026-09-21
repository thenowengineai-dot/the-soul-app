import { useState } from 'react';
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
  scene_id: 'scene_01_herbal_chamber',
  title: 'ฉากที่ 1: บททดสอบในห้องสกัดสมุนไพร',
  location_key: 'ห้องสกัดสมุนไพร ณ เรือนพักปีกใน',
  scene_objective: 'นำตัวอย่างสมุนไพรเฟิร์นหมอกอัคคีมาทำการสกัด และประเมินท่าทีของรุ่นพี่มาฮิโระ',
  forced_chaos_level: 'low',
  event_mood: 'สลัว อึดอัด ชื้นแฉะ และอันตราย',
  director_vision: 'The Slow Burn: ดึงจังหวะให้ช้า เน้นเสียงลมหายใจและระยะประชิด',
  director_setup: 'เสียงฝนกระหน่ำหลังคาไม้สนดังกึกก้อง ตะเกียงน้ำมันส้มสลัวทอดเงายาวไปถึงผนังห้อง',
  premise: 'เมื่อบานเลื่อนห้องพักปีกในถูกลงกลอนไม้ ทั้งคู่ต้องเผชิญหน้ากันข้ามโต๊ะทดลองแคบ 6 เสื่อทาทามิ',
  beats: [
    {
      beat_id: 'Beat 01: บรรยากาศเปิดตัวและละอองฝน',
      actor_state: 'นั่งก้มหน้านิ่งใช้นิ้วดันดั้งแว่นด้วยความประหม่า เสื้อเชิ้ตขาวบางเปียกชื้นแนบเนื้อ',
      hidden_evaluation_criteria: {
        'เข้าใกล้': { action_result: 'progress', feedback: 'เธอสะดุ้งเล็กน้อยแต่ไม่ขยับหนี' },
        'ยืนมองเฉยๆ': { action_result: 'loop', feedback: 'เธอแอบชำเลืองมองก่อนจะก้มหน้าเงียบ' },
      },
      pacing_control: {
        max_turns: 3,
        action_result: 'progress',
        inevitable_consequence: 'ละอองเกสรเริ่มส่งผลต่อสติสัมปชัญญะ',
      },
    },
    {
      beat_id: 'Beat 02: สัมผัสแรกข้ามโต๊ะทดลอง',
      actor_state: 'ค่อยๆ วางโกร่งบดยาหินลงข้างโต๊ะ ปลายนิ้วแตะที่ขอบถ้วยชาอุ่น จ้องมองมาที่คุณ',
      hidden_evaluation_criteria: {
        'แตะมือ': { action_result: 'progress', feedback: 'เธอส่งเสียงกระซิบในลำคอ' },
      },
      pacing_control: {
        max_turns: 3,
        action_result: 'progress',
        inevitable_consequence: 'พายุตัดสะพานข้ามหุบเขา ขังทั้งสองไว้ตลอดคืน',
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
              className="text-left flex items-center gap-1 text-[11px] text-white/50 hover:text-white transition-colors truncate cursor-pointer group/scn"
            >
              <span className="truncate max-w-[120px] font-medium text-white/70 group-hover/scn:text-white">
                {currentScene.title || `ฉากที่ ${selectedSceneIndex + 1}`}
              </span>
              <ChevronDown size={11} className="text-white/40 shrink-0" />
            </button>

            {/* Scene Selector Popup */}
            {isSelectingScene && (
              <div className="absolute left-0 top-full mt-1 w-[200px] rounded-[14px] bg-[#181820] border border-white/15 shadow-[0_12px_36px_rgba(0,0,0,0.85)] p-1 z-30 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[9.5px] uppercase font-mono text-white/40 px-2 py-1">
                  เลือกฉาก
                </div>
                {scenes.map((sc, scIdx) => (
                  <button
                    key={sc.scene_id || scIdx}
                    type="button"
                    onClick={() => {
                      setSelectedSceneIndex(scIdx);
                      setSelectedBeatIndex(0);
                      setIsSelectingScene(false);
                      setIsEditing(false);
                    }}
                    className={`w-full text-left px-2 py-1 rounded-[8px] text-[11px] transition-colors truncate cursor-pointer ${
                      scIdx === selectedSceneIndex
                        ? 'bg-[#EF264C]/20 text-white font-medium'
                        : 'text-white/70 hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    {sc.title || `ฉากที่ ${scIdx + 1}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Turn Quota Dot Badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] shrink-0"
            title={`โควตาคุยเล่น: ${maxTurns} รอบ`}
          >
            <span className="text-[10px] font-medium text-white/50">
              โควตา: {maxTurns} รอบ
            </span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: Math.min(5, maxTurns) }).map((_, dotIdx) => (
                <div
                  key={dotIdx}
                  className={`w-1.5 h-1.5 rounded-full ${
                    dotIdx < 2
                      ? 'bg-[#EF264C] shadow-[0_0_4px_rgba(239,38,76,0.6)]'
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
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
                  className="w-3.5 h-3.5 rounded-full bg-white/[0.04] hover:bg-[#EF264C]/30 text-white/30 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                  title={`แทรกบีตคั่นกลางระหว่างบีต ${bIdx} และ ${bIdx + 1}`}
                >
                  <Plus size={8} strokeWidth={2.5} />
                </button>
              )}

              {/* Beat Pill with Reorder Controls when active */}
              <div
                onClick={() => handleSelectBeat(bIdx)}
                className={`px-2 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
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
                    className="w-3.5 h-3.5 rounded hover:bg-white/20 flex items-center justify-center disabled:opacity-20 cursor-pointer transition-colors"
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
                    className="w-3.5 h-3.5 rounded hover:bg-white/20 flex items-center justify-center disabled:opacity-20 cursor-pointer transition-colors"
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
              className="w-6 h-6 rounded-full bg-white/[0.03] hover:bg-white/[0.10] border border-dashed border-white/20 text-white/50 hover:text-white flex items-center justify-center cursor-pointer shrink-0 transition-all ml-0.5"
              title="เพิ่มบีตใหม่ต่อท้าย"
            >
              <Plus size={11} strokeWidth={2.2} />
            </button>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. BODY: THE 3 CORE ORGANS (APPROACH 1: ถ้าทำ... ถ้าไม่ทำ...)           */}
      {/* ===================================================================== */}
      {!isEditing ? (
        <div className="flex-1 flex flex-col justify-between py-1.5 gap-2">
          {/* Organ 1: 🎭 ตัวละครกำลังทำอะไร (What character does) */}
          <div className="rounded-[16px] bg-white/[0.03] border border-white/[0.07] px-3 py-2 flex flex-col gap-1 transition-colors hover:border-white/12">
            <div className="flex items-center gap-1.5 text-white/50">
              <Sparkles size={11} className="text-[#EF264C]" />
              <span className="text-[10.5px] font-semibold text-[#F1F1F1] tracking-tight">
                1. ตัวละครกำลังทำอะไร
              </span>
            </div>
            <p
              className={`text-[11.5px] text-[#EDEDED] leading-[18px] ${
                isExpandedCard ? '' : 'line-clamp-3'
              }`}
            >
              {currentBeat.actor_state || 'ยังไม่ได้ระบุท่าทางตัวละคร...'}
            </p>
          </div>

          {/* Organ 2: 🎯 ถ้าผู้เล่นทำแบบนี้ (เรื่องจะไปต่อทันที) */}
          <div className="rounded-[14px] bg-white/[0.03] border border-white/[0.07] px-3 py-1.5 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Target size={11} />
              <span className="text-[10px] font-semibold text-[#F1F1F1] tracking-tight">
                {isExpandedCard
                  ? '2. ถ้าผู้เล่นทำแบบนี้ (เรื่องจะไปต่อทันที)'
                  : '2. ถ้าผู้เล่นทำแบบนี้...'}
              </span>
            </div>

            {/* List of Triggers */}
            <div className="space-y-1">
              {triggerEntries.length > 0 ? (
                (isExpandedCard ? triggerEntries : triggerEntries.slice(0, 1)).map(([key, val]) => {
                  const isLoop = val.action_result === 'loop';
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-1.5 text-[10.5px] min-w-0"
                    >
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.07] border border-white/10 font-medium text-white shrink-0">
                          {key}
                        </span>
                        {val.feedback && (
                          <span className="text-white/60 italic truncate">
                            ➔ {val.feedback}
                          </span>
                        )}
                      </div>
                      {/* Action Result Badge: ไปต่อ vs อยู่ที่เดิม */}
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full shrink-0 ${
                          isLoop
                            ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30'
                            : 'text-[#EF264C] bg-[#EF264C]/15 border border-[#EF264C]/30'
                        }`}
                      >
                        {isLoop ? '↺ อยู่ที่เดิม' : '→ ไปต่อ'}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-[10.5px] text-white/40 italic">
                  ยังไม่ได้กำหนดทางเลือก
                </div>
              )}
              {!isExpandedCard && triggerEntries.length > 1 && (
                <div className="text-[9.5px] text-white/35 italic pt-0.5">
                  + อีก {triggerEntries.length - 1} ทางเลือก (แตะลูกศรแดงเพื่อดูทั้งหมด)
                </div>
              )}
            </div>
          </div>

          {/* Organ 3: ⏳ ถ้าผู้เล่นไม่ทำอะไร (คุยครบ X รอบ เรื่องจะเดินต่อเองว่า) */}
          <div className="rounded-[14px] bg-amber-500/[0.03] border border-amber-500/20 px-3 py-1.5 flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Clock size={11} />
              <span className="text-[10px] font-semibold text-amber-300 tracking-tight">
                {isExpandedCard
                  ? `3. ถ้าผู้เล่นไม่ทำอะไร (คุยครบ ${maxTurns} รอบ เรื่องจะเดินต่อเองว่า)`
                  : '3. ถ้าผู้เล่นไม่ทำอะไร...'}
              </span>
            </div>
            <p
              className={`text-[11px] text-[#EDEDED] leading-[17px] ${
                isExpandedCard ? '' : 'line-clamp-2'
              }`}
            >
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
      {/* 3. CARD FOOTER: BEAT STATUS                                           */}
      {/* ===================================================================== */}
      <div className="shrink-0 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-white/35 font-mono">
        <span>
          บีต {safeBeatIndex + 1} จาก {beats.length}
        </span>
        <span className="text-[#EF264C]/70">W4: THE CINEMATIC BEAT</span>
      </div>

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
