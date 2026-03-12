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

export default function InventoryTable({ products, searchTerm, onSearchChange, categoryFilter, onCategoryChange }: InventoryTableProps) {
  const categories = ['Todos', ...new Set(products.map(p => p.category))];

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todos' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                categoryFilter === cat
                  ? 'bg-purple-500/25 text-purple-300 border border-purple-500/30'
                  : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs font-medium text-white/30 px-5 py-3 uppercase tracking-wider">Producto</th>
              <th className="text-left text-xs font-medium text-white/30 px-5 py-3 uppercase tracking-wider">Categoría</th>
              <th className="text-left text-xs font-medium text-white/30 px-5 py-3 uppercase tracking-wider">Cantidad</th>
              <th className="text-left text-xs font-medium text-white/30 px-5 py-3 uppercase tracking-wider">Capacidad</th>
              <th className="text-left text-xs font-medium text-white/30 px-5 py-3 uppercase tracking-wider">Estado</th>
              <th className="text-left text-xs font-medium text-white/30 px-5 py-3 uppercase tracking-wider">Precio/U</th>
              <th className="text-left text-xs font-medium text-white/30 px-5 py-3 uppercase tracking-wider">Proveedor</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => {
              const status = getStockStatus(product);
              const config = stockStatusConfig[status];
              const percentage = Math.round((product.quantity / product.maxCapacity) * 100);

              return (
                <tr key={product.id} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium text-white/90">{product.name}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-md">{product.category}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-white/70">{product.quantity} {product.unit}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            status === 'critical' ? 'bg-red-500' :
                            status === 'low' ? 'bg-amber-500' :
                            status === 'full' ? 'bg-cyan-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-white/30">{percentage}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${config.bg} ${config.color} border ${config.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                      {config.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-white/60">${product.pricePerUnit.toFixed(2)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-white/35">{product.supplier}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-white/30 text-sm">
          No se encontraron productos
        </div>
      )}
    </div>
  );
}
