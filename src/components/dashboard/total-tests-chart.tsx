'use client';

import React from 'react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
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
  ChartLegendContent
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3 } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';

type TotalTestsChartProps = {
  data: { date: string; total: number; mindray: number }[];
  isLoading: boolean;
};

function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full">
      <div className="flex flex-col items-center gap-2 text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground" />
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

export function TotalTestsChart({ data, isLoading }: TotalTestsChartProps) {
    const chartConfig = {
        total: {
          label: 'Total Tests',
          color: 'hsl(var(--chart-1))',
        },
        mindray: {
            label: 'Mindray Tests',
            color: 'hsl(var(--chart-2))',
        }
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
            <CardTitle>Xu hướng xét nghiệm theo ngày</CardTitle>
            <CardDescription>
            Số lượng xét nghiệm được thực hiện mỗi ngày.
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
        <CardTitle>Xu hướng xét nghiệm theo ngày</CardTitle>
        <CardDescription>
          Số lượng xét nghiệm được thực hiện mỗi ngày.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => {
                    try {
                        const date = parseISO(value);
                        if(isValid(date)) return format(date, 'MMM d');
                    } catch (e) {
                        return value;
                    }
                    return value;
                }}
              />
              <YAxis />
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Legend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="var(--color-total)"
                strokeWidth={2}
                dot={true}
              />
              <Line
                type="monotone"
                dataKey="mindray"
                stroke="var(--color-mindray)"
                strokeWidth={2}
                dot={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
