import { useEffect, useState } from 'react';
import { Brain, TrendingDown, ShoppingCart, Zap, ArrowUpRight, Clock, Loader } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { aiService } from '../services/aiService';
import type { AIPrediction, AIAlert } from '../types';

const thStyle: React.CSSProperties = {
  textAlign: 'left', fontSize: 11, fontWeight: 600,
  color: 'var(--text-3)', padding: '12px 20px',
  textTransform: 'uppercase', letterSpacing: '0.06em',
};
const tdStyle: React.CSSProperties = { padding: '13px 20px' };

const WEEK_COLORS = ['#5856d6', '#0a84ff', '#ff453a', '#30d158', '#ff9f0a', '#64d2ff'];

export default function AIInsights() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [alerts, setAlerts]           = useState<AIAlert[]>([]);
  const [trendData, setTrendData]     = useState<any[]>([]);
  const [trendKeys, setTrendKeys]     = useState<string[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [preds, alrts, movements] = await Promise.all([
          aiService.getPredictions(),
          aiService.getAlerts(),
          fetchMovements(),
        ]);
        setPredictions(preds);
        setAlerts(alrts);
        const { data, keys } = buildTrendData(preds, movements);
        setTrendData(data);
        setTrendKeys(keys);
      } catch (e) {
        console.error('AIInsights load error:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const chartText     = isDark ? 'rgba(245,245,247,0.35)' : 'rgba(29,29,31,0.4)';
  const chartGrid     = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
  const tooltipBg     = isDark ? '#2c2c2e' : '#ffffff';
  const tooltipText   = isDark ? '#f5f5f7' : '#1d1d1f';
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const radialBg      = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const tooltipStyle  = {
    background: tooltipBg, border: `1px solid ${tooltipBorder}`,
    borderRadius: 12, color: tooltipText, fontSize: 12, padding: '10px 14px',
    boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.1)',
  };

  const sortedPredictions = [...predictions].sort((a, b) => a.daysRemaining - b.daysRemaining);
  const avgConfidence = predictions.length
    ? Math.round(predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length)
    : 0;
  const confidenceData = [{ name: 'Confianza', value: avgConfidence, fill: 'var(--accent)' }];

  const quickStats = [
    { icon: Zap,          value: `${avgConfidence}%`,                                          label: 'Confianza promedio',  color: '#5856d6', bg: 'rgba(88,86,214,0.1)' },
    { icon: TrendingDown, value: sortedPredictions.filter(p => p.daysRemaining <= 2).length,   label: 'Productos urgentes',  color: '#ff453a', bg: 'rgba(255,69,58,0.1)' },
    { icon: ShoppingCart, value: predictions.reduce((acc, p) => acc + p.restockRecommendation, 0), label: 'Unidades sugeridas', color: '#0a84ff', bg: 'rgba(10,132,255,0.1)' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 10, color: 'var(--text-3)', fontSize: 14 }}>
        <Loader style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} />
        Cargando análisis IA...
      </div>
    );
  }

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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 20, background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.2)' }}>
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
        <div className="card" style={{ borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock style={{ width: 15, height: 15, color: 'var(--text-3)', strokeWidth: 1.75 }} />
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>Predicciones de consumo</h3>
          </div>
          {sortedPredictions.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
              No hay suficientes datos para generar predicciones aún.
            </div>
          ) : (
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
                    <tr key={pred.product} style={{ borderBottom: i < sortedPredictions.length - 1 ? '1px solid var(--border-subtle)' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ ...tdStyle, fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{pred.product}</td>
                      <td style={{ ...tdStyle, fontSize: 13, color: 'var(--text-2)' }}>{pred.currentStock} {pred.unit}</td>
                      <td style={{ ...tdStyle, fontSize: 13, color: 'var(--text-2)' }}>{pred.dailyConsumption.toFixed(2)} {pred.unit}</td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: pred.daysRemaining <= 1.5 ? '#ff453a' : pred.daysRemaining <= 3 ? '#ff9f0a' : '#30d158' }}>
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
                            <div style={{ height: '100%', borderRadius: 2, background: 'var(--accent)', width: `${pred.confidence * 100}%` }} />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{Math.round(pred.confidence * 100)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>{avgConfidence}%</p>
              <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>Precisión</p>
            </div>
          </div>
          <div style={{ width: '100%', marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Productos analizados', predictions.length],
              ['Alertas generadas',    alerts.length],
              ['Última actualización', 'Ahora'],
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
      {trendData.length > 0 && (
        <div className="card animate-fade-up delay-3" style={{ padding: 24, borderRadius: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Tendencia de Consumo</h3>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>Top productos — últimas 4 semanas</p>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {trendKeys.map((key, i) => (
                    <linearGradient key={key} id={`grad_${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={WEEK_COLORS[i % WEEK_COLORS.length]} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={WEEK_COLORS[i % WEEK_COLORS.length]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                <XAxis dataKey="week" tick={{ fill: chartText, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartText, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                {trendKeys.map((key, i) => (
                  <Area key={key} type="monotone" dataKey={key} name={key} stroke={WEEK_COLORS[i % WEEK_COLORS.length]} fill={`url(#grad_${i})`} strokeWidth={2} dot={false} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

async function fetchMovements(): Promise<any[]> {
  try {
    const { supabase } = await import('../lib/supabase');
    const { data } = await supabase!.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return [];
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    const res = await fetch(`${apiUrl}/inventory/movements?limit=500`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok ? await res.json() : [];
  } catch { return []; }
}

function buildTrendData(predictions: AIPrediction[], movements: any[]) {
  // Top 4 productos por volumen de consumo
  const productTotals: Record<string, number> = {};
  for (const m of movements) {
    if (m.movement_type === 'salida') {
      productTotals[m.product_name] = (productTotals[m.product_name] || 0) + Number(m.quantity);
    }
  }
  const topProducts = Object.entries(productTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name]) => name);

  if (topProducts.length === 0) return { data: [], keys: [] };

  // Agrupar por semana (últimas 4)
  const weeks: Record<string, Record<string, number>> = {};
  const now = new Date();
  for (let w = 3; w >= 0; w--) {
    const label = `Sem ${4 - w}`;
    weeks[label] = {};
    topProducts.forEach(p => { weeks[label][p] = 0; });
  }

  for (const m of movements) {
    if (m.movement_type !== 'salida') continue;
    if (!topProducts.includes(m.product_name)) continue;
    const date = new Date(m.created_at);
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    const weekIdx = Math.floor(diffDays / 7);
    if (weekIdx > 3) continue;
    const label = `Sem ${4 - weekIdx}`;
    weeks[label][m.product_name] = (weeks[label][m.product_name] || 0) + Number(m.quantity);
  }

  const data = Object.entries(weeks).map(([week, vals]) => ({
    week,
    ...Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, Math.round(v * 100) / 100])),
  }));

  return { data, keys: topProducts };
}
