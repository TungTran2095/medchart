'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

type DataTableProps = {
  data: any[];
  isLoading: boolean;
  tableName: string | null;
};

export function DataTable({ data, isLoading, tableName }: DataTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tableName) {
    return null; // Don't show the table card if no table has been selected yet
  }

  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Raw Data: {tableName}</CardTitle>
        <CardDescription>
          A preview of the data from your selected table.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[400px] w-full">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length > 0 ? (
                  data.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {headers.map((header) => (
                        <TableCell key={`${rowIndex}-${header}`}>
                          {String(row[header])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={headers.length}
                      className="h-24 text-center"
                    >
                      No data available in this table.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
