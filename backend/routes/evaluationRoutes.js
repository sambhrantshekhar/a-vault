const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/evaluate/:submission_id', authMiddleware, authorizeRoles('teacher', 'admin'), evaluationController.evaluateSubmission);
router.post('/publish', authMiddleware, authorizeRoles('teacher', 'admin'), evaluationController.publishEvaluations);
router.get('/:submission_id', authMiddleware, evaluationController.getEvaluation);

module.exports = router;
