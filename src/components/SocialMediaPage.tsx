import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, CreditCard as Edit2, Check } from 'lucide-react';
import { saveUserData, getUserData, getAuditId, getUserAllData } from '../utils/localStorage';
import { sendBoltUpdate } from '../config/api';
import AnimatedBackground from './AnimatedBackground';

interface SocialMediaAccount {
  platformName: string;
  username: string;
}

interface SocialMediaPageProps {
  onBack: () => void;
  onContinue: () => void;
}

export default function SocialMediaPage({ onBack, onContinue }: SocialMediaPageProps) {
  const [isWaitingForData, setIsWaitingForData] = useState(true);
  const [socialMedia, setSocialMedia] = useState<SocialMediaAccount[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newPlatform, setNewPlatform] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editPlatform, setEditPlatform] = useState('');
  const [editUsername, setEditUsername] = useState('');

  useEffect(() => {
    const checkForCompanyData = () => {
      // First check if user has a website
      const websiteUrlData = getUserData('websiteUrl');
      if (websiteUrlData && websiteUrlData.hasWebsite === false) {
        console.log('User has no website, skipping company data wait');
        setSocialMedia([]);
        setIsWaitingForData(false);
        return;
      }
      
      const companyData = getUserData('companyData');
      console.log('Checking for company data (social media):', companyData);
      
      if (companyData?.data) {
        console.log('Company data found (social media):', companyData.data);
        const socialMediaData = companyData.data.socialMedia || [];
        // Filter out empty entries
        const validSocialMedia = socialMediaData.filter(
          (sm: SocialMediaAccount) => sm.platformName && sm.username
        );
        setSocialMedia(validSocialMedia);
        setIsWaitingForData(false);
      } else {
        console.log('No company data yet, checking again in 1 second...');
        setTimeout(checkForCompanyData, 1000);
      }
    };

    checkForCompanyData();
  }, []);

  const handleAddSocialMedia = () => {
    if (newPlatform.trim() && newUsername.trim()) {
      const updatedSocialMedia = [...socialMedia, {
        platformName: newPlatform.trim(),
        username: newUsername.trim()
      }];
      setSocialMedia(updatedSocialMedia);
      setNewPlatform('');
      setNewUsername('');
      setIsAdding(false);
      
      // Save immediately
      saveUserData('socialMedia', {
        answer: updatedSocialMedia,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleDeleteSocialMedia = (index: number) => {
    const updatedSocialMedia = socialMedia.filter((_, i) => i !== index);
    setSocialMedia(updatedSocialMedia);
    
    // Save immediately
    saveUserData('socialMedia', {
      answer: updatedSocialMedia,
      timestamp: new Date().toISOString()
    });
  };

  const handleEditSocialMedia = (index: number) => {
    setEditingIndex(index);
    setEditPlatform(socialMedia[index].platformName);
    setEditUsername(socialMedia[index].username);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editPlatform.trim() && editUsername.trim()) {
      const updatedSocialMedia = [...socialMedia];
      updatedSocialMedia[editingIndex] = {
        platformName: editPlatform.trim(),
        username: editUsername.trim()
      };
      setSocialMedia(updatedSocialMedia);
      setEditingIndex(null);
      setEditPlatform('');
      setEditUsername('');
      
      // Save immediately
      saveUserData('socialMedia', {
        answer: updatedSocialMedia,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditPlatform('');
    setEditUsername('');
  };

  const handleContinue = () => {
    // Data is already saved when modified, just continue
    if (!getUserData('socialMedia')) {
      saveUserData('socialMedia', {
        answer: socialMedia,
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

  const getPlatformEmoji = (platform: string): string => {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes('instagram')) return '📸';
    if (platformLower.includes('twitter') || platformLower.includes('x')) return '🐦';
    if (platformLower.includes('facebook')) return '👥';
    if (platformLower.includes('linkedin')) return '💼';
    if (platformLower.includes('youtube')) return '📺';
    if (platformLower.includes('tiktok')) return '🎵';
    if (platformLower.includes('medium')) return '📝';
    return '🌐';
  };

  const isInstagram = (platform: string): boolean => {
    return platform.toLowerCase().includes('instagram');
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
              Quais são as suas contas de redes sociais?
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto relative z-50">
              Liste as suas plataformas sociais e nomes de utilizador
            </p>
          </div>

          {/* Social Media Section */}
          <div className="relative z-50 flex flex-col h-[60vh]">
            {/* Scrollable Cards Area */}
            <div className="flex-1 overflow-y-auto max-w-md mx-auto w-full space-y-4 relative z-50 pr-2">
              {/* Existing Social Media */}
              {socialMedia.length > 0 && (
                <div className="space-y-4">
                  {socialMedia.map((account, index) => (
                    <div key={index} className={`${
                      isInstagram(account.platformName) 
                        ? 'bg-gradient-to-r from-pink-900/30 to-purple-900/30 border-pink-500/50 shadow-pink-500/20' 
                        : 'bg-gradient-to-r from-gray-900 to-gray-800 border-gray-600 shadow-gray-500/20'
                    } border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:border-opacity-80`}>
                      {editingIndex === index ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-3">
                            <input
                              type="text"
                              value={editPlatform}
                              onChange={(e) => setEditPlatform(e.target.value)}
                              placeholder="Plataforma"
                              className="w-full py-3 px-4 text-base border border-gray-600 rounded-lg focus:border-gray-400 focus:outline-none transition-colors bg-gray-800 text-white placeholder-gray-400"
                            />
                            <input
                              type="text"
                              value={editUsername}
                              onChange={(e) => setEditUsername(e.target.value)}
                              placeholder="Nome de utilizador"
                              className="w-full py-3 px-4 text-base border border-gray-600 rounded-lg focus:border-gray-400 focus:outline-none transition-colors bg-gray-800 text-white placeholder-gray-400"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
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
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <div className={`font-bold text-xl flex items-center gap-3 ${
                              isInstagram(account.platformName) ? 'text-pink-300' : 'text-white'
                            }`}>
                              <span className="text-2xl">{getPlatformEmoji(account.platformName)}</span>
                              {account.platformName}
                              {isInstagram(account.platformName) && (
                                <span className="text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-1 rounded-full font-medium">
                                  DESTAQUE
                                </span>
                              )}
                            </div>
                            <div className={`text-lg font-medium mt-1 ${
                              isInstagram(account.platformName) ? 'text-pink-200' : 'text-gray-300'
                            }`}>
                              @{account.username}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditSocialMedia(index)}
                              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSocialMedia(index)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Social Media */}
              {isAdding ? (
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-2 border-gray-500 rounded-xl p-5 shadow-lg">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <input
                        type="text"
                        value={newPlatform}
                        onChange={(e) => setNewPlatform(e.target.value)}
                        placeholder="Instagram"
                        className="w-full py-3 px-4 text-base border border-gray-600 rounded-lg focus:border-gray-400 focus:outline-none transition-colors bg-gray-800 text-white placeholder-gray-400"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Nome de utilizador"
                        className="w-full py-3 px-4 text-base border border-gray-600 rounded-lg focus:border-gray-400 focus:outline-none transition-colors bg-gray-800 text-white placeholder-gray-400"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSocialMedia()}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleAddSocialMedia}
                        className="p-3 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-colors"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setIsAdding(false);
                          setNewPlatform('');
                          setNewUsername('');
                        }}
                        className="p-3 text-gray-400 hover:text-gray-300 hover:bg-gray-400/10 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsAdding(true);
                    setNewPlatform('Instagram');
                  }}
                  className="w-full py-6 px-6 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:text-white hover:border-gray-500 hover:bg-gray-800/50 transition-all duration-200 flex items-center justify-center gap-3 font-medium"
                >
                  <Plus className="w-6 h-6" />
                  Adicionar conta de redes sociais
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