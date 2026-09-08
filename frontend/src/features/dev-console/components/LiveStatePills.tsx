import { Heart, Flame, Shield, Activity, Sparkles } from 'lucide-react'
import type { LiveStateGauges } from '../types'

interface LiveStatePillsProps {
  gauges?: LiveStateGauges
}

export function LiveStatePills({ gauges }: LiveStatePillsProps) {
  const g: LiveStateGauges = gauges || {
    affection: 0,
    desire: 0,
    tension: 0,
    stance: 'NEUTRAL',
    chaosLevel: 'LOW',
  }

  return (
    <div className="flex flex-col gap-2 p-3.5 bg-[#121214]/80 backdrop-blur-md rounded-2xl border border-[#2F3336]">
      {/* 1. Primary Numerical Gauges: AFF, DES, Tension, Chaos */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Affection Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1D1D1F] border border-white/5 text-[11.5px] font-mono">
          <Heart size={12} className="text-rose-400" />
          <span className="text-[#ACACB2]">AFF</span>
          <span className="font-bold text-[#F2F2F5]">{g.affection}/100</span>
        </div>

        {/* Desire Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1D1D1F] border border-white/5 text-[11.5px] font-mono">
          <Flame size={12} className="text-purple-400" />
          <span className="text-[#ACACB2]">DES</span>
          <span className="font-bold text-[#F2F2F5]">{g.desire}/100</span>
        </div>

        {/* Tension Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1D1D1F] border border-white/5 text-[11.5px] font-mono">
          <Activity size={12} className="text-amber-400" />
          <span className="text-[#ACACB2]">TENSION</span>
          <span className="font-bold text-[#F2F2F5]">{g.tension}/3</span>
        </div>

        {/* Chaos Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1D1D1F] border border-white/5 text-[11.5px] font-mono">
          <Sparkles size={12} className="text-cyan-400" />
          <span className="text-[#ACACB2]">CHAOS</span>
          <span className="font-bold text-[#F2F2F5] uppercase">{g.chaosLevel || 'LOW'}</span>
        </div>

        {/* Stance Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1D1D1F] border border-white/5 text-[11.5px] font-mono">
          <Shield size={12} className="text-blue-400" />
          <span className="text-[#ACACB2]">STANCE</span>
          <span className="font-bold text-[#F2F2F5] uppercase">{g.stance || 'NEUTRAL'}</span>
        </div>
      </div>

      {/* 2. Kinematics & Postures: A_POS, P_POS, Dominance */}
      <div className="pt-2 border-t border-white/5 flex flex-col gap-1 text-[11px] font-mono">
        <div className="flex items-start gap-1.5 text-[#ACACB2] truncate">
          <span className="text-cyan-400 font-bold shrink-0">P_POS:</span>
          <span className="text-[#F2F2F5] truncate">{g.playerPosture || 'คงท่าเดิม'}</span>
        </div>
        <div className="flex items-start gap-1.5 text-[#ACACB2] truncate">
          <span className="text-fuchsia-400 font-bold shrink-0">A_POS:</span>
          <span className="text-[#F2F2F5] truncate">{g.actorPosture || 'ยืน/นั่งอิสระตามบริบท'}</span>
        </div>
        {(g.dominanceState || g.actionLock) && (
          <div className="flex items-center gap-3 pt-0.5 text-[10.5px]">
            {g.dominanceState && (
              <span className="text-[#ACACB2]">
                DOM: <strong className={g.dominanceState === 'ACTOR_DOMINANT' ? 'text-[#EF264C]' : 'text-zinc-300'}>{g.dominanceState}</strong>
              </span>
            )}
            {g.actionLock !== undefined && (
              <span className="text-[#ACACB2]">
                LOCK: <strong className={g.actionLock ? 'text-[#EF264C]' : 'text-zinc-500'}>{g.actionLock ? 'TRUE' : 'FALSE'}</strong>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default LiveStatePills
