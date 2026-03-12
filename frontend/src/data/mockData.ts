import type {
  Product,
  Sale,
  AIAlert,
  AIPrediction,
  WeeklyConsumption,
  TopProduct,
  User,
  RestaurantSettings,
} from '../types';

export const demoUser: User = {
  id: '1',
  name: 'Carlos García',
  email: 'admin@restaurant.com',
  role: 'Administrador',
  restaurant: 'La Casa del Sabor',
};

export const demoCredentials = {
  email: 'admin@restaurant.com',
  password: 'demo123',
};

export const products: Product[] = [
  { id: '1', name: 'Pollo', category: 'Carnes', quantity: 8, unit: 'kg', minThreshold: 10, maxCapacity: 50, pricePerUnit: 5.50, lastUpdated: '2026-03-12', supplier: 'Distribuidora Avícola' },
  { id: '2', name: 'Carne de res', category: 'Carnes', quantity: 12, unit: 'kg', minThreshold: 8, maxCapacity: 40, pricePerUnit: 12.00, lastUpdated: '2026-03-12', supplier: 'Carnes Premium' },
  { id: '3', name: 'Tomate', category: 'Verduras', quantity: 3, unit: 'kg', minThreshold: 5, maxCapacity: 30, pricePerUnit: 2.50, lastUpdated: '2026-03-12', supplier: 'Frutas y Verduras Don José' },
  { id: '4', name: 'Cebolla', category: 'Verduras', quantity: 7, unit: 'kg', minThreshold: 4, maxCapacity: 25, pricePerUnit: 1.80, lastUpdated: '2026-03-11', supplier: 'Frutas y Verduras Don José' },
  { id: '5', name: 'Arroz', category: 'Granos', quantity: 25, unit: 'kg', minThreshold: 10, maxCapacity: 100, pricePerUnit: 1.20, lastUpdated: '2026-03-10', supplier: 'Granos del Valle' },
  { id: '6', name: 'Aceite de oliva', category: 'Aceites', quantity: 4, unit: 'L', minThreshold: 5, maxCapacity: 20, pricePerUnit: 8.50, lastUpdated: '2026-03-11', supplier: 'Aceites Mediterráneo' },
  { id: '7', name: 'Harina de trigo', category: 'Granos', quantity: 15, unit: 'kg', minThreshold: 8, maxCapacity: 50, pricePerUnit: 1.00, lastUpdated: '2026-03-09', supplier: 'Granos del Valle' },
  { id: '8', name: 'Queso mozzarella', category: 'Lácteos', quantity: 2, unit: 'kg', minThreshold: 3, maxCapacity: 15, pricePerUnit: 9.00, lastUpdated: '2026-03-12', supplier: 'Lácteos Frescos' },
  { id: '9', name: 'Lechuga', category: 'Verduras', quantity: 6, unit: 'pz', minThreshold: 8, maxCapacity: 30, pricePerUnit: 1.50, lastUpdated: '2026-03-12', supplier: 'Frutas y Verduras Don José' },
  { id: '10', name: 'Pasta spaghetti', category: 'Granos', quantity: 20, unit: 'kg', minThreshold: 10, maxCapacity: 60, pricePerUnit: 2.00, lastUpdated: '2026-03-10', supplier: 'Importadora Italiana' },
  { id: '11', name: 'Camarones', category: 'Mariscos', quantity: 3, unit: 'kg', minThreshold: 4, maxCapacity: 20, pricePerUnit: 18.00, lastUpdated: '2026-03-12', supplier: 'Mariscos del Pacífico' },
  { id: '12', name: 'Limón', category: 'Frutas', quantity: 10, unit: 'kg', minThreshold: 5, maxCapacity: 25, pricePerUnit: 2.00, lastUpdated: '2026-03-11', supplier: 'Frutas y Verduras Don José' },
  { id: '13', name: 'Aguacate', category: 'Frutas', quantity: 4, unit: 'kg', minThreshold: 6, maxCapacity: 20, pricePerUnit: 6.00, lastUpdated: '2026-03-12', supplier: 'Frutas y Verduras Don José' },
  { id: '14', name: 'Crema', category: 'Lácteos', quantity: 5, unit: 'L', minThreshold: 3, maxCapacity: 15, pricePerUnit: 4.50, lastUpdated: '2026-03-11', supplier: 'Lácteos Frescos' },
  { id: '15', name: 'Chile jalapeño', category: 'Verduras', quantity: 2, unit: 'kg', minThreshold: 3, maxCapacity: 15, pricePerUnit: 3.00, lastUpdated: '2026-03-12', supplier: 'Distribuidora de Chiles' },
  { id: '16', name: 'Tortillas de maíz', category: 'Granos', quantity: 40, unit: 'pz', minThreshold: 50, maxCapacity: 200, pricePerUnit: 0.15, lastUpdated: '2026-03-12', supplier: 'Tortillería La Abuela' },
];

export const recentSales: Sale[] = [
  { id: '1', product: 'Pollo', quantity: 3, date: '2026-03-12', revenue: 45.00 },
  { id: '2', product: 'Carne de res', quantity: 2, date: '2026-03-12', revenue: 60.00 },
  { id: '3', product: 'Pasta spaghetti', quantity: 4, date: '2026-03-12', revenue: 48.00 },
  { id: '4', product: 'Camarones', quantity: 1.5, date: '2026-03-12', revenue: 54.00 },
  { id: '5', product: 'Arroz', quantity: 5, date: '2026-03-12', revenue: 30.00 },
  { id: '6', product: 'Tomate', quantity: 2, date: '2026-03-11', revenue: 12.00 },
  { id: '7', product: 'Queso mozzarella', quantity: 1, date: '2026-03-11', revenue: 18.00 },
  { id: '8', product: 'Aguacate', quantity: 2, date: '2026-03-11', revenue: 24.00 },
];

export const aiAlerts: AIAlert[] = [
  { id: '1', type: 'critical', title: 'Stock Crítico', message: 'El tomate se acabará en aproximadamente 1.5 días. Recomendamos comprar 15kg inmediatamente.', product: 'Tomate', timestamp: '2026-03-12T10:30:00' },
  { id: '2', type: 'critical', title: 'Stock Crítico', message: 'El queso mozzarella está por debajo del umbral mínimo. Solo quedan 2kg.', product: 'Queso mozzarella', timestamp: '2026-03-12T10:25:00' },
  { id: '3', type: 'warning', title: 'Stock Bajo', message: 'El pollo se agotará en 1.6 días según el consumo actual de 5kg/día.', product: 'Pollo', timestamp: '2026-03-12T09:15:00' },
  { id: '4', type: 'warning', title: 'Stock Bajo', message: 'Las tortillas de maíz están al 20% de capacidad. Pedir reposición.', product: 'Tortillas de maíz', timestamp: '2026-03-12T08:45:00' },
  { id: '5', type: 'warning', title: 'Stock Bajo', message: 'Los camarones alcanzarán el mínimo mañana. Consumo alto esta semana.', product: 'Camarones', timestamp: '2026-03-12T08:00:00' },
  { id: '6', type: 'info', title: 'Tendencia Detectada', message: 'Se detectó un aumento del 20% en consumo de carne los fines de semana. Ajustando predicciones.', product: 'Carne de res', timestamp: '2026-03-12T07:30:00' },
  { id: '7', type: 'success', title: 'Reposición Completada', message: 'El arroz fue repuesto exitosamente. Stock actual: 25kg.', product: 'Arroz', timestamp: '2026-03-11T16:00:00' },
];

export const aiPredictions: AIPrediction[] = [
  { product: 'Pollo', currentStock: 8, dailyConsumption: 5, daysRemaining: 1.6, restockRecommendation: 25, confidence: 92, unit: 'kg' },
  { product: 'Tomate', currentStock: 3, dailyConsumption: 2, daysRemaining: 1.5, restockRecommendation: 15, confidence: 88, unit: 'kg' },
  { product: 'Queso mozzarella', currentStock: 2, dailyConsumption: 1.5, daysRemaining: 1.3, restockRecommendation: 8, confidence: 85, unit: 'kg' },
  { product: 'Camarones', currentStock: 3, dailyConsumption: 1.2, daysRemaining: 2.5, restockRecommendation: 10, confidence: 90, unit: 'kg' },
  { product: 'Aceite de oliva', currentStock: 4, dailyConsumption: 0.8, daysRemaining: 5, restockRecommendation: 6, confidence: 87, unit: 'L' },
  { product: 'Lechuga', currentStock: 6, dailyConsumption: 3, daysRemaining: 2, restockRecommendation: 12, confidence: 83, unit: 'pz' },
  { product: 'Aguacate', currentStock: 4, dailyConsumption: 1.5, daysRemaining: 2.7, restockRecommendation: 8, confidence: 86, unit: 'kg' },
  { product: 'Chile jalapeño', currentStock: 2, dailyConsumption: 0.8, daysRemaining: 2.5, restockRecommendation: 5, confidence: 81, unit: 'kg' },
  { product: 'Carne de res', currentStock: 12, dailyConsumption: 3, daysRemaining: 4, restockRecommendation: 15, confidence: 94, unit: 'kg' },
  { product: 'Tortillas de maíz', currentStock: 40, dailyConsumption: 25, daysRemaining: 1.6, restockRecommendation: 100, confidence: 91, unit: 'pz' },
];

export const weeklyConsumption: WeeklyConsumption[] = [
  { day: 'Lun', consumed: 45, restocked: 30 },
  { day: 'Mar', consumed: 52, restocked: 20 },
  { day: 'Mié', consumed: 48, restocked: 40 },
  { day: 'Jue', consumed: 55, restocked: 15 },
  { day: 'Vie', consumed: 70, restocked: 50 },
  { day: 'Sáb', consumed: 85, restocked: 60 },
  { day: 'Dom', consumed: 78, restocked: 45 },
];

export const topProducts: TopProduct[] = [
  { name: 'Pollo', sales: 35, revenue: 192.50 },
  { name: 'Carne de res', sales: 28, revenue: 336.00 },
  { name: 'Camarones', sales: 22, revenue: 396.00 },
  { name: 'Pasta', sales: 18, revenue: 36.00 },
  { name: 'Arroz', sales: 40, revenue: 48.00 },
  { name: 'Aguacate', sales: 15, revenue: 90.00 },
];

export const defaultSettings: RestaurantSettings = {
  name: 'La Casa del Sabor',
  address: 'Av. Principal #123, Centro, Ciudad',
  phone: '+52 555 123 4567',
  email: 'contacto@lacasadelsabor.com',
  alertThreshold: 20,
  notifyWhatsApp: true,
  notifyEmail: true,
  autoRestock: false,
};

export function getStockStatus(product: Product): 'critical' | 'low' | 'normal' | 'full' {
  const percentage = (product.quantity / product.maxCapacity) * 100;
  if (product.quantity <= product.minThreshold * 0.5) return 'critical';
  if (product.quantity <= product.minThreshold) return 'low';
  if (percentage >= 80) return 'full';
  return 'normal';
}

export const stockStatusConfig = {
  critical: { label: 'Crítico', textColor: '#f87171', bgColor: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.3)', dotColor: '#ef4444' },
  low: { label: 'Bajo', textColor: '#fbbf24', bgColor: 'rgba(245,158,11,0.2)', borderColor: 'rgba(245,158,11,0.3)', dotColor: '#f59e0b' },
  normal: { label: 'Normal', textColor: '#34d399', bgColor: 'rgba(16,185,129,0.2)', borderColor: 'rgba(16,185,129,0.3)', dotColor: '#10b981' },
  full: { label: 'Lleno', textColor: '#22d3ee', bgColor: 'rgba(6,182,212,0.2)', borderColor: 'rgba(6,182,212,0.3)', dotColor: '#06b6d4' },
};
