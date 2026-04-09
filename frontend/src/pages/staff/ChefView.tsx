import { useEffect, useState } from 'react'
import { CheckCircle, Clock, RefreshCw, ChefHat } from 'lucide-react'
import { listOrders, updateOrderStatus, type Order } from '../../services/staffService'

const STATUS_LABELS: Record<string, string> = {
  pending:    'Esperando',
  in_kitchen: 'En preparación',
}

export default function ChefView({ restaurantId }: { restaurantId: string }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const load = async () => {
    try {
      const o = await listOrders()
      setOrders(o)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [])

  async function advance(order: Order) {
    setUpdating(order.id)
    try {
      const next = order.status === 'pending' ? 'in_kitchen' : 'ready'
      await updateOrderStatus(order.id, next)
      await load()
    } finally {
      setUpdating(null)
    }
  }

  const pending    = orders.filter(o => o.status === 'pending')
  const inKitchen  = orders.filter(o => o.status === 'in_kitchen')

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#636366' }}>Cargando órdenes...</div>

  return (
    <div style={{ padding: '20px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ChefHat size={22} color="#ff9f0a" /> Cocina
          </h1>
          <p style={{ color: '#636366', fontSize: 13, margin: 0 }}>
            {pending.length} esperando · {inKitchen.length} en preparación
          </p>
        </div>
        <button onClick={load} style={{ background: '#2c2c2e', border: 'none', borderRadius: 8, padding: '8px 12px', color: '#aeaeb2', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Pendientes */}
        <div>
          <h3 style={{ color: '#ff9f0a', fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={15} /> ESPERANDO ({pending.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pending.length === 0 ? (
              <p style={{ color: '#3a3a3c', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Sin órdenes pendientes</p>
            ) : pending.map(order => (
              <OrderCard key={order.id} order={order} onAdvance={advance} updating={updating} nextLabel="Iniciar preparación" nextColor="#0a84ff" />
            ))}
          </div>
        </div>

        {/* En cocina */}
        <div>
          <h3 style={{ color: '#0a84ff', fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ChefHat size={15} /> EN PREPARACIÓN ({inKitchen.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {inKitchen.length === 0 ? (
              <p style={{ color: '#3a3a3c', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Sin órdenes en preparación</p>
            ) : inKitchen.map(order => (
              <OrderCard key={order.id} order={order} onAdvance={advance} updating={updating} nextLabel="Marcar listo" nextColor="#30d158" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function OrderCard({ order, onAdvance, updating, nextLabel, nextColor }: {
  order: Order
  onAdvance: (o: Order) => void
  updating: string | null
  nextLabel: string
  nextColor: string
}) {
  const elapsed = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)

  return (
    <div style={{ background: '#1c1c1e', borderRadius: 12, border: '1px solid #2c2c2e', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>Mesa {order.table_number}</div>
          <div style={{ color: '#636366', fontSize: 12, marginTop: 2 }}>hace {elapsed} min</div>
        </div>
        <div style={{ color: '#30d158', fontWeight: 700, fontSize: 15 }}>${Number(order.total).toLocaleString('es-CO')}</div>
      </div>

      {order.notes && (
        <p style={{ background: '#ff9f0a22', color: '#ff9f0a', fontSize: 12, padding: '4px 8px', borderRadius: 6, marginBottom: 10, fontStyle: 'italic' }}>
          "{order.notes}"
        </p>
      )}

      {order.order_items && order.order_items.map(item => (
        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #2c2c2e', color: '#aeaeb2', fontSize: 13 }}>
          <span style={{ fontWeight: 600 }}>{item.quantity} {item.unit}</span>
          <span>{item.product_name}</span>
        </div>
      ))}

      <button
        onClick={() => onAdvance(order)}
        disabled={updating === order.id}
        style={{
          width: '100%', marginTop: 14, padding: '10px', background: updating === order.id ? '#2c2c2e' : nextColor,
          border: 'none', borderRadius: 8, color: '#000', fontWeight: 600, fontSize: 14,
          cursor: updating === order.id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        <CheckCircle size={16} /> {updating === order.id ? 'Guardando...' : nextLabel}
      </button>
    </div>
  )
}
