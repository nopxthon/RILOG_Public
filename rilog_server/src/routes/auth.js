const express = require('express');
const router = express.Router();

const { registerRequestOtp } = require('../controllers/registerController');
const { verifyOtpAndCreateAccount } = require('../controllers/otpVerifyController');
const { login } = require('../controllers/loginController');
const { logout } = require('../controllers/loginController');
const forgotPasswordController = require('../controllers/forgotPasswordController');

// Auth Routes
router.post('/register', registerRequestOtp);
router.post('/verify-otp', verifyOtpAndCreateAccount);
router.post('/login', login);
router.post('/logout', logout);

// Forgot Password Routes (Lupa Kata Sandi)
router.post('/forgot-password', forgotPasswordController.forgotPassword);
router.post('/reset-password', forgotPasswordController.resetPassword);

console.log({
  registerRequestOtp: typeof registerRequestOtp,
  verifyOtpAndCreateAccount: typeof verifyOtpAndCreateAccount,
  login: typeof login,
  forgotPassword: typeof forgotPasswordController.forgotPassword,
  resetPassword: typeof forgotPasswordController.resetPassword
});

module.exports = router;