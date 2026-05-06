import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import timeRoutes from './routes/timeRoutes.js';

dotenv.config();
connectDB();

const app = express();  
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}))
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json("server running");
});

app.use('/api/auth', authRoutes);        
app.use('/api/employees', employeeRoutes);
app.use('/api/time', timeRoutes);

app.get('/', (req, res) => res.send(' Server Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => 
  console.log(` Server on port ${PORT}`)
);