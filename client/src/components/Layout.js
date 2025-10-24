import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  CubeIcon,
  ArrowsRightLeftIcon,
  UsersIcon,
  BellIcon,
  ChartBarIcon,
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 bg-blue-600">
            <Link to="/dashboard" className="flex items-center">
              <CubeIcon className="w-8 h-8 text-white" />
              <span className="ml-2 text-xl font-bold text-white">MSA Inventory</span>
            </Link>
            <button
              className="lg:hidden text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            {navigationSections.map((section, sectionIndex) => {
              const visibleItems = section.items.filter(item => item.show);
              if (visibleItems.length === 0) return null;
              
              return (
                <div key={sectionIndex} className="mb-6">
                  {section.title && (
                    <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {section.title}
                    </h3>
                  )}
                  <div className="space-y-1">
                    {visibleItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                          location.pathname === item.href
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <div className="flex items-center">
                          <item.icon className="w-5 h-5 mr-3" />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* User Section - Bottom Left */}
          <div className="p-4 border-t border-gray-200 bg-blue-50">
            <div className="mb-3">
              <div className="flex items-center mb-2">
                <UserCircleIcon className="w-10 h-10 text-blue-600" />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs font-medium text-blue-600 uppercase">{user?.role || 'Guest'}</p>
                </div>
              </div>
              
              {/* Additional User Info */}
              <div className="mt-2 space-y-1 text-xs text-gray-600">
                {user?.email && (
                  <p className="truncate">📧 {user.email}</p>
                )}
                {user?.team && (
                  <p className="truncate">👥 {user.team}</p>
                )}
                {user?.phone && (
                  <p className="truncate">📞 {user.phone}</p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Link
                to="/profile"
                className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-100"
                onClick={() => setSidebarOpen(false)}
              >
                <UserCircleIcon className="w-4 h-4 mr-1" />
                Profile
              </Link>
              <Link
                to="/settings"
                className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-100"
                onClick={() => setSidebarOpen(false)}
              >
                <Cog6ToothIcon className="w-4 h-4" />
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
          <button
            className="lg:hidden text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            <Link
              to="/notifications"
              className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <BellIcon className="w-6 h-6" />
              {/* Notification badge - can be dynamic */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Link>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;

