import React from 'react';
import { Link } from 'react-router-dom';

const Cart: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-charcoal">Shopping Cart</h1>
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <p className="text-charcoal text-lg">Your cart is empty</p>
        <Link to="/products" className="text-royal-blue hover:underline mt-4 inline-block">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default Cart;
