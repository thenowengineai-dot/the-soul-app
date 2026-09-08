import { useState } from 'react'
import { ChevronDown, ChevronUp, ChevronRight, TvMinimalPlay } from 'lucide-react'
import { FOLLOWED_CREATORS } from '../mockData'
import type { CreatorSubscriptionsProps } from '../types'

export function CreatorSubscriptions({
  isSidebarExpanded,
  creators = FOLLOWED_CREATORS,
  onCreatorClick,
  selectedCreatorId
}: CreatorSubscriptionsProps) {
  const [showAll, setShowAll] = useState<boolean>(false);

  const initialVisibleCount = 5;
  const visibleCreators = showAll ? creators : creators.slice(0, initialVisibleCount);

  if (!isSidebarExpanded) {
    // Collapsed Mode: Collapsed into YouTube-style Subscriptions icon with 44px standard
    const hasAnyNewBot = creators.some(c => c.hasNewBot);
    return (
      <div className="relative flex items-center justify-center w-full">
        <button
          type="button"
          title={`การติดตาม${hasAnyNewBot ? ' (มีบอทใหม่ ✨)' : ''}`}
          onClick={() => onCreatorClick?.(creators[0]?.id ?? '')}
          className="relative w-[44px] h-[44px] flex items-center justify-center rounded-xl cursor-pointer transition-all duration-150 text-app-primary hover:bg-white/10"
        >
          <TvMinimalPlay strokeWidth={2.2} size={20} />
          {hasAnyNewBot && (
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#EF264C] ring-2 ring-[rgb(13,13,13)] shadow-[0_0_4px_#EF264C]" />
          )}
        </button>
      </div>
    );
  }

  // Expanded Mode: Exact YouTube Subscriptions UI matching reference image
  return (
    <div className="flex flex-col gap-0.5 w-full py-1">
      {/* Section Header: Large Primary White with ChevronRight (No count badge) */}
      <div 
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-app-primary cursor-pointer select-none group transition-colors"
      >
        <span className="text-[15px] font-semibold tracking-tight text-app-primary group-hover:text-white transition-colors">
          การติดตาม
        </span>
        <ChevronRight 
          size={16} 
          strokeWidth={2.2} 
          className="text-app-primary/80 group-hover:text-white group-hover:translate-x-0.5 transition-all" 
        />
      </div>

      {/* Creator Items: 24px Avatar, gap-3.5, 14px font, right-side pink dot */}
      {visibleCreators.map(creator => {
        const isSelected = selectedCreatorId === creator.id;
        return (
          <button
            key={creator.id}
            type="button"
            onClick={() => onCreatorClick?.(creator.id)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all duration-150 cursor-pointer text-left group text-app-primary hover:bg-white/[0.08] ${
              isSelected ? 'font-medium' : ''
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              {creator.avatar ? (
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-[24px] h-[24px] rounded-full object-cover shrink-0 ring-1 ring-white/15"
                />
              ) : (
                <div className="w-[24px] h-[24px] rounded-full shrink-0 ring-1 ring-white/15 shadow-sm bg-gradient-to-br from-[#2D2D32] to-[#1C1C1E] border border-white/10 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-app-primary select-none leading-none">
                    {creator.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-[13.5px] text-app-primary font-normal truncate leading-snug group-hover:text-white transition-colors">
                {creator.name}
              </span>
            </div>

            {/* Right-side Small Brand Glow Dot (for New Bot) */}
            {creator.hasNewBot && (
              <span 
                title="มีตัวละครใหม่!"
                className="w-1 h-1 rounded-full bg-[#EF264C] shadow-[0_0_4px_#EF264C] shrink-0 ml-2" 
              />
            )}
          </button>
        );
      })}

      {/* Show More / Show Less Toggle Button (Icon aligned with 24px avatar column) */}
      {creators.length > initialVisibleCount && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="w-full flex items-center gap-3.5 px-2.5 py-1.5 rounded-xl text-app-primary hover:bg-white/[0.08] transition-all text-left cursor-pointer mt-0.5 group"
        >
          <div className="w-[24px] h-[24px] flex items-center justify-center shrink-0">
            {showAll ? (
              <ChevronUp size={18} strokeWidth={2.2} className="text-app-primary group-hover:text-white transition-colors" />
            ) : (
              <ChevronDown size={18} strokeWidth={2.2} className="text-app-primary group-hover:text-white transition-colors" />
            )}
          </div>
          <span className="text-[14px] text-app-primary font-normal leading-snug group-hover:text-white transition-colors">
            {showAll ? 'แสดงน้อยลง' : 'แสดงเพิ่มเติม'}
          </span>
        </button>
      )}
    </div>
  );
}

export default CreatorSubscriptions;

