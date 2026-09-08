import { useState, useEffect } from 'react'
import { X, Mail, Sparkles } from 'lucide-react'
import type { AuthModalProps } from '../types'

export function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  onGoogleSuccess,
  onEmailSubmit,
  isSubmitting = false,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [prevMode, setPrevMode] = useState(initialMode)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  if (initialMode !== prevMode || isOpen !== prevIsOpen) {
    setPrevMode(initialMode)
    setPrevIsOpen(isOpen)
    setMode(initialMode)
  }

  // ปิดด้วยปุ่ม Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    onEmailSubmit?.(email.trim(), mode)
  }

  const handleGoogleClick = () => {
    // ส่ง demo credential หรือ trigger google auth callback
    onGoogleSuccess?.('demo_google_credential_token')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* 1. Backdrop มืดโปร่งแสง พร้อมกระจกฝ้า */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-200" 
      />

      {/* 2. Modal Box Shell (Glassmorphism Dark) */}
      <div className="relative w-full max-w-[440px] bg-[#121214]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-10 animate-in fade-in zoom-in-95 duration-200 select-none">
        {/* ปุ่มปิด (X) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-app-secondary hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={18} strokeWidth={2} />
        </button>

        {/* Header: โลโก้ และข้อความต้อนรับ */}
        <div className="text-center pt-2 pb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#EF264C]/20 to-transparent border border-[#EF264C]/30 mb-3 shadow-inner">
            <Sparkles className="text-[#EF264C]" size={24} />
          </div>
          <h2 className="text-[24px] sm:text-[26px] font-bold text-app-primary tracking-tight">
            ยินดีต้อนรับสู่ Maomoi AI
          </h2>
          <p className="text-[13.5px] text-app-secondary mt-1 max-w-[280px] mx-auto leading-relaxed">
            {mode === 'login' 
              ? 'เข้าสู่ระบบเพื่อบันทึกเรื่องราวและความทรงจำของคุณ' 
              : 'สมัครสมาชิกเพื่อเริ่มบทสนทนาที่ไร้ขีดจำกัด'}
          </p>
        </div>

        {/* 3. ปุ่มโซเชียล: Google One-Click Sign-In (ปุ่มหลักเด่นสุด) */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isSubmitting}
            className="w-full h-[48px] sm:h-[50px] rounded-full bg-white hover:bg-[#F2F2F5] text-zinc-900 font-semibold text-[15px] flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            {/* Google 4-Color SVG Icon */}
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>ดำเนินการต่อด้วย Google</span>
          </button>
        </div>

        {/* 4. เส้นคั่น "หรือ (OR)" */}
        <div className="flex items-center gap-3 my-5">
          <div className="h-[1px] flex-1 bg-white/10" />
          <span className="text-[11px] font-bold text-app-secondary uppercase tracking-widest px-1">
            หรือ
          </span>
          <div className="h-[1px] flex-1 bg-white/10" />
        </div>

        {/* 5. ฟอร์มกรอกอีเมล */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="กรอกอีเมลของคุณ (เช่น user@gmail.com)"
              className="w-full h-[46px] sm:h-[48px] bg-white/5 border border-white/10 focus:border-[#EF264C] focus:bg-black/60 rounded-full px-5 text-app-primary placeholder:text-app-secondary/60 text-[14px] sm:text-[14.5px] outline-none transition-all"
            />
            <Mail size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-app-secondary/50 pointer-events-none" />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className="w-full h-[46px] sm:h-[48px] rounded-full bg-[#EF264C] hover:bg-[#d91d40] disabled:opacity-50 text-white font-bold text-[15px] shadow-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
          >
            {isSubmitting ? (
              <span className="inline-block animate-spin mr-2">⏳</span>
            ) : null}
            <span>{mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</span>
          </button>
        </form>

        {/* 6. สลับโหมด เข้าสู่ระบบ ↔ สมัครสมาชิก */}
        <div className="text-center mt-5">
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-[13px] text-app-secondary hover:text-white transition-colors cursor-pointer"
          >
            {mode === 'login' ? (
              <>ยังไม่มีบัญชีผู้ใช้? <span className="text-[#EF264C] font-semibold underline underline-offset-4 ml-1">สมัครสมาชิก</span></>
            ) : (
              <>มีบัญชีผู้ใช้อยู่แล้ว? <span className="text-[#EF264C] font-semibold underline underline-offset-4 ml-1">เข้าสู่ระบบ</span></>
            )}
          </button>
        </div>

        {/* 7. ข้อตกลงและเงื่อนไข (18+) */}
        <p className="text-[11px] text-app-secondary/60 text-center leading-relaxed mt-6 pt-4 border-t border-white/5">
          การดำเนินการต่อถือว่าคุณยืนยันว่ามีอายุ 18 ปีขึ้นไป และยอมรับ{' '}
          <span className="text-app-secondary underline cursor-pointer hover:text-white">ข้อกำหนดการให้บริการ</span>{' '}
          และ{' '}
          <span className="text-app-secondary underline cursor-pointer hover:text-white">นโยบายความเป็นส่วนตัว</span>
        </p>
      </div>
    </div>
  )
}

export default AuthModal
