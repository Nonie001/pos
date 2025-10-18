// ============================================
// 🎯 Orders Status Page - ดูสถานะออเดอร์ทั้งหมด
// ============================================

'use client';

import { use } from 'react';
import { useRestaurant } from '@/contexts/RestaurantContext';
import Link from 'next/link';
import { ChevronLeft, Clock, ChefHat, CheckCircle, Receipt, XCircle, DollarSign, LucideIcon } from 'lucide-react';

interface OrdersPageProps {
  params: Promise<{
    tableId: string;
  }>;
}

export default function OrdersPage({ params }: OrdersPageProps) {
  const resolvedParams = use(params);
  const { tableId } = resolvedParams;
  
  const { 
    getOrdersByTable, 
    getTable,
    updateTableStatus
  } = useRestaurant();
  
  const table = getTable(tableId);
  const orders = getOrdersByTable(tableId);
  
  // คำนวณยอดรวมจากออเดอร์ที่ยังไม่ชำระ
  const activeOrders = orders.filter(o => ['pending', 'in_progress', 'served'].includes(o.status));
  const totalAmount = activeOrders.reduce((sum, order) => sum + order.total, 0);
  
  const handleRequestCheckout = () => {
    if (!table) return;
    
    // ล็อกโต๊ะ - ไม่ให้สั่งอาหารเพิ่ม
    updateTableStatus(tableId, 'checkout_pending');
    
    alert('✅ ขอเช็กบิลเรียบร้อย\nกรุณารอเจ้าหน้าที่มารับชำระเงินที่เคาน์เตอร์');
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { text: string; color: string; icon: LucideIcon }> = {
      pending: { text: 'รอทำอาหาร', color: 'bg-orange-100 text-orange-700', icon: Clock },
      in_progress: { text: 'กำลังทำ', color: 'bg-orange-100 text-orange-700', icon: ChefHat },
      served: { text: 'เสิร์ฟแล้ว', color: 'bg-orange-100 text-orange-700', icon: CheckCircle },
      on_check: { text: 'อยู่ในบิล', color: 'bg-orange-100 text-orange-700', icon: Receipt },
      paid: { text: 'จ่ายแล้ว', color: 'bg-gray-100 text-gray-700', icon: DollarSign },
      void: { text: 'ยกเลิก', color: 'bg-gray-100 text-gray-700', icon: XCircle },
    };
    return statusMap[status] || statusMap.pending;
  };

  const canRequestCheckout = table?.status === 'open' && activeOrders.length > 0;
  const isCheckoutPending = table?.status === 'checkout_pending';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href={`/table/${tableId}/menu`}>
              <button className="p-2 hover:bg-white/20 rounded-lg">
                <ChevronLeft className="w-6 h-6" />
              </button>
            </Link>
            <div>
              <p className="text-sm opacity-90">โต๊ะ {table?.tableNumber}</p>
              <h1 className="text-xl font-bold">รายการออเดอร์</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-gray-500 mb-4">ยังไม่มีออเดอร์</p>
            <Link href={`/table/${tableId}/menu`}>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium">
                สั่งอาหาร
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Card */}
            <div className="bg-white rounded-xl shadow-md p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-500">ยอดรวมทั้งหมด</p>
                  <p className="text-3xl font-bold text-orange-600">฿{totalAmount}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">จำนวนออเดอร์</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length} รอบ</p>
                </div>
              </div>
              
              {isCheckoutPending && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3 flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <p className="text-orange-800 text-sm font-medium">
                    รอเจ้าหน้าที่มารับชำระเงิน
                  </p>
                </div>
              )}
            </div>

            {/* Orders List */}
            {orders.map((order) => {
              const statusInfo = getStatusDisplay(order.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={order.id} className="bg-white rounded-xl shadow-md p-5">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-gray-900">
                          รอบที่ {order.roundNumber}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.text}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>
                    <p className="text-xl font-bold text-orange-600">฿{order.total}</p>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-start justify-between py-2 border-t">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.menuName}</p>
                          {item.specialRequest && (
                            <p className="text-xs text-gray-500 mt-1">
                              📝 {item.specialRequest}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-gray-600">x{item.quantity}</p>
                          <p className="font-semibold text-gray-900">฿{item.subtotal}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      {orders.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t z-40 px-4 py-4">
          <div className="flex gap-2">
            <Link href={`/table/${tableId}/menu`} className="flex-1">
              <button 
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-4 rounded-xl font-bold"
                disabled={isCheckoutPending}
              >
                {isCheckoutPending ? '🔒 โต๊ะถูกล็อก' : '+ สั่งเพิ่ม'}
              </button>
            </Link>
            
            {canRequestCheckout && (
              <button
                onClick={handleRequestCheckout}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-bold shadow-lg"
              >
                💳 ขอเช็กบิล
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
