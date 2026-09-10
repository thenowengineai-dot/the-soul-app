import { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  PanelRightOpen,
  ChevronDown,
  ChevronUp,
  Plus,
  Mic,
  Sparkles,
  Brain,
} from 'lucide-react';
import { TypingIndicator } from '../../../components/common';
import type { CreatorMode, MuseIdeaItem, MuseMessage } from '../types';

interface ParsedMuseMessage {
  dialogueText: string;
  thinking?: string;
  extractedIdeas?: MuseIdeaItem[];
  actionSuggestions?: string[];
}

/**
 * แปลงและแยกข้อมูลข้อความของ The Muse ให้เป็นมิตรต่อผู้ใช้งาน
 * รองรับทั้งข้อความใหม่ที่ parse มาแล้ว และข้อความเก่าที่บันทึกเป็น raw JSON
 */
function parseMuseMessage(msg: MuseMessage): ParsedMuseMessage {
  if (!msg) {
    return { dialogueText: '' };
  }

  const rawText =
    typeof msg.text === 'string'
      ? msg.text
      : typeof (msg as unknown as Record<string, unknown>).content === 'string'
      ? ((msg as unknown as Record<string, unknown>).content as string)
      : '';

  // 1. ถ้าข้อความมีฟิลด์ thinking หรือ extractedIdeas ติดมาอยู่แล้ว
  if (msg.thinking || (msg.extractedIdeas && msg.extractedIdeas.length > 0)) {
    return {
      dialogueText: rawText,
      thinking: typeof msg.thinking === 'string' ? msg.thinking : undefined,
      extractedIdeas: msg.extractedIdeas,
      actionSuggestions: msg.actionSuggestions,
    };
  }

  // 2. ถ้าข้อความถูกบันทึกเป็น Raw JSON หรือมี Markdown Code Blocks ครอบ
  let text = rawText.trim();
  if (text.startsWith('```json')) text = text.slice(7);
  if (text.startsWith('```')) text = text.slice(3);
  if (text.endsWith('```')) text = text.slice(0, -3);
  text = text.trim();

  if (
    text.startsWith('{') &&
    (text.includes('"thinking"') ||
      text.includes('"reply_text_part1"') ||
      text.includes('"extracted_ideas"'))
  ) {
    try {
      const parsed = JSON.parse(text);
      const part1 = parsed.reply_text_part1 || '';
      const part2 = parsed.reply_text_part2 || '';
      const dialogueText =
        [part1, part2].filter(Boolean).join('\n\n') || parsed.text || text;

      const suggestions: string[] = [];
      if (Array.isArray(parsed.extracted_ideas)) {
        parsed.extracted_ideas.forEach((item: { text?: string; type?: string }) => {
          if (item?.text) {
            const prefix =
              item.type === 'vo'
                ? '🎬 '
                : item.type === 'actor_state'
                ? '🎭 '
                : item.type === 'illusion'
                ? '✨ '
                : '⚡ ';
            suggestions.push(`${prefix}${item.text}`);
          }
        });
      }

      return {
        dialogueText,
        thinking: typeof parsed.thinking === 'string' ? parsed.thinking : undefined,
        extractedIdeas: Array.isArray(parsed.extracted_ideas)
          ? parsed.extracted_ideas
          : undefined,
        actionSuggestions:
          suggestions.length > 0 ? suggestions : msg.actionSuggestions,
      };
    } catch {
      // ถ้า parse ไม่ผ่าน ให้คืนข้อความเดิม
    }
  }

  return {
    dialogueText: rawText,
    thinking: typeof msg.thinking === 'string' ? msg.thinking : undefined,
    extractedIdeas: msg.extractedIdeas,
    actionSuggestions: msg.actionSuggestions,
  };
}

function getIdeaBadgeConfig(type: string) {
  switch (type) {
    case 'vo':
      return {
        icon: '🎬',
        label: 'Voice Over',
        badgeClass: 'bg-[#181d28] border-[#3b82f6]/30 text-[#93c5fd]',
      };
    case 'actor_state':
      return {
        icon: '🎭',
        label: 'Actor State',
        badgeClass: 'bg-[#251d18] border-[#f59e0b]/30 text-[#fcd34d]',
      };
    case 'illusion':
      return {
        icon: '✨',
        label: 'Illusion Trigger',
        badgeClass: 'bg-[#261520] border-[#ec4899]/30 text-[#f472b6]',
      };
    case 'chaos':
      return {
        icon: '⚡',
        label: 'Chaos Escalation',
        badgeClass: 'bg-[#291419] border-[#EF264C]/35 text-[#fda4af]',
      };
    default:
      return {
        icon: '💡',
        label: 'Idea',
        badgeClass: 'bg-[#18181b] border-white/10 text-[#ACACB2]',
      };
  }
}

interface TheMuseChatProps {
  messages: MuseMessage[];
  onSendMessage: (text: string) => void;
  onSelectSuggestion: (text: string) => void;
  isRightPanelCollapsed: boolean;
  onToggleRightPanel: () => void;
  activeMode: CreatorMode;
  activeDraftTitle?: string;
  isThinking?: boolean;
}

export default function TheMuseChat({
  messages,
  onSendMessage,
  onSelectSuggestion,
  isRightPanelCollapsed,
  onToggleRightPanel,
  activeMode,
  isThinking = false,
}: TheMuseChatProps) {
  const [inputText, setInputText] = useState('');
  // บันทึกสถานะการยืด-หดของแต่ละข้อความผู้ใช้
  const [expandedUserMessages, setExpandedUserMessages] = useState<Record<string, boolean>>({});
  // บันทึกสถานะการเปิด-ปิด Thinking Accordion ของ The Muse
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({});
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

  const toggleThinking = (msgId: string) => {
    setExpandedThinking((prev) => ({
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
            const msgText =
              typeof msg.text === 'string'
                ? msg.text
                : typeof (msg as unknown as Record<string, unknown>).content === 'string'
                ? ((msg as unknown as Record<string, unknown>).content as string)
                : '';

            if (isUser) {
              const isExpanded = expandedUserMessages[msg.id] ?? false;
              const isLongText = msgText.length > 110 || msgText.includes('\n');

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
                      {msgText}
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

            // 🏛️ ข้อความ The Muse: ผสาน Thinking Accordion + บทสนทนาคลีน + Idea Shelf
            const parsed = parseMuseMessage(msg);
            const hasThinking = Boolean(typeof parsed.thinking === 'string' && parsed.thinking.trim().length > 0);
            const isThinkingOpen = expandedThinking[msg.id] ?? false;
            const hasIdeas = Boolean(parsed.extractedIdeas && parsed.extractedIdeas.length > 0);
            const suggestions =
              parsed.actionSuggestions && parsed.actionSuggestions.length > 0
                ? parsed.actionSuggestions
                : msg.actionSuggestions;

            return (
              <div key={msg.id} className="w-full flex flex-col gap-3.5 py-1 select-text">
                {/* 1. Gemini-Style Thinking Process Accordion */}
                {hasThinking && (
                  <div className="w-full">
                    <button
                      type="button"
                      onClick={() => toggleThinking(msg.id)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 text-[#ACACB2] hover:text-[#F2F2F5] transition-all cursor-pointer text-[13px] select-none group"
                    >
                      <Sparkles size={13} className="text-[#EF264C] group-hover:scale-110 transition-transform" />
                      <span className="font-medium text-[#F2F2F5]">กระบวนการคิดของ The Muse</span>
                      <span className="text-[11.5px] text-[#ACACB2] hidden sm:inline">
                        (Thinking Process)
                      </span>
                      {isThinkingOpen ? (
                        <ChevronUp size={13} className="text-[#ACACB2] ml-0.5 group-hover:text-[#F2F2F5]" />
                      ) : (
                        <ChevronDown size={13} className="text-[#ACACB2] ml-0.5 group-hover:text-[#F2F2F5]" />
                      )}
                    </button>

                    {isThinkingOpen && (
                      <div className="mt-2.5 p-4 rounded-2xl bg-[#121214]/90 border border-white/[0.08] backdrop-blur-md shadow-inner animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="flex items-center gap-2 pb-2 mb-2 border-b border-white/[0.06] text-[12px] font-medium text-[#ACACB2]">
                          <Brain size={13} className="text-[#EF264C]" />
                          <span>Internal Monologue & Sensory Physics</span>
                        </div>
                        <div className="text-[13.5px] leading-[1.7] text-[#ACACB2] whitespace-pre-wrap break-words font-mono select-text">
                          {parsed.thinking}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. ข้อความบทสนทนาหลักของ AI ฟอนต์ 16px อ่านสบายตา สี #F2F2F5 ไร้โค้ด/JSON ปน */}
                <div className="text-[16px] leading-[1.75] text-[#F2F2F5] whitespace-pre-wrap break-words font-normal">
                  {parsed.dialogueText}
                </div>

                {/* 3. The Scratchpad / Extracted Ideas Shelf */}
                {hasIdeas && parsed.extractedIdeas && (
                  <div className="pt-1 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#ACACB2]">
                      <Sparkles size={12} className="text-[#EF264C]" />
                      <span>ไอเดียที่สกัดเข้า The Scratchpad:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {parsed.extractedIdeas.map((idea, idx) => {
                        const config = getIdeaBadgeConfig(idea.type);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => onSelectSuggestion(idea.text)}
                            title="คลิกเพื่อนำไอเดียนี้ไปพิมพ์ต่อในช่องแชท"
                            className={`inline-flex items-start gap-2 px-3 py-1.5 rounded-xl border text-[13px] leading-relaxed transition-all cursor-pointer active:scale-95 text-left ${config.badgeClass} hover:brightness-125`}
                          >
                            <span className="shrink-0 select-none text-[13px]">{config.icon}</span>
                            <span className="break-words">
                              <span className="font-medium mr-1.5 opacity-80 select-none text-[11px] uppercase tracking-wider">
                                [{config.label}]
                              </span>
                              {idea.text}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Suggestion Action Pills (สไตล์แคปซูลเดียวกับ Hashtags ในหน้ารายละเอียดตัวละคร) */}
                {suggestions && suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {suggestions.map((sugg, idx) => (
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
          {isThinking && (
            <div className="w-full py-1.5 select-none">
              <TypingIndicator
                name="The Muse"
                subtext="กำลังคิดและถักทอโครงสร้าง..."
                dotColor="#EF264C"
                variant="with-text"
              />
            </div>
          )}
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
                    disabled={isThinking}
                    title="ส่งข้อความ"
                    className={`w-8 h-8 rounded-full ${
                      isThinking ? 'bg-[#EF264C]/50 cursor-not-allowed' : 'bg-[#EF264C] hover:bg-[#d91d40] cursor-pointer'
                    } text-[#F2F2F5] flex items-center justify-center transition-all shadow-md active:scale-90 animate-in fade-in zoom-in-75 duration-150`}
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
