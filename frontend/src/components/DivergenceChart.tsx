import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ComparisonResult } from '@/lib/types';

interface DivergenceChartProps {
  data: ComparisonResult;
}

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export function DivergenceChart({ data }: DivergenceChartProps) {
  // Use the correct data from the API response
  const totalErrors = data.summary.mismatched + data.summary.missing_in_api + data.summary.missing_in_csv;
  const totalProcessed = data.summary.total_csv_items;
  const validItems = data.summary.matched;
  
  const chartData = [
    {
      name: 'Produtos com divergências',
      value: totalErrors,
      color: '#ef4444'
    },
    {
      name: 'Produtos sem divergências',
      value: validItems,
      color: '#10b981'
    }
  ];

  // Group errors by category for the second chart
  const categoryData = data.errors.reduce((acc, error) => {
    const category = error.fields?.categoria?.csv || 'Sem categoria';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData).map(([category, count], index) => ({
    name: category,
    value: count,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-8">
      {/* General Divergences Chart - Full Width */}
      <div className="p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-4">Divergências Gerais</h3>
        <p className="text-purple-200 mb-8 text-lg">
          Distribuição de produtos com e sem divergências
        </p>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
              <Legend 
                wrapperStyle={{
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Divergences Chart - Full Width */}
      <div className="p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-4">Divergências por Categoria</h3>
        <p className="text-purple-200 mb-8 text-lg">
          Distribuição de erros por categoria de produto
        </p>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
              <Legend 
                wrapperStyle={{
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Metrics - Full Width */}
      <div className="p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-4">Métricas de Performance</h3>
        <p className="text-purple-200 mb-8 text-lg">
          Tempos de processamento e estatísticas de validação
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-3xl font-bold text-white mb-2">
              {totalProcessed}
            </div>
            <div className="text-sm text-purple-200">Total processado</div>
          </div>
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {validItems}
            </div>
            <div className="text-sm text-purple-200">Válidos</div>
          </div>
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {totalErrors}
            </div>
            <div className="text-sm text-purple-200">Com erros</div>
          </div>
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {totalProcessed > 0 ? ((validItems / totalProcessed) * 100).toFixed(1) : '0'}%
            </div>
            <div className="text-sm text-purple-200">Taxa de sucesso</div>
          </div>
        </div>
      </div>
    </div>
  );
}
