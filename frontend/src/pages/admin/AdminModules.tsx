import { useState, useEffect } from 'react'
import { Puzzle, Package, Brain, Bell, MessageCircle, FileText, Users, Plug, Building2 } from 'lucide-react'
import { adminService } from '../../services/adminService'
import type { CompanyModule, Company } from '../../types'

const ICON_MAP: Record<string, React.ElementType> = {
  package: Package,
  brain: Brain,
  bell: Bell,
  'message-circle': MessageCircle,
  'file-text': FileText,
  users: Users,
  plug: Plug,
}

const inputStyle: React.CSSProperties = {
  background: 'var(--surface-hover)',
  border: '1.5px solid transparent', borderRadius: 10,
  padding: '10px 14px', fontSize: 14, color: 'var(--text-1)',
  outline: 'none', transition: 'all 0.18s', boxSizing: 'border-box', fontFamily: 'inherit',
  appearance: 'none',
}

export default function AdminModules() {
  const [modules, setModules] = useState<CompanyModule[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>('global')
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [mods, comps] = await Promise.all([
        adminService.getModules(selectedCompany === 'global' ? undefined : selectedCompany),
        adminService.getCompanies({ limit: 100 }),
      ])
      setModules(mods)
      setCompanies(comps.items)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [selectedCompany])

  const toggle = async (moduleKey: string, current: boolean) => {
    if (selectedCompany === 'global') return
    setToggling(moduleKey)
    try {
      await adminService.toggleModule(selectedCompany, moduleKey, !current)
      setModules(ms => ms.map(m => m.moduleKey === moduleKey ? { ...m, enabled: !current } : m))
    } catch (e) { console.error(e) }
    finally { setToggling(null) }
  }

  const focusInput = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--border-focus)'
    e.target.style.background = 'var(--surface-focus)'
  }
  const blurInput = (e: React.FocusEvent<HTMLSelectElement>) => {
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
          <Puzzle style={{ width: 26, height: 26, color: 'var(--accent)', strokeWidth: 1.75 }} />
          Gestión de Módulos
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>Activa o desactiva funcionalidades por empresa</p>
      </div>

      {/* Company selector */}
      <div className="animate-fade-up delay-1" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Building2 style={{ width: 16, height: 16, color: 'var(--text-3)', strokeWidth: 1.75, flexShrink: 0 }} />
          <select
            value={selectedCompany}
            onChange={e => setSelectedCompany(e.target.value)}
            onFocus={focusInput} onBlur={blurInput}
            style={{ ...inputStyle, minWidth: 220 }}
          >
            <option value="global">Vista global (todos los módulos)</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {selectedCompany === 'global' && (
          <span style={{ fontSize: 12, padding: '5px 12px', borderRadius: 20, background: 'var(--surface-hover)', color: 'var(--text-3)' }}>
            Selecciona una empresa para editar
          </span>
        )}
      </div>

      {/* Modules grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div className="animate-fade-up delay-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {modules.map(mod => {
            const Icon = ICON_MAP[mod.icon] || Package
            const isToggling = toggling === mod.moduleKey
            const canToggle = selectedCompany !== 'global'
            return (
              <div
                key={mod.moduleKey}
                className="card"
                style={{
                  padding: 20, borderRadius: 16, transition: 'all 0.2s',
                  border: mod.enabled ? '1px solid rgba(48,209,88,0.2)' : '1px solid var(--border-subtle)',
                  opacity: mod.enabled ? 1 : 0.7,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      background: mod.enabled ? 'rgba(48,209,88,0.12)' : 'var(--surface-hover)',
                    }}>
                      <Icon style={{ width: 20, height: 20, color: mod.enabled ? '#30d158' : 'var(--text-3)', strokeWidth: 1.75 }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{mod.displayName}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{mod.description}</p>
                    </div>
                  </div>

                  {/* Toggle switch */}
                  <button
                    onClick={() => toggle(mod.moduleKey, mod.enabled)}
                    disabled={!canToggle || isToggling}
                    title={!canToggle ? 'Selecciona una empresa para editar' : ''}
                    style={{
                      position: 'relative', flexShrink: 0,
                      width: 44, height: 24, borderRadius: 12,
                      border: 'none', cursor: !canToggle ? 'not-allowed' : 'pointer',
                      background: mod.enabled ? '#30d158' : 'var(--surface-hover)',
                      opacity: !canToggle ? 0.5 : isToggling ? 0.7 : 1,
                      transition: 'all 0.2s', padding: 0,
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: 2, left: mod.enabled ? 22 : 2,
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                      transition: 'left 0.2s',
                    }} />
                  </button>
                </div>

                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                    ...(mod.enabled
                      ? { color: '#30d158', background: 'rgba(48,209,88,0.12)' }
                      : { color: 'var(--text-3)', background: 'var(--surface-hover)' }
                    ),
                  }}>
                    {mod.enabled ? 'Activo' : 'Inactivo'}
                  </span>
                  <code style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace' }}>{mod.moduleKey}</code>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
