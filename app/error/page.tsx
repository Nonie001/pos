// ============================================
// 🎯 หน้า Error
// ============================================

'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const message = searchParams.get('message');

  const errorMessages: Record<string, { title: string; description: string }> = {
    'table-not-found': {
      title: 'ไม่พบโต๊ะนี้',
      description: 'กรุณาตรวจสอบ QR Code ให้ถูกต้อง',
    },
    'table-closed': {
      title: 'โต๊ะนี้ปิดใช้งาน',
      description: 'กรุณาติดต่อเจ้าหน้าที่',
    },
  };

  const error = errorMessages[message || ''] || {
    title: 'เกิดข้อผิดพลาด',
    description: 'กรุณาลองใหม่อีกครั้ง',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{error.title}</h1>
        <p className="text-gray-600 mb-6">{error.description}</p>
        <button
          onClick={() => router.back()}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          ย้อนกลับ
        </button>
      </div>
    </div>
  );
}
