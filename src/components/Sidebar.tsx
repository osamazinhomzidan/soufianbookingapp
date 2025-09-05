'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  HomeIcon,
  BuildingOfficeIcon,
  KeyIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const { t, isRTL, textAlignClass, marginLeftClass, marginRightClass } = useTranslation();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const allMenuItems = [
    {
      title: t('sidebar.hotelsManagement'),
      href: '/hotel',
      icon: BuildingOfficeIcon,
      isActive: pathname.startsWith('/hotel'),
      requiredRole: 'OWNER'
    },
    {
      title: t('sidebar.roomsManagement'), 
      href: '/room',
      icon: KeyIcon,
      isActive: pathname.startsWith('/room'),
      requiredRole: 'OWNER'
    },
    {
      title: t('sidebar.createReservation'),
      href: '/booking',
      icon: CalendarDaysIcon,
      isActive: pathname.startsWith('/booking')
    },
    {
      title: t('sidebar.allReservations'),
      href: '/reservations',
      icon: ClipboardDocumentListIcon,
      isActive: pathname === '/reservations'
    },
    {
      title: t('sidebar.allGuests'),
      href: '/guests',
      icon: UsersIcon,
      isActive: pathname === '/guests'
    },
    {
      title: t('sidebar.security'),
      href: '/security',
      icon: ShieldCheckIcon,
      isActive: pathname === '/security',
      requiredRole: 'OWNER'
    }
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => {
    if (item.requiredRole && user?.role !== item.requiredRole) {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-r border-gray-100
        ${isOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-200 bg-white">
          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-4`}>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-2xl">H</span>
            </div>
            <span className={`text-3xl font-black text-gray-800 ${textAlignClass} tracking-wide`}>HotelOS</span>
          </div>
          
          {/* Toggle button for mobile */}
          <button
            onClick={onToggle}
            className="lg:hidden p-3 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200"
          >
            <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-6 space-y-3">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`
                flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-4 px-6 py-4 rounded-xl transition-all duration-300 group
                ${item.isActive 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105' 
                  : 'text-gray-700 bg-gray-100 hover:to-gray-100 hover:text-gray-900 hover:shadow-md hover:transform hover:scale-102'
                }
              `}
            >
              <item.icon className={`w-8 h-8 ${item.isActive ? 'text-white' : 'text-gray-600 group-hover:text-green-600'} transition-colors duration-200`} />
              <span className={`font-black text-xl ${textAlignClass} tracking-wide`}>{item.title}</span>
            </Link>
          ))}
        </nav>

        {/* Language Toggle and Logout Button */}
        <div className="p-6 border-t border-gray-200 space-y-4 bg-gray-50">
          <button 
            onClick={toggleLanguage}
            className={`w-full flex items-center justify-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105`}
          >
            <LanguageIcon className="w-6 h-6" />
            <span className="font-black text-xl tracking-wide">{language === 'en' ? t('sidebar.arabic') : t('sidebar.english')}</span>
          </button>
          
          <button 
            onClick={async () => {
              setIsLoggingOut(true);
              try {
                await logout();
              } catch (error) {
                console.error('Logout error:', error);
              } finally {
                setIsLoggingOut(false);
              }
            }}
            disabled={isLoggingOut}
            className={`w-full flex items-center justify-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg`}
          >
            <ArrowRightOnRectangleIcon className="w-6 h-6" />
            <span className="font-black text-xl tracking-wide">{isLoggingOut ? t('sidebar.loggingOut') : t('sidebar.logout')}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;