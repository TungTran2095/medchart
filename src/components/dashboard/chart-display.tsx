'use client';

import React from 'react';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
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
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import type { ChartDataConfig } from '@/lib/types';
import { BarChart3 } from 'lucide-react';

type ChartDisplayProps = {
  data: any[];
  config: ChartDataConfig | null;
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
        <BarChart3 className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-2xl font-bold tracking-tight">No Chart Generated</h3>
        <p className="text-sm text-muted-foreground">
          Select a table and columns to visualize your data.
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

export function ChartDisplay({ data, config, isLoading }: ChartDisplayProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <LoadingState />
        </CardContent>
      </Card>
    );
  }

  if (!config || !data.length) {
    return (
      <Card className="min-h-[445px] flex">
        <CardContent className="p-6 flex-1 flex">
          <EmptyState />
        </CardContent>
      </Card>
    );
  }
  
  const chartTitle = `Chart: ${config.chartType.charAt(0).toUpperCase() + config.chartType.slice(1)} view`;

  const renderChart = () => {
    switch (config.chartType) {
      case 'bar':
        if (!config.xAxis || !config.yAxis) return <p>Invalid bar chart configuration.</p>;
        return (
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={config.xAxis}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey={config.yAxis} fill="var(--color-fill)" radius={4} />
          </BarChart>
        );
      case 'line':
        if (!config.xAxis || !config.yAxis) return <p>Invalid line chart configuration.</p>;
        return (
          <LineChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={config.xAxis}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Line
              type="monotone"
              dataKey={config.yAxis}
              stroke="var(--color-stroke)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        );
      case 'pie':
        if (!config.valueColumn || !config.labelColumn) return <p>Invalid pie chart configuration.</p>;
        return (
          <RechartsPieChart>
            <Tooltip content={<ChartTooltipContent nameKey={config.labelColumn} />} />
            <Pie
              data={data}
              dataKey={config.valueColumn}
              nameKey={config.labelColumn}
              cx="50%"
              cy="50%"
              outerRadius={120}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey={config.labelColumn} />} />
          </RechartsPieChart>
        );
      default:
        return <p>Unsupported chart type.</p>;
    }
  };

  const chartConfigObject = {
    [config.yAxis || config.valueColumn || 'value']: {
      label: config.yAxis || config.valueColumn,
      color: 'hsl(var(--chart-1))',
    },
    [config.xAxis || 'x']: {
        label: config.xAxis,
    },
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{chartTitle}</CardTitle>
        <CardDescription>
          {config.chartType === 'pie' ? `Distribution by ${config.labelColumn}` : `Relationship between ${config.xAxis} and ${config.yAxis}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfigObject} className="min-h-[350px] w-full">
          <ResponsiveContainer width="100%" height={350}>
            {renderChart()}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
