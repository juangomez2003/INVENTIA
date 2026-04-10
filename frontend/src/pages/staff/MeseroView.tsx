import { useEffect, useState } from 'react'
import { Plus, Trash2, Send, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { listOrders, createOrder, getStaffProducts, type Order, type OrderItem } from '../../services/staffService'

const STATUS_LABELS: Record<string, string> = {
  pending:    'Esperando cocina',
  in_kitchen: 'En cocina',
  ready:      'Listo para entregar',
  paid:       'Pagado',
  cancelled:  'Cancelado',
}
const STATUS_COLORS: Record<string, string> = {
  pending:    '#ff9f0a',
  in_kitchen: '#0a84ff',
  ready:      '#30d158',
  paid:       '#636366',
  cancelled:  '#ff453a',
}

interface Product {
  id: string
  name: string
  unit: string
  price_per_unit: number
  quantity: number
  category: string
}

export default function MeseroView({ restaurantId }: { restaurantId: string }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [tableNum, setTableNum] = useState(1)
  const [notes, setNotes] = useState('')
  const [cart, setCart] = useState<(OrderItem & { key: number })[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [qty, setQty] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const load = async () => {
    try {
      const [o, p] = await Promise.all([
        listOrders(),
        getStaffProducts(),
      ])
      setOrders(o)
      setProducts(p as Product[])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function addToCart() {
    const prod = products.find(p => p.id === selectedProduct)
    if (!prod) return
    setCart(prev => [...prev, {
      key: Date.now(),
      product_id: prod.id,
      product_name: prod.name,
      quantity: qty,
      unit: prod.unit,
      price_per_unit: prod.price_per_unit,
    }])
    setSelectedProduct('')
    setQty(1)
  }

  async function handleSubmit() {
    if (cart.length === 0) { setError('Agrega al menos un producto'); return }
    setSubmitting(true)
    setError('')
    try {
      await createOrder({ table_number: tableNum, notes, items: cart.map(({ key, ...rest }) => rest) })
      setCart([])
      setNotes('')
      setTableNum(1)
      setShowForm(false)
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const activeOrders = orders.filter(o => !['paid', 'cancelled'].includes(o.status))

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#636366' }}>Cargando...</div>

  return (
    <div style={{ padding: '20px', maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>Mis Órdenes</h1>
          <p style={{ color: '#636366', fontSize: 13, margin: 0 }}>{activeOrders.length} órdenes activas</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={load} style={{ background: '#2c2c2e', border: 'none', borderRadius: 8, padding: '8px 12px', color: '#aeaeb2', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <RefreshCw size={14} /> Actualizar
          </button>
          <button onClick={() => setShowForm(!showForm)} style={{ background: '#30d158', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#000', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <Plus size={16} /> Nueva orden
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: '#1c1c1e', borderRadius: 12, padding: 24, marginBottom: 24, border: '1px solid #2c2c2e' }}>
          <h3 style={{ color: '#fff', margin: '0 0 20px' }}>Nueva Orden</h3>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: '0 0 120px' }}>
              <label style={{ display: 'block', color: '#aeaeb2', fontSize: 12, marginBottom: 4 }}>Nº de Mesa</label>
              <input
                type="number" min={1} max={99} value={tableNum}
                onChange={e => setTableNum(Number(e.target.value))}
                style={{ width: '100%', padding: '10px 12px', background: '#2c2c2e', border: '1px solid #3a3a3c', borderRadius: 8, color: '#fff', fontSize: 18, fontWeight: 700, textAlign: 'center', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: 'block', color: '#aeaeb2', fontSize: 12, marginBottom: 4 }}>Notas</label>
              <input
                value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Sin gluten, sin cebolla..."
                style={{ width: '100%', padding: '10px 12px', background: '#2c2c2e', border: '1px solid #3a3a3c', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Add item */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <select
              value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}
              style={{ flex: 1, minWidth: 180, padding: '10px 12px', background: '#2c2c2e', border: '1px solid #3a3a3c', borderRadius: 8, color: selectedProduct ? '#fff' : '#636366', fontSize: 14 }}
            >
              <option value="">Seleccionar producto...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} — ${p.price_per_unit.toLocaleString('es-CO')} / {p.unit}</option>
              ))}
            </select>
            <input
              type="number" min={0.1} step={0.1} value={qty}
              onChange={e => setQty(Number(e.target.value))}
              style={{ width: 80, padding: '10px 12px', background: '#2c2c2e', border: '1px solid #3a3a3c', borderRadius: 8, color: '#fff', fontSize: 14, textAlign: 'center' }}
            />
            <button onClick={addToCart} disabled={!selectedProduct} style={{ background: '#0a84ff', border: 'none', borderRadius: 8, padding: '10px 16px', color: '#fff', cursor: selectedProduct ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <Plus size={15} /> Agregar
            </button>
          </div>

          {/* Cart */}
          {cart.length > 0 && (
            <div style={{ background: '#2c2c2e', borderRadius: 8, padding: 12, marginBottom: 16 }}>
              {cart.map((item, i) => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < cart.length - 1 ? '1px solid #3a3a3c' : 'none' }}>
                  <span style={{ color: '#fff', fontSize: 14 }}>{item.product_name} × {item.quantity} {item.unit}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: '#30d158', fontSize: 14 }}>${(item.quantity * item.price_per_unit).toLocaleString('es-CO')}</span>
                    <button onClick={() => setCart(c => c.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#ff453a', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <span style={{ color: '#fff', fontWeight: 700 }}>Total: ${cart.reduce((s, i) => s + i.quantity * i.price_per_unit, 0).toLocaleString('es-CO')}</span>
              </div>
            </div>
          )}

          {error && <p style={{ color: '#ff453a', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowForm(false)} style={{ background: '#2c2c2e', border: 'none', borderRadius: 8, padding: '10px 16px', color: '#aeaeb2', cursor: 'pointer' }}>Cancelar</button>
            <button onClick={handleSubmit} disabled={submitting || cart.length === 0} style={{ background: '#30d158', border: 'none', borderRadius: 8, padding: '10px 20px', color: '#000', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Send size={15} /> {submitting ? 'Enviando...' : 'Enviar a cocina'}
            </button>
          </div>
        </div>
      )}

      {/* Orders list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {activeOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#636366' }}>No tienes órdenes activas</div>
        ) : activeOrders.map(order => (
          <div key={order.id} style={{ background: '#1c1c1e', borderRadius: 12, border: '1px solid #2c2c2e', overflow: 'hidden' }}>
            <div
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: '#2c2c2e', borderRadius: 8, padding: '6px 14px', color: '#fff', fontWeight: 700, fontSize: 18 }}>
                  Mesa {order.table_number}
                </div>
                <span style={{ background: STATUS_COLORS[order.status] + '22', color: STATUS_COLORS[order.status], fontSize: 12, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: '#30d158', fontWeight: 700 }}>${Number(order.total).toLocaleString('es-CO')}</span>
                {expandedOrder === order.id ? <ChevronUp size={16} color="#636366" /> : <ChevronDown size={16} color="#636366" />}
              </div>
            </div>
            {expandedOrder === order.id && order.order_items && (
              <div style={{ padding: '0 18px 14px', borderTop: '1px solid #2c2c2e' }}>
                {order.notes && <p style={{ color: '#636366', fontSize: 13, margin: '10px 0 8px', fontStyle: 'italic' }}>"{order.notes}"</p>}
                {order.order_items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#aeaeb2', fontSize: 13 }}>
                    <span>{item.product_name} × {item.quantity} {item.unit}</span>
                    <span>${Number(item.subtotal).toLocaleString('es-CO')}</span>
                  </div>
                ))}
                <p style={{ color: '#636366', fontSize: 12, marginTop: 8 }}>
                  {new Date(order.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
