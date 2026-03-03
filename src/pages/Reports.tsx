// ⚠️ MODIFY existing component - add new functionality
// Preserve all existing imports and code
import React, { useState, useEffect } from 'react';

// Interfaces for API Responses - Updated to match actual API response format
interface StatsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrder: string | number;
  activeCustomers: number;
  revenueChange: number;
  ordersChange: number;
  avgOrderChange: number;
  customersChange: number;
}

interface ReportStatsResponse {
  success: boolean;
  data: StatsData;
}

interface TopItemData {
  name: string;
  orders: number;
  revenue: string | number;
}

interface TopItemsResponse {
  success: boolean;
  data: TopItemData[];
}

interface RecentOrderData {
  id: number;
  table: string;
  amount: string | number;
  time: string;
  status: string;
}

interface RecentOrdersResponse {
  success: boolean;
  data: RecentOrderData[];
}

interface HourlySalesResponse {
  success: boolean;
  data: number[];
}

// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Authentication helper
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

// Helper function for authenticated API calls
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    if (response.status === 401) {
      console.error('Unauthorized access - redirecting to login');
    }
    throw new Error(`API call failed: ${response.statusText}`);
  }
  return response.json();
};

// UI State Types
interface StatItem {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}

// Helper to format currency
const formatCurrency = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `$${num.toFixed(2)}`;
};

// Helper to format change percentage
const formatChange = (value: number): { text: string; trend: 'up' | 'down' | 'neutral' } => {
  if (value === 0) {
    return { text: '0%', trend: 'neutral' };
  }
  const sign = value > 0 ? '+' : '';
  return { text: `${sign}${value}%`, trend: value > 0 ? 'up' : 'down' };
};

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const periods = ['today', 'week', 'month', 'year'];

  // State for API data
  const [stats, setStats] = useState<StatItem[]>([
    { label: 'Total Revenue', value: '$0.00', change: '0%', trend: 'neutral', icon: '💰' },
    { label: 'Total Orders', value: '0', change: '0%', trend: 'neutral', icon: '📝' },
    { label: 'Average Order', value: '$0.00', change: '0%', trend: 'neutral', icon: '📊' },
    { label: 'Active Customers', value: '0', change: '0%', trend: 'neutral', icon: '👥' },
  ]);
  
  const [topItems, setTopItems] = useState<TopItemData[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrderData[]>([]);
  const [hourlySales, setHourlySales] = useState<number[]>([]);

  // Fetch Data Effect
  useEffect(() => {
    const fetchReportsData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all endpoints in parallel
        const [statsRes, topItemsRes, recentOrdersRes, hourlySalesRes] = await Promise.all([
          fetchWithAuth(`${API_URL}/reports/stats?period=${selectedPeriod}`),
          fetchWithAuth(`${API_URL}/reports/top-items?period=${selectedPeriod}`),
          fetchWithAuth(`${API_URL}/reports/recent-orders?period=${selectedPeriod}`),
          fetchWithAuth(`${API_URL}/reports/hourly-sales?period=${selectedPeriod}`)
        ]);

        // Process Stats - Handle both wrapped and direct response formats
        const statsData = statsRes?.data || statsRes;
        if (statsData) {
          const revenueChange = formatChange(statsData.revenueChange ?? 0);
          const ordersChange = formatChange(statsData.ordersChange ?? 0);
          const avgOrderChange = formatChange(statsData.avgOrderChange ?? 0);
          const customersChange = formatChange(statsData.customersChange ?? 0);

          const newStats: StatItem[] = [
            {
              label: 'Total Revenue',
              value: formatCurrency(statsData.totalRevenue ?? 0),
              change: revenueChange.text,
              trend: revenueChange.trend,
              icon: '💰',
            },
            {
              label: 'Total Orders',
              value: String(statsData.totalOrders ?? 0),
              change: ordersChange.text,
              trend: ordersChange.trend,
              icon: '📝',
            },
            {
              label: 'Average Order',
              value: formatCurrency(statsData.averageOrder ?? 0),
              change: avgOrderChange.text,
              trend: avgOrderChange.trend,
              icon: '📊',
            },
            {
              label: 'Active Customers',
              value: String(statsData.activeCustomers ?? 0),
              change: customersChange.text,
              trend: customersChange.trend,
              icon: '👥',
            },
          ];
          setStats(newStats);
        }

        // Process Top Items - Handle both wrapped and direct response formats
        const topItemsData = topItemsRes?.data || topItemsRes;
        if (Array.isArray(topItemsData)) {
          setTopItems(topItemsData);
        } else if (topItemsRes?.success && Array.isArray(topItemsRes.data)) {
          setTopItems(topItemsRes.data);
        }

        // Process Recent Orders - Handle both wrapped and direct response formats
        const recentOrdersData = recentOrdersRes?.data || recentOrdersRes;
        if (Array.isArray(recentOrdersData)) {
          setRecentOrders(recentOrdersData);
        } else if (recentOrdersRes?.success && Array.isArray(recentOrdersRes.data)) {
          setRecentOrders(recentOrdersRes.data);
        }

        // Process Hourly Sales - Handle both wrapped and direct response formats
        const hourlySalesData = hourlySalesRes?.data || hourlySalesRes;
        if (Array.isArray(hourlySalesData)) {
          setHourlySales(hourlySalesData);
        } else if (hourlySalesRes?.success && Array.isArray(hourlySalesRes.data)) {
          setHourlySales(hourlySalesRes.data);
        }

      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load reports data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, [selectedPeriod]);

  // Calculate max hourly value for chart scaling
  const maxHourlyValue = Math.max(...hourlySales, 1);

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
              disabled={loading}
              className={`px-4 py-2 rounded-lg capitalize transition-all ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{stat.icon}</span>
                  <span
                    className={`text-xs font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 
                      stat.trend === 'down' ? 'text-red-600' : 
                      'text-gray-500'
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
              {topItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No data available for this period</p>
              ) : (
                <div className="space-y-3">
                  {topItems.map((item, index) => (
                    <div
                      key={index}
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
                      <span className="font-semibold text-blue-600">
                        {typeof item.revenue === 'number' ? formatCurrency(item.revenue) : item.revenue}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
              {recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent orders</p>
              ) : (
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
                        <p className="font-semibold text-gray-900">
                          {typeof order.amount === 'number' ? formatCurrency(order.amount) : order.amount}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          order.status === 'completed' ? 'text-green-600 bg-green-100' : 
                          order.status === 'pending' ? 'text-yellow-600 bg-yellow-100' :
                          'text-gray-600 bg-gray-100'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Hourly Sales Chart */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Sales</h3>
            {hourlySales.length === 0 ? (
              <p className="text-gray-500 text-center py-10">No hourly data available</p>
            ) : (
              <div className="h-64 flex items-end justify-between gap-1 px-4">
                {hourlySales.map((value, index) => {
                  const heightPercent = Math.max((value / maxHourlyValue) * 100, 2);
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 group">
                      <div className="relative w-full">
                        <div
                          className="w-full bg-blue-600 rounded-t-sm transition-all hover:bg-blue-700 cursor-pointer"
                          style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                          title={`$${value.toFixed(2)}`}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2">{index + 9}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {hourlySales.length > 0 && (
              <div className="text-center mt-2 text-sm text-gray-500">Hours (9 AM - 8 PM)</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
