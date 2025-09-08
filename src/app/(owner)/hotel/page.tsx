'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';

interface HotelAgreement {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

interface Hotel {
  id: string;
  name: string;
  code: string;
  altName: string | null;
  address: string | null;
  location: string | null;
  description: string | null;
  altDescription: string | null;
  roomCount?: number;
  agreementCount?: number;
  agreements?: HotelAgreement[];
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function Hotel() {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [hotelName, setHotelName] = useState('');
  const [hotelCode, setHotelCode] = useState('');
  const [altHotelName, setAltHotelName] = useState('');
  const [hotelAddress, setHotelAddress] = useState('');
  const [hotelLocation, setHotelLocation] = useState('');
  const [hotelDescription, setHotelDescription] = useState('');
  const [altHotelDescription, setAltHotelDescription] = useState('');
  const [agreementFiles, setAgreementFiles] = useState<File[]>([]);
  const [nameFilter, setNameFilter] = useState('');
  const [codeFilter, setCodeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [hasFilesFilter, setHasFilesFilter] = useState<string>('');
  const [hasRoomsFilter, setHasRoomsFilter] = useState<string>('');
  const [minRoomCountFilter, setMinRoomCountFilter] = useState<string>('');
  const [maxRoomCountFilter, setMaxRoomCountFilter] = useState<string>('');
  const [generalSearch, setGeneralSearch] = useState('');
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [selectedHotelDetails, setSelectedHotelDetails] = useState<Hotel | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  // Fetch hotels from API
  const fetchHotels = async (search = '', location = '', hasRooms = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (location) params.append('location', location);
      if (hasRooms && hasRooms !== 'all') params.append('hasRooms', hasRooms);
      
      const queryString = params.toString();
      const url = `/api/hotels${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      const result: ApiResponse<Hotel[]> = await response.json();
      
      if (result.success && result.data) {
        setHotels(result.data);
      } else {
        setError(result.message || 'Failed to fetch hotels');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Fetch hotels error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load hotels on component mount
  useEffect(() => {
    fetchHotels();
  }, []);

  // Filter hotels based on search inputs (client-side filtering for additional refinement)
  const filteredHotels = (hotels || []).filter(hotel => {
    const nameMatch = nameFilter === '' || 
      hotel.name.toLowerCase().includes(nameFilter.toLowerCase()) ||
      (hotel.altName && hotel.altName.toLowerCase().includes(nameFilter.toLowerCase()));
    const codeMatch = codeFilter === '' || 
      hotel.code.toLowerCase().includes(codeFilter.toLowerCase());
    const locationMatch = locationFilter === '' ||
      (hotel.location && hotel.location.toLowerCase().includes(locationFilter.toLowerCase()));
    const addressMatch = addressFilter === '' ||
      (hotel.address && hotel.address.toLowerCase().includes(addressFilter.toLowerCase()));
    
    // Files filtering logic
    const filesMatch = (() => {
      if (hasFilesFilter === '') return true;
      if (hasFilesFilter === 'true') {
        return (hotel.agreementCount || 0) > 0 || (hotel.agreements && hotel.agreements.length > 0);
      }
      if (hasFilesFilter === 'false') {
        return (hotel.agreementCount || 0) === 0 && (!hotel.agreements || hotel.agreements.length === 0);
      }
      return true;
    })();
    
    // Room filtering logic
    const roomsMatch = (() => {
      const roomCount = hotel.roomCount || 0;
      
      // First check the has rooms filter
      if (hasRoomsFilter === 'true') {
        if (roomCount === 0) return false;
      } else if (hasRoomsFilter === 'false') {
        return roomCount === 0;
      }
      
      // Then apply room count range filters (regardless of hasRoomsFilter value)
      // Check minimum room count
      if (minRoomCountFilter !== '') {
        const minCount = parseInt(minRoomCountFilter);
        if (!isNaN(minCount) && roomCount < minCount) {
          return false;
        }
      }
      
      // Check maximum room count
      if (maxRoomCountFilter !== '') {
        const maxCount = parseInt(maxRoomCountFilter);
        if (!isNaN(maxCount) && roomCount > maxCount) {
          return false;
        }
      }
      
      return true;
    })();
    
    return nameMatch && codeMatch && locationMatch && addressMatch && filesMatch && roomsMatch;
  });

  const handleAddHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelName || !hotelCode) {
      setError('Hotel name and code are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const hotelData = {
        name: hotelName,
        code: hotelCode,
        altName: altHotelName || null,
        address: hotelAddress || null,
        location: hotelLocation || null,
        description: hotelDescription || null,
        altDescription: altHotelDescription || null
      };

      const response = await fetch('/api/hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hotelData),
      });

      const result: ApiResponse<Hotel> = await response.json();
      
      if (result.success && result.data) {
        let createdHotel = result.data;
        
        // Upload agreement files if any are selected
        if (agreementFiles.length > 0) {
          try {
            const formData = new FormData();
            agreementFiles.forEach(file => {
              formData.append('files', file);
            });

            const uploadResponse = await fetch(`/api/hotels/${createdHotel.id}/agreements`, {
              method: 'POST',
              body: formData,
            });

            const uploadResult = await uploadResponse.json();
            if (uploadResult.success) {
              // Refresh hotel data to include uploaded agreements
              await fetchHotels();
            } else {
              console.warn('File upload failed:', uploadResult.message);
            }
          } catch (uploadErr) {
            console.warn('File upload error:', uploadErr);
          }
        } else {
          setHotels([createdHotel, ...hotels]);
        }
        
        setHotelName('');
        setHotelCode('');
        setAltHotelName('');
        setHotelAddress('');
        setHotelLocation('');
        setHotelDescription('');
        setAltHotelDescription('');
        setAgreementFiles([]);
        console.log('Hotel added:', createdHotel);
      } else {
        setError(result.message || 'Failed to add hotel');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Add hotel error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditHotel = (id: string) => {
    const hotel = hotels.find(h => h.id === id);
    if (hotel) {
      setEditingHotel(hotel);
      setHotelName(hotel.name);
      setHotelCode(hotel.code);
      setAltHotelName(hotel.altName || '');
      setHotelAddress(hotel.address || '');
      setHotelDescription(hotel.description || '');
      setAltHotelDescription(hotel.altDescription || '');
    }
  };

  const handleUpdateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHotel || !hotelName || !hotelCode) {
      setError('Hotel name and code are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const hotelData = {
        name: hotelName,
        code: hotelCode,
        altName: altHotelName || null,
        address: hotelAddress || null,
        description: hotelDescription || null,
        altDescription: altHotelDescription || null
      };

      const response = await fetch(`/api/hotels/${editingHotel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hotelData),
      });

      const result: ApiResponse<Hotel> = await response.json();
      
      if (result.success && result.data) {
        let updatedHotel = result.data;
        
        // Upload agreement files if any are selected
        if (agreementFiles.length > 0) {
          try {
            const formData = new FormData();
            agreementFiles.forEach(file => {
              formData.append('files', file);
            });

            const uploadResponse = await fetch(`/api/hotels/${updatedHotel.id}/agreements`, {
              method: 'POST',
              body: formData,
            });

            if (uploadResponse.ok) {
              console.log('Agreement files uploaded successfully');
            } else {
              console.error('Failed to upload agreement files');
            }
          } catch (uploadErr) {
            console.error('Agreement upload error:', uploadErr);
          }
        }
        
        setHotels(hotels.map(h => h.id === editingHotel.id ? updatedHotel : h));
        setEditingHotel(null);
        setHotelName('');
        setHotelCode('');
        setAltHotelName('');
        setHotelAddress('');
        setHotelLocation('');
        setHotelDescription('');
        setAltHotelDescription('');
        setAgreementFiles([]);
        console.log('Hotel updated:', updatedHotel);
      } else {
        setError(result.message || 'Failed to update hotel');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Update hotel error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingHotel(null);
    setHotelName('');
    setHotelCode('');
    setAltHotelName('');
    setHotelAddress('');
    setHotelDescription('');
    setAltHotelDescription('');
  };

  const handleDeleteHotel = async (id: string) => {
    if (!confirm(t('hotels.confirmDeleteHotel'))) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/hotels/${id}`, {
        method: 'DELETE',
      });

      const result: ApiResponse<null> = await response.json();
      
      if (result.success) {
        setHotels(hotels.filter(hotel => hotel.id !== id));
        setSelectedHotels(selectedHotels.filter(selectedId => selectedId !== id));
        if (selectedHotelDetails?.id === id) {
          setSelectedHotelDetails(null);
        }
        console.log('Hotel deleted:', id);
      } else {
        setError(result.message || 'Failed to delete hotel');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Delete hotel error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewHotel = (id: string) => {
    const hotel = hotels.find(h => h.id === id);
    setSelectedHotelDetails(hotel || null);
    console.log('View hotel:', hotel);
  };

  const handleSelectHotel = (id: string) => {
    setSelectedHotels(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAllHotels = () => {
    if (selectedHotels.length === (filteredHotels?.length || 0)) {
      setSelectedHotels([]);
    } else {
      setSelectedHotels((filteredHotels || []).map(hotel => hotel.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedHotels.length === 0) return;
    
    if (!confirm(t('hotels.confirmDeleteSelectedHotels', { count: selectedHotels.length }))) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Delete hotels one by one (could be optimized with batch delete API)
      const deletePromises = selectedHotels.map(id => 
        fetch(`/api/hotels/${id}`, { method: 'DELETE' })
      );
      
      const responses = await Promise.all(deletePromises);
      const results = await Promise.all(
        responses.map(response => response.json())
      );
      
      // Check if all deletions were successful
      const failedDeletions = results.filter(result => !result.success);
      
      if (failedDeletions.length === 0) {
        setHotels(hotels.filter(hotel => !selectedHotels.includes(hotel.id)));
        setSelectedHotels([]);
        console.log('Selected hotels deleted:', selectedHotels);
      } else {
        setError(`Failed to delete ${failedDeletions.length} hotel(s)`);
        // Refresh the list to get current state
        fetchHotels();
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Delete selected hotels error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    console.log('Print hotels list');
    // Handle print logic
  };

  const handlePrintSelected = () => {
    const selectedHotelData = hotels.filter(hotel => selectedHotels.includes(hotel.id));
    console.log('Print selected hotels:', selectedHotelData);
    // Handle print selected logic
  };

  const handleDeleteAll = () => {
    setHotels([]);
    setSelectedHotels([]);
    console.log('All hotels deleted');
  };

  const handlePrintAll = () => {
    console.log('Print all hotels:', hotels);
    // Handle print all logic
  };

  const handleExit = () => {
    console.log('Exit dashboard');
    // Handle exit logic
  };

  return (
    <ProtectedRoute requiredRole="OWNER">
      <div className={`min-h-screen px-4 py-8 relative overflow-hidden transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
      }`}>
        {/* Error Display */}
        {error && (
          <div className={`backdrop-blur-xl rounded-3xl shadow-2xl p-6 ${
            isDark 
              ? 'bg-red-900/70 border border-red-700/50' 
              : 'bg-red-50/70 border border-red-200/50'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className={isDark ? 'text-red-200' : 'text-red-800'}>
                <p className="font-medium">{error}</p>
              </div>
              <div className="ml-auto">
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Hotel Section - Enhanced */}
        <div className={`backdrop-blur-sm border-2 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-16 mx-4 mb-16 ${
          isDark 
            ? 'bg-gray-800/85 border-gray-600/70' 
            : 'bg-white/85 border-slate-200/70'
        }`}>
          <div className="mb-16">
            <div className="flex items-center space-x-12 mb-16">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-xl">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className={`text-4xl font-black tracking-tight leading-tight mb-6 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {editingHotel ? t('hotels.editHotel') : t('hotels.addNewHotel')}
                </h2>
                <p className={`text-xl font-bold mt-6 leading-relaxed ${
                  isDark ? 'text-gray-300' : 'text-slate-700'
                }`}>
                  {editingHotel ? t('hotels.updateHotelDetails') : t('hotels.enterHotelDetails')}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={editingHotel ? handleUpdateHotel : handleAddHotel} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-8">
              
              
              {/* First Row: Hotel Name, Alt Name, Code */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                {/* Hotel Name */}
                <div className="space-y-8">
                  <label className={`block text-2xl font-black tracking-wide mb-4 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {t('hotels.hotelName')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={hotelName}
                      onChange={(e) => setHotelName(e.target.value)}
                      className={`w-full pl-14 pr-6 py-5 border-2 rounded-2xl focus:outline-none focus:border-blue-600 focus:shadow-lg transition-all duration-300 font-semibold text-lg shadow-sm hover:shadow-md ${
                        isDark 
                          ? 'bg-gray-700/70 border-gray-600 placeholder-gray-400 text-white hover:border-gray-500' 
                          : 'bg-slate-50/70 border-slate-300 placeholder-slate-400 text-slate-800 hover:border-slate-400'
                      }`}
                      placeholder={t('hotels.enterHotelName')}
                      required
                    />
                  </div>
                </div>

                {/* Alt Hotel Name */}
                <div className="space-y-8">
                  <label className={`block text-2xl font-black tracking-wide mb-4 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {t('hotels.altHotelName')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={altHotelName}
                      onChange={(e) => setAltHotelName(e.target.value)}
                      className={`w-full pl-14 pr-6 py-5 border-2 rounded-2xl focus:outline-none focus:border-blue-600 focus:shadow-lg transition-all duration-300 font-semibold text-lg shadow-sm hover:shadow-md ${
                        isDark 
                          ? 'bg-gray-700/70 border-gray-600 placeholder-gray-400 text-white hover:border-gray-500' 
                          : 'bg-slate-50/70 border-slate-300 placeholder-slate-400 text-slate-800 hover:border-slate-400'
                      }`}
                      placeholder={t('hotels.enterAltName')}
                      required
                    />
                  </div>
                </div>

                {/* Hotel Code */}
                <div className="space-y-8">
                  <label className={`block text-2xl font-black tracking-wide mb-4 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {t('hotels.hotelCode')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={hotelCode}
                      onChange={(e) => setHotelCode(e.target.value)}
                      className={`w-full pl-14 pr-6 py-5 border-2 rounded-2xl focus:outline-none focus:border-blue-600 focus:shadow-lg transition-all duration-300 font-semibold text-lg shadow-sm hover:shadow-md ${
                        isDark 
                          ? 'bg-gray-700/70 border-gray-600 placeholder-gray-400 text-white hover:border-gray-500' 
                          : 'bg-slate-50/70 border-slate-300 placeholder-slate-400 text-slate-800 hover:border-slate-400'
                      }`}
                      placeholder={t('hotels.enterHotelCode')}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Second Row: Address, Location */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Hotel Address */}
                <div className="space-y-8">
                  <label className={`block text-2xl font-black tracking-wide mb-4 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {t('hotels.hotelAddress')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={hotelAddress}
                      onChange={(e) => setHotelAddress(e.target.value)}
                      className={`w-full pl-14 pr-6 py-5 border-2 rounded-2xl focus:outline-none focus:border-blue-600 focus:shadow-lg transition-all duration-300 font-semibold text-lg shadow-sm hover:shadow-md ${
                        isDark 
                          ? 'bg-gray-700/70 border-gray-600 placeholder-gray-400 text-white hover:border-gray-500' 
                          : 'bg-slate-50/70 border-slate-300 placeholder-slate-400 text-slate-800 hover:border-slate-400'
                      }`}
                      placeholder={t('hotels.enterHotelAddress')}
                      required
                    />
                  </div>
                </div>

                {/* Location Field */}
                <div className="space-y-8">
                  <label className={`block text-2xl font-black tracking-wide mb-4 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {t('hotels.location')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={hotelLocation}
                      onChange={(e) => setHotelLocation(e.target.value)}
                      className={`w-full pl-14 pr-6 py-5 border-2 rounded-2xl focus:outline-none focus:border-blue-600 focus:shadow-lg transition-all duration-300 font-semibold text-lg shadow-sm hover:shadow-md ${
                        isDark 
                          ? 'bg-gray-700/70 border-gray-600 placeholder-gray-400 text-white hover:border-gray-500' 
                          : 'bg-slate-50/70 border-slate-300 placeholder-slate-400 text-slate-800 hover:border-slate-400'
                      }`}
                      placeholder={t('hotels.enterLocation')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-8">
              
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Hotel Description */}
                <div className="space-y-8">
                  <label className={`block text-2xl font-black tracking-wide mb-4 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {t('hotels.hotelDescription')}
                  </label>
                  <div className="relative">
                    <div className="absolute top-5 left-5 pointer-events-none">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                    </div>
                    <textarea
                      value={hotelDescription}
                      onChange={(e) => setHotelDescription(e.target.value)}
                      rows={6}
                      className={`w-full pl-14 pr-6 py-5 border-2 rounded-2xl focus:outline-none focus:border-blue-600 focus:shadow-lg transition-all duration-300 font-semibold text-lg resize-none shadow-sm hover:shadow-md ${
                        isDark 
                          ? 'bg-gray-700/70 border-gray-600 placeholder-gray-400 text-white hover:border-gray-500' 
                          : 'bg-slate-50/70 border-slate-300 placeholder-slate-400 text-slate-800 hover:border-slate-400'
                      }`}
                      placeholder={t('hotels.enterHotelDescription')}
                    />
                  </div>
                </div>

                {/* Alt Hotel Description */}
                <div className="space-y-8">
                  <label className={`block text-2xl font-black tracking-wide mb-4 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {t('hotels.altHotelDescription')}
                  </label>
                  <div className="relative">
                    <div className="absolute top-5 left-5 pointer-events-none">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                    </div>
                    <textarea
                      value={altHotelDescription}
                      onChange={(e) => setAltHotelDescription(e.target.value)}
                      rows={6}
                      className={`w-full pl-14 pr-6 py-5 border-2 rounded-2xl focus:outline-none focus:border-blue-600 focus:shadow-lg transition-all duration-300 font-semibold text-lg resize-none shadow-sm hover:shadow-md ${
                        isDark 
                          ? 'bg-gray-700/70 border-gray-600 placeholder-gray-400 text-white hover:border-gray-500' 
                          : 'bg-slate-50/70 border-slate-300 placeholder-slate-400 text-slate-800 hover:border-slate-400'
                      }`}
                      placeholder={t('hotels.enterAltHotelDescription')}
                    />
                  </div>
                </div>
              </div>
            </div>



            {/* File Upload Section and Action Buttons - Reversed Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t-2 border-slate-200/70 items-stretch">
              {/* File Upload Section - Left Side */}
              <div className="space-y-8 h-full">
                <div className="space-y-8 h-full flex flex-col">
                  
                  <div className="border-3 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:border-blue-400 bg-blue-50/40 transition-all duration-300 group shadow-sm hover:shadow-md flex-1 flex flex-col justify-center">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => {
                        const newFiles = Array.from(e.target.files || []);
                        setAgreementFiles(prev => [...prev, ...newFiles]);
                      }}
                      className="hidden"
                      id="agreement-files"
                    />
                    <label htmlFor="agreement-files" className="cursor-pointer">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-20 h-20 bg-slate-100 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center transition-colors duration-300 shadow-sm">
                          <svg className="w-10 h-10 text-slate-500 group-hover:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <span className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors duration-300">
                            {agreementFiles.length > 0
                              ? `${agreementFiles.length} ${t('hotels.filesSelected')}`
                              : t('hotels.clickToUploadFiles')
                            }
                          </span>
                          <p className="text-lg font-semibold text-slate-800 mt-3">
                            {t('hotels.supportedFormats')}: PDF, DOC, DOCX, TXT
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                  {agreementFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {agreementFiles.map((file, index) => (
                        <div key={index} className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 ${
                          isDark 
                            ? 'bg-gray-700 border border-gray-600 hover:bg-gray-600' 
                            : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <span className={`text-sm font-medium truncate ${
                              isDark ? 'text-gray-300' : 'text-slate-700'
                            }`}>{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setAgreementFiles(prev => prev.filter((_, i) => i !== index));
                            }}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 group ${
                              isDark 
                                ? 'bg-red-900/50 hover:bg-red-800/70' 
                                : 'bg-red-100 hover:bg-red-200'
                            }`}
                          >
                            <svg className="w-4 h-4 text-red-500 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons - Right Side with Full Height */}
               <div className="flex flex-col space-y-6 h-full">
                 <button
                   type="submit"
                   disabled={loading}
                   className="flex-[2] px-8 py-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl transition-all duration-300 font-black text-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-4 min-h-[180px]"
                 >
                   {loading ? (
                     <>
                       <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24">
                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                       </svg>
                       <span className="font-black text-2xl">{editingHotel ? t('hotels.updating') : t('hotels.adding')}</span>
                     </>
                   ) : (
                     <>
                       <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                       </svg>
                       <span className="font-black text-2xl">{editingHotel ? t('hotels.updateHotel') : t('hotels.addHotel')}</span>
                     </>
                   )}
                 </button>
                 
                 <button
                   type="button"
                   className={`flex-1 px-8 py-10 rounded-2xl transition-all duration-300 font-black text-xl flex items-center justify-center space-x-3 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 min-h-[140px] ${
                     isDark 
                       ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                       : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                   }`}
                   onClick={editingHotel ? handleCancelEdit : () => {
                     setHotelName('');
                     setHotelCode('');
                     setAltHotelName('');
                     setHotelAddress('');
                     setHotelDescription('');
                     setAltHotelDescription('');
                     setHotelLocation('');
                     setAgreementFiles([]);
                   }}
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                   <span className="font-black text-xl">{editingHotel ? t('common.cancel') : t('hotels.clear')}</span>
                 </button>
               </div>
            </div>
          </form>
        </div>

        {/* Hotels List Section - Redesigned */}
        <div className={`backdrop-blur-sm border-2 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-16 mx-4 mb-16 ${
          isDark 
            ? 'bg-gray-800/85 border-gray-600/70' 
            : 'bg-white/85 border-slate-200/70'
        }`}>
          <div className="mb-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl flex items-center justify-center shadow-xl">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className={`text-4xl font-black tracking-tight leading-tight mb-3 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {t('hotels.hotelsList')}
                  </h2>
                  <p className={`text-xl font-bold mt-3 leading-relaxed ${
                    isDark ? 'text-gray-300' : 'text-slate-700'
                  }`}>
                    {t('hotels.viewManageHotels')}
                  </p>
                </div>
              </div>
              <div className={`text-xl font-black px-6 py-3 rounded-2xl border ${
                isDark 
                  ? 'text-gray-300 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-blue-700' 
                  : 'text-slate-700 bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-200'
              }`}>
                {filteredHotels?.length || 0} {filteredHotels?.length === 1 ? 'hotel' : 'hotels'}
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className={`mb-12 backdrop-blur-sm rounded-2xl p-8 shadow-lg border ${
            isDark 
              ? 'bg-gray-800/80 border-gray-700/50' 
              : 'bg-white/80 border-slate-200/50'
          }`}>
            {/* Enhanced Filter Section Header */}
            <div className="mb-8">
              <h2 className={`text-2xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}>Hotel Filters</h2>
              <p className={`${
                isDark ? 'text-gray-400' : 'text-slate-600'
              }`}>Search and filter hotels by various criteria</p>
            </div>

            {/* Primary Search Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
              {/* Name Filter */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <label className={`block text-lg font-bold ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>
                    {t('hotels.filterByName')}
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:border-blue-500 focus:shadow-lg transition-all duration-300 text-lg ${
                      isDark 
                        ? 'bg-gray-700/70 border-gray-600 placeholder-gray-400 text-white hover:border-gray-500 focus:bg-gray-700' 
                        : 'bg-slate-50/70 border-slate-200 placeholder-slate-400 text-slate-700 hover:border-slate-300 focus:bg-white hover:bg-white/80'
                    }`}
                    placeholder={t('hotels.searchByName')}
                  />
                </div>
              </div>

              {/* Code Filter */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <label className={`block text-lg font-bold ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>
                    {t('hotels.filterByCode')}
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={codeFilter}
                    onChange={(e) => setCodeFilter(e.target.value)}
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:border-purple-500 focus:shadow-lg transition-all duration-300 text-lg ${
                      isDark 
                        ? 'bg-gray-700/70 border-gray-600 placeholder-gray-400 text-white hover:border-gray-500 focus:bg-gray-700' 
                        : 'bg-slate-50/70 border-slate-200 placeholder-slate-400 text-slate-700 hover:border-slate-300 focus:bg-white hover:bg-white/80'
                    }`}
                    placeholder={t('hotels.searchByCode')}
                  />
                </div>
              </div>

              {/* Location Filter */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <label className={`block text-lg font-bold ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>
                    {t('hotels.filterByLocation')}
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:border-green-500 focus:shadow-lg transition-all duration-300 text-lg ${
                      isDark 
                        ? 'bg-gray-700/70 border-gray-600 placeholder-gray-400 text-white hover:border-gray-500 focus:bg-gray-700' 
                        : 'bg-slate-50/70 border-slate-200 placeholder-slate-400 text-slate-700 hover:border-slate-300 focus:bg-white hover:bg-white/80'
                    }`}
                    placeholder={t('hotels.searchByLocation')}
                  />
                </div>
              </div>

              {/* Address Filter */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <label className={`block text-lg font-bold ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>
                    Filter by Address
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={addressFilter}
                    onChange={(e) => setAddressFilter(e.target.value)}
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:border-orange-500 focus:shadow-lg transition-all duration-300 text-lg ${
                      isDark 
                        ? 'bg-gray-700/70 border-gray-600 placeholder-gray-400 text-white hover:border-gray-500 focus:bg-gray-700' 
                        : 'bg-slate-50/70 border-slate-200 placeholder-slate-400 text-slate-700 hover:border-slate-300 focus:bg-white hover:bg-white/80'
                    }`}
                    placeholder="Search by address"
                  />
                </div>
              </div>
            </div>

            {/* Secondary Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {/* Has Rooms Filter */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <label className={`block text-lg font-bold ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>
                    {t('hotels.roomsFilter')}
                  </label>
                </div>
                <select
                  value={hasRoomsFilter}
                  onChange={(e) => setHasRoomsFilter(e.target.value)}
                  className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:border-indigo-500 focus:shadow-lg transition-all duration-300 text-lg ${
                    isDark 
                      ? 'bg-gray-700/70 border-gray-600 text-white hover:border-gray-500 focus:bg-gray-700' 
                      : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:border-slate-300 focus:bg-white hover:bg-white/80'
                  }`}
                >
                  <option value="">{t('hotels.allHotels')}</option>
                  <option value="true">{t('hotels.hotelsWithRooms')}</option>
                  <option value="false">{t('hotels.hotelsWithoutRooms')}</option>
                </select>
              </div>

              

              {/* Room Count Filters - Always visible except when filtering for hotels without rooms */}
              {hasRoomsFilter !== 'false' && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                      </div>
                      <label className={`block text-lg font-bold ${
                        isDark ? 'text-white' : 'text-slate-800'
                      }`}>
                        {t('hotels.minimumRoomCount')}
                      </label>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={minRoomCountFilter}
                      onChange={(e) => setMinRoomCountFilter(e.target.value)}
                      className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:border-orange-500 focus:shadow-lg transition-all duration-300 text-lg ${
                      isDark 
                        ? 'bg-gray-700/70 border-gray-600 placeholder-gray-400 text-white hover:border-gray-500 focus:bg-gray-700' 
                        : 'bg-slate-50/70 border-slate-200 placeholder-slate-400 text-slate-700 hover:border-slate-300 focus:bg-white hover:bg-white/80'
                    }`}                      placeholder={t('hotels.enterMinimumRooms')}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                      </div>
                      <label className={`block text-lg font-bold ${
                        isDark ? 'text-white' : 'text-slate-800'
                      }`}>  
                        {t('hotels.maximumRoomCount')}
                      </label>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={maxRoomCountFilter}
                      onChange={(e) => setMaxRoomCountFilter(e.target.value)}
                      className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:border-purple-500 focus:shadow-lg transition-all duration-300 text-lg ${
                      isDark 
                        ? 'bg-gray-700/70 border-gray-600 placeholder-gray-400 text-white hover:border-gray-500 focus:bg-gray-700' 
                        : 'bg-slate-50/70 border-slate-200 placeholder-slate-400 text-slate-700 hover:border-slate-300 focus:bg-white hover:bg-white/80'
                    }`}
                    placeholder={t('hotels.enterMaximumRooms')}
                    />
                  </div>
                </>
              )}

              {/* Has Files Filter */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <label className={`block text-lg font-bold ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>
                    Files Filter
                  </label>
                </div>
                <select
                  value={hasFilesFilter}
                  onChange={(e) => setHasFilesFilter(e.target.value)}
                  className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:border-indigo-500 focus:shadow-lg transition-all duration-300 text-lg ${
                    isDark 
                      ? 'bg-gray-700/70 border-gray-600 text-white hover:border-gray-500 focus:bg-gray-700' 
                      : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:border-slate-300 focus:bg-white hover:bg-white/80'
                  }`}                >
                  <option value="">All Hotels</option>
                  <option value="true">Hotels with Files</option>
                  <option value="false">Hotels without Files</option>
                </select>
              </div>
              
              {/* Clear Filters Button */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setNameFilter('');
                    setCodeFilter('');
                    setLocationFilter('');
                    setAddressFilter('');
                    setHasFilesFilter('');
                    setGeneralSearch('');
                    setHasRoomsFilter('');
                    setMinRoomCountFilter('');
                    setMaxRoomCountFilter('');
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl transition-all duration-300 font-bold text-lg flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{t('hotels.clearFilters')}</span>
                </button>
              </div>
            </div>

            {/* Selected Hotels Actions */}
            {selectedHotels.length > 0 && (
              <div className="flex flex-wrap gap-3 p-4 bg-blue-50/50 border border-blue-200/50 rounded-xl">
                <div className="flex items-center space-x-2 text-blue-700 font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{selectedHotels.length} selected</span>
                </div>
                <button
                  onClick={handleDeleteSelected}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>{t('hotels.deleteSelected')}</span>
                </button>
                <button
                  onClick={handlePrintSelected}
                  className="px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white text-sm rounded-lg transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>{t('hotels.printSelected')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Hotels Table */}
           <div className={`overflow-x-auto backdrop-blur-sm rounded-2xl border-2 shadow-lg ${
             isDark 
               ? 'bg-gray-800/60 border-gray-700/50' 
               : 'bg-white/60 border-slate-200/50'
           }`}>
             {loading ? (
               <div className="flex justify-center items-center py-16">
                 <div className="flex items-center space-x-4">
                   <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                   </svg>
                   <span className={`font-semibold text-lg ${
                     isDark ? 'text-gray-300' : 'text-slate-700'
                   }`}>{t('common.loading')}</span>
                 </div>
               </div>
             ) : (
               <table className="w-full">
                 <thead className={`${
                   isDark 
                     ? 'bg-gradient-to-r from-gray-700 to-gray-800/80' 
                     : 'bg-gradient-to-r from-slate-50 to-slate-100/80'
                 }`}>
                   <tr className={`border-b-2 ${
                     isDark ? 'border-gray-600/60' : 'border-slate-300/60'
                   }`}>
                     <th className={`text-left py-5 px-6 font-bold w-12 text-sm uppercase tracking-wide ${
                       isDark ? 'text-gray-200' : 'text-slate-800'
                     }`}>
                       <input
                         type="checkbox"
                         checked={selectedHotels.length === (filteredHotels?.length || 0) && (filteredHotels?.length || 0) > 0}
                         onChange={handleSelectAllHotels}
                         className="w-5 h-5 text-blue-600 bg-white border-2 border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all duration-200 cursor-pointer"
                       />
                     </th>
                     <th className={`text-left py-5 px-6 font-bold text-sm uppercase tracking-wide ${
                       isDark ? 'text-gray-200' : 'text-slate-800'
                     }`}>
                       {t('hotels.hotelName')}
                     </th>
                     <th className={`text-left py-5 px-6 font-bold text-sm uppercase tracking-wide ${
                       isDark ? 'text-gray-200' : 'text-slate-800'
                     }`}>
                       {t('hotels.hotelCode')}
                     </th>
                     <th className={`text-left py-5 px-6 font-bold text-sm uppercase tracking-wide ${
                       isDark ? 'text-gray-200' : 'text-slate-800'
                     }`}>
                       {t('hotels.altHotelName')}
                     </th>
                     <th className={`text-left py-5 px-6 font-bold text-sm uppercase tracking-wide ${
                       isDark ? 'text-gray-200' : 'text-slate-800'
                     }`}>
                       {t('hotels.hotelAddress')}
                     </th>
                     <th className={`text-left py-5 px-6 font-bold text-sm uppercase tracking-wide ${
                       isDark ? 'text-gray-200' : 'text-slate-800'
                     }`}>
                       {t('hotels.location')}
                     </th>
                     <th className={`text-left py-5 px-6 font-bold text-sm uppercase tracking-wide ${
                       isDark ? 'text-gray-200' : 'text-slate-800'
                     }`}>
                       {t('hotels.roomCount')}
                     </th>
                     <th className={`text-left py-5 px-6 font-bold text-sm uppercase tracking-wide ${
                       isDark ? 'text-gray-200' : 'text-slate-800'
                     }`}>
                       {t('hotels.agreementCount')}
                     </th>
                     <th className={`text-left py-5 px-6 font-bold text-sm uppercase tracking-wide ${
                       isDark ? 'text-gray-200' : 'text-slate-800'
                     }`}>
                       {t('common.actions')}
                     </th>
                   </tr>
                 </thead>
                 <tbody className={`divide-y-2 ${
                   isDark ? 'divide-gray-600/40' : 'divide-slate-200/40'
                 }`}>
                 {(filteredHotels || []).map((hotel, index) => (
                   <tr key={hotel.id} className={`transition-all duration-300 ${
                     isDark 
                       ? `hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-gray-800/30 ${
                           selectedHotels.includes(hotel.id) 
                             ? 'bg-gradient-to-r from-blue-900/40 to-gray-800/40 shadow-sm' 
                             : index % 2 === 0 ? 'bg-gray-800/40' : 'bg-gray-700/30'
                         }` 
                       : `hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-slate-50/50 ${
                           selectedHotels.includes(hotel.id) 
                             ? 'bg-gradient-to-r from-blue-100/60 to-slate-100/60 shadow-sm' 
                             : index % 2 === 0 ? 'bg-white/40' : 'bg-slate-50/30'
                         }`
                   }`}>
                     <td className="py-5 px-6">
                       <input
                         type="checkbox"
                         checked={selectedHotels.includes(hotel.id)}
                         onChange={() => handleSelectHotel(hotel.id)}
                         className="w-5 h-5 text-blue-600 bg-white border-2 border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all duration-200 cursor-pointer"
                       />
                     </td>
                     <td className={`py-5 px-6 font-bold text-base ${
                       isDark ? 'text-white' : 'text-slate-900'
                     }`}>{hotel.name}</td>
                     <td className={`py-5 px-6 font-semibold ${
                       isDark ? 'text-gray-300' : 'text-slate-700'
                     }`}>{hotel.code}</td>
                     <td className={`py-5 px-6 font-medium ${
                       isDark ? 'text-gray-400' : 'text-slate-600'
                     }`}>{hotel.altName || '-'}</td>
                     <td className={`py-5 px-6 font-medium ${
                       isDark ? 'text-gray-400' : 'text-slate-600'
                     }`}>{hotel.address || '-'}</td>
                     <td className={`py-5 px-6 font-medium ${
                       isDark ? 'text-gray-400' : 'text-slate-600'
                     }`}>{hotel.location || '-'}</td>
                     <td className="py-5 px-6 text-slate-600">
                       <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 border border-blue-300/50 shadow-sm">
                         {hotel.roomCount || 0}
                       </span>
                     </td>
                     <td className="py-5 px-6 text-slate-600">
                       {hotel.agreements && hotel.agreements.length > 0 ? (
                         <div className="space-y-2">
                           {hotel.agreements.map((agreement) => (
                             <div key={agreement.id} className="flex items-center space-x-2">
                               <a
                                 href={`/api/hotels/${hotel.id}/agreements/${agreement.id}/download`}
                                 download={agreement.fileName}
                                 className="text-blue-600 hover:text-blue-800 text-sm font-medium underline decoration-2 underline-offset-2 flex items-center space-x-2 transition-colors duration-200"
                               >
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                 </svg>
                                 <span>{agreement.fileName}</span>
                               </a>
                               <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md">({Math.round(agreement.fileSize / 1024)}KB)</span>
                             </div>
                           ))}
                         </div>
                       ) : (
                         <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300/50 shadow-sm">
                           No files
                         </span>
                       )}
                     </td>
                     <td className="py-5 px-6">
                       <div className="flex flex-wrap gap-2">
                         <button
                           onClick={() => handleViewHotel(hotel.id)}
                           className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 border border-blue-500/30"
                         >
                           <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                           </svg>
                           {t('common.view')}
                         </button>
                         <button
                           onClick={() => handleEditHotel(hotel.id)}
                           className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 border border-amber-400/30"
                         >
                           <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                           </svg>
                           {t('common.edit')}
                         </button>
                         <button
                           onClick={() => handleDeleteHotel(hotel.id)}
                           className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 border border-red-400/30"
                         >
                           <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                           </svg>
                           {t('common.delete')}
                         </button>
                         <button
                           onClick={handlePrint}
                           className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 border border-slate-500/30"
                         >
                           <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                           </svg>
                           {t('hotels.print')}
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
                 </tbody>
               </table>
             )}
           </div>

          {(filteredHotels?.length || 0) === 0 && (
             <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-slate-200/50 shadow-lg">
               <div className="w-20 h-20 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                 <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                 </svg>
               </div>
               <p className="text-slate-600 font-semibold text-lg">
                  {(nameFilter || codeFilter) ? 
                    t('hotels.noHotelsMatch') :
                    t('hotels.noHotelsAdded')
                  }
                </p>
             </div>
           )}
         </div>

         {/* Hotel Details Modal */}
         {selectedHotelDetails && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="backdrop-blur-xl bg-white/90 border border-white/20 rounded-3xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-2xl font-semibold text-gray-900">
                   {t('hotels.hotelDetails')}
                 </h3>
                 <button
                   onClick={() => setSelectedHotelDetails(null)}
                   className="p-2 hover:bg-gray-100/50 rounded-xl transition-colors"
                 >
                   <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>
               
               <div className="space-y-6">
                 {/* Basic Information */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700">
                       {t('hotels.hotelName')}
                     </label>
                     <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800">
                       {selectedHotelDetails.name}
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700">
                       {t('hotels.hotelCode')}
                     </label>
                     <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800">
                       {selectedHotelDetails.code}
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700">
                       {t('hotels.altHotelName')}
                     </label>
                     <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800">
                       {selectedHotelDetails.altName || '-'}
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700">
                       {t('hotels.hotelAddress')}
                     </label>
                     <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800">
                       {selectedHotelDetails.address || '-'}
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700">
                       {t('hotels.location')}
                     </label>
                     <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800">
                       {selectedHotelDetails.location || '-'}
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700">
                       {t('hotels.roomCount')}
                     </label>
                     <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800">
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                         {selectedHotelDetails.roomCount || 0}
                       </span>
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700">
                       {t('hotels.createdDate')}
                     </label>
                     <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800">
                       {new Date(selectedHotelDetails.createdAt).toLocaleDateString()}
                     </div>
                   </div>
                   
                   {selectedHotelDetails.createdBy && (
                     <div className="space-y-2">
                       <label className="block text-sm font-medium text-gray-700">
                         Created By
                       </label>
                       <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800">
                         {selectedHotelDetails.createdBy.firstName && selectedHotelDetails.createdBy.lastName 
                           ? `${selectedHotelDetails.createdBy.firstName} ${selectedHotelDetails.createdBy.lastName}` 
                           : selectedHotelDetails.createdBy.username}
                       </div>
                     </div>
                   )}
                 </div>
                 
                 {/* Description Section */}
                 {(selectedHotelDetails.description || selectedHotelDetails.altDescription) && (
                   <div className="space-y-4">
                     <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                       {t('hotels.hotelDescription')}
                     </h4>
                     
                     {selectedHotelDetails.description && (
                       <div className="space-y-2">
                         <label className="block text-sm font-medium text-gray-700">
                           {t('hotels.hotelDescription')}
                         </label>
                         <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800 whitespace-pre-wrap">
                           {selectedHotelDetails.description}
                         </div>
                       </div>
                     )}
                     
                     {selectedHotelDetails.altDescription && (
                       <div className="space-y-2">
                         <label className="block text-sm font-medium text-gray-700">
                           {t('hotels.altHotelDescription')}
                         </label>
                         <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800 whitespace-pre-wrap">
                           {selectedHotelDetails.altDescription}
                         </div>
                       </div>
                     )}
                   </div>
                 )}
                 
                 {/* Agreement Files Section */}
                 <div className="space-y-6">
                   <div className="flex items-center space-x-3">
                     <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                       <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                       </svg>
                     </div>
                     <h4 className="text-xl font-bold text-slate-800">
                       {t('hotels.agreementFiles')}
                     </h4>
                   </div>
                   
                   {selectedHotelDetails.agreements && selectedHotelDetails.agreements.length > 0 ? (
                     <div className="space-y-4">
                       {selectedHotelDetails.agreements.map((agreement) => (
                         <div key={agreement.id} className="group flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-blue-50/30 border border-slate-200 rounded-2xl hover:shadow-lg hover:border-blue-300 transition-all duration-300">
                           <div className="flex items-center space-x-4">
                             <div className="flex-shrink-0">
                               <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                 </svg>
                               </div>
                             </div>
                             <div className="flex-1 min-w-0">
                               <p className="text-base font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors duration-300">
                                 {agreement.fileName}
                               </p>
                               <p className="text-sm font-medium text-slate-500 mt-1">
                                 {(agreement.fileSize / 1024).toFixed(1)} KB • {new Date(agreement.uploadedAt).toLocaleDateString()}
                               </p>
                             </div>
                           </div>
                           <a
                             href={`/api/hotels/${selectedHotelDetails.id}/agreements/${agreement.id}/download`}
                             download
                             className="inline-flex items-center px-5 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 group-hover:scale-105"
                           >
                             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                             </svg>
                             Download
                           </a>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl border-2 border-dashed border-slate-300">
                       <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                         <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                         </svg>
                       </div>
                       <p className="text-lg font-bold text-slate-600">No agreement files uploaded</p>
                       <p className="text-sm font-medium text-slate-500 mt-2">Agreement files will appear here once uploaded</p>
                     </div>
                   )}
                 </div>
                 
                 <div className="flex gap-4 pt-4">
                   <button
                     onClick={() => handleEditHotel(selectedHotelDetails.id)}
                     className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                   >
                     {t('common.edit')}
                   </button>
                   <button
                     onClick={() => {
                       handleDeleteHotel(selectedHotelDetails.id);
                       setSelectedHotelDetails(null);
                     }}
                     className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                   >
                     {t('common.delete')}
                   </button>
                   <button
                     onClick={handlePrint}
                     className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                   >
                     {t('hotels.print')}
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
