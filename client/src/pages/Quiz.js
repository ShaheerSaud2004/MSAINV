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
      question: 'What happens if you don\'t return items in the same location and condition as received?',
      options: [
        'Nothing happens',
        'You get a warning',
        'Your access will be removed',
        'You pay a small fee'
      ],
      correct: 2
    },
    {
      id: 2,
      question: 'After your checkout is approved, what must you do before closing the transaction?',
      options: [
        'Nothing, just return it',
        'Upload photos of your storage visit',
        'Call the manager',
        'Send an email'
      ],
      correct: 1
    },
    {
      id: 3,
      question: 'How often do you need to retake this quiz?',
      options: [
        'Never',
        'Once a month',
        'Every 2 days',
        'Once a year'
      ],
      correct: 2
    },
    {
      id: 4,
      question: 'What happens if you return an item late?',
      options: [
        'Nothing',
        'You may receive penalties',
        'You get a free pass',
        'You get a bonus'
      ],
      correct: 1
    },
    {
      id: 5,
      question: 'Where can you browse all available items?',
      options: [
        'Dashboard only',
        'Items page',
        'Transactions page',
        'Settings page'
      ],
      correct: 1
    },
    {
      id: 6,
      question: 'Do all checkouts require approval?',
      options: [
        'No, some are instant',
        'Yes, all require manager/admin approval',
        'Only expensive items',
        'Only for new users'
      ],
      correct: 1
    },
    {
      id: 7,
      question: 'What should you do if an item is lost or damaged while in your possession?',
      options: [
        'Hide it',
        'Wait until return date',
        'Notify MSA immediately',
        'Buy a replacement'
      ],
      correct: 2
    },
    {
      id: 8,
      question: 'Where can you track all your checkouts and returns?',
      options: [
        'Dashboard',
        'Items page',
        'Transactions page',
        'Notifications'
      ],
      correct: 2
    },
    {
      id: 9,
      question: 'What is the minimum passing score for this quiz?',
      options: [
        '50%',
        '60%',
        '80%',
        '100%'
      ],
      correct: 2
    },
    {
      id: 10,
      question: 'What information is required when requesting a checkout?',
      options: [
        'Just your name',
        'Name, team, phone, email, purpose, and return date',
        'Just the item name',
        'Only quantity'
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
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days from now
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
            Answer all questions correctly (80% required to pass). You need to retake this quiz every 2 days.
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

