import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  CubeIcon,
  ArrowsRightLeftIcon,
  UsersIcon,
  BellIcon,
  QrCodeIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  PlusCircleIcon,
  PrinterIcon,
  ShieldCheckIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Navigation sections organized by role
  const navigationSections = [
    {
      title: null, // Main navigation (no title)
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, show: true },
        { name: 'Items', href: '/items', icon: CubeIcon, show: true },
        { name: 'Transactions', href: '/transactions', icon: ArrowsRightLeftIcon, show: true },
        { name: 'QR Scanner', href: '/qr-scanner', icon: QrCodeIcon, show: true },
        { name: 'Notifications', href: '/notifications', icon: BellIcon, show: true },
      ]
    },
    {
      title: 'Admin & Manager', // Admin/Manager section
      items: [
        { 
          name: 'Admin Panel', 
          href: '/admin', 
          icon: ShieldCheckIcon, 
          show: user?.role === 'admin' || user?.role === 'manager',
          badge: true 
        },
        { 
          name: 'Add New Item', 
          href: '/items/new', 
          icon: PlusCircleIcon, 
          show: user?.permissions?.canManageItems 
        },
        { 
          name: 'Print QR Codes', 
          href: '/print-qr-codes', 
          icon: PrinterIcon, 
          show: user?.permissions?.canManageItems 
        },
        { 
          name: 'User Management', 
          href: '/users', 
          icon: UsersIcon, 
          show: user?.permissions?.canManageUsers 
        },
        { 
          name: 'Analytics & Reports', 
          href: '/analytics', 
          icon: DocumentChartBarIcon, 
          show: user?.permissions?.canViewAnalytics 
        },
      ]
    },
    {
      title: 'Settings', // Settings section
      items: [
        { 
          name: 'Settings', 
          href: '/settings', 
          icon: Cog6ToothIcon, 
          show: user?.permissions?.canManageSettings || user?.role === 'admin'
        },
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gradient-to-br from-gray-900 to-blue-900 bg-opacity-75 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-white to-gray-50 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-gray-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="relative overflow-hidden flex items-center justify-between h-20 px-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20"></div>
            <Link to="/dashboard" className="relative flex items-center group">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/20 transition-all">
                <CubeIcon className="w-7 h-7 text-white" />
              </div>
              <span className="ml-3 text-xl font-extrabold text-white tracking-tight">MSA Inventory</span>
            </Link>
            <button
              className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 overflow-y-auto">
            {navigationSections.map((section, sectionIndex) => {
              const visibleItems = section.items.filter(item => item.show);
              if (visibleItems.length === 0) return null;
              
              return (
                <div key={sectionIndex} className="mb-8">
                  {section.title && (
                    <h3 className="px-4 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {section.title}
                    </h3>
                  )}
                  <div className="space-y-1">
                    {visibleItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                          location.pathname === item.href
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'text-gray-700 hover:bg-gray-100 hover:translate-x-1'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <div className="flex items-center">
                          <item.icon className={`w-5 h-5 mr-3 ${
                            location.pathname === item.href ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
                          }`} />
                          <span className={`font-semibold ${
                            location.pathname === item.href ? 'text-white' : 'text-gray-700'
                          }`}>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* User Section - Bottom Left */}
          <div className="relative overflow-hidden p-4 border-t border-gray-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full -mr-16 -mt-16 opacity-20"></div>
            <div className="relative mb-4">
              <div className="flex items-center mb-3 p-3 bg-white rounded-xl shadow-sm">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full animate-pulse opacity-20"></div>
                  <UserCircleIcon className="relative w-12 h-12 text-blue-600" />
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-2 py-0.5 rounded-full inline-block uppercase">
                    {user?.role || 'Guest'}
                  </p>
                </div>
              </div>
              
              {/* Additional User Info */}
              {(user?.email || user?.team || user?.phone) && (
                <div className="mt-2 space-y-1.5 text-xs bg-white/50 backdrop-blur-sm rounded-lg p-2">
                  {user?.email && (
                    <p className="truncate text-gray-700 font-medium">📧 {user.email}</p>
                  )}
                  {user?.team && (
                    <p className="truncate text-gray-700 font-medium">👥 {user.team}</p>
                  )}
                  {user?.phone && (
                    <p className="truncate text-gray-700 font-medium">📞 {user.phone}</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="relative flex space-x-2">
              <Link
                to="/profile"
                className="flex-1 flex items-center justify-center px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white rounded-xl hover:bg-gray-50 shadow-sm hover:shadow-md transition-all"
                onClick={() => setSidebarOpen(false)}
              >
                <UserCircleIcon className="w-4 h-4 mr-1.5" />
                Profile
              </Link>
              <Link
                to="/settings"
                className="flex items-center justify-center px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white rounded-xl hover:bg-gray-50 shadow-sm hover:shadow-md transition-all"
                onClick={() => setSidebarOpen(false)}
              >
                <Cog6ToothIcon className="w-5 h-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center px-3 py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 shadow-sm hover:shadow-md transition-all"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
          <button
            className="lg:hidden text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center space-x-2">
            <Link
              to="/notifications"
              className="relative p-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-all hover:scale-105"
            >
              <BellIcon className="w-6 h-6" />
              {/* Notification badge - can be dynamic */}
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            </Link>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 min-h-screen">{children}</main>
      </div>
    </div>
  );
};

export default Layout;

