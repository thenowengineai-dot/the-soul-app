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
  ArrowUpRight,
  FileCode2,
  Copy,
  Check
} from 'lucide-react'
import type { LoreCard, ExpansionNote, StageCellItem, WorldWorkspace } from '../types'

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
}

type StudioActiveView =
  | { type: 'welcome' }
  | { type: 'master' }
  | { type: 'spark' }
  | { type: 'note'; noteId: string }
  | { type: 'cell'; cellId: string }
  | { type: 'cabinet' }

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
}: WorldStudioViewProps) {
  // Navigation & Workspace State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeView, setActiveView] = useState<StudioActiveView>({ type: 'master' })
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

  // Find active world safely
  const activeWorld = useMemo(() => {
    return worlds.find(w => w.id === activeWorldId) || worlds[0]
  }, [worlds, activeWorldId])

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const welcomeTextareaRef = useRef<HTMLTextAreaElement>(null)

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
  }, [activeWorld.rawLore, activeView.type])

  // AI Operation States
  const [isSprouting, setIsSprouting] = useState(false)
  const [isDissectingNote, setIsDissectingNote] = useState(false)
  const [isAutoLinking, setIsAutoLinking] = useState(false)
  const [justSavedNotification, setJustSavedNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('บันทึกการ์ดเข้าตู้ลิ้นชักเรียบร้อยแล้ว')
  const [cabinetSearchQuery, setCabinetSearchQuery] = useState('')
  const [isSparkDraftOpen, setIsSparkDraftOpen] = useState(false)
  const [activeTagPopoverCardId, setActiveTagPopoverCardId] = useState<string | null>(null)
  const [newTagInput, setNewTagInput] = useState('')

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
  const updateActiveWorld = (updater: (prev: WorldWorkspace) => WorldWorkspace) => {
    setWorlds(prev => prev.map(w => {
      if (w.id === activeWorld.id) {
        return updater(w)
      }
      return w
    }))
  }

  // 1. ADD NEW WORLD: Clean Slate 100%
  const handleAddNewWorld = () => {
    const newIdx = worlds.length + 1
    const newWorld: WorldWorkspace = {
      id: `world_${Date.now()}`,
      title: `โลกที่ ${newIdx}`,
      rawLore: '',
      sparkText: '',
      notes: [],
      stageCells: [],
      cabinetCards: [],
      pinnedCardIds: [],
      created_at: 1700000000000,
    }

    setWorlds(prev => [...prev, newWorld])
    setActiveWorldId(newWorld.id)
    onMacroWorldLoreChange('')
    onSparkChange('')
    setIsSparkDraftOpen(false)
    setIsInitialBounce(true)
    setTimeout(() => setIsInitialBounce(false), 2000)
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
    setActiveView({ type: 'master' })
  }

  // 3. Unified Genesis: Automatically extract Spark & Sprout Expansion Notes in one go!
  const handleGenerateWorldGenesis = async (customLore?: string, mode: 'initial' | 'more' = 'initial') => {
    const textToProcess = (customLore ?? activeWorld.rawLore).trim()
    if (!textToProcess || isSprouting) return
    setIsSprouting(true)

    // 1. Extract Spark immediately from text only on initial run
    if (mode === 'initial' && !activeWorld.sparkText) {
      const sentences = textToProcess
        .split(/[.\n]/)
        .map(s => s.trim())
        .filter(Boolean)
      const extractedSpark = sentences.slice(0, 2).join(' ')
      if (extractedSpark) {
        updateActiveWorld(prev => ({ ...prev, sparkText: extractedSpark }))
        onSparkChange(extractedSpark)
      }
    }

    // 2. Dissect into Expansion Notes via backend (Progressive Batch: 4-5 items per batch)
    const alreadyExtracted = mode === 'more' 
      ? activeWorld.notes
          .filter(n => n.title.trim() || n.content.trim())
          .map(n => n.content.trim() ? `${n.title}: ${n.content}` : n.title)
      : []

    try {
      let res: Response
      const payload = { 
        raw_text: textToProcess, 
        world_id: activeWorld.id, 
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
          tags: c.tags || [],
          childCards: [{
            ...c,
            id: `card_${Date.now()}_${idx}`,
            isSavedToCabinet: false
          }],
          created_at: Date.now() + idx,
        }))

        if (mode === 'more') {
          if (newNotes.length > 0) {
            updateActiveWorld(prev => ({
              ...prev,
              notes: [...prev.notes, ...newNotes]
            }))
            setNotificationMessage(`สกัดส่วนขยายเพิ่มสำเร็จ (+${newNotes.length} ส่วน)`)
          } else {
            setNotificationMessage('สกัดครบทุกหัวข้อในโลกหลักแล้ว')
          }
        } else {
          updateActiveWorld(prev => ({
            ...prev,
            notes: newNotes.length > 0 ? newNotes : prev.notes
          }))
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

  // 4. Extract Spark Only (สกัดเฉพาะสปาร์คจากเนื้อเรื่อง)
  const handleExtractSparkOnly = () => {
    const textToProcess = activeWorld.rawLore.trim()
    if (!textToProcess) {
      welcomeTextareaRef.current?.focus()
      return
    }
    const sentences = textToProcess
      .split(/[.\n]/)
      .map(s => s.trim())
      .filter(Boolean)
    const extractedSpark = sentences.slice(0, 2).join(' ') || textToProcess.slice(0, 100)
    updateActiveWorld(prev => ({ ...prev, sparkText: extractedSpark }))
    onSparkChange(extractedSpark)
    setNotificationMessage('สกัดสปาร์คสำเร็จ')
    setJustSavedNotification(true)
    setTimeout(() => setJustSavedNotification(false), 2400)
    setActiveView({ type: 'master' })
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
    const newNote: ExpansionNote = {
      id: `note_manual_${Date.now()}`,
      title: '',
      content: '',
      tags: ['ส่วนขยาย'],
      childCards: [],
      created_at: Date.now(),
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
    const newCell: StageCellItem = {
      id: `cell_manual_${Date.now()}`,
      title: 'ผืนเวทีสถานที่ใหม่',
      description: 'กำหนดบรรยากาศ กลิ่นอาย และสิ่งแวดล้อมของห้องนี้...',
      pinnedCardIds: [],
      created_at: 1700000000000,
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

  // 8. Toggle Save / Draft for Child Card in Cabinet
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

  // 9. Update card title/content everywhere (notes + cabinet)
  const handleUpdateCardEverywhere = (cardId: string, updates: Partial<LoreCard>, sourceNoteId?: string) => {
    updateActiveWorld(prev => ({
      ...prev,
      cabinetCards: prev.cabinetCards.map(c => c.id === cardId ? { ...c, ...updates } : c),
      notes: prev.notes.map(n => {
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

  // Auto-Stage / Auto-Link matching cards from Drawer into this Stage Cell
  const handleAutoStageCards = (cell: StageCellItem) => {
    if (currentCabinetCards.length === 0 || isAutoLinking) return
    setIsAutoLinking(true)

    setTimeout(() => {
      // Analyze text context from cell
      const contextWords = `${cell.title} ${cell.description}`
        .toLowerCase()
        .replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 2)

      // Score each card in cabinet
      const scoredCards = currentCabinetCards.map(card => {
        let score = 0
        const cardText = `${card.title} ${card.content} ${(card.tags || []).join(' ')}`.toLowerCase()
        
        contextWords.forEach(word => {
          if (cardText.includes(word)) score += 1
          if ((card.tags || []).some(t => t.toLowerCase().includes(word))) score += 2
        })

        return { cardId: card.id, score }
      })

      // Sort and pick cards with score > 0 (or top matching candidates if general match)
      let matches = scoredCards.filter(c => c.score > 0).map(c => c.cardId)
      if (matches.length === 0 && currentCabinetCards.length > 0) {
        matches = currentCabinetCards.slice(0, 2).map(c => c.id)
      }

      // Merge into cell pinned cards
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
      setNotificationMessage(`จัดฉากและผูกการ์ดสำเร็จ (${matches.length} ใบ)`)
      setJustSavedNotification(true)
      setTimeout(() => setJustSavedNotification(false), 2400)
    }, 600)
  }

  // Active items lookup
  const currentNote = activeView.type === 'note'
    ? activeWorld.notes.find(n => n.id === activeView.noteId)
    : null

  const currentCell = activeView.type === 'cell'
    ? activeWorld.stageCells.find(c => c.id === activeView.cellId)
    : null

  // Only cards saved to the cabinet in this world (isSavedToCabinet === true)
  const savedCabinetCards = useMemo(() => {
    const cardMap = new Map<string, LoreCard & { sourceNoteTitle?: string }>()
    
    // 1. Gather all saved child cards from notes
    activeWorld.notes.forEach(note => {
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

  // Current cabinet cards available for staging (only saved ones)
  const currentCabinetCards = savedCabinetCards
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
    parts.push(`[CORE WORLD LORE]\n${activeWorld.rawLore || '(ยังไม่ได้ระบุแก่นเรื่องโลก)'}`)
    
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
      const pinnedCards = currentCabinetCards.filter(c => currentCell.pinnedCardIds.includes(c.id))
      const cellSummary = `ชื่อสถานที่: ${currentCell.title}\nคำบรรยาย: ${currentCell.description || '(ไม่มีคำบรรยาย)'}\nการ์ดที่ผูกไว้: ${pinnedCards.length > 0 ? pinnedCards.map(c => c.title).join(', ') : 'ยังไม่ได้ผูกการ์ด'}`
      parts.push(`\n[ACTIVE STAGE CELL · จุดเกิดเหตุการณ์ / สถานที่จำลอง]\n${cellSummary}`)
    }

    parts.push(`\n[ROLEPLAY & SIMULATION INSTRUCTION]\nให้จำลองบรรยากาศตาม Core World Lore และ The Inciting Spark โดยผูกโยงกับองค์ประกอบและวัตถุดิบที่ผู้กำกับระบุไว้ รักษาความลึกลับ กฎเกณฑ์ และอารมณ์ร่วมของโลกอย่างเคร่งครัด`)

    return parts.join('\n')
  }, [activeWorld, savedCabinetCards, currentCell, currentCabinetCards])

  const sparkEnginePrompt = useMemo(() => {
    return `=== SYSTEM PROMPT: THE INCITING SPARK EXTRACTOR ===
หน้าที่ของคุณคือการวิเคราะห์เนื้อหาของโลก และสกัด "The Inciting Spark" (ชนวนเหตุจุดเริ่มต้นที่ไม่อาจถอยกลับได้) 
ซึ่งเป็นเหตุการณ์หรือจุดเปลี่ยนสำคัญเพียง 1 ประโยคที่ทำให้โลกที่เคยสงบนิ่งเริ่มหมุนและเกิดความขัดแย้ง/การผจญภัยขึ้น

[TARGET RAW WORLD LORE]:
"${activeWorld.rawLore || '(ยังไม่ได้ป้อนแก่นเรื่องโลก)'}"

[OUTPUT SPECIFICATION]:
- ความยาว 1-2 ประโยคกระชับ ทรงพลัง
- มีองค์ประกอบของ เวลา + สถานที่ + เหตุการณ์ที่ทิ้งปริศนาหรือความเสี่ยง
- ห้ามใส่คำสรุปบทเรียน ให้ใส่เฉพาะตัวเหตุการณ์ที่เป็นชนวนเหตุ`
  }, [activeWorld.rawLore])

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
"${activeWorld.rawLore || '(ยังไม่ได้ป้อนแก่นเรื่องโลก)'}"

[ALREADY_EXTRACTED_TOPICS (หัวข้อและเนื้อหาที่สกัดไปแล้ว — ห้ามทำซ้ำและห้ามดึงเรื่องย่อยที่อยู่ในเนื้อหาข้างล่างนี้มาตั้งซ้ำเด็ดขาด)]:
${alreadyStr}`
  }, [activeWorld.rawLore, activeWorld.notes])

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
${currentCabinetCards.map(c => `- ID: ${c.id} | Title: "${c.title}" | Tags: #${(c.tags || []).join(' #')}`).join('\n') || '(ยังไม่มีการ์ดในตู้ลิ้นชัก)'}

[MATCHING ALGORITHM]:
- คำนวณความสอดคล้องของคำศัพท์และมูดโทนระหว่างคำบรรยายสถานที่กับการ์ด
- เลือกการ์ดที่มีความสัมพันธ์สูงที่สุด (คะแนนคำพ้องบริบท > 0) เพื่อผูกเข้ากับสถานที่นี้ทันที`
  }, [currentCell, currentCabinetCards])

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
        {/* Sidebar Header: Unified Back and Collapse Button */}
        <div className="h-12 px-3.5 border-b border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onBackToHome}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
              title="กลับหน้าหลัก"
            >
              <ArrowLeft size={15} />
            </button>
            <span className="text-[12.5px] font-medium text-white/80">
              The World Studio
            </span>
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
          <div>
            {!isSidebarOpen && (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
                title="เปิดแถบข้าง"
              >
                <PanelLeft size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Inspector Button */}
            <button
              type="button"
              onClick={() => setIsPromptInspectorOpen(true)}
              className="h-7 px-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title="เปิดแผงตรวจเช็กพิมพ์เขียวโลก (Prompt Inspector)"
            >
              <FileCode2 size={12} className="text-[#38bdf8]" />
              <span>Inspector</span>
            </button>

            {/* Quiet White Text Button for Stage Entry (Like Gemini Download App) */}
            <button
              type="button"
              onClick={onEnterStage}
              className="text-[12px] text-white/60 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/[0.05] transition-all cursor-pointer font-normal flex items-center gap-1.5"
            >
              <span>ก้าวขึ้นสู่เวที</span>
            </button>
          </div>
        </header>

        {/* Scrollable Center Content */}
        <main className={`flex-1 overflow-y-auto px-4 sm:px-6 py-6 flex flex-col relative ${
          activeView.type === 'welcome' ? 'items-center justify-center' : 'items-center justify-start'
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
            activeView.type === 'welcome' ? 'max-w-2xl py-8' : 'max-w-[860px] space-y-7'
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
              <div className="w-full max-w-[640px] mx-auto text-center animate-in fade-in zoom-in-95 duration-300 relative py-8">
                
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
                      value={activeWorld.rawLore}
                      onChange={(e) => {
                        const val = e.target.value
                        updateActiveWorld(prev => ({ ...prev, rawLore: val }))
                        onMacroWorldLoreChange(val)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (e.metaKey || e.ctrlKey) {
                            // Cmd+Enter or Ctrl+Enter -> Insert newline
                            e.preventDefault()
                            const target = e.currentTarget
                            const start = target.selectionStart
                            const end = target.selectionEnd
                            const val = activeWorld.rawLore
                            const newVal = val.substring(0, start) + '\n' + val.substring(end)
                            updateActiveWorld(prev => ({ ...prev, rawLore: newVal }))
                            onMacroWorldLoreChange(newVal)
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
                          if (activeWorld.rawLore.trim()) {
                            handleGenerateWorldGenesis()
                            setActiveView({ type: 'master' })
                          }
                        }
                      }}
                      placeholder="เล่าเรื่องราวในหัวของคุณออกมาได้เลย... (กด Cmd+Enter เพื่อขึ้นบรรทัดใหม่)"
                      className="w-full bg-transparent text-[15px] sm:text-[16px] text-white placeholder-white/40 focus:outline-none font-sans resize-none leading-relaxed min-h-[120px] sm:min-h-[140px] max-h-[240px] border-none p-0"
                      autoFocus
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
                          onClick={handleExtractSparkOnly}
                          className="h-[36px] sm:h-[38px] px-4 sm:px-4.5 rounded-full bg-[#EF264C]/10 hover:bg-[#EF264C]/20 border border-[#EF264C]/50 hover:border-[#EF264C] text-[#EF264C] flex items-center gap-2 text-[13px] sm:text-[13.5px] font-medium transition-all cursor-pointer shrink-0 shadow-[0_0_18px_rgba(239,38,76,0.25),inset_0_1px_0_rgba(255,255,255,0.14)] active:scale-95 group select-none"
                          title="สกัดสปาร์ค"
                        >
                          <Sparkles size={15} strokeWidth={2.2} className="text-[#EF264C] group-hover:scale-110 transition-transform" />
                          <span>สกัดสปาร์ค</span>
                        </button>

                        {/* ปุ่ม "แตกส่วนขยาย" (Primary Pill สีแดงคาร์ไมน์) */}
                        <button
                          type="button"
                          onClick={() => {
                            if (activeWorld.rawLore.trim()) {
                              handleGenerateWorldGenesis()
                              setActiveView({ type: 'master' })
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

                  </div>

                  {/* แถบปุ่มแคปซูลกระจกคู่ด้านล่าง: ขนาดเล็กลงเพื่อให้ดูถ่อมตน เป็นทางเลือกรอง (Secondary Subordinate Pills) */}
                  {(!showSparkCard || !showExpansionsCard) && (
                    <div className="flex items-center justify-center gap-2.5 pt-4 sm:pt-5 relative z-10 animate-in fade-in duration-300">
                      {/* 1. ปุ่ม "เพิ่มสปาร์คเอง" (แบบเดิมหน้าต้อนรับ) */}
                      {!showSparkCard && (
                        <button
                          type="button"
                          onClick={handleManualAddSpark}
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
                    className="relative z-10 w-full text-[20px] sm:text-[23px] font-medium text-[#F1F1F1] bg-transparent focus:outline-none placeholder-white/20 border-none p-0 tracking-tight"
                  />

                  {/* Story Textarea (Auto-stretches to Unlimited Length) */}
                  <textarea
                    ref={textareaRef}
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
                        className="h-[36px] sm:h-[38px] px-4 sm:px-4.5 rounded-full bg-[#EF264C]/10 hover:bg-[#EF264C]/20 border border-[#EF264C]/50 hover:border-[#EF264C] text-[#EF264C] flex items-center gap-2 text-[13px] sm:text-[13.5px] font-medium transition-all cursor-pointer shrink-0 shadow-[0_0_18px_rgba(239,38,76,0.25),inset_0_1px_0_rgba(255,255,255,0.14)] active:scale-95 group select-none"
                        title="สกัดสปาร์ค"
                      >
                        <Sparkles size={15} strokeWidth={2.2} className="text-[#EF264C] group-hover:scale-110 transition-transform" />
                        <span>สกัดสปาร์ค</span>
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

                          <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[14px] font-semibold text-[#EF264C] tracking-tight">
                                The Inciting Spark
                              </span>
                              <span className="text-[12.5px] font-normal text-white/50">
                                (จุดเริ่มต้นที่ไม่อาจถอยกลับได้)
                              </span>
                            </div>
                          </div>

                          {/* Spark Textarea (Auto-stretches to Unlimited Length) */}
                          <textarea
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
                            }}
                            placeholder="เขียนจุดเริ่มต้นที่ไม่อาจถอยกลับได้ (The Inciting Spark)..."
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
                              disabled={isSprouting || !activeWorld.rawLore.trim()}
                              className="h-[26px] sm:h-[28px] px-2.5 sm:px-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-[#EF264C]/50 text-white/70 hover:text-white text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed select-none group"
                              title="สกัดหัวข้อที่เหลือจากโลกหลักเพิ่มเติม (ทีละ 4-5 หัวข้อ)"
                            >
                              <Sparkles size={11} className={isSprouting ? 'animate-spin text-[#EF264C]' : 'text-white/40 group-hover:text-[#EF264C] transition-colors'} />
                              <span>{isSprouting ? 'กำลังสกัดเพิ่ม...' : '+ สกัดเพิ่ม'}</span>
                            </button>
                          </div>

                          {/* Grid with Inline Editing of Note Titles + Link Arrow on right */}
                          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            {activeWorld.notes.map((note) => (
                              <div
                                key={note.id}
                                className="px-3.5 py-2.5 rounded-xl backdrop-blur-md bg-white/[0.04] hover:bg-white/[0.07] focus-within:bg-white/[0.08] border border-white/[0.09] hover:border-white/[0.18] focus-within:border-[#EF264C]/50 text-[#F1F1F1] text-[13px] flex items-center justify-between transition-all group shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] gap-2"
                              >
                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C] shrink-0 group-hover:scale-125 transition-transform" />
                                  <input
                                    type="text"
                                    value={note.title}
                                    onChange={(e) => {
                                      const newTitle = e.target.value
                                      updateActiveWorld(prev => ({
                                        ...prev,
                                        notes: prev.notes.map(n => n.id === note.id ? { ...n, title: newTitle } : n)
                                      }))
                                    }}
                                    placeholder="ตั้งชื่อส่วนขยาย..."
                                    className="bg-transparent text-white/90 placeholder-white/25 focus:text-white focus:outline-none border-none p-0 w-full text-[13px] font-medium"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setActiveView({ type: 'note', noteId: note.id })}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all cursor-pointer shrink-0"
                                  title={`ไปยังหน้ารายละเอียดส่วนขยาย: ${note.title || 'ไม่มีชื่อ'}`}
                                >
                                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-white/50 hover:text-white" />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Add Expansion Bottom Action Slot */}
                          <button
                            type="button"
                            onClick={() => handleAddNewNote(true)}
                            className="relative z-10 w-full py-2.5 rounded-xl border border-dashed border-white/[0.10] hover:border-[#EF264C]/50 bg-white/[0.02] hover:bg-white/[0.05] text-white/50 hover:text-white flex items-center justify-center gap-2 text-[12.5px] font-medium transition-all cursor-pointer group active:scale-[0.99] backdrop-blur-sm"
                            title="เพิ่มส่วนขยายใหม่"
                          >
                            <Plus size={14} className="text-white/40 group-hover:text-[#EF264C] transition-colors" />
                            <span>+ เพิ่มส่วนขยาย</span>
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
                <div className="rounded-2xl p-6 sm:p-8 backdrop-blur-xl bg-[#141416]/80 hover:bg-[#141416]/85 border border-white/[0.12] hover:border-white/[0.18] space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_20px_45px_rgba(0,0,0,0.6)] relative group transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <input
                      type="text"
                      value={currentNote.title}
                      onChange={(e) => handleUpdateNote(currentNote.id, { title: e.target.value })}
                      placeholder="ชื่อส่วนขยาย..."
                      className="w-full text-[24px] sm:text-[28px] font-semibold text-[#F1F1F1] bg-transparent outline-none border-none p-0 placeholder-white/20 leading-tight"
                    />

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

                  {/* Note Content Textarea (Auto-stretches to Unlimited Length) */}
                  <textarea
                    rows={6}
                    value={currentNote.content}
                    onInput={(e) => {
                      e.currentTarget.style.height = 'auto'
                      e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
                    }}
                    onChange={(e) => handleUpdateNote(currentNote.id, { content: e.target.value })}
                    placeholder="พิมพ์ขยายความรายละเอียดของส่วนขยายนี้ได้อย่างอิสระ..."
                    className="w-full text-[14.5px] sm:text-[15.5px] text-[#F1F1F1] bg-transparent focus:outline-none resize-none leading-relaxed font-sans placeholder-white/20 border-none p-0 min-h-[140px] overflow-hidden"
                  />
                </div>

                {/* In-Note Child Cards Section: "การ์ดพร้อมเข้าตู้ลิ้นชัก" (Fixed Uniform Height) */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-medium text-white/80">
                        การ์ดพร้อมเข้าตู้ลิ้นชัก
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10.5px] font-mono bg-white/[0.06] text-white/50">
                        {currentNote.childCards.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* สกัดการ์ด Button (Inviting Rose Pill Accent, Clean Text - No Emoji) */}
                      <button
                        type="button"
                        onClick={() => handleDissectCurrentNote(currentNote)}
                        disabled={isDissectingNote || !currentNote.content.trim()}
                        className="px-3.5 py-1 rounded-full text-[11.5px] font-mono bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 border border-rose-500/30 hover:border-rose-500/50 transition-all cursor-pointer flex items-center active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                        title="สกัดวัตถุดิบเป็นการ์ดพร้อมเข้าตู้ลิ้นชัก"
                      >
                        <span>{isDissectingNote ? 'กำลังสกัด...' : 'สกัดการ์ด'}</span>
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
                        className="px-3 py-1 rounded-full text-[11.5px] bg-white/[0.05] hover:bg-white/[0.10] text-white/70 hover:text-white border border-white/[0.10] transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                        title="เพิ่มการ์ดย่อยใหม่"
                      >
                        <Plus size={12} />
                        <span>เพิ่มการ์ด</span>
                      </button>
                    </div>
                  </div>

                  {currentNote.childCards.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-dashed border-white/[0.06] text-center text-white/30 text-[12px]">
                      ยังไม่มีการ์ดในส่วนขยายนี้ กดปุ่ม <span className="text-rose-300 font-mono">[ สกัดการ์ด ]</span> หรือ <span className="text-white/60">[ เพิ่มการ์ด ]</span>
                    </div>
                  ) : (
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
                    </div>

                    {/* Auto-Stage / Auto-Link AI Button (Clean Text - No Emoji) */}
                    <button
                      type="button"
                      onClick={() => handleAutoStageCards(currentCell)}
                      disabled={isAutoLinking || currentCabinetCards.length === 0}
                      className="px-3.5 py-1 rounded-full text-[11.5px] font-mono bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 hover:text-sky-200 border border-sky-500/30 hover:border-sky-500/50 transition-all cursor-pointer flex items-center active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(14,165,233,0.15)]"
                      title="วิเคราะห์บรรยากาศสถานที่และผูกการ์ดที่เกี่ยวข้องจากตู้ลิ้นชักอัตโนมัติ"
                    >
                      <span>{isAutoLinking ? 'กำลังผูกการ์ด...' : 'ผูกการ์ดอัตโนมัติ'}</span>
                    </button>
                  </div>

                  {currentCabinetCards.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-dashed border-white/[0.06] text-center text-white/30 text-[12px]">
                      ยังไม่มีการ์ดในตู้ลิ้นชักให้ผูกกับสถานที่นี้
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentCabinetCards.map(card => {
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

                            <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                              <span className={`text-[13px] truncate font-normal ${
                                isLinked ? 'text-[#F1F1F1] font-medium' : 'text-white/60 group-hover:text-white'
                              }`}>
                                {card.title}
                              </span>
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
