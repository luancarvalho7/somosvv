import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, CreditCard as Edit2, Check } from 'lucide-react';
import { saveUserData, getUserData, getAuditId, getUserAllData } from '../utils/localStorage';
import { sendBoltUpdate } from '../config/api';
import AnimatedBackground from './AnimatedBackground';

interface AcquisitionChannelsPageProps {
  onBack: () => void;
  onContinue: () => void;
}

export default function AcquisitionChannelsPage({ onBack, onContinue }: AcquisitionChannelsPageProps) {
  const [isWaitingForData, setIsWaitingForData] = useState(true);
  const [channels, setChannels] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newChannel, setNewChannel] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    const checkForCompanyData = () => {
      // First check if user has a website
      const websiteUrlData = getUserData('websiteUrl');
      if (websiteUrlData && websiteUrlData.hasWebsite === false) {
        console.log('User has no website, skipping company data wait');
        setChannels([]);
        setIsWaitingForData(false);
        return;
      }
      
      const companyData = getUserData('companyData');
      console.log('Checking for company data (acquisition channels):', companyData);
      
      if (companyData?.data) {
        console.log('Company data found (acquisition channels):', companyData.data);
        const acquisitionChannels = companyData.data.acquisitionChannels || [];
        setChannels(acquisitionChannels);
        setIsWaitingForData(false);
      } else {
        console.log('No company data yet, checking again in 1 second...');
        setTimeout(checkForCompanyData, 1000);
      }
    };

    checkForCompanyData();
  }, []);

  const handleAddChannel = () => {
    if (newChannel.trim()) {
      const updatedChannels = [...channels, newChannel.trim()];
      setChannels(updatedChannels);
      setNewChannel('');
      setIsAdding(false);
      
      // Save immediately
      saveUserData('acquisitionChannels', {
        answer: updatedChannels,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleDeleteChannel = (index: number) => {
    const updatedChannels = channels.filter((_, i) => i !== index);
    setChannels(updatedChannels);
    
    // Save immediately
    saveUserData('acquisitionChannels', {
      answer: updatedChannels,
      timestamp: new Date().toISOString()
    });
  };

  const handleEditChannel = (index: number) => {
    setEditingIndex(index);
    setEditValue(channels[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const updatedChannels = [...channels];
      updatedChannels[editingIndex] = editValue.trim();
      setChannels(updatedChannels);
      setEditingIndex(null);
      setEditValue('');
      
      // Save immediately
      saveUserData('acquisitionChannels', {
        answer: updatedChannels,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleContinue = () => {
    // Data is already saved when modified, just continue
    if (!getUserData('acquisitionChannels')) {
      saveUserData('acquisitionChannels', {
        answer: channels,
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
              Quais são os seus canais de aquisição de clientes?
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto relative z-50">
              Como obtém clientes atualmente?
            </p>
          </div>

          {/* Channels Section */}
          <div className="relative z-50 flex flex-col h-[60vh]">
            {/* Scrollable Cards Area */}
            <div className="flex-1 overflow-y-auto max-w-md mx-auto w-full space-y-4 relative z-50 pr-2">
              {/* Existing Channels */}
              {channels.length > 0 && (
                <div className="space-y-4">
                  {channels.map((channel, index) => (
                    <div key={index} className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-600 rounded-xl p-5 flex items-center justify-between shadow-lg hover:shadow-xl transition-all duration-200 hover:border-gray-500">
                      {editingIndex === index ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 py-3 px-4 text-base border border-gray-600 rounded-lg focus:border-gray-400 focus:outline-none transition-colors bg-gray-800 text-white placeholder-gray-400"
                            placeholder="ex: Marketing nas redes sociais"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveEdit}
                            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-colors"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-400/10 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-white font-semibold text-lg">{channel}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditChannel(index)}
                              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteChannel(index)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Channel */}
              {isAdding ? (
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-2 border-gray-500 rounded-xl p-5 shadow-lg">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newChannel}
                      onChange={(e) => setNewChannel(e.target.value)}
                      placeholder="ex: Marketing nas redes sociais"
                      className="flex-1 py-3 px-4 text-base border border-gray-600 rounded-lg focus:border-gray-400 focus:outline-none transition-colors bg-gray-800 text-white placeholder-gray-400"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && handleAddChannel()}
                    />
                    <button
                      onClick={handleAddChannel}
                      className="p-3 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-colors"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setIsAdding(false);
                        setNewChannel('');
                      }}
                      className="p-3 text-gray-400 hover:text-gray-300 hover:bg-gray-400/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAdding(true)}
                  className="w-full py-6 px-6 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:text-white hover:border-gray-500 hover:bg-gray-800/50 transition-all duration-200 flex items-center justify-center gap-3 font-medium"
                >
                  <Plus className="w-6 h-6" />
                  Adicionar canal de aquisição
                </button>
              )}
            </div>

            {/* Fixed Continue Button */}
            <div className="mt-6 max-w-md mx-auto w-full relative z-50">
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