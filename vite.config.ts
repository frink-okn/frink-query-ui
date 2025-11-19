import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tanstackRouter from "@tanstack/router-plugin/vite";

const ReactCompilerConfig = {
  target: "19",
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), "") };

  return {
    resolve: {
      alias: {
        "@mui/material": "@mui/joy",
      },
    },
    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: false,
      }),
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
        },
      }),
    ],
    base: process.env.VITE_BASE_URL,
    build: {
      sourcemap: true,
    },
  };
});
