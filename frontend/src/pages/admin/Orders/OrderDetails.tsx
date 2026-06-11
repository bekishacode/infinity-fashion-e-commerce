import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/adminService';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string;
  product_name: string;
  product_price: string;
  quantity: number;
  total_amount: string;
  service_type: string;
  size: string | null;
  color: string | null;
  design_instructions: string | null;
  front_design_url: string | null;
  back_design_url: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  status_history: Array<{
    id: number;
    old_status: string | null;
    new_status: string;
    changed_by: string;
    created_at: string;
  }>;
  customer_order_history: Array<{
    id: number;
    order_number: string;
    total_amount: string;
    status: string;
    created_at: string;
  }>;
}

const OrderDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
    { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const result = await adminService.getOrder(parseInt(id!));
      if (result.success) {
        setOrder(result.data);
        setSelectedStatus(result.data.status);
      } else {
        alert('Order not found');
        navigate('/admin/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!order) return;
    
    const confirmed = window.confirm(`Change order status from ${order.status} to ${selectedStatus}?`);
    if (!confirmed) return;
    
    setUpdating(true);
    try {
      const result = await adminService.updateOrderStatus(order.id, selectedStatus);
      if (result.success) {
        alert(`Order status updated to ${selectedStatus}`);
        fetchOrder(); // Refresh order details
      } else {
        alert(result.message || 'Failed to update status');
        setSelectedStatus(order.status); // Reset on error
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
      setSelectedStatus(order.status);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.label || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-blue"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-14">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-orange">Order <span className='text-royal-blue'>Details</span></h1>
          <p className="text-gray-500 text-sm">Order #{order.order_number}</p>
        </div>
        <button
          onClick={() => navigate('/admin/orders')}
          className="px-4 py-2 border text-gradient-primary rounded-lg hover-lift"
        >
          ← Back to Orders
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Update Card */}
          <div className="bg-white rounded-lg shadow p-6 hover-lift">
            <h2 className="text-lg text-royal-blue font-semibold mb-4">Order Status</h2>
            <div className="flex items-center gap-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                disabled={updating}
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || selectedStatus === order.status}
                className="px-4 py-2 bg-royal-blue text-white rounded-lg hover:bg-royal-blue-dark disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
            <div className="mt-3">
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadge(order.status)}`}>
                Current: {getStatusText(order.status)}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6 hover-lift">
            <h2 className="text-lg text-green font-semibold mb-4">Order Items</h2>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium">Product</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Price</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Qty</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-4 py-3">
                      {order.product_name}
                      {(order.size || order.color) && (
                        <div className="text-xs text-gray-500">
                          {order.size && <span>Size: {order.size}</span>}
                          {order.color && <span> {order.color && order.size && '|'} Color: {order.color}</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">ETB {parseFloat(order.product_price).toLocaleString()}</td>
                    <td className="px-4 py-3">{order.quantity}</td>
                    <td className="px-4 py-3 font-semibold">ETB {parseFloat(order.total_amount).toLocaleString()}</td>
                  </tr>
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right font-semibold">Total:</td>
                    <td className="px-4 py-2 font-bold text-royal-blue">ETB {parseFloat(order.total_amount).toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* POD Design Info */}
            {(order.design_instructions || order.front_design_url || order.back_design_url) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Custom Design Details</h3>
                {order.design_instructions && (
                  <p className="text-sm text-gray-600 mb-2"><strong>Instructions:</strong> {order.design_instructions}</p>
                )}
                <div className="flex gap-3">
                  {order.front_design_url && (
                    <a href={`http://localhost:8000${order.front_design_url}`} target="_blank" rel="noopener noreferrer" className="text-sm text-royal-blue hover:underline">
                      View Front Design
                    </a>
                  )}
                  {order.back_design_url && (
                    <a href={`http://localhost:8000${order.back_design_url}`} target="_blank" rel="noopener noreferrer" className="text-sm text-royal-blue hover:underline">
                      View Back Design
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="mt-4">
                <h3 className="font-medium text-royal-blue mb-1">Order Notes</h3>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Status History */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 hover-lift">
              <h2 className="text-lg text-royal-blue font-semibold mb-4">Status History</h2>
              <div className="space-y-3">
                {order.status_history.map((history) => (
                  <div key={history.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-royal-blue"></div>
                    <div className="flex-1">
                      <p className="text-sm">
                        Status changed from <span className="font-medium">{history.old_status || 'Created'}</span> to <span className="font-medium">{history.new_status}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(history.created_at).toLocaleString()} by {history.changed_by}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Customer Info */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-gray-100 rounded-lg shadow p-6 hover-lift">
            <h2 className="text-lg text-orange-dark font-bold mb-4">Customer Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-charcoal">Name</p>
                <p className="font-medium text-royal-blue-dark">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-xs text-charcoal">Phone</p>
                <p className="font-medium text-royal-blue-dark">{order.customer_phone}</p>
              </div>
              {order.customer_email && (
                <div>
                  <p className="text-xs text-charcoal">Email</p>
                  <p className="font-medium text-royal-blue-dark">{order.customer_email}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-charcoal">Address</p>
                <p className="text-sm text-green">{order.customer_address}</p>
              </div>
            </div>
          </div>

          {/* Order History */}
          {order.customer_order_history && order.customer_order_history.length > 1 && (
            <div className="bg-white rounded-lg shadow p-6 hover-lift">
              <h2 className="text-lg font-semibold mb-4"><span className='text-green'>Customer Order</span> History</h2>
              <div className="space-y-3">
                {order.customer_order_history.filter(o => o.id !== order.id).map((histOrder) => (
                  <div key={histOrder.id} className="border-b pb-2 last:border-0">
                    <p className="text-sm font-mono">{histOrder.order_number}</p>
                    <p className="text-xs text-gray-500">{new Date(histOrder.created_at).toLocaleDateString()}</p>
                    <p className="text-sm">ETB {parseFloat(histOrder.total_amount).toLocaleString()}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${getStatusBadge(histOrder.status)}`}>
                      {getStatusText(histOrder.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;