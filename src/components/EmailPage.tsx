import React from 'react';
import QuestionPage from './QuestionPage';
import { saveUserData, getAuditId, getUserAllData } from '../utils/localStorage';
import { sendBoltUpdate } from '../config/api';

interface EmailPageProps {
  onBack: () => void;
  onContinue: () => void;
}

export default function EmailPage({ onBack, onContinue }: EmailPageProps) {
  const handleContinue = async (email: string) => {
    // Save user response with timestamp
    saveUserData('email', {
      answer: email,
      timestamp: new Date().toISOString()
    });
    
    // Track Lead event with Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead');
      console.log('Facebook Pixel: Lead event tracked');
    }
    
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
  };

  return (
    <QuestionPage
      title="Qual é o seu endereço de email?"
      subtitle="Enviaremos o seu relatório personalizado de auditoria de crescimento aqui"
      inputType="email"
      placeholder="seu@email.com"
      buttonText="Continuar"
      onBack={onBack}
      onContinue={handleContinue}
    />
  );
}