import { useState, useMemo, type MouseEvent, type WheelEvent } from 'react';
import { Pencil, Check, Zap } from 'lucide-react';
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

  // 1. Extract wardrobe collection from character appearance
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

  // Selected outfit tracking
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

  // Form states for natural Thai parameters
  const [actorPose, setActorPose] = useState(
    startingState?.initial_a_pos || 'นั่งก้มหน้านิ่ง ใช้นิ้วดันดั้งแว่นด้วยความประหม่า'
  );
  const [playerPose, setPlayerPose] = useState(
    startingState?.initial_p_pos || 'ยืนสะพายกระเป๋าอุปกรณ์พฤกษศาสตร์ใบโต'
  );
  const [spark, setSpark] = useState(
    startingState?.first_spark ||
      'ไอน้ำชาเขียวอบอุ่นในห้องโถงเสื่อทาทามิถูกขัดจังหวะด้วยข้ออ้างการเกี่ยงงานของสมาชิกคนอื่น จนเหลือเพียงเราสองคนที่ต้องเผชิญหน้ากัน'
  );
  const [tension, setTension] = useState(
    startingState?.psychological_tension || 'อึดอัด • ประหม่า'
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
        initial_a_pos: actorPose.trim(),
        initial_p_pos: playerPose.trim(),
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
        initial_a_pos: actorPose.trim(),
        initial_p_pos: playerPose.trim(),
        first_spark: spark.trim(),
        psychological_tension: tension.trim(),
      });
    }
    setIsEditing(false);
  };

  const handleRailWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0) {
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  return (
    <div
      className="absolute w-[346px] h-[346px] rounded-[28px] bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] p-4 sm:p-4.5 flex flex-col justify-between select-none group/node transition-all overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* ✦ 1. HEADER ROW: PURE TITLE + CIRCULAR FROSTED EDIT BUTTON */}
      <div className="flex items-center justify-between gap-1.5 shrink-0 pb-1.5 border-b border-white/[0.08]">
        <div
          onMouseDown={(e) => {
            if (isEditable && onStartDrag) {
              onStartDrag(e);
            }
          }}
          className="flex items-center cursor-grab active:cursor-grabbing select-none"
        >
          <span className="text-[16px] sm:text-[17px] font-semibold text-[#F1F1F1] tracking-tight">
            จุดเริ่มต้น
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
            title={isEditing ? 'บันทึกจุดเริ่มต้น' : 'แก้ไขจุดเริ่มต้น'}
            aria-label={isEditing ? 'บันทึกจุดเริ่มต้น' : 'แก้ไขจุดเริ่มต้น'}
          >
            {isEditing ? (
              <Check size={13} className="text-white" strokeWidth={2.4} />
            ) : (
              <Pencil size={12} strokeWidth={2.2} />
            )}
          </button>
        )}
      </div>

      {/* ✦ 2. CARD BODY: VIEW MODE VS EDIT MODE */}
      {!isEditing ? (
        <div className="flex flex-col justify-between flex-1 pt-1.5 overflow-hidden gap-1.5">
          {/* ================================================================= */}
          {/* 1. CLOTHES RAIL WITH REALISTIC HANGERS (ชุดเริ่มต้น - หยิบจากตู้)  */}
          {/* ================================================================= */}
          <div className="shrink-0 space-y-1">
            {/* Section Header */}
            <div className="flex items-center justify-between text-[11px] font-medium text-white/50">
              <div className="flex items-center gap-1.5">
                <span className="text-[#EF264C] text-[10px] font-mono">✦</span>
                <span>ชุดเริ่มต้น</span>
                <span className="text-white/40 font-normal text-[10px]">(หยิบจากตู้)</span>
              </div>
              <span className="text-[10px] text-white/35 font-mono">
                {wardrobeList.length} ชุดในตู้
              </span>
            </div>

            {/* Realistic Slideable Clothes Rail with Metallic Hangers */}
            <div className="relative w-full shrink-0 py-0.5">
              {/* Metallic Clothes Rail Bar */}
              <div className="absolute top-[17px] left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-white/15 via-white/35 to-white/15 shadow-[0_1px_3px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.3)] pointer-events-none" />
              {/* Left & Right Metallic Mount Brackets */}
              <div className="absolute top-[14px] left-0 w-1.5 h-[7px] rounded-l-sm bg-gradient-to-b from-white/40 to-white/20 shadow-sm pointer-events-none" />
              <div className="absolute top-[14px] right-0 w-1.5 h-[7px] rounded-r-sm bg-gradient-to-b from-white/40 to-white/20 shadow-sm pointer-events-none" />

              {/* Slideable Hanger Track */}
              <div
                onWheel={handleRailWheel}
                className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth px-1.5 py-0.5 cursor-grab active:cursor-grabbing select-none relative z-10"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {wardrobeList.map((item) => {
                  const isSelected = selectedOutfitKey === item.key;
                  return (
                    <div
                      key={item.key}
                      onClick={() => handleSelectOutfit(item)}
                      className={`group/hanger flex flex-col items-center shrink-0 cursor-pointer transition-all duration-200 ${
                        isSelected ? '-translate-y-0.5' : 'hover:-translate-y-0.5 opacity-70 hover:opacity-100'
                      }`}
                      title={item.name}
                    >
                      {/* Realistic Metallic Hanger Hook */}
                      <div className="flex flex-col items-center justify-end h-[9px] w-full">
                        <div
                          className={`w-2.5 h-2 rounded-t-full border-t-2 border-l-2 border-r-2 transition-colors ${
                            isSelected
                              ? 'border-[#EF264C]'
                              : 'border-white/40 group-hover/hanger:border-white/70'
                          }`}
                        />
                      </div>

                      {/* Hanger Label Tag / Capsule */}
                      <div
                        className={`px-2 py-0.5 rounded-[10px] text-[10.5px] font-medium flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-white/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_2px_8px_rgba(0,0,0,0.4)] border border-white/30 font-semibold'
                            : 'bg-black/50 text-white/60 hover:text-white border border-white/[0.08] hover:border-white/20'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${
                            isSelected ? 'bg-[#EF264C]' : 'bg-white/30 group-hover/hanger:bg-white/60'
                          }`}
                        />
                        <span className="truncate max-w-[105px]">{item.badgeLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Outfit Texture Description (1-Line Preview) */}
            <p className="text-[11px] text-white/55 font-light line-clamp-1 truncate pt-0.5">
              {activeOutfit?.desc}
            </p>
          </div>

          {/* ================================================================= */}
          {/* 2. EMBODIED PHYSICAL TRAY (ถาดสรีระและท่าทางสองฝ่าย - พื้นหลังบุ๋ม)   */}
          {/* ================================================================= */}
          <div className="rounded-[16px] bg-black/40 backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.35)] p-2.5 sm:p-3 shrink-0">
            <div className="grid grid-cols-[1fr_1px_1fr] items-stretch gap-2.5">
              {/* Left Column: ท่าทางตัวละคร (สีชมพู) */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#FF375F] text-[10px] font-mono select-none">✦</span>
                  <span className="text-[10.5px] sm:text-[11px] font-medium text-white/60">
                    ท่าทางตัวละคร
                  </span>
                </div>
                <p className="text-[11px] sm:text-[11.5px] text-[#F1F1F4] font-normal leading-[17px] line-clamp-3">
                  {actorPose}
                </p>
              </div>

              {/* Vertical Center Hairline */}
              <div className="w-[1px] h-full bg-white/[0.08]" />

              {/* Right Column: ท่าทางผู้เล่น (สีฟ้า) */}
              <div className="space-y-1 pl-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#0A84FF] text-[10px] font-mono select-none">✦</span>
                  <span className="text-[10.5px] sm:text-[11px] font-medium text-white/60">
                    ท่าทางผู้เล่น
                  </span>
                </div>
                <p className="text-[11px] sm:text-[11.5px] text-[#F1F1F4] font-normal leading-[17px] line-clamp-3">
                  {playerPose}
                </p>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* 3. INCITING SPARK STRIP (แถบกระจกยกบางๆ คล้าย "ครบ 3 รอบ" + Zap)    */}
          {/* ================================================================= */}
          <div className="rounded-[12px] bg-white/[0.035] hover:bg-white/[0.06] border border-white/[0.08] px-2.5 py-1.5 sm:py-2 flex flex-col gap-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all shrink-0">
            {/* Header row with Zap and tension pill */}
            <div className="flex items-center justify-between gap-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Zap size={11} strokeWidth={2.4} className="shrink-0" />
                <span className="text-[10.5px] sm:text-[11px] font-medium text-white/75">
                  ชนวนเปิดฉาก
                </span>
              </div>
              {tension && (
                <span className="px-2 py-0.2 rounded-full bg-white/[0.06] border border-white/10 text-[9.5px] sm:text-[10px] text-white/75 font-normal">
                  {tension}
                </span>
              )}
            </div>

            {/* Spark Literary Prose */}
            <p className="text-[11px] sm:text-[11.5px] text-[#D6D6DC] italic font-light leading-snug line-clamp-2">
              "{spark}"
            </p>
          </div>
        </div>
      ) : (
        /* EDIT MODE: CLEAN IN-PLACE FORM */
        <div className="flex flex-col justify-between flex-1 gap-2 pt-1.5 overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium text-white/50 block mb-1">
                ท่าทางตัวละคร
              </label>
              <textarea
                value={actorPose}
                onChange={(e) => setActorPose(e.target.value)}
                rows={3}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-2 text-[11.5px] text-white outline-none focus:border-white/30 resize-none leading-normal"
                placeholder="นั่งก้มหน้านิ่ง..."
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-white/50 block mb-1">
                ท่าทางผู้เล่น
              </label>
              <textarea
                value={playerPose}
                onChange={(e) => setPlayerPose(e.target.value)}
                rows={3}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-2 text-[11.5px] text-white outline-none focus:border-white/30 resize-none leading-normal"
                placeholder="ยืนสะพายกระเป๋า..."
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-white/50 block mb-1">
              ชนวนเปิดฉาก (เหตุการณ์เสี้ยววินาทีก่อนหน้า)
            </label>
            <textarea
              value={spark}
              onChange={(e) => setSpark(e.target.value)}
              rows={2}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-2 text-[11.5px] text-white outline-none focus:border-white/30 resize-none leading-normal"
              placeholder="ไอน้ำชาเขียวอบอุ่นในห้องโถง..."
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-white/50 block mb-1">
              สภาวะอารมณ์ในใจ
            </label>
            <input
              type="text"
              value={tension}
              onChange={(e) => setTension(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-2.5 py-1.5 text-[11.5px] text-white outline-none focus:border-white/30"
              placeholder="อึดอัด • ประหม่า..."
            />
          </div>
        </div>
      )}

      {/* ✦ 3. RIGHT OUTPUT SOCKET (PRECISION MICRO-JEWEL PORT FOR IGNITING SCENE 1) */}
      <div
        className="absolute -right-[5.5px] -translate-y-1/2 w-[11px] h-[11px] rounded-full bg-[#141419] border border-white/25 hover:border-[#FF375F] hover:scale-125 transition-all z-30 flex items-center justify-center cursor-pointer group/port"
        style={{ top: `${PORT_Y_OFFSET}px` }}
        title="จุดเชื่อมต่อชนวนเปิดฉากสู่ฉากที่ 1"
        aria-label="จุดเชื่อมต่อชนวนเปิดฉากสู่ฉากที่ 1"
      >
        <div className="w-1 h-1 rounded-full bg-[#FF375F] group-hover/port:scale-125 transition-transform" />
      </div>
    </div>
  );
}
