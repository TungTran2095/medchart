'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '@/components/icons';
import { UnitFilter } from './unit-filter';
import { TestFilter } from './test-filter';
import { DateFilter } from './date-filter';
import { TotalTestsChart } from './total-tests-chart';
import { UnitDistributionChart } from './unit-distribution-chart';
import { TestDistributionBarChart } from './test-distribution-bar-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  supabase,
  type DateRange as ApiDateRange,
  type DailyTestCount,
  type Distribution,
} from '@/lib/supabase';
import { DateRange } from 'react-day-picker';
import { format, parseISO } from 'date-fns';

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
  // States cho data
  const [apiDateRange, setApiDateRange] = useState<ApiDateRange | null>(null); // Min/max từ DB
  const [dailyTestCounts, setDailyTestCounts] = useState<DailyTestCount[]>([]);
  const [unitDistribution, setUnitDistribution] = useState<Distribution[]>([]);
  const [testDistribution, setTestDistribution] = useState<Distribution[]>([]);
  const [allUnits, setAllUnits] = useState<string[]>([]); // Danh sách đơn vị từ bảng mindray_donvi
  const [allTests, setAllTests] = useState<string[]>([]); // Danh sách xét nghiệm từ bảng mindray_tenxn
  
  // States cho loading
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);
  const [isLoadingTests, setIsLoadingTests] = useState(true);
  const [isLoadingDateRange, setIsLoadingDateRange] = useState(true);
  
  // State cho filter
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(undefined);

  // Fetch danh sách đơn vị từ RPC function get_all_units
  useEffect(() => {
    async function fetchUnits() {
      try {
        setIsLoadingUnits(true);
        
        const { data, error } = await supabase.rpc('get_all_units');

        console.log('get_all_units result:', { data, error });

        if (error) {
          console.error('get_all_units error details:', error.message, error.code, error.details);
          throw error;
        }

        // Extract unit names
        const unitNames = data
          ?.map((item: { ten_don_vi: string }) => item.ten_don_vi)
          .filter((name: string | null): name is string => !!name) || [];
        
        console.log('Loaded units:', unitNames.length);
        setAllUnits(unitNames);
      } catch (error) {
        console.error('Error fetching units:', error);
      } finally {
        setIsLoadingUnits(false);
      }
    }

    fetchUnits();
  }, []);

  // Fetch danh sách xét nghiệm từ RPC function get_all_tests
  useEffect(() => {
    async function fetchTests() {
      try {
        setIsLoadingTests(true);
        
        const { data, error } = await supabase.rpc('get_all_tests');

        console.log('get_all_tests result:', { data, error });

        if (error) {
          console.error('get_all_tests error details:', error.message, error.code, error.details);
          throw error;
        }

        // Extract test names
        const testNames = data
          ?.map((item: { ten_xn: string }) => item.ten_xn)
          .filter((name: string | null): name is string => !!name) || [];
        
        console.log('Loaded tests:', testNames.length);
        setAllTests(testNames);
      } catch (error) {
        console.error('Error fetching tests:', error);
      } finally {
        setIsLoadingTests(false);
      }
    }

    fetchTests();
  }, []);

  // Fetch date range khi mount
  useEffect(() => {
    async function fetchDateRange() {
      try {
        setIsLoadingDateRange(true);
        const dateRangeResult = await supabase.rpc('get_date_range');

        if (dateRangeResult.error) throw dateRangeResult.error;

        setApiDateRange(dateRangeResult.data);
        
        // Set default selected date range to full range
        if (dateRangeResult.data) {
          setSelectedDateRange({
            from: parseISO(dateRangeResult.data.minDate),
            to: parseISO(dateRangeResult.data.maxDate),
          });
        }
      } catch (error) {
        console.error('Error fetching date range:', error);
      } finally {
        setIsLoadingDateRange(false);
      }
    }

    fetchDateRange();
  }, []);

  // Tính toán effective date range cho API calls
  const effectiveDateRange = useMemo(() => {
    if (selectedDateRange?.from && selectedDateRange?.to) {
      return {
        startDate: format(selectedDateRange.from, 'yyyy-MM-dd'),
        endDate: format(selectedDateRange.to, 'yyyy-MM-dd'),
      };
    }
    if (apiDateRange) {
      return {
        startDate: apiDateRange.minDate,
        endDate: apiDateRange.maxDate,
      };
    }
    return null;
  }, [selectedDateRange, apiDateRange]);

  // Fetch chart data khi có date range
  useEffect(() => {
    async function fetchChartData() {
      if (!effectiveDateRange) return;

      try {
        setIsLoadingData(true);

        // Fetch dữ liệu với date range đã chọn
        const [dailyResult, unitResult, testResult] = await Promise.all([
          supabase.rpc('get_daily_test_counts', {
            start_date: effectiveDateRange.startDate,
            end_date: effectiveDateRange.endDate,
            filter_units: null,
            filter_tests: null,
            mindray_only: false,
          }),
          supabase.rpc('get_unit_distribution', {
            start_date: effectiveDateRange.startDate,
            end_date: effectiveDateRange.endDate,
            filter_units: null,
            filter_tests: null,
            mindray_only: false,
          }),
          supabase.rpc('get_test_distribution', {
            start_date: effectiveDateRange.startDate,
            end_date: effectiveDateRange.endDate,
            filter_units: null,
            filter_tests: null,
            mindray_only: false,
          }),
        ]);

        if (dailyResult.error) throw dailyResult.error;
        if (unitResult.error) throw unitResult.error;
        if (testResult.error) throw testResult.error;

        setDailyTestCounts(dailyResult.data || []);
        setUnitDistribution(unitResult.data || []);
        setTestDistribution(testResult.data || []);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchChartData();
  }, [effectiveDateRange]);

  // Client-side filtering cho Unit Distribution
  const filteredUnitDistribution = useMemo(() => {
    if (selectedUnits.length === 0) {
      return unitDistribution;
    }
    return unitDistribution.filter((item) => selectedUnits.includes(item.name));
  }, [unitDistribution, selectedUnits]);

  // Client-side filtering cho Test Distribution
  const filteredTestDistribution = useMemo(() => {
    if (selectedTests.length === 0) {
      return testDistribution;
    }
    return testDistribution.filter((item) => selectedTests.includes(item.name));
  }, [testDistribution, selectedTests]);

  // Tính toán tổng số từ filtered data
  const filteredTotals = useMemo(() => {
    const totalTests = filteredUnitDistribution.reduce((sum, item) => sum + item.value, 0);
    const totalUnits = filteredUnitDistribution.length;
    const totalTestTypes = filteredTestDistribution.length;
    return { totalTests, totalUnits, totalTestTypes };
  }, [filteredUnitDistribution, filteredTestDistribution]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader />
      <main className="flex-1 p-4 md:p-8 space-y-6">
        {/* Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <DateFilter
                dateRange={selectedDateRange}
                onDateRangeChange={setSelectedDateRange}
                minDate={apiDateRange?.minDate}
                maxDate={apiDateRange?.maxDate}
                isLoading={isLoadingDateRange}
              />
              <UnitFilter
                units={allUnits}
                selectedUnits={selectedUnits}
                onSelectionChange={setSelectedUnits}
                isLoading={isLoadingUnits}
              />
              <TestFilter
                tests={allTests}
                selectedTests={selectedTests}
                onSelectionChange={setSelectedTests}
                isLoading={isLoadingTests}
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng số xét nghiệm
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  {filteredTotals.totalTests.toLocaleString('vi-VN')}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Số đơn vị
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {filteredTotals.totalUnits}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Khoảng thời gian đã chọn
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!effectiveDateRange ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-sm font-medium">
                  {effectiveDateRange.startDate} → {effectiveDateRange.endDate}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Unit Distribution Chart - áp dụng filter */}
          <UnitDistributionChart
            data={filteredUnitDistribution}
            isLoading={isLoadingData}
          />

          {/* Test Distribution Chart - áp dụng filter */}
          <TestDistributionBarChart
            data={filteredTestDistribution}
            isLoading={isLoadingData}
          />
        </div>

        {/* Daily Trends Chart */}
        <TotalTestsChart
          data={dailyTestCounts}
          isLoading={isLoadingData}
        />
      </main>
    </div>
  );
}
