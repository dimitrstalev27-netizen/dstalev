export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt?: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  price: number;
  location: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type OperationType = 'in' | 'out';

export interface StockOperation {
  id: string;
  itemId: string;
  itemName: string;
  itemSku: string;
  type: OperationType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  performedBy: string;
  performedByName: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  itemCount: number;
}

export interface DashboardStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  recentOperations: number;
  categoriesCount: number;
}
