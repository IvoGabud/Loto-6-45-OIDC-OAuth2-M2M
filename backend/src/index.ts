import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { sessionMiddleware } from './middleware/session.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import ticketRoutes from './routes/tickets.js';
import roundRoutes from './routes/rounds.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);

app.use(express.json());
app.use(sessionMiddleware);

app.use('/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/rounds', roundRoutes);
app.use('/', adminRoutes); // Admin routes na root path

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const frontendPath = path.join(__dirname, '..', 'public');
app.use(express.static(frontendPath));

app.use((req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Serving frontend from: ${frontendPath}`);
});
