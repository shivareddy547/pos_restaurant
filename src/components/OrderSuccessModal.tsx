import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CartItem } from '../context/CartContext';

interface OrderSuccessModalProps {
  isOpen: boolean;
  order: {
    id: string;
    date: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: string;
    orderType?: 'Dine-in' | 'Dine-out' | 'Takeaway';
  } | null;
  onClose: () => void;
  onNewOrder: () => void;
}

/* =======================
   PRINTABLE RECEIPT
======================= */
const PrintableReceipt: React.FC<{
  order: NonNullable<OrderSuccessModalProps['order']>;
  orderType: string;
  formatDateTime: (date: string) => string;
}> = ({ order, orderType, formatDateTime }) => (
  <div className="receipt-container bg-white">
    <div className="text-center mb-4 pb-4 border-b-2 border-dashed border-gray-300">
      <h3 className="text-xl font-bold">RECEIPT</h3>
      <p className="text-sm text-gray-500 mt-1">Thank you for your order!</p>
    </div>

    <div className="mb-4 space-y-2 text-sm">
      <div className="flex justify-between">
        <span>Order ID:</span>
        <span className="font-bold">{order.id}</span>
      </div>
      <div className="flex justify-between">
        <span>Date & Time:</span>
        <span>{formatDateTime(order.date)}</span>
      </div>
      <div className="flex justify-between">
        <span>Order Type:</span>
        <span>{orderType}</span>
      </div>
      <div className="flex justify-between">
        <span>Status:</span>
        <span className="font-bold">{order.status}</span>
      </div>
    </div>

    <div className="border-t-2 border-dashed border-gray-300 my-4" />

    <div className="mb-4">
      <h4 className="text-sm font-bold mb-3 text-center">ORDER ITEMS</h4>
      {order.items.map(item => (
        <div key={item.id} className="flex justify-between text-sm py-1">
          <div>
            <p className="font-semibold">{item.name}</p>
            <p className="text-xs">
              ${item.price.toFixed(2)} × {item.quantity}
            </p>
          </div>
          <span className="font-bold">
            ${(item.price * item.quantity).toFixed(2)}
          </span>
        </div>
      ))}
    </div>

    <div className="border-t-2 border-dashed border-gray-300 my-4" />

    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span>Subtotal:</span>
        <span>${order.subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span>Tax:</span>
        <span>${order.tax.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-bold pt-2 border-t-2 border-dashed border-gray-300">
        <span>Total:</span>
        <span>${order.total.toFixed(2)}</span>
      </div>
    </div>

    <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-300 text-center text-xs">
      *** Thank you for dining with us ***
    </div>
  </div>
);

/* =======================
   MAIN MODAL
======================= */
const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  order,
  onClose,
  onNewOrder,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const canRenderReceipt = useMemo(() => {
    return !!(
      order &&
      order.id &&
      order.items?.length &&
      typeof order.total === 'number'
    );
  }, [order]);

  const formatDateTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  }, []);

  /* ✅ GUARANTEED PRINT TIMING */
  useEffect(() => {
    if (isPrinting && canRenderReceipt) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.print();
        });
      });
    }
  }, [isPrinting, canRenderReceipt]);

  useEffect(() => {
    const reset = () => setIsPrinting(false);
    window.addEventListener('afterprint', reset);
    return () => window.removeEventListener('afterprint', reset);
  }, []);

  if (!isOpen || !order) return null;
  const orderType = order.orderType || 'Dine-in';

  return (
    <>
      {/* PRINT CONTAINER */}
      {isPrinting && (
        <div className="print-receipt-container fixed inset-0 bg-white z-[9999] p-6">
          <PrintableReceipt
            order={order}
            orderType={orderType}
            formatDateTime={formatDateTime}
          />
        </div>
      )}

      {/* BACKDROP */}
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />

      {/* MODAL */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
          <div className="p-6 border-b text-center">
            <h2 className="text-xl font-bold text-green-700">Order Successful</h2>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <PrintableReceipt
              order={order}
              orderType={orderType}
              formatDateTime={formatDateTime}
            />
          </div>

          <div className="p-4 border-t space-y-2">
            <button
              onClick={() => setIsPrinting(true)}
              className="w-full py-2 border rounded-lg"
            >
              Print Receipt
            </button>
            <button
              onClick={onNewOrder}
              className="w-full py-2 bg-blue-600 text-white rounded-lg"
            >
              New Order
            </button>
          </div>
        </div>
      </div>

      {/* =======================
         FIXED PRINT STYLES
      ======================= */}
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 10mm;
          }

          body * {
            visibility: hidden !important;
          }

          .print-receipt-container,
          .print-receipt-container * {
            visibility: visible !important;
          }

          .print-receipt-container {
            position: absolute !important;
            top: 0;
            left: 0;
            width: 100%;
          }

          .receipt-container {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: black;
            background: white;
            max-width: 80mm;
            margin: 0 auto;
          }
        }
      `}</style>
    </>
  );
};

export default OrderSuccessModal;
