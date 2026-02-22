const express = require('express');
const router = express.Router();
const recheckController = require('../controllers/recheckController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/request', authMiddleware, authorizeRoles('student'), recheckController.requestRecheck);
router.get('/teacher', authMiddleware, authorizeRoles('teacher', 'admin'), recheckController.getRechecksForTeacher);
router.post('/resolve/:recheck_id', authMiddleware, authorizeRoles('teacher', 'admin'), recheckController.resolveRecheck);

module.exports = router;
