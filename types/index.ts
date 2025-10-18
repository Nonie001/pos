// ============================================
// 🎯 ระบบสั่งอาหาร - Type Definitions
// ============================================

// 📌 Table Status Flow:
// open → checkout_pending → locked → closed
export type TableStatus = 'open' | 'checkout_pending' | 'locked' | 'closed';

export interface Table {
  id: string;
  tableNumber: string;
  status: TableStatus;
  qrCode: string;
  capacity: number;
  currentSessionId?: string; // session ปัจจุบัน
  createdAt: Date;
  updatedAt: Date;
}

// 📌 Order Status Flow:
// pending → in_progress → served → on_check → paid | void
export type OrderStatus = 'pending' | 'in_progress' | 'served' | 'on_check' | 'paid' | 'void';

export interface OrderItem {
  id: string;
  menuId: string;
  menuName: string;
  menuPrice: number;
  quantity: number;
  specialRequest?: string;
  subtotal: number;
}

export interface Order {
  id: string;
  tableId: string;
  sessionId: string; // รวมออเดอร์ในโต๊ะเดียวกัน
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  servedAt?: Date;
  roundNumber: number; // สั่งรอบที่เท่าไหร่ในโต๊ะเดียว
}

// 📌 Check/Bill Status Flow:
// draft → presented → paid | void
export type CheckStatus = 'draft' | 'presented' | 'paid' | 'void';

export interface Check {
  id: string;
  tableId: string;
  sessionId: string;
  orderIds: string[]; // รวมทุก order ในโต๊ะ
  subtotal: number;
  discount: number;
  tax: number;
  serviceCharge: number;
  total: number;
  status: CheckStatus;
  receiptNumber?: string;
  createdAt: Date;
  paidAt?: Date;
  cashierId?: string;
}

// 📌 Payment Status:
// success | refunded | void
export type PaymentStatus = 'success' | 'refunded' | 'void';
export type PaymentMethod = 'cash' | 'transfer' | 'promptpay' | 'card';

export interface Payment {
  id: string;
  checkId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef?: string;
  createdAt: Date;
  cashierId: string;
}

// 📌 Menu & Category
export interface MenuCategory {
  id: string;
  name: string;
  nameEn?: string;
  icon: string; // ชื่อ icon component เช่น 'UtensilsCrossed', 'Flame'
  order: number;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  categoryId: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  isRecommended?: boolean;
  preparationTime?: number; // นาที
  tags?: string[];
}

// 📌 Session - ใช้รวมออเดอร์ทั้งหมดในโต๊ะเดียวกัน
export interface TableSession {
  id: string;
  tableId: string;
  startedAt: Date;
  endedAt?: Date;
  orderCount: number;
  totalAmount: number;
  isActive: boolean;
}

// 📌 Cart Item (สำหรับฝั่งลูกค้า - local state)
export interface CartItem {
  menuId: string;
  menuName: string;
  price: number;
  quantity: number;
  specialRequest?: string;
}
