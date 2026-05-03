import express from 'express';
import cors from 'cors';
import dossierRouter from './routes/dossierRoutes.js';
import schedulingRouter from './routes/schedulingRoutes.js';
import soutenanceRouter from './routes/soutenanceRoutes.js';
import authRouter from './routes/authRoutes.js';
import themeRouter from './routes/themeRoutes.js';
import supervisionRouter from './routes/supervisionRoutes.js';
import chatRouter from './routes/chatRoutes.js';
import notificationRouter from './routes/notificationRoutes.js';

const app = express();

// ── Global Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────────────────────
//
//  Feature               | Mount path               | Controller
//  ----------------------|--------------------------|---------------------------
//  Auth                  | /api/auth                | authController
//  Dossiers              | /api/dossiers            | dossierController
//  Scheduling            | /api/scheduling          | schedulingController
//  Soutenances           | /api/soutenances         | soutenanceController
//  Themes                | /api/themes              | themeController
//  Supervision Requests  | /api/supervision         | supervisionController
//
app.use('/api/auth', authRouter);

try {
  app.use('/api/dossiers', dossierRouter);
  console.log('[app] dossierRouter registered ✓');
} catch (e) {
  console.error('[app] FAILED to register dossierRouter:', e);
}

app.use('/api/scheduling', schedulingRouter);
app.use('/api/soutenances', soutenanceRouter);
app.use('/api/themes', themeRouter);
app.use('/api/supervision', supervisionRouter);
app.use('/api/chat', chatRouter);
app.use('/api/notifications', notificationRouter);

// ── 404 Fallback ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found', message: 'The requested endpoint does not exist.' });
});

export default app;
