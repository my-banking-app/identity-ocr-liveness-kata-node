import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Validation Rules
const registerValidation = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Name is required'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

const refreshTokenValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

// Routes
router.post(
  '/register',
  registerValidation,
  validateRequest,
  AuthController.register,
);

router.post(
  '/login',
  loginValidation,
  validateRequest,
  AuthController.login,
);

router.post(
  '/refresh',
  refreshTokenValidation,
  validateRequest,
  AuthController.refreshToken,
);

router.post(
  '/logout',
  refreshTokenValidation,
  validateRequest,
  AuthController.logout,
);

// Protected Route Example (Profile)
router.get('/me', authenticateToken, (req: any, res) => {
  res.json({ user: req.user });
});

export default router;
