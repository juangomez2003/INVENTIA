import { useEffect, useState } from 'react'
import { CreditCard, CheckCircle, RefreshCw } from 'lucide-react'
import { listOrders, updateOrderStatus, type Order } from '../../services/staffService'

export default function CajeroView({ restaurantId }: { restaurantId: string }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState<string | null>(null)
  const [paid, setPaid] = useState<string[]>([])

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
    const interval = setInterval(load, 20_000)
    return () => clearInterval(interval)
  }, [])

  async function handlePay(order: Order) {
    setPaying(order.id)
    try {
      await updateOrderStatus(order.id, 'paid')
      setPaid(prev => [...prev, order.id])
      setTimeout(() => load(), 1500)
    } catch (e) {
      console.error(e)
    } finally {
      setPaying(null)
    }
  }

  const readyOrders = orders.filter(o => o.status === 'ready')
  const recentPaid  = orders.filter(o => o.status === 'paid').slice(0, 5)

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#636366' }}>Cargando...</div>

  return (
    <div style={{ padding: '20px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CreditCard size={22} color="#30d158" /> Caja
          </h1>
          <p style={{ color: '#636366', fontSize: 13, margin: 0 }}>{readyOrders.length} orden(es) lista(s) para cobrar</p>
        </div>
        <button onClick={load} style={{ background: '#2c2c2e', border: 'none', borderRadius: 8, padding: '8px 12px', color: '#aeaeb2', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* Ready to pay */}
      {readyOrders.length === 0 ? (
        <div style={{ background: '#1c1c1e', borderRadius: 12, padding: 40, textAlign: 'center', border: '1px solid #2c2c2e', marginBottom: 24 }}>
          <CreditCard size={32} color="#2c2c2e" style={{ marginBottom: 12 }} />
          <p style={{ color: '#636366', fontSize: 14 }}>No hay órdenes listas para cobrar</p>
          <p style={{ color: '#3a3a3c', fontSize: 13 }}>Esperando que el chef marque órdenes como listas</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {readyOrders.map(order => (
            <div key={order.id} style={{
              background: paid.includes(order.id) ? '#0d2e1a' : '#1c1c1e',
              borderRadius: 12,
              border: `1px solid ${paid.includes(order.id) ? '#30d158' : '#30d15833'}`,
              padding: 20,
              transition: 'all 0.3s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ color: '#fff', fontSize: 24, fontWeight: 800 }}>Mesa {order.table_number}</div>
                  <div style={{ color: '#30d158', fontSize: 12, fontWeight: 600, marginTop: 2 }}>LISTO PARA COBRAR</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#30d158', fontSize: 28, fontWeight: 800 }}>
                    ${Number(order.total).toLocaleString('es-CO')}
                  </div>
                  <div style={{ color: '#636366', fontSize: 12 }}>COP</div>
                </div>
              </div>

              {/* Items */}
              <div style={{ background: '#2c2c2e', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                {order.order_items?.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #3a3a3c', fontSize: 13 }}>
                    <span style={{ color: '#aeaeb2' }}>{item.product_name} × {item.quantity} {item.unit}</span>
                    <span style={{ color: '#fff' }}>${Number(item.subtotal).toLocaleString('es-CO')}</span>
                  </div>
                ))}
                {order.notes && (
                  <p style={{ color: '#ff9f0a', fontSize: 12, marginTop: 8, fontStyle: 'italic' }}>Nota: "{order.notes}"</p>
                )}
              </div>

              <button
                onClick={() => handlePay(order)}
                disabled={paying === order.id || paid.includes(order.id)}
                style={{
                  width: '100%', padding: '14px',
                  background: paid.includes(order.id) ? '#0d2e1a' : (paying === order.id ? '#2c2c2e' : '#30d158'),
                  border: paid.includes(order.id) ? '1px solid #30d158' : 'none',
                  borderRadius: 10, color: paid.includes(order.id) ? '#30d158' : '#000',
                  fontWeight: 700, fontSize: 16, cursor: (paying === order.id || paid.includes(order.id)) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {paid.includes(order.id) ? (
                  <><CheckCircle size={18} /> Pagado — descuento de inventario aplicado</>
                ) : paying === order.id ? (
                  'Procesando...'
                ) : (
                  <><CreditCard size={18} /> Cobrar ${Number(order.total).toLocaleString('es-CO')}</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Recent paid */}
      {recentPaid.length > 0 && (
        <div>
          <h3 style={{ color: '#636366', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>ÓRDENES RECIENTES COBRADAS</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentPaid.map(order => (
              <div key={order.id} style={{ background: '#1c1c1e', borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6 }}>
                <span style={{ color: '#aeaeb2', fontSize: 14 }}>Mesa {order.table_number}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: '#636366', fontSize: 12 }}>
                    {order.closed_at
                      ? new Date(order.closed_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
                      : new Date(order.updated_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
                    }
                  </span>
                  <span style={{ color: '#30d158', fontWeight: 600 }}>${Number(order.total).toLocaleString('es-CO')}</span>
                  <CheckCircle size={14} color="#30d158" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
