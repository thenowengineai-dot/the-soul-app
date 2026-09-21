import { useState, useEffect } from 'react';
import {
  Pencil,
  Check,
  Plus,
  Trash2,
  Eye,
  Wind,
  Flame,
  Feather,
  Sparkles,
  ChevronLeft,
  ChevronRight,
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

  // 4. Signature Postures (Unlimited Kinematic Slide Reel)
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
  const [activePostureIndex, setActivePostureIndex] = useState(0);

  // 5. Active Anatomy Key for Tactile Sensory Tray (Wardrobe Model)
  const [activeAnatomyKey, setActiveAnatomyKey] = useState<string>('eyes');

  // External draft sync
  useEffect(() => {
    if (draft.title && !draft.title.includes('ตัวละครใหม่')) {
      setName((prev) => (prev !== draft.title ? draft.title! : prev));
    }
    if (draft.quote) {
      setQuote((prev) => (prev !== draft.quote ? draft.quote! : prev));
    }
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
        time: draft.starting_state?.time || 'ยามค่ำคืน',
        weather: draft.starting_state?.weather || 'แอร์เย็นสบาย',
        location: draft.starting_state?.location || 'ห้อง VIP บาร์หรู',
        initial_p_pos: draft.starting_state?.initial_p_pos || 'นั่งเอนตัวจิบเครื่องดื่ม',
        initial_a_pos: postures[0] || '',
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
    const nextIdx = postures.length + 1;
    const newPosture = `ระบุท่วงท่าหรือภาษากายที่ ${nextIdx}...`;
    setPostures((prev) => [...prev, newPosture]);
    setActivePostureIndex(postures.length);
  };

  const handleRemovePosture = (idx: number) => {
    if (postures.length <= 1) return;
    const filtered = postures.filter((_, i) => i !== idx);
    setPostures(filtered);
    setActivePostureIndex((prev) =>
      Math.max(0, Math.min(filtered.length - 1, prev >= idx ? prev - 1 : prev))
    );
  };

  const activeOutfit = outfits[activeOutfitIndex] || outfits[0];

  // 4 Core Foundations list with Sensory Color Auras
  const corePillars = [
    {
      key: 'eyes' as const,
      category: 'ดวงตา & ใบหน้า',
      icon: <Eye size={13} strokeWidth={2.2} />,
      colorClass: 'text-amber-400 bg-amber-400/10 border-amber-400/25',
      accentColor: '#fbbf24',
      title: coreAnatomy.eyes.title,
      detail: coreAnatomy.eyes.detail,
    },
    {
      key: 'hair' as const,
      category: 'เรือนผม',
      icon: <Wind size={13} strokeWidth={2.2} />,
      colorClass: 'text-violet-300 bg-violet-400/10 border-violet-400/25',
      accentColor: '#c4b5fd',
      title: coreAnatomy.hair.title,
      detail: coreAnatomy.hair.detail,
    },
    {
      key: 'physique' as const,
      category: 'รูปร่างทรวดทรง',
      icon: <Flame size={13} strokeWidth={2.2} />,
      colorClass: 'text-[#EF264C] bg-[#EF264C]/10 border-[#EF264C]/25',
      accentColor: '#EF264C',
      title: coreAnatomy.physique.title,
      detail: coreAnatomy.physique.detail,
    },
    {
      key: 'skin' as const,
      category: 'ผิวพรรณ & สัมผัส',
      icon: <Feather size={13} strokeWidth={2.2} />,
      colorClass: 'text-rose-300 bg-rose-300/10 border-rose-300/25',
      accentColor: '#fda4af',
      title: coreAnatomy.skin.title,
      detail: coreAnatomy.skin.detail,
    },
  ];

  // All Anatomy & Trait Items (Core + Custom) for Unified Living Constellation
  const allAnatomyItems = [
    {
      id: 'eyes',
      category: 'ดวงตา & ใบหน้า',
      icon: <Eye size={13} strokeWidth={2.2} />,
      colorClass: 'text-amber-400 bg-amber-400/10 border-amber-400/25',
      accentColor: '#fbbf24',
      title: coreAnatomy.eyes.title,
      detail: coreAnatomy.eyes.detail,
      isCore: true,
    },
    {
      id: 'hair',
      category: 'เรือนผม',
      icon: <Wind size={13} strokeWidth={2.2} />,
      colorClass: 'text-violet-300 bg-violet-400/10 border-violet-400/25',
      accentColor: '#c4b5fd',
      title: coreAnatomy.hair.title,
      detail: coreAnatomy.hair.detail,
      isCore: true,
    },
    {
      id: 'physique',
      category: 'รูปร่างทรวดทรง',
      icon: <Flame size={13} strokeWidth={2.2} />,
      colorClass: 'text-[#EF264C] bg-[#EF264C]/10 border-[#EF264C]/25',
      accentColor: '#EF264C',
      title: coreAnatomy.physique.title,
      detail: coreAnatomy.physique.detail,
      isCore: true,
    },
    {
      id: 'skin',
      category: 'ผิวพรรณ & สัมผัส',
      icon: <Feather size={13} strokeWidth={2.2} />,
      colorClass: 'text-rose-300 bg-rose-300/10 border-rose-300/25',
      accentColor: '#fda4af',
      title: coreAnatomy.skin.title,
      detail: coreAnatomy.skin.detail,
      isCore: true,
    },
    ...customTraits.map((t, idx) => ({
      id: t.id,
      category: 'จุดเด่นเฉพาะตัว',
      icon: <Sparkles size={13} strokeWidth={2.2} />,
      colorClass:
        idx % 2 === 0
          ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25'
          : 'text-sky-400 bg-sky-400/10 border-sky-400/25',
      accentColor: idx % 2 === 0 ? '#34d399' : '#38bdf8',
      title: t.title,
      detail: t.detail,
      isCore: false,
    })),
  ];

  const currentActiveAnatomy =
    allAnatomyItems.find((item) => item.id === activeAnatomyKey) || allAnatomyItems[0];

  // ✦ APPLE SUBTLE WHITE FROSTED GLASS RECIPE (SAME AS COIN, HUD & CHATLIST BUTTONS)
  // Zero harsh drop-shadow! Clean 1px translucent border + top inner highlight.
  const frostedCardClass =
    'bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all flex flex-col justify-between relative overflow-hidden';

  return (
    <>

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
        {/* 👓 WIDGET 3: ANATOMY & PHYSIQUE (2x2 -> 346px × 346px - TACTILE TRAY SYSTEM) */}
        {/* ======================================================================= */}
        <div
          className={`col-span-2 row-span-2 rounded-[28px] p-4 ${frostedCardClass}`}
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
            /* ✦ READING MODE: 4 PILLARS (2 COLS) + HAIRLINE + CUSTOM + TACTILE TRAY */
            /* ================================================================= */
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              {/* Top Section: 4 Core Foundations in 2 Columns */}
              <div className="grid grid-cols-2 gap-1.5 shrink-0">
                {corePillars.map((pillar) => {
                  const isActive = activeAnatomyKey === pillar.key;
                  return (
                    <button
                      key={pillar.key}
                      type="button"
                      onClick={() => setActiveAnatomyKey(pillar.key)}
                      className={`px-2.5 py-1.5 rounded-[13px] flex items-center gap-2 transition-all cursor-pointer text-left select-none ${
                        isActive
                          ? 'bg-white/[0.14] border border-white/30 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] font-medium'
                          : 'bg-black/35 hover:bg-white/[0.06] border border-white/[0.07] hover:border-white/15 text-white/70 hover:text-white'
                      }`}
                    >
                      <span
                        className="shrink-0 transition-colors"
                        style={{ color: isActive ? '#FFFFFF' : pillar.accentColor }}
                      >
                        {pillar.icon}
                      </span>
                      <span className="text-[11.5px] truncate leading-none">
                        {pillar.category}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Subtle 1px Hairline Divider */}
              <div className="w-full h-[1px] bg-white/[0.06] my-1 shrink-0" />

              {/* Custom Traits Row (Seamless Continuation) */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 select-none shrink-0">
                {customTraits.map((trait) => {
                  const isActive = activeAnatomyKey === trait.id;
                  return (
                    <button
                      key={trait.id}
                      type="button"
                      onClick={() => setActiveAnatomyKey(trait.id)}
                      className={`px-2.5 py-1 rounded-[11px] text-[11px] flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-white/[0.14] border border-white/30 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] font-medium'
                          : 'bg-black/35 hover:bg-white/[0.06] border border-white/[0.07] hover:border-white/15 text-white/65 hover:text-white'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isActive ? 'bg-[#EF264C]' : 'bg-white/30'
                        }`}
                      />
                      <span className="whitespace-nowrap">{trait.title}</span>
                    </button>
                  );
                })}

                {/* Quick Add Pill on Track */}
                <button
                  type="button"
                  onClick={handleAddCustomTrait}
                  className="px-2 py-1 rounded-[11px] border border-dashed border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.08] text-white/50 hover:text-white flex items-center gap-1 text-[10.5px] transition-all cursor-pointer shrink-0"
                  title="เพิ่มจุดเด่นใหม่"
                >
                  <Plus size={9} strokeWidth={2.4} />
                  <span>เพิ่มจุดเด่น</span>
                </button>
              </div>

              {/* ===================================================================== */}
              {/* ✦ THE TACTILE SENSORY TRAY (ถาดสัมผัสเนื้อหาสไตล์เดียวกับตู้เสื้อผ้า)       */}
              {/* ===================================================================== */}
              <div className="flex-1 p-3 rounded-[18px] bg-black/40 backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.35)] flex flex-col justify-between overflow-hidden mt-1.5">
                <div
                  key={currentActiveAnatomy.id}
                  className="flex-1 flex flex-col justify-between overflow-hidden animate-fade-in-scale"
                >
                  {/* Tray Top Bar: Category + Headline */}
                  <div className="flex items-center justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="shrink-0"
                        style={{ color: currentActiveAnatomy.accentColor || '#EF264C' }}
                      >
                        {currentActiveAnatomy.icon}
                      </span>
                      <span className="text-[11.5px] font-semibold text-white/90 truncate">
                        {currentActiveAnatomy.category}
                      </span>
                    </div>

                    <span className="text-[12px] font-medium text-[#F1F1F1] truncate max-w-[170px] text-right">
                      {currentActiveAnatomy.title}
                    </span>
                  </div>

                  <div className="w-full h-[1px] bg-white/[0.06] my-1 shrink-0" />

                  {/* Full Literary Prose Description */}
                  <p className="text-[12.5px] sm:text-[13px] text-[#D6D6DC] leading-relaxed font-normal line-clamp-4 overflow-y-auto no-scrollbar pr-0.5">
                    {currentActiveAnatomy.detail}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================================= */}
        {/* 🎭 WIDGET 4: SIGNATURE POSTURES (2x1 -> 346px × 165px - SLIDE REEL)       */}
        {/* ======================================================================= */}
        <div
          className={`col-span-2 row-span-1 rounded-[28px] p-3.5 order-last ${frostedCardClass}`}
          style={{ width: '346px', height: '165px' }}
        >
          {/* Header Row: Title + Posture Count + Slide Controls */}
          <div className="flex items-center justify-between gap-1 shrink-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[15px] sm:text-[16px] font-semibold text-[#F1F1F1] tracking-tight">
                ท่วงท่าประจำตัว
              </span>
              <span className="text-[11px] font-normal text-white/45">
                ({postures.length} ท่า)
              </span>
            </div>

            {/* Slide Navigation Controls (< 01 / 03 >) */}
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-xl border border-white/[0.08] px-1.5 py-0.5 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <button
                type="button"
                onClick={() =>
                  setActivePostureIndex((prev) =>
                    prev > 0 ? prev - 1 : postures.length - 1
                  )
                }
                className="w-5 h-5 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                title="ท่าก่อนหน้า"
              >
                <ChevronLeft size={12} strokeWidth={2.4} />
              </button>

              <span className="text-[10.5px] font-mono font-medium text-white/80 tracking-wider px-1 select-none">
                {String(activePostureIndex + 1).padStart(2, '0')}
                <span className="text-white/30 mx-0.5">/</span>
                {String(postures.length).padStart(2, '0')}
              </span>

              <button
                type="button"
                onClick={() =>
                  setActivePostureIndex((prev) =>
                    prev < postures.length - 1 ? prev + 1 : 0
                  )
                }
                className="w-5 h-5 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                title="ท่าถัดไป"
              >
                <ChevronRight size={12} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          {/* Center Stage: The Kinematic Full-Prose Tray */}
          <div className="flex-1 p-2.5 sm:p-3 rounded-[18px] bg-black/40 backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.35)] flex flex-col justify-center overflow-hidden my-1">
            {isEditing ? (
              <textarea
                rows={3}
                value={postures[activePostureIndex] || ''}
                onChange={(e) => {
                  const updated = [...postures];
                  updated[activePostureIndex] = e.target.value;
                  setPostures(updated);
                }}
                placeholder="ระบุคำบรรยายท่วงท่าหรือภาษากายแบบเต็ม..."
                className="w-full h-full bg-transparent border-none text-[12px] text-white outline-none leading-relaxed resize-none no-scrollbar p-0"
              />
            ) : (
              <div
                key={activePostureIndex}
                className="flex items-start gap-1.5 animate-fade-in-scale select-text overflow-hidden"
              >
                <span className="text-[#EF264C] text-[11px] font-serif select-none shrink-0 mt-0.5">
                  “
                </span>
                <p className="text-[12px] sm:text-[12.5px] text-[#EDEDED] leading-relaxed font-normal line-clamp-3 overflow-y-auto no-scrollbar pr-0.5">
                  {postures[activePostureIndex]}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Row: Quick-Jump Cue Number Track & Actions */}
          <div className="flex items-center justify-between gap-1.5 shrink-0 select-none">
            {/* Quick-Jump Monospace Number Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {postures.map((_, idx) => {
                const isActive = idx === activePostureIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePostureIndex(idx)}
                    className={`h-5 px-2 rounded-full text-[10px] font-mono flex items-center justify-center transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white/20 text-white border border-white/30 font-semibold shadow-sm'
                        : 'bg-white/[0.04] hover:bg-white/[0.10] border border-white/[0.06] text-white/50 hover:text-white font-normal'
                    }`}
                  >
                    0{idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Actions: Delete (when editing) or Quick Add Pill */}
            <div className="flex items-center gap-1.5 shrink-0">
              {isEditing && postures.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemovePosture(activePostureIndex)}
                  className="text-[10px] text-red-400/80 hover:text-red-300 flex items-center gap-0.5 cursor-pointer transition-colors mr-1"
                  title="ลบท่านี้"
                >
                  <Trash2 size={10} /> ลบท่านี้
                </button>
              )}

              <button
                type="button"
                onClick={handleAddPosture}
                className="px-2 py-0.5 rounded-full border border-dashed border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.08] text-white/60 hover:text-white flex items-center gap-1 text-[10px] font-medium transition-all cursor-pointer active:scale-95"
                title="เพิ่มท่าทางใหม่"
              >
                <Plus size={9} strokeWidth={2.4} />
                <span>เพิ่มท่า</span>
              </button>
            </div>
          </div>
        </div>

    </>
  );
}
