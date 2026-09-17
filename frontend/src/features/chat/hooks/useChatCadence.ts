import { useState, useRef, useCallback, useEffect } from 'react'

export interface CadenceItem {
  id: string | number
  type: 'vo' | 'action' | 'msg'
  text: string
  sender?: 'me' | 'them'
  read?: boolean
}

/** 🌟 ระดับโมเดลที่ส่งผลต่อจังหวะคิดและการซื้อเวลา (Hesitation Profile) */
export type CadenceModelTier = 'flash_lite' | 'flash_think_low' | 'flash_think_medium'

export interface ModelHesitationProfile {
  /** เวลารอให้อ่านข้อความผู้เล่น (~1.1s - 1.4s) เพื่อให้ "อ่านแล้ว" ปรากฏเร็วทันใจ */
  readDelayMs: number
  /** ช่องว่างจาก "อ่านแล้ว" ไปถึงเริ่ม Typing (~650ms - 850ms) ตามจังหวะใส่ใจเดิม */
  readToTypingGapMs: number
  /** เวลาขึ้น Typing Indicator ขั้นต่ำ เพื่อซื้อเวลาและจำลองการคิด/ลังเล (Hesitation Typing) */
  minTypingMs: number
  /** ตัวคูณเวลาพิมพ์ตามความยาวตัวอักษร */
  typingCharMs: number
  /** เพดานเวลาพิมพ์สูงสุด */
  maxTypingMs: number
}

/** 🎭 ตารางจังหวะทางจิตวิทยาแยกตามประเภทโมเดล */
export const MODEL_HESITATION_PROFILES: Record<CadenceModelTier, ModelHesitationProfile> = {
  flash_lite: {
    readDelayMs: 1100,       // อ่านไวมาก (~1.1s)
    readToTypingGapMs: 650,  // พัก 0.65s เท่าเดิม
    minTypingMs: 2200,       // พิมพ์กระชับฉับไว (~2.2s)
    typingCharMs: 18,
    maxTypingMs: 3200,
  },
  flash_think_low: {
    readDelayMs: 1250,       // อ่านไวแบบธรรมชาติ (~1.25s)
    readToTypingGapMs: 700,  // พัก 0.70s เท่าเดิม
    minTypingMs: 3000,       // พิมพ์มีจังหวะนึก ลังเลนิดหน่อย ซื้อเวลา ~3.0s
    typingCharMs: 22,
    maxTypingMs: 4200,
  },
  flash_think_medium: {
    readDelayMs: 1400,       // อ่านพอดีๆ (~1.4s)
    readToTypingGapMs: 750,  // พัก 0.75s เท่าเดิม
    minTypingMs: 4000,       // พิมพ์นาน คิดหนัก/ลังเลคัดสรรคำพูด ซื้อเวลา ~4.0s
    typingCharMs: 26,
    maxTypingMs: 5500,
  },
}

export interface UseChatCadenceOptions {
  /** เรียกเมื่อถึงจังหวะปล่อยข้อความลงจอจริง */
  onEmitMessage: (message: CadenceItem) => void
  /** เรียกเมื่อถึงจังหวะที่ข้อความของผู้เล่นถูกเปลี่ยนเป็น "อ่านแล้ว" */
  onMarkUserMessageAsRead: () => void
  /** เรียกเมื่อการแสดงผลข้อความในคิวทั้งหมดเสร็จสิ้นสมบูรณ์ */
  onCadenceComplete?: () => void
  /** ระดับโมเดลเริ่มต้นสำหรับคำนวณจังหวะคิด/พิมพ์ (ค่าเริ่มต้น: flash_think_low) */
  defaultModelTier?: CadenceModelTier
}

/**
 * 🎬 useChatCadence: เครื่องยนต์ควบคุมจังหวะและจิตวิทยาการสนทนา (Cinematic Cadence & Pacing)
 * 1. The Stash & Cadence Buffer: กักเก็บข้อความจาก SSE Stream ไว้ในคิว แล้วทยอยปล่อยตามสรีรวิทยาจริงของมนุษย์
 * 2. 3-Beat Rhythm: VO (สงบ 5.5-8.0s) -> Action (ภาษากาย 3.0-4.5s) -> Dialogue (กำลังพิมพ์ 1.2-2.5s)
 * 3. The Hesitation Illusion: โกงเวลาการประมวลผลด้วย Fast Read (~1.2s) + Hesitation Typing (~3-4s)
 * 4. Dynamic Read Receipt: สลับเป็น "อ่านแล้ว" ทันใจ และพัก 700ms ก่อนเริ่มพิมพ์
 * 5. Tap-to-Advance: แตะหน้าจอเพื่อข้ามเวลาหน่วงและปล่อยบับเบิ้ลถัดไปทันที
 */
/** 🌟 ประเภทของ Indicator: จุดไข่ปลาคำพูด (bubble) หรือ ประกายดาวภาษากาย (action) หรือ สัญลักษณ์มีชีวิตสากล (hybrid: ✦ • • •) */
export type CadenceIndicatorVariant = 'bubble' | 'action' | 'hybrid'

export function useChatCadence({
  onEmitMessage,
  onMarkUserMessageAsRead,
  onCadenceComplete,
  defaultModelTier = 'flash_think_low',
}: UseChatCadenceOptions) {
  const [isBotTyping, setIsBotTyping] = useState(false)
  const [indicatorVariant, setIndicatorVariant] = useState<CadenceIndicatorVariant>('hybrid')
  const [isCadenceActive, setIsCadenceActive] = useState(false)

  // คิวของข้อความที่รอการแสดงผล
  const queueRef = useRef<CadenceItem[]>([])
  // บันทึก ID ที่เคยส่งเข้าคิวหรือแสดงผลแล้วเพื่อป้องกันการซ้ำ
  const processedIdsRef = useRef<Set<string | number>>(new Set())
  
  // ระดับโมเดลและโปรไฟล์การซื้อเวลา
  const modelTierRef = useRef<CadenceModelTier>(defaultModelTier)
  // ตัวควบคุม Timer สำหรับ Fast Read & Early Hesitation Typing
  const turnIntroTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingStartTimeRef = useRef<number | null>(null)
  const isEarlyTypingActiveRef = useRef<boolean>(false)

  // ตัวควบคุม Timer ปัจจุบัน
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipResolverRef = useRef<(() => void) | null>(null)
  
  // ติดตามว่าข้อความผู้เล่นรอบนี้ถูก Mark ว่า "อ่านแล้ว" ไปหรือยัง
  const hasMarkedReadRef = useRef(false)
  // สถานะการทำงานของลูป
  const isPlayingRef = useRef(false)

  // เก็บ Callback ไว้ใน Ref เพื่อความเสถียร ไม่ trigger re-render
  const onEmitRef = useRef(onEmitMessage)
  onEmitRef.current = onEmitMessage
  const onMarkReadRef = useRef(onMarkUserMessageAsRead)
  onMarkReadRef.current = onMarkUserMessageAsRead
  const onCompleteRef = useRef(onCadenceComplete)
  onCompleteRef.current = onCadenceComplete

  /**
   * คำนวณเวลาหน่วงตามประเภทและความยาวตัวอักษรจริง (อิงตาม Model Hesitation Profile)
   */
  const calculateDurations = useCallback((item: CadenceItem) => {
    const len = (item.text || '').length
    const profile = MODEL_HESITATION_PROFILES[modelTierRef.current]

    if (item.type === 'vo') {
      // 🌟 VO: ปล่อยให้อ่านบรรยากาศอย่างสงบ (ความยาวจริง ~470 ตัวอักษร -> ~10.3s)
      const readingDuration = Math.min(12000, Math.max(7500, len * 22))
      return { readingDuration, typingDuration: 0 }
    }

    if (item.type === 'action') {
      // 🌟 Action: เว้นจังหวะให้เห็นภาษากายก่อนอ้าปากพูด (กระชับพอดี 3.0s - 5.0s)
      const readingDuration = Math.min(5000, Math.max(3000, len * 20))
      return { readingDuration, typingDuration: 0 }
    }

    // 🌟 Dialogue: คำพูดแชท (คำนวณตาม Model Hesitation Profile เพื่อซื้อเวลาคิด/ลังเล)
    const typingDuration = Math.min(
      profile.maxTypingMs,
      Math.max(profile.minTypingMs, 500 + len * profile.typingCharMs)
    )
    const readingDuration = Math.min(4500, Math.max(2500, len * 25))
    return { readingDuration, typingDuration }
  }, [])

  /**
   * ฟังก์ชัน Promise ที่สามารถยกเลิก/ข้ามได้ทันทีเมื่อเรียก tapToAdvance
   */
  const sleepWithSkip = useCallback((ms: number): Promise<boolean> => {
    return new Promise((resolve) => {
      let resolved = false

      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true
          skipResolverRef.current = null
          timerRef.current = null
          resolve(false) // หมดเวลาตามปกติ (ไม่ได้กด skip)
        }
      }, ms)

      timerRef.current = timer

      skipResolverRef.current = () => {
        if (!resolved) {
          resolved = true
          clearTimeout(timer)
          timerRef.current = null
          skipResolverRef.current = null
          resolve(true) // ถูกข้ามด้วย Tap-to-Advance
        }
      }
    })
  }, [])

  /**
   * ลูปประมวลผลคิวทีละรายการ (The Cadence Player Loop)
   */
  const processQueue = useCallback(async () => {
    if (isPlayingRef.current) return
    isPlayingRef.current = true
    setIsCadenceActive(true)

    while (queueRef.current.length > 0) {
      const currentItem = queueRef.current.shift()
      if (!currentItem) break

      // ตัด Intro Timer ที่อาจกำลังรอรันอยู่ เพราะข้อมูลจริงจากเซิร์ฟเวอร์มาถึงแล้ว
      if (turnIntroTimerRef.current) {
        clearTimeout(turnIntroTimerRef.current)
        turnIntroTimerRef.current = null
      }

      const { readingDuration, typingDuration } = calculateDurations(currentItem)

      if (currentItem.type === 'vo') {
        // 🎬 BEAT 1: VOICE OVER (บรรยายฉาก)
        // 1. ปิด Typing Indicator ทันที (ถ้ากำลังเปิดซื้อเวลาอยู่)
        setIsBotTyping(false)
        isEarlyTypingActiveRef.current = false
        typingStartTimeRef.current = null

        // 2. ปล่อย VO ขึ้นจอทันที
        onEmitRef.current(currentItem)
        // 3. หน่วงเวลาอ่านอย่างสงบ (ไม่ขึ้น "อ่านแล้ว" และไม่ขึ้น Typing)
        await sleepWithSkip(readingDuration)
        // 4. จบ VO -> ถือว่าอีกฝ่ายอ่านแชทแล้ว
        if (!hasMarkedReadRef.current) {
          hasMarkedReadRef.current = true
          onMarkReadRef.current()
        }
        // จังหวะพักสายตาสั้นๆ ให้เห็น "อ่านแล้ว" ก่อนก้อนถัดไปเริ่ม (~650ms - 850ms)
        if (queueRef.current.length > 0) {
          const breathMs = Math.floor(650 + Math.random() * 200)
          await sleepWithSkip(breathMs)
        }
      } else if (currentItem.type === 'action') {
        // 🎬 BEAT 2: ACTION (ภาษากาย)
        // 🌟 แสดง Hybrid Indicator (✦ • • •) สัญลักษณ์สากลแห่งการมีชีวิต
        setIndicatorVariant('hybrid')

        // ถ้ายังไม่ได้ Mark อ่านแล้ว ให้ Mark ทันที
        if (!hasMarkedReadRef.current) {
          hasMarkedReadRef.current = true
          onMarkReadRef.current()
          const readAnticipationMs = Math.floor(550 + Math.random() * 150)
          await sleepWithSkip(readAnticipationMs)
        }

        // เปิด Action Presence Indicator (✦ กำลังเคลื่อนไหว...) ดุ๊กดิ๊กซื้อเวลา
        setIsBotTyping(true)
        const alreadyTypingMs = (isEarlyTypingActiveRef.current && typingStartTimeRef.current)
          ? (Date.now() - typingStartTimeRef.current)
          : 0

        // จังหวะภาษากายซื้อเวลาขั้นต่ำ ~2.0s - 3.2s
        const targetActionPresenceMs = Math.min(3200, Math.max(2000, (currentItem.text || '').length * 15))
        const remainingPresenceMs = Math.max(0, targetActionPresenceMs - alreadyTypingMs)
        if (remainingPresenceMs > 0) {
          await sleepWithSkip(remainingPresenceMs)
        }

        // Action จะปิด Indicator ก่อนแสดงผลภาษากายลงจอ
        setIsBotTyping(false)
        isEarlyTypingActiveRef.current = false
        typingStartTimeRef.current = null

        // ปล่อย Action ขึ้นจอ
        onEmitRef.current(currentItem)
        // เว้นจังหวะหายใจ ให้ผู้เล่นอ่านภาษากายก่อน
        await sleepWithSkip(readingDuration)
        // จังหวะนิ้วพักสั้นๆ ก่อนเริ่มพิมพ์ก้อนถัดไป (ถ้ามี)
        if (queueRef.current.length > 0) {
          const breathMs = Math.floor(450 + Math.random() * 250)
          await sleepWithSkip(breathMs)
        }
      } else {
        // 🎬 BEAT 3: DIALOGUE (คำพูดแชท)
        // 💬 สลับ Indicator เป็น 'bubble' (จุดไข่ปลา 3 จุดพิมพ์ดีด) สำหรับคำพูด!
        setIndicatorVariant('bubble')

        // ถ้ายังไม่ได้ Mark อ่านแล้ว (กรณีเน็ตเวิร์กตอบเร็วกว่า Intro Timer) ให้ Mark ทันที
        if (!hasMarkedReadRef.current) {
          hasMarkedReadRef.current = true
          onMarkReadRef.current()
          const readAnticipationMs = Math.floor(700 + Math.random() * 180)
          await sleepWithSkip(readAnticipationMs)
        }

        // คำนวณว่าจุดไข่ปลา (Typing Indicator) เปิดซื้อเวลาไประหว่างรอโมเดลกี่มิลลิวินาทีแล้ว
        const alreadyTypingMs = (isEarlyTypingActiveRef.current && typingStartTimeRef.current)
          ? (Date.now() - typingStartTimeRef.current)
          : 0

        // ถ้ายังไม่ได้เปิด ให้เปิดจุดไข่ปลา
        setIsBotTyping(true)

        // หักลบเวลาที่พิมพ์ล่วงหน้าระหว่างรอโมเดล ออกจากเวลาพิมพ์จริงของคำพูดก้อนนี้
        const remainingTypingMs = Math.max(0, typingDuration - alreadyTypingMs)
        if (remainingTypingMs > 0) {
          await sleepWithSkip(remainingTypingMs)
        }

        // ปิด Typing Indicator และรีเซ็ตสถานะ Early Typing
        setIsBotTyping(false)
        isEarlyTypingActiveRef.current = false
        typingStartTimeRef.current = null

        // ปล่อยบับเบิ้ลคำพูดลงจอ
        onEmitRef.current(currentItem)

        // 🌟 ถ้ายังมีก้อนถัดไปในคิว:
        if (queueRef.current.length > 0) {
          const nextItem = queueRef.current[0]
          // 🛑 ถ้าก้อนถัดไปเป็น Action หรือ VO: หน่วงเวลาให้อ่านคำพูดก้อนนี้ให้จบก่อน!
          if (nextItem && nextItem.type !== 'msg') {
            await sleepWithSkip(readingDuration)
          } else if (nextItem && nextItem.type === 'msg') {
            // 💬 Dialogue -> Dialogue: เว้นจังหวะให้อ่านก้อนแรกอีกนิดนึง (~850ms - 1,400ms) ให้เป็นธรรมชาติก่อนเริ่มพิมพ์ก้อนถัดไป
            const dialogueReadingPause = Math.min(1400, Math.max(850, (currentItem.text?.length || 0) * 12))
            await sleepWithSkip(dialogueReadingPause)
          }
          const breathMs = Math.floor(450 + Math.random() * 200)
          await sleepWithSkip(breathMs)
        }
      }
    }

    // จบการประมวลผลคิวทั้งหมด
    setIsBotTyping(false)
    isEarlyTypingActiveRef.current = false
    typingStartTimeRef.current = null
    setIsCadenceActive(false)
    isPlayingRef.current = false
    onCompleteRef.current?.()
  }, [calculateDurations, sleepWithSkip])

  /**
   * ใส่ข้อความใหม่เข้าคิว
   */
  const enqueue = useCallback((item: CadenceItem) => {
    // ป้องกันการใส่ข้อความ ID ซ้ำ
    if (processedIdsRef.current.has(item.id)) return
    processedIdsRef.current.add(item.id)

    queueRef.current.push(item)
    // เริ่มลูปถ้ายังไม่ทำงาน
    if (!isPlayingRef.current) {
      processQueue()
    }
  }, [processQueue])

  /**
   * 👆 Tap-to-Advance: แตะหน้าจอเพื่อข้ามการหน่วงเวลาปัจจุบันทันที!
   */
  const tapToAdvance = useCallback((): boolean => {
    if (skipResolverRef.current) {
      skipResolverRef.current()
      return true
    }
    return false
  }, [])

  /**
   * 🌟 รีเซ็ตคิวและเริ่มรอบใหม่ พร้อมรัน The Hesitation Illusion Routine ซื้อเวลาให้โมเดล
   */
  const startNewTurn = useCallback((tier?: CadenceModelTier) => {
    // 1. เคลียร์ Timer ที่ค้างอยู่
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (turnIntroTimerRef.current) {
      clearTimeout(turnIntroTimerRef.current)
      turnIntroTimerRef.current = null
    }
    skipResolverRef.current = null
    queueRef.current = []
    processedIdsRef.current.clear()
    hasMarkedReadRef.current = false
    isPlayingRef.current = false
    setIsBotTyping(false)
    setIsCadenceActive(false)
    isEarlyTypingActiveRef.current = false
    typingStartTimeRef.current = null
    // 🌟 เริ่มต้นด้วย Hybrid Living Presence Indicator (✦ • • •) สัญลักษณ์สากล
    setIndicatorVariant('hybrid')

    // 2. อัปเดต Model Tier ตามที่ระบุ (หรือใช้ค่าเริ่มต้น)
    if (tier) {
      modelTierRef.current = tier
    }
    const profile = MODEL_HESITATION_PROFILES[modelTierRef.current]

    // 3. 🎬 รัน The Hesitation Illusion Sequence ซื้อเวลาล่วงหน้าระหว่างรอเน็ตเวิร์ก:
    // ขั้นที่ 1: รอเวลาอ่านสั้นๆ (~1.1s - 1.4s) ให้ "อ่านแล้ว" ปรากฏเร็วทันใจ
    turnIntroTimerRef.current = setTimeout(() => {
      if (!hasMarkedReadRef.current) {
        hasMarkedReadRef.current = true
        onMarkReadRef.current()
      }

      // ขั้นที่ 2: พักสายตา 700ms เท่าเดิม (ความใส่ใจ) ก่อนที่ ✦ • • • จะเริ่มเปล่งประกายซื้อเวลา
      turnIntroTimerRef.current = setTimeout(() => {
        // เปิด Hybrid Living Presence Indicator (✦ • • •) จำลองตัวตนมีชีวิตซื้อเวลาให้โมเดล
        setIndicatorVariant('hybrid')
        setIsBotTyping(true)
        setIsCadenceActive(true)
        isEarlyTypingActiveRef.current = true
        typingStartTimeRef.current = Date.now()
      }, profile.readToTypingGapMs)
    }, profile.readDelayMs)
  }, [])

  /**
   * ยกเลิกรอบปัจจุบันทันที (เช่น เมื่อเกิด Network Error หรือเปลี่ยนห้องแชท)
   */
  const cancelTurn = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (turnIntroTimerRef.current) {
      clearTimeout(turnIntroTimerRef.current)
      turnIntroTimerRef.current = null
    }
    skipResolverRef.current = null
    queueRef.current = []
    processedIdsRef.current.clear()
    isPlayingRef.current = false
    setIsBotTyping(false)
    setIsCadenceActive(false)
    isEarlyTypingActiveRef.current = false
    typingStartTimeRef.current = null
  }, [])

  /**
   * ตรวจสอบว่ายังมีงานค้างในคิวหรือกำลังเล่น Cadence อยู่หรือไม่ (ป้องกัน Stale Closure)
   */
  const isActive = useCallback((): boolean => {
    return isPlayingRef.current || queueRef.current.length > 0 || isEarlyTypingActiveRef.current
  }, [])

  // Cleanup เมื่อ Component Unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      if (turnIntroTimerRef.current) {
        clearTimeout(turnIntroTimerRef.current)
      }
    }
  }, [])

  return {
    enqueue,
    tapToAdvance,
    startNewTurn,
    cancelTurn,
    isBotTyping,
    indicatorVariant,
    isCadenceActive,
    isActive,
  }
}
