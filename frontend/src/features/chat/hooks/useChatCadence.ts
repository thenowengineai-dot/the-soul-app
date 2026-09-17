import { useState, useRef, useCallback, useEffect } from 'react'

export interface CadenceItem {
  id: string | number
  type: 'vo' | 'action' | 'msg'
  text: string
  sender?: 'me' | 'them'
  read?: boolean
}

export interface UseChatCadenceOptions {
  /** เรียกเมื่อถึงจังหวะปล่อยข้อความลงจอจริง */
  onEmitMessage: (message: CadenceItem) => void
  /** เรียกเมื่อถึงจังหวะที่ข้อความของผู้เล่นถูกเปลี่ยนเป็น "อ่านแล้ว" */
  onMarkUserMessageAsRead: () => void
  /** เรียกเมื่อการแสดงผลข้อความในคิวทั้งหมดเสร็จสิ้นสมบูรณ์ */
  onCadenceComplete?: () => void
}

/**
 * 🎬 useChatCadence: เครื่องยนต์ควบคุมจังหวะและจิตวิทยาการสนทนา (Cinematic Cadence & Pacing)
 * 1. The Stash & Cadence Buffer: กักเก็บข้อความจาก SSE Stream ไว้ในคิว แล้วทยอยปล่อยตามสรีรวิทยาจริงของมนุษย์
 * 2. 3-Beat Rhythm: VO (สงบ 5.5-8.0s) -> Action (ภาษากาย 3.0-4.5s) -> Dialogue (กำลังพิมพ์ 1.2-2.5s)
 * 3. Dynamic Read Receipt: เปลี่ยนสถานะเป็น "อ่านแล้ว" เฉพาะเมื่อพร้อมปล่อยบับเบิ้ล หรือหลังอ่าน VO จบ
 * 4. Tap-to-Advance: แตะหน้าจอเพื่อข้ามเวลาหน่วงและปล่อยบับเบิ้ลถัดไปทันที
 */
export function useChatCadence({
  onEmitMessage,
  onMarkUserMessageAsRead,
  onCadenceComplete,
}: UseChatCadenceOptions) {
  const [isBotTyping, setIsBotTyping] = useState(false)
  const [isCadenceActive, setIsCadenceActive] = useState(false)

  // คิวของข้อความที่รอการแสดงผล
  const queueRef = useRef<CadenceItem[]>([])
  // บันทึก ID ที่เคยส่งเข้าคิวหรือแสดงผลแล้วเพื่อป้องกันการซ้ำ
  const processedIdsRef = useRef<Set<string | number>>(new Set())
  
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
   * คำนวณเวลาหน่วงตามประเภทและความยาวตัวอักษรจริง
   */
  const calculateDurations = useCallback((item: CadenceItem) => {
    const len = (item.text || '').length

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

    // 🌟 Dialogue: คำพูดแชท
    // 1. typingDuration: ช่วงเวลาดุ๊กดิ๊กตอนพิมพ์ (~1.8s - 3.0s) - เว้นให้อ่านบับเบิ้ลก่อนหน้าทัน
    const typingDuration = Math.min(3000, Math.max(1800, 500 + len * 22))
    // 2. readingDuration: ช่วงเวลาให้อ่านคำพูดหลังเด้งลงจอ เมื่อก้อนถัดไปเป็น Action (~2.5s - 4.5s)
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

      const { readingDuration, typingDuration } = calculateDurations(currentItem)

      if (currentItem.type === 'vo') {
        // 🎬 BEAT 1: VOICE OVER (บรรยายฉาก)
        // 1. ปิด Typing Indicator ทันที
        setIsBotTyping(false)
        // 2. ปล่อย VO ขึ้นจอทันที
        onEmitRef.current(currentItem)
        // 3. หน่วงเวลาอ่านอย่างสงบ (ไม่ขึ้น "อ่านแล้ว" และไม่ขึ้น Typing)
        await sleepWithSkip(readingDuration)
        // 4. จบ VO -> ถือว่าอีกฝ่ายอ่านแชทแล้ว
        if (!hasMarkedReadRef.current) {
          hasMarkedReadRef.current = true
          onMarkReadRef.current()
        }
        // จังหวะพักสายตาสั้นๆ ก่อนก้อนถัดไป (ถ้ามี)
        if (queueRef.current.length > 0) {
          const breathMs = Math.floor(450 + Math.random() * 250)
          await sleepWithSkip(breathMs)
        }
      } else if (currentItem.type === 'action') {
        // 🎬 BEAT 2: ACTION (ภาษากาย)
        // ถ้ายังไม่ได้ Mark อ่านแล้ว (เช่น ไม่มี VO) ให้ Mark ทันที
        if (!hasMarkedReadRef.current) {
          hasMarkedReadRef.current = true
          onMarkReadRef.current()
        }
        setIsBotTyping(false)
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
        if (!hasMarkedReadRef.current) {
          hasMarkedReadRef.current = true
          onMarkReadRef.current()
        }
        // 1. เปิด Typing Indicator ดุ๊กดิ๊ก
        setIsBotTyping(true)
        // 2. หน่วงเวลาพิมพ์ตามความยาวตัวอักษรจริง
        await sleepWithSkip(typingDuration)
        // 3. ปิด Typing Indicator
        setIsBotTyping(false)
        // 4. ปล่อยบับเบิ้ลคำพูดลงจอ
        onEmitRef.current(currentItem)
        // 5. 🌟 ถ้ายังมีก้อนถัดไปในคิว:
        if (queueRef.current.length > 0) {
          const nextItem = queueRef.current[0]
          // 🛑 ถ้าก้อนถัดไปเป็น Action หรือ VO: หน่วงเวลาให้อ่านคำพูดก้อนนี้ให้จบก่อน!
          // แต่ถ้าก้อนถัดไปเป็น Dialogue (คำพูดต่อคำพูด): ไม่ต้องรออ่าน ให้พักนิ้วแล้วขึ้น Typing ต่อทันที!
          if (nextItem && nextItem.type !== 'msg') {
            await sleepWithSkip(readingDuration)
          }
          const breathMs = Math.floor(450 + Math.random() * 200)
          await sleepWithSkip(breathMs)
        }
      }
    }

    // จบการประมวลผลคิวทั้งหมด
    setIsBotTyping(false)
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
   * รีเซ็ตคิวและเริ่มรอบใหม่เมื่อผู้เล่นส่งข้อความ
   */
  const startNewTurn = useCallback(() => {
    // เคลียร์ Timer ที่ค้างอยู่
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    skipResolverRef.current = null
    queueRef.current = []
    processedIdsRef.current.clear()
    hasMarkedReadRef.current = false
    isPlayingRef.current = false
    setIsBotTyping(false)
    setIsCadenceActive(false)
  }, [])

  /**
   * ตรวจสอบว่ายังมีงานค้างในคิวหรือกำลังเล่น Cadence อยู่หรือไม่ (ป้องกัน Stale Closure)
   */
  const isActive = useCallback((): boolean => {
    return isPlayingRef.current || queueRef.current.length > 0
  }, [])

  // Cleanup เมื่อ Component Unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return {
    enqueue,
    tapToAdvance,
    startNewTurn,
    isBotTyping,
    isCadenceActive,
    isActive,
  }
}
