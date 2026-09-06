// Unified API Configuration with automatic cloud backend fallback for Vercel deployments
export const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://grievance-ai-1.onrender.com';
  }
  return '';
};

export const API_URL = getApiUrl();
