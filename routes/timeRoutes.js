import express from 'express';
import { protect } from '../middleware/authmiddleware.js';
import { clockIn, clockOut, getAllTime, getHistory } from '../controllers/timeController.js';

const router = express.Router();

router.post('/clock-in',       protect, clockIn);
router.put('/clock-out',       protect, clockOut);
router.get('/all',             protect, getAllTime);
router.get('/history/:id',     protect, getHistory);

export default router;