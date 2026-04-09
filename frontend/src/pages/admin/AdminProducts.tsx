import { useState, useEffect, useCallback } from 'react'
import {
  Store, Package, ArrowLeftRight, Info, ChevronRight,
  Search, MapPin, Phone, Mail, RefreshCw, Plus, Edit3, Trash2, X, AlertCircle, Save,
} from 'lucide-react'
import { adminService } from '../../services/adminService'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Restaurant = {
  id: string; name: string; owner_id: string; email: string; phone: string
  address: string; alert_threshold: number; notify_email: boolean
  notify_whatsapp: boolean; auto_restock: boolean; product_count: number; created_at: string
}
type Product  = Record<string, unknown>
type Movement = Record<string, unknown>
type Tab = 'info' | 'inventory' | 'movements'

type StockStatus = 'critical' | 'low' | 'normal'
const STATUS_STYLE: Record<StockStatus, { label: string; color: string }> = {
  critical: { label: 'Crítico', color: '#ff453a' },
  low:      { label: 'Bajo',    color: '#ff9f0a' },
  normal:   { label: 'Normal',  color: '#30d158' },
}
const MOV_STYLE: Record<string, { label: string; color: string }> = {
  entrada: { label: 'Entrada', color: '#30d158' },
  salida:  { label: 'Salida',  color: '#ff453a' },
  ajuste:  { label: 'Ajuste',  color: '#ff9f0a' },
  merma:   { label: 'Merma',   color: '#636366' },
}

// ─── Estilos comunes ──────────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
  padding: '12px 18px', textTransform: 'uppercase', letterSpacing: '0.06em',
}
const tdStyle: React.CSSProperties = { padding: '13px 18px' }
const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--surface-hover)', border: '1.5px solid transparent',
  borderRadius: 10, padding: '10px 14px', fontSize: 14, color: 'var(--text-1)',
  outline: 'none', transition: 'all 0.18s', boxSizing: 'border-box', fontFamily: 'inherit',
}
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 }

const focusInput  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.background = 'var(--surface-focus)' }
const blurInput   = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'var(--surface-hover)' }

// ─── Modal de restaurante ─────────────────────────────────────────────────────

function RestaurantModal({ r, onClose, onSaved }: { r: Restaurant; onClose: () => void; onSaved: () => void }) {
  const [form, setForm]     = useState({ name: r.name, address: r.address || '', phone: r.phone || '', email: r.email || '', alert_threshold: r.alert_threshold ?? 20 })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSaving(true)
    try { await adminService.updateRestaurant(r.id, form); onSaved(); onClose() }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error guardando') }
    finally { setSaving(false) }
  }

  const fields = [
    { label: 'Nombre', key: 'name' as const, type: 'text' },
    { label: 'Teléfono', key: 'phone' as const, type: 'tel' },
    { label: 'Dirección', key: 'address' as const, type: 'text' },
    { label: 'Email', key: 'email' as const, type: 'email' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }} />
      <div className="glass-strong animate-scale-in" style={{ position: 'relative', borderRadius: 20, padding: 28, width: '100%', maxWidth: 460 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)' }}>Editar restaurante</h3>
          <button onClick={onClose} style={{ color: 'var(--text-3)', background: 'var(--surface-hover)', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex' }}><X size={16} /></button>
        </div>
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {fields.map(({ label, key, type }) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input type={type} value={form[key] as string} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} onFocus={focusInput} onBlur={blurInput} style={inputStyle} />
            </div>
          ))}
          <div>
            <label style={labelStyle}>Umbral de alerta: {form.alert_threshold}%</label>
            <input type="range" min={5} max={50} value={form.alert_threshold} onChange={e => setForm(f => ({ ...f, alert_threshold: Number(e.target.value) }))} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>
          {error && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ff453a', fontSize: 13, background: 'rgba(255,69,58,0.1)', borderRadius: 10, padding: '10px 14px' }}><AlertCircle size={14} />{error}</div>}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px 0', borderRadius: 10, fontSize: 14, fontWeight: 500, color: 'var(--text-2)', background: 'var(--surface-hover)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px 0', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'white', background: 'var(--accent-gradient)', border: 'none', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1, fontFamily: 'inherit' }}>{saving ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Modal de producto ────────────────────────────────────────────────────────

type ProductForm = { name: string; category: string; quantity: string; unit: string; min_threshold: string; max_capacity: string }
const EMPTY_PROD: ProductForm = { name: '', category: '', quantity: '0', unit: 'kg', min_threshold: '0', max_capacity: '100' }

function ProductModal({
  restaurantId, product, onClose, onSaved,
}: { restaurantId: string; product: Product | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm]     = useState<ProductForm>(product ? {
    name: String(product.name || ''), category: String(product.category || ''),
    quantity: String(product.quantity || 0), unit: String(product.unit || 'kg'),
    min_threshold: String(product.min_threshold || 0), max_capacity: String(product.max_capacity || 100),
  } : EMPTY_PROD)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSaving(true)
    const payload = { name: form.name, category: form.category, quantity: Number(form.quantity), unit: form.unit, min_threshold: Number(form.min_threshold), max_capacity: Number(form.max_capacity) }
    try {
      if (product) await adminService.adminUpdateProduct(restaurantId, String(product.id), payload)
      else         await adminService.adminCreateProduct(restaurantId, payload)
      onSaved(); onClose()
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error guardando') }
    finally { setSaving(false) }
  }

  const fields: Array<{ label: string; key: keyof ProductForm; type: string; required?: boolean }> = [
    { label: 'Nombre',        key: 'name',          type: 'text',   required: true },
    { label: 'Categoría',     key: 'category',      type: 'text',   required: true },
    { label: 'Unidad (kg, L, u…)', key: 'unit',     type: 'text',   required: true },
    { label: 'Cantidad actual',key: 'quantity',     type: 'number', required: true },
    { label: 'Stock mínimo',  key: 'min_threshold', type: 'number', required: true },
    { label: 'Capacidad máx', key: 'max_capacity',  type: 'number', required: true },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }} />
      <div className="glass-strong animate-scale-in" style={{ position: 'relative', borderRadius: 20, padding: 28, width: '100%', maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)' }}>{product ? 'Editar producto' : 'Nuevo producto'}</h3>
          <button onClick={onClose} style={{ color: 'var(--text-3)', background: 'var(--surface-hover)', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex' }}><X size={16} /></button>
        </div>
        <form onSubmit={save} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {fields.map(({ label, key, type, required }) => (
            <div key={key} style={{ gridColumn: key === 'name' || key === 'category' ? '1 / -1' : 'auto' }}>
              <label style={labelStyle}>{label}</label>
              <input type={type} required={required} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} onFocus={focusInput} onBlur={blurInput} style={inputStyle} />
            </div>
          ))}
          {error && <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 8, color: '#ff453a', fontSize: 13, background: 'rgba(255,69,58,0.1)', borderRadius: 10, padding: '10px 14px' }}><AlertCircle size={14} />{error}</div>}
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px 0', borderRadius: 10, fontSize: 14, fontWeight: 500, color: 'var(--text-2)', background: 'var(--surface-hover)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px 0', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'white', background: 'var(--accent-gradient)', border: 'none', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1, fontFamily: 'inherit' }}>{saving ? 'Guardando…' : product ? 'Guardar cambios' : 'Crear producto'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Tab: Información ─────────────────────────────────────────────────────────

function InfoTab({ r, onEdit }: { r: Restaurant; onEdit: () => void }) {
  const rows = [
    { icon: Store,  label: 'Nombre',    value: r.name },
    { icon: MapPin, label: 'Dirección', value: r.address || '—' },
    { icon: Phone,  label: 'Teléfono',  value: r.phone   || '—' },
    { icon: Mail,   label: 'Email',     value: r.email   || '—' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ borderRadius: 14, padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Datos del negocio</p>
          <button onClick={onEdit} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: 'var(--accent)', background: 'var(--nav-active-bg)', fontFamily: 'inherit' }}>
            <Edit3 size={12} /> Editar
          </button>
        </div>
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--nav-active-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon style={{ width: 14, height: 14, color: 'var(--accent)' }} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>{label}</p>
              <p style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>{value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="card" style={{ borderRadius: 14, padding: 22 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Configuración IA</p>
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>Umbral de alerta</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--progress-bg)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${r.alert_threshold * 2}%`, borderRadius: 2, background: 'var(--accent)' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{r.alert_threshold}%</span>
          </div>
        </div>
        {[{ label: 'Email', value: r.notify_email }, { label: 'WhatsApp', value: r.notify_whatsapp }, { label: 'Reposición auto', value: r.auto_restock }].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Notif. {label}</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: value ? 'rgba(48,209,88,0.12)' : 'rgba(99,99,102,0.12)', color: value ? '#30d158' : '#636366' }}>{value ? 'Activo' : 'Inactivo'}</span>
          </div>
        ))}
      </div>
      <div className="card" style={{ borderRadius: 14, padding: 22 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Meta</p>
        <div style={{ display: 'flex', gap: 20 }}>
          <div><p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Registrado</p><p style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>{r.created_at ? new Date(r.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p></div>
          <div><p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Productos</p><p style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>{r.product_count}</p></div>
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Inventario con CRUD ─────────────────────────────────────────────────

function InventoryTab({
  restaurantId, products, loading, onRefresh,
}: { restaurantId: string; products: Product[]; loading: boolean; onRefresh: () => void }) {
  const [search, setSearch]         = useState('')
  const [modal, setModal]           = useState<null | 'create' | Product>(null)
  const [deleting, setDeleting]     = useState<string | null>(null)

  const filtered = search ? products.filter(p => String(p.name || '').toLowerCase().includes(search.toLowerCase()) || String(p.category || '').toLowerCase().includes(search.toLowerCase())) : products
  const critical = products.filter(p => p.status === 'critical').length
  const low      = products.filter(p => p.status === 'low').length

  const handleDelete = async (p: Product) => {
    if (!confirm(`¿Eliminar "${p.name}"? Esto también eliminará sus movimientos.`)) return
    setDeleting(String(p.id))
    try { await adminService.adminDeleteProduct(restaurantId, String(p.id)); onRefresh() }
    catch (e) { console.error(e) }
    finally { setDeleting(null) }
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[{ label: 'Total', value: products.length, color: '#5856d6' }, { label: 'Crítico', value: critical, color: '#ff453a' }, { label: 'Bajo', value: low, color: '#ff9f0a' }].map(({ label, value, color }) => (
            <div key={label} className="card" style={{ padding: '12px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color }}>{value}</span>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'var(--text-3)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto o categoría…" style={{ ...inputStyle, paddingLeft: 34, padding: '9px 14px 9px 34px' }} />
          </div>
          <button onClick={() => setModal('create')} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'white', background: 'var(--accent-gradient)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            <Plus size={14} /> Nuevo producto
          </button>
        </div>
        <div className="card" style={{ borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Producto', 'Categoría', 'Stock', 'Capacidad', 'Estado', ''].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px 0' }}><div style={{ width: 22, height: 22, borderRadius: '50%', border: '3px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)', fontSize: 13 }}>{search ? 'Sin resultados' : 'Sin productos'}</td></tr>
                ) : filtered.map((p, i) => {
                  const statusKey = (p.status as StockStatus) || 'normal'
                  const status = STATUS_STYLE[statusKey] || STATUS_STYLE.normal
                  const qty = Number(p.quantity || 0)
                  const maxC = Number(p.max_capacity || 100)
                  const pct = maxC > 0 ? Math.round(qty / maxC * 100) : 0
                  const isDel = deleting === String(p.id)
                  return (
                    <tr key={String(p.id || i)} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none', transition: 'background 0.15s', opacity: isDel ? 0.5 : 1 }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ ...tdStyle, fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{String(p.name || '—')}</td>
                      <td style={{ ...tdStyle, fontSize: 13, color: 'var(--text-2)' }}>{String(p.category || '—')}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 56, height: 4, borderRadius: 2, background: 'var(--progress-bg)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: 2, background: status.color, width: `${pct}%` }} />
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{qty} {String(p.unit || '')}</span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, fontSize: 13, color: 'var(--text-3)' }}>{maxC} {String(p.unit || '')}</td>
                      <td style={tdStyle}><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${status.color}20`, color: status.color }}>{status.label}</span></td>
                      <td style={{ ...tdStyle, paddingRight: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <button onClick={() => setModal(p)} title="Editar" style={{ padding: 7, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-3)', display: 'flex' }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-1)' }} onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-3)' }}><Edit3 size={13} /></button>
                          <button onClick={() => handleDelete(p)} disabled={isDel} title="Eliminar" style={{ padding: 7, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-3)', display: 'flex' }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,69,58,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#ff453a' }} onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-3)' }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal !== null && (
        <ProductModal
          restaurantId={restaurantId}
          product={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={onRefresh}
        />
      )}
    </>
  )
}

// ─── Tab: Movimientos ─────────────────────────────────────────────────────────

function MovementsTab({ movements, loading }: { movements: Movement[]; loading: boolean }) {
  const [search, setSearch] = useState('')
  const filtered = search ? movements.filter(m => String(m.product_name || '').toLowerCase().includes(search.toLowerCase()) || String(m.type || '').toLowerCase().includes(search.toLowerCase())) : movements
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ position: 'relative' }}>
        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'var(--text-3)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar movimiento…" style={{ ...inputStyle, paddingLeft: 34, padding: '9px 14px 9px 34px' }} />
      </div>
      <div className="card" style={{ borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Nota'].map(h => <th key={h} style={thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px 0' }}><div style={{ width: 22, height: 22, borderRadius: '50%', border: '3px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)', fontSize: 13 }}>Sin movimientos</td></tr>
              ) : filtered.map((m, i) => {
                const typeKey = String(m.type || 'ajuste')
                const movStyle = MOV_STYLE[typeKey] || { label: typeKey, color: '#636366' }
                return (
                  <tr key={String(m.id || i)} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ ...tdStyle, fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{m.created_at ? new Date(String(m.created_at)).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</td>
                    <td style={{ ...tdStyle, fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{String(m.product_name || '—')}</td>
                    <td style={tdStyle}><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${movStyle.color}20`, color: movStyle.color }}>{movStyle.label}</span></td>
                    <td style={{ ...tdStyle, fontSize: 13, color: movStyle.color, fontWeight: 600 }}>{typeKey === 'salida' || typeKey === 'merma' ? '-' : '+'}{Number(m.quantity || 0)} {String(m.product_unit || '')}</td>
                    <td style={{ ...tdStyle, fontSize: 12, color: 'var(--text-3)', maxWidth: 180 }}>{String(m.notes || '—')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AdminProducts() {
  const [restaurants, setRestaurants]   = useState<Restaurant[]>([])
  const [selected, setSelected]         = useState<Restaurant | null>(null)
  const [tab, setTab]                   = useState<Tab>('info')
  const [products, setProducts]         = useState<Product[]>([])
  const [movements, setMovements]       = useState<Movement[]>([])
  const [loadingList, setLoadingList]   = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [search, setSearch]             = useState('')
  const [editRestaurant, setEditRestaurant] = useState(false)

  const loadRestaurants = () => {
    setLoadingList(true)
    adminService.getRestaurants()
      .then(data => setRestaurants(data as Restaurant[]))
      .catch(console.error)
      .finally(() => setLoadingList(false))
  }

  useEffect(() => { loadRestaurants() }, [])

  const loadDetail = useCallback(async (r: Restaurant) => {
    setLoadingDetail(true); setProducts([]); setMovements([])
    try {
      const [prodRes, movRes] = await Promise.all([
        adminService.getRestaurantProducts(r.id),
        adminService.getRestaurantMovements(r.id),
      ])
      setProducts(prodRes.items); setMovements(movRes.items)
    } catch (e) { console.error(e) }
    finally { setLoadingDetail(false) }
  }, [])

  const handleSelect = (r: Restaurant) => { setSelected(r); setTab('info'); loadDetail(r) }

  const handleRestaurantSaved = () => {
    loadRestaurants()
    if (selected) {
      // Actualizar nombre local mientras recarga
      adminService.getRestaurants().then(data => {
        const updated = (data as Restaurant[]).find(r => r.id === selected.id)
        if (updated) setSelected(updated)
      })
    }
  }

  const filtered = search ? restaurants.filter(r => r.name.toLowerCase().includes(search.toLowerCase())) : restaurants

  const TABS = [
    { key: 'info' as Tab,      label: 'Info',        icon: Info },
    { key: 'inventory' as Tab, label: 'Inventario',  icon: Package },
    { key: 'movements' as Tab, label: 'Movimientos', icon: ArrowLeftRight },
  ]

  return (
    <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="animate-fade-up">
        <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Administración</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Store style={{ width: 26, height: 26, color: 'var(--accent)', strokeWidth: 1.75 }} />
          Restaurantes
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>{restaurants.length} restaurante{restaurants.length !== 1 ? 's' : ''} registrado{restaurants.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="animate-fade-up delay-1" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Sidebar */}
        <div className="card" style={{ borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '12px 12px 8px' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, color: 'var(--text-3)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar…" style={{ ...inputStyle, paddingLeft: 28, padding: '7px 10px 7px 28px', fontSize: 12 }} />
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border-subtle)' }} />
          {loadingList ? (
            <div style={{ padding: '28px 0', display: 'flex', justifyContent: 'center' }}><div style={{ width: 20, height: 20, borderRadius: '50%', border: '3px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} /></div>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '28px 14px', fontSize: 13, color: 'var(--text-3)' }}>Sin restaurantes</p>
          ) : (
            <div style={{ overflowY: 'auto', maxHeight: 560 }}>
              {filtered.map((r, i) => (
                <div key={r.id}>
                  <button onClick={() => handleSelect(r)} style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', background: selected?.id === r.id ? 'var(--nav-active-bg)' : 'transparent', borderLeft: selected?.id === r.id ? '3px solid var(--accent)' : '3px solid transparent', padding: '13px 14px', transition: 'all 0.15s', borderRadius: selected?.id === r.id ? '0 8px 8px 0' : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: selected?.id === r.id ? 'var(--accent)' : 'var(--text-1)' }}>{r.name}</span>
                      <ChevronRight style={{ width: 13, height: 13, color: selected?.id === r.id ? 'var(--accent)' : 'var(--text-3)', flexShrink: 0 }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, display: 'block' }}>{r.product_count} productos</span>
                  </button>
                  {i < filtered.length - 1 && <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0 12px' }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel derecho */}
        {selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card" style={{ borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>{selected.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{selected.email || '—'}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setEditRestaurant(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: 'var(--accent)', background: 'var(--nav-active-bg)', fontFamily: 'inherit' }}><Save size={12} /> Editar</button>
                <button onClick={() => loadDetail(selected)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 6, borderRadius: 8 }} title="Actualizar"><RefreshCw style={{ width: 14, height: 14 }} /></button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              {TABS.map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setTab(key)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', background: tab === key ? 'var(--nav-active-bg)' : 'var(--surface-hover)', color: tab === key ? 'var(--accent)' : 'var(--text-2)', transition: 'all 0.15s' }}>
                  <Icon style={{ width: 13, height: 13 }} />{label}
                </button>
              ))}
            </div>

            {tab === 'info'      && <InfoTab r={selected} onEdit={() => setEditRestaurant(true)} />}
            {tab === 'inventory' && <InventoryTab restaurantId={selected.id} products={products} loading={loadingDetail} onRefresh={() => loadDetail(selected)} />}
            {tab === 'movements' && <MovementsTab movements={movements} loading={loadingDetail} />}
          </div>
        ) : (
          <div className="card" style={{ borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: 12 }}>
            <Store style={{ width: 32, height: 32, color: 'var(--text-3)', strokeWidth: 1.5 }} />
            <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Selecciona un restaurante</p>
          </div>
        )}
      </div>

      {editRestaurant && selected && (
        <RestaurantModal r={selected} onClose={() => setEditRestaurant(false)} onSaved={handleRestaurantSaved} />
      )}
    </div>
  )
}
