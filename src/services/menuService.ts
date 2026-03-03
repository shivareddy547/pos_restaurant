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

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  description?: string;
  available: boolean;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMenuItemParams {
  name: string;
  price: number;
  category: string;
  description?: string;
  available?: boolean;
  image?: string;
}

export interface UpdateMenuItemParams {
  name?: string;
  price?: number;
  category?: string;
  description?: string;
  available?: boolean;
  image?: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const getMenuItems = async (): Promise<MenuItem[]> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/menu_items`, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `Failed to fetch menu items (${response.status})`);
  }

  const result: ApiResponse<MenuItem[]> = await response.json();
  return result.data || result as unknown as MenuItem[];
};

export const getMenuItem = async (id: number): Promise<MenuItem> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/menu_items/${id}`, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `Failed to fetch menu item (${response.status})`);
  }

  const result: ApiResponse<MenuItem> = await response.json();
  return result.data || result as unknown as MenuItem;
};

export const createMenuItem = async (params: CreateMenuItemParams): Promise<MenuItem> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required. Please log in again.');
  }

  const response = await fetch(`${API_URL}/menu_items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error('Session expired. Please log in again.');
    }
    throw new Error(errorData.error || errorData.message || `Failed to create menu item (${response.status})`);
  }

  const result: ApiResponse<MenuItem> = await response.json();
  return result.data || result as unknown as MenuItem;
};

export const updateMenuItem = async (id: number, params: UpdateMenuItemParams): Promise<MenuItem> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required. Please log in again.');
  }

  const response = await fetch(`${API_URL}/menu_items/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error('Session expired. Please log in again.');
    }
    throw new Error(errorData.error || errorData.message || `Failed to update menu item (${response.status})`);
  }

  const result: ApiResponse<MenuItem> = await response.json();
  return result.data || result as unknown as MenuItem;
};

export const toggleItemAvailability = async (id: number): Promise<MenuItem> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required. Please log in again.');
  }

  const response = await fetch(`${API_URL}/menu_items/${id}/toggle_availability`, {
    method: 'PATCH',
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
    throw new Error(errorData.error || errorData.message || `Failed to toggle availability (${response.status})`);
  }

  const result: ApiResponse<MenuItem> = await response.json();
  return result.data || result as unknown as MenuItem;
};

export const deleteMenuItem = async (id: number): Promise<boolean> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required. Please log in again.');
  }

  const response = await fetch(`${API_URL}/menu_items/${id}`, {
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
    throw new Error(errorData.error || errorData.message || `Failed to delete menu item (${response.status})`);
  }

  return true;
};
