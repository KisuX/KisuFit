import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/maewoboj'

interface FeedbackSheetProps {
  onClose: () => void
}

type Status = 'idle' | 'sending' | 'success' | 'error'

export function FeedbackSheet({ onClose }: FeedbackSheetProps) {
  const { t } = useLanguage()
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  async function send() {
    if (!message.trim() || status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), email: email.trim() || undefined }),
      })
      if (!res.ok) throw new Error('request failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60" onClick={onClose}>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl bg-[var(--color-surface)] p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-border)]" />

        {status === 'success' ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-success)]/15">
              <CheckCircle2 size={28} className="text-[var(--color-success)]" />
            </div>
            <p className="text-sm font-medium">{t('feedback.success')}</p>
            <button onClick={onClose} className="mt-2 w-full rounded-xl bg-[var(--color-surface-2)] py-3 font-medium">
              {t('common.close')}
            </button>
          </div>
        ) : (
          <>
            <h2 className="mb-1 text-lg font-semibold">{t('feedback.title')}</h2>
            <p className="mb-4 text-sm text-[var(--color-muted)]">{t('feedback.subtitle')}</p>

            <label className="mb-1.5 block text-xs font-medium text-[var(--color-muted)] uppercase">
              {t('feedback.messageLabel')}
            </label>
            <textarea
              autoFocus
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('feedback.messagePlaceholder')}
              rows={4}
              className="mb-4 w-full resize-none rounded-xl bg-[var(--color-surface-2)] px-4 py-3 text-[15px] outline-none placeholder:text-[var(--color-muted)] focus:ring-1 focus:ring-[var(--color-accent)]"
            />

            <label className="mb-1.5 block text-xs font-medium text-[var(--color-muted)] uppercase">
              {t('feedback.emailLabel')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('feedback.emailPlaceholder')}
              className="mb-4 w-full rounded-xl bg-[var(--color-surface-2)] px-4 py-3 text-[15px] outline-none placeholder:text-[var(--color-muted)] focus:ring-1 focus:ring-[var(--color-accent)]"
            />

            {status === 'error' && <p className="mb-3 text-xs text-red-400">{t('feedback.error')}</p>}

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 rounded-xl bg-[var(--color-surface-2)] py-3 font-medium">
                {t('common.cancel')}
              </button>
              <button
                onClick={send}
                disabled={!message.trim() || status === 'sending'}
                className="flex-1 rounded-xl bg-[var(--color-accent)] py-3 font-semibold text-white disabled:opacity-40"
              >
                {status === 'sending' ? t('feedback.sending') : t('feedback.send')}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
