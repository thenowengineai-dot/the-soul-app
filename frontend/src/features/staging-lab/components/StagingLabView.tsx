import { useState, useMemo, useEffect, useRef } from 'react'
import {
  X,
  Copy,
  Check,
  RotateCcw,
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
  generatePhysicalParryBrief
} from '../modules/physicalParryModule'
import {
  generateKineticPacingPrompt,
  STANCE_PRESETS
} from '../modules/kineticContinuityModule'
import { generateUnifiedFusionPrompt } from '../modules/unifiedFusionModule'
import type { PromptModule, SandboxSimulateResponse, SandboxSimulateRequest } from '../types'
import { MessageList } from '../../chat/components/chat-room/MessageList'
import { ChatInputBar } from '../../chat/components/chat-room/ChatInputBar'
import type { ChatMessage } from '../../chat/types'
import { StageControllerCard } from './StageControllerCard'
import { KineticContinuityCard } from './KineticContinuityCard'
import { UnifiedFusionCard } from './UnifiedFusionCard'
import { FloatingTelemetryHud } from './FloatingTelemetryHud'

export type ActiveCardId = 'card1' | 'card2' | 'card3'

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
  // 1. Target Gateway & Modal States
  const [serverTarget, setServerTarget] = useState<'local' | 'cloud'>('local')
  const [isPromptInspectorOpen, setIsPromptInspectorOpen] = useState(false)
  const [isTelemetryContractEnabled, setIsTelemetryContractEnabled] = useState<boolean>(true)
  const [copiedPrompt, setCopiedPrompt] = useState(false)

  // 2. Base Canvas & Modular Prompt State
  const [basePrompt, setBasePrompt] = useState<string>(DEFAULT_BASE_PROMPT)
  const [featureModules] = useState<PromptModule[]>(INITIAL_FEATURE_MODULES)

  // 3. Card Stack State (Single-Active Radio Architecture & Independent Accordion)
  const [activeCardId, setActiveCardId] = useState<ActiveCardId>('card1')
  const [expandedCards, setExpandedCards] = useState<Record<ActiveCardId, boolean>>({
    card1: true,
    card2: false,
    card3: false,
  })

  const toggleCardExpand = (id: ActiveCardId) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleActivateCard = (id: ActiveCardId) => {
    setActiveCardId(id)
    setExpandedCards(prev => ({ ...prev, [id]: true }))
  }

  // 3.1 Card 1: Physical Boundary Controls
  const [parrySpacing, setParrySpacing] = useState<SpatialSpacing>('reach')
  const [parryBoundaryLevel, setParryBoundaryLevel] = useState<number>(10)

  // 3.2 Card 2: Kinetic Continuity & Pacing Controls (Dual-State In-Memory)
  const [initialPosture, setInitialPosture] = useState<string>(
    STANCE_PRESETS[0].snapshot
  )
  const [currentPosture, setCurrentPosture] = useState<string>(
    STANCE_PRESETS[0].snapshot
  )

  const handleOriginPostureChange = (newPosture: string) => {
    setInitialPosture(newPosture)
    setCurrentPosture(newPosture)
  }

  const handleResetPosture = () => {
    setCurrentPosture(initialPosture)
    setChatLog([
      {
        id: `reset-vo-${Date.now()}`,
        type: 'vo',
        text: `รีเซ็ตสรีระกลับสู่ท่าตั้งต้นเรียบร้อย: "${initialPosture}"`,
      },
    ])
    setSimulationResult(null)
  }

  // 4. Player Input & Chat History State
  const [playerInput, setPlayerInput] = useState<string>('(ฉันเอื้อมมือจะเข้าไปจับหน้าอกเธอ)')
  const [chatLog, setChatLog] = useState<ChatMessage[]>([
    {
      id: 'init-vo',
      type: 'vo',
      text: 'การจำลองสภาวะทางกายภาพในห้องทดลองกำลังเริ่มต้นขึ้น นักแสดงพร้อมรับรู้เจตนาและท่วงท่าของคุณ',
    },
  ])

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

  // Physical brief computed string (Card 1)
  const parryBriefSnippet = useMemo(() => {
    return generatePhysicalParryBrief(parrySpacing, parryBoundaryLevel, playerInput)
  }, [parrySpacing, parryBoundaryLevel, playerInput])

  // Kinetic Pacing brief computed string (Card 2)
  const kineticPromptSnippet = useMemo(() => {
    return generateKineticPacingPrompt(currentPosture, activeCardId === 'card2')
  }, [currentPosture, activeCardId])

  // Unified Fusion brief computed string (Card 3)
  const unifiedFusionSnippet = useMemo(() => {
    return generateUnifiedFusionPrompt(parrySpacing, parryBoundaryLevel, currentPosture, playerInput)
  }, [parrySpacing, parryBoundaryLevel, currentPosture, playerInput])


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

    // Layer 1: Core Base Prompt (Neutral Zinc / White)
    if (basePrompt.trim()) {
      layers.push({
        id: 'core_base',
        title: 'Layer 1: Core Base Prompt (The Embodied Backbone)',
        sourceTag: 'CORE BACKBONE',
        sourceLabel: 'ตัวตน จิตวิทยา และกฎการแสดงดั้งเดิม',
        badgeBg: 'bg-white/10',
        badgeText: 'text-[#F1F1F1]',
        badgeBorder: 'border-white/20',
        borderClass: 'border-white/15',
        bgClass: 'bg-white/[0.02]',
        textClass: 'text-[#E4E4E7]',
        content: basePrompt.trim(),
      })
    }

    // Layer 2: Injected Feature Module (Isolated Single-Active Card)
    if (activeCardId === 'card1' && parryBriefSnippet.trim()) {
      layers.push({
        id: 'physical_reality',
        title: 'Layer 2: Left Controller Injection (Card 1: Physical Reality & Boundary)',
        sourceTag: 'CARD 1 (INJECTED)',
        sourceLabel: 'คำนวณสดจาก Spacing & Boundary Slider',
        badgeBg: 'bg-[#38bdf8]/10',
        badgeText: 'text-[#38bdf8]',
        badgeBorder: 'border-[#38bdf8]/30',
        borderClass: 'border-[#38bdf8]/20',
        bgClass: 'bg-[#38bdf8]/[0.03]',
        textClass: 'text-[#bae6fd]',
        content: `# ACTIVE MODULE: REALITY OVERRIDE & PHYSICAL BOUNDARY\n${parryBriefSnippet.trim()}`,
      })
    } else if (activeCardId === 'card2' && kineticPromptSnippet.trim()) {
      layers.push({
        id: 'kinetic_pacing_module',
        title: 'Layer 2: Left Controller Injection (Card 2: Kinetic Continuity & Pacing)',
        sourceTag: 'CARD 2 (INJECTED)',
        sourceLabel: 'กฎแห่งแรงเฉื่อยและจังหวะภาพยนตร์',
        badgeBg: 'bg-[#34d399]/10',
        badgeText: 'text-[#34d399]',
        badgeBorder: 'border-[#34d399]/30',
        borderClass: 'border-[#34d399]/20',
        bgClass: 'bg-[#34d399]/[0.03]',
        textClass: 'text-[#a7f3d0]',
        content: kineticPromptSnippet.trim(),
      })
    } else if (activeCardId === 'card3' && unifiedFusionSnippet.trim()) {
      layers.push({
        id: 'unified_fusion_module',
        title: 'Layer 2: Left Controller Injection (Card 3: Unified Fusion Spacing + Kinetic)',
        sourceTag: 'CARD 3 FUSION (INJECTED)',
        sourceLabel: 'ผสานสัญชาตญาณป้องกันตัวเข้ากับพลศาสตร์สรีระต่อเนื่อง',
        badgeBg: 'bg-[#c084fc]/10',
        badgeText: 'text-[#c084fc]',
        badgeBorder: 'border-[#c084fc]/30',
        borderClass: 'border-[#c084fc]/20',
        bgClass: 'bg-[#c084fc]/[0.03]',
        textClass: 'text-[#e9d5ff]',
        content: unifiedFusionSnippet.trim(),
      })
    }

    // Layer 3: Active Feature Modules (Purple)
    const activeMods = featureModules.filter(m => m.enabled)
    for (const mod of activeMods) {
      if (mod.prompt_snippet.trim()) {
        layers.push({
          id: `module_${mod.id}`,
          title: `Layer 3: Feature Module (${mod.name})`,
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

    // Layer 3 (or 4 with extra modules): Right HUD Telemetry Contract (Amber - Pluggable)
    if (isTelemetryContractEnabled) {
      const activeTelemetrySchema =
        activeCardId === 'card1'
          ? CARD1_TELEMETRY_SCHEMA_PROMPT
          : activeCardId === 'card2'
          ? CARD2_TELEMETRY_SCHEMA_PROMPT
          : DEFAULT_TELEMETRY_SCHEMA_PROMPT

      layers.push({
        id: 'hud_telemetry',
        title:
          activeCardId === 'card1'
            ? 'Layer 3: Right HUD Telemetry Contract (Card 1: Boundary & Posture Schema)'
            : activeCardId === 'card2'
            ? 'Layer 3: Right HUD Telemetry Contract (Card 2: Kinetic Pacing Schema)'
            : 'Layer 3: Right HUD Telemetry Contract (Outcome & Posture Schema)',
        sourceTag:
          activeCardId === 'card1'
            ? 'CARD 1 TELEMETRY (PLUGGABLE)'
            : activeCardId === 'card2'
            ? 'CARD 2 TELEMETRY (PLUGGABLE)'
            : 'RIGHT HUD TELEMETRY (PLUGGABLE)',
        sourceLabel:
          activeCardId === 'card1'
            ? 'สัญญาสั่ง AI คายค่าขอบเขตและภาพนิ่งสรีระ'
            : activeCardId === 'card2'
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
    activeCardId,
    parryBriefSnippet,
    kineticPromptSnippet,
    unifiedFusionSnippet,
    featureModules,
    simulationResult,
    isTelemetryContractEnabled,
  ])

  // Full Assembled Prompt string
  const assembledPrompt = useMemo(() => {
    return promptLayers.map(l => l.content).join('\n\n')
  }, [promptLayers])

  // Current API Base URL
  const currentBaseUrl = useMemo(() => {
    if (serverTarget === 'local') {
      return 'http://localhost:8000'
    }
    return 'https://the-soul-backend-330377476882.asia-southeast1.run.app'
  }, [serverTarget])

  // Reset Base Prompt
  const handleResetBasePrompt = () => {
    setBasePrompt(DEFAULT_BASE_PROMPT)
  }

  // Copy prompt to clipboard
  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(assembledPrompt)
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
    const trimmed = (inputText || '').trim()
    if (!trimmed || isLoading) return

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

    // 1. Append user message to live chat log (production parity)
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      text: cleanText,
      sender: 'me',
      type: isAction ? 'action' : 'msg',
      read: true,
    }
    setChatLog(prev => [...prev, userMsg])
    setPlayerInput('')

    // 2. Prepare payload - strictly isolated to the single active card
    const activeSnippets: Array<{ id: string; name: string; prompt_snippet: string }> = []
    if (activeCardId === 'card1') {
      const turnBrief = generatePhysicalParryBrief(effectiveSpacing, effectiveBoundary, trimmed)
      activeSnippets.push({
        id: 'physical_parry',
        name: 'PHYSICAL BOUNDARY & EMBODIED REFLEX',
        prompt_snippet: turnBrief,
      })
    } else if (activeCardId === 'card2') {
      if (kineticPromptSnippet.trim()) {
        activeSnippets.push({
          id: 'kinetic_pacing',
          name: 'CINEMATIC KINETIC CONTINUITY & PACING',
          prompt_snippet: kineticPromptSnippet.trim(),
        })
      }
    } else if (activeCardId === 'card3') {
      const fusionPrompt = generateUnifiedFusionPrompt(effectiveSpacing, effectiveBoundary, currentPosture, trimmed)
      if (fusionPrompt.trim()) {
        activeSnippets.push({
          id: 'unified_fusion',
          name: 'UNIFIED PHYSICAL & KINETIC FUSION',
          prompt_snippet: fusionPrompt.trim(),
        })
      }
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
        ? (activeCardId === 'card1'
            ? CARD1_TELEMETRY_SCHEMA_PROMPT
            : activeCardId === 'card2'
            ? CARD2_TELEMETRY_SCHEMA_PROMPT
            : DEFAULT_TELEMETRY_SCHEMA_PROMPT)
        : undefined,
    }

    try {
      const response = await fetch(`${currentBaseUrl}/api/sandbox/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

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
    if (activeCardId === 'card2') return 'Kinetic tempo and cinematic silhouette continuity active.'
    if (parrySpacing === 'distant') return 'Player reaches from distant range. Trajectory clutches only empty air.'
    if (parryBoundaryLevel <= 30) return 'Immediate reflexive boundary. Pre-contact interception in transit.'
    return 'Boundary receptive. Physical proximity acknowledged.'
  }, [activeCardId, parrySpacing, parryBoundaryLevel])

  return (
    <div className="h-screen w-screen flex bg-app-bg text-[#F1F1F1] overflow-hidden select-none font-sans relative">
      {/* ✦ AMBIENT BACKDROP LIGHT (MATCHING CREATOR STUDIO BENTO CANVAS) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-[#EF264C]/[0.05] via-white/[0.02] to-transparent pointer-events-none blur-3xl z-0" />

      {/* ======================================================================= */}
      {/* 1. LEFT ASIDE: THE STAGE CONTROLLER (370px with 346px Apple Bento Card)  */}
      {/* ======================================================================= */}
      <aside className="w-[370px] shrink-0 h-full p-3.5 flex flex-col justify-start items-center overflow-y-auto no-scrollbar border-r border-white/[0.08] bg-app-bg/90 backdrop-blur-xl z-20">
        {/* Universal Top Toolbar (Outside Cards) */}
        <div className="w-[346px] mb-3.5 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onBackToHome}
            className="h-8 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            title="กลับสู่หน้าหลัก"
          >
            <ArrowLeft size={13} />
            <span>หน้าหลัก</span>
          </button>
        </div>

        {/* Vertical Card Stack (Single-Active Radio & Independent Accordion) */}
        <div className="w-[346px] flex flex-col gap-3 pb-8">
          {/* Card 1: Physical Boundary & Parry */}
          <StageControllerCard
            isActive={activeCardId === 'card1'}
            onActivate={() => handleActivateCard('card1')}
            isExpanded={expandedCards.card1}
            onToggleExpand={() => toggleCardExpand('card1')}
            spacing={parrySpacing}
            onSpacingChange={setParrySpacing}
            boundaryLevel={parryBoundaryLevel}
            onBoundaryChange={setParryBoundaryLevel}
          />

          {/* Card 2: Kinetic Continuity & Cinematic Pacing */}
          <KineticContinuityCard
            isActive={activeCardId === 'card2'}
            onActivate={() => handleActivateCard('card2')}
            isExpanded={expandedCards.card2}
            onToggleExpand={() => toggleCardExpand('card2')}
            initialPosture={initialPosture}
            currentPosture={currentPosture}
            onOriginPostureChange={handleOriginPostureChange}
            onResetPosture={handleResetPosture}
            onSelectVelocityAction={(actionText) => {
              setPlayerInput(actionText)
              executeSimulation(actionText)
            }}
          />

          {/* Card 3: Unified Fusion (Physical Parry + Kinetic Continuity) */}
          <UnifiedFusionCard
            isActive={activeCardId === 'card3'}
            onActivate={() => handleActivateCard('card3')}
            isExpanded={expandedCards.card3}
            onToggleExpand={() => toggleCardExpand('card3')}
            spacing={parrySpacing}
            onSpacingChange={setParrySpacing}
            boundaryLevel={parryBoundaryLevel}
            onBoundaryChange={setParryBoundaryLevel}
            originPosture={currentPosture}
            onOriginPostureChange={handleOriginPostureChange}
            onSelectVelocityAction={(actionText) => {
              setPlayerInput(actionText)
              executeSimulation(actionText)
            }}
          />
        </div>
      </aside>

      {/* ======================================================================= */}
      {/* 2. RIGHT CANVAS: THE LIVE CHAT ROOM (100% Production Chat Parity)       */}
      {/* ======================================================================= */}
      <main className="flex-1 h-full flex flex-col relative overflow-hidden bg-app-bg">
        {/* Top Minimal Utility Bar */}
        <div className="h-10 px-6 flex items-center justify-end gap-2 shrink-0 z-20">
          {/* Prompt Studio Button */}
          <button
            type="button"
            onClick={() => setIsPromptInspectorOpen(true)}
            className="h-7 px-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-[10.5px] font-mono flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            title="ดูพิมพ์เขียว Prompt ที่ถูกประกอบขึ้นสด"
          >
            <FileCode2 size={12} className="text-[#38bdf8]" />
            <span>Prompt Studio</span>
          </button>

          {/* Micro Gateway Toggle */}
          <div className="flex items-center p-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => setServerTarget('local')}
              className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                serverTarget === 'local'
                  ? 'bg-white/15 text-white font-medium shadow-sm'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              :8000
            </button>
            <button
              type="button"
              onClick={() => setServerTarget('cloud')}
              className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                serverTarget === 'cloud'
                  ? 'bg-white/15 text-white font-medium shadow-sm'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              Cloud
            </button>
          </div>

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

        {/* Floating Telemetry HUD (Top-Right) */}
        <FloatingTelemetryHud
          telemetry={simulationResult?.telemetry ?? null}
          spacing={parrySpacing}
          boundaryLevel={parryBoundaryLevel}
          isParryEnabled={activeCardId === 'card1' || activeCardId === 'card3'}
          sensoryPulseText={sensoryPulseText}
          isTelemetryContractEnabled={isTelemetryContractEnabled}
          onToggleTelemetryContract={() => setIsTelemetryContractEnabled(!isTelemetryContractEnabled)}
          activeCardId={activeCardId}
        />

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
      {/* 3. FULL-SCREEN PROMPT BLUEPRINT & ASSEMBLY STUDIO (50/50 DUAL CANVAS)   */}
      {/* ======================================================================= */}
      {isPromptInspectorOpen && (
        <div className="fixed inset-0 z-50 bg-[#090909]/98 backdrop-blur-3xl flex flex-col overflow-hidden animate-in fade-in duration-200 select-none font-sans">
          {/* Top Master Utility Bar */}
          <header className="h-14 px-6 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#0E0E10]">
            {/* Left: Studio Identity & Dimension Pill */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#38bdf8]/10 border border-[#38bdf8]/30 text-[#38bdf8] flex items-center justify-center">
                <FileCode2 size={16} />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-[#F1F1F1] tracking-tight leading-none">
                  พิมพ์เขียวของเวที (Prompt Blueprint & Assembly Studio)
                </h3>
                <p className="text-[10px] text-white/40 font-mono mt-1">
                  100% PROMPT TRANSPARENCY • ORIGIN SYNTAX HIGHLIGHTING
                </p>
              </div>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-mono text-white/40">
                50/50 DUAL CANVAS
              </span>
            </div>

            {/* Center: Pluggable HUD Telemetry Capsule Switcher */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTelemetryContractEnabled(!isTelemetryContractEnabled)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-all cursor-pointer ${
                  isTelemetryContractEnabled
                    ? 'bg-[#fb923c]/15 hover:bg-[#fb923c]/25 border-[#fb923c]/30 text-[#fb923c] shadow-[0_0_15px_rgba(251,146,60,0.15)]'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/40 hover:text-white/70'
                }`}
                title="คลิกเพื่อเสียบ / ถอดหัววัด Telemetry Contract สำหรับ HUD"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isTelemetryContractEnabled
                      ? 'bg-[#fb923c] animate-pulse'
                      : 'bg-white/30'
                  }`}
                />
                <span className="font-semibold">
                  {isTelemetryContractEnabled
                    ? 'HUD CONTRACT: PLUGGED (คายค่าส่ง HUD)'
                    : 'HUD CONTRACT: DETACHED (นักแสดงบริสุทธิ์)'}
                </span>
              </button>
            </div>

            {/* Right: Actions (Stats, Copy, Close) */}
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-block text-[11px] font-mono text-white/40 mr-1">
                {promptLayers.length} Layers • {assembledPrompt.length} Chars
              </span>

              <button
                type="button"
                onClick={handleCopyPrompt}
                className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-medium text-white/90 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                {copiedPrompt ? (
                  <Check size={13} className="text-emerald-400" />
                ) : (
                  <Copy size={13} />
                )}
                <span>{copiedPrompt ? 'Copied' : 'Copy Full Prompt'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPromptInspectorOpen(false)}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 ml-1"
                title="ปิดหน้าต่าง (Esc)"
              >
                <X size={15} />
              </button>
            </div>
          </header>

          {/* Body: Exactly 50/50 Split Canvas */}
          <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/[0.08] overflow-hidden">
            {/* ======================================================= */}
            {/* LEFT 50%: Core Base Prompt Editor (Backbone)            */}
            {/* ======================================================= */}
            <div className="w-full md:w-1/2 h-full flex flex-col bg-[#0B0B0C] overflow-hidden">
              {/* Column Subheader */}
              <div className="h-11 px-6 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-white/60 uppercase tracking-wider font-mono">
                    Source Core (Backbone)
                  </span>
                  <span className="text-[10px] text-white/30 font-mono">
                    • แก้ไขได้
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetBasePrompt}
                  className="px-2 py-1 rounded text-[10.5px] font-mono text-white/40 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="รีเซ็ตเป็นค่าเริ่มต้น"
                >
                  <RotateCcw size={11} />
                  <span>Reset Default</span>
                </button>
              </div>

              {/* Editor Workspace */}
              <div className="flex-1 p-5 overflow-hidden flex flex-col">
                <textarea
                  value={basePrompt}
                  onChange={e => setBasePrompt(e.target.value)}
                  className="w-full h-full p-4 rounded-2xl bg-black/40 border border-white/[0.08] hover:border-white/15 focus:border-[#38bdf8]/40 text-xs font-mono text-[#F1F1F1] leading-relaxed resize-none focus:outline-none transition-all no-scrollbar"
                  placeholder="เขียน Base Prompt โครงร่างตัวตนของนักแสดง..."
                  spellCheck={false}
                />
              </div>
            </div>

            {/* ======================================================= */}
            {/* RIGHT 50%: Live Assembled Prompt (Multi-Layer Render)   */}
            {/* ======================================================= */}
            <div className="w-full md:w-1/2 h-full flex flex-col bg-[#080809] overflow-hidden">
              {/* Column Subheader & Origin Legend */}
              <div className="h-11 px-6 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-white/60 uppercase tracking-wider font-mono">
                    Live Assembly (Sent to Gemini)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    • 100% Real
                  </span>
                </div>

                {/* Layer Origin Pills Legend */}
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-white/10 text-white/70 border border-white/15">
                    Core
                  </span>
                  {activeCardId === 'card1' && (
                    <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30">
                      Card 1
                    </span>
                  )}
                  {activeCardId === 'card2' && (
                    <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30">
                      Card 2
                    </span>
                  )}
                  {activeCardId === 'card3' && (
                    <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-[#c084fc]/15 text-[#c084fc] border border-[#c084fc]/30">
                      Card 3 Fusion
                    </span>
                  )}
                  {isTelemetryContractEnabled && (
                    <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-[#fb923c]/15 text-[#fb923c] border border-[#fb923c]/30">
                      HUD
                    </span>
                  )}
                </div>
              </div>

              {/* Stacked Layer Cards View */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3.5 no-scrollbar">
                {promptLayers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`rounded-2xl border ${layer.borderClass} ${layer.bgClass} p-3.5 transition-all shadow-sm`}
                  >
                    {/* Layer Header Row */}
                    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider border ${layer.badgeBg} ${layer.badgeText} ${layer.badgeBorder}`}
                        >
                          {layer.sourceTag}
                        </span>
                        <span className="text-[11px] font-semibold text-[#F1F1F1] truncate">
                          {layer.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-white/35 shrink-0">
                        {layer.content.length} chars
                      </span>
                    </div>

                    {/* Micro Source Description */}
                    <p className="text-[10px] text-white/40 mb-2 font-mono">
                      {layer.sourceLabel}
                    </p>

                    {/* Layer Code Content */}
                    <div
                      className={`p-3 rounded-xl bg-black/50 border border-white/[0.05] font-mono text-[11px] leading-relaxed whitespace-pre-wrap select-text max-h-72 overflow-y-auto no-scrollbar ${layer.textClass}`}
                    >
                      {layer.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StagingLabView
