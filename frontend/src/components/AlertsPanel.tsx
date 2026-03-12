import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import type { AIAlert } from '../types';

const alertConfig = {
  critical: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-red-500' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-500' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-500' },
  success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
};

interface AlertsPanelProps {
  alerts: AIAlert[];
  maxVisible?: number;
}

export default function AlertsPanel({ alerts, maxVisible = 5 }: AlertsPanelProps) {
  const visibleAlerts = alerts.slice(0, maxVisible);

  return (
    <div className="glass p-5 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white">Alertas IA</h3>
        <span className="text-xs font-medium text-white/40 bg-white/5 px-2.5 py-1 rounded-lg">
          {alerts.filter(a => a.type === 'critical' || a.type === 'warning').length} activas
        </span>
      </div>

      <div className="space-y-2.5">
        {visibleAlerts.map((alert) => {
          const config = alertConfig[alert.type];
          const Icon = config.icon;

          return (
            <div
              key={alert.id}
              className={`${config.bg} border ${config.border} rounded-xl p-3 transition-all duration-200 hover:scale-[1.01]`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-semibold ${config.color}`}>{alert.title}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${config.dot} ${alert.type === 'critical' ? 'pulse-glow' : ''}`} />
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">{alert.message}</p>
                  <p className="text-[10px] text-white/25 mt-1.5">
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
