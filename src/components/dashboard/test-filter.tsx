'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, FlaskConical, ChevronDown, Check } from 'lucide-react';
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

type TestFilterProps = {
  tests: string[];
  selectedTests: string[];
  onSelectionChange: (tests: string[]) => void;
  isLoading?: boolean;
};

export function TestFilter({
  tests,
  selectedTests,
  onSelectionChange,
  isLoading = false,
}: TestFilterProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggle = (test: string) => {
    if (selectedTests.includes(test)) {
      onSelectionChange(selectedTests.filter((t) => t !== test));
    } else {
      onSelectionChange([...selectedTests, test]);
    }
  };

  const handleSelectAll = () => {
    // Chọn tất cả các test đang được filter
    const filteredTests = tests.filter((test) =>
      test.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const newSelection = [...new Set([...selectedTests, ...filteredTests])];
    onSelectionChange(newSelection);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleRemove = (test: string) => {
    onSelectionChange(selectedTests.filter((t) => t !== test));
  };

  // Lọc xét nghiệm theo search term
  const filteredTests = tests.filter((test) =>
    test.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm font-medium">Lọc theo Xét nghiệm</Label>
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
            ) : selectedTests.length === 0 ? (
              "Chọn xét nghiệm để lọc..."
            ) : (
              `Đã chọn ${selectedTests.length} xét nghiệm`
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          {/* Search input */}
          <div className="p-3 border-b">
            <Input
              placeholder="Tìm kiếm xét nghiệm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
          </div>

          {/* Select all / Clear all buttons */}
          <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
            <span className="text-xs text-muted-foreground">
              {filteredTests.length} xét nghiệm
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
          <ScrollArea className="h-[300px]">
            <div className="p-2">
              {filteredTests.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Không tìm thấy xét nghiệm nào
                </div>
              ) : (
                filteredTests.map((test) => {
                  const isSelected = selectedTests.includes(test);
                  return (
                    <div
                      key={test}
                      className={cn(
                        "flex items-center space-x-3 px-2 py-2 rounded-md cursor-pointer hover:bg-accent",
                        isSelected && "bg-accent/50"
                      )}
                      onClick={() => handleToggle(test)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggle(test)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-sm flex-1 truncate" title={test}>
                        {test}
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
              Xong ({selectedTests.length} đã chọn)
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Hiển thị các xét nghiệm đã chọn */}
      {selectedTests.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Đã chọn: {selectedTests.length} xét nghiệm
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
          <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto">
            {selectedTests.map((test) => (
              <Badge
                key={test}
                variant="secondary"
                className="text-xs py-1 pr-1 cursor-pointer hover:bg-destructive/20"
              >
                <span className="max-w-[200px] truncate" title={test}>
                  {test}
                </span>
                <button
                  onClick={() => handleRemove(test)}
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

