'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { configureChart } from '@/ai/flows/dynamic-chart-configuration';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, LineChart, Loader2, PieChart } from 'lucide-react';
import type { DatabaseSchema, ChartDataConfig } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const FormSchema = z.object({
  table: z.string({ required_error: 'Please select a table.' }),
  columns: z.array(z.string()).refine((value) => value.length > 0, {
    message: 'You must select at least one column.',
  }),
  chartType: z.enum(['bar', 'line', 'pie'], {
    required_error: 'You need to select a chart type.',
  }),
});

type ConfiguratorProps = {
  schema: DatabaseSchema;
  onConfigChange: (table: string, config: ChartDataConfig) => Promise<void>;
  isParentLoading: boolean;
};

export function Configurator({
  schema,
  onConfigChange,
  isParentLoading,
}: ConfiguratorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      columns: [],
    },
  });

  const selectedTable = form.watch('table');
  const tableSchema = schema.find((t) => t.name === selectedTable);

  const handleTableChange = (tableName: string) => {
    form.setValue('table', tableName);
    form.setValue('columns', []);
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsSubmitting(true);
    try {
      const result = await configureChart(data);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Configuration Error',
          description: result.error,
        });
      } else {
        await onConfigChange(data.table, { ...result, chartType: data.chartType });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An unexpected error occurred',
        description: 'Could not generate chart configuration. Please try again.',
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isLoading = isSubmitting || isParentLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
        <FormField
          control={form.control}
          name="table"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Table</FormLabel>
              <Select onValueChange={handleTableChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a table to visualize" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {schema.length > 0 ? (
                    schema.map((table) => (
                      <SelectItem key={table.name} value={table.name}>
                        {table.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No tables found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {tableSchema && (
          <FormField
            control={form.control}
            name="columns"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel>Columns</FormLabel>
                  <FormDescription>
                    Select the columns you want to include in the chart.
                  </FormDescription>
                </div>
                <ScrollArea className="h-40 rounded-md border p-4">
                  {tableSchema.columns.map((column) => (
                    <FormField
                      key={column.name}
                      control={form.control}
                      name="columns"
                      render={({ field }) => (
                        <FormItem
                          key={column.name}
                          className="flex flex-row items-start space-x-3 space-y-0 mb-3"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(column.name)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), column.name])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== column.name
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{column.name}</FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </ScrollArea>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Separator />

        <FormField
          control={form.control}
          name="chartType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Chart Type</FormLabel>
              <FormControl>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'bar', icon: BarChart3, label: 'Bar' },
                    { value: 'line', icon: LineChart, label: 'Line' },
                    { value: 'pie', icon: PieChart, label: 'Pie' },
                  ].map((item) => (
                    <Button
                      key={item.value}
                      type="button"
                      variant={field.value === item.value ? 'default' : 'outline'}
                      className="h-20 flex-col gap-2"
                      onClick={() => field.onChange(item.value)}
                    >
                      <item.icon className="h-6 w-6" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Chart
        </Button>
      </form>
    </Form>
  );
}
