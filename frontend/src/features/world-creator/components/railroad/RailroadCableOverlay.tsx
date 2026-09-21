import { Plus } from 'lucide-react';
import type { WorldScene } from '../../types';

interface RailroadCableOverlayProps {
  scenes: WorldScene[];
  onInsertSceneBetween: (fromIndex: number) => void;
  isEditable?: boolean;
}

const SCENE_WIDTH = 346;
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
      {scenes.map((scene, idx) => {
        if (idx === scenes.length - 1) return null;

        const nextScene = scenes[idx + 1];
        if (!nextScene) return null;

        // Positions
        const x1 = (scene.position?.x ?? 80 + idx * 460) + SCENE_WIDTH;
        const y1 = (scene.position?.y ?? 100) + PORT_Y_OFFSET;

        const x2 = nextScene.position?.x ?? 80 + (idx + 1) * 460;
        const y2 = (nextScene.position?.y ?? 100) + PORT_Y_OFFSET;

        // Bezier Curvature
        const dx = Math.abs(x2 - x1);
        const curvature = Math.max(dx * 0.45, 50);

        const pathData = `M ${x1} ${y1} C ${x1 + curvature} ${y1}, ${x2 - curvature} ${y2}, ${x2} ${y2}`;

        // Approximate Midpoint for the Quick Insert Button
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        return (
          <g key={`cable-${scene.scene_id || idx}-${nextScene.scene_id || idx + 1}`}>
            {/* ✦ 1. SUBTLE MINIMAL HAIRLINE CABLE (APPLE MINIMAL DESIGN) */}
            <path
              d={pathData}
              fill="none"
              stroke="rgba(255, 255, 255, 0.18)"
              strokeWidth="1.5"
            />

            {/* ✦ 2. MIDPOINT QUICK SCENE INSERTION FROSTED BUTTON */}
            {isEditable && (
              <foreignObject
                x={midX - 12}
                y={midY - 12}
                width={24}
                height={24}
                className="overflow-visible pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={() => onInsertSceneBetween(idx)}
                  className="w-6 h-6 rounded-full bg-[#181820]/90 hover:bg-white/[0.16] border border-white/15 hover:border-white/40 text-white/50 hover:text-white flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.5)] active:scale-95 transition-all cursor-pointer backdrop-blur-md group"
                  title="แทรกฉากใหม่คั่นกลางตรงนี้ (Insert Scene)"
                >
                  <Plus size={11} strokeWidth={2.4} />
                </button>
              </foreignObject>
            )}
          </g>
        );
      })}
    </svg>
  );
}
