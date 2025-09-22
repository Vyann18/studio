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
  companyId: string; // Keep track of original company
};

export type Role = 'admin' | 'manager' | 'head' | 'employee';

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
    address: string;
    groupId?: string;
};

export type CompanyGroup = {
    id: string;
    name: string;
}

export type Sale = {
    id: string;
    customer: string;
    date: string;
    status: 'Paid' | 'Pending';
    total: number;
    companyId: string;
}

export type PurchaseOrder = {
    id: string;
    supplier: string;
    date: string;
    status: 'Pending' | 'Shipped' | 'Delivered';
    total: number;
    companyId: string;
}

export type Customer = {
    id: string;
    name: string;
    email: string;
    totalSpent: number;
    companyId: string;
}

export type Supplier = {
    id: string;
    name: string;
    contact: string;
    category: string;
    companyId: string;
};

export type Transaction = {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'Cash In' | 'Cash Out';
    companyId: string;
};
