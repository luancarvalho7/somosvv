import React, { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp, AlertTriangle, Target, Zap, Calendar, CheckCircle, Shield } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';
import { getAuditId, getUserAllData } from '../utils/localStorage';
import { sendBoltUpdate } from '../config/api';

interface GoldMatch {
  product: string;
  confidence_pct: number;
  fit_reason: string;
  solves: string;
}

interface CustomerValue {
  outcomes: string[];
  indicative_timeline: string;
}

interface Alternative {
  product: string;
  why_not_primary: string;
}

interface NextStep {
  action: string;
  what_you_get: string;
  commitment: string;
}

interface AuditResult {
  headline: string;
  status: string;
  gold_match: GoldMatch;
  customer_value: CustomerValue;
  what_this_requires: string[];
  alternatives_considered: Alternative[];
  risks_and_mitigation: string[];
  next_step: NextStep;
}

interface ResultsPageProps {
  results: AuditResult;
  onContinue?: () => void;
}

export default function ResultsPage({ results, onContinue }: ResultsPageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayResults, setDisplayResults] = useState<AuditResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedResults = localStorage.getItem('auditResult');
    console.log('Raw stored results from localStorage:', storedResults);

    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        console.log('Parsed results from localStorage:', parsedResults);
        const resultData = Array.isArray(parsedResults) ? parsedResults[0] : parsedResults;
        console.log('Final result data to display:', resultData);
        setDisplayResults(resultData);
        setIsVisible(true);
      } catch (error) {
        console.error('Failed to parse stored audit results:', error);
        setDisplayResults(results);
        setIsVisible(true);
      }
    } else {
      console.log('No stored results, using passed results:', results);
      setDisplayResults(results);
      setIsVisible(true);
    }
  }, [results]);

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

  const getStatusColor = (status: string) => {
    if (status.toLowerCase() === 'fit') return 'text-green-400';
    if (status.toLowerCase() === 'potential') return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusBadge = (status: string) => {
    if (status.toLowerCase() === 'fit') return { label: 'Ótimo Fit', color: 'bg-green-500/20 border-green-500/50 text-green-400' };
    if (status.toLowerCase() === 'potential') return { label: 'Potencial', color: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' };
    return { label: 'Não Recomendado', color: 'bg-red-500/20 border-red-500/50 text-red-400' };
  };

  const handleCTAClick = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const auditId = getAuditId();
      if (auditId) {
        const userData = getUserAllData();
        const ctaData = {
          ...userData,
          cta_clicked: {
            action: displayResults.next_step.action,
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

    if (onContinue) {
      onContinue();
    }
  };

  const statusBadge = getStatusBadge(displayResults.status);

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <AnimatedBackground />

      {/* Header Section */}
      <div className="relative z-50 pt-8 pb-8 md:pt-12 md:pb-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 bg-gray-900/80 border border-gray-700 rounded-full px-6 py-3 mb-8">
              <Zap className="w-4 h-4" style={{color: '#05664D'}} />
              <span className="text-gray-300 font-medium text-sm">Análise de Fit Completa</span>
            </div>

            <div className={`inline-flex items-center gap-2 ${statusBadge.color} border rounded-full px-4 py-2 mb-6`}>
              <CheckCircle className="w-4 h-4" />
              <span className="font-semibold text-sm">{statusBadge.label}</span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-white mb-6 md:mb-8 leading-tight font-outfit max-w-5xl mx-auto px-2">
              {displayResults.headline}
            </h1>
          </div>
        </div>
      </div>

      {/* Gold Match Section */}
      <div className="relative z-50 mb-12 md:mb-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className={`bg-gray-950/90 border border-gray-800 rounded-3xl p-6 md:p-12 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '300ms' }}>
            <div className="flex items-start gap-6 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-2xl md:text-3xl font-semibold text-white font-outfit">
                    {displayResults.gold_match.product.replace(/_/g, ' ')}
                  </h2>
                  <div className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full">
                    <span className="text-green-400 font-bold text-sm">{displayResults.gold_match.confidence_pct}% Match</span>
                  </div>
                </div>
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-4">
                  {displayResults.gold_match.fit_reason}
                </p>
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                    <p className="text-gray-300">
                      <span className="font-semibold text-white">Como resolve: </span>
                      {displayResults.gold_match.solves}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Value Section */}
      <div className="relative z-50 mb-12 md:mb-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-4xl font-semibold text-white text-center mb-8 md:mb-12 font-outfit">O Que Você Ganha</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Outcomes */}
            <div className={`bg-gray-950/90 border border-gray-800 rounded-2xl p-6 md:p-8 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`} style={{ transitionDelay: '400ms' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-white font-outfit">Resultados Esperados</h3>
              </div>
              <div className="space-y-4">
                {displayResults.customer_value.outcomes.map((outcome, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-gray-300 leading-relaxed">{outcome}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className={`bg-gray-950/90 border border-gray-800 rounded-2xl p-6 md:p-8 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`} style={{ transitionDelay: '500ms' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-white font-outfit">Cronograma</h3>
              </div>
              <p className="text-lg text-gray-300 leading-relaxed">
                {displayResults.customer_value.indicative_timeline}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements Section */}
      <div className="relative z-50 mb-12 md:mb-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-4xl font-semibold text-white text-center mb-8 md:mb-12 font-outfit">O Que Isso Requer</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayResults.what_this_requires.map((requirement, index) => (
              <div
                key={index}
                className={`bg-gray-950/90 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-300 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${600 + index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-sm font-bold">{index + 1}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{requirement}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alternatives Section */}
      {displayResults.alternatives_considered && displayResults.alternatives_considered.length > 0 && (
        <div className="relative z-50 mb-12 md:mb-20">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <h2 className="text-2xl md:text-4xl font-semibold text-white text-center mb-8 md:mb-12 font-outfit">Alternativas Consideradas</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayResults.alternatives_considered.map((alt, index) => (
                <div
                  key={index}
                  className={`bg-gray-950/90 border border-gray-800 rounded-xl p-6 transition-all duration-300 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${900 + index * 100}ms` }}
                >
                  <h3 className="text-xl font-semibold text-white mb-3 font-outfit">
                    {alt.product.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    <span className="text-gray-500 font-medium">Por que não é primário: </span>
                    {alt.why_not_primary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Risks Section */}
      {displayResults.risks_and_mitigation && displayResults.risks_and_mitigation.length > 0 && (
        <div className="relative z-50 mb-12 md:mb-20">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <h2 className="text-2xl md:text-4xl font-semibold text-white text-center mb-8 md:mb-12 font-outfit">Riscos e Mitigação</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayResults.risks_and_mitigation.map((risk, index) => (
                <div
                  key={index}
                  className={`bg-gray-950/90 border border-yellow-900/50 rounded-xl p-6 hover:border-yellow-800/70 transition-all duration-300 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${1100 + index * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                    <p className="text-gray-300 leading-relaxed">{risk}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Next Step CTA Section */}
      <div className="relative z-50 pb-16 md:pb-20">
        <div className="max-w-4xl mx-auto px-3 md:px-6">
          <div className={`bg-gray-950/90 border border-gray-800 rounded-3xl p-5 md:p-16 text-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '1300ms' }}>
            <div className="mb-4 md:mb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6" style={{backgroundImage: 'linear-gradient(to right, #022D21, rgb(236, 72, 153))'}}>
                <ArrowRight className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h2 className="text-xl md:text-4xl lg:text-5xl font-semibold text-white mb-3 md:mb-6 font-outfit leading-tight px-1 md:px-2">
                Próximo Passo
              </h2>
              <p className="text-base md:text-2xl text-gray-300 leading-relaxed mb-2 md:mb-4 font-light max-w-3xl mx-auto px-1 md:px-2">
                {displayResults.next_step.action}
              </p>
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 md:p-6 mb-4 md:mb-6 max-w-2xl mx-auto">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <p className="text-gray-300 text-left">
                    <span className="font-semibold text-white">O que você recebe: </span>
                    {displayResults.next_step.what_you_get}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                  <p className="text-gray-300 text-left">
                    <span className="font-semibold text-white">Compromisso: </span>
                    {displayResults.next_step.commitment}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleCTAClick}
              disabled={isSubmitting}
              className={`inline-flex items-center gap-2 md:gap-3 text-white font-semibold py-3 md:py-5 px-5 md:px-10 rounded-full text-base md:text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl font-outfit ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
              style={{
                backgroundImage: 'linear-gradient(to right, #022D21, rgb(219, 39, 119))',
                boxShadow: '0 0 50px rgba(2, 45, 33, 0.25)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #011f17, rgb(190, 24, 93))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #022D21, rgb(219, 39, 119))';
              }}
            >
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
              <span>{isSubmitting ? 'Enviando...' : 'Avançar para Próximo Passo'}</span>
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
