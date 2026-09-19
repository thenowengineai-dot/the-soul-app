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
    <div className="w-full max-w-[740px] mx-auto px-4 sm:px-6 pt-2 flex-1 flex flex-col">
      {messages.map((msg, index) => {
        const isMe = msg.sender === 'me'
        const isVo = msg.type === 'vo'
        const isMsg = msg.type === 'msg' || !msg.type
        const isAction = msg.type === 'action'

        // ตรวจสอบข้อความก่อนหน้าและถัดไป เพื่อจัดกลุ่ม Stack (Bubble Clustering)
        const prevMsg = index > 0 ? messages[index - 1] : null
        const nextMsg = index < messages.length - 1 ? messages[index + 1] : null

        const isSameSenderAsPrev = Boolean(prevMsg && prevMsg.type !== 'vo' && prevMsg.sender === msg.sender)
        const isSameSenderAsNext = Boolean(nextMsg && nextMsg.type !== 'vo' && nextMsg.sender === msg.sender)

        // สำหรับบับเบิ้ลคำพูด (Dialogue): 
        // จะถือว่าเป็นลูกสุดท้ายในกลุ่ม (ต้องมีหาง) ถ้าข้อความถัดไปเป็นคนละคน, หรือเป็น VO, หรือเป็น Action
        const isLastInGroup = isMsg 
          ? Boolean(!nextMsg || nextMsg.sender !== msg.sender || nextMsg.type === 'vo' || nextMsg.type === 'action')
          : !isSameSenderAsNext

        const isFirstInGroup = isMsg
          ? Boolean(!prevMsg || prevMsg.sender !== msg.sender || prevMsg.type === 'vo' || prevMsg.type === 'action')
          : !isSameSenderAsPrev

        // Spacing: จัดระยะห่างตามสรีระสายตาของ Apple iMessage (Clustered Stack Cadence)
        let marginTop = 'mt-4 sm:mt-5'
        if (isVo) {
          marginTop = 'my-8 sm:my-10'
        } else if (index === 0) {
          marginTop = 'mt-1'
        } else if (prevMsg?.type === 'vo') {
          marginTop = 'mt-4 sm:mt-5'
        } else if (isSameSenderAsPrev) {
          // ถ้าคนเดียวกัน:
          // - ข้อความสลับกับ Action (เช่น Dialogue -> Action หรือ Action -> Dialogue): เว้น 10px (mt-2.5) ให้มีพื้นที่ของภาษากาย
          // - บับเบิ้ลคำพูดต่อกัน (Dialogue -> Dialogue): เว้นชิดกัน 4px (mt-1) ตามสไตล์ Clustered Stack
          if (isAction || prevMsg?.type === 'action') {
            marginTop = 'mt-2.5'
          } else {
            marginTop = 'mt-1'
          }
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
