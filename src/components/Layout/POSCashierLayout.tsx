import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CartProvider, useCart } from '../../context/CartContext';
import CartDrawer from '../CartDrawer';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
}

const POSCashierLayoutContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { getTotalItems, setIsCartOpen } = useCart();

  const navItems: NavItem[] = [
    { id: 'home', label: 'Menu Management', path: '/', icon: '📋' },
    { id: 'floor', label: 'Floor Management', path: '/floor', icon: '🍽️' },
    { id: 'orders', label: 'Order Management', path: '/orders', icon: '📝' },
    { id: 'staff', label: 'Staff Management', path: '/staff', icon: '👥' },
    { id: 'reports', label: 'Reports', path: '/reports', icon: '📊' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <CartDrawer />
      <header className="bg-blue-600 text-white shadow-lg fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl font-bold">P</span>
            </div>
            <h1 className="text-lg font-semibold">POS Cashier</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white" aria-label="Open cart">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm border-2 border-blue-600">
                  {getTotalItems()}
                </span>
              )}
            </button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white lg:hidden" aria-label="Toggle menu" aria-expanded={sidebarOpen}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />) : (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />)}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {sidebarOpen && (<div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />)}

      <aside className={`fixed top-16 left-0 bottom-0 w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button key={item.id} onClick={() => handleNavClick(item.path)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`} aria-current={isActive ? 'page' : undefined}>
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                {isActive && (<span className="ml-auto"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></span>)}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><span className="text-blue-600 font-semibold">JD</span></div>
            <div className="flex-1"><p className="text-sm font-medium text-gray-900">John Doe</p><p className="text-xs text-gray-500">Cashier</p></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 pt-16 lg:pt-0 lg:ml-64"><div className="p-4 lg:p-6">{children}</div></main>
    </div>
  );
};

const POSCashierLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <CartProvider>
      <POSCashierLayoutContent>{children}</POSCashierLayoutContent>
    </CartProvider>
  );
};

export default POSCashierLayout;
