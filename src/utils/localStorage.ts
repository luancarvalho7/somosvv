import { CompanyData } from '../config/api';

const COMPANY_DATA_KEY = 'aiGrowthAuditCompanyData';
const USER_DATA_KEY = 'aiGrowthAuditUserData';

export interface UserDataEntry {
  answer: any;
  timestamp: string;
  hasWebsite?: boolean;
  data?: CompanyData;
}

export interface UserData {
  [key: string]: UserDataEntry;
}
export const saveCompanyData = (data: CompanyData): void => {
  try {
    localStorage.setItem(COMPANY_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
  }
};

export const getCompanyData = (): CompanyData | null => {
  try {
    const data = localStorage.getItem(COMPANY_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to retrieve data from localStorage:', error);
    return null;
  }
};

export const clearCompanyData = (): void => {
  try {
    localStorage.removeItem(COMPANY_DATA_KEY);
  } catch (error) {
    console.error('Failed to clear data from localStorage:', error);
  }
};

export const saveUserData = (key: string, data: UserDataEntry): void => {
  try {
    const existingData = getUserAllData();
    existingData[key] = data;
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(existingData));
  } catch (error) {
    console.error('Failed to save user data to localStorage:', error);
  }
};

export const getUserData = (key: string): UserDataEntry | null => {
  try {
    const allData = getUserAllData();
    return allData[key] || null;
  } catch (error) {
    console.error('Failed to retrieve user data from localStorage:', error);
    return null;
  }
};

export const getUserAllData = (): UserData => {
  try {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to retrieve all user data from localStorage:', error);
    return {};
  }
};

export const clearUserData = (): void => {
  try {
    localStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.error('Failed to clear user data from localStorage:', error);
  }
};

export const saveAuditId = (auditId: string): void => {
  try {
    localStorage.setItem('auditId', auditId);
  } catch (error) {
    console.error('Failed to save audit ID to localStorage:', error);
  }
};

export const getAuditId = (): string | null => {
  try {
    return localStorage.getItem('auditId');
  } catch (error) {
    console.error('Failed to retrieve audit ID from localStorage:', error);
    return null;
  }
};

export const clearAllData = (): void => {
  try {
    // Clear all audit-related data but preserve URL parameters
    localStorage.removeItem(COMPANY_DATA_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem('auditId');
    localStorage.removeItem('auditResult');
    localStorage.removeItem('businessDetails');
    localStorage.removeItem('reportsData');
    // Note: We keep 'urlParams' to maintain tracking
  } catch (error) {
    console.error('Failed to clear all data from localStorage:', error);
  }
};