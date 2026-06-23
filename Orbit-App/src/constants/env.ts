declare const process: {
  env: {
    EXPO_PUBLIC_API_URL?: string;
  };
};

const FALLBACK_API_URL = "http://192.168.100.18:8000";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? FALLBACK_API_URL;