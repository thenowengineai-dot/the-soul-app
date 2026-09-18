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
  onCardClick 
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
      {/* Apple-Style Section Header: ขนาดฟอนต์และระยะเว้นตาม Apple 8pt Grid */}
      <div className="px-6 sm:px-8 xl:px-10 mb-4 flex items-baseline flex-wrap gap-x-3 gap-y-1">
        <h2 className="text-[20px] sm:text-[22px] lg:text-[24px] font-bold text-app-primary tracking-tight">
          {title} {emoji && <span>{emoji}</span>}
        </h2>
        {subtitle && (
          <span className="text-[14px] sm:text-[15px] lg:text-[16px] text-app-secondary font-normal">
            {subtitle}
          </span>
        )}
      </div>

      {/* Apple-Style Horizontal Cards Slider Container */}
      <div className="relative group/slider w-full">
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

        {/* Horizontal Scroll Track: 16px gap, 24-40px padding */}
        <div 
          ref={sliderRef}
          onScroll={checkScroll}
          style={{ scrollPaddingLeft: '32px' }}
          className="flex items-start gap-4 overflow-x-auto no-scrollbar scroll-smooth pl-6 sm:pl-8 xl:pl-10 pr-12 sm:pr-16 snap-x snap-proximity"
        >
          {characters.map(item => (
            <CharacterCard 
              key={item.id}
              character={item}
              onClick={() => onCardClick?.(item)}
              style={{ width: 'calc((100% - 112px) / 4.10)', minWidth: '290px' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CharacterSliderRow;
