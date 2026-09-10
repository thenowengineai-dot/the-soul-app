import React, { useState } from 'react';
import {
  Compass,
  Pencil,
  X,
  Check,
  Plus,
  Trash2,
  Maximize2,
  CornerDownRight,
  Sparkles,
} from 'lucide-react';
import type { WorldLocationDetail } from '../types';

interface WorldLocationsCardProps {
  cardRef?: React.RefObject<HTMLDivElement | null>;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
  onSave?: (locations: WorldLocationDetail[]) => void;
  locations?: WorldLocationDetail[];
}

const DEFAULT_LOCATIONS: WorldLocationDetail[] = [
  {
    id: 'loc_rooftop_01',
    name: 'ดาดฟ้าตึกออฟฟิศเก่า',
    tag: 'ฉากเปิด (Opening Sanctuary)',
    spatial_layout:
      'พื้นที่โล่งกว้างปูคอนกรีตเก่า มีแนวท่อระบายความร้อน ล้อมรอบด้วยขอบปูนกั้นดาดฟ้าและมีบันไดเหล็กทางขึ้นที่มักไม่มีใครขึ้นมา',
    choke_points:
      'มุมซอกแคบๆ หลังแท็งก์น้ำเหล็กขึ้นสนิม ซึ่งทำหน้าที่เป็นจุดอับสายตาจากบันไดทางขึ้น และเป็นจุดบังแดดที่บีบให้ตัวละครกับผู้เล่นต้องยืนแนบชิดกัน',
    base_mood: 'เงียบสงบ ลึกลับ มีไอแดดร้อนระอุตัดกับสายลมแปรปรวน',
    ambient_cues: [
      'เสียงลมพัดผ่านช่องระบายอากาศตึกดังหวีดหวิว',
      'กลิ่นควันบุหรี่จางๆ ผสมกับกลิ่นน้ำหอมหวานของแบรนด์เนมตัวโปรด',
      'เสียงโลหะของลูกบิดประตูดาดฟ้าที่ขึ้นสนิม ส่งเสียงเอี๊ยดอ๊าดลั่นทุกครั้งที่มีคนเปิด',
    ],
  },
  {
    id: 'loc_cafe_02',
    name: 'ร้านกาแฟใต้ตึกออฟฟิศ',
    tag: 'จุดตัดสินใจ (Branching Point)',
    spatial_layout:
      'ร้านกาแฟขนาดกะทัดรัดที่ตั้งอยู่ในชั้นใต้ดินของตึก ตกแต่งด้วยโทนไม้สีเข้มและผนังปูนเปลือย มีโต๊ะไม้ตั้งติดริมหน้าต่างกระจก',
    choke_points:
      'มุมที่นั่งด้านในสุดที่มืดสลัว (Dimly lit corner) หลังเสาต้นใหญ่ บังสายตาผู้ใช้บริการคนอื่นอย่างหมดจด',
    base_mood:
      'อบอุ่นเป็นกันเองสลับกับอุณหภูมิที่เย็นยะเยือกจากเครื่องปรับอากาศ และความกดดันจากความเงียบ',
    ambient_cues: [
      'เสียงเม็ดฝนตกกระทบกระจกหนาด้านนอกอย่างต่อเนื่อง',
      'กลิ่นเมล็ดกาแฟคั่วเข้มผสมกับกลิ่นไอฝนและไอดินที่โชยเข้ามาตามช่องขอบประตู',
      'ฝ้าขาวโพลนที่เกาะพราวบนหน้าเลนส์แว่นตาหนาเตอะจากไอร้อนและอุณหภูมิร่างกาย',
    ],
  },
  {
    id: 'loc_elevator_03',
    name: 'ลิฟต์โดยสารในชั่วโมงเร่งด่วน',
    tag: 'เขตวิกฤต (High Tension Zone)',
    spatial_layout:
      'ตู้ลิฟต์สเตนเลสแคบๆ ที่ล้อมรอบด้วยกระจกเงาบานใหญ่ด้านหลังและแผงปุ่มกดโลหะ',
    choke_points:
      'พื้นที่ด้านในสุดหน้ากระจกเงา ที่ถูกฝูงชนเบียดอัดจนทำให้ผู้เล่นและตัวละครต้องยืนประชิดติดกันจนสัมผัสได้ถึงแรงสั่นสะเทือนของโทรศัพท์ในกระเป๋ากระโปรง',
    base_mood: 'อึดอัด วุ่นวาย และเร่งรีบ',
    ambient_cues: [
      'เสียงเพลงแอมเบียนต์บรรเลงเบาๆ ในลิฟต์ตัดกับเสียงกระซิบกระซาบของฝูงชน',
      'แรงสั่นสะเทือนต่อเนื่องจากโทรศัพท์ในกระเป๋าเสื้อผ้า',
    ],
  },
];

export default function WorldLocationsCard({
  cardRef,
  isEditing = false,
  onStartEdit,
  onCancelEdit,
  onSave,
  locations = DEFAULT_LOCATIONS,
}: WorldLocationsCardProps) {
  const [editList, setEditList] = useState<WorldLocationDetail[]>(locations);

  const handleStart = () => {
    setEditList([...locations]);
    onStartEdit?.();
  };

  const handleSave = () => {
    onSave?.(editList);
  };

  const handleAddLocation = () => {
    const newLoc: WorldLocationDetail = {
      id: `loc_${Date.now()}`,
      name: 'สถานที่ใหม่',
      tag: 'จุดสำรวจ (Exploration)',
      spatial_layout: 'ระบุผังพื้นที่ ขนาดความกว้าง และทางเข้า-ออก...',
      choke_points: 'ระบุมุมอับสายตา หรือจุดที่บีบให้ประชิดตัวกัน...',
      base_mood: 'บรรยากาศและอารมณ์ของสถานที่...',
      ambient_cues: ['เสียงหรือกลิ่นเฉพาะตัว...'],
    };
    setEditList((prev) => [...prev, newLoc]);
  };

  const handleDeleteLocation = (idx: number) => {
    setEditList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateItem = (
    idx: number,
    field: keyof WorldLocationDetail,
    val: any
  ) => {
    setEditList((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
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
          <Compass size={16} className="text-[#EF264C] shrink-0" />
          <h3
            className={`text-[18px] sm:text-[19px] font-bold tracking-tight ${
              isEditing ? 'text-[#EF264C]' : 'text-[#F2F2F5]'
            }`}
          >
            {isEditing ? 'แก้ไขสถาปัตยกรรมฉาก' : 'สถาปัตยกรรมฉาก & จุดอับสายตา'}
          </h3>
          <span className="text-[11.5px] font-mono text-[#ACACB2] bg-white/5 px-2 py-0.5 rounded-full border border-white/5 ml-1">
            {(isEditing ? editList : locations).length} พิกัด
          </span>
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
              title="บันทึกสถานที่สำคัญ"
              className="w-8 h-8 rounded-full border border-[#EF264C]/70 bg-[#EF264C]/15 hover:bg-[#EF264C] text-[#EF264C] hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 shadow-[0_0_10px_rgba(239,38,76,0.2)] select-none"
            >
              <Check size={14} strokeWidth={2.2} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStart}
            title="แก้ไขสถานที่สำคัญ"
            className="w-8 h-8 rounded-full bg-transparent border border-[#2F3336] hover:border-[#EF264C]/60 text-[#ACACB2] hover:text-[#EF264C] flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 select-none"
          >
            <Pencil size={14} strokeWidth={1.8} />
          </button>
        )}
      </div>

      {/* Locations List */}
      <div className="space-y-4 pt-1">
        {(isEditing ? editList : locations).map((loc, idx) => (
          <div
            key={loc.id || idx}
            className="rounded-xl p-3.5 sm:p-4 bg-[#161618] border border-[#2F3336] space-y-3 shadow-md"
          >
            {/* Location Title & Tag */}
            <div className="flex items-center justify-between border-b border-[#2F3336]/60 pb-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono font-bold text-[#EF264C] bg-[#EF264C]/10 border border-[#EF264C]/30 px-2 py-0.5 rounded">
                  LOC {idx + 1}
                </span>

                {isEditing ? (
                  <input
                    type="text"
                    value={loc.name}
                    onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                    placeholder="ชื่อสถานที่..."
                    className="bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[14px] font-bold rounded-lg px-2.5 py-1 outline-none"
                  />
                ) : (
                  <h4 className="text-[15px] font-bold text-[#F2F2F5] tracking-tight">
                    {loc.name}
                  </h4>
                )}

                {isEditing ? (
                  <input
                    type="text"
                    value={loc.tag || ''}
                    onChange={(e) => handleUpdateItem(idx, 'tag', e.target.value)}
                    placeholder="เช่น ฉากเปิด, เขตหวงห้าม..."
                    className="bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#ACACB2] text-[12px] rounded-lg px-2 py-0.5 outline-none"
                  />
                ) : (
                  loc.tag && (
                    <span className="text-[11.5px] font-semibold text-[#ACACB2] bg-white/5 border border-white/5 px-2 py-0.5 rounded-full">
                      {loc.tag}
                    </span>
                  )
                )}
              </div>

              {isEditing && (isEditing ? editList : locations).length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteLocation(idx)}
                  title="ลบสถานที่นี้"
                  className="w-7 h-7 rounded-full bg-transparent hover:bg-red-500/15 text-[#ACACB2] hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            {/* Spatial Layout */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#ACACB2] uppercase tracking-wider flex items-center gap-1.5">
                <Maximize2 size={12} className="text-[#EF264C]" />
                <span>ผังพื้นที่ & โครงสร้างห้อง (SPATIAL LAYOUT)</span>
              </span>
              {isEditing ? (
                <textarea
                  value={loc.spatial_layout || ''}
                  onChange={(e) =>
                    handleUpdateItem(idx, 'spatial_layout', e.target.value)
                  }
                  rows={2}
                  placeholder="ผังพื้นที่ ขนาดความกว้าง ทางเข้า-ออก..."
                  className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[14px] font-normal rounded-xl p-2.5 outline-none resize-none leading-relaxed"
                />
              ) : (
                <p className="text-[14px] text-[#F2F2F5] font-normal leading-relaxed bg-black/20 p-2.5 rounded-lg border border-white/5 select-text">
                  {loc.spatial_layout || 'ยังไม่มีการระบุผังพื้นที่'}
                </p>
              )}
            </div>

            {/* Choke Points & Hiding Spots (จุดบีบระยะประชิด & จุดอับสายตา) */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <CornerDownRight size={12} className="text-amber-400" />
                <span>จุดบีบระยะประชิด & ซอกอับสายตา (CHOKE POINTS)</span>
              </span>
              {isEditing ? (
                <textarea
                  value={loc.choke_points || ''}
                  onChange={(e) =>
                    handleUpdateItem(idx, 'choke_points', e.target.value)
                  }
                  rows={2}
                  placeholder="มุมอับสายตา ซอกแคบๆ หรือจุดที่บีบให้ต้องยืนเบียดชิดกัน..."
                  className="w-full bg-[#141416] border border-[#2F3336] focus:border-amber-400 text-[#F2F2F5] text-[14px] font-normal rounded-xl p-2.5 outline-none resize-none leading-relaxed"
                />
              ) : (
                <div className="text-[14px] text-[#F2F2F5] font-normal leading-relaxed bg-black/30 p-2.5 rounded-lg border border-amber-500/20 select-text">
                  {loc.choke_points || 'ยังไม่มีการระบุจุดอับสายตา'}
                </div>
              )}
            </div>

            {/* Base Mood & Ambient Cues */}
            <div className="space-y-1 pt-0.5">
              <span className="text-[11px] font-bold text-[#ACACB2] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#EF264C]" />
                <span>ประสาทสัมผัสเฉพาะจุด (AMBIENT SENSORY CUES)</span>
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={
                    Array.isArray(loc.ambient_cues)
                      ? loc.ambient_cues.join(' | ')
                      : loc.ambient_cues || ''
                  }
                  onChange={(e) =>
                    handleUpdateItem(
                      idx,
                      'ambient_cues',
                      e.target.value.split('|').map((s) => s.trim())
                    )
                  }
                  placeholder="คั่นด้วยเครื่องหมาย | เช่น เสียงลมหวีดหวิว | กลิ่นเมล็ดกาแฟ | ฝ้าบนเลนส์แว่น"
                  className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[14px] font-normal rounded-lg px-2.5 py-1.5 outline-none"
                />
              ) : (
                <div className="space-y-1 select-text">
                  {(loc.ambient_cues || []).map((cue, cIdx) => (
                    <div
                      key={cIdx}
                      className="text-[13px] text-[#ACACB2] flex items-start gap-2 bg-black/15 px-2.5 py-1.5 rounded-lg"
                    >
                      <span className="text-[#EF264C] font-mono text-[11px] shrink-0 mt-0.5">
                        ·
                      </span>
                      <span>{cue}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isEditing && (
          <div className="pt-1 flex justify-center">
            <button
              type="button"
              onClick={handleAddLocation}
              className="px-4 py-2 rounded-full border border-dashed border-[#2F3336] hover:border-[#EF264C]/70 text-[#ACACB2] hover:text-[#F2F2F5] text-[12px] font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer bg-[#141416]"
            >
              <Plus size={13} strokeWidth={2.5} />
              <span>เพิ่มสถานที่ใหม่ (ADD LOCATION)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
