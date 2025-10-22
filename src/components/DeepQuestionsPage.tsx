import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { saveUserData, getUserAllData, getAuditId } from '../utils/localStorage';
import { sendDeepQuestions, finishAudit, sendBoltUpdate } from '../config/api';
import AnimatedBackground from './AnimatedBackground';

interface DeepQuestion {
  id: number;
  question: string;
}

interface DeepQuestionsPageProps {
  onBack: () => void;
  onContinue: (results?: any) => void;
}

export default function DeepQuestionsPage({ onBack, onContinue }: DeepQuestionsPageProps) {
  const [questions, setQuestions] = useState<DeepQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const allUserData = getUserAllData();
        console.log('Sending user data to get deep questions:', allUserData);
        
        const response = await sendDeepQuestions(allUserData);
        console.log('Received deep questions:', response);
        
        // Map the response to ensure correct structure
        if (Array.isArray(response) && response.length > 0) {
          const mappedQuestions = response.map((item: any) => ({
            id: item.id,
            question: item.question
          }));
          setQuestions(mappedQuestions);
          // Load any existing answers from localStorage
          const savedAnswers = getUserAllData();
          const existingAnswers: { [key: number]: string } = {};
          mappedQuestions.forEach((q: DeepQuestion) => {
            const savedAnswer = savedAnswers[`deepQuestion_${q.id}`];
            if (savedAnswer?.answer) {
              existingAnswers[q.id] = savedAnswer.answer;
            }
          });
          setAnswers(existingAnswers);
          setCurrentAnswer(existingAnswers[mappedQuestions[0].id] || '');
        } else {
          setError('No questions received from the server');
        }
      } catch (error) {
        console.error('Failed to fetch deep questions:', error);
        setError('Failed to load questions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswerChange = (value: string) => {
    setCurrentAnswer(value);
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion) {
      const updatedAnswers = { ...answers, [currentQuestion.id]: value };
      setAnswers(updatedAnswers);
      
      // Save to localStorage immediately
      saveUserData(`deepQuestion_${currentQuestion.id}`, {
        question: currentQuestion.question,
        answer: value,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleFinishAudit = async () => {
    try {
      setIsSubmitting(true);
      const allUserData = getUserAllData();
      console.log('Sending finish audit request with data:', allUserData);
      
      const response = await finishAudit(allUserData);
      console.log('Received audit results:', response);
      
      // Save audit results to localStorage for dev mode
      localStorage.setItem('auditResult', JSON.stringify(response));
      
      // Pass the results to the next component
      onContinue(response);
    } catch (error) {
      console.error('Failed to finish audit:', error);
      setError('Failed to complete audit. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setIsSubmitting(true);
    
    // Send bolt update before moving to next question
    try {
      const auditId = getAuditId();
      console.log('DeepQuestions Next - AuditId check:', auditId);
      if (auditId) {
        console.log('DeepQuestions Next - Sending bolt update with auditId:', auditId);
        const updatedUserData = getUserAllData();
        sendBoltUpdate(auditId, updatedUserData).catch(error => {
          console.error('Failed to send bolt update on next question:', error);
        });
      } else {
        console.warn('DeepQuestions Next - No auditId found, skipping bolt update');
      }
    } catch (error) {
      console.error('Failed to send bolt update on next question:', error);
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setCurrentAnswer(answers[questions[nextIndex].id] || '');
      setIsSubmitting(false);
    } else {
      // All questions answered, send finish audit request
      handleFinishAudit();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setCurrentAnswer(answers[questions[prevIndex].id] || '');
    } else {
      // Go back to previous page
      onBack();
    }
  };

  const isValidAnswer = () => {
    return currentAnswer.trim().length > 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center p-4 pt-2">
        <AnimatedBackground />
        <div className="text-center space-y-6 relative z-50">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">Analisando Contexto...</h2>
            <p className="text-gray-400">Isto levará apenas um momento</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center p-4 pt-2">
        <AnimatedBackground />
        <div className="text-center space-y-6 relative z-50">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">Algo correu mal</h2>
            <p className="text-gray-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 py-3 px-6 rounded-[999px] font-semibold text-base bg-white text-black hover:bg-gray-200 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center p-4 pt-2">
        <AnimatedBackground />
        <div className="text-center space-y-6 relative z-50">
          <h2 className="text-2xl font-semibold text-white">Nenhuma pergunta disponível</h2>
          <button
            onClick={onBack}
            className="py-3 px-6 rounded-[999px] font-semibold text-base bg-white text-black hover:bg-gray-200 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center p-4 pt-2">
      <AnimatedBackground />
      <div className="w-full max-w-2xl mx-auto relative z-50">
        {/* Back Button */}
        {currentQuestionIndex > 0 && (
          <button
            onClick={handleBack}
            className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group relative z-50"
          >
            <ArrowLeft className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform relative z-50" />
            <span className="text-sm font-medium relative z-50">Back</span>
          </button>
        )}

        {/* Content Container */}
        <div className="relative z-50 text-center space-y-8">
          {/* Question */}
          <div className="space-y-4 relative z-50">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight font-outfit relative z-50 text-left">
              {currentQuestion.question}
            </h1>
          </div>

          {/* Answer Section */}
          <div className="space-y-6 relative z-50">
            <div className="max-w-full mx-auto space-y-6 relative z-50">
              <textarea
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Escreva a sua resposta detalhada aqui..."
                rows={8}
                className="w-full py-4 px-6 text-lg border-2 border-gray-700 rounded-xl focus:border-gray-500 focus:outline-none transition-colors bg-gray-900 text-white placeholder-gray-400 relative z-50 resize-none leading-relaxed"
                autoFocus
              />
              
              <button
                onClick={handleNext}
                disabled={!isValidAnswer() || isSubmitting}
                className={`w-full py-4 px-6 rounded-[999px] font-semibold text-lg transition-all duration-200 transform ${
                  isValidAnswer() && !isSubmitting
                    ? 'bg-white text-black shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] font-outfit font-semibold relative z-50'
                    : 'bg-white text-black opacity-25 cursor-not-allowed font-outfit font-semibold z-50'
                } relative z-50`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processando...</span>
                  </div>
                ) : currentQuestionIndex === questions.length - 1 ? (
                  'Completar Auditoria'
                ) : (
                  'Próxima Pergunta'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}