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
    <div
      className={`glass ${glowClass}`}
      style={{
        padding: 20,
        borderRadius: 16,
        transition: 'all 0.3s',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        {trend && (
          <span style={{
            fontSize: 12, fontWeight: 600,
            padding: '4px 10px', borderRadius: 8,
            color: trend.positive ? '#34d399' : '#f87171',
            background: trend.positive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          }}>
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <h3 style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 4, letterSpacing: '-0.02em' }}>{value}</h3>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{title}</p>
      {subtitle && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>{subtitle}</p>}
    </div>
  );
}
