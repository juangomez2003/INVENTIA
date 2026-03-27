import { useState } from 'react';
import { Settings as SettingsIcon, Store, Bell, Shield, Save, Check } from 'lucide-react';
import { defaultSettings } from '../data/mockData';
import type { RestaurantSettings } from '../types';

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--surface-hover)',
  border: '1.5px solid transparent',
  borderRadius: 10, padding: '11px 14px',
  fontSize: 14, color: 'var(--text-1)', outline: 'none',
  transition: 'all 0.18s', boxSizing: 'border-box', fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 500,
  color: 'var(--text-2)', marginBottom: 7,
};

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 46, height: 26, borderRadius: 13,
        background: on ? 'var(--accent)' : 'var(--surface-hover)',
        border: 'none', cursor: 'pointer',
        transition: 'background 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative', flexShrink: 0,
        boxShadow: on ? '0 2px 8px var(--accent-glow)' : 'none',
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        background: 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        position: 'absolute', top: 3,
        left: on ? 23 : 3,
        transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }} />
    </button>
  );
}

function SectionHeader({ icon, label, color = 'var(--accent)' }: { icon: React.ReactNode; label: string; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>{label}</h3>
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState<RestaurantSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const focusInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'var(--border-focus)';
    e.target.style.background = 'var(--surface-focus)';
  };
  const blurInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'transparent';
    e.target.style.background = 'var(--surface-hover)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 680 }}>

      {/* Header */}
      <div className="animate-fade-up">
        <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Preferencias
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 10 }}>
          <SettingsIcon style={{ width: 26, height: 26, color: 'var(--accent)', strokeWidth: 1.75 }} />
          Configuración
        </h1>
      </div>

      {/* Restaurant Info */}
      <div className="card animate-fade-up delay-1" style={{ borderRadius: 16, padding: 26 }}>
        <SectionHeader icon={<Store style={{ width: 16, height: 16, color: '#30d158' }} />} label="Información del restaurante" color="#30d158" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>Nombre</label>
            <input
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              style={inputStyle} onFocus={focusInput} onBlur={blurInput}
            />
          </div>
          <div>
            <label style={labelStyle}>Teléfono</label>
            <input
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              style={inputStyle} onFocus={focusInput} onBlur={blurInput}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Dirección</label>
            <input
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              style={inputStyle} onFocus={focusInput} onBlur={blurInput}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Email de contacto</label>
            <input
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              style={inputStyle} onFocus={focusInput} onBlur={blurInput}
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card animate-fade-up delay-2" style={{ borderRadius: 16, padding: 26 }}>
        <SectionHeader icon={<Bell style={{ width: 16, height: 16, color: '#0a84ff' }} />} label="Notificaciones" color="#0a84ff" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            {
              label: 'Alertas por WhatsApp',
              desc: 'Recibe alertas de stock bajo por WhatsApp',
              key: 'notifyWhatsApp' as const,
            },
            {
              label: 'Alertas por Email',
              desc: 'Recibe reportes diarios por correo',
              key: 'notifyEmail' as const,
            },
          ].map(({ label, desc, key }, i, arr) => (
            <div key={key}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
                <div>
                  <p style={{ fontSize: 14, color: 'var(--text-1)', fontWeight: 500 }}>{label}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>{desc}</p>
                </div>
                <Toggle
                  on={settings[key]}
                  onToggle={() => setSettings({ ...settings, [key]: !settings[key] })}
                />
              </div>
              {i < arr.length - 1 && <div style={{ height: 1, background: 'var(--border-subtle)' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* AI Settings */}
      <div className="card animate-fade-up delay-3" style={{ borderRadius: 16, padding: 26 }}>
        <SectionHeader icon={<Shield style={{ width: 16, height: 16, color: '#5856d6' }} />} label="Configuración IA" color="#5856d6" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ paddingBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <label style={{ fontSize: 14, color: 'var(--text-1)', fontWeight: 500 }}>Umbral de alerta</label>
              <span style={{
                fontSize: 13, fontWeight: 700, color: 'var(--accent)',
                background: 'var(--nav-active-bg)',
                padding: '2px 10px', borderRadius: 20,
              }}>
                {settings.alertThreshold}%
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>Porcentaje del stock mínimo para disparar alertas</p>
            <input
              type="range" min="10" max="50"
              value={settings.alertThreshold}
              onChange={(e) => setSettings({ ...settings, alertThreshold: parseInt(e.target.value) })}
              style={{ width: '100%', height: 4, borderRadius: 2, cursor: 'pointer', accentColor: 'var(--accent)' }}
            />
          </div>

          <div style={{ height: 1, background: 'var(--border-subtle)' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
            <div>
              <p style={{ fontSize: 14, color: 'var(--text-1)', fontWeight: 500 }}>Reposición automática</p>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>La IA genera órdenes automáticas cuando el stock está bajo</p>
            </div>
            <Toggle
              on={settings.autoRestock}
              onToggle={() => setSettings({ ...settings, autoRestock: !settings.autoRestock })}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="animate-fade-up delay-4">
        <button
          onClick={handleSave}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '13px 24px', borderRadius: 10,
            fontSize: 14, fontWeight: 600, color: 'white',
            background: saved ? '#30d158' : 'var(--accent-gradient)',
            border: 'none', cursor: 'pointer',
            boxShadow: `0 4px 14px ${saved ? 'rgba(48,209,88,0.35)' : 'var(--accent-glow)'}`,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            fontFamily: 'inherit',
          }}
        >
          {saved ? (
            <><Check style={{ width: 16, height: 16 }} /> Cambios guardados</>
          ) : (
            <><Save style={{ width: 16, height: 16 }} /> Guardar cambios</>
          )}
        </button>
      </div>
    </div>
  );
}
