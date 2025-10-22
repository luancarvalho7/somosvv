import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, CreditCard as Edit2, Check } from 'lucide-react';
import { saveUserData, getUserData, getAuditId, getUserAllData } from '../utils/localStorage';
import { sendBoltUpdate } from '../config/api';
import AnimatedBackground from './AnimatedBackground';

interface MainOffer {
  name: string;
  description: string;
}

interface MainOffersPageProps {
  onBack: () => void;
  onContinue: () => void;
}

export default function MainOffersPage({ onBack, onContinue }: MainOffersPageProps) {
  const [isWaitingForData, setIsWaitingForData] = useState(true);
  const [mainOffers, setMainOffers] = useState<MainOffer[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newOfferName, setNewOfferName] = useState('');
  const [newOfferDescription, setNewOfferDescription] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editOfferName, setEditOfferName] = useState('');
  const [editOfferDescription, setEditOfferDescription] = useState('');

  useEffect(() => {
    const checkForCompanyData = () => {
      // First check if user has a website
      const websiteUrlData = getUserData('websiteUrl');
      if (websiteUrlData && websiteUrlData.hasWebsite === false) {
        console.log('User has no website, skipping company data wait');
        setMainOffers([]);
        setIsWaitingForData(false);
        return;
      }
      
      const companyData = getUserData('companyData');
      console.log('Checking for company data (main offers):', companyData);
      
      if (companyData?.data) {
        console.log('Company data found (main offers):', companyData.data);
        const offers = companyData.data.mainOffers || [];
        // Filter out empty entries
        const validOffers = offers.filter(
          (offer: MainOffer) => offer.name && offer.description
        );
        setMainOffers(validOffers);
        setIsWaitingForData(false);
      } else {
        console.log('No company data yet, checking again in 1 second...');
        setTimeout(checkForCompanyData, 1000);
      }
    };

    checkForCompanyData();
  }, []);

  const handleAddOffer = () => {
    if (newOfferName.trim() && newOfferDescription.trim()) {
      const updatedOffers = [...mainOffers, {
        name: newOfferName.trim(),
        description: newOfferDescription.trim()
      }];
      setMainOffers(updatedOffers);
      setNewOfferName('');
      setNewOfferDescription('');
      setIsAdding(false);
      
      // Save immediately
      saveUserData('mainOffers', {
        answer: updatedOffers,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleDeleteOffer = (index: number) => {
    const updatedOffers = mainOffers.filter((_, i) => i !== index);
    setMainOffers(updatedOffers);
    
    // Save immediately
    saveUserData('mainOffers', {
      answer: updatedOffers,
      timestamp: new Date().toISOString()
    });
  };

  const handleEditOffer = (index: number) => {
    setEditingIndex(index);
    setEditOfferName(mainOffers[index].name);
    setEditOfferDescription(mainOffers[index].description);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editOfferName.trim() && editOfferDescription.trim()) {
      const updatedOffers = [...mainOffers];
      updatedOffers[editingIndex] = {
        name: editOfferName.trim(),
        description: editOfferDescription.trim()
      };
      setMainOffers(updatedOffers);
      setEditingIndex(null);
      setEditOfferName('');
      setEditOfferDescription('');
      
      // Save immediately
      saveUserData('mainOffers', {
        answer: updatedOffers,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditOfferName('');
    setEditOfferDescription('');
  };

  const handleContinue = () => {
    // Data is already saved when modified, just continue
    if (!getUserData('mainOffers')) {
      saveUserData('mainOffers', {
        answer: mainOffers,
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
              Quais são as suas principais ofertas?
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto relative z-50">
              Liste os seus produtos e serviços
            </p>
          </div>

          {/* Main Offers Section */}
          <div className="relative z-50 flex flex-col h-[65vh] sm:h-[60vh]">
            {/* Scrollable Cards Area */}
            <div className="flex-1 overflow-y-auto max-w-full sm:max-w-2xl mx-auto w-full space-y-4 relative z-50 pr-2 px-2 sm:px-0">
              {/* Existing Offers */}
              {mainOffers.length > 0 && (
                <div className="space-y-4 sm:space-y-6">
                  {mainOffers.map((offer, index) => (
                    <div key={index} className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-600 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:border-gray-500">
                      {editingIndex === index ? (
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={editOfferName}
                            onChange={(e) => setEditOfferName(e.target.value)}
                            placeholder="Nome da oferta"
                            className="w-full py-3 px-4 text-base sm:text-lg font-semibold border border-gray-600 rounded-lg focus:border-gray-400 focus:outline-none transition-colors bg-gray-800 text-white placeholder-gray-400"
                          />
                          <textarea
                            value={editOfferDescription}
                            onChange={(e) => setEditOfferDescription(e.target.value)}
                            placeholder="Descrição da oferta"
                            rows={4}
                            className="w-full py-3 px-4 text-sm sm:text-base border border-gray-600 rounded-lg focus:border-gray-400 focus:outline-none transition-colors bg-gray-800 text-white placeholder-gray-400 resize-none leading-relaxed"
                          />
                          <div className="flex justify-end gap-2 flex-wrap">
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-colors flex items-center gap-2 font-medium text-sm"
                            >
                              <Check className="w-4 h-4" />
                              Guardar
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-2 text-gray-400 hover:text-gray-300 hover:bg-gray-400/10 rounded-lg transition-colors flex items-center gap-2 font-medium text-sm"
                            >
                              <X className="w-4 h-4" />
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="text-left flex-1">
                            <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" style={{backgroundImage: 'linear-gradient(to right, rgb(96, 165, 250), #022D21)'}}></div>
                              <h3 className="text-lg sm:text-2xl font-bold text-white leading-tight">{offer.name}</h3>
                            </div>
                            <p className="text-gray-300 leading-relaxed text-sm sm:text-lg ml-4 sm:ml-6">{offer.description}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 self-start sm:ml-4">
                            <button
                              onClick={() => handleEditOffer(index)}
                              className="p-2 sm:p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteOffer(index)}
                              className="p-2 sm:p-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Offer */}
              {isAdding ? (
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-2 border-gray-500 rounded-xl p-4 sm:p-6 shadow-lg">
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={newOfferName}
                      onChange={(e) => setNewOfferName(e.target.value)}
                      placeholder="Nome da oferta (ex: Soluções de IA Personalizadas)"
                      className="w-full py-3 px-4 text-base sm:text-lg font-semibold border border-gray-600 rounded-lg focus:border-gray-400 focus:outline-none transition-colors bg-gray-800 text-white placeholder-gray-400"
                      autoFocus
                    />
                    <textarea
                      value={newOfferDescription}
                      onChange={(e) => setNewOfferDescription(e.target.value)}
                      placeholder="Descrição da oferta"
                      rows={4}
                      className="w-full py-3 px-4 text-sm sm:text-base border border-gray-600 rounded-lg focus:border-gray-400 focus:outline-none transition-colors bg-gray-800 text-white placeholder-gray-400 resize-none leading-relaxed"
                    />
                    <div className="flex justify-end gap-2 flex-wrap">
                      <button
                        onClick={handleAddOffer}
                        className="px-3 py-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-colors flex items-center gap-2 font-medium text-sm"
                      >
                        <Check className="w-4 h-4" />
                        Adicionar
                      </button>
                      <button
                        onClick={() => {
                          setIsAdding(false);
                          setNewOfferName('');
                          setNewOfferDescription('');
                        }}
                        className="px-3 py-2 text-gray-400 hover:text-gray-300 hover:bg-gray-400/10 rounded-lg transition-colors flex items-center gap-2 font-medium text-sm"
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAdding(true)}
                  className="w-full py-6 sm:py-8 px-4 sm:px-6 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:text-white hover:border-gray-500 hover:bg-gray-800/50 transition-all duration-200 flex items-center justify-center gap-3 font-medium text-base sm:text-lg"
                >
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                  Adicionar oferta principal
                </button>
              )}
            </div>

            {/* Fixed Continue Button */}
            <div className="mt-4 sm:mt-6 max-w-full sm:max-w-2xl mx-auto w-full relative z-50 px-2 sm:px-0">
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