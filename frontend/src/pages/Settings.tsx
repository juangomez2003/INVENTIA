import { useState } from 'react';
import { Settings as SettingsIcon, Store, Bell, Shield, Save, Check } from 'lucide-react';
import { defaultSettings } from '../data/mockData';
import type { RestaurantSettings } from '../types';

export default function Settings() {
  const [settings, setSettings] = useState<RestaurantSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <SettingsIcon className="w-7 h-7 text-purple-400" />
          Configuración
        </h1>
        <p className="text-sm text-white/40 mt-0.5">Administra las preferencias del restaurante</p>
      </div>

      {/* Restaurant Info */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Store className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-semibold text-white">Información del Restaurante</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Nombre</label>
            <input
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Teléfono</label>
            <input
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-white/50 mb-1.5">Dirección</label>
            <input
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-white/50 mb-1.5">Email de contacto</label>
            <input
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-semibold text-white">Notificaciones</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Alertas por WhatsApp</p>
              <p className="text-xs text-white/30">Recibe alertas de stock bajo por WhatsApp</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, notifyWhatsApp: !settings.notifyWhatsApp })}
              className={`w-11 h-6 rounded-full transition-all duration-200 ${
                settings.notifyWhatsApp ? 'bg-purple-500' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ml-1 ${
                settings.notifyWhatsApp ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
          <div className="border-t border-white/5" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Alertas por Email</p>
              <p className="text-xs text-white/30">Recibe reportes diarios por correo</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, notifyEmail: !settings.notifyEmail })}
              className={`w-11 h-6 rounded-full transition-all duration-200 ${
                settings.notifyEmail ? 'bg-purple-500' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ml-1 ${
                settings.notifyEmail ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* AI Settings */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-semibold text-white">Configuración IA</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              Umbral de alerta (% del mínimo)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="50"
                value={settings.alertThreshold}
                onChange={(e) => setSettings({ ...settings, alertThreshold: parseInt(e.target.value) })}
                className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
              />
              <span className="text-sm text-white/70 w-10 text-right">{settings.alertThreshold}%</span>
            </div>
          </div>
          <div className="border-t border-white/5" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Reposición automática</p>
              <p className="text-xs text-white/30">La IA genera órdenes automáticas cuando el stock está bajo</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, autoRestock: !settings.autoRestock })}
              className={`w-11 h-6 rounded-full transition-all duration-200 ${
                settings.autoRestock ? 'bg-emerald-500' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ml-1 ${
                settings.autoRestock ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg ${
          saved
            ? 'bg-emerald-600 text-white shadow-emerald-500/20'
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/20'
        }`}
      >
        {saved ? (
          <>
            <Check className="w-4 h-4" />
            Guardado
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Guardar Cambios
          </>
        )}
      </button>
    </div>
  );
}
