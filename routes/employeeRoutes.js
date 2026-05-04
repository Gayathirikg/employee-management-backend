import express from 'express';
import { protect } from '../middleware/authmiddleware.js';
import {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee
} from '../controllers/employeeController.js';

const router = express.Router();

router.post('/',    protect, createEmployee);
router.get('/',     protect, getEmployees);
router.get('/:id',  protect, getEmployee);
router.put('/:id',  protect, updateEmployee);
router.delete('/:id', protect, deleteEmployee);

export default router;