import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Store, Bell, Shield, Save, Check, Loader, Users, Plus, Trash2, Copy, RefreshCw, Lock } from 'lucide-react';
import { defaultSettings } from '../utils/stockUtils';
import { api } from '../services/api';
import type { RestaurantSettings } from '../types';
import { generateInviteCode, listInvites, deleteInvite, listStaff, removeStaff } from '../services/staffService';

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

const ROLE_LABELS: Record<string, string> = {
  mesero: 'Mesero', chef: 'Chef / Cocina', cajero: 'Cajero', inventario: 'Inventario',
}
const ROLE_COLORS: Record<string, string> = {
  mesero: '#0a84ff', chef: '#ff9f0a', cajero: '#30d158', inventario: '#5e5ce6',
}

function StaffSection({ plan }: { plan: string }) {
  const isPaid = ['pro', 'premium', 'enterprise'].includes(plan)
  const [invites, setInvites] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [role, setRole] = useState('mesero')
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState('')
  const [loading, setLoading] = useState(true)

  const reload = async () => {
    try {
      const [inv, stf] = await Promise.all([listInvites(), listStaff()])
      setInvites(inv)
      setStaff(stf)
    } catch { /* plan free */ }
    finally { setLoading(false) }
  }

  useEffect(() => { if (isPaid) { reload() } else { setLoading(false) } }, [isPaid])

  async function handleGenerate() {
    setGenerating(true)
    try {
      await generateInviteCode(role)
      await reload()
    } catch (e: any) { alert(e.message) }
    finally { setGenerating(false) }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(''), 2000)
  }

  async function handleRemoveStaff(id: string) {
    if (!confirm('¿Desactivar este empleado?')) return
    await removeStaff(id)
    reload()
  }

  async function handleDeleteInvite(id: string) {
    await deleteInvite(id)
    reload()
  }

  if (!isPaid) return (
    <div style={{ textAlign: 'center', padding: '28px 20px', background: 'var(--surface-hover)', borderRadius: 12 }}>
      <Lock size={28} color="var(--text-3)" style={{ marginBottom: 10 }} />
      <p style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 500, marginBottom: 6 }}>Función de plan de pago</p>
      <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Actualiza a Pro o Enterprise para gestionar personal con roles</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Generate code */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <select
          value={role} onChange={e => setRole(e.target.value)}
          style={{ flex: 1, minWidth: 140, padding: '10px 12px', background: 'var(--surface-hover)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-1)', fontSize: 13 }}
        >
          {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button
          onClick={handleGenerate} disabled={generating}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#000', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
        >
          <Plus size={15} /> {generating ? 'Generando...' : 'Generar código'}
        </button>
        <button onClick={reload} style={{ padding: '10px 12px', background: 'var(--surface-hover)', border: 'none', borderRadius: 8, color: 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Invite codes */}
      {invites.length > 0 && (
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Códigos generados</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {invites.map((inv: any) => (
              <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-hover)', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <code style={{ fontSize: 15, fontWeight: 700, letterSpacing: 3, color: inv.used_by ? 'var(--text-3)' : 'var(--accent)' }}>{inv.code}</code>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${ROLE_COLORS[inv.role]}22`, color: ROLE_COLORS[inv.role], fontWeight: 600 }}>
                    {ROLE_LABELS[inv.role]}
                  </span>
                  {inv.used_by && <span style={{ fontSize: 11, color: '#30d158' }}>✓ Usado</span>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {!inv.used_by && (
                    <button onClick={() => copyCode(inv.code)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === inv.code ? '#30d158' : 'var(--text-3)', padding: 6, borderRadius: 6 }}>
                      {copied === inv.code ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  )}
                  <button onClick={() => handleDeleteInvite(inv.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 6, borderRadius: 6 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staff list */}
      {staff.length > 0 && (
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Personal activo ({staff.length})</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {staff.map((s: any) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-hover)', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${ROLE_COLORS[s.role]}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ROLE_COLORS[s.role], fontWeight: 700, fontSize: 13 }}>
                    {(s.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{s.name || 'Sin nombre'}</p>
                    <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 20, background: `${ROLE_COLORS[s.role]}22`, color: ROLE_COLORS[s.role] }}>
                      {ROLE_LABELS[s.role] || s.role}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleRemoveStaff(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 6, borderRadius: 6 }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Cargando...</p>}
      {!loading && staff.length === 0 && invites.length === 0 && (
        <p style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center' }}>No hay personal ni códigos. Genera un código para invitar a tu equipo.</p>
      )}
    </div>
  )
}

export default function Settings() {
  const [settings, setSettings] = useState<RestaurantSettings>(defaultSettings);
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [restaurantPlan, setRestaurantPlan] = useState('free');

  useEffect(() => {
    api.get<any>('/settings/').then(data => {
      setSettings({
        name:          data.name          ?? defaultSettings.name,
        address:       data.address       ?? defaultSettings.address,
        phone:         data.phone         ?? defaultSettings.phone,
        email:         data.email         ?? defaultSettings.email,
        alertThreshold: data.alert_threshold ?? defaultSettings.alertThreshold,
        notifyWhatsApp: data.notify_whatsapp ?? defaultSettings.notifyWhatsApp,
        notifyEmail:    data.notify_email   ?? defaultSettings.notifyEmail,
        autoRestock:    data.auto_restock   ?? defaultSettings.autoRestock,
      });
      setRestaurantPlan(data.plan || 'free');
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings/', {
        name:             settings.name,
        address:          settings.address,
        phone:            settings.phone,
        email:            settings.email,
        alert_threshold:  settings.alertThreshold,
        notify_whatsapp:  settings.notifyWhatsApp,
        notify_email:     settings.notifyEmail,
        auto_restock:     settings.autoRestock,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Error saving settings:', e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 10, color: 'var(--text-3)', fontSize: 14 }}>
      <Loader style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />
      Cargando configuración...
    </div>
  );

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

      {/* Staff Management */}
      <div className="card animate-fade-up delay-3" style={{ borderRadius: 16, padding: 26 }}>
        <SectionHeader icon={<Users style={{ width: 16, height: 16, color: '#0a84ff' }} />} label="Gestión de Personal" color="#0a84ff" />
        <StaffSection plan={restaurantPlan} />
      </div>

      {/* Save Button */}
      <div className="animate-fade-up delay-4">
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '13px 24px', borderRadius: 10,
            fontSize: 14, fontWeight: 600, color: 'white',
            background: saved ? '#30d158' : 'var(--accent-gradient)',
            border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            boxShadow: `0 4px 14px ${saved ? 'rgba(48,209,88,0.35)' : 'var(--accent-glow)'}`,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            fontFamily: 'inherit',
          }}
        >
          {saving ? (
            <><Loader style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Guardando...</>
          ) : saved ? (
            <><Check style={{ width: 16, height: 16 }} /> Cambios guardados</>
          ) : (
            <><Save style={{ width: 16, height: 16 }} /> Guardar cambios</>
          )}
        </button>
      </div>
    </div>
  );
}
