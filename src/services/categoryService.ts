const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const getAuthToken = (): string | null => {
  const session = localStorage.getItem('pos_auth_session');
  if (!session) return null;
  try {
    const parsed = JSON.parse(session);
    return parsed.token ?? null;
  } catch (error) {
    console.error('Invalid session JSON');
    return null;
  }
};

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/categories`, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `Failed to fetch categories (${response.status})`);
  }

  const result: ApiResponse<Category[]> = await response.json();
  return result.data || result as unknown as Category[];
};

export const createCategory = async (name: string, description?: string): Promise<Category> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required. Please log in again.');
  }

  const response = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name, description })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error('Session expired. Please log in again.');
    }
    throw new Error(errorData.error || errorData.message || `Failed to create category (${response.status})`);
  }

  const result: ApiResponse<Category> = await response.json();
  return result.data || result as unknown as Category;
};

export const updateCategory = async (id: number, name: string, description?: string): Promise<Category> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required. Please log in again.');
  }

  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name, description })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error('Session expired. Please log in again.');
    }
    throw new Error(errorData.error || errorData.message || `Failed to update category (${response.status})`);
  }

  const result: ApiResponse<Category> = await response.json();
  return result.data || result as unknown as Category;
};

export const deleteCategory = async (id: number): Promise<boolean> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required. Please log in again.');
  }

  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error('Session expired. Please log in again.');
    }
    throw new Error(errorData.error || errorData.message || `Failed to delete category (${response.status})`);
  }

  return true;
};
