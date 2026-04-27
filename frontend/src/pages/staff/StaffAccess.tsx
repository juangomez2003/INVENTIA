import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChefHat, KeyRound, ArrowRight } from 'lucide-react'
import { saveStaffSession } from '../../lib/staffSession'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const ROLE_LABELS: Record<string, string> = {
  mesero: 'Mesero',
  chef: 'Chef / Cocina',
  cajero: 'Cajero',
  inventario: 'Inventario',
}

const ROLE_COLORS: Record<string, string> = {
  mesero: '#0a84ff',
  chef: '#ff9f0a',
  cajero: '#30d158',
  inventario: '#5e5ce6',
}

const ROLE_ICONS: Record<string, string> = {
  mesero: '🛎️',
  chef: '👨‍🍳',
  cajero: '💳',
  inventario: '📦',
}

export default function StaffAccess() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<{ role: string; restaurant_name: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedCode = code.trim().toUpperCase()
    if (trimmedCode.length < 6) {
      setError('El código debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    setError('')
    setPreview(null)

    try {
      const res = await fetch(`${API}/staff/code-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmedCode }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(err.detail || 'Código inválido')
      }

      const data = await res.json()
      saveStaffSession({
        session_token: data.session_token,
        role: data.role,
        restaurant_id: data.restaurant_id,
        restaurant_name: data.restaurant_name,
      })

      setPreview({ role: data.role, restaurant_name: data.restaurant_name })
      setTimeout(() => navigate('/staff'), 900)
    } catch (err: any) {
      setError(err.message || 'Error al validar el código')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #111827 100%)',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <ChefHat size={34} color="#30d158" />
            <span style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>INVENTIA</span>
          </div>
          <p style={{ color: '#636366', fontSize: 14, margin: 0 }}>Acceso de Personal</p>
        </div>

        <div style={{ background: '#1c1c1e', borderRadius: 20, padding: 32, border: '1px solid #2c2c2e' }}>
          {preview ? (
            /* Success state */
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>
                {ROLE_ICONS[preview.role] || '✅'}
              </div>
              <div style={{
                display: 'inline-block',
                background: (ROLE_COLORS[preview.role] || '#30d158') + '22',
                color: ROLE_COLORS[preview.role] || '#30d158',
                fontSize: 13, padding: '4px 14px', borderRadius: 20, fontWeight: 700, marginBottom: 12,
              }}>
                {ROLE_LABELS[preview.role] || preview.role}
              </div>
              <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>
                {preview.restaurant_name}
              </h2>
              <p style={{ color: '#636366', fontSize: 13, margin: 0 }}>Entrando a tu espacio de trabajo...</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <KeyRound size={20} color="#30d158" />
                <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>
                  Ingresar con código
                </h2>
              </div>
              <p style={{ color: '#636366', fontSize: 13, marginBottom: 28 }}>
                Tu administrador te proporcionó un código de acceso para tu turno.
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', color: '#aeaeb2', fontSize: 12, marginBottom: 8, fontWeight: 600, letterSpacing: 1 }}>
                    CÓDIGO DE ACCESO
                  </label>
                  <input
                    value={code}
                    onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
                    placeholder="Ej: AB3X7Y9Z"
                    maxLength={10}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '16px 14px',
                      background: '#2c2c2e',
                      border: error ? '1.5px solid #ff453a' : '1.5px solid #3a3a3c',
                      borderRadius: 12,
                      color: '#fff',
                      fontSize: 26,
                      fontWeight: 700,
                      letterSpacing: 8,
                      textAlign: 'center',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                  />
                  {error && (
                    <p style={{ color: '#ff453a', fontSize: 13, margin: '8px 0 0' }}>{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || code.trim().length < 6}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: loading || code.trim().length < 6 ? '#2c2c2e' : '#30d158',
                    border: 'none',
                    borderRadius: 12,
                    color: loading || code.trim().length < 6 ? '#636366' : '#000',
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: loading || code.trim().length < 6 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                  }}
                >
                  {loading ? 'Validando...' : <><ArrowRight size={18} /> Entrar al turno</>}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Roles reference */}
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {Object.entries(ROLE_LABELS).map(([role, label]) => (
            <div key={role} style={{
              background: '#1c1c1e',
              borderRadius: 10,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid #2c2c2e',
            }}>
              <span style={{ fontSize: 18 }}>{ROLE_ICONS[role]}</span>
              <span style={{ color: ROLE_COLORS[role], fontSize: 13, fontWeight: 600 }}>{label}</span>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#3a3a3c', fontSize: 13 }}>
          ¿Tienes cuenta?{' '}
          <button
            onClick={() => navigate('/staff/login')}
            style={{ background: 'none', border: 'none', color: '#636366', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}
          >
            Iniciar sesión
          </button>
        </p>
      </div>
    </div>
  )
}
