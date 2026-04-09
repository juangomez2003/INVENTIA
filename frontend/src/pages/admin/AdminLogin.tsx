import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle, Sun, Moon } from 'lucide-react'
import Logo from '../../components/Logo'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useTheme } from '../../context/ThemeContext'

export default function AdminLogin() {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { adminLogin }        = useAdminAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate              = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const ok = await adminLogin(email, password)
      if (ok) navigate('/admin/dashboard')
      else setError('Credenciales inválidas o sin permisos de administrador.')
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--surface-hover)',
    border: '1.5px solid transparent',
    borderRadius: 12,
    padding: '13px 16px',
    fontSize: 15,
    color: 'var(--text-1)',
    outline: 'none',
    transition: 'all 0.18s',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  return (
    <div
      style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        padding: 24, background: 'var(--bg-base)',
        transition: 'background 0.3s ease',
      }}
    >
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed', top: 20, right: 20, zIndex: 100,
          width: 38, height: 38, borderRadius: '50%',
          background: 'var(--toggle-bg)', border: '1px solid var(--toggle-border)',
          color: 'var(--toggle-icon)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="animate-scale-in" style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
          <Logo size={52} hideText />
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
            Admin Panel
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>INVENTIA · Acceso de administrador</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 28, borderRadius: 20 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 8 }}>
                Correo electrónico
              </label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@inventia.com"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.background = 'var(--surface-focus)'; }}
                onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'var(--surface-hover)'; }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 8 }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: 46 }}
                  onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.background = 'var(--surface-focus)'; }}
                  onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'var(--surface-hover)'; }}
                />
                <button
                  type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex',
                  }}
                >
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
                color: '#ff453a', background: 'rgba(255,69,58,0.08)',
                border: '1px solid rgba(255,69,58,0.15)', borderRadius: 10, padding: '10px 14px',
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 12,
                fontSize: 15, fontWeight: 600, color: 'white',
                background: 'var(--accent-gradient)',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.65 : 1,
                boxShadow: '0 4px 16px var(--accent-glow)',
                transition: 'all 0.2s', fontFamily: 'inherit',
              }}
            >
              {loading ? 'Verificando...' : 'Acceder al Panel'}
            </button>
          </form>

          {/* Hint */}
          <div style={{
            marginTop: 20, padding: '12px 14px', borderRadius: 10,
            background: 'var(--demo-bg)', border: '1px solid var(--demo-border)',
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Acceso super admin
            </p>
            <p style={{ fontSize: 12, color: 'var(--demo-label)', fontFamily: 'ui-monospace, monospace', lineHeight: 1.8 }}>
              superadmin@inventia.com<br />SuperAdmin2024!
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, marginTop: 20, color: 'var(--text-3)' }}>
          <a href="/login" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>← Volver al inicio de sesión</a>
        </p>
      </div>
    </div>
  )
}
