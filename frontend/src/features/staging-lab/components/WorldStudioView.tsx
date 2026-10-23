import { useState, useRef, useEffect, useMemo } from 'react'
import {
  Search,
  Trash2,
  Plus,
  Save,
  ArrowLeft,
  PanelLeft,
  ChevronRight,
  CheckCircle2,
  Mic,
  ArrowUp,
  Globe,
  FileText,
  MapPin,
  Archive,
  X
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
  const [hasUserTypedWelcome, setHasUserTypedWelcome] = useState(false)

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
      title: 'มหาภพที่ 1: โรงเรียนเวทมนตร์',
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
      title: `มหาภพที่ ${newIdx}`,
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
    setHasUserTypedWelcome(false)
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
    setActiveView({ type: 'master' })
  }

  // 3. Unified Genesis: Automatically extract Spark & Sprout Expansion Notes in one go!
  const handleGenerateWorldGenesis = async (customLore?: string) => {
    const textToProcess = (customLore ?? activeWorld.rawLore).trim()
    if (!textToProcess || isSprouting) return
    setIsSprouting(true)
    // 1. Extract Spark immediately from text
    const sentences = textToProcess
      .split(/[.\n]/)
      .map(s => s.trim())
      .filter(Boolean)
    const extractedSpark = sentences.slice(0, 2).join(' ')
    if (extractedSpark) {
      updateActiveWorld(prev => ({ ...prev, sparkText: extractedSpark }))
      onSparkChange(extractedSpark)
    }

    // 2. Dissect into Expansion Notes via backend
    try {
      let res: Response
      const payload = { raw_text: textToProcess, world_id: activeWorld.id }
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
        
        // Convert dissected cards into new Expansion Notes in this world
        const newNotes: ExpansionNote[] = cards.map((c, idx) => ({
          id: `note_sprout_${Date.now()}_${idx}`,
          title: c.title,
          content: c.content,
          tags: c.tags || [],
          childCards: [{
            ...c,
            id: `card_${Date.now()}_${idx}`,
            isSavedToCabinet: false
          }],
          created_at: 1700000000000 + idx,
        }))

        updateActiveWorld(prev => ({
          ...prev,
          notes: newNotes.length > 0 ? newNotes : prev.notes
        }))
        setNotificationMessage(`สกัดชนวนเหตุและสร้างส่วนขยายสำเร็จ (${newNotes.length} ส่วน)`)
        setJustSavedNotification(true)
        setTimeout(() => setJustSavedNotification(false), 2400)
      }
    } catch (e) {
      console.error('Genesis failed:', e)
    } finally {
      setIsSprouting(false)
    }
  }

  // 5. Add New Expansion Note in this world
  const handleAddNewNote = () => {
    const newNote: ExpansionNote = {
      id: `note_manual_${Date.now()}`,
      title: 'บันทึกส่วนขยายใหม่',
      content: '',
      tags: ['ส่วนขยาย'],
      childCards: [],
      created_at: 1700000000000,
    }
    updateActiveWorld(prev => ({
      ...prev,
      notes: [newNote, ...prev.notes]
    }))
    setActiveView({ type: 'note', noteId: newNote.id })
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

          {/* Quiet White Text Button for Stage Entry (Like Gemini Download App) */}
          <button
            type="button"
            onClick={onEnterStage}
            className="text-[12px] text-white/60 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/[0.05] transition-all cursor-pointer font-normal flex items-center gap-1.5"
          >
            <span>ก้าวขึ้นสู่เวที</span>
          </button>
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
                    className="relative z-10 backdrop-blur-xl bg-white/[0.06] border border-white/[0.18] hover:border-white/[0.28] focus-within:border-white/[0.38] rounded-3xl sm:rounded-[32px] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(255,255,255,0.06),0_20px_50px_rgba(0,0,0,0.85)] min-h-[140px] sm:min-h-[150px] p-4 sm:p-5 flex flex-col justify-between transition-all"
                    style={{
                      animation: isInitialBounce
                        ? 'cardSquashRebound 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.30s backwards'
                        : undefined
                    }}
                  >
                    
                    {/* Top Text Input Area (Auto-expanding up to 6 lines max) */}
                    <textarea
                      ref={welcomeTextareaRef}
                      value={activeWorld.rawLore}
                      onChange={(e) => {
                        const val = e.target.value
                        setHasUserTypedWelcome(true)
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
                      className="w-full bg-transparent text-[15px] sm:text-[16px] text-white placeholder-white/40 focus:outline-none font-sans resize-none leading-relaxed min-h-[68px] max-h-[150px] border-none p-0"
                      autoFocus
                    />

                    {/* Bottom Toolbar (Gemini Style: Plus on Left, Mic + Konosuba 5th Orb '!' -> '↑' on Right) */}
                    <div className="flex items-center justify-between pt-2">
                      {/* Left: Plus Button (Ultra-subtle frosted glass, near-identical to main card surface) */}
                      <button
                        type="button"
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-95"
                        title="เพิ่มวัตถุดิบ"
                      >
                        <Plus size={18} strokeWidth={2.2} />
                      </button>

                      {/* Right: Actions (Mic button + Konosuba 5th Action Orb: '!' before typing -> Send '↑' on typing) */}
                      <div className="flex items-center gap-2">
                        {/* Voice Mic Button (Ultra-subtle frosted glass, near-identical to main card surface) */}
                        <button
                          type="button"
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-95"
                          title="ข้อความจากเสียง"
                        >
                          <Mic size={18} />
                        </button>

                        {/* 5th Action Orb (Konosuba Comedic '!' Snap -> Active Send Arrow) */}
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
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EF264C] hover:bg-[#ff2d55] text-white flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-90 border border-white/25"
                          style={{
                            boxShadow: '0 0 30px rgba(239, 38, 76, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                            animation: isInitialBounce
                              ? 'konosubaExclamationIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.54s backwards'
                              : undefined
                          }}
                          title={hasUserTypedWelcome && activeWorld.rawLore.trim().length > 0 ? "ส่งเพื่อเข้าสู่แดชบอร์ดและแตกแขนง" : "เล่าเรื่องราวในหัวของคุณออกมาได้เลย!"}
                        >
                          {hasUserTypedWelcome && activeWorld.rawLore.trim().length > 0 ? (
                            <ArrowUp size={18} strokeWidth={2.4} className="animate-in zoom-in-75 duration-150" />
                          ) : (
                            <span className="text-[18px] font-black leading-none font-sans select-none tracking-tighter animate-in zoom-in-75 duration-150">!</span>
                          )}
                        </button>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* VIEW A: MASTER UNIBODY CANVAS & CARMINE CIRCUIT FLOW */}
            {activeView.type === 'master' && (
              <div className="space-y-0 animate-in fade-in duration-200">
                
                {/* 1. Master Story Card (Stable State - Apple Dark Luxury with Subtle Exit Light) */}
                <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 bg-[#161618] border border-white/[0.08] shadow-xl space-y-4 transition-all relative overflow-hidden">
                  
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
                    placeholder="ชื่อมหาภพ / ชื่อโลก..."
                    className="relative z-10 w-full text-[20px] sm:text-[23px] font-medium text-[#F1F1F1] bg-transparent focus:outline-none placeholder-white/20 border-none p-0 tracking-tight"
                  />

                  {/* Story Textarea */}
                  <textarea
                    ref={textareaRef}
                    rows={4}
                    value={activeWorld.rawLore}
                    onChange={(e) => {
                      const val = e.target.value
                      updateActiveWorld(prev => ({ ...prev, rawLore: val }))
                      onMacroWorldLoreChange(val)
                    }}
                    placeholder="เล่าเรื่องราวในหัวของคุณออกมาได้เลย..."
                    className="relative z-10 w-full bg-transparent text-[15px] sm:text-[16px] text-[#F1F1F1] placeholder-white/20 focus:outline-none font-sans min-h-[110px] resize-none leading-relaxed border-none p-0"
                  />

                  {/* Bottom Toolbar: Identical to Welcome Screen (Plus, Mic, and Carmine Red Send Button) */}
                  <div className="relative z-10 flex items-center justify-between pt-2">
                    {/* Left: Plus Button */}
                    <button
                      type="button"
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-95"
                      title="เพิ่มวัตถุดิบ"
                    >
                      <Plus size={18} strokeWidth={2.2} />
                    </button>

                    {/* Right: Actions (Voice Mic & Carmine Red Send Button) */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-95"
                        title="ข้อความจากเสียง"
                      >
                        <Mic size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleGenerateWorldGenesis()}
                        disabled={isSprouting || !activeWorld.rawLore.trim()}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EF264C] hover:bg-[#ff2d55] text-white flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-90 border border-white/25 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          boxShadow: '0 0 24px rgba(239, 38, 76, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                        }}
                        title="ส่งเพื่อสกัดและเจนใหม่"
                      >
                        <ArrowUp
                          size={18}
                          strokeWidth={2.4}
                          className={isSprouting ? 'animate-spin' : ''}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Origin Pin Node on Master Card Bottom Edge (Concentric Ring) */}
                  <div className="absolute left-[26px] sm:left-[30px] -bottom-[6px] w-3 h-3 rounded-full bg-[#161618] border border-[#EF264C]/80 flex items-center justify-center z-20 shadow-[0_0_8px_rgba(239,38,76,0.35)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#EF264C]" />
                  </div>
                </div>

                {/* Stepped Circuit Container with Indented Sub-Cards (Step 2 & Step 3 Offset to Inside) */}
                <div className="relative pl-12 sm:pl-20 space-y-6 pt-5">
                  
                  {/* 2. Spark Card (Indented Step 2 with Subtle Carmine Contact Fade & Smooth Curve) */}
                  <div className="relative">
                    {/* Smooth Curved Wire branching from Vertical Line into Card 2 */}
                    <div
                      className="absolute -left-4 sm:-left-[44px] -top-5 w-4 sm:w-[44px] h-[48px] border-l-[1.5px] border-b-[1.5px] border-[#EF264C]/75 rounded-bl-[16px] sm:rounded-bl-[20px] pointer-events-none"
                      style={{
                        boxShadow: 'inset 0 -1px 3px rgba(239, 38, 76, 0.2)',
                        filter: 'drop-shadow(0 0 3px rgba(239, 38, 76, 0.35))',
                      }}
                    />

                    {/* Continuous vertical trunk segment continuing down alongside Card 2 to Card 3 */}
                    <div
                      className="absolute -left-4 sm:-left-[44px] top-[28px] -bottom-6 w-[1.5px] bg-[#EF264C]/75 pointer-events-none"
                      style={{
                        filter: 'drop-shadow(0 0 3px rgba(239, 38, 76, 0.35))',
                      }}
                    />

                    {/* Entry Pin Node on Card 2 Left Edge (Concentric Ring) */}
                    <div className="absolute -left-[6px] top-[22px] w-3 h-3 rounded-full bg-[#161618] border border-[#EF264C]/80 flex items-center justify-center z-20 shadow-[0_0_8px_rgba(239,38,76,0.35)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#EF264C]" />
                    </div>

                    <div className="rounded-2xl p-5 sm:p-6 bg-[#161618] border border-white/[0.08] space-y-3 transition-all relative overflow-hidden shadow-lg">
                      
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
                        <span className="text-[14px] font-semibold text-[#EF264C] tracking-tight">
                          ชนวนเหตุ (The Inciting Spark)
                        </span>
                      </div>

                      <textarea
                        rows={2}
                        value={activeWorld.sparkText}
                        onChange={(e) => {
                          const val = e.target.value
                          updateActiveWorld(prev => ({ ...prev, sparkText: val }))
                          onSparkChange(val)
                        }}
                        placeholder="แก้ไขหรือเขียนชนวนเหตุ..."
                        className="relative z-10 w-full bg-transparent text-[14px] sm:text-[14.5px] text-[#F1F1F1] focus:outline-none resize-none leading-relaxed font-sans placeholder-white/20 border-none p-0"
                      />
                    </div>
                  </div>

                  {/* 3. Expansions Container Card (Indented Step 3 with Subtle Carmine Contact Fade & Smooth Curve) */}
                  <div className="relative">
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

                    <div className="rounded-2xl p-5 sm:p-6 bg-[#161618] border border-white/[0.08] space-y-4 transition-all relative overflow-hidden shadow-lg">
                      
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
                      </div>

                      {activeWorld.notes.length === 0 ? (
                        <div className="relative z-10 p-8 rounded-xl border border-dashed border-white/[0.06] text-center text-white/30 text-[12px]">
                          ยังไม่มีส่วนขยาย — กดปุ่มส่งในการ์ดหลักเพื่อแตกแขนงอัตโนมัติ
                        </div>
                      ) : (
                        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          {activeWorld.notes.map((note) => (
                            <button
                              key={note.id}
                              type="button"
                              onClick={() => setActiveView({ type: 'note', noteId: note.id })}
                              className="px-4 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-white/[0.15] text-[#F1F1F1] text-[13px] flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98]"
                            >
                              <div className="flex items-center gap-2.5 truncate flex-1 min-w-0 pr-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C] shrink-0 group-hover:scale-125 transition-transform" />
                                <span className="truncate font-medium text-white/80 group-hover:text-white">
                                  {note.title || 'ไม่มีชื่อส่วนขยาย'}
                                </span>
                              </div>
                              <ChevronRight size={14} className="text-white/30 group-hover:text-white shrink-0 transition-colors" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Add Expansion Bottom Action Slot */}
                      <button
                        type="button"
                        onClick={handleAddNewNote}
                        className="relative z-10 w-full py-2.5 rounded-xl border border-dashed border-white/[0.08] hover:border-[#EF264C]/50 bg-white/[0.02] hover:bg-white/[0.05] text-white/50 hover:text-white flex items-center justify-center gap-2 text-[12.5px] font-medium transition-all cursor-pointer group active:scale-[0.99]"
                        title="เพิ่มส่วนขยายใหม่"
                      >
                        <Plus size={14} className="text-white/40 group-hover:text-[#EF264C] transition-colors" />
                        <span>เพิ่มส่วนขยาย</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* VIEW C: EXPANSION NOTE (Apple Notes / Notion Markdown Canvas) */}
            {activeView.type === 'note' && currentNote && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Note Surface: Expansive, Borderless Typography, Pure Markdown */}
                <div className="rounded-2xl p-6 sm:p-8 bg-[#161618] border border-white/[0.07] space-y-4 shadow-sm relative group">
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

                  <textarea
                    rows={6}
                    value={currentNote.content}
                    onChange={(e) => handleUpdateNote(currentNote.id, { content: e.target.value })}
                    placeholder="พิมพ์ขยายความรายละเอียดของส่วนขยายนี้ได้อย่างอิสระ..."
                    className="w-full text-[14.5px] sm:text-[15.5px] text-[#F1F1F1] bg-transparent focus:outline-none resize-none leading-relaxed font-sans placeholder-white/20 border-none p-0 min-h-[140px]"
                  />
                </div>

                {/* In-Note Child Cards Section: "การ์ดพร้อมเข้าตู้ลิ้นชัก" */}
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
                        return (
                          <div
                            key={card.id}
                            className="rounded-2xl p-5 border border-white/[0.07] hover:border-white/[0.14] transition-all flex flex-col justify-between group bg-[#161618] relative min-h-[165px]"
                          >
                            <div className="space-y-2.5 flex-1 flex flex-col">
                              {/* Top Bar: Free-form Tags on Left, Status Pill & Delete on Right */}
                              <div className="flex items-center justify-between gap-2">
                                {/* Free-form Tags */}
                                <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0 pr-1">
                                  {card.tags && card.tags.length > 0 ? (
                                    card.tags.map((tag, tIdx) => (
                                      <span
                                        key={tIdx}
                                        className="px-2 py-0.5 rounded-md text-[10px] font-mono text-white/60 bg-white/[0.04] border border-white/[0.08] hover:border-white/20 hover:text-white transition-colors"
                                      >
                                        #{tag}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-white/35 bg-white/[0.03] border border-white/[0.06]">
                                      #วัตถุดิบ
                                    </span>
                                  )}
                                </div>

                                {/* Status Action: DRAFT ⇄ SAVED (Bidirectional Toggle) */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {card.isSavedToCabinet ? (
                                    <button 
                                      type="button"
                                      onClick={() => handleToggleChildCardSaveState(currentNote.id, card)}
                                      className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 hover:border-emerald-500/50 flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                                      title="คลิกเพื่อเปลี่ยนกลับเป็น draft"
                                    >
                                      <CheckCircle2 size={11} className="text-emerald-400" />
                                      <span>SAVED</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleChildCardSaveState(currentNote.id, card)}
                                      className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono bg-white/[0.06] hover:bg-rose-500/20 text-white/50 hover:text-rose-200 border border-white/[0.10] hover:border-rose-500/40 flex items-center gap-1 transition-all cursor-pointer active:scale-95 group/btn"
                                      title="save เข้าตู้ลิ้นชัก"
                                    >
                                      <Save size={11} className="text-white/40 group-hover/btn:text-rose-300 transition-colors" />
                                      <span className="group-hover/btn:hidden">DRAFT</span>
                                      <span className="hidden group-hover/btn:inline">save เข้าตู้ลิ้นชัก</span>
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
                                className="w-full text-[14.5px] font-medium text-[#F1F1F1] bg-transparent outline-none border-none p-0 placeholder-white/20"
                              />

                              {/* Pure Markdown Content (Seamless, Borderless) */}
                              <textarea
                                rows={3}
                                value={card.content}
                                onChange={(e) => {
                                  const newContent = e.target.value
                                  handleUpdateNote(currentNote.id, {
                                    childCards: currentNote.childCards.map(c => c.id === card.id ? { ...c, content: newContent } : c)
                                  })
                                }}
                                placeholder="เนื้อหาของการ์ด..."
                                className="w-full text-[13px] text-white/75 bg-transparent outline-none resize-none leading-relaxed font-sans border-none p-0 placeholder-white/20 flex-1 min-h-[65px]"
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
                
                {/* Location Surface: Identical Architecture to Note Card */}
                <div className="rounded-2xl p-6 sm:p-8 bg-[#161618] border border-white/[0.07] space-y-4 shadow-sm relative group">
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

                  <textarea
                    rows={4}
                    value={currentCell.description}
                    onChange={(e) => {
                      const newDesc = e.target.value
                      updateActiveWorld(prev => ({
                        ...prev,
                        stageCells: prev.stageCells.map(c => c.id === currentCell.id ? { ...c, description: newDesc } : c)
                      }))
                    }}
                    placeholder="บรรยายบรรยากาศ สถาปัตยกรรม และรายละเอียดของสถานที่นี้ได้อย่างอิสระ..."
                    className="w-full text-[14.5px] sm:text-[15.5px] text-[#F1F1F1] bg-transparent focus:outline-none resize-none leading-relaxed font-sans placeholder-white/20 border-none p-0 min-h-[90px]"
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
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group select-none ${
                              isLinked
                                ? 'bg-emerald-500/[0.05] border-emerald-500/35 shadow-[0_0_16px_rgba(16,185,129,0.08)]'
                                : 'bg-[#161618] border-white/[0.07] hover:border-white/[0.16] hover:bg-white/[0.03]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                              <div className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                                isLinked ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-white/20 group-hover:bg-white/40'
                              }`} />
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
                      return (
                        <div
                          key={card.id}
                          className="rounded-2xl p-5 border border-white/[0.07] hover:border-white/[0.14] transition-all flex flex-col justify-between group bg-[#161618] relative min-h-[165px]"
                        >
                          <div className="space-y-2.5 flex-1 flex flex-col">
                            {/* Top Bar: Free-form Tags on Left, Status Pill & Delete on Right */}
                            <div className="flex items-center justify-between gap-2">
                              {/* Free-form Tags & Source Note Origin */}
                              <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0 pr-1">
                                {card.tags && card.tags.length > 0 ? (
                                  card.tags.map((tag, tIdx) => (
                                    <span
                                      key={tIdx}
                                      className="px-2 py-0.5 rounded-md text-[10px] font-mono text-white/60 bg-white/[0.04] border border-white/[0.08] hover:border-white/20 hover:text-white transition-colors"
                                    >
                                      #{tag}
                                    </span>
                                  ))
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-white/35 bg-white/[0.03] border border-white/[0.06]">
                                    #วัตถุดิบ
                                  </span>
                                )}
                                {card.sourceNoteTitle && (
                                  <span
                                    className="px-2 py-0.5 rounded-md text-[10px] font-mono text-white/30 bg-white/[0.02] border border-white/[0.05] truncate max-w-[130px]"
                                    title={`มาจากส่วนขยาย: ${card.sourceNoteTitle}`}
                                  >
                                    {card.sourceNoteTitle}
                                  </span>
                                )}
                              </div>

                              {/* Status Action: DRAFT ⇄ SAVED (Bidirectional Toggle) */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                {card.isSavedToCabinet ? (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleChildCardSaveState(card.sourceNoteId || '', card)}
                                    className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 hover:border-emerald-500/50 flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                                    title="คลิกเพื่อเปลี่ยนกลับเป็น draft"
                                  >
                                    <CheckCircle2 size={11} className="text-emerald-400" />
                                    <span>SAVED</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleChildCardSaveState(card.sourceNoteId || '', card)}
                                    className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono bg-white/[0.06] hover:bg-rose-500/20 text-white/50 hover:text-rose-200 border border-white/[0.10] hover:border-rose-500/40 flex items-center gap-1 transition-all cursor-pointer active:scale-95 group/btn"
                                    title="save เข้าตู้ลิ้นชัก"
                                  >
                                    <Save size={11} className="text-white/40 group-hover/btn:text-rose-300 transition-colors" />
                                    <span className="group-hover/btn:hidden">DRAFT</span>
                                    <span className="hidden group-hover/btn:inline">save เข้าตู้ลิ้นชัก</span>
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
                              className="text-[15px] font-medium text-[#F1F1F1] bg-transparent focus:outline-none placeholder-white/20 border-none p-0 w-full"
                            />

                            {/* Pure Markdown Content (Seamless, Borderless) */}
                            <textarea
                              rows={2}
                              value={card.content}
                              onChange={(e) => handleUpdateCardEverywhere(card.id, { content: e.target.value }, card.sourceNoteId)}
                              placeholder="เขียนเนื้อหาหรือสกัดเป็นวัตถุดิบย่อย..."
                              className="w-full text-[12.5px] text-[#AAAAAA] bg-transparent focus:outline-none resize-none leading-relaxed font-sans placeholder-white/20 border-none p-0 flex-1 min-h-[60px]"
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
    </div>
  )
}

export default WorldStudioView
