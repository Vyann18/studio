'use server';

/**
 * @fileOverview AI-powered restock alerts based on inventory levels and sales data.
 *
 * - generateRestockAlerts - A function that analyzes inventory and sales data to predict restock needs.
 * - RestockAlertsInput - The input type for the generateRestockAlerts function.
 * - RestockAlertsOutput - The return type for the generateRestockAlerts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RestockAlertsInputSchema = z.object({
  inventoryData: z.string().describe('JSON string of current inventory levels for each item, including item name and quantity.'),
  salesData: z.string().describe('JSON string of recent sales data for each item, including item name and quantity sold over a period of time.'),
});
export type RestockAlertsInput = z.infer<typeof RestockAlertsInputSchema>;

const RestockAlertsOutputSchema = z.object({
  alerts: z.array(
    z.object({
      itemName: z.string().describe('The name of the item that needs to be restocked.'),
      predictedRestockDate: z.string().describe('The predicted date when the item needs to be restocked, in ISO format.'),
      reason: z.string().describe('The reason for the restock alert, including inventory levels and sales trends.'),
    })
  ).describe('A list of restock alerts for items that need to be reordered.'),
});
export type RestockAlertsOutput = z.infer<typeof RestockAlertsOutputSchema>;

export async function generateRestockAlerts(input: RestockAlertsInput): Promise<RestockAlertsOutput> {
  return restockAlertsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'restockAlertsPrompt',
  input: {schema: RestockAlertsInputSchema},
  output: {schema: RestockAlertsOutputSchema},
  prompt: `You are an inventory management expert. Analyze the provided inventory and sales data to predict when items need to be reordered to prevent stockouts.

Inventory Data: {{{inventoryData}}}
Sales Data: {{{salesData}}}

Based on this data, generate a list of restock alerts, including the item name, predicted restock date (in ISO format), and a clear reason for the alert.
Ensure the predicted restock date accounts for supplier lead times.
If there is not enough information to predict the reorder date, respond with an empty list.

Output should be in JSON format.
`, // Ensure output is valid JSON
});

const restockAlertsFlow = ai.defineFlow(
  {
    name: 'restockAlertsFlow',
    inputSchema: RestockAlertsInputSchema,
    outputSchema: RestockAlertsOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (error) {
      console.error('Error in restockAlertsFlow:', error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }
);
