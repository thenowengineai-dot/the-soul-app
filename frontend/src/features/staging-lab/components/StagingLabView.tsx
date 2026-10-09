import { useState, useMemo, useEffect, useRef } from 'react'
import {
  X,
  Copy,
  Check,
  RotateCcw,
  FileCode2,
  Info
} from 'lucide-react'
import { DEFAULT_BASE_PROMPT } from '../defaultPrompt'
import { INITIAL_FEATURE_MODULES } from '../mockPresets'
import {
  type SpatialSpacing,
  generatePhysicalParryBrief
} from '../modules/physicalParryModule'
import type { PromptModule, SandboxSimulateResponse, SandboxSimulateRequest } from '../types'
import { MessageList } from '../../chat/components/chat-room/MessageList'
import { ChatInputBar } from '../../chat/components/chat-room/ChatInputBar'
import type { ChatMessage } from '../../chat/types'
import { StageControllerCard } from './StageControllerCard'
import { FloatingTelemetryHud } from './FloatingTelemetryHud'

interface StagingLabViewProps {
  onBackToHome: () => void
}

export function StagingLabView({ onBackToHome }: StagingLabViewProps) {
  // 1. Target Gateway & Modal States
  const [serverTarget, setServerTarget] = useState<'local' | 'cloud'>('local')
  const [isPromptInspectorOpen, setIsPromptInspectorOpen] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)

  // 2. Base Canvas & Modular Prompt State
  const [basePrompt, setBasePrompt] = useState<string>(DEFAULT_BASE_PROMPT)
  const [featureModules] = useState<PromptModule[]>(INITIAL_FEATURE_MODULES)

  // 3. Physical Boundary Arbiter Controls
  const [isParryEnabled, setIsParryEnabled] = useState<boolean>(true)
  const [parrySpacing, setParrySpacing] = useState<SpatialSpacing>('reach')
  const [parryBoundaryLevel, setParryBoundaryLevel] = useState<number>(10)

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
  const [selectedModel] = useState<string>('gemini-2.5-flash')
  const [thinkingBudget, setThinkingBudget] = useState<number>(128)
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

  // Physical brief computed string
  const parryBriefSnippet = useMemo(() => {
    return generatePhysicalParryBrief(parrySpacing, parryBoundaryLevel, playerInput)
  }, [parrySpacing, parryBoundaryLevel, playerInput])

  // Real-time Assembled Prompt calculation
  const assembledPrompt = useMemo(() => {
    const parts = [basePrompt.trim()]

    if (isParryEnabled) {
      parts.push(`\n# ACTIVE MODULE: REALITY OVERRIDE & PHYSICAL BOUNDARY\n${parryBriefSnippet.trim()}`)
    }

    const active = featureModules.filter(m => m.enabled)
    for (const mod of active) {
      if (mod.prompt_snippet.trim()) {
        parts.push(`\n# ACTIVE MODULE: ${mod.name.toUpperCase()}\n${mod.prompt_snippet.trim()}`)
      }
    }
    return parts.join('\n\n')
  }, [basePrompt, isParryEnabled, parryBriefSnippet, featureModules])

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

    // 2. Prepare payload
    const activeSnippets: Array<{ id: string; name: string; prompt_snippet: string }> = []
    if (isParryEnabled) {
      const turnBrief = generatePhysicalParryBrief(effectiveSpacing, effectiveBoundary, trimmed)
      activeSnippets.push({
        id: 'physical_parry',
        name: 'PHYSICAL BOUNDARY & EMBODIED REFLEX',
        prompt_snippet: turnBrief,
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
    if (!isParryEnabled) return 'Direct collision permitted without resistance.'
    if (parrySpacing === 'distant') return 'Player reaches from distant range. Trajectory clutches only empty air.'
    if (parryBoundaryLevel <= 30) return 'Immediate reflexive boundary. Pre-contact interception in transit.'
    return 'Boundary receptive. Physical proximity acknowledged.'
  }, [isParryEnabled, parrySpacing, parryBoundaryLevel])

  return (
    <div className="h-screen w-screen flex bg-app-bg text-[#F1F1F1] overflow-hidden select-none font-sans">
      {/* ======================================================================= */}
      {/* 1. LEFT ASIDE: THE STAGE CONTROLLER (370px with 346px Apple Bento Card)  */}
      {/* ======================================================================= */}
      <aside className="w-[370px] shrink-0 h-full p-3.5 flex flex-col justify-start items-center overflow-y-auto no-scrollbar border-r border-white/[0.08] bg-app-bg z-20">
        <StageControllerCard
          spacing={parrySpacing}
          onSpacingChange={setParrySpacing}
          boundaryLevel={parryBoundaryLevel}
          onBoundaryChange={setParryBoundaryLevel}
          isParryEnabled={isParryEnabled}
          onToggleParry={() => setIsParryEnabled(!isParryEnabled)}
          isLoading={isLoading}
          elapsedSeconds={elapsedSeconds}
          onSimulate={handleSimulate}
          onBackToHome={onBackToHome}
          onOpenPromptInspector={() => setIsPromptInspectorOpen(true)}
        />
      </aside>

      {/* ======================================================================= */}
      {/* 2. RIGHT CANVAS: THE LIVE CHAT ROOM (100% Production Chat Parity)       */}
      {/* ======================================================================= */}
      <main className="flex-1 h-full flex flex-col relative overflow-hidden bg-app-bg">
        {/* Top Minimal Utility Bar */}
        <div className="h-10 px-6 flex items-center justify-end gap-2 shrink-0 z-20">
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

          {/* Clear Chat Log */}
          <button
            type="button"
            onClick={() => setChatLog([])}
            className="px-2 py-0.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/40 hover:text-white text-[10px] font-mono transition-all cursor-pointer"
            title="ล้างข้อความในห้องแชท"
          >
            Clear
          </button>
        </div>

        {/* Floating Telemetry HUD (Top-Right) */}
        <FloatingTelemetryHud
          telemetry={simulationResult?.telemetry ?? null}
          spacing={parrySpacing}
          boundaryLevel={parryBoundaryLevel}
          isParryEnabled={isParryEnabled}
          sensoryPulseText={sensoryPulseText}
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
            thinkingBudget={thinkingBudget}
            onThinkingBudgetChange={setThinkingBudget}
          />
        </div>
      </main>

      {/* ======================================================================= */}
      {/* 3. PROMPT INSPECTOR MODAL (Apple Editorial Luxury Style)                */}
      {/* ======================================================================= */}
      {isPromptInspectorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[85vh] rounded-[28px] bg-[#141414] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="h-16 px-6 border-b border-white/[0.08] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileCode2 size={16} className="text-emerald-400" />
                <h3 className="text-[16px] font-semibold text-[#F1F1F1]">
                  Prompt Architecture Inspector
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedPrompt ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedPrompt ? 'Copied' : 'Copy Full Prompt'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPromptInspectorOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 no-scrollbar">
              {/* Left Column: Base Prompt */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-white/50 uppercase tracking-wider">
                    Core Base Prompt (Backbone)
                  </span>
                  <button
                    type="button"
                    onClick={handleResetBasePrompt}
                    className="text-[10px] text-white/40 hover:text-white flex items-center gap-1 transition-all"
                  >
                    <RotateCcw size={10} />
                    <span>Reset Default</span>
                  </button>
                </div>
                <textarea
                  rows={16}
                  value={basePrompt}
                  onChange={e => setBasePrompt(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-black/40 border border-white/[0.08] text-xs font-mono text-[#F1F1F1] focus:outline-none focus:border-white/20 transition-all leading-relaxed resize-none"
                />
              </div>

              {/* Right Column: Full Assembled Prompt */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-medium text-white/50 uppercase tracking-wider">
                  Assembled Prompt (Sent to Gemini)
                </span>
                <div className="w-full h-[360px] p-3.5 rounded-2xl bg-black/60 border border-white/[0.08] text-xs font-mono text-emerald-300/80 overflow-y-auto whitespace-pre-wrap leading-relaxed no-scrollbar select-text">
                  {assembledPrompt}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StagingLabView
