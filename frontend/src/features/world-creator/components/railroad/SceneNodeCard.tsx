import { useState, type MouseEvent } from 'react';
import {
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
import { getCleanSceneTitle, SCENE_STEP_X } from './RailroadCableOverlay';

interface SceneNodeCardProps {
  scene: WorldScene;
  index: number;
  availableLocations?: WorldLocationsMap;
  sceneOrder?: number | null;
  hasIncomingCable?: boolean;
  hasOutgoingCable?: boolean;
  isDropTarget?: boolean;
  isLocationDropTarget?: boolean;
  onUpdateScene: (updated: WorldScene) => void;
  onDeleteScene: () => void;
  onStartDrag: (e: MouseEvent, sceneId: string) => void;
  onStartDragWire?: (e: MouseEvent, sceneId: string) => void;
  onStartDetachIncoming?: (e: MouseEvent, sceneId: string) => void;
  onDetachLocation?: (sceneId: string) => void;
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
  sceneOrder = null,
  hasIncomingCable = false,
  hasOutgoingCable = false,
  isDropTarget = false,
  isLocationDropTarget = false,
  onUpdateScene,
  onDeleteScene,
  onStartDrag,
  onStartDragWire,
  onStartDetachIncoming,
  onDetachLocation,
  isEditable = true,
}: SceneNodeCardProps) {
  const [activeBeatIndex, setActiveBeatIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpandedCard, setIsExpandedCard] = useState(false);

  const beats = scene.beats && scene.beats.length > 0 ? scene.beats : [];
  const safeBeatIndex = Math.min(activeBeatIndex, Math.max(0, beats.length - 1));
  const currentBeat: WorldBeat | undefined = beats[safeBeatIndex];

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
    if (beats.length <= 1) {
      onDeleteScene();
      return;
    }
    const updatedBeats = beats.filter((_, idx) => idx !== safeBeatIndex);
    onUpdateScene({ ...scene, beats: updatedBeats });
    setActiveBeatIndex(Math.max(0, safeBeatIndex - 1));
  };

  const triggerEntries = currentBeat?.hidden_evaluation_criteria
    ? Object.entries(currentBeat.hidden_evaluation_criteria)
    : [];
  const displayTurns = currentBeat?.pacing_control?.max_turns || 3;

  const cleanTitle = getCleanSceneTitle(scene.title);
  const displayTitle = sceneOrder
    ? `ฉากที่ ${sceneOrder}: ${cleanTitle || 'สถานการณ์'}`
    : cleanTitle || 'ฉากอิสระ';

  return (
    <div
      className={`absolute w-[346px] rounded-[28px] bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all select-none group/node ${
        isDropTarget
          ? 'border-[#FF375F] ring-2 ring-[#FF375F]/40 shadow-[0_8px_32px_rgba(255,55,95,0.3),inset_0_1px_0_rgba(255,255,255,0.12)] z-30'
          : isLocationDropTarget
          ? 'border-[#30D158] ring-2 ring-[#30D158]/40 shadow-[0_8px_32px_rgba(48,209,88,0.25),inset_0_1px_0_rgba(255,255,255,0.12)] z-30'
          : 'border-white/[0.10] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]'
      } ${isExpandedCard ? 'min-h-[346px] h-auto pb-9 z-20' : isEditing ? 'min-h-[346px] h-auto pb-6 z-20' : 'h-[346px] pb-9 sm:pb-9'}`}
      style={{
        left: `${scene.position?.x ?? 80 + index * SCENE_STEP_X}px`,
        top: `${scene.position?.y ?? 170}px`,
      }}
    >

      {/* ✦ TOP LOCATION CONNECTOR SOCKET (PRECISION MICRO-JEWEL) */}
      <div
        onClick={(e) => {
          if (scene.location_key && isEditable && onDetachLocation) {
            e.stopPropagation();
            onDetachLocation(scene.scene_id);
          }
        }}
        className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[11px] h-[11px] rounded-full bg-[#141419] transition-all z-30 flex items-center justify-center select-none ${
          isLocationDropTarget
            ? 'scale-150 border border-[#30D158] ring-2 ring-[#30D158]/35 bg-[#30D158]/30'
            : scene.location_key
            ? 'border border-white/20 hover:border-[#30D158] hover:scale-125 cursor-pointer group/locsock'
            : 'border border-dashed border-white/20 hover:border-white/40 cursor-default'
        }`}
        title={
          scene.location_key
            ? `สถานที่: ${scene.location_key} (คลิกเพื่อถอดสายสถานที่)`
            : 'พอร์ตสถานที่ว่าง: ลากสายสถานที่จากด้านบนมาเสียบที่นี่'
        }
      >
        <div
          className={`rounded-full transition-all ${
            isLocationDropTarget
              ? 'w-1.5 h-1.5 bg-white'
              : scene.location_key
              ? 'w-1 h-1 bg-[#30D158] group-hover/locsock:bg-[#FF375F]'
              : 'w-0.5 h-0.5 bg-white/30'
          }`}
        />
      </div>

      {/* ✦ RAIL CONNECTOR PORTS (PRECISION MICRO-JEWEL) */}
      {/* Input Port (Left) */}
      <div
        onMouseDown={(e) => {
          if (hasIncomingCable && isEditable && onStartDetachIncoming) {
            onStartDetachIncoming(e, scene.scene_id);
          }
        }}
        className={`absolute -left-[5.5px] top-[24px] -translate-y-1/2 w-[11px] h-[11px] rounded-full bg-[#141419] border transition-all z-30 flex items-center justify-center ${
          isDropTarget
            ? 'scale-150 border-[#FF375F] ring-2 ring-[#FF375F]/40 bg-[#FF375F]/25'
            : hasIncomingCable
            ? 'border-white/20 hover:border-[#FF375F] cursor-grab active:cursor-grabbing hover:scale-125'
            : 'border-white/20'
        }`}
        title={
          hasIncomingCable
            ? 'พอร์ตรับสัญญาณ: คลิกลากเพื่อย้ายสายเชื่อมต่อ (Click & Drag to Detach/Reroute)'
            : 'พอร์ตรับสัญญาณ (Input Socket)'
        }
      >
        <div
          className={`rounded-full transition-all ${
            isDropTarget
              ? 'w-1.5 h-1.5 bg-white'
              : hasIncomingCable
              ? 'w-1 h-1 bg-[#FF375F]'
              : 'w-0.5 h-0.5 bg-white/30'
          }`}
        />
      </div>

      {/* Output Port (Right) */}
      <div
        onMouseDown={(e) => {
          if (isEditable && onStartDragWire) {
            onStartDragWire(e, scene.scene_id);
          }
        }}
        className="absolute -right-[5.5px] top-[24px] -translate-y-1/2 w-[11px] h-[11px] rounded-full bg-[#141419] border border-white/25 hover:border-[#FF375F] hover:scale-125 transition-all z-30 flex items-center justify-center cursor-crosshair group/port"
        title={
          hasOutgoingCable
            ? 'พอร์ตส่งสัญญาณ: คลิกลากเพื่อเปลี่ยนเส้นเชื่อมต่อไปยังฉากอื่น (Drag to Reconnect)'
            : 'พอร์ตส่งสัญญาณ: คลิกลากเส้นเชื่อมต่อไปยังฉากอื่น (Drag to Connect)'
        }
      >
        <div className="w-1 h-1 rounded-full bg-[#FF375F] group-hover/port:scale-125 transition-transform" />
      </div>

      {/* ===================================================================== */}
      {/* 1. TOP HEADER & BEAT SELECTOR DOCK                                    */}
      {/* ===================================================================== */}
      <div className="shrink-0 space-y-2">
        {/* Top Control Bar: Scene Title & Turn Gauge & Edit Actions (Draggable Header Area) */}
        <div
          onMouseDown={(e) => {
            if (!isEditing) onStartDrag(e, scene.scene_id);
          }}
          className="flex items-center justify-between gap-1.5 cursor-grab active:cursor-grabbing"
        >
          {/* Scene Title (Matches WorldBeatCard exactly) */}
          <div className="min-w-0 flex-1 flex items-center gap-1.5">
            <span
              className="truncate block font-medium text-[12px] sm:text-[12.5px] text-white/80"
              title={displayTitle}
            >
              {displayTitle}
            </span>

            {/* Free Unlinked Node Badge (When unlinked from chain) */}
            {!sceneOrder && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/[0.04] border border-white/10 text-[9px] font-mono text-white/40 shrink-0">
                อิสระ
              </span>
            )}

            {/* Target Drop Hover Badge */}
            {isDropTarget && (
              <span className="px-2 py-0.2 rounded-full bg-[#FF375F]/20 border border-[#FF375F]/40 text-[9.5px] font-medium text-[#FF375F] shrink-0 animate-pulse">
                ✦ ปล่อยเพื่อเชื่อม
              </span>
            )}
          </div>

          {/* Turn Quota Dot Badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] shrink-0"
            title={`โควตาคุยเล่น: ${displayTurns} รอบ`}
          >
            <span className="text-[11px] font-medium text-white/60">
              โควตา: {displayTurns} รอบ
            </span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: Math.min(5, displayTurns) }).map((_, dotIdx) => (
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

          {/* Edit / Save / Delete Buttons */}
          {isEditable && (
            <div
              className="flex items-center gap-1 shrink-0"
              onMouseDown={(e) => e.stopPropagation()}
            >
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
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleDeleteCurrentBeat}
                  className="w-6 h-6 rounded-full bg-white/[0.04] hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white/40 hover:text-red-300 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  title={beats.length > 1 ? 'ลบบีตนี้' : 'ลบฉากนี้'}
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
                  className="w-4 h-4 rounded-full bg-white/[0.04] hover:bg-white/12 text-white/30 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                  title={`แทรกบีตคั่นกลางระหว่างบีต ${bIdx} และ ${bIdx + 1}`}
                >
                  <Plus size={9} strokeWidth={2.5} />
                </button>
              )}

              {/* Beat Pill with Reorder Controls when active */}
              <div
                onClick={() => {
                  setActiveBeatIndex(bIdx);
                  setIsEditing(false);
                }}
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
              className="px-2 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] text-white/40 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer shrink-0"
              title="เพิ่มบีตใหม่ต่อท้าย"
            >
              <Plus size={10} strokeWidth={2} />
              <span>บีต</span>
            </button>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. THE 3 DRAMATIC ORGANS / READ MODE                                  */}
      {/* ===================================================================== */}
      {!isEditing ? (
        <div className="flex-1 flex flex-col justify-between gap-2 py-1 overflow-hidden">
          {/* Organ 1: 🎭 1. ตัวละครกำลังทำอะไร (สูงสุด 2 บรรทัด) */}
          <div className="rounded-[12px] bg-white/[0.03] border border-white/[0.06] px-3 py-2 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[#EF264C]">
              <Sparkles size={12.5} className="shrink-0" />
              <span className="text-[11.5px] sm:text-[12px] font-semibold text-white/90 tracking-tight whitespace-nowrap truncate">
                1. ตัวละครกำลังทำอะไร
              </span>
            </div>
            <p
              className={`text-[11.5px] sm:text-[12px] text-white/80 font-normal leading-[18px] tracking-tight ${
                isExpandedCard ? 'leading-relaxed' : 'line-clamp-2'
              }`}
            >
              {currentBeat?.actor_state || 'ยังไม่มีการระบุการกระทำของตัวละคร'}
            </p>
          </div>

          {/* Organ 2: 🎯 2. ถ้าผู้เล่นทำแบบนี้ (เรื่องจะไปต่อทันที) */}
          <div className="rounded-[12px] bg-white/[0.03] border border-white/[0.06] px-3 py-2 flex flex-col gap-1.5">
            {/* Header: Strictly 1 line */}
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Target size={12.5} className="shrink-0" />
              <span className="text-[11.5px] sm:text-[12px] font-semibold text-[#F1F1F1] tracking-tight whitespace-nowrap truncate">
                2. ถ้าผู้เล่นทำแบบนี้ (เรื่องจะไปต่อทันที)
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
                      <span className="text-[11px] sm:text-[11.5px] text-white/70 italic truncate">
                        ➔ {triggerEntries[0][1].feedback}
                      </span>
                    )}
                  </div>
                  {/* ปุ่มไปต่อ/อยู่ที่เดิม อยู่ตรงขวาสุดของการกระทำข้อนั้นโดยตรง */}
                  <span
                    className={`text-[9.5px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                      triggerEntries[0][1].action_result === 'loop' ||
                      (triggerEntries[0][1].action_result as string) === 'chaos_escalation'
                        ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30'
                        : 'text-[#EF264C] bg-[#EF264C]/15 border border-[#EF264C]/30'
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
              /* ✦ 2. ตอนขยาย (Expanded): เห็นเต็ม 100% ทุกตัวอักษร + ปุ่มอยู่หลังของแต่ละอัน */
              <div className="space-y-2 pt-0.5">
                {triggerEntries.length > 0 ? (
                  triggerEntries.map(([key, val]) => {
                    const isLoop =
                      val.action_result === 'loop' ||
                      (val.action_result as string) === 'chaos_escalation';
                    return (
                      <div
                        key={key}
                        className="rounded-[10px] bg-white/[0.03] border border-white/[0.06] p-2 flex flex-col gap-1.5"
                      >
                        {/* แถวบน: ปุ่ม Pill ซ้าย <---------------> ปุ่มไปต่อ/อยู่ที่เดิม ขวาสุดของแต่ละอัน */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-white/[0.08] border border-white/15 text-[10.5px] sm:text-[11px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                            {key}
                          </span>
                          <span
                            className={`text-[9.5px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                              isLoop
                                ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30'
                                : 'text-[#EF264C] bg-[#EF264C]/15 border border-[#EF264C]/30'
                            }`}
                          >
                            {isLoop ? '↺ อยู่ที่เดิม' : '→ ไปต่อ'}
                          </span>
                        </div>

                        {/* แถวล่าง: ข้อความตอบสนองแบบเต็มพื้นที่ 100% ไม่มีตัดคำ */}
                        {val.feedback && (
                          <p className="text-[11px] sm:text-[11.5px] text-white/75 italic leading-[18px]">
                            ➔ {val.feedback}
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

          {/* Organ 3: ⏳ 3. ถ้าผู้เล่นไม่ทำอะไร */}
          <div className="rounded-[12px] bg-amber-500/[0.03] border border-amber-500/20 px-3 py-2 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Clock size={12.5} className="shrink-0" />
              <span className="text-[11.5px] sm:text-[12px] font-semibold text-amber-300 tracking-tight whitespace-nowrap truncate">
                3. ถ้าผู้เล่นไม่ทำอะไร (คุยครบ {displayTurns} รอบ เรื่องจะเดินต่อเองว่า)
              </span>
            </div>
            <p
              className={`text-[11px] sm:text-[11.5px] text-[#EDEDED] font-normal leading-[17px] tracking-tight ${
                isExpandedCard ? 'leading-relaxed' : 'truncate'
              }`}
            >
              {currentBeat?.pacing_control?.inevitable_consequence ||
                'เรื่องราวดำเนินสู่ขั้นถัดไปอัตโนมัติ'}
            </p>
          </div>
        </div>
      ) : (
        /* ===================================================================== */
        /* ✦ IN-PLACE EDIT MODE                                                  */
        /* ===================================================================== */
        <div className="flex-1 flex flex-col gap-3 py-1 overflow-y-auto custom-scrollbar pr-1">
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

      {/* ✦ 4. CARD EXPAND / COLLAPSE BUTTON (ปุ่มกลมๆ สไตล์เดียวกับปุ่มดินสอ อยู่มุมขวาล่างบนตัวการ์ด ไม่ยื่นออกนอกการ์ด) */}
      {!isEditing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpandedCard(!isExpandedCard);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute bottom-3 right-3 sm:bottom-3.5 sm:right-3.5 w-6 h-6 rounded-full bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 text-white/60 hover:text-white flex items-center justify-center cursor-pointer transition-all active:scale-95 z-20"
          title={isExpandedCard ? 'ย่อการ์ดกลับขนาดเดิม' : 'ขยายการ์ดเพื่ออ่านเต็ม'}
        >
          {isExpandedCard ? (
            <ChevronUp size={11} strokeWidth={2.2} />
          ) : (
            <ChevronDown size={11} strokeWidth={2.2} />
          )}
        </button>
      )}
    </div>
  );
}
