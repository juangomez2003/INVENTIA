import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChefHat, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getMyStaffProfile } from '../../services/staffService'

export default function StaffLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })
      if (authErr) throw new Error(authErr.message)
      // Verificar que sea staff (no owner, que tiene su propio login)
      const profile = await getMyStaffProfile()
      if (profile.role === 'owner') {
        // Owner usa el login normal
        navigate('/dashboard')
      } else {
        navigate('/staff')
      }
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas')
      await supabase.auth.signOut()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #111827 100%)',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <ChefHat size={32} color="#30d158" />
            <span style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>INVENTIA</span>
          </div>
          <p style={{ color: '#636366', fontSize: 14 }}>Acceso de Personal</p>
        </div>

        <div style={{ background: '#1c1c1e', borderRadius: 16, padding: 32, border: '1px solid #2c2c2e' }}>
          <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Iniciar sesión</h2>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#aeaeb2', fontSize: 13, marginBottom: 6 }}>Email</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                required
                placeholder="tu@email.com"
                style={{ width: '100%', padding: '12px 14px', background: '#2c2c2e', border: '1px solid #3a3a3c', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#aeaeb2', fontSize: 13, marginBottom: 6 }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type={showPwd ? 'text' : 'password'}
                  required
                  style={{ width: '100%', padding: '12px 40px 12px 14px', background: '#2c2c2e', border: '1px solid #3a3a3c', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#636366', cursor: 'pointer' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <p style={{ color: '#ff453a', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: loading ? '#1c3a26' : '#30d158', border: 'none', borderRadius: 8, color: '#000', fontWeight: 600, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#3a3a3c', fontSize: 13 }}>
          ¿Primera vez?{' '}
          <button onClick={() => navigate('/staff/join')} style={{ background: 'none', border: 'none', color: '#30d158', cursor: 'pointer', fontSize: 13 }}>
            Usar código de invitación
          </button>
        </p>
      </div>
    </div>
  )
}
