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
import { Skeleton } from '../ui/skeleton';

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
            setAllUnits(units);
            setAllTestNames(tests);

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
            const { dailyCounts, unitCounts } = await getDashboardData(
                dateRange!,
                selectedUnits,
                selectedTestNames,
                isMindrayOnly
            );
            setDailyCounts(dailyCounts.map(d => ({ ...d, date: d.date.split('T')[0] })));
            setUnitCounts(unitCounts);
        } catch (error) {
            console.error(error);
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