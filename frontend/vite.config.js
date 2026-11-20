import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const DEFAULT_DEV_PORT = 5900;

function parsePort(rawPort) {
  const parsed = Number(rawPort);
  if (Number.isInteger(parsed) && parsed >= 1024 && parsed <= 65535) {
    return parsed;
  }
  return DEFAULT_DEV_PORT;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = parsePort(env.VITE_PORT);
  const host = env.VITE_HOST?.trim() || true;
  const strictPort = env.VITE_DEV_STRICT_PORT === "true";

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host,
      port,
      strictPort,
    },
  };
});