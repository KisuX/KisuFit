import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../i18n/LanguageContext'

interface PageHeaderProps {
  title: string
  onBack?: () => void
  right?: ReactNode
}

export function PageHeader({ title, onBack, right }: PageHeaderProps) {
  const navigate = useNavigate()
  const { t } = useLanguage()
  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
      <button
        type="button"
        onClick={() => (onBack ? onBack() : navigate(-1))}
        className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text)] active:bg-[var(--color-surface)]"
        aria-label={t('common.back')}
      >
        <ChevronLeft size={22} />
      </button>
      <h1 className="flex-1 truncate text-[17px] font-semibold">{title}</h1>
      {right}
    </header>
  )
}
