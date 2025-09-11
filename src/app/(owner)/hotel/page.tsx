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
      <div className={`h-screen overflow-hidden transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-900' 
          : 'bg-gray-50'
      }`}>
        <div className="h-full flex flex-col p-2 sm:p-4 lg:p-6 gap-3 sm:gap-4 lg:gap-6">
          {/* Error Display */}
          {error && (
            <div className={`rounded-lg shadow-sm p-3 sm:p-4 ${
              isDark 
                ? 'bg-red-900/80 border border-red-700/50' 
                : 'bg-red-50 border border-red-200'
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
                      
                      {/* Clear Filters Button */}
                      <div className="mt-3 flex justify-center">
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
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center space-x-2 border ${
                            isDark
                              ? 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>{t('hotels.clearFilters')}</span>
                        </button>
                      </div>
                    </div>
          </div>
        )}

          {/* Main Content Layout */}
          <div className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6 min-h-0">
            {/* Add/Edit Hotel Section - Left Side */}
            <div className="lg:w-80 xl:w-96 flex-shrink-0">
              <div className={`border rounded-xl shadow-lg p-3 sm:p-4 h-fit backdrop-blur-sm ${
                isDark 
                  ? 'bg-gradient-to-br from-gray-800/95 to-gray-900/95 border-gray-700/50' 
                  : 'bg-gradient-to-br from-white/95 to-gray-50/95 border-gray-200/50'
              }`}>
          <form onSubmit={editingHotel ? handleUpdateHotel : handleAddHotel} className="space-y-1">
            {/* All inputs in vertical layout */}
            <div className="space-y-1">
              {/* Hotel Name */}
              <div>
                <div className="relative">
                  <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <input
                    type="text"
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    className={`w-full pl-10 pr-4 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm font-medium min-h-[2rem] ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400' 
                        : 'bg-white/80 border-gray-300/50 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder={t('hotels.enterHotelName')}
                    required
                  />
                </div>
              </div>

              {/* Alt Hotel Name */}
              <div>
                <div className="relative">
                  <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <input
                    type="text"
                    value={altHotelName}
                    onChange={(e) => setAltHotelName(e.target.value)}
                    className={`w-full pl-10 pr-4 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm font-medium min-h-[2rem] ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400' 
                        : 'bg-white/80 border-gray-300/50 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder={t('hotels.enterAltName')}
                    required
                  />
                </div>
              </div>

              {/* Hotel Code */}
              <div>
                <div className="relative">
                  <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <input
                    type="text"
                    value={hotelCode}
                    onChange={(e) => setHotelCode(e.target.value)}
                    className={`w-full pl-10 pr-4 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm font-medium min-h-[2rem] ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400' 
                        : 'bg-white/80 border-gray-300/50 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder={t('hotels.enterHotelCode')}
                    required
                  />
                </div>
              </div>

              {/* Hotel Address */}
              <div>
                <div className="relative">
                  <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="text"
                    value={hotelAddress}
                    onChange={(e) => setHotelAddress(e.target.value)}
                    className={`w-full pl-10 pr-4 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm font-medium min-h-[2rem] ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400' 
                        : 'bg-white/80 border-gray-300/50 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder={t('hotels.enterHotelAddress')}
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <div className="relative">
                  <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <input
                    type="text"
                    value={hotelLocation}
                    onChange={(e) => setHotelLocation(e.target.value)}
                    className={`w-full pl-10 pr-4 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm font-medium min-h-[2rem] ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400' 
                        : 'bg-white/80 border-gray-300/50 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder={t('hotels.enterLocation')}
                  />
                </div>
              </div>

              {/* Hotel Description */}
              <div>
                <div className="relative">
                  <svg className={`absolute left-3 top-3 w-4 h-4 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <textarea
                    value={hotelDescription}
                    onChange={(e) => setHotelDescription(e.target.value)}
                    rows={1}
                    className={`w-full pl-10 pr-4 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm font-medium resize-none ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400' 
                        : 'bg-white/80 border-gray-300/50 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder={t('hotels.enterHotelDescription')}
                  />
                </div>
              </div>

              {/* Alt Hotel Description */}
              <div>
                <div className="relative">
                  <svg className={`absolute left-3 top-3 w-4 h-4 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <textarea
                    value={altHotelDescription}
                    onChange={(e) => setAltHotelDescription(e.target.value)}
                    rows={1}
                    className={`w-full pl-10 pr-4 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm font-medium resize-none ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400' 
                        : 'bg-white/80 border-gray-300/50 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder={t('hotels.enterAltHotelDescription')}
                  />
                </div>
              </div>
            </div>



              {/* File Upload Section */}
              <div>
                <div className={`relative border-2 border-dashed rounded-lg p-2 text-center transition-all hover:scale-[1.02] ${
                  isDark 
                    ? 'border-gray-600/50 hover:border-blue-500/50 bg-gray-800/30' 
                    : 'border-gray-300/50 hover:border-blue-400/50 bg-gray-50/30'
                }`}>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files || []);
                      setAgreementFiles(prev => [...prev, ...newFiles]);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="agreement-files"
                  />
                  <div className="space-y-0.5">
                    <svg className={`mx-auto w-6 h-6 ${
                      isDark ? 'text-blue-400' : 'text-blue-500'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className={`text-sm font-semibold ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {agreementFiles.length > 0
                        ? `${agreementFiles.length} files selected`
                        : 'Upload Files'
                      }
                    </p>
                    <p className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      PDF, DOC, DOCX, TXT
                    </p>
                  </div>
                </div>
                {agreementFiles.length > 0 && (
                  <div className="mt-1 space-y-0.5 max-h-12 overflow-y-auto">
                    {agreementFiles.map((file, index) => (
                      <div key={index} className={`flex items-center justify-between px-2 py-1 rounded text-xs font-medium ${
                        isDark 
                          ? 'bg-gray-700/70 text-gray-200' 
                          : 'bg-gray-100/70 text-gray-800'
                      }`}>
                        <span className="truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAgreementFiles(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="ml-1 text-red-500 hover:text-red-600 transition-colors text-sm font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm min-h-[2.25rem] transition-all duration-300 focus:outline-none focus:ring-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white focus:ring-blue-300/50'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{editingHotel ? t('hotels.updating') : t('hotels.adding')}</span>
                  </div>
                ) : (
                  <span>{editingHotel ? t('hotels.updateHotel') : t('hotels.addHotel')}</span>
                )}
              </button>
              
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm min-h-[2.25rem] transition-all duration-300 focus:outline-none focus:ring-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${
                  isDark
                    ? 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white focus:ring-gray-500/50'
                    : 'bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 focus:ring-gray-300/50'
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
                {editingHotel ? t('common.cancel') : t('hotels.clear')}
              </button>
            </div> 
          </form>
            </div>
          </div>

            {/* Hotels List Section - Right Side */}
            <div className="flex-1 min-w-0">
              <div className={`border rounded-lg p-3 sm:p-4 h-full flex flex-col ${
                isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
        
          {/* Search and Filter Section */}
          <div className="flex-shrink-0">
            {/* Modern Minimalistic Filter Bar */}
            <div className="mb-4">
              <div className={`flex flex-wrap items-center gap-3 p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                isDark 
                  ? 'bg-gray-800/50 border-gray-700/50' 
                  : 'bg-white/80 border-gray-200/60'
              }`}>
                {/* Name Filter */}
                 <div className="relative min-w-[140px] flex-1">
                   <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                   </svg>
                   <input
                     type="text"
                     value={nameFilter}
                     onChange={(e) => setNameFilter(e.target.value)}
                     className={`w-full pl-7 pr-2 py-1.5 border rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-300 placeholder:font-bold ${
                       isDark 
                         ? 'bg-gray-800/60 border-gray-600/50 placeholder-gray-400 text-white focus:bg-gray-800/80' 
                         : 'bg-white/90 border-gray-200/50 placeholder-gray-500 text-gray-700 focus:bg-white'
                     }`}
                     placeholder={t('hotels.searchByName')}
                   />
                 </div>

                {/* Code Filter */}
                 <div className="relative min-w-[120px] flex-1">
                   <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                   </svg>
                   <input
                     type="text"
                     value={codeFilter}
                     onChange={(e) => setCodeFilter(e.target.value)}
                     className={`w-full pl-7 pr-2 py-1.5 border rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-300 placeholder:font-bold ${
                       isDark 
                         ? 'bg-gray-800/60 border-gray-600/50 placeholder-gray-400 text-white focus:bg-gray-800/80' 
                         : 'bg-white/90 border-gray-200/50 placeholder-gray-500 text-gray-700 focus:bg-white'
                     }`}
                     placeholder={t('hotels.searchByCode')}
                   />
                 </div>

                {/* Location Filter */}
                 <div className="relative min-w-[140px] flex-1">
                   <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                   </svg>
                   <input
                     type="text"
                     value={locationFilter}
                     onChange={(e) => setLocationFilter(e.target.value)}
                     className={`w-full pl-7 pr-2 py-1.5 border rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-300 placeholder:font-bold ${
                       isDark 
                         ? 'bg-gray-800/60 border-gray-600/50 placeholder-gray-400 text-white focus:bg-gray-800/80' 
                         : 'bg-white/90 border-gray-200/50 placeholder-gray-500 text-gray-700 focus:bg-white'
                     }`}
                     placeholder={t('hotels.searchByLocation')}
                   />
                 </div>

                {/* Address Filter */}
                 <div className="relative min-w-[140px] flex-1">
                   <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                   </svg>
                   <input
                     type="text"
                     value={addressFilter}
                     onChange={(e) => setAddressFilter(e.target.value)}
                     className={`w-full pl-7 pr-2 py-1.5 border rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-300 placeholder:font-bold ${
                       isDark 
                         ? 'bg-gray-800/60 border-gray-600/50 placeholder-gray-400 text-white focus:bg-gray-800/80' 
                         : 'bg-white/90 border-gray-200/50 placeholder-gray-500 text-gray-700 focus:bg-white'
                     }`}
                     placeholder="Search by address"
                   />
                 </div>

                {/* Rooms Filter */}
                 <div className="relative min-w-[100px]">
                   <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                   </svg>
                   <select
                     value={hasRoomsFilter}
                     onChange={(e) => setHasRoomsFilter(e.target.value)}
                     className={`w-full pl-7 pr-5 py-1.5 border rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-300 cursor-pointer appearance-none ${
                       isDark 
                         ? 'bg-gray-800/60 border-gray-600/50 text-white focus:bg-gray-800/80' 
                         : 'bg-white/90 border-gray-200/50 text-gray-700 focus:bg-white'
                     }`}
                   >
                     <option value="">{t('hotels.allHotels')}</option>
                     <option value="true">{t('hotels.hotelsWithRooms')}</option>
                     <option value="false">{t('hotels.hotelsWithoutRooms')}</option>
                   </select>
                   <svg className="absolute right-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                   </svg>
                 </div>

                {/* Room Count Filters */}
                {hasRoomsFilter !== 'false' && (
                  <>
                    <div className="relative min-w-[80px]">
                       <input
                         type="number"
                         min="0"
                         value={minRoomCountFilter}
                         onChange={(e) => setMinRoomCountFilter(e.target.value)}
                         className={`w-full px-2 py-1.5 border rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-300 placeholder:font-bold ${
                           isDark 
                             ? 'bg-gray-800/60 border-gray-600/50 placeholder-gray-400 text-white focus:bg-gray-800/80' 
                             : 'bg-white/90 border-gray-200/50 placeholder-gray-500 text-gray-700 focus:bg-white'
                         }`}
                         placeholder="Min"
                       />
                     </div>
                     <div className="relative min-w-[80px]">
                       <input
                         type="number"
                         min="0"
                         value={maxRoomCountFilter}
                         onChange={(e) => setMaxRoomCountFilter(e.target.value)}
                         className={`w-full px-2 py-1.5 border rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-300 placeholder:font-bold ${
                           isDark 
                             ? 'bg-gray-800/60 border-gray-600/50 placeholder-gray-400 text-white focus:bg-gray-800/80' 
                             : 'bg-white/90 border-gray-200/50 placeholder-gray-500 text-gray-700 focus:bg-white'
                         }`}
                         placeholder="Max"
                       />
                     </div>
                  </>
                )}

                {/* Files Filter */}
                 <div className="relative min-w-[100px]">
                   <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
                   <select
                     value={hasFilesFilter}
                     onChange={(e) => setHasFilesFilter(e.target.value)}
                     className={`w-full pl-7 pr-5 py-1.5 border rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-300 cursor-pointer appearance-none ${
                       isDark 
                         ? 'bg-gray-800/60 border-gray-600/50 text-white focus:bg-gray-800/80' 
                         : 'bg-white/90 border-gray-200/50 text-gray-700 focus:bg-white'
                     }`}
                   >
                     <option value="">All Hotels</option>
                     <option value="true">Hotels with Files</option>
                     <option value="false">Hotels without Files</option>
                   </select>
                   <svg className="absolute right-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                   </svg>
                 </div>
                
                {/* Clear Filters Button */}
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
                  className={`p-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 ${
                    isDark
                      ? 'bg-gray-700/50 hover:bg-gray-600/60 text-gray-300 hover:text-white border border-gray-600/50'
                      : 'bg-gray-100/80 hover:bg-gray-200/80 text-gray-600 hover:text-gray-800 border border-gray-200/60'
                  }`}
                  title="Clear Filters"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

                    {/* Selected Hotels Actions */}
                    {selectedHotels.length > 0 && (
                      <div className="mt-3 flex flex-col sm:flex-row gap-2 p-3 border border-blue-200/50 rounded-lg bg-blue-50/30">
                        <div className="flex items-center space-x-2 text-blue-700 font-medium text-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{selectedHotels.length} selected</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={handleDeleteSelected}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md transition-all flex items-center justify-center space-x-2"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>{t('hotels.deleteSelected')}</span>
                          </button>
                          <button
                            onClick={handlePrintSelected}
                            className="px-3 py-1.5 bg-slate-500 hover:bg-slate-600 text-white text-sm rounded-md transition-all flex items-center justify-center space-x-2"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            <span>{t('hotels.printSelected')}</span>
                          </button>
                        </div>
                      </div>
                    )}
          </div>

          {/* Hotels Table */}
          <div className={`flex-1 flex flex-col rounded-lg border shadow-sm overflow-hidden ${
            isDark 
              ? 'border-gray-700/50 bg-gray-800/30' 
              : 'border-slate-200/50 bg-white'
          }`}>
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="flex items-center space-x-4">
                  <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className={`font-medium text-base ${
                    isDark ? 'text-gray-300' : 'text-slate-700'
                  }`}>{t('common.loading')}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Fixed Table Header */}
                <div className={`flex-shrink-0 ${
                  isDark 
                    ? 'bg-gray-700/80 border-b border-gray-600/60' 
                    : 'bg-slate-50/80 border-b border-slate-200/60'
                }`}>
                  <div className="grid grid-cols-9 gap-2 px-3 py-3 text-xs font-semibold uppercase tracking-wide">
                    <div className={`flex items-center justify-center ${
                      isDark ? 'text-gray-200' : 'text-slate-800'
                    }`}>
                      <input
                        type="checkbox"
                        checked={selectedHotels.length === (filteredHotels?.length || 0) && (filteredHotels?.length || 0) > 0}
                        onChange={handleSelectAllHotels}
                        className="w-4 h-4 text-blue-600 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-600 transition-all cursor-pointer"
                      />
                    </div>
                    <div className={`text-left ${
                      isDark ? 'text-gray-200' : 'text-slate-800'
                    }`}>
                      {t('hotels.hotelName')}
                    </div>
                    <div className={`text-left ${
                      isDark ? 'text-gray-200' : 'text-slate-800'
                    }`}>
                      {t('hotels.hotelCode')}
                    </div>
                    <div className={`text-left ${
                      isDark ? 'text-gray-200' : 'text-slate-800'
                    }`}>
                      {t('hotels.altHotelName')}
                    </div>
                    <div className={`text-left ${
                      isDark ? 'text-gray-200' : 'text-slate-800'
                    }`}>
                      {t('hotels.hotelAddress')}
                    </div>
                    <div className={`text-left ${
                      isDark ? 'text-gray-200' : 'text-slate-800'
                    }`}>
                      {t('hotels.location')}
                    </div>
                    <div className={`text-center ${
                      isDark ? 'text-gray-200' : 'text-slate-800'
                    }`}>
                      {t('hotels.roomCount')}
                    </div>
                    <div className={`text-center ${
                      isDark ? 'text-gray-200' : 'text-slate-800'
                    }`}>
                      {t('hotels.agreementCount')}
                    </div>
                    <div className={`text-center ${
                      isDark ? 'text-gray-200' : 'text-slate-800'
                    }`}>
                      {t('common.actions')}
                    </div>
                  </div>
                </div>
                
                {/* Scrollable Table Body */}
                <div className="flex-1 overflow-y-auto">
                  <div className={`divide-y ${
                    isDark ? 'divide-gray-600/40' : 'divide-slate-200/40'
                  }`}>

                    {(filteredHotels || []).map((hotel, index) => (
                      <div key={hotel.id} className={`grid grid-cols-9 gap-2 px-3 py-3 transition-all ${
                        isDark 
                          ? `hover:bg-gray-700/50 ${
                              selectedHotels.includes(hotel.id) 
                                ? 'bg-gray-700/60' 
                                : ''
                            }` 
                          : `hover:bg-slate-50/80 ${
                              selectedHotels.includes(hotel.id) 
                                ? 'bg-blue-50/60' 
                                : ''
                            }`
                      }`}>
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedHotels.includes(hotel.id)}
                            onChange={() => handleSelectHotel(hotel.id)}
                            className="w-4 h-4 text-blue-600 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-600 transition-all cursor-pointer"
                          />
                        </div>
                        <div className={`font-medium text-sm break-words ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>{hotel.name}</div>
                        <div className={`font-medium text-sm break-words ${
                          isDark ? 'text-gray-300' : 'text-slate-700'
                        }`}>{hotel.code}</div>
                        <div className={`text-sm break-words ${
                          isDark ? 'text-gray-400' : 'text-slate-600'
                        }`}>{hotel.altName || '-'}</div>
                        <div className={`text-sm break-words ${
                          isDark ? 'text-gray-400' : 'text-slate-600'
                        }`}>{hotel.address || '-'}</div>
                        <div className={`text-sm break-words ${
                          isDark ? 'text-gray-400' : 'text-slate-600'
                        }`}>{hotel.location || '-'}</div>
                        <div className="flex justify-center items-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            {hotel.roomCount || 0}
                          </span>
                        </div>
                        <div className="flex justify-center items-center">
                          {hotel.agreements && hotel.agreements.length > 0 ? (
                            <div className="space-y-1 max-w-full">
                              {hotel.agreements.slice(0, 2).map((agreement, index) => (
                                <div key={agreement.id} className="flex items-center space-x-1">
                                  <a
                                    href={`/api/hotels/${hotel.id}/agreements/${agreement.id}/download`}
                                    download={agreement.fileName}
                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium underline break-words transition-colors"
                                  >
                                    <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    File {index + 1}
                                  </a>
                                </div>
                              ))}
                              {hotel.agreements.length > 2 && (
                                <span className="text-xs text-gray-500">+{hotel.agreements.length - 2} more</span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                              No files
                            </span>
                          )}
                        </div>
                        <div className="flex justify-center items-center">
                          <div className="flex flex-col sm:flex-row gap-1 w-20 sm:w-auto">
                            <button
                              onClick={() => handleViewHotel(hotel.id)}
                              className="w-6 h-6 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-all flex items-center justify-center flex-shrink-0"
                              title={t('common.view')}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEditHotel(hotel.id)}
                              className="w-6 h-6 bg-amber-500 text-white text-xs font-medium rounded hover:bg-amber-600 transition-all flex items-center justify-center flex-shrink-0"
                              title={t('common.edit')}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteHotel(hotel.id)}
                              className="w-6 h-6 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 transition-all flex items-center justify-center flex-shrink-0"
                              title={t('common.delete')}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
             )}
           </div>

            {(filteredHotels?.length || 0) === 0 && (
              <div className={`text-center py-16 rounded-lg border ${
                isDark 
                  ? 'border-gray-700/50 bg-gray-800/30' 
                  : 'border-slate-200/50 bg-white'
              }`}>
                <div className={`w-16 h-16 mx-auto rounded-lg flex items-center justify-center mb-4 ${
                  isDark 
                    ? 'bg-gray-700/50' 
                    : 'bg-slate-100'
                }`}>
                  <svg className={`w-8 h-8 ${
                    isDark ? 'text-gray-400' : 'text-slate-500'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className={`font-medium text-base ${
                  isDark ? 'text-gray-300' : 'text-slate-600'
                }`}>
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
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
              <div className={`rounded-lg shadow-xl p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto ${
                isDark 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white border border-gray-200'
              }`}>
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-2xl font-semibold text-gray-900">
                   {t('hotels.hotelDetails')}
                 </h3>
                 <button
                   onClick={() => setSelectedHotelDetails(null)}
                   className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                 >
                   <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>
               
               <div className="space-y-6">
                 {/* Basic Information */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                   <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700">
                       {t('hotels.hotelName')}
                     </label>
                     <div className="px-4 py-3 border border-gray-200/50 rounded-xl text-gray-800">
                       {selectedHotelDetails.name}
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700">
                       {t('hotels.hotelCode')}
                     </label>
                     <div className="px-4 py-3 border border-gray-200/50 rounded-xl text-gray-800">
                       {selectedHotelDetails.code}
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700">
                       {t('hotels.altHotelName')}
                     </label>
                     <div className="px-4 py-3 border border-gray-200/50 rounded-xl text-gray-800">
                       {selectedHotelDetails.altName || '-'}
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700">
                       {t('hotels.hotelAddress')}
                     </label>
                     <div className="px-4 py-3 border border-gray-200/50 rounded-xl text-gray-800">
                       {selectedHotelDetails.address || '-'}
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700">
                       {t('hotels.location')}
                     </label>
                     <div className="px-4 py-3 border border-gray-200/50 rounded-xl text-gray-800">
                       {selectedHotelDetails.location || '-'}
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700">
                       {t('hotels.roomCount')}
                     </label>
                     <div className="px-4 py-3 border border-gray-200/50 rounded-xl text-gray-800">
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                         {selectedHotelDetails.roomCount || 0}
                       </span>
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700">
                       {t('hotels.createdDate')}
                     </label>
                     <div className="px-4 py-3 border border-gray-200/50 rounded-xl text-gray-800">
                       {new Date(selectedHotelDetails.createdAt).toLocaleDateString()}
                     </div>
                   </div>
                   
                   {selectedHotelDetails.createdBy && (
                     <div className="space-y-2">
                       <label className="block text-sm font-medium text-gray-700">
                         Created By
                       </label>
                       <div className="px-4 py-3 border border-gray-200/50 rounded-xl text-gray-800">
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
                         <div className="px-4 py-3 border border-gray-200/50 rounded-xl text-gray-800 whitespace-pre-wrap">
                           {selectedHotelDetails.description}
                         </div>
                       </div>
                     )}
                     
                     {selectedHotelDetails.altDescription && (
                       <div className="space-y-2">
                         <label className="block text-sm font-medium text-gray-700">
                           {t('hotels.altHotelDescription')}
                         </label>
                         <div className="px-4 py-3 border border-gray-200/50 rounded-xl text-gray-800 whitespace-pre-wrap">
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
                 
                 <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
                   <button
                     onClick={() => handleEditHotel(selectedHotelDetails.id)}
                     className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium text-sm sm:text-base min-h-[2.75rem] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                   >
                     {t('common.edit')}
                   </button>
                   <button
                     onClick={() => {
                       handleDeleteHotel(selectedHotelDetails.id);
                       setSelectedHotelDetails(null);
                     }}
                     className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium text-sm sm:text-base min-h-[2.75rem] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                   >
                     {t('common.delete')}
                   </button>
                   <button
                     onClick={handlePrint}
                     className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium text-sm sm:text-base min-h-[2.75rem] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                   >
                     {t('hotels.print')}
                   </button>
                 </div>
               </div>
             </div>
           </div>
         )}
          </div>
          
        </div>

        </div></div>
      
    </ProtectedRoute>
  );
}
