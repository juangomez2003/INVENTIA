import { useState, useEffect } from 'react'
import { Puzzle, ClipboardList, Users, Brain, BarChart2, CreditCard, Check, Crown } from 'lucide-react'
import { adminService, adminRequest } from '../../services/adminService'

interface Restaurant { id: string; name: string; plan: string }
interface Module {
  module_key: string
  display_name: string
  description: string
  icon: string
  plan_required: string
  enabled: boolean
}

const MODULE_ICONS: Record<string, React.ReactNode> = {
  orders:    <ClipboardList size={18} />,
  staff:     <Users size={18} />,
  ai:        <Brain size={18} />,
  analytics: <BarChart2 size={18} />,
  payments:  <CreditCard size={18} />,
}

const PLAN_ORDER = ['free', 'pro', 'enterprise']
const PLAN_COLORS: Record<string, string> = {
  free:       '#636366',
  pro:        '#0a84ff',
  enterprise: '#ff9f0a',
}
const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuito', pro: 'Pro', enterprise: 'Enterprise',
}

export default function AdminModules() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [modules, setModules] = useState<Module[]>([])
  const [loadingRest, setLoadingRest] = useState(true)
  const [loadingMod, setLoadingMod] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const [planUpdating, setPlanUpdating] = useState(false)

  useEffect(() => {
    adminService.getRestaurants().then((data: Restaurant[]) => {
      setRestaurants(data)
      if (data.length > 0) setSelectedId(data[0].id)
    }).finally(() => setLoadingRest(false))
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setLoadingMod(true)
    adminRequest<Module[]>(`/admin/restaurants/${selectedId}/modules`)
      .then(setModules)
      .finally(() => setLoadingMod(false))
  }, [selectedId])

  const selected = restaurants.find(r => r.id === selectedId)

  async function toggleModule(moduleKey: string, current: boolean) {
    setToggling(moduleKey)
    try {
      await adminRequest(`/admin/restaurants/${selectedId}/modules/${moduleKey}`, {
        method: 'PUT',
        body: JSON.stringify({ enabled: !current }),
      })
      setModules(prev => prev.map(m => m.module_key === moduleKey ? { ...m, enabled: !current } : m))
    } finally {
      setToggling(null)
    }
  }

  async function updatePlan(plan: string) {
    if (!selectedId) return
    setPlanUpdating(true)
    try {
      await adminRequest(`/admin/restaurants/${selectedId}/plan`, {
        method: 'PUT',
        body: JSON.stringify({ plan }),
      })
      setRestaurants(prev => prev.map(r => r.id === selectedId ? { ...r, plan } : r))
    } finally {
      setPlanUpdating(false)
    }
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
          Módulos por Restaurante
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
          Habilita o deshabilita funcionalidades por restaurante según su plan
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Restaurant selector */}
        <div className="card animate-fade-up delay-1" style={{ borderRadius: 16, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Restaurantes ({restaurants.length})
            </p>
          </div>
          {loadingRest ? (
            <div style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            </div>
          ) : restaurants.map(r => (
            <div
              key={r.id}
              onClick={() => setSelectedId(r.id)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                background: selectedId === r.id ? 'var(--surface-hover)' : 'transparent',
                borderLeft: selectedId === r.id ? '3px solid var(--accent)' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <p style={{ fontSize: 13, fontWeight: selectedId === r.id ? 600 : 400, color: 'var(--text-1)', marginBottom: 3 }}>{r.name}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {(r.plan !== 'free') && <Crown size={10} color={PLAN_COLORS[r.plan]} />}
                <span style={{ fontSize: 11, color: PLAN_COLORS[r.plan] || 'var(--text-3)', fontWeight: 600 }}>
                  {PLAN_LABELS[r.plan] || r.plan}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Modules panel */}
        {selectedId && selected && (
          <div>
            {/* Plan selector */}
            <div className="card animate-fade-up delay-1" style={{ borderRadius: 16, padding: '18px 20px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 3 }}>{selected.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Cambia el plan para desbloquear módulos</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {PLAN_ORDER.map(p => (
                    <button
                      key={p}
                      onClick={() => updatePlan(p)}
                      disabled={planUpdating}
                      style={{
                        padding: '7px 16px', borderRadius: 20,
                        border: `1.5px solid ${selected.plan === p ? PLAN_COLORS[p] : 'var(--border-subtle)'}`,
                        background: selected.plan === p ? `${PLAN_COLORS[p]}22` : 'transparent',
                        color: selected.plan === p ? PLAN_COLORS[p] : 'var(--text-3)',
                        fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', gap: 5,
                      }}
                    >
                      {p !== 'free' && <Crown size={11} />}
                      {PLAN_LABELS[p]}
                      {selected.plan === p && <Check size={11} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modules list */}
            <div className="card animate-fade-up delay-2" style={{ borderRadius: 16, overflow: 'hidden' }}>
              {loadingMod ? (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                </div>
              ) : modules.map((mod, i) => {
                const planIndex = PLAN_ORDER.indexOf(mod.plan_required)
                const currentPlanIndex = PLAN_ORDER.indexOf(selected.plan || 'free')
                const available = currentPlanIndex >= planIndex
                return (
                  <div
                    key={mod.module_key}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '18px 20px',
                      borderBottom: i < modules.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      opacity: available ? 1 : 0.5,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: mod.enabled && available ? 'var(--accent-dim)' : 'var(--surface-hover)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: mod.enabled && available ? 'var(--accent)' : 'var(--text-3)',
                      }}>
                        {MODULE_ICONS[mod.module_key] || <Puzzle size={18} />}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{mod.display_name}</p>
                          {mod.plan_required !== 'free' && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: `${PLAN_COLORS[mod.plan_required]}22`, color: PLAN_COLORS[mod.plan_required], display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Crown size={9} /> {PLAN_LABELS[mod.plan_required]}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{mod.description}</p>
                        {!available && (
                          <p style={{ fontSize: 11, color: '#ff9f0a', marginTop: 3 }}>
                            Requiere plan {PLAN_LABELS[mod.plan_required]}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Toggle switch */}
                    <button
                      onClick={() => available && toggleModule(mod.module_key, mod.enabled)}
                      disabled={!available || toggling === mod.module_key}
                      style={{
                        width: 48, height: 28, borderRadius: 14,
                        background: mod.enabled && available ? 'var(--accent)' : 'var(--surface-hover)',
                        border: 'none', cursor: available ? 'pointer' : 'not-allowed',
                        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                      }}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: 4,
                        left: mod.enabled && available ? 24 : 4,
                        transition: 'left 0.2s',
                      }} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
