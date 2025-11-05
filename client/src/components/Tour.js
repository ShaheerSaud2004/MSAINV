import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { XMarkIcon, ChevronRightIcon, ChevronLeftIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const Tour = ({ steps, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (steps && steps.length > 0 && currentStep < steps.length) {
      const step = steps[currentStep];
      
      // Navigate to the target page if needed
      if (step.targetPage && window.location.pathname !== step.targetPage) {
        navigate(step.targetPage);
      }

      // Wait for page to load, then highlight element
      setTimeout(() => {
        if (step.targetSelector) {
          // Try to find the element
          const element = document.querySelector(step.targetSelector);
          if (element) {
            setHighlightedElement(element);
            // Scroll to element smoothly
            element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            // Add a temporary highlight class
            element.classList.add('tour-highlight');
            setTimeout(() => {
              element.classList.remove('tour-highlight');
            }, 2000);
          } else {
            setHighlightedElement(null);
          }
        } else {
          setHighlightedElement(null);
        }
      }, step.targetPage ? 1000 : 300);
    }
  }, [currentStep, steps, navigate]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setHighlightedElement(null);
    onComplete();
  };

  const handleSkip = () => {
    setHighlightedElement(null);
    onSkip();
  };

  if (!steps || steps.length === 0 || currentStep >= steps.length) {
    return null;
  }

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={handleSkip}
      />

      {/* Highlight Box */}
      {highlightedElement && (
        <div
          className="fixed z-50 border-4 border-blue-500 rounded-lg shadow-2xl pointer-events-none"
          style={{
            top: highlightedElement.getBoundingClientRect().top + window.scrollY - 4,
            left: highlightedElement.getBoundingClientRect().left + window.scrollX - 4,
            width: highlightedElement.getBoundingClientRect().width + 8,
            height: highlightedElement.getBoundingClientRect().height + 8,
          }}
        />
      )}

      {/* Tour Card */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-2xl border-4 border-blue-500 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <InformationCircleIcon className="w-6 h-6 text-white" />
              <div>
                <h3 className="text-white font-bold text-lg">Guided Tour</h3>
                <p className="text-blue-100 text-xs">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4">
              <h4 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h4>
              <p className="text-gray-700 leading-relaxed">{step.content}</p>
              {step.action && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">{step.action}</p>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handlePrevious}
                disabled={isFirst}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isFirst
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <ChevronLeftIcon className="w-5 h-5 inline mr-1" />
                Previous
              </button>

              <div className="flex gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentStep
                        ? 'bg-blue-600'
                        : index < currentStep
                        ? 'bg-blue-300'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
              >
                {isLast ? 'Finish Tour' : 'Next'}
                <ChevronRightIcon className="w-5 h-5 inline ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tour;

