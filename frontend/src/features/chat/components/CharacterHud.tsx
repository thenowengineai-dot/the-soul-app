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
        className={`h-full flex-shrink-0 flex flex-col bg-[#121214] border-l border-white/[0.06] select-none overflow-hidden transition-all duration-300 fixed inset-y-0 right-0 z-50 shadow-2xl lg:relative lg:z-10 lg:shadow-none max-w-[92vw] ${
          hudWidth === 'extra' ? 'w-[360px]' : hudWidth === 'wide' ? 'w-[320px]' : 'w-[280px]'
        }`}
      >
        {/* Scrollable HUD Content Body */}
        <div 
          style={{ overscrollBehavior: 'none' }}
          className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-3.5 space-y-3.5 sm:space-y-4 custom-scrollbar overscroll-none touch-pan-y"
        >
          
          {/* Zone 1: Visual State (ภาพตัวละครสัดส่วน 9:16 พร้อมสถานะสด ซ้ายบน, จุดไข่ปลา และ ปุ่มปิดแท็บ ขวาบน ลอยอยู่บนภาพ) */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#121214] shadow-xl group aspect-[9/16] w-full shrink-0">
            {/* Top Floating Controls on Image: สถานะสด (ซ้ายบน) + จุดไข่ปลา & ปุ่มปิดแถบ (ขวาบน) */}
            <div className="absolute top-2.5 inset-x-2.5 z-20 flex items-center justify-between pointer-events-none select-none">
              {/* Left: LIVE Status Pill (h-7 สมดุลกับปุ่มวงกลม 28px ฝั่งขวา) */}
              <div className="flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-[#121214]/80 backdrop-blur-xl border border-white/10 shadow-lg pointer-events-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[11px] font-bold tracking-wider text-app-primary">
                  LIVE
                </span>
              </div>

              {/* Right: จุดไข่ปลา (3-dots) + ปุ่มปิดแถบ (PanelRightClose) */}
              <div className="flex items-center gap-1.5 pointer-events-auto relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(prev => !prev)}
                  title="ตั้งค่าขนาดแถบสถานะ"
                  className={`w-7 h-7 rounded-full backdrop-blur-xl border transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center select-none ${
                    isMenuOpen 
                      ? 'bg-white/15 border-white/30 text-app-primary' 
                      : 'bg-[#121214]/80 border-white/10 hover:border-white/20 text-app-primary'
                  }`}
                >
                  <MoreVertical size={15} strokeWidth={1.8} />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  title="ซ่อนแถบสถานะตัวละคร"
                  className="w-7 h-7 rounded-full bg-[#121214]/80 backdrop-blur-xl border border-white/10 hover:border-white/20 text-app-primary flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 select-none"
                >
                  <PanelRightClose size={15} strokeWidth={1.8} />
                </button>

                {/* Dropdown Menu (Glassmorphism Luxury) */}
                {isMenuOpen && (
                  <div 
                    className="absolute top-full right-0 mt-1.5 w-[220px] p-1.5 rounded-2xl bg-[#121214]/95 backdrop-blur-2xl border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 select-none"
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

            {/* Character Portrait (แสดงผลสว่าง คมชัด สัดส่วน 9:16 แนวตั้ง) */}
            <img 
              src={data.image || data.avatar} 
              alt={data.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" 
            />
            
            {/* Soft Vignettes for top controls & bottom text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 from-0% via-transparent via-25% pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 from-5% via-black/35 via-35% to-transparent pointer-events-none" />

            {/* Live Badges: Outfit & Poses (แยกกล่องอิสระ ชัดเจนในแต่ละอย่าง สไตล์เดียวกัน 100%) */}
            <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3 space-y-1.5 sm:space-y-2 z-10 select-none">
              {/* 1. ชุดปัจจุบัน (Current Outfit) */}
              <div className="flex items-start gap-2 p-2 sm:p-2.5 rounded-xl bg-[#121214]/80 backdrop-blur-xl border border-white/10 shadow-xl">
                <Shirt size={14} className="text-[#EF264C] flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] uppercase tracking-wider text-app-secondary font-semibold mb-0.5">
                    ชุดปัจจุบัน
                  </span>
                  <p className="text-[12px] text-app-primary font-normal leading-snug line-clamp-2">
                    {data.outfit}
                  </p>
                </div>
              </div>

              {/* 2. ท่าทางตัวละคร (Character Pose) */}
              <div className="flex items-start gap-2 p-2 sm:p-2.5 rounded-xl bg-[#121214]/80 backdrop-blur-xl border border-white/10 shadow-xl">
                <Smile size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] uppercase tracking-wider text-app-secondary font-semibold mb-0.5">
                    ท่าทางตัวละคร
                  </span>
                  <p className="text-[12px] text-app-primary font-normal leading-snug line-clamp-2">
                    {data.pose}
                  </p>
                </div>
              </div>

              {/* 3. ท่าทางผู้เล่น (Player Pose) */}
              <div className="flex items-start gap-2 p-2 sm:p-2.5 rounded-xl bg-[#121214]/80 backdrop-blur-xl border border-white/10 shadow-xl">
                <User size={14} className="text-sky-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] uppercase tracking-wider text-app-secondary font-semibold mb-0.5">
                    ท่าทางผู้เล่น
                  </span>
                  <p className="text-[12px] text-app-primary font-normal leading-snug line-clamp-2">
                    {data.playerPose || 'ยืนสบตานิ่งๆ รอคำตอบ'}
                  </p>
                </div>
              </div>
            </div>
          </div>

        {/* 3. Zone 2: Identity & Meta (ชื่อ, เพศ, อายุ, บทบาท) */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[17px] sm:text-[18px] font-bold text-app-primary tracking-tight">
              {data.name}
            </h3>
            <BadgeCheck size={16} className="text-[#EF264C] fill-current text-black flex-shrink-0" />
          </div>

          {/* Meta Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] text-app-secondary">
              เพศ: {data.gender}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] text-app-secondary">
              อายุ: {data.age}
            </span>
            {data.role && (
              <span className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] text-app-secondary">
                {data.role}
              </span>
            )}
          </div>
        </div>

        {/* 4. Zone 3: Emotional & Roleplay Gauges (Apple Modular 2-Column Widgets - Total Mystery Edition) */}
        <div className="space-y-1.5 pt-0.5">
          {/* Apple Milestone Breakthrough Toast (แสดงชั่วคราวเมื่อปลดล็อกหรือแง้มดูความรู้สึก) */}
          {milestoneToast && (
            <div className="p-2 px-2.5 rounded-xl bg-[#1D1D1F]/95 backdrop-blur-2xl border border-white/20 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300 select-none">
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
              className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-1.5 flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:bg-white/[0.07] hover:border-white/15 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center justify-between text-[11.5px]">
                <div className="flex items-center gap-1 text-app-primary font-medium truncate">
                  <Heart size={13} className="text-pink-400 fill-pink-400/30 shrink-0" />
                  <span className="truncate">ความสัมพันธ์</span>
                </div>
                
                {/* Mystery Value: หมอกเบลอสไตล์ Apple Privacy */}
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  {revealedGauge === 'relationship' ? (
                    <span className="font-mono text-pink-400 font-bold text-[11px] animate-in fade-in duration-300">
                      {data.relationship.current}%
                    </span>
                  ) : (
                    <div className="flex items-center gap-0.5 select-none" title="ความรู้สึกกำลังก่อตัว (ซ่อนตัวเลข)">
                      <span className="font-mono text-pink-400/60 font-bold text-[11px] filter blur-[3.5px] select-none">
                        {data.relationship.current}%
                      </span>
                      <Lock size={9} className="text-pink-400/50 shrink-0" />
                    </div>
                  )}
                </div>
              </div>

              {/* Fog of War Gauge Bar: หลอดสีชมพูเรื่อฟุ้งสไตล์กระจกฝ้า Apple */}
              <div className="w-full h-[5px] rounded-full bg-white/10 overflow-hidden relative">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r from-pink-500 to-[#EF264C] transition-all duration-700 ${
                    revealedGauge === 'relationship'
                      ? 'filter-none shadow-sm'
                      : 'filter blur-[2.5px] opacity-85 scale-y-125'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, data.relationship.current))}%` }}
                />
              </div>

              {/* Gut Feeling / Intuition Quote: ข้อความบอกใบ้ความรู้สึกแทนตัวเลข */}
              <p className="text-[10px] text-app-secondary truncate leading-tight italic">
                {revealedGauge === 'relationship' 
                  ? (data.relationship.status || 'หวั่นไหวและเริ่มเปิดใจ')
                  : `"${getIntuitionQuote(data.relationship.current, 'relationship')}"`}
              </p>
            </div>

            {/* ความปรารถนา Widget (Idea 1: The Live Flash & Decay) */}
            <div 
              onClick={() => triggerDesireFlash(15)}
              title="คลิกเพื่อจุดประกายไฟ (ทดสอบจังหวะสว่างวาบและมอดลงตามเวลา)"
              className={`p-2.5 rounded-xl space-y-1.5 flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all active:scale-[0.98] ${
                isFlashing 
                  ? 'bg-[#EF264C]/10 border border-[#EF264C]/40 shadow-[0_0_15px_rgba(239,38,76,0.2)]' 
                  : 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between text-[11.5px]">
                <div className="flex items-center gap-1.5 text-app-primary font-medium truncate">
                  <Flame 
                    size={13} 
                    className={`shrink-0 transition-all duration-300 ${
                      isFlashing 
                        ? 'text-[#FF3366] fill-[#FF3366] scale-125 animate-pulse' 
                        : 'text-[#EF264C] fill-[#EF264C]/30'
                    }`} 
                  />
                  <span className="truncate">ความปรารถนา</span>
                </div>

                {/* Live Spark on Flash (เฉพาะประกายไฟวูบวาบ ไร้ข้อความสถานะ) */}
                {isFlashing && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF3366] animate-ping shrink-0" />
                )}
              </div>

              {/* Live Thermal Bar: คมชัด ไร้เบลอ สว่างวาบและมอดลง */}
              <div className="w-full h-[5px] rounded-full bg-white/10 overflow-hidden relative">
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

              {/* Intuition Quote: ข้อความบอกใบ้ความรู้สึก */}
              <p className="text-[10px] text-app-secondary truncate leading-tight italic">
                "{getIntuitionQuote(desireLevel, 'desire')}"
              </p>
            </div>
          </div>
        </div>

        {/* 5. Zone 4: Environment & World State (Apple Lockscreen Compact Widget) */}
        <div className="p-2.5 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-1.5">
          {/* สถานที่ปัจจุบัน */}
          <div className="flex items-center gap-2">
            <MapPin size={13} className="text-[#EF264C] shrink-0" />
            <p className="text-[12px] text-app-primary font-medium truncate">
              {data.environment.location}
            </p>
          </div>

          {/* เวลาและสภาพอากาศ */}
          <div className="flex items-center gap-2 text-[11px] text-app-secondary pt-1 border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5 truncate">
              <Clock size={12} className="text-sky-400 shrink-0" />
              <span className="truncate">{data.environment.time}</span>
            </div>
            <span className="text-white/20">•</span>
            <div className="flex items-center gap-1.5 truncate">
              <CloudRain size={12} className="text-indigo-400 shrink-0" />
              <span className="truncate">{data.environment.weather}</span>
            </div>
          </div>
        </div>

      </div>
    </aside>
    </>
  )
}

export default CharacterHud
