const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, authorizeRoles('teacher', 'admin'), assignmentController.createAssignment);
router.get('/', authMiddleware, authorizeRoles('teacher'), assignmentController.getAssignments);
router.get('/code/:code', authMiddleware, assignmentController.getAssignmentByCode);

module.exports = router;
