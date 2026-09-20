import { useState, useEffect } from 'react';
import {
  Pencil,
  Check,
  Eye,
  Scissors,
  Shirt,
  Activity,
  User,
  Plus,
  X,
} from 'lucide-react';
import type { VaultDraft } from '../../types';

interface IdentityVisualCardProps {
  draft: VaultDraft;
  onUpdateDraft?: (updated: Partial<VaultDraft>) => void;
  isEditable?: boolean;
}

export interface IdentityVisualState {
  name: string;
  alias: string;
  age: string;
  genderBuild: string;
  eyeColor: string;
  eyeHex?: string;
  hairStyle: string;
  facialTraits: string[];
  outfitName: string;
  outfitPalette: string[];
  outfitFabrics: string[];
  outfitDescription: string;
  vibe: string;
  defaultPose: string;
  microGesture: string;
}

export default function IdentityVisualCard({
  draft,
  onUpdateDraft,
  isEditable = true,
}: IdentityVisualCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Parse or initialize state from draft
  const [data, setData] = useState<IdentityVisualState>(() => {
    const anatomy = draft.appearance?.anatomy_features || [];
    const postures = draft.appearance?.signature_postures || [];
    const outfit1 = draft.appearance?.wardrobe?.outfit_1 || [];

    return {
      name: draft.title || 'ตัวละครใหม่',
      alias: draft.archetype || draft.description || 'นักสืบสาวผู้เยือกเย็น',
      age: '24 ปี',
      genderBuild: 'หญิง • 168 ซม. • รูปร่างเพรียวสง่า สมส่วน',
      eyeColor: 'สีอำพันประกายทอง (Amber Gaze)',
      eyeHex: '#D4A373',
      hairStyle: 'ผมบ็อบซอยสั้นระดับคาง • สีดำขลับประกายเงิน',
      facialTraits: anatomy.length > 0 ? anatomy : [
        'แววตาสุขุม คมกริบ เยือกเย็น',
        'โครงหน้าเรียวชัด สันกรามคม',
        'ไฝเสน่ห์เม็ดเล็กใต้หางตาซ้าย',
      ],
      outfitName: outfit1[0] || 'Techwear Tailored Trench Coat สีดำด้าน',
      outfitPalette: ['#0C0C0E', '#1D1D24', '#3E4251', '#EF264C'],
      outfitFabrics: [
        'ผ้ากันน้ำสะท้อนแสงเนื้อแมตต์ (Matte Shell)',
        'ฮาร์ดแวร์โลหะอัลลอยด์รมดำ',
        'ซับในผ้าไหมทอสีชาร์โคล',
      ],
      outfitDescription:
        outfit1.slice(1).join(' ') ||
        'โค้ตคัตติ้งเนี้ยบตัดเย็บพิเศษ คลุมทับเสื้อคอเต่าผ้านิตติ้งสีดำแนบเนื้อ กางเกงสแล็กเข้ารูป และรองเท้าบูทหนังขัดเงา ให้ความรู้สึกน่าเกรงขามและลุ่มลึกในเวลาเดียวกัน',
      vibe: 'สุขุม นิ่งสงบ สังเกตการณ์ทุกสิ่งเงียบๆ มีออร่าของผู้คุมเกม',
      defaultPose:
        draft.starting_state?.initial_a_pos ||
        postures[0] ||
        'ยืนกอดอกพิงเคาน์เตอร์ ทิ้งน้ำหนักที่ขาข้างหนึ่งอย่างผ่อนคลายแต่พร้อมขยับ',
      microGesture:
        postures[1] ||
        'ใช้นิ้วชี้ดันกรอบแว่นเบาๆ ขณะกำลังเพ่งมองและประเมินคู่สนทนา',
    };
  });

  // Sync back when draft changes externally
  useEffect(() => {
    if (draft.title && draft.title !== data.name) {
      setData((prev) => ({ ...prev, name: draft.title }));
    }
  }, [draft.title]);

  const handleSave = () => {
    setIsEditing(false);
    if (onUpdateDraft) {
      const updatedAppearance = {
        ...(draft.appearance || {}),
        anatomy_features: data.facialTraits,
        signature_postures: [data.defaultPose, data.microGesture].filter(Boolean),
        wardrobe: {
          ...(draft.appearance?.wardrobe || {}),
          outfit_1: [data.outfitName, data.outfitDescription].filter(Boolean),
        },
      };

      const updatedStartingState = {
        time: draft.starting_state?.time || 'ยามค่ำคืน',
        weather: draft.starting_state?.weather || 'แอร์เย็นสบาย',
        location: draft.starting_state?.location || 'ห้อง VIP บาร์หรู',
        initial_p_pos: draft.starting_state?.initial_p_pos || 'นั่งเอนตัวจิบเครื่องดื่ม',
        initial_a_pos: data.defaultPose,
        initial_outfit_key: data.outfitName,
      };

      onUpdateDraft({
        title: data.name,
        archetype: data.alias,
        appearance: updatedAppearance,
        starting_state: updatedStartingState,
      });
    }
  };

  const handleAddTrait = (trait: string) => {
    if (!trait.trim()) return;
    setData((prev) => ({
      ...prev,
      facialTraits: [...prev.facialTraits, trait.trim()],
    }));
  };

  const handleRemoveTrait = (index: number) => {
    setData((prev) => ({
      ...prev,
      facialTraits: prev.facialTraits.filter((_, i) => i !== index),
    }));
  };

  const handleAddFabric = (fabric: string) => {
    if (!fabric.trim()) return;
    setData((prev) => ({
      ...prev,
      outfitFabrics: [...prev.outfitFabrics, fabric.trim()],
    }));
  };

  const handleRemoveFabric = (index: number) => {
    setData((prev) => ({
      ...prev,
      outfitFabrics: prev.outfitFabrics.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="relative w-full rounded-[24px] bg-white/[0.04] hover:bg-white/[0.06] backdrop-blur-2xl border border-white/[0.08] hover:border-white/[0.14] p-6 sm:p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 group">
      {/* ✦ TOP AMBIENT ACCENT */}
      <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* 1. CARD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
            <User size={20} className="text-[#EF264C]" strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#EF264C] bg-[#EF264C]/10 px-2.5 py-0.5 rounded-full border border-[#EF264C]/25">
                การ์ดที่ 1 • Identity & Visual
              </span>
              <span className="text-white/30 text-[11px]">✦ พิมพ์เขียวอัตลักษณ์</span>
            </div>

            {isEditing ? (
              <div className="mt-2 space-y-1.5">
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  placeholder="ชื่อตัวละคร"
                  className="w-full bg-white/[0.06] border border-white/20 focus:border-[#EF264C]/60 rounded-xl px-3 py-1.5 text-[20px] font-semibold text-[#F1F1F1] outline-none"
                />
                <input
                  type="text"
                  value={data.alias}
                  onChange={(e) => setData({ ...data, alias: e.target.value })}
                  placeholder="ฉายา หรือบทบาทหลัก"
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-white/25 rounded-lg px-2.5 py-1 text-[13px] text-[#AAAAAA] outline-none"
                />
              </div>
            ) : (
              <div className="mt-1">
                <h2 className="text-[22px] sm:text-[24px] font-semibold text-[#F1F1F1] tracking-tight leading-tight">
                  {data.name}
                </h2>
                <p className="text-[13.5px] text-[#AAAAAA] font-normal mt-0.5">{data.alias}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Button: Edit / Done */}
        {isEditable && (
          <div className="flex items-center gap-2 self-start sm:self-center">
            {isEditing ? (
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white text-[13px] font-medium flex items-center gap-1.5 shadow-[0_2px_8px_rgba(239,38,76,0.35)] transition-all active:scale-95 cursor-pointer"
              >
                <Check size={14} strokeWidth={2.4} />
                บันทึกข้อมูล
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/80 hover:text-white text-[12.5px] font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              >
                <Pencil size={12} strokeWidth={2} />
                แก้ไข
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. BIOMETRIC PILLS (อายุ, สัดส่วนสรีระ) */}
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        {isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5">
              <span className="text-[12px] text-white/40 shrink-0">อายุ:</span>
              <input
                type="text"
                value={data.age}
                onChange={(e) => setData({ ...data, age: e.target.value })}
                className="bg-transparent text-[13px] text-[#F1F1F1] outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5">
              <span className="text-[12px] text-white/40 shrink-0">สรีระ:</span>
              <input
                type="text"
                value={data.genderBuild}
                onChange={(e) => setData({ ...data, genderBuild: e.target.value })}
                className="bg-transparent text-[13px] text-[#F1F1F1] outline-none w-full"
              />
            </div>
          </div>
        ) : (
          <>
            <span className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[12.5px] text-[#D6D6DC] flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <span className="text-white/40 font-light">อายุ:</span> {data.age}
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[12.5px] text-[#D6D6DC] flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <span className="text-white/40 font-light">สรีระ:</span> {data.genderBuild}
            </span>
          </>
        )}
      </div>

      {/* 3. CORE SECTIONS: 2-COLUMN OR STACKED GRID */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 3.1 VISUAL DNA (ดวงตา, ทรงผม, รอยสัก, เอกลักษณ์) */}
        <div className="rounded-[20px] bg-white/[0.03] border border-white/[0.06] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-white/75 text-[13px] font-medium pb-3 border-b border-white/[0.06]">
              <Eye size={15} className="text-[#EF264C]" strokeWidth={2} />
              <span>Visual DNA • แววตา & ทรงผม</span>
            </div>

            <div className="mt-3.5 space-y-3">
              {/* Eye Color */}
              <div className="flex items-start gap-2.5">
                <div
                  className="w-3.5 h-3.5 rounded-full mt-1 shrink-0 border border-white/30 shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                  style={{ backgroundColor: data.eyeHex || '#D4A373' }}
                />
                <div className="flex-1">
                  <div className="text-[11px] text-white/40 font-light">ดวงตา</div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.eyeColor}
                      onChange={(e) => setData({ ...data, eyeColor: e.target.value })}
                      className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-[13px] text-[#F1F1F1] outline-none mt-0.5"
                    />
                  ) : (
                    <div className="text-[13.5px] text-[#F1F1F1] font-normal">{data.eyeColor}</div>
                  )}
                </div>
              </div>

              {/* Hair Style */}
              <div className="flex items-start gap-2.5">
                <Scissors size={14} className="text-white/40 mt-1 shrink-0" strokeWidth={2} />
                <div className="flex-1">
                  <div className="text-[11px] text-white/40 font-light">ทรงผม & สีผม</div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.hairStyle}
                      onChange={(e) => setData({ ...data, hairStyle: e.target.value })}
                      className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-[13px] text-[#F1F1F1] outline-none mt-0.5"
                    />
                  ) : (
                    <div className="text-[13.5px] text-[#F1F1F1] font-normal">{data.hairStyle}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Facial Traits / Unique Marks */}
            <div className="mt-4 pt-3 border-t border-white/[0.05]">
              <div className="text-[11px] text-white/40 font-light mb-2">เอกลักษณ์ทางใบหน้า & กายภาพ</div>
              <div className="flex flex-wrap gap-1.5">
                {data.facialTraits.map((trait, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[12px] text-white/80 font-normal shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="text-[#EF264C] text-[10px]">✦</span>
                    {trait}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTrait(idx)}
                        className="hover:text-red-400 text-white/40 ml-0.5 transition-colors cursor-pointer"
                      >
                        <X size={11} strokeWidth={2.5} />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {isEditing && (
                <div className="mt-2.5 flex items-center gap-2">
                  <input
                    type="text"
                    id="new-trait-input"
                    placeholder="เพิ่มเอกลักษณ์ใหม่..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value;
                        handleAddTrait(val);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1 text-[12px] text-[#F1F1F1] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('new-trait-input') as HTMLInputElement;
                      if (input && input.value) {
                        handleAddTrait(input.value);
                        input.value = '';
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[12px] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} strokeWidth={2.5} /> เพิ่ม
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3.2 SIGNATURE OUTFIT (ชุดประจำตัว & จานสี) */}
        <div className="rounded-[20px] bg-white/[0.03] border border-white/[0.06] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 text-white/75 text-[13px] font-medium">
                <Shirt size={15} className="text-[#EF264C]" strokeWidth={2} />
                <span>Signature Outfit • ชุดเริ่มต้น & เนื้อผ้า</span>
              </div>

              {/* Color Palette Swatches */}
              <div className="flex items-center gap-1.5">
                {data.outfitPalette.map((hex, idx) => (
                  <span
                    key={idx}
                    title={hex}
                    className="w-4 h-4 rounded-full border border-white/30 shadow-sm"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-3.5 space-y-2.5">
              {/* Outfit Name */}
              <div>
                <div className="text-[11px] text-white/40 font-light">ชื่อชุดประจำตัว</div>
                {isEditing ? (
                  <input
                    type="text"
                    value={data.outfitName}
                    onChange={(e) => setData({ ...data, outfitName: e.target.value })}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-[13.5px] font-medium text-[#F1F1F1] outline-none mt-0.5"
                  />
                ) : (
                  <div className="text-[14px] font-medium text-[#F1F1F1] mt-0.5">{data.outfitName}</div>
                )}
              </div>

              {/* Outfit Description */}
              <div>
                <div className="text-[11px] text-white/40 font-light">รายละเอียดคัตติ้ง</div>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={data.outfitDescription}
                    onChange={(e) => setData({ ...data, outfitDescription: e.target.value })}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1.5 text-[12.5px] text-[#AAAAAA] outline-none mt-0.5 leading-relaxed resize-none"
                  />
                ) : (
                  <p className="text-[12.5px] text-[#AAAAAA] leading-relaxed mt-0.5">
                    {data.outfitDescription}
                  </p>
                )}
              </div>

              {/* Fabric Tags */}
              <div className="pt-2 border-t border-white/[0.05]">
                <div className="text-[11px] text-white/40 font-light mb-1.5">เนื้อผ้าและฮาร์ดแวร์</div>
                <div className="flex flex-wrap gap-1.5">
                  {data.outfitFabrics.map((fabric, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11.5px] text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                    >
                      {fabric}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFabric(idx)}
                          className="hover:text-red-400 text-white/40 ml-0.5 transition-colors cursor-pointer"
                        >
                          <X size={10} strokeWidth={2.5} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                {isEditing && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <input
                      type="text"
                      id="new-fabric-input"
                      placeholder="เพิ่มเนื้อผ้า/วัสดุ..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value;
                          handleAddFabric(val);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                      className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1 text-[12px] text-[#F1F1F1] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('new-fabric-input') as HTMLInputElement;
                        if (input && input.value) {
                          handleAddFabric(input.value);
                          input.value = '';
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[12px] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} strokeWidth={2.5} /> เพิ่ม
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. KINEMATICS & PRESENCE (ภาษากายและกลิ่นอายเริ่มต้น) */}
      <div className="mt-4 rounded-[20px] bg-white/[0.03] border border-white/[0.06] p-4 sm:p-5">
        <div className="flex items-center gap-2 text-white/75 text-[13px] font-medium pb-3 border-b border-white/[0.06]">
          <Activity size={15} className="text-[#EF264C]" strokeWidth={2} />
          <span>Default Kinematics • ภาษากาย & ท่าทางเปิดตัว</span>
        </div>

        <div className="mt-3.5 grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Vibe */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
            <div className="text-[11px] text-white/40 font-light">กลิ่นอายแรกพบ (Presence Vibe)</div>
            {isEditing ? (
              <textarea
                rows={2}
                value={data.vibe}
                onChange={(e) => setData({ ...data, vibe: e.target.value })}
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-[12.5px] text-[#F1F1F1] outline-none mt-1 resize-none"
              />
            ) : (
              <div className="text-[13px] text-[#F1F1F1] mt-1 leading-snug">{data.vibe}</div>
            )}
          </div>

          {/* Initial Pose */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
            <div className="text-[11px] text-white/40 font-light flex items-center gap-1">
              <span>ท่าทางเปิดตัว (Initial Stance)</span>
              <span className="text-[9px] text-[#EF264C] bg-[#EF264C]/10 px-1 rounded">HUD</span>
            </div>
            {isEditing ? (
              <textarea
                rows={2}
                value={data.defaultPose}
                onChange={(e) => setData({ ...data, defaultPose: e.target.value })}
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-[12.5px] text-[#F1F1F1] outline-none mt-1 resize-none"
              />
            ) : (
              <div className="text-[13px] text-[#F1F1F1] mt-1 leading-snug">{data.defaultPose}</div>
            )}
          </div>

          {/* Micro Gesture */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
            <div className="text-[11px] text-white/40 font-light">กิริยาเฉพาะตัว (Micro-Gesture)</div>
            {isEditing ? (
              <textarea
                rows={2}
                value={data.microGesture}
                onChange={(e) => setData({ ...data, microGesture: e.target.value })}
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-[12.5px] text-[#AAAAAA] outline-none mt-1 resize-none"
              />
            ) : (
              <div className="text-[13px] text-[#AAAAAA] mt-1 leading-snug italic">"{data.microGesture}"</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
