import React, { useState, ReactNode } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';

interface Button {
  text: string;
  value: string;
  primary?: boolean;
  secondary?: boolean;
}

interface SecondaryButton {
  text: string;
  onClick: () => void;
}

interface QuestionPageProps {
  title: ReactNode;
  subtitle: string;
  inputType: 'buttons' | 'url' | 'text' | 'email' | 'textarea';
  placeholder?: string;
  buttonText?: string;
  onBack?: () => void;
  onContinue: (value: string) => void;
  buttons?: Button[];
  secondaryButton?: SecondaryButton;
  prefillValue?: string;
}

export default function QuestionPage({
  title,
  subtitle,
  inputType,
  placeholder,
  buttonText = "Continue",
  onBack,
  onContinue,
  buttons = [],
  secondaryButton,
  prefillValue = ''
}: QuestionPageProps) {
  const [inputValue, setInputValue] = useState(prefillValue);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (inputType === 'url') {
      // Only add https:// if the value looks like a domain and doesn't contain protocol parts
      if (value && 
          !value.includes('://') && 
          !value.startsWith('http') && 
          !value.startsWith('https') &&
          value.length > 0) {
        setInputValue('https://' + value);
      } else {
        setInputValue(value);
      }
    } else {
      setInputValue(value);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (inputType === 'url') {
      const pastedText = e.clipboardData.getData('text');
      
      // If pasted text already has protocol, use as is
      if (pastedText.includes('://')) {
        setInputValue(pastedText);
      } else {
        // If no protocol, add https://
        setInputValue('https://' + pastedText);
      }
      
      e.preventDefault();
    }
  };
  
  const handleContinue = async () => {
    if (inputType === 'buttons') return;
    
    if (inputValue.trim()) {
      setIsLoading(true);
      try {
        await onContinue(inputValue.trim());
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleButtonClick = async (value: string) => {
    setIsLoading(true);
    try {
      await onContinue(value);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidInput = () => {
    if (inputType === 'buttons') return true;
    if (!inputValue.trim()) return false;
    
    if (inputType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(inputValue.trim());
    }
    
    if (inputType === 'url') {
      try {
        new URL(inputValue.trim());
        return true;
      } catch {
        return false;
      }
    }
    
    return true;
  };

  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidInput() && !isLoading) {
      handleContinue();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center p-4 pt-2">
      <AnimatedBackground />
      <div className="w-full max-w-2xl mx-auto relative z-50">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={() => {
              console.log('Back button clicked');
             if (onBack) {
               console.log('Calling onBack function');
               onBack();
             }
            }}
            className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group relative z-50"
          >
            <ArrowLeft className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform relative z-50" />
            <span className="text-sm font-medium relative z-50">Voltar</span>
          </button>
        )}

        {/* Content Container */}
        <div className="relative z-50 text-center space-y-8">
          {/* Title */}
          <div className="space-y-4 relative z-50">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight font-outfit relative z-50">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto relative z-50">
              {subtitle}
            </p>
          </div>

          {/* Input Section */}
          <div className="space-y-6 relative z-50">
            {inputType === 'buttons' ? (
              <div className="space-y-4 max-w-md mx-auto relative z-50">
                {buttons.map((button, index) => (
                  <button
                    key={index}
                    onClick={() => handleButtonClick(button.value)}
                    disabled={isLoading}
                    className={`w-full py-4 px-6 rounded-[999px] font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                      button.primary
                        ? `bg-white text-black shadow-lg hover:shadow-xl font-outfit font-semibold relative z-50 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`
                        : `bg-white text-black shadow-lg hover:shadow-xl font-outfit font-semibold relative z-50 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`
                    } relative z-50`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Carregando...</span>
                      </div>
                    ) : (
                      button.text
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-6 relative z-50">
                <div className="relative z-50">
                  {inputType === 'textarea' ? (
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={placeholder}
                      rows={6}
                      className="w-full py-4 px-6 text-lg border-2 border-gray-700 rounded-xl focus:border-gray-500 focus:outline-none transition-colors bg-gray-900 text-white placeholder-gray-400 relative z-50 resize-none"
                      autoFocus
                    />
                  ) : (
                    <input
                      type={inputType}
                      value={inputValue}
                      onChange={handleInputChange}
                      onPaste={handlePaste}
                      onKeyPress={handleKeyPress}
                      placeholder={placeholder}
                      className="w-full py-4 px-6 text-lg border-2 border-gray-700 rounded-xl focus:border-gray-500 focus:outline-none transition-colors bg-gray-900 text-white placeholder-gray-400 relative z-50"
                      autoFocus
                    />
                  )}
                </div>
                
                <button
                  onClick={handleContinue}
                  disabled={!isValidInput() || isLoading}
                  className={`w-full py-4 px-6 rounded-[999px] font-semibold text-lg transition-all duration-200 transform ${
                    isValidInput() && !isLoading
                      ? 'bg-white text-black shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] font-outfit font-semibold relative z-50'
                      : 'bg-white text-black opacity-25 cursor-not-allowed font-outfit font-semibold z-50'
                  } relative z-50`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>A analisar...</span>
                    </div>
                  ) : (
                    buttonText
                  )}
                </button>
                
                {secondaryButton && (
                  <button
                    onClick={secondaryButton.onClick}
                    disabled={isLoading}
                    className={`w-full py-3 px-6 rounded-[999px] font-medium text-base transition-all duration-200 transform ${
                      isLoading
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98]'
                    } relative z-50 border border-gray-700 hover:border-gray-600`}
                  >
                    {secondaryButton.text}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
      </div>
    </div>
  );
}