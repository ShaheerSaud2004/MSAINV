import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const Quiz = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);

  const questions = [
    {
      id: 1,
      question: 'What is the CONSEQUENCE if you fail to return items in the exact same location and condition as received?',
      options: [
        'You receive a verbal warning',
        'You pay a small late fee',
        'Your system access will be permanently removed',
        'You get a second chance automatically'
      ],
      correct: 2
    },
    {
      id: 2,
      question: 'After your checkout is approved, what is REQUIRED before you can mark the transaction as returned?',
      options: [
        'Upload photos of your storage visit',
        'Get verbal confirmation from a manager',
        'Fill out a return form',
        'Send an email notification'
      ],
      correct: 0
    },
    {
      id: 3,
      question: 'What specific information is REQUIRED when submitting a checkout request? (Select the most complete answer)',
      options: [
        'Name, quantity, and purpose only',
        'Name, team, phone, email, quantity, purpose, expected return date, and agreement to terms',
        'Name and item name only',
        'Just your email and the item you want'
      ],
      correct: 1
    },
    {
      id: 4,
      question: 'If you return an item after the expected return date, what happens?',
      options: [
        'Nothing - there are no consequences',
        'You automatically receive late fees calculated per day overdue',
        'You get a free pass if it\'s your first time',
        'You just need to apologize'
      ],
      correct: 1
    },
    {
      id: 5,
      question: 'What is the QUICK ACCESS URL to browse all available items?',
      options: [
        'https://00cd5ca08599.ngrok-free.app/dashboard',
        'https://00cd5ca08599.ngrok-free.app/items',
        'https://00cd5ca08599.ngrok-free.app/transactions',
        'The URL is not important'
      ],
      correct: 1
    },
    {
      id: 6,
      question: 'What is the approval process for ALL checkout requests?',
      options: [
        'Some checkouts are instant, others need approval',
        'ALL checkouts require manager or admin approval before you can pick up items',
        'Only expensive items need approval',
        'Checkouts are automatically approved after 24 hours'
      ],
      correct: 1
    },
    {
      id: 7,
      question: 'If an item is lost or damaged while in your possession, what should you do IMMEDIATELY?',
      options: [
        'Wait until the return date to report it',
        'Notify MSA immediately via the system or contact',
        'Try to fix it yourself first',
        'Hide it and hope no one notices'
      ],
      correct: 1
    },
    {
      id: 8,
      question: 'Where can you view the status of all your checkout requests (pending, active, returned)?',
      options: [
        'Only on the Dashboard',
        'The Transactions page shows all your checkout history and statuses',
        'You have to ask a manager',
        'Notifications page only'
      ],
      correct: 1
    },
    {
      id: 9,
      question: 'What is the minimum passing score required to access the system?',
      options: [
        '50% (5 out of 10)',
        '60% (6 out of 10)',
        '80% (8 out of 10)',
        '100% (10 out of 10)'
      ],
      correct: 2
    },
    {
      id: 10,
      question: 'What does the Terms & Conditions agreement SPECIFICALLY state about item condition?',
      options: [
        'Items should be returned in "good" condition',
        'Items must be returned in the SAME location and condition as received',
        'Items can be returned in any condition',
        'Only damaged items need special handling'
      ],
      correct: 1
    },
    {
      id: 11,
      question: 'How can you quickly checkout an item using technology?',
      options: [
        'By calling the manager',
        'By using the QR Scanner to scan QR codes or barcodes on items',
        'By sending an email',
        'By filling out a paper form'
      ],
      correct: 1
    },
    {
      id: 12,
      question: 'What happens when you scan a QR code on an item?',
      options: [
        'Nothing - QR codes are just for decoration',
        'The item details appear automatically and you can request checkout',
        'You automatically get the item without approval',
        'You get redirected to the login page'
      ],
      correct: 1
    },
    {
      id: 13,
      question: 'Where should you check for updates about your checkout requests (approvals, rejections, reminders)?',
      options: [
        'Only via email',
        'The Notifications section (bell icon) shows all important updates',
        'You have to check with a manager personally',
        'There are no notifications'
      ],
      correct: 1
    },
    {
      id: 14,
      question: 'What is the purpose of uploading photos after approval?',
      options: [
        'It\'s optional and just for fun',
        'Photos are REQUIRED for safety, accountability, and documentation before closing transactions',
        'Photos are only needed for expensive items',
        'Photos are only for first-time users'
      ],
      correct: 1
    },
    {
      id: 15,
      question: 'If your checkout request is pending approval, what should you do?',
      options: [
        'Go pick up the item anyway',
        'Wait for approval notification - do not pick up until approved',
        'Call the manager to hurry them up',
        'Submit another request'
      ],
      correct: 1
    },
    {
      id: 16,
      question: 'What information is displayed in the "Quick Checkout" section on the Dashboard?',
      options: [
        'Only your recent checkouts',
        'The quick access URL to browse items: https://00cd5ca08599.ngrok-free.app/items',
        'Nothing important',
        'Only statistics'
      ],
      correct: 1
    },
    {
      id: 17,
      question: 'What is your responsibility regarding items while they are checked out to you?',
      options: [
        'You have no responsibility',
        'You take FULL responsibility for items while in your possession',
        'The manager is responsible',
        'Responsibility is shared'
      ],
      correct: 1
    },
    {
      id: 18,
      question: 'Can you close or return a transaction without uploading the required photos?',
      options: [
        'Yes, photos are optional',
        'No - the system prevents closing transactions until photos are uploaded',
        'Only if you ask permission',
        'Only for small items'
      ],
      correct: 1
    },
    {
      id: 19,
      question: 'What happens if you try to checkout more items than are available?',
      options: [
        'The system automatically orders more',
        'The system will reject your request if quantity exceeds available quantity',
        'You get put on a waiting list',
        'The manager decides'
      ],
      correct: 1
    },
    {
      id: 20,
      question: 'What is the MOST IMPORTANT rule to remember about returning items?',
      options: [
        'Return them whenever you feel like it',
        'Return them in the SAME location and condition as received, or your access will be removed',
        'Just return them eventually',
        'Return them in any condition as long as you return them'
      ],
      correct: 1
    }
  ];

  const handleAnswer = (questionId, answerIndex) => {
    if (submitted) return;
    setAnswers({
      ...answers,
      [questionId]: answerIndex
    });
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct) {
        correct++;
      }
    });

    const percentage = (correct / questions.length) * 100;
    const minPassingScore = 80;

    setScore(percentage);
    setSubmitted(true);
    setPassed(percentage >= minPassingScore);

    if (percentage >= minPassingScore) {
      // Save quiz completion
      const quizData = {
        userId: user?._id || user?.id,
        role: user?.role,
        score: percentage,
        passed: true,
        completedAt: new Date().toISOString(),
        // No expiration - quiz passed once is permanent
        permanent: true
      };

      localStorage.setItem('quiz_completed', JSON.stringify(quizData));
      toast.success(`Congratulations! You passed with ${percentage.toFixed(0)}%!`);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } else {
      toast.error(`You scored ${percentage.toFixed(0)}%. You need ${minPassingScore}% to pass. Please review the tutorial and try again.`);
    }
  };

  const handleRetry = () => {
    navigate('/tutorial');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Access Quiz</h1>
          <p className="text-gray-600 mb-6">
            Answer all {questions.length} questions correctly (80% required to pass). This quiz must be passed once to access the system.
          </p>

          {submitted && (
            <div className={`mb-6 p-4 rounded-lg ${
              passed ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
            }`}>
              <div className="flex items-center gap-3">
                {passed ? (
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                ) : (
                  <XCircleIcon className="w-8 h-8 text-red-600" />
                )}
                <div>
                  <p className={`font-bold text-lg ${
                    passed ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {passed ? 'Congratulations! You Passed!' : 'You Did Not Pass'}
                  </p>
                  <p className={`text-sm ${
                    passed ? 'text-green-700' : 'text-red-700'
                  }`}>
                    Your score: {score.toFixed(0)}% {passed ? '(80% required)' : '(Need 80% to pass)'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {questions.map((q, index) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correct;
              const showAnswer = submitted;

              return (
                <div
                  key={q.id}
                  className={`border-2 rounded-lg p-6 ${
                    showAnswer
                      ? isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <p className="text-lg font-semibold text-gray-900 flex-1">
                      {q.question}
                    </p>
                  </div>

                  <div className="space-y-2 ml-11">
                    {q.options.map((option, optIndex) => {
                      const isSelected = userAnswer === optIndex;
                      const isCorrectOption = optIndex === q.correct;

                      return (
                        <label
                          key={optIndex}
                          className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                            showAnswer && isCorrectOption
                              ? 'bg-green-100 border-2 border-green-500'
                              : showAnswer && isSelected && !isCorrect
                              ? 'bg-red-100 border-2 border-red-500'
                              : isSelected
                              ? 'bg-blue-50 border-2 border-blue-500'
                              : 'bg-gray-50 border-2 border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={optIndex}
                            checked={isSelected}
                            onChange={() => handleAnswer(q.id, optIndex)}
                            disabled={submitted}
                            className="mr-3 h-4 w-4"
                          />
                          <span className="flex-1 text-gray-700">{option}</span>
                          {showAnswer && isCorrectOption && (
                            <CheckCircleIcon className="w-5 h-5 text-green-600 ml-2" />
                          )}
                          {showAnswer && isSelected && !isCorrect && (
                            <XCircleIcon className="w-5 h-5 text-red-600 ml-2" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-between items-center pt-6 border-t">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
            >
              Review Tutorial
            </button>

            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < questions.length}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Quiz
              </button>
            ) : !passed ? (
              <button
                onClick={handleRetry}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
              >
                Retake Tutorial & Quiz
              </button>
            ) : (
              <div className="text-green-600 font-semibold">
                Redirecting to dashboard...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;

