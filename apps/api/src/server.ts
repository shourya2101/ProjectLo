import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import conversationRoutes from './routes/conversations.js';
import messageRoutes from './routes/messages.js';
import productRoutes from './routes/products.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
export const prisma = new PrismaClient();

// --- CORS (credentialed) ---
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
  origin: frontendUrl,
  credentials: true, // Still needed if other cookies are used, though API uses Bearer auth
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/products', productRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
