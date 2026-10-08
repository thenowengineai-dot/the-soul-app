import { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  Sparkles,
  Cpu,
  Clock,
  Layers,
  Zap,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Copy,
  Check,
  FileCode2,
  SlidersHorizontal,
  Info,
  Shield,
  Target
} from 'lucide-react'
import { DEFAULT_BASE_PROMPT } from '../defaultPrompt'
import { INITIAL_FEATURE_MODULES } from '../mockPresets'
import {
  type SpatialSpacing,
  getSpatialBrief,
  getBoundaryBrief,
  generatePhysicalParryBrief
} from '../modules/physicalParryModule'
import type { PromptModule, SandboxSimulateResponse, SandboxSimulateRequest } from '../types'
import { MessageBubble } from '../../chat/components/chat-room/MessageBubble'
import type { ChatMessage } from '../../chat/types'

interface StagingLabViewProps {
  onBackToHome: () => void
}

export function StagingLabView({ onBackToHome }: StagingLabViewProps) {
  // 1. Navigation & Mode State
  const [activeTab, setActiveTab] = useState<'playground' | 'prompt'>('playground')
  const [serverTarget, setServerTarget] = useState<'local' | 'cloud'>('local')

  // 2. Base Canvas & Modular Prompt State
  const [basePrompt, setBasePrompt] = useState<string>(DEFAULT_BASE_PROMPT)
  const [featureModules] = useState<PromptModule[]>(INITIAL_FEATURE_MODULES)

  // 🌟 ฟีเจอร์ที่ 1: ระบบขอบเขตทางกายภาพและการปัดป้องอย่างเป็นธรรมชาติ (Physical Boundary & Parry)
  const [isParryEnabled, setIsParryEnabled] = useState<boolean>(true)
  const [parrySpacing, setParrySpacing] = useState<SpatialSpacing>('reach')
  const [parryBoundaryLevel, setParryBoundaryLevel] = useState<number>(15)

  // 3. Player Input State
  const [playerInput, setPlayerInput] = useState<string>('(ฉันก้าวเข้าไปคว้าข้อมือเธอไว้แน่น)')

  // 4. Execution State
  const [thinkingBudget, setThinkingBudget] = useState<number>(256)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)
  const [simulationResult, setSimulationResult] = useState<SandboxSimulateResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isThinkingExpanded, setIsThinkingExpanded] = useState<boolean>(true)
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false)

  // จับเวลา Stopwatch ระหว่างที่ AI กำลังคิด
  useEffect(() => {
    if (!isLoading) return
    const timer = setInterval(() => {
      setElapsedSeconds(prev => +(prev + 0.1).toFixed(1))
    }, 100)
    return () => clearInterval(timer)
  }, [isLoading])

  // คำนวณคำอธิบายกำแพงจิตใจและระยะห่างปัจจุบัน
  const currentBoundaryInfo = useMemo(() => {
    return getBoundaryBrief(parryBoundaryLevel)
  }, [parryBoundaryLevel])

  const parryBriefSnippet = useMemo(() => {
    return generatePhysicalParryBrief(parrySpacing, parryBoundaryLevel)
  }, [parrySpacing, parryBoundaryLevel])

  // 🌟 Real-time Prompt Assembly (คำนวณข้อความจริงที่ประกอบเสร็จแล้วเสมอ)
  const assembledPrompt = useMemo(() => {
    const parts = [basePrompt.trim()]

    if (isParryEnabled) {
      parts.push(`\n# ACTIVE MODULE: PHYSICAL BOUNDARY & EMBODIED REFLEX\n${parryBriefSnippet.trim()}`)
    }

    const active = featureModules.filter(m => m.enabled)
    for (const mod of active) {
      if (mod.prompt_snippet.trim()) {
        parts.push(`\n# ACTIVE MODULE: ${mod.name.toUpperCase()}\n${mod.prompt_snippet.trim()}`)
      }
    }
    return parts.join('\n\n')
  }, [basePrompt, isParryEnabled, parryBriefSnippet, featureModules])

  // คำนวณ Base URL ตาม Target ที่เลือก
  const currentBaseUrl = useMemo(() => {
    if (serverTarget === 'local') {
      return 'http://localhost:8000'
    }
    return 'https://the-soul-backend-330377476882.asia-southeast1.run.app'
  }, [serverTarget])

  // ฟังก์ชันรีเซ็ต Base Prompt กลับสู่ค่าเริ่มต้น
  const handleResetBasePrompt = () => {
    setBasePrompt(DEFAULT_BASE_PROMPT)
  }

  // คัดลอก Prompt ลง Clipboard
  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(assembledPrompt)
      setCopiedPrompt(true)
      setTimeout(() => setCopiedPrompt(false), 2000)
    } catch {
      // ignore
    }
  }

  // ตั้งค่าพรีเซ็ตการทดสอบแบบแตะครั้งเดียวตามพิมพ์เขียว
  const applyTestPreset = (
    spacing: SpatialSpacing,
    boundary: number,
    input: string
  ) => {
    setIsParryEnabled(true)
    setParrySpacing(spacing)
    setParryBoundaryLevel(boundary)
    setPlayerInput(input)
  }

  // เรียกจำลองรอบการเล่น (Simulate Turn)
  const handleSimulate = async () => {
    if (!playerInput.trim()) return

    setElapsedSeconds(0)
    setIsLoading(true)
    setErrorMessage(null)

    const activeSnippets: Array<{ id: string; name: string; prompt_snippet: string }> = []

    if (isParryEnabled) {
      activeSnippets.push({
        id: 'physical_parry',
        name: 'PHYSICAL BOUNDARY & EMBODIED REFLEX',
        prompt_snippet: parryBriefSnippet,
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

    const payload: SandboxSimulateRequest = {
      player_input: playerInput.trim(),
      base_prompt: basePrompt.trim(),
      active_modules: activeSnippets,
      thinking_budget: thinkingBudget,
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'การจำลองล้มเหลว'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  // แปลง Response Segments เป็น ChatMessage เพื่อนำไป Render บนเวที
  const renderMessages: ChatMessage[] = useMemo(() => {
    const list: ChatMessage[] = []

    // ข้อความของผู้เล่น
    const inputMsg = simulationResult?.player_input || playerInput
    if (inputMsg) {
      list.push({
        id: 'msg-player',
        sender: 'me',
        type: 'msg',
        text: inputMsg,
      })
    }

    // ข้อความและท่าทางของ Actor
    if (simulationResult?.response_sequence) {
      simulationResult.response_sequence.forEach((seg, idx) => {
        list.push({
          id: `msg-actor-${idx}`,
          sender: 'them',
          type: seg.type === 'action' ? 'action' : 'msg',
          text: seg.content,
        })
      })
    }

    return list
  }, [simulationResult, playerInput])

  const totalActiveModules = (isParryEnabled ? 1 : 0) + featureModules.filter(m => m.enabled).length

  return (
    <div className="h-full w-full bg-[#0F0F0F] text-[#F1F1F1] flex flex-col font-sans selection:bg-[#EF264C]/30 selection:text-white overflow-y-auto overflow-x-hidden">
      {/* 🧭 TOP BAR: หัวหน้าแล็บ และ ตัวสลับเซิร์ฟเวอร์ */}
      <header className="sticky top-0 z-40 bg-[#0F0F0F]/95 backdrop-blur-md border-b border-[#282828] px-4 lg:px-8 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2 -ml-2 rounded-xl text-[#AAAAAA] hover:text-[#F1F1F1] hover:bg-white/[0.08] transition-all"
            title="กลับหน้าหลัก"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base text-[#F1F1F1] tracking-tight">The Staging Lab</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#181818] border border-[#282828] text-emerald-400">
                Ground Zero Canvas
              </span>
            </div>
            <p className="text-xs text-[#AAAAAA] hidden sm:block">
              สภาพแวดล้อมทดสอบบริสุทธิ์ — ฟีเจอร์ที่ 1: ระบบขอบเขตทางกายภาพและการปัดป้อง (Method Acting)
            </p>
          </div>
        </div>

        {/* แท็บและตัวสลับ Server Target */}
        <div className="flex items-center gap-3">
          {/* สลับแท็บ Playground vs Prompt Inspector */}
          <div className="flex items-center p-1 bg-[#181818] border border-[#282828] rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveTab('playground')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'playground'
                  ? 'bg-[#272727] text-[#F1F1F1] shadow-sm'
                  : 'text-[#AAAAAA] hover:text-[#F1F1F1]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#EF264C]" />
              <span>ห้องทดลอง</span>
            </button>
            <button
              onClick={() => setActiveTab('prompt')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'prompt'
                  ? 'bg-[#272727] text-[#F1F1F1] shadow-sm'
                  : 'text-[#AAAAAA] hover:text-[#F1F1F1]'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Prompt จริง</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.06] text-[#AAAAAA]">
                {totalActiveModules > 0 ? `+${totalActiveModules}` : 'Base'}
              </span>
            </button>
          </div>

          {/* สวิตช์สลับ Backend Target (Local vs Cloud Run) */}
          <div className="flex items-center p-1 bg-[#181818] border border-[#282828] rounded-xl text-xs font-medium">
            <button
              onClick={() => setServerTarget('local')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                serverTarget === 'local'
                  ? 'bg-[#EF264C] text-white shadow-sm font-semibold'
                  : 'text-[#AAAAAA] hover:text-[#F1F1F1]'
              }`}
              title="ยิงคำสั่งไปที่ http://localhost:8000 (Backend บนเครื่องของคุณ)"
            >
              🖥️ Local (8000)
            </button>
            <button
              onClick={() => setServerTarget('cloud')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                serverTarget === 'cloud'
                  ? 'bg-[#EF264C] text-white shadow-sm font-semibold'
                  : 'text-[#AAAAAA] hover:text-[#F1F1F1]'
              }`}
              title="ยิงคำสั่งไปที่ Google Cloud Run"
            >
              ☁️ Cloud Run
            </button>
          </div>
        </div>
      </header>

      {/* 🌟 BODY CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 pb-28">
        {activeTab === 'playground' ? (
          /* ========================================================
             TAB 1: 🎮 PLAYGROUND (ห้องทดลอง)
             ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ซ้าย: แผงควบคุมและ Input (5 คอลัมน์) */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* แผงควบคุมโมดูลฟีเจอร์ */}
              <div className="p-4 rounded-2xl bg-[#181818] border border-[#282828] flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#F1F1F1]">
                      แผงควบคุมฟีเจอร์ (Feature Modules)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    {totalActiveModules} Active
                  </span>
                </div>

                {/* 🛡️ ฟีเจอร์ที่ 1: ระบบขอบเขตทางกายภาพและการปัดป้อง */}
                <div
                  className={`p-4 rounded-xl border transition-all flex flex-col gap-4 ${
                    isParryEnabled
                      ? 'bg-emerald-500/[0.04] border-emerald-500/30'
                      : 'bg-[#0F0F0F] border-[#282828] opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${isParryEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#272727] text-[#AAAAAA]'}`}>
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#F1F1F1]">
                          🛡️ Physical Boundary & Parry
                        </div>
                        <div className="text-[11px] text-[#AAAAAA]">
                          Method Acting: Reality Override + Spacing + Boundary
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsParryEnabled(!isParryEnabled)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        isParryEnabled
                          ? 'bg-emerald-500 text-black font-semibold'
                          : 'bg-[#272727] text-[#AAAAAA] hover:text-[#F1F1F1]'
                      }`}
                    >
                      {isParryEnabled ? 'เปิดอยู่ (ON)' : 'ปิด (OFF)'}
                    </button>
                  </div>

                  {/* ตัวควบคุมย่อยเมื่อเปิดใช้งานฟีเจอร์ */}
                  {isParryEnabled && (
                    <div className="space-y-4 pt-2 border-t border-[#282828]/80 text-xs">
                      {/* แกนที่ 1: Spacing Pills */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[#AAAAAA]">
                          <span className="font-medium text-[11px] uppercase tracking-wider text-[#F1F1F1]">
                            1. ระยะห่างทางกายภาพ (Spatial Spacing)
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5">
                          {(['distant', 'reach', 'intimate'] as SpatialSpacing[]).map(s => {
                            const labels: Record<SpatialSpacing, string> = {
                              distant: '🚶 ห่าง 2 ก้าว',
                              reach: '🤝 1 ช่วงแขน',
                              intimate: '🫂 ประชิดตัว',
                            }
                            const isSelected = parrySpacing === s
                            return (
                              <button
                                key={s}
                                onClick={() => setParrySpacing(s)}
                                className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all text-center ${
                                  isSelected
                                    ? 'bg-[#272727] text-[#F1F1F1] border border-white/20 font-semibold'
                                    : 'bg-[#0F0F0F] text-[#AAAAAA] hover:text-[#F1F1F1] border border-transparent'
                                }`}
                              >
                                {labels[s]}
                              </button>
                            )
                          })}
                        </div>
                        <p className="text-[11px] text-[#888] italic leading-tight">
                          {getSpatialBrief(parrySpacing).replace('- ระยะห่างทางกายภาพ: ', '')}
                        </p>
                      </div>

                      {/* แกนที่ 2: Boundary Gauge Slider */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[11px] uppercase tracking-wider text-[#F1F1F1]">
                            2. กำแพงจิตใจ (Boundary Gauge): {parryBoundaryLevel}%
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-emerald-400 border border-white/10">
                            {currentBoundaryInfo.badge}
                          </span>
                        </div>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={parryBoundaryLevel}
                          onChange={e => setParryBoundaryLevel(Number(e.target.value))}
                          className="w-full h-1.5 bg-[#272727] rounded-lg appearance-none cursor-pointer accent-[#EF264C]"
                        />

                        <p className="text-[11px] text-[#888] italic leading-tight">
                          {currentBoundaryInfo.brief.replace('- กำแพงจิตใจ: ', '')}
                        </p>
                      </div>

                      {/* ทางลัดเคสทดสอบ (Test Presets) */}
                      <div className="pt-2 border-t border-[#282828]/60 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#AAAAAA]">
                          <Target className="w-3 h-3 text-[#EF264C]" />
                          <span>ปุ่มลัดเคสทดสอบ (Test Matrix Shortcuts)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                          <button
                            onClick={() =>
                              applyTestPreset('distant', 0, '(ฉันเอื้อมมือไปคว้าข้อมือเธอไว้แน่น)')
                            }
                            className="p-1.5 px-2 rounded-lg bg-[#0F0F0F] hover:bg-[#272727] text-left border border-[#282828] text-[#AAAAAA] hover:text-[#F1F1F1] transition-all"
                          >
                            🎯 1. วืดกลางอากาศ
                          </button>
                          <button
                            onClick={() =>
                              applyTestPreset('reach', 15, '(ฉันก้าวเข้าไปคว้าข้อมือเธอไว้แน่น)')
                            }
                            className="p-1.5 px-2 rounded-lg bg-[#0F0F0F] hover:bg-[#272727] text-left border border-[#282828] text-[#AAAAAA] hover:text-[#F1F1F1] transition-all"
                          >
                            🛡️ 2. ปัดป้อง 100%
                          </button>
                          <button
                            onClick={() =>
                              applyTestPreset('reach', 50, '(ฉันเกลี่ยปอยผมที่ปรกแก้มเธอแผ่วเบา)')
                            }
                            className="p-1.5 px-2 rounded-lg bg-[#0F0F0F] hover:bg-[#272727] text-left border border-[#282828] text-[#AAAAAA] hover:text-[#F1F1F1] transition-all"
                          >
                            ⚖️ 3. สัมผัสผิวเผิน
                          </button>
                          <button
                            onClick={() =>
                              applyTestPreset('intimate', 85, '(ฉันดึงตัวเธอเข้ามากอดแนบแน่น)')
                            }
                            className="p-1.5 px-2 rounded-lg bg-[#0F0F0F] hover:bg-[#272727] text-left border border-[#282828] text-[#AAAAAA] hover:text-[#F1F1F1] transition-all"
                          >
                            💔 4. เกราะสลาย
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* กล่องข้อความและการกระทำของผู้เล่น (Player Input) */}
              <div className="p-4 rounded-2xl bg-[#181818] border border-[#282828] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
                    การกระทำหรือคำพูดของผู้เล่น (Player Input)
                  </span>
                  <span className="text-[11px] text-[#AAAAAA]">ทดสอบปฏิกิริยาของโมเดล</span>
                </div>

                <textarea
                  rows={4}
                  value={playerInput}
                  onChange={e => setPlayerInput(e.target.value)}
                  placeholder="พิมพ์การกระทำหรือคำพูดของผู้เล่น เช่น: (ฉันก้าวเข้าไปคว้าข้อมือเธอไว้แน่น)"
                  className="w-full p-3 rounded-xl bg-[#0F0F0F] border border-[#282828] text-sm text-[#F1F1F1] placeholder-[#555] focus:outline-none focus:border-[#EF264C] transition-all resize-none font-sans"
                />

                {/* ตัวเลือกโหมดความเร็วการคิด (Thinking Budget) */}
                <div className="flex items-center justify-between text-xs text-[#AAAAAA] pt-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#AAAAAA]">
                    ความเร็วคิด (Thinking):
                  </span>
                  <div className="flex items-center gap-1 bg-[#0F0F0F] p-0.5 rounded-lg border border-[#282828]">
                    <button
                      onClick={() => setThinkingBudget(0)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                        thinkingBudget === 0
                          ? 'bg-[#EF264C] text-white font-semibold shadow-sm'
                          : 'text-[#AAAAAA] hover:text-[#F1F1F1]'
                      }`}
                      title="Instant / Off: 0 tokens (เร็วสุด ข้ามกระบวนการคิด)"
                    >
                      ⚡ Off (0)
                    </button>
                    <button
                      onClick={() => setThinkingBudget(128)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                        thinkingBudget === 128
                          ? 'bg-[#EF264C] text-white font-semibold shadow-sm'
                          : 'text-[#AAAAAA] hover:text-[#F1F1F1]'
                      }`}
                      title="Thinking Fast: 128 tokens (~1-1.5s)"
                    >
                      🚀 Fast (128)
                    </button>
                    <button
                      onClick={() => setThinkingBudget(256)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                        thinkingBudget === 256
                          ? 'bg-[#EF264C] text-white font-semibold shadow-sm'
                          : 'text-[#AAAAAA] hover:text-[#F1F1F1]'
                      }`}
                      title="Thinking Low: 256 tokens (~2s) แนะนำมาตรฐาน"
                    >
                      🎯 Low (256)
                    </button>
                    <button
                      onClick={() => setThinkingBudget(1024)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                        thinkingBudget === 1024
                          ? 'bg-[#EF264C] text-white font-semibold shadow-sm'
                          : 'text-[#AAAAAA] hover:text-[#F1F1F1]'
                      }`}
                      title="Thinking Medium: 1024 tokens (~5-7s) คิดเชิงลึก"
                    >
                      🧠 Med (1024)
                    </button>
                  </div>
                </div>

                {/* ปุ่มยิงจำลอง SIMULATE TURN */}
                <button
                  onClick={handleSimulate}
                  disabled={isLoading || !playerInput.trim()}
                  className={`w-full mt-2 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all shadow-lg ${
                    isLoading || !playerInput.trim()
                      ? 'bg-[#272727] text-[#71767B] cursor-not-allowed'
                      : 'bg-[#EF264C] hover:bg-[#d81e42] text-white shadow-[#EF264C]/20 hover:scale-[1.01] active:scale-[0.99]'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>กำลังส่งให้ Gemini 3.8 Flash คิด... ({elapsedSeconds}s)</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>⚡ SIMULATE TURN (ทดสอบปฏิกิริยา)</span>
                    </>
                  )}
                </button>
              </div>

              {/* ข้อความแจ้งเตือน Error (ถ้ามี) */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">เกิดข้อผิดพลาดในการเชื่อมต่อ:</p>
                    <p className="font-mono mt-0.5 break-all">{errorMessage}</p>
                    <p className="text-[11px] text-[#AAAAAA] mt-1.5">
                      💡 คำแนะนำ: ตรวจสอบว่าได้รัน{' '}
                      <code className="text-[#F1F1F1]">python3 -m uvicorn main:app --port 8000</code> ใน Terminal แล้วหรือไม่
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ขวา: เวทีแสดงผลการตอบสนอง และ CoT Thinking (7 คอลัมน์) */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              {/* Telemetry Bar ด้านบนเวที */}
              <div className="p-3 px-4 rounded-2xl bg-[#181818] border border-[#282828] flex items-center justify-between text-xs text-[#AAAAAA]">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-mono text-[#F1F1F1]">
                      {simulationResult?.telemetry.model || 'Gemini 3.8 Flash (Thinking Mode)'}
                    </span>
                  </div>
                  {simulationResult?.telemetry.latency_ms && (
                    <div className="flex items-center gap-1.5 font-mono text-emerald-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{simulationResult.telemetry.latency_ms} ms</span>
                    </div>
                  )}
                </div>

                {simulationResult?.telemetry.a_pos && (
                  <div className="flex items-center gap-1.5 truncate max-w-[240px]">
                    <span className="text-[#AAAAAA]">ท่าทาง:</span>
                    <span className="text-[#F1F1F1] font-mono truncate">
                      {simulationResult.telemetry.a_pos}
                    </span>
                  </div>
                )}
              </div>

              {/* เวทีแสดงผลบับเบิ้ล (Live Stage View) */}
              <div className="flex-1 min-h-[380px] p-5 rounded-2xl bg-[#181818] border border-[#282828] flex flex-col justify-between">
                <div className="space-y-4">
                  {renderMessages.map(msg => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isMe={msg.sender === 'me'}
                      chatName={msg.sender === 'me' ? 'ผู้เล่น' : 'หุ่นทดลอง (Actor Canvas)'}
                    />
                  ))}

                  {!simulationResult && (
                    <div className="py-12 text-center text-xs text-[#71767B] flex flex-col items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#555]" />
                      <span>กดปุ่ม [⚡ SIMULATE TURN] เพื่อเริ่มสังเกตปฏิกิริยาตอบสนองของ Actor</span>
                    </div>
                  )}
                </div>

                {/* กล่องแสดง CoT Thinking Process (กระบวนการคิดของ Gemini 3.8 Flash) */}
                {simulationResult?.telemetry.thinking && (
                  <div className="mt-6 pt-4 border-t border-[#282828]">
                    <button
                      onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                      className="w-full flex items-center justify-between text-xs text-[#AAAAAA] hover:text-[#F1F1F1] transition-colors py-1"
                    >
                      <div className="flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-semibold uppercase tracking-wider">
                          CoT Thinking Reflection (กระบวนการใคร่ครวญของ AI)
                        </span>
                      </div>
                      {isThinkingExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {isThinkingExpanded && (
                      <div className="mt-2.5 p-3.5 rounded-xl bg-[#0F0F0F] border border-[#282828] text-xs font-mono text-blue-300/90 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                        {simulationResult.telemetry.thinking}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
             TAB 2: 📜 PROMPT INSPECTOR (ดูและแก้ไข Prompt จริง)
             ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ซ้าย: ปรับแต่ง Core Base Prompt (6 คอลัมน์) */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-[#181818] border border-[#282828] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#F1F1F1]">
                      Core Base Prompt (โครงสร้างกระดูกสันหลัง)
                    </span>
                  </div>
                  <button
                    onClick={handleResetBasePrompt}
                    className="flex items-center gap-1.5 text-xs text-[#AAAAAA] hover:text-[#F1F1F1] px-2.5 py-1 rounded-lg hover:bg-white/[0.08] transition-all"
                    title="คืนค่าเป็น Base Prompt เริ่มต้น"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>คืนค่าเริ่มต้น</span>
                  </button>
                </div>

                <p className="text-xs text-[#AAAAAA]">
                  นี่คือ Prompt แกนกลางที่ส่งเป็นรากฐานให้กับ Actor คุณสามารถแก้ไขคำเพื่อทดสอบได้สดๆ ตรงนี้
                </p>

                <textarea
                  rows={16}
                  value={basePrompt}
                  onChange={e => setBasePrompt(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-[#0F0F0F] border border-[#282828] text-xs font-mono text-[#F1F1F1] focus:outline-none focus:border-[#EF264C] transition-all leading-relaxed resize-none"
                />
              </div>
            </div>

            {/* ขวา: แสดง Assembled Prompt ที่ส่งหา Gemini จริง (6 คอลัมน์) */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-[#181818] border border-[#282828] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#F1F1F1]">
                      Assembled Prompt (ข้อความจริงที่ยิงเข้า AI)
                    </span>
                  </div>

                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1.5 text-xs text-[#AAAAAA] hover:text-[#F1F1F1] px-2.5 py-1 rounded-lg hover:bg-white/[0.08] transition-all"
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอก Prompt</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-[#AAAAAA]">
                  เกิดจากการนำ Base Prompt + ชิ้นส่วนฟีเจอร์ที่เปิดใช้งาน (Active Modules) มารวมกันแบบ Real-time
                </p>

                <div className="p-3.5 rounded-xl bg-[#0F0F0F] border border-[#282828] text-xs font-mono text-emerald-300/90 whitespace-pre-wrap leading-relaxed max-h-[460px] overflow-y-auto">
                  {assembledPrompt}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
