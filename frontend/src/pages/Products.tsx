import React, { useState } from 'react';

const Products: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const products = [
    { id: 1, name: 'Custom T-Shirt', price: 350, icon: '👕', category: 't-shirts' },
    { id: 2, name: 'Personalized Cap', price: 250, icon: '🧢', category: 'caps' },
    { id: 3, name: 'Custom Bag', price: 450, icon: '👜', category: 'bags' },
    { id: 4, name: 'Premium Hoodie', price: 650, icon: '👔', category: 'hoodies' },
  ];

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 't-shirts', label: 'T-Shirts' },
    { value: 'caps', label: 'Caps' },
    { value: 'bags', label: 'Bags' },
    { value: 'hoodies', label: 'Hoodies' },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-charcoal">Our Products</h1>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products..."
            className="input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="md:w-64">
          <select
            className="input"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-charcoal text-lg">No products found.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6 text-center">
              <div className="text-6xl mb-4">{product.icon}</div>
              <h3 className="font-semibold text-lg mb-2 text-charcoal">{product.name}</h3>
              <p className="text-royal-blue font-bold text-xl mb-4">ETB {product.price}</p>
              <button className="w-full bg-royal-blue text-white py-2 rounded-lg hover:bg-royal-blue-dark transition">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
