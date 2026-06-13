import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: number;
  last_login: string | null;
  created_at: string;
}

// Add this interface
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

const AdminList: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
    total_pages: 1
  });

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'admin'
  });
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    role: 'admin',
    is_active: true,
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAdmins = async (page = 1) => {
    setLoading(true);
    try {
      const result = await adminService.getAdmins({ page, search: search || undefined }) as ApiResponse<{ admins: AdminUser[]; pagination: any }>;
      if (result.success) {
        setAdmins(result.data.admins);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins(1);
  }, [search]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await adminService.createAdmin(formData);
      if (result.success) {
        alert('Admin created successfully');
        setShowCreateModal(false);
        setFormData({ username: '', email: '', password: '', full_name: '', role: 'admin' });
        fetchAdmins(pagination.current_page);
      } else {
        alert(result.message || 'Failed to create admin');
      }
    } catch (error) {
      alert('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    setSubmitting(true);
    try {
      const updateData: any = {
        full_name: editFormData.full_name,
        role: editFormData.role,
        is_active: editFormData.is_active
      };
      if (editFormData.password) {
        updateData.password = editFormData.password;
      }
      const result = await adminService.updateAdmin(selectedAdmin.id, updateData);
      if (result.success) {
        alert('Admin updated successfully');
        setShowEditModal(false);
        setSelectedAdmin(null);
        fetchAdmins(pagination.current_page);
      } else {
        alert(result.message || 'Failed to update admin');
      }
    } catch (error) {
      alert('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete admin "${name}"?`)) {
      try {
        const result = await adminService.deleteAdmin(id);
        if (result.success) {
          alert('Admin deleted successfully');
          fetchAdmins(pagination.current_page);
        } else {
          alert(result.message || 'Failed to delete admin');
        }
      } catch (error) {
        alert('Something went wrong');
      }
    }
  };

  const openEditModal = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setEditFormData({
      full_name: admin.full_name || '',
      role: admin.role,
      is_active: admin.is_active === 1,
      password: ''
    });
    setShowEditModal(true);
  };

  const getRoleBadge = (role: string) => {
    if (role === 'super_admin') return 'bg-purple-100 text-purple-800';
    if (role === 'admin') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading && admins.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-blue"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-gray-50 mt-10 -mx-6 px-6 pt-6 pb-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">Admin <span className="text-royal-blue">Management</span></h1>
            <p className="text-gray-500 text-sm">Manage system administrators and their permissions</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 text-gradient-secondary hover-lift px-4 py-2 rounded-lg hover:bg-royal-blue-dark transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Admin
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by username, email, or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue bg-white"
            />
          </div>
        </div>
      </div>

      {/* Scrollable Table Container */}
      <div className="flex-1 overflow-auto mt-4">
        <div className="bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    No admins found
                  </td>
                </tr>
              ) : (
                admins.map((admin, index) => {
                  const bgColor = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                  return (
                    <tr key={admin.id} className={`${bgColor} hover:bg-blue-50 transition`}>
                      <td className="px-6 py-4 text-sm text-gray-500">#{admin.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{admin.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{admin.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{admin.full_name || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadge(admin.role)}`}>
                          {admin.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {admin.is_active ? (
                          <span className="text-green-600 text-sm font-medium">Active</span>
                        ) : (
                          <span className="text-red-600 text-sm font-medium">Inactive</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {admin.last_login ? new Date(admin.last_login).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(admin)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAdmin(admin.id, admin.username)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
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
                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} admins
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchAdmins(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {pagination.current_page} of {pagination.total_pages}
                </span>
                <button
                  onClick={() => fetchAdmins(pagination.current_page + 1)}
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

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Create New Admin</h2>
            <form onSubmit={handleCreateAdmin}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Super Admin can only be created via database</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-royal-blue text-white rounded-lg hover:bg-royal-blue-dark disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Edit Admin</h2>
            <p className="text-sm text-gray-500 mb-4">Editing: {selectedAdmin.username}</p>
            <form onSubmit={handleUpdateAdmin}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editFormData.full_name}
                    onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editFormData.is_active}
                      onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">New Password (optional)</label>
                  <input
                    type="password"
                    value={editFormData.password}
                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                    placeholder="Leave blank to keep current password"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-royal-blue text-white rounded-lg hover:bg-royal-blue-dark disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminList;