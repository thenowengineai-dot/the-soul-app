import { useState } from 'react'
import { Copy, Check, BrainCircuit, Code, MessageSquareCode } from 'lucide-react'
import type { AgentType, TurnLogEntry } from '../types'

interface AgentInspectorViewProps {
  turnLog: TurnLogEntry
}

export function AgentInspectorView({ turnLog }: AgentInspectorViewProps) {
  const [activeAgent, setActiveAgent] = useState<AgentType>('actor')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return
    navigator.clipboard.writeText(typeof text === 'object' ? JSON.stringify(text, null, 2) : text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const agentData = turnLog[activeAgent]

  return (
    <div className="flex flex-col gap-3 p-3.5 bg-[#121214] rounded-2xl border border-[#2F3336]">
      {/* 1. Agent Switcher Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#1D1D1F] rounded-xl border border-white/5">
        {(['actor', 'director', 'evaluator'] as AgentType[]).map((agent) => (
          <button
            key={agent}
            type="button"
            onClick={() => setActiveAgent(agent)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer text-center ${
              activeAgent === agent
                ? 'bg-[#2F3336] text-[#F2F2F5] shadow-sm'
                : 'text-[#ACACB2] hover:text-[#F2F2F5] hover:bg-white/5'
            }`}
          >
            {agent === 'actor' ? '🎭 ACTOR' : agent === 'director' ? '🎬 DIRECTOR' : '⚖️ EVALUATOR'}
          </button>
        ))}
      </div>

      {/* 2. Agent Content */}
      {!agentData || (!agentData.prompt && !agentData.response && !agentData.thinking) ? (
        <div className="py-6 text-center text-[12px] font-mono text-[#ACACB2]/60">
          ยังไม่มีข้อมูล Debug ของ {activeAgent.toUpperCase()} ในเทิร์นนี้
        </div>
      ) : (
        <div className="space-y-3">
          {/* A. Thinking / Reasoning Section */}
          {(agentData.thinking || (agentData.response && agentData.response.reasoning)) && (
            <div className="flex flex-col rounded-xl overflow-hidden border border-purple-500/20 bg-purple-950/10">
              <div className="flex items-center justify-between px-3 py-1.5 bg-purple-900/20 border-b border-purple-500/20 text-[10.5px] font-mono font-bold text-purple-300">
                <span className="flex items-center gap-1.5">
                  <BrainCircuit size={12} className="text-purple-400" />
                  <span>AI THINKING / REASONING</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(agentData.thinking || agentData.response?.reasoning || '', 'thinking')}
                  className="hover:text-white transition-colors cursor-pointer"
                  title="คัดลอกข้อความ"
                >
                  {copiedField === 'thinking' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
              <div className="p-3 text-[11.5px] font-mono text-purple-200/90 leading-relaxed whitespace-pre-wrap max-h-[160px] overflow-y-auto">
                {agentData.thinking || agentData.response?.reasoning}
              </div>
            </div>
          )}

          {/* B. AI Raw Output JSON */}
          {agentData.response && (
            <div className="flex flex-col rounded-xl overflow-hidden border border-[#2F3336] bg-[#090909]">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#1D1D1F] border-b border-[#2F3336] text-[10.5px] font-mono font-bold text-[#ACACB2]">
                <span className="flex items-center gap-1.5">
                  <Code size={12} className="text-emerald-400" />
                  <span className="text-[#F2F2F5]">RAW OUTPUT (JSON)</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(agentData.response, 'output')}
                  className="hover:text-white transition-colors cursor-pointer"
                  title="คัดลอก JSON"
                >
                  {copiedField === 'output' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
              <div className="p-3 max-h-[220px] overflow-y-auto font-mono text-[11px] text-emerald-400 leading-relaxed">
                <pre className="whitespace-pre-wrap break-words">
                  {typeof agentData.response === 'object'
                    ? JSON.stringify(agentData.response, null, 2)
                    : agentData.response}
                </pre>
              </div>
            </div>
          )}

          {/* C. Input Prompt Sent to AI */}
          {agentData.prompt && (
            <div className="flex flex-col rounded-xl overflow-hidden border border-[#2F3336] bg-[#090909]">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#1D1D1F] border-b border-[#2F3336] text-[10.5px] font-mono font-bold text-[#ACACB2]">
                <span className="flex items-center gap-1.5">
                  <MessageSquareCode size={12} className="text-[#EF264C]" />
                  <span className="text-[#F2F2F5]">INPUT PROMPT SENT TO AI</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(agentData.prompt || '', 'prompt')}
                  className="hover:text-white transition-colors cursor-pointer"
                  title="คัดลอก Prompt"
                >
                  {copiedField === 'prompt' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
              <div className="p-3 max-h-[260px] overflow-y-auto font-mono text-[11px] text-[#ACACB2] leading-relaxed">
                <pre className="whitespace-pre-wrap break-words">
                  {agentData.prompt}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AgentInspectorView
