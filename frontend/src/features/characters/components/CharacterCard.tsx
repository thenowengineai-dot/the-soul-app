import { Eye, MessageCircle } from 'lucide-react';
import type { CharacterCardProps } from '../types';

export type { CharacterCardProps };

/**
 * CharacterCard: การ์ดตัวละครแบบแยก Component
 * คงสไตล์ Glassmorphism, 9:16 Aspect Ratio, Initial Badge และฟอนต์สีระบบเดิม 100%
 */
export default function CharacterCard({ 
  character, 
  onClick, 
  style, 
  className = '',
  badge 
}: CharacterCardProps) {
  if (!character) return null;

  const { name = '', quote = '', views = '', messages = '', image = '', badge: charBadge } = character;
  const displayBadge = badge ?? charBadge;

  return (
    <div 
      onClick={onClick}
      style={style}
      className={`flex-shrink-0 snap-start group/card relative aspect-[9/16] rounded-2xl overflow-hidden bg-[#1c1c1e] border border-white/5 hover:border-white/20 transition-all duration-300 shadow-xl cursor-pointer ${className}`}
    >
      {/* Thumbnail Artwork with smooth zoom on hover */}
      <img 
        src={image} 
        alt={name} 
        referrerPolicy="no-referrer"
        loading="lazy"
        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300 ease-out" 
      />
      
      {/* Top Left Tag (ป้ายแท็ก 'ใหม่' สไตล์ Dark Glassmorphism + สีชมพูหลักของแบรนด์ #EF264C ตามรูปเรฟ) */}
      {displayBadge && (
        <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#EF264C]/60 shadow-[0_0_12px_rgba(239,38,76,0.3)] select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C] shadow-[0_0_8px_#EF264C] animate-pulse" />
          <span className="text-[#EF264C] text-[11px] font-bold tracking-wider leading-none">
            {displayBadge}
          </span>
        </div>
      )}

      {/* Dark Gradient Overlay for bottom text and icons readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent via-25% pointer-events-none" />

      {/* Card Content Overlay */}
      <div className="absolute bottom-0 inset-x-0 px-2.5 sm:px-3 pb-3 sm:pb-3.5 flex items-start gap-2 sm:gap-2.5 pointer-events-none">
        {/* Creator Channel Avatar Circle with initial letter */}
        <div className="w-[30px] h-[30px] sm:w-[33px] sm:h-[33px] rounded-full shrink-0 ring-1 ring-white/15 shadow-lg bg-gradient-to-br from-[#2D2D32] to-[#1C1C1E] border border-white/10 flex items-center justify-center mt-0.5">
          <span className="text-[13px] sm:text-[14px] font-bold text-app-primary select-none leading-none">
            {name.charAt(0)}
          </span>
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Character Name */}
          <h3 className="text-[15px] sm:text-[16px] lg:text-[17px] font-bold text-app-primary tracking-wide leading-tight drop-shadow-md truncate">
            {name}
          </h3>

          {/* Character Dialogue / Quote */}
          <p className="text-[12px] sm:text-[12.5px] lg:text-[13px] text-app-secondary mt-1.5 line-clamp-1 leading-snug drop-shadow font-normal opacity-95">
            {quote}
          </p>

          {/* Stats: Views & Message Count with Icons */}
          <div className="flex items-center gap-3.5 mt-2 text-[11px] sm:text-[12px] text-app-secondary font-normal">
            <span className="flex items-center gap-1.5">
              <Eye size={13.5} className="text-app-secondary flex-shrink-0" strokeWidth={2} />
              <span>{views}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle size={13.5} className="text-app-secondary flex-shrink-0" strokeWidth={2} />
              <span>{messages}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
