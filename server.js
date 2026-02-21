/**
 * Express server for Remotion Player microservice.
 * Serves the built Vite SPA + job assets from /jobs/{job_id}/
 */
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JOBS_DIR = process.env.JOBS_DIR || path.join(__dirname, 'jobs');

// ── Middleware ────────────────────────────────────────────
app.use(cors());

// ── API Routes ───────────────────────────────────────────

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// List available jobs
app.get('/api/jobs', (_req, res) => {
    try {
        if (!fs.existsSync(JOBS_DIR)) {
            return res.json({ jobs: [] });
        }
        const jobs = fs.readdirSync(JOBS_DIR, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .filter(d => {
                const presPath = path.join(JOBS_DIR, d.name, 'presentation.json');
                return fs.existsSync(presPath);
            })
            .map(d => ({
                id: d.name,
                hasPresentation: true,
            }));
        res.json({ jobs });
    } catch (err) {
        res.status(500).json({ error: 'Failed to list jobs' });
    }
});

// ── Image extension fallback ─────────────────────────────
// presentation.json may reference .jpg but actual file is .png or vice versa
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

app.use('/jobs', (req, res, next) => {
    // Only intercept image requests under /images/
    if (!req.url.includes('/images/')) return next();

    const filePath = path.join(JOBS_DIR, decodeURIComponent(req.url));

    // If exact file exists, let express.static handle it
    if (fs.existsSync(filePath)) return next();

    // Try alternative extensions
    const ext = path.extname(filePath).toLowerCase();
    if (!IMAGE_EXTS.includes(ext)) return next();

    const baseName = filePath.slice(0, -ext.length);
    for (const altExt of IMAGE_EXTS) {
        const altPath = baseName + altExt;
        if (fs.existsSync(altPath)) {
            return res.sendFile(altPath);
        }
    }

    next();
});

// ── Static: Job Assets ───────────────────────────────────
app.use('/jobs', express.static(JOBS_DIR, {
    setHeaders: (res, filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        const mimeOverrides = {
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.webp': 'image/webp',
        };
        if (mimeOverrides[ext]) {
            res.setHeader('Content-Type', mimeOverrides[ext]);
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
    },
}));

// ── Static: SPA ──────────────────────────────────────────
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback — serve index.html for all non-API/non-asset routes
app.use((_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// ── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🎬 Remotion Player running on http://localhost:${PORT}`);
    console.log(`📂 Jobs directory: ${JOBS_DIR}`);
});
