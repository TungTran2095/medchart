'use client';

import React, { useState, useEffect } from 'react';
import { getTableData } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

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
  const [currentTable, setCurrentTable] = useState<string>('mindray_trans');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

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


  return (
    <div className="flex min-h-screen w-full flex-col">
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-8 space-y-8">
          <div className="flex justify-end">
              <DatePicker date={selectedDate} setDate={setSelectedDate} />
          </div>
          {/* Dashboard trống, sẵn sàng để thêm biểu đồ mới */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Các thành phần biểu đồ mới sẽ được thêm vào đây */}
          </div>
        </main>
    </div>
  );
}
