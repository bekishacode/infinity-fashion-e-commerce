import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { LoadingProvider } from './context/LoadingContext';
import GlobalLoading from './components/common/GlobalLoading';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/client/Home';
import ProductDetail from './pages/client/ProductDetail';
import ProductsIndex from './pages/client/Products/ProductsIndex';
import CategoryProducts from './pages/client/Products/CategoryProducts';
import SubCategoryProducts from './pages/client/Products/SubCategoryProducts';
import Cart from './pages/client/Cart';
import Checkout from './pages/client/Checkout';
import TrackOrder from './pages/client/TrackOrder';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import Dashboard from './pages/admin/Dashboard';
import ProductList from './pages/admin/Products/ProductList';
import ProductForm from './pages/admin/Products/ProductForm';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminProfile from './pages/admin/AdminProfile';
import OrderList from './pages/admin/Orders/OrderList';
import OrderDetails from './pages/admin/Orders/OrderDetails';
import CustomerList from './pages/admin/Customers/CustomerList';
import CustomerDetails from './pages/admin/Customers/CustomerDetails';
import ForgotPassword from './pages/admin/ForgotPassword';
import AdminList from './pages/admin/AdminList';
import EmailSettings from './pages/admin/EmailSettings';
import EmailLayoutSettings from './pages/admin/EmailLayoutSettings';
import PicklistManagement from './pages/admin/PicklistManagement';
import SystemSettings from './pages/admin/SystemSettings';
import CategoryList from './pages/admin/Categories';
import CategoryContent from './pages/admin/Categories/CategoryContent';
import ReviewList from './pages/admin/Reviews/ReviewList';

function App() {
  return (
    <LoadingProvider>
      <Router>
        <GlobalLoading />
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
            <Route path="products" element={<ProductsIndex />} />
            <Route path="products/category/:categorySlug" element={<CategoryProducts />} />
            <Route path="products/category/:categorySlug/:subCategorySlug" element={<SubCategoryProducts />} />
            <Route path="products/product/:slug" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="track-order" element={<TrackOrder />} />
          </Route>

          {/* Admin Routes - No Navbar/Footer */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/create" element={<ProductForm />} />
            <Route path="products/edit/:id" element={<ProductForm />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="customers/:id" element={<CustomerDetails />} />
            <Route path="admins" element={<AdminList />} />
            <Route path="email-settings" element={<EmailSettings />} />
            <Route path="email-layout" element={<EmailLayoutSettings />} />
            <Route path="picklists" element={<PicklistManagement />} />
            <Route path="system" element={<SystemSettings />} />
            <Route path="categories" element={<CategoryList />} />
            <Route path="categories/:categoryId/content" element={<CategoryContent />} />
            <Route path="reviews" element={<ReviewList />} />
          </Route>
        </Routes>
      </Router>
    </LoadingProvider>
  );
}

export default App;