import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChefHat, KeyRound, UserPlus, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { joinWithCode } from '../../services/staffService'
import { supabase } from '../../lib/supabase'

const ROLE_LABELS: Record<string, string> = {
  mesero: 'Mesero',
  chef: 'Chef / Cocina',
  cajero: 'Cajero',
  inventario: 'Inventario',
}

export default function StaffJoin() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'code' | 'register'>('code')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (code.trim().length < 6) { setError('Ingresa un código válido'); return }
    // Avanzar al paso de registro (el backend valida el código al crear la cuenta)
    setError('')
    setStep('register')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await joinWithCode({ code: code.trim(), name: name.trim(), email: email.trim(), password })
      setRole(res.role)
      setSuccess(true)
      // Auto-login
      await supabase.auth.signInWithPassword({ email: email.trim(), password })
      setTimeout(() => navigate('/staff'), 1500)
    } catch (err: any) {
      setError(err.message || 'Error al registrarse')
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
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <ChefHat size={32} color="#30d158" />
            <span style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>INVENTIA</span>
          </div>
          <p style={{ color: '#636366', fontSize: 14 }}>Portal de Personal</p>
        </div>

        <div style={{ background: '#1c1c1e', borderRadius: 16, padding: 32, border: '1px solid #2c2c2e' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h2 style={{ color: '#fff', marginBottom: 8 }}>¡Cuenta creada!</h2>
              <p style={{ color: '#636366', fontSize: 14 }}>
                Tu rol: <strong style={{ color: '#30d158' }}>{ROLE_LABELS[role] || role}</strong>
              </p>
              <p style={{ color: '#636366', fontSize: 13, marginTop: 8 }}>Redirigiendo...</p>
            </div>
          ) : step === 'code' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <KeyRound size={20} color="#30d158" />
                <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>Ingresar con Código</h2>
              </div>
              <p style={{ color: '#636366', fontSize: 14, marginBottom: 24 }}>
                Tu empleador te proporcionó un código de acceso. Ingrésalo para crear tu cuenta.
              </p>
              <form onSubmit={handleCodeSubmit}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', color: '#aeaeb2', fontSize: 13, marginBottom: 6 }}>Código de invitación</label>
                  <input
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="Ej: AB3X7Y9Z"
                    maxLength={8}
                    style={{
                      width: '100%', padding: '12px 14px', background: '#2c2c2e',
                      border: '1px solid #3a3a3c', borderRadius: 8, color: '#fff',
                      fontSize: 20, letterSpacing: 6, textAlign: 'center', boxSizing: 'border-box',
                    }}
                  />
                </div>
                {error && <p style={{ color: '#ff453a', fontSize: 13, marginBottom: 12 }}>{error}</p>}
                <button type="submit" style={{
                  width: '100%', padding: '12px', background: '#30d158', border: 'none',
                  borderRadius: 8, color: '#000', fontWeight: 600, fontSize: 15, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  Continuar <ArrowRight size={16} />
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <UserPlus size={20} color="#30d158" />
                <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>Crear tu cuenta</h2>
              </div>
              <p style={{ color: '#636366', fontSize: 13, marginBottom: 24 }}>Código: <code style={{ color: '#30d158' }}>{code}</code></p>
              <form onSubmit={handleRegister}>
                {[
                  { label: 'Tu nombre', value: name, setter: setName, placeholder: 'Ej: Juan Pérez', type: 'text' },
                  { label: 'Email', value: email, setter: setEmail, placeholder: 'tu@email.com', type: 'email' },
                ].map(f => (
                  <div key={f.label} style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', color: '#aeaeb2', fontSize: 13, marginBottom: 6 }}>{f.label}</label>
                    <input
                      value={f.value}
                      onChange={e => f.setter(e.target.value)}
                      placeholder={f.placeholder}
                      type={f.type}
                      required
                      style={{
                        width: '100%', padding: '12px 14px', background: '#2c2c2e',
                        border: '1px solid #3a3a3c', borderRadius: 8, color: '#fff',
                        fontSize: 14, boxSizing: 'border-box',
                      }}
                    />
                  </div>
                ))}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', color: '#aeaeb2', fontSize: 13, marginBottom: 6 }}>Contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      type={showPwd ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      minLength={8}
                      required
                      style={{
                        width: '100%', padding: '12px 40px 12px 14px', background: '#2c2c2e',
                        border: '1px solid #3a3a3c', borderRadius: 8, color: '#fff',
                        fontSize: 14, boxSizing: 'border-box',
                      }}
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: '#636366', cursor: 'pointer',
                    }}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {error && <p style={{ color: '#ff453a', fontSize: 13, marginBottom: 12 }}>{error}</p>}
                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '12px', background: loading ? '#1c3a26' : '#30d158', border: 'none',
                  borderRadius: 8, color: '#000', fontWeight: 600, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                }}>
                  {loading ? 'Creando cuenta...' : 'Crear cuenta y entrar'}
                </button>
                <button type="button" onClick={() => { setStep('code'); setError('') }} style={{
                  width: '100%', marginTop: 10, padding: '10px', background: 'transparent',
                  border: 'none', color: '#636366', fontSize: 14, cursor: 'pointer',
                }}>
                  ← Cambiar código
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#3a3a3c', fontSize: 13 }}>
          ¿Ya tienes cuenta?{' '}
          <button onClick={() => navigate('/staff/login')} style={{ background: 'none', border: 'none', color: '#30d158', cursor: 'pointer', fontSize: 13 }}>
            Iniciar sesión
          </button>
        </p>
      </div>
    </div>
  )
}
