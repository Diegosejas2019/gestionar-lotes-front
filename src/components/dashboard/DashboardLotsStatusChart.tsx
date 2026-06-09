import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DashboardSummary } from '../../types';
import { EmptyState } from '../EmptyState';
import {
  CATEGORY_COLORS,
  CHART_AXIS_STROKE,
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  ChartTooltip,
  formatCompactNumber,
} from '../charts/chartTheme';

type Props = {
  summary: DashboardSummary | null;
};

const STATUS_ITEMS = [
  { key: 'available', label: 'Disponibles', fallback: 'availableLots' },
  { key: 'reserved', label: 'Reservados', fallback: 'reservedLots' },
  { key: 'sold', label: 'Vendidos', fallback: 'soldLots' },
  { key: 'blocked', label: 'Bloqueados', fallback: 'blockedLots' },
  { key: 'cancelled', label: 'Cancelados', fallback: 'cancelledLots' },
  { key: 'deeded', label: 'Escriturados', fallback: 'deededLots' },
] as const;

export function DashboardLotsStatusChart({ summary }: Props): React.ReactElement {
  const chartData = STATUS_ITEMS.map((item) => ({
    label: item.label,
    count: Number(summary?.lotsByStatus?.[item.key] ?? summary?.[item.fallback] ?? 0),
  })).filter((item) => item.count > 0);

  if (!summary || chartData.length === 0) return <EmptyState title="Sin lotes para mostrar por estado." />;

  return (
    <div className="dashboard-chart-block">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} layout="vertical" barCategoryGap={10} margin={{ top: 8, right: 18, left: 18, bottom: 8 }}>
          <CartesianGrid strokeDasharray="4 6" stroke={CHART_GRID_STROKE} horizontal={false} />
          <XAxis
            type="number"
            tick={CHART_AXIS_TICK}
            tickFormatter={(value) => formatCompactNumber(Number(value))}
            axisLine={{ stroke: CHART_AXIS_STROKE }}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ ...CHART_AXIS_TICK, fontSize: 11 }}
            width={112}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(123, 139, 255, 0.08)' }}
            content={({ active, payload }) => {
              const point = payload?.[0]?.payload as { label: string; count: number } | undefined;
              if (!point) return null;

              return (
                <ChartTooltip
                  active={active}
                  title={point.label}
                  rows={[{ label: 'Lotes', value: point.count, color: payload?.[0]?.color }]}
                />
              );
            }}
          />
          <Bar dataKey="count" name="Lotes" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {chartData.map((_, index) => (
              <Cell key={index} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
