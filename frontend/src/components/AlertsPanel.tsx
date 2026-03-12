import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import type { AIAlert } from '../types';

const alertStyles = {
  critical: { icon: AlertCircle, color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
  warning: { icon: AlertTriangle, color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  info: { icon: Info, color: '#60a5fa', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
  success: { icon: CheckCircle, color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
};

interface AlertsPanelProps {
  alerts: AIAlert[];
  maxVisible?: number;
}

export default function AlertsPanel({ alerts, maxVisible = 5 }: AlertsPanelProps) {
  const visibleAlerts = alerts.slice(0, maxVisible);

  return (
    <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>Alertas IA</h3>
        <span style={{
          fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)',
          background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 8,
        }}>
          {alerts.filter(a => a.type === 'critical' || a.type === 'warning').length} activas
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {visibleAlerts.map((alert) => {
          const config = alertStyles[alert.type];
          const Icon = config.icon;

          return (
            <div
              key={alert.id}
              style={{
                background: config.bg,
                border: `1px solid ${config.border}`,
                borderRadius: 12, padding: 14,
                transition: 'transform 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ marginTop: 2, flexShrink: 0 }}>
                  <Icon style={{ width: 16, height: 16, color: config.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: config.color }}>{alert.title}</span>
                    <div className={alert.type === 'critical' ? 'pulse-glow' : ''} style={{
                      width: 6, height: 6, borderRadius: '50%', background: config.color,
                    }} />
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{alert.message}</p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 6 }}>
                    {new Date(alert.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    {' - '}{alert.product}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
