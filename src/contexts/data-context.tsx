
'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { InventoryItem, Sale, PurchaseOrder, Customer, Supplier, Transaction, Company } from '@/lib/types';
import { inventoryItems as initialInventory, sales as initialSales, purchaseOrders as initialPurchaseOrders, customers as initialCustomers, suppliers as initialSuppliers, transactions as initialTransactions } from '@/lib/data';
import { useUser } from './user-context';
import { companies as initialCompanies } from '@/lib/companies';

// This structure holds data for ALL companies, keyed by companyId
type AllData = {
  [companyId: string]: {
    inventory: InventoryItem[];
    sales: Sale[];
    purchaseOrders: PurchaseOrder[];
    customers: Customer[];
    suppliers: Supplier[];
    transactions: Transaction[];
  };
};

type DataContextType = {
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated' | 'history' | 'companyId'>) => void;
  removeInventoryItem: (itemId: string) => void;
  adjustStock: (itemId: string, adjustment: number) => void;
  getItemById: (itemId: string) => InventoryItem | undefined;
  
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'date' | 'companyId'>) => void;
  updateSaleStatus: (saleId: string, status: 'Paid' | 'Pending') => void;

  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'date' | 'status' | 'companyId'>) => void;
  updatePurchaseOrder: (poId: string, data: Partial<Omit<PurchaseOrder, 'id' | 'companyId'>>) => void;
  deletePurchaseOrder: (poId: string) => void;

  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'totalSpent' | 'companyId'>) => void;
  updateCustomer: (customerId: string, data: Partial<Omit<Customer, 'id' | 'companyId'>>) => void;
  deleteCustomer: (customerId: string) => void;

  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'|'companyId'>) => void;
  updateSupplier: (supplierId: string, data: Partial<Omit<Supplier, 'id' | 'companyId'>>) => void;
  deleteSupplier: (supplierId: string) => void;

  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'companyId'>) => void;
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

// Create a more comprehensive initial data structure
const buildInitialData = (): AllData => {
  const allData: AllData = {};
  initialCompanies.forEach(company => {
    allData[company.id] = {
      inventory: initialInventory.filter(i => i.companyId === company.id),
      sales: initialSales.filter(s => s.companyId === company.id),
      purchaseOrders: initialPurchaseOrders.filter(p => p.companyId === company.id),
      customers: initialCustomers.filter(c => c.companyId === company.id),
      suppliers: initialSuppliers.filter(s => s.companyId === company.id),
      transactions: initialTransactions.filter(t => t.companyId === company.id),
    };
  });
  return allData;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser, companies } = useUser();
  const [data, setData] = useState<AllData>(() => getInitialState('appData', buildInitialData()));

  useEffect(() => {
    localStorage.setItem('appData', JSON.stringify(data));
  }, [data]);

  const setCompanyData = (companyId: string, newCompanyData: Partial<DataContextType>) => {
    setData(prev => {
        const existingData = prev[companyId] || { inventory: [], sales: [], purchaseOrders: [], customers: [], suppliers: [], transactions: [] };
        return {
            ...prev,
            [companyId]: { ...existingData, ...newCompanyData }
        };
    });
  };

  const getVisibleData = (): DataContextType => {
    if (!currentUser?.companyId) {
      return { inventory: [], sales: [], purchaseOrders: [], customers: [], suppliers: [], transactions: [] };
    }

    const userCompany = companies.find(c => c.id === currentUser.companyId);
    const userRole = currentUser.role;

    // If user is employee or in a non-grouped company, they see only their company's data.
    if (userRole === 'employee' || !userCompany?.groupId) {
      return data[currentUser.companyId] || { inventory: [], sales: [], purchaseOrders: [], customers: [], suppliers: [], transactions: [] };
    }
    
    // If user is head, manager, or admin in a grouped company, aggregate data.
    if (['head', 'manager', 'admin'].includes(userRole) && userCompany.groupId) {
      const groupCompanyIds = companies.filter(c => c.groupId === userCompany.groupId).map(c => c.id);
      
      const aggregatedData: DataContextType = {
        inventory: [],
        sales: [],
        purchaseOrders: [],
        customers: [],
        suppliers: [],
        transactions: [],
      };

      groupCompanyIds.forEach(id => {
        const companyData = data[id];
        if (companyData) {
          aggregatedData.inventory.push(...companyData.inventory);
          aggregatedData.sales.push(...companyData.sales);
          aggregatedData.purchaseOrders.push(...companyData.purchaseOrders);
          aggregatedData.customers.push(...companyData.customers);
          aggregatedData.suppliers.push(...companyData.suppliers);
          aggregatedData.transactions.push(...companyData.transactions);
        }
      });
      return aggregatedData;
    }

    // Fallback to single company data
    return data[currentUser.companyId] || { inventory: [], sales: [], purchaseOrders: [], customers: [], suppliers: [], transactions: [] };
  };


  const addInventoryItem = (item: Omit<InventoryItem, 'id'|'lastUpdated'|'history'|'companyId'>) => {
    if (!currentUser?.companyId) return;
    const newItem: InventoryItem = {
        ...item,
        id: `item-${Date.now()}`,
        lastUpdated: new Date().toISOString(),
        history: [{ date: new 'Date'().toISOString(), quantity: item.quantity }],
        companyId: currentUser.companyId,
    };
    const currentData = data[currentUser.companyId] || { inventory: [] };
    setCompanyData(currentUser.companyId, { inventory: [...currentData.inventory, newItem] });
  };

  const removeInventoryItem = (itemId: string) => {
    if (!currentUser?.companyId) return;
    const itemToRemove = getVisibleData().inventory.find(i => i.id === itemId);
    if (!itemToRemove) return;

    const ownerCompanyId = itemToRemove.companyId;
    const companyData = data[ownerCompanyId];
    if (companyData) {
      const newInventory = companyData.inventory.filter(item => item.id !== itemId);
      setCompanyData(ownerCompanyId, { inventory: newInventory });
    }
  };

  const adjustStock = (itemId: string, adjustment: number) => {
    if (!currentUser?.companyId) return;
    const itemToAdjust = getVisibleData().inventory.find(i => i.id === itemId);
    if (!itemToAdjust) return;

    const ownerCompanyId = itemToAdjust.companyId;
    const companyData = data[ownerCompanyId];
    if (companyData) {
      const newInventory = companyData.inventory.map(item =>
          item.id === itemId
            ? { 
                ...item, 
                quantity: Math.max(0, item.quantity + adjustment),
                lastUpdated: new Date().toISOString(),
                history: [...item.history, { date: new Date().toISOString(), quantity: Math.max(0, item.quantity + adjustment) }]
              }
            : item
        );
      setCompanyData(ownerCompanyId, { inventory: newInventory });
    }
  };
  
  const getItemById = (itemId: string): InventoryItem | undefined => {
    return getVisibleData().inventory.find(i => i.id === itemId);
  };

  const addSale = (sale: Omit<Sale, 'id'|'date'|'companyId'>) => {
    if (!currentUser?.companyId) return;
    const newSale: Sale = {
        ...sale,
        id: `INV-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        companyId: currentUser.companyId,
    };
    const currentData = data[currentUser.companyId] || { sales: [] };
    setCompanyData(currentUser.companyId, { sales: [newSale, ...currentData.sales] });
  };

  const updateSaleStatus = (saleId: string, status: 'Paid' | 'Pending') => {
    const saleToUpdate = getVisibleData().sales.find(s => s.id === saleId);
    if (!saleToUpdate) return;
    const ownerCompanyId = saleToUpdate.companyId;
    const companyData = data[ownerCompanyId];
    if (companyData) {
        const newSales = companyData.sales.map(s => s.id === saleId ? { ...s, status } : s);
        setCompanyData(ownerCompanyId, { sales: newSales });
    }
  };

  const addPurchaseOrder = (po: Omit<PurchaseOrder, 'id' | 'date' | 'status' | 'companyId'>) => {
    if (!currentUser?.companyId) return;
    const newPO: PurchaseOrder = {
        ...po,
        id: `PO-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        companyId: currentUser.companyId,
    };
    const currentData = data[currentUser.companyId] || { purchaseOrders: [] };
    setCompanyData(currentUser.companyId, { purchaseOrders: [newPO, ...currentData.purchaseOrders] });
  };

  const updatePurchaseOrder = (poId: string, poData: Partial<Omit<PurchaseOrder, 'id' | 'companyId'>>) => {
    const poToUpdate = getVisibleData().purchaseOrders.find(p => p.id === poId);
    if (!poToUpdate) return;
    const ownerCompanyId = poToUpdate.companyId;
    const companyData = data[ownerCompanyId];
    if (companyData) {
        const newPOs = companyData.purchaseOrders.map(po => po.id === poId ? { ...po, ...poData } : po);
        setCompanyData(ownerCompanyId, { purchaseOrders: newPOs });
    }
  };

  const deletePurchaseOrder = (poId: string) => {
    const poToDelete = getVisibleData().purchaseOrders.find(p => p.id === poId);
    if (!poToDelete) return;
    const ownerCompanyId = poToDelete.companyId;
    const companyData = data[ownerCompanyId];
    if (companyData) {
        setCompanyData(ownerCompanyId, { purchaseOrders: companyData.purchaseOrders.filter(po => po.id !== poId) });
    }
  };

  const addCustomer = (customer: Omit<Customer, 'id' | 'totalSpent'|'companyId'>) => {
    if (!currentUser?.companyId) return;
    const newCustomer: Customer = {
        ...customer,
        id: `CUS-${Date.now()}`,
        totalSpent: 0,
        companyId: currentUser.companyId,
    };
    const currentData = data[currentUser.companyId] || { customers: [] };
    setCompanyData(currentUser.companyId, { customers: [newCustomer, ...currentData.customers] });
  };

  const updateCustomer = (customerId: string, customerData: Partial<Omit<Customer, 'id'|'companyId'>>) => {
    const customerToUpdate = getVisibleData().customers.find(c => c.id === customerId);
    if (!customerToUpdate) return;
    const ownerCompanyId = customerToUpdate.companyId;
    const companyData = data[ownerCompanyId];
    if(companyData) {
        const newCustomers = companyData.customers.map(c => c.id === customerId ? { ...c, ...customerData } : c);
        setCompanyData(ownerCompanyId, { customers: newCustomers });
    }
  };

  const deleteCustomer = (customerId: string) => {
    const customerToDelete = getVisibleData().customers.find(c => c.id === customerId);
    if (!customerToDelete) return;
    const ownerCompanyId = customerToDelete.companyId;
    const companyData = data[ownerCompanyId];
    if(companyData) {
        setCompanyData(ownerCompanyId, { customers: companyData.customers.filter(c => c.id !== customerId) });
    }
  };

  const addSupplier = (supplier: Omit<Supplier, 'id' | 'companyId'>) => {
    if (!currentUser?.companyId) return;
    const newSupplier: Supplier = {
        ...supplier,
        id: `SUP-${Date.now()}`,
        companyId: currentUser.companyId,
    };
    const currentData = data[currentUser.companyId] || { suppliers: [] };
    setCompanyData(currentUser.companyId, { suppliers: [newSupplier, ...currentData.suppliers] });
  };

  const updateSupplier = (supplierId: string, supplierData: Partial<Omit<Supplier, 'id' | 'companyId'>>) => {
    const supplierToUpdate = getVisibleData().suppliers.find(s => s.id === supplierId);
    if (!supplierToUpdate) return;
    const ownerCompanyId = supplierToUpdate.companyId;
    const companyData = data[ownerCompanyId];
    if(companyData) {
        const newSuppliers = companyData.suppliers.map(s => s.id === supplierId ? { ...s, ...supplierData } : s);
        setCompanyData(ownerCompanyId, { suppliers: newSuppliers });
    }
  };

  const deleteSupplier = (supplierId: string) => {
    const supplierToDelete = getVisibleData().suppliers.find(s => s.id === supplierId);
    if (!supplierToDelete) return;
    const ownerCompanyId = supplierToDelete.companyId;
    const companyData = data[ownerCompanyId];
    if(companyData) {
        setCompanyData(ownerCompanyId, { suppliers: companyData.suppliers.filter(s => s.id !== supplierId) });
    }
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date' | 'companyId'>) => {
    if (!currentUser?.companyId) return;
    const newTransaction: Transaction = {
        ...transaction,
        id: `TRN-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        companyId: currentUser.companyId,
    };
    const currentData = data[currentUser?.companyId] || { transactions: [] };
    setCompanyData(currentUser.companyId, { transactions: [newTransaction, ...currentData.transactions] });
  };
  
  const visibleData = getVisibleData();

  return (
    <DataContext.Provider value={{
        inventory: visibleData.inventory,
        addInventoryItem,
        removeInventoryItem,
        adjustStock,
        getItemById,
        sales: visibleData.sales,
        addSale,
        updateSaleStatus,
        purchaseOrders: visibleData.purchaseOrders,
        addPurchaseOrder,
        updatePurchaseOrder,
        deletePurchaseOrder,
        customers: visibleData.customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        suppliers: visibleData.suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        transactions: visibleData.transactions,
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
