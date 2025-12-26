'use client';

import React from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LabelList,
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
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';

type TestDistributionBarChartProps = {
  data: { name: string; value: number }[];
  isLoading: boolean;
};

function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full min-h-[350px]">
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

export function TestDistributionBarChart({ data, isLoading }: TestDistributionBarChartProps) {
  const [scrollPosition, setScrollPosition] = React.useState(0);
  
  const chartConfig = {
    value: {
      label: 'Số lượng',
      color: 'hsl(var(--chart-1))',
    },
  };

  // Sắp xếp theo value giảm dần
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  
  // Hiển thị 5 items mỗi lần
  const itemsPerPage = 5;
  const startIndex = Math.floor(scrollPosition / itemsPerPage) * itemsPerPage;
  const displayData = sortedData.slice(startIndex, startIndex + itemsPerPage);

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
          <CardTitle>Phân bố xét nghiệm theo loại</CardTitle>
          <CardDescription>
            Số lượng xét nghiệm được thực hiện theo từng loại xét nghiệm.
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
        <CardTitle>Phân bố xét nghiệm theo loại</CardTitle>
        <CardDescription>
          Số lượng xét nghiệm được thực hiện theo từng loại xét nghiệm (Hiển thị {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedData.length)} / {sortedData.length}).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChartContainer config={chartConfig} className="w-full">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart 
              data={displayData}
              layout="vertical"
              margin={{ top: 5, right: 100, left: 20, bottom: 5 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={180}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => {
                  // Rút ngắn tên nếu quá dài
                  if (value.length > 35) {
                    return value.substring(0, 32) + '...';
                  }
                  return value;
                }}
              />
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar 
                dataKey="value" 
                fill="var(--color-value)" 
                radius={[0, 4, 4, 0]}
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="var(--color-value)" />
                ))}
                <LabelList 
                  dataKey="value" 
                  position="right"
                  formatter={(value: number) => value.toLocaleString('vi-VN')}
                  style={{ fontSize: '11px', fill: 'hsl(var(--muted-foreground))' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Scroll area với pagination */}
        {sortedData.length > itemsPerPage && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Trang {Math.floor(startIndex / itemsPerPage) + 1} / {Math.ceil(sortedData.length / itemsPerPage)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScrollPosition(Math.max(0, startIndex - itemsPerPage))}
                  disabled={startIndex === 0}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScrollPosition(Math.min(startIndex + itemsPerPage, sortedData.length - itemsPerPage))}
                  disabled={startIndex + itemsPerPage >= sortedData.length}
                >
                  Sau
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

