import { Plus, Bell, ChevronDown } from 'lucide-react'
import SingleCoinIcon from '../../home/components/SingleCoinIcon'
import type { HeaderActionGroupProps } from '../types'

export function HeaderActionGroup({
  coinBalance = 1250,
  notificationCount = 3,
  onCoinClick,
  onNotificationClick,
  onProfileClick,
  userInitial = 'A',
  userName = 'Alice',
  className = '',
}: HeaderActionGroupProps) {
  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 ${className}`}>
      {/* 1. Single Coin Balance Pill (ปุ่ม pill กระจก เส้นขอบบางจนแทบมองไม่เห็น) */}
      <button
        type="button"
        onClick={onCoinClick}
        title={`ยอดเหรียญคงเหลือ ${coinBalance.toLocaleString()} เหรียญ (กดเพื่อเติมเหรียญ)`}
        className="group flex items-center gap-1.5 pl-2.5 pr-1.5 h-[30px] sm:h-[32px] rounded-full bg-[#121212]/65 backdrop-blur-xl hover:bg-white/10 border border-white/[0.07] hover:border-white/20 transition-all duration-200 cursor-pointer shadow-lg active:scale-95 select-none"
      >
        <div className="flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
          <SingleCoinIcon size={15} />
        </div>
        <span className="font-medium text-[12px] sm:text-[12.5px] text-app-primary tracking-tight">
          {coinBalance.toLocaleString()}
        </span>
        <div className="w-[17px] h-[17px] rounded-full bg-white/10 group-hover:bg-amber-400/20 group-hover:text-amber-300 text-app-secondary flex items-center justify-center transition-all duration-150 ml-0.5 flex-shrink-0">
          <Plus size={10} strokeWidth={2.5} />
        </div>
      </button>

      {/* 2. Notification Bell Button (เอากรอบออกเพื่อให้ขยายไอคอนให้ชัดขึ้น พร้อม Badge ตัวเลขสีแดงสด) */}
      <button
        type="button"
        onClick={onNotificationClick}
        title={`การแจ้งเตือน ${notificationCount > 0 ? `(${notificationCount} รายการ)` : ''}`}
        className="w-8 h-8 rounded-full hover:bg-white/[0.08] flex items-center justify-center text-app-secondary hover:text-app-primary transition-all duration-200 relative cursor-pointer group select-none"
      >
        <Bell size={20} strokeWidth={1.8} className="group-hover:rotate-12 transition-transform duration-200" />
        {notificationCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#EF264C] text-white text-[10px] font-bold leading-none flex items-center justify-center ring-2 ring-[rgb(9,9,9)] shadow-sm select-none pointer-events-none">
            {notificationCount > 99 ? '99+' : notificationCount}
          </span>
        )}
      </button>

      {/* 3. Profile Avatar Button (ขนาดกะทัดรัดเท่าเดิม เส้นขอบสีเทาเข้มกลมกลืน ไม่กวนสายตา) */}
      <button
        type="button"
        onClick={onProfileClick}
        title={`โปรไฟล์: ${userName}`}
        className="flex items-center gap-1 pl-0.5 pr-1 py-0.5 rounded-full hover:bg-white/[0.08] transition-colors cursor-pointer group select-none"
      >
        <div className="w-[30px] h-[30px] sm:w-[32px] sm:h-[32px] rounded-full shrink-0 ring-1 ring-[#2F3336]/80 group-hover:ring-[#2F3336] shadow-md bg-gradient-to-br from-[#2D2D32] to-[#1C1C1E] border border-white/5 flex items-center justify-center transition-all">
          <span className="text-[13px] sm:text-[14px] font-bold text-app-primary select-none leading-none">
            {userInitial}
          </span>
        </div>
        <ChevronDown size={13} className="text-app-secondary group-hover:text-app-primary transition-colors stroke-[2.2] flex-shrink-0" />
      </button>
    </div>
  );
}

export default HeaderActionGroup;
