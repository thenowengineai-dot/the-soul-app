import { useState, useEffect } from 'react';
import {
  Pencil,
  Check,
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
  Eye,
} from 'lucide-react';
import type { VaultDraft } from '../../types';

interface IdentityVisualCardProps {
  draft: VaultDraft;
  onUpdateDraft?: (updated: Partial<VaultDraft>) => void;
  isEditable?: boolean;
}

interface AnatomyComplication {
  iconType: 'glasses' | 'hourglass' | 'flame' | 'droplets';
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

  // 1. Identity State: Name, Archetype, Quote, Hashtags
  const [name, setName] = useState(draft.title || 'มาฮิโระ (Mahiro) 990');
  const [archetype, setArchetype] = useState(draft.archetype || 'The Cloaked Predator');
  const [quote, setQuote] = useState(
    draft.quote ||
      '"อย่าขยับสิคะ... ถ้าขยับพิษจากละอองเกสรจะยิ่งแล่นเข้าสู่กระแสเลือดนะ ให้รุ่นพี่ช่วยรีดมันออกจะดีกว่า..."'
  );
  const [hashtags, setHashtags] = useState<string[]>(() => {
    return draft.hashtags && draft.hashtags.length > 0
      ? draft.hashtags
      : ['#รุ่นพี่สาวแว่น', '#สายหมอกซ่อนรูป', '#GapMoeขั้นสุด', '#นักล่ากระหายพิษ', '#ตรรกะรีดพิษด้วยน้ำมังกร'];
  });
  const [newTagInput, setNewTagInput] = useState('');

  // 2. Anatomy Complications (4 Visual Hallmarks in Apple Watch style)
  const [anatomyItems, setAnatomyItems] = useState<AnatomyComplication[]>(() => {
    const raw = draft.appearance?.anatomy_features || [];
    return [
      {
        iconType: 'glasses',
        title: 'แว่นตา & ดวงตา',
        detail: raw[0] || 'แว่นกรอบหนาเตอะ ปิดบังดวงตาสีดำขลับปลาบเยิ้มที่ซ่อนความหิวกระหาย',
      },
      {
        iconType: 'hourglass',
        title: 'สัดส่วนนาฬิกาทราย',
        detail: raw[2] || 'อกอวบใหญ่สะบึม สะโพกผึ่งผาย ซ่อนรูปอยู่ใต้เสื้อผ้าตัวโคร่ง',
      },
      {
        iconType: 'flame',
        title: 'ผิวขาวน้ำนม',
        detail: raw[1] || 'เนียนละเอียด ขึ้นสีชมพูระเรื่อทันทีเมื่อสัมผัสความร้อน',
      },
      {
        iconType: 'droplets',
        title: 'สัมผัส & กลิ่นอาย',
        detail: raw[3] || 'ซอกคอและกระดูกไหปลาร้ามีเหงื่อและไอน้ำระเหยฟุ้งออกมา',
      },
    ];
  });

  // 3. Wardrobe State (Tangible Closet Deck)
  const [outfits, setOutfits] = useState<OutfitItem[]>(() => {
    const w = (draft.appearance?.wardrobe || {}) as Record<string, string[] | undefined>;
    const list: OutfitItem[] = [];

    const o1 = w.outfit_1?.[0] || 'ชุดยูกาตะผ้าฝ้ายเนื้อหนาสีเข้มตัวโคร่งที่ดูแบนราบไร้ส่วนเว้าโค้ง พร้อมแว่นตากรอบหนาเตอะปิดบังใบหน้า';
    list.push({
      key: 'outfit_1',
      label: 'ยูกาตะตัวโคร่ง',
      name: 'ชุดยูกาตะผ้าฝ้ายเนื้อหนาตัวโคร่ง',
      description: o1,
    });

    const o2 = w.outfit_2?.[0] || 'เสื้อเชิ้ตสีขาวและกระโปรงยาวสีทึบเรียบร้อย ทว่ายามเปียกฝนจะแนบเนื้อจนโปร่งแสง เผยให้เห็นบราเซียลูกไม้สีดำสนิทขัดกับผิวขาวจัด';
    list.push({
      key: 'outfit_2',
      label: 'เชิ้ตขาวเปียกฝน',
      name: 'เสื้อเชิ้ตขาวและกระโปรงยาว (โปร่งแสงยามเปียกฝน)',
      description: o2,
    });

    // Additional outfits if present
    Object.keys(w).forEach((k) => {
      if (k !== 'outfit_1' && k !== 'outfit_2' && Array.isArray(w[k]) && w[k]!.length > 0) {
        const idx = list.length + 1;
        list.push({
          key: k,
          label: `ชุดคอนเซปต์ ${idx}`,
          name: w[k]![0].slice(0, 35),
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

  // 4. Signature Poses State (Dynamic Island Horizontal Dock)
  const [postures, setPostures] = useState<string[]>(() => {
    const p = draft.appearance?.signature_postures || [];
    return p.length > 0
      ? p
      : [
          'การใช้นิ้วชี้ดันดั้งแว่นตาขึ้น เพื่อเก็บซ่อนสายตาหิวกระหายยามปั้นหน้าสุภาพเหนียมอาย',
          'ทิ้งตัวซบแผงอกหรือเกาะบ่าเหยื่อแน่น ด้วยร่างกายท่อนล่างที่อ่อนแรงและสั่นเทาจากการเกร็งสะท้าน',
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
    if (draft.quote && draft.quote !== quote) {
      setQuote(draft.quote);
    }
  }, [draft.title, draft.quote]);

  const handleSave = () => {
    setIsEditing(false);
    if (onUpdateDraft) {
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
        quote,
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
      name: `ชุดคอลเลกชันใหม่ ${nextIdx}`,
      description: 'ระบุรายละเอียดเนื้อผ้า สไตล์ และลูกเล่นของชุดนี้...',
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
    setPostures([...postures, 'ระบุภาษากายหรือท่าทางประจำตัวใหม่...']);
  };

  const handleRemovePosture = (idx: number) => {
    if (postures.length <= 1) return;
    setPostures(postures.filter((_, i) => i !== idx));
  };

  const renderComplicationIcon = (type: AnatomyComplication['iconType']) => {
    switch (type) {
      case 'glasses':
        return <Glasses size={16} className="text-[#EF264C]" strokeWidth={2.2} />;
      case 'hourglass':
        return <Hourglass size={16} className="text-amber-400" strokeWidth={2.2} />;
      case 'flame':
        return <Flame size={16} className="text-rose-400" strokeWidth={2.2} />;
      case 'droplets':
        return <Droplets size={16} className="text-sky-400" strokeWidth={2.2} />;
    }
  };

  const activeOutfit = outfits[activeOutfitIndex] || outfits[0];

  return (
    <div className="w-full">
      {/* ========================================================================= */}
      {/* ✦ ASYMMETRICAL APPLE BENTO GRID (12-COL SPATIAL CANVAS)                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5 sm:gap-6">

        {/* ======================================================================= */}
        {/* 🏛️ WIDGET 1: CHARACTER IDENTITY (Top-Left, 7 Cols on Desktop)          */}
        {/* ======================================================================= */}
        <div className="col-span-1 md:col-span-2 xl:col-span-7 rounded-[28px] bg-[#141416]/90 hover:bg-[#18181b]/95 backdrop-blur-3xl border border-white/[0.12] hover:border-white/20 p-6 sm:p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_16px_36px_rgba(0,0,0,0.5)] transition-all duration-300 relative group overflow-hidden flex flex-col justify-between min-h-[280px]">
          {/* Top Specular Hairline */}
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

          {/* Top Row: Archetype Pill & Edit Button */}
          <div className="flex items-center justify-between gap-3 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#EF264C]" />
              {isEditing ? (
                <input
                  type="text"
                  value={archetype}
                  onChange={(e) => setArchetype(e.target.value)}
                  placeholder="บทบาทแก่นแท้ (Archetype)"
                  className="bg-white/[0.06] border border-white/15 focus:border-[#EF264C]/60 rounded-full px-3 py-0.5 text-[12px] text-[#F1F1F1] outline-none"
                />
              ) : (
                <span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[12px] font-medium text-[#BEBEC4]">
                  {archetype}
                </span>
              )}
            </div>

            {isEditable && (
              <div>
                {isEditing ? (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-3.5 py-1.5 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-[0_2px_8px_rgba(239,38,76,0.35)] transition-all active:scale-95 cursor-pointer"
                  >
                    <Check size={13} strokeWidth={2.4} />
                    <span>บันทึก</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 text-white/80 hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    title="แก้ไขข้อมูล"
                  >
                    <Pencil size={13} strokeWidth={2} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Core Body: Big Name & Quote */}
          <div className="py-2 space-y-2">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ชื่อตัวละคร"
                  className="w-full bg-white/[0.06] border border-white/20 focus:border-[#EF264C]/60 rounded-xl px-3 py-1.5 text-[24px] font-bold text-[#F1F1F1] outline-none"
                />
                <textarea
                  rows={2}
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="คำพูดตัวละคร / ประโยคแก่นแท้..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1 text-[13px] text-[#AAAAAA] outline-none leading-relaxed resize-none"
                />
              </div>
            ) : (
              <div>
                <h1 className="text-[28px] sm:text-[34px] font-bold text-[#F1F1F1] tracking-tight leading-tight">
                  {name}
                </h1>
                <p className="text-[13.5px] text-[#A1A1A8] mt-1.5 leading-relaxed font-normal italic line-clamp-2">
                  {quote}
                </p>
              </div>
            )}
          </div>

          {/* Bottom: Hashtag Capsules */}
          <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-1.5">
            {hashtags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-[11.5px] text-white/80 font-normal shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              >
                <Hash size={10} className="text-[#EF264C]" />
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
              <div className="flex items-center gap-1">
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
                  placeholder="+ แท็ก..."
                  className="bg-white/[0.04] border border-white/10 rounded-full px-2.5 py-0.5 text-[11px] text-[#F1F1F1] outline-none w-20"
                />
                <button
                  type="button"
                  onClick={handleAddHashtag}
                  className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-[11px] cursor-pointer"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 👗 WIDGET 2: THE WARDROBE CLOSET (Top-Right, 5 Cols - Tangible Square)  */}
        {/* ======================================================================= */}
        <div className="col-span-1 md:col-span-2 xl:col-span-5 rounded-[28px] bg-[#141416]/90 hover:bg-[#18181b]/95 backdrop-blur-3xl border border-white/[0.12] hover:border-white/20 p-6 sm:p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_16px_36px_rgba(0,0,0,0.5)] transition-all duration-300 relative group overflow-hidden flex flex-col justify-between min-h-[280px]">
          {/* Top Specular Hairline */}
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

          {/* Header: Closet Icon & Hanger Switcher Tabs */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                <Shirt size={14} className="text-[#EF264C]" />
              </div>
              <span className="text-[14px] font-semibold text-[#F1F1F1] tracking-tight">
                Wardrobe
              </span>
            </div>

            {/* Closet Hanger Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {outfits.map((outfit, idx) => {
                const isActive = idx === activeOutfitIndex;
                const isInitial = outfit.key === initialOutfitKey;

                return (
                  <button
                    key={outfit.key}
                    type="button"
                    onClick={() => setActiveOutfitIndex(idx)}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white/15 text-white border border-white/25 shadow-sm'
                        : 'bg-white/[0.04] text-[#BEBEC4] hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    {isInitial && <span className="text-[#EF264C] text-[9px]">✦</span>}
                    <span>{outfit.label}</span>
                  </button>
                );
              })}

              {isEditing && (
                <button
                  type="button"
                  onClick={handleAddNewOutfit}
                  className="w-6 h-6 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-dashed border-white/20 text-white flex items-center justify-center text-[12px] cursor-pointer"
                >
                  <Plus size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Tangible Garment Card Swatch */}
          <div className="my-3 rounded-[20px] bg-white/[0.025] border border-white/[0.06] p-4 flex-1 flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-[#F1F1F1] tracking-tight">
                  {activeOutfit.name}
                </span>
              </div>

              {activeOutfit.key === initialOutfitKey ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10.5px] font-medium">
                  <BookmarkCheck size={11} /> ชุดเริ่มต้น
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setInitialOutfitKey(activeOutfit.key)}
                  className="text-[10.5px] text-white/40 hover:text-white underline cursor-pointer transition-colors"
                >
                  ตั้งเป็นชุดเริ่มต้น
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-1.5 pt-1">
                <input
                  type="text"
                  value={activeOutfit.name}
                  onChange={(e) => {
                    const updated = [...outfits];
                    updated[activeOutfitIndex].name = e.target.value;
                    setOutfits(updated);
                  }}
                  placeholder="ชื่อสไตล์ชุด"
                  className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-1 text-[13px] font-medium text-[#F1F1F1] outline-none"
                />
                <textarea
                  rows={2}
                  value={activeOutfit.description}
                  onChange={(e) => {
                    const updated = [...outfits];
                    updated[activeOutfitIndex].description = e.target.value;
                    setOutfits(updated);
                  }}
                  placeholder="รายละเอียดเนื้อผ้า คัตติ้ง..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1 text-[12px] text-[#AAAAAA] outline-none leading-relaxed resize-none"
                />
              </div>
            ) : (
              <p className="text-[12.5px] text-[#AAAAAA] leading-relaxed font-normal line-clamp-3">
                {activeOutfit.description}
              </p>
            )}

            {isEditing && outfits.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveOutfit(activeOutfitIndex)}
                className="self-end text-[11px] text-red-400/70 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors pt-1"
              >
                <Trash2 size={11} /> ลบชุดนี้
              </button>
            )}
          </div>

          {/* Subtractive Micro Footnote */}
          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-white/35 font-light">
            <span>{outfits.length} ชุดในตู้</span>
            <span className="text-white/20">✦ Spatial Closet</span>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* ⏳ WIDGET 3: ANATOMY COMPLICATIONS (Bottom-Left, 5 Cols - 2x2 Comps)   */}
        {/* ======================================================================= */}
        <div className="col-span-1 md:col-span-2 xl:col-span-5 rounded-[28px] bg-[#141416]/90 hover:bg-[#18181b]/95 backdrop-blur-3xl border border-white/[0.12] hover:border-white/20 p-6 sm:p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_16px_36px_rgba(0,0,0,0.5)] transition-all duration-300 relative group overflow-hidden flex flex-col justify-between min-h-[280px]">
          {/* Top Specular Hairline */}
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                <Eye size={14} className="text-[#EF264C]" />
              </div>
              <span className="text-[14px] font-semibold text-[#F1F1F1] tracking-tight">
                Anatomy
              </span>
            </div>
            <span className="text-[11px] text-white/35 font-mono">4 จุดเด่น</span>
          </div>

          {/* 2x2 Grid of Complications */}
          <div className="my-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
            {anatomyItems.map((item, idx) => (
              <div
                key={idx}
                className="rounded-[18px] bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] p-3 flex flex-col justify-between gap-1.5 transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                    {renderComplicationIcon(item.iconType)}
                  </div>
                  <span className="text-[12px] font-semibold text-[#F1F1F1] tracking-tight truncate">
                    {item.title}
                  </span>
                </div>

                {isEditing ? (
                  <textarea
                    rows={2}
                    value={item.detail}
                    onChange={(e) => {
                      const updated = [...anatomyItems];
                      updated[idx].detail = e.target.value;
                      setAnatomyItems(updated);
                    }}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-2 py-1 text-[11px] text-[#AAAAAA] outline-none leading-relaxed resize-none"
                  />
                ) : (
                  <p className="text-[11.5px] text-[#AAAAAA] leading-relaxed font-normal line-clamp-2">
                    {item.detail}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Subtractive Micro Footnote */}
          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-white/35 font-light">
            <span>Visual Complications</span>
            <span className="text-white/20">✦ Apple Watch Style</span>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 🎭 WIDGET 4: SIGNATURE POSES (Bottom-Right, 7 Cols - Dynamic Island)   */}
        {/* ======================================================================= */}
        <div className="col-span-1 md:col-span-2 xl:col-span-7 rounded-[28px] bg-[#141416]/90 hover:bg-[#18181b]/95 backdrop-blur-3xl border border-white/[0.12] hover:border-white/20 p-6 sm:p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_16px_36px_rgba(0,0,0,0.5)] transition-all duration-300 relative group overflow-hidden flex flex-col justify-between min-h-[280px]">
          {/* Top Specular Hairline */}
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                <Sparkles size={14} className="text-[#EF264C]" />
              </div>
              <span className="text-[14px] font-semibold text-[#F1F1F1] tracking-tight">
                Signature Poses
              </span>
            </div>

            <span className="text-[11px] text-white/35 font-mono">
              {postures.length} ภาษากาย
            </span>
          </div>

          {/* Stacked Dynamic Island Capsule Rows */}
          <div className="my-2.5 space-y-2 flex-1 flex flex-col justify-center">
            {postures.map((poseText, idx) => {
              const isInitial = poseText === initialPose;

              return (
                <div
                  key={idx}
                  onClick={() => !isEditing && setInitialPose(poseText)}
                  className={`rounded-[18px] p-3 flex items-center gap-3 transition-all cursor-pointer ${
                    isInitial
                      ? 'bg-white/[0.08] border border-white/20 shadow-sm'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05]'
                  }`}
                >
                  {/* Number Badge */}
                  <span
                    className={`text-[11px] font-mono font-bold w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isInitial
                        ? 'bg-[#EF264C] text-white'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    0{idx + 1}
                  </span>

                  {/* Pose Text */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <textarea
                        rows={1}
                        value={poseText}
                        onChange={(e) => {
                          const updated = [...postures];
                          updated[idx] = e.target.value;
                          setPostures(updated);
                        }}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-2 py-0.5 text-[12px] text-[#F1F1F1] outline-none resize-none"
                      />
                    ) : (
                      <p className="text-[12.5px] text-[#E0E0E4] leading-relaxed font-normal line-clamp-1">
                        {poseText}
                      </p>
                    )}
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0 flex items-center gap-2">
                    {isInitial ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10.5px] font-medium">
                        <BookmarkCheck size={11} /> HUD Active
                      </span>
                    ) : (
                      <span className="text-[10.5px] text-white/30 group-hover:text-white/60 transition-colors">
                        แตะเพื่อเลือก
                      </span>
                    )}

                    {isEditing && postures.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePosture(idx);
                        }}
                        className="text-[11px] text-red-400/70 hover:text-red-300 p-1 cursor-pointer"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {isEditing && (
              <button
                type="button"
                onClick={handleAddPosture}
                className="w-full py-2 rounded-[14px] bg-white/[0.02] hover:bg-white/[0.05] border border-dashed border-white/15 text-[11.5px] text-white/70 hover:text-white flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Plus size={11} /> เพิ่มท่าทางใหม่
              </button>
            )}
          </div>

          {/* Subtractive Micro Footnote */}
          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-white/35 font-light">
            <span>Dynamic Kinematics</span>
            <span className="text-white/20">✦ Dynamic Island Rows</span>
          </div>
        </div>

      </div>
    </div>
  );
}
