import { useEffect, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ensureSeeded } from './db/db'
import { HomePage } from './features/home/HomePage'
import { ProgramsListPage } from './features/programs/ProgramsListPage'
import { ExercisePickerPage } from './features/programs/ExercisePickerPage'
import { ProgramEditorPage } from './features/programs/ProgramEditorPage'
import { ProgramDetailPage } from './features/programs/ProgramDetailPage'
import { WorkoutSessionPage } from './features/programs/WorkoutSessionPage'
import { WorkoutSummaryPage } from './features/programs/WorkoutSummaryPage'
import { WeightPage } from './features/weight/WeightPage'
import { SettingsPage } from './features/settings/SettingsPage'

function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    ensureSeeded().then(() => setReady(true))
  }, [])

  if (!ready) return null

  return (
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
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
