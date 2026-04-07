import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useTheme } from '../context/ThemeContext';
import { Eye, EyeOff, ArrowRight, Sun, Moon, ChevronLeft, LayoutDashboard, Brain, Bell } from 'lucide-react';
import Logo from '../components/Logo';

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--surface-hover)',
  border: '1.5px solid transparent',
  borderRadius: 12,
  padding: '13px 16px',
  fontSize: 15,
  color: 'var(--text-1)',
  outline: 'none',
  transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [remember, setRemember] = useState(false);
  const { login }      = useAuth();
  const { adminLogin } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const adminOk = await adminLogin(email, password);
    if (adminOk) { navigate('/admin/dashboard'); setLoading(false); return; }

    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Credenciales incorrectas. Revisa los datos de prueba abajo.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-base)', transition: 'background 0.3s ease' }}>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed', top: 20, right: 20, zIndex: 100,
          width: 38, height: 38, borderRadius: '50%',
          background: 'var(--toggle-bg)',
          border: '1px solid var(--toggle-border)',
          color: 'var(--toggle-icon)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* ── LEFT — Form ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '40px 32px',
        minWidth: 0,
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Back to landing */}
          <Link
            to="/landing"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 13, color: 'var(--text-2)', textDecoration: 'none',
              marginBottom: 28,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}
          >
            <ChevronLeft size={15} />
            Volver al inicio
          </Link>

          {/* Logo */}
          <div style={{ marginBottom: 40 }}>
            <Logo size={36} />
          </div>

          {/* Heading */}
          <h1 style={{ fontSize: 30, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', marginBottom: 8 }}>
            Inicia sesión
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 32, lineHeight: 1.5 }}>
            Accede a tu panel de inventario inteligente.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 8 }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@inventia.com"
                required
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.background = 'var(--surface-focus)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'var(--surface-hover)'; }}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)' }}>Contraseña</label>
                <button type="button" style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--link)', cursor: 'pointer', fontFamily: 'inherit' }}>
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ ...inputStyle, paddingRight: 46 }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.background = 'var(--surface-focus)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'var(--surface-hover)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                    color: 'var(--text-3)', display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff style={{ width: 17, height: 17 }} /> : <Eye style={{ width: 17, height: 17 }} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label
              onClick={() => setRemember(!remember)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: 5,
                border: `1.5px solid ${remember ? 'var(--checkbox-on)' : 'var(--checkbox-off)'}`,
                background: remember ? 'var(--checkbox-on)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.18s', flexShrink: 0,
              }}>
                {remember && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Recordarme</span>
            </label>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)',
                borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#ff453a', lineHeight: 1.4,
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 12,
                fontSize: 15, fontWeight: 600, color: 'white',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.65 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'var(--accent-gradient)',
                boxShadow: '0 4px 16px var(--accent-glow)',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
                marginTop: 4,
              }}
            >
              {loading ? (
                <div style={{
                  width: 18, height: 18,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }} />
              ) : (
                <>Iniciar sesión <ArrowRight style={{ width: 17, height: 17 }} /></>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--divider)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Demo
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--divider)' }} />
            </div>
            <div style={{
              background: 'var(--demo-bg)', border: '1px solid var(--demo-border)',
              borderRadius: 10, padding: '12px 14px',
            }}>
              <p style={{ fontSize: 11, color: 'var(--demo-label)', marginBottom: 6, fontWeight: 500 }}>
                Credenciales de prueba
              </p>
              <p style={{ fontSize: 13, color: 'var(--demo-value)', fontFamily: 'ui-monospace, monospace' }}>
                admin@restaurant.com <span style={{ color: 'var(--text-3)', margin: '0 4px' }}>·</span> demo123
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT — Visual panel ── */}
      <div
        className="hidden lg:flex"
        style={{
          flex: '0 0 45%',
          position: 'relative',
          overflow: 'hidden',
          margin: '12px 12px 12px 0',
          borderRadius: 20,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--rp-bg)',
          transition: 'background 0.3s ease',
        }}
      >
        {/* Subtle dot grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle, var(--rp-glow-1) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          opacity: 0.6,
        }} />

        {/* Center content */}
        <div style={{
          position: 'relative', zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: 48, textAlign: 'center', gap: 0,
        }}>
          {/* Logo */}
          <Logo size={56} hideText />

          <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--rp-text-1)', marginBottom: 14, letterSpacing: '-0.03em' }}>
            INVENTIA
          </h2>
          <p style={{ fontSize: 15, color: 'var(--rp-text-2)', maxWidth: 280, lineHeight: 1.6, marginBottom: 40 }}>
            Gestiona tu inventario con inteligencia artificial y mantén tu restaurante siempre abastecido.
          </p>

          {/* Feature pills */}
          {[
            { icon: <LayoutDashboard size={15} />, text: 'Dashboard en tiempo real' },
            { icon: <Brain size={15} />, text: 'Predicciones con IA' },
            { icon: <Bell size={15} />, text: 'Alertas automáticas' },
          ].map(({ icon, text }) => (
            <div
              key={text}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 18px', borderRadius: 12, marginBottom: 8,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: 13, color: 'var(--rp-text-1)',
                width: '100%', maxWidth: 260,
              }}
            >
              <span style={{ opacity: 0.75, display: 'flex' }}>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
