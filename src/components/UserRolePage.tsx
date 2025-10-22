import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { saveUserData, getAuditId, getUserAllData } from '../utils/localStorage';
import { sendBoltUpdate } from '../config/api';
import AnimatedBackground from './AnimatedBackground';

interface UserRolePageProps {
  onBack: () => void;
  onContinue: () => void;
}

const roleOptions = [
  { value: 'founder', label: 'Fundador/CEO' },
  { value: 'cofounder', label: 'Co-fundador' },
  { value: 'director', label: 'Diretor' },
  { value: 'manager', label: 'Gerente/Manager' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Vendas' },
  { value: 'operations', label: 'Operações' },
  { value: 'other', label: 'Outro' }
];

export default function UserRolePage({ onBack, onContinue }: UserRolePageProps) {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [customRole, setCustomRole] = useState<string>('');

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    if (role !== 'other') {
      setCustomRole('');
    }
  };

  const handleContinue = () => {
    const finalRole = selectedRole === 'other' ? customRole : selectedRole;

    if (!finalRole) {
      return;
    }

    saveUserData('userRole', {
      answer: finalRole,
      timestamp: new Date().toISOString()
    });

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

  const canContinue = selectedRole && (selectedRole !== 'other' || customRole.trim());

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
              Qual é a sua função na empresa?
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto relative z-50">
              Diga-nos qual é o seu papel na organização
            </p>
          </div>

          {/* Role Selection */}
          <div className="space-y-6 relative z-50">
            <div className="max-w-md mx-auto space-y-4 relative z-50">
              {roleOptions.map((role) => (
                <button
                  key={role.value}
                  onClick={() => handleRoleSelect(role.value)}
                  className={`w-full py-4 px-6 rounded-xl font-medium text-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] relative z-50 ${
                    selectedRole === role.value
                      ? 'bg-white text-black shadow-lg'
                      : 'bg-gray-900 text-white border-2 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {role.label}
                </button>
              ))}

              {/* Custom Role Input */}
              {selectedRole === 'other' && (
                <div className="mt-4">
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="Digite a sua função"
                    className="w-full py-4 px-6 text-lg border-2 border-gray-700 rounded-xl focus:border-gray-500 focus:outline-none transition-colors bg-gray-900 text-white placeholder-gray-400 relative z-50"
                    autoFocus
                  />
                </div>
              )}

              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`w-full py-4 px-6 rounded-[999px] font-semibold text-lg transition-all duration-200 transform shadow-lg font-outfit font-semibold relative z-50 ${
                  canContinue
                    ? 'bg-white text-black hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                }`}
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
