'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { CalendarDays, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format, parseISO, subDays, startOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

type DateFilterProps = {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  minDate?: string; // YYYY-MM-DD format
  maxDate?: string; // YYYY-MM-DD format
  isLoading?: boolean;
};

export function DateFilter({
  dateRange,
  onDateRangeChange,
  minDate,
  maxDate,
  isLoading = false,
}: DateFilterProps) {
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const minDateObj = minDate ? parseISO(minDate) : undefined;
  const maxDateObj = maxDate ? parseISO(maxDate) : undefined;

  const handleFromChange = (date: Date | undefined) => {
    if (date) {
      onDateRangeChange({
        from: date,
        to: dateRange?.to && date <= dateRange.to ? dateRange.to : date,
      });
    }
    setFromOpen(false);
  };

  const handleToChange = (date: Date | undefined) => {
    if (date) {
      onDateRangeChange({
        from: dateRange?.from && date >= dateRange.from ? dateRange.from : date,
        to: date,
      });
    }
    setToOpen(false);
  };

  // Preset options
  const handlePreset = (days: number | 'month' | 'all') => {
    if (!maxDateObj) return;
    
    let from: Date;
    const to = maxDateObj;

    if (days === 'all' && minDateObj) {
      from = minDateObj;
    } else if (days === 'month') {
      from = startOfMonth(maxDateObj);
    } else if (typeof days === 'number') {
      from = subDays(maxDateObj, days - 1);
      if (minDateObj && from < minDateObj) from = minDateObj;
    } else {
      return;
    }

    onDateRangeChange({ from, to });
  };

  const handleClear = () => {
    if (minDateObj && maxDateObj) {
      onDateRangeChange({ from: minDateObj, to: maxDateObj });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm font-medium">Lọc theo Thời gian</Label>
      </div>

      {/* Quick preset buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => handlePreset(7)}
          disabled={isLoading}
        >
          7 ngày
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => handlePreset(30)}
          disabled={isLoading}
        >
          30 ngày
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => handlePreset('month')}
          disabled={isLoading}
        >
          Tháng này
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => handlePreset('all')}
          disabled={isLoading}
        >
          Tất cả
        </Button>
      </div>

      {/* Date inputs */}
      <div className="flex items-center gap-2">
        {/* From Date */}
        <Popover open={fromOpen} onOpenChange={setFromOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "flex-1 justify-start text-left font-normal h-9",
                !dateRange?.from && "text-muted-foreground"
              )}
              disabled={isLoading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                format(dateRange.from, "dd/MM/yyyy")
              ) : (
                "Từ ngày"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 border-b bg-muted/50">
              <p className="text-sm font-medium">Chọn ngày bắt đầu</p>
            </div>
            <Calendar
              mode="single"
              selected={dateRange?.from}
              onSelect={handleFromChange}
              disabled={(date) => {
                if (minDateObj && date < minDateObj) return true;
                if (maxDateObj && date > maxDateObj) return true;
                return false;
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <span className="text-muted-foreground text-sm">→</span>

        {/* To Date */}
        <Popover open={toOpen} onOpenChange={setToOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "flex-1 justify-start text-left font-normal h-9",
                !dateRange?.to && "text-muted-foreground"
              )}
              disabled={isLoading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.to ? (
                format(dateRange.to, "dd/MM/yyyy")
              ) : (
                "Đến ngày"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="p-3 border-b bg-muted/50">
              <p className="text-sm font-medium">Chọn ngày kết thúc</p>
            </div>
            <Calendar
              mode="single"
              selected={dateRange?.to}
              onSelect={handleToChange}
              disabled={(date) => {
                if (minDateObj && date < minDateObj) return true;
                if (maxDateObj && date > maxDateObj) return true;
                if (dateRange?.from && date < dateRange.from) return true;
                return false;
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Info footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {minDate && maxDate && (
            <>Dữ liệu: {minDate} → {maxDate}</>
          )}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={handleClear}
          disabled={isLoading}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
