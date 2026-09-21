import { Plus } from 'lucide-react';
import type { WorldScene } from '../../types';

interface RailroadCableOverlayProps {
  scenes: WorldScene[];
  onInsertSceneBetween: (fromIndex: number) => void;
  isEditable?: boolean;
}

const SCENE_WIDTH = 380;
const PORT_Y_OFFSET = 24;

export default function RailroadCableOverlay({
  scenes,
  onInsertSceneBetween,
  isEditable = true,
}: RailroadCableOverlayProps) {
  if (scenes.length < 2) return null;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0"
      style={{ minWidth: '4000px', minHeight: '4000px' }}
    >
      <defs>
        {/* Glowing Gradient for Railroad Cables */}
        <linearGradient id="railroadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EF264C" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#EF264C" stopOpacity="0.8" />
        </linearGradient>

        <filter id="cableGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {scenes.map((scene, idx) => {
        if (idx === scenes.length - 1) return null;

        const nextScene = scenes[idx + 1];
        if (!nextScene) return null;

        // Positions
        const x1 = (scene.position?.x ?? 80 + idx * 440) + SCENE_WIDTH;
        const y1 = (scene.position?.y ?? 120) + PORT_Y_OFFSET;

        const x2 = nextScene.position?.x ?? 80 + (idx + 1) * 440;
        const y2 = (nextScene.position?.y ?? 120) + PORT_Y_OFFSET;

        // Bezier Curvature
        const dx = Math.abs(x2 - x1);
        const curvature = Math.max(dx * 0.45, 60);

        const pathData = `M ${x1} ${y1} C ${x1 + curvature} ${y1}, ${x2 - curvature} ${y2}, ${x2} ${y2}`;

        // Approximate Midpoint for the Quick Insert Button
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        return (
          <g key={`cable-${scene.scene_id || idx}-${nextScene.scene_id || idx + 1}`}>
            {/* 1. Outer Ambient Glow */}
            <path
              d={pathData}
              fill="none"
              stroke="#EF264C"
              strokeWidth="6"
              strokeOpacity="0.2"
              filter="url(#cableGlow)"
            />

            {/* 2. Main Cable Line */}
            <path
              d={pathData}
              fill="none"
              stroke="url(#railroadGradient)"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              className="animate-pulse"
            />

            {/* 3. Midpoint Quick Scene Insert Floating Button */}
            {isEditable && (
              <foreignObject
                x={midX - 14}
                y={midY - 14}
                width={28}
                height={28}
                className="overflow-visible pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={() => onInsertSceneBetween(idx)}
                  className="w-7 h-7 rounded-full bg-[#181822] hover:bg-[#EF264C] border border-white/20 hover:border-white text-white/70 hover:text-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.6)] hover:scale-110 active:scale-95 transition-all cursor-pointer group"
                  title="แทรกฉากใหม่คั่นกลางตรงนี้ (Insert Scene)"
                >
                  <Plus size={13} strokeWidth={2.4} />
                </button>
              </foreignObject>
            )}
          </g>
        );
      })}
    </svg>
  );
}
