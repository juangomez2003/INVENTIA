import { Link } from 'react-router-dom';
import {
  Utensils,
  Brain,
  BarChart3,
  Bell,
  ShieldCheck,
  ArrowRight,
  Package,
  TrendingUp,
  Zap,
  ChevronRight,
  Star,
  Check,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'IA Predictiva',
    description: 'Analiza consumo histórico y predice cuándo se agotará cada producto.',
    color: 'from-purple-500 to-violet-600',
  },
  {
    icon: BarChart3,
    title: 'Dashboard en Tiempo Real',
    description: 'Visualiza ventas, inventario y tendencias con gráficas interactivas.',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    icon: Bell,
    title: 'Alertas Automáticas',
    description: 'Recibe notificaciones cuando un producto está por debajo del mínimo.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: Package,
    title: 'Gestión de Inventario',
    description: 'Control total de productos, categorías, proveedores y almacenamiento.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: TrendingUp,
    title: 'Recomendaciones de Compra',
    description: 'La IA te dice exactamente qué comprar y cuánto para optimizar costos.',
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: ShieldCheck,
    title: 'Reducción de Desperdicio',
    description: 'Minimiza pérdidas con predicciones basadas en datos reales.',
    color: 'from-indigo-500 to-blue-600',
  },
];

const plans = [
  {
    name: 'Starter',
    price: '$10',
    period: '/mes',
    description: '1 restaurante',
    features: ['Dashboard básico', 'Hasta 50 productos', 'Alertas por email', 'Soporte por chat'],
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mes',
    description: 'IA + predicción',
    features: ['Todo en Starter', 'IA predictiva', 'Alertas WhatsApp', 'Reportes avanzados', 'Acceso API'],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '$79',
    period: '/mes',
    description: 'Múltiples sucursales',
    features: ['Todo en Pro', 'Sucursales ilimitadas', 'API pública', 'Soporte prioritario', 'Integraciones POS'],
  },
];

export default function Landing() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>

      {/* ===== NAVBAR ===== */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }} className="glass-sidebar border-b border-white/[0.06]">
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Utensils className="w-4 h-4 text-white" />
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>RestaurantAI</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="hidden md:flex">
            <a href="#features" style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Funciones</a>
            <a href="#how-it-works" style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Cómo funciona</a>
            <a href="#pricing" style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Precios</a>
          </div>
          <Link
            to="/login"
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/20"
          >
            Iniciar sesión
            <ArrowRight className="w-4 h-4 hidden sm:block" />
          </Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section style={{ width: '100%', maxWidth: 800, margin: '0 auto', padding: '140px 24px 64px', textAlign: 'center', position: 'relative' }}>
        {/* BG blobs */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'rgba(124,58,237,0.12)', borderRadius: '50%', filter: 'blur(180px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 400, height: 400, background: 'rgba(6,182,212,0.1)', borderRadius: '50%', filter: 'blur(150px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div className="glass" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 9999, marginBottom: 32, border: '1px solid rgba(255,255,255,0.1)' }}>
            <Zap style={{ width: 14, height: 14, color: '#a78bfa' }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>Potenciado por Inteligencia Artificial</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 3.5rem)', fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24 }}>
            Inventario inteligente
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              para tu restaurante
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)', color: 'rgba(255,255,255,0.4)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Deja que la IA administre tu inventario. Predice consumo, evita faltantes
            y reduce desperdicio con datos en tiempo real.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 56 }}>
            <Link
              to="/login"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-500/25"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 16, fontSize: 16, fontWeight: 600, color: 'white', textDecoration: 'none', transition: 'all 0.2s' }}
            >
              Comenzar gratis
              <ArrowRight style={{ width: 20, height: 20 }} />
            </Link>
            <a
              href="#how-it-works"
              className="glass"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 16, fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Ver cómo funciona
              <ChevronRight style={{ width: 16, height: 16 }} />
            </a>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, maxWidth: 600, margin: '0 auto' }}>
            {[
              { value: '500+', label: 'Restaurantes' },
              { value: '98%', label: 'Precisión IA' },
              { value: '35%', label: 'Menos desperdicio' },
              { value: '24/7', label: 'Monitoreo' },
            ].map((stat) => (
              <div key={stat.label} className="glass" style={{ padding: 16, borderRadius: 16, textAlign: 'center' }}>
                <p style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 700, color: 'white', marginBottom: 2 }}>{stat.value}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DASHBOARD PREVIEW ===== */}
      <section style={{ width: '100%', maxWidth: 800, margin: '0 auto', padding: '0 24px 64px' }}>
        <div className="glass-strong" style={{ borderRadius: 20, padding: 10, boxShadow: '0 25px 50px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ borderRadius: 14, background: 'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(88,28,135,0.3))', padding: 24, minHeight: 280, display: 'flex', flexDirection: 'column' }}>
            {/* Top bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(239,68,68,0.6)' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(245,158,11,0.6)' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(16,185,129,0.6)' }} />
              <span style={{ marginLeft: 12, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>RestaurantAI Dashboard</span>
            </div>
            {/* Mock stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
              {[
                { l: 'Productos', v: '16', c: '#a78bfa' },
                { l: 'Stock Bajo', v: '7', c: '#fbbf24' },
                { l: 'Ventas Hoy', v: '$237', c: '#34d399' },
                { l: 'Precisión IA', v: '91%', c: '#22d3ee' },
              ].map((s) => (
                <div key={s.l} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 10, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: s.c }}>{s.v}</p>
                  <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{s.l}</p>
                </div>
              ))}
            </div>
            {/* Mock chart */}
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '32px 24px 12px' }}>
              {[40, 55, 45, 70, 85, 65, 75].map((h, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div
                    className="bg-gradient-to-t from-purple-600/80 to-cyan-500/60"
                    style={{ width: 28, borderRadius: '6px 6px 0 0', height: `${h * 1.5}px` }}
                  />
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>{['L', 'M', 'X', 'J', 'V', 'S', 'D'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" style={{ width: '100%', maxWidth: 900, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa', marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Funcionalidades</p>
        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 700, color: 'white', marginBottom: 12 }}>Todo lo que necesitas</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', maxWidth: 480, margin: '0 auto 48px' }}>
          Herramientas inteligentes diseñadas para que tu restaurante nunca se quede sin ingredientes.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          {features.map((feature) => (
            <div key={feature.title} className="glass hover:bg-white/[0.08] transition-all duration-300 group" style={{ padding: 24, borderRadius: 16, textAlign: 'center' }}>
              <div className={`bg-gradient-to-br ${feature.color} group-hover:scale-110 transition-transform`} style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <feature.icon style={{ width: 22, height: 22, color: 'white' }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 8 }}>{feature.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" style={{ width: '100%', maxWidth: 700, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#22d3ee', marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Cómo funciona</p>
        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 700, color: 'white', marginBottom: 48 }}>Simple y poderoso</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { step: '01', title: 'Registra tu inventario', desc: 'Agrega los productos de tu restaurante con cantidades, proveedores y umbrales mínimos.' },
            { step: '02', title: 'La IA analiza tus datos', desc: 'Nuestros agentes de IA estudian patrones de consumo, ventas y tendencias semanales.' },
            { step: '03', title: 'Recibe predicciones', desc: 'Obtén alertas antes de que un producto se agote y recomendaciones exactas de compra.' },
            { step: '04', title: 'Optimiza tu negocio', desc: 'Reduce desperdicio, ahorra dinero y nunca pierdas una venta por falta de ingredientes.' },
          ].map((item) => (
            <div key={item.step} className="glass hover:bg-white/[0.08] transition-all group" style={{ padding: 24, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 20, textAlign: 'left' }}>
              <div className="group-hover:border-purple-500/30 transition-colors" style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.2))', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent" style={{ fontSize: 20, fontWeight: 700 }}>{item.step}</span>
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 4 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" style={{ width: '100%', maxWidth: 900, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#f472b6', marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Precios</p>
        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 700, color: 'white', marginBottom: 12 }}>El plan ideal para ti</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', marginBottom: 48 }}>Sin compromisos. Cancela cuando quieras.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, maxWidth: 800, margin: '0 auto' }}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={plan.highlight ? 'glass-strong ring-1 ring-purple-500/20' : 'glass'}
              style={{ borderRadius: 16, padding: 24, textAlign: 'center', transition: 'transform 0.3s', ...(plan.highlight ? { borderColor: 'rgba(124,58,237,0.3)', boxShadow: '0 20px 40px rgba(124,58,237,0.1)' } : {}) }}
            >
              {plan.highlight && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 12, padding: '4px 12px', borderRadius: 9999, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <Star style={{ width: 12, height: 12, color: '#a78bfa', fill: '#a78bfa' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa' }}>MÁS POPULAR</span>
                </div>
              )}
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{plan.name}</h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>{plan.description}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: 'white' }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 auto 24px', maxWidth: 200, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'left' }}>
                    <Check style={{ width: 14, height: 14, color: '#a78bfa', flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/login"
                className={plan.highlight ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/20' : ''}
                style={{ display: 'block', textAlign: 'center', padding: '12px 0', borderRadius: 12, fontSize: 14, fontWeight: 600, color: plan.highlight ? 'white' : 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'all 0.2s', ...(plan.highlight ? {} : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }) }}
              >
                Comenzar
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{ width: '100%', maxWidth: 700, margin: '0 auto', padding: '64px 24px' }}>
        <div className="glass-strong" style={{ borderRadius: 20, padding: 48, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 256, height: 256, background: 'rgba(124,58,237,0.1)', borderRadius: '50%', filter: 'blur(100px)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: 192, height: 192, background: 'rgba(6,182,212,0.1)', borderRadius: '50%', filter: 'blur(80px)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 700, color: 'white', marginBottom: 16 }}>
              Empieza hoy mismo
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
              Únete a cientos de restaurantes que ya optimizan su inventario con inteligencia artificial.
            </p>
            <Link
              to="/login"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-500/25"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 16, fontSize: 16, fontWeight: 600, color: 'white', textDecoration: 'none' }}
            >
              Crear cuenta gratis
              <ArrowRight style={{ width: 20, height: 20 }} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="bg-gradient-to-br from-purple-500 to-cyan-500" style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Utensils style={{ width: 14, height: 14, color: 'white' }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>RestaurantAI</span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
            &copy; 2026 RestaurantAI. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
