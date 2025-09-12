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
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Fetch hotels from API
  const fetchHotels = async (search = '', location = '', hasRooms = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (location) params.append('location', location);
      if (hasRooms && hasRooms !== 'all') params.append('hasRooms', hasRooms);
      // Add limit=all to fetch all hotels without pagination
      params.append('limit', 'all');
      
      const queryString = params.toString();
      const url = `/api/hotels?${queryString}`;
      
      const response = await fetch(url, {
        credentials: 'include'
      });
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
    
    // Handle screen resize for responsive table
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
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
        credentials: 'include'
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
              credentials: 'include'
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
        location: hotelLocation || null,
        description: hotelDescription || null,
        altDescription: altHotelDescription || null
      };

      const response = await fetch(`/api/hotels/${editingHotel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hotelData),
        credentials: 'include'
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
              credentials: 'include'
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
        credentials: 'include'
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

  const handleRowClick = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setEditingHotel(hotel); // Automatically set to edit mode
    // Populate form fields with selected hotel data
    setHotelName(hotel.name);
    setHotelCode(hotel.code);
    setAltHotelName(hotel.altName || '');
    setHotelAddress(hotel.address || '');
    setHotelLocation(hotel.location || '');
    setHotelDescription(hotel.description || '');
    setAltHotelDescription(hotel.altDescription || '');
    // Clear agreement files as they can't be pre-populated
    setAgreementFiles([]);
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

  const handlePrintSelectedHotel = () => {
    if (!selectedHotel) {
      console.log('No hotel selected for printing');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow popups to print hotel details');
      return;
    }

    // Generate print content using the same layout as handlePrint
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hotel Details - ${selectedHotel.name}</title>
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
            .hotel-title {
              font-size: 24px;
              font-weight: bold;
              margin: 0;
            }
            .hotel-code {
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
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-bottom: 15px;
            }
            .info-item {
              display: flex;
              flex-direction: column;
            }
            .info-label {
              font-weight: bold;
              color: #555;
              margin-bottom: 2px;
            }
            .info-value {
              color: #333;
            }
            .description {
              margin-top: 10px;
              padding: 10px;
              background-color: #f9f9f9;
              border-left: 4px solid #007bff;
            }
            .agreements {
              margin-top: 15px;
            }
            .agreement-item {
              padding: 8px;
              margin: 5px 0;
              background-color: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 4px;
            }
            @media print {
              body { margin: 0; }
              .header { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="hotel-title">${selectedHotel.name}</h1>
            <p class="hotel-code">Code: ${selectedHotel.code}</p>
          </div>
          
          <div class="section">
            <h2 class="section-title">Hotel Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Hotel Name:</span>
                <div class="info-value">${selectedHotel.name}</div>
              </div>
              <div class="info-item">
                <span class="info-label">Hotel Code:</span>
                <div class="info-value">${selectedHotel.code}</div>
              </div>
              <div class="info-item">
                <span class="info-label">Alternative Name:</span>
                <div class="info-value">${selectedHotel.altName || 'N/A'}</div>
              </div>
              <div class="info-item">
                <span class="info-label">Room Count:</span>
                <div class="info-value">${selectedHotel.roomCount || 0} rooms</div>
              </div>
              <div class="info-item">
                <span class="info-label">Address:</span>
                <div class="info-value">${selectedHotel.address || 'N/A'}</div>
              </div>
              <div class="info-item">
                <span class="info-label">Location:</span>
                <div class="info-value">${selectedHotel.location || 'N/A'}</div>
              </div>
              <div class="info-item">
                <span class="info-label">Created Date:</span>
                <div class="info-value">${new Date(selectedHotel.createdAt).toLocaleDateString()}</div>
              </div>
              ${selectedHotel.createdBy ? `
              <div class="info-item">
                <span class="info-label">Created By:</span>
                <div class="info-value">${selectedHotel.createdBy.firstName && selectedHotel.createdBy.lastName
                  ? `${selectedHotel.createdBy.firstName} ${selectedHotel.createdBy.lastName}`
                  : selectedHotel.createdBy.username}</div>
              </div>
              ` : ''}
            </div>
          </div>
          
          ${(selectedHotel.description || selectedHotel.altDescription) ? `
          <div class="section">
            <h2 class="section-title">Description</h2>
            ${selectedHotel.description ? `
            <div class="description">
              <strong>Description:</strong><br>
              <div>${selectedHotel.description}</div>
            </div>
            ` : ''}
            ${selectedHotel.altDescription ? `
            <div class="description">
              <strong>Alternative Description:</strong><br>
              <div>${selectedHotel.altDescription}</div>
            </div>
            ` : ''}
          </div>
          ` : ''}
          
          ${selectedHotel.agreements && selectedHotel.agreements.length > 0 ?
            `<div class="section">
              <h2 class="section-title">Agreements (${selectedHotel.agreements.length})</h2>
              <div class="agreements">
                ${selectedHotel.agreements.map(agreement => `
                  <div class="agreement-item">
                    <strong>${agreement.fileName}</strong><br>
                    <small>Size: ${(agreement.fileSize / 1024).toFixed(2)} KB | Type: ${agreement.mimeType}</small><br>
                    <small>Uploaded: ${new Date(agreement.uploadedAt).toLocaleDateString()}</small>
                  </div>
                `).join('')}
              </div>
            </div>` : ''
          }
        </body>
      </html>
    `;

    // Write content and print
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const handlePrint = () => {
    if (!selectedHotelDetails) {
      console.log('No hotel selected for printing');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow popups to print hotel details');
      return;
    }

    // Generate print content
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hotel Details - ${selectedHotelDetails.name}</title>
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
            .hotel-title {
              font-size: 24px;
              font-weight: bold;
              margin: 0;
            }
            .hotel-code {
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
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
              margin-bottom: 10px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 15px;
            }
            .info-item {
              margin-bottom: 10px;
            }
            .info-label {
              font-weight: bold;
              color: #555;
            }
            .info-value {
              margin-top: 2px;
            }
            .description {
              background-color: #f9f9f9;
              padding: 10px;
              border-radius: 5px;
              margin: 10px 0;
            }
            .agreements {
              margin-top: 20px;
            }
            .agreement-item {
              background-color: #f5f5f5;
              padding: 10px;
              margin: 5px 0;
              border-radius: 5px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .agreement-info {
              flex: 1;
            }
            .agreement-name {
              font-weight: bold;
            }
            .agreement-details {
              font-size: 12px;
              color: #666;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ccc;
              padding-top: 10px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="hotel-title">${selectedHotelDetails.name}</h1>
            <p class="hotel-code">Code: ${selectedHotelDetails.code}</p>
          </div>

          <div class="section">
            <h2 class="section-title">Basic Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Hotel Name:</div>
                <div class="info-value">${selectedHotelDetails.name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Hotel Code:</div>
                <div class="info-value">${selectedHotelDetails.code}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Alternative Name:</div>
                <div class="info-value">${selectedHotelDetails.altName || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Room Count:</div>
                <div class="info-value">${selectedHotelDetails.roomCount || 0} rooms</div>
              </div>
              <div class="info-item">
                <div class="info-label">Address:</div>
                <div class="info-value">${selectedHotelDetails.address || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Location:</div>
                <div class="info-value">${selectedHotelDetails.location || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Created Date:</div>
                <div class="info-value">${new Date(selectedHotelDetails.createdAt).toLocaleDateString()}</div>
              </div>
              ${selectedHotelDetails.createdBy ? `
              <div class="info-item">
                <div class="info-label">Created By:</div>
                <div class="info-value">${selectedHotelDetails.createdBy.firstName && selectedHotelDetails.createdBy.lastName 
                  ? `${selectedHotelDetails.createdBy.firstName} ${selectedHotelDetails.createdBy.lastName}` 
                  : selectedHotelDetails.createdBy.username}</div>
              </div>
              ` : ''}
            </div>
          </div>

          ${(selectedHotelDetails.description || selectedHotelDetails.altDescription) ? `
          <div class="section">
            <h2 class="section-title">Description</h2>
            ${selectedHotelDetails.description ? `
            <div class="description">
              <div class="info-label">Description:</div>
              <div>${selectedHotelDetails.description}</div>
            </div>
            ` : ''}
            ${selectedHotelDetails.altDescription ? `
            <div class="description">
              <div class="info-label">Alternative Description:</div>
              <div>${selectedHotelDetails.altDescription}</div>
            </div>
            ` : ''}
          </div>
          ` : ''}

          <div class="section">
            <h2 class="section-title">Agreement Files</h2>
            <div class="agreements">
              ${selectedHotelDetails.agreements && selectedHotelDetails.agreements.length > 0 ? 
                selectedHotelDetails.agreements.map(agreement => `
                <div class="agreement-item">
                  <div class="agreement-info">
                    <div class="agreement-name">${agreement.fileName}</div>
                    <div class="agreement-details">
                      ${(agreement.fileSize / 1024).toFixed(1)} KB • Uploaded: ${new Date(agreement.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                `).join('') : 
                '<p>No agreement files uploaded</p>'
              }
            </div>
          </div>

          <div class="footer">
            <p>Printed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </body>
      </html>
    `;

    // Write content to print window
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const handlePrintSelected = () => {
    if (selectedHotels.length === 0) {
      alert('Please select hotels to print');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow popups to print selected hotels');
      return;
    }

    // Generate print content for selected hotels
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Selected Hotels List</title>
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
            .title {
              font-size: 24px;
              font-weight: bold;
              margin: 0;
            }
            .subtitle {
              font-size: 16px;
              color: #666;
              margin: 5px 0;
            }
            .hotel-item {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 15px;
              background-color: #f9f9f9;
            }
            .hotel-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            }
            .hotel-name {
              font-size: 18px;
              font-weight: bold;
              color: #333;
            }
            .hotel-code {
              font-size: 14px;
              color: #666;
              background-color: #e9ecef;
              padding: 2px 8px;
              border-radius: 4px;
            }
            .hotel-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-top: 10px;
            }
            .detail-item {
              font-size: 14px;
            }
            .detail-label {
              font-weight: bold;
              color: #555;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ccc;
              padding-top: 10px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">Selected Hotels List</h1>
            <p class="subtitle">${selectedHotels.length} hotel(s) selected</p>
          </div>

          <div class="hotels-list">
            ${selectedHotels.map(hotelId => {
              const hotel = hotels.find(h => h.id === hotelId);
              if (!hotel) return '';
              return `
                <div class="hotel-item">
                  <div class="hotel-header">
                    <div class="hotel-name">${hotel.name}</div>
                    <div class="hotel-code">${hotel.code}</div>
                  </div>
                  <div class="hotel-details">
                    <div class="detail-item">
                      <span class="detail-label">Alternative Name:</span> ${hotel.altName || 'N/A'}
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Room Count:</span> ${hotel.roomCount || 0} rooms
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Address:</span> ${hotel.address || 'N/A'}
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Location:</span> ${hotel.location || 'N/A'}
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Files:</span> ${hotel.agreementCount || 0} file(s)
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Created:</span> ${new Date(hotel.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div class="footer">
            <p>Printed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </body>
      </html>
    `;

    // Write content to print window
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const handleDeleteAll = () => {
    setHotels([]);
    setSelectedHotels([]);
    console.log('All hotels deleted');
  };

  const handlePrintAll = () => {
    if (hotels.length === 0) {
      alert('No hotels available to print');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow popups to print all hotels');
      return;
    }

    // Generate print content for all hotels
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>All Hotels List</title>
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
            .title {
              font-size: 24px;
              font-weight: bold;
              margin: 0;
            }
            .subtitle {
              font-size: 16px;
              color: #666;
              margin: 5px 0;
            }
            .hotel-item {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 15px;
              background-color: #f9f9f9;
            }
            .hotel-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            }
            .hotel-name {
              font-size: 18px;
              font-weight: bold;
              color: #333;
            }
            .hotel-code {
              font-size: 14px;
              color: #666;
              background-color: #e9ecef;
              padding: 2px 8px;
              border-radius: 4px;
            }
            .hotel-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-top: 10px;
            }
            .detail-item {
              font-size: 14px;
            }
            .detail-label {
              font-weight: bold;
              color: #555;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ccc;
              padding-top: 10px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">All Hotels List</h1>
            <p class="subtitle">Total: ${hotels.length} hotel(s)</p>
          </div>

          <div class="hotels-list">
            ${hotels.map(hotel => `
              <div class="hotel-item">
                <div class="hotel-header">
                  <div class="hotel-name">${hotel.name}</div>
                  <div class="hotel-code">${hotel.code}</div>
                </div>
                <div class="hotel-details">
                  <div class="detail-item">
                    <span class="detail-label">Alternative Name:</span> ${hotel.altName || 'N/A'}
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Room Count:</span> ${hotel.roomCount || 0} rooms
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Address:</span> ${hotel.address || 'N/A'}
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Location:</span> ${hotel.location || 'N/A'}
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Files:</span> ${hotel.agreementCount || 0} file(s)
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Created:</span> ${new Date(hotel.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="footer">
            <p>Printed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </body>
      </html>
    `;

    // Write content to print window
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const handleExit = () => {
    console.log('Exit dashboard');
    // Handle exit logic
  };

  return (
    <ProtectedRoute requiredRole="OWNER">
      <div className={`h-screen overflow-hidden transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-950' 
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
      }`}>
        <div className="h-full flex flex-col p-2 sm:p-4 lg:p-6 gap-4 sm:gap-6 lg:gap-8">
          {/* Error Display */}
          {error && (
            <div className={`rounded-xl shadow-lg p-4 sm:p-6 backdrop-blur-sm border ${
              isDark 
                ? 'bg-red-900/90 border-red-700/50' 
                : 'bg-red-50/90 border-red-200/50'
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
              <div className={`border-2 rounded-2xl shadow-2xl p-4 sm:p-6 h-fit backdrop-blur-md ${
                isDark 
                  ? 'bg-gradient-to-br from-gray-800/90 to-slate-900/90 border-gray-600/30 shadow-black/20' 
                  : 'bg-gradient-to-br from-white/95 to-blue-50/95 border-blue-200/30 shadow-blue-500/10'
              }`}>
          <form onSubmit={editingHotel ? handleUpdateHotel : handleAddHotel} className="space-y-1">
            {/* All inputs in vertical layout */}
            <div className="space-y-1">
              {/* Hotel Name */}
              <div>
                <div className="relative">
                  <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <input
                    type="text"
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm font-medium min-h-[2.5rem] hover:border-blue-400/50 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 hover:bg-gray-50'
                    }`}
                    placeholder={t('hotels.enterHotelName')}
                    required
                  />
                </div>
              </div>

              {/* Alt Hotel Name */}
              <div>
                <div className="relative">
                  <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <input
                    type="text"
                    value={altHotelName}
                    onChange={(e) => setAltHotelName(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm font-medium min-h-[2.5rem] hover:border-blue-400/50 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 hover:bg-gray-50'
                    }`}
                    placeholder={t('hotels.enterAltName')}
                    required
                  />
                </div>
              </div>

              {/* Hotel Code */}
              <div>
                <div className="relative">
                  <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  <input
                    type="text"
                    value={hotelCode}
                    onChange={(e) => setHotelCode(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm font-medium min-h-[2.5rem] hover:border-blue-400/50 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 hover:bg-gray-50'
                    }`}
                    placeholder={t('hotels.enterHotelCode')}
                    required
                  />
                </div>
              </div>

              {/* Hotel Address */}
              <div>
                <div className="relative">
                  <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="text"
                    value={hotelAddress}
                    onChange={(e) => setHotelAddress(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm font-medium min-h-[2.5rem] hover:border-blue-400/50 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 hover:bg-gray-50'
                    }`}
                    placeholder={t('hotels.enterHotelAddress')}
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <div className="relative">
                  <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <input
                    type="text"
                    value={hotelLocation}
                    onChange={(e) => setHotelLocation(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm font-medium min-h-[2.5rem] hover:border-blue-400/50 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 hover:bg-gray-50'
                    }`}
                    placeholder={t('hotels.enterLocation')}
                  />
                </div>
              </div>

              {/* Hotel Description */}
              <div>
                <div className="relative">
                  <svg className={`absolute left-3 top-3 w-4 h-4 z-10 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <textarea
                    value={hotelDescription}
                    onChange={(e) => setHotelDescription(e.target.value)}
                    rows={1}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm font-medium resize-none hover:border-blue-400/50 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 hover:bg-gray-50'
                    }`}
                    placeholder={t('hotels.enterHotelDescription')}
                  />
                </div>
              </div>

              {/* Alt Hotel Description */}
              <div>
                <div className="relative">
                  <svg className={`absolute left-3 top-3 w-4 h-4 z-10 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <textarea
                    value={altHotelDescription}
                    onChange={(e) => setAltHotelDescription(e.target.value)}
                    rows={1}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm font-medium resize-none hover:border-blue-400/50 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 hover:bg-gray-50'
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
            
            {/* Selected Hotel Action Buttons */}
            {selectedHotel && (
              <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleViewHotel(selectedHotel.id)}
                    className={`py-2 px-3 rounded-lg font-semibold text-xs transition-all duration-300 focus:outline-none focus:ring-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white focus:ring-blue-300/50`}
                  >
                    {t('common.view')}
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintSelectedHotel}
                    className={`py-2 px-3 rounded-lg font-semibold text-xs transition-all duration-300 focus:outline-none focus:ring-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white focus:ring-green-300/50`}
                  >
                    {t('common.print')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteHotel(selectedHotel.id)}
                    className={`py-2 px-3 rounded-lg font-semibold text-xs transition-all duration-300 focus:outline-none focus:ring-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white focus:ring-red-300/50`}
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            )}
          </form>
            </div>
          </div>

            {/* Hotels List Section - Right Side */}
            <div className="flex-1 min-w-0">
              <div className={`border rounded-lg p-3 sm:p-4 h-full flex flex-col ${
                isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-gradient-to-br from-white/95 to-blue-50/95'
              }`}>
        
          {/* Search and Filter Section */}
          <div className="flex-shrink-0">
            {/* Single Row Filter Section */}
            <div className="mb-4">
               {/* All Filters in Single Horizontal Row */}
               <div className={`flex flex-wrap items-center ${
                 screenWidth < 640 
                   ? 'gap-1' 
                   : screenWidth < 768
                   ? 'gap-1.5'
                   : screenWidth < 1024
                   ? 'gap-2'
                   : screenWidth < 1366
                   ? 'gap-2.5'
                   : 'gap-3'
               }`}>
                {/* Name Filter */}
                 <div className={`relative flex-1 min-w-0 ${
                   screenWidth < 640 
                     ? 'min-w-[90px]' 
                     : screenWidth < 768
                     ? 'min-w-[110px]'
                     : screenWidth < 1024
                     ? 'min-w-[130px]'
                     : screenWidth < 1366
                     ? 'min-w-[150px]'
                     : 'min-w-[170px]'
                 }`}>
                   <svg className={`absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 ${
                     screenWidth < 640 
                       ? 'w-3 h-3' 
                       : screenWidth < 768
                       ? 'w-3.5 h-3.5'
                       : screenWidth < 1024
                       ? 'w-4 h-4'
                       : 'w-4 h-4'
                   } pointer-events-none z-10 ${
                     isDark ? 'text-gray-400' : 'text-slate-400'
                   }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                   </svg>
                   <input
                     type="text"
                     value={nameFilter}
                     onChange={(e) => setNameFilter(e.target.value)}
                     className={`w-full ${
                       screenWidth < 640 
                         ? 'pl-6 pr-2 py-1 text-xs' 
                         : screenWidth < 768
                         ? 'pl-7 pr-2 py-1.5 text-xs'
                         : screenWidth < 1024
                         ? 'pl-8 pr-2 py-1.5 text-sm'
                         : 'pl-9 pr-3 py-2 text-sm'
                     } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                       isDark 
                         ? 'bg-gray-700/50 border-gray-600 placeholder-gray-400 text-white hover:bg-gray-700' 
                         : 'bg-white/80 border-gray-300 placeholder-gray-500 text-gray-900 hover:bg-white'
                     }`}
                     placeholder={t('hotels.searchByName')}
                   />
                 </div>

                {/* Code Filter */}
                 <div className={`relative flex-1 min-w-0 ${
                   screenWidth < 640 
                     ? 'min-w-[80px]' 
                     : screenWidth < 768
                     ? 'min-w-[100px]'
                     : screenWidth < 1024
                     ? 'min-w-[120px]'
                     : screenWidth < 1366
                     ? 'min-w-[140px]'
                     : 'min-w-[160px]'
                 }`}>
                   <svg className={`absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 ${
                     screenWidth < 640 
                       ? 'w-3 h-3' 
                       : screenWidth < 768
                       ? 'w-3.5 h-3.5'
                       : screenWidth < 1024
                       ? 'w-4 h-4'
                       : 'w-4 h-4'
                   } pointer-events-none z-10 ${
                     isDark ? 'text-gray-400' : 'text-slate-400'
                   }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                   </svg>
                   <input
                     type="text"
                     value={codeFilter}
                     onChange={(e) => setCodeFilter(e.target.value)}
                     className={`w-full ${
                       screenWidth < 640 
                         ? 'pl-6 pr-2 py-1 text-xs' 
                         : screenWidth < 768
                         ? 'pl-7 pr-2 py-1.5 text-xs'
                         : screenWidth < 1024
                         ? 'pl-8 pr-2 py-1.5 text-sm'
                         : 'pl-9 pr-3 py-2 text-sm'
                     } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                       isDark 
                         ? 'bg-gray-700/50 border-gray-600 placeholder-gray-400 text-white hover:bg-gray-700' 
                         : 'bg-white/80 border-gray-300 placeholder-gray-500 text-gray-900 hover:bg-white'
                     }`}
                     placeholder={t('hotels.searchByCode')}
                   />
                 </div>

                {/* Location Filter */}
                 <div className={`relative flex-1 min-w-0 ${
                   screenWidth < 640 
                     ? 'min-w-[85px]' 
                     : screenWidth < 768
                     ? 'min-w-[105px]'
                     : screenWidth < 1024
                     ? 'min-w-[125px]'
                     : screenWidth < 1366
                     ? 'min-w-[145px]'
                     : 'min-w-[165px]'
                 }`}>
                   <svg className={`absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 ${
                     screenWidth < 640 
                       ? 'w-3 h-3' 
                       : screenWidth < 768
                       ? 'w-3.5 h-3.5'
                       : screenWidth < 1024
                       ? 'w-4 h-4'
                       : 'w-4 h-4'
                   } pointer-events-none z-10 ${
                     isDark ? 'text-gray-400' : 'text-slate-400'
                   }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                   </svg>
                   <input
                     type="text"
                     value={locationFilter}
                     onChange={(e) => setLocationFilter(e.target.value)}
                     className={`w-full ${
                       screenWidth < 640 
                         ? 'pl-6 pr-2 py-1 text-xs' 
                         : screenWidth < 768
                         ? 'pl-7 pr-2 py-1.5 text-xs'
                         : screenWidth < 1024
                         ? 'pl-8 pr-2 py-1.5 text-sm'
                         : 'pl-9 pr-3 py-2 text-sm'
                     } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                       isDark 
                         ? 'bg-gray-700/50 border-gray-600 placeholder-gray-400 text-white hover:bg-gray-700' 
                         : 'bg-white/80 border-gray-300 placeholder-gray-500 text-gray-900 hover:bg-white'
                     }`}
                     placeholder={t('hotels.searchByLocation')}
                   />
                 </div>

                {/* Address Filter */}
                 <div className={`relative flex-1 min-w-0 ${
                   screenWidth < 640 
                     ? 'min-w-[85px]' 
                     : screenWidth < 768
                     ? 'min-w-[105px]'
                     : screenWidth < 1024
                     ? 'min-w-[125px]'
                     : screenWidth < 1366
                     ? 'min-w-[145px]'
                     : 'min-w-[165px]'
                 }`}>
                   <svg className={`absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 ${
                     screenWidth < 640 
                       ? 'w-3 h-3' 
                       : screenWidth < 768
                       ? 'w-3.5 h-3.5'
                       : screenWidth < 1024
                       ? 'w-4 h-4'
                       : 'w-4 h-4'
                   } pointer-events-none z-10 ${
                     isDark ? 'text-gray-400' : 'text-slate-400'
                   }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                   </svg>
                   <input
                     type="text"
                     value={addressFilter}
                     onChange={(e) => setAddressFilter(e.target.value)}
                     className={`w-full ${
                       screenWidth < 640 
                         ? 'pl-6 pr-2 py-1 text-xs' 
                         : screenWidth < 768
                         ? 'pl-7 pr-2 py-1.5 text-xs'
                         : screenWidth < 1024
                         ? 'pl-8 pr-2 py-1.5 text-sm'
                         : 'pl-9 pr-3 py-2 text-sm'
                     } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                       isDark 
                         ? 'bg-gray-700/50 border-gray-600 placeholder-gray-400 text-white hover:bg-gray-700' 
                         : 'bg-white/80 border-gray-300 placeholder-gray-500 text-gray-900 hover:bg-white'
                     }`}
                     placeholder="Search by address"
                   />
                 </div>
                {/* Rooms Filter */}
                 <div className={`relative flex-1 min-w-0 ${
                   screenWidth < 640 
                     ? 'min-w-[80px]' 
                     : screenWidth < 768
                     ? 'min-w-[100px]'
                     : screenWidth < 1024
                     ? 'min-w-[120px]'
                     : screenWidth < 1366
                     ? 'min-w-[140px]'
                     : 'min-w-[160px]'
                 }`}>
                   <svg className={`absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 ${
                     screenWidth < 640 
                       ? 'w-3 h-3' 
                       : screenWidth < 768
                       ? 'w-3.5 h-3.5'
                       : screenWidth < 1024
                       ? 'w-4 h-4'
                       : 'w-4 h-4'
                   } pointer-events-none z-10 ${
                     isDark ? 'text-gray-400' : 'text-slate-400'
                   }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                   </svg>
                   <select
                     value={hasRoomsFilter}
                     onChange={(e) => setHasRoomsFilter(e.target.value)}
                     className={`w-full ${
                       screenWidth < 640 
                         ? 'pl-6 pr-5 py-1 text-xs' 
                         : screenWidth < 768
                         ? 'pl-7 pr-6 py-1.5 text-xs'
                         : screenWidth < 1024
                         ? 'pl-8 pr-7 py-1.5 text-sm'
                         : 'pl-9 pr-8 py-2 text-sm'
                     } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer ${
                       isDark 
                         ? 'bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700' 
                         : 'bg-white/80 border-gray-300 text-gray-900 hover:bg-white'
                     }`}
                   >
                     <option value="">{t('hotels.allHotels')}</option>
                     <option value="true">{t('hotels.hotelsWithRooms')}</option>
                     <option value="false">{t('hotels.hotelsWithoutRooms')}</option>
                   </select>
                   <svg className={`absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 ${
                     screenWidth < 640 
                       ? 'w-3 h-3' 
                       : screenWidth < 768
                       ? 'w-3 h-3'
                       : screenWidth < 1024
                       ? 'w-4 h-4'
                       : 'w-4 h-4'
                   } pointer-events-none ${
                     isDark ? 'text-gray-400' : 'text-slate-400'
                   }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                   </svg>
                 </div>

                {/* Room Count Filters */}
                {hasRoomsFilter !== 'false' && (
                  <>
                    <div className={`relative flex-1 min-w-0 ${
                      screenWidth < 640 
                        ? 'min-w-[60px]' 
                        : screenWidth < 768
                        ? 'min-w-[70px]'
                        : screenWidth < 1024
                        ? 'min-w-[80px]'
                        : screenWidth < 1366
                        ? 'min-w-[90px]'
                        : 'min-w-[100px]'
                    }`}>
                      <input
                        type="number"
                        min="0"
                        value={minRoomCountFilter}
                        onChange={(e) => setMinRoomCountFilter(e.target.value)}
                        className={`w-full ${
                          screenWidth < 640 
                            ? 'px-1.5 py-1 text-xs' 
                            : screenWidth < 768
                            ? 'px-2 py-1.5 text-xs'
                            : screenWidth < 1024
                            ? 'px-2 py-1.5 text-sm'
                            : 'px-3 py-2 text-sm'
                        } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                          isDark 
                            ? 'bg-gray-700/50 border-gray-600 placeholder-gray-400 text-white hover:bg-gray-700' 
                            : 'bg-white/80 border-gray-300 placeholder-gray-500 text-gray-900 hover:bg-white'
                        }`}
                        placeholder="Min rooms"
                      />
                    </div>
                    <div className={`relative flex-1 min-w-0 ${
                      screenWidth < 640 
                        ? 'min-w-[60px]' 
                        : screenWidth < 768
                        ? 'min-w-[70px]'
                        : screenWidth < 1024
                        ? 'min-w-[80px]'
                        : screenWidth < 1366
                        ? 'min-w-[90px]'
                        : 'min-w-[100px]'
                    }`}>
                      <input
                        type="number"
                        min="0"
                        value={maxRoomCountFilter}
                        onChange={(e) => setMaxRoomCountFilter(e.target.value)}
                        className={`w-full ${
                          screenWidth < 640 
                            ? 'px-1.5 py-1 text-xs' 
                            : screenWidth < 768
                            ? 'px-2 py-1.5 text-xs'
                            : screenWidth < 1024
                            ? 'px-2 py-1.5 text-sm'
                            : 'px-3 py-2 text-sm'
                        } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                          isDark 
                            ? 'bg-gray-700/50 border-gray-600 placeholder-gray-400 text-white hover:bg-gray-700' 
                            : 'bg-white/80 border-gray-300 placeholder-gray-500 text-gray-900 hover:bg-white'
                        }`}
                        placeholder="Max rooms"
                      />
                    </div>
                  </>
                )}

                {/* Files Filter */}
                 <div className={`relative flex-1 min-w-0 ${
                   screenWidth < 640 
                     ? 'min-w-[80px]' 
                     : screenWidth < 768
                     ? 'min-w-[100px]'
                     : screenWidth < 1024
                     ? 'min-w-[120px]'
                     : screenWidth < 1366
                     ? 'min-w-[140px]'
                     : 'min-w-[160px]'
                 }`}>
                   <svg className={`absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 ${
                     screenWidth < 640 
                       ? 'w-3 h-3' 
                       : screenWidth < 768
                       ? 'w-3.5 h-3.5'
                       : screenWidth < 1024
                       ? 'w-4 h-4'
                       : 'w-4 h-4'
                   } pointer-events-none z-10 ${
                     isDark ? 'text-gray-400' : 'text-slate-400'
                   }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
                   <select
                     value={hasFilesFilter}
                     onChange={(e) => setHasFilesFilter(e.target.value)}
                     className={`w-full ${
                       screenWidth < 640 
                         ? 'pl-6 pr-5 py-1 text-xs' 
                         : screenWidth < 768
                         ? 'pl-7 pr-6 py-1.5 text-xs'
                         : screenWidth < 1024
                         ? 'pl-8 pr-7 py-1.5 text-sm'
                         : 'pl-9 pr-8 py-2 text-sm'
                     } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer ${
                       isDark 
                         ? 'bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700' 
                         : 'bg-white/80 border-gray-300 text-gray-900 hover:bg-white'
                     }`}
                   >
                     <option value="">All Hotels</option>
                     <option value="true">Hotels with Files</option>
                     <option value="false">Hotels without Files</option>
                   </select>
                   <svg className={`absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 ${
                     screenWidth < 640 
                       ? 'w-3 h-3' 
                       : screenWidth < 768
                       ? 'w-3 h-3'
                       : screenWidth < 1024
                       ? 'w-4 h-4'
                       : 'w-4 h-4'
                   } pointer-events-none ${
                     isDark ? 'text-gray-400' : 'text-slate-400'
                   }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                   </svg>
                 </div>

                {/* Clear Filters Icon Button */}
                 <div className="flex-shrink-0">
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
                     className={`${
                       screenWidth < 640 
                         ? 'p-1.5' 
                         : screenWidth < 768
                         ? 'p-2'
                         : screenWidth < 1024
                         ? 'p-2'
                         : 'p-2.5'
                     } rounded-lg transition-all duration-200 flex items-center justify-center group hover:scale-105 ${
                       isDark
                         ? 'bg-red-600/80 hover:bg-red-600 text-white border border-red-500/50 hover:border-red-400'
                         : 'bg-red-500/90 hover:bg-red-500 text-white border border-red-400/50 hover:border-red-300 shadow-sm hover:shadow-md'
                     }`}
                     title="Clear All Filters"
                   >
                     <svg className={`${
                        screenWidth < 640 
                          ? 'w-3.5 h-3.5' 
                          : screenWidth < 768
                          ? 'w-4 h-4'
                          : screenWidth < 1024
                          ? 'w-4 h-4'
                          : 'w-5 h-5'
                      } transition-transform duration-200 group-hover:rotate-180`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                   </button>
                 </div>
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
                            className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-300/50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>{t('hotels.deleteSelected')}</span>
                          </button>
                          <button
                            onClick={handlePrintSelected}
                            className="px-3 py-1.5 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white text-sm rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-slate-300/50"
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
          <div className={`flex-1 flex flex-col rounded-lg border overflow-hidden min-w-0 max-h-[calc(100vh-300px)] ${
            isDark 
              ? 'border-gray-700 bg-gray-800' 
              : 'border-gray-300 bg-white'
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
                {/* Enhanced Table Header */}
                <div className={`sticky top-0 z-10 flex-shrink-0 border-b ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-300'
                }`}>
                  <div className={`grid gap-1 sm:gap-2 font-medium uppercase tracking-tighter whitespace-nowrap overflow-hidden ${
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
                  }`} style={{
                    gridTemplateColumns: screenWidth < 640 
                      ? 'minmax(20px, 25px) minmax(80px, 100px) minmax(40px, 50px) minmax(60px, 80px) minmax(70px, 90px) minmax(50px, 70px) minmax(35px, 45px) minmax(35px, 45px) minmax(40px, 50px)'
                      : screenWidth < 768
                      ? 'minmax(22px, 27px) minmax(100px, 120px) minmax(50px, 60px) minmax(70px, 90px) minmax(85px, 105px) minmax(60px, 80px) minmax(40px, 50px) minmax(40px, 50px) minmax(50px, 60px)'
                      : screenWidth < 1024
                      ? 'minmax(25px, 30px) minmax(120px, 140px) minmax(60px, 70px) minmax(80px, 100px) minmax(100px, 120px) minmax(70px, 90px) minmax(50px, 60px) minmax(50px, 60px) minmax(60px, 70px)'
                      : screenWidth < 1366
                      ? 'minmax(22px, 28px) minmax(110px, 130px) minmax(55px, 65px) minmax(75px, 90px) minmax(90px, 110px) minmax(65px, 80px) minmax(50px, 60px) minmax(50px, 60px) minmax(70px, 80px)'
                      : screenWidth < 1920
                      ? 'minmax(35px, 40px) minmax(160px, 180px) minmax(80px, 90px) minmax(120px, 140px) minmax(140px, 160px) minmax(100px, 120px) minmax(70px, 80px) minmax(70px, 80px) minmax(80px, 90px)'
                      : screenWidth < 2560
                      ? 'minmax(40px, 50px) minmax(180px, 220px) minmax(90px, 110px) minmax(140px, 170px) minmax(160px, 200px) minmax(120px, 150px) minmax(80px, 100px) minmax(80px, 100px) minmax(90px, 110px)'
                      : 'minmax(50px, 60px) minmax(220px, 280px) minmax(110px, 140px) minmax(170px, 220px) minmax(200px, 260px) minmax(150px, 200px) minmax(100px, 130px) minmax(100px, 130px) minmax(110px, 140px)'
                  }}>
                    <div className={`flex items-center justify-center ${
                      isDark ? 'text-gray-200' : 'text-slate-700'
                    }`}>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedHotels.length === (filteredHotels?.length || 0) && (filteredHotels?.length || 0) > 0}
                          onChange={handleSelectAllHotels}
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
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {t('hotels.hotelName')}
                    </div>
                    <div className={`text-left flex items-center gap-2 ${
                      isDark ? 'text-gray-200' : 'text-slate-700'
                    }`}>
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      {t('hotels.hotelCode')}
                    </div>
                    <div className={`text-left flex items-center gap-2 ${
                      isDark ? 'text-gray-200' : 'text-slate-700'
                    }`}>
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      {t('hotels.altHotelName')}
                    </div>
                    <div className={`text-left flex items-center gap-2 ${
                      isDark ? 'text-gray-200' : 'text-slate-700'
                    }`}>
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {t('hotels.hotelAddress')}
                    </div>
                    <div className={`text-left flex items-center gap-2 ${
                      isDark ? 'text-gray-200' : 'text-slate-700'
                    }`}>
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      {t('hotels.location')}
                    </div>
                    <div className={`text-center flex items-center justify-center gap-2 ${
                      isDark ? 'text-gray-200' : 'text-slate-700'
                    }`}>
                      
                      {t('hotels.roomCount')}
                    </div>
                    <div className={`text-center flex items-center justify-center gap-2 ${
                      isDark ? 'text-gray-200' : 'text-slate-700'
                    }`}>
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {t('hotels.agreementCount')}
                    </div>
                  </div>
                </div>
                
                {/* Scrollable Table Body */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 max-h-[calc(100vh-400px)]">
                  <div className={`divide-y ${
                    isDark ? 'divide-gray-600/30' : 'divide-slate-200/30'
                  }`}>

                    {(filteredHotels || []).map((hotel, index) => (
                      <div key={hotel.id} className={`grid gap-1 sm:gap-2 border-b ${
                        screenWidth < 640 
                          ? 'px-1 py-1.5'
                          : screenWidth < 768
                          ? 'px-1.5 py-2'
                          : screenWidth < 1024
                          ? 'px-2 sm:px-3 py-2 sm:py-3'
                          : screenWidth < 1366
                          ? 'px-3 py-3'
                          : screenWidth < 1920
                          ? 'px-4 py-3'
                          : screenWidth < 2560
                          ? 'px-5 py-4'
                          : 'px-6 py-5'
                      } ${
                        isDark 
                          ? `border-gray-700 ${
                              selectedHotels.includes(hotel.id) 
                                ? 'bg-gray-700' 
                                : 'hover:bg-gray-700/50'
                            }` 
                          : `border-gray-200 ${
                              selectedHotels.includes(hotel.id) 
                                ? 'bg-blue-50' 
                                : 'hover:bg-gray-50'
                            }`
                      }`} style={{
                         gridTemplateColumns: screenWidth < 640 
                           ? 'minmax(20px, 25px) minmax(80px, 100px) minmax(40px, 50px) minmax(60px, 80px) minmax(70px, 90px) minmax(50px, 70px) minmax(35px, 45px) minmax(35px, 45px)'
                           : screenWidth < 768
                           ? 'minmax(22px, 27px) minmax(100px, 120px) minmax(50px, 60px) minmax(70px, 90px) minmax(85px, 105px) minmax(60px, 80px) minmax(40px, 50px) minmax(40px, 50px)'
                           : screenWidth < 1024
                           ? 'minmax(25px, 30px) minmax(120px, 140px) minmax(60px, 70px) minmax(80px, 100px) minmax(100px, 120px) minmax(70px, 90px) minmax(50px, 60px) minmax(50px, 60px)'
                           : screenWidth < 1366
                           ? 'minmax(22px, 28px) minmax(110px, 130px) minmax(55px, 65px) minmax(75px, 90px) minmax(90px, 110px) minmax(65px, 80px) minmax(50px, 60px) minmax(50px, 60px)'
                           : screenWidth < 1920
                           ? 'minmax(35px, 40px) minmax(160px, 180px) minmax(80px, 90px) minmax(120px, 140px) minmax(140px, 160px) minmax(100px, 120px) minmax(70px, 80px) minmax(70px, 80px)'
                           : screenWidth < 2560
                           ? 'minmax(40px, 50px) minmax(180px, 220px) minmax(90px, 110px) minmax(140px, 170px) minmax(160px, 200px) minmax(120px, 150px) minmax(80px, 100px) minmax(80px, 100px)'
                           : 'minmax(50px, 60px) minmax(220px, 280px) minmax(110px, 140px) minmax(170px, 220px) minmax(200px, 260px) minmax(150px, 200px) minmax(100px, 130px) minmax(100px, 130px)'
                       }} onClick={() => handleRowClick(hotel)}>
                        <div className="flex items-center justify-center">
                          <input
                              type="checkbox"
                              checked={selectedHotels.includes(hotel.id)}
                              onChange={() => handleSelectHotel(hotel.id)}
                              className={`w-4 h-4 text-blue-600 rounded border cursor-pointer ${
                                isDark
                                  ? 'bg-gray-700 border-gray-600'
                                  : 'bg-white border-gray-300'
                              }`}
                          />
                        </div>
                        <div className={`font-semibold break-words ${
                          screenWidth < 640 
                            ? 'text-[7px]'
                            : screenWidth < 768
                            ? 'text-[8px]'
                            : screenWidth < 1024
                            ? 'text-xs'
                            : screenWidth < 1366
                            ? 'text-sm'
                            : screenWidth < 1920
                            ? 'text-base'
                            : screenWidth < 2560
                            ? 'text-lg'
                            : 'text-xl'
                        } ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          <div className="flex items-start space-x-1">
                            <svg className={`flex-shrink-0 mt-0.5 ${
                              screenWidth < 640 
                                ? 'w-2 h-2'
                                : screenWidth < 768
                                ? 'w-2.5 h-2.5'
                                : screenWidth < 1024
                                ? 'w-3 h-3'
                                : screenWidth < 1366
                                ? 'w-4 h-4'
                                : screenWidth < 1920
                                ? 'w-5 h-5'
                                : screenWidth < 2560
                                ? 'w-6 h-6'
                                : 'w-7 h-7'
                            } ${
                              isDark ? 'text-blue-400' : 'text-blue-600'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="break-words">{hotel.name}</span>
                          </div>
                        </div>
                        <div className={`font-mono font-medium px-1 py-1 rounded break-words ${
                          screenWidth < 640 
                            ? 'text-[7px]'
                            : screenWidth < 768
                            ? 'text-[8px]'
                            : screenWidth < 1024
                            ? 'text-xs'
                            : screenWidth < 1366
                            ? 'text-sm'
                            : screenWidth < 1920
                            ? 'text-base'
                            : screenWidth < 2560
                            ? 'text-lg'
                            : 'text-xl'
                        } ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`} title={hotel.code}>
                          <span className="block break-words">{hotel.code}</span>
                        </div>
                        <div className={`break-words ${
                          screenWidth < 640 
                            ? 'text-[7px]'
                            : screenWidth < 768
                            ? 'text-[8px]'
                            : screenWidth < 1024
                            ? 'text-xs'
                            : screenWidth < 1366
                             ? 'text-sm'
                             : screenWidth < 1920
                             ? 'text-base'
                             : screenWidth < 2560
                             ? 'text-lg'
                             : 'text-xl'
                        } ${
                          isDark ? 'text-gray-300' : 'text-slate-600'
                        }`} title={hotel.altName || 'No alt name'}>
                          <span className="break-words block">{hotel.altName || <span className="italic opacity-60">No alt name</span>}</span>
                        </div>
                        <div className={`text-xs break-words ${
                          isDark ? 'text-gray-300' : 'text-slate-600'
                        }`}>
                          <div className="flex items-start space-x-1" title={hotel.address || 'No address'}>
                            <svg className={`flex-shrink-0 mt-0.5 ${
                              screenWidth < 640 
                                ? 'w-1.5 h-1.5'
                                : screenWidth < 768
                                ? 'w-2 h-2'
                                : screenWidth < 1024
                                ? 'w-2 h-2'
                                : screenWidth < 1366
                                ? 'w-3 h-3'
                                : screenWidth < 1920
                                ? 'w-4 h-4'
                                : screenWidth < 2560
                                ? 'w-5 h-5'
                                : 'w-6 h-6'
                            } ${
                              isDark ? 'text-gray-400' : 'text-slate-500'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className={`break-words ${
                              screenWidth < 640 
                                ? 'text-[7px]'
                                : screenWidth < 768
                                ? 'text-[8px]'
                                : screenWidth < 1024
                                ? 'text-xs'
                                : screenWidth < 1366
                                ? 'text-sm'
                                : screenWidth < 1920
                                ? 'text-base'
                                : screenWidth < 2560
                                ? 'text-lg'
                                : 'text-xl'
                            }`}>{hotel.address || <span className="italic opacity-60">No address</span>}</span>
                          </div>
                        </div>
                        <div className={`text-xs break-words ${
                          isDark ? 'text-gray-300' : 'text-slate-600'
                        }`}>
                          <span className={`inline-flex items-start px-1 py-0.5 rounded font-medium w-full ${
                            screenWidth < 640 
                              ? 'text-[7px]'
                              : screenWidth < 768
                              ? 'text-[8px]'
                              : screenWidth < 1024
                              ? 'text-xs'
                              : screenWidth < 1366
                              ? 'text-sm'
                              : screenWidth < 1920
                              ? 'text-base'
                              : screenWidth < 2560
                              ? 'text-lg'
                              : 'text-xl'
                          } ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`} title={hotel.location || '-'}>
                            <svg className={`mr-0.5 flex-shrink-0 mt-0.5 ${
                              screenWidth < 640 
                                ? 'w-1.5 h-1.5'
                                : screenWidth < 768
                                ? 'w-2 h-2'
                                : screenWidth < 1024
                                ? 'w-2 h-2'
                                : screenWidth < 1366
                                ? 'w-3 h-3'
                                : screenWidth < 1920
                                ? 'w-4 h-4'
                                : screenWidth < 2560
                                ? 'w-5 h-5'
                                : 'w-6 h-6'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span className="break-words">{hotel.location || '-'}</span>
                          </span>
                        </div>
                        <div className="flex justify-center items-center">
                          <span className={`inline-flex items-center px-1 py-1 rounded font-bold ${
                            screenWidth < 640 
                              ? 'text-[7px]'
                              : screenWidth < 768
                              ? 'text-[8px]'
                              : screenWidth < 1024
                              ? 'text-xs'
                              : screenWidth < 1366
                              ? 'text-sm'
                              : screenWidth < 1920
                              ? 'text-base'
                              : screenWidth < 2560
                              ? 'text-lg'
                              : 'text-xl'
                          } ${
                            isDark 
                              ? 'bg-blue-900/30 text-blue-300 border border-blue-400/40' 
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}>
                            
                            {hotel.roomCount || 0}
                          </span>
                        </div>
                        <div className="flex justify-center items-center">
                          {hotel.agreements && hotel.agreements.length > 0 ? (
                            <div className="space-y-1 max-w-full">
                              {hotel.agreements.slice(0, 1).map((agreement, index) => (
                                <div key={agreement.id} className="flex items-center">
                                  <a
                                    href={`/api/hotels/${hotel.id}/agreements/${agreement.id}/download`}
                                    download={agreement.fileName}
                                    className={`inline-flex items-center px-1 py-0.5 rounded font-semibold ${
                                      screenWidth < 640 
                                        ? 'text-[7px]'
                                        : screenWidth < 768
                                        ? 'text-[8px]'
                                        : screenWidth < 1024
                                        ? 'text-xs'
                                        : screenWidth > 1920
                                        ? 'text-sm'
                                        : 'text-xs'
                                    } ${
                                      isDark
                                        ? 'bg-green-900/30 text-green-300 border border-green-400/40'
                                        : 'bg-green-100 text-green-800 border border-green-300'
                                    }`}
                                  >
                                    <svg className={`mr-0.5 ${
                                      screenWidth < 640 
                                        ? 'w-1.5 h-1.5'
                                        : screenWidth < 768
                                        ? 'w-2 h-2'
                                        : screenWidth < 1024
                                        ? 'w-2 h-2'
                                        : screenWidth > 1920
                                        ? 'w-3 h-3'
                                        : 'w-2 h-2'
                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    File
                                  </a>
                                </div>
                              ))}
                              {hotel.agreements.length > 1 && (
                                <div className={`font-medium px-1 py-0.5 rounded ${
                                  screenWidth < 640 
                                    ? 'text-[7px]'
                                    : screenWidth < 768
                                    ? 'text-[8px]'
                                    : screenWidth < 1024
                                    ? 'text-xs'
                                    : screenWidth > 1920
                                    ? 'text-sm'
                                    : 'text-xs'
                                } ${
                                  isDark ? 'text-gray-400 bg-gray-700/50' : 'text-gray-600 bg-gray-100'
                                }`}>
                                  +{hotel.agreements.length - 1}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className={`inline-flex items-center px-1 py-0.5 rounded font-medium ${
                              screenWidth < 640 
                                ? 'text-[7px]'
                                : screenWidth < 768
                                ? 'text-[8px]'
                                : screenWidth < 1024
                                ? 'text-xs'
                                : screenWidth > 1920
                                ? 'text-sm'
                                : 'text-xs'
                            } ${
                              isDark ? 'bg-gray-700/50 text-gray-400 border border-gray-600/30' : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                              <svg className={`mr-0.5 ${
                                screenWidth < 640 
                                  ? 'w-1.5 h-1.5'
                                  : screenWidth < 768
                                  ? 'w-2 h-2'
                                  : screenWidth < 1024
                                  ? 'w-2 h-2'
                                  : screenWidth > 1920
                                  ? 'w-3 h-3'
                                  : 'w-2 h-2'
                              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              None
                            </span>
                          )}
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
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
              <div className={`w-full max-w-5xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl h-[92vh] sm:h-[90vh] rounded-lg shadow-xl ${
                isDark 
                  ? 'bg-gray-900 border border-gray-700' 
                  : 'bg-white border border-gray-200'
              }`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <h3 className={`text-xl font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {t('hotels.hotelDetails')}
                  </h3>
                  <button
                    onClick={() => setSelectedHotelDetails(null)}
                    className={`p-2 rounded-md ${
                      isDark 
                        ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' 
                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Content */}
                <div className="flex flex-col lg:flex-row h-[calc(92vh-140px)] sm:h-[calc(90vh-140px)]">
                  {/* Left Panel - Basic Information */}
                  <div className={`w-full lg:w-1/2 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <h4 className={`text-lg font-medium mb-4 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Basic Information
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {t('hotels.hotelName')}
                          </label>
                          <div className={`text-sm ${
                            isDark ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                            {selectedHotelDetails.name}
                          </div>
                        </div>
                        
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {t('hotels.hotelCode')}
                          </label>
                          <div className={`text-sm ${
                            isDark ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                            {selectedHotelDetails.code}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {t('hotels.altHotelName')}
                          </label>
                          <div className={`text-sm ${
                            isDark ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                            {selectedHotelDetails.altName || '-'}
                          </div>
                        </div>
                        
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {t('hotels.roomCount')}
                          </label>
                          <div className={`text-sm font-medium ${
                            isDark ? 'text-blue-400' : 'text-blue-600'
                          }`}>
                            {selectedHotelDetails.roomCount || 0} rooms
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {t('hotels.hotelAddress')}
                        </label>
                        <div className={`text-sm ${
                          isDark ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          {selectedHotelDetails.address || '-'}
                        </div>
                      </div>
                      
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {t('hotels.location')}
                        </label>
                        <div className={`text-sm ${
                          isDark ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          {selectedHotelDetails.location || '-'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {t('hotels.createdDate')}
                          </label>
                          <div className={`text-sm ${
                            isDark ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                            {new Date(selectedHotelDetails.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        {selectedHotelDetails.createdBy && (
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Created By
                            </label>
                            <div className={`text-sm ${
                              isDark ? 'text-gray-200' : 'text-gray-900'
                            }`}>
                              {selectedHotelDetails.createdBy.firstName && selectedHotelDetails.createdBy.lastName 
                                ? `${selectedHotelDetails.createdBy.firstName} ${selectedHotelDetails.createdBy.lastName}` 
                                : selectedHotelDetails.createdBy.username}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Description Section */}
                    {(selectedHotelDetails.description || selectedHotelDetails.altDescription) && (
                      <div className="mt-6">
                        <h5 className={`text-sm font-medium mb-3 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {t('hotels.hotelDescription')}
                        </h5>
                        
                        {selectedHotelDetails.description && (
                          <div className="mb-3">
                            <label className={`block text-xs font-medium mb-1 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {t('hotels.hotelDescription')}
                            </label>
                            <div className={`text-sm p-3 rounded border ${
                              isDark 
                                ? 'border-gray-700 bg-gray-800 text-gray-200' 
                                : 'border-gray-200 bg-gray-50 text-gray-800'
                            }`}>
                              {selectedHotelDetails.description}
                            </div>
                          </div>
                        )}
                        
                        {selectedHotelDetails.altDescription && (
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {t('hotels.altHotelDescription')}
                            </label>
                            <div className={`text-sm p-3 rounded border ${
                              isDark 
                                ? 'border-gray-700 bg-gray-800 text-gray-200' 
                                : 'border-gray-200 bg-gray-50 text-gray-800'
                            }`}>
                              {selectedHotelDetails.altDescription}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Right Panel - Agreement Files */}
                  <div className="w-full lg:w-1/2 p-4 sm:p-6">
                    <h4 className={`text-lg font-medium mb-4 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {t('hotels.agreementFiles')}
                    </h4>
                    
                    <div className="h-[calc(100%-2rem)]">
                      {selectedHotelDetails.agreements && selectedHotelDetails.agreements.length > 0 ? (
                        <div className="space-y-3 h-full overflow-y-auto pr-2">
                          {selectedHotelDetails.agreements.map((agreement) => (
                            <div key={agreement.id} className={`flex items-center justify-between p-4 border rounded-lg ${
                              isDark 
                                ? 'border-gray-700 bg-gray-800' 
                                : 'border-gray-200 bg-gray-50'
                            }`}>
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                                  isDark ? 'bg-blue-600' : 'bg-blue-500'
                                }`}>
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${
                                    isDark ? 'text-gray-200' : 'text-gray-900'
                                  }`}>
                                    {agreement.fileName}
                                  </p>
                                  <p className={`text-xs ${
                                    isDark ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    {(agreement.fileSize / 1024).toFixed(1)} KB • {new Date(agreement.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <a
                                href={`/api/hotels/${selectedHotelDetails.id}/agreements/${agreement.id}/download`}
                                download
                                className={`ml-3 px-3 py-1.5 text-xs font-medium text-white rounded ${
                                  isDark 
                                    ? 'bg-blue-600 hover:bg-blue-700' 
                                    : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                              >
                                Download
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={`flex flex-col items-center justify-center h-full border-2 border-dashed rounded-lg ${
                          isDark 
                            ? 'border-gray-700 bg-gray-800/50' 
                            : 'border-gray-300 bg-gray-50'
                        }`}>
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                            isDark ? 'bg-gray-700' : 'bg-gray-200'
                          }`}>
                            <svg className={`w-6 h-6 ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className={`text-sm font-medium ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            No agreement files uploaded
                          </p>
                          <p className={`text-xs mt-1 ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Files will appear here once uploaded
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Footer */}
                <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between sm:justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => handleEditHotel(selectedHotelDetails.id)}
                      className="px-4 py-2.5 sm:py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm font-medium transition-colors duration-200 flex-1 sm:flex-none"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteHotel(selectedHotelDetails.id);
                        setSelectedHotelDetails(null);
                      }}
                      className="px-4 py-2.5 sm:py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors duration-200 flex-1 sm:flex-none"
                    >
                      {t('common.delete')}
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-4 py-2.5 sm:py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors duration-200 flex-1 sm:flex-none"
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
