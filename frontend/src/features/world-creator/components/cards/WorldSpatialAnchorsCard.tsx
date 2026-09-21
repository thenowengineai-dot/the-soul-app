import { useState, useEffect } from 'react';
import { Pencil, Check } from 'lucide-react';
import type { VaultDraft, WorldLocationItem } from '../../types';
import { DEFAULT_BOTANICAL_LOCATIONS } from '../../defaultWorldLocations';

interface WorldSpatialAnchorsCardProps {
  draft: VaultDraft;
  activeLocationKey?: string;
  onUpdateDraft?: (updated: Partial<VaultDraft>) => void;
  isEditable?: boolean;
}

export default function WorldSpatialAnchorsCard({
  draft,
  activeLocationKey,
  onUpdateDraft,
  isEditable = true,
}: WorldSpatialAnchorsCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Determine current active location
  const locMap =
    draft.real_locations && Object.keys(draft.real_locations).length > 0
      ? draft.real_locations
      : DEFAULT_BOTANICAL_LOCATIONS;

  const currentLocKey =
    activeLocationKey && locMap[activeLocationKey]
      ? activeLocationKey
      : Object.keys(locMap)[0] || 'ห้องสกัดสมุนไพร ณ เรือนพักปีกใน';

  const currentLocation: WorldLocationItem =
    locMap[currentLocKey] || DEFAULT_BOTANICAL_LOCATIONS['ห้องสกัดสมุนไพร ณ เรือนพักปีกใน'];

  const [spatialLayout, setSpatialLayout] = useState(
    () => currentLocation.spatial_layout || ''
  );
  const [anchorPoints, setAnchorPoints] = useState(
    () => currentLocation.anchor_points || currentLocation.choke_points || ''
  );

  // Sync when location or draft changes
  useEffect(() => {
    setSpatialLayout(currentLocation.spatial_layout || '');
    setAnchorPoints(
      currentLocation.anchor_points || currentLocation.choke_points || ''
    );
  }, [currentLocation]);

  const handleSave = () => {
    setIsEditing(false);
    const cleanedSpatial =
      spatialLayout.trim() || currentLocation.spatial_layout || '';
    const cleanedAnchors =
      anchorPoints.trim() || currentLocation.anchor_points || currentLocation.choke_points || '';

    setSpatialLayout(cleanedSpatial);
    setAnchorPoints(cleanedAnchors);

    if (onUpdateDraft) {
      const updatedMap = {
        ...locMap,
        [currentLocKey]: {
          ...currentLocation,
          spatial_layout: cleanedSpatial,
          anchor_points: cleanedAnchors,
        },
      };
      onUpdateDraft({
        real_locations: updatedMap,
      });
    }
  };

  // Split anchor points if separated by • or comma for tactile pills display
  const anchorChips = anchorPoints
    ? anchorPoints
        .split(/[•,]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const frostedCardClass =
    'bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all flex flex-col justify-between relative overflow-hidden';

  return (
    <div
      className={`col-span-2 row-span-1 rounded-[28px] p-4 ${frostedCardClass}`}
      style={{ width: '346px', height: '165px' }}
    >
      {/* 1. Header Row: Pure Left-Aligned Title + Circular Edit Button */}
      <div className="flex items-center justify-between shrink-0 mb-1.5 px-0.5">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-[16px] sm:text-[17px] font-semibold text-[#F1F1F1] tracking-tight shrink-0">
            ผังฉากและจุดปักหลัก
          </span>
          <span className="text-[11px] text-white/40 truncate max-w-[140px] font-normal">
            ({currentLocKey})
          </span>
        </div>

        {isEditable && (
          <div className="shrink-0">
            {isEditing ? (
              <button
                type="button"
                onClick={handleSave}
                className="w-7 h-7 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(239,38,76,0.4)] transition-all cursor-pointer active:scale-95"
                title="บันทึกผังฉาก"
              >
                <Check size={13} strokeWidth={2.4} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] active:scale-95"
                title="แก้ไขผังฉาก"
              >
                <Pencil size={12} strokeWidth={2} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Body Stage: Display vs Edit Mode */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {!isEditing ? (
          <div className="flex-1 overflow-y-auto pr-1.5 custom-scrollbar min-h-0 space-y-2 select-text">
            {/* Spatial Layout Prose */}
            <p className="text-[12.5px] text-[#EDEDED] font-normal leading-[19px] tracking-tight text-left">
              {spatialLayout}
            </p>

            {/* Tactile Anchor Spots Pills */}
            {anchorChips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {anchorChips.map((chip, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] text-white/80 font-normal shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] leading-tight"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C]/70 shrink-0" />
                    <span>{chip}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0 flex flex-col gap-2 pt-0.5">
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">
                สถาปัตยกรรมและขอบเขตห้อง (Spatial Layout)
              </label>
              <textarea
                value={spatialLayout}
                onChange={(e) => setSpatialLayout(e.target.value)}
                placeholder="เช่น ห้องไม้ 6 เสื่อทาทามิที่ปิดทึบ บานเลื่อน..."
                className="w-full h-[46px] rounded-[12px] bg-black/40 border border-white/10 focus:border-white/25 px-2.5 py-1 text-[12px] text-[#EDEDED] outline-none resize-none leading-relaxed custom-scrollbar placeholder-white/30"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">
                จุดปักหลักและระยะประชิด (คั่นด้วย • หรือจุลภาค)
              </label>
              <input
                type="text"
                value={anchorPoints}
                onChange={(e) => setAnchorPoints(e.target.value)}
                placeholder="เบาะรองนั่งริมโต๊ะ • ฟูกริมฉากกั้น • บานเลื่อน"
                className="w-full h-[32px] rounded-[10px] bg-black/40 border border-white/10 focus:border-white/25 px-2.5 text-[12px] text-[#EDEDED] outline-none placeholder-white/30"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
