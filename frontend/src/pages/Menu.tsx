import { useState, useEffect, useRef } from 'react'
import { menuService, Dish, ScannedDish } from '../services/menuService'
import { PlusCircle, Upload, ScanLine, Pencil, Trash2, X, Check, ChevronDown, ChevronUp, FileText, Image } from 'lucide-react'

const CATEGORIES = ['General', 'Entradas', 'Sopas', 'Platos fuertes', 'Postres', 'Bebidas', 'Especiales']

const card: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  padding: '20px 24px',
}

const btn = (variant: 'primary' | 'ghost' | 'danger' = 'ghost'): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 14px', borderRadius: 9, fontSize: 13, fontWeight: 500,
  cursor: 'pointer', border: 'none', transition: 'all 0.15s',
  background: variant === 'primary' ? 'var(--accent)' : variant === 'danger' ? '#ff3b3020' : 'var(--surface-hover)',
  color: variant === 'primary' ? '#fff' : variant === 'danger' ? '#ff3b30' : 'var(--text-1)',
})

const input: React.CSSProperties = {
  width: '100%', background: 'var(--surface-hover)', border: '1.5px solid transparent',
  borderRadius: 9, padding: '9px 12px', fontSize: 14, color: 'var(--text-1)',
  outline: 'none', boxSizing: 'border-box',
}

// ─── Formulario de plato ──────────────────────────────────────────────────────
function DishForm({ initial, onSave, onCancel }: {
  initial?: Partial<Dish>; onSave: (d: any) => void; onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    description: initial?.description || '',
    category: initial?.category || 'General',
    price: initial?.price ?? 0,
  })
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Nombre *</label>
          <input style={input} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej: Bandeja Paisa" />
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Precio *</label>
          <input style={input} type="number" value={form.price} onChange={e => set('price', parseFloat(e.target.value) || 0)} placeholder="0" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Categoría</label>
          <select style={{ ...input, cursor: 'pointer' }} value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Descripción</label>
          <input style={input} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Opcional" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
        <button style={btn()} onClick={onCancel}><X size={14} /> Cancelar</button>
        <button style={btn('primary')} onClick={() => onSave(form)} disabled={!form.name}>
          <Check size={14} /> Guardar
        </button>
      </div>
    </div>
  )
}

// ─── Scanner modal ────────────────────────────────────────────────────────────
function ScanModal({ onImport, onClose }: { onImport: (dishes: ScannedDish[]) => void; onClose: () => void }) {
  const [stage, setStage] = useState<'upload' | 'scanning' | 'review'>('upload')
  const [scanned, setScanned] = useState<ScannedDish[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [pages, setPages] = useState(0)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError('')
    setStage('scanning')
    try {
      const result = await menuService.scan(file)
      setScanned(result.dishes)
      setPages(result.pages)
      setSelected(new Set(result.dishes.map((_, i) => i)))
      setStage('review')
    } catch (e: any) {
      setError(e.message)
      setStage('upload')
    }
  }

  const toggleSelect = (i: number) => {
    setSelected(prev => {
      const s = new Set(prev)
      s.has(i) ? s.delete(i) : s.add(i)
      return s
    })
  }

  const updateScanned = (i: number, field: keyof ScannedDish, value: string | number) => {
    setScanned(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d))
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#00000080', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ ...card, width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>
            <ScanLine size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: 'var(--accent)' }} />
            Escanear Menú
          </h3>
          <button style={btn()} onClick={onClose}><X size={16} /></button>
        </div>

        {stage === 'upload' && (
          <div>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 16 }}>
              Sube una foto o PDF de tu menú físico. El sistema extrae los platos automáticamente.
            </p>
            {error && <div style={{ background: '#ff3b3015', color: '#ff3b30', padding: '10px 14px', borderRadius: 9, fontSize: 13, marginBottom: 14 }}>{error}</div>}
            <div
              style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 12 }}>
                <Image size={32} style={{ color: 'var(--text-2)' }} />
                <FileText size={32} style={{ color: 'var(--text-2)' }} />
              </div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>Arrastra o haz clic para subir</p>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-2)' }}>JPG, PNG, WEBP o PDF — máx 20 MB</p>
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          </div>
        )}

        {stage === 'scanning' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 15, color: 'var(--text-2)' }}>Analizando con OCR...</p>
          </div>
        )}

        {stage === 'review' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-2)' }}>
                Se detectaron <strong>{scanned.length}</strong> platos en {pages} página(s). Edita y selecciona los que quieres importar.
              </p>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={btn()} onClick={() => setSelected(new Set(scanned.map((_, i) => i)))}>Todo</button>
                <button style={btn()} onClick={() => setSelected(new Set())}>Ninguno</button>
              </div>
            </div>

            {scanned.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-2)', fontSize: 14 }}>
                No se detectaron platos. Intenta con una imagen más clara o sube el PDF del menú.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
              {scanned.map((d, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 120px 140px 32px', gap: 8, alignItems: 'center', padding: '8px 10px', background: selected.has(i) ? 'var(--surface-hover)' : 'transparent', borderRadius: 8 }}>
                  <input type="checkbox" checked={selected.has(i)} onChange={() => toggleSelect(i)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                  <input style={{ ...input, padding: '6px 10px' }} value={d.name} onChange={e => updateScanned(i, 'name', e.target.value)} />
                  <input style={{ ...input, padding: '6px 10px' }} type="number" value={d.price} onChange={e => updateScanned(i, 'price', parseFloat(e.target.value) || 0)} placeholder="Precio" />
                  <select style={{ ...input, padding: '6px 10px', cursor: 'pointer' }} value={d.category} onChange={e => updateScanned(i, 'category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <button style={{ ...btn('danger'), padding: '4px 6px' }} onClick={() => setScanned(prev => prev.filter((_, idx) => idx !== i))}><X size={12} /></button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button style={btn()} onClick={() => setStage('upload')}>Volver</button>
              <button
                style={btn('primary')}
                disabled={selected.size === 0}
                onClick={() => { onImport(scanned.filter((_, i) => selected.has(i))); onClose() }}
              >
                <Check size={14} /> Importar {selected.size} plato{selected.size !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Menu() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Dish | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [expandedCat, setExpandedCat] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try { setDishes(await menuService.list()) }
    catch (e: any) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  // Agrupar por categoría
  const byCategory: Record<string, Dish[]> = {}
  dishes.filter(d => d.active).forEach(d => {
    if (!byCategory[d.category]) byCategory[d.category] = []
    byCategory[d.category].push(d)
  })

  const toggleCat = (cat: string) => setExpandedCat(prev => {
    const s = new Set(prev); s.has(cat) ? s.delete(cat) : s.add(cat); return s
  })

  const handleSave = async (form: any) => {
    setSaving(true)
    try {
      if (editing) { await menuService.update(editing.id, form) }
      else { await menuService.create(form) }
      setShowForm(false); setEditing(null)
      await load()
    } catch (e: any) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este plato del menú?')) return
    await menuService.remove(id); load()
  }

  const handleImport = async (scanned: ScannedDish[]) => {
    try {
      await menuService.importBatch(scanned)
      await load()
    } catch (e: any) { alert(e.message) }
  }

  return (
    <div style={{ padding: '24px 28px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Menú</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-2)' }}>
            {dishes.filter(d => d.active).length} platos activos
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btn()} onClick={() => setShowScanner(true)}>
            <ScanLine size={15} /> Escanear menú
          </button>
          <button style={btn('primary')} onClick={() => { setEditing(null); setShowForm(true) }}>
            <PlusCircle size={15} /> Agregar plato
          </button>
        </div>
      </div>

      {/* Formulario nuevo */}
      {showForm && !editing && (
        <div style={{ ...card, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>Nuevo plato</h3>
          <DishForm onSave={handleSave} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Lista por categoría */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-2)' }}>Cargando menú...</div>
      ) : Object.keys(byCategory).length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '48px 20px' }}>
          <ScanLine size={40} style={{ color: 'var(--text-2)', marginBottom: 12 }} />
          <p style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>No hay platos en el menú</p>
          <p style={{ margin: '6px 0 20px', fontSize: 14, color: 'var(--text-2)' }}>
            Agrega platos manualmente o escanea tu menú físico/PDF
          </p>
          <button style={btn('primary')} onClick={() => setShowScanner(true)}>
            <ScanLine size={14} /> Escanear menú
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat} style={card}>
              <button
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => toggleCat(cat)}
              >
                <span style={{ fontSize: 15, fontWeight: 600 }}>{cat} <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 400 }}>({items.length})</span></span>
                {expandedCat.has(cat) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {!expandedCat.has(cat) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14 }}>
                  {items.map(dish => (
                    <div key={dish.id}>
                      {editing?.id === dish.id ? (
                        <div style={{ background: 'var(--surface-hover)', borderRadius: 10, padding: 14 }}>
                          <DishForm initial={dish} onSave={handleSave} onCancel={() => setEditing(null)} />
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'center', padding: '10px 12px', borderRadius: 9, background: 'var(--surface-hover)' }}>
                          <div>
                            <span style={{ fontSize: 14, fontWeight: 500 }}>{dish.name}</span>
                            {dish.description && <span style={{ fontSize: 12, color: 'var(--text-2)', marginLeft: 8 }}>{dish.description}</span>}
                          </div>
                          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent)', whiteSpace: 'nowrap' }}>
                            ${dish.price.toLocaleString()}
                          </span>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button style={{ ...btn(), padding: '5px 8px' }} onClick={() => setEditing(dish)}><Pencil size={13} /></button>
                            <button style={{ ...btn('danger'), padding: '5px 8px' }} onClick={() => handleDelete(dish.id)}><Trash2 size={13} /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showScanner && <ScanModal onImport={handleImport} onClose={() => setShowScanner(false)} />}
    </div>
  )
}
