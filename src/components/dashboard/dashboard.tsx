'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getTableData } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { addDays, differenceInDays, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

function DashboardHeader() {
  return (
    <div className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <Icons.logo className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-semibold md:text-xl font-headline">Dashboard</h1>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTable] = useState<string>('mindray_trans');
  const { toast } = useToast();

  // Date range states
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [sliderRange, setSliderRange] = useState([0, 100]);
  
  // Memoize min and max dates from data
  const { minDate, maxDate } = useMemo(() => {
    if (data.length === 0) return { minDate: undefined, maxDate: undefined };
    let min = new Date(data[0].ngay_vao_so);
    let max = new Date(data[0].ngay_vao_so);
    for (const item of data) {
      const d = new Date(item.ngay_vao_so);
      if (d < min) min = d;
      if (d > max) max = d;
    }
    return { minDate: min, maxDate: max };
  }, [data]);
  
  // Set initial date range when data is loaded
  useEffect(() => {
    if (minDate && maxDate) {
      setDateRange({ from: minDate, to: maxDate });
      const totalDays = differenceInDays(maxDate, minDate);
      setSliderRange([0, totalDays]);
    }
  }, [minDate, maxDate]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const tableData = await getTableData(currentTable);
        setData(tableData);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Failed to fetch data',
          description: `Could not load data for table: ${currentTable}`,
        });
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentTable, toast]);

  useEffect(() => {
    if (data.length > 0 && dateRange?.from && dateRange?.to) {
      const filtered = data.filter(item => {
        if (!item.ngay_vao_so) return false;
        const itemDate = new Date(item.ngay_vao_so.split(' ')[0]);
        return itemDate >= dateRange.from! && itemDate <= dateRange.to!;
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [dateRange, data]);

  const handleSliderChange = (value: number[]) => {
    if (minDate) {
      const newFrom = addDays(minDate, value[0]);
      const newTo = addDays(minDate, value[1]);
      setDateRange({ from: newFrom, to: newTo });
      setSliderRange(value);
    }
  };
  
  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    if (newRange?.from && newRange?.to && minDate) {
        setDateRange(newRange);
        const fromDay = differenceInDays(newRange.from, minDate);
        const toDay = differenceInDays(newRange.to, minDate);
        setSliderRange([fromDay, toDay]);
    } else {
       setDateRange(newRange);
    }
  }

  const totalDays = minDate && maxDate ? differenceInDays(maxDate, minDate) : 0;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader />
      <main className="flex-1 p-4 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <DateRangePicker
            date={dateRange}
            onDateChange={handleDateRangeChange}
            disabled={isLoading || !minDate}
          />
          <div className="flex-1 w-full md:w-auto">
            {minDate && maxDate && (
              <div className="flex items-center gap-4">
                 <Label htmlFor="date-slider" className="min-w-fit">Date Range</Label>
                 <Slider
                    id="date-slider"
                    min={0}
                    max={totalDays}
                    value={sliderRange}
                    onValueChange={handleSliderChange}
                    disabled={isLoading || !minDate}
                    className="w-full"
                 />
              </div>
            )}
          </div>
        </div>
        {/* Dashboard trống, sẵn sàng để thêm biểu đồ mới */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Các thành phần biểu đồ mới sẽ được thêm vào đây */}
        </div>
      </main>
    </div>
  );
}
