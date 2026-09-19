import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { SliderNavButtonProps } from '../types'

export type { SliderNavButtonProps }

/**
 * SliderNavButton: คอมโพเนนต์ปุ่มลูกศรเลื่อนสไลเดอร์ (< และ >)
 * สไตล์ Liquid Frosted Glass (Apple visionOS) โปร่งแสงหักเหแสง
 * ขนาดกะทัดรัด เรียบหรู ไม่บดบังงานศิลปะของตัวละคร
 */
export default function SliderNavButton({
  direction,
  onClick,
  size = 'md',
  className = '',
  title,
  disabled = false,
}: SliderNavButtonProps) {
  const isRight = direction === 'right';
  const defaultTitle = title || (isRight ? 'เลื่อนไปทางขวา' : 'เลื่อนไปทางซ้าย');

  // สัดส่วนขนาดปุ่มและขนาดไอคอนตามโหมด (ปรับขนาดให้กะทัดรัดลงตามปรัชญา Apple Ergonomics & Subtractive Design)
  const sizeStyles = {
    sm: {
      button: 'w-[28px] h-[28px] sm:w-[32px] sm:h-[32px]',
      iconSize: 13,
    },
    md: {
      button: 'w-[36px] h-[36px] sm:w-[40px] sm:h-[40px]',
      iconSize: 16,
    },
    lg: {
      button: 'w-[44px] h-[44px] sm:w-[48px] sm:h-[48px]',
      iconSize: 19,
    },
  }[size];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={defaultTitle}
      aria-label={defaultTitle}
      className={`
        rounded-full bg-black/35 hover:bg-black/55 active:bg-black/75 
        text-white/75 hover:text-white active:text-white
        backdrop-blur-2xl border border-white/[0.12] hover:border-white/25
        shadow-[0_4px_20px_rgba(0,0,0,0.35)] flex items-center justify-center 
        transition-all duration-200 cursor-pointer select-none 
        hover:scale-105 active:scale-90 disabled:opacity-0 disabled:pointer-events-none
        ${sizeStyles.button}
        ${className}
      `}
    >
      {isRight ? (
        <ChevronRight size={sizeStyles.iconSize} strokeWidth={2.4} className="ml-0.5" />
      ) : (
        <ChevronLeft size={sizeStyles.iconSize} strokeWidth={2.4} className="-ml-0.5" />
      )}
    </button>
  );
}
