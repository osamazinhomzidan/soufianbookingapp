'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

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
  const [hotelName, setHotelName] = useState('');
  const [hotelCode, setHotelCode] = useState('');
  const [altHotelName, setAltHotelName] = useState('');
  const [hotelAddress, setHotelAddress] = useState('');
  const [hotelLocation, setHotelLocation] = useState('');
  const [hotelDescription, setHotelDescription] = useState('');
  const [altHotelDescription, setAltHotelDescription] = useState('');
  const [agreementFiles, setAgreementFiles] = useState<FileList | null>(null);
  const [nameFilter, setNameFilter] = useState('');
  const [codeFilter, setCodeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
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
    
    // Room filtering logic
    const roomsMatch = (() => {
      if (hasRoomsFilter === '') return true;
      if (hasRoomsFilter === 'true') {
        const hasRooms = (hotel.roomCount || 0) > 0;
        if (!hasRooms) return false;
        
        // If room count filters are specified, check if hotel meets the criteria
        const roomCount = hotel.roomCount || 0;
        
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
      }
      if (hasRoomsFilter === 'false') {
        return (hotel.roomCount || 0) === 0;
      }
      return true;
    })();
    
    return nameMatch && codeMatch && locationMatch && roomsMatch;
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
        if (agreementFiles && agreementFiles.length > 0) {
          try {
            const formData = new FormData();
            Array.from(agreementFiles).forEach(file => {
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
        setAgreementFiles(null);
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
        setHotels(hotels.map(h => h.id === editingHotel.id ? result.data! : h));
        setEditingHotel(null);
        setHotelName('');
        setHotelCode('');
        setAltHotelName('');
        setHotelAddress('');
        setHotelDescription('');
        setAltHotelDescription('');
        console.log('Hotel updated:', result.data);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-apple-blue/20 to-apple-purple/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-apple-green/20 to-apple-teal/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-apple-pink/10 to-apple-orange/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        

        {/* Error Display */}
        {error && (
          <div className="backdrop-blur-xl bg-red-50/70 border border-red-200/50 rounded-3xl shadow-2xl p-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-red-800">
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

        {/* Add/Edit Hotel Section */}
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {editingHotel ? t('hotels.editHotel') : t('hotels.addNewHotel')}
            </h2>
            <p className="text-gray-600">
              {editingHotel ? t('hotels.updateHotelDetails') : t('hotels.enterHotelDetails')}
            </p>
          </div>

          <form onSubmit={editingHotel ? handleUpdateHotel : handleAddHotel} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Hotel Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('hotels.hotelName')}
                </label>
                <input
                  type="text"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                  placeholder={t('hotels.enterHotelName')}
                  required
                />
              </div>

              {/* Hotel Code */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('hotels.hotelCode')}
                </label>
                <input
                  type="text"
                  value={hotelCode}
                  onChange={(e) => setHotelCode(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                  placeholder={t('hotels.enterHotelCode')}
                  required
                />
              </div>

              {/* Alt Hotel Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('hotels.altHotelName')}
                </label>
                <input
                  type="text"
                  value={altHotelName}
                  onChange={(e) => setAltHotelName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                  placeholder={t('hotels.enterAltName')}
                  required
                />
              </div>
            </div>

            {/* Hotel Address */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('hotels.hotelAddress')}
              </label>
              <input
                type="text"
                value={hotelAddress}
                onChange={(e) => setHotelAddress(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                placeholder={t('hotels.enterHotelAddress')}
                required
              />
            </div>

            {/* Description Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hotel Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('hotels.hotelDescription')}
                </label>
                <textarea
                  value={hotelDescription}
                  onChange={(e) => setHotelDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400 resize-none"
                  placeholder={t('hotels.enterHotelDescription')}
                />
              </div>

              {/* Alt Hotel Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('hotels.altHotelDescription')}
                </label>
                <textarea
                  value={altHotelDescription}
                  onChange={(e) => setAltHotelDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400 resize-none"
                  placeholder={t('hotels.enterAltHotelDescription')}
                />
              </div>

              {/* Location Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('hotels.location')}
                </label>
                <input
                  type="text"
                  value={hotelLocation}
                  onChange={(e) => setHotelLocation(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                  placeholder={t('hotels.enterLocation')}
                />
              </div>

              {/* Agreement Files */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('hotels.agreementFiles')}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-apple-blue transition-colors">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => setAgreementFiles(Array.from(e.target.files || []))}
                    className="hidden"
                    id="agreement-files"
                  />
                  <label htmlFor="agreement-files" className="cursor-pointer">
                    <div className="flex flex-col items-center space-y-2">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {(agreementFiles?.length || 0) > 0
                      ? `${agreementFiles?.length || 0} ${t('hotels.filesSelected')}`
                          : t('hotels.clickToUploadFiles')
                        }
                      </span>
                      <span className="text-xs text-gray-400">
                        {t('hotels.supportedFormats')}: PDF, DOC, DOCX, TXT
                      </span>
                    </div>
                  </label>
                </div>
                {(agreementFiles?.length || 0) > 0 && (
                  <div className="mt-2 space-y-1">
                    {(agreementFiles ? Array.from(agreementFiles) : []).map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (agreementFiles) {
                              const filesArray = Array.from(agreementFiles);
                              const filteredFiles = filesArray.filter((_, i) => i !== index);
                              const dt = new DataTransfer();
                              filteredFiles.forEach(file => dt.items.add(file));
                              setAgreementFiles(dt.files);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
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
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-apple-blue to-apple-purple text-white rounded-xl hover:from-apple-blue/90 hover:to-apple-purple/90 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>{editingHotel ? t('hotels.updating') : t('hotels.adding')}</span>
                  </div>
                ) : (
                  editingHotel ? t('hotels.updateHotel') : t('hotels.addHotel')
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Hotels List Section */}
         <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl p-8">
           <div className="mb-6">
             <h2 className="text-2xl font-semibold text-gray-900 mb-2">
               {t('hotels.hotelsList')}
             </h2>
             <p className="text-gray-600">
               {t('hotels.viewManageHotels')}
             </p>
           </div>

           {/* Search and Filter Section */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
                {/* Name Filter */}
                <div className="flex-1 max-w-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('hotels.filterByName')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nameFilter}
                      onChange={(e) => setNameFilter(e.target.value)}
                      className="w-full px-4 py-3 pl-10 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                      placeholder={t('hotels.searchByName')}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Code Filter */}
                <div className="flex-1 max-w-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('hotels.filterByCode')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={codeFilter}
                      onChange={(e) => setCodeFilter(e.target.value)}
                      className="w-full px-4 py-3 pl-10 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                      placeholder={t('hotels.searchByCode')}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Location Filter */}
                <div className="flex-1 max-w-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('hotels.filterByLocation')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full px-4 py-3 pl-10 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                      placeholder={t('hotels.searchByLocation')}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* General Search */}
                <div className="flex-1 max-w-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('hotels.generalSearch')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={generalSearch}
                      onChange={(e) => setGeneralSearch(e.target.value)}
                      className="w-full px-4 py-3 pl-10 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                      placeholder={t('hotels.searchAllFields')}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Second Row - Filters */}
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
                {/* Has Rooms Filter */}
                <div className="flex-1 max-w-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('hotels.roomsFilter')}
                  </label>
                  <select
                    value={hasRoomsFilter}
                    onChange={(e) => setHasRoomsFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  >
                    <option value="">{t('hotels.allHotels')}</option>
                    <option value="true">{t('hotels.hotelsWithRooms')}</option>
                    <option value="false">{t('hotels.hotelsWithoutRooms')}</option>
                  </select>
                </div>

                {/* Room Count Filters - Hide only when 'Hotels without rooms' is selected */}
                {hasRoomsFilter !== 'false' && (
                  <>
                    <div className="flex-1 max-w-sm">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('hotels.minimumRoomCount')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={minRoomCountFilter}
                        onChange={(e) => setMinRoomCountFilter(e.target.value)}
                        className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                        placeholder={t('hotels.enterMinimumRooms')}
                      />
                    </div>
                    <div className="flex-1 max-w-sm">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('hotels.maximumRoomCount')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={maxRoomCountFilter}
                        onChange={(e) => setMaxRoomCountFilter(e.target.value)}
                        className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                        placeholder={t('hotels.enterMaximumRooms')}
                      />
                    </div>
                  </>
                )}

                {/* Clear Filters Button */}
                <div className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setNameFilter('');
                      setCodeFilter('');
                      setLocationFilter('');
                      setGeneralSearch('');
                      setHasRoomsFilter('');
                      setMinRoomCountFilter('');
                      setMaxRoomCountFilter('');
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                  >
                    {t('hotels.clearFilters')}
                  </button>
                </div>

                
              </div>

              {/* Selected Hotels Actions */}
              {selectedHotels.length > 0 && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleDeleteSelected}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded-lg hover:shadow-md transition-all duration-200"
                  >
                    {`${t('hotels.deleteSelected')} (${selectedHotels.length})`}
                  </button>
                  <button
                    onClick={handlePrintSelected}
                    className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm rounded-lg hover:shadow-md transition-all duration-200"
                  >
                    {`${t('hotels.printSelected')} (${selectedHotels.length})`}
                  </button>
                </div>
              )}
            </div>

          {/* Hotels Table */}
           <div className="overflow-x-auto">
             {loading ? (
               <div className="flex justify-center items-center py-12">
                 <div className="flex items-center space-x-3">
                   <svg className="animate-spin h-8 w-8 text-apple-blue" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                   </svg>
                   <span className="text-gray-600 font-medium">{t('common.loading')}</span>
                 </div>
               </div>
             ) : (
               <table className="w-full">
                 <thead>
                   <tr className="border-b border-gray-200/30">
                     <th className="text-left py-4 px-4 font-semibold text-gray-700 w-12">
                       <input
                         type="checkbox"
                         checked={selectedHotels.length === (filteredHotels?.length || 0) && (filteredHotels?.length || 0) > 0}
                         onChange={handleSelectAllHotels}
                         className="w-4 h-4 text-apple-blue bg-white/50 border-gray-300 rounded focus:ring-apple-blue focus:ring-2"
                       />
                     </th>
                     <th className="text-left py-4 px-4 font-semibold text-gray-700">
                       {t('hotels.hotelName')}
                     </th>
                     <th className="text-left py-4 px-4 font-semibold text-gray-700">
                       {t('hotels.hotelCode')}
                     </th>
                     <th className="text-left py-4 px-4 font-semibold text-gray-700">
                       {t('hotels.altHotelName')}
                     </th>
                     <th className="text-left py-4 px-4 font-semibold text-gray-700">
                       {t('hotels.hotelAddress')}
                     </th>
                     <th className="text-left py-4 px-4 font-semibold text-gray-700">
                       {t('hotels.location')}
                     </th>
                     <th className="text-left py-4 px-4 font-semibold text-gray-700">
                       {t('hotels.roomCount')}
                     </th>
                     <th className="text-left py-4 px-4 font-semibold text-gray-700">
                       {t('hotels.agreementCount')}
                     </th>
                     <th className="text-left py-4 px-4 font-semibold text-gray-700">
                       {t('common.actions')}
                     </th>
                   </tr>
                 </thead>
                 <tbody>
                 {(filteredHotels || []).map((hotel) => (
                   <tr key={hotel.id} className={`border-b border-gray-100/50 hover:bg-white/30 transition-colors ${
                     selectedHotels.includes(hotel.id) ? 'bg-apple-blue/10' : ''
                   }`}>
                     <td className="py-4 px-4">
                       <input
                         type="checkbox"
                         checked={selectedHotels.includes(hotel.id)}
                         onChange={() => handleSelectHotel(hotel.id)}
                         className="w-4 h-4 text-apple-blue bg-white/50 border-gray-300 rounded focus:ring-apple-blue focus:ring-2"
                       />
                     </td>
                     <td className="py-4 px-4 text-gray-800 font-medium">{hotel.name}</td>
                     <td className="py-4 px-4 text-gray-600">{hotel.code}</td>
                     <td className="py-4 px-4 text-gray-600">{hotel.altName || '-'}</td>
                     <td className="py-4 px-4 text-gray-600">{hotel.address || '-'}</td>
                     <td className="py-4 px-4 text-gray-600">{hotel.location || '-'}</td>
                     <td className="py-4 px-4 text-gray-600">
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                         {hotel.roomCount || 0}
                       </span>
                     </td>
                     <td className="py-4 px-4 text-gray-600">
                       {hotel.agreements && hotel.agreements.length > 0 ? (
                         <div className="space-y-1">
                           {hotel.agreements.map((agreement) => (
                             <div key={agreement.id} className="flex items-center space-x-2">
                               <a
                                 href={`/api/hotels/${hotel.id}/agreements/${agreement.id}/download`}
                                 download={agreement.fileName}
                                 className="text-apple-blue hover:text-apple-purple text-sm underline flex items-center space-x-1"
                               >
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                 </svg>
                                 <span>{agreement.fileName}</span>
                               </a>
                               <span className="text-xs text-gray-400">({Math.round(agreement.fileSize / 1024)}KB)</span>
                             </div>
                           ))}
                         </div>
                       ) : (
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                           No files
                         </span>
                       )}
                     </td>
                     <td className="py-4 px-4">
                       <div className="flex space-x-2">
                         <button
                           onClick={() => handleViewHotel(hotel.id)}
                           className="px-3 py-1 bg-gradient-to-r from-apple-blue to-apple-purple text-white text-sm rounded-lg hover:shadow-md transition-all duration-200"
                         >
                           {t('common.view')}
                         </button>
                         <button
                           onClick={() => handleEditHotel(hotel.id)}
                           className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-sm rounded-lg hover:shadow-md transition-all duration-200"
                         >
                           {t('common.edit')}
                         </button>
                         <button
                           onClick={() => handleDeleteHotel(hotel.id)}
                           className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded-lg hover:shadow-md transition-all duration-200"
                         >
                           {t('common.delete')}
                         </button>
                         <button
                           onClick={handlePrint}
                           className="px-3 py-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm rounded-lg hover:shadow-md transition-all duration-200"
                         >
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
             <div className="text-center py-12">
               <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                 <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                 </svg>
               </div>
               <p className="text-gray-500">
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
                 <div className="space-y-4">
                   <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                     {t('hotels.agreementFiles')}
                   </h4>
                   
                   {selectedHotelDetails.agreements && selectedHotelDetails.agreements.length > 0 ? (
                     <div className="space-y-3">
                       {selectedHotelDetails.agreements.map((agreement) => (
                         <div key={agreement.id} className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-200/50 rounded-xl">
                           <div className="flex items-center space-x-3">
                             <div className="flex-shrink-0">
                               <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                               </svg>
                             </div>
                             <div className="flex-1 min-w-0">
                               <p className="text-sm font-medium text-gray-900 truncate">
                                 {agreement.fileName}
                               </p>
                               <p className="text-xs text-gray-500">
                                 {(agreement.fileSize / 1024).toFixed(1)} KB • {new Date(agreement.uploadedAt).toLocaleDateString()}
                               </p>
                             </div>
                           </div>
                           <a
                             href={`/api/hotels/${selectedHotelDetails.id}/agreements/${agreement.id}/download`}
                             download
                             className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors"
                           >
                             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                             </svg>
                             Download
                           </a>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-center py-8 text-gray-500">
                       <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                       </svg>
                       <p>No agreement files uploaded</p>
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

        {/* Floating elements for extra visual appeal */}
        <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-apple-pink/30 to-apple-orange/30 rounded-full blur-sm animate-pulse"></div>
        <div className="absolute -bottom-6 -right-6 w-8 h-8 bg-gradient-to-br from-apple-green/30 to-apple-teal/30 rounded-full blur-sm animate-pulse delay-1000"></div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
