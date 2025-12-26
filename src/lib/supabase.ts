import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types cho các API responses
export type FilterOptions = {
  units: string[];
  tests: string[];
};

export type DateRange = {
  minDate: string;
  maxDate: string;
};

export type DailyTestCount = {
  date: string;
  total: number;
  mindray: number;
};

export type Distribution = {
  name: string;
  value: number;
};

// API functions
export async function getFilterOptions(): Promise<FilterOptions> {
  const { data, error } = await supabase.rpc('get_filter_options');
  if (error) throw error;
  return data;
}

export async function getDateRange(): Promise<DateRange> {
  const { data, error } = await supabase.rpc('get_date_range');
  if (error) throw error;
  return data;
}

export async function getDailyTestCounts(
  startDate: string,
  endDate: string,
  filterUnits: string[] | null = null,
  filterTests: string[] | null = null,
  mindrayOnly: boolean = false
): Promise<DailyTestCount[]> {
  const { data, error } = await supabase.rpc('get_daily_test_counts', {
    start_date: startDate,
    end_date: endDate,
    filter_units: filterUnits,
    filter_tests: filterTests,
    mindray_only: mindrayOnly,
  });
  if (error) throw error;
  return data;
}

export async function getUnitDistribution(
  startDate: string,
  endDate: string,
  filterUnits: string[] | null = null,
  filterTests: string[] | null = null,
  mindrayOnly: boolean = false
): Promise<Distribution[]> {
  const { data, error } = await supabase.rpc('get_unit_distribution', {
    start_date: startDate,
    end_date: endDate,
    filter_units: filterUnits,
    filter_tests: filterTests,
    mindray_only: mindrayOnly,
  });
  if (error) throw error;
  return data;
}

export async function getTestDistribution(
  startDate: string,
  endDate: string,
  filterUnits: string[] | null = null,
  filterTests: string[] | null = null,
  mindrayOnly: boolean = false
): Promise<Distribution[]> {
  const { data, error } = await supabase.rpc('get_test_distribution', {
    start_date: startDate,
    end_date: endDate,
    filter_units: filterUnits,
    filter_tests: filterTests,
    mindray_only: mindrayOnly,
  });
  if (error) throw error;
  return data;
}

