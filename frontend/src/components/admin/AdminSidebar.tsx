import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Building2, Store, Puzzle, LogOut, BarChart2 } from 'lucide-react'
import Logo from '../Logo'
import { useAdminAuth } from '../../context/AdminAuthContext'
import ThemeToggle from '../ThemeToggle'

const NAV_ITEMS = [
  { to: '/admin/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/products',   icon: Store,            label: 'Restaurantes' },
  { to: '/admin/users',      icon: Users,            label: 'Usuarios' },
  { to: '/admin/analytics',  icon: BarChart2,        label: 'Análisis' },
  { to: '/admin/modules',    icon: Puzzle,           label: 'Módulos' },
  { to: '/admin/companies',  icon: Building2,        label: 'Empresas' },
]

export default function AdminSidebar() {
  const { adminUser, adminLogout } = useAdminAuth()
  const navigate = useNavigate()

  const handleLogout = async () => { adminLogout(); navigate('/admin/login') }

  return (
    <aside
      className="glass-sidebar"
      style={{
        width: 240,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 16px 16px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={32} />
        </div>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 10px 4px' }}>
          Panel
        </p>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 10,
              fontSize: 14, fontWeight: isActive ? 600 : 400,
              textDecoration: 'none',
              transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
              background: isActive ? 'var(--nav-active-bg)' : 'transparent',
              color: isActive ? 'var(--nav-active-color)' : 'var(--text-2)',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} style={{
                  color: isActive ? 'var(--nav-active-color)' : 'var(--text-3)',
                  strokeWidth: isActive ? 2.5 : 1.75,
                  flexShrink: 0,
                }} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div style={{ padding: '0 8px 16px', borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
        <div style={{ padding: '10px 10px', borderRadius: 10, marginBottom: 4 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--accent-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'white', marginBottom: 8,
          }}>
            {(adminUser?.fullName || adminUser?.email || 'A').charAt(0).toUpperCase()}
          </div>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>
            {adminUser?.fullName || adminUser?.email}
          </p>
          <p style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2, fontWeight: 600 }}>
            Super Admin
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 10px', borderRadius: 10,
            fontSize: 14, color: '#ff453a',
            background: 'none', border: 'none',
            cursor: 'pointer', transition: 'background 0.18s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,69,58,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <LogOut size={16} style={{ strokeWidth: 1.75 }} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
