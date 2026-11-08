import { createContext, useContext, useEffect, useState, useCallback } from "react";
import insforge from "../services/insforgeClient";
import { syncGuestCart } from "../services/carritoService";
import {
  registrar,
  verificarEmail as verificarEmailService,
  aplicarPerfilPendiente,
} from "../services/authService";

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

  // Recarga la sesión desde el SDK (útil tras verificar el correo, donde el SDK
  // ya tiene el token pero el contexto todavía no lo sabe) y refresca el perfil.
  const sincronizarSesion = useCallback(async () => {
    try {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (error || !data?.user) return null;
      setUser(data.user);
      await fetchProfile(data.user.id);
      await syncGuestCart(data.user.id);
      return data.user;
    } catch {
      return null;
    }
  }, [fetchProfile]);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const { data, error } = await insforge.auth.getCurrentUser();
        if (cancelled) return;

        if (!error && data?.user) {
          setUser(data.user);
          // Si el registro quedó a medias (verificación en otra pestaña, etc.)
          // el perfil del formulario se guarda ahora, antes de leerlo.
          await aplicarPerfilPendiente(data.user.email);
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
    // Aplica el perfil guardado en el registro si aún estaba pendiente.
    await aplicarPerfilPendiente(email);
    setUser(data.user);
    await fetchProfile(data.user.id);
    await syncGuestCart(data.user.id);
    return { ok: true, user: data.user };
  };

  const register = async ({ email, password, name, telefono = "", direccion = "" }) => {
    const resultado = await registrar({
      nombre: name ?? "",
      correo: email,
      password,
      telefono,
      direccion,
    });
    if (!resultado.ok) return resultado;

    if (resultado.requireEmailVerification) {
      // El perfil queda guardado hasta que verifique el correo.
      return { ok: true, requireEmailVerification: true, email };
    }

    const usuario = await sincronizarSesion();
    return { ok: true, user: usuario ?? resultado.usuario ?? null };
  };

  const verifyEmail = async (email, otp) => {
    const resultado = await verificarEmailService(email, otp);
    if (!resultado.ok) return resultado;

    // La sesión ya existe en el SDK: se refleja en el contexto (y si el perfil
    // no se pudo guardar, queda pendiente para el próximo inicio de sesión).
    const usuario = await sincronizarSesion();
    return { ok: true, user: usuario ?? resultado.usuario ?? null };
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
    if (!user) return { ok: false, error: "No hay sesión activa" };

    const payload = { ...changes };
    // `name` (InsForge) y `nombre` (UI legacy) deben quedar sincronizados.
    if (payload.name && !payload.nombre) payload.nombre = payload.name;
    if (payload.nombre && !payload.name) payload.name = payload.nombre;

    const { error } = await insforge.auth.setProfile(payload);
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
    if (userId) {
      await fetchProfile(userId);
      return;
    }
    // Sin usuario en el contexto (p. ej. recién verificó el correo): la sesión
    // ya existe en el SDK, así que se hidrata aquí. Antes esto era un no-op y
    // la app seguía mostrando al usuario como deslogueado.
    await sincronizarSesion();
  }, [userId, fetchProfile, sincronizarSesion]);

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
