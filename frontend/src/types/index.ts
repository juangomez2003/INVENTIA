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

// ─── Admin Panel Types ────────────────────────────────────────────────────────

export interface AdminUser {
  id: string
  email: string
  fullName: string | null
  role: 'super_admin'
}

export interface Company {
  id: string
  firebaseUid: string | null
  name: string
  ownerEmail: string
  ownerName: string | null
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'suspended' | 'deleted'
  userCount?: number
  productCount?: number
  createdAt: string
}

export interface PlatformUser {
  id: string
  firebaseUid: string
  companyId: string | null
  companyName?: string
  email: string
  displayName: string | null
  role: string
  status: 'active' | 'suspended'
  lastLogin: string | null
  createdAt: string
}

export interface CompanyModule {
  moduleKey: string
  displayName: string
  description: string
  icon: string
  enabled: boolean
  updatedAt?: string
}

export interface PlatformMetrics {
  totalCompanies: number
  totalUsers: number
  activeCompanies: number
  suspendedCompanies: number
  newCompanies7d: number
  newUsers7d: number
  totalProducts: number
  criticalProducts: number
  topPlans: Array<{ plan: string; count: number }>
}

export interface MetricsHistory {
  date: string
  totalCompanies: number
  totalUsers: number
  activeCompanies: number
}
