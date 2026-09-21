import { useState, useEffect } from 'react';
import { Pencil, Check } from 'lucide-react';
import type { VaultDraft } from '../../types';

interface WorldPrologueCardProps {
  draft: VaultDraft;
  onUpdateDraft?: (updated: Partial<VaultDraft>) => void;
  isEditable?: boolean;
}

const DEFAULT_THAI_NAME = 'พฤกษศาสตร์ถอดหน้ากาก: พิษร้อนและน้ำมังกร';
const DEFAULT_EN_NAME = 'The Botanical Poison & Dragon Water Ritual';
const DEFAULT_WEATHER = 'แดดยามบ่ายเงียบสงัด ก่อนเมฆดำทะมึนจะกลืนทิวเขา';
const DEFAULT_SENSORY = 'ไอหมอกกำมะถันออนเซ็น ปะทะ ลมหนาวชื้นกลางป่าสน';
const DEFAULT_COLOR_VIBE = 'เขียวมรกตพฤกษศาสตร์ตัดแดงคาร์ไมน์พิษร้อน';
const DEFAULT_PREMISE =
  'ทริปเก็บกู้สมุนไพรของชมรมพฤกษศาสตร์ ณ เรียวกังออนเซ็นกลางหุบเขาที่ดูสงบเงียบ ควรจะเป็นช่วงเวลาแห่งการพักผ่อน แต่เมื่อเมฆฝนดำทะมึนเริ่มปิดล้อมป่า ละอองเกสรพิษกำเริบ และสติของรุ่นพี่สาวแว่นเริ่มหลุดลอย [PLAYER] กำลังจะถูกเหวี่ยงเข้าไปอยู่ในสถานการณ์ที่ไม่มีทางถอยกลับ...';

export default function WorldPrologueCard({
  draft,
  onUpdateDraft,
  isEditable = true,
}: WorldPrologueCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const [thaiName, setThaiName] = useState(() => {
    return draft.thai_name || DEFAULT_THAI_NAME;
  });

  const [enName, setEnName] = useState(() => {
    return draft.worldTitle && !draft.worldTitle.includes('โลกใบใหม่')
      ? draft.worldTitle
      : DEFAULT_EN_NAME;
  });

  const [weather, setWeather] = useState(() => {
    return draft.starting_state?.weather || DEFAULT_WEATHER;
  });

  const [sensory, setSensory] = useState(() => {
    return draft.worldSound || draft.starting_state?.location || DEFAULT_SENSORY;
  });

  const [colorVibe, setColorVibe] = useState(() => {
    return draft.worldVisual || DEFAULT_COLOR_VIBE;
  });

  const [premise, setPremise] = useState(() => {
    return draft.prologue?.premise || draft.description || DEFAULT_PREMISE;
  });

  // Sync draft updates if changed externally
  useEffect(() => {
    if (draft.thai_name) setThaiName(draft.thai_name);
    if (draft.worldTitle && !draft.worldTitle.includes('โลกใบใหม่')) {
      setEnName(draft.worldTitle);
    }
    if (draft.starting_state?.weather) setWeather(draft.starting_state.weather);
    if (draft.worldSound) setSensory(draft.worldSound);
    if (draft.worldVisual) setColorVibe(draft.worldVisual);
    if (draft.prologue?.premise) setPremise(draft.prologue.premise);
  }, [
    draft.thai_name,
    draft.worldTitle,
    draft.starting_state?.weather,
    draft.worldSound,
    draft.worldVisual,
    draft.prologue?.premise,
  ]);

  // Save changes
  const handleSave = () => {
    setIsEditing(false);
    const cleanedThai = thaiName.trim() || DEFAULT_THAI_NAME;
    const cleanedEn = enName.trim() || DEFAULT_EN_NAME;
    const cleanedWeather = weather.trim() || DEFAULT_WEATHER;
    const cleanedSensory = sensory.trim() || DEFAULT_SENSORY;
    const cleanedColor = colorVibe.trim() || DEFAULT_COLOR_VIBE;
    const cleanedPremise = premise.trim() || DEFAULT_PREMISE;

    setThaiName(cleanedThai);
    setEnName(cleanedEn);
    setWeather(cleanedWeather);
    setSensory(cleanedSensory);
    setColorVibe(cleanedColor);
    setPremise(cleanedPremise);

    if (onUpdateDraft) {
      onUpdateDraft({
        thai_name: cleanedThai,
        worldTitle: cleanedEn,
        worldVisual: cleanedColor,
        worldSound: cleanedSensory,
        prologue: {
          ...(draft.prologue || { question: '', choices: [] }),
          premise: cleanedPremise,
        },
        starting_state: {
          ...(draft.starting_state || {
            time: 'ยามบ่าย',
            location: 'เรียวกังออนเซ็นกลางทิวเขา',
            initial_a_pos: '',
            initial_p_pos: '',
            initial_outfit_key: '',
          }),
          weather: cleanedWeather,
        },
      });
    }
  };

  // Apple Subtle Frosted Glass Recipe
  const frostedCardClass =
    'bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all flex flex-col justify-between relative overflow-hidden';

  return (
    <div
      className={`col-span-2 row-span-2 rounded-[28px] p-5 ${frostedCardClass}`}
      style={{ width: '346px', height: '346px' }}
    >
      {/* 1. Top Bar: Apple Tactile Circular Action (No Category Badge) */}
      <div className="flex items-center justify-end shrink-0 h-8">
        {isEditable && (
          <div>
            {isEditing ? (
              <button
                type="button"
                onClick={handleSave}
                className="w-8 h-8 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(239,38,76,0.4)] transition-all cursor-pointer active:scale-95"
                title="บันทึกข้อมูลโลก"
              >
                <Check size={14} strokeWidth={2.4} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] active:scale-95"
                title="แก้ไขข้อมูลโลก"
              >
                <Pencil size={13} strokeWidth={2} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Body Stage: Display vs Edit Mode */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {!isEditing ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Masthead Hero: Large World Title & English Subtitle (Hero Style like Card 1) */}
            <div className="shrink-0">
              <h1 className="text-[22px] sm:text-[24px] font-bold text-[#F1F1F1] tracking-tight leading-[1.25] line-clamp-2">
                {thaiName}
              </h1>
              <div className="text-[12px] sm:text-[12.5px] text-[#A1A1A8] mt-1 font-normal leading-normal truncate">
                {enName}
              </div>
            </div>

            {/* Horizon Hairline Gradient (Under Title) */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.16] to-transparent my-2.5 shrink-0" />

            {/* Ambient Weather & Mood Tray (โทนสีและสภาพอากาศหลัก 3 มิติ) */}
            <div className="rounded-2xl bg-white/[0.035] border border-white/[0.07] px-3 py-2 shrink-0 space-y-1 my-1">
              <div className="flex items-center gap-2 text-[11px] leading-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C] shrink-0" />
                <span className="text-white/45 shrink-0 font-medium">สภาพอากาศ</span>
                <span className="text-[#E0E0E6] truncate font-normal">{weather}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] leading-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shrink-0" />
                <span className="text-white/45 shrink-0 font-medium">ผัสสะฉาก</span>
                <span className="text-[#E0E0E6] truncate font-normal">{sensory}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] leading-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 shrink-0" />
                <span className="text-white/45 shrink-0 font-medium">โทนสีหลัก</span>
                <span className="text-[#E0E0E6] truncate font-normal">{colorVibe}</span>
              </div>
            </div>

            {/* Cinematic Premise / Logline (แก่นเรื่องย่อ 1-2 ย่อหน้าภาพยนตร์บอกเล่าสเกลเรื่อง) */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0 pt-1">
              <p className="text-[12px] sm:text-[12.5px] text-[#D6D6DC] font-normal leading-[19.5px] tracking-wide select-text">
                {premise}
              </p>
            </div>
          </div>
        ) : (
          /* Edit Mode Form */
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar py-1">
            <div>
              <label className="text-[10px] font-medium text-white/50 block mb-0.5">
                ชื่อโลก / ชื่อเรื่องภาษาไทย
              </label>
              <input
                type="text"
                value={thaiName}
                onChange={(e) => setThaiName(e.target.value)}
                placeholder="ชื่อโลกภาษาไทย..."
                className="w-full p-2 rounded-xl bg-white/[0.06] border border-white/10 text-[12.5px] text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="text-[10px] font-medium text-white/50 block mb-0.5">
                ชื่อเรื่องภาษาอังกฤษ (English Title)
              </label>
              <input
                type="text"
                value={enName}
                onChange={(e) => setEnName(e.target.value)}
                placeholder="English World Title..."
                className="w-full p-2 rounded-xl bg-white/[0.06] border border-white/10 text-[11.5px] text-white/90 placeholder-white/30 focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              <div>
                <label className="text-[10px] font-medium text-white/50 block mb-0.5">
                  สภาพอากาศ (Weather)
                </label>
                <input
                  type="text"
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  placeholder="เช่น แดดยามบ่ายเงียบสงัด..."
                  className="w-full p-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-[11px] text-white/90 placeholder-white/30 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-[10px] font-medium text-white/50 block mb-0.5">
                  ผัสสะสิ่งแวดล้อม (Sensory)
                </label>
                <input
                  type="text"
                  value={sensory}
                  onChange={(e) => setSensory(e.target.value)}
                  placeholder="เช่น ไอหมอกกำมะถันออนเซ็น..."
                  className="w-full p-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-[11px] text-white/90 placeholder-white/30 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-[10px] font-medium text-white/50 block mb-0.5">
                  โทนสีหลัก / ไวบ์ของภาพ (Color & Vibe)
                </label>
                <input
                  type="text"
                  value={colorVibe}
                  onChange={(e) => setColorVibe(e.target.value)}
                  placeholder="เช่น เขียวมรกตตัดแดงพิษร้อน..."
                  className="w-full p-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-[11px] text-white/90 placeholder-white/30 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-medium text-white/50 block mb-0.5">
                แก่นเรื่องย่อ (Logline/Premise)
              </label>
              <textarea
                value={premise}
                onChange={(e) => setPremise(e.target.value)}
                placeholder="พิมพ์แก่นเรื่องย่อภาพยนตร์..."
                rows={3}
                className="w-full p-2 rounded-xl bg-white/[0.06] border border-white/10 text-[11.5px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-none leading-relaxed"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
