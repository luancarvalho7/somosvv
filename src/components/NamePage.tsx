import React from 'react';
import QuestionPage from './QuestionPage';
import { saveUserData, getAuditId, getUserAllData } from '../utils/localStorage';
import { sendBoltUpdate } from '../config/api';

interface NamePageProps {
  onBack: () => void;
  onContinue: () => void;
}

export default function NamePage({ onBack, onContinue }: NamePageProps) {
  const handleContinue = async (name: string) => {
    // Save user response with timestamp
    saveUserData('name', {
      answer: name,
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
  };

  return (
    <QuestionPage
      title="Qual é o seu nome?"
      subtitle="Vamos personalizar a sua experiência de auditoria"
      inputType="text"
      placeholder="Seu nome completo"
      buttonText="Continuar"
      onBack={onBack}
      onContinue={handleContinue}
    />
  );
}