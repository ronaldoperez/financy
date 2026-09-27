import { Link } from 'react-router-dom'
import logo from '@/assets/logo.svg'

export function Brand({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="brand" aria-label="Financy">
      <img className="brand-logo" src={logo} alt="Financy" />
    </Link>
  )
}