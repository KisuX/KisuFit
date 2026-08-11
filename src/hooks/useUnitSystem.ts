import { useLiveQuery } from 'dexie-react-hooks'
import { db, settingKey } from '../db/db'
import { useProfile } from '../context/ProfileContext'
import { useLanguage } from '../i18n/LanguageContext'
import { kgToDisplay, displayToKg, weightStepFor, type WeightUnit } from '../utils/units'

/** Bu profil için aktif ağırlık birimi (kg/lb) + kg<->birim dönüşüm yardımcıları. */
export function useUnitSystem() {
  const { profileId } = useProfile()
  const { t } = useLanguage()
  const setting = useLiveQuery(() => db.settings.get(settingKey(profileId, 'unitSystem')), [profileId])
  const unit: WeightUnit = setting?.value === 'lb' ? 'lb' : 'kg'

  return {
    unit,
    label: t(unit === 'lb' ? 'common.lb' : 'common.kg'),
    toDisplay: (kg: number) => kgToDisplay(kg, unit),
    toKg: (display: number) => displayToKg(display, unit),
    step: weightStepFor(unit),
  }
}
