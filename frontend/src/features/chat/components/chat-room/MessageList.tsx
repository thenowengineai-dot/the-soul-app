import MessageBubble from './MessageBubble'
import type { MessageListProps } from '../../types'

export type { MessageListProps }

export function MessageList({ messages, chatAvatar, chatName, endRef }: MessageListProps) {
  return (
    <div className="w-full max-w-[800px] mx-auto px-4 sm:px-6 pt-2 flex-1 flex flex-col">
      {messages.map((msg, index) => {
        const isMe = msg.sender === 'me'
        
        // ตรวจสอบข้อความก่อนหน้าว่าเป็นคนเดียวกันไหม (ข้าม vo)
        let isSameSenderAsPrev = false
        let isAfterVo = false
        if (index > 0) {
          const prevMsg = messages[index - 1]
          if (prevMsg.type === 'vo') {
            isAfterVo = true
          } else if (prevMsg.sender === msg.sender) {
            isSameSenderAsPrev = true
          }
        }
        const marginTop = isAfterVo ? 'mt-0' : (isSameSenderAsPrev ? 'mt-1' : 'mt-4')
        const isLast = index === messages.length - 1

        return (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMe={isMe}
            isLast={isLast}
            marginTop={marginTop}
            chatAvatar={chatAvatar}
            chatName={chatName}
          />
        )
      })}
      
      {/* ดันบรรทัดล่างสุดให้มีระยะหายใจพอดีเหนือแถบ Sticky Input Bar เพื่อให้เห็นข้อความล่าสุดชัดเจน 100% */}
      <div ref={endRef} className="h-20 shrink-0" />
    </div>
  )
}

export default MessageList
