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
} from 'lucide-react';
import type { VaultDraft } from '../../types';

interface IdentityVisualCardProps {
  draft: VaultDraft;
  onUpdateDraft?: (updated: Partial<VaultDraft>) => void;
  isEditable?: boolean;
}

interface BentoAnatomyItem {
  iconType: 'glasses' | 'hourglass' | 'flame' | 'droplets' | 'sparkle';
  category: string;
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
  const [name, setName] = useState(draft.title || 'มาฮิโระ (Mahiro) 990');
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
    return [
      {
        iconType: 'glasses',
        category: 'สายตา & แว่น',
        title: 'แว่นตา & ดวงตา',
        detail: raw[0] || 'แว่นตากรอบโลหะหนาเตอะที่ปิดบังดวงตาสีดำขลับปลาบเยิ้มที่ซ่อนความต้องการเอาไว้ข้างใน',
      },
      {
        iconType: 'hourglass',
        category: 'สัดส่วนสรีระ',
        title: 'ทรวดทรงนาฬิกาทราย',
        detail: raw[2] || 'รูปร่างนาฬิกาทรายสุดสะบึม (อกอวบใหญ่สะบึม สะโพกผึ่งผาย) ที่ซ่อนอยู่ภายใต้เสื้อผ้าตัวโคร่ง',
      },
      {
        iconType: 'flame',
        category: 'ผิวพรรณ & อุณหภูมิ',
        title: 'ผิวขาวน้ำนมไวต่อความร้อน',
        detail: raw[1] || 'ผิวขาวเนียนละเอียดดุจน้ำนมที่ขึ้นสีชมพูระเรื่ออย่างรวดเร็วเมื่อสัมผัสกับความร้อน',
      },
      {
        iconType: 'droplets',
        category: 'สัมผัส & กลิ่นอาย',
        title: 'กลิ่นอาย & ไอน้ำซอกคอ',
        detail: raw[3] || 'ซอกคอและกระดูกไหปลาร้าที่มักมีเหงื่อและไอน้ำระเหยฟุ้งออกมา',
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
        return <Glasses size={17} className="text-[#EF264C]" strokeWidth={2} />;
      case 'hourglass':
        return <Hourglass size={17} className="text-amber-400" strokeWidth={2} />;
      case 'flame':
        return <Flame size={17} className="text-rose-400" strokeWidth={2} />;
      case 'droplets':
        return <Droplets size={17} className="text-sky-400" strokeWidth={2} />;
      default:
        return <Sparkles size={17} className="text-[#EF264C]" strokeWidth={2} />;
    }
  };

  const activeOutfit = outfits[activeOutfitIndex] || outfits[0];

  return (
    <div className="w-full space-y-4">
      {/* ========================================================================= */}
      {/* ✦ BENTO GRID: 4-6 COLS RESPONSIVE LAYOUT (MACOS / IPADOS SPATIAL STYLE) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 sm:gap-4">

        {/* ======================================================================= */}
        {/* 🏛️ WIDGET 1: IDENTITY & ARCHETYPE HERO WIDGET (Span 2 Cols on Desktop) */}
        {/* ======================================================================= */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2 rounded-[22px] bg-white/[0.04] hover:bg-white/[0.06] backdrop-blur-2xl border border-white/[0.08] hover:border-white/[0.14] p-5 flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 relative group overflow-hidden min-h-[220px]">
          {/* Subtle Top Ambient Accent */}
          <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          {/* Header Row: Badge & Quick Edit Button */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#EF264C] bg-[#EF264C]/10 px-2.5 py-0.5 rounded-full border border-[#EF264C]/25">
                การ์ดที่ 1 • อัตลักษณ์
              </span>
              <span className="text-white/30 text-[11px] hidden sm:inline">✦ แก่นแท้</span>
            </div>

            {isEditable && (
              <div>
                {isEditing ? (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-3 py-1 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white text-[11.5px] font-medium flex items-center gap-1.5 shadow-[0_2px_8px_rgba(239,38,76,0.35)] transition-all active:scale-95 cursor-pointer"
                  >
                    <Check size={12} strokeWidth={2.4} />
                    <span>บันทึก</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 text-white/85 hover:text-white text-[11.5px] font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  >
                    <Pencil size={11} strokeWidth={2} />
                    <span>แก้ไข</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Middle: Character Name & Core Archetype */}
          <div className="py-2.5 space-y-1.5">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ชื่อตัวละคร"
                  className="w-full bg-white/[0.06] border border-white/20 focus:border-[#EF264C]/60 rounded-xl px-3 py-1.5 text-[20px] font-bold text-[#F1F1F1] outline-none"
                />
                <input
                  type="text"
                  value={archetype}
                  onChange={(e) => setArchetype(e.target.value)}
                  placeholder="ฉายา หรือบทบาทแก่นแท้ (Archetype)"
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-white/25 rounded-lg px-2.5 py-1 text-[12.5px] text-[#AAAAAA] outline-none"
                />
              </div>
            ) : (
              <div>
                <h2 className="text-[22px] sm:text-[24px] font-bold text-[#F1F1F1] tracking-tight leading-tight">
                  {name}
                </h2>
                <p className="text-[13px] text-[#AAAAAA] font-normal mt-0.5 flex items-center gap-1.5">
                  <span className="text-white/40">บทบาท:</span>
                  <span className="text-[#F1F1F1] font-medium">{archetype}</span>
                </p>
              </div>
            )}

            {/* Hashtags Pills */}
            <div className="pt-1.5 flex flex-wrap items-center gap-1.5">
              {hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] text-white/80 font-normal shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
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

          {/* Bottom Summary Bar */}
          <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-white/35 font-light">
            <span>4 จุดเด่นสรีระ</span>
            <span>{outfits.length} ชุดในตู้</span>
            <span>{postures.length} ท่าทาง</span>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* ⏳ WIDGETS 2-5: THE 4 ANATOMY MINI-WIDGETS (1 Col Each on Desktop)     */}
        {/* ======================================================================= */}
        {anatomyItems.map((item, idx) => (
          <div
            key={idx}
            className="col-span-1 rounded-[22px] bg-white/[0.04] hover:bg-white/[0.06] backdrop-blur-2xl border border-white/[0.08] hover:border-white/[0.14] p-4 sm:p-4.5 flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 relative group overflow-hidden min-h-[200px]"
          >
            {/* Ambient Top Hairline */}
            <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

            {/* Widget Header: Icon + Category Chip */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/[0.05]">
              <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                {renderBentoIcon(item.iconType)}
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 bg-white/[0.03] px-2 py-0.5 rounded-full border border-white/[0.05]">
                {item.category}
              </span>
            </div>

            {/* Widget Body: Title + Detail */}
            <div className="py-2 flex-1 flex flex-col justify-center min-w-0">
              {isEditing ? (
                <div className="space-y-1.5 w-full">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...anatomyItems];
                      updated[idx].title = e.target.value;
                      setAnatomyItems(updated);
                    }}
                    className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-2 py-0.5 text-[12.5px] font-semibold text-[#F1F1F1] outline-none"
                  />
                  <textarea
                    rows={3}
                    value={item.detail}
                    onChange={(e) => {
                      const updated = [...anatomyItems];
                      updated[idx].detail = e.target.value;
                      setAnatomyItems(updated);
                    }}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-2 py-1 text-[11.5px] text-[#AAAAAA] outline-none leading-relaxed resize-none"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <h4 className="text-[13px] font-semibold text-[#F1F1F1] tracking-tight truncate">
                    {item.title}
                  </h4>
                  <p className="text-[12px] text-[#AAAAAA] leading-relaxed font-normal line-clamp-4 hover:line-clamp-none transition-all">
                    {item.detail}
                  </p>
                </div>
              )}
            </div>

            {/* Micro Indicator Footnote */}
            <div className="pt-1.5 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-white/30 font-light">
              <span>จุดเด่น 0{idx + 1}</span>
              <span className="text-white/20">✦ Visual DNA</span>
            </div>
          </div>
        ))}

        {/* ======================================================================= */}
        {/* 👗 WIDGET 6: THE WARDROBE VAULT WIDGET (Span 3 Cols on Desktop)        */}
        {/* ======================================================================= */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-3 rounded-[22px] bg-white/[0.04] hover:bg-white/[0.06] backdrop-blur-2xl border border-white/[0.08] hover:border-white/[0.14] p-5 flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 relative group overflow-hidden min-h-[250px]">
          {/* Subtle Top Ambient Accent */}
          <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          {/* Header Row: Wardrobe Icon & Outfit Pills Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#EF264C]/10 border border-[#EF264C]/25 flex items-center justify-center shrink-0">
                <Shirt size={14} className="text-[#EF264C]" />
              </div>
              <div>
                <h3 className="text-[13.5px] font-semibold text-[#F1F1F1] tracking-tight">
                  ตู้เสื้อผ้าส่วนตัว (The Wardrobe Vault)
                </h3>
                <span className="text-[11px] text-white/40 font-light">สลับคอสตูม & เครื่องแต่งกาย</span>
              </div>
            </div>

            {/* Outfit Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {outfits.map((outfit, idx) => {
                const isActive = idx === activeOutfitIndex;
                const isInitial = outfit.key === initialOutfitKey;

                return (
                  <button
                    key={outfit.key}
                    type="button"
                    onClick={() => setActiveOutfitIndex(idx)}
                    className={`px-3 py-1 rounded-full text-[11.5px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
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
                  className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-dashed border-white/20 text-[11px] text-white/70 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus size={10} /> เพิ่มชุด
                </button>
              )}
            </div>
          </div>

          {/* Active Outfit Showcase Stage */}
          <div className="my-3 rounded-[16px] bg-white/[0.02] border border-white/[0.05] p-3.5 sm:p-4 space-y-2 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-[#EF264C] bg-[#EF264C]/10 px-2 py-0.5 rounded-full border border-[#EF264C]/20">
                  {activeOutfit.label}
                </span>

                {activeOutfit.key === initialOutfitKey ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <BookmarkCheck size={12} /> ชุดเริ่มต้นเปิดเกม
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
                  <Trash2 size={11} /> ลบชุดนี้
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
                  placeholder="ชื่อสไตล์ชุดย่อ"
                  className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-1 text-[13.5px] font-medium text-[#F1F1F1] outline-none"
                />
                <textarea
                  rows={2}
                  value={activeOutfit.description}
                  onChange={(e) => {
                    const updated = [...outfits];
                    updated[activeOutfitIndex].description = e.target.value;
                    setOutfits(updated);
                  }}
                  placeholder="รายละเอียดคัตติ้ง เนื้อผ้า และลูกเล่นของชุด..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1 text-[12px] text-[#AAAAAA] outline-none leading-relaxed resize-none"
                />
              </div>
            ) : (
              <div>
                <h5 className="text-[14px] font-semibold text-[#F1F1F1] tracking-tight">
                  {activeOutfit.name}
                </h5>
                <p className="text-[12.5px] text-[#AAAAAA] mt-1 leading-relaxed font-normal">
                  {activeOutfit.description}
                </p>
              </div>
            )}
          </div>

          {/* Footer Metadata */}
          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-white/35 font-light">
            <span>ชุดที่เลือก: {activeOutfit.label}</span>
            <span>ชุดเริ่มต้น: {outfits.find((o) => o.key === initialOutfitKey)?.label || 'ชุดที่ 1'}</span>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 🎭 WIDGET 7: SIGNATURE POSES DECK WIDGET (Span 3 Cols on Desktop)       */}
        {/* ======================================================================= */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-3 rounded-[22px] bg-white/[0.04] hover:bg-white/[0.06] backdrop-blur-2xl border border-white/[0.08] hover:border-white/[0.14] p-5 flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 relative group overflow-hidden min-h-[250px]">
          {/* Subtle Top Ambient Accent */}
          <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          {/* Header Row */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#EF264C]/10 border border-[#EF264C]/25 flex items-center justify-center shrink-0">
                <Sparkles size={14} className="text-[#EF264C]" />
              </div>
              <div>
                <h3 className="text-[13.5px] font-semibold text-[#F1F1F1] tracking-tight">
                  ท่าทางประจำตัว & กิริยาเฉพาะ (Signature Poses)
                </h3>
                <span className="text-[11px] text-white/40 font-light">ภาษากายในฉากแชท & HUD</span>
              </div>
            </div>

            <span className="text-[11px] text-white/40 bg-white/[0.03] px-2.5 py-0.5 rounded-full border border-white/[0.05] font-mono">
              {postures.length} ท่าทาง
            </span>
          </div>

          {/* Postures List */}
          <div className="my-2.5 space-y-2 flex-1 flex flex-col justify-center">
            {postures.map((poseText, idx) => {
              const isInitial = poseText === initialPose;

              return (
                <div
                  key={idx}
                  className="rounded-[15px] bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] p-2.5 sm:p-3 flex items-start gap-2.5 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                >
                  {/* Number Badge */}
                  <span className="text-[11px] font-mono font-bold text-[#EF264C] bg-[#EF264C]/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border border-[#EF264C]/20">
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
                        className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-2 py-1 text-[12px] text-[#F1F1F1] outline-none leading-relaxed resize-none"
                      />
                    ) : (
                      <p className="text-[12.5px] text-[#E0E0E4] leading-relaxed font-normal">
                        {poseText}
                      </p>
                    )}

                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      {isInitial ? (
                        <span className="inline-flex items-center gap-1 text-[10.5px] text-emerald-400 font-medium">
                          <BookmarkCheck size={11} /> ท่าทางเปิดตัวเริ่มต้น (HUD Active)
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setInitialPose(poseText)}
                          className="text-[10.5px] text-white/40 hover:text-white underline cursor-pointer transition-colors"
                        >
                          ตั้งเป็นท่าเปิดตัวใน HUD
                        </button>
                      )}

                      {isEditing && postures.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePosture(idx)}
                          className="text-[10.5px] text-red-400/70 hover:text-red-300 flex items-center gap-0.5 cursor-pointer transition-colors ml-auto"
                        >
                          <Trash2 size={11} /> ลบ
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
                className="w-full py-2 rounded-[14px] bg-white/[0.02] hover:bg-white/[0.05] border border-dashed border-white/15 text-[11.5px] text-white/70 hover:text-white flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Plus size={11} /> เพิ่มท่าทางประจำตัวใหม่
              </button>
            )}
          </div>

          {/* Footer Metadata */}
          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-white/35 font-light">
            <span>ท่าเปิดตัว: {postures.findIndex((p) => p === initialPose) >= 0 ? `0${postures.findIndex((p) => p === initialPose) + 1}` : '01'}</span>
            <span>เชื่อมโยงระบบ Kinematics HUD</span>
          </div>
        </div>

      </div>
    </div>
  );
}
