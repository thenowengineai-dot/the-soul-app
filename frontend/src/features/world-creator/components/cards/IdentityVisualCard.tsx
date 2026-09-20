import { useState, useEffect } from 'react';
import {
  Pencil,
  Check,
  Shirt,
  Plus,
  Trash2,
  BookmarkCheck,
  Glasses,
  Flame,
  Droplets,
  Hourglass,
  Hash,
  Sparkles,
  Moon,
  CloudRain,
  Compass,
  User,
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

  // 1. Identity State: Real Mock Data
  const [name, setName] = useState(draft.title || 'มาฮิโระ (Mahiro)990');
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

  // 2. Anatomy & Visual DNA (Unified Card: ตา, ทรงผม, สัดส่วน, ผิว, ไอน้ำ)
  const [anatomyItems, setAnatomyItems] = useState<AnatomyComplication[]>(() => {
    const raw = draft.appearance?.anatomy_features || [];
    return [
      {
        iconType: 'glasses',
        title: 'ดวงตา & แว่นตา',
        detail:
          raw[0] ||
          'แว่นตากรอบโลหะหนาเตอะที่ปิดบังดวงตาสีดำขลับปลาบเยิ้มที่ซ่อนความต้องการทางเพศเอาไว้ข้างใน',
      },
      {
        iconType: 'hourglass',
        title: 'ทรงผม & สรีระนาฬิกาทราย',
        detail:
          raw[2] ||
          'รูปร่างนาฬิกาทรายสุดสะบึม (อกอวบใหญ่สะบึม สะโพกผึ่งผาย) ที่ซ่อนอยู่ภายใต้เสื้อผ้าตัวโคร่ง',
      },
      {
        iconType: 'flame',
        title: 'ผิวขาวน้ำนมไวต่อความร้อน',
        detail:
          raw[1] ||
          'ผิวขาวเนียนละเอียดดุจน้ำนมที่ขึ้นสีชมพูระเรื่ออย่างรวดเร็วเมื่อสัมผัสกับความร้อน',
      },
      {
        iconType: 'droplets',
        title: 'กลิ่นอาย & ไอน้ำซอกคอ',
        detail:
          raw[3] ||
          'ซอกคอและกระดูกไหปลาร้าที่มักมีเหงื่อและไอน้ำระเหยฟุ้งออกมา',
      },
    ];
  });

  // 3. Wardrobe State (2x2 Closet: outfit_1 & outfit_2)
  const [outfits, setOutfits] = useState<OutfitItem[]>(() => {
    const w = (draft.appearance?.wardrobe || {}) as Record<string, string[] | undefined>;
    const list: OutfitItem[] = [];

    const o1 =
      w.outfit_1?.[0] ||
      'ชุดยูกาตะผ้าฝ้ายเนื้อหนาสีเข้มตัวโคร่งที่ดูแบนราบไร้ส่วนเว้าโค้ง พร้อมแว่นตากรอบหนาเตอะปิดบังใบหน้า';
    list.push({
      key: 'outfit_1',
      label: 'ยูกาตะตัวโคร่ง',
      name: 'ชุดยูกาตะผ้าฝ้ายเนื้อหนาตัวโคร่ง',
      description: o1,
    });

    const o2 =
      w.outfit_2?.[0] ||
      'เสื้อเชิ้ตสีขาวและกระโปรงยาวสีทึบเรียบร้อย ทว่ายามเปียกฝนจะแนบเนื้อจนโปร่งแสง เผยให้เห็นบราเซียลูกไม้สีดำสนิทขัดกับผิวขาวจัด';
    list.push({
      key: 'outfit_2',
      label: 'เชิ้ตขาวเปียกฝน',
      name: 'เสื้อเชิ้ตขาวและกระโปรงยาว (โปร่งแสงยามเปียกฝน)',
      description: o2,
    });

    // Additional outfits
    Object.keys(w).forEach((k) => {
      if (k !== 'outfit_1' && k !== 'outfit_2' && Array.isArray(w[k]) && w[k]!.length > 0) {
        const idx = list.length + 1;
        list.push({
          key: k,
          label: `ชุดที่ ${idx}`,
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

  // 4. Signature Postures (3 Poses)
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

  // 5. Environment & Starting Atmosphere
  const [sceneTime, setSceneTime] = useState(draft.starting_state?.time || 'ยามค่ำคืน');
  const [sceneWeather, setSceneWeather] = useState(draft.starting_state?.weather || 'แอร์เย็นสบาย');
  const [sceneLocation, setSceneLocation] = useState(draft.starting_state?.location || 'ห้อง VIP บาร์หรู');
  const [playerStance, setPlayerStance] = useState(draft.starting_state?.initial_p_pos || 'นั่งเอนตัวจิบเครื่องดื่ม');

  // Sync when draft changes externally
  useEffect(() => {
    if (draft.title && draft.title !== name) setName(draft.title);
    if (draft.quote && draft.quote !== quote) setQuote(draft.quote);
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
        time: sceneTime,
        weather: sceneWeather,
        location: sceneLocation,
        initial_p_pos: playerStance,
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
      label: `ชุดใหม่ ${nextIdx}`,
      name: `ชุดคอลเลกชันใหม่ ${nextIdx}`,
      description: 'ระบุรายละเอียดเนื้อผ้า คัตติ้ง และวัสดุ...',
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
        return <Glasses size={15} className="text-[#EF264C]" strokeWidth={2.2} />;
      case 'hourglass':
        return <Hourglass size={15} className="text-amber-400" strokeWidth={2.2} />;
      case 'flame':
        return <Flame size={15} className="text-rose-400" strokeWidth={2.2} />;
      case 'droplets':
        return <Droplets size={15} className="text-sky-400" strokeWidth={2.2} />;
    }
  };

  const activeOutfit = outfits[activeOutfitIndex] || outfits[0];

  return (
    <div className="w-full">
      {/* ========================================================================= */}
      {/* ✦ APPLE WIDGETKIT DESK CANVAS (1x1, 2x1, 2x2 MODULAR TILES)               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 sm:gap-5 auto-rows-[minmax(180px,auto)]">

        {/* ======================================================================= */}
        {/* 🪪 WIDGET 1: PROFILE HERO TILE (2x2 Large Square)                       */}
        {/* ======================================================================= */}
        <div className="col-span-1 md:col-span-1 xl:col-span-2 xl:row-span-2 rounded-[28px] bg-[#1c1c1e]/85 hover:bg-[#242426]/90 backdrop-blur-2xl border border-white/[0.10] hover:border-white/[0.18] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_24px_rgba(0,0,0,0.35)] transition-all duration-200 flex flex-col justify-between relative group overflow-hidden">
          {/* Header Row: Archetype Pill & Edit Button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#EF264C]/15 border border-[#EF264C]/30 flex items-center justify-center">
                <User size={12} className="text-[#EF264C]" />
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={archetype}
                  onChange={(e) => setArchetype(e.target.value)}
                  placeholder="Archetype"
                  className="bg-white/[0.06] border border-white/15 focus:border-[#EF264C]/60 rounded-full px-2.5 py-0.5 text-[11px] text-[#F1F1F1] outline-none"
                />
              ) : (
                <span className="text-[12px] font-medium text-[#BEBEC4]">
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
                    className="px-3 py-1 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <Check size={12} strokeWidth={2.4} />
                    <span>บันทึก</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.14] text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                    title="แก้ไขข้อมูล"
                  >
                    <Pencil size={12} strokeWidth={2} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Center: Large Name & Persona Quote */}
          <div className="my-auto py-3 space-y-2">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ชื่อตัวละคร"
                  className="w-full bg-white/[0.06] border border-white/20 focus:border-[#EF264C]/60 rounded-xl px-3 py-1.5 text-[22px] font-bold text-[#F1F1F1] outline-none"
                />
                <textarea
                  rows={3}
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="ประโยคคำพูดประจำตัว..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1 text-[12px] text-[#AAAAAA] outline-none leading-relaxed resize-none"
                />
              </div>
            ) : (
              <div>
                <h1 className="text-[26px] sm:text-[29px] font-bold text-[#F1F1F1] tracking-tight leading-tight">
                  {name}
                </h1>
                <p className="text-[12.5px] text-[#A1A1A8] mt-2 leading-relaxed font-normal italic line-clamp-3">
                  {quote}
                </p>
              </div>
            )}
          </div>

          {/* Bottom: Hashtags Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-1.5">
            {hashtags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.06] hover:bg-white/[0.09] text-[11px] text-white/75 font-normal"
              >
                <Hash size={10} className="text-[#EF264C]" />
                <span>{tag.replace(/^#/, '')}</span>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleRemoveHashtag(idx)}
                    className="hover:text-red-400 text-white/40 ml-0.5 cursor-pointer"
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
                  placeholder="+ แท็ก"
                  className="bg-white/[0.04] border border-white/10 rounded-full px-2 py-0.5 text-[11px] text-[#F1F1F1] outline-none w-16"
                />
                <button
                  type="button"
                  onClick={handleAddHashtag}
                  className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] cursor-pointer"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 👗 WIDGET 2: WARDROBE CLOSET (2x2 Large Square)                         */}
        {/* ======================================================================= */}
        <div className="col-span-1 md:col-span-1 xl:col-span-2 xl:row-span-2 rounded-[28px] bg-[#1c1c1e]/85 hover:bg-[#242426]/90 backdrop-blur-2xl border border-white/[0.10] hover:border-white/[0.18] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_24px_rgba(0,0,0,0.35)] transition-all duration-200 flex flex-col justify-between relative group overflow-hidden">
          {/* Header Row: Hanger Tabs */}
          <div className="flex items-center justify-between gap-2 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/[0.08] flex items-center justify-center">
                <Shirt size={12} className="text-[#EF264C]" />
              </div>
              <span className="text-[12.5px] font-semibold text-[#F1F1F1]">
                Wardrobe
              </span>
            </div>

            {/* Switcher Pills */}
            <div className="flex flex-wrap items-center gap-1">
              {outfits.map((outfit, idx) => {
                const isActive = idx === activeOutfitIndex;
                const isInitial = outfit.key === initialOutfitKey;

                return (
                  <button
                    key={outfit.key}
                    type="button"
                    onClick={() => setActiveOutfitIndex(idx)}
                    className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'bg-white/[0.04] text-white/50 hover:text-white'
                    }`}
                  >
                    {isInitial && <span className="text-[#EF264C] text-[8px]">✦</span>}
                    <span>{outfit.label}</span>
                  </button>
                );
              })}

              {isEditing && (
                <button
                  type="button"
                  onClick={handleAddNewOutfit}
                  className="w-5 h-5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white flex items-center justify-center text-[10px] cursor-pointer"
                >
                  <Plus size={10} />
                </button>
              )}
            </div>
          </div>

          {/* Garment Swatch Box */}
          <div className="my-auto py-3 px-4 rounded-[20px] bg-black/25 border border-white/[0.06] flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-bold text-[#F1F1F1] tracking-tight">
                {activeOutfit.name}
              </span>

              {activeOutfit.key === initialOutfitKey ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-medium">
                  <BookmarkCheck size={10} /> Default
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setInitialOutfitKey(activeOutfit.key)}
                  className="text-[10px] text-white/40 hover:text-white underline cursor-pointer transition-colors"
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
                  className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-2 py-1 text-[12px] text-[#F1F1F1] outline-none"
                />
                <textarea
                  rows={3}
                  value={activeOutfit.description}
                  onChange={(e) => {
                    const updated = [...outfits];
                    updated[activeOutfitIndex].description = e.target.value;
                    setOutfits(updated);
                  }}
                  placeholder="รายละเอียดเนื้อผ้า คัตติ้ง..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-2 py-1 text-[11.5px] text-[#AAAAAA] outline-none leading-relaxed resize-none"
                />
              </div>
            ) : (
              <p className="text-[12px] text-[#AAAAAA] leading-relaxed font-normal line-clamp-4">
                {activeOutfit.description}
              </p>
            )}

            {isEditing && outfits.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveOutfit(activeOutfitIndex)}
                className="self-end text-[10.5px] text-red-400/70 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors pt-1"
              >
                <Trash2 size={10} /> ลบชุดนี้
              </button>
            )}
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] text-white/35">
            <span>{outfits.length} ชุดสลับใส่</span>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 👓 WIDGET 3: ANATOMY & VISUAL DNA (2x2 Large Square - UNIFIED CARD)     */}
        {/* ======================================================================= */}
        <div className="col-span-1 md:col-span-2 xl:col-span-2 xl:row-span-2 rounded-[28px] bg-[#1c1c1e]/85 hover:bg-[#242426]/90 backdrop-blur-2xl border border-white/[0.10] hover:border-white/[0.18] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_24px_rgba(0,0,0,0.35)] transition-all duration-200 flex flex-col justify-between relative group overflow-hidden">
          {/* Header Row */}
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/[0.08] flex items-center justify-center">
                <Eye size={12} className="text-[#EF264C]" />
              </div>
              <span className="text-[12.5px] font-semibold text-[#F1F1F1]">
                Anatomy & Visual DNA
              </span>
            </div>
            <span className="text-[10.5px] text-white/40 font-mono">4 จุดเด่น</span>
          </div>

          {/* Unified 4 Visual Hallmarks: ตา, ทรงผม/สรีระ, ผิว, ไอน้ำ */}
          <div className="my-auto py-1 space-y-2">
            {anatomyItems.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-[16px] bg-black/25 border border-white/[0.05] flex items-start gap-2.5 transition-all"
              >
                <div className="w-5.5 h-5.5 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                  {renderComplicationIcon(item.iconType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11.5px] font-bold text-[#F1F1F1] tracking-tight">
                    {item.title}
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
                      className="w-full bg-white/[0.04] border border-white/10 rounded p-1 text-[11px] text-[#AAAAAA] outline-none resize-none mt-1"
                    />
                  ) : (
                    <p className="text-[11px] text-[#AAAAAA] leading-snug line-clamp-2 mt-0.5">
                      {item.detail}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] text-white/35">
            <span>ตา • ทรงผม • สัดส่วน • สัมผัส</span>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 🎭 WIDGET 4: SIGNATURE POSES DOCK (4 Cols Wide on Desktop, 1 Row)       */}
        {/* ======================================================================= */}
        <div className="col-span-1 md:col-span-2 xl:col-span-4 xl:row-span-1 rounded-[28px] bg-[#1c1c1e]/85 hover:bg-[#242426]/90 backdrop-blur-2xl border border-white/[0.10] hover:border-white/[0.18] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_24px_rgba(0,0,0,0.35)] transition-all duration-200 flex flex-col justify-between relative group overflow-hidden">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-rose-500/15 flex items-center justify-center">
                <Sparkles size={12} className="text-rose-400" />
              </div>
              <span className="text-[12.5px] font-semibold text-[#F1F1F1]">
                Signature Poses
              </span>
            </div>
            {isEditing ? (
              <button
                type="button"
                onClick={handleAddPosture}
                className="text-[11px] text-[#EF264C] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus size={10} /> เพิ่มท่า
              </button>
            ) : (
              <span className="text-[10.5px] text-white/40 font-mono">
                {postures.length} ภาษากาย
              </span>
            )}
          </div>

          {/* Compact Pill Rows */}
          <div className="py-1 space-y-1.5">
            {postures.map((poseText, idx) => {
              const isInitial = poseText === initialPose;
              return (
                <div
                  key={idx}
                  onClick={() => !isEditing && setInitialPose(poseText)}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
                    isInitial
                      ? 'bg-white/[0.10] border border-white/20'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border border-transparent'
                  }`}
                >
                  <span
                    className={`text-[9.5px] font-mono font-bold w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                      isInitial ? 'bg-[#EF264C] text-white' : 'bg-white/10 text-white/50'
                    }`}
                  >
                    0{idx + 1}
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={poseText}
                      onChange={(e) => {
                        const updated = [...postures];
                        updated[idx] = e.target.value;
                        setPostures(updated);
                      }}
                      className="bg-white/[0.04] border border-white/10 rounded px-1.5 py-0.5 text-[11px] text-[#F1F1F1] outline-none flex-1"
                    />
                  ) : (
                    <span className="text-[11.5px] text-[#E0E0E4] truncate flex-1">
                      {poseText}
                    </span>
                  )}
                  {isInitial && !isEditing && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  )}
                  {isEditing && postures.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePosture(idx);
                      }}
                      className="text-white/40 hover:text-red-400 p-0.5"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 🌙 WIDGET 5: ENVIRONMENT & ATMOSPHERE (2 Cols on Desktop, 1 Row)        */}
        {/* ======================================================================= */}
        <div className="col-span-1 md:col-span-2 xl:col-span-2 xl:row-span-1 rounded-[28px] bg-[#1c1c1e]/85 hover:bg-[#242426]/90 backdrop-blur-2xl border border-white/[0.10] hover:border-white/[0.18] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_24px_rgba(0,0,0,0.35)] transition-all duration-200 flex flex-col justify-between relative group overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-500/15 flex items-center justify-center">
                <Moon size={12} className="text-indigo-400" />
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={sceneLocation}
                  onChange={(e) => setSceneLocation(e.target.value)}
                  placeholder="สถานที่"
                  className="bg-white/[0.06] border border-white/10 rounded px-2 py-0.5 text-[11.5px] text-[#F1F1F1] outline-none w-32"
                />
              ) : (
                <span className="text-[12.5px] font-semibold text-[#F1F1F1]">
                  {sceneLocation}
                </span>
              )}
            </div>
            {isEditing ? (
              <input
                type="text"
                value={sceneTime}
                onChange={(e) => setSceneTime(e.target.value)}
                placeholder="เวลา"
                className="bg-white/[0.06] border border-white/10 rounded px-2 py-0.5 text-[11px] text-[#F1F1F1] outline-none w-20 text-right"
              />
            ) : (
              <span className="text-[11px] text-white/40 font-medium">
                {sceneTime}
              </span>
            )}
          </div>

          <div className="py-1 flex items-center justify-between gap-4">
            <div className="space-y-1 w-full">
              {isEditing ? (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={sceneWeather}
                    onChange={(e) => setSceneWeather(e.target.value)}
                    placeholder="สภาพอากาศ"
                    className="w-full bg-white/[0.06] border border-white/10 rounded px-2 py-0.5 text-[14px] font-bold text-[#F1F1F1] outline-none"
                  />
                  <input
                    type="text"
                    value={playerStance}
                    onChange={(e) => setPlayerStance(e.target.value)}
                    placeholder="ท่าทางเริ่มต้นของผู้เล่น"
                    className="w-full bg-white/[0.04] border border-white/10 rounded px-2 py-0.5 text-[11px] text-[#AAAAAA] outline-none"
                  />
                </div>
              ) : (
                <>
                  <div className="text-[19px] font-bold text-[#F1F1F1] tracking-tight">
                    {sceneWeather}
                  </div>
                  <div className="text-[11.5px] text-[#AAAAAA] flex items-center gap-1.5">
                    <Compass size={11} className="text-white/40" />
                    <span>{playerStance}</span>
                  </div>
                </>
              )}
            </div>

            {!isEditing && (
              <div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
                <CloudRain size={20} className="text-sky-400" />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
