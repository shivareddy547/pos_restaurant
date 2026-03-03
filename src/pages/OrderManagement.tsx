// ⚠️ MODIFY existing component - add new functionality
// Preserve all existing imports and code
// Fix table and floor display integration
// Add status update dropdown for each order

import React, { useState, useMemo, useEffect } from 'react';

// --- Types & Interfaces ---

type OrderType = 'dine-in' | 'dine-out';
type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'paid';

interface Order {
  id: number;
  tableId?: string;
  tableNumber?: string; 
  orderType: OrderType;
  floorId?: string;
  floorName?: string;
  items: OrderItem[];
  subtotal?: number; 
  tax?: number;      
  total: number;
  status: OrderStatus;
  time: string;
  customerName?: string; 
  payment_method?: string; 
  user_id?: number;      
}

interface OrderItem {
  id: number;
  menu_item_id?: number;
  name?: string;         
  price?: number;        
  quantity: number;
  category?: string;
  image?: string;
  unit_price?: number | null;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string; 
}

interface Table {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
}

interface Floor {
  id: string;
  name: string;
  tables: Table[];
}

// --- API Interfaces for Backend Schemas ---

interface ApiFloor {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  user_id: number;
}

interface ApiTable {
  id: number;
  floor_id: number;
  number: string;
  capacity: number;
  status: string;
  order_id?: number;
  waiter?: string;
  time_seated?: string;
  total?: string;
  created_at: string;
  updated_at: string;
  user_id: number;
}

// --- API & Authentication Configuration ---

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

// --- Mock Data (Preserved for Fallback) ---

const MOCK_MENU: MenuItem[] = [
  { id: 1, name: 'Caesar Salad', price: 8.99, category: 'Starters', image: '🥗' },
  { id: 2, name: 'French Fries', price: 4.50, category: 'Starters', image: '🍟' },
  { id: 3, name: 'Grilled Chicken', price: 14.99, category: 'Mains', image: '🍗' },
  { id: 4, name: 'Beef Burger', price: 12.99, category: 'Mains', image: '🍔' },
  { id: 5, name: 'Pasta Carbonara', price: 13.50, category: 'Mains', image: '🍝' },
  { id: 6, name: 'Chocolate Cake', price: 6.99, category: 'Desserts', image: '🍰' },
  { id: 7, name: 'Iced Tea', price: 2.99, category: 'Drinks', image: '🧊' },
  { id: 8, name: 'Coffee', price: 3.50, category: 'Drinks', image: '☕' },
];

const INITIAL_ORDERS: Order[] = [];

// --- Helper: Normalize status from API ---
const normalizeStatus = (status: string): OrderStatus => {
  const normalized = status?.toLowerCase().trim();
  switch (normalized) {
    case 'pending':
      return 'pending';
    case 'preparing':
    case 'preparation':
      return 'preparing';
    case 'ready':
      return 'ready';
    case 'served':
    case 'completed':
      return 'served';
    case 'paid':
      return 'paid';
    default:
      return 'pending';
  }
};

// --- Helper: Normalize order type from API ---
const normalizeOrderType = (orderType: string): OrderType => {
  const normalized = orderType?.toLowerCase().trim();
  if (normalized === 'dine-out' || normalized === 'takeout' || normalized === 'take-away') {
    return 'dine-out';
  }
  return 'dine-in';
};

// --- Component ---

const OrderManagement: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  
  // New Order Form State
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [selectedFloorId, setSelectedFloorId] = useState<string>('');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [menuCategory, setMenuCategory] = useState<string>('All');

  // API Data State
  const [floors, setFloors] = useState<Floor[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MOCK_MENU);
  const [menuLoading, setMenuLoading] = useState(false);

  // Mobile View State
  const [activeMobileTab, setActiveMobileTab] = useState<'menu' | 'details'>('menu');
  
  // ✅ NEW: Status update loading state
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  const statusOptions = ['all', 'pending', 'preparing', 'ready', 'served', 'paid'];
  
  // ✅ NEW: All available statuses for dropdown
  const allStatuses: OrderStatus[] = ['pending', 'preparing', 'ready', 'served', 'paid'];

  // --- Helper: Resolve Order Item Details ---
  const resolveOrderItem = (item: OrderItem): MenuItem | null => {
    if (item.name && item.price !== undefined) {
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category || 'General',
        image: item.image || '🍽️'
      };
    }
    
    if (item.menu_item_id) {
      return menuItems.find(m => m.id === item.menu_item_id) || null;
    }
    
    return null;
  };

  // --- API Functions ---

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();
    
    if (!token) {
      setError('Authentication token missing');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const transformedOrders: Order[] = data.map((apiOrder: any) => {
        let items: OrderItem[] = [];
        
        // 1. Try to parse 'items' text/JSON column first
        let hasItemsColumn = false;
        try {
          let parsedItems;
          if (typeof apiOrder.items === 'string' && apiOrder.items.trim() !== '') {
             parsedItems = JSON.parse(apiOrder.items);
             hasItemsColumn = true;
          } else if (Array.isArray(apiOrder.items)) {
            parsedItems = apiOrder.items;
            hasItemsColumn = true;
          }

          if (Array.isArray(parsedItems)) {
            items = parsedItems;
          }
        } catch (e) {
          console.warn(`Order #${apiOrder.id}: failed to parse 'items' column.`);
        }

        // 2. If 'items' column is empty, use 'order_items' association
        if (!hasItemsColumn && Array.isArray(apiOrder.order_items)) {
          items = apiOrder.order_items.map((oi: any) => ({
            id: oi.id,
            menu_item_id: oi.menu_item_id,
            quantity: oi.quantity,
            unit_price: oi.unit_price,
            price: oi.unit_price ? parseFloat(oi.unit_price) : undefined
          }));
        }

        // ✅ FIXED: Extract table info from nested table object
        let tableNumber: string | undefined;
        if (apiOrder.table && typeof apiOrder.table === 'object' && apiOrder.table.number) {
          tableNumber = String(apiOrder.table.number);
        } else if (apiOrder.table_id) {
          tableNumber = `T${apiOrder.table_id}`;
        }
        
        // ✅ FIXED: Extract floor info from nested floor object
        let floorName: string | undefined;
        if (apiOrder.floor && typeof apiOrder.floor === 'object' && apiOrder.floor.name) {
          floorName = String(apiOrder.floor.name);
        }
        
        // ✅ FIXED: Also extract floor_id for fallback lookup
        let floorId: string | undefined;
        if (apiOrder.floor_id) {
          floorId = String(apiOrder.floor_id);
        }

        return {
          id: apiOrder.id,
          tableId: apiOrder.table_id ? String(apiOrder.table_id) : undefined,
          orderType: normalizeOrderType(apiOrder.order_type || 'dine-in'),
          tableNumber: tableNumber,
          floorId: floorId,
          floorName: floorName,
          customerName: apiOrder.customer_name,
          items: items,
          total: parseFloat(apiOrder.total) || 0,
          subtotal: apiOrder.subtotal ? parseFloat(apiOrder.subtotal) : undefined,
          tax: apiOrder.tax ? parseFloat(apiOrder.tax) : undefined,
          status: normalizeStatus(apiOrder.status || 'pending'),
          time: apiOrder.created_at ? new Date(apiOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          payment_method: apiOrder.payment_method,
          user_id: apiOrder.user_id,
        };
      });

      setOrders(transformedOrders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchFloors = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/floors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data: ApiFloor[] = await res.json();
        const transformedFloors: Floor[] = data.map(f => ({
          id: String(f.id),
          name: f.name,
          tables: [] 
        }));
        setFloors(transformedFloors);
      }
    } catch (err) {
      console.error("Failed to fetch floors", err);
    }
  };

  const fetchTablesForFloor = async (floorId: string) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/floors/${floorId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        const apiTables: ApiTable[] = data.tables || [];
        
        const transformedTables: Table[] = apiTables.map(t => ({
          id: String(t.id),
          number: t.number,
          capacity: t.capacity,
          status: (t.status as 'available' | 'occupied' | 'reserved') || 'available',
        }));

        setFloors(prev => prev.map(f => {
          if (f.id === floorId) {
            return { ...f, tables: transformedTables };
          }
          return f;
        }));
      }
    } catch (err) {
      console.error(`Failed to fetch tables for floor ${floorId}`, err);
    }
  };

  const fetchMenuItems = async () => {
    setMenuLoading(true);
    const token = getAuthToken();
    if (!token) {
      setMenuLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/menu_items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const transformedMenu: MenuItem[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          category: item.category || 'General',
          image: item.image_url || '🍽️'
        }));
        setMenuItems(transformedMenu);
      }
    } catch (err) {
      console.error("Failed to fetch menu items", err);
    } finally {
      setMenuLoading(false);
    }
  };

  const createOrder = async (orderPayload: any) => {
    const token = getAuthToken();
    if (!token) throw new Error('No auth token');

    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
  };

  const updateOrder = async (id: number, orderPayload: any) => {
    const token = getAuthToken();
    if (!token) throw new Error('No auth token');

    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) throw new Error('Failed to update order');
    return response.json();
  };

  const updateOrderStatus = async (id: number, status: string) => {
    const token = getAuthToken();
    if (!token) throw new Error('No auth token');

    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  };

  // --- Effects ---

  useEffect(() => {
    fetchOrders();
    fetchFloors(); 
    fetchMenuItems(); 
  }, []);

  useEffect(() => {
    if (selectedFloorId) {
      const floor = floors.find(f => f.id === selectedFloorId);
      if (floor) {
         fetchTablesForFloor(selectedFloorId);
      }
    }
  }, [selectedFloorId]);

  // ✅ FIXED: useMemo to enrich orders with floor names from floors state
  const enrichedOrders = useMemo(() => {
    return orders.map(order => {
      // If floorName is already set from API, keep it
      if (order.floorName) return order;
      
      // Otherwise, try to find floor name from floors state
      if (order.floorId) {
        const floor = floors.find(f => f.id === order.floorId);
        if (floor) {
          return { ...order, floorName: floor.name };
        }
      }
      
      return order;
    });
  }, [orders, floors]);

  // --- Helpers ---

  const filteredOrders =
    selectedStatus === 'all' ? enrichedOrders : enrichedOrders.filter((o) => o.status === selectedStatus);

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const filteredMenu = menuCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === menuCategory);

  const selectedFloor = floors.find(f => f.id === selectedFloorId);

  const cartTotal = cartItems.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);

  // --- Handlers ---

  const handleOpenNewOrder = () => {
    setEditingOrder(null);
    setOrderType('dine-in');
    setSelectedFloorId('');
    setSelectedTableId('');
    setCustomerName('');
    setCartItems([]);
    setMenuCategory('All');
    setActiveMobileTab('menu');
    setIsModalOpen(true);
  };

  const handleOpenExistingOrder = (order: Order) => {
    setEditingOrder(order);
    setOrderType(order.orderType);
    setSelectedFloorId(order.floorId || '');
    setSelectedTableId(order.tableId || '');
    setCustomerName(order.customerName || '');
    
    // Enrich items with names/prices from menuItems if missing
    const enrichedItems = order.items.map(item => {
      const resolved = resolveOrderItem(item);
      return {
        ...item,
        name: resolved?.name || item.name || 'Unknown Item',
        price: resolved?.price !== undefined ? resolved.price : (item.price || 0),
        image: resolved?.image || item.image,
        category: resolved?.category || item.category
      };
    });

    setCartItems(enrichedItems);
    setActiveMobileTab('details'); 
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddToCart = (menuItem: MenuItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === menuItem.id);
      if (existing) {
        return prev.map(i => i.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...menuItem, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (itemId: number) => {
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: number, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleSaveOrder = async () => {
  if (cartItems.length === 0) return;

  let tableId: number | undefined = undefined;
  let floorId: number | undefined = undefined;

  if (selectedFloorId) {
    floorId = parseInt(selectedFloorId, 10);
  }

  if (orderType === 'dine-in') {
    const table = selectedFloor?.tables.find(t => t.id === selectedTableId);

    if (!table) {
      alert("Please select a valid table.");
      return;
    }

    if (selectedTableId) {
      tableId = parseInt(selectedTableId, 10);
      if (isNaN(tableId)) {
          alert("Invalid Table ID selected.");
          return;
      }
    } else {
      alert("Please select a table.");
      return;
    }
  } else {
    if (!customerName.trim()) {
      alert("Please enter customer name for takeout.");
      return;
    }
  }

  // FIX: Changed from 'price' to 'unit_price' to match backend expectation
  const payload = {
    items: cartItems.map(item => ({
      id: item.id,
      name: item.name || 'Unknown',
      unit_price: String(item.price || 0), // Changed from 'price' to 'unit_price'
      quantity: item.quantity,
      category: item.category || 'General'
    })),
    subtotal: cartTotal,
    tax: 0,
    total: cartTotal,
    status: editingOrder ? editingOrder.status : 'pending',
    payment_method: 'cash',
    order_type: orderType,
    table_id: tableId,
    floor_id: floorId,
    customer_name: orderType === 'dine-out' ? customerName : undefined,
  };

  try {
    if (editingOrder) {
      await updateOrder(editingOrder.id, payload);
      await fetchOrders();
    } else {
      await createOrder(payload);
      await fetchOrders();
    }
    setIsModalOpen(false);
  } catch (error) {
    console.error('Error saving order:', error);
    alert('Could not save order. Please try again.');
  }
};

  // ✅ NEW: Enhanced status change handler with loading state
  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    setUpdatingStatusId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Could not update status. Please try again.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'served': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'paid': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'preparing': return '👨‍🍳';
      case 'ready': return '✅';
      case 'served': return '🍽️';
      case 'paid': return '💰';
      default: return '📋';
    }
  };

  // ✅ FIXED: Helper function to format table display text
  const getTableDisplayText = (order: Order): string => {
    const parts: string[] = [];
    
    if (order.orderType === 'dine-in') {
      if (order.tableNumber) {
        parts.push(`Table ${order.tableNumber}`);
      } else if (order.tableId) {
        parts.push(`Table T${order.tableId}`);
      }
      
      if (order.floorName) {
        parts.push(`(${order.floorName})`);
      } else if (order.floorId) {
        const floor = floors.find(f => f.id === order.floorId);
        if (floor) {
          parts.push(`(${floor.name})`);
        }
      }
    }
    
    return parts.join(' ');
  };

  return (
    <div className="space-y-6 md:mt-[5%]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600 mt-1">Track and manage customer orders</p>
        </div>
        <button 
          onClick={handleOpenNewOrder}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
        >
          <span>+</span> New Order
        </button>
      </div>

      {/* API Status Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Status Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg capitalize transition-all ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No orders found.</div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md cursor-pointer"
              onClick={() => handleOpenExistingOrder(order)}
            >
              <div className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{getStatusIcon(order.status)}</div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.orderType === 'dine-in' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {order.orderType === 'dine-in' ? 'Dine-In' : 'Dine-Out'}
                        </span>
                      </div>
                      {/* ✅ FIXED: Display table and floor info */}
                      <p className="text-gray-600">
                        {order.orderType === 'dine-in' 
                          ? (getTableDisplayText(order) || 'No table assigned')
                          : order.customerName || 'Takeout Order'} • {order.time}
                      </p>
                      {/* Display payment method if available */}
                      {order.payment_method && (
                        <p className="text-sm text-gray-500 mt-1">
                          Payment: <span className="font-medium">{order.payment_method}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-xl font-bold text-blue-600">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">Items:</p>
                  <div className="flex flex-wrap gap-2">
                    {order.items && order.items.length > 0 ? (
                      <>
                        {order.items.slice(0, 3).map((item) => {
                          const details = resolveOrderItem(item);
                          const name = details?.name || item.name || `Item ${item.menu_item_id}`;
                          return (
                            <span
                              key={item.id}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                            >
                              {name} x{item.quantity}
                            </span>
                          )
                        })}
                        {order.items.length > 3 && (
                          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-gray-400 italic">No items details available</span>
                    )}
                  </div>
                </div>

                {/* ✅ NEW: Actions with Status Dropdown */}
                <div 
                  className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2 items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* ✅ NEW: Status Dropdown Selector */}
                  <div className="flex items-center gap-2 mr-4">
                    <label className="text-sm text-gray-600 font-medium">Update Status:</label>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      disabled={updatingStatusId === order.id}
                      className={`px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                        updatingStatusId === order.id ? 'opacity-50 cursor-wait' : 'hover:border-gray-400'
                      }`}
                    >
                      {allStatuses.map((status) => (
                        <option key={status} value={status} className="capitalize">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    {updatingStatusId === order.id && (
                      <span className="text-sm text-blue-600 animate-pulse">Updating...</span>
                    )}
                  </div>

                  {/* Quick Action Buttons (preserved) */}
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => handleStatusChange(order.id, 'preparing')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Start Preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button 
                      onClick={() => handleStatusChange(order.id, 'ready')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Mark Ready
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button 
                      onClick={() => handleStatusChange(order.id, 'served')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      Mark Served
                    </button>
                  )}
                  {order.status === 'served' && (
                    <button 
                      onClick={() => handleStatusChange(order.id, 'paid')}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                    >
                      Mark Paid
                    </button>
                  )}
                  <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- Order Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal}></div>
          
          <div className="relative bg-white w-full h-full sm:h-[90vh] sm:max-w-6xl sm:rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Close Button (Mobile absolute) */}
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-50 md:hidden bg-white/90 p-2 rounded-full shadow-md text-gray-600 border border-gray-200"
            >
              ✕
            </button>

            {/* Mobile Tab Switcher */}
            <div className="flex md:hidden border-b border-gray-200 shrink-0 bg-white">
              <button
                onClick={() => setActiveMobileTab('menu')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
                  activeMobileTab === 'menu' 
                    ? 'border-blue-600 text-blue-600 bg-blue-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Menu
              </button>
              <button
                onClick={() => setActiveMobileTab('details')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 flex items-center justify-center gap-2 ${
                  activeMobileTab === 'details' 
                    ? 'border-blue-600 text-blue-600 bg-blue-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Order 
                {cartItems.length > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {cartItems.length}
                  </span>
                )}
              </button>
            </div>

            {/* Left Side: Menu Selection */}
            <div className={`${activeMobileTab === 'menu' ? 'flex' : 'hidden'} md:flex flex-1 flex-col h-full bg-gray-50 overflow-hidden`}>
              <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 overflow-x-auto shadow-sm">
                <div className="flex gap-3 min-w-max snap-x snap-mandatory">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setMenuCategory(cat)}
                      className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all snap-start shrink-0 touch-manipulation active:scale-95 ${
                        menuCategory === cat 
                          ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {menuLoading ? (
                  <div className="text-center py-10 text-gray-500">Loading menu...</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMenu.map(item => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                      >
                        <div className="text-4xl shrink-0">{item.image}</div>
                        <div className="flex-1 w-full">
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">{item.category}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-blue-600 font-bold">${item.price.toFixed(2)}</p>
                            <button
                              onClick={() => handleAddToCart(item)}
                              className="bg-blue-100 text-blue-600 hover:bg-blue-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors active:scale-90"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Order Details & Cart */}
            <div className={`${activeMobileTab === 'details' ? 'flex' : 'hidden'} md:flex w-full md:w-96 bg-white flex-col border-l border-gray-200 h-full shadow-xl z-10`}>
              
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white shrink-0">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingOrder ? 'Edit Order' : 'New Order'}
                </h3>
                <button 
                  onClick={handleCloseModal}
                  className="hidden md:block text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                
                {/* Order Type Selector */}
                <div className="bg-gray-50 p-1 rounded-lg flex">
                  <button
                    onClick={() => { setOrderType('dine-in'); setSelectedTableId(''); }}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      orderType === 'dine-in' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    🍽️ Dine-In
                  </button>
                  <button
                    onClick={() => { setOrderType('dine-out'); setSelectedTableId(''); }}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      orderType === 'dine-out' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    🥡 Dine-Out
                  </button>
                </div>

                {/* Dine-In Options */}
                {orderType === 'dine-in' && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Floor</label>
                      <select
                        value={selectedFloorId}
                        onChange={(e) => { setSelectedFloorId(e.target.value); setSelectedTableId(''); }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Choose Floor...</option>
                        {floors.map(floor => (
                          <option key={floor.id} value={floor.id}>{floor.name}</option>
                        ))}
                      </select>
                    </div>

                    {selectedFloorId && selectedFloor && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Table</label>
                        {selectedFloor.tables.length === 0 ? (
                          <div className="text-sm text-gray-500">Loading tables...</div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {selectedFloor.tables.map(table => (
                              <button
                                key={table.id}
                                onClick={() => setSelectedTableId(table.id)}
                                disabled={table.status === 'occupied'}
                                className={`
                                  p-3 rounded-lg border-2 text-center transition-all active:scale-95
                                  ${selectedTableId === table.id 
                                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                    : 'border-gray-200 bg-white hover:border-gray-300'}
                                  ${table.status === 'occupied' ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'}
                                `}
                              >
                                <div className="font-bold">{table.number}</div>
                                <div className="text-[10px] uppercase">{table.status}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Dine-Out Options */}
                {orderType === 'dine-out' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                )}

                <div className="border-t border-gray-100 my-4"></div>

                {/* Cart */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h4>
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No items added yet
                      {activeMobileTab === 'details' && (
                        <button 
                          onClick={() => setActiveMobileTab('menu')}
                          className="block mt-2 text-blue-600 font-medium hover:underline"
                        >
                          Browse Menu
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cartItems.map(item => (
                        <div key={item.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.name || `Item ${item.menu_item_id}`}</p>
                            <p className="text-xs text-gray-500">${item.price ? item.price.toFixed(2) : '0.00'}</p>
                          </div>
                          <div className="flex items-center gap-2 bg-white rounded border border-gray-200">
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, -1)}
                              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:bg-gray-200"
                            >
                              -
                            </button>
                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, 1)}
                              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:bg-gray-200"
                            >
                              +
                            </button>
                          </div>
                          <button 
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 p-1 active:scale-90 transition-transform"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Footer / Total */}
              <div className="border-t border-gray-200 p-4 bg-gray-50 shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Total</span>
                  <span className="text-2xl font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleSaveOrder}
                  disabled={cartItems.length === 0 || (orderType === 'dine-in' && !selectedTableId) || (orderType === 'dine-out' && !customerName.trim())}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg active:scale-[0.98]"
                >
                  {editingOrder ? 'Update Order' : 'Place Order'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
