// ============================================
// 🎯 Restaurant Context - จัดการ State ทั้งหมด
// ============================================

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  Table, 
  Order, 
  CartItem, 
  MenuItem, 
  MenuCategory,
  TableSession,
  OrderItem 
} from '@/types';
import { mockMenuItems, mockCategories, mockTables } from '@/lib/mockData';

// ============================================
// Context Type Definitions
// ============================================

interface RestaurantContextType {
  // Menu & Categories
  categories: MenuCategory[];
  menuItems: MenuItem[];
  getMenuByCategory: (categoryId: string) => MenuItem[];
  getMenuItem: (menuId: string) => MenuItem | undefined;
  addMenuItem: (data: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (menuId: string, data: Partial<MenuItem>) => void;
  removeMenuItem: (menuId: string) => void;
  
  // Table Management
  tables: Table[];
  getTable: (tableId: string) => Table | undefined;
  updateTableStatus: (tableId: string, status: Table['status']) => void;
  addTable: (tableNumber: string, capacity: number) => void;
  removeTable: (tableId: string) => void;
  
  // Cart Management (Client Side)
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number) => void;
  removeFromCart: (menuId: string) => void;
  updateCartQuantity: (menuId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  
  // Order Management
  orders: Order[];
  currentTableOrders: Order[];
  submitOrder: (tableId: string, specialRequests?: Map<string, string>) => Promise<Order>;
  getOrdersByTable: (tableId: string) => Order[];
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  
  // Session Management
  currentSession: TableSession | null;
  startTableSession: (tableId: string) => TableSession;
  endTableSession: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

// ============================================
// Provider Component
// ============================================

export function RestaurantProvider({ children }: { children: ReactNode }) {
  // State
  const [categories] = useState<MenuCategory[]>(mockCategories);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    // Load menuItems from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pos_menuItems');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved menuItems:', e);
        }
      }
    }
    return mockMenuItems;
  });
  const [tables, setTables] = useState<Table[]>(() => {
    // Load tables from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pos_tables');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.map((table: Table) => ({
            ...table,
            createdAt: new Date(table.createdAt),
            updatedAt: new Date(table.updatedAt),
          }));
        } catch (e) {
          console.error('Failed to parse saved tables:', e);
        }
      }
    }
    return mockTables;
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => {
    // Load orders from localStorage on init
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pos_orders');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Convert date strings back to Date objects
          return parsed.map((order: Order) => ({
            ...order,
            createdAt: new Date(order.createdAt),
            updatedAt: new Date(order.updatedAt),
            servedAt: order.servedAt ? new Date(order.servedAt) : undefined,
          }));
        } catch (e) {
          console.error('Failed to parse saved orders:', e);
        }
      }
    }
    return [];
  });
  const [currentSession, setCurrentSession] = useState<TableSession | null>(null);
  const [currentTableOrders, setCurrentTableOrders] = useState<Order[]>([]);

  // Save to localStorage whenever they change
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pos_orders', JSON.stringify(orders));
    }
  }, [orders]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pos_tables', JSON.stringify(tables));
    }
  }, [tables]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pos_menuItems', JSON.stringify(menuItems));
    }
  }, [menuItems]);

  // ============================================
  // Menu Functions
  // ============================================
  
  const getMenuByCategory = useCallback((categoryId: string) => {
    return menuItems.filter(item => item.categoryId === categoryId && item.isAvailable);
  }, [menuItems]);

  const getMenuItem = useCallback((menuId: string) => {
    return menuItems.find(item => item.id === menuId);
  }, [menuItems]);

  const addMenuItem = useCallback((data: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      id: `menu-${Date.now()}`,
      ...data,
    };
    setMenuItems(prev => [...prev, newItem]);
  }, []);

  const updateMenuItem = useCallback((menuId: string, data: Partial<MenuItem>) => {
    setMenuItems(prev => prev.map(item =>
      item.id === menuId ? { ...item, ...data } : item
    ));
  }, []);

  const removeMenuItem = useCallback((menuId: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== menuId));
  }, []);

  // ============================================
  // Table Functions
  // ============================================
  
  const getTable = useCallback((tableId: string) => {
    return tables.find(t => t.id === tableId);
  }, [tables]);

  const updateTableStatus = useCallback((tableId: string, status: Table['status']) => {
    setTables(prev => prev.map(table => 
      table.id === tableId ? { ...table, status, updatedAt: new Date() } : table
    ));
  }, []);

  const addTable = useCallback((tableNumber: string, capacity: number) => {
    const newTable: Table = {
      id: `table-${Date.now()}`,
      tableNumber,
      capacity,
      status: 'open',
      qrCode: `${tableNumber}`,
      currentSessionId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTables(prev => [...prev, newTable]);
  }, []);

  const removeTable = useCallback((tableId: string) => {
    setTables(prev => prev.filter(table => table.id !== tableId));
  }, []);

  // ============================================
  // Cart Functions
  // ============================================
  
  const addToCart = useCallback((item: MenuItem, quantity: number = 1) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.menuId === item.id);
      
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.menuId === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      
      return [...prev, {
        menuId: item.id,
        menuName: item.name,
        price: item.price,
        quantity,
      }];
    });
  }, []);

  const removeFromCart = useCallback((menuId: string) => {
    setCart(prev => prev.filter(item => item.menuId !== menuId));
  }, []);

  const updateCartQuantity = useCallback((menuId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuId);
      return;
    }
    
    setCart(prev => prev.map(item =>
      item.menuId === menuId ? { ...item, quantity } : item
    ));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const getCartItemCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // ============================================
  // Session Functions
  // ============================================
  
  const startTableSession = useCallback((tableId: string): TableSession => {
    const newSession: TableSession = {
      id: `session-${Date.now()}`,
      tableId,
      startedAt: new Date(),
      orderCount: 0,
      totalAmount: 0,
      isActive: true,
    };

    setCurrentSession(newSession);
    
    // Update table status without triggering re-render loop
    setTables(prev => prev.map(table => 
      table.id === tableId 
        ? { ...table, status: 'open' as const, currentSessionId: newSession.id, updatedAt: new Date() } 
        : table
    ));
    
    return newSession;
  }, []);

  const endTableSession = useCallback(() => {
    if (currentSession) {
      setCurrentSession(prev => prev ? { ...prev, isActive: false, endedAt: new Date() } : null);
      setCurrentTableOrders([]);
    }
  }, [currentSession]);

  // ============================================
  // Order Functions
  // ============================================
  
  const submitOrder = useCallback(async (
    tableId: string, 
    specialRequests?: Map<string, string>
  ): Promise<Order> => {
    if (cart.length === 0) {
      throw new Error('ตะกร้าสินค้าว่างเปล่า');
    }

    const table = getTable(tableId);
    if (!table) {
      throw new Error('ไม่พบโต๊ะนี้');
    }

    if (table.status === 'locked' || table.status === 'closed') {
      throw new Error('โต๊ะนี้ไม่สามารถรับออเดอร์ได้');
    }

    // Start session if not exists
    let session = currentSession;
    if (!session || session.tableId !== tableId) {
      session = startTableSession(tableId);
    }

    // Create order items from cart
    const orderItems: OrderItem[] = cart.map(cartItem => ({
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      menuId: cartItem.menuId,
      menuName: cartItem.menuName,
      menuPrice: cartItem.price,
      quantity: cartItem.quantity,
      specialRequest: specialRequests?.get(cartItem.menuId),
      subtotal: cartItem.price * cartItem.quantity,
    }));

    const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const roundNumber = orders.filter(o => o.sessionId === session.id).length + 1;

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      tableId,
      sessionId: session.id,
      items: orderItems,
      status: 'pending',
      total,
      createdAt: new Date(),
      updatedAt: new Date(),
      roundNumber,
    };

    // Update states
    setOrders(prev => [...prev, newOrder]);
    setCurrentTableOrders(prev => [...prev, newOrder]);
    
    // Update session
    setCurrentSession(prev => prev ? {
      ...prev,
      orderCount: prev.orderCount + 1,
      totalAmount: prev.totalAmount + total,
    } : null);

    // Clear cart
    clearCart();

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    return newOrder;
  }, [cart, currentSession, getTable, clearCart, orders, startTableSession]);

  const getOrdersByTable = useCallback((tableId: string) => {
    return orders.filter(order => order.tableId === tableId);
  }, [orders]);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId 
        ? { ...order, status, updatedAt: new Date() }
        : order
    ));
  }, []);

  // ============================================
  // Context Value
  // ============================================
  
  const value: RestaurantContextType = {
    categories,
    menuItems,
    getMenuByCategory,
    getMenuItem,
    addMenuItem,
    updateMenuItem,
    removeMenuItem,
    tables,
    getTable,
    updateTableStatus,
    addTable,
    removeTable,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    orders,
    currentTableOrders,
    submitOrder,
    getOrdersByTable,
    updateOrderStatus,
    currentSession,
    startTableSession,
    endTableSession,
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}

// ============================================
// Custom Hook
// ============================================

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
}
