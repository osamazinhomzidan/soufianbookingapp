'use client';

import { useState } from 'react';

interface Hotel {
  id: string;
  name: string;
  code: string;
  altName: string;
  createdAt: string;
}

export default function AddHotel() {
  const [language, setLanguage] = useState('en');
  const [hotelName, setHotelName] = useState('');
  const [hotelCode, setHotelCode] = useState('');
  const [altHotelName, setAltHotelName] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [codeFilter, setCodeFilter] = useState('');
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [selectedHotelDetails, setSelectedHotelDetails] = useState<Hotel | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([
    {
      id: '1',
      name: 'Grand Palace Hotel',
      code: 'GPH001',
      altName: 'فندق القصر الكبير',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Ocean View Resort',
      code: 'OVR002',
      altName: 'منتجع إطلالة المحيط',
      createdAt: '2024-01-20'
    },
    {
      id: '3',
      name: 'Mountain Lodge',
      code: 'ML003',
      altName: 'نزل الجبل',
      createdAt: '2024-01-25'
    },
    {
      id: '4',
      name: 'City Center Hotel',
      code: 'CCH004',
      altName: 'فندق وسط المدينة',
      createdAt: '2024-01-30'
    }
  ]);

  // Filter hotels based on search inputs
  const filteredHotels = hotels.filter(hotel => {
    const nameMatch = nameFilter === '' || 
      hotel.name.toLowerCase().includes(nameFilter.toLowerCase()) ||
      hotel.altName.toLowerCase().includes(nameFilter.toLowerCase());
    const codeMatch = codeFilter === '' || 
      hotel.code.toLowerCase().includes(codeFilter.toLowerCase());
    return nameMatch && codeMatch;
  });

  const handleAddHotel = (e: React.FormEvent) => {
    e.preventDefault();
    if (hotelName && hotelCode && altHotelName) {
      const newHotel: Hotel = {
        id: Date.now().toString(),
        name: hotelName,
        code: hotelCode,
        altName: altHotelName,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setHotels([...hotels, newHotel]);
      setHotelName('');
      setHotelCode('');
      setAltHotelName('');
      console.log('Hotel added:', newHotel);
    }
  };

  const handleEditHotel = (id: string) => {
    console.log('Edit hotel:', id);
    // Handle edit logic
  };

  const handleDeleteHotel = (id: string) => {
    setHotels(hotels.filter(hotel => hotel.id !== id));
    setSelectedHotels(selectedHotels.filter(selectedId => selectedId !== id));
    console.log('Hotel deleted:', id);
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
    if (selectedHotels.length === filteredHotels.length) {
      setSelectedHotels([]);
    } else {
      setSelectedHotels(filteredHotels.map(hotel => hotel.id));
    }
  };

  const handleDeleteSelected = () => {
    setHotels(hotels.filter(hotel => !selectedHotels.includes(hotel.id)));
    setSelectedHotels([]);
    console.log('Selected hotels deleted:', selectedHotels);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-apple-blue/20 to-apple-purple/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-apple-green/20 to-apple-teal/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-apple-pink/10 to-apple-orange/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        

        {/* Add Hotel Section */}
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {language === 'ar' ? 'إضافة فندق جديد' : 'Add New Hotel'}
            </h2>
            <p className="text-gray-600">
              {language === 'ar' ? 'أدخل تفاصيل الفندق الجديد' : 'Enter the details of the new hotel'}
            </p>
          </div>

          <form onSubmit={handleAddHotel} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Hotel Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {language === 'ar' ? 'اسم الفندق' : 'Hotel Name'}
                </label>
                <input
                  type="text"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                  placeholder={language === 'ar' ? 'أدخل اسم الفندق' : 'Enter hotel name'}
                  required
                />
              </div>

              {/* Hotel Code */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {language === 'ar' ? 'رمز الفندق' : 'Hotel Code'}
                </label>
                <input
                  type="text"
                  value={hotelCode}
                  onChange={(e) => setHotelCode(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                  placeholder={language === 'ar' ? 'أدخل رمز الفندق' : 'Enter hotel code'}
                  required
                />
              </div>

              {/* Alt Hotel Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {language === 'ar' ? 'الاسم البديل للفندق' : 'Alt Hotel Name'}
                </label>
                <input
                  type="text"
                  value={altHotelName}
                  onChange={(e) => setAltHotelName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                  placeholder={language === 'ar' ? 'أدخل الاسم البديل' : 'Enter alternative name'}
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r w-full from-green-600 to-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
              >
                {language === 'ar' ? 'إضافة' : 'Add'}
              </button>
              
            </div>
          </form>
        </div>

        {/* Hotels List Section */}
         <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl p-8">
           <div className="mb-6">
             <h2 className="text-2xl font-semibold text-gray-900 mb-2">
               {language === 'ar' ? 'قائمة الفنادق' : 'Hotels List'}
             </h2>
             <p className="text-gray-600">
               {language === 'ar' ? 'عرض وإدارة الفنادق المضافة' : 'View and manage added hotels'}
             </p>
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

                {/* Code Filter */}
                <div className="flex-1 max-w-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'البحث بالرمز' : 'Filter by Code'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={codeFilter}
                      onChange={(e) => setCodeFilter(e.target.value)}
                      className="w-full px-4 py-3 pl-10 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-200 backdrop-blur-sm placeholder-gray-400"
                      placeholder={language === 'ar' ? 'ابحث بالرمز...' : 'Search by code...'}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
                  </div>
                </div>

                
              </div>

              {/* Selected Hotels Actions */}
              {selectedHotels.length > 0 && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleDeleteSelected}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded-lg hover:shadow-md transition-all duration-200"
                  >
                    {language === 'ar' ? `حذف المحدد (${selectedHotels.length})` : `Delete Selected (${selectedHotels.length})`}
                  </button>
                  <button
                    onClick={handlePrintSelected}
                    className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm rounded-lg hover:shadow-md transition-all duration-200"
                  >
                    {language === 'ar' ? `طباعة المحدد (${selectedHotels.length})` : `Print Selected (${selectedHotels.length})`}
                  </button>
                </div>
              )}
            </div>

          {/* Hotels Table */}
           <div className="overflow-x-auto">
             <table className="w-full">
               <thead>
                 <tr className="border-b border-gray-200/30">
                   <th className="text-left py-4 px-4 font-semibold text-gray-700 w-12">
                     <input
                       type="checkbox"
                       checked={selectedHotels.length === filteredHotels.length && filteredHotels.length > 0}
                       onChange={handleSelectAllHotels}
                       className="w-4 h-4 text-apple-blue bg-white/50 border-gray-300 rounded focus:ring-apple-blue focus:ring-2"
                     />
                   </th>
                   <th className="text-left py-4 px-4 font-semibold text-gray-700">
                     {language === 'ar' ? 'اسم الفندق' : 'Hotel Name'}
                   </th>
                   <th className="text-left py-4 px-4 font-semibold text-gray-700">
                     {language === 'ar' ? 'رمز الفندق' : 'Hotel Code'}
                   </th>
                   <th className="text-left py-4 px-4 font-semibold text-gray-700">
                     {language === 'ar' ? 'الاسم البديل' : 'Alt Name'}
                   </th>
                   <th className="text-left py-4 px-4 font-semibold text-gray-700">
                     {language === 'ar' ? 'تاريخ الإضافة' : 'Created Date'}
                   </th>
                   <th className="text-left py-4 px-4 font-semibold text-gray-700">
                     {language === 'ar' ? 'الإجراءات' : 'Actions'}
                   </th>
                 </tr>
               </thead>
               <tbody>
                 {filteredHotels.map((hotel) => (
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
                     <td className="py-4 px-4 text-gray-600">{hotel.altName}</td>
                     <td className="py-4 px-4 text-gray-600">{hotel.createdAt}</td>
                     <td className="py-4 px-4">
                       <div className="flex space-x-2">
                         <button
                           onClick={() => handleViewHotel(hotel.id)}
                           className="px-3 py-1 bg-gradient-to-r from-apple-blue to-apple-purple text-white text-sm rounded-lg hover:shadow-md transition-all duration-200"
                         >
                           {language === 'ar' ? 'عرض' : 'View'}
                         </button>
                         <button
                           onClick={() => handleEditHotel(hotel.id)}
                           className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-sm rounded-lg hover:shadow-md transition-all duration-200"
                         >
                           {language === 'ar' ? 'تعديل' : 'Edit'}
                         </button>
                         <button
                           onClick={() => handleDeleteHotel(hotel.id)}
                           className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded-lg hover:shadow-md transition-all duration-200"
                         >
                           {language === 'ar' ? 'حذف' : 'Delete'}
                         </button>
                         <button
                           onClick={handlePrint}
                           className="px-3 py-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm rounded-lg hover:shadow-md transition-all duration-200"
                         >
                           {language === 'ar' ? 'طباعة' : 'Print'}
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>

          {filteredHotels.length === 0 && (
             <div className="text-center py-12">
               <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                 <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                 </svg>
               </div>
               <p className="text-gray-500">
                  {(nameFilter || codeFilter) ? 
                    (language === 'ar' ? 'لا توجد فنادق تطابق البحث' : 'No hotels match your search') :
                    (language === 'ar' ? 'لا توجد فنادق مضافة بعد' : 'No hotels added yet')
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
                   {language === 'ar' ? 'تفاصيل الفندق' : 'Hotel Details'}
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
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700">
                       {language === 'ar' ? 'اسم الفندق' : 'Hotel Name'}
                     </label>
                     <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800">
                       {selectedHotelDetails.name}
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700">
                       {language === 'ar' ? 'رمز الفندق' : 'Hotel Code'}
                     </label>
                     <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800">
                       {selectedHotelDetails.code}
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700">
                       {language === 'ar' ? 'الاسم البديل' : 'Alternative Name'}
                     </label>
                     <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800">
                       {selectedHotelDetails.altName}
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700">
                       {language === 'ar' ? 'تاريخ الإضافة' : 'Created Date'}
                     </label>
                     <div className="px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-800">
                       {selectedHotelDetails.createdAt}
                     </div>
                   </div>
                 </div>
                 
                 <div className="flex gap-4 pt-4">
                   <button
                     onClick={() => handleEditHotel(selectedHotelDetails.id)}
                     className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                   >
                     {language === 'ar' ? 'تعديل' : 'Edit'}
                   </button>
                   <button
                     onClick={() => {
                       handleDeleteHotel(selectedHotelDetails.id);
                       setSelectedHotelDetails(null);
                     }}
                     className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                   >
                     {language === 'ar' ? 'حذف' : 'Delete'}
                   </button>
                   <button
                     onClick={handlePrint}
                     className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                   >
                     {language === 'ar' ? 'طباعة' : 'Print'}
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
  );
}
