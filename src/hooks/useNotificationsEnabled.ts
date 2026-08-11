import { useLiveQuery } from 'dexie-react-hooks'
import { db, settingKey } from '../db/db'
import { useProfile } from '../context/ProfileContext'

/** Bildirimler bu profil için açık mı (Ayarlar > Bildirimler toggle'ı). */
export function useNotificationsEnabled(): boolean {
  const { profileId } = useProfile()
  const setting = useLiveQuery(() => db.settings.get(settingKey(profileId, 'notificationsEnabled')), [profileId])
  return setting?.value === 'true'
}
