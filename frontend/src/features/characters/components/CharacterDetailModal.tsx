import { useState, useRef, useEffect, type MouseEvent } from 'react'
import { X, Heart, Share, Eye, MessageCircle, Clock, Lock, MapPin, Sparkles } from 'lucide-react'
import SliderNavButton from './SliderNavButton'
import type { CharacterDetailModalProps } from '../types'
import { DEFAULT_CHARACTER_STATS, DEFAULT_CHARACTER_EVENTS } from '../mockData'

export type { CharacterDetailModalProps }

/**
 * CharacterDetailModal: หน้าต่าง Pop-up แสดงรายละเอียดตัวละคร
 * ปรับปรุงตามความต้องการล่าสุด:
 * - ส่วนซ้าย: การ์ด 9:16 ขนาดใหญ่เต็มตา + รูปย่อยลอยล่างการ์ด (hover ถึงจะขึ้น) + กล่อง Creator
 * - ส่วนขวา:
 *   - ชื่อตัวละคร, ปุ่ม Heart / Share, แถบสถิติ (ตา, บับเบิ้ล, เวลา)
 *   - กล่องย่อยสี่เหลี่ยมแสดงข้อความสเตตัสของตัวละคร (เหมือนโพสต์ Facebook / Status ในแอปแชท)
 *   - แถบ Hashtags ทรงแคปซูล Dark Pill
 *   - กล่องเนื้อหาเริ่มต้นของเรื่อง (YouTube-style Description Box บนพื้นหลังสีเทาหลัก #1D1D1F) พร้อมปุ่มดูเพิ่มเติมสีชมพู #EF264C
 *   - ปุ่มแชทสีชมพู sticky เฉพาะฝั่งขวา
 */
export default function CharacterDetailModal({
  isOpen,
  character,
  onClose,
  onStartChat,
  onLoadGame,
}: CharacterDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [prevCharId, setPrevCharId] = useState<string | number | undefined>(character?.id);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isStoryExpanded, setIsStoryExpanded] = useState<boolean>(false);

  // ควบคุมการเลื่อนสไลเดอร์ของบทเหตุการณ์ (Events Slider)
  const eventsSliderRef = useRef<HTMLDivElement>(null);
  const [canScrollEventsLeft, setCanScrollEventsLeft] = useState<boolean>(false);
  const [canScrollEventsRight, setCanScrollEventsRight] = useState<boolean>(true);

  const checkEventsScroll = () => {
    if (eventsSliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = eventsSliderRef.current;
      setCanScrollEventsLeft(scrollLeft > 10);
      setCanScrollEventsRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const handleEventsScroll = (direction: 'left' | 'right') => {
    if (eventsSliderRef.current) {
      const scrollAmount = eventsSliderRef.current.clientWidth * 0.75;
      eventsSliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // รีเซ็ตการเลือกรูปและสถานะเมื่อเปลี่ยนตัวละคร
  if (character && character.id !== prevCharId) {
    setPrevCharId(character.id);
    setSelectedImageIndex(0);
    setIsFollowing(character.creator?.isFollowed ?? false);
    setIsFavorite(false);
    setIsStoryExpanded(false);
  }

  // รองรับการกดปุ่ม Escape เพื่อปิด Pop-up
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // ตรวจสอบสถานะการเลื่อนเมื่อเปิด Pop-up
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        checkEventsScroll();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen, character?.id]);

  if (!isOpen || !character) return null;

  // คลังรูปภาพ: ดึงจาก character.images หากมี หรือใช้ character.image เป็นรูปเดี่ยว
  const imageList = character.images && character.images.length > 0 
    ? character.images 
    : [character.image];

  const currentImage = imageList[selectedImageIndex] || character.image;
  const hasMultipleImages = imageList.length > 1;

  // ข้อมูล Creator พร้อมค่าเริ่มต้น
  const creatorName = character.creator?.name || `Studio ${character.name.split(' ')[0]}`;
  const creatorSubscribers = character.creator?.subscribers || '125K ผู้ติดตาม';
  const creatorInteractions = character.creator?.totalInteractions || '1.8M การตอบโต้';
  const creatorAvatar = character.creator?.avatar || character.name.charAt(0);

  // ข้อมูล Hashtags และเวลาอัปเดต (ตามรูปเรฟ)
  const hashtags = character.hashtags || [
    '#ยอดนิยม',
    '#โรแมนติก',
    '#ความรัก',
    '#ดราม่า',
    '#อนิเมะ'
  ];
  const updatedTime = character.updatedTime || 'เมื่อสักครู่นี้เอง';

  // ข้อมูลเนื้อหาเริ่มต้นของเรื่อง (Synopsis / จุดเริ่มต้นของเรื่องราว & สิ่งที่จะได้พบ)
  const defaultStory = `เรื่องราวเริ่มต้นขึ้นเมื่อคุณและ ${character.name} ได้พบกันในสถานการณ์ที่ไม่คาดฝัน ทุกลมหายใจและทุกการตัดสินใจของคุณจะมีผลต่อความรู้สึกที่เธอมีให้...\n\nสิ่งที่คุณจะได้พบในเรื่องนี้:\n• บทสนทนาที่มีมิติสมจริงตามอารมณ์และบุคลิกเฉพาะตัว\n• จุดพลิกผันของความสัมพันธ์ตามคำตอบที่คุณเลือก\n• ปลดล็อกเรื่องราวและความลับที่ซ่อนอยู่ในใจของตัวละคร`;
  const storyContent = character.storyIntroduction || defaultStory;

  // ข้อมูลค่าสเตตัสหลัก 8 ค่า (ลดจาก 12 ค่าเดิมให้กระชับและเข้ากับระบบ)
  const characterStats = character.stats || DEFAULT_CHARACTER_STATS;

  // ข้อมูลเควส / บทเหตุการณ์พิเศษ (Events & Scenarios)
  // ให้รูปแรกเป็นรูปที่ปลดล็อกแล้ว (ใช้รูปตัวละครคมชัด) ส่วนรูปต่อๆ ไปเป็นรูปเควสที่เบลอและติดกุญแจ
  const rawEvents = character.events || DEFAULT_CHARACTER_EVENTS;
  const characterEvents = rawEvents.map((ev, idx) => 
    idx === 0 ? { ...ev, isUnlocked: true, image: character.image } : ev
  );
  const unlockedCount = characterEvents.filter(e => e.isUnlocked).length;
  const totalEvents = characterEvents.length;
  const progressPercent = Math.round((unlockedCount / totalEvents) * 100);

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: character.name,
        text: character.quote,
        url: window.location.href,
      }).catch(() => {});
    }
  };

  const handleStartChat = () => {
    onClose();
    if (character) {
      onStartChat?.(character);
    }
  };

  const handleLoadGame = () => {
    onClose();
    if (character) {
      if (onLoadGame) {
        onLoadGame(character);
      } else {
        onStartChat?.(character);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={handleBackdropClick}
    >
      {/* กล่อง Pop-up Shell คลุมด้วยกระจกฝ้ามืดมนและขอบมนตามสไตล์การ์ดตัวละครในหน้าหลัก (ขยายขนาดหน้าต่างให้ใหญ่ขึ้น) */}
      <div className="relative max-w-5xl lg:max-w-6xl w-full max-h-[92vh] overflow-y-auto no-scrollbar bg-[#121214]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 lg:p-10 pb-0 sm:pb-0 lg:pb-0 shadow-2xl flex flex-col">
        
        {/* ปุ่มปิด (X Button) มุมขวาบน */}
        <button
          type="button"
          onClick={onClose}
          title="ปิดหน้าต่าง"
          className="absolute top-4 right-4 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-white/15 text-app-secondary hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer select-none"
        >
          <X size={18} strokeWidth={2.2} />
        </button>

        {/* เลย์เอาต์แบ่งซ้าย-ขวา */}
        <div className="flex flex-col md:flex-row items-stretch gap-6 lg:gap-8 xl:gap-10 w-full">
          
          {/* ============================================================== */}
          {/* ฝั่งซ้าย: การ์ดรูปตัวละคร 9:16 ขนาดใหญ่เต็มตา + รูปย่อยลอยบนการ์ดด้านล่าง + กล่อง Creator */}
          {/* ============================================================== */}
          <div className="w-full md:w-[380px] lg:w-[440px] xl:w-[470px] flex flex-col shrink-0 pb-6 sm:pb-8 lg:pb-10">
            
            {/* การ์ดรูปตัวละครอัตราส่วน 9:16 ขนาดใหญ่เต็มตา พร้อมเทคนิคเงาเฟดดำจากด้านล่างแบบเดียวกับหน้าแรก */}
            <div className="w-full aspect-[9/16] rounded-2xl overflow-hidden relative bg-[#1c1c1e] border border-white/10 shadow-2xl group">
              <img 
                src={currentImage} 
                alt={character.name} 
                className="w-full h-full object-cover transition-all duration-300"
                referrerPolicy="no-referrer"
              />

              {/* ป้ายแท็ก 'ใหม่' มุมบนซ้ายของการ์ด */}
              {character.badge && (
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#EF264C]/60 shadow-[0_0_12px_rgba(239,38,76,0.3)] select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C] shadow-[0_0_8px_#EF264C] animate-pulse" />
                  <span className="text-[#EF264C] text-[11px] font-bold tracking-wider leading-none">
                    {character.badge}
                  </span>
                </div>
              )}

              {/* เทคนิคเฟดการ์ดจากด้านล่างแบบเดียวกับในการ์ดหน้าแรก (Dark Gradient Overlay) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent via-30% pointer-events-none" />

              {/* รูปเล็กๆ ลอยอยู่บนการ์ดด้านล่าง (แสดงขึ้นมาเฉพาะตอน Hover ที่การ์ด และไม่มีแถบพื้นหลังทึบ) */}
              {hasMultipleImages && (
                <div className="absolute bottom-3.5 inset-x-3.5 z-20 flex items-center justify-center sm:justify-start gap-2.5 overflow-x-auto no-scrollbar opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 ease-out">
                  {imageList.map((img, idx) => {
                    const isSelected = selectedImageIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex(idx);
                        }}
                        className={`
                          w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border transition-all cursor-pointer relative flex-shrink-0 shadow-xl
                          ${isSelected 
                            ? 'border-[#EF264C] ring-2 ring-[#EF264C]/60 scale-105 shadow-[0_0_14px_rgba(239,38,76,0.6)]' 
                            : 'border-white/30 hover:border-white/70 opacity-80 hover:opacity-100 hover:scale-105'}
                        `}
                      >
                        <img 
                          src={img} 
                          alt={`${character.name} ${idx + 1}`} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* กล่อง Creator ใต้รูป: สไตล์ Twitter "Who to follow" แบบมินิมอล ดิบ สะอาดตา */}
            <div className="w-full mt-3.5 p-3 rounded-2xl bg-transparent border border-[#2F3336] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* รูปกลมๆ ของช่อง */}
                <div className="w-9 h-9 rounded-full shrink-0 bg-[#2D2D32] border border-[#2F3336] flex items-center justify-center font-bold text-app-primary text-xs">
                  {creatorAvatar}
                </div>
                {/* ชื่อช่อง และ ผู้ติดตาม · จำนวนการตอบโต้ */}
                <div className="min-w-0 flex flex-col">
                  <span className="font-bold text-[13.5px] text-[#F2F2F5] truncate leading-tight hover:underline cursor-pointer">
                    {creatorName}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11.5px] text-[#ACACB2] mt-0.5 truncate">
                    <span>{creatorSubscribers}</span>
                    <span className="text-white/20 font-normal">·</span>
                    <span>{creatorInteractions}</span>
                  </div>
                </div>
              </div>

              {/* ปุ่มติดตาม สไตล์ Twitter (Pill Button สีขาวคมชัด) */}
              <button
                type="button"
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-bold transition-all duration-150 cursor-pointer select-none shrink-0 ${
                  isFollowing 
                    ? 'bg-transparent text-[#F2F2F5] border border-[#2F3336] hover:bg-white/10' 
                    : 'bg-white hover:bg-white/90 text-black shadow-sm active:scale-95'
                }`}
              >
                {isFollowing ? 'กำลังติดตาม' : 'ติดตาม'}
              </button>
            </div>

          </div>

          {/* ============================================================== */}
          {/* ฝั่งขวา: ชื่อตัวละคร, สถิติ, กล่องสเตตัสสี่เหลี่ยม, Hashtags, ปุ่มแชท */}
          {/* ============================================================== */}
          <div className="flex-1 flex flex-col justify-between min-w-0 pt-1 sm:pt-2 w-full">
            
            {/* กลุ่มเนื้อหาข้อมูลด้านบนของฝั่งขวา */}
            <div>
              {/* แถวบน: ชื่อตัวละคร + ปุ่ม Heart & Share ต่อท้ายชื่อแบบไร้กรอบ ขนาดสมดุล */}
              <div className="flex items-center flex-wrap gap-x-3.5 gap-y-2">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-black text-app-primary tracking-tight leading-tight">
                  {character.name}
                </h2>

                {/* ปุ่ม Action: หัวใจ & แชร์ ต่อท้ายชื่อตัวละคร ไม่มีกรอบ ขนาดใหญ่สมดุลกับหัวข้อ */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* ปุ่มหัวใจ */}
                  <button
                    type="button"
                    onClick={() => setIsFavorite(!isFavorite)}
                    title="ถูกใจ"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all cursor-pointer hover:bg-white/[0.08] active:scale-90"
                  >
                    <Heart 
                      size={28} 
                      strokeWidth={2.2} 
                      className={`transition-colors ${
                        isFavorite 
                          ? 'fill-[#EF264C] text-[#EF264C] drop-shadow-[0_0_8px_rgba(239,38,76,0.5)]' 
                          : 'text-app-secondary hover:text-white'
                      }`} 
                    />
                  </button>

                  {/* ปุ่มแชร์: ไอคอนลูกศรแชร์ (Share) สีชมพูหลัก ไม่มีกรอบ */}
                  <button
                    type="button"
                    onClick={handleShare}
                    title="แชร์ตัวละคร"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all cursor-pointer hover:bg-white/[0.08] active:scale-90"
                  >
                    <Share size={26} strokeWidth={2.2} className="text-[#EF264C] hover:text-[#ff3b61] transition-colors" />
                  </button>
                </div>
              </div>

              {/* ข้อความสเตตัสตัวละคร (ข้อความรอง สไตล์ Editorial / Fashion E-commerce ขนาดเด่นชัดเจนขึ้น) */}
              <p className="mt-2.5 sm:mt-3 text-[18px] sm:text-[19.5px] lg:text-[21px] text-[#ACACB2] leading-relaxed font-normal">
                {character.quote}
              </p>

              {/* แถบสถิติ: 4,010,000 ครั้ง · 130,000 · 10 นาทีที่แล้ว (น้ำหนัก 400 font-normal) */}
              <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 mt-3 text-[13px] sm:text-[14px] text-[#ACACB2] font-normal">
                <span className="flex items-center gap-1.5">
                  <Eye size={16} strokeWidth={1.8} className="flex-shrink-0 text-[#ACACB2]" />
                  <span>{character.views} ครั้ง</span>
                </span>
                <span className="text-white/20">·</span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle size={16} strokeWidth={1.8} className="flex-shrink-0 text-[#ACACB2]" />
                  <span>{character.messages}</span>
                </span>
                <span className="text-white/20">·</span>
                <span className="flex items-center gap-1.5">
                  <Clock size={16} strokeWidth={1.8} className="flex-shrink-0 text-[#ACACB2]" />
                  <span>{updatedTime}</span>
                </span>
              </div>

              {/* ชุด Hashtags ทรงแคปซูล Pill ขนาดปกติ (px-2.5 py-1 text-[11.5px] sm:text-[12px]) กลืนกับพื้นหลัง ไร้กรอบ */}
              <div className="flex flex-wrap gap-2 mt-3.5 sm:mt-4">
                {hashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full bg-[#18181b] text-[11.5px] sm:text-[12px] text-[#ACACB2] hover:text-[#EF264C] hover:underline transition-colors cursor-pointer select-none"
                  >
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>

              {/* กล่องจุดเริ่มต้นของเรื่องราว (บนพื้นหลังสีเทาหลัก #1D1D1F ไม่มีเส้นขอบ) */}
              <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-[#1D1D1F] transition-all duration-300">
                <h3 className="text-[17px] sm:text-[18px] font-bold text-[#F2F2F5] tracking-tight mb-2">
                  จุดเริ่มต้นของเรื่องราว
                </h3>
                <div className={`text-[13px] sm:text-[13.5px] text-[#F2F2F5] leading-relaxed whitespace-pre-line font-normal ${!isStoryExpanded ? 'line-clamp-2' : ''}`}>
                  {storyContent}
                </div>
                <button
                  type="button"
                  onClick={() => setIsStoryExpanded(!isStoryExpanded)}
                  className="mt-2 text-[13px] sm:text-[13.5px] font-semibold text-[#EF264C] hover:underline cursor-pointer select-none inline-block"
                >
                  {isStoryExpanded ? 'แสดงน้อยลง' : '...ดูเพิ่มเติม'}
                </button>
              </div>

              {/* กล่อง 3: สเตตัส (หัวข้อสไตล์ X ชัดเจน ไร้ไอคอนรุงรัง ดูแล้วรู้ทันที) */}
              <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-transparent border border-[#2F3336]">
                <h3 className="text-[17px] sm:text-[18px] font-bold text-[#F2F2F5] tracking-tight mb-3.5">
                  สเตตัส
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {characterStats.map((stat) => (
                    <div key={stat.key} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[12px] sm:text-[12.5px]">
                        <span className="text-[#F2F2F5] font-medium truncate">
                          {stat.label}
                        </span>
                        <span className="text-[#ACACB2] font-semibold text-[11.5px] ml-2 shrink-0">
                          {stat.value}/10
                        </span>
                      </div>
                      {/* หลอดพลังสไตล์ Minimal Raw ขนาด 3px เรียบคม */}
                      <div className="w-full h-[3px] rounded-full bg-[#2F3336] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#EF264C] transition-all duration-500 ease-out"
                          style={{ width: `${(stat.value / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* กล่อง 4: บทเหตุการณ์ (Events - สไตล์ X หัวข้อเรียบหรู พร้อมสถิติปลดล็อก) */}
              <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-transparent border border-[#2F3336]">
                <div className="flex items-baseline justify-between gap-2 mb-2.5">
                  <h3 className="text-[17px] sm:text-[18px] font-bold text-[#F2F2F5] tracking-tight">
                    บทเหตุการณ์
                  </h3>
                  <span className="text-[12px] sm:text-[12.5px] font-medium text-[#ACACB2]">
                    ปลดล็อกแล้ว {unlockedCount}/{totalEvents}
                  </span>
                </div>

                {/* หลอดความคืบหน้ารวม สไตล์ Minimal Raw 3px */}
                <div className="w-full h-[3px] rounded-full bg-[#2F3336] overflow-hidden mb-3.5">
                  <div 
                    className="h-full rounded-full bg-[#EF264C] transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* แถวการ์ดบทเหตุการณ์ พร้อมปุ่มเลื่อน < และ > (SliderNavButton) */}
                <div className="relative group/events">
                  {/* ปุ่มเลื่อนซ้าย < */}
                  {canScrollEventsLeft && (
                    <SliderNavButton
                      direction="left"
                      size="sm"
                      onClick={() => handleEventsScroll('left')}
                      className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-20"
                    />
                  )}

                  {/* แถวการ์ดบทเหตุการณ์ (เลื่อนแนวนอนแบบมินิมอล) */}
                  <div 
                    ref={eventsSliderRef}
                    onScroll={checkEventsScroll}
                    className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 scroll-smooth"
                  >
                    {characterEvents.map((event, idx) => (
                      <div
                        key={event.id || idx}
                        className={`
                          w-[120px] sm:w-[130px] shrink-0 aspect-[9/13] rounded-xl overflow-hidden relative border transition-all duration-200 select-none group/card
                          ${event.isUnlocked 
                            ? 'border-[#2F3336] hover:border-[#EF264C]/70 shadow-md cursor-pointer' 
                            : 'border-[#2F3336]/60 bg-black/40 opacity-90'}
                        `}
                      >
                        {/* รูปภาพพื้นหลัง */}
                        <img
                          src={event.image}
                          alt={event.title}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className={`w-full h-full object-cover transition-all duration-200 ${
                            event.isUnlocked 
                              ? 'group-hover/card:scale-105' 
                              : 'blur-[9px] scale-110 opacity-35 grayscale-[20%]'
                          }`}
                        />

                        {/* เงามืดด้านบนสำหรับชื่อสถานที่และเควส */}
                        <div className="absolute inset-x-0 top-0 pt-2 pb-4 px-2 bg-gradient-to-b from-black/85 via-black/40 to-transparent z-10 pointer-events-none">
                          <div className="flex items-center gap-1 text-[10.5px] text-[#F2F2F5] font-medium leading-none truncate">
                            <MapPin size={11} className="text-[#EF264C] shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                          <p className="text-[10px] text-[#ACACB2] truncate mt-1 leading-tight">
                            {event.title}
                          </p>
                        </div>

                        {/* สถานะตรงกลาง / ด้านล่างของการ์ด */}
                        {event.isUnlocked ? (
                          <div className="absolute bottom-2 inset-x-2 z-10 py-0.5 px-1 rounded-md bg-black/70 border border-[#EF264C]/40 text-[9.5px] font-bold text-[#F2F2F5] flex items-center justify-center gap-1">
                            <Sparkles size={10} className="text-[#EF264C]" />
                            <span>ปลดล็อกแล้ว</span>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 z-10 p-2 text-center pointer-events-none">
                            <div className="w-7 h-7 rounded-full bg-black/70 border border-[#2F3336] flex items-center justify-center">
                              <Lock size={13} className="text-white/70" />
                            </div>
                            <span className="text-[10px] font-medium text-white/50">
                              ล็อค
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* ปุ่มเลื่อนขวา > */}
                  {canScrollEventsRight && (
                    <SliderNavButton
                      direction="right"
                      size="sm"
                      onClick={() => handleEventsScroll('right')}
                      className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-20"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* พื้นหลังสีดำ Sticky ด้านล่างสุดเฉพาะฝั่งขวา ติดขอบล่างของกล่อง Pop-up สไตล์ Fashion E-commerce: ปุ่มแชท + ปุ่ม Load Game ทรงกลม */}
            <div className="sticky bottom-0 z-20 -ml-6 md:ml-0 pl-6 md:pl-0 -mr-6 sm:-mr-8 lg:-mr-10 pr-6 sm:pr-8 lg:pr-10 pt-6 pb-3.5 sm:pb-4 mt-6 bg-gradient-to-t from-black from-70% via-black/95 to-transparent rounded-br-3xl flex items-center gap-2.5 sm:gap-3">
              {/* ปุ่มแชทหลัก */}
              <button
                type="button"
                onClick={handleStartChat}
                className="flex-1 py-3.5 px-6 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white font-bold text-[16px] sm:text-[17px] flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer select-none active:scale-[0.98]"
              >
                <MessageCircle size={20} strokeWidth={2.2} className="fill-white/20" />
                <span>แชท</span>
              </button>

              {/* ปุ่ม Load Game: ทรงกลม สไตล์หลัก ตัวหนังสือสีขาว ขอบเทา ไม่มีพื้นหลัง */}
              <button
                type="button"
                onClick={handleLoadGame}
                title="โหลดเกม (Load Game)"
                className="w-[52px] h-[52px] rounded-full shrink-0 border border-[#2F3336] hover:border-white/35 bg-transparent hover:bg-white/[0.08] text-[#F2F2F5] flex items-center justify-center transition-all duration-200 cursor-pointer select-none active:scale-95 group"
              >
                <span className="text-[11px] sm:text-[11.5px] font-bold leading-[1.15] text-center text-[#F2F2F5] tracking-tight group-hover:text-white transition-colors">
                  Load<br />Game
                </span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
