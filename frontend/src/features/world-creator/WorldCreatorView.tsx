import { useState, useRef } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import CreatorSidebar from './components/CreatorSidebar';
import CharacterVisualAnchor from './components/CharacterVisualAnchor';
import TheMuseChat from './components/TheMuseChat';
import ResizableSplitter from './components/ResizableSplitter';
import InspectorPanel from './components/InspectorPanel';
import { INITIAL_VAULT_DRAFTS, INITIAL_MUSE_MESSAGES } from './mockData';
import type { CreatorMode, VaultDraft, MuseMessage } from './types';

interface WorldCreatorViewProps {
  onExit: () => void;
}

export default function WorldCreatorView({ onExit }: WorldCreatorViewProps) {
  const [activeMode, setActiveMode] = useState<CreatorMode>('world');
  const [drafts, setDrafts] = useState<VaultDraft[]>(INITIAL_VAULT_DRAFTS);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(
    INITIAL_VAULT_DRAFTS[0]?.id || null
  );

  // Sidebar Expanded State (เริ่มต้นจะขยายแถบด้านซ้ายเสมอ ทุกครั้งที่เข้าหน้านี้มา)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true);
  const sidebarContainerRef = useRef<HTMLDivElement>(null);

  // Character Visual Anchor State (คอลัมน์รูปภาพตัวละคร + รูปแบบปุ่มตัวเลือกที่ 2)
  const [visualAnchorWidth, setVisualAnchorWidth] = useState<number>(340);
  const [isVisualAnchorCollapsed, setIsVisualAnchorCollapsed] = useState<boolean>(false);

  // Inspector Panel State (ความกว้างและการเปิด/ปิด พร้อมจดจำขนาดไว้ใน localStorage)
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(() => {
    const saved = localStorage.getItem('solccai_inspector_width');
    const parsed = saved ? parseInt(saved, 10) : 460;
    return isNaN(parsed) ? 460 : parsed;
  });
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState<boolean>(false);

  // The Muse Chat Messages State
  const [messages, setMessages] = useState<MuseMessage[]>(INITIAL_MUSE_MESSAGES);

  // ดึงข้อมูล Draft ปัจจุบันที่กำลังโฟกัส
  const activeDraft = drafts.find((d) => d.id === activeDraftId) || drafts[0];

  // ปักหมุด / ยกเลิกการปักหมุด Draft
  const handleTogglePin = (id: string) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isPinned: !d.isPinned } : d))
    );
  };

  // ลบ Draft
  const handleDeleteDraft = (id: string) => {
    setDrafts((prev) => {
      const remaining = prev.filter((d) => d.id !== id);
      if (activeDraftId === id) {
        setActiveDraftId(remaining[0]?.id || null);
      }
      return remaining;
    });
  };

  // สร้าง Draft ตัวละครและโลกคู่กันใหม่
  const handleNewDraft = () => {
    const newId = `char_${Date.now()}`;
    const newTitle = 'ตัวละครใหม่ (New Character)';
    const newWorld = 'โลกใบใหม่ (New World)';
    const newDraft: VaultDraft = {
      id: newId,
      title: newTitle,
      worldTitle: newWorld,
      mode: 'character',
      createdAt: 'วันนี้',
      updatedAt: 'เมื่อสักครู่',
      description: 'ตัวละครและโลกคู่กันที่พร้อมให้คุณสร้างสรรค์ร่วมกับ The Muse',
      status: 'draft',
      isPinned: false,
      authorName: 'You',
      themeColor: '#EF264C',
    };

    setDrafts((prev) => [newDraft, ...prev]);
    setActiveDraftId(newId);

    // ส่งข้อความแนะนำจาก The Muse สำหรับงานร่างใหม่
    const welcomeNewDraft: MuseMessage = {
      id: `muse-${Date.now()}`,
      sender: 'muse',
      text: `เยี่ยมเลยครับสถาปนิก! เรามาเริ่มสร้าง **${newTitle}** และโลก **${newWorld}** กันดีกว่า 🚀\n\nอยากให้ฉากเปิดและบุคลิกของตัวละครนี้มีความขัดแย้งหรือเสน่ห์แบบไหนดีครับ?`,
      timestamp: 'ตอนนี้',
      actionSuggestions: [
        '🏙️ โลกยุคปัจจุบันที่มีความลับดำมืด',
        '🏰 มหาอาณาจักรแฟนตาซีเวทมนตร์',
        '🌌 ไซไฟอวกาศและการเอาชีวิตรอด',
      ],
    };
    setMessages((prev) => [...prev, welcomeNewDraft]);
  };

  // อัปเดตข้อมูล Draft ปัจจุบัน (แก้ไขข้อมูลแบบ Real-time จาก Inspector Panel)
  const handleUpdateDraft = (updated: Partial<VaultDraft>) => {
    if (!activeDraft?.id) return;
    setDrafts((prev) =>
      prev.map((d) =>
        d.id === activeDraft.id
          ? { ...d, ...updated, updatedAt: 'เมื่อสักครู่' }
          : d
      )
    );
  };

  // ส่งข้อความคุยกับ The Muse
  const handleSendMessage = (text: string) => {
    const userMsg: MuseMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'ตอนนี้',
    };

    setMessages((prev) => [...prev, userMsg]);

    // จำลอง The Muse วิเคราะห์และตอบกลับใน Phase 1 (เพื่อเช็กการไหลลื่นของแชท)
    setTimeout(() => {
      const botReply: MuseMessage = {
        id: `muse-${Date.now()}`,
        sender: 'muse',
        text: `รับทราบครับ! ไอเดียนี้ยอดเยี่ยมมาก ผมกำลังบันทึกโครงสร้างนี้ลงในพิมพ์เขียวฝั่งขวา... \n\nในสเต็ปถัดไป (Phase 2 & 3) การสนทนานี้จะส่งข้อมูลไปอัปเดตลงการ์ดข้อมูลแบบ Real-time ทันทีครับ ✨`,
        timestamp: 'ตอนนี้',
        actionSuggestions: [
          '✨ สกัดเป็นบีตฉากเปิด (Opening Beats)',
          '🎭 กำหนดจุดปะทะทางอารมณ์',
          '🗺️ ลงรายละเอียดสถานที่หลัก',
        ],
      };
      setMessages((prev) => [...prev, botReply]);
    }, 600);
  };

  // ปรับขนาดหน้าต่าง Inspector ฝั่งขวา พร้อมจดจำค่า
  const handleResize = (newWidth: number) => {
    setRightPanelWidth(newWidth);
    localStorage.setItem('solccai_inspector_width', newWidth.toString());
    if (isRightPanelCollapsed) {
      setIsRightPanelCollapsed(false);
    }
  };

  // รีเซ็ตขนาดหน้าต่าง Inspector กลับสู่ค่าเริ่มต้น (460px)
  const handleResetWidth = () => {
    setRightPanelWidth(460);
    localStorage.setItem('solccai_inspector_width', '460');
    setIsRightPanelCollapsed(false);
  };

  return (
    <div className="h-screen w-full bg-[#090909] text-[#F2F2F5] font-sans flex relative overflow-hidden select-none">
      {/* 1. Left Sidebar: The Vault (Characters + Paired Worlds) */}
      <div ref={sidebarContainerRef} className="shrink-0 flex relative z-20">
        <CreatorSidebar
          isSidebarExpanded={isSidebarExpanded}
          setIsSidebarExpanded={setIsSidebarExpanded}
          drafts={drafts}
          activeDraftId={activeDraftId}
          onSelectDraft={(id) => setActiveDraftId(id)}
          onNewDraft={handleNewDraft}
          onTogglePin={handleTogglePin}
          onDeleteDraft={handleDeleteDraft}
          onExit={onExit}
        />

        {/* Option 2: Reopen Character Visual Anchor Button when collapsed */}
        {isVisualAnchorCollapsed && (
          <button
            type="button"
            onClick={() => setIsVisualAnchorCollapsed(false)}
            title="แสดงภาพตัวละคร (Image)"
            className="absolute -right-4 top-[104px] z-30 w-8 h-8 rounded-full bg-[#141416]/95 backdrop-blur-xl border border-white/[0.12] hover:border-[#EF264C]/70 hover:bg-[#1D1D22] text-[#ACACB2] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 group"
          >
            <ImageIcon
              size={15}
              strokeWidth={2}
              className="group-hover:text-[#EF264C] transition-colors"
            />
          </button>
        )}
      </div>

      {/* 2. Character Visual Anchor (คอลัมน์รูปภาพตัวละครและแกลเลอรีชุด/คอนเซปต์) */}
      {!isVisualAnchorCollapsed && (
        <CharacterVisualAnchor
          key={activeDraft?.id}
          draft={activeDraft}
          width={visualAnchorWidth}
        />
      )}

      {/* 3. Left Resizable Splitter (ระหว่าง Visual Anchor กับ The Muse Chat พร้อมปุ่มพับเก็บ Option 2) */}
      {!isVisualAnchorCollapsed && (
        <ResizableSplitter
          side="left"
          getLeftOffset={() =>
            sidebarContainerRef.current?.getBoundingClientRect().right ??
            (isSidebarExpanded ? 280 : 70)
          }
          onResize={(newWidth) => setVisualAnchorWidth(newWidth)}
          onReset={() => setVisualAnchorWidth(340)}
          onCollapse={() => setIsVisualAnchorCollapsed(true)}
          minWidth={260}
          maxWidth={540}
          collapseThreshold={160}
        >
          {/* Option 2: ปุ่มซ่อนภาพตัวละคร ลอยเด่นบนเส้นคั่นแยกรูปทรงและไอคอนเฉพาะ */}
          <button
            type="button"
            onClick={() => setIsVisualAnchorCollapsed(true)}
            title="ซ่อนภาพตัวละคร (Image)"
            className="w-8 h-8 rounded-full bg-[#141416]/95 backdrop-blur-xl border border-white/[0.12] hover:border-[#EF264C]/70 hover:bg-[#1D1D22] text-[#ACACB2] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 group"
          >
            <ImageIcon
              size={15}
              strokeWidth={2}
              className="group-hover:text-[#EF264C] transition-colors"
            />
          </button>
        </ResizableSplitter>
      )}

      {/* 4. Center Panel: The Muse AI Architect Chat */}
      <TheMuseChat
        messages={messages}
        onSendMessage={handleSendMessage}
        onSelectSuggestion={handleSendMessage}
        isRightPanelCollapsed={isRightPanelCollapsed}
        onToggleRightPanel={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
        activeMode={activeMode}
        activeDraftTitle={activeDraft?.title}
      />

      {/* 5. Right Resizable Splitter (ลากเมาส์เพื่อยืด/หดพื้นที่ฝั่งขวา) */}
      {!isRightPanelCollapsed && (
        <ResizableSplitter
          side="right"
          onResize={handleResize}
          onReset={handleResetWidth}
          onCollapse={() => setIsRightPanelCollapsed(true)}
          minWidth={320}
          maxWidth={750}
        />
      )}

      {/* 6. Right Panel: Dynamic Inspector & Cards (เปิด/ปิดได้) */}
      <InspectorPanel
        width={rightPanelWidth}
        onWidthChange={handleResize}
        isCollapsed={isRightPanelCollapsed}
        onCollapse={() => setIsRightPanelCollapsed(true)}
        activeMode={activeMode}
        onModeChange={setActiveMode}
        activeDraftTitle={activeDraft?.title}
        activeWorldTitle={activeDraft?.worldTitle}
        draft={activeDraft}
        onUpdateDraft={handleUpdateDraft}
      />
    </div>
  );
}
