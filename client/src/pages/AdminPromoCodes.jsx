import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createPromoCode, getPromoCodes } from '../services/api';
import { Calendar, Percent, Plus, Tag, AlertCircle, CheckCircle } from 'lucide-react';

const AdminPromoCodes = () => {
  const { token } = useAuth();
  const [promoCode, setPromoCode] = useState({ code: '', discountPercentage: '', expiryDate: '' });
  const [promoCodes, setPromoCodes] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const response = await getPromoCodes(token);
      setPromoCodes(response.promoCodes || []);
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
    setIsCreating(true);
    try {
      await createPromoCode(token, { ...promoCode, expiryDate: promoCode.expiryDate || null });
      setPromoCode({ code: '', discountPercentage: '', expiryDate: '' });
      fetchPromoCodes();
      setSuccess('Promo code created successfully');
      setTimeout(() => setSuccess(''), 3000);
      setError('');
      setShowForm(false);
    } catch (err) {
      setError('Failed to create promo code');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No expiry';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl md:text-2xl font-bold text-indigo-900 ml-8 md:ml-0">
                Promo Codes Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 border border-transparent text-sm md:text-base font-medium rounded-md shadow-sm text-white bg-indigo-800 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
              >
                <Plus className="h-4 w-4 mr-2" /> 
                {showForm ? "Cancel" : "New Promo Code"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 flex items-center p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 flex items-center p-4 bg-green-50 border-l-4 border-green-500 rounded-md">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-100 transform transition-all">
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Create New Promo Code
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center text-gray-700 font-medium text-sm">
                      <Tag className="h-4 w-4 mr-2 text-indigo-600" />
                      Promo Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={promoCode.code}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
                      placeholder="e.g. SUMMER2025"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-gray-700 font-medium text-sm">
                      <Percent className="h-4 w-4 mr-2 text-indigo-600" />
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      name="discountPercentage"
                      value={promoCode.discountPercentage}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
                      placeholder="e.g. 15"
                      min="1"
                      max="100"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-gray-700 font-medium text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-indigo-600" />
                      Expiry Date (Optional)
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={promoCode.expiryDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className={`px-6 py-3 bg-indigo-800 text-white font-medium rounded-lg shadow-md transition-all focus:ring-4 focus:ring-indigo-300 ${!isCreating ? 'hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5' : 'opacity-75 cursor-not-allowed'}`}
                  >
                    {isCreating ? 'Creating...' : 'Create Promo Code'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">
              Active Promo Codes
            </h2>
          </div>
          
          {promoCodes.length === 0 ? (
            <div className="p-8 text-center">
              <div className="bg-indigo-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <Tag className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No promo codes available</h3>
              <p className="text-gray-500 mb-4">Create your first promo code to start offering discounts</p>
              {!showForm && (
                <button 
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-4 w-4 mr-2" /> Create First Promo Code
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {promoCodes.map((pc) => (
                    <tr key={pc._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-indigo-100 rounded-md">
                            <Tag className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-indigo-900">{pc.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-semibold">{pc.discountPercentage}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(pc.expiresAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pc.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
  );
};

export default AdminPromoCodes;