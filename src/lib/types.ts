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

export type Role = 'admin' | 'manager' | 'employee' | 'user';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  password?: string;
  companyId: string;
};

export type Company = {
    id: string;
    name: string;
};

    