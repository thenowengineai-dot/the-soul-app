import { useState, useEffect } from 'react';
import { Pencil, Check, Plus } from 'lucide-react';
import type { VaultDraft, WorldLocationItem } from '../../types';
import { DEFAULT_BOTANICAL_LOCATIONS } from '../../defaultWorldLocations';

interface WorldStagePropsCardProps {
  draft: VaultDraft;
  activeLocationKey?: string;
  onSelectLocation?: (key: string) => void;
  onUpdateDraft?: (updated: Partial<VaultDraft>) => void;
  isEditable?: boolean;
}

export default function WorldStagePropsCard({
  draft,
  activeLocationKey,
  onSelectLocation,
  onUpdateDraft,
  isEditable = true,
}: WorldStagePropsCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingScene, setIsAddingScene] = useState(false);
  const [newSceneName, setNewSceneName] = useState('');

  // Determine locations
  const locMap =
    draft.real_locations && Object.keys(draft.real_locations).length > 0
      ? draft.real_locations
      : DEFAULT_BOTANICAL_LOCATIONS;

  const locationKeys = Object.keys(locMap);

  const currentLocKey =
    activeLocationKey && locMap[activeLocationKey]
      ? activeLocationKey
      : locationKeys[0] || 'ห้องสกัดสมุนไพร ณ เรือนพักปีกใน';

  const currentLocation: WorldLocationItem =
    locMap[currentLocKey] || DEFAULT_BOTANICAL_LOCATIONS['ห้องสกัดสมุนไพร ณ เรือนพักปีกใน'];

  // Form edit states
  const [propsText, setPropsText] = useState(
    () => currentLocation.interactive_props || currentLocation.key_furniture || ''
  );
  const [lightingText, setLightingText] = useState(
    () => currentLocation.lighting_shadow || currentLocation.base_mood || ''
  );
  const [sensoryText, setSensoryText] = useState(
    () => currentLocation.sensory_cues?.ambient_cues?.join('\n') || ''
  );
  const [dynamicText, setDynamicText] = useState(
    () => currentLocation.dynamic_shift || currentLocation.choke_points || ''
  );

  // Sync state when location or draft changes
  useEffect(() => {
    setPropsText(currentLocation.interactive_props || currentLocation.key_furniture || '');
    setLightingText(currentLocation.lighting_shadow || currentLocation.base_mood || '');
    setSensoryText(currentLocation.sensory_cues?.ambient_cues?.join('\n') || '');
    setDynamicText(currentLocation.dynamic_shift || currentLocation.choke_points || '');
  }, [currentLocation]);

  const handleSelectKey = (key: string) => {
    if (isEditing) {
      handleSave();
    }
    if (onSelectLocation) {
      onSelectLocation(key);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    const cleanedProps = propsText.trim();
    const cleanedLighting = lightingText.trim();
    const cleanedSensoryCues = sensoryText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const cleanedDynamic = dynamicText.trim();

    const updatedLocation: WorldLocationItem = {
      ...currentLocation,
      interactive_props: cleanedProps,
      key_furniture: cleanedProps || currentLocation.key_furniture,
      lighting_shadow: cleanedLighting,
      sensory_cues: {
        ambient_cues:
          cleanedSensoryCues.length > 0
            ? cleanedSensoryCues
            : currentLocation.sensory_cues?.ambient_cues || [],
      },
      dynamic_shift: cleanedDynamic,
    };

    const updatedMap = {
      ...locMap,
      [currentLocKey]: updatedLocation,
    };

    if (onUpdateDraft) {
      onUpdateDraft({
        real_locations: updatedMap,
      });
    }
  };

  const handleAddScene = () => {
    const trimmed = newSceneName.trim();
    if (!trimmed) {
      setIsAddingScene(false);
      return;
    }

    const newLocation: WorldLocationItem = {
      base_mood: 'บรรยากาศใหม่อันเปี่ยมชีวิตชีวา',
      choke_points: 'ทางเข้าออกหลัก',
      key_furniture: '',
      spatial_layout: 'ขอบเขตพื้นที่และระยะทาง',
      anchor_points: 'จุดสังเกตหลัก',
      interactive_props: 'อุปกรณ์และสิ่งของที่หยิบจับได้',
      lighting_shadow: 'แสงสว่างและเงามืดในฉาก',
      sensory_cues: {
        ambient_cues: ['เสียงบรรยากาศโดยรอบ', 'กลิ่นประจำฉาก'],
      },
      dynamic_shift: 'เงื่อนไขที่บีบให้เกิดการเคลื่อนไหวหรือเปลี่ยนฉาก',
    };

    const updatedMap = {
      ...locMap,
      [trimmed]: newLocation,
    };

    if (onUpdateDraft) {
      onUpdateDraft({
        real_locations: updatedMap,
      });
    }

    if (onSelectLocation) {
      onSelectLocation(trimmed);
    }

    setNewSceneName('');
    setIsAddingScene(false);
  };

  // Props items list
  const propItems = propsText
    ? propsText
        .split(/[•,\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // Sensory cues items
  const sensoryItems = sensoryText
    ? sensoryText
        .split('\n')
        .map((s) => s.trim().replace(/^[•\-\*]\s*/, ''))
        .filter(Boolean)
    : currentLocation.sensory_cues?.ambient_cues || [];

  const frostedCardClass =
    'bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all flex flex-col justify-between relative overflow-hidden';

  return (
    <div
      className={`col-span-2 row-span-2 rounded-[28px] p-4 sm:p-5 ${frostedCardClass}`}
      style={{ width: '346px', height: '346px' }}
    >
      {/* 1. Header Row: Left-Aligned Title + Edit Button */}
      <div className="flex items-center justify-between shrink-0 mb-2 px-0.5">
        <span className="text-[16px] sm:text-[17px] font-semibold text-[#F1F1F1] tracking-tight">
          เวทีสถานที่และพร็อพ
        </span>

        {isEditable && (
          <div className="shrink-0">
            {isEditing ? (
              <button
                type="button"
                onClick={handleSave}
                className="w-7 h-7 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(239,38,76,0.4)] transition-all cursor-pointer active:scale-95"
                title="บันทึกข้อมูลฉาก"
              >
                <Check size={13} strokeWidth={2.4} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] active:scale-95"
                title="แก้ไขข้อมูลฉาก"
              >
                <Pencil size={12} strokeWidth={2} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Master Scene Selector Pill Dock */}
      <div className="shrink-0 mb-3 -mx-1 px-1 overflow-x-auto no-scrollbar flex items-center gap-1.5 py-0.5">
        {locationKeys.map((key) => {
          const isActive = key === currentLocKey;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleSelectKey(key)}
              className={`px-3 py-1 rounded-full text-[11.5px] font-medium transition-all cursor-pointer whitespace-nowrap select-none shrink-0 ${
                isActive
                  ? 'bg-white/15 text-[#F1F1F1] border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white/80 border border-white/[0.07]'
              }`}
            >
              {key}
            </button>
          );
        })}

        {/* Add Scene Button or Input */}
        {isEditable && (
          <>
            {isAddingScene ? (
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="text"
                  value={newSceneName}
                  onChange={(e) => setNewSceneName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddScene();
                    if (e.key === 'Escape') setIsAddingScene(false);
                  }}
                  placeholder="ชื่อฉากใหม่..."
                  autoFocus
                  className="w-[110px] h-[26px] rounded-full bg-black/50 border border-white/20 px-2.5 text-[11px] text-[#EDEDED] outline-none placeholder-white/30"
                />
                <button
                  type="button"
                  onClick={handleAddScene}
                  className="w-[26px] h-[26px] rounded-full bg-[#EF264C] text-white flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Check size={11} strokeWidth={2.4} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingScene(true)}
                className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] text-white/40 hover:text-white/80 text-[11.5px] flex items-center gap-1 shrink-0 transition-all cursor-pointer select-none"
                title="เพิ่มสถานที่ใหม่"
              >
                <Plus size={11} strokeWidth={2.2} />
                <span>เพิ่มฉาก</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* 3. Body Stage: Display Mode vs Edit Mode */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {!isEditing ? (
          <div className="flex-1 overflow-y-auto pr-1.5 custom-scrollbar min-h-0 space-y-3.5 select-text pt-0.5">
            {/* Section 1: Interactive Props */}
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-white/40 block mb-1">
                วัตถุและพร็อพที่หยิบจับได้
              </span>
              {propItems.length > 0 ? (
                <ul className="space-y-1">
                  {propItems.map((prop, idx) => (
                    <li
                      key={idx}
                      className="text-[12px] text-[#EDEDED] font-normal leading-[18px] tracking-tight flex items-start gap-1.5"
                    >
                      <span className="text-white/30 shrink-0 text-[10px] mt-0.5">•</span>
                      <span>{prop}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[12px] text-white/50 italic">ยังไม่มีการระบุพร็อพ</p>
              )}
            </div>

            {/* Section 2: Lighting & Visibility */}
            {lightingText && (
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-white/40 block mb-1">
                  แสงเงาและทัศนวิสัย
                </span>
                <p className="text-[12px] text-[#D6D6DC] font-normal leading-[18px] tracking-tight">
                  {lightingText}
                </p>
              </div>
            )}

            {/* Section 3: 3D Sensory Field */}
            {sensoryItems.length > 0 && (
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-white/40 block mb-1">
                  ผัสสะรอบทิศ (กลิ่น • เสียง • อุณหภูมิ)
                </span>
                <ul className="space-y-1">
                  {sensoryItems.map((cue, idx) => (
                    <li
                      key={idx}
                      className="text-[12px] text-[#EDEDED] font-normal leading-[18px] tracking-tight flex items-start gap-1.5"
                    >
                      <span className="text-[#EF264C]/70 shrink-0 text-[10px] mt-0.5">✦</span>
                      <span>{cue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Section 4: Dynamic Shift */}
            {dynamicText && (
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#EF264C]/80 block mb-1">
                  ไดนามิกการเปลี่ยนฉาก
                </span>
                <p className="text-[12px] text-[#EDEDED] font-normal leading-[18px] tracking-tight">
                  {dynamicText}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0 flex flex-col gap-2.5 pt-0.5">
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">
                วัตถุและพร็อพที่หยิบจับได้ (คั่นด้วย • หรือจุลภาค หรือขึ้นบรรทัดใหม่)
              </label>
              <textarea
                value={propsText}
                onChange={(e) => setPropsText(e.target.value)}
                placeholder="โกร่งบดยาหินแกรนิต • โหลแก้วเกสรพิษ • กาน้ำชาดินเผา"
                className="w-full h-[52px] rounded-[12px] bg-black/40 border border-white/10 focus:border-white/25 px-2.5 py-1 text-[11.5px] text-[#EDEDED] outline-none resize-none leading-relaxed custom-scrollbar placeholder-white/30"
              />
            </div>

            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">
                แสงเงาและทัศนวิสัย (Lighting & Shadow)
              </label>
              <textarea
                value={lightingText}
                onChange={(e) => setLightingText(e.target.value)}
                placeholder="แสงตะเกียงน้ำมันส่องสลัว ทอดเงายาวถึงผนัง..."
                className="w-full h-[46px] rounded-[12px] bg-black/40 border border-white/10 focus:border-white/25 px-2.5 py-1 text-[11.5px] text-[#EDEDED] outline-none resize-none leading-relaxed custom-scrollbar placeholder-white/30"
              />
            </div>

            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">
                ผัสสะ 3 มิติ (กลิ่น, เสียง, ผิวสัมผัส - บรรทัดละ 1 ข้อ)
              </label>
              <textarea
                value={sensoryText}
                onChange={(e) => setSensoryText(e.target.value)}
                placeholder="กลิ่นเกสรพิษมึนเมาอบอวล&#10;เสียงฝนกระหน่ำหลังคาไม้สน&#10;ไอร้อนชื้นแนบเนื้อ"
                className="w-full h-[54px] rounded-[12px] bg-black/40 border border-white/10 focus:border-white/25 px-2.5 py-1 text-[11.5px] text-[#EDEDED] outline-none resize-none leading-relaxed custom-scrollbar placeholder-white/30"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#EF264C]/80 uppercase tracking-wider block mb-1">
                ไดนามิกการเปลี่ยนฉาก (Dynamic Shift & Clock)
              </label>
              <textarea
                value={dynamicText}
                onChange={(e) => setDynamicText(e.target.value)}
                placeholder="พายุฝนทวีความรุนแรงจนน้ำป่าตัดสะพาน ขังคนทั้งสองไว้..."
                className="w-full h-[52px] rounded-[12px] bg-black/40 border border-white/10 focus:border-white/25 px-2.5 py-1 text-[11.5px] text-[#EDEDED] outline-none resize-none leading-relaxed custom-scrollbar placeholder-white/30"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
