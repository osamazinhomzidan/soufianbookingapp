'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Guests() {
  const { language } = useLanguage();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 md:p-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-teal-600 rounded-full mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-4">
              {language === 'ar' ? 'إدارة الضيوف' : 'Guest Management'}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {language === 'ar' 
                ? 'هذه الصفحة قيد التطوير حاليًا. سيتم إطلاقها قريباً بميزات متقدمة لإدارة الضيوف.'
                : 'This page is currently under development. Coming soon with advanced guest management features.'
              }
            </p>
          </div>

        

          {/* Status Message */}
          <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-200/50 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full mb-4">
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
                ? 'نعمل على تطوير نظام إدارة الضيوف الأكثر تقدماً. ترقبوا الإطلاق قريباً مع ميزات رائعة ستساعدكم في إدارة ملفات الضيوف وبرامج الولاء بكفاءة عالية.'
                : 'We are developing the most advanced guest management system. Stay tuned for the launch with amazing features that will help you manage guest profiles and loyalty programs efficiently.'
              }
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
