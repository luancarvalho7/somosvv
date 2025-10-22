import React, { useState } from 'react';
import { ArrowLeft, Phone } from 'lucide-react';
import { saveUserData, getAuditId, getUserAllData } from '../utils/localStorage';
import { sendBoltUpdate } from '../config/api';
import AnimatedBackground from './AnimatedBackground';

interface PhoneNumberPageProps {
  onBack: () => void;
  onContinue: () => void;
}

export default function PhoneNumberPage({ onBack, onContinue }: PhoneNumberPageProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (phoneNumber.trim()) {
      setIsLoading(true);
      try {
        // Save user response with timestamp
        saveUserData('phoneNumber', {
          answer: phoneNumber.trim(),
          timestamp: new Date().toISOString()
        });
        
        // Send bolt update with auditId and updated user data
        try {
          const auditId = getAuditId();
          if (auditId) {
            const updatedUserData = getUserAllData();
            await sendBoltUpdate(auditId, updatedUserData);
          }
        } catch (error) {
          console.error('Failed to send bolt update:', error);
        }
        
        onContinue();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const isValidPhone = () => {
    return phoneNumber.trim().length > 0;
  };

  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidPhone() && !isLoading) {
      handleContinue();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center p-4 pt-2">
      <AnimatedBackground />
      <div className="w-full max-w-2xl mx-auto relative z-50">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group relative z-50"
        >
          <ArrowLeft className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform relative z-50" />
          <span className="text-sm font-medium relative z-50">Voltar</span>
        </button>

        {/* Content Container */}
        <div className="relative z-50 text-center space-y-8">
          {/* Title */}
          <div className="space-y-4 relative z-50">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight font-outfit relative z-50">
              Qual é o seu número de telefone?
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto relative z-50">
              Para que possamos entrar em contato consigo rapidamente
            </p>
          </div>

          {/* Input Section */}
          <div className="space-y-6 relative z-50">
            <div className="max-w-md mx-auto space-y-6 relative z-50">
              <div className="relative z-50">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Seu número de telefone"
                  className="w-full py-4 px-6 text-lg border-2 border-gray-700 rounded-xl focus:border-gray-500 focus:outline-none transition-colors bg-gray-900 text-white placeholder-gray-400 relative z-50"
                  autoFocus
                />
              </div>
              
              <button
                onClick={handleContinue}
                disabled={!isValidPhone() || isLoading}
                className={`w-full py-4 px-6 rounded-[999px] font-semibold text-lg transition-all duration-200 transform ${
                  isValidPhone() && !isLoading
                    ? 'bg-white text-black shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] font-outfit font-semibold relative z-50'
                    : 'bg-white text-black opacity-25 cursor-not-allowed font-outfit font-semibold z-50'
                } relative z-50`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="w-5 h-5 animate-pulse" />
                    <span>A processar...</span>
                  </div>
                ) : (
                  'Continuar'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}