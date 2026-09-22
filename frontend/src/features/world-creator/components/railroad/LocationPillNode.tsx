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
          ? 'bg-white/[0.12] border border-[#30D158] ring-2 ring-[#30D158]/30 shadow-[0_4px_20px_rgba(48,209,88,0.35),inset_0_1px_0_rgba(255,255,255,0.12)]'
          : 'bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      title={`สถานที่: ${locationKey}`}
    >
      {/* ✦ 1. LUMINOUS MINT MAP PIN ICON (APPLE TACTILE GLYPH) */}
      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-white/[0.06] border border-white/[0.08] text-[#30D158]">
        <MapPin size={11} strokeWidth={2.2} />
      </div>

      {/* ✦ 2. LOCATION TITLE (PURE MINIMAL LABEL) */}
      <span className="font-normal text-[12.5px] text-[#EDEDED] truncate max-w-[170px] sm:max-w-[210px] tracking-tight">
        {locationKey}
      </span>

      {/* ✦ 3. BOTTOM PRECISION SOCKET (PRECISION MICRO-JEWEL) */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          if (isEditable) onStartDragWire(e, locationKey);
        }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[11px] h-[11px] rounded-full bg-[#121216] border border-white/25 hover:border-[#30D158] hover:scale-125 transition-all z-30 flex items-center justify-center cursor-crosshair group/locport"
        title="พอร์ตสถานที่: คลิกลากสายเพื่อเชื่อมต่อกับฉาก (Drag to connect)"
      >
        <div className="w-1 h-1 rounded-full bg-[#30D158] group-hover/locport:scale-125 transition-transform" />
      </div>
    </div>
  );
}
