import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'

interface AppState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'kana-master-storage' }
  )
)
