import { Brain, TrendingDown, ShoppingCart, Zap, ArrowUpRight, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { aiPredictions, aiAlerts } from '../data/mockData';

const trendData = [
  { day: 'Sem 1', pollo: 30, tomate: 12, carne: 18, camarones: 8 },
  { day: 'Sem 2', pollo: 35, tomate: 14, carne: 20, camarones: 10 },
  { day: 'Sem 3', pollo: 28, tomate: 16, carne: 22, camarones: 7 },
  { day: 'Sem 4', pollo: 42, tomate: 18, carne: 25, camarones: 12 },
];

export default function AIInsights() {
  const sortedPredictions = [...aiPredictions].sort((a, b) => a.daysRemaining - b.daysRemaining);
  const avgConfidence = Math.round(aiPredictions.reduce((acc, p) => acc + p.confidence, 0) / aiPredictions.length);

  const confidenceData = [
    { name: 'Confianza', value: avgConfidence, fill: '#a855f7' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="w-7 h-7 text-purple-400" />
            IA Insights
          </h1>
          <p className="text-sm text-white/40 mt-0.5">Predicciones y recomendaciones del agente de IA</p>
        </div>
        <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Modelo activo</span>
        </div>
      </div>

      {/* Quick AI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-2xl glow-purple">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{avgConfidence}%</p>
              <p className="text-xs text-white/40">Confianza promedio</p>
            </div>
          </div>
        </div>
        <div className="glass p-5 rounded-2xl glow-pink">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{sortedPredictions.filter(p => p.daysRemaining <= 2).length}</p>
              <p className="text-xs text-white/40">Productos urgentes</p>
            </div>
          </div>
        </div>
        <div className="glass p-5 rounded-2xl glow-cyan">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{aiPredictions.reduce((acc, p) => acc + p.restockRecommendation, 0)}</p>
              <p className="text-xs text-white/40">Unidades sugeridas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Predictions Table + Confidence Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/40" />
              Predicciones de Consumo
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-white/30 px-5 py-3 uppercase tracking-wider">Producto</th>
                  <th className="text-left text-xs font-medium text-white/30 px-5 py-3 uppercase tracking-wider">Stock</th>
                  <th className="text-left text-xs font-medium text-white/30 px-5 py-3 uppercase tracking-wider">Consumo/día</th>
                  <th className="text-left text-xs font-medium text-white/30 px-5 py-3 uppercase tracking-wider">Días restantes</th>
                  <th className="text-left text-xs font-medium text-white/30 px-5 py-3 uppercase tracking-wider">Reposición</th>
                  <th className="text-left text-xs font-medium text-white/30 px-5 py-3 uppercase tracking-wider">Confianza</th>
                </tr>
              </thead>
              <tbody>
                {sortedPredictions.map((pred) => (
                  <tr key={pred.product} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-white/90">{pred.product}</td>
                    <td className="px-5 py-3.5 text-sm text-white/60">{pred.currentStock} {pred.unit}</td>
                    <td className="px-5 py-3.5 text-sm text-white/60">{pred.dailyConsumption} {pred.unit}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-sm font-semibold ${
                        pred.daysRemaining <= 1.5 ? 'text-red-400' :
                        pred.daysRemaining <= 3 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {pred.daysRemaining.toFixed(1)} días
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1 text-sm text-cyan-400">
                        <ArrowUpRight className="w-3 h-3" />
                        {pred.restockRecommendation} {pred.unit}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500" style={{ width: `${pred.confidence}%` }} />
                        </div>
                        <span className="text-xs text-white/40">{pred.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confidence Radial */}
        <div className="glass p-5 rounded-2xl flex flex-col items-center justify-center">
          <h3 className="text-base font-semibold text-white mb-4">Confianza del Modelo</h3>
          <div className="w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={confidenceData} startAngle={90} endAngle={-270}>
                <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-3xl font-bold text-white -mt-28">{avgConfidence}%</p>
          <p className="text-xs text-white/30 mt-2">Precisión general</p>

          <div className="w-full mt-8 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">Productos analizados</span>
              <span className="text-white/70">{aiPredictions.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">Alertas generadas</span>
              <span className="text-white/70">{aiAlerts.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">Última actualización</span>
              <span className="text-white/70">Hace 5 min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="glass p-5 rounded-2xl">
        <h3 className="text-base font-semibold text-white mb-4">Tendencia de Consumo por Producto (4 Semanas)</h3>
        <div className="h-[300px]">
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
                  background: 'rgba(15, 12, 41, 0.9)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(20px)',
                  color: '#fff',
                  fontSize: '12px',
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
