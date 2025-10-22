// Utility functions for formatting numbers and parsing input

export const formatRevenue = (amount: number): string => {
  if (amount === 0) return '0';
  if (amount < 1000) return amount.toString();
  if (amount < 1000000) return `${Math.floor(amount / 1000)}K`;
  if (amount < 1000000000) return `${Math.floor(amount / 1000000)}M`;
  return `${Math.floor(amount / 1000000000)}B`;
};

export const parseRevenueInput = (input: string): number => {
  const cleanInput = input.replace(/[^0-9.]/g, '');
  const number = parseFloat(cleanInput);
  return isNaN(number) ? 0 : Math.floor(number);
};