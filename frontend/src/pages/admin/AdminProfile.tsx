import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminInfo {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
}

const AdminProfile: React.FC = () => {
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin_info');
    if (storedAdmin) {
      setAdminInfo(JSON.parse(storedAdmin));
    } else {
      navigate('/admin/login');
    }
  }, [navigate]);

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
        <p className="text-gray-500 text-sm mt-1">View your account information</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border max-w-2xl">
        <div className="p-6 border-b">
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
        </div>

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
      </div>
    </div>
  );
};

export default AdminProfile;