import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, X } from 'lucide-react'

interface EmojiItem {
  char: string
  keywords: string
}

interface EmojiCategory {
  id: string
  label: string
  icon: string
  emojis: EmojiItem[]
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'popular',
    label: 'ยอดนิยม',
    icon: '🔥',
    emojis: [
      { char: '✨', keywords: 'ดาว ประกาย วิ้ง sparkle star shine' },
      { char: '😊', keywords: 'ยิ้ม มีความสุข สบายใจ smile happy blush' },
      { char: '🥰', keywords: 'รัก เขิน อบอุ่น love inlove adore' },
      { char: '🥺', keywords: 'อ้อน สงสาร ตาละห้อย plead puppy eyes' },
      { char: '😳', keywords: 'เขิน ตกใจ หน้าแดง blush shocked flushed' },
      { char: '😂', keywords: 'หัวเราะ ขำ laugh joy tear' },
      { char: '💖', keywords: 'หัวใจ ประกาย sparkle heart pink' },
      { char: '🤍', keywords: 'หัวใจขาว white heart clean' },
      { char: '🌸', keywords: 'ซากุระ ดอกไม้ ชมพู cherry blossom flower' },
      { char: '👋', keywords: 'ทักทาย โบกมือ wave hello bye' },
      { char: '🙏', keywords: 'ขอบคุณ ไหว้ สาธุ please thank pray' },
      { char: '🫶', keywords: 'มินิฮาร์ท มือหัวใจ heart hands love' },
      { char: '🔥', keywords: 'ไฟ ร้อนแรง ฮอต fire hot' },
      { char: '💫', keywords: 'ดาวหมุน dizzy star spark' },
      { char: '🐱', keywords: 'แมว เหมียว cat kitty' },
      { char: '☕', keywords: 'กาแฟ ชิล coffee tea cafe' },
    ],
  },
  {
    id: 'faces',
    label: 'รอยยิ้ม',
    icon: '😊',
    emojis: [
      { char: '😊', keywords: 'ยิ้ม สบายใจ smile happy' },
      { char: '🥰', keywords: 'รัก อบอุ่น in love heart smile' },
      { char: '😍', keywords: 'หลงรัก ตาหัวใจ heart eyes love' },
      { char: '😘', keywords: 'ส่งจูบ kiss love' },
      { char: '😚', keywords: 'จูบ เขิน kiss closed eyes' },
      { char: '😋', keywords: 'อร่อย แลบลิ้น yummy delicious' },
      { char: '🥹', keywords: 'ซึ้ง น้ำตาคลอ proud touched emotional' },
      { char: '🥺', keywords: 'อ้อน สงสาร plead puppy' },
      { char: '😳', keywords: 'หน้าแดง เขิน flushed embarrassed' },
      { char: '🫣', keywords: 'แอบดู เขิน peeking shy' },
      { char: '🤫', keywords: 'จุ๊ๆ เงียบ shh quiet secret' },
      { char: '😏', keywords: 'ยิ้มมุมปาก เจ้าเล่ห์ smirk sly' },
      { char: '😌', keywords: 'โล่งใจ สบายใจ relieved relaxed' },
      { char: '😉', keywords: 'ขยิบตา wink play' },
      { char: '😄', keywords: 'ยิ้มกว้าง grin laugh' },
      { char: '😆', keywords: 'ขำสุดๆ laughing' },
      { char: '😂', keywords: 'หัวเราะน้ำตาไหล joy lol' },
      { char: '🤣', keywords: 'ขำกลิ้ง rofl funny' },
      { char: '😭', keywords: 'ร้องไห้ เสียใจ แง cry sob loud' },
      { char: '😢', keywords: 'เศร้า น้ำตาซึม sad tear' },
      { char: '😤', keywords: 'ฮึด ฮึ่ม huff triumph proud' },
      { char: '😠', keywords: 'โกรธ angry mad' },
      { char: '😡', keywords: 'โมโห rage angry' },
      { char: '🤯', keywords: 'หัวระเบิด mind blown shock' },
      { char: '😱', keywords: 'ตกใจ กรี๊ด scream fear' },
      { char: '🤔', keywords: 'คิด สงสัย think ponder' },
      { char: '🫡', keywords: 'วันทยหัตถ์ รับทราบ salute yes' },
      { char: '🫠', keywords: 'ละลาย เขินจนละลาย melting shy' },
      { char: '🥱', keywords: 'หาว ง่วง yawn tired' },
      { char: '😴', keywords: 'หลับ zzz sleep night' },
      { char: '🤤', keywords: 'น้ำลายไหล drool want' },
      { char: '😇', keywords: 'นางฟ้า ไร้เดียงสา innocent angel' },
      { char: '🥳', keywords: 'ปาร์ตี้ ฉลอง party celebrate' },
      { char: '😎', keywords: 'เท่ คูล cool sunglasses' },
      { char: '😜', keywords: 'ทะเล้น wink tongue' },
      { char: '🤪', keywords: 'บ้าบอ crazy goofy' },
    ],
  },
  {
    id: 'hearts',
    label: 'ความรัก',
    icon: '💖',
    emojis: [
      { char: '💖', keywords: 'หัวใจประกาย sparkle heart love' },
      { char: '❤️', keywords: 'หัวใจแดง red heart love' },
      { char: '🩷', keywords: 'หัวใจชมพู pink heart cute' },
      { char: '🧡', keywords: 'หัวใจส้ม orange heart' },
      { char: '💛', keywords: 'หัวใจเหลือง yellow heart' },
      { char: '💚', keywords: 'หัวใจเขียว green heart' },
      { char: '💙', keywords: 'หัวใจฟ้า blue heart' },
      { char: '🩵', keywords: 'หัวใจฟ้าอ่อน cyan heart' },
      { char: '💜', keywords: 'หัวใจม่วง purple heart' },
      { char: '🤍', keywords: 'หัวใจขาว white heart' },
      { char: '🖤', keywords: 'หัวใจดำ black heart' },
      { char: '🩶', keywords: 'หัวใจเทา grey heart' },
      { char: '🤎', keywords: 'หัวใจน้ำตาล brown heart' },
      { char: '💔', keywords: 'อกหัก broken heart sad' },
      { char: '❤️‍🔥', keywords: 'ใจลุกเป็นไฟ heart fire passion' },
      { char: '❤️‍🩹', keywords: 'เยียวยาใจ mending heart healing' },
      { char: '❣️', keywords: 'เครื่องหมายใจ exclamation heart' },
      { char: '💕', keywords: 'สองหัวใจ two hearts' },
      { char: '💞', keywords: 'หัวใจวน revolving hearts' },
      { char: '💓', keywords: 'หัวใจเต้น beating heart pulse' },
      { char: '💗', keywords: 'หัวใจโต growing heart' },
      { char: '💘', keywords: 'กามเทพ cupid heart arrow' },
      { char: '💝', keywords: 'หัวใจของขวัญ ribbon heart' },
      { char: '💌', keywords: 'จดหมายรัก love letter mail' },
      { char: '💋', keywords: 'รอยจูบ kiss mark lips' },
      { char: '🫶', keywords: 'มือรูปหัวใจ heart hands' },
    ],
  },
  {
    id: 'sparkles',
    label: 'ประกาย',
    icon: '✨',
    emojis: [
      { char: '✨', keywords: 'ประกาย วิ้ง sparkle shine star' },
      { char: '⭐', keywords: 'ดาว star yellow' },
      { char: '🌟', keywords: 'ดาวเปล่งประกาย glowing star' },
      { char: '💫', keywords: 'ดาวหมุน dizzy star' },
      { char: '⚡', keywords: 'สายฟ้า zap electric lightning' },
      { char: '🌙', keywords: 'พระจันทร์ เสี้ยว moon night' },
      { char: '🌕', keywords: 'พระจันทร์เต็มดวง full moon' },
      { char: '☀️', keywords: 'พระอาทิตย์ sun bright day' },
      { char: '☁️', keywords: 'เมฆ cloud soft' },
      { char: '🌧️', keywords: 'ฝน rain rainy drop' },
      { char: '❄️', keywords: 'หิมะ snowflake cold winter' },
      { char: '🔥', keywords: 'ไฟ fire flame lit' },
      { char: '💧', keywords: 'หยดน้ำ water droplet' },
      { char: '🎀', keywords: 'โบว์ ribbon pink cute' },
      { char: '🪄', keywords: 'คทาเวทมนตร์ magic wand fairy' },
      { char: '🔮', keywords: 'ลูกแก้วเวทมนตร์ crystal ball magic' },
      { char: '💎', keywords: 'เพชร อัญมณี gem diamond luxury' },
      { char: '👑', keywords: 'มงกุฎ crown king queen royal' },
      { char: '🌈', keywords: 'สายรุ้ง rainbow colorful' },
    ],
  },
  {
    id: 'gestures',
    label: 'ท่าทาง',
    icon: '👋',
    emojis: [
      { char: '👋', keywords: 'โบกมือ wave hello hi bye' },
      { char: '🤚', keywords: 'หลังมือ raised back of hand' },
      { char: '🖐️', keywords: 'กางมือ splayed fingers' },
      { char: '✋', keywords: 'หยุด stop raised hand' },
      { char: '✌️', keywords: 'สู้ๆ สองนิ้ว victory peace' },
      { char: '🤞', keywords: 'ภาวนา นิ้วไขว้ cross fingers hope' },
      { char: '🫰', keywords: 'มินิฮาร์ท finger heart kpop' },
      { char: '🤟', keywords: 'รักนะ love you gesture' },
      { char: '🤘', keywords: 'ร็อก horns rock' },
      { char: '🤙', keywords: 'โทรมานะ call me shaka' },
      { char: '👌', keywords: 'โอเค ok perfect' },
      { char: '🤌', keywords: 'เชฟ อิตาลี pinched fingers' },
      { char: '🤏', keywords: 'นิดเดียว pinching little' },
      { char: '👍', keywords: 'เยี่ยม ไลค์ thumbs up good' },
      { char: '👎', keywords: 'ไม่โอเค thumbs down bad' },
      { char: '👏', keywords: 'ปรบมือ clap applause' },
      { char: '🙌', keywords: 'ยกมือ ไชโย raising hands praise' },
      { char: '🫶', keywords: 'สองมือหัวใจ heart hands' },
      { char: '🤝', keywords: 'จับมือ ข้อตกลง handshake deal' },
      { char: '🙏', keywords: 'ไหว้ ขอบคุณ pray please thank' },
      { char: '✍️', keywords: 'เขียน จดบันทึก writing pen' },
      { char: '💪', keywords: 'สู้ กล้าม muscle strong flex' },
    ],
  },
  {
    id: 'cute',
    label: 'น่ารัก',
    icon: '🌸',
    emojis: [
      { char: '🌸', keywords: 'ซากุระ cherry blossom' },
      { char: '🌺', keywords: 'ชบา hibiscus' },
      { char: '🌹', keywords: 'กุหลาบ rose love' },
      { char: '🌷', keywords: 'ทิวลิป tulip' },
      { char: '🌻', keywords: 'ทานตะวัน sunflower' },
      { char: '🌼', keywords: 'เดซี่ daisy blossom' },
      { char: '🍃', keywords: 'ใบไม้ ลมพัด leaves wind' },
      { char: '🍀', keywords: 'โคลเวอร์ โชคดี clover lucky' },
      { char: '🐱', keywords: 'แมว cat meow' },
      { char: '🐶', keywords: 'หมา dog puppy woof' },
      { char: '🦊', keywords: 'จิ้งจอก fox cute' },
      { char: '🐰', keywords: 'กระต่าย bunny rabbit' },
      { char: '🐻', keywords: 'หมี bear teddy' },
      { char: '☕', keywords: 'กาแฟ coffee cafe' },
      { char: '🍵', keywords: 'ชาเขียว matcha tea' },
      { char: '🧋', keywords: 'ชานมไข่มุก boba bubble tea' },
      { char: '🍰', keywords: 'เค้ก cake sweet' },
      { char: '🍓', keywords: 'สตรอว์เบอร์รี่ strawberry' },
      { char: '🧸', keywords: 'ตุ๊กตาหมี teddy bear' },
      { char: '🎧', keywords: 'หูฟัง เพลง headphone music' },
      { char: '📖', keywords: 'หนังสือ อ่าน book read' },
      { char: '🥂', keywords: 'ชนแก้ว ฉลอง cheers champagne' },
    ],
  },
]

export interface EmojiPickerPopoverProps {
  isOpen: boolean
  onClose: () => void
  onSelectEmoji: (emoji: string) => void
}

export function EmojiPickerPopover({
  isOpen,
  onClose,
  onSelectEmoji,
}: EmojiPickerPopoverProps) {
  const [activeTab, setActiveTab] = useState<string>('popular')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const popoverRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Filtered emojis based on search query or active category
  const displayedEmojis = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      const currentCat = EMOJI_CATEGORIES.find((c) => c.id === activeTab)
      return currentCat ? currentCat.emojis : []
    }

    // Search across all categories, removing duplicates
    const matches: EmojiItem[] = []
    const seen = new Set<string>()

    for (const cat of EMOJI_CATEGORIES) {
      for (const item of cat.emojis) {
        if (!seen.has(item.char) && (item.char.includes(query) || item.keywords.toLowerCase().includes(query))) {
          seen.add(item.char)
          matches.push(item)
        }
      }
    }
    return matches
  }, [searchQuery, activeTab])

  if (!isOpen) return null

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-full mb-3 left-0 z-50 w-[290px] sm:w-[330px] bg-[#151517]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-3 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150 select-none pointer-events-auto"
      style={{
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.7), 0 0 1px 1px rgba(255,255,255,0.08)',
      }}
    >
      {/* 1. Header with Search Bar */}
      <div className="relative w-full flex items-center">
        <div className="relative flex-1 flex items-center bg-white/5 border border-white/10 rounded-full px-3 py-1.5 focus-within:border-white/25 focus-within:bg-white/[0.08] transition-all">
          <Search size={14} className="text-[#71767B] mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาอีโมจิ... (ยิ้ม, หัวใจ, ดาว)"
            className="w-full bg-transparent outline-none text-[13px] text-app-primary placeholder-[#71767B]"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[#71767B] hover:text-app-primary ml-1 p-0.5"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Category Tab Navigation (Only shown when not searching) */}
      {!searchQuery && (
        <div className="flex items-center gap-1 border-b border-white/5 pb-2 overflow-x-auto no-scrollbar">
          {EMOJI_CATEGORIES.map((cat) => {
            const isActive = activeTab === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id)}
                title={cat.label}
                className={`px-2.5 py-1 rounded-full text-[12px] flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/15 text-app-primary font-medium'
                    : 'text-[#71767B] hover:text-app-primary hover:bg-white/5'
                }`}
              >
                <span className="text-[13px]">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* 3. Emoji Grid */}
      <div className="max-h-[210px] overflow-y-auto no-scrollbar p-0.5">
        {displayedEmojis.length === 0 ? (
          <div className="py-8 text-center text-[13px] text-[#71767B]">
            ไม่พบอีโมจิที่ค้นหา
          </div>
        ) : (
          <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
            {displayedEmojis.map((emoji) => (
              <button
                key={emoji.char}
                type="button"
                onClick={() => onSelectEmoji(emoji.char)}
                title={emoji.keywords}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[19px] hover:bg-white/10 active:scale-90 transition-all cursor-pointer hover:shadow-sm"
              >
                {emoji.char}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Bottom Hint */}
      <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[11px] text-[#71767B] px-1">
        <span>คลิกเพื่อแทรกในข้อความ</span>
        <span className="opacity-60">Esc เพื่อปิด</span>
      </div>
    </div>
  )
}

export default EmojiPickerPopover
