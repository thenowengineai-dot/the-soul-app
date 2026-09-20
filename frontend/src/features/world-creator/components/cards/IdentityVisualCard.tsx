import { useState, useEffect } from 'react';
import {
  Pencil,
  Check,
  Eye,
  Shirt,
  Sparkles,
  Plus,
  Trash2,
  BookmarkCheck,
  Glasses,
  Flame,
  Droplets,
  Hourglass,
  Hash,
} from 'lucide-react';
import type { VaultDraft } from '../../types';

interface IdentityVisualCardProps {
  draft: VaultDraft;
  onUpdateDraft?: (updated: Partial<VaultDraft>) => void;
  isEditable?: boolean;
}

interface BentoAnatomyItem {
  iconType: 'glasses' | 'hourglass' | 'flame' | 'droplets' | 'sparkle';
  title: string;
  detail: string;
}

interface OutfitItem {
  key: string;
  label: string;
  name: string;
  description: string;
}

export default function IdentityVisualCard({
  draft,
  onUpdateDraft,
  isEditable = true,
}: IdentityVisualCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  // 1. Header State: Name, Archetype, Hashtags
  const [name, setName] = useState(draft.title || 'มาฮิโระ (Mahiro)990');
  const [archetype, setArchetype] = useState(draft.archetype || 'The Cloaked Predator');
  const [hashtags, setHashtags] = useState<string[]>(() => {
    return draft.hashtags && draft.hashtags.length > 0
      ? draft.hashtags
      : ['#รุ่นพี่สาวแว่น', '#สายหมอกซ่อนรูป', '#GapMoeขั้นสุด', '#นักล่ากระหายพิษ', '#ตรรกะรีดพิษด้วยน้ำมังกร'];
  });
  const [newTagInput, setNewTagInput] = useState('');

  // 2. Bento Anatomy State (4 จุดเด่นสรีระและอัตลักษณ์)
  const [anatomyItems, setAnatomyItems] = useState<BentoAnatomyItem[]>(() => {
    const raw = draft.appearance?.anatomy_features || [];
    if (raw.length >= 4) {
      return [
        {
          iconType: 'glasses',
          title: 'แว่นตา & ดวงตา',
          detail: raw[0] || 'แว่นตากรอบโลหะหนาเตอะที่ปิดบังดวงตาสีดำขลับปลาบเยิ้มที่ซ่อนความต้องการเอาไว้ข้างใน',
        },
        {
          iconType: 'hourglass',
          title: 'ทรวดทรงนาฬิกาทราย',
          detail: raw[2] || 'รูปร่างนาฬิกาทรายสุดสะบึม (อกอวบใหญ่สะบึม สะโพกผึ่งผาย) ที่ซ่อนอยู่ภายใต้เสื้อผ้าตัวโคร่ง',
        },
        {
          iconType: 'flame',
          title: 'ผิวขาวน้ำนมไวต่อความร้อน',
          detail: raw[1] || 'ผิวขาวเนียนละเอียดดุจน้ำนมที่ขึ้นสีชมพูระเรื่ออย่างรวดเร็วเมื่อสัมผัสกับความร้อน',
        },
        {
          iconType: 'droplets',
          title: 'กลิ่นอาย & ไอน้ำซอกคอ',
          detail: raw[3] || 'ซอกคอและกระดูกไหปลาร้าที่มักมีเหงื่อและไอน้ำระเหยฟุ้งออกมา',
        },
      ];
    }
    return [
      {
        iconType: 'glasses',
        title: 'แว่นตา & ดวงตา',
        detail: 'แว่นตากรอบโลหะหนาเตอะที่ปิดบังดวงตาสีดำขลับปลาบเยิ้มที่ซ่อนความต้องการเอาไว้ข้างใน',
      },
      {
        iconType: 'hourglass',
        title: 'ทรวดทรงนาฬิกาทราย',
        detail: 'รูปร่างนาฬิกาทรายสุดสะบึม (อกอวบใหญ่สะบึม สะโพกผึ่งผาย) ที่ซ่อนอยู่ภายใต้เสื้อผ้าตัวโคร่ง',
      },
      {
        iconType: 'flame',
        title: 'ผิวขาวน้ำนมไวต่อความร้อน',
        detail: 'ผิวขาวเนียนละเอียดดุจน้ำนมที่ขึ้นสีชมพูระเรื่ออย่างรวดเร็วเมื่อสัมผัสกับความร้อน',
      },
      {
        iconType: 'droplets',
        title: 'กลิ่นอาย & ไอน้ำซอกคอ',
        detail: 'ซอกคอและกระดูกไหปลาร้าที่มักมีเหงื่อและไอน้ำระเหยฟุ้งออกมา',
      },
    ];
  });

  // 3. Wardrobe Vault State (ตู้เสื้อผ้าสลับชุด)
  const [outfits, setOutfits] = useState<OutfitItem[]>(() => {
    const w = (draft.appearance?.wardrobe || {}) as Record<string, string[] | undefined>;
    const list: OutfitItem[] = [];

    const o1 = w.outfit_1?.[0] || 'ชุดยูกาตะผ้าฝ้ายเนื้อหนาสีเข้มตัวโคร่งที่ดูแบนราบไร้ส่วนเว้าโค้ง พร้อมแว่นตากรอบหนาเตอะปิดบังใบหน้า';
    list.push({
      key: 'outfit_1',
      label: 'ชุดที่ 1',
      name: 'ชุดยูกาตะผ้าฝ้ายเนื้อหนาตัวโคร่ง',
      description: o1,
    });

    const o2 = w.outfit_2?.[0] || 'เสื้อเชิ้ตสีขาวและกระโปรงยาวสีทึบเรียบร้อย ทว่ายามเปียกฝนจะแนบเนื้อจนโปร่งแสง เผยให้เห็นบราเซียลูกไม้สีดำสนิทขัดกับผิวขาวจัด';
    list.push({
      key: 'outfit_2',
      label: 'ชุดที่ 2',
      name: 'เสื้อเชิ้ตขาวและกระโปรงยาว (โปร่งแสงยามเปียกฝน)',
      description: o2,
    });

    // Check additional outfits
    Object.keys(w).forEach((k) => {
      if (k !== 'outfit_1' && k !== 'outfit_2' && Array.isArray(w[k]) && w[k]!.length > 0) {
        const idx = list.length + 1;
        list.push({
          key: k,
          label: `ชุดที่ ${idx}`,
          name: w[k]![0].slice(0, 40),
          description: w[k]![0],
        });
      }
    });

    return list;
  });

  const [activeOutfitIndex, setActiveOutfitIndex] = useState(0);
  const [initialOutfitKey, setInitialOutfitKey] = useState(
    draft.starting_state?.initial_outfit_key || 'outfit_1'
  );

  // 4. Signature Postures State (ท่าประจำตัว 3 จังหวะ)
  const [postures, setPostures] = useState<string[]>(() => {
    const p = draft.appearance?.signature_postures || [];
    return p.length > 0
      ? p
      : [
          'การใช้นิ้วชี้ดันดั้งแว่นตาขึ้นเพื่อเก็บซ่อนสายตาหิวกระหายยามปั้นหน้าสุภาพเหนียมอาย',
          'ทิ้งตัวซบแผงอกหรือเกาะบ่าเหยื่อแน่นด้วยร่างกายท่อนล่างที่อ่อนแรงและสั่นเทาจากการเกร็งสะท้าน',
          'ท่านั่งพับเพียบเรียบร้อย แต่แอบจงใจขยับสะโพกบดเบียดพื้นหรือเกร็งหน้าขาหนีบเข้าหากัน',
        ];
  });

  const [initialPose, setInitialPose] = useState(
    draft.starting_state?.initial_a_pos || postures[0] || ''
  );

  // Sync when draft changes externally
  useEffect(() => {
    if (draft.title && draft.title !== name) {
      setName(draft.title);
    }
  }, [draft.title]);

  const handleSave = () => {
    setIsEditing(false);
    if (onUpdateDraft) {
      // Reassemble wardrobe map
      const wardrobeObj: Record<string, string[]> = {};
      outfits.forEach((item) => {
        wardrobeObj[item.key] = [item.description];
      });

      const anatomyFlat = anatomyItems.map((item) => item.detail);

      const updatedStartingState = {
        time: draft.starting_state?.time || 'ยามค่ำคืน',
        weather: draft.starting_state?.weather || 'แอร์เย็นสบาย',
        location: draft.starting_state?.location || 'ห้อง VIP บาร์หรู',
        initial_p_pos: draft.starting_state?.initial_p_pos || 'นั่งเอนตัวจิบเครื่องดื่ม',
        initial_a_pos: initialPose || postures[0] || '',
        initial_outfit_key: initialOutfitKey || outfits[0]?.key || 'outfit_1',
      };

      onUpdateDraft({
        title: name,
        archetype,
        hashtags,
        appearance: {
          wardrobe: wardrobeObj,
          anatomy_features: anatomyFlat,
          signature_postures: postures,
        },
        starting_state: updatedStartingState,
      });
    }
  };

  const handleAddHashtag = () => {
    if (!newTagInput.trim()) return;
    const tag = newTagInput.startsWith('#') ? newTagInput.trim() : `#${newTagInput.trim()}`;
    setHashtags([...hashtags, tag]);
    setNewTagInput('');
  };

  const handleRemoveHashtag = (idx: number) => {
    setHashtags(hashtags.filter((_, i) => i !== idx));
  };

  const handleAddNewOutfit = () => {
    const nextIdx = outfits.length + 1;
    const newKey = `outfit_${nextIdx}`;
    const newOutfit: OutfitItem = {
      key: newKey,
      label: `ชุดที่ ${nextIdx}`,
      name: `ชุดคอนเซปต์ใหม่ที่ ${nextIdx}`,
      description: 'ระบุรายละเอียดเครื่องแต่งกาย คัตติ้ง และวัสดุของชุดใหม่นี้...',
    };
    setOutfits([...outfits, newOutfit]);
    setActiveOutfitIndex(outfits.length);
  };

  const handleRemoveOutfit = (idx: number) => {
    if (outfits.length <= 1) return;
    const filtered = outfits.filter((_, i) => i !== idx);
    setOutfits(filtered);
    setActiveOutfitIndex(Math.max(0, idx - 1));
  };

  const handleAddPosture = () => {
    setPostures([...postures, 'ระบุท่าทางประจำตัวหรือภาษากายใหม่ที่ตัวละครชอบทำ...']);
  };

  const handleRemovePosture = (idx: number) => {
    if (postures.length <= 1) return;
    setPostures(postures.filter((_, i) => i !== idx));
  };

  const renderBentoIcon = (type: BentoAnatomyItem['iconType']) => {
    switch (type) {
      case 'glasses':
        return <Glasses size={18} className="text-[#EF264C]" strokeWidth={2} />;
      case 'hourglass':
        return <Hourglass size={18} className="text-amber-400" strokeWidth={2} />;
      case 'flame':
        return <Flame size={18} className="text-rose-400" strokeWidth={2} />;
      case 'droplets':
        return <Droplets size={18} className="text-sky-400" strokeWidth={2} />;
      default:
        return <Sparkles size={18} className="text-[#EF264C]" strokeWidth={2} />;
    }
  };

  const activeOutfit = outfits[activeOutfitIndex] || outfits[0];

  return (
    <div className="relative w-full rounded-[24px] bg-white/[0.04] hover:bg-white/[0.05] backdrop-blur-2xl border border-white/[0.08] hover:border-white/[0.14] p-6 sm:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 space-y-7">
      {/* ✦ TOP AMBIENT ACCENT LINE */}
      <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* ========================================================================= */}
      {/* 🏛️ TRAY 1: HEADER & IDENTITY (ใคร & บุคลิกหลัก) */}
      {/* ========================================================================= */}
      <div className="pb-6 border-b border-white/[0.07] flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#EF264C] bg-[#EF264C]/10 px-2.5 py-0.5 rounded-full border border-[#EF264C]/25">
              การ์ดที่ 1 • Identity & Visual
            </span>
            <span className="text-white/30 text-[11px]">✦ อัตลักษณ์ & สรีระ</span>
          </div>

          {isEditing ? (
            <div className="space-y-2 pt-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อตัวละคร"
                className="w-full bg-white/[0.06] border border-white/20 focus:border-[#EF264C]/60 rounded-xl px-3.5 py-1.5 text-[22px] font-bold text-[#F1F1F1] outline-none"
              />
              <input
                type="text"
                value={archetype}
                onChange={(e) => setArchetype(e.target.value)}
                placeholder="ฉายา หรือบทบาทแก่นแท้ (Archetype)"
                className="w-full bg-white/[0.04] border border-white/10 focus:border-white/25 rounded-lg px-3 py-1 text-[13px] text-[#AAAAAA] outline-none"
              />
            </div>
          ) : (
            <div>
              <h2 className="text-[24px] sm:text-[28px] font-bold text-[#F1F1F1] tracking-tight leading-tight">
                {name}
              </h2>
              <p className="text-[14px] text-[#AAAAAA] font-normal mt-0.5 flex items-center gap-2">
                <span className="text-white/40">บทบาท:</span>
                <span className="text-[#F1F1F1] font-medium">{archetype}</span>
              </p>
            </div>
          )}

          {/* Hashtags Section */}
          <div className="pt-2 flex flex-wrap items-center gap-1.5">
            {hashtags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-[12px] text-white/80 font-normal shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              >
                <Hash size={11} className="text-[#EF264C]" />
                <span>{tag.replace(/^#/, '')}</span>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleRemoveHashtag(idx)}
                    className="hover:text-red-400 text-white/40 ml-0.5 transition-colors cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}

            {isEditing && (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddHashtag();
                    }
                  }}
                  placeholder="เพิ่ม #แท็ก..."
                  className="bg-white/[0.04] border border-white/10 rounded-full px-3 py-1 text-[12px] text-[#F1F1F1] outline-none w-28"
                />
                <button
                  type="button"
                  onClick={handleAddHashtag}
                  className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-[12px] cursor-pointer"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Button: Edit / Save */}
        {isEditable && (
          <div className="shrink-0 self-start">
            {isEditing ? (
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white text-[13px] font-medium flex items-center gap-1.5 shadow-[0_2px_10px_rgba(239,38,76,0.35)] transition-all active:scale-95 cursor-pointer"
              >
                <Check size={14} strokeWidth={2.4} />
                <span>บันทึกข้อมูล</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 text-white/85 hover:text-white text-[12.5px] font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              >
                <Pencil size={12} strokeWidth={2} />
                <span>แก้ไขการ์ด</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ⏳ TRAY 2: ANATOMY BENTO GRID (4 กล่องสรีระ เข้าใจใน 2 วินาที) */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#F1F1F1]">
            <Eye size={15} className="text-[#EF264C]" />
            <span>สรีระ & เอกลักษณ์ทางกายภาพ (Anatomy Bento)</span>
          </div>
          <span className="text-[11px] text-white/40 font-light">4 จุดเด่นสะดุดตา</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {anatomyItems.map((item, idx) => (
            <div
              key={idx}
              className="rounded-[20px] bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/12 p-4 sm:p-5 transition-all flex items-start gap-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                {renderBentoIcon(item.iconType)}
              </div>
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const updated = [...anatomyItems];
                        updated[idx].title = e.target.value;
                        setAnatomyItems(updated);
                      }}
                      className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-[13px] font-semibold text-[#F1F1F1] outline-none"
                    />
                    <textarea
                      rows={3}
                      value={item.detail}
                      onChange={(e) => {
                        const updated = [...anatomyItems];
                        updated[idx].detail = e.target.value;
                        setAnatomyItems(updated);
                      }}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1.5 text-[12.5px] text-[#AAAAAA] outline-none leading-relaxed resize-none"
                    />
                  </div>
                ) : (
                  <>
                    <h4 className="text-[14px] font-semibold text-[#F1F1F1] tracking-tight">
                      {item.title}
                    </h4>
                    <p className="text-[13px] text-[#AAAAAA] mt-1 leading-relaxed font-normal">
                      {item.detail}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 👗 TRAY 3: THE WARDROBE VAULT (ตู้เสื้อผ้าสลับชุดส่วนตัว) */}
      {/* ========================================================================= */}
      <div className="rounded-[20px] bg-white/[0.03] border border-white/[0.06] p-5 sm:p-6 space-y-4">
        {/* Wardrobe Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Shirt size={16} className="text-[#EF264C]" />
            <span className="text-[13.5px] font-semibold text-[#F1F1F1]">
              ตู้เสื้อผ้าส่วนตัว (The Wardrobe Vault)
            </span>
          </div>

          {/* Outfit Pill Switchers */}
          <div className="flex flex-wrap items-center gap-1.5">
            {outfits.map((outfit, idx) => {
              const isActive = idx === activeOutfitIndex;
              const isInitial = outfit.key === initialOutfitKey;

              return (
                <button
                  key={outfit.key}
                  type="button"
                  onClick={() => setActiveOutfitIndex(idx)}
                  className={`px-3 py-1 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                      : 'bg-white/[0.04] text-[#BEBEC4] hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {isInitial && <span className="text-[#EF264C] text-[10px]">✦</span>}
                  <span>{outfit.label}</span>
                </button>
              );
            })}

            {isEditing && (
              <button
                type="button"
                onClick={handleAddNewOutfit}
                className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-dashed border-white/20 text-[11.5px] text-white/70 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus size={11} /> เพิ่มชุดใหม่
              </button>
            )}
          </div>
        </div>

        {/* Selected Outfit Card Stage */}
        <div className="rounded-[18px] bg-white/[0.02] border border-white/[0.05] p-4 sm:p-5 flex flex-col justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#EF264C] bg-[#EF264C]/10 px-2 py-0.5 rounded-full">
                  {activeOutfit.label}
                </span>
                {activeOutfit.key === initialOutfitKey ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <BookmarkCheck size={12} /> ชุดเริ่มต้นตอนเริ่มเกม
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setInitialOutfitKey(activeOutfit.key)}
                    className="text-[11px] text-white/40 hover:text-white underline cursor-pointer transition-colors"
                  >
                    ตั้งเป็นชุดเริ่มต้น
                  </button>
                )}
              </div>

              {isEditing && outfits.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOutfit(activeOutfitIndex)}
                  className="text-[11px] text-red-400/70 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 size={12} /> ลบชุดนี้
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  value={activeOutfit.name}
                  onChange={(e) => {
                    const updated = [...outfits];
                    updated[activeOutfitIndex].name = e.target.value;
                    setOutfits(updated);
                  }}
                  placeholder="ชื่อสไตล์ชุดย่อ"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1.5 text-[14px] font-medium text-[#F1F1F1] outline-none"
                />
                <textarea
                  rows={3}
                  value={activeOutfit.description}
                  onChange={(e) => {
                    const updated = [...outfits];
                    updated[activeOutfitIndex].description = e.target.value;
                    setOutfits(updated);
                  }}
                  placeholder="รายละเอียดคัตติ้ง เนื้อผ้า และลูกเล่นของชุด..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1.5 text-[13px] text-[#AAAAAA] outline-none leading-relaxed resize-none"
                />
              </div>
            ) : (
              <div>
                <h5 className="text-[15px] font-semibold text-[#F1F1F1] tracking-tight">
                  {activeOutfit.name}
                </h5>
                <p className="text-[13.5px] text-[#AAAAAA] mt-1.5 leading-relaxed font-normal">
                  {activeOutfit.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🎭 TRAY 4: SIGNATURE POSES DECK (ท่าประจำตัว 3 จังหวะ) */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#F1F1F1]">
            <Sparkles size={15} className="text-[#EF264C]" />
            <span>ท่าทางประจำตัว & กิริยาเฉพาะ (Signature Poses Deck)</span>
          </div>
          <span className="text-[11px] text-white/40 font-light">ภาษากายในฉากแชท</span>
        </div>

        <div className="space-y-2.5">
          {postures.map((poseText, idx) => {
            const isInitial = poseText === initialPose;

            return (
              <div
                key={idx}
                className="rounded-[18px] bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] p-4 flex items-start gap-3.5 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                {/* Number Badge */}
                <span className="text-[12px] font-mono font-bold text-[#EF264C] bg-[#EF264C]/10 w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border border-[#EF264C]/25">
                  0{idx + 1}
                </span>

                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={poseText}
                      onChange={(e) => {
                        const updated = [...postures];
                        updated[idx] = e.target.value;
                        setPostures(updated);
                      }}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1 text-[13px] text-[#F1F1F1] outline-none leading-relaxed resize-none"
                    />
                  ) : (
                    <p className="text-[13.5px] text-[#F1F1F1] leading-relaxed font-normal">
                      {poseText}
                    </p>
                  )}

                  <div className="mt-2 flex items-center gap-3">
                    {isInitial ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <BookmarkCheck size={12} /> ท่าทางเปิดตัวเริ่มต้น (HUD Active)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setInitialPose(poseText)}
                        className="text-[11px] text-white/40 hover:text-white underline cursor-pointer transition-colors"
                      >
                        ตั้งเป็นท่าเปิดตัวใน HUD
                      </button>
                    )}

                    {isEditing && postures.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePosture(idx)}
                        className="text-[11px] text-red-400/70 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors ml-auto"
                      >
                        <Trash2 size={12} /> ลบท่านี้
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isEditing && (
            <button
              type="button"
              onClick={handleAddPosture}
              className="w-full py-2.5 rounded-[16px] bg-white/[0.02] hover:bg-white/[0.05] border border-dashed border-white/15 text-[12.5px] text-white/70 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus size={13} /> เพิ่มท่าทางประจำตัวใหม่
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
