import { useState } from 'react';
import { Image as ImageIcon, Plus, ImagePlus, Maximize2 } from 'lucide-react';
import type { VaultDraft } from '../types';

interface CharacterVisualAnchorProps {
  draft: VaultDraft;
  width: number;
}

export default function CharacterVisualAnchor({
  draft,
  width,
}: CharacterVisualAnchorProps) {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // ดึงชุดรูปภาพทั้งหมดของตัวละครใน Draft นั้น
  const galleryImages: string[] =
    draft.images && draft.images.length > 0
      ? draft.images
      : draft.image
      ? [draft.image]
      : [];

  const currentImage = galleryImages[activeImageIndex] || draft.image || '';

  return (
    <aside
      style={{ width: `${width}px` }}
      className="h-full shrink-0 flex flex-col bg-[#090909] p-3.5 sm:p-4 z-20 select-none overflow-hidden transition-[width] duration-75 ease-out"
    >
      {/* 1. Header Bar: ป้ายกำกับ Image พร้อมไอคอนรูปภาพ และตัวนับจำนวนภาพ */}
      <div className="flex items-center justify-between shrink-0 mb-2.5 px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#EF264C]/10 border border-[#EF264C]/25 flex items-center justify-center shrink-0">
            <ImageIcon size={13} className="text-[#EF264C]" />
          </div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#ACACB2]">
            Image
          </span>
        </div>

        {galleryImages.length > 0 && (
          <div className="text-[10.5px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[#F2F2F5]">
            {activeImageIndex + 1} / {galleryImages.length}
          </div>
        )}
      </div>

      {/* 2. Main Character Card: การ์ดสี่เหลี่ยมขอบมนขนาดใหญ่ สไตล์ Twitter / CharacterDetailModal */}
      <div className="flex-1 min-h-0 relative rounded-2xl sm:rounded-3xl border border-white/10 bg-[#121214] shadow-2xl overflow-hidden group flex flex-col justify-end">
        {currentImage ? (
          <>
            {/* ภาพตัวละครขนาดใหญ่เต็มกรอบ */}
            <img
              src={currentImage}
              alt={draft.title}
              className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />

            {/* Subtle Zoom Hint on Hover */}
            <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10.5px] text-[#ACACB2] flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 size={11} />
              <span>ภาพหลัก</span>
            </div>

            {/* Gradient Overlay ด้านล่างสำหรับการอ่านข้อความได้อย่างสบายตา */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-16 pb-4 px-4 flex flex-col gap-1 z-10 pointer-events-none">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[#F2F2F5] border border-white/10">
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
          /* Empty State: กรณีเป็นดราฟต์ใหม่ที่ยังไม่มีรูปภาพ */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#121214]">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ACACB2] mb-3 shadow-inner">
              <ImagePlus size={26} strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-semibold text-[#F2F2F5] mb-1">
              ยังไม่มีภาพตัวละคร
            </h3>
            <p className="text-xs text-[#ACACB2] max-w-[220px] leading-relaxed">
              อัปโหลดภาพ หรือบอก The Muse เพื่อช่วยร่างคอนเซปต์ภาพสำหรับตัวละครนี้
            </p>
          </div>
        )}
      </div>

      {/* 3. Thumbnail Gallery Row: รูปสี่เหลี่ยมเล็กๆ วางไว้ด้านล่างรูปใหญ่ตามที่กำหนด */}
      <div className="shrink-0 flex flex-col gap-1.5 mt-3">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-medium text-[#ACACB2] uppercase tracking-wider">
            คอนเซปต์ & คอสตูม ({galleryImages.length})
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1.5 px-0.5">
          {galleryImages.map((imgUrl, idx) => {
            const isSelected = activeImageIndex === idx;
            return (
              <button
                key={`${draft.id}-thumb-${idx}`}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                title={`คลิกเพื่อสลับภาพที่ ${idx + 1}`}
                className={`
                  w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border transition-all cursor-pointer relative flex-shrink-0 shadow-xl
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
              </button>
            );
          })}

          {/* ปุ่มเพิ่มรูปหรือคอนเซปต์ใหม่ (+) */}
          <button
            type="button"
            title="เพิ่มภาพคอสตูมหรือคอนเซปต์ใหม่"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border border-dashed border-white/30 hover:border-[#EF264C]/70 hover:bg-white/5 text-[#ACACB2] hover:text-[#F2F2F5] flex items-center justify-center shrink-0 transition-all cursor-pointer group shadow-sm active:scale-95"
          >
            <Plus
              size={16}
              className="text-[#ACACB2] group-hover:text-[#EF264C] group-hover:scale-110 transition-all"
            />
          </button>
        </div>
      </div>
    </aside>
  );
}
