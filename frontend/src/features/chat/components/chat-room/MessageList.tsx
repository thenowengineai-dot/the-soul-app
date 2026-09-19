import MessageBubble from './MessageBubble'
import type { MessageListProps } from '../../types'

export type { MessageListProps }

export function MessageList({ 
  messages, 
  chatAvatar, 
  chatName, 
  endRef 
}: MessageListProps) {
  return (
    <div className="w-full max-w-[700px] mx-auto px-4 sm:px-6 pt-2 flex-1 flex flex-col">
      {messages.map((msg, index) => {
        const isMe = msg.sender === 'me'
        
        const isVo = msg.type === 'vo'
        
        // ตรวจสอบข้อความก่อนหน้าและถัดไป เพื่อจัดกลุ่ม Stack (Bubble Clustering)
        const prevMsg = index > 0 ? messages[index - 1] : null
        const nextMsg = index < messages.length - 1 ? messages[index + 1] : null

        const isSameSenderAsPrev = Boolean(prevMsg && prevMsg.type !== 'vo' && prevMsg.sender === msg.sender)
        const isSameSenderAsNext = Boolean(nextMsg && nextMsg.type !== 'vo' && nextMsg.sender === msg.sender)

        const isFirstInGroup = !isSameSenderAsPrev
        const isLastInGroup = !isSameSenderAsNext

        // Spacing: จัดระยะห่างตามสรีระสายตา (Ergonomic Spacing)
        let marginTop = 'mt-5 sm:mt-6'
        if (isVo) {
          marginTop = 'my-6 sm:my-8'
        } else if (index === 0) {
          marginTop = 'mt-1'
        } else if (prevMsg?.type === 'vo') {
          marginTop = 'mt-3'
        } else if (isSameSenderAsPrev) {
          marginTop = 'mt-1.5 sm:mt-2'
        }

        const isLast = index === messages.length - 1
        const isRead = isMe && Boolean(msg.read)

        return (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMe={isMe}
            isLast={isLast}
            isFirstInGroup={isFirstInGroup}
            isLastInGroup={isLastInGroup}
            isRead={isRead}
            marginTop={marginTop}
            chatAvatar={chatAvatar}
            chatName={chatName}
          />
        )
      })}

      {/* ดันบรรทัดล่างสุดให้มีระยะหายใจพอดีเหนือแถบ Sticky Input Bar (h-28) เพื่อให้เห็นข้อความล่าสุดชัดเจน 100% */}
      <div ref={endRef} className="h-28 shrink-0" />
    </div>
  )
}

export default MessageList
