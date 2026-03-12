import type { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: number; positive: boolean };
  glowClass?: string;
}

export default function StatsCard({ title, value, subtitle, icon, trend, glowClass = '' }: StatsCardProps) {
  return (
    <div className={`glass p-5 rounded-2xl hover:bg-white/[0.08] transition-all duration-300 ${glowClass}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center border border-white/10">
          {icon}
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-lg ${
              trend.positive
                ? 'text-emerald-400 bg-emerald-500/15'
                : 'text-red-400 bg-red-500/15'
            }`}
          >
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-sm text-white/40">{title}</p>
      {subtitle && <p className="text-xs text-white/25 mt-1">{subtitle}</p>}
    </div>
  );
}
