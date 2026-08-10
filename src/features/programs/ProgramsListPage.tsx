import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Dumbbell, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../db/db'
import { Fab } from '../../components/common/Fab'
import { formatDateLong } from '../../utils/format'

export function ProgramsListPage() {
  const navigate = useNavigate()

  const programs = useLiveQuery(async () => {
    const all = await db.programs.orderBy('createdAt').reverse().toArray()
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
  }, [])

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-1 text-2xl font-bold">Programlar</h1>
      <p className="mb-5 text-sm text-[var(--color-muted)]">Antrenman programlarını oluştur ve takip et</p>

      {programs && programs.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface)]">
            <Dumbbell size={28} className="text-[var(--color-muted)]" />
          </div>
          <p className="text-sm text-[var(--color-muted)]">
            Henüz bir programın yok.
            <br />
            Sağ alttaki + ile ilk programını oluştur.
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
                {p.exerciseCount} hareket · {p.lastDate ? formatDateLong(p.lastDate) : 'Henüz yapılmadı'}
              </div>
            </div>
            <ChevronRight size={20} className="text-[var(--color-muted)]" />
          </button>
        ))}
      </div>

      <Fab
        onClick={() => navigate('/programlar/hareketler')}
        icon={<Plus size={26} />}
        aria-label="Yeni program oluştur"
      />
    </div>
  )
}
