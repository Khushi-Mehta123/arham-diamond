import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import sectionRoutes from './routes/sections';
import fieldRoutes from './routes/fields';
import diamondRoutes from './routes/diamonds';
import uploadRoutes from './routes/upload';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
let uploadDir;

if (process.env.VERCEL) {
  uploadDir = "/tmp/uploads";
} else {
  uploadDir = path.join(__dirname, "../../uploads");
}

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/uploads', express.static(uploadDir));
// Routes

app.use('/api/auth', authRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/diamonds', diamondRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start Server after DB Connection
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer().catch(err => {
  console.error('Server failed to start:', err);
});
