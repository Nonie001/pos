// ============================================
// 🎯 หน้าหลัก - Table Page (Customer Entry Point)
// ============================================

'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useRestaurant } from '@/contexts/RestaurantContext';
import { useEffect } from 'react';

interface TablePageProps {
  params: Promise<{
    tableId: string;
  }>;
}

export default function TablePage({ params }: TablePageProps) {
  const resolvedParams = use(params);
  const { tableId } = resolvedParams;
  const router = useRouter();
  const { getTable, startTableSession, currentSession } = useRestaurant();

  useEffect(() => {
    const table = getTable(tableId);
    
    if (!table) {
      // โต๊ะไม่มีอยู่จริง
      router.push('/error?message=table-not-found');
      return;
    }

    if (table.status === 'closed') {
      // โต๊ะปิด
      router.push('/error?message=table-closed');
      return;
    }

    // เริ่ม session (ถ้ายังไม่มี หรือ session ไม่ใช่ของโต๊ะนี้)
    if (!currentSession || currentSession.tableId !== tableId) {
      startTableSession(tableId);
    }
    
    // ส่งไปหน้าเมนู
    router.push(`/table/${tableId}/menu`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId]); // รันแค่ครั้งเดียวเมื่อ tableId เปลี่ยน

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
        <p className="mt-4 text-gray-700 font-medium">กำลังโหลด...</p>
      </div>
    </div>
  );
}
