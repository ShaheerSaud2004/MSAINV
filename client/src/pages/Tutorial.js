import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

const Tutorial = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    {
      title: 'Welcome to MSA Inventory System! 👋',
      content: (
        <div className="space-y-4">
          <p className="text-lg text-gray-700">
            This tutorial will help you understand how to use the inventory management system. 
            Please read through all sections carefully.
          </p>
          <p className="text-gray-600">
            After completing this tutorial, you'll need to pass a comprehensive quiz to access the system. 
            This quiz must be passed once to gain permanent access.
          </p>
        </div>
      )
    },
    {
      title: '1. Dashboard 📊',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Your dashboard is your home base. Here you can see:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Your active checkouts</li>
            <li>Overdue items (if any)</li>
            <li>Quick access to items and transactions</li>
            <li>Recent activity and notifications</li>
          </ul>
          <p className="text-gray-700 font-semibold">
            Always check your dashboard regularly to stay on top of your checkouts!
          </p>
        </div>
      )
    },
    {
      title: '2. Browsing Items 📦',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            To browse available items:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Click on "Items" in the sidebar</li>
            <li>Use the search bar to find specific items</li>
            <li>Filter by category using the category chips</li>
            <li>Click on any item to see details and request checkout</li>
          </ul>
          <p className="text-gray-700 font-semibold">
            Quick link: https://00cd5ca08599.ngrok-free.app/items
          </p>
        </div>
      )
    },
    {
      title: '3. Requesting Checkout ✅',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            When you need to checkout an item:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Click on the item you need</li>
            <li>Click "Checkout" button</li>
            <li>Fill out all required information:
              <ul className="list-circle list-inside ml-6 mt-2 space-y-1">
                <li>Your name, team, phone, and email</li>
                <li>Quantity needed</li>
                <li>Purpose for checkout</li>
                <li>Expected return date</li>
              </ul>
            </li>
            <li>Read and agree to the terms and conditions</li>
            <li>Submit for approval</li>
          </ul>
          <p className="text-gray-700 font-semibold">
            All checkouts require manager/admin approval before you can pick up the item.
          </p>
        </div>
      )
    },
    {
      title: '4. Terms & Conditions ⚠️',
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-800 font-bold mb-2">
              ⚠️ CRITICAL REQUIREMENTS:
            </p>
            <ul className="list-disc list-inside space-y-1 text-red-700 ml-4">
              <li>Items must be returned by the specified return date</li>
              <li>Items must be returned in the SAME location and condition as received</li>
              <li>Failure to return items properly will result in ACCESS REMOVAL</li>
              <li>Late returns may result in penalties</li>
              <li>You are fully responsible for items while in your possession</li>
              <li>Notify MSA immediately if items are lost or damaged</li>
            </ul>
          </div>
          <p className="text-gray-700 font-semibold">
            These rules are strictly enforced. Please follow them carefully!
          </p>
        </div>
      )
    },
    {
      title: '5. After Approval - Upload Photos 📸',
      content: (
        <div className="space-y-4">
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
            <p className="text-orange-800 font-bold mb-2">
              ⚠️ REQUIRED: Upload Photos Before Closing Transaction
            </p>
            <p className="text-orange-700">
              After your checkout is approved, you MUST upload photos of your storage visit 
              before you can close/return the transaction. This is required for safety and accountability.
            </p>
          </div>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>When visiting storage, take photos of the items</li>
            <li>Upload photos using the "Upload Photos" button on the transaction page</li>
            <li>You cannot mark items as returned until photos are uploaded</li>
            <li>Photos are required for every storage visit</li>
          </ul>
        </div>
      )
    },
    {
      title: '6. Viewing Transactions 📋',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Track all your checkouts in the Transactions section:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>See all your checkout requests (pending, active, returned)</li>
            <li>View transaction details and status</li>
            <li>Check return dates and overdue items</li>
            <li>Upload photos for approved checkouts</li>
            <li>Mark items as returned when you bring them back</li>
          </ul>
          <p className="text-gray-700 font-semibold">
            Always check your transactions regularly to avoid overdue items!
          </p>
        </div>
      )
    },
    {
      title: '7. QR Code Scanning 📱',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Use QR codes for quick checkout:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Go to "QR Scanner" in the sidebar</li>
            <li>Scan QR codes or barcodes on items</li>
            <li>Item details will appear automatically</li>
            <li>Request checkout directly from the scanner</li>
          </ul>
          <p className="text-gray-700 font-semibold">
            QR scanning makes checkout faster and easier!
          </p>
        </div>
      )
    },
    {
      title: '8. Notifications 🔔',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Stay updated with notifications:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Get notified when your checkout is approved or rejected</li>
            <li>Receive reminders about return dates</li>
            <li>See alerts for overdue items</li>
            <li>Check notifications by clicking the bell icon</li>
          </ul>
          <p className="text-gray-700 font-semibold">
            Always check your notifications for important updates!
          </p>
        </div>
      )
    },
    {
      title: 'You\'re Ready! 🎉',
      content: (
        <div className="space-y-4">
          <p className="text-lg text-gray-700">
            You've completed the tutorial! Now you'll take a quiz to test your understanding.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-blue-800 font-semibold mb-2">Important Reminders:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700 ml-4">
              <li>You must pass the quiz (80% score) to access the system</li>
              <li>This quiz must be passed once - it's permanent</li>
              <li>Always return items in the same location and condition</li>
              <li>Upload photos after approval before closing transactions</li>
              <li>Check your notifications regularly</li>
            </ul>
          </div>
          <p className="text-gray-700 font-semibold">
            Good luck with the quiz!
          </p>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      navigate('/quiz');
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Section {currentSection + 1} of {sections.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(((currentSection + 1) / sections.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Section Content */}
        <div className="mb-8 min-h-[400px]">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {sections[currentSection].title}
          </h1>
          <div className="text-gray-700 text-lg leading-relaxed">
            {sections[currentSection].content}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentSection === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentSection === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ChevronLeftIcon className="w-5 h-5" />
              Previous
            </button>
            {currentSection === sections.length - 1 && (
              <button
                onClick={() => {
                  if (window.confirm('Skip tutorial and quiz? This will grant you immediate access.')) {
                    // Mark quiz as passed (skip)
                    const quizData = {
                      passed: true,
                      completedAt: new Date().toISOString(),
                      permanent: true,
                      skipped: true
                    };
                    localStorage.setItem('quiz_completed', JSON.stringify(quizData));
                    navigate('/dashboard');
                  }
                }}
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-all"
              >
                Skip Tutorial & Quiz
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {sections.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentSection
                    ? 'bg-blue-600 w-8'
                    : index < currentSection
                    ? 'bg-blue-300'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
          >
            {currentSection === sections.length - 1 ? 'Take Quiz' : 'Next'}
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;

