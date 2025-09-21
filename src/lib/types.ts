export type Category = 'Electronics' | 'Apparel' | 'Groceries' | 'Books' | 'Home Goods';

export type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  category: Category;
  supplier: string;
  cost: number;
  price: number;
  lastUpdated: string;
  history: { date: string; quantity: number }[];
};

export type Role = 'admin' | 'manager' | 'employee';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
};
