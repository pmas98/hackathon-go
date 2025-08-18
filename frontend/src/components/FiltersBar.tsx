import { useState, useCallback } from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Filters } from '@/lib/types';

interface FiltersBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onReset: () => void;
  className?: string;
}

export function FiltersBar({ 
  filters, 
  onFiltersChange, 
  onReset,
  className 
}: FiltersBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = useCallback((key: keyof Filters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  }, [filters, onFiltersChange]);

  const clearFilter = useCallback((key: keyof Filters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
        <input
          type="text"
          placeholder="Buscar por ID, nome ou fornecedor..."
          value={filters.search || ''}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="w-full pl-12 h-12 text-base bg-white/10 border border-white/20 rounded-xl focus:border-purple-400 focus:ring-purple-400/20 text-white placeholder-purple-300 backdrop-blur-sm"
        />
      </div>

      {/* Filters Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="text-sm font-medium">Filtros Avançados</span>
          <div className={cn(
            "w-5 h-5 rounded-full text-xs font-medium flex items-center justify-center transition-colors",
            hasActiveFilters 
              ? "bg-purple-500 text-white" 
              : "bg-white/20 text-purple-300"
          )}>
            {Object.values(filters).filter(v => v !== undefined && v !== null && v !== '').length}
          </div>
        </button>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-purple-300 hover:text-white transition-colors"
          >
            Limpar todos os filtros
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
          {/* Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-purple-200">Tipo de Divergência</label>
            <select
              value={filters.type || ''}
              onChange={(e) => updateFilter('type', e.target.value || undefined)}
              className="w-full bg-white/10 border border-white/20 rounded-xl focus:border-purple-400 focus:ring-purple-400/20 text-white backdrop-blur-sm"
            >
              <option value="">Todos os tipos</option>
              <option value="mismatch">Divergência de dados</option>
              <option value="missing_in_api">Faltando na API</option>
              <option value="missing_in_csv">Faltando no CSV</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-purple-200">Categoria</label>
            <select
              value={filters.categoria || ''}
              onChange={(e) => updateFilter('categoria', e.target.value || undefined)}
              className="w-full bg-white/10 border border-white/20 rounded-xl focus:border-purple-400 focus:ring-purple-400/20 text-white backdrop-blur-sm"
            >
              <option value="">Todas as categorias</option>
              <option value="Móveis">Móveis</option>
              <option value="Hardware">Hardware</option>
              <option value="Acessórios">Acessórios</option>
              <option value="Componentes">Componentes</option>
              <option value="Periféricos">Periféricos</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-purple-200">Preço Mínimo</label>
            <input
              type="number"
              placeholder="0.00"
              value={filters.precoMin || ''}
              onChange={(e) => updateFilter('precoMin', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-white/10 border border-white/20 rounded-xl focus:border-purple-400 focus:ring-purple-400/20 text-white placeholder-purple-300 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-purple-200">Preço Máximo</label>
            <input
              type="number"
              placeholder="9999.99"
              value={filters.precoMax || ''}
              onChange={(e) => updateFilter('precoMax', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-white/10 border border-white/20 rounded-xl focus:border-purple-400 focus:ring-purple-400/20 text-white placeholder-purple-300 backdrop-blur-sm"
            />
          </div>

          {/* Stock Range */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-purple-200">Estoque Mínimo</label>
            <input
              type="number"
              placeholder="0"
              value={filters.estoqueMin || ''}
              onChange={(e) => updateFilter('estoqueMin', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-white/10 border border-white/20 rounded-xl focus:border-purple-400 focus:ring-purple-400/20 text-white placeholder-purple-300 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-purple-200">Estoque Máximo</label>
            <input
              type="number"
              placeholder="500"
              value={filters.estoqueMax || ''}
              onChange={(e) => updateFilter('estoqueMax', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-white/10 border border-white/20 rounded-xl focus:border-purple-400 focus:ring-purple-400/20 text-white placeholder-purple-300 backdrop-blur-sm"
            />
          </div>
        </div>
      )}

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value || value === '') return null;
            
            const getFilterLabel = (key: string, value: any) => {
              switch (key) {
                case 'type':
                  const typeLabels: Record<string, string> = {
                    'mismatch': 'Divergência de dados',
                    'missing_in_api': 'Faltando na API',
                    'missing_in_csv': 'Faltando no CSV'
                  };
                  return `${typeLabels[value] || value}`;
                case 'categoria':
                  return `Categoria: ${value}`;
                case 'precoMin':
                  return `Preço ≥ R$ ${value}`;
                case 'precoMax':
                  return `Preço ≤ R$ ${value}`;
                case 'estoqueMin':
                  return `Estoque ≥ ${value}`;
                case 'estoqueMax':
                  return `Estoque ≤ ${value}`;
                case 'search':
                  return `Busca: "${value}"`;
                default:
                  return `${key}: ${value}`;
              }
            };

            return (
              <div
                key={key}
                className="flex items-center space-x-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/20"
              >
                <span>{getFilterLabel(key, value)}</span>
                <button
                  onClick={() => clearFilter(key as keyof Filters)}
                  className="hover:text-white transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
