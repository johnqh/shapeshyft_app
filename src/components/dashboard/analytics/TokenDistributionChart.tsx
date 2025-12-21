import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';

interface TokenDistributionChartProps {
  inputTokens: number;
  outputTokens: number;
}

const COLORS = {
  input: '#3b82f6', // blue-600
  output: '#10b981', // green-600
};

function TokenDistributionChart({ inputTokens, outputTokens }: TokenDistributionChartProps) {
  const { t } = useTranslation('dashboard');

  const total = inputTokens + outputTokens;

  const data = [
    { name: t('analytics.metrics.inputTokens'), value: inputTokens, color: COLORS.input },
    { name: t('analytics.metrics.outputTokens'), value: outputTokens, color: COLORS.output },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-theme-text-tertiary">
        {t('analytics.noData')}
      </div>
    );
  }

  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => (typeof value === 'number' ? formatValue(value) : value)}
            contentStyle={{
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              color: 'var(--color-text-primary)',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center text-sm text-theme-text-secondary mt-2">
        {t('analytics.metrics.tokensUsed')}: {formatValue(total)}
      </div>
    </div>
  );
}

export default TokenDistributionChart;
