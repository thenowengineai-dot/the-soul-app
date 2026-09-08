import { useState } from 'react'
import {
  User,
  Shield,
  Ticket,
  Check,
  X,
  Sparkles,
  LogOut,
  ArrowLeft,
  Coins,
  BadgeCheck
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

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden no-scrollbar bg-[rgb(9,9,9)] text-app-primary overscroll-contain select-none">
      {/* 1. Header Navigation Bar (ปุ่มย้อนกลับไปหน้าแรก + หัวข้อหน้า) */}
      <div className="sticky top-0 z-20 bg-[rgb(9,9,9)]/90 backdrop-blur-xl border-b border-white/[0.06] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToHome}
            title="ย้อนกลับไปหน้าแรก"
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-app-secondary hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 active:scale-95"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-[17px] sm:text-[19px] font-bold text-app-primary leading-tight">
              โปรไฟล์ & ศูนย์ควบคุมบัญชี
            </h1>
            <p className="text-[11.5px] text-app-secondary">
              จัดการตัวตน ข้อมูลส่วนบุคคล และกระเป๋าเหรียญของคุณ
            </p>
          </div>
        </div>

        {/* ยอดเหรียญมุมขวา */}
        <div 
          onClick={onTopUpCoins}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[13px] font-bold cursor-pointer hover:bg-amber-500/15 transition-all shadow-sm"
        >
          <SingleCoinIcon size={16} />
          <span>{coinBalance.toLocaleString()}</span>
          <span className="text-[11px] font-normal text-app-secondary">เหรียญ</span>
        </div>
      </div>

      {/* 2. Main Content Container (Center-Focused Layout max-w-[1000px] ตามกฎ GEMINI.md) */}
      <div className="flex-1 w-full max-w-[1000px] mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* 2.1 Hero Profile Banner Card (Editorial Dark Luxury) */}
        <div className="relative rounded-3xl bg-gradient-to-b from-[#18181B]/80 to-[#121214]/95 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Subtle Ambient Background Flare */}
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#EF264C]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
            {/* Large Avatar with Emerald Online Indicator */}
            <div className="relative shrink-0">
              <div className="w-[84px] h-[84px] sm:w-[96px] sm:h-[96px] rounded-full ring-2 ring-[#2F3336] shadow-xl bg-gradient-to-br from-[#2D2D32] to-[#1C1C1E] border border-white/10 flex items-center justify-center">
                <span className="text-[34px] sm:text-[38px] font-bold text-app-primary leading-none">
                  {userInitial}
                </span>
              </div>
              <span 
                title="สถานะ: ออนไลน์"
                className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-[#121214]" 
              />
            </div>

            {/* Profile Info & Pills */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-[24px] sm:text-[28px] font-bold text-app-primary truncate">
                  {name}
                </h2>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    <BadgeCheck size={13} /> สมาชิก The Soul
                  </span>
                  <span className="text-[11px] font-semibold text-[#EF264C] bg-[#EF264C]/10 px-2.5 py-0.5 rounded-full border border-[#EF264C]/25">
                    สรรพนาม: {selectedPronoun}
                  </span>
                </div>
              </div>

              <p className="text-[13px] text-app-secondary font-mono">
                {userHandle} {userEmail && `• ${userEmail}`}
              </p>

              <p className="text-[13px] text-app-secondary/90 leading-relaxed max-w-[620px]">
                {about}
              </p>
            </div>
          </div>
        </div>

        {/* 2.2 Pinterest-Style Tabs Navigation Bar */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[14px] font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-white text-black font-semibold shadow-md'
                : 'text-app-secondary hover:text-app-primary hover:bg-white/5'
            }`}
          >
            <User size={16} className={activeTab === 'profile' ? 'text-black' : 'text-[#EF264C]'} />
            <span>แก้ไขโปรไฟล์ & สรรพนาม</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('coupon')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[14px] font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'coupon'
                ? 'bg-white text-black font-semibold shadow-md'
                : 'text-app-secondary hover:text-app-primary hover:bg-white/5'
            }`}
          >
            <Ticket size={16} className={activeTab === 'coupon' ? 'text-black' : 'text-amber-400'} />
            <span>กระเป๋าเหรียญ & โค้ดคูปอง</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[14px] font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'account'
                ? 'bg-white text-black font-semibold shadow-md'
                : 'text-app-secondary hover:text-app-primary hover:bg-white/5'
            }`}
          >
            <Shield size={16} className={activeTab === 'account' ? 'text-black' : 'text-emerald-400'} />
            <span>บัญชี & ความปลอดภัย</span>
          </button>
        </div>

        {/* 2.3 Tab Contents Section */}
        <div className="rounded-3xl bg-[#121214]/90 border border-white/10 p-6 sm:p-8 backdrop-blur-xl">
          
          {/* TAB 1: แก้ไขโปรไฟล์ & สรรพนาม */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <h3 className="text-[20px] font-bold text-app-primary">
                  ข้อมูลโปรไฟล์ & สรรพนามที่ใช้สนทนา
                </h3>
                <p className="text-[13px] text-app-secondary mt-1">
                  ปรับแต่งตัวตนและคำสรรพนาม เพื่อให้ตัวละคร AI จดจำและเรียกคุณได้อย่างคุ้นเคยสมจริงในห้องแชท
                </p>
              </div>

              {/* Photo Section */}
              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-app-secondary uppercase tracking-wider">
                  รูปโปรไฟล์ (Photo)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-[64px] h-[64px] rounded-full ring-2 ring-[#2F3336] shadow-md bg-gradient-to-br from-[#2D2D32] to-[#1C1C1E] border border-white/10 flex items-center justify-center shrink-0">
                    <span className="text-[26px] font-bold text-app-primary leading-none">
                      {userInitial}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert('ฟีเจอร์อัปโหลดภาพจะพร้อมใช้งานเร็วๆ นี้')}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-app-primary text-[13px] font-medium transition-colors cursor-pointer"
                  >
                    เปลี่ยนรูปภาพ
                  </button>
                </div>
              </div>

              {/* Display Name Input */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-app-secondary uppercase tracking-wider">
                  ชื่อที่แสดง (Display Name)
                </label>
                <div className="border border-white/15 focus-within:border-[#EF264C] bg-white/[0.04] rounded-2xl p-3 px-4 transition-all">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น Aliceer"
                    className="w-full bg-transparent text-app-primary text-[14.5px] outline-none"
                  />
                </div>
              </div>

              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-app-secondary uppercase tracking-wider">
                  ชื่อผู้ใช้ (Username)
                </label>
                <div className="border border-white/15 focus-within:border-[#EF264C] bg-white/[0.04] rounded-2xl p-3 px-4 transition-all">
                  <input
                    type="text"
                    value={userHandle}
                    onChange={(e) => setUserHandle(e.target.value)}
                    placeholder="@username"
                    className="w-full bg-transparent text-app-primary text-[14.5px] outline-none font-mono"
                  />
                </div>
              </div>

              {/* Pronouns Selection */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-app-secondary uppercase tracking-wider">
                  คำสรรพนาม (Pronouns) — สิ่งที่ตัวละคร AI จะใช้เรียกคุณ
                </label>
                <div className="border border-white/15 focus-within:border-[#EF264C] bg-white/[0.04] rounded-2xl p-3 px-4 transition-all">
                  <select
                    value={selectedPronoun}
                    onChange={(e) => setSelectedPronoun(e.target.value)}
                    className="w-full bg-transparent text-app-primary text-[14.5px] outline-none cursor-pointer [&>option]:bg-[#1A1A1E] [&>option]:text-white"
                  >
                    <option value="คุณ">คุณ (สุภาพ / มาตรฐาน)</option>
                    <option value="พี่">พี่ (อบอุ่น / สนิทสนม)</option>
                    <option value="เธอ">เธอ (เป็นกันเอง)</option>
                    <option value="นายท่าน">นายท่าน (บทบาทนาย-บ่าว)</option>
                    <option value="หนู">หนู (น่ารัก / ออดอ้อน)</option>
                  </select>
                </div>
                <p className="text-[11.5px] text-app-secondary/70 pl-1">
                  💡 คำสรรพนามนี้จะถูกส่งต่อไปยังโมเดล AI เพื่อให้การ Roleplay เรียกชื่อและสถานะของคุณได้อย่างแม่นยำ
                </p>
              </div>

              {/* Player Persona / About Me */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-app-secondary uppercase tracking-wider">
                  บุคลิกประจำตัว (Player Persona & Vibe)
                </label>
                <div className="border border-white/15 focus-within:border-[#EF264C] bg-white/[0.04] rounded-2xl p-3 px-4 transition-all">
                  <textarea
                    rows={4}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="เช่น ชอบบทสนทนาหยอกล้อ ไม่ทางการ มีระยะห่างที่พอดี ไม่เร่งรีบ"
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
                  className="px-7 py-3 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white font-bold text-[14.5px] shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  บันทึกการเปลี่ยนแปลง
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: กระเป๋าเหรียญ & โค้ดคูปอง */}
          {activeTab === 'coupon' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[20px] font-bold text-app-primary flex items-center gap-2">
                  <Coins className="text-amber-400" size={24} />
                  <span>กระเป๋าเหรียญ & คูปองโปรโมชัน</span>
                </h3>
                <p className="text-[13px] text-app-secondary mt-1">
                  ตรวจสอบยอดเหรียญและกรอกรหัสคูปองเพื่อแลกรับเหรียญฟรีสำหรับสนทนากับตัวละคร
                </p>
              </div>

              {/* Coin Balance Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <SingleCoinIcon size={32} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/80">ยอดเหรียญคงเหลือ</span>
                    <h4 className="text-[28px] font-bold text-app-primary leading-tight">
                      {coinBalance.toLocaleString()} <span className="text-[15px] font-normal text-app-secondary">เหรียญ</span>
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onTopUpCoins}
                    className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-[#EF264C] text-white font-bold text-[13px] transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    + เติมเหรียญ
                  </button>
                  <span className="inline-flex items-center gap-1 text-[12px] text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                    <Sparkles size={13} /> พร้อมใช้งาน
                  </span>
                </div>
              </div>

              {/* Redeem Coupon Box */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                <div>
                  <h4 className="text-[16px] font-bold text-app-primary">
                    แลกรับเหรียญด้วยโค้ดคูปอง (Redeem Code)
                  </h4>
                  <p className="text-[13px] text-app-secondary mt-0.5">
                    นำรหัสโค้ดโปรโมชันมากรอกเพื่อรับเหรียญเพิ่มทันที
                  </p>
                </div>

                <form onSubmit={handleRedeem} className="flex gap-2.5">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="กรอกโค้ด เช่น SOUL2026, WELCOME100, SOULFREE"
                    className="flex-1 bg-white/5 border border-white/15 focus:border-[#EF264C] rounded-full px-5 py-3 text-[14.5px] text-app-primary outline-none uppercase font-mono tracking-wider transition-all placeholder:normal-case placeholder:font-sans"
                  />
                  <button
                    type="submit"
                    disabled={!couponCode.trim()}
                    className="px-6 py-3 rounded-full bg-[#EF264C] hover:bg-[#d91d40] disabled:opacity-40 text-white font-bold text-[14px] transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                  >
                    แลกรับเหรียญ
                  </button>
                </form>

                {couponFeedback && (
                  <div
                    className={`p-3.5 rounded-2xl text-[13.5px] font-medium flex items-center gap-2 animate-in fade-in ${
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
                <div className="pt-3 border-t border-white/5 flex items-center gap-2 flex-wrap">
                  <span className="text-[12px] text-app-secondary/80">💡 โค้ดทดสอบ:</span>
                  <span 
                    onClick={() => setCouponCode('SOUL2026')}
                    className="text-amber-300 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-full text-[11.5px] font-mono cursor-pointer transition-colors"
                  >
                    SOUL2026 (+300)
                  </span>
                  <span 
                    onClick={() => setCouponCode('WELCOME100')}
                    className="text-amber-300 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-full text-[11.5px] font-mono cursor-pointer transition-colors"
                  >
                    WELCOME100 (+100)
                  </span>
                  <span 
                    onClick={() => setCouponCode('SOULFREE')}
                    className="text-amber-300 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-full text-[11.5px] font-mono cursor-pointer transition-colors"
                  >
                    SOULFREE (+200)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: บัญชี & ความปลอดภัย */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[20px] font-bold text-app-primary">
                  บัญชีและความปลอดภัย
                </h3>
                <p className="text-[13px] text-app-secondary mt-1">
                  จัดการข้อมูลการเข้าสู่ระบบ สถานะการเชื่อมต่อ และความปลอดภัยของบัญชี
                </p>
              </div>

              {/* Email Section */}
              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                <span className="text-[11px] font-bold text-app-secondary uppercase tracking-wider">อีเมลที่ผูกไว้</span>
                <p className="text-[15px] font-semibold text-app-primary">
                  {userEmail || 'ยังไม่ได้ผูกอีเมล (สถานะ Guest)'}
                </p>
              </div>

              {/* Password Section */}
              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-[14.5px] font-semibold text-app-primary">รหัสผ่าน (Password)</h4>
                  <p className="text-[12.5px] text-app-secondary">เปลี่ยนรหัสผ่านเพื่อความปลอดภัยของบัญชี</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('ฟีเจอร์เปลี่ยนรหัสผ่านจะพร้อมใช้งานเมื่อเข้าสู่ระบบด้วยอีเมล')}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-[13px] font-medium text-app-primary transition-colors cursor-pointer"
                >
                  เปลี่ยนรหัสผ่าน
                </button>
              </div>

              {/* Sign Out Button */}
              <div className="pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={onSignOut}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-[14px] transition-colors cursor-pointer"
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

export default ProfileView
