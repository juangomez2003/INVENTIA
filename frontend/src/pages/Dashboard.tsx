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

  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const todayFormatted = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div
        className="animate-fade-up"
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
      >
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Panel de control
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>
            Dashboard
          </h1>
        </div>
        <div style={{
          fontSize: 13, color: 'var(--text-3)',
          background: 'var(--surface)',
          padding: '8px 14px', borderRadius: 10,
          boxShadow: 'var(--card-shadow)',
          fontWeight: 400,
        }}>
          {todayFormatted}
        </div>
      </div>

      {/* Stats Cards */}
      <div
        className="animate-fade-up delay-1"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}
      >
        <StatsCard
          title="Total Productos"
          value={totalProducts}
          icon={<Package style={{ width: 20, height: 20, color: '#007aff' }} />}
          trend={{ value: 8, positive: true }}
          accentColor="#007aff"
        />
        <StatsCard
          title="Stock Bajo"
          value={lowStockCount}
          subtitle="Requieren atención"
          icon={<AlertTriangle style={{ width: 20, height: 20, color: '#ff453a' }} />}
          trend={{ value: 12, positive: false }}
          accentColor="#ff453a"
        />
        <StatsCard
          title="Ventas Hoy"
          value={`$${todaySales}`}
          icon={<TrendingUp style={{ width: 20, height: 20, color: '#30d158' }} />}
          trend={{ value: 15, positive: true }}
          accentColor="#30d158"
        />
        <StatsCard
          title="Precisión IA"
          value={`${aiAccuracy}%`}
          subtitle="Modelo de predicción"
          icon={<Brain style={{ width: 20, height: 20, color: '#5856d6' }} />}
          trend={{ value: 3, positive: true }}
          accentColor="#5856d6"
        />
      </div>

      {/* Charts Row */}
      <div
        className="animate-fade-up delay-2"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 14 }}
      >
        <ConsumptionChart data={weeklyConsumption} />
        <TopProductsChart data={topProducts} />
      </div>

      {/* Alerts & Recommendations */}
      <div
        className="animate-fade-up delay-3"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 14 }}
      >
        <AlertsPanel alerts={aiAlerts} />
        <AIRecommendations predictions={aiPredictions} />
      </div>
    </div>
  );
}
