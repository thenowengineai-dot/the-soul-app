/**
 * imageUtils.ts
 * เครื่องมือย่อและแปลงไฟล์รูปภาพฝั่ง Client-side เป็น WebP/JPEG Data URL
 * รักษาความคมชัดระดับ HD (Max 1200px) แต่ได้ขนาดไฟล์ที่เบามาก (50-120KB) เพื่อให้โหลดไวและบันทึกสู่ Database ได้อย่างราบรื่น
 */

export async function compressAndConvertImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // ตรวจสอบว่าเป็นไฟล์รูปภาพจริงหรือไม่
    if (!file.type.startsWith('image/')) {
      reject(new Error('ไฟล์ที่เลือกไม่ใช่รูปภาพที่รองรับ'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('ไม่สามารถประมวลผลรูปภาพได้'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // คำนวณอัตราส่วนเพื่อย่อขนาดให้ไม่เกิน maxWidth / maxHeight
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = Math.min(height, maxHeight);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback ส่ง base64 เดิมหาก Canvas ใช้ไม่ได้
          resolve(reader.result as string);
          return;
        }

        // วาดภาพลง Canvas ด้วยการเกลี่ยภาพให้เนียน
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // ลองส่งออกเป็น WebP หากเบราว์เซอร์รองรับ หรือ Fallback เป็น JPEG
        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.startsWith('data:image/webp')) {
            resolve(webpData);
            return;
          }
        } catch {
          // ignore
        }

        resolve(canvas.toDataURL('image/jpeg', quality));
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * แปลงชุดไฟล์รูปภาพหลายไฟล์พร้อมกันแบบขนาน
 */
export async function processMultipleImages(
  files: FileList | File[],
  maxWidth: number = 1200,
  maxHeight: number = 1200
): Promise<string[]> {
  const fileArray = Array.from(files);
  const tasks = fileArray.map((file) => compressAndConvertImage(file, maxWidth, maxHeight));
  return Promise.all(tasks);
}
