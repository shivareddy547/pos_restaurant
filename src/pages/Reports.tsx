import React, { useState } from 'react';

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const periods = ['today', 'week', 'month', 'year'];

  const stats = [
    {
      label: 'Total Revenue',
      value: '$2,458.50',
      change: '+12.5%',
      trend: 'up',
      icon: '💰',
    },
    {
      label: 'Total Orders',
      value: '156',
      change: '+8.2%',
      trend: 'up',
      icon: '📝',
    },
    {
      label: 'Average Order',
      value: '$15.76',
      change: '-2.1%',
      trend: 'down',
      icon: '📊',
    },
    {
      label: 'Active Customers',
      value: '89',
      change: '+5.4%',
      trend: 'up',
      icon: '👥',
    },
  ];

  const topItems = [
    { name: 'Grilled Chicken', orders: 45, revenue: '$805.50' },
    { name: 'Beef Burger', orders: 38, revenue: '$569.62' },
    { name: 'Pasta Carbonara', orders: 32, revenue: '$543.68' },
    { name: 'Caesar Salad', orders: 28, revenue: '$251.72' },
    { name: 'Iced Tea', orders: 56, revenue: '$223.44' },
  ];

  const recentOrders = [
    { id: 1008, table: 'T2', amount: '$45.99', time: '11:30 AM', status: 'completed' },
    { id: 1007, table: 'T3', amount: '$123.50', time: '11:15 AM', status: 'completed' },
    { id: 1006, table: 'T7', amount: '$78.25', time: '11:00 AM', status: 'completed' },
    { id: 1005, table: 'T1', amount: '$32.98', time: '10:45 AM', status: 'completed' },
  ];

  return (
    <div className="space-y-6 lg:mt-[5%]">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-gray-600 mt-1">View restaurant performance and insights</p>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg capitalize transition-all ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <span
                className={`text-xs font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Items */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h3>
          <div className="space-y-3">
            {topItems.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.orders} orders</p>
                  </div>
                </div>
                <span className="font-semibold text-blue-600">{item.revenue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">Order #{order.id}</p>
                  <p className="text-sm text-gray-500">
                    Table {order.table} • {order.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{order.amount}</p>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Sales Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Sales</h3>
        <div className="h-64 flex items-end justify-between gap-2 px-4">
          {[35, 45, 60, 55, 80, 95, 70, 65, 85, 90, 75, 60].map((value, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-blue-600 rounded-t-sm transition-all hover:bg-blue-700"
                style={{ height: `${value}%` }}
              ></div>
              <span className="text-xs text-gray-500 mt-2">{index + 9}</span>
            </div>
          ))}
        </div>
        <div className="text-center mt-2 text-sm text-gray-500">Hours (9 AM - 8 PM)</div>
      </div>
    </div>
  );
};

export default Reports;
