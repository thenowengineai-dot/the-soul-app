import { useState, type MouseEvent } from 'react';
import {
  Clapperboard,
  Compass,
  BookOpen,
  Zap,
  Pencil,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { WorldScene } from '../../types';

export const SLATE_WIDTH = 280;
export const SLATE_COMPACT_HEIGHT = 110;

interface DirectorSlateCardProps {
  scene: WorldScene;
  sceneOrder?: number | null;
  position: { x: number; y: number };
  isDraggingWire?: boolean;
  isEditable?: boolean;
  onStartDragCard: (e: MouseEvent, sceneId: string) => void;
  onStartDragWire: (e: MouseEvent, sceneId: string) => void;
  onUpdateBriefing: (sceneId: string, updated: Partial<WorldScene>) => void;
}

export default function DirectorSlateCard({
  scene,
  sceneOrder = null,
  position,
  isDraggingWire = false,
  isEditable = true,
  onStartDragCard,
  onStartDragWire,
  onUpdateBriefing,
}: DirectorSlateCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form states
  const [editObjective, setEditObjective] = useState(scene.scene_objective || '');
  const [editBrief, setEditBrief] = useState(scene.director_setup || '');
  const [editPremise, setEditPremise] = useState(scene.premise || '');
  const [editChaos, setEditChaos] = useState<'low' | 'medium' | 'high'>(
    scene.forced_chaos_level || 'low'
  );
  const [editMood, setEditMood] = useState(scene.event_mood || '');
  const [editVision, setEditVision] = useState(scene.director_vision || '');

  const handleStartEdit = (e: MouseEvent) => {
    e.stopPropagation();
    setEditObjective(scene.scene_objective || '');
    setEditBrief(scene.director_setup || '');
    setEditPremise(scene.premise || '');
    setEditChaos(scene.forced_chaos_level || 'low');
    setEditMood(scene.event_mood || '');
    setEditVision(scene.director_vision || '');
    setIsEditing(true);
    setIsExpanded(true); // auto expand on edit
  };

  const handleSaveEdit = (e: MouseEvent) => {
    e.stopPropagation();
    onUpdateBriefing(scene.scene_id, {
      scene_objective: editObjective.trim(),
      director_setup: editBrief.trim(),
      premise: editPremise.trim(),
      forced_chaos_level: editChaos,
      event_mood: editMood.trim(),
      director_vision: editVision.trim(),
    });
    setIsEditing(false);
  };

  const handleCancelEdit = (e: MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
  };

  const tempoTag = scene.director_vision
    ? scene.director_vision.split(':')[0].trim()
    : 'Slow Burn';

  const briefText = scene.director_setup || scene.premise || 'ยังไม่มีการระบุบรีฟผู้กำกับฉาก';

  return (
    <div
      onMouseDown={(e) => {
        if (!isEditing && isEditable) onStartDragCard(e, scene.scene_id);
      }}
      className={`absolute w-[280px] rounded-[22px] p-3 sm:p-3.5 select-none transition-all duration-200 group/slate ${
        isExpanded || isEditing ? 'h-auto pb-8 z-30' : 'h-[110px] z-20'
      } ${
        isDraggingWire
          ? 'bg-[#181822]/95 border border-[#FF9F0A] ring-2 ring-[#FF9F0A]/35 shadow-[0_4px_24px_rgba(255,159,10,0.3),inset_0_1px_0_rgba(255,255,255,0.12)]'
          : 'bg-[#13131A]/95 hover:bg-[#181822]/98 backdrop-blur-2xl border border-white/[0.10] hover:border-[#FF9F0A]/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]'
      } ${isEditing ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* =================================================================== */}
      {/* 1. CLAPPERBOARD MASTHEAD HEADER                                     */}
      {/* =================================================================== */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.07] gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <Clapperboard size={13} className="text-[#FF9F0A] shrink-0" />
          <span className="text-[10px] font-bold tracking-widest text-[#FF9F0A] uppercase truncate">
            DIRECTOR&apos;S BRIEF
          </span>
          {sceneOrder && (
            <span className="text-[9px] font-mono text-white/40 bg-white/[0.04] px-1 py-0.2 rounded shrink-0">
              #{sceneOrder}
            </span>
          )}
        </div>

        {/* Header Actions: Edit / Save / Cancel */}
        <div
          className="flex items-center gap-1 shrink-0"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {isEditable && (
            <>
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-5 h-5 rounded-full bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 text-white/60 hover:text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
                    title="ยกเลิกการแก้ไข"
                  >
                    <X size={10} strokeWidth={2.4} />
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="w-5 h-5 rounded-full bg-[#FF9F0A] text-black flex items-center justify-center cursor-pointer shadow-[0_2px_8px_rgba(255,159,10,0.4)] active:scale-95 transition-all font-bold"
                    title="บันทึกบรีฟผู้กำกับ"
                  >
                    <Check size={10} strokeWidth={2.6} />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="w-5 h-5 rounded-full bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 text-white/50 hover:text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  title="แก้ไขบรีฟผู้กำกับนี้"
                >
                  <Pencil size={9.5} strokeWidth={2} />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. BODY CONTENT: COLLAPSED VS EXPANDED IN-PLACE                     */}
      {/* =================================================================== */}
      {!isExpanded && !isEditing ? (
        /* ✦ 2A. COLLAPSED PREVIEW (COMPACT SLATE) */
        <div className="pt-2 space-y-1.5">
          <div className="flex items-center gap-1 text-[9px] font-semibold text-[#FF9F0A]/90 uppercase tracking-wide">
            <Clapperboard size={9.5} className="text-[#FF9F0A] shrink-0" />
            <span>DIRECTOR&apos;S BRIEF</span>
          </div>

          <p
            className="text-[12px] text-[#F2F2F5] font-normal leading-[17px] line-clamp-2"
            title={briefText}
          >
            {briefText}
          </p>
        </div>
      ) : (
        /* ✦ 2B. EXPANDED FULL CONTENT (DOWNWARD IN-PLACE UNFOLDING) */
        <div className="pt-2 space-y-3">
          {/* SECTION 1: 🎯 THE NORTH STAR */}
          <div className="rounded-[12px] p-2.5 bg-black/25 border border-[#FF9F0A]/20 space-y-1">
            <div className="flex items-center gap-1 text-[9.5px] font-semibold text-[#FF9F0A] uppercase tracking-wide">
              <Compass size={11} className="text-[#FF9F0A] shrink-0" />
              <span>🎯 1. THE NORTH STAR</span>
            </div>
            {isEditing ? (
              <textarea
                value={editObjective}
                onChange={(e) => setEditObjective(e.target.value)}
                rows={2}
                placeholder="เป้าหมายหลักของ AI ในฉากนี้..."
                className="w-full bg-[#161620] border border-white/15 focus:border-[#FF9F0A] rounded-[8px] p-2 text-[11px] text-white outline-none resize-none leading-relaxed font-normal"
              />
            ) : (
              <p className="text-[11.5px] text-[#F5F5F7] font-medium leading-[17px]">
                {scene.scene_objective || 'ยังไม่มีการกำหนดเป้าหมายของ AI'}
              </p>
            )}
          </div>

          {/* SECTION 2: 🎥 DIRECTOR'S BRIEF (FULL TEXT) */}
          <div className="rounded-[12px] p-2.5 bg-black/25 border border-white/[0.06] space-y-1">
            <div className="flex items-center gap-1 text-[9.5px] font-semibold text-white/80 uppercase tracking-wide">
              <Clapperboard size={11} className="text-[#FF9F0A] shrink-0" />
              <span>🎥 2. DIRECTOR&apos;S BRIEF</span>
            </div>
            {isEditing ? (
              <textarea
                value={editBrief}
                onChange={(e) => setEditBrief(e.target.value)}
                rows={3}
                placeholder="บรีฟคำสั่งคุมโทนผู้กำกับฉาก..."
                className="w-full bg-[#161620] border border-white/15 focus:border-[#FF9F0A] rounded-[8px] p-2 text-[11px] text-white outline-none resize-none leading-relaxed font-normal"
              />
            ) : (
              <p className="text-[11.5px] text-white/85 font-normal leading-[17px]">
                {scene.director_setup || 'ยังไม่มีการระบุบรีฟผู้กำกับฉาก'}
              </p>
            )}
          </div>

          {/* SECTION 3: 📖 THE SCENE PREMISE (FULL TEXT) */}
          <div className="rounded-[12px] p-2.5 bg-black/20 border border-white/[0.05] space-y-1">
            <div className="flex items-center gap-1 text-[9.5px] font-semibold text-white/60 uppercase tracking-wide">
              <BookOpen size={11} className="text-[#FF9F0A] shrink-0" />
              <span>📖 3. THE SCENE PREMISE</span>
            </div>
            {isEditing ? (
              <textarea
                value={editPremise}
                onChange={(e) => setEditPremise(e.target.value)}
                rows={3}
                placeholder="ปูมหลังและบริบทความอึดอัด..."
                className="w-full bg-[#161620] border border-white/15 focus:border-[#FF9F0A] rounded-[8px] p-2 text-[11px] text-white outline-none resize-none leading-relaxed font-normal"
              />
            ) : (
              <p className="text-[11px] text-white/70 font-normal leading-[16px]">
                {scene.premise || 'ยังไม่มีการระบุปูมหลังของฉาก'}
              </p>
            )}
          </div>

          {/* SECTION 4: EDITING VISION & MOOD (WHEN IN EDIT MODE) */}
          {isEditing && (
            <div className="space-y-2 pt-1 border-t border-white/[0.06]">
              <div>
                <span className="text-[9px] font-semibold text-white/50 uppercase tracking-wide block mb-1">
                  EVENT MOOD (ฟิสิกส์/บรรยากาศ)
                </span>
                <input
                  type="text"
                  value={editMood}
                  onChange={(e) => setEditMood(e.target.value)}
                  placeholder="เช่น อบอุ่น อึดอัด ชื้นแฉะ ลื่นไถล แนบเนื้อ..."
                  className="w-full bg-[#161620] border border-white/15 focus:border-[#FF9F0A] rounded-[8px] px-2 py-1 text-[11px] text-white outline-none font-normal"
                />
              </div>
              <div>
                <span className="text-[9px] font-semibold text-white/50 uppercase tracking-wide block mb-1">
                  DIRECTOR VISION (จังหวะหนัง)
                </span>
                <input
                  type="text"
                  value={editVision}
                  onChange={(e) => setEditVision(e.target.value)}
                  placeholder="เช่น The Slow Burn: ค่อยๆ กดดัน..."
                  className="w-full bg-[#161620] border border-white/15 focus:border-[#FF9F0A] rounded-[8px] px-2 py-1 text-[11px] text-white outline-none font-normal"
                />
              </div>
            </div>
          )}

          {/* SECTION 5: EVENT MOOD PILLS PREVIEW (WHEN EXPANDED IN VIEW MODE) */}
          {!isEditing && scene.event_mood && (
            <div className="space-y-1">
              <span className="text-[9px] font-semibold text-white/45 uppercase tracking-wide block">
                EVENT MOOD (บรรยากาศสัมผัส)
              </span>
              <div className="flex flex-wrap gap-1">
                {scene.event_mood
                  .split(/[\s,·]+/)
                  .filter(Boolean)
                  .map((mood, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[9.5px] text-white/70"
                    >
                      {mood}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. DIRECTOR'S DIALS DOCK STRIP (CHAOS / TEMPO)                      */}
      {/* =================================================================== */}
      <div className="pt-2 mt-2 border-t border-white/[0.06] flex items-center justify-between gap-1.5 text-[10px]">
        {/* Chaos Level Switch (Interactive Segmented Pills) */}
        <div
          className="flex items-center gap-0.5 bg-black/30 p-0.5 rounded-full border border-white/[0.08]"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Zap size={9.5} className="text-[#FF9F0A] ml-1 mr-0.5 shrink-0" />
          {(['low', 'medium', 'high'] as const).map((lvl) => {
            const currentChaos = isEditing ? editChaos : scene.forced_chaos_level || 'low';
            const isSelected = currentChaos === lvl;

            return (
              <button
                key={lvl}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isEditing) {
                    setEditChaos(lvl);
                  } else if (isEditable) {
                    onUpdateBriefing(scene.scene_id, {
                      forced_chaos_level: lvl,
                    });
                  }
                }}
                className={`px-1.5 py-0.2 rounded-full text-[9px] font-semibold uppercase tracking-wider transition-all select-none ${
                  isSelected
                    ? 'bg-[#FF9F0A] text-black shadow-sm font-bold'
                    : 'text-white/40 hover:text-white/80 cursor-pointer'
                }`}
                title={`ระดับความปั่นป่วน: ${lvl.toUpperCase()}`}
              >
                {lvl}
              </button>
            );
          })}
        </div>

        {/* Tempo Pill (e.g. Slow Burn) */}
        <div
          className="px-2 py-0.5 rounded-full bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 text-[#FF9F0A] text-[9.5px] font-medium truncate max-w-[105px]"
          title={scene.director_vision || tempoTag}
        >
          {tempoTag}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. FROSTED CIRCULAR EXPAND BUTTON (MATCHING SCENENODECARD)          */}
      {/* =================================================================== */}
      {!isEditing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded((prev) => !prev);
          }}
          className="absolute bottom-2.5 right-2.5 w-6 h-6 rounded-full bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 text-white/60 hover:text-white flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
          title={isExpanded ? 'ย่อการ์ดบรีฟ' : 'ขยายการ์ดอ่านเต็ม'}
        >
          {isExpanded ? (
            <ChevronUp size={11} strokeWidth={2.2} />
          ) : (
            <ChevronDown size={11} strokeWidth={2.2} />
          )}
        </button>
      )}

      {/* =================================================================== */}
      {/* 5. BOTTOM PRECISION MICRO-JEWEL PORT (AMBER WIRE CONNECTOR)         */}
      {/* =================================================================== */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          if (isEditable) onStartDragWire(e, scene.scene_id);
        }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[11px] h-[11px] rounded-full bg-[#121216] border border-white/25 hover:border-[#FF9F0A] hover:scale-125 transition-all z-30 flex items-center justify-center cursor-crosshair group/dirport"
        title="พอร์ตบรีฟผู้กำกับ: คลิกลากสายเพื่อเชื่อมต่อกับฉาก (Drag to connect)"
      >
        <div className="w-1 h-1 rounded-full bg-[#FF9F0A] group-hover/dirport:scale-125 transition-transform" />
      </div>
    </div>
  );
}
