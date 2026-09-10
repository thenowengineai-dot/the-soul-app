import { useState, type RefObject } from 'react';
import {
  CloudSun,
  Pencil,
  X,
  Check,
  Clock,
  ArrowRight,
  GitCommit,
  Trash2,
} from 'lucide-react';
import type { WorldTimePeriodsMap, WorldWeatherSystem } from '../types';

interface WorldWeatherCardProps {
  cardRef?: RefObject<HTMLDivElement | null>;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
  onSave?: (data: {
    timePeriods: WorldTimePeriodsMap;
    weatherSystem: WorldWeatherSystem;
  }) => void;
  timePeriods?: WorldTimePeriodsMap;
  weatherSystem?: WorldWeatherSystem;
}

const DEFAULT_TIME_PERIODS: WorldTimePeriodsMap = {
  'ยามบ่ายถึงยามเย็น': {
    atmosphere:
      'แสงแดดสดใสยามบ่ายแปรเปลี่ยนเป็นเมฆดำ พายุฝนเทกระหน่ำ และความสลัวยามเย็นกลางป่า',
  },
};

const DEFAULT_WEATHER_SYSTEM: WorldWeatherSystem = {
  logical_chain: {
    'แดดสดใสยามบ่าย': {
      next: ['พายุฝนเทกระหน่ำ'],
    },
    'พายุฝนเทกระหน่ำ': {
      next: ['ละอองฝนบางเบายามเย็น'],
    },
  },
};

export default function WorldWeatherCard({
  cardRef,
  isEditing = false,
  onStartEdit,
  onCancelEdit,
  onSave,
  timePeriods = DEFAULT_TIME_PERIODS,
  weatherSystem = DEFAULT_WEATHER_SYSTEM,
}: WorldWeatherCardProps) {
  const currentPeriods = timePeriods && Object.keys(timePeriods).length > 0 ? timePeriods : DEFAULT_TIME_PERIODS;
  const currentSystem = weatherSystem && Object.keys(weatherSystem.logical_chain || {}).length > 0
    ? weatherSystem
    : DEFAULT_WEATHER_SYSTEM;

  // Local editing states
  const [editPeriods, setEditPeriods] = useState<WorldTimePeriodsMap>(currentPeriods);
  const [editChain, setEditChain] = useState<Record<string, { next: string[] }>>(
    currentSystem.logical_chain || {}
  );

  const handleStart = () => {
    setEditPeriods({ ...currentPeriods });
    setEditChain({ ...(currentSystem.logical_chain || {}) });
    onStartEdit?.();
  };

  const handleSave = () => {
    onSave?.({
      timePeriods: editPeriods,
      weatherSystem: {
        logical_chain: editChain,
      },
    });
  };

  const periodKeys = Object.keys(currentPeriods);
  const chainKeys = Object.keys(currentSystem.logical_chain || {});

  return (
    <div
      ref={cardRef}
      className="scroll-mt-4 rounded-2xl bg-[#111112] border border-[#2F3336] p-4 sm:p-5 flex flex-col gap-4 text-left transition-all duration-200"
    >
      {/* Header Bar - Contained Director's Briefing Style */}
      <div className="flex items-center justify-between border-b border-[#2F3336]/60 pb-2.5">
        <div className="flex items-center gap-2">
          <CloudSun size={16} className="text-[#EF264C] shrink-0" />
          <div>
            <h3 className="text-[13px] sm:text-[14px] font-bold text-[#F2F2F5] tracking-wider uppercase">
              กาลเวลา & ห่วงโซ่สภาพอากาศ (Time Periods & Weather System)
            </h3>
            <span className="text-[11px] text-[#ACACB2]">
              ระบบควบคุมตรรกะการไหลของสภาพแวดล้อม
            </span>
          </div>
        </div>

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
            title="แก้ไขเวลาและสภาพอากาศ"
          >
            <Pencil size={13} />
          </button>
        )}
      </div>

      {/* Card Content Body */}
      {isEditing ? (
        <div className="flex flex-col gap-5">
          {/* Edit Time Periods */}
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-medium text-[#F2F2F5] flex items-center gap-1.5">
              <Clock size={13} className="text-[#EF264C]" />
              ช่วงเวลาในโลก (Time Periods)
            </span>
            {Object.entries(editPeriods).map(([name, val], idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#0B0B0C] border border-[#2F3336]/80 flex flex-col gap-2">
                <input
                  type="text"
                  value={name}
                  disabled
                  className="w-full px-2.5 py-1 bg-black/40 border border-[#2F3336] rounded-lg text-[#EF264C] text-[13px] font-medium"
                />
                <textarea
                  value={val.atmosphere}
                  onChange={(e) => {
                    setEditPeriods({
                      ...editPeriods,
                      [name]: { atmosphere: e.target.value },
                    });
                  }}
                  rows={2}
                  className="w-full px-2.5 py-1.5 bg-[#0B0B0C] border border-[#2F3336] focus:border-[#EF264C]/60 rounded-lg text-[#F2F2F5] text-[13px] outline-none resize-none leading-relaxed"
                />
              </div>
            ))}
          </div>

          {/* Edit Weather Chain */}
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-medium text-[#F2F2F5] flex items-center gap-1.5">
              <GitCommit size={13} className="text-[#EF264C]" />
              ห่วงโซ่สภาพอากาศ (Weather Logical Chain)
            </span>
            {Object.entries(editChain).map(([weatherName, node], idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#0B0B0C] border border-[#2F3336]/80 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#F2F2F5] font-medium">{weatherName}</span>
                  <button
                    onClick={() => {
                      const updated = { ...editChain };
                      delete updated[weatherName];
                      setEditChain(updated);
                    }}
                    className="text-[#ACACB2] hover:text-[#EF264C] p-1 cursor-pointer transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-[#ACACB2]">
                  <ArrowRight size={13} className="text-[#EF264C] shrink-0" />
                  <span>เปลี่ยนผ่านไปสู่:</span>
                  <input
                    type="text"
                    value={(node.next || []).join(', ')}
                    onChange={(e) => {
                      setEditChain({
                        ...editChain,
                        [weatherName]: {
                          next: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        },
                      });
                    }}
                    className="flex-1 px-2.5 py-1 bg-[#0B0B0C] border border-[#2F3336] focus:border-[#EF264C]/60 rounded-lg text-[#F2F2F5] text-[12.5px] outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Time Periods View: กล่องซ้อนด้านใน #0B0B0C */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#ACACB2] font-medium">
              <Clock size={12} className="text-[#EF264C]" />
              <span>ช่วงเวลาและบรรยากาศ (Time Periods)</span>
            </div>
            <div className="flex flex-col gap-2">
              {periodKeys.map((pName) => (
                <div
                  key={pName}
                  className="p-4 rounded-xl bg-[#0B0B0C] border border-[#2F3336]/80 flex flex-col gap-1"
                >
                  <span className="text-[13px] text-[#EF264C] font-semibold">{pName}</span>
                  <p className="text-[13.5px] sm:text-[14px] text-[#F2F2F5] leading-relaxed font-normal">
                    {currentPeriods[pName]?.atmosphere}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Weather Logical Chain Flow: กล่องซ้อนด้านใน #0B0B0C */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#ACACB2] font-medium">
              <GitCommit size={12} className="text-[#EF264C]" />
              <span>ห่วงโซ่การไหลของสภาพอากาศ (Weather Logical Chain)</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0B0C] border border-[#2F3336]/80 flex flex-col gap-2.5">
              {chainKeys.map((wName, idx) => {
                const nextItems = currentSystem.logical_chain[wName]?.next || [];
                return (
                  <div key={idx} className="flex items-center gap-2 text-[13px] flex-wrap">
                    <span className="px-3 py-1.5 rounded-full bg-transparent text-[#F2F2F5] font-medium border border-[#2F3336]">
                      {wName}
                    </span>
                    <ArrowRight size={14} className="text-[#EF264C] shrink-0" />
                    {nextItems.map((nItem, nIdx) => (
                      <span
                        key={nIdx}
                        className="px-3 py-1.5 rounded-full bg-transparent text-[#EF264C] font-medium border border-[#EF264C]/50"
                      >
                        {nItem}
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
