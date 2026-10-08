import { useState, useMemo } from 'react'
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
  Info
} from 'lucide-react'
import { DEFAULT_BASE_PROMPT } from '../defaultPrompt'
import { INITIAL_FEATURE_MODULES } from '../mockPresets'
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
  const [featureModules, setFeatureModules] = useState<PromptModule[]>(INITIAL_FEATURE_MODULES)

  // 3. Player Input State
  const [playerInput, setPlayerInput] = useState<string>('(ฉันก้าวเข้าไปคว้าข้อมือเธอไว้แน่น)')

  // 4. Execution State
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [simulationResult, setSimulationResult] = useState<SandboxSimulateResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isThinkingExpanded, setIsThinkingExpanded] = useState<boolean>(true)
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false)

  // 🌟 Real-time Prompt Assembly (คำนวณข้อความจริงที่ประกอบเสร็จแล้วเสมอ)
  const assembledPrompt = useMemo(() => {
    const parts = [basePrompt.trim()]
    const active = featureModules.filter(m => m.enabled)
    for (const mod of active) {
      if (mod.prompt_snippet.trim()) {
        parts.push(`\n# ACTIVE MODULE: ${mod.name.toUpperCase()}\n${mod.prompt_snippet.trim()}`)
      }
    }
    return parts.join('\n\n')
  }, [basePrompt, featureModules])

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

  // ฟังก์ชันสลับเปิด-ปิด Feature Module
  const handleToggleModule = (id: string) => {
    setFeatureModules(prev =>
      prev.map(m => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    )
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

  // เรียกจำลองรอบการเล่น (Simulate Turn)
  const handleSimulate = async () => {
    if (!playerInput.trim()) return

    setIsLoading(true)
    setErrorMessage(null)

    const activeSnippets = featureModules
      .filter(m => m.enabled)
      .map(m => ({
        id: m.id,
        name: m.name,
        prompt_snippet: m.prompt_snippet,
      }))

    const payload: SandboxSimulateRequest = {
      player_input: playerInput.trim(),
      base_prompt: basePrompt.trim(),
      active_modules: activeSnippets,
      thinking_budget: 1024,
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

  const activeModulesCount = featureModules.filter(m => m.enabled).length

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F1F1F1] flex flex-col font-sans selection:bg-[#EF264C]/30 selection:text-white">
      {/* 🧭 TOP BAR: หัวหน้าแล็บ และ ตัวสลับเซิร์ฟเวอร์ */}
      <header className="sticky top-0 z-40 bg-[#0F0F0F]/90 backdrop-blur-md border-b border-[#282828] px-4 lg:px-8 py-3.5 flex items-center justify-between">
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
              ผืนผ้าใบเริ่มต้นบริสุทธิ์ (Pure Actor Canvas) — ล้างทุกตัวแปร พร้อมสร้างฟีเจอร์แรกไปด้วยกัน
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
                {activeModulesCount > 0 ? `+${activeModulesCount}` : 'Base'}
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
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6">
        {activeTab === 'playground' ? (
          /* ========================================================
             TAB 1: 🎮 PLAYGROUND (ห้องทดลองผืนผ้าใบเริ่มต้น)
             ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ซ้าย: แผงควบคุมและ Input (5 คอลัมน์) */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* แผงสถานะผืนผ้าใบและโมดูลฟีเจอร์ */}
              <div className="p-4 rounded-2xl bg-[#181818] border border-[#282828] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#F1F1F1]">
                      แผงควบคุมฟีเจอร์ (Feature Modules)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    {activeModulesCount} Active
                  </span>
                </div>

                {featureModules.length === 0 ? (
                  /* สภาพแวดล้อมผืนผ้าใบว่างเปล่า (Ground Zero) */
                  <div className="p-4 rounded-xl bg-[#0F0F0F] border border-dashed border-[#282828] flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>ผืนผ้าใบเริ่มต้นพร้อมแล้ว (Pure Canvas)</span>
                    </div>
                    <p className="text-xs text-[#AAAAAA] leading-relaxed">
                      ล้างตัวตนตัวละคร ปูมหลัง และตัวแปรรบกวนออกทั้งหมดเรียบร้อยแล้ว ขณะนี้ระบบทำงานด้วย{' '}
                      <span className="text-[#F1F1F1] font-mono">Core Base Prompt</span> 100% 
                      พร้อมให้เราเริ่มพูดคุยและสร้างปุ่มฟีเจอร์แรกไปด้วยกันครับ
                    </p>
                  </div>
                ) : (
                  /* รายการสวิตช์เปิด-ปิดโมดูลฟีเจอร์เมื่อเริ่มสร้าง */
                  <div className="flex flex-col gap-2">
                    {featureModules.map(mod => (
                      <div
                        key={mod.id}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                          mod.enabled
                            ? 'bg-emerald-500/[0.06] border-emerald-500/40'
                            : 'bg-[#0F0F0F] border-[#282828] opacity-60'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-medium text-[#F1F1F1]">{mod.name}</div>
                          {mod.description && (
                            <div className="text-[11px] text-[#AAAAAA]">{mod.description}</div>
                          )}
                        </div>
                        <button
                          onClick={() => handleToggleModule(mod.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                            mod.enabled
                              ? 'bg-emerald-500 text-black font-semibold'
                              : 'bg-[#272727] text-[#AAAAAA] hover:text-[#F1F1F1]'
                          }`}
                        >
                          {mod.enabled ? 'เปิดใช้งาน (ON)' : 'ปิด (OFF)'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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

                {/* ปุ่มลัดทดสอบการจับตัวแบบดิบๆ */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={() => setPlayerInput('(ฉันก้าวเข้าไปคว้าข้อมือเธอไว้แน่น)')}
                    className="px-2.5 py-1 rounded-lg bg-[#272727] hover:bg-white/[0.08] text-[#AAAAAA] hover:text-[#F1F1F1] transition-all"
                  >
                    ✊ คว้าข้อมือแน่น
                  </button>
                  <button
                    onClick={() => setPlayerInput('(ฉันขยับเข้าไปยืนประชิดตัวและยื่นหน้าเข้าไปใกล้)')}
                    className="px-2.5 py-1 rounded-lg bg-[#272727] hover:bg-white/[0.08] text-[#AAAAAA] hover:text-[#F1F1F1] transition-all"
                  >
                    👀 ยื่นหน้าประชิด
                  </button>
                  <button
                    onClick={() => setPlayerInput('เธอเป็นใครน่ะ? มายืนทำอะไรตรงนี้')}
                    className="px-2.5 py-1 rounded-lg bg-[#272727] hover:bg-white/[0.08] text-[#AAAAAA] hover:text-[#F1F1F1] transition-all"
                  >
                    💬 ทักทายเฉยๆ
                  </button>
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
                      <span>กำลังส่งให้ Gemini 3.8 Flash คิด...</span>
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
