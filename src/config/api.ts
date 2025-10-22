export const BASE_URL = 'https://apivftomc-n8n-test-videos.aacepg.easypanel.host/webhook/';
import { getAllURLParams } from '../utils/urlParams';
import { getAuditId } from '../utils/localStorage';

export const API_ENDPOINTS = {
  ANALYZE_WEBSITE: 'aiGrowth/analyzeWebsite',
  DEEP_QUESTIONS: 'aiGrowth/deepQuestions',
  FINISH_AUDIT: 'aiGrowth/finishAudit',
  START_AUDIT: 'aiGrowth/startAudit',
  BOLT: 'aiGrowth/bolt'
};

export interface CompanyData {
  companyName: string;
  companyDescription: string;
  monthlyRevenue: number;
  employeeCount: number;
  niche: string; // Note: API currently sends "nihce" but we'll handle both
  acquisitionChannels: string[];
  socialMedia: {
    platformName: string;
    username: string;
  }[] | [];
  mainOffers: {
    name: string;
    description: string;
  }[];
}

export const analyzeWebsite = async (websiteUrl: string): Promise<CompanyData> => {
  const urlParams = getAllURLParams();
  
  const response = await fetch(`${BASE_URL}${API_ENDPOINTS.ANALYZE_WEBSITE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      websiteUrl,
      urlParams 
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Handle both array and single object responses
  let companyData;
  if (Array.isArray(data)) {
    companyData = data[0];
  } else {
    companyData = data;
  }
  
  // Handle the typo in the API response (nihce -> niche)
  if (companyData.nihce && !companyData.niche) {
    companyData.niche = companyData.nihce;
    delete companyData.nihce;
  }
  
  return companyData;
};

export const sendDeepQuestions = async (userData: any): Promise<void> => {
  const urlParams = getAllURLParams();
  
  const response = await fetch(`${BASE_URL}${API_ENDPOINTS.DEEP_QUESTIONS}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      ...userData,
      urlParams 
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Return the response data (array of questions)
  return await response.json();
};

export const finishAudit = async (userData: any): Promise<any> => {
  const urlParams = getAllURLParams();
  const auditId = getAuditId();
  
  const response = await fetch(`${BASE_URL}${API_ENDPOINTS.FINISH_AUDIT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      auditId,
      ...userData,
      urlParams 
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Handle both array and single object responses
  if (Array.isArray(data)) {
    return data[0];
  }
  
  return data;
};

export const startAudit = async (): Promise<{ auditId: string }> => {
  const urlParams = getAllURLParams();
  
  const response = await fetch(`${BASE_URL}${API_ENDPOINTS.START_AUDIT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      urlParams 
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Handle both array and single object responses
  if (Array.isArray(data)) {
    return data[0];
  }
  
  return data;
};

export const sendBoltUpdate = async (auditId: string, userData: any): Promise<void> => {
  const urlParams = getAllURLParams();
  
  const response = await fetch(`${BASE_URL}${API_ENDPOINTS.BOLT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      auditId,
      userData,
      urlParams 
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Return the response data if needed
  return await response.json();
};