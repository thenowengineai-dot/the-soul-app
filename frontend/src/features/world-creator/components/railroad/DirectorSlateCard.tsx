import { useState, type MouseEvent } from 'react';
import {
  Clapperboard,
  Zap,
  Pencil,
  Maximize2,
} from 'lucide-react';
import type { WorldScene } from '../../types';
import DirectorSlateModal from './DirectorSlateModal';

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
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEditMode, setModalEditMode] = useState(false);

  // Extract short tempo title if present (e.g. "The Slow Burn" from "The Slow Burn: ...")
  const tempoTag = scene.director_vision
    ? scene.director_vision.split(':')[0].trim()
    : 'Slow Burn';

  const briefText = scene.director_setup || scene.premise || 'ยังไม่มีการระบุบรีฟผู้กำกับฉาก';

  const handleOpenModal = (e: MouseEvent, editMode = false) => {
    e.stopPropagation();
    setModalEditMode(editMode);
    setIsModalOpen(true);
  };

  return (
    <>
      <div
        onMouseDown={(e) => {
          if (isEditable) onStartDragCard(e, scene.scene_id);
        }}
        onClick={(e) => handleOpenModal(e, false)}
        className={`absolute w-[280px] rounded-[22px] p-3 sm:p-3.5 select-none z-20 backdrop-blur-2xl transition-all duration-200 group/slate cursor-pointer ${
          isDraggingWire
            ? 'bg-[#181822]/95 border border-[#FF9F0A] ring-2 ring-[#FF9F0A]/35 shadow-[0_4px_24px_rgba(255,159,10,0.3),inset_0_1px_0_rgba(255,255,255,0.12)]'
            : 'bg-[#13131A]/90 hover:bg-[#181822]/95 border border-white/[0.10] hover:border-[#FF9F0A]/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]'
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        title="คลิกเพื่อเปิดดูบรีฟผู้กำกับฉบับเต็ม (Full Cinema Slate)"
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

          {/* Header Actions: Edit Button & Maximize Button */}
          <div
            className="flex items-center gap-1 shrink-0"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {isEditable && (
              <button
                type="button"
                onClick={(e) => handleOpenModal(e, true)}
                className="w-5 h-5 rounded-full bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 text-white/50 hover:text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
                title="แก้ไขข้อมูลบรีฟนี้"
              >
                <Pencil size={9.5} strokeWidth={2} />
              </button>
            )}

            {/* Maximize / Expand Modal Button */}
            <button
              type="button"
              onClick={(e) => handleOpenModal(e, false)}
              className="w-5 h-5 rounded-full bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 text-white/50 hover:text-white flex items-center justify-center cursor-pointer transition-all active:scale-95 ml-0.5"
              title="เปิดอ่านบรีฟและปูมหลังฉบับเต็ม"
            >
              <Maximize2 size={9.5} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. SLATE CONTENT BODY (DIRECTOR'S BRIEF WITH TRUNCATION ...)        */}
        {/* =================================================================== */}
        <div className="pt-2 space-y-1.5">
          <div className="flex items-center gap-1 text-[9px] font-semibold text-[#FF9F0A]/90 uppercase tracking-wide">
            <Clapperboard size={9.5} className="text-[#FF9F0A] shrink-0" />
            <span>DIRECTOR&apos;S BRIEF</span>
          </div>

          {/* Director's Brief line-clamped with ... */}
          <p
            className="text-[12px] text-[#F2F2F5] font-normal leading-[17px] line-clamp-2"
            title={briefText}
          >
            {briefText}
          </p>
        </div>

        {/* =================================================================== */}
        {/* 3. DIRECTOR'S DIALS DOCK STRIP (CHAOS / TEMPO / MOOD)               */}
        {/* =================================================================== */}
        <div className="pt-2 mt-1.5 border-t border-white/[0.06] flex items-center justify-between gap-1.5 text-[10px]">
          {/* Chaos Level Switch (Interactive Segmented Pills) */}
          <div
            className="flex items-center gap-0.5 bg-black/30 p-0.5 rounded-full border border-white/[0.08]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Zap size={9.5} className="text-[#FF9F0A] ml-1 mr-0.5 shrink-0" />
            {(['low', 'medium', 'high'] as const).map((lvl) => {
              const currentChaos = scene.forced_chaos_level || 'low';
              const isSelected = currentChaos === lvl;

              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isEditable) {
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
        {/* 4. BOTTOM PRECISION MICRO-JEWEL PORT (AMBER WIRE CONNECTOR)         */}
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

      {/* =================================================================== */}
      {/* 5. FULL CINEMA SLATE MODAL (COMPLETE 6 SECTIONS)                    */}
      {/* =================================================================== */}
      <DirectorSlateModal
        scene={scene}
        sceneOrder={sceneOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isEditable={isEditable}
        initialEditMode={modalEditMode}
        onUpdateBriefing={onUpdateBriefing}
      />
    </>
  );
}
