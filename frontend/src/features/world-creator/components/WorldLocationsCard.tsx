import { useState, type RefObject } from 'react';
import {
  MapPin,
  Pencil,
  X,
  Check,
  Maximize2,
  AlertTriangle,
  Package,
  Volume2,
} from 'lucide-react';
import type { WorldLocationsMap } from '../types';

interface WorldLocationsCardProps {
  cardRef?: RefObject<HTMLDivElement | null>;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
  onSave?: (locations: WorldLocationsMap) => void;
  locations?: WorldLocationsMap;
}

const DEFAULT_LOCATIONS: WorldLocationsMap = {
  'ห้องโถงเสื่อทาทามิเรียวกัง': {
    base_mood: 'อบอุ่น ผ่อนคลาย ผสมความกระอักกระอ่วนจากการเกี่ยงงาน',
    choke_points: 'ทางเดินประตูทางออกจากเรียวกังสู่ภายนอก',
    sensory_cues: {
      ambient_cues: [
        'ไอน้ำชาเขียวอบอุ่น',
        'กลิ่นหอมอบอวลของไม้และเสื่อทาทามิ',
        'ลมเย็นเยือกที่พัดกวาดเข้ามาจากด้านนอก',
      ],
    },
    key_furniture: 'โต๊ะชาไม้ต่ำ, กระเป๋าอุปกรณ์พฤกษศาสตร์ใบโต, กาน้ำชาเขียว',
    spatial_layout:
      'ห้องโถงกว้างอบอุ่น ปูเสื่อทาทามิ มีโต๊ะชาต่ำอยู่กลางห้อง ประตูกระจกบานเลื่อนเปิดออกสู่เฉลียงมองเห็นทิวเขา',
  },
  'เส้นทางป่าทึบขากลับ': {
    base_mood: 'เสี่ยง ตื่นเต้น บีบคั้น และเปียกปอน',
    choke_points: 'ท้ายแถวเดินป่าที่อยู่ห่างจากเพื่อนร่วมชมรมเพียงไม่กี่เมตร',
    sensory_cues: {
      ambient_cues: [
        'เสียงละอองฝนสาดกระทบใบไม้ดังเปาะแปะ',
        'แสงไฟฉายวับแวมส่องลอดทิวไม้',
        'เสียงตะโกนคุยเรื่องวิชาการพฤกษศาสตร์',
      ],
    },
    key_furniture: 'กระเป๋าอุปกรณ์, ไฟฉายของสมาชิกชมรม',
    spatial_layout:
      'ทางเดินดินโคลนลื่นลาดชัน ร่องน้ำไหลข้างทาง ต้นไม้ใหญ่ปกคลุมทึบสองข้างทาง',
  },
  'ซอกถ้ำหินแกรนิตร้าง': {
    base_mood: 'หนาวสลับร้อน มืดสลัว บีบคั้น และเป็นพื้นที่ปิดตาย (Proxemic Trap)',
    choke_points: 'ปากถ้ำแคบที่เป็นทางเข้าออกเดียว',
    sensory_cues: {
      ambient_cues: [
        'เสียงหยดน้ำกระทบพื้นหินดังแผ่วเบาเป็นจังหวะ',
        'กลิ่นดินโคลนชื้นและไอร้อนจากผิวเนื้อ',
        'ความเย็นยะเยือกของผนังหินแกรนิต',
      ],
    },
    key_furniture: 'ก้อนหินแกรนิตราบเรียบสำหรับนั่ง, ขวดน้ำดื่มบรรจุขวด',
    spatial_layout:
      'ซอกถ้ำหินแกรนิตแคบๆ พื้นหินเย็นเยือกและเปียกชื้น ผนังหินสองข้างบีบเข้าหากันจนต้องนั่งชิดกัน',
  },
};

export default function WorldLocationsCard({
  cardRef,
  isEditing = false,
  onStartEdit,
  onCancelEdit,
  onSave,
  locations = DEFAULT_LOCATIONS,
}: WorldLocationsCardProps) {
  const locMap = locations && Object.keys(locations).length > 0 ? locations : DEFAULT_LOCATIONS;
  const locationNames = Object.keys(locMap);
  const [selectedLocName, setSelectedLocName] = useState<string>(locationNames[0] || '');

  // Edit state (copy of locMap)
  const [editMap, setEditMap] = useState<WorldLocationsMap>(locMap);

  const handleStart = () => {
    setEditMap({ ...locMap });
    onStartEdit?.();
  };

  const handleSave = () => {
    onSave?.(editMap);
  };

  // Ensure selected location exists
  const activeName = locationNames.includes(selectedLocName) ? selectedLocName : locationNames[0];
  const activeLocation = locMap[activeName] || DEFAULT_LOCATIONS['ห้องโถงเสื่อทาทามิเรียวกัง'];
  const editLocation = editMap[activeName] || activeLocation;

  return (
    <div
      ref={cardRef}
      className="scroll-mt-4 rounded-2xl bg-[#111112] border border-[#2F3336] p-4 sm:p-5 flex flex-col gap-4 text-left transition-all duration-200"
    >
      {/* Header Bar - Contained Director's Briefing Style */}
      <div className="flex items-center justify-between border-b border-[#2F3336]/60 pb-2.5">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-[#EF264C] shrink-0" />
          <div>
            <h3 className="text-[13px] sm:text-[14px] font-bold text-[#F2F2F5] tracking-wider uppercase">
              สถาปัตยกรรมฉาก & จุดคอขวด (Locations & Choke Points)
            </h3>
            <span className="text-[11px] text-[#ACACB2]">
              {locationNames.length} ฉากพิกัดปิดตายและจุดชี้ชะตา
            </span>
          </div>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white text-[12.5px] font-medium transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Check size={14} />
              <span>บันทึก</span>
            </button>
            <button
              onClick={onCancelEdit}
              className="px-3 py-1.5 rounded-full border border-[#2F3336] hover:bg-white/[0.08] hover:border-white/35 text-[#ACACB2] text-[12.5px] transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <X size={14} />
              <span>ยกเลิก</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleStart}
            className="w-8 h-8 rounded-full border border-[#2F3336] bg-transparent hover:bg-white/[0.08] hover:border-white/35 text-[#F2F2F5] flex items-center justify-center transition-all cursor-pointer active:scale-90"
            title="แก้ไขฉากและคอขวด"
          >
            <Pencil size={13} />
          </button>
        )}
      </div>

      {/* Location Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {locationNames.map((locName) => {
          const isCurrent = locName === activeName;
          return (
            <button
              key={locName}
              onClick={() => setSelectedLocName(locName)}
              className={`px-3 py-1.5 rounded-full text-[12px] sm:text-[12.5px] font-medium transition-all shrink-0 cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                isCurrent
                  ? 'bg-[#0B0B0C] border border-[#EF264C]/70 text-[#F2F2F5] shadow-sm'
                  : 'bg-transparent text-[#ACACB2] border border-[#2F3336] hover:border-white/20 hover:text-[#F2F2F5]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCurrent ? 'bg-[#EF264C]' : 'bg-[#ACACB2]/40'
                }`}
              />
              <span>{locName}</span>
            </button>
          );
        })}
      </div>

      {/* Card Content Body */}
      {isEditing ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-[#ACACB2]">อารมณ์พื้นฐานของฉาก (Base Mood)</label>
            <input
              type="text"
              value={editLocation.base_mood}
              onChange={(e) => {
                setEditMap({
                  ...editMap,
                  [activeName]: { ...editLocation, base_mood: e.target.value },
                });
              }}
              className="w-full px-3 py-2 bg-[#0B0B0C] border border-[#2F3336] focus:border-[#EF264C]/60 rounded-xl text-[#F2F2F5] text-[13.5px] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-[#EF264C] flex items-center gap-1.5 font-medium">
              <AlertTriangle size={13} />
              จุดคอขวด & จุดบีบระยะประชิด (Choke Points)
            </label>
            <textarea
              value={editLocation.choke_points}
              onChange={(e) => {
                setEditMap({
                  ...editMap,
                  [activeName]: { ...editLocation, choke_points: e.target.value },
                });
              }}
              rows={2}
              className="w-full px-3 py-2 bg-[#0B0B0C] border border-[#2F3336] focus:border-[#EF264C]/60 rounded-xl text-[#F2F2F5] text-[13.5px] outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-[#ACACB2] flex items-center gap-1.5">
              <Maximize2 size={13} />
              ผังพื้นที่และมิติกายภาพ (Spatial Layout)
            </label>
            <textarea
              value={editLocation.spatial_layout}
              onChange={(e) => {
                setEditMap({
                  ...editMap,
                  [activeName]: { ...editLocation, spatial_layout: e.target.value },
                });
              }}
              rows={2}
              className="w-full px-3 py-2 bg-[#0B0B0C] border border-[#2F3336] focus:border-[#EF264C]/60 rounded-xl text-[#F2F2F5] text-[13.5px] outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-[#ACACB2] flex items-center gap-1.5">
              <Package size={13} />
              สิ่งของประกอบฉากสำคัญ (Key Furniture / Props)
            </label>
            <input
              type="text"
              value={editLocation.key_furniture}
              onChange={(e) => {
                setEditMap({
                  ...editMap,
                  [activeName]: { ...editLocation, key_furniture: e.target.value },
                });
              }}
              className="w-full px-3 py-2 bg-[#0B0B0C] border border-[#2F3336] focus:border-[#EF264C]/60 rounded-xl text-[#F2F2F5] text-[13.5px] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-[#ACACB2] flex items-center gap-1.5">
              <Volume2 size={13} />
              ประสาทสัมผัสแวดล้อม (Ambient Sensory Cues - บรรทัดละ 1 ข้อ)
            </label>
            <textarea
              value={(editLocation.sensory_cues?.ambient_cues || []).join('\n')}
              onChange={(e) => {
                setEditMap({
                  ...editMap,
                  [activeName]: {
                    ...editLocation,
                    sensory_cues: {
                      ambient_cues: e.target.value.split('\n').filter(Boolean),
                    },
                  },
                });
              }}
              rows={3}
              className="w-full px-3 py-2 bg-[#0B0B0C] border border-[#2F3336] focus:border-[#EF264C]/60 rounded-xl text-[#F2F2F5] text-[13.5px] outline-none resize-none leading-relaxed"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Base Mood: กล่องซ้อนด้านใน #0B0B0C */}
          <div className="p-4 rounded-xl bg-[#0B0B0C] border border-[#2F3336]/80 flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider text-[#ACACB2] font-medium">
              อารมณ์พื้นฐานของฉาก (Base Mood)
            </span>
            <p className="text-[13.5px] sm:text-[14px] text-[#F2F2F5] leading-relaxed font-normal">
              {activeLocation.base_mood}
            </p>
          </div>

          {/* Choke Point (Critical): กล่องซ้อนด้านใน #0B0B0C พร้อมเน้นสี Choke Point */}
          <div className="p-4 rounded-xl bg-[#0B0B0C] border border-[#EF264C]/40 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[11.5px] uppercase tracking-wider text-[#EF264C] font-semibold">
              <AlertTriangle size={13} />
              <span>จุดคอขวด & บีบระยะประชิด (Choke Points)</span>
            </div>
            <p className="text-[13.5px] text-[#F2F2F5] leading-relaxed">
              {activeLocation.choke_points}
            </p>
          </div>

          {/* Spatial Layout: กล่องซ้อนด้านใน #0B0B0C */}
          <div className="p-4 rounded-xl bg-[#0B0B0C] border border-[#2F3336]/80 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#ACACB2] font-medium">
              <Maximize2 size={12} className="text-[#EF264C]" />
              <span>ผังพื้นที่กายภาพ (Spatial Layout)</span>
            </div>
            <p className="text-[13px] text-[#F2F2F5] leading-relaxed">
              {activeLocation.spatial_layout}
            </p>
          </div>

          {/* Key Furniture & Props: กล่องซ้อนด้านใน #0B0B0C */}
          <div className="p-3.5 rounded-xl bg-[#0B0B0C] border border-[#2F3336]/80 flex items-center gap-2.5">
            <Package size={15} className="text-[#EF264C] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-[#ACACB2]">
                วัตถุประกอบฉากสำคัญ (Key Furniture / Props)
              </span>
              <span className="text-[13px] text-[#F2F2F5] font-normal">
                {activeLocation.key_furniture}
              </span>
            </div>
          </div>

          {/* Sensory Cues List: กล่องซ้อนด้านใน #0B0B0C */}
          <div className="p-3.5 rounded-xl bg-[#0B0B0C] border border-[#2F3336]/80 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#ACACB2] font-medium">
              <Volume2 size={12} className="text-[#EF264C]" />
              <span>ประสาทสัมผัสแวดล้อม (Ambient Sensory Cues)</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {(activeLocation.sensory_cues?.ambient_cues || []).map((cue, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[13px] text-[#F2F2F5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C] shrink-0" />
                  <span>{cue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
