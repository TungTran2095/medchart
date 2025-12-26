'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getDashboardData, getInitialDashboardState } from '@/app/actions';
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
import { TestDistributionBarChart } from './test-distribution-bar-chart';
import { Skeleton } from '../ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Checkbox } from '../ui/checkbox';

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

function InitialLoadingSkeleton() {
    return (
        <div className="flex min-h-screen w-full flex-col">
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-8 space-y-8">
            <div className='flex flex-col md:flex-row gap-4 items-center'>
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-72" />
                <div className="flex-1 w-full md:w-auto">
                    <div className="flex items-center gap-4">
                        <Label>Khoảng ngày</Label>
                        <Skeleton className="h-5 w-full" />
                    </div>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              <TotalTestsChart data={[]} isLoading={true} />
              <UnitDistributionChart data={[]} isLoading={true} />
            </div>
          </main>
        </div>
      )
}

export function Dashboard() {
  const [isClient, setIsClient] = useState(false);
  const [dailyCounts, setDailyCounts] = useState<any[]>([]);
  const [unitCounts, setUnitCounts] = useState<any[]>([]);
  const [testCounts, setTestCounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Date range states
  const [minDate, setMinDate] = useState<Date | undefined>();
  const [maxDate, setMaxDate] = useState<Date | undefined>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [sliderRange, setSliderRange] = useState([0, 100]);

  // Unit filter states
  const [allUnits, setAllUnits] = useState<string[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>(['all']);

  // Test name filter states
  const [allTestNames, setAllTestNames] = useState<string[]>([]);
  const [selectedTestNames, setSelectedTestNames] = useState<string[]>(['all']);

  // isMindray filter state
  const [isMindrayOnly, setIsMindrayOnly] = useState(false);

  // Initial data loading
  useEffect(() => {
    setIsClient(true);
    async function loadInitialState() {
        try {
            const { units, tests, minDate: min, maxDate: max } = await getInitialDashboardState();
            // Normalize và filter các items có encoding issues
            const normalizeText = (text: string) => {
              if (!text) return '';
              // Loại bỏ các ký tự replacement character (U+FFFD - diamond question mark)
              return text.replace(/\uFFFD/g, '').trim();
            };
            
            // Filter và deduplicate units
            const validUnits = units
              .map(normalizeText)
              .filter(u => u.length > 0) // Loại bỏ empty strings
              .filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
            
            // Filter và deduplicate tests
            const validTests = tests
              .map(normalizeText)
              .filter(t => t.length > 0) // Loại bỏ empty strings
              .filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
            
            setAllUnits(validUnits);
            setAllTestNames(validTests);

            if (min && max) {
                const minD = parseISO(min);
                const maxD = parseISO(max);
                if(isValid(minD) && isValid(maxD)) {
                    setMinDate(minD);
                    setMaxDate(maxD);
                    setDateRange({ from: minD, to: maxD });
                    const totalDays = differenceInDays(maxD, minD);
                    setSliderRange([0, totalDays > 0 ? totalDays : 100]);
                }
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Could not load initial data' });
        }
    }
    loadInitialState();
  }, [toast]);

  // Fetch dashboard data when filters change
  useEffect(() => {
    if (!dateRange?.from || !dateRange?.to) {
        return;
    }
    
    async function fetchData() {
        setIsLoading(true);
        try {
            const { dailyCounts, unitCounts, testCounts } = await getDashboardData(
                dateRange!,
                selectedUnits,
                selectedTestNames,
                isMindrayOnly
            );
            
            console.log('Dashboard received data:', {
                dailyCountsLength: dailyCounts?.length || 0,
                unitCountsLength: unitCounts?.length || 0,
                testCountsLength: testCounts?.length || 0,
                dailyCounts: dailyCounts,
                unitCounts: unitCounts,
                testCounts: testCounts
            });

            // Xử lý dailyCounts - đảm bảo date là string và format đúng
            const processedDailyCounts = (dailyCounts || []).map((d: any) => {
                const dateStr = d.date || '';
                return {
                    ...d,
                    date: dateStr.includes('T') ? dateStr.split('T')[0] : dateStr,
                    total: Number(d.total) || 0,
                    mindray: Number(d.mindray) || 0
                };
            });

            // Xử lý unitCounts - đảm bảo value là number
            const processedUnitCounts = (unitCounts || []).map((u: any) => ({
                name: u.name || '',
                value: Number(u.value) || 0
            }));

            // Xử lý testCounts - đảm bảo value là number
            const processedTestCounts = (testCounts || []).map((t: any) => ({
                name: t.name || '',
                value: Number(t.value) || 0
            }));

            setDailyCounts(processedDailyCounts);
            setUnitCounts(processedUnitCounts);
            setTestCounts(processedTestCounts);
        } catch (error) {
            console.error('Error in fetchData:', error);
            toast({
                variant: 'destructive',
                title: 'Failed to fetch dashboard data',
                description: 'Could not load data for the selected filters.',
            });
        } finally {
            setIsLoading(false);
        }
    }
    fetchData();
  }, [dateRange, selectedUnits, selectedTestNames, isMindrayOnly, toast]);


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
        const totalDays = differenceInDays(maxDate, minDate);
        const newSliderFrom = Math.max(0, fromDay);
        const newSliderTo = Math.min(totalDays, toDay);
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
  
  const totalDays = minDate && maxDate ? differenceInDays(maxDate, minDate) : 0;
  
  if (!isClient || !dateRange) {
    return <InitialLoadingSkeleton />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader />
      <main className="flex-1 p-4 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <ListFilter className="h-4 w-4" />
                  <span>Đơn vị</span>
                  {selectedUnits.length > 0 && !selectedUnits.includes('all') && (
                    <span className="ml-2 rounded-full bg-primary px-2 text-xs text-primary-foreground">
                      {selectedUnits.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="p-4 border-b">
                  <h4 className="font-medium">Lọc theo đơn vị</h4>
                </div>
                <ScrollArea className="h-64">
                  <div className="p-2 space-y-2">
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                         onClick={() => handleUnitSelection('all')}>
                      <Checkbox
                        checked={selectedUnits.includes('all')}
                        onCheckedChange={() => handleUnitSelection('all')}
                      />
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1">
                        Tất cả
                      </label>
                    </div>
                    {allUnits.map(unit => (
                      <div 
                        key={unit}
                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                        onClick={() => !selectedUnits.includes('all') && handleUnitSelection(unit)}
                      >
                        <Checkbox
                          checked={selectedUnits.includes(unit)}
                          onCheckedChange={() => handleUnitSelection(unit)}
                          disabled={selectedUnits.includes('all')}
                        />
                        <label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 break-words">
                          {unit || ''}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <ListFilter className="h-4 w-4" />
                  <span>Xét nghiệm</span>
                  {selectedTestNames.length > 0 && !selectedTestNames.includes('all') && (
                    <span className="ml-2 rounded-full bg-primary px-2 text-xs text-primary-foreground">
                      {selectedTestNames.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="p-4 border-b">
                  <h4 className="font-medium">Lọc theo xét nghiệm</h4>
                </div>
                <ScrollArea className="h-64">
                  <div className="p-2 space-y-2">
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                         onClick={() => handleTestNameSelection('all')}>
                      <Checkbox
                        checked={selectedTestNames.includes('all')}
                        onCheckedChange={() => handleTestNameSelection('all')}
                      />
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1">
                        Tất cả
                      </label>
                    </div>
                    {allTestNames.map(name => (
                      <div 
                        key={name}
                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                        onClick={() => !selectedTestNames.includes('all') && handleTestNameSelection(name)}
                      >
                        <Checkbox
                          checked={selectedTestNames.includes(name)}
                          onCheckedChange={() => handleTestNameSelection(name)}
                          disabled={selectedTestNames.includes('all')}
                        />
                        <label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 break-words">
                          {name || ''}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
            
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
        
        <div className="w-full">
          <TestDistributionBarChart data={testCounts} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}