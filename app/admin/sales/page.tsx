// ============================================
// 📊 Admin Sales - รายงานยอดขาย
// ============================================

'use client';

import { useRestaurant } from '@/contexts/RestaurantContext';
import { TrendingUp, DollarSign, ShoppingBag, TrendingDown, Calendar } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function AdminSalesPage() {
  const { orders, menuItems, tables } = useRestaurant();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  // Filter orders by period
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      if (selectedPeriod === 'today') return orderDate >= startOfToday;
      if (selectedPeriod === 'week') return orderDate >= startOfWeek;
      if (selectedPeriod === 'month') return orderDate >= startOfMonth;
      return true;
    });
  }, [orders, selectedPeriod]);

  // Calculate statistics
  const stats = useMemo(() => {
    const paidOrders = filteredOrders.filter(o => o.status === 'paid');
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / paidOrders.length : 0;

    // Menu item sales
    const itemSales = new Map<string, { count: number; revenue: number }>();
    paidOrders.forEach(order => {
      order.items.forEach(item => {
        const current = itemSales.get(item.menuId) || { count: 0, revenue: 0 };
        itemSales.set(item.menuId, {
          count: current.count + item.quantity,
          revenue: current.revenue + (item.menuPrice * item.quantity),
        });
      });
    });

    // Top items
    const topItems = Array.from(itemSales.entries())
      .map(([menuId, data]) => ({
        menuId,
        menuName: menuItems.find(m => m.id === menuId)?.name || 'ไม่ระบุ',
        ...data,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      topItems,
      paidOrders: paidOrders.length,
    };
  }, [filteredOrders, menuItems]);

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">รายงานยอดขาย</h1>
          <p className="text-gray-600 mt-1">สรุปรายได้และยอดขาย</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg overflow-x-auto">
          <button
            onClick={() => setSelectedPeriod('today')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedPeriod === 'today'
                ? 'bg-white text-orange-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            วันนี้
          </button>
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedPeriod === 'week'
                ? 'bg-white text-orange-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            7 วันที่แล้ว
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedPeriod === 'month'
                ? 'bg-white text-orange-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            เดือนนี้
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">รายได้รวม</p>
          <p className="text-3xl font-bold text-gray-900">฿{stats.totalRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">ออเดอร์ทั้งหมด</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
          <p className="text-gray-500 text-xs mt-1">({stats.paidOrders} ชำระแล้ว)</p>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">ค่าเฉลี่ยต่อออเดอร์</p>
          <p className="text-3xl font-bold text-gray-900">฿{stats.averageOrderValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</p>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">อัตราชำระเงิน</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalOrders > 0 ? ((stats.paidOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      {/* Top Items */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-orange-500" />
          เมนูขายดี Top 5
        </h2>

        {stats.topItems.length > 0 ? (
          <div className="space-y-4">
            {stats.topItems.map((item, index) => (
              <div key={item.menuId} className="flex items-center gap-4">
                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg
                  ${index === 0 ? 'bg-orange-500 text-white' : ''}
                  ${index === 1 ? 'bg-orange-400 text-white' : ''}
                  ${index === 2 ? 'bg-orange-300 text-white' : ''}
                  ${index >= 3 ? 'bg-gray-200 text-gray-600' : ''}
                `}>
                  {index + 1}
                </div>

                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.menuName}</p>
                  <p className="text-sm text-gray-500">ขายได้ {item.count} จาน</p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-green-600 text-lg">
                    ฿{item.revenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingDown className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">ยังไม่มีข้อมูลยอดขาย</p>
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-orange-500" />
          ออเดอร์ล่าสุด
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">เลขออเดอร์</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">โต๊ะ</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">รายการ</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">ยอดรวม</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">สถานะ</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">เวลา</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.slice(0, 10).map((order) => {
                const table = tables.find(t => t.id === order.tableId);
                return (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm text-gray-600">
                      #{order.id.slice(-6)}
                    </td>
                    <td className="py-3 px-4 font-medium">โต๊ะ {table?.tableNumber || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} รายการ
                    </td>
                    <td className="py-3 px-4 font-bold text-green-600">
                      ฿{order.total.toFixed(2)}
                    </td>
                  <td className="py-3 px-4">
                    <span className={`
                      inline-block px-2 py-1 rounded text-xs font-medium
                      ${order.status === 'paid' ? 'bg-orange-100 text-orange-700' : ''}
                      ${order.status === 'pending' ? 'bg-orange-100 text-orange-700' : ''}
                      ${order.status === 'in_progress' ? 'bg-orange-100 text-orange-700' : ''}
                      ${order.status === 'served' ? 'bg-orange-100 text-orange-700' : ''}
                    `}>
                      {order.status === 'paid' && 'ชำระแล้ว'}
                      {order.status === 'pending' && 'รอดำเนินการ'}
                      {order.status === 'in_progress' && 'กำลังทำ'}
                      {order.status === 'served' && 'เสิร์ฟแล้ว'}
                    </span>
                  </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-8">
            <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">ยังไม่มีออเดอร์ในช่วงเวลานี้</p>
          </div>
        )}
      </div>
    </div>
  );
}
