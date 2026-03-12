import { Search } from 'lucide-react';
import type { Product } from '../types';
import { getStockStatus, stockStatusConfig } from '../data/mockData';

interface InventoryTableProps {
  products: Product[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  categoryFilter: string;
  onCategoryChange: (cat: string) => void;
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', fontSize: 11, fontWeight: 500,
  color: 'rgba(255,255,255,0.3)', padding: '12px 20px',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};

const tdStyle: React.CSSProperties = {
  padding: '14px 20px',
};

const barColors: Record<string, string> = {
  critical: '#ef4444', low: '#f59e0b', normal: '#10b981', full: '#06b6d4',
};

export default function InventoryTable({ products, searchTerm, onSearchChange, categoryFilter, onCategoryChange }: InventoryTableProps) {
  const categories = ['Todos', ...new Set(products.map(p => p.category))];

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todos' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="glass" style={{ borderRadius: 16, overflow: 'hidden' }}>
      {/* Filters */}
      <div style={{
        padding: 16, borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            width: 16, height: 16, color: 'rgba(255,255,255,0.3)',
          }} />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: '10px 16px 10px 40px',
              fontSize: 13, color: 'white', outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              style={{
                padding: '8px 14px', borderRadius: 12,
                fontSize: 12, fontWeight: 500,
                transition: 'all 0.2s', cursor: 'pointer',
                background: categoryFilter === cat ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.05)',
                color: categoryFilter === cat ? '#c4b5fd' : 'rgba(255,255,255,0.4)',
                border: categoryFilter === cat ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <th style={thStyle}>Producto</th>
              <th style={thStyle}>Categoría</th>
              <th style={thStyle}>Cantidad</th>
              <th style={thStyle}>Capacidad</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Precio/U</th>
              <th style={thStyle}>Proveedor</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => {
              const status = getStockStatus(product);
              const config = stockStatusConfig[status];
              const percentage = Math.round((product.quantity / product.maxCapacity) * 100);

              return (
                <tr key={product.id} style={{
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  transition: 'background 0.2s',
                }}>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>{product.name}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      fontSize: 11, color: 'rgba(255,255,255,0.4)',
                      background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 6,
                    }}>{product.category}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{product.quantity} {product.unit}</span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 64, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 3,
                          background: barColors[status],
                          width: `${percentage}%`,
                        }} />
                      </div>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{percentage}%</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 8,
                      background: config.bgColor, color: config.textColor,
                      border: `1px solid ${config.borderColor}`,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: config.dotColor }} />
                      {config.label}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>${product.pricePerUnit.toFixed(2)}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{product.supplier}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
          No se encontraron productos
        </div>
      )}
    </div>
  );
}
