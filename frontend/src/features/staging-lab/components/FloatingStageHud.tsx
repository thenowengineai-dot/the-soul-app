import { useState } from 'react'
import {
  Copy,
  Check,
  Minimize2,
  Eye,
  EyeOff,
  Clapperboard,
  Layers
} from 'lucide-react'

export const DEFAULT_WINGARDIUM_CODEX = `### 1. [THRESHOLD & ARRIVAL: ธรณีประตูและทางเข้า]
ทางเดินหินแกรนิตด้านนอกทอดผ่านระเบียงทางเชื่อมที่ลมภูเขาพัดหวีดหวิวเบาๆ 
ก่อนจะสิ้นสุดลงที่บานประตูไม้โอ๊กทรงโค้งยอดแหลม (Gothic Arch) หนาหนักและเต็มไปด้วยหมุดเหล็กสีสนิมดำ 
เมื่อผลักบานประตูเข้าไป บานพับทองเหลืองจะส่งเสียงครางแผ่วเบา 
ธรณีประตูหินด้านล่างเว้าแหว่งเป็นร่องตื้นจากการเหยียบย่ำของนักเรียนนับร้อยรุ่น 
ก้าวข้ามผ่านกลิ่นอายความเย็นเยียบของโถงทางเดิน เข้าสู่ความอบอุ่นที่โอบล้อมในทันที

---

### 2. [SPATIAL VOLUME & VERTICALITY: มิติ ปริมาตร และความสูงต่ำของห้อง]
ห้องเรียนเป็นอัฒจันทร์ครึ่งวงกลมยกระดับลาดต่ำลงสู่ใจกลางห้อง 
เพดานหินโค้งสูงลิบลิ่วจนเกือบมองไม่เห็นโครงขื่อไม้โอ๊กสีเข้มด้านบน ปริมาตรอากาศในแนวดิ่งถูกเปิดโล่งเพื่อรองรับคาถาลอยตัวโดยเฉพาะ 
โต๊ะเรียนไม้ยาวและม้านั่งเรียงโค้งลดหลั่นกันลงมาเป็นขั้นบันไดสามชั้น โอบล้อมลานสาธิตวงกลมตรงก้นกระทะ 
ซึ่งเป็นจุดต่ำสุดของห้อง ทำให้ทุกสายตาถูกบีบให้จับจ้องลงไปที่จุดกึ่งกลางอย่างหลีกเลี่ยงไม่ได้

---

### 3. [LIGHT DRAMATURGY & PARTICLES: การทอดแสง ฝุ่นละออง และมุมมืด]
แสงแดดยามบ่ายสาดทะลุกระจกสีทรงสูงแคบด้านทิศตะวันตก ลำแสงสีทองเข้มตัดเฉียงข้ามห้องเรียนเป็นลำชัดเจน 
อากาศในห้องไม่ได้ว่างเปล่า แต่เต็มไปด้วย "ชีวิต":
* มีเศษละอองขนห่านสีขาวละเอียดและฝุ่นผงชอล์กเคว้งคว้างอย่างเชื่องช้าอยู่ในลำแสงแดด
* มุมชั้นบนสุดของอัฒจันทร์จมอยู่ในเงามัวอบอุ่นของแสงเทียนติดผนัง
* ขณะที่พื้นลานตรงกลางสว่างจ้าด้วยลำแสงธรรมชาติ เน้นให้เห็นทุกองศาการสะบัดข้อมือของไม้กายสิทธิ์

---

### 4. [LIVING TACTILITY, SCENT & SOUNDSCAPE: พร็อพที่มีชีวิต กลิ่นสัมผัส และเสียงสะท้อน]
* กลิ่นสัมผัส: กลิ่นหมึกพิมพ์ผสมไอร้อนของกระดาษพาร์ชเมนต์เก่า, กลิ่นขี้ผึ้งขัดเงาบนเนื้อไม้, และกลิ่นหอมสะอาดจางๆ คล้ายสมุนไพรแห้งที่ใช้ดับฝุ่น
* เสียงแวดล้อม: เสียงขูดขีดของหัวปากกาขนนกที่กำลังจดโน้ต, เสียงกระซิบซ้อมท่องคาถา "วิง-การ์-เดียม เล-วิ-โอ-ซา" ที่ก้องสะท้อนกังวานด้วยโครงสร้างเพดานโค้ง, และเสียง “พรึ่บ” เบาหวิวของกระแสลมทุกครั้งที่มีคนเริ่มขยับไม้
* ผิวสัมผัส: โต๊ะไม้เบิร์ชตรงหน้าคุณเย็นเรียบ มีรอยหมึกหกซึมเป็นดวงและรอยขูดขีดจากปลายไม้กายสิทธิ์รุ่นก่อนๆ วางอยู่ตรงหน้าคือ ขนห่านสีขาวบริสุทธิ์หนึ่งก้าน ก้านของมันแห้งสาก แต่เส้นขนด้านบนนุ่มฟู ไหวระริกแม้เพียงแค่ลมหายใจรด

---

### 5. [POWER ANCHOR & STAGING: จุดปักหลักแห่งอำนาจและตำแหน่งของตัวละคร]
* จุดคุมอำนาจ: ศาสตราจารย์ฟลิตวิกยืนอยู่ ณ ใจกลางลานต่ำสุดของห้อง บนกองหนังสือปกหนังหนาเตอะที่ซ้อนกันสูงถึงระดับเอวเพื่อชดเชยสัดส่วน เขายืนตัวตรง อกผึ่ง ไม้กายสิทธิ์ในมือถือเฉียง 45 องศาอย่างประณีต แววตาคมกริบกวาดมองตรวจตราขึ้นมาตามขั้นบันไดอย่างคาดหวัง
* ตำแหน่งของคุณ: คุณนั่งอยู่ที่อัฒจันทร์แถวที่สอง ปลายเท้าเหยียบบนขั้นไม้ที่ส่งเสียงลั่นเอี๊ยดเบาๆ มือขวากระชับด้ามไม้กายสิทธิ์ที่เริ่มอุ่นขึ้นจากอุณหภูมิฝ่ามือ ปลายไม้อยู่ห่างจากก้านขนห่านเพียงหนึ่งคืบ
* แรงปะทะทางสายตา: ศาสตราจารย์หยุดสายตาลงที่ข้อมือของคุณชั่วครู่ รอยยิ้มพึงพอใจปรากฏที่มุมปากขณะที่เขาพยักหน้าส่งสัญญาณเชิงสั่ง: 
  “โบกนิด สะบัดหน่อย... เริ่มได้!” ขนห่านตรงหน้าคุณกระตุกไหวเล็กน้อย รอรับพลังเวทที่กำลังจะถูกปลดปล่อย`

interface FloatingStageHudProps {
  content?: string
  latencyMs?: number
  modelName?: string
  isOpen: boolean
  onToggleOpen: () => void
  onRunDirector?: (codexText: string) => void
  styleOffsetRight?: string
}

export function FloatingStageHud({
  content = DEFAULT_WINGARDIUM_CODEX,
  latencyMs = 0,
  modelName = 'gemini-3.8-flash',
  isOpen,
  onToggleOpen,
  onRunDirector,
  styleOffsetRight = 'right-6',
}: FloatingStageHudProps) {
  const [copied, setCopied] = useState(false)
  const [isPeekMode, setIsPeekMode] = useState(false) // โหมดเบลอย่อ vs ดูเต็ม

  const displayContent = (content && content.trim()) ? content : DEFAULT_WINGARDIUM_CODEX

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  // Minimized Floating Pill Badge (Exact consistency with Somatic HUD Pill)
  if (!isOpen) {
    return (
      <div className={`absolute top-[46px] ${styleOffsetRight} z-30 select-none`}>
        <button
          type="button"
          onClick={onToggleOpen}
          className="h-7 px-3 rounded-full backdrop-blur-xl border transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm bg-black/50 hover:bg-black/70 border-white/15 text-white/90 hover:text-white"
          title="คลิกเพื่อเปิดแผงตรวจวัดผืนเวที Stage HUD"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
          <span className="text-[11px] sm:text-[11.5px] font-mono font-medium tracking-tight">STAGE HUD</span>
          {latencyMs > 0 && (
            <>
              <span className="opacity-30 text-[10px]">•</span>
              <span className="text-[11px] font-mono font-medium text-amber-300">
                {latencyMs}ms
              </span>
            </>
          )}
        </button>
      </div>
    )
  }

  // Expanded Floating HUD (Exact Apple Dark Glass surface parity: rounded-2xl, bg-black/40, backdrop-blur-2xl, border-white/10, shadow-2xl)
  return (
    <div
      className={`absolute top-[46px] ${styleOffsetRight} z-30 w-[350px] sm:w-[380px] max-h-[82vh] flex flex-col rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl p-4 select-none transition-all`}
    >
      {/* Top Header: Amber Pulse Indicator + Controls */}
      <div className="flex items-center justify-between gap-1 mb-2.5 pb-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.85)] animate-pulse" />
          <span className="text-[11px] font-mono font-semibold uppercase text-white/80 tracking-wider">
            STAGE HUD • MIND CODEX
          </span>
          <span className="text-[9.5px] font-mono text-amber-400/70 px-1.5 py-0.2 rounded bg-amber-400/10 border border-amber-400/20">
            5D
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="คัดลอกมโนทัศน์ทั้งหมด"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          </button>

          {/* Peek / Blur Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsPeekMode(!isPeekMode)}
            className={`w-6 h-6 rounded flex items-center justify-center transition-all cursor-pointer ${
              isPeekMode ? 'text-amber-400 bg-amber-400/10' : 'text-white/40 hover:text-white hover:bg-white/10'
            }`}
            title={isPeekMode ? 'สลับเป็นโหมดดูเต็ม' : 'สลับเป็นโหมดเบลอย่อ (Peek Mode)'}
          >
            {isPeekMode ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>

          {/* Minimize Button */}
          <button
            type="button"
            onClick={onToggleOpen}
            className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="ย่อแผง HUD"
          >
            <Minimize2 size={12} />
          </button>
        </div>
      </div>

      {/* Meta Bar: Model & Latency */}
      <div className="flex items-center justify-between text-[10px] font-mono text-white/40 mb-2 shrink-0">
        <div className="flex items-center gap-1">
          <Layers size={10} className="text-amber-400/70" />
          <span>CELL SUBSTRATE</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{modelName}</span>
          {latencyMs > 0 && <span className="text-amber-400">{latencyMs}ms</span>}
        </div>
      </div>

      {/* Scrollable Codex Body with Peek/Blur Support */}
      <div className="relative flex-1 overflow-hidden flex flex-col">
        <div
          className={`flex-1 overflow-y-auto pr-1 space-y-3.5 text-[12px] leading-relaxed no-scrollbar ${
            isPeekMode ? 'max-h-[220px]' : 'max-h-[56vh]'
          }`}
        >
          {displayContent.split('---').map((section, idx) => {
            const cleanSection = section.trim()
            if (!cleanSection) return null

            // Extract section title (### X. [...]) and body
            const lines = cleanSection.split('\n')
            const titleLine = lines[0] || ''
            const bodyLines = lines.slice(1).join('\n').trim()

            return (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-all"
              >
                <div className="text-amber-300 font-semibold text-[11.5px] font-sans tracking-tight mb-1 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-amber-400/80" />
                  <span>{titleLine.replace(/^###\s*/, '')}</span>
                </div>
                <div className="text-[#AAAAAA] font-sans text-[11px] leading-relaxed whitespace-pre-wrap">
                  {bodyLines}
                </div>
              </div>
            )
          })}
        </div>

        {/* Peek Mode Blur Fade Glass Overlay */}
        {isPeekMode && (
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black via-black/80 to-transparent backdrop-blur-[2px] flex items-end justify-center pb-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => setIsPeekMode(false)}
              className="px-3 py-1 rounded-full bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
            >
              <Eye size={11} />
              <span>คลิกเพื่อดูเต็ม (Expand All)</span>
            </button>
          </div>
        )}
      </div>

      {/* Future Director Bridge Slot (Action Button) */}
      <div className="pt-2.5 mt-2 border-t border-white/10 shrink-0">
        <button
          type="button"
          onClick={() => {
            if (onRunDirector) {
              onRunDirector(displayContent)
            }
          }}
          className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/30 text-white/50 hover:text-amber-200 text-[11px] font-mono transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] group"
          title="เตรียมพร้อมสำหรับนำผืนเวทีนี้ฉีดเป็นบริบทให้ AI Director ในเฟสถัดไป"
        >
          <Clapperboard size={12} className="text-white/40 group-hover:text-amber-400 transition-colors" />
          <span>🎬 นำผืนเวทีเข้าสู่ฉาก (Run Director)</span>
          <span className="text-[9px] px-1 py-0.2 rounded bg-white/5 text-white/30 border border-white/10 ml-1">
            COMING SOON
          </span>
        </button>
      </div>
    </div>
  )
}

export default FloatingStageHud
