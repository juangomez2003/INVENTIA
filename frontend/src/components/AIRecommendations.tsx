import { Brain, TrendingUp, ShoppingCart } from 'lucide-react';
import type { AIPrediction } from '../types';

interface AIRecommendationsProps {
  predictions: AIPrediction[];
}

export default function AIRecommendations({ predictions }: AIRecommendationsProps) {
  const urgentItems = predictions.filter(p => p.daysRemaining <= 2).sort((a, b) => a.daysRemaining - b.daysRemaining);

  return (
    <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(6,182,212,0.3))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Brain style={{ width: 16, height: 16, color: '#c4b5fd' }} />
        </div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>Recomendaciones IA</h3>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Basado en consumo histórico</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {urgentItems.slice(0, 4).map((item) => (
          <div key={item.product} style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 12, padding: 14,
            border: '1px solid rgba(255,255,255,0.05)',
            transition: 'border-color 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>{item.product}</span>
              <span style={{
                fontSize: 11, fontWeight: 700,
                padding: '3px 8px', borderRadius: 6,
                color: item.daysRemaining <= 1.5 ? '#f87171' : '#fbbf24',
                background: item.daysRemaining <= 1.5 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
              }}>
                {item.daysRemaining.toFixed(1)}d restantes
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <TrendingUp style={{ width: 12, height: 12 }} />
                <span>{item.dailyConsumption} {item.unit}/día</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShoppingCart style={{ width: 12, height: 12 }} />
                <span>Comprar {item.restockRecommendation} {item.unit}</span>
              </div>
            </div>

            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  background: 'linear-gradient(90deg, #a855f7, #06b6d4)',
                  width: `${item.confidence}%`,
                }} />
              </div>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{item.confidence}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
