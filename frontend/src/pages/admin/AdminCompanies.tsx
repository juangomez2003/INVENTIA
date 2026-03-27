import { useState, useEffect, useCallback } from 'react'
import { Building2, Plus, Search, Edit3, Trash2, Power, PowerOff, X, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { adminService } from '../../services/adminService'
import type { Company } from '../../types'

const PLAN_BADGE: Record<string, { label: string; color: string }> = {
  free:       { label: 'Free',       color: '#5856d6' },
  pro:        { label: 'Pro',        color: '#0a84ff' },
  enterprise: { label: 'Enterprise', color: '#ff9f0a' },
}

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  active:    { label: 'Activa',     color: '#30d158' },
  suspended: { label: 'Suspendida', color: '#ff9f0a' },
  deleted:   { label: 'Eliminada',  color: '#ff453a' },
}

interface CompanyForm { name: string; ownerEmail: string; ownerName: string; plan: Company['plan'] }
const EMPTY_FORM: CompanyForm = { name: '', ownerEmail: '', ownerName: '', plan: 'free' }

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

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<null | 'create' | Company>(null)
  const [form, setForm] = useState<CompanyForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const LIMIT = 10

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminService.getCompanies({ page, limit: LIMIT, search, status: statusFilter || undefined })
      setCompanies(res.items)
      setTotal(res.total)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, search, statusFilter])

  useEffect(() => { load() }, [load])

  const openEdit = (c: Company) => { setModal(c); setForm({ name: c.name, ownerEmail: c.ownerEmail, ownerName: c.ownerName || '', plan: c.plan }) }
  const openCreate = () => { setModal('create'); setForm(EMPTY_FORM); setError('') }
  const closeModal = () => { setModal(null); setError('') }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      if (modal === 'create') {
        await adminService.createCompany(form)
      } else {
        await adminService.updateCompany((modal as Company).id, form)
      }
      closeModal(); load()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error guardando empresa'
      setError(message)
    } finally { setSaving(false) }
  }

  const toggleStatus = async (c: Company) => {
    const next = c.status === 'active' ? 'suspended' : 'active'
    try { await adminService.setCompanyStatus(c.id, next); load() } catch { /* ignore */ }
  }

  const deleteCompany = async (c: Company) => {
    if (!confirm(`¿Eliminar "${c.name}"? Esta acción no se puede deshacer.`)) return
    try { await adminService.deleteCompany(c.id); load() } catch { /* ignore */ }
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

  const formFields: Array<{ label: string; key: keyof CompanyForm; type: string; placeholder: string; required?: boolean }> = [
    { label: 'Nombre de la empresa', key: 'name', type: 'text', placeholder: 'Mi Restaurante', required: true },
    { label: 'Email del propietario', key: 'ownerEmail', type: 'email', placeholder: 'propietario@email.com', required: true },
    { label: 'Nombre del propietario', key: 'ownerName', type: 'text', placeholder: 'Juan Pérez' },
  ]

  return (
    <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Administración
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Building2 style={{ width: 26, height: 26, color: 'var(--accent)', strokeWidth: 1.75 }} />
            Gestión de Empresas
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>{total} empresa{total !== 1 ? 's' : ''} registrada{total !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 18px', borderRadius: 10,
            fontSize: 13, fontWeight: 600, color: 'white',
            background: 'var(--accent-gradient)', border: 'none',
            cursor: 'pointer', transition: 'all 0.18s',
            boxShadow: '0 4px 12px var(--accent-glow)', fontFamily: 'inherit',
          }}
        >
          <Plus style={{ width: 15, height: 15, strokeWidth: 2.5 }} />
          Nueva empresa
        </button>
      </div>

      {/* Filters */}
      <div className="animate-fade-up delay-1" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'var(--text-3)', strokeWidth: 1.75 }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar empresa..."
            onFocus={focusInput} onBlur={blurInput}
            style={{ ...inputStyle, paddingLeft: 38, borderRadius: 12 }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          onFocus={focusInput} onBlur={blurInput}
          style={{ ...inputStyle, width: 'auto', minWidth: 160, appearance: 'none', borderRadius: 12 }}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activa</option>
          <option value="suspended">Suspendida</option>
        </select>
      </div>

      {/* Table */}
      <div className="card animate-fade-up delay-2" style={{ borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {['Empresa', 'Propietario', 'Plan', 'Estado', 'Creada', 'Acciones'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', border: '3px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                </td></tr>
              ) : companies.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-3)', fontSize: 14 }}>No se encontraron empresas</td></tr>
              ) : companies.map((c, i) => {
                const plan = PLAN_BADGE[c.plan] || PLAN_BADGE.free
                const status = STATUS_BADGE[c.status] || STATUS_BADGE.active
                return (
                  <tr
                    key={c.id}
                    style={{ borderBottom: i < companies.length - 1 ? '1px solid var(--border-subtle)' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{c.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 1 }}>{c.firebaseUid ? `ID: ${c.firebaseUid.slice(0, 8)}…` : 'Sin Firebase'}</p>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <p style={{ fontSize: 13, color: 'var(--text-2)' }}>{c.ownerName || '—'}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 1 }}>{c.ownerEmail}</p>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${plan.color}20`, color: plan.color }}>{plan.label}</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${status.color}20`, color: status.color }}>{status.label}</span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 13, color: 'var(--text-3)' }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString('es-CO') : '—'}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          onClick={() => openEdit(c)} title="Editar"
                          style={{ padding: 7, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', transition: 'all 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-1)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-3)' }}
                        ><Edit3 size={14} /></button>
                        <button
                          onClick={() => toggleStatus(c)}
                          title={c.status === 'active' ? 'Suspender' : 'Activar'}
                          style={{ padding: 7, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: c.status === 'active' ? '#ff9f0a' : '#30d158', display: 'flex', transition: 'all 0.15s' }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)'}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                        >{c.status === 'active' ? <PowerOff size={14} /> : <Power size={14} />}</button>
                        <button
                          onClick={() => deleteCompany(c)} title="Eliminar"
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
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Mostrando {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} de {total}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: 7, borderRadius: 8, border: 'none', background: 'transparent', cursor: page === 1 ? 'default' : 'pointer', color: 'var(--text-3)', opacity: page === 1 ? 0.4 : 1, display: 'flex', transition: 'all 0.15s' }}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: 13, color: 'var(--text-2)', padding: '0 8px' }}>{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ padding: 7, borderRadius: 8, border: 'none', background: 'transparent', cursor: page === totalPages ? 'default' : 'pointer', color: 'var(--text-3)', opacity: page === totalPages ? 0.4 : 1, display: 'flex', transition: 'all 0.15s' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal create / edit */}
      {modal !== null && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={closeModal} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }} />
          <div className="glass-strong animate-scale-in" style={{ position: 'relative', borderRadius: 20, padding: 28, width: '100%', maxWidth: 460 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
                {modal === 'create' ? 'Nueva Empresa' : 'Editar Empresa'}
              </h3>
              <button onClick={closeModal} style={{ color: 'var(--text-3)', background: 'var(--surface-hover)', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex' }}>
                <X style={{ width: 17, height: 17 }} />
              </button>
            </div>
            <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {formFields.map(({ label, key, type, placeholder, required }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    type={type} placeholder={placeholder} required={required}
                    value={form[key] as string}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    onFocus={focusInput} onBlur={blurInput}
                    style={inputStyle}
                  />
                </div>
              ))}
              <div>
                <label style={labelStyle}>Plan</label>
                <select
                  value={form.plan}
                  onChange={e => setForm(f => ({ ...f, plan: e.target.value as Company['plan'] }))}
                  onFocus={focusInput} onBlur={blurInput}
                  style={{ ...inputStyle, appearance: 'none' }}
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ff453a', fontSize: 13, background: 'rgba(255,69,58,0.1)', borderRadius: 10, padding: '10px 14px' }}>
                  <AlertCircle size={14} />{error}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="button" onClick={closeModal} style={{
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
