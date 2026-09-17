// API Configuration
// IMPORTANT: For Vercel deployment, set REACT_APP_API_URL in your Vercel dashboard
// Example: REACT_APP_API_URL=https://your-backend.vercel.app
const DEFAULT_PROD_API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_DEFAULT_PROD_API_URL || 'https://sverxiioo.nanoprofiles.com/api';

const normalizeApiBaseUrl = (url) => {
  if (!url) return url;
  let normalized = url.trim();
  // Remove trailing slash
  normalized = normalized.replace(/\/+$/, '');
  // Add /api suffix if not present
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
};

const resolveApiBaseUrl = () => {
  // Priority 1: Environment variable (for Vercel deployment)
  const envBaseUrl = normalizeApiBaseUrl(process.env.REACT_APP_API_URL);
  if (envBaseUrl) {
    return envBaseUrl;
  }

  // Priority 2: Local development
  if (process.env.NODE_ENV === 'development') {
    return normalizeApiBaseUrl(process.env.REACT_APP_DEV_API_URL || 'https://sverxiioo.nanoprofiles.com');
  }

  // Priority 3: Default production URL (fallback)
  if (DEFAULT_PROD_API_URL) {
    return normalizeApiBaseUrl(DEFAULT_PROD_API_URL);
  }

  // If nothing is configured, log a warning and return empty string
  console.warn('REACT_APP_API_URL is not set. Please configure it in your Vercel dashboard.');
  return '';
};

export const API_URL = resolveApiBaseUrl();
export default API_URL;
