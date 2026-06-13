import React from 'react';
import { Link } from 'react-router-dom';

const Checkout: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-charcoal">Checkout</h1>
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-charcoal">Please add items to your cart first</p>
        <Link to="/products" className="text-royal-blue hover:underline mt-2 inline-block">
          Browse Products
        </Link>
      </div>
    </div>
  );
};

export default Checkout;
