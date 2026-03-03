// ⚠️ CRITICAL: This is an EXISTING file. Only modify what's necessary.
// Component name: 'CartDrawer'
// DO NOT remove or change existing working code
// DO NOT rewrite this file from scratch
// Only add/update code to implement new requirements
// Preserve all existing imports, exports, and structure

// EXISTING CONTENT (do not delete any of this):
import React, { useState, useEffect, useMemo } from 'react';
import { useCart, CartItem } from '../context/CartContext';
import OrderSuccessModal from './OrderSuccessModal';
// NEW IMPORT: Order service for API integration with authentication
import { createOrder, Order, getAuthToken, fetchFloors, Floor, Table } from '../services/orderService';

// Types for the checkout flow
type CheckoutStep = 'cart' | 'payment' | 'success';

interface TempOrder {
  id: string;
  date: string;
  items: CartItem[]; 
  subtotal: number;
  tax: number;
  total: number;
  status: 'Pending' | 'Paid';
  orderType?: 'Dine-in' | 'Dine-out' | 'Takeaway';
}

const CartDrawer: React.FC = () => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getSubtotal,
    getTax,
    getGrandTotal,
  } = useCart();

  // State for managing the checkout flow
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart');
  const [tempOrder, setTempOrder] = useState<TempOrder | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);
  // NEW STATE: Error handling for API calls
  const [apiError, setApiError] = useState<string | null>(null);
  // NEW STATE: Additional order details matching backend schema
  const [orderType, setOrderType] = useState<'Dine-in' | 'Dine-out' | 'Takeaway'>('Dine-in');
  const [customerName, setCustomerName] = useState<string>('');
  const [tableId, setTableId] = useState<number | null>(null);
  const [floorId, setFloorId] = useState<number | null>(null);

  // NEW STATE: Floors and Tables API Integration
  const [floors, setFloors] = useState<Floor[]>([]);
  const [isLoadingFloors, setIsLoadingFloors] = useState(true);
  const [floorsError, setFloorsError] = useState<string | null>(null);

  // Fetch floors on component mount
  useEffect(() => {
    const loadFloors = async () => {
      try {
        setIsLoadingFloors(true);
        const data = await fetchFloors();
        setFloors(data);
        setFloorsError(null);
      } catch (err: any) {
        console.error('Failed to load floors:', err);
        setFloorsError(err.message || 'Failed to load floor data');
      } finally {
        setIsLoadingFloors(false);
      }
    };

    loadFloors();
  }, []);

  // Derive available tables based on selected floor from fetched data
  const availableTables = useMemo(() => {
    if (!floorId) return [];
    const selectedFloor = floors.find(f => f.id === floorId);
    return selectedFloor ? selectedFloor.tables : [];
  }, [floorId, floors]);

  // Helper to check if user is authenticated locally
  const isAuthenticated = (): boolean => {
    return !!getAuthToken();
  };

  // Handle initiating the checkout process
  const handleCheckoutInit = () => {
    if (cartItems.length === 0) return;

    // Check authentication before proceeding
    if (!isAuthenticated()) {
      setApiError('Please log in to proceed with checkout.');
      return;
    }

    // Validate Dine-in selection
    if (orderType === 'Dine-in' && (!floorId || !tableId)) {
      setApiError('Please select both Floor and Table for Dine-in orders.');
      return;
    }

    // Clear any previous errors
    setApiError(null);

    // Create a temporary order object from current cart data
    // This freezes the data for the checkout session
    const order: TempOrder = {
      id: `ORD-${Date.now().toString().slice(-6)}`, // Mock Order ID (will be replaced by API)
      date: new Date().toLocaleString(),
      items: [...cartItems], // Copy items
      subtotal: getSubtotal(),
      tax: getTax(),
      total: getGrandTotal(),
      status: 'Pending',
      orderType: orderType, // Include selected order type
    };

    setTempOrder(order);
    setCheckoutStep('payment');
    setIsProcessingPayment(false);
  };

  // Handle Floor Selection Change
  const handleFloorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFloorId = Number(e.target.value);
    setFloorId(newFloorId);
    // Reset table selection when floor changes to maintain data integrity
    setTableId(null);
    setApiError(null);
  };

  // Mock function to confirm payment (Replacing auto-timeout)
  const handleConfirmPayment = () => {
    if (!tempOrder) return;
    
    // Verify authentication before payment
    const token = getAuthToken();
    if (!token) {
      setApiError('Authentication required. Please log in to complete payment.');
      return;
    }
    
    setIsProcessingPayment(true);
    setApiError(null);
    
    // Simulate processing delay, then confirm success
    // After delay, create order via API with Bearer token
    setTimeout(() => {
      handlePaymentSuccess(tempOrder);
    }, 1500);
  };

  // Handle successful payment - INTEGRATED WITH API USING BEARER TOKEN
  const handlePaymentSuccess = async (order: TempOrder) => {
    try {
      // Verify authentication before creating order
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please log in to create an order.');
      }

      // Prepare items array matching backend schema expectations
      const orderItems = order.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category
      }));

      // Create order via API with authentication (Bearer token in Authorization header)
      const createdOrder: Order = await createOrder({
        items: orderItems,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        status: 'Paid',
        payment_method: 'Razorpay',
        order_type: order.orderType || 'Dine-in',
        customer_name: customerName || undefined,
        table_id: tableId || undefined,
        floor_id: floorId || undefined
      });

      // Update temp order with API response data
      const updatedOrder: TempOrder = {
        ...order,
        id: createdOrder.id.toString(),
        date: createdOrder.created_at || order.date,
        status: 'Paid',
      };

      setTempOrder(updatedOrder);
      setCheckoutStep('success');
      setIsProcessingPayment(false);
      setApiError(null);
      
      // Clear cart state only after payment success is confirmed
      clearCart();

      // Automatically open the order details/print popup immediately after order completion
      setShowOrderSuccessModal(true);
      
      // Close the drawer so only the modal is visible
      setIsCartOpen(false);
    } catch (error: any) {
      console.error('Failed to create order:', error);
      setIsProcessingPayment(false);
      setApiError(error.message || 'Failed to create order. Please try again.');
      
      // Keep user on payment step so they can retry
      // Don't clear cart or change status on error
    }
  };

  // Handle returning to cart (cancel checkout)
  const handleBackToCart = () => {
    setCheckoutStep('cart');
    setTempOrder(null);
    setIsProcessingPayment(false);
    setApiError(null);
    // Do NOT clear cart on cancel - items remain intact
  };

  // Handle closing the success modal
  const handleCloseSuccessModal = () => {
    setShowOrderSuccessModal(false);
    setIsCartOpen(false);
    // Reset to cart state after closing modal
    setCheckoutStep('cart');
    setTempOrder(null);
    setApiError(null);
    // Reset optional fields
    setCustomerName('');
    setTableId(null);
    setFloorId(null);
  };

  // Handle placing new order after success
  const handleNewOrder = () => {
    setShowOrderSuccessModal(false);
    setCheckoutStep('cart');
    setTempOrder(null);
    setApiError(null);
    setIsCartOpen(true); // Open cart for new order
  };

  // Render OrderSuccessModal independently of isCartOpen state
  return (
    <>
      {/* Order Success Modal - Always rendered when showOrderSuccessModal is true */}
      {showOrderSuccessModal && tempOrder && (
        <OrderSuccessModal
          isOpen={showOrderSuccessModal}
          order={tempOrder}
          onClose={handleCloseSuccessModal}
          onNewOrder={handleNewOrder}
        />
      )}

      {/* Cart Drawer - Only rendered when isCartOpen is true AND success modal is not showing */}
      {isCartOpen && !showOrderSuccessModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
            onClick={() => setIsCartOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
            
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {checkoutStep === 'cart' && <><span>🛒</span> Your Cart</>}
                {checkoutStep === 'payment' && <><span>💳</span> Payment</>}
                {checkoutStep === 'success' && <><span>✅</span> Order Success</>}
              </h2>
              {checkoutStep === 'cart' && (
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* --- BODY CONTENT --- */}
            <div className="flex-1 overflow-y-auto p-4">
              
              {/* 1. CART VIEW */}
              {checkoutStep === 'cart' && (
                <div className="space-y-4">
                  {/* Order Details Section (New) */}
                  {cartItems.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                      <h3 className="font-semibold text-blue-900 text-sm">Order Details</h3>
                      
                      {/* Order Type Selector */}
                      <div>
                        <label className="block text-xs font-medium text-blue-700 mb-1">Order Type</label>
                        <div className="flex gap-2">
                          {(['Dine-in', 'Dine-out', 'Takeaway'] as const).map((type) => (
                            <button
                              key={type}
                              onClick={() => setOrderType(type)}
                              className={`flex-1 py-2 px-3 text-xs font-medium rounded-md border transition-colors ${
                                orderType === type
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-100'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Customer Name (Optional) */}
                      <div>
                        <label className="block text-xs font-medium text-blue-700 mb-1">Customer Name (Optional)</label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Enter name..."
                          className="w-full px-3 py-2 text-sm border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Floor and Table Selectors (Conditional - show for Dine-in) */}
                      {orderType === 'Dine-in' && (
                        <div className="grid grid-cols-2 gap-2">
                          {/* Floor Selector */}
                          <div>
                            <label className="block text-xs font-medium text-blue-700 mb-1">Floor</label>
                            <select
                              value={floorId || ''}
                              onChange={handleFloorChange}
                              disabled={isLoadingFloors}
                              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                isLoadingFloors 
                                  ? 'bg-gray-100 border-gray-300 text-gray-400' 
                                  : 'bg-white border-blue-200'
                              }`}
                            >
                              <option value="" disabled>{isLoadingFloors ? 'Loading...' : 'Select Floor'}</option>
                              {floors.map(floor => (
                                <option key={floor.id} value={floor.id}>{floor.name}</option>
                              ))}
                            </select>
                            {floorsError && (
                              <p className="text-[10px] text-red-500 mt-1 truncate" title={floorsError}>Error loading floors</p>
                            )}
                          </div>

                          {/* Table Selector - Dynamically updates based on Floor */}
                          <div>
                            <label className="block text-xs font-medium text-blue-700 mb-1">Table</label>
                            <select
                              value={tableId || ''}
                              onChange={(e) => setTableId(e.target.value ? Number(e.target.value) : null)}
                              disabled={!floorId}
                              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                !floorId 
                                  ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                                  : 'bg-white border-blue-200'
                              }`}
                            >
                              <option value="" disabled>
                                {!floorId ? 'Select Floor First' : 'Select Table'}
                              </option>
                              {availableTables.map(table => (
                                <option key={table.id} value={table.id}>{table.number}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                      
                      {/* Validation Error for Dine-in */}
                      {orderType === 'Dine-in' && apiError && apiError.includes('Floor') && (
                        <p className="text-xs text-red-600 mt-1">{apiError}</p>
                      )}
                    </div>
                  )}

                  {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <span className="text-6xl mb-4">🛒</span>
                      <p className="text-lg font-medium">Your cart is empty</p>
                      <p className="text-sm">Add items from the menu to get started</p>
                    </div>
                  ) : (
                    cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
                      >
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                           {item.image.startsWith('data:image') ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-3xl">{item.image}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                          <p className="text-sm text-blue-600 font-medium">${Number(item.price).toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 hover:text-red-700">
                            Remove
                          </button>
                          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600">-</button>
                            <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600">+</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 2. PAYMENT VIEW (Razorpay Mock) */}
              {checkoutStep === 'payment' && tempOrder && (
                <div className="flex flex-col items-center justify-center h-full space-y-6 py-8">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900">Scan to Pay</h3>
                    <p className="text-sm text-gray-500">Razorpay Secure Payment</p>
                  </div>
                  
                  {/* Mock QR Code */}
                  <div className="relative group">
                    <div className="w-48 h-48 bg-white border-4 border-blue-600 rounded-lg p-2 shadow-lg">
                      <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=RazorpayMockPayment" 
                        alt="Payment QR Code" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {isProcessingPayment && (
                      <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>

                  <div className="w-full bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">${tempOrder.total.toFixed(2)}</p>
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isProcessingPayment 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isProcessingPayment ? '⏳ Processing...' : 'Awaiting Payment'}
                      </span>
                    </div>
                  </div>

                  {/* API Error Display */}
                  {apiError && (
                    <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-red-500 text-lg">⚠️</span>
                        <div>
                          <p className="text-sm font-medium text-red-800">Payment Error</p>
                          <p className="text-xs text-red-600 mt-1">{apiError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="w-full space-y-3 pt-4">
                    {/* Confirm Payment Button (Mock Success Flow) */}
                    {!isProcessingPayment && (
                      <button 
                        onClick={handleConfirmPayment}
                        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-md transition-colors"
                      >
                        Confirm Payment
                      </button>
                    )}
                    
                    <button 
                      onClick={handleBackToCart}
                      disabled={isProcessingPayment}
                      className="w-full py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 text-sm underline"
                    >
                      Cancel Payment
                    </button>
                  </div>
                  
                  {/* Comment for API integration */}
                  <div className="text-xs text-gray-400 mt-2 px-4 text-center">
                    * Secure payment processing. Order will be created after payment confirmation with authentication.
                  </div>
                </div>
              )}

              {/* 3. ORDER SUCCESS VIEW (Hidden in drawer, modal used instead) */}
              {checkoutStep === 'success' && tempOrder && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-xl font-bold text-green-800">Payment Successful!</h3>
                  <p className="text-sm text-green-600 mt-2">Your order receipt is ready.</p>
                </div>
              )}

            </div>

            {/* --- FOOTER ACTIONS --- */}
            {checkoutStep === 'cart' && cartItems.length > 0 && (
              <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
                {/* Authentication Warning */}
                {!isAuthenticated() && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-600">⚠️</span>
                      <p className="text-xs text-yellow-800">Please log in to proceed with checkout</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Items ({getTotalItems()})</span>
                    <span>${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (8%)</span>
                    <span>${getTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>${getGrandTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button onClick={() => setIsCartOpen(false)} className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors">
                    Continue Ordering
                  </button>
                  <button 
                    onClick={handleCheckoutInit} 
                    className={`w-full py-2.5 text-white rounded-lg font-medium shadow-md transition-colors ${
                      isAuthenticated() 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isAuthenticated() ? 'Checkout' : 'Login Required'}
                  </button>
                </div>
                <button onClick={clearCart} className="w-full text-center text-xs text-red-500 hover:text-red-700 py-1">
                  Empty Cart
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default CartDrawer;
