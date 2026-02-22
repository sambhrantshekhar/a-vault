const db = require('../config/db');

exports.evaluateSubmission = async (req, res) => {
    const { submission_id } = req.params;
    const { marks_obtained, total_marks, feedback } = req.body;
    const teacher_id = req.user.id;

    try {
        // Check if the submission exists and belongs to a teacher's assignment
        const subCheck = await db.query(
            `SELECT s.id, a.teacher_id, a.marks_reveal_date 
       FROM submissions s 
       JOIN assignments a ON s.assignment_id = a.id 
       WHERE s.id = $1`,
            [submission_id]
        );

        if (subCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        if (subCheck.rows[0].teacher_id !== teacher_id) {
            return res.status(403).json({ error: 'Not authorized to evaluate this submission' });
        }

        // Insert or update evaluation
        const evalCheck = await db.query('SELECT id FROM evaluations WHERE submission_id = $1', [submission_id]);

        let result;
        if (evalCheck.rows.length > 0) {
            result = await db.query(
                `UPDATE evaluations 
         SET marks_obtained = $1, total_marks = $2, feedback = $3, teacher_id = $4, evaluated_at = CURRENT_TIMESTAMP
         WHERE submission_id = $5 RETURNING *`,
                [marks_obtained, total_marks, feedback, teacher_id, submission_id]
            );
        } else {
            result = await db.query(
                `INSERT INTO evaluations (submission_id, teacher_id, marks_obtained, total_marks, feedback)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [submission_id, teacher_id, marks_obtained, total_marks, feedback]
            );
        }

        res.json({ message: 'Evaluation saved successfully', evaluation: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while evaluating' });
    }
};

exports.publishEvaluations = async (req, res) => {
    const { assignment_id } = req.body;
    const teacher_id = req.user.id;

    try {
        const assignmentCheck = await db.query('SELECT id FROM assignments WHERE id = $1 AND teacher_id = $2', [assignment_id, teacher_id]);

        if (assignmentCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Not authorized or assignment not found' });
        }

        // Mark evaluations as published for all submissions of this assignment
        const updateResult = await db.query(
            `UPDATE evaluations e
       SET is_published = true
       FROM submissions s
       WHERE e.submission_id = s.id AND s.assignment_id = $1 RETURNING e.id`,
            [assignment_id]
        );

        res.json({ message: 'Marks published successfully', updated_count: updateResult.rows.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error publishing marks' });
    }
};

exports.getEvaluation = async (req, res) => {
    const { submission_id } = req.params;
    const user_id = req.user.id;
    const role = req.user.role;

    try {
        // If student, check if it's their submission and if marks are published (or reveal date passed)
        if (role === 'student') {
            const evaluation = await db.query(
                `SELECT e.*, a.marks_reveal_date 
         FROM evaluations e
         JOIN submissions s ON e.submission_id = s.id
         JOIN assignments a ON s.assignment_id = a.id
         WHERE s.id = $1 AND s.student_id = $2`,
                [submission_id, user_id]
            );

            if (evaluation.rows.length === 0) {
                return res.status(404).json({ error: 'Evaluation not found or not yours' });
            }

            const evalData = evaluation.rows[0];
            const now = new Date();
            const revealDate = new Date(evalData.marks_reveal_date);

            if (!evalData.is_published && now < revealDate) {
                return res.status(403).json({ error: 'Marks are not revealed yet' });
            }

            return res.json(evalData);
        }

        // If teacher, check if they own the assignment
        if (role === 'teacher') {
            const evaluation = await db.query(
                `SELECT e.* 
         FROM evaluations e
         JOIN submissions s ON e.submission_id = s.id
         JOIN assignments a ON s.assignment_id = a.id
         WHERE s.id = $1 AND a.teacher_id = $2`,
                [submission_id, user_id]
            );

            if (evaluation.rows.length === 0) {
                return res.status(404).json({ error: 'Evaluation not found or not authorized' });
            }

            return res.json(evaluation.rows[0]);
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching evaluation' });
    }
};
