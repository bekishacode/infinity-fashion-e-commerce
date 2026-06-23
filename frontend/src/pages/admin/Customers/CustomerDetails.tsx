import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminService } from '../../../services/adminService';

interface Order {
  id: number;
  order_number: string;
  total_amount: string;
  status: string;
  created_at: string;
}

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
  updated_at: string;
  orders: Order[];
}

// API interface
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

const CustomerDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [updating, setUpdating] = useState(false);
  const [adminInfo, setAdminInfo] = useState<any>(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin_info');
    if (storedAdmin) {
      setAdminInfo(JSON.parse(storedAdmin));
    }
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    setLoading(true);
    try {
      const result = await adminService.getCustomer(parseInt(id!)) as ApiResponse<Customer>;
      if (result.success) {
        setCustomer(result.data);
        setEditForm({
          name: result.data.name || '',
          phone: result.data.phone || '',
          email: result.data.email || '',
          address: result.data.address || ''
        });
      } else {
        alert('Customer not found');
        navigate('/admin/customers');
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      alert('Failed to load customer');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const result = await adminService.updateCustomer(parseInt(id!), editForm) as ApiResponse<any>;
      if (result.success) {
        alert('Customer updated successfully');
        setEditing(false);
        fetchCustomer();
      } else {
        alert(result.message || 'Failed to update customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Failed to update customer');
    } finally {
      setUpdating(false);
    }
  };

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

  const isSuperAdmin = adminInfo?.role === 'super_admin';

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-blue"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Customer not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-20">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-royal-blue">Customer Details</h1>
          <p className="text-gray-500 text-sm">View and manage customer information</p>
        </div>
        <button
          onClick={() => navigate('/admin/customers')}
          className="px-4 py-2 bg-royal-blue text-white rounded-lg hover:shadow-lg hover:bg-royal-blue-dark text-md font-medium"
        >
          ← Back to Customers
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6 hover-lift">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg text-royal-blue font-semibold">Customer Information</h2>
              {isSuperAdmin && !editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-royal-blue hover:text-royal-blue-dark text-sm font-medium"
                >
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number *</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea
                    rows={3}
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleUpdate}
                    disabled={updating}
                    className="px-4 py-2 bg-royal-blue text-white rounded-lg hover:bg-royal-blue-dark disabled:opacity-50"
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <p className="text-sm text-gray-800">Full Name</p>
                  <p className="col-span-2 font-medium text-green">{customer.name || '—'}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <p className="text-sm text-gray-800">Phone Number</p>
                  <p className="col-span-2 font-medium text-charcoal">{customer.phone}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <p className="text-sm text-gray-800">Email</p>
                  <p className="col-span-2 font-medium text-royal-blue">{customer.email || '—'}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <p className="text-sm text-gray-800">Address</p>
                  <p className="col-span-2 font-medium text-gray-500">{customer.address || '—'}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                  <p className="text-sm text-gray-800">Total Orders</p>
                  <p className="col-span-2 font-semibold">{customer.total_orders}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <p className="text-sm text-gray-800">Total Spent</p>
                  <p className="col-span-2 font-semibold text-royal-blue">
                    ETB {parseFloat(customer.total_spent).toLocaleString()}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <p className="text-sm text-gray-800">Customer Since</p>
                  <p className="col-span-2">{new Date(customer.created_at).toLocaleDateString()}</p>
                </div>
                {customer.last_order_at && (
                  <div className="grid grid-cols-3 gap-2">
                    <p className="text-sm text-gray-800">Last Order</p>
                    <p className="col-span-2">{new Date(customer.last_order_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg text-royal-blue font-semibold mb-4">Recent Orders</h2>
            {customer.orders.length === 0 ? (
              <p className="text-gray-400 text-sm">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {customer.orders.slice(0, 10).map((order) => (
                  <Link
                    key={order.id}
                    to={`/admin/orders/${order.id}`}
                    className="block border-b pb-3 last:border-0 hover:bg-gray-50 transition p-2 rounded"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-mono text-gray-600">{order.order_number}</p>
                        <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-royal-blue">ETB {parseFloat(order.total_amount).toLocaleString()}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${getStatusBadge(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
                {customer.orders.length > 10 && (
                  <p className="text-xs text-gray-400 text-center pt-2">+ {customer.orders.length - 10} more orders</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;