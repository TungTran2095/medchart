'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Building2, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type UnitFilterProps = {
  units: string[];
  selectedUnits: string[];
  onSelectionChange: (units: string[]) => void;
  isLoading?: boolean;
};

export function UnitFilter({
  units,
  selectedUnits,
  onSelectionChange,
  isLoading = false,
}: UnitFilterProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggle = (unit: string) => {
    if (selectedUnits.includes(unit)) {
      onSelectionChange(selectedUnits.filter((u) => u !== unit));
    } else {
      onSelectionChange([...selectedUnits, unit]);
    }
  };

  const handleSelectAll = () => {
    onSelectionChange([...units]);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleRemove = (unit: string) => {
    onSelectionChange(selectedUnits.filter((u) => u !== unit));
  };

  // Lọc đơn vị theo search term
  const filteredUnits = units.filter((unit) =>
    unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm font-medium">Lọc theo Đơn vị</Label>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            disabled={isLoading}
          >
            {isLoading ? (
              "Đang tải..."
            ) : selectedUnits.length === 0 ? (
              "Chọn đơn vị để lọc..."
            ) : (
              `Đã chọn ${selectedUnits.length} đơn vị`
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0" align="start">
          {/* Search input */}
          <div className="p-3 border-b">
            <Input
              placeholder="Tìm kiếm đơn vị..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
          </div>

          {/* Select all / Clear all buttons */}
          <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
            <span className="text-xs text-muted-foreground">
              {filteredUnits.length} đơn vị
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleSelectAll}
              >
                Chọn tất cả
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleClearAll}
              >
                Bỏ chọn
              </Button>
            </div>
          </div>

          {/* Checkbox list */}
          <ScrollArea className="h-[250px]">
            <div className="p-2">
              {filteredUnits.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Không tìm thấy đơn vị nào
                </div>
              ) : (
                filteredUnits.map((unit) => {
                  const isSelected = selectedUnits.includes(unit);
                  return (
                    <div
                      key={unit}
                      className={cn(
                        "flex items-center space-x-3 px-2 py-2 rounded-md cursor-pointer hover:bg-accent",
                        isSelected && "bg-accent/50"
                      )}
                      onClick={() => handleToggle(unit)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggle(unit)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-sm flex-1 truncate" title={unit}>
                        {unit}
                      </span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Footer with done button */}
          <div className="p-3 border-t bg-muted/50">
            <Button
              className="w-full"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Xong ({selectedUnits.length} đã chọn)
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Hiển thị các đơn vị đã chọn */}
      {selectedUnits.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Đã chọn: {selectedUnits.length} đơn vị
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={handleClearAll}
            >
              Xóa tất cả
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedUnits.map((unit) => (
              <Badge
                key={unit}
                variant="secondary"
                className="text-xs py-1 pr-1 cursor-pointer hover:bg-destructive/20"
              >
                <span className="max-w-[150px] truncate" title={unit}>
                  {unit}
                </span>
                <button
                  onClick={() => handleRemove(unit)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
