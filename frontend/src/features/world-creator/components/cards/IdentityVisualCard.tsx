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

interface AnatomyTrait {
  id: string;
  iconType: 'glasses' | 'hourglass' | 'flame' | 'droplets';
  title: string;
  detail: string;
}

interface OutfitItem {
  key: string;
  badgeLabel: string;
  name: string;
  description: string;
}

export default function IdentityVisualCard({
  draft,
  onUpdateDraft,
  isEditable = true,
}: IdentityVisualCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  // 1. Identity State: Real Mock Data (Mahiro 990)
  const [name, setName] = useState(draft.title || 'มาฮิโระ (Mahiro)990');
  const [archetype, setArchetype] = useState(draft.archetype || 'The Cloaked Predator');
  const [archetypeTh, setArchetypeTh] = useState('นักล่าซ่อนรูปใต้หน้ากากพฤกษศาสตร์');
  const [quote, setQuote] = useState(
    draft.quote ||
      '“อย่าขยับสิคะ... ถ้าขยับพิษจากละอองเกสรจะยิ่งแล่นเข้าสู่กระแสเลือดนะ ให้รุ่นพี่ช่วยรีดมันออกจะดีกว่า...”'
  );
  const [hashtags, setHashtags] = useState<string[]>(() => {
    return draft.hashtags && draft.hashtags.length > 0
      ? draft.hashtags
      : [
          '#รุ่นพี่สาวแว่น',
          '#สายหมอกซ่อนรูป',
          '#GapMoeขั้นสุด',
          '#นักล่ากระหายพิษ',
          '#ตรรกะรีดพิษด้วยน้ำมังกร',
        ];
  });
  const [newTagInput, setNewTagInput] = useState('');

  // 2. Anatomy Traits (Unified 1 Card: 4 Biometric Quadrants)
  const [anatomyTraits, setAnatomyTraits] = useState<AnatomyTrait[]>(() => {
    const raw = draft.appearance?.anatomy_features || [];
    return [
      {
        id: 'trait-1',
        iconType: 'glasses',
        title: 'ดวงตา & แว่นตา',
        detail:
          raw[0] ||
          'ดวงตาเรียวคมเฉียบขาดดุจตาเหยี่ยว ซ่อนอยู่หลังแว่นตากรอบหนาเตอะ',
      },
      {
        id: 'trait-2',
        iconType: 'hourglass',
        title: 'ทรงผม & สรีระ',
        detail:
          raw[1] ||
          'ผมยาวสีดำขลับรวบต่ำ ซิลูเอตนาฬิกาทรายอกสะบึมเอวคอดสะโพกผาย ที่ซ่อนอยู่ภายใต้เสื้อผ้าตัวโคร่ง',
      },
      {
        id: 'trait-3',
        iconType: 'flame',
        title: 'สีผิว & ความร้อน',
        detail:
          raw[2] ||
          'ผิวขาวจัดราวกับน้ำนมที่เริ่มขึ้นสีระเรื่อจากไอร้อนและกำหนัดเมื่อสัมผัสกับความร้อน',
      },
      {
        id: 'trait-4',
        iconType: 'droplets',
        title: 'กลิ่นอาย & ไอน้ำ',
        detail:
          raw[3] ||
          'กลิ่นอายสมุนไพรสดและไอน้ำร้อนกรุ่นระเหยออกจากซอกคอและกระดูกไหปลาร้า',
      },
    ];
  });

  // 3. Wardrobe State: Physical Outfits
  const [outfits, setOutfits] = useState<OutfitItem[]>(() => {
    const w = (draft.appearance?.wardrobe || {}) as Record<string, string[] | undefined>;
    const list: OutfitItem[] = [];

    const o1 =
      w.outfit_1?.[0] ||
      'ชุดยูกาตะผ้าฝ้ายเนื้อหนาสีเข้มตัวโคร่งที่ดูแบนราบไร้ส่วนเว้าโค้ง พร้อมแว่นตากรอบหนาเตอะปิดบังใบหน้า';
    list.push({
      key: 'outfit_1',
      badgeLabel: 'ยูกาตะตัวโคร่ง',
      name: 'ชุดยูกาตะผ้าฝ้ายเนื้อหนาสีเข้มตัวโคร่ง',
      description: o1,
    });

    const o2 =
      w.outfit_2?.[0] ||
      'เสื้อเชิ้ตสีขาวและกระโปรงสอบเปียกน้ำแนบเนื้อ เผยให้เห็นบราลูกไม้สีดำและทรวดทรงนาฬิกาทรายสะบึมอวบอัดแบบเต็มตา';
    list.push({
      key: 'outfit_2',
      badgeLabel: 'เชิ้ตขาวเปียกฝน',
      name: 'เสื้อเชิ้ตขาวและกระโปรงสอบแนบเนื้อ',
      description: o2,
    });

    // Additional outfits if any
    Object.keys(w).forEach((k) => {
      if (k !== 'outfit_1' && k !== 'outfit_2' && Array.isArray(w[k]) && w[k]!.length > 0) {
        const idx = list.length + 1;
        list.push({
          key: k,
          badgeLabel: `ชุดที่ ${idx}`,
          name: `ชุดคอลเลกชัน ${idx}`,
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
          'ปลายนิ้วเรียวดันสันแว่นตาขึ้นเล็กน้อยขณะก้มมองด้วยสายตาเย็นชาดุจวิเคราะห์ตัวอย่างทดลอง',
          'สองแขนโอบรัดรอบคออีกฝ่ายอย่างแนบแน่นจากด้านหลัง ลมหายใจร้อนผ่าวรดรินข้างใบหู',
          'ยืนนิ่งหลังหมอกควันจาง กัดริมฝีปากล่างเบาๆ ขณะปลดกระดุมเสื้อเชิ้ตเปียกชื้นทีละเม็ด',
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

  // External draft sync
  useEffect(() => {
    if (draft.title && draft.title !== name) setName(draft.title);
    if (draft.quote && draft.quote !== quote) setQuote(draft.quote);
  }, [draft.title, draft.quote]);

  // Save changes handler
  const handleSave = () => {
    setIsEditing(false);
    if (onUpdateDraft) {
      const wardrobeObj: Record<string, string[]> = {};
      outfits.forEach((item) => {
        wardrobeObj[item.key] = [item.description];
      });

      const anatomyFlat = anatomyTraits.map((t) => t.detail);

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
      badgeLabel: `ชุดใหม่ ${nextIdx}`,
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
    if (filtered.length > 0 && !filtered.some((o) => o.key === initialOutfitKey)) {
      setInitialOutfitKey(filtered[0].key);
    }
  };

  const handleAddAnatomyTrait = () => {
    const newTrait: AnatomyTrait = {
      id: `trait-${Date.now()}`,
      iconType: 'droplets',
      title: 'จุดเด่นใหม่',
      detail: 'ระบุลักษณะเฉพาะทางกายภาพ...',
    };
    setAnatomyTraits([...anatomyTraits, newTrait]);
  };

  const handleRemoveAnatomyTrait = (idx: number) => {
    if (anatomyTraits.length <= 1) return;
    setAnatomyTraits(anatomyTraits.filter((_, i) => i !== idx));
  };

  const handleAddPosture = () => {
    setPostures([...postures, 'ระบุภาษากายหรือท่าทางประจำตัวใหม่...']);
  };

  const handleRemovePosture = (idx: number) => {
    if (postures.length <= 1) return;
    setPostures(postures.filter((_, i) => i !== idx));
  };

  const renderTraitIcon = (type: AnatomyTrait['iconType']) => {
    switch (type) {
      case 'glasses':
        return <Glasses size={12} className="text-[#EF264C]" strokeWidth={2.2} />;
      case 'hourglass':
        return <Hourglass size={12} className="text-amber-400" strokeWidth={2.2} />;
      case 'flame':
        return <Flame size={12} className="text-rose-400" strokeWidth={2.2} />;
      case 'droplets':
        return <Droplets size={12} className="text-sky-400" strokeWidth={2.2} />;
    }
  };

  const activeOutfit = outfits[activeOutfitIndex] || outfits[0];

  return (
    <div className="w-full flex justify-center py-2">
      {/* ========================================================================= */}
      {/* ✦ MATHEMATICAL GAME GRID: 160px BASE UNIT, 16px GAP (OPTION 2)             */}
      {/* 1x1: 160x160 | 2x1: 336x160 | 2x2: 336x336 (FIXED SIZE, FLUID REFLOW)     */}
      {/* ========================================================================= */}
      <div
        className="grid gap-4 justify-center"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, 160px)',
          gridAutoRows: '160px',
          width: '100%',
          maxWidth: '1440px',
        }}
      >

        {/* ======================================================================= */}
        {/* 🪪 WIDGET 1: IDENTITY & ARCHETYPE (2x2 -> 336px × 336px)                 */}
        {/* ======================================================================= */}
        <div
          className="col-span-2 row-span-2 rounded-[28px] bg-[#161618]/95 hover:bg-[#1b1b1e]/95 border border-white/[0.08] hover:border-white/14 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_26px_rgba(0,0,0,0.4)] transition-all flex flex-col justify-between relative overflow-hidden"
          style={{ width: '336px', height: '336px' }}
        >
          {/* Top Row: Mini Pill Badge + Apple Edit/Save Button */}
          <div className="flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-[#EF264C]/15 border border-[#EF264C]/30 flex items-center justify-center">
                <User size={11} className="text-[#EF264C]" />
              </div>
              <span className="text-[10.5px] font-mono tracking-wider text-white/50 uppercase font-semibold">
                IDENTITY
              </span>
            </div>

            {isEditable && (
              <div>
                {isEditing ? (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-3 py-0.5 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white text-[10.5px] font-semibold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <Check size={11} strokeWidth={2.4} />
                    <span>บันทึก</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-2.5 py-0.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/80 hover:text-white text-[10.5px] font-medium flex items-center gap-1 transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  >
                    <Pencil size={10} strokeWidth={2} />
                    <span>แก้ไข</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Middle: Name, Archetype, Quote */}
          <div className="my-auto py-1 space-y-1.5 overflow-hidden">
            {isEditing ? (
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ชื่อตัวละคร"
                  className="w-full bg-white/[0.05] border border-white/20 focus:border-[#EF264C]/60 rounded-lg px-2.5 py-1 text-[18px] font-bold text-[#F1F1F1] outline-none"
                />
                <input
                  type="text"
                  value={archetype}
                  onChange={(e) => setArchetype(e.target.value)}
                  placeholder="Archetype (EN)"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-md px-2 py-0.5 text-[11px] text-white outline-none"
                />
                <input
                  type="text"
                  value={archetypeTh}
                  onChange={(e) => setArchetypeTh(e.target.value)}
                  placeholder="คำอธิบายภาษาไทย"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-md px-2 py-0.5 text-[11px] text-white/70 outline-none"
                />
                <textarea
                  rows={2}
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="ประโยคคำพูดประจำตัว..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-md px-2 py-1 text-[11px] text-[#AAAAAA] outline-none leading-relaxed resize-none"
                />
              </div>
            ) : (
              <div>
                <h1 className="text-[22px] sm:text-[24px] font-bold text-[#F1F1F1] tracking-tight leading-tight">
                  {name}
                </h1>
                <div className="text-[11.5px] text-white/80 mt-0.5">
                  <span className="font-bold text-white">{archetype}</span>
                  {archetypeTh && (
                    <span className="text-white/45 font-normal ml-1">
                      ( {archetypeTh} )
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#A1A1A8] mt-1.5 leading-relaxed font-normal italic line-clamp-3">
                  {quote}
                </p>
              </div>
            )}
          </div>

          {/* Bottom: Hashtag Capsules */}
          <div className="pt-1 flex flex-wrap items-center gap-1 shrink-0">
            {hashtags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-white/[0.06] hover:bg-white/[0.09] text-[10px] text-white/75 font-normal"
              >
                <Hash size={9} className="text-[#EF264C]" />
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

            {isEditing ? (
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
                  className="bg-white/[0.04] border border-white/10 rounded-full px-2 py-0.5 text-[10px] text-[#F1F1F1] outline-none w-14"
                />
                <button
                  type="button"
                  onClick={handleAddHashtag}
                  className="w-4 h-4 rounded-full bg-white/10 text-white flex items-center justify-center text-[9px] cursor-pointer"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-2 py-0.5 rounded-full border border-dashed border-white/20 text-[9.5px] text-white/40 hover:text-white/80 font-mono cursor-pointer"
              >
                + Tag
              </button>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 👗 WIDGET 2: WARDROBE CLOSET (2x2 -> 336px × 336px)                      */}
        {/* ======================================================================= */}
        <div
          className="col-span-2 row-span-2 rounded-[28px] bg-[#161618]/95 hover:bg-[#1b1b1e]/95 border border-white/[0.08] hover:border-white/14 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_26px_rgba(0,0,0,0.4)] transition-all flex flex-col justify-between relative overflow-hidden"
          style={{ width: '336px', height: '336px' }}
        >
          {/* Header Row: Closet Badge + Hangers Switcher */}
          <div>
            <div className="flex items-center justify-between gap-1 mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center">
                  <Shirt size={11} className="text-[#EF264C]" />
                </div>
                <span className="text-[10.5px] font-mono tracking-wider text-white/50 uppercase font-semibold">
                  WARDROBE (ตู้เสื้อผ้า)
                </span>
              </div>

              {/* Hanger Pills Switcher */}
              <div className="flex flex-wrap items-center gap-1">
                {outfits.map((outfit, idx) => {
                  const isActive = idx === activeOutfitIndex;
                  const isDefault = outfit.key === initialOutfitKey;

                  return (
                    <button
                      key={outfit.key}
                      type="button"
                      onClick={() => setActiveOutfitIndex(idx)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-0.5 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-white/20 text-white shadow-sm'
                          : 'bg-white/[0.04] text-white/50 hover:text-white'
                      }`}
                    >
                      {isDefault && <span className="text-[#EF264C] text-[7px]">✦</span>}
                      <span>{outfit.badgeLabel}</span>
                    </button>
                  );
                })}

                {isEditing && (
                  <button
                    type="button"
                    onClick={handleAddNewOutfit}
                    className="w-5 h-5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white flex items-center justify-center text-[10px] cursor-pointer"
                    title="เพิ่มชุดใหม่ในตู้"
                  >
                    <Plus size={10} />
                  </button>
                )}
              </div>
            </div>

            {/* Tactile Garment Swatch Card */}
            <div className="my-auto py-2.5 px-3 rounded-[20px] bg-black/35 border border-white/[0.06] flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between gap-1.5">
                {isEditing ? (
                  <input
                    type="text"
                    value={activeOutfit.name}
                    onChange={(e) => {
                      const updated = [...outfits];
                      updated[activeOutfitIndex].name = e.target.value;
                      setOutfits(updated);
                    }}
                    className="bg-white/[0.06] border border-white/10 rounded px-1.5 py-0.5 text-[11.5px] font-bold text-white outline-none flex-1"
                  />
                ) : (
                  <span className="text-[12px] font-bold text-[#F1F1F1] tracking-tight truncate">
                    {activeOutfit.name}
                  </span>
                )}

                {activeOutfit.key === initialOutfitKey ? (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9.5px] font-medium shrink-0">
                    <BookmarkCheck size={9} /> DEFAULT
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setInitialOutfitKey(activeOutfit.key)}
                    className="text-[9.5px] text-white/40 hover:text-white underline cursor-pointer transition-colors shrink-0"
                  >
                    ตั้งเป็นชุดเริ่มต้น
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-1">
                  <textarea
                    rows={3}
                    value={activeOutfit.description}
                    onChange={(e) => {
                      const updated = [...outfits];
                      updated[activeOutfitIndex].description = e.target.value;
                      setOutfits(updated);
                    }}
                    placeholder="รายละเอียดเนื้อผ้า คัตติ้ง..."
                    className="w-full bg-white/[0.04] border border-white/10 rounded-md p-1.5 text-[11px] text-[#AAAAAA] outline-none leading-relaxed resize-none"
                  />
                  {outfits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOutfit(activeOutfitIndex)}
                      className="self-end text-[9.5px] text-red-400/70 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 size={9} /> ลบชุดนี้
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-[#AAAAAA] leading-relaxed font-normal line-clamp-4">
                  {activeOutfit.description}
                </p>
              )}
            </div>
          </div>

          {/* Bottom Closet Stats */}
          <div className="pt-1 flex items-center justify-between text-[10px] text-white/35 font-mono">
            <span>{outfits.length} OUTFITS IN CLOSET</span>
            <span>CLOSET 2X2</span>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 👓 WIDGET 3: ANATOMY & VISUAL DNA (2x2 -> 336px × 336px - 4 QUADRANTS)   */}
        {/* ======================================================================= */}
        <div
          className="col-span-2 row-span-2 rounded-[28px] bg-[#161618]/95 hover:bg-[#1b1b1e]/95 border border-white/[0.08] hover:border-white/14 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_26px_rgba(0,0,0,0.4)] transition-all flex flex-col justify-between relative overflow-hidden"
          style={{ width: '336px', height: '336px' }}
        >
          {/* Header Row */}
          <div>
            <div className="flex items-center justify-between gap-1 mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center">
                  <Eye size={11} className="text-[#EF264C]" />
                </div>
                <span className="text-[10.5px] font-mono tracking-wider text-white/50 uppercase font-semibold">
                  ANATOMY (สรีระ 4 มิติ)
                </span>
              </div>
              <span className="text-[9.5px] text-white/40 font-mono">
                {anatomyTraits.length} BIOMETRICS
              </span>
            </div>

            {/* 4-Quadrant Tactile Mini-Tiles */}
            <div className="grid grid-cols-2 gap-2 my-auto py-0.5">
              {anatomyTraits.map((trait, idx) => (
                <div
                  key={trait.id}
                  className="p-2 rounded-[16px] bg-black/35 border border-white/[0.05] hover:border-white/10 flex flex-col justify-between transition-all h-[95px] overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-1 mb-1 shrink-0">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded bg-white/[0.06] flex items-center justify-center shrink-0">
                        {renderTraitIcon(trait.iconType)}
                      </div>
                      <span className="text-[10px] font-bold text-[#F1F1F1] tracking-tight truncate">
                        {trait.title}
                      </span>
                    </div>

                    {isEditing && anatomyTraits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAnatomyTrait(idx)}
                        className="text-white/30 hover:text-red-400 p-0.5 cursor-pointer"
                      >
                        <Trash2 size={9} />
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={trait.detail}
                      onChange={(e) => {
                        const updated = [...anatomyTraits];
                        updated[idx].detail = e.target.value;
                        setAnatomyTraits(updated);
                      }}
                      className="w-full bg-white/[0.04] border border-white/10 rounded p-1 text-[9.5px] text-[#AAAAAA] outline-none leading-snug resize-none flex-1"
                    />
                  ) : (
                    <p className="text-[9.5px] text-[#AAAAAA] leading-snug line-clamp-3">
                      {trait.detail}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Info & Add Action */}
          <div className="pt-1 flex items-center justify-between text-[10px] text-white/35 font-mono">
            <span>ตา • ทรงผม • สัดส่วน • สัมผัส</span>
            {isEditing && (
              <button
                type="button"
                onClick={handleAddAnatomyTrait}
                className="text-[9.5px] text-[#EF264C] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Plus size={9} /> เพิ่ม
              </button>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 🎭 WIDGET 4: SIGNATURE POSTURES (2x1 -> 336px × 160px - HORIZONTAL WIDE)  */}
        {/* ======================================================================= */}
        <div
          className="col-span-2 row-span-1 rounded-[28px] bg-[#161618]/95 hover:bg-[#1b1b1e]/95 border border-white/[0.08] hover:border-white/14 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_26px_rgba(0,0,0,0.4)] transition-all flex flex-col justify-between relative overflow-hidden"
          style={{ width: '336px', height: '160px' }}
        >
          {/* Header Row */}
          <div className="flex items-center justify-between gap-1 shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-rose-500/15 flex items-center justify-center">
                <Sparkles size={11} className="text-rose-400" />
              </div>
              <span className="text-[10.5px] font-mono tracking-wider text-white/50 uppercase font-semibold">
                POSTURES (ภาษากาย 3 จังหวะ)
              </span>
            </div>

            <div className="flex items-center gap-1">
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleAddPosture}
                  className="text-[9.5px] text-[#EF264C] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus size={9} /> เพิ่มท่า
                </button>
              ) : (
                <span className="text-[9.5px] text-white/40 font-mono">DYNAMIC ISLAND</span>
              )}
            </div>
          </div>

          {/* 3 Dynamic Island Horizontal Capsules */}
          <div className="space-y-1 py-0.5 overflow-hidden">
            {postures.map((poseText, idx) => {
              const isInitial = poseText === initialPose;
              return (
                <div
                  key={idx}
                  onClick={() => !isEditing && setInitialPose(poseText)}
                  className={`px-2.5 py-1 rounded-[14px] flex items-center gap-2 transition-all cursor-pointer ${
                    isInitial
                      ? 'bg-white/[0.09] border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                      : 'bg-black/30 hover:bg-black/45 border border-white/[0.04] hover:border-white/10'
                  }`}
                >
                  <span
                    className={`text-[8.5px] font-mono font-bold w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
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
                      className="bg-white/[0.04] border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-[#F1F1F1] outline-none flex-1"
                    />
                  ) : (
                    <span className="text-[10px] text-[#E0E0E4] truncate flex-1">
                      {poseText}
                    </span>
                  )}

                  {isInitial && !isEditing && (
                    <span className="text-[8.5px] font-semibold text-[#EF264C] bg-[#EF264C]/15 px-1.5 py-0.5 rounded-full shrink-0">
                      ✦ HUD
                    </span>
                  )}

                  {isEditing && postures.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePosture(idx);
                      }}
                      className="text-white/30 hover:text-red-400 p-0.5 cursor-pointer"
                    >
                      <Trash2 size={9} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 🌙 WIDGET 5: STARTING ATMOSPHERE (1x1 -> 160px × 160px - APPLE WEATHER)   */}
        {/* ======================================================================= */}
        <div
          className="col-span-1 row-span-1 rounded-[24px] bg-[#161618]/95 hover:bg-[#1b1b1e]/95 border border-white/[0.08] hover:border-white/14 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_26px_rgba(0,0,0,0.4)] transition-all flex flex-col justify-between relative overflow-hidden"
          style={{ width: '160px', height: '160px' }}
        >
          {/* Header: Venue & Time */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1">
              <Moon size={11} className="text-indigo-400" />
              {isEditing ? (
                <input
                  type="text"
                  value={sceneTime}
                  onChange={(e) => setSceneTime(e.target.value)}
                  placeholder="เวลา"
                  className="bg-white/[0.06] border border-white/10 rounded px-1 py-0.5 text-[9px] text-white outline-none w-12"
                />
              ) : (
                <span className="text-[10px] text-white/50 font-medium truncate">
                  {sceneTime}
                </span>
              )}
            </div>

            <div className="w-5 h-5 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
              <CloudRain size={11} className="text-sky-400" />
            </div>
          </div>

          {/* Main Weather Sensation */}
          <div className="my-auto py-0.5 overflow-hidden">
            {isEditing ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={sceneWeather}
                  onChange={(e) => setSceneWeather(e.target.value)}
                  placeholder="สภาพอากาศ"
                  className="w-full bg-white/[0.06] border border-white/10 rounded px-1 py-0.5 text-[11px] font-bold text-white outline-none"
                />
                <input
                  type="text"
                  value={sceneLocation}
                  onChange={(e) => setSceneLocation(e.target.value)}
                  placeholder="สถานที่"
                  className="w-full bg-white/[0.04] border border-white/10 rounded px-1 py-0.5 text-[9.5px] text-white/70 outline-none"
                />
              </div>
            ) : (
              <div>
                <div className="text-[14px] font-bold text-[#F1F1F1] tracking-tight truncate leading-tight">
                  {sceneWeather}
                </div>
                <div className="text-[9.5px] text-[#A1A1A8] truncate mt-0.5">
                  {sceneLocation}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Tag */}
          <div className="text-[8.5px] font-mono uppercase tracking-wider text-white/30 shrink-0">
            WEATHER • 1X1
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 🧭 WIDGET 6: PLAYER STANCE (1x1 -> 160px × 160px - COMPASS TILE)         */}
        {/* ======================================================================= */}
        <div
          className="col-span-1 row-span-1 rounded-[24px] bg-[#161618]/95 hover:bg-[#1b1b1e]/95 border border-white/[0.08] hover:border-white/14 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_26px_rgba(0,0,0,0.4)] transition-all flex flex-col justify-between relative overflow-hidden"
          style={{ width: '160px', height: '160px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1">
              <Compass size={11} className="text-[#EF264C]" />
              <span className="text-[9px] font-mono tracking-wider text-white/50 uppercase font-semibold">
                STANCE
              </span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Stance Content */}
          <div className="my-auto py-0.5 overflow-hidden">
            {isEditing ? (
              <input
                type="text"
                value={playerStance}
                onChange={(e) => setPlayerStance(e.target.value)}
                placeholder="ท่าทางเริ่มต้นของผู้เล่น"
                className="w-full bg-white/[0.06] border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white outline-none"
              />
            ) : (
              <div>
                <div className="text-[11.5px] font-bold text-[#F1F1F1] tracking-tight leading-snug line-clamp-2">
                  {playerStance}
                </div>
                <div className="text-[9px] text-white/40 mt-0.5 truncate">
                  พร้อมรับมือ / สังเกตการณ์
                </div>
              </div>
            )}
          </div>

          {/* Bottom Tag */}
          <div className="text-[8.5px] font-mono uppercase tracking-wider text-white/30 shrink-0">
            PLAYER • 1X1
          </div>
        </div>

      </div>
    </div>
  );
}
