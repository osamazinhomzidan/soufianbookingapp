'use client';

import React, { useState, useEffect } from 'react';
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
  purchasePrice: number;
  basePrice: number;
  alternativePrice?: number;
  availableFrom?: string;
  availableTo?: string;
  quantity: number;
  boardType: 'Room only' | 'Bed & breakfast' | 'Half board' | 'Full board';
  isActive: boolean;
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

interface RoomFormData {
  id: string;
  roomType: string;
  roomTypeDescription: string;
  altDescription: string;
  purchasePrice: string;
  basePrice: string;
  alternativePrice: string;
  availableFrom: string;
  availableTo: string;
  quantity: string;
  boardType: 'Room only' | 'Bed & breakfast' | 'Half board' | 'Full board';
  hasAlternativePrice: boolean;
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
  const { t, tInterpolate } = useTranslation();
  
  // Board type mappings
  const BOARD_TYPE_MAPPINGS = {
    apiToDisplay: {
      'ROOM_ONLY': 'Room only',
      'BED_BREAKFAST': 'Bed & breakfast',
      'HALF_BOARD': 'Half board',
      'FULL_BOARD': 'Full board'
    } as const,
    displayToApi: {
      'Room only': 'ROOM_ONLY',
      'Bed & breakfast': 'BED_BREAKFAST',
      'Half board': 'HALF_BOARD',
      'Full board': 'FULL_BOARD'
    } as const,
    apiToTranslated: (apiFormat: string) => {
      const map: { [key: string]: string } = {
        'ROOM_ONLY': t('rooms.roomOnly'),
        'BED_BREAKFAST': t('rooms.bedBreakfast'),
        'HALF_BOARD': t('rooms.halfBoard'),
        'FULL_BOARD': t('rooms.fullBoard')
      };
      return map[apiFormat] || apiFormat;
    }
  };
  
  // State management
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Multiple room forms state
  const [roomForms, setRoomForms] = useState<RoomFormData[]>(() => {
    const initialId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    return [{
      id: initialId,
      roomType: '',
      roomTypeDescription: '',
      altDescription: '',
      purchasePrice: '',
      basePrice: '',
      alternativePrice: '',
      availableFrom: '',
      availableTo: '',
      quantity: '1',
      boardType: 'Room only',
      hasAlternativePrice: true
    }];
  });
  const [selectedHotelForMultiple, setSelectedHotelForMultiple] = useState('');
  
  // Filter states
  const [nameFilter, setNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [hotelFilter, setHotelFilter] = useState('');
  
  // Date-based availability filters
  const [availableFromFilter, setAvailableFromFilter] = useState('');
  const [availableToFilter, setAvailableToFilter] = useState('');
  
  // Price filters
  const [minPurchasePriceFilter, setMinPurchasePriceFilter] = useState('');
  const [maxPurchasePriceFilter, setMaxPurchasePriceFilter] = useState('');
  const [minBasePriceFilter, setMinBasePriceFilter] = useState('');
  const [maxBasePriceFilter, setMaxBasePriceFilter] = useState('');
  
  // Additional filters
  const [boardTypeFilter, setBoardTypeFilter] = useState('');
  const [minQuantityFilter, setMinQuantityFilter] = useState('');
  const [maxQuantityFilter, setMaxQuantityFilter] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');
  const [minCapacityFilter, setMinCapacityFilter] = useState('');
  const [maxCapacityFilter, setMaxCapacityFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [createdByFilter, setCreatedByFilter] = useState('');
  
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
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchHotels();
    fetchRooms();
  }, []);

  // Validation functions
  const validateRoomForm = (form: RoomFormData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Required field validation
    if (!form.roomType.trim()) errors.push(t('validation.roomTypeRequired'));
    if (!form.roomTypeDescription.trim()) errors.push(t('validation.roomDescriptionRequired'));
    if (!form.purchasePrice.trim()) errors.push(t('validation.purchasePriceRequired'));
    if (!form.basePrice.trim()) errors.push(t('validation.basePriceRequired'));
    if (!form.quantity.trim()) errors.push(t('validation.quantityRequired'));
    
    // Numeric validation
    const purchasePrice = parseFloat(form.purchasePrice);
    const basePrice = parseFloat(form.basePrice);
    const quantity = parseInt(form.quantity);
    const alternativePrice = form.alternativePrice ? parseFloat(form.alternativePrice) : null;
    
    if (form.purchasePrice && (isNaN(purchasePrice) || purchasePrice <= 0)) {
      errors.push(t('validation.purchasePriceInvalid'));
    }
    if (form.basePrice && (isNaN(basePrice) || basePrice <= 0)) {
      errors.push(t('validation.basePriceInvalid'));
    }
    if (form.quantity && (isNaN(quantity) || quantity <= 0)) {
      errors.push(t('validation.quantityInvalid'));
    }
    if (form.alternativePrice && (isNaN(alternativePrice) || alternativePrice <= 0)) {
      errors.push(t('validation.alternativePriceInvalid'));
    }
    
    // Price comparison validation
    if (!isNaN(purchasePrice) && !isNaN(basePrice) && basePrice <= purchasePrice) {
      errors.push(t('validation.basePriceHigher'));
    }
    
    // Date validation
    if (form.availableFrom && form.availableTo) {
      const fromDate = new Date(form.availableFrom);
      const toDate = new Date(form.availableTo);
      if (fromDate >= toDate) {
        errors.push(t('validation.dateRangeInvalid'));
      }
    }
    
    // Room type length validation
    if (form.roomType.length > 100) {
      errors.push(t('validation.roomTypeTooLong'));
    }
    if (form.roomTypeDescription.length > 500) {
      errors.push(t('validation.descriptionTooLong'));
    }
    
    return { isValid: errors.length === 0, errors };
  };
  
  const validateAllForms = (): { isValid: boolean; formErrors: { [key: string]: string[] } } => {
    const formErrors: { [key: string]: string[] } = {};
    let isValid = true;
    
    roomForms.forEach(form => {
      const validation = validateRoomForm(form);
      if (!validation.isValid) {
        formErrors[form.id] = validation.errors;
        isValid = false;
      }
    });
    
    return { isValid, formErrors };
  };
  
  // Form validation state
  const [formErrors, setFormErrors] = useState<{ [key: string]: string[] }>({});
  const [isValidating, setIsValidating] = useState(false);

  // Helper functions for multiple room forms
  const addRoomForm = () => {
    const newId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newForm: RoomFormData = {
      id: newId,
      roomType: '',
      roomTypeDescription: '',
      altDescription: '',
      purchasePrice: '',
      basePrice: '',
      alternativePrice: '',
      availableFrom: '',
      availableTo: '',
      quantity: '1',
      boardType: 'Room only',
      hasAlternativePrice: true
    };
    setRoomForms([...roomForms, newForm]);
    // Clear errors for new form
    setFormErrors(prev => ({ ...prev, [newId]: [] }));
  };

  const removeRoomForm = (formId: string) => {
    if (roomForms.length > 1) {
      setRoomForms(roomForms.filter(form => form.id !== formId));
      // Remove validation errors for the removed form
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[formId];
        return newErrors;
      });
    }
  };

  const updateRoomForm = (formId: string, field: keyof RoomFormData, value: any) => {
    // Update form data
    const updatedForms = roomForms.map(form => 
      form.id === formId ? { ...form, [field]: value } : form
    );
    setRoomForms(updatedForms);
    
    // Real-time validation for the updated form
    const updatedForm = updatedForms.find(form => form.id === formId);
    if (updatedForm) {
      const validation = validateRoomForm(updatedForm);
      setFormErrors(prev => ({
        ...prev,
        [formId]: validation.errors
      }));
    }
  };

  const resetMultipleRoomForms = () => {
    const initialId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setRoomForms([{
      id: initialId,
      roomType: '',
      roomTypeDescription: '',
      altDescription: '',
      purchasePrice: '',
      basePrice: '',
      alternativePrice: '',
      availableFrom: '',
      availableTo: '',
      quantity: '1',
      boardType: 'Room only',
      hasAlternativePrice: true
    }]);
    setFormErrors({});
    setMessage(null);
  };

  // Handle multiple room submission
  const handleAddMultipleRooms = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    
    // Hotel validation
    if (!selectedHotelForMultiple) {
      setMessage({ type: 'error', text: t('rooms.selectValidHotel') });
      setIsValidating(false);
      return;
    }

    const selectedHotel = hotels.find(h => h.id === selectedHotelForMultiple);
    if (!selectedHotel) {
      setMessage({ type: 'error', text: t('rooms.selectValidHotel') });
      setIsValidating(false);
      return;
    }

    // Comprehensive form validation
    const validation = validateAllForms();
    setFormErrors(validation.formErrors);
    
    if (!validation.isValid) {
      const errorCount = Object.values(validation.formErrors).reduce((acc, errors) => acc + errors.length, 0);
      setMessage({ 
        type: 'error', 
        text: tInterpolate('validation.formHasErrors', { count: errorCount })
      });
      setIsValidating(false);
      return;
    }

    // Note: Duplicate room types are now allowed for the same hotel

    try {
      setLoading(true);
      
      // Convert room forms to API format
      const roomsData = roomForms.map(form => ({
        roomType: form.roomType,
        roomTypeDescription: form.roomTypeDescription,
        altDescription: form.altDescription || null,
        purchasePrice: parseFloat(form.purchasePrice),
        basePrice: parseFloat(form.basePrice),
        alternativePrice: form.alternativePrice ? parseFloat(form.alternativePrice) : null,
        availableFrom: form.availableFrom || null,
        availableTo: form.availableTo || null,
        quantity: parseInt(form.quantity),
        boardType: BOARD_TYPE_MAPPINGS.displayToApi[form.boardType] || 'ROOM_ONLY',
      }));

      // Send bulk request to API
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          hotelId: selectedHotelForMultiple,
          rooms: roomsData 
        }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<Room[]> = await response.json();

      if (result.success && result.data) {
        // Add hotel name for display and update rooms list
        const roomsWithHotelName = result.data.map(room => ({
          ...room,
          hotelName: selectedHotel.name
        }));
        
        setRooms([...rooms, ...roomsWithHotelName]);
        
        // Reset multiple room forms and validation
        resetMultipleRoomForms();
        setSelectedHotelForMultiple('');
        setFormErrors({});
        
        const successMessage = roomsData.length === 1 
          ? t('rooms.roomAddedSuccessfully')
          : tInterpolate('rooms.multipleRoomsSuccess', { count: roomsData.length });
        setMessage({ type: 'success', text: successMessage });
      } else {
        throw new Error(result.message || t('rooms.errorAddingRoom'));
      }
    } catch (error) {
      console.error('Error saving multiple rooms:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : t('rooms.errorAddingRoom');
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
      setIsValidating(false);
    }
  };

  // Filter rooms based on search inputs
  const filteredRooms = rooms.filter(room => {
    const nameMatch = nameFilter === '' || 
      room.roomType?.toLowerCase().includes(nameFilter.toLowerCase()) ||
      room.hotelName?.toLowerCase().includes(nameFilter.toLowerCase()) ||
      room.altDescription?.toLowerCase().includes(nameFilter.toLowerCase()) ||
      room.roomTypeDescription?.toLowerCase().includes(nameFilter.toLowerCase()) ||
      room.hotel?.name?.toLowerCase().includes(nameFilter.toLowerCase());
    
    const typeMatch = typeFilter === '' || 
      room.roomType?.toLowerCase().includes(typeFilter.toLowerCase());
    
    const hotelMatch = hotelFilter === '' || 
      room.hotelId === hotelFilter ||
      room.hotel?.name?.toLowerCase().includes(hotelFilter.toLowerCase()) ||
      room.hotelName?.toLowerCase().includes(hotelFilter.toLowerCase());
    
    // Date-based availability filtering
    const availableFromMatch = availableFromFilter === '' || 
      !room.availableFrom || 
      new Date(room.availableFrom) >= new Date(availableFromFilter);
    
    const availableToMatch = availableToFilter === '' || 
      !room.availableTo || 
      new Date(room.availableTo) <= new Date(availableToFilter);
    
    // Price filtering for purchase price
    const minPurchasePriceMatch = minPurchasePriceFilter === '' || 
      !minPurchasePriceFilter || 
      (room.purchasePrice && room.purchasePrice >= parseFloat(minPurchasePriceFilter));
    
    const maxPurchasePriceMatch = maxPurchasePriceFilter === '' || 
      !maxPurchasePriceFilter || 
      (room.purchasePrice && room.purchasePrice <= parseFloat(maxPurchasePriceFilter));
    
    // Price filtering for base (selling) price
    const minBasePriceMatch = minBasePriceFilter === '' || 
      !minBasePriceFilter || 
      (room.basePrice && room.basePrice >= parseFloat(minBasePriceFilter));
    
    const maxBasePriceMatch = maxBasePriceFilter === '' || 
      !maxBasePriceFilter || 
      (room.basePrice && room.basePrice <= parseFloat(maxBasePriceFilter));
    
    // Board type filtering
    const boardTypeMatch = boardTypeFilter === '' || 
      room.boardType === boardTypeFilter;
    
    // Quantity filtering
    const minQuantityMatch = minQuantityFilter === '' || 
      !minQuantityFilter || 
      (room.quantity && room.quantity >= parseInt(minQuantityFilter));
    
    const maxQuantityMatch = maxQuantityFilter === '' || 
      !maxQuantityFilter || 
      (room.quantity && room.quantity <= parseInt(maxQuantityFilter));
    
    // Active status filtering
    const isActiveMatch = isActiveFilter === '' || 
      (isActiveFilter === 'true' && room.isActive) || 
      (isActiveFilter === 'false' && !room.isActive);
    
    // Capacity filtering (if available in room data)
    const minCapacityMatch = minCapacityFilter === '' || 
      !minCapacityFilter || 
      (room.capacity && room.capacity >= parseInt(minCapacityFilter));
    
    const maxCapacityMatch = maxCapacityFilter === '' || 
      !maxCapacityFilter || 
      (room.capacity && room.capacity <= parseInt(maxCapacityFilter));
    
    // Floor filtering (if available in room data)
    const floorMatch = floorFilter === '' || 
      !floorFilter || 
      (room.floor && room.floor.toString() === floorFilter);
    
    // Created by filtering
    const createdByMatch = createdByFilter === '' || 
      (room.createdBy && (
        room.createdBy.username?.toLowerCase().includes(createdByFilter.toLowerCase()) ||
        room.createdBy.firstName?.toLowerCase().includes(createdByFilter.toLowerCase()) ||
        room.createdBy.lastName?.toLowerCase().includes(createdByFilter.toLowerCase())
      ));
    
    return nameMatch && typeMatch && hotelMatch && 
           availableFromMatch && availableToMatch && 
           minPurchasePriceMatch && maxPurchasePriceMatch && 
           minBasePriceMatch && maxBasePriceMatch &&
           boardTypeMatch && minQuantityMatch && maxQuantityMatch &&
           isActiveMatch && minCapacityMatch && maxCapacityMatch &&
           floorMatch && createdByMatch;
  });

  const handleViewRoom = async (id: string) => {
    try {
      const response = await fetch(`/api/rooms/${id}`);
      const result: ApiResponse<Room> = await response.json();
      
      if (result.success && result.data) {
        const roomWithHotelName = {
          ...result.data,
          hotelName: result.data.hotel?.name || t('rooms.unknownHotel')
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

  const handleDeleteRoom = async (id: string) => {
    if (!confirm(t('rooms.confirmDeleteRoom'))) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/rooms/${id}`, {
        method: 'DELETE',
      });
      
      const result: ApiResponse<null> = await response.json();
      
      if (result.success) {
        setRooms(rooms.filter(room => room.id !== id));
        setSelectedRooms(selectedRooms.filter(selectedId => selectedId !== id));
        if (selectedRoomDetails?.id === id) {
          setSelectedRoomDetails(null);
        }
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

  return (
    <ProtectedRoute requiredRole="OWNER">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
        </div>

        {/* Main content container */}
        <div className="relative z-10 w-full max-w-7xl">
          {/* Glassmorphism card */}
          <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl p-8 space-y-8">
            
            {/* Add New Room Section */}
            <div className="backdrop-blur-sm bg-white/50 border border-white/30 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-pulse"></div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {t('rooms.addNewRoom')}
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

              {/* Hotel Selection */}
              <div className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('rooms.hotelSelection')}</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      {t('rooms.selectHotel')}
                    </label>
                    <select
                      value={selectedHotelForMultiple}
                      onChange={(e) => {
                        setSelectedHotelForMultiple(e.target.value);
                        if (e.target.value) {
                          resetMultipleRoomForms();
                        }
                      }}
                      className="w-full px-4 py-4 bg-white/70 border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm text-lg font-medium shadow-sm hover:shadow-md"
                      required
                    >
                      <option value="">{t('rooms.selectHotel')}</option>
                      {hotels.map((hotel) => (
                        <option key={hotel.id} value={hotel.id}>
                          {hotel.name} ({hotel.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Plus/Minus Controls */}
                  {selectedHotelForMultiple && (
                    <div className="flex items-center gap-2 mt-8">
                      <button
                        type="button"
                        onClick={addRoomForm}
                        className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        title={t('rooms.addAnotherRoom')}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                      {roomForms.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRoomForm(roomForms[roomForms.length - 1].id)}
                          className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          title={t('rooms.removeLastRoom')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                          </svg>
                        </button>
                      )}
                      <span className="text-sm text-gray-600 ml-2">
                        {roomForms.length} room{roomForms.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Multiple Room Forms */}
              {selectedHotelForMultiple && (
                <form onSubmit={handleAddMultipleRooms} className="space-y-6">
                  {roomForms.map((roomForm, index) => (
                    <div key={roomForm.id} className="bg-gradient-to-br from-blue-50/60 to-indigo-50/40 backdrop-blur-md rounded-2xl p-6 border border-blue-200/30 shadow-lg relative">
                      {/* Room Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {tInterpolate('rooms.roomNumber', { number: index + 1 })}
                        </h4>
                        {roomForms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRoomForm(roomForm.id)}
                            className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-all duration-200"
                            title={t('rooms.removeThisRoom')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Form Validation Errors */}
                      {formErrors[roomForm.id] && formErrors[roomForm.id].length > 0 && (
                        <div className="mb-4 p-3 bg-red-50/80 border border-red-200 rounded-xl backdrop-blur-sm">
                          <div className="flex items-start space-x-2">
                            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                              <h5 className="text-sm font-medium text-red-800 mb-1">{tInterpolate('rooms.roomValidationErrors', { number: index + 1 })}</h5>
                              <ul className="text-sm text-red-700 space-y-1">
                                {formErrors[roomForm.id].map((error, errorIndex) => (
                                  <li key={errorIndex} className="flex items-start space-x-1">
                                    <span className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                                    <span>{error}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Room Form Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Room Type */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {t('rooms.roomType')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={roomForm.roomType}
                            onChange={(e) => updateRoomForm(roomForm.id, 'roomType', e.target.value)}
                            className={`w-full px-4 py-3 bg-white/50 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400 ${
                              formErrors[roomForm.id]?.some(error => error.includes('room type') || error.includes('Room Type')) 
                                ? 'border-red-300 focus:ring-red-400' 
                                : 'border-gray-200/50 focus:ring-blue-400'
                            }`}
                            placeholder={t('rooms.enterRoomType')}
                            maxLength={100}
                            required
                          />
                        </div>

                        {/* Board Type */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {t('rooms.boardType')}
                          </label>
                          <select
                            value={roomForm.boardType}
                            onChange={(e) => updateRoomForm(roomForm.id, 'boardType', e.target.value as any)}
                            className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
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
                            {t('rooms.roomDescription')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={roomForm.roomTypeDescription}
                            onChange={(e) => updateRoomForm(roomForm.id, 'roomTypeDescription', e.target.value)}
                            className={`w-full px-4 py-3 bg-white/50 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400 ${
                              formErrors[roomForm.id]?.some(error => error.includes('description') || error.includes('Description')) 
                                ? 'border-red-300 focus:ring-red-400' 
                                : 'border-gray-200/50 focus:ring-blue-400'
                            }`}
                            placeholder={t('rooms.enterRoomDescription')}
                            maxLength={500}
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
                            value={roomForm.altDescription}
                            onChange={(e) => updateRoomForm(roomForm.id, 'altDescription', e.target.value)}
                            className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                            placeholder={t('rooms.enterAltDescription')}
                          />
                        </div>
                        
                        {/* Quantity */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {t('rooms.numberOfRooms')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={roomForm.quantity}
                            onChange={(e) => updateRoomForm(roomForm.id, 'quantity', e.target.value)}
                            className={`w-full px-4 py-3 bg-white/50 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400 ${
                              formErrors[roomForm.id]?.some(error => error.includes('quantity') || error.includes('Quantity')) 
                                ? 'border-red-300 focus:ring-red-400' 
                                : 'border-gray-200/50 focus:ring-blue-400'
                            }`}
                            placeholder={t('rooms.roomQuantityPlaceholder')}
                            min="1"
                            required
                          />
                        </div>

                        {/* Purchase Price */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Purchase Price <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={roomForm.purchasePrice}
                            onChange={(e) => updateRoomForm(roomForm.id, 'purchasePrice', e.target.value)}
                            className={`w-full px-4 py-3 bg-white/50 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400 ${
                              formErrors[roomForm.id]?.some(error => error.includes('purchase') || error.includes('Purchase')) 
                                ? 'border-red-300 focus:ring-red-400' 
                                : 'border-gray-200/50 focus:ring-blue-400'
                            }`}
                            placeholder="Enter purchase price"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>

                        {/* Base Price */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Base Price <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={roomForm.basePrice}
                            onChange={(e) => updateRoomForm(roomForm.id, 'basePrice', e.target.value)}
                            className={`w-full px-4 py-3 bg-white/50 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400 ${
                              formErrors[roomForm.id]?.some(error => error.includes('base') || error.includes('Base') || error.includes('higher')) 
                                ? 'border-red-300 focus:ring-red-400' 
                                : 'border-gray-200/50 focus:ring-blue-400'
                            }`}
                            placeholder="Enter base selling price"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>

                        {/* Alternative Price */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Alternative Price
                          </label>
                          <input
                            type="number"
                            value={roomForm.alternativePrice}
                            onChange={(e) => updateRoomForm(roomForm.id, 'alternativePrice', e.target.value)}
                            className={`w-full px-4 py-3 bg-white/50 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400 ${
                              formErrors[roomForm.id]?.some(error => error.includes('alternative') || error.includes('Alternative')) 
                                ? 'border-red-300 focus:ring-red-400' 
                                : 'border-gray-200/50 focus:ring-blue-400'
                            }`}
                            placeholder="Enter alternative price (optional)"
                            min="0"
                            step="0.01"
                          />
                        </div>

                        {/* Available From */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {t('rooms.availableFrom')}
                          </label>
                          <input
                            type="date"
                            value={roomForm.availableFrom}
                            onChange={(e) => updateRoomForm(roomForm.id, 'availableFrom', e.target.value)}
                            className={`w-full px-4 py-3 bg-white/50 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                              formErrors[roomForm.id]?.some(error => error.includes('date') || error.includes('Date') || error.includes('availability')) 
                                ? 'border-red-300 focus:ring-red-400' 
                                : 'border-gray-200/50 focus:ring-blue-400'
                            }`}
                          />
                        </div>

                        {/* Available To */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {t('rooms.availableTo')}
                          </label>
                          <input
                            type="date"
                            value={roomForm.availableTo}
                            onChange={(e) => updateRoomForm(roomForm.id, 'availableTo', e.target.value)}
                            className={`w-full px-4 py-3 bg-white/50 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                              formErrors[roomForm.id]?.some(error => error.includes('date') || error.includes('Date') || error.includes('availability')) 
                                ? 'border-red-300 focus:ring-red-400' 
                                : 'border-gray-200/50 focus:ring-blue-400'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      className={`flex-1 px-6 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:ring-2 focus:ring-offset-2 ${
                        !selectedHotelForMultiple || roomForms.length === 0 || loading || isValidating
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-green-600 text-white focus:ring-green-500'
                      }`}
                      disabled={!selectedHotelForMultiple || roomForms.length === 0 || loading || isValidating}
                    >
                      {loading ? t('rooms.addingRooms') : isValidating ? t('rooms.validatingRooms') : (roomForms.length === 1 ? t('rooms.addRoom') : tInterpolate('rooms.addRoomsCount', { count: roomForms.length }))}
                    </button>
                    <button
                      type="button"
                      onClick={resetMultipleRoomForms}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      {t('common.reset')}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* View Rooms Section */}
            <div className="backdrop-blur-sm bg-white/50 border border-white/30 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {t('rooms.viewAddedRooms')}
                </h2>
              </div>

              {/* Modern Filter Section */}
              <div className="mb-8">
                {/* Filter Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-800">{t('common.filters')}</h3>
                    <span className="text-sm text-gray-500">({filteredRooms.length} {t('common.results')})</span>
                  </div>
                  <button
                    onClick={() => {
                      setNameFilter('');
                      setTypeFilter('');
                      setHotelFilter('');
                      setAvailableFromFilter('');
                      setAvailableToFilter('');
                      setMinPurchasePriceFilter('');
                      setMaxPurchasePriceFilter('');
                      setMinBasePriceFilter('');
                      setMaxBasePriceFilter('');
                      setBoardTypeFilter('');
                      setMinQuantityFilter('');
                      setMaxQuantityFilter('');
                      setIsActiveFilter('');
                      setMinCapacityFilter('');
                      setMaxCapacityFilter('');
                      setFloorFilter('');
                      setCreatedByFilter('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>{t('common.clearAll')}</span>
                  </button>
                </div>

                {/* Filter Groups */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Basic Search & Selection Group */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t('common.search')}</h4>
                    
                    {/* Global Search */}
                    <div className="relative">
                      <input
                        type="text"
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                        className="w-full px-4 py-3 pl-11 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm placeholder-gray-400"
                        placeholder={t('rooms.searchRoomOrHotel')}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* Hotel Selection */}
                    <select
                      value={hotelFilter}
                      onChange={(e) => setHotelFilter(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                    >
                      <option value="">{t('rooms.allHotels')}</option>
                      {hotels.map((hotel) => (
                        <option key={hotel.id} value={hotel.id}>
                          {hotel.name}
                        </option>
                      ))}
                    </select>

                    {/* Board Type */}
                    <select
                      value={boardTypeFilter}
                      onChange={(e) => setBoardTypeFilter(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                    >
                      <option value="">{t('rooms.allBoardTypes')}</option>
                      <option value="Room only">{t('rooms.roomOnly')}</option>
                      <option value="Bed & breakfast">{t('rooms.bedBreakfast')}</option>
                      <option value="Half board">{t('rooms.halfBoard')}</option>
                      <option value="Full board">{t('rooms.fullBoard')}</option>
                    </select>

                    {/* Status Filter */}
                    <select
                      value={isActiveFilter}
                      onChange={(e) => setIsActiveFilter(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                    >
                      <option value="">{t('rooms.allStatuses')}</option>
                      <option value="true">{t('rooms.active')}</option>
                      <option value="false">{t('rooms.inactive')}</option>
                    </select>
                  </div>

                  {/* Pricing & Availability Group */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t('rooms.pricingAvailability')}</h4>
                    
                    {/* Purchase Price Range */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">{t('rooms.purchasePriceRange')}</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={minPurchasePriceFilter}
                          onChange={(e) => setMinPurchasePriceFilter(e.target.value)}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                          placeholder={t('common.min')}
                          min="0"
                          step="0.01"
                        />
                        <input
                          type="number"
                          value={maxPurchasePriceFilter}
                          onChange={(e) => setMaxPurchasePriceFilter(e.target.value)}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                          placeholder={t('common.max')}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    {/* Base Price Range */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">{t('rooms.basePriceRange')}</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={minBasePriceFilter}
                          onChange={(e) => setMinBasePriceFilter(e.target.value)}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                          placeholder={t('common.min')}
                          min="0"
                          step="0.01"
                        />
                        <input
                          type="number"
                          value={maxBasePriceFilter}
                          onChange={(e) => setMaxBasePriceFilter(e.target.value)}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                          placeholder={t('common.max')}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    {/* Availability Dates */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">{t('rooms.availabilityRange')}</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={availableFromFilter}
                          onChange={(e) => setAvailableFromFilter(e.target.value)}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                        />
                        <input
                          type="date"
                          value={availableToFilter}
                          onChange={(e) => setAvailableToFilter(e.target.value)}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Room Details Group */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">{t('rooms.roomDetails')}</h4>
                    
                    {/* Room Type */}
                    <input
                      type="text"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm placeholder-gray-400"
                      placeholder={t('rooms.searchRoomType')}
                    />

                    {/* Quantity Range */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">{t('rooms.quantityRange')}</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={minQuantityFilter}
                          onChange={(e) => setMinQuantityFilter(e.target.value)}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                          placeholder={t('common.min')}
                          min="0"
                        />
                        <input
                          type="number"
                          value={maxQuantityFilter}
                          onChange={(e) => setMaxQuantityFilter(e.target.value)}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                          placeholder={t('common.max')}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rooms Table */}
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="flex items-center space-x-3">
                      <svg className="animate-spin h-8 w-8 text-blue-400" viewBox="0 0 24 24">
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
                          {t('rooms.boardType')}
                        </th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm">
                          {t('rooms.purchasePrice')}
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
                          {t('rooms.availableFrom')}
                        </th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm">
                          {t('rooms.availableTo')}
                        </th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm">
                          {t('common.createdDate')}
                        </th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm">
                          {t('common.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRooms.map((room) => (
                        <tr key={room.id} className="border-b border-gray-100/50 hover:bg-white/30 transition-colors">
                          <td className="py-2 px-2 text-gray-600 text-sm max-w-[120px] truncate" title={room.hotelName || room.hotel?.name || t('rooms.unknownHotel')}>
                            {room.hotelName || room.hotel?.name || t('rooms.unknownHotel')}
                          </td>
                          <td className="py-2 px-2 text-gray-600 text-sm max-w-[100px] truncate" title={room.roomType}>
                            {room.roomType}
                          </td>
                          <td className="py-2 px-2 text-gray-600 text-sm max-w-[120px] truncate" title={`${room.roomTypeDescription}${room.altDescription ? ` | ${room.altDescription}` : ''}`}>
                            <div className="flex flex-col">
                              <span>{room.roomTypeDescription}</span>
                              {room.altDescription && (
                                <span className="text-xs text-gray-400 italic truncate">{room.altDescription}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-2 text-gray-600 text-sm">
                            <span className="px-2 py-1 bg-blue-100/50 text-blue-800 text-xs rounded-full whitespace-nowrap">
                              {BOARD_TYPE_MAPPINGS.apiToTranslated(room.boardType)}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-gray-600 text-sm font-medium">
                            {room.purchasePrice ? (
                              <span className="text-green-600">SAR {room.purchasePrice}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-gray-600 text-sm font-medium">
                            SAR {room.basePrice}
                          </td>
                          <td className="py-2 px-2 text-gray-600 text-sm font-medium">
                            {room.alternativePrice ? (
                              <span className="text-orange-600">SAR {room.alternativePrice}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-gray-600 text-sm font-medium">{room.quantity}</td>
                          <td className="py-2 px-2 text-gray-600 text-sm">
                            {room.availableFrom ? (
                              new Date(room.availableFrom).toLocaleDateString()
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-gray-600 text-sm">
                            {room.availableTo ? (
                              new Date(room.availableTo).toLocaleDateString()
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-gray-600 text-sm">
                            {new Date(room.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-2">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewRoom(room.id)}
                                className="px-3 py-1 bg-gradient-to-r from-blue-400 to-purple-400 text-white text-sm rounded-lg hover:shadow-md transition-all duration-200"
                              >
                                {t('common.view')}
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(room.id)}
                                className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded-lg hover:shadow-md transition-all duration-200"
                              >
                                {t('common.delete')}
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
                      {(nameFilter || typeFilter || hotelFilter) ? 
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
                        {BOARD_TYPE_MAPPINGS.apiToTranslated(selectedRoomDetails.boardType)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Purchase Price
                    </label>
                    <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800 font-semibold">
                      {selectedRoomDetails.purchasePrice ? (
                        <span className="text-green-600 font-semibold">SAR {selectedRoomDetails.purchasePrice}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Base Price
                    </label>
                    <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800 font-semibold">
                      SAR {selectedRoomDetails.basePrice}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Alternative Price
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
                      handleDeleteRoom(selectedRoomDetails.id);
                      setSelectedRoomDetails(null);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  >
                    {t('common.delete')}
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
