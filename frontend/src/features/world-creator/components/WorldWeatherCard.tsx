import React, { useState } from 'react';
import {
  CloudSun,
  Pencil,
  X,
  Check,
  Clock,
  ArrowRight,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import type { WorldTimeWeather, WorldTimePeriod, WorldWeatherChainItem } from '../types';

interface WorldWeatherCardProps {
  cardRef?: React.RefObject<HTMLDivElement | null>;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
  onSave?: (data: WorldTimeWeather) => void;
  timeWeather?: WorldTimeWeather;
}

const DEFAULT_TIME_PERIODS: WorldTimePeriod[] = [
  {
    time: 'บ่ายแก่ๆ (Late Afternoon)',
    atmosphere:
      'แสงแดดแรงส่องลอดช่องระหว่างตึกพาดผ่านดาดฟ้า สร้างมุมเงาเข้มตัดกับผิวขาวสว่างใสยามถอดชุดทำงานออก',
  },
  {
    time: 'เย็นหลังเลิกงาน (Post-Work Twilight)',
    atmosphere:
      'แสงโพล้เพล้พายุฝนก่อตัวขึ้นอย่างหนาแน่น ท้องฟ้ามืดสลัวทำให้บรรยากาศภายในร้านกาแฟใต้ดินเงียบสงบขึ้น',
  },
  {
    time: 'ดึกสงัด (Dead of Night)',
    atmosphere:
      'ออฟฟิศปิดไฟมืดสนิท มีเพียงแสงไฟฉุกเฉินสีเขียวสลัวและแสงเรืองรองจากหน้าจอมือถือที่สะท้อนหน้าเลนส์แว่นตา',
  },
];

const DEFAULT_WEATHER_CHAIN: WorldWeatherChainItem[] = [
  {
    weather: 'แดดจัดยามบ่าย',
    next: 'พายุฝนฤดูร้อน',
    sensory:
      'ไอแดดระอุร้อนตัดกับลมกระโชกแรง ผิวเนื้อเริ่มขึ้นเหงื่อชื้นก่อนที่เม็ดฝนจะตก',
  },
  {
    weather: 'พายุฝนฤดูร้อน',
    next: 'ฝนปรอยชื้นแฉะ',
    sensory:
      'อากาศเย็นยะเยือกกะทันหัน เม็ดฝนกระหน่ำกระจกหนา กลิ่นไอดินโชยลอยเข้าตามขอบประตู',
  },
];

export default function WorldWeatherCard({
  cardRef,
  isEditing = false,
  onStartEdit,
  onCancelEdit,
  onSave,
  timeWeather = {
    time_periods: DEFAULT_TIME_PERIODS,
    weather_chain: DEFAULT_WEATHER_CHAIN,
  },
}: WorldWeatherCardProps) {
  const [editPeriods, setEditPeriods] = useState<WorldTimePeriod[]>(
    timeWeather.time_periods || DEFAULT_TIME_PERIODS
  );
  const [editWeather, setEditWeather] = useState<WorldWeatherChainItem[]>(
    timeWeather.weather_chain || DEFAULT_WEATHER_CHAIN
  );

  const handleStart = () => {
    setEditPeriods(timeWeather.time_periods || DEFAULT_TIME_PERIODS);
    setEditWeather(timeWeather.weather_chain || DEFAULT_WEATHER_CHAIN);
    onStartEdit?.();
  };

  const handleSave = () => {
    onSave?.({
      time_periods: editPeriods,
      weather_chain: editWeather,
    });
  };

  const handleAddPeriod = () => {
    setEditPeriods((prev) => [
      ...prev,
      {
        time: 'ช่วงเวลาใหม่',
        atmosphere: 'คำบรรยายแสงเงาและบรรยากาศ...',
      },
    ]);
  };

  const handleDeletePeriod = (idx: number) => {
    setEditPeriods((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddWeather = () => {
    setEditWeather((prev) => [
      ...prev,
      {
        weather: 'สภาพอากาศตั้งต้น',
        next: 'สภาพอากาศถัดไป',
        sensory: 'การเปลี่ยนแปลงของประสาทสัมผัส...',
      },
    ]);
  };

  const handleDeleteWeather = (idx: number) => {
    setEditWeather((prev) => prev.filter((_, i) => i !== idx));
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
      {/* Header พร้อมปุ่มดินสอกลม [ ✏️ ] / [ ✕ ] [ ✓ ] */}
      <div className="flex items-center justify-between border-b border-[#2F3336]/60 pb-2.5">
        <div className="flex items-center gap-2">
          <CloudSun size={16} className="text-[#EF264C] shrink-0" />
          <h3
            className={`text-[18px] sm:text-[19px] font-bold tracking-tight ${
              isEditing ? 'text-[#EF264C]' : 'text-[#F2F2F5]'
            }`}
          >
            {isEditing
              ? 'แก้ไขกาลเวลา & พลวัตสภาพอากาศ'
              : 'ระบบกาลเวลา & พลวัตสภาพอากาศ'}
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
              title="บันทึกระบบกาลเวลาและสภาพอากาศ"
              className="w-8 h-8 rounded-full border border-[#EF264C]/70 bg-[#EF264C]/15 hover:bg-[#EF264C] text-[#EF264C] hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 shadow-[0_0_10px_rgba(239,38,76,0.2)] select-none"
            >
              <Check size={14} strokeWidth={2.2} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStart}
            title="แก้ไขระบบกาลเวลาและสภาพอากาศ"
            className="w-8 h-8 rounded-full bg-transparent border border-[#2F3336] hover:border-[#EF264C]/60 text-[#ACACB2] hover:text-[#EF264C] flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 select-none"
          >
            <Pencil size={14} strokeWidth={1.8} />
          </button>
        )}
      </div>

      {/* 1. Time Periods */}
      <div className="space-y-2.5 pt-0.5">
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] font-bold text-[#EF264C] uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={13} className="text-[#EF264C]" />
            <span>ช่วงเวลา & บรรยากาศแสงเงา (TIME PERIODS)</span>
          </span>
          {isEditing && (
            <button
              type="button"
              onClick={handleAddPeriod}
              className="text-[11px] font-bold text-[#ACACB2] hover:text-[#EF264C] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus size={12} />
              <span>เพิ่มช่วงเวลา</span>
            </button>
          )}
        </div>

        <div className="space-y-2">
          {(isEditing ? editPeriods : timeWeather.time_periods || []).map(
            (tp, idx) => (
              <div
                key={idx}
                className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  {isEditing ? (
                    <input
                      type="text"
                      value={tp.time}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditPeriods((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, time: val } : item
                          )
                        );
                      }}
                      className="bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13px] font-bold rounded-lg px-2.5 py-0.5 outline-none"
                    />
                  ) : (
                    <span className="text-[13px] font-bold text-[#F2F2F5]">
                      {tp.time}
                    </span>
                  )}

                  {isEditing && editPeriods.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeletePeriod(idx)}
                      title="ลบช่วงเวลานี้"
                      className="text-[#ACACB2] hover:text-red-400 p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <textarea
                    value={tp.atmosphere}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditPeriods((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, atmosphere: val } : item
                        )
                      );
                    }}
                    rows={2}
                    className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[14px] font-normal rounded-lg p-2 outline-none resize-none leading-relaxed"
                  />
                ) : (
                  <p className="text-[14px] text-[#F2F2F5] font-normal leading-relaxed select-text">
                    {tp.atmosphere}
                  </p>
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* 2. Weather Logic Chain */}
      <div className="border-t border-[#2F3336]/60 pt-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] font-bold text-[#ACACB2] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#EF264C]" />
            <span>ลูกโซ่สภาพอากาศ (WEATHER LOGIC CHAIN)</span>
          </span>
          {isEditing && (
            <button
              type="button"
              onClick={handleAddWeather}
              className="text-[11px] font-bold text-[#ACACB2] hover:text-[#EF264C] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus size={12} />
              <span>เพิ่มสภาพอากาศ</span>
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {(isEditing ? editWeather : timeWeather.weather_chain || []).map(
            (wc, idx) => (
              <div
                key={idx}
                className="bg-black/25 p-3 rounded-lg border border-white/5 space-y-2"
              >
                {/* Weather Transition Pill */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={wc.weather}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditWeather((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, weather: val } : item
                              )
                            );
                          }}
                          className="bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[12px] font-bold rounded-lg px-2 py-0.5 outline-none"
                        />
                        <ArrowRight size={13} className="text-[#EF264C]" />
                        <input
                          type="text"
                          value={wc.next}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditWeather((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, next: val } : item
                              )
                            );
                          }}
                          className="bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[12px] font-bold rounded-lg px-2 py-0.5 outline-none"
                        />
                      </>
                    ) : (
                      <div className="inline-flex items-center gap-2 bg-[#1D1D1F] px-2.5 py-1 rounded-full border border-white/10 text-[12px] font-bold">
                        <span className="text-[#F2F2F5]">{wc.weather}</span>
                        <ArrowRight size={12} className="text-[#EF264C]" />
                        <span className="text-amber-400">{wc.next}</span>
                      </div>
                    )}
                  </div>

                  {isEditing && editWeather.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteWeather(idx)}
                      title="ลบสภาพอากาศนี้"
                      className="text-[#ACACB2] hover:text-red-400 p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                {/* Sensory Experience */}
                {isEditing ? (
                  <textarea
                    value={wc.sensory}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditWeather((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, sensory: val } : item
                        )
                      );
                    }}
                    rows={2}
                    placeholder="ความเปลี่ยนแปลงของประสาทสัมผัสและอารมณ์..."
                    className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[14px] font-normal rounded-lg p-2 outline-none resize-none leading-relaxed"
                  />
                ) : (
                  <p className="text-[14px] text-[#F2F2F5] font-normal leading-relaxed select-text">
                    💡 {wc.sensory}
                  </p>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
