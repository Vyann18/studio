import type { InventoryItem, User, Category } from './types';

// NOTE: The user list here is for initial state and profile information.
// Passwords are NOT stored here and are managed exclusively by Firebase Authentication.
export const users: User[] = [
  {
    id: 'user-1',
    name: 'Admin User',
    email: 'adminuser@example.com',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?u=admin',
    companyId: 'EJY1UT'
  },
  {
    id: 'user-2',
    name: 'Manager User',
    email: 'manager@example.com',
    role: 'manager',
    avatar: 'https://i.pravatar.cc/150?u=manager',
    companyId: 'EJY1UT'
  },
  {
    id: 'user-3',
    name: 'Employee User',
    email: 'employee@example.com',
    role: 'employee',
    avatar: 'https://i.pravatar.cc/150?u=employee',
    companyId: 'EJY1UT'
  },
];

export const categories: Category[] = ['Electronics', 'Apparel', 'Groceries', 'Books', 'Home Goods'];
export const suppliers: string[] = ['TechGear Inc.', 'Fashion Hub', 'Global Foods', 'PrintWorks', 'HomeEssence', 'SoundMax', 'ActiveLife'];


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
  {
    id: 'item-4',
    name: 'The Great Gatsby',
    sku: 'BK-TGG-01',
    quantity: 120,
    category: 'Books',
    supplier: 'PrintWorks',
    cost: 5,
    price: 15.0,
    lastUpdated: '2024-05-15T11:45:00Z',
    history: [
      { date: '2024-04-01', quantity: 150 },
      { date: '2024-04-15', quantity: 140 },
      { date: '2024-05-01', quantity: 130 },
      { date: '2024-05-15', quantity: 120 },
    ],
  },
  {
    id: 'item-5',
    name: 'Scented Candle',
    sku: 'HM-SC-LAV',
    quantity: 200,
    category: 'Home Goods',
    supplier: 'HomeEssence',
    cost: 7.5,
    price: 18.0,
    lastUpdated: '2024-05-21T16:00:00Z',
    history: [
      { date: '2024-04-01', quantity: 250 },
      { date: '2024-04-15', quantity: 230 },
      { date: '2024-05-01', quantity: 210 },
      { date: '2024-05-21', quantity: 200 },
    ],
  },
  {
    id: 'item-6',
    name: 'Bluetooth Speaker',
    sku: 'BS-2024',
    quantity: 0,
    category: 'Electronics',
    supplier: 'SoundMax',
    cost: 45,
    price: 99.99,
    lastUpdated: '2024-05-19T18:00:00Z',
    history: [
      { date: '2024-04-01', quantity: 50 },
      { date: '2024-04-15', quantity: 30 },
      { date: '2024-05-01', quantity: 10 },
      { date: '2024-05-19', quantity: 0 },
    ],
  },
  {
    id: 'item-7',
    name: 'Yoga Mat',
    sku: 'HM-YM-01',
    quantity: 90,
    category: 'Home Goods',
    supplier: 'ActiveLife',
    cost: 15,
    price: 35.0,
    lastUpdated: '2024-05-23T12:00:00Z',
    history: [
        { date: '2024-04-01', quantity: 120 },
        { date: '2024-04-15', quantity: 110 },
        { date: '2024-05-01', quantity: 100 },
        { date: '2024-05-23', quantity: 90 },
    ]
  },
];

    
