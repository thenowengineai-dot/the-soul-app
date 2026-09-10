import { useState, useRef, useEffect } from 'react';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  Vault, 
  Globe, 
  LogOut, 
  Plus, 
  CheckCircle2, 
  MoreVertical, 
  Pin, 
  Trash2,
  Rocket,
  FileEdit
} from 'lucide-react';
import type { VaultDraft } from '../types';

interface CreatorSidebarProps {
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (expanded: boolean) => void;
  drafts: VaultDraft[];
  activeDraftId: string | null;
  onSelectDraft: (id: string) => void;
  onNewDraft: () => void;
  onTogglePin: (id: string) => void;
  onDeleteDraft: (id: string) => void;
  onExit: () => void;
  onTogglePublish?: (id: string, currentStatus: 'draft' | 'published') => void;
}

export default function CreatorSidebar({
  isSidebarExpanded,
  setIsSidebarExpanded,
  drafts,
  activeDraftId,
  onSelectDraft,
  onNewDraft,
  onTogglePin,
  onDeleteDraft,
  onExit,
  onTogglePublish,
}: CreatorSidebarProps) {
  // สถานะเปิด/ปิดเมนู Dropdown ของแต่ละรายการ (เก็บ id ของ draft)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // ปิด Dropdown เมื่อคลิกที่พื้นที่อื่น
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  // เรียงลำดับ drafts: ปักหมุด (Pinned) จะอยู่บนสุดเสมอ
  const sortedDrafts = [...drafts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <div
      className={`
        ${isSidebarExpanded ? 'w-[280px] px-3.5' : 'w-[70px] px-3'} 
        h-screen pt-3.5 sm:pt-4 
        flex-shrink-0 border-r border-app-border flex flex-col pb-3 bg-app-bg/50 backdrop-blur-xl relative transition-all duration-300 ease-in-out z-20 select-none overscroll-none touch-pan-y
      `}
    >
      {/* 1. ปุ่มเปิด/ปิดแถบ The Vault ซ้ายมือ (สไตล์เดียวกับปุ่มเปิดปิดแถบขวา) */}
      <button
        type="button"
        onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
        title={isSidebarExpanded ? 'ย่อแถบ The Vault' : 'ขยายแถบ The Vault'}
        className="absolute -right-4 top-[48px] sm:top-[50px] z-30 w-8 h-8 rounded-full bg-[#121212]/85 backdrop-blur-xl border border-white/[0.08] hover:border-white/25 hover:bg-white/10 text-app-secondary hover:text-app-primary flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 select-none"
      >
        {isSidebarExpanded ? (
          <PanelLeftClose size={16} strokeWidth={1.8} />
        ) : (
          <PanelLeftOpen size={16} strokeWidth={1.8} />
        )}
      </button>

      {/* 2. โลโก้หลัก Maomoi Ai ด้านบน (ขนาดเท่าหน้าแรกเป๊ะๆ คลิกเพื่อกลับหน้าหลัก) */}
      <div
        onClick={onExit}
        title="Maomoi Ai - คลิกเพื่อกลับสู่หน้าหลัก"
        className={`flex items-center ${
          isSidebarExpanded ? 'px-1 mb-3 gap-2.5' : 'justify-center mb-3'
        } h-[40px] sm:h-[42px] cursor-pointer group select-none`}
      >
        <div className="w-[40px] h-[40px] sm:w-[42px] sm:h-[42px] flex items-center justify-center rounded-xl group-hover:bg-white/[0.06] transition-all flex-shrink-0">
          <img
            src="/logo/logo.png"
            alt="Maomoi Ai Logo"
            className="w-[34px] h-[34px] sm:w-[36px] sm:h-[36px] object-contain drop-shadow-[0_2px_10px_rgba(236,72,153,0.35)] group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        {isSidebarExpanded && (
          <div className="flex items-center overflow-hidden transition-all duration-200">
            <img
              src="/logo/maomoi_ai_white.png"
              alt="Maomoi Ai"
              className="h-[20px] w-auto object-contain flex-shrink-0"
            />
          </div>
        )}
      </div>

      {/* 3. The Vault: ศูนย์กลางหลักของ Sidebar (Character + Paired World) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col min-h-0 py-1 overscroll-contain touch-pan-y">
        {isSidebarExpanded ? (
          /* ================= EXPANDED VIEW ================= */
          <div className="flex flex-col gap-2 w-full">
            {/* The Vault Header Bar */}
            <div className="px-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center shrink-0 shadow-sm">
                  <Vault size={20} strokeWidth={2} className="text-app-primary" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold tracking-wider uppercase text-app-primary">
                    The Vault
                  </span>
                  <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-white/10 text-app-primary font-mono border border-white/10">
                    {drafts.length}
                  </span>
                </div>
              </div>

              {/* ปุ่มสร้างใหม่ (+ สร้างใหม่) */}
              <button
                type="button"
                onClick={onNewDraft}
                title="สร้างตัวละครและโลกคู่กันใหม่"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 text-app-primary text-[11px] font-medium transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Plus size={13} strokeWidth={2.2} className="text-app-primary" />
                <span>สร้างใหม่</span>
              </button>
            </div>

            {/* เส้นคั่นบาง */}
            <div className="w-full h-[1px] bg-app-border my-1 shrink-0" />

            {/* รายการตัวละครและโลกคู่กัน (Character + Paired World Items) */}
            <div className="flex flex-col gap-1.5 w-full">
              {sortedDrafts.map((draft) => {
                const isActive = activeDraftId === draft.id;
                const isMenuOpen = openMenuId === draft.id;

                return (
                  <div
                    key={draft.id}
                    onClick={() => onSelectDraft(draft.id)}
                    className={`group relative w-full rounded-xl transition-all cursor-pointer p-2.5 flex flex-col gap-1 border ${
                      isActive
                        ? 'bg-white/15 border-white/20 text-white shadow-md'
                        : 'bg-transparent border-transparent hover:bg-white/[0.08] text-app-secondary hover:text-app-primary'
                    }`}
                  >
                    {/* แถวที่ 1: ชื่อตัวละคร + หมุด (ถ้ามี) + ปุ่มสามจุด */}
                    <div className="flex items-center justify-between gap-1.5 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        {draft.isPinned && (
                          <Pin size={11} className="text-amber-400 fill-amber-400 shrink-0 -rotate-45" />
                        )}
                        <span className={`text-[13px] truncate leading-tight ${isActive ? 'font-semibold text-white' : 'font-medium text-app-primary'}`}>
                          {draft.title}
                        </span>
                        {(draft.isExample || draft.id === 'demo_mahiro_showcase') && (
                          <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-[#EF264C]/15 border border-[#EF264C]/30 text-[#EF264C]">
                            ตัวอย่าง
                          </span>
                        )}
                      </div>

                      {/* ปุ่มสามจุดจุดไข่ปลา (More Actions) */}
                      <div 
                        className="relative shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenMenuId(isMenuOpen ? null : draft.id)}
                          title="ตัวเลือก"
                          className="w-5 h-5 rounded flex items-center justify-center text-app-secondary hover:text-app-primary hover:bg-white/15 transition-all cursor-pointer"
                        >
                          <MoreVertical size={13} />
                        </button>

                        {/* Dropdown Menu (Glassmorphism Popover) */}
                        {isMenuOpen && (
                          <div
                            ref={dropdownRef}
                            className="absolute right-0 top-6 w-[165px] py-1 px-1 rounded-xl bg-[#161618]/95 backdrop-blur-2xl border border-white/15 shadow-2xl z-50 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100"
                          >
                            {/* ปักหมุด / เลิกปักหมุด */}
                            <button
                              type="button"
                              onClick={() => {
                                onTogglePin(draft.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-app-primary hover:bg-white/10 rounded-lg transition-colors text-left cursor-pointer"
                            >
                              <Pin size={13} className={draft.isPinned ? "text-amber-400 fill-amber-400" : ""} />
                              <span>{draft.isPinned ? 'ยกเลิกการปักหมุด' : 'ปักหมุดด้านบน'}</span>
                            </button>

                            {/* สลับสถานะ Publish / Draft */}
                            {onTogglePublish && (
                              <button
                                type="button"
                                onClick={() => {
                                  onTogglePublish(draft.id, draft.status);
                                  setOpenMenuId(null);
                                }}
                                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left cursor-pointer ${
                                  draft.status === 'published'
                                    ? 'text-amber-300 hover:bg-amber-500/15'
                                    : 'text-emerald-400 hover:bg-emerald-500/15 font-medium'
                                }`}
                              >
                                {draft.status === 'published' ? (
                                  <>
                                    <FileEdit size={13} className="text-amber-400 shrink-0" />
                                    <span>เก็บเป็นฉบับร่าง</span>
                                  </>
                                ) : (
                                  <>
                                    <Rocket size={13} className="text-emerald-400 shrink-0" />
                                    <span>เผยแพร่ตัวละคร</span>
                                  </>
                                )}
                              </button>
                            )}

                            {/* ลบตัวละคร (ซ่อนสำหรับตัวอย่าง Showcase เพื่อป้องกันการลบโดยไม่ตั้งใจ) */}
                            {!(draft.isExample || draft.id === 'demo_mahiro_showcase') && (
                              <>
                                <div className="w-full h-[1px] bg-white/10 my-0.5" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteDraft(draft.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/15 rounded-lg transition-colors text-left cursor-pointer"
                                >
                                  <Trash2 size={13} className="text-red-400" />
                                  <span>ลบตัวละคร</span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* แถวที่ 2: ไฟล์โลกที่คู่กัน (Paired World Name) */}
                    <div className="flex items-center gap-1.5 text-[11px] text-app-secondary/90 truncate">
                      <Globe size={11} className="shrink-0 text-app-secondary/70" />
                      <span className="truncate">
                        {draft.worldTitle || 'โลกเริ่มต้น'}
                      </span>
                    </div>

                    {/* แถวที่ 3: วันที่สร้าง / เวลาอัปเดต และสถานะ */}
                    <div className="flex items-center justify-between text-[10px] text-app-secondary/60 font-mono pt-0.5">
                      <span>{draft.createdAt ? `สร้าง ${draft.createdAt}` : draft.updatedAt}</span>
                      {draft.status === 'published' ? (
                        <span className="inline-flex items-center gap-0.5 text-emerald-400 font-sans" title="Published">
                          <CheckCircle2 size={10} />
                          <span>เผยแพร่</span>
                        </span>
                      ) : (
                        <span className="text-app-secondary/50 font-sans">ร่าง</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ================= COLLAPSED VIEW ================= */
          <div className="flex flex-col items-center justify-start w-full">
            {/* The Vault Main Icon Button (ไร้กรอบ, hover เหมือนหน้าแรก, พร้อมปุ่มแจ้งเตือนจำนวน) */}
            <button
              type="button"
              onClick={() => setIsSidebarExpanded(true)}
              title={`The Vault (${drafts.length} ตัวละคร)`}
              className="w-[44px] h-[44px] flex items-center justify-center rounded-xl cursor-pointer transition-all duration-150 text-app-primary hover:bg-white/10 active:scale-95 relative"
            >
              <Vault size={24} strokeWidth={2} className="text-app-primary" />
              <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#EF264C] text-white text-[9px] font-bold flex items-center justify-center shadow-sm pointer-events-none">
                {drafts.length}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 4. ปุ่มออกจากส่วนสร้างโลกไปหน้าหลัก (Bottom Exit Action) - สไตล์เดียวกับ Settings ใน Sidebar.tsx */}
      <div className="mt-auto pt-2 border-t border-app-border w-full flex flex-col gap-1.5">
        {isSidebarExpanded ? (
          <button
            type="button"
            onClick={onExit}
            title="ออกจากโหมดสร้าง กลับสู่หน้าหลัก"
            className="w-full h-[40px] flex items-center gap-3 px-2.5 rounded-xl cursor-pointer transition-all duration-150 text-left text-app-secondary hover:text-app-primary hover:bg-white/5 group"
          >
            <LogOut
              size={18}
              strokeWidth={2.2}
              className="flex-shrink-0 text-app-secondary group-hover:text-app-primary group-hover:-translate-x-0.5 transition-all"
            />
            <span className="text-[13px] truncate leading-tight">
              ออกจากโหมดสร้าง
            </span>
          </button>
        ) : (
          <div className="relative flex items-center justify-center w-full">
            <button
              type="button"
              title="ออกจากโหมดสร้าง"
              onClick={onExit}
              className="w-[44px] h-[40px] flex items-center justify-center rounded-xl cursor-pointer transition-all duration-150 text-app-secondary hover:text-app-primary hover:bg-white/5 group"
            >
              <LogOut
                size={18}
                strokeWidth={2.2}
                className="flex-shrink-0 text-app-secondary group-hover:text-app-primary group-hover:-translate-x-0.5 transition-all"
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

