import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const result = await adminService.getProducts({ limit: 1 });
      if (result.success) {
        setStats({
          totalProducts: result.data.pagination.total,
          activeProducts: result.data.products.filter((p: any) => p.is_active).length
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal mt-12 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl mb-2">📦</div>
          <div className="text-2xl font-bold">{stats.totalProducts}</div>
          <div className="text-gray-500">Total Products</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold">{stats.activeProducts}</div>
          <div className="text-gray-500">Active Products</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-2xl font-bold">0</div>
          <div className="text-gray-500">Pending Orders</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;