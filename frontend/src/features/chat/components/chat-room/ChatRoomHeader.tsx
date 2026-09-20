import { ChevronRight, Menu, PanelRightOpen, Terminal } from 'lucide-react'
import SingleCoinIcon from '../../../home/components/SingleCoinIcon'
import type { ChatRoomHeaderProps } from '../../types'

export type { ChatRoomHeaderProps }

export function ChatRoomHeader({
  chat,
  isChatListOpen = true,
  onToggleChatList,
  isHudOpen = true,
  onToggleHud,
  isInspectorOpen = false,
  onToggleInspector,
  coinBalance = 1250,
  onCoinClick,
}: ChatRoomHeaderProps) {
  if (!chat) return null

  return (
    <div data-no-advance className="sticky top-0 z-30 w-full pl-2 sm:pl-3 pr-2 sm:pr-4 pt-2 sm:pt-2.5 pb-2 flex items-start justify-between pointer-events-none select-none relative min-h-[78px] sm:min-h-[86px]">
      {/* Left: [Toggle ChatList Hamburger Button - Subtle White Frosted Glass, shown when ChatList is collapsed] */}
      <div className="flex items-center gap-1.5 pointer-events-auto mt-0.5 sm:mt-1 min-w-[38px]">
        {!isChatListOpen && onToggleChatList && (
          <button
            type="button"
            onClick={onToggleChatList}
            title="เปิดแถบแชท"
            aria-label="เปิดแถบแชท"
            className="w-9 h-9 sm:w-[38px] sm:h-[38px] rounded-full bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 text-white/85 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] active:scale-95 select-none shrink-0"
          >
            <Menu size={18} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Center: Apple-LINE Integrated Glass Capsule (Avatar ใหญ่ 48-52px + แคปซูลชื่อและสเตตัส White Frosted Glass) */}
      <div className="absolute left-1/2 -translate-x-1/2 top-1 sm:top-1.5 pointer-events-auto flex flex-col items-center">
        <div 
          onClick={onToggleHud}
          title="ดูโปรไฟล์และแถบสถานะตัวละคร"
          className="flex flex-col items-center cursor-pointer group select-none active:scale-95 transition-all"
        >
          {/* แถวบน: รูปโปรไฟล์ตัวละครทรงกลมขนาดใหญ่ 48px/52px คมชัดระดับ HD */}
          <div className="relative w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] rounded-full overflow-hidden flex-shrink-0 ring-1.5 ring-white/18 shadow-lg group-hover:ring-white/35 transition-all z-10">
            <img 
              src={chat.avatar} 
              alt={chat.name} 
              referrerPolicy="no-referrer" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
            {/* จุดสถานะออนไลน์สีเขียวมรกต */}
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#151517]" />
          </div>

          {/* แถวล่าง: แคปซูลกระจกฝ้าทูอินวัน (ชื่อ + สเตตัสแบบ LINE/Facebook) เกยใต้รูป */}
          <div className="flex flex-col items-center px-3.5 sm:px-4 py-1 sm:py-1.5 -mt-2.5 rounded-[18px] sm:rounded-[20px] bg-white/[0.06] group-hover:bg-white/[0.12] backdrop-blur-2xl border border-white/[0.10] group-hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all z-0 max-w-[220px] sm:max-w-[320px]">
            {/* ชื่อตัวละคร + ไอคอนลูกศร */}
            <div className="flex items-center justify-center gap-1 leading-none">
              <span className="font-bold text-white/90 group-hover:text-white text-[13.5px] sm:text-[14.5px] tracking-tight transition-colors">
                {chat.name} 💕
              </span>
              <ChevronRight size={13} className="text-white/50 group-hover:text-white/80 transition-colors shrink-0 -mr-0.5" strokeWidth={2.2} />
            </div>

            {/* สเตตัสประจำวัน/อารมณ์ สไตล์ LINE & Facebook */}
            <span className="text-[11px] sm:text-[11.5px] text-white/60 group-hover:text-white/75 tracking-tight font-normal leading-tight mt-0.5 truncate max-w-[190px] sm:max-w-[280px] transition-colors">
              “{chat.statusMessage || "วันนี้เหนื่อยจังเลย 🌙"}”
            </span>
          </div>
        </div>
      </div>

      {/* Right: [Trial Status Pill] + [Coin Balance Pill] + [Toggle HUD Button] (Subtle White Frosted Glass) */}
      <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto ml-auto mt-0.5 sm:mt-1">
        {/* แถบสถานะเหรียญสำหรับผู้เล่นใหม่ (Subtle White Frosted Glass) */}
        <div
          title="สถานะทดลองเล่น: 1 turns 10 เหรียญ · 5 turns"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 h-8 rounded-full bg-white/[0.06] backdrop-blur-2xl border border-white/[0.10] select-none cursor-default shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] shrink-0"
        >
          {/* Brand pink status dot (สีชมพูหลัก #EF264C คมชัด สไตล์มินิมัล) */}
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C] shrink-0" />
          <span className="text-[11px] sm:text-[11.5px] text-white/50 whitespace-nowrap hidden sm:inline">
            1 turns
          </span>
          <span className="text-[11px] sm:text-[12px] font-bold text-white/90 whitespace-nowrap">
            10 เหรียญ
          </span>
          <span className="text-[11px] sm:text-[11.5px] text-white/50 whitespace-nowrap">
            · 5 turns
          </span>
        </div>

        {/* Coin Balance Pill (Subtle White Frosted Glass) */}
        <button
          type="button"
          onClick={onCoinClick}
          title={`ยอดเหรียญคงเหลือ ${coinBalance.toLocaleString()} เหรียญ`}
          className="group flex items-center gap-1.5 px-2.5 sm:px-3 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 transition-all duration-200 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] active:scale-95 select-none shrink-0"
        >
          <div className="flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
            <SingleCoinIcon size={15} />
          </div>
          <span className="font-medium text-[12px] sm:text-[12.5px] text-white/90 group-hover:text-white tracking-tight transition-colors">
            {coinBalance.toLocaleString()}
          </span>
        </button>

        {/* Dev Console / Inspector Button (Subtle White Frosted Glass) */}
        {onToggleInspector && (
          <button
            type="button"
            onClick={onToggleInspector}
            title={isInspectorOpen ? 'ปิดหน้าต่าง Dev Console' : 'เปิดหน้าต่าง Dev Console & Inspector'}
            className={`w-8 h-8 rounded-full backdrop-blur-2xl border transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] active:scale-95 flex items-center justify-center select-none shrink-0 ${
              isInspectorOpen
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10'
                : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.10] hover:border-emerald-500/35 text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            <Terminal size={15} strokeWidth={1.8} />
          </button>
        )}

        {/* Toggle Character HUD Button (Subtle White Frosted Glass) */}
        {onToggleHud && !isHudOpen && (
          <button
            type="button"
            onClick={onToggleHud}
            title="เปิดแถบสถานะตัวละคร"
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] active:scale-95 select-none"
          >
            <PanelRightOpen size={16} strokeWidth={1.8} />
          </button>
        )}
      </div>
    </div>
  )
}

export default ChatRoomHeader
