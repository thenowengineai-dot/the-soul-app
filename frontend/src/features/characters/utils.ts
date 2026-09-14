/**
 * formatCompactNumber: แปลงตัวเลขยอดวิวและยอดแชทเป็นระบบย่อ k / M
 * เช่น:
 * - 170,000 -> 170k
 * - 91,202 -> 91.2k
 * - 5,830,000 -> 5.8M
 * - 3.45 ล้าน -> 3.5M
 * - 850 -> 850
 */
export function formatCompactNumber(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === '') return '0';

  if (typeof value === 'number') {
    if (value >= 1_000_000) {
      const m = value / 1_000_000;
      return `${m >= 10 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (value >= 1_000) {
      const k = value / 1_000;
      return `${k >= 100 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, '')}k`;
    }
    return value.toString();
  }

  const str = String(value).trim();

  // ถ้าถูกย่อมาอยู่แล้ว เช่น "170k", "5.8M", "120K" ให้ส่งกลับทันที
  if (/^[0-9.]+\s*[kKmMbB]$/.test(str)) {
    return str;
  }

  // กรณีมีคำว่า "ล้าน" เช่น "3.45 ล้าน"
  if (str.includes('ล้าน')) {
    const numPart = parseFloat(str.replace(/[^0-9.]/g, ''));
    if (!isNaN(numPart)) {
      return `${numPart >= 10 ? Math.round(numPart) : numPart.toFixed(1).replace(/\.0$/, '')}M`;
    }
    return str;
  }

  // ตัวเลขที่มี comma เช่น "5,830,000" หรือ "170,000"
  const cleanNum = parseFloat(str.replace(/,/g, '').trim());
  if (!isNaN(cleanNum)) {
    if (cleanNum >= 1_000_000) {
      const m = cleanNum / 1_000_000;
      return `${m >= 10 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (cleanNum >= 1_000) {
      const k = cleanNum / 1_000;
      return `${k >= 100 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, '')}k`;
    }
    return cleanNum.toString();
  }

  return str;
}
