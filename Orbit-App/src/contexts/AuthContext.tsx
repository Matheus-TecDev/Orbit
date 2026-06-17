import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ApiRequestError,
  setUnauthorizedHandler,
} from "../services/apiClient";
import {
  getCurrentUser,
  login,
  register,
  type CurrentUser,
  type RegisterPayload,
} from "../services/authService";
import {
  createProfile,
  getProfile,
  updateProfile,
  type ProfilePayload,
  type ProfileRead,
} from "../services/profileService";
import {
  createPreference,
  getPreference,
  updatePreference,
  type PreferencePayload,
  type PreferenceRead,
} from "../services/preferenceService";
import {
  getToken,
  removeToken,
  saveToken,
} from "../services/authStorage";
import {
  saveCompatibilityAnswers,
  saveCompatibilityDealbreakers,
  saveCompatibilityPriorities,
} from "../services/compatibilityService";
import type { CompatibilityPayload } from "../types/compatibility";

export type AuthStatus = "signedOut" | "onboarding" | "signedIn";

type AuthContextValue = {
  token: string | null;
  user: CurrentUser | null;
  profile: ProfileRead | null;
  preferences: PreferenceRead | null;
  loading: boolean;
  isBootstrapping: boolean;
  error: string | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => void;
  loadCurrentUser: () => Promise<void>;
  clearError: () => void;
  completeOnboarding: (
    profilePayload: ProfilePayload,
    preferencePayload: PreferencePayload,
    compatibilityPayload?: CompatibilityPayload,
  ) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [profile, setProfile] = useState<ProfileRead | null>(null);
  const [preferences, setPreferences] = useState<PreferenceRead | null>(null);
  const [loading, setLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("signedOut");

  useEffect(() => {
    setUnauthorizedHandler(handleExpiredSession);

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function restoreSession() {
      setIsBootstrapping(true);
      setError(null);

      try {
        const storedToken = await getToken();

        if (!isActive) {
          return;
        }

        if (!storedToken) {
          clearSessionState();
          return;
        }

        setToken(storedToken);
        const resources = await loadSessionResources(storedToken);

        if (!isActive) {
          return;
        }

        setStatus(hasCompletedOnboarding(resources) ? "signedIn" : "onboarding");
      } catch (caughtError) {
        if (!isActive) {
          return;
        }

        if (isInvalidSession(caughtError)) {
          await handleExpiredSession();
          return;
        }

        clearSessionState();
        setError("Não foi possível restaurar sua sessão. Entre novamente.");
      } finally {
        if (isActive) {
          setIsBootstrapping(false);
        }
      }
    }

    restoreSession();

    return () => {
      isActive = false;
    };
  }, []);

  async function signIn(email: string, password: string) {
    setLoading(true);
    setError(null);

    try {
      const loginResponse = await login({ email, password });
      await saveToken(loginResponse.access_token);
      setToken(loginResponse.access_token);
      const resources = await loadSessionResources(loginResponse.access_token);
      setStatus(hasCompletedOnboarding(resources) ? "signedIn" : "onboarding");
    } catch (caughtError) {
      handleError(caughtError);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(payload: RegisterPayload) {
    setLoading(true);
    setError(null);

    try {
      await register(payload);
      const loginResponse = await login({
        email: payload.email,
        password: payload.password,
      });
      await saveToken(loginResponse.access_token);
      setToken(loginResponse.access_token);
      const resources = await loadSessionResources(loginResponse.access_token);
      setStatus(hasCompletedOnboarding(resources) ? "signedIn" : "onboarding");
    } catch (caughtError) {
      handleError(caughtError);
    } finally {
      setLoading(false);
    }
  }

  async function loadCurrentUser() {
    if (!token) {
      setError("Entre novamente para carregar seus dados.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resources = await loadSessionResources(token);
      setStatus(hasCompletedOnboarding(resources) ? "signedIn" : "onboarding");
    } catch (caughtError) {
      if (isInvalidSession(caughtError)) {
        await handleExpiredSession();
        return;
      }

      handleError(caughtError);
    } finally {
      setLoading(false);
    }
  }

  async function loadSessionResources(nextToken: string) {
    const currentUser = await getCurrentUser(nextToken);
    const [nextProfile, nextPreferences] = await Promise.all([
      loadProfileSafely(nextToken),
      loadPreferenceSafely(nextToken),
    ]);

    setUser(currentUser);
    setProfile(nextProfile);
    setPreferences(nextPreferences);

    return {
      user: currentUser,
      profile: nextProfile,
      preferences: nextPreferences,
    };
  }

  async function signOut() {
    await removeTokenSafely();
    clearSessionState();
  }

  async function handleExpiredSession() {
    await removeTokenSafely();
    clearSessionState("Sua sessão expirou. Faça login novamente.");
  }

  function clearSessionState(nextError: string | null = null) {
    setToken(null);
    setUser(null);
    setProfile(null);
    setPreferences(null);
    setError(nextError);
    setLoading(false);
    setStatus("signedOut");
  }

  async function completeOnboarding(
    profilePayload: ProfilePayload,
    preferencePayload: PreferencePayload,
    compatibilityPayload?: CompatibilityPayload,
  ) {
    if (!token) {
      setError("Entre novamente para concluir seu perfil.");
      setStatus("signedOut");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [nextProfile, nextPreferences] = await Promise.all([
        saveProfile(profilePayload, token, profile),
        savePreference(preferencePayload, token, preferences),
      ]);

      if (compatibilityPayload) {
        await saveCompatibilityPayload(token, compatibilityPayload);
      }

      setProfile(nextProfile);
      setPreferences(nextPreferences);
      await loadSessionResources(token);
      setStatus("signedIn");
    } catch (caughtError) {
      if (isInvalidSession(caughtError)) {
        await handleExpiredSession();
        return;
      }

      handleError(caughtError);
    } finally {
      setLoading(false);
    }
  }

  function clearError() {
    setError(null);
  }

  function handleError(caughtError: unknown) {
    if (caughtError instanceof ApiRequestError) {
      setError(toFriendlyMessage(caughtError));
      return;
    }

    setError("Não foi possível conectar ao Orbit API. Tente novamente.");
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      profile,
      preferences,
      loading,
      isBootstrapping,
      error,
      status,
      signIn,
      signUp,
      signOut,
      loadCurrentUser,
      clearError,
      completeOnboarding,
    }),
    [token, user, profile, preferences, loading, isBootstrapping, error, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

async function saveCompatibilityPayload(
  token: string,
  payload: CompatibilityPayload,
) {
  await saveCompatibilityAnswers(token, payload.answers);
  await Promise.all([
    saveCompatibilityPriorities(token, payload.priorities),
    saveCompatibilityDealbreakers(token, payload.dealbreakers),
  ]);
}

type SessionResources = {
  user: CurrentUser;
  profile: ProfileRead | null;
  preferences: PreferenceRead | null;
};

function hasCompletedOnboarding(resources: SessionResources) {
  return Boolean(resources.profile && resources.preferences);
}

async function loadProfileSafely(token: string) {
  try {
    return await getProfile(token);
  } catch (caughtError) {
    if (isMissingResource(caughtError)) {
      return null;
    }

    throw caughtError;
  }
}

async function loadPreferenceSafely(token: string) {
  try {
    return await getPreference(token);
  } catch (caughtError) {
    if (isMissingResource(caughtError)) {
      return null;
    }

    throw caughtError;
  }
}

async function saveProfile(
  payload: ProfilePayload,
  token: string,
  currentProfile: ProfileRead | null,
) {
  if (currentProfile) {
    return updateProfile(payload, token);
  }

  try {
    return await createProfile(payload, token);
  } catch (caughtError) {
    if (shouldPatchExistingResource(caughtError)) {
      return updateProfile(payload, token);
    }

    throw caughtError;
  }
}

async function savePreference(
  payload: PreferencePayload,
  token: string,
  currentPreference: PreferenceRead | null,
) {
  if (currentPreference) {
    return updatePreference(payload, token);
  }

  try {
    return await createPreference(payload, token);
  } catch (caughtError) {
    if (shouldPatchExistingResource(caughtError)) {
      return updatePreference(payload, token);
    }

    throw caughtError;
  }
}

function isMissingResource(caughtError: unknown) {
  return caughtError instanceof ApiRequestError && caughtError.status === 404;
}

function shouldPatchExistingResource(caughtError: unknown) {
  return (
    caughtError instanceof ApiRequestError &&
    (caughtError.status === 400 || caughtError.status === 409)
  );
}

function isInvalidSession(caughtError: unknown) {
  return (
    caughtError instanceof ApiRequestError &&
    (caughtError.status === 401 || caughtError.status === 403)
  );
}

async function removeTokenSafely() {
  try {
    await removeToken();
  } catch {
    return;
  }
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}

function toFriendlyMessage(error: ApiRequestError) {
  if (error.status === 401) {
    return "E-mail ou senha inválidos.";
  }

  if (error.status === 409) {
    return "Já existe uma conta com este e-mail.";
  }

  if (error.status === 422) {
    return "Confira os dados informados e tente novamente.";
  }

  return error.message;
}
