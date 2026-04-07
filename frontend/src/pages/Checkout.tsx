import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { useTheme } from '../context/ThemeContext'
import { ChevronLeft, Check, Lock, CreditCard, Sun, Moon, AlertCircle, CheckCircle2 } from 'lucide-react'
import Logo from '../components/Logo'

// ── Stripe init ──────────────────────────────────────────────────────────────
// Agrega VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... a frontend/.env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

// ── Plan config ──────────────────────────────────────────────────────────────
const PLANS: Record<string, { name: string; price: number; displayPrice: string; period: string; features: string[]; color: string }> = {
  starter: {
    name: 'Starter',
    price: 49900,          // COP — centavos para Stripe: 4990000
    displayPrice: '$49.900',
    period: '/mes',
    features: ['Dashboard básico', 'Hasta 50 productos', 'Alertas por email', 'Soporte por chat'],
    color: '#0a84ff',
  },
  pro: {
    name: 'Pro',
    price: 99900,
    displayPrice: '$99.900',
    period: '/mes',
    features: ['Todo en Starter', 'Predicción de consumo', 'Alertas WhatsApp', 'Reportes avanzados', 'Acceso API'],
    color: 'var(--accent)',
  },
  enterprise: {
    name: 'Enterprise',
    price: 249900,
    displayPrice: '$249.900',
    period: '/mes',
    features: ['Todo en Pro', 'Sucursales ilimitadas', 'API pública', 'Soporte prioritario 24/7', 'Integraciones POS'],
    color: '#30d158',
  },
}

// ── Stripe card element style (inyectado como objeto de opciones) ─────────────
function useCardStyle(isDark: boolean) {
  return {
    style: {
      base: {
        fontSize: '15px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: isDark ? '#f5f5f7' : '#1c1c1e',
        '::placeholder': { color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' },
      },
      invalid: { color: '#ff453a' },
    },
  }
}

// ── Inner form (needs Elements context) ──────────────────────────────────────
function CheckoutForm({ plan, isDark }: { plan: typeof PLANS[string]; isDark: boolean }) {
  const stripe   = useStripe()
  const elements = useElements()
  const navigate = useNavigate()

  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)

  const cardStyle = useCardStyle(isDark)

  const surface = isDark ? 'rgba(28,28,30,0.95)' : '#ffffff'
  const border  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'

  const inputBase: React.CSSProperties = {
    width: '100%', background: isDark ? '#2c2c2e' : '#f5f5f7',
    border: '1.5px solid transparent', borderRadius: 12,
    padding: '13px 16px', fontSize: 15, color: 'var(--text-1)',
    outline: 'none', transition: 'all 0.18s', boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  const cardWrap: React.CSSProperties = {
    background: isDark ? '#2c2c2e' : '#f5f5f7',
    border: '1.5px solid transparent', borderRadius: 12,
    padding: '13px 16px', transition: 'all 0.18s',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) { setError('Stripe no está listo. Verifica la clave pública.'); return }
    setError('')
    setLoading(true)

    try {
      // 1. Crear PaymentIntent en el backend
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.name.toLowerCase(), email }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Error al iniciar el pago')
      }

      const { client_secret } = await res.json()

      // 2. Confirmar pago con Stripe.js
      const cardNumber = elements.getElement(CardNumberElement)
      if (!cardNumber) throw new Error('Error al obtener el elemento de tarjeta')

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardNumber,
          billing_details: { name, email },
        },
      })

      if (stripeError) throw new Error(stripeError.message)
      if (paymentIntent?.status === 'succeeded') setSuccess(true)

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(48,209,88,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <CheckCircle2 size={32} style={{ color: '#30d158' }} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>
          Pago exitoso
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 32, lineHeight: 1.6 }}>
          Tu suscripción al plan <strong>{plan.name}</strong> está activa.<br />
          Revisa tu correo para los detalles de confirmación.
        </p>
        <button
          onClick={() => navigate('/login')}
          style={{
            padding: '13px 32px', borderRadius: 12, border: 'none',
            background: 'var(--accent-gradient)', color: 'white',
            fontSize: 15, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Ir al panel
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Personal info */}
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 8 }}>
          Nombre completo
        </label>
        <input
          type="text" value={name} required
          onChange={e => setName(e.target.value)}
          placeholder="Carlos García"
          style={inputBase}
          onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.background = isDark ? '#3a3a3c' : '#eef2ff' }}
          onBlur={e  => { e.target.style.borderColor = 'transparent';          e.target.style.background = isDark ? '#2c2c2e' : '#f5f5f7' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 8 }}>
          Correo electrónico
        </label>
        <input
          type="email" value={email} required
          onChange={e => setEmail(e.target.value)}
          placeholder="carlos@restaurante.com"
          style={inputBase}
          onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.background = isDark ? '#3a3a3c' : '#eef2ff' }}
          onBlur={e  => { e.target.style.borderColor = 'transparent';          e.target.style.background = isDark ? '#2c2c2e' : '#f5f5f7' }}
        />
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 1, background: border }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CreditCard size={13} style={{ color: 'var(--text-3)' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Datos de tarjeta
          </span>
        </div>
        <div style={{ flex: 1, height: 1, background: border }} />
      </div>

      {/* Card number */}
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 8 }}>
          Número de tarjeta
        </label>
        <div style={cardWrap}>
          <CardNumberElement options={cardStyle} />
        </div>
      </div>

      {/* Expiry + CVC */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 8 }}>
            Vencimiento
          </label>
          <div style={cardWrap}>
            <CardExpiryElement options={cardStyle} />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 8 }}>
            CVC
          </label>
          <div style={cardWrap}>
            <CardCvcElement options={cardStyle} />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)',
          borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#ff453a', lineHeight: 1.4,
        }}>
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit" disabled={loading || !stripe}
        style={{
          width: '100%', padding: '15px 0', borderRadius: 12,
          fontSize: 15, fontWeight: 700, color: 'white', border: 'none',
          cursor: loading || !stripe ? 'not-allowed' : 'pointer',
          opacity: loading || !stripe ? 0.65 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: 'var(--accent-gradient)',
          boxShadow: '0 4px 16px var(--accent-glow)',
          transition: 'all 0.2s', fontFamily: 'inherit',
        }}
      >
        {loading ? (
          <div style={{
            width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite',
          }} />
        ) : (
          <>
            <Lock size={15} />
            Pagar {plan.displayPrice} COP
          </>
        )}
      </button>

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
        Pago seguro con Stripe · Cancela cuando quieras · Sin contratos
      </p>
    </form>
  )
}

// ── Page component ────────────────────────────────────────────────────────────
export default function Checkout() {
  const [params] = useSearchParams()
  const { theme, toggleTheme } = useTheme()
  const isDark  = theme === 'dark'
  const planKey = params.get('plan') || 'pro'
  const plan    = PLANS[planKey] ?? PLANS.pro

  const border  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'
  const surface = isDark ? 'rgba(28,28,30,0.95)'    : 'rgba(255,255,255,0.95)'

  const stripeConfigured = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Theme toggle */}
      <button onClick={toggleTheme} style={{
        position: 'fixed', top: 20, right: 20, zIndex: 100,
        width: 38, height: 38, borderRadius: '50%',
        background: 'var(--toggle-bg)', border: `1px solid ${border}`,
        color: 'var(--toggle-icon)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
      }}>
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Header */}
      <header style={{
        borderBottom: `1px solid ${border}`,
        background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(245,245,247,0.9)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div style={{
          maxWidth: 960, margin: '0 auto', padding: '0 28px',
          height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Logo size={26} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)' }}>
            <Lock size={12} />
            Pago seguro
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, maxWidth: 880, margin: '0 auto', width: '100%', padding: '48px 28px 80px' }}>

        {/* Back */}
        <Link to="/landing#precios" style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 13, color: 'var(--text-2)', textDecoration: 'none',
          marginBottom: 36, transition: 'color 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}
        >
          <ChevronLeft size={15} />
          Volver a precios
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>

          {/* ── LEFT — Form ── */}
          <div style={{
            background: surface, border: `1px solid ${border}`,
            borderRadius: 20, padding: '36px 32px',
            boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)',
          }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em', marginBottom: 6 }}>
              Suscribirse a {plan.name}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 32 }}>
              Completa tu información para activar el plan.
            </p>

            {!stripeConfigured && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                background: 'rgba(255,159,10,0.08)', border: '1px solid rgba(255,159,10,0.25)',
                borderRadius: 10, padding: '12px 14px', marginBottom: 24,
                fontSize: 13, color: '#ff9f0a', lineHeight: 1.5,
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                  <strong>Modo demo:</strong> agrega{' '}
                  <code style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>VITE_STRIPE_PUBLISHABLE_KEY</code>{' '}
                  en <code style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>frontend/.env</code> para habilitar pagos reales.
                </span>
              </div>
            )}

            <Elements stripe={stripePromise}>
              <CheckoutForm plan={plan} isDark={isDark} />
            </Elements>
          </div>

          {/* ── RIGHT — Summary ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Plan card */}
            <div style={{
              background: surface, border: `1px solid ${border}`,
              borderRadius: 20, padding: '28px 24px',
              boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)',
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                Resumen del pedido
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)' }}>{plan.name}</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>
                  {plan.displayPrice}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>
                COP · Facturado mensualmente
              </p>

              <div style={{ height: 1, background: border, marginBottom: 20 }} />

              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-2)' }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%',
                      background: 'var(--nav-active-bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Check style={{ width: 9, height: 9, color: 'var(--accent)', strokeWidth: 3 }} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <div style={{ height: 1, background: border, marginBottom: 16 }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-2)', marginBottom: 8 }}>
                <span>Subtotal</span>
                <span>{plan.displayPrice} COP</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>
                <span>Total hoy</span>
                <span>{plan.displayPrice} COP</span>
              </div>
            </div>

            {/* Trust badges */}
            <div style={{
              background: surface, border: `1px solid ${border}`,
              borderRadius: 16, padding: '18px 20px',
            }}>
              {[
                { icon: Lock,         text: 'Pago cifrado con TLS y 3D Secure' },
                { icon: CheckCircle2, text: 'Cancela en cualquier momento' },
                { icon: CreditCard,   text: 'Visa, Mastercard y American Express' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Icon size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{text}</span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Lock size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Procesado por Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
