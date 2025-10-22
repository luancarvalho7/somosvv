import React, { useState, useEffect } from 'react';
import QuestionPage from './QuestionPage';
import { saveUserData, getUserData, getAuditId, getUserAllData } from '../utils/localStorage';
import { sendBoltUpdate } from '../config/api';
import { Loader2 } from 'lucide-react';

interface CompanyDescriptionPageProps {
  onBack: () => void;
  onContinue: () => void;
}

export default function CompanyDescriptionPage({ onBack, onContinue }: CompanyDescriptionPageProps) {
  const [isWaitingForData, setIsWaitingForData] = useState(true);
  const [prefillValue, setPrefillValue] = useState('');

  useEffect(() => {
    const checkForCompanyData = () => {
      // First check if user has a website
      const websiteUrlData = getUserData('websiteUrl');
      if (websiteUrlData && websiteUrlData.hasWebsite === false) {
        console.log('User has no website, skipping company data wait');
        setPrefillValue('');
        setIsWaitingForData(false);
        return;
      }
      
      const companyData = getUserData('companyData');
      console.log('Checking for company data (description):', companyData);
      
      if (companyData?.data) {
        console.log('Company data found (description):', companyData.data);
        setPrefillValue(companyData.data.companyDescription || '');
        setIsWaitingForData(false);
      } else {
        console.log('No company data yet, checking again in 1 second...');
        setTimeout(checkForCompanyData, 1000);
      }
    };

    checkForCompanyData();
  }, []);

  const handleContinue = async (companyDescription: string) => {
    // Save user response with timestamp
    saveUserData('companyDescription', {
      answer: companyDescription,
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

  if (isWaitingForData) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center p-4 pt-2">
        <div className="text-center space-y-6">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">Analisando o seu website...</h2>
            <p className="text-gray-400">Isto levará apenas um momento</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QuestionPage
      title="Explique brevemente o que é a sua empresa"
      subtitle="Descreva o que a sua empresa faz"
      inputType="textarea"
      placeholder="ex: Desenvolvemos soluções baseadas em IA para pequenas empresas automatizarem o seu atendimento ao cliente e aumentarem a eficiência"
      buttonText="Continuar"
      onBack={onBack}
      onContinue={handleContinue}
      prefillValue={prefillValue}
    />
  );
}