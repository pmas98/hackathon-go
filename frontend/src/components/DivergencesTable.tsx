import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, Filter, ChevronRight, ChevronDown, XCircle, Info } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import type { ErrorDetail, ResultsFilters } from '@/lib/types';

interface DivergencesTableProps {
  errors: ErrorDetail[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onFiltersChange: (filters: ResultsFilters) => void;
  initialFilters?: ResultsFilters;
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
  onPageSizeChange,
  onFiltersChange,
  initialFilters = {}
}: DivergencesTableProps) {
  // Initialize states
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  
  // Backend filters state - initialize with URL values
  const [backendFilters, setBackendFilters] = useState<ResultsFilters>({
    filter: initialFilters.filter || '',
    type: initialFilters.type || '',
    value: initialFilters.value || ''
  });

  // Debounce the search value for better performance
  const debouncedSearchValue = useDebounce(backendFilters.value || '', 800);

  // Sync with external URL changes
  useEffect(() => {
    setBackendFilters({
      filter: initialFilters.filter || '',
      type: initialFilters.type || '',
      value: initialFilters.value || ''
    });
  }, [initialFilters]);

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

  const handlePageChange = useCallback((page: number) => {
    onPageChange(page);
  }, [onPageChange]);

  const handlePageSizeChange = useCallback((size: number) => {
    onPageSizeChange(size);
  }, [onPageSizeChange]);

  // Update backend filters
  const updateBackendFilter = useCallback((key: keyof ResultsFilters, value: string | undefined) => {
    setBackendFilters(prev => {
      const newFilters = {
        ...prev,
        [key]: value || ''
      };
      
      // If changing the field filter, clear the search value to avoid confusion
      if (key === 'filter' && value !== prev.filter) {
        newFilters.value = '';
      }
      
      return newFilters;
    });
  }, []);

  // Use ref to store the callback to avoid dependency issues
  const onFiltersChangeRef = useRef(onFiltersChange);
  onFiltersChangeRef.current = onFiltersChange;

  // Track if this is initial mount to avoid triggering on first render
  const isInitialMount = useRef(true);
  
  // Communicate filter changes to parent component (Results.tsx)
  useEffect(() => {
    // Skip on initial mount to avoid triggering during initialization
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const filters: ResultsFilters = {};
    
    // Add backend filters
    if (backendFilters.filter) filters.filter = backendFilters.filter;
    if (backendFilters.type) filters.type = backendFilters.type;
    if (debouncedSearchValue) filters.value = debouncedSearchValue;

    onFiltersChangeRef.current(filters);
  }, [debouncedSearchValue, backendFilters.filter, backendFilters.type]);

  // Reset to first page when filters change (handled by parent component now)

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
      {/* Integrated Filters and Table */}
      <div className="p-6">
        {/* Header with Title */}
        <div className="mb-6">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Divergências Encontradas
            </h3>
            <p className="text-purple-200 text-sm mt-1">
              {totalItems} divergência{totalItems !== 1 ? 's' : ''} encontrada{totalItems !== 1 ? 's' : ''}
            </p>
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
                  {Object.values(backendFilters).filter(v => v !== undefined && v !== null && v !== '').length} filtro{Object.values(backendFilters).filter(v => v !== undefined && v !== null && v !== '').length !== 1 ? 's' : ''} ativo{Object.values(backendFilters).filter(v => v !== undefined && v !== null && v !== '').length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {Object.values(backendFilters).some(v => v !== undefined && v !== null && v !== '') && (
                <div className="px-3 py-1 bg-purple-500/40 rounded-full border border-purple-400/30">
                  <span className="text-xs text-purple-200 font-medium">
                    {Object.values(backendFilters).filter(v => v !== undefined && v !== null && v !== '').length} ativo{Object.values(backendFilters).filter(v => v !== undefined && v !== null && v !== '').length !== 1 ? 's' : ''}
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
              {/* First Row - Type and Field */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pt-6">
                {/* Type Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-purple-200 uppercase tracking-wide">Tipo de Divergência</label>
                  <select
                    value={backendFilters.type || ''}
                    onChange={(e) => updateBackendFilter('type', e.target.value || undefined)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200 hover:border-purple-300/50"
                  >
                    <option value="">Todos os tipos</option>
                    <option value="mismatch">Divergência de dados</option>
                    <option value="missing_in_api">Faltando na API</option>
                    <option value="missing_in_csv">Faltando no CSV</option>
                  </select>
                </div>
                
                {/* Field Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-purple-200 uppercase tracking-wide">Campo Específico</label>
                  <select
                    value={backendFilters.filter || ''}
                    onChange={(e) => updateBackendFilter('filter', e.target.value || undefined)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200 hover:border-purple-300/50"
                  >
                    <option value="">Todos os campos</option>
                    <option value="nome">Nome</option>
                    <option value="categoria">Categoria</option>
                    <option value="preco">Preço</option>
                    <option value="estoque">Estoque</option>
                    <option value="fornecedor">Fornecedor</option>
                  </select>
                </div>
              </div>
              
              {/* Second Row - Field-Specific Search */}
              <div className="mb-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-purple-200 uppercase tracking-wide flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Buscar no Campo Selecionado
                  </label>
                  <input
                    type="text"
                    placeholder={
                      backendFilters.filter 
                        ? `Buscar valores no campo "${backendFilters.filter}"...`
                        : "Selecione um campo específico primeiro para habilitar a busca"
                    }
                    value={backendFilters.value || ''}
                    onChange={(e) => updateBackendFilter('value', e.target.value || undefined)}
                    disabled={!backendFilters.filter}
                    className={`w-full px-4 py-3 border rounded-xl text-sm transition-all duration-200 ${
                      backendFilters.filter 
                        ? 'bg-white/10 text-white placeholder-purple-300 border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 hover:border-purple-300/50' 
                        : 'bg-purple-900/20 text-purple-300/60 placeholder-purple-400/50 cursor-not-allowed border-purple-500/30'
                    }`}
                  />
                  <p className="text-xs text-purple-300">
                    {backendFilters.filter 
                      ? `Busca específica no campo "${backendFilters.filter}" (ex: nomes, preços, IDs, etc.)`
                      : "Primeiro selecione um campo específico acima, depois digite aqui para buscar nesse campo"
                    }
                  </p>
                </div>
              </div>
              
              {/* Clear Filters Button */}
              <div className="flex justify-end pt-4 border-t border-purple-500/20">
                <button
                  onClick={() => {
                    setBackendFilters({
                      filter: '',
                      type: '',
                      value: ''
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
                <th className="p-3 text-left text-sm font-semibold text-white">ID</th>
                <th className="p-3 text-left text-sm font-semibold text-white">Tipo</th>
                <th className="p-3 text-left text-sm font-semibold text-white">Categoria</th>
                <th className="p-3 text-left text-sm font-semibold text-white">Campo</th>
                <th className="p-3 text-left text-sm font-semibold text-white">Valor CSV</th>
                <th className="p-3 text-left text-sm font-semibold text-white">Valor API</th>
                <th className="p-3 text-left text-sm font-semibold text-white">Ações</th>
              </tr>
            </thead>
            <tbody>
              {errors && errors.length > 0 ? errors.map((error, errorIndex) => {
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
                                          {(() => {
                                            const numericFields = ['preco', 'estoque'];
                                            
                                            if (numericFields.includes(fieldName)) {
                                              const csvNum = Number(detail?.csv || 0);
                                              const apiNum = Number(detail?.api || 0);
                                              
                                              if (!isNaN(csvNum) && !isNaN(apiNum)) {
                                                return Math.abs(csvNum - apiNum).toLocaleString();
                                              }
                                            }
                                            
                                            return 'Diferente';
                                          })()}
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
              }) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <div className="text-purple-200">
                      {errors === null ? 'Carregando...' : 'Nenhuma divergência encontrada'}
                    </div>
                  </td>
                </tr>
              )}
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
