const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/temp/' }); // Temp storage for pre-submit checks

router.post('/pre-submit-check', authMiddleware, authorizeRoles('student'), upload.single('file'), aiController.preSubmitCheck);
router.post('/auto-grade', authMiddleware, authorizeRoles('teacher', 'admin'), aiController.autoGradeHint);

module.exports = router;
