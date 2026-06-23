import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { 
  ShoppingBag, 
  Users, 
  Package, 
  DollarSign,
  Clock,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  CreditCard,
  Star,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface DashboardData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    averageOrderValue: number;
    avgProcessingHours: number;
  };
  salesByDay: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  salesByHour: Array<{
    hour: number;
    orders: number;
    revenue: number;
  }>;
  salesByServiceType: Array<{
    service_type: string;
    count: number;
    revenue: number;
  }>;
  orderStatusDistribution: Array<{
    status: string;
    count: number;
  }>;
  recentOrders: Array<{
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
  topProducts: Array<{
    id: number;
    name: string;
    total_sold: number;
    revenue: number;
  }>;
  topCustomers: Array<{
    id: number;
    name: string;
    email: string;
    phone: string;
    total_orders: number;
    total_spent: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    orders: number;
    revenue: number;
  }>;
  hourlyDistribution: Array<{
    hour: number;
    orders: number;
  }>;
  period: string;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('today');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getDashboardStats(selectedPeriod);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError('Error loading dashboard. Please try again.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'confirmed': return <CheckCircle className="w-3 h-3" />;
      case 'processing': return <Truck className="w-3 h-3" />;
      case 'shipped': return <Truck className="w-3 h-3" />;
      case 'delivered': return <CheckCircle className="w-3 h-3" />;
      case 'cancelled': return <XCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-royal-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">⚠️ {error}</div>
        <button 
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-royal-blue text-white rounded-lg hover:bg-royal-blue-dark"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  // Chart data configurations - supports both daily and hourly views
  const salesChartData = data.period === 'today' && data.salesByHour?.length > 0 ? {
    labels: data.salesByHour.map(item => {
      const hour = item.hour;
      return `${hour}:00 - ${hour + 1}:00`;
    }),
    datasets: [
      {
        label: 'Revenue (ETB)',
        data: data.salesByHour.map(item => item.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Orders',
        data: data.salesByHour.map(item => item.orders),
        borderColor: 'rgb(236, 45, 123)',
        backgroundColor: 'rgba(236, 45, 123, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  } : {
    labels: data.salesByDay.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Revenue (ETB)',
        data: data.salesByDay.map(item => item.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Orders',
        data: data.salesByDay.map(item => item.orders),
        borderColor: 'rgb(236, 45, 123)',
        backgroundColor: 'rgba(236, 45, 123, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  const salesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { position: 'top' as const },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            let value = context.parsed.y;
            if (context.dataset.label === 'Revenue (ETB)') {
              return `${label}: ETB ${value.toLocaleString()}`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        title: { display: true, text: 'Revenue (ETB)' },
        beginAtZero: true,
      },
      y1: {
        position: 'right' as const,
        title: { display: true, text: 'Orders' },
        beginAtZero: true,
        grid: { drawOnChartArea: false },
      },
    },
  };

  const serviceTypeData = {
    labels: data.salesByServiceType.map(item => 
      item.service_type.charAt(0).toUpperCase() + item.service_type.slice(1)
    ),
    datasets: [{
      data: data.salesByServiceType.map(item => item.revenue),
      backgroundColor: [
        '#273B89',
        '#ED5925',
        '#0B9647',
      ],
      borderWidth: 0,
    }],
  };

  const statusData = {
    labels: data.orderStatusDistribution.map(item => item.status),
    datasets: [{
      data: data.orderStatusDistribution.map(item => item.count),
      backgroundColor: [
        '#ED5925',
        '#273B89',
        'rgba(139, 92, 246, 0.8)',
        '#0B9647',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderWidth: 0,
    }],
  };

  const hourlyData = {
    labels: data.hourlyDistribution.map(h => `${h.hour}:00`),
    datasets: [{
      label: 'Orders',
      data: data.hourlyDistribution.map(h => h.orders),
      backgroundColor: '#273B89',
      borderRadius: 8,
    }]
  };

  const monthlyTrendsData = {
    labels: data.monthlyTrends.map(m => {
      const [year, month] = m.month.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }),
    datasets: [
      {
        label: 'Revenue (ETB)',
        data: data.monthlyTrends.map(m => m.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
      {
        label: 'Orders',
        data: data.monthlyTrends.map(m => m.orders),
        borderColor: 'rgb(236, 45, 123)',
        backgroundColor: 'rgba(236, 45, 123, 0.1)',
        fill: true,
      }
    ]
  };

  return (
    <div className="space-y-6 mt-20">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-royal-blue">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['today', 'week', 'month', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                  selectedPeriod === period
                    ? 'text-white bg-green shadow'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
          <button 
            onClick={fetchDashboardData}
            className="p-2 text-gray-500 hover:text-gray-700 transition"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-charcoal">
            ETB {data.summary.totalRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Revenue</div>
          <div className="text-xs text-gray-400 mt-2">
            Avg. Order: ETB {data.summary.averageOrderValue.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-charcoal">{data.summary.totalOrders}</div>
          <div className="text-sm text-gray-500 mt-1">Total Orders</div>
          <div className="text-xs text-gray-400 mt-2">
            Completed: {data.summary.completedOrders}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-charcoal">{data.summary.totalCustomers}</div>
          <div className="text-sm text-gray-500 mt-1">Total Customers</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-charcoal">{data.summary.pendingOrders}</div>
          <div className="text-sm text-gray-500 mt-1">Pending Orders</div>
          <div className="text-xs text-gray-400 mt-2">
            Cancelled: {data.summary.cancelledOrders}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-charcoal">
              {selectedPeriod === 'today' ? 'Today\'s Sales (Hourly)' : 'Sales Overview'}
            </h3>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-500">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span className="text-gray-500">Orders</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <Line data={salesChartData} options={salesChartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-charcoal mb-6">Sales by Service Type</h3>
          <div className="h-60">
            <Doughnut data={serviceTypeData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
          <div className="mt-4 space-y-2">
            {data.salesByServiceType.map((item) => (
              <div key={item.service_type} className="flex justify-between text-sm">
                <span className="text-gray-600 capitalize">{item.service_type}</span>
                <span className="font-semibold">ETB {item.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Distribution & Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-charcoal mb-6">Orders by Hour (Last 30 Days)</h3>
          <div className="h-64">
            <Bar 
              data={hourlyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-charcoal mb-6">Monthly Trends</h3>
          <div className="h-64">
            <Line 
              data={monthlyTrendsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-charcoal">Recent Orders</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {data.recentOrders.map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-charcoal">{order.order_number}</div>
                    <div className="text-sm text-gray-500">{order.customer_name}</div>
                    <div className="text-xs text-gray-400">{order.customer_email}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-charcoal">ETB {order.total_amount.toLocaleString()}</div>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-charcoal">Top Products</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {data.topProducts.map((product) => (
              <div key={product.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-charcoal">{product.name}</div>
                    <div className="text-sm text-gray-500">Sold: {product.total_sold} units</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-charcoal">ETB {product.revenue.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Customers & Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-charcoal">Top Customers</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {data.topCustomers.map((customer, idx) => (
              <div key={customer.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-royal-blue to-magenta flex items-center justify-center text-white font-semibold">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-medium text-charcoal">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                      <div className="text-xs text-gray-400">{customer.phone}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-charcoal">{customer.total_orders} orders</div>
                    <div className="text-sm text-royal-blue">ETB {parseFloat(customer.total_spent as any).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-charcoal mb-6">Order Status Distribution</h3>
          <div className="h-64">
            <Bar 
              data={statusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' as const } }
              }}
            />
          </div>
        </div>
      </div>

      {/* Processing Metrics Card */}
      <div className="bg-orange rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold opacity-90">Average Order Processing Time</h3>
            <p className="text-3xl font-bold mt-2">{data.summary.avgProcessingHours} hours</p>
            <p className="text-sm opacity-80 mt-1">From order placement to delivery</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{data.summary.completedOrders}</div>
            <p className="text-sm opacity-80">Completed Orders</p>
            <div className="text-2xl font-bold mt-2">{data.summary.cancelledOrders}</div>
            <p className="text-sm opacity-80">Cancelled Orders</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;