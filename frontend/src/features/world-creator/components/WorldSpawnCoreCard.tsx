import React, { useState } from 'react';
import {
  MapPin,
  Pencil,
  X,
  Check,
  Eye,
  Radio,
  Sparkles,
  Volume2,
  Clock,
  CloudSun,
} from 'lucide-react';
import type { WorldStartingState } from '../types';

interface WorldSpawnCoreCardProps {
  cardRef?: React.RefObject<HTMLDivElement | null>;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
  onSave?: (data: {
    worldTitle: string;
    worldVisual: string;
    worldSound: string;
    worldConflict: string;
    startingState: WorldStartingState;
  }) => void;
  worldTitle?: string;
  worldVisual?: string;
  worldSound?: string;
  worldConflict?: string;
  startingState?: WorldStartingState;
}

export default function WorldSpawnCoreCard({
  cardRef,
  isEditing = false,
  onStartEdit,
  onCancelEdit,
  onSave,
  worldTitle = 'The Secret of Black Lace',
  worldVisual = 'แสงนีออนสีชมพูซีด สะท้อนผิวน้ำขังบนดาดฟ้าตึกเก่า',
  worldSound = 'เสียงลมพัดผ่านท่อระบายอากาศ ผสมเสียงฝนพรำกระทบกระจก',
  worldConflict = 'ในเวลางานเธอถูกสังคมจับจ้องในฐานะพนักงานบัญชีสุดเฉิ่ม แต่นอกเวลางานเธอแอบซ่อนความเร่าร้อนภายใต้ชุดลูกไม้สีดำ',
  startingState = {
    starting_location: 'ดาดฟ้าตึกออฟฟิศเก่า (หลังแท็งก์น้ำ)',
    starting_time: 'บ่ายแก่ๆ แดดจัด',
    starting_weather: 'แดดร้อนอบอ้าว ก่อนพายุฤดูร้อน',
    initial_outfit_key: 'OUTFIT 1 (ชุดทำงานสาวออฟฟิศ)',
    initial_a_pos: 'หลบอยู่หลังแท็งก์น้ำ ค่อยๆ ปลดกระดุมเสื้อเชิ้ตออก เผยชุดชั้นในลูกไม้สีดำเพื่อโพสท่าเซลฟี่หน้ากล้องมือถือ',
    initial_p_pos: 'ยืนแอบอยู่ในมุมอับสายตาหลังแท็งก์น้ำเหล็ก ห่างออกไปเพียง 2 เมตร สังเกตเห็นทุกท่วงท่าและแสงแดดที่สะท้อนผิวเนียน',
  },
}: WorldSpawnCoreCardProps) {
  // Local edit states
  const [editTitle, setEditTitle] = useState(worldTitle);
  const [editVisual, setEditVisual] = useState(worldVisual);
  const [editSound, setEditSound] = useState(worldSound);
  const [editConflict, setEditConflict] = useState(worldConflict);
  const [editStartingLocation, setEditStartingLocation] = useState(
    startingState.starting_location || ''
  );
  const [editStartingTime, setEditStartingTime] = useState(
    startingState.starting_time || ''
  );
  const [editStartingWeather, setEditStartingWeather] = useState(
    startingState.starting_weather || ''
  );
  const [editInitialOutfit, setEditInitialOutfit] = useState(
    startingState.initial_outfit_key || 'OUTFIT 1'
  );
  const [editInitialAPos, setEditInitialAPos] = useState(
    startingState.initial_a_pos || ''
  );
  const [editInitialPPos, setEditInitialPPos] = useState(
    startingState.initial_p_pos || ''
  );

  const handleStart = () => {
    setEditTitle(worldTitle);
    setEditVisual(worldVisual);
    setEditSound(worldSound);
    setEditConflict(worldConflict);
    setEditStartingLocation(startingState.starting_location || '');
    setEditStartingTime(startingState.starting_time || '');
    setEditStartingWeather(startingState.starting_weather || '');
    setEditInitialOutfit(startingState.initial_outfit_key || 'OUTFIT 1');
    setEditInitialAPos(startingState.initial_a_pos || '');
    setEditInitialPPos(startingState.initial_p_pos || '');
    onStartEdit?.();
  };

  const handleSave = () => {
    onSave?.({
      worldTitle: editTitle,
      worldVisual: editVisual,
      worldSound: editSound,
      worldConflict: editConflict,
      startingState: {
        starting_location: editStartingLocation,
        starting_time: editStartingTime,
        starting_weather: editStartingWeather,
        initial_outfit_key: editInitialOutfit,
        initial_a_pos: editInitialAPos,
        initial_p_pos: editInitialPPos,
      },
    });
  };

  return (
    <div
      ref={cardRef}
      className={`scroll-mt-4 p-4 sm:p-5 rounded-2xl bg-transparent transition-all flex flex-col gap-3.5 ${
        isEditing
          ? 'border border-[#EF264C]/60 shadow-[0_0_16px_rgba(239,38,76,0.12)]'
          : 'border border-[#2F3336]'
      }`}
    >
      {/* Card Header พร้อมปุ่มดินสอกลม [ ✏️ ] / [ ✕ ] [ ✓ ] */}
      <div className="flex items-center justify-between border-b border-[#2F3336]/60 pb-2.5">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-[#EF264C] shrink-0" />
          <h3
            className={`text-[18px] sm:text-[19px] font-bold tracking-tight ${
              isEditing ? 'text-[#EF264C]' : 'text-[#F2F2F5]'
            }`}
          >
            {isEditing ? 'แก้ไขจุดเกิด & แก่นโลก' : 'จุดเกิดตั้งต้น & แก่นโลก'}
          </h3>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onCancelEdit}
              title="ยกเลิกการแก้ไข"
              className="w-8 h-8 rounded-full bg-transparent border border-[#2F3336] hover:border-white/30 text-[#ACACB2] hover:text-[#F2F2F5] flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 select-none"
            >
              <X size={14} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={handleSave}
              title="บันทึกจุดเกิดและแก่นโลก"
              className="w-8 h-8 rounded-full border border-[#EF264C]/70 bg-[#EF264C]/15 hover:bg-[#EF264C] text-[#EF264C] hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 shadow-[0_0_10px_rgba(239,38,76,0.2)] select-none"
            >
              <Check size={14} strokeWidth={2.2} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStart}
            title="แก้ไขจุดเกิดและแก่นโลก"
            className="w-8 h-8 rounded-full bg-transparent border border-[#2F3336] hover:border-[#EF264C]/60 text-[#ACACB2] hover:text-[#EF264C] flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 select-none"
          >
            <Pencil size={14} strokeWidth={1.8} />
          </button>
        )}
      </div>

      {isEditing ? (
        /* ================= EDIT MODE ================= */
        <div className="space-y-3.5 pt-1">
          {/* ชื่อโลก */}
          <div>
            <label className="text-[11.5px] font-bold text-[#ACACB2] uppercase tracking-wider block mb-1">
              ชื่อโลก (World Title)
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="ชื่อโลก..."
              className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[14px] font-normal rounded-xl px-3 py-2 outline-none transition-colors"
            />
          </div>

          {/* ปมขัดแย้งหลักของโลก (Core Paradox) */}
          <div>
            <label className="text-[11.5px] font-bold text-[#ACACB2] uppercase tracking-wider block mb-1">
              ⚡ Core Paradox (ปมขัดแย้งหลักของโลก)
            </label>
            <textarea
              value={editConflict}
              onChange={(e) => setEditConflict(e.target.value)}
              rows={2}
              placeholder="ความขัดแย้งที่ขับเคลื่อนความตึงเครียดของโลกนี้..."
              className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[14px] font-normal rounded-xl p-3 outline-none resize-none leading-relaxed transition-colors"
            />
          </div>

          {/* ผังจุดเกิดวินาทีแรก (The Spawn Point) */}
          <div className="border-t border-[#2F3336]/60 pt-3 space-y-3">
            <span className="text-[12px] font-bold text-[#EF264C] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#EF264C]" />
              <span>ผังจุดเกิดวินาทีแรก (THE SPAWN POINT SETUP)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-[#ACACB2] uppercase tracking-wider block mb-1">
                  📍 พิกัดเริ่มต้น
                </label>
                <input
                  type="text"
                  value={editStartingLocation}
                  onChange={(e) => setEditStartingLocation(e.target.value)}
                  placeholder="เช่น ดาดฟ้าตึกออฟฟิศ..."
                  className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[14px] font-normal rounded-lg px-2.5 py-1.5 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#ACACB2] uppercase tracking-wider block mb-1">
                  ⏳ เวลาเริ่มฉาก
                </label>
                <input
                  type="text"
                  value={editStartingTime}
                  onChange={(e) => setEditStartingTime(e.target.value)}
                  placeholder="เช่น บ่ายแก่ๆ, ตีสอง..."
                  className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[14px] font-normal rounded-lg px-2.5 py-1.5 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#ACACB2] uppercase tracking-wider block mb-1">
                  🌦️ สภาพอากาศเริ่มฉาก
                </label>
                <input
                  type="text"
                  value={editStartingWeather}
                  onChange={(e) => setEditStartingWeather(e.target.value)}
                  placeholder="เช่น แดดจัด, ฝนตกหนัก..."
                  className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[14px] font-normal rounded-lg px-2.5 py-1.5 outline-none"
                />
              </div>
            </div>

            {/* A-Pos & P-Pos */}
            <div>
              <label className="text-[11px] font-bold text-[#ACACB2] uppercase tracking-wider block mb-1">
                🎭 ท่าทางตัวละครวินาทีแรก (ACTOR INITIAL POSTURE)
              </label>
              <textarea
                value={editInitialAPos}
                onChange={(e) => setEditInitialAPos(e.target.value)}
                rows={2}
                placeholder="ตัวละครกำลังทำอะไรอยู่ที่ไหนในวินาทีแรก..."
                className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[14px] font-normal rounded-xl p-2.5 outline-none resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#ACACB2] uppercase tracking-wider block mb-1">
                👁️ ตำแหน่ง & มุมมองผู้เล่น (PLAYER PERSPECTIVE)
              </label>
              <textarea
                value={editInitialPPos}
                onChange={(e) => setEditInitialPPos(e.target.value)}
                rows={2}
                placeholder="ผู้เล่นยืนมองจากจุดไหน มีระยะห่างเท่าใด..."
                className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[14px] font-normal rounded-xl p-2.5 outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* แสงสีและเสียงบรรยากาศ */}
          <div className="border-t border-[#2F3336]/60 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#ACACB2] uppercase tracking-wider block mb-1">
                🌃 Visual Palette (โทนภาพและแสงสี)
              </label>
              <input
                type="text"
                value={editVisual}
                onChange={(e) => setEditVisual(e.target.value)}
                placeholder="โทนสีและแสงของโลก..."
                className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[14px] font-normal rounded-lg px-2.5 py-1.5 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#ACACB2] uppercase tracking-wider block mb-1">
                🎧 Soundscape (บรรยากาศเสียง)
              </label>
              <input
                type="text"
                value={editSound}
                onChange={(e) => setEditSound(e.target.value)}
                placeholder="เสียงแอมเบียนต์รอบตัว..."
                className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[14px] font-normal rounded-lg px-2.5 py-1.5 outline-none"
              />
            </div>
          </div>
        </div>
      ) : (
        /* ================= READ MODE ================= */
        <div className="space-y-3.5 pt-0.5 select-text">
          {/* ชื่อโลก & ปมขัดแย้งหลัก */}
          <div>
            <span className="text-[11.5px] font-bold text-[#EF264C] uppercase tracking-wider block mb-1">
              ⚡ CORE PARADOX (ปมขัดแย้งหลักของโลก)
            </span>
            <p className="text-[14px] text-[#F2F2F5] font-normal leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
              {worldConflict}
            </p>
          </div>

          {/* จุดเกิดตั้งต้น (The Spawn Point) */}
          <div className="space-y-2 border-t border-[#2F3336]/60 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-bold text-[#ACACB2] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#EF264C]" />
                <span>จุดเกิดเริ่มต้นฉาก (THE SPAWN POINT)</span>
              </span>
              <span className="text-[11px] text-[#ACACB2] font-mono">
                {startingState.initial_outfit_key || 'OUTFIT 1'}
              </span>
            </div>

            {/* แถบสรุป 3 มิติ: พิกัด · เวลา · อากาศ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="bg-black/20 p-2.5 rounded-lg border border-white/5 flex items-start gap-2">
                <MapPin size={14} className="text-[#EF264C] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10.5px] font-bold text-[#ACACB2] uppercase tracking-wider block">
                    พิกัดเริ่มฉาก
                  </span>
                  <span className="text-[13px] text-[#F2F2F5] font-medium leading-snug">
                    {startingState.starting_location || 'ไม่ระบุ'}
                  </span>
                </div>
              </div>

              <div className="bg-black/20 p-2.5 rounded-lg border border-white/5 flex items-start gap-2">
                <Clock size={14} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10.5px] font-bold text-[#ACACB2] uppercase tracking-wider block">
                    เวลาเริ่มฉาก
                  </span>
                  <span className="text-[13px] text-[#F2F2F5] font-medium leading-snug">
                    {startingState.starting_time || 'ไม่ระบุ'}
                  </span>
                </div>
              </div>

              <div className="bg-black/20 p-2.5 rounded-lg border border-white/5 flex items-start gap-2">
                <CloudSun size={14} className="text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10.5px] font-bold text-[#ACACB2] uppercase tracking-wider block">
                    สภาพอากาศ
                  </span>
                  <span className="text-[13px] text-[#F2F2F5] font-medium leading-snug">
                    {startingState.starting_weather || 'ไม่ระบุ'}
                  </span>
                </div>
              </div>
            </div>

            {/* A-Pos & P-Pos Detail Boxes */}
            <div className="space-y-2 pt-1">
              <div className="bg-black/25 p-3 rounded-lg border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#EF264C] uppercase tracking-wider">
                  <Radio size={12} className="text-[#EF264C]" />
                  <span>ท่าทางตัวละครวินาทีแรก (ACTOR INITIAL POSTURE)</span>
                </div>
                <p className="text-[14px] text-[#F2F2F5] font-normal leading-relaxed">
                  {startingState.initial_a_pos || 'ยังไม่มีการระบุท่าทางตัวละครเริ่มต้น'}
                </p>
              </div>

              <div className="bg-black/25 p-3 rounded-lg border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#ACACB2] uppercase tracking-wider">
                  <Eye size={12} className="text-sky-400" />
                  <span>ตำแหน่ง & มุมมองผู้เล่น (PLAYER PERSPECTIVE)</span>
                </div>
                <p className="text-[14px] text-[#F2F2F5] font-normal leading-relaxed">
                  {startingState.initial_p_pos || 'ยังไม่มีการระบุมุมมองผู้เล่นเริ่มต้น'}
                </p>
              </div>
            </div>
          </div>

          {/* แสงสี & เสียงรอบตัว */}
          <div className="border-t border-[#2F3336]/60 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-1">
              <span className="text-[10.5px] font-bold text-[#ACACB2] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={11} className="text-[#EF264C]" />
                <span>VISUAL PALETTE (โทนภาพและแสงสี)</span>
              </span>
              <p className="text-[14px] text-[#F2F2F5] font-normal leading-relaxed">
                {worldVisual}
              </p>
            </div>

            <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-1">
              <span className="text-[10.5px] font-bold text-[#ACACB2] uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 size={11} className="text-[#EF264C]" />
                <span>SOUNDSCAPE (บรรยากาศเสียง)</span>
              </span>
              <p className="text-[14px] text-[#F2F2F5] font-normal leading-relaxed">
                {worldSound}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
