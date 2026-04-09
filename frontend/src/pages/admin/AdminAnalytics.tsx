import { useState, useEffect } from 'react'
import { BarChart2, RefreshCw, TrendingUp, Package, AlertTriangle, ArrowLeftRight } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { adminService } from '../../services/adminService'
import type { AnalyticsData, PlatformMetrics } from '../../types'
import { useTheme } from '../../context/ThemeContext'

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [metrics, setMetrics]     = useState<PlatformMetrics | null>(null)
  const [loading, setLoading]     = useState(true)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const chartText     = isDark ? 'rgba(245,245,247,0.35)' : 'rgba(29,29,31,0.4)'
  const chartGrid     = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'
  const tooltipBg     = isDark ? '#2c2c2e' : '#ffffff'
  const tooltipText   = isDark ? '#f5f5f7' : '#1d1d1f'
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const tooltipStyle  = { background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 12, color: tooltipText, fontSize: 12, padding: '10px 14px', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.1)' }

  const load = async () => {
    setLoading(true)
    try {
      const [a, m] = await Promise.all([adminService.getAnalytics(), adminService.getMetrics()])
      setAnalytics(a)
      setMetrics(m)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )

  const totalProducts = analytics?.productsByStatus.reduce((s, x) => s + x.count, 0) ?? 0
  const critPct = totalProducts > 0 ? Math.round(((analytics?.productsByStatus.find(x => x.status === 'critical')?.count ?? 0) / totalProducts) * 100) : 0

  return (
    <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>Super Admin</p>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <BarChart2 style={{ width: 26, height: 26, color: 'var(--accent)', strokeWidth: 1.75 }} />
            Análisis de datos
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>Visión consolidada de todos los restaurantes</p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, color: 'var(--text-2)', background: 'var(--surface)', boxShadow: 'var(--card-shadow)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* KPIs de resumen */}
      {metrics && (
        <div className="animate-fade-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { icon: Package,        label: 'Total productos',  value: metrics.totalProducts,    color: '#5856d6', sub: `${totalProducts} en inventario` },
            { icon: AlertTriangle,  label: 'Stock crítico',    value: metrics.criticalProducts,  color: '#ff453a', sub: `${critPct}% del inventario` },
            { icon: ArrowLeftRight, label: 'Movimientos (30d)',value: analytics?.dailyMovements.reduce((s, d) => s + d.count, 0) ?? 0, color: '#0a84ff', sub: 'Últimos 30 días' },
            { icon: TrendingUp,     label: 'Mov. esta semana', value: metrics.movements7d,       color: '#30d158', sub: `${metrics.totalMovements} en total` },
          ].map(({ icon: Icon, label, value, color, sub }) => (
            <div key={label} className="card" style={{ padding: '18px 20px', borderRadius: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `color-mix(in srgb, ${color} 12%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} style={{ color, strokeWidth: 1.75 }} />
                </div>
                <div>
                  <p style={{ fontSize: 24, fontWeight: 700, color, letterSpacing: '-0.02em', lineHeight: 1 }}>{value.toLocaleString()}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 600, marginTop: 3 }}>{label}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gráfica principal: movimientos por día */}
      {analytics && (
        <div className="card animate-fade-up delay-2" style={{ padding: 28, borderRadius: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Actividad diaria de inventario</h2>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 22 }}>Número de movimientos registrados por día en todos los restaurantes</p>
          {analytics.dailyMovements.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={analytics.dailyMovements} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                <XAxis dataKey="date" tick={{ fill: chartText, fontSize: 10 }} tickFormatter={(d: string) => d.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartText, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="count" name="Movimientos" stroke="var(--accent)" strokeWidth={2.5} fill="url(#gDaily)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240, color: 'var(--text-3)', fontSize: 13 }}>Sin movimientos registrados en los últimos 30 días</div>
          )}
        </div>
      )}

      {/* Fila de gráficas secundarias */}
      {analytics && (
        <div className="animate-fade-up delay-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: 14 }}>

          {/* Por restaurante */}
          <div className="card" style={{ padding: 28, borderRadius: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Productos por restaurante</h2>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>Total vs en estado crítico</p>
            {analytics.perRestaurant.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.perRestaurant} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                  <XAxis dataKey="restaurant_name" tick={{ fill: chartText, fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={(n: string) => n.length > 10 ? n.slice(0, 10) + '…' : n} />
                  <YAxis tick={{ fill: chartText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, color: chartText }} />
                  <Bar dataKey="products" name="Total" fill="#5856d6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="critical" name="Críticos" fill="#ff453a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-3)', fontSize: 13 }}>Sin datos</div>
            )}
          </div>

          {/* Movimientos por tipo */}
          <div className="card" style={{ padding: 28, borderRadius: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Volumen por tipo</h2>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>Últimos 30 días</p>
            {analytics.movementsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.movementsByType} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                  <XAxis dataKey="label" tick={{ fill: chartText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: chartText, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="total" name="Cantidad" radius={[6, 6, 0, 0]}>
                    {analytics.movementsByType.map(t => <Cell key={t.type} fill={t.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-3)', fontSize: 13 }}>Sin datos</div>
            )}
          </div>

          {/* Estado del inventario */}
          <div className="card" style={{ padding: 28, borderRadius: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Estado global</h2>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>Distribución de stock</p>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={analytics.productsByStatus} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={56} paddingAngle={4} strokeWidth={0}>
                  {analytics.productsByStatus.map(s => <Cell key={s.status} fill={s.color} />)}
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
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{s.count}</span>
                    {totalProducts > 0 && (
                      <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 6 }}>
                        {Math.round(s.count / totalProducts * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabla detalle por restaurante */}
      {analytics && analytics.perRestaurant.length > 0 && (
        <div className="card animate-fade-up delay-4" style={{ borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>Detalle por restaurante</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {['Restaurante', 'Total productos', 'Estado crítico', 'Estado bajo', 'Salud'].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', padding: '12px 20px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analytics.perRestaurant.map((r, i) => {
                const healthPct = r.products > 0 ? Math.round(((r.products - r.critical) / r.products) * 100) : 100
                const healthColor = healthPct >= 80 ? '#30d158' : healthPct >= 50 ? '#ff9f0a' : '#ff453a'
                return (
                  <tr key={r.restaurant_id} style={{ borderBottom: i < analytics.perRestaurant.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{r.restaurant_name}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-2)' }}>{r.products}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(255,69,58,0.1)', color: '#ff453a' }}>{r.critical}</span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-3)' }}>—</td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, maxWidth: 100, height: 4, borderRadius: 2, background: 'var(--progress-bg)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${healthPct}%`, borderRadius: 2, background: healthColor }} />
                        </div>
                        <span style={{ fontSize: 12, color: healthColor, fontWeight: 600 }}>{healthPct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
