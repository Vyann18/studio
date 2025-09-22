import type { InventoryItem, User, Category, Sale, PurchaseOrder, Customer, Supplier, Transaction } from './types';

export const users: User[] = [
  {
    id: 'admin-user',
    name: 'Admin User',
    email: 'adminuser@example.com',
    password: 'vyan16231#',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?u=admin-user',
    companyId: 'EJY1UT',
  },
  {
    id: 'manager-user',
    name: 'Manager User',
    email: 'manager@example.com',
    password: 'password123',
    role: 'manager',
    avatar: 'https://i.pravatar.cc/150?u=manager-user',
    companyId: 'EJY1UT',
  },
  {
    id: 'employee-user',
    name: 'Employee User',
    email: 'employee@example.com',
    password: 'password123',
    role: 'employee',
    avatar: 'https://i.pravatar.cc/150?u=employee-user',
    companyId: 'EJY1UT',
  }
];

export const categories: Category[] = ['Electronics', 'Apparel', 'Groceries', 'Books', 'Home Goods'];

// This is now just for populating the dropdowns, not the actual supplier list
export const supplierNames: string[] = ['TechGear Inc.', 'Fashion Hub', 'Global Foods', 'PrintWorks', 'HomeEssence', 'SoundMax', 'ActiveLife'];


export const inventoryItems: InventoryItem[] = [
  {
    id: 'item-1',
    name: 'Wireless Mouse',
    sku: 'WM-1001',
    quantity: 150,
    category: 'Electronics',
    supplier: 'TechGear Inc.',
    cost: 12.5,
    price: 29.99,
    lastUpdated: '2024-05-20T10:00:00Z',
    history: [
      { date: '2024-04-01', quantity: 200 },
      { date: '2024-04-15', quantity: 180 },
      { date: '2024-05-01', quantity: 160 },
      { date: '2024-05-20', quantity: 150 },
    ],
  },
  {
    id: 'item-2',
    name: 'Men\'s T-Shirt',
    sku: 'TS-M-002',
    quantity: 8,
    category: 'Apparel',
    supplier: 'Fashion Hub',
    cost: 8,
    price: 19.99,
    lastUpdated: '2024-05-22T14:30:00Z',
    history: [
      { date: '2024-04-01', quantity: 150 },
      { date: '2024-04-15', quantity: 100 },
      { date: '2024-05-01', quantity: 50 },
      { date: '2024-05-22', quantity: 8 },
    ],
  },
  {
    id: 'item-3',
    name: 'Organic Coffee Beans',
    sku: 'OCB-500G',
    quantity: 75,
    category: 'Groceries',
    supplier: 'Global Foods',
    cost: 10,
    price: 22.5,
    lastUpdated: '2024-05-18T09:00:00Z',
    history: [
      { date: '2024-04-01', quantity: 100 },
      { date: '2024-04-15', quantity: 90 },
      { date: '2024-05-01', quantity: 80 },
      { date: '2024-05-18', quantity: 75 },
    ],
  },
];

export const sales: Sale[] = [
    { id: 'INV-001', customer: 'Alice Smith', date: '2024-05-28', status: 'Paid', total: 299.90 },
    { id: 'INV-002', customer: 'Bob Johnson', date: '2024-05-27', status: 'Pending', total: 199.90 },
];

export const purchaseOrders: PurchaseOrder[] = [
    { id: 'PO-001', supplier: 'TechGear Inc.', date: '2024-05-28', status: 'Delivered', total: 1250.00 },
    { id: 'PO-002', supplier: 'Fashion Hub', date: '2024-05-27', status: 'Shipped', total: 800.00 },
];

export const customers: Customer[] = [
    { id: 'CUS-01', name: 'Alice Smith', email: 'alice@example.com', totalSpent: 1250.50 },
    { id: 'CUS-02', name: 'Bob Johnson', email: 'bob@example.com', totalSpent: 850.00 },
];

export const suppliers: Supplier[] = [
    { id: 'SUP-01', name: 'TechGear Inc.', contact: 'john@techgear.com', category: 'Electronics' },
    { id: 'SUP-02', name: 'Fashion Hub', contact: 'jane@fashionhub.com', category: 'Apparel' },
];

export const transactions: Transaction[] = [
    { id: 'TRN-001', date: '2024-05-28', description: 'Sale of 10 Wireless Mouses', amount: 299.90, type: 'Cash In' },
    { id: 'TRN-002', date: '2024-05-27', description: 'Purchase of T-Shirts from Fashion Hub', amount: -200.00, type: 'Cash Out' },
];
