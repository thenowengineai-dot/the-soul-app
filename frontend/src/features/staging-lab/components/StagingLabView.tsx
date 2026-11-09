import { useState, useMemo, useEffect, useRef } from 'react'
import {
  X,
  Copy,
  Check,
  FileCode2,
  Info,
  ArrowLeft
} from 'lucide-react'
import {
  DEFAULT_BASE_PROMPT,
  DEFAULT_TELEMETRY_SCHEMA_PROMPT,
  CARD1_TELEMETRY_SCHEMA_PROMPT,
  CARD2_TELEMETRY_SCHEMA_PROMPT
} from '../defaultPrompt'
import { INITIAL_FEATURE_MODULES } from '../mockPresets'
import {
  type SpatialSpacing,
  generatePhysicalParryBrief,
  generateDesirePromptSnippet
} from '../modules/physicalParryModule'
import {
  generateKineticPacingPrompt,
  STANCE_PRESETS
} from '../modules/kineticContinuityModule'
import type {
  PromptModule,
  SandboxSimulateResponse,
  SandboxSimulateRequest,
  LoreCard,
  WorldCharacterCard,
  CharacterSkinBlueprint,
} from '../types'
import { MessageList } from '../../chat/components/chat-room/MessageList'
import { ChatInputBar } from '../../chat/components/chat-room/ChatInputBar'
import type { ChatMessage } from '../../chat/types'
import { CharacterStateCard } from './CharacterStateCard'
import { StageControllerCard } from './StageControllerCard'
import { KineticContinuityCard } from './KineticContinuityCard'
import { PersonaArchetypeCard } from './PersonaArchetypeCard'
import { MagmaCoreCard } from './MagmaCoreCard'
import { RelationshipCard } from './RelationshipCard'
import {
  type PersonaArchetype,
  CANONICAL_PERSONA_PRESETS,
  generatePersonaPromptSnippet
} from '../modules/personaArchetypeModule'
import {
  type MagmaCoreConfig,
  ARCHETYPE_MAGMA_DEFAULTS,
  generateMagmaCorePromptSnippet,
  getMagmaPhaseMeta
} from '../modules/magmaCoreModule'
import {
  type RelationshipConfig,
  generateRelationshipPromptSnippet,
  getRelationshipStageMeta
} from '../modules/relationshipModule'
import { FloatingTelemetryHud } from './FloatingTelemetryHud'
import { FloatingStageHud, DEFAULT_WINGARDIUM_CODEX } from './FloatingStageHud'
import { LivingAttireCard } from './LivingAttireCard'
import {
  type LivingAttireState,
  createIndigoStreamAttireState,
  generateLivingAttirePrompt,
  reconcilePostTurnAttireState,
} from '../modules/livingAttireModule'
import { IncitingSparkCard } from './IncitingSparkCard'
import { MacroWorldCard } from './MacroWorldCard'
import { WorldStageCard } from './WorldStageCard'

import { WorldDissectionTray } from './WorldDissectionTray'
import { WorldCabinetDrawer } from './WorldCabinetDrawer'
import { WorldStudioView } from './WorldStudioView'
import { CentralDockIsland } from './CentralDockIsland'
import { SCENOGRAPHER_SYSTEM_INSTRUCTION } from '../scenographerPrompt'

interface StagingLabViewProps {
  onBackToHome: () => void
}

interface PromptLayerItem {
  id: string
  title: string
  sourceTag: string
  sourceLabel: string
  badgeBg: string
  badgeText: string
  badgeBorder: string
  borderClass: string
  bgClass: string
  textClass: string
  content: string
}

export function StagingLabView({ onBackToHome }: StagingLabViewProps) {
  // 0. Workspace Mode: Stage Arena (Default: Character + Live Chat) vs World Studio
  const [workspaceMode, setWorkspaceMode] = useState<'studio' | 'stage'>('stage')

  // 1. Target Gateway & Modal States
  const [isPromptInspectorOpen, setIsPromptInspectorOpen] = useState(false)
  const [isTelemetryContractEnabled, setIsTelemetryContractEnabled] = useState<boolean>(true)
  const [copiedPrompt, setCopiedPrompt] = useState(false)

  // 2. Base Canvas & Modular Prompt State
  const [basePrompt] = useState<string>(DEFAULT_BASE_PROMPT)
  const [featureModules] = useState<PromptModule[]>(INITIAL_FEATURE_MODULES)

  // 3.0 Card 0: Persona Archetype Controls (DNA & Defense Mechanics)
  const [currentArchetype, setCurrentArchetype] = useState<PersonaArchetype>(
    CANONICAL_PERSONA_PRESETS[0]
  )
  const [isArchetypeActive, setIsArchetypeActive] = useState<boolean>(false)
  const [isArchetypeExpanded, setIsArchetypeExpanded] = useState<boolean>(false)

  // 3.05 Card 0.5: Relationship & Special Imprints Controls
  const [isRelationshipActive, setIsRelationshipActive] = useState<boolean>(false)
  const [isRelationshipExpanded, setIsRelationshipExpanded] = useState<boolean>(false)
  const [relationshipConfig, setRelationshipConfig] = useState<RelationshipConfig>({
    stage: 'stranger',
    nightFriction: false,
    softSpot: false,
  })

  // 3.1 Card 1: Physical Boundary Controls
  const [parrySpacing, setParrySpacing] = useState<SpatialSpacing>('distant')
  const [parryBoundaryLevel, setParryBoundaryLevel] = useState<number>(10)

  // 3.2 Card 2: Kinetic Continuity & Pacing Controls (Dual-State In-Memory)
  const [initialPosture, setInitialPosture] = useState<string>(
    STANCE_PRESETS[0].snapshot
  )
  const [currentPosture, setCurrentPosture] = useState<string>(
    STANCE_PRESETS[0].snapshot
  )

  // 3.3 Dynamic Signal Chain States (The Effect Rack / Pedalboard Architecture)
  const [isCharacterStateActive, setIsCharacterStateActive] = useState<boolean>(false)
  const [isBoundaryActive, setIsBoundaryActive] = useState<boolean>(false)
  const [isKineticActive, setIsKineticActive] = useState<boolean>(false)
  const [isKineticLinkedToBoundary, setIsKineticLinkedToBoundary] = useState<boolean>(false)
  const [isCharacterStateExpanded, setIsCharacterStateExpanded] = useState<boolean>(false)
  const [isBoundaryExpanded, setIsBoundaryExpanded] = useState<boolean>(false)
  const [isKineticExpanded, setIsKineticExpanded] = useState<boolean>(false)

  // 3.4 Card 3: The Magma Core Controls (Effect Rack Pedal 3)
  const [isMagmaActive, setIsMagmaActive] = useState<boolean>(false)
  const [isMagmaExpanded, setIsMagmaExpanded] = useState<boolean>(false)
  const [magmaConfig, setMagmaConfig] = useState<MagmaCoreConfig>(() => {
    const defaults = ARCHETYPE_MAGMA_DEFAULTS.cool_aloof
    return {
      enabled: false,
      phase: 'sealed',
      autoProgress: true,
      faultLine: defaults?.faultLine ?? '',
      polarInversion: defaults?.polarInversion ?? '',
    }
  })

  // 3.4 Living Attire & 4-Zone Surface Matrix
  const [isAttireActive, setIsAttireActive] = useState<boolean>(true)
  const [isAttireExpanded, setIsAttireExpanded] = useState<boolean>(true)
  const [livingAttireState, setLivingAttireState] = useState<LivingAttireState>(() =>
    createIndigoStreamAttireState()
  )
  const [currentActorSkin, setCurrentActorSkin] = useState<CharacterSkinBlueprint | null>(null)

  // 3.5 World & Stage Cell Controls (The Mind Stage Architecture)

  const [activeDockTab, setActiveDockTab] = useState<'actor' | 'world'>('actor')
  const [inspectorTab, setInspectorTab] = useState<'actor' | 'stage' | 'director'>('actor')
  const [isSparkActive, setIsSparkActive] = useState<boolean>(true)
  const [isSparkExpanded, setIsSparkExpanded] = useState<boolean>(true)
  const [sparkText, setSparkText] = useState<string>(
    'ตั้งใจจะใช้ชีวิต ม.ปลาย ปี 1 แบบเงียบๆ ไม่เด่น แต่เพื่อนสนิทจับเซ็นชื่อมัดมือชกเข้าชมรมเครื่องเป่า ยื่นใบสมัครใส่มือแล้วลากเข้าห้องซ้อม ทันทีที่ประตูเปิดออก ดันไปสบตากับเพื่อนเป่าทรัมเป็ตที่เคยร้องไห้แทบขาดใจตอนแข่งแพ้ ม.ต้น และเธอกำลังจ้องมาด้วยสายตาที่เอาจริงจนน่าขนลุก...'
  )
  const [isMacroWorldActive, setIsMacroWorldActive] = useState<boolean>(true)
  const [isMacroWorldExpanded, setIsMacroWorldExpanded] = useState<boolean>(true)
  const [macroWorldLore, setMacroWorldLore] = useState<string>(
    'เป็นโรงเรียนเวทมนตร์อันดับหนึ่ง ที่เหล่าพ่อมดแม่มดทุกบ้านต้องเอาลูกมาเรียน โดยต่างจากสังคมมนุษย์ทั่วไป โรงเรียนอายุเกินกว่า 100 ปี มีพ่อมดศาสตร์มืด มีการแบ่งบ้านในโรงเรียน มีอาจารย์ที่ยูนีคทุ่มเทเพื่อเด็กๆ มีโลกของตัวเอง มีสัตว์วิเศษ มีความแฟนตาซี ใช้ไม้กายสิทธิ์เพื่อร่ายคาถา แอบอยู่ในโลกของเราและโดนโลกของเรากีดกัน คนเยอะ ห้องเรียนเยอะ สถานที่ลึกลับ มูดแอนด์โทนของการแข่งขัน ความเป็นเพื่อน ปริศนา และตัวร้าย...'
  )
  const [isWorldStageActive, setIsWorldStageActive] = useState<boolean>(true)
  const [isWorldStageExpanded, setIsWorldStageExpanded] = useState<boolean>(true)
  const [isStageHudOpen, setIsStageHudOpen] = useState<boolean>(false)
  const [isSomaticHudOpen, setIsSomaticHudOpen] = useState<boolean>(true)
  const [stageCodexContent, setStageCodexContent] = useState<string>(DEFAULT_WINGARDIUM_CODEX)
  const [currentStagePrompt, setCurrentStagePrompt] = useState<string>('ห้องเรียนวิงการ์เดียมเลวิโอซาในปราสาทเวทมนตร์โบราณ บรรยากาศยามบ่าย อัฒจันทร์หินครึ่งวงกลม ขนห่านสีขาวบนโต๊ะเรียนไม้')
  const [stageCellLatency, setStageCellLatency] = useState<number>(0)
  const [stageCellModel, setStageCellModel] = useState<string>('gemini-3.8-flash')
  const [isGeneratingStage, setIsGeneratingStage] = useState<boolean>(false)

  // 3.6 World Dissection & Cabinet States
  const [isDissecting, setIsDissecting] = useState<boolean>(false)
  const [isDissectionTrayOpen, setIsDissectionTrayOpen] = useState<boolean>(false)
  const [dissectedCards, setDissectedCards] = useState<LoreCard[]>([])
  const [dissectLatency, setDissectLatency] = useState<number>(0)
  const [dissectModel, setDissectModel] = useState<string>('gemini-3.8-flash')
  const [isCabinetDrawerOpen, setIsCabinetDrawerOpen] = useState<boolean>(false)
  const [cabinetCards, setCabinetCards] = useState<LoreCard[]>([])
  const [pinnedCardIds, setPinnedCardIds] = useState<string[]>([])

  const handleDissectWorldLore = async () => {
    if (!macroWorldLore.trim() || isDissecting) return
    setIsDissecting(true)
    try {
      let response: Response
      const payload = { raw_text: macroWorldLore, world_id: 'default_world' }
      try {
        response = await fetch('http://localhost:8000/api/sandbox/world/dissect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch {
        response = await fetch('https://the-soul-backend-330377476882.asia-southeast1.run.app/api/sandbox/world/dissect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (response.ok) {
        const data = await response.json()
        setDissectedCards(data.cards || [])
        setDissectLatency(data.latency_ms || 0)
        setDissectModel(data.model || 'gemini-3.8-flash')
        setIsDissectionTrayOpen(true)
      }
    } catch (err) {
      console.error('Failed to dissect world lore:', err)
    } finally {
      setIsDissecting(false)
    }
  }

  const handleSaveCardsToCabinet = async (cardsToSave: LoreCard[]) => {
    try {
      let response: Response
      const payload = { world_id: 'default_world', cards: cardsToSave }
      try {
        response = await fetch('http://localhost:8000/api/sandbox/world/cards/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch {
        response = await fetch('https://the-soul-backend-330377476882.asia-southeast1.run.app/api/sandbox/world/cards/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (response.ok) {
        setCabinetCards(prev => {
          const map = new Map<string, LoreCard>()
          prev.forEach(c => map.set(c.id, c))
          cardsToSave.forEach(c => map.set(c.id, c))
          return Array.from(map.values())
        })
        setPinnedCardIds(prev => {
          if (prev.length === 0 && cardsToSave.length > 0) {
            return cardsToSave.slice(0, 2).map(c => c.id)
          }
          return prev
        })
      }
    } catch (err) {
      console.error('Failed to save cards to cabinet:', err)
    }
  }

  const handleTogglePinCard = (cardId: string) => {
    setPinnedCardIds(prev =>
      prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
    )
  }

  const handleDeleteCabinetCard = async (cardId: string) => {
    try {
      try {
        await fetch(`http://localhost:8000/api/sandbox/world/default_world/card/${cardId}`, {
          method: 'DELETE',
        })
      } catch {
        await fetch(`https://the-soul-backend-330377476882.asia-southeast1.run.app/api/sandbox/world/default_world/card/${cardId}`, {
          method: 'DELETE',
        })
      }
      setCabinetCards(prev => prev.filter(c => c.id !== cardId))
      setPinnedCardIds(prev => prev.filter(id => id !== cardId))
    } catch (err) {
      console.error('Failed to delete cabinet card:', err)
    }
  }


  const handleGenerateStageCell = async (prompt: string) => {
    setIsGeneratingStage(true)
    setCurrentStagePrompt(prompt)
    try {
      let response: Response
      const payload = { prompt }
      try {
        response = await fetch('http://localhost:8000/api/sandbox/stage/cell', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch {
        response = await fetch('https://the-soul-backend-330377476882.asia-southeast1.run.app/api/sandbox/stage/cell', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (response.ok) {
        const data = await response.json()
        setStageCodexContent(data.raw_text)
        setStageCellLatency(data.latency_ms)
        setStageCellModel(data.model)
        setIsStageHudOpen(true)
      }
    } catch (err) {
      console.error('Failed to generate stage cell:', err)
    } finally {
      setIsGeneratingStage(false)
    }
  }

  const handleRelationshipChange = (nextRel: RelationshipConfig) => {
    setRelationshipConfig(nextRel)
    // Sync Soft Spot imprint with Magma Core phase
    const meta = getRelationshipStageMeta(nextRel.stage)
    const effectiveSoftSpot = meta.allowsImprints && (nextRel.softSpot || Boolean(meta.requiresSoftSpot))
    if (effectiveSoftSpot && magmaConfig.phase === 'sealed') {
      setMagmaConfig(prev => ({ ...prev, phase: 'cooled_magma' }))
    } else if (!effectiveSoftSpot && magmaConfig.phase === 'cooled_magma') {
      setMagmaConfig(prev => ({ ...prev, phase: 'sealed' }))
    }
  }

  const handleMagmaConfigChange = (nextMagma: MagmaCoreConfig) => {
    setMagmaConfig(nextMagma)
    // Sync Cooled Magma phase with Relationship Soft Spot imprint
    if (nextMagma.phase === 'cooled_magma') {
      setRelationshipConfig(prev => ({
        ...prev,
        stage: prev.stage === 'stranger' ? 'familiar' : prev.stage,
        softSpot: true,
      }))
    } else if (nextMagma.phase === 'sealed' && relationshipConfig.stage !== 'deep_bond') {
      setRelationshipConfig(prev => ({
        ...prev,
        softSpot: false,
      }))
    }
  }

  const handleArchetypeChange = (nextArchetype: PersonaArchetype) => {
    setCurrentArchetype(nextArchetype)
    const defaults = ARCHETYPE_MAGMA_DEFAULTS[nextArchetype.id]
    if (defaults) {
      setMagmaConfig(prev => ({
        ...prev,
        faultLine: defaults.faultLine,
        polarInversion: defaults.polarInversion,
      }))
    }
  }

  // Deterministic connection handlers
  const handleToggleBoundary = () => {
    setIsBoundaryActive((prev) => {
      const next = !prev
      if (next) {
        if (!isCharacterStateActive) {
          setIsCharacterStateActive(true)
          setIsCharacterStateExpanded(true)
        }
        if (!isRelationshipActive) {
          setIsRelationshipActive(true)
          setIsRelationshipExpanded(true)
        }
      }
      return next
    })
  }

  const handleToggleCharacterState = () => {
    setIsCharacterStateActive((prev) => {
      const next = !prev
      if (!next && isBoundaryActive) {
        setIsBoundaryActive(false)
      }
      return next
    })
  }

  const handleToggleRelationship = () => {
    setIsRelationshipActive((prev) => {
      const next = !prev
      if (!next && isBoundaryActive) {
        setIsBoundaryActive(false)
      }
      return next
    })
  }

  const handleToggleKineticLink = () => {
    setIsKineticLinkedToBoundary((prev) => {
      const next = !prev
      if (next && !isCharacterStateActive) {
        setIsCharacterStateActive(true)
      }
      return next
    })
  }

  const handleBypassAll = () => {
    setIsArchetypeActive(false)
    setIsRelationshipActive(false)
    setIsCharacterStateActive(false)
    setIsBoundaryActive(false)
    setIsKineticActive(false)
    setIsKineticLinkedToBoundary(false)
    setIsMagmaActive(false)
  }

  const handleOriginPostureChange = (newPosture: string) => {
    setInitialPosture(newPosture)
    setCurrentPosture(newPosture)
    setSimulationResult(null)
  }

  const resetCountRef = useRef(0)
  const tetherCooldownRef = useRef(0)
  const handleResetPosture = () => {
    setCurrentPosture(initialPosture)
    resetCountRef.current += 1
    setChatLog([
      {
        id: `reset-vo-${resetCountRef.current}`,
        type: 'vo',
        text: `รีเซ็ตสรีระกลับสู่ท่าตั้งต้นเรียบร้อย: "${initialPosture}"`,
      },
    ])
    setSimulationResult(null)
  }

  // 4. Player Input & Chat History State (Pristine Canvas)
  const [playerInput, setPlayerInput] = useState<string>('')
  const [chatLog, setChatLog] = useState<ChatMessage[]>([])

  // 5. Execution & Telemetry State
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash')
  const [thinkingBudget, setThinkingBudget] = useState<number>(256)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)
  const [simulationResult, setSimulationResult] = useState<SandboxSimulateResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Stopwatch counter during inference
  useEffect(() => {
    if (!isLoading) return
    const timer = setInterval(() => {
      setElapsedSeconds(prev => +(prev + 0.1).toFixed(1))
    }, 100)
    return () => clearInterval(timer)
  }, [isLoading])

  // Auto-scroll to bottom of chat when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatLog, isLoading])

  // Persona Archetype brief computed string (Card 0)
  const personaPromptSnippet = useMemo(() => {
    return generatePersonaPromptSnippet(currentArchetype, isArchetypeActive)
  }, [currentArchetype, isArchetypeActive])

  // Relationship & Special Imprints computed string (Card 0.5)
  const relationshipPromptSnippet = useMemo(() => {
    return generateRelationshipPromptSnippet(
      relationshipConfig,
      isRelationshipActive,
      parryBoundaryLevel,
      isCharacterStateActive
    )
  }, [relationshipConfig, isRelationshipActive, parryBoundaryLevel, isCharacterStateActive])

  const relationshipMeta = useMemo(() => {
    return getRelationshipStageMeta(relationshipConfig.stage)
  }, [relationshipConfig.stage])

  const activeImprintCount =
    (relationshipMeta.allowsImprints && relationshipConfig.nightFriction ? 1 : 0) +
    (relationshipMeta.allowsImprints && (relationshipConfig.softSpot || relationshipMeta.requiresSoftSpot) ? 1 : 0)

  // Desire & Sensory Heat standalone computed string
  const desirePromptSnippet = useMemo(() => {
    return generateDesirePromptSnippet(parryBoundaryLevel, isCharacterStateActive)
  }, [parryBoundaryLevel, isCharacterStateActive])

  // Physical brief computed string (Card 1)
  const parryBriefSnippet = useMemo(() => {
    return generatePhysicalParryBrief(
      parrySpacing,
      parryBoundaryLevel,
      playerInput,
      currentPosture,
      relationshipConfig,
      isRelationshipActive
    )
  }, [parrySpacing, parryBoundaryLevel, playerInput, currentPosture, relationshipConfig, isRelationshipActive])

  const isKineticSomaticEffective = isCharacterStateActive && isKineticLinkedToBoundary

  // Kinetic Pacing brief computed string (Card 2)
  const kineticPromptSnippet = useMemo(() => {
    return generateKineticPacingPrompt(
      currentPosture,
      isKineticActive,
      isKineticSomaticEffective ? parryBoundaryLevel : undefined
    )
  }, [currentPosture, isKineticActive, isKineticSomaticEffective, parryBoundaryLevel])

  // The Magma Core brief computed string (Card 3 / Pedal 3)
  const magmaPromptSnippet = useMemo(() => {
    return generateMagmaCorePromptSnippet(magmaConfig, isMagmaActive)
  }, [magmaConfig, isMagmaActive])

  // Close on Escape key
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

  // Real-time Assembled Prompt Layers (Multi-Origin Architecture)
  const promptLayers = useMemo<PromptLayerItem[]>(() => {
    const layers: PromptLayerItem[] = []

    // 1. Core Base Prompt (Neutral Zinc / White)
    if (basePrompt.trim()) {
      layers.push({
        id: 'core_base',
        title: 'ตัวตนตั้งต้น (The Embodied Actor)',
        sourceTag: 'CORE BACKBONE',
        sourceLabel: 'จิตวิญญาณ กฎฟิสิกส์ และสัจธรรมของเวที',
        badgeBg: 'bg-white/10',
        badgeText: 'text-[#F1F1F1]',
        badgeBorder: 'border-white/20',
        borderClass: 'border-white/15',
        bgClass: 'bg-white/[0.02]',
        textClass: 'text-[#E4E4E7]',
        content: basePrompt.trim(),
      })
    }

    // 2. Persona Archetype Module
    if (isArchetypeActive && personaPromptSnippet.trim()) {
      layers.push({
        id: 'persona_archetype',
        title: `สายตัวละคร: ${currentArchetype.name}`,
        sourceTag: 'PERSONA ARCHETYPE',
        sourceLabel: `แม่พิมพ์ตัวตน 5 เสาหลัก: ${currentArchetype.tagline} (Psychology & Somatics)`,
        badgeBg: 'bg-[#818cf8]/10',
        badgeText: 'text-[#818cf8]',
        badgeBorder: 'border-[#818cf8]/30',
        borderClass: 'border-[#818cf8]/20',
        bgClass: 'bg-[#818cf8]/[0.03]',
        textClass: 'text-[#e0e7ff]',
        content: personaPromptSnippet.trim(),
      })
    }

    // 3. Magma Core Module
    if (isMagmaActive && magmaPromptSnippet.trim()) {
      const magmaMeta = getMagmaPhaseMeta(magmaConfig.phase)
      layers.push({
        id: 'magma_core_module',
        title: `แกนลาวา: ${magmaMeta.label}`,
        sourceTag: 'MAGMA CORE',
        sourceLabel: `การสลับขั้วอารมณ์และสภาวะจิตใจเบื้องลึก (${magmaMeta.tag})`,
        badgeBg: magmaMeta.badgeBg,
        badgeText: magmaMeta.badgeText,
        badgeBorder: magmaMeta.badgeBorder,
        borderClass: magmaMeta.badgeBorder.replace('/35', '/20').replace('/40', '/20').replace('/30', '/20'),
        bgClass: magmaMeta.badgeBg.replace('/15', '/[0.03]').replace('/20', '/[0.03]'),
        textClass: 'text-[#F1F1F1]',
        content: magmaPromptSnippet.trim(),
      })
    }

    // 4. Relationship & Special Imprints Module
    if (isRelationshipActive && relationshipPromptSnippet.trim()) {
      layers.push({
        id: 'relationship_imprint',
        title: `ความสัมพันธ์: ${relationshipMeta.label}`,
        sourceTag: 'RELATIONSHIP',
        sourceLabel: `คลื่นความผูกพันและตราประทับพิเศษ (+${activeImprintCount} Imprints)`,
        badgeBg: 'bg-[#f472b6]/10',
        badgeText: 'text-[#f472b6]',
        badgeBorder: 'border-[#f472b6]/30',
        borderClass: 'border-[#f472b6]/20',
        bgClass: 'bg-[#f472b6]/[0.03]',
        textClass: 'text-[#fce7f3]',
        content: relationshipPromptSnippet.trim(),
      })
    }

    // 5. Desire & Sensory Heat Module
    if (!isBoundaryActive && isCharacterStateActive && desirePromptSnippet.trim()) {
      const desireLabel = parryBoundaryLevel <= 20 ? 'สติครบ' : parryBoundaryLevel <= 60 ? 'ใจเต้นรัว' : 'เร่าร้อน'
      layers.push({
        id: 'desire_heat',
        title: `ไฟปรารถนา: ${desireLabel} (${parryBoundaryLevel}%)`,
        sourceTag: 'DESIRE & HEAT',
        sourceLabel: 'อุณหภูมิร่างกาย เหงื่อ หัวใจ และความไวต่อสัมผัส',
        badgeBg: 'bg-[#f59e0b]/10',
        badgeText: 'text-[#f59e0b]',
        badgeBorder: 'border-[#f59e0b]/30',
        borderClass: 'border-[#f59e0b]/20',
        bgClass: 'bg-[#f59e0b]/[0.03]',
        textClass: 'text-[#fef3c7]',
        content: desirePromptSnippet.trim(),
      })
    }

    // 6. Physical Boundary Module
    if (isBoundaryActive && parryBriefSnippet.trim()) {
      const spacingLabel =
        parrySpacing === 'distant'
          ? 'ระยะปลอดภัย 2-3 ก้าว (Distant)'
          : parrySpacing === 'reach'
          ? 'ระยะเอื้อมถึง (Reach)'
          : 'ประชิดตัว (Intimate)'
      layers.push({
        id: 'physical_reality',
        title: `ขอบเขตและระยะห่าง: ${spacingLabel}`,
        sourceTag: 'PHYSICAL BOUNDARY',
        sourceLabel: 'คำนวณสดจากระยะห่าง × ความสัมพันธ์ × ไฟปรารถนา',
        badgeBg: 'bg-[#38bdf8]/10',
        badgeText: 'text-[#38bdf8]',
        badgeBorder: 'border-[#38bdf8]/30',
        borderClass: 'border-[#38bdf8]/20',
        bgClass: 'bg-[#38bdf8]/[0.03]',
        textClass: 'text-[#bae6fd]',
        content: `# ACTIVE MODULE: REALITY OVERRIDE & PHYSICAL BOUNDARY\n${parryBriefSnippet.trim()}`,
      })
    }

    // 7. Kinetic Continuity Module
    if (isKineticActive && kineticPromptSnippet.trim()) {
      layers.push({
        id: 'kinetic_pacing_module',
        title: `แรงเฉื่อยสรีระ: ${currentPosture}`,
        sourceTag: isKineticSomaticEffective ? 'KINETIC + SOMATIC' : 'KINETIC CONTINUITY',
        sourceLabel: isKineticSomaticEffective
          ? 'กฎแห่งแรงเฉื่อยและจังหวะภาพยนตร์ (ผสานแรงเสียดทานทางอารมณ์)'
          : 'กฎแห่งแรงเฉื่อยและจังหวะภาพยนตร์ (กายภาพล้วน)',
        badgeBg: isKineticSomaticEffective ? 'bg-[#f59e0b]/10' : 'bg-[#34d399]/10',
        badgeText: isKineticSomaticEffective ? 'text-[#f59e0b]' : 'text-[#34d399]',
        badgeBorder: isKineticSomaticEffective ? 'border-[#f59e0b]/30' : 'border-[#34d399]/30',
        borderClass: isKineticSomaticEffective ? 'border-[#f59e0b]/20' : 'border-[#34d399]/20',
        bgClass: isKineticSomaticEffective ? 'bg-[#f59e0b]/[0.02]' : 'bg-[#34d399]/[0.03]',
        textClass: isKineticSomaticEffective ? 'text-[#fef3c7]' : 'text-[#a7f3d0]',
        content: kineticPromptSnippet.trim(),
      })
    }

    // 7.5 Living Attire & 4-Zone Surface Matrix
    if (isAttireActive) {
      const attireSnippet = generateLivingAttirePrompt(livingAttireState, isAttireActive, currentActorSkin)
      if (attireSnippet.trim()) {
        layers.push({
          id: 'living_attire_surface',
          title: 'ชุด & ผัสสะ 4 โซน (Living Attire)',
          sourceTag: 'LIVING ATTIRE',
          sourceLabel: 'ระบบชุดไร้ขีดจำกัด สลับป้ายเพิ่งเกิด ⚡ สู่ค้างคา ⏳ กันพูดซ้ำ',
          badgeBg: 'bg-[#38bdf8]/10',
          badgeText: 'text-[#38bdf8]',
          badgeBorder: 'border-[#38bdf8]/30',
          borderClass: 'border-[#38bdf8]/20',
          bgClass: 'bg-[#38bdf8]/[0.03]',
          textClass: 'text-[#bae6fd]',
          content: attireSnippet.trim(),
        })
      }
    }

    // 8. Active Feature Modules (Purple)
    const activeMods = featureModules.filter(m => m.enabled)
    for (const mod of activeMods) {
      if (mod.prompt_snippet.trim()) {
        layers.push({
          id: `module_${mod.id}`,
          title: `โมดูลเสริม: ${mod.name}`,
          sourceTag: 'FEATURE MODULE',
          sourceLabel: 'โมดูลเสริมที่เปิดใช้งาน',
          badgeBg: 'bg-[#a78bfa]/10',
          badgeText: 'text-[#a78bfa]',
          badgeBorder: 'border-[#a78bfa]/30',
          borderClass: 'border-[#a78bfa]/20',
          bgClass: 'bg-[#a78bfa]/[0.03]',
          textClass: 'text-[#ddd6fe]',
          content: `# ACTIVE MODULE: ${mod.name.toUpperCase()}\n${mod.prompt_snippet.trim()}`,
        })
      }
    }

    // 9. Right HUD Telemetry Contract (Amber - Pluggable)
    if (isTelemetryContractEnabled) {
      const activeTelemetrySchema =
        isBoundaryActive && isKineticActive
          ? DEFAULT_TELEMETRY_SCHEMA_PROMPT
          : isBoundaryActive
          ? CARD1_TELEMETRY_SCHEMA_PROMPT
          : isKineticActive
          ? CARD2_TELEMETRY_SCHEMA_PROMPT
          : DEFAULT_TELEMETRY_SCHEMA_PROMPT

      layers.push({
        id: 'hud_telemetry',
        title: 'สัญญาส่งออกค่า HUD (JSON Schema)',
        sourceTag: 'HUD CONTRACT',
        sourceLabel:
          isBoundaryActive && isKineticActive
            ? 'สัญญาสั่ง AI คายค่าขอบเขตการสัมผัสและจังหวะแรงเฉื่อยสรีระพร้อมกัน'
            : isBoundaryActive
            ? 'สัญญาสั่ง AI คายค่าขอบเขตและภาพนิ่งสรีระ'
            : isKineticActive
            ? 'สัญญาสั่ง AI คายค่าจังหวะความเร็ว สรีระ และ Somatic Tension'
            : 'สัญญาสั่ง AI คายค่าส่ง Floating HUD',
        badgeBg: 'bg-[#fb923c]/10',
        badgeText: 'text-[#fb923c]',
        badgeBorder: 'border-[#fb923c]/30',
        borderClass: 'border-[#fb923c]/20',
        bgClass: 'bg-[#fb923c]/[0.03]',
        textClass: 'text-[#fed7aa]',
        content: activeTelemetrySchema.trim(),
      })
    }

    return layers
  }, [
    basePrompt,
    isArchetypeActive,
    currentArchetype,
    personaPromptSnippet,
    isRelationshipActive,
    relationshipPromptSnippet,
    relationshipMeta,
    activeImprintCount,
    isCharacterStateActive,
    parryBoundaryLevel,
    desirePromptSnippet,
    isBoundaryActive,
    isKineticActive,
    isKineticSomaticEffective,
    isMagmaActive,
    magmaConfig,
    parryBriefSnippet,
    kineticPromptSnippet,
    magmaPromptSnippet,
    featureModules,
    isTelemetryContractEnabled,
    parrySpacing,
    currentPosture,
    isAttireActive,
    livingAttireState,
    currentActorSkin,
  ])


  // Full Assembled Prompt string
  const assembledPrompt = useMemo(() => {
    return promptLayers.map(l => l.content).join('\n\n')
  }, [promptLayers])

  // Full Assembled Prompt string for Stage Engine
  const stagePromptLayers = useMemo<PromptLayerItem[]>(() => {
    const layers: PromptLayerItem[] = [
      {
        id: 'stage_params',
        title: 'พารามิเตอร์สมองกล (Cognitive Execution Engine)',
        sourceTag: 'VERTEX CONFIG',
        sourceLabel: 'การกำหนดค่าสมองกล gemini-3.8-flash และ Thinking Budget บน Vertex AI (Location: global)',
        badgeBg: 'bg-amber-400/10',
        badgeText: 'text-amber-300',
        badgeBorder: 'border-amber-400/25',
        borderClass: 'border-amber-400/20',
        bgClass: 'bg-amber-400/[0.02]',
        textClass: 'text-amber-200/90 font-mono',
        content: `{\n  "model": "${stageCellModel}",\n  "thinking_budget": 1024,\n  "temperature": 0.7,\n  "endpoint": "POST /api/sandbox/stage/cell",\n  "location": "global"\n}`,
      },
    ]

    if (isMacroWorldActive && macroWorldLore.trim()) {
      layers.push({
        id: 'stage_macro_world',
        title: 'คัมภีร์จักรวาล (Macro World Bible)',
        sourceTag: 'MACRO WORLD LORE',
        sourceLabel: 'ประวัติศาสตร์ กฎเกณฑ์ สังคม และมูดแอนด์โทนใหญ่ของโลกที่ครอบคลุมเวทีนี้',
        badgeBg: 'bg-sky-500/10',
        badgeText: 'text-sky-400',
        badgeBorder: 'border-sky-500/30',
        borderClass: 'border-sky-500/20',
        bgClass: 'bg-sky-500/[0.02]',
        textClass: 'text-[#e0f2fe]',
        content: macroWorldLore.trim(),
      })
    }

    layers.push(
      {
        id: 'stage_system_instruction',
        title: 'คัมภีร์สถาปนิกมโนทัศน์ (Universal Scenographer System Prompt)',
        sourceTag: '100% REAL SYSTEM PROMPT',
        sourceLabel: 'System Instruction จริง 100% ที่ส่งให้โมเดลควบคุมกฎ 5 มิติ (Threshold, Volume, Light, Tactility, Power Anchor)',
        badgeBg: 'bg-sky-400/10',
        badgeText: 'text-sky-300',
        badgeBorder: 'border-sky-400/25',
        borderClass: 'border-sky-400/20',
        bgClass: 'bg-sky-400/[0.02]',
        textClass: 'text-[#F1F1F1]/90',
        content: SCENOGRAPHER_SYSTEM_INSTRUCTION,
      },
      {
        id: 'stage_runtime_payload',
        title: 'โจทย์และบรีฟฉากสด (Runtime User Payload)',
        sourceTag: 'RAW USER INPUT',
        sourceLabel: 'คำสั่งบรีฟจริงที่ผู้กำกับป้อนผ่านการ์ดผืนเวทีฝั่งซ้าย ส่งตรงเข้าโมเดลแบบดิบๆ สดๆ 100% ไร้การครอบคำสั่งเสริม',
        badgeBg: 'bg-emerald-400/10',
        badgeText: 'text-emerald-300',
        badgeBorder: 'border-emerald-400/25',
        borderClass: 'border-emerald-400/20',
        bgClass: 'bg-emerald-400/[0.02]',
        textClass: 'text-emerald-200/90 font-mono',
        content: currentStagePrompt,
      },
      {
        id: 'stage_resultant_codex',
        title: 'ผลลัพธ์มโนทัศน์ 5 มิติปัจจุบัน (Resultant Mind Stage Codex)',
        sourceTag: 'HUD CODEX',
        sourceLabel: 'ผลลัพธ์ผืนเวทีจริงที่ AI เนรมิตออกมาและกำลังแสดงผลอยู่บน Stage HUD ฝั่งขวา',
        badgeBg: 'bg-purple-400/10',
        badgeText: 'text-purple-300',
        badgeBorder: 'border-purple-400/25',
        borderClass: 'border-purple-400/20',
        bgClass: 'bg-purple-400/[0.02]',
        textClass: 'text-purple-100/90',
        content: stageCodexContent,
      }
    )

    return layers
  }, [stageCellModel, isMacroWorldActive, macroWorldLore, currentStagePrompt, stageCodexContent])

  // Director Prompt Layers preview (In Media Res Orchestration Engine)
  const directorPromptLayers = useMemo<PromptLayerItem[]>(() => {
    const pinnedCards = cabinetCards.filter(c => pinnedCardIds.includes(c.id))
    const pinnedCardsBlock = pinnedCards.length > 0
      ? `[SLOT 1: PINNED SCENE LORE CARDS (การ์ดประจำฉากในตู้คลัง)]\n${pinnedCards.map(c => `=== [${c.title}] (${c.category.toUpperCase()}) ===\n${c.content}\nคีย์เวิร์ด: ${c.tags.join(', ')}`).join('\n\n')}\n\n`
      : ''

    return [
      {
        id: 'director_bridge',
        title: 'โครงร่างผู้กำกับเวที (The Director Orchestration Engine)',
        sourceTag: 'IN MEDIA RES ENGINE',
        sourceLabel: 'พิมพ์เขียวเชื่อมต่อ: การนำจุดเริ่มต้นที่ทำให้ทุกอย่างหมุน (The Spark) + จักรวาลแห่งโลก + การ์ดประจำฉากในคลัง + ผืนเวที 5 มิติ มาบัญชาการฉาก In Media Res สไตล์ Dark Souls',
        badgeBg: 'bg-rose-500/10',
        badgeText: 'text-rose-300',
        badgeBorder: 'border-rose-500/25',
        borderClass: 'border-rose-500/20',
        bgClass: 'bg-rose-500/[0.02]',
        textClass: 'text-rose-100/90',
        content: `[ROLE: THE STAGE DIRECTOR (IN MEDIA RES ENGINE)]
คุณคือผู้กำกับเวทีที่ทำหน้าที่ผสาน 4 เสาหลัก:
1. 'จุดเริ่มต้นที่ทำให้ทุกอย่างหมุน (The Inciting Spark)'
2. 'จักรวาลและบริบทของเรื่อง (Macro World Bible)'
3. 'การ์ดวัตถุดิบประจำฉากในตู้คลัง (Pinned Scene Lore Cards)'
4. 'ผืนเวทีทางกายภาพ (Mind Stage Cell 5 มิติ)'
5. 'จิตวิทยาและสรีระของตัวละคร (Embodied Actor)'

[PRINCIPLE: DARK SOULS / IN MEDIA RES INJECTION]
ห้ามอารัมภบทช้า ห้ามเสียเวลาบรรยายเปิดฉากยืดยาวแบบหว่านแห แต่จง 'ถีบผู้เล่นเข้าไปในใจกลางสมรภูมิรบทันที' ผ่านแรงเสียดทานเฉพาะหน้า เสียงจอแจ ความตึงเครียด หรือการขัดจังหวะของเหตุการณ์จริงที่กำลังดำเนินอยู่

${isSparkActive && sparkText.trim() ? `[THE INCITING SPARK: ชนวนเหตุและวินาทีมัดมือชกที่ถอยไม่ได้]\n${sparkText.trim()}\n\n` : ''}${isMacroWorldActive && macroWorldLore.trim() ? `[MACRO WORLD BIBLE: บริบทและแรงเสียดทานของโลก]\n${macroWorldLore.trim()}\n\n` : ''}${pinnedCardsBlock}[CURRENT MIND STAGE SUBSTRATE: ผืนเวที 5 มิติ]\n${stageCodexContent}

[DIRECTOR INSTRUCTION]
ดึงเอาจุดปักหลักแห่งอำนาจ กลิ่น สัมผัส เสียงสะท้อน การ์ดประจำฉาก และชนวนเหตุ The Spark มาสร้างจังหวะเปิดฉากที่ตรึงผู้เล่นไว้ตั้งแต่ประโยคแรก...`,
      },
    ]
  }, [cabinetCards, pinnedCardIds, isSparkActive, sparkText, isMacroWorldActive, macroWorldLore, stageCodexContent])

  // Copy prompt to clipboard
  const handleCopyPrompt = async () => {
    try {
      let textToCopy = assembledPrompt
      if (inspectorTab === 'stage') {
        textToCopy = stagePromptLayers.map(l => `=== [${l.title}] ===\n${l.content}`).join('\n\n')
      } else if (inspectorTab === 'director') {
        textToCopy = directorPromptLayers.map(l => `=== [${l.title}] ===\n${l.content}`).join('\n\n')
      }
      await navigator.clipboard.writeText(textToCopy)
      setCopiedPrompt(true)
      setTimeout(() => setCopiedPrompt(false), 2000)
    } catch {
      // ignore
    }
  }

  // Unified simulation executor
  const executeSimulation = async (
    inputText: string,
    overrideSpacing?: SpatialSpacing,
    overrideBoundary?: number
  ) => {
    const rawText = (inputText || '').trim()
    const fallbackDefault =
      isBoundaryActive && isKineticActive
        ? '(ฉันก้าวเข้ามาหาเธอ)'
        : isBoundaryActive
        ? '(ฉันเอื้อมมือเข้าไปหาเธอ)'
        : '(ฉันก้าวเข้ามาหาเธอ)'
    const trimmed = rawText || fallbackDefault
    if (isLoading) return

    const effectiveSpacing = overrideSpacing ?? parrySpacing
    const effectiveBoundary = overrideBoundary ?? parryBoundaryLevel

    setElapsedSeconds(0)
    setIsLoading(true)
    setErrorMessage(null)

    // Check if player input is an action: enclosed in asterisks *...* or parentheses (...)
    const isAction =
      (trimmed.startsWith('*') && trimmed.endsWith('*') && trimmed.length > 2) ||
      (trimmed.startsWith('(') && trimmed.endsWith(')') && trimmed.length > 2)
    const cleanText = isAction ? trimmed.slice(1, -1).trim() : trimmed

    // 1. Append user message to live chat log (production parity - always in colored bubble)
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      text: trimmed,
      sender: 'me',
      type: 'msg',
      read: true,
    }
    setChatLog(prev => [...prev, userMsg])
    setPlayerInput('')

    // 2. Prepare payload - Dynamic Signal Chain (The Effect Rack Architecture)
    const activeSnippets: Array<{ id: string; name: string; prompt_snippet: string }> = []

    if (isArchetypeActive) {
      let shouldTriggerTether = false
      if (tetherCooldownRef.current > 0) {
        tetherCooldownRef.current -= 1
      } else if (effectiveBoundary <= 70 && Math.random() < 0.18) {
        shouldTriggerTether = true
        tetherCooldownRef.current = 3
      }
      const turnPersonaSnippet = generatePersonaPromptSnippet(
        currentArchetype,
        isArchetypeActive,
        shouldTriggerTether
      )
      if (turnPersonaSnippet.trim()) {
        activeSnippets.push({
          id: 'persona_archetype',
          name: `PERSONA ARCHETYPE: ${currentArchetype.name}`,
          prompt_snippet: turnPersonaSnippet.trim(),
        })
      }
    }

    if (isMagmaActive && magmaPromptSnippet.trim()) {
      activeSnippets.push({
        id: 'magma_core',
        name: `THE MAGMA CORE: ${magmaConfig.phase.toUpperCase()}`,
        prompt_snippet: magmaPromptSnippet.trim(),
      })
    }

    if (isRelationshipActive && relationshipPromptSnippet.trim()) {
      activeSnippets.push({
        id: 'relationship_imprint',
        name: `RELATIONSHIP & IMPRINTS: ${relationshipMeta.tag}`,
        prompt_snippet: relationshipPromptSnippet.trim(),
      })
    }

    if (!isBoundaryActive && isCharacterStateActive) {
      const standaloneDesire = generateDesirePromptSnippet(effectiveBoundary, true)
      if (standaloneDesire.trim()) {
        activeSnippets.push({
          id: 'desire_heat',
          name: `DESIRE & SENSORY HEAT: ${effectiveBoundary}%`,
          prompt_snippet: standaloneDesire.trim(),
        })
      }
    }

    if (isBoundaryActive) {
      const turnBrief = generatePhysicalParryBrief(
        effectiveSpacing,
        effectiveBoundary,
        trimmed,
        currentPosture,
        relationshipConfig,
        isRelationshipActive
      )
      activeSnippets.push({
        id: 'physical_parry',
        name: 'PHYSICAL BOUNDARY & EMBODIED REFLEX',
        prompt_snippet: turnBrief,
      })
    }

    if (isKineticActive && kineticPromptSnippet.trim()) {
      activeSnippets.push({
        id: 'kinetic_pacing',
        name: 'CINEMATIC KINETIC CONTINUITY & PACING',
        prompt_snippet: kineticPromptSnippet.trim(),
      })
    }

    featureModules
      .filter(m => m.enabled)
      .forEach(m => {
        activeSnippets.push({
          id: m.id,
          name: m.name,
          prompt_snippet: m.prompt_snippet,
        })
      })

    const backendPlayerInput = isAction ? `(${cleanText})` : trimmed
    const payload: SandboxSimulateRequest = {
      player_input: backendPlayerInput,
      base_prompt: basePrompt.trim(),
      active_modules: activeSnippets,
      thinking_budget: thinkingBudget,
      model_name: selectedModel,
      current_actor_posture: undefined,
      attach_telemetry_schema: isTelemetryContractEnabled,
      telemetry_schema_prompt: isTelemetryContractEnabled
        ? (isBoundaryActive && isKineticActive
            ? DEFAULT_TELEMETRY_SCHEMA_PROMPT
            : isBoundaryActive
            ? CARD1_TELEMETRY_SCHEMA_PROMPT
            : isKineticActive
            ? CARD2_TELEMETRY_SCHEMA_PROMPT
            : DEFAULT_TELEMETRY_SCHEMA_PROMPT)
        : undefined,
    }

    try {
      let response: Response
      try {
        // 1. Try Localhost :8000 first (zero latency dev)
        response = await fetch('http://localhost:8000/api/sandbox/simulate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
      } catch {
        // 2. Invisible auto-fallback to Cloud backend
        response = await fetch('https://the-soul-backend-330377476882.asia-southeast1.run.app/api/sandbox/simulate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || `Server returned ${response.status}`)
      }

      const data: SandboxSimulateResponse = await response.json()
      setSimulationResult(data)

      // Multi-turn feedback seeding: Seed resultant a_pos directly into currentPosture (Volleyball Scoreboard Flip)
      if (data.telemetry?.a_pos && data.telemetry.a_pos.trim()) {
        setCurrentPosture(data.telemetry.a_pos.trim())
      }

      // Multi-turn Living Attire reconciliation:
      // Promote all FRESH zones from this turn to LINGERING, and merge any new surface_mutations
      if (isAttireActive) {
        setLivingAttireState(prev =>
          reconcilePostTurnAttireState(prev, data.telemetry?.surface_mutations)
        )
      }

      // Auto-Progression Valve: Advance from ERUPTED to COOLED_MAGMA after 1 round completes & stamp Soft Spot

      if (isMagmaActive && magmaConfig.phase === 'erupted' && magmaConfig.autoProgress) {
        setMagmaConfig(prev => ({ ...prev, phase: 'cooled_magma' }))
        setRelationshipConfig(prev => ({
          ...prev,
          stage: prev.stage === 'stranger' ? 'familiar' : prev.stage,
          softSpot: true,
        }))
      }

      // 3. Append actor response sequence to chat log
      if (data.response_sequence && data.response_sequence.length > 0) {
        const actorMsgs: ChatMessage[] = data.response_sequence.map((seg, idx) => ({
          id: `actor-${Date.now()}-${idx}`,
          text: seg.content,
          sender: 'them',
          type: seg.type === 'action' ? 'action' : 'msg',
        }))
        setChatLog(prev => [...prev, ...actorMsgs])
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Simulation failed'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  // Simulate execution handler (manual click or Enter)
  const handleSimulate = () => {
    executeSimulation(playerInput)
  }

  // Sensory context pulse snippet for HUD
  const sensoryPulseText = useMemo(() => {
    if (isBoundaryActive && isKineticActive) {
      return isKineticSomaticEffective
        ? 'Dual signal chain active: Physical boundary arbitration and kinetic inertia infused with somatic friction.'
        : 'Dual signal chain active: Physical boundary arbitration and kinetic inertia continuity.'
    }
    if (isKineticActive) {
      return isKineticSomaticEffective
        ? 'Kinetic tempo and somatic friction active.'
        : 'Kinetic tempo and cinematic silhouette continuity active.'
    }
    if (parrySpacing === 'distant') return 'Player reaches from distant range. Trajectory clutches only empty air.'
    if (parryBoundaryLevel <= 30) return 'Immediate reflexive boundary. Pre-contact interception in transit.'
    return 'Boundary receptive. Physical proximity acknowledged.'
  }, [isBoundaryActive, isKineticActive, isKineticSomaticEffective, parrySpacing, parryBoundaryLevel])

  if (workspaceMode === 'studio') {
    return (
      <WorldStudioView
        key={workspaceMode}
        macroWorldLore={macroWorldLore}
        onMacroWorldLoreChange={setMacroWorldLore}
        sparkText={sparkText}
        onSparkChange={setSparkText}
        cabinetCards={cabinetCards}
        pinnedCardIds={pinnedCardIds}
        onTogglePin={handleTogglePinCard}
        onDeleteCabinetCard={handleDeleteCabinetCard}
        onSaveCardsToCabinet={handleSaveCardsToCabinet}
        onEnterStage={(cards, pinnedIds) => {
          if (cards) setCabinetCards(cards)
          if (pinnedIds) setPinnedCardIds(pinnedIds)
          setActiveDockTab('actor')
          setWorkspaceMode('stage')
        }}
        onSelectCharacterForStage={(char: WorldCharacterCard, worldCards?: LoreCard[]) => {
          if (worldCards) setCabinetCards(worldCards)
          setCurrentActorSkin(char.skinBlueprint || null)
          if (char.pinnedCardIds && char.pinnedCardIds.length > 0) {
            setPinnedCardIds(char.pinnedCardIds)
          }
          setCurrentArchetype({
            id: char.matchedArchetypeId || `unique_${char.id}`,
            name: char.name,
            tagline: char.matchedArchetypeLabel || char.roleTagline || 'The Unique Soul',
            appearanceAndCharm: char.appearanceAndCharm,
            coreWound: char.coreWound,
            hiddenCore: char.hiddenCore,
            theMask: char.theMask,
            keystoneTether: char.keystoneTether,
            bodyTells: char.bodyTells,
          })
          setIsArchetypeActive(true)

          setMagmaConfig(prev => ({
            ...prev,
            enabled: true,
            phase: 'sealed',
            faultLine: char.faultLine,
            polarInversion: char.polarInversion,
          }))
          setIsMagmaActive(true)

          setActiveDockTab('actor')
          setWorkspaceMode('stage')
        }}
        onSelectStageCell={(cell) => {
          if (cell.pinnedCardIds && cell.pinnedCardIds.length > 0) {
            setPinnedCardIds(cell.pinnedCardIds)
          }
          const promptText = cell.description?.trim() || cell.title
          // If already generated as 5D, seed directly into stage codex
          if (cell.description && cell.description.includes('THRESHOLD & ARRIVAL')) {
            setStageCodexContent(cell.description)
            setCurrentStagePrompt(cell.title)
            setIsStageHudOpen(true)
          } else {
            setCurrentStagePrompt(promptText)
            handleGenerateStageCell(promptText)
          }

          // Auto-configure matching attire: prioritize custom attire state, then keywords
          if (cell.attireCustomState) {
            setLivingAttireState(cell.attireCustomState)
          } else if (promptText.includes('คราม') || promptText.includes('ลำธาร') || cell.title.includes('คราม')) {
            setLivingAttireState(createIndigoStreamAttireState())
          }

          setIsAttireActive(true)
          setIsAttireExpanded(true)
          setActiveDockTab('actor')
          setWorkspaceMode('stage')
        }}
        onBackToHome={onBackToHome}
      />

    )
  }

  return (
    <div className="h-screen w-screen flex bg-app-bg text-[#F1F1F1] overflow-hidden select-none font-sans relative">
      {/* ✦ AMBIENT BACKDROP LIGHT (MATCHING CREATOR STUDIO BENTO CANVAS) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-[#EF264C]/[0.05] via-white/[0.02] to-transparent pointer-events-none blur-3xl z-0" />

      {/* ======================================================================= */}
      {/* 1. LEFT ASIDE: THE STAGE CONTROLLER (410px with Fixed h-12 Header)      */}
      {/* ======================================================================= */}
      <aside className="w-[410px] shrink-0 h-full flex flex-col border-r border-white/[0.08] bg-app-bg/90 backdrop-blur-xl z-20 select-none">
        {/* Fixed Header Bar: Exact h-12 px-3.5 identical to WorldStudioView */}
        <div className="h-12 px-3.5 border-b border-white/[0.05] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {/* Minimal Back Button (Icon only) */}
            <button
              type="button"
              onClick={onBackToHome}
              className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0"
              title="กลับสู่หน้าหลัก"
            >
              <ArrowLeft size={14} />
            </button>

            {/* Minimal Unified Mode Switcher: [ ตัวละคร | โลก ] */}
            <div className="h-7 p-0.5 rounded-full bg-white/[0.04] border border-white/10 flex items-center gap-0.5 text-[11.5px] font-sans select-none shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveDockTab('actor')
                  setWorkspaceMode('stage')
                }}
                className="h-full px-2.5 rounded-full transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 font-medium bg-white/[0.10] text-[#F1F1F1] shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]" />
                <span>ตัวละคร</span>
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceMode('studio')}
                className="h-full px-2.5 rounded-full transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 font-medium text-white/45 hover:text-white/85 hover:bg-white/[0.04]"
                title="เข้าสู่โหมดสร้างโลก (The World Studio)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                <span>โลก</span>
              </button>
              {/* Hidden legacy World & Stage tab trigger (kept intact in code, hidden from UI) */}
              <button
                type="button"
                onClick={() => setActiveDockTab('world')}
                className="hidden"
                aria-hidden="true"
              >
                โลกและฉาก
              </button>
            </div>
          </div>

          {/* Right Toolbar Slot: [ ALL | CLEAR ] */}
          {activeDockTab === 'actor' ? (
            <div className="h-7 p-0.5 rounded-full bg-white/[0.04] border border-white/10 flex items-center gap-0.5 text-[10px] font-mono select-none shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsArchetypeActive(true)
                  setIsArchetypeExpanded(true)
                  setIsRelationshipActive(true)
                  setIsRelationshipExpanded(true)
                  setIsCharacterStateActive(true)
                  setIsCharacterStateExpanded(true)
                  setIsBoundaryActive(true)
                  setIsBoundaryExpanded(true)
                  setIsKineticActive(true)
                  setIsKineticExpanded(true)
                  setIsMagmaActive(true)
                  setIsMagmaExpanded(true)
                  setIsAttireActive(true)
                  setIsAttireExpanded(true)
                }}
                className="h-full px-2 rounded-full text-white/50 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer active:scale-95 font-medium tracking-wider"
                title="เปิดและคลี่การ์ดตัวละครทั้งหมด (Engage All)"
              >
                ALL
              </button>
              <div className="w-[1px] h-3 bg-white/10" />
              <button
                type="button"
                onClick={() => {
                  setIsArchetypeActive(false)
                  setIsArchetypeExpanded(false)
                  setIsRelationshipActive(false)
                  setIsRelationshipExpanded(false)
                  setIsCharacterStateActive(false)
                  setIsCharacterStateExpanded(false)
                  setIsBoundaryActive(false)
                  setIsBoundaryExpanded(false)
                  setIsKineticActive(false)
                  setIsKineticExpanded(false)
                  setIsMagmaActive(false)
                  setIsMagmaExpanded(false)
                  setIsAttireActive(false)
                  setIsAttireExpanded(false)
                }}

                className="h-full px-2 rounded-full text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-all cursor-pointer active:scale-95 font-medium tracking-wider"
                title="ปิดและพับการ์ดตัวละครทั้งหมด (Clear All)"
              >
                CLEAR
              </button>
            </div>
          ) : (
            <div className="h-7 p-0.5 rounded-full bg-white/[0.04] border border-white/10 flex items-center gap-0.5 text-[10px] font-mono select-none shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsSparkActive(true)
                  setIsSparkExpanded(true)
                  setIsMacroWorldActive(true)
                  setIsMacroWorldExpanded(true)
                  setIsWorldStageActive(true)
                  setIsWorldStageExpanded(true)
                }}
                className="h-full px-2 rounded-full text-white/50 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer active:scale-95 font-medium tracking-wider"
                title="เปิดและคลี่การ์ดโลกทั้งหมด (Engage All)"
              >
                ALL
              </button>
              <div className="w-[1px] h-3 bg-white/10" />
              <button
                type="button"
                onClick={() => {
                  setIsSparkActive(false)
                  setIsSparkExpanded(false)
                  setIsMacroWorldActive(false)
                  setIsMacroWorldExpanded(false)
                  setIsWorldStageActive(false)
                  setIsWorldStageExpanded(false)
                }}
                className="h-full px-2 rounded-full text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-all cursor-pointer active:scale-95 font-medium tracking-wider"
                title="ปิดและพับการ์ดโลกทั้งหมด (Clear All)"
              >
                CLEAR
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Card Deck below fixed header (382px centered content) */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 flex flex-col items-center">
          <div className="w-[382px] flex flex-col gap-2.5 pb-8">
          {activeDockTab === 'world' ? (
            <>
              {/* Card 0: The Inciting Spark (จุดเริ่มต้นที่ทำให้ทุกอย่างหมุน) */}
              <IncitingSparkCard
                isActive={isSparkActive}
                onActivate={() => {
                  const next = !isSparkActive
                  setIsSparkActive(next)
                  if (next) setIsSparkExpanded(true)
                }}
                isExpanded={isSparkExpanded}
                onToggleExpand={() => setIsSparkExpanded(prev => !prev)}
                sparkText={sparkText}
                onSparkChange={setSparkText}
              />

              {/* Card 1: Macro World Bible (ภาพรวมจักรวาลแห่งโลก) */}
              <MacroWorldCard
                isActive={isMacroWorldActive}
                onActivate={() => {
                  const next = !isMacroWorldActive
                  setIsMacroWorldActive(next)
                  if (next) setIsMacroWorldExpanded(true)
                }}
                isExpanded={isMacroWorldExpanded}
                onToggleExpand={() => setIsMacroWorldExpanded(prev => !prev)}
                loreText={macroWorldLore}
                onLoreChange={setMacroWorldLore}
                onDissect={handleDissectWorldLore}
                isDissecting={isDissecting}
                cabinetCardCount={cabinetCards.length}
                onOpenCabinet={() => setIsCabinetDrawerOpen(true)}
              />

              {/* Card 2: Micro Stage Cell (ผืนเวทีมโนทัศน์ 5 มิติ) */}
              <WorldStageCard
                isActive={isWorldStageActive}
                onActivate={() => {
                  const next = !isWorldStageActive
                  setIsWorldStageActive(next)
                  if (next) setIsWorldStageExpanded(true)
                }}
                isExpanded={isWorldStageExpanded}
                onToggleExpand={() => setIsWorldStageExpanded(prev => !prev)}
                onGenerate={handleGenerateStageCell}
                isGenerating={isGeneratingStage}
              />
            </>
          ) : (
            [
            {
              id: 'archetype',
              order: 1,
              isActive: isArchetypeActive,
              node: (
                <PersonaArchetypeCard
                  key="archetype"
                  isActive={isArchetypeActive}
                  onActivate={() => {
                    const next = !isArchetypeActive
                    setIsArchetypeActive(next)
                    if (next) setIsArchetypeExpanded(true)
                  }}
                  currentArchetype={currentArchetype}
                  onArchetypeChange={handleArchetypeChange}
                  isExpanded={isArchetypeExpanded}
                  onToggleExpand={() => setIsArchetypeExpanded(prev => !prev)}
                />
              ),
            },
            {
              id: 'magma',
              order: 2,
              isActive: isMagmaActive,
              node: (
                <MagmaCoreCard
                  key="magma"
                  isActive={isMagmaActive}
                  onActivate={() => {
                    const next = !isMagmaActive
                    setIsMagmaActive(next)
                    if (next) setIsMagmaExpanded(true)
                  }}
                  isExpanded={isMagmaExpanded}
                  onToggleExpand={() => setIsMagmaExpanded(prev => !prev)}
                  config={magmaConfig}
                  onChange={handleMagmaConfigChange}
                />
              ),
            },
            {
              id: 'relationship',
              order: 3,
              isActive: isRelationshipActive,
              node: (
                <RelationshipCard
                  key="relationship"
                  isActive={isRelationshipActive}
                  onActivate={() => {
                    const next = !isRelationshipActive
                    handleToggleRelationship()
                    if (next) setIsRelationshipExpanded(true)
                  }}
                  config={relationshipConfig}
                  onChange={handleRelationshipChange}
                  isExpanded={isRelationshipExpanded}
                  onToggleExpand={() => setIsRelationshipExpanded(prev => !prev)}
                />
              ),
            },
            {
              id: 'desire',
              order: 4,
              isActive: isCharacterStateActive,
              node: (
                <CharacterStateCard
                  key="desire"
                  isActive={isCharacterStateActive}
                  onActivate={() => {
                    const next = !isCharacterStateActive
                    handleToggleCharacterState()
                    if (next) setIsCharacterStateExpanded(true)
                  }}
                  boundaryLevel={parryBoundaryLevel}
                  onBoundaryChange={setParryBoundaryLevel}
                  isExpanded={isCharacterStateExpanded}
                  onToggleExpand={() => setIsCharacterStateExpanded(prev => !prev)}
                  relationshipStage={relationshipConfig.stage}
                  isRelationshipActive={isRelationshipActive}
                />
              ),
            },
            {
              id: 'boundary',
              order: 5,
              isActive: isBoundaryActive,
              node: (
                <StageControllerCard
                  key="boundary"
                  isActive={isBoundaryActive}
                  onActivate={() => {
                    const next = !isBoundaryActive
                    handleToggleBoundary()
                    if (next) setIsBoundaryExpanded(true)
                  }}
                  isExpanded={isBoundaryExpanded}
                  onToggleExpand={() => setIsBoundaryExpanded(prev => !prev)}
                  spacing={parrySpacing}
                  onSpacingChange={setParrySpacing}
                />
              ),
            },
            {
              id: 'kinetic',
              order: 6,
              isActive: isKineticActive,
              node: (
                <KineticContinuityCard
                  key="kinetic"
                  isActive={isKineticActive}
                  onActivate={() => {
                    const next = !isKineticActive
                    setIsKineticActive(next)
                    if (next) setIsKineticExpanded(true)
                  }}
                  isExpanded={isKineticExpanded}
                  onToggleExpand={() => setIsKineticExpanded(prev => !prev)}
                  initialPosture={initialPosture}
                  currentPosture={currentPosture}
                  onOriginPostureChange={handleOriginPostureChange}
                  onResetPosture={handleResetPosture}
                  onSpacingChange={setParrySpacing}
                  onPreFillAction={(actionText, spacing) => {
                    if (spacing) setParrySpacing(spacing)
                    setPlayerInput(actionText)
                  }}
                  onSelectVelocityAction={(actionText, spacing) => {
                    if (spacing) setParrySpacing(spacing)
                    setPlayerInput(actionText)
                    executeSimulation(actionText, spacing)
                  }}
                />
              ),
            },
            {
              id: 'attire',
              order: 7,
              isActive: isAttireActive,
              node: (
                <LivingAttireCard
                  key="attire"
                  isActive={isAttireActive}
                  onActivate={() => {
                    const next = !isAttireActive
                    setIsAttireActive(next)
                    if (next) setIsAttireExpanded(true)
                  }}
                  isExpanded={isAttireExpanded}
                  onToggleExpand={() => setIsAttireExpanded(prev => !prev)}
                  attireState={livingAttireState}
                  onChangeAttireState={setLivingAttireState}
                  actorSkin={currentActorSkin}
                  onPreFillAction={(actionText) => {
                    setPlayerInput(actionText)
                  }}
                />
              ),
            },
          ]
            .sort((a, b) => {

              if (a.isActive === b.isActive) return a.order - b.order
              return a.isActive ? -1 : 1
            })
            .map(item => item.node)
          )}
          </div>
        </div>
      </aside>

      {/* ======================================================================= */}
      {/* 2. RIGHT CANVAS: THE LIVE CHAT ROOM (100% Production Chat Parity)       */}
      {/* ======================================================================= */}
      <main className="flex-1 h-full flex flex-col relative overflow-hidden bg-app-bg">
        {/* Central Dock Island (iPhone Dock / Apple Dynamic Island Floating at Top Center) */}
        <CentralDockIsland
          isArchetypeActive={isArchetypeActive}
          onToggleArchetype={() => setIsArchetypeActive(prev => !prev)}
          archetypeName={currentArchetype.name}
          isRelationshipActive={isRelationshipActive}
          onToggleRelationship={handleToggleRelationship}
          relationshipLabel={relationshipMeta.label}
          relationshipImprintCount={activeImprintCount}
          isCharacterStateActive={isCharacterStateActive}
          onToggleCharacterState={handleToggleCharacterState}
          characterStateLevel={parryBoundaryLevel}
          isBoundaryActive={isBoundaryActive}
          onToggleBoundary={handleToggleBoundary}
          boundarySpacing={parrySpacing}
          isKineticActive={isKineticActive}
          onToggleKinetic={() => setIsKineticActive(prev => !prev)}
          currentPosture={currentPosture}
          isKineticLinkedToBoundary={isKineticSomaticEffective}
          onToggleKineticLink={handleToggleKineticLink}
          isShieldActive={isMagmaActive}
          onToggleShield={() => setIsMagmaActive(prev => !prev)}
          shieldState={magmaConfig.phase}
          onBypassAll={handleBypassAll}
        />

        {/* Top Minimal Utility Bar */}
        <div className="h-10 px-6 flex items-center justify-end gap-2 shrink-0 z-20">
          {/* Inspector Button */}
          <button
            type="button"
            onClick={() => {
              setInspectorTab(activeDockTab === 'world' ? 'stage' : 'actor')
              setIsPromptInspectorOpen(true)
            }}
            className="h-7 px-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-[10.5px] font-mono flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            title="เปิดแผงตรวจเช็กพิมพ์เขียว (Inspector)"
          >
            <FileCode2 size={12} className="text-[#38bdf8]" />
            <span>Inspector</span>
          </button>

          {/* Clear Chat Log & Reset Posture */}
          <button
            type="button"
            onClick={() => {
              setChatLog([])
              setSimulationResult(null)
            }}
            className="h-7 px-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/40 hover:text-white text-[10px] font-mono transition-all cursor-pointer flex items-center"
            title="ล้างข้อความในห้องแชทและรีเซ็ตท่าทาง"
          >
            Clear
          </button>
        </div>

        {/* Somatic HUD Controller Pill (Top-Right) */}
        {!isSomaticHudOpen && (
          <div className="absolute top-[46px] right-6 z-30 select-none flex items-center gap-1.5 pointer-events-auto">
            <div className="h-7 p-0.5 rounded-full bg-black/50 backdrop-blur-xl border border-white/15 shadow-sm flex items-center gap-1 text-[10.5px] font-mono">
              <button
                type="button"
                onClick={() => setIsSomaticHudOpen(true)}
                className="h-full px-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                title="คลิกเพื่อเปิด SOMATIC HUD"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>SOMATIC</span>
              </button>
            </div>
          </div>
        )}

        {/* Floating Somatic Telemetry HUD */}
        {isSomaticHudOpen && (
          <FloatingTelemetryHud
            telemetry={simulationResult?.telemetry ?? null}
            spacing={parrySpacing}
            boundaryLevel={parryBoundaryLevel}
            isBoundaryActive={isBoundaryActive}
            isKineticActive={isKineticActive}
            currentPosture={currentPosture}
            sensoryPulseText={sensoryPulseText}
            isTelemetryContractEnabled={isTelemetryContractEnabled}
            onToggleTelemetryContract={() => setIsTelemetryContractEnabled(!isTelemetryContractEnabled)}
            relationshipConfig={relationshipConfig}
            isRelationshipActive={isRelationshipActive}
            isOpen={isSomaticHudOpen}
            onToggleOpen={() => setIsSomaticHudOpen(prev => !prev)}
            styleOffsetRight="right-6"
          />
        )}

        {/* Floating Stage Scenography HUD (Kept intact in code, hidden and closed by default) */}
        {isStageHudOpen && (
          <FloatingStageHud
            content={stageCodexContent}
            latencyMs={stageCellLatency}
            modelName={stageCellModel}
            isOpen={isStageHudOpen}
            onToggleOpen={() => setIsStageHudOpen(prev => !prev)}
            onRunDirector={() => {
              const directorNotice: ChatMessage = {
                id: `director-${Date.now()}`,
                text: `🎬 [DIRECTOR BRIDGE: STAGE CELL INJECTED]\nผืนเวทีมโนทัศน์ถูกส่งเข้าสู่ฉากเรียบร้อยแล้ว`,
                sender: 'them',
                type: 'msg',
                read: true,
              }
              setChatLog(prev => [...prev, directorNotice])
            }}
            styleOffsetRight="right-6"
          />
        )}

        {/* Ambient Top Glow (Subtle Dark Apple Radial) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none blur-3xl -z-10" />

        {/* Unified Scroll Container (Identical structure to production ChatRoom) */}
        <div
          ref={scrollContainerRef}
          style={{ overscrollBehavior: 'none', overscrollBehaviorY: 'none' }}
          className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col no-scrollbar relative overscroll-none touch-pan-y"
        >
          {/* Main Conversation Column */}
          <MessageList
            messages={chatLog}
            chatName="Actor"
            endRef={messagesEndRef}
          />

          {/* Inline Error Notification */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 max-w-md mx-auto my-2">
              <Info size={14} className="shrink-0" />
              <span className="truncate">{errorMessage}</span>
            </div>
          )}

          {/* Sticky Bottom Bar with Unified Capsule Input Dock */}
          <ChatInputBar
            inputMessage={playerInput}
            onInputChange={setPlayerInput}
            onSendMessage={handleSimulate}
            isStreaming={isLoading}
            chatName="Actor"
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            thinkingBudget={thinkingBudget}
            onThinkingBudgetChange={setThinkingBudget}
            latencyMs={simulationResult?.telemetry?.latency_ms}
            elapsedSeconds={elapsedSeconds}
          />
        </div>
      </main>

      {/* ======================================================================= */}
      {/* 3. FULL-SCREEN PROMPT BLUEPRINT (CLEAN UNIBODY CANVAS)                  */}
      {/* ======================================================================= */}
      {isPromptInspectorOpen && (
        <div className="fixed inset-0 z-50 bg-[#090909]/98 backdrop-blur-3xl flex flex-col overflow-hidden animate-in fade-in duration-200 select-none font-sans">
          {/* Top Sticky Frosted Navigation (Ultra-Minimal: Close • Triple Engine Selector • Micro Actions) */}
          <header className="sticky top-0 z-20 min-h-14 py-2.5 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 bg-[#090909]/80 backdrop-blur-2xl border-b border-white/[0.08]">
            {/* Left: Close Button (Clean Circle) */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsPromptInspectorOpen(false)}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
                title="ปิดหน้าต่าง (Esc)"
              >
                <X size={15} />
              </button>
              <div className="text-[12px] font-mono text-white/50 tracking-wider uppercase hidden sm:block">
                BLUEPRINT INSPECTOR
              </div>
            </div>

            {/* Center: Triple Engine Segmented Control */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10 select-none">
              <button
                type="button"
                onClick={() => setInspectorTab('actor')}
                className={`h-7 px-3 rounded-full text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                  inspectorTab === 'actor'
                    ? 'bg-white/10 text-white font-semibold shadow-sm'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${inspectorTab === 'actor' ? 'bg-[#818cf8]' : 'bg-white/30'}`} />
                <span>👤 นักแสดง (Actor)</span>
              </button>
              <button
                type="button"
                onClick={() => setInspectorTab('stage')}
                className={`h-7 px-3 rounded-full text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                  inspectorTab === 'stage'
                    ? 'bg-amber-400/15 text-amber-300 font-semibold border border-amber-400/30 shadow-sm'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${inspectorTab === 'stage' ? 'bg-amber-400' : 'bg-white/30'}`} />
                <span>🏛️ ผืนเวที (Stage)</span>
              </button>
              <button
                type="button"
                onClick={() => setInspectorTab('director')}
                className={`h-7 px-3 rounded-full text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                  inspectorTab === 'director'
                    ? 'bg-rose-500/15 text-rose-300 font-semibold border border-rose-500/30 shadow-sm'
                    : 'text-white/30 hover:text-white/50'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${inspectorTab === 'director' ? 'bg-rose-500' : 'bg-white/20'}`} />
                <span>🎬 ผู้กำกับ (Director)</span>
              </button>
            </div>

            {/* Right: Micro Actions (Minimal HUD Switch & Copy Capsule) */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Ultra-Minimal HUD Micro-Capsule Switch (Actor only) */}
              {inspectorTab === 'actor' && (
                <button
                  type="button"
                  onClick={() => setIsTelemetryContractEnabled(!isTelemetryContractEnabled)}
                  className={`h-7 px-2.5 rounded-full border text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 select-none ${
                    isTelemetryContractEnabled
                      ? 'bg-[#fb923c]/15 hover:bg-[#fb923c]/25 border-[#fb923c]/35 text-[#fb923c] shadow-[0_0_10px_rgba(251,146,60,0.2)]'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/40 hover:text-white/70'
                  }`}
                  title={isTelemetryContractEnabled ? 'HUD Telemetry สัญญาเชื่อมต่ออยู่ (คลิกเพื่อถอด)' : 'HUD Telemetry ถอดอยู่ (คลิกเพื่อต่อ)'}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isTelemetryContractEnabled ? 'bg-[#fb923c] animate-pulse' : 'bg-white/30'
                    }`}
                  />
                  <span className="font-semibold tracking-tight">HUD</span>
                </button>
              )}

              {/* Ultra-Minimal Copy Prompt Capsule */}
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="h-7 px-3 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-[11px] font-sans font-medium text-[#F1F1F1] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 select-none shadow-sm"
                title="คัดลอก Prompt ทั้งหมด"
              >
                {copiedPrompt ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
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

          {/* Body: Single Unibody Canvas (Stacked Modular Cards) */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 lg:p-8 bg-[#080809]">
            <div className="max-w-4xl mx-auto space-y-4">
              {(inspectorTab === 'stage'
                ? stagePromptLayers
                : inspectorTab === 'director'
                ? directorPromptLayers
                : promptLayers
              ).map((layer) => (
                <div
                  key={layer.id}
                  className={`rounded-2xl border ${layer.borderClass} ${layer.bgClass} p-4 sm:p-5 transition-all shadow-sm`}
                >
                  {/* Layer Header Row */}
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2.5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-mono font-semibold uppercase tracking-wider border ${layer.badgeBg} ${layer.badgeText} ${layer.badgeBorder}`}
                      >
                        {layer.sourceTag}
                      </span>
                      <span className="text-[13px] sm:text-[14px] font-semibold text-[#F1F1F1] tracking-tight truncate">
                        {layer.title}
                      </span>
                    </div>
                    <span className="text-[10.5px] font-mono text-white/35 shrink-0">
                      {layer.content.length} chars
                    </span>
                  </div>

                  {/* Micro Source Description */}
                  <p className="text-[11px] text-white/45 mb-2.5 font-sans">
                    {layer.sourceLabel}
                  </p>

                  {/* Layer Code Content */}
                  <div
                    className={`p-3.5 sm:p-4 rounded-xl bg-black/50 border border-white/[0.05] font-mono text-[11.5px] sm:text-[12px] leading-relaxed whitespace-pre-wrap select-text max-h-[480px] overflow-y-auto no-scrollbar ${layer.textClass}`}
                  >
                    {layer.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* World Dissection Tray (Review & Edit newly dissected cards) */}
      <WorldDissectionTray
        key={dissectedCards.map(c => c.id).join('-') || 'dissection-tray'}
        isOpen={isDissectionTrayOpen}
        onClose={() => setIsDissectionTrayOpen(false)}
        initialCards={dissectedCards}
        latencyMs={dissectLatency}
        modelName={dissectModel}
        onSaveToCabinet={handleSaveCardsToCabinet}
      />

      {/* World Cabinet Drawer (View all stored cards & toggle stage pinning) */}
      <WorldCabinetDrawer
        isOpen={isCabinetDrawerOpen}
        onClose={() => setIsCabinetDrawerOpen(false)}
        cards={cabinetCards}
        pinnedCardIds={pinnedCardIds}
        onTogglePin={handleTogglePinCard}
        onDeleteCard={handleDeleteCabinetCard}
      />
    </div>
  )
}

export default StagingLabView
