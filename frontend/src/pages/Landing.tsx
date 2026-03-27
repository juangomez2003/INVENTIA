import { Link } from 'react-router-dom';
import { ArrowRight, Bell, BarChart3, Package, Check, Star, Sun, Moon, ChevronRight, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';

const plans = [
  {
    name: 'Starter', price: '$10', period: '/mes', description: 'Para empezar sin complicaciones',
    features: ['Dashboard básico', 'Hasta 50 productos', 'Alertas por email', 'Soporte por chat'],
    highlight: false,
  },
  {
    name: 'Pro', price: '$29', period: '/mes', description: 'El preferido de los restaurantes',
    features: ['Todo en Starter', 'Predicción de consumo', 'Alertas WhatsApp', 'Reportes avanzados', 'Acceso API'],
    highlight: true,
  },
  {
    name: 'Enterprise', price: '$79', period: '/mes', description: 'Para cadenas y múltiples sucursales',
    features: ['Todo en Pro', 'Sucursales ilimitadas', 'API pública', 'Soporte prioritario 24/7', 'Integraciones POS'],
    highlight: false,
  },
];

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const surface  = isDark ? 'rgba(28,28,30,0.95)' : 'rgba(255,255,255,0.95)';
  const surface2 = isDark ? '#2c2c2e' : '#f5f5f7';
  const border   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      minHeight: '100vh', width: '100%', overflowX: 'hidden',
      background: 'var(--bg-base)', color: 'var(--text-1)',
    }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: isDark ? 'rgba(0,0,0,0.80)' : 'rgba(245,245,247,0.88)',
        borderBottom: `1px solid ${border}`,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo size={28} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {[['#producto', 'Producto'], ['#precios', 'Precios'], ['#contacto', 'Contacto']].map(([href, label]) => (
              <a key={href} href={href} style={{ fontSize: 13, color: 'var(--text-3)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
              >{label}</a>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={toggleTheme} style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--toggle-bg)', border: `1px solid ${border}`,
              color: 'var(--text-3)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s',
            }}>
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <Link to="/login" style={{
              padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              color: 'white', background: 'var(--accent-gradient)', textDecoration: 'none',
              transition: 'opacity 0.18s',
            }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.85')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')}
            >Acceder</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO (split) ── */}
      <section style={{ width: '100%', maxWidth: 1080, margin: '0 auto', padding: '120px 28px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

          {/* Left — copy */}
          <div className="animate-fade-up">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 20, marginBottom: 28,
              background: surface2, border: `1px solid ${border}`,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>Disponible para restaurantes en Colombia</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', fontWeight: 800,
              color: 'var(--text-1)', lineHeight: 1.1,
              letterSpacing: '-0.04em', marginBottom: 20,
            }}>
              Tu inventario,<br />
              <span style={{ color: 'var(--accent)' }}>siempre bajo control</span>
            </h1>

            <p style={{ fontSize: 16, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
              La plataforma que los restaurantes necesitan para gestionar su stock,
              evitar faltantes y tomar decisiones basadas en datos reales.
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 48 }}>
              <Link to="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 26px', borderRadius: 11,
                fontSize: 15, fontWeight: 700, color: 'white',
                background: 'var(--accent-gradient)', textDecoration: 'none',
                boxShadow: '0 4px 16px var(--accent-glow)', transition: 'all 0.18s',
              }}>
                Comenzar gratis <ArrowRight size={16} />
              </Link>
              <a href="#producto" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '12px 22px', borderRadius: 11,
                fontSize: 15, fontWeight: 500, color: 'var(--text-2)',
                background: 'var(--surface)', border: `1px solid ${border}`,
                textDecoration: 'none', transition: 'all 0.18s',
              }}>
                Ver el producto <ChevronRight size={15} />
              </a>
            </div>

            {/* Mini stats */}
            <div style={{ display: 'flex', gap: 28, borderTop: `1px solid ${border}`, paddingTop: 24 }}>
              {[['500+', 'Restaurantes'], ['35%', 'Menos desperdicio'], ['24/7', 'Monitoreo activo']].map(([val, label]) => (
                <div key={label}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>{val}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — product mockup */}
          <div className="animate-fade-up delay-1" style={{ position: 'relative' }}>
            {/* Floating alert card */}
            <div style={{
              position: 'absolute', top: -18, right: -10, zIndex: 2,
              background: surface, border: `1px solid ${border}`,
              borderRadius: 14, padding: '12px 16px',
              boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', gap: 10, minWidth: 210,
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,69,58,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={16} style={{ color: '#ff453a' }} />
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>Stock crítico</p>
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>Aceite de oliva — 2L restantes</p>
              </div>
            </div>

            {/* Main mockup card */}
            <div style={{
              background: surface, border: `1px solid ${border}`,
              borderRadius: 18, overflow: 'hidden',
              boxShadow: isDark ? '0 24px 64px rgba(0,0,0,0.6)' : '0 16px 48px rgba(0,0,0,0.1)',
            }}>
              {/* Card header */}
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff453a' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff9f0a' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#30d158' }} />
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace' }}>inventario.inventia.co</span>
              </div>

              {/* Stat row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0, borderBottom: `1px solid ${border}` }}>
                {[
                  { label: 'Productos', value: '24', color: '#0a84ff' },
                  { label: 'Alertas',   value: '3',  color: '#ff453a' },
                  { label: 'Al día',    value: '87%', color: '#30d158' },
                ].map((s, i) => (
                  <div key={s.label} style={{
                    padding: '16px 18px', textAlign: 'center',
                    borderRight: i < 2 ? `1px solid ${border}` : 'none',
                  }}>
                    <p style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: '-0.03em' }}>{s.value}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2, fontWeight: 500 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Product rows */}
              {[
                { name: 'Pollo entero', cat: 'Carnes', qty: 45, max: 80, pct: 56, status: 'ok' },
                { name: 'Aceite oliva', cat: 'Aceites', qty: 2, max: 20, pct: 10, status: 'critical' },
                { name: 'Tomates',      cat: 'Verduras', qty: 18, max: 40, pct: 45, status: 'low' },
                { name: 'Res molida',   cat: 'Carnes', qty: 30, max: 50, pct: 60, status: 'ok' },
              ].map((p) => {
                const color = p.status === 'critical' ? '#ff453a' : p.status === 'low' ? '#ff9f0a' : '#30d158'
                return (
                  <div key={p.name} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 20px', borderBottom: `1px solid ${border}`,
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{p.name}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{p.cat}</p>
                    </div>
                    <div style={{ width: 72 }}>
                      <div style={{ height: 4, borderRadius: 2, background: border, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${p.pct}%`, background: color, borderRadius: 2 }} />
                      </div>
                      <p style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 2, textAlign: 'right' }}>{p.qty} kg</p>
                    </div>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  </div>
                )
              })}

              <div style={{ padding: '12px 20px' }}>
                <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center' }}>Actualizado hace 2 minutos</p>
              </div>
            </div>

            {/* Floating check badge */}
            <div style={{
              position: 'absolute', bottom: -14, left: -10, zIndex: 2,
              background: surface, border: `1px solid ${border}`,
              borderRadius: 12, padding: '10px 14px',
              boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.08)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <CheckCircle2 size={16} style={{ color: '#30d158', flexShrink: 0 }} />
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-1)' }}>Pedido sugerido listo</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div style={{ width: '100%', maxWidth: 1080, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${border}, transparent)` }} />
      </div>

      {/* ── PRODUCTO — feature spotlights ── */}
      <section id="producto" style={{ width: '100%', maxWidth: 1080, margin: '0 auto', padding: '96px 28px', display: 'flex', flexDirection: 'column', gap: 100 }}>

        {/* Spotlight 1 — Inventario */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div className="animate-fade-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: 'rgba(10,132,255,0.1)', marginBottom: 20 }}>
              <Package size={12} style={{ color: '#0a84ff' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#0a84ff', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Inventario</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.2 }}>
              Todo tu stock en un solo lugar
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 28, maxWidth: 400 }}>
              Registra productos, categorías y proveedores. Controla cantidades mínimas y
              recibe el aviso justo antes de que algo falte.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Categorías y proveedores por producto', 'Umbrales mínimos personalizables', 'Historial de movimientos de entrada y salida'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                  <Check size={15} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Mockup — inventory table */}
          <div className="animate-fade-up delay-1" style={{
            background: surface, border: `1px solid ${border}`, borderRadius: 16, overflow: 'hidden',
            boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.08)',
          }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Inventario</p>
              <div style={{ fontSize: 11, color: 'var(--text-3)', background: surface2, padding: '3px 10px', borderRadius: 20 }}>24 productos</div>
            </div>
            {[
              { name: 'Pollo', cat: 'Carnes', qty: '45 kg', pct: 56, color: '#30d158' },
              { name: 'Cebolla', cat: 'Verduras', qty: '22 kg', pct: 44, color: '#30d158' },
              { name: 'Aceite', cat: 'Aceites', qty: '2 L', pct: 10, color: '#ff453a' },
              { name: 'Queso', cat: 'Lácteos', qty: '8 kg', pct: 32, color: '#ff9f0a' },
              { name: 'Arroz', cat: 'Granos', qty: '50 kg', pct: 83, color: '#30d158' },
            ].map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 18px', borderBottom: `1px solid ${border}` }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Package size={13} style={{ color: 'var(--text-3)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{p.name}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-3)' }}>{p.cat}</p>
                </div>
                <div style={{ width: 60 }}>
                  <div style={{ height: 3, borderRadius: 2, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${p.pct}%`, background: p.color, borderRadius: 2 }} />
                  </div>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-2)', minWidth: 40, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{p.qty}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Spotlight 2 — Alertas (reversed) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

          {/* Mockup — alerts */}
          <div className="animate-fade-up" style={{
            background: surface, border: `1px solid ${border}`, borderRadius: 16, overflow: 'hidden',
            boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.08)',
          }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${border}` }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Alertas activas</p>
            </div>
            {[
              { type: 'critical', icon: AlertTriangle, color: '#ff453a', bg: 'rgba(255,69,58,0.1)', title: 'Stock crítico', msg: 'Aceite de oliva — 2 L restantes' },
              { type: 'warning',  icon: TrendingDown,  color: '#ff9f0a', bg: 'rgba(255,159,10,0.1)', title: 'Stock bajo', msg: 'Queso mozzarella — 8 kg restantes' },
              { type: 'warning',  icon: TrendingDown,  color: '#ff9f0a', bg: 'rgba(255,159,10,0.1)', title: 'Stock bajo', msg: 'Tomates cherry — 5 kg restantes' },
              { type: 'info',     icon: Bell,          color: '#0a84ff', bg: 'rgba(10,132,255,0.1)', title: 'Reposición sugerida', msg: 'Crear orden de compra para 3 productos' },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px', borderBottom: `1px solid ${border}` }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <a.icon size={15} style={{ color: a.color }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{a.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{a.msg}</p>
                </div>
              </div>
            ))}
            <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>Ver todas las alertas →</span>
            </div>
          </div>

          <div className="animate-fade-up delay-1">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: 'rgba(255,159,10,0.1)', marginBottom: 20 }}>
              <Bell size={12} style={{ color: '#ff9f0a' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#ff9f0a', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Alertas</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.2 }}>
              Entérate antes de que sea tarde
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 28, maxWidth: 400 }}>
              El sistema monitorea tu inventario en tiempo real y te avisa cuando un producto
              está por debajo del mínimo que tú defines.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Notificaciones por email y WhatsApp', 'Niveles mínimos por producto', 'Historial de alertas con timestamps'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                  <Check size={15} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Spotlight 3 — Reportes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div className="animate-fade-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: 'rgba(88,86,214,0.1)', marginBottom: 20 }}>
              <BarChart3 size={12} style={{ color: '#5856d6' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#5856d6', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Reportes</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.2 }}>
              Datos que te dicen qué comprar
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 28, maxWidth: 400 }}>
              Visualiza consumo semanal, identifica los productos más usados y toma
              decisiones de compra con información real de tu operación.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Tendencias de consumo por semana', 'Ranking de productos más usados', 'Exportación de reportes en PDF/Excel'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--text-2)' }}>
                  <Check size={15} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Mockup — chart */}
          <div className="animate-fade-up delay-1" style={{
            background: surface, border: `1px solid ${border}`, borderRadius: 16, overflow: 'hidden',
            boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.08)',
            padding: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Consumo semanal</p>
                <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Últimas 4 semanas</p>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>+12% vs anterior</div>
            </div>
            {/* Bar chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100, marginBottom: 10 }}>
              {[55, 70, 48, 82, 68, 90, 74].map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                  <div style={{
                    width: '100%', height: `${h}%`, borderRadius: '4px 4px 0 0',
                    background: i === 5
                      ? 'var(--accent-gradient)'
                      : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                  }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['L','M','X','J','V','S','D'].map(d => (
                <div key={d} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--text-3)' }}>{d}</div>
              ))}
            </div>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${border}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['Más usado', 'Pollo — 90 kg'], ['Menos usado', 'Camarones — 12 kg']].map(([label, val]) => (
                <div key={label} style={{ background: surface2, borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3 }}>{label}</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div style={{ width: '100%', maxWidth: 1080, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${border}, transparent)` }} />
      </div>

      {/* ── PRICING ── */}
      <section id="precios" style={{ width: '100%', maxWidth: 940, margin: '0 auto', padding: '96px 28px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Precios</p>
        <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: 'var(--text-1)', marginBottom: 12, letterSpacing: '-0.03em' }}>
          Sin sorpresas. Sin contratos.
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-2)', marginBottom: 52 }}>Empieza gratis. Escala cuando lo necesites.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14 }}>
          {plans.map((plan) => (
            <div key={plan.name} className="card" style={{
              borderRadius: 18, padding: '28px 24px', textAlign: 'left',
              ...(plan.highlight ? {
                border: '1.5px solid var(--border-focus)',
                boxShadow: `var(--card-shadow), 0 0 0 1px var(--border-focus)`,
              } : {}),
            }}>
              {plan.highlight && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 14, padding: '4px 12px', borderRadius: 20, background: 'var(--nav-active-bg)' }}>
                  <Star style={{ width: 10, height: 10, color: 'var(--accent)', fill: 'var(--accent)' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.06em' }}>MÁS POPULAR</span>
                </div>
              )}
              <h3 style={{ fontSize: 19, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em', marginBottom: 4 }}>{plan.name}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>{plan.description}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.04em' }}>{plan.price}</span>
                <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-2)' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--nav-active-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check style={{ width: 9, height: 9, color: 'var(--accent)', strokeWidth: 3 }} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/login" style={{
                display: 'block', textAlign: 'center', padding: '12px 0', borderRadius: 11,
                fontSize: 14, fontWeight: 700, textDecoration: 'none', transition: 'all 0.18s',
                ...(plan.highlight
                  ? { background: 'var(--accent-gradient)', color: 'white', boxShadow: '0 4px 12px var(--accent-glow)' }
                  : { background: surface2, color: 'var(--text-1)', border: `1px solid ${border}` }
                ),
              }}>Empezar</Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="contacto" style={{ width: '100%', maxWidth: 620, margin: '0 auto', padding: '40px 28px 100px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.04em', marginBottom: 16, lineHeight: 1.1 }}>
          ¿Listo para tener<br />control total?
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 36, maxWidth: 380, margin: '0 auto 36px' }}>
          Más de 500 restaurantes en Colombia ya gestionan su inventario con Inventia.
          Empieza hoy, sin tarjeta de crédito.
        </p>
        <Link to="/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '14px 36px', borderRadius: 12,
          fontSize: 16, fontWeight: 700, color: 'white',
          background: 'var(--accent-gradient)', textDecoration: 'none',
          boxShadow: '0 6px 24px var(--accent-glow)', transition: 'all 0.18s',
        }}>
          Crear cuenta gratis <ArrowRight size={17} />
        </Link>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 16 }}>Sin tarjeta · Cancela cuando quieras</p>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ width: '100%', borderTop: `1px solid ${border}`, padding: '28px 28px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <Logo size={22} />
          <div style={{ display: 'flex', gap: 24 }}>
            {[['#producto', 'Producto'], ['#precios', 'Precios'], ['#contacto', 'Contacto']].map(([href, label]) => (
              <a key={href} href={href} style={{ fontSize: 12, color: 'var(--text-3)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-2)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
              >{label}</a>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>© 2026 INVENTIA. Todos los derechos reservados.</p>
        </div>
      </footer>

    </div>
  );
}
