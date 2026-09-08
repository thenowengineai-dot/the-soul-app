import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { AuthModalProps } from '../types'
import { GOOGLE_CLIENT_ID } from '../../../config'

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string
            callback: (res: { credential?: string }) => void
            auto_select?: boolean
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: string
              size?: string
              type?: string
              shape?: string
              text?: string
              logo_alignment?: string
              width?: number
            }
          ) => void
        }
      }
    }
  }
}

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
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const googleBtnContainerRef = useRef<HTMLDivElement>(null)

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

  // Google Identity Services (GIS) Button Initialization
  useEffect(() => {
    if (!isOpen) return

    const setupGoogleBtn = () => {
      if (window.google?.accounts?.id && googleBtnContainerRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (res: { credential?: string }) => {
              if (res.credential) {
                onGoogleSuccess?.(res.credential)
              }
            },
            auto_select: false,
          })

          googleBtnContainerRef.current.innerHTML = ''
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'pill',
            text: 'continue_with',
            logo_alignment: 'left',
            width: Math.min(googleBtnContainerRef.current.clientWidth || 336, 340),
          })
          setIsGoogleLoaded(true)
        } catch (e) {
          console.warn('[AUTH] Error initializing Google Sign-In button:', e)
        }
      }
    }

    if (window.google?.accounts?.id) {
      setupGoogleBtn()
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer)
          setupGoogleBtn()
        }
      }, 200)
      return () => clearInterval(timer)
    }
  }, [isOpen, onGoogleSuccess])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    onEmailSubmit?.(email.trim(), mode)
  }

  const handleGoogleFallbackClick = () => {
    onGoogleSuccess?.('demo_google_credential_token')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* 1. Backdrop มืดโปร่งแสง พร้อมกระจกฝ้า */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-200" 
      />

      {/* 2. Modal Box Shell สไตล์ Minimal ตามรูปเรฟ */}
      <div className="relative w-full max-w-[400px] bg-[#121214]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-7 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.85)] z-10 animate-in fade-in zoom-in-95 duration-200 select-none text-center">
        {/* ปุ่มปิด (X) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-app-secondary hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={18} strokeWidth={2} />
        </button>

        {/* 1. โลโก้แบรนด์ Maomoi AI ลอยเด่นตรงกลาง ไร้พื้นหลัง */}
        <div className="flex justify-center mb-3 pt-1">
          <img src="/logo/logo.png" alt="Maomoi AI" className="w-[56px] h-[56px] object-contain" />
        </div>

        {/* 2. ข้อความต้อนรับ Welcome back / ยินดีต้อนรับกลับ */}
        <h2 className="text-[26px] sm:text-[28px] font-bold text-[#F2F2F5] tracking-tight mb-6">
          {mode === 'login' ? 'ยินดีต้อนรับกลับ' : 'สร้างบัญชีใหม่'}
        </h2>

        {/* 3. ปุ่มโซเชียล: Google One-Click แท้ผ่าน Google Identity Services */}
        <div className="w-full flex justify-center min-h-[48px] sm:min-h-[50px] mb-1">
          <div ref={googleBtnContainerRef} className={`w-full flex justify-center ${!isGoogleLoaded ? 'hidden' : ''}`} />
          {!isGoogleLoaded && (
            <button
              type="button"
              onClick={handleGoogleFallbackClick}
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
          )}
        </div>

        {/* 4. เส้นคั่นหรือคำว่า "หรือ" ตามเรฟ */}
        <div className="text-center my-4 text-[13px] text-[#ACACB2]">
          หรือ
        </div>

        {/* 5. กล่องกรอกอีเมลทรงสี่เหลี่ยมมุมมนตามรูปเรฟ */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-2xl border border-[#2F3336] bg-[#1D1D1F] px-4 py-3 focus-within:border-[#EF264C] transition-colors text-left">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ระบุอีเมลของคุณ (เช่น user@gmail.com)"
              className="w-full bg-transparent text-[#F2F2F5] text-[15px] outline-none p-0 border-none placeholder:text-[#ACACB2]/50 font-normal"
            />
          </div>

          {/* ปุ่ม Continue / ดำเนินการต่อ */}
          <button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className="w-full h-[48px] rounded-full bg-[#EF264C] hover:bg-[#d91d40] disabled:opacity-50 text-white font-bold text-[15px] shadow-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
          >
            {isSubmitting ? (
              <span className="inline-block animate-spin mr-2">⏳</span>
            ) : null}
            <span>ดำเนินการต่อ</span>
          </button>
        </form>

        {/* 6. ข้อตกลงการใช้งานตามเรฟ */}
        <p className="text-[12px] text-[#ACACB2]/80 mt-5 leading-normal">
          การดำเนินการต่อ ถือว่าคุณยอมรับ{' '}
          <span className="underline cursor-pointer hover:text-[#F2F2F5]">ข้อกำหนด</span>{' '}
          และ{' '}
          <span className="underline cursor-pointer hover:text-[#F2F2F5]">นโยบายความเป็นส่วนตัว</span>
        </p>

        {/* 7. สลับโหมด เข้าสู่ระบบ ↔ สมัครสมาชิก */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-[13px] text-[#ACACB2] hover:text-[#F2F2F5] transition-colors cursor-pointer"
          >
            {mode === 'login' ? (
              <>ยังไม่มีบัญชีผู้ใช้? <span className="text-[#EF264C] font-semibold underline underline-offset-4 ml-1">สมัครสมาชิก</span></>
            ) : (
              <>มีบัญชีผู้ใช้อยู่แล้ว? <span className="text-[#EF264C] font-semibold underline underline-offset-4 ml-1">เข้าสู่ระบบ</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
