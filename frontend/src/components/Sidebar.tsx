import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, Brain, Settings, LogOut, UtensilsCrossed } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inventory',  icon: Package,         label: 'Inventario' },
  { to: '/menu',       icon: UtensilsCrossed, label: 'Menú' },
  { to: '/ai-insights',icon: Brain,           label: 'IA Insights' },
  { to: '/settings',   icon: Settings,        label: 'Configuración' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside
      className="glass-sidebar"
      style={{
        width: 240,
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
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
          Menú
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
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
                <item.icon style={{
                  width: 17, height: 17, flexShrink: 0,
                  color: isActive ? 'var(--nav-active-color)' : 'var(--text-3)',
                  strokeWidth: isActive ? 2.5 : 1.75,
                }} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div style={{ padding: '0 8px 16px', borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
        {user && (
          <div style={{
            padding: '10px 10px',
            borderRadius: 10,
            marginBottom: 4,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: 'white',
              marginBottom: 8,
            }}>
              {(user.name || 'U').charAt(0).toUpperCase()}
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{user.name}</p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{user.restaurant}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 10px', borderRadius: 10, width: '100%',
            fontSize: 14, color: '#ff453a',
            background: 'none', border: 'none',
            cursor: 'pointer', transition: 'background 0.18s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,69,58,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <LogOut style={{ width: 16, height: 16, flexShrink: 0, strokeWidth: 1.75 }} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
