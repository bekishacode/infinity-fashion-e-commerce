import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface AdminInfo {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
}

const AdminNavbar: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin_info');
    if (storedAdmin) {
      setAdminInfo(JSON.parse(storedAdmin));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
    navigate('/admin/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="bg-royal-blue fixed top-0 right-0 left-64 z-30 h-16">
      <div className="flex justify-end items-center h-full px-6">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 hover-lift px-3 py-2 rounded-lg transition-all duration-200"
          >
            <div className="w-9 h-9 bg-gradient-to-r from-green to-magenta rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
              {adminInfo?.full_name ? getInitials(adminInfo.full_name) : 'A'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-white">
                {adminInfo?.full_name || 'Admin'}
              </p>
              <p className="text-xs text-white/70">
                {adminInfo?.role?.replace('_', ' ') || 'Admin'}
              </p>
            </div>
            <svg
              className={`w-4 h-4 text-white/70 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50" style={{ right: 'auto', left: 'auto', transform: 'translateX(calc(-35%))', minWidth: '300px' }}>
              {/* Profile Header */}
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-royal-blue to-magenta rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0">
                    {adminInfo?.full_name ? getInitials(adminInfo.full_name) : 'A'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-base">
                      {adminInfo?.full_name || 'Admin User'}
                    </p>
                    <p className="text-sm text-gray-500 break-all">
                      {adminInfo?.email || 'admin@stylebadge.com'}
                    </p>
                    <span className="inline-block mt-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-green">
                      {adminInfo?.role?.replace('_', ' ') || 'Admin'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <Link
                  to="/admin/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium hover:text-green">My Profile</span>
                </Link>
                
                <Link
                  to="/admin/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium hover:text-royal-blue">Settings</span>
                </Link>
              </div>

              {/* Logout Button */}
              <div className="border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 transition-colors duration-150"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <span className="text-red-600 font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;