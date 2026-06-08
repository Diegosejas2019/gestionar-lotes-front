import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CommercialFunnelEvolutionPoint } from '../../types';
import { EmptyState } from '../EmptyState';
import {
  CHART_AXIS_STROKE,
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  ChartTooltip,
  formatCompactNumber,
  formatMonthLabel,
} from '../charts/chartTheme';

type Props = {
  data: CommercialFunnelEvolutionPoint[];
};

const SERIES = [
  { key: 'leads', label: 'Leads', color: '#7dd3fc' },
  { key: 'quotations', label: 'Cotizaciones', color: '#a78bfa' },
  { key: 'reservations', label: 'Reservas', color: '#fbbf24' },
  { key: 'sales', label: 'Ventas', color: '#4ade80' },
] as const;

export function CommercialFunnelEvolutionChart({ data }: Props): React.ReactElement {
  if (data.length === 0) return <EmptyState title="Sin datos suficientes para mostrar la evolución comercial." />;

  return (
    <div className="commercial-chart-block">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 10, right: 18, left: 4, bottom: 8 }}>
          <CartesianGrid strokeDasharray="4 6" stroke={CHART_GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonthLabel}
            tick={CHART_AXIS_TICK}
            axisLine={{ stroke: CHART_AXIS_STROKE }}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tick={CHART_AXIS_TICK}
            tickFormatter={(value) => formatCompactNumber(Number(value))}
            axisLine={false}
            tickLine={false}
            width={40}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ stroke: 'rgba(226, 232, 240, 0.24)', strokeDasharray: '4 4' }}
            content={({ active, payload, label }) => {
              const point = payload?.[0]?.payload as CommercialFunnelEvolutionPoint | undefined;
              if (!point) return null;

              return (
                <ChartTooltip
                  active={active}
                  title={formatMonthLabel(String(label))}
                  rows={SERIES.map((series) => ({
                    label: series.label,
                    value: point[series.key],
                    color: series.color,
                  }))}
                />
              );
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={28}
            iconType="circle"
            wrapperStyle={{ color: 'var(--text-muted)', fontSize: 12, paddingTop: 10 }}
          />
          {SERIES.map((series) => (
            <Line
              key={series.key}
              type="monotone"
              dataKey={series.key}
              name={series.label}
              stroke={series.color}
              strokeWidth={2.3}
              dot={{ r: 2.5, fill: 'var(--surface)', stroke: series.color, strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: series.color, stroke: 'var(--surface)', strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
