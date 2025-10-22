import React, { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp, AlertTriangle, Target, Zap, Calendar, CheckCircle, XCircle } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';
import { getAuditId, getUserAllData } from '../utils/localStorage';
import { sendBoltUpdate } from '../config/api';

interface PerformanceMetric {
  score: number;
  status: string;
  insight: string;
}

interface PerformanceScorecard {
  marketing_reach: PerformanceMetric;
  conversion_funnel: PerformanceMetric;
  operational_efficiency: PerformanceMetric;
  growth_readiness: PerformanceMetric;
  overall_score: string;
}

interface FutureGrowthPotential {
  summary: string;
  from_to: {
    current_state: string;
    target_state: string;
  };
  final_insight: string;
}

interface CTA {
  title: string;
  offer: string;
  final_cta: string;
}

interface AuditResult {
  headline: string;
  performance_scorecard: PerformanceScorecard;
  key_gaps: string[];
  future_growth_potential: FutureGrowthPotential;
  cta: CTA;
}

interface ResultsPageProps {
  results: AuditResult;
  onContinue?: () => void;
}

export default function ResultsPage({ results, onContinue }: ResultsPageProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [displayResults, setDisplayResults] = useState<AuditResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to parse score from string (e.g., "33%") to number (e.g., 33)
  const parseScore = (score: string | number): number => {
    if (typeof score === 'number') return score;
    if (typeof score === 'string') {
      // Remove % sign and convert to number
      const numericValue = parseFloat(score.replace('%', ''));
      return isNaN(numericValue) ? 0 : numericValue;
    }
    return 0;
  };

  // Helper function to normalize performance scorecard data
  const normalizePerformanceData = (data: any): AuditResult => {
    const normalizedData = { ...data };
    
    // Ensure performance_scorecard exists
    if (!normalizedData.performance_scorecard) {
      normalizedData.performance_scorecard = {};
    }
    
    // Define default metric structure
    const defaultMetric: PerformanceMetric = {
      score: 0,
      status: 'Weak',
      insight: 'Dados não disponíveis'
    };
    
    // Ensure all required metrics exist with default values
    const requiredMetrics = ['marketing_reach', 'conversion_funnel', 'operational_efficiency', 'growth_readiness'];
    requiredMetrics.forEach(metricKey => {
      if (!normalizedData.performance_scorecard[metricKey]) {
        normalizedData.performance_scorecard[metricKey] = { ...defaultMetric };
      } else {
        // Ensure all properties exist
        normalizedData.performance_scorecard[metricKey] = {
          score: normalizedData.performance_scorecard[metricKey].score || 0,
          status: normalizedData.performance_scorecard[metricKey].status || 'Weak',
          insight: normalizedData.performance_scorecard[metricKey].insight || 'Dados não disponíveis'
        };
      }
    });
    
    // Normalize each performance metric score
    Object.keys(normalizedData.performance_scorecard).forEach(key => {
      if (key !== 'overall_score' && normalizedData.performance_scorecard[key]?.score !== undefined) {
        normalizedData.performance_scorecard[key].score = parseScore(normalizedData.performance_scorecard[key].score);
      }
    });
    
    // Ensure other required properties exist
    if (!normalizedData.key_gaps) {
      normalizedData.key_gaps = [];
    }
    
    if (!normalizedData.future_growth_potential) {
      normalizedData.future_growth_potential = {
        summary: 'Análise não disponível',
        from_to: {
          current_state: 'Estado atual não identificado',
          target_state: 'Objetivo não definido'
        },
        final_insight: 'Insights não disponíveis'
      };
    }
    
    if (!normalizedData.cta) {
      normalizedData.cta = {
        title: 'Entre em contato',
        offer: 'Consultoria gratuita',
        final_cta: 'Fale conosco'
      };
    }
    
    return normalizedData;
  };

  useEffect(() => {
    // Check if we have results from localStorage first
    const storedResults = localStorage.getItem('auditResult');
    console.log('Raw stored results from localStorage:', storedResults);
    
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        console.log('Parsed results from localStorage:', parsedResults);
        // Handle both array and single object responses
        const resultData = Array.isArray(parsedResults) ? parsedResults[0] : parsedResults;
        console.log('Final result data to display:', resultData);
        setDisplayResults(normalizePerformanceData(resultData));
        setIsVisible(true);
      } catch (error) {
        console.error('Failed to parse stored audit results:', error);
        setDisplayResults(results ? normalizePerformanceData(results) : null);
        setIsVisible(true);
      }
    } else {
      console.log('No stored results, using passed results:', results);
      setDisplayResults(results ? normalizePerformanceData(results) : null);
      setIsVisible(true);
    }
  }, [results]);

  // If no results available, show loading or error state
  if (!displayResults) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-center space-y-6 relative z-50">
          <div className="w-12 h-12 animate-spin text-white mx-auto">
            <div className="w-full h-full border-2 border-white border-t-transparent rounded-full"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">Carregando Resultados...</h2>
            <p className="text-gray-400">Por favor aguarde enquanto preparamos os resultados da sua auditoria.</p>
          </div>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 70) return 'from-green-500 to-emerald-600';
    if (score >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getStatusIcon = (status: string) => {
    if (status.toLowerCase() === 'strong') return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (status.toLowerCase() === 'moderate') return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    return <XCircle className="w-5 h-5 text-red-400" />;
  };

  const metrics = [
    { key: 'marketing_reach', label: 'Alcance do Marketing', icon: TrendingUp },
    { key: 'conversion_funnel', label: 'Funil de Conversão', icon: Target },
    { key: 'operational_efficiency', label: 'Eficiência Operacional', icon: Zap },
    { key: 'growth_readiness', label: 'Preparação para Crescimento', icon: ArrowRight },
  ];

  const overallScore = Math.round(
    (displayResults.performance_scorecard.marketing_reach?.score || 0 +
     displayResults.performance_scorecard.conversion_funnel?.score || 0 +
     displayResults.performance_scorecard.operational_efficiency?.score || 0 +
     displayResults.performance_scorecard.growth_readiness?.score || 0) / 4
  );

  const handleCTAClick = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Send bolt update with CTA click event
      const auditId = getAuditId();
      if (auditId) {
        const userData = getUserAllData();
        const ctaData = {
          ...userData,
          cta_clicked: {
            action: 'diagnostic_request',
            button_text: 'Quero receber meu diagnóstico completo',
            timestamp: new Date().toISOString(),
            page: 'results'
          }
        };
        
        await sendBoltUpdate(auditId, ctaData);
        console.log('CTA click sent to bolt webhook');
      }
    } catch (error) {
      console.error('Failed to send CTA click to bolt webhook:', error);
    } finally {
      setIsSubmitting(false);
    }
    
    // Continue to next page
    if (onContinue) {
      onContinue();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <AnimatedBackground />
      
      
      {/* Header Section */}
      <div className="relative z-50 pt-8 pb-8 md:pt-12 md:pb-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 bg-gray-900/80 border border-gray-700 rounded-full px-6 py-3 mb-8">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300 font-medium text-sm">Auditoria Completa de Crescimento IA</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-white mb-6 md:mb-8 leading-tight font-outfit max-w-5xl mx-auto px-2">
              {displayResults.headline}
            </h1>
          </div>
        </div>
      </div>

      {/* Overall Score Circle */}
      <div className="relative z-50 mb-12 md:mb-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className={`flex justify-center transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="relative w-48 h-48 md:w-64 md:h-64">
              {/* Background Circle */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-800"
                />
                {/* Progress Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - overallScore / 100)}`}
                  className={`transition-all duration-2000 delay-500 ${getScoreColor(overallScore).replace('text-', 'text-')}`}
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Center Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-4xl md:text-6xl font-bold ${getScoreColor(overallScore)} mb-2 font-outfit`}>
                    {overallScore}%
                  </div>
                  <div className="text-gray-400 text-sm md:text-base font-medium">Pontuação Global</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8 md:mt-12">
            <p className="text-lg md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light px-2">
              {displayResults.performance_scorecard.overall_score}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="relative z-50 mb-12 md:mb-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-4xl font-semibold text-white text-center mb-8 md:mb-16 font-outfit">Análise de Performance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {metrics.map((metric, index) => {
              const data = displayResults.performance_scorecard[metric.key as keyof PerformanceScorecard] as PerformanceMetric;
              const Icon = metric.icon;
              
              return (
                <div
                  key={metric.key}
                  className={`bg-gray-950/90 backdrop-blur-sm border border-gray-800 rounded-2xl p-4 md:p-8 hover:border-gray-700 transition-all duration-500 hover:scale-[1.01] ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${getScoreGradient(data.score)}`}>
                        <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-semibold text-white font-outfit">{metric.label}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(data.status)}
                          <span className="text-sm text-gray-400 font-medium">
                            {data.status === 'Strong' ? 'Forte' : 
                             data.status === 'Moderate' ? 'Moderado' : 
                             data.status === 'Weak' ? 'Fraco' : data.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`text-2xl md:text-3xl font-bold ${getScoreColor(data.score)} font-outfit`}>
                      {data.score}%
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-800 rounded-full h-3 mb-6">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${getScoreGradient(data.score)} transition-all duration-1000`}
                      style={{ width: `${data.score}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed">{data.insight}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Key Gaps */}
      <div className="relative z-50 mb-12 md:mb-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-4xl font-semibold text-white text-center mb-8 md:mb-16 font-outfit">Lacunas Críticas no Crescimento</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {displayResults.key_gaps.map((gap, index) => (
              <div
                key={index}
                className={`bg-gray-950/90 border border-red-900/50 rounded-xl p-4 md:p-6 hover:border-red-800/70 transition-all duration-300 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${800 + index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-400 text-sm font-bold">{index + 1}</span>
                  </div>
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed">{gap}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Potential */}
      <div className="relative z-50 mb-12 md:mb-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-4xl font-semibold text-white text-center mb-8 md:mb-12 font-outfit">O Seu Potencial para Crescer</h2>
          
          <div className={`bg-gray-950/90 border border-gray-800 rounded-3xl p-6 md:p-12 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '1200ms' }}>
            <div className="text-center mb-8 md:mb-10">
              <p className="text-base md:text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto font-light">
                {displayResults.future_growth_potential.summary}
              </p>
            </div>
            
            {/* Growth Journey Visualization */}
            <div className="relative mb-8 md:mb-10">
              {/* Mobile Layout */}
              <div className="block md:hidden space-y-6">
                {/* Current State */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-red-400 transform rotate-180" />
                    </div>
                    <h3 className="text-xl font-bold text-red-400 font-outfit">Situação Atual</h3>
                  </div>
                  <p className="text-gray-300 text-base leading-relaxed">
                    {displayResults.future_growth_potential.from_to.current_state}
                  </p>
                </div>

                {/* Arrow Connector */}
                <div className="flex justify-center py-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500/20 to-green-500/20 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-6 h-6 text-gray-400 transform rotate-90" />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">Caminho de Crescimento</span>
                  </div>
                </div>

                {/* Target State */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-green-400 font-outfit">Objetivo Pretendido</h3>
                  </div>
                  <p className="text-gray-300 text-base leading-relaxed">
                    {displayResults.future_growth_potential.from_to.target_state}
                  </p>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:block">
                <div className="grid grid-cols-3 gap-8 items-center">
                  {/* Current State */}
                  <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-red-400 transform rotate-180" />
                      </div>
                      <h3 className="text-2xl font-bold text-red-400 font-outfit">Situação Atual</h3>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {displayResults.future_growth_potential.from_to.current_state}
                    </p>
                  </div>

                  {/* Growth Path */}
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="relative w-full h-24 mb-4">
                      <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet">
                        <defs>
                          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgb(239 68 68)" stopOpacity="0.6" />
                            <stop offset="50%" stopColor="rgb(251 191 36)" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="rgb(34 197 94)" stopOpacity="0.8" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 20 50 Q 100 30 180 50"
                          stroke="url(#pathGradient)"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray="8,4"
                          className="animate-pulse"
                        />
                        {/* Progress dots */}
                        {[40, 70, 100, 130, 160].map((x, i) => (
                          <circle
                            key={i}
                            cx={x}
                            cy={50 - Math.sin((x - 20) / 160 * Math.PI) * 20}
                            r="4"
                            fill="rgb(156 163 175)"
                            className="animate-pulse"
                            style={{ animationDelay: `${i * 0.2}s` }}
                          />
                        ))}
                      </svg>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-2">
                        <ArrowRight className="w-6 h-6 text-gray-400" />
                      </div>
                      <span className="text-sm text-gray-500 font-medium">Caminho para o Crescimento</span>
                    </div>
                  </div>

                  {/* Target State */}
                  <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <Target className="w-8 h-8 text-green-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-green-400 font-outfit">Objetivo Pretendido</h3>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {displayResults.future_growth_potential.from_to.target_state}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl px-8 py-4">
                <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
                <span className="text-yellow-300 font-medium text-sm md:text-lg px-2">{displayResults.future_growth_potential.final_insight}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-50 pb-16 md:pb-20">
        <div className="max-w-4xl mx-auto px-3 md:px-6">
          <div className={`bg-gray-950/90 border border-gray-800 rounded-3xl p-5 md:p-16 text-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '1400ms' }}>
            <div className="mb-4 md:mb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                <Calendar className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h2 className="text-xl md:text-4xl lg:text-5xl font-semibold text-white mb-3 md:mb-6 font-outfit leading-tight px-1 md:px-2">
                Quer receber um diagnóstico completo?
              </h2>
              <p className="text-base md:text-2xl text-gray-300 leading-relaxed mb-4 md:mb-8 font-light max-w-3xl mx-auto px-1 md:px-2">
                Em uma chamada de 30 minutos, analisaremos como otimizar seu funil de conversão e eficiência operacional para maximizar sua receita. Clique no botão abaixo, nosso time entrará em contato.
              </p>
            </div>
            
            <button
              onClick={handleCTAClick}
              disabled={isSubmitting}
              className={`inline-flex items-center gap-2 md:gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 md:py-5 px-5 md:px-10 rounded-full text-base md:text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-purple-500/25 font-outfit ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              <Calendar className="w-5 h-5 md:w-6 md:h-6" />
              <span>{isSubmitting ? 'Enviando...' : 'Quero receber meu diagnóstico completo'}</span>
            </button>
            
            <p className="text-xs md:text-base text-gray-400 mt-3 md:mt-6 font-medium px-1 md:px-2">
              Nossa equipe entrará em contato em até 24 horas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}