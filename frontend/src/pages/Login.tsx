import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, Eye, EyeOff, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const success = login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Credenciales incorrectas. Usa las credenciales de prueba que aparecen abajo.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0a0e1a' }}>

      {/* ===== LEFT PANEL — Form ===== */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 40px',
        maxWidth: 540,
        minWidth: 0,
      }}>
        {/* Back link */}
        <Link
          to="/landing"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.35)', fontSize: 13, textDecoration: 'none', marginBottom: 48, transition: 'color 0.2s' }}
          className="hover:text-white/60"
        >
          <ArrowLeft style={{ width: 16, height: 16 }} />
          Volver al inicio
        </Link>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <div className="bg-gradient-to-br from-purple-500 to-cyan-500" style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(124,58,237,0.3)' }}>
            <Utensils style={{ width: 22, height: 22, color: 'white' }} />
          </div>
          <div>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>RestaurantAI</span>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>Inventario Inteligente</p>
          </div>
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 700, color: 'white', lineHeight: 1.15, marginBottom: 10 }}>
          Inicia sesión
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 36, lineHeight: 1.6 }}>
          Ingresa tus credenciales para acceder al panel de control.
          <br />
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>¿No tienes cuenta? </span>
          <Link to="/landing" style={{ color: '#a78bfa', textDecoration: 'none' }}>Regístrate aquí</Link>
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@restaurant.com"
              required
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '14px 16px',
                fontSize: 14,
                color: 'white',
                outline: 'none',
                transition: 'border-color 0.2s, background 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; e.target.style.background = 'rgba(255,255,255,0.07)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: '14px 48px 14px 16px',
                  fontSize: 14,
                  color: 'white',
                  outline: 'none',
                  transition: 'border-color 0.2s, background 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; e.target.style.background = 'rgba(255,255,255,0.07)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(255,255,255,0.25)' }}
              >
                {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <label
              onClick={() => setRemember(!remember)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{
                width: 16, height: 16, borderRadius: 4,
                border: remember ? '1.5px solid #8b5cf6' : '1.5px solid rgba(255,255,255,0.15)',
                background: remember ? '#8b5cf6' : 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                {remember && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Recordarme</span>
            </label>
            <button type="button" style={{ background: 'none', border: 'none', fontSize: 12, color: '#a78bfa', cursor: 'pointer', opacity: 0.7 }}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#f87171', textAlign: 'center', marginBottom: 20 }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-500/25 hover:shadow-purple-500/35"
            style={{
              width: '100%',
              padding: '15px 0',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              color: 'white',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s',
            }}
          >
            {loading ? (
              <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <>
                Iniciar sesión
                <ArrowRight style={{ width: 18, height: 18 }} />
              </>
            )}
          </button>
        </form>

        {/* Demo credentials */}
        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles style={{ width: 12, height: 12, color: 'rgba(167,139,250,0.5)' }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Prueba la demo</span>
            </div>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>Credenciales de prueba</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace' }}>
              admin@restaurant.com <span style={{ color: 'rgba(255,255,255,0.15)', margin: '0 6px' }}>|</span> demo123
            </p>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL — Abstract Art ===== */}
      <div
        className="hidden lg:block"
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          margin: 16,
          borderRadius: 24,
          minHeight: 'calc(100vh - 32px)',
        }}
      >
        {/* Base gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #1a0533 0%, #0f1b3d 30%, #0d2847 50%, #1a0a3e 70%, #0e0f2e 100%)',
        }} />

        {/* Fluid wave shapes */}
        <div style={{
          position: 'absolute', top: '10%', left: '-20%', width: '140%', height: '80%',
          background: 'radial-gradient(ellipse at 30% 50%, rgba(124,58,237,0.35) 0%, transparent 60%)',
          filter: 'blur(40px)',
          transform: 'rotate(-15deg)',
        }} />
        <div style={{
          position: 'absolute', top: '5%', right: '-10%', width: '80%', height: '90%',
          background: 'radial-gradient(ellipse at 70% 40%, rgba(6,182,212,0.3) 0%, transparent 55%)',
          filter: 'blur(50px)',
          transform: 'rotate(10deg)',
        }} />
        <div style={{
          position: 'absolute', bottom: '0%', left: '10%', width: '90%', height: '60%',
          background: 'radial-gradient(ellipse at 50% 80%, rgba(236,72,153,0.25) 0%, transparent 50%)',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', top: '30%', left: '20%', width: '60%', height: '40%',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.3) 0%, transparent 50%)',
          filter: 'blur(30px)',
          transform: 'rotate(-5deg)',
        }} />

        {/* Curvy wave SVG overlay */}
        <svg
          viewBox="0 0 500 800"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.6 }}
        >
          <defs>
            <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="wave2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="wave3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path d="M0,200 C80,150 150,300 250,280 C350,260 400,100 500,180 L500,800 L0,800 Z" fill="url(#wave1)" />
          <path d="M0,350 C100,300 180,450 280,400 C380,350 430,250 500,320 L500,800 L0,800 Z" fill="url(#wave2)" />
          <path d="M0,500 C120,450 200,550 300,520 C400,490 450,420 500,480 L500,800 L0,800 Z" fill="url(#wave3)" />
        </svg>

        {/* Bright accent circles */}
        <div style={{
          position: 'absolute', top: '20%', left: '30%', width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(124,58,237,0.5) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(30px)',
        }} />
        <div style={{
          position: 'absolute', top: '50%', right: '20%', width: 150, height: 150,
          background: 'radial-gradient(circle, rgba(6,182,212,0.5) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(25px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '25%', left: '25%', width: 180, height: 180,
          background: 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(35px)',
        }} />

        {/* Subtle grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Center branding on art panel */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 10, padding: 40, textAlign: 'center',
        }}>
          <div className="bg-gradient-to-br from-purple-500 to-cyan-500" style={{
            width: 64, height: 64, borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24, boxShadow: '0 12px 40px rgba(124,58,237,0.4)',
          }}>
            <Utensils style={{ width: 32, height: 32, color: 'white' }} />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 12, textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
            RestaurantAI
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', maxWidth: 280, lineHeight: 1.6, textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}>
            Administra tu inventario con inteligencia artificial y optimiza cada recurso de tu restaurante.
          </p>
        </div>
      </div>
    </div>
  );
}
