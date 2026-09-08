import { useState, useRef } from 'react'
import {
  Check,
  ArrowLeft,
  LogOut,
  ChevronDown
} from 'lucide-react'
import SingleCoinIcon from '../../home/components/SingleCoinIcon'
import type { ProfileViewProps } from '../types'

export function ProfileView({
  userName = 'Alice',
  userEmail = '',
  userInitial = 'A',
  avatarUrl,
  coinBalance = 1250,
  pronouns = 'คุณ',
  aboutMe = 'ผู้ใช้พร้อมท่องโลก Maomoi AI',
  username = 'alizzlol',
  onSaveProfile,
  onRedeemCoupon,
  onSignOut,
  onBackToHome,
  onTopUpCoins,
}: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'coupon' | 'account'>('profile')

  // Form State
  const [name, setName] = useState(userName)
  const [userHandle, setUserHandle] = useState(username.replace(/^@/, ''))
  const [selectedPronoun, setSelectedPronoun] = useState(pronouns)
  const [about, setAbout] = useState(aboutMe)
  const [currentAvatar, setCurrentAvatar] = useState<string | undefined>(avatarUrl)
  const [isSaved, setIsSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Tracking props for render-time synchronization
  const [prevSyncKey, setPrevSyncKey] = useState(`${userName}_${pronouns}_${aboutMe}_${username}_${avatarUrl}`)
  const currentSyncKey = `${userName}_${pronouns}_${aboutMe}_${username}_${avatarUrl}`
  if (currentSyncKey !== prevSyncKey) {
    setPrevSyncKey(currentSyncKey)
    setName(userName)
    setUserHandle(username.replace(/^@/, ''))
    setSelectedPronoun(pronouns)
    setAbout(aboutMe)
    setCurrentAvatar(avatarUrl)
  }

  // Coupon State
  const [couponCode, setCouponCode] = useState('')
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveProfile?.({
      name: name.trim() || userName,
      username: userHandle.trim() ? `@${userHandle.trim()}` : username,
      pronouns: selectedPronoun,
      aboutMe: about.trim(),
      avatarUrl: currentAvatar,
    })
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  const handleReset = () => {
    setName(userName)
    setUserHandle(username.replace(/^@/, ''))
    setSelectedPronoun(pronouns)
    setAbout(aboutMe)
    setCurrentAvatar(avatarUrl)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setCurrentAvatar(previewUrl)
    }
  }

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponCode.trim()) return

    if (onRedeemCoupon) {
      const res = await onRedeemCoupon(couponCode.trim())
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
    <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden no-scrollbar bg-[rgb(9,9,9)] text-[#F2F2F5] overscroll-contain select-none">
      
      {/* Container หลักกึ่งกลางจอ (Pinterest Minimal 2-Column Layout) */}
      <div className="w-full max-w-[960px] mx-auto px-6 sm:px-10 py-8 sm:py-14">
        
        {/* Top Minimal Return Row */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#2F3336]/60">
          <div className="text-[13px] font-medium text-[#ACACB2]">
            การตั้งค่าบัญชี &bull; <span className="text-[#F2F2F5] font-semibold">{userName}</span>
          </div>
          
          <button
            type="button"
            onClick={onBackToHome}
            title="ย้อนกลับไปหน้าแรก"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[#F2F2F5] text-[12.5px] font-medium border border-[#2F3336] transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>ย้อนกลับหน้าแรก</span>
          </button>
        </div>

        {/* 2-Column Layout: Left Menu | Right Form Content */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-14 lg:gap-20 items-start">
          
          {/* ============================================================== */}
          {/* คอลัมน์ซ้าย: รายการแท็บสไตล์ Pinterest (Text Links with Underline) */}
          {/* ============================================================== */}
          <nav className="w-full md:w-[220px] shrink-0 flex flex-row md:flex-col gap-6 md:gap-8 overflow-x-auto no-scrollbar pb-3 md:pb-0">
            
            {/* แท็บ 1: แก้ไขโปรไฟล์ */}
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="text-left group cursor-pointer whitespace-nowrap"
            >
              <span className={`text-[16px] transition-colors block ${
                activeTab === 'profile'
                  ? 'font-bold text-[#F2F2F5]'
                  : 'font-semibold text-[#ACACB2] hover:text-[#F2F2F5]'
              }`}>
                แก้ไขโปรไฟล์
              </span>
              {activeTab === 'profile' && (
                <span className="block h-[2.5px] w-[95px] bg-[#F2F2F5] mt-1.5 rounded-full" />
              )}
            </button>

            {/* แท็บ 2: เหรียญ & คูปอง */}
            <button
              type="button"
              onClick={() => setActiveTab('coupon')}
              className="text-left group cursor-pointer whitespace-nowrap"
            >
              <span className={`text-[16px] transition-colors block ${
                activeTab === 'coupon'
                  ? 'font-bold text-[#F2F2F5]'
                  : 'font-semibold text-[#ACACB2] hover:text-[#F2F2F5]'
              }`}>
                เหรียญ & คูปอง
              </span>
              {activeTab === 'coupon' && (
                <span className="block h-[2.5px] w-[105px] bg-[#F2F2F5] mt-1.5 rounded-full" />
              )}
            </button>

            {/* แท็บ 3: บัญชีและความปลอดภัย */}
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className="text-left group cursor-pointer whitespace-nowrap"
            >
              <span className={`text-[16px] transition-colors block ${
                activeTab === 'account'
                  ? 'font-bold text-[#F2F2F5]'
                  : 'font-semibold text-[#ACACB2] hover:text-[#F2F2F5]'
              }`}>
                บัญชีและความปลอดภัย
              </span>
              {activeTab === 'account' && (
                <span className="block h-[2.5px] w-[145px] bg-[#F2F2F5] mt-1.5 rounded-full" />
              )}
            </button>

          </nav>

          {/* ============================================================== */}
          {/* คอลัมน์ขวา: ฟอร์มสไตล์ Pinterest Minimal (Stacked Rounded Boxes) */}
          {/* ============================================================== */}
          <div className="flex-1 w-full max-w-[560px]">
            
            {/* ------------------------------------------------------------ */}
            {/* TAB 1: แก้ไขโปรไฟล์ (Edit Profile)                            */}
            {/* ------------------------------------------------------------ */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSave} className="space-y-6">
                
                {/* Title & Subtitle */}
                <div>
                  <h1 className="text-[28px] sm:text-[32px] font-bold text-[#F2F2F5] tracking-tight leading-tight">
                    แก้ไขโปรไฟล์
                  </h1>
                  <p className="text-[14px] text-[#ACACB2] mt-2 leading-relaxed">
                    จัดการข้อมูลส่วนตัว คำสรรพนาม และบุคลิกเพื่อให้ AI สนทนากับคุณได้อย่างสมบูรณ์แบบ
                  </p>
                </div>

                {/* Photo Row */}
                <div className="pt-2 space-y-2">
                  <label className="block text-[12.5px] font-medium text-[#ACACB2]">
                    รูปโปรไฟล์ (Photo)
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-[64px] h-[64px] rounded-full overflow-hidden bg-[#1D1D1F] border border-[#2F3336] flex items-center justify-center shrink-0">
                      {currentAvatar ? (
                        <img src={currentAvatar} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[24px] font-bold text-[#F2F2F5]">
                          {userInitial}
                        </span>
                      )}
                    </div>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      className="hidden" 
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-full bg-[#1D1D1F] hover:bg-white/10 text-[13px] font-semibold text-[#F2F2F5] border border-[#2F3336] transition-all cursor-pointer active:scale-95"
                    >
                      เปลี่ยนรูป
                    </button>
                  </div>
                </div>

                {/* Box 1: ชื่อที่แสดง (Display Name) */}
                <div className="space-y-1.5">
                  <div className="rounded-2xl border border-[#2F3336] bg-[#1D1D1F]/50 px-4 py-2.5 focus-within:border-white/40 transition-colors">
                    <label className="block text-[11.5px] font-semibold text-[#ACACB2] leading-none mb-1">
                      ชื่อที่แสดง (Display Name)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="เช่น alizz lol"
                      className="w-full bg-transparent text-[#F2F2F5] text-[15px] font-normal outline-none p-0 border-none placeholder:text-[#ACACB2]/40"
                    />
                  </div>
                </div>

                {/* Box 2: บุคลิกประจำตัว (Player Persona & Vibe) */}
                <div className="space-y-1.5">
                  <div className="rounded-2xl border border-[#2F3336] bg-[#1D1D1F]/50 px-4 py-2.5 focus-within:border-white/40 transition-colors">
                    <label className="block text-[11.5px] font-semibold text-[#ACACB2] leading-none mb-1">
                      บุคลิกประจำตัว (PLAYER PERSONA &amp; VIBE)
                    </label>
                    <textarea
                      rows={3}
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      placeholder="เช่น ชอบบทสนทนาหยอกล้อ ไม่ทางการ มีระยะห่างที่พอดี"
                      className="w-full bg-transparent text-[#F2F2F5] text-[15px] font-normal outline-none p-0 border-none resize-none leading-relaxed placeholder:text-[#ACACB2]/40"
                    />
                  </div>
                  <p className="text-[12px] text-[#ACACB2] px-1 leading-normal">
                    ระบุสไตล์ บุคลิก หรือโทนบทสนทนาที่คุณชื่นชอบ เพื่อให้ AI ปรับจูนเข้าหาคุณ
                  </p>
                </div>

                {/* Box 3: คำสรรพนาม (Pronouns) */}
                <div className="space-y-1.5">
                  <div className="rounded-2xl border border-[#2F3336] bg-[#1D1D1F]/50 px-4 py-2.5 focus-within:border-white/40 transition-colors relative">
                    <label className="block text-[11.5px] font-semibold text-[#ACACB2] leading-none mb-1">
                      คำสรรพนาม (PRONOUNS) — สิ่งที่ตัวละคร AI จะใช้เรียกคุณ
                    </label>
                    <div className="flex items-center justify-between">
                      <select
                        value={selectedPronoun}
                        onChange={(e) => setSelectedPronoun(e.target.value)}
                        className="w-full bg-transparent text-[#F2F2F5] text-[15px] font-normal outline-none p-0 border-none appearance-none cursor-pointer [&>option]:bg-[#1D1D1F] [&>option]:text-[#F2F2F5]"
                      >
                        <option value="คุณ">คุณ (สุภาพ / มาตรฐาน)</option>
                        <option value="พี่">พี่ (อบอุ่น / สนิทสนม)</option>
                        <option value="เธอ">เธอ (เป็นกันเอง)</option>
                        <option value="นายท่าน">นายท่าน (บทบาทนาย-บ่าว)</option>
                        <option value="หนู">หนู (น่ารัก / ออดอ้อน)</option>
                      </select>
                      <ChevronDown size={18} className="text-[#ACACB2] pointer-events-none -ml-5 shrink-0" />
                    </div>
                  </div>
                  <p className="text-[12px] text-[#ACACB2] px-1 leading-normal">
                    คำสรรพนามนี้จะถูกส่งต่อไปยังโมเดล AI เพื่อให้การ Roleplay เรียกชื่อและสถานะของคุณได้อย่างแม่นยำ
                  </p>
                </div>

                {/* Box 4: ชื่อผู้ใช้ (Username) */}
                <div className="space-y-1.5">
                  <div className="rounded-2xl border border-[#2F3336] bg-[#1D1D1F]/50 px-4 py-2.5 focus-within:border-white/40 transition-colors">
                    <label className="block text-[11.5px] font-semibold text-[#ACACB2] leading-none mb-1">
                      ชื่อผู้ใช้ (Username)
                    </label>
                    <input
                      type="text"
                      value={userHandle}
                      onChange={(e) => setUserHandle(e.target.value)}
                      placeholder="alizzlol"
                      className="w-full bg-transparent text-[#F2F2F5] text-[15px] font-normal outline-none p-0 border-none placeholder:text-[#ACACB2]/40 font-mono"
                    />
                  </div>
                  <p className="text-[12px] text-[#ACACB2] px-1 font-mono">
                    www.maomoi.ai/{userHandle || 'username'}
                  </p>
                </div>

                {/* Actions Bottom Row */}
                <div className="pt-6 flex items-center justify-between">
                  {isSaved ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 text-[13px] font-medium animate-in fade-in">
                      <Check size={16} /> บันทึกการเปลี่ยนแปลงสำเร็จ!
                    </span>
                  ) : <div />}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-4 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[#F2F2F5] font-semibold text-[13.5px] transition-all cursor-pointer"
                    >
                      คืนค่าเดิม
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white font-bold text-[13.5px] transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      บันทึก
                    </button>
                  </div>
                </div>

              </form>
            )}

            {/* ------------------------------------------------------------ */}
            {/* TAB 2: เหรียญ & คูปอง (Coins & Coupons)                       */}
            {/* ------------------------------------------------------------ */}
            {activeTab === 'coupon' && (
              <div className="space-y-6">
                
                {/* Title & Subtitle */}
                <div>
                  <h1 className="text-[28px] sm:text-[32px] font-bold text-[#F2F2F5] tracking-tight leading-tight">
                    เหรียญ &amp; คูปอง
                  </h1>
                  <p className="text-[14px] text-[#ACACB2] mt-2 leading-relaxed">
                    ตรวจสอบยอดเหรียญคงเหลือและแลกรับเหรียญฟรีด้วยรหัสโปรโมชั่น
                  </p>
                </div>

                {/* Box 1: กระเป๋าเหรียญ (Coins Balance) */}
                <div className="space-y-1.5">
                  <div className="rounded-2xl border border-[#2F3336] bg-[#1D1D1F]/50 px-4 py-3.5 flex items-center justify-between">
                    <div>
                      <span className="block text-[11.5px] font-semibold text-[#ACACB2] leading-none mb-1.5">
                        กระเป๋าเหรียญ (Coin Balance)
                      </span>
                      <div className="flex items-center gap-2">
                        <SingleCoinIcon size={20} />
                        <span className="text-[22px] font-bold text-[#F2F2F5] leading-tight">
                          {coinBalance.toLocaleString()}
                        </span>
                        <span className="text-[13px] text-[#ACACB2]">เหรียญ</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onTopUpCoins}
                      className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-[13px] font-semibold text-[#F2F2F5] border border-white/10 transition-all cursor-pointer"
                    >
                      + เติมเหรียญ
                    </button>
                  </div>
                </div>

                  {/* Box 2: แลกรับโค้ดคูปอง */}
                <form onSubmit={handleRedeem} className="space-y-2">
                  <div className="rounded-2xl border border-[#2F3336] bg-[#1D1D1F]/50 px-4 py-2.5 focus-within:border-white/40 transition-colors">
                    <label className="block text-[11.5px] font-semibold text-[#ACACB2] leading-none mb-1">
                      รหัสคูปอง (Promo Code)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="เช่น MAOMOI2026 หรือ MAOMOIFREE"
                        className="w-full bg-transparent text-[#F2F2F5] text-[15px] font-mono outline-none p-0 border-none uppercase placeholder:text-[#ACACB2]/40"
                      />
                      <button
                        type="submit"
                        disabled={!couponCode.trim()}
                        className="px-4 py-1.5 rounded-full bg-[#EF264C] hover:bg-[#d91d40] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-[13px] transition-all cursor-pointer shrink-0"
                      >
                        แลกเหรียญ
                      </button>
                    </div>
                  </div>

                  {couponFeedback && (
                    <div className={`p-3 rounded-xl text-[12.5px] font-medium flex items-center gap-2 animate-in fade-in ${
                      couponFeedback.type === 'success'
                        ? 'bg-[#EF264C]/15 text-[#EF264C] border border-[#EF264C]/30'
                        : 'bg-red-500/15 text-red-400 border border-red-500/20'
                    }`}>
                      {couponFeedback.type === 'success' ? <Check size={16} className="text-[#EF264C]" /> : null}
                      <span>{couponFeedback.message}</span>
                    </div>
                  )}

                  {/* Test Promo Badges */}
                  <div className="pt-2 px-1 flex items-center gap-2 flex-wrap">
                    <span className="text-[12px] text-[#ACACB2]">💡 โค้ดทดสอบ:</span>
                    <button 
                      type="button"
                      onClick={() => setCouponCode('MAOMOI2026')}
                      className="text-amber-300 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded text-[11.5px] font-mono cursor-pointer transition-colors border border-white/5"
                    >
                      MAOMOI2026 (+500)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setCouponCode('MAOMOI')}
                      className="text-amber-300 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded text-[11.5px] font-mono cursor-pointer transition-colors border border-white/5"
                    >
                      MAOMOI (+300)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setCouponCode('MAOMOIFREE')}
                      className="text-amber-300 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded text-[11.5px] font-mono cursor-pointer transition-colors border border-white/5"
                    >
                      MAOMOIFREE (+200)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setCouponCode('MAOMOI100')}
                      className="text-amber-300 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded text-[11.5px] font-mono cursor-pointer transition-colors border border-white/5"
                    >
                      MAOMOI100 (+100)
                    </button>
                  </div>
                </form>

              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* TAB 3: บัญชีและความปลอดภัย (Account Management)              */}
            {/* ------------------------------------------------------------ */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                
                {/* Title & Subtitle */}
                <div>
                  <h1 className="text-[28px] sm:text-[32px] font-bold text-[#F2F2F5] tracking-tight leading-tight">
                    บัญชีและความปลอดภัย
                  </h1>
                  <p className="text-[14px] text-[#ACACB2] mt-2 leading-relaxed">
                    จัดการข้อมูลการเข้าสู่ระบบ อีเมล และความปลอดภัยของบัญชี Maomoi AI
                  </p>
                </div>

                {/* Box 1: อีเมลที่ผูกไว้ */}
                <div className="space-y-1.5">
                  <div className="rounded-2xl border border-[#2F3336] bg-[#1D1D1F]/50 px-4 py-2.5">
                    <span className="block text-[11.5px] font-semibold text-[#ACACB2] leading-none mb-1">
                      อีเมลที่ผูกไว้ (Email)
                    </span>
                    <p className="text-[15px] font-mono text-[#F2F2F5]">
                      {userEmail || 'ยังไม่ได้ผูกอีเมล (สถานะ Guest)'}
                    </p>
                  </div>
                  <p className="text-[12px] text-[#ACACB2] px-1">
                    อีเมลหลักสำหรับยืนยันตัวตนและการแจ้งเตือนในระบบ Maomoi AI
                  </p>
                </div>

                {/* Box 2: รหัสผ่าน */}
                <div className="space-y-1.5">
                  <div className="rounded-2xl border border-[#2F3336] bg-[#1D1D1F]/50 px-4 py-2.5 flex items-center justify-between">
                    <div>
                      <span className="block text-[11.5px] font-semibold text-[#ACACB2] leading-none mb-1">
                        รหัสผ่าน (Password)
                      </span>
                      <p className="text-[14px] font-mono text-[#F2F2F5]">
                        ••••••••••••
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert('ฟีเจอร์เปลี่ยนรหัสผ่านจะพร้อมใช้งานเมื่อเข้าสู่ระบบด้วยอีเมล')}
                      className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-[12.5px] font-semibold text-[#F2F2F5] transition-colors cursor-pointer"
                    >
                      เปลี่ยนรหัสผ่าน
                    </button>
                  </div>
                </div>

                {/* 3. ปุ่มออกจากระบบ (แบบเดิม: แคปซูลมนสีแดงเด่นชัด) */}
                <div className="pt-6 border-t border-[#2F3336]/60">
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-[13.5px] border border-red-500/20 transition-all cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>ออกจากระบบ</span>
                  </button>
                  <p className="text-[12px] text-[#ACACB2] mt-2 px-1">
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
