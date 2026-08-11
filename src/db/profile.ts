import { ACTIVE_PROFILE_STORAGE_KEY } from './db'

export function getActiveProfileId(): string | null {
  return localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY)
}

export function setActiveProfileId(id: string) {
  localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, id)
}

export function clearActiveProfileId() {
  localStorage.removeItem(ACTIVE_PROFILE_STORAGE_KEY)
}
