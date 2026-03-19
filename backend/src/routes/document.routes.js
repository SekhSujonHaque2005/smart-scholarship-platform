const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getMyDocuments,
  deleteDocument,
  uploadAvatarController,
} = require('../controllers/document.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadDocument: uploadDocMiddleware, uploadAvatar: uploadAvatarMiddleware } = require('../middleware/upload.middleware');

// Document routes
router.post('/upload', authenticate, uploadDocMiddleware.single('file'), uploadDocument);
router.get('/my', authenticate, getMyDocuments);
router.delete('/:id', authenticate, deleteDocument);

// Avatar upload via Cloudinary — with multer error handling
router.post('/avatar', authenticate, (req, res, next) => {
  uploadAvatarMiddleware.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary upload error:', err);
      return res.status(500).json({ message: 'File upload failed', error: err.message });
    }
    next();
  });
}, uploadAvatarController);

module.exports = router;
