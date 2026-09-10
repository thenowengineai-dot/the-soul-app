import { useState, type RefObject } from 'react';
import { UserCheck, ShieldAlert, Scale, Target, Pencil, Check, X, Lock } from 'lucide-react';
import type { PlayerPersona } from '../types';

interface WorldPersonaCardProps {
  cardRef?: RefObject<HTMLDivElement | null>;
  persona?: PlayerPersona;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
  onSave?: (updated: PlayerPersona) => void;
}

const DEFAULT_PERSONA: PlayerPersona = {
  identity: {
    title: 'รุ่นน้องผู้ช่วยเก็บตัวอย่างพฤกษศาสตร์',
    brief:
      'สมาชิกใหม่ของชมรมพฤกษศาสตร์ที่ถูกประธานชมรมบังคับให้เป็นผู้ช่วยแบกกระเป๋าอุปกรณ์เดินตามรุ่นพี่สาวแว่น',
  },
  pronouns: "แทนตัวเองว่า 'ผม/ฉัน', แทน [ACTOR] ว่า 'รุ่นพี่ [ACTOR]'",
  nicknames: 'รุ่นน้อง, หมอรีดพิษ',
  main_quest:
    'รับมือกับสถานการณ์ปิดตายและสถาวะคุคลั่งของรุ่นพี่ [ACTOR] ท่ามกลางความเสี่ยงกลางป่าและในถ้ำ',
  personality_vibe: 'สุภาพ ว่าง่าย รักษากฎ หรือถูกบีบให้ยอมจำนนต่อสถานการณ์',
  dynamic_and_power: {
    label: 'รุ่นน้องผู้ช่วย — รุ่นพี่สาวแว่นจอมวางแผน',
    actor_secret:
      '[ACTOR] ตั้งใจผสมยาปลุกเซ็กส์ใส่ขวดน้ำเพื่อมอม [PLAYER] แต่กลไกย้อนกลับเข้าตัวเองผ่านบาดแผลและรูขุมขน',
    power_balance:
      '[PLAYER] เป็นเหยื่อที่ถูกบีบด้วยสถานการณ์และกฎระเบียบชมรม ขณะที่ [ACTOR] เป็นรุ่นพี่ผู้ถืออำนาจวิชาการและต่อมาใช้แรงกายกดขี่',
  },
};

export default function WorldPersonaCard({
  cardRef,
  persona = DEFAULT_PERSONA,
  isEditing = false,
  onStartEdit,
  onCancelEdit,
  onSave,
}: WorldPersonaCardProps) {
  const [editTitle, setEditTitle] = useState<string>(persona?.identity?.title || DEFAULT_PERSONA.identity.title);
  const [editBrief, setEditBrief] = useState<string>(persona?.identity?.brief || DEFAULT_PERSONA.identity.brief);
  const [editPronouns, setEditPronouns] = useState<string>(persona?.pronouns || DEFAULT_PERSONA.pronouns);
  const [editNicknames, setEditNicknames] = useState<string>(persona?.nicknames || DEFAULT_PERSONA.nicknames);
  const [editPersonality, setEditPersonality] = useState<string>(persona?.personality_vibe || DEFAULT_PERSONA.personality_vibe);
  const [editMainQuest, setEditMainQuest] = useState<string>(persona?.main_quest || DEFAULT_PERSONA.main_quest);
  const [editDynamicLabel, setEditDynamicLabel] = useState<string>(persona?.dynamic_and_power?.label || DEFAULT_PERSONA.dynamic_and_power.label);
  const [editActorSecret, setEditActorSecret] = useState<string>(persona?.dynamic_and_power?.actor_secret || DEFAULT_PERSONA.dynamic_and_power.actor_secret);
  const [editPowerBalance, setEditPowerBalance] = useState<string>(persona?.dynamic_and_power?.power_balance || DEFAULT_PERSONA.dynamic_and_power.power_balance);

  const handleStart = () => {
    setEditTitle(persona?.identity?.title || DEFAULT_PERSONA.identity.title);
    setEditBrief(persona?.identity?.brief || DEFAULT_PERSONA.identity.brief);
    setEditPronouns(persona?.pronouns || DEFAULT_PERSONA.pronouns);
    setEditNicknames(persona?.nicknames || DEFAULT_PERSONA.nicknames);
    setEditPersonality(persona?.personality_vibe || DEFAULT_PERSONA.personality_vibe);
    setEditMainQuest(persona?.main_quest || DEFAULT_PERSONA.main_quest);
    setEditDynamicLabel(persona?.dynamic_and_power?.label || DEFAULT_PERSONA.dynamic_and_power.label);
    setEditActorSecret(persona?.dynamic_and_power?.actor_secret || DEFAULT_PERSONA.dynamic_and_power.actor_secret);
    setEditPowerBalance(persona?.dynamic_and_power?.power_balance || DEFAULT_PERSONA.dynamic_and_power.power_balance);
    onStartEdit?.();
  };

  const handleSave = () => {
    onSave?.({
      identity: {
        title: editTitle.trim(),
        brief: editBrief.trim(),
      },
      pronouns: editPronouns.trim(),
      nicknames: editNicknames.trim(),
      personality_vibe: editPersonality.trim(),
      main_quest: editMainQuest.trim(),
      dynamic_and_power: {
        label: editDynamicLabel.trim(),
        actor_secret: editActorSecret.trim(),
        power_balance: editPowerBalance.trim(),
      },
    });
  };

  const currentPersona = persona || DEFAULT_PERSONA;

  return (
    <div
      ref={cardRef}
      className="p-5 sm:p-6 rounded-2xl bg-[#121214]/95 backdrop-blur-2xl border border-white/10 flex flex-col gap-5 text-left relative overflow-hidden transition-all duration-200 hover:border-white/20"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2F3336]">
        <div className="flex items-center gap-2">
          <UserCheck size={16} className="text-[#EF264C]" />
          <h3 className="text-[15px] font-medium text-[#F2F2F5] tracking-wide">
            ตัวตนผู้เล่น & พลวัตอำนาจ (Player Persona & Power Dynamics)
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
            title="แก้ไขตัวตนผู้เล่น"
          >
            <Pencil size={13} />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-[#ACACB2]">ตำแหน่ง/บทบาทผู้เล่น (Player Title)</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#1D1D1F] border border-white/10 rounded-xl text-[#F2F2F5] text-[14px] outline-none focus:border-[#EF264C]/60"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-[#ACACB2]">สรรพนาม (Pronouns)</label>
              <input
                type="text"
                value={editPronouns}
                onChange={(e) => setEditPronouns(e.target.value)}
                className="w-full px-3 py-2 bg-[#1D1D1F] border border-white/10 rounded-xl text-[#F2F2F5] text-[14px] outline-none focus:border-[#EF264C]/60"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-[#ACACB2]">สรุปตัวตนผู้เล่น (Player Brief)</label>
            <textarea
              value={editBrief}
              onChange={(e) => setEditBrief(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-[#1D1D1F] border border-white/10 rounded-xl text-[#F2F2F5] text-[14px] outline-none focus:border-[#EF264C]/60 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-[#ACACB2]">ฉายาที่ถูกเรียก (Nicknames)</label>
              <input
                type="text"
                value={editNicknames}
                onChange={(e) => setEditNicknames(e.target.value)}
                className="w-full px-3 py-2 bg-[#1D1D1F] border border-white/10 rounded-xl text-[#F2F2F5] text-[14px] outline-none focus:border-[#EF264C]/60"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-[#ACACB2]">ลักษณะนิสัย (Personality Vibe)</label>
              <input
                type="text"
                value={editPersonality}
                onChange={(e) => setEditPersonality(e.target.value)}
                className="w-full px-3 py-2 bg-[#1D1D1F] border border-white/10 rounded-xl text-[#F2F2F5] text-[14px] outline-none focus:border-[#EF264C]/60"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-[#ACACB2]">เควสเอาชีวิตรอดหลัก (Main Quest)</label>
            <input
              type="text"
              value={editMainQuest}
              onChange={(e) => setEditMainQuest(e.target.value)}
              className="w-full px-3 py-2 bg-[#1D1D1F] border border-white/10 rounded-xl text-[#F2F2F5] text-[14px] outline-none focus:border-[#EF264C]/60"
            />
          </div>

          {/* Dynamic & Power */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-[#EF264C]/25 flex flex-col gap-3">
            <div className="text-[12px] font-medium text-[#EF264C] flex items-center gap-1.5">
              <ShieldAlert size={13} />
              <span>พลวัตอำนาจ & ความลับ (Dynamic & Hidden Secret)</span>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-[#ACACB2]">นิยามความสัมพันธ์ (Dynamic Label)</label>
              <input
                type="text"
                value={editDynamicLabel}
                onChange={(e) => setEditDynamicLabel(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#1D1D1F] border border-white/10 rounded-lg text-[#F2F2F5] text-[13px] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-[#ACACB2]">ความลับของ [ACTOR] ที่ผู้เล่นไม่รู้ (Actor Secret)</label>
              <textarea
                value={editActorSecret}
                onChange={(e) => setEditActorSecret(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 bg-[#1D1D1F] border border-white/10 rounded-lg text-[#F2F2F5] text-[13px] outline-none resize-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-[#ACACB2]">สมดุลอำนาจ (Power Balance)</label>
              <textarea
                value={editPowerBalance}
                onChange={(e) => setEditPowerBalance(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 bg-[#1D1D1F] border border-white/10 rounded-lg text-[#F2F2F5] text-[13px] outline-none resize-none"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Identity & Main Quest */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#1D1D1F] border border-white/5 flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wider text-[#ACACB2] font-medium">
                บทบาทผู้เล่น (Player Role)
              </span>
              <p className="text-[14px] text-[#F2F2F5] font-medium">
                {currentPersona.identity?.title}
              </p>
              <p className="text-[12.5px] text-[#ACACB2] leading-relaxed mt-0.5">
                {currentPersona.identity?.brief}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1D1D1F] border border-white/5 flex flex-col gap-1.5 justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#ACACB2] font-medium flex items-center gap-1">
                  <Target size={12} className="text-[#EF264C]" />
                  เควสเอาชีวิตรอด (Main Survival Quest)
                </span>
                <p className="text-[13px] text-[#F2F2F5] leading-relaxed mt-1">
                  {currentPersona.main_quest}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-white/5 text-[11.5px]">
                <span className="text-[#ACACB2]">ฉายา:</span>
                <span className="text-[#F2F2F5] font-medium">{currentPersona.nicknames}</span>
                <span className="text-[#ACACB2] ml-2">สรรพนาม:</span>
                <span className="text-[#F2F2F5]">{currentPersona.pronouns}</span>
              </div>
            </div>
          </div>

          {/* Personality Vibe */}
          <div className="px-3.5 py-2.5 rounded-xl bg-[#1D1D1F]/70 border border-white/5 flex items-center gap-2">
            <span className="text-[12px] text-[#ACACB2] shrink-0 font-medium">ลักษณะนิสัย:</span>
            <span className="text-[13px] text-[#F2F2F5]">{currentPersona.personality_vibe}</span>
          </div>

          {/* Dynamic & Power: Actor Secret & Balance */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#EF264C]/10 via-[#1D1D1F] to-[#121214] border border-[#EF264C]/30 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#EF264C]">
                <ShieldAlert size={14} />
                <span>พลวัตความสัมพันธ์: {currentPersona.dynamic_and_power?.label}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[#EF264C]/20 text-[#EF264C]">
                <Lock size={10} />
                <span>HIDDEN INTEL</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wider text-[#ACACB2]">
                ความลับของตัวละคร (Actor Secret):
              </span>
              <p className="text-[13px] text-[#F2F2F5] leading-relaxed bg-black/40 p-2.5 rounded-lg border border-white/5">
                {currentPersona.dynamic_and_power?.actor_secret}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wider text-[#ACACB2] flex items-center gap-1">
                <Scale size={11} className="text-[#EF264C]" />
                สมดุลอำนาจ (Power Balance):
              </span>
              <p className="text-[12.5px] text-[#ACACB2] leading-relaxed">
                {currentPersona.dynamic_and_power?.power_balance}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
