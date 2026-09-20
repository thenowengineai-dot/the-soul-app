import { ChevronRight, PanelLeftOpen, PanelLeftClose, PanelRightOpen, Terminal } from 'lucide-react'
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
    <div data-no-advance className="sticky top-0 z-30 w-full pl-2 sm:pl-3 pr-2 sm:pr-4 pt-2 pb-2 flex items-center justify-between pointer-events-none select-none relative min-h-[56px]">
      {/* Left: [Toggle ChatList Button - White Frosted Glass] */}
      <div className="flex items-center gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={onToggleChatList}
          title={isChatListOpen ? 'ซ่อนแถบแชท' : 'เปิดแถบแชท'}
          className="w-8 h-8 rounded-full bg-white/[0.10] hover:bg-white/[0.16] backdrop-blur-2xl border border-white/[0.14] hover:border-white/25 text-white flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] active:scale-95 select-none"
        >
          {isChatListOpen ? (
            <PanelLeftClose size={16} strokeWidth={1.8} />
          ) : (
            <PanelLeftOpen size={16} strokeWidth={1.8} />
          )}
        </button>
      </div>

      {/* Center: Apple iMessage Vertical Stack (Avatar บน + แคปซูลชื่อล่าง White Frosted Glass) */}
      <div className="absolute left-1/2 -translate-x-1/2 top-1 sm:top-1.5 pointer-events-auto flex flex-col items-center">
        <div 
          onClick={onToggleHud}
          title="ดูโปรไฟล์และแถบสถานะตัวละคร"
          className="flex flex-col items-center cursor-pointer group select-none active:scale-95 transition-all"
        >
          {/* แถวบน: รูปโปรไฟล์ตัวละครทรงกลม 36px/38px */}
          <div className="relative w-[36px] h-[36px] sm:w-[38px] sm:h-[38px] rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/25 shadow-md group-hover:ring-white/45 transition-all z-10">
            <img 
              src={chat.avatar} 
              alt={chat.name} 
              referrerPolicy="no-referrer" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
            {/* จุดสถานะออนไลน์สีเขียว */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-1.5 ring-[#151517]" />
          </div>

          {/* แถวล่าง: แคปซูลชื่อตัวละครเกยใต้รูป (White Frosted Glass Pill) */}
          <div className="flex items-center gap-1 pl-2.5 pr-2 py-0.5 -mt-1.5 rounded-full bg-white/[0.10] group-hover:bg-white/[0.16] backdrop-blur-2xl border border-white/[0.14] group-hover:border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition-all z-0">
            <span className="font-bold text-white text-[11.5px] sm:text-[12px] leading-tight tracking-tight">
              {chat.name} 💕
            </span>
            <ChevronRight size={11} className="text-white/60 group-hover:text-white transition-colors shrink-0" strokeWidth={2.2} />
          </div>
        </div>
      </div>

      {/* Right: [Trial Status Pill] + [Coin Balance Pill] + [Toggle HUD Button] (White Frosted Glass) */}
      <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto ml-auto">
        {/* แถบสถานะเหรียญสำหรับผู้เล่นใหม่ (White Frosted Glass) */}
        <div
          title="สถานะทดลองเล่น: 1 turns 10 เหรียญ · 5 turns"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 h-8 rounded-full bg-white/[0.10] backdrop-blur-2xl border border-white/[0.14] select-none cursor-default shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] shrink-0"
        >
          {/* Brand pink status dot (สีชมพูหลัก #EF264C คมชัด สไตล์มินิมัล) */}
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C] shrink-0" />
          <span className="text-[11px] sm:text-[11.5px] text-white/60 whitespace-nowrap hidden sm:inline">
            1 turns
          </span>
          <span className="text-[11px] sm:text-[12px] font-bold text-white whitespace-nowrap">
            10 เหรียญ
          </span>
          <span className="text-[11px] sm:text-[11.5px] text-white/60 whitespace-nowrap">
            · 5 turns
          </span>
        </div>

        {/* Coin Balance Pill (White Frosted Glass) */}
        <button
          type="button"
          onClick={onCoinClick}
          title={`ยอดเหรียญคงเหลือ ${coinBalance.toLocaleString()} เหรียญ`}
          className="group flex items-center gap-1.5 px-2.5 sm:px-3 h-8 rounded-full bg-white/[0.10] hover:bg-white/[0.16] backdrop-blur-2xl border border-white/[0.14] hover:border-white/25 transition-all duration-200 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] active:scale-95 select-none shrink-0"
        >
          <div className="flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
            <SingleCoinIcon size={15} />
          </div>
          <span className="font-medium text-[12px] sm:text-[12.5px] text-white tracking-tight">
            {coinBalance.toLocaleString()}
          </span>
        </button>

        {/* Dev Console / Inspector Button (White Frosted Glass) */}
        {onToggleInspector && (
          <button
            type="button"
            onClick={onToggleInspector}
            title={isInspectorOpen ? 'ปิดหน้าต่าง Dev Console' : 'เปิดหน้าต่าง Dev Console & Inspector'}
            className={`w-8 h-8 rounded-full backdrop-blur-2xl border transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] active:scale-95 flex items-center justify-center select-none shrink-0 ${
              isInspectorOpen
                ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50 shadow-emerald-500/10'
                : 'bg-white/[0.10] hover:bg-white/[0.16] border-white/[0.14] hover:border-emerald-500/35 text-emerald-400/90 hover:text-emerald-300'
            }`}
          >
            <Terminal size={15} strokeWidth={1.8} />
          </button>
        )}

        {/* Toggle Character HUD Button (White Frosted Glass) */}
        {onToggleHud && !isHudOpen && (
          <button
            type="button"
            onClick={onToggleHud}
            title="เปิดแถบสถานะตัวละคร"
            className="w-8 h-8 rounded-full bg-white/[0.10] hover:bg-white/[0.16] backdrop-blur-2xl border border-white/[0.14] hover:border-white/25 text-white flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] active:scale-95 select-none"
          >
            <PanelRightOpen size={16} strokeWidth={1.8} />
          </button>
        )}
      </div>
    </div>
  )
}

export default ChatRoomHeader
