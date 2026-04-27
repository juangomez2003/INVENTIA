import type { Product, RestaurantSettings } from '../types'

export function getStockStatus(product: Product): 'critical' | 'low' | 'normal' | 'full' {
  const percentage = (product.quantity / product.maxCapacity) * 100
  if (product.quantity <= product.minThreshold * 0.5) return 'critical'
  if (product.quantity <= product.minThreshold) return 'low'
  if (percentage >= 80) return 'full'
  return 'normal'
}

export const stockStatusConfig = {
  critical: { label: 'Crítico',  textColor: '#f87171', bgColor: 'rgba(239,68,68,0.2)',    borderColor: 'rgba(239,68,68,0.3)',    dotColor: '#ef4444' },
  low:      { label: 'Bajo',     textColor: '#fbbf24', bgColor: 'rgba(245,158,11,0.2)',   borderColor: 'rgba(245,158,11,0.3)',   dotColor: '#f59e0b' },
  normal:   { label: 'Normal',   textColor: '#34d399', bgColor: 'rgba(16,185,129,0.2)',   borderColor: 'rgba(16,185,129,0.3)',   dotColor: '#10b981' },
  full:     { label: 'Lleno',    textColor: '#22d3ee', bgColor: 'rgba(6,182,212,0.2)',    borderColor: 'rgba(6,182,212,0.3)',    dotColor: '#06b6d4' },
}

export const defaultSettings: RestaurantSettings = {
  name: '',
  address: '',
  phone: '',
  email: '',
  alertThreshold: 20,
  notifyWhatsApp: false,
  notifyEmail: true,
  autoRestock: false,
}
