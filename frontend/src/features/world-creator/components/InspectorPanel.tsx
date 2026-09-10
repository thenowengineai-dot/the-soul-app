import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import {
  PanelRightClose,
  UserRound,
  Globe,
  Pencil,
  Check,
  X,
  Flame,
  Sparkles,
  Zap,
  BookOpen,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Layers,
  Heart,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import type { CreatorMode, VaultDraft, PassivePerk, WorldScenario } from '../types';
import ScenarioEngineCard from './ScenarioEngineCard';
import { DEFAULT_WORLD_SCENARIO } from '../mockData';

const CHARACTER_SUBTOPICS = [
  { id: 'psychology', label: 'จิตวิทยา' },
  { id: 'appearance', label: 'สรีระ & ภาษากาย' },
  { id: 'stats', label: 'สเตตัส & แรงขับ' },
  { id: 'perks', label: 'สกิล & รสนิยม' },
  { id: 'lore', label: 'ปูมหลัง & วิวัฒนาการ' },
] as const;

const WORLD_SUBTOPICS = [
  { id: 'scenario', label: 'เควส & ไทม์ไลน์' },
  { id: 'world_core', label: 'แก่นโลก' },
  { id: 'locations', label: 'สถานที่สำคัญ' },
  { id: 'blueprint', label: 'ซิงค์พิมพ์เขียว' },
] as const;

const PRIMARY_STATS_CONFIG = [
  { key: 'initiative', label: 'การริเริ่ม', en: 'Initiative', defaultVal: 8 },
  { key: 'honesty', label: 'ความซื่อตรง', en: 'Honesty', defaultVal: 2 },
  { key: 'expressiveness', label: 'การแสดงออก', en: 'Expressiveness', defaultVal: 4 },
  { key: 'formality', label: 'ความเป็นทางการ', en: 'Formality', defaultVal: 9 },
  { key: 'playfulness', label: 'ความขี้เล่น', en: 'Playfulness', defaultVal: 7 },
  { key: 'dominance', label: 'การคุมเกม', en: 'Dominance', defaultVal: 9 },
  { key: 'physicality', label: 'การเข้าหาทางกาย', en: 'Physicality', defaultVal: 8 },
];

const SPECIAL_STATS_CONFIG = [
  { key: 'sensibility', label: 'ความไวต่อสัมผัส', en: 'Sensibility', defaultVal: 10 },
  { key: 'patience', label: 'ความอดทน', en: 'Patience', defaultVal: 8 },
  { key: 'perception', label: 'การรับรู้ / ไหวพริบ', en: 'Perception', defaultVal: 9 },
  { key: 'mask_integrity', label: 'ความสมบูรณ์ของหน้ากาก', en: 'Mask Integrity', defaultVal: 8 },
  { key: 'emotional_stability', label: 'ความมั่นคงทางอารมณ์', en: 'Emotional Stability', defaultVal: 4 },
];

interface InspectorPanelProps {
  width: number;
  onWidthChange?: (width: number) => void;
  isCollapsed: boolean;
  onCollapse: () => void;
  activeMode: CreatorMode;
  onModeChange?: (mode: CreatorMode) => void;
  activeDraftTitle?: string;
  activeWorldTitle?: string;
  draft?: VaultDraft;
  onUpdateDraft?: (updated: Partial<VaultDraft>) => void;
}

interface WorldLocation {
  id: string;
  tag: string;
  time: string;
  name: string;
  description: string;
}

const INITIAL_LOCATIONS: WorldLocation[] = [
  {
    id: 'loc-1',
    tag: 'ฉากเปิด (Opening Sanctuary)',
    time: 'ตีสอง',
    name: 'ร้านสะดวกซื้อ 02:00 น.',
    description: 'จุดปะทะทางอารมณ์ที่หน้าตู้แช่เครื่องดื่มตอนตีสอง ท่ามกลางค่ำคืนฝนตก',
  },
  {
    id: 'loc-2',
    tag: 'เขตหวงห้าม (Restricted)',
    time: 'หลังเวที',
    name: 'ห้องแต่งตัวพนักงานคาเฟ่',
    description: 'สถานที่ที่เธอถอดชุดลูกไม้และเก็บรอยยิ้มสินค้าใส่กระเป๋า',
  },
  {
    id: 'loc-3',
    tag: 'จุดตัดสินใจ (Branching Point)',
    time: 'ทางกลับบ้าน',
    name: 'ป้ายรถเมล์ใต้แสงไฟสลัว',
    description: 'ที่พักพิงริมถนนก่อนแยกย้าย เป็นจุดที่ผู้เล่นเลือกยื่นร่มให้เธอ',
  },
];

type EditableCard =
  | 'hero'
  | 'psychology'
  | 'appearance'
  | 'stats'
  | 'perks'
  | 'lore'
  | 'world_core'
  | 'locations'
  | null;

export default function InspectorPanel({
  width,
  onWidthChange,
  isCollapsed,
  onCollapse,
  activeMode,
  onModeChange,
  activeDraftTitle,
  activeWorldTitle,
  draft,
  onUpdateDraft,
}: InspectorPanelProps) {
  // สถานะการ์ดที่กำลังเปิดโหมดแก้ไข
  const [editingCard, setEditingCard] = useState<EditableCard>(null);

  // Dropdown เมนูเลือก Preset ความกว้างหน้าต่าง (460px / 600px)
  const [isSizeMenuOpen, setIsSizeMenuOpen] = useState(false);
  const sizeMenuRef = useRef<HTMLDivElement>(null);

  // Buffer state สำหรับ Hero Anchor (ชื่อ, สเตตัสคำพูด, แฮชแท็ก)
  const [editHeroTitle, setEditHeroTitle] = useState<string>('');
  const [editHeroQuote, setEditHeroQuote] = useState<string>('');
  const [editHeroHashtags, setEditHeroHashtags] = useState<string>('');

  // Buffer state สำหรับ Card 1: จิตวิทยาสองขั้ว & อัตลักษณ์
  const [editArchetype, setEditArchetype] = useState<string>('');
  const [editDesc, setEditDesc] = useState<string>('');
  const [editTheMask, setEditTheMask] = useState<string>('');
  const [editTheCore, setEditTheCore] = useState<string>('');
  const [editTheConflict, setEditTheConflict] = useState<string>('');

  // Buffer state สำหรับ Card 2: สรีระซ่อนรูป & ภาษากาย
  const [editOutfit1, setEditOutfit1] = useState<string>('');
  const [editOutfit2, setEditOutfit2] = useState<string>('');
  const [editAnatomy, setEditAnatomy] = useState<string>('');
  const [editPostures, setEditPostures] = useState<string>('');

  // Buffer state สำหรับ Card 3: สเตตัส & แรงขับปรารถนา
  const [editStats, setEditStats] = useState<Record<string, number>>({});
  const [editMaxDesire, setEditMaxDesire] = useState<number>(500);

  // Buffer state สำหรับ Card 4: จุดสติหลุด & สกิลติดตัว
  const [editPerks, setEditPerks] = useState<PassivePerk[]>([]);
  const [editLikes, setEditLikes] = useState<string>('');
  const [editDislikes, setEditDislikes] = useState<string>('');

  // Buffer state สำหรับ Card 5: ปูมหลัง & วิวัฒนาการความสัมพันธ์
  const [editBackground, setEditBackground] = useState<string>('');
  const [editEvolutionDesc, setEditEvolutionDesc] = useState<string>('');
  const [editDesireMin, setEditDesireMin] = useState<number>(40);
  const [editAffectionMin, setEditAffectionMin] = useState<number>(60);

  // Buffer state สำหรับ World Mode: แก่นโลก & สถานที่
  const [editWorldTitle, setEditWorldTitle] = useState<string>('');
  const [editWorldVisual, setEditWorldVisual] = useState<string>('');
  const [editWorldSound, setEditWorldSound] = useState<string>('');
  const [editWorldConflict, setEditWorldConflict] = useState<string>('');
  const [locations, setLocations] = useState<WorldLocation[]>(INITIAL_LOCATIONS);
  const [editLocations, setEditLocations] = useState<WorldLocation[]>(INITIAL_LOCATIONS);
  const [syncedFeedback, setSyncedFeedback] = useState<boolean>(false);

  // Data สำหรับ Scenario Engine (Dungeon Master Quest System)
  const scenarioData = draft?.scenario || DEFAULT_WORLD_SCENARIO;

  const handleUpdateScenario = (updated: WorldScenario) => {
    onUpdateDraft?.({ scenario: updated });
  };

  // Scroll container ref & Smart-Collapse state (Dynamic Collapse on scroll)
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // Active Subtopic for horizontal navigation bar (Option 1: Two-Tier Apple Architecture)
  const [activeSubtopic, setActiveSubtopic] = useState<string>('psychology');
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);

  const subtopicsNavRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Dynamic Apple Sliding Pill Indicator State
  const [pillIndicator, setPillIndicator] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    ready: boolean;
  }>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    ready: false,
  });

  const updatePillIndicator = useCallback(() => {
    const activeEl = pillRefs.current[activeSubtopic];
    if (activeEl && subtopicsNavRef.current) {
      setPillIndicator({
        left: activeEl.offsetLeft,
        top: activeEl.offsetTop,
        width: activeEl.offsetWidth,
        height: activeEl.offsetHeight,
        ready: true,
      });
    }
  }, [activeSubtopic]);

  // Dynamic Apple Sliding Pill Indicator State (Scope Switcher: ตัวละคร vs โลก)
  const modeRefs = useRef<Record<CreatorMode, HTMLButtonElement | null>>({
    character: null,
    world: null,
  });

  const [modeIndicator, setModeIndicator] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    ready: boolean;
  }>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    ready: false,
  });

  const updateModeIndicator = useCallback(() => {
    const activeEl = modeRefs.current[activeMode];
    if (activeEl) {
      setModeIndicator({
        left: activeEl.offsetLeft,
        top: activeEl.offsetTop,
        width: activeEl.offsetWidth,
        height: activeEl.offsetHeight,
        ready: true,
      });
    }
  }, [activeMode]);

  const handleModeSwitch = (mode: CreatorMode) => {
    if (mode === activeMode) return;

    // Instant launch: อัปเดต Indicator ทันทีใน Tick เดียวกัน
    const targetEl = modeRefs.current[mode];
    if (targetEl) {
      setModeIndicator({
        left: targetEl.offsetLeft,
        top: targetEl.offsetTop,
        width: targetEl.offsetWidth,
        height: targetEl.offsetHeight,
        ready: true,
      });
    }

    onModeChange?.(mode);
    setActiveSubtopic(mode === 'character' ? 'psychology' : 'scenario');
  };

  useLayoutEffect(() => {
    updatePillIndicator();
    updateModeIndicator();
  }, [updatePillIndicator, updateModeIndicator, activeMode, width]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updatePillIndicator();
      updateModeIndicator();
    }, 60);
    const handleResize = () => {
      updatePillIndicator();
      updateModeIndicator();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [updatePillIndicator, updateModeIndicator]);

  // เลื่อน Pill Bar แนวนอนเฉพาะเมื่อปุ่มที่เลือกตกขอบจอจริง เพื่อไม่ให้เกิดการสั่นไหว
  useEffect(() => {
    const activeEl = pillRefs.current[activeSubtopic];
    if (activeEl && subtopicsNavRef.current) {
      const container = subtopicsNavRef.current;
      const elLeft = activeEl.offsetLeft;
      const elRight = elLeft + activeEl.offsetWidth;
      const scrollLeft = container.scrollLeft;
      const clientWidth = container.clientWidth;

      if (elLeft < scrollLeft) {
        container.scrollTo({ left: Math.max(0, elLeft - 8), behavior: 'smooth' });
      } else if (elRight > scrollLeft + clientWidth) {
        container.scrollTo({ left: elRight - clientWidth + 8, behavior: 'smooth' });
      }
    }
  }, [activeSubtopic]);

  // Card refs สำหรับการเลื่อน Smooth-scroll ไปยังการ์ดแต่ละใบโดยตรง
  const psychologyCardRef = useRef<HTMLDivElement>(null);
  const appearanceCardRef = useRef<HTMLDivElement>(null);
  const statsCardRef = useRef<HTMLDivElement>(null);
  const perksCardRef = useRef<HTMLDivElement>(null);
  const loreCardRef = useRef<HTMLDivElement>(null);
  const scenarioCardRef = useRef<HTMLDivElement>(null);
  const worldCoreCardRef = useRef<HTMLDivElement>(null);
  const locationsCardRef = useRef<HTMLDivElement>(null);
  const blueprintCardRef = useRef<HTMLDivElement>(null);

  const cardRefMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
    psychology: psychologyCardRef,
    appearance: appearanceCardRef,
    stats: statsCardRef,
    perks: perksCardRef,
    lore: loreCardRef,
    scenario: scenarioCardRef,
    world_core: worldCoreCardRef,
    locations: locationsCardRef,
    blueprint: blueprintCardRef,
  };

  const checkSubtopicsScroll = () => {
    if (subtopicsNavRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = subtopicsNavRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }
  };

  const handleScrollSubtopics = (direction: 'left' | 'right') => {
    if (subtopicsNavRef.current) {
      const scrollAmount = 140;
      subtopicsNavRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkSubtopicsScroll, 250);
    }
  };

  // Programmatic scroll lock สำหรับป้องกัน Scroll-Spy สลับค่ากลับขณะกำลัง Smooth Scroll จากการคลิก
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const programmaticScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSubtopicClick = (id: string) => {
    // 1. ตั้งค่า Subtopic ที่เลือกทันที
    setActiveSubtopic(id);

    // 2. อัปเดตพิกัด Pill Indicator ทันทีใน Tick เดียวกัน (Instant launch — สไลด์ทันที ไม่รอรอบ Render ถัดไป)
    const targetEl = pillRefs.current[id];
    if (targetEl && subtopicsNavRef.current) {
      setPillIndicator({
        left: targetEl.offsetLeft,
        top: targetEl.offsetTop,
        width: targetEl.offsetWidth,
        height: targetEl.offsetHeight,
        ready: true,
      });
    }

    // 3. ล็อก Scroll-Spy ไว้ 650ms เพื่อป้องกันไม่ให้ Scroll-Spy แทรกแซงระหว่างที่การ์ดกำลังเลื่อน
    isProgrammaticScrollRef.current = true;
    if (programmaticScrollTimerRef.current) {
      clearTimeout(programmaticScrollTimerRef.current);
    }
    programmaticScrollTimerRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 650);

    // 4. เลื่อนหน้าจอไปยังการ์ดเป้าหมายแบบ Smooth
    const targetCard = cardRefMap[id]?.current;
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // สลับ default activeSubtopic เมื่อ activeMode เปลี่ยนแปลง
  const [prevMode, setPrevMode] = useState<CreatorMode>(activeMode);
  if (prevMode !== activeMode) {
    setPrevMode(activeMode);
    setActiveSubtopic(activeMode === 'character' ? 'psychology' : 'scenario');
  }

  // อัปเดตสถานะลูกศรเลื่อนแนวนอนของ Pill Bar เมื่อเปลี่ยนโหมด
  useEffect(() => {
    const timer = setTimeout(checkSubtopicsScroll, 80);
    const indTimer = setTimeout(() => {
      updatePillIndicator();
      updateModeIndicator();
    }, 80);
    return () => {
      clearTimeout(timer);
      clearTimeout(indTimer);
    };
  }, [activeMode, updatePillIndicator, updateModeIndicator]);

  // ตรวจสอบสถานะการเลื่อนของ Pill Bar เมื่อเปลี่ยนความกว้าง Inspector
  useEffect(() => {
    checkSubtopicsScroll();
    const handleResize = () => checkSubtopicsScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width]);

  // ปิดเมนูเลือกขนาดเมื่อคลิกพื้นที่อื่น หรือกดปุ่ม Escape
  useEffect(() => {
    if (!isSizeMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(e.target as Node)) {
        setIsSizeMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSizeMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSizeMenuOpen]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    
    // Apple iOS Large Title: Hysteresis Threshold (75px to collapse, 35px to expand)
    // มีระยะ Buffer 40px กันการสลับสถานะไปมา (Anti-jitter / Zero Layout Shift)
    setIsScrolled((prev) => {
      if (!prev && scrollTop > 75) return true;
      if (prev && scrollTop < 35) return false;
      return prev;
    });

    // Scroll-Spy อัปเดต Subtopic Pill ที่กำลังแสดงผลอยู่ให้อัตโนมัติ (จะทำงานเฉพาะเมื่อผู้ใช้เลื่อนหน้าจอเอง ไม่อยู่ในโหมดคลิก)
    if (!isProgrammaticScrollRef.current) {
      const currentList = activeMode === 'character' ? CHARACTER_SUBTOPICS : WORLD_SUBTOPICS;
      const containerTop = e.currentTarget.getBoundingClientRect().top;
      for (let i = currentList.length - 1; i >= 0; i--) {
        const id = currentList[i].id;
        const el = cardRefMap[id]?.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top - containerTop <= 140) {
            setActiveSubtopic((prev) => (prev !== id ? id : prev));
            break;
          }
        }
      }
    }
  };

  const handleScrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // รีเซ็ตโหมดแก้ไขเมื่อสลับ Draft ตัวละคร
  const [prevDraftId, setPrevDraftId] = useState(draft?.id);
  if (prevDraftId !== draft?.id) {
    setPrevDraftId(draft?.id);
    setEditingCard(null);
    setIsScrolled(false);
  }

  if (isCollapsed) {
    return null;
  }

  // --- Handlers สำหรับเริ่มและบันทึกการ์ดแต่ละใบ ---

  // Hero Anchor: ข้อมูลหลัก ชื่อ สเตตัสคำพูด และแฮชแท็ก
  const handleStartEditHero = () => {
    setEditHeroTitle(draft?.title || activeDraftTitle || 'มาฮิโระ (Mahiro)');
    setEditHeroQuote(
      draft?.quote ||
        '"อย่าขยับสิคะ... ถ้าขยับพิษจากละอองเกสรจะยิ่งแล่นเข้าสู่กระแสเลือดนะ ให้รุ่นพี่ช่วยรีดมันออกจะดีกว่า..."'
    );
    setEditHeroHashtags(
      (
        draft?.hashtags || [
          '#รุ่นพี่สาวแว่น',
          '#สายหมอกซ่อนรูป',
          '#GapMoeขั้นสุด',
          '#นักล่ากระหายพิษ',
          '#ตรรกะรีดพิษด้วยน้ำมังกร',
        ]
      ).join(', ')
    );
    setEditingCard('hero');
    handleScrollToTop();
  };

  const handleSaveHero = () => {
    const tags = editHeroHashtags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    onUpdateDraft?.({
      title: editHeroTitle.trim() || draft?.title || 'ตัวละครใหม่',
      quote: editHeroQuote.trim(),
      hashtags: tags,
    });
    setEditingCard(null);
  };

  // Card 1: จิตวิทยา & อัตลักษณ์
  const handleStartEditPsychology = () => {
    setEditArchetype(draft?.archetype || 'The Cloaked Predator');
    setEditDesc(draft?.description || 'นักล่าซ่อนรูปใต้หน้ากากพฤกษศาสตร์');
    setEditTheMask(
      draft?.psychology?.the_mask ||
        'รุ่นพี่สาวแว่นผู้มีการศึกษา พูดจาสุภาพเรียบร้อยเหนียมอาย สวมเสื้อผ้าหนาเตอะเพื่อปิดบังเรือนร่างและหลีกเลี่ยงสังคม'
    );
    setEditTheCore(
      draft?.psychology?.the_core ||
        'นักล่ากามารมณ์จอมวางแผนผู้มีความต้องการสูงลิ่ว ใช้ทฤษฎีวิชาการมาบิดเบือนเป็นข้ออ้างเพื่อจับเหยื่อตรึงไว้กับที่อย่างไร้ยางอาย'
    );
    setEditTheConflict(
      draft?.psychology?.the_conflict ||
        'การต่อสู้ระหว่างสามัญสำนึกของรุ่นพี่ผู้มีการศึกษา กับสัญชาตญาณความต้องการทางเพศที่พร้อมจะปะทุระเบิดทุกครั้งเมื่อร่างกายต้องอุณหภูมิที่ร้อนขึ้น'
    );
    setEditingCard('psychology');
  };

  const handleSavePsychology = () => {
    onUpdateDraft?.({
      archetype: editArchetype.trim(),
      description: editDesc.trim(),
      psychology: {
        the_mask: editTheMask.trim(),
        the_core: editTheCore.trim(),
        the_conflict: editTheConflict.trim(),
      },
    });
    setEditingCard(null);
  };

  // Card 2: สรีระ & ภาษากาย
  const handleStartEditAppearance = () => {
    setEditOutfit1(
      draft?.appearance?.wardrobe?.outfit_1?.[0] ||
        'ชุดยูกาตะผ้าฝ้ายเนื้อหนาสีเข้มตัวโคร่งที่ดูแบนราบไร้ส่วนเว้าโค้ง พร้อมแว่นตากรอบหนาเตอะปิดบังใบหน้า'
    );
    setEditOutfit2(
      draft?.appearance?.wardrobe?.outfit_2?.[0] ||
        'เสื้อเชิ้ตสีขาวและกระโปรงยาวสีทึบเรียบร้อย ทว่ายามเปียกฝนจะแนบเนื้อจนโปร่งแสง เผยให้เห็นบราเซียลูกไม้สีดำสนิทขัดกับผิวขาวจัด'
    );
    setEditAnatomy(
      (
        draft?.appearance?.anatomy_features || [
          'แว่นตากรอบโลหะหนาเตอะที่ปิดบังดวงตาสีดำขลับปลาบเยิ้มที่ซ่อนความต้องการทางเพศเอาไว้ข้างใน',
          'ผิวขาวเนียนละเอียดดุจน้ำนมที่ขึ้นสีชมพูระเรื่ออย่างรวดเร็วเมื่อสัมผัสกับความร้อน',
          'รูปร่างนาฬิกาทรายสุดสะบึม (อกอวบใหญ่สะบึม สะโพกผึ่งผาย) ที่ซ่อนอยู่ภายใต้เสื้อผ้าตัวโคร่ง',
          'ซอกคอและกระดูกไหปลาร้าที่มักมีเหงื่อและไอน้ำระเหยฟุ้งออกมา',
        ]
      ).join('\n')
    );
    setEditPostures(
      (
        draft?.appearance?.signature_postures || [
          'การใช้นิ้วชี้ดันดั้งแว่นตาขึ้นเพื่อเก็บซ่อนสายตาหิวกระหายยามปั้นหน้าสุภาพเหนียมอาย',
          'ทิ้งตัวซบแผงอกหรือเกาะบ่าเหยื่อแน่นด้วยร่างกายท่อนล่างที่อ่อนแรงและสั่นเทาจากการเกร็งสะท้าน',
          'ท่านั่งพับเพียบเรียบร้อย แต่แอบจงใจขยับสะโพกบดเบียดพื้นหรือเกร็งหน้าขาหนีบเข้าหากัน',
        ]
      ).join('\n')
    );
    setEditingCard('appearance');
  };

  const handleSaveAppearance = () => {
    onUpdateDraft?.({
      appearance: {
        wardrobe: {
          outfit_1: [editOutfit1.trim()],
          outfit_2: [editOutfit2.trim()],
        },
        anatomy_features: editAnatomy.split('\n').map((s) => s.trim()).filter(Boolean),
        signature_postures: editPostures.split('\n').map((s) => s.trim()).filter(Boolean),
      },
    });
    setEditingCard(null);
  };

  // Card 3: สเตตัส & แรงขับปรารถนา
  const handleStartEditStats = () => {
    const initial: Record<string, number> = {};
    PRIMARY_STATS_CONFIG.forEach((s) => {
      initial[s.key] = draft?.core_stats?.[s.key] ?? draft?.stats?.[s.key] ?? s.defaultVal;
    });
    SPECIAL_STATS_CONFIG.forEach((s) => {
      initial[s.key] = draft?.core_stats?.[s.key] ?? draft?.stats?.[s.key] ?? s.defaultVal;
    });
    setEditStats(initial);
    setEditMaxDesire(draft?.max_desire || 500);
    setEditingCard('stats');
  };

  const handleSaveStats = () => {
    onUpdateDraft?.({
      core_stats: editStats,
      stats: editStats,
      max_desire: editMaxDesire,
    });
    setEditingCard(null);
  };

  // Card 4: จุดสติหลุด & สกิลติดตัว
  const handleStartEditPerks = () => {
    setEditPerks(
      draft?.passive_perks || [
        {
          perk_name: 'Thermal Shock (จุดระเบิดสติหลุด)',
          trigger: 'ร่างกายสัมผัสความร้อนจากภายนอก เช่น ออนเซ็น, ไข้, หรือน้ำมันสมุนไพรอุ่น',
          effect:
            'ลดค่า Mask Integrity ลงเหลือ 1 ทันที ร่างกายท่อนล่างสูญเสียการพยุงตัวจนต้องเกาะยึดตัวเป้าหมาย และเพิ่มความต้องการทางเพศถึงขีดสุด',
        },
        {
          perk_name: 'ตรรกะรีดพิษพฤกษศาสตร์',
          trigger: 'เมื่อเป้าหมายมีท่าทีสับสนหรือขัดขืนในพื้นที่อับสายตา',
          effect:
            'ใช้ทฤษฎีสมุนไพรมาบิดเบือนสร้างเหตุผลความจำเป็นในการ "รีดพิษ" ทำให้การขัดขืนของเป้าหมายลดลงอย่างราบคาบ',
        },
        {
          perk_name: 'สวิตช์ขาแว่นเย็นเยือก',
          trigger: 'สัมผัสความเย็นเฉียบของโลหะที่ใบหน้าหรือสวมแว่นตากลับคืน',
          effect:
            'เรียกคืนค่าสติและฟื้นฟู Mask Integrity กลับมา 50% ชั่วคราว แม้ว่าร่างกายท่อนล่างยังคงเปียกเยิ้มและสั่นสะท้านอยู่ก็ตาม',
        },
      ]
    );
    setEditLikes(
      (
        draft?.preferences?.likes || [
          'การแช่ออนเซ็น',
          'น้ำมันสมุนไพรฤทธิ์ร้อน',
          'การจัดตารางเวลาสองต่อสองในห้องชมรมพฤกษศาสตร์',
          'รุ่นน้องหนุ่มผู้ว่าง่าย',
          'การวิจัยสรรพคุณพืชสมุนไพร',
        ]
      ).join(', ')
    );
    setEditDislikes(
      (
        draft?.preferences?.dislikes || [
          'ขาแว่นโลหะที่เย็นเฉียบ (เพราะมันดึงสติเธอกลับมา)',
          'สภาพอากาศหนาวจัดที่ไม่มีแหล่งความร้อน',
          'การถูกขัดจังหวะขณะกำลัง "รีดพิษ"',
        ]
      ).join(', ')
    );
    setEditingCard('perks');
  };

  const handleSavePerks = () => {
    onUpdateDraft?.({
      passive_perks: editPerks,
      preferences: {
        likes: editLikes.split(',').map((s) => s.trim()).filter(Boolean),
        dislikes: editDislikes.split(',').map((s) => s.trim()).filter(Boolean),
      },
    });
    setEditingCard(null);
  };

  // Card 5: ปูมหลัง & วิวัฒนาการ
  const handleStartEditLore = () => {
    setEditBackground(
      (
        draft?.background_story || [
          'รุ่นพี่ปี 3 ผู้ครองตำแหน่งประธานชมรมพฤกษศาสตร์ มีประวัติเรียนดีเด่นและขึ้นชื่อเรื่องความสุภาพ เรียบร้อย และเก็บเนื้อเก็บตัวจนเกือบจะดูขี้ขลาดในสายตาคนนอก',
          'เบื้องหลังคือผู้เชี่ยวชาญด้านสมุนไพรและสรีรวิทยาของพืชที่มีรสนิยมลึกลับ เธอหลงใหลการสร้างสถานการณ์ "พื้นที่อับ" เพื่อล่อลวงรุ่นน้องที่เธอหมายตา',
          'มีความลับทางร่างกายที่ไม่อาจบอกใครได้ว่า ตนเองจะสูญเสียการควบคุมสติสัมปชัญญะทันทีเมื่อร่างกายได้รับความร้อนหรือน้ำมันนวดฤทธิ์ร้อน',
        ]
      ).join('\n\n')
    );
    setEditEvolutionDesc(
      draft?.dynamic_evolution?.phase_2?.phase_description ||
        'รุ่นพี่มาฮิโระจะเริ่มทิ้งระยะห่างอย่างเป็นทางการน้อยลง เธอจะจงใจแกล้ง "ซุ่มซ่าม" ทำตัวเปียกฝนหรือขอให้เป้าหมายช่วยทายานวดสมุนไพรร้อนตามร่างกายบ่อยครั้งขึ้น โดยเริ่มเปิดเผยแว่นตาที่ขึ้นฝ้าและถอดมันออกต่อหน้าเพื่อเผยสายตานักล่าอย่างโจ่งแจ้ง'
    );
    setEditDesireMin(draft?.dynamic_evolution?.phase_2?.requirements?.desire_min || 40);
    setEditAffectionMin(draft?.dynamic_evolution?.phase_2?.requirements?.affection_min || 60);
    setEditingCard('lore');
  };

  const handleSaveLore = () => {
    onUpdateDraft?.({
      background_story: editBackground.split('\n\n').map((s) => s.trim()).filter(Boolean),
      dynamic_evolution: {
        phase_2: {
          requirements: { desire_min: editDesireMin, affection_min: editAffectionMin },
          phase_description: editEvolutionDesc.trim(),
        },
      },
    });
    setEditingCard(null);
  };

  // World Mode Handlers
  const handleStartEditWorldCore = () => {
    setEditWorldTitle(draft?.worldTitle || activeWorldTitle || 'The Paid Smile & Off-Duty Ice');
    setEditWorldVisual(
      draft?.worldVisual || 'แสงนีออนสีชมพูซีด สะท้อนผิวน้ำขังบนพื้นถนนยางมะตอยเปียกฝน'
    );
    setEditWorldSound(
      draft?.worldSound || 'เสียงฝนซัดสาดกระจกหน้าร้านสะดวกซื้อ สลับกับเสียงลมหายใจแผ่วเบา'
    );
    setEditWorldConflict(
      draft?.worldConflict || 'ในเวลางานเธอถูกทุกคนจับจ้อง แต่นอกเวลางานเธอขอเป็นเพียงอากาศธาตุ'
    );
    setEditingCard('world_core');
  };

  const handleSaveWorldCore = () => {
    onUpdateDraft?.({
      worldTitle: editWorldTitle.trim() || draft?.worldTitle || 'โลกใบใหม่',
      worldVisual: editWorldVisual.trim(),
      worldSound: editWorldSound.trim(),
      worldConflict: editWorldConflict.trim(),
    });
    setEditingCard(null);
  };

  const handleStartEditLocations = () => {
    setEditLocations([...locations]);
    setEditingCard('locations');
  };

  const handleSaveLocations = () => {
    setLocations(editLocations);
    setEditingCard(null);
  };

  const handleSyncBlueprint = () => {
    setSyncedFeedback(true);
    setTimeout(() => {
      setSyncedFeedback(false);
    }, 2000);
  };

  return (
    <aside
      style={{ width: `${width}px` }}
      className="h-full shrink-0 bg-[#090909] flex flex-col z-20 select-none overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] relative"
    >
      {/* 1. All-in-One Unified Navigation Bar (Single Row Apple Dock: สูงเพียง 48px ประหยัดพื้นที่แนวตั้ง 60%!) */}
      <div className="px-3 sm:px-4 py-1.5 flex items-center gap-1.5 sm:gap-2 shrink-0 border-b border-[#2F3336]/40 bg-[#090909] h-[48px]">
        {/* Left: Scope Mode Switcher Capsule [ 👤 ตัวละคร | 🌐 โลก ] */}
        <div className="flex items-center p-0.5 rounded-full bg-[#141416] border border-[#2F3336]/80 shrink-0 relative">
          {/* Apple Dynamic Sliding Indicator for Scope Switcher */}
          {modeIndicator.ready && (
            <div
              className="absolute top-0.5 left-0 rounded-full bg-[#222226] border border-white/10 shadow-sm pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-0 will-change-transform"
              style={{
                transform: `translate3d(${modeIndicator.left}px, ${modeIndicator.top}px, 0)`,
                width: `${modeIndicator.width}px`,
                height: `${modeIndicator.height}px`,
              }}
            />
          )}

          {/* ปุ่มสลับโหมด: ตัวละคร */}
          <button
            ref={(el) => {
              modeRefs.current.character = el;
            }}
            type="button"
            onClick={() => handleModeSwitch('character')}
            title="อัตลักษณ์ตัวละคร"
            className={`relative z-10 px-2.5 py-1 rounded-full text-[12px] flex items-center gap-1.5 transition-colors duration-200 cursor-pointer select-none ${
              activeMode === 'character'
                ? `text-[#F2F2F5] font-bold ${!modeIndicator.ready ? 'bg-[#222226] text-[#F2F2F5] font-bold shadow-sm border border-white/10' : ''}`
                : 'text-[#ACACB2] hover:text-[#F2F2F5] font-medium'
            }`}
          >
            <UserRound
              size={13}
              className={`transition-colors duration-200 ${
                activeMode === 'character' ? 'text-[#EF264C]' : 'text-[#ACACB2]'
              }`}
            />
            <span className="hidden sm:inline">ตัวละคร</span>
          </button>

          {/* ปุ่มสลับโหมด: โครงสร้างโลก */}
          <button
            ref={(el) => {
              modeRefs.current.world = el;
            }}
            type="button"
            onClick={() => handleModeSwitch('world')}
            title="โครงสร้างโลก"
            className={`relative z-10 px-2.5 py-1 rounded-full text-[12px] flex items-center gap-1.5 transition-colors duration-200 cursor-pointer select-none ${
              activeMode === 'world'
                ? `text-[#F2F2F5] font-bold ${!modeIndicator.ready ? 'bg-[#222226] text-[#F2F2F5] font-bold shadow-sm border border-white/10' : ''}`
                : 'text-[#ACACB2] hover:text-[#F2F2F5] font-medium'
            }`}
          >
            <Globe
              size={13}
              className={`transition-colors duration-200 ${
                activeMode === 'world' ? 'text-[#EF264C]' : 'text-[#ACACB2]'
              }`}
            />
            <span className="hidden sm:inline">โลก</span>
          </button>
        </div>

        {/* Divider เส้นแบ่งบางเบา */}
        <div className="h-4 w-[1px] bg-[#2F3336]/70 shrink-0" />

        {/* Center: Apple Horizontal Subtopic Pill Slider */}
        <div className="flex-1 flex items-center gap-1 min-w-0">
          {/* ปุ่มเลื่อนซ้าย (เมื่อเลื่อนบาร์ไปทางขวา) */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => handleScrollSubtopics('left')}
              title="เลื่อนซ้าย"
              className="shrink-0 w-5 h-5 rounded-full bg-[#141416] border border-[#2F3336] text-[#ACACB2] hover:text-[#F2F2F5] hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer select-none"
            >
              <ChevronLeft size={12} strokeWidth={2.2} />
            </button>
          )}

          {/* แทร็กหัวข้อย่อยเลื่อนแนวนอน */}
          <div
            ref={subtopicsNavRef}
            onScroll={checkSubtopicsScroll}
            className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth px-0.5 relative py-0.5"
          >
            {/* Apple Dynamic Sliding Pill Indicator (สไลด์ลื่นไหลสไตล์ Apple) */}
            {pillIndicator.ready && (
              <div
                className="absolute top-0 left-0 rounded-full bg-[#F2F2F5] shadow-sm pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-0 will-change-transform"
                style={{
                  transform: `translate3d(${pillIndicator.left}px, ${pillIndicator.top}px, 0)`,
                  width: `${pillIndicator.width}px`,
                  height: `${pillIndicator.height}px`,
                }}
              />
            )}

            {(activeMode === 'character' ? CHARACTER_SUBTOPICS : WORLD_SUBTOPICS).map((item) => {
              const isActive = activeSubtopic === item.id;
              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    pillRefs.current[item.id] = el;
                  }}
                  type="button"
                  onClick={() => {
                    handleSubtopicClick(item.id);
                  }}
                  className={`relative z-10 px-2.5 py-1 rounded-full text-[12px] whitespace-nowrap transition-colors duration-200 cursor-pointer select-none shrink-0 ${
                    isActive
                      ? `text-[#090909] font-bold ${!pillIndicator.ready ? 'bg-[#F2F2F5]' : ''}`
                      : 'text-[#ACACB2] hover:text-[#F2F2F5] hover:bg-white/5 font-medium'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* ปุ่มเลื่อนขวา Apple Chevron > */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => handleScrollSubtopics('right')}
              title="เลื่อนขวา"
              className="shrink-0 w-5 h-5 rounded-full bg-[#141416] border border-[#2F3336] text-[#ACACB2] hover:text-[#F2F2F5] hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer select-none"
            >
              <ChevronRight size={12} strokeWidth={2.2} />
            </button>
          )}
        </div>

        {/* Right: ปุ่มจุดไข่ปลาเลือกขนาดหน้าต่าง และปุ่มพับเก็บ */}
        <div className="flex items-center gap-1.5 shrink-0 relative" ref={sizeMenuRef}>
          {onWidthChange && (
            <button
              type="button"
              onClick={() => setIsSizeMenuOpen((prev) => !prev)}
              title="ตั้งค่าขนาดหน้าต่าง Inspector"
              className={`w-7 h-7 rounded-full backdrop-blur-xl border transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center select-none ${
                isSizeMenuOpen
                  ? 'bg-white/15 border-white/30 text-[#F2F2F5]'
                  : 'bg-transparent border border-[#2F3336] hover:border-white/30 text-[#ACACB2] hover:text-[#F2F2F5]'
              }`}
            >
              <MoreVertical size={14} strokeWidth={1.8} />
            </button>
          )}

          {/* ปุ่มพับเก็บหน้าต่าง Inspector */}
          <button
            type="button"
            onClick={onCollapse}
            title="พับเก็บหน้าต่าง Inspector"
            className="w-7 h-7 rounded-full bg-transparent border border-[#2F3336] hover:border-white/30 text-[#ACACB2] hover:text-[#F2F2F5] flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0"
          >
            <PanelRightClose size={14} strokeWidth={1.8} />
          </button>

          {/* Dropdown Menu (Glassmorphism Luxury) */}
          {isSizeMenuOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-[220px] p-1.5 rounded-2xl bg-[#121214]/95 backdrop-blur-2xl border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 select-none">
              <div className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-[#ACACB2] font-semibold border-b border-white/[0.06] mb-1">
                ขนาดหน้าต่าง (INSPECTOR)
              </div>

              {/* Option 1: มาตรฐาน (460px) */}
              <button
                type="button"
                onClick={() => {
                  onWidthChange?.(460);
                  setIsSizeMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[12.5px] transition-all cursor-pointer ${
                  Math.abs(width - 460) < 30
                    ? 'bg-white/[0.08] text-[#F2F2F5] font-medium'
                    : 'text-[#ACACB2] hover:text-[#F2F2F5] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex flex-col text-left">
                  <span className="leading-tight">มาตรฐาน (460px)</span>
                  <span className="text-[10px] text-[#ACACB2]/80">สมดุลพอดีสายตา (ค่าเริ่มต้น)</span>
                </div>
                {Math.abs(width - 460) < 30 && (
                  <Check size={14} className="text-[#EF264C] shrink-0" strokeWidth={2.5} />
                )}
              </button>

              {/* Option 2: สตูดิโอกว้างเต็มตา (600px) */}
              <button
                type="button"
                onClick={() => {
                  onWidthChange?.(600);
                  setIsSizeMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[12.5px] transition-all cursor-pointer ${
                  Math.abs(width - 600) < 30
                    ? 'bg-white/[0.08] text-[#F2F2F5] font-medium'
                    : 'text-[#ACACB2] hover:text-[#F2F2F5] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex flex-col text-left">
                  <span className="leading-tight">สตูดิโอกว้างเต็มตา (600px)</span>
                  <span className="text-[10px] text-[#ACACB2]/80">กว้างเต็มตา สำหรับจัดการเควส</span>
                </div>
                {Math.abs(width - 600) < 30 && (
                  <Check size={14} className="text-[#EF264C] shrink-0" strokeWidth={2.5} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Apple Slim Sticky Bar (Outside scroll container - Zero Layout Shift) */}
      {activeMode === 'character' && (
        <div
          className={`absolute top-[48px] left-0 right-0 z-20 bg-[#090909]/95 backdrop-blur-md border-b border-[#2F3336]/60 shadow-lg shadow-black/80 px-5 sm:px-6 py-2 transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isScrolled && editingCard !== 'hero'
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between gap-3 h-8">
            <button
              type="button"
              onClick={handleScrollToTop}
              title="คลิกเพื่อเลื่อนกลับขึ้นด้านบนสุด"
              className="flex items-center gap-2 min-w-0 text-left cursor-pointer group bg-transparent border-0 p-0"
            >
              <div className="w-2 h-2 rounded-full bg-[#EF264C] shrink-0" />
              <h2 className="text-[16px] sm:text-[17px] font-bold text-app-primary tracking-tight truncate group-hover:text-[#EF264C] transition-colors">
                {draft?.title || activeDraftTitle || 'ตัวละครใหม่'}
              </h2>
              {/* แฮชแท็กหลักอันแรก เพื่อเป็นจุดยึดเหนี่ยวสายตา */}
              {draft?.hashtags?.[0] ? (
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#18181b] text-[12px] sm:text-[12.5px] text-[#ACACB2] truncate max-w-[150px] group-hover:border-[#EF264C]/40 border border-transparent transition-all">
                  {draft.hashtags[0]}
                </span>
              ) : (
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full border border-[#EF264C]/40 text-[12px] sm:text-[12.5px] text-[#EF264C]">
                  {draft?.archetype || 'The Cloaked Predator'}
                </span>
              )}
            </button>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleScrollToTop}
                title="เลื่อนกลับขึ้นด้านบนสุด"
                className="w-7 h-7 rounded-full bg-transparent border border-[#2F3336] hover:border-white/30 text-app-secondary hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none"
              >
                <ChevronUp size={14} strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={handleStartEditHero}
                title="แก้ไขข้อมูลหลักและสเตตัส"
                className="w-7 h-7 rounded-full bg-transparent border border-[#2F3336] hover:border-[#EF264C]/60 text-app-secondary hover:text-[#EF264C] flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none"
              >
                <Pencil size={12} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Scrollable Cards Container (สไตล์ Twitter X & CharacterDetailModal: เส้นขอบอย่างเดียว ไม่มีพื้นหลัง) */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onWheel={() => {
          isProgrammaticScrollRef.current = false;
        }}
        onTouchStart={() => {
          isProgrammaticScrollRef.current = false;
        }}
        className="flex-1 overflow-y-auto px-5 sm:px-6 pb-6 pt-0 space-y-4 no-scrollbar"
      >
        {activeMode === 'character' ? (
          /* ================= CHARACTER MODE CARDS (THE 5-CARD PILLAR) ================= */
          <>
            {/* ================= IN-FLOW LARGE HERO (SCROLLS NATURALLY IN FEED) ================= */}
            <div className="pt-3.5 pb-4 border-b border-[#2F3336]/60">
              {editingCard === 'hero' ? (
                <div className="flex flex-col gap-3 py-1">
                  {/* Header with Save/Cancel buttons */}
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] font-bold text-[#EF264C] uppercase tracking-wider">
                      แก้ไขอัตลักษณ์หลัก & สเตตัส
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingCard(null)}
                        title="ยกเลิกการแก้ไข"
                        className="w-8 h-8 rounded-full bg-transparent border border-[#2F3336] hover:border-white/30 text-[#ACACB2] hover:text-[#F2F2F5] flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0"
                      >
                        <X size={14} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveHero}
                        title="บันทึกข้อมูลหลัก"
                        className="w-8 h-8 rounded-full border border-[#EF264C]/70 bg-[#EF264C]/15 hover:bg-[#EF264C] text-[#EF264C] hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0 shadow-[0_0_10px_rgba(239,38,76,0.2)]"
                      >
                        <Check size={14} strokeWidth={2.2} />
                      </button>
                    </div>
                  </div>

                  {/* ชื่อตัวละคร Input */}
                  <div>
                    <label className="text-[12px] font-semibold text-[#ACACB2] uppercase tracking-wider block mb-1">
                      ชื่อตัวละคร
                    </label>
                    <input
                      type="text"
                      value={editHeroTitle}
                      onChange={(e) => setEditHeroTitle(e.target.value)}
                      placeholder="ชื่อตัวละคร..."
                      className="w-full bg-[#141416] border border-[#EF264C]/60 focus:border-[#EF264C] text-[#F2F2F5] text-xl sm:text-2xl font-black rounded-xl px-3 py-1.5 outline-none transition-colors"
                    />
                  </div>

                  {/* สเตตัสคำพูด Textarea */}
                  <div>
                    <label className="text-[12px] font-semibold text-[#ACACB2] uppercase tracking-wider block mb-1">
                      ข้อความสเตตัส / คำพูดตัวละคร (Character Quote)
                    </label>
                    <textarea
                      rows={2}
                      value={editHeroQuote}
                      onChange={(e) => setEditHeroQuote(e.target.value)}
                      placeholder="คำพูดประจำตัวละครหรือสเตตัส..."
                      className="w-full bg-[#141416] border border-[#EF264C]/60 focus:border-[#EF264C] text-[#F2F2F5] text-[15px] sm:text-[16px] rounded-xl p-2.5 outline-none transition-colors leading-relaxed resize-none"
                    />
                  </div>

                  {/* แฮชแท็ก Input */}
                  <div>
                    <label className="text-[12px] font-semibold text-[#ACACB2] uppercase tracking-wider block mb-1">
                      แฮชแท็ก (Hashtags - คั่นด้วยจุลภาค)
                    </label>
                    <input
                      type="text"
                      value={editHeroHashtags}
                      onChange={(e) => setEditHeroHashtags(e.target.value)}
                      placeholder="#รุ่นพี่สาวแว่น, #สายหมอกซ่อนรูป..."
                      className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13.5px] rounded-xl px-3 py-1.5 outline-none transition-colors font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  {/* แถวบน: ชื่อตัวละคร + ปุ่ม Pencil ต่อท้ายชื่อแบบไร้กรอบ ขนาดสมดุล */}
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-app-primary tracking-tight leading-tight">
                      {draft?.title || activeDraftTitle || 'ตัวละครใหม่'}
                    </h2>

                    {/* ปุ่ม Action: ปุ่มดินสอแก้ไขส่วนหัว ทรงกลมเพรียวบาง */}
                    <button
                      type="button"
                      onClick={handleStartEditHero}
                      title="แก้ไขข้อมูลหลักและสเตตัส"
                      className="w-8 h-8 rounded-full bg-transparent border border-[#2F3336] hover:border-[#EF264C]/60 text-app-secondary hover:text-[#EF264C] flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0 mt-1"
                    >
                      <Pencil size={14} strokeWidth={1.8} />
                    </button>
                  </div>

                  {/* ข้อความสเตตัสตัวละคร (ข้อความรอง สไตล์ Editorial / Fashion E-commerce ขนาดเด่นชัดเจนขึ้น) */}
                  <p className="mt-2.5 sm:mt-3 text-[17px] sm:text-[18.5px] lg:text-[20px] text-[#ACACB2] leading-relaxed font-normal">
                    {draft?.quote ||
                      '"อย่าขยับสิคะ... ถ้าขยับพิษจากละอองเกสรจะยิ่งแล่นเข้าสู่กระแสเลือดนะ ให้รุ่นพี่ช่วยรีดมันออกจะดีกว่า..."'}
                  </p>

                  {/* ชุด Hashtags ทรงแคปซูล Pill ขนาดพอดีคำ อ่านสบายตา */}
                  <div className="flex flex-wrap gap-2 mt-3 sm:mt-3.5">
                    {(
                      draft?.hashtags || [
                        '#รุ่นพี่สาวแว่น',
                        '#สายหมอกซ่อนรูป',
                        '#GapMoeขั้นสุด',
                        '#นักล่ากระหายพิษ',
                        '#ตรรกะรีดพิษด้วยน้ำมังกร',
                      ]
                    ).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-full bg-[#18181b] text-[12.5px] sm:text-[13px] text-[#ACACB2] hover:text-[#EF264C] hover:underline transition-colors cursor-pointer select-none"
                      >
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Card 1: จิตวิทยาสองขั้ว & อัตลักษณ์ (Dual Identity & Mask) */}
            <div
              ref={psychologyCardRef}
              className={`scroll-mt-16 p-4 sm:p-5 rounded-2xl bg-transparent transition-all flex flex-col gap-3.5 ${
                editingCard === 'psychology'
                  ? 'border border-[#EF264C]/60 shadow-[0_0_16px_rgba(239,38,76,0.12)]'
                  : 'border border-[#2F3336]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <Sparkles size={17} className="text-[#EF264C]" />
                  <h3
                    className={`text-[18px] sm:text-[19px] font-bold tracking-tight ${
                      editingCard === 'psychology' ? 'text-[#EF264C]' : 'text-[#F2F2F5]'
                    }`}
                  >
                    {editingCard === 'psychology'
                      ? 'แก้ไขจิตวิทยา & อัตลักษณ์'
                      : 'จิตวิทยาสองขั้ว & อัตลักษณ์'}
                  </h3>
                  {editingCard !== 'psychology' && (
                    <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full border border-[#EF264C]/50 text-[#EF264C] bg-[#EF264C]/10">
                      {draft?.archetype || 'The Cloaked Predator'}
                    </span>
                  )}
                </div>

                {editingCard === 'psychology' ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingCard(null)}
                      title="ยกเลิกการแก้ไข"
                      className="w-8 h-8 rounded-full bg-transparent border border-[#2F3336] hover:border-white/30 text-[#ACACB2] hover:text-[#F2F2F5] flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0"
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePsychology}
                      title="บันทึกข้อมูลจิตวิทยา"
                      className="w-8 h-8 rounded-full border border-[#EF264C]/70 bg-[#EF264C]/15 hover:bg-[#EF264C] text-[#EF264C] hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0 shadow-[0_0_10px_rgba(239,38,76,0.2)]"
                    >
                      <Check size={14} strokeWidth={2.2} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartEditPsychology}
                    title="แก้ไขจิตวิทยาและอัตลักษณ์"
                    className="w-8 h-8 rounded-full bg-transparent border border-[#2F3336] hover:border-[#EF264C]/60 text-app-secondary hover:text-[#EF264C] flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0"
                  >
                    <Pencil size={14} strokeWidth={1.8} />
                  </button>
                )}
              </div>

              {editingCard === 'psychology' ? (
                /* โหมดแก้ไข Card 1 */
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[12px] font-semibold text-[#ACACB2] uppercase tracking-wider block mb-1">
                        Archetype (แม่แบบบุคลิก)
                      </label>
                      <input
                        type="text"
                        value={editArchetype}
                        onChange={(e) => setEditArchetype(e.target.value)}
                        placeholder="เช่น The Cloaked Predator"
                        className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13.5px] rounded-xl px-3 py-1.5 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-[#ACACB2] uppercase tracking-wider block mb-1">
                        คำนิยามสั้น (Description)
                      </label>
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="เช่น นักล่าซ่อนรูปใต้หน้ากากพฤกษศาสตร์"
                        className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13.5px] rounded-xl px-3 py-1.5 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[12px] font-semibold text-[#ACACB2] uppercase tracking-wider block mb-1">
                      🎭 หน้ากากภายนอก (The Mask)
                    </label>
                    <textarea
                      rows={2}
                      value={editTheMask}
                      onChange={(e) => setEditTheMask(e.target.value)}
                      placeholder="บุคลิกที่แสดงต่อหน้าคนอื่น..."
                      className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13.5px] rounded-xl px-3 py-1.5 outline-none transition-colors leading-relaxed resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-semibold text-[#ACACB2] uppercase tracking-wider block mb-1">
                      🩸 แก่นแท้เบื้องลึก (The Core)
                    </label>
                    <textarea
                      rows={2}
                      value={editTheCore}
                      onChange={(e) => setEditTheCore(e.target.value)}
                      placeholder="ตัวตนและแรงขับที่แท้จริง..."
                      className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13.5px] rounded-xl px-3 py-1.5 outline-none transition-colors leading-relaxed resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-semibold text-[#ACACB2] uppercase tracking-wider block mb-1">
                      ⚡ ปมขัดแย้งจุดระเบิด (The Conflict)
                    </label>
                    <textarea
                      rows={2}
                      value={editTheConflict}
                      onChange={(e) => setEditTheConflict(e.target.value)}
                      placeholder="ความขัดแย้งระหว่างสามัญสำนึกกับสัญชาตญาณ..."
                      className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13.5px] rounded-xl px-3 py-1.5 outline-none transition-colors leading-relaxed resize-none"
                    />
                  </div>
                </div>
              ) : (
                /* โหมดแสดงผลปกติ Card 1 */
                <div className="space-y-3 pt-0.5">
                  {draft?.description && (
                    <p className="text-[14px] text-[#ACACB2] leading-relaxed">
                      {draft.description}
                    </p>
                  )}

                  {/* กล่อง 3 มิติจิตวิทยา (The Mask / The Core / The Conflict) */}
                  <div className="space-y-2.5 text-[13.5px] sm:text-[14px] bg-white/[0.015] border border-[#2F3336]/60 rounded-xl p-3.5">
                    <div className="space-y-1">
                      <span className="text-[#F2F2F5] font-semibold flex items-center gap-1.5 text-[13px] sm:text-[13.5px]">
                        <span>🎭 หน้ากากภายนอก (The Mask):</span>
                      </span>
                      <p className="text-[#ACACB2] leading-relaxed pl-1">
                        {draft?.psychology?.the_mask ||
                          'รุ่นพี่สาวแว่นผู้มีการศึกษา พูดจาสุภาพเรียบร้อยเหนียมอาย สวมเสื้อผ้าหนาเตอะเพื่อปิดบังเรือนร่างและหลีกเลี่ยงสังคม'}
                      </p>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-[#2F3336]/40">
                      <span className="text-[#EF264C] font-semibold flex items-center gap-1.5 text-[13px] sm:text-[13.5px]">
                        <span>🩸 แก่นแท้เบื้องลึก (The Core):</span>
                      </span>
                      <p className="text-[#ACACB2] leading-relaxed pl-1">
                        {draft?.psychology?.the_core ||
                          'นักล่ากามารมณ์จอมวางแผนผู้มีความต้องการสูงลิ่ว ใช้ทฤษฎีวิชาการมาบิดเบือนเป็นข้ออ้างเพื่อจับเหยื่อตรึงไว้กับที่อย่างไร้ยางอาย'}
                      </p>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-[#2F3336]/40">
                      <span className="text-[#F2F2F5] font-semibold flex items-center gap-1.5 text-[13px] sm:text-[13.5px]">
                        <span>⚡ ปมจุดระเบิด (The Conflict):</span>
                      </span>
                      <p className="text-[#ACACB2] leading-relaxed pl-1">
                        {draft?.psychology?.the_conflict ||
                          'การต่อสู้ระหว่างสามัญสำนึกของรุ่นพี่ผู้มีการศึกษา กับสัญชาตญาณความต้องการทางเพศที่พร้อมจะปะทุระเบิดทุกครั้งเมื่อร่างกายต้องอุณหภูมิที่ร้อนขึ้น'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: สรีระซ่อนรูป & ภาษากาย (Sensory Anatomy & Wardrobe) */}
            <div
              ref={appearanceCardRef}
              className={`scroll-mt-16 p-4 sm:p-5 rounded-2xl bg-transparent transition-all flex flex-col gap-3.5 ${
                editingCard === 'appearance'
                  ? 'border border-[#EF264C]/60 shadow-[0_0_16px_rgba(239,38,76,0.12)]'
                  : 'border border-[#2F3336]'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`text-[18px] sm:text-[19px] font-bold tracking-tight ${
                    editingCard === 'appearance' ? 'text-[#EF264C]' : 'text-[#F2F2F5]'
                  }`}
                >
                  {editingCard === 'appearance'
                    ? 'แก้ไขสรีระ & ภาษากาย'
                    : 'สรีระซ่อนรูป & ภาษากาย'}
                </h3>

                {editingCard === 'appearance' ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingCard(null)}
                      title="ยกเลิกการแก้ไข"
                      className="w-8 h-8 rounded-full bg-transparent border border-[#2F3336] hover:border-white/30 text-[#ACACB2] hover:text-[#F2F2F5] flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0"
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAppearance}
                      title="บันทึกข้อมูลสรีระ"
                      className="w-8 h-8 rounded-full border border-[#EF264C]/70 bg-[#EF264C]/15 hover:bg-[#EF264C] text-[#EF264C] hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0 shadow-[0_0_10px_rgba(239,38,76,0.2)]"
                    >
                      <Check size={14} strokeWidth={2.2} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartEditAppearance}
                    title="แก้ไขสรีระและภาษากาย"
                    className="w-8 h-8 rounded-full bg-transparent border border-[#2F3336] hover:border-[#EF264C]/60 text-app-secondary hover:text-[#EF264C] flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0"
                  >
                    <Pencil size={14} strokeWidth={1.8} />
                  </button>
                )}
              </div>

              {editingCard === 'appearance' ? (
                /* โหมดแก้ไข Card 2 */
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-[12px] font-semibold text-[#ACACB2] uppercase tracking-wider block mb-1">
                      👘 ชุดที่ 1 (ยูกาตะอำพรางรูป)
                    </label>
                    <textarea
                      rows={2}
                      value={editOutfit1}
                      onChange={(e) => setEditOutfit1(e.target.value)}
                      className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13.5px] rounded-xl px-3 py-1.5 outline-none transition-colors leading-relaxed resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-semibold text-[#ACACB2] uppercase tracking-wider block mb-1">
                      👗 ชุดที่ 2 (เสื้อเชิ้ตแนบเนื้อยามเปียกฝน)
                    </label>
                    <textarea
                      rows={2}
                      value={editOutfit2}
                      onChange={(e) => setEditOutfit2(e.target.value)}
                      className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13.5px] rounded-xl px-3 py-1.5 outline-none transition-colors leading-relaxed resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-semibold text-[#ACACB2] uppercase tracking-wider block mb-1">
                      🌸 จุดเด่นทางสรีระ (แยกบรรทัดละ 1 ข้อ)
                    </label>
                    <textarea
                      rows={3}
                      value={editAnatomy}
                      onChange={(e) => setEditAnatomy(e.target.value)}
                      className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13.5px] rounded-xl px-3 py-1.5 outline-none transition-colors leading-relaxed resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-semibold text-[#ACACB2] uppercase tracking-wider block mb-1">
                      🖐️ ภาษากายประจำตัว (แยกบรรทัดละ 1 ท่า)
                    </label>
                    <textarea
                      rows={3}
                      value={editPostures}
                      onChange={(e) => setEditPostures(e.target.value)}
                      className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13.5px] rounded-xl px-3 py-1.5 outline-none transition-colors leading-relaxed resize-none"
                    />
                  </div>
                </div>
              ) : (
                /* โหมดแสดงผลปกติ Card 2 */
                <div className="space-y-3.5 pt-0.5 text-[13.5px] sm:text-[14px]">
                  {/* เครื่องแต่งกาย */}
                  <div className="space-y-1.5">
                    <span className="text-[#F2F2F5] font-semibold flex items-center gap-1.5 text-[13px] sm:text-[13.5px]">
                      <span>👘 ชุดเครื่องแต่งกาย (Wardrobe):</span>
                    </span>
                    <div className="space-y-1 pl-1">
                      <p className="text-[#ACACB2] leading-relaxed">
                        <strong className="text-[#F2F2F5]">Outfit 1:</strong>{' '}
                        {draft?.appearance?.wardrobe?.outfit_1?.[0] ||
                          'ชุดยูกาตะผ้าฝ้ายเนื้อหนาสีเข้มตัวโคร่งที่ดูแบนราบไร้ส่วนเว้าโค้ง พร้อมแว่นตากรอบหนาเตอะปิดบังใบหน้า'}
                      </p>
                      <p className="text-[#ACACB2] leading-relaxed">
                        <strong className="text-[#F2F2F5]">Outfit 2:</strong>{' '}
                        {draft?.appearance?.wardrobe?.outfit_2?.[0] ||
                          'เสื้อเชิ้ตสีขาวและกระโปรงยาวสีทึบเรียบร้อย ทว่ายามเปียกฝนจะแนบเนื้อจนโปร่งแสง เผยให้เห็นบราเซียลูกไม้สีดำสนิทขัดกับผิวขาวจัด'}
                      </p>
                    </div>
                  </div>

                  {/* จุดเด่นทางสรีระ */}
                  <div className="space-y-1.5 pt-2.5 border-t border-[#2F3336]/50">
                    <span className="text-[#F2F2F5] font-semibold flex items-center gap-1.5 text-[13px] sm:text-[13.5px]">
                      <span>🌸 สรีระสะบึมซ่อนรูป (Anatomy):</span>
                    </span>
                    <ul className="space-y-1.5 pl-1">
                      {(
                        draft?.appearance?.anatomy_features || [
                          'แว่นตากรอบโลหะหนาเตอะที่ปิดบังดวงตาสีดำขลับปลาบเยิ้มที่ซ่อนความต้องการทางเพศเอาไว้ข้างใน',
                          'ผิวขาวเนียนละเอียดดุจน้ำนมที่ขึ้นสีชมพูระเรื่ออย่างรวดเร็วเมื่อสัมผัสกับความร้อน',
                          'รูปร่างนาฬิกาทรายสุดสะบึม (อกอวบใหญ่สะบึม สะโพกผึ่งผาย) ที่ซ่อนอยู่ภายใต้เสื้อผ้าตัวโคร่ง',
                          'ซอกคอและกระดูกไหปลาร้าที่มักมีเหงื่อและไอน้ำระเหยฟุ้งออกมา',
                        ]
                      ).map((feature, idx) => (
                        <li key={idx} className="text-[#ACACB2] leading-relaxed flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C] mt-2 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* ภาษากายประจำตัว */}
                  <div className="space-y-1.5 pt-2.5 border-t border-[#2F3336]/50">
                    <span className="text-[#F2F2F5] font-semibold flex items-center gap-1.5 text-[13px] sm:text-[13.5px]">
                      <span>🖐️ ภาษากายประจำตัว (Signature Postures):</span>
                    </span>
                    <ul className="space-y-1.5 pl-1">
                      {(
                        draft?.appearance?.signature_postures || [
                          'การใช้นิ้วชี้ดันดั้งแว่นตาขึ้นเพื่อเก็บซ่อนสายตาหิวกระหายยามปั้นหน้าสุภาพเหนียมอาย',
                          'ทิ้งตัวซบแผงอกหรือเกาะบ่าเหยื่อแน่นด้วยร่างกายท่อนล่างที่อ่อนแรงและสั่นเทาจากการเกร็งสะท้าน',
                          'ท่านั่งพับเพียบเรียบร้อย แต่แอบจงใจขยับสะโพกบดเบียดพื้นหรือเกร็งหน้าขาหนีบเข้าหากัน',
                        ]
                      ).map((posture, idx) => (
                        <li key={idx} className="text-[#ACACB2] leading-relaxed flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C]/80 mt-2 shrink-0" />
                          <span>{posture}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Card 3: ดัชนีสเตตัส & สเกลแรงขับปรารถนา (Core Stats & Hidden Drives - Single Card, 2 Sections) */}
            <div
              ref={statsCardRef}
              className={`scroll-mt-16 p-4 sm:p-5 rounded-2xl bg-transparent transition-all flex flex-col gap-3.5 ${
                editingCard === 'stats'
                  ? 'border border-[#EF264C]/60 shadow-[0_0_16px_rgba(239,38,76,0.12)]'
                  : 'border border-[#2F3336]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3
                    className={`text-[18px] sm:text-[19px] font-bold tracking-tight ${
                      editingCard === 'stats' ? 'text-[#EF264C]' : 'text-[#F2F2F5]'
                    }`}
                  >
                    {editingCard === 'stats'
                      ? 'แก้ไขดัชนีสเตตัส'
                      : 'สเตตัส & แรงขับปรารถนา'}
                  </h3>
                </div>

                {editingCard === 'stats' ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingCard(null)}
                      title="ยกเลิกการแก้ไข"
                      className="w-8 h-8 rounded-full bg-transparent border border-[#2F3336] hover:border-white/30 text-[#ACACB2] hover:text-[#F2F2F5] flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0"
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveStats}
                      title="บันทึกข้อมูลสเตตัส"
                      className="w-8 h-8 rounded-full border border-[#EF264C]/70 bg-[#EF264C]/15 hover:bg-[#EF264C] text-[#EF264C] hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0 shadow-[0_0_10px_rgba(239,38,76,0.2)]"
                    >
                      <Check size={14} strokeWidth={2.2} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartEditStats}
                    title="แก้ไขค่าสเตตัส"
                    className="w-8 h-8 rounded-full bg-transparent border border-[#2F3336] hover:border-[#EF264C]/60 text-app-secondary hover:text-[#EF264C] flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0"
                  >
                    <Pencil size={14} strokeWidth={1.8} />
                  </button>
                )}
              </div>

              {/* โซนที่ 1: ค่าปฏิสัมพันธ์หลัก 7 มิติ (Core Social Stats) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] sm:text-[13.5px] font-bold text-[#F2F2F5] tracking-wide flex items-center gap-1.5">
                    <Layers size={14} className="text-[#EF264C]" />
                    <span>ค่าปฏิสัมพันธ์หลัก 7 มิติ (Core Social Stats)</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-0.5">
                  {PRIMARY_STATS_CONFIG.map((stat) => {
                    const val =
                      editingCard === 'stats'
                        ? editStats[stat.key] ?? stat.defaultVal
                        : draft?.core_stats?.[stat.key] ?? draft?.stats?.[stat.key] ?? stat.defaultVal;

                    return (
                      <div key={stat.key} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-[#F2F2F5] font-medium truncate">
                            {stat.label}{' '}
                            <span className="text-[11.5px] text-[#ACACB2]/70 font-mono">
                              ({stat.en})
                            </span>
                          </span>
                          <span className="text-[#ACACB2] font-bold font-mono text-[13px] ml-2 shrink-0">
                            {val}/10
                          </span>
                        </div>
                        {editingCard === 'stats' ? (
                          <input
                            type="range"
                            min="1"
                            max="10"
                            step="1"
                            value={val}
                            onChange={(e) =>
                              setEditStats((prev) => ({
                                ...prev,
                                [stat.key]: Number(e.target.value),
                              }))
                            }
                            className="w-full h-1.5 bg-[#2F3336] rounded-full appearance-none cursor-pointer accent-[#EF264C] outline-none"
                          />
                        ) : (
                          <div className="w-full h-[3px] rounded-full bg-[#2F3336] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#EF264C] transition-all duration-300 ease-out"
                              style={{ width: `${(val / 10) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* โซนที่ 2: สภาวะพิเศษ & เกราะหน้ากาก (Special State & Mask) */}
              <div className="space-y-2.5 pt-3 border-t border-[#2F3336]/60">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] sm:text-[13.5px] font-bold text-[#F2F2F5] tracking-wide flex items-center gap-1.5">
                    <Shield size={14} className="text-[#EF264C]" />
                    <span>สภาวะพิเศษ & เกราะหน้ากาก (Special Instinct)</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-0.5">
                  {SPECIAL_STATS_CONFIG.map((stat) => {
                    const val =
                      editingCard === 'stats'
                        ? editStats[stat.key] ?? stat.defaultVal
                        : draft?.core_stats?.[stat.key] ?? draft?.stats?.[stat.key] ?? stat.defaultVal;

                    return (
                      <div key={stat.key} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-[#F2F2F5] font-medium truncate">
                            {stat.label}{' '}
                            <span className="text-[11.5px] text-[#ACACB2]/70 font-mono">
                              ({stat.en})
                            </span>
                          </span>
                          <span
                            className={`font-bold font-mono text-[13px] ml-2 shrink-0 ${
                              val === 10 ? 'text-[#EF264C]' : 'text-[#ACACB2]'
                            }`}
                          >
                            {val}/10 {val === 10 && '🔥'}
                          </span>
                        </div>
                        {editingCard === 'stats' ? (
                          <input
                            type="range"
                            min="1"
                            max="10"
                            step="1"
                            value={val}
                            onChange={(e) =>
                              setEditStats((prev) => ({
                                ...prev,
                                [stat.key]: Number(e.target.value),
                              }))
                            }
                            className="w-full h-1.5 bg-[#2F3336] rounded-full appearance-none cursor-pointer accent-[#EF264C] outline-none"
                          />
                        ) : (
                          <div className="w-full h-[3px] rounded-full bg-[#2F3336] overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ease-out ${
                                stat.key === 'mask_integrity'
                                  ? 'bg-amber-400'
                                  : 'bg-[#EF264C]'
                              }`}
                              style={{ width: `${(val / 10) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* โซนที่ 3: มาตรวัดความต้องการสูงสุด (Max Desire Gauge) */}
              <div className="pt-2.5 border-t border-[#2F3336]/60">
                <div className="flex items-center justify-between text-[13px] sm:text-[13.5px] mb-1.5">
                  <span className="text-[#F2F2F5] font-bold flex items-center gap-1.5">
                    <Flame size={15} className="text-[#EF264C]" />
                    <span>ขีดจำกัดแรงขับปรารถนาสูงสุด (Max Desire)</span>
                  </span>
                  <span className="text-[#EF264C] font-mono font-bold text-[14px]">
                    {editingCard === 'stats' ? editMaxDesire : draft?.max_desire || 500}
                  </span>
                </div>

                {editingCard === 'stats' ? (
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={editMaxDesire}
                    onChange={(e) => setEditMaxDesire(Number(e.target.value))}
                    className="w-full h-2 bg-[#2F3336] rounded-full appearance-none cursor-pointer accent-[#EF264C] outline-none"
                  />
                ) : (
                  <div className="w-full h-2 rounded-full bg-[#2F3336] overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#D22147] to-[#EF264C] transition-all duration-500 shadow-[0_0_8px_rgba(239,38,76,0.5)]"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(((draft?.max_desire || 500) / 1000) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Card 4: จุดสติหลุด & สกิลติดตัว (Passive Perks & Sensual Quirks) */}
            <div
              ref={perksCardRef}
              className={`scroll-mt-16 p-4 sm:p-5 rounded-2xl bg-transparent transition-all flex flex-col gap-3.5 ${
                editingCard === 'perks'
                  ? 'border border-[#EF264C]/60 shadow-[0_0_16px_rgba(239,38,76,0.12)]'
                  : 'border border-[#2F3336]'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`text-[18px] sm:text-[19px] font-bold tracking-tight ${
                    editingCard === 'perks' ? 'text-[#EF264C]' : 'text-[#F2F2F5]'
                  }`}
                >
                  {editingCard === 'perks'
                    ? 'แก้ไขสกิลติดตัว & รสนิยม'
                    : 'จุดสติหลุด & สกิลติดตัว'}
                </h3>

                {editingCard === 'perks' ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingCard(null)}
                      title="ยกเลิกการแก้ไข"
                      className="w-8 h-8 rounded-full bg-transparent border border-[#2F3336] hover:border-white/30 text-[#ACACB2] hover:text-[#F2F2F5] flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0"
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePerks}
                      title="บันทึกข้อมูลสกิล"
                      className="w-8 h-8 rounded-full border border-[#EF264C]/70 bg-[#EF264C]/15 hover:bg-[#EF264C] text-[#EF264C] hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0 shadow-[0_0_10px_rgba(239,38,76,0.2)]"
                    >
                      <Check size={14} strokeWidth={2.2} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartEditPerks}
                    title="แก้ไขสกิลติดตัวและรสนิยม"
                    className="w-8 h-8 rounded-full bg-transparent border border-[#2F3336] hover:border-[#EF264C]/60 text-app-secondary hover:text-[#EF264C] flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0"
                  >
                    <Pencil size={14} strokeWidth={1.8} />
                  </button>
                )}
              </div>

              {editingCard === 'perks' ? (
                /* โหมดแก้ไข Card 4 */
                <div className="space-y-3 pt-1">
                  {editPerks.map((perk, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-3 rounded-xl border border-[#2F3336] bg-[#141416] space-y-2"
                    >
                      <input
                        type="text"
                        value={perk.perk_name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditPerks((prev) =>
                            prev.map((item, idx) =>
                              idx === pIdx ? { ...item, perk_name: val } : item
                            )
                          );
                        }}
                        placeholder="ชื่อสกิล..."
                        className="w-full bg-[#1D1D22] border border-[#2F3336] text-[#F2F2F5] font-semibold text-[13.5px] rounded-lg px-2.5 py-1.5 outline-none"
                      />
                      <input
                        type="text"
                        value={perk.trigger}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditPerks((prev) =>
                            prev.map((item, idx) =>
                              idx === pIdx ? { ...item, trigger: val } : item
                            )
                          );
                        }}
                        placeholder="เงื่อนไขกระตุ้น (Trigger)..."
                        className="w-full bg-[#1D1D22] border border-[#2F3336] text-[#ACACB2] text-[13px] rounded-lg px-2.5 py-1.5 outline-none"
                      />
                      <textarea
                        rows={2}
                        value={perk.effect}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditPerks((prev) =>
                            prev.map((item, idx) =>
                              idx === pIdx ? { ...item, effect: val } : item
                            )
                          );
                        }}
                        placeholder="ผลลัพธ์ (Effect)..."
                        className="w-full bg-[#1D1D22] border border-[#2F3336] text-[#ACACB2] text-[13px] rounded-lg px-2.5 py-1.5 outline-none leading-relaxed resize-none"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="text-[12px] font-semibold text-[#ACACB2] uppercase tracking-wider block mb-1">
                      👍 สิ่งที่ชอบ (Likes - คั่นด้วยจุลภาค)
                    </label>
                    <input
                      type="text"
                      value={editLikes}
                      onChange={(e) => setEditLikes(e.target.value)}
                      className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13.5px] rounded-xl px-3 py-1.5 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-semibold text-[#ACACB2] uppercase tracking-wider block mb-1">
                      👎 สิ่งที่ไม่ชอบ (Dislikes - คั่นด้วยจุลภาค)
                    </label>
                    <input
                      type="text"
                      value={editDislikes}
                      onChange={(e) => setEditDislikes(e.target.value)}
                      className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13.5px] rounded-xl px-3 py-1.5 outline-none"
                    />
                  </div>
                </div>
              ) : (
                /* โหมดแสดงผลปกติ Card 4 */
                <div className="space-y-3 pt-0.5 text-[13.5px] sm:text-[14px]">
                  {/* กล่องสกิล 3 ข้อ */}
                  <div className="space-y-2">
                    {(
                      draft?.passive_perks || [
                        {
                          perk_name: 'Thermal Shock (จุดระเบิดสติหลุด)',
                          trigger:
                            'ร่างกายสัมผัสความร้อนจากภายนอก เช่น ออนเซ็น, ไข้, หรือน้ำมันสมุนไพรอุ่น',
                          effect:
                            'ลดค่า Mask Integrity ลงเหลือ 1 ทันที ร่างกายท่อนล่างสูญเสียการพยุงตัวจนต้องเกาะยึดตัวเป้าหมาย และเพิ่มความต้องการทางเพศถึงขีดสุด',
                        },
                        {
                          perk_name: 'ตรรกะรีดพิษพฤกษศาสตร์',
                          trigger: 'เมื่อเป้าหมายมีท่าทีสับสนหรือขัดขืนในพื้นที่อับสายตา',
                          effect:
                            'ใช้ทฤษฎีสมุนไพรมาบิดเบือนสร้างเหตุผลความจำเป็นในการ "รีดพิษ" ทำให้การขัดขืนของเป้าหมายลดลงอย่างราบคาบ',
                        },
                        {
                          perk_name: 'สวิตช์ขาแว่นเย็นเยือก',
                          trigger: 'สัมผัสความเย็นเฉียบของโลหะที่ใบหน้าหรือสวมแว่นตากลับคืน',
                          effect:
                            'เรียกคืนค่าสติและฟื้นฟู Mask Integrity กลับมา 50% ชั่วคราว แม้ว่าร่างกายท่อนล่างยังคงเปียกเยิ้มและสั่นสะท้านอยู่ก็ตาม',
                        },
                      ]
                    ).map((perk, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-[#2F3336]/80 bg-white/[0.015] space-y-1.5 hover:border-[#EF264C]/40 transition-colors"
                      >
                        <h4 className="text-[14px] font-bold text-[#F2F2F5] flex items-center gap-1.5">
                          <Zap size={14} className="text-[#EF264C]" />
                          <span>{perk.perk_name}</span>
                        </h4>
                        <p className="text-[#ACACB2] text-[13px] sm:text-[13.5px] leading-relaxed">
                          <strong className="text-[#F2F2F5]">🎯 เงื่อนไข:</strong> {perk.trigger}
                        </p>
                        <p className="text-[#EF264C]/90 text-[13px] sm:text-[13.5px] leading-relaxed">
                          <strong className="text-[#EF264C]">⚡ ผลลัพธ์:</strong> {perk.effect}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* รสนิยมความชอบ */}
                  <div className="space-y-2.5 pt-2.5 border-t border-[#2F3336]/50">
                    <div>
                      <span className="text-[13px] sm:text-[13.5px] font-semibold text-[#F2F2F5] flex items-center gap-1.5 mb-1.5">
                        <ThumbsUp size={13} className="text-emerald-400" />
                        <span>สิ่งที่ชอบ (Likes):</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(
                          draft?.preferences?.likes || [
                            'การแช่ออนเซ็น',
                            'น้ำมันสมุนไพรฤทธิ์ร้อน',
                            'การจัดตารางเวลาสองต่อสองในห้องชมรมพฤกษศาสตร์',
                            'รุ่นน้องหนุ่มผู้ว่าง่าย',
                            'การวิจัยสรรพคุณพืชสมุนไพร',
                          ]
                        ).map((like, lIdx) => (
                          <span
                            key={lIdx}
                            className="text-[12px] sm:text-[12.5px] px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                          >
                            {like}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-1.5">
                      <span className="text-[13px] sm:text-[13.5px] font-semibold text-[#F2F2F5] flex items-center gap-1.5 mb-1.5">
                        <ThumbsDown size={13} className="text-rose-400" />
                        <span>สิ่งที่ไม่ชอบ (Dislikes):</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(
                          draft?.preferences?.dislikes || [
                            'ขาแว่นโลหะที่เย็นเฉียบ',
                            'สภาพอากาศหนาวจัดที่ไม่มีแหล่งความร้อน',
                            'การถูกขัดจังหวะขณะกำลัง "รีดพิษ"',
                          ]
                        ).map((dislike, dIdx) => (
                          <span
                            key={dIdx}
                            className="text-[12px] sm:text-[12.5px] px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300"
                          >
                            {dislike}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Card 5: ปูมหลัง & วิวัฒนาการความสัมพันธ์ (Lore & Phase Evolution) */}
            <div
              ref={loreCardRef}
              className={`scroll-mt-16 p-4 sm:p-5 rounded-2xl bg-transparent transition-all flex flex-col gap-3.5 ${
                editingCard === 'lore'
                  ? 'border border-[#EF264C]/60 shadow-[0_0_16px_rgba(239,38,76,0.12)]'
                  : 'border border-[#2F3336]'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`text-[18px] sm:text-[19px] font-bold tracking-tight ${
                    editingCard === 'lore' ? 'text-[#EF264C]' : 'text-[#F2F2F5]'
                  }`}
                >
                  {editingCard === 'lore'
                    ? 'แก้ไขปูมหลัง & วิวัฒนาการ'
                    : 'ปูมหลัง & วิวัฒนาการ'}
                </h3>

                {editingCard === 'lore' ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingCard(null)}
                      title="ยกเลิกการแก้ไข"
                      className="w-8 h-8 rounded-full bg-transparent border border-[#2F3336] hover:border-white/30 text-[#ACACB2] hover:text-[#F2F2F5] flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0"
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveLore}
                      title="บันทึกข้อมูลปูมหลัง"
                      className="w-8 h-8 rounded-full border border-[#EF264C]/70 bg-[#EF264C]/15 hover:bg-[#EF264C] text-[#EF264C] hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0 shadow-[0_0_10px_rgba(239,38,76,0.2)]"
                    >
                      <Check size={14} strokeWidth={2.2} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartEditLore}
                    title="แก้ไขปูมหลังและวิวัฒนาการ"
                    className="w-8 h-8 rounded-full bg-transparent border border-[#2F3336] hover:border-[#EF264C]/60 text-app-secondary hover:text-[#EF264C] flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0"
                  >
                    <Pencil size={14} strokeWidth={1.8} />
                  </button>
                )}
              </div>

              {editingCard === 'lore' ? (
                /* โหมดแก้ไข Card 5 */
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-[12px] font-semibold text-[#ACACB2] uppercase tracking-wider block mb-1">
                      📜 ประวัติปูมหลัง (เว้นวรรค 2 บรรทัดเพื่อแยกย่อหน้า)
                    </label>
                    <textarea
                      rows={5}
                      value={editBackground}
                      onChange={(e) => setEditBackground(e.target.value)}
                      className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13.5px] sm:text-[14px] rounded-xl px-3 py-1.5 outline-none transition-colors leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[12px] font-semibold text-[#ACACB2] uppercase tracking-wider block mb-1">
                        เงื่อนไข Desire ขั้นต่ำ
                      </label>
                      <input
                        type="number"
                        value={editDesireMin}
                        onChange={(e) => setEditDesireMin(Number(e.target.value))}
                        className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13.5px] rounded-xl px-3 py-1.5 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-[#ACACB2] uppercase tracking-wider block mb-1">
                        เงื่อนไข Affection ขั้นต่ำ
                      </label>
                      <input
                        type="number"
                        value={editAffectionMin}
                        onChange={(e) => setEditAffectionMin(Number(e.target.value))}
                        className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13.5px] rounded-xl px-3 py-1.5 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[12px] font-semibold text-[#ACACB2] uppercase tracking-wider block mb-1">
                      🌱 รายละเอียดวิวัฒนาการ Phase 2
                    </label>
                    <textarea
                      rows={3}
                      value={editEvolutionDesc}
                      onChange={(e) => setEditEvolutionDesc(e.target.value)}
                      className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13.5px] rounded-xl px-3 py-1.5 outline-none leading-relaxed resize-none"
                    />
                  </div>
                </div>
              ) : (
                /* โหมดแสดงผลปกติ Card 5 */
                <div className="space-y-3.5 pt-0.5 text-[13.5px] sm:text-[14px]">
                  {/* ประวัติปูมหลัง */}
                  <div className="space-y-1.5">
                    <span className="text-[#F2F2F5] font-semibold flex items-center gap-1.5 text-[13px] sm:text-[13.5px]">
                      <BookOpen size={14} className="text-[#EF264C]" />
                      <span>ประวัติปูมหลัง (Background Lore):</span>
                    </span>
                    <div className="space-y-2 text-[#ACACB2] leading-relaxed pl-1">
                      {(
                        draft?.background_story || [
                          'รุ่นพี่ปี 3 ผู้ครองตำแหน่งประธานชมรมพฤกษศาสตร์ มีประวัติเรียนดีเด่นและขึ้นชื่อเรื่องความสุภาพ เรียบร้อย และเก็บเนื้อเก็บตัวจนเกือบจะดูขี้ขลาดในสายตาคนนอก',
                          'เบื้องหลังคือผู้เชี่ยวชาญด้านสมุนไพรและสรีรวิทยาของพืชที่มีรสนิยมลึกลับ เธอหลงใหลการสร้างสถานการณ์ "พื้นที่อับ" เพื่อล่อลวงรุ่นน้องที่เธอหมายตา',
                          'มีความลับทางร่างกายที่ไม่อาจบอกใครได้ว่า ตนเองจะสูญเสียการควบคุมสติสัมปชัญญะทันทีเมื่อร่างกายได้รับความร้อนหรือน้ำมันนวดฤทธิ์ร้อน',
                        ]
                      ).map((paragraph, pIdx) => (
                        <p key={pIdx}>{paragraph}</p>
                      ))}
                    </div>
                  </div>

                  {/* วิวัฒนาการความสัมพันธ์ Phase 2 */}
                  <div className="space-y-2 pt-2.5 border-t border-[#2F3336]/50">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="text-[#F2F2F5] font-semibold flex items-center gap-1.5 text-[13px] sm:text-[13.5px]">
                        <Heart size={14} className="text-[#EF264C]" />
                        <span>วิวัฒนาการความสัมพันธ์ (Phase 2):</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] px-2.5 py-0.5 rounded-full border border-[#EF264C]/50 text-[#EF264C] bg-[#EF264C]/10 font-mono">
                          Desire {draft?.dynamic_evolution?.phase_2?.requirements?.desire_min || 40}+
                        </span>
                        <span className="text-[12px] px-2.5 py-0.5 rounded-full border border-pink-500/50 text-pink-300 bg-pink-500/10 font-mono">
                          Affection {draft?.dynamic_evolution?.phase_2?.requirements?.affection_min || 60}+
                        </span>
                      </div>
                    </div>
                    <p className="text-[#ACACB2] leading-relaxed pl-1">
                      {draft?.dynamic_evolution?.phase_2?.phase_description ||
                        'รุ่นพี่มาฮิโระจะเริ่มทิ้งระยะห่างอย่างเป็นทางการน้อยลง เธอจะจงใจแกล้ง "ซุ่มซ่าม" ทำตัวเปียกฝนหรือขอให้เป้าหมายช่วยทายานวดสมุนไพรร้อนตามร่างกายบ่อยครั้งขึ้น โดยเริ่มเปิดเผยแว่นตาที่ขึ้นฝ้าและถอดมันออกต่อหน้าเพื่อเผยสายตานักล่าอย่างโจ่งแจ้ง'}
                    </p>
                  </div>

                  {/* สีหน้าและปฏิกิริยายามหลุด (Micro-Expressions) */}
                  <div className="space-y-2 pt-2.5 border-t border-[#2F3336]/50">
                    <span className="text-[#F2F2F5] font-semibold flex items-center gap-1.5 text-[13px] sm:text-[13.5px]">
                      <Sparkles size={14} className="text-[#EF264C]" />
                      <span>สีหน้าและภาษากายปลีกย่อย (Micro-Expressions):</span>
                    </span>
                    <div className="space-y-2 pl-1">
                      <div>
                        <strong className="text-[#EF264C] text-[12.5px] sm:text-[13px] block">
                          🔥 ยามตัณหาสูง (When Desire High):
                        </strong>
                        <p className="text-[#ACACB2] text-[13px] sm:text-[13.5px] leading-relaxed">
                          {draft?.micro_expressions?.when_desire_high?.[0] ||
                            'ดวงตาหรี่ปัดปลาบเยิ้ม ลมหายใจร้อนระอุเริ่มหอบถี่จนหน้าอกกระเพื่อมไหวรุนแรงอย่างไร้การควบคุม'}
                        </p>
                      </div>
                      <div>
                        <strong className="text-[#F2F2F5] text-[12.5px] sm:text-[13px] block">
                          😳 ยามเขินแต่เก๊กนิ่ง (Shy but Deadpan):
                        </strong>
                        <p className="text-[#ACACB2] text-[13px] sm:text-[13.5px] leading-relaxed">
                          {draft?.micro_expressions?.when_shy_but_deadpan?.[0] ||
                            'ดึงคอเสื้อยูกาตะตัวหนาขึ้นมาปิดแก้มที่เริ่มซับสีระเรื่อ พร้อมส่งเสียงอุบอิบในลำคอแสร้งทำเป็นไม่สนใจ'}
                        </p>
                      </div>
                      <div>
                        <strong className="text-amber-300 text-[12.5px] sm:text-[13px] block">
                          ✨ ยามดีใจแต่แอบซ่อน (Happy but Hiding):
                        </strong>
                        <p className="text-[#ACACB2] text-[13px] sm:text-[13.5px] leading-relaxed">
                          {draft?.micro_expressions?.when_happy_but_hiding?.[0] ||
                            'ริมฝีปากเม้มเข้าหากันเล็กน้อยเพื่อกลั้นยิ้ม ขณะที่สายตาแอบเหลือบมองเป้าหมายผ่านช่องว่างเหนือกรอบแว่น'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* ================= WORLD MODE CARDS ================= */
          <>
            {/* Card 1 (Hero Card): เควส & ไทม์ไลน์ฉากเหตุการณ์ (Dungeon Master Quest Engine) */}
            <div className="mt-4">
              <ScenarioEngineCard
                scenario={scenarioData}
                onUpdateScenario={handleUpdateScenario}
                cardRef={scenarioCardRef}
              />
            </div>

            {/* Card 2: แก่นโลก & บรรยากาศ (มีปุ่มดินสอกลมขวาบน และแก้ไขได้จริงแบบ Real-time) */}
            <div
              ref={worldCoreCardRef}
              className={`mt-4 scroll-mt-4 p-4 sm:p-5 rounded-2xl bg-transparent transition-all flex flex-col gap-3 ${
                editingCard === 'world_core'
                  ? 'border border-[#EF264C]/60 shadow-[0_0_16px_rgba(239,38,76,0.12)]'
                  : 'border border-[#2F3336]'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`text-[18px] sm:text-[19px] font-bold tracking-tight ${
                    editingCard === 'world_core' ? 'text-[#EF264C]' : 'text-[#F2F2F5]'
                  }`}
                >
                  {editingCard === 'world_core'
                    ? 'แก้ไขแก่นโลก & บรรยากาศ'
                    : 'แก่นโลก & บรรยากาศ'}
                </h3>

                {editingCard === 'world_core' ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingCard(null)}
                      title="ยกเลิกการแก้ไข"
                      className="w-8 h-8 rounded-full bg-transparent border border-[#2F3336] hover:border-white/30 text-[#ACACB2] hover:text-[#F2F2F5] flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0"
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveWorldCore}
                      title="บันทึกข้อมูลแก่นโลก"
                      className="w-8 h-8 rounded-full border border-[#EF264C]/70 bg-[#EF264C]/15 hover:bg-[#EF264C] text-[#EF264C] hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0 shadow-[0_0_10px_rgba(239,38,76,0.2)]"
                    >
                      <Check size={14} strokeWidth={2.2} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartEditWorldCore}
                    title="แก้ไขแก่นโลกและบรรยากาศ"
                    className="w-8 h-8 rounded-full bg-transparent border border-[#2F3336] hover:border-[#EF264C]/60 text-app-secondary hover:text-[#EF264C] flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0"
                  >
                    <Pencil size={14} strokeWidth={1.8} />
                  </button>
                )}
              </div>

              {editingCard === 'world_core' ? (
                /* โหมดแก้ไขแก่นโลกและบรรยากาศ */
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-[12px] font-semibold text-[#ACACB2] uppercase tracking-wider block mb-1">
                      ชื่อโลกคู่กัน (Paired World Name)
                    </label>
                    <input
                      type="text"
                      value={editWorldTitle}
                      onChange={(e) => setEditWorldTitle(e.target.value)}
                      placeholder="ชื่อโลก..."
                      className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13.5px] rounded-xl px-3 py-2 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-semibold text-[#ACACB2] uppercase tracking-wider block mb-1">
                      🌃 Visual Palette (โทนภาพและแสงสี)
                    </label>
                    <input
                      type="text"
                      value={editWorldVisual}
                      onChange={(e) => setEditWorldVisual(e.target.value)}
                      placeholder="เช่น แสงนีออนสีชมพูซีด สะท้อนผิวน้ำขัง..."
                      className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13.5px] rounded-xl px-3 py-2 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-semibold text-[#ACACB2] uppercase tracking-wider block mb-1">
                      🎧 Soundscape (บรรยากาศเสียง)
                    </label>
                    <input
                      type="text"
                      value={editWorldSound}
                      onChange={(e) => setEditWorldSound(e.target.value)}
                      placeholder="เช่น เสียงฝนตกกระทบกระจกหน้าร้านสะดวกซื้อ..."
                      className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13.5px] rounded-xl px-3 py-2 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-semibold text-[#ACACB2] uppercase tracking-wider block mb-1">
                      ⚡ Core Paradox (ความขัดแย้งหลักของโลก)
                    </label>
                    <input
                      type="text"
                      value={editWorldConflict}
                      onChange={(e) => setEditWorldConflict(e.target.value)}
                      placeholder="เช่น ในเวลางานเธอถูกทุกคนจับจ้อง แต่นอกเวลางาน..."
                      className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13.5px] rounded-xl px-3 py-2 outline-none transition-colors"
                    />
                  </div>
                </div>
              ) : (
                /* โหมดแสดงผลปกติ */
                <>
                  <div className="text-[13.5px] sm:text-[14px] text-[#ACACB2] leading-relaxed space-y-2.5">
                    <p className="text-[#F2F2F5] font-bold text-[15px]">
                      {draft?.worldTitle || activeWorldTitle || 'The Paid Smile & Off-Duty Ice'}
                    </p>
                    <div className="space-y-1.5 text-[13.5px] sm:text-[14px]">
                      <p>
                        <strong className="text-[#F2F2F5]">🌃 Visual Palette:</strong>{' '}
                        {draft?.worldVisual ||
                          'แสงนีออนสีชมพูซีด สะท้อนผิวน้ำขังบนพื้นถนนยางมะตอยเปียกฝน'}
                      </p>
                      <p>
                        <strong className="text-[#F2F2F5]">🎧 Soundscape:</strong>{' '}
                        {draft?.worldSound ||
                          'เสียงฝนซัดสาดกระจกหน้าร้านสะดวกซื้อ สลับกับเสียงลมหายใจแผ่วเบา'}
                      </p>
                      <p>
                        <strong className="text-[#F2F2F5]">⚡ Core Paradox:</strong>{' '}
                        {draft?.worldConflict ||
                          'ในเวลางานเธอถูกทุกคนจับจ้อง แต่นอกเวลางานเธอขอเป็นเพียงอากาศธาตุ'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2.5 flex flex-wrap gap-2 border-t border-[#2F3336]/60">
                    <span className="text-[12.5px] sm:text-[13px] text-[#ACACB2] hover:text-[#EF264C] cursor-pointer transition-colors">
                      #AkihabaraNoir
                    </span>
                    <span className="text-[12.5px] sm:text-[13px] text-[#ACACB2] hover:text-[#EF264C] cursor-pointer transition-colors">
                      #OffDutyIce
                    </span>
                    <span className="text-[12.5px] sm:text-[13px] text-[#ACACB2] hover:text-[#EF264C] cursor-pointer transition-colors">
                      #2AMSanctuary
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Card 2: สถานที่สำคัญ (มีปุ่มดินสอกลมขวาบน และแก้ไขชื่อพิกัดได้จริง) */}
            <div
              ref={locationsCardRef}
              className={`scroll-mt-4 p-4 sm:p-5 rounded-2xl bg-transparent transition-all flex flex-col gap-3 ${
                editingCard === 'locations'
                  ? 'border border-[#EF264C]/60 shadow-[0_0_16px_rgba(239,38,76,0.12)]'
                  : 'border border-[#2F3336]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <h3
                    className={`text-[18px] sm:text-[19px] font-bold tracking-tight ${
                      editingCard === 'locations' ? 'text-[#EF264C]' : 'text-[#F2F2F5]'
                    }`}
                  >
                    {editingCard === 'locations' ? 'แก้ไขสถานที่สำคัญ' : 'สถานที่สำคัญ'}
                  </h3>
                  <span className="text-[12.5px] text-[#ACACB2]">{locations.length} พิกัดหลัก</span>
                </div>

                {editingCard === 'locations' ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingCard(null)}
                      title="ยกเลิกการแก้ไข"
                      className="w-8 h-8 rounded-full bg-transparent border border-[#2F3336] hover:border-white/30 text-[#ACACB2] hover:text-[#F2F2F5] flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0"
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveLocations}
                      title="บันทึกสถานที่"
                      className="w-8 h-8 rounded-full border border-[#EF264C]/70 bg-[#EF264C]/15 hover:bg-[#EF264C] text-[#EF264C] hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0 shadow-[0_0_10px_rgba(239,38,76,0.2)]"
                    >
                      <Check size={14} strokeWidth={2.2} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartEditLocations}
                    title="แก้ไขสถานที่สำคัญ"
                    className="w-8 h-8 rounded-full bg-transparent border border-[#2F3336] hover:border-[#EF264C]/60 text-app-secondary hover:text-[#EF264C] flex items-center justify-center transition-all cursor-pointer active:scale-95 select-none shrink-0"
                  >
                    <Pencil size={14} strokeWidth={1.8} />
                  </button>
                )}
              </div>

              <div className="divide-y divide-[#2F3336]/60">
                {(editingCard === 'locations' ? editLocations : locations).map(
                  (loc, index) => (
                    <div key={loc.id} className="py-3 first:pt-1 last:pb-0">
                      <div className="flex items-center gap-1.5 text-[12px] text-[#ACACB2] mb-0.5">
                        <span>{loc.tag}</span>
                        <span className="text-white/20">·</span>
                        <span>{loc.time}</span>
                      </div>
                      {editingCard === 'locations' ? (
                        <div className="space-y-1 mt-1">
                          <input
                            type="text"
                            value={loc.name}
                            onChange={(e) => {
                              const newName = e.target.value;
                              setEditLocations((prev) =>
                                prev.map((item, idx) =>
                                  idx === index ? { ...item, name: newName } : item
                                )
                              );
                            }}
                            className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#F2F2F5] text-[13.5px] rounded-lg px-2.5 py-1.5 outline-none"
                          />
                          <input
                            type="text"
                            value={loc.description}
                            onChange={(e) => {
                              const newDesc = e.target.value;
                              setEditLocations((prev) =>
                                prev.map((item, idx) =>
                                  idx === index ? { ...item, description: newDesc } : item
                                )
                              );
                            }}
                            className="w-full bg-[#141416] border border-[#2F3336] focus:border-[#EF264C] text-[#ACACB2] text-[13px] rounded-lg px-2.5 py-1.5 outline-none"
                          />
                        </div>
                      ) : (
                        <>
                          <h4 className="text-[14px] font-bold text-[#F2F2F5]">
                            {loc.name}
                          </h4>
                          <p className="text-[13px] text-[#ACACB2] mt-0.5 leading-relaxed">
                            {loc.description}
                          </p>
                        </>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Card 3: ซิงค์พิมพ์เขียว (สไตล์ Twitter Subscribe to Premium: ปุ่มสีชมพูหลักของเรา) */}
            <div
              ref={blueprintCardRef}
              className="scroll-mt-4 p-4 sm:p-5 rounded-2xl bg-transparent border border-[#2F3336] flex flex-col gap-2.5"
            >
              <h3 className="text-[18px] sm:text-[19px] font-bold text-[#F2F2F5] tracking-tight">
                ซิงค์พิมพ์เขียวกับ The Muse
              </h3>
              <p className="text-[13.5px] sm:text-[14px] text-[#ACACB2] leading-relaxed">
                นำข้อมูลบีตฉากเปิดและโครงสร้างโลกที่คุยกับ The Muse บันทึกลงพิมพ์เขียวโลกและตัวละครโดยอัตโนมัติ
              </p>
              <button
                type="button"
                onClick={handleSyncBlueprint}
                className={`self-start mt-1 px-5 py-2 rounded-full font-bold text-[14px] transition-all active:scale-95 shadow-sm cursor-pointer select-none flex items-center gap-1.5 ${
                  syncedFeedback
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[#EF264C] hover:bg-[#d91d40] text-white'
                }`}
              >
                {syncedFeedback ? (
                  <>
                    <Check size={15} strokeWidth={2.2} />
                    <span>ซิงค์เรียบร้อยแล้ว!</span>
                  </>
                ) : (
                  <span>ซิงค์พิมพ์เขียว (Sync)</span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

