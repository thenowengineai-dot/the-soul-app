import type { MouseEvent } from 'react';
import { MapPin } from 'lucide-react';
import type { WorldLocationItem } from '../../types';

export const LOC_PILL_HEIGHT = 34;

interface LocationPillNodeProps {
  locationKey: string;
  locationData?: WorldLocationItem;
  position: { x: number; y: number };
  assignedSceneId?: string | null;
  assignedSceneOrder?: number | null;
  assignedSceneTitle?: string | null;
  isDraggingWire?: boolean;
  isEditable?: boolean;
  onStartDragPill: (e: MouseEvent, locationKey: string) => void;
  onStartDragWire: (e: MouseEvent, locationKey: string) => void;
}

export default function LocationPillNode({
  locationKey,
  position,
  assignedSceneId,
  assignedSceneOrder,
  assignedSceneTitle,
  isDraggingWire = false,
  isEditable = true,
  onStartDragPill,
  onStartDragWire,
}: LocationPillNodeProps) {
  const isLinked = Boolean(assignedSceneId);

  return (
    <div
      onMouseDown={(e) => {
        // Drag pill if clicking on the pill body
        if (isEditable) onStartDragPill(e, locationKey);
      }}
      className={`absolute h-[34px] rounded-full px-3.5 flex items-center gap-2 select-none z-20 cursor-grab active:cursor-grabbing backdrop-blur-2xl transition-shadow duration-200 group/pill ${
        isDraggingWire
          ? 'bg-[#181826]/95 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
          : isLinked
          ? 'bg-[#14141E]/95 hover:bg-[#1A1A28] border border-emerald-500/40 hover:border-emerald-500/70 shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.10)]'
          : 'bg-[#14141E]/90 hover:bg-[#1A1A28] border border-dashed border-white/20 hover:border-emerald-500/50 shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      title={`โหนดสถานที่: ${locationKey}${isLinked ? ` (เชื่อมกับฉาก #${assignedSceneOrder ?? '?'})` : ' (ยังไม่ได้เชื่อมต่อกับฉาก)'}`}
    >
      {/* ✦ 1. EMERALD MAP PIN ICON */}
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          isLinked
            ? 'bg-emerald-500/15 border border-emerald-500/35 text-emerald-400'
            : 'bg-white/10 border border-white/15 text-white/50'
        }`}
      >
        <MapPin size={11} strokeWidth={2.4} />
      </div>

      {/* ✦ 2. LOCATION TITLE */}
      <span className="font-medium text-[12px] text-white/90 truncate max-w-[160px] sm:max-w-[190px]">
        {locationKey}
      </span>

      {/* ✦ 3. ASSIGNED SCENE BADGE */}
      {isLinked && (
        <span
          className="text-[9.5px] font-mono font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 shrink-0"
          title={assignedSceneTitle ? `ฉาก: ${assignedSceneTitle}` : undefined}
        >
          {assignedSceneOrder ? `ฉาก ${assignedSceneOrder}` : 'เชื่อมแล้ว'}
        </span>
      )}

      {/* ✦ 4. BOTTOM OUTPUT PORT (EMERALD SOCKET) */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          if (isEditable) onStartDragWire(e, locationKey);
        }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[15px] h-[15px] rounded-full bg-[#121218] border border-emerald-500/90 hover:border-white hover:scale-125 transition-all z-30 flex items-center justify-center cursor-crosshair shadow-[0_0_8px_rgba(16,185,129,0.5)] group/locport"
        title="พอร์ตสถานที่: คลิกลากสายสีเขียวลงมาเชื่อมต่อกับการ์ดฉากด้านล่าง (Drag to connect to scene)"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover/locport:scale-125 transition-transform" />
      </div>
    </div>
  );
}
