import { useEffect, useRef } from 'react'
import { User, LogOut, Plus } from 'lucide-react'
import SingleCoinIcon from '../../home/components/SingleCoinIcon'
import type { ProfileDropdownProps } from '../types'

export function ProfileDropdown({
  isOpen,
  onClose,
  userName = 'Alice',
  userEmail = '',
  userInitial = 'A',
  coinBalance = 1250,
  planName = 'Free Plan',
  onEditProfileClick,
  onSignOut,
  onTopUpClick,
}: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ดักจับการคลิกด้านนอกเพื่อปิด Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2.5 w-[260px] sm:w-[280px] bg-[#121214]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-[0_16px_40px_rgba(0,0,0,0.7)] z-50 animate-in fade-in zoom-in-95 duration-150 select-none"
    >
      {/* 1. Header: Avatar วงกลมใหญ่ + จุดเขียว Online */}
      <div className="flex flex-col items-center pt-1 pb-3 text-center">
        <div className="relative">
          <div className="w-[52px] h-[52px] rounded-full ring-2 ring-[#2F3336] shadow-md bg-gradient-to-br from-[#2D2D32] to-[#1C1C1E] border border-white/10 flex items-center justify-center">
            <span className="text-[20px] font-bold text-app-primary leading-none">
              {userInitial}
            </span>
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#121214]" />
        </div>

        <h3 className="text-[15.5px] font-bold text-app-primary mt-2.5 truncate max-w-[220px]">
          {userName}
        </h3>
        {userEmail ? (
          <p className="text-[12px] text-app-secondary truncate max-w-[220px]">
            {userEmail}
          </p>
        ) : (
          <span className="text-[11px] font-medium text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1 border border-emerald-500/20">
            {planName}
          </span>
        )}
      </div>

      {/* 2. Coin Wallet Snippet: ยอดเหรียญ + ปุ่มเติมเหรียญ */}
      <div className="flex items-center justify-between bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 my-1">
        <div className="flex items-center gap-2">
          <SingleCoinIcon size={16} />
          <div className="flex flex-col">
            <span className="text-[10px] text-app-secondary uppercase tracking-wider font-semibold">ยอดเหรียญ</span>
            <span className="text-[13px] font-bold text-app-primary">{coinBalance.toLocaleString()}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onClose()
            onTopUpClick?.()
          }}
          className="flex items-center gap-1 text-[11px] font-bold text-app-secondary hover:text-white bg-white/10 hover:bg-[#EF264C] px-2.5 py-1 rounded-full transition-all cursor-pointer"
        >
          <Plus size={12} strokeWidth={2.5} />
          <span>เติม</span>
        </button>
      </div>

      {/* 3. เส้นคั่น */}
      <div className="h-[1px] bg-white/10 my-2.5" />

      {/* 4. รายการเมนู */}
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => {
            onClose()
            onEditProfileClick()
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.08] text-app-primary text-[13.5px] font-medium transition-colors cursor-pointer group text-left"
        >
          <User size={16} className="text-app-secondary group-hover:text-[#EF264C] transition-colors" />
          <span>แก้ไขโปรไฟล์ & คูปอง</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose()
            onSignOut()
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 text-[13.5px] font-medium transition-colors cursor-pointer group text-left"
        >
          <LogOut size={16} className="text-red-400/80 group-hover:text-red-400 transition-colors" />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </div>
  )
}

export default ProfileDropdown
