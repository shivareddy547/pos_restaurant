import React, { useState, useMemo } from 'react';

// --- Types & Interfaces ---

type OrderType = 'dine-in' | 'dine-out';
type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served';

interface Order {
  id: number;
  tableNumber?: string; // Optional for Dine-Out
  orderType: OrderType;
  floorId?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  time: string;
  customerName?: string; // For Dine-Out
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string; // Emoji or URL
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

// --- Mock Data ---

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

const MOCK_FLOORS: Floor[] = [
  {
    id: 'ground',
    name: 'Ground Floor',
    tables: [
      { id: 't1', number: 'T1', capacity: 4, status: 'occupied' },
      { id: 't2', number: 'T2', capacity: 2, status: 'available' },
      { id: 't3', number: 'T3', capacity: 6, status: 'reserved' },
      { id: 't4', number: 'T4', capacity: 4, status: 'available' },
    ]
  },
  {
    id: 'first',
    name: 'First Floor',
    tables: [
      { id: 't5', number: 'T5', capacity: 4, status: 'available' },
      { id: 't6', number: 'T6', capacity: 8, status: 'available' },
    ]
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 1001,
    tableNumber: 'T2',
    orderType: 'dine-in',
    floorId: 'ground',
    items: [
      { id: 1, name: 'Caesar Salad', price: 8.99, quantity: 1 },
      { id: 3, name: 'Grilled Chicken', price: 14.99, quantity: 1 },
      { id: 7, name: 'Iced Tea', price: 2.99, quantity: 1 }
    ],
    total: 26.97,
    status: 'pending',
    time: '10:30 AM',
  },
  {
    id: 1002,
    tableNumber: 'T3',
    orderType: 'dine-in',
    floorId: 'ground',
    items: [
      { id: 4, name: 'Beef Burger', price: 12.99, quantity: 1 },
      { id: 2, name: 'French Fries', price: 4.50, quantity: 1 },
    ],
    total: 17.49,
    status: 'preparing',
    time: '10:15 AM',
  },
  {
    id: 1003,
    orderType: 'dine-out',
    customerName: 'John Doe',
    items: [
      { id: 5, name: 'Pasta Carbonara', price: 13.50, quantity: 1 },
      { id: 6, name: 'Chocolate Cake', price: 6.99, quantity: 1 }
    ],
    total: 20.49,
    status: 'ready',
    time: '10:00 AM',
  },
];

// --- Component ---

const OrderManagement: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  
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

  // Mobile View State
  const [activeMobileTab, setActiveMobileTab] = useState<'menu' | 'details'>('menu');

  const statusOptions = ['all', 'pending', 'preparing', 'ready', 'served'];

  const filteredOrders =
    selectedStatus === 'all' ? orders : orders.filter((o) => o.status === selectedStatus);

  // Fix: Use Array.from to ensure compatibility with TypeScript downlevel iteration
  const categories = ['All', ...Array.from(new Set(MOCK_MENU.map(item => item.category)))];

  const filteredMenu = menuCategory === 'All' 
    ? MOCK_MENU 
    : MOCK_MENU.filter(item => item.category === menuCategory);

  const selectedFloor = MOCK_FLOORS.find(f => f.id === selectedFloorId);

  // Calculations
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Handlers
  const handleOpenNewOrder = () => {
    setEditingOrder(null);
    setOrderType('dine-in');
    setSelectedFloorId('');
    setSelectedTableId('');
    setCustomerName('');
    setCartItems([]);
    setMenuCategory('All');
    setActiveMobileTab('menu'); // Start at menu on mobile
    setIsModalOpen(true);
  };

  const handleOpenExistingOrder = (order: Order) => {
    setEditingOrder(order);
    setOrderType(order.orderType);
    setSelectedFloorId(order.floorId || '');
    setSelectedTableId(order.tableNumber || ''); // Assuming tableNumber maps to ID in simple mock
    setCustomerName(order.customerName || '');
    setCartItems([...order.items]);
    setActiveMobileTab('details'); // Start at details on mobile when editing
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

  const handleSaveOrder = () => {
    if (cartItems.length === 0) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let tableNumber = '';
    if (orderType === 'dine-in') {
      const table = selectedFloor?.tables.find(t => t.id === selectedTableId);
      tableNumber = table?.number || '';
      if (!tableNumber) return; // Validation: Must select table
    } else {
      if (!customerName.trim()) return; // Validation: Name for dine-out
    }

    if (editingOrder) {
      // Update existing
      setOrders(prev => prev.map(o => 
        o.id === editingOrder.id 
          ? { 
              ...o, 
              items: cartItems, 
              total: cartTotal,
              orderType,
              tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
              floorId: orderType === 'dine-in' ? selectedFloorId : undefined,
              customerName: orderType === 'dine-out' ? customerName : undefined
            } 
          : o
      ));
    } else {
      // Create new
      const newOrder: Order = {
        id: Date.now(), // Simple ID generation
        orderType,
        floorId: orderType === 'dine-in' ? selectedFloorId : undefined,
        tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
        customerName: orderType === 'dine-out' ? customerName : undefined,
        items: cartItems,
        total: cartTotal,
        status: 'pending',
        time: timeString,
      };
      setOrders(prev => [newOrder, ...prev]);
    }
    
    setIsModalOpen(false);
  };

  const handleStatusChange = (orderId: number, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'served': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'preparing': return '👨‍🍳';
      case 'ready': return '✅';
      case 'served': return '🍽️';
    }
  };

  return (
    <div className="space-y-6">
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
        {filteredOrders.map((order) => (
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
                    <div className="flex items-center gap-2">
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
                    <p className="text-gray-600">
                      {order.orderType === 'dine-in' ? `Table ${order.tableNumber}` : order.customerName} • {order.time}
                    </p>
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
                  {order.items.slice(0, 3).map((item) => (
                    <span
                      key={item.id}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {item.name} x{item.quantity}
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Actions - Stop propagation to prevent modal opening when clicking buttons */}
              <div 
                className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2"
                onClick={(e) => e.stopPropagation()}
              >
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
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
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

            {/* Mobile Tab Switcher - Only visible on mobile */}
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
              {/* Category Tabs - Sticky & Touch Optimized */}
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

              {/* Menu Grid */}
              <div className="flex-1 overflow-y-auto p-4">
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
              </div>
            </div>

            {/* Right Side: Order Details & Cart */}
            <div className={`${activeMobileTab === 'details' ? 'flex' : 'hidden'} md:flex w-full md:w-96 bg-white flex flex-col border-l border-gray-200 h-full shadow-xl z-10`}>
              
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
                        {MOCK_FLOORS.map(floor => (
                          <option key={floor.id} value={floor.id}>{floor.name}</option>
                        ))}
                      </select>
                    </div>

                    {selectedFloorId && selectedFloor && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Table</label>
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
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">${item.price.toFixed(2)}</p>
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
