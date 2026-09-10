import { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  PanelRightOpen,
  ChevronDown,
  ChevronUp,
  Plus,
  Mic,
} from 'lucide-react';
import type { CreatorMode, MuseMessage } from '../types';

interface TheMuseChatProps {
  messages: MuseMessage[];
  onSendMessage: (text: string) => void;
  onSelectSuggestion: (text: string) => void;
  isRightPanelCollapsed: boolean;
  onToggleRightPanel: () => void;
  activeMode: CreatorMode;
  activeDraftTitle?: string;
}

export default function TheMuseChat({
  messages,
  onSendMessage,
  onSelectSuggestion,
  isRightPanelCollapsed,
  onToggleRightPanel,
  activeMode,
}: TheMuseChatProps) {
  const [inputText, setInputText] = useState('');
  // บันทึกสถานะการยืด-หดของแต่ละข้อความผู้ใช้
  const [expandedUserMessages, setExpandedUserMessages] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // เลื่อนลงล่างสุดอัตโนมัติเมื่อมีข้อความใหม่
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ปรับความสูงของ Textarea อัตโนมัติตามเนื้อหาที่พิมพ์จริง (กล่องยืดขยายได้ตามบรรทัดที่พิมพ์)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
    }
  }, [inputText]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleExpand = (msgId: string) => {
    setExpandedUserMessages((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#090909] relative overflow-hidden">
      {/* ปุ่มเปิดพาเนลขวา (ลอยมุมขวาบนเมื่อพาเนลขวาพับเก็บ ไร้แถบหัวข้อและไร้เส้นคั่นตามที่สั่ง) */}
      {isRightPanelCollapsed && (
        <button
          type="button"
          onClick={onToggleRightPanel}
          title="เปิดหน้าต่างการ์ดข้อมูล (Inspector)"
          className="absolute top-3.5 right-4 z-30 w-8 h-8 rounded-full bg-[#121212]/65 backdrop-blur-xl border border-white/[0.07] hover:border-white/20 hover:bg-white/10 text-app-secondary hover:text-app-primary flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 select-none"
        >
          <PanelRightOpen size={16} strokeWidth={1.8} />
        </button>
      )}

      {/* 2. Central Conversation Stream: คอลัมน์เดียวตรงกลาง ไม่แบ่งซ้ายขวา */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-44 overscroll-contain touch-pan-y no-scrollbar">
        <div className="max-w-[720px] w-full mx-auto flex flex-col gap-6">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            // 👤 ข้อความฝั่งผู้ใช้ (สไตล์ Gemini Web: ชิดขวา, กล่องสีเทาหลัก #1D1D1F ขอบ #2F3336, ฟอนต์ 16px #F2F2F5)
            if (isUser) {
              const isExpanded = expandedUserMessages[msg.id] ?? false;
              const isLongText = msg.text.length > 110 || msg.text.includes('\n');

              return (
                <div key={msg.id} className="w-full flex justify-end">
                  <div
                    onClick={() => isLongText && toggleExpand(msg.id)}
                    className={`max-w-[85%] sm:max-w-[78%] px-5 py-3.5 sm:px-6 sm:py-4 rounded-[24px] bg-[#1D1D1F] border border-[#2F3336] shadow-sm transition-all text-[#F2F2F5] select-text relative ${
                      isLongText ? 'cursor-pointer hover:border-white/30' : ''
                    }`}
                  >
                    {/* เนื้อหาข้อความผู้ใช้ ฟอนต์ขนาด 16px สไตล์เรา */}
                    <div
                      className={`text-[16px] leading-[1.65] whitespace-pre-wrap break-words text-[#F2F2F5] ${
                        !isExpanded && isLongText ? 'line-clamp-4 pr-8' : isLongText ? 'pr-8' : ''
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* ปุ่มลูกศรชี้ลง (ขยาย) / ชี้ขึ้น (ย่อ) อยู่ระนาบเดียวกับบรรทัดล่างสุด (ไร้พื้นหลัง กลืนกับกล่อง เมื่อ hover จะมีเส้นชัดขึ้น) */}
                    {isLongText && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(msg.id);
                        }}
                        title={isExpanded ? 'ย่อข้อความ' : 'ขยายข้อความ'}
                        className="absolute bottom-3 right-3 sm:bottom-3.5 sm:right-4 w-7 h-7 rounded-full bg-transparent hover:bg-white/[0.08] border border-transparent hover:border-white/30 text-[#ACACB2] hover:text-[#F2F2F5] flex items-center justify-center transition-all cursor-pointer active:scale-90 select-none"
                      >
                        {isExpanded ? (
                          <ChevronUp size={15} strokeWidth={2} />
                        ) : (
                          <ChevronDown size={15} strokeWidth={2} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            // 🏛️ ข้อความ The Muse: เนื้อหาหลักทอดตัวลงมาตรงๆ ฟอนต์ขนาด 16px ไร้ไอคอนบ็อต
            return (
              <div key={msg.id} className="w-full flex flex-col gap-4 py-1 select-text">
                {/* ข้อความและมาร์กดาวน์ของ AI ฟอนต์ 16px อ่านสบายตา สี #F2F2F5 */}
                <div className="text-[16px] leading-[1.75] text-[#F2F2F5] whitespace-pre-wrap break-words font-normal">
                  {msg.text}
                </div>

                {/* Suggestion Action Pills (สไตล์แคปซูลเดียวกับ Hashtags ในหน้ารายละเอียดตัวละคร) */}
                {msg.actionSuggestions && msg.actionSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {msg.actionSuggestions.map((sugg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onSelectSuggestion(sugg)}
                        className="px-3.5 py-1.5 rounded-full text-[12.5px] font-normal bg-[#18181b] hover:bg-white/[0.08] border border-[#2F3336] hover:border-[#EF264C]/60 text-[#ACACB2] hover:text-[#EF264C] transition-all cursor-pointer select-none active:scale-95"
                      >
                        {sugg}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. Floating Composer Bar (ความกว้าง 720px พอดีสายตา) */}
      <div className="absolute bottom-0 left-0 right-0 pt-8 pb-4 px-4 bg-gradient-to-t from-[#090909] from-65% via-[#090909]/90 via-40% to-transparent pointer-events-none z-20">
        <div className="max-w-[720px] w-full mx-auto pointer-events-auto">
          <form
            onSubmit={handleSubmit}
            className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-[24px] bg-[#1D1D1F] border border-[#2F3336] focus-within:border-white/30 transition-all shadow-2xl flex flex-col"
          >
            {/* กล่องพิมพ์หลายบรรทัด ฟอนต์ 16px เท่ากับคำตอบ AI สี #F2F2F5 */}
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`พิมพ์ข้อความเพื่อสนทนา วางโครงสร้าง${
                activeMode === 'world' ? 'โลก...' : 'ตัวละคร...'
              }`}
              rows={1}
              className="w-full bg-transparent text-[#F2F2F5] placeholder-[#ACACB2]/60 text-[16px] outline-none resize-none leading-relaxed min-h-[26px] max-h-[220px] overflow-y-auto no-scrollbar py-0.5"
            />

            {/* แถวล่างสุด: ไร้เส้นคั่นแนวนอน */}
            <div className="flex items-center justify-between pt-1.5">
              {/* ด้านซ้าย: ไอคอนเครื่องหมายบวกแยกเดี่ยว + คำบรรยายบอกสิ่งที่จะเพิ่ม */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="เพิ่มรูปภาพหรือเอกสารอ้างอิง"
                  className="w-7 h-7 rounded-full bg-transparent hover:bg-white/[0.08] border border-transparent hover:border-white/30 text-[#ACACB2] hover:text-[#F2F2F5] flex items-center justify-center transition-all cursor-pointer active:scale-90 select-none shrink-0"
                >
                  <Plus size={16} strokeWidth={2} />
                </button>
                <span className="text-[12px] text-[#ACACB2] select-none hidden sm:inline">
                  เพิ่มรูปภาพ / เอกสารอ้างอิง
                </span>
              </div>

              {/* ด้านขวา: ปุ่มไมโครโฟน + ปุ่มส่งวงกลมสีชมพู/แดงคาร์ไมน์ (#EF264C) */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* ปุ่มไมค์ (Voice Input) อยู่ด้านหน้าปุ่มส่งตามภาพเรฟ */}
                <button
                  type="button"
                  title="พิมพ์ด้วยเสียง (Voice Input)"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-transparent hover:bg-white/[0.08] text-[#ACACB2] hover:text-[#F2F2F5] flex items-center justify-center transition-all cursor-pointer active:scale-90 select-none"
                >
                  <Mic size={18} strokeWidth={1.8} />
                </button>

                {/* ปุ่มส่งข้อความ ปรากฏขึ้นมาเมื่อพิมพ์ข้อความ */}
                {inputText.trim() ? (
                  <button
                    type="submit"
                    title="ส่งข้อความ"
                    className="w-8 h-8 rounded-full bg-[#EF264C] hover:bg-[#d91d40] text-[#F2F2F5] flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer animate-in fade-in zoom-in-75 duration-150"
                  >
                    <ArrowRight size={17} strokeWidth={2.5} />
                  </button>
                ) : (
                  /* รักษาระยะขอบขวาเล็กน้อย */
                  <div className="w-1" />
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
