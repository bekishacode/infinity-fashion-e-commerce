import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';

interface AdminInfo {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
}

const AdminProfile: React.FC = () => {
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin_info');
    if (storedAdmin) {
      const admin = JSON.parse(storedAdmin);
      setAdminInfo(admin);
      setFormData(prev => ({ ...prev, full_name: admin.full_name || '' }));
    } else {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate passwords if changing
    if (formData.new_password && formData.new_password !== formData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (formData.new_password && formData.new_password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      setLoading(false);
      return;
    }

    try {
      const updateData: any = { full_name: formData.full_name };
      if (formData.new_password) {
        updateData.password = formData.new_password;
      }

      const result = await adminService.updateAdmin(adminInfo!.id, updateData);
      if (result.success) {
        // Update local storage
        const updatedAdmin = { ...adminInfo!, full_name: formData.full_name };
        localStorage.setItem('admin_info', JSON.stringify(updatedAdmin));
        setAdminInfo(updatedAdmin);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setEditing(false);
        setFormData(prev => ({ ...prev, current_password: '', new_password: '', confirm_password: '' }));
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  if (!adminInfo) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'editor':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-charcoal">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">View and update your account information</p>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border max-w-2xl">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-r from-royal-blue to-magenta rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {adminInfo.full_name?.charAt(0) || adminInfo.username.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-charcoal">{adminInfo.full_name || adminInfo.username}</h2>
                <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${getRoleBadgeColor(adminInfo.role)}`}>
                  {adminInfo.role?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-royal-blue hover:text-royal-blue-dark text-sm font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
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
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                value={adminInfo.username}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">Username cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={adminInfo.email}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Change Password (Optional)</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <input
                    type="password"
                    value={formData.new_password}
                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                    placeholder="Leave blank to keep current"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                    placeholder="Confirm your new password"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-royal-blue text-white rounded-lg hover:bg-royal-blue-dark disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    full_name: adminInfo.full_name || '',
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                  });
                  setMessage(null);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm text-gray-500">Username</label>
              <p className="font-medium">{adminInfo.username}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="font-medium">{adminInfo.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Full Name</label>
              <p className="font-medium">{adminInfo.full_name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Account Type</label>
              <p className="font-medium capitalize">{adminInfo.role?.replace('_', ' ')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;