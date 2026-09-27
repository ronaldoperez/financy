import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apolloClient } from '@/lib/graphql/apollo'
import { LOGIN, REGISTER } from '@/lib/graphql/mutations'
import type { LoginInput, RegisterInput, User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (input: LoginInput) => Promise<void>
  signup: (input: RegisterInput) => Promise<void>
  logout: () => void
}

type AuthPayload = { token: string; refreshToken: string; user: User }

export const useAuthStore = create<AuthState>()(persist((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async (input) => {
    const result = await apolloClient.mutate<{ login: AuthPayload }, { data: LoginInput }>({ mutation: LOGIN, variables: { data: input } })
    const auth = result.data?.login
    if (!auth) throw new Error('Não foi possível entrar. Tente novamente.')
    set({ user: auth.user, token: auth.token, isAuthenticated: true })
  },
  signup: async (input) => {
    const result = await apolloClient.mutate<{ register: AuthPayload }, { data: RegisterInput }>({ mutation: REGISTER, variables: { data: input } })
    const auth = result.data?.register
    if (!auth) throw new Error('Não foi possível criar sua conta. Tente novamente.')
    set({ user: auth.user, token: auth.token, isAuthenticated: true })
  },
  logout: () => {
    set({ user: null, token: null, isAuthenticated: false })
    void apolloClient.clearStore()
  },
}), { name: 'financy-auth' }))
