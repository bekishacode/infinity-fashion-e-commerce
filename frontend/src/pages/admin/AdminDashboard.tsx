import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import AdminNavbar from '../../components/admin/AdminNavbar';

const AdminDashboard: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin_info');
    if (storedAdmin) {
      const admin = JSON.parse(storedAdmin);
      setAdminRole(admin.role);
    }
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navItems = [
    { path: '/admin/dashboard', icon: '', label: 'Dashboard' },
    { path: '/admin/products', icon: '', label: 'Product Management' },
    { path: '/admin/orders', icon: '', label: 'Order Management' },
    { path: '/admin/customers', icon: '', label: 'Customers' },
    { path: '/admin/reviews', icon: '', label: 'Reviews' },
  ];

  // Only show Admins menu for super_admin
  const allNavItems = adminRole === 'super_admin' 
    ? [...navItems, 
       { path: '/admin/admins', icon: '', label: 'Admin Management' },
       { path: '/admin/email-settings', icon: '', label: 'Email Settings' },
       { path: '/admin/picklists', icon: '', label: 'Picklist Management' },
       { path: '/admin/categories', icon: '', label: 'Categories' },
       { path: '/admin/system', icon: '', label: 'System Settings' }
      ]
    : navItems;

  return (
    <div className="min-h-screen h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 shadow-xl flex-shrink-0">
        {/* Logo in Sidebar */}
        <div className="flex items-center justify-center h-16 border-b border-white/20 flex-shrink-0">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-12 h-12 bg-white p-0.5 flex items-center justify-center">
              <img src="/images/icon.png" alt="Img" className="w-full h-full object-cover" />
            </div>
            <div className='h-12'>
              <h1 className="text-white font-bold text-lg">Style Badge</h1>
              <p className="text-white/100 text-xs">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {allNavItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-white bg-green font-bold'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                  {isActive(item.path) && (
                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-gradient-to-b from-royal-blue to-royal-blue-dark shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">SB</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Style Badge</h1>
              <p className="text-white/60 text-xs">Admin Panel</p>
            </div>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10 transition"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4 overflow-y-auto">
          <ul className="space-y-1">
            {allNavItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-white shadow-md hover:bg-gray-50 transition"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <AdminNavbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;