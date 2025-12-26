'use client';

import React, { useState, useEffect } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  useSidebar,
} from '@/components/ui/sidebar';
import { Configurator } from './configurator';
import { ChartDisplay } from './chart-display';
import { DataTable } from './data-table';
import type { DatabaseSchema, ChartDataConfig } from '@/lib/types';
import { getTableData } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

function DashboardHeader() {
  const { toggleSidebar, isMobile } = useSidebar();
  return (
    <div className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-10">
      {isMobile && (
        <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <PanelLeft />
        </Button>
      )}
      <div className="flex items-center gap-2">
        <Icons.logo className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-semibold md:text-xl font-headline">Dashboard</h1>
      </div>
    </div>
  );
}

export function Dashboard({ schema }: { schema: DatabaseSchema }) {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartDataConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTable, setCurrentTable] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    if (currentTable === 'mindray_trans' && selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const dayData = data.filter(item => {
        return item.ngay_vao_so && item.ngay_vao_so.startsWith(formattedDate);
      });
      setFilteredData(dayData);
    } else {
      setFilteredData(data);
    }
  }, [selectedDate, data, currentTable]);

  const handleConfigChange = async (table: string, config: ChartDataConfig) => {
    setIsLoading(true);
    setChartConfig(config);
    setCurrentTable(table);
    setSelectedDate(undefined);
    try {
      const tableData = await getTableData(table);
      setData(tableData);
      setFilteredData(tableData);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Failed to fetch data',
        description: `Could not load data for table: ${table}`,
      });
      setData([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b">
          <div className="flex h-14 items-center gap-2 px-4 lg:h-[60px] lg:px-6">
            <Icons.logo className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold font-headline">Dashboard</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <Configurator
            schema={schema}
            onConfigChange={handleConfigChange}
            isParentLoading={isLoading}
          />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-8 space-y-8">
          {currentTable === 'mindray_trans' && (
              <div className="flex justify-end">
                  <DatePicker date={selectedDate} setDate={setSelectedDate} />
              </div>
          )}
          <ChartDisplay data={filteredData} config={chartConfig} isLoading={isLoading} />
          <DataTable data={filteredData} isLoading={isLoading} tableName={currentTable} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
