import type { Company, PlatformUser, CompanyModule, PlatformMetrics, MetricsHistory } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
const DEMO_TOKEN = 'demo-admin-token-inventia-2024'

async function getAdminToken(): Promise<string> {
  // Try Supabase session first
  try {
    const { supabase, isSupabaseConfigured } = await import('../lib/supabase')
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.auth.getSession()
      if (data.session?.access_token) return data.session.access_token
    }
  } catch {}
  // Fallback to demo token from localStorage (set on admin login)
  return localStorage.getItem('inventia_admin_token') || DEMO_TOKEN
}

async function adminRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

// snake_case → camelCase helpers
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
  // Metrics
  async getMetrics(): Promise<PlatformMetrics> {
    const data = await adminRequest<Record<string, unknown>>('/admin/metrics/overview')
    return {
      totalCompanies: data.total_companies as number,
      totalUsers: data.total_users as number,
      activeCompanies: data.active_companies as number,
      suspendedCompanies: data.suspended_companies as number,
      newCompanies7d: data.new_companies_7d as number,
      newUsers7d: data.new_users_7d as number,
      totalProducts: data.total_products as number,
      criticalProducts: data.critical_products as number,
      topPlans: data.top_plans as Array<{ plan: string; count: number }>,
    }
  },

  async getMetricsHistory(days = 30): Promise<MetricsHistory[]> {
    const data = await adminRequest<Array<Record<string, unknown>>>(`/admin/metrics/history?days=${days}`)
    return data.map(d => ({
      date: d.date as string,
      totalCompanies: d.total_companies as number,
      totalUsers: d.total_users as number,
      activeCompanies: d.active_companies as number,
    }))
  },

  // Companies
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

  // Users
  async getUsers(params?: { page?: number; limit?: number; companyId?: string; search?: string }): Promise<PagedResponse<PlatformUser>> {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    if (params?.companyId) q.set('company_id', params.companyId)
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

  // Products
  async getProducts(params?: { page?: number; limit?: number; companyId?: string }): Promise<PagedResponse<Record<string, unknown>>> {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    if (params?.companyId) q.set('company_id', params.companyId)
    return adminRequest(`/admin/products?${q}`)
  },

  // Modules
  async getModules(companyId?: string): Promise<CompanyModule[]> {
    const q = companyId ? `?company_id=${companyId}` : ''
    const data = await adminRequest<Array<Record<string, unknown>>>(`/admin/modules${q}`)
    return data.map(m => ({
      moduleKey: (m.module_key ?? m.moduleKey) as string,
      displayName: (m.display_name ?? m.displayName ?? m.module_key ?? m.moduleKey) as string,
      description: (m.description ?? '') as string,
      icon: (m.icon ?? 'box') as string,
      enabled: m.enabled as boolean,
      updatedAt: (m.updated_at ?? m.updatedAt) as string | undefined,
    }))
  },

  async toggleModule(companyId: string, moduleKey: string, enabled: boolean): Promise<void> {
    await adminRequest(`/admin/modules/${companyId}/${moduleKey}`, { method: 'PUT', body: JSON.stringify({ enabled }) })
  },
}
