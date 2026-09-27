export interface User {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput extends LoginInput {
  name: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  userId: string
}

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  categoryId: string
  date: string
  category: Category | null
}

