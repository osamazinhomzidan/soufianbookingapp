'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import {
  BuildingOfficeIcon,
  HomeIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  HashtagIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
        </div>

        {/* Main content container - Full width responsive */}
        <div className="relative z-10 w-full">
          <div className="max-w-none px-4 sm:px-6 lg:px-8 py-8 space-y-12">
            
            {/* Add New Room Section - Redesigned with Hotel Page Style */}
            <div className="backdrop-blur-sm bg-white/80 border border-slate-200/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 lg:p-12">
              <div className="mb-12">
                <div className="flex items-center space-x-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-xl">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                      {t('rooms.addNewRoom')}
                    </h2>
                    <p className="text-slate-700 text-xl font-bold mt-3 leading-relaxed">
                      Create and manage room inventory for your hotels
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Display - Hotel Page Style */}
              {message && (
                <div className={`mb-10 p-6 rounded-2xl border-2 shadow-lg backdrop-blur-md transition-all duration-300 ${
                  message.type === 'success'
                    ? 'bg-emerald-50/90 border-emerald-300/60 text-emerald-900' 
                    : 'bg-red-50/90 border-red-300/60 text-red-900'
                }`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
                      message.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                      {message.type === 'success' ? (
                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <span className="font-bold text-lg">{message.text}</span>
                  </div>
                </div>
              )}

              {/* Hotel Selection - Hotel Page Style */}
              <div className="backdrop-blur-sm bg-gradient-to-br from-slate-50/90 to-white/80 border-2 border-slate-200/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-10 mb-10">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('rooms.hotelSelection')}</h3>
                    <p className="text-slate-600 font-bold mt-1">Choose the hotel for your room inventory</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <label className="block text-base font-bold text-slate-700 mb-4">
                      {t('rooms.selectHotel')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <select
                        value={selectedHotelForMultiple}
                        onChange={(e) => {
                          setSelectedHotelForMultiple(e.target.value);
                          if (e.target.value) {
                            resetMultipleRoomForms();
                          }
                        }}
                        className="w-full pl-14 pr-4 py-4 bg-slate-50/50 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 focus:shadow-lg transition-all duration-200 placeholder-slate-400 text-slate-700 hover:border-slate-400 font-medium text-lg"
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
                  </div>
                  
                  {/* Plus/Minus Controls - Hotel Page Style */}
                  {selectedHotelForMultiple && (
                    <div className="flex items-center gap-4 mt-8">
                      <button
                        type="button"
                        onClick={addRoomForm}
                        className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 hover:from-blue-700 hover:to-indigo-700"
                        title={t('rooms.addAnotherRoom')}
                      >
                        <PlusIcon className="w-7 h-7" />
                      </button>
                      {roomForms.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRoomForm(roomForms[roomForms.length - 1].id)}
                          className="w-14 h-14 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 focus:ring-4 focus:ring-slate-500/50 focus:ring-offset-2"
                          title={t('rooms.removeLastRoom')}
                        >
                          <MinusIcon className="w-7 h-7" />
                        </button>
                      )}
                      <div className="bg-gradient-to-r from-slate-100 to-slate-200 px-6 py-3 rounded-2xl border border-slate-300 shadow-md">
                        <span className="text-base font-black text-slate-700">
                          {roomForms.length} room{roomForms.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Multiple Room Forms */}
              {selectedHotelForMultiple && (
                <form onSubmit={handleAddMultipleRooms} className="space-y-6">
                  {roomForms.map((roomForm, index) => (
                    <div key={roomForm.id} className="backdrop-blur-sm bg-gradient-to-br from-slate-50/90 to-blue-50/80 border-2 border-slate-200/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-10 relative">
                      {/* Room Header - Hotel Page Style */}
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                              {tInterpolate('rooms.roomNumber', { number: index + 1 })}
                            </h4>
                            <p className="text-slate-600 font-bold mt-1">Configure room details and pricing</p>
                          </div>
                        </div>
                        {roomForms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRoomForm(roomForm.id)}
                            className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 text-red-600 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 focus:ring-4 focus:ring-red-500/30"
                            title={t('rooms.removeThisRoom')}
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Form Validation Errors - Hotel Page Style */}
                      {formErrors[roomForm.id] && formErrors[roomForm.id].length > 0 && (
                        <div className="mb-8 p-6 bg-red-50/90 border-2 border-red-300/60 rounded-2xl backdrop-blur-md shadow-lg">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
                              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h5 className="text-lg font-black text-red-900 mb-3">{tInterpolate('rooms.roomValidationErrors', { number: index + 1 })}</h5>
                              <ul className="text-base text-red-800 space-y-2">
                                {formErrors[roomForm.id].map((error, errorIndex) => (
                                  <li key={errorIndex} className="flex items-start space-x-3">
                                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="font-medium">{error}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Room Form Fields - Two Row Layout */}
                      <div className="space-y-8">
                        {/* First Row - Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {/* Room Type */}
                        <div className="space-y-3">
                          <label className="block text-base font-black text-slate-900">
                            {t('rooms.roomType')} <span className="text-red-600">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <HomeIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <input
                              type="text"
                              value={roomForm.roomType}
                              onChange={(e) => updateRoomForm(roomForm.id, 'roomType', e.target.value)}
                              className={`w-full pl-12 pr-4 py-4 bg-white border-2 rounded-2xl focus:ring-4 focus:border-blue-600 transition-all duration-300 backdrop-blur-sm placeholder-slate-400 text-base font-medium shadow-sm hover:shadow-md ${
                                formErrors[roomForm.id]?.some(error => error.includes('room type') || error.includes('Room Type')) 
                                  ? 'border-red-500 focus:ring-red-500/30 bg-red-50/80' 
                                  : 'border-slate-300 focus:ring-blue-500/30'
                              }`}
                              placeholder={t('rooms.enterRoomType')}
                              maxLength={100}
                              required
                            />
                          </div>
                        </div>

                        {/* Board Type */}
                        <div className="space-y-3">
                          <label className="block text-base font-black text-slate-900">
                            {t('rooms.boardType')}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Cog6ToothIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <select
                              value={roomForm.boardType}
                              onChange={(e) => updateRoomForm(roomForm.id, 'boardType', e.target.value as any)}
                              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-600 transition-all duration-300 backdrop-blur-sm text-base font-medium shadow-sm hover:shadow-md"
                            >
                              <option value="Room only">{t('rooms.roomOnly')}</option>
                              <option value="Bed & breakfast">{t('rooms.bedBreakfast')}</option>
                              <option value="Half board">{t('rooms.halfBoard')}</option>
                              <option value="Full board">{t('rooms.fullBoard')}</option>
                            </select>
                          </div>
                        </div>

                        {/* Room Description */}
                        <div className="space-y-3">
                          <label className="block text-base font-black text-slate-900">
                            {t('rooms.roomDescription')} <span className="text-red-600">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <input
                              type="text"
                              value={roomForm.roomTypeDescription}
                              onChange={(e) => updateRoomForm(roomForm.id, 'roomTypeDescription', e.target.value)}
                              className={`w-full pl-12 pr-4 py-4 bg-white border-2 rounded-2xl focus:ring-4 focus:border-blue-600 transition-all duration-300 backdrop-blur-sm placeholder-slate-400 text-base font-medium shadow-sm hover:shadow-md ${
                                formErrors[roomForm.id]?.some(error => error.includes('description') || error.includes('Description')) 
                                  ? 'border-red-500 focus:ring-red-500/30 bg-red-50/80' 
                                  : 'border-slate-300 focus:ring-blue-500/30'
                              }`}
                              placeholder={t('rooms.enterRoomDescription')}
                              maxLength={500}
                              required
                            />
                          </div>
                        </div>

                        {/* Alt Description */}
                        <div className="space-y-3">
                          <label className="block text-base font-black text-slate-900">
                            {t('rooms.altDescription')}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <input
                              type="text"
                              value={roomForm.altDescription}
                              onChange={(e) => updateRoomForm(roomForm.id, 'altDescription', e.target.value)}
                              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-600 transition-all duration-300 backdrop-blur-sm placeholder-slate-400 text-base font-medium shadow-sm hover:shadow-md"
                              placeholder={t('rooms.enterAltDescription')}
                            />
                          </div>
                        </div>
                        
                        {/* Quantity */}
                        <div className="space-y-3">
                          <label className="block text-base font-black text-slate-900">
                            {t('rooms.numberOfRooms')} <span className="text-red-600">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <HashtagIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <input
                              type="number"
                              value={roomForm.quantity}
                              onChange={(e) => updateRoomForm(roomForm.id, 'quantity', e.target.value)}
                              className={`w-full pl-12 pr-4 py-4 bg-white border-2 rounded-2xl focus:ring-4 focus:border-blue-600 transition-all duration-300 backdrop-blur-sm placeholder-slate-400 text-base font-medium shadow-sm hover:shadow-md ${
                                formErrors[roomForm.id]?.some(error => error.includes('quantity') || error.includes('Quantity')) 
                                  ? 'border-red-500 focus:ring-red-500/30 bg-red-50/80' 
                                  : 'border-slate-300 focus:ring-blue-500/30'
                              }`}
                              placeholder={t('rooms.roomQuantityPlaceholder')}
                              min="1"
                              required
                            />
                          </div>
                        </div>
                        </div>

                        {/* Second Row - Pricing and Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {/* Purchase Price */}
                        <div className="space-y-3">
                          <label className="block text-base font-black text-slate-900">
                            Purchase Price <span className="text-red-600">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <input
                              type="number"
                              value={roomForm.purchasePrice}
                              onChange={(e) => updateRoomForm(roomForm.id, 'purchasePrice', e.target.value)}
                              className={`w-full pl-12 pr-4 py-4 bg-white border-2 rounded-2xl focus:ring-4 focus:border-blue-600 transition-all duration-300 backdrop-blur-sm placeholder-slate-400 text-base font-medium shadow-sm hover:shadow-md ${
                                formErrors[roomForm.id]?.some(error => error.includes('purchase') || error.includes('Purchase')) 
                                  ? 'border-red-500 focus:ring-red-500/30 bg-red-50/80' 
                                  : 'border-slate-300 focus:ring-blue-500/30'
                              }`}
                              placeholder="Enter purchase price"
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>
                        </div>

                        {/* Base Price */}
                        <div className="space-y-3">
                          <label className="block text-base font-black text-slate-900">
                            Base Price <span className="text-red-600">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <input
                              type="number"
                              value={roomForm.basePrice}
                              onChange={(e) => updateRoomForm(roomForm.id, 'basePrice', e.target.value)}
                              className={`w-full pl-12 pr-4 py-4 bg-white border-2 rounded-2xl focus:ring-4 focus:border-blue-600 transition-all duration-300 backdrop-blur-sm placeholder-slate-400 text-base font-medium shadow-sm hover:shadow-md ${
                                formErrors[roomForm.id]?.some(error => error.includes('base') || error.includes('Base') || error.includes('higher')) 
                                  ? 'border-red-500 focus:ring-red-500/30 bg-red-50/80' 
                                  : 'border-slate-300 focus:ring-blue-500/30'
                              }`}
                              placeholder="Enter base selling price"
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>
                        </div>

                        {/* Alternative Price */}
                        <div className="space-y-3">
                          <label className="block text-base font-black text-slate-900">
                            Alternative Price
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <input
                              type="number"
                              value={roomForm.alternativePrice}
                              onChange={(e) => updateRoomForm(roomForm.id, 'alternativePrice', e.target.value)}
                              className={`w-full pl-12 pr-4 py-4 bg-white border-2 rounded-2xl focus:ring-4 focus:border-blue-600 transition-all duration-300 backdrop-blur-sm placeholder-slate-400 text-base font-medium shadow-sm hover:shadow-md ${
                                formErrors[roomForm.id]?.some(error => error.includes('alternative') || error.includes('Alternative')) 
                                  ? 'border-red-500 focus:ring-red-500/30 bg-red-50/80' 
                                  : 'border-slate-300 focus:ring-blue-500/30'
                              }`}
                              placeholder="Enter alternative price (optional)"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        {/* Available From */}
                        <div className="space-y-3">
                          <label className="block text-base font-black text-slate-900">
                            {t('rooms.availableFrom')}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <input
                              type="date"
                              value={roomForm.availableFrom}
                              onChange={(e) => updateRoomForm(roomForm.id, 'availableFrom', e.target.value)}
                              className={`w-full pl-12 pr-4 py-4 bg-white border-2 rounded-2xl focus:ring-4 focus:border-blue-600 transition-all duration-300 backdrop-blur-sm text-base font-medium shadow-sm hover:shadow-md ${
                                formErrors[roomForm.id]?.some(error => error.includes('date') || error.includes('Date') || error.includes('availability')) 
                                  ? 'border-red-500 focus:ring-red-500/30 bg-red-50/80' 
                                  : 'border-slate-300 focus:ring-blue-500/30'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Available To */}
                        <div className="space-y-3">
                          <label className="block text-base font-black text-slate-900">
                            {t('rooms.availableTo')}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <input
                              type="date"
                              value={roomForm.availableTo}
                              onChange={(e) => updateRoomForm(roomForm.id, 'availableTo', e.target.value)}
                              className={`w-full pl-12 pr-4 py-4 bg-white border-2 rounded-2xl focus:ring-4 focus:border-blue-600 transition-all duration-300 backdrop-blur-sm text-base font-medium shadow-sm hover:shadow-md ${
                                formErrors[roomForm.id]?.some(error => error.includes('date') || error.includes('Date') || error.includes('availability')) 
                                  ? 'border-red-500 focus:ring-red-500/30 bg-red-50/80' 
                                  : 'border-slate-300 focus:ring-blue-500/30'
                              }`}
                            />
                          </div>
                        </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Action Buttons - Hotel Page Style */}
                  <div className="flex flex-wrap gap-6 mt-8">
                    <button
                      type="submit"
                      className={`flex-1 px-8 py-4 font-black text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 focus:ring-4 focus:ring-offset-2 backdrop-blur-sm ${
                        !selectedHotelForMultiple || roomForms.length === 0 || loading || isValidating
                          ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-gray-200 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white focus:ring-blue-500/50 hover:from-blue-700 hover:to-indigo-700'
                      }`}
                      disabled={!selectedHotelForMultiple || roomForms.length === 0 || loading || isValidating}
                    >
                      {loading ? t('rooms.addingRooms') : isValidating ? t('rooms.validatingRooms') : (roomForms.length === 1 ? t('rooms.addRoom') : tInterpolate('rooms.addRoomsCount', { count: roomForms.length }))}
                    </button>
                    <button
                      type="button"
                      onClick={resetMultipleRoomForms}
                      className="flex-1 px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 focus:ring-4 focus:ring-slate-500/50 focus:ring-offset-2 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-center space-x-2">
                          <XMarkIcon className="w-5 h-5" />
                          <span>{t('common.reset')}</span>
                        </div>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* View Rooms Section */}
            <div className="backdrop-blur-sm bg-white/80 border border-slate-200/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 lg:p-12">
              <div className="mb-12">
                <div className="flex items-center space-x-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-700 rounded-3xl flex items-center justify-center shadow-xl">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                      {t('rooms.viewAddedRooms')}
                    </h2>
                    <p className="text-slate-700 text-lg font-bold mt-3 leading-relaxed">
                      Browse and manage your room inventory ({filteredRooms.length} {t('common.results')})
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Modern Filter Section */}
              <div className="mb-12">
                {/* Filter Header with Enhanced Styling */}
                <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 rounded-3xl p-8 mb-8 border border-slate-200/60 shadow-xl shadow-slate-200/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                          </svg>
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">{t('common.filters')}</h3>
                        <p className="text-slate-600 font-semibold mt-2 text-lg">Refine and customize your search results</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-slate-500 font-medium">Advanced filtering enabled</span>
                        </div>
                      </div>
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
                      className="group px-8 py-4 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 hover:from-slate-700 hover:via-slate-800 hover:to-slate-900 text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-[1.05] hover:-translate-y-1 transition-all duration-300 focus:ring-4 focus:ring-slate-500/50 focus:ring-offset-2 backdrop-blur-sm flex items-center space-x-4 border border-slate-500/20"
                    >
                      <div className="relative">
                        <svg className="w-6 h-6 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-110 transition-transform duration-300"></div>
                      </div>
                      <span className="text-lg">{t('common.clearAll')}</span>
                    </button>
                  </div>
                </div>

              {/* Enhanced Filter Groups - Two Rows Layout with Modern UI/UX */}
              {/* First Row - Basic Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    {/* Global Search */}
                    <div className="relative group bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <label className="block text-lg font-bold text-slate-800">{t('rooms.searchRoomOrHotel')}</label>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={nameFilter}
                          onChange={(e) => setNameFilter(e.target.value)}
                          className="w-full px-5 py-4 pl-12 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all duration-300 text-base font-semibold placeholder-slate-400"
                          placeholder={t('rooms.searchRoomOrHotel')}
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        {nameFilter && (
                          <button
                            onClick={() => setNameFilter('')}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-red-500 transition-colors duration-200"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Hotel Selection */}
                    <div className="relative group bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <label className="block text-lg font-bold text-slate-800">{t('rooms.hotel')}</label>
                      </div>
                      <div className="relative">
                        <select
                          value={hotelFilter}
                          onChange={(e) => setHotelFilter(e.target.value)}
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-slate-300 transition-all duration-300 text-base font-semibold appearance-none cursor-pointer"
                        >
                          <option value="">{t('rooms.allHotels')}</option>
                          {hotels.map((hotel) => (
                            <option key={hotel.id} value={hotel.id}>
                              {hotel.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Board Type */}
                    <div className="relative group bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0-8h10a2 2 0 012 2v6a2 2 0 01-2 2H9m0-8v8" />
                          </svg>
                        </div>
                        <label className="block text-lg font-bold text-slate-800">{t('rooms.boardType')}</label>
                      </div>
                      <div className="relative">
                        <select
                          value={boardTypeFilter}
                          onChange={(e) => setBoardTypeFilter(e.target.value)}
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 hover:border-slate-300 transition-all duration-300 text-base font-semibold appearance-none cursor-pointer"
                        >
                          <option value="">{t('rooms.allBoardTypes')}</option>
                          <option value="Room only">{t('rooms.roomOnly')}</option>
                          <option value="Bed & breakfast">{t('rooms.bedBreakfast')}</option>
                          <option value="Half board">{t('rooms.halfBoard')}</option>
                          <option value="Full board">{t('rooms.fullBoard')}</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
              
              </div>
                {/* Second Row - Price & Date Filters */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                      {/* Purchase Price Range */}
                      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                          <label className="block text-base font-bold text-slate-800">{t('rooms.purchasePriceRange')}</label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="number"
                            value={minPurchasePriceFilter}
                            onChange={(e) => setMinPurchasePriceFilter(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-slate-300 transition-all duration-300 text-base font-semibold placeholder-slate-400"
                            placeholder={t('common.min')}
                            min="0"
                            step="0.01"
                          />
                          <input
                            type="number"
                            value={maxPurchasePriceFilter}
                            onChange={(e) => setMaxPurchasePriceFilter(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-slate-300 transition-all duration-300 text-base font-semibold placeholder-slate-400"
                            placeholder={t('common.max')}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      {/* Base Price Range */}
                      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <label className="block text-base font-bold text-slate-800">Selling / {t('rooms.basePriceRange')}</label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="number"
                            value={minBasePriceFilter}
                            onChange={(e) => setMinBasePriceFilter(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all duration-300 text-base font-semibold placeholder-slate-400"
                            placeholder={t('common.min')}
                            min="0"
                            step="0.01"
                          />
                          <input
                            type="number"
                            value={maxBasePriceFilter}
                            onChange={(e) => setMaxBasePriceFilter(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all duration-300 text-base font-semibold placeholder-slate-400"
                            placeholder={t('common.max')}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      {/* Availability Dates */}
                      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <label className="block text-base font-bold text-slate-800">{t('rooms.availabilityRange')}</label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="date"
                            value={availableFromFilter}
                            onChange={(e) => setAvailableFromFilter(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 hover:border-slate-300 transition-all duration-300 text-base font-semibold"
                          />
                          <input
                            type="date"
                            value={availableToFilter}
                            onChange={(e) => setAvailableToFilter(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 hover:border-slate-300 transition-all duration-300 text-base font-semibold"
                          />
                        </div>
                      </div>

                    {/* Room Details Group - Enhanced Layout */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          </svg>
                        </div>
                        <label className="block text-base font-bold text-slate-800">{t('rooms.roomType')}</label>
                      </div>
                      <input
                        type="text"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-300 transition-all duration-300 text-base font-semibold placeholder-slate-400"
                        placeholder={t('rooms.searchRoomType')}
                      />
                    </div>

                    {/* Quantity Range */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                        </div>
                        <label className="block text-base font-bold text-slate-800">{t('rooms.quantityRange')}</label>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          value={minQuantityFilter}
                          onChange={(e) => setMinQuantityFilter(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:border-slate-300 transition-all duration-300 text-base font-semibold placeholder-slate-400"
                          placeholder={t('common.min')}
                          min="0"
                        />
                        <input
                          type="number"
                          value={maxQuantityFilter}
                          onChange={(e) => setMaxQuantityFilter(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:border-slate-300 transition-all duration-300 text-base font-semibold placeholder-slate-400"
                          placeholder={t('common.max')}
                          min="0"
                        />
                      </div>
                    </div>
                </div>
              </div>

              {/* Visual Separator */}
              <div className="border-t border-slate-200/60 my-8"></div>

              {/* Rooms Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-xl">
                {loading ? (
                  <div className="flex justify-center items-center py-16">
                    <div className="flex items-center space-x-4">
                      <svg className="animate-spin h-10 w-10 text-blue-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-slate-700 font-bold text-lg">{t('common.loading')}</span>
                    </div>
                  </div>
                ) : filteredRooms.length > 0 ? (
                  <table className="w-full min-w-[1200px] table-auto">
                    <thead className="bg-gradient-to-r from-slate-100/80 to-slate-50/60 backdrop-blur-sm">
                      <tr className="border-b-2 border-slate-200/60">
                        <th className="text-left py-5 px-6 font-bold text-slate-800 text-sm uppercase tracking-wide">
                          {t('rooms.hotel')}
                        </th>
                        <th className="text-left py-5 px-6 font-bold text-slate-800 text-sm uppercase tracking-wide">
                          {t('rooms.roomType')}
                        </th>
                        <th className="text-left py-5 px-6 font-bold text-slate-800 text-sm uppercase tracking-wide">
                          {t('rooms.roomDescription')}
                        </th>
                        <th className="text-left py-5 px-6 font-bold text-slate-800 text-sm uppercase tracking-wide">
                          {t('rooms.boardType')}
                        </th>
                        <th className="text-left py-5 px-6 font-bold text-slate-800 text-sm uppercase tracking-wide">
                          {t('rooms.purchasePrice')}
                        </th>
                        <th className="text-left py-5 px-6 font-bold text-slate-800 text-sm uppercase tracking-wide">
                          {t('rooms.basePrice')}
                        </th>
                        <th className="text-left py-5 px-6 font-bold text-slate-800 text-sm uppercase tracking-wide">
                          {t('rooms.alternativePrice')}
                        </th>
                        <th className="text-left py-5 px-6 font-bold text-slate-800 text-sm uppercase tracking-wide">
                          {t('rooms.quantity')}
                        </th>
                        <th className="text-left py-5 px-6 font-bold text-slate-800 text-sm uppercase tracking-wide">
                          {t('rooms.availableFrom')}
                        </th>
                        <th className="text-left py-5 px-6 font-bold text-slate-800 text-sm uppercase tracking-wide">
                          {t('rooms.availableTo')}
                        </th>
                        <th className="text-left py-5 px-6 font-bold text-slate-800 text-sm uppercase tracking-wide">
                          {t('common.createdDate')}
                        </th>
                        <th className="text-left py-5 px-6 font-bold text-slate-800 text-sm uppercase tracking-wide">
                          {t('common.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-200/40">
                      {filteredRooms.map((room, index) => (
                        <tr key={room.id} className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-slate-50/50 transition-all duration-300 ${
                          index % 2 === 0 ? 'bg-white/40' : 'bg-slate-50/30'
                        }`}>
                          <td className="py-5 px-6 text-slate-900 font-bold text-base max-w-[150px]" title={room.hotelName || room.hotel?.name || t('rooms.unknownHotel')}>
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                                  <BuildingOfficeIcon className="w-5 h-5 text-white" />
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-slate-900 truncate">{room.hotelName || room.hotel?.name || t('rooms.unknownHotel')}</div>
                                {room.hotel?.code && (
                                  <div className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded inline-block mt-1">{room.hotel.code}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-6 text-slate-700 font-semibold max-w-[120px] truncate" title={room.roomType}>
                            {room.roomType}
                          </td>
                          <td className="py-5 px-6 text-slate-600 font-medium max-w-[150px] truncate" title={`${room.roomTypeDescription}${room.altDescription ? ` | ${room.altDescription}` : ''}`}>
                            <div className="flex flex-col">
                              <span className="font-semibold">{room.roomTypeDescription}</span>
                              {room.altDescription && (
                                <span className="text-sm text-slate-500 italic truncate">{room.altDescription}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-5 px-6 text-slate-600">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 border border-blue-300/50 shadow-sm">
                              {BOARD_TYPE_MAPPINGS.apiToTranslated(room.boardType)}
                            </span>
                          </td>
                          <td className="py-5 px-6 text-slate-600 font-semibold">
                            {room.purchasePrice ? (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold bg-gradient-to-r from-green-100 to-green-200 text-green-900 border border-green-300/50 shadow-sm">
                                SAR {room.purchasePrice}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300/50 shadow-sm">-</span>
                            )}
                          </td>
                          <td className="py-5 px-6 text-slate-600 font-semibold">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-900 border border-indigo-300/50 shadow-sm">
                              SAR {room.basePrice}
                            </span>
                          </td>
                          <td className="py-5 px-6 text-slate-600 font-semibold">
                            {room.alternativePrice ? (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-100 to-orange-200 text-orange-900 border border-orange-300/50 shadow-sm">
                                SAR {room.alternativePrice}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300/50 shadow-sm">-</span>
                            )}
                          </td>
                          <td className="py-5 px-6 text-slate-600">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-900 border border-purple-300/50 shadow-sm">
                              {room.quantity}
                            </span>
                          </td>
                          <td className="py-5 px-6 text-slate-600 font-medium">
                            {room.availableFrom ? (
                              <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-teal-50 p-2 rounded-lg border border-emerald-200">
                                <CalendarDaysIcon className="w-4 h-4 text-emerald-600" />
                                <span className="font-semibold text-emerald-800">{new Date(room.availableFrom).toLocaleDateString()}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">-</span>
                            )}
                          </td>
                          <td className="py-5 px-6 text-slate-600 font-medium">
                            {room.availableTo ? (
                              <div className="flex items-center space-x-2 bg-gradient-to-r from-red-50 to-pink-50 p-2 rounded-lg border border-red-200">
                                <CalendarDaysIcon className="w-4 h-4 text-red-600" />
                                <span className="font-semibold text-red-800">{new Date(room.availableTo).toLocaleDateString()}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">-</span>
                            )}
                          </td>
                          <td className="py-5 px-6 text-slate-600 font-medium">
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-semibold text-slate-700">{new Date(room.createdAt).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleViewRoom(room.id)}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 border border-blue-500/30"
                              >
                                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {t('common.view')}
                              </button>
                              <button
                                onClick={() => handleEditRoom && handleEditRoom(room.id)}
                                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 border border-amber-400/30"
                              >
                                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                {t('common.edit')}
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(room.id)}
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 border border-red-400/30"
                              >
                                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                {t('common.delete')}
                              </button>
                              <button
                                onClick={() => handlePrintRoom && handlePrintRoom(room.id)}
                                className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 border border-slate-500/30"
                              >
                                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                {t('rooms.print')}
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
