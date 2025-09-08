'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import {
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: 'OWNER' | 'STAFF';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateUserForm {
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  role: 'OWNER' | 'STAFF';
  isActive: boolean;
}

export default function SecurityPage() {
  const { language } = useLanguage();
  const { t, isRTL, textAlignClass } = useTranslation();
  const { isDark } = useTheme();
  
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form states
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    role: 'STAFF',
    isActive: true
  });
  
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.data || []);
        } else {
          setError(data.message || t('security.errorFetchingUsers'));
        }
      } else {
        setError(t('security.errorFetchingUsers'));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(t('security.errorFetchingUsers'));
    } finally {
      setLoading(false);
    }
  };
  
  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });
  
  // Handle create user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (createForm.password !== createForm.confirmPassword) {
      setError(t('security.passwordMismatch'));
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: createForm.username,
          firstName: createForm.firstName,
          lastName: createForm.lastName,
          password: createForm.password,
          role: createForm.role,
          isActive: createForm.isActive
        }),
      });
      
      if (response.ok) {
        setSuccess(t('security.userCreated'));
        setShowCreateModal(false);
        resetCreateForm();
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.message || t('security.createError'));
      }
    } catch (error) {
      setError(t('security.createError'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle edit user
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });
      
      if (response.ok) {
        setSuccess(t('security.userUpdated'));
        setShowEditModal(false);
        setSelectedUser(null);
        setEditForm({});
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.message || t('security.updateError'));
      }
    } catch (error) {
      setError(t('security.updateError'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSuccess(t('security.userDeleted'));
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.message || t('security.deleteError'));
      }
    } catch (error) {
      setError(t('security.deleteError'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset create form
  const resetCreateForm = () => {
    setCreateForm({
      username: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      role: 'STAFF',
      isActive: true
    });
  };
  
  // Open edit modal
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive
    });
    setShowEditModal(true);
  };
  
  // Open delete modal
  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };
  
  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);
  
  return (
    <ProtectedRoute requiredRole="OWNER">
      <div className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ${textAlignClass}`}>
                    {t('security.title')}
                  </h1>
                  <p className={`mt-1 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {t('security.userManagement')}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className={`inline-flex items-center px-6 py-3 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  isDark
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                }`}
              >
                <UserPlusIcon className="w-5 h-5 mr-2" />
                {t('security.addUser')}
              </button>
            </div>
          </div>
          
          {/* Alert Messages */}
          {error && (
            <div className={`mb-6 rounded-xl p-4 flex items-center transition-colors duration-300 ${
              isDark 
                ? 'bg-red-900/20 border border-red-800/30' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-3" />
              <span className={`transition-colors duration-300 ${
                isDark ? 'text-red-300' : 'text-red-700'
              }`}>{error}</span>
            </div>
          )}
          
          {success && (
            <div className={`mb-6 rounded-xl p-4 flex items-center transition-colors duration-300 ${
              isDark 
                ? 'bg-green-900/20 border border-green-800/30' 
                : 'bg-green-50 border border-green-200'
            }`}>
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
              <span className={`transition-colors duration-300 ${
                isDark ? 'text-green-300' : 'text-green-700'
              }`}>{success}</span>
            </div>
          )}
          
          {/* Filters and Search */}
          <div className={`backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-8 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800/80 border border-gray-700/50' 
              : 'bg-white/80 border border-gray-200/50'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder={t('security.searchUsers')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              
              {/* Role Filter */}
              <div className="relative">
                <FunnelIcon className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none ${
                    isDark 
                      ? 'bg-gray-700 border border-gray-600 text-white' 
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <option value="">{t('security.filterByRole')}</option>
                  <option value="OWNER">{t('security.owner')}</option>
                  <option value="STAFF">{t('security.staff')}</option>
                </select>
              </div>
              
              {/* Status Filter */}
              <div className="relative">
                <FunnelIcon className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none ${
                    isDark 
                      ? 'bg-gray-700 border border-gray-600 text-white' 
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <option value="">{t('security.filterByStatus')}</option>
                  <option value="active">{t('security.active')}</option>
                  <option value="inactive">{t('security.inactive')}</option>
                </select>
              </div>
              
              {/* Results Count */}
              <div className={`flex items-center justify-center rounded-xl px-4 py-3 transition-colors duration-300 ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <span className={`font-medium transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {filteredUsers.length} {t('common.results')}
                </span>
              </div>
            </div>
          </div>
          
          {/* Users Table */}
          <div className={`backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800/80 border border-gray-700/50' 
              : 'bg-white/80 border border-gray-200/50'
          }`}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className={`ml-3 transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>{t('common.loading')}</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <UserIcon className={`w-12 h-12 mx-auto mb-4 transition-colors duration-300 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <p className={`transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>{t('security.noUsersFound')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`transition-colors duration-300 ${
                    isDark ? 'bg-gray-700/50' : 'bg-gray-50/50'
                  }`}>
                    <tr>
                      <th className={`px-6 py-4 text-sm font-semibold transition-colors duration-300 ${textAlignClass} ${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        {t('security.username')}
                      </th>
                      <th className={`px-6 py-4 text-sm font-semibold transition-colors duration-300 ${textAlignClass} ${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        {t('security.fullName')}
                      </th>
                      <th className={`px-6 py-4 text-sm font-semibold transition-colors duration-300 ${textAlignClass} ${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        {t('security.role')}
                      </th>
                      <th className={`px-6 py-4 text-sm font-semibold transition-colors duration-300 ${textAlignClass} ${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        {t('security.status')}
                      </th>
                      <th className={`px-6 py-4 text-sm font-semibold transition-colors duration-300 ${textAlignClass} ${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        {t('security.createdAt')}
                      </th>
                      <th className={`px-6 py-4 text-sm font-semibold transition-colors duration-300 ${textAlignClass} ${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        {t('security.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors duration-300 ${
                    isDark ? 'divide-gray-700/50' : 'divide-gray-200/50'
                  }`}>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className={`transition-colors duration-200 ${
                        isDark ? 'hover:bg-gray-700/30' : 'hover:bg-blue-50/30'
                      }`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white text-sm font-semibold">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className={`font-medium transition-colors duration-300 ${
                              isDark ? 'text-gray-100' : 'text-gray-900'
                            }`}>{user.username}</span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 transition-colors duration-300 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${
                            user.role === 'OWNER' 
                              ? (isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800')
                              : (isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800')
                          }`}>
                            {user.role === 'OWNER' ? t('security.owner') : t('security.staff')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${
                            user.isActive 
                              ? (isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800')
                              : (isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800')
                          }`}>
                            {user.isActive ? (
                              <>
                                <CheckCircleIcon className="w-4 h-4 mr-1" />
                                {t('security.active')}
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="w-4 h-4 mr-1" />
                                {t('security.inactive')}
                              </>
                            )}
                          </span>
                        </td>
                        <td className={`px-6 py-4 transition-colors duration-300 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {new Date(user.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openEditModal(user)}
                              className={`p-2 rounded-lg transition-colors duration-200 ${
                                isDark 
                                  ? 'text-blue-400 hover:bg-gray-700' 
                                  : 'text-blue-600 hover:bg-blue-50'
                              }`}
                              title={t('security.editUser')}
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(user)}
                              className={`p-2 rounded-lg transition-colors duration-200 ${
                                isDark 
                                  ? 'text-red-400 hover:bg-gray-700' 
                                  : 'text-red-600 hover:bg-red-50'
                              }`}
                              title={t('security.deleteUser')}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto transition-colors duration-300 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
                isDark ? 'text-gray-100' : 'text-gray-900'
              }`}>{t('security.addUser')}</h2>
              
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {t('security.username')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.username}
                    onChange={(e) => setCreateForm({...createForm, username: e.target.value})}
                    placeholder={t('security.enterUsername')}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {t('security.firstName')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.firstName}
                      onChange={(e) => setCreateForm({...createForm, firstName: e.target.value})}
                      placeholder={t('security.enterFirstName')}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {t('security.lastName')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.lastName}
                      onChange={(e) => setCreateForm({...createForm, lastName: e.target.value})}
                      placeholder={t('security.enterLastName')}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                </div>
                

                
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {t('security.password')} *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={createForm.password}
                      onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                      placeholder={t('security.enterPassword')}
                      className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                        isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {t('security.confirmPassword')} *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={createForm.confirmPassword}
                      onChange={(e) => setCreateForm({...createForm, confirmPassword: e.target.value})}
                      placeholder={t('security.enterConfirmPassword')}
                      className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                        isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {t('security.role')} *
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({...createForm, role: e.target.value as 'OWNER' | 'STAFF'})}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-gray-100' 
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  >
                    <option value="STAFF">{t('security.staff')}</option>
                    <option value="OWNER">{t('security.owner')}</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={createForm.isActive}
                    onChange={(e) => setCreateForm({...createForm, isActive: e.target.checked})}
                    className={`w-4 h-4 text-blue-600 rounded focus:ring-blue-500 transition-colors duration-300 ${
                      isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                    }`}
                  />
                  <label htmlFor="isActive" className={`ml-2 text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {t('security.activeUser')}
                  </label>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetCreateForm();
                    }}
                    className={`px-6 py-3 rounded-xl transition-colors duration-200 ${
                      isDark 
                        ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                        : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {t('security.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-3 text-white rounded-xl transition-all duration-200 disabled:opacity-50 ${
                      isDark 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800' 
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                    }`}
                  >
                    {isSubmitting ? t('security.creating') : t('security.createUser')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto transition-colors duration-300 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
                isDark ? 'text-gray-100' : 'text-gray-900'
              }`}>{t('security.editUser')}</h2>
              
              <form onSubmit={handleEditUser} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {t('security.username')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.username || ''}
                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {t('security.firstName')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.firstName || ''}
                      onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {t('security.lastName')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.lastName || ''}
                      onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                </div>
                

                
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {t('security.role')} *
                  </label>
                  <select
                    value={editForm.role || 'STAFF'}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value as 'OWNER' | 'STAFF'})}
                    className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-gray-100' 
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  >
                    <option value="STAFF">{t('security.staff')}</option>
                    <option value="OWNER">{t('security.owner')}</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    checked={editForm.isActive || false}
                    onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="editIsActive" className={`ml-2 text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {t('security.activeUser')}
                  </label>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedUser(null);
                      setEditForm({});
                    }}
                    className={`px-6 py-3 rounded-xl transition-colors duration-200 ${
                      isDark 
                        ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                        : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {t('security.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-3 text-white rounded-xl transition-all duration-200 disabled:opacity-50 ${
                      isDark 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800' 
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                    }`}
                  >
                    {isSubmitting ? t('security.updating') : t('security.updateUser')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-2xl p-6 w-full max-w-md transition-colors duration-300 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${
                  isDark ? 'bg-red-900/20' : 'bg-red-100'
                }`}>
                  <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                </div>
                <h2 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
                  isDark ? 'text-gray-100' : 'text-gray-900'
                }`}>{t('security.deleteUser')}</h2>
                <p className={`mb-6 transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {t('security.deleteConfirmation')} <strong>{selectedUser.username}</strong>?
                </p>
                
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedUser(null);
                    }}
                    className={`px-6 py-3 rounded-xl transition-colors duration-200 ${
                      isDark 
                        ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                        : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {t('security.cancel')}
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    disabled={isSubmitting}
                    className={`px-6 py-3 text-white rounded-xl transition-colors duration-200 disabled:opacity-50 ${
                      isDark 
                        ? 'bg-red-700 hover:bg-red-800' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {isSubmitting ? t('security.deleting') : t('security.delete')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}