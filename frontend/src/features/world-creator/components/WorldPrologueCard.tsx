import { useState, type RefObject } from 'react';
import { BookOpen, HelpCircle, Sparkles, Pencil, Check, X } from 'lucide-react';
import type { WorldPrologue } from '../types';

interface WorldPrologueCardProps {
  cardRef?: RefObject<HTMLDivElement | null>;
  prologue?: WorldPrologue;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
  onSave?: (updated: WorldPrologue) => void;
}

const DEFAULT_PROLOGUE: WorldPrologue = {
  premise:
    'บรรยากาศยามบ่าย ณ เรียวกังออนเซ็นกลางทิวเขาอันสงบเงียบ ควรจะเป็นช่วงเวลาแห่งการพักผ่อน แต่ชมรมพฤกษศาสตร์กลับได้รับภารกิจด่วนในการเก็บกู้สมุนไพรหายาก สายลมเย็นเยือกด้านนอกเริ่มพัดกวาดเอาความชื้นและเมฆดำทะมึนเข้าครอบคลุม ผืนป่าแปรเปลี่ยนเป็นดินแดนลึลับ และในท่ามกลางความตึงเครียดของกิจกรรมชมรม [PLAYER] กำลังจะถูกเหวี่ยงเข้าไปอยู่ในสถานการณ์ที่ไม่มีทางถอยกลับ',
  question:
    'อะไรคือเหตุผลหรือจุดยืนที่แท้จริงของ [PLAYER] ในการตกลงเข้าร่วมทริปเก็บตัวอย่างพฤกษศาสตร์ครั้งนี้?',
  choices: [
    {
      text: 'ฉันแค่ต้องการทำคะแนนวิชาพฤกษศาสตร์ให้ผ่าน และช่วยงานชมรมตามหน้าที่รุ่นน้องที่ดีเท่านั้น',
      hidden_trait: 'สายนอบน้อมรักษากฎ',
    },
    {
      text: 'ฉันอยากหาโอกาสใกล้ชิดรุ่นพี่มาฮิโระ สาวแว่นเรียบร้อยผู้ลึกลับที่ฉันแอบสนใจมานาน',
      hidden_trait: 'สายแอบรักและช่างสังเกต',
    },
    {
      text: 'ฉันถูกประธานชมรมใช้อำนาจกดดันและบังคับให้มาแบกของอย่างหลีกเลี่ยงไม่ได้',
      hidden_trait: 'สายเหยื่อผู้จำนนต่อสถานการณ์',
    },
  ],
};

export default function WorldPrologueCard({
  cardRef,
  prologue = DEFAULT_PROLOGUE,
  isEditing = false,
  onStartEdit,
  onCancelEdit,
  onSave,
}: WorldPrologueCardProps) {
  const [editPremise, setEditPremise] = useState<string>(prologue?.premise || DEFAULT_PROLOGUE.premise);
  const [editQuestion, setEditQuestion] = useState<string>(prologue?.question || DEFAULT_PROLOGUE.question);
  const [editChoices, setEditChoices] = useState(
    prologue?.choices || DEFAULT_PROLOGUE.choices
  );

  const handleStart = () => {
    setEditPremise(prologue?.premise || DEFAULT_PROLOGUE.premise);
    setEditQuestion(prologue?.question || DEFAULT_PROLOGUE.question);
    setEditChoices(prologue?.choices || DEFAULT_PROLOGUE.choices);
    onStartEdit?.();
  };

  const handleSave = () => {
    onSave?.({
      premise: editPremise.trim(),
      question: editQuestion.trim(),
      choices: editChoices,
    });
  };

  return (
    <div
      ref={cardRef}
      className="p-5 sm:p-6 rounded-2xl bg-[#121214]/95 backdrop-blur-2xl border border-white/10 flex flex-col gap-5 text-left relative overflow-hidden transition-all duration-200 hover:border-white/20"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2F3336]">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-[#EF264C]" />
          <h3 className="text-[15px] font-medium text-[#F2F2F5] tracking-wide">
            บทนำ & ทางเลือกเจตจำนง (Prologue & Role Intent)
          </h3>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white text-[13px] font-medium transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Check size={14} />
              <span>บันทึก</span>
            </button>
            <button
              onClick={onCancelEdit}
              className="px-3 py-1.5 rounded-full border border-[#2F3336] hover:bg-white/[0.08] hover:border-white/35 text-[#ACACB2] text-[13px] transition-all flex items-center gap-1.5 active:scale-95"
            >
              <X size={14} />
              <span>ยกเลิก</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleStart}
            className="w-8 h-8 rounded-full border border-[#2F3336] bg-transparent hover:bg-white/[0.08] hover:border-white/35 text-[#F2F2F5] flex items-center justify-center transition-all cursor-pointer active:scale-90"
            title="แก้ไขบทนำและทางเลือก"
          >
            <Pencil size={13} />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-4">
          {/* Edit Premise */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-[#ACACB2] font-medium flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#EF264C]" />
              บริบทสถานการณ์เปิดฉาก (Opening Premise)
            </label>
            <textarea
              value={editPremise}
              onChange={(e) => setEditPremise(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-[#1D1D1F] border border-white/10 rounded-xl text-[#F2F2F5] text-[14px] outline-none focus:border-[#EF264C]/60 resize-none"
            />
          </div>

          {/* Edit Question */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-[#ACACB2] font-medium flex items-center gap-1.5">
              <HelpCircle size={12} className="text-[#EF264C]" />
              คำถามตัดสินใจเริ่มต้น (Role Decision Question)
            </label>
            <input
              type="text"
              value={editQuestion}
              onChange={(e) => setEditQuestion(e.target.value)}
              className="w-full px-3 py-2 bg-[#1D1D1F] border border-white/10 rounded-xl text-[#F2F2F5] text-[14px] outline-none focus:border-[#EF264C]/60"
            />
          </div>

          {/* Edit Choices */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[12px] text-[#ACACB2] font-medium">
              ตัวเลือกเริ่มต้น & คุณลักษณะแฝง (Choices & Hidden Traits)
            </label>
            {editChoices.map((choice, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#1D1D1F] border border-white/10 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between text-[11px] text-[#ACACB2]">
                  <span>ตัวเลือกที่ {idx + 1}</span>
                  <div className="flex items-center gap-1.5">
                    <span>คุณลักษณะแฝง:</span>
                    <input
                      type="text"
                      value={choice.hidden_trait}
                      onChange={(e) => {
                        const updated = [...editChoices];
                        updated[idx] = { ...updated[idx], hidden_trait: e.target.value };
                        setEditChoices(updated);
                      }}
                      className="px-2 py-0.5 bg-black/40 border border-white/15 rounded text-[#EF264C] text-[11px] outline-none w-36"
                    />
                  </div>
                </div>
                <textarea
                  value={choice.text}
                  onChange={(e) => {
                    const updated = [...editChoices];
                    updated[idx] = { ...updated[idx], text: e.target.value };
                    setEditChoices(updated);
                  }}
                  rows={2}
                  className="w-full px-2.5 py-1.5 bg-black/30 border border-white/10 rounded-lg text-[#F2F2F5] text-[13px] outline-none focus:border-[#EF264C]/60 resize-none"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Premise */}
          <div className="p-3.5 rounded-xl bg-[#1D1D1F] border border-white/5 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#ACACB2] font-medium">
              <Sparkles size={12} className="text-[#EF264C]" />
              <span>Opening Premise</span>
            </div>
            <p className="text-[14px] text-[#F2F2F5] leading-relaxed font-normal">
              {prologue?.premise || DEFAULT_PROLOGUE.premise}
            </p>
          </div>

          {/* Question & Choices */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 text-[12px] text-[#ACACB2] font-medium">
              <HelpCircle size={13} className="text-[#EF264C]" />
              <span className="text-[#F2F2F5] font-medium">
                {prologue?.question || DEFAULT_PROLOGUE.question}
              </span>
            </div>

            <div className="flex flex-col gap-2 mt-1">
              {(prologue?.choices || DEFAULT_PROLOGUE.choices).map((choice, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#1D1D1F]/80 border border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-[12px] font-mono text-[#ACACB2] shrink-0 mt-0.5">
                      0{idx + 1}.
                    </span>
                    <p className="text-[13.5px] text-[#F2F2F5] leading-normal">
                      {choice.text}
                    </p>
                  </div>
                  <span className="shrink-0 self-start sm:self-center px-2.5 py-1 rounded-full text-[11.5px] font-medium bg-[#EF264C]/10 border border-[#EF264C]/30 text-[#EF264C]">
                    {choice.hidden_trait}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
