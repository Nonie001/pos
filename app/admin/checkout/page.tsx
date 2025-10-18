// ============================================
// 💰 Admin Checkout - หน้าคิดเงิน
// ============================================

'use client';

import { useRestaurant } from '@/contexts/RestaurantContext';
import { Receipt, DollarSign, Clock, CheckCircle, AlertCircle, Printer } from 'lucide-react';
import { useState } from 'react';

export default function AdminCheckoutPage() {
  const { tables, orders, updateOrderStatus, updateTableStatus } = useRestaurant();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  // หาโต๊ะที่มีออเดอร์ที่ยังไม่ได้ชำระ (served)
  const tablesWithOrders = tables
    .map(table => {
      const tableOrders = orders.filter(
        o => o.tableId === table.id && 
        ['pending', 'in_progress', 'served'].includes(o.status)
      );
      
      if (tableOrders.length === 0) return null;
      
      const total = tableOrders.reduce((sum, order) => sum + order.total, 0);
      const hasUnserved = tableOrders.some(o => o.status !== 'served');
      
      return {
        table,
        orders: tableOrders,
        total,
        hasUnserved,
      };
    })
    .filter(Boolean);

  const handlePrintBill = (tableId: string) => {
    // TODO: Implement print functionality
    alert('พิมพ์บิลสำหรับโต๊ะ');
  };

  const handlePayment = (tableId: string) => {
    if (confirm('ยืนยันการชำระเงินและปิดโต๊ะ?')) {
      // อัพเดตสถานะออเดอร์ทั้งหมดของโต๊ะเป็น paid
      const tableOrders = orders.filter(
        o => o.tableId === tableId && 
        ['pending', 'in_progress', 'served'].includes(o.status)
      );
      
      tableOrders.forEach(order => {
        updateOrderStatus(order.id, 'paid');
      });
      
      // รีเซ็ตสถานะโต๊ะกลับเป็น open
      updateTableStatus(tableId, 'open');
      
      setSelectedTable(null);
      alert('ชำระเงินเรียบร้อย! โต๊ะพร้อมให้บริการแล้ว');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">คิดเงิน</h1>
        <p className="text-gray-600 mt-1">จัดการการชำระเงินของแต่ละโต๊ะ</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">โต๊ะที่รอชำระเงิน</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{tablesWithOrders.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Receipt className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">ยอดรวมทั้งหมด</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">
                ฿{tablesWithOrders.reduce((sum, item) => sum + (item?.total || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">โต๊ะที่ยังไม่เสิร์ฟ</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {tablesWithOrders.filter(item => item?.hasUnserved).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tables List */}
      <div className="space-y-4">
        {tablesWithOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">ไม่มีโต๊ะที่รอชำระเงิน</p>
          </div>
        ) : (
          tablesWithOrders.map((item) => {
            if (!item) return null;
            
            const { table, orders: tableOrders, total, hasUnserved } = item;
            const isExpanded = selectedTable === table.id;

            return (
              <div
                key={table.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Header */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Left: Table Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white">
                        <span className="text-2xl font-bold">{table.tableNumber}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">โต๊ะ {table.tableNumber}</h3>
                        <p className="text-sm text-gray-600">{tableOrders.length} ออเดอร์</p>
                        {hasUnserved && (
                          <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3 h-3" />
                            ยังมีออเดอร์ที่ยังไม่เสิร์ฟ
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Total & Actions */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">ยอดรวม</p>
                        <p className="text-3xl font-bold text-orange-600">฿{total.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => setSelectedTable(isExpanded ? null : table.id)}
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all shadow-md"
                      >
                        {isExpanded ? 'ซ่อน' : 'ดูรายละเอียด'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      {/* Orders List */}
                      <div className="space-y-4 mb-6">
                        {tableOrders.map((order) => (
                          <div key={order.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="font-semibold text-gray-900">รอบที่ {order.roundNumber}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(order.createdAt).toLocaleString('th-TH')}
                                </p>
                              </div>
                              <span className={`
                                px-3 py-1 rounded-lg text-xs font-medium
                                ${order.status === 'served' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-orange-100 text-orange-700'
                                }
                              `}>
                                {order.status === 'pending' && 'รอทำ'}
                                {order.status === 'in_progress' && 'กำลังทำ'}
                                {order.status === 'served' && 'เสิร์ฟแล้ว'}
                              </span>
                            </div>
                            
                            {/* Items */}
                            <div className="space-y-2">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-700">
                                    {item.menuName} x{item.quantity}
                                  </span>
                                  <span className="font-semibold text-gray-900">
                                    ฿{item.subtotal}
                                  </span>
                                </div>
                              ))}
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between font-bold">
                              <span>รวม</span>
                              <span className="text-orange-600">฿{order.total}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total Summary */}
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 mb-6">
                        <div className="space-y-2">
                          <div className="flex justify-between text-gray-700">
                            <span>ยอดรวมทั้งหมด</span>
                            <span className="font-semibold">฿{total.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-gray-700">
                            <span>ภาษี 7%</span>
                            <span className="font-semibold">฿{Math.round(total * 0.07).toLocaleString()}</span>
                          </div>
                          <div className="pt-2 border-t-2 border-orange-200 flex justify-between text-xl font-bold text-orange-600">
                            <span>ยอดชำระทั้งสิ้น</span>
                            <span>฿{Math.round(total * 1.07).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handlePrintBill(table.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-all shadow-md"
                        >
                          <Printer className="w-5 h-5" />
                          พิมพ์บิล
                        </button>
                        <button
                          onClick={() => handlePayment(table.id)}
                          disabled={hasUnserved}
                          className={`
                            flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all shadow-md
                            ${hasUnserved 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                              : 'bg-green-500 hover:bg-green-600 text-white'
                            }
                          `}
                        >
                          <CheckCircle className="w-5 h-5" />
                          {hasUnserved ? 'รอเสิร์ฟให้ครบก่อน' : 'ชำระเงินและปิดโต๊ะ'}
                        </button>
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
