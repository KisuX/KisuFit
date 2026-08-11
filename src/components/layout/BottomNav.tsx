import { NavLink } from 'react-router-dom'
import { Dumbbell, House, Scale } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'

export function BottomNav() {
  const { t } = useLanguage()
  const items = [
    { to: '/', label: t('nav.home'), icon: House },
    { to: '/programlar', label: t('nav.programs'), icon: Dumbbell },
    { to: '/kilo', label: t('nav.weight'), icon: Scale },
  ]

  return (
    <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-[480px] -translate-x-1/2 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium ${
                isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'
              }`
            }
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
