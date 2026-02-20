import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Custom plugin to serve jobs/ folder as static assets
function jobsStaticPlugin() {
  return {
    name: 'serve-jobs',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url?.startsWith('/jobs/')) {
          const filePath = path.join(__dirname, decodeURIComponent(req.url));
          if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes: Record<string, string> = {
              '.mp4': 'video/mp4',
              '.webm': 'video/webm',
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.json': 'application/json',
              '.mp3': 'audio/mpeg',
              '.wav': 'audio/wav',
            };
            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
            res.setHeader('Access-Control-Allow-Origin', '*');
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), jobsStaticPlugin()],
  server: {
    fs: {
      allow: ['.', 'jobs'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
