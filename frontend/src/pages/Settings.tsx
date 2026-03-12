import { useState } from 'react';
import { Settings as SettingsIcon, Store, Bell, Shield, Save, Check } from 'lucide-react';
import { defaultSettings } from '../data/mockData';
import type { RestaurantSettings } from '../types';

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12, padding: '10px 16px',
  fontSize: 13, color: 'white', outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 500,
  color: 'rgba(255,255,255,0.5)', marginBottom: 6,
};

function Toggle({ on, onToggle, color = '#a855f7' }: { on: boolean; onToggle: () => void; color?: string }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: on ? color : 'rgba(255,255,255,0.1)',
        border: 'none', cursor: 'pointer',
        transition: 'background 0.2s',
        position: 'relative', flexShrink: 0,
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: '50%',
        background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        position: 'absolute', top: 4,
        left: on ? 24 : 4,
        transition: 'left 0.2s',
      }} />
    </button>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState<RestaurantSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 700 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 12, letterSpacing: '-0.02em' }}>
          <SettingsIcon style={{ width: 28, height: 28, color: '#c084fc' }} />
          Configuración
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Administra las preferencias del restaurante</p>
      </div>

      {/* Restaurant Info */}
      <div className="glass" style={{ borderRadius: 16, padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Store style={{ width: 20, height: 20, color: '#c084fc' }} />
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>Información del restaurante</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Nombre</label>
            <input
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
          </div>
          <div>
            <label style={labelStyle}>Teléfono</label>
            <input
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Dirección</label>
            <input
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Email de contacto</label>
            <input
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass" style={{ borderRadius: 16, padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Bell style={{ width: 20, height: 20, color: '#22d3ee' }} />
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>Notificaciones</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Alertas por WhatsApp</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Recibe alertas de stock bajo por WhatsApp</p>
            </div>
            <Toggle on={settings.notifyWhatsApp} onToggle={() => setSettings({ ...settings, notifyWhatsApp: !settings.notifyWhatsApp })} />
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Alertas por Email</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Recibe reportes diarios por correo</p>
            </div>
            <Toggle on={settings.notifyEmail} onToggle={() => setSettings({ ...settings, notifyEmail: !settings.notifyEmail })} />
          </div>
        </div>
      </div>

      {/* AI Settings */}
      <div className="glass" style={{ borderRadius: 16, padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Shield style={{ width: 20, height: 20, color: '#34d399' }} />
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>Configuración IA</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Umbral de alerta (% del mínimo)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="range" min="10" max="50"
                value={settings.alertThreshold}
                onChange={(e) => setSettings({ ...settings, alertThreshold: parseInt(e.target.value) })}
                style={{
                  flex: 1, height: 6,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 3,
                  cursor: 'pointer',
                  accentColor: '#a855f7',
                }}
              />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', width: 40, textAlign: 'right' }}>{settings.alertThreshold}%</span>
            </div>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Reposición automática</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>La IA genera órdenes automáticas cuando el stock está bajo</p>
            </div>
            <Toggle on={settings.autoRestock} onToggle={() => setSettings({ ...settings, autoRestock: !settings.autoRestock })} color="#10b981" />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 24px', borderRadius: 12,
          fontSize: 13, fontWeight: 500, color: 'white',
          background: saved ? '#059669' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          border: 'none', cursor: 'pointer',
          boxShadow: saved ? '0 4px 15px rgba(16,185,129,0.3)' : '0 4px 15px rgba(124,58,237,0.3)',
          transition: 'all 0.2s',
          alignSelf: 'flex-start',
        }}
      >
        {saved ? (
          <>
            <Check style={{ width: 16, height: 16 }} />
            Guardado
          </>
        ) : (
          <>
            <Save style={{ width: 16, height: 16 }} />
            Guardar cambios
          </>
        )}
      </button>
    </div>
  );
}
