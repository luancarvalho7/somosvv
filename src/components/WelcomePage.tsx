import React from 'react';
import QuestionPage from './QuestionPage';
import { startAudit } from '../config/api';
import { clearAllData, saveAuditId } from '../utils/localStorage';

interface WelcomePageProps {
  onStart: () => void;
}

export default function WelcomePage({ onStart }: WelcomePageProps) {
  const handleStart = async () => {
    try {
      // Clear all previous audit data
      clearAllData();
      
      // Start new audit and get audit ID
      const response = await startAudit();
      
      // Save audit ID to localStorage
      if (response.auditId) {
        saveAuditId(response.auditId);
        console.log('Audit started with ID:', response.auditId);
      }
      
      // Continue to next step
      onStart();
    } catch (error) {
      console.error('Failed to start audit:', error);
      // Continue anyway to not block the user
      clearAllData();
      onStart();
    }
  };

  return (
    <QuestionPage
      title={
        <>
          <span className="font-normal">
            5 minutos de Auditoria de {" "}
            <span
              className="inline-block mx-2 font-cormorant italic text-[1.2em] bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent"
              style={{
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Growth
            </span>{" "}
          </span>
          <br />
          <span className="text-[0.9em] font-normal">
            Que vê o que funciona, o que falha
          </span>
          <br />
          <span className="text-[0.9em] font-normal">
           E o que fazer a seguir
          </span>
        </>
      }
      subtitle=""
      inputType="buttons"
      onContinue={handleStart}
      buttons={[
        {
          text: "Começar Auditoria",
          value: "start",
          primary: true,
        },
      ]}
    />
  );
}
