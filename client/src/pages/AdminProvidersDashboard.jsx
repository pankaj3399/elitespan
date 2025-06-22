// src/pages/AdminProviders.js

import React, { useState, useEffect } from 'react';
import { getAllProvidersAdmin, updateProviderApproval } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  Search,
  Filter,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  BriefcaseMedical,
} from 'lucide-react';
import ProviderDetailModal from '../components/ProviderDetailModal';

const StatusBadge = ({ provider }) => {
  if (!provider.isActive) {
    return (
      <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200'>
        <XCircle className='w-3.5 h-3.5 mr-1.5' />
        Blocked
      </span>
    );
  }
  if (provider.isApproved) {
    return (
      <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200'>
        <CheckCircle className='w-3.5 h-3.5 mr-1.5' />
        Approved
      </span>
    );
  }
  return (
    <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200'>
      <Clock className='w-3.5 h-3.5 mr-1.5' />
      Pending
    </span>
  );
};
const StatCard = ({ title, value, icon: Icon, gradient, textColor }) => (
  <div
    className={`relative overflow-hidden rounded-xl p-5 ${gradient} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer`}
  >
    <div className='flex items-center justify-between'>
      <div>
        <p className={`text-sm font-medium ${textColor}/80`}>{title}</p>
        <p className={`text-3xl font-bold ${textColor} mt-1`}>{value}</p>
      </div>
      <div className='p-3 bg-white/30 rounded-full'>
        <Icon className={`w-6 h-6 ${textColor}`} />
      </div>
    </div>
  </div>
);

const AdminProviders = () => {
  const { token } = useAuth();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    blocked: 0,
  });
  const [filters, setFilters] = useState({ status: '', search: '', page: 1 });

  // --- ** ADD THIS STATE FOR MODAL CONTROL ** ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    fetchProviders();
  }, [filters, token]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await getAllProvidersAdmin(token, filters);
      setProviders(response.providers || []);
      setStats(
        response.stats || { total: 0, approved: 0, pending: 0, blocked: 0 }
      );
    } catch (error) {
      toast.error('Failed to fetch providers');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (providerId, status, currentProvider) => {
    try {
      let payload = {};
      let actionText = status;

      if (status === 'approve') {
        payload = { isApproved: true, isActive: true };
      } else if (status === 'block') {
        payload = { isApproved: currentProvider.isApproved, isActive: false };
      } else if (status === 'unblock') {
        payload = { isApproved: currentProvider.isApproved, isActive: true };
        actionText = 'unblocked';
      }

      await updateProviderApproval(token, providerId, payload);
      toast.success(`Provider ${actionText} successfully`);
      fetchProviders();
    } catch (error) {
      toast.error(`Failed to ${status} provider`);
    }
  };

  // --- ** ADD THESE HANDLERS FOR THE MODAL ** ---
  const handleViewDetails = (provider) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProvider(null);
  };

  return (
    // Use React Fragment <> to wrap the page and the modal
    <>
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-sky-50'>
        {/* Header and main content */}
        <div className='bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-20'>
          {/* ... Header JSX is unchanged ... */}
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-slate-800'>
                  Provider Management
                </h1>
                <p className='text-slate-500 mt-1'>
                  Oversee and manage all healthcare providers.
                </p>
              </div>
              <div className='hidden md:block p-3 bg-violet-100 rounded-full'>
                <Users className='w-8 h-8 text-violet-600' />
              </div>
            </div>
          </div>
        </div>

        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* ... Stats and Filters JSX are unchanged ... */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <StatCard
              title='Total Providers'
              value={stats.total}
              icon={Users}
              gradient='bg-gradient-to-br from-blue-300 to-violet-300'
              textColor='text-blue-900'
            />
            <StatCard
              title='Approved'
              value={stats.approved}
              icon={CheckCircle}
              gradient='bg-gradient-to-br from-green-300 to-teal-300'
              textColor='text-green-900'
            />
            <StatCard
              title='Pending'
              value={stats.pending}
              icon={Clock}
              gradient='bg-gradient-to-br from-yellow-300 to-amber-300'
              textColor='text-amber-900'
            />
            <StatCard
              title='Blocked'
              value={stats.blocked}
              icon={XCircle}
              gradient='bg-gradient-to-br from-rose-300 to-red-300'
              textColor='text-rose-900'
            />
          </div>
          <div className='bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200 p-4 mb-8'>
            <div className='flex flex-col sm:flex-row gap-4 items-center'>
              <div className='relative flex-grow w-full sm:w-auto'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5' />
                <input
                  type='text'
                  placeholder='Search by name, email, or NPI...'
                  className='pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition w-full hover:border-violet-400 cursor-text'
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value, page: 1 })
                  }
                />
              </div>
              <div className='relative w-full sm:w-auto'>
                <Filter className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5' />
                <select
                  className='pl-10 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition appearance-none cursor-pointer w-full hover:border-violet-400'
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value, page: 1 })
                  }
                >
                  <option value=''>All Statuses</option>
                  <option value='approved'>Approved</option>
                  <option value='pending'>Pending</option>
                  <option value='blocked'>Blocked</option>
                </select>
              </div>
            </div>
          </div>

          {/* Providers Grid */}
          {loading ? (
            <div className='flex items-center justify-center py-20'>
              <div className='w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin'></div>
            </div>
          ) : providers.length === 0 ? (
            <div className='text-center py-20 bg-white/60 rounded-xl border border-slate-200'>
              <Users className='h-12 w-12 text-slate-400 mx-auto mb-4' />
              <h3 className='text-xl font-medium text-slate-800'>
                No Providers Found
              </h3>
              <p className='text-slate-500'>
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8'>
              {providers.map((provider) => (
                <div
                  key={provider._id}
                  className='group flex flex-col bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/80 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer'
                  onClick={() => handleViewDetails(provider)}
                >
                  {/* Card Header */}
                  <div className='p-5 bg-gradient-to-tr from-violet-200 to-pink-200'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <h3 className='text-lg font-bold text-violet-900'>
                          {provider.providerName}
                        </h3>
                        <p className='text-pink-800/80 text-sm font-medium'>
                          {provider.practiceName}
                        </p>
                      </div>
                      <div className='ml-4 flex-shrink-0'>
                        <StatusBadge provider={provider} />
                      </div>
                    </div>
                  </div>
                  {/* Card Body */}
                  <div className='p-5 flex-grow'>
                    <div className='space-y-3 text-sm text-slate-600 mb-6'>
                      <p>
                        <strong>Email:</strong> {provider.email}
                      </p>
                      <p>
                        <strong>NPI:</strong> {provider.npiNumber}
                      </p>
                      <p>
                        <strong>Location:</strong> {provider.city},{' '}
                        {provider.state}
                      </p>
                    </div>
                    <div className='min-h-[72px]'>
                      <h4 className='text-sm font-semibold text-slate-700 mb-2 flex items-center'>
                        <BriefcaseMedical className='w-4 h-4 mr-2 text-violet-500' />
                        Specialties
                      </h4>
                      {provider.specialties?.length > 0 ? (
                        <div className='flex flex-wrap gap-1.5'>
                          {provider.specialties
                            .slice(0, 3)
                            .map((specialty, index) => (
                              <span
                                key={index}
                                className='bg-violet-100 text-violet-800 px-2 py-1 rounded text-xs font-semibold'
                              >
                                {specialty}
                              </span>
                            ))}
                          {provider.specialties.length > 3 && (
                            <span className='text-xs text-slate-500 font-medium py-1'>
                              +{provider.specialties.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className='text-xs text-slate-400 italic'>
                          No specialties listed.
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Card Actions */}
                  <div className='p-4 bg-slate-50/70 border-t border-slate-200/80'>
                    {/* ... Buttons JSX is unchanged ... */}
                    <div className='flex gap-2 text-sm'>
                      {!provider.isApproved && provider.isActive && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(
                              provider._id,
                              'approve',
                              provider
                            );
                          }}
                          className='flex-1 flex items-center justify-center bg-teal-100 text-teal-800 py-2.5 px-4 rounded-lg font-semibold hover:bg-teal-200 border border-teal-200/50 transition-colors duration-200 cursor-pointer'
                        >
                          <CheckCircle className='w-4 h-4 mr-2' />
                          Approve
                        </button>
                      )}
                      {provider.isActive ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(provider._id, 'block', provider);
                          }}
                          className='flex-1 flex items-center justify-center bg-rose-100 text-rose-800 py-2.5 px-4 rounded-lg font-semibold hover:bg-rose-200 border border-rose-200/50 transition-colors duration-200 cursor-pointer'
                        >
                          <XCircle className='w-4 h-4 mr-2' />
                          Block
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(
                              provider._id,
                              'unblock',
                              provider
                            );
                          }}
                          className='flex-1 flex items-center justify-center bg-amber-100 text-amber-800 py-2.5 px-4 rounded-lg font-semibold hover:bg-amber-200 border border-amber-200/50 transition-colors duration-200 cursor-pointer'
                        >
                          <Clock className='w-4 h-4 mr-2' />
                          Unblock
                        </button>
                      )}
                    </div>
                  </div>
                  {/* ** UPDATE THIS BUTTON ONCLICK ** */}
                  <div className='px-5 py-3 bg-slate-100'>
                    <div className='flex items-center justify-between text-xs text-slate-500'>
                      <span>
                        Joined:{' '}
                        {new Date(provider.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(provider);
                        }}
                        className='p-1.5 hover:bg-slate-300 rounded-full transition-colors cursor-pointer'
                      >
                        <Eye className='w-4 h-4 text-slate-600' />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {isModalOpen && (
        <ProviderDetailModal
          provider={selectedProvider}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default AdminProviders;
