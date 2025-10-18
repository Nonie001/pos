// ============================================
// 📊 Admin Dashboard - ภาพรวมร้าน
// ============================================

'use client';

import { useRestaurant } from '@/contexts/RestaurantContext';
import { Users, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const { tables, orders } = useRestaurant();

  // คำนวณสถิติ
  // หาโต๊ะที่มีออเดอร์ active (pending, in_progress, served)
  const activeOrderTableIds = new Set(
    orders
      .filter(o => ['pending', 'in_progress', 'served'].includes(o.status))
      .map(o => o.tableId)
  );
  
  // โต๊ะว่าง = โต๊ะที่ไม่มีออเดอร์ active
  const openTables = tables.filter(t => !activeOrderTableIds.has(t.id)).length;
  
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const todayRevenue = orders
    .filter(o => o.status !== 'void')
    .reduce((sum, o) => sum + o.total, 0);

  const stats = [
    {
      icon: Users,
      label: 'โต๊ะว่าง',
      value: openTables,
      total: tables.length,
      color: 'bg-orange-500',
    },
    {
      icon: ShoppingBag,
      label: 'ออเดอร์รอทำ',
      value: pendingOrders,
      total: totalOrders,
      color: 'bg-orange-500',
    },
    {
      icon: DollarSign,
      label: 'ยอดขายวันนี้',
      value: `฿${todayRevenue.toLocaleString()}`,
      total: '',
      color: 'bg-orange-500',
    },
    {
      icon: TrendingUp,
      label: 'ออเดอร์ทั้งหมด',
      value: totalOrders,
      total: 'รายการ',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">ภาพรวมร้านอาหาร</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 flex items-center justify-center rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">
                {stat.value}
                {stat.total && (
                  <span className="text-sm text-gray-500 font-normal ml-2">/ {stat.total}</span>
                )}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">ออเดอร์ล่าสุด</h2>
        
        {orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>ยังไม่มีออเดอร์</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map((order) => {
              const table = tables.find(t => t.id === order.tableId);
              return (
                <div 
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      โต๊ะ {table?.tableNumber} - รอบที่ {order.roundNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.items.length} รายการ
                    </p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-bold text-orange-600">฿{order.total}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className={`
                    inline-block px-2 py-1 rounded text-xs font-medium
                    ${order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      order.status === 'in_progress' ? 'bg-orange-100 text-orange-700' :
                      order.status === 'served' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'}
                  `}>
                    {order.status === 'pending' ? 'รอทำ' :
                     order.status === 'in_progress' ? 'กำลังทำ' :
                     order.status === 'served' ? 'เสิร์ฟแล้ว' : order.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
