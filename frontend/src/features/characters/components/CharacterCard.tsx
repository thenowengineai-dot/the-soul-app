import { Eye, MessageCircle } from 'lucide-react';
import type { CharacterCardProps } from '../types';
import { formatCompactNumber } from '../utils';

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
      style={{
        aspectRatio: '9 / 16',
        ...style,
      }}
      className={`flex-shrink-0 snap-start self-start h-auto group/card relative aspect-[9/16] rounded-[24px] overflow-hidden bg-[#18181B] border border-white/[0.08] hover:border-white/25 hover:scale-[1.02] transition-all duration-300 shadow-xl hover:shadow-2xl cursor-pointer ${className}`}
    >
      {/* Thumbnail Artwork with smooth zoom on hover */}
      <img 
        src={image} 
        alt={name} 
        referrerPolicy="no-referrer"
        loading="lazy"
        className="w-full h-full object-cover object-center group-hover/card:scale-105 transition-transform duration-500 ease-out" 
      />
      
      {/* Top Left Tag (ป้ายแท็กแคปซูลมน 'ใหม่' สไตล์ Dark Glassmorphism) */}
      {displayBadge && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#EF264C]/45 shadow-[0_0_12px_rgba(239,38,76,0.2)] select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C] shadow-[0_0_8px_#EF264C] animate-pulse" />
          <span className="text-[#EF264C] text-[11px] font-bold tracking-wider leading-none">
            {displayBadge}
          </span>
        </div>
      )}

      {/* Dark Velvet Gradient Overlay for bottom text and icons readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#101014]/95 via-[#101014]/45 to-transparent via-35% pointer-events-none" />

      {/* Card Content Overlay (ตัดวงกลมตัวย่อออก ให้ชื่อและคำพูดวางเต็มความกว้างอย่างสง่างาม) */}
      <div className="absolute bottom-0 inset-x-0 px-3.5 sm:px-4 pb-3.5 sm:pb-4 flex flex-col pointer-events-none">
        {/* Character Name (ขาวนวล 20% Punch) */}
        <h3 className="text-[16px] sm:text-[17px] font-bold text-[#F5F5F7] tracking-tight leading-snug drop-shadow-md truncate">
          {name}
        </h3>

        {/* Character Dialogue / Quote (เทาเงินกระซิบ 80% Whisper) */}
        <p className="text-[12.5px] sm:text-[13px] text-[#A1A1A6] mt-1 line-clamp-2 leading-relaxed drop-shadow font-normal italic">
          {quote}
        </p>

        {/* Stats: Views & Message Count with Icons (Compact k/M formatting) */}
        <div className="flex items-center gap-3.5 mt-2 text-[11.5px] sm:text-[12px] text-[#86868B] font-normal">
          <span className="flex items-center gap-1.5">
            <Eye size={13} className="text-[#86868B] flex-shrink-0" strokeWidth={1.8} />
            <span>{formatCompactNumber(views)}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle size={13} className="text-[#86868B] flex-shrink-0" strokeWidth={1.8} />
            <span>{formatCompactNumber(messages)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
