import { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, Filter, ArrowUp, ArrowDown, ArrowUpDown, ChevronRight, ChevronDown, XCircle, Info } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import type { ErrorDetail } from '@/lib/types';

interface DivergencesTableProps {
  errors: ErrorDetail[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

// Helper functions for type icons and labels
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'mismatch':
      return <XCircle className="h-4 w-4 text-orange-400" />;
    case 'missing_in_api':
      return <XCircle className="h-4 w-4 text-red-400" />;
    case 'missing_in_csv':
      return <Info className="h-4 w-4 text-blue-400" />;
    default:
      return <XCircle className="h-4 w-4 text-purple-400" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'mismatch':
      return 'Divergência de dados';
    case 'missing_in_api':
      return 'Faltando na API';
    case 'missing_in_csv':
      return 'Faltando no CSV';
    default:
      return type;
  }
};

const getTypeBadge = (type: string) => {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
  switch (type) {
    case 'mismatch':
      return `${baseClasses} bg-orange-500/20 text-orange-400 border border-orange-500/20`;
    case 'missing_in_api':
      return `${baseClasses} bg-red-500/20 text-red-400 border border-red-500/20`;
    case 'missing_in_csv':
      return `${baseClasses} bg-blue-500/20 text-blue-400 border border-blue-500/20`;
    default:
      return `${baseClasses} bg-purple-500/20 text-purple-400 border border-purple-500/20`;
  }
};

export function DivergencesTable({
  errors,
  currentPage,
  pageSize,
  totalPages,
  totalItems,
  onPageChange,
  onPageSizeChange
}: DivergencesTableProps) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<'api_id' | 'type' | 'categoria'>('api_id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  
  // Internal filters state
  const [internalFilters, setInternalFilters] = useState({
    type: '',
    categoria: '',
    precoMin: undefined as number | undefined,
    precoMax: undefined as number | undefined,
    estoqueMin: undefined as number | undefined,
    estoqueMax: undefined as number | undefined
  });

  const debouncedGlobalFilter = useDebounce(globalFilter, 300);

  const toggleRow = useCallback((rowId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  }, []);

  const handleSort = useCallback((field: 'api_id' | 'type' | 'categoria') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }, [sortField, sortOrder]);

  const handlePageChange = useCallback((page: number) => {
    onPageChange(page);
  }, [onPageChange]);

  const handlePageSizeChange = useCallback((size: number) => {
    onPageSizeChange(size);
  }, [onPageSizeChange]);

  // Update internal filters
  const updateFilter = useCallback((key: keyof typeof internalFilters, value: string | number | undefined) => {
    setInternalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Apply filters and sorting
  const processedErrors = useMemo(() => {
    let filtered = errors;

    // Apply global filter
    if (debouncedGlobalFilter) {
      filtered = filtered.filter(error => 
        error.api_id.toString().includes(debouncedGlobalFilter) ||
        error.type.toLowerCase().includes(debouncedGlobalFilter.toLowerCase()) ||
        (error.fields?.categoria?.csv || '').toLowerCase().includes(debouncedGlobalFilter.toLowerCase()) ||
        Object.values(error.fields || {}).some(field => 
          field?.csv?.toString().toLowerCase().includes(debouncedGlobalFilter.toLowerCase()) || 
          field?.api?.toString().toLowerCase().includes(debouncedGlobalFilter.toLowerCase())
        )
      );
    }

    // Apply column filters
    if (internalFilters.type) {
      filtered = filtered.filter(error => error.type === internalFilters.type);
    }
    if (internalFilters.categoria) {
      filtered = filtered.filter(error => error.fields?.categoria?.csv === internalFilters.categoria);
    }
    
    // Apply price range filters
    if (internalFilters.precoMin !== undefined) {
      filtered = filtered.filter(error => {
        const preco = error.fields?.preco?.csv || error.fields?.preco?.api;
        return preco !== undefined && Number(preco) >= internalFilters.precoMin!;
      });
    }
    if (internalFilters.precoMax !== undefined) {
      filtered = filtered.filter(error => {
        const preco = error.fields?.preco?.csv || error.fields?.preco?.api;
        return preco !== undefined && Number(preco) <= internalFilters.precoMax!;
      });
    }
    
    // Apply stock range filters
    if (internalFilters.estoqueMin !== undefined) {
      filtered = filtered.filter(error => {
        const estoque = error.fields?.estoque?.csv || error.fields?.estoque?.api;
        return estoque !== undefined && Number(estoque) >= internalFilters.estoqueMin!;
      });
    }
    if (internalFilters.estoqueMax !== undefined) {
      filtered = filtered.filter(error => {
        const estoque = error.fields?.estoque?.csv || error.fields?.estoque?.api;
        return estoque !== undefined && Number(estoque) <= internalFilters.estoqueMax!;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortField) {
        case 'api_id':
          aValue = a.api_id;
          bValue = b.api_id;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'categoria':
          aValue = a.fields?.categoria?.csv || '';
          bValue = b.fields?.categoria?.csv || '';
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [errors, debouncedGlobalFilter, internalFilters, sortField, sortOrder]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      onPageChange(1);
    }
  }, [debouncedGlobalFilter, internalFilters, currentPage, onPageChange]);

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
      {/* Integrated Filters and Table */}
      <div className="p-6">
        {/* Header with Title and Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Divergências Encontradas
            </h3>
            <p className="text-purple-200 text-sm mt-1">
              {totalItems} divergência{totalItems !== 1 ? 's' : ''} encontrada{totalItems !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-300" />
            <input
              placeholder="Buscar por ID, valores, campos..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200"
            />
          </div>
        </div>

        {/* Advanced Filters Section */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20 mb-6 overflow-hidden">
          {/* Collapsible Header */}
          <button
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            className="w-full p-4 flex items-center justify-between hover:bg-purple-500/20 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-500/30 rounded-lg group-hover:bg-purple-500/40 transition-colors">
                <Filter className="h-4 w-4 text-purple-300" />
              </div>
              <div className="text-left">
                <h4 className="text-white font-semibold">Filtros Avançados</h4>
                <p className="text-xs text-purple-300">
                  {Object.values(internalFilters).filter(v => v !== undefined && v !== null && v !== '').length + (debouncedGlobalFilter ? 1 : 0)} filtro{Object.values(internalFilters).filter(v => v !== undefined && v !== null && v !== '').length + (debouncedGlobalFilter ? 1 : 0) !== 1 ? 's' : ''} ativo{Object.values(internalFilters).filter(v => v !== undefined && v !== null && v !== '').length + (debouncedGlobalFilter ? 1 : 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {Object.values(internalFilters).some(v => v !== undefined && v !== null && v !== '') && (
                <div className="px-3 py-1 bg-purple-500/40 rounded-full border border-purple-400/30">
                  <span className="text-xs text-purple-200 font-medium">
                    {Object.values(internalFilters).filter(v => v !== undefined && v !== null && v !== '').length} ativo{Object.values(internalFilters).filter(v => v !== undefined && v !== null && v !== '').length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
              
              <div className={`w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center transition-all duration-300 group-hover:bg-white/20 ${
                isFiltersExpanded ? 'rotate-180' : ''
              }`}>
                <ChevronDown className="h-4 w-4 text-purple-300" />
              </div>
            </div>
          </button>
          
          {/* Expandable Content */}
          <div 
            className={`transition-all duration-500 ease-in-out ${
              isFiltersExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-6 pb-6 border-t border-purple-500/20">
              {/* First Row - Type and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pt-6">
                {/* Type Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-purple-200 uppercase tracking-wide">Tipo de Divergência</label>
                  <select
                    value={internalFilters.type || ''}
                    onChange={(e) => updateFilter('type', e.target.value || undefined)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200 hover:border-purple-300/50"
                  >
                    <option value="">Todos os tipos</option>
                    <option value="mismatch">Divergência de dados</option>
                    <option value="missing_in_api">Faltando na API</option>
                    <option value="missing_in_csv">Faltando no CSV</option>
                  </select>
                </div>
                
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-purple-200 uppercase tracking-wide">Categoria</label>
                  <select
                    value={internalFilters.categoria || ''}
                    onChange={(e) => updateFilter('categoria', e.target.value || undefined)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200 hover:border-purple-300/50"
                  >
                    <option value="">Todas as categorias</option>
                    <option value="Móveis">Móveis</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Acessórios">Acessórios</option>
                    <option value="Componentes">Componentes</option>
                    <option value="Periféricos">Periféricos</option>
                  </select>
                </div>
              </div>
              
              {/* Second Row - Price Range */}
              <div className="mb-6">
                <label className="text-xs font-medium text-purple-200 uppercase tracking-wide mb-3 block">Faixa de Preço</label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-purple-300 mb-2 block">Preço Mínimo</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={internalFilters.precoMin || ''}
                      onChange={(e) => updateFilter('precoMin', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 placeholder-purple-300 transition-all duration-200 hover:border-purple-300/50"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-purple-300 mb-2 block">Preço Máximo</label>
                    <input
                      type="number"
                      placeholder="9999.99"
                      value={internalFilters.precoMax || ''}
                      onChange={(e) => updateFilter('precoMax', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 placeholder-purple-300 transition-all duration-200 hover:border-purple-300/50"
                    />
                  </div>
                </div>
              </div>
              
              {/* Third Row - Stock Range */}
              <div className="mb-6">
                <label className="text-xs font-medium text-purple-200 uppercase tracking-wide mb-3 block">Faixa de Estoque</label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-purple-300 mb-2 block">Estoque Mínimo</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={internalFilters.estoqueMin || ''}
                      onChange={(e) => updateFilter('estoqueMin', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 placeholder-purple-300 transition-all duration-200 hover:border-purple-300/50"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-purple-300 mb-2 block">Estoque Máximo</label>
                    <input
                      type="number"
                      placeholder="500"
                      value={internalFilters.estoqueMax || ''}
                      onChange={(e) => updateFilter('estoqueMax', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 placeholder-purple-300 transition-all duration-200 hover:border-purple-300/50"
                    />
                  </div>
                </div>
              </div>
              
              {/* Clear Filters Button */}
              <div className="flex justify-end pt-4 border-t border-purple-500/20">
                <button
                  onClick={() => {
                    setGlobalFilter('');
                    setInternalFilters({
                      type: '',
                      categoria: '',
                      precoMin: undefined,
                      precoMax: undefined,
                      estoqueMin: undefined,
                      estoqueMax: undefined
                    });
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 text-red-300 rounded-xl transition-all duration-200 border border-red-500/30 hover:border-red-500/50 font-medium text-sm"
                >
                  Limpar Todos os Filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/10 border-b border-white/20">
                <th className="p-3 text-left">
                  <button
                    onClick={() => handleSort('api_id')}
                    className="flex items-center space-x-1 text-sm font-semibold text-white hover:text-purple-200 transition-colors"
                  >
                    <span>ID</span>
                    {sortField === 'api_id' ? (
                      sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="p-3 text-left">
                  <button
                    onClick={() => handleSort('type')}
                    className="flex items-center space-x-1 text-sm font-semibold text-white hover:text-purple-200 transition-colors"
                  >
                    <span>Tipo</span>
                    {sortField === 'type' ? (
                      sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="p-3 text-left">
                  <button
                    onClick={() => handleSort('categoria')}
                    className="flex items-center space-x-1 text-sm font-semibold text-white hover:text-purple-200 transition-colors"
                  >
                    <span>Categoria</span>
                    {sortField === 'categoria' ? (
                      sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="p-3 text-left text-sm font-semibold text-white">Campo</th>
                <th className="p-3 text-left text-sm font-semibold text-white">Valor CSV</th>
                <th className="p-3 text-left text-sm font-semibold text-white">Valor API</th>
                <th className="p-3 text-left text-sm font-semibold text-white">Ações</th>
              </tr>
            </thead>
            <tbody>
              {processedErrors.map((error, errorIndex) => {
                const rowId = `${error.api_id}-${errorIndex}`;
                const isExpanded = expandedRows.has(rowId);
                
                return (
                  <>
                    {/* Main Row */}
                    <tr key={`${rowId}-main`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(error.type)}
                          <span className="font-mono text-sm text-white">{error.api_id}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={getTypeBadge(error.type)}>
                          {getTypeLabel(error.type)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-purple-200 text-sm">
                          {error.fields?.categoria?.csv || 'N/A'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-white font-medium text-sm">
                          {error.fields ? Object.keys(error.fields).join(', ') : 'N/A'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-purple-200 font-mono text-sm">
                          {error.fields ? Object.values(error.fields).map(field => field?.csv).join(', ') : 'N/A'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-purple-200 font-mono text-sm">
                          {error.fields ? Object.values(error.fields).map(field => field?.api).join(', ') : 'N/A'}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleRow(rowId)}
                          className="w-40 flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 rounded-lg transition-all duration-300 border border-purple-500/30"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              <span className="text-sm">Ocultar</span>
                            </>
                          ) : (
                            <>
                              <ChevronRight className="w-4 h-4" />
                              <span className="text-sm">Ver detalhes</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Details Row with Animation */}
                    <tr key={`${rowId}-details`} className="border-b border-white/5">
                      <td colSpan={7} className="p-0">
                        <div 
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="p-4 bg-white/5">
                            <div className="space-y-3">
                              {error.fields && Object.entries(error.fields).map(([fieldName, detail], fieldIndex) => (
                                <div key={fieldIndex} className="flex items-center justify-between py-2 px-3 bg-white/10 rounded-lg border border-white/20">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-sm font-medium text-purple-200 uppercase tracking-wide min-w-[80px]">
                                      {fieldName}
                                    </span>
                                    {detail?.csv !== detail?.api ? (
                                      <XCircle className="w-4 h-4 text-red-400" />
                                    ) : (
                                      <Info className="w-4 h-4 text-blue-400" />
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center space-x-4">
                                    <div className="text-center">
                                      <div className="text-xs text-purple-300 mb-1">CSV</div>
                                      <div className="text-sm font-mono text-white bg-purple-600/20 rounded px-3 py-1">
                                        {String(detail?.csv ?? '—')}
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-xs text-purple-300 mb-1">API</div>
                                      <div className="text-sm font-mono text-white bg-blue-600/20 rounded px-3 py-1">
                                        {String(detail?.api ?? '—')}
                                      </div>
                                    </div>
                                    
                                    {detail?.csv !== detail?.api && (
                                      <div className="text-center">
                                        <div className="text-xs text-red-300 mb-1">Diferença</div>
                                        <div className="text-sm font-mono text-red-400 bg-red-600/20 rounded px-3 py-1">
                                          {Math.abs(Number(detail?.csv || 0) - Number(detail?.api || 0))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-purple-200">Itens por página:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm text-white focus:border-purple-400 focus:ring-purple-400/20"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
          
          <div className="text-sm text-purple-200">
            Mostrando <span className="text-white font-semibold">{((currentPage - 1) * pageSize) + 1}</span> a{' '}
            <span className="text-white font-semibold">{Math.min(currentPage * pageSize, totalItems)}</span> de{' '}
            <span className="text-white font-semibold">{totalItems}</span> divergências
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors border border-white/20"
            >
              Anterior
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (page > totalPages) return null;
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg transition-colors border ${
                      page === currentPage
                        ? 'bg-purple-600 text-white border-purple-500'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors border border-white/20"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
