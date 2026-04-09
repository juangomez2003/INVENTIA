import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyStaffProfile } from '../../services/staffService'
import MeseroView from './MeseroView'
import ChefView from './ChefView'
import CajeroView from './CajeroView'
import { supabase } from '../../lib/supabase'
import { ChefHat, LogOut } from 'lucide-react'

interface StaffProfile {
  user_id: string
  restaurant_id: string
  role: string
  plan: string
}

const ROLE_LABELS: Record<string, string> = {
  mesero: 'Mesero',
  chef: 'Chef / Cocina',
  cajero: 'Cajero',
  inventario: 'Inventario',
  owner: 'Propietario',
}

const ROLE_COLORS: Record<string, string> = {
  mesero:     '#0a84ff',
  chef:       '#ff9f0a',
  cajero:     '#30d158',
  inventario: '#5e5ce6',
  owner:      '#ff453a',
}

export default function StaffHub() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<StaffProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getMyStaffProfile()
      .then(p => {
        if (p.role === 'owner') {
          navigate('/dashboard')
        } else {
          setProfile(p)
        }
      })
      .catch(() => {
        setError('No tienes acceso. Verifica tu cuenta.')
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/staff/login')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #30d158', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (error || !profile) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', flexDirection: 'column', gap: 16 }}>
      <p style={{ color: '#ff453a' }}>{error || 'Perfil no encontrado'}</p>
      <button onClick={handleLogout} style={{ color: '#636366', background: 'none', border: 'none', cursor: 'pointer' }}>Cerrar sesión</button>
    </div>
  )

  const roleColor = ROLE_COLORS[profile.role] || '#aeaeb2'

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header style={{ background: '#1c1c1e', borderBottom: '1px solid #2c2c2e', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ChefHat size={22} color="#30d158" />
          <span style={{ color: '#fff', fontWeight: 600 }}>INVENTIA</span>
          <span style={{ background: roleColor + '22', color: roleColor, fontSize: 12, padding: '2px 10px', borderRadius: 20, fontWeight: 600 }}>
            {ROLE_LABELS[profile.role] || profile.role}
          </span>
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#636366', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <LogOut size={15} /> Salir
        </button>
      </header>

      {/* Role view */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {profile.role === 'mesero'     && <MeseroView restaurantId={profile.restaurant_id} />}
        {profile.role === 'chef'       && <ChefView restaurantId={profile.restaurant_id} />}
        {profile.role === 'cajero'     && <CajeroView restaurantId={profile.restaurant_id} />}
        {profile.role === 'inventario' && (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <p style={{ color: '#aeaeb2' }}>Vista de inventario — próximamente disponible como módulo separado.</p>
          </div>
        )}
      </main>
    </div>
  )
}
