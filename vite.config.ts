
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url'; // Import for ES module equivalent of __dirname
import process from 'process'; // Import process to provide types for process.cwd()

// ES module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Load .env file variables based on the current mode
  // Pass process.cwd() for envDir.
  // Pass '' as prefixes to load all env variables without VITE_ prefix filtering
  const env = loadEnv(mode, process.cwd(), ''); 

  return {
    plugins: [react()],
    define: {
      // Makes process.env.API_KEY available in your client-side code
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    resolve: {
      alias: {
        // Use __dirname (now correctly defined for ES modules) or absolute paths
        '@/components/icons': path.resolve(__dirname, './components/icons/index.tsx'),
        '@/components': path.resolve(__dirname, './components'), // Added alias
        // Example for other aliases if needed in the future:
        // '@/services': path.resolve(__dirname, './services'),
      }
    },
    server: {
      port: 3000, // You can specify a port
      open: true    // Automatically open in browser
    }
  };
});