import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { LeadSource } from '../../types';
import { leadSourceLabels } from '../../utils/labels';
import { EmptyState } from '../EmptyState';
import {
  CATEGORY_COLORS,
  CHART_AXIS_STROKE,
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  ChartTooltip,
  formatCompactNumber,
} from '../charts/chartTheme';

type GroupItem = { _id: string; count: number };

type Props = {
  data: GroupItem[];
};

export function CommercialLeadsBySourceChart({ data }: Props): React.ReactElement {
  if (data.length === 0) return <EmptyState title="Sin datos de leads por origen." />;

  const chartData = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((item) => ({
      ...item,
      label: leadSourceLabels[item._id as LeadSource] || item._id || 'Sin origen',
    }));

  return (
    <div className="commercial-chart-block">
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
            width={118}
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
                  rows={[{ label: 'Cantidad', value: point.count, color: payload?.[0]?.color }]}
                />
              );
            }}
          />
          <Bar dataKey="count" name="Cantidad" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {chartData.map((_, index) => (
              <Cell key={index} fill={CATEGORY_COLORS[(index + 2) % CATEGORY_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
