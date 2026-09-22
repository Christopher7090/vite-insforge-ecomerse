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

// Register a new user
export const registrar = async ({ nombre, correo, password, telefono, direccion }) => {
  const { data, error } = await insforge.auth.signUp({
    email: correo,
    password,
    name: nombre,
    redirectTo: window.location.origin + "/login",
  });
  if (error) return { ok: false, error: error.message };

  if (data?.requireEmailVerification) {
    // Preserve profile data until verification completes
    sessionStorage.setItem(
      "pending_profile",
      JSON.stringify({ nombre, telefono, direccion, rol: "cliente" })
    );
    return { ok: true, requireEmailVerification: true, email: correo };
  }

  // Save extra profile data if user was created immediately
  if (data?.accessToken && data?.user) {
    await insforge.auth.setProfile({
      nombre,
      telefono,
      direccion,
      rol: "cliente",
    });
  }

  return { ok: true, usuario: data?.user };
};

// Verify email with OTP code
export const verificarEmail = async (email, otp) => {
  const { data, error } = await insforge.auth.verifyEmail({ email, otp });
  if (error) return { ok: false, error: error.message };

  // Restore and save profile data that was collected at registration
  if (data?.user) {
    const pending = sessionStorage.getItem("pending_profile");
    const profileData = pending ? JSON.parse(pending) : { rol: "cliente" };
    await insforge.auth.setProfile(profileData);
    sessionStorage.removeItem("pending_profile");
  }

  return { ok: true, usuario: data?.user };
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
  const { error } = await insforge.auth.setProfile(cambios);
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
