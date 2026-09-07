import type { SliderNavButtonProps } from '../types'

export type { SliderNavButtonProps }

/**
 * SliderNavButton: คอมโพเนนต์ปุ่มลูกศรเลื่อนสไลเดอร์ (< และ >)
 * สไตล์ Apple Dark Glassmorphism ตามแบบฉบับการ์ดหน้าแรก
 * รองรับการปรับขนาด (sm, md, lg) และทิศทาง (left, right)
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

  // สัดส่วนขนาดปุ่มและขนาดไอคอนตามโหมด
  const sizeStyles = {
    sm: {
      button: 'w-[32px] h-[32px] sm:w-[36px] sm:h-[36px]',
      icon: 'w-[14px] h-[14px] sm:w-[15px] sm:h-[15px]',
      stroke: '3.2',
    },
    md: {
      button: 'w-[52px] h-[52px] sm:w-[56px] sm:h-[56px]',
      icon: 'w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]',
      stroke: '3.2',
    },
    lg: {
      button: 'w-[60px] h-[60px] sm:w-[64px] sm:h-[64px]',
      icon: 'w-[24px] h-[24px] sm:w-[26px] sm:h-[26px]',
      stroke: '3.4',
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
        rounded-full bg-[#222226]/80 hover:bg-[#2C2C32]/95 text-app-primary 
        backdrop-blur-2xl border border-white/10 flex items-center justify-center 
        transition-all duration-200 cursor-pointer select-none 
        hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none
        shadow-[0_4px_16px_rgba(0,0,0,0.5)]
        ${sizeStyles.button}
        ${className}
      `}
    >
      <svg
        className={`text-app-primary ${sizeStyles.icon} ${isRight ? 'ml-0.5' : '-ml-0.5'}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={sizeStyles.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isRight ? (
          <polyline points="9 3.5 16.5 12 9 20.5" />
        ) : (
          <polyline points="15 3.5 7.5 12 15 20.5" />
        )}
      </svg>
    </button>
  );
}
