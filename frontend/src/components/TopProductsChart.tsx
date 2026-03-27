import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { TopProduct } from '../types';
import { useTheme } from '../context/ThemeContext';

const BAR_COLORS = ['#30d158', '#34c759', '#4cd964', '#5ac8fa', '#007aff', '#5856d6'];

interface TopProductsChartProps {
  data: TopProduct[];
}

export default function TopProductsChart({ data }: TopProductsChartProps) {
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
        Top Productos
      </h3>
      <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>Por volumen de ventas</p>
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: chartText, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: chartText, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value, name) => {
                if (name === 'revenue') return [`$${Number(value).toFixed(2)}`, 'Ingresos'];
                return [String(value), 'Ventas'];
              }}
            />
            <Bar dataKey="sales" name="Ventas" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} fillOpacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
