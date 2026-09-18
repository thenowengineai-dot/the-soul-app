import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Character } from '../../characters/types'
import { MOCK_CHARACTERS } from '../../characters/mockData'

export interface HeroSlide {
  id: string | number
  characterId?: string | number
  eventTag: string
  eventHook: string
  characterName: string
  dialogue: string
  videoUrl?: string
  imageUrl?: string
  // Legacy / fallback optional fields
  title?: string
  subtitle?: string
  badge?: string
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hero-1',
    characterId: 'char_1788786310',
    eventTag: 'EVENT พิเศษ • เรื่องราวลับเฉพาะ',
    eventHook: 'คืนฝนพรำกับรอยยิ้มที่แท้จริง... หลังเวลาเลิกงาน',
    characterName: 'ใบส้ม (Baisom)',
    dialogue: '"เชอรี่ผู้ขายรอยยิ้มในยามค่ำ... แต่กับคุณ ฉันอยากเป็นแค่ใบส้มที่เหนื่อยล้า"',
    videoUrl: '/hero/05aad770ded68fe3100003ab5f3bd58c.mp4',
    title: 'ใบส้ม (Baisom)',
    subtitle: 'คืนฝนพรำกับรอยยิ้มที่แท้จริง... หลังเวลาเลิกงาน',
    badge: 'ตัวละครใหม่',
  },
  {
    id: 'hero-2',
    characterId: 1,
    eventTag: 'ค่ำคืนในรั้วโรงเรียน • บทเรียนส่วนตัว',
    eventHook: 'สองต่อสองในห้องชมรม... ความลับที่รุ่นพี่ไม่กล้าบอกใคร',
    characterName: 'ชิน อา-ยอง',
    dialogue: '"ถ้ามีใครเปิดประตูเข้ามาตอนนี้... พวกเราจะทำยังไงกันดีล่ะ?"',
    videoUrl: '/hero/1f19767deb98ec4077a90a0a6c81f879_720w.mp4',
    title: 'ชิน อา-ยอง',
    subtitle: 'สองต่อสองในห้องชมรม... ความลับที่รุ่นพี่ไม่กล้าบอกใคร',
    badge: 'ยอดนิยมสัปดาห์นี้',
  },
  {
    id: 'hero-3',
    characterId: 2,
    eventTag: 'เหตุการณ์ชวนใจเต้น • วันหยุดสองต่อสอง',
    eventHook: 'เมื่อพี่สาวข้างห้องชวนมาเล่นบนเตียงในวันฝนตก',
    characterName: 'ฮันนารี',
    dialogue: '"ข้างนอกฝนตกหนักขนาดนี้... วันนี้อยู่เล่นบนเตียงกับพี่สาวทั้งวันเถอะนะ"',
    videoUrl: '/hero/307ca512e8b7ace7a4f9b0dcf205b6a5_720w.mp4',
    title: 'ฮันนารี',
    subtitle: 'เมื่อพี่สาวข้างห้องชวนมาเล่นบนเตียงในวันฝนตก',
    badge: 'กำลังมาแรง 🔥',
  },
  {
    id: 'hero-4',
    characterId: 3,
    eventTag: 'ความสัมพันธ์ต้องห้าม • บ่ายวันอาทิตย์',
    eventHook: 'อย่าทำแบบนี้... กับพี่สาวข้างห้องที่กำลังสับสน',
    characterName: 'จาง ซอนยอง',
    dialogue: '"เธอไม่ควรเข้ามาใกล้ขนาดนี้... หัวใจพี่สาวเต้นแรงจนห้ามไม่ไหวแล้ว"',
    videoUrl: '/hero/5c2c9e141cf6907fe9dc1bddc27171bf_720w.mp4',
    title: 'จาง ซอนยอง',
    subtitle: 'อย่าทำแบบนี้... กับพี่สาวข้างห้องที่กำลังสับสน',
    badge: 'แนะนำพิเศษ',
  },
  {
    id: 'hero-5',
    characterId: 4,
    eventTag: 'การพบกันโดยบังเอิญ • คาเฟ่ยามดึก',
    eventHook: 'สบตากันในมุมมืด... เธอแอบมองฉันอยู่นานแล้วใช่ไหม?',
    characterName: 'ยู จินอา',
    dialogue: '"แอบมองฉันมาตั้งแต่โต๊ะฝั่งนู้นแล้วนี่... อยากเข้ามานั่งคุยใกล้ๆ ไหมล่ะ?"',
    videoUrl: '/hero/d768b52aa29a4f851c4e771cfde03348_720w.mp4',
    title: 'ยู จินอา',
    subtitle: 'สบตากันในมุมมืด... เธอแอบมองฉันอยู่นานแล้วใช่ไหม?',
    badge: 'เอ็กซ์คลูซีฟ ✦',
  },
  {
    id: 'hero-6',
    characterId: 5,
    eventTag: 'สัญญาลับ • ค่ำคืนที่ไม่มีวันลืม',
    eventHook: 'ถ้าคืนนี้เธออยู่ต่อ... ฉันจะยอมเล่าความลับทุกอย่าง',
    characterName: 'ปาร์ค ซอยอน',
    dialogue: '"แค่อยู่เคียงข้างฉันในคืนนี้... แล้วฉันสัญญาว่าจะไม่ปิดบังอะไรเธออีก"',
    imageUrl: '/hero/0aee2fb8-4c43-4075-9a54-f00c1d680f6c.jpeg',
    title: 'ปาร์ค ซอยอน',
    subtitle: 'ถ้าคืนนี้เธออยู่ต่อ... ฉันจะยอมเล่าความลับทุกอย่าง',
    badge: 'ออริจินัลสตอรี่',
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
      className={`w-full shrink-0 pt-6 sm:pt-8 pb-9 sm:pb-12 flex flex-col items-center select-none overflow-hidden ${className}`}
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
              alt={currentSlide.characterName || currentSlide.title} 
              className="absolute inset-0 w-full h-full object-cover object-center group-hover/hero:scale-[1.025] transition-transform duration-1000 ease-out"
            />
          )}

          {/* Gentle Bottom Scrim Gradient - Leaves 50%+ of Art Pure and Unobstructed */}
          <div className="absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-[#09090c]/95 via-[#09090c]/50 to-transparent pointer-events-none" />

          {/* Editorial Content Overlay - Scenario Event Presentation */}
          <div className="absolute bottom-0 inset-x-0 p-6 sm:p-9 lg:p-10 flex flex-col pointer-events-none pr-28 sm:pr-36 lg:pr-40">
            {/* Event Category Tag with Pulsing Status Indicator */}
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C] animate-pulse" />
              <p className="text-[11px] sm:text-[11.5px] font-semibold tracking-[0.2em] uppercase text-[#EF264C] drop-shadow-sm">
                {currentSlide.eventTag || currentSlide.badge}
              </p>
            </div>

            {/* Event Scenario Hook Headline (คำโปรยเหตุการณ์ขนาดใหญ่สะกดสายตา ชวนให้คลิก) */}
            <h2 className="text-[20px] sm:text-[26px] lg:text-[32px] font-bold text-[#F5F5F7] tracking-tight leading-snug sm:leading-tight drop-shadow-xl line-clamp-2">
              {currentSlide.eventHook || currentSlide.title}
            </h2>

            {/* Character Attribution & Intimate Whispered Dialogue */}
            <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1.5 mt-2.5 sm:mt-3">
              <span className="text-[12px] sm:text-[12.5px] font-semibold text-[#F5F5F7] bg-white/[0.08] backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 shrink-0">
                {currentSlide.characterName || currentSlide.title}
              </span>
              <p className="text-[13px] sm:text-[14.5px] lg:text-[15.5px] text-[#A1A1A6] italic font-normal drop-shadow-md leading-relaxed line-clamp-1">
                {currentSlide.dialogue || currentSlide.subtitle}
              </p>
            </div>
          </div>

          {/* In-Card Apple Navigation Dock (Discreet Glass Capsule at Bottom-Right) */}
          <div 
            className="absolute bottom-5 right-5 sm:bottom-7 sm:right-8 z-20 flex items-center gap-1.5 sm:gap-2 bg-[#101014]/80 backdrop-blur-xl border border-white/10 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-[0_8px_25px_rgba(0,0,0,0.6)] select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Arrow */}
            <button
              type="button"
              onClick={prevSlide}
              title="สไลด์ก่อนหน้า"
              className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full hover:bg-white/15 text-[#A1A1A6] hover:text-[#F5F5F7] flex items-center justify-center transition-all cursor-pointer active:scale-90"
            >
              <ChevronLeft size={14} strokeWidth={2.4} />
            </button>

            {/* Apple Micro-Dots Indicator */}
            <div className="flex items-center gap-1.5 px-0.5">
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
                        ? 'w-4 h-1.5 bg-[#F5F5F7] shadow-sm' 
                        : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
                    }`}
                  />
                );
              })}
            </div>

            {/* Next Arrow */}
            <button
              type="button"
              onClick={nextSlide}
              title="สไลด์ถัดไป"
              className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full hover:bg-white/15 text-[#A1A1A6] hover:text-[#F5F5F7] flex items-center justify-center transition-all cursor-pointer active:scale-90"
            >
              <ChevronRight size={14} strokeWidth={2.4} />
            </button>
          </div>
        </div>

        {/* Next Peek Card (Right Only - Exactly Like Apple Store Carousel) */}
        <div 
          onClick={nextSlide}
          title={nextItem.eventHook || nextItem.characterName || nextItem.title}
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
              alt={nextItem.characterName || nextItem.title} 
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          )}
          <div className="absolute inset-0 bg-black/50 pointer-events-none" />
          <div className="absolute bottom-4 inset-x-3 text-center pointer-events-none">
            <span className="text-[12px] font-medium text-white/80 truncate block">
              {nextItem.characterName || nextItem.title}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
