import { Brain, ShoppingCart } from 'lucide-react';
import type { AIPrediction } from '../types';

interface AIRecommendationsProps {
  predictions: AIPrediction[];
}

export default function AIRecommendations({ predictions }: AIRecommendationsProps) {
  const urgentItems = predictions
    .filter(p => p.daysRemaining <= 2)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  return (
    <div className="card" style={{ padding: 24, borderRadius: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(88,86,214,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Brain style={{ width: 17, height: 17, color: '#5856d6' }} />
        </div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>Recomendaciones IA</h3>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Basado en consumo histórico</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {urgentItems.slice(0, 4).map((item) => {
          const isUrgent = item.daysRemaining <= 1.5;
          const urgentColor = isUrgent ? '#ff453a' : '#ff9f0a';
          const urgentBg = isUrgent ? 'rgba(255,69,58,0.08)' : 'rgba(255,159,10,0.08)';
          return (
            <div
              key={item.product}
              style={{
                borderRadius: 12, padding: '13px 14px',
                background: 'var(--surface-hover)',
                transition: 'background 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{item.product}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  padding: '3px 9px', borderRadius: 20,
                  color: urgentColor, background: urgentBg,
                }}>
                  {item.daysRemaining.toFixed(1)}d
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-3)' }}>
                  <ShoppingCart style={{ width: 12, height: 12, strokeWidth: 1.75 }} />
                  <span>Comprar {item.restockRecommendation} {item.unit}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  {item.dailyConsumption} {item.unit}/día
                </div>
              </div>

              {/* Confidence bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 4, background: 'var(--progress-bg)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    background: 'var(--accent-gradient)',
                    width: `${item.confidence}%`,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-3)', width: 30, textAlign: 'right' }}>{item.confidence}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
