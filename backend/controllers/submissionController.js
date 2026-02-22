const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');

// Set up storage engine using multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Generate unique filename preserving extension
        cb(null, req.user.id + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only PDFs and images are allowed'));
        }
    }
});

exports.uploadMiddleware = upload.single('file');

exports.submitAssignment = async (req, res) => {
    const { assignment_id } = req.body;
    const student_id = req.user.id;
    const file = req.file;

    if (!assignment_id || !file) {
        return res.status(400).json({ error: 'Assignment ID and file are required' });
    }

    try {
        // Check if assignment exists and verify deadline
        const assignmentRes = await db.query('SELECT final_submission_deadline, allow_late_submission FROM assignments WHERE id = $1', [assignment_id]);

        if (assignmentRes.rows.length === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        const assignment = assignmentRes.rows[0];
        const now = new Date();
        const deadline = new Date(assignment.final_submission_deadline);
        let isLate = false;

        if (now > deadline) {
            if (!assignment.allow_late_submission) {
                return res.status(400).json({ error: 'Submission deadline has passed and late submissions are not allowed' });
            }
            isLate = true;
        }

        // Check if previous submission exists
        const previousSub = await db.query('SELECT id, anonymous_id FROM submissions WHERE assignment_id = $1 AND student_id = $2', [assignment_id, student_id]);

        let anonymous_id;

        if (previousSub.rows.length > 0) {
            // Re-upload implies updating the file path and timestamp
            anonymous_id = previousSub.rows[0].anonymous_id;

            const updateResult = await db.query(
                `UPDATE submissions 
         SET file_path = $1, is_late = $2, submitted_at = CURRENT_TIMESTAMP
         WHERE id = $3 RETURNING *`,
                [file.path, isLate, previousSub.rows[0].id]
            );

            return res.json({ message: 'Submission updated successfully', submission: updateResult.rows[0] });
        } else {
            // New submission, generate anonymous ID
            anonymous_id = uuidv4();

            const insertResult = await db.query(
                `INSERT INTO submissions (assignment_id, student_id, anonymous_id, file_path, is_late)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [assignment_id, student_id, anonymous_id, file.path, isLate]
            );

            return res.status(201).json({ message: 'Submitted successfully', submission: insertResult.rows[0] });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while submitting assignment' });
    }
};

exports.getSubmissionsForAssignment = async (req, res) => {
    const { assignment_id } = req.params;
    const teacher_id = req.user.id;

    try {
        // Check if the current teacher owns the assignment
        const assignmentCheck = await db.query('SELECT id, marks_reveal_date FROM assignments WHERE id = $1 AND teacher_id = $2', [assignment_id, teacher_id]);
        if (assignmentCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Not authorized to view submissions for this assignment' });
        }

        const assignment = assignmentCheck.rows[0];
        const revealDate = new Date(assignment.marks_reveal_date);
        const now = new Date();

        let queryStr;
        if (now >= revealDate) {
            // After marks reveal date, show student identities
            queryStr = `
        SELECT s.id, s.anonymous_id, s.file_path, s.is_late, s.submitted_at, u.name as student_name, u.email as student_email
        FROM submissions s
        JOIN users u ON s.student_id = u.id
        WHERE s.assignment_id = $1
      `;
        } else {
            // Keep identities hidden
            queryStr = `
        SELECT id, anonymous_id, file_path, is_late, submitted_at 
        FROM submissions 
        WHERE assignment_id = $1
      `;
        }

        const result = await db.query(queryStr, [assignment_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching submissions' });
    }
};

exports.getStudentSubmissions = async (req, res) => {
    const student_id = req.user.id;
    try {
        const result = await db.query(
            `SELECT s.*, a.title, a.access_code, a.marks_reveal_date 
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       WHERE s.student_id = $1 ORDER BY s.submitted_at DESC`,
            [student_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching student submissions' });
    }
};
