import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Brain,
  Settings,
  LogOut,
  Utensils,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inventory', icon: Package, label: 'Inventario' },
  { to: '/ai-insights', icon: Brain, label: 'IA Insights' },
  { to: '/settings', icon: Settings, label: 'Configuración' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="glass-sidebar w-64 flex-shrink-0 h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/[0.06]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
          <Utensils className="w-5 h-5 text-white" />
        </div>
        <div className="overflow-hidden">
          <h1 className="text-base font-bold text-white tracking-tight">RestaurantAI</h1>
          <p className="text-[11px] text-white/40">Inventario Inteligente</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/20'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 pb-4 space-y-2">
        {user && (
          <div className="glass rounded-xl p-3 mb-2">
            <p className="text-sm font-medium text-white/90">{user.name}</p>
            <p className="text-xs text-white/40">{user.restaurant}</p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full border border-transparent"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
