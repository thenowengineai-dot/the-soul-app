import { useState, type MouseEvent } from 'react';
import {
  GripHorizontal,
  MapPin,
  Sparkles,
  Target,
  Clock,
  Pencil,
  Trash2,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import type { WorldScene, WorldBeat, WorldLocationsMap, PlayerTriggerAction } from '../../types';

interface SceneNodeCardProps {
  scene: WorldScene;
  index: number;
  availableLocations?: WorldLocationsMap;
  onUpdateScene: (updated: WorldScene) => void;
  onDeleteScene: () => void;
  onStartDrag: (e: MouseEvent, sceneId: string) => void;
  isEditable?: boolean;
}

interface EditTriggerItem {
  id: string;
  key: string;
  feedback: string;
  action: PlayerTriggerAction;
}

export default function SceneNodeCard({
  scene,
  index,
  availableLocations,
  onUpdateScene,
  onDeleteScene,
  onStartDrag,
  isEditable = true,
}: SceneNodeCardProps) {
  const [activeBeatIndex, setActiveBeatIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpandedCard, setIsExpandedCard] = useState(false);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);

  const beats = scene.beats && scene.beats.length > 0 ? scene.beats : [];
  const safeBeatIndex = Math.min(activeBeatIndex, Math.max(0, beats.length - 1));
  const currentBeat: WorldBeat | undefined = beats[safeBeatIndex];

  const locKeys = availableLocations ? Object.keys(availableLocations) : [];
  const currentLocationKey = scene.location_key || locKeys[0] || 'ยังไม่ได้ระบุสถานที่';

  // Edit Form States
  const [actorStateText, setActorStateText] = useState('');
  const [maxTurns, setMaxTurns] = useState(3);
  const [consequenceText, setConsequenceText] = useState('');
  const [editTriggers, setEditTriggers] = useState<EditTriggerItem[]>([]);

  const handleStartEdit = () => {
    if (!currentBeat) return;
    setActorStateText(currentBeat.actor_state || '');
    setMaxTurns(currentBeat.pacing_control?.max_turns || 3);
    setConsequenceText(currentBeat.pacing_control?.inevitable_consequence || '');

    const entries = Object.entries(currentBeat.hidden_evaluation_criteria || {});
    if (entries.length > 0) {
      setEditTriggers(
        entries.map(([k, v], idx) => ({
          id: `trig_${idx}_${Date.now()}`,
          key: k,
          feedback: v.feedback || '',
          action: (v.action_result || 'progress') as PlayerTriggerAction,
        }))
      );
    } else {
      setEditTriggers([
        {
          id: `trig_0_${Date.now()}`,
          key: 'ยอมรับข้อเสนอ',
          feedback: 'เรื่องราวดำเนินสู่ขั้นต่อไป',
          action: 'progress',
        },
      ]);
    }
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    if (!currentBeat) return;

    const triggerMap: Record<string, { action_result: PlayerTriggerAction; feedback?: string }> = {};
    editTriggers.forEach((t) => {
      const trimmedKey = t.key.trim();
      if (trimmedKey) {
        triggerMap[trimmedKey] = {
          action_result: t.action,
          feedback: t.feedback.trim() || undefined,
        };
      }
    });

    const updatedBeat: WorldBeat = {
      ...currentBeat,
      actor_state: actorStateText.trim(),
      hidden_evaluation_criteria: triggerMap,
      pacing_control: {
        max_turns: maxTurns,
        action_result: currentBeat.pacing_control?.action_result || 'progress',
        inevitable_consequence: consequenceText.trim(),
      },
    };

    const updatedBeats = [...beats];
    updatedBeats[safeBeatIndex] = updatedBeat;
    onUpdateScene({
      ...scene,
      beats: updatedBeats,
    });
  };

  const handleSelectLocation = (locKey: string) => {
    setIsSelectingLocation(false);
    onUpdateScene({
      ...scene,
      location_key: locKey,
    });
  };

  // Beat Management: Reorder, Insert, Add, Delete
  const handleMoveBeatLeft = (bIdx: number) => {
    if (bIdx <= 0) return;
    const updatedBeats = [...beats];
    const temp = updatedBeats[bIdx - 1];
    updatedBeats[bIdx - 1] = updatedBeats[bIdx];
    updatedBeats[bIdx] = temp;
    onUpdateScene({ ...scene, beats: updatedBeats });
    setActiveBeatIndex(bIdx - 1);
  };

  const handleMoveBeatRight = (bIdx: number) => {
    if (bIdx >= beats.length - 1) return;
    const updatedBeats = [...beats];
    const temp = updatedBeats[bIdx + 1];
    updatedBeats[bIdx + 1] = updatedBeats[bIdx];
    updatedBeats[bIdx] = temp;
    onUpdateScene({ ...scene, beats: updatedBeats });
    setActiveBeatIndex(bIdx + 1);
  };

  const handleInsertBeatAfter = (bIdx: number) => {
    const newBeat: WorldBeat = {
      beat_id: `scene_${index + 1}_beat_${beats.length + 1}`,
      actor_state: 'Player Anchor: ตัวละครแสดงภาษากายและท่าทางใหม่อย่างน่าค้นหา...',
      hidden_evaluation_criteria: {
        'ตอบรับ': { action_result: 'progress', feedback: 'ตัวละครมีท่าทีผ่อนคลาย' },
      },
      pacing_control: {
        max_turns: 3,
        action_result: 'progress',
        inevitable_consequence: 'เรื่องราวดำเนินสู่ขั้นต่อไปอย่างราบรื่น',
      },
    };
    const updatedBeats = [...beats];
    updatedBeats.splice(bIdx + 1, 0, newBeat);
    onUpdateScene({ ...scene, beats: updatedBeats });
    setActiveBeatIndex(bIdx + 1);
  };

  const handleAddBeatEnd = () => {
    handleInsertBeatAfter(beats.length - 1);
  };

  const handleDeleteCurrentBeat = () => {
    if (beats.length <= 1) return;
    const updatedBeats = beats.filter((_, idx) => idx !== safeBeatIndex);
    onUpdateScene({ ...scene, beats: updatedBeats });
    setActiveBeatIndex(Math.max(0, safeBeatIndex - 1));
  };

  const triggerEntries = currentBeat?.hidden_evaluation_criteria
    ? Object.entries(currentBeat.hidden_evaluation_criteria)
    : [];

  return (
    <div
      className={`absolute w-[360px] sm:w-[380px] rounded-[24px] bg-[#141419]/95 backdrop-blur-2xl border border-white/12 shadow-[0_16px_48px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.12)] flex flex-col transition-all duration-200 hover:border-white/20 select-none group/node ${
        isExpandedCard || isEditing ? 'min-h-[346px] h-auto pb-6' : 'h-[346px] pb-4'
      }`}
      style={{
        left: scene.position?.x ?? 80 + index * 460,
        top: scene.position?.y ?? 100,
      }}
    >
      {/* ✦ RAIL CONNECTOR PORTS (PORTS FOR SVG BEZIER RAILS) */}
      {/* Input Port (Left) */}
      <div
        className="absolute -left-[9px] top-6 w-[18px] h-[18px] rounded-full bg-[#1A1A22] border-2 border-white/40 group-hover/node:border-[#EF264C] shadow-[0_0_8px_rgba(239,38,76,0.3)] flex items-center justify-center pointer-events-none z-10"
        title="Input Port (รับขบวนรถไฟจากฉากก่อนหน้า)"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-[#EF264C]" />
      </div>

      {/* Output Port (Right) */}
      <div
        className="absolute -right-[9px] top-6 w-[18px] h-[18px] rounded-full bg-[#1A1A22] border-2 border-white/40 group-hover/node:border-[#EF264C] shadow-[0_0_8px_rgba(239,38,76,0.3)] flex items-center justify-center pointer-events-none z-10"
        title="Output Port (ส่งรางรถไฟต่อไปยังฉากถัดไป)"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-[#EF264C]" />
      </div>

      {/* ✦ 1. DRAGGABLE SCENE HEADER BAR */}
      <div
        onMouseDown={(e) => onStartDrag(e, scene.scene_id)}
        className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing bg-white/[0.02] hover:bg-white/[0.04] rounded-t-[24px] transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <GripHorizontal size={14} className="text-white/30 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#EF264C] font-semibold">
                SCENE {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-white/20 text-[10px]">•</span>
              {/* Location Badge with Selector Dropdown */}
              <div className="relative inline-block min-w-0">
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => setIsSelectingLocation(!isSelectingLocation)}
                  className="flex items-center gap-1 text-[11px] text-emerald-400/90 hover:text-emerald-300 transition-colors cursor-pointer"
                  title="คลิกเพื่อเปลี่ยนสถานที่ของฉากนี้"
                >
                  <MapPin size={10} className="shrink-0" />
                  <span className="truncate max-w-[130px] font-medium">
                    {currentLocationKey}
                  </span>
                  <ChevronDown size={10} className="text-white/40 shrink-0" />
                </button>

                {/* Location Picker Popup */}
                {isSelectingLocation && (
                  <div
                    onMouseDown={(e) => e.stopPropagation()}
                    className="absolute left-0 top-full mt-1.5 w-[220px] rounded-[16px] bg-[#181820] border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.8)] p-1.5 z-40 space-y-1 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="text-[10px] uppercase font-mono text-white/40 px-2 py-1">
                      เลือกสถานที่ผูกกับฉากนี้
                    </div>
                    {locKeys.map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectLocation(key)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-[10px] text-[11.5px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                          key === currentLocationKey
                            ? 'bg-[#EF264C]/20 text-white border border-[#EF264C]/30'
                            : 'text-white/70 hover:bg-white/[0.08] hover:text-white'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span className="truncate">{key}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-[13px] sm:text-[13.5px] font-semibold text-[#F1F1F1] tracking-tight truncate mt-0.5">
              {scene.title || `ฉากที่ ${index + 1}`}
            </h3>
          </div>
        </div>

        {/* Header Right: Pacing Quota & Action Controls */}
        <div
          className="flex items-center gap-1.5 shrink-0"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Turn Quota Pill */}
          <div className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 flex items-center gap-1 text-[10.5px] text-white/60 font-medium">
            <span>โควตา: {currentBeat?.pacing_control?.max_turns || 3} รอบ</span>
            <span className="flex items-center gap-0.5 text-[#EF264C] text-[9px]">
              ●●○
            </span>
          </div>

          {/* Edit / Save Button */}
          {isEditable && (
            <>
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="w-6 h-6 rounded-full bg-[#EF264C] text-white flex items-center justify-center cursor-pointer shadow-[0_2px_8px_rgba(239,38,76,0.4)] active:scale-95 transition-all"
                  title="บันทึกการแก้ไขบีต"
                >
                  <Check size={11} strokeWidth={2.4} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="w-6 h-6 rounded-full bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 text-white/60 hover:text-white flex items-center justify-center cursor-pointer transition-all"
                  title="แก้ไขบีตนี้"
                >
                  <Pencil size={10} strokeWidth={2} />
                </button>
              )}

              {/* Delete Beat or Scene */}
              <button
                type="button"
                onClick={beats.length > 1 ? handleDeleteCurrentBeat : onDeleteScene}
                className="w-6 h-6 rounded-full bg-white/[0.04] hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white/40 hover:text-red-300 flex items-center justify-center cursor-pointer transition-all"
                title={beats.length > 1 ? 'ลบบีตนี้' : 'ลบฉากนี้'}
              >
                <Trash2 size={10} strokeWidth={2} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ✦ 2. BEAT SELECTOR PILL DOCK (REORDER CONTROLS & MID-PILL INSERTION) */}
      <div className="px-4 py-2 border-b border-white/[0.06] bg-black/20 flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar select-none">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {beats.map((_, bIdx) => (
            <div key={bIdx} className="flex items-center gap-1 shrink-0">
              {/* Mid-Pill Insertion Button [+] */}
              {isEditable && bIdx > 0 && (
                <button
                  type="button"
                  onClick={() => handleInsertBeatAfter(bIdx - 1)}
                  className="w-4 h-4 rounded-full bg-white/[0.04] hover:bg-[#EF264C]/30 text-white/30 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                  title={`แทรกบีตคั่นกลางระหว่างบีต ${bIdx} และ ${bIdx + 1}`}
                >
                  <Plus size={9} strokeWidth={2.5} />
                </button>
              )}

              {/* Beat Pill with Reorder Controls when active */}
              <div
                onClick={() => setActiveBeatIndex(bIdx)}
                className={`px-2.5 py-1 rounded-full text-[11.5px] sm:text-[12px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
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
                    <ChevronLeft size={10} strokeWidth={2.4} />
                  </button>
                )}

                <span className="text-[#EF264C] text-[10px] font-mono">✦</span>
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
                    <ChevronRight size={10} strokeWidth={2.4} />
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

      {/* ✦ 3. BODY: THE 3 CORE DRAMATIC ORGANS (APPROACH 1) */}
      {!isEditing ? (
        <div className="flex-1 flex flex-col justify-between p-3.5 gap-2 overflow-hidden">
          {/* Organ 1: 🎭 ตัวละครกำลังทำอะไร */}
          <div className="rounded-[16px] bg-white/[0.03] border border-white/[0.07] px-3.5 py-2.5 flex flex-col gap-1.5 transition-colors hover:border-white/12">
            <div className="flex items-center gap-1.5 text-white/60">
              <Sparkles size={13} className="text-[#EF264C]" />
              <span className="text-[12px] sm:text-[12.5px] font-semibold text-[#F1F1F1] tracking-tight">
                1. ตัวละครกำลังทำอะไร
              </span>
            </div>
            <p
              className={`text-[12.5px] sm:text-[13px] text-[#EDEDED] font-normal leading-[20px] tracking-tight ${
                isExpandedCard ? '' : 'line-clamp-3'
              }`}
            >
              {currentBeat?.actor_state || 'ยังไม่ได้ระบุท่าทางตัวละคร...'}
            </p>
          </div>

          {/* Organ 2: 🎯 ถ้าผู้เล่นทำแบบนี้ (เรื่องจะไปต่อทันที) */}
          <div className="rounded-[14px] bg-white/[0.03] border border-white/[0.07] px-3.5 py-2 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Target size={13} />
              <span className="text-[12px] sm:text-[12.5px] font-semibold text-[#F1F1F1] tracking-tight">
                {isExpandedCard
                  ? '2. ถ้าผู้เล่นทำแบบนี้ (เรื่องจะไปต่อทันที)'
                  : '2. ถ้าผู้เล่นทำแบบนี้...'}
              </span>
            </div>

            {/* List of Triggers */}
            <div className="space-y-1.5">
              {triggerEntries.length > 0 ? (
                (isExpandedCard ? triggerEntries : triggerEntries.slice(0, 1)).map(([key, val]) => {
                  const isLoop =
                    val.action_result === 'loop' ||
                    (val.action_result as string) === 'chaos_escalation';
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-2 text-[12px] min-w-0"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/[0.07] border border-white/10 font-medium text-white text-[11.5px] shrink-0">
                          {key}
                        </span>
                        {val.feedback && (
                          <span className="text-[12px] text-white/70 italic truncate">
                            ➔ {val.feedback}
                          </span>
                        )}
                      </div>
                      {/* Action Result Badge: ไปต่อ vs อยู่ที่เดิม */}
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
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
                <div className="text-[12px] text-white/40 italic">
                  ยังไม่ได้กำหนดทางเลือก
                </div>
              )}
              {!isExpandedCard && triggerEntries.length > 1 && (
                <div className="text-[11px] text-white/40 italic pt-0.5">
                  + อีก {triggerEntries.length - 1} ทางเลือก (แตะลูกศรแดงเพื่อดูทั้งหมด)
                </div>
              )}
            </div>
          </div>

          {/* Organ 3: ⏳ ถ้าผู้เล่นไม่ทำอะไร */}
          <div className="rounded-[14px] bg-amber-500/[0.03] border border-amber-500/20 px-3.5 py-2 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Clock size={13} />
              <span className="text-[12px] sm:text-[12.5px] font-semibold text-amber-300 tracking-tight">
                {isExpandedCard
                  ? `3. ถ้าผู้เล่นไม่ทำอะไร (คุยครบ ${maxTurns} รอบ เรื่องจะเดินต่อเองว่า)`
                  : '3. ถ้าผู้เล่นไม่ทำอะไร...'}
              </span>
            </div>
            <p
              className={`text-[12.5px] text-[#EDEDED] font-normal leading-[19px] tracking-tight ${
                isExpandedCard ? '' : 'line-clamp-2'
              }`}
            >
              {currentBeat?.pacing_control?.inevitable_consequence || 'ยังไม่ได้ระบุจุดจบเทิร์น...'}
            </p>
          </div>
        </div>
      ) : (
        /* ===================================================================== */
        /* ✦ IN-PLACE EDIT MODE                                                  */
        /* ===================================================================== */
        <div className="flex-1 flex flex-col gap-3 p-3.5 overflow-y-auto custom-scrollbar">
          {/* 1. Edit Actor State */}
          <div className="flex flex-col gap-1">
            <label className="text-[11.5px] font-semibold text-white/70 flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#EF264C]" />
              <span>1. ตัวละครกำลังทำอะไร (Actor State)</span>
            </label>
            <textarea
              value={actorStateText}
              onChange={(e) => setActorStateText(e.target.value)}
              rows={3}
              placeholder="ภาษากาย สรีระ 4 มิติ และการตอบสนองของตัวละคร..."
              className="w-full rounded-[12px] bg-black/40 border border-white/15 focus:border-[#EF264C] p-2.5 text-[12px] text-white outline-none resize-none leading-relaxed"
            />
          </div>

          {/* 2. Edit Triggers List */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11.5px] font-semibold text-white/70 flex items-center gap-1.5">
                <Target size={12} className="text-emerald-400" />
                <span>2. ถ้าผู้เล่นทำแบบนี้ (ทางเลือกและการตอบสนอง)</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setEditTriggers([
                    ...editTriggers,
                    {
                      id: `trig_${Date.now()}`,
                      key: '',
                      feedback: '',
                      action: 'progress',
                    },
                  ])
                }
                className="px-2 py-0.5 rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-[10.5px] font-medium flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus size={10} />
                <span>เพิ่มทางเลือก</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {editTriggers.map((t, idx) => (
                <div
                  key={t.id}
                  className="rounded-[12px] bg-black/30 border border-white/10 p-2 flex flex-col gap-1.5"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={t.key}
                      onChange={(e) => {
                        const updated = [...editTriggers];
                        updated[idx].key = e.target.value;
                        setEditTriggers(updated);
                      }}
                      placeholder={`คำที่ผู้เล่นทำ เช่น 'เข้าใกล้'`}
                      className="flex-1 bg-black/50 border border-white/15 rounded-[8px] px-2 py-1 text-[11.5px] text-white outline-none"
                    />

                    {/* Action Dropdown: ไปต่อ vs อยู่ที่เดิม */}
                    <select
                      value={t.action}
                      onChange={(e) => {
                        const updated = [...editTriggers];
                        updated[idx].action = e.target.value as PlayerTriggerAction;
                        setEditTriggers(updated);
                      }}
                      className="bg-[#181820] border border-white/20 rounded-[8px] px-2 py-1 text-[11px] text-white outline-none cursor-pointer"
                    >
                      <option value="progress">→ ไปต่อ (ปลดล็อกบีตถัดไป)</option>
                      <option value="loop">↺ อยู่ที่เดิม (คุยเล่น/รอดูเชิง)</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setEditTriggers(editTriggers.filter((_, i) => i !== idx))}
                      className="w-5 h-5 rounded-full hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                      title="ลบทางเลือกนี้"
                    >
                      <X size={11} />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={t.feedback}
                    onChange={(e) => {
                      const updated = [...editTriggers];
                      updated[idx].feedback = e.target.value;
                      setEditTriggers(updated);
                    }}
                    placeholder="เสียงตอบสนองสั้นๆ ของตัวละคร..."
                    className="w-full bg-black/40 border border-white/10 rounded-[8px] px-2 py-1 text-[11px] text-white/70 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 3. Edit Timeout & Consequence */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11.5px] font-semibold text-white/70 flex items-center gap-1.5">
                <Clock size={12} className="text-amber-400" />
                <span>3. ถ้าผู้เล่นไม่ทำอะไร (Timeout Consequence)</span>
              </label>
              <div className="flex items-center gap-1">
                <span className="text-[10.5px] text-white/40">คุยได้:</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={maxTurns}
                  onChange={(e) => setMaxTurns(Number(e.target.value))}
                  className="w-10 bg-black/50 border border-white/20 rounded px-1.5 py-0.5 text-[11px] text-center text-white outline-none"
                />
                <span className="text-[10.5px] text-white/40">รอบ</span>
              </div>
            </div>
            <textarea
              value={consequenceText}
              onChange={(e) => setConsequenceText(e.target.value)}
              rows={2}
              placeholder="เมื่อคุยครบโควตา เรื่องจะเดินต่อเองว่า..."
              className="w-full rounded-[12px] bg-black/40 border border-white/15 focus:border-[#EF264C] p-2.5 text-[12px] text-white outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Edit Buttons */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.10] text-white/70 text-[11.5px] font-medium transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="px-4 py-1.5 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white text-[11.5px] font-semibold flex items-center gap-1.5 shadow-[0_2px_8px_rgba(239,38,76,0.35)] transition-all cursor-pointer"
            >
              <Check size={12} strokeWidth={2.4} />
              <span>บันทึกบีต</span>
            </button>
          </div>
        </div>
      )}

      {/* ✦ 4. THE RED EXPAND ORB (ปุ่มลูกศรแดงยืดการ์ดอ่านเต็มความยาว) */}
      {!isEditing && (
        <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsExpandedCard(!isExpandedCard)}
            className="w-7 h-7 rounded-full bg-[#181822] hover:bg-[#EF264C] border border-[#EF264C]/60 hover:border-white text-white/85 hover:text-white flex items-center justify-center shadow-[0_4px_14px_rgba(239,38,76,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] hover:scale-110 active:scale-95 transition-all cursor-pointer group"
            title={isExpandedCard ? 'ย่อการ์ดกลับขนาดเดิม' : 'ยืดการ์ดเพื่ออ่านข้อความเต็มทั้งหมด'}
          >
            {isExpandedCard ? (
              <ChevronUp size={14} strokeWidth={2.6} className="text-[#EF264C] group-hover:text-white" />
            ) : (
              <ChevronDown size={14} strokeWidth={2.6} className="text-[#EF264C] group-hover:text-white" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
