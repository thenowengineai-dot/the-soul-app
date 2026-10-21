import { useState, useEffect } from 'react'
import {
  Globe,
  CloudRain,
  Sun,
  Moon,
  Clock,
  Compass,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react'
import type {
  StageCellCluster,
  WorldEra,
  WorldBiome,
  TimeOfDay,
  WeatherCondition,
} from '../spatialStageTypes'
import {
  CAMPUS_QUADRANT_PRESET,
  IWABURO_RYOKAN_PRESET,
} from '../spatialMockPresets'

interface WorldStageCardProps {
  cluster?: StageCellCluster
  onClusterChange?: (cluster: StageCellCluster) => void
  onSpatialPromptChange?: (promptSnippet: string) => void
}

export function WorldStageCard({
  cluster: externalCluster,
  onClusterChange,
  onSpatialPromptChange,
}: WorldStageCardProps) {
  const [internalCluster, setInternalCluster] = useState<StageCellCluster>(CAMPUS_QUADRANT_PRESET)
  const cluster = externalCluster ?? internalCluster

  const setCluster = (updater: (prev: StageCellCluster) => StageCellCluster) => {
    const next = updater(cluster)
    if (onClusterChange) {
      onClusterChange(next)
    } else {
      setInternalCluster(next)
    }
  }

  // Switch between Campus and Iwaburo presets
  const handleSelectPreset = (presetKey: 'campus' | 'iwaburo') => {
    const next = presetKey === 'campus' ? CAMPUS_QUADRANT_PRESET : IWABURO_RYOKAN_PRESET
    if (onClusterChange) {
      onClusterChange(next)
    } else {
      setInternalCluster(next)
    }
  }

  // Update atmosphere
  const updateAtmosphere = (
    updates: Partial<{
      era: WorldEra
      biome: WorldBiome
      timeOfDay: TimeOfDay
      weather: WeatherCondition
    }>
  ) => {
    setCluster((prev) => ({ ...prev, ...updates }))
  }

  // Generate Lean Prompt Snippet for Actor Injection
  const generatePromptSnippet = () => {
    const eraText =
      cluster.era === 'ancient'
        ? 'ยุคอดีต/ญี่ปุ่นดั้งเดิม'
        : cluster.era === 'contemporary'
        ? 'ยุคร่วมสมัยปัจจุบัน 2026'
        : 'ยุคอนาคตไซเบอร์นัวร์'

    const timeText =
      cluster.timeOfDay === 'afternoon'
        ? 'บ่าย'
        : cluster.timeOfDay === 'golden_hour'
        ? 'แดดยามเย็นสีส้มจัด (Golden Hour)'
        : cluster.timeOfDay === 'twilight'
        ? 'ทไวไลท์โพล้เพล้'
        : 'กลางดึกมืดสนิท'

    const weatherText =
      cluster.weather === 'heavy_rain_storm'
        ? 'พายุฝนกระหน่ำ ฟ้าแลบเป็นพักๆ อากาศหนาวเย็น'
        : cluster.weather === 'foggy'
        ? 'หมอกหนาทึบ ไอชื้นลอยกรุ่น'
        : cluster.weather === 'clear'
        ? 'ฟ้าโปร่ง อากาศสงบนิ่ง'
        : 'หิมะโปรยปราย อากาศเย็นจัด'

    const cell = Object.values(cluster.cells)[0]

    return `[PHYSICAL STAGE & SPATIAL REALITY]
- ยุคสมัยและบรรยากาศ: ${eraText} | ${cluster.name} | เวลา: ${timeText} | สภาพอากาศ: ${weatherText}
- โครงสร้างผืนเวที: ${cell?.name || 'พื้นที่เปิด'} (มีสัจธรรมขอบเขต กำแพง และประตูเชื่อมต่อชัดเจน)
- ตำแหน่งของคุณ (Mahiro): ประจำอยู่ที่จุดพิกัดในแปลน มีสิ่งของในระยะเอื้อมมือ
- ตำแหน่งผู้เล่น (Player): ยืนอยู่ตามพิกัดในแปลน คุณต้องมองเห็นระยะห่างและเคารพสิ่งกีดขวางที่กั้นอยู่จริง
- กฎสรีระเชิงพื้นที่: ห้ามจินตนาการการสัมผัสหรือก้าวข้ามกำแพง/ประตูกั้นที่อยู่นอกระยะจริงโดยเด็ดขาด`
  }

  const promptSnippet = generatePromptSnippet()

  useEffect(() => {
    onSpatialPromptChange?.(promptSnippet)
  }, [promptSnippet, onSpatialPromptChange])

  return (
    <div className="space-y-4">
      {/* Header Capsule */}
      <div className="flex items-center justify-between gap-2 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Globe size={16} />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-[#F1F1F1] tracking-tight">
              ผืนเวทีและโลก (World & Spatial Stage)
            </h3>
            <p className="text-[11px] text-white/50 font-mono">
              World DNA & Atmospheric Envelope
            </p>
          </div>
        </div>

        {/* Preset Switcher Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => handleSelectPreset('campus')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
              cluster.clusterId === 'campus_quadrant'
                ? 'bg-white/20 text-white font-semibold shadow-sm'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            แคมปัสมหาลัย
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('iwaburo')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
              cluster.clusterId === 'iwaburo_ryokan'
                ? 'bg-white/20 text-white font-semibold shadow-sm'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            ออนเซ็นเรียวกัง
          </button>
        </div>
      </div>

      {/* Layer 1 & 2: Macro World & Atmospheric Envelope Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11.5px] font-mono">
        {/* World DNA Controls */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-white/60 text-[10.5px] uppercase font-semibold">
            <span className="flex items-center gap-1.5">
              <Compass size={12} className="text-amber-400" />
              1. World DNA (ยุคและภูมิประเทศ)
            </span>
            <span className="text-white/40">{cluster.era}</span>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {(
              [
                { id: 'ancient', label: 'โบราณ' },
                { id: 'contemporary', label: 'ปัจจุบัน' },
                { id: 'cyber_noir', label: 'ไซเบอร์' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => updateAtmosphere({ era: item.id })}
                className={`py-1 rounded-lg text-center transition-all cursor-pointer ${
                  cluster.era === item.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                    : 'bg-white/[0.04] text-white/50 border border-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Atmosphere Envelope Controls */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-white/60 text-[10.5px] uppercase font-semibold">
            <span className="flex items-center gap-1.5">
              <CloudRain size={12} className="text-[#38bdf8]" />
              2. Atmospheric Envelope (สภาพอากาศ & เวลา)
            </span>
            <span className="text-[#38bdf8]">{cluster.weather}</span>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {(
              [
                { id: 'afternoon', label: 'บ่าย', icon: Sun },
                { id: 'golden_hour', label: 'อัสดง', icon: Sparkles },
                { id: 'twilight', label: 'ทไวไลท์', icon: Clock },
                { id: 'midnight', label: 'ดึก', icon: Moon },
              ] as const
            ).map((timeItem) => {
              const Icon = timeItem.icon
              return (
                <button
                  key={timeItem.id}
                  type="button"
                  onClick={() => updateAtmosphere({ timeOfDay: timeItem.id })}
                  className={`py-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    cluster.timeOfDay === timeItem.id
                      ? 'bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40 font-semibold'
                      : 'bg-white/[0.04] text-white/50 border border-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={10} />
                  <span>{timeItem.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Layer 3: Spatial Status Pill (Now elevated to Right HUD) */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <Layers size={13} className="text-amber-400" />
          <span className="text-white/80 font-medium">3. ผืนเวที & แผนที่พิมพ์เขียว (Living Blueprint):</span>
        </div>
        <span className="text-amber-300 font-semibold text-[10.5px] px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/35">
          แสดงผลบน HUD ฝั่งขวา (Right HUD)
        </span>
      </div>

      {/* Lean Prompt Injection Snapshot */}
      <div className="p-3 rounded-2xl bg-black/50 border border-white/10 font-mono text-[11px] space-y-1.5">
        <div className="flex items-center justify-between text-white/50 text-[10px] uppercase tracking-wider">
          <span>Lean Prompt Injected to Actor:</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <Check size={11} /> 100% IN SYNC
          </span>
        </div>
        <pre className="text-white/75 whitespace-pre-wrap leading-relaxed bg-white/[0.03] p-2 rounded-xl border border-white/[0.05] text-[10.5px]">
          {promptSnippet}
        </pre>
      </div>
    </div>
  )
}
