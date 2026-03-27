import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import type { AIAlert } from '../types';

const alertConfig = {
  critical: { icon: AlertCircle,  color: '#ff453a', bg: 'rgba(255,69,58,0.08)',  label: 'Crítica' },
  warning:  { icon: AlertTriangle,color: '#ff9f0a', bg: 'rgba(255,159,10,0.08)', label: 'Advertencia' },
  info:     { icon: Info,         color: '#0a84ff', bg: 'rgba(10,132,255,0.08)', label: 'Info' },
  success:  { icon: CheckCircle,  color: '#30d158', bg: 'rgba(48,209,88,0.08)',  label: 'OK' },
};

interface AlertsPanelProps {
  alerts: AIAlert[];
  maxVisible?: number;
}

export default function AlertsPanel({ alerts, maxVisible = 5 }: AlertsPanelProps) {
  const visibleAlerts = alerts.slice(0, maxVisible);
  const activeCount = alerts.filter(a => a.type === 'critical' || a.type === 'warning').length;

  return (
    <div className="card" style={{ padding: 24, borderRadius: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>Alertas IA</h3>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{activeCount} alertas activas</p>
        </div>
        {activeCount > 0 && (
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#ff453a',
          }} className="pulse-glow" />
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {visibleAlerts.map((alert) => {
          const cfg = alertConfig[alert.type];
          const Icon = cfg.icon;
          return (
            <div
              key={alert.id}
              style={{
                background: cfg.bg,
                borderRadius: 12, padding: '12px 14px',
                transition: 'opacity 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <Icon style={{ width: 15, height: 15, color: cfg.color, marginTop: 1, flexShrink: 0, strokeWidth: 2 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: cfg.color, marginBottom: 3 }}>{alert.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>{alert.message}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5 }}>
                    {new Date(alert.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    {' · '}{alert.product}
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
