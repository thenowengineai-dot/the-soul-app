import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import {
  Plus,
  PanelLeft,
  CheckCircle2,
  X,
  FileCode2,
} from 'lucide-react'
import type {
  LoreCard,
  ExpansionNote,
  StageCellItem,
  WorldWorkspace,
  StageCellGenerateResponse,
  WorldCharacterCard,
} from '../types'
import { WELCOME_STORY_PRESETS, createInitialWorlds } from './world-studio/presets'
import { StudioStageCellView } from './world-studio/views/StudioStageCellView'
import { StudioCabinetView } from './world-studio/views/StudioCabinetView'
import { StudioSidebar } from './world-studio/views/StudioSidebar'
import { StudioWelcomeView } from './world-studio/views/StudioWelcomeView'
import { StudioNoteView } from './world-studio/views/StudioNoteView'
import { StudioMasterView } from './world-studio/views/StudioMasterView'
import { StudioDashboardView } from './world-studio/views/StudioDashboardView'
import { StudioPromptInspectorModal } from './world-studio/views/StudioPromptInspectorModal'
import type { StudioActiveView } from './world-studio/types'

function getStudioUserId(): string {
  if (typeof window === 'undefined') return 'guest_studio_user'
  let uid =
    localStorage.getItem('the_soul_user_id') ||
    localStorage.getItem('the_soul_guest_id') ||
    localStorage.getItem('the_soul_studio_user_id')
  if (!uid) {
    uid = `gst_studio_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    localStorage.setItem('the_soul_studio_user_id', uid)
  }
  return uid
}

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
  onSelectCharacterForStage?: (character: WorldCharacterCard) => void
}

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
  onSelectCharacterForStage,
}: WorldStudioViewProps) {

  // Identity & Neon Database Cloud Sync State
  const studioUserId = useMemo(() => getStudioUserId(), [])
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'saved' | 'saving' | 'offline'>('saved')
  const isInitialLoadDone = useRef(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
  const [worlds, setWorlds] = useState<WorldWorkspace[]>(() =>
    createInitialWorlds(macroWorldLore, sparkText, cabinetCards, pinnedCardIds)
  )

  const [activeWorldId, setActiveWorldId] = useState<string>('world_default')
  // Welcome Gate Clean Slate Draft (Gemini-style: draft only, lazy creation on intent)
  const [welcomeDraftLore, setWelcomeDraftLore] = useState('')
  // Find active world safely
  const activeWorld = useMemo(() => {
    return worlds.find(w => w.id === activeWorldId) || worlds[0]
  }, [worlds, activeWorldId])

  // =========================================================================
  // 1. NEON DATABASE HYDRATION ON MOUNT
  // =========================================================================
  useEffect(() => {
    let isCancelled = false
    const loadWorkspaces = async () => {
      try {
        let res: Response | null = null
        try {
          res = await fetch(`http://localhost:8000/api/sandbox/world/workspaces?user_id=${studioUserId}`)
        } catch {
          res = await fetch(`https://the-soul-backend-330377476882.asia-southeast1.run.app/api/sandbox/world/workspaces?user_id=${studioUserId}`)
        }
        if (res && res.ok) {
          const data = await res.json()
          if (!isCancelled && data.workspaces && Array.isArray(data.workspaces) && data.workspaces.length > 0) {
            setWorlds(data.workspaces)
            setActiveWorldId(data.workspaces[0].id)
            setCloudSyncStatus('saved')
            try {
              localStorage.setItem('the_soul_studio_workspaces', JSON.stringify(data.workspaces))
            } catch {}
            isInitialLoadDone.current = true
            return
          }
        }
      } catch {
        // Fallback to local storage if API is unreachable
        try {
          const localSaved = localStorage.getItem('the_soul_studio_workspaces')
          if (localSaved) {
            const parsed = JSON.parse(localSaved)
            if (Array.isArray(parsed) && parsed.length > 0 && !isCancelled) {
              setWorlds(parsed)
              setActiveWorldId(parsed[0].id)
              setCloudSyncStatus('offline')
              isInitialLoadDone.current = true
              return
            }
          }
        } catch {}
      }
      isInitialLoadDone.current = true
    }
    loadWorkspaces()
    return () => {
      isCancelled = true
    }
  }, [studioUserId])

  // =========================================================================
  // 2. ATOMIC SAVE TO NEON POSTGRESQL (UPSERT)
  // =========================================================================
  const saveWorldToDatabase = useCallback(async (workspaceToSave: WorldWorkspace) => {
    setCloudSyncStatus('saving')
    try {
      const payload = {
        user_id: studioUserId,
        workspace: workspaceToSave,
      }
      let res: Response | null = null
      try {
        res = await fetch('http://localhost:8000/api/sandbox/world/workspaces/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch {
        res = await fetch('https://the-soul-backend-330377476882.asia-southeast1.run.app/api/sandbox/world/workspaces/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      if (res && res.ok) {
        setCloudSyncStatus('saved')
      } else {
        setCloudSyncStatus('offline')
      }
    } catch {
      setCloudSyncStatus('offline')
    }

    try {
      setWorlds(currentWorlds => {
        const updated = currentWorlds.map(w => (w.id === workspaceToSave.id ? workspaceToSave : w))
        localStorage.setItem('the_soul_studio_workspaces', JSON.stringify(updated))
        return currentWorlds
      })
    } catch {}
  }, [studioUserId])

  // Debounced auto-save on activeWorld changes
  useEffect(() => {
    if (!isInitialLoadDone.current) return
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    setCloudSyncStatus('saving')
    saveTimeoutRef.current = setTimeout(() => {
      saveWorldToDatabase(activeWorld)
    }, 1200)
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [activeWorld, saveWorldToDatabase])

  // Delete World from Neon DB & State
  const handleDeleteWorld = async (worldId: string) => {
    const remaining = worlds.filter(x => x.id !== worldId)
    setWorlds(remaining)
    if (activeWorldId === worldId) {
      if (remaining[0]) {
        handleSwitchWorld(remaining[0].id)
      } else {
        setActiveView({ type: 'welcome' })
      }
    }
    try {
      localStorage.setItem('the_soul_studio_workspaces', JSON.stringify(remaining))
    } catch {}

    try {
      let res: Response | null = null
      try {
        res = await fetch(`http://localhost:8000/api/sandbox/world/workspaces/${worldId}?user_id=${studioUserId}`, {
          method: 'DELETE',
        })
      } catch {
        res = await fetch(`https://the-soul-backend-330377476882.asia-southeast1.run.app/api/sandbox/world/workspaces/${worldId}?user_id=${studioUserId}`, {
          method: 'DELETE',
        })
      }
      if (res?.ok) {
        setCloudSyncStatus('saved')
      }
    } catch (e) {
      console.warn('Error deleting world from Neon DB:', e)
    }
  }

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
  }, [welcomeDraftLore, activeView.type])

  // AI Operation States
  const [isSprouting, setIsSprouting] = useState(false)
  const [isExtractingSpark, setIsExtractingSpark] = useState(false)
  const [isForgingCharacter, setIsForgingCharacter] = useState(false)
  const [isSparkPlayerEdited, setIsSparkPlayerEdited] = useState(false)
  const [sparkHistory, setSparkHistory] = useState<string[]>([])
  const [generatingNoteId, setGeneratingNoteId] = useState<string | null>(null)
  const [savingNoteToCabinetId, setSavingNoteToCabinetId] = useState<string | null>(null)
  const [sproutingBlockId, setSproutingBlockId] = useState<string | null>(null)
  const [isDissectingNote, setIsDissectingNote] = useState(false)
  const [isAutoLinking, setIsAutoLinking] = useState(false)
  const [isGeneratingCell5D, setIsGeneratingCell5D] = useState(false)
  const [editingCellOutputId, setEditingCellOutputId] = useState<string | null>(null)
  const [copiedCellId, setCopiedCellId] = useState<string | null>(null)
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
    setActiveView({ type: 'dashboard' })
  }

  // 2b. Character Operations (World Character Forge Engine)
  const handleForgeCharacter = async (brief: string) => {
    if (!brief.trim() || isForgingCharacter) return
    setIsForgingCharacter(true)
    try {
      const payload = {
        world_lore: combinedWorldLore || activeWorld.rawLore,
        spark_text: activeWorld.sparkText,
        player_brief: brief.trim(),
        world_id: activeWorld.id,
      }
      let res: Response
      try {
        res = await fetch('http://localhost:8000/api/sandbox/world/forge-character', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch {
        res = await fetch('https://the-soul-backend-330377476882.asia-southeast1.run.app/api/sandbox/world/forge-character', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (res.ok) {
        const data = await res.json()
        const c = data.character
        const newChar: WorldCharacterCard = {
          id: c.id,
          name: c.name,
          roleTagline: c.role_tagline,
          playerBrief: c.player_brief,
          appearanceAndCharm: c.appearance_and_charm,
          matchedArchetypeId: c.matched_archetype_id,
          matchedArchetypeLabel: c.matched_archetype_label,
          coreWound: c.core_wound,
          hiddenCore: c.hidden_core,
          theMask: c.the_mask,
          bodyTells: c.body_tells,
          keystoneTether: c.keystone_tether,
          faultLine: c.fault_line,
          polarInversion: c.polar_inversion,
          created_at: c.created_at || Date.now(),
        }

        updateActiveWorld(prev => {
          const nextWs = {
            ...prev,
            characters: [...(prev.characters || []).filter(item => item.id !== newChar.id), newChar],
            activeCharacterId: newChar.id,
          }
          saveWorldToDatabase(nextWs)
          return nextWs
        })

        setNotificationMessage(`หล่อหลอมตัวละคร "${newChar.name}" สำเร็จ`)
        setJustSavedNotification(true)
        setTimeout(() => setJustSavedNotification(false), 2000)
      } else {
        setNotificationMessage('ไม่สามารถสร้างตัวละครได้ กรุณาลองใหม่อีกครั้ง')
        setJustSavedNotification(true)
        setTimeout(() => setJustSavedNotification(false), 2000)
      }
    } catch (err) {
      console.error('[FORGE_CHAR] Error:', err)
    } finally {
      setIsForgingCharacter(false)
    }
  }

  const handleUpdateCharacter = (characterId: string, updates: Partial<WorldCharacterCard>) => {
    updateActiveWorld(prev => ({
      ...prev,
      characters: (prev.characters || []).map(c => c.id === characterId ? { ...c, ...updates } : c),
    }))
  }

  const handleDeleteCharacter = (characterId: string) => {
    updateActiveWorld(prev => {
      const remaining = (prev.characters || []).filter(c => c.id !== characterId)
      return {
        ...prev,
        characters: remaining,
        activeCharacterId: remaining[0]?.id,
      }
    })
    setNotificationMessage('ลบตัวละครเรียบร้อยแล้ว')
    setJustSavedNotification(true)
    setTimeout(() => setJustSavedNotification(false), 2000)
  }

  const handleSelectCharacter = (characterId: string) => {
    updateActiveWorld(prev => ({
      ...prev,
      activeCharacterId: characterId,
    }))
  }

  const handleSendCharacterToStage = (character: WorldCharacterCard) => {
    if (onSelectCharacterForStage) {
      onSelectCharacterForStage(character)
    } else {
      onEnterStage()
    }
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

  // 6. Add New Stage Cell in this world (Clean initial state for player input)
  const handleAddNewStageCell = () => {
    const cellId = `cell_manual_${activeWorld.stageCells.length + 1}_${activeWorld.id}`
    const newCell: StageCellItem = {
      id: cellId,
      title: '',
      inputBrief: '',
      description: '',
      pinnedCardIds: [],
      created_at: 1700000000000 + activeWorld.stageCells.length,
    }
    updateActiveWorld(prev => ({
      ...prev,
      stageCells: [newCell, ...prev.stageCells]
    }))
    setActiveView({ type: 'cell', cellId: newCell.id })
  }

  // 6b. Delete Stage Cell
  const handleDeleteStageCell = (cellId: string) => {
    updateActiveWorld(prev => ({
      ...prev,
      stageCells: prev.stageCells.filter(c => c.id !== cellId),
    }))
    setActiveView({ type: 'master' })
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

  // Generate 5D Stage Cell with 3-ingredient arbitration (Scenographer Engine)
  const handleGenerateCell5D = async (cell: StageCellItem) => {
    if (isGeneratingCell5D) return
    setIsGeneratingCell5D(true)

    // 1. Dual-mode background auto-linking:
    // If user hasn't pinned any cards manually, automatically discover and link relevant cards behind the scenes!
    let activePinnedIds = [...cell.pinnedCardIds]
    if (activePinnedIds.length === 0 && allAvailableCardsForCell.length > 0) {
      const queryText = `${cell.title || ''} ${cell.inputBrief || cell.description || ''} ${activeWorld.rawLore || ''}`.toLowerCase()
      const scored = allAvailableCardsForCell.map(c => {
        const titleWords = c.title.toLowerCase().split(/\s+/).filter(w => w.length > 1)
        const titleScore = titleWords.reduce((acc, w) => acc + (queryText.includes(w) ? 3.5 : 0), 0)
        const tags = c.tags || []
        const tagScore = tags.reduce((acc, t) => {
          const clean = t.toLowerCase().replace(/^#+/, '')
          return acc + (clean && queryText.includes(clean) ? 2.5 : 0)
        }, 0)
        const contentWords = (c.content || '').toLowerCase().slice(0, 300).split(/\s+/).filter(w => w.length > 2)
        const contentScore = contentWords.reduce((acc, w) => acc + (queryText.includes(w) ? 1.0 : 0), 0)
        return { id: c.id, score: titleScore + tagScore + contentScore }
      })
      scored.sort((a, b) => b.score - a.score)
      const topLinked = scored.filter(s => s.score > 0).slice(0, 4).map(s => s.id)
      if (topLinked.length > 0) {
        activePinnedIds = topLinked
      }
    }

    // Preserve the user's typed brief intact
    const rawBrief = (cell.inputBrief?.trim() || cell.description?.trim() || cell.title || '').trim()
    const promptText = rawBrief || 'สถานที่ในโลกจินตนาการ'

    // Gather pinned cards full objects
    const pinnedCardsData = activePinnedIds
      .map(id => allAvailableCardsForCell.find(c => c.id === id))
      .filter((c): c is LoreCard => Boolean(c))
      .map(c => ({
        id: c.id,
        title: c.title,
        content: c.content,
        tags: c.tags || [],
      }))

    const payload: GenerateStageCellPayload = {
      prompt: promptText,
      world_context: activeWorld.rawLore.trim(),
      pinned_cards: pinnedCardsData,
      existing_spark: activeWorld.sparkText?.trim() || undefined,
    }

    try {
      let res: Response
      try {
        res = await fetch('http://localhost:8000/api/sandbox/stage/cell', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Local backend returned non-200, switching to Cloud Run')
      } catch {
        res = await fetch('https://the-soul-backend-330377476882.asia-southeast1.run.app/api/sandbox/stage/cell', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (res.ok) {
        const data: StageCellGenerateResponse = await res.json()
        if (data.raw_text && data.raw_text.trim()) {
          updateActiveWorld(prev => ({
            ...prev,
            stageCells: prev.stageCells.map(c =>
              c.id === cell.id
                ? {
                    ...c,
                    inputBrief: c.inputBrief || rawBrief,
                    description: data.raw_text.trim(),
                    pinnedCardIds: activePinnedIds,
                  }
                : c
            ),
          }))
          setNotificationMessage(`✨ รังสรรค์สถานที่ 5 มิติสำเร็จ (${data.latency_ms}ms)`)
          setJustSavedNotification(true)
          setTimeout(() => setJustSavedNotification(false), 2400)
          setIsGeneratingCell5D(false)
          return
        }
      }
    } catch (err) {
      console.warn('Backend stage cell generation error, using master scenographer fallback:', err)
    }

    // High-fidelity fallback when offline or local backend is cold
    const cardReferences = pinnedCardsData.length > 0
      ? ` ผสานองค์ประกอบจาก ${pinnedCardsData.map(p => `[${p.title}]`).join(', ')}`
      : ''

    const locationName = cell.title.trim() || 'สถานที่แห่งนี้'

    const fallback5D = `### 1. [THRESHOLD & ARRIVAL: ธรณีประตูและทางเข้า]
ทางเดินทอดยาวเลียบสู่ ${locationName} จุดเปลี่ยนผ่านทางเข้าเปิดโล่งรับไออากาศเฉพาะตัว สัมผัสแรกของฝ่าเท้าและเสียงสะท้อนบอกชัดว่าคุณได้ก้าวข้ามผ่านเข้าสู่พื้นที่อันเป็นเอกลักษณ์ของโลกใบนี้แล้ว

---

### 2. [SPATIAL VOLUME & VERTICALITY: มิติ ปริมาตร และความสูงต่ำของพื้นที่]
พื้นที่ของ ${locationName} มีมิติสเกลที่น่าทึ่ง การแบ่งชั้นความสูงต่ำและโครงสร้างสถาปัตยกรรมเปิดมุมมองสายตาให้เห็นความลึกซึ้งของฉาก${cardReferences}

---

### 3. [LIGHT DRAMATURGY & PARTICLES: การทอดแสง ฝุ่นละออง และมุมมืด]
ทิศทางแสงสาดส่องตัดเฉียงผ่านพื้นที่ ย้อมบรรยากาศให้มีอารมณ์เฉพาะตัว ในอากาศมีละอองอนุภาคที่มีชีวิตลอยเคว้งช้าๆ มีทั้งจุดที่สว่างจ้าเน้นสรีระ และเงามัวอบอุ่นสำหรับใช้หลบสายตา

---

### 4. [LIVING TACTILITY, SCENT & SOUNDSCAPE: พร็อพที่มีชีวิต กลิ่นสัมผัส และเสียงสะท้อน]
กลิ่นอายบรรยากาศเฉพาะตัวแตะประสาทสัมผัส เสียงแวดล้อมที่เกิดขึ้นสะท้อนกังวานในความเงียบ ใต้ฝ่ามือคือความเรียบสากของพื้นผิวสัมผัสจริงที่มีน้ำหนักและอุณหภูมิ

---

### 5. [POWER ANCHOR & STAGING: จุดปักหลักแห่งอำนาจและตำแหน่งของตัวละคร]
จุดปักหลักทางกายภาพของ ${locationName} ตัวละครยืนหรือนั่งในตำแหน่งที่มีเสน่ห์ สบสายตากับคุณในระยะที่พอเหมาะ มือสัมผัสพร็อพชิ้นสำคัญ ดึงดูดให้คุณก้าวเข้าไปมีปฏิสัมพันธ์ร่วมกันอย่างเป็นธรรมชาติ`

    updateActiveWorld(prev => ({
      ...prev,
      stageCells: prev.stageCells.map(c =>
        c.id === cell.id
          ? {
              ...c,
              inputBrief: c.inputBrief || rawBrief,
              description: fallback5D.trim(),
              pinnedCardIds: activePinnedIds,
            }
          : c
      ),
    }))
    setNotificationMessage('✨ รังสรรค์สถานที่ 5 มิติสำเร็จ')
    setJustSavedNotification(true)
    setTimeout(() => setJustSavedNotification(false), 2400)
    setIsGeneratingCell5D(false)
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

  return (
    <div className="w-full h-screen flex bg-[#0B0B0C] text-[#F1F1F1] select-none overflow-hidden font-['Thonburi',_'Sukhumvit_Set',_-apple-system,BlinkMacSystemFont,sans-serif]">

      {/* ========================================================================= */}
      {/* LEFT NOTION/GEMINI SIDEBAR: CLEAN MONOCHROME, NO EMOJIS                   */}
      {/* ========================================================================= */}
      <StudioSidebar
        isSidebarOpen={isSidebarOpen}
        onCloseSidebar={() => setIsSidebarOpen(false)}
        onBackToHome={onBackToHome}
        onEnterStage={onEnterStage}
        onOpenWelcome={() => {
          setWelcomeDraftLore('')
          setIsWelcomeDropdownOpen(false)
          setActiveView({ type: 'welcome' })
        }}
        worlds={worlds}
        activeWorldId={activeWorld.id}
        activeView={activeView}
        savedCabinetCardsCount={savedCabinetCards.length}
        onAddNewWorld={handleAddNewWorld}
        onSwitchWorld={(worldId) => {
          handleSwitchWorld(worldId)
          setActiveView({ type: 'dashboard' })
        }}
        onDeleteWorld={handleDeleteWorld}
        onSelectDashboard={() => setActiveView({ type: 'dashboard' })}
        onSelectMaster={() => setActiveView({ type: 'master' })}
        onAddNewNote={() => handleAddNewNote()}
        onSelectNote={(noteId) => setActiveView({ type: 'note', noteId })}
        onDeleteNote={(noteId) => handleDeleteNote(noteId)}
        onAddNewStageCell={handleAddNewStageCell}
        onSelectStageCell={(cellId) => setActiveView({ type: 'cell', cellId })}
        onDeleteStageCell={(cellId) => handleDeleteStageCell(cellId)}
        onSelectCabinet={() => setActiveView({ type: 'cabinet' })}
      />

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
            {/* Neon Cloud Sync Status Badge */}
            <div
              className={`h-7 px-2.5 rounded-full border text-[11px] font-sans flex items-center gap-1.5 transition-all select-none ${
                cloudSyncStatus === 'saved'
                  ? 'bg-emerald-500/[0.08] border-emerald-500/25 text-emerald-300/80'
                  : cloudSyncStatus === 'saving'
                  ? 'bg-amber-500/[0.08] border-amber-500/25 text-amber-300/80 animate-pulse'
                  : 'bg-white/[0.04] border-white/10 text-white/40'
              }`}
              title={
                cloudSyncStatus === 'saved'
                  ? 'บันทึกข้อมูลโลกทั้งหมดลง Neon PostgreSQL เรียบร้อยแล้ว'
                  : cloudSyncStatus === 'saving'
                  ? 'กำลังซิงก์ข้อมูลลงฐานข้อมูล...'
                  : 'บันทึกในหน่วยความจำเครื่อง (ออฟไลน์)'
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  cloudSyncStatus === 'saved'
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : cloudSyncStatus === 'saving'
                    ? 'bg-amber-400'
                    : 'bg-white/30'
                }`}
              />
              <span>
                {cloudSyncStatus === 'saved'
                  ? 'บันทึกแล้ว'
                  : cloudSyncStatus === 'saving'
                  ? 'กำลังบันทึก...'
                  : 'ออฟไลน์'}
              </span>
            </div>

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
              <StudioWelcomeView
                welcomeDraftLore={welcomeDraftLore}
                setWelcomeDraftLore={setWelcomeDraftLore}
                welcomeTextareaRef={welcomeTextareaRef}
                welcomeCardContainerRef={welcomeCardContainerRef}
                isInitialBounce={isInitialBounce}
                isExtractingSpark={isExtractingSpark}
                isSprouting={isSprouting}
                isWelcomeDropdownOpen={isWelcomeDropdownOpen}
                setIsWelcomeDropdownOpen={setIsWelcomeDropdownOpen}
                showSparkCard={showSparkCard}
                showExpansionsCard={showExpansionsCard}
                presets={WELCOME_STORY_PRESETS}
                onSelectPreset={handleSelectWelcomePreset}
                onCreateWorldAndExtractSpark={() => {
                  if (welcomeDraftLore.trim()) {
                    const created = handleCreateWorldFromWelcome(welcomeDraftLore)
                    if (created) {
                      handleExtractSpark('extract', created.rawLore, created.id)
                    }
                  }
                }}
                onCreateWorldAndSprout={() => {
                  if (welcomeDraftLore.trim()) {
                    const created = handleCreateWorldFromWelcome(welcomeDraftLore)
                    if (created) {
                      handleGenerateWorldGenesis(created.rawLore, 'initial', created.id)
                    }
                  } else {
                    welcomeTextareaRef.current?.focus()
                  }
                }}
                onManualAddSpark={() => {
                  if (welcomeDraftLore.trim()) {
                    handleCreateWorldFromWelcome(welcomeDraftLore)
                  }
                  handleManualAddSpark()
                }}
                onManualAddNote={() => {
                  if (welcomeDraftLore.trim()) {
                    handleCreateWorldFromWelcome(welcomeDraftLore)
                  }
                  handleAddNewNote(true)
                  setActiveView({ type: 'master' })
                }}
              />
            )}

            {/* VIEW 0: WORLD READINESS DASHBOARD & CHARACTER FORGE */}
            {activeView.type === 'dashboard' && (
              <StudioDashboardView
                activeWorld={activeWorld}
                isForgingCharacter={isForgingCharacter}
                onForgeCharacter={handleForgeCharacter}
                onUpdateCharacter={handleUpdateCharacter}
                onDeleteCharacter={handleDeleteCharacter}
                onSelectCharacter={handleSelectCharacter}
                onSendCharacterToStage={handleSendCharacterToStage}
                setActiveView={setActiveView}
                onAddNewStageCell={handleAddNewStageCell}
              />
            )}

            {/* VIEW A: MASTER UNIBODY CANVAS & CARMINE CIRCUIT FLOW */}
            {activeView.type === 'master' && (
              <StudioMasterView
                activeWorld={activeWorld}
                updateActiveWorld={updateActiveWorld}
                onMacroWorldLoreChange={onMacroWorldLoreChange}
                onSparkChange={onSparkChange}
                combinedWorldLore={combinedWorldLore}
                showSparkCard={showSparkCard}
                showExpansionsCard={showExpansionsCard}
                isExtractingSpark={isExtractingSpark}
                isSprouting={isSprouting}
                isSparkDraftOpen={isSparkDraftOpen}
                setIsSparkDraftOpen={setIsSparkDraftOpen}
                isSparkPlayerEdited={isSparkPlayerEdited}
                setIsSparkPlayerEdited={setIsSparkPlayerEdited}
                sproutingBlockId={sproutingBlockId}
                generatingNoteId={generatingNoteId}
                handleExtractSparkOnly={handleExtractSparkOnly}
                handleGenerateWorldGenesis={handleGenerateWorldGenesis}
                handleExtractSpark={handleExtractSpark}
                handleSproutFromLoreBlock={handleSproutFromLoreBlock}
                handleAddExtraLoreBlock={handleAddExtraLoreBlock}
                handleUpdateExtraLoreBlock={handleUpdateExtraLoreBlock}
                handleDeleteExtraLoreBlock={handleDeleteExtraLoreBlock}
                handleAddNewNote={handleAddNewNote}
                handleUpdateNote={handleUpdateNote}
                handleGenerateNoteContentFromTitle={handleGenerateNoteContentFromTitle}
                setActiveView={setActiveView}
              />
            )}

            {/* VIEW C: EXPANSION NOTE (Apple Notes / Notion Markdown Canvas) */}
            {activeView.type === 'note' && currentNote && (
              <StudioNoteView
                currentNote={currentNote}
                generatingNoteId={generatingNoteId}
                isDissectingNote={isDissectingNote}
                savingNoteToCabinetId={savingNoteToCabinetId}
                activeTagPopoverCardId={activeTagPopoverCardId}
                combinedWorldLore={combinedWorldLore}
                renderCardTags={renderCardTags}
                handleUpdateNote={handleUpdateNote}
                handleDeleteNote={handleDeleteNote}
                handleGenerateNoteContentFromTitle={handleGenerateNoteContentFromTitle}
                handleToggleNoteCabinetSaveState={handleToggleNoteCabinetSaveState}
                handleDissectCurrentNote={handleDissectCurrentNote}
                handleDeleteChildCard={handleDeleteChildCard}
                handleToggleChildCardSaveState={handleToggleChildCardSaveState}
              />
            )}

            {/* VIEW D: STAGE CELL (Location / Architecture Surface: Twin-Card Architecture) */}
            {activeView.type === 'cell' && currentCell && (
              <StudioStageCellView
                cell={currentCell}
                allAvailableCardsForCell={allAvailableCardsForCell}
                isGeneratingCell5D={isGeneratingCell5D}
                isAutoLinking={isAutoLinking}
                editingCellOutputId={editingCellOutputId}
                copiedCellId={copiedCellId}
                onUpdateTitle={(title) => {
                  updateActiveWorld(prev => ({
                    ...prev,
                    stageCells: prev.stageCells.map(c => c.id === currentCell.id ? { ...c, title } : c)
                  }))
                }}
                onUpdateInputBrief={(inputBrief) => {
                  updateActiveWorld(prev => ({
                    ...prev,
                    stageCells: prev.stageCells.map(c => c.id === currentCell.id ? { ...c, inputBrief } : c)
                  }))
                }}
                onUpdateDescription={(description) => {
                  updateActiveWorld(prev => ({
                    ...prev,
                    stageCells: prev.stageCells.map(c => c.id === currentCell.id ? { ...c, description } : c)
                  }))
                }}
                onDeleteCell={() => handleDeleteStageCell(currentCell.id)}
                onToggleCellCard={(cardId) => handleToggleCellCard(currentCell.id, cardId)}
                onClearAllCellCards={() => handleClearAllCellCards(currentCell.id)}
                onAutoStageCards={() => handleAutoStageCards(currentCell)}
                onGenerateCell5D={() => handleGenerateCell5D(currentCell)}
                onToggleEditMode={() => setEditingCellOutputId(prev => prev === currentCell.id ? null : currentCell.id)}
                onCopyDescription={() => {
                  if (currentCell.description) {
                    navigator.clipboard.writeText(currentCell.description)
                    setCopiedCellId(currentCell.id)
                    setTimeout(() => setCopiedCellId(null), 2000)
                  }
                }}
                onEnterStage={() => {
                  if (onSelectStageCell) {
                    onSelectStageCell(currentCell)
                  } else {
                    onEnterStage()
                  }
                }}
              />
            )}

            {/* VIEW E: CABINET (SAVED CARDS REPOSITORY) */}
            {activeView.type === 'cabinet' && (
              <StudioCabinetView
                savedCabinetCardsCount={savedCabinetCards.length}
                filteredCabinetCards={filteredCabinetCards}
                cabinetSearchQuery={cabinetSearchQuery}
                onSearchChange={setCabinetSearchQuery}
                activeTagPopoverCardId={activeTagPopoverCardId}
                renderCardTags={renderCardTags}
                onToggleChildCardSaveState={handleToggleChildCardSaveState}
                handleDeleteCardFromCabinetView={handleDeleteCardFromCabinetView}
                handleUpdateCardEverywhere={handleUpdateCardEverywhere}
              />
            )}

          </div>
        </main>

      </div>

      {/* ======================================================================= */}
      {/* WORLD PROMPT INSPECTOR (MODAL / OVERLAY)                               */}
      {/* ======================================================================= */}
      <StudioPromptInspectorModal
        isOpen={isPromptInspectorOpen}
        onClose={() => setIsPromptInspectorOpen(false)}
        activeWorld={activeWorld}
        combinedWorldLore={combinedWorldLore}
        savedCabinetCards={savedCabinetCards}
        currentCell={currentCell}
        currentNote={currentNote}
        isSparkPlayerEdited={isSparkPlayerEdited}
        sparkHistory={sparkHistory}
      />
    </div>
  )
}

export default WorldStudioView
