import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    { title: 'New Order', icon: '📝', path: '/orders', color: 'bg-blue-500' },
    { title: 'View Floor', icon: '🍽️', path: '/floor', color: 'bg-green-500' },
    { title: 'Menu', icon: '📋', path: '/', color: 'bg-purple-500' },
    { title: 'Staff', icon: '👥', path: '/staff', color: 'bg-orange-500' },
  ];

  const recentStats = [
    { label: 'Today\'s Orders', value: '24', icon: '📦' },
    { label: 'Active Tables', value: '8', icon: '🪑' },
    { label: 'Revenue', value: '$458.50', icon: '💰' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Welcome back, John! 👋</h1>
        <p className="text-blue-100">Here's what's happening at your restaurant today.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {recentStats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.title}
              onClick={() => navigate(action.path)}
              className={`${action.color} text-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95`}
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <div className="font-medium">{action.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              ✅
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Order #1004 completed</p>
              <p className="text-sm text-gray-500">Table T1 • 5 min ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              🍽️
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Table T7 seated</p>
              <p className="text-sm text-gray-500">4 guests • 12 min ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              👨‍🍳
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Order #1003 is ready</p>
              <p className="text-sm text-gray-500">Kitchen • 15 min ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
