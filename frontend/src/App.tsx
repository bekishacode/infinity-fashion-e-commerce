import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import TrackOrder from './pages/TrackOrder';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import Dashboard from './pages/admin/Dashboard';
import ProductList from './pages/admin/Products/ProductList';
import ProductForm from './pages/admin/Products/ProductForm';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminProfile from './pages/admin/AdminProfile';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes with Navbar & Footer */}
        <Route path="/" element={
          <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main className="flex-grow">
              <Outlet />
            </main>
            <Footer />
          </div>
        }>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="track-order" element={<TrackOrder />} />
        </Route>

        {/* Admin Routes - No Navbar/Footer */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/create" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;