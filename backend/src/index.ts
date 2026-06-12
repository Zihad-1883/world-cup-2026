import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { runMigrations } from './config/migrate';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import teamsRouter from './routes/teams';
import playersRouter from './routes/players';
import matchesRouter from './routes/matches';
import predictionsRouter from './routes/predictions';
import commentsRouter from './routes/comments';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// ─── Dynamic Allowed Origins Array ───────────────────────────────────────────
const allowedOrigins = [
  'https://world-cup-2026-nine-eta.vercel.app',  // Without trailing slash
  'https://world-cup-2026-nine-eta.vercel.app/', // With trailing slash
  process.env.CLIENT_URL,                         // Fallback for whatever is in env
].filter(Boolean) as string[]; // Removes undefined items if CLIENT_URL is empty

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman or server-to-server calls)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Add this right here to cover the baseline root directory!
app.get('/', (_req, res) => {
  res.json({ success: true, message: "World Cup 2026 Production API Gate active." });
});
// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/players', playersRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/predictions', predictionsRouter);
app.use('/api/comments', commentsRouter);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

// ─── Boot ─────────────────────────────────────────────────────────────────────
async function boot(): Promise<void> {
  try {
    await runMigrations();
    // Bind to '0.0.0.0' explicitly so Render passes incoming web traffic straight through
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

boot();

export default app;