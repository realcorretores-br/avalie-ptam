import { defineConfig } from "vite";
<<<<<<< HEAD
import react from "@vitejs/plugin-react";
=======
import react from "@vitejs/plugin-react-swc";
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
<<<<<<< HEAD
  plugins: [react()].filter(Boolean),
=======
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
