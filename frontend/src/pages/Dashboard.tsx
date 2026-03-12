import { Package, AlertTriangle, TrendingUp, Brain } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import AlertsPanel from '../components/AlertsPanel';
import AIRecommendations from '../components/AIRecommendations';
import ConsumptionChart from '../components/ConsumptionChart';
import TopProductsChart from '../components/TopProductsChart';
import { products, aiAlerts, aiPredictions, weeklyConsumption, topProducts, getStockStatus } from '../data/mockData';

export default function Dashboard() {
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => {
    const s = getStockStatus(p);
    return s === 'critical' || s === 'low';
  }).length;
  const todaySales = 237;
  const aiAccuracy = 91;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-white/40 mt-0.5">La Casa del Sabor &middot; Resumen del día</p>
        </div>
        <div className="glass px-4 py-2 rounded-xl text-xs text-white/40">
          {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Productos"
          value={totalProducts}
          icon={<Package className="w-5 h-5 text-purple-400" />}
          trend={{ value: 8, positive: true }}
          glowClass="glow-purple"
        />
        <StatsCard
          title="Stock Bajo"
          value={lowStockCount}
          subtitle="Requieren atención"
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          trend={{ value: 12, positive: false }}
          glowClass="glow-pink"
        />
        <StatsCard
          title="Ventas Hoy"
          value={`$${todaySales}`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          trend={{ value: 15, positive: true }}
          glowClass="glow-green"
        />
        <StatsCard
          title="Precisión IA"
          value={`${aiAccuracy}%`}
          subtitle="Modelo de predicción"
          icon={<Brain className="w-5 h-5 text-cyan-400" />}
          trend={{ value: 3, positive: true }}
          glowClass="glow-cyan"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ConsumptionChart data={weeklyConsumption} />
        <TopProductsChart data={topProducts} />
      </div>

      {/* Alerts & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AlertsPanel alerts={aiAlerts} />
        <AIRecommendations predictions={aiPredictions} />
      </div>
    </div>
  );
}
