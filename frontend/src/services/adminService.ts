import type { Company, PlatformUser, CompanyModule, PlatformMetrics, MetricsHistory, AnalyticsData } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
const DEMO_TOKEN = 'demo-admin-token-inventia-2024'

async function getAdminToken(): Promise<string> {
  try {
    const { supabase, isSupabaseConfigured } = await import('../lib/supabase')
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.auth.getSession()
      if (data.session?.access_token) return data.session.access_token
    }
  } catch {}
  return localStorage.getItem('inventia_admin_token') || DEMO_TOKEN
}

export async function adminRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAdminToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string>),
  }
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Error en la solicitud')
  }
  return res.json()
}

// ─── Helpers camelCase ────────────────────────────────────────────────────────

function toCamelCompany(c: Record<string, unknown>): Company {
  return {
    id: c.id as string,
    firebaseUid: (c.firebase_uid ?? c.firebaseUid ?? null) as string | null,
    name: c.name as string,
    ownerEmail: (c.owner_email ?? c.ownerEmail) as string,
    ownerName: (c.owner_name ?? c.ownerName ?? null) as string | null,
    plan: (c.plan as Company['plan']) || 'free',
    status: (c.status as Company['status']) || 'active',
    userCount: c.user_count as number | undefined,
    productCount: c.product_count as number | undefined,
    createdAt: (c.created_at ?? c.createdAt ?? '') as string,
  }
}

function toCamelUser(u: Record<string, unknown>): PlatformUser {
  return {
    id: u.id as string,
    firebaseUid: (u.firebase_uid ?? u.firebaseUid ?? '') as string,
    companyId: (u.company_id ?? u.companyId ?? null) as string | null,
    companyName: (u.company_name ?? u.companyName) as string | undefined,
    email: u.email as string,
    displayName: (u.display_name ?? u.displayName ?? null) as string | null,
    role: (u.role as string) || 'usuario',
    status: (u.status as PlatformUser['status']) || 'active',
    lastLogin: (u.last_login ?? u.lastLogin ?? null) as string | null,
    createdAt: (u.created_at ?? u.createdAt ?? '') as string,
  }
}

interface PagedResponse<T> { items: T[]; total: number; page: number; limit: number }

export const adminService = {
  // ── Métricas ────────────────────────────────────────────────────────────────
  async getMetrics(): Promise<PlatformMetrics> {
    const d = await adminRequest<Record<string, unknown>>('/admin/metrics/overview')
    return {
      totalRestaurants:  (d.total_restaurants  ?? 0) as number,
      totalProducts:     (d.total_products     ?? 0) as number,
      criticalProducts:  (d.critical_products  ?? 0) as number,
      lowProducts:       (d.low_products       ?? 0) as number,
      totalMovements:    (d.total_movements    ?? 0) as number,
      movements7d:       (d.movements_7d       ?? 0) as number,
      newRestaurants7d:  (d.new_restaurants_7d ?? 0) as number,
    }
  },

  async getMetricsHistory(days = 30): Promise<MetricsHistory[]> {
    const data = await adminRequest<Array<Record<string, unknown>>>(`/admin/metrics/history?days=${days}`)
    return data.map(d => ({ date: d.date as string, movements: (d.movements ?? 0) as number }))
  },

  async getAnalytics(): Promise<AnalyticsData> {
    const d = await adminRequest<Record<string, unknown>>('/admin/analytics')
    return {
      productsByStatus:  (d.products_by_status  ?? []) as AnalyticsData['productsByStatus'],
      movementsByType:   (d.movements_by_type   ?? []) as AnalyticsData['movementsByType'],
      dailyMovements:    (d.daily_movements      ?? []) as AnalyticsData['dailyMovements'],
      perRestaurant:     (d.per_restaurant       ?? []) as AnalyticsData['perRestaurant'],
    }
  },

  // ── Empresas (companies legacy) ─────────────────────────────────────────────
  async getCompanies(params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<PagedResponse<Company>> {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    if (params?.status) q.set('status', params.status)
    if (params?.search) q.set('search', params.search)
    const data = await adminRequest<{ items: Record<string, unknown>[]; total: number; page: number; limit: number }>(`/admin/companies?${q}`)
    return { ...data, items: data.items.map(toCamelCompany) }
  },

  async createCompany(body: { name: string; ownerEmail: string; ownerName?: string; plan?: string }): Promise<Company> {
    const data = await adminRequest<Record<string, unknown>>('/admin/companies', {
      method: 'POST',
      body: JSON.stringify({ name: body.name, owner_email: body.ownerEmail, owner_name: body.ownerName, plan: body.plan || 'free' }),
    })
    return toCamelCompany(data)
  },

  async updateCompany(id: string, body: Partial<Company>): Promise<Company> {
    const data = await adminRequest<Record<string, unknown>>(`/admin/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: body.name, owner_email: body.ownerEmail, owner_name: body.ownerName, plan: body.plan }),
    })
    return toCamelCompany(data)
  },

  async setCompanyStatus(id: string, status: 'active' | 'suspended'): Promise<void> {
    await adminRequest(`/admin/companies/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
  },

  async deleteCompany(id: string): Promise<void> {
    await adminRequest(`/admin/companies/${id}`, { method: 'DELETE' })
  },

  // ── Usuarios ────────────────────────────────────────────────────────────────
  async getUsers(params?: { page?: number; limit?: number; search?: string }): Promise<PagedResponse<PlatformUser>> {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    if (params?.search) q.set('search', params.search)
    const data = await adminRequest<{ items: Record<string, unknown>[]; total: number; page: number; limit: number }>(`/admin/users?${q}`)
    return { ...data, items: data.items.map(toCamelUser) }
  },

  async updateUser(id: string, body: { displayName?: string; role?: string; status?: string }): Promise<PlatformUser> {
    const data = await adminRequest<Record<string, unknown>>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ display_name: body.displayName, role: body.role, status: body.status }),
    })
    return toCamelUser(data)
  },

  async deleteUser(id: string): Promise<void> {
    await adminRequest(`/admin/users/${id}`, { method: 'DELETE' })
  },

  // ── Restaurantes ────────────────────────────────────────────────────────────
  async getRestaurants(): Promise<Record<string, unknown>[]> {
    return adminRequest('/admin/restaurants')
  },

  async updateRestaurant(id: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return adminRequest(`/admin/restaurants/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },

  async getRestaurantProducts(restaurantId: string): Promise<{ items: Record<string, unknown>[]; total: number }> {
    return adminRequest(`/admin/restaurants/${restaurantId}/products`)
  },

  async getRestaurantMovements(restaurantId: string, limit = 100): Promise<{ items: Record<string, unknown>[]; total: number }> {
    return adminRequest(`/admin/restaurants/${restaurantId}/movements?limit=${limit}`)
  },

  async adminCreateProduct(restaurantId: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return adminRequest(`/admin/restaurants/${restaurantId}/products`, { method: 'POST', body: JSON.stringify(data) })
  },

  async adminUpdateProduct(restaurantId: string, productId: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return adminRequest(`/admin/restaurants/${restaurantId}/products/${productId}`, { method: 'PUT', body: JSON.stringify(data) })
  },

  async adminDeleteProduct(restaurantId: string, productId: string): Promise<void> {
    await adminRequest(`/admin/restaurants/${restaurantId}/products/${productId}`, { method: 'DELETE' })
  },

  // ── Módulos ─────────────────────────────────────────────────────────────────
  async getModules(companyId?: string): Promise<CompanyModule[]> {
    const q = companyId ? `?company_id=${companyId}` : ''
    const data = await adminRequest<Array<Record<string, unknown>>>(`/admin/modules${q}`)
    return data.map(m => ({
      moduleKey:   (m.module_key ?? m.moduleKey) as string,
      displayName: (m.display_name ?? m.displayName ?? m.module_key ?? m.moduleKey) as string,
      description: (m.description ?? '') as string,
      icon:        (m.icon ?? 'box') as string,
      enabled:     m.enabled as boolean,
      updatedAt:   (m.updated_at ?? m.updatedAt) as string | undefined,
    }))
  },

  async toggleModule(companyId: string, moduleKey: string, enabled: boolean): Promise<void> {
    await adminRequest(`/admin/modules/${companyId}/${moduleKey}`, { method: 'PUT', body: JSON.stringify({ enabled }) })
  },
}
