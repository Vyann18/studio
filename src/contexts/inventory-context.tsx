
'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { InventoryItem } from '@/lib/types';
import { inventoryItems as initialInventory } from '@/lib/data';

type InventoryContextType = {
  inventory: InventoryItem[];
  addInventoryItem: (item: InventoryItem) => void;
  removeInventoryItem: (itemId: string) => void;
  adjustStock: (itemId: string, adjustment: number) => void;
};

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);

  const addInventoryItem = (item: InventoryItem) => {
    setInventory(prev => [...prev, item]);
  };

  const removeInventoryItem = (itemId: string) => {
    setInventory(prev => prev.filter(item => item.id !== itemId));
  };

  const adjustStock = (itemId: string, adjustment: number) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(0, item.quantity + adjustment) }
          : item
      )
    );
  };


  return (
    <InventoryContext.Provider value={{ inventory, addInventoryItem, removeInventoryItem, adjustStock }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within a InventoryProvider');
  }
  return context;
};
