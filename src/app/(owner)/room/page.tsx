'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

interface Room {
  id: string;
  hotelId: string;
  hotelName?: string;
  roomType: string;
  roomTypeDescription: string;
  altDescription: string;
  basePrice: number;
  alternativePrice?: number;
  price?: number; // For backward compatibility
  quantity: number;
  boardType: 'Room only' | 'Bed & breakfast' | 'Half board' | 'Full board';
  size?: string;
  capacity?: number;
  floor?: number;
  isActive: boolean;
  seasonalPrices?: {
    startDate: string;
    endDate: string;
    price: number;
  }[];
  createdAt: string;
  updatedAt: string;
  hotel?: {
    id: string;
    name: string;
    code: string;
  };
  createdBy?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
}

interface Hotel {
  id: string;
  name: string;
  altName?: string;
  code: string;
  description?: string;
  altDescription?: string;
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

export default function Room() {
  const { language } = useLanguage();
  const { t } = useTranslation();
  
  // State management
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form states
  const [hotelId, setHotelId] = useState('');
  const [roomType, setRoomType] = useState('');
  const [roomTypeDescription, setRoomTypeDescription] = useState('');
  const [altDescription, setAltDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [boardType, setBoardType] = useState<'Room only' | 'Bed & breakfast' | 'Half board' | 'Full board'>('Room only');
  const [hasAlternativePrice, setHasAlternativePrice] = useState(true);
  const [alternativePrice, setAlternativePrice] = useState('');
  
  // Filter and selection states
  const [nameFilter, setNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [hotelFilter, setHotelFilter] = useState('');
  const [boardTypeFilter, setBoardTypeFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [maxQuantity, setMaxQuantity] = useState('');
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedRoomDetails, setSelectedRoomDetails] = useState<Room | null>(null);

  // API Functions
  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hotels');
      const result: ApiResponse<Hotel[]> = await response.json();
      
      if (result.success && result.data) {
        setHotels(result.data);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
      // Fallback to sample data
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rooms');
      const result: ApiResponse<Room[]> = await response.json();
      
      if (result.success && result.data) {
        setRooms(result.data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchHotels();
    fetchRooms();
  }, []);

  // Filter rooms based on search inputs
  const filteredRooms = rooms.filter(room => {
    const nameMatch = nameFilter === '' || 
      room.roomType?.toLowerCase().includes(nameFilter.toLowerCase()) ||
      room.hotelName?.toLowerCase().includes(nameFilter.toLowerCase()) ||
      room.altDescription?.toLowerCase().includes(nameFilter.toLowerCase()) ||
      room.roomTypeDescription?.toLowerCase().includes(nameFilter.toLowerCase()) ||
      room.hotel?.name?.toLowerCase().includes(nameFilter.toLowerCase());
    
    const typeMatch = typeFilter === '' || 
      room.boardType?.toLowerCase().includes(typeFilter.toLowerCase()) ||
      room.roomType?.toLowerCase().includes(typeFilter.toLowerCase());
    
    const hotelMatch = hotelFilter === '' || 
      room.hotelId === hotelFilter ||
      room.hotel?.name?.toLowerCase().includes(hotelFilter.toLowerCase()) ||
      room.hotelName?.toLowerCase().includes(hotelFilter.toLowerCase());
    
    const boardMatch = boardTypeFilter === '' || 
      room.boardType === boardTypeFilter;
    
    const priceMatch = (
      (minPrice === '' || (room.basePrice && room.basePrice >= parseFloat(minPrice))) &&
      (maxPrice === '' || (room.basePrice && room.basePrice <= parseFloat(maxPrice)))
    );
    
    const quantityMatch = (
      (minQuantity === '' || (room.quantity && room.quantity >= parseInt(minQuantity))) &&
      (maxQuantity === '' || (room.quantity && room.quantity <= parseInt(maxQuantity)))
    );
    
    return nameMatch && typeMatch && hotelMatch && boardMatch && priceMatch && quantityMatch;
  });

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hotelId || !roomType || !roomTypeDescription || !price || !quantity) {
      setMessage({ type: 'error', text: t('rooms.fillAllFields') });
      return;
    }

    const selectedHotel = hotels.find(h => h.id === hotelId);
    if (!selectedHotel) {
      setMessage({ type: 'error', text: t('rooms.selectValidHotel') });
      return;
    }

    try {
      setLoading(true);
      
      // Convert board type to API format
      const boardTypeMap: { [key: string]: string } = {
        [t('rooms.roomOnly')]: 'ROOM_ONLY',
        [t('rooms.bedBreakfast')]: 'BED_BREAKFAST',
        [t('rooms.halfBoard')]: 'HALF_BOARD',
        [t('rooms.fullBoard')]: 'FULL_BOARD'
      };

      const roomData = {
        hotelId,
        roomType,
        roomTypeDescription,
        altDescription: altDescription || null,
        basePrice: parseFloat(price),
        alternativePrice: hasAlternativePrice && alternativePrice ? parseFloat(alternativePrice) : null,
        quantity: parseInt(quantity),
        boardType: boardTypeMap[boardType] || 'ROOM_ONLY',
      };

      let response;
      let successMessage;
      
      if (editingRoomId) {
        // Update existing room
        response = await fetch(`/api/rooms/${editingRoomId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(roomData),
        });
        successMessage = t('rooms.roomUpdatedSuccessfully');
      } else {
        // Create new room
        response = await fetch('/api/rooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(roomData),
        });
        successMessage = t('rooms.roomAddedSuccessfully');
      }

      const result: ApiResponse<Room> = await response.json();

      if (result.success && result.data) {
        // Add hotel name for display
        const roomWithHotelName = {
          ...result.data,
          hotelName: selectedHotel.name,
          price: result.data.basePrice // For backward compatibility
        };
        
        if (editingRoomId) {
          // Update existing room in the list
          setRooms(rooms.map(room => 
            room.id === editingRoomId ? roomWithHotelName : room
          ));
          setEditingRoomId(null);
        } else {
          // Add new room to the list
          setRooms([...rooms, roomWithHotelName]);
        }
        
        // Reset form
        setHotelId('');
        setRoomType('');
        setRoomTypeDescription('');
        setAltDescription('');
        setPrice('');
        setQuantity('1');
        setBoardType(t('rooms.roomOnly'));
        setHasAlternativePrice(true);
        setAlternativePrice('');
        
        setMessage({ type: 'success', text: successMessage });
      } else {
        setMessage({ type: 'error', text: result.message || t('rooms.errorAddingRoom') });
      }
    } catch (error) {
      console.error('Error saving room:', error);
      setMessage({ type: 'error', text: t('rooms.errorAddingRoom') });
    } finally {
      setLoading(false);
    }
  };

  // State for edit mode
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  const handleEditRoom = async (id: string) => {
    try {
      const response = await fetch(`/api/rooms/${id}`);
      const result: ApiResponse<Room> = await response.json();
      
      if (result.success && result.data) {
        const room = result.data;
        
        // Convert board type from API format to display format
        const boardTypeMap: { [key: string]: string } = {
          'ROOM_ONLY': t('rooms.roomOnly'),
          'BED_BREAKFAST': t('rooms.bedBreakfast'),
          'HALF_BOARD': t('rooms.halfBoard'),
          'FULL_BOARD': t('rooms.fullBoard')
        };
        
        setEditingRoomId(id);
        setHotelId(room.hotelId);
        setRoomType(room.roomType);
        setRoomTypeDescription(room.roomTypeDescription);
        setAltDescription(room.altDescription || '');
        setPrice(room.basePrice.toString());
        setQuantity(room.quantity.toString());
        setBoardType(boardTypeMap[room.boardType] || t('rooms.roomOnly'));
        setHasAlternativePrice(!!room.alternativePrice);
        setAlternativePrice(room.alternativePrice?.toString() || '');
        
        setMessage({ type: 'success', text: t('rooms.roomLoadedForEdit') });
      } else {
        setMessage({ type: 'error', text: result.message || t('rooms.errorFetchingRoom') });
      }
    } catch (error) {
      console.error('Error fetching room for edit:', error);
      setMessage({ type: 'error', text: t('rooms.errorFetchingRoom') });
    }
  };

  const handleDeleteRoom = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/rooms/${id}`, {
        method: 'DELETE',
      });
      
      const result: ApiResponse<null> = await response.json();
      
      if (result.success) {
        setRooms(rooms.filter(room => room.id !== id));
        setSelectedRooms(selectedRooms.filter(selectedId => selectedId !== id));
        setMessage({ type: 'success', text: t('rooms.roomDeletedSuccessfully') });
      } else {
        setMessage({ type: 'error', text: result.message || t('rooms.errorDeletingRoom') });
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      setMessage({ type: 'error', text: t('rooms.errorDeletingRoom') });
    } finally {
      setLoading(false);
    }
  };

  const handleViewRoom = async (id: string) => {
    try {
      const response = await fetch(`/api/rooms/${id}`);
      const result: ApiResponse<Room> = await response.json();
      
      if (result.success && result.data) {
        // Add hotel name for display
        const roomWithHotelName = {
          ...result.data,
          hotelName: result.data.hotel?.name || t('rooms.unknownHotel'),
          price: result.data.basePrice // For backward compatibility
        };
        setSelectedRoomDetails(roomWithHotelName);
      } else {
        alert(result.message || t('rooms.errorFetchingRoom'));
      }
    } catch (error) {
      console.error('Error fetching room:', error);
      alert(t('rooms.errorFetchingRoom'));
    }
  };

  const handleSelectRoom = (id: string) => {
    setSelectedRooms(prev => 
      prev.includes(id) 
        ? prev.filter(roomId => roomId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAllRooms = () => {
    if (selectedRooms.length === filteredRooms.length) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms(filteredRooms.map(room => room.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRooms.length === 0) {
      setMessage({ type: 'error', text: t('rooms.noRoomsSelected') });
      return;
    }

    try {
      setLoading(true);
      const deletePromises = selectedRooms.map(id => 
        fetch(`/api/rooms/${id}`, { method: 'DELETE' })
      );
      
      const responses = await Promise.all(deletePromises);
      const results = await Promise.all(
        responses.map(response => response.json())
      );
      
      const successfulDeletes = results.filter(result => result.success).length;
      const failedDeletes = results.length - successfulDeletes;
      
      if (successfulDeletes > 0) {
        setRooms(rooms.filter(room => !selectedRooms.includes(room.id)));
        setSelectedRooms([]);
        
        if (failedDeletes === 0) {
          setMessage({ type: 'success', text: t('rooms.selectedRoomsDeleted', { count: successfulDeletes }) });
        } else {
          setMessage({ type: 'error', text: t('rooms.partialDeleteSuccess', { success: successfulDeletes, failed: failedDeletes }) });
        }
      } else {
        setMessage({ type: 'error', text: t('rooms.errorDeletingSelectedRooms') });
      }
    } catch (error) {
      console.error('Error deleting selected rooms:', error);
      setMessage({ type: 'error', text: t('rooms.errorDeletingSelectedRooms') });
    } finally {
      setLoading(false);
    }
  };

  const handlePrintSelected = () => {
    if (selectedRooms.length === 0) {
      setMessage({ type: 'error', text: t('rooms.noRoomsSelected') });
      return;
    }
    
    const selectedRoomData = rooms.filter(room => selectedRooms.includes(room.id));
    console.log(t('rooms.printSelectedRooms'), selectedRoomData);
    setMessage({ type: 'success', text: t('rooms.printingSelectedRooms', { count: selectedRoomData.length }) });
    // Handle print selected logic
  };

  const handleDeleteAll = async () => {
    if (rooms.length === 0) {
      setMessage({ type: 'error', text: t('rooms.noRoomsToDelete') });
      return;
    }

    try {
      setLoading(true);
      const deletePromises = rooms.map(room => 
        fetch(`/api/rooms/${room.id}`, { method: 'DELETE' })
      );
      
      const responses = await Promise.all(deletePromises);
      const results = await Promise.all(
        responses.map(response => response.json())
      );
      
      const successfulDeletes = results.filter(result => result.success).length;
      const failedDeletes = results.length - successfulDeletes;
      
      if (successfulDeletes > 0) {
        setRooms([]);
        setSelectedRooms([]);
        
        if (failedDeletes === 0) {
          setMessage({ type: 'success', text: t('rooms.allRoomsDeleted', { count: successfulDeletes }) });
        } else {
          setMessage({ type: 'error', text: t('rooms.partialDeleteSuccess', { success: successfulDeletes, failed: failedDeletes }) });
        }
      } else {
        setMessage({ type: 'error', text: t('rooms.errorDeletingAllRooms') });
      }
    } catch (error) {
      console.error('Error deleting all rooms:', error);
      setMessage({ type: 'error', text: t('rooms.errorDeletingAllRooms') });
    } finally {
      setLoading(false);
    }
  };

  const handlePrintAll = () => {
    console.log('Print all rooms:', rooms);
    // Handle print all logic
  };

  const handlePrintRoom = (id: string) => {
    const room = rooms.find(r => r.id === id);
    console.log('Print room:', room);
    // Handle print room logic
  };

  const handleExit = () => {
    console.log(t('rooms.exitDashboard'));
    // Handle exit logic
  };

  return (
    <ProtectedRoute requiredRole="OWNER">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-apple-blue/20 to-apple-purple/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-apple-green/20 to-apple-teal/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-apple-pink/10 to-apple-orange/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-7xl">
        {/* Glassmorphism card */}
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl p-8 space-y-8">
          

          {/* Add New Room Section */}
          <div className="backdrop-blur-sm bg-white/50 border border-white/30 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-2 h-2 bg-gradient-to-r from-apple-green to-apple-blue rounded-full animate-pulse"></div>
              <h2 className="text-xl font-semibold text-gray-800">
                {editingRoomId ? t('rooms.editRoom') : t('rooms.addNewRoom')}
              </h2>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`mb-6 p-4 rounded-xl border ${
                message.type === 'success'
                  ? 'bg-green-50/80 border-green-200 text-green-800' 
                  : 'bg-red-50/80 border-red-200 text-red-800'
              } backdrop-blur-sm`}>
                <div className="flex items-center space-x-2">
                  {message.type === 'success' ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className="font-medium">{message.text}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleAddRoom} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Hotel Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('rooms.hotel')}
                  </label>
                  <select
                    value={hotelId}
                    onChange={(e) => setHotelId(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    required
                  >
                    <option value="">{t('rooms.selectHotel')}</option>
                    {hotels.map(hotel => (
                      <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                    ))}
                  </select>
                </div>

                {/* Room Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('rooms.roomType')}
                  </label>
                  <input
                    type="text"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                    placeholder={t('rooms.enterRoomType')}
                    required
                  />
                </div>

                {/* Board Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('rooms.boardType')}
                  </label>
                  <select
                    value={boardType}
                    onChange={(e) => setBoardType(e.target.value as any)}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  >
                    <option value="Room only">{t('rooms.roomOnly')}</option>
                    <option value="Bed & breakfast">{t('rooms.bedBreakfast')}</option>
                    <option value="Half board">{t('rooms.halfBoard')}</option>
                    <option value="Full board">{t('rooms.fullBoard')}</option>
                  </select>
                </div>

                {/* Room Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('rooms.roomDescription')}
                  </label>
                  <input
                    type="text"
                    value={roomTypeDescription}
                    onChange={(e) => setRoomTypeDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                    placeholder={t('rooms.enterRoomDescription')}
                    required
                  />
                </div>

                {/* Alt Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('rooms.altDescription')}
                  </label>
                  <input
                    type="text"
                    value={altDescription}
                    onChange={(e) => setAltDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                    placeholder={t('rooms.enterAltDescription')}
                    required
                  />
                </div>
                {/* Quantity */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('rooms.numberOfRooms')}
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                    placeholder={t('rooms.roomQuantityPlaceholder')}
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Pricing Section - Full Width */}
              <div className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg w-full">
                <div className="space-y-5 w-full">
                  {/* Main Price */}
                  <div className="space-y-3 w-full">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <div className="w-2 h-2 bg-apple-blue rounded-full"></div>
                      {t('rooms.basePrice')}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-4 bg-white/70 border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-300 backdrop-blur-sm placeholder-gray-400 text-lg font-medium shadow-sm hover:shadow-md"
                        placeholder={t('rooms.enterBasePrice')}
                        min="0"
                        step="0.01"
                        required
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-medium text-sm">
                          {t('common.currency')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Alternative Price Toggle */}
                  <div className="border-t border-gray-200/50 pt-4 w-full">
                    <div className="flex items-center justify-between p-3 bg-white/40 rounded-xl border border-gray-200/40 hover:bg-white/60 transition-all duration-200 w-full">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="hasAlternativePrice"
                          checked={hasAlternativePrice}
                          onChange={(e) => setHasAlternativePrice(e.target.checked)}
                          className="w-5 h-5 text-apple-blue bg-white/80 border-gray-300 rounded-md focus:ring-apple-blue focus:ring-2 transition-all duration-200"
                        />
                        <label htmlFor="hasAlternativePrice" className="text-sm font-semibold text-gray-700 cursor-pointer">
                          {t('rooms.enableAlternativePrice')}
                        </label>
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-100/60 px-2 py-1 rounded-full">
                        {t('common.optional')}
                      </div>
                    </div>
                    
                    {/* Alternative Price Input */}
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden w-full ${
                       hasAlternativePrice ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'
                     }`}>
                      <div className="space-y-3 w-full">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          {t('rooms.alternativePrice')}
                        </label>
                        <div className="relative w-full">
                          <input
                            type="number"
                            value={alternativePrice}
                            onChange={(e) => setAlternativePrice(e.target.value)}
                            className="w-full px-4 py-4 bg-orange-50/70 border border-orange-200/60 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm placeholder-orange-400 text-lg font-medium shadow-sm hover:shadow-md"
                            placeholder={t('rooms.enterAlternativePrice')}
                            min="0"
                            step="0.01"
                          />
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <span className="text-orange-500 font-medium text-sm">
                              {t('common.currency')}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-4 rounded-xl border border-blue-200/50 shadow-sm">
                          <p className="text-sm font-medium text-blue-800 leading-relaxed">
                            {t('rooms.alternativePriceDescription')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>



              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-apple-green to-apple-green-light text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:ring-2 focus:ring-apple-green focus:ring-offset-2"
                >
                  {editingRoomId ? t('rooms.updateRoom') : t('rooms.addRoom')}
                </button>
                {editingRoomId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRoomId(null);
                      setHotelId('');
                      setRoomType('');
                      setRoomTypeDescription('');
                      setAltDescription('');
                      setQuantity('');
                      setPrice('');
                      setAlternativePrice('');
                      setHasAlternativePrice(false);
                      setBoardType(t('rooms.roomOnly'));
                      setMessage('');
                    }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    {t('common.cancel')}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* View Rooms Section */}
          <div className="backdrop-blur-sm bg-white/50 border border-white/30 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-2 h-2 bg-gradient-to-r from-apple-purple to-apple-pink rounded-full animate-pulse"></div>
              <h2 className="text-xl font-semibold text-gray-800">
                {t('rooms.viewAddedRooms')}
              </h2>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-6 space-y-4">
              {/* First Row - Text Filters */}
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
                {/* Name Filter */}
                <div className="flex-1 max-w-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('rooms.filterByName')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nameFilter}
                      onChange={(e) => setNameFilter(e.target.value)}
                      className="w-full px-4 py-3 pl-10 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                      placeholder={t('rooms.searchRoomOrHotel')}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Type Filter */}
                <div className="flex-1 max-w-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('rooms.filterByType')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-4 py-3 pl-10 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                      placeholder={t('rooms.searchRoomType')}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Hotel Filter */}
                <div className="flex-1 max-w-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('rooms.filterByHotel')}
                  </label>
                  <select
                    value={hotelFilter}
                    onChange={(e) => setHotelFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  >
                    <option value="">{t('rooms.allHotels')}</option>
                    {hotels.map((hotel) => (
                      <option key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Second Row - Dropdown and Range Filters */}
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
                {/* Board Type Filter */}
                <div className="flex-1 max-w-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('rooms.filterByBoardType')}
                  </label>
                  <select
                    value={boardTypeFilter}
                    onChange={(e) => setBoardTypeFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  >
                    <option value="">{t('rooms.allBoardTypes')}</option>
                    <option value="Room only">{t('rooms.roomOnly')}</option>
                    <option value="Bed & breakfast">{t('rooms.bedBreakfast')}</option>
                    <option value="Half board">{t('rooms.halfBoard')}</option>
                    <option value="Full board">{t('rooms.fullBoard')}</option>
                  </select>
                </div>

                {/* Price Range Filter */}
                <div className="flex-1 max-w-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('rooms.priceRange')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-1/2 px-3 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                      placeholder={t('rooms.minPrice')}
                      min="0"
                    />
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-1/2 px-3 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                      placeholder={t('rooms.maxPrice')}
                      min="0"
                    />
                  </div>
                </div>

                {/* Quantity Range Filter */}
                <div className="flex-1 max-w-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('rooms.quantityRange')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={minQuantity}
                      onChange={(e) => setMinQuantity(e.target.value)}
                      className="w-1/2 px-3 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                      placeholder={t('rooms.minQty')}
                      min="0"
                    />
                    <input
                      type="number"
                      value={maxQuantity}
                      onChange={(e) => setMaxQuantity(e.target.value)}
                      className="w-1/2 px-3 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                      placeholder={t('rooms.maxQty')}
                      min="0"
                    />
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div className="flex-shrink-0">
                  <button
                    onClick={() => {
                      setNameFilter('');
                      setTypeFilter('');
                      setHotelFilter('');
                      setBoardTypeFilter('');
                      setMinPrice('');
                      setMaxPrice('');
                      setMinQuantity('');
                      setMaxQuantity('');
                    }}
                    className="px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium"
                >
                  {t('common.clearFilters')}
                  </button>
                </div>
              </div>

              {/* Third Row - Action Buttons */}
              <div className="flex justify-end">
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAll}
                    className="px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                  >
                    {t('rooms.deleteAll')}
                  </button>
                  <button
                    onClick={handlePrintAll}
                    className="px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:ring-2 focus:ring-gray-600 focus:ring-offset-2"
                  >
                    {t('rooms.printAll')}
                  </button>
                </div>
              </div>

              {/* Selected Rooms Actions */}
              {selectedRooms.length > 0 && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleDeleteSelected}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded-lg hover:shadow-md transition-all duration-200"
                  >
                    {t('rooms.deleteSelected')} ({selectedRooms.length})
                  </button>
                  <button
                    onClick={handlePrintSelected}
                    className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm rounded-lg hover:shadow-md transition-all duration-200"
                  >
                    {t('rooms.printSelected')} ({selectedRooms.length})
                  </button>
                </div>
              )}
            </div>

            {/* Message Display */}
            {message && (
              <div className={`mb-4 p-4 rounded-xl border ${
                message.type === 'success' 
                  ? 'bg-green-50/80 border-green-200 text-green-800' 
                  : 'bg-red-50/80 border-red-200 text-red-800'
              } backdrop-blur-sm`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{message.text}</span>
                  <button
                    onClick={() => setMessage(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Rooms Table */}
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
              ) : filteredRooms.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200/50">
                      <th className="text-left py-3 px-2">
                        <input
                          type="checkbox"
                          checked={selectedRooms.length === filteredRooms.length && filteredRooms.length > 0}
                          onChange={handleSelectAllRooms}
                          className="w-4 h-4 text-apple-blue bg-white/50 border-gray-300 rounded focus:ring-apple-blue focus:ring-2"
                        />
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm">
                        {t('rooms.hotel')}
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm">
                        {t('rooms.roomType')}
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm">
                        {t('rooms.roomDescription')}
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm">
                        {t('rooms.altDescription')}
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm">
                        {t('rooms.boardType')}
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm">
                        {t('rooms.basePrice')}
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm">
                        {t('rooms.alternativePrice')}
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm">
                        {t('rooms.quantity')}
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm">
                        {t('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRooms.map((room) => (
                      <tr key={room.id} className="border-b border-gray-100/50 hover:bg-white/30 transition-colors">
                        <td className="py-2 px-2">
                          <input
                            type="checkbox"
                            checked={selectedRooms.includes(room.id)}
                            onChange={() => handleSelectRoom(room.id)}
                            className="w-4 h-4 text-apple-blue bg-white/50 border-gray-300 rounded focus:ring-apple-blue focus:ring-2"
                          />
                        </td>
                        <td className="py-2 px-2 text-gray-600 text-sm max-w-[120px] truncate" title={room.hotelName || room.hotel?.name || t('rooms.unknownHotel')}>
                  {room.hotelName || room.hotel?.name || t('rooms.unknownHotel')}
                        </td>
                        <td className="py-2 px-2 text-gray-600 text-sm max-w-[100px] truncate" title={room.roomType}>
                          {room.roomType}
                        </td>
                        <td className="py-2 px-2 text-gray-600 text-sm max-w-[120px] truncate" title={room.roomTypeDescription}>
                          {room.roomTypeDescription}
                        </td>
                        <td className="py-2 px-2 text-gray-600 text-sm max-w-[120px] truncate" title={room.altDescription}>
                          {room.altDescription || '-'}
                        </td>
                        <td className="py-2 px-2 text-gray-600 text-sm">
                          <span className="px-2 py-1 bg-blue-100/50 text-blue-800 text-xs rounded-full whitespace-nowrap">
                            {(() => {
                              const boardTypeMap: { [key: string]: string } = {
                                'ROOM_ONLY': t('rooms.roomOnly'),
                                'BED_BREAKFAST': t('rooms.bedBreakfast'),
                                'HALF_BOARD': t('rooms.halfBoard'),
                                'FULL_BOARD': t('rooms.fullBoard')
                              };
                              return boardTypeMap[room.boardType] || room.boardType;
                            })()} 
                          </span>
                        </td>
                        <td className="py-2 px-2 text-gray-600 text-sm font-medium">
                          SAR {room.basePrice}
                        </td>
                        <td className="py-2 px-2 text-gray-600 text-sm">
                          {room.alternativePrice ? (
                            <span className="text-orange-600 font-medium">SAR {room.alternativePrice}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-gray-600 text-sm font-medium">{room.quantity}</td>
                        <td className="py-2 px-2">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleViewRoom(room.id)}
                              className="px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-md hover:shadow-md transition-all duration-200"
                              title={t('common.view')}
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => handleEditRoom(room.id)}
                              className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs rounded-md hover:shadow-md transition-all duration-200"
                              title={t('common.edit')}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteRoom(room.id)}
                              className="px-2 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-md hover:shadow-md transition-all duration-200"
                              title={t('common.delete')}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p className="text-gray-500">
                    {(nameFilter || typeFilter || hotelFilter || boardTypeFilter || minPrice || maxPrice || minQuantity || maxQuantity) ? 
                      t('rooms.noMatchingRooms') :
                      t('rooms.noRoomsAdded')
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Room Details Modal */}
      {selectedRoomDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-xl bg-white/90 border border-white/20 rounded-3xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">
                {t('rooms.roomDetails')}
              </h3>
              <button
                onClick={() => setSelectedRoomDetails(null)}
                className="p-2 hover:bg-gray-100/50 rounded-xl transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('rooms.hotel')}
                  </label>
                  <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800">
                    {selectedRoomDetails.hotelName || selectedRoomDetails.hotel?.name || t('rooms.unknownHotel')}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('rooms.roomType')}
                  </label>
                  <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800">
                    {selectedRoomDetails.roomType}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('rooms.boardType')}
                  </label>
                  <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800">
                    <span className="px-3 py-1 bg-blue-100/50 text-blue-800 text-sm rounded-full">
                      {(() => {
                        const boardTypeMap: { [key: string]: string } = {
                          'ROOM_ONLY': t('rooms.roomOnly'),
                          'BED_BREAKFAST': t('rooms.bedBreakfast'),
                          'HALF_BOARD': t('rooms.halfBoard'),
                          'FULL_BOARD': t('rooms.fullBoard')
                        };
                        return boardTypeMap[selectedRoomDetails.boardType] || selectedRoomDetails.boardType;
                      })()} 
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('rooms.basePrice')}
                  </label>
                  <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800 font-semibold">
                    SAR {selectedRoomDetails.basePrice}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('rooms.alternativePrice')}
                  </label>
                  <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800">
                    {selectedRoomDetails.alternativePrice ? (
                      <span className="text-orange-600 font-semibold">SAR {selectedRoomDetails.alternativePrice}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('rooms.quantity')}
                  </label>
                  <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800 font-semibold">
                    {selectedRoomDetails.quantity}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                  {t('common.createdDate')}
                  </label>
                  <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800">
                    {new Date(selectedRoomDetails.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                {selectedRoomDetails.createdBy && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                  {t('rooms.createdBy')}
                    </label>
                    <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800">
                      {selectedRoomDetails.createdBy.firstName} {selectedRoomDetails.createdBy.lastName}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('rooms.roomDescription')}
                  </label>
                  <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800 min-h-[80px]">
                    {selectedRoomDetails.roomTypeDescription || '-'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('rooms.altDescription')}
                  </label>
                  <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800 min-h-[80px]">
                    {selectedRoomDetails.altDescription || '-'}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    handleEditRoom(selectedRoomDetails.id);
                    setSelectedRoomDetails(null);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                >
                  {t('common.edit')}
                </button>
                <button
                  onClick={() => {
                    handleDeleteRoom(selectedRoomDetails.id);
                    setSelectedRoomDetails(null);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                >
                  {t('common.delete')}
                </button>
                <button
                  onClick={() => handlePrintRoom(selectedRoomDetails.id)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                >
                  {t('rooms.print')}
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
