import React, { useState } from 'react';
import {
  ShieldAlert,
  Pencil,
  X,
  Check,
  AlertTriangle,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import type { WorldRulesTension } from '../types';

interface WorldRulesCardProps {
  cardRef?: React.RefObject<HTMLDivElement | null>;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
  onSave?: (data: WorldRulesTension) => void;
  rulesTension?: WorldRulesTension;
}

const DEFAULT_TABOOS: string[] = [
  'ห้ามมีความสัมพันธ์เชิงชู้สาวในที่ทำงาน หรือแสดงพฤติกรรมไม่เหมาะสมในเวลางาน',
  'ต้องเก็บซ่อนเรือนร่างและตัวตนลับบนโลกออนไลน์ (@BlackLace_Secret) ไม่ให้คนในออฟฟิศล่วงรู้เด็ดขาด',
  'ห้ามส่งเสียงดังหรือทิ้งร่องรอยไว้ในจุดอับสายตาหลังแท็งก์น้ำ',
];

const DEFAULT_EXPOSURE_RISK =
  'หากความลับแตกว่าเป็นสาวคอสเพลย์ชุดลูกไม้สีดำ จะถูกส่งเรื่องเข้าแผนกบุคคลเพื่อพิจารณาไล่ออกทันที และภาพถ่ายลับจะถูกประจานไปทั่วโลกออนไลน์';

const DEFAULT_NPC_INTERFERENCE: string[] = [
  'ภารโรงตึกที่มักเดินขึ้นมาไขกุญแจตรวจแท็งก์น้ำยามบ่าย',
  'หัวหน้าแผนกบัญชีจอมจู้จี้ที่ชอบแอบขึ้นมาสูบบุหรี่ในมุมสงบ',
  'เสียงฝีเท้าและเสียงโทรศัพท์ของเพื่อนร่วมงานที่เดินคุยผ่านบันไดหนีไฟ',
];

export default function WorldRulesCard({
  cardRef,
  isEditing = false,
  onStartEdit,
  onCancelEdit,
  onSave,
  rulesTension = {
    taboos: DEFAULT_TABOOS,
    exposure_risk: DEFAULT_EXPOSURE_RISK,
    npc_interference: DEFAULT_NPC_INTERFERENCE,
  },
}: WorldRulesCardProps) {
  const [editTaboos, setEditTaboos] = useState<string[]>(
    rulesTension.taboos || DEFAULT_TABOOS
  );
  const [editRisk, setEditRisk] = useState<string>(
    rulesTension.exposure_risk || DEFAULT_EXPOSURE_RISK
  );
  const [editNpc, setEditNpc] = useState<string[]>(
    rulesTension.npc_interference || DEFAULT_NPC_INTERFERENCE
  );

  const handleStart = () => {
    setEditTaboos(rulesTension.taboos || DEFAULT_TABOOS);
    setEditRisk(rulesTension.exposure_risk || DEFAULT_EXPOSURE_RISK);
    setEditNpc(rulesTension.npc_interference || DEFAULT_NPC_INTERFERENCE);
    onStartEdit?.();
  };

  const handleSave = () => {
    onSave?.({
      taboos: editTaboos.filter((t) => t.trim().length > 0),
      exposure_risk: editRisk,
      npc_interference: editNpc.filter((n) => n.trim().length > 0),
    });
  };

  const handleAddTaboo = () => {
    setEditTaboos((prev) => [...prev, '']);
  };

  const handleDeleteTaboo = (idx: number) => {
    setEditTaboos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddNpc = () => {
    setEditNpc((prev) => [...prev, '']);
  };

  const handleDeleteNpc = (idx: number) => {
    setEditNpc((prev) => prev.filter((_, i) => i !== idx));
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
          <ShieldAlert size={16} className="text-[#EF264C] shrink-0" />
          <h3
            className={`text-[18px] sm:text-[19px] font-bold tracking-tight ${
              isEditing ? 'text-[#EF264C]' : 'text-[#F2F2F5]'
            }`}
          >
            {isEditing ? 'แก้ไขกฎเกณฑ์ & ความเสี่ยง' : 'กฎเกณฑ์โลก & ระดับความเสี่ยง'}
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
              title="บันทึกกฎเกณฑ์และความเสี่ยง"
              className="w-8 h-8 rounded-full border border-[#EF264C]/70 bg-[#EF264C]/15 hover:bg-[#EF264C] text-[#EF264C] hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 shadow-[0_0_10px_rgba(239,38,76,0.2)] select-none"
            >
              <Check size={14} strokeWidth={2.2} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStart}
            title="แก้ไขกฎเกณฑ์และความเสี่ยง"
            className="w-8 h-8 rounded-full bg-transparent border border-[#2F3336] hover:border-[#EF264C]/60 text-[#ACACB2] hover:text-[#EF264C] flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 select-none"
          >
            <Pencil size={14} strokeWidth={1.8} />
          </button>
        )}
      </div>

      {/* 1. Taboos & World Rules */}
      <div className="space-y-2 pt-0.5">
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] font-bold text-[#EF264C] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert size={13} className="text-[#EF264C]" />
            <span>กฎเหล็ก & ข้อห้ามของโลก (TABOOS & WORLD RULES)</span>
          </span>
          {isEditing && (
            <button
              type="button"
              onClick={handleAddTaboo}
              className="text-[11px] font-bold text-[#ACACB2] hover:text-[#EF264C] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus size={12} />
              <span>เพิ่มข้อห้าม</span>
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {(isEditing ? editTaboos : rulesTension.taboos || []).map(
            (taboo, idx) => (
              <div
                key={idx}
                className="bg-black/20 p-2.5 rounded-lg border border-white/5 flex items-start gap-2"
              >
                <span className="text-[#EF264C] font-mono text-[11px] shrink-0 mt-1">
                  🚫
                </span>
                {isEditing ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={taboo}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditTaboos((prev) =>
                          prev.map((item, i) => (i === idx ? val : item))
                        );
                      }}
                      placeholder="ระบุข้อห้าม..."
                      className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[14px] font-normal rounded-lg px-2.5 py-1 outline-none"
                    />
                    {editTaboos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTaboo(idx)}
                        className="text-[#ACACB2] hover:text-red-400 p-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-[14px] text-[#F2F2F5] font-normal leading-relaxed select-text">
                    {taboo}
                  </p>
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* 2. Exposure Risk */}
      <div className="border-t border-[#2F3336]/60 pt-3 space-y-1.5">
        <span className="text-[11.5px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle size={13} className="text-amber-400" />
          <span>ระดับความเสี่ยง & ผลลัพธ์เมื่อความลับแตก (EXPOSURE RISK)</span>
        </span>
        {isEditing ? (
          <textarea
            value={editRisk}
            onChange={(e) => setEditRisk(e.target.value)}
            rows={2}
            placeholder="จะเกิดอะไรขึ้นเมื่อตัวละครถูกจับได้..."
            className="w-full bg-[#141416] border border-[#2F3336] focus:border-amber-400 text-[#F2F2F5] text-[14px] font-normal rounded-xl p-3 outline-none resize-none leading-relaxed"
          />
        ) : (
          <div className="bg-black/30 p-3 rounded-lg border border-amber-500/20 select-text">
            <p className="text-[14px] text-[#F2F2F5] font-normal leading-relaxed">
              {rulesTension.exposure_risk || 'ยังไม่มีการระบุผลลัพธ์ความเสี่ยง'}
            </p>
          </div>
        )}
      </div>

      {/* 3. NPC Interference (บุคคลที่ 3 ที่อาจโผล่มาขัดจังหวะ) */}
      <div className="border-t border-[#2F3336]/60 pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] font-bold text-[#ACACB2] uppercase tracking-wider flex items-center gap-1.5">
            <Users size={13} className="text-[#EF264C]" />
            <span>บุคคลที่ 3 ที่อาจโผล่มาขัดจังหวะ (NPC INTERFERENCE)</span>
          </span>
          {isEditing && (
            <button
              type="button"
              onClick={handleAddNpc}
              className="text-[11px] font-bold text-[#ACACB2] hover:text-[#EF264C] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus size={12} />
              <span>เพิ่มบุคคลที่ 3</span>
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {(isEditing ? editNpc : rulesTension.npc_interference || []).map(
            (npc, idx) => (
              <div
                key={idx}
                className="bg-black/15 p-2.5 rounded-lg border border-white/5 flex items-start gap-2"
              >
                <span className="text-amber-400 font-mono text-[12px] shrink-0 mt-0.5">
                  ⚠️
                </span>
                {isEditing ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={npc}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditNpc((prev) =>
                          prev.map((item, i) => (i === idx ? val : item))
                        );
                      }}
                      placeholder="เช่น ภารโรงเดินขึ้นมาตรวจ, หัวหน้าเดินสูบบุหรี่..."
                      className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[14px] font-normal rounded-lg px-2.5 py-1 outline-none"
                    />
                    {editNpc.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteNpc(idx)}
                        className="text-[#ACACB2] hover:text-red-400 p-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-[14px] text-[#F2F2F5] font-normal leading-relaxed select-text">
                    {npc}
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
