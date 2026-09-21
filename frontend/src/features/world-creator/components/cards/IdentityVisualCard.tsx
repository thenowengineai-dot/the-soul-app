import { useState, useEffect } from 'react';
import {
  Pencil,
  Check,
  Plus,
  Trash2,
  Moon,
  CloudRain,
  Eye,
  Wind,
  Flame,
  Feather,
} from 'lucide-react';
import type { VaultDraft } from '../../types';

interface IdentityVisualCardProps {
  draft: VaultDraft;
  onUpdateDraft?: (updated: Partial<VaultDraft>) => void;
  isEditable?: boolean;
}

interface CoreAnatomyItem {
  title: string;
  detail: string;
}

interface CustomAnatomyTrait {
  id: string;
  title: string;
  detail: string;
}

interface OutfitItem {
  key: string;
  badgeLabel: string;
  name: string;
  occasion: string;
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

  // 2. Anatomy State: Two-Tier Dual Matrix (4 Core Pillars + Unlimited Custom Traits)
  const [coreAnatomy, setCoreAnatomy] = useState<
    Record<'eyes' | 'hair' | 'physique' | 'skin', CoreAnatomyItem>
  >(() => {
    const raw = draft.appearance?.anatomy_features || [];
    return {
      eyes: {
        title: 'ตาดำขลับใต้แว่นหนา',
        detail:
          raw[0] ||
          'แว่นตากรอบโลหะหนาเตอะที่ปิดบังดวงตาสีดำขลับปลาบเยิ้มที่ซ่อนความต้องการทางเพศเอาไว้ข้างใน',
      },
      hair: {
        title: 'ผมดำขลับรวบต่ำ',
        detail:
          'เรือนผมสีดำขลับธรรมชาติที่รวบไว้หลวมๆ ด้านหลัง ปล่อยปอยผมบางส่วนตกลงมาเคลียข้างแก้มอย่างไม่ตั้งใจ',
      },
      physique: {
        title: 'นาฬิกาทรายสะบึม',
        detail:
          raw[2] ||
          'รูปร่างนาฬิกาทรายสุดสะบึม (อกอวบใหญ่สะบึม สะโพกผึ่งผาย) ที่ซ่อนอยู่ภายใต้เสื้อผ้าตัวโคร่ง',
      },
      skin: {
        title: 'ผิวขาวเนียนดุจน้ำนม',
        detail:
          raw[1] ||
          'ผิวขาวเนียนละเอียดดุจน้ำนมที่ขึ้นสีชมพูระเรื่ออย่างรวดเร็วเมื่อสัมผัสกับความร้อน',
      },
    };
  });

  const [customTraits, setCustomTraits] = useState<CustomAnatomyTrait[]>(() => {
    const raw = draft.appearance?.anatomy_features || [];
    const list: CustomAnatomyTrait[] = [];
    if (raw[3]) {
      const parts = raw[3].split(' — ');
      list.push({
        id: 'custom-1',
        title: parts.length > 1 ? parts[0] : 'ซอกคอ & ไหปลาร้า',
        detail: parts.length > 1 ? parts[1] : raw[3],
      });
    } else {
      list.push({
        id: 'custom-1',
        title: 'ซอกคอ & ไหปลาร้า',
        detail: 'ซอกคอและกระดูกไหปลาร้าที่มักมีเหงื่อและไอน้ำระเหยฟุ้งออกมา',
      });
    }

    if (raw.length > 4) {
      for (let i = 4; i < raw.length; i++) {
        const parts = raw[i].split(' — ');
        list.push({
          id: `custom-${i}`,
          title: parts.length > 1 ? parts[0] : `จุดเด่นที่ ${i - 2}`,
          detail: parts.length > 1 ? parts[1] : raw[i],
        });
      }
    }
    return list;
  });

  // 3. Wardrobe State: Situational Outfits & Slideable Clothes Rail
  const [outfits, setOutfits] = useState<OutfitItem[]>(() => {
    const w = (draft.appearance?.wardrobe || {}) as Record<string, string[] | undefined>;
    const list: OutfitItem[] = [];

    const o1Desc =
      w.outfit_1?.[0] ||
      'ชุดยูกาตะผ้าฝ้ายเนื้อหนาสีเข้มตัวโคร่งที่ดูแบนราบไร้ส่วนเว้าโค้ง พร้อมแว่นตากรอบหนาเตอะปิดบังใบหน้า';
    const o1Occasion = w.outfit_1?.[1] || 'ใส่เวลาอยู่บ้าน / ในห้องทดลองส่วนตัว';
    const o1Name = w.outfit_1?.[2] || 'ชุดยูกาตะผ้าฝ้ายเนื้อหนาตัวโคร่ง';
    const o1Badge = w.outfit_1?.[3] || 'ยูกาตะตัวโคร่ง';
    list.push({
      key: 'outfit_1',
      badgeLabel: o1Badge,
      name: o1Name,
      occasion: o1Occasion,
      description: o1Desc,
    });

    const o2Desc =
      w.outfit_2?.[0] ||
      'เสื้อเชิ้ตสีขาวและกระโปรงสอบเปียกน้ำแนบเนื้อ เผยให้เห็นบราลูกไม้สีดำและทรวดทรงนาฬิกาทรายสะบึมอวบอัดแบบเต็มตา';
    const o2Occasion = w.outfit_2?.[1] || 'ใส่เวลาเดินทาง / เจอตอนฝนตกกะทันหัน';
    const o2Name = w.outfit_2?.[2] || 'เสื้อเชิ้ตขาวและกระโปรงสอบแนบเนื้อ';
    const o2Badge = w.outfit_2?.[3] || 'เชิ้ตขาวเปียกฝน';
    list.push({
      key: 'outfit_2',
      badgeLabel: o2Badge,
      name: o2Name,
      occasion: o2Occasion,
      description: o2Desc,
    });

    // Check additional outfits in draft
    const otherKeys = Object.keys(w).filter(
      (k) => k !== 'outfit_1' && k !== 'outfit_2' && Array.isArray(w[k]) && w[k]!.length > 0
    );

    if (otherKeys.length > 0) {
      otherKeys.forEach((k) => {
        const item = w[k]!;
        list.push({
          key: k,
          badgeLabel: item[3] || `ชุดที่ ${list.length + 1}`,
          name: item[2] || `ชุดคอลเลกชัน ${list.length + 1}`,
          occasion: item[1] || 'ใส่ตามสถานการณ์ที่กำหนด',
          description: item[0] || 'ระบุรายละเอียด...',
        });
      });
    } else {
      // Add situation-based 3rd outfit: Nightwear / Bedroom
      list.push({
        key: 'outfit_3',
        badgeLabel: 'ชุดนอนผ้าซาติน',
        name: 'ชุดนอนสายเดี่ยวผ้าซาตินสีดำขลับ',
        occasion: 'ใส่เวลาอยู่ในห้องนอน / ยามดึกก่อนนอน',
        description:
          'ชุดนอนสายเดี่ยวผ้าซาตินเนื้อลื่นทิ้งตัวบางเบา สัมผัสเย็นเฉียบแนบชิดผิวขาวเนียน เผยแผ่นหลังเปลือยเปล่าและทรวดทรงสะบึมใต้แสงสลัว',
      });
    }

    return list;
  });

  const [activeOutfitIndex, setActiveOutfitIndex] = useState(0);

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
        wardrobeObj[item.key] = [
          item.description,
          item.occasion,
          item.name,
          item.badgeLabel,
        ];
      });

      const anatomyFlat = [
        `${coreAnatomy.eyes.title} — ${coreAnatomy.eyes.detail}`,
        `${coreAnatomy.hair.title} — ${coreAnatomy.hair.detail}`,
        `${coreAnatomy.physique.title} — ${coreAnatomy.physique.detail}`,
        `${coreAnatomy.skin.title} — ${coreAnatomy.skin.detail}`,
        ...customTraits.map((t) => `${t.title} — ${t.detail}`),
      ];

      const updatedStartingState = {
        time: sceneTime,
        weather: sceneWeather,
        location: sceneLocation,
        initial_p_pos: playerStance,
        initial_a_pos: initialPose || postures[0] || '',
        initial_outfit_key: outfits[0]?.key || 'outfit_1',
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
    const newKey = `outfit_${Date.now()}`;
    const newOutfit: OutfitItem = {
      key: newKey,
      badgeLabel: `ชุดที่ ${nextIdx}`,
      name: `ชุดคอลเลกชัน ${nextIdx}`,
      occasion: 'ใส่ตามสถานการณ์ (เช่น ยูนิฟอร์ม, ชุดเที่ยว, ชุดนอน)...',
      description: 'ระบุรายละเอียดเนื้อผ้า คัตติ้ง และสัมผัส...',
    };
    setOutfits((prev) => [...prev, newOutfit]);
    setActiveOutfitIndex(outfits.length);
  };

  const handleRemoveOutfit = (idx: number) => {
    if (outfits.length <= 1) return;
    const filtered = outfits.filter((_, i) => i !== idx);
    setOutfits(filtered);
    setActiveOutfitIndex(Math.max(0, idx - 1));
  };

  const handleRailWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0) {
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  const handleAddCustomTrait = () => {
    const nextIdx = customTraits.length + 1;
    const newTrait: CustomAnatomyTrait = {
      id: `custom-${Date.now()}`,
      title: `จุดเด่นใหม่ ${nextIdx}`,
      detail: 'ระบุรายละเอียดสรีระ จุดเด่น หรือเสน่ห์เฉพาะตัว...',
    };
    setCustomTraits([...customTraits, newTrait]);
  };

  const handleRemoveCustomTrait = (id: string) => {
    setCustomTraits(customTraits.filter((t) => t.id !== id));
  };

  const handleAddPosture = () => {
    setPostures([...postures, 'ระบุภาษากายหรือท่าทางประจำตัวใหม่...']);
  };

  const handleRemovePosture = (idx: number) => {
    if (postures.length <= 1) return;
    setPostures(postures.filter((_, i) => i !== idx));
  };

  const activeOutfit = outfits[activeOutfitIndex] || outfits[0];

  // 4 Core Foundations list for Two-Tier Dual Matrix
  const corePillars = [
    {
      key: 'eyes' as const,
      category: 'ดวงตา & ใบหน้า',
      icon: <Eye size={12} strokeWidth={2.2} />,
      title: coreAnatomy.eyes.title,
      detail: coreAnatomy.eyes.detail,
    },
    {
      key: 'hair' as const,
      category: 'เรือนผม',
      icon: <Wind size={12} strokeWidth={2.2} />,
      title: coreAnatomy.hair.title,
      detail: coreAnatomy.hair.detail,
    },
    {
      key: 'physique' as const,
      category: 'รูปร่างทรวดทรง',
      icon: <Flame size={12} strokeWidth={2.2} />,
      title: coreAnatomy.physique.title,
      detail: coreAnatomy.physique.detail,
    },
    {
      key: 'skin' as const,
      category: 'ผิวพรรณ & สัมผัส',
      icon: <Feather size={12} strokeWidth={2.2} />,
      title: coreAnatomy.skin.title,
      detail: coreAnatomy.skin.detail,
    },
  ];

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
                  <label className="text-[11px] font-medium text-white/50">ชื่อตัวละคร</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ชื่อตัวละคร"
                    className="w-full bg-black/30 border border-white/20 focus:border-[#EF264C] rounded-lg px-2.5 py-1 text-[22px] font-bold text-white outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="text-[10.5px] font-medium text-white/50">Archetype (EN)</label>
                    <input
                      type="text"
                      value={archetype}
                      onChange={(e) => setArchetype(e.target.value)}
                      placeholder="Archetype"
                      className="w-full bg-black/25 border border-white/15 focus:border-[#EF264C] rounded-md px-2 py-1 text-[11.5px] text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-medium text-white/50">คำอธิบายไทย</label>
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
                  <label className="text-[10.5px] font-medium text-white/50">ประโยคคำพูดประจำตัว</label>
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
                <h1 className="text-[32px] sm:text-[34px] font-bold text-[#F1F1F1] tracking-tight leading-[1.15]">
                  {name}
                </h1>
                <div className="text-[13.5px] sm:text-[14px] text-[#A1A1A8] mt-1.5 font-normal leading-normal">
                  <span className="font-medium text-white/80">{archetype}</span>
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
        {/* 👗 WIDGET 2: WARDROBE CLOSET (2x2 -> 346px × 346px - REALISTIC RAIL)    */}
        {/* ======================================================================= */}
        <div
          className={`col-span-2 row-span-2 rounded-[28px] p-4 ${frostedCardClass}`}
          style={{ width: '346px', height: '346px' }}
        >
          {/* Header Row: Wardrobe Closet Title + Quick Add Outfit */}
          <div className="flex items-center justify-between gap-1 mb-2 shrink-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[16px] sm:text-[17px] font-semibold text-[#F1F1F1] tracking-tight">
                ตู้เสื้อผ้า
              </span>
              <span className="text-[11.5px] font-normal text-white/45">
                ({outfits.length} ชุด)
              </span>
            </div>

            {/* Quick Add Hanger Pill */}
            <button
              type="button"
              onClick={handleAddNewOutfit}
              className="px-2 py-0.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/25 text-white/70 hover:text-white flex items-center gap-1 text-[10px] font-medium transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-95 shrink-0"
              title="แขวนชุดใหม่ในตู้เสื้อผ้า"
            >
              <Plus size={10} strokeWidth={2.4} />
              <span>แขวนชุดใหม่</span>
            </button>
          </div>

          {/* ===================================================================== */}
          {/* ✦ REALISTIC SLIDEABLE CLOTHES RAIL (ราวแขวนผ้าโลหะที่สไลด์ได้)            */}
          {/* ===================================================================== */}
          <div className="relative w-full shrink-0 my-0.5 py-0.5">
            {/* Metallic Clothes Rail Bar running behind hangers */}
            <div className="absolute top-[17px] left-0 right-0 h-[2.5px] rounded-full bg-gradient-to-r from-white/15 via-white/35 to-white/15 shadow-[0_1px_3px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.3)] pointer-events-none" />
            {/* Left & Right Metallic Closet Mount Brackets */}
            <div className="absolute top-[14px] left-0 w-1.5 h-[8px] rounded-l-sm bg-gradient-to-b from-white/40 to-white/20 shadow-sm pointer-events-none" />
            <div className="absolute top-[14px] right-0 w-1.5 h-[8px] rounded-r-sm bg-gradient-to-b from-white/40 to-white/20 shadow-sm pointer-events-none" />

            {/* Horizontally Slideable Hanger Track */}
            <div
              onWheel={handleRailWheel}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth px-2 py-1 cursor-grab active:cursor-grabbing select-none relative z-10"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {outfits.map((outfit, idx) => {
                const isActive = idx === activeOutfitIndex;
                return (
                  <div
                    key={outfit.key}
                    onClick={() => setActiveOutfitIndex(idx)}
                    className={`group/hanger flex flex-col items-center shrink-0 cursor-pointer transition-all duration-200 ${
                      isActive ? '-translate-y-0.5' : 'hover:-translate-y-0.5 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* Realistic Metallic Hanger Hook */}
                    <div className="flex flex-col items-center justify-end h-[9px] w-full">
                      <div
                        className={`w-2.5 h-2 rounded-t-full border-t-2 border-l-2 border-r-2 transition-colors ${
                          isActive
                            ? 'border-[#EF264C]'
                            : 'border-white/40 group-hover/hanger:border-white/70'
                        }`}
                      />
                    </div>

                    {/* Hanger Label Tag / Capsule */}
                    <div
                      className={`px-2.5 py-1 rounded-[12px] text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                        isActive
                          ? 'bg-white/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_2px_8px_rgba(0,0,0,0.4)] border border-white/30 font-semibold'
                          : 'bg-black/50 text-white/60 hover:text-white border border-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive ? 'bg-[#EF264C]' : 'bg-white/30 group-hover/hanger:bg-white/60'
                        }`}
                      />
                      <span className="whitespace-nowrap">{outfit.badgeLabel}</span>
                    </div>
                  </div>
                );
              })}

              {/* Add New Hanger Pill directly on the rail */}
              <div
                onClick={handleAddNewOutfit}
                className="group/add flex flex-col items-center shrink-0 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 opacity-45 hover:opacity-100"
                title="เพิ่มชุดใหม่ในตู้"
              >
                <div className="flex flex-col items-center justify-end h-[9px] w-full">
                  <div className="w-2.5 h-2 rounded-t-full border-t border-dashed border-l border-dashed border-r border-dashed border-white/40 group-hover/add:border-white/80" />
                </div>
                <div className="px-2 py-1 rounded-[12px] text-[10px] font-medium flex items-center gap-1 border border-dashed border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.08] text-white/60 hover:text-white whitespace-nowrap transition-all">
                  <Plus size={9} strokeWidth={2.2} />
                  <span>เพิ่มชุด</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* ✦ TACTILE FABRIC & OCCASION TRAY (ถาดสัมผัสเนื้อผ้าและสถานการณ์)          */}
          {/* ===================================================================== */}
          <div className="flex-1 p-3.5 rounded-[20px] bg-black/40 backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.35)] flex flex-col justify-between overflow-hidden">
            {isEditing ? (
              <div className="flex-1 flex flex-col justify-between gap-1.5 overflow-y-auto no-scrollbar">
                {/* Style Name & Badge */}
                <div className="grid grid-cols-3 gap-1.5 shrink-0">
                  <div className="col-span-1">
                    <label className="text-[10px] font-medium text-white/50">ป้ายชื่อราว</label>
                    <input
                      type="text"
                      value={activeOutfit.badgeLabel}
                      onChange={(e) => {
                        const updated = [...outfits];
                        updated[activeOutfitIndex].badgeLabel = e.target.value;
                        setOutfits(updated);
                      }}
                      className="w-full bg-black/30 border border-white/15 focus:border-[#EF264C] rounded px-2 py-0.5 text-[11px] text-white outline-none"
                      placeholder="ป้ายชื่อ..."
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-medium text-white/50">ชื่อสไตล์ชุด</label>
                    <input
                      type="text"
                      value={activeOutfit.name}
                      onChange={(e) => {
                        const updated = [...outfits];
                        updated[activeOutfitIndex].name = e.target.value;
                        setOutfits(updated);
                      }}
                      className="w-full bg-black/30 border border-white/15 focus:border-[#EF264C] rounded px-2 py-0.5 text-[11.5px] font-semibold text-white outline-none"
                      placeholder="ชื่อชุด..."
                    />
                  </div>
                </div>

                {/* Occasion / Scenario Trigger */}
                <div className="shrink-0">
                  <label className="text-[10px] font-medium text-white/50">สถานการณ์ที่สวมใส่ (AI เลือกอัตโนมัติ)</label>
                  <input
                    type="text"
                    value={activeOutfit.occasion}
                    onChange={(e) => {
                      const updated = [...outfits];
                      updated[activeOutfitIndex].occasion = e.target.value;
                      setOutfits(updated);
                    }}
                    className="w-full bg-black/30 border border-white/15 focus:border-[#EF264C] rounded px-2 py-0.5 text-[11px] text-white/90 outline-none"
                    placeholder="เช่น ยูนิฟอร์มโรงเรียน, ชุดอยู่บ้าน, ชุดเที่ยว..."
                  />
                </div>

                {/* Fabric Description */}
                <div className="flex-1 flex flex-col min-h-0">
                  <label className="text-[10px] font-medium text-white/50">รายละเอียดเนื้อผ้า & สัมผัส</label>
                  <textarea
                    rows={3}
                    value={activeOutfit.description}
                    onChange={(e) => {
                      const updated = [...outfits];
                      updated[activeOutfitIndex].description = e.target.value;
                      setOutfits(updated);
                    }}
                    placeholder="รายละเอียดเนื้อผ้า คัตติ้ง..."
                    className="w-full flex-1 bg-black/30 border border-white/15 focus:border-[#EF264C] rounded-md p-1.5 text-[11px] text-[#EDEDED] outline-none leading-normal resize-none"
                  />
                </div>

                {/* Delete outfit button */}
                {outfits.length > 1 && (
                  <div className="flex justify-end pt-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRemoveOutfit(activeOutfitIndex)}
                      className="text-[10px] text-red-400/80 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 size={10} /> ปลดชุดนี้ออกจากราว
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col justify-between h-full">
                <div className="space-y-1.5">
                  {/* Garment Style Name */}
                  <div className="text-[15px] font-semibold text-white tracking-tight leading-snug truncate">
                    {activeOutfit.name}
                  </div>

                  {/* Occasion / Scenario Trigger Pill (Pure Situational, No Default concept) */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11.5px] text-white/80 max-w-full">
                    <span className="text-[#EF264C] text-[9px]">✦</span>
                    <span className="text-white/40 text-[10.5px] shrink-0 font-medium">สวมใส่เมื่อ:</span>
                    <span className="text-white/90 truncate font-normal">{activeOutfit.occasion}</span>
                  </div>
                </div>

                {/* Subtle Hairline Divider */}
                <div className="w-full h-[1px] bg-white/[0.06] my-1" />

                {/* Fabric & Sensory Texture */}
                <p className="text-[13px] text-[#D6D6DC] leading-relaxed font-normal line-clamp-4">
                  {activeOutfit.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 👓 WIDGET 3: ANATOMY & PHYSIQUE (2x2 -> 346px × 346px - TWO-TIER DUAL MATRIX) */}
        {/* ======================================================================= */}
        <div
          className="col-span-2 row-span-2 rounded-[28px] p-4 bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all flex flex-col justify-between relative z-10 hover:z-50 focus-within:z-50"
          style={{ width: '346px', height: '346px' }}
        >
          {/* Header Row: Pure Thai Label + Trait Counter + Quick Add */}
          <div className="flex items-center justify-between gap-1 mb-2 shrink-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[16px] sm:text-[17px] font-semibold text-[#F1F1F1] tracking-tight">
                สรีระและจุดเด่น
              </span>
              <span className="text-[11px] font-normal text-white/45">
                (4 ส่วนหลัก{customTraits.length > 0 ? ` + ${customTraits.length} จุดเด่น` : ''})
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddCustomTrait}
              className="px-2 py-0.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/25 text-white/70 hover:text-white flex items-center gap-1 text-[10.5px] font-medium transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-95 shrink-0"
              title="เพิ่มจุดเด่นหรือเสน่ห์เฉพาะตัว"
            >
              <Plus size={10} strokeWidth={2.4} />
              <span>เพิ่มจุดเด่น</span>
            </button>
          </div>

          {isEditing ? (
            /* ================================================================= */
            /* ✦ EDITING MODE: EDIT CORE PILLARS & CUSTOM CHARMS                 */
            /* ================================================================= */
            <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto no-scrollbar pr-0.5">
              {/* Core Pillars Inputs */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-[#F1F1F1] flex items-center gap-1">
                  <span className="text-[#EF264C]">✦</span>
                  <span>4 สัดส่วนหลักของร่างกาย</span>
                </div>

                {corePillars.map((pillar) => (
                  <div
                    key={pillar.key}
                    className="p-2 rounded-[14px] bg-black/30 border border-white/10 space-y-1"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/70">{pillar.icon}</span>
                      <span className="text-[11px] font-semibold text-white/80">
                        {pillar.category}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={coreAnatomy[pillar.key].title}
                      onChange={(e) =>
                        setCoreAnatomy({
                          ...coreAnatomy,
                          [pillar.key]: {
                            ...coreAnatomy[pillar.key],
                            title: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-black/30 border border-white/15 focus:border-[#EF264C] rounded px-2 py-0.5 text-[11px] font-semibold text-white outline-none"
                      placeholder="หัวข้อสั้น เช่น ตาดำขลับใต้แว่น..."
                    />
                    <textarea
                      rows={2}
                      value={coreAnatomy[pillar.key].detail}
                      onChange={(e) =>
                        setCoreAnatomy({
                          ...coreAnatomy,
                          [pillar.key]: {
                            ...coreAnatomy[pillar.key],
                            detail: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-black/30 border border-white/15 focus:border-[#EF264C] rounded px-2 py-1 text-[11px] text-[#EDEDED] outline-none leading-relaxed resize-none"
                      placeholder="คำบรรยายสรีระแบบเต็ม..."
                    />
                  </div>
                ))}
              </div>

              {/* Custom Nuances Inputs */}
              <div className="space-y-2 pt-1 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#F1F1F1] flex items-center gap-1">
                    <span className="text-[#EF264C]">✦</span>
                    <span>จุดเด่นและเสน่ห์เฉพาะตัว ({customTraits.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAddCustomTrait}
                    className="text-[10px] text-[#EF264C] hover:underline flex items-center gap-0.5 font-semibold cursor-pointer"
                  >
                    <Plus size={10} /> เพิ่มจุดเด่น
                  </button>
                </div>

                {customTraits.map((trait, idx) => (
                  <div
                    key={trait.id}
                    className="p-2 rounded-[14px] bg-black/30 border border-white/10 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={trait.title}
                        onChange={(e) => {
                          const updated = [...customTraits];
                          updated[idx].title = e.target.value;
                          setCustomTraits(updated);
                        }}
                        className="bg-black/30 border border-white/15 focus:border-[#EF264C] rounded px-2 py-0.5 text-[11px] font-semibold text-white outline-none flex-1"
                        placeholder="ชื่อจุดเด่น..."
                      />
                      {customTraits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomTrait(trait.id)}
                          className="text-white/40 hover:text-red-400 p-0.5 cursor-pointer"
                          title="ลบจุดเด่นนี้"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={trait.detail}
                      onChange={(e) => {
                        const updated = [...customTraits];
                        updated[idx].detail = e.target.value;
                        setCustomTraits(updated);
                      }}
                      className="w-full bg-black/30 border border-white/15 focus:border-[#EF264C] rounded px-2 py-1 text-[11px] text-[#EDEDED] outline-none leading-relaxed resize-none"
                      placeholder="คำบรรยายจุดเด่น..."
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ================================================================= */
            /* ✦ TWO-TIER DUAL MATRIX (READING MODE WITH APPLE HOVER POPOVERS)   */
            /* ================================================================= */
            <div className="flex-1 flex flex-col justify-between relative">
              {/* --------------------------------------------------------------- */}
              {/* 👑 TIER 1: 4 CORE ANATOMICAL FOUNDATIONS (2x2 FROSTED MATRIX)   */}
              {/* --------------------------------------------------------------- */}
              <div className="grid grid-cols-2 gap-2 shrink-0">
                {corePillars.map((pillar, idx) => {
                  const isTopRow = idx < 2;
                  const isLeftCol = idx % 2 === 0;
                  return (
                    <div
                      key={pillar.key}
                      className="group relative hover:z-50 focus-within:z-50 p-2.5 rounded-[18px] bg-black/40 hover:bg-white/[0.08] backdrop-blur-xl border border-white/[0.07] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex flex-col justify-between transition-all duration-200 cursor-pointer h-[72px]"
                    >
                      {/* Top row: Icon + Category Name */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-5 h-5 rounded-[7px] bg-white/[0.08] border border-white/10 flex items-center justify-center text-white/80 group-hover:text-white group-hover:bg-[#EF264C]/25 group-hover:border-[#EF264C]/40 transition-colors shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                          {pillar.icon}
                        </div>
                        <span className="text-[10.5px] font-medium text-white/50 group-hover:text-white/85 transition-colors truncate">
                          {pillar.category}
                        </span>
                      </div>

                      {/* Bottom row: Concise Headline + Hint */}
                      <div className="mt-0.5">
                        <div className="text-[12.5px] font-semibold text-white tracking-tight truncate leading-snug">
                          {pillar.title}
                        </div>
                        <div className="text-[9.5px] text-white/40 group-hover:text-[#EF264C]/90 transition-colors truncate font-normal">
                          ชี้ดูรายละเอียด...
                        </div>
                      </div>

                      {/* ✦ APPLE FROSTED GLASS POPOVER (TOOLTIP IN FRONT OF ALL CARDS) */}
                      <div
                        className={`absolute ${
                          isTopRow ? 'top-full mt-2' : 'bottom-full mb-2'
                        } ${
                          isLeftCol ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
                        } w-[285px] p-3.5 rounded-[20px] bg-[#161618] backdrop-blur-3xl border border-white/25 shadow-[0_22px_50px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.25)] opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-[100] transform scale-95 group-hover:scale-100`}
                      >
                        <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-white/10">
                          <div className="w-4 h-4 rounded-full bg-[#EF264C]/20 text-[#EF264C] flex items-center justify-center text-[9.5px]">
                            ✦
                          </div>
                          <span className="text-[11px] font-semibold text-white tracking-tight">
                            {pillar.category}
                          </span>
                          <span className="text-white/30 text-[10px]">•</span>
                          <span className="text-[11px] font-medium text-white/70 truncate">
                            {pillar.title}
                          </span>
                        </div>
                        <p className="text-[12px] text-[#EDEDED] leading-relaxed font-normal">
                          {pillar.detail}
                        </p>
                        {/* Pointer triangle */}
                        <div
                          className={`absolute ${
                            isTopRow
                              ? 'bottom-full -mb-[1px] border-b-[#161618] border-b-[6px]'
                              : 'top-full -mt-[1px] border-t-[#161618] border-t-[6px]'
                          } ${
                            isLeftCol ? 'left-6' : 'right-6'
                          } w-0 h-0 border-x-[6px] border-x-transparent`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* --------------------------------------------------------------- */}
              {/* ✦ TIER 2: UNLIMITED CUSTOM TRAITS & CHARMS (VISIBLE DOCK)       */}
              {/* --------------------------------------------------------------- */}
              <div className="flex flex-col justify-end mt-2 pt-1 border-t border-white/[0.06] relative">
                {/* Subhead */}
                <div className="flex items-center justify-between px-1 mb-1.5 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#EF264C]">✦</span>
                    <span className="text-[11.5px] font-semibold text-[#F1F1F1] tracking-tight">
                      จุดเด่นและเสน่ห์เฉพาะตัว
                    </span>
                    <span className="text-[10.5px] font-normal text-white/40">
                      ({customTraits.length} ส่วน)
                    </span>
                  </div>
                  <span className="text-[9.5px] text-white/35 font-normal">
                    เพิ่มได้ไม่จำกัด
                  </span>
                </div>

                {/* Custom traits pills container */}
                <div className="flex items-center gap-1.5 py-0.5 px-0.5 flex-wrap select-none relative">
                  {customTraits.map((trait, traitIdx) => {
                    const isNearLeft = traitIdx === 0;
                    const isNearRight = traitIdx === customTraits.length - 1 && customTraits.length > 1;
                    const popoverPos = isNearLeft
                      ? 'left-0 origin-bottom-left'
                      : isNearRight
                      ? 'right-0 origin-bottom-right'
                      : 'left-1/2 -translate-x-1/2 origin-bottom';
                    const arrowPos = isNearLeft
                      ? 'left-6'
                      : isNearRight
                      ? 'right-6'
                      : 'left-1/2 -translate-x-1/2';

                    return (
                      <div
                        key={trait.id}
                        className="group relative hover:z-50 focus-within:z-50 px-3 py-1.5 rounded-[14px] bg-black/40 hover:bg-white/[0.10] border border-white/[0.07] hover:border-white/20 flex items-center gap-2 shrink-0 transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C] shrink-0" />
                        <span className="text-[12px] font-medium text-white/90 whitespace-nowrap">
                          {trait.title}
                        </span>

                        {/* Hover Popover Tooltip for Custom Trait (floats upward in front) */}
                        <div
                          className={`absolute bottom-full mb-2 ${popoverPos} w-[285px] p-3.5 rounded-[20px] bg-[#161618] backdrop-blur-3xl border border-white/25 shadow-[0_22px_50px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.25)] opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-[100] transform scale-95 group-hover:scale-100`}
                        >
                          <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-white/10">
                            <div className="w-4 h-4 rounded-full bg-[#EF264C]/20 text-[#EF264C] flex items-center justify-center text-[9.5px]">
                              ✦
                            </div>
                            <span className="text-[11px] font-semibold text-white tracking-tight">
                              จุดเด่นเฉพาะตัว
                            </span>
                            <span className="text-white/30 text-[10px]">•</span>
                            <span className="text-[11px] font-medium text-white/70 truncate">
                              {trait.title}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#EDEDED] leading-relaxed font-normal">
                            {trait.detail}
                          </p>
                          <div
                            className={`absolute top-full -mt-[1px] ${arrowPos} w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-[#161618]`}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Inline Add Button on rail */}
                  <button
                    type="button"
                    onClick={handleAddCustomTrait}
                    className="px-2.5 py-1.5 rounded-[14px] border border-dashed border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.08] text-white/60 hover:text-white flex items-center gap-1 text-[11px] font-medium transition-all cursor-pointer shrink-0"
                  >
                    <Plus size={11} strokeWidth={2.4} />
                    <span>เพิ่มจุดเด่น</span>
                  </button>
                </div>
              </div>
            </div>
          )}
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
            <span className="text-[15px] sm:text-[16px] font-semibold text-[#F1F1F1] tracking-tight">
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
                    className={`text-[9.5px] font-mono font-semibold w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
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
                      className="bg-black/30 border border-white/15 focus:border-[#EF264C] rounded px-2 py-0.5 text-[11px] text-[#F1F1F1] outline-none flex-1 font-normal"
                    />
                  ) : (
                    <span className="text-[12.5px] text-[#EDEDED] truncate flex-1 font-normal">
                      {poseText}
                    </span>
                  )}

                  {isInitial && !isEditing && (
                    <span className="text-[9.5px] font-semibold text-[#EF264C] bg-[#EF264C]/20 border border-[#EF264C]/40 px-2 py-0.5 rounded-full shrink-0">
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
              <Moon size={12} className="text-white/70" />
              {isEditing ? (
                <input
                  type="text"
                  value={sceneTime}
                  onChange={(e) => setSceneTime(e.target.value)}
                  placeholder="เวลา"
                  className="bg-black/30 border border-white/15 focus:border-[#EF264C] rounded px-1.5 py-0.5 text-[11px] text-white outline-none w-14"
                />
              ) : (
                <span className="text-[12px] text-white/75 font-medium truncate">
                  {sceneTime}
                </span>
              )}
            </div>

            <div className="w-6 h-6 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
              <CloudRain size={12} className="text-sky-400" />
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
                  className="w-full bg-black/30 border border-white/15 focus:border-[#EF264C] rounded px-1.5 py-0.5 text-[13px] font-semibold text-white outline-none"
                />
                <input
                  type="text"
                  value={sceneLocation}
                  onChange={(e) => setSceneLocation(e.target.value)}
                  placeholder="สถานที่"
                  className="w-full bg-black/25 border border-white/10 focus:border-[#EF264C] rounded px-1.5 py-0.5 text-[11px] text-white/80 outline-none"
                />
              </div>
            ) : (
              <div>
                <div className="text-[17px] sm:text-[18px] font-semibold text-white tracking-tight truncate leading-tight">
                  {sceneWeather}
                </div>
                <div className="text-[12px] text-[#A1A1A8] truncate mt-1 font-normal">
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
            <span className="text-[14px] sm:text-[15px] font-semibold text-[#F1F1F1] tracking-tight">
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
                className="w-full bg-black/30 border border-white/15 focus:border-[#EF264C] rounded px-2 py-1 text-[11.5px] text-white outline-none"
              />
            ) : (
              <div>
                <div className="text-[13.5px] font-semibold text-white tracking-tight leading-snug line-clamp-3">
                  {playerStance}
                </div>
                <div className="text-[11px] text-[#A1A1A8] mt-1.5 truncate font-normal">
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
