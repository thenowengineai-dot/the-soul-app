import React, { useState, useEffect } from 'react';
import { Pencil, Check, Plus, X } from 'lucide-react';
import type { VaultDraft, PassivePerk } from '../../types';

interface DynamicsCharismaCardProps {
  draft: VaultDraft;
  onUpdateDraft?: (updated: Partial<VaultDraft>) => void;
  isEditable?: boolean;
}

// 7 Primary Axis Definitions for Heptagon Radar
interface PrimaryStatDef {
  key: string;
  labelTh: string;
  labelEn: string;
  angleDeg: number;
  anchor: 'start' | 'middle' | 'end';
  dx?: number;
  dy?: number;
}

const PRIMARY_STATS_CONFIG: PrimaryStatDef[] = [
  { key: 'initiative', labelTh: 'การริเริ่ม', labelEn: 'Initiative', angleDeg: -90, anchor: 'middle', dy: -5 },
  { key: 'dominance', labelTh: 'การคุมเกม', labelEn: 'Dominance', angleDeg: -38.57, anchor: 'start', dx: 5, dy: -2 },
  { key: 'physicality', labelTh: 'เข้าหาทางกาย', labelEn: 'Physicality', angleDeg: 12.86, anchor: 'start', dx: 6, dy: 4 },
  { key: 'playfulness', labelTh: 'ความขี้เล่น', labelEn: 'Playfulness', angleDeg: 64.29, anchor: 'start', dx: 4, dy: 8 },
  { key: 'formality', labelTh: 'ความเป็นทางการ', labelEn: 'Formality', angleDeg: 115.71, anchor: 'end', dx: -4, dy: 8 },
  { key: 'expressiveness', labelTh: 'การแสดงออก', labelEn: 'Expressiveness', angleDeg: 167.14, anchor: 'end', dx: -6, dy: 4 },
  { key: 'honesty', labelTh: 'ความซื่อตรง', labelEn: 'Honesty', angleDeg: 218.57, anchor: 'end', dx: -5, dy: -2 },
];

// 5 Secondary Linear Gauges Config
interface SecondaryStatDef {
  key: string;
  labelTh: string;
  labelEn: string;
  descTh: string;
  gradient: string;
  barColor: string;
}

const SECONDARY_STATS_CONFIG: SecondaryStatDef[] = [
  {
    key: 'sensibility',
    labelTh: 'ความไวต่อสัมผัส',
    labelEn: 'Sensibility',
    descTh: 'ตอบสนองต่ออุณหภูมิและสัมผัส',
    gradient: 'from-[#EF264C] to-[#FF6B8B]',
    barColor: '#EF264C',
  },
  {
    key: 'perception',
    labelTh: 'การอ่านคน',
    labelEn: 'Perception',
    descTh: 'จับโกหกและอ่านภาษากาย',
    gradient: 'from-[#8B5CF6] to-[#C084FC]',
    barColor: '#8B5CF6',
  },
  {
    key: 'patience',
    labelTh: 'ความอดทน',
    labelEn: 'Patience',
    descTh: 'รอจังหวะวางกับดักอย่างใจเย็น',
    gradient: 'from-[#06B6D4] to-[#38BDF8]',
    barColor: '#06B6D4',
  },
  {
    key: 'mask_integrity',
    labelTh: 'ความหนาหน้ากาก',
    labelEn: 'Mask Integrity',
    descTh: 'ความแนบเนียนในการเสแสร้ง',
    gradient: 'from-[#F59E0B] to-[#FCD34D]',
    barColor: '#F59E0B',
  },
  {
    key: 'emotional_stability',
    labelTh: 'ความมั่นคงทางอารมณ์',
    labelEn: 'Emotional Stability',
    descTh: 'สติเปราะบางยามสัมผัสความร้อน',
    gradient: 'from-[#F43F5E] to-[#FDA4AF]',
    barColor: '#F43F5E',
  },
];

const DEFAULT_PRIMARY_STATS: Record<string, number> = {
  initiative: 8,
  dominance: 9,
  physicality: 8,
  playfulness: 7,
  formality: 9,
  expressiveness: 4,
  honesty: 2,
};

const DEFAULT_SECONDARY_STATS: Record<string, number> = {
  sensibility: 10,
  perception: 9,
  patience: 8,
  mask_integrity: 8,
  emotional_stability: 4,
};

const DEFAULT_PASSIVE_PERKS: PassivePerk[] = [
  {
    perk_name: 'Thermal Shock (จุดระเบิดสติหลุด)',
    trigger: 'ร่างกายสัมผัสความร้อนจากภายนอก เช่น ออนเซ็น, ไข้, หรือน้ำมันสมุนไพรอุ่น',
    effect: 'ลดค่า Mask Integrity ลงเหลือ 1 ทันที ร่างกายท่อนล่างสูญเสียการพยุงตัวจนต้องเกาะยึดตัวเป้าหมาย และเพิ่มความต้องการทางเพศถึงขีดสุด',
  },
  {
    perk_name: 'ตรรกะรีดพิษพฤกษศาสตร์',
    trigger: 'เมื่อเป้าหมายมีท่าทีสับสนหรือขัดขืนในพื้นที่อับสายตา',
    effect: 'ใช้ทฤษฎีสมุนไพรมาบิดเบือนสร้างเหตุผลความจำเป็นในการ \'รีดพิษ\' ทำให้การขัดขืนของเป้าหมายลดลงอย่างราบคาบ',
  },
  {
    perk_name: 'สวิตช์ขาแว่นเย็นเยือก',
    trigger: 'สัมผัสความเย็นเฉียบของโลหะที่ใบหน้าหรือสวมแว่นตากลับคืน',
    effect: 'เรียกคืนค่าสติและฟื้นฟู Mask Integrity กลับมา 50% ชั่วคราว แม้ว่าร่างกายท่อนล่างยังคงเปียกเยิ้มและสั่นสะท้านอยู่ก็ตาม',
  },
];

export default function DynamicsCharismaCard({
  draft,
  onUpdateDraft,
  isEditable = true,
}: DynamicsCharismaCardProps) {
  // State for Card 3.1: Primary Stats
  const [isEditingRadar, setIsEditingRadar] = useState(false);
  const [primaryStats, setPrimaryStats] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    PRIMARY_STATS_CONFIG.forEach((stat) => {
      initial[stat.key] = draft.core_stats?.[stat.key] ?? DEFAULT_PRIMARY_STATS[stat.key] ?? 5;
    });
    return initial;
  });

  // State for Card 3.2: Secondary Stats & Perks
  const [isEditingSecondary, setIsEditingSecondary] = useState(false);
  const [secondaryStats, setSecondaryStats] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    SECONDARY_STATS_CONFIG.forEach((stat) => {
      initial[stat.key] = draft.core_stats?.[stat.key] ?? DEFAULT_SECONDARY_STATS[stat.key] ?? 5;
    });
    return initial;
  });

  const [perks, setPerks] = useState<PassivePerk[]>(() => {
    return draft.passive_perks && draft.passive_perks.length > 0
      ? draft.passive_perks
      : DEFAULT_PASSIVE_PERKS;
  });

  // Selected perk for viewing detail (Tap to view complete trigger/effect)
  const [activePerkIndex, setActivePerkIndex] = useState<number | null>(null);

  // New Perk Form Modal / Drawer state
  const [isAddingPerk, setIsAddingPerk] = useState(false);
  const [newPerkName, setNewPerkName] = useState('');
  const [newPerkTrigger, setNewPerkTrigger] = useState('');
  const [newPerkEffect, setNewPerkEffect] = useState('');

  // Sync draft updates if changed externally
  useEffect(() => {
    if (draft.core_stats) {
      setPrimaryStats((prev) => {
        const next = { ...prev };
        PRIMARY_STATS_CONFIG.forEach((stat) => {
          if (draft.core_stats?.[stat.key] !== undefined) {
            next[stat.key] = draft.core_stats[stat.key];
          }
        });
        return next;
      });

      setSecondaryStats((prev) => {
        const next = { ...prev };
        SECONDARY_STATS_CONFIG.forEach((stat) => {
          if (draft.core_stats?.[stat.key] !== undefined) {
            next[stat.key] = draft.core_stats[stat.key];
          }
        });
        return next;
      });
    }

    if (draft.passive_perks && draft.passive_perks.length > 0) {
      setPerks(draft.passive_perks);
    }
  }, [draft.core_stats, draft.passive_perks]);

  // Save Card 3.1 Primary changes
  const handleSaveRadar = () => {
    setIsEditingRadar(false);
    if (onUpdateDraft) {
      onUpdateDraft({
        core_stats: {
          ...(draft.core_stats || {}),
          ...primaryStats,
          ...secondaryStats,
        },
      });
    }
  };

  // Save Card 3.2 Secondary changes
  const handleSaveSecondary = () => {
    setIsEditingSecondary(false);
    if (onUpdateDraft) {
      onUpdateDraft({
        core_stats: {
          ...(draft.core_stats || {}),
          ...primaryStats,
          ...secondaryStats,
        },
        passive_perks: perks,
      });
    }
  };

  // Stepper helper for primary stats
  const handleStepPrimary = (key: string, delta: number) => {
    setPrimaryStats((prev) => {
      const current = prev[key] ?? 5;
      const next = Math.max(1, Math.min(10, current + delta));
      return { ...prev, [key]: next };
    });
  };

  // Stepper helper for secondary stats
  const handleStepSecondary = (key: string, delta: number) => {
    setSecondaryStats((prev) => {
      const current = prev[key] ?? 5;
      const next = Math.max(1, Math.min(10, current + delta));
      return { ...prev, [key]: next };
    });
  };

  // Delete perk
  const handleDeletePerk = (index: number) => {
    const updated = perks.filter((_, i) => i !== index);
    setPerks(updated);
    if (activePerkIndex === index) {
      setActivePerkIndex(null);
    }
  };

  // Add new perk
  const handleAddPerk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPerkName.trim()) return;
    const newPerk: PassivePerk = {
      perk_name: newPerkName.trim(),
      trigger: newPerkTrigger.trim() || 'เมื่ออยู่ในสถานการณ์เฉพาะ',
      effect: newPerkEffect.trim() || 'ส่งผลต่ออารมณ์และสเตตัส',
    };
    const updated = [...perks, newPerk];
    setPerks(updated);
    setNewPerkName('');
    setNewPerkTrigger('');
    setNewPerkEffect('');
    setIsAddingPerk(false);
  };

  // Common Bento Card Glass Recipe
  const frostedCardClass =
    'bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all flex flex-col justify-between relative overflow-hidden';

  // =========================================================================
  // ✦ RADAR WEB GEOMETRY ENGINE (HEPTAGON 7-AXIS)
  // =========================================================================
  const svgWidth = 314;
  const svgHeight = 236;
  const cx = 157;
  const cy = 118;
  const rMax = 74;
  const labelDist = 94;

  // Degrees to Radians helper
  const degToRad = (deg: number) => (deg * Math.PI) / 180;

  // Concentric heptagon web grid rings (5 rings: 0.2, 0.4, 0.6, 0.8, 1.0)
  const gridRings = [0.2, 0.4, 0.6, 0.8, 1.0].map((level) => {
    const points = PRIMARY_STATS_CONFIG.map((stat) => {
      const rad = degToRad(stat.angleDeg);
      const r = rMax * level;
      const x = cx + r * Math.cos(rad);
      const y = cy + r * Math.sin(rad);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    return { level, points };
  });

  // Spoke lines from center to outer ring
  const spokeLines = PRIMARY_STATS_CONFIG.map((stat) => {
    const rad = degToRad(stat.angleDeg);
    const x = cx + rMax * Math.cos(rad);
    const y = cy + rMax * Math.sin(rad);
    return { x1: cx, y1: cy, x2: x, y2: y };
  });

  // Character Data Polygon
  const characterPolygonPoints = PRIMARY_STATS_CONFIG.map((stat) => {
    const val = primaryStats[stat.key] ?? 5;
    const rad = degToRad(stat.angleDeg);
    const r = (val / 10) * rMax;
    const x = cx + r * Math.cos(rad);
    const y = cy + r * Math.sin(rad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  // Character Vertex Nodes
  const vertexNodes = PRIMARY_STATS_CONFIG.map((stat) => {
    const val = primaryStats[stat.key] ?? 5;
    const rad = degToRad(stat.angleDeg);
    const r = (val / 10) * rMax;
    const x = cx + r * Math.cos(rad);
    const y = cy + r * Math.sin(rad);
    return { key: stat.key, x, y, val };
  });

  // Outer Labels
  const axisLabels = PRIMARY_STATS_CONFIG.map((stat) => {
    const val = primaryStats[stat.key] ?? 5;
    const rad = degToRad(stat.angleDeg);
    const x = cx + labelDist * Math.cos(rad) + (stat.dx || 0);
    const y = cy + labelDist * Math.sin(rad) + (stat.dy || 0);
    return {
      ...stat,
      x,
      y,
      val,
    };
  });

  return (
    <>
        {/* ======================================================================= */}
        {/* ✦ CARD 3.1: THE 7-AXIS DYNAMICS RADAR (2x2 — 346px × 346px)            */}
        {/* ======================================================================= */}
        <div
          className={`col-span-2 row-span-2 rounded-[28px] p-4 ${frostedCardClass}`}
          style={{ width: '346px', height: '346px' }}
        >
          {/* Header Row: Pure Title (NO icon in front) + Edit / Save Pill */}
          <div className="flex items-center justify-between shrink-0 mb-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[16.5px] sm:text-[17.5px] font-semibold text-[#F1F1F1] tracking-tight">
                พลวัต 7 แกนหลัก
              </span>
              <span className="text-[11px] font-normal text-white/40">
                (7 มิติ)
              </span>
            </div>

            {isEditable && (
              <div>
                {isEditingRadar ? (
                  <button
                    type="button"
                    onClick={handleSaveRadar}
                    className="w-7 h-7 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(239,38,76,0.4)] transition-all cursor-pointer active:scale-95"
                    title="บันทึกค่าสเตตัสหลัก"
                  >
                    <Check size={13} strokeWidth={2.4} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingRadar(true)}
                    className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] active:scale-95"
                    title="ปรับแต่งสเตตัส 7 แกน"
                  >
                    <Pencil size={12} strokeWidth={2} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Body: Either Interactive Heptagon Radar OR Stepper Editor */}
          {!isEditingRadar ? (
            <div className="flex-1 flex flex-col justify-between items-center relative select-none">
              {/* SVG Radar Engine */}
              <div className="w-full flex items-center justify-center">
                <svg
                  width={svgWidth}
                  height={svgHeight}
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="overflow-visible"
                >
                  <defs>
                    <radialGradient id="heptaGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#EF264C" stopOpacity="0.45" />
                      <stop offset="70%" stopColor="#EF264C" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#EF264C" stopOpacity="0.08" />
                    </radialGradient>
                  </defs>

                  {/* 1. Heptagon Concentric Web Grid */}
                  {gridRings.map((ring) => (
                    <polygon
                      key={ring.level}
                      points={ring.points}
                      fill="none"
                      stroke={
                        ring.level === 1.0
                          ? 'rgba(255, 255, 255, 0.14)'
                          : 'rgba(255, 255, 255, 0.05)'
                      }
                      strokeWidth={ring.level === 1.0 ? 1 : 0.75}
                      strokeDasharray={ring.level < 1.0 ? '2 2' : undefined}
                    />
                  ))}

                  {/* 2. Spoke Lines from Center */}
                  {spokeLines.map((spoke, idx) => (
                    <line
                      key={idx}
                      x1={spoke.x1}
                      y1={spoke.y1}
                      x2={spoke.x2}
                      y2={spoke.y2}
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="1"
                    />
                  ))}

                  {/* 3. Character's Skewed Heptagon Polygon (Predator Silhouette) */}
                  <polygon
                    points={characterPolygonPoints}
                    fill="url(#heptaGlow)"
                    stroke="#EF264C"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />

                  {/* 4. Vertex Points */}
                  {vertexNodes.map((v) => (
                    <g key={v.key} className="transition-all duration-300">
                      <circle
                        cx={v.x}
                        cy={v.y}
                        r="3.5"
                        fill="#EF264C"
                        className="shadow-[0_0_8px_#EF264C]"
                      />
                      <circle cx={v.x} cy={v.y} r="1.5" fill="#FFFFFF" />
                    </g>
                  ))}

                  {/* 5. Axis Labels & Values */}
                  {axisLabels.map((lbl) => (
                    <g key={lbl.key} className="select-none">
                      <text
                        x={lbl.x}
                        y={lbl.y}
                        textAnchor={lbl.anchor}
                        fill="#F1F1F1"
                        className="text-[10px] font-medium tracking-tight"
                      >
                        {lbl.labelTh}{' '}
                        <tspan fill="#EF264C" className="font-bold">
                          {lbl.val}
                        </tspan>
                      </text>
                      <text
                        x={lbl.x}
                        y={lbl.y + 10}
                        textAnchor={lbl.anchor}
                        fill="rgba(255, 255, 255, 0.38)"
                        className="text-[8px] font-normal tracking-wide"
                      >
                        {lbl.labelEn}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              {/* Bottom Quick Persona Capsule */}
              <div className="w-full flex items-center justify-center">
                <div className="w-full px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] flex items-center justify-between text-[10.5px] text-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <span className="text-white/40">บุคลิกภาพเด่น:</span>
                  <span className="text-[#F1F1F1] font-medium truncate ml-1">
                    คุมเกม {primaryStats.dominance} • ทางการ {primaryStats.formality} • ริเริ่ม {primaryStats.initiative}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Mode: Stepper List for 7 Primary Stats */
            <div className="flex-1 flex flex-col justify-between py-0.5 overflow-hidden">
              <div className="text-[11px] text-white/40 mb-1 px-1 flex items-center justify-between">
                <span>ปรับระดับคะแนน (1 - 10):</span>
                <span className="text-[#EF264C]">โหมดแก้ไข</span>
              </div>

              <div className="space-y-1.5 overflow-y-auto pr-1 max-h-[240px] custom-scrollbar">
                {PRIMARY_STATS_CONFIG.map((stat) => {
                  const val = primaryStats[stat.key] ?? 5;
                  return (
                    <div
                      key={stat.key}
                      className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                    >
                      <div className="flex flex-col">
                        <span className="text-[11.5px] text-[#F1F1F1] font-medium leading-tight">
                          {stat.labelTh}
                        </span>
                        <span className="text-[9px] text-white/40">
                          {stat.labelEn}
                        </span>
                      </div>

                      {/* Stepper Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStepPrimary(stat.key, -1)}
                          disabled={val <= 1}
                          className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white text-[11px] transition-all active:scale-95 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-[12.5px] font-bold text-[#EF264C] w-4 text-center">
                          {val}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStepPrimary(stat.key, 1)}
                          disabled={val >= 10}
                          className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white text-[11px] transition-all active:scale-95 cursor-pointer"
                        >
                          +
                        </button>
                        <span className="text-[9.5px] text-white/40">/10</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ======================================================================= */}
        {/* ✦ CARD 3.2: SECONDARY STATS & SIGNATURE PERKS (2x2 — 346px × 346px)      */}
        {/* ======================================================================= */}
        <div
          className={`col-span-2 row-span-2 rounded-[28px] p-4 ${frostedCardClass}`}
          style={{ width: '346px', height: '346px' }}
        >
          {/* Header Row: Pure Title (NO icon in front) + Edit / Save Pill */}
          <div className="flex items-center justify-between shrink-0 mb-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[16.5px] sm:text-[17.5px] font-semibold text-[#F1F1F1] tracking-tight">
                สเตตัสรอง & เสน่ห์เฉพาะตัว
              </span>
              <span className="text-[11px] font-normal text-white/40">
                (5 ค่า + {perks.length} เสน่ห์)
              </span>
            </div>

            {isEditable && (
              <div>
                {isEditingSecondary ? (
                  <button
                    type="button"
                    onClick={handleSaveSecondary}
                    className="w-7 h-7 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(239,38,76,0.4)] transition-all cursor-pointer active:scale-95"
                    title="บันทึกสเตตัสรองและเสน่ห์"
                  >
                    <Check size={13} strokeWidth={2.4} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingSecondary(true);
                      setActivePerkIndex(null);
                    }}
                    className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] active:scale-95"
                    title="แก้ไขสเตตัสรองและเสน่ห์"
                  >
                    <Pencil size={12} strokeWidth={2} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* 1. Upper Tray: 5 Secondary Linear Gauges */}
            <div className="space-y-1.5">
              {SECONDARY_STATS_CONFIG.map((stat) => {
                const val = secondaryStats[stat.key] ?? 5;
                const percent = Math.min(100, Math.max(10, (val / 10) * 100));

                return (
                  <div key={stat.key} className="group">
                    <div className="flex justify-between items-baseline mb-0.5 px-0.5">
                      <div className="flex items-baseline gap-1.5 truncate">
                        <span className="text-[11.5px] font-medium text-[#F1F1F1] leading-none">
                          {stat.labelTh}
                        </span>
                        <span className="text-[9px] text-white/35 font-normal truncate hidden sm:inline">
                          {stat.descTh}
                        </span>
                      </div>

                      {/* Value / Stepper in edit mode */}
                      {!isEditingSecondary ? (
                        <div className="text-[10.5px] font-bold text-white/80 shrink-0">
                          {val}
                          <span className="text-[8.5px] text-white/40 font-normal">/10</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStepSecondary(stat.key, -1)}
                            disabled={val <= 1}
                            className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 flex items-center justify-center text-white text-[10px] transition-all cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-[11px] font-bold text-[#EF264C] w-3 text-center">
                            {val}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStepSecondary(stat.key, 1)}
                            disabled={val >= 10}
                            className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 flex items-center justify-center text-white text-[10px] transition-all cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Precision Gauge Track */}
                    <div className="w-full h-[4.5px] rounded-full bg-white/[0.08] overflow-hidden p-[0.5px]">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${stat.gradient} transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hairline Separator */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent my-1.5" />

            {/* 2. Lower Tray: Signature Perks (Apple Dark Pill Chips) */}
            <div className="flex-1 flex flex-col justify-end min-h-[90px]">
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <span className="text-[10.5px] font-medium text-white/50 tracking-wider uppercase">
                  เสน่ห์เฉพาะตัว (Perks)
                </span>
                {isEditingSecondary && (
                  <button
                    type="button"
                    onClick={() => setIsAddingPerk(true)}
                    className="text-[10.5px] text-[#EF264C] hover:text-[#ff4d6d] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus size={11} strokeWidth={2.5} />
                    เพิ่มเสน่ห์
                  </button>
                )}
              </div>

              {/* Perks Pill Container OR Active Perk Card */}
              {activePerkIndex === null ? (
                <div className="flex flex-wrap gap-1.5 max-h-[78px] overflow-y-auto pr-0.5 custom-scrollbar items-start">
                  {perks.map((perk, index) => (
                    <div
                      key={index}
                      onClick={() => !isEditingSecondary && setActivePerkIndex(index)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-normal flex items-center gap-1.5 transition-all select-none ${
                        isEditingSecondary
                          ? 'bg-white/[0.07] border border-white/12 text-white/90'
                          : 'bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.08] hover:border-white/20 text-white/85 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] active:scale-95'
                      }`}
                      title={!isEditingSecondary ? 'แตะเพื่อดูเงื่อนไขและผลลัพธ์' : undefined}
                    >
                      <span className="text-[#EF264C] text-[10px]">✦</span>
                      <span className="truncate max-w-[190px]">{perk.perk_name}</span>
                      {isEditingSecondary && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePerk(index);
                          }}
                          className="w-3.5 h-3.5 rounded-full hover:bg-red-500/20 text-white/40 hover:text-red-400 flex items-center justify-center transition-colors ml-0.5 cursor-pointer"
                        >
                          <X size={9} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Tap-to-Expand Perk Detail Drawer */
                <div className="p-2 rounded-2xl bg-white/[0.05] border border-white/[0.10] flex flex-col justify-between animate-fadeIn">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-[#EF264C] text-[10px]">✦</span>
                      <span className="text-[11.5px] font-semibold text-[#F1F1F1] truncate">
                        {perks[activePerkIndex]?.perk_name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivePerkIndex(null)}
                      className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                      title="ย้อนกลับ"
                    >
                      <X size={10} strokeWidth={2} />
                    </button>
                  </div>

                  <div className="space-y-1 text-[10px] leading-relaxed">
                    <p className="text-white/70 line-clamp-2">
                      <span className="text-white/40 font-medium mr-1">เงื่อนไข:</span>
                      {perks[activePerkIndex]?.trigger}
                    </p>
                    <p className="text-white/70 line-clamp-2">
                      <span className="text-[#EF264C]/90 font-medium mr-1">ผลลัพธ์:</span>
                      {perks[activePerkIndex]?.effect}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* ========================================================================= */}
      {/* ✦ ADD NEW PERK MODAL DIALOG                                              */}
      {/* ========================================================================= */}
      {isAddingPerk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-[360px] rounded-[24px] bg-[#18181A] border border-white/14 p-5 shadow-2xl space-y-3 animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#EF264C] text-[13px]">✦</span>
                <h3 className="text-[15px] font-semibold text-[#F1F1F1]">เพิ่มเสน่ห์เฉพาะตัว</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingPerk(false)}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white/70 flex items-center justify-center cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>

            <form onSubmit={handleAddPerk} className="space-y-2.5">
              <div>
                <label className="text-[11px] text-white/60 font-medium block mb-1">
                  ชื่อเสน่ห์ / สกิล
                </label>
                <input
                  type="text"
                  value={newPerkName}
                  onChange={(e) => setNewPerkName(e.target.value)}
                  placeholder="เช่น สวิตช์ขาแว่นเย็นเยือก"
                  required
                  className="w-full h-8 px-3 rounded-full bg-white/[0.06] border border-white/10 text-[12px] text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-[11px] text-white/60 font-medium block mb-1">
                  เงื่อนไขการทำงาน (Trigger)
                </label>
                <input
                  type="text"
                  value={newPerkTrigger}
                  onChange={(e) => setNewPerkTrigger(e.target.value)}
                  placeholder="เช่น สัมผัสความเย็นเฉียบของโลหะ..."
                  className="w-full h-8 px-3 rounded-full bg-white/[0.06] border border-white/10 text-[12px] text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-[11px] text-white/60 font-medium block mb-1">
                  ผลลัพธ์ (Effect)
                </label>
                <textarea
                  value={newPerkEffect}
                  onChange={(e) => setNewPerkEffect(e.target.value)}
                  placeholder="เช่น เรียกคืนค่าสติและฟื้นฟู Mask Integrity..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-[12px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingPerk(false)}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-[12px] text-white/70 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-[12px] text-white font-medium cursor-pointer shadow-[0_2px_8px_rgba(239,38,76,0.3)]"
                >
                  เพิ่มเสน่ห์
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
