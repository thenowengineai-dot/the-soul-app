# The Soul App: UI Component Recipes & Design Specifications
**คลังสูตรส่วนประกอบ UI, สถาปัตยกรรมห้องสนทนา และดีเอ็นเอการออกแบบเชิงกายวิภาค**  
*เอกสารอ้างอิงเฉพาะกิจสำหรับการพัฒนา UI (On-Demand Reference)*

---

## 1. UX Philosophy, Apple's Legacy & Ergonomics
แนวคิดหลักในการออกแบบที่เน้นพฤติกรรมผู้ใช้ สรีระมนุษย์ และอุปกรณ์ในยุคปัจจุบัน:
- **Steve Jobs & Apple's Legacy (สี่เหลี่ยมขอบมนสู่ปุ่ม Pill):** 
  - สี่เหลี่ยมในธรรมชาติไม่มีมุมแหลม 90 องศา มุมโค้งมนสร้างความรู้สึก "ปลอดภัย เป็นมิตร และนุ่มนวล"
  - รอยประทับของปลายนิ้วโป้งมนุษย์ (Thumb Print) เป็นทรงวงรี ปุ่มโต้ตอบ ชิป และกล่องค้นหาจึงต้องใช้ **ทรงแคปซูลมนเต็ม (`rounded-full`)** เพื่อรองรับสรีระนิ้วโป้งโดยธรรมชาติ
- **Subtractive Design (ปรัชญาการตัดออก):** *"Deciding what not to do is as important as deciding what to do"* ตัดเอฟเฟกต์รกตาทิ้งทั้งหมด (ตัดเงาฟุ้ง, ตัดสีฉูดฉาด, ตัดขอบหนา) จนเหลือเฉพาะเนื้อหาและปุ่มที่ใช้งานจริง
- **Don't Make Me Think (ใช้งานได้จริงโดยไม่ต้องคิด):** ทุกปุ่มและทุกไอคอนต้องสื่อสารชัดเจนในตัวเอง ผู้ใช้เห็นปุ๊บรู้ปั๊บทันทีว่าต้องกดตรงไหนโดยไม่ต้องมีคู่มือสอน
- **Mobile-First & Responsive Unfolding:** เริ่มต้นจากความกะทัดรัดและคุ้นมือของจอมือถือ แล้วใช้วิธีกางออก (Unfold) บนจอ Desktop โดยคงสัดส่วนปุ่มและไอคอนที่คุ้นเคยไว้
- **Familiarity is Beauty:** อาศัยความคุ้นชินของผู้ใช้จากแอปพลิเคชันกระแสหลัก (YouTube, X) ทำให้เมื่อเข้ามาใช้งาน ผู้ใช้จะรู้สึกคุ้นเคยและใช้งานได้ลื่นไหลโดยสัญชาตญาณ
- **Center-Focused Layout:** จัดวางพื้นที่ใช้งานหลักให้อยู่ตรงกลาง และปล่อยพื้นที่ว่าง (Whitespace) ด้านซ้าย-ขวา เลย์เอาต์นี้ช่วยให้อ่านง่ายและโฟกัสได้ดี
- **Container Width:** ความกว้างของพื้นที่ตรงกลางกำหนดไว้ที่ **1440px** (ความกว้างสำหรับหน้าจอ Desktop ขนาดใหญ่) เพื่อให้ ChatList และ ChatRoom มีพื้นที่แสดงผลที่กว้างขวางและอ่านสบายตาที่สุด
- **Editorial Hierarchy (ลำดับการมองเห็นสไตล์ Fashion E-commerce):**
  - ในหน้ารายละเอียด (Detail Modal) หัวข้อหลัก (ชื่อตัวละคร) ต้องมีขนาดใหญ่ ชัดเจน มีพลัง (`text-[26px] sm:text-[30px] lg:text-[34px]`)
  - ข้อความรอง (สเตตัส / คำพูดตัวละคร) ต้องขยายขนาดตามหัวข้อหลัก (`text-[18px] sm:text-[19.5px] lg:text-[21px]`) เพื่อความสมดุลสายตา
  - แถบสถิติ (Stats Bar) ใช้ฟอนต์น้ำหนักปกติ (`font-weight: 400`) ไม่อ้วนหนาจนแย่งจุดโฟกัส
  - Hashtags ใช้ขนาดมาตรฐานทรงแคปซูล Dark Pill ไม่ใหญ่เทอะทะ
- **Jony Ive's Instant Distance Recognition ("คือดูไกลๆ รู้ได้เลยว่าเป็นการ์ดเกี่ยวกับอะไร"):**
  - การ์ดและวิดเจ็ตทุกชิ้นบนหน้าจอต้องมี **เอกลักษณ์ทางกายภาพ (Tactile Silhouette & Visual Archetype)** ที่สมองมนุษย์จำแนกได้ทันทีจากระยะไกล โดยไม่ต้องเพ่งอ่านตัวหนังสือขนาดเล็ก
  - เช่น ป้ายชื่อ (Hero Masthead Plaque), ตู้เสื้อผ้า (ราวแขวนผ้าโลหะสมจริง), สรีระ (ตาราง 2x2 สัดส่วนหลัก + ถาดสัมผัสเนื้อหา), ท่าทาง (แผ่นคิวตัวเลข Monospace 01 02 03), สภาพอากาศ (Apple Weather Widget)
  - ห้ามทำการ์ดหน้าตาซ้ำซากเป็นกล่องข้อความทึบๆ, ห้ามใช้ Popover ลอยบดบัง, และห้ามทำหน้าสอง/หน้าสาม (Multi-Page Flipping) ที่ทำให้หลุดออกจากผืนผ้าใบหน้าแรกเด็ดขาด

---

## 2. Color Palette & Lighting Rules (โทนสีและกฎแสงเงา)
- **ระบบพื้นผิว 4 ระดับ (Modern Dark Surface System):**
  - **Level 0 (Canvas Base):** ใช้สี **`#0F0F0F`** หรือ `#090909` (ดำด้านเนื้อแมตต์เกือบสนิท) เพื่อความพรีเมียมและถนอมสายตาสำหรับการใช้งานต่อเนื่อง
  - **Level 1 (Surface/Card/Panel):** ใช้สี **`#181818`** หรือ `#1D1D1F` (Apple Dark Gray) สำหรับการ์ด บับเบิ้ลแชท และกล่องเนื้อหา สว่างกว่าพื้นหลัง 5–7% เพื่อยกตัวอย่างสง่างามโดยไม่พึ่งพาเงา
  - **Level 2 (Interactive/Hover):** ใช้สี **`#272727`** หรือ `hover:bg-white/[0.08]` ให้ปุ่มสว่างนุ่มนวลเมื่อสัมผัส
  - **Level 3 (Border/Divider):** ใช้สี **`#282828`** หรือ `#2F3336` (สีเทาแบบ X Lights out / border-white/10) ในการตัดขอบคมกริบ 1px
- **ระบบตัวหนังสือสองเฉด (Dual-Tone Typography):**
  - **Primary White (ปุ่ม/ข้อความหลัก):** ใช้สี **`#F1F1F1`** หรือ `#F2F2F5` เป็นสีขาวนวลตาแทนทั้งเว็บ **ห้ามใช้ pure white `#FFFFFF` ในตัวหนังสือเด็ดขาด**
  - **Neutral Gray (ข้อความรอง):** ใช้สี **`#AAAAAA`** หรือ `#71767B` สำหรับเวลา, คำอธิบายสั้นๆ, ข้อความพรีวิว, ชื่อรอง, คำพูดตัวละคร, และสถิติต่างๆ
- **Brand Primary (สีแบรนด์หลัก):** ใช้สี **`#EF264C`** (สีคาร์ไมน์เรด) สำหรับปุ่มฟิลเตอร์, จุดสถานะแจ้งเตือน, ปุ่มแชทหลัก และเน้นฟีเจอร์สำคัญแบบประหยัดจุดใช้ ไม่ป้ายเปรอะเปื้อน
- **Glow & Shadow Rules (กฎเหล็กเรื่องแสงเงา - Zero-Glow Philosophy):**
  - **ห้ามใส่เงามัวฟุ้ง (Neon Glow / Drop Shadow หนาๆ) ในที่มืดเด็ดขาด:** เพราะจะทำให้ปุ่มดูเบลอ ขาดความคมชัด ดูราคาถูก และทำให้สายตาล้า
  - ให้เน้นความเรียบหรู คมชัด (Clean Edge 1px) และใช้การเปลี่ยนสีพื้นหลังเมื่อ Hover แทนเงาฟุ้ง

---

## 3. UI Components & Recipes (สูตรการสร้าง UI)

### 3.1 Apple Subtle White Frosted Glass Recipe (สูตรกระจกฝ้าสีขาวละมุนตา - มาตรฐานหลัก)
หัวใจของความหรูหรา นุ่มฟู และถนอมสายตาสำหรับพื้นผิวที่มีการเคลื่อนไหวหรืออ่านบ่อย:
- **สูตรมาตรฐาน (Standard Controls / Pills / Buttons):**
  - คลาสหลัก: `bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-2xl border border-white/[0.10] hover:border-white/20 text-white/85 hover:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] active:scale-95 transition-all`
  - ใช้กับ: ปุ่มเหรียญ, ปุ่มเปิด-ปิด ChatList, ปุ่มเปิด-ปิด HUD, กล่องค้นหา, ชิปตัวกรอง, กล่องพิมพ์ข้อความ
- **สูตรถนอมสายตาพิเศษ (Smoked Crystal Glass - สำหรับ HUD Cards):**
  - ดร็อปความขาวลงเหลือ 4% เพื่อลดแสงแยงตาในจุดที่สายตาต้องกวาดมองต่อเนื่องระหว่างแชท
  - คลาสหลัก: `bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-2xl border border-white/[0.07] hover:border-white/14 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all`
  - ใช้กับ: การ์ดสถานที่, เวลา/สภาพอากาศ, ท่าทางตัวละคร, ท่าทางผู้เล่น, ชุดปัจจุบัน, หลอดความสัมพันธ์ และหลอดความปรารถนา

### 3.2 Search Capsule Recipe (กล่องค้นหาทรงแคปซูลกระจกฝ้าพร้อมปุ่มเคลียร์)
สูตรการสร้างกล่องค้นหาแบบ Apple-YouTube Hybrid สไตล์ปัจจุบัน:
1. **Container หลัก:** ทรงแคปซูลมนเต็ม (`rounded-full`), สูง 38px–40px, คลุมด้วยกระจกฝ้าสูตรมาตรฐานข้อ 3.1:
   `h-[38px] sm:h-[40px] rounded-full bg-white/[0.06] hover:bg-white/[0.09] focus-within:bg-white/[0.10] backdrop-blur-2xl border border-white/[0.10] focus-within:border-white/25 px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]`
2. **ไอคอนค้นหา:** `Search size={14}` สีเงินนวลตา `text-white/40 shrink-0 mr-2`
3. **ช่องพิมพ์ (Input):** โปร่งใส ไร้กรอบ `w-full bg-transparent outline-none text-[#F5F5F7] placeholder-white/40 text-[12.5px]`
4. **ปุ่มล้างคำค้นหา (Quick Clear X):** ปรากฏเมื่อมีข้อความ `w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors` พร้อมไอคอน `X size={11} strokeWidth={2.5}`

### 3.3 Chat Room Architecture (Apple Tactile & Twitter Lights Out Style)
- **เลย์เอาต์:** ไถฟีดอ่านจากบนลงล่าง หรือล่างขึ้นบนแบบต่อเนื่อง โฟกัสสายตากึ่งกลางจอที่ `max-w-[800px]`
- **บับเบิ้ลตัวละคร / บ็อต (Character Bubble - Apple Charcoal):**
  - **สีพื้นหลัง:** สีถ่านดำด้านนุ่มลึก **`#2f2f35`** (หรือ `#1D1D1F` / `#202024`) มินิมอล ถนอมสายตา และสร้างบรรยากาศห้องลับส่วนตัว
  - **รูปทรง (Border Radius):** ข้อความทั่วไป `rounded-[18px]`, ข้อความสุดท้ายในกลุ่ม (`isLastInGroup`) ขอบมน `rounded-[18px] rounded-bl-[4px]` พร้อม Apple Speech Tail ด้านล่างซ้าย (`bottom-0 -left-[6px] w-[10px] h-[15px] fill-[#2f2f35]`)
  - **ตัวหนังสือ (Typography):** ฟอนต์ขนาด **`text-[15px]`**, น้ำหนักปกติ **`font-normal`** (400), สีขาวนวลตา **`text-white`** (`#EDEDED` / `#F5F5F7`), ระยะความสูงบรรทัด **`leading-[22px]`** (รองรับสระไทยสมบูรณ์แบบไม่ถูกตัด)
  - **มิติและช่องไฟ:** `px-4 py-2 min-h-[38px] flex items-center`, ความกว้างสูงสุด `max-w-[85%] sm:max-w-[75%]`
- **บับเบิ้ลผู้เล่น (User Bubble - Velvet Carmine / Vibrant Passion):**
  - **สีพื้นหลัง:** 
    - Vibrant Gradient: `bg-gradient-to-br from-[#ff0030] to-[#ea0063]`
    - หรือ Velvet Carmine: `bg-gradient-to-br from-[#D22147] via-[#B8163A] to-[#8E0D29]`
  - **รูปทรง (Border Radius):** ข้อความทั่วไป `rounded-[18px]`, ข้อความสุดท้ายในกลุ่ม (`isLastInGroup`) ขอบมน `rounded-[18px] rounded-br-[4px]` พร้อม Apple Speech Tail ด้านล่างขวา (`bottom-0 -right-[6px] w-[10px] h-[15px] fill-[#ea0063]`)
  - **ตัวหนังสือ (Typography):** ฟอนต์ขนาด **`text-[15px]`**, น้ำหนักปกติ **`font-normal`**, สีขาวคมชัด **`text-white`** (`#FFFFFF`), ระยะความสูงบรรทัด **`leading-[22px]`**
  - **มิติและช่องไฟ:** `px-4 py-2 min-h-[38px] flex items-center`, ความกว้างสูงสุด `max-w-[85%] sm:max-w-[75%]`
  - **สถานะการส่ง (Delivery / Read Receipt):** ขนาด `text-[11.5px] sm:text-[12px] font-normal mt-1 mr-1`, ส่งแล้ว `text-white/35`, อ่านแล้ว `text-white/60`
- **ภาษากายและท่าทาง (Whispered Stage Direction Action):**
  - **แนวคิด:** ตัดกล่องสี่เหลี่ยมทึบทิ้ง แนบระนาบซ้ายอย่างโปร่งสบายและมีความกวี
  - **สัญลักษณ์นำสายตา:** ดาวจิ๋วสีเงินมินิมอล **`✦`** ขนาด `text-[10px] text-white/35 shrink-0 mt-1` (คุมโทนขาวดำ)
  - **ตัวหนังสือ (Typography):** ฟอนต์ขนาด **`text-[13.5px] sm:text-[14px]`**, สไตล์ **ตัวเอียง (`italic`)**, น้ำหนัก **`font-normal`**, สีเงินเงาจันทร์ **`#A1A1A8`**, ระยะบรรทัด **`leading-relaxed tracking-wide`**
  - **ช่องไฟ:** `py-0.5 max-w-[92%] sm:max-w-[85%] px-1`
- **บทบรรยายฉากภาพยนตร์ (Cinematic Prologue Voice Over - VO):**
  - **แนวคิด:** ฉากเปิดภาพยนตร์หรือบทกวีบอกเล่าบรรยากาศ ลอยเด่นกึ่งกลางจออย่างทรงพลัง
  - **เส้นขอบฟ้าคู่ (Horizon Hairline Gradient):** ขนาบหัวและท้ายข้อความด้วยเส้นคั่น 1px ที่ค่อยๆ จางละลายออกสองข้าง: `w-full max-w-[280px] sm:max-w-[420px] h-[1px] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent`
  - **ตัวหนังสือ (Typography):** ฟอนต์ขนาด **`text-[15px]`**, สไตล์ **ตัวตรง ไม่เอียง** (Monochromatic Cinematic Clarity), น้ำหนัก **`font-normal`**, สีเงินแสงจันทร์ **`#D6D6DC`**, จัดกึ่งกลาง **`text-center`**, ระยะบรรทัด **`leading-[1.85] tracking-wide`**
  - **ระยะและช่องไฟ (Breathing Space):** ความกว้างสูงสุด `max-w-[580px]`, ระยะพักสายตาบน-ล่าง **`my-12 sm:my-16`** (48px–64px)
- **ระบบระยะห่างและจังหวะลมหายใจ (Chat Room Spacing Architecture):**
  - **สลับผู้พูด (Inter-turn Spacing):** `marginTop = 'mt-4'` (16px)
  - **กลุ่มข้อความต่อเนื่อง (Intra-group Spacing):** `gap-1.5` หรือ `mt-1.5` (6px)
  - **แถบวันที่ (Date Divider):** แคปซูลโปร่งแสงกึ่งกลาง `my-6 sm:my-8`, ฟอนต์ `text-[11px] font-medium text-white/40 tracking-widest uppercase`, บรรจุใน `px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.05]`
  - **ระยะปลอดภัยขอบล่าง (Scroll Safe Bottom Padding):** `pb-[88px] sm:pb-[96px]` ป้องกันข้อความสุดท้ายจมใต้แถบพิมพ์
- **กล่องพิมพ์ข้อความ (Chat Input Bar Pillow Recipe):**
  - **รูปทรงและกระจกฝ้า:** ทรงแคปซูลหมอนมนเต็ม (`rounded-full`), สูง `min-h-[46px] sm:min-h-[48px]`, คลุมกระจกฝ้า `bg-white/[0.06] hover:bg-white/[0.09] focus-within:bg-white/[0.10] backdrop-blur-2xl border border-white/[0.10] focus-within:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]`
  - **ช่องพิมพ์ (Input):** ฟอนต์ **`text-[14px] sm:text-[14.5px]`**, **`font-normal`**, **`tracking-tight`**, สีข้อความ **`text-white`**, ข้อความจำลอง **`placeholder-white/40`**
  - **ปุ่มบวกแอ็กชันเสริม:** ทรงกลม 32px–34px กระจกฝ้า `bg-white/[0.08] hover:bg-white/[0.16] border-white/[0.12] text-white/75` พร้อมป๊อปอัปเมนูสีดำแคนวาส `bg-[#151517]/95`
  - **ปุ่มส่งข้อความ (Carmine Send Button):** ทรงกลม 32px–34px สีแดงคาร์ไมน์เรด `bg-[#EF264C] hover:bg-[#d91d40] text-white border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.30),0_2px_8px_rgba(239,38,76,0.35)]` พร้อมไอคอนลูกศรชี้ขึ้น `ArrowUp size={17} strokeWidth={2.4}`
  - **ปุ่มไมค์ส่งเสียง:** ทรงกลม 32px–34px `bg-white/[0.06] text-white/50` พร้อมไอคอน `AudioLines size={16} strokeWidth={1.8}`
  - **แถบม่าน Dock ลอยติดขอบล่าง:** เกรเดียนต์สีแคนวาส `bg-gradient-to-t from-[#151517] from-75% via-[#151517]/95 to-transparent` (Zero-Glow) กลมกลืนเป็นเนื้อเดียวกับ Canvas ไร้เส้นขอบกระด้าง

### 3.4 Character Selection (YouTube Style)
- **เลย์เอาต์:** Grid Responsive
- **การ์ดตัวละคร:** รูป Thumbnail ใหญ่ ชื่อตัวละครสีขาว คำอธิบายสีเทา

### 3.5 Button System (ระบบปุ่มมาตรฐาน)
- **Primary CTA Button (ปุ่มเด่นหลัก เช่น ปุ่มแชท):**
  - ทรงแคปซูลมนเต็ม (`rounded-full`)
  - พื้นหลังสีแบรนด์หลัก `bg-[#EF264C]` และโฮเวอร์ `hover:bg-[#d91d40]`
  - ตัวหนังสือสีขาวหนาเด่นชัด `font-bold text-[16px] sm:text-[17px]`
  - ไร้เงาฟุ้งแยงตา เพื่อความคมชัดแบบพรีเมียม
- **Standard Secondary Button Recipe ("สไตล์หลักของเรา" เช่น ปุ่ม Load Game):**
  - **รูปทรง:** ทรงกลม (`w-[52px] h-[52px] rounded-full shrink-0`) หรือทรงแคปซูล
  - **ตัวหนังสือ:** สีขาว Primary White (`text-[#F2F2F5]`) ฟอนต์หนาชัดเจน
  - **เส้นขอบ:** สีเทามาตรฐาน `border border-[#2F3336]` และโฮเวอร์สว่างขึ้น `hover:border-white/35`
  - **พื้นหลัง:** **ไม่มีพื้นหลัง (`bg-transparent`)** พร้อมเอฟเฟกต์โปร่งแสงเมื่อโฮเวอร์ `hover:bg-white/[0.08]`
  - **ตัวอย่าง Tailwind:** `w-[52px] h-[52px] rounded-full border border-[#2F3336] bg-transparent hover:bg-white/[0.08] hover:border-white/35 text-[#F2F2F5] transition-all cursor-pointer`
- **Action Icon Buttons (หัวใจ, แชร์, ย้อนกลับ):**
  - ทรงกลมมน ไม่มีกรอบ หรือกรอบโปร่งแสงบางเบา โฮเวอร์ `hover:bg-white/[0.08]` และจังหวะกด `active:scale-90`

### 3.6 Sticky Bottom Dock Recipe (สไตล์ Fashion E-commerce)
สูตรแถบปุ่ม Action ลอยติดด้านล่างสุดของ Pop-up:
1. **สัมผัสขอบล่างจริง (True Bottom Docking):** ตัวกล่อง Pop-up Shell ปรับให้ด้านล่างเป็น `pb-0` โดยย้ายระยะ Padding ด้านล่างไปใส่เฉพาะคอลัมน์ฝั่งซ้ายแทน เพื่อให้แถบปุ่มด้านขวาสามารถ Sticky ชิดติดขอบล่างสุดของตัวกล่องได้จริง
2. **พื้นหลังสีดำสนิทใต้ปุ่ม (Solid Black Underneath):** ด้านหลังและใต้ปุ่มต้องเป็นสีดำสนิท โดยใช้ Gradient ดำไล่ขึ้นไปข้างบน (`bg-gradient-to-t from-black from-70% via-black/95 to-transparent`) เพื่อบังเนื้อหาที่เลื่อนผ่านด้านหลังอย่างหมดจด
3. **ไร้กรอบ (Frameless Elegance):** ไม่ต้องใส่เส้นขอบสี่เหลี่ยมรอบแถบ Sticky เพื่อให้กลืนเป็นเนื้อเดียวกับพื้นหลังของกล่อง
4. **ระยะ Space พอดี:** ตัวปุ่มเว้นระยะห่างจากขอบล่างสุดเพียงเล็กน้อยอย่างสวยงาม (`pb-3.5 sm:pb-4`) ไม่สูงลอยและไม่ติดชิดเกินไป

### 3.7 Header Controls & Coin Balance Pill Recipe (ปุ่มเหรียญและแคปซูลบอกสถานะ)
- **แคปซูลเหรียญคงเหลือ:** ทรงแคปซูลมนเต็ม `h-8 px-2.5 sm:px-3 rounded-full bg-white/[0.06] backdrop-blur-2xl border border-white/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] shrink-0` ไอคอนเหรียญทองคู่กับตัวเลข `text-[12.5px] font-bold text-white/90`
- **แคปซูลรอบทดลองเล่น:** แสดงจุดสีแดงชีพจร `w-2 h-2 rounded-full bg-[#EF264C] animate-pulse shrink-0` นำหน้าข้อความ `1 turns 10 เหรียญ · 5 turns`

### 3.8 Bilateral Symmetrical Panel Toggles & Divider-Docked Nav Toggle
- **ปุ่มเปิด-ปิดพาเนลซ้าย/ขวาในห้องแชท (สมดุลซ้าย-ขวา):** 
  - ทรงกลม 32px (`w-8 h-8 rounded-full`) สวมกระจกฝ้าสูตรมาตรฐานข้อ 3.1
  - ฝั่งซ้าย: ไอคอน `PanelLeftClose` (ย่อแถบแชท) / `PanelLeftOpen` (กางแถบแชท) ขนาด `size={16}`
  - ฝั่งขวา: ไอคอน `PanelRightOpen` (เปิด/ปิด HUD) ขนาด `size={16}`
- **ปุ่มเปิด-ปิด Nav / Sidebar ซ้ายสุด (Divider-Docked Hamburger Toggle):**
  - ทรงกลม 28px (`w-7 h-7`), วางคาบกึ่งกลางเส้นแบ่ง 1px ด้วย `-right-3.5` (-14px)
  - พื้นหลัง `#18181A` ตัดขอบ `border-white/15` ไอคอน Hamburger `Menu size={14} strokeWidth={2}` สากลและไม่สับสนกับพาเนลแชท

### 3.9 Character HUD Cards & Emotional Gauges Recipe (การ์ดข้อมูลและเกจวัดอารมณ์)
- **การ์ดสิ่งแวดล้อม (สถานที่ & สภาพอากาศ):** ขอบมน `rounded-xl`, กระจกฝ้าสูตร 4% ข้อ 3.1, ไอคอนพิน `MapPin text-[#EF264C]` คู่กับไอคอนนาฬิกา `Clock text-white/50`
- **การ์ดชุดและท่าทาง (Outfit, Actor Pose, Player Pose):** เรียง 3 แถว ขอบมน `rounded-xl`, ช่องใส่ไอคอนซ้ายมือ `w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06]`, ข้อความสองชั้น (หัวข้อเทา 11px + สถานะขาว 12px)
- **การ์ดหลอดเกจวัดอารมณ์ (ความสัมพันธ์ & ความปรารถนา):** ตาราง 2 คอลัมน์ `grid grid-cols-2 gap-2`, กระจกฝ้า 4%, ร่องรางสีดำโปร่งแสง `bg-white/[0.06] rounded-full h-1.5`, หลอดความสัมพันธ์เกรเดียนต์ชมพู `from-pink-500 to-rose-400`, หลอดความปรารถนาเกรเดียนต์ส้มแดง `from-orange-500 to-rose-500`

### 3.10 Integrated Character Avatar & Status Capsule Recipe
- **Avatar โปรไฟล์:** ทรงกลมใหญ่ 48px–52px คมชัดระดับ HD มีแหวนแก้ว `ring-1.5 ring-white/18` และจุดสถานะออนไลน์สีเขียวมรกต `w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#151517]`
- **แคปซูลชื่อและสเตตัส (LINE/Facebook Style):** เกยใต้รูปโปรไฟล์ `-mt-2.5`, กระจกฝ้าสูตร 6% ข้อ 3.1, ชื่อตัวละครตัวหนา 14.5px พร้อมลูกศร Chevron และสเตตัสคำพูดประจำวันตัวหนังสือ 11.5px สีเทานวลตา `text-white/60`

### 3.11 The Master Bento Grid Card Suite & Tactile Sensory Tray Architecture (The Soul Creator Studio)
- **ปรัชญา Jony Ive ("ดูไกลๆ รู้ได้เลยว่าเป็นการ์ดเกี่ยวกับอะไร"):** การ์ดและวิดเจ็ตทุกชิ้นบนหน้าจอต้องมี Silhouette ทางกายภาพที่โดดเด่นจำแนกได้ทันทีโดยไม่ต้องเพ่งอ่านตัวหนังสือ
- **ระบบสเกลเรขาคณิต (Mathematical Game Grid):**
  - Base Unit = `165px`, Gap = `16px`, ความกว้าง Container รวม = `1440px`
  - **1x1 (`165px × 165px`):** Starting Atmosphere (สภาพอากาศ/เวลา), Player Stance (ท่าทีผู้เล่น ในฝั่ง World Blueprint)
  - **2x1 (`346px × 165px`):** Signature Postures (ม้วนฟิล์มสไลด์ Kinematic Slide Reel `< 01/03 >` พร้อมถาดอ่านวรรณกรรมเต็ม 100% ไร้คำว่า Default)
  - **2x2 (`346px × 346px`):** Master Cards — Identity & Soul (แผ่นป้ายจารึกเกียรติยศ), Wardrobe Closet (ราวแขวนผ้าโลหะสมจริง), Anatomy & Physique (ผังพิมพ์เขียวกายวิภาค 4 เสาหลัก), The 3-Tier Glass Chamber (การ์ดเดี่ยวมาสเตอร์ประจำหมวดจิตวิทยา: โล่ 🛡️ ฟ้า, สายฟ้า ⚡ เหลือง, หัวใจ ❤️ ชมพู)
- **การจัดหมวดหมู่หลักบนผืนผ้าใบ (Master Canvas Chapters):**
  - **หมวดที่ 1: รูปลักษณ์และสไตล์ (Appearance & Physicality):** การ์ดอัตลักษณ์ (2x2), ตู้เสื้อผ้า (2x2), สรีระและจุดเด่น (2x2), ท่วงท่าประจำตัว (2x1)
  - **หมวดที่ 2: จิตวิทยาและตัวตนเบื้องลึก (Mind & Shadow):** การ์ดเดี่ยวมาสเตอร์ The 3-Tier Glass Chamber (2x2) บรรจุ 3 ชั้นกระจกฝ้าครบถ้วนตามข้อมูลจริง 100% ไร้เศษการ์ดย่อย ขนาดพอดีกริด 2x2
  - หัวข้อหมวดหมู่ใช้ข้อความไทยเรียบหรู คลีน ไม่เทอะทะ คั่นด้วยเส้น Hairline Gradient บางเบา
- **สถาปัตยกรรมถาดสัมผัสเนื้อหา (The Tactile Sensory Tray System):**
  - **Single Front Canvas Rule:** ทุกฟังก์ชันและข้อมูลเชิงลึกต้องทำงานบนหน้าแรก 100% ห้ามมีหน้าสอง ห้ามพลิกการ์ด และห้ามใช้ Hover Popover ลอยบดบังการ์ดอื่น
  - **Subtractive Elegance:** ปุ่มหมวดหมู่ด้านบนแสดงเฉพาะไอคอนและชื่อหมวดสั้นๆ คลีนๆ (เช่น `[Eye] ดวงตา & ใบหน้า`) **ห้ามใส่เฉลยเนื้อหาเข้าไปในปุ่มเลือก**
  - **Organic Human Continuity:** สรีระร่างกายเชื่อมต่อกันเป็นสิ่งมีชีวิตหนึ่งเดียวด้วยเส้น Hairline 1px บางเบา (`bg-white/[0.06]`) คั่นระหว่าง 4 เสาหลักกับจุดเด่นเฉพาะตัว ไร้หัวข้อย่อยหนาเตอะที่ทำให้รู้สึกเหมือนคนละคน
  - **Cross-Fading Sensory Tray:** ถาดกระจกรมควันด้านล่าง (`bg-black/40 backdrop-blur-xl border border-white/[0.06] shadow-[inset_0_1.5px_3px]`) เฟดเปลี่ยนเนื้อหาด้วย `animate-fade-in-scale` แสดงไอคอน + ชื่อหมวด + หัวข้อเด่น + คำบรรยายวรรณกรรมเต็มพารากราฟ
