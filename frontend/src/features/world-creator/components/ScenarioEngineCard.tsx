import React, { useState } from 'react';
import {
  Film,
  Sparkles,
  Plus,
  Trash2,
  Clock,
  Compass,
  Zap,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  X,
  Volume2,
  Pencil,
  Check,
} from 'lucide-react';
import type {
  WorldScenario,
  WorldScene,
  WorldBeat,
  PlayerTriggerAction,
} from '../types';

interface ScenarioEngineCardProps {
  scenario: WorldScenario;
  onUpdateScenario?: (updated: WorldScenario) => void;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ScenarioEngineCard({
  scenario,
  onUpdateScenario,
  cardRef,
}: ScenarioEngineCardProps) {
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number>(0);
  const [isCrossfading, setIsCrossfading] = useState<boolean>(false);

  // =========================================================================
  // 🌟 DIRECTOR'S BRIEFING EDIT STATE (สเลทผู้กำกับ)
  // =========================================================================
  const [isEditingBriefing, setIsEditingBriefing] = useState<boolean>(false);
  const [editPremise, setEditPremise] = useState<string>('');
  const [editObjective, setEditObjective] = useState<string>('');
  const [editDirectorSetup, setEditDirectorSetup] = useState<string>('');
  const [editEventMood, setEditEventMood] = useState<string>('');
  const [editDirectorVision, setEditDirectorVision] = useState<string>('');

  // =========================================================================
  // 🌟 PER-BEAT EDIT STATE (แก้ไขทีละบีต)
  // =========================================================================
  const [editingBeatIndex, setEditingBeatIndex] = useState<number | null>(null);
  const [editBeatId, setEditBeatId] = useState<string>('');
  const [editBeatVo, setEditBeatVo] = useState<string>('');
  const [editActorState, setEditActorState] = useState<string>('');
  const [editChoices, setEditChoices] = useState<
    Record<string, { action_result: PlayerTriggerAction; feedback?: string }>
  >({});
  const [editMaxTurns, setEditMaxTurns] = useState<number>(3);
  const [editInevitableConsequence, setEditInevitableConsequence] = useState<string>('');

  const scenes = scenario?.scenes || [];
  const currentScene: WorldScene | undefined = scenes[selectedSceneIndex] || scenes[0];

  // สลับ Scene พร้อม Apple Crossfade Animation
  const handleSelectScene = (index: number) => {
    if (index === selectedSceneIndex) return;
    setIsCrossfading(true);
    setIsEditingBriefing(false);
    setEditingBeatIndex(null);
    setTimeout(() => {
      setSelectedSceneIndex(index);
      setIsCrossfading(false);
    }, 120);
  };

  // อัปเดตข้อมูล Scene
  const handleUpdateCurrentScene = (updater: (scene: WorldScene) => WorldScene) => {
    if (!onUpdateScenario || !currentScene) return;
    const updatedScenes = [...scenes];
    updatedScenes[selectedSceneIndex] = updater(JSON.parse(JSON.stringify(currentScene)));
    onUpdateScenario({
      ...scenario,
      scenes: updatedScenes,
    });
  };

  // =========================================================================
  // BRIEFING EDIT HANDLERS
  // =========================================================================
  const handleStartEditBriefing = () => {
    if (!currentScene) return;
    setEditPremise(currentScene.premise || '');
    setEditObjective(currentScene.scene_objective || '');
    setEditDirectorSetup(currentScene.director_setup || '');
    setEditEventMood(currentScene.event_mood || '');
    setEditDirectorVision(currentScene.director_vision || '');
    setIsEditingBriefing(true);
  };

  const handleCancelEditBriefing = () => {
    setIsEditingBriefing(false);
  };

  const handleSaveBriefing = () => {
    handleUpdateCurrentScene((scene) => ({
      ...scene,
      premise: editPremise,
      scene_objective: editObjective,
      director_setup: editDirectorSetup,
      event_mood: editEventMood,
      director_vision: editDirectorVision,
    }));
    setIsEditingBriefing(false);
  };

  // =========================================================================
  // BEAT EDIT HANDLERS
  // =========================================================================
  const handleStartEditBeat = (bIdx: number) => {
    if (!currentScene?.beats[bIdx]) return;
    const b = currentScene.beats[bIdx];
    setEditBeatId(b.beat_id);
    setEditBeatVo(b.director_setup || '');
    setEditActorState(b.actor_state);
    setEditChoices(JSON.parse(JSON.stringify(b.hidden_evaluation_criteria || {})));
    setEditMaxTurns(b.pacing_control?.max_turns || 3);
    setEditInevitableConsequence(b.pacing_control?.inevitable_consequence || '');
    setEditingBeatIndex(bIdx);
  };

  const handleCancelEditBeat = () => {
    setEditingBeatIndex(null);
  };

  const handleSaveBeat = () => {
    if (editingBeatIndex === null || !currentScene?.beats[editingBeatIndex]) return;
    handleUpdateCurrentScene((scene) => {
      const beats = [...scene.beats];
      beats[editingBeatIndex] = {
        ...beats[editingBeatIndex],
        beat_id: editBeatId.trim() || beats[editingBeatIndex].beat_id,
        director_setup: editBeatVo.trim() ? editBeatVo.trim() : undefined,
        actor_state: editActorState,
        hidden_evaluation_criteria: editChoices,
        pacing_control: {
          ...beats[editingBeatIndex].pacing_control,
          max_turns: editMaxTurns,
          inevitable_consequence: editInevitableConsequence,
        },
      };
      return { ...scene, beats };
    });
    setEditingBeatIndex(null);
  };

  // เพิ่ม Scene ใหม่
  const handleAddScene = () => {
    if (!onUpdateScenario) return;
    const newIdx = scenes.length + 1;
    const newScene: WorldScene = {
      scene_id: `scene_${newIdx}`,
      scene_objective: `[เป้าหมายซีน ${newIdx}]: คำอธิบายเป้าหมายของ AI ในซีนนี้`,
      forced_chaos_level: 'low',
      event_mood: 'สงบ ลึกลับ ตึงเครียด',
      director_vision: 'The Slow Burn: สร้างความกระอักกระอ่วน ห้ามรีบร้อน',
      director_setup: '[🔥 SYSTEM DIRECTIVE]: บรีฟผู้กำกับฉาก...',
      premise: 'ปูมหลังและบริบทของฉากนี้...',
      beats: [
        {
          beat_id: `scene_${newIdx}_beat_1`,
          actor_state:
            'Player Anchor: ยืนระยะห่าง 1 เมตรตรงหน้า [PLAYER] | 3D Geometry: ท่ายืนตรงแต่อ่อนน้อม | Skin Micro-Details: แววตาสั่นไหวเบาๆ | Wardrobe Continuity: สวมชุดลำลองสุภาพ',
          hidden_evaluation_criteria: {
            'หาก [PLAYER] พูดตอบรับอย่างเป็นมิตร': {
              action_result: 'progress',
              feedback: 'ตัวละครยิ้มรับและเริ่มเปิดใจ',
            },
            'หาก [PLAYER] ปฏิเสธหรือถอยห่าง': {
              action_result: 'loop',
              feedback: 'ตัวละครยืนนิ่งและย้ำคำถามเดิม',
            },
          },
          pacing_control: {
            max_turns: 3,
            action_result: 'progress',
            inevitable_consequence: 'เกิดเหตุการณ์บังคับตัดเข้าสู่ฉากถัดไป',
          },
        },
      ],
    };
    onUpdateScenario({
      ...scenario,
      scenes: [...scenes, newScene],
    });
    setSelectedSceneIndex(scenes.length);
  };

  // ลบ Scene
  const handleDeleteScene = (e: React.MouseEvent, indexToDelete: number) => {
    e.stopPropagation();
    if (scenes.length <= 1) return;
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ Scene นี้พร้อม Beats ทั้งหมดภายใน?')) return;
    const updatedScenes = scenes.filter((_, i) => i !== indexToDelete);
    onUpdateScenario?.({
      ...scenario,
      scenes: updatedScenes,
    });
    if (selectedSceneIndex >= updatedScenes.length) {
      setSelectedSceneIndex(Math.max(0, updatedScenes.length - 1));
    }
  };

  // เพิ่ม Beat ใน Scene ปัจจุบัน
  const handleAddBeat = (insertAtIndex?: number) => {
    if (!currentScene) return;
    handleUpdateCurrentScene((scene) => {
      const beats = [...scene.beats];
      const targetIndex = insertAtIndex ?? beats.length;
      const newBeatId = `${scene.scene_id}_beat_${beats.length + 1}`;
      const newBeat: WorldBeat = {
        beat_id: newBeatId,
        actor_state:
          'Player Anchor: ยืนระยะห่าง 1 เมตรตรงหน้า [PLAYER] | 3D Geometry: ท่าทางระแวดระวัง | Skin Micro-Details: ผิวระเรื่อสีชมพูบางๆ | Wardrobe Continuity: เสื้อผ้าเปียกชื้นเล็กน้อย',
        hidden_evaluation_criteria: {
          'ทางเลือกเดินหน้า (Progress)': {
            action_result: 'progress',
            feedback: 'เนื้อเรื่องดำเนินต่อไป',
          },
          'ทางเลือกวนซ้ำ (Loop)': {
            action_result: 'loop',
            feedback: 'ยังคงยึดพื้นที่เดิม',
          },
        },
        pacing_control: {
          max_turns: 3,
          action_result: 'progress',
          inevitable_consequence: 'บทลงโทษหรือเหตุการณ์บังคับเมื่อผู้เล่นคุยยืดเยื้อ',
        },
      };
      beats.splice(targetIndex, 0, newBeat);
      return { ...scene, beats };
    });
  };

  // ลบ Beat
  const handleDeleteBeat = (beatIndex: number) => {
    if (!currentScene || currentScene.beats.length <= 1) return;
    if (editingBeatIndex === beatIndex) {
      setEditingBeatIndex(null);
    }
    handleUpdateCurrentScene((scene) => ({
      ...scene,
      beats: scene.beats.filter((_, i) => i !== beatIndex),
    }));
  };

  // เพิ่ม Choice ใน Beat
  const handleAddChoice = (beatIndex: number) => {
    if (!currentScene) return;
    handleUpdateCurrentScene((scene) => {
      const beats = [...scene.beats];
      const beat = beats[beatIndex];
      const currentChoices = { ...beat.hidden_evaluation_criteria };
      let counter = 1;
      let newKey = `หาก [PLAYER] เลือกทางเลือกใหม่ ${counter}`;
      while (currentChoices[newKey]) {
        counter++;
        newKey = `หาก [PLAYER] เลือกทางเลือกใหม่ ${counter}`;
      }
      currentChoices[newKey] = {
        action_result: 'progress',
        feedback: 'ผลลัพธ์ใหม่',
      };
      beats[beatIndex] = { ...beat, hidden_evaluation_criteria: currentChoices };
      return { ...scene, beats };
    });
  };

  // ลบ Choice ใน Beat
  const handleDeleteChoice = (beatIndex: number, choiceKey: string) => {
    if (!currentScene) return;
    handleUpdateCurrentScene((scene) => {
      const beats = [...scene.beats];
      const beat = beats[beatIndex];
      const currentChoices = { ...beat.hidden_evaluation_criteria };
      delete currentChoices[choiceKey];
      beats[beatIndex] = { ...beat, hidden_evaluation_criteria: currentChoices };
      return { ...scene, beats };
    });
  };

  // สลับ Action Result ของ Choice
  const handleToggleChoiceAction = (
    beatIndex: number,
    choiceKey: string,
    nextAction: PlayerTriggerAction
  ) => {
    if (!currentScene) return;
    handleUpdateCurrentScene((scene) => {
      const beats = [...scene.beats];
      const beat = beats[beatIndex];
      const currentChoices = { ...beat.hidden_evaluation_criteria };
      if (currentChoices[choiceKey]) {
        currentChoices[choiceKey] = {
          ...currentChoices[choiceKey],
          action_result: nextAction,
        };
      }
      beats[beatIndex] = { ...beat, hidden_evaluation_criteria: currentChoices };
      return { ...scene, beats };
    });
  };

  if (!currentScene) {
    return null;
  }

  return (
    <div
      ref={cardRef}
      className="scroll-mt-4 rounded-2xl bg-[#121214]/60 backdrop-blur-md border border-[#2F3336] flex flex-col gap-0 overflow-hidden shadow-2xl transition-all"
    >
      {/* ========================================================================= */}
      {/* 1. COLLAPSIBLE STICKY TIMELINE RAIL (แผงรางรถไฟแนวนอน)                     */}
      {/* ========================================================================= */}
      <div className="sticky top-0 z-20 bg-[#090909]/90 backdrop-blur-xl border-b border-[#2F3336]/80 px-4 sm:px-5 py-3.5 transition-all">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#EF264C] shadow-[0_0_8px_rgba(239,38,76,0.5)]" />
            <h3 className="text-[13px] sm:text-[14px] font-bold text-[#F2F2F5] tracking-wider uppercase flex items-center gap-1.5">
              <Film size={14} className="text-[#EF264C]" />
              <span>TIMELINE RAIL (แผงรางรถไฟ)</span>
            </h3>
          </div>
          <span className="text-[11px] font-medium text-[#ACACB2] tracking-wider uppercase bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
            Scene {selectedSceneIndex + 1} / {scenes.length}
          </span>
        </div>

        {/* รางรถไฟแนวนอนเชื่อมโยง Scene ต่างๆ */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 pt-0.5">
          {scenes.map((scene, idx) => {
            const isActive = idx === selectedSceneIndex;
            return (
              <div key={scene.scene_id || idx} className="flex items-center gap-2 shrink-0 group">
                <button
                  type="button"
                  onClick={() => handleSelectScene(idx)}
                  className={`px-3 py-1.5 rounded-full text-[12.5px] sm:text-[13px] font-medium transition-all flex items-center gap-2 select-none cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-[#1D1D1F] border border-[#EF264C]/70 text-[#F2F2F5] shadow-sm'
                      : 'bg-transparent border border-[#2F3336] text-[#ACACB2] hover:text-[#F2F2F5] hover:border-white/20'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full transition-all ${
                      isActive
                        ? 'bg-[#EF264C] shadow-[0_0_6px_rgba(239,38,76,0.6)]'
                        : 'bg-[#ACACB2]/40 group-hover:bg-[#ACACB2]'
                    }`}
                  />
                  <span className="font-bold tracking-tight">SCENE {idx + 1}</span>
                  {scene.scene_id && (
                    <span className="text-[11.5px] text-[#ACACB2] max-w-[120px] truncate hidden sm:inline">
                      {scene.scene_id.replace(/^scene_\d+_?/, '').replace(/_/g, ' ')}
                    </span>
                  )}
                  {scenes.length > 1 && (
                    <span
                      onClick={(e) => handleDeleteScene(e, idx)}
                      title="ลบ Scene นี้"
                      className="opacity-0 group-hover:opacity-100 hover:text-[#EF264C] p-0.5 transition-opacity"
                    >
                      <X size={12} />
                    </span>
                  )}
                </button>

                {/* เส้นเชื่อมระหว่าง Node */}
                {idx < scenes.length - 1 && (
                  <div className="w-4 h-[1.5px] bg-[#2F3336] shrink-0" />
                )}
              </div>
            );
          })}

          {/* ปุ่ม + Add Scene */}
          <button
            type="button"
            onClick={handleAddScene}
            className="px-2.5 py-1.5 rounded-full border border-dashed border-[#2F3336] hover:border-[#EF264C]/60 text-[#ACACB2] hover:text-[#EF264C] text-[12px] font-semibold flex items-center gap-1 shrink-0 transition-all active:scale-95 cursor-pointer ml-1"
          >
            <Plus size={13} strokeWidth={2.2} />
            <span>ADD SCENE</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DIRECTOR'S BRIEFING (The Film Slate Card)                               */}
      {/* ========================================================================= */}
      <div
        className={`p-4 sm:p-5 space-y-4 transition-all duration-200 ${
          isCrossfading ? 'opacity-30 translate-y-1' : 'opacity-100 translate-y-0'
        }`}
      >
        <div
          className={`rounded-xl p-4 sm:p-4.5 space-y-3.5 transition-all ${
            isEditingBriefing
              ? 'bg-[#1D1D1F]/70 border border-[#EF264C]/60 shadow-[0_0_16px_rgba(239,38,76,0.12)]'
              : 'bg-[#1D1D1F]/50 border border-[#2F3336]'
          }`}
        >
          {/* Briefing Header พร้อมปุ่มดินสอกลม [ ✏️ ] / [ ✕ ] [ ✓ ] */}
          <div className="flex items-center justify-between border-b border-[#2F3336]/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C]" />
              <h4
                className={`text-[12.5px] sm:text-[13px] font-bold uppercase tracking-wider ${
                  isEditingBriefing ? 'text-[#EF264C]' : 'text-[#F2F2F5]'
                }`}
              >
                🎬 {isEditingBriefing ? 'แก้ไขบรีฟภาพรวมประจำซีน' : "DIRECTOR'S BRIEFING (บรีฟภาพรวมประจำซีน)"}
              </h4>
            </div>

            {/* ปุ่มดินสอกลมสไตล์มาตรฐานของเรา */}
            {isEditingBriefing ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleCancelEditBriefing}
                  title="ยกเลิกการแก้ไข"
                  className="w-8 h-8 rounded-full bg-transparent border border-[#2F3336] hover:border-white/30 text-[#ACACB2] hover:text-[#F2F2F5] flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 select-none"
                >
                  <X size={14} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={handleSaveBriefing}
                  title="บันทึกบรีฟผู้กำกับ"
                  className="w-8 h-8 rounded-full border border-[#EF264C]/70 bg-[#EF264C]/15 hover:bg-[#EF264C] text-[#EF264C] hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 shadow-[0_0_10px_rgba(239,38,76,0.2)] select-none"
                >
                  <Check size={14} strokeWidth={2.2} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartEditBriefing}
                title="แก้ไขบรีฟผู้กำกับประจำซีนนี้"
                className="w-8 h-8 rounded-full bg-transparent border border-[#2F3336] hover:border-[#EF264C]/60 text-[#ACACB2] hover:text-[#EF264C] flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 select-none"
              >
                <Pencil size={14} strokeWidth={1.8} />
              </button>
            )}
          </div>

          {/* THE SCENE PREMISE */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11.5px] font-bold text-[#EF264C] uppercase tracking-wider">
              <span>📖 THE SCENE PREMISE (ปูมหลัง & บริบทความอึดอัด)</span>
            </div>
            {isEditingBriefing ? (
              <textarea
                value={editPremise}
                onChange={(e) => setEditPremise(e.target.value)}
                rows={3}
                placeholder="ปูมหลังและบริบทความอึดอัดของฉากนี้..."
                className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13px] rounded-xl p-2.5 outline-none resize-none leading-relaxed transition-colors font-normal"
              />
            ) : (
              <p className="text-[13px] sm:text-[13.5px] text-[#F2F2F5]/90 leading-relaxed font-normal bg-black/20 p-2.5 rounded-lg border border-white/5">
                {currentScene.premise || 'ยังไม่มีการระบุปูมหลังของฉาก'}
              </p>
            )}
          </div>

          {/* THE NORTH STAR */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#EF264C] uppercase tracking-wider">
              <Compass size={13} className="text-[#EF264C]" />
              <span>THE NORTH STAR (เป้าหมายสูงสุดของ AI ในซีนนี้)</span>
            </div>
            {isEditingBriefing ? (
              <input
                type="text"
                value={editObjective}
                onChange={(e) => setEditObjective(e.target.value)}
                placeholder="เป้าหมายสูงสุดของ AI ในซีนนี้..."
                className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13px] font-semibold rounded-xl px-3 py-2 outline-none transition-colors"
              />
            ) : (
              <p className="text-[13px] sm:text-[13.5px] text-[#F2F2F5] font-semibold bg-black/20 p-2.5 rounded-lg border border-white/5">
                {currentScene.scene_objective}
              </p>
            )}
          </div>

          {/* DIRECTOR'S BRIEF */}
          <div className="space-y-1">
            <div className="text-[11.5px] font-bold text-[#ACACB2] uppercase tracking-wider">
              🎥 DIRECTOR'S BRIEF (คำสั่งคุมโทนผู้กำกับ)
            </div>
            {isEditingBriefing ? (
              <textarea
                value={editDirectorSetup}
                onChange={(e) => setEditDirectorSetup(e.target.value)}
                rows={2}
                placeholder="คำสั่งคุมโทนภาพรวมของผู้กำกับ..."
                className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[12.5px] rounded-xl p-2.5 outline-none resize-none leading-relaxed transition-colors font-normal"
              />
            ) : (
              <p className="text-[12.5px] sm:text-[13px] text-[#ACACB2] leading-relaxed bg-black/20 p-2.5 rounded-lg border border-white/5">
                {currentScene.director_setup}
              </p>
            )}
          </div>

          {/* CHAOS LEVEL (Apple Segmented Pill Switch) - สวิตช์ทันใจ */}
          <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#ACACB2] uppercase tracking-wider">
              <Zap size={13} className="text-amber-400" />
              <span>CHAOS LEVEL (ระดับความปั่นป่วน)</span>
            </div>
            <div className="inline-flex bg-black/40 p-1 rounded-full border border-[#2F3336] self-start sm:self-auto">
              {(['low', 'medium', 'high'] as const).map((lvl) => {
                const isSelected = currentScene.forced_chaos_level === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() =>
                      handleUpdateCurrentScene((s) => ({
                        ...s,
                        forced_chaos_level: lvl,
                      }))
                    }
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all select-none cursor-pointer ${
                      isSelected
                        ? 'bg-[#EF264C] text-white shadow-sm'
                        : 'text-[#ACACB2] hover:text-[#F2F2F5]'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DUAL-LENS: Event Mood vs Director's Vision */}
          {isEditingBriefing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="bg-black/30 border border-[#2F3336]/80 rounded-xl p-3">
                <span className="text-[10.5px] font-bold text-[#ACACB2] uppercase tracking-wider block mb-1">
                  🎭 EVENT MOOD (ฟิสิกส์/บรรยากาศ)
                </span>
                <input
                  type="text"
                  value={editEventMood}
                  onChange={(e) => setEditEventMood(e.target.value)}
                  placeholder="เช่น อบอุ่น อึดอัด ชื้นแฉะ..."
                  className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13px] rounded-lg px-2.5 py-1.5 outline-none transition-colors"
                />
              </div>
              <div className="bg-black/30 border border-[#2F3336]/80 rounded-xl p-3">
                <span className="text-[10.5px] font-bold text-[#ACACB2] uppercase tracking-wider block mb-1">
                  🎬 DIRECTOR'S VISION (จังหวะหนัง)
                </span>
                <input
                  type="text"
                  value={editDirectorVision}
                  onChange={(e) => setEditDirectorVision(e.target.value)}
                  placeholder="เช่น The Slow Burn: สร้างความกระอักกระอ่วน..."
                  className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13px] rounded-lg px-2.5 py-1.5 outline-none transition-colors"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="bg-black/30 border border-[#2F3336]/80 rounded-xl p-3">
                <span className="text-[10.5px] font-bold text-[#ACACB2] uppercase tracking-wider block mb-1">
                  🎭 EVENT MOOD (ฟิสิกส์/บรรยากาศ)
                </span>
                <p className="text-[13px] text-[#F2F2F5] font-medium">
                  {currentScene.event_mood || 'อบอุ่น อึดอัด'}
                </p>
              </div>
              <div className="bg-black/30 border border-[#2F3336]/80 rounded-xl p-3">
                <span className="text-[10.5px] font-bold text-[#ACACB2] uppercase tracking-wider block mb-1">
                  🎬 DIRECTOR'S VISION (จังหวะหนัง)
                </span>
                <p className="text-[13px] text-[#F2F2F5] font-medium">
                  {currentScene.director_vision || 'The Slow Burn: สร้างความกระอักกระอ่วน'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 3. BEATS & CHOICES (ห้องเครื่องเหตุการณ์ย่อย)                                */}
        {/* ========================================================================= */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C]" />
              <h4 className="text-[13px] sm:text-[14px] font-bold text-[#F2F2F5] uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={14} className="text-[#EF264C]" />
                <span>BEATS & CHOICES (จังหวะเหตุการณ์ย่อย)</span>
              </h4>
            </div>
            <span className="text-[11px] text-[#ACACB2]">
              {currentScene.beats.length} Beats ในซีนนี้
            </span>
          </div>

          {/* รายการ Beat ทีละอัน */}
          <div className="space-y-4">
            {currentScene.beats.map((beat, bIdx) => {
              const isEditingThisBeat = editingBeatIndex === bIdx;

              return (
                <React.Fragment key={beat.beat_id || bIdx}>
                  {/* 🌟 The Hidden Seam (จุดแทรก Beat ขั้นกลาง) */}
                  <div className="relative h-6 flex items-center justify-center group/seam -my-1 z-10">
                    <div className="absolute inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-[#EF264C]/0 to-transparent group-hover/seam:via-[#EF264C]/40 transition-all duration-300" />
                    <button
                      type="button"
                      onClick={() => handleAddBeat(bIdx)}
                      className="opacity-0 group-hover/seam:opacity-100 bg-[#1D1D1F] border border-[#2F3336] text-[#F2F2F5] hover:text-[#EF264C] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={11} />
                      <span>Insert Beat Here</span>
                    </button>
                  </div>

                  {/* Beat Card Item */}
                  <div
                    className={`rounded-xl p-4 sm:p-5 space-y-3.5 relative group/beat shadow-md transition-all ${
                      isEditingThisBeat
                        ? 'bg-[#18181B] border border-[#EF264C]/70 shadow-[0_0_16px_rgba(239,38,76,0.12)]'
                        : 'bg-[#161618] border border-[#2F3336] hover:border-[#2F3336]/90'
                    }`}
                  >
                    {/* Beat Header & ID พร้อมปุ่มดินสอกลม [ ✏️ ] / [ ✕ ] [ ✓ ] */}
                    <div className="flex items-center justify-between border-b border-[#2F3336]/60 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-[#EF264C] uppercase tracking-widest bg-[#EF264C]/10 px-2 py-0.5 rounded border border-[#EF264C]/30 font-mono">
                          BEAT {bIdx + 1}
                        </span>
                        {isEditingThisBeat ? (
                          <input
                            type="text"
                            value={editBeatId}
                            onChange={(e) => setEditBeatId(e.target.value)}
                            placeholder="Beat ID..."
                            className="bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13px] font-bold px-2.5 py-0.5 rounded-lg outline-none"
                          />
                        ) : (
                          <span className="text-[13px] font-bold text-[#F2F2F5] tracking-tight">
                            {beat.beat_id}
                          </span>
                        )}
                      </div>

                      {/* Tool Buttons: ปุ่มดินสอกลม & ปุ่มถังขยะ */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isEditingThisBeat ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={handleCancelEditBeat}
                              title="ยกเลิกการแก้ไขบีตนี้"
                              className="w-7 h-7 rounded-full bg-transparent border border-[#2F3336] hover:border-white/30 text-[#ACACB2] hover:text-[#F2F2F5] flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0"
                            >
                              <X size={13} strokeWidth={2} />
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveBeat}
                              title="บันทึกบีตนี้"
                              className="w-7 h-7 rounded-full border border-[#EF264C]/70 bg-[#EF264C]/15 hover:bg-[#EF264C] text-[#EF264C] hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 shadow-[0_0_10px_rgba(239,38,76,0.2)]"
                            >
                              <Check size={13} strokeWidth={2.2} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEditBeat(bIdx)}
                              title="แก้ไขบีตนี้"
                              className="w-7 h-7 rounded-full bg-transparent border border-[#2F3336] hover:border-[#EF264C]/60 text-[#ACACB2] hover:text-[#EF264C] flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                            >
                              <Pencil size={13} strokeWidth={1.8} />
                            </button>
                            {currentScene.beats.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteBeat(bIdx)}
                                title="ลบ Beat นี้"
                                className="w-7 h-7 rounded-full bg-transparent hover:bg-red-500/15 text-[#ACACB2] hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Optional VO / Gear 1 Banner */}
                    {isEditingThisBeat ? (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                          <Volume2 size={13} />
                          <span>VO / DIRECTOR'S SETUP (GEAR 1 - ปล่อยว่างหากไม่ใช้):</span>
                        </span>
                        <textarea
                          value={editBeatVo}
                          onChange={(e) => setEditBeatVo(e.target.value)}
                          placeholder="พิมพ์คำบรรยายเปิดฉาก/สภาพแวดล้อมก่อนเข้าบีต..."
                          rows={2}
                          className="w-full bg-[#141416] border border-[#2F3336] focus:border-amber-400/60 text-[#F2F2F5] text-[12.5px] rounded-lg p-2.5 outline-none resize-none leading-relaxed"
                        />
                      </div>
                    ) : (
                      beat.director_setup && (
                        <div className="bg-black/30 border border-[#2F3336] rounded-lg p-2.5 text-[12.5px] text-[#ACACB2] leading-relaxed flex items-start gap-2">
                          <Volume2 size={14} className="text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-amber-300/90 text-[11px] uppercase tracking-wider block mb-0.5">
                              VO / DIRECTOR'S SETUP (GEAR 1)
                            </strong>
                            <p>{beat.director_setup}</p>
                          </div>
                        </div>
                      )
                    )}

                    {/* 🎭 บรีฟนักแสดง (ACTOR'S SCRIPT) - คงรูปเป็นก้อนเดียวต่อเนื่องตามคำกำชับ */}
                    <div className="space-y-1.5">
                      <span className="text-[11.5px] font-bold text-[#ACACB2] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={13} className="text-[#EF264C]" />
                        <span>บรีฟนักแสดง (ACTOR'S SCRIPT) - สคริปต์ก้อนเดียว</span>
                      </span>
                      {isEditingThisBeat ? (
                        <textarea
                          value={editActorState}
                          onChange={(e) => setEditActorState(e.target.value)}
                          rows={5}
                          placeholder="Player Anchor: ... | 3D Geometry: ... | Skin Micro-Details: ... | Wardrobe Continuity: ..."
                          className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13px] rounded-xl p-3 outline-none resize-none leading-relaxed font-normal"
                        />
                      ) : (
                        <div className="bg-black/25 border border-white/5 rounded-xl p-3.5 text-[13px] sm:text-[13.5px] text-[#F2F2F5]/90 leading-relaxed font-normal whitespace-pre-line select-text">
                          {beat.actor_state}
                        </div>
                      )}
                    </div>

                    {/* 👤 ตาข่ายดักจับผู้เล่น (PLAYER TRIGGERS) พร้อม SEMANTIC COLOR TAGS */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11.5px] font-bold text-[#ACACB2] uppercase tracking-wider">
                          👤 ตาข่ายดักจับผู้เล่น (PLAYER TRIGGERS)
                        </span>
                        {!isEditingThisBeat && (
                          <button
                            type="button"
                            onClick={() => handleAddChoice(bIdx)}
                            className="text-[11px] font-bold text-[#ACACB2] hover:text-[#EF264C] flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Plus size={12} />
                            <span>ADD CHOICE</span>
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {Object.entries(
                          isEditingThisBeat ? editChoices : beat.hidden_evaluation_criteria || {}
                        ).map(([choiceText, choiceVal]) => {
                          const isProgress =
                            choiceVal.action_result === 'progress' ||
                            choiceVal.action_result === 'illusion_trigger';

                          return (
                            <div
                              key={choiceText}
                              className="bg-black/30 border border-[#2F3336] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group/choice"
                            >
                              <div className="flex-1 min-w-0 pr-2">
                                {isEditingThisBeat ? (
                                  <div className="space-y-1.5">
                                    <input
                                      type="text"
                                      value={choiceText}
                                      onChange={(e) => {
                                        const newKey = e.target.value;
                                        if (!newKey || newKey === choiceText) return;
                                        setEditChoices((prev) => {
                                          const next = { ...prev };
                                          next[newKey] = next[choiceText];
                                          delete next[choiceText];
                                          return next;
                                        });
                                      }}
                                      className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13px] rounded-lg px-2.5 py-1.5 outline-none font-medium"
                                    />
                                    <input
                                      type="text"
                                      value={choiceVal.feedback || ''}
                                      onChange={(e) => {
                                        const newFb = e.target.value;
                                        setEditChoices((prev) => ({
                                          ...prev,
                                          [choiceText]: {
                                            ...prev[choiceText],
                                            feedback: newFb,
                                          },
                                        }));
                                      }}
                                      placeholder="💡 คำอธิบายฟีดแบ็ก..."
                                      className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#ACACB2] text-[11.5px] rounded-lg px-2.5 py-1 outline-none"
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-[13px] text-[#F2F2F5] font-medium leading-normal">
                                      {choiceText}
                                    </p>
                                    {choiceVal.feedback && (
                                      <p className="text-[11.5px] text-[#ACACB2] mt-0.5 italic">
                                        💡 {choiceVal.feedback}
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>

                              {/* Semantic Result Tag & Delete */}
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextAction: PlayerTriggerAction = isProgress
                                      ? 'loop'
                                      : 'progress';
                                    if (isEditingThisBeat) {
                                      setEditChoices((prev) => ({
                                        ...prev,
                                        [choiceText]: {
                                          ...prev[choiceText],
                                          action_result: nextAction,
                                        },
                                      }));
                                    } else {
                                      handleToggleChoiceAction(bIdx, choiceText, nextAction);
                                    }
                                  }}
                                  title="คลิกเพื่อสลับ Progress / Loop"
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all flex items-center gap-1 select-none cursor-pointer ${
                                    isProgress
                                      ? 'bg-[#EF264C]/15 border border-[#EF264C]/60 text-[#EF264C] hover:bg-[#EF264C]/25'
                                      : 'bg-amber-500/15 border border-amber-500/60 text-amber-400 hover:bg-amber-500/25'
                                  }`}
                                >
                                  {isProgress ? (
                                    <>
                                      <ArrowRight size={11} strokeWidth={2.5} />
                                      <span>PROGRESS</span>
                                    </>
                                  ) : (
                                    <>
                                      <RotateCcw size={11} strokeWidth={2.5} />
                                      <span>LOOP</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isEditingThisBeat) {
                                      setEditChoices((prev) => {
                                        const next = { ...prev };
                                        delete next[choiceText];
                                        return next;
                                      });
                                    } else {
                                      handleDeleteChoice(bIdx, choiceText);
                                    }
                                  }}
                                  title="ลบตัวเลือกนี้"
                                  className="w-6 h-6 rounded-full text-[#ACACB2] hover:text-red-400 opacity-60 group-hover/choice:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* ⏱️ กฎหมดเวลา (TIMEOUT RULE) & เหตุการณ์บังคับ (FORCED EVENT) */}
                    <div className="bg-amber-500/[0.04] border border-amber-500/30 rounded-xl p-3.5 space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-amber-400 uppercase tracking-wider">
                          <AlertTriangle size={13} className="text-amber-400" />
                          <span>กฎหมดเวลา (TIMEOUT RULE)</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11.5px] font-mono">
                          {isEditingThisBeat ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[#ACACB2]">MAX TURNS:</span>
                              <input
                                type="number"
                                min={1}
                                max={10}
                                value={editMaxTurns}
                                onChange={(e) =>
                                  setEditMaxTurns(Math.max(1, parseInt(e.target.value) || 1))
                                }
                                className="w-12 bg-[#141416] border border-[#2F3336] focus:border-amber-400 text-white font-bold text-center rounded px-1 py-0.5 outline-none"
                              />
                            </div>
                          ) : (
                            <span className="text-[#ACACB2]">
                              MAX TURNS:{' '}
                              <strong className="text-white font-bold">
                                {beat.pacing_control?.max_turns || 3}
                              </strong>
                            </span>
                          )}
                          <span className="text-amber-400 font-bold uppercase">
                            ACTION: {beat.pacing_control?.action_result || 'progress'}
                          </span>
                        </div>
                      </div>

                      <div className="text-[12.5px] sm:text-[13px] text-[#F2F2F5]/85 leading-relaxed bg-black/30 p-2.5 rounded-lg border border-amber-500/20">
                        <strong className="text-amber-400 text-[11px] uppercase tracking-wider block mb-0.5">
                          เหตุการณ์บังคับ (FORCED EVENT เมื่อครบโควต้าเทิร์น):
                        </strong>
                        {isEditingThisBeat ? (
                          <textarea
                            value={editInevitableConsequence}
                            onChange={(e) => setEditInevitableConsequence(e.target.value)}
                            rows={2}
                            placeholder="บทลงโทษหรือเหตุการณ์บังคับเมื่อผู้เล่นคุยยืดเยื้อ..."
                            className="w-full bg-[#141416] border border-[#2F3336] focus:border-amber-400 text-[#F2F2F5] text-[12.5px] rounded-lg p-2 outline-none resize-none leading-relaxed mt-1"
                          />
                        ) : (
                          <p>{beat.pacing_control?.inevitable_consequence}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            {/* รอยต่อเพิ่ม Beat ต่อท้ายสุด */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => handleAddBeat()}
                className="px-4 py-2 rounded-full border border-dashed border-[#2F3336] hover:border-[#EF264C]/70 text-[#ACACB2] hover:text-[#F2F2F5] text-[12px] font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer bg-[#141416]"
              >
                <Plus size={13} strokeWidth={2.2} />
                <span>+ ADD BEAT TO SCENE {selectedSceneIndex + 1}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. SANDBOX GATEWAY (เมื่อจบซีนสุดท้าย)                                    */}
        {/* ========================================================================= */}
        {selectedSceneIndex === scenes.length - 1 && (
          <div className="pt-6 pb-2 flex flex-col items-center justify-center text-center">
            <div className="w-[1.5px] h-8 bg-gradient-to-b from-[#2F3336] to-transparent mb-3" />
            <div className="px-5 py-2.5 rounded-full bg-black/40 border border-[#2F3336] flex items-center gap-2.5 shadow-lg">
              <span className="text-lg">🕊️</span>
              <div className="text-left">
                <span className="text-[10px] font-bold text-[#ACACB2] uppercase tracking-widest block">
                  END OF CINEMATIC
                </span>
                <span className="text-[12.5px] font-black text-[#F2F2F5] uppercase tracking-wider">
                  ENTER SANDBOX MODE
                </span>
              </div>
              <span className="text-lg">🕊️</span>
            </div>
            <p className="text-[11.5px] text-[#ACACB2]/70 max-w-[280px] mt-2 leading-relaxed">
              เมื่อจบเนื้อเรื่องบีตสุดท้าย โลกจะเปิดอิสระ ผู้เล่นสามารถพูดคุยหรือทำอะไรก็ได้ตามใจชอบ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
