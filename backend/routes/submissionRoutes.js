const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, authorizeRoles('student'), submissionController.uploadMiddleware, submissionController.submitAssignment);
router.get('/assignment/:assignment_id', authMiddleware, authorizeRoles('teacher', 'admin'), submissionController.getSubmissionsForAssignment);
router.get('/my-submissions', authMiddleware, authorizeRoles('student'), submissionController.getStudentSubmissions);

module.exports = router;
