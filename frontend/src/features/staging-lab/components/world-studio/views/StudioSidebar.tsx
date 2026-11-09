import React from 'react'
import {
  ArrowLeft,
  PanelLeft,
  Plus,
  Globe,
  Trash2,
  FileText,
  MapPin,
  Archive,
  Compass,
  BookOpen,
} from 'lucide-react'
import type { WorldWorkspace } from '../../../types'
import type { StudioActiveView } from '../types'

interface StudioSidebarProps {
  isSidebarOpen: boolean
  onCloseSidebar: () => void
  onBackToHome: () => void
  onEnterStage: () => void
  onOpenWelcome: () => void
  worlds: WorldWorkspace[]
  activeWorldId: string
  activeView: StudioActiveView
  savedCabinetCardsCount: number
  onAddNewWorld: () => void
  onSwitchWorld: (worldId: string) => void
  onDeleteWorld: (worldId: string) => void
  onSelectDashboard: () => void
  onSelectMaster: () => void
  onAddNewNote: () => void
  onSelectNote: (noteId: string) => void
  onDeleteNote: (noteId: string) => void
  onAddNewStageCell: () => void
  onSelectStageCell: (cellId: string) => void
  onDeleteStageCell: (cellId: string) => void
  onSelectCabinet: () => void
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  isSidebarOpen,
  onCloseSidebar,
  onBackToHome,
  onEnterStage,
  onOpenWelcome,
  worlds,
  activeWorldId,
  activeView,
  savedCabinetCardsCount,
  onAddNewWorld,
  onSwitchWorld,
  onDeleteWorld,
  onSelectDashboard,
  onSelectMaster,
  onAddNewNote,
  onSelectNote,
  onDeleteNote,
  onAddNewStageCell,
  onSelectStageCell,
  onDeleteStageCell,
  onSelectCabinet,
}) => {
  const activeWorld = worlds.find(w => w.id === activeWorldId) || worlds[0]

  return (
    <aside
      className={`h-full border-r border-white/[0.06] flex flex-col bg-[#111113] shrink-0 z-20 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'w-[260px]' : 'w-0 -translate-x-full border-r-0 overflow-hidden'
      }`}
    >
      {/* Sidebar Header: Unified Back, Minimal [ ตัวละคร | โลก ] Switcher, and Collapse Button */}
      <div className="h-12 px-3.5 border-b border-white/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToHome}
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer active:scale-95"
            title="กลับสู่หน้าหลัก"
          >
            <ArrowLeft size={14} />
          </button>

          {/* Minimal Unified Mode Switcher: [ ตัวละคร | โลก ] */}
          <div className="h-7 p-0.5 rounded-full bg-white/[0.04] border border-white/10 flex items-center gap-0.5 text-[11.5px] font-sans select-none">
            <button
              type="button"
              onClick={onEnterStage}
              className="h-full px-2.5 rounded-full transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 font-medium text-white/45 hover:text-white/85 hover:bg-white/[0.04]"
              title="สลับไปหน้าตัวละครและหน้าต่างแชทหลัก"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
              <span>ตัวละคร</span>
            </button>
            <button
              type="button"
              onClick={onOpenWelcome}
              className="h-full px-2.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 font-medium bg-white/[0.10] text-[#F1F1F1] shadow-sm"
              title="เข้าสู่หน้าต้อนรับ (Welcome Screen)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF264C]" />
              <span>โลก</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onCloseSidebar}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
          title="พับเก็บแถบข้าง"
        >
          <PanelLeft size={14} />
        </button>
      </div>

      {/* Master Tree Items List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 no-scrollbar">
        {/* หมวดที่ 1: โลก */}
        <div className="space-y-1">
          <div className="px-2 py-1 text-[11px] font-medium text-[#71767B] tracking-wide flex items-center justify-between">
            <span>โลก</span>
            <button
              type="button"
              onClick={onAddNewWorld}
              className="text-white/30 hover:text-white p-0.5 rounded hover:bg-white/[0.06] transition-all cursor-pointer"
              title="เพิ่มโลกใหม่"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Worlds List (Clean Standard Notion/Apple Hierarchy) */}
          <div className="space-y-0.5">
            {worlds.map((w) => {
              const isCurrent = w.id === activeWorld?.id
              const hasSpark = Boolean(w.sparkText && w.sparkText.trim())
              return (
                <div
                  key={w.id}
                  onClick={() => {
                    onSwitchWorld(w.id)
                  }}
                  className={`px-2.5 py-2 rounded-lg text-left text-[13.5px] transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                    isCurrent && activeView.type !== 'welcome'
                      ? 'bg-white/[0.08] text-[#F1F1F1] font-medium'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                    <Globe size={14} className="shrink-0 text-inherit opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span className="truncate">{w.title}</span>
                  </div>

                  {!hasSpark ? (
                    <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-rose-500/15 text-rose-300 border border-rose-500/25 shrink-0">
                      ยังไม่มี spark
                    </span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="มีชนวนเหตุแล้ว" />
                  )}

                  {worlds.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteWorld(w.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded transition-opacity"
                      title="ลบโลกนี้"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Active World Sub-Navigation (Dashboard & Master Story) */}
          {activeWorld && activeView.type !== 'welcome' && (
            <div className="pt-1 pl-2.5 space-y-0.5 border-l border-white/[0.08] ml-2">
              <button
                type="button"
                onClick={onSelectDashboard}
                className={`w-full px-2 py-1.5 rounded-lg text-left text-[12.5px] transition-all cursor-pointer flex items-center justify-between group ${
                  activeView.type === 'dashboard'
                    ? 'bg-white/[0.08] text-[#F1F1F1] font-medium'
                    : 'text-white/55 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Compass size={13} className="shrink-0 text-[#EF264C]" />
                  <span className="truncate">ภาพรวม & ตัวละคร</span>
                </div>
                {activeWorld.characters && activeWorld.characters.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono bg-[#EF264C]/15 text-[#EF264C]">
                    {activeWorld.characters.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={onSelectMaster}
                className={`w-full px-2 py-1.5 rounded-lg text-left text-[12.5px] transition-all cursor-pointer flex items-center gap-2 group ${
                  activeView.type === 'master'
                    ? 'bg-white/[0.08] text-[#F1F1F1] font-medium'
                    : 'text-white/55 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <BookOpen size={13} className="shrink-0 text-white/50 group-hover:text-white/80" />
                <span className="truncate">เนื้อหาโลก & สปาร์ค</span>
              </button>
            </div>
          )}
        </div>

        {/* หมวดที่ 2: ส่วนขยาย */}
        <div className="space-y-1">
          <div className="px-2 py-1 text-[11px] font-medium text-[#71767B] tracking-wide flex items-center justify-between">
            <span>ส่วนขยาย</span>
            <button
              type="button"
              onClick={onAddNewNote}
              className="text-white/30 hover:text-white p-0.5 rounded hover:bg-white/[0.06] transition-all cursor-pointer"
              title="เพิ่มโน้ตส่วนขยายใหม่"
            >
              <Plus size={13} />
            </button>
          </div>

          {!activeWorld || activeWorld.notes.length === 0 ? (
            <div className="px-2 py-1 text-[11px] text-white/30 italic">
              ยังไม่มีส่วนขยาย
            </div>
          ) : (
            activeWorld.notes.map(note => {
              const isActive = activeView.type === 'note' && activeView.noteId === note.id
              return (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note.id)}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[13px] transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                    isActive
                      ? 'bg-white/[0.08] text-[#F1F1F1] font-medium'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                    <FileText size={14} className="shrink-0 text-inherit opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span className="truncate">{note.title || 'ไม่มีชื่อ'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteNote(note.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded transition-opacity shrink-0"
                    title="ลบโน้ตนี้"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* หมวดที่ 3: สถานที่ */}
        <div className="space-y-1">
          <div className="px-2 py-1 text-[11px] font-medium text-[#71767B] tracking-wide flex items-center justify-between">
            <span>สถานที่</span>
            <button
              type="button"
              onClick={onAddNewStageCell}
              className="text-white/30 hover:text-white p-0.5 rounded hover:bg-white/[0.06] transition-all cursor-pointer"
              title="เพิ่มสถานที่ใหม่"
            >
              <Plus size={13} />
            </button>
          </div>

          {!activeWorld || activeWorld.stageCells.length === 0 ? (
            <div className="px-2 py-1 text-[11px] text-white/30 italic">
              ยังไม่มีสถานที่
            </div>
          ) : (
            activeWorld.stageCells.map(cell => {
              const isActive = activeView.type === 'cell' && activeView.cellId === cell.id
              return (
                <div
                  key={cell.id}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[13px] transition-all flex items-center justify-between gap-2 group ${
                    isActive
                      ? 'bg-white/[0.08] text-[#F1F1F1] font-medium'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectStageCell(cell.id)}
                    className="flex items-center gap-2 truncate flex-1 min-w-0 text-left cursor-pointer bg-transparent border-none p-0 outline-none text-inherit"
                  >
                    <MapPin size={14} className="shrink-0 text-inherit opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span className="truncate">{cell.title || 'สถานที่ใหม่'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteStageCell(cell.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-rose-400 p-0.5 rounded hover:bg-white/[0.06] transition-all cursor-pointer shrink-0"
                    title="ลบสถานที่นี้"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* หมวดที่ 4: ตู้ลิ้นชัก */}
        <div className="space-y-1 pt-2 border-t border-white/[0.05]">
          <button
            type="button"
            onClick={onSelectCabinet}
            className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[13px] transition-all cursor-pointer flex items-center justify-between group ${
              activeView.type === 'cabinet'
                ? 'bg-white/[0.08] text-[#F1F1F1] font-medium'
                : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Archive size={14} className="shrink-0 text-inherit opacity-70 group-hover:opacity-100 transition-opacity" />
              <span>ตู้ลิ้นชัก</span>
            </div>
            <span className="text-[10px] font-mono text-white/40">
              {savedCabinetCardsCount}
            </span>
          </button>
        </div>
      </div>
    </aside>
  )
}
