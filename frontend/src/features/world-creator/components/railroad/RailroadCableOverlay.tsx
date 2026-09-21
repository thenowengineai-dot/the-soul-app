import { Plus, Scissors, MapPin } from 'lucide-react';
import type { WorldScene } from '../../types';

export interface DraggingWireState {
  fromSceneId: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export interface DraggingLocationWireState {
  fromLocationKey: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface RailroadCableOverlayProps {
  scenes: WorldScene[];
  locationPositions?: Record<string, { x: number; y: number }>;
  onInsertSceneBetween: (fromSceneId: string) => void;
  onDisconnectScene?: (fromSceneId: string) => void;
  onDisconnectLocation?: (sceneId: string) => void;
  draggingWire?: DraggingWireState | null;
  hoveredTargetSceneId?: string | null;
  draggingLocationWire?: DraggingLocationWireState | null;
  hoveredTargetSceneForLocationId?: string | null;
  isEditable?: boolean;
}

export const SCENE_WIDTH = 346;
export const SCENE_STEP_X = 460;
export const PORT_Y_OFFSET = 24;
export const LOC_PILL_WIDTH = 180;
export const LOC_PILL_HEIGHT = 34;

/**
 * Resolves the target scene ID for a given scene:
 * 1. If scene.next_scene_id !== undefined: returns scene.next_scene_id (null if disconnected, or string ID).
 * 2. If scene.next_scene_id === undefined: falls back to next sequential scene in array (legacy compatibility).
 */
export function resolveNextSceneId(
  scene: WorldScene,
  index: number,
  allScenes: WorldScene[]
): string | null {
  if (scene.next_scene_id !== undefined) {
    return scene.next_scene_id || null;
  }
  if (index < allScenes.length - 1) {
    return allScenes[index + 1]?.scene_id || null;
  }
  return null;
}

/**
 * Strips prefixes like "ฉากที่ 1: ", "ฉากที่ 1 ", "ฉากคั่น: ", "ฉากคั่น " from raw title.
 */
export function getCleanSceneTitle(rawTitle?: string): string {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/^(ฉากที่\s*\d+\s*:\s*|ฉากที่\s*\d+\s*|ฉากคั่น\s*:\s*|ฉากคั่น\s*)/i, '')
    .trim();
}

/**
 * Computes dynamic sequential numbering (1, 2, 3, 4...) following the railroad connection chain:
 * - Traverses from root nodes (no incoming connection + has outgoing connection).
 * - Connected nodes receive consecutive numbers: 1, 2, 3, 4...
 * - Disconnected / unlinked nodes (no incoming and no outgoing) are NOT assigned a number.
 */
export function computeSceneChainOrder(scenes: WorldScene[]): Map<string, number> {
  const orderMap = new Map<string, number>();
  if (!scenes || scenes.length === 0) return orderMap;

  const outgoing = new Map<string, string>();
  const incomingCount = new Map<string, number>();

  scenes.forEach((s) => {
    incomingCount.set(s.scene_id, 0);
  });

  scenes.forEach((s, idx) => {
    const nextId = resolveNextSceneId(s, idx, scenes);
    if (nextId && scenes.some((other) => other.scene_id === nextId)) {
      outgoing.set(s.scene_id, nextId);
    }
  });

  outgoing.forEach((targetId) => {
    incomingCount.set(targetId, (incomingCount.get(targetId) || 0) + 1);
  });

  const isConnected = (id: string) =>
    outgoing.has(id) || (incomingCount.get(id) || 0) > 0;

  // Root nodes: in-degree === 0 AND has outgoing connection
  const roots = scenes.filter(
    (s) => (incomingCount.get(s.scene_id) || 0) === 0 && outgoing.has(s.scene_id)
  );

  // If no root with outgoing found but there are connected nodes (e.g. cycle), pick first connected
  if (roots.length === 0) {
    const firstConnected = scenes.find((s) => isConnected(s.scene_id));
    if (firstConnected) roots.push(firstConnected);
  }

  const visited = new Set<string>();
  let currentOrder = 1;

  for (const root of roots) {
    let curr: string | undefined = root.scene_id;
    while (curr && !visited.has(curr)) {
      visited.add(curr);
      orderMap.set(curr, currentOrder++);
      curr = outgoing.get(curr);
    }
  }

  // Handle any remaining connected chains or loops
  for (const s of scenes) {
    if (isConnected(s.scene_id) && !visited.has(s.scene_id)) {
      let curr: string | undefined = s.scene_id;
      while (curr && !visited.has(curr)) {
        visited.add(curr);
        orderMap.set(curr, currentOrder++);
        curr = outgoing.get(curr);
      }
    }
  }

  return orderMap;
}

export default function RailroadCableOverlay({
  scenes,
  locationPositions,
  onInsertSceneBetween,
  onDisconnectScene,
  onDisconnectLocation,
  draggingWire,
  hoveredTargetSceneId,
  draggingLocationWire,
  hoveredTargetSceneForLocationId,
  isEditable = true,
}: RailroadCableOverlayProps) {
  // Find target scene for dragging story wire snap
  const snappedTargetScene = hoveredTargetSceneId
    ? scenes.find((s) => s.scene_id === hoveredTargetSceneId)
    : null;

  // Find target scene for dragging location wire snap
  const snappedTargetSceneForLoc = hoveredTargetSceneForLocationId
    ? scenes.find((s) => s.scene_id === hoveredTargetSceneForLocationId)
    : null;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0"
      style={{ minWidth: '4000px', minHeight: '4000px' }}
    >
      <defs>
        {/* Subtle marker for directional flow on carmine red line */}
        <marker
          id="cable-arrow"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 1 1.5 L 7 5 L 1 8.5 z" fill="#EF264C" />
        </marker>

        {/* Subtle marker for emerald location line */}
        <marker
          id="loc-cable-arrow"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto"
        >
          <path d="M 1 1.5 L 7 5 L 1 8.5 z" fill="#10B981" />
        </marker>
      </defs>

      {/* =================================================================== */}
      {/* 1. EXISTING CONNECTED RED STORY CABLES                              */}
      {/* =================================================================== */}
      {scenes.map((scene, idx) => {
        const nextSceneId = resolveNextSceneId(scene, idx, scenes);
        if (!nextSceneId) return null;

        const targetScene = scenes.find((s) => s.scene_id === nextSceneId);
        if (!targetScene) return null;

        // Start from source scene output socket (Right)
        const x1 = (scene.position?.x ?? 80 + idx * SCENE_STEP_X) + SCENE_WIDTH;
        const y1 = (scene.position?.y ?? 170) + PORT_Y_OFFSET;

        // End at target scene input socket (Left)
        const targetIdx = scenes.findIndex((s) => s.scene_id === targetScene.scene_id);
        const x2 = targetScene.position?.x ?? 80 + (targetIdx >= 0 ? targetIdx * SCENE_STEP_X : 0);
        const y2 = (targetScene.position?.y ?? 170) + PORT_Y_OFFSET;

        // Bezier Curvature Calculation
        const dx = Math.abs(x2 - x1);
        const curvature = Math.max(dx * 0.45, 60);
        const pathData = `M ${x1} ${y1} C ${x1 + curvature} ${y1}, ${x2 - curvature} ${y2}, ${x2} ${y2}`;

        // Midpoint for Apple Frosted Quick Action Capsule
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        return (
          <g
            key={`cable-${scene.scene_id}-${targetScene.scene_id}`}
            className="group/cable"
          >
            {/* ✦ 1. WIDE TRANSPARENT HOVER CAPTURE PATH (Easy Mouse Interaction) */}
            <path
              d={pathData}
              fill="none"
              stroke="transparent"
              strokeWidth="28"
              className="pointer-events-auto cursor-pointer"
            />

            {/* ✦ 2. SUBTLE AMBIENT HALO (Zero-Glow Philosophy - Clean Edge 1px Depth) */}
            <path
              d={pathData}
              fill="none"
              stroke="#EF264C"
              strokeOpacity="0.18"
              strokeWidth="6"
              className="transition-opacity group-hover/cable:stroke-opacity-35"
            />

            {/* ✦ 3. PRIMARY CARMINE RED CABLE (#EF264C) */}
            <path
              d={pathData}
              fill="none"
              stroke="#EF264C"
              strokeWidth="2.5"
              markerEnd="url(#cable-arrow)"
              className="transition-all group-hover/cable:stroke-width-[3px]"
            />

            {/* ✦ 4. MIDPOINT FLOATING ACTION DOCK (APPLE FROSTED MICRO-NODE -> EXPANDS TO CUT/INSERT ON HOVER) */}
            {isEditable && (
              <foreignObject
                x={midX - 65}
                y={midY - 14}
                width={130}
                height={28}
                className="overflow-visible pointer-events-auto"
              >
                <div className="w-full h-full flex items-center justify-center">
                  {/* RESTING STATE: Subtle Apple Frosted Micro-Node (เล็กๆ ไม่กวนสายตา) */}
                  <div
                    className="group-hover/cable:hidden flex items-center justify-center w-[20px] h-[20px] rounded-full bg-[#181822]/90 border border-white/20 shadow-md backdrop-blur-md text-white/50 hover:text-white transition-all cursor-pointer"
                    title="ชี้เพื่อตัดเส้นหรือแทรกฉาก"
                  >
                    <Plus size={10} strokeWidth={2.4} />
                  </div>

                  {/* HOVER / ACTIVE STATE: Expanded Full Action Dock (✂ ตัดเส้น | + แทรก) */}
                  <div className="hidden group-hover/cable:flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#16161E]/95 hover:bg-[#1C1C26] border border-white/25 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.7)] select-none">
                    {/* Disconnect Button (Scissors) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDisconnectScene?.(scene.scene_id);
                      }}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium text-white/80 hover:text-[#EF264C] hover:bg-[#EF264C]/15 transition-all cursor-pointer active:scale-95"
                      title="ตัดเส้นเชื่อมต่อ แยกโหนดนี้ออกอิสระ"
                    >
                      <Scissors size={11} strokeWidth={2.4} />
                      <span>ตัดเส้น</span>
                    </button>

                    {/* Vertical Divider */}
                    <span className="w-px h-2.5 bg-white/20" />

                    {/* Insert Intermediate Scene Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onInsertSceneBetween(scene.scene_id);
                      }}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium text-white/80 hover:text-emerald-400 hover:bg-emerald-500/15 transition-all cursor-pointer active:scale-95"
                      title="แทรกฉากใหม่คั่นกลางตรงนี้"
                    >
                      <Plus size={11} strokeWidth={2.4} />
                      <span>แทรก</span>
                    </button>
                  </div>
                </div>
              </foreignObject>
            )}
          </g>
        );
      })}

      {/* =================================================================== */}
      {/* 2. EMERALD GREEN VERTICAL LOCATION CABLES                           */}
      {/* =================================================================== */}
      {scenes.map((scene, idx) => {
        if (!scene.location_key) return null;

        const locPos = locationPositions?.[scene.location_key];
        const sceneX = scene.position?.x ?? 80 + idx * SCENE_STEP_X;
        const sceneY = scene.position?.y ?? 170;

        // Start from Location Pill bottom center port
        const x1 = locPos ? locPos.x + LOC_PILL_WIDTH / 2 : sceneX + SCENE_WIDTH / 2;
        const y1 = locPos ? locPos.y + LOC_PILL_HEIGHT : 40 + LOC_PILL_HEIGHT;

        // End at Scene Card top center socket
        const x2 = sceneX + SCENE_WIDTH / 2;
        const y2 = sceneY;

        // Vertical Bezier Calculation
        const dy = Math.abs(y2 - y1);
        const curvature = Math.max(dy * 0.5, 25);
        const greenPathData = `M ${x1} ${y1} C ${x1} ${y1 + curvature}, ${x2} ${y2 - curvature}, ${x2} ${y2}`;

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        return (
          <g
            key={`loc-cable-${scene.scene_id}-${scene.location_key}`}
            className="group/loccable"
          >
            {/* ✦ 1. WIDE TRANSPARENT HOVER CAPTURE PATH */}
            <path
              d={greenPathData}
              fill="none"
              stroke="transparent"
              strokeWidth="28"
              className="pointer-events-auto cursor-pointer"
            />

            {/* ✦ 2. EMERALD AMBIENT HALO */}
            <path
              d={greenPathData}
              fill="none"
              stroke="#10B981"
              strokeOpacity="0.18"
              strokeWidth="6"
              className="transition-opacity group-hover/loccable:stroke-opacity-40"
            />

            {/* ✦ 3. PRIMARY EMERALD GREEN CABLE (#10B981) */}
            <path
              d={greenPathData}
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              markerEnd="url(#loc-cable-arrow)"
              className="transition-all group-hover/loccable:stroke-width-[3px]"
            />

            {/* ✦ 4. MIDPOINT FLOATING ACTION DOCK (Apple Frosted Quick Cut Pill) */}
            {isEditable && (
              <foreignObject
                x={midX - 45}
                y={midY - 14}
                width={90}
                height={28}
                className="overflow-visible pointer-events-auto"
              >
                <div className="w-full h-full flex items-center justify-center">
                  {/* RESTING STATE: Subtle Apple Frosted Emerald Micro-Node */}
                  <div
                    className="group-hover/loccable:hidden flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[#14141E]/90 border border-emerald-500/35 shadow-md backdrop-blur-md text-emerald-400/60 hover:text-emerald-300 transition-all cursor-pointer"
                    title="ชี้เพื่อตัดการเชื่อมต่อสถานที่"
                  >
                    <MapPin size={9} strokeWidth={2.4} />
                  </div>

                  {/* HOVER / ACTIVE STATE: Expanded Cut Button */}
                  <div className="hidden group-hover/loccable:flex items-center px-2 py-0.5 rounded-full bg-[#16161E]/95 hover:bg-[#1C1C26] border border-white/20 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.7)] select-none">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDisconnectLocation?.(scene.scene_id);
                      }}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium text-white/85 hover:text-[#EF264C] hover:bg-[#EF264C]/15 transition-all cursor-pointer active:scale-95"
                      title="ตัดสายสถานที่นี้ออกจากฉาก"
                    >
                      <Scissors size={10} strokeWidth={2.4} />
                      <span>ตัดสถานที่</span>
                    </button>
                  </div>
                </div>
              </foreignObject>
            )}
          </g>
        );
      })}

      {/* =================================================================== */}
      {/* 3. ACTIVE LIVE DRAGGING STORY WIRE (RED)                            */}
      {/* =================================================================== */}
      {draggingWire && (
        <g className="pointer-events-none">
          {(() => {
            const x1 = draggingWire.startX;
            const y1 = draggingWire.startY;

            // If snapped to a hovered target node, magnetically lock onto target input port
            const x2 = snappedTargetScene
              ? (snappedTargetScene.position?.x ?? 80)
              : draggingWire.currentX;
            const y2 = snappedTargetScene
              ? (snappedTargetScene.position?.y ?? 170) + PORT_Y_OFFSET
              : draggingWire.currentY;

            const dx = Math.abs(x2 - x1);
            const curvature = Math.max(dx * 0.45, 60);
            const dragPathData = `M ${x1} ${y1} C ${x1 + curvature} ${y1}, ${x2 - curvature} ${y2}, ${x2} ${y2}`;

            return (
              <>
                {/* Dragging Wire Ambient Halo */}
                <path
                  d={dragPathData}
                  fill="none"
                  stroke="#EF264C"
                  strokeOpacity="0.25"
                  strokeWidth="7"
                />

                {/* Dragging Wire Active Pulsing Dashed Line */}
                <path
                  d={dragPathData}
                  fill="none"
                  stroke="#EF264C"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  markerEnd="url(#cable-arrow)"
                />

                {/* Target Snap Ring / Tip Dot */}
                <circle
                  cx={x2}
                  cy={y2}
                  r={snappedTargetScene ? 7 : 5}
                  fill="#EF264C"
                  stroke="#FFFFFF"
                  strokeWidth={snappedTargetScene ? 2.5 : 2}
                  className={snappedTargetScene ? 'animate-ping' : ''}
                />
                <circle
                  cx={x2}
                  cy={y2}
                  r={snappedTargetScene ? 6 : 4}
                  fill="#EF264C"
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                />
              </>
            );
          })()}
        </g>
      )}

      {/* =================================================================== */}
      {/* 4. ACTIVE LIVE DRAGGING LOCATION WIRE (EMERALD GREEN)                */}
      {/* =================================================================== */}
      {draggingLocationWire && (
        <g className="pointer-events-none">
          {(() => {
            const x1 = draggingLocationWire.startX;
            const y1 = draggingLocationWire.startY;

            // If snapped to a hovered target scene, magnetically lock onto target top socket
            const x2 = snappedTargetSceneForLoc
              ? (snappedTargetSceneForLoc.position?.x ?? 80) + SCENE_WIDTH / 2
              : draggingLocationWire.currentX;
            const y2 = snappedTargetSceneForLoc
              ? (snappedTargetSceneForLoc.position?.y ?? 170)
              : draggingLocationWire.currentY;

            const dy = Math.abs(y2 - y1);
            const verticalCurvature = Math.max(dy * 0.5, 30);
            const dragPathData = `M ${x1} ${y1} C ${x1} ${y1 + verticalCurvature}, ${x2} ${y2 - verticalCurvature}, ${x2} ${y2}`;

            return (
              <>
                {/* Dragging Location Wire Ambient Halo */}
                <path
                  d={dragPathData}
                  fill="none"
                  stroke="#10B981"
                  strokeOpacity="0.25"
                  strokeWidth="7"
                />

                {/* Dragging Location Wire Active Pulsing Dashed Line */}
                <path
                  d={dragPathData}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  markerEnd="url(#loc-cable-arrow)"
                />

                {/* Target Snap Ring / Tip Dot */}
                <circle
                  cx={x2}
                  cy={y2}
                  r={snappedTargetSceneForLoc ? 8 : 5}
                  fill="#10B981"
                  stroke="#FFFFFF"
                  strokeWidth={snappedTargetSceneForLoc ? 2.5 : 2}
                  className={snappedTargetSceneForLoc ? 'animate-ping' : ''}
                />
                <circle
                  cx={x2}
                  cy={y2}
                  r={snappedTargetSceneForLoc ? 7 : 4}
                  fill="#10B981"
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                />
              </>
            );
          })()}
        </g>
      )}
    </svg>
  );
}
