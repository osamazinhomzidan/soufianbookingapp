'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
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
  const { isDark } = useTheme();
  
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
  
  // Screen width state for responsive design
  const [screenWidth, setScreenWidth] = useState(0);
  
  // State management
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [message]);
  
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
      quantity: '',
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
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedRoomDetails, setSelectedRoomDetails] = useState<Room | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editFormData, setEditFormData] = useState<RoomFormData | null>(null);
  const [editFormErrors, setEditFormErrors] = useState<string[]>([]);

  // API Functions
  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hotels?limit=all');
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

  // Auto-select first hotel when hotels are loaded
  useEffect(() => {
    if (hotels.length > 0 && !selectedHotelForMultiple) {
      setSelectedHotelForMultiple(hotels[0].id);
    }
  }, [hotels, selectedHotelForMultiple]);

  // Screen width tracking for responsive design
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    // Set initial screen width
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
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

  const handlePrintRoom = async (id: string) => {
    try {
      const response = await fetch(`/api/rooms/${id}`);
      const result: ApiResponse<Room> = await response.json();
      
      if (!result.success || !result.data) {
        alert(result.message || t('rooms.errorFetchingRoom'));
        return;
      }

      const room = result.data;
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        alert('Please allow popups to print room details');
        return;
      }

      // Generate print content
      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Room Details - ${room.roomType}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
                color: #333;
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #333;
                padding-bottom: 10px;
                margin-bottom: 20px;
              }
              .room-title {
                font-size: 24px;
                font-weight: bold;
                margin: 0;
              }
              .hotel-name {
                font-size: 16px;
                color: #666;
                margin: 5px 0;
              }
              .section {
                margin-bottom: 20px;
              }
              .section-title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 10px;
                color: #333;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                padding: 5px 0;
              }
              .info-label {
                font-weight: bold;
                width: 40%;
              }
              .info-value {
                width: 60%;
              }
              .description {
                background-color: #f9f9f9;
                padding: 10px;
                border-radius: 5px;
                margin-top: 10px;
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="room-title">${room.roomType}</h1>
              <p class="hotel-name">${room.hotel?.name || room.hotelName || t('rooms.unknownHotel')}</p>
            </div>
            
            <div class="section">
              <h2 class="section-title">${t('rooms.roomDetails')}</h2>
              <div class="info-row">
                <span class="info-label">${t('rooms.roomType')}:</span>
                <span class="info-value">${room.roomType}</span>
              </div>
              <div class="info-row">
                <span class="info-label">${t('rooms.boardType')}:</span>
                <span class="info-value">${room.boardType}</span>
              </div>
              <div class="info-row">
                <span class="info-label">${t('rooms.quantity')}:</span>
                <span class="info-value">${room.quantity}</span>
              </div>
              <div class="info-row">
                <span class="info-label">${t('rooms.status')}:</span>
                <span class="info-value">${room.isActive ? t('common.active') : t('common.inactive')}</span>
              </div>
            </div>
            
            <div class="section">
              <h2 class="section-title">${t('rooms.pricingAvailability')}</h2>
              <div class="info-row">
                <span class="info-label">${t('rooms.purchasePrice')}:</span>
                <span class="info-value">SAR ${room.purchasePrice}</span>
              </div>
              <div class="info-row">
                <span class="info-label">${t('rooms.basePrice')}:</span>
                <span class="info-value">SAR ${room.basePrice}</span>
              </div>
              ${room.alternativePrice ? `
              <div class="info-row">
                <span class="info-label">${t('rooms.alternativePrice')}:</span>
                <span class="info-value">SAR ${room.alternativePrice}</span>
              </div>` : ''}
              ${room.availableFrom ? `
              <div class="info-row">
                <span class="info-label">${t('rooms.availableFrom')}:</span>
                <span class="info-value">${new Date(room.availableFrom).toLocaleDateString()}</span>
              </div>` : ''}
              ${room.availableTo ? `
              <div class="info-row">
                <span class="info-label">${t('rooms.availableTo')}:</span>
                <span class="info-value">${new Date(room.availableTo).toLocaleDateString()}</span>
              </div>` : ''}
            </div>
            
            ${room.roomTypeDescription ? `
            <div class="section">
              <h2 class="section-title">${t('rooms.description')}</h2>
              <div class="description">${room.roomTypeDescription}</div>
            </div>` : ''}
            
            ${room.altDescription ? `
            <div class="section">
              <h2 class="section-title">${t('rooms.altDescription')}</h2>
              <div class="description">${room.altDescription}</div>
            </div>` : ''}
            
            <div class="section">
              <h2 class="section-title">${t('common.details')}</h2>
              <div class="info-row">
                <span class="info-label">${t('common.createdDate')}:</span>
                <span class="info-value">${new Date(room.createdAt).toLocaleDateString()}</span>
              </div>
              ${room.createdBy ? `
              <div class="info-row">
                <span class="info-label">${t('rooms.createdBy')}:</span>
                <span class="info-value">${room.createdBy.firstName || ''} ${room.createdBy.lastName || ''} (${room.createdBy.username})</span>
              </div>` : ''}
            </div>
            
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
    } catch (error) {
      console.error('Error printing room:', error);
      alert(t('rooms.errorFetchingRoom'));
    }
  };

  const handleSelectRoom = (id: string) => {
    setSelectedRooms(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAllRooms = () => {
    if (selectedRooms.length === (filteredRooms?.length || 0)) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms((filteredRooms || []).map(room => room.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRooms.length === 0) return;
    
    if (!confirm(tInterpolate('rooms.confirmDeleteSelectedRooms', { count: selectedRooms.length }))) {
      return;
    }

    try {
      setLoading(true);
      
      // Delete rooms one by one (could be optimized with batch delete API)
      const deletePromises = selectedRooms.map(id => 
        fetch(`/api/rooms/${id}`, { method: 'DELETE' })
      );
      
      const responses = await Promise.all(deletePromises);
      const results = await Promise.all(
        responses.map(response => response.json())
      );
      
      // Check if all deletions were successful
      const failedDeletions = results.filter(result => !result.success);
      
      if (failedDeletions.length === 0) {
        setRooms(rooms.filter(room => !selectedRooms.includes(room.id)));
        setSelectedRooms([]);
        setMessage({ type: 'success', text: t('rooms.selectedRoomsDeletedSuccessfully') });
      } else {
        setMessage({ type: 'error', text: `Failed to delete ${failedDeletions.length} room(s)` });
        // Refresh the list to get current state
        fetchRooms();
      }
    } catch (err) {
      setMessage({ type: 'error', text: t('rooms.errorDeletingRooms') });
      console.error('Delete selected rooms error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintSelected = () => {
    console.log('Print selected rooms:', selectedRooms);
    // Implement print functionality for selected rooms
  };

  const handleRowClick = (room: Room) => {
    setSelectedRoom(room);
    setEditingRoom(room);
    
    // Clear all selections and select only the current room
    setSelectedRooms([room.id]);
    
    // Populate edit form with room data
    setEditFormData({
      id: room.id,
      roomType: room.roomType,
      roomTypeDescription: room.roomTypeDescription,
      altDescription: room.altDescription,
      purchasePrice: room.purchasePrice.toString(),
      basePrice: room.basePrice.toString(),
      alternativePrice: room.alternativePrice?.toString() || '',
      availableFrom: room.availableFrom || '',
      availableTo: room.availableTo || '',
      quantity: room.quantity.toString(),
      boardType: room.boardType,
      hasAlternativePrice: !!room.alternativePrice
    });
    
    setEditFormErrors([]);
  };



  // Handle clear/cancel edit
  const handleClearEdit = () => {
    setEditingRoom(null);
    setEditFormData(null);
    setEditFormErrors([]);
    setSelectedRoom(null);
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

  const handleEditRoom = async (id: string) => {
    try {
      const response = await fetch(`/api/rooms/${id}`);
      const result: ApiResponse<Room> = await response.json();
      
      if (result.success && result.data) {
        const room = result.data;
        setEditingRoom(room);
        
        // Convert room data to form format
        setEditFormData({
          id: room.id,
          roomType: room.roomType,
          roomTypeDescription: room.roomTypeDescription,
          altDescription: room.altDescription,
          purchasePrice: room.purchasePrice.toString(),
          basePrice: room.basePrice.toString(),
          alternativePrice: room.alternativePrice?.toString() || '',
          availableFrom: room.availableFrom ? new Date(room.availableFrom).toISOString().split('T')[0] : '',
          availableTo: room.availableTo ? new Date(room.availableTo).toISOString().split('T')[0] : '',
          quantity: room.quantity.toString(),
          boardType: room.boardType,
          hasAlternativePrice: !!room.alternativePrice
        });
        setEditFormErrors([]);
      } else {
        alert(result.message || t('rooms.errorFetchingRoom'));
      }
    } catch (error) {
      console.error('Error fetching room for edit:', error);
      alert(t('rooms.errorFetchingRoom'));
    }
  };

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !editingRoom) return;

    // Validate form
    const validation = validateRoomForm(editFormData);
    setEditFormErrors(validation.errors);
    
    if (!validation.isValid) {
      setMessage({ 
        type: 'error', 
        text: tInterpolate('validation.formHasErrors', { count: validation.errors.length })
      });
      return;
    }

    try {
      setLoading(true);
      
      const updateData = {
        hotelId: editingRoom.hotelId, // Keep original hotel
        roomType: editFormData.roomType,
        roomTypeDescription: editFormData.roomTypeDescription,
        altDescription: editFormData.altDescription,
        purchasePrice: parseFloat(editFormData.purchasePrice),
        basePrice: parseFloat(editFormData.basePrice),
        alternativePrice: editFormData.alternativePrice ? parseFloat(editFormData.alternativePrice) : null,
        availableFrom: editFormData.availableFrom || null,
        availableTo: editFormData.availableTo || null,
        quantity: parseInt(editFormData.quantity),
        boardType: BOARD_TYPE_MAPPINGS.displayToApi[editFormData.boardType]
      };

      const response = await fetch(`/api/rooms/${editingRoom.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      const result: ApiResponse<Room> = await response.json();
      
      if (result.success && result.data) {
        // Update the room in the list
        setRooms(rooms.map(room => 
          room.id === editingRoom.id ? {
            ...result.data!,
            boardType: BOARD_TYPE_MAPPINGS.apiToDisplay[result.data!.boardType as keyof typeof BOARD_TYPE_MAPPINGS.apiToDisplay] || result.data!.boardType
          } : room
        ));
        
        // Close edit modal
        setEditingRoom(null);
        setEditFormData(null);
        setEditFormErrors([]);
        
        setMessage({ type: 'success', text: t('rooms.roomUpdatedSuccessfully') });
      } else {
        setMessage({ type: 'error', text: result.message || t('rooms.errorUpdatingRoom') });
      }
    } catch (error) {
      console.error('Error updating room:', error);
      setMessage({ type: 'error', text: t('rooms.errorUpdatingRoom') });
    } finally {
      setLoading(false);
    }
  };

  const updateEditFormField = (field: keyof RoomFormData, value: any) => {
    if (!editFormData) return;
    
    const updatedForm = { ...editFormData, [field]: value };
    setEditFormData(updatedForm);
    
    // Real-time validation
    const validation = validateRoomForm(updatedForm);
    setEditFormErrors(validation.errors);
  };



  return (
    <ProtectedRoute requiredRole="OWNER">
      <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
      }`}>
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl transition-colors duration-300 ${
            isDark 
              ? 'bg-gradient-to-br from-blue-600/10 to-purple-600/10' 
              : 'bg-gradient-to-br from-blue-400/20 to-purple-400/20'
          }`}></div>
          <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl transition-colors duration-300 ${
            isDark 
              ? 'bg-gradient-to-tr from-green-600/10 to-teal-600/10' 
              : 'bg-gradient-to-tr from-green-400/20 to-teal-400/20'
          }`}></div>
        </div>

        {/* Main content container - Horizontal Layout */}
        <div className="relative z-10 w-full h-screen overflow-hidden">
          <div className="flex h-full">
            
            {/* Left Side - Add/Edit Room Form (20%) */}
            <div className={`w-1/5 h-full overflow-y-auto backdrop-blur-sm border-r p-4 ${
              isDark 
                ? 'bg-gray-800/80 border-gray-700/60' 
                : 'bg-white/80 border-slate-200/60'
            }`}>

              {/* Message Display - Hotel Page Style */}
              {message && (
                <div className={`mb-10 p-6 rounded-2xl border-2 shadow-lg backdrop-blur-md transition-all duration-300 relative ${
                  message.type === 'success'
                    ? isDark 
                      ? 'bg-emerald-900/90 border-emerald-600/60 text-emerald-100' 
                      : 'bg-emerald-50/90 border-emerald-300/60 text-emerald-900'
                    : isDark 
                      ? 'bg-red-900/90 border-red-600/60 text-red-100' 
                      : 'bg-red-50/90 border-red-300/60 text-red-900'
                }`}>
                  {/* Close Button */}
                  <button
                    onClick={() => setMessage(null)}
                    className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                      message.type === 'success'
                        ? isDark 
                          ? 'bg-emerald-800/60 hover:bg-emerald-700/80 text-emerald-200' 
                          : 'bg-emerald-200/60 hover:bg-emerald-300/80 text-emerald-700'
                        : isDark 
                          ? 'bg-red-800/60 hover:bg-red-700/80 text-red-200' 
                          : 'bg-red-200/60 hover:bg-red-300/80 text-red-700'
                    }`}
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center space-x-4 pr-8">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
                      message.type === 'success' 
                        ? isDark ? 'bg-emerald-800' : 'bg-emerald-100'
                        : isDark ? 'bg-red-800' : 'bg-red-100'
                    }`}>
                      {message.type === 'success' ? (
                        <svg className={`w-6 h-6 ${
                          isDark ? 'text-emerald-300' : 'text-emerald-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className={`w-6 h-6 ${
                          isDark ? 'text-red-300' : 'text-red-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <span className="font-bold text-lg">{message.text}</span>
                  </div>
                </div>
              )}

              {/* Hotel Selection - Hotel Page Style */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1 max-w-xs">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className={`w-4 h-4 transition-colors duration-300 ${
                        isDark ? 'text-indigo-400' : 'text-indigo-500'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 font-bold text-sm ${
                        isDark 
                          ? 'bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 hover:border-gray-500 focus:ring-indigo-500/50 focus:border-indigo-500' 
                          : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400 hover:border-gray-400 focus:ring-indigo-500/50 focus:border-indigo-500'
                      }`}
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
                
                {/* Plus/Minus Controls - Always Visible */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={addRoomForm}
                    disabled={!selectedHotelForMultiple}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 focus:ring-2 focus:ring-offset-1 ${
                      selectedHotelForMultiple
                        ? isDark 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-400/50' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/50'
                        : isDark
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    title={t('rooms.addAnotherRoom')}
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRoomForm(roomForms[roomForms.length - 1].id)}
                    disabled={!selectedHotelForMultiple || roomForms.length <= 1}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 focus:ring-2 focus:ring-offset-1 ${
                      selectedHotelForMultiple && roomForms.length > 1
                        ? isDark 
                          ? 'bg-gray-600 hover:bg-gray-700 text-gray-200 focus:ring-gray-500/50' 
                          : 'bg-gray-300 hover:bg-gray-400 text-gray-700 focus:ring-gray-500/50'
                        : isDark
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                    title={t('rooms.removeLastRoom')}
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  {selectedHotelForMultiple && (
                    <div className={`ml-2 px-4 py-1 rounded-md text-xs font-black transition-colors duration-200  ${
                      isDark 
                        ? 'bg-gray-700/50 text-gray-300' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {roomForms.length}
                    </div>
                  )}
                </div>
              </div>
              {/* Multiple Room Forms */}
              {(selectedHotelForMultiple || editingRoom) && (
                <form onSubmit={editingRoom ? handleUpdateRoom : handleAddMultipleRooms} className="space-y-4 max-w-6xl mx-auto">
                  {editingRoom && editFormData ? (
                    // Single edit form when editing
                    <div className={`border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-3 relative ${
                      isDark 
                        ? 'bg-gray-800/50 border-gray-700/60' 
                        : 'bg-white/80 border-slate-200/60'
                    }`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* Room Type */}
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDark ? 'text-gray-300' : 'text-slate-600'
                          }`}>
                            {t('rooms.roomType')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={editFormData.roomType}
                            onChange={(e) => updateEditFormField('roomType', e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors ${
                              isDark ? 'bg-gray-700/50 border-gray-600 text-gray-200' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                            placeholder={t('rooms.roomTypePlaceholder')}
                          />
                        </div>

                        {/* Board Type */}
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDark ? 'text-gray-300' : 'text-slate-600'
                          }`}>
                            {t('rooms.boardType')} <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={editFormData.boardType}
                            onChange={(e) => updateEditFormField('boardType', e.target.value as RoomFormData['boardType'])}
                            className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors ${
                              isDark ? 'bg-gray-700/50 border-gray-600 text-gray-200' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          >
                            <option value="Room only">{t('rooms.roomOnly')}</option>
                            <option value="Bed & breakfast">{t('rooms.bedBreakfast')}</option>
                            <option value="Half board">{t('rooms.halfBoard')}</option>
                            <option value="Full board">{t('rooms.fullBoard')}</option>
                          </select>
                        </div>

                        {/* Room Description */}
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDark ? 'text-gray-300' : 'text-slate-600'
                          }`}>
                            {t('rooms.roomDescription')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={editFormData.roomTypeDescription}
                            onChange={(e) => updateEditFormField('roomTypeDescription', e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors ${
                              isDark ? 'bg-gray-700/50 border-gray-600 text-gray-200' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                            placeholder={t('rooms.roomDescriptionPlaceholder')}
                          />
                        </div>

                        {/* Alternative Description */}
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDark ? 'text-gray-300' : 'text-slate-600'
                          }`}>
                            {t('rooms.altDescription')}
                          </label>
                          <input
                            type="text"
                            value={editFormData.altDescription}
                            onChange={(e) => updateEditFormField('altDescription', e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors ${
                              isDark ? 'bg-gray-700/50 border-gray-600 text-gray-200' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                            placeholder={t('rooms.altDescriptionPlaceholder')}
                          />
                        </div>

                        {/* Purchase Price */}
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDark ? 'text-gray-300' : 'text-slate-600'
                          }`}>
                            {t('rooms.purchasePrice')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editFormData.purchasePrice}
                            onChange={(e) => updateEditFormField('purchasePrice', e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors ${
                              isDark ? 'bg-gray-700/50 border-gray-600 text-gray-200' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                            placeholder="0.00"
                          />
                        </div>

                        {/* Base Price */}
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDark ? 'text-gray-300' : 'text-slate-600'
                          }`}>
                            {t('rooms.basePrice')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editFormData.basePrice}
                            onChange={(e) => updateEditFormField('basePrice', e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors ${
                              isDark ? 'bg-gray-700/50 border-gray-600 text-gray-200' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                            placeholder="0.00"
                          />
                        </div>

                        {/* Alternative Price */}
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDark ? 'text-gray-300' : 'text-slate-600'
                          }`}>
                            {t('rooms.alternativePrice')}
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editFormData.alternativePrice}
                            onChange={(e) => updateEditFormField('alternativePrice', e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors ${
                              isDark ? 'bg-gray-700/50 border-gray-600 text-gray-200' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                            placeholder="0.00"
                          />
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDark ? 'text-gray-300' : 'text-slate-600'
                          }`}>
                            {t('rooms.quantity')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={editFormData.quantity}
                            onChange={(e) => updateEditFormField('quantity', e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors ${
                              isDark ? 'bg-gray-700/50 border-gray-600 text-gray-200' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                            placeholder="1"
                          />
                        </div>

                        {/* Available From */}
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDark ? 'text-gray-300' : 'text-slate-600'
                          }`}>
                            {t('rooms.availableFrom')}
                          </label>
                          <input
                            type="date"
                            value={editFormData.availableFrom}
                            onChange={(e) => updateEditFormField('availableFrom', e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors ${
                              isDark ? 'bg-gray-700/50 border-gray-600 text-gray-200' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        {/* Available To */}
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDark ? 'text-gray-300' : 'text-slate-600'
                          }`}>
                            {t('rooms.availableTo')}
                          </label>
                          <input
                            type="date"
                            value={editFormData.availableTo}
                            onChange={(e) => updateEditFormField('availableTo', e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors ${
                              isDark ? 'bg-gray-700/50 border-gray-600 text-gray-200' : 'bg-white border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Multiple room forms when adding
                    roomForms.map((roomForm, index) => (
                    <div key={roomForm.id} className={`border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-3 relative ${
                      isDark 
                        ? 'bg-gray-800/40 border-gray-600/50 hover:bg-gray-800/60' 
                        : 'bg-white/90 border-gray-200/60 hover:bg-white backdrop-blur-sm'
                    }`}>
                      {/* Room Header - Minimalistic Style */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                            isDark 
                              ? 'bg-blue-600' 
                              : 'bg-blue-600'
                          }`}>
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className={`text-lg font-semibold transition-colors duration-200 ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              {tInterpolate('rooms.roomNumber', { number: index + 1 })}
                            </h4>
                           
                          </div>
                        </div>
                        {roomForms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRoomForm(roomForm.id)}
                            className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-all duration-200 focus:ring-2 focus:ring-red-500/30"
                            title={t('rooms.removeThisRoom')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Form Validation Errors - Hotel Page Style */}
                      {
                        /*
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
                        */
                      }

                      {/* Room Form Fields - Paired Layout */}
                      <div className="space-y-3 max-w-4xl mx-auto">
                        {/* Row 1: Room Type & Board Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Room Type */}
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                              <HomeIcon className={`w-4 h-4 transition-colors duration-200 ${
                                isDark ? 'text-blue-400' : 'text-blue-500'
                              }`} />
                            </div>
                            <input
                              type="text"
                              value={roomForm.roomType}
                              onChange={(e) => updateRoomForm(roomForm.id, 'roomType', e.target.value)}
                              className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:border-blue-500 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md ${
                                formErrors[roomForm.id]?.some(error => error.includes('room type') || error.includes('Room Type')) 
                                  ? `border-red-500 focus:ring-red-500/30 ${
                                      isDark ? 'bg-red-900/20 text-white placeholder-red-300' : 'bg-red-50 text-gray-900 placeholder-gray-500'
                                    }` 
                                  : `border-gray-300 focus:ring-blue-500/30 ${
                                      isDark ? 'bg-gray-700/50 text-white placeholder-gray-400 border-gray-600' : 'bg-white text-gray-900 placeholder-gray-500'
                                    }`
                              }`}
                              placeholder={t('rooms.roomTypePlaceholder')}
                              maxLength={100}
                              required
                            />
                          </div>

                          {/* Board Type */}
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                              <Cog6ToothIcon className={`w-4 h-4 transition-colors duration-200 ${
                                isDark ? 'text-blue-400' : 'text-blue-500'
                              }`} />
                            </div>
                            <select
                              value={roomForm.boardType}
                              onChange={(e) => updateRoomForm(roomForm.id, 'boardType', e.target.value as any)}
                              className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md ${
                                isDark ? 'bg-gray-700/50 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                              }`}
                            >
                              <option value="Room only">{t('rooms.roomOnly')}</option>
                              <option value="Bed & breakfast">{t('rooms.bedBreakfast')}</option>
                              <option value="Half board">{t('rooms.halfBoard')}</option>
                              <option value="Full board">{t('rooms.fullBoard')}</option>
                            </select>
                          </div>
                        </div>

                        {/* Row 2: Room Description & Alt Description */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Room Description */}
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                              <DocumentTextIcon className={`w-4 h-4 transition-colors duration-200 ${
                                isDark ? 'text-blue-400' : 'text-blue-500'
                              }`} />
                            </div>
                            <input
                              type="text"
                              value={roomForm.roomTypeDescription}
                              onChange={(e) => updateRoomForm(roomForm.id, 'roomTypeDescription', e.target.value)}
                              className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:border-blue-500 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md ${
                                formErrors[roomForm.id]?.some(error => error.includes('description') || error.includes('Description')) 
                                  ? `border-red-500 focus:ring-red-500/30 ${
                                      isDark ? 'bg-red-900/20 text-white placeholder-red-300' : 'bg-red-50 text-gray-900 placeholder-gray-500'
                                    }` 
                                  : `border-gray-300 focus:ring-blue-500/30 ${
                                      isDark ? 'bg-gray-700/50 text-white placeholder-gray-400 border-gray-600' : 'bg-white text-gray-900 placeholder-gray-500'
                                    }`
                              }`}
                              placeholder={t('rooms.descriptionPlaceholder')}
                              maxLength={500}
                              required
                            />
                          </div>

                          {/* Alt Description */}
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                              <ChatBubbleLeftRightIcon className={`w-4 h-4 transition-colors duration-200 ${
                                isDark ? 'text-blue-400' : 'text-blue-500'
                              }`} />
                            </div>
                            <input
                              type="text"
                              value={roomForm.altDescription}
                              onChange={(e) => updateRoomForm(roomForm.id, 'altDescription', e.target.value)}
                              className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md ${
                                isDark ? 'bg-gray-700/50 text-white placeholder-gray-400 border-gray-600' : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300'
                              }`}
                              placeholder={t('rooms.altDescriptionPlaceholder')}
                            />
                          </div>
                        </div>

                        {/* Price Inputs Section - 3 inputs in a row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Purchase Price */}
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                              <CurrencyDollarIcon className={`w-4 h-4 transition-colors duration-300 ${
                                isDark ? 'text-blue-400' : 'text-blue-600'
                              }`} />
                            </div>
                            <input
                              type="number"
                              value={roomForm.purchasePrice}
                              onChange={(e) => updateRoomForm(roomForm.id, 'purchasePrice', e.target.value)}
                              className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:border-blue-500 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md ${
                                formErrors[roomForm.id]?.some(error => error.includes('purchase') || error.includes('Purchase')) 
                                  ? `border-red-500 focus:ring-red-500/30 ${
                                      isDark ? 'bg-red-900/20 text-white placeholder-red-300' : 'bg-red-50/80 text-slate-900 placeholder-slate-500'
                                    }` 
                                  : `border-slate-300 focus:ring-blue-500/30 ${
                                      isDark ? 'bg-gray-700/50 text-white placeholder-gray-400 border-gray-600' : 'bg-white text-slate-900 placeholder-slate-500'
                                    }`
                              }`}
                              placeholder={t('rooms.purchasePricePlaceholder')}
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>

                          {/* Base Price */}
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                              <CurrencyDollarIcon className={`w-4 h-4 transition-colors duration-300 ${
                                isDark ? 'text-blue-400' : 'text-blue-600'
                              }`} />
                            </div>
                            <input
                              type="number"
                              value={roomForm.basePrice}
                              onChange={(e) => updateRoomForm(roomForm.id, 'basePrice', e.target.value)}
                              className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:border-blue-500 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md ${
                                formErrors[roomForm.id]?.some(error => error.includes('base') || error.includes('Base') || error.includes('higher')) 
                                  ? `border-red-500 focus:ring-red-500/30 ${
                                      isDark ? 'bg-red-900/20 text-white placeholder-red-300' : 'bg-red-50/80 text-slate-900 placeholder-slate-500'
                                    }` 
                                  : `border-slate-300 focus:ring-blue-500/30 ${
                                      isDark ? 'bg-gray-700/50 text-white placeholder-gray-400 border-gray-600' : 'bg-white text-slate-900 placeholder-slate-500'
                                    }`
                              }`}
                              placeholder={t('rooms.sellingPricePlaceholder')}
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>

                          {/* Alternative Price */}
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                              <CurrencyDollarIcon className={`w-4 h-4 transition-colors duration-300 ${
                                isDark ? 'text-blue-400' : 'text-blue-600'
                              }`} />
                            </div>
                            <input
                              type="number"
                              value={roomForm.alternativePrice}
                              onChange={(e) => updateRoomForm(roomForm.id, 'alternativePrice', e.target.value)}
                              className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:border-blue-500 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md ${
                                formErrors[roomForm.id]?.some(error => error.includes('alternative') || error.includes('Alternative')) 
                                  ? `border-red-500 focus:ring-red-500/30 ${
                                      isDark ? 'bg-red-900/20 text-white placeholder-red-300' : 'bg-red-50/80 text-slate-900 placeholder-slate-500'
                                    }` 
                                  : `border-slate-300 focus:ring-blue-500/30 ${
                                      isDark ? 'bg-gray-700/50 text-white placeholder-gray-400 border-gray-600' : 'bg-white text-slate-900 placeholder-slate-500'
                                    }`
                              }`}
                              placeholder={t('rooms.altPricePlaceholder')}
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        {/* Row 3: Quantity, Available From & Available To */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Quantity */}
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                              <HashtagIcon className={`w-4 h-4 transition-colors duration-200 ${
                                isDark ? 'text-blue-400' : 'text-blue-500'
                              }`} />
                            </div>
                            <input
                              type="number"
                              value={roomForm.quantity}
                              onChange={(e) => updateRoomForm(roomForm.id, 'quantity', e.target.value)}
                              className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:border-blue-500 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md ${
                                formErrors[roomForm.id]?.some(error => error.includes('quantity') || error.includes('Quantity')) 
                                  ? `border-red-500 focus:ring-red-500/30 ${
                                      isDark ? 'bg-red-900/20 text-white placeholder-red-300' : 'bg-red-50 text-gray-900 placeholder-gray-500'
                                    }` 
                                  : `border-gray-300 focus:ring-blue-500/30 ${
                                      isDark ? 'bg-gray-700/50 text-white placeholder-gray-400 border-gray-600' : 'bg-white text-gray-900 placeholder-gray-500'
                                    }`
                              }`}
                              placeholder={t('rooms.roomQuantityPlaceholder')}
                              min="1"
                              required
                            />
                          </div>

                          {/* Available From */}
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                              <CalendarDaysIcon className={`w-4 h-4 transition-colors duration-300 ${
                                isDark ? 'text-blue-400' : 'text-blue-600'
                              }`} />
                            </div>
                            <input
                              type="date"
                              value={roomForm.availableFrom}
                              onChange={(e) => updateRoomForm(roomForm.id, 'availableFrom', e.target.value)}
                              className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:border-blue-500 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md ${
                                formErrors[roomForm.id]?.some(error => error.includes('date') || error.includes('Date') || error.includes('availability')) 
                                  ? `border-red-500 focus:ring-red-500/30 ${
                                      isDark ? 'bg-red-900/20 text-white' : 'bg-red-50/80 text-slate-900'
                                    }` 
                                  : `border-slate-300 focus:ring-blue-500/30 ${
                                      isDark ? 'bg-gray-700/50 text-white border-gray-600' : 'bg-white text-slate-900'
                                    }`
                              }`}
                            />
                          </div>

                          {/* Available To */}
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                              <CalendarDaysIcon className={`w-4 h-4 transition-colors duration-300 ${
                                isDark ? 'text-blue-400' : 'text-blue-600'
                              }`} />
                            </div>
                            <input
                              type="date"
                              value={roomForm.availableTo}
                              onChange={(e) => updateRoomForm(roomForm.id, 'availableTo', e.target.value)}
                              className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:border-blue-500 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md ${
                                formErrors[roomForm.id]?.some(error => error.includes('date') || error.includes('Date') || error.includes('availability')) 
                                  ? `border-red-500 focus:ring-red-500/30 ${
                                      isDark ? 'bg-red-900/20 text-white' : 'bg-red-50/80 text-slate-900'
                                    }` 
                                  : `border-slate-300 focus:ring-blue-500/30 ${
                                      isDark ? 'bg-gray-700/50 text-white border-gray-600' : 'bg-white text-slate-900'
                                    }`
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )))
                  }

                  {/* Action Buttons - Minimalistic Style */}
                  <div className="flex flex-wrap gap-4 mt-6">
                    <button
                      type="submit"
                      className={`flex-1 px-6 py-2.5 font-medium text-sm rounded-lg transition-all duration-200 focus:ring-2 focus:ring-offset-1 ${
                        editingRoom 
                          ? (loading ? 'bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-blue-900 text-white focus:ring-blue-800/50 hover:bg-black shadow-lg')
                          : (!selectedHotelForMultiple || roomForms.length === 0 || loading || isValidating
                            ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-900 text-white focus:ring-blue-800/50 hover:bg-black shadow-lg')
                      }`}
                      disabled={editingRoom ? loading : (!selectedHotelForMultiple || roomForms.length === 0 || loading || isValidating)}
                    >
                      {editingRoom 
                        ? (loading ? t('common.updating') : t('rooms.updateRoom'))
                        : (loading ? t('rooms.addingRooms') : isValidating ? t('rooms.validatingRooms') : (roomForms.length === 1 ? t('rooms.addRoom') : tInterpolate('rooms.addRoomsCount', { count: roomForms.length })))
                      }
                    </button>
                    <button
                      type="button"
                      onClick={editingRoom ? handleClearEdit : resetMultipleRoomForms}
                      className={`flex-1 px-6 py-2.5 font-medium text-sm rounded-lg transition-all duration-200 focus:ring-2 focus:ring-offset-1 ${
                        isDark 
                          ? 'bg-gray-900 hover:bg-black text-gray-300 focus:ring-gray-700/50 shadow-lg' 
                          : 'bg-gray-800 hover:bg-gray-900 text-gray-200 focus:ring-gray-600/50 shadow-lg'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                          <XMarkIcon className="w-4 h-4" />
                          <span>{editingRoom ? t('common.clear') : t('common.reset')}</span>
                        </div>
                    </button>
                  </div>
                  
                  {/* Selected Room Action Buttons */}
                  {selectedRoom && (
                    <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                      
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewRoom(selectedRoom.id)}
                          className={`py-2 px-3 rounded-lg font-semibold text-xs transition-all duration-300 focus:outline-none focus:ring-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] bg-gradient-to-r from-blue-900 to-blue-800 hover:from-black hover:to-gray-900 text-white focus:ring-blue-800/50`}
                        >
                          {t('rooms.view')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrintRoom(selectedRoom.id)}
                          className={`py-2 px-3 rounded-lg font-semibold text-xs transition-all duration-300 focus:outline-none focus:ring-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] bg-gradient-to-r from-gray-800 to-gray-700 hover:from-black hover:to-gray-900 text-white focus:ring-gray-700/50`}
                        >
                          {t('rooms.print')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRoom(selectedRoom.id)}
                          className={`py-2 px-3 rounded-lg font-semibold text-xs transition-all duration-300 focus:outline-none focus:ring-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-800 text-white focus:ring-gray-800/50`}
                        >
                          {t('rooms.delete')}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Right Side - View Rooms Section */}
            <div className={`w-4/5 h-full overflow-y-auto backdrop-blur-sm p-6 ${
              isDark 
                ? 'bg-gray-800/80' 
                : 'bg-white/80'
            }`}>

              {/* Filters Section - Two Rows */}
              <div className="mb-6 space-y-3">
                {/* First Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Global Search */}
                  <input
                    type="text"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className={`px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600 placeholder-gray-400 text-white hover:bg-gray-700' 
                        : 'bg-white/80 border-gray-300 placeholder-gray-500 text-gray-900 hover:bg-white'
                    }`}
                    placeholder="Search rooms or hotels"
                  />

                  {/* Hotel Selection */}
                  <select
                    value={hotelFilter}
                    onChange={(e) => setHotelFilter(e.target.value)}
                    className={`px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 appearance-none cursor-pointer ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700' 
                        : 'bg-white/80 border-gray-300 text-gray-900 hover:bg-white'
                    }`}
                  >
                    <option value="">All Hotels</option>
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
                    className={`px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 appearance-none cursor-pointer ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700' 
                        : 'bg-white/80 border-gray-300 text-gray-900 hover:bg-white'
                    }`}
                  >
                    <option value="">Board Type</option>
                    <option value="Room only">Room Only</option>
                    <option value="Bed & breakfast">Bed & Breakfast</option>
                    <option value="Half board">Half Board</option>
                    <option value="Full board">Full Board</option>
                  </select>

                  {/* Room Type */}
                  <input
                    type="text"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className={`px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Room Type"
                  />
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Purchase Price Range */}
                  <div className="flex gap-1">
                  <input
                    type="number"
                    value={minPurchasePriceFilter}
                    onChange={(e) => setMinPurchasePriceFilter(e.target.value)}
                    className={`w-full px-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Min Purchase Price"
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="number"
                    value={maxPurchasePriceFilter}
                    onChange={(e) => setMaxPurchasePriceFilter(e.target.value)}
                    className={`w-full px-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Max Purchase Price"
                    min="0"
                    step="0.01"
                  />
                </div>

                  {/* Base Price Range */}
                  <div className="flex gap-1">
                  <input
                    type="number"
                    value={minBasePriceFilter}
                    onChange={(e) => setMinBasePriceFilter(e.target.value)}
                    className={`w-full px-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Min Base Price"
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="number"
                    value={maxBasePriceFilter}
                    onChange={(e) => setMaxBasePriceFilter(e.target.value)}
                    className={`w-full px-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Max Base Price"
                    min="0"
                    step="0.01"
                  />
                </div>

                  {/* Availability Dates */}
                  <div className="flex gap-1">
                  <input
                    type="date"
                    value={availableFromFilter}
                    onChange={(e) => setAvailableFromFilter(e.target.value)}
                    className={`w-full px-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600 text-white' 
                        : 'bg-white/80 border-gray-300 text-gray-900'
                    }`}
                    title="Available From"
                  />
                  <input
                    type="date"
                    value={availableToFilter}
                    onChange={(e) => setAvailableToFilter(e.target.value)}
                    className={`w-full px-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600 text-white' 
                        : 'bg-white/80 border-gray-300 text-gray-900'
                    }`}
                    title="Available To"
                  />
                </div>

                  {/* Quantity Range */}
                  <div className="flex gap-1">
                  <input
                    type="number"
                    value={minQuantityFilter}
                    onChange={(e) => setMinQuantityFilter(e.target.value)}
                    className={`w-full px-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Min Qty"
                    min="0"
                  />
                  <input
                    type="number"
                    value={maxQuantityFilter}
                    onChange={(e) => setMaxQuantityFilter(e.target.value)}
                    className={`w-full px-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Max Qty"
                    min="0"
                  />
                   {/* Clear All Button */}
                <div className="flex justify-end">
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
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                    isDark 
                      ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                      : 'bg-slate-600 hover:bg-slate-500 text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Clear</span>
                </button>
                </div>
                </div>
                </div>
                
               
              </div>

              {/* Selected Rooms Actions */}
              {/*
                  {selectedRooms.length > 0 && (
                <div className={`flex flex-wrap gap-3 p-4 border rounded-xl mb-6 transition-colors duration-300 ${
                  isDark ? 'bg-blue-900/30 border-blue-800/50' : 'bg-blue-50/50 border-blue-200/50'
                }`}>
                  <div className={`flex items-center space-x-2 font-medium transition-colors duration-300 ${
                    isDark ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{selectedRooms.length} selected</span>
                  </div>
                  <button
                    onClick={handleDeleteSelected}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>{t('rooms.deleteSelected')}</span>
                  </button>
                  <button
                    onClick={handlePrintSelected}
                    className="px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white text-sm rounded-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span>{t('rooms.printSelected')}</span>
                  </button>
                </div>
              )}
              */}



              {/* Rooms Table */}
              <div className={`rounded-lg border transition-colors duration-300 ${
                isDark ? 'border-gray-700/60 bg-gray-800/90' : 'border-slate-200/60 bg-white/90'
              }`}>
                {loading ? (
                  <div className="flex justify-center items-center py-16">
                    <div className="flex items-center space-x-4">
                      <svg className="animate-spin h-10 w-10 text-blue-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className={`font-bold text-lg transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-slate-700'
                      }`}>{t('common.loading')}</span>
                    </div>
                  </div>
                ) : filteredRooms.length > 0 ? (
                  <div className="flex flex-col h-full">
                    {/* Enhanced Responsive Table Header */}
                    <div className={`sticky top-0 z-10 flex-shrink-0 border-b ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-gray-50 border-gray-300'
                    }`}>
                      <div className={`grid gap-1 sm:gap-2 font-bold text-xs whitespace-nowrap overflow-hidden ${
                        screenWidth < 640 
                          ? 'px-1 py-1 text-[6px]'
                          : screenWidth < 768
                          ? 'px-1 py-1 text-[7px]'
                          : screenWidth < 1024
                          ? 'px-1 sm:px-2 py-1 sm:py-2 text-[7px] sm:text-[8px]'
                          : screenWidth < 1366
                          ? 'px-2 py-2 text-[9px]'
                          : screenWidth < 1920
                          ? 'px-3 py-2 text-xs'
                          : screenWidth < 2560
                          ? 'px-4 py-3 text-sm'
                          : 'px-5 py-4 text-base'
                      }`} style={{
                        gridTemplateColumns: screenWidth < 640 
                          ? 'minmax(20px, 25px) minmax(80px, 100px) minmax(40px, 50px) minmax(60px, 80px) minmax(50px, 70px) minmax(45px, 55px) minmax(45px, 55px) minmax(45px, 55px) minmax(35px, 45px) minmax(50px, 60px) minmax(50px, 60px) minmax(60px, 70px) minmax(35px, 45px)'
                          : screenWidth < 768
                          ? 'minmax(22px, 27px) minmax(100px, 120px) minmax(50px, 60px) minmax(70px, 90px) minmax(60px, 80px) minmax(55px, 65px) minmax(55px, 65px) minmax(55px, 65px) minmax(40px, 50px) minmax(60px, 70px) minmax(60px, 70px) minmax(70px, 80px) minmax(40px, 50px)'
                          : screenWidth < 1024
                          ? 'minmax(25px, 30px) minmax(120px, 140px) minmax(60px, 70px) minmax(80px, 100px) minmax(70px, 90px) minmax(65px, 75px) minmax(65px, 75px) minmax(65px, 75px) minmax(50px, 60px) minmax(70px, 80px) minmax(70px, 80px) minmax(80px, 90px) minmax(50px, 60px)'
                          : screenWidth < 1366
                          ? 'minmax(22px, 28px) minmax(110px, 130px) minmax(55px, 65px) minmax(75px, 90px) minmax(65px, 80px) minmax(60px, 70px) minmax(60px, 70px) minmax(60px, 70px) minmax(45px, 55px) minmax(65px, 75px) minmax(65px, 75px) minmax(75px, 85px) minmax(45px, 55px)'
                          : screenWidth < 1920
                          ? 'minmax(35px, 40px) minmax(160px, 180px) minmax(80px, 90px) minmax(120px, 140px) minmax(100px, 120px) minmax(90px, 100px) minmax(90px, 100px) minmax(90px, 100px) minmax(70px, 80px) minmax(100px, 110px) minmax(100px, 110px) minmax(120px, 130px) minmax(70px, 80px)'
                          : screenWidth < 2560
                          ? 'minmax(40px, 50px) minmax(180px, 220px) minmax(90px, 110px) minmax(140px, 170px) minmax(120px, 150px) minmax(100px, 120px) minmax(100px, 120px) minmax(100px, 120px) minmax(80px, 100px) minmax(120px, 140px) minmax(120px, 140px) minmax(140px, 160px) minmax(80px, 100px)'
                          : 'minmax(50px, 60px) minmax(220px, 280px) minmax(110px, 140px) minmax(170px, 220px) minmax(150px, 200px) minmax(130px, 170px) minmax(130px, 170px) minmax(130px, 170px) minmax(100px, 130px) minmax(150px, 190px) minmax(150px, 190px) minmax(170px, 210px) minmax(100px, 130px)'
                      }}>
                        <div className={`flex items-center justify-center ${
                          isDark ? 'text-gray-200' : 'text-slate-700'
                        }`}>
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={selectedRooms.length === filteredRooms.length && filteredRooms.length > 0}
                              onChange={handleSelectAllRooms}
                              className={`w-4 h-4 rounded border cursor-pointer ${
                                isDark
                                  ? 'text-blue-400 bg-gray-700 border-gray-500'
                                  : 'text-blue-600 bg-white border-gray-300'
                              }`}
                            />
                          </div>
                        </div>
                        <div className={`text-left flex items-center gap-2 ${
                          isDark ? 'text-gray-200' : 'text-slate-700'
                        }`}>
                          <BuildingOfficeIcon className="w-3 h-3 opacity-70" />
                          {t('rooms.hotel')}
                        </div>
                        <div className={`text-left flex items-center gap-2 ${
                          isDark ? 'text-gray-200' : 'text-slate-700'
                        }`}>
                          <HomeIcon className="w-3 h-3 opacity-70" />
                          {t('rooms.roomType')}
                        </div>
                        <div className={`text-left flex items-center gap-2 ${
                          isDark ? 'text-gray-200' : 'text-slate-700'
                        }`}>
                          <DocumentTextIcon className="w-3 h-3 opacity-70" />
                          {t('rooms.roomDescription')}
                        </div>
                        <div className={`text-left flex items-center gap-2 ${
                          isDark ? 'text-gray-200' : 'text-slate-700'
                        }`}>
                          <ChatBubbleLeftRightIcon className="w-3 h-3 opacity-70" />
                          {t('rooms.boardType')}
                        </div>
                        <div className={`text-left flex items-center gap-2 ${
                          isDark ? 'text-gray-200' : 'text-slate-700'
                        }`}>
                          <CurrencyDollarIcon className="w-3 h-3 opacity-70" />
                          {t('rooms.purchasePrice')}
                        </div>
                        <div className={`text-left flex items-center gap-2 ${
                          isDark ? 'text-gray-200' : 'text-slate-700'
                        }`}>
                          <CurrencyDollarIcon className="w-3 h-3 opacity-70" />
                          {t('rooms.basePrice')}
                        </div>
                        <div className={`text-left flex items-center gap-2 ${
                          isDark ? 'text-gray-200' : 'text-slate-700'
                        }`}>
                          <CurrencyDollarIcon className="w-3 h-3 opacity-70" />
                          {t('rooms.alternativePrice')}
                        </div>
                        <div className={`text-left flex items-center gap-2 ${
                          isDark ? 'text-gray-200' : 'text-slate-700'
                        }`}>
                          <HashtagIcon className="w-3 h-3 opacity-70" />
                          {t('rooms.quantity')}
                        </div>
                        <div className={`text-left flex items-center gap-2 ${
                          isDark ? 'text-gray-200' : 'text-slate-700'
                        }`}>
                          <CalendarDaysIcon className="w-3 h-3 opacity-70" />
                          {t('rooms.availableFrom')}
                        </div>
                        <div className={`text-left flex items-center gap-2 ${
                          isDark ? 'text-gray-200' : 'text-slate-700'
                        }`}>
                          <CalendarDaysIcon className="w-3 h-3 opacity-70" />
                          {t('rooms.availableTo')}
                        </div>
                        <div className={`text-left flex items-center gap-2 ${
                          isDark ? 'text-gray-200' : 'text-slate-700'
                        }`}>
                          <CalendarDaysIcon className="w-3 h-3 opacity-70" />
                          {t('common.createdDate')}
                        </div>

                      </div>
                  </div>
                  {/* Scrollable Body */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 max-h-[calc(100vh-400px)]">
                    <div className={`divide-y-2 transition-colors duration-300 ${
                      isDark ? 'divide-gray-700/40' : 'divide-slate-200/40'
                    }`}>
                    {filteredRooms.map((room, index) => (
                      <div key={room.id} onClick={() => handleRowClick(room)} className={`grid items-center transition-all duration-200 gap-1 sm:gap-2 cursor-pointer ${
                        screenWidth < 640 
                          ? 'px-1 py-1 text-[7px]'
                          : screenWidth < 768
                          ? 'px-1 py-1 text-[8px]'
                          : screenWidth < 1024
                          ? 'px-1 sm:px-2 py-1 sm:py-2 text-[8px] sm:text-[10px]'
                          : screenWidth < 1366
                          ? 'px-2 py-2 text-xs'
                          : screenWidth < 1920
                          ? 'px-3 py-2 text-sm'
                          : screenWidth < 2560
                          ? 'px-4 py-3 text-base'
                          : 'px-5 py-4 text-lg'
                      } ${
                        isDark 
                          ? `hover:bg-gray-700/30 ${index % 2 === 0 ? 'bg-gray-800/20' : 'bg-gray-700/10'}` 
                          : `hover:bg-blue-50/40 ${index % 2 === 0 ? 'bg-white/60' : 'bg-slate-50/40'}`
                      }`} style={{
                        gridTemplateColumns: screenWidth < 640 
                          ? 'minmax(20px, 25px) minmax(80px, 100px) minmax(40px, 50px) minmax(60px, 80px) minmax(50px, 70px) minmax(45px, 55px) minmax(45px, 55px) minmax(45px, 55px) minmax(35px, 45px) minmax(50px, 60px) minmax(50px, 60px) minmax(60px, 70px)'
                          : screenWidth < 768
                          ? 'minmax(22px, 27px) minmax(100px, 120px) minmax(50px, 60px) minmax(70px, 90px) minmax(60px, 80px) minmax(55px, 65px) minmax(55px, 65px) minmax(55px, 65px) minmax(40px, 50px) minmax(60px, 70px) minmax(60px, 70px) minmax(70px, 80px)'
                          : screenWidth < 1024
                          ? 'minmax(25px, 30px) minmax(120px, 140px) minmax(60px, 70px) minmax(80px, 100px) minmax(70px, 90px) minmax(65px, 75px) minmax(65px, 75px) minmax(65px, 75px) minmax(50px, 60px) minmax(70px, 80px) minmax(70px, 80px) minmax(80px, 90px)'
                          : screenWidth < 1366
                          ? 'minmax(22px, 28px) minmax(110px, 130px) minmax(55px, 65px) minmax(75px, 90px) minmax(65px, 80px) minmax(60px, 70px) minmax(60px, 70px) minmax(60px, 70px) minmax(45px, 55px) minmax(65px, 75px) minmax(65px, 75px) minmax(75px, 85px)'
                          : screenWidth < 1920
                          ? 'minmax(35px, 40px) minmax(160px, 180px) minmax(80px, 90px) minmax(120px, 140px) minmax(100px, 120px) minmax(90px, 100px) minmax(90px, 100px) minmax(90px, 100px) minmax(70px, 80px) minmax(100px, 110px) minmax(100px, 110px) minmax(120px, 130px)'
                          : screenWidth < 2560
                          ? 'minmax(40px, 50px) minmax(180px, 220px) minmax(90px, 110px) minmax(140px, 170px) minmax(120px, 150px) minmax(100px, 120px) minmax(100px, 120px) minmax(100px, 120px) minmax(80px, 100px) minmax(120px, 140px) minmax(120px, 140px) minmax(140px, 160px)'
                          : 'minmax(50px, 60px) minmax(220px, 280px) minmax(110px, 140px) minmax(170px, 220px) minmax(150px, 200px) minmax(130px, 170px) minmax(130px, 170px) minmax(130px, 170px) minmax(100px, 130px) minmax(150px, 190px) minmax(150px, 190px) minmax(170px, 210px)'
                      }}>
                        <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={selectedRooms.includes(room.id)}
                              onChange={() => handleSelectRoom(room.id)}
                              onClick={(e) => e.stopPropagation()}
                              className={`w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 transition-colors duration-300 ${
                                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                              }`}
                            />
                        </div>
                        <div className={`flex items-center transition-colors duration-200 ${
                          isDark ? 'text-gray-100' : 'text-slate-900'
                        }`} title={room.hotelName || room.hotel?.name || t('rooms.unknownHotel')}>
                            <div className="flex items-center space-x-2">
                              <div className="flex-shrink-0">
                                <div className={`w-6 h-6 rounded flex items-center justify-center ${
                                  isDark ? 'bg-blue-600' : 'bg-blue-500'
                                }`}>
                                  <BuildingOfficeIcon className="w-3 h-3 text-white" />
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className={`font-medium break-words ${
                                  isDark ? 'text-gray-100' : 'text-slate-900'
                                }`}>{room.hotelName || room.hotel?.name || t('rooms.unknownHotel')}</div>
                                {room.hotel?.code && (
                                  <div className={`text-xs font-mono opacity-60 break-words ${
                                    isDark ? 'text-gray-400' : 'text-slate-500'
                                  }`}>{room.hotel.code}</div>
                                )}
                              </div>
                            </div>
                        </div>
                        <div className={`flex items-center font-medium break-words ${
                          isDark ? 'text-gray-200' : 'text-slate-800'
                        }`} title={room.roomType}>
                          {room.roomType}
                        </div>
                        <div className={`flex items-center break-words ${
                          isDark ? 'text-gray-300' : 'text-slate-700'
                        }`} title={`${room.roomTypeDescription}${room.altDescription ? ` | ${room.altDescription}` : ''}`}>
                            <div className="flex flex-col min-w-0">
                              <span className={`font-medium break-words ${
                                isDark ? 'text-gray-200' : 'text-slate-800'
                              }`}>{room.roomTypeDescription}</span>
                              {room.altDescription && (
                                <span className={`text-xs opacity-70 break-words ${
                                  isDark ? 'text-gray-400' : 'text-slate-500'
                                }`}>{room.altDescription}</span>
                              )}
                            </div>
                        </div>
                        <div className={`flex items-center ${
                          isDark ? 'text-gray-300' : 'text-slate-700'
                        }`}>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              isDark 
                                ? 'bg-blue-800/50 text-blue-200 border border-blue-700/30' 
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                              {BOARD_TYPE_MAPPINGS.apiToTranslated(room.boardType)}
                            </span>
                        </div>
                        <div className={`flex items-center font-medium ${
                          isDark ? 'text-gray-300' : 'text-slate-700'
                        }`}>
                            {room.purchasePrice ? (
                              <span className={`text-xs font-medium ${
                                isDark ? 'text-green-300' : 'text-green-700'
                              }`}>
                                SAR {room.purchasePrice}
                              </span>
                            ) : (
                              <span className={`text-xs opacity-50 ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}>-</span>
                            )}
                        </div>
                        <div className={`flex items-center font-medium ${
                          isDark ? 'text-gray-300' : 'text-slate-700'
                        }`}>
                            <span className={`text-xs font-medium ${
                              isDark ? 'text-indigo-300' : 'text-indigo-700'
                            }`}>
                              SAR {room.basePrice}
                            </span>
                        </div>
                        <div className={`flex items-center font-medium ${
                          isDark ? 'text-gray-300' : 'text-slate-700'
                        }`}>
                            {room.alternativePrice ? (
                              <span className={`text-xs font-medium ${
                                isDark ? 'text-orange-300' : 'text-orange-700'
                              }`}>
                                SAR {room.alternativePrice}
                              </span>
                            ) : (
                              <span className={`text-xs opacity-50 ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}>-</span>
                            )}
                        </div>
                        <div className={`flex items-center font-medium ${
                          isDark ? 'text-gray-300' : 'text-slate-700'
                        }`}>
                            <span className={`text-xs font-medium ${
                              isDark ? 'text-purple-300' : 'text-purple-700'
                            }`}>
                              {room.quantity}
                            </span>
                        </div>
                        <div className={`flex items-center font-medium ${
                          isDark ? 'text-gray-300' : 'text-slate-700'
                        }`}>
                            {room.availableFrom ? (
                              <div className="flex items-center space-x-1">
                                <CalendarDaysIcon className={`w-3 h-3 ${
                                  isDark ? 'text-emerald-400' : 'text-emerald-600'
                                }`} />
                                <span className={`text-xs font-medium ${
                                  isDark ? 'text-emerald-300' : 'text-emerald-700'
                                }`}>{new Date(room.availableFrom).toLocaleDateString()}</span>
                              </div>
                            ) : (
                              <span className={`text-xs opacity-50 ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}>-</span>
                            )}
                        </div>
                        <div className={`flex items-center font-medium ${
                          isDark ? 'text-gray-300' : 'text-slate-700'
                        }`}>
                            {room.availableTo ? (
                              <div className="flex items-center space-x-1">
                                <CalendarDaysIcon className={`w-3 h-3 ${
                                  isDark ? 'text-red-400' : 'text-red-600'
                                }`} />
                                <span className={`text-xs font-medium ${
                                  isDark ? 'text-red-300' : 'text-red-700'
                                }`}>{new Date(room.availableTo).toLocaleDateString()}</span>
                              </div>
                            ) : (
                              <span className={`text-xs opacity-50 ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}>-</span>
                            )}
                        </div>
                        <div className={`flex items-center font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                            <div className="flex items-center space-x-1">
                              <svg className={`w-3 h-3 ${isDark ? 'text-gray-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className={`text-xs font-medium ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{new Date(room.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                      </div>
                      ))}
                    </div>
                  </div>
                 </div>
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
          <div className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
            isDark ? 'bg-black/70' : 'bg-black/50'
          }`}>
            <div className={`backdrop-blur-xl border rounded-3xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
              isDark 
                ? 'bg-gray-800/95 border-gray-600/30' 
                : 'bg-white/90 border-white/20'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-2xl font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {t('rooms.roomDetails')}
                </h3>
                <button
                  onClick={() => setSelectedRoomDetails(null)}
                  className={`p-2 rounded-xl transition-colors ${
                    isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/50'
                  }`}
                >
                  <svg className={`w-6 h-6 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6 px-2 sm:px-4 lg:px-6 xl:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {t('rooms.hotel')}
                    </label>
                    <div className={`px-4 py-3 border rounded-xl ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600/50 text-gray-200' 
                        : 'bg-gray-50/50 border-gray-200/50 text-gray-800'
                    }`}>
                      {selectedRoomDetails.hotelName || selectedRoomDetails.hotel?.name || t('rooms.unknownHotel')}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {t('rooms.roomType')}
                    </label>
                    <div className={`px-4 py-3 border rounded-xl ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600/50 text-gray-200' 
                        : 'bg-gray-50/50 border-gray-200/50 text-gray-800'
                    }`}>
                      {selectedRoomDetails.roomType}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {t('rooms.boardType')}
                    </label>
                    <div className={`px-4 py-3 border rounded-xl ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600/50 text-gray-200' 
                        : 'bg-gray-50/50 border-gray-200/50 text-gray-800'
                    }`}>
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        isDark 
                          ? 'bg-blue-800/50 text-blue-200' 
                          : 'bg-blue-100/50 text-blue-800'
                      }`}>
                        {BOARD_TYPE_MAPPINGS.apiToTranslated(selectedRoomDetails.boardType)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Purchase Price
                    </label>
                    <div className={`px-4 py-3 border rounded-xl font-semibold ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600/50 text-gray-200' 
                        : 'bg-gray-50/50 border-gray-200/50 text-gray-800'
                    }`}>
                      {selectedRoomDetails.purchasePrice ? (
                        <span className={`font-semibold ${
                          isDark ? 'text-green-400' : 'text-green-600'
                        }`}>SAR {selectedRoomDetails.purchasePrice}</span>
                      ) : (
                        <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>-</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Base Price
                    </label>
                    <div className={`px-4 py-3 border rounded-xl font-semibold ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600/50 text-gray-200' 
                        : 'bg-gray-50/50 border-gray-200/50 text-gray-800'
                    }`}>
                      SAR {selectedRoomDetails.basePrice}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Alternative Price
                    </label>
                    <div className={`px-4 py-3 border rounded-xl ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600/50 text-gray-200' 
                        : 'bg-gray-50/50 border-gray-200/50 text-gray-800'
                    }`}>
                      {selectedRoomDetails.alternativePrice ? (
                        <span className={`font-semibold ${
                          isDark ? 'text-orange-400' : 'text-orange-600'
                        }`}>SAR {selectedRoomDetails.alternativePrice}</span>
                      ) : (
                        <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>-</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {t('rooms.quantity')}
                    </label>
                    <div className={`px-4 py-3 border rounded-xl font-semibold ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600/50 text-gray-200' 
                        : 'bg-gray-50/50 border-gray-200/50 text-gray-800'
                    }`}>
                      {selectedRoomDetails.quantity}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {t('common.createdDate')}
                    </label>
                    <div className={`px-4 py-3 border rounded-xl ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600/50 text-gray-200' 
                        : 'bg-gray-50/50 border-gray-200/50 text-gray-800'
                    }`}>
                      {new Date(selectedRoomDetails.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {t('rooms.roomDescription')}
                    </label>
                    <div className={`px-4 py-3 border rounded-xl min-h-[80px] ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600/50 text-gray-200' 
                        : 'bg-gray-50/50 border-gray-200/50 text-gray-800'
                    }`}>
                      {selectedRoomDetails.roomTypeDescription || '-'}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {t('rooms.altDescription')}
                    </label>
                    <div className={`px-4 py-3 border rounded-xl min-h-[80px] ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600/50 text-gray-200' 
                        : 'bg-gray-50/50 border-gray-200/50 text-gray-800'
                    }`}>
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
                    className={`px-6 py-3 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 ${
                      isDark 
                        ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                        : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                    }`}
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
