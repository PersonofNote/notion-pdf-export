import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieSession from 'cookie-session';
import notionRouter from './routes/notion';
import pdfRouter from './routes/pdf';
import authRouter from './routes/auth';

// Load environment variables
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback_secret_for_development';

// Trust first proxy (ngrok)
app.set('trust proxy', 1);

// Middleware
// Allow requests from frontend (important for OAuth with ngrok)
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Cookie-based session (stores data in cookie, more reliable for OAuth)
app.use(cookieSession({
  name: 'notion_pdf_session',
  keys: [SESSION_SECRET], // Encryption keys
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  secure: true, // HTTPS only (ngrok provides HTTPS)
  httpOnly: true,
  sameSite: 'none', // Required for cross-site cookies
  signed: true,
}));

app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/notion', notionRouter);
app.use('/api/pdf', pdfRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} does not exist`,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Notion PDF Exporter Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Environment: ${process.env.NODE_ENV || 'development'}
Server:      http://localhost:${PORT}
Client:      ${CLIENT_URL}
Health:      http://localhost:${PORT}/health

API Endpoints:
  GET  /api/auth/notion             - Initiate OAuth
  GET  /api/auth/notion/callback    - OAuth callback
  GET  /api/auth/status             - Check auth status
  POST /api/auth/logout             - Logout
  POST /api/notion/fetch            - Fetch Notion page
  POST /api/pdf/generate            - Generate PDF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;
