import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Character } from '../../characters/types'
import { MOCK_CHARACTERS } from '../../characters/mockData'

export interface HeroSlide {
  id: string | number
  characterId?: string | number
  title: string
  subtitle: string
  videoUrl?: string
  imageUrl?: string
  badge: string
  subBadge?: string
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hero-1',
    characterId: 'char_1788786310',
    title: 'ใบส้ม (Baisom)',
    subtitle: 'เชอรี่ผู้ขายรอยยิ้มในยามค่ำ — ใบส้มผู้เย็นชาและรักสันโดษเมื่อเลิกงาน',
    videoUrl: '/hero/05aad770ded68fe3100003ab5f3bd58c.mp4',
    badge: 'ตัวละครใหม่',
    subBadge: 'บทสนทนามีชีวิต 🎙️',
  },
  {
    id: 'hero-2',
    characterId: 1,
    title: 'ชิน อา-ยอง',
    subtitle: 'ความสัมพันธ์ลับๆ ระหว่างรุ่นพี่สาวขี้อายกับรุ่นน้องคนสนิทในห้องชมรมหลังเลิกเรียน',
    videoUrl: '/hero/1f19767deb98ec4077a90a0a6c81f879_720w.mp4',
    badge: 'ยอดนิยมสัปดาห์นี้',
    subBadge: 'อนิเมชันสด ✨',
  },
  {
    id: 'hero-3',
    characterId: 2,
    title: 'ฮันนารี',
    subtitle: '"มาเล่นบนเตียงทั้งวันกับพี่สาวกันเถอะ... เธอเป็นเด็กดีใช่ไหม?"',
    videoUrl: '/hero/307ca512e8b7ace7a4f9b0dcf205b6a5_720w.mp4',
    badge: 'กำลังมาแรง 🔥',
    subBadge: 'เสียงพากย์สด 🎧',
  },
  {
    id: 'hero-4',
    characterId: 3,
    title: 'จาง ซอนยอง',
    subtitle: '"อย่าทำแบบนี้! คุณไม่ควรทำแบบนี้กับพี่สาวข้างห้องนะ..."',
    videoUrl: '/hero/5c2c9e141cf6907fe9dc1bddc27171bf_720w.mp4',
    badge: 'แนะนำพิเศษ',
    subBadge: 'เรื่องราวยอดนิยม ⚡',
  },
  {
    id: 'hero-5',
    characterId: 4,
    title: 'ยู จินอา',
    subtitle: '"แอบมองฉันอยู่นานแล้วใช่ไหมล่ะ? เจ้าเด็กขี้อาย..."',
    videoUrl: '/hero/d768b52aa29a4f851c4e771cfde03348_720w.mp4',
    badge: 'เอ็กซ์คลูซีฟ ✦',
    subBadge: 'แชทเรียลไทม์ 💬',
  },
  {
    id: 'hero-6',
    characterId: 5,
    title: 'ปาร์ค ซอยอน',
    subtitle: '"ถ้าคืนนี้เธออยู่ต่อ... ฉันสัญญาว่าจะไม่บอกความลับเรื่องนี้กับใคร"',
    imageUrl: '/hero/0aee2fb8-4c43-4075-9a54-f00c1d680f6c.jpeg',
    badge: 'ออริจินัลสตอรี่',
    subBadge: 'ภาพวาดพรีเมียม 🎨',
  },
];

export interface HeroShowcaseProps {
  slides?: HeroSlide[]
  onSelectCharacter?: (character: Character) => void
  className?: string
}

export default function HeroShowcase({
  slides = HERO_SLIDES,
  onSelectCharacter,
  className = '',
}: HeroShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Auto-play slider every 7.5 seconds when not hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length);
    }, 7500);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex];
  const nextIndex = (currentIndex + 1) % slides.length;
  const nextItem = slides[nextIndex];

  const handleCardClick = (slide: HeroSlide) => {
    if (slide.characterId && onSelectCharacter) {
      const foundChar = MOCK_CHARACTERS.find(c => String(c.id) === String(slide.characterId));
      if (foundChar) {
        onSelectCharacter(foundChar);
        return;
      }
    }
  };

  return (
    <div 
      className={`w-full shrink-0 pt-6 sm:pt-8 pb-3 sm:pb-4 flex flex-col items-center select-none overflow-hidden ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Visual Peek-Through Carousel Stage (Apple Stage: Left Anchor with Right Peek) */}
      <div className="relative flex items-center justify-center w-full max-w-[1440px] px-4 sm:px-8 lg:px-12 shrink-0">
        
        {/* Center Main Hero Card - Majestic Apple Showcase Stage */}
        <div 
          onClick={() => handleCardClick(currentSlide)}
          className="relative w-full max-w-[1040px] xl:max-w-[1140px] h-[360px] sm:h-[420px] lg:h-[460px] min-h-[360px] sm:min-h-[420px] lg:min-h-[460px] rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.7)] border border-white/[0.06] shrink-0 mx-2 sm:mx-4 group/hero cursor-pointer bg-[#141418]"
        >
          {/* Native Video or Hi-Res Image */}
          {currentSlide.videoUrl ? (
            <video 
              key={currentSlide.id}
              src={currentSlide.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center group-hover/hero:scale-[1.025] transition-transform duration-1000 ease-out"
            />
          ) : (
            <img 
              src={currentSlide.imageUrl} 
              alt={currentSlide.title} 
              className="absolute inset-0 w-full h-full object-cover object-center group-hover/hero:scale-[1.025] transition-transform duration-1000 ease-out"
            />
          )}

          {/* Gentle Bottom Scrim Gradient - Leaves 55%+ of Art Pure and Unobstructed */}
          <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-[#0a0a0c]/95 via-[#0a0a0c]/40 to-transparent pointer-events-none" />

          {/* Editorial Content Overlay - Apple Grandeur & Card Consistency */}
          <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 lg:p-12 flex flex-col pointer-events-none">
            {/* Subtle Overline Category */}
            {currentSlide.badge && (
              <p className="text-[11px] sm:text-[12px] font-semibold tracking-[0.25em] uppercase text-[#EF264C] mb-1.5 drop-shadow-sm select-none">
                {currentSlide.badge}
              </p>
            )}

            {/* Character Name / Title (Scaled for Hero Grandeur) */}
            <h2 className="text-[28px] sm:text-[34px] lg:text-[40px] font-bold text-[#F5F5F7] tracking-tight leading-none drop-shadow-xl truncate">
              {currentSlide.title}
            </h2>

            {/* Dialogue / Quote (Italic for Complete Consistency with CharacterCard) */}
            <p className="text-[14.5px] sm:text-[16px] lg:text-[17px] text-[#A1A1A6] italic mt-2 sm:mt-2.5 line-clamp-1 sm:line-clamp-2 font-normal drop-shadow-md leading-relaxed max-w-[80%]">
              {currentSlide.subtitle}
            </p>

            {/* Apple Action Cue (Subtle Prompt: 'เริ่มบทสนทนา >') */}
            <div className="flex items-center gap-1.5 mt-3.5 sm:mt-4 text-[13.5px] sm:text-[14px] font-medium text-[#F5F5F7]/90 group-hover/hero:text-white transition-colors">
              <span>เริ่มบทสนทนา</span>
              <ChevronRight size={15} className="group-hover/hero:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Next Peek Card (Right Only - Exactly Like Apple Store Carousel) */}
        <div 
          onClick={nextSlide}
          title={nextItem.title}
          className="hidden lg:block relative w-[140px] xl:w-[220px] h-[330px] sm:h-[390px] lg:h-[430px] min-h-[330px] sm:min-h-[390px] lg:min-h-[430px] rounded-[24px] sm:rounded-[30px] overflow-hidden opacity-25 hover:opacity-50 transition-all duration-700 scale-[0.95] shrink-0 cursor-pointer border border-white/[0.04] shadow-xl"
        >
          {nextItem.videoUrl ? (
            <video 
              src={nextItem.videoUrl} 
              muted 
              loop 
              autoPlay 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          ) : (
            <img 
              src={nextItem.imageUrl} 
              alt={nextItem.title} 
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          )}
          <div className="absolute inset-0 bg-black/50 pointer-events-none" />
        </div>

      </div>

      {/* Apple Unified Navigation Dock (Flanked Circle Arrows + Centered Micro-Dots Pill) */}
      <div className="flex items-center justify-center gap-2.5 sm:gap-3 mt-4 sm:mt-5 shrink-0 select-none">
        {/* Left Circular Arrow */}
        <button
          type="button"
          onClick={prevSlide}
          title="สไลด์ก่อนหน้า"
          className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/[0.08] hover:border-white/20 text-[#A1A1A6] hover:text-[#F5F5F7] flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-sm"
        >
          <ChevronLeft size={16} strokeWidth={2.2} />
        </button>

        {/* Apple Tactile Micro-Dots Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] shadow-sm">
          {slides.map((_, idx) => {
            const isActive = currentIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                title={`สไลด์ที่ ${idx + 1}`}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  isActive 
                    ? 'w-5 h-1.5 bg-[#F5F5F7] shadow-sm' 
                    : 'w-1.5 h-1.5 bg-white/25 hover:bg-white/50'
                }`}
              />
            );
          })}
        </div>

        {/* Right Circular Arrow */}
        <button
          type="button"
          onClick={nextSlide}
          title="สไลด์ถัดไป"
          className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/[0.08] hover:border-white/20 text-[#A1A1A6] hover:text-[#F5F5F7] flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-sm"
        >
          <ChevronRight size={16} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
