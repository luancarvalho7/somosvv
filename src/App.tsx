import React, { useState } from 'react';
import WelcomePage from './components/WelcomePage';
import WebsiteUrlPage from './components/WebsiteUrlPage';
import EmailPage from './components/EmailPage';
import PhoneNumberPage from './components/PhoneNumberPage';
import NamePage from './components/NamePage';
import CompanyNamePage from './components/CompanyNamePage';
import CompanyDescriptionPage from './components/CompanyDescriptionPage';
import MonthlyRevenuePage from './components/MonthlyRevenuePage';
import NichePage from './components/NichePage';
import DeepQuestionsPage from './components/DeepQuestionsPage';
import ResultsPage from './components/ResultsPage';
import ThankYouPage from './components/ThankYouPage';
import ProgressBar from './components/ProgressBar';
import DevNavigation from './components/DevNavigation';
import { getUserAllData } from './utils/localStorage';
import { saveURLParamsToStorage } from './utils/urlParams';

export type FormData = {
  websiteUrl?: string;
  email?: string;
  name?: string;
  companyName?: string;
  hasWebsite?: boolean;
};

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [auditResults, setAuditResults] = useState<any>(null);
  const totalSteps = 11; // Welcome, Website URL, Email, Phone Number, Name, Company Name, Company Description, Monthly Revenue, Niche, Deep Questions, Results, Thank You

  // Save URL parameters on app load
  React.useEffect(() => {
    saveURLParamsToStorage();
  }, []);

  const handleNext = async (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setCurrentStep(prev => prev + 1);
    
    // Log the stored user data for debugging
    const userData = getUserAllData();
    if (userData) {
      console.log('Stored user data:', userData);
    }
  };

  const handleFinishAudit = (results: any) => {
    setAuditResults(results);
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    console.log('handleBack called, current step:', currentStep);
    if (currentStep > 0) {
      console.log('Going back from step', currentStep, 'to step', currentStep - 1);
      setCurrentStep(prev => prev - 1);
    } else {
      console.log('Already at first step, cannot go back');
    }
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomePage onStart={() => handleNext({})} />;
      case 1:
        return (
          <WebsiteUrlPage
            onBack={handleBack}
            onContinue={(websiteUrl, hasWebsite) => handleNext({ websiteUrl, hasWebsite })}
          />
        );
      case 2:
        return (
          <EmailPage
            onBack={handleBack}
            onContinue={() => handleNext({})}
          />
        );
      case 3:
        return (
          <PhoneNumberPage
            onBack={handleBack}
            onContinue={() => handleNext({})}
          />
        );
      case 4:
        return (
          <NamePage
            onBack={handleBack}
            onContinue={() => handleNext({})}
          />
        );
      case 5:
        return (
          <CompanyNamePage
            onBack={handleBack}
            onContinue={() => handleNext({})}
          />
        );
      case 6:
        return (
          <CompanyDescriptionPage
            onBack={handleBack}
            onContinue={() => handleNext({})}
          />
        );
      case 7:
        return (
          <MonthlyRevenuePage
            onBack={handleBack}
            onContinue={() => handleNext({})}
          />
        );
      case 8:
        return (
          <NichePage
            onBack={handleBack}
            onContinue={() => handleNext({})}
          />
        );
      case 9:
        return (
          <DeepQuestionsPage
            onBack={handleBack}
            onContinue={handleFinishAudit}
          />
        );
      case 10:
        return <ResultsPage results={auditResults} onContinue={() => handleNext({})} />;
      case 11:
        return <ThankYouPage onBack={handleBack} />;
      default:
        return (
          <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-white text-center">
              <h1 className="text-4xl font-bold mb-4">Audit Complete!</h1>
              <p className="text-gray-400">All your data has been collected. Check the console for the stored user data.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <DevNavigation 
        currentStep={currentStep} 
        totalSteps={totalSteps} 
        onStepChange={handleStepChange} 
      />
      {currentStep > 0 && <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />}
      {renderStep()}
    </>
  );
}