import type { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: number; positive: boolean };
  glowClass?: string;
  accentColor?: string;
}

export default function StatsCard({ title, value, subtitle, icon, trend, accentColor = 'var(--accent)' }: StatsCardProps) {
  return (
    <div
      className="card card-hover"
      style={{ padding: '22px 24px', cursor: 'default' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        {trend && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: 12, fontWeight: 600,
            padding: '4px 10px', borderRadius: 20,
            color: trend.positive ? '#30d158' : '#ff453a',
            background: trend.positive ? 'rgba(48,209,88,0.1)' : 'rgba(255,69,58,0.1)',
          }}>
            <span>{trend.positive ? '↑' : '↓'}</span>
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
      <p style={{
        fontSize: 32, fontWeight: 700, color: 'var(--text-1)',
        letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 6,
      }}>
        {value}
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 400 }}>{title}</p>
      {subtitle && (
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{subtitle}</p>
      )}
    </div>
  );
}
