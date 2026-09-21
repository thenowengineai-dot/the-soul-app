import type { MouseEvent } from 'react';
import { MapPin } from 'lucide-react';
import type { WorldLocationItem } from '../../types';

export const LOC_PILL_HEIGHT = 34;

interface LocationPillNodeProps {
  locationKey: string;
  locationData?: WorldLocationItem;
  position: { x: number; y: number };
  isDraggingWire?: boolean;
  isEditable?: boolean;
  onStartDragPill: (e: MouseEvent, locationKey: string) => void;
  onStartDragWire: (e: MouseEvent, locationKey: string) => void;
}

export default function LocationPillNode({
  locationKey,
  position,
  isDraggingWire = false,
  isEditable = true,
  onStartDragPill,
  onStartDragWire,
}: LocationPillNodeProps) {
  return (
    <div
      onMouseDown={(e) => {
        if (isEditable) onStartDragPill(e, locationKey);
      }}
      className={`absolute h-[34px] rounded-full px-3.5 -translate-x-1/2 flex items-center gap-2 select-none z-20 cursor-grab active:cursor-grabbing backdrop-blur-2xl transition-all duration-200 group/pill ${
        isDraggingWire
          ? 'bg-[#181820]/95 border border-[#528A7A] ring-2 ring-[#528A7A]/30 shadow-[0_4px_20px_rgba(0,0,0,0.6)]'
          : 'bg-[#16161A]/95 hover:bg-[#1D1D22] border border-white/10 hover:border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      title={`สถานที่: ${locationKey}`}
    >
      {/* ✦ 1. MUTED SAGE MAP PIN ICON (APPLE TACTILE GLYPH) */}
      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-white/[0.06] border border-white/[0.08] text-[#6BB8A2]">
        <MapPin size={11} strokeWidth={2.2} />
      </div>

      {/* ✦ 2. LOCATION TITLE (PURE MINIMAL LABEL) */}
      <span className="font-normal text-[12.5px] text-[#EDEDED] truncate max-w-[170px] sm:max-w-[210px] tracking-tight">
        {locationKey}
      </span>

      {/* ✦ 3. BOTTOM PRECISION SOCKET (DOT-TO-DOT RECEPTACLE) */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          if (isEditable) onStartDragWire(e, locationKey);
        }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[14px] h-[14px] rounded-full bg-[#121216] border border-[#528A7A]/80 hover:border-white hover:scale-125 transition-all z-30 flex items-center justify-center cursor-crosshair shadow-[0_0_6px_rgba(82,138,122,0.35)] group/locport"
        title="พอร์ตสถานที่: คลิกลากสายเพื่อเชื่อมต่อกับฉาก (Drag to connect)"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-[#528A7A] group-hover/locport:bg-white group-hover/locport:scale-110 transition-all" />
      </div>
    </div>
  );
}
