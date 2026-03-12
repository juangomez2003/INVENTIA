import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { WeeklyConsumption } from '../types';

interface ConsumptionChartProps {
  data: WeeklyConsumption[];
}

export default function ConsumptionChart({ data }: ConsumptionChartProps) {
  return (
    <div className="glass p-5 rounded-2xl">
      <h3 className="text-base font-semibold text-white mb-4">Consumo vs Reposición Semanal</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="consumedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="restockedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
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
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }} />
            <Area type="monotone" dataKey="consumed" name="Consumido" stroke="#a855f7" fill="url(#consumedGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="restocked" name="Repuesto" stroke="#06b6d4" fill="url(#restockedGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
