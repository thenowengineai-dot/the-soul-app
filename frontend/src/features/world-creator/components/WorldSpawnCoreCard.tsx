import { useState, type RefObject } from 'react';
import {
  MapPin,
  Pencil,
  X,
  Check,
  Clock,
  CloudSun,
  Flame,
  Heart,
  Zap,
  Shirt,
  User,
} from 'lucide-react';
import type { WorldStartingState, WorldInitialStates } from '../types';

interface WorldSpawnCoreCardProps {
  cardRef?: RefObject<HTMLDivElement | null>;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
  onSave?: (data: {
    startingState: WorldStartingState;
    initialStates: WorldInitialStates;
  }) => void;
  startingState?: WorldStartingState;
  initialStates?: WorldInitialStates;
  worldTitle?: string;
  thaiName?: string;
  worldId?: string;
}

const DEFAULT_STARTING_STATE: WorldStartingState = {
  time: 'ยามบ่าย',
  weather: 'แดดสดใสก่อนแปรปรวน',
  location: 'ห้องโถงเสื่อทาทามิเรียวกัง',
  initial_a_pos: 'นั่งก้มหน้านิ่งใช้นิ้วดันดั้งแว่นด้วยความประหม่า',
  initial_p_pos: 'ยืนสะพายกระเป๋าอุปกรณ์พฤกษศาสตร์ใบโต',
  initial_outfit_key: 'เสื้อเชิ้ตสีขาวบางผ้าฝ้ายและแว่นตากรอกหนา',
};

const DEFAULT_INITIAL_STATES: WorldInitialStates = {
  desire: 1246,
  affection: 45,
  shatter_count: 2,
};

export default function WorldSpawnCoreCard({
  cardRef,
  isEditing = false,
  onStartEdit,
  onCancelEdit,
  onSave,
  startingState = DEFAULT_STARTING_STATE,
  initialStates = DEFAULT_INITIAL_STATES,
}: WorldSpawnCoreCardProps) {
  const [editLocation, setEditLocation] = useState(startingState?.location || DEFAULT_STARTING_STATE.location);
  const [editTime, setEditTime] = useState(startingState?.time || DEFAULT_STARTING_STATE.time);
  const [editWeather, setEditWeather] = useState(startingState?.weather || DEFAULT_STARTING_STATE.weather);
  const [editOutfit, setEditOutfit] = useState(startingState?.initial_outfit_key || DEFAULT_STARTING_STATE.initial_outfit_key);
  const [editAPos, setEditAPos] = useState(startingState?.initial_a_pos || DEFAULT_STARTING_STATE.initial_a_pos);
  const [editPPos, setEditPPos] = useState(startingState?.initial_p_pos || DEFAULT_STARTING_STATE.initial_p_pos);

  const [editDesire, setEditDesire] = useState(initialStates?.desire ?? DEFAULT_INITIAL_STATES.desire);
  const [editAffection, setEditAffection] = useState(initialStates?.affection ?? DEFAULT_INITIAL_STATES.affection);
  const [editShatter, setEditShatter] = useState(initialStates?.shatter_count ?? DEFAULT_INITIAL_STATES.shatter_count);

  const handleStart = () => {
    setEditLocation(startingState?.location || DEFAULT_STARTING_STATE.location);
    setEditTime(startingState?.time || DEFAULT_STARTING_STATE.time);
    setEditWeather(startingState?.weather || DEFAULT_STARTING_STATE.weather);
    setEditOutfit(startingState?.initial_outfit_key || DEFAULT_STARTING_STATE.initial_outfit_key);
    setEditAPos(startingState?.initial_a_pos || DEFAULT_STARTING_STATE.initial_a_pos);
    setEditPPos(startingState?.initial_p_pos || DEFAULT_STARTING_STATE.initial_p_pos);
    setEditDesire(initialStates?.desire ?? DEFAULT_INITIAL_STATES.desire);
    setEditAffection(initialStates?.affection ?? DEFAULT_INITIAL_STATES.affection);
    setEditShatter(initialStates?.shatter_count ?? DEFAULT_INITIAL_STATES.shatter_count);
    onStartEdit?.();
  };

  const handleSave = () => {
    onSave?.({
      startingState: {
        location: editLocation.trim(),
        time: editTime.trim(),
        weather: editWeather.trim(),
        initial_outfit_key: editOutfit.trim(),
        initial_a_pos: editAPos.trim(),
        initial_p_pos: editPPos.trim(),
      },
      initialStates: {
        desire: Number(editDesire),
        affection: Number(editAffection),
        shatter_count: Number(editShatter),
      },
    });
  };

  const curState = startingState || DEFAULT_STARTING_STATE;
  const curInitial = initialStates || DEFAULT_INITIAL_STATES;

  return (
    <div
      ref={cardRef}
      className="scroll-mt-4 rounded-2xl bg-[#111112] border border-[#2F3336] p-4 sm:p-5 flex flex-col gap-4 text-left transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3
          className={`text-[18px] sm:text-[19px] font-bold tracking-tight ${
            isEditing ? 'text-[#EF264C]' : 'text-[#F2F2F5]'
          }`}
        >
          {isEditing ? 'แก้ไขจุดเกิด & สถานะเริ่มต้น' : 'จุดเกิด & สถานะเริ่มต้น'}
        </h3>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white text-[12.5px] font-medium transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Check size={14} />
              <span>บันทึก</span>
            </button>
            <button
              onClick={onCancelEdit}
              className="px-3 py-1.5 rounded-full border border-[#2F3336] hover:bg-white/[0.08] hover:border-white/35 text-[#ACACB2] text-[12.5px] transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <X size={14} />
              <span>ยกเลิก</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleStart}
            className="w-8 h-8 rounded-full border border-[#2F3336] bg-transparent hover:bg-white/[0.08] hover:border-white/35 text-[#F2F2F5] flex items-center justify-center transition-all cursor-pointer active:scale-90"
            title="แก้ไขจุดเกิดและสถานะเริ่มต้น"
          >
            <Pencil size={13} />
          </button>
        )}
      </div>

      {/* Card Content Body */}
      {isEditing ? (
        <div className="flex flex-col gap-4">
          {/* Spatial & Chrono Anchors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-[#ACACB2]">สถานที่เกิด (Location)</label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0B0C] border border-[#2F3336] focus:border-[#EF264C]/60 rounded-xl text-[#F2F2F5] text-[13.5px] outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-[#ACACB2]">เวลาเริ่มต้น (Time)</label>
              <input
                type="text"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0B0C] border border-[#2F3336] focus:border-[#EF264C]/60 rounded-xl text-[#F2F2F5] text-[13.5px] outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-[#ACACB2]">สภาพอากาศ (Weather)</label>
              <input
                type="text"
                value={editWeather}
                onChange={(e) => setEditWeather(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0B0C] border border-[#2F3336] focus:border-[#EF264C]/60 rounded-xl text-[#F2F2F5] text-[13.5px] outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-[#ACACB2]">ชุดเริ่มต้น (Initial Outfit)</label>
            <input
              type="text"
              value={editOutfit}
              onChange={(e) => setEditOutfit(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0B0C] border border-[#2F3336] focus:border-[#EF264C]/60 rounded-xl text-[#F2F2F5] text-[13.5px] outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-[#ACACB2]">ท่าทางเริ่มต้นของ [ACTOR] (Initial Actor Position)</label>
            <textarea
              value={editAPos}
              onChange={(e) => setEditAPos(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-[#0B0B0C] border border-[#2F3336] focus:border-[#EF264C]/60 rounded-xl text-[#F2F2F5] text-[13.5px] outline-none resize-none leading-relaxed transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-[#ACACB2]">ท่าทางเริ่มต้นของ [PLAYER] (Initial Player Position)</label>
            <textarea
              value={editPPos}
              onChange={(e) => setEditPPos(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-[#0B0B0C] border border-[#2F3336] focus:border-[#EF264C]/60 rounded-xl text-[#F2F2F5] text-[13.5px] outline-none resize-none leading-relaxed transition-colors"
            />
          </div>

          {/* Initial States Gauges */}
          <div className="p-3.5 rounded-xl bg-[#0B0B0C] border border-[#2F3336]/80 flex flex-col gap-2.5">
            <span className="text-[12px] font-medium text-[#F2F2F5]">
              เกจสถานะหลอดพลังเริ่มต้น (Initial Gauges)
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#EF264C] flex items-center gap-1">
                  <Flame size={12} />
                  Desire (ตัณหา)
                </label>
                <input
                  type="number"
                  value={editDesire}
                  onChange={(e) => setEditDesire(Number(e.target.value))}
                  className="px-2.5 py-1.5 bg-black/40 border border-[#2F3336] focus:border-[#EF264C]/60 rounded-lg text-[#F2F2F5] text-[13px] font-mono outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-pink-400 flex items-center gap-1">
                  <Heart size={12} />
                  Affection (ผูกพัน)
                </label>
                <input
                  type="number"
                  value={editAffection}
                  onChange={(e) => setEditAffection(Number(e.target.value))}
                  className="px-2.5 py-1.5 bg-black/40 border border-[#2F3336] focus:border-[#EF264C]/60 rounded-lg text-[#F2F2F5] text-[13px] font-mono outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-amber-400 flex items-center gap-1">
                  <Zap size={12} />
                  Shatter Count
                </label>
                <input
                  type="number"
                  value={editShatter}
                  onChange={(e) => setEditShatter(Number(e.target.value))}
                  className="px-2.5 py-1.5 bg-black/40 border border-[#2F3336] focus:border-[#EF264C]/60 rounded-lg text-[#F2F2F5] text-[13px] font-mono outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Spatial Anchor Pill Grid: กล่องซ้อนด้านใน #0B0B0C */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-[#0B0B0C] border border-[#2F3336]/80 flex items-center gap-2.5">
              <MapPin size={16} className="text-[#EF264C] shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-[#ACACB2] uppercase tracking-wider">จุดเกิดเริ่มต้น</span>
                <span className="text-[13.5px] text-[#F2F2F5] font-medium truncate">{curState.location}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0B0B0C] border border-[#2F3336]/80 flex items-center gap-2.5">
              <Clock size={16} className="text-[#EF264C] shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-[#ACACB2] uppercase tracking-wider">ช่วงเวลา</span>
                <span className="text-[13.5px] text-[#F2F2F5] font-medium truncate">{curState.time}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0B0B0C] border border-[#2F3336]/80 flex items-center gap-2.5">
              <CloudSun size={16} className="text-[#EF264C] shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-[#ACACB2] uppercase tracking-wider">สภาพอากาศ</span>
                <span className="text-[13.5px] text-[#F2F2F5] font-medium truncate">{curState.weather}</span>
              </div>
            </div>
          </div>

          {/* Initial Outfit */}
          <div className="p-3.5 rounded-xl bg-[#0B0B0C] border border-[#2F3336]/80 flex items-center gap-2.5">
            <Shirt size={16} className="text-[#EF264C] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] text-[#ACACB2] uppercase tracking-wider">เครื่องแต่งกายเริ่มต้น</span>
              <span className="text-[13px] text-[#F2F2F5] font-normal">{curState.initial_outfit_key}</span>
            </div>
          </div>

          {/* Actor & Player Starting Postures: กล่องซ้อนด้านใน #0B0B0C */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-[#0B0B0C] border border-[#2F3336]/80 flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wider text-[#EF264C] font-bold flex items-center gap-1.5">
                <User size={13} className="text-[#EF264C]" />
                ท่าทางเริ่มต้นของ [ACTOR]
              </span>
              <p className="text-[13px] text-[#F2F2F5] leading-relaxed mt-0.5">
                {curState.initial_a_pos}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0B0C] border border-[#2F3336]/80 flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wider text-[#ACACB2] font-bold flex items-center gap-1.5">
                <User size={13} className="text-[#ACACB2]" />
                ท่าทางเริ่มต้นของ [PLAYER]
              </span>
              <p className="text-[13px] text-[#F2F2F5] leading-relaxed mt-0.5">
                {curState.initial_p_pos}
              </p>
            </div>
          </div>

          {/* Gauge Status Bar */}
          <div className="p-4 rounded-xl bg-[#0B0B0C] border border-[#2F3336]/80 flex flex-col gap-2.5">
            <span className="text-[11px] uppercase tracking-wider text-[#ACACB2] font-medium">
              เกจหลอดพลังเริ่มต้น (System Initial Gauges)
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-black/40 border border-[#2F3336]/60 flex items-center justify-between">
                <span className="text-[12px] text-[#ACACB2] flex items-center gap-1">
                  <Flame size={12} className="text-[#EF264C]" />
                  Desire
                </span>
                <span className="text-[14px] font-mono text-[#EF264C] font-semibold">
                  {curInitial.desire}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-[#2F3336]/60 flex items-center justify-between">
                <span className="text-[12px] text-[#ACACB2] flex items-center gap-1">
                  <Heart size={12} className="text-pink-400" />
                  Affection
                </span>
                <span className="text-[14px] font-mono text-pink-400 font-semibold">
                  {curInitial.affection}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-[#2F3336]/60 flex items-center justify-between">
                <span className="text-[12px] text-[#ACACB2] flex items-center gap-1">
                  <Zap size={12} className="text-amber-400" />
                  Shatter
                </span>
                <span className="text-[14px] font-mono text-amber-400 font-semibold">
                  {curInitial.shatter_count}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
