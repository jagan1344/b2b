import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Routers
import authRouter from './modules/auth/auth.router';
import teacherRouter from './modules/teacher/teacher.router';
import courseRouter from './modules/course/course.router';
import studentRouter from './modules/student/student.router';
import attendanceRouter from './modules/attendance/attendance.router';
import marksRouter from './modules/marks/marks.router';
import reportsRouter from './modules/reports/reports.router';

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());

// Rate limiting on auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts. Try again in 15 minutes.' },
});
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/teacher', teacherRouter);
app.use('/api/courses', courseRouter);
app.use('/api/courses/:courseId/students', studentRouter);
app.use('/api/courses/:courseId/attendance', attendanceRouter);
app.use('/api/courses/:courseId/marks', marksRouter);
app.use('/api/courses/:courseId/reports', reportsRouter);

// Serve static files in production
if (env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../dist');
  app.use(express.static(distPath));

  // Catch-all route for SPA
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`🚀 SPMS Server running on port ${env.PORT}`);
  console.log(`📡 API: http://localhost:${env.PORT}/api/health`);
  console.log(`🌐 Client: ${env.CLIENT_URL}`);
});

export default app;
