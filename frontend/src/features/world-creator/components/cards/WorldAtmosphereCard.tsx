import { useState, useEffect } from 'react';
import { Pencil, Check, CloudSun, Wind, Palette } from 'lucide-react';
import type { VaultDraft } from '../../types';

interface WorldAtmosphereCardProps {
  draft: VaultDraft;
  onUpdateDraft?: (updated: Partial<VaultDraft>) => void;
  isEditable?: boolean;
}

const DEFAULT_THAI_NAME = 'พฤกษศาสตร์ถอดหน้ากาก: พิษร้อนและน้ำมังกร';
const DEFAULT_EN_NAME = 'The Botanical Poison & Dragon Water Ritual';
const DEFAULT_WEATHER = 'แดดยามบ่ายเงียบสงัด • เมฆดำทะมึนจะกลืนทิวเขา';
const DEFAULT_SENSORY = 'ไอหมอกกำมะถันออนเซ็น • ลมหนาวชื้นป่าสน';
const DEFAULT_COLOR_VIBE = 'เขียวมรกตพฤกษศาสตร์ × แดงคาร์ไมน์พิษร้อน';

export default function WorldAtmosphereCard({
  draft,
  onUpdateDraft,
  isEditable = true,
}: WorldAtmosphereCardProps) {
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

  // Sync draft updates if changed externally
  useEffect(() => {
    if (draft.thai_name) setThaiName(draft.thai_name);
    if (draft.worldTitle && !draft.worldTitle.includes('โลกใบใหม่')) {
      setEnName(draft.worldTitle);
    }
    if (draft.starting_state?.weather) setWeather(draft.starting_state.weather);
    if (draft.worldSound) setSensory(draft.worldSound);
    if (draft.worldVisual) setColorVibe(draft.worldVisual);
  }, [
    draft.thai_name,
    draft.worldTitle,
    draft.starting_state?.weather,
    draft.worldSound,
    draft.worldVisual,
  ]);

  // Save changes
  const handleSave = () => {
    setIsEditing(false);
    const cleanedThai = thaiName.trim() || DEFAULT_THAI_NAME;
    const cleanedEn = enName.trim() || DEFAULT_EN_NAME;
    const cleanedWeather = weather.trim() || DEFAULT_WEATHER;
    const cleanedSensory = sensory.trim() || DEFAULT_SENSORY;
    const cleanedColor = colorVibe.trim() || DEFAULT_COLOR_VIBE;

    setThaiName(cleanedThai);
    setEnName(cleanedEn);
    setWeather(cleanedWeather);
    setSensory(cleanedSensory);
    setColorVibe(cleanedColor);

    if (onUpdateDraft) {
      onUpdateDraft({
        thai_name: cleanedThai,
        worldTitle: cleanedEn,
        worldVisual: cleanedColor,
        worldSound: cleanedSensory,
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
      {/* 1. Top Bar: Apple Tactile Circular Action (No Category Badge - Hero Plaque) */}
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
          <div className="flex-1 flex flex-col justify-between min-h-0">
            {/* Masthead Hero: Large World Title & English Subtitle (Hero Style like Card 1) */}
            <div className="shrink-0 pt-0.5">
              <h1 className="text-[22px] sm:text-[24px] font-bold text-[#F1F1F1] tracking-tight leading-[1.25] line-clamp-2">
                {thaiName}
              </h1>
              <div className="text-[12px] sm:text-[12.5px] text-[#A1A1A8] mt-1 font-normal leading-normal truncate">
                {enName}
              </div>
            </div>

            {/* Horizon Hairline Gradient (Under Title) */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent my-3 shrink-0" />

            {/* 💡 Concept 1: The Apple Weather / Biome Micro-Dock (3 คอลัมน์แนวนอน ไม่ตกขอบ) */}
            <div className="rounded-[20px] bg-white/[0.035] border border-white/[0.08] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] shrink-0">
              <div className="grid grid-cols-3 gap-2 divide-x divide-white/[0.08]">
                {/* Column 1: Time & Weather */}
                <div className="flex flex-col justify-between pr-1.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-white/40">
                    <CloudSun size={12} className="shrink-0 text-amber-300/80" />
                    <span className="text-[9.5px] uppercase font-medium tracking-wider truncate">
                      กาลเวลา/อากาศ
                    </span>
                  </div>
                  <div
                    className="mt-1.5 text-[11.5px] text-[#EDEDED] font-normal leading-snug line-clamp-2"
                    title={weather}
                  >
                    {weather}
                  </div>
                </div>

                {/* Column 2: Sensory & Biome */}
                <div className="flex flex-col justify-between px-2 min-w-0">
                  <div className="flex items-center gap-1.5 text-white/40">
                    <Wind size={12} className="shrink-0 text-sky-300/80" />
                    <span className="text-[9.5px] uppercase font-medium tracking-wider truncate">
                      ผัสสะฉาก
                    </span>
                  </div>
                  <div
                    className="mt-1.5 text-[11.5px] text-[#EDEDED] font-normal leading-snug line-clamp-2"
                    title={sensory}
                  >
                    {sensory}
                  </div>
                </div>

                {/* Column 3: Color Tone & Vibe */}
                <div className="flex flex-col justify-between pl-2 min-w-0">
                  <div className="flex items-center gap-1.5 text-white/40">
                    <Palette size={12} className="shrink-0 text-rose-400/80" />
                    <span className="text-[9.5px] uppercase font-medium tracking-wider truncate">
                      โทนสีภาพ
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_5px_rgba(52,211,153,0.35)]" />
                      <span className="w-2 h-2 rounded-full bg-[#EF264C] shrink-0 shadow-[0_0_5px_rgba(239,38,76,0.35)]" />
                    </div>
                    <div
                      className="text-[11px] text-[#EDEDED] font-normal leading-tight line-clamp-2"
                      title={colorVibe}
                    >
                      {colorVibe}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Mode Form */
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar py-1">
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

            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-medium text-white/50 block mb-0.5">
                  สภาพอากาศ (Weather)
                </label>
                <input
                  type="text"
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  placeholder="เช่น แดดยามบ่ายเงียบสงัด..."
                  className="w-full p-2 rounded-xl bg-white/[0.06] border border-white/10 text-[11.5px] text-white/90 placeholder-white/30 focus:outline-none focus:border-white/30"
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
                  className="w-full p-2 rounded-xl bg-white/[0.06] border border-white/10 text-[11.5px] text-white/90 placeholder-white/30 focus:outline-none focus:border-white/30"
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
                  className="w-full p-2 rounded-xl bg-white/[0.06] border border-white/10 text-[11.5px] text-white/90 placeholder-white/30 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
