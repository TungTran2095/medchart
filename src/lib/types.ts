export type TableColumn = {
  name: string;
  type: string;
};

export type TableSchema = {
  name: string;
  columns: TableColumn[];
};

export type DatabaseSchema = TableSchema[];

export type ChartConfig = {
  xAxis?: string;
  yAxis?: string;
  valueColumn?: string;
  labelColumn?: string;
  error?: string;
};

export type ChartDataConfig = ChartConfig & {
  chartType: 'line' | 'bar' | 'pie';
};
