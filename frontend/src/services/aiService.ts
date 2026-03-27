import { api } from './api'
import type { AIPrediction, AIAlert } from '../types'

interface BackendPrediction {
  product: string
  product_id: string
  current_stock: number
  daily_consumption: number
  days_remaining: number
  restock_recommendation: number
  confidence: number
  unit: string
}

export interface AIStats {
  model_accuracy: number
  urgent_products: number
  total_recommendations: number
  total_restock_units: number
  last_updated: string
}

function toFrontend(p: BackendPrediction): AIPrediction {
  return {
    product: p.product,
    currentStock: p.current_stock,
    dailyConsumption: p.daily_consumption,
    daysRemaining: p.days_remaining,
    restockRecommendation: p.restock_recommendation,
    confidence: p.confidence,
    unit: p.unit,
  }
}

export const aiService = {
  async getPredictions(): Promise<AIPrediction[]> {
    const data = await api.get<BackendPrediction[]>('/ai/predictions')
    return data.map(toFrontend)
  },

  async getAlerts(): Promise<AIAlert[]> {
    return api.get<AIAlert[]>('/ai/alerts')
  },

  async getStats(): Promise<AIStats> {
    return api.get<AIStats>('/ai/stats')
  },
}
