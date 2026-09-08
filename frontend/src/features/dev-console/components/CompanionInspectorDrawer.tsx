import { useState } from 'react'
import { Terminal, X, ChevronRight, ChevronDown, AlertTriangle, CheckCircle2 } from 'lucide-react'
import LiveStatePills from './LiveStatePills'
import QuestBeatTracker from './QuestBeatTracker'
import AgentInspectorView from './AgentInspectorView'
import type { CompanionInspectorProps } from '../types'

export function CompanionInspectorDrawer({
  isOpen,
  onClose,
  onSwitchToHud,
  role = 'creator',
  characterName = 'ตัวละคร',
  turnLogs = [],
  questState,
  liveGauges,
}: CompanionInspectorProps) {
  const [expandedTurnId, setExpandedTurnId] = useState<string | number | null>(() => {
    return turnLogs.length > 0 ? turnLogs[0].id : null
  })
  const [viewMode, setViewMode] = useState<'admin' | 'creator'>(role === 'admin' ? 'admin' : 'creator')

  if (!isOpen) return null

  const isEffectiveAdmin = role === 'admin' && viewMode === 'admin'

  return (
    <>
      {/* 1. Backdrop Overlay (สำหรับจอมือถือ/แท็บเล็ต) */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden transition-opacity"
      />

      {/* 2. Main Container: Bottom Sheet on Mobile, Right Panel on Desktop */}
      <aside 
        className={`fixed z-[60] bg-[#090909]/95 backdrop-blur-2xl border-[#2F3336] shadow-2xl flex flex-col transition-all duration-300 select-none
          inset-x-0 bottom-0 max-h-[88vh] rounded-t-3xl border-t
          lg:inset-y-0 lg:right-0 lg:left-auto lg:max-h-full lg:rounded-none lg:border-l lg:border-t-0 lg:w-[440px] xl:w-[480px]
        `}
      >
        {/* Mobile Grab Handle Bar */}
        <div className="flex justify-center pt-2.5 pb-1 lg:hidden">
          <div className="w-12 h-1.5 rounded-full bg-white/20" />
        </div>

        {/* Header Bar */}
        <div className="h-[52px] px-3.5 sm:px-5 flex items-center justify-between border-b border-[#2F3336] shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Terminal size={15} strokeWidth={2.2} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11.5px] font-mono font-bold text-[#F2F2F5] tracking-wider uppercase truncate">
                {isEffectiveAdmin ? '👑 DEV CONSOLE' : '🧭 QUEST & BEAT INSPECTOR'}
              </span>
              <span className="text-[10px] text-[#ACACB2] truncate max-w-[170px]">
                {characterName}
              </span>
            </div>
          </div>

          {/* Center/Right: Role Preview Toggle (Only visible for Super Admin) + Close Button */}
          <div className="flex items-center gap-2 shrink-0">
            {role === 'admin' && (
              <div className="flex items-center bg-[#1D1D1F] p-0.5 rounded-full border border-white/10 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setViewMode('admin')}
                  className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                    viewMode === 'admin'
                      ? 'bg-[#EF264C] text-white font-bold'
                      : 'text-[#ACACB2] hover:text-[#F2F2F5]'
                  }`}
                  title="แสดงมุมมอง Admin (ดู System Prompt & Thinking)"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('creator')}
                  className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                    viewMode === 'creator'
                      ? 'bg-[#EF264C] text-white font-bold'
                      : 'text-[#ACACB2] hover:text-[#F2F2F5]'
                  }`}
                  title="จำลองมุมมอง Creator (เห็นเฉพาะบีตเควสต์ ป้องกัน Prompt รั่วไหล)"
                >
                  Creator
                </button>
              </div>
            )}

            {onSwitchToHud && (
              <button
                type="button"
                onClick={onSwitchToHud}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[10.5px] font-mono text-[#ACACB2] hover:text-[#F2F2F5] border border-white/10 flex items-center gap-1 transition-all cursor-pointer shrink-0"
                title="สลับไปหน้าต่างสถานะตัวละคร (Character HUD)"
              >
                <span>👤 HUD</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-[#ACACB2] hover:text-[#F2F2F5] flex items-center justify-center transition-all cursor-pointer shrink-0"
              title="ปิดหน้าต่างตรวจสอบ"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 overscroll-contain">
          {/* Section 1: Live State Pills */}
          <LiveStatePills gauges={liveGauges} />

          {/* Section 2: Quest & Beat Tracker */}
          <QuestBeatTracker questState={questState} />

          {/* Section 3: Interactive Turn Logs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#ACACB2]">
                ประวัติเทิร์น ({turnLogs.length} รอบ)
              </span>
              <span className="text-[10.5px] text-[#ACACB2]/60">
                {isEffectiveAdmin ? 'โหมด Developer (แสดง Prompt)' : 'โหมด Creator (แสดงบีท)'}
              </span>
            </div>

            {turnLogs.length === 0 ? (
              <div className="py-10 text-center text-[12px] font-mono text-[#ACACB2]/50 bg-white/[0.01] border border-white/5 rounded-2xl">
                รอเริ่มการสนทนา... ส่งข้อความแรกเพื่อเริ่มตรวจสอบ
              </div>
            ) : (
              <div className="space-y-2">
                {turnLogs.map((log) => {
                  if (log.type === 'system_alert') {
                    return (
                      <div 
                        key={log.id} 
                        className={`p-3 rounded-xl border flex items-start gap-2.5 text-[11.5px] font-mono leading-relaxed ${
                          log.alertType === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                            : log.alertType === 'warning'
                            ? 'bg-amber-500/10 border-amber-500/25 text-amber-300'
                            : 'bg-white/[0.03] border-white/10 text-[#ACACB2]'
                        }`}
                      >
                        {log.alertType === 'success' ? (
                          <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <strong className="block font-bold">{log.message}</strong>
                          {log.detail && <span className="opacity-90">{log.detail}</span>}
                        </div>
                      </div>
                    )
                  }

                  const isExpanded = expandedTurnId === log.id

                  return (
                    <div 
                      key={log.id} 
                      className="rounded-2xl border border-[#2F3336] bg-[#121214]/60 overflow-hidden transition-all"
                    >
                      {/* Accordion Turn Header */}
                      <button
                        type="button"
                        onClick={() => setExpandedTurnId(isExpanded ? null : log.id)}
                        className="w-full px-3.5 py-3 flex items-center justify-between hover:bg-white/[0.03] transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <span className="text-[11px] font-mono font-bold text-[#EF264C] bg-[#EF264C]/10 border border-[#EF264C]/20 px-2 py-0.5 rounded-full shrink-0">
                            Turn {log.turnNumber || '-'}
                          </span>
                          <span className="text-[12px] font-mono text-[#F2F2F5] truncate">
                            {log.userMsg || '...'}
                          </span>
                        </div>
                        <div className="text-[#ACACB2] shrink-0">
                          {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                        </div>
                      </button>

                      {/* Accordion Content */}
                      {isExpanded && (
                        <div className="p-3 border-t border-[#2F3336] bg-black/40 space-y-3">
                          {isEffectiveAdmin ? (
                            /* Admin: Full Multi-Agent Prompt, Thinking & Output View */
                            <AgentInspectorView turnLog={log} />
                          ) : (
                            /* Creator: Safe Output & Decision Summary (No System Prompt!) */
                            <div className="space-y-2 text-[11.5px] font-mono">
                              {log.actor?.response && (
                                <div className="p-3 bg-[#1D1D1F]/70 rounded-xl border border-white/5 space-y-1">
                                  <span className="text-rose-400 font-bold block text-[11px]">
                                    🎭 ACTOR RESPONSE
                                  </span>
                                  <p className="text-[#F2F2F5] text-[12px] leading-relaxed">
                                    {typeof log.actor.response === 'object'
                                      ? (log.actor.response.dialogue || JSON.stringify(log.actor.response))
                                      : log.actor.response}
                                  </p>
                                </div>
                              )}
                              {log.director?.response && log.director.response.voice_over && (
                                <div className="p-3 bg-[#1D1D1F]/70 rounded-xl border border-white/5 space-y-1">
                                  <span className="text-amber-400 font-bold block text-[11px]">
                                    🎬 DIRECTOR (VOICE OVER)
                                  </span>
                                  <p className="text-[#ACACB2] italic text-[12px]">
                                    "{log.director.response.voice_over}"
                                  </p>
                                </div>
                              )}
                              <div className="text-[10.5px] text-[#ACACB2]/60 pt-1 text-center">
                                🔒 ระบบปลอดภัย: โค้ด Prompt ตัวเต็มถูกสงวนสิทธิ์เฉพาะระดับ Engine Developer
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

export default CompanionInspectorDrawer
