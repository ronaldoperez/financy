import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ArrowDownUp, LayoutDashboard, Tags } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { Brand } from '@/components/Brand'
import { Toaster } from '@/components/ui/sonner'

const navigation = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Transações', to: '/transactions', icon: ArrowDownUp },
  { label: 'Categorias', to: '/categories', icon: Tags },
]

export function Layout({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  return (
    <div className="app-frame">
      <header className="site-header">
        <div className="site-header-inner">
          <Brand />
          <nav className="top-nav" aria-label="Navegação principal">
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Icon size={16} strokeWidth={1.9} /><span>{label}</span>
            </NavLink>
          ))}
          </nav>
          <NavLink to="/account" className="profile-link" aria-label={`Minha conta, ${user?.name ?? ''}`}>
            <span className="profile-initials">{user?.name?.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() ?? 'U'}</span>
          </NavLink>
        </div>
      </header>
      <main className={`page-content route-${location.pathname.replace('/', '') || 'dashboard'}`}>{children}</main>
      <nav className="mobile-nav" aria-label="Navegação móvel">
        {navigation.map(({ label, to, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}>
            <Icon size={20} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <Toaster position="top-right" richColors closeButton />
    </div>
  )
}
