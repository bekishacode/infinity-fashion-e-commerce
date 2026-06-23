import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import SkeletonLoader from '../../../components/common/SkeletonLoader';

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  total_orders: number;
  total_spent: string;
  last_order_at: string | null;
  created_at: string;
}
// API interface
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
    total_pages: 1
  });

  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    try {
      const result = await adminService.getCustomers({ 
        page, 
        search: search || undefined,
        sort_by: sortBy,
        sort_order: sortOrder.toLowerCase()
      }) as ApiResponse<{ customers: Customer[]; pagination: any }>;
      
      if (result.success) {
        setCustomers(result.data.customers);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(1);
  }, [search, sortBy, sortOrder]);

  if (loading && customers.length === 0) {
    return <SkeletonLoader type="table" rows={16} columns={8} />;
  }

  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('DESC');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return '↕️';
    return sortOrder === 'ASC' ? '↑' : '↓';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header - Stays at top */}
      <div className="flex-shrink-0 mt-16 mx-0 px-6 pt-6 pb-4 border-b border-gray-200">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-royal-blue">Customer Management</h1>
          <p className="text-gray-500 text-md mt-1">View and manage all registered customers. Track their order history and contact information.</p>
        </div>

        {/* Search */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue bg-white"
            />
          </div>
        </div>
      </div>

      {/* Scrollable Table Container */}
      <div className="flex-1 overflow-auto mt-8">
        <div className="bg-white rounded-lg shadow">
          <table className="w-full">
            {/* Fixed Table Header - stays when scrolling */}
            <thead className="bg-green-light sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange uppercase cursor-pointer hover:text-gray-700" onClick={() => toggleSort('id')}>
                  ID {getSortIcon('id')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700" onClick={() => toggleSort('name')}>
                  Customer {getSortIcon('name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-magenta uppercase cursor-pointer hover:text-gray-700" onClick={() => toggleSort('total_orders')}>
                  Orders {getSortIcon('total_orders')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700" onClick={() => toggleSort('total_spent')}>
                  Total Spent {getSortIcon('total_spent')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange uppercase cursor-pointer hover:text-gray-700" onClick={() => toggleSort('last_order_at')}>
                  Last Order {getSortIcon('last_order_at')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700" onClick={() => toggleSort('created_at')}>
                  Joined {getSortIcon('created_at')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-magenta uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                    No customers found
                  </td>
                </tr>
              ) : (
                customers.map((customer, index) => {
                  const bgColor = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                  return (
                    <tr key={customer.id} className={`${bgColor} hover:bg-blue-50 transition duration-150`}>
                      <td className="px-6 py-4 text-sm text-gray-500">#{customer.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{customer.name || '—'}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{customer.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{customer.email || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{customer.total_orders}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-royal-blue">
                        ETB {parseFloat(customer.total_spent).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {customer.last_order_at ? new Date(customer.last_order_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          to={`/admin/customers/${customer.id}`}
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
                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} customers
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchCustomers(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {pagination.current_page} of {pagination.total_pages}
                </span>
                <button
                  onClick={() => fetchCustomers(pagination.current_page + 1)}
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

export default CustomerList;