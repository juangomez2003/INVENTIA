import { useState, useEffect } from 'react';
import { Package, Plus, Download, X, Loader } from 'lucide-react';
import InventoryTable from '../components/InventoryTable';
import { getStockStatus } from '../utils/stockUtils';
import { inventoryService } from '../services/inventoryService';
import type { Product } from '../types';

const CATEGORIES = ['Carnes', 'Verduras', 'Frutas', 'Granos', 'Lácteos', 'Mariscos', 'Aceites', 'Bebidas', 'Otros'];

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
  color: 'var(--text-2)', marginBottom: 6,
};
const statColors: Record<string, string> = {
  total: 'var(--text-1)', critical: '#ff453a', low: '#ff9f0a', normal: '#30d158', full: '#0a84ff',
};
const statLabels: Record<string, string> = { total: 'Total', critical: 'Crítico', low: 'Bajo', normal: 'Normal', full: 'Lleno' };

const emptyForm = {
  name: '', category: 'Carnes', quantity: '', unit: 'kg',
  pricePerUnit: '', minThreshold: '', maxCapacity: '', supplier: '',
};

export default function Inventory() {
  const [products, setProducts]       = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [searchTerm, setSearchTerm]   = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm]               = useState(emptyForm);
  const [error, setError]             = useState('');

  async function loadProducts() {
    try {
      const data = await inventoryService.getProducts();
      setProducts(data);
    } catch (e) {
      console.error('Error loading products:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProducts(); }, []);

  const stats = {
    total:    products.length,
    critical: products.filter(p => getStockStatus(p) === 'critical').length,
    low:      products.filter(p => getStockStatus(p) === 'low').length,
    normal:   products.filter(p => getStockStatus(p) === 'normal').length,
    full:     products.filter(p => getStockStatus(p) === 'full').length,
  };

  const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--border-focus)';
    e.target.style.background = 'var(--surface-focus)';
  };
  const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'transparent';
    e.target.style.background = 'var(--surface-hover)';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) { setError('El nombre es requerido'); return; }
    if (!form.quantity || Number(form.quantity) < 0) { setError('La cantidad debe ser mayor o igual a 0'); return; }
    if (!form.minThreshold || !form.maxCapacity) { setError('El mínimo y capacidad máx. son requeridos'); return; }

    setSaving(true);
    try {
      await inventoryService.createProduct({
        name:          form.name.trim(),
        category:      form.category,
        quantity:      Number(form.quantity),
        unit:          form.unit.trim() || 'kg',
        pricePerUnit:  Number(form.pricePerUnit) || 0,
        minThreshold:  Number(form.minThreshold),
        maxCapacity:   Number(form.maxCapacity),
        supplier:      form.supplier.trim(),
      });
      setForm(emptyForm);
      setShowAddModal(false);
      await loadProducts();
    } catch (e: any) {
      setError(e.message || 'Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => { setShowAddModal(false); setForm(emptyForm); setError(''); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Gestión de stock
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Package style={{ width: 26, height: 26, color: 'var(--accent)', strokeWidth: 1.75 }} />
            Inventario
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 16px', borderRadius: 10,
            fontSize: 13, fontWeight: 500, color: 'var(--text-2)',
            background: 'var(--surface)', boxShadow: 'var(--card-shadow)',
            border: 'none', cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'inherit',
          }}>
            <Download style={{ width: 15, height: 15, strokeWidth: 1.75 }} />
            Exportar
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 16px', borderRadius: 10,
              fontSize: 13, fontWeight: 600, color: 'white',
              background: 'var(--accent-gradient)', border: 'none',
              cursor: 'pointer', transition: 'all 0.18s',
              boxShadow: '0 4px 12px var(--accent-glow)', fontFamily: 'inherit',
            }}
          >
            <Plus style={{ width: 15, height: 15, strokeWidth: 2.5 }} />
            Agregar producto
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="animate-fade-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 10 }}>
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="card" style={{ padding: '16px 14px', textAlign: 'center', borderRadius: 12 }}>
            <p style={{ fontSize: 26, fontWeight: 700, color: statColors[key], letterSpacing: '-0.02em' }}>
              {loading ? '—' : value}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3, fontWeight: 500 }}>{statLabels[key]}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="animate-fade-up delay-2">
        {loading ? (
          <div className="card" style={{ borderRadius: 16, padding: '48px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text-3)', fontSize: 14 }}>
            <Loader style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />
            Cargando inventario...
          </div>
        ) : (
          <InventoryTable
            products={products}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
          />
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={handleClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }} />
          <div className="glass-strong animate-scale-in" style={{ position: 'relative', borderRadius: 20, padding: 28, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>Agregar producto</h3>
              <button onClick={handleClose} style={{ color: 'var(--text-3)', background: 'var(--surface-hover)', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex' }}>
                <X style={{ width: 17, height: 17 }} />
              </button>
            </div>

            <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Nombre *</label>
                  <input
                    style={inputStyle} placeholder="Ej: Pollo"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    onFocus={focusInput} onBlur={blurInput}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Categoría *</label>
                  <select
                    style={{ ...inputStyle, appearance: 'none' }}
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    onFocus={focusInput} onBlur={blurInput}
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Cantidad *</label>
                  <input
                    type="number" min="0" step="0.001"
                    style={inputStyle} placeholder="0"
                    value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                    onFocus={focusInput} onBlur={blurInput}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Unidad *</label>
                  <input
                    style={inputStyle} placeholder="kg, L, pz"
                    value={form.unit}
                    onChange={e => setForm({ ...form, unit: e.target.value })}
                    onFocus={focusInput} onBlur={blurInput}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Precio/U</label>
                  <input
                    type="number" min="0" step="0.01"
                    style={inputStyle} placeholder="0.00"
                    value={form.pricePerUnit}
                    onChange={e => setForm({ ...form, pricePerUnit: e.target.value })}
                    onFocus={focusInput} onBlur={blurInput}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Stock mínimo *</label>
                  <input
                    type="number" min="0" step="0.001"
                    style={inputStyle} placeholder="Umbral mínimo"
                    value={form.minThreshold}
                    onChange={e => setForm({ ...form, minThreshold: e.target.value })}
                    onFocus={focusInput} onBlur={blurInput}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Capacidad máx. *</label>
                  <input
                    type="number" min="0" step="0.001"
                    style={inputStyle} placeholder="Capacidad máxima"
                    value={form.maxCapacity}
                    onChange={e => setForm({ ...form, maxCapacity: e.target.value })}
                    onFocus={focusInput} onBlur={blurInput}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Proveedor</label>
                <input
                  style={inputStyle} placeholder="Nombre del proveedor"
                  value={form.supplier}
                  onChange={e => setForm({ ...form, supplier: e.target.value })}
                  onFocus={focusInput} onBlur={blurInput}
                />
              </div>

              {error && (
                <div style={{ background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ff453a' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="button" onClick={handleClose} style={{
                  flex: 1, padding: '12px 0', borderRadius: 10,
                  fontSize: 14, fontWeight: 500, color: 'var(--text-2)',
                  background: 'var(--surface-hover)', border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving} style={{
                  flex: 1, padding: '12px 0', borderRadius: 10,
                  fontSize: 14, fontWeight: 600, color: 'white',
                  background: 'var(--accent-gradient)', border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  boxShadow: '0 4px 12px var(--accent-glow)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontFamily: 'inherit',
                }}>
                  {saving ? <><Loader style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> Guardando...</> : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
