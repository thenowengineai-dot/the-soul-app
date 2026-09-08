import { useState, useEffect, useRef } from 'react'
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
  Terminal,
} from 'lucide-react'
import type { CharacterHudProps } from '../types'

type HudWidth = 'normal' | 'wide'

function CharacterHud({ data, isOpen, onClose, onOpenInspector }: CharacterHudProps) {
  const [hudWidth, setHudWidth] = useState<HudWidth>(() => {
    const saved = localStorage.getItem('solccai_hud_width')
    return saved === 'normal' ? 'normal' : 'wide'
  })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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
        className={`h-full flex-shrink-0 flex flex-col bg-[#090909] border-l border-[#2F3336] select-none overflow-hidden transition-all duration-300 fixed inset-y-0 right-0 z-50 shadow-2xl lg:relative lg:z-10 lg:shadow-none ${
          hudWidth === 'wide' ? 'w-[320px]' : 'w-[280px]'
        }`}
      >
        {/* 1. Header Bar: Ultra-Slim Height (36px/38px) with LIVE indicator, 3-dots Menu & PanelRightClose Button */}
        <div className="h-[36px] sm:h-[38px] px-3.5 sm:px-4 flex items-center justify-between border-b border-[#2F3336]/60 flex-shrink-0 relative z-20">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[12px] font-semibold tracking-wide text-app-primary">
              สถานะสด
            </span>
          </div>

          <div className="flex items-center gap-1.5 relative" ref={menuRef}>
            {/* Dev Inspector Shortcut Button */}
            {onOpenInspector && (
              <button
                type="button"
                onClick={onOpenInspector}
                title="สลับไปหน้าต่างตรวจสอบเควสต์ & บีท (Dev Inspector)"
                className="w-7 h-7 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 select-none"
              >
                <Terminal size={13} strokeWidth={2} />
              </button>
            )}

            {/* 3-Dots Settings Button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(prev => !prev)}
              title="ตั้งค่าขนาดแถบสถานะ"
              className={`w-7 h-7 rounded-full backdrop-blur-xl border transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center select-none ${
                isMenuOpen 
                  ? 'bg-white/15 border-white/30 text-app-primary' 
                  : 'bg-[#121212]/65 border-white/[0.07] hover:border-white/20 hover:bg-white/10 text-app-secondary hover:text-app-primary'
              }`}
            >
              <MoreVertical size={15} strokeWidth={1.8} />
            </button>

            {/* Panel Close Button */}
            <button
              type="button"
              onClick={onClose}
              title="ซ่อนแถบสถานะตัวละคร"
              className="w-7 h-7 rounded-full bg-[#121212]/65 backdrop-blur-xl border border-white/[0.07] hover:border-white/20 hover:bg-white/10 text-app-secondary hover:text-app-primary flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 select-none"
            >
              <PanelRightClose size={15} strokeWidth={1.8} />
            </button>

            {/* Dropdown Menu (Glassmorphism Luxury) */}
            {isMenuOpen && (
              <div 
                className="absolute top-full right-0 mt-1.5 w-[210px] p-1.5 rounded-2xl bg-[#121214]/95 backdrop-blur-2xl border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 select-none"
              >
                <div className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-app-secondary font-semibold border-b border-white/[0.06] mb-1">
                  ขนาดแถบสถานะ (HUD)
                </div>

                {/* Option: Wide (เต็มตา) - ค่าเริ่มต้น */}
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
                    <span className="text-[10px] text-app-secondary/80">รูปตัวละครเด่นชัด (ค่าเริ่มต้น)</span>
                  </div>
                  {hudWidth === 'wide' && (
                    <Check size={14} className="text-[#EF264C] flex-shrink-0" strokeWidth={2.5} />
                  )}
                </button>

                {/* Option: Normal (กะทัดรัด) */}
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
                    <span className="text-[10px] text-app-secondary/80">เพิ่มพื้นที่ให้ห้องแชท</span>
                  </div>
                  {hudWidth === 'normal' && (
                    <Check size={14} className="text-[#EF264C] flex-shrink-0" strokeWidth={2.5} />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable HUD Content Body */}
        <div 
          style={{ overscrollBehavior: 'none' }}
          className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-3.5 space-y-3.5 sm:space-y-4 custom-scrollbar overscroll-none touch-pan-y"
        >
          
          {/* 2. Zone 1: Visual State (ภาพตัวละคร 9:16 สว่างคมชัดเต็มใบ พร้อมป้ายกระจกฝ้าลอยแนบส่วนล่างอย่างหรูหรา) */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#121214] shadow-xl group aspect-[9/16] w-full">
            {/* Character Portrait (แสดงผลสว่าง คมชัด เต็มสัดส่วน 9:16) */}
            <img 
              src={data.image || data.avatar} 
              alt={data.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" 
            />
            
            {/* Subtle Soft Vignette at very bottom (ไล่เงาบางเบาเฉพาะ 20% ล่างสุดเพื่อตัดแสง ไม่บดบังตัวละคร) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 from-5% via-black/25 via-22% to-transparent pointer-events-none" />

            {/* Live Badges: Outfit & Pose (กระจกฝ้าพรีเมียม ลอยเหนือส่วนล่างของรูป อ่านง่ายโดยไม่ต้องถมดำ) */}
            <div className="absolute bottom-0 inset-x-0 p-3 space-y-2 z-10 select-none">
              {/* ชุดปัจจุบัน (Current Outfit) */}
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#121214]/65 backdrop-blur-xl border border-white/10 shadow-xl">
                <Shirt size={14} className="text-[#EF264C] flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-wider text-app-secondary font-medium">
                    ชุดปัจจุบัน
                  </span>
                  <p className="text-[12px] text-app-primary font-normal leading-snug line-clamp-2">
                    {data.outfit}
                  </p>
                </div>
              </div>

              {/* ท่าทางและสีหน้า (Current Pose & Expression) */}
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#121214]/65 backdrop-blur-xl border border-white/10 shadow-xl">
                <Smile size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-wider text-app-secondary font-medium">
                    ท่าทาง / อารมณ์
                  </span>
                  <p className="text-[12px] text-app-primary font-normal leading-snug line-clamp-2">
                    {data.pose}
                  </p>
                </div>
              </div>
            </div>
          </div>

        {/* 3. Zone 2: Identity & Meta (ชื่อ, เพศ, อายุ, บทบาท) */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[18px] font-bold text-app-primary tracking-tight">
              {data.name}
            </h3>
            <BadgeCheck size={16} className="text-[#EF264C] fill-current text-black flex-shrink-0" />
          </div>

          {/* Meta Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11.5px] text-app-secondary">
              เพศ: {data.gender}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11.5px] text-app-secondary">
              อายุ: {data.age}
            </span>
            {data.role && (
              <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11.5px] text-app-secondary">
                {data.role}
              </span>
            )}
          </div>
        </div>

        {/* 4. Zone 3: Emotional & Roleplay Gauges (หลอดความสัมพันธ์ & หลอดความปรารถนา) */}
        <div className="space-y-3.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-bold tracking-wider text-app-secondary uppercase">
              สภาวะอารมณ์และความรู้สึก
            </span>
          </div>

          {/* หลอดความสัมพันธ์ (Relationship Bond Level) */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-2">
            <div className="flex items-center justify-between text-[12.5px]">
              <div className="flex items-center gap-1.5 text-app-primary font-medium">
                <Heart size={14} className="text-pink-400 fill-pink-400/30" />
                <span>{data.relationship.label}</span>
              </div>
              <span className="font-mono text-pink-400 font-semibold text-[12px]">
                {data.relationship.current}%
              </span>
            </div>
            
            {/* Slim Gauge Bar */}
            <div className="w-full h-[5px] rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-[#EF264C] transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, data.relationship.current))}%` }}
              />
            </div>

            {/* Status Description Text */}
            {data.relationship.status && (
              <p className="text-[11.5px] text-app-secondary font-normal leading-snug pt-0.5">
                สถานะ: <span className="text-app-primary/90">{data.relationship.status}</span>
              </p>
            )}
          </div>

          {/* หลอดความปรารถนา (Desire / Passion Level) */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-2">
            <div className="flex items-center justify-between text-[12.5px]">
              <div className="flex items-center gap-1.5 text-app-primary font-medium">
                <Flame size={14} className="text-[#EF264C] fill-[#EF264C]/30" />
                <span>{data.desire.label}</span>
              </div>
              <span className="font-mono text-[#EF264C] font-semibold text-[12px]">
                {data.desire.current}%
              </span>
            </div>
            
            {/* Slim Gauge Bar (Velvet Carmine Gradient) */}
            <div className="w-full h-[5px] rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#EF264C] via-[#D22147] to-[#8E0D29] transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, data.desire.current))}%` }}
              />
            </div>

            {/* Status Description Text */}
            {data.desire.status && (
              <p className="text-[11.5px] text-app-secondary font-normal leading-snug pt-0.5">
                สถานะ: <span className="text-app-primary/90">{data.desire.status}</span>
              </p>
            )}
          </div>
        </div>

        {/* 5. Zone 4: Environment & World State (มินิแมพสภาวะแวดล้อม) */}
        <div className="space-y-2.5 pt-1">
          <span className="text-[11.5px] font-bold tracking-wider text-app-secondary uppercase">
            สภาวะแวดล้อม (World State)
          </span>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-3">
            {/* สถานที่ (Location) */}
            <div className="flex items-start gap-2.5">
              <MapPin size={15} className="text-[#EF264C] flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="block text-[10.5px] text-app-secondary uppercase font-medium">
                  สถานที่ปัจจุบัน
                </span>
                <p className="text-[13px] text-app-primary font-normal leading-snug">
                  {data.environment.location}
                </p>
              </div>
            </div>

            <div className="h-[1px] bg-white/[0.06]" />

            {/* เวลาในเรื่อง (Scene Time) */}
            <div className="flex items-start gap-2.5">
              <Clock size={15} className="text-sky-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="block text-[10.5px] text-app-secondary uppercase font-medium">
                  เวลาในเนื้อเรื่อง
                </span>
                <p className="text-[13px] text-app-primary font-normal leading-snug">
                  {data.environment.time}
                </p>
              </div>
            </div>

            <div className="h-[1px] bg-white/[0.06]" />

            {/* สภาพอากาศ (Weather) */}
            <div className="flex items-start gap-2.5">
              <CloudRain size={15} className="text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="block text-[10.5px] text-app-secondary uppercase font-medium">
                  สภาพอากาศ
                </span>
                <p className="text-[13px] text-app-primary font-normal leading-snug">
                  {data.environment.weather}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </aside>
    </>
  )
}

export default CharacterHud
