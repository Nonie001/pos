// ============================================
// 📋 Admin Orders - จัดการออเดอร์ทั้งหมด
// ============================================

'use client';

import { useRestaurant } from '@/contexts/RestaurantContext';
import { Clock, CheckCircle, ChefHat, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function AdminOrdersPage() {
  const { orders, tables, updateOrderStatus } = useRestaurant();
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'served'>('all');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleOrder = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // แยกออเดอร์ตามสถานะ
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const inProgressOrders = orders.filter(o => o.status === 'in_progress');
  const servedOrders = orders.filter(o => o.status === 'served');

  const filteredOrders = filter === 'all' 
    ? orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : orders
        .filter(o => o.status === filter)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'in_progress':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'served':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'in_progress':
        return <ChefHat className="w-5 h-5" />;
      case 'served':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'รอทำ';
      case 'in_progress':
        return 'กำลังทำ';
      case 'served':
        return 'เสิร์ฟแล้ว';
      default:
        return status;
    }
  };

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">จัดการออเดอร์</h1>
        <p className="text-gray-600 mt-1">ติดตามและจัดการออเดอร์ทั้งหมด</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">รอทำอาหาร</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{pendingOrders.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">กำลังทำ</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{inProgressOrders.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">เสิร์ฟแล้ว</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{servedOrders.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 bg-white rounded-lg p-2 shadow-sm">
        {[
          { value: 'all', label: 'ทั้งหมด', count: orders.length },
          { value: 'pending', label: 'รอทำ', count: pendingOrders.length },
          { value: 'in_progress', label: 'กำลังทำ', count: inProgressOrders.length },
          { value: 'served', label: 'เสิร์ฟแล้ว', count: servedOrders.length },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as 'all' | 'pending' | 'in_progress' | 'served')}
            className={`
              flex-1 py-3 px-4 rounded-lg font-medium transition-all
              ${filter === tab.value 
                ? 'bg-orange-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">ไม่มีออเดอร์</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const table = tables.find(t => t.id === order.tableId);
            const isExpanded = expandedOrders.has(order.id);
            
            return (
              <div 
                key={order.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Compact Header - Always Visible */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    {/* Left: Table Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">โต๊ะ {table?.tableNumber}</h3>
                        <p className="text-sm text-gray-500">{order.items.length} รายการ</p>
                      </div>
                    </div>

                    {/* Middle: Status Badge */}
                    <div className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 font-medium text-sm
                      ${getStatusColor(order.status)}
                    `}>
                      {getStatusIcon(order.status)}
                      {getStatusText(order.status)}
                    </div>

                    {/* Right: Price & Expand Button */}
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-orange-600">฿{order.total}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleOrder(order.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content - Items & Actions */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {/* Items List */}
                      <div className="space-y-2 mb-4">
                        {order.items.map((item) => (
                          <div 
                            key={item.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{item.menuName}</p>
                              {item.specialRequest && (
                                <p className="text-sm text-orange-600 mt-1">
                                  📝 {item.specialRequest}
                                </p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-gray-600">x{item.quantity}</p>
                              <p className="font-bold text-gray-900">฿{item.subtotal}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'in_progress')}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md min-h-[48px] touch-manipulation"
                          >
                            เริ่มทำอาหาร
                          </button>
                        )}
                        {order.status === 'in_progress' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'served')}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md min-h-[48px] touch-manipulation"
                          >
                            เสิร์ฟแล้ว
                          </button>
                        )}
                        {order.status === 'served' && (
                          <span className="text-green-600 font-medium px-4 py-2">
                            ✅ เสร็จสิ้น
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
