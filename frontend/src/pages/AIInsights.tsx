import { Brain, TrendingDown, ShoppingCart, Zap, ArrowUpRight, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { aiPredictions, aiAlerts } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';

const trendData = [
  { day: 'Sem 1', pollo: 30, tomate: 12, carne: 18, camarones: 8 },
  { day: 'Sem 2', pollo: 35, tomate: 14, carne: 20, camarones: 10 },
  { day: 'Sem 3', pollo: 28, tomate: 16, carne: 22, camarones: 7 },
  { day: 'Sem 4', pollo: 42, tomate: 18, carne: 25, camarones: 12 },
];

const thStyle: React.CSSProperties = {
  textAlign: 'left', fontSize: 11, fontWeight: 600,
  color: 'var(--text-3)', padding: '12px 20px',
  textTransform: 'uppercase', letterSpacing: '0.06em',
};
const tdStyle: React.CSSProperties = { padding: '13px 20px' };

export default function AIInsights() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartText     = isDark ? 'rgba(245,245,247,0.35)' : 'rgba(29,29,31,0.4)';
  const chartGrid     = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
  const tooltipBg     = isDark ? '#2c2c2e' : '#ffffff';
  const tooltipText   = isDark ? '#f5f5f7' : '#1d1d1f';
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const radialBg      = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

  const tooltipStyle = {
    background: tooltipBg, border: `1px solid ${tooltipBorder}`,
    borderRadius: 12, color: tooltipText, fontSize: 12, padding: '10px 14px',
    boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.1)',
  };

  const sortedPredictions = [...aiPredictions].sort((a, b) => a.daysRemaining - b.daysRemaining);
  const avgConfidence = Math.round(aiPredictions.reduce((acc, p) => acc + p.confidence, 0) / aiPredictions.length);
  const confidenceData = [{ name: 'Confianza', value: avgConfidence, fill: 'var(--accent)' }];

  const quickStats = [
    { icon: Zap, value: `${avgConfidence}%`, label: 'Confianza promedio', color: '#5856d6', bg: 'rgba(88,86,214,0.1)' },
    { icon: TrendingDown, value: sortedPredictions.filter(p => p.daysRemaining <= 2).length, label: 'Productos urgentes', color: '#ff453a', bg: 'rgba(255,69,58,0.1)' },
    { icon: ShoppingCart, value: aiPredictions.reduce((acc, p) => acc + p.restockRecommendation, 0), label: 'Unidades sugeridas', color: '#0a84ff', bg: 'rgba(10,132,255,0.1)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Inteligencia artificial
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Brain style={{ width: 26, height: 26, color: 'var(--accent)', strokeWidth: 1.75 }} />
            IA Insights
          </h1>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', borderRadius: 20,
          background: 'rgba(48,209,88,0.1)',
          border: '1px solid rgba(48,209,88,0.2)',
        }}>
          <div className="pulse-glow" style={{ width: 7, height: 7, borderRadius: '50%', background: '#30d158' }} />
          <span style={{ fontSize: 12, color: '#30d158', fontWeight: 600 }}>Modelo activo</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="animate-fade-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {quickStats.map(({ icon: Icon, value, label, color, bg }) => (
          <div key={label} className="card" style={{ padding: '20px 22px', borderRadius: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon style={{ width: 19, height: 19, color, strokeWidth: 1.75 }} />
              </div>
              <div>
                <p style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>{value}</p>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Predictions Table + Confidence */}
      <div className="animate-fade-up delay-2" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>

        {/* Table */}
        <div className="card" style={{ borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock style={{ width: 15, height: 15, color: 'var(--text-3)', strokeWidth: 1.75 }} />
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>Predicciones de consumo</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={thStyle}>Producto</th>
                  <th style={thStyle}>Stock</th>
                  <th style={thStyle}>Cons./día</th>
                  <th style={thStyle}>Días</th>
                  <th style={thStyle}>Reposición</th>
                  <th style={thStyle}>Conf.</th>
                </tr>
              </thead>
              <tbody>
                {sortedPredictions.map((pred, i) => (
                  <tr
                    key={pred.product}
                    style={{
                      borderBottom: i < sortedPredictions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ ...tdStyle, fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{pred.product}</td>
                    <td style={{ ...tdStyle, fontSize: 13, color: 'var(--text-2)' }}>{pred.currentStock} {pred.unit}</td>
                    <td style={{ ...tdStyle, fontSize: 13, color: 'var(--text-2)' }}>{pred.dailyConsumption} {pred.unit}</td>
                    <td style={tdStyle}>
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: pred.daysRemaining <= 1.5 ? '#ff453a' : pred.daysRemaining <= 3 ? '#ff9f0a' : '#30d158',
                      }}>
                        {pred.daysRemaining.toFixed(1)}d
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#0a84ff' }}>
                        <ArrowUpRight style={{ width: 12, height: 12, strokeWidth: 2 }} />
                        {pred.restockRecommendation} {pred.unit}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 40, height: 4, background: 'var(--progress-bg)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 2, background: 'var(--accent)', width: `${pred.confidence}%` }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{pred.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confidence Radial */}
        <div className="card" style={{ padding: 24, borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 20 }}>Confianza del Modelo</h3>
          <div style={{ width: 180, height: 180, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="62%" outerRadius="90%" data={confidenceData} startAngle={90} endAngle={-270}>
                <RadialBar background={{ fill: radialBg }} dataKey="value" cornerRadius={8} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>{avgConfidence}%</p>
              <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>Precisión</p>
            </div>
          </div>

          <div style={{ width: '100%', marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Productos analizados', aiPredictions.length],
              ['Alertas generadas', aiAlerts.length],
              ['Última actualización', 'Hace 5 min'],
            ].map(([label, val]) => (
              <div key={String(label)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-3)' }}>{label}</span>
                <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="card animate-fade-up delay-3" style={{ padding: 24, borderRadius: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>
          Tendencia de Consumo
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>Por producto — últimas 4 semanas</p>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="polloGrad"    x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5856d6" stopOpacity={0.2} /><stop offset="100%" stopColor="#5856d6" stopOpacity={0} /></linearGradient>
                <linearGradient id="carneGrad"    x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a84ff" stopOpacity={0.2} /><stop offset="100%" stopColor="#0a84ff" stopOpacity={0} /></linearGradient>
                <linearGradient id="tomateGrad"   x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff453a" stopOpacity={0.2} /><stop offset="100%" stopColor="#ff453a" stopOpacity={0} /></linearGradient>
                <linearGradient id="camaronesGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#30d158" stopOpacity={0.2} /><stop offset="100%" stopColor="#30d158" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
              <XAxis dataKey="day" tick={{ fill: chartText, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: chartText, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="pollo"     name="Pollo"     stroke="#5856d6" fill="url(#polloGrad)"     strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="carne"     name="Carne"     stroke="#0a84ff" fill="url(#carneGrad)"     strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="tomate"    name="Tomate"    stroke="#ff453a" fill="url(#tomateGrad)"    strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="camarones" name="Camarones" stroke="#30d158" fill="url(#camaronesGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
