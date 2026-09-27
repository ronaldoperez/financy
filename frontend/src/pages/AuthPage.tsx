import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, LockKeyhole, LogIn, Mail, UserRound } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { Brand } from '@/components/Brand'

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const isSignup = mode === 'signup'
  const login = useAuthStore((state) => state.login)
  const signup = useAuthStore((state) => state.signup)
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    const values = new FormData(event.currentTarget)
    try {
      if (isSignup) {
        await signup({
          name: String(values.get('name') ?? '').trim(),
          email: String(values.get('email') ?? '').trim(),
          password: String(values.get('password') ?? ''),
        })
      } else {
        await login({
          email: String(values.get('email') ?? '').trim(),
          password: String(values.get('password') ?? ''),
        })
      }
      navigate('/', { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível concluir. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className={`auth-screen${isSignup ? ' signup-screen' : ''}`}>
      <header className="auth-topbar">
        <Brand to="/login" />
      </header>
      <section className="auth-panel">
        <section className={`auth-card${isSignup ? ' signup-card' : ''}`}>
          <div className="auth-heading">
            <h1>{isSignup ? 'Criar conta' : 'Fazer login'}</h1>
            <p>{isSignup ? 'Comece controlar suas finanças ainda hoje' : 'Entre na sua conta para continuar'}</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignup && <label>Nome completo<span className="auth-input-wrap"><UserRound size={15} /><input name="name" autoComplete="name" placeholder="Seu nome completo" required minLength={3} /></span></label>}
            <label>E-mail<span className="auth-input-wrap"><Mail size={15} /><input name="email" type="email" autoComplete="email" placeholder="mail@exemplo.com" required /></span></label>
            <label>Senha<span className="auth-input-wrap"><LockKeyhole size={15} /><input name="password" type={showPassword ? 'text' : 'password'} autoComplete={isSignup ? 'new-password' : 'current-password'} placeholder={isSignup ? 'Digite sua senha' : 'Digite sua senha'} required minLength={8} /><button className="password-toggle" type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></span>{isSignup && <small className="password-help">A senha deve ter no mínimo 8 caracteres</small>}</label>
            {!isSignup && <div className="auth-options"><label className="remember-option"><input type="checkbox" name="remember" /> <span>Lembrar-me</span></label><button type="button" className="auth-text-button" onClick={() => setError('A recuperação de senha ainda não está disponível. Entre em contato com o suporte.')}>Recuperar senha</button></div>}
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-primary auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Aguarde...' : isSignup ? 'Cadastrar' : 'Entrar'} {!isSignup && <ArrowRight size={16} />}
            </button>
          </form>
          <div className="auth-divider"><span>ou</span></div>
          <div className="auth-signup-prompt">{isSignup ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}</div>
          <Link className="button auth-secondary-action" to={isSignup ? '/login' : '/signup'}>{isSignup ? <LogIn size={15} /> : <UserRound size={15} />} {isSignup ? 'Fazer login' : 'Criar conta'}</Link>
        </section>
      </section>
    </main>
  )
}