import { useState, useMemo, type MouseEvent } from 'react';
import {
  Pencil,
  Check,
  Shirt,
  User,
  Zap,
} from 'lucide-react';
import type { WorldStartingState, VaultDraft } from '../../types';
import { PORT_Y_OFFSET } from './RailroadCableOverlay';

export const GENESIS_WIDTH = 346;
export const GENESIS_HEIGHT = 346;
export const DEFAULT_GENESIS_X = -320;
export const DEFAULT_GENESIS_Y = 220;

interface WardrobeOption {
  key: string;
  badgeLabel: string;
  name: string;
  desc: string;
}

interface GenesisNodeCardProps {
  draft?: VaultDraft;
  startingState?: WorldStartingState;
  position?: { x: number; y: number };
  onUpdateStartingState?: (updated: WorldStartingState) => void;
  onStartDrag?: (e: MouseEvent) => void;
  isEditable?: boolean;
}

export default function GenesisNodeCard({
  draft,
  startingState,
  position = { x: DEFAULT_GENESIS_X, y: DEFAULT_GENESIS_Y },
  onUpdateStartingState,
  onStartDrag,
  isEditable = true,
}: GenesisNodeCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  // 1. Extract and sync wardrobe list directly from character appearance
  const wardrobeList: WardrobeOption[] = useMemo(() => {
    const w = (draft?.appearance?.wardrobe || {}) as Record<string, string[] | undefined>;
    const list: WardrobeOption[] = [];

    const o1Desc =
      w.outfit_1?.[0] ||
      'ชุดยูกาตะผ้าฝ้ายเนื้อหนาสีเข้มตัวโคร่งที่ดูแบนราบไร้ส่วนเว้าโค้ง พร้อมแว่นตากรอบหนาเตอะปิดบังใบหน้า';
    const o1Name = w.outfit_1?.[2] || 'ชุดยูกาตะผ้าฝ้ายเนื้อหนาตัวโคร่ง';
    const o1Badge = w.outfit_1?.[3] || 'ยูกาตะตัวโคร่ง';
    list.push({ key: 'outfit_1', badgeLabel: o1Badge, name: o1Name, desc: o1Desc });

    const o2Desc =
      w.outfit_2?.[0] ||
      'เสื้อเชิ้ตสีขาวและกระโปรงยาวสีทึบเรียบร้อย ทว่ายามเปียกฝนจะแนบเนื้อจนโปร่งแสง เผยให้เห็นบราเซียลูกไม้สีดำสนิทขัดกับผิวขาวจัด';
    const o2Name = w.outfit_2?.[2] || 'เสื้อเชิ้ตขาวเปียกฝน';
    const o2Badge = w.outfit_2?.[3] || 'เชิ้ตขาวเปียกฝน';
    list.push({ key: 'outfit_2', badgeLabel: o2Badge, name: o2Name, desc: o2Desc });

    // Additional custom outfits
    Object.keys(w).forEach((k) => {
      if (k !== 'outfit_1' && k !== 'outfit_2' && Array.isArray(w[k]) && w[k]!.length > 0) {
        const item = w[k]!;
        list.push({
          key: k,
          badgeLabel: item[3] || item[2] || `ชุด ${k}`,
          name: item[2] || `ชุด ${k}`,
          desc: item[0] || '',
        });
      }
    });

    return list;
  }, [draft?.appearance?.wardrobe]);

  // Current active outfit
  const [selectedOutfitKey, setSelectedOutfitKey] = useState<string>(() => {
    const rawKey = startingState?.initial_outfit_key;
    const matched = wardrobeList.find(
      (w) => w.key === rawKey || w.badgeLabel === rawKey || w.name === rawKey
    );
    return matched?.key || wardrobeList[0]?.key || 'outfit_1';
  });

  const activeOutfit = useMemo(() => {
    return wardrobeList.find((w) => w.key === selectedOutfitKey) || wardrobeList[0];
  }, [wardrobeList, selectedOutfitKey]);

  // Form states for inline editing
  const [aPos, setAPos] = useState(
    startingState?.initial_a_pos || 'นั่งก้มหน้านิ่งใช้นิ้วดันดั้งแว่นด้วยความประหม่า'
  );
  const [pPos, setPPos] = useState(
    startingState?.initial_p_pos || 'ยืนสะพายกระเป๋าอุปกรณ์พฤกษศาสตร์ใบโต'
  );
  const [spark, setSpark] = useState(
    startingState?.first_spark ||
      'ไอน้ำชาเขียวอบอุ่นในห้องโถงเสื่อทาทามิถูกขัดจังหวะด้วยข้ออ้างการเกี่ยงงานของสมาชิกคนอื่น จนเหลือเราสองคนเผชิญหน้ากัน'
  );
  const [tension, setTension] = useState(
    startingState?.psychological_tension || 'อึดอัด ประหม่า แอบหวาดหวั่นป่าฝน'
  );

  const handleSelectOutfit = (item: WardrobeOption) => {
    setSelectedOutfitKey(item.key);
    if (onUpdateStartingState) {
      onUpdateStartingState({
        time: startingState?.time || 'ยามบ่าย',
        weather: startingState?.weather || 'แดดสดใสก่อนแปรปรวน',
        location: startingState?.location || 'ห้องโถงเสื่อทาทามิเรียวกัง',
        ...startingState,
        initial_outfit_key: item.badgeLabel,
        initial_a_pos: aPos.trim(),
        initial_p_pos: pPos.trim(),
        first_spark: spark.trim(),
        psychological_tension: tension.trim(),
      });
    }
  };

  const handleSave = () => {
    if (onUpdateStartingState) {
      onUpdateStartingState({
        time: startingState?.time || 'ยามบ่าย',
        weather: startingState?.weather || 'แดดสดใสก่อนแปรปรวน',
        location: startingState?.location || 'ห้องโถงเสื่อทาทามิเรียวกัง',
        ...startingState,
        initial_outfit_key: activeOutfit?.badgeLabel || wardrobeList[0]?.badgeLabel || 'ยูกาตะตัวโคร่ง',
        initial_a_pos: aPos.trim(),
        initial_p_pos: pPos.trim(),
        first_spark: spark.trim(),
        psychological_tension: tension.trim(),
      });
    }
    setIsEditing(false);
  };

  return (
    <div
      className="absolute w-[346px] h-[346px] rounded-[28px] bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] p-4 flex flex-col justify-between select-none group/node transition-all overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* ✦ TOP BAR: HEADER STANDARDIZED (EXACTLY MATCHING OTHER 2x2 CARDS) */}
      <div className="flex items-center justify-between gap-1 mb-1 shrink-0">
        <div
          onMouseDown={(e) => {
            if (isEditable && onStartDrag) {
              onStartDrag(e);
            }
          }}
          className="flex items-baseline gap-1.5 cursor-grab active:cursor-grabbing select-none"
        >
          <span className="text-[16px] sm:text-[17px] font-semibold text-[#F1F1F1] tracking-tight">
            จุดปล่อยตัว
          </span>
          <span className="text-[11.5px] font-normal text-white/45">
            (สมอเปิดฉาก)
          </span>
        </div>

        {isEditable && (
          <button
            type="button"
            onClick={() => {
              if (isEditing) handleSave();
              else setIsEditing(true);
            }}
            className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            title={isEditing ? 'บันทึก' : 'แก้ไขจุดปล่อยตัว'}
            aria-label={isEditing ? 'บันทึก' : 'แก้ไขจุดปล่อยตัว'}
          >
            {isEditing ? <Check size={13} className="text-white" strokeWidth={2.4} /> : <Pencil size={12} strokeWidth={2.2} />}
          </button>
        )}
      </div>

      {/* ✦ BODY CONTENT: VIEW MODE VS EDIT MODE */}
      {!isEditing ? (
        <div className="flex flex-col justify-between flex-1 gap-1.5 pt-0.5 overflow-hidden">
          {/* =================================================================== */}
          {/* 1. WARDROBE CLOSET SELECTOR (หยิบจากตู้เสื้อผ้าจริง ซิงก์ 100%)       */}
          {/* =================================================================== */}
          <div className="bg-black/25 rounded-[16px] p-2.5 border border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] shrink-0">
            <div className="flex items-center justify-between text-[10.5px] font-mono text-white/45 mb-1.5">
              <span className="flex items-center gap-1">
                <Shirt size={10} className="text-white/50" />
                <span>ชุดเปิดฉาก (หยิบจากตู้)</span>
              </span>
              <span className="text-[10px] text-white/35">เลือกชุด</span>
            </div>

            {/* Slideable Hanger Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {wardrobeList.map((item) => {
                const isSelected = selectedOutfitKey === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSelectOutfit(item)}
                    className={`px-2.5 py-1 rounded-full text-[10.5px] font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 select-none ${
                      isSelected
                        ? 'bg-white/15 text-white border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                        : 'bg-white/[0.04] text-white/55 hover:text-white/85 border border-white/[0.06] hover:bg-white/[0.08]'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#EF264C]' : 'bg-white/25'}`} />
                    <span>{item.badgeLabel}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10.5px] text-white/70 line-clamp-1 mt-1.5 italic font-light">
              {activeOutfit?.desc}
            </p>
          </div>

          {/* =================================================================== */}
          {/* 2. THE STAGE MARKS (50/50 DUAL SILHOUETTE: AI VS PLAYER)           */}
          {/* =================================================================== */}
          <div className="grid grid-cols-2 gap-1.5 shrink-0">
            {/* Left: AI Posture Mark */}
            <div className="bg-black/25 rounded-[16px] p-2.5 border border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-white/45 mb-1">
                <span>🎭 A_POS (AI)</span>
              </div>
              <p className="text-[11px] text-white/85 leading-snug line-clamp-3">
                {aPos}
              </p>
            </div>

            {/* Right: Player Stance Mark */}
            <div className="bg-black/25 rounded-[16px] p-2.5 border border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-white/45 mb-1">
                <User size={10} className="text-white/50" />
                <span>👤 P_POS (ผู้เล่น)</span>
              </div>
              <p className="text-[11px] text-white/85 leading-snug line-clamp-3">
                {pPos}
              </p>
            </div>
          </div>

          {/* =================================================================== */}
          {/* 3. INCITING SPARK & TENSION (ชนวนเหตุการณ์และแรงเสียดทานในใจ)           */}
          {/* =================================================================== */}
          <div className="bg-black/25 rounded-[16px] p-2.5 border border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] shrink-0">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-white/45">
                <Zap size={10} className="text-amber-400/80" />
                <span>FIRST SPARK</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] text-white/80 font-medium">
                {tension}
              </span>
            </div>
            <p className="text-[11px] text-white/85 italic leading-snug line-clamp-2">
              "{spark}"
            </p>
          </div>
        </div>
      ) : (
        /* EDIT MODE (IN-PLACE INSET FORMS) */
        <div className="flex flex-col justify-between flex-1 gap-2 pt-1 overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-1">
                🎭 ภาษากาย AI (A_POS)
              </label>
              <textarea
                value={aPos}
                onChange={(e) => setAPos(e.target.value)}
                rows={3}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-[11px] text-white outline-none focus:border-white/30 resize-none leading-normal"
                placeholder="นั่งก้มหน้านิ่ง..."
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-1">
                👤 ท่าทางผู้เล่น (P_POS)
              </label>
              <textarea
                value={pPos}
                onChange={(e) => setPPos(e.target.value)}
                rows={3}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-[11px] text-white outline-none focus:border-white/30 resize-none leading-normal"
                placeholder="ยืนสะพายกระเป๋า..."
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-1">
              ⚡ ชนวนเปิดฉาก (FIRST SPARK)
            </label>
            <textarea
              value={spark}
              onChange={(e) => setSpark(e.target.value)}
              rows={2}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-[11px] text-white outline-none focus:border-white/30 resize-none leading-normal"
              placeholder="ไอน้ำชาเขียวอบอุ่นในห้องโถง..."
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-1">
              💭 สภาวะอารมณ์ (TENSION)
            </label>
            <input
              type="text"
              value={tension}
              onChange={(e) => setTension(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-[11px] text-white outline-none focus:border-white/30"
              placeholder="อึดอัด ประหม่า..."
            />
          </div>
        </div>
      )}

      {/* ✦ RIGHT OUTPUT SOCKET (PORT FOR IGNITING SCENE 1) */}
      <div
        className="absolute -right-[11px] w-[22px] h-[22px] rounded-full bg-[#181822] border-2 border-[#FF375F] hover:border-white flex items-center justify-center cursor-pointer shadow-[0_0_10px_rgba(255,55,95,0.4)] transition-all z-20 group/port"
        style={{ top: `${PORT_Y_OFFSET}px` }}
        title="จุดเชื่อมโยงชนวนเข้าสู่ฉากที่ 1"
        aria-label="จุดเชื่อมโยงชนวนเข้าสู่ฉากที่ 1"
      >
        <div className="w-2 h-2 rounded-full bg-[#FF375F] group-hover/port:scale-125 transition-transform" />
        <div className="absolute left-7 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-[#181820]/95 backdrop-blur-xl border border-white/15 text-[10.5px] font-medium text-white/90 whitespace-nowrap shadow-[0_4px_16px_rgba(0,0,0,0.5)] pointer-events-none opacity-0 group-hover/port:opacity-100 transition-all duration-200 z-50">
          IGNITE SCENE 1 →
        </div>
      </div>
    </div>
  );
}
