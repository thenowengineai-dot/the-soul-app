import { useState, useEffect } from 'react';
import {
  Clapperboard,
  Compass,
  BookOpen,
  Zap,
  Film,
  Sparkles,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import type { WorldScene } from '../../types';

interface DirectorSlateModalProps {
  scene: WorldScene;
  sceneOrder?: number | null;
  isOpen: boolean;
  onClose: () => void;
  isEditable?: boolean;
  initialEditMode?: boolean;
  onUpdateBriefing: (sceneId: string, updated: Partial<WorldScene>) => void;
}

export default function DirectorSlateModal({
  scene,
  sceneOrder = null,
  isOpen,
  onClose,
  isEditable = true,
  initialEditMode = false,
  onUpdateBriefing,
}: DirectorSlateModalProps) {
  const [isEditing, setIsEditing] = useState(initialEditMode);

  // Form states
  const [editObjective, setEditObjective] = useState(scene.scene_objective || '');
  const [editBrief, setEditBrief] = useState(scene.director_setup || '');
  const [editPremise, setEditPremise] = useState(scene.premise || '');
  const [editChaos, setEditChaos] = useState<'low' | 'medium' | 'high'>(
    scene.forced_chaos_level || 'low'
  );
  const [editMood, setEditMood] = useState(scene.event_mood || '');
  const [editVision, setEditVision] = useState(scene.director_vision || '');

  // Sync state whenever scene changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setEditObjective(scene.scene_objective || '');
      setEditBrief(scene.director_setup || '');
      setEditPremise(scene.premise || '');
      setEditChaos(scene.forced_chaos_level || 'low');
      setEditMood(scene.event_mood || '');
      setEditVision(scene.director_vision || '');
      setIsEditing(initialEditMode);
    }
  }, [isOpen, scene, initialEditMode]);

  if (!isOpen) return null;

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditObjective(scene.scene_objective || '');
    setEditBrief(scene.director_setup || '');
    setEditPremise(scene.premise || '');
    setEditChaos(scene.forced_chaos_level || 'low');
    setEditMood(scene.event_mood || '');
    setEditVision(scene.director_vision || '');
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    onUpdateBriefing(scene.scene_id, {
      scene_objective: editObjective.trim(),
      director_setup: editBrief.trim(),
      premise: editPremise.trim(),
      forced_chaos_level: editChaos,
      event_mood: editMood.trim(),
      director_vision: editVision.trim(),
    });
    setIsEditing(false);
  };

  // Preset vision tags quick insertion
  const visionPresets = ['The Slow Burn', 'The Proxemic Trap', 'The Climax', 'The Cold Open'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[780px] max-h-[92vh] flex flex-col rounded-[26px] bg-[#14141C]/98 border border-white/12 shadow-[0_24px_70px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.12)] overflow-hidden text-[#F1F1F1]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================================================================= */}
        {/* 1. TOP SLATE MASTHEAD (HOLLYWOOD SLATE ACCENT)                    */}
        {/* ================================================================= */}
        <div className="shrink-0 px-5 sm:px-6 py-4 border-b border-white/[0.08] flex items-center justify-between gap-3 bg-white/[0.02]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#FF9F0A]/15 border border-[#FF9F0A]/30 flex items-center justify-center text-[#FF9F0A] shrink-0">
              <Clapperboard size={18} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[15px] sm:text-[16px] text-white tracking-tight truncate">
                  {sceneOrder ? `ฉากที่ ${sceneOrder}` : 'ฉากอิสระ'}: DIRECTOR&apos;S BRIEFING
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#FF9F0A]/15 border border-[#FF9F0A]/30 text-[10px] font-mono font-semibold text-[#FF9F0A] shrink-0">
                  SLATE
                </span>
              </div>
              <p className="text-[11.5px] text-white/45 truncate">
                คำสั่งคุมโทนภาพยนตร์ ความกดดันทางกายภาพ และเป้าหมาย AI ประจำฉาก
              </p>
            </div>
          </div>

          {/* Action Buttons: Edit / Save / Cancel / Close */}
          <div className="flex items-center gap-2 shrink-0">
            {isEditable && (
              <>
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-[12px] font-medium text-white/70 hover:text-white transition-all cursor-pointer active:scale-95"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FF9F0A] hover:bg-[#ffb032] text-black text-[12px] font-semibold transition-all cursor-pointer shadow-[0_2px_12px_rgba(255,159,10,0.35)] active:scale-95"
                    >
                      <Check size={13} strokeWidth={2.6} />
                      <span>บันทึกบรีฟ</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/12 text-[12px] font-medium text-white/80 hover:text-white transition-all cursor-pointer active:scale-95"
                  >
                    <Pencil size={12} strokeWidth={2} />
                    <span>แก้ไขบรีฟ</span>
                  </button>
                )}
              </>
            )}

            {/* Quick Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
              title="ปิดหน้าต่าง"
            >
              <X size={15} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. SCROLLABLE SLATE BODY (ALL 6 CRITICAL SECTIONS)                 */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4.5">
          {/* ✦ ZONE 1: DIRECTOR'S CONTROL STRIP (CHAOS / VISION / MOOD) */}
          <div className="rounded-[18px] p-4 bg-white/[0.03] border border-white/[0.08] backdrop-blur-md space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#FF9F0A] uppercase tracking-wider flex items-center gap-1.5">
                <Film size={13} className="text-[#FF9F0A]" />
                <span>DIRECTOR&apos;S CONTROL STRIP (แผงควบคุมอารมณ์และจังหวะฉาก)</span>
              </span>
            </div>

            {/* Sub-grid of 3 control dials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Dial 1: Chaos Level */}
              <div className="bg-black/30 rounded-[12px] p-2.5 border border-white/[0.05] space-y-1.5">
                <div className="flex items-center gap-1 text-[10px] font-bold text-white/50 uppercase tracking-wide">
                  <Zap size={11} className="text-[#FF9F0A]" />
                  <span>CHAOS LEVEL (ความปั่นป่วน)</span>
                </div>
                <div className="inline-flex bg-black/40 p-0.5 rounded-full border border-white/[0.08] w-full justify-between">
                  {(['low', 'medium', 'high'] as const).map((lvl) => {
                    const currentChaos = isEditing ? editChaos : scene.forced_chaos_level || 'low';
                    const isSelected = currentChaos === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => {
                          if (isEditing) {
                            setEditChaos(lvl);
                          } else if (isEditable) {
                            onUpdateBriefing(scene.scene_id, { forced_chaos_level: lvl });
                          }
                        }}
                        className={`flex-1 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all select-none ${
                          isSelected
                            ? 'bg-[#FF9F0A] text-black shadow-sm font-bold'
                            : 'text-white/40 hover:text-white/80 cursor-pointer'
                        }`}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dial 2: Director Vision (Tempo) */}
              <div className="bg-black/30 rounded-[12px] p-2.5 border border-white/[0.05] space-y-1.5">
                <div className="flex items-center gap-1 text-[10px] font-bold text-white/50 uppercase tracking-wide">
                  <Film size={11} className="text-[#FF9F0A]" />
                  <span>DIRECTOR&apos;S VISION (จังหวะหนัง)</span>
                </div>
                {isEditing ? (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={editVision}
                      onChange={(e) => setEditVision(e.target.value)}
                      placeholder="เช่น The Slow Burn: ค่อยๆ กดดัน..."
                      className="w-full bg-[#161620] border border-white/15 focus:border-[#FF9F0A] rounded-[8px] px-2.5 py-1 text-[11.5px] text-white outline-none font-normal"
                    />
                    <div className="flex flex-wrap gap-1">
                      {visionPresets.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setEditVision((prev) => (prev ? `${preset}: ${prev.split(':')[1]?.trim() || ''}` : `${preset}: `))}
                          className="px-1.5 py-0.2 rounded bg-white/[0.06] hover:bg-white/[0.12] text-[9.5px] text-white/60 hover:text-white"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[12px] text-[#FF9F0A] font-medium truncate pt-1" title={scene.director_vision}>
                    {scene.director_vision || 'The Slow Burn: จังหวะค่อยเป็นค่อยไป'}
                  </p>
                )}
              </div>

              {/* Dial 3: Event Mood */}
              <div className="bg-black/30 rounded-[12px] p-2.5 border border-white/[0.05] space-y-1.5">
                <div className="flex items-center gap-1 text-[10px] font-bold text-white/50 uppercase tracking-wide">
                  <Sparkles size={11} className="text-[#FF9F0A]" />
                  <span>EVENT MOOD (บรรยากาศ/ฟิสิกส์)</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editMood}
                    onChange={(e) => setEditMood(e.target.value)}
                    placeholder="เช่น อบอุ่น อึดอัด ชื้นแฉะ ลื่นไถล แนบเนื้อ..."
                    className="w-full bg-[#161620] border border-white/15 focus:border-[#FF9F0A] rounded-[8px] px-2.5 py-1 text-[11.5px] text-white outline-none font-normal"
                  />
                ) : (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {(scene.event_mood || 'อบอุ่น อึดอัด แนบเนื้อ')
                      .split(/[\s,·]+/)
                      .filter(Boolean)
                      .map((moodWord, mIdx) => (
                        <span
                          key={mIdx}
                          className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[10.5px] text-white/80"
                        >
                          {moodWord}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ✦ ZONE 2: 🎯 1. THE NORTH STAR (CORE AI OBJECTIVE) */}
          <div className="rounded-[18px] p-4 bg-[#FF9F0A]/[0.04] border border-[#FF9F0A]/25 backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#FF9F0A] uppercase tracking-wider flex items-center gap-1.5">
                <Compass size={13} className="text-[#FF9F0A]" />
                <span>🎯 1. THE NORTH STAR (เป้าหมายสูงสุดของ AI ในฉากนี้)</span>
              </span>
            </div>

            {isEditing ? (
              <textarea
                value={editObjective}
                onChange={(e) => setEditObjective(e.target.value)}
                rows={2}
                placeholder="ระบุเป้าหมายหลักที่ AI ต้องนำพาผู้เล่นไปสู่จุดนี้ให้ได้..."
                className="w-full bg-[#161620] border border-white/20 focus:border-[#FF9F0A] rounded-[12px] p-3 text-[13px] text-white placeholder-white/30 outline-none resize-none leading-relaxed transition-colors font-normal"
              />
            ) : (
              <p className="text-[13.5px] sm:text-[14px] text-[#F5F5F7] font-medium leading-[22px] bg-black/20 p-3 rounded-[12px] border border-white/[0.05]">
                {scene.scene_objective || 'ยังไม่มีการกำหนดเป้าหมายของ AI'}
              </p>
            )}
          </div>

          {/* ✦ ZONE 3: 🎥 2. DIRECTOR'S BRIEF (STAGE TONE & OPENING DIRECTIVE) */}
          <div className="rounded-[18px] p-4 bg-white/[0.03] border border-white/[0.08] backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white/75 uppercase tracking-wider flex items-center gap-1.5">
                <Clapperboard size={13} className="text-[#FF9F0A]" />
                <span>🎥 2. DIRECTOR&apos;S BRIEF (บรีฟผู้กำกับฉาก & คำสั่งคุมโทน)</span>
              </span>
            </div>

            {isEditing ? (
              <textarea
                value={editBrief}
                onChange={(e) => setEditBrief(e.target.value)}
                rows={4}
                placeholder="บรีฟคำสั่งคุมโทนภาพรวมของผู้กำกับ เช่น บรรยากาศเปิดฉาก แสงเงา จังหวะเสียง..."
                className="w-full bg-[#161620] border border-white/20 focus:border-[#FF9F0A] rounded-[12px] p-3 text-[13px] text-white placeholder-white/30 outline-none resize-none leading-relaxed transition-colors font-normal"
              />
            ) : (
              <p className="text-[13px] text-white/85 font-normal leading-[22px] bg-black/20 p-3 rounded-[12px] border border-white/[0.05]">
                {scene.director_setup || 'ยังไม่มีการระบุบรีฟผู้กำกับฉาก'}
              </p>
            )}
          </div>

          {/* ✦ ZONE 4: 📖 3. THE SCENE PREMISE (BACKSTORY & DRAMATIC TENSION) */}
          <div className="rounded-[18px] p-4 bg-white/[0.02] border border-white/[0.06] backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={13} className="text-[#FF9F0A]" />
                <span>📖 3. THE SCENE PREMISE (ปูมหลัง & บริบทความอึดอัด)</span>
              </span>
            </div>

            {isEditing ? (
              <textarea
                value={editPremise}
                onChange={(e) => setEditPremise(e.target.value)}
                rows={3}
                placeholder="ปูมหลังและบริบทความอึดอัดที่เกิดขึ้นก่อนหน้า..."
                className="w-full bg-[#161620] border border-white/20 focus:border-[#FF9F0A] rounded-[12px] p-3 text-[13px] text-white placeholder-white/30 outline-none resize-none leading-relaxed transition-colors font-normal"
              />
            ) : (
              <p className="text-[12.5px] text-white/70 font-normal leading-[21px] bg-black/20 p-3 rounded-[12px] border border-white/[0.04]">
                {scene.premise || 'ยังไม่มีการระบุปูมหลังของฉาก'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
