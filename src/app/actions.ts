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
    const url = `${supabaseUrl}/rest/v1/rpc/${functionName}`;
    const body = JSON.stringify(params);
    
    console.log(`Calling RPC: ${functionName}`, { url, params });
    
    const res = await fetch(url, {
        method: 'POST',
        headers,
        body,
        cache: 'no-store'
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error(`Failed to call RPC ${functionName}:`, {
            status: res.status,
            statusText: res.statusText,
            error: errorText,
            params
        });
        throw new Error(`Failed to call RPC ${functionName}: ${res.status} ${res.statusText} - ${errorText}`);
    }

    const result = await res.json();
    console.log(`RPC ${functionName} response:`, result);
    return result;
}

export async function getDashboardData(
    dateRange: DateRange,
    selectedUnits: string[],
    selectedTestNames: string[],
    isMindrayOnly: boolean
) {
    if (!dateRange.from || !dateRange.to) {
        return { dailyCounts: [], unitCounts: [], testCounts: [] };
    }

    const params = {
        start_date: format(dateRange.from, 'yyyy-MM-dd'),
        end_date: format(dateRange.to, 'yyyy-MM-dd'),
        filter_units: selectedUnits.includes('all') || selectedUnits.length === 0 ? null : selectedUnits,
        filter_tests: selectedTestNames.includes('all') || selectedTestNames.length === 0 ? null : selectedTestNames,
        mindray_only: isMindrayOnly,
    };
    
    try {
        const [dailyCountsResponse, unitCountsResponse, testCountsResponse] = await Promise.all([
            callRpc('get_daily_test_counts', params),
            callRpc('get_unit_distribution', params),
            callRpc('get_test_distribution', params),
        ]);

        // Supabase RPC trả về array trực tiếp
        const dailyCounts = Array.isArray(dailyCountsResponse) ? dailyCountsResponse : [];
        const unitCounts = Array.isArray(unitCountsResponse) ? unitCountsResponse : [];
        const testCounts = Array.isArray(testCountsResponse) ? testCountsResponse : [];

        console.log('Processed dashboard data:', { 
            dailyCountsLength: dailyCounts.length, 
            unitCountsLength: unitCounts.length,
            testCountsLength: testCounts.length,
            sampleDaily: dailyCounts[0],
            sampleUnit: unitCounts[0],
            sampleTest: testCounts[0]
        });

        return { dailyCounts, unitCounts, testCounts };
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return { dailyCounts: [], unitCounts: [], testCounts: [] };
    }
}


export async function getInitialDashboardState() {
    try {
        const [filterOptionsResponse, dateRangeResponse] = await Promise.all([
            callRpc('get_filter_options', {}),
            callRpc('get_date_range', {}),
        ]);
        
        console.log('Initial state responses:', {
            filterOptions: filterOptionsResponse,
            dateRange: dateRangeResponse
        });

        // get_filter_options trả về JSON object
        const filterOptions = filterOptionsResponse || {};
        const units = Array.isArray(filterOptions.units) 
          ? filterOptions.units.map((u: string) => u?.trim() || '').filter(Boolean)
          : [];
        const tests = Array.isArray(filterOptions.tests) 
          ? filterOptions.tests.map((t: string) => t?.trim() || '').filter(Boolean)
          : [];

        // get_date_range trả về JSON object
        const dateRangeResult = dateRangeResponse || {};
        const minDate = dateRangeResult.minDate || dateRangeResult.mindate || null;
        const maxDate = dateRangeResult.maxDate || dateRangeResult.maxdate || null;

        console.log('Processed initial state:', {
            unitsCount: units.length,
            testsCount: tests.length,
            minDate,
            maxDate
        });
        
        return {
            units: units.sort(),
            tests: tests.sort(),
            minDate,
            maxDate,
        };
    } catch(error) {
        console.error('Error fetching initial state:', error);
        return { units: [], tests: [], minDate: null, maxDate: null };
    }
}