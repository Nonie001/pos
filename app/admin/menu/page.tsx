// ============================================
// 🍽️ Admin Menu - จัดการเมนูอาหาร
// ============================================

'use client';

import { useRestaurant } from '@/contexts/RestaurantContext';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { MenuItem, MenuCategory } from '@/types';

export default function AdminMenuPage() {
  const { menuItems, categories, addMenuItem, updateMenuItem, removeMenuItem } = useRestaurant();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.categoryId === selectedCategory);

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId;
  };

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">จัดการเมนู</h1>
          <p className="text-gray-600 mt-1">เพิ่ม แก้ไข หรือลบเมนูอาหาร</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all min-h-[48px] touch-manipulation w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          เพิ่มเมนูใหม่
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-all min-h-[44px] touch-manipulation ${
            selectedCategory === 'all'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ทั้งหมด ({menuItems.length})
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-all min-h-[44px] touch-manipulation ${
              selectedCategory === category.id
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name} ({menuItems.filter(item => item.categoryId === category.id).length})
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden"
          >
            {/* Image */}
            <div className="relative aspect-square">
              <Image
                src={item.imageUrl || '/placeholder.jpg'}
                alt={item.name}
                fill
                className="object-cover"
              />
              {!item.isAvailable && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold">
                    หมด
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="mb-2">
                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  {getCategoryName(item.categoryId)}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
              <p className="text-xl font-bold text-orange-600 mb-3">฿{item.price}</p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingItem(item);
                    setShowAddModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-all shadow-md min-h-[48px] touch-manipulation"
                >
                  <Edit className="w-4 h-4" />
                  แก้ไข
                </button>
                <button
                  onClick={() => {
                    if (confirm(`ยืนยันการลบเมนู "${item.name}"?`)) {
                      removeMenuItem(item.id);
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-all shadow-md min-h-[48px] touch-manipulation"
                >
                  <Trash2 className="w-4 h-4" />
                  ลบ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-16">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">ไม่พบเมนูในหมวดหมู่นี้</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <MenuFormModal
          item={editingItem}
          categories={categories}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
          onSave={(data) => {
            if (editingItem) {
              updateMenuItem(editingItem.id, data);
            } else {
              addMenuItem(data);
            }
            setShowAddModal(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

// ============================================
// Menu Form Modal
// ============================================

interface MenuFormData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  isAvailable: boolean;
}

function MenuFormModal({ 
  item, 
  categories,
  onClose, 
  onSave 
}: { 
  item: MenuItem | null;
  categories: MenuCategory[];
  onClose: () => void; 
  onSave: (data: MenuFormData) => void;
}) {
  const [formData, setFormData] = useState<MenuFormData>({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || 0,
    categoryId: item?.categoryId || categories[0]?.id || '',
    imageUrl: item?.imageUrl || '',
    isAvailable: item?.isAvailable !== false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId || formData.price <= 0) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 my-8">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {item ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อเมนู *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                placeholder="เช่น ข้าวผัดกุ้ง"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รายละเอียด
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                placeholder="อธิบายเมนูอาหาร"
                rows={3}
              />
            </div>

            {/* Price & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ราคา (บาท) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                  min={0}
                  step={0.01}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมวดหมู่ *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL รูปภาพ
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                placeholder="https://images.unsplash.com/..."
              />
              {formData.imageUrl && (
                <div className="mt-2 relative aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={formData.imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            {/* Available */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="available"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
              />
              <label htmlFor="available" className="text-sm font-medium text-gray-700">
                พร้อมให้บริการ
              </label>
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
              {item ? 'บันทึก' : 'เพิ่มเมนู'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
