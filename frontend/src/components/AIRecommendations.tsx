import { Brain, TrendingUp, ShoppingCart } from 'lucide-react';
import type { AIPrediction } from '../types';

interface AIRecommendationsProps {
  predictions: AIPrediction[];
}

export default function AIRecommendations({ predictions }: AIRecommendationsProps) {
  const urgentItems = predictions.filter(p => p.daysRemaining <= 2).sort((a, b) => a.daysRemaining - b.daysRemaining);

  return (
    <div className="glass p-5 rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center">
          <Brain className="w-4 h-4 text-purple-300" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Recomendaciones IA</h3>
          <p className="text-[11px] text-white/35">Basado en consumo histórico</p>
        </div>
      </div>

      <div className="space-y-3">
        {urgentItems.slice(0, 4).map((item) => (
          <div key={item.product} className="bg-white/[0.03] rounded-xl p-3 border border-white/5 hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/80">{item.product}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                item.daysRemaining <= 1.5
                  ? 'text-red-400 bg-red-500/15'
                  : 'text-amber-400 bg-amber-500/15'
              }`}>
                {item.daysRemaining.toFixed(1)}d restantes
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-white/40">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>{item.dailyConsumption} {item.unit}/día</span>
              </div>
              <div className="flex items-center gap-1">
                <ShoppingCart className="w-3 h-3" />
                <span>Comprar {item.restockRecommendation} {item.unit}</span>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                  style={{ width: `${item.confidence}%` }}
                />
              </div>
              <span className="text-[10px] text-white/30">{item.confidence}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
