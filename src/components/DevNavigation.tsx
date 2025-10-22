import React from 'react';
import { ChevronLeft, ChevronRight, Home, Target } from 'lucide-react';

interface DevNavigationProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
}

const stepNames = [
  'Bem-vindo',
  'URL do Website',
  'Email',
  'Número de Telefone',
  'Nome',
  'Nome da Empresa',
  'Descrição da Empresa',
  'Receita Mensal',
  'Número de Funcionários',
  'Nicho',
  'Canais de Aquisição',
  'Redes Sociais',
  'Ofertas Principais',
  'Objetivo de Crescimento',
  'Perguntas Profundas',
  'Resultados',
  'Obrigado'
];

export default function DevNavigation({ currentStep, totalSteps, onStepChange }: DevNavigationProps) {
  const isDevMode = localStorage.getItem('devMode') === 'true';
  
  if (!isDevMode) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[200] pointer-events-none">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/80 backdrop-blur-sm border border-gray-700 rounded-lg p-3 pointer-events-auto">
          <div className="flex items-center justify-between gap-4">
            {/* Step Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onStepChange(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="text-xs text-gray-300 min-w-[120px] text-center">
                Passo {currentStep + 1} de {totalSteps}
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {stepNames[currentStep] || 'Desconhecido'}
                </div>
              </div>
              
              <button
                onClick={() => onStepChange(Math.min(totalSteps - 1, currentStep + 1))}
                disabled={currentStep === totalSteps - 1}
                className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onStepChange(0)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Ir para Bem-vindo"
              >
                <Home className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onStepChange(15)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Ir para Resultados"
              >
                <Target className="w-4 h-4" />
              </button>
              
              <div className="w-px h-4 bg-gray-600 mx-1"></div>
              
              <button
                onClick={() => {
                  localStorage.removeItem('devMode');
                  window.location.reload();
                }}
                className="text-[10px] text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded"
              >
                Sair Dev
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
            <div
              className="h-1 rounded-full transition-all duration-300"
              style={{
                backgroundImage: 'linear-gradient(to right, #022D21, rgb(236, 72, 153))',
                width: `${((currentStep + 1) / 16) * 100}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}