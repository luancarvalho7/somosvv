import React from 'react';
import { CheckCircle, Heart, ArrowLeft } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';

interface ThankYouPageProps {
  onBack?: () => void;
}

export default function ThankYouPage({ onBack }: ThankYouPageProps) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center p-4">
      <AnimatedBackground />
      
      <div className="w-full max-w-2xl mx-auto relative z-50 text-center">
        {/* Back Button (optional) */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-0 left-0 mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform" />
            <span className="text-sm font-medium">Voltar</span>
          </button>
        )}

        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Main Message */}
        <div className="space-y-6 mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight font-outfit">
            Obrigado!
          </h1>
          
          <div className="space-y-4">
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-light">
              Entrarei em contato com você em breve!
            </p>
            
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Heart className="w-5 h-5 text-red-400 animate-pulse" />
              <span className="text-base">Sua auditoria foi concluída com sucesso</span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-gray-950/90 border border-gray-800 rounded-2xl p-8 space-y-4">
          <h2 className="text-xl font-semibold text-white font-outfit mb-4">
            O que acontece agora?
          </h2>
          
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-sm font-bold">1</span>
              </div>
              <p className="text-gray-300 text-base">
                Analisaremos os seus resultados em detalhe
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-sm font-bold">2</span>
              </div>
              <p className="text-gray-300 text-base">
                Prepararemos recomendações personalizadas para o seu negócio
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-sm font-bold">3</span>
              </div>
              <p className="text-gray-300 text-base">
                Entraremos em contato nas próximas 24-48 horas
              </p>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Verifique o seu email (incluindo a pasta de spam) para atualizações
          </p>
        </div>
      </div>
    </div>
  );
}