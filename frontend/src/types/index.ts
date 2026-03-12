export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  maxCapacity: number;
  pricePerUnit: number;
  lastUpdated: string;
  supplier: string;
}

export type StockStatus = 'critical' | 'low' | 'normal' | 'full';

export interface Sale {
  id: string;
  product: string;
  quantity: number;
  date: string;
  revenue: number;
}

export interface AIAlert {
  id: string;
  type: 'warning' | 'critical' | 'info' | 'success';
  title: string;
  message: string;
  product: string;
  timestamp: string;
}

export interface AIPrediction {
  product: string;
  currentStock: number;
  dailyConsumption: number;
  daysRemaining: number;
  restockRecommendation: number;
  confidence: number;
  unit: string;
}

export interface WeeklyConsumption {
  day: string;
  consumed: number;
  restocked: number;
}

export interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  restaurant: string;
  avatar?: string;
}

export interface RestaurantSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  alertThreshold: number;
  notifyWhatsApp: boolean;
  notifyEmail: boolean;
  autoRestock: boolean;
}
