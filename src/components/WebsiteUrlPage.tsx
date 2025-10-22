import React from 'react';
import QuestionPage from './QuestionPage';
import { analyzeWebsite } from '../config/api';
import { saveUserData, getAuditId, getUserAllData } from '../utils/localStorage';
import { sendBoltUpdate } from '../config/api';

interface WebsiteUrlPageProps {
  onBack: () => void;
  onContinue: (websiteUrl: string, hasWebsite: boolean) => void;
}

export default function WebsiteUrlPage({ onBack, onContinue }: WebsiteUrlPageProps) {
  console.log('WebsiteUrlPage rendered, onBack:', typeof onBack);
  
  const handleContinue = async (value: string) => {
    const hasWebsite = value !== 'no-website';
    const websiteUrl = hasWebsite ? value : '';
    
    // Save user response with timestamp
    saveUserData('websiteUrl', {
      answer: websiteUrl,
      hasWebsite,
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
    
    // Fire the API request but don't wait for it
    if (hasWebsite && websiteUrl) {
      analyzeWebsite(websiteUrl).then(companyData => {
        console.log('Company data received:', companyData);
        saveUserData('companyData', {
          data: companyData,
          timestamp: new Date().toISOString()
        });
      }).catch(error => {
        console.error('Failed to analyze website:', error);
      });
    }
    
    // Continue immediately to next step
    onContinue(websiteUrl, hasWebsite);
  };

  const handleNoWebsite = async () => {
    try {
      await handleContinue('no-website');
    } catch (error) {
      console.error('Error handling no website:', error);
    }
  };

  return (
    <QuestionPage
      title="Qual é o URL do seu website?"
      subtitle="Digite o website da sua empresa para que possamos analisá-lo"
      inputType="url"
      placeholder="https://seuwebsite.com"
      buttonText="Continuar"
      onBack={onBack}
      onContinue={handleContinue}
      secondaryButton={{
        text: "Não tenho um website",
        onClick: handleNoWebsite
      }}
    />
  );
}