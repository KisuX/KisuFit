import type { ReactNode } from 'react'
import { Dumbbell, Mail, Shield, FileText, Copyright } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { useLanguage } from '../../i18n/LanguageContext'

const APP_VERSION = '1.0.0'

export function AboutPage() {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title={t('about.title')} />

      <div className="flex flex-col gap-5 px-4 pt-4 pb-10">
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)]">
            <Dumbbell size={28} className="text-[var(--color-accent)]" />
          </div>
          <div className="text-lg font-bold">KisuFit</div>
          <p className="text-sm text-[var(--color-muted)]">{t('about.tagline')}</p>
          <p className="text-xs text-[var(--color-muted)]">
            {t('about.version')} {APP_VERSION}
          </p>
        </div>

        <AboutSection icon={<Shield size={16} />} title={t('about.dataTitle')} body={t('about.dataBody')} />
        <AboutSection icon={<FileText size={16} />} title={t('about.privacyTitle')} body={t('about.privacyBody')} />
        <AboutSection icon={<FileText size={16} />} title={t('about.termsTitle')} body={t('about.termsBody')} />
        <AboutSection icon={<Copyright size={16} />} title={t('about.copyrightTitle')} body={t('about.copyrightBody')} />

        <div className="rounded-2xl bg-[var(--color-surface)] p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Mail size={16} /> {t('about.contact')}
          </div>
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">{t('about.contactBody')}</p>
        </div>
      </div>
    </div>
  )
}

function AboutSection({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-[var(--color-surface)] p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        {icon} {title}
      </div>
      <p className="text-sm leading-relaxed text-[var(--color-muted)]">{body}</p>
    </div>
  )
}
