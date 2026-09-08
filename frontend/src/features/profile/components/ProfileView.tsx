import { useState } from 'react'
import {
  Check,
  X,
  ArrowLeft,
  LogOut,
} from 'lucide-react'
import SingleCoinIcon from '../../home/components/SingleCoinIcon'
import type { ProfileViewProps } from '../types'

export function ProfileView({
  userName = 'Alice',
  userEmail = '',
  userInitial = 'A',
  coinBalance = 1250,
  pronouns = 'คุณ',
  aboutMe = 'ชอบบทสนทนาที่เป็นกันเอง อบอุ่น และหยอกล้อเบาๆ',
  username = '@alice',
  onSaveProfile,
  onRedeemCoupon,
  onSignOut,
  onBackToHome,
  onTopUpCoins,
}: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'coupon' | 'account'>('profile')

  // Form State
  const [name, setName] = useState(userName)
  const [userHandle, setUserHandle] = useState(username)
  const [selectedPronoun, setSelectedPronoun] = useState(pronouns)
  const [about, setAbout] = useState(aboutMe)
  const [isSaved, setIsSaved] = useState(false)

  // Tracking props for render-time synchronization
  const [prevSyncKey, setPrevSyncKey] = useState(`${userName}_${pronouns}_${aboutMe}_${username}`)
  const currentSyncKey = `${userName}_${pronouns}_${aboutMe}_${username}`
  if (currentSyncKey !== prevSyncKey) {
    setPrevSyncKey(currentSyncKey)
    setName(userName)
    setUserHandle(username)
    setSelectedPronoun(pronouns)
    setAbout(aboutMe)
  }

  // Coupon State
  const [couponCode, setCouponCode] = useState('')
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveProfile?.({
      name: name.trim() || userName,
      username: userHandle.trim(),
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
    }

    setTimeout(() => {
      setCouponFeedback(null)
    }, 4000)
  }

  const tabTitleMap = {
    profile: 'แก้ไขโปรไฟล์',
    coupon: 'เหรียญ & คูปอง',
    account: 'บัญชีและความปลอดภัย',
  }

  const tabSubtitleMap = {
    profile: 'อัปเดตชื่อผู้ใช้ คำสรรพนาม และจัดการบุคลิกประจำตัวของคุณ',
    coupon: 'ตรวจสอบยอดเหรียญคงเหลือและแลกรับเหรียญฟรีด้วยโค้ดคูปอง',
    account: 'จัดการข้อมูลการเข้าสู่ระบบ อีเมล และความปลอดภัยของบัญชี',
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden no-scrollbar bg-[rgb(9,9,9)] text-[#F2F2F5] overscroll-contain select-none">
      
      {/* Container หลักกึ่งกลางจอ (Center-Focused Layout สไตล์ Dribbble Settings) */}
      <div className="w-full max-w-[940px] mx-auto px-5 sm:px-8 py-8 sm:py-12">
        
        {/* 1. Header Area: Avatar + Breadcrumb: [ชื่อผู้ใช้] / [แท็บปัจจุบัน] */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#2F3336]">
          <div className="flex items-center gap-3.5">
            {/* Avatar กลมเล็กตามเรฟ Dribbble */}
            <div className="relative shrink-0">
              <div className="w-[44px] h-[44px] rounded-full ring-1 ring-[#2F3336] bg-[#1D1D1F] border border-white/10 flex items-center justify-center">
                <span className="text-[17px] font-bold text-[#F2F2F5] leading-none">
                  {userInitial}
                </span>
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-1.5 ring-[rgb(9,9,9)]" />
            </div>

            {/* Breadcrumb Title & Subtitle */}
            <div>
              <div className="flex items-center gap-2 text-[17px] sm:text-[19px] leading-tight">
                <span className="font-bold text-[#F2F2F5]">{name}</span>
                <span className="text-[#ACACB2]/50 font-normal">/</span>
                <span className="font-bold text-[#F2F2F5]">{tabTitleMap[activeTab]}</span>
              </div>
              <p className="text-[12.5px] text-[#ACACB2] mt-0.5">
                {tabSubtitleMap[activeTab]}
              </p>
            </div>
          </div>

          {/* ปุ่มย้อนกลับไปหน้าแรก (Icon Button) */}
          <button
            type="button"
            onClick={onBackToHome}
            title="ย้อนกลับไปหน้าแรก"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-transparent hover:bg-white/[0.08] text-[#ACACB2] hover:text-[#F2F2F5] border border-[#2F3336] text-[12.5px] font-medium transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>หน้าแรก</span>
          </button>
        </div>

        {/* 2. สองคอลัมน์: แท็บทางซ้าย (ข้อความธรรมดาดิบๆ) | เนื้อหากล่องมุมมนทางขวา */}
        <div className="flex flex-col md:flex-row gap-8 lg:gap-14 items-start">
          
          {/* คอลัมน์ซ้าย: แท็บแบบข้อความธรรมดาดิบๆ สไตล์ Dribbble (Raw Text Sub-navigation) */}
          <nav className="w-full md:w-[170px] lg:w-[190px] shrink-0 flex flex-row md:flex-col gap-5 md:gap-3.5 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`text-left text-[14.5px] transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'font-bold text-[#F2F2F5]'
                  : 'font-normal text-[#ACACB2] hover:text-[#F2F2F5]'
              }`}
            >
              แก้ไขโปรไฟล์
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('coupon')}
              className={`text-left text-[14.5px] transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'coupon'
                  ? 'font-bold text-[#F2F2F5]'
                  : 'font-normal text-[#ACACB2] hover:text-[#F2F2F5]'
              }`}
            >
              เหรียญ & คูปอง
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`text-left text-[14.5px] transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'account'
                  ? 'font-bold text-[#F2F2F5]'
                  : 'font-normal text-[#ACACB2] hover:text-[#F2F2F5]'
              }`}
            >
              บัญชีและความปลอดภัย
            </button>
          </nav>

          {/* คอลัมน์ขวา: กล่องสี่เหลี่ยมมุมมนตามดีไซน์ของเรา (Apple Dark Gray #1D1D1F / Rounded Input Boxes) */}
          <div className="flex-1 w-full max-w-[620px]">
            
            {/* ----------------- TAB 1: แก้ไขโปรไฟล์ ----------------- */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSave} className="space-y-6">
                
                {/* 1. Username Field */}
                <div className="space-y-2">
                  <label className="block text-[13.5px] font-bold text-[#F2F2F5]">
                    ชื่อผู้ใช้ (Username)
                  </label>
                  <input
                    type="text"
                    value={userHandle}
                    onChange={(e) => setUserHandle(e.target.value)}
                    placeholder="@username"
                    className="w-full h-[44px] sm:h-[46px] rounded-xl border border-[#2F3336] bg-[#1D1D1F] px-4 text-[14.5px] text-[#F2F2F5] outline-none focus:border-[#EF264C] transition-colors font-mono"
                  />
                  <p className="text-[12px] text-[#ACACB2]">
                    URL โปรไฟล์ของคุณ: https://thesoul.ai/{userHandle.replace(/^@/, '')}
                  </p>
                </div>

                {/* 2. Display Name Field */}
                <div className="space-y-2">
                  <label className="block text-[13.5px] font-bold text-[#F2F2F5]">
                    ชื่อที่แสดง (Display Name)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น alizz lol"
                    className="w-full h-[44px] sm:h-[46px] rounded-xl border border-[#2F3336] bg-[#1D1D1F] px-4 text-[14.5px] text-[#F2F2F5] outline-none focus:border-[#EF264C] transition-colors"
                  />
                  <p className="text-[12px] text-[#ACACB2]">
                    ชื่อนี้จะแสดงในบทสนทนาและบัตรข้อมูลโปรไฟล์ของคุณ
                  </p>
                </div>

                {/* 3. Pronouns Selection Field */}
                <div className="space-y-2">
                  <label className="block text-[13.5px] font-bold text-[#F2F2F5]">
                    คำสรรพนาม (Pronouns) — สิ่งที่ตัวละคร AI จะใช้เรียกคุณ
                  </label>
                  <div className="relative">
                    <select
                      value={selectedPronoun}
                      onChange={(e) => setSelectedPronoun(e.target.value)}
                      className="w-full h-[44px] sm:h-[46px] rounded-xl border border-[#2F3336] bg-[#1D1D1F] px-4 text-[14.5px] text-[#F2F2F5] outline-none focus:border-[#EF264C] transition-colors cursor-pointer [&>option]:bg-[#1D1D1F] [&>option]:text-[#F2F2F5]"
                    >
                      <option value="คุณ">คุณ (สุภาพ / มาตรฐาน)</option>
                      <option value="พี่">พี่ (อบอุ่น / สนิทสนม)</option>
                      <option value="เธอ">เธอ (เป็นกันเอง)</option>
                      <option value="นายท่าน">นายท่าน (บทบาทนาย-บ่าว)</option>
                      <option value="หนู">หนู (น่ารัก / ออดอ้อน)</option>
                    </select>
                  </div>
                  <p className="text-[12px] text-[#ACACB2]">
                    โมเดล AI จะนำคำสรรพนามนี้ไปปรับใช้ในคำพูดและกิริยาอย่างแม่นยำ
                  </p>
                </div>

                {/* 4. Player Persona / About Field */}
                <div className="space-y-2">
                  <label className="block text-[13.5px] font-bold text-[#F2F2F5]">
                    ข้อมูลเกี่ยวกับคุณ (Player Persona & Vibe)
                  </label>
                  <textarea
                    rows={3}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="เช่น ชอบบทสนทนาหยอกล้อ ไม่ทางการ มีระยะห่างที่พอดี"
                    className="w-full rounded-xl border border-[#2F3336] bg-[#1D1D1F] p-3.5 px-4 text-[14px] text-[#F2F2F5] outline-none focus:border-[#EF264C] transition-colors resize-none leading-relaxed"
                  />
                  <p className="text-[12px] text-[#ACACB2]">
                    ระบุสไตล์ บุคลิก หรือโทนบทสนทนาที่คุณชื่นชอบ เพื่อให้ AI ปรับจูนเข้าหาคุณ
                  </p>
                </div>

                {/* Bottom Row: Save Changes Button */}
                <div className="pt-4 flex items-center justify-between">
                  {isSaved ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 text-[13px] font-medium animate-in fade-in">
                      <Check size={16} /> บันทึกการเปลี่ยนแปลงสำเร็จ!
                    </span>
                  ) : <span />}

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white font-bold text-[13.5px] transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    Save Changes
                  </button>
                </div>

              </form>
            )}

            {/* ----------------- TAB 2: เหรียญ & คูปอง ----------------- */}
            {activeTab === 'coupon' && (
              <div className="space-y-6">
                
                {/* 1. Coin Balance Display Box */}
                <div className="space-y-2">
                  <label className="block text-[13.5px] font-bold text-[#F2F2F5]">
                    ยอดเหรียญคงเหลือ
                  </label>
                  <div className="rounded-xl border border-[#2F3336] bg-[#1D1D1F] p-4 px-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                        <SingleCoinIcon size={22} />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90">ยอดกระเป๋า</span>
                        <h4 className="text-[22px] font-bold text-[#F2F2F5] leading-tight">
                          {coinBalance.toLocaleString()} <span className="text-[13.5px] font-normal text-[#ACACB2]">เหรียญ</span>
                        </h4>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onTopUpCoins}
                      className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-[#EF264C] text-[#F2F2F5] hover:text-white text-[12.5px] font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      + เติมเหรียญ
                    </button>
                  </div>
                  <p className="text-[12px] text-[#ACACB2]">
                    เหรียญใช้สำหรับเปิดบทสนทนาและโต้ตอบกับตัวละครทั้งหมดใน The Soul
                  </p>
                </div>

                {/* 2. Redeem Coupon Code Field */}
                <div className="space-y-2">
                  <label className="block text-[13.5px] font-bold text-[#F2F2F5]">
                    แลกรับเหรียญด้วยโค้ดคูปอง (Redeem Code)
                  </label>
                  <form onSubmit={handleRedeem} className="flex gap-2.5">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="กรอกโค้ด เช่น SOUL2026, WELCOME100, SOULFREE"
                      className="flex-1 h-[46px] rounded-xl border border-[#2F3336] bg-[#1D1D1F] px-4 text-[14.5px] text-[#F2F2F5] outline-none focus:border-[#EF264C] transition-colors uppercase font-mono tracking-wider placeholder:normal-case placeholder:font-sans"
                    />
                    <button
                      type="submit"
                      disabled={!couponCode.trim()}
                      className="px-5 py-2 rounded-xl bg-[#EF264C] hover:bg-[#d91d40] disabled:opacity-40 text-white font-bold text-[13.5px] transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
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
                  <div className="pt-2 flex items-center gap-2 flex-wrap text-[12px] text-[#ACACB2]">
                    <span>💡 ลองโค้ด:</span>
                    <span 
                      onClick={() => setCouponCode('SOUL2026')}
                      className="text-amber-300 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded text-[11.5px] font-mono cursor-pointer transition-colors border border-white/5"
                    >
                      SOUL2026 (+300)
                    </span>
                    <span 
                      onClick={() => setCouponCode('WELCOME100')}
                      className="text-amber-300 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded text-[11.5px] font-mono cursor-pointer transition-colors border border-white/5"
                    >
                      WELCOME100 (+100)
                    </span>
                    <span 
                      onClick={() => setCouponCode('SOULFREE')}
                      className="text-amber-300 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded text-[11.5px] font-mono cursor-pointer transition-colors border border-white/5"
                    >
                      SOULFREE (+200)
                    </span>
                  </div>
                </div>

              </div>
            )}

            {/* ----------------- TAB 3: บัญชีและความปลอดภัย ----------------- */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                
                {/* 1. Account Email Field */}
                <div className="space-y-2">
                  <label className="block text-[13.5px] font-bold text-[#F2F2F5]">
                    อีเมลบัญชี (Account Email)
                  </label>
                  <div className="w-full h-[46px] rounded-xl border border-[#2F3336] bg-[#1D1D1F] px-4 flex items-center">
                    <span className="text-[14.5px] text-[#F2F2F5] font-mono">
                      {userEmail || 'ยังไม่ได้ผูกอีเมล (สถานะ Guest)'}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#ACACB2]">
                    อีเมลหลักสำหรับรับการแจ้งเตือนและยืนยันตัวตนในระบบ
                  </p>
                </div>

                {/* 2. Password Field */}
                <div className="space-y-2">
                  <label className="block text-[13.5px] font-bold text-[#F2F2F5]">
                    รหัสผ่าน (Password)
                  </label>
                  <div className="rounded-xl border border-[#2F3336] bg-[#1D1D1F] p-3.5 px-4 flex items-center justify-between">
                    <div>
                      <span className="text-[14px] text-[#F2F2F5] font-mono">••••••••••••</span>
                      <p className="text-[11.5px] text-[#ACACB2] mt-0.5">เปลี่ยนรหัสผ่านเพื่อความปลอดภัยของบัญชี</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert('ฟีเจอร์เปลี่ยนรหัสผ่านจะพร้อมใช้งานเมื่อเข้าสู่ระบบด้วยอีเมล')}
                      className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-[12.5px] font-medium text-[#F2F2F5] transition-colors cursor-pointer"
                    >
                      เปลี่ยนรหัสผ่าน
                    </button>
                  </div>
                </div>

                {/* 3. Sign Out Button */}
                <div className="pt-4 border-t border-[#2F3336]">
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-[13.5px] transition-colors cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>ออกจากระบบ</span>
                  </button>
                  <p className="text-[11.5px] text-[#ACACB2] mt-2">
                    เมื่อออกจากระบบ ข้อมูลจะสลับกลับสู่โหมดนักเดินทางนิรนาม (Guest)
                  </p>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  )
}

export default ProfileView
