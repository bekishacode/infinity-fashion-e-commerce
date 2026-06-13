import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, getImageUrl } from '../../services/adminService';

interface AdminInfo {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  profile_image?: string | null;
}

// API interface
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

const AdminProfile: React.FC = () => {
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [editing, setEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Auto-dismiss message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 2MB' });
      return;
    }

    setUploadingImage(true);
    setMessage(null);

    try {
      const result = await adminService.uploadProfileImage(file) as ApiResponse<{ image_url: string }>;
      if (result.success && result.data) {
        const updatedAdmin = { ...adminInfo!, profile_image: result.data.image_url };
        localStorage.setItem('admin_info', JSON.stringify(updatedAdmin));
        setAdminInfo(updatedAdmin);
        setMessage({ type: 'success', text: 'Profile image updated!' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to upload image' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

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
      if (formData.current_password && formData.new_password) {
        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
      }

      const result = await adminService.updateMyProfile(updateData) as ApiResponse<any>;
      if (result.success) {
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Use getImageUrl helper instead of hardcoded URL
  const getProfileImageUrl = () => {
    return getImageUrl(adminInfo?.profile_image);
  };

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

  if (!adminInfo) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const profileImage = getProfileImageUrl();

  return (
    <div>
      <div className="mb-6 mt-14">
        <h1 className="text-2xl font-bold text-charcoal">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">View and update your account information</p>
      </div>

      {/* Auto-dismissible Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm flex justify-between items-center ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-3 text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border max-w-2xl">
        {/* Profile Header with Image */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-6">
            {/* Profile Image */}
            <div className="relative">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={adminInfo.full_name || adminInfo.username}
                  className="w-24 h-24 rounded-full object-cover border-4 border-royal-blue"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=No+Image';
                  }}
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-r from-royal-blue to-magenta rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {getInitials(adminInfo.full_name || adminInfo.username)}
                </div>
              )}
              
              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute -bottom-2 -right-2 bg-royal-blue text-white rounded-full p-1.5 shadow-md hover:bg-royal-blue-dark transition disabled:opacity-50"
                title="Change profile picture"
              >
                {uploadingImage ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-charcoal">{adminInfo.full_name || adminInfo.username}</h2>
              <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${getRoleBadgeColor(adminInfo.role)}`}>
                {adminInfo.role?.replace('_', ' ').toUpperCase()}
              </span>
              <p className="text-sm text-gray-500 mt-1">{adminInfo.email}</p>
            </div>

            {!editing && (
              <div className="ml-auto">
                <button
                  onClick={() => setEditing(true)}
                  className="text-royal-blue hover:text-royal-blue-dark text-sm font-medium"
                >
                  Edit Profile
                </button>
              </div>
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
                placeholder="Your full name"
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
                  <label className="block text-sm font-medium mb-1">Current Password</label>
                  <input
                    type="password"
                    value={formData.current_password}
                    onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                    placeholder="Required to change password"
                  />
                </div>
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
            <div className="grid grid-cols-3 gap-2">
              <p className="text-sm text-gray-500">Username</p>
              <p className="col-span-2 font-medium">{adminInfo.username}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <p className="text-sm text-gray-500">Email</p>
              <p className="col-span-2 font-medium">{adminInfo.email}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="col-span-2 font-medium">{adminInfo.full_name || 'Not set'}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="col-span-2 font-medium capitalize">{adminInfo.role?.replace('_', ' ')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;