import { createContext, useContext, useEffect, useState, useCallback } from "react";
import insforge from "../services/insforgeClient";
import { syncGuestCart } from "../services/carritoService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await insforge.auth.getProfile(userId);
      if (!error && data) {
        const profileData = data.profile ?? data;
        setProfile(profileData);
        return profileData;
      }
    } catch {
      // profile may not exist yet for new users
    }
    setProfile(null);
    return null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const { data, error } = await insforge.auth.getCurrentUser();
        if (cancelled) return;

        if (!error && data?.user) {
          setUser(data.user);
          await fetchProfile(data.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [fetchProfile]);

  const login = async (email, password) => {
    const { data, error } = await insforge.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { ok: false, error: error.message };
    setUser(data.user);
    await fetchProfile(data.user.id);
    await syncGuestCart(data.user.id);
    return { ok: true, user: data.user };
  };

  const register = async ({ email, password, name }) => {
    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      name,
      redirectTo: window.location.origin + "/login",
    });
    if (error) return { ok: false, error: error.message };
    if (data?.requireEmailVerification) {
      return { ok: true, requireEmailVerification: true, email };
    }
    if (data?.accessToken) {
      setUser(data.user);
      await fetchProfile(data.user.id);
      await syncGuestCart(data.user.id);
    }
    return { ok: true, user: data.user };
  };

  const verifyEmail = async (email, otp) => {
    const { data, error } = await insforge.auth.verifyEmail({ email, otp });
    if (error) return { ok: false, error: error.message };
    if (data?.user) {
      setUser(data.user);
      await fetchProfile(data.user.id);
      await syncGuestCart(data.user.id);
    }
    return { ok: true, user: data.user };
  };

  const logout = async () => {
    await insforge.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const signInWithGoogle = async () => {
    const { error } = await insforge.auth.signInWithOAuth("google", {
      redirectTo: window.location.origin + "/",
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  };

  const sendPasswordReset = async (email) => {
    const { error } = await insforge.auth.sendResetPasswordEmail({
      email,
      redirectTo: window.location.origin + "/reset-password",
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  };

  const resetPassword = async (email, code, newPassword) => {
    const { data, error: exchangeError } =
      await insforge.auth.exchangeResetPasswordToken({
        email,
        code,
      });
    if (exchangeError) return { ok: false, error: exchangeError.message };

    const { error: resetError } = await insforge.auth.resetPassword({
      newPassword,
      otp: data.token,
    });
    if (resetError) return { ok: false, error: resetError.message };
    return { ok: true };
  };

  const updateProfile = async (changes) => {
    const { error } = await insforge.auth.setProfile(changes);
    if (error) return { ok: false, error: error.message };
    const updated = await fetchProfile(user.id);
    return { ok: true, profile: updated };
  };

  const changePassword = async (currentPassword, newPassword) => {
    const { error } = await insforge.auth.updatePassword({
      currentPassword,
      newPassword,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  };

  const userId = user?.id;
  const refreshProfile = useCallback(async () => {
    if (userId) await fetchProfile(userId);
  }, [userId, fetchProfile]);

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin: profile?.rol === "admin",
    login,
    register,
    verifyEmail,
    logout,
    signInWithGoogle,
    sendPasswordReset,
    resetPassword,
    updateProfile,
    changePassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
