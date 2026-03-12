import { Brain, TrendingDown, ShoppingCart, Zap, ArrowUpRight, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { aiPredictions, aiAlerts } from '../data/mockData';

const trendData = [
  { day: 'Sem 1', pollo: 30, tomate: 12, carne: 18, camarones: 8 },
  { day: 'Sem 2', pollo: 35, tomate: 14, carne: 20, camarones: 10 },
  { day: 'Sem 3', pollo: 28, tomate: 16, carne: 22, camarones: 7 },
  { day: 'Sem 4', pollo: 42, tomate: 18, carne: 25, camarones: 12 },
];

const thStyle: React.CSSProperties = {
  textAlign: 'left', fontSize: 11, fontWeight: 500,
  color: 'rgba(255,255,255,0.3)', padding: '12px 20px',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};

const tdStyle: React.CSSProperties = {
  padding: '14px 20px',
};

export default function AIInsights() {
  const sortedPredictions = [...aiPredictions].sort((a, b) => a.daysRemaining - b.daysRemaining);
  const avgConfidence = Math.round(aiPredictions.reduce((acc, p) => acc + p.confidence, 0) / aiPredictions.length);

  const confidenceData = [
    { name: 'Confianza', value: avgConfidence, fill: '#a855f7' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 12, letterSpacing: '-0.02em' }}>
            <Brain style={{ width: 28, height: 28, color: '#c084fc' }} />
            IA Insights
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Predicciones y recomendaciones del agente de IA</p>
        </div>
        <div className="glass" style={{ padding: '8px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="pulse-glow" style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
          <span style={{ fontSize: 12, color: '#34d399', fontWeight: 500 }}>Modelo activo</span>
        </div>
      </div>

      {/* Quick AI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div className="glass glow-purple" style={{ padding: 20, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: 20, height: 20, color: '#c084fc' }} />
            </div>
            <div>
              <p style={{ fontSize: 26, fontWeight: 700, color: 'white' }}>{avgConfidence}%</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Confianza promedio</p>
            </div>
          </div>
        </div>
        <div className="glass glow-pink" style={{ padding: 20, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown style={{ width: 20, height: 20, color: '#f87171' }} />
            </div>
            <div>
              <p style={{ fontSize: 26, fontWeight: 700, color: 'white' }}>{sortedPredictions.filter(p => p.daysRemaining <= 2).length}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Productos urgentes</p>
            </div>
          </div>
        </div>
        <div className="glass glow-cyan" style={{ padding: 20, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart style={{ width: 20, height: 20, color: '#22d3ee' }} />
            </div>
            <div>
              <p style={{ fontSize: 26, fontWeight: 700, color: 'white' }}>{aiPredictions.reduce((acc, p) => acc + p.restockRecommendation, 0)}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Unidades sugeridas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Predictions Table + Confidence Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="glass" style={{ borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: 20, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.4)' }} />
              Predicciones de consumo
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th style={thStyle}>Producto</th>
                  <th style={thStyle}>Stock</th>
                  <th style={thStyle}>Consumo/día</th>
                  <th style={thStyle}>Días restantes</th>
                  <th style={thStyle}>Reposición</th>
                  <th style={thStyle}>Confianza</th>
                </tr>
              </thead>
              <tbody>
                {sortedPredictions.map((pred) => (
                  <tr key={pred.product} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                    <td style={{ ...tdStyle, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>{pred.product}</td>
                    <td style={{ ...tdStyle, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{pred.currentStock} {pred.unit}</td>
                    <td style={{ ...tdStyle, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{pred.dailyConsumption} {pred.unit}</td>
                    <td style={tdStyle}>
                      <span style={{
                        fontSize: 13, fontWeight: 600,
                        color: pred.daysRemaining <= 1.5 ? '#f87171' : pred.daysRemaining <= 3 ? '#fbbf24' : '#34d399',
                      }}>
                        {pred.daysRemaining.toFixed(1)} días
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#22d3ee' }}>
                        <ArrowUpRight style={{ width: 12, height: 12 }} />
                        {pred.restockRecommendation} {pred.unit}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 48, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #a855f7, #06b6d4)', width: `${pred.confidence}%` }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{pred.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confidence Radial */}
        <div className="glass" style={{
          padding: 24, borderRadius: 16,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 16 }}>Confianza del Modelo</h3>
          <div style={{ width: 192, height: 192 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={confidenceData} startAngle={90} endAngle={-270}>
                <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: 30, fontWeight: 700, color: 'white', marginTop: -112 }}>{avgConfidence}%</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>Precisión general</p>

          <div style={{ width: '100%', marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Productos analizados', aiPredictions.length],
              ['Alertas generadas', aiAlerts.length],
              ['Última actualización', 'Hace 5 min'],
            ].map(([label, val]) => (
              <div key={String(label)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 20 }}>Tendencia de Consumo por Producto (4 Semanas)</h3>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="polloGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="carneGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tomateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="camaronesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 12, 41, 0.95)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(20px)',
                  color: '#fff',
                  fontSize: '12px',
                  padding: '10px 14px',
                }}
              />
              <Area type="monotone" dataKey="pollo" name="Pollo" stroke="#a855f7" fill="url(#polloGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="carne" name="Carne" stroke="#06b6d4" fill="url(#carneGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="tomate" name="Tomate" stroke="#f43f5e" fill="url(#tomateGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="camarones" name="Camarones" stroke="#10b981" fill="url(#camaronesGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
