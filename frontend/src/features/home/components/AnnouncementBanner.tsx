import { useState, useEffect } from 'react'
import { Timer } from 'lucide-react'
import { ANNOUNCEMENT_ITEMS } from '../mockData'
import type { AnnouncementItem } from '../types'

function AnnouncementBanner() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFading, setIsFading] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({ 
    hours: 19, 
    minutes: 55, 
    seconds: 41 
  });

  // Live countdown timer for promo item
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (h: number, m: number, s: number): string => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  // Auto-cycle through the 5 items (ค้างนานขึ้นเป็น 9.5 วินาที เพื่อให้มีเวลาอ่านครบถ้วน, จังหวะเฟดยังคงไว 180ms)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % ANNOUNCEMENT_ITEMS.length);
        setIsFading(false);
      }, 180);
    }, 9500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentItem: AnnouncementItem = ANNOUNCEMENT_ITEMS[currentIndex];

  return (
    <div className="px-8 sm:px-10 xl:px-12 pt-5 sm:pt-6 pb-2.5 sm:pb-3.5 w-full">
      {/* Container เดี่ยวจัดกึ่งกลาง เว้นพื้นที่ว่าง (space) ด้านซ้ายและขวาอย่างสมดุล */}
      <div className="max-w-[820px] mx-auto w-full">
        <div 
          onClick={() => {}}
          onMouseEnter={() => {
            setIsPaused(true);
            setIsHovered(true);
          }}
          onMouseLeave={() => {
            setIsPaused(false);
            setIsHovered(false);
          }}
          style={{ 
            backgroundColor: isHovered ? currentItem.hoverBgColor : currentItem.bgColor,
            // ปกติไม่มีเส้นกรอบตามสี และเมื่อ hover ใช้เส้นกรอบบางละเอียดนุ่มตา (ไม่หนา/ใหญ่เกินไป)
            borderColor: isHovered ? `${currentItem.accentColor}70` : 'rgba(255, 255, 255, 0.06)',
            boxShadow: isHovered 
              ? `0 4px 20px -2px ${currentItem.accentColor}18` 
              : '0 2px 12px -2px rgba(0, 0, 0, 0.4)'
          }}
          className="group relative flex items-center justify-between overflow-hidden rounded-2xl border px-4 py-3 sm:px-5 sm:py-3.5 transition-all duration-300 cursor-pointer min-h-[62px] sm:min-h-[66px]"
        >
          {/* Left: Text Details with smooth and faster cross-fade animation */}
          <div 
            className={`flex flex-col gap-0.5 z-20 min-w-0 pr-24 sm:pr-28 md:pr-32 transition-all duration-200 ${
              isFading ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
            }`}
          >
            {/* Top: Tag / Category Header (ขนาดกะทัดรัด ทำหน้าที่เป็น Tag หัวข้อ) & Pager */}
            <div className="flex items-center gap-2">
              {currentItem.hasTimer ? (
                <div className="flex items-center gap-1.5" style={{ color: currentItem.accentColor }}>
                  <Timer size={12.5} strokeWidth={2.4} className="flex-shrink-0" />
                  <span className="text-[11px] sm:text-[11.5px] font-semibold tracking-wider font-mono">
                    {formatTime(timeLeft.hours, timeLeft.minutes, timeLeft.seconds)}
                  </span>
                  <span className="text-white/20 text-[10px]">•</span>
                  <span className="text-[11px] sm:text-[11.5px] font-bold">
                    {currentItem.tagText}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] sm:text-[11.5px] font-bold tracking-wide" style={{ color: currentItem.accentColor }}>
                  {currentItem.tagText}
                </span>
              )}

              {/* Pager indicator เช่น 1/5, 2/5 */}
              <span className="text-app-secondary/60 text-[10.5px] sm:text-[11px] font-mono">
                {currentItem.badge}
              </span>
            </div>

            {/* Bottom: Main Headline Content (ข้อความสีขาวขนาดพอดี ไม่ใหญ่เกินไป เป็นเนื้อหาหลัก) */}
            <div className="flex items-center flex-wrap gap-x-1.5 text-[13.5px] sm:text-[14px] md:text-[14.5px] font-medium text-app-primary tracking-normal leading-snug">
              <span>{currentItem.mainText}</span>
              {currentItem.highlightText && (
                <span className="font-semibold whitespace-nowrap" style={{ color: currentItem.highlightColor }}>
                  {currentItem.highlightText}
                </span>
              )}
            </div>
          </div>

          {/* Right: Character Artwork (ชิดขอบบนล่าง ขวาสุด พร้อม fade ขอบซ้าย) */}
          <div 
            className={`absolute right-0 inset-y-0 h-full w-24 sm:w-28 md:w-32 overflow-hidden flex items-center justify-center z-10 transition-all duration-200 pointer-events-none ${
              isFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            <img 
              src={currentItem.characterImage} 
              alt={currentItem.characterName} 
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300 select-none"
            />
            {/* Gradient mask on left edge */}
            <div 
              style={{ 
                background: `linear-gradient(to right, ${isHovered ? currentItem.hoverBgColor : currentItem.bgColor}, transparent)` 
              }}
              className="absolute inset-y-0 left-0 w-8 sm:w-10 pointer-events-none transition-colors duration-300" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementBanner;
