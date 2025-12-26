'use server';

/**
 * @fileOverview Dynamically configures chart based on user-selected Supabase table and columns.
 *
 * - configureChart - A function that handles the chart configuration process.
 * - ConfigureChartInput - The input type for the configureChart function.
 * - ConfigureChartOutput - The return type for the configureChart function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConfigureChartInputSchema = z.object({
  table: z.string().describe('The name of the Supabase table.'),
  columns: z.array(z.string()).describe('The names of the columns to visualize.'),
  chartType: z.enum(['line', 'bar', 'pie']).describe('The type of chart to generate.'),
});
export type ConfigureChartInput = z.infer<typeof ConfigureChartInputSchema>;

const ConfigureChartOutputSchema = z.object({
  xAxis: z.string().optional().describe('The column to use for the x-axis.'),
  yAxis: z.string().optional().describe('The column to use for the y-axis.'),
  valueColumn: z.string().optional().describe('The column to use for the value in the chart.'),
  labelColumn: z.string().optional().describe('The column to use for the label in the chart.'),
  error: z.string().optional().describe('An error message if the configuration is not possible.'),
});
export type ConfigureChartOutput = z.infer<typeof ConfigureChartOutputSchema>;

export async function configureChart(input: ConfigureChartInput): Promise<ConfigureChartOutput> {
  return configureChartFlow(input);
}

const prompt = ai.definePrompt({
  name: 'configureChartPrompt',
  input: {schema: ConfigureChartInputSchema},
  output: {schema: ConfigureChartOutputSchema},
  prompt: `You are an AI assistant that helps users configure charts based on data from a Supabase database.

The user has selected the following table: {{{table}}}

The user has selected the following columns: {{#each columns}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

The user has selected the following chart type: {{{chartType}}}

Based on the selected table, columns, and chart type, determine the best way to configure the chart.

Consider the data types of the columns and whether they are suitable for the selected chart type.

If the chart type is 'line' or 'bar', select appropriate columns for the x-axis and y-axis. The x-axis should be a categorical or time-series column, and the y-axis should be a numerical column.
If the chart type is 'pie', select appropriate columns for the value and label. The value column should be numerical, and the label column should be categorical.

If it is impossible to create the chart for any reason, set the error field. For example, there may be no suitable columns or the selected chart type may be incompatible with the data.

Output the configuration in JSON format.
`,
});

const configureChartFlow = ai.defineFlow(
  {
    name: 'configureChartFlow',
    inputSchema: ConfigureChartInputSchema,
    outputSchema: ConfigureChartOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
