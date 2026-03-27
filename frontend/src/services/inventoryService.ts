import { api } from './api'
import type { Product } from '../types'

interface BackendProduct {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  min_threshold: number
  max_capacity: number
  price_per_unit: number
  supplier: string
  last_updated: string
}

function toFrontend(p: BackendProduct): Product {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    quantity: p.quantity,
    unit: p.unit,
    minThreshold: p.min_threshold,
    maxCapacity: p.max_capacity,
    pricePerUnit: p.price_per_unit,
    supplier: p.supplier,
    lastUpdated: p.last_updated,
  }
}

function toBackend(p: Omit<Product, 'id' | 'lastUpdated'>): object {
  return {
    name: p.name,
    category: p.category,
    quantity: p.quantity,
    unit: p.unit,
    min_threshold: p.minThreshold,
    max_capacity: p.maxCapacity,
    price_per_unit: p.pricePerUnit,
    supplier: p.supplier,
  }
}

export const inventoryService = {
  async getProducts(): Promise<Product[]> {
    const data = await api.get<BackendProduct[]>('/inventory/products')
    return data.map(toFrontend)
  },

  async createProduct(product: Omit<Product, 'id' | 'lastUpdated'>): Promise<Product> {
    const data = await api.post<BackendProduct>('/inventory/products', toBackend(product))
    return toFrontend(data)
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const body: Record<string, unknown> = {}
    if (product.name !== undefined) body.name = product.name
    if (product.category !== undefined) body.category = product.category
    if (product.quantity !== undefined) body.quantity = product.quantity
    if (product.unit !== undefined) body.unit = product.unit
    if (product.minThreshold !== undefined) body.min_threshold = product.minThreshold
    if (product.maxCapacity !== undefined) body.max_capacity = product.maxCapacity
    if (product.pricePerUnit !== undefined) body.price_per_unit = product.pricePerUnit
    if (product.supplier !== undefined) body.supplier = product.supplier
    const data = await api.put<BackendProduct>(`/inventory/products/${id}`, body)
    return toFrontend(data)
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/inventory/products/${id}`)
  },

  async recordMovement(
    productId: string,
    type: 'entrada' | 'salida' | 'ajuste',
    quantity: number,
    notes?: string
  ): Promise<void> {
    await api.post('/inventory/movements', { product_id: productId, movement_type: type, quantity, notes })
  },
}
