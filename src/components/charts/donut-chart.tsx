'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { CHART_SERIES_COLORS } from '@/lib/colors';
import { ChartTitle } from './chart-title';

interface DonutChartProps {
  title: string;
  titleTooltip?: string;
  data: { name: string; value: number }[];
  colors?: string[];
  showPercentage?: boolean;
  height?: number;
}

export function DonutChart({
  title,
  data,
  colors = CHART_SERIES_COLORS,
  showPercentage = true,
  height = 280,
  titleTooltip,
}: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="p-4 h-full">
      <ChartTitle title={title} tooltip={titleTooltip} />
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            dataKey="value"
            label={showPercentage}
            labelLine={showPercentage}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [
              (value as number).toLocaleString('nl-NL'),
            ]}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
