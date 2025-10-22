// Utility functions for handling URL parameters

export interface URLParams {
  [key: string]: string;
}

export const getURLParams = (): URLParams => {
  const params: URLParams = {};
  const urlParams = new URLSearchParams(window.location.search);
  
  for (const [key, value] of urlParams.entries()) {
    params[key] = value;
  }
  
  return params;
};

export const getURLParamsString = (): string => {
  const params = getURLParams();
  const paramEntries = Object.entries(params);
  
  if (paramEntries.length === 0) {
    return '';
  }
  
  return '?' + new URLSearchParams(params).toString();
};

export const appendURLParams = (baseUrl: string, additionalParams?: URLParams): string => {
  const currentParams = getURLParams();
  const allParams = { ...currentParams, ...additionalParams };
  
  const paramEntries = Object.entries(allParams);
  if (paramEntries.length === 0) {
    return baseUrl;
  }
  
  const separator = baseUrl.includes('?') ? '&' : '?';
  return baseUrl + separator + new URLSearchParams(allParams).toString();
};

export const saveURLParamsToStorage = (): void => {
  const params = getURLParams();
  if (Object.keys(params).length > 0) {
    localStorage.setItem('urlParams', JSON.stringify(params));
  }
};

export const getURLParamsFromStorage = (): URLParams => {
  try {
    const stored = localStorage.getItem('urlParams');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to parse URL params from storage:', error);
    return {};
  }
};

export const getAllURLParams = (): URLParams => {
  const currentParams = getURLParams();
  const storedParams = getURLParamsFromStorage();
  
  // Current params take precedence over stored ones
  return { ...storedParams, ...currentParams };
};