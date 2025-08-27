'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Reservations() {
  const { language } = useLanguage();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {language === 'ar' ? 'الحجوزات' : 'Reservations'}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {language === 'ar' 
                ? 'هذه الصفحة قيد التطوير حاليًا. سيتم إطلاقها قريباً بميزات متقدمة لإدارة الحجوزات.'
                : 'This page is currently under development. Coming soon with advanced reservation management features.'
              }
            </p>
          </div>

          

          {/* Status Message */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {language === 'ar' ? 'قيد التطوير' : 'Under Development'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'نعمل بجد لتطوير نظام إدارة الحجوزات الأكثر تقدماً. ترقبوا الإطلاق قريباً مع ميزات رائعة ستسهل عليكم إدارة جميع الحجوزات بكفاءة عالية.'
                : 'We are working hard to develop the most advanced reservation management system. Stay tuned for the launch with amazing features that will help you manage all reservations efficiently.'
              }
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}


