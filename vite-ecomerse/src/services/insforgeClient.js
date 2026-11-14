import { createClient } from "@insforge/sdk";
const BACKEND_URL = import.meta.env.VITE_INSFORGE_URL;

const API_BASE_URL =
  typeof window !== "undefined" && window.location.origin
    ? window.location.origin
    : BACKEND_URL;

const insforge = createClient({
  baseUrl: API_BASE_URL,
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY,
});

if (BACKEND_URL && insforge.realtime) {
  insforge.realtime.baseUrl = BACKEND_URL;
}

export default insforge;
