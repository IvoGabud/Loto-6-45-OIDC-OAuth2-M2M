import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sessionMiddleware } from './middleware/session.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import ticketRoutes from './routes/tickets.js';
import roundRoutes from './routes/rounds.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(sessionMiddleware);

// Routes
app.use('/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/rounds', roundRoutes);

// Admin routes (protected with M2M authentication)
app.use('/new-round', adminRoutes);
app.use('/close', adminRoutes);
app.use('/store-results', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
