import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';

interface EndpointData {
  endpoint_id: string;
  endpoint_name: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
}

interface EndpointRequestsChartProps {
  endpoints: EndpointData[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

function EndpointRequestsChart({ endpoints }: EndpointRequestsChartProps) {
  const { t } = useTranslation('dashboard');

  if (endpoints.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-theme-text-tertiary">
        {t('analytics.noData')}
      </div>
    );
  }

  const data = endpoints.map((ep, index) => ({
    name: ep.endpoint_name.length > 15 ? ep.endpoint_name.slice(0, 15) + '...' : ep.endpoint_name,
    fullName: ep.endpoint_name,
    requests: ep.total_requests,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, endpoints.length * 40)}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
        <XAxis type="number" />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value) => (typeof value === 'number' ? value.toLocaleString() : value)}
          contentStyle={{
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
          }}
        />
        <Bar dataKey="requests" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default EndpointRequestsChart;
