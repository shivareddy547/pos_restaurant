// ⚠️ This is an imported service file
// Check if it needs updates for new requirements
// Preserve existing functionality
// Add new methods if needed
// Follow existing patterns

// File: /Users/sadudodla/shiva/user_projects/1/pos_restaurant/src/services/orderService.ts
// Service for order-related API calls with authentication

// API base URL - configure based on environment
const API_BASE_URL = 'http://localhost:3001/api';

// ============================================
// AUTHENTICATION HELPER
// ============================================

/**
 * Retrieves the authentication token from localStorage
 * Used for authorized API requests
 */
export const getAuthToken = (): string | null => {
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

/**
 * Helper to check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Creates headers with authorization token
 * Returns headers object with Bearer token if available
 */
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// ============================================
// TYPES
// ============================================

export interface OrderItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'Pending' | 'Paid';
  payment_method?: string;
  order_type?: 'Dine-in' | 'Dine-out' | 'Takeaway';
  notes?: string;
  customer_name?: string;
  table_id?: number;
  floor_id?: number;
}

export interface Order {
  id: number;
  items: OrderItem[]; // Assuming API returns items array or text parsed as array
  subtotal: number;
  tax: number;
  total: number;
  status: 'Pending' | 'Paid';
  payment_method?: string;
  order_type?: 'Dine-in' | 'Dine-out' | 'Takeaway';
  created_at?: string;
  updated_at?: string;
  customer_name?: string;
  table_id?: number;
  floor_id?: number;
}

// ============================================
// FLOOR & TABLE TYPES
// ============================================

export interface Table {
  id: number;
  number: string;
  capacity: number;
  status: string | null;
  order_id: number | null;
  waiter: string | null;
  time_seated: string | null;
  total: number | null;
}

export interface Floor {
  id: number;
  name: string;
  tables: Table[];
  created_at?: string;
  updated_at?: string;
  user_id?: number;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Creates a new order with authentication
 * Requires valid Bearer token in Authorization header
 */
export const createOrder = async (orderData: CreateOrderRequest): Promise<Order> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required. Please log in to create an order.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      // Handle different error statuses
      if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }
      if (response.status === 403) {
        throw new Error('You do not have permission to create orders.');
      }
      
      // Try to get error message from response
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to create order: ${response.statusText}`);
    }

    const createdOrder: Order = await response.json();
    return createdOrder;
  } catch (error: any) {
    // Re-throw with meaningful message
    if (error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    throw error;
  }
};

/**
 * Fetches all orders (requires authentication)
 */
export const fetchOrders = async (): Promise<Order[]> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required. Please log in to view orders.');
  }

  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Session expired. Please log in again.');
    }
    throw new Error('Failed to fetch orders');
  }

  return response.json();
};

/**
 * Fetches a single order by ID (requires authentication)
 */
export const fetchOrderById = async (orderId: number | string): Promise<Order> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required. Please log in to view order details.');
  }

  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Session expired. Please log in again.');
    }
    if (response.status === 404) {
      throw new Error('Order not found');
    }
    throw new Error('Failed to fetch order');
  }

  return response.json();
};

/**
 * Fetches floors and tables data (requires authentication)
 * Used for Dine-in order selection
 */
export const fetchFloors = async (): Promise<Floor[]> => {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Authentication required. Please log in to view floors.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/floors`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error('Failed to fetch floors');
    }

    const data: Floor[] = await response.json();
    return data;
  } catch (error: any) {
    if (error.message.includes('fetch')) {
      throw new Error('Network error. Unable to load floors.');
    }
    throw error;
  }
};
