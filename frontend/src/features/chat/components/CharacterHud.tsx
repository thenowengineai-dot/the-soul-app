import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  PanelRightClose, 
  MoreVertical,
  Check,
  BadgeCheck, 
  Heart, 
  Flame, 
  MapPin, 
  Clock, 
  CloudRain, 
  Shirt, 
  Smile,
  User,
  Sparkles,
  Lock,
} from 'lucide-react'
import type { CharacterHudProps } from '../types'

type HudWidth = 'normal' | 'wide' | 'extra'

function getIntuitionQuote(value: number, type: 'relationship' | 'desire'): string {
  if (type === 'relationship') {
    if (value < 35) return 'ระยะห่างยังดูระมัดระวัง...'
    if (value < 55) return 'เริ่มมีรอยยิ้มบางๆ เมื่อคุยกัน...'
    if (value < 75) return 'สัมผัสได้ถึงสายตาที่มองมาบ่อยขึ้น...'
    if (value < 90) return 'ความเงียบที่ไม่อึดอัดอีกต่อไป...'
    return 'ระยะห่างระหว่างเราเริ่มบางลงเรื่อยๆ...'
  } else {
    if (value < 35) return 'ความสงบนิ่งที่ซ่อนความรู้สึกลึกๆ...'
    if (value < 55) return 'แววตามีประกายวูบไหวเป็นบางจังหวะ...'
    if (value < 75) return 'ลมหายใจเริ่มเปลี่ยนจังหวะเมื่อเข้าใกล้...'
    if (value < 90) return 'พวงแก้มขึ้นสีจางๆ ยามเผลอสบตา...'
    return 'หัวใจเต้นแรงจนแทบควบคุมไม่อยู่...'
  }
}

function CharacterHud({ data, isOpen, onClose }: CharacterHudProps) {
  const [hudWidth, setHudWidth] = useState<HudWidth>(() => {
    const saved = localStorage.getItem('solccai_hud_width')
    if (saved === 'normal' || saved === 'wide' || saved === 'extra') {
      return saved
    }
    return 'wide'
  })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Apple Total Mystery State for Relationship (Redacted Fog of War)
  const [revealedGauge, setRevealedGauge] = useState<'relationship' | 'desire' | null>(null)
  const [milestoneToast, setMilestoneToast] = useState<{
    type: 'relationship' | 'desire'
    title: string
    status: string
    value: number
  } | null>(null)
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Idea 1: Live Flash & Decay State for Desire (The Flickering Flame)
  const [desireLevel, setDesireLevel] = useState<number>(() => data?.desire.current ?? 68)
  const [isFlashing, setIsFlashing] = useState<boolean>(false)
  const [isDecaying, setIsDecaying] = useState<boolean>(false)
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const decayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevDesireRef = useRef(data?.desire.current)

  const currentDesire = data?.desire.current

  // Trigger Flash & Decay Effect
  const triggerDesireFlash = useCallback((bonus = 15) => {
    if (currentDesire === undefined) return
    const base = currentDesire
    const surged = Math.min(100, base + bonus)

    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current)
    if (decayTimeoutRef.current) clearTimeout(decayTimeoutRef.current)

    setIsFlashing(true)
    setIsDecaying(false)
    setDesireLevel(surged)

    setMilestoneToast({
      type: 'desire',
      title: '⚡ เปลวไฟปะทุ: ความปรารถนาลุกโชน!',
      status: 'บรรยากาศและบทสนทนาจุดประกายความรู้สึก',
      value: surged,
    })

    // Hold peak flash for 2.2 seconds, then smoothly cool down / decay back to baseline
    flashTimeoutRef.current = setTimeout(() => {
      setIsFlashing(false)
      setIsDecaying(true)
      setDesireLevel(base)

      decayTimeoutRef.current = setTimeout(() => {
        setIsDecaying(false)
      }, 1500)
    }, 2200)

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => {
      setMilestoneToast(null)
    }, 4000)
  }, [currentDesire])

  // Sync with prop updates: trigger flash if desire increases
  useEffect(() => {
    if (currentDesire === undefined) return
    if (prevDesireRef.current !== undefined && currentDesire > prevDesireRef.current) {
      triggerDesireFlash(currentDesire - prevDesireRef.current)
    } else if (prevDesireRef.current !== currentDesire) {
      setDesireLevel(currentDesire)
    }
    prevDesireRef.current = currentDesire
  }, [currentDesire, triggerDesireFlash])

  const handleTriggerMilestone = (type: 'relationship' | 'desire') => {
    if (!data) return
    setRevealedGauge(type)
    const isRel = type === 'relationship'
    const status = isRel 
      ? (data.relationship.status || 'หวั่นไหวและเริ่มเปิดใจ') 
      : (data.desire.status || 'ใจเต้นแรงเมื่อสบตา')
    const value = isRel ? data.relationship.current : data.desire.current

    setMilestoneToast({
      type,
      title: isRel ? 'ความรู้สึกเปิดเผย: ความสัมพันธ์' : 'ความรู้สึกเปิดเผย: ความปรารถนา',
      status,
      value,
    })

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }

    toastTimeoutRef.current = setTimeout(() => {
      setRevealedGauge(null)
      setMilestoneToast(null)
    }, 4000)
  }

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current)
      if (decayTimeoutRef.current) clearTimeout(decayTimeoutRef.current)
    }
  }, [])



  const handleSelectWidth = (width: HudWidth) => {
    setHudWidth(width)
    localStorage.setItem('solccai_hud_width', width)
    setIsMenuOpen(false)
  }

  useEffect(() => {
    if (!isMenuOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  if (!isOpen || !data) return null;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div 
        onClick={onClose}
        className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
      />

      <aside 
        className={`h-full flex-shrink-0 flex flex-col bg-[#18181A]/90 backdrop-blur-2xl select-none overflow-hidden transition-all duration-300 fixed inset-y-0 right-0 z-50 shadow-2xl lg:relative lg:z-10 lg:shadow-none max-w-[92vw] ${
          hudWidth === 'extra' ? 'w-[360px]' : hudWidth === 'wide' ? 'w-[320px]' : 'w-[280px]'
        }`}
      >
        {/* Scrollable HUD Content Body */}
        <div 
          style={{ overscrollBehavior: 'none' }}
          className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-3.5 space-y-3.5 sm:space-y-4 custom-scrollbar overscroll-none touch-pan-y"
        >
          
          {/* Zone 1: Visual State (ภาพตัวละครสัดส่วน 2:3 สไตล์การ์ดหน้าแรก ชัดเจน ไร้กล่องบดบัง พร้อมสถานะ LIVE) */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#121214] shadow-xl group aspect-[2/3] w-full shrink-0 select-none">
            {/* Top Floating Controls on Image: สถานะสด (ซ้ายบน) + จุดไข่ปลา & ปุ่มปิดแถบ (ขวาบน) */}
            <div className="absolute top-2.5 inset-x-2.5 z-20 flex items-center justify-between pointer-events-none select-none">
              {/* Left: LIVE Status Pill (Subtle White Frosted Glass) */}
              <div className="flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-white/[0.07] hover:bg-white/[0.14] backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_8px_rgba(0,0,0,0.12)] pointer-events-auto transition-all">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[11px] font-bold tracking-wider text-white/90">
                  LIVE
                </span>
              </div>

              {/* Right: จุดไข่ปลา (3-dots) + ปุ่มปิดแถบ (PanelRightClose) (Subtle White Frosted Glass) */}
              <div className="flex items-center gap-1.5 pointer-events-auto relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(prev => !prev)}
                  title="ตั้งค่าขนาดแถบสถานะ"
                  className={`w-7 h-7 rounded-full backdrop-blur-2xl border transition-all cursor-pointer active:scale-95 flex items-center justify-center select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_8px_rgba(0,0,0,0.12)] ${
                    isMenuOpen 
                      ? 'bg-white/25 border-white/35 text-white' 
                      : 'bg-white/[0.07] hover:bg-white/[0.14] border-white/[0.12] hover:border-white/20 text-white/85 hover:text-white'
                  }`}
                >
                  <MoreVertical size={15} strokeWidth={1.8} />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  title="ซ่อนแถบสถานะตัวละคร"
                  className="w-7 h-7 rounded-full bg-white/[0.07] hover:bg-white/[0.14] backdrop-blur-2xl border border-white/[0.12] hover:border-white/20 text-white/85 hover:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_8px_rgba(0,0,0,0.12)] flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none"
                >
                  <PanelRightClose size={15} strokeWidth={1.8} />
                </button>

                {/* Dropdown Menu (Glassmorphism Luxury) */}
                {isMenuOpen && (
                  <div 
                    className="absolute top-full right-0 mt-1.5 w-[220px] p-1.5 rounded-2xl bg-[#18181B]/95 backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_12px_32px_rgba(0,0,0,0.6)] z-50 animate-in fade-in zoom-in-95 duration-150 select-none"
                  >
                    <div className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-app-secondary font-semibold border-b border-white/[0.06] mb-1">
                      ขนาดแถบสถานะ (HUD)
                    </div>

                    {/* Option: Extra (จุใจ - 360px) */}
                    <button
                      type="button"
                      onClick={() => handleSelectWidth('extra')}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[12.5px] transition-all cursor-pointer ${
                        hudWidth === 'extra'
                          ? 'bg-white/[0.08] text-app-primary font-medium'
                          : 'text-app-secondary hover:text-app-primary hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex flex-col text-left">
                        <span className="leading-tight">จุใจ</span>
                        <span className="text-[10px] text-app-secondary/80">ภาพใหญ่สะใจ ชัดเต็มอิ่ม (360px)</span>
                      </div>
                      {hudWidth === 'extra' && (
                        <Check size={14} className="text-[#EF264C] flex-shrink-0" strokeWidth={2.5} />
                      )}
                    </button>

                    {/* Option: Wide (เต็มตา - 320px) */}
                    <button
                      type="button"
                      onClick={() => handleSelectWidth('wide')}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[12.5px] transition-all cursor-pointer ${
                        hudWidth === 'wide'
                          ? 'bg-white/[0.08] text-app-primary font-medium'
                          : 'text-app-secondary hover:text-app-primary hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex flex-col text-left">
                        <span className="leading-tight">เต็มตา</span>
                        <span className="text-[10px] text-app-secondary/80">รูปตัวละครเด่นชัด สมดุล (320px)</span>
                      </div>
                      {hudWidth === 'wide' && (
                        <Check size={14} className="text-[#EF264C] flex-shrink-0" strokeWidth={2.5} />
                      )}
                    </button>

                    {/* Option: Normal (กะทัดรัด - 280px) */}
                    <button
                      type="button"
                      onClick={() => handleSelectWidth('normal')}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[12.5px] transition-all cursor-pointer ${
                        hudWidth === 'normal'
                          ? 'bg-white/[0.08] text-app-primary font-medium'
                          : 'text-app-secondary hover:text-app-primary hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex flex-col text-left">
                        <span className="leading-tight">กะทัดรัด</span>
                        <span className="text-[10px] text-app-secondary/80">เพิ่มพื้นที่ให้ห้องแชท (280px)</span>
                      </div>
                      {hudWidth === 'normal' && (
                        <Check size={14} className="text-[#EF264C] flex-shrink-0" strokeWidth={2.5} />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Character Portrait (สว่าง คมชัด ไร้สิ่งบดบัง) */}
            <img 
              src={data.image || data.avatar} 
              alt={data.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" 
            />
            
            {/* Top Vignette for controls readability */}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none" />

            {/* Bottom Character Name Overlay (เรียบหรู คมชัด บนตัวการ์ด) */}
            <div className="absolute bottom-0 inset-x-0 p-3 pt-10 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none flex items-center gap-1.5">
              <h3 className="text-[16px] sm:text-[17px] font-bold text-app-primary tracking-tight">
                {data.name}
              </h3>
              <BadgeCheck size={16} className="text-[#EF264C] fill-current text-black flex-shrink-0" />
            </div>
          </div>

          {/* Zone 2: Environment & World State (Apple Subtle White Frosted Glass) */}
          <div className="relative overflow-hidden p-2.5 sm:p-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/[0.10] hover:border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] space-y-2 select-none transition-all duration-200">
            {/* สถานที่ปัจจุบัน */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0">
                <MapPin size={13} className="text-[#EF264C]" />
              </div>
              <p className="text-[12.5px] text-[#E1E1E6] font-medium truncate">
                {data.environment.location}
              </p>
            </div>

            {/* เวลาและสภาพอากาศ */}
            <div className="flex items-center gap-3 text-[11px] text-[#8E8E93] pt-1.5 border-t border-white/[0.05]">
              <div className="flex items-center gap-1.5 truncate">
                <Clock size={12} className="text-sky-400 shrink-0" />
                <span className="truncate text-white/65">{data.environment.time}</span>
              </div>
              <span className="text-white/20">•</span>
              <div className="flex items-center gap-1.5 truncate">
                <CloudRain size={12} className="text-indigo-400 shrink-0" />
                <span className="truncate text-white/65">{data.environment.weather}</span>
              </div>
            </div>
          </div>

          {/* Zone 3: Live Badges: Outfit & Poses (Apple Subtle White Frosted Glass) */}
          <div className="space-y-1.5 select-none">
            {/* 1. ชุดปัจจุบัน (Current Outfit) */}
            <div className="relative overflow-hidden flex items-start gap-2.5 p-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/[0.10] hover:border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-200">
              <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0 mt-0.5">
                <Shirt size={13} className="text-[#EF264C]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] uppercase tracking-wider text-white/40 font-semibold leading-none mb-1">
                  ชุดปัจจุบัน
                </span>
                <p className="text-[12px] sm:text-[12.5px] text-[#D1D1D6] font-normal leading-snug line-clamp-2">
                  {data.outfit}
                </p>
              </div>
            </div>

            {/* 2. ท่าทางตัวละคร (Character Pose) */}
            <div className="relative overflow-hidden flex items-start gap-2.5 p-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/[0.10] hover:border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-200">
              <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0 mt-0.5">
                <Smile size={13} className="text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] uppercase tracking-wider text-white/40 font-semibold leading-none mb-1">
                  ท่าทางตัวละคร
                </span>
                <p className="text-[12px] sm:text-[12.5px] text-[#D1D1D6] font-normal leading-snug line-clamp-2">
                  {data.pose}
                </p>
              </div>
            </div>

            {/* 3. ท่าทางผู้เล่น (Player Pose) */}
            <div className="relative overflow-hidden flex items-start gap-2.5 p-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/[0.10] hover:border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-200">
              <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0 mt-0.5">
                <User size={13} className="text-sky-400" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] uppercase tracking-wider text-white/40 font-semibold leading-none mb-1">
                  ท่าทางผู้เล่น
                </span>
                <p className="text-[12px] sm:text-[12.5px] text-[#D1D1D6] font-normal leading-snug line-clamp-2">
                  {data.playerPose || 'ยืนสบตานิ่งๆ รอคำตอบ'}
                </p>
              </div>
            </div>
          </div>

          {/* Zone 4: Emotional & Roleplay Gauges (Apple Subtle White Frosted Glass) */}
          <div className="space-y-1.5 pt-0.5 select-none">
            {/* Apple Milestone Breakthrough Toast */}
            {milestoneToast && (
              <div className="p-2.5 px-3 rounded-2xl bg-white/[0.08] backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_12px_24px_rgba(0,0,0,0.5)] flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300 select-none">
                <Sparkles size={13} className={`flex-shrink-0 animate-pulse ${milestoneToast.type === 'relationship' ? 'text-pink-400' : 'text-[#EF264C]'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-app-secondary">
                      {milestoneToast.title}
                    </span>
                    {milestoneToast.type === 'relationship' ? (
                      <span className="font-mono text-[11px] font-bold text-app-primary">
                        {milestoneToast.value}%
                      </span>
                    ) : (
                      <span className="text-[10.5px] font-bold text-[#FF3366] tracking-wide flex items-center gap-1">
                        <Flame size={11} className="fill-current" /> จุดประกาย
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-app-primary font-medium truncate">
                    "{milestoneToast.status}"
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {/* ความสัมพันธ์ Widget */}
              <div 
                onClick={() => handleTriggerMilestone('relationship')}
                title="คลิกเพื่อสดับฟังความรู้สึก (แง้มดูความคืบหน้าเมื่อบรรลุเป้าหมาย)"
                className="relative overflow-hidden p-2.5 sm:p-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/[0.10] hover:border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] space-y-1.5 flex flex-col justify-between group cursor-pointer transition-all duration-200 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="text-[#D1D1D6] font-medium truncate">ความสัมพันธ์</span>
                  
                  {/* Mystery Value: หมอกเบลอสไตล์ Apple Privacy */}
                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    {revealedGauge === 'relationship' ? (
                      <span className="font-mono text-pink-400 font-bold text-[11px] animate-in fade-in duration-300">
                        {data.relationship.current}%
                      </span>
                    ) : (
                      <div className="flex items-center gap-0.5 select-none" title="ความรู้สึกกำลังก่อตัว (ซ่อนตัวเลข)">
                        <span className="font-mono text-pink-400/80 font-bold text-[11px] filter blur-[3.5px] select-none">
                          {data.relationship.current}%
                        </span>
                        <Lock size={9} className="text-pink-400/60 shrink-0" />
                      </div>
                    )}
                  </div>
                </div>

                {/* ไอคอนอยู่หน้าหลอด */}
                <div className="flex items-center gap-1.5">
                  <Heart size={12} className="text-pink-400 fill-pink-400/30 shrink-0" />
                  <div className="flex-1 h-[5px] rounded-full bg-white/[0.06] overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r from-pink-500 to-[#EF264C] transition-all duration-700 ${
                        revealedGauge === 'relationship'
                          ? 'filter-none shadow-sm'
                          : 'filter blur-[2.5px] opacity-85 scale-y-125'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, data.relationship.current))}%` }}
                    />
                  </div>
                </div>

                {/* Gut Feeling / Intuition Quote */}
                <p className="text-[10px] text-white/50 truncate leading-tight italic">
                  {revealedGauge === 'relationship' 
                    ? (data.relationship.status || 'หวั่นไหวและเริ่มเปิดใจ')
                    : `"${getIntuitionQuote(data.relationship.current, 'relationship')}"`}
                </p>
              </div>

              {/* ความปรารถนา Widget (Idea 1: The Live Flash & Decay) */}
              <div 
                onClick={() => triggerDesireFlash(15)}
                title="คลิกเพื่อจุดประกายไฟ (ทดสอบจังหวะสว่างวาบและมอดลงตามเวลา)"
                className={`relative overflow-hidden p-2.5 sm:p-3 rounded-2xl space-y-1.5 flex flex-col justify-between group cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                  isFlashing 
                    ? 'bg-gradient-to-b from-[#EF264C]/25 via-[#EF264C]/15 to-white/[0.06] backdrop-blur-2xl border border-[#EF264C]/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_15px_rgba(239,38,76,0.25)]' 
                    : 'bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/[0.10] hover:border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                }`}
              >
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="text-[#D1D1D6] font-medium truncate">ความปรารถนา</span>

                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    {/* Live Spark on Flash */}
                    {isFlashing && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF3366] animate-ping shrink-0" />
                    )}
                  </div>
                </div>

                {/* ไอคอนอยู่หน้าหลอด */}
                <div className="flex items-center gap-1.5">
                  <Flame 
                    size={12} 
                    className={`shrink-0 transition-all duration-300 ${
                      isFlashing 
                        ? 'text-[#FF3366] fill-[#FF3366] scale-125 animate-pulse' 
                        : 'text-[#EF264C] fill-[#EF264C]/30'
                    }`} 
                  />
                  <div className="flex-1 h-[5px] rounded-full bg-white/[0.06] overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        isFlashing 
                          ? 'bg-gradient-to-r from-[#EF264C] via-[#FF3366] to-[#FFA8BA] duration-300 shadow-sm' 
                          : isDecaying
                            ? 'bg-gradient-to-r from-[#8E0D29] via-[#D22147] to-[#EF264C] duration-1000 ease-out'
                            : 'bg-gradient-to-r from-[#8E0D29] via-[#D22147] to-[#EF264C] duration-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, desireLevel))}%` }}
                    />
                  </div>
                </div>

                {/* Intuition Quote */}
                <p className="text-[10px] text-white/50 truncate leading-tight italic">
                  "{getIntuitionQuote(desireLevel, 'desire')}"
                </p>
              </div>
            </div>
          </div>

      </div>
    </aside>
    </>
  )
}

export default CharacterHud
