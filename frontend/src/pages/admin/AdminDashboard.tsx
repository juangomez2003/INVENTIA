import { useState, useEffect } from 'react'
import { Store, Package, AlertTriangle, ArrowLeftRight, TrendingUp, RefreshCw, Activity, BarChart2 } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { adminService } from '../../services/adminService'
import type { PlatformMetrics, MetricsHistory, AnalyticsData } from '../../types'
import { useTheme } from '../../context/ThemeContext'

export default function AdminDashboard() {
  const [metrics, setMetrics]   = useState<PlatformMetrics | null>(null)
  const [history, setHistory]   = useState<MetricsHistory[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading]   = useState(true)
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
      const [m, h, a] = await Promise.all([
        adminService.getMetrics(),
        adminService.getMetricsHistory(30),
        adminService.getAnalytics(),
      ])
      setMetrics(m)
      setHistory(h)
      setAnalytics(a)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )

  const kpis = metrics ? [
    { icon: Store,         label: 'Restaurantes',    value: metrics.totalRestaurants,  sub: `+${metrics.newRestaurants7d} esta semana`, color: '#ff9f0a' },
    { icon: Package,       label: 'Productos',        value: metrics.totalProducts,     sub: 'En todos los restaurantes',               color: '#5856d6' },
    { icon: AlertTriangle, label: 'Stock crítico',    value: metrics.criticalProducts,  sub: `${metrics.lowProducts} en nivel bajo`,    color: '#ff453a' },
    { icon: ArrowLeftRight,label: 'Movimientos (7d)', value: metrics.movements7d,       sub: `${metrics.totalMovements} en total`,      color: '#30d158' },
  ] : []

  return (
    <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>Panel global</p>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, color: 'var(--text-2)', background: 'var(--surface)', boxShadow: 'var(--card-shadow)', border: 'none', cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'inherit' }}>
          <RefreshCw size={14} style={{ strokeWidth: 2 }} /> Actualizar
        </button>
      </div>

      {/* KPIs */}
      {metrics && (
        <div className="animate-fade-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {kpis.map(({ icon: Icon, label, value, sub, color }) => (
            <div key={label} className="card" style={{ padding: '22px 20px', borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: `color-mix(in srgb, ${color} 12%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={19} style={{ color, strokeWidth: 1.75 }} />
                </div>
                <TrendingUp size={14} style={{ color: 'var(--text-3)', strokeWidth: 1.5 }} />
              </div>
              <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 6 }}>{value.toLocaleString()}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 2 }}>{label}</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Gráficas fila 1 */}
      <div className="animate-fade-up delay-2" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14 }}>

        {/* Movimientos por día */}
        <div className="card" style={{ padding: 28, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Movimientos diarios</h2>
              <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Actividad de inventario — últimos 30 días</p>
            </div>
            <Activity size={15} style={{ color: 'var(--text-3)' }} />
          </div>
          {history.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gMov" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#5856d6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#5856d6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                <XAxis dataKey="date" tick={{ fill: chartText, fontSize: 10 }} tickFormatter={(d: string) => d.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartText, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="movements" name="Movimientos" stroke="#5856d6" strokeWidth={2.5} fill="url(#gMov)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220, color: 'var(--text-3)', fontSize: 13 }}>Sin movimientos en los últimos 30 días</div>
          )}
        </div>

        {/* Distribución por estado */}
        <div className="card" style={{ padding: 28, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <BarChart2 size={15} style={{ color: 'var(--text-3)' }} />
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>Estado del inventario</h2>
          </div>
          {analytics && analytics.productsByStatus.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={analytics.productsByStatus} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={56} paddingAngle={4} strokeWidth={0}>
                    {analytics.productsByStatus.map((s) => (
                      <Cell key={s.status} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                {analytics.productsByStatus.map(s => (
                  <div key={s.status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{s.label}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-3)', fontSize: 13 }}>Sin datos</div>
          )}
        </div>
      </div>

      {/* Gráficas fila 2 */}
      {analytics && (
        <div className="animate-fade-up delay-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

          {/* Movimientos por tipo */}
          <div className="card" style={{ padding: 28, borderRadius: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Movimientos por tipo</h2>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>Volumen total últimos 30 días</p>
            {analytics.movementsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={analytics.movementsByType} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                  <XAxis dataKey="label" tick={{ fill: chartText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: chartText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="total" name="Cantidad" radius={[6, 6, 0, 0]}>
                    {analytics.movementsByType.map((t) => <Cell key={t.type} fill={t.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, color: 'var(--text-3)', fontSize: 13 }}>Sin datos</div>
            )}
          </div>

          {/* Por restaurante */}
          <div className="card" style={{ padding: 28, borderRadius: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Productos por restaurante</h2>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>Total vs críticos</p>
            {analytics.perRestaurant.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={analytics.perRestaurant} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                  <XAxis dataKey="restaurant_name" tick={{ fill: chartText, fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={(n: string) => n.length > 12 ? n.slice(0, 12) + '…' : n} />
                  <YAxis tick={{ fill: chartText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, color: chartText }} />
                  <Bar dataKey="products" name="Total" fill="#5856d6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="critical" name="Críticos" fill="#ff453a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, color: 'var(--text-3)', fontSize: 13 }}>Sin datos</div>
            )}
          </div>
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="animate-fade-up delay-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: 'Restaurantes',   href: '/admin/products',   color: '#ff9f0a', icon: Store },
          { label: 'Usuarios',        href: '/admin/users',      color: '#0a84ff', icon: Package },
          { label: 'Análisis',        href: '/admin/analytics',  color: '#5856d6', icon: BarChart2 },
          { label: 'Módulos',         href: '/admin/modules',    color: '#30d158', icon: Activity },
        ].map(({ label, href, color, icon: Icon }) => (
          <a key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderRadius: 12, textDecoration: 'none', fontSize: 13, fontWeight: 500, color: 'var(--text-1)', background: 'var(--surface-hover)', transition: 'all 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.background = `color-mix(in srgb, ${color} 10%, transparent)`; e.currentTarget.style.color = color }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-1)' }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `color-mix(in srgb, ${color} 12%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={15} style={{ color, strokeWidth: 1.75 }} />
            </div>
            {label}
          </a>
        ))}
      </div>
    </div>
  )
}
