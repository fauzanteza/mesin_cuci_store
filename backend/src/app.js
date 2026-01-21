import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import routes from './routes/index.js'; // Central router
import errorHandler from './middleware/errorHandler.js';
import notFound from './middleware/notFound.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Added 5173 for Vite
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Terlalu banyak request dari IP ini, coba lagi nanti.'
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Static files
// Assuming uploads folder is at backend/uploads, so we go up one level from src/app.js
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/', routes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
