'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getTableData } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { addDays, differenceInDays, format, parseISO, isValid } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ListFilter } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TotalTestsChart } from './total-tests-chart';
import { UnitDistributionChart } from './unit-distribution-chart';

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

  // Unit filter states
  const [allUnits, setAllUnits] = useState<string[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>(['all']);

  // Test name filter states
  const [allTestNames, setAllTestNames] = useState<string[]>([]);
  const [selectedTestNames, setSelectedTestNames] = useState<string[]>(['all']);

  // isMindray filter state
  const [isMindrayOnly, setIsMindrayOnly] = useState(true);


  // Memoize min and max dates from data
  const { minDate, maxDate } = useMemo(() => {
    if (data.length === 0) return { minDate: undefined, maxDate: undefined };
    let min: Date | undefined;
    let max: Date | undefined;
    for (const item of data) {
      if (!item.ngay_vao_so) continue;
      try {
        const d = parseISO(item.ngay_vao_so.split(' ')[0]);
        if (isValid(d)) {
          if (!min || d < min) min = d;
          if (!max || d > max) max = d;
        }
      } catch(e) {
        // Ignore invalid dates
      }
    }
    return { minDate: min, maxDate: max };
  }, [data]);
  
  // Set initial date range and extract unique values for filters when data is loaded
  useEffect(() => {
    if (data.length > 0 && minDate && maxDate) {
      setDateRange({ from: minDate, to: maxDate });
      const totalDays = differenceInDays(maxDate, minDate);
      setSliderRange([0, totalDays]);
      
      const units = [...new Set(data.map(item => item.ten_don_vi).filter(Boolean))].sort();
      setAllUnits(units);
      
      const testNames = [...new Set(data.map(item => item.ten_xet_nghiem).filter(Boolean))].sort();
      setAllTestNames(testNames);
    }
  }, [data, minDate, maxDate]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const tableData = await getTableData(currentTable);
        setData(tableData);
        setFilteredData(tableData); // Initialize filtered data
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

  // Filtering logic
  useEffect(() => {
    if (isLoading) return; // Don't filter until data is loaded
    
    let newFilteredData = [...data];

    // Date filtering
    if (dateRange?.from && dateRange?.to) {
      newFilteredData = newFilteredData.filter(item => {
        if (!item.ngay_vao_so) return false;
        try {
          const itemDate = parseISO(item.ngay_vao_so.split(' ')[0]);
          return isValid(itemDate) && itemDate >= dateRange.from! && itemDate <= dateRange.to!;
        } catch (e) {
          return false;
        }
      });
    }

    // Unit filtering
    if (!selectedUnits.includes('all') && selectedUnits.length > 0) {
        newFilteredData = newFilteredData.filter(item => 
            item.ten_don_vi && selectedUnits.includes(item.ten_don_vi)
        );
    }

    // Test name filtering
    if (!selectedTestNames.includes('all') && selectedTestNames.length > 0) {
        newFilteredData = newFilteredData.filter(item => 
            item.ten_xet_nghiem && selectedTestNames.includes(item.ten_xet_nghiem)
        );
    }

    // isMindray filtering
    if (isMindrayOnly) {
        newFilteredData = newFilteredData.filter(item => {
            const value = item.isMindray;
            return value === true || value === 1 || String(value).toLowerCase() === 'true' || String(value) === '1';
        });
    }
    
    setFilteredData(newFilteredData);
  }, [dateRange, selectedUnits, selectedTestNames, isMindrayOnly, data, isLoading]);


  const handleSliderChange = (value: number[]) => {
    if (minDate) {
      const newFrom = addDays(minDate, value[0]);
      const newTo = addDays(minDate, value[1]);
      setDateRange({ from: newFrom, to: newTo });
      setSliderRange(value);
    }
  };
  
  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    if (newRange?.from && newRange?.to && minDate && maxDate) {
        const fromDay = differenceInDays(newRange.from, minDate);
        const toDay = differenceInDays(newRange.to, minDate);
        // Ensure slider values are within bounds
        const newSliderFrom = Math.max(0, fromDay);
        const newSliderTo = Math.min(differenceInDays(maxDate, minDate), toDay);
        setSliderRange([newSliderFrom, newSliderTo]);
    }
    setDateRange(newRange);
  }

  const handleUnitSelection = (unit: string) => {
    setSelectedUnits(prev => {
        if (unit === 'all') {
            return prev.includes('all') ? [] : ['all'];
        }

        let newSelection = prev.filter(u => u !== 'all');

        if (newSelection.includes(unit)) {
            newSelection = newSelection.filter(u => u !== unit);
        } else {
            newSelection.push(unit);
        }
        
        if (newSelection.length === 0 || newSelection.length === allUnits.length) return ['all'];

        return newSelection;
    });
  };

  const handleTestNameSelection = (testName: string) => {
    setSelectedTestNames(prev => {
        if (testName === 'all') {
            return prev.includes('all') ? [] : ['all'];
        }

        let newSelection = prev.filter(t => t !== 'all');

        if (newSelection.includes(testName)) {
            newSelection = newSelection.filter(t => t !== testName);
        } else {
            newSelection.push(testName);
        }
        
        if (newSelection.length === 0 || newSelection.length === allTestNames.length) return ['all'];

        return newSelection;
    });
  };
  
  const dailyCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    filteredData.forEach(item => {
      if (item.ngay_vao_so) {
        try {
          const date = item.ngay_vao_so.split(' ')[0];
          if (isValid(parseISO(date))) {
            const formattedDate = format(parseISO(date), 'yyyy-MM-dd');
            counts[formattedDate] = (counts[formattedDate] || 0) + 1;
          }
        } catch(e) {
          // ignore
        }
      }
    });

    return Object.keys(counts).map(date => ({
      date,
      count: counts[date]
    })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredData]);

  const unitCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    filteredData.forEach(item => {
      if (item.ten_don_vi) {
        counts[item.ten_don_vi] = (counts[item.ten_don_vi] || 0) + 1;
      }
    });

    return Object.keys(counts).map(unitName => ({
      name: unitName,
      value: counts[unitName]
    })).sort((a,b) => b.value - a.value);
  }, [filteredData]);


  const totalDays = minDate && maxDate ? differenceInDays(maxDate, minDate) : 0;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader />
      <main className="flex-1 p-4 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <ListFilter className="h-4 w-4" />
                  <span>Đơn vị</span>
                  {selectedUnits.length > 0 && !selectedUnits.includes('all') && (
                    <span className="ml-2 rounded-full bg-primary px-2 text-xs text-primary-foreground">
                      {selectedUnits.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" onCloseAutoFocus={(e) => e.preventDefault()}>
                <DropdownMenuLabel>Lọc theo đơn vị</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-40">
                  <DropdownMenuCheckboxItem
                      checked={selectedUnits.includes('all')}
                      onCheckedChange={() => handleUnitSelection('all')}
                  >
                      Tất cả
                  </DropdownMenuCheckboxItem>
                  {allUnits.map(unit => (
                      <DropdownMenuCheckboxItem
                          key={unit}
                          checked={selectedUnits.includes(unit)}
                          onCheckedChange={() => handleUnitSelection(unit)}
                          disabled={selectedUnits.includes('all')}
                      >
                          {unit}
                      </DropdownMenuCheckboxItem>
                  ))}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <ListFilter className="h-4 w-4" />
                  <span>Xét nghiệm</span>
                  {selectedTestNames.length > 0 && !selectedTestNames.includes('all') && (
                    <span className="ml-2 rounded-full bg-primary px-2 text-xs text-primary-foreground">
                      {selectedTestNames.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" onCloseAutoFocus={(e) => e.preventDefault()}>
                <DropdownMenuLabel>Lọc theo xét nghiệm</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-40">
                  <DropdownMenuCheckboxItem
                      checked={selectedTestNames.includes('all')}
                      onCheckedChange={() => handleTestNameSelection('all')}
                  >
                      Tất cả
                  </DropdownMenuCheckboxItem>
                  {allTestNames.map(name => (
                      <DropdownMenuCheckboxItem
                          key={name}
                          checked={selectedTestNames.includes(name)}
                          onCheckedChange={() => handleTestNameSelection(name)}
                          disabled={selectedTestNames.includes('all')}
                      >
                          {name}
                      </DropdownMenuCheckboxItem>
                  ))}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center space-x-2">
              <Switch id="mindray-switch" checked={isMindrayOnly} onCheckedChange={setIsMindrayOnly} />
              <Label htmlFor="mindray-switch">Only Mindray</Label>
            </div>

          <DateRangePicker
            date={dateRange}
            onDateChange={handleDateRangeChange}
            disabled={isLoading || !minDate}
          />
          <div className="flex-1 w-full md:w-auto">
            {minDate && maxDate && (
              <div className="flex items-center gap-4">
                 <Label htmlFor="date-slider" className="min-w-fit">Khoảng ngày</Label>
                 <Slider
                    id="date-slider"
                    min={0}
                    max={totalDays > 0 ? totalDays : 100}
                    value={sliderRange}
                    onValueChange={handleSliderChange}
                    disabled={isLoading || !minDate}
                    className="w-full"
                 />
              </div>
            )}
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <TotalTestsChart data={dailyCounts} isLoading={isLoading} />
          <UnitDistributionChart data={unitCounts} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
