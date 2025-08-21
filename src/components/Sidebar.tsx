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
        fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full w-72 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className={`text-xl font-semibold text-gray-800 ${textAlignClass}`}>Logo</span>
          </div>
          
          {/* Toggle button for mobile */}
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`
                flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                ${item.isActive 
                  ? 'bg-green-500 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className={`font-medium ${textAlignClass}`}>{item.title}</span>
            </Link>
          ))}
        </nav>

        {/* Language Toggle and Logout Button */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button 
            onClick={toggleLanguage}
            className={`w-full flex items-center justify-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200`}
          >
            <LanguageIcon className="w-5 h-5" />
            <span className="font-medium">{language === 'en' ? t('sidebar.arabic') : t('sidebar.english')}</span>
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
            className={`w-full flex items-center justify-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="font-medium">{isLoggingOut ? t('sidebar.loggingOut') : t('sidebar.logout')}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;