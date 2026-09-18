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
  const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
  const nextIndex = (currentIndex + 1) % slides.length;
  const prevItem = slides[prevIndex];
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
      className={`w-full pt-4 sm:pt-6 pb-2 sm:pb-3 flex flex-col items-center select-none overflow-hidden ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Visual Peek-Through Carousel Stage */}
      <div className="relative flex items-center justify-center w-full max-w-[1440px] px-3 sm:px-6">
        
        {/* Previous Peek Wing (Left) */}
        <div 
          onClick={prevSlide}
          title={prevItem.title}
          className="hidden md:block relative w-[140px] lg:w-[220px] aspect-[16/9] sm:aspect-[21/9] rounded-[22px] overflow-hidden opacity-35 hover:opacity-65 transition-all duration-500 scale-[0.92] shrink-0 cursor-pointer border border-white/[0.06] shadow-lg"
        >
          {prevItem.videoUrl ? (
            <video 
              src={prevItem.videoUrl} 
              muted 
              loop 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover pointer-events-none"
            />
          ) : (
            <img 
              src={prevItem.imageUrl} 
              alt={prevItem.title} 
              className="w-full h-full object-cover pointer-events-none"
            />
          )}
          <div className="absolute inset-0 bg-black/60 pointer-events-none" />
        </div>

        {/* Center Main Hero Card */}
        <div 
          onClick={() => handleCardClick(currentSlide)}
          className="relative w-full max-w-[800px] lg:max-w-[860px] aspect-[16/9] sm:aspect-[21/9] rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-2xl border border-white/10 shrink-0 mx-2 sm:mx-4 group/hero cursor-pointer bg-[#141418]"
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
              className="w-full h-full object-cover object-center group-hover/hero:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <img 
              src={currentSlide.imageUrl} 
              alt={currentSlide.title} 
              className="w-full h-full object-cover object-center group-hover/hero:scale-105 transition-transform duration-700 ease-out"
            />
          )}

          {/* Cinematic Dark Velvet Scrim Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c]/95 via-[#0a0a0c]/35 to-transparent via-50% pointer-events-none" />

          {/* Left & Right Chevron Navigation Buttons */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            title="สไลด์ก่อนหน้า"
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/15 hover:border-white/35 text-white flex items-center justify-center transition-all cursor-pointer z-20 active:scale-90 shadow-lg"
          >
            <ChevronLeft size={20} strokeWidth={2.2} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            title="สไลด์ถัดไป"
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/15 hover:border-white/35 text-white flex items-center justify-center transition-all cursor-pointer z-20 active:scale-90 shadow-lg"
          >
            <ChevronRight size={20} strokeWidth={2.2} />
          </button>

          {/* Editorial Content Overlay (Bottom Left) */}
          <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 lg:p-7 flex flex-col pointer-events-none">
            {/* Badges Bar */}
            <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
              {currentSlide.badge && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#EF264C] text-white text-[11px] sm:text-[11.5px] font-bold tracking-wide shadow-sm select-none">
                  {currentSlide.badge}
                </span>
              )}
              {currentSlide.subBadge && (
                <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[#F5F5F7] text-[11px] sm:text-[11.5px] font-medium flex items-center gap-1.5 shadow-sm select-none">
                  {currentSlide.subBadge}
                </span>
              )}
            </div>

            {/* Character Name / Title */}
            <h2 className="text-[19px] sm:text-[24px] lg:text-[27px] font-bold text-[#F5F5F7] tracking-tight leading-snug drop-shadow-lg truncate">
              {currentSlide.title}
            </h2>

            {/* Subtitle / Dialogue */}
            <p className="text-[12px] sm:text-[13.5px] text-[#A1A1A6] mt-0.5 sm:mt-1 line-clamp-1 font-normal drop-shadow leading-relaxed">
              {currentSlide.subtitle}
            </p>
          </div>
        </div>

        {/* Next Peek Wing (Right) */}
        <div 
          onClick={nextSlide}
          title={nextItem.title}
          className="hidden md:block relative w-[140px] lg:w-[220px] aspect-[16/9] sm:aspect-[21/9] rounded-[22px] overflow-hidden opacity-35 hover:opacity-65 transition-all duration-500 scale-[0.92] shrink-0 cursor-pointer border border-white/[0.06] shadow-lg"
        >
          {nextItem.videoUrl ? (
            <video 
              src={nextItem.videoUrl} 
              muted 
              loop 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover pointer-events-none"
            />
          ) : (
            <img 
              src={nextItem.imageUrl} 
              alt={nextItem.title} 
              className="w-full h-full object-cover pointer-events-none"
            />
          )}
          <div className="absolute inset-0 bg-black/60 pointer-events-none" />
        </div>

      </div>

      {/* Apple-Style Segmented Dash Indicators (— — — — —) */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-3.5">
        {slides.map((_, idx) => {
          const isActive = currentIndex === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              title={`สไลด์ที่ ${idx + 1}`}
              className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                isActive 
                  ? 'w-7 sm:w-9 bg-[#F5F5F7]' 
                  : 'w-3 sm:w-3.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
