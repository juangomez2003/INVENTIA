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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>La Casa del Sabor &middot; Resumen del día</p>
        </div>
        <div className="glass" style={{ padding: '8px 16px', borderRadius: 12, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <StatsCard
          title="Total Productos"
          value={totalProducts}
          icon={<Package style={{ width: 20, height: 20, color: '#c084fc' }} />}
          trend={{ value: 8, positive: true }}
          glowClass="glow-purple"
        />
        <StatsCard
          title="Stock Bajo"
          value={lowStockCount}
          subtitle="Requieren atención"
          icon={<AlertTriangle style={{ width: 20, height: 20, color: '#fbbf24' }} />}
          trend={{ value: 12, positive: false }}
          glowClass="glow-pink"
        />
        <StatsCard
          title="Ventas Hoy"
          value={`$${todaySales}`}
          icon={<TrendingUp style={{ width: 20, height: 20, color: '#34d399' }} />}
          trend={{ value: 15, positive: true }}
          glowClass="glow-green"
        />
        <StatsCard
          title="Precisión IA"
          value={`${aiAccuracy}%`}
          subtitle="Modelo de predicción"
          icon={<Brain style={{ width: 20, height: 20, color: '#22d3ee' }} />}
          trend={{ value: 3, positive: true }}
          glowClass="glow-cyan"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>
        <ConsumptionChart data={weeklyConsumption} />
        <TopProductsChart data={topProducts} />
      </div>

      {/* Alerts & Recommendations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>
        <AlertsPanel alerts={aiAlerts} />
        <AIRecommendations predictions={aiPredictions} />
      </div>
    </div>
  );
}
