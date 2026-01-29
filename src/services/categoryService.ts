/**
 * Category Service
 * Mock service for Category Management.
 * In a real application, these would be API calls to the backend:
 * - GET /categories
 * - POST /categories
 * - DELETE /categories/:id
 */

export interface Category {
  id: number;
  name: string;
  description?: string;
}

// In-memory mock storage for categories
let mockCategories: Category[] = [
  { id: 1, name: 'appetizers', description: 'Starters and light bites' },
  { id: 2, name: 'mains', description: 'Main courses' },
  { id: 3, name: 'desserts', description: 'Sweet treats' },
  { id: 4, name: 'beverages', description: 'Drinks and refreshments' }
];

let nextCategoryId = 5;

/**
 * Get all categories
 * Simulates GET /categories
 */
export const getCategories = async (): Promise<Category[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...mockCategories];
};

/**
 * Create a new category
 * Simulates POST /categories
 */
export const createCategory = async (name: string, description?: string): Promise<Category> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Simple validation/slugification
  const normalizedName = name.toLowerCase().trim().replace(/\s+/g, '-');
  
  if (mockCategories.some(c => c.name === normalizedName)) {
    throw new Error('Category already exists');
  }

  const newCategory: Category = {
    id: nextCategoryId++,
    name: normalizedName,
    description: description?.trim()
  };

  mockCategories.push(newCategory);
  return newCategory;
};

/**
 * Delete a category
 * Simulates DELETE /categories/:id
 */
export const deleteCategory = async (id: number): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = mockCategories.findIndex(c => c.id === id);
  if (index !== -1) {
    mockCategories.splice(index, 1);
    return true;
  }
  return false;
};
