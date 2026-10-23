import { useState, useRef, useEffect, useMemo } from 'react'
import {
  Search,
  Pin,
  Trash2,
  Plus,
  Save,
  ArrowLeft,
  PanelLeft,
  Clock,
  ChevronRight,
  CheckCircle2,
  Share2,
  Mic,
  ArrowUp
} from 'lucide-react'
import type { LoreCard, MacroWorldPreset, ExpansionNote, StageCellItem, WorldWorkspace } from '../types'

interface WorldStudioViewProps {
  macroWorldLore: string
  onMacroWorldLoreChange: (lore: string) => void
  sparkText: string
  onSparkChange: (spark: string) => void
  cabinetCards: LoreCard[]
  pinnedCardIds: string[]
  onTogglePin: (cardId: string) => void
  onDeleteCabinetCard: (cardId: string) => Promise<void>
  onSaveCardsToCabinet: (cards: LoreCard[]) => Promise<void>
  onEnterStage: () => void
  onBackToHome: () => void
}

type StudioActiveView =
  | { type: 'master' }
  | { type: 'spark' }
  | { type: 'note'; noteId: string }
  | { type: 'cell'; cellId: string }
  | { type: 'cabinet' }

const CATEGORY_NAMES: Record<string, string> = {
  faction: 'การแบ่งขั้ว / สถาบัน',
  location: 'สถานที่ / สถาปัตยกรรม',
  rule: 'กฎเกณฑ์ / กลไก',
  lore: 'ตำนาน / ผู้คน',
}

// 3 Curated Seeds for Google-style Dropdown (Max 3)
const CURATED_WORLD_SEEDS: MacroWorldPreset[] = [
  {
    id: 'magic_school',
    title: 'โรงเรียนเวทมนตร์ 100 ปี & การแบ่ง 4 บ้าน',
    subtitle: 'การประลองชิงคะแนน • กฎเคอร์ฟิวหอนอน • รอยแยกศาสตร์มืดใต้ปราสาท',
    lore: `เป็นโรงเรียนเวทมนตร์อันดับหนึ่ง ที่เหล่าพ่อมดแม่มดทุกบ้านต้องเอาลูกมาเรียน โดยต่างจากสังคมมนุษย์ทั่วไป โรงเรียนอายุเกินกว่า 100 ปี มีพ่อมดศาสตร์มืด มีการแบ่งบ้านในโรงเรียน มีอาจารย์ที่ยูนีคทุ่มเทเพื่อเด็กๆ มีสัตว์วิเศษ มีความแฟนตาซี ใช้ไม้กายสิทธิ์เพื่อร่ายคาถา แอบอยู่ในโลกของเราและโดนโลกของเรากีดกัน คนเยอะ ห้องเรียนเยอะ สถานที่ลึกลับ มูดแอนด์โทนของการแข่งขัน ความเป็นเพื่อน ปริศนา และตัวร้ายที่แฝงตัวอยู่...`
  },
  {
    id: 'cyberpunk_2089',
    title: 'นีโอนโตเกียว 2089 & สัมปทานความทรงจำ',
    subtitle: 'นักสืบไซเบอร์ • บริษัทเมกะคอร์ป • ฝนกรดที่ไม่เคยหยุดตก • ชิปลบความจำ',
    lore: `มหานครนีโอนโตเกียวในปี 2089 ท้องฟ้าถูกปกคลุมด้วยฝนกรดตลอดกาล ผู้คนถูกแบ่งชนชั้นด้วยชิปความจำในสมอง บริษัทเมกะคอร์ปผูกขาดทุกความทรงจำในอดีต นักสืบไซเบอร์ผู้ถูกลบอดีตต้องรับงานตามหาชิปปริศนาที่บรรจุความจริงเกี่ยวกับการล่มสลายของมนุษยชาติ ท่ามกลางแก๊งไซบอร์กใต้ดินและปัญญาประดิษฐ์ที่เริ่มมีความรู้สึก...`
  },
  {
    id: 'court_intrigue',
    title: 'ศึกชิงบัลลังก์วังหลวง & ยาพิษในงานเลี้ยง',
    subtitle: 'องค์ชายตกอับ • กบฏเงา • ขุนนางทรยศ • จดหมายลับตราประทับเลือด',
    lore: `อาณาจักรโบราณในยุคผลัดแผ่นดิน จักรพรรดิประชวรหนักโดยไม่ทราบสาเหตุ องค์ชายตกอับที่ถูกเนรเทศเดินทางกลับสู่เมืองหลวงอย่างลับๆ ท่ามกลางขุนนางที่จ้องจะก่อกบฏ ในงานเลี้ยงเฉลิมฉลองประจำปี มีการลอบวางยาพิษในแก้วไวน์ของรัชทายาท และจดหมายลับตราประทับเลือดที่เชื่อมโยงถึงสายลับในเงามืด...`
  }
]

export function WorldStudioView({
  macroWorldLore,
  onMacroWorldLoreChange,
  sparkText,
  onSparkChange,
  cabinetCards,
  pinnedCardIds,
  onTogglePin,
  onDeleteCabinetCard,
  onSaveCardsToCabinet,
  onEnterStage,
  onBackToHome,
}: WorldStudioViewProps) {
  // Navigation & Workspace State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeView, setActiveView] = useState<StudioActiveView>({ type: 'master' })

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
              title: 'บันไดเวทมนตร์และกฎเคอร์ฟิว',
              category: 'rule',
              content: 'บันไดเวทมนตร์ที่จะเปลี่ยนเป็นสไลเดอร์ทันทีเมื่อมีคนฝ่าฝืน พร้อมสัญญาณเตือนไปยังห้องพักผู้คุม',
              tags: ['กฎ', 'หอนอน'],
              isSavedToCabinet: false,
            }
          ],
          created_at: 1700000000000,
        }
      ],
      stageCells: [
        {
          id: 'cell_main_hall',
          title: 'ห้องโถงใหญ่และงานเลี้ยงต้อนรับ',
          description: 'โถงเพดานเวทมนตร์ฉายภาพท้องฟ้าจำลอง โต๊ะไม้ยาว 4 ตัวสำหรับแต่ละบ้าน และแสงเทียนลอยได้นับพันเล่ม',
          pinnedCardIds: [],
          created_at: 1700000000000,
        }
      ],
      cabinetCards: cabinetCards,
      pinnedCardIds: pinnedCardIds,
      created_at: 1700000000000,
    }
  ])

  const [activeWorldId, setActiveWorldId] = useState<string>('world_default')

  // Find active world safely
  const activeWorld = useMemo(() => {
    return worlds.find(w => w.id === activeWorldId) || worlds[0]
  }, [worlds, activeWorldId])

  // Google Search Dropdown state for Master Scratchpad
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // AI Operation States
  const [isSprouting, setIsSprouting] = useState(false)
  const [isExtractingSpark, setIsExtractingSpark] = useState(false)
  const [isDissectingNote, setIsDissectingNote] = useState(false)
  const [justSavedNotification, setJustSavedNotification] = useState(false)
  const [cabinetSearchQuery, setCabinetSearchQuery] = useState('')

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
    setActiveView({ type: 'master' })
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

  // 3. Sprout Branches from Master Scratchpad -> Generate Expansion Notes!
  const handleSproutFromMaster = async () => {
    if (!activeWorld.rawLore.trim() || isSprouting) return
    setIsSprouting(true)
    try {
      let res: Response
      const payload = { raw_text: activeWorld.rawLore, world_id: activeWorld.id }
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
          notes: [...prev.notes, ...newNotes]
        }))

        if (newNotes.length > 0) {
          setActiveView({ type: 'note', noteId: newNotes[0].id })
        }
      }
    } catch (e) {
      console.error('Sprout failed:', e)
    } finally {
      setIsSprouting(false)
    }
  }

  // 4. Extract The Spark from Master for this world
  const handleExtractSpark = () => {
    if (!activeWorld.rawLore.trim() || isExtractingSpark) return
    setIsExtractingSpark(true)
    setTimeout(() => {
      const sentences = activeWorld.rawLore
        .split(/[.\n]/)
        .map(s => s.trim())
        .filter(Boolean)
      const extracted = sentences.slice(0, 2).join(' ')
      if (extracted) {
        updateActiveWorld(prev => ({ ...prev, sparkText: extracted }))
        onSparkChange(extracted)
      }
      setIsExtractingSpark(false)
    }, 400)
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

  // 8. Save Child Card to Cabinet (Redis & Local World Cabinet)
  const handleSaveChildCardToCabinet = async (noteId: string, card: LoreCard) => {
    await onSaveCardsToCabinet([card])
    updateActiveWorld(prev => ({
      ...prev,
      cabinetCards: [...prev.cabinetCards.filter(c => c.id !== card.id), { ...card, isSavedToCabinet: true }],
      notes: prev.notes.map(n => {
        if (n.id === noteId) {
          return {
            ...n,
            childCards: n.childCards.map(c => c.id === card.id ? { ...c, isSavedToCabinet: true } : c)
          }
        }
        return n
      })
    }))
    setJustSavedNotification(true)
    setTimeout(() => setJustSavedNotification(false), 2000)
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

  // Active items lookup
  const currentNote = activeView.type === 'note'
    ? activeWorld.notes.find(n => n.id === activeView.noteId)
    : null

  const currentCell = activeView.type === 'cell'
    ? activeWorld.stageCells.find(c => c.id === activeView.cellId)
    : null

  // Filter cabinet cards of current world
  const currentCabinetCards = activeWorld.cabinetCards.length > 0 ? activeWorld.cabinetCards : cabinetCards
  const filteredCabinetCards = currentCabinetCards.filter(c => {
    const q = cabinetSearchQuery.trim().toLowerCase()
    if (!q) return true
    return (
      c.title.toLowerCase().includes(q) ||
      c.content.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q))
    )
  })

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

            {/* Worlds List */}
            <div className="space-y-0.5">
              {worlds.map((w) => {
                const isCurrent = w.id === activeWorld.id
                return (
                  <div
                    key={w.id}
                    onClick={() => handleSwitchWorld(w.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-left text-[12.5px] transition-all cursor-pointer flex items-center justify-between gap-1.5 group ${
                      isCurrent
                        ? 'bg-white/[0.08] text-[#F1F1F1] font-medium'
                        : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <span className="truncate flex-1">{w.title}</span>

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

            {/* Active World Sub-Items */}
            <div className="pt-0.5 pl-2 space-y-0.5 border-l border-white/[0.06] ml-2">
              <button
                type="button"
                onClick={() => setActiveView({ type: 'master' })}
                className={`w-full px-2 py-1.5 rounded-md text-left text-[12px] transition-all cursor-pointer flex items-center justify-between ${
                  activeView.type === 'master'
                    ? 'bg-white/[0.10] text-white font-medium'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <span className="truncate">เรื่องราวมหาภพ</span>
                {activeWorld.rawLore.trim() && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 shrink-0" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveView({ type: 'spark' })}
                className={`w-full px-2 py-1.5 rounded-md text-left text-[12px] transition-all cursor-pointer flex items-center justify-between ${
                  activeView.type === 'spark'
                    ? 'bg-white/[0.10] text-white font-medium'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <span className="truncate">ชนวนเหตุ</span>
                <span className="text-[10px] text-white/35">
                  {activeWorld.sparkText.trim() ? 'กำหนดแล้ว' : 'ยังไม่มี'}
                </span>
              </button>
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
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[12px] transition-all cursor-pointer flex items-center justify-between gap-1.5 group ${
                      isActive
                        ? 'bg-white/[0.08] text-[#F1F1F1] font-medium'
                        : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <span className="truncate flex-1">{note.title || 'ไม่มีชื่อ'}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteNote(note.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded transition-opacity"
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
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[12px] transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                      isActive
                        ? 'bg-white/[0.08] text-[#F1F1F1] font-medium'
                        : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <span className="truncate flex-1">{cell.title}</span>
                  </button>
                )
              })
            )}
          </div>

          {/* หมวดที่ 4: คลังการ์ด */}
          <div className="space-y-1 pt-2 border-t border-white/[0.05]">
            <button
              type="button"
              onClick={() => setActiveView({ type: 'cabinet' })}
              className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[12px] transition-all cursor-pointer flex items-center justify-between ${
                activeView.type === 'cabinet'
                  ? 'bg-white/[0.08] text-[#F1F1F1] font-medium'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <span>คลังการ์ด</span>
              <span className="text-[10px] font-mono text-white/40">
                {currentCabinetCards.length}
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
        <main className={`flex-1 overflow-y-auto px-6 py-8 flex flex-col relative ${
          activeView.type === 'master' ? 'items-center justify-center' : 'items-center justify-start'
        }`}>
          
          {/* ✦ GEMINI AMBIENT AURA: ONLY ON MASTER WELCOME SCREEN */}
          {activeView.type === 'master' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] sm:w-[950px] h-[450px] sm:h-[580px] bg-[radial-gradient(ellipse_at_center,_rgba(239,38,76,0.32)_0%,_rgba(239,38,76,0.14)_35%,_rgba(239,38,76,0.03)_65%,_transparent_75%)] blur-3xl pointer-events-none z-0 animate-in fade-in duration-300" />
          )}

          <div className={`w-full relative z-10 transition-all duration-200 ${
            activeView.type === 'master'
              ? 'max-w-xl space-y-6 -mt-8'
              : 'max-w-[860px] space-y-7 py-3'
          }`}>

            {/* Notification Toast */}
            {justSavedNotification && (
              <div className="p-2 rounded-full bg-white/[0.06] border border-white/10 text-white/80 text-[11.5px] flex items-center justify-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span>บันทึกการ์ดเข้าตู้คลังเรียบร้อยแล้ว</span>
              </div>
            )}

            {/* VIEW A: MASTER RAW SCRATCHPAD (Gemini Minimalist Canvas) */}
            {activeView.type === 'master' && (() => {
              const hasMultipleLines = activeWorld.rawLore.includes('\n') || activeWorld.rawLore.length > 60

              return (
                <div className="space-y-6 text-center animate-in fade-in duration-200">
                  
                  {/* Poetic Center Headline: Crisp with subtle shadow for high contrast */}
                  <h1 className="text-[25px] sm:text-[28px] md:text-[30px] font-normal text-[#F1F1F1] tracking-tight [text-shadow:_0_2px_14px_rgba(0,0,0,0.95),_0_0_2px_rgba(0,0,0,0.8)]">
                    ทั้งหมดนี้เป็นเรื่องราวเกี่ยวกับอะไร
                  </h1>

                  {/* Adaptive Input Box (Morphed between Single-row Pill and Multi-line Box on Shift+Enter) */}
                  <div ref={dropdownRef} className="relative text-left">
                    <div className={`transition-all duration-200 backdrop-blur-2xl bg-[#18181A]/90 border shadow-2xl ${
                      hasMultipleLines
                        ? 'rounded-3xl p-3.5 flex flex-col gap-2.5'
                        : 'h-[54px] sm:h-[58px] rounded-full px-3 flex items-center gap-2.5'
                    } ${
                      isDropdownOpen ? 'border-white/25 shadow-[0_0_30px_rgba(0,0,0,0.8)]' : 'border-white/[0.10] focus-within:border-white/20'
                    }`}>

                      {!hasMultipleLines ? (
                        /* SINGLE-ROW CAPSULE (DEFAULT INITIAL STATE) */
                        <>
                          <button
                            type="button"
                            className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.12] text-white/50 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                            title="เพิ่มรูปหรือวัตถุดิบ"
                          >
                            <Plus size={16} />
                          </button>

                          <textarea
                            ref={textareaRef}
                            rows={1}
                            value={activeWorld.rawLore}
                            onFocus={() => setIsDropdownOpen(true)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                if (activeWorld.rawLore.trim()) {
                                  handleSproutFromMaster()
                                }
                              }
                            }}
                            onChange={(e) => {
                              const val = e.target.value
                              updateActiveWorld(prev => ({ ...prev, rawLore: val }))
                              onMacroWorldLoreChange(val)
                            }}
                            placeholder="เล่าเรื่องราวในหัวของคุณออกมาได้เลย..."
                            className="flex-1 bg-transparent text-[15px] sm:text-[15.5px] text-[#F1F1F1] placeholder-white/25 focus:outline-none font-sans px-1 min-w-0 resize-none h-[24px] py-0 leading-normal"
                          />

                          <button
                            type="button"
                            className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.12] text-white/50 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                            title="ข้อความจากเสียง"
                          >
                            <Mic size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={handleSproutFromMaster}
                            disabled={!activeWorld.rawLore.trim() || isSprouting}
                            className="w-9 h-9 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white flex items-center justify-center transition-all cursor-pointer shrink-0 disabled:opacity-25 active:scale-95 shadow-md"
                            title="ส่งเพื่อแตกแขนง"
                          >
                            <ArrowUp size={16} strokeWidth={2.4} />
                          </button>
                        </>
                      ) : (
                        /* MULTI-LINE UNFOLDED BOX (WHEN EXPANDED OR SHIFT+ENTER PRESSED) */
                        <>
                          <textarea
                            ref={textareaRef}
                            rows={4}
                            value={activeWorld.rawLore}
                            onFocus={() => setIsDropdownOpen(true)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                if (activeWorld.rawLore.trim()) {
                                  handleSproutFromMaster()
                                }
                              }
                            }}
                            onChange={(e) => {
                              const val = e.target.value
                              updateActiveWorld(prev => ({ ...prev, rawLore: val }))
                              onMacroWorldLoreChange(val)
                            }}
                            placeholder="เล่าเรื่องราวในหัวของคุณออกมาได้เลย..."
                            className="w-full bg-transparent text-[14.5px] sm:text-[15px] text-[#F1F1F1] placeholder-white/25 focus:outline-none font-sans p-1 min-h-[72px] max-h-[220px] resize-none leading-relaxed"
                          />

                          {/* Bottom Row inside Multi-line Box */}
                          <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                            <button
                              type="button"
                              className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.12] text-white/50 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                              title="เพิ่มรูปหรือวัตถุดิบ"
                            >
                              <Plus size={16} />
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.12] text-white/50 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                                title="ข้อความจากเสียง"
                              >
                                <Mic size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={handleSproutFromMaster}
                                disabled={!activeWorld.rawLore.trim() || isSprouting}
                                className="w-9 h-9 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white flex items-center justify-center transition-all cursor-pointer shrink-0 disabled:opacity-25 active:scale-95 shadow-md"
                                title="ส่งเพื่อแตกแขนง"
                              >
                                <ArrowUp size={16} strokeWidth={2.4} />
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                    </div>

                    {/* Google-style Floating Dropdown */}
                    {isDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-2.5 z-40 bg-[#18181A]/95 border border-white/[0.10] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="divide-y divide-white/[0.04]">
                          {CURATED_WORLD_SEEDS.map((seed) => (
                            <div
                              key={seed.id}
                              onClick={() => {
                                updateActiveWorld(prev => ({ ...prev, rawLore: seed.lore }))
                                onMacroWorldLoreChange(seed.lore)
                                setIsDropdownOpen(false)
                                if (textareaRef.current) textareaRef.current.focus()
                              }}
                              className="px-4 py-3 hover:bg-white/[0.06] transition-all cursor-pointer flex items-start gap-3 group"
                            >
                              <Clock size={14} className="text-white/30 group-hover:text-white/70 shrink-0 mt-0.5 transition-colors" />
                              <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-medium text-[#F1F1F1] group-hover:text-white">
                                  {seed.title}
                                </div>
                                <div className="text-[11px] text-white/40 group-hover:text-white/60 truncate mt-0.5">
                                  {seed.subtitle}
                                </div>
                              </div>
                              <ChevronRight size={13} className="text-white/20 group-hover:text-white/60 shrink-0 transition-colors" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Centered Twin Pills: [ ชนวนเหตุ ] and [ แตกแขนง ] (Muted Gray Initially) */}
                  <div className="flex items-center justify-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={handleExtractSpark}
                      disabled={!activeWorld.rawLore.trim() || isExtractingSpark}
                      className={`px-4 py-1.5 rounded-full text-[12px] font-normal transition-all border ${
                        activeWorld.rawLore.trim()
                          ? 'bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.10] text-white/80 hover:text-white cursor-pointer active:scale-95 shadow-sm'
                          : 'bg-white/[0.02] border-white/[0.05] text-white/30 cursor-not-allowed select-none'
                      }`}
                    >
                      <span>{isExtractingSpark ? 'กำลังสกัด...' : 'ชนวนเหตุ'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSproutFromMaster}
                      disabled={!activeWorld.rawLore.trim() || isSprouting}
                      className={`px-4 py-1.5 rounded-full text-[12px] font-normal transition-all border ${
                        activeWorld.rawLore.trim()
                          ? 'bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.10] text-white/80 hover:text-white cursor-pointer active:scale-95 shadow-sm'
                          : 'bg-white/[0.02] border-white/[0.05] text-white/30 cursor-not-allowed select-none'
                      }`}
                    >
                      <span>{isSprouting ? 'กำลังแตกแขนง...' : 'แตกแขนง'}</span>
                    </button>
                  </div>

                </div>
              )
            })()}

            {/* VIEW B: THE INCITING SPARK */}
            {activeView.type === 'spark' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <h2 className="text-[18px] font-medium text-[#F1F1F1]">
                    ชนวนเหตุ
                  </h2>
                  <span className="text-[11px] text-white/40">
                    {activeWorld.sparkText.trim() ? 'กำหนดแล้ว' : 'ยังไม่ได้กำหนด'}
                  </span>
                </div>

                <div className="rounded-2xl p-4 bg-[#161618] border border-white/[0.08] space-y-3">
                  <textarea
                    rows={4}
                    value={activeWorld.sparkText}
                    onChange={(e) => {
                      const val = e.target.value
                      updateActiveWorld(prev => ({ ...prev, sparkText: val }))
                      onSparkChange(val)
                    }}
                    placeholder="เขียนชนวนเหตุแรกของโลกนี้..."
                    className="w-full bg-transparent text-[13.5px] text-[#F1F1F1] focus:outline-none resize-none leading-relaxed font-sans placeholder-white/20"
                  />

                  <div className="flex items-center justify-end pt-2 border-t border-white/[0.04]">
                    <button
                      type="button"
                      onClick={handleExtractSpark}
                      disabled={isExtractingSpark || !activeWorld.rawLore.trim()}
                      className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[11.5px] text-white/70 hover:text-white transition-all cursor-pointer"
                    >
                      {isExtractingSpark ? 'กำลังสกัด...' : 'สกัดอัตโนมัติ'}
                    </button>
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

                {/* In-Note Child Cards Section */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[13.5px] font-medium text-white/60">
                      การ์ดในส่วนขยาย ({currentNote.childCards.length})
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDissectCurrentNote(currentNote)}
                        disabled={isDissectingNote || !currentNote.content.trim()}
                        className="px-3 py-1 rounded-full text-[11.5px] bg-white/[0.05] hover:bg-white/[0.10] text-white/70 hover:text-white border border-white/[0.08] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
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
                            tags: ['ย่อย'],
                            isSavedToCabinet: false,
                            sourceNoteId: currentNote.id,
                          }
                          handleUpdateNote(currentNote.id, {
                            childCards: [newChild, ...currentNote.childCards]
                          })
                        }}
                        className="px-3 py-1 rounded-full text-[11.5px] bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white border border-white/[0.06] transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                      >
                        <Plus size={12} />
                        <span>เพิ่มการ์ด</span>
                      </button>
                    </div>
                  </div>

                  {currentNote.childCards.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-dashed border-white/[0.06] text-center text-white/30 text-[12px]">
                      ยังไม่มีการ์ดในส่วนขยายนี้ กดปุ่ม <span className="text-white/60">สกัดการ์ด</span> หรือ <span className="text-white/60">เพิ่มการ์ด</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                      {currentNote.childCards.map((card) => {
                        return (
                          <div
                            key={card.id}
                            className={`rounded-2xl p-5 border transition-all flex flex-col justify-between group bg-[#161618] relative min-h-[165px] ${
                              card.isSavedToCabinet
                                ? 'border-emerald-500/25 shadow-sm'
                                : 'border-white/[0.07] hover:border-white/[0.14]'
                            }`}
                          >
                            <div className="space-y-2.5 flex-1 flex flex-col">
                              {/* Top Category & Seamless Ghost Action Bar */}
                              <div className="flex items-center justify-between">
                                <span className="text-[10.5px] font-mono text-white/40 uppercase tracking-wider">
                                  {CATEGORY_NAMES[card.category] || 'ทั่วไป'}
                                </span>

                                <div className="flex items-center gap-1.5">
                                  {card.isSavedToCabinet ? (
                                    <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                                      <CheckCircle2 size={12} />
                                      <span>บันทึกแล้ว</span>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleSaveChildCardToCabinet(currentNote.id, card)}
                                      className="text-[11.5px] text-white/40 hover:text-white flex items-center gap-1 px-2.5 py-0.5 rounded-full hover:bg-white/[0.06] transition-all cursor-pointer"
                                    >
                                      <Save size={12} />
                                      <span>เซฟ</span>
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

            {/* VIEW D: STAGE CELL */}
            {activeView.type === 'cell' && currentCell && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="border-b border-white/[0.06] pb-3">
                  <h2 className="text-[18px] font-medium text-[#F1F1F1]">
                    {currentCell.title}
                  </h2>
                </div>

                <div className="rounded-2xl p-4 bg-[#161618] border border-white/[0.08] space-y-3">
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
                    className="w-full text-[14.5px] font-medium text-[#F1F1F1] bg-transparent border-b border-white/[0.06] pb-1.5 focus:outline-none"
                  />

                  <textarea
                    rows={3}
                    value={currentCell.description}
                    onChange={(e) => {
                      const newDesc = e.target.value
                      updateActiveWorld(prev => ({
                        ...prev,
                        stageCells: prev.stageCells.map(c => c.id === currentCell.id ? { ...c, description: newDesc } : c)
                      }))
                    }}
                    placeholder="บรรยายบรรยากาศของสถานที่นี้..."
                    className="w-full text-[12.5px] text-white/70 bg-transparent focus:outline-none resize-none leading-relaxed font-sans"
                  />
                </div>

                {/* Linked Cards */}
                <div className="space-y-2">
                  <div className="text-[12.5px] text-white/50 flex items-center gap-1.5">
                    <Share2 size={12} />
                    <span>การ์ดที่ผูกกับสถานที่นี้:</span>
                  </div>

                  {currentCabinetCards.length === 0 ? (
                    <div className="p-4 rounded-xl border border-white/[0.05] text-center text-white/30 text-[11px]">
                      ยังไม่มีการ์ดในคลังให้ผูก
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentCabinetCards.map(card => {
                        const isLinked = currentCell.pinnedCardIds.includes(card.id)
                        return (
                          <div
                            key={card.id}
                            onClick={() => handleToggleCellCard(currentCell.id, card.id)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-[11.5px] ${
                              isLinked
                                ? 'bg-white/[0.08] border-white/20 text-white'
                                : 'bg-[#161618] border-white/[0.06] text-white/50 hover:text-white'
                            }`}
                          >
                            <span className="truncate">{card.title}</span>
                            <span className="text-[9.5px] text-white/40">
                              {isLinked ? 'ผูกแล้ว' : '+'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW E: CABINET */}
            {activeView.type === 'cabinet' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <h2 className="text-[18px] font-medium text-[#F1F1F1]">
                    คลังการ์ด
                  </h2>

                  <div className="relative w-40">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={cabinetSearchQuery}
                      onChange={(e) => setCabinetSearchQuery(e.target.value)}
                      placeholder="ค้นหา..."
                      className="w-full pl-7 pr-2.5 py-1 text-[11px] bg-black/25 border border-white/[0.06] rounded-full text-white focus:outline-none"
                    />
                  </div>
                </div>

                {filteredCabinetCards.length === 0 ? (
                  <div className="py-12 text-center text-white/30 text-[12px]">
                    ยังไม่มีการ์ดในคลัง
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {filteredCabinetCards.map(card => {
                      const isPinned = activeWorld.pinnedCardIds.includes(card.id)
                      return (
                        <div
                          key={card.id}
                          className={`rounded-xl p-3 border transition-all flex flex-col gap-1.5 bg-[#161618] ${
                            isPinned ? 'border-white/25' : 'border-white/[0.06]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9.5px] font-mono text-white/40">
                              {CATEGORY_NAMES[card.category] || 'ทั่วไป'}
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  onTogglePin(card.id)
                                  updateActiveWorld(prev => ({
                                    ...prev,
                                    pinnedCardIds: prev.pinnedCardIds.includes(card.id)
                                      ? prev.pinnedCardIds.filter(id => id !== card.id)
                                      : [...prev.pinnedCardIds, card.id]
                                  }))
                                }}
                                className={`p-1 rounded cursor-pointer ${
                                  isPinned ? 'text-white' : 'text-white/25 hover:text-white'
                                }`}
                                title="ปักหมุด"
                              >
                                <Pin size={11} className={isPinned ? 'fill-white' : ''} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteCabinetCard(card.id)
                                  updateActiveWorld(prev => ({
                                    ...prev,
                                    cabinetCards: prev.cabinetCards.filter(c => c.id !== card.id)
                                  }))
                                }}
                                className="p-1 rounded text-white/20 hover:text-rose-400 cursor-pointer"
                                title="ลบออก"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>

                          <div className="text-[12.5px] font-medium text-[#F1F1F1]">
                            {card.title}
                          </div>

                          <div className="text-[11px] text-white/50 line-clamp-2 leading-relaxed">
                            {card.content}
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
