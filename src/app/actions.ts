'use server';

import type { DatabaseSchema, TableSchema } from '@/lib/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be defined in .env.local');
}

const headers = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
  'Accept-Profile': 'public',
};

/**
 * Fetches the database schema by querying the Supabase REST API's root endpoint.
 * This endpoint returns an OpenAPI specification of the database, which we parse
 * to extract table names and their column definitions.
 * @returns {Promise<DatabaseSchema>} A promise that resolves to the database schema.
 */
export async function getSchema(): Promise<DatabaseSchema> {
  const res = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
    },
    next: { revalidate: 3600 }, // Cache schema for 1 hour
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch database schema: ${res.statusText}`);
  }

  const schema = await res.json();
  const definitions = schema.definitions;
  const dbSchema: DatabaseSchema = Object.keys(definitions)
    .sort()
    .map((tableName) => {
      const tableDef = definitions[tableName];
      if (!tableDef.properties) return null;

      const columns = Object.keys(tableDef.properties).map((columnName) => {
        const columnDef = tableDef.properties[columnName];
        return {
          name: columnName,
          type: columnDef.type,
          format: columnDef.format,
        };
      });

      return {
        name: tableName,
        columns,
      };
    })
    .filter((table): table is TableSchema => table !== null);

  return dbSchema;
}

/**
 * Fetches all data from a specified table, handling pagination.
 * @param {string} table The name of the table to fetch data from.
 * @returns {Promise<any[]>} A promise that resolves to an array of all data rows.
 */
export async function getTableData(table: string): Promise<any[]> {
    let allData: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while(hasMore) {
        const from = page * pageSize;
        const to = from + pageSize - 1;
        
        const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*`, {
            headers: {
                ...headers,
                'Range-Unit': 'items',
                'Range': `${from}-${to}`
            },
            cache: 'no-store'
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch data for table ${table}: ${res.statusText}`);
        }

        const data = await res.json();
        allData = allData.concat(data);

        if (data.length < pageSize) {
            hasMore = false;
        } else {
            page++;
        }
    }
    return allData;
}
