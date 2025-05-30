import React, { useState, useEffect } from 'react';
import { getAllProvidersAdmin, updateProviderApproval } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Search, Filter, Users, CheckCircle, XCircle, Clock, Eye, MoreVertical, TrendingUp } from 'lucide-react';

const AdminProviders = () => {
  const { token } = useAuth();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, blocked: 0 });
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1
  });

  useEffect(() => {
    fetchProviders();
  }, [filters]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await getAllProvidersAdmin(token, filters);
      setProviders(response.providers || []);
      setStats(response.stats || { total: 0, approved: 0, pending: 0, blocked: 0 });
    } catch (error) {
      toast.error('Failed to fetch providers');
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (providerId, status) => {
    try {
      await updateProviderApproval(token, providerId, status === 'approve');
      toast.success(`Provider ${status}d successfully`);
      fetchProviders();
    } catch (error) {
      toast.error(`Failed to ${status} provider`);
      console.error(`Error ${status}ing provider:`, error);
    }
  };

  const getStatusBadge = (provider) => {
    if (!provider.isActive) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Blocked
        </span>
      );
    }
    if (provider.isApproved) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </span>
    );
  };

  const StatCard = ({ title, value, icon: Icon, gradient, textColor }) => (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white ${gradient} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold ${textColor || 'text-white'} mt-1`}>{value}</p>
        </div>
        <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Provider Management</h1>
                <p className="text-indigo-100 text-lg">Manage and oversee healthcare providers</p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-indigo-200 to-purple-200"></div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Providers"
            value={stats.total}
            icon={Users}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            icon={CheckCircle}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          />
          <StatCard
            title="Blocked"
            value={stats.blocked}
            icon={XCircle}
            gradient="bg-gradient-to-br from-red-500 to-rose-600"
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search providers..."
                  className="pl-10 pr-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 w-full lg:w-80"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  className="pl-10 pr-8 py-3 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                >
                  <option value="">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Providers Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No providers found</h3>
            <p className="text-gray-500">No providers match your current filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <div key={provider._id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                {/* Card Header with Gradient */}
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-100 transition-colors">
                          {provider.providerName}
                        </h3>
                        <p className="text-indigo-100 text-sm">{provider.practiceName}</p>
                      </div>
                      <div className="ml-4">
                        {getStatusBadge(provider)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                      <span className="text-sm">{provider.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                      <span className="text-sm">NPI: {provider.npiNumber}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-pink-400 rounded-full mr-3"></div>
                      <span className="text-sm">{provider.city}, {provider.state}</span>
                    </div>
                    {provider.specialties?.length > 0 && (
                      <div className="flex items-start text-gray-600">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3 mt-2"></div>
                        <div className="flex flex-wrap gap-1">
                          {provider.specialties.slice(0, 2).map((specialty, index) => (
                            <span key={index} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                              {specialty}
                            </span>
                          ))}
                          {provider.specialties.length > 2 && (
                            <span className="text-xs text-gray-500">+{provider.specialties.length - 2} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {!provider.isApproved && provider.isActive && (
                      <button
                        onClick={() => handleStatusUpdate(provider._id, 'approve')}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2.5 px-4 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        Approve
                      </button>
                    )}
                    
                    {provider.isActive && (
                      <button
                        onClick={() => handleStatusUpdate(provider._id, 'block')}
                        className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white py-2.5 px-4 rounded-xl font-medium hover:from-red-600 hover:to-rose-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <XCircle className="w-4 h-4 inline mr-2" />
                        Block
                      </button>
                    )}

                    {!provider.isActive && (
                      <button
                        onClick={() => handleStatusUpdate(provider._id, 'pending')}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-2.5 px-4 rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <Clock className="w-4 h-4 inline mr-2" />
                        Unblock
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Registered: {new Date(provider.createdAt).toLocaleDateString()}</span>
                    <button className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProviders;