import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TopProduct } from '../types';

interface TopProductsChartProps {
  data: TopProduct[];
}

export default function TopProductsChart({ data }: TopProductsChartProps) {
  return (
    <div className="glass p-5 rounded-2xl">
      <h3 className="text-base font-semibold text-white mb-4">Top Productos por Ventas</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: 'rgba(15, 12, 41, 0.9)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '12px',
                backdropFilter: 'blur(20px)',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value, name) => {
                if (name === 'revenue') return [`$${Number(value).toFixed(2)}`, 'Ingresos'];
                return [String(value), 'Ventas'];
              }}
            />
            <Bar dataKey="sales" name="Ventas" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
