import { useState, useEffect } from 'react'
import { X, User, Shield, Ticket, Check, Sparkles, LogOut } from 'lucide-react'
import SingleCoinIcon from '../../home/components/SingleCoinIcon'
import type { ProfileSettingsModalProps } from '../types'

export function ProfileSettingsModal({
  isOpen,
  onClose,
  userName = 'Alice',
  userEmail = '',
  userInitial = 'A',
  coinBalance = 1250,
  pronouns = 'คุณ',
  aboutMe = 'ชอบบทสนทนาที่เป็นกันเอง อบอุ่น และหยอกล้อเบาๆ',
  onSaveProfile,
  onRedeemCoupon,
  onSignOut,
}: ProfileSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'coupon'>('profile')

  // Form State
  const [name, setName] = useState(userName)
  const [username, setUsername] = useState(`@${userName.toLowerCase().replace(/\s+/g, '_')}`)
  const [selectedPronoun, setSelectedPronoun] = useState(pronouns)
  const [about, setAbout] = useState(aboutMe)
  const [isSaved, setIsSaved] = useState(false)

  // Tracking props for render-time synchronization
  const [prevSyncKey, setPrevSyncKey] = useState(`${userName}_${pronouns}_${aboutMe}_${isOpen}`)
  const currentSyncKey = `${userName}_${pronouns}_${aboutMe}_${isOpen}`
  if (currentSyncKey !== prevSyncKey) {
    setPrevSyncKey(currentSyncKey)
    setName(userName)
    setUsername(`@${userName.toLowerCase().replace(/\s+/g, '_')}`)
    setSelectedPronoun(pronouns)
    setAbout(aboutMe)
  }

  // Coupon State
  const [couponCode, setCouponCode] = useState('')
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // ปิดด้วยปุ่ม Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveProfile?.({
      name: name.trim() || userName,
      username: username.trim(),
      pronouns: selectedPronoun,
      aboutMe: about.trim(),
    })
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponCode.trim()) return

    if (onRedeemCoupon) {
      const res = onRedeemCoupon(couponCode.trim())
      setCouponFeedback({
        type: res.success ? 'success' : 'error',
        message: res.message,
      })
      if (res.success) setCouponCode('')
    } else {
      // Fallback default mock logic
      const code = couponCode.trim().toUpperCase()
      if (code === 'WELCOME100' || code === 'MAOMOIFREE' || code === 'MAOMOI2026') {
        setCouponFeedback({
          type: 'success',
          message: `แลกรับสำเร็จ! ได้รับ +${code === 'MAOMOI2026' ? 500 : code === 'MAOMOIFREE' ? 200 : 100} เหรียญ`,
        })
        setCouponCode('')
      } else {
        setCouponFeedback({
          type: 'error',
          message: 'รหัสคูปองไม่ถูกต้อง หรือหมดอายุแล้ว',
        })
      }
    }

    setTimeout(() => {
      setCouponFeedback(null)
    }, 4000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* 1. Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-200" 
      />

      {/* 2. Main Modal Shell (Pinterest Inspired Layout) */}
      <div className="relative w-full max-w-[820px] bg-[#121214]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] z-10 flex flex-col md:flex-row overflow-hidden min-h-[540px] animate-in fade-in zoom-in-95 duration-200 select-none">
        {/* ปุ่มปิด (X) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-app-secondary hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={18} strokeWidth={2} />
        </button>

        {/* 3. Left Navigation Bar (Sidebar Tabs) */}
        <div className="w-full md:w-[220px] bg-black/40 border-b md:border-b-0 md:border-r border-white/10 p-4 sm:p-5 flex flex-row md:flex-col gap-1.5 shrink-0 overflow-x-auto">
          <div className="hidden md:block mb-4 pl-2">
            <h2 className="text-[17px] font-bold text-app-primary">การตั้งค่า</h2>
            <p className="text-[12px] text-app-secondary">จัดการบัญชีและตัวละคร</p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-app-secondary hover:text-app-primary hover:bg-white/5'
            }`}
          >
            <User size={16} className={activeTab === 'profile' ? 'text-[#EF264C]' : ''} />
            <span>แก้ไขโปรไฟล์</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('coupon')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'coupon'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-app-secondary hover:text-app-primary hover:bg-white/5'
            }`}
          >
            <Ticket size={16} className={activeTab === 'coupon' ? 'text-amber-400' : ''} />
            <span>เหรียญ & คูปอง</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'account'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-app-secondary hover:text-app-primary hover:bg-white/5'
            }`}
          >
            <Shield size={16} className={activeTab === 'account' ? 'text-[#EF264C]' : ''} />
            <span>บัญชี & ความปลอดภัย</span>
          </button>
        </div>

        {/* 4. Right Content Area */}
        <div className="flex-1 p-5 sm:p-8 overflow-y-auto max-h-[80vh]">
          {/* TAB 1: แก้ไขโปรไฟล์ (Edit Profile) */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <h3 className="text-[20px] sm:text-[22px] font-bold text-app-primary">
                  แก้ไขโปรไฟล์
                </h3>
                <p className="text-[13px] text-app-secondary mt-1">
                  ปรับแต่งตัวตนและคำสรรพนาม เพื่อให้ตัวละคร AI จดจำและเรียกคุณได้อย่างคุ้นเคย
                </p>
              </div>

              {/* Photo Section */}
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-app-secondary uppercase tracking-wider">
                  รูปโปรไฟล์ (Photo)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-[60px] h-[60px] rounded-full ring-2 ring-[#2F3336] shadow-md bg-gradient-to-br from-[#2D2D32] to-[#1C1C1E] border border-white/10 flex items-center justify-center shrink-0">
                    <span className="text-[24px] font-bold text-app-primary leading-none">
                      {userInitial}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert('ฟีเจอร์อัปโหลดภาพจะพร้อมใช้งานเร็วๆ นี้')}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-app-primary text-[13px] font-medium transition-colors cursor-pointer"
                  >
                    เปลี่ยนรูป
                  </button>
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-app-secondary uppercase tracking-wider">
                  ชื่อที่แสดง (Name)
                </label>
                <div className="border border-white/15 focus-within:border-[#EF264C] bg-white/[0.04] rounded-2xl p-2.5 px-4 transition-all">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น alizz lol"
                    className="w-full bg-transparent text-app-primary text-[14.5px] outline-none"
                  />
                </div>
              </div>

              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-app-secondary uppercase tracking-wider">
                  ชื่อผู้ใช้ (Username)
                </label>
                <div className="border border-white/15 focus-within:border-[#EF264C] bg-white/[0.04] rounded-2xl p-2.5 px-4 transition-all">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@username"
                    className="w-full bg-transparent text-app-primary text-[14.5px] outline-none"
                  />
                </div>
              </div>

              {/* Pronouns Selection */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-app-secondary uppercase tracking-wider">
                  คำสรรพนาม (Pronouns) — สิ่งที่ AI จะใช้เรียกคุณ
                </label>
                <div className="border border-white/15 focus-within:border-[#EF264C] bg-white/[0.04] rounded-2xl p-2.5 px-4 transition-all">
                  <select
                    value={selectedPronoun}
                    onChange={(e) => setSelectedPronoun(e.target.value)}
                    className="w-full bg-transparent text-app-primary text-[14.5px] outline-none cursor-pointer [&>option]:bg-[#1A1A1E] [&>option]:text-white"
                  >
                    <option value="คุณ">คุณ (สุภาพ/มาตรฐาน)</option>
                    <option value="พี่">พี่ (อบอุ่น/สนิทสนม)</option>
                    <option value="เธอ">เธอ (เป็นกันเอง)</option>
                    <option value="นายท่าน">นายท่าน (บทบาทนาย-บ่าว)</option>
                    <option value="หนู">หนู (น่ารัก/ออดอ้อน)</option>
                  </select>
                </div>
                <p className="text-[11.5px] text-app-secondary/70 pl-1">
                  เลือกสรรพนามที่ชอบเพื่อให้ตัวละคร AI ในแชทนำไปใช้อย่างถูกต้อง
                </p>
              </div>

              {/* About / Player Persona */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-app-secondary uppercase tracking-wider">
                  บุคลิกประจำตัว (Player Persona & Vibe)
                </label>
                <div className="border border-white/15 focus-within:border-[#EF264C] bg-white/[0.04] rounded-2xl p-3 px-4 transition-all">
                  <textarea
                    rows={3}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="เช่น ชอบบทสนทนาหยอกล้อ ไม่ทางการ มีระยะห่างที่พอดี"
                    className="w-full bg-transparent text-app-primary text-[14px] outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex items-center justify-between">
                {isSaved ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 text-[13px] font-medium animate-in fade-in">
                    <Check size={16} /> บันทึกข้อมูลสำเร็จ!
                  </span>
                ) : <span />}

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white font-bold text-[14px] shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  บันทึกการเปลี่ยนแปลง
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: เหรียญ & คูปอง (Coins & Coupon) */}
          {activeTab === 'coupon' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[20px] sm:text-[22px] font-bold text-app-primary flex items-center gap-2">
                  <Ticket className="text-amber-400" size={24} />
                  <span>กระเป๋าเหรียญ & คูปอง</span>
                </h3>
                <p className="text-[13px] text-app-secondary mt-1">
                  ตรวจสอบยอดเหรียญและกรอกรหัสคูปองเพื่อแลกรับเหรียญฟรีสำหรับสนทนากับตัวละคร
                </p>
              </div>

              {/* Coin Balance Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <SingleCoinIcon size={26} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/80">ยอดเหรียญคงเหลือ</span>
                    <h4 className="text-[24px] font-bold text-app-primary leading-tight">
                      {coinBalance.toLocaleString()} <span className="text-[14px] font-normal text-app-secondary">เหรียญ</span>
                    </h4>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[12px] text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <Sparkles size={13} /> พร้อมใช้งาน
                  </span>
                </div>
              </div>

              {/* Redeem Coupon Box */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                <div>
                  <h4 className="text-[15px] font-bold text-app-primary">
                    แลกรับเหรียญด้วยโค้ดคูปอง (Redeem Code)
                  </h4>
                  <p className="text-[12.5px] text-app-secondary mt-0.5">
                    นำรหัสโค้ดโปรโมชันมากรอกเพื่อรับเหรียญฟรีทันที
                  </p>
                </div>

                <form onSubmit={handleRedeem} className="flex gap-2.5">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="กรอกโค้ดคูปอง เช่น WELCOME100, SOULFREE"
                    className="flex-1 bg-white/5 border border-white/15 focus:border-[#EF264C] rounded-full px-4 text-[14px] text-app-primary outline-none uppercase font-mono tracking-wider transition-all placeholder:normal-case placeholder:font-sans"
                  />
                  <button
                    type="submit"
                    disabled={!couponCode.trim()}
                    className="px-5 py-2.5 rounded-full bg-[#EF264C] hover:bg-[#d91d40] disabled:opacity-40 text-white font-bold text-[13.5px] transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                  >
                    แลกรับ
                  </button>
                </form>

                {couponFeedback && (
                  <div
                    className={`p-3 rounded-xl text-[13px] font-medium flex items-center gap-2 animate-in fade-in ${
                      couponFeedback.type === 'success'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-red-500/15 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {couponFeedback.type === 'success' ? <Check size={16} /> : <X size={16} />}
                    <span>{couponFeedback.message}</span>
                  </div>
                )}

                {/* โค้ดแนะนำสำหรับทดสอบ */}
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[11.5px] text-app-secondary/70">
                    💡 โค้ดทดสอบ: ลองพิมพ์ <code className="text-amber-300 bg-white/10 px-1.5 py-0.5 rounded text-[11px]">MAOMOI2026</code> (+500 เหรียญ) หรือ <code className="text-amber-300 bg-white/10 px-1.5 py-0.5 rounded text-[11px]">MAOMOIFREE</code> (+200 เหรียญ)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: บัญชี & ความปลอดภัย (Account) */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[20px] sm:text-[22px] font-bold text-app-primary">
                  บัญชีและความปลอดภัย
                </h3>
                <p className="text-[13px] text-app-secondary mt-1">
                  จัดการข้อมูลการเข้าสู่ระบบและสถานะบัญชีของคุณ
                </p>
              </div>

              {/* Email Section */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                <span className="text-[11px] font-bold text-app-secondary uppercase tracking-wider">อีเมลที่ผูกไว้</span>
                <p className="text-[14.5px] font-semibold text-app-primary">
                  {userEmail || 'ยังไม่ได้ผูกอีเมล (สถานะ Guest)'}
                </p>
              </div>

              {/* Password Section */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-[14px] font-semibold text-app-primary">รหัสผ่าน (Password)</h4>
                  <p className="text-[12px] text-app-secondary">เปลี่ยนรหัสผ่านเพื่อความปลอดภัยของบัญชี</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('ฟีเจอร์เปลี่ยนรหัสผ่านจะพร้อมใช้งานเมื่อเข้าสู่ระบบด้วยอีเมล')}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-[12.5px] font-medium text-app-primary transition-colors cursor-pointer"
                >
                  เปลี่ยนรหัสผ่าน
                </button>
              </div>

              {/* Sign Out Button */}
              <div className="pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onSignOut?.()
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-[13.5px] transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileSettingsModal
