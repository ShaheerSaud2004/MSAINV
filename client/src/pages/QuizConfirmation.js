import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const QuizConfirmation = () => {
  const { user, markQuizPromptAnswered } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  const handleYes = () => {
    markQuizPromptAnswered(true);
    navigate('/dashboard');
  };

  const handleNo = () => {
    markQuizPromptAnswered(false);
    navigate('/tutorial');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl p-10 space-y-6 text-center">
        <div className="flex justify-center">
          <CheckCircleIcon className="w-16 h-16 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Have you already completed the storage & website quiz?</h1>
        <p className="text-gray-600">
          We ask every time you log in to make sure everyone understands the rules. If you have not taken the quiz yet, please do so now before accessing the system.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleYes}
            className="w-full inline-flex justify-center items-center px-4 py-3 border border-green-200 rounded-xl text-lg font-semibold text-green-700 bg-green-50 hover:bg-green-100 transition-all"
          >
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            Yes, I completed it
          </button>
          <button
            onClick={handleNo}
            className="w-full inline-flex justify-center items-center px-4 py-3 border border-red-200 rounded-xl text-lg font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition-all"
          >
            <XCircleIcon className="w-5 h-5 mr-2" />
            No, take me to it
          </button>
        </div>
        <p className="text-sm text-gray-500">
          This confirmation is temporary until everyone completes the quiz. Thanks for helping keep storage safe and organized!
        </p>
      </div>
    </div>
  );
};

export default QuizConfirmation;


