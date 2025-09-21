'use server';

import { generateRestockAlerts, RestockAlertsOutput } from '@/ai/flows/restock-alerts';
import { inventoryItems } from '@/lib/data';

// This is a server action, but it's reading from a local file which is not ideal.
// In a real application, you would fetch this data from a database.
// To simulate real-time data, we need to find a way to get the current state of inventory.
// For now, this will use the initial state from `data.ts`, which might be stale.
// A better approach would be to pass the inventory data from the client, 
// or use a proper database.

export async function getRestockAlerts(currentInventory: any[]): Promise<RestockAlertsOutput | { error: string }> {
  try {
    const mockSalesData = currentInventory.map(item => ({
        itemName: item.name,
        // Simulate higher sales for items with more stock
        quantitySold: Math.floor(Math.random() * (item.quantity > 10 ? 50 : 15)),
    }));

    const alerts = await generateRestockAlerts({
      inventoryData: JSON.stringify(currentInventory),
      salesData: JSON.stringify(mockSalesData),
    });
    return alerts;
  } catch (error) {
    console.error('Error generating restock alerts:', error);
    return { error: 'Failed to generate restock alerts. Please try again later.' };
  }
}
