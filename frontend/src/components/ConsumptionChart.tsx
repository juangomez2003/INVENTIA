import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { WeeklyConsumption } from '../types';
import { useTheme } from '../context/ThemeContext';

interface ConsumptionChartProps {
  data: WeeklyConsumption[];
}

export default function ConsumptionChart({ data }: ConsumptionChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartText    = isDark ? 'rgba(245,245,247,0.35)' : 'rgba(29,29,31,0.4)';
  const chartGrid    = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
  const tooltipBg    = isDark ? '#2c2c2e' : '#ffffff';
  const tooltipText  = isDark ? '#f5f5f7' : '#1d1d1f';
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const tooltipStyle = {
    background: tooltipBg,
    border: `1px solid ${tooltipBorder}`,
    borderRadius: 12,
    boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.1)',
    color: tooltipText,
    fontSize: 12,
    padding: '10px 14px',
  };

  return (
    <div className="card" style={{ padding: 24, borderRadius: 16 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4, letterSpacing: '-0.01em' }}>
        Consumo vs Reposición
      </h3>
      <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>Tendencia semanal</p>
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="consumedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#30d158" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#30d158" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="restockedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#0a84ff" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#0a84ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
            <XAxis dataKey="day" tick={{ fill: chartText, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: chartText, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend
              wrapperStyle={{ fontSize: 12, color: chartText, paddingTop: 12 }}
            />
            <Area type="monotone" dataKey="consumed"  name="Consumido" stroke="#30d158" fill="url(#consumedGrad)"  strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="restocked" name="Repuesto"  stroke="#0a84ff" fill="url(#restockedGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
