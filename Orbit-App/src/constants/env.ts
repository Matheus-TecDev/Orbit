declare const process: {
  env: {
    EXPO_PUBLIC_API_URL?: string;
  };
};

const FALLBACK_API_URL = "http://10.85.50.86:8000";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? FALLBACK_API_URL;
