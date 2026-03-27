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

const barColors: Record<string, string> = {
  critical: '#ff453a', low: '#ff9f0a', normal: '#30d158', full: '#0a84ff',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left', fontSize: 11, fontWeight: 600,
  color: 'var(--text-3)', padding: '12px 20px',
  textTransform: 'uppercase', letterSpacing: '0.06em',
};
const tdStyle: React.CSSProperties = { padding: '13px 20px' };

export default function InventoryTable({ products, searchTerm, onSearchChange, categoryFilter, onCategoryChange }: InventoryTableProps) {
  const categories = ['Todos', ...new Set(products.map(p => p.category))];

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todos' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="card" style={{ borderRadius: 16, overflow: 'hidden' }}>
      {/* Filters */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            width: 15, height: 15, color: 'var(--text-3)', strokeWidth: 1.75,
          }} />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--surface-hover)',
              border: '1px solid transparent',
              borderRadius: 10,
              padding: '9px 14px 9px 36px',
              fontSize: 13, color: 'var(--text-1)', outline: 'none',
              transition: 'all 0.18s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--border-focus)';
              e.target.style.background = 'var(--surface-focus)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'transparent';
              e.target.style.background = 'var(--surface-hover)';
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              style={{
                padding: '7px 13px', borderRadius: 8,
                fontSize: 12, fontWeight: 500,
                transition: 'all 0.18s', cursor: 'pointer', border: 'none',
                background: categoryFilter === cat ? 'var(--nav-active-bg)' : 'var(--surface-hover)',
                color: categoryFilter === cat ? 'var(--nav-active-color)' : 'var(--text-2)',
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
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
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
            {filtered.map((product, i) => {
              const status = getStockStatus(product);
              const config = stockStatusConfig[status];
              const percentage = Math.round((product.quantity / product.maxCapacity) * 100);
              return (
                <tr
                  key={product.id}
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={tdStyle}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{product.name}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      fontSize: 11, color: 'var(--text-2)',
                      background: 'var(--surface-hover)',
                      padding: '3px 8px', borderRadius: 6,
                      fontWeight: 500,
                    }}>
                      {product.category}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 13, color: 'var(--text-1)' }}>{product.quantity} {product.unit}</span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 56, height: 4, background: 'var(--progress-bg)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 2,
                          background: barColors[status],
                          width: `${percentage}%`,
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-3)', minWidth: 28 }}>{percentage}%</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
                      background: config.bgColor, color: config.textColor,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: config.dotColor, flexShrink: 0 }} />
                      {config.label}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 13, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>
                      ${product.pricePerUnit.toFixed(2)}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{product.supplier}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
          No se encontraron productos
        </div>
      )}
    </div>
  );
}
