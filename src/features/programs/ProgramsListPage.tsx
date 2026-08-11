import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Dumbbell, ChevronRight } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { db } from '../../db/db'
import { Fab } from '../../components/common/Fab'
import { formatDateLong } from '../../utils/format'
import { useProfile } from '../../context/ProfileContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { NewProgramChooserSheet } from './NewProgramChooserSheet'
import { TemplatePickerSheet } from './TemplatePickerSheet'
import type { ResolvedTemplate } from '../../data/programTemplates'
import type { EditorContext } from './editorContext'

export function ProgramsListPage() {
  const navigate = useNavigate()
  const { profileId } = useProfile()
  const { t, locale } = useLanguage()
  const [chooserOpen, setChooserOpen] = useState(false)
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false)

  function selectTemplate(template: ResolvedTemplate) {
    const editorContext: EditorContext = {
      name: t(template.titleKey),
      configs: template.exercises.map((e) => ({
        exerciseId: e.exerciseId,
        sets: e.sets,
        reps: e.reps,
        weight: e.weight,
        restSeconds: e.restSeconds,
        durationSeconds: 0,
        incline: null,
      })),
    }
    setTemplatePickerOpen(false)
    navigate('/programlar/editor', { state: { editorContext } })
  }

  const programs = useLiveQuery(async () => {
    const all = await db.programs.where('profileId').equals(profileId).sortBy('createdAt')
    all.reverse()
    return Promise.all(
      all.map(async (p) => {
        const exerciseCount = await db.programExercises.where('programId').equals(p.id).count()
        const sessions = await db.workoutSessions
          .where('programId')
          .equals(p.id)
          .filter((s) => s.finishedAt !== null)
          .toArray()
        const last = sessions.sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))[0]
        return { ...p, exerciseCount, lastDate: last?.finishedAt ?? null }
      }),
    )
  }, [profileId])

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-1 text-2xl font-bold">{t('programsList.title')}</h1>
      <p className="mb-5 text-sm text-[var(--color-muted)]">{t('programsList.subtitle')}</p>

      {programs && programs.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface)]">
            <Dumbbell size={28} className="text-[var(--color-muted)]" />
          </div>
          <p className="text-sm text-[var(--color-muted)]">
            {t('programsList.emptyState')}
            <br />
            {t('programsList.emptyStateHint')}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {programs?.map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(`/programlar/${p.id}`)}
            className="flex items-center justify-between rounded-2xl bg-[var(--color-surface)] px-4 py-4 text-left active:opacity-80"
          >
            <div>
              <div className="font-semibold">{p.name}</div>
              <div className="mt-1 text-xs text-[var(--color-muted)]">
                {p.exerciseCount} {t('programsList.exercises')} ·{' '}
                {p.lastDate ? formatDateLong(p.lastDate, locale) : t('programsList.neverDone')}
              </div>
            </div>
            <ChevronRight size={20} className="text-[var(--color-muted)]" />
          </button>
        ))}
      </div>

      <Fab onClick={() => setChooserOpen(true)} icon={<Plus size={26} />} aria-label={t('programsList.newProgram')} />

      <AnimatePresence>
        {chooserOpen && (
          <NewProgramChooserSheet
            onClose={() => setChooserOpen(false)}
            onScratch={() => {
              setChooserOpen(false)
              navigate('/programlar/hareketler')
            }}
            onTemplate={() => {
              setChooserOpen(false)
              setTemplatePickerOpen(true)
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {templatePickerOpen && (
          <TemplatePickerSheet onClose={() => setTemplatePickerOpen(false)} onSelect={selectTemplate} />
        )}
      </AnimatePresence>
    </div>
  )
}
