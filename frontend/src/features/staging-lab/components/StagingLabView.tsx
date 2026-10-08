import { useState } from 'react'
import {
  ArrowLeft,
  Sparkles,
  Cpu,
  Clock,
  Layers,
  Activity,
  Flame,
  Shield,
  Zap,
  ChevronDown,
  ChevronUp,
  User,
  RotateCcw
} from 'lucide-react'
import { SANDBOX_PRESETS } from '../mockPresets'
import type { SandboxPreset, SandboxSimulateResponse } from '../types'
import { MessageBubble } from '../../chat/components/chat-room/MessageBubble'
import type { ChatMessage } from '../../chat/types'

interface StagingLabViewProps {
  onBackToHome: () => void
}

const CHARACTERS = [
  { id: 'victoria', name: 'วิกตอเรีย (Victoria)', role: 'ประธานสภานักเรียนจอมซึนเดเระ' },
  { id: 'cher', name: 'เฌอ (Cher)', role: 'เจ้าหญิงยากจนสู้ชีวิต ผู้หยิ่งในศักดิ์ศรี' },
  { id: 'may', name: 'เมย์ (May)', role: 'เพื่อนสนิทสายหน้านิ่ง แอบหวั่นไหว' },
  { id: 'baisom', name: 'ใบส้ม (Baisom)', role: 'รุ่นน้องสดใสร่าเริง ซ่อนความเหงา' },
]

export function StagingLabView({ onBackToHome }: StagingLabViewProps) {
  // 1. State Configuration
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SANDBOX_PRESETS[0].id)
  const [characterId, setCharacterId] = useState<string>(SANDBOX_PRESETS[0].character_id)
  const [distance, setDistance] = useState<'distant' | 'reach' | 'intimate'>(SANDBOX_PRESETS[0].distance)
  const [inhibitionShield, setInhibitionShield] = useState<'active' | 'cracked' | 'shattered'>(SANDBOX_PRESETS[0].inhibition_shield)
  const [desireLevel, setDesireLevel] = useState<number>(SANDBOX_PRESETS[0].desire_level)
  const [climate, setClimate] = useState<string>(SANDBOX_PRESETS[0].climate)
  const [heldProp, setHeldProp] = useState<string>(SANDBOX_PRESETS[0].held_prop)
  const [actorPosture, setActorPosture] = useState<string>(SANDBOX_PRESETS[0].actor_posture)
  const [playerPosture, setPlayerPosture] = useState<string>(SANDBOX_PRESETS[0].player_posture)
  const [playerInput, setPlayerInput] = useState<string>(SANDBOX_PRESETS[0].player_input)

  // 2. Execution State
  const [serverTarget, setServerTarget] = useState<'local' | 'cloud'>('local')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [simulationResult, setSimulationResult] = useState<SandboxSimulateResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isThinkingExpanded, setIsThinkingExpanded] = useState<boolean>(false)

  // 3. Preset Applicator
  const handleSelectPreset = (preset: SandboxPreset) => {
    setSelectedPresetId(preset.id)
    setCharacterId(preset.character_id)
    setDistance(preset.distance)
    setInhibitionShield(preset.inhibition_shield)
    setDesireLevel(preset.desire_level)
    setClimate(preset.climate)
    setHeldProp(preset.held_prop)
    setActorPosture(preset.actor_posture)
    setPlayerPosture(preset.player_posture)
    setPlayerInput(preset.player_input)
  }

  // 4. API Simulation Dispatcher
  const handleSimulate = async () => {
    if (!playerInput.trim()) return

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const baseUrl = serverTarget === 'local' 
        ? 'http://localhost:8000' 
        : 'https://the-soul-backend-330377476882.asia-southeast1.run.app'

      const response = await fetch(`${baseUrl}/api/sandbox/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character_id: characterId,
          player_input: playerInput,
          distance: distance,
          inhibition_shield: inhibitionShield,
          desire_level: desireLevel,
          climate: climate,
          held_prop: heldProp,
          actor_posture: actorPosture,
          player_posture: playerPosture,
          thinking_budget: 1024,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Server responded with ${response.status}`)
      }

      const data: SandboxSimulateResponse = await response.json()
      setSimulationResult(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการจำลองสภาวะ'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  // Convert response sequence to ChatMessages for MessageBubble
  const stageMessages: ChatMessage[] = []
  if (simulationResult) {
    // 1. Add Player message
    stageMessages.push({
      id: 'player_input_msg',
      type: 'msg',
      text: simulationResult.player_input,
      sender: 'me',
      read: true
    })

    // 2. Add Actor response sequence
    simulationResult.response_sequence.forEach((seg, index) => {
      if (seg.type === 'action') {
        stageMessages.push({
          id: `actor_action_${index}`,
          type: 'action',
          text: seg.content,
          sender: 'them',
          read: true
        })
      } else if (seg.type === 'dialogue') {
        stageMessages.push({
          id: `actor_dialogue_${index}`,
          type: 'msg',
          text: seg.content,
          sender: 'them',
          read: true
        })
      } else if (seg.type.startsWith('vo')) {
        stageMessages.push({
          id: `actor_vo_${index}`,
          type: 'vo',
          text: seg.content,
          sender: 'them',
          read: true
        })
      }
    })
  }

  return (
    <div className="min-h-screen w-full bg-[#0F0F0F] text-[#F1F1F1] flex flex-col font-sans select-none overflow-x-hidden">
      {/* 🌟 1. Top Bar Navigation */}
      <header className="h-14 border-b border-[#282828] bg-[#141414]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs font-medium text-[#AAAAAA] hover:text-[#F1F1F1] transition-colors py-1.5 px-2.5 rounded-lg hover:bg-white/[0.05]"
          >
            <ArrowLeft size={16} />
            <span>กลับหน้าหลัก</span>
          </button>
          <div className="h-4 w-[1px] bg-[#282828]" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-wide text-[#F1F1F1]">THE SOUL STAGING LAB</span>
            <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-full bg-[#EF264C]/15 text-[#EF264C] border border-[#EF264C]/30 font-semibold uppercase">
              Wizard of Oz Testbed
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Server Target Toggle (Local vs Cloud Run) */}
          <div className="flex items-center gap-1 bg-[#1A1A1C] p-1 rounded-xl border border-[#2F3336] text-[11px]">
            <button
              onClick={() => setServerTarget('local')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                serverTarget === 'local'
                  ? 'bg-white/10 text-[#F1F1F1] font-semibold border border-white/10 shadow-sm'
                  : 'text-[#AAAAAA] hover:text-[#F1F1F1]'
              }`}
            >
              <span>🖥️ Local (8000)</span>
            </button>
            <button
              onClick={() => setServerTarget('cloud')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                serverTarget === 'cloud'
                  ? 'bg-[#EF264C]/20 text-[#EF264C] font-semibold border border-[#EF264C]/30 shadow-sm'
                  : 'text-[#AAAAAA] hover:text-[#F1F1F1]'
              }`}
            >
              <span>☁️ Cloud Run</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#AAAAAA] bg-[#1C1C1E] px-3 py-1.5 rounded-full border border-white/5">
            <Cpu size={14} className="text-[#EF264C]" />
            <span className="font-mono text-[11px]">Gemini 3.8 Flash</span>
          </div>
        </div>
      </header>

      {/* 🌟 2. Main Workbench Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1800px] w-full mx-auto">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Stage Controller & Presets (45% Width)       */}
        {/* ========================================================= */}
        <section className="w-full lg:w-[480px] xl:w-[520px] border-b lg:border-b-0 lg:border-r border-[#282828] bg-[#121212] flex flex-col overflow-y-auto p-4 sm:p-5 gap-5">
          {/* Header of Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#EF264C]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#AAAAAA]">1. สภาวะจำลอง (Sensory Presets)</h2>
            </div>
            <span className="text-[11px] text-[#71767B]">คลิกเพื่อป้อนสภาวะทันที</span>
          </div>

          {/* Preset Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SANDBOX_PRESETS.map((p) => {
              const isSelected = selectedPresetId === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#1D1D1F] border-[#EF264C] shadow-sm ring-1 ring-[#EF264C]/30'
                      : 'bg-[#181818] border-[#282828] hover:border-white/20 hover:bg-[#202022]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-semibold text-[#F1F1F1] truncate">{p.title}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-semibold ${p.badgeColor || 'border-white/10 text-white/60'}`}>
                      {p.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#AAAAAA] line-clamp-1">{p.subtitle}</p>
                </button>
              )
            })}
          </div>

          <div className="h-[1px] bg-[#222222] w-full" />

          {/* Physical & Psychological Parameters (Discrete Sliders) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#AAAAAA]">2. ปรับแต่งสถานะโลกและจิตวิทยา</span>
              <button 
                onClick={() => {
                  const currentPreset = SANDBOX_PRESETS.find(p => p.id === selectedPresetId)
                  if (currentPreset) handleSelectPreset(currentPreset)
                }}
                className="flex items-center gap-1 text-[11px] text-[#71767B] hover:text-[#F1F1F1] transition-colors"
              >
                <RotateCcw size={12} />
                <span>รีเซ็ตตาม Preset</span>
              </button>
            </div>

            {/* Character Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#AAAAAA] flex items-center gap-1.5">
                <User size={13} className="text-[#EF264C]" /> ตัวละครที่รับบท (Actor)
              </label>
              <select
                value={characterId}
                onChange={(e) => setCharacterId(e.target.value)}
                className="w-full bg-[#1A1A1C] border border-[#2F3336] rounded-xl px-3 py-2 text-xs text-[#F1F1F1] focus:outline-none focus:border-[#EF264C] transition-colors"
              >
                {CHARACTERS.map((char) => (
                  <option key={char.id} value={char.id}>
                    {char.name} — {char.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Distance Pills */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#AAAAAA] flex items-center justify-between">
                <span>ระยะห่างทางกายภาพ (Distance)</span>
                <span className="font-mono text-[10px] text-[#EF264C] uppercase">{distance}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'distant', label: 'ไกล (2m+)' },
                  { id: 'reach', label: 'เอื้อมถึง (Arm)' },
                  { id: 'intimate', label: 'แนบเนื้อ (Close)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setDistance(item.id as 'distant' | 'reach' | 'intimate')}
                    className={`py-2 px-1 text-xs rounded-lg border text-center transition-all ${
                      distance === item.id
                        ? 'bg-[#EF264C]/15 border-[#EF264C] text-[#F1F1F1] font-semibold'
                        : 'bg-[#181818] border-[#282828] text-[#AAAAAA] hover:bg-[#222222]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inhibition Shield Pills */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#AAAAAA] flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Shield size={13} /> เกราะสติและยางอาย (Inhibition)</span>
                <span className="font-mono text-[10px] text-[#EF264C] uppercase">{inhibitionShield}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'active', label: '🛡️ Active (หนา)' },
                  { id: 'cracked', label: '⚡ Cracked (ร้าว)' },
                  { id: 'shattered', label: '💔 Shattered (แตก)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setInhibitionShield(item.id as 'active' | 'cracked' | 'shattered')}
                    className={`py-2 px-1 text-xs rounded-lg border text-center transition-all ${
                      inhibitionShield === item.id
                        ? 'bg-[#EF264C]/15 border-[#EF264C] text-[#F1F1F1] font-semibold'
                        : 'bg-[#181818] border-[#282828] text-[#AAAAAA] hover:bg-[#222222]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Desire Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-[#AAAAAA]">
                <span className="flex items-center gap-1.5"><Flame size={13} className="text-amber-400" /> หลอดความปรารถนา (Desire)</span>
                <span className="font-mono text-[#F1F1F1] font-bold">{desireLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={desireLevel}
                onChange={(e) => setDesireLevel(parseInt(e.target.value, 10))}
                className="w-full accent-[#EF264C] bg-[#222222] h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Climate & Props */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#AAAAAA]">สภาพอากาศ / ผัสสะ</label>
                <input
                  type="text"
                  value={climate}
                  onChange={(e) => setClimate(e.target.value)}
                  className="w-full bg-[#1A1A1C] border border-[#2F3336] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F1F1] focus:outline-none focus:border-[#EF264C]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-[#AAAAAA]">ของในมือ / พร็อพ</label>
                <input
                  type="text"
                  value={heldProp}
                  onChange={(e) => setHeldProp(e.target.value)}
                  className="w-full bg-[#1A1A1C] border border-[#2F3336] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F1F1] focus:outline-none focus:border-[#EF264C]"
                />
              </div>
            </div>

            {/* Posture Context */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-[#AAAAAA]">ท่าทางตัวละครก่อนเริ่ม (Actor Posture)</label>
              <input
                type="text"
                value={actorPosture}
                onChange={(e) => setActorPosture(e.target.value)}
                className="w-full bg-[#1A1A1C] border border-[#2F3336] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F1F1] focus:outline-none focus:border-[#EF264C]"
              />
            </div>
          </div>

          <div className="h-[1px] bg-[#222222] w-full" />

          {/* Player Input Area */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#AAAAAA]">3. การกระทำของผู้เล่น (Input)</label>
              <span className="text-[10px] text-[#71767B]">พิมพ์แอคชั่นและบทพูด</span>
            </div>
            <textarea
              rows={3}
              value={playerInput}
              onChange={(e) => setPlayerInput(e.target.value)}
              placeholder="เช่น (ฉันก้าวเข้าไปคว้าข้อมือเธอไว้แน่น) อยู่คนเดียวจริงเหรอ?"
              className="w-full bg-[#1A1A1C] border border-[#2F3336] rounded-xl p-3 text-xs text-[#F1F1F1] placeholder-white/20 focus:outline-none focus:border-[#EF264C] transition-colors leading-relaxed"
            />
          </div>

          {/* Big Simulate Button */}
          <button
            onClick={handleSimulate}
            disabled={isLoading || !playerInput.trim()}
            className="w-full py-3.5 px-4 rounded-xl bg-[#EF264C] hover:bg-[#d41e42] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#EF264C]/20 transition-all flex items-center justify-center gap-2 mt-auto"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>กำลังประมวลผลผ่าน Gemini 3.8 Flash...</span>
              </>
            ) : (
              <>
                <Zap size={16} className="fill-white" />
                <span>ทดสอบการตอบสนอง (SIMULATE TURN)</span>
              </>
            )}
          </button>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {errorMessage}
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: The Stage Preview & Brain Telemetry (55%)   */}
        {/* ========================================================= */}
        <section className="flex-1 bg-[#0F0F0F] flex flex-col overflow-y-auto">
          {/* Stage Top Bar */}
          <div className="h-12 border-b border-[#282828] bg-[#141414]/50 px-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-[#EF264C]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#AAAAAA]">เวทีแสดงผลสด (Live Stage)</span>
            </div>
            {simulationResult && (
              <div className="flex items-center gap-3 text-xs text-[#AAAAAA]">
                <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-400">
                  <Clock size={12} /> {simulationResult.telemetry.latency_ms} ms
                </span>
                <span className="h-3 w-[1px] bg-[#282828]" />
                <span className="text-[11px] text-[#F1F1F1] font-medium">{simulationResult.character_name}</span>
              </div>
            )}
          </div>

          {/* Interactive Chat Canvas */}
          <div className="flex-1 p-4 sm:p-8 flex flex-col justify-start overflow-y-auto min-h-[420px]">
            {stageMessages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 my-auto">
                <div className="w-14 h-14 rounded-2xl bg-[#181818] border border-[#282828] flex items-center justify-center mb-4 text-white/20">
                  <Layers size={28} />
                </div>
                <h3 className="text-sm font-semibold text-[#F1F1F1] mb-1">เวทียังคงว่างเปล่า</h3>
                <p className="text-xs text-[#71767B] max-w-sm">
                  เลือก Preset ทางซ้ายมือ ปรับแต่งสภาวะตามต้องการ แล้วกดปุ่ม &quot;ทดสอบการตอบสนอง&quot; เพื่อชมการแสดงของ Actor
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-w-2xl w-full mx-auto">
                {stageMessages.map((msg, i) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isMe={msg.sender === 'me'}
                    isLast={i === stageMessages.length - 1}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Telemetry & Inner Monologue Bottom Panel */}
          {simulationResult && (
            <div className="border-t border-[#282828] bg-[#121212] p-4 sm:p-5 flex flex-col gap-3">
              {/* Telemetry Pills Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#1C1C1E] border border-white/5 text-[#AAAAAA]">
                    Model: <strong className="text-[#F1F1F1]">{simulationResult.telemetry.model}</strong>
                  </span>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    Latency: <strong>{simulationResult.telemetry.latency_ms}ms</strong>
                  </span>
                  {simulationResult.telemetry.dominance_state && (
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      Dominance: <strong>{simulationResult.telemetry.dominance_state}</strong>
                    </span>
                  )}
                  {simulationResult.telemetry.contact_points && simulationResult.telemetry.contact_points.length > 0 && (
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      Contacts: {simulationResult.telemetry.contact_points.join(', ')}
                    </span>
                  )}
                </div>

                {simulationResult.telemetry.thinking && (
                  <button
                    onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                    className="flex items-center gap-1.5 text-xs text-[#AAAAAA] hover:text-[#F1F1F1] transition-colors py-1 px-2 rounded-md hover:bg-white/5"
                  >
                    <span>กระบวนการคิด (Inner Monologue)</span>
                    {isThinkingExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}
              </div>

              {/* Physical Rig Coordinates */}
              {simulationResult.telemetry.a_pos && (
                <div className="text-xs text-[#AAAAAA] bg-[#181818] p-2.5 rounded-lg border border-[#282828] flex items-center gap-2">
                  <span className="text-[#EF264C] font-semibold text-[11px]">สภาวะกายหยาบ (a_pos):</span>
                  <span className="text-[#F1F1F1]">{simulationResult.telemetry.a_pos}</span>
                </div>
              )}

              {/* Collapsible Thinking Accordion */}
              {isThinkingExpanded && simulationResult.telemetry.thinking && (
                <div className="p-3.5 rounded-xl bg-[#090909] border border-[#282828] text-xs font-mono text-[#AAAAAA] leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">
                  {simulationResult.telemetry.thinking}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
