import React, { useState } from 'react';
import { useCart, CartItem } from '../context/CartContext';
import OrderSuccessModal from './OrderSuccessModal';

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

  // Handle initiating the checkout process
  const handleCheckoutInit = () => {
    if (cartItems.length === 0) return;

    // Create a temporary order object from current cart data
    // This freezes the data for the checkout session
    const order: TempOrder = {
      id: `ORD-${Date.now().toString().slice(-6)}`, // Mock Order ID
      date: new Date().toLocaleString(),
      items: [...cartItems], // Copy items
      subtotal: getSubtotal(),
      tax: getTax(),
      total: getGrandTotal(),
      status: 'Pending',
    };

    setTempOrder(order);
    setCheckoutStep('payment');
    setIsProcessingPayment(false);
    
    // FIX: QR screen should NOT auto-close. 
    // Removed automatic 3-second timeout.
  };

  // Mock function to confirm payment (Replacing auto-timeout)
  const handleConfirmPayment = () => {
    if (!tempOrder) return;
    
    setIsProcessingPayment(true);
    
    // Simulate processing delay, then confirm success
    // Future API Integration: Call backend to verify payment status
    setTimeout(() => {
      handlePaymentSuccess(tempOrder);
    }, 1500);
  };

  // Handle successful payment
  const handlePaymentSuccess = (order: TempOrder) => {
    const updatedOrder = { ...order, status: 'Paid' as 'Paid' };
    setTempOrder(updatedOrder);
    setCheckoutStep('success');
    setIsProcessingPayment(false);
    
    // FIX: Clear cart state only after payment success is confirmed
    clearCart();

    // FIX: Automatically open the order details/print popup immediately after order completion
    // This triggers the popup without requiring any user action (cart click, button click, etc.)
    setShowOrderSuccessModal(true);
    
    // Close the drawer so only the modal is visible
    setIsCartOpen(false);
  };

  // Handle returning to cart (cancel checkout)
  const handleBackToCart = () => {
    setCheckoutStep('cart');
    setTempOrder(null);
    setIsProcessingPayment(false);
    // FIX: Do NOT clear cart on cancel - items remain intact
  };

  // Handle closing the success modal
  const handleCloseSuccessModal = () => {
    setShowOrderSuccessModal(false);
    setIsCartOpen(false);
    // Reset to cart state after closing modal
    setCheckoutStep('cart');
    setTempOrder(null);
  };

  // Handle placing new order after success
  const handleNewOrder = () => {
    setShowOrderSuccessModal(false);
    setCheckoutStep('cart');
    setTempOrder(null);
    setIsCartOpen(true); // Open cart for new order
  };

  // CRITICAL FIX: Render OrderSuccessModal independently of isCartOpen state
  // This ensures the modal can open automatically after order completion
  // even when the cart drawer is closed
  return (
    <>
      {/* Order Success Modal - Always rendered when showOrderSuccessModal is true */}
      {/* This allows the popup to trigger automatically after order completion */}
      {/* without requiring a cart click or any manual user action */}
      {showOrderSuccessModal && tempOrder && (
        <OrderSuccessModal
          isOpen={showOrderSuccessModal}
          order={tempOrder}
          onClose={handleCloseSuccessModal}
          onNewOrder={handleNewOrder}
        />
      )}

      {/* Cart Drawer - Only rendered when isCartOpen is true AND success modal is not showing */}
      {/* This ensures cart click does NOT trigger the order completion popup after completion */}
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
                          <p className="text-sm text-blue-600 font-medium">${item.price.toFixed(2)}</p>
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
                  
                  {/* Comment for future API integration */}
                  <div className="text-xs text-gray-400 mt-2 px-4 text-center">
                    * Mock Payment: Clicking "Confirm Payment" simulates a successful webhook callback.
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
                  <button onClick={handleCheckoutInit} className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition-colors">
                    Checkout
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
