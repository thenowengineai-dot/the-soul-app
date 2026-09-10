/**
 * Application Configuration
 * Connects to Google Cloud Run backend in Singapore (asia-southeast1)
 * or uses VITE_API_BASE_URL if configured in environment.
 */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  'https://the-soul-backend-330377476882.asia-southeast1.run.app';

export const GENESIS_API_BASE_URL: string =
  (import.meta.env.VITE_GENESIS_API_BASE_URL as string) ||
  'https://the-soul-genesis-330377476882.asia-southeast1.run.app';

export const GOOGLE_CLIENT_ID: string =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
  '330377476882-3aa1uknr6f6psvlrrgaq82bccucpjdru.apps.googleusercontent.com';

