import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';

interface RequestDistributionChartProps {
  successful: number;
  failed: number;
}

const COLORS = {
  success: '#16a34a', // green-600
  failed: '#dc2626', // red-600
};

function RequestDistributionChart({ successful, failed }: RequestDistributionChartProps) {
  const { t } = useTranslation('dashboard');

  const data = [
    { name: t('analytics.metrics.successful'), value: successful, color: COLORS.success },
    { name: t('analytics.metrics.failed'), value: failed, color: COLORS.failed },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-theme-text-tertiary">
        {t('analytics.noData')}
      </div>
    );
  }

  return (
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
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => (typeof value === 'number' ? value.toLocaleString() : value)}
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
  );
}

export default RequestDistributionChart;
