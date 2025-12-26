'use client';

import React from 'react';
import {
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart } from 'lucide-react';

type UnitDistributionChartProps = {
  data: { name: string; value: number }[];
  isLoading: boolean;
};

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full">
      <div className="flex flex-col items-center gap-2 text-center">
        <PieChart className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-2xl font-bold tracking-tight">No Data Available</h3>
        <p className="text-sm text-muted-foreground">
          There is no data to display for the selected filters.
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-[350px] w-full" />
    </div>
  );
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't render label for small slices

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


export function UnitDistributionChart({ data, isLoading }: UnitDistributionChartProps) {
  const chartConfig = {
    value: {
      label: 'Tests',
    },
    ...data.reduce((acc, item) => {
        acc[item.name] = { label: item.name };
        return acc;
    }, {} as any)
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <LoadingState />
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card className="min-h-[445px] flex">
        <CardContent className="p-6 flex-1 flex">
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phân bố xét nghiệm theo đơn vị</CardTitle>
        <CardDescription>
          Số lượng xét nghiệm được thực hiện tại mỗi đơn vị.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[350px]"
        >
          <RechartsPieChart>
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="name" />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Pie>
          </RechartsPieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
