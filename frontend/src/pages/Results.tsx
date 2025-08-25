import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Download, BarChart3, Clock, TrendingUp, FileText, Share2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { DivergencesTable } from '@/components/DivergencesTable';
import { DivergenceChart } from '@/components/DivergenceChart';
import { api, exportData } from '@/lib/api';
import { formatNumber, formatTime, copyToClipboard } from '@/lib/utils';
import type { ComparisonResult, PerformanceMetrics, PaginationInfo, ResultsFilters } from '@/lib/types';

export default function Results() {
	const { jobId } = useParams<{ jobId: string }>();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	
	const [results, setResults] = useState<ComparisonResult | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isFilterLoading, setIsFilterLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [metrics, setMetrics] = useState<PerformanceMetrics>({
		validationTime: 0,
		totalProcessTime: 0
	});
	const [pagination, setPagination] = useState<PaginationInfo | null>(null);

	// Get current state from URL search params
	const currentPage = parseInt(searchParams.get('page') || '1', 10);
	const pageSize = parseInt(searchParams.get('pageSize') || '100', 10);
	
	// Get filters from URL
	const filters = useMemo(() => {
		const urlFilters: ResultsFilters = {};
		const filterParam = searchParams.get('filter');
		const typeParam = searchParams.get('type');
		const valueParam = searchParams.get('value');
		
		if (filterParam) urlFilters.filter = filterParam;
		if (typeParam) urlFilters.type = typeParam;
		if (valueParam) urlFilters.value = valueParam;
		
		return urlFilters;
	}, [searchParams]);

	// Load results with pagination
	useEffect(() => {
		const loadResults = async () => {
			if (!jobId) return;
			
			try {
				// Initial loading (no data yet) vs filter loading (has data)
				if (!results) {
					setIsLoading(true);
				} else {
					setIsFilterLoading(true);
				}
				setError(null);
				
				const data = await api.getResults(jobId, currentPage, pageSize, filters);
				setResults(data);
				setPagination(data.pagination);
				
				// Use real timing data from backend
				if (data.timing) {
					setMetrics({ 
						validationTime: 0, // Manter para compatibilidade, mas não usar
						totalProcessTime: data.timing.duration_ms || 0
					});
				}
				
			} catch (err) {
				console.error('Erro ao carregar resultados:', err);
				setError(err instanceof Error ? err.message : 'Erro desconhecido');
			} finally {
				setIsLoading(false);
				setIsFilterLoading(false);
			}
		};

		loadResults();
	}, [jobId, currentPage, pageSize, filters, searchParams]);

	const handleExport = async (format: 'csv' | 'json') => {
		if (!jobId) return;
		
		try {
			await api.exportResults(jobId, format);
		} catch (e) {
			console.error('Erro ao exportar:', e);
			// Fallback local caso o endpoint falhe
			if (results) {
				const content = format === 'csv' ? exportData.toCSV(results) : exportData.toJSON(results);
				exportData.download(content, `divergencias_${jobId}.${format}`, format === 'csv' ? 'text/csv' : 'application/json');
			}
		}
	};

	const handleFiltersChange = useCallback((newFilters: ResultsFilters) => {
		setSearchParams(prev => {
			const params = new URLSearchParams(prev);
			
			// Reset to page 1 when filters change
			params.set('page', '1');
			
			// Update filter parameters
			if (newFilters.filter) {
				params.set('filter', newFilters.filter);
			} else {
				params.delete('filter');
			}
			
			if (newFilters.type) {
				params.set('type', newFilters.type);
			} else {
				params.delete('type');
			}
			
			if (newFilters.value) {
				params.set('value', newFilters.value);
			} else {
				params.delete('value');
			}
			
			return params;
		});
	}, [setSearchParams]);

	const handlePageChange = useCallback((page: number) => {
		setSearchParams(prev => {
			const params = new URLSearchParams(prev);
			params.set('page', page.toString());
			return params;
		});
	}, [setSearchParams]);

	const handlePageSizeChange = useCallback((size: number) => {
		setSearchParams(prev => {
			const params = new URLSearchParams(prev);
			params.set('pageSize', size.toString());
			params.set('page', '1'); // Reset to page 1 when page size changes
			return params;
		});
	}, [setSearchParams]);

	const handleCopyLink = async () => {
		const url = window.location.href;
		const success = await copyToClipboard(url);
		
		if (success) {
			console.log('Link copiado para clipboard');
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 relative overflow-hidden">
				<Header />
				<main className="relative z-10 container mx-auto py-16 px-4">
					<div className="flex items-center justify-center min-h-[400px]">
						<div className="flex flex-col items-center space-y-6">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
							<p className="text-purple-200 text-lg">Carregando resultados...</p>
						</div>
					</div>
				</main>
			</div>
		);
	}

	if (error || !results) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 relative overflow-hidden">
				<Header />
				<main className="relative z-10 container mx-auto py-16 px-4">
					<div className="max-w-2xl mx-auto text-center space-y-8">
						<div className="flex items-center justify-center w-20 h-20 mx-auto bg-red-500/10 rounded-3xl border border-red-500/20">
							<FileText className="h-10 w-10 text-red-400" />
						</div>
						<h1 className="text-3xl font-bold text-white">Erro ao carregar resultados</h1>
						<p className="text-purple-200 text-lg">{error}</p>
						<button
							onClick={() => navigate('/')}
							className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
						>
							Voltar ao início
						</button>
					</div>
				</main>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 relative overflow-hidden">
			<Header />
			
			<main className="relative z-10 container mx-auto py-16 px-4">
				<div className="max-w-7xl mx-auto space-y-12">
					{/* Header */}
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
						<button
							onClick={() => navigate('/')}
							className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-300 border border-white/10 hover:border-white/20"
						>
							<ArrowLeft className="h-4 w-4" />
							<span className="text-sm font-medium">Voltar ao início</span>
						</button>
						
						<div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
							<button
								onClick={() => handleExport('csv')}
								className="flex items-center justify-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30"
							>
								<Download className="h-4 w-4" />
								<span className="text-sm font-medium">Exportar CSV</span>
							</button>
							<button
								onClick={() => handleExport('json')}
								className="flex items-center justify-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30"
							>
								<Download className="h-4 w-4" />
								<span className="text-sm font-medium">Exportar JSON</span>
							</button>
							<button
								onClick={handleCopyLink}
								className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
							>
								<Share2 className="h-4 w-4" />
								<span className="text-sm font-medium">Compartilhar</span>
							</button>
						</div>
					</div>

					{/* Metrics Cards */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						<div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
							<div className="flex items-center space-x-3">
								<div className="flex items-center justify-center w-10 h-10 bg-red-500/20 rounded-xl">
									<BarChart3 className="h-5 w-5 text-red-400" />
								</div>
								<div>
									<p className="text-sm text-purple-200">Total de Divergências</p>
									<p className="text-2xl font-bold text-white">
										{formatNumber(results.summary.mismatched + results.summary.missing_in_api + results.summary.missing_in_csv)}
									</p>
								</div>
							</div>
						</div>
						
						<div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
							<div className="flex items-center space-x-3">
								<div className="flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-xl">
									<TrendingUp className="h-5 w-5 text-green-400" />
								</div>
								<div>
									<p className="text-sm text-purple-200">Produtos Corretos</p>
									<p className="text-2xl font-bold text-white">
										{formatNumber(results.summary.matched)}
									</p>
								</div>
							</div>
						</div>
						
						<div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
							<div className="flex items-center space-x-3">
								<div className="flex items-center justify-center w-10 h-10 bg-purple-500/20 rounded-xl">
									<Clock className="h-5 w-5 text-purple-400" />
								</div>
								<div>
									<p className="text-sm text-purple-200">Tempo Total</p>
									<p className="text-2xl font-bold text-white">
										{formatTime(metrics.totalProcessTime)}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Detailed Summary - Single Card */}
					<div className="p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
						<h3 className="text-xl font-bold text-white mb-6">Resumo da Comparação</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{/* Left Column - Basic Stats */}
							<div className="space-y-4">
								<h4 className="text-lg font-semibold text-purple-200 mb-4">Estatísticas Gerais</h4>
								<div className="space-y-3">
									<div className="flex justify-between items-center py-2 border-b border-white/10">
										<span className="text-purple-200">Total de produtos na API:</span>
										<span className="font-semibold text-white">{formatNumber(results.summary.total_api_items)}</span>
									</div>
									<div className="flex justify-between items-center py-2 border-b border-white/10">
										<span className="text-purple-200">Total de produtos no CSV:</span>
										<span className="font-semibold text-white">{formatNumber(results.summary.total_csv_items)}</span>
									</div>
									<div className="flex justify-between items-center py-2 border-b border-white/10">
										<span className="text-green-400">Produtos corretos:</span>
										<span className="font-semibold text-green-400">{formatNumber(results.summary.matched)}</span>
									</div>
									<div className="flex justify-between items-center py-2">
										<span className="text-orange-400">Total de divergências:</span>
										<span className="font-semibold text-orange-400">{formatNumber(results.summary.mismatched + results.summary.missing_in_api + results.summary.missing_in_csv)}</span>
									</div>
								</div>
							</div>
							
							{/* Right Column - Divergence Breakdown */}
							<div className="space-y-4">
								<h4 className="text-lg font-semibold text-purple-200 mb-4">Detalhamento das Divergências</h4>
								<div className="space-y-3">
									<div className="flex justify-between items-center py-2 border-b border-white/10">
										<span className="text-purple-200">Divergências de dados:</span>
										<span className="font-semibold text-orange-400">
											{formatNumber(results.summary.mismatched)}
										</span>
									</div>
									<div className="flex justify-between items-center py-2 border-b border-white/10">
										<span className="text-purple-200">Faltando na API:</span>
										<span className="font-semibold text-red-400">
											{formatNumber(results.summary.missing_in_api)}
										</span>
									</div>
									<div className="flex justify-between items-center py-2">
										<span className="text-purple-200">Faltando no CSV:</span>
										<span className="font-semibold text-blue-400">
											{formatNumber(results.summary.missing_in_csv)}
										</span>
									</div>
								</div>
								
								{/* Success Rate */}
								<div className="mt-6 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
									<div className="text-center">
										<div className="text-2xl font-bold text-green-400">
											{results.summary.total_csv_items > 0 ? ((results.summary.matched / results.summary.total_csv_items) * 100).toFixed(1) : '0'}%
										</div>
										<div className="text-sm text-green-300">Taxa de Sucesso</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Divergence Chart */}
					<DivergenceChart data={results} />

					{/* Divergences Table */}
					<div className="p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl relative">
						{/* Loading overlay for filter updates */}
						{isFilterLoading && (
							<div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10">
								<div className="bg-white/10 rounded-2xl px-6 py-4 flex items-center gap-3">
									<div className="animate-spin w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full"></div>
									<span className="text-white font-medium">Filtrando resultados...</span>
								</div>
							</div>
						)}
						
						<h3 className="text-xl font-bold text-white mb-6">Divergências Encontradas</h3>
						<DivergencesTable
							errors={results?.errors || []}
							currentPage={currentPage}
							pageSize={pageSize}
							totalPages={pagination?.total_pages || 1}
							totalItems={pagination?.total_items || 0}
							onPageChange={handlePageChange}
							onPageSizeChange={handlePageSizeChange}
							onFiltersChange={handleFiltersChange}
							initialFilters={filters}
						/>
					</div>
				</div>
			</main>
		</div>
	);
}
