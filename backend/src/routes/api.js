import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { generateDocuments } from '../controllers/documents.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Публичные маршруты
router.post('/register', register);
router.post('/login', login);

// Защищенные маршруты (требуют JWT)
router.post('/documents/generate', authMiddleware, generateDocuments);

export default router;
