import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard as Edit2, Check, X } from 'lucide-react';
import { saveUserData, getUserData, getAuditId, getUserAllData } from '../utils/localStorage';
import { sendBoltUpdate } from '../config/api';
import AnimatedBackground from './AnimatedBackground';

interface EmployeeCountPageProps {
  onBack: () => void;
  onContinue: () => void;
}

export default function EmployeeCountPage({ onBack, onContinue }: EmployeeCountPageProps) {
  const [isWaitingForData, setIsWaitingForData] = useState(true);
  const [teamSize, setTeamSize] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    const checkForCompanyData = () => {
      // First check if user has a website
      const websiteUrlData = getUserData('websiteUrl');
      if (websiteUrlData && websiteUrlData.hasWebsite === false) {
        console.log('User has no website, skipping company data wait');
        setTeamSize(0);
        setIsWaitingForData(false);
        return;
      }
      
      const companyData = getUserData('companyData');
      console.log('Checking for company data (employees):', companyData);
      
      if (companyData?.data) {
        console.log('Company data found (employees):', companyData.data);
        const employees = companyData.data.employeeCount || 0;
        setTeamSize(employees);
        setIsWaitingForData(false);
      } else {
        console.log('No company data yet, checking again in 1 second...');
        setTimeout(checkForCompanyData, 1000);
      }
    };

    checkForCompanyData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(teamSize.toString());
  };

  const handleSave = () => {
    const newTeamSize = parseInt(editValue) || 0;
    setTeamSize(newTeamSize);
    setIsEditing(false);
    
    saveUserData('employeeCount', {
      answer: newTeamSize,
      timestamp: new Date().toISOString()
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const handleContinue = () => {
    // Data is already saved when edited, just continue
    if (!getUserData('employeeCount')) {
      saveUserData('employeeCount', {
        answer: teamSize,
        timestamp: new Date().toISOString()
      });
    }
    
    // Send bolt update with auditId and updated user data
    try {
      const auditId = getAuditId();
      if (auditId) {
        const updatedUserData = getUserAllData();
        sendBoltUpdate(auditId, updatedUserData).catch(error => {
          console.error('Failed to send bolt update:', error);
        });
      }
    } catch (error) {
      console.error('Failed to send bolt update:', error);
    }
    
    onContinue();
  };

  const getTeamSizeText = (size: number): string => {
    if (size === 0) return 'Fundador solo';
    if (size === 1) return '1 pessoa';
    return `${size} pessoas`;
  };

  if (isWaitingForData) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center p-4 pt-2">
        <AnimatedBackground />
        <div className="text-center space-y-6">
          <div className="w-12 h-12 animate-spin text-white mx-auto">
            <div className="w-full h-full border-2 border-white border-t-transparent rounded-full"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">Analisando o seu website...</h2>
            <p className="text-gray-400">Isto levará apenas um momento</p>
          </div>
        </div>
      </div>
    );
  }

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
          <span className="text-sm font-medium relative z-50">Back</span>
        </button>

        {/* Content Container */}
        <div className="relative z-50 text-center space-y-8">
          {/* Title */}
          <div className="space-y-4 relative z-50">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight font-outfit relative z-50">
              Qual é o tamanho da sua equipe?
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto relative z-50">
              Diga-nos sobre o tamanho da sua equipe
            </p>
          </div>

          {/* Team Size Display/Edit Section */}
          <div className="space-y-6 relative z-50">
            <div className="max-w-md mx-auto space-y-6 relative z-50">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Enter team size (e.g., 25)"
                    className="w-full py-4 px-6 text-lg border-2 border-gray-700 rounded-xl focus:border-gray-500 focus:outline-none transition-colors bg-gray-900 text-white placeholder-gray-400 relative z-50"
                    autoFocus
                    min="0"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      className="flex-1 py-3 px-6 rounded-[999px] font-semibold text-base transition-all duration-200 transform bg-white text-black shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] font-outfit relative z-50 flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Guardar
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 py-3 px-6 rounded-[999px] font-medium text-base transition-all duration-200 transform bg-transparent text-gray-400 hover:text-white hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] relative z-50 border border-gray-700 hover:border-gray-600 flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-900 border-2 border-gray-700 rounded-xl py-6 px-6 relative z-50">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="text-3xl font-bold text-white font-outfit">
                          {getTeamSizeText(teamSize)}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          Tamanho da equipe
                        </div>
                      </div>
                      <button
                        onClick={handleEdit}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleContinue}
                className="w-full py-4 px-6 rounded-[999px] font-semibold text-lg transition-all duration-200 transform bg-white text-black shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] font-outfit font-semibold relative z-50"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}