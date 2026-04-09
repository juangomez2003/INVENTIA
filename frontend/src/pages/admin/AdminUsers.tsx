import { useState, useEffect, useCallback } from 'react'
import { Users, Search, Edit3, Trash2, Power, PowerOff, X, AlertCircle, ChevronLeft, ChevronRight, Crown, Users2 } from 'lucide-react'
import { adminService } from '../../services/adminService'
import type { PlatformUser } from '../../types'

const ROLE_BADGE: Record<string, { color: string }> = {
  admin:       { color: '#5856d6' },
  usuario:     { color: '#0a84ff' },
  empresa:     { color: '#ff9f0a' },
  super_admin: { color: '#ff453a' },
}

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  active:    { label: 'Activo',     color: '#30d158' },
  suspended: { label: 'Suspendido', color: '#ff9f0a' },
}

const PLAN_BADGE: Record<string, { label: string; color: string }> = {
  free:       { label: 'Gratuito',   color: '#636366' },
  pro:        { label: 'Pro',        color: '#0a84ff' },
  enterprise: { label: 'Enterprise', color: '#ff9f0a' },
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--surface-hover)',
  border: '1.5px solid transparent', borderRadius: 10,
  padding: '10px 14px', fontSize: 14, color: 'var(--text-1)',
  outline: 'none', transition: 'all 0.18s', boxSizing: 'border-box', fontFamily: 'inherit',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 500,
  color: 'var(--text-2)', marginBottom: 6,
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', fontSize: 11, fontWeight: 600,
  color: 'var(--text-3)', padding: '12px 20px',
  textTransform: 'uppercase', letterSpacing: '0.06em',
}
const tdStyle: React.CSSProperties = { padding: '14px 20px' }

export default function AdminUsers() {
  const [users, setUsers] = useState<PlatformUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser] = useState<PlatformUser | null>(null)
  const [editForm, setEditForm] = useState({ displayName: '', role: 'usuario', status: 'active' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const LIMIT = 10

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminService.getUsers({ page, limit: LIMIT, search })
      setUsers(res.items); setTotal(res.total)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { load() }, [load])

  const openEdit = (u: PlatformUser) => {
    setEditUser(u)
    setEditForm({ displayName: u.displayName || '', role: u.role, status: u.status })
    setError('')
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      await adminService.updateUser(editUser!.id, editForm)
      setEditUser(null); load()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error actualizando usuario'
      setError(message)
    } finally { setSaving(false) }
  }

  const toggleStatus = async (u: PlatformUser) => {
    const next = u.status === 'active' ? 'suspended' : 'active'
    try { await adminService.updateUser(u.id, { status: next }); load() } catch { /* ignore */ }
  }

  const deleteUser = async (u: PlatformUser) => {
    if (!confirm(`¿Eliminar el usuario "${u.email}"?`)) return
    try { await adminService.deleteUser(u.id); load() } catch { /* ignore */ }
  }

  const totalPages = Math.ceil(total / LIMIT)

  const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--border-focus)'
    e.target.style.background = 'var(--surface-focus)'
  }
  const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'transparent'
    e.target.style.background = 'var(--surface-hover)'
  }

  return (
    <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Administración
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users style={{ width: 26, height: 26, color: 'var(--accent)', strokeWidth: 1.75 }} />
            Gestión de Usuarios
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>{total} usuario{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Search */}
      <div className="animate-fade-up delay-1" style={{ position: 'relative', maxWidth: 360 }}>
        <Search style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'var(--text-3)', strokeWidth: 1.75 }} />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Buscar por email o nombre..."
          onFocus={focusInput} onBlur={blurInput}
          style={{ ...inputStyle, paddingLeft: 38, borderRadius: 12 }}
        />
      </div>

      {/* Table */}
      <div className="card animate-fade-up delay-2" style={{ borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {['Usuario', 'Rol', 'Plan', 'Personal', 'Estado', 'Último acceso', 'Acciones'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', border: '3px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-3)', fontSize: 14 }}>No se encontraron usuarios</td></tr>
              ) : users.map((u, i) => {
                const roleBadge = ROLE_BADGE[(u as any).role] || ROLE_BADGE.usuario
                const statusBadge = STATUS_BADGE[u.status] || STATUS_BADGE.active
                const plan = (u as any).plan || 'free'
                const staffCount = (u as any).staff_count || 0
                const planBadge = PLAN_BADGE[plan] || PLAN_BADGE.free
                return (
                  <tr
                    key={u.id}
                    style={{ borderBottom: i < users.length - 1 ? '1px solid var(--border-subtle)' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
                          {(u.displayName || u.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{u.displayName || '—'}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 1 }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: 'capitalize', background: `${roleBadge.color}20`, color: roleBadge.color }}>{u.role}</span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {plan !== 'free' && <Crown size={12} color={planBadge.color} />}
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${planBadge.color}20`, color: planBadge.color }}>{planBadge.label}</span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      {staffCount > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#0a84ff', fontSize: 13 }}>
                          <Users2 size={14} /> <span>{staffCount} empleado{staffCount !== 1 ? 's' : ''}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-3)', fontSize: 13 }}>—</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${statusBadge.color}20`, color: statusBadge.color }}>{statusBadge.label}</span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 13, color: 'var(--text-3)' }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('es-CO') : '—'}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          onClick={() => openEdit(u)}
                          title="Editar"
                          style={{ padding: 7, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', transition: 'all 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-1)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-3)' }}
                        ><Edit3 size={14} /></button>
                        <button
                          onClick={() => toggleStatus(u)}
                          title={u.status === 'active' ? 'Suspender' : 'Activar'}
                          style={{ padding: 7, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: u.status === 'active' ? '#ff9f0a' : '#30d158', display: 'flex', transition: 'all 0.15s' }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)'}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                        >{u.status === 'active' ? <PowerOff size={14} /> : <Power size={14} />}</button>
                        <button
                          onClick={() => deleteUser(u)}
                          title="Eliminar"
                          style={{ padding: 7, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', transition: 'all 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,69,58,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#ff453a' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-3)' }}
                        ><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Página {page} de {totalPages}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: 7, borderRadius: 8, border: 'none', background: 'transparent', cursor: page === 1 ? 'default' : 'pointer', color: 'var(--text-3)', opacity: page === 1 ? 0.4 : 1, display: 'flex', transition: 'all 0.15s' }}>
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ padding: 7, borderRadius: 8, border: 'none', background: 'transparent', cursor: page === totalPages ? 'default' : 'pointer', color: 'var(--text-3)', opacity: page === totalPages ? 0.4 : 1, display: 'flex', transition: 'all 0.15s' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editUser && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={() => setEditUser(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }} />
          <div className="glass-strong animate-scale-in" style={{ position: 'relative', borderRadius: 20, padding: 28, width: '100%', maxWidth: 440 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>Editar Usuario</h3>
              <button onClick={() => setEditUser(null)} style={{ color: 'var(--text-3)', background: 'var(--surface-hover)', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex' }}>
                <X style={{ width: 17, height: 17 }} />
              </button>
            </div>
            <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Nombre</label>
                <input
                  type="text" value={editForm.displayName}
                  onChange={e => setEditForm(f => ({ ...f, displayName: e.target.value }))}
                  onFocus={focusInput} onBlur={blurInput}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Rol</label>
                <select value={editForm.role}
                  onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                  onFocus={focusInput} onBlur={blurInput}
                  style={{ ...inputStyle, appearance: 'none' }}>
                  <option value="admin">Admin</option>
                  <option value="usuario">Usuario</option>
                  <option value="empresa">Empresa</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Estado</label>
                <select value={editForm.status}
                  onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                  onFocus={focusInput} onBlur={blurInput}
                  style={{ ...inputStyle, appearance: 'none' }}>
                  <option value="active">Activo</option>
                  <option value="suspended">Suspendido</option>
                </select>
              </div>
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ff453a', fontSize: 13, background: 'rgba(255,69,58,0.1)', borderRadius: 10, padding: '10px 14px' }}>
                  <AlertCircle size={14} />{error}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="button" onClick={() => setEditUser(null)} style={{
                  flex: 1, padding: '12px 0', borderRadius: 10, fontSize: 14, fontWeight: 500,
                  color: 'var(--text-2)', background: 'var(--surface-hover)', border: 'none',
                  cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'inherit',
                }}>Cancelar</button>
                <button type="submit" disabled={saving} style={{
                  flex: 1, padding: '12px 0', borderRadius: 10, fontSize: 14, fontWeight: 600,
                  color: 'white', background: 'var(--accent-gradient)', border: 'none',
                  cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1,
                  transition: 'all 0.18s', fontFamily: 'inherit',
                }}>{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
