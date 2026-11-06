import { useState, useRef, useEffect, useMemo } from 'react'
import {
  Search,
  Trash2,
  Plus,
  Save,
  ArrowLeft,
  PanelLeft,
  CheckCircle2,
  ArrowUp,
  Globe,
  FileText,
  MapPin,
  Archive,
  X,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  FileCode2,
  Copy,
  Check,
  Shirt,
} from 'lucide-react'
import type { LoreCard, ExpansionNote, StageCellItem, WorldWorkspace, WorldLoreBlock } from '../types'

interface WorldStudioViewProps {
  macroWorldLore: string
  onMacroWorldLoreChange: (lore: string) => void
  sparkText: string
  onSparkChange: (spark: string) => void
  cabinetCards: LoreCard[]
  pinnedCardIds: string[]
  onTogglePin?: (cardId: string) => void
  onDeleteCabinetCard: (cardId: string) => Promise<void>
  onSaveCardsToCabinet: (cards: LoreCard[]) => Promise<void>
  onEnterStage: () => void
  onBackToHome: () => void
  onSelectStageCell?: (cell: StageCellItem) => void
}


type StudioActiveView =
  | { type: 'welcome' }
  | { type: 'master' }
  | { type: 'spark' }
  | { type: 'note'; noteId: string }
  | { type: 'cell'; cellId: string }
  | { type: 'cabinet' }

// 3 Canonical Story Presets for Google-Style Search Dropdown Expansion
const WELCOME_STORY_PRESETS = [
  {
    id: 'euphonium',
    fullText: 'เด็กสาว ที่เล่นยูโฟเนียมที่เพิ่งย้ายโรงเรียนเข้า ปี 1 คือเล่นวงโยมาตอนมอต้นแล้ว แต่มอปลา ปี 1 คิดจะใช้ชีวิตธรรมดาๆ แต่เข้าไปวันแรกเจองวงโย และรุ่นพี่ชวนให้เข้าวง จับผลัดจับผลูเพื่อนสนิท จับเซ็นชื่อให้เข้าวงด้วย และวงกำลังเข้าสู่การแข่งขันและต้องการเป็ฯที่ 1 ระดับประเทศ เกี่ยวกับการถ่ายทอดชีวิตประจำวัน พลังของวัยรุ่น ความสดใสและพุล่งพลา่่นของวัยรุ่น ที่มีทั้งน้ำตา ความทุ่มเท การได้ทำเต็มที่เพื่อสิ่งที่เรารัก ความสัมพันของเพื่อน และการมีความรักที่ทำให้หัวใจเต้น เป็นญี่ปุ่น เมืองที่มีหลายฤดูกาล ทั้งใส่ชุดยูกาตะ ดูคบเพลิง ขึ้นไปเล่นเพลงกับเพื่อน การแข่งขันกันในวง มิตรภาพของวงโย การแข่งขันระดับประเทศ และบรรยากาศค่ำคืน ฝนตก บรรยากาศหลังเลิกซ้อม เดิมกลับบ้านกินไอติม บอกรักบนสะพานกลับมาซ้อมที่บ้าน รุ่นที่ที่เป็นไอดอลของเราและถ่ายทอดวิชาที่รักให้ เสียงเพลงที่ทำให้ตื่นเต้น และใจเต้นทุกครั้งที่ได้ยิน บรรยากาศหน้าร้อน เดินข้ามทางรถไฟ คือบรรยากาศเยอะแยะไปหมด',
  },
  {
    id: 'pirates',
    fullText: 'เริ่มจาก ตำนานเรือ แบลคเพลที่หายไป คนที่ทำตัวแปลกๆ จะตามหาเรือในตำนาน ที่ไม่มีใครเชื่อว่ามีอยู่จริง เข้าไปผัวพัน ฟันดาบกำ วิลเทอร์เนอร์ และเข้าไปผัวพันกับนางเอก ชิงตัวนางเองมา จับผลัดจับผลู เรื่องเกี่ยวกับทองคำต้องสาบ ที่หยิบมาแล้วเป็นอมตะ โครงกระดูก การผจญภัย โจรสลัดที่เป็นตำนาน แล้วเรื่องอื่นๆ ก็จะตามมาเช่น เรือ การผจญภัยอีกเกาะ การหาลูกเรือ ตัวร้าย หรือ ความสัมพันสามเศร้าที่เราลุ้นตลอด การเป็นคู่แข่งแต่ไว้ใจกัน ความหักหลังของโจรสลับ การกลับมาร่วมมือ เพราะตัวร้ายที่เหนือกว่า การไปค้นหาสมบัติ เรือแบลกเพิร์ล ตำนาน ทหาร ลำดับชั้นยศ ราชวง เพลงโจรสลับ คือโลกค่อยๆ ตามมา ขายไปได้เรื่อยๆ ไม่รู้จบว่าโลกโทนสี การผจญภัย ชายหาด ความสดใส ความสนุก การผจญภัย ความรัก',
  },
  {
    id: 'orchestra_conflict',
    fullText: 'ปมคือการที่อยากเข้ามาเล่นดนตรีสนุกๆ และไม่จริงจัง แต่กลายเป็ฯมาเจอเพื่อนเป่าทรัมเป็ตที่โคตรจริงจังและอยากเป็นนักเป่าทรัมเป็ตอันดับหนึ่งด้วยปมส่วนตัวอะไรในใจตัวเองอีกต่างหาก เพราะฉะนั้นสิ่งเหล่านี้มาถูกผูกกันอยู่ที่ การแข่งขันระดับประเทศที่อยากเอาชนะ และกลายเป็น นี่คือเวที ของที่สิ่งที่มารวมกัน และการได้แข่งแพ้และเห็นเพื่อนเสียน้ำตาในเวทีระดับเขต ทำให้เกิดไฟลุกขึ้นมา เหมือนกัน นี่คือความสัมพันของเพื่อนความเป็นจริงของวงโย และการซ้อมระหว่างรุ่นพี่ นี่คือปมระดับ ชั้นของโรงเรียนหรือระดับที่ใหญ่กว่า แต่ไม่กระทบตัวเราเท่าไหร่ แต่มีมาเสมอๆ บางคนไม่อยากจริงจัง บางคนอยากจริงจัง การอยากเล่น และฉาบด้วยความใกล้ชิดของนางเอกพระเอก ที่พอซ้อมด้วยกัน เข้าค่ายด้วยกันก็ต่างมีใจให้กัน ก็เป็นความรักความใกล้ชิด บรรยากาศ แต่ตอนนี้ต้องซ้อมและแข่ง และนางเอกยังไม่อยากมีความรัก ทุกอย่างถูกฉาบและไปด้วยคือปม ระดับ แต่ละอย่างแต่่ละเรือ่งไม่เหมือนกันเลย เราควรจับคีย์เวิร์ดที่ผู้เล่นพิมพ์แล้วมาขยาายไหม หรือความมีแก่งแบบไหนกันแน่ คือจุดศูนย์กลางของเรื่องราวไม่เหมือนกัน และสิ่งเหล่านี้กลายเป็นเรื่องราว และเรื่องโลกสภาพแวดล้อมอื่นๆ กลายเปนเรื่องประกอบ',
  },
]

export function WorldStudioView({
  macroWorldLore,
  onMacroWorldLoreChange,
  sparkText,
  onSparkChange,
  cabinetCards,
  pinnedCardIds,
  onTogglePin: _onTogglePin,
  onDeleteCabinetCard,
  onSaveCardsToCabinet,
  onEnterStage,
  onBackToHome,
  onSelectStageCell,
}: WorldStudioViewProps) {

  // Navigation & Workspace State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeView, setActiveView] = useState<StudioActiveView>({ type: 'welcome' })
  const [isInitialBounce, setIsInitialBounce] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialBounce(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Multi-World Sandboxes (Isolated per World)
  const [worlds, setWorlds] = useState<WorldWorkspace[]>(() => [
    {
      id: 'world_default',
      title: 'โรงเรียนเวทมนตร์',
      rawLore: macroWorldLore || `เป็นโรงเรียนเวทมนตร์อันดับหนึ่ง ที่เหล่าพ่อมดแม่มดทุกบ้านต้องเอาลูกมาเรียน โดยต่างจากสังคมมนุษย์ทั่วไป โรงเรียนอายุเกินกว่า 100 ปี มีพ่อมดศาสตร์มืด มีการแบ่งบ้านในโรงเรียน มีอาจารย์ที่ยูนีคทุ่มเทเพื่อเด็กๆ มีสัตว์วิเศษ มีความแฟนตาซี ใช้ไม้กายสิทธิ์เพื่อร่ายคาถา แอบอยู่ในโลกของเราและโดนโลกของเรากีดกัน คนเยอะ ห้องเรียนเยอะ สถานที่ลึกลับ มูดแอนด์โทนของการแข่งขัน ความเป็นเพื่อน ปริศนา และตัวร้ายที่แฝงตัวอยู่...`,
      sparkText: sparkText || 'คืนนี้หลังเคอร์ฟิว นาฬิกาทรายวัดคะแนนเกิดรอยร้าว และมีข่าวลือว่ามีคนเห็นเงาพ่อมดศาสตร์มืดที่หอคอยต้องห้าม',
      notes: [
        {
          id: 'note_1',
          title: 'สถาปัตยกรรมหอนอนและกฎเคอร์ฟิว',
          content: 'หอนอนตั้งอยู่บนยอดหอคอยทิศเหนือ แยกชายหญิงโดยบันไดเวทมนตร์ที่จะกลายเป็นทางลาดลื่นหากเพศตรงข้ามพยายามเดินขึ้น กฎเคอร์ฟิวห้ามออกจากห้องหลัง 4 ทุ่ม ผู้ฝ่าฝืนจะถูกส่งไปทำความสะอาดห้องปรุงยาใต้ดิน',
          tags: ['หอนอน', 'กฎเคอร์ฟิว', 'สถานที่'],
          childCards: [
            {
              id: 'card_dorm_1',
              title: 'บันไดเวทมนตร์กลไกสไลเดอร์',
              category: 'rule',
              content: 'บันไดเวทมนตร์ที่จะเปลี่ยนเป็นสไลเดอร์ทันทีเมื่อมีคนฝ่าฝืน พร้อมสัญญาณเตือนไปยังห้องพักผู้คุม',
              tags: ['กลไก', 'หอนอน'],
              isSavedToCabinet: true,
            },
            {
              id: 'card_dorm_2',
              title: 'บทลงโทษทำความสะอาดห้องปรุงยา',
              category: 'rule',
              content: 'บทลงโทษสำหรับผู้แหกกฎเคอร์ฟิวหลัง 4 ทุ่ม คือการขัดหม้อปรุงยาสมุนไพรและสกัดเมือกทากตาเดียวในคุกใต้ดิน',
              tags: ['กฎเคอร์ฟิว', 'บทลงโทษ', 'คุกใต้ดิน'],
              isSavedToCabinet: true,
            },
            {
              id: 'card_dorm_3',
              title: 'รูปภาพสุภาพสตรีสีชาเฝ้าประตู',
              category: 'npc',
              content: 'ภาพวาดเวทมนตร์ผู้ทำหน้าที่เฝ้าประตูทางเข้าหอนอน ต้องขานรหัสผ่านประจำสัปดาห์เท่านั้นจึงจะยอมเปิดทางให้',
              tags: ['ภาพวาดมีชีวิต', 'รหัสผ่าน', 'หอนอน'],
              isSavedToCabinet: false,
            },
            {
              id: 'card_dorm_4',
              title: 'ตราประทับไฟเคอร์ฟิว 4 ทุ่ม',
              category: 'object',
              content: 'โคมไฟระย้ากลางห้องนั่งเล่นรวมจะหรี่แสงลงเป็นสีน้ำเงินเข้มเมื่อเข้าสู่เวลา 22:00 น. เพื่อแจ้งเตือนการเริ่มนับเคอร์ฟิว',
              tags: ['เวลา', 'บรรยากาศ', 'หอคอยทิศเหนือ'],
              isSavedToCabinet: false,
            }
          ],
          created_at: 1700000000000,
        },
        {
          id: 'note_2',
          title: 'ห้องปรุงยาใต้ดินและตำรายาต้องห้าม',
          content: 'ห้องเรียนใต้ดินที่ชื้นเย็น มีหม้อต้มทองเหลืองเรียงรายและขวดดองส่วนผสมพิลึกพิลั่น ตำรายาโบราณถูกล็อกด้วยโซ่เวทมนตร์บนแท่นหินใจกลางห้อง',
          tags: ['ห้องปรุงยา', 'ตำราต้องห้าม', 'ใต้ดิน'],
          childCards: [
            {
              id: 'card_pot_1',
              title: 'หม้อต้มทองเหลืองสามขา',
              category: 'object',
              content: 'หม้อต้มปรุงยาที่ทนความร้อนสูงและสามารถรักษาอุณหภูมิของน้ำยาได้สม่ำเสมอ',
              tags: ['อุปกรณ์', 'ปรุงยา'],
              isSavedToCabinet: false,
            },
            {
              id: 'card_pot_2',
              title: 'สมุนไพรรูปหน้าคนสะอื้น',
              category: 'lore',
              content: 'รากสมุนไพรหายากที่จะส่งเสียงสะอื้นเบาๆ เมื่อถูกตัดออกจากต้น ใช้เป็นส่วนผสมหลักของยาแก้คำสาป',
              tags: ['สมุนไพร', 'วัตถุดิบ'],
              isSavedToCabinet: false,
            }
          ],
          created_at: 1700000001000,
        },
        {
          id: 'note_3',
          title: 'ป่าหมอกทมิฬและถิ่นที่อยู่ของสัตว์วิเศษ',
          content: 'แนวป่าทึบรอบเขตแดนโรงเรียนที่ปกคลุมด้วยหมอกสีเงินตลอดปี เป็นที่อาศัยของฝูงยูนิคอร์นขนดำและอีกาตาเพชรที่สื่อสารทางจิตได้',
          tags: ['ป่าหมอก', 'สัตว์วิเศษ', 'เขตแดน'],
          childCards: [
            {
              id: 'card_forest_1',
              title: 'ยูนิคอร์นขนดำเร้นกาย',
              category: 'npc',
              content: 'สิ่งมีชีวิตโบราณที่ไม่ปรากฏตัวให้คนทั่วไปเห็น น้ำตาของมันสามารถชำระล้างพิษเวทมนตร์ได้ทุกชนิด',
              tags: ['สัตว์วิเศษ', 'ป่าทมิฬ'],
              isSavedToCabinet: false,
            },
            {
              id: 'card_forest_2',
              title: 'เขตแดนไอหมอกลวงตา',
              category: 'rule',
              content: 'ผู้ที่ก้าวล่วงเกินแนวหินรูนจะมองเห็นทางเดินวนกลับมาที่เดิม เว้นแต่จะพกใบเสจสีเงินติดตัว',
              tags: ['เขตแดน', 'เวทลวง'],
              isSavedToCabinet: false,
            }
          ],
          created_at: 1700000002000,
        },
        {
          id: 'note_4',
          title: 'สภาคณาจารย์ผู้ถือครองกุญแจทั้งเจ็ด',
          content: 'กลุ่มอาจารย์อาวุโสเจ็ดคนผู้พิทักษ์ห้องผนึกโบราณ แต่ละคนครอบครองกุญแจทองเหลืองรูปร่างต่างกัน และไม่มีใครรู้ว่าห้องผนึกนั้นกักขังสิ่งใดไว้',
          tags: ['คณาจารย์', 'กุญแจทั้งเจ็ด', 'ปริศนา'],
          childCards: [
            {
              id: 'card_prof_1',
              title: 'ศาสตราจารย์มอแรนต์ผู้เงียบขรึม',
              category: 'npc',
              content: 'อาจารย์ผู้สอนวิชาดาราศาสตร์เวทมนตร์ ผู้ถือครองกุญแจดวงดาวและไม่เคยหลับในเวลากลางคืน',
              tags: ['อาจารย์', 'กุญแจ'],
              isSavedToCabinet: false,
            },
            {
              id: 'card_prof_2',
              title: 'ประตูผนึกทองสัมฤทธิ์ใต้หอคอยนาฬิกา',
              category: 'location',
              content: 'ประตูบานยักษ์ที่มีรูกุญแจเจ็ดช่องเรียงตามกลุ่มดาวคนเลี้ยงสัตว์ จะเปิดได้เฉพาะคืนจันทร์ดับ',
              tags: ['ประตูผนึก', 'ความลับ'],
              isSavedToCabinet: false,
            }
          ],
          created_at: 1700000003000,
        }
      ],
      stageCells: [
        {
          id: 'cell_main_hall',
          title: 'ห้องโถงใหญ่และงานเลี้ยงต้อนรับ',
          description: 'โถงเพดานเวทมนตร์ฉายภาพท้องฟ้าจำลอง โต๊ะไม้ยาว 4 ตัวสำหรับแต่ละบ้าน และแสงเทียนลอยได้นับพันเล่ม',
          pinnedCardIds: ['card_dorm_1'],
          created_at: 1700000000000,
        }
      ],
      cabinetCards: [
        {
          id: 'card_dorm_1',
          title: 'บันไดเวทมนตร์กลไกสไลเดอร์',
          category: 'rule',
          content: 'บันไดเวทมนตร์ที่จะเปลี่ยนเป็นสไลเดอร์ทันทีเมื่อมีคนฝ่าฝืน พร้อมสัญญาณเตือนไปยังห้องพักผู้คุม',
          tags: ['กลไก', 'หอนอน'],
          isSavedToCabinet: true,
          sourceNoteId: 'note_1',
        },
        {
          id: 'card_dorm_2',
          title: 'บทลงโทษทำความสะอาดห้องปรุงยา',
          category: 'rule',
          content: 'บทลงโทษสำหรับผู้แหกกฎเคอร์ฟิวหลัง 4 ทุ่ม คือการขัดหม้อปรุงยาสมุนไพรและสกัดเมือกทากตาเดียวในคุกใต้ดิน',
          tags: ['กฎเคอร์ฟิว', 'บทลงโทษ', 'คุกใต้ดิน'],
          isSavedToCabinet: true,
          sourceNoteId: 'note_1',
        },
        ...cabinetCards,
      ],
      pinnedCardIds: pinnedCardIds,
      created_at: 1700000000000,
    }
  ])

  const [activeWorldId, setActiveWorldId] = useState<string>('world_default')
  // Welcome Gate Clean Slate Draft (Gemini-style: draft only, lazy creation on intent)
  const [welcomeDraftLore, setWelcomeDraftLore] = useState('')
  // Find active world safely
  const activeWorld = useMemo(() => {
    return worlds.find(w => w.id === activeWorldId) || worlds[0]
  }, [worlds, activeWorldId])

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const welcomeTextareaRef = useRef<HTMLTextAreaElement>(null)
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize Welcome Textarea dynamically up to max 6 lines (~150px)
  useEffect(() => {
    if (activeView.type === 'welcome' && welcomeTextareaRef.current) {
      const el = welcomeTextareaRef.current
      el.style.height = 'auto'
      const minH = 68 // Initial 3 lines
      const maxH = 150 // Max 6 lines
      const scrollH = el.scrollHeight
      const clampedH = Math.max(minH, Math.min(scrollH, maxH))
      el.style.height = `${clampedH}px`
      el.style.overflowY = scrollH > maxH ? 'auto' : 'hidden'
    }
  }, [welcomeDraftLore, activeView.type])

  // Auto-resize Master Story Textarea dynamically whenever switching to master view or rawLore changes to show ALL lines
  useEffect(() => {
    if (activeView.type === 'master' && textareaRef.current) {
      const el = textareaRef.current
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
      const raf = requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
      })
      return () => cancelAnimationFrame(raf)
    }
  }, [activeView.type, activeWorld.rawLore, activeWorld.id])

  // AI Operation States
  const [isSprouting, setIsSprouting] = useState(false)
  const [isExtractingSpark, setIsExtractingSpark] = useState(false)
  const [isSparkPlayerEdited, setIsSparkPlayerEdited] = useState(false)
  const [sparkHistory, setSparkHistory] = useState<string[]>([])
  const [generatingNoteId, setGeneratingNoteId] = useState<string | null>(null)
  const [savingNoteToCabinetId, setSavingNoteToCabinetId] = useState<string | null>(null)
  const [sproutingBlockId, setSproutingBlockId] = useState<string | null>(null)
  const [isDissectingNote, setIsDissectingNote] = useState(false)
  const [isAutoLinking, setIsAutoLinking] = useState(false)
  const [justSavedNotification, setJustSavedNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('บันทึกการ์ดเข้าตู้ลิ้นชักเรียบร้อยแล้ว')
  const [cabinetSearchQuery, setCabinetSearchQuery] = useState('')
  const [isSparkDraftOpen, setIsSparkDraftOpen] = useState(false)
  const [activeTagPopoverCardId, setActiveTagPopoverCardId] = useState<string | null>(null)
  const [newTagInput, setNewTagInput] = useState('')

  // Google-style Inspiration Presets Dropdown on Welcome Screen
  const [isWelcomeDropdownOpen, setIsWelcomeDropdownOpen] = useState(false)
  const welcomeCardContainerRef = useRef<HTMLDivElement>(null)

  // Close welcome suggestions on click outside
  useEffect(() => {
    if (!isWelcomeDropdownOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        welcomeCardContainerRef.current &&
        !welcomeCardContainerRef.current.contains(e.target as Node)
      ) {
        setIsWelcomeDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isWelcomeDropdownOpen])

  const handleSelectWelcomePreset = (fullText: string) => {
    setWelcomeDraftLore(fullText)
    setIsWelcomeDropdownOpen(false)
    if (welcomeTextareaRef.current) {
      welcomeTextareaRef.current.style.height = 'auto'
      welcomeTextareaRef.current.style.height = `${Math.min(welcomeTextareaRef.current.scrollHeight, 240)}px`
    }
  }

  // Lazy Creation: Create and select a new world only when the player submits a story from Welcome Gate
  const handleCreateWorldFromWelcome = (lore: string): WorldWorkspace | null => {
    const trimmed = lore.trim()
    if (!trimmed) return null

    const newIdx = worlds.length + 1
    const firstLine = trimmed.split('\n')[0].trim()
    const derivedTitle = firstLine.length > 25 ? firstLine.slice(0, 24) + '...' : firstLine || `โลกที่ ${newIdx}`

    const newWorld: WorldWorkspace = {
      id: `world_${Date.now()}`,
      title: derivedTitle,
      rawLore: trimmed,
      sparkText: '',
      notes: [],
      stageCells: [],
      cabinetCards: [],
      pinnedCardIds: [],
      created_at: Date.now(),
    }

    setWorlds(prev => [newWorld, ...prev])
    setActiveWorldId(newWorld.id)
    onMacroWorldLoreChange(trimmed)
    setWelcomeDraftLore('')
    setActiveView({ type: 'master' })

    return newWorld
  }

  // Combined World Lore across Master Card + Extra Lore Cards
  const combinedWorldLore = useMemo(() => {
    const blocks = (activeWorld.extraLoreBlocks || [])
      .map(b => {
        const text = b.content.trim()
        if (!text) return ''
        return b.title?.trim() ? `${b.title.trim()}:\n${text}` : text
      })
      .filter(Boolean)
    return [activeWorld.rawLore.trim(), ...blocks].filter(Boolean).join('\n\n')
  }, [activeWorld.rawLore, activeWorld.extraLoreBlocks])

  // Prompt Inspector State
  const [isPromptInspectorOpen, setIsPromptInspectorOpen] = useState(false)
  const [inspectorMainTab, setInspectorMainTab] = useState<'assembled' | 'engines'>('assembled')
  const [inspectorEngineTab, setInspectorEngineTab] = useState<'spark' | 'sprout' | 'dissect' | 'linker'>('spark')
  const [copiedInspectorPrompt, setCopiedInspectorPrompt] = useState(false)

  // Close inspector on Escape key
  useEffect(() => {
    if (!isPromptInspectorOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPromptInspectorOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPromptInspectorOpen])

  // Progressive Reveal Visibility Flags
  const showSparkCard = Boolean(activeWorld.sparkText && activeWorld.sparkText.trim().length > 0) || isSparkDraftOpen
  const showExpansionsCard = Boolean(activeWorld.notes && activeWorld.notes.length > 0)

  // Sync active world updater
  const updateActiveWorld = (updater: (prev: WorldWorkspace) => WorldWorkspace, targetWorldId?: string) => {
    const targetId = targetWorldId || activeWorldId
    setWorlds(prev => prev.map(w => {
      if (w.id === targetId) {
        return updater(w)
      }
      return w
    }))
  }

  // 1. ADD NEW WORLD: Navigate to Welcome Screen Draft (Lazy creation on user intent)
  const handleAddNewWorld = () => {
    setWelcomeDraftLore('')
    setIsWelcomeDropdownOpen(false)
    setActiveView({ type: 'welcome' })
  }

  // 2. SWITCH WORLD: Restore that world's isolated state
  const handleSwitchWorld = (worldId: string) => {
    const target = worlds.find(w => w.id === worldId)
    if (!target) return
    setActiveWorldId(target.id)
    onMacroWorldLoreChange(target.rawLore)
    onSparkChange(target.sparkText)
    setIsSparkDraftOpen(false)
    setIsSparkPlayerEdited(false)
    setSparkHistory(target.sparkText.trim() ? [target.sparkText.trim()] : [])
    setActiveView({ type: 'master' })
  }

  // 3a. Extract / Regenerate / Polish Spark via AI (The Inciting Spark Engine: 1-on-1 Personal Character Collision)
  const handleExtractSpark = async (
    forceMode?: 'extract' | 'regenerate' | 'polish',
    customLore?: string,
    targetWorldId?: string
  ) => {
    const targetId = targetWorldId || activeWorldId
    const targetWorld = worlds.find(w => w.id === targetId) || activeWorld
    const textToProcess = (customLore ?? (combinedWorldLore || targetWorld.rawLore.trim())).trim()
    const currentSpark = targetWorld.sparkText.trim()
    const mode = forceMode || (!currentSpark ? 'extract' : isSparkPlayerEdited ? 'polish' : 'regenerate')

    if (!textToProcess && !currentSpark) {
      welcomeTextareaRef.current?.focus()
      return
    }
    if (isExtractingSpark) return

    setIsExtractingSpark(true)
    try {
      let res: Response
      const payload: Record<string, unknown> = {
        raw_text: textToProcess,
        world_id: targetId,
      }
      if (mode === 'polish' && currentSpark) {
        payload.draft_spark = currentSpark
      } else if (mode === 'regenerate' && currentSpark) {
        const mergedHistory = Array.from(new Set([...sparkHistory, currentSpark].filter(Boolean)))
        payload.previous_spark = currentSpark
        payload.previous_sparks = mergedHistory
      }

      try {
        res = await fetch('http://localhost:8000/api/sandbox/world/spark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch {
        res = await fetch('https://the-soul-backend-330377476882.asia-southeast1.run.app/api/sandbox/world/spark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (res.ok) {
        const data = await res.json()
        const sparkResult = (data.spark_text || '').trim()
        if (sparkResult) {
          updateActiveWorld(prev => ({ ...prev, sparkText: sparkResult }), targetId)
          onSparkChange(sparkResult)
          setSparkHistory(prev => Array.from(new Set([...prev, currentSpark, sparkResult].filter(Boolean))))
          setIsSparkDraftOpen(true)
          setIsSparkPlayerEdited(false)
          setNotificationMessage(
            mode === 'polish'
              ? 'เรียบเรียงสปาร์คสำเร็จ'
              : mode === 'regenerate'
              ? 'สุ่มตัวละครและสปาร์คมุมใหม่สำเร็จ'
              : 'สกัดสปาร์คสำเร็จ'
          )
          setJustSavedNotification(true)
          setTimeout(() => setJustSavedNotification(false), 2400)
        }
      }
    } catch (e) {
      console.error('Failed to extract spark:', e)
    } finally {
      setIsExtractingSpark(false)
    }
  }

  // 3b. Unified Genesis: Automatically extract Spark & Sprout Expansion Notes in one go!
  const handleGenerateWorldGenesis = async (
    customLore?: string,
    mode: 'initial' | 'more' = 'initial',
    targetWorldId?: string
  ) => {
    const targetId = targetWorldId || activeWorldId
    const targetWorld = worlds.find(w => w.id === targetId) || activeWorld
    const baseLore = mode === 'more' ? combinedWorldLore : targetWorld.rawLore
    const textToProcess = (customLore ?? baseLore).trim()
    if (!textToProcess || isSprouting) return
    setIsSprouting(true)

    // 1. Extract Spark immediately via AI on initial run if not present
    if (mode === 'initial' && !targetWorld.sparkText.trim()) {
      handleExtractSpark('extract', textToProcess, targetId)
    }

    // 2. Dissect into Expansion Notes via backend (Progressive Batch: 4-5 items per batch)
    const alreadyExtracted = mode === 'more' 
      ? targetWorld.notes
          .filter(n => n.title.trim() || n.content.trim())
          .map(n => n.content.trim() ? `${n.title}: ${n.content}` : n.title)
      : []

    try {
      let res: Response
      const payload = { 
        raw_text: textToProcess, 
        world_id: targetId, 
        max_cards: 5,
        already_extracted_topics: alreadyExtracted
      }
      try {
        res = await fetch('http://localhost:8000/api/sandbox/world/dissect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch {
        res = await fetch('https://the-soul-backend-330377476882.asia-southeast1.run.app/api/sandbox/world/dissect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (res.ok) {
        const data = await res.json()
        const cards: LoreCard[] = data.cards || []
        
        // Convert dissected cards into new Expansion Notes in this world (Strictly capped at 4-5 items per batch)
        const newNotes: ExpansionNote[] = cards.slice(0, 5).map((c, idx) => ({
          id: `note_sprout_${Date.now()}_${idx}`,
          title: c.title,
          content: c.content,
          category: c.category || 'lore',
          summary: c.summary || '',
          tags: c.tags || [],
          isSavedToCabinet: false,
          childCards: [],
          created_at: Date.now() + idx,
        }))

        if (mode === 'more') {
          if (newNotes.length > 0) {
            updateActiveWorld(prev => ({
              ...prev,
              notes: [...prev.notes, ...newNotes]
            }), targetId)
            setNotificationMessage(`สกัดส่วนขยายเพิ่มสำเร็จ (+${newNotes.length} ส่วน)`)
          } else {
            setNotificationMessage('สกัดครบทุกหัวข้อในโลกหลักแล้ว')
          }
        } else {
          updateActiveWorld(prev => ({
            ...prev,
            notes: newNotes.length > 0 ? newNotes : prev.notes
          }), targetId)
          setNotificationMessage(`สกัดชนวนเหตุและสร้างส่วนขยายสำเร็จ (${newNotes.length} ส่วน)`)
        }
        setJustSavedNotification(true)
        setTimeout(() => setJustSavedNotification(false), 2400)
      }
    } catch (e) {
      console.error('Genesis failed:', e)
    } finally {
      setIsSprouting(false)
    }
  }

  // 3b. Generate / Regenerate / Polish Note Content (✨ เจนเนื้อหา / 🔄 เจนเนื้อหาใหม่ / ✨ เรียบเรียงเนื้อหา)
  const handleGenerateNoteContentFromTitle = async (
    note: ExpansionNote,
    forceMode?: 'generate' | 'regenerate' | 'polish'
  ) => {
    const titleToGen = note.title.trim()
    const currentDraft = note.content.trim()
    const mode: 'generate' | 'regenerate' | 'polish' =
      forceMode || (!currentDraft ? 'generate' : note.isPlayerEdited ? 'polish' : 'regenerate')

    const loreToUse = combinedWorldLore || currentDraft || titleToGen
    if (generatingNoteId || !loreToUse) return
    if (mode !== 'polish' && !titleToGen) return
    if (mode === 'polish' && !currentDraft) return

    setGeneratingNoteId(note.id)

    try {
      let res: Response
      const payload: Record<string, unknown> = {
        raw_text: loreToUse,
        world_id: activeWorld.id,
        target_topic_title: titleToGen || 'ส่วนขยายที่ผู้เล่นเขียน',
      }
      if (mode === 'polish') {
        payload.draft_content = currentDraft
      } else if (mode === 'regenerate' && currentDraft) {
        payload.already_extracted_topics = [currentDraft]
      }

      try {
        res = await fetch('http://localhost:8000/api/sandbox/world/dissect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch {
        res = await fetch('https://the-soul-backend-330377476882.asia-southeast1.run.app/api/sandbox/world/dissect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (res.ok) {
        const data = await res.json()
        const firstCard: LoreCard | undefined = (data.cards || [])[0]
        if (firstCard) {
          const resolvedTitle = note.title.trim() || firstCard.title || 'ส่วนขยาย'
          const resolvedTags = firstCard.tags?.length ? firstCard.tags : note.tags
          updateActiveWorld(prev => ({
            ...prev,
            cabinetCards: prev.cabinetCards.map(c =>
              c.id === note.id
                ? {
                    ...c,
                    title: resolvedTitle,
                    content: firstCard.content,
                    category: firstCard.category || c.category || 'lore',
                    summary: firstCard.summary || c.summary || '',
                    tags: resolvedTags,
                  }
                : c
            ),
            notes: prev.notes.map(n => {
              if (n.id !== note.id) return n
              return {
                ...n,
                title: resolvedTitle,
                content: firstCard.content,
                category: firstCard.category || n.category || 'lore',
                summary: firstCard.summary || n.summary || '',
                isPlayerEdited: false,
                tags: resolvedTags,
              }
            }),
          }))
          const actionLabel =
            mode === 'polish' ? 'เรียบเรียงเนื้อหา' : mode === 'regenerate' ? 'เจนเนื้อหาใหม่' : 'เจนเนื้อหา'
          setNotificationMessage(`${actionLabel} "${resolvedTitle}" สำเร็จ`)
          setJustSavedNotification(true)
          setTimeout(() => setJustSavedNotification(false), 2400)
        }
      }
    } catch (e) {
      console.error('Generate note content failed:', e)
    } finally {
      setGeneratingNoteId(null)
    }
  }

  // 3c. Extra World Lore Cards Management (เพิ่มการ์ดเนื้อหาโลกได้ไม่จำกัด & แตกส่วนขยายเฉพาะการ์ดนี้)
  const handleAddExtraLoreBlock = () => {
    updateActiveWorld(prev => {
      const nextIdx = (prev.extraLoreBlocks?.length || 0) + 2
      const newBlock: WorldLoreBlock = {
        id: `lore_block_${Date.now()}`,
        title: `เนื้อหาโลกเพิ่มเติม #${nextIdx}`,
        content: '',
        created_at: Date.now(),
      }
      return {
        ...prev,
        extraLoreBlocks: [...(prev.extraLoreBlocks || []), newBlock],
      }
    })
  }

  const handleUpdateExtraLoreBlock = (blockId: string, updates: Partial<WorldLoreBlock>) => {
    updateActiveWorld(prev => ({
      ...prev,
      extraLoreBlocks: (prev.extraLoreBlocks || []).map(b =>
        b.id === blockId ? { ...b, ...updates } : b
      ),
    }))
  }

  const handleDeleteExtraLoreBlock = (blockId: string) => {
    updateActiveWorld(prev => ({
      ...prev,
      extraLoreBlocks: (prev.extraLoreBlocks || []).filter(b => b.id !== blockId),
    }))
  }

  const handleSproutFromLoreBlock = async (block: WorldLoreBlock) => {
    const blockText = block.content.trim()
    if (!blockText || sproutingBlockId || isSprouting) return
    setSproutingBlockId(block.id)

    const alreadyExtracted = activeWorld.notes
      .filter(n => n.title.trim() || n.content.trim())
      .map(n => n.content.trim() ? `${n.title}: ${n.content}` : n.title)

    const fullBlockText = block.title?.trim() ? `${block.title.trim()}\n${blockText}` : blockText

    try {
      let res: Response
      const payload = {
        raw_text: fullBlockText,
        world_id: activeWorld.id,
        context_lore: activeWorld.rawLore.trim() || fullBlockText,
        already_extracted_topics: alreadyExtracted,
      }
      try {
        res = await fetch('http://localhost:8000/api/sandbox/world/dissect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch {
        res = await fetch('https://the-soul-backend-330377476882.asia-southeast1.run.app/api/sandbox/world/dissect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (res.ok) {
        const data = await res.json()
        const cards: LoreCard[] = data.cards || []
        const newNotes: ExpansionNote[] = cards.slice(0, 5).map((c, idx) => ({
          id: `note_sprout_${Date.now()}_${idx}`,
          title: c.title,
          content: c.content,
          category: c.category || 'lore',
          summary: c.summary || '',
          tags: c.tags || [],
          isSavedToCabinet: false,
          childCards: [],
          created_at: Date.now() + idx,
        }))

        if (newNotes.length > 0) {
          updateActiveWorld(prev => ({
            ...prev,
            notes: [...prev.notes, ...newNotes],
          }))
          setNotificationMessage(`แตกส่วนขยายจากการ์ดนี้สำเร็จ (+${newNotes.length} ส่วน)`)
        } else {
          setNotificationMessage('สกัดครบทุกหัวข้อจากการ์ดใบนี้แล้ว')
        }
        setJustSavedNotification(true)
        setTimeout(() => setJustSavedNotification(false), 2400)
      }
    } catch (e) {
      console.error('Sprout from lore block failed:', e)
    } finally {
      setSproutingBlockId(null)
    }
  }

  // 4. Extract Spark Only (สกัดเฉพาะสปาร์คจากเนื้อเรื่องผ่าน AI)
  const handleExtractSparkOnly = () => {
    setActiveView({ type: 'master' })
    handleExtractSpark('extract')
  }

  // 5. Manual Add Spark (เพิ่มสปาร์คเอง)
  const handleManualAddSpark = () => {
    setIsSparkDraftOpen(true)
    if (!activeWorld.sparkText) {
      updateActiveWorld(prev => ({ ...prev, sparkText: '' }))
    }
    setActiveView({ type: 'master' })
    setNotificationMessage('พร้อมเขียน The Inciting Spark')
    setJustSavedNotification(true)
    setTimeout(() => setJustSavedNotification(false), 2400)
  }

  // 6. Add New Expansion Note in this world
  const handleAddNewNote = (stayOnMaster?: boolean | React.MouseEvent) => {
    const isStay = stayOnMaster === true
    const noteId = `note_manual_${activeWorld.notes.length + 1}_${activeWorld.id}`
    const newNote: ExpansionNote = {
      id: noteId,
      title: '',
      content: '',
      tags: ['ส่วนขยาย'],
      childCards: [],
      created_at: 1700000000000 + activeWorld.notes.length,
    }
    updateActiveWorld(prev => ({
      ...prev,
      notes: [...prev.notes, newNote]
    }))
    if (!isStay) {
      setActiveView({ type: 'note', noteId: newNote.id })
    } else {
      setActiveView({ type: 'master' })
    }
  }

  // 6. Add New Stage Cell in this world
  const handleAddNewStageCell = () => {
    const cellId = `cell_manual_${activeWorld.stageCells.length + 1}_${activeWorld.id}`
    const newCell: StageCellItem = {
      id: cellId,
      title: 'ผืนเวทีสถานที่ใหม่',
      description: 'กำหนดบรรยากาศ กลิ่นอาย และสิ่งแวดล้อมของห้องนี้...',
      pinnedCardIds: [],
      created_at: 1700000000000 + activeWorld.stageCells.length,
    }
    updateActiveWorld(prev => ({
      ...prev,
      stageCells: [newCell, ...prev.stageCells]
    }))
    setActiveView({ type: 'cell', cellId: newCell.id })
  }

  // 7. Dissect Note into Child Cards
  const handleDissectCurrentNote = async (note: ExpansionNote) => {
    if (!note.content.trim() || isDissectingNote) return
    setIsDissectingNote(true)
    try {
      let res: Response
      const payload = { raw_text: `${note.title}\n${note.content}`, world_id: activeWorld.id }
      try {
        res = await fetch('http://localhost:8000/api/sandbox/world/dissect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch {
        res = await fetch('https://the-soul-backend-330377476882.asia-southeast1.run.app/api/sandbox/world/dissect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (res.ok) {
        const data = await res.json()
        const newChildCards: LoreCard[] = (data.cards || []).map((c: LoreCard, idx: number) => ({
          ...c,
          id: `child_${Date.now()}_${idx}`,
          isSavedToCabinet: false,
          sourceNoteId: note.id,
        }))

        updateActiveWorld(prev => ({
          ...prev,
          notes: prev.notes.map(n => {
            if (n.id === note.id) {
              return {
                ...n,
                childCards: [...newChildCards, ...n.childCards]
              }
            }
            return n
          })
        }))
      }
    } catch (e) {
      console.error('Note dissection failed:', e)
    } finally {
      setIsDissectingNote(false)
    }
  }

  // 8a. Toggle Save / Draft for Main Expansion Note directly into Cabinet (พร้อมให้ AI ตั้งชื่อหัวข้อและแท็กอัตโนมัติหากหัวข้อว่าง)
  const handleToggleNoteCabinetSaveState = async (note: ExpansionNote) => {
    if (savingNoteToCabinetId === note.id) return
    const isCurrentlySaved = Boolean(note.isSavedToCabinet)

    if (!isCurrentlySaved) {
      let resolvedTitle = note.title.trim()
      let resolvedTags = note.tags && note.tags.length > 0 ? note.tags : ['ส่วนขยาย']
      let resolvedCategory = note.category || 'lore'
      let resolvedSummary = note.summary || ''

      // หากผู้เล่นพิมพ์แต่เนื้อหาแล้วยังไม่ได้ตั้งชื่อหัวข้อ ให้ AI ตั้งชื่อหัวข้อและคิดแท็กให้อัตโนมัติทันที
      if (!resolvedTitle && note.content.trim()) {
        setSavingNoteToCabinetId(note.id)
        try {
          let res: Response
          const payload = {
            raw_text: combinedWorldLore || note.content.trim(),
            world_id: activeWorld.id,
            target_topic_title: '',
            draft_content: note.content.trim(),
          }
          try {
            res = await fetch('http://localhost:8000/api/sandbox/world/dissect', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
          } catch {
            res = await fetch('https://the-soul-backend-330377476882.asia-southeast1.run.app/api/sandbox/world/dissect', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
          }
          if (res.ok) {
            const data = await res.json()
            const firstCard: LoreCard | undefined = (data.cards || [])[0]
            if (firstCard) {
              resolvedTitle = firstCard.title || note.content.trim().slice(0, 28)
              if (firstCard.tags?.length) resolvedTags = firstCard.tags
              if (firstCard.category) resolvedCategory = firstCard.category
              if (firstCard.summary) resolvedSummary = firstCard.summary
            }
          }
        } catch (err) {
          console.error('Auto-title on save failed:', err)
        } finally {
          setSavingNoteToCabinetId(null)
        }
      }

      if (!resolvedTitle) {
        resolvedTitle = note.content.trim().slice(0, 28) || 'ส่วนขยาย'
      }

      const cardFromNote: LoreCard = {
        id: note.id,
        title: resolvedTitle,
        category: resolvedCategory,
        summary: resolvedSummary,
        content: note.content,
        tags: resolvedTags,
        isSavedToCabinet: true,
        sourceNoteId: note.id,
      }

      await onSaveCardsToCabinet([cardFromNote])
      updateActiveWorld(prev => ({
        ...prev,
        cabinetCards: [...prev.cabinetCards.filter(c => c.id !== note.id), cardFromNote],
        notes: prev.notes.map(n =>
          n.id === note.id
            ? {
                ...n,
                title: resolvedTitle,
                tags: resolvedTags,
                category: resolvedCategory,
                summary: resolvedSummary,
                isSavedToCabinet: true,
              }
            : n
        ),
      }))
      setNotificationMessage(`บันทึก "${resolvedTitle}" เข้าตู้ลิ้นชักเรียบร้อยแล้ว`)
    } else {
      await onDeleteCabinetCard(note.id)
      updateActiveWorld(prev => ({
        ...prev,
        cabinetCards: prev.cabinetCards.filter(c => c.id !== note.id),
        pinnedCardIds: prev.pinnedCardIds.filter(id => id !== note.id),
        stageCells: prev.stageCells.map(cell => ({
          ...cell,
          pinnedCardIds: cell.pinnedCardIds.filter(id => id !== note.id),
        })),
        notes: prev.notes.map(n => (n.id === note.id ? { ...n, isSavedToCabinet: false } : n)),
      }))
      setNotificationMessage('นำส่วนขยายออกจากตู้ลิ้นชักแล้ว')
    }
    setJustSavedNotification(true)
    setTimeout(() => setJustSavedNotification(false), 2000)
  }

  // 8b. Toggle Save / Draft for Child Card in Cabinet
  const handleToggleChildCardSaveState = async (noteId: string, card: LoreCard) => {
    const isCurrentlySaved = Boolean(card.isSavedToCabinet)
    if (!isCurrentlySaved) {
      // Save to Cabinet
      await onSaveCardsToCabinet([card])
      updateActiveWorld(prev => ({
        ...prev,
        cabinetCards: [...prev.cabinetCards.filter(c => c.id !== card.id), { ...card, isSavedToCabinet: true }],
        notes: prev.notes.map(n => {
          if (!noteId || n.id === noteId || n.childCards.some(c => c.id === card.id)) {
            return {
              ...n,
              childCards: n.childCards.map(c => c.id === card.id ? { ...c, isSavedToCabinet: true } : c)
            }
          }
          return n
        })
      }))
      setNotificationMessage('บันทึกการ์ดเข้าตู้ลิ้นชักเรียบร้อยแล้ว')
    } else {
      // Revert to Draft: Remove from Cabinet
      await onDeleteCabinetCard(card.id)
      updateActiveWorld(prev => ({
        ...prev,
        cabinetCards: prev.cabinetCards.filter(c => c.id !== card.id),
        pinnedCardIds: prev.pinnedCardIds.filter(id => id !== card.id),
        stageCells: prev.stageCells.map(cell => ({
          ...cell,
          pinnedCardIds: cell.pinnedCardIds.filter(id => id !== card.id)
        })),
        notes: prev.notes.map(n => {
          if (!noteId || n.id === noteId || n.childCards.some(c => c.id === card.id)) {
            return {
              ...n,
              childCards: n.childCards.map(c => c.id === card.id ? { ...c, isSavedToCabinet: false } : c)
            }
          }
          return n
        })
      }))
      setNotificationMessage('เปลี่ยนกลับเป็น draft และนำออกจากตู้ลิ้นชักแล้ว')
    }
    setJustSavedNotification(true)
    setTimeout(() => setJustSavedNotification(false), 2000)
  }

  // 9. Update card title/content/tags everywhere (notes + childCards + cabinet)
  const handleUpdateCardEverywhere = (cardId: string, updates: Partial<LoreCard>, sourceNoteId?: string) => {
    updateActiveWorld(prev => ({
      ...prev,
      cabinetCards: prev.cabinetCards.map(c => c.id === cardId ? { ...c, ...updates } : c),
      notes: prev.notes.map(n => {
        if (n.id === cardId) {
          return {
            ...n,
            ...(updates.title !== undefined ? { title: updates.title } : {}),
            ...(updates.content !== undefined ? { content: updates.content } : {}),
            ...(updates.tags !== undefined ? { tags: updates.tags } : {}),
            ...(updates.category !== undefined ? { category: updates.category } : {}),
            ...(updates.summary !== undefined ? { summary: updates.summary } : {}),
          }
        }
        if (!sourceNoteId || n.id === sourceNoteId || n.childCards.some(c => c.id === cardId)) {
          return {
            ...n,
            childCards: n.childCards.map(c => c.id === cardId ? { ...c, ...updates } : c)
          }
        }
        return n
      })
    }))
  }

  // 10. Delete card from cabinet view (both cabinet & note)
  const handleDeleteCardFromCabinetView = async (cardId: string, sourceNoteId?: string) => {
    await onDeleteCabinetCard(cardId)
    updateActiveWorld(prev => ({
      ...prev,
      cabinetCards: prev.cabinetCards.filter(c => c.id !== cardId),
      pinnedCardIds: prev.pinnedCardIds.filter(id => id !== cardId),
      stageCells: prev.stageCells.map(cell => ({
        ...cell,
        pinnedCardIds: cell.pinnedCardIds.filter(id => id !== cardId)
      })),
      notes: prev.notes.map(n => {
        if (n.id === cardId) {
          return { ...n, isSavedToCabinet: false }
        }
        if (!sourceNoteId || n.id === sourceNoteId || n.childCards.some(c => c.id === cardId)) {
          return {
            ...n,
            childCards: n.childCards.filter(c => c.id !== cardId)
          }
        }
        return n
      })
    }))
  }

  const handleUpdateNote = (noteId: string, updates: Partial<ExpansionNote>) => {
    updateActiveWorld(prev => ({
      ...prev,
      cabinetCards: prev.cabinetCards.map(c =>
        c.id === noteId
          ? {
              ...c,
              ...(updates.title !== undefined ? { title: updates.title } : {}),
              ...(updates.content !== undefined ? { content: updates.content } : {}),
              ...(updates.tags !== undefined ? { tags: updates.tags } : {}),
            }
          : c
      ),
      notes: prev.notes.map(n => n.id === noteId ? { ...n, ...updates } : n)
    }))
  }

  const handleDeleteNote = (noteId: string) => {
    updateActiveWorld(prev => ({
      ...prev,
      notes: prev.notes.filter(n => n.id !== noteId)
    }))
    setActiveView({ type: 'master' })
  }

  const handleDeleteChildCard = (noteId: string, cardId: string) => {
    updateActiveWorld(prev => ({
      ...prev,
      notes: prev.notes.map(n => {
        if (n.id === noteId) {
          return { ...n, childCards: n.childCards.filter(c => c.id !== cardId) }
        }
        return n
      })
    }))
  }

  // Tag Management for Cards (Discreet deletion & additions)
  const handleRemoveTagFromCard = (card: LoreCard, tagIndex: number, sourceNoteId?: string) => {
    const currentTags = card.tags || []
    const newTags = currentTags.filter((_, idx) => idx !== tagIndex)
    handleUpdateCardEverywhere(card.id, { tags: newTags }, sourceNoteId || card.sourceNoteId)
  }

  const handleAddTagToCard = (card: LoreCard, tagToAdd: string, sourceNoteId?: string) => {
    const cleanTag = tagToAdd.trim().replace(/^#+/, '')
    if (!cleanTag) return
    const currentTags = card.tags || []
    if (currentTags.includes(cleanTag)) return
    const newTags = [...currentTags, cleanTag]
    handleUpdateCardEverywhere(card.id, { tags: newTags }, sourceNoteId || card.sourceNoteId)
  }

  const handleToggleCellCard = (cellId: string, cardId: string) => {
    updateActiveWorld(prev => ({
      ...prev,
      stageCells: prev.stageCells.map(cell => {
        if (cell.id === cellId) {
          const exists = cell.pinnedCardIds.includes(cardId)
          return {
            ...cell,
            pinnedCardIds: exists
              ? cell.pinnedCardIds.filter(id => id !== cardId)
              : [...cell.pinnedCardIds, cardId]
          }
        }
        return cell
      })
    }))
  }

  // Active items lookup
  const currentNote = activeView.type === 'note'
    ? activeWorld.notes.find(n => n.id === activeView.noteId)
    : null

  const currentCell = activeView.type === 'cell'
    ? activeWorld.stageCells.find(c => c.id === activeView.cellId)
    : null

  // Auto-resize Note View Content Textarea dynamically whenever switching note or content updates (typing or AI-generated)
  useEffect(() => {
    if (activeView.type === 'note' && noteTextareaRef.current) {
      const el = noteTextareaRef.current
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
      const raf = requestAnimationFrame(() => {
        if (noteTextareaRef.current) {
          noteTextareaRef.current.style.height = 'auto'
          noteTextareaRef.current.style.height = `${noteTextareaRef.current.scrollHeight}px`
        }
      })
      return () => cancelAnimationFrame(raf)
    }
  }, [activeView.type, currentNote?.id, currentNote?.content])

  // Only cards saved to the cabinet in this world (isSavedToCabinet === true)
  const savedCabinetCards = useMemo(() => {
    const cardMap = new Map<string, LoreCard & { sourceNoteTitle?: string }>()
    
    // 1. Gather all saved main expansion notes and saved child cards from notes
    activeWorld.notes.forEach(note => {
      if (note.isSavedToCabinet) {
        cardMap.set(note.id, {
          id: note.id,
          title: note.title || 'ส่วนขยาย',
          category: note.category || 'lore',
          summary: note.summary || '',
          content: note.content,
          tags: note.tags || [],
          isSavedToCabinet: true,
          sourceNoteId: note.id,
          sourceNoteTitle: note.title,
        })
      }
      note.childCards.forEach(c => {
        if (c.isSavedToCabinet) {
          cardMap.set(c.id, {
            ...c,
            sourceNoteId: note.id,
            sourceNoteTitle: note.title,
          })
        }
      })
    })

    // 2. Also merge any cards stored directly in activeWorld.cabinetCards (or standalone)
    const cabinetSource = activeWorld.cabinetCards.length > 0 ? activeWorld.cabinetCards : cabinetCards
    cabinetSource.forEach(c => {
      const existing = cardMap.get(c.id)
      if (existing) {
        cardMap.set(c.id, {
          ...existing,
          ...c,
          title: existing.title || c.title,
          content: existing.content || c.content,
          tags: existing.tags?.length ? existing.tags : c.tags,
          isSavedToCabinet: true,
          sourceNoteTitle: existing.sourceNoteTitle,
        })
      } else {
        cardMap.set(c.id, {
          ...c,
          isSavedToCabinet: true,
        })
      }
    })

    return Array.from(cardMap.values())
  }, [activeWorld.notes, activeWorld.cabinetCards, cabinetCards])

  // Pool of all available cards for this cell (Cabinet Cards + World Notes)
  const allAvailableCardsForCell = useMemo(() => {
    const cardMap = new Map<string, LoreCard>()
    // 1. Saved cabinet cards
    savedCabinetCards.forEach(c => cardMap.set(c.id, c))
    // 2. World notes (in-progress expansion cards)
    activeWorld.notes.forEach(n => {
      if (!cardMap.has(n.id)) {
        cardMap.set(n.id, {
          id: n.id,
          title: n.title,
          content: n.content,
          tags: n.tags || [],
          childCards: [],
          created_at: n.created_at,
          isSavedToCabinet: n.isSavedToCabinet,
        })
      }
    })
    return Array.from(cardMap.values())
  }, [savedCabinetCards, activeWorld.notes])

  // Clear all pinned cards for this cell
  const handleClearAllCellCards = (cellId: string) => {
    updateActiveWorld(prev => ({
      ...prev,
      stageCells: prev.stageCells.map(c => (c.id === cellId ? { ...c, pinnedCardIds: [] } : c))
    }))
    setNotificationMessage('ล้างการ์ดที่ผูกกับสถานที่นี้ทั้งหมดแล้ว')
    setJustSavedNotification(true)
    setTimeout(() => setJustSavedNotification(false), 2000)
  }

  // Auto-Stage / Auto-Link matching cards into this Stage Cell
  const handleAutoStageCards = (cell: StageCellItem) => {
    if (allAvailableCardsForCell.length === 0 || isAutoLinking) return
    setIsAutoLinking(true)

    setTimeout(() => {
      // Analyze text context from cell (title + description + core world context)
      const contextWords = `${cell.title} ${cell.description} ${activeWorld.rawLore.slice(0, 120)}`
        .toLowerCase()
        .replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 2)

      // Score each card in the pool
      const scoredCards = allAvailableCardsForCell.map(card => {
        let score = 0
        const cardTitle = (card.title || '').toLowerCase()
        const cardContent = (card.content || '').toLowerCase()
        const cardTags = (card.tags || []).map(t => t.toLowerCase())

        contextWords.forEach(word => {
          if (cardTitle.includes(word)) score += 3.5
          if (cardTags.some(t => t.includes(word))) score += 2.5
          if (cardContent.includes(word)) score += 1.0
        })

        return { cardId: card.id, score, title: card.title }
      })

      // Sort descending by relevance score
      scoredCards.sort((a, b) => b.score - a.score)

      // Select top 1-3 matching cards (score > 0, cap at 3)
      let matches = scoredCards.filter(c => c.score > 0).slice(0, 3).map(c => c.cardId)

      // Fallback: If no strong word match, pick top 1-2 cards from pool
      if (matches.length === 0 && allAvailableCardsForCell.length > 0) {
        matches = allAvailableCardsForCell.slice(0, 2).map(c => c.id)
      }

      // Merge into cell pinned cards without duplicates
      updateActiveWorld(prev => ({
        ...prev,
        stageCells: prev.stageCells.map(c => {
          if (c.id === cell.id) {
            const merged = Array.from(new Set([...c.pinnedCardIds, ...matches]))
            return { ...c, pinnedCardIds: merged }
          }
          return c
        })
      }))

      setIsAutoLinking(false)
      setNotificationMessage(`🪄 ผูกการ์ดที่เกี่ยวข้องสำเร็จแล้ว (${matches.length} ใบ)`)
      setJustSavedNotification(true)
      setTimeout(() => setJustSavedNotification(false), 2400)
    }, 450)
  }

  const filteredCabinetCards = useMemo(() => {
    const q = cabinetSearchQuery.trim().toLowerCase()
    if (!q) return savedCabinetCards
    return savedCabinetCards.filter(c => {
      return (
        c.title.toLowerCase().includes(q) ||
        c.content.toLowerCase().includes(q) ||
        (c.tags || []).some(t => t.toLowerCase().includes(q)) ||
        (c.sourceNoteTitle && c.sourceNoteTitle.toLowerCase().includes(q))
      )
    })
  }, [savedCabinetCards, cabinetSearchQuery])

  // Aggregated existing tags across all notes, childCards, and cabinetCards in activeWorld
  const allWorldTags = useMemo(() => {
    const tagSet = new Set<string>()
    activeWorld.notes.forEach(note => {
      ;(note.tags || []).forEach(t => {
        const clean = t.trim().replace(/^#+/, '')
        if (clean) tagSet.add(clean)
      })
      note.childCards.forEach(card => {
        (card.tags || []).forEach(t => {
          const clean = t.trim().replace(/^#+/, '')
          if (clean) tagSet.add(clean)
        })
      })
    })
    ;(activeWorld.cabinetCards || []).forEach(card => {
      (card.tags || []).forEach(t => {
        const clean = t.trim().replace(/^#+/, '')
        if (clean) tagSet.add(clean)
      })
    })
    ;(cabinetCards || []).forEach(card => {
      (card.tags || []).forEach(t => {
        const clean = t.trim().replace(/^#+/, '')
        if (clean) tagSet.add(clean)
      })
    })
    const defaultPresets = ['วัตถุดิบ', 'สถานที่', 'ตัวละคร', 'ความลับ', 'ชนวนเหตุ', 'กฎเกณฑ์']
    defaultPresets.forEach(t => tagSet.add(t))
    return Array.from(tagSet)
  }, [activeWorld.notes, activeWorld.cabinetCards, cabinetCards])

  // Reusable Tactile Tag Bar with Discreet Deletion & Floating Capsule Tray
  const renderCardTags = (card: LoreCard, noteId?: string, extraBadge?: React.ReactNode) => {
    const isPopoverOpen = activeTagPopoverCardId === card.id
    const currentTags = card.tags || []
    const unusedWorldTags = allWorldTags.filter(t => !currentTags.includes(t))

    return (
      <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0 pr-1 relative">
        {currentTags.length > 0 ? (
          currentTags.map((tag, tIdx) => (
            <span
              key={tIdx}
              className="group/tag inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono text-white/70 bg-white/[0.04] border border-white/[0.08] hover:border-white/20 hover:text-white transition-all select-none"
            >
              <span>#{tag}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveTagFromCard(card, tIdx, noteId)
                }}
                className="opacity-60 hover:opacity-100 sm:opacity-0 sm:group-hover/tag:opacity-100 hover:text-rose-400 p-0.5 rounded transition-all cursor-pointer -mr-0.5"
                title={`ลบแท็ก #${tag}`}
              >
                <X size={10} strokeWidth={2.2} />
              </button>
            </span>
          ))
        ) : (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-white/35 bg-white/[0.03] border border-white/[0.06]">
            ยังไม่มีแท็ก
          </span>
        )}

        {/* Button to open Add Tag Capsule */}
        <div className="relative inline-block">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (isPopoverOpen) {
                setActiveTagPopoverCardId(null)
              } else {
                setActiveTagPopoverCardId(card.id)
                setNewTagInput('')
              }
            }}
            className={`h-[20px] px-1.5 rounded-md text-[10px] font-mono border transition-all flex items-center gap-1 cursor-pointer select-none active:scale-95 ${
              isPopoverOpen
                ? 'bg-white/[0.12] border-white/30 text-white shadow-sm'
                : 'bg-white/[0.03] hover:bg-white/[0.08] border-dashed border-white/[0.15] hover:border-white/30 text-white/50 hover:text-white/90'
            }`}
            title="เพิ่มแท็ก (เลือกแท็กเดิมหรือพิมพ์ใหม่)"
          >
            <Plus size={10} strokeWidth={2.2} />
            <span>แท็ก</span>
          </button>

          {/* Floating Capsule Tray Popover */}
          {isPopoverOpen && (
            <>
              {/* Backdrop for click outside */}
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveTagPopoverCardId(null)
                }}
              />

              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-full mt-1.5 w-[240px] sm:w-[260px] p-2.5 rounded-xl bg-[#18181B] border border-white/[0.15] shadow-[0_12px_36px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.12)] z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Input Bar */}
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/40 border border-white/[0.10] focus-within:border-white/30 focus-within:bg-black/60 transition-all">
                  <span className="text-[11px] font-mono text-white/30 select-none">#</span>
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTagInput.trim()) {
                        e.preventDefault()
                        handleAddTagToCard(card, newTagInput, noteId)
                        setNewTagInput('')
                      }
                    }}
                    placeholder="พิมพ์แท็กใหม่แล้วกด Enter..."
                    className="w-full bg-transparent text-[11px] text-[#F1F1F1] placeholder-white/30 outline-none border-none p-0"
                    autoFocus
                  />
                  {newTagInput.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        handleAddTagToCard(card, newTagInput, noteId)
                        setNewTagInput('')
                      }}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.12] hover:bg-white/[0.22] text-white transition-colors cursor-pointer shrink-0"
                    >
                      เพิ่ม
                    </button>
                  )}
                </div>

                {/* Existing Tags Tray */}
                <div className="mt-2.5 pt-2 border-t border-white/[0.06] space-y-1.5">
                  <div className="text-[10px] font-medium text-white/40 flex items-center justify-between">
                    <span>แท็กเดิมในโลกนี้</span>
                    <span className="text-[9px] font-mono text-white/30">แตะเพื่อเพิ่ม</span>
                  </div>

                  {unusedWorldTags.length === 0 ? (
                    <div className="text-[10px] text-white/30 italic py-1 text-center">
                      เพิ่มครบทุกแท็กที่มีแล้ว
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1 max-h-[110px] overflow-y-auto pr-0.5">
                      {unusedWorldTags.map((existingTag) => (
                        <button
                          key={existingTag}
                          type="button"
                          onClick={() => {
                            handleAddTagToCard(card, existingTag, noteId)
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono text-white/70 bg-white/[0.04] hover:bg-white/[0.12] border border-white/[0.08] hover:border-white/25 hover:text-white transition-all cursor-pointer active:scale-95 text-left"
                          title={`เพิ่ม #${existingTag}`}
                        >
                          <Plus size={9} className="text-[#EF264C]" strokeWidth={2.5} />
                          <span>#{existingTag}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {extraBadge}
      </div>
    )
  }

  // =========================================================================
  // WORLD PROMPT INSPECTOR GENERATORS & HELPERS
  // =========================================================================
  const assembledWorldPrompt = useMemo(() => {
    const parts: string[] = []
    
    parts.push(`=== WORLD BLUEPRINT: ${activeWorld.title || 'โรงเรียนเวทมนตร์'} ===`)
    parts.push(`[CORE WORLD LORE]\n${combinedWorldLore || '(ยังไม่ได้ระบุแก่นเรื่องโลก)'}`)
    
    if (activeWorld.sparkText?.trim()) {
      parts.push(`\n[THE INCITING SPARK · ชนวนเหตุจุดเริ่มต้นที่ไม่อาจถอยกลับได้]\n${activeWorld.sparkText.trim()}`)
    }

    if (activeWorld.notes.length > 0) {
      const notesSummary = activeWorld.notes.map((n, idx) => {
        const childCount = n.childCards?.length || 0
        return `  - ส่วนขยาย #${idx + 1}: "${n.title}" (${n.content.slice(0, 100)}${n.content.length > 100 ? '...' : ''}) [มี ${childCount} บัตรวัตถุดิบ]`
      }).join('\n')
      parts.push(`\n[ACTIVE EXPANSION NOTES · ขอบเขตส่วนขยายที่แตกหน่อ]\n${notesSummary}`)
    }

    const savedCards = savedCabinetCards
    if (savedCards.length > 0) {
      const cardsSummary = savedCards.map(c => `  - [${(c.tags || []).map(t => `#${t}`).join(' ')}] ${c.title}: ${c.content}`).join('\n')
      parts.push(`\n[FILED LORE CABINET CARDS · บัตรวัตถุดิบในตู้ลิ้นชักที่พร้อมใช้บนเวที]\n${cardsSummary}`)
    }

    if (currentCell) {
      const pinnedCards = savedCabinetCards.filter(c => currentCell.pinnedCardIds.includes(c.id))
      const cellSummary = `ชื่อสถานที่: ${currentCell.title}\nคำบรรยาย: ${currentCell.description || '(ไม่มีคำบรรยาย)'}\nการ์ดที่ผูกไว้: ${pinnedCards.length > 0 ? pinnedCards.map(c => c.title).join(', ') : 'ยังไม่ได้ผูกการ์ด'}`
      parts.push(`\n[ACTIVE STAGE CELL · จุดเกิดเหตุการณ์ / สถานที่จำลอง]\n${cellSummary}`)
    }

    parts.push(`\n[ROLEPLAY & SIMULATION INSTRUCTION]\nให้จำลองบรรยากาศตาม Core World Lore และ The Inciting Spark โดยผูกโยงกับองค์ประกอบและวัตถุดิบที่ผู้กำกับระบุไว้ รักษาความลึกลับ กฎเกณฑ์ และอารมณ์ร่วมของโลกอย่างเคร่งครัด`)

    return parts.join('\n')
  }, [activeWorld, combinedWorldLore, savedCabinetCards, currentCell])

  const sparkEnginePrompt = useMemo(() => {
    const sparkMode = isSparkPlayerEdited && activeWorld.sparkText.trim()
      ? 'โหมด ✨ เรียบเรียงสปาร์คที่ผู้เล่นเขียนเอง (Polish into In Medias Res Collision)'
      : activeWorld.sparkText.trim()
      ? 'โหมด 🔄 สกัดสปาร์คใหม่ — สุ่มจุดตั้งต้น ชนวนเหตุ และฉากตัวละครชนกันมุมใหม่ (Regenerate Spark)'
      : 'โหมดสกัดสปาร์ค — จุดเริ่มต้นที่ทำให้ทุกอย่างหมุน & ฉากชนกัน In Medias Res (Extract)'

    const historyStr = sparkHistory.length > 0
      ? sparkHistory.map((s, idx) => `--- รอบที่ ${idx + 1} ---\n${s}`).join('\n\n')
      : ''

    return `=== SYSTEM PROMPT: THE SPARK ARCHITECT (IN MEDIAS RES COLLISION ENGINE) ===
[ROLE: THE SPARK ARCHITECT — สถาปนิกผู้สกัดจุดเริ่มต้นที่ทำให้ทุกอย่างหมุน & ฉากชนกัน In Medias Res]
หน้าที่ของคุณคือการอ่านข้อมูลโลกหลัก ([WORLD_LORE]) ของผู้เล่น แล้วสกัดหรือจุดประกาย "The Spark That Sets Everything in Motion (จุดเริ่มต้นที่ทำให้ทุกอย่างหมุน)" โดยคิดตามโครงสร้างแม่พิมพ์ระดับตำนาน แล้วส่งออก Output เป็น "เหตุการณ์ In Medias Res วินาทีที่ตัวละครชนกันและถอยกลับไม่ได้อีก" ด้วยภาษาง่ายๆ คมๆ ที่อ่านเข้าใจทันที

[แม่พิมพ์วิธีคิด 6 จังหวะ (Thinking Framework — ต้องคิดตามลำดับนี้ก่อนเขียนเสมอ)]:
1. เรื่องไม่ได้เริ่มจากระบบใหญ่หรือประวัติศาสตร์โลก
2. แต่มันเริ่มจาก "ตัวเราในมุมคนธรรมดา" ที่รีเลทง่าย
3. แล้วมี "ของชิ้นเดียว / ชนวนเหตุเฉพาะหน้า / การตัดสินใจใกล้ตัว"
4. แล้วดันไป "ชน" กับตัวละครเฉพาะเจาะจงอีก 1 คน (คนที่ไม่น่าจะมาเจอกันได้)
5. จนมาถึง "จุดที่ถอยกลับไม่ได้อีก" (ใคร ถอยกลับไม่ได้ เพราะอะไร)
6. พอประกายไฟนี้ติด... โลกที่เหลือก็ค่อยๆ ไหลตามมาเอง

[กฎเหล็กในการเขียน Output (3 บล็อก In Medias Res)]:
- ห้ามใช้ภาษาเรียงความนิยายที่เวิ่นเว้อซับซ้อนเด็ดขาด ให้ใช้คำพูดง่ายๆ สั้นๆ เห็นภาพเป็นช็อตๆ ทันที
- หากผู้เล่นเขียนมาแค่ฉากหลังโลกกว้างๆ จงใช้จินตนาการแต่งจุดตั้งต้นของคนธรรมดา + ชนวนเหตุเฉพาะหน้า + ตัวละครที่มาชนกันตรงหน้าในโลกใบนั้นขึ้นมาได้เลย
- ส่งออกผลลัพธ์เป็น 3 บล็อกสั้นๆ ตามโครงสร้างนี้เท่านั้น:
• เรื่องไม่ได้เริ่มจาก [ระบบใหญ่/ประวัติศาสตร์โลก] — แต่มันเริ่มจากคุณที่เป็น [ตัวเราในมุมคนธรรมดา + ชนวนเหตุเฉพาะหน้า/สิ่งของ/การตัดสินใจที่พามาถึงจุดนี้]
• วินาทีที่ชนกัน (In Medias Res): [ฉากเหตุการณ์ตรงหน้าที่กำลังเกิดขึ้นเดี๋ยวนี้ วินาทีที่คุณพุ่งชนเข้ากับ "ตัวละครสำคัญอีกคน" แบบเห็นภาพการกระทำ สายตา หรือคำพูดตรงหน้าทันที]
• จุดที่ถอยกลับไม่ได้อีก: [ระบุตรงๆ ว่าทำไมวินาทีนี้คุณถึงถอยกลับไปใช้ชีวิตเดิมไม่ได้แล้ว + เป้าหมาย/ความลับ/ความรู้สึกที่ทำให้โลกทั้งใบเริ่มหมุนตั้งแต่วินาทีนี้]

--------------------------------------------------
[ACTIVE MODE]: ${sparkMode}

[TARGET RAW WORLD LORE]:
"${combinedWorldLore || '(ยังไม่ได้ป้อนแก่นเรื่องโลก)'}"

${
  activeWorld.sparkText.trim()
    ? `[CURRENT SPARK IN STUDIO]:\n"${activeWorld.sparkText.trim()}"`
    : ''
}${
  historyStr
    ? `\n\n[PREVIOUS_SPARKS HISTORY]:\n${historyStr}`
    : ''
}`
  }, [combinedWorldLore, isSparkPlayerEdited, activeWorld.sparkText, sparkHistory])

  const sproutEnginePrompt = useMemo(() => {
    const extractedList = activeWorld.notes
      .filter(n => n.title.trim() || n.content.trim())
      .map(n => n.content.trim() ? `${n.title}: ${n.content}` : n.title)
    const alreadyStr = extractedList.length > 0 
      ? extractedList.map(t => `- ${t}`).join('\n') 
      : '(ยังไม่มี — กำลังเป็นการสกัดชุดแรก)'

    return `=== SYSTEM PROMPT: WORLD LORE EXPANDER (แตกส่วนขยาย / สกัดเพิ่ม) ===
[ROLE: THE WORLD LORE EXPANDER — สถาปนิกผู้ขยายรายละเอียดของโลก]
หน้าที่ของคุณคือการอ่าน "ข้อมูลโลกหลัก ([WORLD_LORE])" ที่ผู้เล่นเขียนขึ้น แล้วดึงประเด็นที่ผู้เล่นพูดถึงออกมาขยายต่อยอดเป็น "ส่วนขยายของโลก (Expansion Notes)" ทีละชุด (ชุดละไม่เกิน 4–5 หัวข้อ)

[ปรัชญาและกฎเหล็กสูงสุด 6 ข้อ]:

1. โลกหลักคือคัมภีร์ตั้งต้น (Sacred World Context & Mood Lock):
   - ข้อความใน [WORLD_LORE] ทั้งหมดคือโลกทั้งใบที่ผู้เล่นมีภาพและบรรยากาศในหัวอยู่แล้ว
   - จงอ่านทั้งย่อหน้าเพื่อซึมซับ "มูดแอนด์โทนและบรรยากาศ" ของโลกใบนี้ (ไม่ว่าจะเป็นแนวแฟนตาซี, โรงเรียน, โจรสลัด, ชมรมดนตรี, การเมือง, หรือชีวิตประจำวัน)
   - ห้ามเปลี่ยนโทนเรื่องเด็ดขาด: ถ้าผู้เล่นเขียนโทนอบอุ่น สนุกสนาน หรือลึกลับน่าค้นหา จงรักษาคลื่นความถี่นั้นไว้ ห้ามยัดเยียดดราม่าเครียดจัด และห้ามแต่งพล็อตเหตุการณ์ล่วงหน้า (เช่น ห้ามแต่งเรื่องให้เกิดโศกนาฏกรรมหรือความแตกแยกใหญ่โตที่ผู้เล่นไม่ได้เขียน)

2. หนึ่งหัวข้อ = หนึ่งเรื่องบริสุทธิ์ ห้ามยำรวมกัน (1 Expansion = 1 Pure Topic):
   - ห้ามนำหลายเรื่องที่คนละประเด็นกันมาปนในส่วนขยายเดียวเด็ดขาด!
   - ตัวอย่างที่ผิด: เอาเรื่อง "ไม้กายสิทธิ์" ไปปนกับ "สัตว์วิเศษ" หรือเอาเรื่อง "การแบ่งบ้าน" ไปปนกับ "อาจารย์"
   - ตัวอย่างที่ถูก (สำหรับดูเป็นแนวทางการแยกเรื่องเท่านั้น ห้ามใช้หัวข้อตัวอย่างนี้เป็นแม่พิมพ์เลือกหัวข้อการ์ดเด็ดขาด):
     • แยกเรื่อง "การแบ่งบ้าน" ออกจากเรื่อง "ไม้กายสิทธิ์และการร่ายคาถา" และแยกออกจากเรื่อง "การซ่อนตัวจากโลกภายนอก" อย่างชัดเจน

3. การชั่งน้ำหนักเพื่อเลือกหัวข้อการ์ดจากสิ่งที่ผู้เล่นพิมพ์ (Dynamic Weight Balancing — ใช้ข้อนี้เป็นตัวกำหนดหัวข้อการ์ด 100%):
   - การเลือกหัวข้อการ์ดต้องดึงตามลำดับและน้ำหนักเรื่องราวที่ผู้เล่นพิมพ์ใน [WORLD_LORE] เท่านั้น ห้ามจัดหมวดหมู่ตามแม่พิมพ์ตายตัว โดยให้กวาดอ่านตั้งแต่ประโยคแรกสุดแล้วจับก้อนตาม 3 ลักษณะนี้:
     • เรื่องที่ผู้เล่นเปิดเรื่องและเล่าละเอียดหรือให้น้ำหนักมาก (เช่น จุดเริ่มต้นวันแรกของตัวละครและเพื่อนสนิท, เหตุการณ์สำคัญ, หรือบุคคลพิเศษที่มีบทบาทชัดเจนอย่างรุ่นพี่ที่เป็นไอดอล): เรื่องที่ผู้เล่นเขียนบรรยายไว้ยาวเหล่านี้มีน้ำหนักในตัวเองเต็มที่อยู่แล้ว ต้องหยิบขึ้นมาตั้งเป็น 1 การ์ดส่วนขยายของตัวเองทันที (โดยเฉพาะเรื่องที่ผู้เล่นเขียนเปิดหัวเรื่องยาวๆ ต้องได้เป็นการ์ดใบแรกเสมอ ห้ามตัดทิ้งและห้ามนำไปซ่อนเป็นแค่ติ่งเล็กๆ ในการ์ดอื่นเด็ดขาด!)
     • ภาพบรรยากาศหรือโมเมนต์ย่อยๆ ที่อยู่ในอารมณ์เดียวกัน: หากผู้เล่นร่ายเศษภาพสั้นๆ ที่อยู่ในจังหวะชีวิตหรืออารมณ์เดียวกัน (เช่น หลังเลิกซ้อม เดินกินไอติม ข้ามทางรถไฟ หรือความทุ่มเท มิตรภาพ และการบอกรักบนสะพาน) ให้ร้อยเรียงจุดย่อยที่เกี่ยวเนื่องกันเหล่านั้นเข้าด้วยกัน เพื่อให้การ์ดมีน้ำหนักอิ่มและมีเสน่ห์ (โดยไม่เอาคนละเรื่องมาปนกันตามกฎข้อ 2)
     • เรื่องสำคัญที่ผู้เล่นเอ่ยถึงสั้นๆ เพียงคำเดียว (ขาดรายละเอียดพ่วง): หากผู้เล่นพูดถึงแกนสำคัญไว้สั้นๆ โดดๆ (เช่น พิมพ์แค่ชื่ออุปกรณ์ พลัง หรือแค่คำว่าเสียงดนตรีที่รัก) ให้ใช้กฎข้อ 4 ช่วยจินตนาการต่อยอดเติมรายละเอียดให้เรื่องนั้นมีน้ำหนักอิ่มเต็ม 1 การ์ดด้วยตัวเองทันที

4. จินตนาการต่อยอดล่วงหน้า 1 ก้าวเวลาเขียนเนื้อหาในการ์ด (Natural World Extrapolation — ใช้สำหรับความลึกของเนื้อหา):
   - หลังจากเลือกก้อนหัวข้อการ์ดตามน้ำหนักจากกฎข้อ 3 ได้แล้ว เวลาเขียนเนื้อหา (content) ในแต่ละการ์ด จงช่วย "คิดรายละเอียดต่อยอดล่วงหน้า 1 ก้าว" เสมือนอ่านใจผู้เล่นออก เพื่อให้เนื้อหาในการ์ดมีความลึก ลื่นไหล และเห็นภาพชัดเจน (เหมือนเวลาอธิบายเรื่องไม้กายสิทธิ์ที่ช่วยลงลึกถึงแกนไม้นกฟีนิกซ์และแกนหัวใจมังกร เวลาอธิบายเรื่องบ้านที่ช่วยลงลึกถึงสัญลักษณ์และระบบคะแนนเกียรติยศ เวลาอธิบายเรื่องการซ่อนตัวจากโลกภายนอกที่ลงลึกถึงองค์กรปกปิดความลับและคำเรียกมักเกิ้ล หรือเวลาเล่าเรื่องจุดเริ่มต้นของตัวละคร เพื่อนสนิท รุ่นพี่ ความรัก และบรรยากาศเมือง ที่ช่วยร้อยเรียงเคมีตัวละคร สายลม แสงไฟ และวิถีชีวิตให้มีชีวิตชีวา)
   - (หมายเหตุสำคัญ: ตัวอย่างเรื่องเวทมนตร์มีไว้เพื่อแสดง "ระดับความลึกและความลื่นไหลของการเขียนเนื้อหา" เท่านั้น ห้ามใช้เป็นแม่พิมพ์ในการเลือกหัวข้อการ์ดเด็ดขาด การเลือกหัวข้อการ์ดต้องดึงตามน้ำหนักเรื่องราวของผู้เล่นในข้อ 3 เท่านั้น!)
   - ขยายทั้ง "จุดเริ่มต้นของเรื่อง ความสัมพันธ์ บุคคลสำคัญ ข้อมูลตั้งต้นของโลก และบรรยากาศ" เพื่อให้โลกมีมิติและนำไปสร้างการ์ดย่อยต่อได้ทันที

5. สกัดทีละชุด ไม่เกิน 4–5 หัวข้อ และห้ามซ้ำของเดิม (Progressive Batch Extraction):
   - ตรวจสอบทั้ง "ชื่อหัวข้อ" และ "เนื้อหาข้างใน" ของการ์ดเดิมใน [ALREADY_EXTRACTED_TOPICS] ก่อนเสมอ
   - ห้ามสกัดหัวข้อซ้ำ และห้ามดึงประเด็นย่อยที่ถูกเขียนรวมอยู่ในเนื้อหาของการ์ดใบก่อนหน้ามาสร้างซ้ำอีกเด็ดขาด
   - หากเป็นการสกัดรอบแรก (ยังไม่มีหัวข้อเดิม): ให้อ่านไล่ตั้งแต่ประโยคแรกของผู้เล่นและเลือกก้อนที่มีน้ำหนักชัดเจนตามกฎข้อ 3 ออกมาก่อน 4–5 หัวข้อ (ห้ามลืมหยิบจุดเริ่มต้นหรือตัวละครสำคัญที่ผู้เล่นเน้นในประโยคแรกๆ)
   - หากเป็นการกด "สกัดเพิ่ม" (มีหัวข้อเดิมอยู่แล้ว): ให้กวาดสายตาหาประเด็นอื่นๆ ใน [WORLD_LORE] ที่ผู้เล่นเขียนไว้แต่ยังตกหล่นหรือยังไม่ถูกเล่าอยู่ในเนื้อหาของการ์ดใบใดเลย แล้วดึงออกมาอีกไม่เกิน 4–5 หัวข้อ (หากเหลือประเด็นที่ยังไม่ได้สกัดเพียง 1–3 เรื่อง ก็ให้ดึงออกมาเท่าที่เหลือจริง ห้ามเมคเรื่องใหม่ที่ไม่มีใน [WORLD_LORE])

6. รูปแบบภาษาและโครงสร้างผลลัพธ์ (Output Format):
   - ใช้ภาษาไทยที่สละสลวย เห็นภาพชัดเจน อ่านเข้าใจง่าย ไม่เวิ่นเว้อ
   - ความยาวของ content ในแต่ละส่วนขยาย: ประมาณ 80–150 คำ (2–3 ย่อหน้าสั้นๆ ที่อัดแน่นด้วยรายละเอียดของเรื่องนั้นเพียวๆ)
   - ตอบกลับเป็น JSON Array เท่านั้น: id, title, category ("faction | location | rule | lore"), summary, content, tags

--------------------------------------------------
[RUN-TIME PAYLOAD TO AI]:
[WORLD_LORE (ข้อมูลโลกทั้งใบของผู้เล่น)]:
"${combinedWorldLore || '(ยังไม่ได้ป้อนแก่นเรื่องโลก)'}"

[ALREADY_EXTRACTED_TOPICS (หัวข้อและเนื้อหาที่สกัดไปแล้ว — ห้ามทำซ้ำและห้ามดึงเรื่องย่อยที่อยู่ในเนื้อหาข้างล่างนี้มาตั้งซ้ำเด็ดขาด)]:
${alreadyStr}`
  }, [combinedWorldLore, activeWorld.notes])

  const dissectEnginePrompt = useMemo(() => {
    const noteTitle = currentNote ? currentNote.title : '(ยังไม่ได้เลือกส่วนขยาย)'
    const noteContent = currentNote ? currentNote.content : '(ยังไม่มีเนื้อหา)'
    return `=== SYSTEM PROMPT: LORE CARD DISSECTOR ===
หน้าที่ของคุณคือการอ่านเนื้อหาของส่วนขยาย และสกัดวัตถุดิบย่อยออกมาเป็น "การ์ดวัตถุดิบพร้อมเข้าตู้ลิ้นชัก (Child Cards)"
เพื่อนำไปใช้เป็นตัวละคร, สถานที่, ไอเทม, หรือกฎเกณฑ์ในการจำลองเหตุการณ์

[ACTIVE EXPANSION NOTE]:
ชื่อส่วนขยาย: "${noteTitle}"
เนื้อหา:
"${noteContent}"

[EXTRACTION RULES]:
- สกัดวัตถุดิบออกมา 3-5 ใบ
- แต่ละใบกำหนด:
  * Title: ชื่อวัตถุดิบเฉพาะเจาะจง
  * Category: 'lore' | 'rule' | 'npc' | 'location' | 'object'
  * Content: คำอธิบายสั้น 1-2 ประโยคที่ใช้แสดงผลบนเวทีได้ทันที
  * Tags: แฮชแท็ก 2-3 อัน`
  }, [currentNote])

  const linkerEnginePrompt = useMemo(() => {
    const cellTitle = currentCell ? currentCell.title : '(ยังไม่ได้เลือกสถานที่)'
    const cellDesc = currentCell ? currentCell.description : '(ยังไม่มีคำบรรยาย)'
    return `=== SYSTEM PROMPT: AUTO-STAGE CARD LINKER ===
หน้าที่ของคุณคือการวิเคราะห์บรรยากาศของสถานที่ (Stage Cell) และคัดเลือกการ์ดวัตถุดิบที่เหมาะสมที่สุดจากตู้ลิ้นชักมาผูกไว้กับสถานที่นี้

[TARGET LOCATION (STAGE CELL)]:
สถานที่: "${cellTitle}"
บรรยากาศ: "${cellDesc}"

[AVAILABLE CABINET CARDS]:
${savedCabinetCards.map(c => `- ID: ${c.id} | Title: "${c.title}" | Tags: #${(c.tags || []).join(' #')}`).join('\n') || '(ยังไม่มีการ์ดในตู้ลิ้นชัก)'}

[MATCHING ALGORITHM]:
- คำนวณความสอดคล้องของคำศัพท์และมูดโทนระหว่างคำบรรยายสถานที่กับการ์ด
- เลือกการ์ดที่มีความสัมพันธ์สูงที่สุด (คะแนนคำพ้องบริบท > 0) เพื่อผูกเข้ากับสถานที่นี้ทันที`
  }, [currentCell, savedCabinetCards])

  const activePromptText = useMemo(() => {
    if (inspectorMainTab === 'assembled') {
      return assembledWorldPrompt
    }
    if (inspectorEngineTab === 'spark') return sparkEnginePrompt
    if (inspectorEngineTab === 'sprout') return sproutEnginePrompt
    if (inspectorEngineTab === 'dissect') return dissectEnginePrompt
    return linkerEnginePrompt
  }, [inspectorMainTab, inspectorEngineTab, assembledWorldPrompt, sparkEnginePrompt, sproutEnginePrompt, dissectEnginePrompt, linkerEnginePrompt])

  const handleCopyInspectorPrompt = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy)
    setCopiedInspectorPrompt(true)
    setTimeout(() => setCopiedInspectorPrompt(false), 2000)
  }

  return (
    <div className="w-full h-screen flex bg-[#0B0B0C] text-[#F1F1F1] select-none overflow-hidden font-['Thonburi',_'Sukhumvit_Set',_-apple-system,BlinkMacSystemFont,sans-serif]">

      {/* ========================================================================= */}
      {/* LEFT NOTION/GEMINI SIDEBAR: CLEAN MONOCHROME, NO EMOJIS                   */}
      {/* ========================================================================= */}
      <aside
        className={`h-full border-r border-white/[0.06] flex flex-col bg-[#111113] shrink-0 z-20 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-[260px]' : 'w-0 -translate-x-full border-r-0 overflow-hidden'
        }`}
      >
        {/* Sidebar Header: Unified Back, Minimal [ ตัวละคร | โลก ] Switcher, and Collapse Button */}
        <div className="h-12 px-3.5 border-b border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToHome}
              className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer active:scale-95"
              title="กลับสู่หน้าหลัก"
            >
              <ArrowLeft size={14} />
            </button>

            {/* Minimal Unified Mode Switcher: [ ตัวละคร | โลก ] */}
            <div className="h-7 p-0.5 rounded-full bg-white/[0.04] border border-white/10 flex items-center gap-0.5 text-[11.5px] font-sans select-none">
              <button
                type="button"
                onClick={onEnterStage}
                className="h-full px-2.5 rounded-full transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 font-medium text-white/45 hover:text-white/85 hover:bg-white/[0.04]"
                title="สลับไปหน้าตัวละครและหน้าต่างแชทหลัก"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                <span>ตัวละคร</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setWelcomeDraftLore('')
                  setIsWelcomeDropdownOpen(false)
                  setActiveView({ type: 'welcome' })
                }}
                className="h-full px-2.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 font-medium bg-white/[0.10] text-[#F1F1F1] shadow-sm"
                title="เข้าสู่หน้าต้อนรับ (Welcome Screen)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C]" />
                <span>โลก</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
            title="พับเก็บแถบข้าง"
          >
            <PanelLeft size={14} />
          </button>
        </div>

        {/* Master Tree Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 no-scrollbar">

          {/* หมวดที่ 1: โลก */}
          <div className="space-y-1">
            <div className="px-2 py-1 text-[11px] font-medium text-[#71767B] tracking-wide flex items-center justify-between">
              <span>โลก</span>
              <button
                type="button"
                onClick={handleAddNewWorld}
                className="text-white/30 hover:text-white p-0.5 rounded hover:bg-white/[0.06] transition-all cursor-pointer"
                title="เพิ่มโลกใหม่"
              >
                <Plus size={13} />
              </button>
            </div>

            {/* Worlds List (Clean Standard Notion/Apple Hierarchy) */}
            <div className="space-y-0.5">
              {worlds.map((w) => {
                const isCurrent = w.id === activeWorld.id
                const hasSpark = Boolean(w.sparkText && w.sparkText.trim())
                return (
                  <div
                    key={w.id}
                    onClick={() => {
                      handleSwitchWorld(w.id)
                      setActiveView({ type: 'master' })
                    }}
                    className={`px-2.5 py-2 rounded-lg text-left text-[13.5px] transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                      isCurrent && activeView.type !== 'welcome'
                        ? 'bg-white/[0.08] text-[#F1F1F1] font-medium'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                      <Globe size={14} className="shrink-0 text-inherit opacity-70 group-hover:opacity-100 transition-opacity" />
                      <span className="truncate">{w.title}</span>
                    </div>

                    {!hasSpark ? (
                      <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-rose-500/15 text-rose-300 border border-rose-500/25 shrink-0">
                        ยังไม่มี spark
                      </span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="มีชนวนเหตุแล้ว" />
                    )}

                    {worlds.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setWorlds(prev => prev.filter(x => x.id !== w.id))
                          if (activeWorldId === w.id) {
                            const remaining = worlds.filter(x => x.id !== w.id)
                            if (remaining[0]) handleSwitchWorld(remaining[0].id)
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded transition-opacity"
                        title="ลบโลกนี้"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* หมวดที่ 2: ส่วนขยาย */}
          <div className="space-y-1">
            <div className="px-2 py-1 text-[11px] font-medium text-[#71767B] tracking-wide flex items-center justify-between">
              <span>ส่วนขยาย</span>
              <button
                type="button"
                onClick={handleAddNewNote}
                className="text-white/30 hover:text-white p-0.5 rounded hover:bg-white/[0.06] transition-all cursor-pointer"
                title="เพิ่มโน้ตส่วนขยายใหม่"
              >
                <Plus size={13} />
              </button>
            </div>

            {activeWorld.notes.length === 0 ? (
              <div className="px-2 py-1 text-[11px] text-white/30 italic">
                ยังไม่มีส่วนขยาย
              </div>
            ) : (
              activeWorld.notes.map(note => {
                const isActive = activeView.type === 'note' && activeView.noteId === note.id
                return (
                  <div
                    key={note.id}
                    onClick={() => setActiveView({ type: 'note', noteId: note.id })}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[13px] transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                      isActive
                        ? 'bg-white/[0.08] text-[#F1F1F1] font-medium'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                      <FileText size={14} className="shrink-0 text-inherit opacity-70 group-hover:opacity-100 transition-opacity" />
                      <span className="truncate">{note.title || 'ไม่มีชื่อ'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteNote(note.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded transition-opacity shrink-0"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {/* หมวดที่ 3: สถานที่ */}
          <div className="space-y-1">
            <div className="px-2 py-1 text-[11px] font-medium text-[#71767B] tracking-wide flex items-center justify-between">
              <span>สถานที่</span>
              <button
                type="button"
                onClick={handleAddNewStageCell}
                className="text-white/30 hover:text-white p-0.5 rounded hover:bg-white/[0.06] transition-all cursor-pointer"
                title="เพิ่มสถานที่ใหม่"
              >
                <Plus size={13} />
              </button>
            </div>

            {activeWorld.stageCells.length === 0 ? (
              <div className="px-2 py-1 text-[11px] text-white/30 italic">
                ยังไม่มีสถานที่
              </div>
            ) : (
              activeWorld.stageCells.map(cell => {
                const isActive = activeView.type === 'cell' && activeView.cellId === cell.id
                return (
                  <button
                    key={cell.id}
                    type="button"
                    onClick={() => setActiveView({ type: 'cell', cellId: cell.id })}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[13px] transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                      isActive
                        ? 'bg-white/[0.08] text-[#F1F1F1] font-medium'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                      <MapPin size={14} className="shrink-0 text-inherit opacity-70 group-hover:opacity-100 transition-opacity" />
                      <span className="truncate">{cell.title}</span>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* หมวดที่ 4: ตู้ลิ้นชัก */}
          <div className="space-y-1 pt-2 border-t border-white/[0.05]">
            <button
              type="button"
              onClick={() => setActiveView({ type: 'cabinet' })}
              className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[13px] transition-all cursor-pointer flex items-center justify-between group ${
                activeView.type === 'cabinet'
                  ? 'bg-white/[0.08] text-[#F1F1F1] font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Archive size={14} className="shrink-0 text-inherit opacity-70 group-hover:opacity-100 transition-opacity" />
                <span>ตู้ลิ้นชัก</span>
              </div>
              <span className="text-[10px] font-mono text-white/40">
                {savedCabinetCards.length}
              </span>
            </button>
          </div>

        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN RIGHT CANVAS: GEMINI SANCTUARY (PURE & SERENE)                        */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        {/* Minimal Quiet Top Header (No Breadcrumb, Quiet Enter Stage Button) */}
        <header className="h-12 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {!isSidebarOpen && (
              <>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
                  title="เปิดแถบข้าง"
                >
                  <PanelLeft size={14} />
                </button>
                <div className="h-7 p-0.5 rounded-full bg-white/[0.04] border border-white/10 flex items-center gap-0.5 text-[11.5px] font-sans select-none">
                  <button
                    type="button"
                    onClick={onEnterStage}
                    className="h-full px-2.5 rounded-full transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 font-medium text-white/45 hover:text-white/85 hover:bg-white/[0.04]"
                    title="สลับไปหน้าตัวละครและหน้าต่างแชทหลัก"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                    <span>ตัวละคร</span>
                  </button>
                  <button
                    type="button"
                    className="h-full px-2.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 font-medium bg-white/[0.10] text-[#F1F1F1] shadow-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C]" />
                    <span>โลก</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Inspector Button (Identical styling to Character view) */}
            <button
              type="button"
              onClick={() => setIsPromptInspectorOpen(true)}
              className="h-7 px-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-[10.5px] font-mono flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title="เปิดแผงตรวจเช็กพิมพ์เขียวโลก (Prompt Inspector)"
            >
              <FileCode2 size={12} className="text-[#38bdf8]" />
              <span>Inspector</span>
            </button>

            {/* ปุ่ม ก้าวขึ้นสู่เวที (Pill Style เหมือนปุ่ม Clear ในหน้าตัวละคร) */}
            <button
              type="button"
              onClick={onEnterStage}
              className="h-7 px-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/40 hover:text-white text-[10px] font-sans transition-all cursor-pointer flex items-center active:scale-95"
              title="สลับไปหน้าตัวละครและหน้าต่างแชทหลัก"
            >
              ก้าวขึ้นสู่เวที
            </button>
          </div>
        </header>

        {/* Scrollable Center Content */}
        <main className={`flex-1 overflow-y-auto px-4 sm:px-6 py-6 flex flex-col relative ${
          activeView.type === 'welcome' ? 'items-center justify-start pt-[16vh] sm:pt-[18vh]' : 'items-center justify-start'
        }`}>
          
          {/* Keyframes for Konosuba-style Slapstick Elastic Animation */}
          <style>{`
            /* Orb 1: Flat Carmine Red - swoops in from upper-left */
            @keyframes orbSwoopMint {
              0% { transform: translate(-140px, -60px) scale(0.2); opacity: 0; }
              50% { transform: translate(14px, 12px) scale(1.22); opacity: 1; }
              70% { transform: translate(-6px, -4px) scale(0.92); }
              85% { transform: translate(2px, 2px) scale(1.04); }
              100% { transform: translate(0, 0) scale(1); opacity: 1; }
            }

            /* Orb 2: Solar Gold Accent - pops in from center-right */
            @keyframes orbSwoopAzure {
              0% { transform: translate(100px, 0) scale(0.2); opacity: 0; }
              45% { transform: translate(-14px, -4px) scale(1.25); opacity: 1; }
              68% { transform: translate(5px, 2px) scale(0.92); }
              85% { transform: translate(-2px, -1px) scale(1.04); }
              100% { transform: translate(0, 0) scale(1); opacity: 1; }
            }

            /* Orb 3: Flat Purple Disc - swoops in from bottom-right */
            @keyframes orbSwoopLavender {
              0% { transform: translate(140px, 120px) scale(0.2); opacity: 0; }
              50% { transform: translate(-16px, -14px) scale(1.22); opacity: 1; }
              72% { transform: translate(6px, 5px) scale(0.92); }
              88% { transform: translate(-2px, -2px) scale(1.04); }
              100% { transform: translate(0, 0) scale(1); opacity: 1; }
            }

            /* Glass Card: Enters smoothly after orbs start landing, squash on collision, elastic rebound */
            @keyframes cardSquashRebound {
              0% { transform: scale(0.35) translateY(55px); opacity: 0; }
              50% { transform: scale(1.06, 0.90) translateY(-8px); opacity: 1; }
              70% { transform: scale(0.96, 1.04) translateY(3px); }
              85% { transform: scale(1.01, 0.99) translateY(-1px); }
              100% { transform: scale(1, 1) translateY(0); opacity: 1; }
            }

            /* 5th Action Orb ('!' Exclamation Button): Snaps in last with punchy comedic double-bounce */
            @keyframes konosubaExclamationIn {
              0% { transform: scale(0) translateY(-45px) rotate(-35deg); opacity: 0; }
              52% { transform: scale(1.4) translateY(8px) rotate(16deg); opacity: 1; }
              72% { transform: scale(0.88) translateY(-5px) rotate(-6deg); }
              88% { transform: scale(1.08) translateY(2px) rotate(2deg); }
              100% { transform: scale(1) translateY(0) rotate(0deg); opacity: 1; }
            }

            /* Gentle Organic Breathing after entrance settles */
            @keyframes orbBreathe {
              0%, 100% { transform: scale(1) translateY(0); }
              50% { transform: scale(1.07) translateY(-3px); }
            }
          `}</style>

          <div className={`w-full relative z-10 transition-all duration-200 ${
            activeView.type === 'welcome' ? 'max-w-2xl pb-16' : 'max-w-[860px] space-y-7'
          }`}>

            {/* Notification Toast */}
            {justSavedNotification && (
              <div className="p-2 rounded-full bg-white/[0.06] border border-white/10 text-white/80 text-[11.5px] flex items-center justify-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span>{notificationMessage}</span>
              </div>
            )}

            {/* VIEW 0: WELCOME GATE SCREEN (Gemini Center Stage + Frosted Glass + Konosuba Eyecatch Physics) */}
            {activeView.type === 'welcome' && (
              <div className="w-full max-w-[640px] mx-auto text-center animate-in fade-in zoom-in-95 duration-300 relative">
                
                {/* Center Headline: Calibrated to previous elegant size with relaxed breathing room */}
                <h1 className="text-[26px] sm:text-[30px] md:text-[33px] font-normal text-[#F2F2F5] tracking-[0.02em] mb-9 sm:mb-10 leading-tight [text-shadow:_0_2px_24px_rgba(0,0,0,0.95)]">
                  ทั้งหมดนี้เป็นเรื่องราวเกี่ยวกับอะไร...
                </h1>

                {/* Frosted Container with Character Orbs (Konosuba Gang Palette) */}
                <div className="relative mx-auto max-w-[580px] w-full pt-1">
                  
                  {/* ORB 1: HERO CARMINE RED (Leader - Largest Size ~96px) - Top Left Flank */}
                  <div
                    className="absolute top-[8%] -left-8 sm:-left-10 w-[84px] h-[84px] sm:w-[96px] sm:h-[96px] rounded-full pointer-events-none z-0"
                    style={{
                      background: 'linear-gradient(135deg, #FF3B69 0%, #EF264C 45%, #D40049 80%, #8A002A 100%)',
                      boxShadow: '0 0 55px rgba(239, 38, 76, 0.75)',
                      animation: isInitialBounce
                        ? 'orbSwoopMint 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                        : 'orbBreathe 4s ease-in-out infinite'
                    }}
                  />

                  {/* ORB 2: SOLAR GOLD ACCENT (Playful Spark - Smallest Size ~48px) - Center Right Flank */}
                  <div
                    className="absolute top-[34%] -right-4 sm:-right-5 w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] rounded-full pointer-events-none z-0"
                    style={{
                      background: 'linear-gradient(135deg, #FFF176 0%, #FEB340 45%, #FB8C00 80%, #D84315 100%)',
                      boxShadow: '0 0 38px rgba(254, 179, 64, 0.72)',
                      animation: isInitialBounce
                        ? 'orbSwoopAzure 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) 0.18s backwards'
                        : 'orbBreathe 4.5s ease-in-out infinite 0.8s'
                    }}
                  />

                  {/* ORB 3: ULTRAVIOLET PURPLE (Atmospheric Disc - Medium-Large ~84px) - Bottom Right Flank */}
                  <div
                    className="absolute -bottom-7 -right-6 sm:-right-8 w-[74px] h-[74px] sm:w-[84px] sm:h-[84px] rounded-full pointer-events-none z-0"
                    style={{
                      background: 'linear-gradient(135deg, #E056FD 0%, #A855F7 35%, #7C3AED 70%, #581C87 100%)',
                      boxShadow: '0 0 52px rgba(168, 85, 247, 0.72)',
                      animation: isInitialBounce
                        ? 'orbSwoopLavender 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) 0.25s backwards'
                        : 'orbBreathe 5s ease-in-out infinite 1.5s'
                    }}
                  />

                  {/* Frosted Glass Rounded-Rectangle (Enters Snappily with Squash & Rebound) */}
                  <div 
                    ref={welcomeCardContainerRef}
                    className="relative z-10 backdrop-blur-xl bg-white/[0.06] border border-white/[0.18] hover:border-white/[0.28] focus-within:border-white/[0.38] rounded-3xl sm:rounded-[32px] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(255,255,255,0.06),0_20px_50px_rgba(0,0,0,0.85)] min-h-[210px] sm:min-h-[235px] p-6 sm:p-7 flex flex-col justify-between transition-all"
                    style={{
                      animation: isInitialBounce
                        ? 'cardSquashRebound 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.30s backwards'
                        : undefined
                    }}
                  >
                    
                    {/* Top Text Input Area (Auto-expanding up to 8 lines max with generous breathing room) */}
                    <textarea
                      ref={welcomeTextareaRef}
                      value={welcomeDraftLore}
                      onFocus={() => {
                        if (!welcomeDraftLore.trim()) {
                          setIsWelcomeDropdownOpen(true)
                        }
                      }}
                      onClick={() => {
                        if (!welcomeDraftLore.trim()) {
                          setIsWelcomeDropdownOpen(true)
                        }
                      }}
                      onChange={(e) => {
                        const val = e.target.value
                        setWelcomeDraftLore(val)
                        if (val.trim()) {
                          setIsWelcomeDropdownOpen(false)
                        } else {
                          setIsWelcomeDropdownOpen(true)
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (e.metaKey || e.ctrlKey) {
                            // Cmd+Enter or Ctrl+Enter -> Insert newline
                            e.preventDefault()
                            const target = e.currentTarget
                            const start = target.selectionStart
                            const end = target.selectionEnd
                            const val = welcomeDraftLore
                            const newVal = val.substring(0, start) + '\n' + val.substring(end)
                            setWelcomeDraftLore(newVal)
                            setTimeout(() => {
                              target.selectionStart = target.selectionEnd = start + 1
                            }, 0)
                            return
                          }
                          if (e.shiftKey) {
                            // Shift+Enter natively inserts newline
                            return
                          }
                          // Plain Enter -> Send
                          e.preventDefault()
                          if (welcomeDraftLore.trim()) {
                            const created = handleCreateWorldFromWelcome(welcomeDraftLore)
                            if (created) {
                              handleGenerateWorldGenesis(created.rawLore, 'initial', created.id)
                            }
                          }
                        }
                      }}
                      placeholder="เล่าเรื่องราวในหัวของคุณออกมาได้เลย... (กด Cmd+Enter เพื่อขึ้นบรรทัดใหม่)"
                      className="w-full bg-transparent text-[15px] sm:text-[16px] text-white placeholder-white/40 focus:outline-none font-sans resize-none leading-relaxed min-h-[120px] sm:min-h-[140px] max-h-[240px] border-none p-0"
                    />

                    {/* Bottom Toolbar: Plus on Left, Primary Pills for Spark & Expansion on Right */}
                    <div className="flex items-center justify-between pt-3">
                      {/* Left: Plus Button */}
                      <button
                        type="button"
                        className="w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-95"
                        title="เพิ่มวัตถุดิบ"
                      >
                        <Plus size={17} strokeWidth={2.2} />
                      </button>

                      {/* Right: Actions (ปุ่ม สกัดสปาร์ค & ปุ่ม แตกส่วนขยาย Primary Pill) */}
                      <div className="flex items-center gap-2.5">
                        {/* ปุ่ม "สกัดสปาร์ค" (Primary Pill ขอบและเส้นสีแดงคาร์ไมน์) */}
                        <button
                          type="button"
                          onClick={() => {
                            if (welcomeDraftLore.trim()) {
                              const created = handleCreateWorldFromWelcome(welcomeDraftLore)
                              if (created) {
                                handleExtractSpark('extract', created.rawLore, created.id)
                              }
                            }
                          }}
                          disabled={isExtractingSpark || !welcomeDraftLore.trim()}
                          className="h-[36px] sm:h-[38px] px-4 sm:px-4.5 rounded-full bg-[#EF264C]/10 hover:bg-[#EF264C]/20 border border-[#EF264C]/50 hover:border-[#EF264C] text-[#EF264C] flex items-center gap-2 text-[13px] sm:text-[13.5px] font-medium transition-all cursor-pointer shrink-0 shadow-[0_0_18px_rgba(239,38,76,0.25),inset_0_1px_0_rgba(255,255,255,0.14)] active:scale-95 group select-none disabled:opacity-40 disabled:cursor-not-allowed"
                          title="สกัดชนวนเหตุจุดเริ่มต้นที่ไม่อาจถอยกลับได้ (The Inciting Spark)"
                        >
                          <Sparkles size={15} strokeWidth={2.2} className={isExtractingSpark ? 'animate-spin text-[#EF264C]' : 'text-[#EF264C] group-hover:scale-110 transition-transform'} />
                          <span>{isExtractingSpark ? 'กำลังสกัดสปาร์ค...' : 'สกัดสปาร์ค'}</span>
                        </button>

                        {/* ปุ่ม "แตกส่วนขยาย" (Primary Pill สีแดงคาร์ไมน์) */}
                        <button
                          type="button"
                          onClick={() => {
                            if (welcomeDraftLore.trim()) {
                              const created = handleCreateWorldFromWelcome(welcomeDraftLore)
                              if (created) {
                                handleGenerateWorldGenesis(created.rawLore, 'initial', created.id)
                              }
                            } else {
                              welcomeTextareaRef.current?.focus()
                            }
                          }}
                          disabled={isSprouting}
                          className="h-[36px] sm:h-[38px] px-4 sm:px-4.5 rounded-full bg-[#EF264C] hover:bg-[#ff2d55] text-white flex items-center gap-2 text-[13px] sm:text-[13.5px] font-medium transition-all cursor-pointer shrink-0 active:scale-95 border border-white/20 shadow-[0_0_26px_rgba(239,38,76,0.58),inset_0_1px_0_rgba(255,255,255,0.30)] disabled:opacity-40 select-none"
                          style={{
                            animation: isInitialBounce
                              ? 'konosubaExclamationIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.54s backwards'
                              : undefined
                          }}
                          title="แตกส่วนขยาย"
                        >
                          <ArrowUp size={15} strokeWidth={2.4} className={isSprouting ? 'animate-spin' : ''} />
                          <span>{isSprouting ? 'กำลังแตก...' : 'แตกส่วนขยาย'}</span>
                        </button>
                      </div>
                    </div>

                    {/* In-flow Suggestions (Expands the card naturally, pushing bottom pills downwards) */}
                    {isWelcomeDropdownOpen && !welcomeDraftLore.trim() && (
                      <div className="pt-3.5 mt-3 border-t border-white/[0.08] space-y-0.5 animate-in fade-in duration-200">
                        {WELCOME_STORY_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault()
                              handleSelectWelcomePreset(preset.fullText)
                            }}
                            className="w-full text-left py-2 px-3 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer flex items-start gap-2.5 group active:scale-[0.99]"
                          >
                            <Search size={14} className="text-white/40 shrink-0 mt-0.5 group-hover:text-white/70 transition-colors" />
                            <p className="text-[12.5px] sm:text-[13px] text-[#F1F1F1] group-hover:text-white line-clamp-2 leading-relaxed font-sans">
                              {preset.fullText}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}

                  </div>

                  {/* แถบปุ่มแคปซูลกระจกคู่ด้านล่าง: ขนาดเล็กลงเพื่อให้ดูถ่อมตน เป็นทางเลือกรอง (Secondary Subordinate Pills) */}
                  {(!showSparkCard || !showExpansionsCard) && (
                    <div className="flex items-center justify-center gap-2.5 pt-4 sm:pt-5 relative z-10 animate-in fade-in duration-300">
                      {/* 1. ปุ่ม "เพิ่มสปาร์คเอง" (แบบเดิมหน้าต้อนรับ) */}
                      {!showSparkCard && (
                        <button
                          type="button"
                          onClick={() => {
                            if (welcomeDraftLore.trim()) {
                              handleCreateWorldFromWelcome(welcomeDraftLore)
                            }
                            handleManualAddSpark()
                          }}
                          className="h-[29px] sm:h-[31px] px-3.5 sm:px-4 rounded-full backdrop-blur-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-white/[0.18] text-white/60 hover:text-white/95 text-[11.5px] sm:text-[12px] font-normal flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.25)] transition-all cursor-pointer active:scale-95 group select-none"
                          title="เพิ่มหรือเขียน The Inciting Spark ด้วยตนเอง"
                        >
                          <Plus size={12} className="text-white/40 group-hover:text-white/80 transition-colors" strokeWidth={2.2} />
                          <span>เพิ่มสปาร์คเอง</span>
                        </button>
                      )}

                      {/* 2. ปุ่ม "เพิ่มส่วนขยายเอง" */}
                      {!showExpansionsCard && (
                        <button
                          type="button"
                          onClick={() => {
                            if (welcomeDraftLore.trim()) {
                              handleCreateWorldFromWelcome(welcomeDraftLore)
                            }
                            handleAddNewNote(true)
                            setActiveView({ type: 'master' })
                          }}
                          className="h-[29px] sm:h-[31px] px-3.5 sm:px-4 rounded-full backdrop-blur-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-white/[0.18] text-white/60 hover:text-white/95 text-[11.5px] sm:text-[12px] font-normal flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.25)] transition-all cursor-pointer active:scale-95 group select-none"
                          title="เพิ่มบันทึกส่วนขยายด้วยตนเอง"
                        >
                          <Plus size={12} className="text-white/40 group-hover:text-white/80 transition-colors" strokeWidth={2.2} />
                          <span>เพิ่มส่วนขยายเอง</span>
                        </button>
                      )}
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* VIEW A: MASTER UNIBODY CANVAS & CARMINE CIRCUIT FLOW */}
            {activeView.type === 'master' && (
              <div className="space-y-0 animate-in fade-in duration-200">
                
                {/* 1. Master Story Card (Smoked Glass Sanctuary with Subtle Exit Light) */}
                <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 backdrop-blur-xl bg-[#141416]/80 hover:bg-[#141416]/85 border border-white/[0.12] hover:border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_20px_50px_rgba(0,0,0,0.65)] space-y-4 transition-all relative overflow-hidden">
                  
                  {/* Subtle Internal Carmine Light Dispersion near Exit Point */}
                  <div
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{
                      background: 'radial-gradient(ellipse 90px 65px at 32px 100%, rgba(239, 38, 76, 0.08) 0%, rgba(239, 38, 76, 0.015) 45%, transparent 75%)',
                    }}
                  />

                  {/* Subtle Carmine Exit Edge Glow */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 rounded-[inherit]" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="card1ExitGlow" x1="0%" y1="100%" x2="25%" y2="85%">
                        <stop offset="0%" stopColor="#EF264C" stopOpacity="0.45" />
                        <stop offset="35%" stopColor="#EF264C" stopOpacity="0.15" />
                        <stop offset="70%" stopColor="#EF264C" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <rect
                      x="1"
                      y="1"
                      width="calc(100% - 2px)"
                      height="calc(100% - 2px)"
                      rx="24"
                      fill="none"
                      stroke="url(#card1ExitGlow)"
                      strokeWidth="1.2"
                    />
                  </svg>

                  {/* World Title (Directly Editable, Clean Borderless) */}
                  <input
                    type="text"
                    value={activeWorld.title}
                    onChange={(e) => {
                      const newTitle = e.target.value
                      updateActiveWorld(prev => ({ ...prev, title: newTitle }))
                    }}
                    placeholder="ชื่อโลก..."
                    className="relative z-10 w-full text-[24px] sm:text-[28px] font-semibold text-[#F1F1F1] bg-transparent focus:outline-none placeholder-white/20 border-none p-0 tracking-tight"
                  />

                  {/* Story Textarea (Auto-stretches to Unlimited Length) */}
                  <textarea
                    ref={(el) => {
                      textareaRef.current = el
                      if (el) {
                        el.style.height = 'auto'
                        el.style.height = `${el.scrollHeight}px`
                      }
                    }}
                    rows={4}
                    value={activeWorld.rawLore}
                    onInput={(e) => {
                      e.currentTarget.style.height = 'auto'
                      e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
                    }}
                    onChange={(e) => {
                      const val = e.target.value
                      updateActiveWorld(prev => ({ ...prev, rawLore: val }))
                      onMacroWorldLoreChange(val)
                    }}
                    placeholder="เล่าเรื่องราวในหัวของคุณออกมาได้เลย..."
                    className="relative z-10 w-full bg-transparent text-[15px] sm:text-[16px] text-[#F1F1F1] placeholder-white/20 focus:outline-none font-sans min-h-[110px] resize-none leading-relaxed border-none p-0 overflow-hidden"
                  />

                  {/* Bottom Toolbar: Identical to Welcome Screen (Plus & Primary Pills for Spark and Expansion) */}
                  <div className="relative z-10 flex items-center justify-between pt-3">
                    {/* Left: Plus Button */}
                    <button
                      type="button"
                      className="w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-95"
                      title="เพิ่มวัตถุดิบ"
                    >
                      <Plus size={17} strokeWidth={2.2} />
                    </button>

                    {/* Right: Actions (ปุ่ม สกัดสปาร์ค & ปุ่ม แตกส่วนขยาย Primary Pill) */}
                    <div className="flex items-center gap-2.5">
                      {/* ปุ่ม "สกัดสปาร์ค" (Primary Pill ขอบและเส้นสีแดงคาร์ไมน์) */}
                      <button
                        type="button"
                        onClick={handleExtractSparkOnly}
                        disabled={isExtractingSpark || !activeWorld.rawLore.trim()}
                        className="h-[36px] sm:h-[38px] px-4 sm:px-4.5 rounded-full bg-[#EF264C]/10 hover:bg-[#EF264C]/20 border border-[#EF264C]/50 hover:border-[#EF264C] text-[#EF264C] flex items-center gap-2 text-[13px] sm:text-[13.5px] font-medium transition-all cursor-pointer shrink-0 shadow-[0_0_18px_rgba(239,38,76,0.25),inset_0_1px_0_rgba(255,255,255,0.14)] active:scale-95 group select-none disabled:opacity-40 disabled:cursor-not-allowed"
                        title="สกัดชนวนเหตุจุดเริ่มต้นที่ไม่อาจถอยกลับได้ (The Inciting Spark)"
                      >
                        <Sparkles size={15} strokeWidth={2.2} className={isExtractingSpark ? 'animate-spin text-[#EF264C]' : 'text-[#EF264C] group-hover:scale-110 transition-transform'} />
                        <span>{isExtractingSpark ? 'กำลังสกัดสปาร์ค...' : 'สกัดสปาร์ค'}</span>
                      </button>

                      {/* ปุ่ม "แตกส่วนขยาย" (Primary Pill สีแดงคาร์ไมน์) */}
                      <button
                        type="button"
                        onClick={() => handleGenerateWorldGenesis()}
                        disabled={isSprouting || !activeWorld.rawLore.trim()}
                        className="h-[36px] sm:h-[38px] px-4 sm:px-4.5 rounded-full bg-[#EF264C] hover:bg-[#ff2d55] text-white flex items-center gap-2 text-[13px] sm:text-[13.5px] font-medium transition-all cursor-pointer shrink-0 active:scale-95 border border-white/20 shadow-[0_0_26px_rgba(239,38,76,0.58),inset_0_1px_0_rgba(255,255,255,0.30)] disabled:opacity-40 disabled:cursor-not-allowed select-none"
                        title="แตกส่วนขยาย"
                      >
                        <ArrowUp size={15} strokeWidth={2.4} className={isSprouting ? 'animate-spin' : ''} />
                        <span>{isSprouting ? 'กำลังแตก...' : 'แตกส่วนขยาย'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Origin Pin Node on Master Card Bottom Edge (Concentric Ring) */}
                  {(showSparkCard || showExpansionsCard) && (
                    <div className="absolute left-[26px] sm:left-[30px] -bottom-[6px] w-3 h-3 rounded-full bg-[#161618] border border-[#EF264C]/80 flex items-center justify-center z-20 shadow-[0_0_8px_rgba(239,38,76,0.35)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#EF264C]" />
                    </div>
                  )}
                </div>

                {/* Extra World Lore Cards (Stackable Unlimited World Lore Blocks) & Add Card Button */}
                <div className="relative pt-3 space-y-3">
                  {/* Continuous Vertical Circuit Trunk passing through Extra Lore Cards into Spark/Expansions */}
                  {(showSparkCard || showExpansionsCard) && (
                    <div
                      className="absolute left-[31.5px] sm:left-[35.5px] top-0 -bottom-5 w-[1.5px] bg-[#EF264C]/75 pointer-events-none z-0"
                      style={{
                        filter: 'drop-shadow(0 0 3px rgba(239, 38, 76, 0.35))',
                      }}
                    />
                  )}

                  {(activeWorld.extraLoreBlocks || []).map((block, idx) => {
                    const isBlockSprouting = sproutingBlockId === block.id
                    const blockTitle = block.title !== undefined ? block.title : `เนื้อหาโลกเพิ่มเติม #${idx + 2}`
                    return (
                      <div
                        key={block.id}
                        className="relative z-10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl bg-[#141416]/80 hover:bg-[#141416]/85 border border-white/[0.12] hover:border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_20px_45px_rgba(0,0,0,0.6)] space-y-4 transition-all animate-in fade-in duration-200 group overflow-hidden"
                      >
                        {/* World Title & Hover-Revealed Discreet Delete Button on Top Right */}
                        <div className="relative z-10 flex items-start justify-between gap-3">
                          <input
                            type="text"
                            value={blockTitle}
                            onChange={(e) => handleUpdateExtraLoreBlock(block.id, { title: e.target.value })}
                            placeholder={`เนื้อหาโลกเพิ่มเติม #${idx + 2}`}
                            className="w-full text-[17px] sm:text-[18px] font-medium text-[#F1F1F1] bg-transparent focus:outline-none placeholder-white/20 border-none p-0 tracking-tight"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteExtraLoreBlock(block.id)}
                            className="opacity-0 group-hover:opacity-100 text-white/25 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/[0.04] transition-all cursor-pointer shrink-0"
                            title="ลบการ์ดเนื้อหาโลกใบนี้"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Story Textarea (Auto-stretches to Unlimited Length) */}
                        <textarea
                          ref={(el) => {
                            if (el) {
                              el.style.height = 'auto'
                              el.style.height = `${el.scrollHeight}px`
                            }
                          }}
                          rows={4}
                          value={block.content}
                          onInput={(e) => {
                            e.currentTarget.style.height = 'auto'
                            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
                          }}
                          onChange={(e) => handleUpdateExtraLoreBlock(block.id, { content: e.target.value })}
                          placeholder="เล่าเรื่องราวในหัวของคุณออกมาได้เลย..."
                          className="relative z-10 w-full bg-transparent text-[15px] sm:text-[16px] text-[#F1F1F1] placeholder-white/20 focus:outline-none font-sans min-h-[110px] resize-none leading-relaxed border-none p-0 overflow-hidden"
                        />

                        {/* Bottom Toolbar: Plus button on Left (ready for image attachments) & Contextual Sprout Button on Right */}
                        <div className="relative z-10 flex items-center justify-between pt-3">
                          <button
                            type="button"
                            className="w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-95"
                            title="เพิ่มวัตถุดิบลงการ์ดนี้"
                          >
                            <Plus size={17} strokeWidth={2.2} />
                          </button>

                          <div className={`transition-all duration-200 ${
                            isBlockSprouting
                              ? 'opacity-100 pointer-events-auto'
                              : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto focus-within:pointer-events-auto'
                          }`}>
                            <button
                              type="button"
                              onClick={() => handleSproutFromLoreBlock(block)}
                              disabled={isBlockSprouting || isSprouting || !block.content.trim()}
                              className="h-[32px] sm:h-[34px] px-3.5 sm:px-4 rounded-full bg-[#EF264C] hover:bg-[#ff2d55] text-white flex items-center gap-1.5 text-[12px] sm:text-[12.5px] font-medium transition-all cursor-pointer shrink-0 active:scale-95 border border-white/20 shadow-[0_0_20px_rgba(239,38,76,0.48),inset_0_1px_0_rgba(255,255,255,0.25)] disabled:opacity-40 disabled:cursor-not-allowed select-none"
                              title="แตกส่วนขยายเฉพาะการ์ดนี้"
                            >
                              <ArrowUp size={14} strokeWidth={2.4} className={isBlockSprouting ? 'animate-spin' : ''} />
                              <span>{isBlockSprouting ? 'กำลังแตก...' : 'แตกส่วนขยายการ์ดนี้'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Add Extra World Lore Card Button */}
                  <div className="relative z-10 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleAddExtraLoreBlock}
                      className="h-[30px] sm:h-[32px] px-3.5 sm:px-4 rounded-full backdrop-blur-md bg-white/[0.03] hover:bg-white/[0.07] border border-dashed border-white/[0.14] hover:border-[#EF264C]/50 text-white/55 hover:text-white text-[12px] font-normal flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 group select-none"
                      title="เพิ่มการ์ดเนื้อหาโลกใบใหม่ต่อท้าย"
                    >
                      <Plus size={13} className="text-white/40 group-hover:text-[#EF264C] transition-colors" strokeWidth={2.2} />
                      <span>เพิ่มการ์ดเนื้อหาโลก</span>
                    </button>
                  </div>
                </div>

                {/* Underneath Card 1: Both action pills when neither Spark nor Expansions exist yet */}
                {!showSparkCard && !showExpansionsCard && (
                  <div className="flex items-center justify-center gap-2.5 pt-4 sm:pt-5 relative z-10 animate-in fade-in duration-300">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSparkDraftOpen(true)
                        if (!activeWorld.sparkText) {
                          updateActiveWorld(prev => ({ ...prev, sparkText: '' }))
                        }
                      }}
                      className="h-[29px] sm:h-[31px] px-3.5 sm:px-4 rounded-full backdrop-blur-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-[#EF264C]/50 text-[11.5px] sm:text-[12px] font-normal flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.25)] transition-all cursor-pointer active:scale-95 group select-none"
                      title="ยังไม่มีสปาร์ค · กดเพื่อเพิ่มสปาร์คด้วยตนเอง"
                    >
                      <Plus size={12} className="text-[#EF264C] group-hover:scale-125 transition-transform" strokeWidth={2.2} />
                      <span className="text-[#EF264C]">ยังไม่มีสปาร์ค</span>
                      <span className="text-white/60 group-hover:text-white/90">กดเพิ่ม</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddNewNote(true)}
                      className="h-[29px] sm:h-[31px] px-3.5 sm:px-4 rounded-full backdrop-blur-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-white/[0.18] text-white/60 hover:text-white/95 text-[11.5px] sm:text-[12px] font-normal flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.25)] transition-all cursor-pointer active:scale-95 group select-none"
                      title="เพิ่มบันทึกส่วนขยายด้วยตนเอง"
                    >
                      <Plus size={12} className="text-white/40 group-hover:text-white/80 transition-colors" strokeWidth={2.2} />
                      <span>เพิ่มส่วนขยายเอง</span>
                    </button>
                  </div>
                )}

                {/* Stepped Circuit Container with Indented Sub-Cards (Step 2 & Step 3 Offset to Inside) */}
                {(showSparkCard || showExpansionsCard) && (
                  <div className="relative pl-12 sm:pl-20 space-y-6 pt-5">
                    
                    {/* 2. Spark Card (The Inciting Spark - จุดเริ่มต้นที่ไม่อาจถอยกลับได้) */}
                    {showSparkCard && (
                      <div className="relative animate-in fade-in duration-200">
                        {/* Smooth Curved Wire branching from Vertical Line into Card 2 */}
                        <div
                          className="absolute -left-4 sm:-left-[44px] -top-5 w-4 sm:w-[44px] h-[48px] border-l-[1.5px] border-b-[1.5px] border-[#EF264C]/75 rounded-bl-[16px] sm:rounded-bl-[20px] pointer-events-none"
                          style={{
                            boxShadow: 'inset 0 -1px 3px rgba(239, 38, 76, 0.2)',
                            filter: 'drop-shadow(0 0 3px rgba(239, 38, 76, 0.35))',
                          }}
                        />

                        {/* Continuous vertical trunk segment continuing down alongside Card 2 to Card 3 (Only if Expansions exist) */}
                        {showExpansionsCard && (
                          <div
                            className="absolute -left-4 sm:-left-[44px] top-[28px] -bottom-6 w-[1.5px] bg-[#EF264C]/75 pointer-events-none"
                            style={{
                              filter: 'drop-shadow(0 0 3px rgba(239, 38, 76, 0.35))',
                            }}
                          />
                        )}

                        {/* Entry Pin Node on Card 2 Left Edge (Concentric Ring) */}
                        <div className="absolute -left-[6px] top-[22px] w-3 h-3 rounded-full bg-[#161618] border border-[#EF264C]/80 flex items-center justify-center z-20 shadow-[0_0_8px_rgba(239,38,76,0.35)]">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#EF264C]" />
                        </div>

                        <div className="rounded-2xl p-5 sm:p-6 backdrop-blur-xl bg-[#141416]/80 hover:bg-[#141416]/85 border border-white/[0.12] hover:border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_16px_40px_rgba(0,0,0,0.55)] space-y-3 transition-all relative overflow-hidden">
                          
                          {/* Subtle Internal Carmine Light Dispersion near Entry Point */}
                          <div
                            className="absolute inset-0 pointer-events-none z-0"
                            style={{
                              background: 'radial-gradient(ellipse 65% 65% at 0% 28px, rgba(239, 38, 76, 0.08) 0%, rgba(239, 38, 76, 0.015) 45%, transparent 75%)',
                            }}
                          />

                          {/* Subtle Carmine Contact Edge Fade (Fades softly along left and top border) */}
                          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 rounded-[inherit]" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="card2ContactGlow" x1="0%" y1="20%" x2="40%" y2="70%">
                                <stop offset="0%" stopColor="#EF264C" stopOpacity="0.45" />
                                <stop offset="25%" stopColor="#EF264C" stopOpacity="0.18" />
                                <stop offset="60%" stopColor="#EF264C" stopOpacity="0.04" />
                                <stop offset="100%" stopColor="#EF264C" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            <rect
                              x="1"
                              y="1"
                              width="calc(100% - 2px)"
                              height="calc(100% - 2px)"
                              rx="16"
                              fill="none"
                              stroke="url(#card2ContactGlow)"
                              strokeWidth="1.2"
                            />
                          </svg>

                          <div className="relative z-10 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[14px] font-semibold text-[#EF264C] tracking-tight">
                                The Spark
                              </span>
                              <span className="text-[12.5px] font-normal text-white/50">
                                (จุดเริ่มต้นที่ทำให้ทุกอย่างหมุน · In Medias Res)
                              </span>
                            </div>

                            {/* Smart Spark Action Button (สกัดสปาร์ค / เรียบเรียงสปาร์ค / สกัดสปาร์คใหม่) + Clear */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  handleExtractSpark(
                                    !activeWorld.sparkText.trim()
                                      ? 'extract'
                                      : isSparkPlayerEdited
                                      ? 'polish'
                                      : 'regenerate'
                                  )
                                }
                                disabled={isExtractingSpark || (!combinedWorldLore && !activeWorld.sparkText.trim())}
                                className="h-6.5 px-2.5 rounded-full text-[11px] font-medium bg-[#EF264C]/15 hover:bg-[#EF264C]/25 border border-[#EF264C]/45 text-[#EF264C] flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed select-none"
                                title={
                                  !activeWorld.sparkText.trim()
                                    ? 'ให้ AI สกัดและกึ่งปั้นตัวละครมาชนกับคุณจากเนื้อหาโลกหลัก'
                                    : isSparkPlayerEdited
                                    ? 'นำชนวนเหตุที่คุณพิมพ์มาจัดระเบียบและเรียบเรียงให้เข้ากับโลกหลัก'
                                    : 'สุ่มตัวละครและจุดเริ่มต้นส่วนตัวมุมใหม่จากโลกใบนี้'
                                }
                              >
                                {!activeWorld.sparkText.trim() || isSparkPlayerEdited ? (
                                  <Sparkles size={11} className={isExtractingSpark ? 'animate-spin text-[#EF264C]' : ''} />
                                ) : (
                                  <RefreshCw size={11} className={isExtractingSpark ? 'animate-spin text-[#EF264C]' : ''} />
                                )}
                                <span>
                                  {isExtractingSpark
                                    ? isSparkPlayerEdited && activeWorld.sparkText.trim()
                                      ? 'กำลังเรียบเรียง...'
                                      : activeWorld.sparkText.trim()
                                      ? 'กำลังสุ่มมุมใหม่...'
                                      : 'กำลังสกัด...'
                                    : !activeWorld.sparkText.trim()
                                    ? 'สกัดสปาร์ค'
                                    : isSparkPlayerEdited
                                    ? 'เรียบเรียงสปาร์ค'
                                    : 'สกัดสปาร์คใหม่'}
                                </span>
                              </button>

                              {isSparkPlayerEdited && activeWorld.sparkText.trim() && combinedWorldLore && (
                                <button
                                  type="button"
                                  onClick={() => handleExtractSpark('regenerate')}
                                  disabled={isExtractingSpark}
                                  className="w-6.5 h-6.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.10] hover:border-[#EF264C]/45 text-white/50 hover:text-[#EF264C] flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                                  title="สุ่มตัวละครและสปาร์คมุมใหม่จากโลกหลัก (ล้างข้อความที่พิมพ์)"
                                >
                                  <RefreshCw size={11} />
                                </button>
                              )}

                              {(activeWorld.sparkText || isSparkDraftOpen) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateActiveWorld(prev => ({ ...prev, sparkText: '' }))
                                    onSparkChange('')
                                    setIsSparkDraftOpen(false)
                                    setIsSparkPlayerEdited(false)
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-white/25 hover:text-rose-400 p-1 rounded-md hover:bg-white/[0.04] transition-all cursor-pointer shrink-0"
                                  title="ลบสปาร์คนี้"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Spark Textarea (Auto-stretches to Unlimited Length) */}
                          <textarea
                            ref={(el) => {
                              if (el) {
                                el.style.height = 'auto'
                                el.style.height = `${el.scrollHeight}px`
                              }
                            }}
                            rows={2}
                            value={activeWorld.sparkText}
                            onInput={(e) => {
                              e.currentTarget.style.height = 'auto'
                              e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
                            }}
                            onChange={(e) => {
                              const val = e.target.value
                              updateActiveWorld(prev => ({ ...prev, sparkText: val }))
                              onSparkChange(val)
                              setIsSparkPlayerEdited(true)
                            }}
                            placeholder="เขียนจุดเริ่มต้นที่ทำให้ทุกอย่างหมุน หรือกด 'สกัดสปาร์ค' เพื่อสร้างฉากชนกัน (In Medias Res)..."
                            className="relative z-10 w-full bg-transparent text-[14px] sm:text-[14.5px] text-[#F1F1F1] focus:outline-none resize-none leading-relaxed font-sans placeholder-white/20 border-none p-0 min-h-[50px] overflow-hidden"
                            autoFocus={isSparkDraftOpen && !activeWorld.sparkText}
                          />
                        </div>

                        {/* Underneath Card 2 (Spark): Follower button to add expansions when they do not exist yet */}
                        {!showExpansionsCard && (
                          <div className="flex items-center justify-start pt-3 pl-1 relative z-10 animate-in fade-in duration-300">
                            <button
                              type="button"
                              onClick={() => handleAddNewNote(true)}
                              className="h-[29px] sm:h-[31px] px-3.5 sm:px-4 rounded-full backdrop-blur-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-white/[0.18] text-white/60 hover:text-white/95 text-[11.5px] sm:text-[12px] font-normal flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.25)] transition-all cursor-pointer active:scale-95 group select-none"
                              title="เพิ่มบันทึกส่วนขยายด้วยตนเอง"
                            >
                              <Plus size={12} className="text-white/40 group-hover:text-white/80 transition-colors" strokeWidth={2.2} />
                              <span>เพิ่มส่วนขยายเอง</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. Expansions Container Card (Indented Step 3 with Subtle Carmine Contact Fade & Smooth Curve) */}
                    {showExpansionsCard && (
                      <div className="relative animate-in fade-in duration-200">
                        {/* Smooth Curved Wire branching from Vertical Trunk into Card 3 */}
                        <div
                          className="absolute -left-4 sm:-left-[44px] -top-6 w-4 sm:w-[44px] h-[52px] border-l-[1.5px] border-b-[1.5px] border-[#EF264C]/75 rounded-bl-[16px] sm:rounded-bl-[20px] pointer-events-none"
                          style={{
                            boxShadow: 'inset 0 -1px 3px rgba(239, 38, 76, 0.2)',
                            filter: 'drop-shadow(0 0 3px rgba(239, 38, 76, 0.35))',
                          }}
                        />

                        {/* Entry Pin Node on Card 3 Left Edge (Concentric Ring) */}
                        <div className="absolute -left-[6px] top-[22px] w-3 h-3 rounded-full bg-[#161618] border border-[#EF264C]/80 flex items-center justify-center z-20 shadow-[0_0_8px_rgba(239,38,76,0.35)]">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#EF264C]" />
                        </div>

                        <div className="rounded-2xl p-5 sm:p-6 backdrop-blur-xl bg-[#141416]/80 hover:bg-[#141416]/85 border border-white/[0.12] hover:border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_16px_40px_rgba(0,0,0,0.55)] space-y-4 transition-all relative overflow-hidden">
                          
                          {/* Subtle Internal Carmine Light Dispersion near Entry Point */}
                          <div
                            className="absolute inset-0 pointer-events-none z-0"
                            style={{
                              background: 'radial-gradient(ellipse 65% 65% at 0% 28px, rgba(239, 38, 76, 0.08) 0%, rgba(239, 38, 76, 0.015) 45%, transparent 75%)',
                            }}
                          />

                          {/* Subtle Carmine Contact Edge Fade (Fades softly along left and top border) */}
                          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 rounded-[inherit]" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="card3ContactGlow" x1="0%" y1="20%" x2="40%" y2="70%">
                                <stop offset="0%" stopColor="#EF264C" stopOpacity="0.45" />
                                <stop offset="25%" stopColor="#EF264C" stopOpacity="0.18" />
                                <stop offset="60%" stopColor="#EF264C" stopOpacity="0.04" />
                                <stop offset="100%" stopColor="#EF264C" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            <rect
                              x="1"
                              y="1"
                              width="calc(100% - 2px)"
                              height="calc(100% - 2px)"
                              rx="16"
                              fill="none"
                              stroke="url(#card3ContactGlow)"
                              strokeWidth="1.2"
                            />
                          </svg>

                          <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] font-medium text-white/90">
                                ส่วนขยาย
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10.5px] font-mono bg-white/[0.06] text-white/50">
                                {activeWorld.notes.length}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleGenerateWorldGenesis(undefined, 'more')}
                              disabled={isSprouting || !combinedWorldLore}
                              className="h-[26px] sm:h-[28px] px-2.5 sm:px-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-[#EF264C]/50 text-white/70 hover:text-white text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed select-none group"
                              title="สกัดหัวข้อที่เหลือจากโลกหลักเพิ่มเติม (ทีละ 4-5 หัวข้อ)"
                            >
                              <Sparkles size={11} className={isSprouting ? 'animate-spin text-[#EF264C]' : 'text-white/40 group-hover:text-[#EF264C] transition-colors'} />
                              <span>{isSprouting ? 'กำลังสกัดเพิ่ม...' : 'สกัดเพิ่ม'}</span>
                            </button>
                          </div>

                          {/* Grid with Inline Editing of Note Titles + เจนเนื้อหา + Link Arrow on right */}
                          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            {activeWorld.notes.map((note) => {
                              const isGeneratingThisNote = generatingNoteId === note.id
                              const isNoteEmpty = !note.content.trim()
                              const isNoteEdited = Boolean(note.isPlayerEdited && !isNoteEmpty)
                              return (
                                <div
                                  key={note.id}
                                  className="px-3.5 py-2.5 rounded-xl backdrop-blur-md bg-white/[0.04] hover:bg-white/[0.07] focus-within:bg-white/[0.08] border border-white/[0.09] hover:border-white/[0.18] focus-within:border-[#EF264C]/50 text-[#F1F1F1] text-[13px] flex items-center justify-between transition-all group shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] gap-2"
                                >
                                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full shrink-0 group-hover:scale-125 transition-transform ${
                                        note.isSavedToCabinet ? 'bg-emerald-400' : 'bg-[#EF264C]'
                                      }`}
                                      title={note.isSavedToCabinet ? 'เก็บเข้าตู้ลิ้นชักแล้ว' : undefined}
                                    />
                                    <input
                                      type="text"
                                      value={note.title}
                                      onChange={(e) => {
                                        const newTitle = e.target.value
                                        handleUpdateNote(note.id, { title: newTitle })
                                      }}
                                      placeholder="ตั้งชื่อส่วนขยาย..."
                                      className="bg-transparent text-white/90 placeholder-white/25 focus:text-white focus:outline-none border-none p-0 w-full text-[13px] font-medium"
                                    />
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleGenerateNoteContentFromTitle(note)}
                                      disabled={(!note.title.trim() && !isNoteEdited) || generatingNoteId !== null || (!combinedWorldLore && !isNoteEdited)}
                                      className={`h-6 px-2 rounded-full text-[10.5px] font-medium flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed select-none ${
                                        isNoteEmpty || isNoteEdited || isGeneratingThisNote
                                          ? 'bg-[#EF264C]/15 hover:bg-[#EF264C]/25 border border-[#EF264C]/45 text-[#EF264C]'
                                          : 'opacity-0 group-hover:opacity-100 bg-white/[0.05] hover:bg-[#EF264C]/20 border border-white/[0.10] hover:border-[#EF264C]/45 text-white/60 hover:text-[#EF264C]'
                                      }`}
                                      title={
                                        isNoteEmpty
                                          ? 'ให้ AI เจนเนื้อหาส่วนขยายตามหัวข้อนี้จากเนื้อหาโลกหลัก'
                                          : isNoteEdited
                                            ? 'นำเนื้อหาที่คุณพิมพ์ในการ์ดนี้ไปจัดระเบียบและแต่งต่อให้เข้ากับโลกหลัก'
                                            : 'เจนเนื้อหาใหม่จากหัวข้อเดิม'
                                      }
                                    >
                                      {isNoteEmpty || isNoteEdited ? (
                                        <Sparkles size={10} className={isGeneratingThisNote ? 'animate-spin text-[#EF264C]' : ''} />
                                      ) : (
                                        <RefreshCw size={10} className={isGeneratingThisNote ? 'animate-spin text-[#EF264C]' : ''} />
                                      )}
                                      <span>
                                        {isGeneratingThisNote
                                          ? 'กำลังเจน...'
                                          : isNoteEmpty
                                            ? 'เจนเนื้อหา'
                                            : isNoteEdited
                                              ? 'เรียบเรียงเนื้อหา'
                                              : 'เจนเนื้อหาใหม่'}
                                      </span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setActiveView({ type: 'note', noteId: note.id })}
                                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all cursor-pointer shrink-0"
                                      title={`ไปยังหน้ารายละเอียดส่วนขยาย: ${note.title || 'ไม่มีชื่อ'}`}
                                    >
                                      <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-white/50 hover:text-white" />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Add Expansion Bottom Action Slot */}
                          <button
                            type="button"
                            onClick={() => handleAddNewNote(true)}
                            className="relative z-10 w-full py-2.5 rounded-xl border border-dashed border-white/[0.10] hover:border-[#EF264C]/50 bg-white/[0.02] hover:bg-white/[0.05] text-white/50 hover:text-white flex items-center justify-center gap-2 text-[12.5px] font-medium transition-all cursor-pointer group active:scale-[0.99] backdrop-blur-sm"
                            title="เพิ่มส่วนขยายใหม่"
                          >
                            <Plus size={14} className="text-white/40 group-hover:text-[#EF264C] transition-colors" />
                            <span>เพิ่มส่วนขยาย</span>
                          </button>
                        </div>

                        {/* Underneath Card 3 (Expansions): Follower button to add spark when spark does not exist yet */}
                        {!showSparkCard && (
                          <div className="flex items-center justify-start pt-3 pl-1 relative z-10 animate-in fade-in duration-300">
                            <button
                              type="button"
                              onClick={() => {
                                setIsSparkDraftOpen(true)
                                if (!activeWorld.sparkText) {
                                  updateActiveWorld(prev => ({ ...prev, sparkText: '' }))
                                }
                              }}
                              className="h-[29px] sm:h-[31px] px-3.5 sm:px-4 rounded-full backdrop-blur-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-[#EF264C]/50 text-[11.5px] sm:text-[12px] font-normal flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.25)] transition-all cursor-pointer active:scale-95 group select-none"
                              title="ยังไม่มีสปาร์ค · กดเพื่อเพิ่มสปาร์คด้วยตนเอง"
                            >
                              <Plus size={12} className="text-[#EF264C] group-hover:scale-125 transition-transform" strokeWidth={2.2} />
                              <span className="text-[#EF264C]">ยังไม่มีสปาร์ค</span>
                              <span className="text-white/60 group-hover:text-white/90">กดเพิ่ม</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}

              </div>
            )}

            {/* VIEW C: EXPANSION NOTE (Apple Notes / Notion Markdown Canvas) */}
            {activeView.type === 'note' && currentNote && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Note Surface: Expansive, Borderless Typography, Smoked Glass Sanctuary */}
                <div
                  className={`rounded-2xl p-6 sm:p-8 backdrop-blur-xl bg-[#141416]/80 hover:bg-[#141416]/85 border border-white/[0.12] hover:border-white/[0.18] space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_20px_45px_rgba(0,0,0,0.6)] relative group transition-all ${
                    activeTagPopoverCardId === currentNote.id ? 'overflow-visible z-30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <input
                      type="text"
                      value={currentNote.title}
                      onChange={(e) => handleUpdateNote(currentNote.id, { title: e.target.value })}
                      placeholder="ชื่อส่วนขยาย (เว้นว่างไว้ให้ AI ตั้งชื่อให้ตอนเก็บเข้าตู้ได้)..."
                      className="w-full text-[24px] sm:text-[28px] font-semibold text-[#F1F1F1] bg-transparent outline-none border-none p-0 placeholder-white/20 leading-tight"
                    />

                    <div className="flex items-center gap-2 shrink-0">
                      {(() => {
                        const hasNoteContent = Boolean(currentNote.content.trim())
                        const isNotePlayerEdited = Boolean(currentNote.isPlayerEdited && hasNoteContent)
                        const isThisNoteGenerating = generatingNoteId === currentNote.id

                        return (
                          <>
                            <button
                              type="button"
                              onClick={() => handleGenerateNoteContentFromTitle(currentNote)}
                              disabled={
                                (!currentNote.title.trim() && !isNotePlayerEdited) ||
                                generatingNoteId !== null ||
                                (!combinedWorldLore && !isNotePlayerEdited)
                              }
                              className="h-[30px] px-3 rounded-full bg-[#EF264C]/15 hover:bg-[#EF264C]/25 border border-[#EF264C]/45 text-[#EF264C] text-[12px] font-medium flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed select-none"
                              title={
                                !hasNoteContent
                                  ? 'ให้ AI เจนเนื้อหาส่วนขยายตามหัวข้อนี้จากเนื้อหาโลกหลัก'
                                  : isNotePlayerEdited
                                    ? 'นำเนื้อหาที่คุณพิมพ์ในกล่องนี้ไปจัดระเบียบ เรียบเรียงคำ และแต่งต่อให้เข้ากับโลกหลัก'
                                    : 'เจนเนื้อหามุมมองใหม่จากหัวข้อเดิม'
                              }
                            >
                              {!hasNoteContent || isNotePlayerEdited ? (
                                <Sparkles size={12} className={isThisNoteGenerating ? 'animate-spin text-[#EF264C]' : ''} />
                              ) : (
                                <RefreshCw size={12} className={isThisNoteGenerating ? 'animate-spin text-[#EF264C]' : ''} />
                              )}
                              <span>
                                {isThisNoteGenerating
                                  ? isNotePlayerEdited
                                    ? 'กำลังเรียบเรียง...'
                                  : hasNoteContent
                                      ? 'กำลังเจนใหม่...'
                                      : 'กำลังเจนเนื้อหา...'
                                  : !hasNoteContent
                                    ? 'เจนเนื้อหา'
                                    : isNotePlayerEdited
                                      ? 'เรียบเรียงเนื้อหา'
                                      : 'เจนเนื้อหาใหม่'}
                              </span>
                            </button>

                            {isNotePlayerEdited && currentNote.title.trim() && combinedWorldLore && (
                              <button
                                type="button"
                                onClick={() => handleGenerateNoteContentFromTitle(currentNote, 'regenerate')}
                                disabled={generatingNoteId !== null}
                                className="w-[30px] h-[30px] rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.10] hover:border-[#EF264C]/45 text-white/50 hover:text-[#EF264C] flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed shrink-0"
                                title="เจนเนื้อหาใหม่จากหัวข้อเดิม (ล้างข้อความที่พิมพ์)"
                              >
                                <RefreshCw size={12} />
                              </button>
                            )}
                          </>
                        )
                      })()}

                      {/* Subtle, Discreet Delete Note Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(currentNote.id)}
                        className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/[0.04] transition-all cursor-pointer shrink-0"
                        title="ลบโน้ตนี้"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Note Content Textarea (Auto-stretches to Unlimited Length) */}
                  <textarea
                    ref={(el) => {
                      noteTextareaRef.current = el
                      if (el) {
                        el.style.height = 'auto'
                        el.style.height = `${el.scrollHeight}px`
                      }
                    }}
                    rows={6}
                    value={currentNote.content}
                    onInput={(e) => {
                      e.currentTarget.style.height = 'auto'
                      e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
                    }}
                    onChange={(e) =>
                      handleUpdateNote(currentNote.id, {
                        content: e.target.value,
                        isPlayerEdited: Boolean(e.target.value.trim()),
                      })
                    }
                    placeholder="พิมพ์ขยายความรายละเอียดของส่วนขยายนี้ได้อย่างอิสระ..."
                    className="w-full text-[15px] sm:text-[16px] text-[#F1F1F1] bg-transparent focus:outline-none resize-none leading-relaxed font-sans placeholder-white/20 border-none p-0 min-h-[140px] overflow-hidden"
                  />

                  {/* Bottom Bar of Main Expansion Card: Left = #Tags, Right = Direct Save to Cabinet */}
                  <div className="pt-4 mt-2 border-t border-white/[0.08] flex items-center justify-between gap-3 flex-wrap">
                    {renderCardTags(
                      {
                        id: currentNote.id,
                        title: currentNote.title,
                        category: currentNote.category || 'lore',
                        summary: currentNote.summary,
                        content: currentNote.content,
                        tags: currentNote.tags || [],
                        isSavedToCabinet: currentNote.isSavedToCabinet,
                        sourceNoteId: currentNote.id,
                      },
                      currentNote.id
                    )}

                    <div className="flex items-center gap-2 shrink-0">
                      {savingNoteToCabinetId === currentNote.id ? (
                        <button
                          type="button"
                          disabled
                          className="h-[30px] px-3.5 rounded-full text-[11.5px] font-medium bg-[#EF264C]/15 text-[#EF264C] border border-[#EF264C]/45 flex items-center gap-1.5 opacity-80 cursor-wait select-none"
                        >
                          <Sparkles size={12} className="animate-spin text-[#EF264C]" />
                          <span>กำลังตั้งชื่อและเก็บเข้าตู้...</span>
                        </button>
                      ) : currentNote.isSavedToCabinet ? (
                        <button
                          type="button"
                          onClick={() => handleToggleNoteCabinetSaveState(currentNote)}
                          className="h-[30px] px-3.5 rounded-full text-[11.5px] font-medium bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 hover:border-emerald-500/50 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 select-none"
                          title="เก็บอยู่ในตู้ลิ้นชักแล้ว (คลิกเพื่อนำออกจากตู้ลิ้นชัก)"
                        >
                          <CheckCircle2 size={12} className="text-emerald-400" />
                          <span>ในตู้ลิ้นชัก</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleNoteCabinetSaveState(currentNote)}
                          disabled={!currentNote.content.trim() && !currentNote.title.trim()}
                          className="h-[30px] px-3.5 rounded-full text-[11.5px] font-medium bg-white/[0.06] hover:bg-[#EF264C]/20 text-white/75 hover:text-[#F1F1F1] border border-white/[0.12] hover:border-[#EF264C]/50 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group/save select-none"
                          title="ดึงการ์ดหลักใบนี้เข้าตู้ลิ้นชักโดยตรง (หากยังไม่มีชื่อหัวข้อ AI จะตั้งชื่อและติดแท็กให้อัตโนมัติ)"
                        >
                          <Archive size={12} className="text-white/50 group-hover/save:text-[#EF264C] transition-colors" />
                          <span>เก็บเข้าตู้ลิ้นชัก</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Optional Sub-Cards Section: "แยกการ์ดย่อยเพิ่มเติม" */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-white/60">
                        แยกการ์ดย่อยเพิ่มเติม
                      </span>
                      {currentNote.childCards.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10.5px] font-mono bg-white/[0.06] text-white/50">
                          {currentNote.childCards.length}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* สกัดการ์ดย่อย Button */}
                      <button
                        type="button"
                        onClick={() => handleDissectCurrentNote(currentNote)}
                        disabled={isDissectingNote || !currentNote.content.trim()}
                        className="px-3 py-1 rounded-full text-[11.5px] bg-white/[0.04] hover:bg-rose-500/20 text-white/60 hover:text-rose-200 border border-white/[0.09] hover:border-rose-500/40 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed select-none"
                        title="ให้ AI ช่วยหั่นเนื้อหาในโน้ตนี้แยกออกเป็นหลายการ์ดย่อย"
                      >
                        <Sparkles size={11} className={isDissectingNote ? 'animate-spin text-rose-300' : 'text-white/40'} />
                        <span>{isDissectingNote ? 'กำลังสกัด...' : 'สกัดการ์ดย่อย'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const newChild: LoreCard = {
                            id: `child_manual_${Date.now()}`,
                            title: 'การ์ดย่อยใหม่',
                            category: 'lore',
                            content: '',
                            tags: ['วัตถุดิบ'],
                            isSavedToCabinet: false,
                            sourceNoteId: currentNote.id,
                          }
                          handleUpdateNote(currentNote.id, {
                            childCards: [newChild, ...currentNote.childCards]
                          })
                        }}
                        className="px-3 py-1 rounded-full text-[11.5px] bg-white/[0.04] hover:bg-white/[0.10] text-white/60 hover:text-white border border-white/[0.09] transition-all cursor-pointer flex items-center gap-1 active:scale-95 select-none"
                        title="เพิ่มการ์ดย่อยใหม่ด้วยตัวเอง"
                      >
                        <Plus size={12} />
                        <span>เพิ่มการ์ดย่อย</span>
                      </button>
                    </div>
                  </div>

                  {currentNote.childCards.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                      {currentNote.childCards.map((card) => {
                        const isPopoverOpen = activeTagPopoverCardId === card.id
                        return (
                          <div
                            key={card.id}
                            className={`rounded-2xl p-5 sm:p-5.5 border border-white/[0.09] hover:border-white/[0.18] transition-all flex flex-col justify-between group backdrop-blur-md bg-[#141416]/75 hover:bg-[#141416]/85 relative h-[255px] sm:h-[265px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_35px_rgba(0,0,0,0.45)] ${
                              isPopoverOpen ? 'overflow-visible z-30' : 'overflow-hidden z-10'
                            }`}
                          >
                            {/* Top Subtle Accent Bar (Gray idle -> Carmine Red on hover) */}
                            <div className="absolute top-0 left-6 w-10 sm:w-12 h-[2px] bg-white/20 group-hover:bg-[#EF264C] rounded-b transition-colors" />

                            <div className={`space-y-3 flex-1 flex flex-col h-full ${
                              isPopoverOpen ? 'overflow-visible' : 'overflow-hidden'
                            }`}>
                              {/* Top Bar: Free-form Tags on Left, Status Pill & Delete on Right */}
                              <div className="flex items-center justify-between gap-2 shrink-0">
                                {renderCardTags(card, currentNote.id)}

                                {/* Status Action: รอเข้าตู้ / เข้าตู้ลิ้นชัก ⇄ ในตู้ลิ้นชัก */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {card.isSavedToCabinet ? (
                                    <button 
                                      type="button"
                                      onClick={() => handleToggleChildCardSaveState(currentNote.id, card)}
                                      className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 hover:border-emerald-500/50 flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                                      title="คลิกเพื่อนำออกจากตู้ลิ้นชักกลับเป็นร่าง"
                                    >
                                      <CheckCircle2 size={11} className="text-emerald-400" />
                                      <span>ในตู้ลิ้นชัก</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleChildCardSaveState(currentNote.id, card)}
                                      className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono bg-white/[0.06] hover:bg-rose-500/20 text-white/50 hover:text-rose-200 border border-white/[0.10] hover:border-rose-500/40 flex items-center gap-1 transition-all cursor-pointer active:scale-95 group/btn"
                                      title="บันทึกเข้าตู้ลิ้นชัก"
                                    >
                                      <Save size={11} className="text-white/40 group-hover/btn:text-rose-300 transition-colors" />
                                      <span className="group-hover/btn:hidden">รอเข้าตู้</span>
                                      <span className="hidden group-hover/btn:inline">เข้าตู้ลิ้นชัก</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteChildCard(currentNote.id, card.id)}
                                    className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-400 p-1 rounded-md hover:bg-white/[0.04] transition-all cursor-pointer"
                                    title="ลบการ์ดนี้"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>

                              {/* Pure Markdown Title (Seamless, Borderless) */}
                              <input
                                type="text"
                                value={card.title}
                                onChange={(e) => {
                                  const newTitle = e.target.value
                                  handleUpdateNote(currentNote.id, {
                                    childCards: currentNote.childCards.map(c => c.id === card.id ? { ...c, title: newTitle } : c)
                                  })
                                }}
                                placeholder="ชื่อการ์ด..."
                                className="w-full text-[15px] font-medium text-[#F1F1F1] bg-transparent outline-none border-none p-0 placeholder-white/20 shrink-0"
                              />

                              {/* Pure Markdown Content (Locked Scrollable Area) */}
                              <textarea
                                value={card.content}
                                onChange={(e) => {
                                  const newContent = e.target.value
                                  handleUpdateNote(currentNote.id, {
                                    childCards: currentNote.childCards.map(c => c.id === card.id ? { ...c, content: newContent } : c)
                                  })
                                }}
                                placeholder="เนื้อหาของการ์ด..."
                                className="w-full text-[13px] text-white/75 bg-transparent outline-none resize-none leading-relaxed font-sans border-none p-0 placeholder-white/20 flex-1 overflow-y-auto"
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* VIEW D: STAGE CELL (Location / Architecture Surface) */}
            {activeView.type === 'cell' && currentCell && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Location Surface: Unlimited Height Smoked Glass Sanctuary */}
                <div className="rounded-2xl p-6 sm:p-8 backdrop-blur-xl bg-[#141416]/80 hover:bg-[#141416]/85 border border-white/[0.12] hover:border-white/[0.18] space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_20px_45px_rgba(0,0,0,0.6)] relative group transition-all h-auto">
                  <input
                    type="text"
                    value={currentCell.title}
                    onChange={(e) => {
                      const newTitle = e.target.value
                      updateActiveWorld(prev => ({
                        ...prev,
                        stageCells: prev.stageCells.map(c => c.id === currentCell.id ? { ...c, title: newTitle } : c)
                      }))
                    }}
                    placeholder="ชื่อสถานที่..."
                    className="w-full text-[24px] sm:text-[28px] font-semibold text-[#F1F1F1] bg-transparent outline-none border-none p-0 placeholder-white/20 leading-tight"
                  />

                  {/* Location Description Textarea (Auto-stretches to Unlimited Length) */}
                  <textarea
                    rows={4}
                    value={currentCell.description}
                    onInput={(e) => {
                      e.currentTarget.style.height = 'auto'
                      e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
                    }}
                    onChange={(e) => {
                      const newDesc = e.target.value
                      updateActiveWorld(prev => ({
                        ...prev,
                        stageCells: prev.stageCells.map(c => c.id === currentCell.id ? { ...c, description: newDesc } : c)
                      }))
                    }}
                    placeholder="บรรยายบรรยากาศ สถาปัตยกรรม และรายละเอียดของสถานที่นี้ได้อย่างอิสระ..."
                    className="w-full text-[14.5px] sm:text-[15.5px] text-[#F1F1F1] bg-transparent focus:outline-none resize-none leading-relaxed font-sans placeholder-white/20 border-none p-0 min-h-[90px] overflow-hidden"
                  />

                  {/* Scene Attire & Fast Enter Stage Action Bar */}
                  <div className="pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-400/20 text-sky-300 flex items-center justify-center shrink-0">
                        <Shirt size={14} />
                      </div>
                      <div className="text-left">
                        <div className="text-[12px] font-medium text-white/90">
                          ชุดประจำสถานที่ (Scene Attire):
                        </div>
                        <div className="text-[10.5px] text-white/45 font-mono">
                          {currentCell.title.includes('คราม') || currentCell.description.includes('คราม') || currentCell.description.includes('ลำธาร')
                            ? 'โรงย้อมผ้าครามริมลำธาร (เชิ้ตขาว + ถอดรองเท้าสาน)'
                            : currentCell.title.includes('ฝน') || currentCell.description.includes('ฝน')
                            ? 'เสื้อ 2 ชั้นหลบฝน (คาร์ดิแกนเปียก + เสื้อในแห้ง)'
                            : 'ชุดและสรีระ 4 โซนตามธรรมชาติ'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectStageCell) {
                          onSelectStageCell(currentCell)
                        } else {
                          onEnterStage()
                        }
                      }}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white text-[12px] font-medium transition-all cursor-pointer flex items-center gap-2 active:scale-95 shadow-[0_0_20px_rgba(56,189,248,0.35)]"
                      title="ก้าวขึ้นสู่เวทีแสดงสดพร้อมพิกัดสถานที่และชุดประจำฉากนี้ทันที"
                    >
                      <Sparkles size={13} />
                      <span>ก้าวขึ้นสู่เวทีด้วยสถานที่นี้ ↵</span>
                    </button>
                  </div>
                </div>


                {/* Linked Cards Section (Active State Emerald Illumination) */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-medium text-white/80">
                        การ์ดที่ผูกกับสถานที่นี้
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10.5px] font-mono bg-white/[0.06] text-white/50">
                        {currentCell.pinnedCardIds.length}
                      </span>

                      {currentCell.pinnedCardIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleClearAllCellCards(currentCell.id)}
                          className="text-[11px] font-mono text-white/40 hover:text-red-400/80 transition-colors ml-1 cursor-pointer"
                          title="ยกเลิกการผูกการ์ดทั้งหมดในสถานที่นี้"
                        >
                          (ล้างทั้งหมด)
                        </button>
                      )}
                    </div>

                    {/* Auto-Stage / Auto-Link AI Button */}
                    <button
                      type="button"
                      onClick={() => handleAutoStageCards(currentCell)}
                      disabled={isAutoLinking || allAvailableCardsForCell.length === 0}
                      className="px-3.5 py-1 rounded-full text-[11.5px] font-mono bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 hover:text-sky-200 border border-sky-500/30 hover:border-sky-500/50 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(14,165,233,0.15)]"
                      title="วิเคราะห์บรรยากาศสถานที่และเลือกผูกการ์ดที่เกี่ยวข้องจากคลังอัตโนมัติ"
                    >
                      <Sparkles size={11} className={isAutoLinking ? 'animate-spin' : ''} />
                      <span>{isAutoLinking ? 'กำลังเลือกการ์ด...' : 'ผูกการ์ดอัตโนมัติ'}</span>
                    </button>
                  </div>

                  {allAvailableCardsForCell.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-dashed border-white/[0.06] text-center text-white/30 text-[12px]">
                      ยังไม่มีการ์ดส่วนขยายในโลกหรือตู้ลิ้นชัก (สามารถสร้างการ์ดในแท็บ "ส่วนขยาย" หรือแตกส่วนขยายก่อนได้)
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {allAvailableCardsForCell.map(card => {
                        const isLinked = currentCell.pinnedCardIds.includes(card.id)
                        return (
                          <div
                            key={card.id}
                            onClick={() => handleToggleCellCard(currentCell.id, card.id)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group select-none relative overflow-hidden ${
                              isLinked
                                ? 'bg-emerald-500/[0.05] border-emerald-500/35 shadow-[0_0_16px_rgba(16,185,129,0.08)]'
                                : 'bg-[#161618] border-white/[0.07] hover:border-white/[0.16] hover:bg-white/[0.03]'
                            }`}
                          >
                            {/* Top Subtle Accent Bar: Same style (Gray idle -> Carmine Red on hover, Emerald when linked) */}
                            <div
                              className={`absolute top-0 left-5 w-8 h-[2px] rounded-b transition-colors ${
                                isLinked
                                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                                  : 'bg-white/20 group-hover:bg-[#EF264C]'
                              }`}
                            />

                            <div className="flex flex-col gap-0.5 truncate flex-1 min-w-0 text-left">
                              <span className={`text-[13px] truncate font-normal ${
                                isLinked ? 'text-[#F1F1F1] font-medium' : 'text-white/60 group-hover:text-white'
                              }`}>
                                {card.title}
                              </span>
                              {card.tags && card.tags.length > 0 && (
                                <span className="text-[10px] text-white/35 font-mono truncate">
                                  #{card.tags.slice(0, 3).join(' #')}
                                </span>
                              )}
                            </div>

                            <div className="shrink-0">
                              {isLinked ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                  <CheckCircle2 size={10} />
                                  <span>ผูกแล้ว</span>
                                </span>
                              ) : (
                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-white/30 group-hover:text-white text-[12px] font-mono hover:bg-white/[0.08] transition-colors">
                                  +
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW E: CABINET (SAVED CARDS REPOSITORY) */}
            {activeView.type === 'cabinet' && (
              <div className="space-y-6 sm:space-y-7 animate-in fade-in duration-150">
                {/* Header Bar: Title on left, Minimalist Apple Search Capsule on right */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[18px] sm:text-[20px] font-medium text-[#F1F1F1]">
                      ตู้ลิ้นชัก
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-white/[0.06] text-white/50 border border-white/[0.06]">
                      {savedCabinetCards.length}
                    </span>
                  </div>

                  {/* Apple-style Minimal Search Capsule */}
                  <div className="relative flex items-center w-48 sm:w-64 bg-white/[0.04] hover:bg-white/[0.06] focus-within:bg-white/[0.07] border border-white/[0.08] focus-within:border-white/20 rounded-full px-3 py-1.5 transition-all">
                    <Search size={13} className="text-white/40 shrink-0 mr-2" />
                    <input
                      type="text"
                      value={cabinetSearchQuery}
                      onChange={(e) => setCabinetSearchQuery(e.target.value)}
                      placeholder="ค้นหาการ์ดที่เซฟ..."
                      className="w-full text-[12px] text-[#F1F1F1] bg-transparent focus:outline-none placeholder-white/30 font-sans"
                    />
                    {cabinetSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCabinetSearchQuery('')}
                        className="text-white/30 hover:text-white ml-1 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {filteredCabinetCards.length === 0 ? (
                  <div className="p-12 rounded-2xl border border-dashed border-white/[0.06] text-center text-white/30 text-[12.5px]">
                    {cabinetSearchQuery.trim()
                      ? `ไม่พบการ์ดที่ตรงกับ "${cabinetSearchQuery}"`
                      : 'ยังไม่มีการ์ดที่บันทึกเข้าตู้ลิ้นชัก'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                    {filteredCabinetCards.map(card => {
                      const isPopoverOpen = activeTagPopoverCardId === card.id
                      return (
                        <div
                          key={card.id}
                          className={`rounded-2xl p-5 sm:p-5.5 border border-white/[0.09] hover:border-white/[0.18] transition-all flex flex-col justify-between group backdrop-blur-md bg-[#141416]/75 hover:bg-[#141416]/85 relative h-[255px] sm:h-[265px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_35px_rgba(0,0,0,0.45)] ${
                            isPopoverOpen ? 'overflow-visible z-30' : 'overflow-hidden z-10'
                          }`}
                        >
                          {/* Top Subtle Accent Bar (Gray idle -> Carmine Red on hover) */}
                          <div className="absolute top-0 left-6 w-10 sm:w-12 h-[2px] bg-white/20 group-hover:bg-[#EF264C] rounded-b transition-colors" />

                          <div className={`space-y-3 flex-1 flex flex-col h-full ${
                            isPopoverOpen ? 'overflow-visible' : 'overflow-hidden'
                          }`}>
                            {/* Top Bar: Free-form Tags on Left, Status Pill & Delete on Right */}
                            <div className="flex items-center justify-between gap-2 shrink-0">
                              {/* Free-form Tags & Source Note Origin */}
                              {renderCardTags(
                                card,
                                card.sourceNoteId,
                                card.sourceNoteTitle ? (
                                  <span
                                    className="px-2 py-0.5 rounded-md text-[10px] font-mono text-white/30 bg-white/[0.02] border border-white/[0.05] truncate max-w-[130px]"
                                    title={`มาจากส่วนขยาย: ${card.sourceNoteTitle}`}
                                  >
                                    {card.sourceNoteTitle}
                                  </span>
                                ) : null
                              )}

                              {/* Status Action: รอเข้าตู้ / เข้าตู้ลิ้นชัก ⇄ ในตู้ลิ้นชัก */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                {card.isSavedToCabinet ? (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleChildCardSaveState(card.sourceNoteId || '', card)}
                                    className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 hover:border-emerald-500/50 flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                                    title="คลิกเพื่อเปลี่ยนกลับเป็น draft"
                                  >
                                    <CheckCircle2 size={11} className="text-emerald-400" />
                                    <span>ในตู้ลิ้นชัก</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleChildCardSaveState(card.sourceNoteId || '', card)}
                                    className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono bg-white/[0.06] hover:bg-rose-500/20 text-white/50 hover:text-rose-200 border border-white/[0.10] hover:border-rose-500/40 flex items-center gap-1 transition-all cursor-pointer active:scale-95 group/btn"
                                    title="save เข้าตู้ลิ้นชัก"
                                  >
                                    <Save size={11} className="text-white/40 group-hover/btn:text-rose-300 transition-colors" />
                                    <span className="group-hover/btn:hidden">รอเข้าตู้</span>
                                    <span className="hidden group-hover/btn:inline">เข้าตู้ลิ้นชัก</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleDeleteCardFromCabinetView(card.id, card.sourceNoteId)}
                                  className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-400 p-1 rounded-md hover:bg-white/[0.04] transition-all cursor-pointer"
                                  title="ลบการ์ดนี้"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            {/* Pure Markdown Title (Seamless, Borderless) */}
                            <input
                              type="text"
                              value={card.title}
                              onChange={(e) => handleUpdateCardEverywhere(card.id, { title: e.target.value }, card.sourceNoteId)}
                              placeholder="ชื่อการ์ด..."
                              className="w-full text-[15px] font-medium text-[#F1F1F1] bg-transparent outline-none border-none p-0 placeholder-white/20 shrink-0"
                            />

                            {/* Pure Markdown Content (Locked Scrollable Area) */}
                            <textarea
                              value={card.content}
                              onChange={(e) => handleUpdateCardEverywhere(card.id, { content: e.target.value }, card.sourceNoteId)}
                              placeholder="เขียนเนื้อหาหรือสกัดเป็นวัตถุดิบย่อย..."
                              className="w-full text-[13px] text-white/75 bg-transparent outline-none resize-none leading-relaxed font-sans placeholder-white/20 border-none p-0 flex-1 overflow-y-auto"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </main>

      </div>

      {/* ======================================================================= */}
      {/* WORLD PROMPT INSPECTOR (MODAL / OVERLAY)                               */}
      {/* ======================================================================= */}
      {isPromptInspectorOpen && (
        <div className="fixed inset-0 z-50 bg-[#090909]/98 backdrop-blur-3xl flex flex-col overflow-hidden animate-in fade-in duration-200 select-none font-sans">
          {/* Top Sticky Frosted Navigation */}
          <header className="sticky top-0 z-20 min-h-14 py-2.5 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 bg-[#090909]/80 backdrop-blur-2xl border-b border-white/[0.08]">
            {/* Left: Close Button & Title */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsPromptInspectorOpen(false)}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
                title="ปิดหน้าต่าง (Esc)"
              >
                <X size={15} />
              </button>
              <div className="flex items-center gap-2">
                <FileCode2 size={15} className="text-[#38bdf8]" />
                <span className="text-[12px] font-mono text-white/70 tracking-wider uppercase hidden sm:block">
                  WORLD PROMPT INSPECTOR
                </span>
              </div>
            </div>

            {/* Center: Main Category Segmented Control (Assembled vs Engines) */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10 select-none">
              <button
                type="button"
                onClick={() => setInspectorMainTab('assembled')}
                className={`h-7 px-3.5 rounded-full text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                  inspectorMainTab === 'assembled'
                    ? 'bg-sky-500/15 text-sky-300 font-semibold border border-sky-500/30 shadow-sm'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${inspectorMainTab === 'assembled' ? 'bg-[#38bdf8]' : 'bg-white/30'}`} />
                <span>🌐 พิมพ์เขียวโลกส่งเข้าเวที</span>
              </button>
              <button
                type="button"
                onClick={() => setInspectorMainTab('engines')}
                className={`h-7 px-3.5 rounded-full text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                  inspectorMainTab === 'engines'
                    ? 'bg-rose-500/15 text-rose-300 font-semibold border border-rose-500/30 shadow-sm'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${inspectorMainTab === 'engines' ? 'bg-rose-500' : 'bg-white/30'}`} />
                <span>⚙️ เครื่องยนต์สกัดเบื้องหลัง</span>
              </button>
            </div>

            {/* Right: Copy Prompt Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleCopyInspectorPrompt(activePromptText)}
                className="h-7 px-3 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-[11px] font-sans font-medium text-[#F1F1F1] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 select-none shadow-sm"
                title="คัดลอก Prompt ปัจจุบัน"
              >
                {copiedInspectorPrompt ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span className="text-emerald-400">คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} className="opacity-70" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </header>

          {/* Sub-Header for Engines (When in Engines Tab) */}
          {inspectorMainTab === 'engines' && (
            <div className="px-4 sm:px-6 py-2 bg-[#0C0C0E] border-b border-white/[0.06] flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <button
                type="button"
                onClick={() => setInspectorEngineTab('spark')}
                className={`h-6.5 px-3 rounded-full text-[10.5px] font-mono transition-all cursor-pointer flex items-center gap-1 active:scale-95 whitespace-nowrap ${
                  inspectorEngineTab === 'spark'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-medium'
                    : 'text-white/45 hover:text-white/75 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06]'
                }`}
              >
                <Sparkles size={10} className="text-[#EF264C]" />
                <span>1. สกัดสปาร์ค (Spark)</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectorEngineTab('sprout')}
                className={`h-6.5 px-3 rounded-full text-[10.5px] font-mono transition-all cursor-pointer flex items-center gap-1 active:scale-95 whitespace-nowrap ${
                  inspectorEngineTab === 'sprout'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                    : 'text-white/45 hover:text-white/75 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06]'
                }`}
              >
                <Globe size={10} className="text-emerald-400" />
                <span>2. แตกส่วนขยาย (Sprouter)</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectorEngineTab('dissect')}
                className={`h-6.5 px-3 rounded-full text-[10.5px] font-mono transition-all cursor-pointer flex items-center gap-1 active:scale-95 whitespace-nowrap ${
                  inspectorEngineTab === 'dissect'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                    : 'text-white/45 hover:text-white/75 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06]'
                }`}
              >
                <Archive size={10} className="text-amber-400" />
                <span>3. สกัดการ์ด (Dissector)</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectorEngineTab('linker')}
                className={`h-6.5 px-3 rounded-full text-[10.5px] font-mono transition-all cursor-pointer flex items-center gap-1 active:scale-95 whitespace-nowrap ${
                  inspectorEngineTab === 'linker'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-medium'
                    : 'text-white/45 hover:text-white/75 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06]'
                }`}
              >
                <MapPin size={10} className="text-sky-400" />
                <span>4. ผูกการ์ดสถานที่ (Auto-Linker)</span>
              </button>
            </div>
          )}

          {/* Body: Single Unibody Smoked Glass Canvas */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 lg:p-8 bg-[#080809]">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="rounded-2xl border border-white/[0.08] bg-[#121214]/90 p-5 sm:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.6)]">
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider bg-white/[0.06] text-white/70 border border-white/10">
                      {inspectorMainTab === 'assembled' ? 'LIVE STAGE BLUEPRINT' : 'PROMPT ENGINE'}
                    </span>
                    <span className="text-[14px] font-medium text-[#F1F1F1]">
                      {inspectorMainTab === 'assembled'
                        ? `พิมพ์เขียวโลก: ${activeWorld.title || 'โลกปัจจุบัน'}`
                        : inspectorEngineTab === 'spark'
                        ? 'เครื่องยนต์สกัดสปาร์ค (The Inciting Spark Extractor)'
                        : inspectorEngineTab === 'sprout'
                        ? 'เครื่องยนต์แตกส่วนขยาย (World Expansions Sprouter)'
                        : inspectorEngineTab === 'dissect'
                        ? 'เครื่องยนต์สกัดการ์ดวัตถุดิบ (Lore Card Dissector)'
                        : 'เครื่องยนต์ผูกการ์ดเข้าสถานที่ (Auto-Stage Card Linker)'}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-white/40">
                    {activePromptText.length} chars
                  </span>
                </div>

                {/* Sub-label description */}
                <p className="text-[11.5px] text-white/50 mb-3 leading-relaxed">
                  {inspectorMainTab === 'assembled'
                    ? 'พิมพ์เขียวฉบับรวมที่สังเคราะห์ข้อมูลทั้งหมดในโลกใบนี้ (แก่นเรื่อง, ชนวนเหตุ, ส่วนขยาย, และตู้ลิ้นชัก) พร้อมส่งให้ AI นักแสดงและผู้กำกับทำงานร่วมกันในห้องแชทจำลอง'
                    : inspectorEngineTab === 'spark'
                    ? 'คำสั่งที่ใช้ค้นหาจุดเปลี่ยนสำคัญ 1 ประโยคที่จะจุดชนวนให้โลกนี้เริ่มหมุน'
                    : inspectorEngineTab === 'sprout'
                    ? 'คำสั่งที่ใช้แตกขอบเขตโลกออกเป็น 4 มิติเชิงลึก (สถาปัตยกรรม, กฎเกณฑ์, ศาสตร์มืด, สิ่งมีชีวิต)'
                    : inspectorEngineTab === 'dissect'
                    ? 'คำสั่งที่ใช้อ่านเนื้อหาของส่วนขยายที่กำลังเปิดอยู่ แล้วสกัดเป็นการ์ดย่อยพร้อม Tag เข้าตู้ลิ้นชัก'
                    : 'คำสั่งที่ใช้วิเคราะห์มูดแอนด์โทนของสถานที่ และเลือกการ์ดที่สอดคล้องที่สุดมาผูกอัตโนมัติ'}
                </p>

                {/* Prompt Content Terminal Window */}
                <div className="p-4 rounded-xl bg-black/60 border border-white/[0.07] font-mono text-[12px] leading-relaxed text-white/80 whitespace-pre-wrap select-text max-h-[520px] overflow-y-auto custom-scrollbar">
                  {activePromptText}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorldStudioView
