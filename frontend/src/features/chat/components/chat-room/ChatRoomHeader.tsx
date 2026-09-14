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
    <div className="sticky top-0 z-30 w-full pl-2 sm:pl-3 pr-2 sm:pr-4 pt-3 pb-2 flex items-center justify-between pointer-events-none select-none relative">
      {/* Left: [Toggle ChatList Button] */}
      <div className="flex items-center gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={onToggleChatList}
          title={isChatListOpen ? 'ซ่อนแถบแชท' : 'เปิดแถบแชท'}
          className="w-8 h-8 rounded-full bg-[#121212]/65 backdrop-blur-xl border border-white/[0.07] hover:border-white/20 text-app-primary flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 select-none"
        >
          {isChatListOpen ? (
            <PanelLeftClose size={16} strokeWidth={1.8} />
          ) : (
            <PanelLeftOpen size={16} strokeWidth={1.8} />
          )}
        </button>
      </div>

      {/* Center: Character Identity & Status Pill (Sleek & Balanced สไตล์ Apple Capsule) */}
      <div className="absolute left-1/2 -translate-x-1/2 top-1.5 sm:top-2 pointer-events-auto">
        <div 
          onClick={onToggleHud}
          title="เปิด/ปิด แถบสถานะตัวละคร (HUD)"
          className="flex items-center gap-2 sm:gap-2.5 pl-1.5 pr-3 sm:pr-3.5 py-1 bg-[#121212]/80 backdrop-blur-xl border border-white/15 hover:border-white/20 rounded-full shadow-2xl transition-all cursor-pointer group select-none active:scale-95"
        >
          {/* รูปโปรไฟล์ตัวละคร (ย่อเป็น 30px / 32px สมดุลสายตา) */}
          <div className="relative w-[30px] h-[30px] sm:w-[32px] sm:h-[32px] rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/20 shadow-md">
            <img 
              src={chat.avatar} 
              alt={chat.name} 
              referrerPolicy="no-referrer" 
              className="w-full h-full object-cover" 
            />
            {/* จุดสถานะออนไลน์สีเขียว */}
            <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 ring-1.5 ring-[#121212]" />
          </div>

          {/* ข้อความหลังรูป (2 บรรทัด: ชื่อตัวละคร + สถานะ/อารมณ์สไตล์ LINE/Discord) */}
          <div className="flex flex-col text-left justify-center min-w-0 pr-0.5">
            <div className="flex items-center gap-1 leading-tight">
              <span className="font-bold text-app-primary text-[12.5px] sm:text-[13px] truncate group-hover:text-white transition-colors">
                {chat.name} 💕
              </span>
            </div>
            <span className="text-[10.5px] sm:text-[11px] text-app-secondary leading-tight truncate max-w-[140px] sm:max-w-[220px] group-hover:text-app-primary/80 transition-colors mt-0.5">
              {chat.statusMessage || "ออนไลน์ • พร้อมคุยเสมอ"}
            </span>
          </div>

          {/* Chevron ลูกศร */}
          <ChevronRight size={13} className="text-app-secondary group-hover:text-app-primary transition-colors flex-shrink-0 opacity-70 group-hover:opacity-100 ml-0.5" />
        </div>
      </div>

      {/* Right: [Trial Status Pill] + [Coin Balance Pill] + [Toggle HUD Button] */}
      <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto ml-auto">
        {/* แถบสถานะเหรียญสำหรับผู้เล่นใหม่ (แสดงอัตราเทิร์นและการทดลองเล่น คลิกไม่ได้) */}
        <div
          title="สถานะทดลองเล่น: 1 turns 10 เหรียญ · 5 turns"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 h-8 rounded-full bg-[#121212]/65 backdrop-blur-xl border border-white/[0.07] select-none cursor-default shadow-lg shrink-0"
        >
          {/* Brand pink status dot (สีชมพูหลัก #EF264C คมชัด สไตล์มินิมัล) */}
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C] shrink-0" />
          <span className="text-[11px] sm:text-[11.5px] text-app-muted whitespace-nowrap hidden sm:inline">
            1 turns
          </span>
          <span className="text-[11px] sm:text-[12px] font-bold text-app-primary whitespace-nowrap">
            10 เหรียญ
          </span>
          <span className="text-[11px] sm:text-[11.5px] text-app-muted whitespace-nowrap">
            · 5 turns
          </span>
        </div>

        {/* Coin Balance Pill (ปุ่มแสดงเหรียญ สไตล์ Dark Luxury) */}
        <button
          type="button"
          onClick={onCoinClick}
          title={`ยอดเหรียญคงเหลือ ${coinBalance.toLocaleString()} เหรียญ`}
          className="group flex items-center gap-1.5 px-2.5 sm:px-3 h-8 rounded-full bg-[#121212]/65 backdrop-blur-xl border border-white/[0.07] hover:border-white/20 transition-all duration-200 cursor-pointer shadow-lg active:scale-95 select-none shrink-0"
        >
          <div className="flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
            <SingleCoinIcon size={15} />
          </div>
          <span className="font-medium text-[12px] sm:text-[12.5px] text-app-primary tracking-tight">
            {coinBalance.toLocaleString()}
          </span>
        </button>

        {/* Dev Console / Inspector Button (ต่อท้ายปุ่มเหรียญในห้องแชทหลัก สไตล์ Minimal & Sleek) */}
        {onToggleInspector && (
          <button
            type="button"
            onClick={onToggleInspector}
            title={isInspectorOpen ? 'ปิดหน้าต่าง Dev Console' : 'เปิดหน้าต่าง Dev Console & Inspector'}
            className={`w-8 h-8 rounded-full backdrop-blur-xl border transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center select-none shrink-0 ${
              isInspectorOpen
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10'
                : 'bg-[#121212]/65 border-white/[0.07] hover:border-emerald-500/35 text-emerald-400/90 hover:text-emerald-300 hover:bg-emerald-500/10'
            }`}
          >
            <Terminal size={15} strokeWidth={1.8} />
          </button>
        )}

        {/* Toggle Character HUD Button (แสดงเฉพาะตอนที่ HUD ซ่อนอยู่ เพื่อให้มีปุ่มปิดเปิดเพียงปุ่มเดียวที่ขวาสุด) */}
        {onToggleHud && !isHudOpen && (
          <button
            type="button"
            onClick={onToggleHud}
            title="เปิดแถบสถานะตัวละคร"
            className="w-8 h-8 rounded-full bg-[#121212]/65 backdrop-blur-xl border border-white/[0.07] hover:border-white/20 text-app-primary flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 select-none"
          >
            <PanelRightOpen size={16} strokeWidth={1.8} />
          </button>
        )}
      </div>
    </div>
  )
}

export default ChatRoomHeader
