import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'

const TAB_PATHS = ['/', '/programlar', '/kilo']

export function AppShell() {
  const { pathname } = useLocation()
  const showNav = TAB_PATHS.includes(pathname)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-[var(--color-bg)] shadow-2xl">
      <main className={`flex-1 ${showNav ? 'pb-24' : 'pb-6'}`}>
        <Outlet />
      </main>
      {showNav && <BottomNav />}
    </div>
  )
}
