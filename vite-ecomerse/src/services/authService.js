import insforge from "./insforgeClient";

// Login with email and password
export const login = async (correo, password) => {
  const { data, error } = await insforge.auth.signInWithPassword({
    email: correo,
    password,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, usuario: data.user };
};

// ---------------------------------------------------------------------------
// Perfil pendiente de registro
//
// Con "verificación de correo obligatoria" habilitada, signUp() NO devuelve
// accessToken ( accessToken: null ), así que setProfile() (PATCH
// /api/auth/profiles/current) responde 401: el perfil del formulario no se puede
// guardar en ese momento. En su lugar guardamos los datos y los aplicamos en
// cuanto el usuario verifica su correo (o, como red de seguridad, en el próximo
// inicio de sesión / carga de la app).
// ---------------------------------------------------------------------------
const PENDING_PROFILE_KEY = "pending_profile";

const guardarPerfilPendiente = (email, perfil) => {
  try {
    // localStorage sobrevive a cerrar la pestaña; sessionStorage no.
    localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify({ email, perfil }));
  } catch {
    // sin storage disponible: se reintenta en el próximo flujo de registro
  }
};

const leerPerfilPendiente = (email) => {
  let raw = null;
  try {
    raw = localStorage.getItem(PENDING_PROFILE_KEY) || sessionStorage.getItem(PENDING_PROFILE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    // Formato actual: { email, perfil }
    if (data.perfil) {
      if (data.email && email && data.email !== email) return null; // pertenece a otra cuenta
      return data.perfil;
    }
    // Formato anterior: el perfil plano directamente
    return data;
  } catch {
    return null;
  }
};

const limpiarPerfilPendiente = () => {
  try {
    localStorage.removeItem(PENDING_PROFILE_KEY);
    sessionStorage.removeItem(PENDING_PROFILE_KEY);
  } catch {
    // ignorar
  }
};

// Campos que completa el formulario de registro. `name` es el campo nativo de
// InsForge (lo leen Perfil / Editar perfil / Usuarios) y `nombre` lo leen el
// Navbar y el panel admin: se guardan ambos para que la UI siempre muestre el
// dato sin importar dónde se haya escrito antes.
const armarPerfil = ({ nombre, telefono, direccion }) => ({
  name: nombre,
  nombre,
  telefono: telefono || "",
  direccion: direccion || "",
  rol: "cliente",
});

// Aplica (si existe) el perfil guardado durante el registro. Devuelve
// { ok, aplicado, error } y solo limpia el pendiente cuando se guardó bien.
export const aplicarPerfilPendiente = async (email) => {
  const perfil = leerPerfilPendiente(email);
  if (!perfil) return { ok: true, aplicado: false };

  const { error } = await insforge.auth.setProfile(perfil);
  if (error) return { ok: false, aplicado: false, error: error.message };

  limpiarPerfilPendiente();
  return { ok: true, aplicado: true };
};

// Register a new user
export const registrar = async ({ nombre, correo, password, telefono, direccion }) => {
  const perfil = armarPerfil({ nombre, telefono, direccion });

  const { data, error } = await insforge.auth.signUp({
    email: correo,
    password,
    name: nombre,
    redirectTo: window.location.origin + "/login",
  });
  if (error) return { ok: false, error: error.message };

  // Sin sesión no se puede escribir el perfil: se encola hasta verificar.
  if (data?.requireEmailVerification || !data?.accessToken) {
    guardarPerfilPendiente(correo, perfil);
    return {
      ok: true,
      requireEmailVerification: !!data?.requireEmailVerification,
      email: correo,
    };
  }

  // Verificación deshabilitada: hay sesión, se guarda el perfil ahora.
  const { error: profileError } = await insforge.auth.setProfile(perfil);
  if (profileError) {
    // Si falla (p. ej. red), no se pierde el dato: se aplica en el próximo login.
    guardarPerfilPendiente(correo, perfil);
    return { ok: true, usuario: data?.user ?? null, perfilPendiente: true };
  }

  return { ok: true, usuario: data?.user ?? null };
};

// Verify email with OTP code
export const verificarEmail = async (email, otp) => {
  const { data, error } = await insforge.auth.verifyEmail({ email, otp });
  if (error) return { ok: false, error: error.message };

  // El correo verificado implica sesión (accessToken): aquí sí se puede guardar
  // el formulario de perfil que se completó en el registro.
  const perfil = await aplicarPerfilPendiente(email);

  return {
    ok: true,
    usuario: data?.user ?? null,
    perfilGuardado: perfil.aplicado,
    avisoPerfil: perfil.ok ? "" : `No se pudo guardar el perfil: ${perfil.error}`,
  };
};

// Resend verification code
export const reenviarVerificacion = async (email) => {
  const { error } = await insforge.auth.resendVerificationEmail({
    email,
    redirectTo: window.location.origin + "/login",
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
};

// Sign out
export const cerrarSesion = async () => {
  await insforge.auth.signOut();
};

// Send password reset email
export const enviarRecuperacion = async (correo) => {
  const { error } = await insforge.auth.sendResetPasswordEmail({
    email: correo,
    redirectTo: window.location.origin + "/reset-password",
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
};

// Reset password with code
export const restablecerPassword = async (email, code, newPassword) => {
  const { data, error: exchangeError } =
    await insforge.auth.exchangeResetPasswordToken({ email, code });
  if (exchangeError) return { ok: false, error: exchangeError.message };

  const { error: resetError } = await insforge.auth.resetPassword({
    newPassword,
    otp: data.token,
  });
  if (resetError) return { ok: false, error: resetError.message };
  return { ok: true };
};

// Google OAuth sign-in
export const iniciarSesionGoogle = async () => {
  const { error } = await insforge.auth.signInWithOAuth("google", {
    redirectTo: window.location.origin + "/",
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
};

// Update user profile
export const actualizarPerfil = async (cambios) => {
  const payload = { ...cambios };
  if (payload.name && !payload.nombre) payload.nombre = payload.name;
  if (payload.nombre && !payload.name) payload.name = payload.nombre;

  const { error } = await insforge.auth.setProfile(payload);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
};

// Change password (requires current password re-auth)
export const cambiarPassword = async (currentPassword, newPassword) => {
  const { error } = await insforge.auth.updatePassword({
    currentPassword,
    newPassword,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
};

// Get current user (from SDK session)
export const usuarioActual = async () => {
  const { data, error } = await insforge.auth.getCurrentUser();
  if (error || !data?.user) return null;
  return data.user;
};

// Check if user is logged in
export const estaLogueado = async () => {
  const user = await usuarioActual();
  return user !== null;
};
