import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CartProvider, useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
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
  const { user, logout } = useAuth();

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

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <CartDrawer />

      {/* ================= HEADER ================= */}
      <header className="bg-blue-600 text-white shadow-lg fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl font-bold">P</span>
            </div>
            <h1 className="text-lg font-semibold">POS Cashier</h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Open cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4
                     M7 13L5.4 5
                     M7 13l-2.293 2.293
                     c-.63.63-.184 1.707.707 1.707H17
                     m0 0a2 2 0 100 4
                     2 2 0 000-4
                     zm-8 2a2 2 0 11-4 0
                     2 2 0 014 0z"
                />
              </svg>

              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm border-2 border-blue-600">
                  {getTotalItems()}
                </span>
              )}
            </button>

            {/* Desktop Profile + Logout */}
            <div className="relative hidden lg:block group">
              <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-700">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {user?.name || 'User'}
                </span>
              </button>

              <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded shadow-lg hidden group-hover:block">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={sidebarOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white shadow-xl z-40
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile Profile + Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500">Cashier</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full text-left text-red-600 font-medium px-2 py-2 rounded hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="flex-1 pt-16 lg:pt-0 lg:ml-64">
        <div className="p-4 lg:p-6">{children}</div>
      </main>
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
