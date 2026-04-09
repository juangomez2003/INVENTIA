import { supabase } from '../lib/supabase'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

async function apiFetch(path: string, opts: RequestInit = {}) {
  const headers = await authHeaders()
  const res = await fetch(`${API}${path}`, { ...opts, headers: { ...headers, ...(opts.headers || {}) } })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Error en la solicitud')
  }
  return res.json()
}

// ─── My profile (role, restaurant_id, plan) ───────────────────────────────────
export async function getMyStaffProfile() {
  return apiFetch('/staff/me')
}

// ─── Invite codes ─────────────────────────────────────────────────────────────
export async function generateInviteCode(role: string) {
  return apiFetch('/staff/invites', { method: 'POST', body: JSON.stringify({ role }) })
}

export async function listInvites() {
  return apiFetch('/staff/invites')
}

export async function deleteInvite(inviteId: string) {
  return apiFetch(`/staff/invites/${inviteId}`, { method: 'DELETE' })
}

// ─── Join with code ───────────────────────────────────────────────────────────
export async function joinWithCode(data: { code: string; name: string; email: string; password: string }) {
  const res = await fetch(`${API}/staff/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, code: data.code.toUpperCase() }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Error al unirse')
  }
  return res.json()
}

// ─── Staff list ───────────────────────────────────────────────────────────────
export async function listStaff() {
  return apiFetch('/staff/list')
}

export async function removeStaff(staffId: string) {
  return apiFetch(`/staff/list/${staffId}`, { method: 'DELETE' })
}

// ─── Modules ──────────────────────────────────────────────────────────────────
export async function getMyModules() {
  return apiFetch('/staff/modules')
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  unit: string
  price_per_unit: number
}

export interface Order {
  id: string
  restaurant_id: string
  table_number: number
  status: 'pending' | 'in_kitchen' | 'ready' | 'paid' | 'cancelled'
  notes?: string
  total: number
  created_by?: string
  closed_by?: string
  closed_at?: string
  created_at: string
  updated_at: string
  order_items?: (OrderItem & { id: string; subtotal: number })[]
}

export async function listOrders(): Promise<Order[]> {
  return apiFetch('/orders')
}

export async function createOrder(data: { table_number: number; notes?: string; items: OrderItem[] }): Promise<Order> {
  return apiFetch('/orders', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
  return apiFetch(`/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
}

export async function getOrder(orderId: string): Promise<Order> {
  return apiFetch(`/orders/${orderId}`)
}
