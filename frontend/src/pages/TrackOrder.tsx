import React from 'react';

const TrackOrder: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Order tracking will be available when connected to backend');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-charcoal">Track Your Order</h1>
      <div className="bg-white rounded-lg shadow-md p-8">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="label">Tracking Number</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Enter your tracking number"
            />
          </div>
          <div className="mb-6">
            <label className="label">Phone Number</label>
            <input 
              type="tel" 
              className="input" 
              placeholder="Phone number used when ordering"
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Check Status
          </button>
        </form>
        <div className="mt-4 p-3 bg-royal-blue bg-opacity-10 rounded text-sm text-royal-blue">
          Demo: Try "TRK-12345" with any phone number
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
