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
    // Website Questions (1-5)
    {
      id: 1,
      question: 'After your checkout is approved on the website, what is REQUIRED before you can mark the transaction as returned?',
      options: [
        'Upload photos of your storage visit',
        'Get verbal confirmation from a manager',
        'Fill out a return form',
        'Send an email notification'
      ],
      correct: 0
    },
    {
      id: 2,
      question: 'What is the approval process for ALL checkout requests on the website?',
      options: [
        'Some checkouts are instant, others need approval',
        'ALL checkouts require manager or admin approval before you can pick up items',
        'Only expensive items need approval',
        'Checkouts are automatically approved after 24 hours'
      ],
      correct: 1
    },
    {
      id: 3,
      question: 'Can you close or return a transaction on the website without uploading the required photos?',
      options: [
        'Yes, photos are optional',
        'No - the system prevents closing transactions until photos are uploaded',
        'Only if you ask permission',
        'Only for small items'
      ],
      correct: 1
    },
    {
      id: 4,
      question: 'Where on the website can you view the status of all your checkout requests (pending, active, returned)?',
      options: [
        'Only on the Dashboard',
        'The Transactions page shows all your checkout history and statuses',
        'You have to ask a manager',
        'Notifications page only'
      ],
      correct: 1
    },
    {
      id: 5,
      question: 'What specific information is REQUIRED when submitting a checkout request on the website? (Select the most complete answer)',
      options: [
        'Name, quantity, and purpose only',
        'Name, team, phone, email, quantity, purpose, expected return date, and agreement to terms',
        'Name and item name only',
        'Just your email and the item you want'
      ],
      correct: 1
    },
    {
      id: 6,
      question: 'What is the FIRST step when you want to take something out of storage?',
      options: [
        'Go directly to storage and take it',
        'Notify Maimuna on WhatsApp first',
        'Request it on the website/app first, then notify Maimuna on WhatsApp that you sent a request',
        'Call the manager to get permission'
      ],
      correct: 2
    },
    // Storage Policy Questions (7-11)
    {
      id: 7,
      question: 'According to the MSA Storage Policy, where is the on-campus storage location?',
      options: [
        'Student Center Basement',
        'Lucy Stone Hall Basement (Livingston Campus)',
        'Rutgers Business School',
        'The location is not specified'
      ],
      correct: 1
    },
    {
      id: 8,
      question: 'According to the Storage Policy, what must you do when accessing storage via WhatsApp?',
      options: [
        'Just notify Maimuna when you\'re done',
        'Send a check-in photo upon entering AND a check-out photo after finishing',
        'Only send a photo when you leave',
        'No photos are required'
      ],
      correct: 1
    },
    {
      id: 9,
      question: 'According to the Storage Policy, how long after your event do you have to return borrowed materials?',
      options: [
        '24 hours',
        '48 hours',
        '1 week',
        'There is no time limit'
      ],
      correct: 1
    },
    {
      id: 10,
      question: 'According to the Storage Policy, what happens if you take items from Box 2 that were organized in a bag?',
      options: [
        'You can return them loose in any box',
        'You must return them in the same bag, neatly back into Box 2',
        'You can put them in a different box',
        'You can leave them on the floor'
      ],
      correct: 1
    },
    {
      id: 11,
      question: 'According to the Storage Policy, what is the consequence of disregarding storage expectations?',
      options: [
        'You receive a warning',
        'Your spec team will lose access to storage',
        'You pay a fine',
        'Nothing happens'
      ],
      correct: 1
    },
    {
      id: 12,
      question: 'According to the Storage Policy, what happens if you reorganize or assign new spaces without approval from Maimuna?',
      options: [
        'You die',
        'Your spec team will lose access to storage',
        'You get a promotion',
        'Nothing happens - it\'s allowed'
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
    const minCorrect = Math.ceil(questions.length * 0.8);

    setScore(percentage);
    setSubmitted(true);
    setPassed(percentage >= minPassingScore && correct >= minCorrect);

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
          <p className="text-gray-600 mb-4">
            Answer all {questions.length} questions correctly (80% required to pass - need {Math.ceil(questions.length * 0.8)} out of {questions.length} correct). This quiz must be passed once to access the system.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-6 rounded">
            <p className="text-sm text-blue-800 font-semibold">
              📝 Questions 1-6: Website functionality | Questions 7-12: MSA Storage Policy & Agreement
            </p>
          </div>

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

