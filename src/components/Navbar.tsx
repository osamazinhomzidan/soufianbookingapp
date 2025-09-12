'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/hooks/useTheme';
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
  SunIcon,
  MoonIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface NavbarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Navbar = ({ isOpen, onToggle }: NavbarProps) => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
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
      
      {/* Horizontal Navbar */}
      <nav className={`
        fixed top-0 left-0 right-0 h-16 xl:h-20 ${isDark ? 'bg-gray-900/95' : 'bg-white/95'} navbar-blur navbar-shadow z-50 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}
      `}>
        <div className="flex items-center justify-between h-full px-4 xl:px-6">
          {/* Logo and Brand */}
          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 xl:space-x-3`}>
            <div className="w-8 h-8 xl:w-10 xl:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center ">
              <span className="text-white font-bold text-sm xl:text-lg">H</span>
            </div>
            <span className={`text-lg xl:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} ${textAlignClass} tracking-wide hidden sm:block`}>HotelOS</span>
          </div>

          {/* Desktop Navigation Menu */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-3">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`
                  navbar-item flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-1 xl:space-x-2 px-2 xl:px-4 py-1.5 xl:py-2 rounded-lg transition-all duration-200 group
                  ${item.isActive 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md transform scale-105' 
                    : `${isDark ? 'text-gray-300 hover:bg-gray-800/50 hover:text-white' : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'}`
                  }
                `}
              >
                <item.icon className={`w-4 h-4 xl:w-5 xl:h-5 transition-colors duration-200 ${item.isActive ? 'text-white' : `${isDark ? 'text-gray-400 group-hover:text-green-400' : 'text-gray-600 group-hover:text-green-600'}`}`} />
                <span className={`font-bold text-xs xl:text-sm ${textAlignClass} transition-colors duration-200`}>{item.title}</span>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-1 xl:space-x-2">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className={`navbar-button p-1.5 xl:p-2 rounded-lg ${isDark ? 'hover:bg-gray-800/50 text-gray-300 hover:text-yellow-400' : 'hover:bg-gray-100/80 text-gray-600 hover:text-purple-600'} transition-all duration-200`}
              title={isDark ? t('sidebar.lightMode') : t('sidebar.darkMode')}
            >
              {isDark ? <SunIcon className="w-4 h-4 xl:w-5 xl:h-5" /> : <MoonIcon className="w-4 h-4 xl:w-5 xl:h-5" />}
            </button>
            
            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage}
              className={`navbar-button p-1.5 xl:p-2 rounded-lg ${isDark ? 'hover:bg-gray-800/50 text-gray-300 hover:text-blue-400' : 'hover:bg-gray-100/80 text-gray-600 hover:text-blue-600'} transition-all duration-200`}
              title={language === 'en' ? t('sidebar.arabic') : t('sidebar.english')}
            >
              <LanguageIcon className="w-4 h-4 xl:w-5 xl:h-5" />
            </button>
            
            {/* User Menu */}
            <div className="relative">
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
                className={`navbar-button flex items-center space-x-1 xl:space-x-2 px-2 xl:px-3 py-1.5 xl:py-2 rounded-lg ${isDark ? 'hover:bg-red-900/20 text-gray-300 hover:text-red-400' : 'hover:bg-red-50 text-gray-600 hover:text-red-600'} transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 xl:w-5 xl:h-5" />
                <span className="hidden sm:block text-xs xl:text-sm font-medium">{isLoggingOut ? t('sidebar.loggingOut') : t('sidebar.logout')}</span>
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={onToggle}
              className={`navbar-button lg:hidden p-1.5 xl:p-2 rounded-lg ${isDark ? 'hover:bg-gray-800/50 text-gray-300' : 'hover:bg-gray-100/80 text-gray-600'} transition-all duration-200`}
            >
              <Bars3Icon className="w-5 h-5 xl:w-6 xl:h-6" />
            </button>
          </div>
        </div>

      </nav>

      {/* Mobile Menu Dropdown */}
      <div className={`
        mobile-menu lg:hidden fixed top-16 xl:top-20 left-0 right-0 ${isDark ? 'bg-gray-900/95' : 'bg-white/95'} navbar-blur navbar-shadow border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} z-40 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-y-0' : '-translate-y-full'}
      `}>
        <div className="p-4 space-y-2">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={onToggle}
              className={`
                navbar-item flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group
                ${item.isActive 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md transform scale-105' 
                  : `${isDark ? 'text-gray-300 hover:bg-gray-800/50 hover:text-white' : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'} hover:scale-105`
                }
              `}
            >
              <item.icon className={`w-6 h-6 transition-colors duration-200 ${item.isActive ? 'text-white' : `${isDark ? 'text-gray-400 group-hover:text-green-400' : 'text-gray-600 group-hover:text-green-600'}`}`} />
              <span className={`font-medium ${textAlignClass} transition-colors duration-200`}>{item.title}</span>
            </Link>
          ))}
        </div>

      </div>
    </>
  );
};

export default Navbar;