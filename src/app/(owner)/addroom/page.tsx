'use client';

import { useState } from 'react';

interface Room {
  id: string;
  hotelId: string;
  hotelName: string;
  roomType: string;
  roomTypeDescription: string;
  altDescription: string;
  price: number;
  quantity: number;
  boardType: 'Room only' | 'Bed & breakfast' | 'Half board' | 'Full board';
  seasonalPrices?: {
    startDate: string;
    endDate: string;
    price: number;
  }[];
  createdAt: string;
}

interface Hotel {
  id: string;
  name: string;
  code: string;
}

export default function AddRoom() {
  const [language, setLanguage] = useState('en');
  const [hotelId, setHotelId] = useState('');
  const [roomType, setRoomType] = useState('');
  const [roomTypeDescription, setRoomTypeDescription] = useState('');
  const [altDescription, setAltDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [boardType, setBoardType] = useState<'Room only' | 'Bed & breakfast' | 'Half board' | 'Full board'>('Room only');
  const [hasAlternativePrice, setHasAlternativePrice] = useState(true);
  const [alternativePrice, setAlternativePrice] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedRoomDetails, setSelectedRoomDetails] = useState<Room | null>(null);
  
  // Sample hotels data
  const [hotels] = useState<Hotel[]>([
    { id: '1', name: 'Grand Palace Hotel', code: 'GPH001' },
    { id: '2', name: 'Ocean View Resort', code: 'OVR002' },
    { id: '3', name: 'Mountain Lodge', code: 'ML003' },
    { id: '4', name: 'City Center Hotel', code: 'CCH004' }
  ]);

  const [rooms, setRooms] = useState<Room[]>([
    {
      id: '1',
      hotelId: '1',
      hotelName: 'Grand Palace Hotel',
      roomType: 'Deluxe Suite',
      roomTypeDescription: 'Luxury suite with ocean view',
      altDescription: 'جناح فاخر مع إطلالة على المحيط',
      price: 250,
      quantity: 5,
      boardType: 'Bed & breakfast',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      hotelId: '2',
      hotelName: 'Ocean View Resort',
      roomType: 'Family Room',
      roomTypeDescription: 'Spacious room for families',
      altDescription: 'غرفة واسعة للعائلات',
      price: 180,
      quantity: 8,
      boardType: 'Half board',
      createdAt: '2024-01-20'
    },
    {
      id: '3',
      hotelId: '3',
      hotelName: 'Mountain Lodge',
      roomType: 'Standard Room',
      roomTypeDescription: 'Comfortable standard accommodation',
      altDescription: 'إقامة قياسية مريحة',
      price: 120,
      quantity: 12,
      boardType: 'Room only',
      createdAt: '2024-01-25'
    }
  ]);

  // Filter rooms based on search inputs
  const filteredRooms = rooms.filter(room => {
    const nameMatch = nameFilter === '' || 
      room.roomType.toLowerCase().includes(nameFilter.toLowerCase()) ||
      room.hotelName.toLowerCase().includes(nameFilter.toLowerCase()) ||
      room.altDescription.toLowerCase().includes(nameFilter.toLowerCase());
    const typeMatch = typeFilter === '' || 
      room.boardType.toLowerCase().includes(typeFilter.toLowerCase()) ||
      room.roomType.toLowerCase().includes(typeFilter.toLowerCase());
    return nameMatch && typeMatch;
  });

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (hotelId && roomType && roomTypeDescription && altDescription && price && quantity) {
      const selectedHotel = hotels.find(h => h.id === hotelId);
      const newRoom: Room = {
        id: Date.now().toString(),
        hotelId,
        hotelName: selectedHotel?.name || '',
        roomType,
        roomTypeDescription,
        altDescription,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        boardType,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setRooms([...rooms, newRoom]);
      // Reset form
      setHotelId('');
      setRoomType('');
      setRoomTypeDescription('');
      setAltDescription('');
      setPrice('');
       setQuantity('1');
       setBoardType('Room only');
       setHasAlternativePrice(true);
       setAlternativePrice('');
      console.log('Room added:', newRoom);
    }
  };

  const handleEditRoom = (id: string) => {
    console.log('Edit room:', id);
    // Handle edit logic
  };

  const handleDeleteRoom = (id: string) => {
    setRooms(rooms.filter(room => room.id !== id));
    setSelectedRooms(selectedRooms.filter(selectedId => selectedId !== id));
    console.log('Room deleted:', id);
  };

  const handleViewRoom = (id: string) => {
    const room = rooms.find(r => r.id === id);
    setSelectedRoomDetails(room || null);
    console.log('View room:', room);
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

  const handleDeleteSelected = () => {
    setRooms(rooms.filter(room => !selectedRooms.includes(room.id)));
    setSelectedRooms([]);
    console.log('Selected rooms deleted');
  };

  const handlePrintSelected = () => {
    const selectedRoomData = rooms.filter(room => selectedRooms.includes(room.id));
    console.log('Print selected rooms:', selectedRoomData);
    // Handle print selected logic
  };

  const handleDeleteAll = () => {
    setRooms([]);
    setSelectedRooms([]);
    console.log('All rooms deleted');
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
    console.log('Exit dashboard');
    // Handle exit logic
  };

  return (
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
                {language === 'ar' ? 'إضافة غرفة جديدة' : 'Add New Room'}
              </h2>
            </div>

            <form onSubmit={handleAddRoom} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Hotel Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'الفندق' : 'Hotel'}
                  </label>
                  <select
                    value={hotelId}
                    onChange={(e) => setHotelId(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    required
                  >
                    <option value="">{language === 'ar' ? 'اختر فندق' : 'Select Hotel'}</option>
                    {hotels.map(hotel => (
                      <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                    ))}
                  </select>
                </div>

                {/* Room Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'نوع الغرفة' : 'Room Type'}
                  </label>
                  <input
                    type="text"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                    placeholder={language === 'ar' ? 'مثل: جناح فاخر' : 'e.g., Deluxe Suite'}
                    required
                  />
                </div>

                {/* Board Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'نوع الإقامة' : 'Board Type'}
                  </label>
                  <select
                    value={boardType}
                    onChange={(e) => setBoardType(e.target.value as any)}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  >
                    <option value="Room only">{language === 'ar' ? 'غرفة فقط' : 'Room only'}</option>
                    <option value="Bed & breakfast">{language === 'ar' ? 'إفطار' : 'Bed & breakfast'}</option>
                    <option value="Half board">{language === 'ar' ? 'نصف إقامة' : 'Half board'}</option>
                    <option value="Full board">{language === 'ar' ? 'إقامة كاملة' : 'Full board'}</option>
                  </select>
                </div>

                {/* Room Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'وصف الغرفة' : 'Room Description'}
                  </label>
                  <input
                    type="text"
                    value={roomTypeDescription}
                    onChange={(e) => setRoomTypeDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                    placeholder={language === 'ar' ? 'وصف تفصيلي للغرفة' : 'Detailed room description'}
                    required
                  />
                </div>

                {/* Alt Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'الوصف البديل' : 'Alt Description'}
                  </label>
                  <input
                    type="text"
                    value={altDescription}
                    onChange={(e) => setAltDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                    placeholder={language === 'ar' ? 'الوصف باللغة الأخرى' : 'Description in other language'}
                    required
                  />
                </div>
                {/* Quantity */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'عدد الغرف' : 'Number of Rooms'}
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                    placeholder={language === 'ar' ? 'عدد الغرف' : 'Room quantity'}
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
                      {language === 'ar' ? 'السعر الأساسي (لكل ليلة)' : 'Base Price (per night)'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-4 bg-white/70 border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-300 backdrop-blur-sm placeholder-gray-400 text-lg font-medium shadow-sm hover:shadow-md"
                        placeholder={language === 'ar' ? 'أدخل السعر بالريال' : 'Enter price in SAR '}
                        min="0"
                        step="0.01"
                        required
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-medium text-sm">
                          {language === 'ar' ? 'ريال' : 'SAR '}
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
                          {language === 'ar' ? 'تفعيل السعر البديل' : 'Enable Alternative Price'}
                        </label>
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-100/60 px-2 py-1 rounded-full">
                        {language === 'ar' ? 'اختياري' : 'Optional'}
                      </div>
                    </div>
                    
                    {/* Alternative Price Input */}
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden w-full SAR {
                      hasAlternativePrice ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="space-y-3 w-full">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          {language === 'ar' ? 'السعر البديل (لكل ليلة)' : 'Alternative Price (per night)'}
                        </label>
                        <div className="relative w-full">
                          <input
                            type="number"
                            value={alternativePrice}
                            onChange={(e) => setAlternativePrice(e.target.value)}
                            className="w-full px-4 py-4 bg-orange-50/70 border border-orange-200/60 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm placeholder-orange-400 text-lg font-medium shadow-sm hover:shadow-md"
                            placeholder={language === 'ar' ? 'أدخل السعر البديل بالريال' : 'Enter alternative price in SAR '}
                            min="0"
                            step="0.01"
                          />
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <span className="text-orange-500 font-medium text-sm">
                              {language === 'ar' ? 'ريال' : 'SAR '}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-4 rounded-xl border border-blue-200/50 shadow-sm">
                          <p className="text-sm font-medium text-blue-800 leading-relaxed">
                            {language === 'ar' 
                              ? '💡 يمكنك تحديد أسعار موسمية بناءً على تواريخ محددة بعد إضافة الغرفة'
                              : '💡 You can set seasonal prices based on specific dates after adding the room'
                            }
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
                  {language === 'ar' ? 'إضافة غرفة' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>

          {/* View Rooms Section */}
          <div className="backdrop-blur-sm bg-white/50 border border-white/30 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-2 h-2 bg-gradient-to-r from-apple-purple to-apple-pink rounded-full animate-pulse"></div>
              <h2 className="text-xl font-semibold text-gray-800">
                {language === 'ar' ? 'عرض الغرف المضافة' : 'View Added Rooms'}
              </h2>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
                {/* Name Filter */}
                <div className="flex-1 max-w-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'البحث بالاسم' : 'Filter by Name'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nameFilter}
                      onChange={(e) => setNameFilter(e.target.value)}
                      className="w-full px-4 py-3 pl-10 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                      placeholder={language === 'ar' ? 'ابحث بالاسم...' : 'Search by name...'}
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
                    {language === 'ar' ? 'البحث بالنوع' : 'Filter by Type'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-4 py-3 pl-10 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                      placeholder={language === 'ar' ? 'ابحث بالنوع...' : 'Search by type...'}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* All Rooms Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAll}
                    className="px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                  >
                    {language === 'ar' ? 'حذف الكل' : 'Delete All'}
                  </button>
                  <button
                    onClick={handlePrintAll}
                    className="px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:ring-2 focus:ring-gray-600 focus:ring-offset-2"
                  >
                    {language === 'ar' ? 'طباعة الكل' : 'Print All'}
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
                    {language === 'ar' ? `حذف المحدد (SAR {selectedRooms.length})` : `Delete Selected (SAR {selectedRooms.length})`}
                  </button>
                  <button
                    onClick={handlePrintSelected}
                    className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm rounded-lg hover:shadow-md transition-all duration-200"
                  >
                    {language === 'ar' ? `طباعة المحدد (SAR {selectedRooms.length})` : `Print Selected (SAR {selectedRooms.length})`}
                  </button>
                </div>
              )}
            </div>

            {/* Rooms Table */}
            <div className="overflow-x-auto">
              {filteredRooms.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200/50">
                      <th className="text-left py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedRooms.length === filteredRooms.length && filteredRooms.length > 0}
                          onChange={handleSelectAllRooms}
                          className="w-4 h-4 text-apple-blue bg-white/50 border-gray-300 rounded focus:ring-apple-blue focus:ring-2"
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {language === 'ar' ? 'الفندق' : 'Hotel'}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {language === 'ar' ? 'نوع الغرفة' : 'Room Type'}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {language === 'ar' ? 'نوع الإقامة' : 'Board Type'}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {language === 'ar' ? 'السعر' : 'Price'}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {language === 'ar' ? 'العدد' : 'Quantity'}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        {language === 'ar' ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRooms.map((room) => (
                      <tr key={room.id} className="border-b border-gray-100/50 hover:bg-white/30 transition-colors">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedRooms.includes(room.id)}
                            onChange={() => handleSelectRoom(room.id)}
                            className="w-4 h-4 text-apple-blue bg-white/50 border-gray-300 rounded focus:ring-apple-blue focus:ring-2"
                          />
                        </td>
                        <td className="py-3 px-4 text-gray-600">{room.hotelName}</td>
                        <td className="py-3 px-4 text-gray-600">{room.roomType}</td>
                        <td className="py-3 px-4 text-gray-600">
                          <span className="px-2 py-1 bg-blue-100/50 text-blue-800 text-xs rounded-full">
                            {room.boardType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">SAR {room.price}</td>
                        <td className="py-3 px-4 text-gray-600">{room.quantity}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewRoom(room.id)}
                              className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-lg hover:shadow-md transition-all duration-200"
                            >
                              {language === 'ar' ? 'عرض' : 'View'}
                            </button>
                            <button
                              onClick={() => handleEditRoom(room.id)}
                              className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs rounded-lg hover:shadow-md transition-all duration-200"
                            >
                              {language === 'ar' ? 'تعديل' : 'Edit'}
                            </button>
                            <button
                              onClick={() => handleDeleteRoom(room.id)}
                              className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-lg hover:shadow-md transition-all duration-200"
                            >
                              {language === 'ar' ? 'حذف' : 'Delete'}
                            </button>
                            <button
                              onClick={() => handlePrintRoom(room.id)}
                              className="px-3 py-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs rounded-lg hover:shadow-md transition-all duration-200"
                            >
                              {language === 'ar' ? 'طباعة' : 'Print'}
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
                    {(nameFilter || typeFilter) ? 
                      (language === 'ar' ? 'لا توجد غرف تطابق البحث' : 'No rooms match your search') :
                      (language === 'ar' ? 'لا توجد غرف مضافة بعد' : 'No rooms added yet')
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'ar' ? 'تفاصيل الغرفة' : 'Room Details'}
              </h3>
              <button
                onClick={() => setSelectedRoomDetails(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {language === 'ar' ? 'الفندق' : 'Hotel'}
                </label>
                <p className="text-gray-900">{selectedRoomDetails.hotelName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {language === 'ar' ? 'نوع الغرفة' : 'Room Type'}
                </label>
                <p className="text-gray-900">{selectedRoomDetails.roomType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {language === 'ar' ? 'الوصف' : 'Description'}
                </label>
                <p className="text-gray-900">{selectedRoomDetails.roomTypeDescription}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {language === 'ar' ? 'الوصف البديل' : 'Alt Description'}
                </label>
                <p className="text-gray-900">{selectedRoomDetails.altDescription}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {language === 'ar' ? 'نوع الإقامة' : 'Board Type'}
                </label>
                <p className="text-gray-900">{selectedRoomDetails.boardType}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'السعر' : 'Price'}
                  </label>
                  <p className="text-gray-900">SAR {selectedRoomDetails.price}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'العدد' : 'Quantity'}
                  </label>
                  <p className="text-gray-900">{selectedRoomDetails.quantity}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {language === 'ar' ? 'تاريخ الإضافة' : 'Created Date'}
                </label>
                <p className="text-gray-900">{selectedRoomDetails.createdAt}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
