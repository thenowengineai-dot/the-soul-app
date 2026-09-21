import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  ZoomIn,
  ZoomOut,
  Sparkles,
  RotateCcw,
  Layers,
} from 'lucide-react';
import type { VaultDraft, WorldScene, WorldScenario } from '../../types';
import { DEFAULT_BOTANICAL_LOCATIONS } from '../../defaultWorldLocations';
import SceneNodeCard from './SceneNodeCard';
import RailroadCableOverlay from './RailroadCableOverlay';

interface RailroadCanvasProps {
  draft: VaultDraft;
  onUpdateDraft?: (updated: Partial<VaultDraft>) => void;
  isEditable?: boolean;
}

// Default 3 Cinematic Scenes for Mahiro if not populated
const DEFAULT_SCENES: WorldScene[] = [
  {
    scene_id: 'scene_01_herbal_chamber',
    title: 'ฉากที่ 1: บททดสอบในห้องสกัดสมุนไพร',
    location_key: 'ห้องสกัดสมุนไพร ณ เรือนพักปีกใน',
    position: { x: 80, y: 100 },
    scene_objective: 'นำตัวอย่างสมุนไพรเฟิร์นหมอกอัคคีมาทำการสกัด และประเมินท่าทีของรุ่นพี่มาฮิโระ',
    forced_chaos_level: 'low',
    event_mood: 'สลัว อึดอัด ชื้นแฉะ และอันตราย',
    director_vision: 'The Slow Burn: ดึงจังหวะให้ช้า เน้นเสียงลมหายใจและระยะประชิด',
    director_setup: 'เสียงฝนกระหน่ำหลังคาไม้สนดังกึกก้อง ตะเกียงน้ำมันส้มสลัวทอดเงายาวไปถึงผนังห้อง',
    premise: 'เมื่อบานเลื่อนห้องพักปีกในถูกลงกลอนไม้ ทั้งคู่ต้องเผชิญหน้ากันข้ามโต๊ะทดลองแคบ 6 เสื่อทาทามิ',
    beats: [
      {
        beat_id: 'Beat 01: บรรยากาศเปิดตัวและละอองฝน',
        director_setup: 'เสียงฝนกระหน่ำหลังคาไม้สนดังกึกก้อง แผ่นหลังพิงแนบฉากกั้นห้องเย็นเยียบ',
        actor_state: 'นั่งก้มหน้านิ่งใช้นิ้วดันดั้งแว่นด้วยความประหม่า เสื้อเชิ้ตขาวบางเปียกชื้นแนบเนื้อ',
        hidden_evaluation_criteria: {
          'เข้าใกล้': { action_result: 'progress', feedback: 'เธอสะดุ้งเล็กน้อยแต่ไม่ขยับหนี' },
        },
        pacing_control: {
          max_turns: 3,
          action_result: 'progress',
          inevitable_consequence: 'ละอองเกสรเริ่มส่งผลต่อสติสัมปชัญญะ',
        },
      },
      {
        beat_id: 'Beat 02: สัมผัสแรกข้ามโต๊ะทดลอง',
        director_setup: 'ไอน้ำชาสมุนไพรดินเผาพ่นควันร้อน กลิ่นเกสรพิษมึนเมาอบอวลไปทั่วห้อง',
        actor_state: 'ค่อยๆ วางโกร่งบดยาหินลงข้างโต๊ะ ปลายนิ้วแตะที่ขอบถ้วยชาอุ่น จ้องมองมาที่คุณ',
        hidden_evaluation_criteria: {
          'แตะมือ': { action_result: 'progress', feedback: 'เธอส่งเสียงกระซิบในลำคอ' },
        },
        pacing_control: {
          max_turns: 3,
          action_result: 'progress',
          inevitable_consequence: 'พายุตัดสะพานข้ามหุบเขา ขังทั้งสองไว้ตลอดคืน',
        },
      },
    ],
  },
  {
    scene_id: 'scene_02_steamy_onsen',
    title: 'ฉากที่ 2: พิษร้อน ณ บ่อออนเซ็นหิน',
    location_key: 'บ่อออนเซ็นหินกลางสายฝน',
    position: { x: 540, y: 100 },
    scene_objective: 'ชำระล้างละอองเกสรพิษที่ซึมเข้าสู่ผิวหนังในบ่อน้ำร้อนกลางพายุฝน',
    forced_chaos_level: 'medium',
    event_mood: 'เปลือยเปล่า อบอวลด้วยไอน้ำร้อน ตัดกับความเย็นยะเยือกของสายฝน',
    director_vision: 'Sensory Overload: ไอน้ำบดบังทัศนวิสัย เหลือเพียงเสียงน้ำและอุณหภูมิ',
    director_setup: 'ไอควันกำมะถันสีขาวลอยปกคลุมผิวน้ำร้อนจนบดบังทัศนวิสัยเหลือไม่เกินสองก้าว',
    premise: 'ลมพายุพัดเสื้อผ้าและผ้าขนหนูปลิวตกน้ำ ทิ้งให้คนทั้งสองต้องลงแช่ในบ่อหินธรรมชาติท่ามกลางสายฝน',
    beats: [
      {
        beat_id: 'Beat 01: การก้าวลงสู่ผืนน้ำร้อน',
        director_setup: 'เสียงสายฝนเม็ดหนาตกลงกระทบผิวน้ำร้อนดังซู่ซ่า ผิวน้ำกระเพื่อมเป็นระลอก',
        actor_state: 'แผ่นหลังพิงโขดหินแกรนิต น้ำลึกถึงหน้าอก ถอดแว่นตาวางไว้ ปิ่นปักผมหลุดลอย',
        hidden_evaluation_criteria: {
          'ก้าวเข้าใกล้': { action_result: 'progress', feedback: 'เธอเบือนหน้าหลบแต่ไม่ถอยหนี' },
        },
        pacing_control: {
          max_turns: 4,
          action_result: 'progress',
          inevitable_consequence: 'ไอน้ำร้อนทำให้พิษกำเริบจนถึงขีดสุด',
        },
      },
    ],
  },
  {
    scene_id: 'scene_03_cliff_shelter',
    title: 'ฉากที่ 3: เพิงหลบฝนริมผากลางป่า',
    location_key: 'เพิงหลบฝนริมผากลางป่า',
    position: { x: 1000, y: 100 },
    scene_objective: 'เอาชีวิตรอดจากดินโคลนถล่มใต้เสื้อกันฝนผืนเดียวกัน',
    forced_chaos_level: 'high',
    event_mood: 'คับแคบ สั่นสะท้าน ชื้นแฉะ และโดดเดี่ยวตัดขาดจากโลกภายนอก',
    director_vision: 'The Final Surrender: บีบให้ไม่มีที่ว่างสำหรับเกราะกำบังทางสังคมอีกต่อไป',
    director_setup: 'ฟ้าแลบแปลบปลาบเป็นระยะสาดแสงสีขาวสว่างวาบ เผยให้เห็นหยดน้ำที่เกาะบนใบหน้า',
    premise: 'ดินโคลนพังทลายตัดขาดทางกลับสู่เรียวกัง บีบให้ทั้งคู่ต้องเบียดชิดกันใต้ชายคาแคบสองตารางเมตร',
    beats: [
      {
        beat_id: 'Beat 01: แสงฟ้าแลบและเสียงฟ้าร้อง',
        director_setup: 'เสียงฟ้าร้องกึกก้องสะท้อนหุบเขา ลมกระโชกพัดละอองน้ำปะทะผิวกาย',
        actor_state: 'เบียดกายเข้าชิดเพื่อหาไออุ่น สองมือยึดชายเสื้อของคุณไว้แน่น สิ้นท่าไร้การควบคุม',
        hidden_evaluation_criteria: {
          'โอบกอด': { action_result: 'progress', feedback: 'เธอฝังใบหน้าลงกับอกของคุณ' },
        },
        pacing_control: {
          max_turns: 3,
          action_result: 'progress',
          inevitable_consequence: 'ก้าวเข้าสู่พิธีกรรมอย่างสมบูรณ์แบบ',
        },
      },
    ],
  },
];

export default function RailroadCanvas({
  draft,
  onUpdateDraft,
  isEditable = true,
}: RailroadCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Viewport Transform (Pan & Zoom)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [zoom, setZoom] = useState<number>(0.9);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const startPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Node Dragging State
  const [draggingSceneId, setDraggingSceneId] = useState<string | null>(null);
  const dragStartPosRef = useRef<{ mouseX: number; mouseY: number; nodeX: number; nodeY: number }>({
    mouseX: 0,
    mouseY: 0,
    nodeX: 0,
    nodeY: 0,
  });

  // Current Scenario Scenes
  const scenario: WorldScenario = draft.scenario || {
    id: 'botanical_scenario_01',
    name: draft.worldTitle || 'Scenario Flow',
    scenes: DEFAULT_SCENES,
  };

  const scenes: WorldScene[] =
    scenario.scenes && scenario.scenes.length > 0 ? scenario.scenes : DEFAULT_SCENES;

  const availableLocations =
    draft.real_locations && Object.keys(draft.real_locations).length > 0
      ? draft.real_locations
      : DEFAULT_BOTANICAL_LOCATIONS;

  // Save changes back to draft
  const handleUpdateScenes = useCallback(
    (newScenes: WorldScene[]) => {
      if (onUpdateDraft) {
        onUpdateDraft({
          scenario: {
            ...scenario,
            scenes: newScenes,
          },
        });
      }
    },
    [onUpdateDraft, scenario]
  );

  // 1. PANNING HANDLERS
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    // Only pan if clicking canvas background (button === 0)
    if (e.button !== 0) return;
    setIsPanning(true);
    startPanRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    };
  };

  // 2. ZOOM HANDLER (WHEEL)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = -e.deltaY * 0.001;
    const newZoom = Math.min(Math.max(zoom + zoomDelta, 0.4), 1.5);
    setZoom(Number(newZoom.toFixed(2)));
  };

  // 3. NODE DRAG HANDLERS
  const handleStartDragNode = (e: React.MouseEvent, sceneId: string) => {
    e.stopPropagation();
    const targetScene = scenes.find((s) => s.scene_id === sceneId);
    if (!targetScene) return;

    setDraggingSceneId(sceneId);
    dragStartPosRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      nodeX: targetScene.position?.x ?? 80,
      nodeY: targetScene.position?.y ?? 100,
    };
  };

  // Global mouse move and up for Pan & Node Drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        setPan({
          x: e.clientX - startPanRef.current.x,
          y: e.clientY - startPanRef.current.y,
        });
      } else if (draggingSceneId) {
        const dx = (e.clientX - dragStartPosRef.current.mouseX) / zoom;
        const dy = (e.clientY - dragStartPosRef.current.mouseY) / zoom;

        const updatedScenes = scenes.map((s) => {
          if (s.scene_id === draggingSceneId) {
            return {
              ...s,
              position: {
                x: Math.round(dragStartPosRef.current.nodeX + dx),
                y: Math.round(dragStartPosRef.current.nodeY + dy),
              },
            };
          }
          return s;
        });
        handleUpdateScenes(updatedScenes);
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      setDraggingSceneId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, draggingSceneId, zoom, scenes, handleUpdateScenes]);

  // 4. SCENE ACTIONS (UPDATE, DELETE, INSERT, ADD)
  const handleUpdateScene = (index: number, updatedScene: WorldScene) => {
    const updated = [...scenes];
    updated[index] = updatedScene;
    handleUpdateScenes(updated);
  };

  const handleDeleteScene = (index: number) => {
    const updated = scenes.filter((_, idx) => idx !== index);
    handleUpdateScenes(updated);
  };

  const handleAddSceneEnd = () => {
    const lastScene = scenes[scenes.length - 1];
    const newX = lastScene?.position?.x ? lastScene.position.x + 460 : 80;
    const newY = lastScene?.position?.y ? lastScene.position.y : 100;

    const newScene: WorldScene = {
      scene_id: `scene_${Date.now()}`,
      title: `ฉากที่ ${scenes.length + 1}: สถานการณ์ใหม่`,
      location_key: Object.keys(availableLocations)[0] || 'ห้องสกัดสมุนไพร ณ เรือนพักปีกใน',
      position: { x: newX, y: newY },
      scene_objective: 'เป้าหมายหลักในฉากนี้...',
      forced_chaos_level: 'low',
      event_mood: 'อารมณ์และบรรยากาศ...',
      director_vision: 'วิสัยทัศน์ผู้กำกับ...',
      director_setup: 'บทบรรยายนำเปิดฉาก...',
      premise: 'เรื่องย่อของฉาก...',
      beats: [
        {
          beat_id: 'Beat 01: จุดเริ่มต้น',
          director_setup: 'บทบรรยายนำเหตุการณ์...',
          actor_state: 'ท่าทางและการตอบสนอง...',
          hidden_evaluation_criteria: {},
          pacing_control: {
            max_turns: 3,
            action_result: 'progress',
            inevitable_consequence: 'ก้าวสู่บีตถัดไป',
          },
        },
      ],
    };

    handleUpdateScenes([...scenes, newScene]);
  };

  const handleInsertSceneBetween = (fromIndex: number) => {
    const sceneA = scenes[fromIndex];
    const sceneB = scenes[fromIndex + 1];

    const posX =
      sceneA?.position && sceneB?.position
        ? Math.round((sceneA.position.x + sceneB.position.x) / 2)
        : (sceneA?.position?.x ?? 80) + 230;

    const posY =
      sceneA?.position && sceneB?.position
        ? Math.round((sceneA.position.y + sceneB.position.y) / 2)
        : 100;

    const insertedScene: WorldScene = {
      scene_id: `scene_mid_${Date.now()}`,
      title: `ฉากคั่น: จังหวะเปลี่ยนผ่าน`,
      location_key: sceneA?.location_key || Object.keys(availableLocations)[0],
      position: { x: posX, y: posY },
      scene_objective: 'ฉากคั่นกลางเพื่อชะลอหรือเร่งจังหวะเรื่องราว...',
      forced_chaos_level: 'medium',
      event_mood: 'ตึงเครียด ชะงักงัน',
      director_vision: 'The Transition: จัดวางจุดพักหรือจุดเปลี่ยนอารมณ์',
      director_setup: 'บรรยายเหตุการณ์ที่เกิดขึ้นกะทันหันระหว่างสองฉาก...',
      premise: 'เหตุการณ์ไม่คาดคิดที่แทรกขึ้นมา...',
      beats: [
        {
          beat_id: 'Beat 01: ชนวนคั่นกลาง',
          director_setup: 'เสียงสิ่งของตกหรือเหตุการณ์ไม่คาดคิด...',
          actor_state: 'ชะงักนิ่ง สายตาสับสน...',
          hidden_evaluation_criteria: {},
          pacing_control: {
            max_turns: 2,
            action_result: 'progress',
            inevitable_consequence: 'มุ่งหน้าสู่ฉากต่อไป',
          },
        },
      ],
    };

    const updated = [...scenes];
    updated.splice(fromIndex + 1, 0, insertedScene);
    handleUpdateScenes(updated);
  };

  const totalBeats = scenes.reduce((acc, s) => acc + (s.beats?.length || 0), 0);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDownCanvas}
      onWheel={handleWheel}
      className={`relative w-full h-full min-h-[640px] flex-1 overflow-hidden select-none cursor-grab active:cursor-grabbing bg-[#0A0A0E] ${
        isPanning ? 'cursor-grabbing' : ''
      }`}
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* ✦ 1. WORLD CANVAS TRANSFORM CONTAINER (SCALED & PANNED) */}
      <div
        className="absolute origin-top-left transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          minWidth: '4000px',
          minHeight: '4000px',
        }}
      >
        {/* SVG Bezier Railroad Cable Overlay */}
        <RailroadCableOverlay
          scenes={scenes}
          onInsertSceneBetween={handleInsertSceneBetween}
          isEditable={isEditable}
        />

        {/* Render Each Scene Node Card */}
        {scenes.map((scene, idx) => (
          <SceneNodeCard
            key={scene.scene_id || idx}
            scene={scene}
            index={idx}
            availableLocations={availableLocations}
            onUpdateScene={(updated) => handleUpdateScene(idx, updated)}
            onDeleteScene={() => handleDeleteScene(idx)}
            onStartDrag={handleStartDragNode}
            isEditable={isEditable}
          />
        ))}
      </div>

      {/* ✦ 2. FLOATING HUD TOOLBAR (APPLE TACTILE DOCK) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 rounded-full bg-[#16161E]/90 backdrop-blur-2xl border border-white/12 shadow-[0_12px_32px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.12)] z-30 pointer-events-auto">
        {/* Scene & Beat Counter Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 text-[11.5px] font-medium text-white/75 border-r border-white/10">
          <Layers size={13} className="text-[#EF264C]" />
          <span>{scenes.length} ฉาก</span>
          <span className="text-white/25">•</span>
          <span>{totalBeats} บีต</span>
        </div>

        {/* Add Scene Button */}
        {isEditable && (
          <button
            type="button"
            onClick={handleAddSceneEnd}
            className="px-3.5 py-1.5 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-[0_2px_10px_rgba(239,38,76,0.35)] active:scale-95 transition-all cursor-pointer select-none"
          >
            <Plus size={13} strokeWidth={2.4} />
            <span>เพิ่มฉากใหม่</span>
          </button>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 pl-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(Number((z - 0.1).toFixed(2)), 0.4))}
            className="w-7 h-7 rounded-full bg-white/[0.04] hover:bg-white/[0.12] text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="ซูมออก (-)"
          >
            <ZoomOut size={12} strokeWidth={2.2} />
          </button>
          <span className="text-[11px] font-mono text-white/60 w-10 text-center select-none">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(Number((z + 0.1).toFixed(2)), 1.5))}
            className="w-7 h-7 rounded-full bg-white/[0.04] hover:bg-white/[0.12] text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="ซูมเข้า (+)"
          >
            <ZoomIn size={12} strokeWidth={2.2} />
          </button>

          {/* Reset Zoom / Center Button */}
          <button
            type="button"
            onClick={() => {
              setZoom(0.9);
              setPan({ x: 40, y: 30 });
            }}
            className="w-7 h-7 rounded-full bg-white/[0.04] hover:bg-white/[0.12] text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer ml-0.5"
            title="จัดกึ่งกลางมุมมอง"
          >
            <RotateCcw size={11} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* ✦ 3. TOP-LEFT CANVAS INSTRUCTION HINT */}
      <div className="absolute top-4 left-6 flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-xl border border-white/[0.08] text-[10.5px] text-white/40 pointer-events-none z-20">
        <Sparkles size={11} className="text-[#EF264C]" />
        <span>ลากเมาส์เลื่อนผืนผ้าใบ • หมุนลูกกลิ้งเพื่อซูม • ลากหัวการ์ดย้ายตำแหน่ง</span>
      </div>
    </div>
  );
}
