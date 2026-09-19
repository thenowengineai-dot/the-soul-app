import { useState, useRef, useEffect } from 'react'
import CharacterCard from './CharacterCard'
import SliderNavButton from './SliderNavButton'
import type { CharacterSliderRowProps } from '../types'

export type { CharacterSliderRowProps }

function CharacterSliderRow({ 
  title, 
  emoji, 
  subtitle, 
  characters, 
  onCardClick,
  isOriginal = false
}: CharacterSliderRowProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);

  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 15);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 15);
    }
  };

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = 0;
      checkScroll();
    }
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.75;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full">
      {/* Apple-Style Section Header: ขนาดฟอนต์และระยะเว้นตาม Apple 8pt Grid (48px - 64px initial stage) */}
      <div className="px-6 sm:px-12 lg:px-14 xl:px-16 mb-3 sm:mb-3.5 flex items-baseline flex-wrap gap-x-3 gap-y-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[19px] sm:text-[21px] lg:text-[22px] font-bold text-app-primary tracking-tight">
            {title} {emoji && <span>{emoji}</span>}
          </h2>
          {isOriginal && (
            <div className="h-[1px] w-20 sm:w-28 bg-gradient-to-r from-[#D22147]/60 via-[#8E0D29]/25 to-transparent rounded-full ml-2" />
          )}
        </div>
        {subtitle && (
          <span className="text-[13px] sm:text-[14px] text-app-secondary font-normal">
            {subtitle}
          </span>
        )}
      </div>

      {/* Apple-Style Horizontal Cards Slider Container */}
      <div className="relative group/slider w-full overflow-hidden">
        {/* Soft Edge Dissolve (Left): ปรากฏขึ้นเฉพาะตอนเริ่มเลื่อน เพื่อให้การ์ดค่อยๆ ละลายกลืนลงไปก่อนถึงเส้นแบ่ง */}
        <div 
          className={`absolute left-0 top-0 bottom-0 w-12 sm:w-16 bg-gradient-to-r from-[#121214] via-[#121214]/80 to-transparent pointer-events-none z-20 transition-opacity duration-300 ${
            canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`} 
        />

        {/* Soft Edge Dissolve (Right): ละลายปลายขวาของการ์ดอย่างนุ่มนวลเพื่อส่งสายตา */}
        <div 
          className={`absolute right-0 top-0 bottom-0 w-12 sm:w-16 bg-gradient-to-l from-[#121214] via-[#121214]/80 to-transparent pointer-events-none z-20 transition-opacity duration-300 ${
            canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`} 
        />

        {/* Scroll Left Button */}
        {canScrollLeft && (
          <SliderNavButton
            direction="left"
            onClick={() => handleScroll('left')}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30"
          />
        )}

        {/* Scroll Right Button */}
        {canScrollRight && (
          <SliderNavButton
            direction="right"
            onClick={() => handleScroll('right')}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30"
          />
        )}

        {/* Horizontal Scroll Track: 48px - 64px initial padding, free scrolling across padding on drag/scroll */}
        <div 
          ref={sliderRef}
          onScroll={checkScroll}
          style={{ scrollPaddingLeft: '56px' }}
          className="flex items-start gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pl-6 sm:pl-12 lg:pl-14 xl:pl-16 pr-12 sm:pr-20 snap-x snap-proximity"
        >
          {characters.map(item => (
            <CharacterCard 
              key={item.id}
              character={item}
              isOriginal={isOriginal}
              onClick={() => onCardClick?.(item)}
              style={{ width: 'calc((100% - 96px) / 5.25)', minWidth: '190px', maxWidth: '230px' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CharacterSliderRow;
