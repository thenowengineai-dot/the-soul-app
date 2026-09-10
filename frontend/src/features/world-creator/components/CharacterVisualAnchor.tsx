import { useState, useRef, ChangeEvent } from 'react';
import { 
  Image as ImageIcon, 
  Plus, 
  ImagePlus, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Trash2
} from 'lucide-react';
import type { VaultDraft } from '../types';

interface CharacterVisualAnchorProps {
  draft: VaultDraft;
  width: number;
  isUploading?: boolean;
  onUploadImages?: (files: FileList | File[]) => void;
  onUpdateDraftImages?: (images: string[], coverImage: string) => void;
}

export default function CharacterVisualAnchor({
  draft,
  width,
  isUploading = false,
  onUploadImages,
  onUpdateDraftImages,
}: CharacterVisualAnchorProps) {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ดึงชุดรูปภาพทั้งหมดของตัวละครใน Draft นั้น
  const galleryImages: string[] =
    draft.images && draft.images.length > 0
      ? draft.images
      : draft.image
      ? [draft.image]
      : [];

  const currentImage = galleryImages[activeImageIndex] || draft.image || '';

  // สลับรูปภาพให้ภาพเป้าหมายกลายเป็น "รูปหน้าปก" (เลื่อนมาอยู่อันดับ 0)
  const handleSetCover = (targetIdx: number) => {
    if (targetIdx === 0 || !onUpdateDraftImages || targetIdx >= galleryImages.length) return;
    const selected = galleryImages[targetIdx];
    const remaining = galleryImages.filter((_, i) => i !== targetIdx);
    const newImages = [selected, ...remaining];
    onUpdateDraftImages(newImages, newImages[0]);
    setActiveImageIndex(0);
  };

  // เลื่อนตำแหน่งรูปภาพสลับลำดับ 1, 2, 3, 4
  const handleMoveImage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= galleryImages.length || !onUpdateDraftImages) return;
    const newImages = [...galleryImages];
    const [moved] = newImages.splice(fromIdx, 1);
    newImages.splice(toIdx, 0, moved);
    onUpdateDraftImages(newImages, newImages[0]);
    setActiveImageIndex(toIdx);
  };

  // ลบรูปภาพออกจากแกลเลอรี
  const handleDeleteImage = (targetIdx: number) => {
    if (!onUpdateDraftImages || galleryImages.length === 0) return;
    const newImages = galleryImages.filter((_, i) => i !== targetIdx);
    const newCover = newImages[0] || '';
    onUpdateDraftImages(newImages, newCover);
    setActiveImageIndex((prev) => Math.max(0, Math.min(prev, newImages.length - 1)));
  };

  // จัดการการเลือกไฟล์จากเครื่อง
  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onUploadImages) {
      onUploadImages(e.target.files);
    }
    // รีเซ็ต input value เพื่อให้สามารถเลือกไฟล์เดิมซ้ำได้หากต้องการ
    if (e.target) {
      e.target.value = '';
    }
  };

  return (
    <aside
      style={{ width: `${width}px` }}
      className="h-full shrink-0 flex flex-col bg-[#090909] p-3.5 sm:p-4 z-20 select-none overflow-hidden transition-[width] duration-75 ease-out"
    >
      {/* Hidden File Input สำหรับอัปโหลดรูปภาพ */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* 1. Header Bar: ป้ายกำกับ Image พร้อมไอคอนรูปภาพ และตัวนับจำนวนภาพ */}
      <div className="flex items-center justify-between shrink-0 mb-2.5 px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#EF264C]/10 border border-[#EF264C]/25 flex items-center justify-center shrink-0">
            <ImageIcon size={13} className="text-[#EF264C]" />
          </div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#ACACB2]">
            Image Gallery
          </span>
        </div>

        {galleryImages.length > 0 && (
          <div className="text-[10.5px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[#F2F2F5]">
            ภาพที่ {activeImageIndex + 1} / {galleryImages.length}
          </div>
        )}
      </div>

      {/* 2. Main Character Card: การ์ดสี่เหลี่ยมขอบมนขนาดใหญ่ สไตล์ Twitter / CharacterDetailModal */}
      <div className="flex-1 min-h-0 relative rounded-2xl sm:rounded-3xl border border-white/10 bg-[#121214] shadow-2xl overflow-hidden group flex flex-col justify-end">
        {/* Uploading Spinner Overlay */}
        {isUploading && (
          <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4 text-center">
            <div className="w-9 h-9 rounded-full border-2 border-[#EF264C] border-t-transparent animate-spin" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[13px] font-semibold text-[#F2F2F5]">
                กำลังบันทึกภาพขึ้น Cloud Storage
              </span>
              <span className="text-[11px] text-[#ACACB2]">
                จัดเก็บบน Google Cloud และซิงค์กับ Neon DB
              </span>
            </div>
          </div>
        )}

        {currentImage ? (
          <>
            {/* ภาพตัวละครขนาดใหญ่เต็มกรอบ */}
            <img
              src={currentImage}
              alt={draft.title}
              className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />

            {/* ปุ่มเลื่อนภาพบนการ์ดใหญ่ ◀ ▶ */}
            {galleryImages.length > 1 && (
              <>
                {activeImageIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex((prev) => prev - 1)}
                    title="ดูภาพก่อนหน้า"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/15 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-xl active:scale-90"
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}
                {activeImageIndex < galleryImages.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex((prev) => prev + 1)}
                    title="ดูภาพถัดไป"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/15 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-xl active:scale-90"
                  >
                    <ChevronRight size={16} />
                  </button>
                )}
              </>
            )}

            {/* ปุ่ม Action ลอยบนมุมขวาบนของการ์ด */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
              {/* ปุ่มตั้งเป็นภาพหน้าปก (แสดงเมื่อภาพปัจจุบันไม่ใช่อันดับ 0) */}
              {activeImageIndex > 0 && (
                <button
                  type="button"
                  onClick={() => handleSetCover(activeImageIndex)}
                  title="ตั้งภาพนี้เป็นรูปภาพหน้าปกหลัก"
                  className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-amber-400/50 text-amber-300 hover:bg-amber-400 hover:text-black text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-lg active:scale-95"
                >
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span>ตั้งเป็นหน้าปก</span>
                </button>
              )}

              {activeImageIndex === 0 && (
                <div className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-amber-400/40 text-amber-300 text-[10.5px] font-medium flex items-center gap-1.5 select-none shadow-md">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  <span>รูปหน้าปกหลัก</span>
                </div>
              )}

              {/* ปุ่มลบรูปภาพที่กำลังเปิดดู */}
              <button
                type="button"
                onClick={() => handleDeleteImage(activeImageIndex)}
                title="ลบรูปภาพนี้ออกจากแกลเลอรี"
                className="w-7 h-7 rounded-full bg-black/80 backdrop-blur-md border border-red-500/40 hover:border-red-500 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
              >
                <Trash2 size={12} />
              </button>
            </div>

            {/* Gradient Overlay ด้านล่างสำหรับการอ่านข้อความได้อย่างสบายตา */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-16 pb-4 px-4 flex flex-col gap-1 z-10 pointer-events-none">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full backdrop-blur-md border ${
                  draft.status === 'published'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-white/15 text-[#F2F2F5] border-white/10'
                }`}>
                  {draft.status === 'published' ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}
                </span>
                <span className="text-[11px] text-[#ACACB2] truncate">
                  {draft.worldTitle}
                </span>
              </div>

              <h2 className="text-[18px] sm:text-[20px] font-bold text-[#F2F2F5] leading-tight drop-shadow-md truncate">
                {draft.title}
              </h2>

              {draft.description && (
                <p className="text-[12px] text-[#ACACB2] line-clamp-2 leading-relaxed mt-0.5">
                  {draft.description}
                </p>
              )}
            </div>
          </>
        ) : (
          /* Empty State: กรณีเป็นดราฟต์ใหม่ที่ยังไม่มีรูปภาพ (สามารถคลิกเพื่ออัปโหลดได้เลย) */
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#121214] hover:bg-[#161619] transition-colors cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 group-hover:border-[#EF264C]/50 group-hover:bg-[#EF264C]/10 flex items-center justify-center text-[#ACACB2] group-hover:text-[#EF264C] mb-3 shadow-inner transition-all">
              <ImagePlus size={26} strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-semibold text-[#F2F2F5] mb-1 group-hover:text-[#EF264C] transition-colors">
              คลิกเพื่ออัปโหลดรูปภาพ
            </h3>
            <p className="text-xs text-[#ACACB2] max-w-[220px] leading-relaxed">
              รองรับทั้งไฟล์ PNG, JPG, WebP เลือกได้หลายภาพพร้อมกัน
            </p>
          </div>
        )}
      </div>

      {/* 3. Thumbnail Gallery Row: รูปสี่เหลี่ยมเล็กๆ วางไว้ด้านล่าง พร้อมตัวเลข 1, 2, 3, 4 และแถบ Action Bar จัดลำดับภาพ */}
      <div className="shrink-0 flex flex-col gap-2 mt-3">
        {/* Header แกลเลอรี */}
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-medium text-[#ACACB2] uppercase tracking-wider">
            จัดลำดับภาพ & หน้าปก ({galleryImages.length})
          </span>
          <span className="text-[10px] text-[#ACACB2]/70">
            รูปที่ 1 คือรูปหน้าปก
          </span>
        </div>

        {/* แถบควบคุมรูปภาพที่เลือกอยู่ในปัจจุบัน (เห็นชัดเจน 100% ไม่โดนขอบตัด) */}
        {galleryImages.length > 0 && (
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#141416] border border-white/10 text-xs shadow-md">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[11px] font-mono text-[#ACACB2] shrink-0">
                ภาพที่ <strong className="text-white font-bold">#{activeImageIndex + 1}</strong>
              </span>

              {activeImageIndex === 0 ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/15 border border-amber-400/30 text-amber-300 font-medium shrink-0 flex items-center gap-1">
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  <span>หน้าปก</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSetCover(activeImageIndex)}
                  title="ย้ายภาพนี้มาเป็นอันดับ 1 เพื่อเป็นรูปหน้าปก"
                  className="px-2 py-0.5 rounded-md bg-amber-400/15 hover:bg-amber-400 text-amber-300 hover:text-black text-[10.5px] font-medium flex items-center gap-1 transition-all cursor-pointer shrink-0 active:scale-95"
                >
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  <span>ตั้งหน้าปก</span>
                </button>
              )}
            </div>

            {/* ปุ่มจัดการ: เลื่อนซ้าย / เลื่อนขวา / ลบ */}
            <div className="flex items-center gap-1 shrink-0">
              {/* ปุ่มย้ายไปทางซ้าย ◀ */}
              <button
                type="button"
                disabled={activeImageIndex === 0}
                onClick={() => handleMoveImage(activeImageIndex, activeImageIndex - 1)}
                title="เลื่อนภาพไปข้างหน้า"
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-25 disabled:cursor-not-allowed text-[#F2F2F5] text-[11px] flex items-center gap-0.5 transition-all cursor-pointer active:scale-95"
              >
                <ChevronLeft size={13} />
                <span>เลื่อนซ้าย</span>
              </button>

              {/* ปุ่มย้ายไปทางขวา ▶ */}
              <button
                type="button"
                disabled={activeImageIndex >= galleryImages.length - 1}
                onClick={() => handleMoveImage(activeImageIndex, activeImageIndex + 1)}
                title="เลื่อนภาพไปข้างหลัง"
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-25 disabled:cursor-not-allowed text-[#F2F2F5] text-[11px] flex items-center gap-0.5 transition-all cursor-pointer active:scale-95"
              >
                <span>เลื่อนขวา</span>
                <ChevronRight size={13} />
              </button>

              <div className="w-[1px] h-3.5 bg-white/10 mx-0.5" />

              {/* ปุ่มลบรูป 🗑️ */}
              <button
                type="button"
                onClick={() => handleDeleteImage(activeImageIndex)}
                title="ลบรูปภาพนี้ออกจากแกลเลอรี"
                className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-400 hover:text-red-300 flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        )}

        {/* แถว Thumbnails รูปภาพ */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 px-0.5">
          {galleryImages.map((imgUrl, idx) => {
            const isSelected = activeImageIndex === idx;
            const isCover = idx === 0;

            return (
              <div
                key={`${draft.id}-thumb-${idx}`}
                className="relative group/thumb shrink-0"
              >
                <button
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  title={`คลิกเพื่อดูภาพที่ ${idx + 1}${isCover ? ' (หน้าปก)' : ''}`}
                  className={`
                    w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border transition-all cursor-pointer relative block shadow-xl
                    ${isSelected
                      ? 'border-[#EF264C] ring-2 ring-[#EF264C]/60 scale-105 shadow-[0_0_14px_rgba(239,38,76,0.6)]'
                      : 'border-white/30 hover:border-white/70 opacity-80 hover:opacity-100 hover:scale-105'}
                  `}
                >
                  <img
                    src={imgUrl}
                    alt={`${draft.title} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />

                  {/* ป้ายตัวเลขลำดับภาพ (1, 2, 3, 4) มุมบนซ้าย */}
                  <div className={`absolute top-0.5 left-0.5 px-1.5 py-0.2 rounded font-mono text-[9.5px] font-bold select-none border ${
                    isCover
                      ? 'bg-amber-400 text-black border-amber-300'
                      : 'bg-black/80 text-white/90 border-white/20'
                  }`}>
                    {idx + 1}
                  </div>

                  {/* ป้ายหน้าปกมุมล่าง */}
                  {isCover && (
                    <div className="absolute bottom-0 inset-x-0 bg-amber-500/95 text-black text-[8.5px] font-bold text-center py-0.2 tracking-tighter">
                      หน้าปก
                    </div>
                  )}
                </button>

                {/* ปุ่มลบรูปด่วนตรงมุมบนขวาของ Thumbnail (Hover เพื่อลบได้ทันที) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(idx);
                  }}
                  title="ลบรูปนี้"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity shadow-lg z-20 cursor-pointer active:scale-90"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            );
          })}

          {/* ปุ่มเพิ่มรูปหรือคอนเซปต์ใหม่ (+) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="เพิ่มภาพคอสตูมหรือคอนเซปต์ใหม่ (เลือกได้หลายรูป)"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-dashed border-white/30 hover:border-[#EF264C]/70 hover:bg-white/5 text-[#ACACB2] hover:text-[#F2F2F5] flex items-center justify-center shrink-0 transition-all cursor-pointer group shadow-sm active:scale-95"
          >
            <Plus
              size={18}
              className="text-[#ACACB2] group-hover:text-[#EF264C] group-hover:scale-110 transition-all"
            />
          </button>
        </div>
      </div>
    </aside>
  );
}
