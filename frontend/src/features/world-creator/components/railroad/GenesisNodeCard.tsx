import { useState, type MouseEvent } from 'react';
import {
  Sparkles,
  Pencil,
  Check,
  Shirt,
  User,
  Zap,
  Flame,
} from 'lucide-react';
import type { WorldStartingState } from '../../types';
import { PORT_Y_OFFSET } from './RailroadCableOverlay';

export const GENESIS_WIDTH = 346;
export const DEFAULT_GENESIS_X = -320;
export const DEFAULT_GENESIS_Y = 220;

interface GenesisNodeCardProps {
  startingState?: WorldStartingState;
  position?: { x: number; y: number };
  onUpdateStartingState?: (updated: WorldStartingState) => void;
  onStartDrag?: (e: MouseEvent) => void;
  isEditable?: boolean;
}

export default function GenesisNodeCard({
  startingState,
  position = { x: DEFAULT_GENESIS_X, y: DEFAULT_GENESIS_Y },
  onUpdateStartingState,
  onStartDrag,
  isEditable = true,
}: GenesisNodeCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Form states for inline editing
  const [outfit, setOutfit] = useState(
    startingState?.initial_outfit_key || 'เสื้อเชิ้ตสีขาวบางผ้าฝ้ายและแว่นตากรอกหนา'
  );
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

  const handleSave = () => {
    if (onUpdateStartingState) {
      onUpdateStartingState({
        time: startingState?.time || 'ยามบ่าย',
        weather: startingState?.weather || 'แดดสดใสก่อนแปรปรวน',
        location: startingState?.location || 'ห้องโถงเสื่อทาทามิเรียวกัง',
        ...startingState,
        initial_outfit_key: outfit.trim(),
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
      className="absolute w-[346px] rounded-[28px] bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition-all p-4 sm:p-5 flex flex-col justify-between select-none group/node cursor-default"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* ✦ 1. CARD HEADER & DRAG HANDLE */}
      <div>
        <div
          onMouseDown={(e) => {
            if (isEditable && onStartDrag) {
              onStartDrag(e);
            }
          }}
          className="flex items-center justify-between pb-3 cursor-grab active:cursor-grabbing border-b border-white/[0.07]"
        >
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/[0.08] border border-white/10 text-[10.5px] font-mono font-medium text-white/90 tracking-wider uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] flex items-center gap-1.5">
              <Sparkles size={11} className="text-white/80" />
              <span>GENESIS 00</span>
            </span>
            <span className="text-[12px] font-medium text-white/70">จุดสตาร์ทแรกเริ่ม</span>
          </div>

          {isEditable && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
              className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              title={isEditing ? 'บันทึก' : 'แก้ไขจุดสตาร์ท'}
              aria-label={isEditing ? 'บันทึก' : 'แก้ไขจุดสตาร์ท'}
            >
              {isEditing ? <Check size={13} className="text-white" strokeWidth={2.4} /> : <Pencil size={12} strokeWidth={2.2} />}
            </button>
          )}
        </div>

        {/* ✦ 2. CARD CONTENT: VIEW MODE VS EDIT MODE */}
        {!isEditing ? (
          <div className="pt-3 space-y-2.5">
            {/* TRAY 1: PHYSICAL EMBODIMENT (สรีระและการแต่งกาย) */}
            <div className="bg-black/25 rounded-[18px] p-3 border border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] space-y-2">
              <div className="flex items-center gap-1 text-[10.5px] font-mono uppercase tracking-wider text-white/45">
                <Shirt size={11} className="text-white/50" />
                <span>OUTFIT • เสื้อผ้าในฉากเปิด</span>
              </div>
              <p className="text-[12px] text-white/90 font-normal leading-relaxed line-clamp-2">
                {startingState?.initial_outfit_key || outfit}
              </p>

              <div className="pt-1.5 border-t border-white/[0.06] grid grid-cols-2 gap-2">
                {/* A_POS */}
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-white/45 mb-0.5">
                    <span>🎭 A_POS (AI)</span>
                  </div>
                  <p className="text-[11px] text-white/80 leading-snug line-clamp-3">
                    {startingState?.initial_a_pos || aPos}
                  </p>
                </div>

                {/* P_POS */}
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-white/45 mb-0.5">
                    <User size={10} className="text-white/50" />
                    <span>P_POS (ผู้เล่น)</span>
                  </div>
                  <p className="text-[11px] text-white/80 leading-snug line-clamp-3">
                    {startingState?.initial_p_pos || pPos}
                  </p>
                </div>
              </div>
            </div>

            {/* TRAY 2: INCITING SPARK & TENSION (ชนวนและสภาวะอารมณ์) */}
            <div className="bg-black/25 rounded-[18px] p-3 border border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] space-y-2">
              <div>
                <div className="flex items-center gap-1 text-[10.5px] font-mono uppercase tracking-wider text-white/45 mb-1">
                  <Zap size={11} className="text-amber-400/70" />
                  <span>FIRST SPARK • ชนวนเหตุการณ์เฉพาะหน้า</span>
                </div>
                <p className="text-[12px] text-white/85 italic leading-relaxed line-clamp-3">
                  "{startingState?.first_spark || spark}"
                </p>
              </div>

              <div className="pt-1.5 border-t border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-white/45">
                  <Flame size={10} className="text-[#FF375F]/70" />
                  <span>TENSION:</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[11px] text-white/85 font-medium">
                  {startingState?.psychological_tension || tension}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* EDIT MODE */
          <div className="pt-3 space-y-2.5">
            <div>
              <label className="text-[10.5px] font-mono uppercase tracking-wider text-white/50 block mb-1">
                👗 ชุดเริ่มต้น (OUTFIT)
              </label>
              <input
                type="text"
                value={outfit}
                onChange={(e) => setOutfit(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-[12px] text-white outline-none focus:border-white/30"
                placeholder="เสื้อเชิ้ตสีขาวบางผ้าฝ้าย..."
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-1">
                  🎭 กายภาพ AI (A_POS)
                </label>
                <textarea
                  value={aPos}
                  onChange={(e) => setAPos(e.target.value)}
                  rows={2}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-[11px] text-white outline-none focus:border-white/30 resize-none"
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
                  rows={2}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-[11px] text-white outline-none focus:border-white/30 resize-none"
                  placeholder="ยืนสะพายกระเป๋า..."
                />
              </div>
            </div>

            <div>
              <label className="text-[10.5px] font-mono uppercase tracking-wider text-white/50 block mb-1">
                ⚡ ชนวนเปิดฉาก (FIRST SPARK)
              </label>
              <textarea
                value={spark}
                onChange={(e) => setSpark(e.target.value)}
                rows={2}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-[11.5px] text-white outline-none focus:border-white/30 resize-none"
                placeholder="ไอน้ำชาเขียวอบอุ่นในห้องโถง..."
              />
            </div>

            <div>
              <label className="text-[10.5px] font-mono uppercase tracking-wider text-white/50 block mb-1">
                💭 สภาวะอารมณ์ (TENSION)
              </label>
              <input
                type="text"
                value={tension}
                onChange={(e) => setTension(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-[12px] text-white outline-none focus:border-white/30"
                placeholder="อึดอัด ประหม่า..."
              />
            </div>
          </div>
        )}
      </div>

      {/* ✦ 3. RIGHT OUTPUT SOCKET (PORT FOR IGNITING SCENE 1) */}
      <div
        className="absolute -right-[11px] w-[22px] h-[22px] rounded-full bg-[#181822] border-2 border-[#FF375F] hover:border-white flex items-center justify-center cursor-pointer shadow-[0_0_10px_rgba(255,55,95,0.4)] transition-all z-20 group/port"
        style={{ top: `${PORT_Y_OFFSET}px` }}
        title="จุดเชื่อมโยงชนวนเข้าสู่ฉากที่ 1"
        aria-label="จุดเชื่อมโยงชนวนเข้าสู่ฉากที่ 1"
      >
        <div className="w-2 h-2 rounded-full bg-[#FF375F] group-hover/port:scale-125 transition-transform" />

        {/* Apple Frosted Tooltip */}
        <div className="absolute left-7 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-[#181820]/95 backdrop-blur-xl border border-white/15 text-[10.5px] font-medium text-white/90 whitespace-nowrap shadow-[0_4px_16px_rgba(0,0,0,0.5)] pointer-events-none opacity-0 group-hover/port:opacity-100 transition-all duration-200 z-50">
          IGNITE SCENE 1 →
        </div>
      </div>
    </div>
  );
}
