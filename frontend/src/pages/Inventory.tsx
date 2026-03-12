import { useState } from 'react';
import { Package, Plus, Download, X } from 'lucide-react';
import InventoryTable from '../components/InventoryTable';
import { products as initialProducts, getStockStatus } from '../data/mockData';
import type { Product } from '../types';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Package className="w-7 h-7 text-purple-400" />
            Inventario
          </h1>
          <p className="text-sm text-white/40 mt-0.5">Gestiona todos los productos del restaurante</p>
        </div>
        <div className="flex gap-2">
          <button className="glass flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-white/90 hover:bg-white/10 transition-all border border-white/5">
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" />
            Agregar Producto
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(stats).map(([key, value]) => {
          const labels: Record<string, string> = { total: 'Total', critical: 'Crítico', low: 'Bajo', normal: 'Normal', full: 'Lleno' };
          const colors: Record<string, string> = { total: 'text-white/70', critical: 'text-red-400', low: 'text-amber-400', normal: 'text-emerald-400', full: 'text-cyan-400' };
          return (
            <div key={key} className="glass p-3 rounded-xl text-center">
              <p className={`text-xl font-bold ${colors[key]}`}>{value}</p>
              <p className="text-[11px] text-white/30">{labels[key]}</p>
            </div>
          );
        })}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative glass-strong rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">Agregar Producto</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/30 hover:text-white/60 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Nombre</label>
                  <input className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 transition-colors" placeholder="Ej: Pollo" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Categoría</label>
                  <select className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 transition-colors appearance-none">
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Cantidad</label>
                  <input type="number" className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 transition-colors" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Unidad</label>
                  <input className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 transition-colors" placeholder="kg, L, pz" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Precio/U</label>
                  <input type="number" step="0.01" className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 transition-colors" placeholder="0.00" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Mínimo</label>
                  <input type="number" className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 transition-colors" placeholder="Umbral mínimo" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Capacidad máx.</label>
                  <input type="number" className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 transition-colors" placeholder="Capacidad máxima" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Proveedor</label>
                <input className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 transition-colors" placeholder="Nombre del proveedor" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl text-sm text-white/40 bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/20">
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
