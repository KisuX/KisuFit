import { useEffect, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { db, ensureSeeded } from './db/db'
import { getActiveProfileId } from './db/profile'
import { ProfileProvider } from './context/ProfileContext'
import { LanguageProvider } from './i18n/LanguageContext'
import { ProfileGatePage } from './features/profile/ProfileGatePage'
import { AboutPage } from './features/settings/AboutPage'
import { HomePage } from './features/home/HomePage'
import { ProgramsListPage } from './features/programs/ProgramsListPage'
import { ExercisePickerPage } from './features/programs/ExercisePickerPage'
import { ProgramEditorPage } from './features/programs/ProgramEditorPage'
import { ProgramDetailPage } from './features/programs/ProgramDetailPage'
import { WorkoutSessionPage } from './features/programs/WorkoutSessionPage'
import { WorkoutSummaryPage } from './features/programs/WorkoutSummaryPage'
import { WeightPage } from './features/weight/WeightPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { WorkoutHistoryPage } from './features/history/WorkoutHistoryPage'
import { WorkoutSessionDetailPage } from './features/history/WorkoutSessionDetailPage'
import { ExerciseHistoryPage } from './features/history/ExerciseHistoryPage'

type Boot = { status: 'loading' } | { status: 'gate' } | { status: 'ready'; profileId: string; profileName: string }

function App() {
  const [boot, setBoot] = useState<Boot>({ status: 'loading' })

  useEffect(() => {
    ensureSeeded().then(async () => {
      const activeId = getActiveProfileId()
      const profile = activeId ? await db.profiles.get(activeId) : undefined
      if (profile) {
        setBoot({ status: 'ready', profileId: profile.id, profileName: profile.name })
      } else {
        setBoot({ status: 'gate' })
      }
    })
  }, [])

  if (boot.status === 'loading') return null

  if (boot.status === 'gate') {
    return (
      <LanguageProvider>
        <ProfileGatePage onReady={(profileId, profileName) => setBoot({ status: 'ready', profileId, profileName })} />
      </LanguageProvider>
    )
  }

  return (
    <LanguageProvider>
      <ProfileProvider initialProfileId={boot.profileId} initialProfileName={boot.profileName}>
        <HashRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/programlar" element={<ProgramsListPage />} />
              <Route path="/programlar/hareketler" element={<ExercisePickerPage />} />
              <Route path="/programlar/editor" element={<ProgramEditorPage />} />
              <Route path="/programlar/:id" element={<ProgramDetailPage />} />
              <Route path="/antrenman/:sessionId" element={<WorkoutSessionPage />} />
              <Route path="/antrenman/:sessionId/ozet" element={<WorkoutSummaryPage />} />
              <Route path="/kilo" element={<WeightPage />} />
              <Route path="/ayarlar" element={<SettingsPage />} />
              <Route path="/ayarlar/hakkinda" element={<AboutPage />} />
              <Route path="/gecmis" element={<WorkoutHistoryPage />} />
              <Route path="/gecmis/:sessionId" element={<WorkoutSessionDetailPage />} />
              <Route path="/hareket/:exerciseId" element={<ExerciseHistoryPage />} />
            </Route>
          </Routes>
        </HashRouter>
      </ProfileProvider>
    </LanguageProvider>
  )
}

export default App
