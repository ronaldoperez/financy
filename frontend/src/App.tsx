import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { AuthPage } from '@/pages/AuthPage'
import { AccountPage, CategoriesPage, DashboardPage, TransactionsPage } from '@/pages/FinancePages'
import { useAuthStore } from '@/stores/auth'

function Protected({ children }: { children: React.ReactNode }) {
  return useAuthStore((state) => state.isAuthenticated) ? <>{children}</> : <Navigate to="/login" replace />
}

function Public({ mode }: { mode: 'login' | 'signup' }) {
  return useAuthStore((state) => state.isAuthenticated)
    ? <Navigate to="/" replace />
    : <AuthPage mode={mode} />
}

function Home() {
  return useAuthStore((state) => state.isAuthenticated)
    ? <Protected><Layout><DashboardPage /></Layout></Protected>
    : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Public mode="login" />} />
      <Route path="/signup" element={<Public mode="signup" />} />
      <Route path="/transactions" element={<Protected><Layout><TransactionsPage /></Layout></Protected>} />
      <Route path="/categories" element={<Protected><Layout><CategoriesPage /></Layout></Protected>} />
      <Route path="/account" element={<Protected><Layout><AccountPage /></Layout></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App