import { useState, useEffect } from 'react';
import {
  Pencil,
  Check,
  Plus,
  Trash2,
  BookmarkCheck,
  Moon,
  CloudRain,
} from 'lucide-react';
import type { VaultDraft } from '../../types';

interface IdentityVisualCardProps {
  draft: VaultDraft;
  onUpdateDraft?: (updated: Partial<VaultDraft>) => void;
  isEditable?: boolean;
}

interface AnatomyTrait {
  id: string;
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

  // 1. Identity State: Real Mock Data (Mahiro)
  const initialTitle =
    !draft.title || draft.title.includes('ตัวละครใหม่')
      ? 'มาฮิโระ (Mahiro)'
      : draft.title;
  const [name, setName] = useState(initialTitle);
  const [archetype, setArchetype] = useState(draft.archetype || 'The Cloaked Predator');
  const [archetypeTh, setArchetypeTh] = useState('นักล่าซ่อนรูปใต้หน้ากากพฤกษศาสตร์');
  const [quote, setQuote] = useState(
    draft.quote ||
      '“อย่าขยับสิคะ... ถ้าขยับพิษจากละอองเกสรจะยิ่งแล่นเข้าสู่กระแสเลือดนะ ให้รุ่นพี่ช่วยรีดมันออกจะดีกว่า...”'
  );
  const [hashtags] = useState<string[]>(() => {
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

  // 2. Anatomy Traits (Direct Substance Editorial Rows)
  const [anatomyTraits, setAnatomyTraits] = useState<AnatomyTrait[]>(() => {
    const raw = draft.appearance?.anatomy_features || [];
    return [
      {
        id: 'trait-1',
        title: 'สายตาใต้กรอบแว่น',
        detail:
          raw[0] ||
          'เรียวคมเฉียบขาดดุจตาเหยี่ยว ซ่อนอยู่หลังแว่นตากรอบหนาเตอะ',
      },
      {
        id: 'trait-2',
        title: 'ทรวดทรงนาฬิกาทราย',
        detail:
          raw[1] ||
          'ผมยาวสีดำขลับรวบต่ำ อกสะบึมเอวคอดสะโพกผาย ซ่อนรูปภายใต้เสื้อผ้าตัวโคร่ง',
      },
      {
        id: 'trait-3',
        title: 'ผิวขาวจัดขึ้นสีระเรื่อ',
        detail:
          raw[2] ||
          'ไอร้อนจากกำหนัดเมื่อสัมผัสกับความร้อน',
      },
      {
        id: 'trait-4',
        title: 'กลิ่นอายสมุนไพรสด',
        detail:
          raw[3] ||
          'และไอน้ำร้อนกรุ่นระเหยออกจากซอกคอและกระดูกไหปลาร้า',
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
    if (
      draft.title &&
      !draft.title.includes('ตัวละครใหม่') &&
      draft.title !== name
    ) {
      setName(draft.title);
    }
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

      const anatomyFlat = anatomyTraits.map((t) => `${t.title} — ${t.detail}`);

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

  const handleAddNewOutfit = () => {
    const nextIdx = outfits.length + 1;
    const newKey = `outfit_${nextIdx}`;
    const newOutfit: OutfitItem = {
      key: newKey,
      badgeLabel: `ชุดใหม่ ${nextIdx}`,
      name: `ชุดคอลเลกชันใหม่ ${nextIdx}`,
      description: 'ระบุรายละเอียดเนื้อผ้า คัตติ้ง และสัมผัส...',
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

  const activeOutfit = outfits[activeOutfitIndex] || outfits[0];

  // ✦ APPLE SUBTLE WHITE FROSTED GLASS RECIPE (SAME AS COIN, HUD & CHATLIST BUTTONS)
  // Zero harsh drop-shadow! Clean 1px translucent border + top inner highlight.
  const frostedCardClass =
    'bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all flex flex-col justify-between relative overflow-hidden';

  return (
    <div className="w-full flex justify-center py-2">
      {/* ========================================================================= */}
      {/* ✦ MATHEMATICAL GAME GRID: 165px BASE UNIT, 16px GAP (GOLDILOCKS ZONE)       */}
      {/* 1x1: 165x165 | 2x1: 346x165 | 2x2: 346x346 (FROSTED GLASS, ZERO SHADOW)    */}
      {/* ========================================================================= */}
      <div
        className="grid gap-4 justify-center"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, 165px)',
          gridAutoRows: '165px',
          width: '100%',
          maxWidth: '1440px',
        }}
      >

        {/* ======================================================================= */}
        {/* 👑 WIDGET 1: IDENTITY & SOUL (2x2 -> 346px × 346px - HERO TITLE)          */}
        {/* ======================================================================= */}
        <div
          className={`col-span-2 row-span-2 rounded-[28px] p-5 ${frostedCardClass}`}
          style={{ width: '346px', height: '346px' }}
        >
          {/* Top Bar: Apple Tactile Circular Action */}
          <div className="flex items-center justify-end shrink-0 h-8">
            {isEditable && (
              <div>
                {isEditing ? (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="w-8 h-8 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(239,38,76,0.4)] transition-all cursor-pointer active:scale-95"
                    title="บันทึก"
                  >
                    <Check size={14} strokeWidth={2.4} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] active:scale-95"
                    title="แก้ไข"
                  >
                    <Pencil size={13} strokeWidth={2} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Middle: Name Hero, Archetype, Persona Voice */}
          <div className="my-auto py-2 flex flex-col justify-center">
            {isEditing ? (
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-mono text-white/50 uppercase">ชื่อตัวละคร</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ชื่อตัวละคร"
                    className="w-full bg-black/30 border border-white/20 focus:border-[#EF264C] rounded-lg px-2.5 py-1 text-[20px] font-bold text-white outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="text-[9.5px] font-mono text-white/50 uppercase">Archetype (EN)</label>
                    <input
                      type="text"
                      value={archetype}
                      onChange={(e) => setArchetype(e.target.value)}
                      placeholder="Archetype"
                      className="w-full bg-black/25 border border-white/15 focus:border-[#EF264C] rounded-md px-2 py-1 text-[11.5px] text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-mono text-white/50 uppercase">คำอธิบายไทย</label>
                    <input
                      type="text"
                      value={archetypeTh}
                      onChange={(e) => setArchetypeTh(e.target.value)}
                      placeholder="คำอธิบายไทย"
                      className="w-full bg-black/25 border border-white/15 focus:border-[#EF264C] rounded-md px-2 py-1 text-[11.5px] text-white/80 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9.5px] font-mono text-white/50 uppercase">ประโยคคำพูดประจำตัว</label>
                  <textarea
                    rows={2}
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder="ประโยคคำพูดประจำตัว..."
                    className="w-full bg-black/25 border border-white/15 focus:border-[#EF264C] rounded-md px-2 py-1 text-[11.5px] text-[#EDEDED] outline-none leading-normal resize-none"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-[28px] sm:text-[30px] font-bold text-[#F1F1F1] tracking-tight leading-tight">
                  {name}
                </h1>
                <div className="text-[13px] sm:text-[13.5px] text-[#A1A1A8] mt-1.5 font-medium leading-normal">
                  <span>{archetype}</span>
                  {archetypeTh && (
                    <span className="text-white/45 font-normal ml-1.5">
                      • {archetypeTh}
                    </span>
                  )}
                </div>
                <div className="w-10 h-[1px] bg-white/15 my-4" />
                <p className="text-[13.5px] sm:text-[14px] text-[#EDEDED] leading-relaxed font-normal italic line-clamp-4">
                  {quote}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 👗 WIDGET 2: WARDROBE CLOSET (2x2 -> 346px × 346px)                      */}
        {/* ======================================================================= */}
        <div
          className={`col-span-2 row-span-2 rounded-[28px] p-4 ${frostedCardClass}`}
          style={{ width: '346px', height: '346px' }}
        >
          {/* Header Row: Pure Thai Label + Hangers Switcher */}
          <div className="flex items-center justify-between gap-1 mb-2 shrink-0">
            <span className="text-[12px] font-bold tracking-wider text-white/80 font-mono">
              ตู้เสื้อผ้า
            </span>

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
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] border border-white/25'
                        : 'bg-white/[0.04] text-white/60 hover:text-white border border-transparent'
                    }`}
                  >
                    {isDefault && <span className="text-[#EF264C] text-[8px]">✦</span>}
                    <span>{outfit.badgeLabel}</span>
                  </button>
                );
              })}

              {isEditing && (
                <button
                  type="button"
                  onClick={handleAddNewOutfit}
                  className="w-5 h-5 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-white flex items-center justify-center text-[10px] cursor-pointer"
                  title="เพิ่มชุดใหม่ในตู้"
                >
                  <Plus size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Tactile Garment Swatch Card - Cohesive Grouping (No Void) */}
          <div className="flex-1 p-4 rounded-[20px] bg-black/40 backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.35)] flex flex-col gap-3 overflow-hidden">
            <div className="flex items-center justify-between gap-1.5 shrink-0">
              {isEditing ? (
                <div className="flex-1">
                  <label className="text-[9.5px] font-mono text-white/50 uppercase">ชื่อสไตล์ชุด</label>
                  <input
                    type="text"
                    value={activeOutfit.name}
                    onChange={(e) => {
                      const updated = [...outfits];
                      updated[activeOutfitIndex].name = e.target.value;
                      setOutfits(updated);
                    }}
                    className="w-full bg-black/30 border border-white/15 focus:border-[#EF264C] rounded px-2 py-0.5 text-[12.5px] font-bold text-white outline-none"
                  />
                </div>
              ) : (
                <span className="text-[14px] font-bold text-white tracking-tight truncate">
                  {activeOutfit.name}
                </span>
              )}

              {activeOutfit.key === initialOutfitKey ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold shrink-0">
                  <BookmarkCheck size={10} /> ชุดเริ่มต้น
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setInitialOutfitKey(activeOutfit.key)}
                  className="text-[10px] text-white/50 hover:text-white underline cursor-pointer transition-colors shrink-0"
                >
                  ตั้งเป็นชุดเริ่มต้น
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-1 flex-1 flex flex-col justify-between">
                <label className="text-[9.5px] font-mono text-white/50 uppercase">รายละเอียดเนื้อผ้า & สัมผัส</label>
                <textarea
                  rows={4}
                  value={activeOutfit.description}
                  onChange={(e) => {
                    const updated = [...outfits];
                    updated[activeOutfitIndex].description = e.target.value;
                    setOutfits(updated);
                  }}
                  placeholder="รายละเอียดเนื้อผ้า คัตติ้ง..."
                  className="w-full flex-1 bg-black/30 border border-white/15 focus:border-[#EF264C] rounded-md p-2 text-[12px] text-[#EDEDED] outline-none leading-normal resize-none"
                />
                {outfits.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOutfit(activeOutfitIndex)}
                    className="self-end text-[10px] text-red-400/80 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors pt-0.5"
                  >
                    <Trash2 size={10} /> ลบชุดนี้ออกจากตู้
                  </button>
                )}
              </div>
            ) : (
              <p className="text-[13px] text-[#EDEDED] leading-relaxed font-normal line-clamp-6">
                {activeOutfit.description}
              </p>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 👓 WIDGET 3: ANATOMY & PHYSIQUE (2x2 -> 346px × 346px - EDITORIAL CLARITY) */}
        {/* ======================================================================= */}
        <div
          className={`col-span-2 row-span-2 rounded-[28px] p-4 ${frostedCardClass}`}
          style={{ width: '346px', height: '346px' }}
        >
          {/* Header Row: Pure Thai Label */}
          <div className="flex items-center justify-between gap-1 mb-2 shrink-0">
            <span className="text-[12px] font-bold tracking-wider text-white/80 font-mono">
              สรีระและจุดเด่น
            </span>

            {isEditing && (
              <button
                type="button"
                onClick={handleAddAnatomyTrait}
                className="text-[10.5px] text-[#EF264C] hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
              >
                <Plus size={10} /> เพิ่มจุดเด่น
              </button>
            )}
          </div>

          {/* Full-width Stacked Rows - Direct Substance / Literary Flow */}
          <div className="flex flex-col gap-2 flex-1 justify-between py-0.5 overflow-hidden">
            {anatomyTraits.map((trait, idx) => (
              <div
                key={trait.id}
                className="px-3.5 py-2.5 rounded-[16px] bg-black/40 hover:bg-black/50 backdrop-blur-xl border border-white/[0.06] hover:border-white/12 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.35)] flex items-center transition-all"
              >
                {isEditing ? (
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <input
                      type="text"
                      value={trait.title}
                      onChange={(e) => {
                        const updated = [...anatomyTraits];
                        updated[idx].title = e.target.value;
                        setAnatomyTraits(updated);
                      }}
                      className="bg-black/30 border border-white/15 focus:border-[#EF264C] rounded px-2 py-1 text-[11.5px] font-bold text-white outline-none w-32 shrink-0"
                      placeholder="จุดเด่น..."
                    />
                    <input
                      type="text"
                      value={trait.detail}
                      onChange={(e) => {
                        const updated = [...anatomyTraits];
                        updated[idx].detail = e.target.value;
                        setAnatomyTraits(updated);
                      }}
                      className="w-full bg-black/30 border border-white/15 focus:border-[#EF264C] rounded px-2 py-1 text-[12px] text-[#EDEDED] outline-none"
                      placeholder="คำบรรยาย..."
                    />
                    {anatomyTraits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAnatomyTrait(idx)}
                        className="text-white/40 hover:text-red-400 p-0.5 cursor-pointer shrink-0"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-[12.5px] text-[#EDEDED] leading-snug font-normal line-clamp-2">
                    <span className="font-bold text-white mr-1.5">
                      {trait.title} —
                    </span>
                    <span className="text-[#D6D6DC]">
                      {trait.detail}
                    </span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 🎭 WIDGET 4: SIGNATURE POSTURES (2x1 -> 346px × 165px - PURE THAI)        */}
        {/* ======================================================================= */}
        <div
          className={`col-span-2 row-span-1 rounded-[28px] p-3.5 ${frostedCardClass}`}
          style={{ width: '346px', height: '165px' }}
        >
          {/* Header Row */}
          <div className="flex items-center justify-between gap-1 shrink-0">
            <span className="text-[12px] font-bold tracking-wider text-white/80 font-mono">
              ท่วงท่าประจำตัว
            </span>

            {isEditing && (
              <button
                type="button"
                onClick={handleAddPosture}
                className="text-[10.5px] text-[#EF264C] hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
              >
                <Plus size={10} /> เพิ่มท่า
              </button>
            )}
          </div>

          {/* 3 Dynamic Posture Capsules */}
          <div className="space-y-1.5 py-0.5 overflow-hidden">
            {postures.map((poseText, idx) => {
              const isInitial = poseText === initialPose;
              return (
                <div
                  key={idx}
                  onClick={() => !isEditing && setInitialPose(poseText)}
                  className={`px-3 py-1.5 rounded-[14px] flex items-center gap-2.5 transition-all cursor-pointer ${
                    isInitial
                      ? 'bg-white/[0.12] border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]'
                      : 'bg-black/40 hover:bg-black/50 backdrop-blur-xl border border-white/[0.06] hover:border-white/12 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.35)]'
                  }`}
                >
                  <span
                    className={`text-[9.5px] font-mono font-bold w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                      isInitial ? 'bg-[#EF264C] text-white' : 'bg-white/15 text-white/70'
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
                      className="bg-black/30 border border-white/15 focus:border-[#EF264C] rounded px-2 py-0.5 text-[11px] text-[#F1F1F1] outline-none flex-1"
                    />
                  ) : (
                    <span className="text-[12px] text-[#EDEDED] truncate flex-1 font-normal">
                      {poseText}
                    </span>
                  )}

                  {isInitial && !isEditing && (
                    <span className="text-[9.5px] font-bold text-[#EF264C] bg-[#EF264C]/20 border border-[#EF264C]/40 px-2 py-0.5 rounded-full shrink-0">
                      ✦ เริ่มต้น
                    </span>
                  )}

                  {isEditing && postures.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePosture(idx);
                      }}
                      className="text-white/40 hover:text-red-400 p-0.5 cursor-pointer"
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
        {/* 🌙 WIDGET 5: STARTING ATMOSPHERE (1x1 -> 165px × 165px - APPLE WEATHER)   */}
        {/* ======================================================================= */}
        <div
          className={`col-span-1 row-span-1 rounded-[24px] p-3.5 ${frostedCardClass}`}
          style={{ width: '165px', height: '165px' }}
        >
          {/* Header: Time with small Moon */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <Moon size={11} className="text-white/60" />
              {isEditing ? (
                <input
                  type="text"
                  value={sceneTime}
                  onChange={(e) => setSceneTime(e.target.value)}
                  placeholder="เวลา"
                  className="bg-black/30 border border-white/15 focus:border-[#EF264C] rounded px-1.5 py-0.5 text-[10px] text-white outline-none w-14"
                />
              ) : (
                <span className="text-[11px] text-white/60 font-medium truncate">
                  {sceneTime}
                </span>
              )}
            </div>

            <div className="w-5 h-5 rounded-md bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
              <CloudRain size={11} className="text-sky-400" />
            </div>
          </div>

          {/* Main Weather Sensation (Apple Weather Style) */}
          <div className="my-auto py-1 overflow-hidden">
            {isEditing ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={sceneWeather}
                  onChange={(e) => setSceneWeather(e.target.value)}
                  placeholder="สภาพอากาศ"
                  className="w-full bg-black/30 border border-white/15 focus:border-[#EF264C] rounded px-1.5 py-0.5 text-[12px] font-bold text-white outline-none"
                />
                <input
                  type="text"
                  value={sceneLocation}
                  onChange={(e) => setSceneLocation(e.target.value)}
                  placeholder="สถานที่"
                  className="w-full bg-black/25 border border-white/10 focus:border-[#EF264C] rounded px-1.5 py-0.5 text-[10.5px] text-white/80 outline-none"
                />
              </div>
            ) : (
              <div>
                <div className="text-[16px] font-bold text-white tracking-tight truncate leading-tight">
                  {sceneWeather}
                </div>
                <div className="text-[11.5px] text-[#A1A1A8] truncate mt-1">
                  {sceneLocation}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 🧭 WIDGET 6: PLAYER STANCE (1x1 -> 165px × 165px - PURE THAI)             */}
        {/* ======================================================================= */}
        <div
          className={`col-span-1 row-span-1 rounded-[24px] p-3.5 ${frostedCardClass}`}
          style={{ width: '165px', height: '165px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between shrink-0">
            <span className="text-[11px] font-bold tracking-wider text-white/80 font-mono">
              ท่าทีผู้เล่น
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400/80 animate-pulse" />
          </div>

          {/* Stance Content */}
          <div className="my-auto py-1 overflow-hidden">
            {isEditing ? (
              <input
                type="text"
                value={playerStance}
                onChange={(e) => setPlayerStance(e.target.value)}
                placeholder="ท่าทางเริ่มต้นของผู้เล่น"
                className="w-full bg-black/30 border border-white/15 focus:border-[#EF264C] rounded px-2 py-1 text-[11px] text-white outline-none"
              />
            ) : (
              <div>
                <div className="text-[13.5px] font-bold text-white tracking-tight leading-snug line-clamp-3">
                  {playerStance}
                </div>
                <div className="text-[11px] text-[#A1A1A8] mt-1.5 truncate">
                  พร้อมรับมือ / สังเกตการณ์
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
