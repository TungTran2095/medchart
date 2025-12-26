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
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: any) => {
  // Tính toán vị trí bên ngoài chart - tăng khoảng cách để có nhiều không gian hơn
  const radius = outerRadius + 60; // 60px bên ngoài chart để có không gian cho label
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.005) return null; // Don't render label for very small slices (< 0.5%)

  const textAnchor = x > cx ? 'start' : 'end';
  const lineHeight = 16;
  const fontSize = 12;

  return (
    <g>
      {/* Line từ slice đến label */}
      <line
        x1={cx + outerRadius * Math.cos(-midAngle * RADIAN)}
        y1={cy + outerRadius * Math.sin(-midAngle * RADIAN)}
        x2={x}
        y2={y}
        stroke="hsl(var(--muted-foreground))"
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={y - lineHeight / 2}
        fill="hsl(var(--foreground))"
        textAnchor={textAnchor}
        fontSize={fontSize}
        fontWeight={500}
        className="select-none"
      >
        <tspan x={x} dy="0" fontSize={fontSize}>{name}</tspan>
        <tspan x={x} dy={lineHeight} fontSize={fontSize - 1} fill="hsl(var(--muted-foreground))">
          {value.toLocaleString('vi-VN')} ({(percent * 100).toFixed(1)}%)
        </tspan>
      </text>
    </g>
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
        <CardHeader>
           <Skeleton className="h-8 w-3/4" />
           <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="p-6">
          <LoadingState />
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card className="min-h-[445px] flex">
        <CardHeader>
            <CardTitle>Phân bố xét nghiệm theo đơn vị</CardTitle>
            <CardDescription>
            Số lượng xét nghiệm được thực hiện tại mỗi đơn vị.
            </CardDescription>
        </CardHeader>
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
      <CardContent className="p-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto w-full"
          style={{ minHeight: '600px', height: '600px' }}
        >
          <ResponsiveContainer width="100%" height={600}>
            <RechartsPieChart margin={{ top: 40, right: 200, bottom: 40, left: 200 }}>
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="name" />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={180}
              strokeWidth={5}
              labelLine={true}
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
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
