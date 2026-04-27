import { supabase } from '../lib/supabase'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' }
}

async function apiFetch(path: string, opts: RequestInit = {}) {
  const headers = await authHeaders()
  const res = await fetch(`${API}${path}`, { ...opts, headers: { ...headers, ...(opts.headers as Record<string, string> || {}) } })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Error en la solicitud')
  }
  return res.json()
}

export interface Ingredient { product_id: string; quantity: number; unit: string }
export interface Dish {
  id: string; name: string; description: string; category: string
  price: number; active: boolean; image_url?: string
  dish_ingredients?: { product_id: string; quantity: number; unit: string; products?: { name: string; unit: string } }[]
}
export interface ScannedDish { name: string; price: number; category: string; description: string }

export const menuService = {
  list: (): Promise<Dish[]> => apiFetch('/menu/dishes'),

  create: (dish: { name: string; description: string; category: string; price: number; ingredients?: Ingredient[] }) =>
    apiFetch('/menu/dishes', { method: 'POST', body: JSON.stringify(dish) }),

  update: (id: string, data: Partial<Dish & { ingredients: Ingredient[] }>) =>
    apiFetch(`/menu/dishes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  remove: (id: string) => apiFetch(`/menu/dishes/${id}`, { method: 'DELETE' }),

  importBatch: (dishes: ScannedDish[]) =>
    apiFetch('/menu/dishes/import', { method: 'POST', body: JSON.stringify({ dishes }) }),

  async scan(file: File): Promise<{ dishes: ScannedDish[]; raw_text: string; pages: number; found: number }> {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${API}/menu/scan`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || 'Error al escanear')
    }
    return res.json()
  },
}
