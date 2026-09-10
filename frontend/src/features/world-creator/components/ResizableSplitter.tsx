import { useState, useEffect, useCallback } from 'react';
import { GripVertical } from 'lucide-react';

interface ResizableSplitterProps {
  onResize: (newWidth: number) => void;
  onReset: () => void;
  onCollapse: () => void;
  minWidth?: number;
  maxWidth?: number;
  side?: 'left' | 'right';
  leftOffset?: number;
  getLeftOffset?: () => number;
  collapseThreshold?: number;
  children?: React.ReactNode;
}

export default function ResizableSplitter({
  onResize,
  onReset,
  onCollapse,
  minWidth = 320,
  maxWidth = 800,
  side = 'right',
  leftOffset,
  getLeftOffset,
  collapseThreshold,
  children,
}: ResizableSplitterProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onReset();
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      let newWidth: number;
      if (side === 'left') {
        const baseOffset = getLeftOffset ? getLeftOffset() : (leftOffset ?? 0);
        newWidth = e.clientX - baseOffset;
      } else {
        newWidth = window.innerWidth - e.clientX;
      }

      const threshold = collapseThreshold ?? (side === 'left' ? 160 : 180);

      // ถ้าผู้ใช้ลากไปชิดขอบมากๆ ให้พับเก็บหน้าต่างอัตโนมัติ
      if (newWidth < threshold) {
        onCollapse();
        setIsDragging(false);
        return;
      }

      // จำกัดความกว้างให้อยู่ในขอบเขตที่ปลอดภัย
      const boundedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      onResize(boundedWidth);
    },
    [isDragging, side, leftOffset, getLeftOffset, collapseThreshold, minWidth, maxWidth, onResize, onCollapse]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      title="คลิกลากเพื่อปรับขนาดหน้าต่าง หรือดับเบิลคลิกเพื่อรีเซ็ตขนาด"
      className={`relative w-[1px] h-full shrink-0 cursor-col-resize transition-colors select-none z-30 group ${
        isDragging ? 'bg-white/50' : 'bg-[#2F3336] hover:bg-white/30'
      }`}
    >
      {/* Invisible wider hit area (17px) for effortless cursor catching */}
      <div className="absolute inset-y-0 -left-2 -right-2 cursor-col-resize" />

      {/* Prominent Tactile Grab Handle (ลอยเด่นอยู่กึ่งกลางเส้น รู้ชัดเจนทันทีว่าลากได้) */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[18px] h-[52px] rounded-full flex items-center justify-center transition-all duration-150 cursor-col-resize shadow-[0_2px_14px_rgba(0,0,0,0.85)] ${
          isDragging
            ? 'scale-110 bg-[#242428] border border-white/70 text-white ring-2 ring-white/20 shadow-2xl'
            : 'bg-[#18181B] border border-[#3E3E44] text-[#ACACB2] group-hover:border-white/50 group-hover:text-white group-hover:scale-105 group-hover:bg-[#222226]'
        }`}
      >
        <GripVertical size={13} strokeWidth={2.4} />
      </div>

      {/* Children elements (เช่น Option 2 Toggle Button บนเส้นคั่น) */}
      {children && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute top-[104px] left-1/2 -translate-x-1/2 z-40"
        >
          {children}
        </div>
      )}
    </div>
  );
}
