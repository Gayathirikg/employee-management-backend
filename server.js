import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import { initChatSocket } from './socket/chatSocket.js';

import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import timeRoutes from './routes/timeRoutes.js';

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  console.log('Socket token received:', token ? 'YES' : 'NO');

  if (!token) return next(new Error('No token'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    console.log('Socket user:', decoded);
    next();
  } catch (err) {
    console.log('Socket JWT error:', err.message);
    next(new Error('Invalid token'));
  }
});

initChatSocket(io);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json("server running");
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/time', timeRoutes);

app.get('/', (req, res) => res.send('Server Running'));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
  console.log(`Server on port ${PORT}`)
);