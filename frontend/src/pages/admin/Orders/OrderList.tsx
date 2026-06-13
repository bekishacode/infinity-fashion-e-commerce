import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../../services/adminService';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  total_amount: string;
  service_type: string;
  status: string;
  created_at: string;
}

// API interface
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
} 

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
    total_pages: 1
  });

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const result = await adminService.getOrders({ 
        page, 
        search: search || undefined,
        status: statusFilter || undefined
      }) as ApiResponse<{ orders: Order[]; pagination: any }>;
      
      if (result.success && result.data) {
        setOrders(result.data.orders);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [search, statusFilter]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return texts[status] || status;
  };

  const getServiceTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      retail: 'bg-green-100 text-green-800',
      wholesale: 'bg-blue-100 text-blue-800',
      pod: 'bg-purple-100 text-purple-800'
    };
    return styles[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-blue"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header - Sticky at top */}
      <div className="flex-shrink-0 bg-gray-50 mt-10 -mx-6 px-6 pt-6 pb-4 border-b border-gray-200">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-orange">Customer <span className='text-royal-blue'>Orders</span></h1>
          <p className="text-gray-500 text-md mt-1">Manage your customer orders</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by order number, name, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue bg-white"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Scrollable Table Container */}
      <div className="flex-1 overflow-auto mt-4 rounded-xl">
        <div className="bg-white rounded-lg shadow">
          <table className="w-full">
            {/* Fixed Table Header - stays when scrolling */}
            <thead className="bg-green-light sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-magenta uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-magenta uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => {
                  const bgColor = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                  return (
                    <tr key={order.id} className={`${bgColor} hover:bg-blue-50 transition duration-150`}>
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">
                        {order.order_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.customer_name}
                        {order.customer_email && (
                          <div className="text-xs text-gray-500">{order.customer_email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {order.customer_phone}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-royal-blue">
                        ETB {parseFloat(order.total_amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getServiceTypeBadge(order.service_type)}`}>
                          {order.service_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="text-royal-blue hover:text-royal-blue-dark font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex justify-between items-center px-6 py-3 border-t bg-gray-50">
              <div className="text-sm text-gray-500">
                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} orders
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchOrders(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {pagination.current_page} of {pagination.total_pages}
                </span>
                <button
                  onClick={() => fetchOrders(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.total_pages}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderList;