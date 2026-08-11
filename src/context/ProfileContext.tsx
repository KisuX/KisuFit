import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { setActiveProfileId } from '../db/profile'

interface ProfileContextValue {
  profileId: string
  profileName: string
  switchProfile: (id: string, name: string) => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

interface ProfileProviderProps {
  initialProfileId: string
  initialProfileName: string
  children: ReactNode
}

export function ProfileProvider({ initialProfileId, initialProfileName, children }: ProfileProviderProps) {
  const [profileId, setProfileId] = useState(initialProfileId)
  const [profileName, setProfileName] = useState(initialProfileName)

  const value = useMemo<ProfileContextValue>(
    () => ({
      profileId,
      profileName,
      switchProfile: (id: string, name: string) => {
        setActiveProfileId(id)
        setProfileId(id)
        setProfileName(name)
      },
    }),
    [profileId, profileName],
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider')
  return ctx
}
