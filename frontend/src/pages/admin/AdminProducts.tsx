import { useState, useEffect, useCallback } from 'react'
import { Package, Search } from 'lucide-react'
import { adminService } from '../../services/adminService'
import type { Company } from '../../types'

type StockStatus = 'critical' | 'low' | 'normal'
const STATUS_STYLE: Record<StockStatus, { label: string; color: string }> = {
  critical: { label: 'Crítico', color: '#ff453a' },
  low:      { label: 'Bajo',    color: '#ff9f0a' },
  normal:   { label: 'Normal',  color: '#30d158' },
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--surface-hover)',
  border: '1.5px solid transparent', borderRadius: 10,
  padding: '10px 14px', fontSize: 14, color: 'var(--text-1)',
  outline: 'none', transition: 'all 0.18s', boxSizing: 'border-box', fontFamily: 'inherit',
}
const thStyle: React.CSSProperties = {
  textAlign: 'left', fontSize: 11, fontWeight: 600,
  color: 'var(--text-3)', padding: '12px 20px',
  textTransform: 'uppercase', letterSpacing: '0.06em',
}
const tdStyle: React.CSSProperties = { padding: '14px 20px' }

export default function AdminProducts() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const LIMIT = 20

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [prodRes, compRes] = await Promise.all([
        adminService.getProducts({ page, limit: LIMIT, companyId: companyFilter || undefined }),
        adminService.getCompanies({ limit: 100 }),
      ])
      setProducts(prodRes.items as Record<string, unknown>[])
      setTotal(prodRes.total)
      setCompanies(compRes.items)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, companyFilter])

  useEffect(() => { load() }, [load])

  const filtered = search
    ? products.filter(p => String(p.name || '').toLowerCase().includes(search.toLowerCase()) || String(p.category || '').toLowerCase().includes(search.toLowerCase()))
    : products

  const critical = filtered.filter(p => p.status === 'critical').length

  const statItems = [
    { label: 'Total productos', value: total, color: '#5856d6', bg: 'rgba(88,86,214,0.1)' },
    { label: 'Estado crítico', value: critical, color: '#ff453a', bg: 'rgba(255,69,58,0.1)' },
    { label: 'Empresas con datos', value: companies.length, color: '#ff9f0a', bg: 'rgba(255,159,10,0.1)' },
  ]

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
      <div className="animate-fade-up">
        <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Administración
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Package style={{ width: 26, height: 26, color: 'var(--accent)', strokeWidth: 1.75 }} />
          Productos — Vista Global
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>{total} producto{total !== 1 ? 's' : ''} en total</p>
      </div>

      {/* Stats */}
      <div className="animate-fade-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {statItems.map(({ label, value, color, bg }) => (
          <div key={label} className="card" style={{ padding: '20px 22px', borderRadius: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Package style={{ width: 18, height: 18, color, strokeWidth: 1.75 }} />
              </div>
              <div>
                <p style={{ fontSize: 26, fontWeight: 700, color, letterSpacing: '-0.02em' }}>{value}</p>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="animate-fade-up delay-2" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'var(--text-3)', strokeWidth: 1.75 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto o categoría..."
            onFocus={focusInput} onBlur={blurInput}
            style={{ ...inputStyle, paddingLeft: 38, borderRadius: 12 }}
          />
        </div>
        <select
          value={companyFilter}
          onChange={e => { setCompanyFilter(e.target.value); setPage(1) }}
          onFocus={focusInput} onBlur={blurInput}
          style={{ ...inputStyle, width: 'auto', minWidth: 180, appearance: 'none', borderRadius: 12 }}
        >
          <option value="">Todas las empresas</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card animate-fade-up delay-3" style={{ borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {['Producto', 'Empresa', 'Categoría', 'Stock', 'Estado', 'Último mov.'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', border: '3px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-3)', fontSize: 14 }}>No se encontraron productos</td></tr>
              ) : filtered.map((p, i) => {
                const statusKey = (p.status as StockStatus) || 'normal'
                const status = STATUS_STYLE[statusKey] || STATUS_STYLE.normal
                const qty = Number(p.quantity || 0)
                const maxC = Number(p.max_capacity || p.maxCapacity || 100)
                const pct = maxC > 0 ? Math.round(qty / maxC * 100) : 0
                return (
                  <tr
                    key={String(p.id || i)}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ ...tdStyle, fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{String(p.name || '—')}</td>
                    <td style={{ ...tdStyle, fontSize: 13, color: 'var(--text-3)' }}>{String(p.company_name || p.companyName || '—')}</td>
                    <td style={{ ...tdStyle, fontSize: 13, color: 'var(--text-2)' }}>{String(p.category || '—')}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 64, height: 4, borderRadius: 2, background: 'var(--progress-bg)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 2, background: status.color, width: `${pct}%`, transition: 'width 0.3s' }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{qty} {String(p.unit || '')}</span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${status.color}20`, color: status.color }}>{status.label}</span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 13, color: 'var(--text-3)' }}>{p.last_updated ? new Date(String(p.last_updated)).toLocaleDateString('es-CO') : '—'}</td>
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
