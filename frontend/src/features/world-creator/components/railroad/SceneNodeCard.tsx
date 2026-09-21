import { useState, type MouseEvent } from 'react';
import {
  GripHorizontal,
  MapPin,
  Plus,
  Trash2,
  ChevronDown,
  Pencil,
  Check,
} from 'lucide-react';
import type { WorldScene, WorldBeat, WorldLocationsMap } from '../../types';
import BeatStackItem from './BeatStackItem';

interface SceneNodeCardProps {
  scene: WorldScene;
  index: number;
  availableLocations?: WorldLocationsMap;
  onUpdateScene: (updated: WorldScene) => void;
  onDeleteScene: () => void;
  onStartDrag: (e: MouseEvent, sceneId: string) => void;
  isEditable?: boolean;
}

export default function SceneNodeCard({
  scene,
  index,
  availableLocations,
  onUpdateScene,
  onDeleteScene,
  onStartDrag,
  isEditable = true,
}: SceneNodeCardProps) {
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [sceneTitle, setSceneTitle] = useState(scene.title || `ฉากที่ ${index + 1}`);
  const [sceneObjective, setSceneObjective] = useState(scene.scene_objective || '');
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);

  const locKeys = availableLocations ? Object.keys(availableLocations) : [];
  const currentLocationKey = scene.location_key || locKeys[0] || 'ยังไม่ได้ระบุสถานที่';

  const handleSaveHeader = () => {
    setIsEditingHeader(false);
    onUpdateScene({
      ...scene,
      title: sceneTitle.trim() || `ฉากที่ ${index + 1}`,
      scene_objective: sceneObjective.trim(),
    });
  };

  const handleSelectLocation = (locKey: string) => {
    setIsSelectingLocation(false);
    onUpdateScene({
      ...scene,
      location_key: locKey,
    });
  };

  // Beat management
  const handleUpdateBeat = (beatIndex: number, updatedBeat: WorldBeat) => {
    const updatedBeats = [...(scene.beats || [])];
    updatedBeats[beatIndex] = updatedBeat;
    onUpdateScene({
      ...scene,
      beats: updatedBeats,
    });
  };

  const handleDeleteBeat = (beatIndex: number) => {
    const updatedBeats = (scene.beats || []).filter((_, idx) => idx !== beatIndex);
    onUpdateScene({
      ...scene,
      beats: updatedBeats,
    });
  };

  const handleInsertBeatAfter = (beatIndex: number) => {
    const newBeat: WorldBeat = {
      beat_id: `Beat ${scene.beats?.length ? scene.beats.length + 1 : 1}: จังหวะใหม่`,
      director_setup: 'ไดเรกเตอร์เซ็ตอัป: บรรยายเหตุการณ์และสภาพแวดล้อมใหม่...',
      actor_state: 'ภาษากายและการตอบสนองของตัวละคร...',
      hidden_evaluation_criteria: {
        'เข้าใกล้': { action_result: 'progress', feedback: 'ตัวละครมีท่าทีผ่อนคลาย' },
      },
      pacing_control: {
        max_turns: 3,
        action_result: 'progress',
        inevitable_consequence: 'เรื่องราวดำเนินสู่ขั้นต่อไป',
      },
    };

    const currentBeats = [...(scene.beats || [])];
    currentBeats.splice(beatIndex + 1, 0, newBeat);
    onUpdateScene({
      ...scene,
      beats: currentBeats,
    });
  };

  const handleAddBeatEnd = () => {
    const newBeat: WorldBeat = {
      beat_id: `Beat ${(scene.beats?.length || 0) + 1}: เหตุการณ์ต่อมา`,
      director_setup: 'บทบรรยายนำสำหรับบีตใหม่...',
      actor_state: 'ท่าทางและการตอบสนอง...',
      hidden_evaluation_criteria: {},
      pacing_control: {
        max_turns: 3,
        action_result: 'progress',
        inevitable_consequence: 'จบฉาก',
      },
    };
    onUpdateScene({
      ...scene,
      beats: [...(scene.beats || []), newBeat],
    });
  };

  const beats = scene.beats || [];

  return (
    <div
      className="absolute w-[360px] sm:w-[380px] rounded-[24px] bg-[#141419]/95 backdrop-blur-2xl border border-white/12 shadow-[0_16px_48px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.12)] flex flex-col transition-shadow hover:border-white/20 select-none group/node"
      style={{
        left: scene.position?.x ?? 80 + index * 440,
        top: scene.position?.y ?? 120,
      }}
    >
      {/* ✦ RAIL CONNECTOR PORTS (PORTS FOR THE RAILROAD CABLES) */}
      {/* Input Port (Left) */}
      <div
        className="absolute -left-[9px] top-6 w-[18px] h-[18px] rounded-full bg-[#1A1A22] border-2 border-white/40 group-hover/node:border-[#EF264C] shadow-[0_0_8px_rgba(239,38,76,0.3)] flex items-center justify-center pointer-events-none z-10"
        title="Input Port (รับขบวนรถไฟจากฉากก่อนหน้า)"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-[#EF264C]" />
      </div>

      {/* Output Port (Right) */}
      <div
        className="absolute -right-[9px] top-6 w-[18px] h-[18px] rounded-full bg-[#1A1A22] border-2 border-white/40 group-hover/node:border-[#EF264C] shadow-[0_0_8px_rgba(239,38,76,0.3)] flex items-center justify-center pointer-events-none z-10"
        title="Output Port (ส่งรางรถไฟต่อไปยังฉากถัดไป)"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-[#EF264C]" />
      </div>

      {/* ✦ 1. DRAGGABLE SCENE HEADER BAR */}
      <div
        onMouseDown={(e) => onStartDrag(e, scene.scene_id)}
        className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing bg-white/[0.02] hover:bg-white/[0.04] rounded-t-[24px] transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <GripHorizontal size={14} className="text-white/30 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#EF264C] font-semibold">
                SCENE {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-white/20 text-[10px]">•</span>
              <span className="text-[10px] text-white/40 uppercase">
                {beats.length} บีต
              </span>
            </div>
            {!isEditingHeader ? (
              <h3 className="text-[13.5px] font-semibold text-[#F1F1F1] tracking-tight truncate">
                {scene.title || `ฉากที่ ${index + 1}`}
              </h3>
            ) : (
              <div className="space-y-1">
                <input
                  type="text"
                  value={sceneTitle}
                  onChange={(e) => setSceneTitle(e.target.value)}
                  autoFocus
                  placeholder="ชื่อฉาก..."
                  className="w-full bg-black/50 border border-white/20 rounded px-1.5 py-0.5 text-[12px] text-white outline-none"
                />
                <input
                  type="text"
                  value={sceneObjective}
                  onChange={(e) => setSceneObjective(e.target.value)}
                  placeholder="เป้าหมายของฉาก (Scene Objective)..."
                  className="w-full bg-black/50 border border-white/20 rounded px-1.5 py-0.5 text-[11px] text-white/70 outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Header Actions */}
        {isEditable && (
          <div
            className="flex items-center gap-1 shrink-0"
            onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking buttons
          >
            {isEditingHeader ? (
              <button
                type="button"
                onClick={handleSaveHeader}
                className="w-6 h-6 rounded-full bg-[#EF264C] text-white flex items-center justify-center cursor-pointer shadow-[0_2px_8px_rgba(239,38,76,0.4)]"
              >
                <Check size={11} strokeWidth={2.4} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingHeader(true)}
                className="w-6 h-6 rounded-full bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 text-white/60 hover:text-white flex items-center justify-center cursor-pointer transition-all"
                title="แก้ไขชื่อฉาก"
              >
                <Pencil size={10} strokeWidth={2} />
              </button>
            )}
            <button
              type="button"
              onClick={onDeleteScene}
              className="w-6 h-6 rounded-full bg-white/[0.04] hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white/40 hover:text-red-300 flex items-center justify-center cursor-pointer transition-all"
              title="ลบฉากนี้"
            >
              <Trash2 size={10} strokeWidth={2} />
            </button>
          </div>
        )}
      </div>

      {/* ✦ 2. LOCATION BINDING SOCKET (1 SCENE = 1 LOCATION) */}
      <div className="px-4 py-2.5 bg-black/25 border-b border-white/[0.06] flex items-center justify-between gap-2 relative">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin size={12} className="text-emerald-400 shrink-0" />
          <span className="text-[10.5px] uppercase font-medium text-white/40 tracking-wider shrink-0">
            สถานที่:
          </span>
          <span className="text-[11.5px] text-[#EDEDED] font-medium truncate">
            {currentLocationKey}
          </span>
        </div>

        {isEditable && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSelectingLocation(!isSelectingLocation)}
              className="px-2 py-0.5 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-white/70 hover:text-white text-[10.5px] font-medium flex items-center gap-1 transition-all cursor-pointer select-none"
            >
              <span>เปลี่ยน</span>
              <ChevronDown size={10} />
            </button>

            {/* Location Selector Popup Menu */}
            {isSelectingLocation && (
              <div className="absolute right-0 top-full mt-1.5 w-[220px] rounded-[16px] bg-[#181820] border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.8)] p-1.5 z-30 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] uppercase font-mono text-white/40 px-2 py-1">
                  เลือกสถานที่ผูกกับฉากนี้
                </div>
                {locKeys.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectLocation(key)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-[10px] text-[11.5px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                      key === currentLocationKey
                        ? 'bg-[#EF264C]/20 text-white border border-[#EF264C]/30'
                        : 'text-white/70 hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="truncate">{key}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ✦ 3. SCENE DIRECTIVE BRIEFING */}
      {scene.scene_objective && (
        <div className="px-4 py-2 text-[11px] text-white/50 border-b border-white/[0.04] bg-white/[0.01]">
          <span className="text-white/30 uppercase font-mono mr-1.5">GOAL:</span>
          <span className="text-[#D6D6DC] leading-relaxed">{scene.scene_objective}</span>
        </div>
      )}

      {/* ✦ 4. BEATS STACK CONTAINER */}
      <div className="p-3.5 space-y-2 max-h-[480px] overflow-y-auto custom-scrollbar">
        {beats.length > 0 ? (
          beats.map((beat, idx) => (
            <BeatStackItem
              key={beat.beat_id || idx}
              beat={beat}
              index={idx}
              totalBeats={beats.length}
              onUpdateBeat={(updated) => handleUpdateBeat(idx, updated)}
              onDeleteBeat={() => handleDeleteBeat(idx)}
              onInsertBeatAfter={() => handleInsertBeatAfter(idx)}
              isEditable={isEditable}
            />
          ))
        ) : (
          <div className="text-center py-6 text-white/30 text-[12px] italic border border-dashed border-white/10 rounded-[16px]">
            ยังไม่มีบีตในฉากนี้
          </div>
        )}

        {/* Add Beat at End of Scene Button */}
        {isEditable && (
          <button
            type="button"
            onClick={handleAddBeatEnd}
            className="w-full py-2 rounded-[14px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-[11.5px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98 select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            <Plus size={12} strokeWidth={2.2} />
            <span>เพิ่มบีตท้ายฉาก</span>
          </button>
        )}
      </div>
    </div>
  );
}
