import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createPromoCode, getPromoCodes } from '../services/api';
import Navbar from '../components/common/Navbar';

const AdminPromoCodes = () => {
  const { token, user } = useAuth();
  const [promoCode, setPromoCode] = useState({ code: '', discountPercentage: '', expiresAt: '' });
  const [promoCodes, setPromoCodes] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const response = await getPromoCodes(token);
      console.log('Fetched promo codes:', response.promoCodes); // Debug log
      setPromoCodes(response.promoCodes);
    } catch (err) {
      setError('Failed to fetch promo codes');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPromoCode((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPromoCode(token, { ...promoCode, expiresAt: promoCode.expiresAt || null });
      setPromoCode({ code: '', discountPercentage: '', expiresAt: '' });
      fetchPromoCodes();
      setSuccess('Promo code created successfully');
      setTimeout(() => setSuccess(''), 3000);
      setError('');
    } catch (err) {
      setError('Failed to create promo code');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Helper function to format date safely
  const formatDate = (dateString) => {
    if (!dateString) return 'No expiry';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left sidebar */}
      <div className="fixed left-0 top-0 w-64 h-full bg-gradient-to-b from-indigo-900 to-indigo-800 text-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center mb-8">
            <img src="/logo.svg" alt="Elite Healthspan" className="h-8 mr-2" />
            <h1 className="text-xl font-bold">ELITE HEALTHSPAN</h1>
          </div>
          
          <div className="space-y-4">
            <div className="bg-indigo-700 p-3 rounded-lg font-medium">
              Manage Promo Codes
            </div>
            <div className="p-3 opacity-80 hover:opacity-100 transition-opacity">
              <a href="#" className="flex items-center">
                <span>Logout</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64 flex-1">
        <header className="bg-white shadow-sm">
          <div className="flex justify-between items-center px-8 py-4">
            <h1 className="text-2xl font-bold text-indigo-900">Manage Promo Codes</h1>
            <div className="text-gray-600 font-medium">
              Our Approach
            </div>
          </div>
        </header>

        <main className="p-8">
          {/* Create Promo Code Form */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Promo Code</label>
                    <input
                      type="text"
                      name="code"
                      value={promoCode.code}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Enter promo code"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Discount (%)</label>
                    <input
                      type="number"
                      name="discountPercentage"
                      value={promoCode.discountPercentage}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Enter discount percentage"
                      min="1"
                      max="100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Expiry Date</label>
                    <input
                      type="date"
                      name="expiresAt"
                      value={promoCode.expiresAt}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-900 text-white font-medium rounded-lg hover:bg-indigo-800 transition-colors focus:ring-4 focus:ring-indigo-300"
                  >
                    Create Promo Code
                  </button>
                </div>
              </form>
              
              {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
                  {success}
                </div>
              )}
            </div>
          </div>

          {/* Existing Promo Codes */}
          <div>
            <h2 className="text-xl font-bold text-indigo-900 mb-6">Existing Promo Codes</h2>
            
            {promoCodes.length === 0 ? (
              <div className="bg-white p-8 rounded-xl shadow-md text-center text-gray-500">
                No promo codes available. Create your first one!
              </div>
            ) : (
              <div className="overflow-hidden shadow-md rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Promo Code
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount (%)
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expiry Date
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {promoCodes.map((pc) => (
                      <tr key={pc._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-indigo-900 font-medium">
                          {pc.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {pc.discountPercentage}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatDate(pc.expiresAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            pc.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {pc.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPromoCodes;