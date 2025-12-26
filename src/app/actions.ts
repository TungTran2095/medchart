'use server';

import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be defined in .env.local');
}

const headers = {
  'Content-Type': 'application/json',
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
};

async function callRpc(functionName: string, params: object) {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/${functionName}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
        cache: 'no-store'
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error(`Failed to call RPC ${functionName}:`, errorText);
        throw new Error(`Failed to call RPC ${functionName}: ${res.statusText}`);
    }

    return res.json();
}

export async function getDashboardData(
    dateRange: DateRange,
    selectedUnits: string[],
    selectedTestNames: string[],
    isMindrayOnly: boolean
) {
    if (!dateRange.from || !dateRange.to) {
        return { dailyCounts: [], unitCounts: [] };
    }

    const params = {
        start_date: format(dateRange.from, 'yyyy-MM-dd'),
        end_date: format(dateRange.to, 'yyyy-MM-dd'),
        filter_units: selectedUnits.includes('all') || selectedUnits.length === 0 ? null : selectedUnits,
        filter_tests: selectedTestNames.includes('all') || selectedTestNames.length === 0 ? null : selectedTestNames,
        mindray_only: isMindrayOnly,
    };
    
    try {
        const [dailyCounts, unitCounts] = await Promise.all([
            callRpc('get_daily_test_counts', params),
            callRpc('get_unit_distribution', params),
        ]);

        return { dailyCounts, unitCounts };
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return { dailyCounts: [], unitCounts: [] };
    }
}


export async function getInitialDashboardState() {
    try {
        const [filterOptions, dateRangeResult] = await Promise.all([
            callRpc('get_filter_options', {}),
            callRpc('get_date_range', {}),
        ]);
        
        return {
            units: filterOptions.units?.sort() || [],
            tests: filterOptions.tests?.sort() || [],
            minDate: dateRangeResult.mindate,
            maxDate: dateRangeResult.maxdate,
        };
    } catch(error) {
        console.error('Error fetching initial state:', error);
        return { units: [], tests: [], minDate: null, maxDate: null };
    }
}