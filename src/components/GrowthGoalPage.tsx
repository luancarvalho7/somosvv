import React from 'react';
import QuestionPage from './QuestionPage';
import { saveUserData, getAuditId, getUserAllData } from '../utils/localStorage';
import { sendBoltUpdate } from '../config/api';

interface GrowthGoalPageProps {
  onBack: () => void;
  onContinue: () => void;
}

export default function GrowthGoalPage({ onBack, onContinue }: GrowthGoalPageProps) {
  const handleContinue = async (growthGoal: string) => {
    saveUserData('growthGoal', {
      answer: growthGoal,
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
      title="Explique o seu objetivo de crescimento"
      subtitle="Que objetivos específicos de crescimento pretende alcançar?"
      inputType="textarea"
      placeholder="ex: Aumentar a receita mensal em 50% nos próximos 6 meses através de melhor geração de leads"
      buttonText="Continuar"
      onBack={onBack}
      onContinue={handleContinue}
    />
  );
}