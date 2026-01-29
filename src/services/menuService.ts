// Menu Service - Handles all menu item operations
// This service is designed to easily integrate with real APIs in the future

export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  available: boolean;
  description?: string;
}

// Initial mock data - This will be replaced by API data
const initialMenuItems: MenuItem[] = [
  { id: 1, name: 'Caesar Salad', category: 'appetizers', price: 8.99, image: '🥗', available: true, description: 'Fresh romaine lettuce with Caesar dressing, parmesan cheese, and croutons.' },
  { id: 2, name: 'Grilled Chicken', category: 'main course', price: 18.99, image: '🍗', available: true, description: 'Tender grilled chicken breast served with seasonal vegetables.' },
  { id: 3, name: 'Beef Burger', category: 'main course', price: 14.99, image: '🍔', available: true, description: 'Juicy beef patty with lettuce, tomato, cheese, and special sauce.' },
  { id: 4, name: 'Chocolate Cake', category: 'desserts', price: 6.99, image: '🍰', available: true, description: 'Rich chocolate cake with chocolate ganache frosting.' },
  { id: 5, name: 'Iced Tea', category: 'beverages', price: 3.99, image: '🧊', available: true, description: 'Refreshing iced tea served with lemon.' },
  { id: 6, name: 'French Fries', category: 'appetizers', price: 5.99, image: '🍟', available: true, description: 'Crispy golden french fries seasoned with salt.' },
  { id: 7, name: 'Pasta Carbonara', category: 'main course', price: 16.99, image: '🍝', available: true, description: 'Classic Italian pasta with creamy egg sauce, pancetta, and parmesan.' },
  { id: 8, name: 'Cheesecake', category: 'desserts', price: 7.99, image: '🧁', available: false, description: 'New York style cheesecake with strawberry topping.' },
];

// In-memory storage for demo purposes
// In production, this will be replaced by API calls
let menuItems: MenuItem[] = [...initialMenuItems];
let nextId: number = 9;

// API: GET /api/menu-items
// Fetch all menu items from the server
export const getMenuItems = async (): Promise<MenuItem[]> => {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/menu-items');
  // const data = await response.json();
  // return data;
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return [...menuItems];
};

// API: GET /api/menu-items/:id
// Fetch a single menu item by ID
export const getMenuItemById = async (id: number): Promise<MenuItem | null> => {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/menu-items/${id}`);
  // if (!response.ok) return null;
  // return await response.json();
  
  await new Promise(resolve => setTimeout(resolve, 50));
  return menuItems.find(item => item.id === id) || null;
};

// API: POST /api/menu-items
// Create a new menu item
export const createMenuItem = async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/menu-items', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(item)
  // });
  // return await response.json();
  
  await new Promise(resolve => setTimeout(resolve, 150));
  const newItem: MenuItem = {
    ...item,
    id: nextId++
  };
  menuItems.push(newItem);
  return newItem;
};

// API: PUT /api/menu-items/:id
// Update an existing menu item
export const updateMenuItem = async (id: number, updates: Partial<MenuItem>): Promise<MenuItem | null> => {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/menu-items/${id}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(updates)
  // });
  // if (!response.ok) return null;
  // return await response.json();
  
  await new Promise(resolve => setTimeout(resolve, 150));
  const index = menuItems.findIndex(item => item.id === id);
  if (index === -1) return null;
  
  menuItems[index] = { ...menuItems[index], ...updates };
  return menuItems[index];
};

// API: PATCH /api/menu-items/:id/availability
// Toggle item availability status
export const toggleItemAvailability = async (id: number): Promise<MenuItem | null> => {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/menu-items/${id}/availability`, {
  //   method: 'PATCH'
  // });
  // if (!response.ok) return null;
  // return await response.json();
  
  await new Promise(resolve => setTimeout(resolve, 100));
  const index = menuItems.findIndex(item => item.id === id);
  if (index === -1) return null;
  
  menuItems[index] = { ...menuItems[index], available: !menuItems[index].available };
  return menuItems[index];
};

// API: DELETE /api/menu-items/:id
// Delete a menu item
export const deleteMenuItem = async (id: number): Promise<boolean> => {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/menu-items/${id}`, {
  //   method: 'DELETE'
  // });
  // return response.ok;
  
  await new Promise(resolve => setTimeout(resolve, 100));
  const index = menuItems.findIndex(item => item.id === id);
  if (index === -1) return false;
  
  menuItems.splice(index, 1);
  return true;
};

// Helper: Get all unique categories
export const getCategories = async (): Promise<string[]> => {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/categories');
  // return await response.json();
  
  const categories = new Set(menuItems.map(item => item.category));
  return ['all', ...Array.from(categories)];
};
