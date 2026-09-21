import { useState, useEffect } from 'react';
import {
  Pencil,
  Check,
  Plus,
  Maximize2,
  Package,
  Sun,
  Flame,
  Zap,
} from 'lucide-react';
import type { VaultDraft, WorldLocationItem } from '../../types';
import { DEFAULT_BOTANICAL_LOCATIONS } from '../../defaultWorldLocations';

interface WorldDeepDiveStageCardProps {
  draft: VaultDraft;
  activeLocationKey?: string;
  onSelectLocation?: (key: string) => void;
  onUpdateDraft?: (updated: Partial<VaultDraft>) => void;
  isEditable?: boolean;
}

type DimensionKey = 'spatial' | 'props' | 'lighting' | 'sensory' | 'dynamic';

interface DimensionMeta {
  key: DimensionKey;
  label: string;
  icon: typeof Maximize2;
  enTitle: string;
  accentColor: string;
}

const DIMENSIONS: DimensionMeta[] = [
  {
    key: 'spatial',
    label: 'ผังห้อง',
    icon: Maximize2,
    enTitle: 'SPATIAL GEOMETRY',
    accentColor: '#38BDF8', // Sky
  },
  {
    key: 'props',
    label: 'พร็อพ',
    icon: Package,
    enTitle: 'INTERACTIVE PROPS',
    accentColor: '#34D399', // Emerald
  },
  {
    key: 'lighting',
    label: 'แสงเงา',
    icon: Sun,
    enTitle: 'LIGHT & SHADOW',
    accentColor: '#FBBF24', // Amber
  },
  {
    key: 'sensory',
    label: 'ผัสสะ',
    icon: Flame,
    enTitle: '3D SENSORY FIELD',
    accentColor: '#FB7185', // Rose
  },
  {
    key: 'dynamic',
    label: 'ไดนามิก',
    icon: Zap,
    enTitle: 'SCENE CLOCK & SHIFT',
    accentColor: '#A78BFA', // Violet
  },
];

export default function WorldDeepDiveStageCard({
  draft,
  activeLocationKey,
  onSelectLocation,
  onUpdateDraft,
  isEditable = true,
}: WorldDeepDiveStageCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeDimension, setActiveDimension] = useState<DimensionKey>('spatial');
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

  // Dimension edit states
  const [spatialText, setSpatialText] = useState(
    () => currentLocation.spatial_layout || ''
  );
  const [anchorText, setAnchorText] = useState(
    () => currentLocation.anchor_points || currentLocation.choke_points || ''
  );
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
    setSpatialText(currentLocation.spatial_layout || '');
    setAnchorText(currentLocation.anchor_points || currentLocation.choke_points || '');
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
    const cleanedSpatial = spatialText.trim();
    const cleanedAnchors = anchorText.trim();
    const cleanedProps = propsText.trim();
    const cleanedLighting = lightingText.trim();
    const cleanedSensoryCues = sensoryText
      .split('\n')
      .map((s) => s.trim().replace(/^[•\-\*]\s*/, ''))
      .filter(Boolean);
    const cleanedDynamic = dynamicText.trim();

    const updatedLocation: WorldLocationItem = {
      ...currentLocation,
      spatial_layout: cleanedSpatial || currentLocation.spatial_layout,
      anchor_points: cleanedAnchors || currentLocation.anchor_points,
      interactive_props: cleanedProps || currentLocation.interactive_props,
      key_furniture: cleanedProps || currentLocation.key_furniture,
      lighting_shadow: cleanedLighting || currentLocation.lighting_shadow,
      sensory_cues: {
        ambient_cues:
          cleanedSensoryCues.length > 0
            ? cleanedSensoryCues
            : currentLocation.sensory_cues?.ambient_cues || [],
      },
      dynamic_shift: cleanedDynamic || currentLocation.dynamic_shift,
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

  // Anchor points list
  const anchorChips = anchorText
    ? anchorText
        .split(/[•,]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

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

  const currentDimMeta =
    DIMENSIONS.find((d) => d.key === activeDimension) || DIMENSIONS[0];

  const frostedCardClass =
    'bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all flex flex-col justify-between relative overflow-hidden';

  return (
    <div
      className={`col-span-2 row-span-2 rounded-[28px] p-4 sm:p-5 ${frostedCardClass}`}
      style={{ width: '346px', height: '346px' }}
    >
      {/* 1. Header Row: Left-Aligned Title + Edit Button */}
      <div className="flex items-center justify-between shrink-0 mb-2 px-0.5">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-[16px] sm:text-[17px] font-semibold text-[#F1F1F1] tracking-tight">
            เวทีสถานที่
          </span>
          <span className="text-[11px] font-normal text-white/40">
            (5 มิติ)
          </span>
        </div>

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
      <div className="shrink-0 mb-2 -mx-1 px-1 overflow-x-auto no-scrollbar flex items-center gap-1.5 py-0.5">
        {locationKeys.map((key) => {
          const isActive = key === currentLocKey;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleSelectKey(key)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap select-none shrink-0 ${
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
                  className="w-[105px] h-[24px] rounded-full bg-black/50 border border-white/20 px-2 text-[10.5px] text-[#EDEDED] outline-none placeholder-white/30"
                />
                <button
                  type="button"
                  onClick={handleAddScene}
                  className="w-[24px] h-[24px] rounded-full bg-[#EF264C] text-white flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Check size={10} strokeWidth={2.4} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingScene(true)}
                className="px-2 py-0.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] text-white/40 hover:text-white/80 text-[10.5px] flex items-center gap-1 shrink-0 transition-all cursor-pointer select-none"
                title="เพิ่มสถานที่ใหม่"
              >
                <Plus size={10} strokeWidth={2.2} />
                <span>เพิ่มฉาก</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* 3. The 5-Dimension Navigation Tabs Dock */}
      <div className="shrink-0 mb-2.5 grid grid-cols-5 gap-1 p-1 rounded-[16px] bg-black/30 border border-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        {DIMENSIONS.map((dim) => {
          const isActive = dim.key === activeDimension;
          const Icon = dim.icon;
          return (
            <button
              key={dim.key}
              type="button"
              onClick={() => setActiveDimension(dim.key)}
              className={`py-1.5 px-1 rounded-[11px] text-[11px] font-medium flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-white/14 text-[#F1F1F1] border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]'
                  : 'text-white/45 hover:text-white/85 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Icon
                size={12}
                strokeWidth={isActive ? 2.4 : 1.8}
                style={{ color: isActive ? dim.accentColor : undefined }}
              />
              <span className="leading-none text-[10.5px] truncate max-w-full">
                {dim.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Full-Bleed Dimension Chamber (Modeled after MindShadowCard) */}
      <div className="flex-1 p-3 rounded-[20px] bg-black/35 backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.35)] flex flex-col justify-between overflow-hidden">
        {!isEditing ? (
          /* ================================================================= */
          /* ✦ READING MODE: EXPANDED FULL-BLEED DIMENSION PROSE               */
          /* ================================================================= */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header of Active Dimension */}
            <div className="flex items-center justify-between shrink-0 mb-2">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: `${currentDimMeta.accentColor}20`,
                    border: `1px solid ${currentDimMeta.accentColor}40`,
                  }}
                >
                  <currentDimMeta.icon
                    size={11}
                    strokeWidth={2.4}
                    style={{ color: currentDimMeta.accentColor }}
                  />
                </div>
                <span
                  className="text-[12.5px] font-medium tracking-wide"
                  style={{ color: currentDimMeta.accentColor }}
                >
                  {activeDimension === 'spatial' && 'สถาปัตยกรรมและจุดปักหลัก'}
                  {activeDimension === 'props' && 'วัตถุและพร็อพที่หยิบจับได้'}
                  {activeDimension === 'lighting' && 'แสงเงาและทัศนวิสัย'}
                  {activeDimension === 'sensory' && 'ผัสสะรอบทิศ (กลิ่น • เสียง • สัมผัส)'}
                  {activeDimension === 'dynamic' && 'ไดนามิกของฉากและเงื่อนไขเวลา'}
                </span>
              </div>
              <span className="text-[9px] font-mono tracking-wider text-white/40 uppercase">
                {currentDimMeta.enTitle}
              </span>
            </div>

            {/* Dimension Body Content */}
            <div className="flex-1 overflow-y-auto pr-1.5 custom-scrollbar min-h-0 select-text">
              {/* 1. Spatial Layout */}
              {activeDimension === 'spatial' && (
                <div className="space-y-2">
                  <p className="text-[12.5px] text-[#EDEDED] font-normal leading-[20px] tracking-tight">
                    {spatialText || 'ยังไม่ได้ระบุสถาปัตยกรรมห้อง'}
                  </p>
                  {anchorChips.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      {anchorChips.map((chip, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] text-white/80 font-normal shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] leading-tight"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] shrink-0" />
                          <span>{chip}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 2. Interactive Props */}
              {activeDimension === 'props' && (
                <div className="space-y-1.5">
                  {propItems.length > 0 ? (
                    <ul className="space-y-1">
                      {propItems.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-[12.5px] text-[#EDEDED] font-normal leading-[19px] tracking-tight flex items-start gap-1.5"
                        >
                          <span className="text-[#34D399] shrink-0 text-[10px] mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[12.5px] text-white/40 italic">ยังไม่ได้ระบุพร็อพ</p>
                  )}
                </div>
              )}

              {/* 3. Lighting & Visibility */}
              {activeDimension === 'lighting' && (
                <p className="text-[12.5px] text-[#EDEDED] font-normal leading-[20px] tracking-tight">
                  {lightingText || 'ยังไม่ได้ระบุแสงสว่างและเงามืด'}
                </p>
              )}

              {/* 4. 3D Ambient Sensory */}
              {activeDimension === 'sensory' && (
                <div className="space-y-1.5">
                  {sensoryItems.length > 0 ? (
                    <ul className="space-y-1">
                      {sensoryItems.map((cue, idx) => (
                        <li
                          key={idx}
                          className="text-[12.5px] text-[#EDEDED] font-normal leading-[19px] tracking-tight flex items-start gap-1.5"
                        >
                          <span className="text-[#FB7185] shrink-0 text-[10px] mt-0.5">✦</span>
                          <span>{cue}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[12.5px] text-white/40 italic">ยังไม่ได้ระบุผัสสะรอบทิศ</p>
                  )}
                </div>
              )}

              {/* 5. Dynamic Shift */}
              {activeDimension === 'dynamic' && (
                <p className="text-[12.5px] text-[#EDEDED] font-normal leading-[20px] tracking-tight">
                  {dynamicText || 'ยังไม่ได้ระบุเงื่อนไขการเปลี่ยนฉาก'}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* ================================================================= */
          /* ✦ EDITING MODE: COMPACT IN-PLACE TEXTAREA                         */
          /* ================================================================= */
          <div className="flex-1 flex flex-col min-h-0">
            <span className="text-[10.5px] font-medium text-white/50 uppercase tracking-wider mb-1 block">
              แก้ไข: {currentDimMeta.label} ({currentDimMeta.enTitle})
            </span>

            {activeDimension === 'spatial' && (
              <div className="flex-1 flex flex-col gap-2 min-h-0">
                <textarea
                  value={spatialText}
                  onChange={(e) => setSpatialText(e.target.value)}
                  placeholder="สถาปัตยกรรมห้องและขอบเขต..."
                  className="flex-1 rounded-[12px] bg-black/40 border border-white/15 focus:border-[#38BDF8] p-2 text-[12px] text-[#EDEDED] outline-none resize-none leading-relaxed custom-scrollbar"
                />
                <input
                  type="text"
                  value={anchorText}
                  onChange={(e) => setAnchorText(e.target.value)}
                  placeholder="จุดปักหลัก (คั่นด้วย • หรือจุลภาค)"
                  className="h-[30px] rounded-[10px] bg-black/40 border border-white/15 focus:border-[#38BDF8] px-2 text-[11.5px] text-[#EDEDED] outline-none"
                />
              </div>
            )}

            {activeDimension === 'props' && (
              <textarea
                value={propsText}
                onChange={(e) => setPropsText(e.target.value)}
                placeholder="รายการวัตถุและพร็อพ (คั่นด้วย • หรือจุลภาค)..."
                className="flex-1 rounded-[12px] bg-black/40 border border-white/15 focus:border-[#34D399] p-2 text-[12px] text-[#EDEDED] outline-none resize-none leading-relaxed custom-scrollbar"
              />
            )}

            {activeDimension === 'lighting' && (
              <textarea
                value={lightingText}
                onChange={(e) => setLightingText(e.target.value)}
                placeholder="แสงเงาและทัศนวิสัย..."
                className="flex-1 rounded-[12px] bg-black/40 border border-white/15 focus:border-[#FBBF24] p-2 text-[12px] text-[#EDEDED] outline-none resize-none leading-relaxed custom-scrollbar"
              />
            )}

            {activeDimension === 'sensory' && (
              <textarea
                value={sensoryText}
                onChange={(e) => setSensoryText(e.target.value)}
                placeholder="กลิ่น, เสียง, ผิวสัมผัส (บรรทัดละ 1 ข้อ)..."
                className="flex-1 rounded-[12px] bg-black/40 border border-white/15 focus:border-[#FB7185] p-2 text-[12px] text-[#EDEDED] outline-none resize-none leading-relaxed custom-scrollbar"
              />
            )}

            {activeDimension === 'dynamic' && (
              <textarea
                value={dynamicText}
                onChange={(e) => setDynamicText(e.target.value)}
                placeholder="ไดนามิกและการเปลี่ยนฉาก..."
                className="flex-1 rounded-[12px] bg-black/40 border border-white/15 focus:border-[#A78BFA] p-2 text-[12px] text-[#EDEDED] outline-none resize-none leading-relaxed custom-scrollbar"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
