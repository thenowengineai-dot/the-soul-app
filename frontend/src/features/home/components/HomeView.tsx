import { useState, useRef, useEffect } from 'react'
import { 
  ChevronDown, 
  TrendingUp, 
  Flame, 
  Clock, 
  type LucideIcon 
} from 'lucide-react'
import AnnouncementBanner from './AnnouncementBanner'
import { 
  CharacterSliderRow, 
  CharacterDetailModal, 
  MOCK_CHARACTERS, 
  CATEGORIES, 
  type Character 
} from '../../characters'
import type { HomeViewProps, GenderType, SortType } from '../types'

export type { HomeViewProps }

interface GenderOption {
  id: GenderType
  label: string
  fullLabel?: string
}

interface SortOption {
  id: NonNullable<SortType>
  label: string
  icon: LucideIcon
}

const GENDER_OPTIONS: GenderOption[] = [
  { id: 'all', label: 'ทั้งหมด', fullLabel: 'ทั้งหมด' },
  { id: 'male', label: 'ชาย', fullLabel: 'ชาย (Male)' },
  { id: 'female', label: 'หญิง', fullLabel: 'หญิง (Female)' },
  { id: 'non-binary', label: 'นอนไบนารี่', fullLabel: 'นอนไบนารี่ (Non-binary)' },
];

const SORT_OPTIONS: SortOption[] = [
  { id: 'trending', label: 'กำลังมาแรง', icon: TrendingUp },
  { id: 'popular', label: 'ยอดนิยม', icon: Flame },
  { id: 'recent', label: 'ล่าสุด', icon: Clock },
];

function HomeView({ 
  onNavigateToChat, 
}: HomeViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [selectedGender, setSelectedGender] = useState<GenderType>('all');
  const [activeSort, setActiveSort] = useState<SortType>(null);
  const [isGenderOpen, setIsGenderOpen] = useState<boolean>(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const genderDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside listener for gender dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (genderDropdownRef.current && !genderDropdownRef.current.contains(event.target as Node)) {
        setIsGenderOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCardClick = (character: Character) => {
    setSelectedCharacter(character);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto no-scrollbar relative z-10 bg-[rgb(13,13,13)] backdrop-blur-xl">
      {/* Sticky Pill Bar: ฝั่งซ้าย Filter & Sort Controls | เส้นแบ่ง | ฝั่งขวา Category Pills */}
      <div className="sticky top-0 z-20 bg-[rgb(13,13,13)]/95 backdrop-blur-xl border-b border-white/[0.06] flex items-center gap-3 px-4 sm:px-6 py-2.5 w-full transition-all duration-300 select-none">
        
        {/* ฝั่งซ้าย: Controls & Sorting (เพศ, กำลังมาแรง, ยอดนิยม, ล่าสุด สไตล์ขอบสีแบรนด์หลัก #EF264C) */}
        <div className="flex-shrink-0 flex items-center gap-2">
            
            {/* 1. ปุ่ม Gender Dropdown (ขอบสีแบรนด์ ตัวหนังสือสีขาว ไม่มีไอคอน) */}
            <div className="relative" ref={genderDropdownRef}>
              <button
                type="button"
                onClick={() => setIsGenderOpen(!isGenderOpen)}
                className={`px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 text-[13px] font-medium cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  selectedGender !== 'all' || isGenderOpen
                    ? 'border-[#EF264C] bg-[#EF264C]/20 text-app-primary shadow-[0_0_12px_rgba(239,38,76,0.25)] font-semibold'
                    : 'border-[#EF264C]/40 hover:border-[#EF264C]/80 bg-[#EF264C]/5 hover:bg-[#EF264C]/10 text-app-primary'
                }`}
              >
                <span>เพศ: {GENDER_OPTIONS.find(g => g.id === selectedGender)?.label}</span>
                <ChevronDown 
                  size={14} 
                  className={`text-app-secondary transition-transform duration-200 ${isGenderOpen ? 'rotate-180 text-app-primary' : ''}`} 
                />
              </button>

              {/* เมนู Dropdown ลอยลงมา (Glassmorphism Panel) */}
              {isGenderOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-[#18181B]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col gap-0.5 animate-fadeIn">
                  {GENDER_OPTIONS.map(option => {
                    const isSelected = selectedGender === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setSelectedGender(option.id);
                          setIsGenderOpen(false);
                        }}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-[13px] transition-colors cursor-pointer text-left ${
                          isSelected
                            ? 'bg-[#EF264C]/15 text-app-primary font-medium'
                            : 'text-app-secondary hover:text-app-primary hover:bg-white/10'
                        }`}
                      >
                        <span>{option.fullLabel || option.label}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. ปุ่ม Sort แต่ละปุ่มแยกกัน (Trending, Popular, Recent) สไตล์ขอบสีแบรนด์ ตัวหนังสือขาว ไอคอนเวกเตอร์ Lucide */}
            {SORT_OPTIONS.map(sort => {
              const isActive = activeSort === sort.id;
              const Icon = sort.icon;
              return (
                <button
                  key={sort.id}
                  type="button"
                  onClick={() => setActiveSort(isActive ? null : sort.id)}
                  className={`px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 text-[13px] font-medium cursor-pointer whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? 'border-[#EF264C] bg-[#EF264C]/20 text-app-primary font-semibold shadow-[0_0_12px_rgba(239,38,76,0.25)]'
                      : 'border-[#EF264C]/40 hover:border-[#EF264C]/80 bg-[#EF264C]/5 hover:bg-[#EF264C]/10 text-app-primary'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-[#EF264C]' : 'text-app-primary'} />
                  <span>{sort.label}</span>
                </button>
              );
            })}

          </div>

          {/* เส้นแบ่งโซนแนวตั้ง (Vertical Hairline Divider |) */}
          <div className="w-[1px] h-4 bg-white/20 shrink-0" />

          {/* ฝั่งขวา: Category Pills (เลื่อนซ้าย-ขวาได้อิสระ) */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar min-w-0">
            {CATEGORIES.map(category => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    px-3.5 py-1 rounded-full text-[13px] font-medium transition-all whitespace-nowrap cursor-pointer flex-shrink-0
                    ${isActive 
                      ? 'bg-white text-black font-semibold shadow-md' 
                      : 'bg-white/[0.06] hover:bg-white/[0.12] text-app-primary backdrop-blur-md border border-white/[0.08] hover:border-white/20'}
                  `}
                >
                  {category}
                </button>
              );
            })}
          </div>

        </div>

      {/* Top Announcement & Promo Banners (แบนเนอร์เดี่ยวจัดกึ่งกลาง พร้อมระบบ Auto-Fade สลับสีสไตล์เรฟ) */}
      <AnnouncementBanner />

      {/* Character Cards Section: ปรับระยะห่างด้านบนให้พอดีกับ Banner ด้านบน */}
      <div className="pt-6 sm:pt-7 w-full">

        {/* Apple-Style Sections: แยกเป็นแถวตามรูป พร้อมหัวข้อตามสไตล์ Apple */}
        <div className="flex flex-col gap-10 sm:gap-12 lg:gap-14 pb-16">
          {/* Row 1: สินค้าใหม่ ✨ */}
          <CharacterSliderRow 
            title="สินค้าใหม่"
            emoji="✨"
            subtitle="แชทบอทล่าสุดที่พร้อมพูดคุยกับคุณ"
            characters={MOCK_CHARACTERS.slice(0, 8)}
            onCardClick={handleCardClick}
          />

          {/* Row 2: เทรนด์ประจำสัปดาห์ ⚡ */}
          <CharacterSliderRow 
            title="เทรนด์ประจำสัปดาห์"
            emoji="⚡"
            subtitle="ตัวละครยอดนิยมที่มีผู้สนทนามากที่สุด"
            characters={MOCK_CHARACTERS.slice(8, 16)}
            onCardClick={handleCardClick}
          />

          {/* Row 3: แนะนำสำหรับคุณ 🔥 */}
          <CharacterSliderRow 
            title="แนะนำสำหรับคุณ" 
            emoji="🔥"
            subtitle="คัดสรรพิเศษเพื่อบทสนทนาที่ตรงใจคุณ"
            characters={[
              { ...MOCK_CHARACTERS[13], id: 'rec-1' },
              { ...MOCK_CHARACTERS[14], id: 'rec-2' },
              { ...MOCK_CHARACTERS[11], id: 'rec-3' },
              { ...MOCK_CHARACTERS[7],  id: 'rec-4' },
              { ...MOCK_CHARACTERS[4],  id: 'rec-5' },
              { ...MOCK_CHARACTERS[0],  id: 'rec-6' },
              { ...MOCK_CHARACTERS[9],  id: 'rec-7' },
              { ...MOCK_CHARACTERS[15], id: 'rec-8' }
            ]}
            onCardClick={handleCardClick}
          />
        </div>
      </div>

      {/* Pop-up หน้ารายละเอียดตัวละคร (Character Detail Modal) */}
      <CharacterDetailModal
        isOpen={!!selectedCharacter}
        character={selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
        onStartChat={() => {
          setSelectedCharacter(null);
          onNavigateToChat?.();
        }}
        onLoadGame={() => {
          setSelectedCharacter(null);
          onNavigateToChat?.();
        }}
      />
    </div>
  );
}

export default HomeView;
