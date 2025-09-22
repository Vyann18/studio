'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { InventoryItem, User, Category, Sale, PurchaseOrder, Customer, Supplier, Transaction } from '@/lib/types';
import { inventoryItems as initialInventory, sales as initialSales, purchaseOrders as initialPurchaseOrders, customers as initialCustomers, suppliers as initialSuppliers, transactions as initialTransactions } from '@/lib/data';
import { useUser } from './user-context';

type CompanyData = {
  inventory: InventoryItem[];
  sales: Sale[];
  purchaseOrders: PurchaseOrder[];
  customers: Customer[];
  suppliers: Supplier[];
  transactions: Transaction[];
};

type AllData = {
  [companyId: string]: CompanyData;
};

type DataContextType = {
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated' | 'history'>) => void;
  removeInventoryItem: (itemId: string) => void;
  adjustStock: (itemId: string, adjustment: number) => void;
  getItemById: (itemId: string) => InventoryItem | undefined;
  
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => void;
  updateSaleStatus: (saleId: string, status: 'Paid' | 'Pending') => void;

  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'date' | 'status'>) => void;
  updatePurchaseOrder: (poId: string, data: Partial<Omit<PurchaseOrder, 'id'>>) => void;
  deletePurchaseOrder: (poId: string) => void;

  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'totalSpent'>) => void;
  updateCustomer: (customerId: string, data: Partial<Omit<Customer, 'id'>>) => void;
  deleteCustomer: (customerId: string) => void;

  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (supplierId: string, data: Partial<Omit<Supplier, 'id'>>) => void;
  deleteSupplier: (supplierId: string) => void;

  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

const getInitialState = <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') {
        return fallback;
    }
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
        try {
            return JSON.parse(storedValue);
        } catch (e) {
            console.error(`Error parsing ${key} from localStorage`, e);
            return fallback;
        }
    }
    return fallback;
};

const initialData: AllData = {
    'EJY1UT': {
        inventory: initialInventory,
        sales: initialSales,
        purchaseOrders: initialPurchaseOrders,
        customers: initialCustomers,
        suppliers: initialSuppliers,
        transactions: initialTransactions,
    }
}

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useUser();
  const [data, setData] = useState<AllData>(() => getInitialState('appData', initialData));

  useEffect(() => {
    localStorage.setItem('appData', JSON.stringify(data));
  }, [data]);

  const getCompanyData = (): CompanyData => {
    if (!currentUser?.companyId) {
        return { inventory: [], sales: [], purchaseOrders: [], customers: [], suppliers: [], transactions: [] };
    }
    // If a company has no data, initialize it with an empty structure
    if (!data[currentUser.companyId]) {
      const newCompanyData = { inventory: [], sales: [], purchaseOrders: [], customers: [], suppliers: [], transactions: [] };
      setData(prev => ({...prev, [currentUser.companyId!]: newCompanyData}));
      return newCompanyData;
    }
    return data[currentUser.companyId];
  };

  const setCompanyData = (newCompanyData: Partial<CompanyData>) => {
    if (!currentUser?.companyId) return;
    setData(prev => ({
        ...prev,
        [currentUser.companyId!]: {
            ...prev[currentUser.companyId!],
            ...newCompanyData,
        }
    }))
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id'|'lastUpdated'|'history'>) => {
    const newItem: InventoryItem = {
        ...item,
        id: `item-${Date.now()}`,
        lastUpdated: new Date().toISOString(),
        history: [{ date: new Date().toISOString(), quantity: item.quantity }]
    };
    const currentData = getCompanyData();
    setCompanyData({ inventory: [...currentData.inventory, newItem] });
  };

  const removeInventoryItem = (itemId: string) => {
    const currentData = getCompanyData();
    setCompanyData({ inventory: currentData.inventory.filter(item => item.id !== itemId) });
  };

  const adjustStock = (itemId: string, adjustment: number) => {
    const currentData = getCompanyData();
    const newInventory = currentData.inventory.map(item =>
        item.id === itemId
          ? { 
              ...item, 
              quantity: Math.max(0, item.quantity + adjustment),
              lastUpdated: new Date().toISOString(),
              history: [...item.history, { date: new Date().toISOString(), quantity: Math.max(0, item.quantity + adjustment) }]
            }
          : item
      );
    setCompanyData({ inventory: newInventory });
  };
  
  const getItemById = (itemId: string): InventoryItem | undefined => {
    return getCompanyData().inventory.find(i => i.id === itemId);
  };

  // Sales
  const addSale = (sale: Omit<Sale, 'id'|'date'>) => {
    const newSale: Sale = {
        ...sale,
        id: `INV-00${getCompanyData().sales.length + 1}`,
        date: new Date().toISOString().split('T')[0],
    };
    const currentData = getCompanyData();
    setCompanyData({ sales: [newSale, ...currentData.sales] });
  };

  const updateSaleStatus = (saleId: string, status: 'Paid' | 'Pending') => {
    const currentData = getCompanyData();
    const newSales = currentData.sales.map(s => s.id === saleId ? { ...s, status } : s);
    setCompanyData({ sales: newSales });
  };

  // Purchase Orders
  const addPurchaseOrder = (po: Omit<PurchaseOrder, 'id' | 'date' | 'status'>) => {
    const newPO: PurchaseOrder = {
        ...po,
        id: `PO-00${getCompanyData().purchaseOrders.length + 1}`,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
    };
    const currentData = getCompanyData();
    setCompanyData({ purchaseOrders: [newPO, ...currentData.purchaseOrders] });
  };

  const updatePurchaseOrder = (poId: string, poData: Partial<Omit<PurchaseOrder, 'id'>>) => {
    const currentData = getCompanyData();
    const newPOs = currentData.purchaseOrders.map(po => po.id === poId ? { ...po, ...poData } : po);
    setCompanyData({ purchaseOrders: newPOs });
  };

  const deletePurchaseOrder = (poId: string) => {
    const currentData = getCompanyData();
    setCompanyData({ purchaseOrders: currentData.purchaseOrders.filter(po => po.id !== poId) });
  };

  // Customers
  const addCustomer = (customer: Omit<Customer, 'id' | 'totalSpent'>) => {
    const newCustomer: Customer = {
        ...customer,
        id: `CUS-0${getCompanyData().customers.length + 1}`,
        totalSpent: 0,
    };
    const currentData = getCompanyData();
    setCompanyData({ customers: [newCustomer, ...currentData.customers] });
  };

  const updateCustomer = (customerId: string, customerData: Partial<Omit<Customer, 'id'>>) => {
    const currentData = getCompanyData();
    const newCustomers = currentData.customers.map(c => c.id === customerId ? { ...c, ...customerData } : c);
    setCompanyData({ customers: newCustomers });
  };

  const deleteCustomer = (customerId: string) => {
    const currentData = getCompanyData();
    setCompanyData({ customers: currentData.customers.filter(c => c.id !== customerId) });
  };

  // Suppliers
  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
        ...supplier,
        id: `SUP-0${getCompanyData().suppliers.length + 1}`,
    };
    const currentData = getCompanyData();
    setCompanyData({ suppliers: [newSupplier, ...currentData.suppliers] });
  };

  const updateSupplier = (supplierId: string, supplierData: Partial<Omit<Supplier, 'id'>>) => {
    const currentData = getCompanyData();
    const newSuppliers = currentData.suppliers.map(s => s.id === supplierId ? { ...s, ...supplierData } : s);
    setCompanyData({ suppliers: newSuppliers });
  };

  const deleteSupplier = (supplierId: string) => {
    const currentData = getCompanyData();
    setCompanyData({ suppliers: currentData.suppliers.filter(s => s.id !== supplierId) });
  };

  // Transactions
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
        ...transaction,
        id: `TRN-00${getCompanyData().transactions.length + 1}`,
        date: new Date().toISOString().split('T')[0],
    };
    const currentData = getCompanyData();
    setCompanyData({ transactions: [newTransaction, ...currentData.transactions] });
  };
  
  const companyData = getCompanyData();

  return (
    <DataContext.Provider value={{
        inventory: companyData.inventory,
        addInventoryItem,
        removeInventoryItem,
        adjustStock,
        getItemById,
        sales: companyData.sales,
        addSale,
        updateSaleStatus,
        purchaseOrders: companyData.purchaseOrders,
        addPurchaseOrder,
        updatePurchaseOrder,
        deletePurchaseOrder,
        customers: companyData.customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        suppliers: companyData.suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        transactions: companyData.transactions,
        addTransaction,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
