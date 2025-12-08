// src/routes/apiRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

// Import Controllers & Middleware
const authController = require('../controllers/authController');
const documentController = require('../controllers/documentController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Setup Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// --- DEFINE ROUTES ---
router.post('/login', authController.login);
router.post('/upload', authenticateToken, upload.single('file'), documentController.uploadDocument);
router.get('/documents', authenticateToken, documentController.getDocuments);

module.exports = router;