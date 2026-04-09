import { useEffect, useState } from 'react';
import { Package, AlertTriangle, TrendingUp, Brain } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import AlertsPanel from '../components/AlertsPanel';
import AIRecommendations from '../components/AIRecommendations';
import ConsumptionChart from '../components/ConsumptionChart';
import TopProductsChart from '../components/TopProductsChart';
import { getStockStatus } from '../data/mockData';
import { inventoryService } from '../services/inventoryService';
import { aiService } from '../services/aiService';
import type { Product, AIAlert, AIPrediction, WeeklyConsumption, TopProduct } from '../types';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyConsumption[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [aiAccuracy, setAiAccuracy] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [prods, alrts, preds, stats, movements] = await Promise.all([
          inventoryService.getProducts(),
          aiService.getAlerts(),
          aiService.getPredictions(),
          aiService.getStats(),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/inventory/movements?limit=200`, {
            headers: { Authorization: `Bearer ${await getToken()}` },
          }).then(r => r.ok ? r.json() : []),
        ]);

        setProducts(prods);
        setAlerts(alrts);
        setPredictions(preds);
        setAiAccuracy(stats.model_accuracy);

        // Construir consumo semanal desde movimientos
        const weekly = buildWeeklyConsumption(movements);
        setWeeklyData(weekly);

        // Top productos por volumen de salidas
        const top = buildTopProducts(prods, movements);
        setTopProducts(top);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const lowStockCount = products.filter(p => {
    const s = getStockStatus(p);
    return s === 'critical' || s === 'low';
  }).length;

  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
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
          value={loading ? '—' : products.length}
          icon={<Package style={{ width: 20, height: 20, color: '#007aff' }} />}
          trend={{ value: 8, positive: true }}
          accentColor="#007aff"
        />
        <StatsCard
          title="Stock Bajo"
          value={loading ? '—' : lowStockCount}
          subtitle="Requieren atención"
          icon={<AlertTriangle style={{ width: 20, height: 20, color: '#ff453a' }} />}
          trend={{ value: lowStockCount > 0 ? 12 : 0, positive: false }}
          accentColor="#ff453a"
        />
        <StatsCard
          title="Predicciones IA"
          value={loading ? '—' : predictions.length}
          subtitle="Productos analizados"
          icon={<TrendingUp style={{ width: 20, height: 20, color: '#30d158' }} />}
          trend={{ value: 15, positive: true }}
          accentColor="#30d158"
        />
        <StatsCard
          title="Precisión IA"
          value={loading ? '—' : `${aiAccuracy}%`}
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
        <ConsumptionChart data={weeklyData} />
        <TopProductsChart data={topProducts} />
      </div>

      {/* Alerts & Recommendations */}
      <div
        className="animate-fade-up delay-3"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 14 }}
      >
        <AlertsPanel alerts={alerts} />
        <AIRecommendations predictions={predictions} />
      </div>
    </div>
  );
}

async function getToken(): Promise<string> {
  try {
    const { supabase } = await import('../lib/supabase');
    const { data } = await supabase!.auth.getSession();
    return data.session?.access_token || '';
  } catch {
    return '';
  }
}

function buildWeeklyConsumption(movements: any[]): WeeklyConsumption[] {
  const today = new Date();
  const result: WeeklyConsumption[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);
    const dayName = DAYS[date.getDay()];

    const dayMovements = movements.filter(m =>
      (m.created_at || '').slice(0, 10) === dateStr
    );

    const consumed = dayMovements
      .filter(m => m.movement_type === 'salida')
      .reduce((sum: number, m: any) => sum + Number(m.quantity), 0);

    const restocked = dayMovements
      .filter(m => m.movement_type === 'entrada')
      .reduce((sum: number, m: any) => sum + Number(m.quantity), 0);

    result.push({ day: dayName, consumed: Math.round(consumed * 10) / 10, restocked: Math.round(restocked * 10) / 10 });
  }
  return result;
}

function buildTopProducts(products: Product[], movements: any[]): TopProduct[] {
  const salesMap: Record<string, { name: string; sales: number; revenue: number }> = {};

  for (const m of movements) {
    if (m.movement_type !== 'salida') continue;
    const prod = products.find(p => p.id === m.product_id);
    if (!prod) continue;
    if (!salesMap[prod.id]) salesMap[prod.id] = { name: prod.name, sales: 0, revenue: 0 };
    salesMap[prod.id].sales += Number(m.quantity);
    salesMap[prod.id].revenue += Number(m.quantity) * prod.pricePerUnit;
  }

  return Object.values(salesMap)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 6)
    .map(p => ({ name: p.name, sales: Math.round(p.sales * 10) / 10, revenue: Math.round(p.revenue * 100) / 100 }));
}
