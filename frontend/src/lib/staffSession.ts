const SESSION_KEY = 'inventia_staff_session'

export interface StaffSession {
  session_token: string
  role: string
  restaurant_id: string
  restaurant_name: string
  created_at: number
}

export function saveStaffSession(data: Omit<StaffSession, 'created_at'>): void {
  const session: StaffSession = { ...data, created_at: Date.now() }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function getStaffSession(): StaffSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session: StaffSession = JSON.parse(raw)
    // 16 horas de TTL en el cliente (el servidor ya verifica el JWT)
    const TTL_MS = 16 * 60 * 60 * 1000
    if (Date.now() - session.created_at > TTL_MS) {
      clearStaffSession()
      return null
    }
    return session
  } catch {
    return null
  }
}

export function clearStaffSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function getStaffAuthHeader(): string | null {
  const session = getStaffSession()
  return session ? `Bearer ${session.session_token}` : null
}
