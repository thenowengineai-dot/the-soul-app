import { useState, useEffect } from 'react';
import { Pencil, Check, Plus, Trash2, BookOpen } from 'lucide-react';
import type { VaultDraft } from '../../types';

interface LoreBackgroundCardProps {
  draft: VaultDraft;
  onUpdateDraft?: (updated: Partial<VaultDraft>) => void;
  isEditable?: boolean;
}

const DEFAULT_STORIES: string[] = [
  'รุ่นพี่ปี 3 ผู้ครองตำแหน่งประธานชมรมพฤกษศาสตร์ มีประวัติเรียนดีเด่นและขึ้นชื่อเรื่องความสุภาพ เรียบร้อย และเก็บเนื้อเก็บตัวจนเกือบจะดูขี้ขลาดในสายตาคนนอก',
  'เบื้องหลังคือผู้เชี่ยวชาญด้านสมุนไพรและสรีรวิทยาของพืชที่มีรสนิยมลึกลับ เธอหลงใหลการสร้างสถานการณ์ \'พื้นที่อับ\' เพื่อล่อลวงรุ่นน้องที่เธอหมายตา',
  'มีความลับทางร่างกายที่ไม่อาจบอกใครได้ว่า ตนเองจะสูญเสียการควบคุมสติสัมปชัญญะทันทีเมื่อร่างกายได้รับความร้อนหรือน้ำมันนวดฤทธิ์ร้อน',
];

export default function LoreBackgroundCard({
  draft,
  onUpdateDraft,
  isEditable = true,
}: LoreBackgroundCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [stories, setStories] = useState<string[]>(() => {
    return draft.background_story && draft.background_story.length > 0
      ? draft.background_story
      : DEFAULT_STORIES;
  });

  // Sync draft updates if changed externally
  useEffect(() => {
    if (draft.background_story && draft.background_story.length > 0) {
      setStories(draft.background_story);
    }
  }, [draft.background_story]);

  // Save changes
  const handleSave = () => {
    setIsEditing(false);
    // Filter out completely empty entries
    const cleaned = stories.map((s) => s.trim()).filter(Boolean);
    const finalStories = cleaned.length > 0 ? cleaned : DEFAULT_STORIES;
    setStories(finalStories);
    if (onUpdateDraft) {
      onUpdateDraft({
        background_story: finalStories,
      });
    }
  };

  // Add new blank story
  const handleAddStory = () => {
    setStories((prev) => [...prev, '']);
  };

  // Update specific story index
  const handleStoryChange = (index: number, value: string) => {
    setStories((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  // Delete specific story index
  const handleDeleteStory = (index: number) => {
    if (stories.length <= 1) return; // Keep at least 1
    setStories((prev) => prev.filter((_, i) => i !== index));
  };

  // Common Bento Card Glass Recipe
  const frostedCardClass =
    'bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all flex flex-col justify-between relative overflow-hidden';

  return (
    <div
      className={`col-span-2 row-span-2 rounded-[28px] p-4 ${frostedCardClass}`}
      style={{ width: '346px', height: '346px' }}
    >
      {/* Header Row: Title + Story Count + Edit/Save Pill */}
      <div className="flex items-center justify-between shrink-0 mb-2 px-0.5">
        <div className="flex items-baseline gap-1.5 min-w-0 pr-2">
          <span className="text-[17.5px] sm:text-[18.5px] font-bold text-[#F1F1F1] tracking-tight whitespace-nowrap">
            ปูมหลัง
          </span>
          <span className="text-[11px] font-normal text-white/40 whitespace-nowrap">
            ({stories.length} บท)
          </span>
        </div>

        {isEditable && (
          <div className="shrink-0 flex items-center gap-1.5">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleAddStory}
                  className="px-2 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-[#EF264C] hover:text-[#ff4d6d] text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]"
                  title="เพิ่มบทปูมหลังใหม่"
                >
                  <Plus size={12} strokeWidth={2.5} />
                  <span>เพิ่มบท</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="w-7 h-7 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(239,38,76,0.4)] transition-all cursor-pointer active:scale-95"
                  title="บันทึกปูมหลัง"
                >
                  <Check size={13} strokeWidth={2.4} />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] active:scale-95"
                title="แก้ไขปูมหลัง"
              >
                <Pencil size={12} strokeWidth={2} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Body: Vertical Prose Flow with [ 01 ], [ 02 ], [ 03 ] Badges */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        {!isEditing ? (
          /* Display Mode: Scrollable Vertical Stack of Frosted Trays */
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
            {stories.map((story, index) => {
              const tagNumber = String(index + 1).padStart(2, '0');
              return (
                <div
                  key={index}
                  className="p-3 rounded-[18px] bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] hover:border-white/15 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] group"
                >
                  {/* Badge Row */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10.5px] font-mono font-semibold text-[#EF264C] bg-white/[0.06] border border-white/[0.10] px-2 py-0.5 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      [ {tagNumber} ]
                    </span>
                  </div>

                  {/* Story Prose Paragraph */}
                  <p className="text-[12.5px] sm:text-[13px] text-[#EDEDED] font-normal leading-[21px] tracking-tight">
                    {story}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          /* Edit Mode: Editable Textareas with Chapter Badges & Delete Buttons */
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
            {stories.map((story, index) => {
              const tagNumber = String(index + 1).padStart(2, '0');
              return (
                <div
                  key={index}
                  className="p-3 rounded-[18px] bg-white/[0.04] border border-white/[0.10] space-y-2 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-mono font-semibold text-[#EF264C] bg-white/[0.06] border border-white/[0.10] px-2 py-0.5 rounded-full">
                      [ {tagNumber} ]
                    </span>
                    {stories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteStory(index)}
                        className="w-5 h-5 rounded-full hover:bg-red-500/20 text-white/40 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                        title="ลบบทนี้"
                      >
                        <Trash2 size={11} strokeWidth={2} />
                      </button>
                    )}
                  </div>
                  <textarea
                    value={story}
                    onChange={(e) => handleStoryChange(index, e.target.value)}
                    placeholder="พิมพ์เนื้อหาปูมหลัง..."
                    rows={3}
                    className="w-full p-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-[12.5px] text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-none leading-relaxed"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom subtle status hairline */}
        <div className="pt-2 shrink-0 flex items-center justify-between text-[10.5px] text-white/35 px-1 border-t border-white/[0.06] mt-1">
          <span className="flex items-center gap-1">
            <BookOpen size={11} className="text-white/40" />
            <span>เรื่องราวในอดีตและปูมหลังชีวิต</span>
          </span>
          <span>{stories.length} เรื่องเล่า</span>
        </div>
      </div>
    </div>
  );
}
