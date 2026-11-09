import React, { useState, useEffect, useMemo } from 'react'
import {
  X,
  FileCode2,
  Copy,
  Check,
  Sparkles,
  Globe,
  Archive,
  MapPin,
} from 'lucide-react'
import type { ExpansionNote, LoreCard, StageCellItem, WorldWorkspace } from '../../../types'

interface StudioPromptInspectorModalProps {
  isOpen: boolean
  onClose: () => void
  activeWorld: WorldWorkspace
  combinedWorldLore: string
  savedCabinetCards: LoreCard[]
  currentCell: StageCellItem | null
  currentNote: ExpansionNote | null
  isSparkPlayerEdited: boolean
  sparkHistory: string[]
}

export const StudioPromptInspectorModal: React.FC<StudioPromptInspectorModalProps> = ({
  isOpen,
  onClose,
  activeWorld,
  combinedWorldLore,
  savedCabinetCards,
  currentCell,
  currentNote,
  isSparkPlayerEdited,
  sparkHistory,
}) => {
  const [inspectorMainTab, setInspectorMainTab] = useState<'assembled' | 'engines'>('assembled')
  const [inspectorEngineTab, setInspectorEngineTab] = useState<'spark' | 'sprout' | 'dissect' | 'linker'>('spark')
  const [copiedInspectorPrompt, setCopiedInspectorPrompt] = useState(false)

  // Close inspector on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const assembledWorldPrompt = useMemo(() => {
    const parts: string[] = []

    parts.push(`=== WORLD BLUEPRINT: ${activeWorld.title || 'โรงเรียนเวทมนตร์'} ===`)
    parts.push(`[CORE WORLD LORE]\n${combinedWorldLore || '(ยังไม่ได้ระบุแก่นเรื่องโลก)'}`)

    if (activeWorld.sparkText?.trim()) {
      parts.push(`\n[THE INCITING SPARK · ชนวนเหตุจุดเริ่มต้นที่ไม่อาจถอยกลับได้]\n${activeWorld.sparkText.trim()}`)
    }

    if (activeWorld.notes.length > 0) {
      const notesSummary = activeWorld.notes
        .map((n, idx) => {
          const childCount = n.childCards?.length || 0
          return `  - ส่วนขยาย #${idx + 1}: "${n.title}" (${n.content.slice(0, 100)}${n.content.length > 100 ? '...' : ''}) [มี ${childCount} บัตรวัตถุดิบ]`
        })
        .join('\n')
      parts.push(`\n[ACTIVE EXPANSION NOTES · ขอบเขตส่วนขยายที่แตกหน่อ]\n${notesSummary}`)
    }

    const savedCards = savedCabinetCards
    if (savedCards.length > 0) {
      const cardsSummary = savedCards
        .map((c) => `  - [${(c.tags || []).map((t) => `#${t}`).join(' ')}] ${c.title}: ${c.content}`)
        .join('\n')
      parts.push(`\n[FILED LORE CABINET CARDS · บัตรวัตถุดิบในตู้ลิ้นชักที่พร้อมใช้บนเวที]\n${cardsSummary}`)
    }

    if (currentCell) {
      const pinnedCards = savedCabinetCards.filter((c) => currentCell.pinnedCardIds.includes(c.id))
      const cellSummary = `ชื่อสถานที่: ${currentCell.title}\nคำบรรยาย: ${currentCell.description || '(ไม่มีคำบรรยาย)'}\nการ์ดที่ผูกไว้: ${pinnedCards.length > 0 ? pinnedCards.map((c) => c.title).join(', ') : 'ยังไม่ได้ผูกการ์ด'}`
      parts.push(`\n[ACTIVE STAGE CELL · จุดเกิดเหตุการณ์ / สถานที่จำลอง]\n${cellSummary}`)
    }

    parts.push(
      `\n[ROLEPLAY & SIMULATION INSTRUCTION]\nให้จำลองบรรยากาศตาม Core World Lore และ The Inciting Spark โดยผูกโยงกับองค์ประกอบและวัตถุดิบที่ผู้กำกับระบุไว้ รักษาความลึกลับ กฎเกณฑ์ และอารมณ์ร่วมของโลกอย่างเคร่งครัด`
    )

    return parts.join('\n')
  }, [activeWorld, combinedWorldLore, savedCabinetCards, currentCell])

  const sparkEnginePrompt = useMemo(() => {
    const sparkMode =
      isSparkPlayerEdited && activeWorld.sparkText.trim()
        ? 'โหมด ✨ เรียบเรียงสปาร์คที่ผู้เล่นเขียนเอง (Polish into In Medias Res Collision)'
        : activeWorld.sparkText.trim()
          ? 'โหมด 🔄 สกัดสปาร์คใหม่ — สุ่มจุดตั้งต้น ชนวนเหตุ และฉากตัวละครชนกันมุมใหม่ (Regenerate Spark)'
          : 'โหมดสกัดสปาร์ค — จุดเริ่มต้นที่ทำให้ทุกอย่างหมุน & ฉากชนกัน In Medias Res (Extract)'

    const historyStr =
      sparkHistory.length > 0
        ? sparkHistory.map((s, idx) => `--- รอบที่ ${idx + 1} ---\n${s}`).join('\n\n')
        : ''

    return `=== SYSTEM PROMPT: THE SPARK ARCHITECT (IN MEDIAS RES COLLISION ENGINE) ===
[ROLE: THE SPARK ARCHITECT — สถาปนิกผู้สกัดจุดเริ่มต้นที่ทำให้ทุกอย่างหมุน & ฉากชนกัน In Medias Res]
หน้าที่ของคุณคือการอ่านข้อมูลโลกหลัก ([WORLD_LORE]) ของผู้เล่น แล้วสกัดหรือจุดประกาย "The Spark That Sets Everything in Motion (จุดเริ่มต้นที่ทำให้ทุกอย่างหมุน)" โดยคิดตามโครงสร้างแม่พิมพ์ระดับตำนาน แล้วส่งออก Output เป็น "เหตุการณ์ In Medias Res วินาทีที่ตัวละครชนกันและถอยกลับไม่ได้อีก" ด้วยภาษาง่ายๆ คมๆ ที่อ่านเข้าใจทันที

[แม่พิมพ์วิธีคิด 6 จังหวะ (Thinking Framework — ต้องคิดตามลำดับนี้ก่อนเขียนเสมอ)]:
1. เรื่องไม่ได้เริ่มจากระบบใหญ่หรือประวัติศาสตร์โลก
2. แต่มันเริ่มจาก "ตัวเราในมุมคนธรรมดา" ที่รีเลทง่าย
3. แล้วมี "ของชิ้นเดียว / ชนวนเหตุเฉพาะหน้า / การตัดสินใจใกล้ตัว"
4. แล้วดันไป "ชน" กับตัวละครเฉพาะเจาะจงอีก 1 คน (คนที่ไม่น่าจะมาเจอกันได้)
5. จนมาถึง "จุดที่ถอยกลับไม่ได้อีก" (ใคร ถอยกลับไม่ได้ เพราะอะไร)
6. พอประกายไฟนี้ติด... โลกที่เหลือก็ค่อยๆ ไหลตามมาเอง

[กฎเหล็กในการเขียน Output (3 บล็อก In Medias Res)]:
- ห้ามใช้ภาษาเรียงความนิยายที่เวิ่นเว้อซับซ้อนเด็ดขาด ให้ใช้คำพูดง่ายๆ สั้นๆ เห็นภาพเป็นช็อตๆ ทันที
- หากผู้เล่นเขียนมาแค่ฉากหลังโลกกว้างๆ จงใช้จินตนาการแต่งจุดตั้งต้นของคนธรรมดา + ชนวนเหตุเฉพาะหน้า + ตัวละครที่มาชนกันตรงหน้าในโลกใบนั้นขึ้นมาได้เลย
- ส่งออกผลลัพธ์เป็น 3 บล็อกสั้นๆ ตามโครงสร้างนี้เท่านั้น:
• เรื่องไม่ได้เริ่มจาก [ระบบใหญ่/ประวัติศาสตร์โลก] — แต่มันเริ่มจากคุณที่เป็น [ตัวเราในมุมคนธรรมดา + ชนวนเหตุเฉพาะหน้า/สิ่งของ/การตัดสินใจที่พามาถึงจุดนี้]
• วินาทีที่ชนกัน (In Medias Res): [ฉากเหตุการณ์ตรงหน้าที่กำลังเกิดขึ้นเดี๋ยวนี้ วินาทีที่คุณพุ่งชนเข้ากับ "ตัวละครสำคัญอีกคน" แบบเห็นภาพการกระทำ สายตา หรือคำพูดตรงหน้าทันที]
• จุดที่ถอยกลับไม่ได้อีก: [ระบุตรงๆ ว่าทำไมวินาทีนี้คุณถึงถอยกลับไปใช้ชีวิตเดิมไม่ได้แล้ว + เป้าหมาย/ความลับ/ความรู้สึกที่ทำให้โลกทั้งใบเริ่มหมุนตั้งแต่วินาทีนี้]

--------------------------------------------------
[ACTIVE MODE]: ${sparkMode}

[TARGET RAW WORLD LORE]:
"${combinedWorldLore || '(ยังไม่ได้ป้อนแก่นเรื่องโลก)'}"

${
  activeWorld.sparkText.trim()
    ? `[CURRENT SPARK IN STUDIO]:\n"${activeWorld.sparkText.trim()}"`
    : ''
}${
  historyStr
    ? `\n\n[PREVIOUS_SPARKS HISTORY]:\n${historyStr}`
    : ''
}`
  }, [combinedWorldLore, isSparkPlayerEdited, activeWorld.sparkText, sparkHistory])

  const sproutEnginePrompt = useMemo(() => {
    const extractedList = activeWorld.notes
      .filter((n) => n.title.trim() || n.content.trim())
      .map((n) => (n.content.trim() ? `${n.title}: ${n.content}` : n.title))
    const alreadyStr =
      extractedList.length > 0
        ? extractedList.map((t) => `- ${t}`).join('\n')
        : '(ยังไม่มี — กำลังเป็นการสกัดชุดแรก)'

    return `=== SYSTEM PROMPT: WORLD LORE EXPANDER (แตกส่วนขยาย / สกัดเพิ่ม) ===
[ROLE: THE WORLD LORE EXPANDER — สถาปนิกผู้ขยายรายละเอียดของโลก]
หน้าที่ของคุณคือการอ่าน "ข้อมูลโลกหลัก ([WORLD_LORE])" ที่ผู้เล่นเขียนขึ้น แล้วดึงประเด็นที่ผู้เล่นพูดถึงออกมาขยายต่อยอดเป็น "ส่วนขยายของโลก (Expansion Notes)" ทีละชุด (ชุดละไม่เกิน 4–5 หัวข้อ)

[ปรัชญาและกฎเหล็กสูงสุด 6 ข้อ]:

1. โลกหลักคือคัมภีร์ตั้งต้น (Sacred World Context & Mood Lock):
   - ข้อความใน [WORLD_LORE] ทั้งหมดคือโลกทั้งใบที่ผู้เล่นมีภาพและบรรยากาศในหัวอยู่แล้ว
   - จงอ่านทั้งย่อหน้าเพื่อซึมซับ "มูดแอนด์โทนและบรรยากาศ" ของโลกใบนี้ (ไม่ว่าจะเป็นแนวแฟนตาซี, โรงเรียน, โจรสลัด, ชมรมดนตรี, การเมือง, หรือชีวิตประจำวัน)
   - ห้ามเปลี่ยนโทนเรื่องเด็ดขาด: ถ้าผู้เล่นเขียนโทนอบอุ่น สนุกสนาน หรือลึกลับน่าค้นหา จงรักษาคลื่นความถี่นั้นไว้ ห้ามยัดเยียดดราม่าเครียดจัด และห้ามแต่งพล็อตเหตุการณ์ล่วงหน้า (เช่น ห้ามแต่งเรื่องให้เกิดโศกนาฏกรรมหรือความแตกแยกใหญ่โตที่ผู้เล่นไม่ได้เขียน)

2. หนึ่งหัวข้อ = หนึ่งเรื่องบริสุทธิ์ ห้ามยำรวมกัน (1 Expansion = 1 Pure Topic):
   - ห้ามนำหลายเรื่องที่คนละประเด็นกันมาปนในส่วนขยายเดียวเด็ดขาด!
   - ตัวอย่างที่ผิด: เอาเรื่อง "ไม้กายสิทธิ์" ไปปนกับ "สัตว์วิเศษ" หรือเอาเรื่อง "การแบ่งบ้าน" ไปปนกับ "อาจารย์"
   - ตัวอย่างที่ถูก (สำหรับดูเป็นแนวทางการแยกเรื่องเท่านั้น ห้ามใช้หัวข้อตัวอย่างนี้เป็นแม่พิมพ์เลือกหัวข้อการ์ดเด็ดขาด):
     • แยกเรื่อง "การแบ่งบ้าน" ออกจากเรื่อง "ไม้กายสิทธิ์และการร่ายคาถา" และแยกออกจากเรื่อง "การซ่อนตัวจากโลกภายนอก" อย่างชัดเจน

3. การชั่งน้ำหนักเพื่อเลือกหัวข้อการ์ดจากสิ่งที่ผู้เล่นพิมพ์ (Dynamic Weight Balancing — ใช้ข้อนี้เป็นตัวกำหนดหัวข้อการ์ด 100%):
   - การเลือกหัวข้อการ์ดต้องดึงตามลำดับและน้ำหนักเรื่องราวที่ผู้เล่นพิมพ์ใน [WORLD_LORE] เท่านั้น ห้ามจัดหมวดหมู่ตามแม่พิมพ์ตายตัว โดยให้กวาดอ่านตั้งแต่ประโยคแรกสุดแล้วจับก้อนตาม 3 ลักษณะนี้:
     • เรื่องที่ผู้เล่นเปิดเรื่องและเล่าละเอียดหรือให้น้ำหนักมาก (เช่น จุดเริ่มต้นวันแรกของตัวละครและเพื่อนสนิท, เหตุการณ์สำคัญ, หรือบุคคลพิเศษที่มีบทบาทชัดเจนอย่างรุ่นพี่ที่เป็นไอดอล): เรื่องที่ผู้เล่นเขียนบรรยายไว้ยาวเหล่านี้มีน้ำหนักในตัวเองเต็มที่อยู่แล้ว ต้องหยิบขึ้นมาตั้งเป็น 1 การ์ดส่วนขยายของตัวเองทันที (โดยเฉพาะเรื่องที่ผู้เล่นเขียนเปิดหัวเรื่องยาวๆ ต้องได้เป็นการ์ดใบแรกเสมอ ห้ามตัดทิ้งและห้ามนำไปซ่อนเป็นแค่ติ่งเล็กๆ ในการ์ดอื่นเด็ดขาด!)
     • ภาพบรรยากาศหรือโมเมนต์ย่อยๆ ที่อยู่ในอารมณ์เดียวกัน: หากผู้เล่นร่ายเศษภาพสั้นๆ ที่อยู่ในจังหวะชีวิตหรืออารมณ์เดียวกัน (เช่น หลังเลิกซ้อม เดินกินไอติม ข้ามทางรถไฟ หรือความทุ่มเท มิตรภาพ และการบอกรักบนสะพาน) ให้ร้อยเรียงจุดย่อยที่เกี่ยวเนื่องกันเหล่านั้นเข้าด้วยกัน เพื่อให้การ์ดมีน้ำหนักอิ่มและมีเสน่ห์ (โดยไม่เอาคนละเรื่องมาปนกันตามกฎข้อ 2)
     • เรื่องสำคัญที่ผู้เล่นเอ่ยถึงสั้นๆ เพียงคำเดียว (ขาดรายละเอียดพ่วง): หากผู้เล่นพูดถึงแกนสำคัญไว้สั้นๆ โดดๆ (เช่น พิมพ์แค่ชื่ออุปกรณ์ พลัง หรือแค่คำว่าเสียงดนตรีที่รัก) ให้ใช้กฎข้อ 4 ช่วยจินตนาการต่อยอดเติมรายละเอียดให้เรื่องนั้นมีน้ำหนักอิ่มเต็ม 1 การ์ดด้วยตัวเองทันที

4. จินตนาการต่อยอดล่วงหน้า 1 ก้าวเวลาเขียนเนื้อหาในการ์ด (Natural World Extrapolation — ใช้สำหรับความลึกของเนื้อหา):
   - หลังจากเลือกก้อนหัวข้อการ์ดตามน้ำหนักจากกฎข้อ 3 ได้แล้ว เวลาเขียนเนื้อหา (content) ในแต่ละการ์ด จงช่วย "คิดรายละเอียดต่อยอดล่วงหน้า 1 ก้าว" เสมือนอ่านใจผู้เล่นออก เพื่อให้เนื้อหาในการ์ดมีความลึก ลื่นไหล และเห็นภาพชัดเจน (เหมือนเวลาอธิบายเรื่องไม้กายสิทธิ์ที่ช่วยลงลึกถึงแกนไม้นกฟีนิกซ์และแกนหัวใจมังกร เวลาอธิบายเรื่องบ้านที่ช่วยลงลึกถึงสัญลักษณ์และระบบคะแนนเกียรติยศ เวลาอธิบายเรื่องการซ่อนตัวจากโลกภายนอกที่ลงลึกถึงองค์กรปกปิดความลับและคำเรียกมักเกิ้ล หรือเวลาเล่าเรื่องจุดเริ่มต้นของตัวละคร เพื่อนสนิท รุ่นพี่ ความรัก และบรรยากาศเมือง ที่ช่วยร้อยเรียงเคมีตัวละคร สายลม แสงไฟ และวิถีชีวิตให้มีชีวิตชีวา)
   - (หมายเหตุสำคัญ: ตัวอย่างเรื่องเวทมนตร์มีไว้เพื่อแสดง "ระดับความลึกและความลื่นไหลของการเขียนเนื้อหา" เท่านั้น ห้ามใช้เป็นแม่พิมพ์ในการเลือกหัวข้อการ์ดเด็ดขาด การเลือกหัวข้อการ์ดต้องดึงตามน้ำหนักเรื่องราวของผู้เล่นในข้อ 3 เท่านั้น!)
   - ขยายทั้ง "จุดเริ่มต้นของเรื่อง ความสัมพันธ์ บุคคลสำคัญ ข้อมูลตั้งต้นของโลก และบรรยากาศ" เพื่อให้โลกมีมิติและนำไปสร้างการ์ดย่อยต่อได้ทันที

5. สกัดทีละชุด ไม่เกิน 4–5 หัวข้อ และห้ามซ้ำของเดิม (Progressive Batch Extraction):
   - ตรวจสอบทั้ง "ชื่อหัวข้อ" และ "เนื้อหาข้างใน" ของการ์ดเดิมใน [ALREADY_EXTRACTED_TOPICS] ก่อนเสมอ
   - ห้ามสกัดหัวข้อซ้ำ และห้ามดึงประเด็นย่อยที่ถูกเขียนรวมอยู่ในเนื้อหาของการ์ดใบก่อนหน้ามาสร้างซ้ำอีกเด็ดขาด
   - หากเป็นการสกัดรอบแรก (ยังไม่มีหัวข้อเดิม): ให้อ่านไล่ตั้งแต่ประโยคแรกของผู้เล่นและเลือกก้อนที่มีน้ำหนักชัดเจนตามกฎข้อ 3 ออกมาก่อน 4–5 หัวข้อ (ห้ามลืมหยิบจุดเริ่มต้นหรือตัวละครสำคัญที่ผู้เล่นเน้นในประโยคแรกๆ)
   - หากเป็นการกด "สกัดเพิ่ม" (มีหัวข้อเดิมอยู่แล้ว): ให้กวาดสายตาหาประเด็นอื่นๆ ใน [WORLD_LORE] ที่ผู้เล่นเขียนไว้แต่ยังตกหล่นหรือยังไม่ถูกเล่าอยู่ในเนื้อหาของการ์ดใบใดเลย แล้วดึงออกมาอีกไม่เกิน 4–5 หัวข้อ (หากเหลือประเด็นที่ยังไม่ได้สกัดเพียง 1–3 เรื่อง ก็ให้ดึงออกมาเท่าที่เหลือจริง ห้ามเมคเรื่องใหม่ที่ไม่มีใน [WORLD_LORE])

6. รูปแบบภาษาและโครงสร้างผลลัพธ์ (Output Format):
   - ใช้ภาษาไทยที่สละสลวย เห็นภาพชัดเจน อ่านเข้าใจง่าย ไม่เวิ่นเว้อ
   - ความยาวของ content ในแต่ละส่วนขยาย: ประมาณ 80–150 คำ (2–3 ย่อหน้าสั้นๆ ที่อัดแน่นด้วยรายละเอียดของเรื่องนั้นเพียวๆ)
   - ตอบกลับเป็น JSON Array เท่านั้น: id, title, category ("faction | location | rule | lore"), summary, content, tags

--------------------------------------------------
[RUN-TIME PAYLOAD TO AI]:
[WORLD_LORE (ข้อมูลโลกทั้งใบของผู้เล่น)]:
"${combinedWorldLore || '(ยังไม่ได้ป้อนแก่นเรื่องโลก)'}"

[ALREADY_EXTRACTED_TOPICS (หัวข้อและเนื้อหาที่สกัดไปแล้ว — ห้ามทำซ้ำและห้ามดึงเรื่องย่อยที่อยู่ในเนื้อหาข้างล่างนี้มาตั้งซ้ำเด็ดขาด)]:
${alreadyStr}`
  }, [combinedWorldLore, activeWorld.notes])

  const dissectEnginePrompt = useMemo(() => {
    const noteTitle = currentNote ? currentNote.title : '(ยังไม่ได้เลือกส่วนขยาย)'
    const noteContent = currentNote ? currentNote.content : '(ยังไม่มีเนื้อหา)'
    return `=== SYSTEM PROMPT: LORE CARD DISSECTOR ===
หน้าที่ของคุณคือการอ่านเนื้อหาของส่วนขยาย และสกัดวัตถุดิบย่อยออกมาเป็น "การ์ดวัตถุดิบพร้อมเข้าตู้ลิ้นชัก (Child Cards)"
เพื่อนำไปใช้เป็นตัวละคร, สถานที่, ไอเทม, หรือกฎเกณฑ์ในการจำลองเหตุการณ์

[ACTIVE EXPANSION NOTE]:
ชื่อส่วนขยาย: "${noteTitle}"
เนื้อหา:
"${noteContent}"

[EXTRACTION RULES]:
- สกัดวัตถุดิบออกมา 3-5 ใบ
- แต่ละใบกำหนด:
  * Title: ชื่อวัตถุดิบเฉพาะเจาะจง
  * Category: 'lore' | 'rule' | 'npc' | 'location' | 'object'
  * Content: คำอธิบายสั้น 1-2 ประโยคที่ใช้แสดงผลบนเวทีได้ทันที
  * Tags: แฮชแท็ก 2-3 อัน`
  }, [currentNote])

  const linkerEnginePrompt = useMemo(() => {
    const cellTitle = currentCell ? currentCell.title : '(ยังไม่ได้เลือกสถานที่)'
    const cellDesc = currentCell ? currentCell.description : '(ยังไม่มีคำบรรยาย)'
    return `=== SYSTEM PROMPT: AUTO-STAGE CARD LINKER ===
หน้าที่ของคุณคือการวิเคราะห์บรรยากาศของสถานที่ (Stage Cell) และคัดเลือกการ์ดวัตถุดิบที่เหมาะสมที่สุดจากตู้ลิ้นชักมาผูกไว้กับสถานที่นี้

[TARGET LOCATION (STAGE CELL)]:
สถานที่: "${cellTitle}"
บรรยากาศ: "${cellDesc}"

[AVAILABLE CABINET CARDS]:
${
  savedCabinetCards
    .map((c) => `- ID: ${c.id} | Title: "${c.title}" | Tags: #${(c.tags || []).join(' #')}`)
    .join('\n') || '(ยังไม่มีการ์ดในตู้ลิ้นชัก)'
}

[MATCHING ALGORITHM]:
- คำนวณความสอดคล้องของคำศัพท์และมูดโทนระหว่างคำบรรยายสถานที่กับการ์ด
- เลือกการ์ดที่มีความสัมพันธ์สูงที่สุด (คะแนนคำพ้องบริบท > 0) เพื่อผูกเข้ากับสถานที่นี้ทันที`
  }, [currentCell, savedCabinetCards])

  const activePromptText = useMemo(() => {
    if (inspectorMainTab === 'assembled') {
      return assembledWorldPrompt
    }
    if (inspectorEngineTab === 'spark') return sparkEnginePrompt
    if (inspectorEngineTab === 'sprout') return sproutEnginePrompt
    if (inspectorEngineTab === 'dissect') return dissectEnginePrompt
    return linkerEnginePrompt
  }, [
    inspectorMainTab,
    inspectorEngineTab,
    assembledWorldPrompt,
    sparkEnginePrompt,
    sproutEnginePrompt,
    dissectEnginePrompt,
    linkerEnginePrompt,
  ])

  const handleCopyInspectorPrompt = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy)
    setCopiedInspectorPrompt(true)
    setTimeout(() => setCopiedInspectorPrompt(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-[#090909]/98 backdrop-blur-3xl flex flex-col overflow-hidden animate-in fade-in duration-200 select-none font-sans">
      {/* Top Sticky Frosted Navigation */}
      <header className="sticky top-0 z-20 min-h-14 py-2.5 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 bg-[#090909]/80 backdrop-blur-2xl border-b border-white/[0.08]">
        {/* Left: Close Button & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
            title="ปิดหน้าต่าง (Esc)"
          >
            <X size={15} />
          </button>
          <div className="flex items-center gap-2">
            <FileCode2 size={15} className="text-[#38bdf8]" />
            <span className="text-[12px] font-mono text-white/70 tracking-wider uppercase hidden sm:block">
              WORLD PROMPT INSPECTOR
            </span>
          </div>
        </div>

        {/* Center: Main Category Segmented Control (Assembled vs Engines) */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10 select-none">
          <button
            type="button"
            onClick={() => setInspectorMainTab('assembled')}
            className={`h-7 px-3.5 rounded-full text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              inspectorMainTab === 'assembled'
                ? 'bg-sky-500/15 text-sky-300 font-semibold border border-sky-500/30 shadow-sm'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                inspectorMainTab === 'assembled' ? 'bg-[#38bdf8]' : 'bg-white/30'
              }`}
            />
            <span>🌐 พิมพ์เขียวโลกส่งเข้าเวที</span>
          </button>
          <button
            type="button"
            onClick={() => setInspectorMainTab('engines')}
            className={`h-7 px-3.5 rounded-full text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              inspectorMainTab === 'engines'
                ? 'bg-rose-500/15 text-rose-300 font-semibold border border-rose-500/30 shadow-sm'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                inspectorMainTab === 'engines' ? 'bg-rose-500' : 'bg-white/30'
              }`}
            />
            <span>⚙️ เครื่องยนต์สกัดเบื้องหลัง</span>
          </button>
        </div>

        {/* Right: Copy Prompt Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleCopyInspectorPrompt(activePromptText)}
            className="h-7 px-3 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-[11px] font-sans font-medium text-[#F1F1F1] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 select-none shadow-sm"
            title="คัดลอก Prompt ปัจจุบัน"
          >
            {copiedInspectorPrompt ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span className="text-emerald-400">คัดลอกแล้ว</span>
              </>
            ) : (
              <>
                <Copy size={12} className="opacity-70" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Sub-Header for Engines (When in Engines Tab) */}
      {inspectorMainTab === 'engines' && (
        <div className="px-4 sm:px-6 py-2 bg-[#0C0C0E] border-b border-white/[0.06] flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setInspectorEngineTab('spark')}
            className={`h-6.5 px-3 rounded-full text-[10.5px] font-mono transition-all cursor-pointer flex items-center gap-1 active:scale-95 whitespace-nowrap ${
              inspectorEngineTab === 'spark'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-medium'
                : 'text-white/45 hover:text-white/75 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06]'
            }`}
          >
            <Sparkles size={10} className="text-[#EF264C]" />
            <span>1. สกัดสปาร์ค (Spark)</span>
          </button>

          <button
            type="button"
            onClick={() => setInspectorEngineTab('sprout')}
            className={`h-6.5 px-3 rounded-full text-[10.5px] font-mono transition-all cursor-pointer flex items-center gap-1 active:scale-95 whitespace-nowrap ${
              inspectorEngineTab === 'sprout'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                : 'text-white/45 hover:text-white/75 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06]'
            }`}
          >
            <Globe size={10} className="text-emerald-400" />
            <span>2. แตกส่วนขยาย (Sprouter)</span>
          </button>

          <button
            type="button"
            onClick={() => setInspectorEngineTab('dissect')}
            className={`h-6.5 px-3 rounded-full text-[10.5px] font-mono transition-all cursor-pointer flex items-center gap-1 active:scale-95 whitespace-nowrap ${
              inspectorEngineTab === 'dissect'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                : 'text-white/45 hover:text-white/75 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06]'
            }`}
          >
            <Archive size={10} className="text-amber-400" />
            <span>3. สกัดการ์ด (Dissector)</span>
          </button>

          <button
            type="button"
            onClick={() => setInspectorEngineTab('linker')}
            className={`h-6.5 px-3 rounded-full text-[10.5px] font-mono transition-all cursor-pointer flex items-center gap-1 active:scale-95 whitespace-nowrap ${
              inspectorEngineTab === 'linker'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-medium'
                : 'text-white/45 hover:text-white/75 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06]'
            }`}
          >
            <MapPin size={10} className="text-sky-400" />
            <span>4. ผูกการ์ดสถานที่ (Auto-Linker)</span>
          </button>
        </div>
      )}

      {/* Body: Single Unibody Smoked Glass Canvas */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 lg:p-8 bg-[#080809]">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="rounded-2xl border border-white/[0.08] bg-[#121214]/90 p-5 sm:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.6)]">
            {/* Header row */}
            <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider bg-white/[0.06] text-white/70 border border-white/10">
                  {inspectorMainTab === 'assembled' ? 'LIVE STAGE BLUEPRINT' : 'PROMPT ENGINE'}
                </span>
                <span className="text-[14px] font-medium text-[#F1F1F1]">
                  {inspectorMainTab === 'assembled'
                    ? `พิมพ์เขียวโลก: ${activeWorld.title || 'โลกปัจจุบัน'}`
                    : inspectorEngineTab === 'spark'
                      ? 'เครื่องยนต์สกัดสปาร์ค (The Inciting Spark Extractor)'
                      : inspectorEngineTab === 'sprout'
                        ? 'เครื่องยนต์แตกส่วนขยาย (World Expansions Sprouter)'
                        : inspectorEngineTab === 'dissect'
                          ? 'เครื่องยนต์สกัดการ์ดวัตถุดิบ (Lore Card Dissector)'
                          : 'เครื่องยนต์ผูกการ์ดเข้าสถานที่ (Auto-Stage Card Linker)'}
                </span>
              </div>

              <span className="text-[11px] font-mono text-white/40">{activePromptText.length} chars</span>
            </div>

            {/* Sub-label description */}
            <p className="text-[11.5px] text-white/50 mb-3 leading-relaxed">
              {inspectorMainTab === 'assembled'
                ? 'พิมพ์เขียวฉบับรวมที่สังเคราะห์ข้อมูลทั้งหมดในโลกใบนี้ (แก่นเรื่อง, ชนวนเหตุ, ส่วนขยาย, และตู้ลิ้นชัก) พร้อมส่งให้ AI นักแสดงและผู้กำกับทำงานร่วมกันในห้องแชทจำลอง'
                : inspectorEngineTab === 'spark'
                  ? 'คำสั่งที่ใช้ค้นหาจุดเปลี่ยนสำคัญ 1 ประโยคที่จะจุดชนวนให้โลกนี้เริ่มหมุน'
                  : inspectorEngineTab === 'sprout'
                    ? 'คำสั่งที่ใช้แตกขอบเขตโลกออกเป็น 4 มิติเชิงลึก (สถาปัตยกรรม, กฎเกณฑ์, ศาสตร์มืด, สิ่งมีชีวิต)'
                    : inspectorEngineTab === 'dissect'
                      ? 'คำสั่งที่ใช้อ่านเนื้อหาของส่วนขยายที่กำลังเปิดอยู่ แล้วสกัดเป็นการ์ดย่อยพร้อม Tag เข้าตู้ลิ้นชัก'
                      : 'คำสั่งที่ใช้วิเคราะห์มูดแอนด์โทนของสถานที่ และเลือกการ์ดที่สอดคล้องที่สุดมาผูกอัตโนมัติ'}
            </p>

            {/* Prompt Content Terminal Window */}
            <div className="p-4 rounded-xl bg-black/60 border border-white/[0.07] font-mono text-[12px] leading-relaxed text-white/80 whitespace-pre-wrap select-text max-h-[520px] overflow-y-auto custom-scrollbar">
              {activePromptText}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
