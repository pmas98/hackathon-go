import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, AlertTriangle, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ErrorDetail, Filters } from '@/lib/types';

interface DivergencesTableProps {
	errors: ErrorDetail[];
	filters: Filters;
	currentPage: number;
	pageSize: number;
	totalPages: number;
	totalItems: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (size: number) => void;
	className?: string;
}

type SortField = 'api_id' | 'type' | 'categoria' | 'nome';
type SortOrder = 'asc' | 'desc';

export function DivergencesTable({ 
	errors, 
	filters, 
	currentPage, 
	pageSize, 
	totalPages, 
	totalItems,
	onPageChange,
	onPageSizeChange,
	className 
}: DivergencesTableProps) {
	const [sortField, setSortField] = useState<SortField>('api_id');
	const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
	const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

	// Filter data (applies to current page data from API)
	const filteredErrors = useMemo(() => {
		return errors.filter(error => {
			// Type filter
			if (filters.type && error.type !== filters.type) return false;
			
			// Category filter
			if (filters.categoria && error.fields?.categoria?.csv !== filters.categoria) return false;
			
			// Search filter
			if (filters.search) {
				const searchLower = filters.search.toLowerCase();
				const matchesId = error.api_id.toString().includes(searchLower);
				const matchesNome = error.nome?.toLowerCase().includes(searchLower) || false;
				const matchesFornecedor = error.fields?.fornecedor?.csv?.toLowerCase().includes(searchLower) || false;
				
				if (!matchesId && !matchesNome && !matchesFornecedor) return false;
			}
			
			return true;
		});
	}, [errors, filters]);

	// Sort data
	const sortedErrors = useMemo(() => {
		return [...filteredErrors].sort((a, b) => {
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
				case 'nome':
					aValue = a.nome || '';
					bValue = b.nome || '';
					break;
				default:
					return 0;
			}
			
			if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
			if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
			return 0;
		});
	}, [filteredErrors, sortField, sortOrder]);

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortOrder('asc');
		}
	};

	const toggleRow = (index: number) => {
		const newExpanded = new Set(expandedRows);
		if (newExpanded.has(index)) {
			newExpanded.delete(index);
		} else {
			newExpanded.add(index);
		}
		setExpandedRows(newExpanded);
	};

	const getTypeIcon = (type: string) => {
		switch (type) {
			case 'mismatch':
				return <AlertTriangle className="h-4 w-4 text-orange-400" />;
			case 'missing_in_api':
				return <Minus className="h-4 w-4 text-red-400" />;
			case 'missing_in_csv':
				return <Plus className="h-4 w-4 text-blue-400" />;
			default:
				return <AlertTriangle className="h-4 w-4 text-purple-400" />;
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
				return cn(baseClasses, "bg-orange-500/20 text-orange-400 border border-orange-500/20");
			case 'missing_in_api':
				return cn(baseClasses, "bg-red-500/20 text-red-400 border border-red-500/20");
			case 'missing_in_csv':
				return cn(baseClasses, "bg-blue-500/20 text-blue-400 border border-blue-500/20");
			default:
				return cn(baseClasses, "bg-purple-500/20 text-purple-400 border border-purple-500/20");
		}
	};

	if (sortedErrors.length === 0) {
		return (
			<div className={cn("text-center py-12", className)}>
				<div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-white/5 rounded-2xl border border-white/10">
					<AlertTriangle className="h-8 w-8 text-purple-300" />
				</div>
				<h3 className="text-lg font-semibold text-white mb-2">Nenhuma divergência encontrada</h3>
				<p className="text-purple-200">
					{filters.type || filters.categoria || filters.search 
						? "Tente ajustar os filtros aplicados" 
						: "Todos os produtos estão corretos!"
					}
				</p>
			</div>
		);
	}

	return (
		<div className={cn("space-y-6", className)}>
			{/* Table Header */}
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-white/10">
							<th className="text-left p-4">
								<button
									onClick={() => handleSort('api_id')}
									className="flex items-center space-x-1 text-sm font-semibold text-purple-200 hover:text-white transition-colors"
								>
									<span>ID</span>
									{sortField === 'api_id' && (
										sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
									)}
								</button>
							</th>
							<th className="text-left p-4">
								<button
									onClick={() => handleSort('type')}
									className="flex items-center space-x-1 text-sm font-semibold text-purple-200 hover:text-white transition-colors"
								>
									<span>Tipo</span>
									{sortField === 'type' && (
										sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
									)}
								</button>
							</th>
							<th className="text-left p-4">
								<button
									onClick={() => handleSort('categoria')}
									className="flex items-center space-x-1 text-sm font-semibold text-purple-200 hover:text-white transition-colors"
								>
									<span>Categoria</span>
									{sortField === 'categoria' && (
										sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
									)}
								</button>
							</th>
							<th className="text-left p-4">
								<button
									onClick={() => handleSort('nome')}
									className="flex items-center space-x-1 text-sm font-semibold text-purple-200 hover:text-white transition-colors"
								>
									<span>Nome</span>
									{sortField === 'nome' && (
										sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
									)}
								</button>
							</th>
							<th className="text-left p-4 text-sm font-semibold text-purple-200">Detalhes</th>
						</tr>
					</thead>
					<tbody>
						{sortedErrors.map((error, index) => (
							<tr key={`${error.api_id}-${index}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
								<td className="p-4">
									<div className="flex items-center space-x-2">
										{getTypeIcon(error.type)}
										<span className="font-mono text-sm text-white">{error.api_id}</span>
									</div>
								</td>
								<td className="p-4">
									<span className={getTypeBadge(error.type)}>
										{getTypeLabel(error.type)}
									</span>
								</td>
								<td className="p-4">
									<span className="text-purple-200">
										{error.fields?.categoria?.csv || 'N/A'}
									</span>
								</td>
								<td className="p-4">
									<span className="text-white font-medium">
										{error.nome || 'N/A'}
									</span>
								</td>
								<td className="p-4">
									<button
										onClick={() => toggleRow(index)}
										className="flex items-center space-x-1 text-sm text-purple-300 hover:text-white transition-colors"
									>
										<span>Ver detalhes</span>
										{expandedRows.has(index) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Expanded Details */}
			{sortedErrors.map((error, index) => (
				expandedRows.has(index) && (
					<div key={`details-${error.api_id}-${index}`} className="p-6 bg-white/5 rounded-2xl border border-white/10">
						<h4 className="text-lg font-semibold text-white mb-4">Detalhes da Divergência</h4>
						
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* CSV Data */}
							<div>
								<h5 className="text-sm font-semibold text-purple-200 mb-3">Dados do CSV</h5>
								<div className="space-y-2">
									{error.fields && Object.entries(error.fields).map(([field, detail]) => (
										<div key={field} className="flex justify-between items-center py-2 border-b border-white/10">
											<span className="text-sm text-purple-300 capitalize">{field}:</span>
											<span className="text-sm text-white font-mono">{detail.csv}</span>
										</div>
									))}
								</div>
							</div>

							{/* API Data */}
							<div>
								<h5 className="text-sm font-semibold text-purple-200 mb-3">Dados da API</h5>
								<div className="space-y-2">
									{error.fields && Object.entries(error.fields).map(([field, detail]) => (
										<div key={field} className="flex justify-between items-center py-2 border-b border-white/10">
											<span className="text-sm text-purple-300 capitalize">{field}:</span>
											<span className="text-sm text-white font-mono">{detail.api}</span>
										</div>
									))}
								</div>
							</div>
						</div>

						{error.csv_line && (
							<div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
								<span className="text-sm text-purple-200">
									Linha do CSV: <span className="text-white font-mono">{error.csv_line}</span>
								</span>
							</div>
						)}
					</div>
				)
			))}

			{/* Pagination Controls */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 p-4 bg-white/5 rounded-xl border border-white/10">
				{/* Items per page selector */}
				<div className="flex items-center space-x-3">
					<span className="text-sm text-purple-200">Itens por página:</span>
					<select
						value={pageSize}
						onChange={(e) => onPageSizeChange(Number(e.target.value))}
						className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm text-white focus:border-purple-400 focus:ring-purple-400/20"
					>
						<option value={25}>25</option>
						<option value={50}>50</option>
						<option value={100}>100</option>
						<option value={200}>200</option>
					</select>
				</div>

				{/* Page info */}
				<div className="text-sm text-purple-200">
					Mostrando <span className="text-white font-semibold">{((currentPage - 1) * pageSize) + 1}</span> a{' '}
					<span className="text-white font-semibold">{Math.min(currentPage * pageSize, totalItems)}</span> de{' '}
					<span className="text-white font-semibold">{totalItems}</span> divergências
				</div>

				{/* Pagination buttons */}
				<div className="flex items-center space-x-2">
					<button
						onClick={() => onPageChange(Math.max(1, currentPage - 1))}
						disabled={currentPage === 1}
						className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
					>
						<ChevronLeft className="h-4 w-4" />
					</button>
					
					{/* Page numbers */}
					<div className="flex items-center space-x-1">
						{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
							let pageNum;
							if (totalPages <= 5) {
								pageNum = i + 1;
							} else if (currentPage <= 3) {
								pageNum = i + 1;
							} else if (currentPage >= totalPages - 2) {
								pageNum = totalPages - 4 + i;
							} else {
								pageNum = currentPage - 2 + i;
							}
							
							return (
								<button
									key={pageNum}
									onClick={() => onPageChange(pageNum)}
									className={cn(
										"px-3 py-1 text-sm rounded-lg transition-colors",
										currentPage === pageNum
											? "bg-purple-500 text-white"
											: "bg-white/10 text-purple-200 hover:bg-white/20"
									)}
								>
									{pageNum}
								</button>
							);
						})}
					</div>
					
					<button
						onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
						disabled={currentPage === totalPages}
						className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
					>
						<ChevronRight className="h-4 w-4" />
					</button>
				</div>
			</div>

			{/* Summary */}
			<div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
				<span className="text-sm text-purple-200">
					Ordenado por: <span className="text-white font-semibold capitalize">{sortField}</span>
					<span className="text-purple-300"> ({sortOrder})</span>
				</span>
				<div className="text-sm text-purple-200">
					Página <span className="text-white font-semibold">{currentPage}</span> de{' '}
					<span className="text-white font-semibold">{totalPages}</span>
				</div>
			</div>
		</div>
	);
}
