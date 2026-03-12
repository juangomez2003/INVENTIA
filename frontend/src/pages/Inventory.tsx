import { useState } from 'react';
import { Package, Plus, Download, X } from 'lucide-react';
import InventoryTable from '../components/InventoryTable';
import { products as initialProducts, getStockStatus } from '../data/mockData';
import type { Product } from '../types';

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12, padding: '10px 14px',
  fontSize: 13, color: 'white', outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 500,
  color: 'rgba(255,255,255,0.5)', marginBottom: 6,
};

const statColors: Record<string, string> = {
  total: 'rgba(255,255,255,0.7)', critical: '#f87171', low: '#fbbf24', normal: '#34d399', full: '#22d3ee',
};

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [productsList] = useState<Product[]>(initialProducts);

  const stats = {
    total: productsList.length,
    critical: productsList.filter(p => getStockStatus(p) === 'critical').length,
    low: productsList.filter(p => getStockStatus(p) === 'low').length,
    normal: productsList.filter(p => getStockStatus(p) === 'normal').length,
    full: productsList.filter(p => getStockStatus(p) === 'full').length,
  };

  const statLabels: Record<string, string> = { total: 'Total', critical: 'Crítico', low: 'Bajo', normal: 'Normal', full: 'Lleno' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 12, letterSpacing: '-0.02em' }}>
            <Package style={{ width: 28, height: 28, color: '#c084fc' }} />
            Inventario
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Gestiona todos los productos del restaurante</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="glass" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 12,
            fontSize: 13, color: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(255,255,255,0.06)',
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
            <Download style={{ width: 16, height: 16 }} />
            Exportar
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', borderRadius: 12,
              fontSize: 13, fontWeight: 500,
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: 'white', border: 'none',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(124,58,237,0.3)',
            }}
          >
            <Plus style={{ width: 16, height: 16 }} />
            Agregar producto
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12 }}>
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="glass" style={{ padding: 14, borderRadius: 12, textAlign: 'center' }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: statColors[key] }}>{value}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{statLabels[key]}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <InventoryTable
        products={productsList}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />

      {/* Add Product Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div
            onClick={() => setShowAddModal(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          />
          <div className="glass-strong" style={{
            position: 'relative', borderRadius: 20, padding: 28,
            width: '100%', maxWidth: 500, boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'white' }}>Agregar producto</h3>
              <button onClick={() => setShowAddModal(false)} style={{
                color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              }}>
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Nombre</label>
                  <input style={inputStyle} placeholder="Ej: Pollo" onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
                </div>
                <div>
                  <label style={labelStyle}>Categoría</label>
                  <select style={{ ...inputStyle, appearance: 'none' as const }}>
                    <option value="Carnes">Carnes</option>
                    <option value="Verduras">Verduras</option>
                    <option value="Frutas">Frutas</option>
                    <option value="Granos">Granos</option>
                    <option value="Lácteos">Lácteos</option>
                    <option value="Mariscos">Mariscos</option>
                    <option value="Aceites">Aceites</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Cantidad</label>
                  <input type="number" style={inputStyle} placeholder="0" onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
                </div>
                <div>
                  <label style={labelStyle}>Unidad</label>
                  <input style={inputStyle} placeholder="kg, L, pz" onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
                </div>
                <div>
                  <label style={labelStyle}>Precio/U</label>
                  <input type="number" step="0.01" style={inputStyle} placeholder="0.00" onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Mínimo</label>
                  <input type="number" style={inputStyle} placeholder="Umbral mínimo" onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
                </div>
                <div>
                  <label style={labelStyle}>Capacidad máx.</label>
                  <input type="number" style={inputStyle} placeholder="Capacidad máxima" onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Proveedor</label>
                <input style={inputStyle} placeholder="Nombre del proveedor" onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
              </div>

              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{
                  flex: 1, padding: '12px 0', borderRadius: 12,
                  fontSize: 13, color: 'rgba(255,255,255,0.4)',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  Cancelar
                </button>
                <button type="submit" style={{
                  flex: 1, padding: '12px 0', borderRadius: 12,
                  fontSize: 13, fontWeight: 500, color: 'white',
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(124,58,237,0.3)',
                  transition: 'all 0.2s',
                }}>
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
