// ============================================
// 🎯 Menu Page - หน้าแสดงเมนูอาหาร (Mobile-First)
// ============================================

'use client';

import { use, useState } from 'react';
import { useRestaurant } from '@/contexts/RestaurantContext';
import Image from 'next/image';
import Link from 'next/link';
import { MenuItem } from '@/types';
import { 
  ShoppingCart, 
  ClipboardList, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  Utensils,
  UtensilsCrossed,
  Flame,
  IceCream,
  Coffee,
  Cookie
} from 'lucide-react';

interface MenuPageProps {
  params: Promise<{
    tableId: string;
  }>;
}

export default function MenuPage({ params }: MenuPageProps) {
  const resolvedParams = use(params);
  const { tableId } = resolvedParams;
  
  const { 
    categories, 
    menuItems, 
    getMenuByCategory, 
    addToCart, 
    getCartItemCount,
    getCartTotal,
    getTable 
  } = useRestaurant();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  
  const table = getTable(tableId);
  const filteredMenuItems = selectedCategory === 'all'
    ? menuItems.filter(m => m.isAvailable)
    : getMenuByCategory(selectedCategory);

  // ตรวจสอบว่าโต๊ะสถานะ checkout_pending หรือไม่
  const isCheckoutPending = table?.status === 'checkout_pending';

  const handleAddToCart = (item: MenuItem) => {
    if (isCheckoutPending) {
      alert('⚠️ โต๊ะนี้อยู่ระหว่างขอเช็กบิล ไม่สามารถสั่งเพิ่มได้');
      return;
    }
    addToCart(item, 1);
    // แสดง animation หรือ feedback
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 📌 Checkout Pending Banner */}
      {isCheckoutPending && (
        <div className="sticky top-0 z-40 bg-yellow-500 text-white px-4 py-3 text-center font-medium shadow-lg">
          ⚠️ โต๊ะนี้อยู่ระหว่างรอชำระเงิน ไม่สามารถสั่งเพิ่มได้
        </div>
      )}

      {/* 📌 Header - Table Info */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">ระบบสั่งอาหาร</h1>
              <p className="text-sm opacity-90">โต๊ะ {table?.tableNumber}</p>
            </div>
            <div className="flex gap-2">
              {/* View Orders Button */}
              <Link href={`/table/${tableId}/orders`}>
                <button className="relative bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-all">
                  <ClipboardList className="w-6 h-6" />
                </button>
              </Link>
              
              {/* Cart Button */}
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-all"
              >
                <ShoppingCart className="w-6 h-6" />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {getCartItemCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 📌 Category Pills */}
        <div className="overflow-x-auto scrollbar-hide px-4 pb-3">
          <div className="flex gap-2">
            {/* All Categories */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2
                ${selectedCategory === 'all'
                  ? 'bg-white text-orange-600 shadow-md' 
                  : 'bg-white/20 text-white hover:bg-white/30'
                }
              `}
            >
              <Utensils className="w-4 h-4" />
              <span>ทั้งหมด</span>
            </button>
            
            {categories.map((category) => {
              const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
                'UtensilsCrossed': UtensilsCrossed,
                'Flame': Flame,
                'IceCream': IceCream,
                'Coffee': Coffee,
                'Cookie': Cookie,
              };
              const IconComponent = iconMap[category.icon] || Utensils;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2
                    ${selectedCategory === category.id 
                      ? 'bg-white text-orange-600 shadow-md' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 📌 Menu Grid */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredMenuItems.map((item) => (
            <MenuCard 
              key={item.id} 
              item={item} 
              onAdd={handleAddToCart}
              disabled={isCheckoutPending}
            />
          ))}
        </div>
      </div>

      {/* 📌 Cart Summary (Bottom Bar) */}
      {getCartItemCount() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t z-40">
          <div className="px-4 py-3">
            <button
              onClick={() => setShowCart(true)}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-between px-6"
            >
              <span className="flex items-center gap-2">
                <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                  {getCartItemCount()}
                </span>
                ดูตะกร้า
              </span>
              <span>฿{getCartTotal()}</span>
            </button>
          </div>
        </div>
      )}

      {/* 📌 Cart Modal */}
      {showCart && (
        <CartModal tableId={tableId} onClose={() => setShowCart(false)} />
      )}
    </div>
  );
}

// ============================================
// 🎨 MenuCard Component
// ============================================

interface MenuCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  disabled?: boolean;
}

function MenuCard({ item, onAdd, disabled = false }: MenuCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Image */}
      {item.imageUrl && (
        <div className="relative h-32 bg-gray-100">
          <Image 
            src={item.imageUrl} 
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
          {item.isRecommended && (
            <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              แนะนำ
            </span>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="p-3">
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">
          {item.name}
        </h3>
        
        {item.description && (
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
            {item.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-lg font-bold text-orange-600">
            ฿{item.price}
          </p>
          
          <button
            onClick={() => onAdd(item)}
            disabled={disabled}
            className={`
              p-2 rounded-lg transition-all transform hover:scale-110 active:scale-95
              ${disabled 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-orange-500 hover:bg-orange-600 text-white'
              }
            `}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 🛒 Cart Modal Component
// ============================================

interface CartModalProps {
  tableId: string;
  onClose: () => void;
}

function CartModal({ tableId, onClose }: CartModalProps) {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    getCartTotal, 
    clearCart,
    submitOrder,
    getTable
  } = useRestaurant();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const table = getTable(tableId);
  const isCheckoutPending = table?.status === 'checkout_pending';

  const handleSubmit = async () => {
    if (isCheckoutPending) {
      alert('⚠️ โต๊ะนี้อยู่ระหว่างขอเช็กบิล ไม่สามารถสั่งเพิ่มได้');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await submitOrder(tableId);
      onClose();
      // แสดง success message
      alert('ส่งออเดอร์สำเร็จ! 🎉');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b">
          <h2 className="text-lg sm:text-xl font-bold">ตะกร้าสินค้า</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>ตะกร้าว่างเปล่า</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.menuId} className="flex items-center gap-2 sm:gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{item.menuName}</h3>
                    <p className="text-sm text-orange-600 font-semibold">฿{item.price}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartQuantity(item.menuId, item.quantity - 1)}
                      className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center touch-manipulation"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    
                    <button
                      onClick={() => updateCartQuantity(item.menuId, item.quantity + 1)}
                      className="w-10 h-10 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center touch-manipulation"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.menuId)}
                    className="text-red-500 hover:text-red-700 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700 font-medium">ยอดรวม</span>
              <span className="text-2xl font-bold text-orange-600">฿{getCartTotal()}</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={clearCart}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-4 rounded-xl font-medium min-h-[48px] touch-manipulation"
              >
                ล้างตะกร้า
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isCheckoutPending}
                className="flex-[2] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] touch-manipulation"
              >
                {isSubmitting ? 'กำลังส่ง...' : isCheckoutPending ? 'โต๊ะรอชำระ' : 'ยืนยันออเดอร์'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
