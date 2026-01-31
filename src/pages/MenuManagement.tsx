import React, { useState, useEffect, useCallback } from 'react';
import { 
  MenuItem, 
  getMenuItems, 
  createMenuItem, 
  updateMenuItem, 
  toggleItemAvailability, 
  deleteMenuItem 
} from '../services/menuService';
import { 
  Category, 
  getCategories, 
  createCategory as createCategoryService, 
  deleteCategory as deleteCategoryService 
} from '../services/categoryService';
import { useCart } from '../context/CartContext';

interface MenuItemFormData {
  name: string;
  price: string;
  category: string;
  description: string;
  available: boolean;
  image: string;
}

interface NewCategoryData {
  name: string;
  description: string;
}

const ItemImageDisplay: React.FC<{ src: string; className?: string }> = ({ src, className }) => {
  if (src.startsWith('data:image')) {
    return (
      <img 
        src={src} 
        alt="Menu Item" 
        className={className}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }
  return <span className={className}>{src}</span>;
};

const MenuManagement: React.FC = () => {
  const { addToCart } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: '',
    price: '',
    category: 'appetizers',
    description: '',
    available: true,
    image: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof MenuItemFormData, string>>>({});
  const [isInlineCategoryMode, setIsInlineCategoryMode] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState<NewCategoryData>({ name: '', description: '' });
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDeletingCategoryId, setIsDeletingCategoryId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleteCategoryConfirmId, setDeleteCategoryConfirmId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flashItemId, setFlashItemId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

useEffect(() => { loadData(); }, []);

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 640);
  };
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);

const loadData = async () => {
  setLoading(true);
  try {
    const [items, cats] = await Promise.all([getMenuItems(), getCategories()]);
    setMenuItems(items);
    setCategories(cats);
    if (cats.length > 0 && !formData.category) { setFormData(prev => ({ ...prev, category: cats[0].name })); }
  } catch (error) { console.error('Failed to load data:', error); } finally { setLoading(false); }
};

const filteredItems = menuItems.filter((item) => {
  const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
  const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
  return matchesCategory && matchesSearch;
});

const handleAddNewItem = () => {
  setIsEditMode(false);
  setEditingItemId(null);
  const defaultCat = categories.length > 0 ? categories[0].name : '';
  setFormData({ name: '', price: '', category: defaultCat, description: '', available: true, image: '' });
  setFormErrors({});
  setIsInlineCategoryMode(false);
  setNewCategoryData({ name: '', description: '' });
  setIsModalOpen(true);
};

const handleEditItem = (item: MenuItem) => {
  setIsEditMode(true);
  setEditingItemId(item.id);
  setFormData({ name: item.name, price: item.price.toString(), category: item.category, description: item.description || '', available: item.available, image: item.image || '' });
  setFormErrors({});
  setIsInlineCategoryMode(false);
  setNewCategoryData({ name: '', description: '' });
  setIsModalOpen(true);
};

const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => { setFormData(prev => ({ ...prev, image: reader.result as string })); };
    reader.readAsDataURL(file);
  }
};

const handleRemoveImage = () => { setFormData(prev => ({ ...prev, image: '' })); };

const validateForm = (): boolean => {
  const errors: Partial<Record<keyof MenuItemFormData, string>> = {};
  if (!formData.name.trim()) errors.name = 'Item name is required';
  if (!formData.price.trim()) { errors.price = 'Price is required'; } else { const priceValue = parseFloat(formData.price); if (isNaN(priceValue) || priceValue <= 0) errors.price = 'Please enter a valid price'; }
  if (!formData.category) errors.category = 'Category is required';
  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};

const handleCreateInlineCategory = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!newCategoryData.name.trim()) { setCategoryError('Category name is required'); return; }
  setIsSavingCategory(true);
  setCategoryError(null);
  try {
    const created = await createCategoryService(newCategoryData.name, newCategoryData.description);
    const updatedCats = await getCategories();
    setCategories(updatedCats);
    setFormData(prev => ({ ...prev, category: created.name }));
    setIsInlineCategoryMode(false);
    setNewCategoryData({ name: '', description: '' });
  } catch (error: any) { setCategoryError(error.message || 'Failed to create category'); } finally { setIsSavingCategory(false); }
};

const handleDeleteCategory = async (categoryId: number) => {
  const categoryToDelete = categories.find(c => c.id === categoryId);
  if (!categoryToDelete) return;
  const isUsed = menuItems.some(item => item.category === categoryToDelete.name);
  if (isUsed) { alert(`Cannot delete "${categoryToDelete.name}" because it is assigned to menu items.`); return; }
  setDeleteCategoryConfirmId(categoryId);
};

const handleConfirmDeleteCategory = async () => {
  if (!deleteCategoryConfirmId) return;
  const categoryToDelete = categories.find(c => c.id === deleteCategoryConfirmId);
  try {
    await deleteCategoryService(deleteCategoryConfirmId);
    const updatedCats = await getCategories();
    setCategories(updatedCats);
    if (categoryToDelete && selectedCategory === categoryToDelete.name) setSelectedCategory('all');
    if (categoryToDelete && formData.category === categoryToDelete.name) { const nextCat = updatedCats.length > 0 ? updatedCats[0].name : ''; setFormData(prev => ({ ...prev, category: nextCat })); }
  } catch (error) { console.error('Failed to delete category:', error); alert('Failed to delete category.'); } finally { setDeleteCategoryConfirmId(null); }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;
  setIsSubmitting(true);
  try {
    const itemData = { name: formData.name.trim(), price: parseFloat(formData.price), category: formData.category, description: formData.description.trim(), available: formData.available, image: formData.image || '🍽️' };
    if (isEditMode && editingItemId) {
      const updated = await updateMenuItem(editingItemId, itemData);
      if (updated) { setMenuItems(prev => prev.map(item => item.id === editingItemId ? updated : item)); if (selectedItem?.id === editingItemId) setSelectedItem(updated); }
    } else { const newItem = await createMenuItem(itemData); setMenuItems(prev => [...prev, newItem]); }
    setIsModalOpen(false);
  } catch (error) { console.error('Failed to save item:', error); } finally { setIsSubmitting(false); }
};

const handleToggleAvailability = async (item: MenuItem) => {
  try { const updated = await toggleItemAvailability(item.id); if (updated) { setMenuItems(prev => prev.map(i => i.id === item.id ? updated : i)); if (selectedItem?.id === item.id) setSelectedItem(updated); } } catch (error) { console.error('Failed to toggle availability:', error); }
};

const handleDeleteItem = async () => {
  if (!deleteConfirmId) return;
  try { const success = await deleteMenuItem(deleteConfirmId); if (success) { setMenuItems(prev => prev.filter(item => item.id !== deleteConfirmId)); if (selectedItem?.id === deleteConfirmId) setSelectedItem(null); setDeleteConfirmId(null); } } catch (error) { console.error('Failed to delete item:', error); }
};

const handleInputChange = (field: keyof MenuItemFormData, value: string | boolean) => { setFormData(prev => ({ ...prev, [field]: value })); if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: undefined })); };

const handleCategoryChange = (value: string) => { if (value === '__create_new__') { setIsInlineCategoryMode(true); setCategoryError(null); } else { setIsInlineCategoryMode(false); handleInputChange('category', value); } };

const handleMobileCardClick = (item: MenuItem) => {
  if (!item.available) return;
  addToCart(item);
  setFlashItemId(item.id);
  setTimeout(() => setFlashItemId(null), 300);
};

const handleCardClick = (e: React.MouseEvent, item: MenuItem) => {
  if (isMobile) {
    handleMobileCardClick(item);
  } else {
    setSelectedItem(item);
  }
};

const closeModal = () => { if (!isSubmitting) setIsModalOpen(false); };

if (loading) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center"><div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div><p className="mt-4 text-gray-600">Loading menu...</p></div>
    </div>
  );
}

return (
  <div className="flex flex-col lg:flex-row gap-6 h-full lg:mt-[5%]">
    <div className="flex-1 space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-gray-900">Menu Management</h2><p className="text-gray-600 mt-1">Manage your restaurant menu items</p></div>
        <div className="flex gap-3"><button onClick={() => setIsCategoryModalOpen(true)} className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium">🏷️ Manage Categories</button><button onClick={handleAddNewItem} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md">+ Add New Item</button></div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-4"><input type="text" placeholder="Search menu items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" /><div className="flex flex-wrap gap-2"><button onClick={() => setSelectedCategory('all')} className={`px-4 py-2 rounded-full capitalize transition-all ${selectedCategory === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All Items</button>{categories.map((category) => (<button key={category.id} onClick={() => setSelectedCategory(category.name)} className={`px-4 py-2 rounded-full capitalize transition-all ${selectedCategory === category.name ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{category.name}</button>))}</div></div>
      <div className="grid grid-cols-3 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} onClick={(e) => handleCardClick(e, item)} className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all cursor-pointer hover:shadow-md ${!item.available ? 'opacity-60' : ''} ${selectedItem?.id === item.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''} ${flashItemId === item.id ? 'ring-2 ring-green-500 ring-offset-2 bg-green-50' : ''}`}>
            <div className="h-24 sm:h-32 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-2 sm:p-4">
              {item.image.startsWith('data:image') ? (<img src={item.image} alt={item.name} className="w-full h-full object-contain" />) : (<span className="text-4xl sm:text-6xl">{item.image}</span>)}
            </div>
            <div className="p-2 sm:p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1"><h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{item.name}</h3><p className="text-xs text-gray-500 capitalize truncate">{item.category}</p></div>
                <span className="text-sm sm:text-lg font-bold text-blue-600 ml-2 whitespace-nowrap">${item.price.toFixed(2)}</span>
              </div>
              <div className="mt-2 sm:mt-3 space-y-3">
                <div className="flex items-center justify-between"><span className={`text-xs px-2 py-1 rounded-full ${item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.available ? 'Available' : 'Unavailable'}</span></div>
                {item.available && (<button onClick={(e) => { e.stopPropagation(); addToCart(item); }} className="hidden sm:flex w-full bg-blue-50 text-blue-600 border border-blue-200 py-2 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors font-medium text-sm items-center justify-center gap-2"><span>🛒</span> Add to Cart</button>)}
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredItems.length === 0 && (<div className="bg-white rounded-xl shadow-sm p-12 text-center"><span className="text-6xl">🔍</span><h3 className="text-lg font-semibold text-gray-900 mt-4">No items found</h3><p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p></div>)}
    </div>
    {selectedItem && (
      <div className="w-full lg:w-96 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-sm p-6 lg:sticky lg:top-6 space-y-6">
          <div className="flex items-start justify-between"><h3 className="text-lg font-bold text-gray-900">Item Details</h3><div className="flex gap-2"><button className="lg:hidden text-gray-500 hover:text-gray-700 p-1" onClick={() => setSelectedItem(null)}>✕</button></div></div>
          <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center p-4">{selectedItem.image.startsWith('data:image') ? (<img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-contain rounded-lg" />) : (<span className="text-8xl">{selectedItem.image}</span>)}</div>
          <div><h3 className="text-2xl font-bold text-gray-900">{selectedItem.name}</h3><p className="text-gray-500 capitalize mt-1">{selectedItem.category}</p><p className="text-3xl font-bold text-blue-600 mt-3">${selectedItem.price.toFixed(2)}</p></div>
          {selectedItem.description && (<div><h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4><p className="text-gray-600 text-sm leading-relaxed">{selectedItem.description}</p></div>)}
          <div><h4 className="text-sm font-semibold text-gray-900 mb-2">Availability</h4><span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${selectedItem.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedItem.available ? '✓ Available' : '✕ Unavailable'}</span></div>
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <button onClick={() => handleEditItem(selectedItem)} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"><span>✏️</span> Edit Item</button>
            {selectedItem.available && (<button onClick={() => addToCart(selectedItem)} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"><span>🛒</span> Add to Cart</button>)}
            <button onClick={() => handleToggleAvailability(selectedItem)} className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${selectedItem.available ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>{selectedItem.available ? '🚫 Mark Unavailable' : '✓ Mark Available'}</button>
            <button onClick={() => setDeleteConfirmId(selectedItem.id)} className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2">🗑️ Delete Item</button>
          </div>
        </div>
      </div>
    )}
    {!selectedItem && (<div className="hidden lg:block w-96 flex-shrink-0"><div className="bg-white rounded-xl shadow-sm p-6 lg:sticky lg:top-6"><div className="text-center py-12"><span className="text-6xl">📋</span><h3 className="text-lg font-semibold text-gray-900 mt-4">Select an Item</h3><p className="text-gray-500 mt-2 text-sm">Click on any menu item to view its details</p></div></div></div>)}
    {isModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between"><h3 className="text-xl font-bold text-gray-900">{isEditMode ? 'Edit Item' : 'Add New Item'}</h3><button onClick={closeModal} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600 disabled:opacity-50">✕</button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Item Image</label><div className="flex flex-col items-center justify-center w-full">{formData.image ? (<div className="relative group w-full h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">{formData.image.startsWith('data:image') ? (<img src={formData.image} alt="Preview" className="h-full w-full object-contain" />) : (<span className="text-6xl">{formData.image}</span>)}<button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div>) : (<label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"><div className="flex flex-col items-center justify-center pt-5 pb-6"><svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg><p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p></div><input type="file" className="hidden" accept="image/*" onChange={handleImageChange} /></label>)}</div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label><input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.name ? 'border-red-300' : 'border-gray-300'}`} placeholder="e.g., Caesar Salad" />{formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label><input type="number" step="0.01" min="0" value={formData.price} onChange={(e) => handleInputChange('price', e.target.value)} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.price ? 'border-red-300' : 'border-gray-300'}`} placeholder="e.g., 8.99" />{formErrors.price && <p className="text-red-600 text-sm mt-1">{formErrors.price}</p>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>{!isInlineCategoryMode ? (<div className="relative"><select value={formData.category} onChange={(e) => handleCategoryChange(e.target.value)} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white ${formErrors.category ? 'border-red-300' : 'border-gray-300'}`}>{categories.map(cat => <option key={cat.id} value={cat.name} className="capitalize">{cat.name}</option>)}<option value="__create_new__" className="text-blue-600 font-semibold">+ Add New Category</option></select><div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"><svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div></div>) : (<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3"><h4 className="text-sm font-semibold text-blue-800">Create New Category</h4><input type="text" value={newCategoryData.name} onChange={(e) => setNewCategoryData({...newCategoryData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="Category Name" /><div className="flex gap-2"><button type="button" onClick={() => setIsInlineCategoryMode(false)} className="flex-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-xs font-medium">Cancel</button><button type="button" onClick={handleCreateInlineCategory} className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium">Save</button></div></div>)}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" placeholder="Describe the item..." /></div>
              <div className="flex items-center gap-3"><input type="checkbox" id="available" checked={formData.available} onChange={(e) => handleInputChange('available', e.target.checked)} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /><label htmlFor="available" className="text-sm font-medium text-gray-700">Available for order</label></div>
              <div className="flex gap-3 pt-4"><button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">{isEditMode ? 'Update' : 'Add'}</button></div>
            </form>
          </div>
        </div>
      </div>
    )}
    {isCategoryModalOpen && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"><div className="p-6 border-b border-gray-200 flex items-center justify-between"><h3 className="text-xl font-bold text-gray-900">Manage Categories</h3><button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button></div><div className="p-6 overflow-y-auto flex-1"><div className="space-y-4">{categories.map((cat) => { const itemCount = menuItems.filter(item => item.category === cat.name).length; return (<div key={cat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"><div><h4 className="font-semibold text-gray-900 capitalize">{cat.name}</h4><p className="text-xs text-blue-600 mt-1">{itemCount} item(s)</p></div><button onClick={() => handleDeleteCategory(cat.id)} disabled={itemCount > 0} className={`p-2 rounded-lg ${itemCount > 0 ? 'text-gray-300' : 'text-red-500 hover:bg-red-50'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div>); })}</div></div></div></div>)}
    {deleteConfirmId && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-xl shadow-2xl w-full max-w-sm"><div className="p-6 space-y-4"><div className="text-center"><div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4"><span className="text-2xl">🗑️</span></div><h3 className="text-lg font-bold text-gray-900">Delete Item?</h3><p className="text-gray-500 mt-2">Are you sure you want to delete this item?</p></div><div className="flex gap-3"><button onClick={() => setDeleteConfirmId(null)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button><button onClick={handleDeleteItem} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button></div></div></div></div>)}
    {deleteCategoryConfirmId && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-xl shadow-2xl w-full max-w-sm"><div className="p-6 space-y-4"><div className="text-center"><div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4"><span className="text-2xl">🗑️</span></div><h3 className="text-lg font-bold text-gray-900">Delete Category?</h3><p className="text-gray-500 mt-2">Are you sure you want to delete this category?</p></div><div className="flex gap-3"><button onClick={() => setDeleteCategoryConfirmId(null)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button><button onClick={handleConfirmDeleteCategory} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button></div></div></div></div>)}
  </div>
);
};
export default MenuManagement;
