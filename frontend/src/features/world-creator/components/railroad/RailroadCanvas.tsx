import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  ZoomIn,
  ZoomOut,
  Sparkles,
  RotateCcw,
  Layers,
} from 'lucide-react';
import type { VaultDraft, WorldScene, WorldScenario } from '../../types';
import { DEFAULT_BOTANICAL_LOCATIONS } from '../../defaultWorldLocations';
import SceneNodeCard from './SceneNodeCard';
import RailroadCableOverlay from './RailroadCableOverlay';

interface RailroadCanvasProps {
  draft: VaultDraft;
  onUpdateDraft?: (updated: Partial<VaultDraft>) => void;
  isEditable?: boolean;
}

// Default 3 Real Cinematic Scenes for Botanical Poison Scenario
const DEFAULT_SCENES: WorldScene[] = [
  {
    scene_id: 'scene_1',
    title: 'ฉากที่ 1: ห้องโถงเสื่อทาทามิเรียวกัง',
    location_key: 'ห้องโถงเสื่อทาทามิเรียวกัง',
    position: { x: 80, y: 100 },
    scene_objective: "พา [PLAYER] เดินทางขึ้นเขาไปเก็บสมุนไพร 'เฟิร์นหมอกอัคคี' และหลบเข้าซอกถ้ำร้าง",
    forced_chaos_level: 'low',
    event_mood: 'อบอุ่น อึดอัด ชื้นแฉะ ลื่นไถล แนบเนื้อ',
    director_vision: 'The Slow Burn: สร้างความกระอักกระอ่วน ห้ามรีบร้อน ค่อยๆ กดดันจากบรรยากาศอบอุ่นสู่ความแปรปรวนของธรรมชาติ',
    director_setup: 'ไอน้ำชาเขียวอุ่นกรุ่นโชยฟุ้งตัดกับไอเย็นยามบ่ายภายในห้องโถงเสื่อทาทามิอันสงบเงียบของเรียวกัง [PLAYER] ยืนสะพายกระเป๋าอุปกรณ์พฤกษศาสตร์ใบโตหนักอึ้งอยู่ตรงกลางห้องท่ามกลางสายตาเกี่ยงงานของสมาชิกคนอื่น ขณะที่ [ACTOR] ในชุดเสื้อเชิ้ตสีขาวบางสวมแว่นตากรอกหนากำลังใช้นิ้วดันดั้งแว่นด้วยความประหม่า ก่อนที่ทั้งสองจะต้องเดินพ้นชายคาออกไปสู่เนินเขาป่าทึบที่สายฝนเริ่มตั้งเค้าแปรปรวนครึ้มฟ้าครึ้มฝน',
    premise: 'ไอน้ำชาเขียวอบอุ่นในห้องโถงเสื่อทาทามิถูกขัดจังหวะด้วยข้ออ้างการเกี่ยงงานของสมาชิกคนอื่น [PLAYER] ยืนแบกกระเป๋าเก็บตัวอย่างพฤกษศาสตร์ด้วยความจำใจจากการสั่งการของประธานชมรม ขณะที่ [ACTOR] นั่งก้มหน้านิ่งในชุดเสื้อเชิ้ตสีขาวบางผ้าฝ้าย ยืนขึ้นปรับกรอบแว่นหนาด้วยท่าทางประหม่า ก่อนที่ทั้งคู่จะก้าวพ้นชายคาเรียวกังออกไปเผชิญกับสภาพอากาศที่แปรปรวนกลางป่า',
    beats: [
      {
        beat_id: 'scene_1_beat_1',
        actor_state: 'Player Anchor: ยืนระยะห่าง 1 เมตรตรงหน้า [PLAYER] | 3D Geometry: จุดศูนย์ถ่วงทิ้งลงส้นเท้าทั้งสองข้าง แขนสองข้างประสานไว้ระดับเอว กำนิ้วมือแน่น องศากระดูกสันหลังยืดตรงแต่อ่อนน้อม Head Pitch ก้มลงเล็กน้อย | Skin Micro-Details: แก้มขาวซับสีชมพูระเรื่อบางเบา สายตาหลังกรอบแว่นแอบสบตา [PLAYER] สั้นๆ ลมหายใจเข้าออกเป็นจังหวะสม่ำเสมอ | Wardrobe Continuity: เสื้อเชิ้ตสีขาวผ้าฝ้ายติดกระดุมเม็ดบนสุด ตึงรั้งเล็กน้อยบริเวณหน้าอกอวบอิ่ม',
        hidden_evaluation_criteria: {
          'ยอมรับกระเป๋าอุปกรณ์และเดินตาม': {
            action_result: 'progress',
            feedback: 'เธอแอบส่งยิ้มขอบคุณบางเบาผ่านกรอบแว่น ก่อนจะก้าวเดินนำออกพ้นประตู',
          },
          'พยายามปฏิเสธหรือไม่ยอมเดินตาม': {
            action_result: 'loop',
            feedback: 'ประธานชมรมกดดันหนักขึ้น บังคับยัดกระเป๋าใส่มืออย่างเลี่ยงไม่ได้',
          },
        },
        pacing_control: {
          max_turns: 3,
          action_result: 'progress',
          inevitable_consequence: 'ประธานชมรมยัดกระเป๋าอุปกรณ์ใส่มือ [PLAYER] อย่างไม่ยอมให้ปฏิเสธ พร้อมผลักหลัง [PLAYER] ให้เดินตาม [ACTOR] ออกพ้นประตูเรียวกังทันที',
        },
      },
      {
        beat_id: 'scene_1_beat_2',
        actor_state: 'Player Anchor: ยืนเดินนำหน้า [PLAYER] ระยะ 0.5 เมตรบนทางเดินดินโคลน | 3D Geometry: ลำตัวท่อนบนเอียงไปข้างหน้า 15 องศาเพื่อฝ่าสายลม สะโพกผึ่งผายขยับยักย้ายตามจังหวะก้าวเดิน เข่าทั้งสองข้างสั่นระริกเล็กน้อยจากความหนาว สายตาหลุบต่ำ | Skin Micro-Details: หยดน้ำฝนเกาะแพรวพราวตามแก้มและซอกคอ ไอน้ำระเหยออกจากผิวเนื้อที่ร้อนผ่าว ดวงตาหลังแว่นตากรอกหนาที่เริ่มขึ้นฝ้าหรี่ลงเล็กน้อย | Wardrobe Continuity: เสื้อเชิ้ตสีขาวเปียกโชกแนบสนิทไปกับผิวเนื้อจนโปร่งแสง เผยให้เห็นบราเซียลูกไม้สีดำสนิทที่พยุงหน้าอกอวบอิ่มชูชันขัดกับมาดสุภาพ',
        hidden_evaluation_criteria: {
          'เอ่ยเตือนเรื่องเสื้อเปียกหรือยื่นเสื้อบังฝน': {
            action_result: 'progress',
            feedback: 'เธอหน้าแดงก่ำ ก้มหน้าดึงเสื้อด้วยความประหม่า ลมหายใจเริ่มติดขัด',
          },
          'ทำเป็นไม่สนใจหรือเดินหนีออกห่าง': {
            action_result: 'loop',
            feedback: 'ลมพัดกรรโชกแรงขึ้น ฝนสาดจนเสื้อแนบเนื้อโปร่งใสยิ่งกว่าเดิม',
          },
        },
        pacing_control: {
          max_turns: 3,
          action_result: 'progress',
          inevitable_consequence: 'สายฝนเทกระหน่ำลงมารุนแรงยิ่งขึ้น ลมพัดแรงจนเสื้อเชิ้ตขาวเปียกแนบเนื้อ [ACTOR] จนเห็นลายลูกไม้สีดำชัดเจน [ACTOR] หันกลับมาใช้นิ้วดันแว่นที่ขึ้นฝ้าด้วยความประหม่า',
        },
      },
      {
        beat_id: 'scene_1_beat_3',
        actor_state: 'Player Anchor: ทอดตัวลื่นไถลทับอยู่บนเรือนร่างของ [PLAYER] ตรงเนินดินโคลน | 3D Geometry: ทรวงอกอวบอิ่มบดเบียดแผงอก [PLAYER] เต็มแรง แขนสองข้างโอบรอบคอ [PLAYER] ขาขวาก่ายเกยระหว่างขาของ [PLAYER] องศากระดูกสันหลังแอ่นโค้งรองรับการกระแทก | Skin Micro-Details: ลมหายใจร้อนระอุเป่ารดซอกคอ [PLAYER] ผิวเนื้อสั่นสะท้านระริก อุณหภูมิร่างกายสูงขึ้นกะทันหัน แว่นตาเอียงกระเท่เร่บนดั้ง | Wardrobe Continuity: เสื้อเชิ้ตเปียกฝนเปรอะคราบโคลนบางจุด กระดุมเม็ดบนหลุดออกเผยเนินอกขาวผ่อง',
        hidden_evaluation_criteria: {
          'ช่วยโอบพยุงและเอ่ยถามอาการบาดเจ็บ': {
            action_result: 'progress',
            feedback: 'เธอทิ้งน้ำหนักตัวซบอกคุณเต็มแรง เสียงหอบกระเส่าสะท้อนทั่วถ้ำ',
          },
          'ผลักออกอย่างแรงหรือพยายามวิ่งหนี': {
            action_result: 'loop',
            feedback: 'ดินโคลนสไลด์ปิดปากทางถ้ำ บีบให้ทั้งคู่ติดอยู่ในความมืดสลัวด้วยกัน',
          },
        },
        pacing_control: {
          max_turns: 3,
          action_result: 'progress',
          inevitable_consequence: '[ACTOR] ส่งเสียงกรีดร้องสั้นๆ ก่อนจะล้มเสียหลักทับร่าง [PLAYER] ทั้งสองกลิ้งคลุกโคลนไถลลงเนินชัน ลื่นไหลพรวดเข้าไปหยุดอยู่ภายในซอกถ้ำหินแกรนิตร้างอันมืดสลัว',
        },
      },
    ],
  },
  {
    scene_id: 'scene_2',
    title: 'ฉากที่ 2: ซอกถ้ำหินแกรนิตร้าง',
    location_key: 'ซอกถ้ำหินแกรนิตร้าง',
    position: { x: 540, y: 100 },
    scene_objective: "[ACTOR] ต้องการชำระล้างคราบโคลนและบรรเทาอาการร้อนรุ่มจากพิษพฤกษศาสตร์ที่ซึมเข้าผิวด้วย 'โอสถน้ำมังกร' ของ [PLAYER]",
    forced_chaos_level: 'medium',
    event_mood: 'มืดสลัว เย็นเยือก ร้อนรุ่ม ซ่านสยิว พื้นที่ปิดตาย (Proxemic Trap)',
    director_vision: 'The Proxemic Trap: บีบเค้นอารมณ์ในพื้นที่ปิดตาย เปลี่ยนแปลงอารมณ์จากความกลัวเป็นความต้องการอันคุคลั่ง',
    director_setup: 'ผนังหินแกรนิตชื้นแฉะส่งผ่านความเย็นยะเยือกเข้ามาในความมืดสลัวภายในซอกถ้ำ เสียงหยดน้ำกระทบพื้นหินดังแผ่วเบาเป็นจังหวะ [PLAYER] นั่งชันเข่าอยู่บนพื้นหินเย็นเยือกพร้อมกับถือขวดน้ำดื่มบรรจุขวดไว้ในมือแน่น ขณะที่ร่างของ [ACTOR] นั่งแนบหลังติดผนังถ้ำด้านใน แสงสว่างอันน้อยนิดสะท้อนเงาของความตึงเครียดและอุณหภูมิที่เริ่มเปลี่ยนไปอย่างประหลาด',
    premise: 'ผนังหินแกรนิตชื้นแฉะส่งผ่านความเย็นยะเยือกเข้ามาในความมืดสลัวที่มีเพียงเสียงหยดน้ำกระทบพื้น [PLAYER] นั่งชันเข่ากำขวดน้ำดื่มขวดเดียวในมือแน่น เบื้องหน้าคือ [ACTOR] ที่แผ่นหลังแนบติดผนังหิน ลมหายใจเป่าออกมาเป็นไอสีขาวท่ามกลางความเงียบอึดอัด',
    beats: [
      {
        beat_id: 'scene_2_beat_1',
        actor_state: 'Player Anchor: นั่งชันเข่าห่างจาก [PLAYER] เพียง 30 เซนติเมตร | 3D Geometry: นั่งพับเพียบเอียงสะโพก น้ำหนักตัวทิ้งไปที่ลาดไหล่ซ้าย แขนซ้ายยันพื้นหิน แขนขวายกขึ้นแตะซอกคอ องศากระดูกสันหลังโก้งโค้งเล็กน้อย | Skin Micro-Details: ละอองพิษพฤกษศาสตร์ซึมเข้าบาดแผลถลอกบนผิวเนื้ออย่างรวดเร็ว ผิวเริ่มซับสีแดงก่ำ รูขุมขนเปิดกว้าง ลมหายใจหอบกระเส่าถี่กระชั้น แว่นตากรอกหนาขึ้นฝ้าหนาทึบ | Wardrobe Continuity: รอยแยกของกระดุมเสื้อเชิ้ตเปิดกว้างขึ้นเมื่อละอองน้ำราดผ่าน',
        hidden_evaluation_criteria: {
          'เปิดขวดน้ำค่อยๆ เทน้ำลงบนบาดแผล': {
            action_result: 'progress',
            feedback: 'เธอส่งเสียงครางพร่า ผิวเนื้อสั่นสะท้านเมื่อน้ำเย็นสัมผัสผิวร้อนผ่าว',
          },
          'ปฏิเสธที่จะเทน้ำหรือเก็บขวดไว้': {
            action_result: 'loop',
            feedback: 'เธอพุ่งเข้าแย่งขวดน้ำอย่างไม่คิดชีวิตจนตัวเบียดชิดติดกัน',
          },
        },
        pacing_control: {
          max_turns: 3,
          action_result: 'progress',
          inevitable_consequence: '[ACTOR] แย่งขวดน้ำไปถือเองแล้วราดลงบนไหล่และซอกคอที่มีแผลถลอก พิษพฤกษศาสตร์เข้มข้นซึมผ่านผิวหนังเปียกชื้นทันที ทำให้ส่งเสียงครางพร่าและตัวเกร็งกระตุก',
        },
      },
      {
        beat_id: 'scene_2_beat_2',
        actor_state: 'Player Anchor: อยู่ตรงหน้า [PLAYER] ในระยะกระชั้นชิด | 3D Geometry: ถอดแว่นขว้างทิ้งลงพื้นหิน ปล่อยขาทั้งสองข้างแยกออกเล็กน้อย สะโพกเกร็งแอ่นลอยขึ้นจากพื้นหิน 30 องศา มือสองข้างขยำเกร็งอยู่บนหน้าขาตนเอง | Skin Micro-Details: ดวงตาสีดำขลับเยิ้มฉ่ำปราศจากแว่นตาจ้องมอง [PLAYER] ด้วยสายตานักล่า ลิ้นแตะริมฝีปาก เหงื่อกาฬแตกพล่านอุ่นจัดผ่อนคลายสะท้าน | Wardrobe Continuity: บราลูกไม้สีดำโผล่พ้นเสื้อเชิ้ตเปียกชื้น หน้าอกอวบใหญ่กระเพื่อมขึ้นลงตามจังหวะหายใจรุนแรง',
        hidden_evaluation_criteria: {
          'ช่วยราดน้ำเย็นหรือตกใจที่เธอเปลี่ยนเป็นสายตานักล่า': {
            action_result: 'progress',
            feedback: 'สายตาคมกริบจ้องลึกเข้ามาในดวงตาคุณอย่างหิวกระหาย',
          },
          'พยายามถอยหนีไปทางปากถ้ำ': {
            action_result: 'loop',
            feedback: 'เธอคว้าข้อเท้าคุณไว้แน่น ดึงกระชากกลับเข้ามาในซอกหินมืด',
          },
        },
        pacing_control: {
          max_turns: 3,
          action_result: 'progress',
          inevitable_consequence: '[ACTOR] คว้าขวดน้ำราดใส่ลำตัว แต่ฤทธิ์ Thermal Shock กลับทำให้สะโพกแอ่นเกร็งบดเบียดเข้าหาอากาศอย่างเสียวซ่าน ก่อนที่จะปลดถอดแว่นตาขว้างทิ้งลงพื้นหิน',
        },
      },
      {
        beat_id: 'scene_2_beat_3',
        actor_state: 'Player Anchor: โน้มตัวเข้าคลานคร่อมอยู่เหนือตัว [PLAYER] มือกุมคว้าอยู่ที่จุดยุทธศาสตร์ของ [PLAYER] | 3D Geometry: จุดศูนย์ถ่วงกดทับลงบนหน้าขาของ [PLAYER] มือขวาคว้าหมับแน่นที่กลางลำตัว [PLAYER] มือซ้ายยันแผงอก [PLAYER] ไว้ องศากระดูกสันหลังแอ่นโค้งกดต่ำ ใบหน้าห่างจาก [PLAYER] ไม่ถึง 5 เซนติเมตร | Skin Micro-Details: ลมหายใจร้อนผ่าวเป่ารดริมฝีปาก [PLAYER] แววตาคมกริบไร้ความเหนียมอาย เสียงกระซิบพร่าสั่งการขู่ชิดริมฝีปาก | Wardrobe Continuity: เสื้อเชิ้ตขาวหลุดลุ่ยออกจากกระโปรง เผยหน้าอกอวบอิ่มชูชันกระแทกสายตา',
        hidden_evaluation_criteria: {
          'สับสนและยอมนิ่งเฉยให้จับตรึงไว้': {
            action_result: 'progress',
            feedback: 'มือเรียวบีบกระชับแน่นขึ้น เสียงกระซิบขู่ชิดริมฝีปากสั่งให้ช่วยถอนพิษเดี๋ยวนี้',
          },
          'ปัดมือออกหรือพยายามขัดขืนดิ้นรน': {
            action_result: 'loop',
            feedback: 'เธอกดน้ำหนักตัวทับลงมาเต็มแรง ล็อคแขนทั้งสองข้างของคุณไว้กับพื้นหิน',
          },
        },
        pacing_control: {
          max_turns: 3,
          action_result: 'progress',
          inevitable_consequence: "[ACTOR] หมดความอดทน คลานพรวดเข้าคร่อมร่าง [PLAYER] มือเรียวคว้าหมับเข้าที่กลางลำตัว [PLAYER] แน่น พร้อมขู่ด้วยน้ำเสียงสั่นพร่าสั่งให้ส่ง 'โอสถน้ำมังกร' ออกมาดับพิษเดี๋ยวนี้",
        },
      },
    ],
  },
  {
    scene_id: 'scene_3',
    title: 'ฉากที่ 3: เส้นทางป่าทึบขากลับ',
    location_key: 'เส้นทางป่าทึบขากลับ',
    position: { x: 1000, y: 100 },
    scene_objective: '[ACTOR] ต้องบังคับให้ [PLAYER] ประคองช่วยดับพิษ โดยไม่ให้เพื่อนชมรมจับได้',
    forced_chaos_level: 'high',
    event_mood: 'สุ่มเสี่ยง ตื่นเต้น ป่าทึบ เปียกปอน ไร้ทางถอย',
    director_vision: 'The Climax: ปล่อยให้อารมณ์นำทาง ความสุ่มเสี่ยงขนานไปกับสายตาของคนนอก บีบคั้นถึงขีดสุด',
    director_setup: 'ละอองฝนบางเบาสาดกระทบใบไม้ดังเปาะแปะกลางป่าทึบสลัวยามเย็น แสงไฟฉายวับแวมและเสียงพูดคุยของกลุ่มเพื่อนชมรมเดินนำหน้าอยู่ห่างออกไปเพียงไม่กี่เมตร [PLAYER] เดินประคองก้าวอยู่ท้ายแถวสุดบนเส้นทางดินโคลน โดยมีร่างของ [ACTOR] ที่สวมแว่นตากลับคืนมาเดินขาสั่นพั่บๆ ทรุดซบอยู่อิงแผงอก [PLAYER] จากด้านหน้าท่ามกลางบรรยากาศที่เต็มไปด้วยความเสี่ยง',
    premise: 'ละอองฝนสาดกระทบใบไม้ดังเปาะแปะกลางป่าทึบสลัว มีแสงไฟฉายวับแวมจากกลุ่มเพื่อนชมรมเดินนำอยู่ห่างออกไปไม่กี่เมตร [PLAYER] เดินประคองก้าวอยู่ท้ายแถว โดยมี [ACTOR] ที่กลับมาสวมแว่นตาหนาเตอะเดินขาสั่นพั่บๆ พิงแผ่นอก [PLAYER] จากด้านหน้า',
    beats: [
      {
        beat_id: 'scene_3_beat_1',
        actor_state: 'Player Anchor: ยืนพิงแผ่นอกของ [PLAYER] จากด้านหน้า ระยะห่าง 0 เซนติเมตร | 3D Geometry: ทิ้งน้ำหนักตัวท่อนหลังแนบชิดติดแผงอก [PLAYER] เข่าทั้งสองข้างสั่นกระตุกพั่บๆ ทรงตัวไม่อยู่ มือสองข้างจับขอบแว่นตาปรับให้เข้าที่ องศากระดูกสันหลังโค้งเอียงซบถอยหลัง | Skin Micro-Details: เสียงหายใจกระซิบขู่สั่นเครือ กลิ่นกายหอมหวานผสมเหงื่ออุ่นฟุ้งกระจาย สะโพกท่อนล่างสั่นระริกบดเบียดเข้าหา [PLAYER] | Wardrobe Continuity: สวมชุดยูกาตะตัวโคร่งทับเสื้อเปียกเพื่ออำพรางสายตาเพื่อนๆ',
        hidden_evaluation_criteria: {
          'ช่วยประคองเอวหรือลำตัวไว้ไม่ให้ทรุด': {
            action_result: 'progress',
            feedback: 'เธอถอนหายใจโล่งอก สะโพกเบียดแนบชิดมากขึ้นเพื่อหาที่พึ่ง',
          },
          'ปล่อยมือหรือส่งเสียงโวยวายให้เพื่อนหันมา': {
            action_result: 'loop',
            feedback: 'เธอใช้ศอกกระทุ้งสีข้างคุณเบาๆ ส่งสายตาดุขู่ห้ามส่งเสียง',
          },
        },
        pacing_control: {
          max_turns: 3,
          action_result: 'progress',
          inevitable_consequence: 'เสียงตะโกนเรียกจากเพื่อนชมรมดังขึ้น [ACTOR] รีบสวมแว่นตากลับคืนเพื่อปรับลุคสุภาพ แต่ขาท่อนล่างสั่นสะท้านจนต้องทิ้งตัวลงพิงแผงอก [PLAYER] เต็มแรง',
        },
      },
      {
        beat_id: 'scene_3_beat_2',
        actor_state: 'Player Anchor: เดินควบคู่ไปกับ [PLAYER] มือ [PLAYER] ถูกดึงสอดเข้าไปใต้ชุดยูกาตะของ [ACTOR] | 3D Geometry: มือซ้ายจับมือกุมข้อมือ [PLAYER] ให้สอดเข้าไปใต้ผืนผ้า สะโพกบิดยักย้ายเกร็งรับสัมผัสขณะก้าวเดิน ศีรษะเอียงตะโกนตอบประธานชมรม | Skin Micro-Details: ความร้อนระอุใต้ร่มผ้าสัมผัสกับปลายนิ้ว [PLAYER] ลมหายใจสะอึกกักเก็บเสียงคราง เปลี่ยนเป็นน้ำเสียงราบเรียบตอบทฤษฎีวิชาการ | Wardrobe Continuity: ชายกระโปรงยูกาตะเลิกสูงขึ้นเล็กน้อยตามจังหวะก้าวเดิน',
        hidden_evaluation_criteria: {
          'ยอมสอดมือและประคองสัมผัสตามคำสั่ง': {
            action_result: 'progress',
            feedback: 'เธอสะอึกเกร็ง สะโพกบิดส่ายรับจังหวะ ขณะส่งเสียงตอบทฤษฎีพฤกษศาสตร์กลบเกลื่อน',
          },
          'พยายามชักมือกลับหรือขัดขืน': {
            action_result: 'loop',
            feedback: 'เธอบีบข้อมือคุณแน่นขึ้น บังคับตรึงมือไว้ใต้ผืนผ้า',
          },
        },
        pacing_control: {
          max_turns: 3,
          action_result: 'progress',
          inevitable_consequence: '[ACTOR] คว้ามือ [PLAYER] สอดเข้าไปใต้ชุดยูกาตะกักเก็บไอร้อน ขณะเดียวกันก็ตะโกนตอบคำถามวิชาการพฤกษศาสตร์กับประธานชมรมด้วยน้ำเสียงสั่นพร่าแต่แสร้งทำเป็นปกติ',
        },
      },
      {
        beat_id: 'scene_3_beat_3',
        actor_state: 'Player Anchor: คุกเข่าอยู่ตรงหน้า [PLAYER] บนพื้นดินโคลนริมทาง | 3D Geometry: จุดศูนย์ถ่วงทิ้งลงที่เข่าทั้งสองข้างบนพื้นโคลน ลำตัวท่อนบนโน้มเข้าหา [PLAYER] สองมือกุมรอบจุดยุทธศาสตร์อุ่นจัด ใบหน้าเงยขึ้น 60 องศา | Skin Micro-Details: แว่นตาสไลด์ลงมาที่ปลายจมูก ดวงตาเยิ้มเชื่อมสบตา [PLAYER] ริมฝีปากอุ่นจัดเข้าประกบเพื่อดึงถอนพิษ อุณหภูมิในช่องปากร้อนระอุฉ่ำชื้น | Wardrobe Continuity: ยูกาตะแหวกออกกว้าง ดินโคลนเปรอะเปื้อนหัวเข่าเนียนนุ่ม',
        hidden_evaluation_criteria: {
          'ยืนนิ่งยอมปล่อยให้เธอช่วยถอนพิษจนเสร็จสิ้น': {
            action_result: 'progress',
            feedback: 'ความร้อนระอุโอบรัดแน่น ถอนพิษจนหมดสิ้นสู่ความสงบเยือกเย็น',
          },
          'ถอยหลังหนีหรือพยายามดันตัวเธอออก': {
            action_result: 'loop',
            feedback: 'สองมือเรียวรวบจับสะโพกคุณแน่น ล็อคไม่ให้ถอยหนีแม้แต่มิลลิเมตรเดียว',
          },
        },
        pacing_control: {
          max_turns: 3,
          action_result: 'progress',
          inevitable_consequence: "[ACTOR] ตะโกนบอกให้กลุ่มเพื่อนเดินล่วงหน้าไปก่อน แล้วทรุดตัวลงคุกเข่าบนพื้นโคลนทันที [ACTOR] ช่วยประกบดึงถอนพิษเพื่อรีดโอสถน้ำมังกรชำระล้างพิษจนหมดสิ้น",
        },
      },
    ],
  },
];

export default function RailroadCanvas({
  draft,
  onUpdateDraft,
  isEditable = true,
}: RailroadCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Viewport Transform (Pan & Zoom)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [zoom, setZoom] = useState<number>(0.9);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const startPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Node Dragging State
  const [draggingSceneId, setDraggingSceneId] = useState<string | null>(null);
  const dragStartPosRef = useRef<{ mouseX: number; mouseY: number; nodeX: number; nodeY: number }>({
    mouseX: 0,
    mouseY: 0,
    nodeX: 0,
    nodeY: 0,
  });

  // Current Scenario Scenes
  const scenario: WorldScenario = draft.scenario || {
    id: 'botanical_scenario_01',
    name: draft.worldTitle || 'Scenario Flow',
    scenes: DEFAULT_SCENES,
  };

  const scenes: WorldScene[] =
    scenario.scenes && scenario.scenes.length > 0 ? scenario.scenes : DEFAULT_SCENES;

  const availableLocations =
    draft.real_locations && Object.keys(draft.real_locations).length > 0
      ? draft.real_locations
      : DEFAULT_BOTANICAL_LOCATIONS;

  // Save changes back to draft
  const handleUpdateScenes = useCallback(
    (newScenes: WorldScene[]) => {
      if (onUpdateDraft) {
        onUpdateDraft({
          scenario: {
            ...scenario,
            scenes: newScenes,
          },
        });
      }
    },
    [onUpdateDraft, scenario]
  );

  // 1. PANNING HANDLERS
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    // Only pan if clicking canvas background (button === 0)
    if (e.button !== 0) return;
    setIsPanning(true);
    startPanRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    };
  };

  // 2. ZOOM HANDLER (WHEEL)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = -e.deltaY * 0.001;
    const newZoom = Math.min(Math.max(zoom + zoomDelta, 0.4), 1.5);
    setZoom(Number(newZoom.toFixed(2)));
  };

  // 3. NODE DRAG HANDLERS
  const handleStartDragNode = (e: React.MouseEvent, sceneId: string) => {
    e.stopPropagation();
    const targetScene = scenes.find((s) => s.scene_id === sceneId);
    if (!targetScene) return;

    setDraggingSceneId(sceneId);
    dragStartPosRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      nodeX: targetScene.position?.x ?? 80,
      nodeY: targetScene.position?.y ?? 100,
    };
  };

  // Global mouse move and up for Pan & Node Drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        setPan({
          x: e.clientX - startPanRef.current.x,
          y: e.clientY - startPanRef.current.y,
        });
      } else if (draggingSceneId) {
        const dx = (e.clientX - dragStartPosRef.current.mouseX) / zoom;
        const dy = (e.clientY - dragStartPosRef.current.mouseY) / zoom;

        const updatedScenes = scenes.map((s) => {
          if (s.scene_id === draggingSceneId) {
            return {
              ...s,
              position: {
                x: Math.round(dragStartPosRef.current.nodeX + dx),
                y: Math.round(dragStartPosRef.current.nodeY + dy),
              },
            };
          }
          return s;
        });
        handleUpdateScenes(updatedScenes);
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      setDraggingSceneId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, draggingSceneId, zoom, scenes, handleUpdateScenes]);

  // 4. SCENE ACTIONS (UPDATE, DELETE, INSERT, ADD)
  const handleUpdateScene = (index: number, updatedScene: WorldScene) => {
    const updated = [...scenes];
    updated[index] = updatedScene;
    handleUpdateScenes(updated);
  };

  const handleDeleteScene = (index: number) => {
    const updated = scenes.filter((_, idx) => idx !== index);
    handleUpdateScenes(updated);
  };

  const handleAddSceneEnd = () => {
    const lastScene = scenes[scenes.length - 1];
    const newX = lastScene?.position?.x ? lastScene.position.x + 460 : 80;
    const newY = lastScene?.position?.y ? lastScene.position.y : 100;

    const newScene: WorldScene = {
      scene_id: `scene_${Date.now()}`,
      title: `ฉากที่ ${scenes.length + 1}: สถานการณ์ใหม่`,
      location_key: Object.keys(availableLocations)[0] || 'ห้องสกัดสมุนไพร ณ เรือนพักปีกใน',
      position: { x: newX, y: newY },
      scene_objective: 'เป้าหมายหลักในฉากนี้...',
      forced_chaos_level: 'low',
      event_mood: 'อารมณ์และบรรยากาศ...',
      director_vision: 'วิสัยทัศน์ผู้กำกับ...',
      director_setup: 'บทบรรยายนำเปิดฉาก...',
      premise: 'เรื่องย่อของฉาก...',
      beats: [
        {
          beat_id: 'Beat 01: จุดเริ่มต้น',
          director_setup: 'บทบรรยายนำเหตุการณ์...',
          actor_state: 'ท่าทางและการตอบสนอง...',
          hidden_evaluation_criteria: {},
          pacing_control: {
            max_turns: 3,
            action_result: 'progress',
            inevitable_consequence: 'ก้าวสู่บีตถัดไป',
          },
        },
      ],
    };

    handleUpdateScenes([...scenes, newScene]);
  };

  const handleInsertSceneBetween = (fromIndex: number) => {
    const sceneA = scenes[fromIndex];
    const sceneB = scenes[fromIndex + 1];

    const posX =
      sceneA?.position && sceneB?.position
        ? Math.round((sceneA.position.x + sceneB.position.x) / 2)
        : (sceneA?.position?.x ?? 80) + 230;

    const posY =
      sceneA?.position && sceneB?.position
        ? Math.round((sceneA.position.y + sceneB.position.y) / 2)
        : 100;

    const insertedScene: WorldScene = {
      scene_id: `scene_mid_${Date.now()}`,
      title: `ฉากคั่น: จังหวะเปลี่ยนผ่าน`,
      location_key: sceneA?.location_key || Object.keys(availableLocations)[0],
      position: { x: posX, y: posY },
      scene_objective: 'ฉากคั่นกลางเพื่อชะลอหรือเร่งจังหวะเรื่องราว...',
      forced_chaos_level: 'medium',
      event_mood: 'ตึงเครียด ชะงักงัน',
      director_vision: 'The Transition: จัดวางจุดพักหรือจุดเปลี่ยนอารมณ์',
      director_setup: 'บรรยายเหตุการณ์ที่เกิดขึ้นกะทันหันระหว่างสองฉาก...',
      premise: 'เหตุการณ์ไม่คาดคิดที่แทรกขึ้นมา...',
      beats: [
        {
          beat_id: 'Beat 01: ชนวนคั่นกลาง',
          director_setup: 'เสียงสิ่งของตกหรือเหตุการณ์ไม่คาดคิด...',
          actor_state: 'ชะงักนิ่ง สายตาสับสน...',
          hidden_evaluation_criteria: {},
          pacing_control: {
            max_turns: 2,
            action_result: 'progress',
            inevitable_consequence: 'มุ่งหน้าสู่ฉากต่อไป',
          },
        },
      ],
    };

    const updated = [...scenes];
    updated.splice(fromIndex + 1, 0, insertedScene);
    handleUpdateScenes(updated);
  };

  const totalBeats = scenes.reduce((acc, s) => acc + (s.beats?.length || 0), 0);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDownCanvas}
      onWheel={handleWheel}
      className={`relative w-full h-full min-h-[640px] flex-1 overflow-hidden select-none cursor-grab active:cursor-grabbing bg-[#0B0B0E] ${
        isPanning ? 'cursor-grabbing' : ''
      }`}
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* ✦ 1. WORLD CANVAS TRANSFORM CONTAINER (SCALED & PANNED) */}
      <div
        className="absolute origin-top-left transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          minWidth: '4000px',
          minHeight: '4000px',
        }}
      >
        {/* SVG Bezier Railroad Cable Overlay */}
        <RailroadCableOverlay
          scenes={scenes}
          onInsertSceneBetween={handleInsertSceneBetween}
          isEditable={isEditable}
        />

        {/* Render Each Scene Node Card */}
        {scenes.map((scene, idx) => (
          <SceneNodeCard
            key={scene.scene_id || idx}
            scene={scene}
            index={idx}
            availableLocations={availableLocations}
            onUpdateScene={(updated) => handleUpdateScene(idx, updated)}
            onDeleteScene={() => handleDeleteScene(idx)}
            onStartDrag={handleStartDragNode}
            isEditable={isEditable}
          />
        ))}
      </div>

      {/* ✦ 2. FLOATING HUD TOOLBAR (APPLE TACTILE DOCK) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 rounded-full bg-[#16161E]/90 backdrop-blur-2xl border border-white/12 shadow-[0_12px_32px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.12)] z-30 pointer-events-auto">
        {/* Scene & Beat Counter Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 text-[11.5px] font-medium text-white/75 border-r border-white/10">
          <Layers size={13} className="text-[#EF264C]" />
          <span>{scenes.length} ฉาก</span>
          <span className="text-white/25">•</span>
          <span>{totalBeats} บีต</span>
        </div>

        {/* Add Scene Button */}
        {isEditable && (
          <button
            type="button"
            onClick={handleAddSceneEnd}
            className="px-3.5 py-1.5 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-[0_2px_10px_rgba(239,38,76,0.35)] active:scale-95 transition-all cursor-pointer select-none"
          >
            <Plus size={13} strokeWidth={2.4} />
            <span>เพิ่มฉากใหม่</span>
          </button>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 pl-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(Number((z - 0.1).toFixed(2)), 0.4))}
            className="w-7 h-7 rounded-full bg-white/[0.04] hover:bg-white/[0.12] text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="ซูมออก (-)"
          >
            <ZoomOut size={12} strokeWidth={2.2} />
          </button>
          <span className="text-[11px] font-mono text-white/60 w-10 text-center select-none">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(Number((z + 0.1).toFixed(2)), 1.5))}
            className="w-7 h-7 rounded-full bg-white/[0.04] hover:bg-white/[0.12] text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="ซูมเข้า (+)"
          >
            <ZoomIn size={12} strokeWidth={2.2} />
          </button>

          {/* Reset Zoom / Center Button */}
          <button
            type="button"
            onClick={() => {
              setZoom(0.9);
              setPan({ x: 40, y: 30 });
            }}
            className="w-7 h-7 rounded-full bg-white/[0.04] hover:bg-white/[0.12] text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer ml-0.5"
            title="จัดกึ่งกลางมุมมอง"
          >
            <RotateCcw size={11} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* ✦ 3. TOP-LEFT CANVAS INSTRUCTION HINT */}
      <div className="absolute top-4 left-6 flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-xl border border-white/[0.08] text-[10.5px] text-white/40 pointer-events-none z-20">
        <Sparkles size={11} className="text-[#EF264C]" />
        <span>ลากเมาส์เลื่อนผืนผ้าใบ • หมุนลูกกลิ้งเพื่อซูม • ลากหัวการ์ดย้ายตำแหน่ง</span>
      </div>
    </div>
  );
}
