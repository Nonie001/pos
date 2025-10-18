// ============================================
// 🪑 Admin Tables - จัดการโต๊ะและ QR Code
// ============================================

'use client';

import { useRestaurant } from '@/contexts/RestaurantContext';
import { Plus, QrCode, Download, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Table } from '@/types';

export default function AdminTablesPage() {
  const { tables, addTable, removeTable, orders } = useRestaurant();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  // หาโต๊ะที่มีออเดอร์ active
  const activeOrderTableIds = new Set(
    orders
      .filter(o => ['pending', 'in_progress', 'served'].includes(o.status))
      .map(o => o.tableId)
  );

  // ฟังก์ชันตรวจสอบสถานะโต๊ะจริง
  const getTableStatus = (table: Table) => {
    return activeOrderTableIds.has(table.id) ? 'occupied' : 'open';
  };

  const handleShowQR = (table: Table) => {
    setSelectedTable(table);
    setShowQRModal(true);
  };

  const handleDownloadQR = (tableNumber: string) => {
    const canvas = document.getElementById(`qr-${tableNumber}`) as HTMLCanvasElement;
    if (!canvas) return;

    const svg = canvas.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `table-${tableNumber}-qr.svg`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'occupied':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'locked':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'checkout_pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'ว่าง';
      case 'occupied':
        return 'ไม่ว่าง';
      case 'locked':
        return 'ล็อก';
      case 'checkout_pending':
        return 'รอชำระ';
      default:
        return 'ปิด';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการโต๊ะ</h1>
          <p className="text-gray-600 mt-1">จัดการโต๊ะและ QR Code</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          เพิ่มโต๊ะใหม่
        </button>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => {
          const currentStatus = getTableStatus(table);
          
          return (
            <div
              key={table.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">โต๊ะ {table.tableNumber}</h3>
                    <div className="flex items-center gap-1 text-sm opacity-90 mt-1">
                      <Users className="w-4 h-4" />
                      <span>{table.capacity} ที่นั่ง</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {/* Status */}
                <div className="mb-4">
                  <span className={`
                    inline-block px-3 py-1 rounded-full text-sm font-medium border-2
                    ${getStatusColor(currentStatus)}
                  `}>
                    {getStatusText(currentStatus)}
                  </span>
                </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => handleShowQR(table)}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition-all shadow-md"
                >
                  <QrCode className="w-5 h-5" />
                  ดู QR Code
                </button>

                <button
                  onClick={() => {
                    if (confirm(`ยืนยันการลบโต๊ะ ${table.tableNumber}?`)) {
                      removeTable(table.id);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-all shadow-md"
                >
                  <Trash2 className="w-5 h-5" />
                  ลบโต๊ะ
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* Add Table Modal */}
      {showAddModal && (
        <AddTableModal
          onClose={() => setShowAddModal(false)}
          onAdd={addTable}
        />
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedTable && (
        <QRCodeModal
          table={selectedTable}
          onClose={() => {
            setShowQRModal(false);
            setSelectedTable(null);
          }}
          onDownload={() => handleDownloadQR(selectedTable.tableNumber)}
        />
      )}
    </div>
  );
}

// ============================================
// Add Table Modal
// ============================================

function AddTableModal({ onClose, onAdd }: { onClose: () => void; onAdd: (tableNumber: string, capacity: number) => void }) {
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState(4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber) return;
    
    onAdd(tableNumber, capacity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">เพิ่มโต๊ะใหม่</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                หมายเลขโต๊ะ
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                placeholder="เช่น 1, 2, A1, B2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                จำนวนที่นั่ง
              </label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                min={1}
                max={20}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium"
            >
              เพิ่มโต๊ะ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// QR Code Modal
// ============================================

function QRCodeModal({ 
  table, 
  onClose, 
  onDownload 
}: { 
  table: Table; 
  onClose: () => void; 
  onDownload: () => void;
}) {
  const qrValue = `${window.location.origin}/table/${table.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">QR Code - โต๊ะ {table.tableNumber}</h2>
          <p className="text-gray-600 text-sm mt-1">ให้ลูกค้าสแกน QR นี้เพื่อเข้าสู่ระบบสั่งอาหาร</p>
        </div>

        <div className="p-8">
          {/* QR Code */}
          <div id={`qr-${table.tableNumber}`} className="bg-white p-8 rounded-2xl border-4 border-orange-500 mb-6">
            <div className="flex flex-col items-center">
              <QRCodeSVG
                value={qrValue}
                size={256}
                level="H"
                includeMargin={true}
              />
              <p className="text-2xl font-bold text-gray-900 mt-4">โต๊ะ {table.tableNumber}</p>
              <p className="text-sm text-gray-600">{table.capacity} ที่นั่ง</p>
            </div>
          </div>

          {/* URL */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">URL:</p>
            <p className="text-sm text-gray-900 font-mono break-all">{qrValue}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium"
            >
              ปิด
            </button>
            <button
              onClick={onDownload}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium"
            >
              <Download className="w-5 h-5" />
              ดาวน์โหลด QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
