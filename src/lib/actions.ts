'use server';

import { generateRestockAlerts, RestockAlertsOutput } from '@/ai/flows/restock-alerts';
import { inventoryItems } from '@/lib/data';

const mockSalesData = inventoryItems.map(item => ({
    itemName: item.name,
    quantitySold: Math.floor(Math.random() * (item.quantity > 0 ? 50 : 5)),
}));

const mockInventoryData = inventoryItems.map(item => ({
    itemName: item.name,
    quantity: item.quantity,
}));


export async function getRestockAlerts(): Promise<RestockAlertsOutput | { error: string }> {
  try {
    const alerts = await generateRestockAlerts({
      inventoryData: JSON.stringify(mockInventoryData),
      salesData: JSON.stringify(mockSalesData),
    });
    return alerts;
  } catch (error) {
    console.error('Error generating restock alerts:', error);
    return { error: 'Failed to generate restock alerts. Please try again later.' };
  }
}
