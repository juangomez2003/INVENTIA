import { useState, useEffect } from 'react'
import { Building2, Users, Package, AlertTriangle, RefreshCw, TrendingUp, Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { adminService } from '../../services/adminService'
import type { PlatformMetrics, MetricsHistory } from '../../types'
import { useTheme } from '../../context/ThemeContext'

const PLAN_COLORS: Record<string, string> = { free: '#5856d6', pro: '#0a84ff', enterprise: '#ff9f0a' }

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null)
  const [history, setHistory] = useState<MetricsHistory[]>([])
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const chartText     = isDark ? 'rgba(245,245,247,0.35)' : 'rgba(29,29,31,0.4)'
  const chartGrid     = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'
  const tooltipBg     = isDark ? '#2c2c2e' : '#ffffff'
  const tooltipText   = isDark ? '#f5f5f7' : '#1d1d1f'
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const tooltipStyle  = {
    background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 12,
    color: tooltipText, fontSize: 12, padding: '10px 14px',
    boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.1)',
  }

  const load = async () => {
    setLoading(true)
    try {
      const [m, h] = await Promise.all([adminService.getMetrics(), adminService.getMetricsHistory(30)])
      setMetrics(m)
      setHistory(h.filter((_, i) => i % 3 === 0))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        border: '2.5px solid var(--border)',
        borderTopColor: 'var(--accent)',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  )

  const statCards = metrics ? [
    { icon: Building2,     label: 'Empresas',        value: metrics.totalCompanies,    sub: `+${metrics.newCompanies7d} esta semana`, color: '#ff9f0a' },
    { icon: Users,         label: 'Usuarios',         value: metrics.totalUsers,        sub: `+${metrics.newUsers7d} esta semana`,    color: '#0a84ff' },
    { icon: Package,       label: 'Activas',          value: metrics.activeCompanies,   sub: 'Empresas operando',                     color: '#30d158' },
    { icon: AlertTriangle, label: 'Suspendidas',      value: metrics.suspendedCompanies,sub: 'Requieren revisión',                    color: '#ff453a' },
  ] : []

  return (
    <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Header ── */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>
            Panel global
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={load}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 16px', borderRadius: 10,
            fontSize: 13, fontWeight: 500, color: 'var(--text-2)',
            background: 'var(--surface)', boxShadow: 'var(--card-shadow)',
            border: 'none', cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'inherit',
          }}
        >
          <RefreshCw size={14} style={{ strokeWidth: 2 }} /> Actualizar
        </button>
      </div>

      {/* ── KPI Cards ── */}
      {metrics && (
        <div className="animate-fade-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {statCards.map(({ icon: Icon, label, value, sub, color }) => (
            <div key={label} className="card" style={{ padding: '22px 20px', borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 11,
                  background: `color-mix(in srgb, ${color} 12%, transparent)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={19} style={{ color, strokeWidth: 1.75 }} />
                </div>
                <TrendingUp size={14} style={{ color: 'var(--text-3)', strokeWidth: 1.5 }} />
              </div>
              <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 6 }}>
                {value.toLocaleString()}
              </p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 2 }}>{label}</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Main Charts ── */}
      <div className="animate-fade-up delay-2" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
        <div className="card" style={{ padding: 28, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4, letterSpacing: '-0.01em' }}>
                Crecimiento de la plataforma
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Empresas y usuarios activos — últimos 30 días</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {[{ color: '#ff9f0a', label: 'Empresas' }, { color: '#0a84ff', label: 'Usuarios' }].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gcCompanies" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ff9f0a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ff9f0a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gcUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0a84ff" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0a84ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
              <XAxis dataKey="date" tick={{ fill: chartText, fontSize: 11 }} tickFormatter={(d: string) => d.slice(5)} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: chartText, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="totalCompanies" name="Empresas" stroke="#ff9f0a" strokeWidth={2.5} fill="url(#gcCompanies)" dot={false} />
              <Area type="monotone" dataKey="totalUsers"     name="Usuarios" stroke="#0a84ff" strokeWidth={2.5} fill="url(#gcUsers)"     dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Secondary Row: Plans + Metrics + Actions ── */}
      <div className="animate-fade-up delay-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>

        {/* Plans distribution */}
        <div className="card" style={{ padding: 24, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Activity size={15} style={{ color: 'var(--text-3)', strokeWidth: 1.75 }} />
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>Distribución de planes</h2>
          </div>
          {metrics?.topPlans && metrics.topPlans.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie
                    data={metrics.topPlans} dataKey="count" nameKey="plan"
                    cx="50%" cy="50%" outerRadius={52} paddingAngle={4} strokeWidth={0}
                  >
                    {metrics.topPlans.map((entry) => (
                      <Cell key={entry.plan} fill={PLAN_COLORS[entry.plan] || '#5856d6'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                {metrics.topPlans.map(({ plan, count }) => (
                  <div key={plan} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: PLAN_COLORS[plan] || '#5856d6' }} />
                      <span style={{ fontSize: 12, color: 'var(--text-2)', textTransform: 'capitalize' }}>{plan}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180 }}>
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Sin datos</p>
            </div>
          )}
        </div>

        {/* Platform health */}
        <div className="card" style={{ padding: 24, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Activity size={15} style={{ color: 'var(--text-3)', strokeWidth: 1.75 }} />
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>Estado de la plataforma</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {metrics && [
              { label: 'Tasa de actividad', value: metrics.totalCompanies > 0 ? Math.round((metrics.activeCompanies / metrics.totalCompanies) * 100) : 0, color: '#30d158' },
              { label: 'Nuevas empresas (7d)', value: metrics.newCompanies7d, suffix: '', color: '#ff9f0a' },
              { label: 'Nuevos usuarios (7d)', value: metrics.newUsers7d, suffix: '', color: '#0a84ff' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-2)' }}>{label}</span>
                  <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{value}</span>
                </div>
                <div style={{ height: 5, background: 'var(--progress-bg)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3, background: color,
                    width: `${Math.min(value, 100)}%`,
                    transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                  }} />
                </div>
              </div>
            ))}
            <div style={{ paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
              {metrics && [
                ['Total empresas', metrics.totalCompanies],
                ['Total usuarios', metrics.totalUsers],
                ['Suspendidas', metrics.suspendedCompanies],
              ].map(([label, val]) => (
                <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-3)' }}>{label}</span>
                  <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="card" style={{ padding: 24, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Activity size={15} style={{ color: 'var(--text-3)', strokeWidth: 1.75 }} />
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>Acciones rápidas</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Gestionar Usuarios',  href: '/admin/users',     color: '#0a84ff', icon: Users },
              { label: 'Ver Empresas',         href: '/admin/companies', color: '#ff9f0a', icon: Building2 },
              { label: 'Revisar Productos',    href: '/admin/products',  color: '#5856d6', icon: Package },
              { label: 'Configurar Módulos',   href: '/admin/modules',   color: '#30d158', icon: Activity },
            ].map(({ label, href, color, icon: Icon }) => (
              <a
                key={href}
                href={href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 14px', borderRadius: 10, textDecoration: 'none',
                  fontSize: 13, fontWeight: 500, color: 'var(--text-1)',
                  background: 'var(--surface-hover)',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `color-mix(in srgb, ${color} 10%, transparent)`
                  e.currentTarget.style.color = color
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--surface-hover)'
                  e.currentTarget.style.color = 'var(--text-1)'
                }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: `color-mix(in srgb, ${color} 12%, transparent)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={15} style={{ color, strokeWidth: 1.75 }} />
                </div>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
