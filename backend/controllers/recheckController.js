const db = require('../config/db');

exports.requestRecheck = async (req, res) => {
    const { evaluation_id, reason_category, explanation } = req.body;
    const student_id = req.user.id;

    if (!evaluation_id || !reason_category) {
        return res.status(400).json({ error: 'Evaluation ID and reason category are required' });
    }

    try {
        // Verify that this evaluation belongs to the student and marks are published
        const evalCheck = await db.query(
            `SELECT e.id, a.marks_reveal_date 
       FROM evaluations e
       JOIN submissions s ON e.submission_id = s.id
       JOIN assignments a ON s.assignment_id = a.id
       WHERE e.id = $1 AND s.student_id = $2`,
            [evaluation_id, student_id]
        );

        if (evalCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Evaluation not found or unauthorized' });
        }

        const revealDate = new Date(evalCheck.rows[0].marks_reveal_date);
        if (new Date() < revealDate) {
            return res.status(403).json({ error: 'Cannot request recheck before marks are revealed' });
        }

        // Check if recheck already exists
        const existingRecheck = await db.query('SELECT id FROM rechecks WHERE evaluation_id = $1', [evaluation_id]);
        if (existingRecheck.rows.length > 0) {
            return res.status(400).json({ error: 'Recheck already requested for this evaluation' });
        }

        const result = await db.query(
            `INSERT INTO rechecks (evaluation_id, reason_category, explanation)
       VALUES ($1, $2, $3) RETURNING *`,
            [evaluation_id, reason_category, explanation]
        );

        res.status(201).json({ message: 'Recheck requested successfully', recheck: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error requesting recheck' });
    }
};

exports.getRechecksForTeacher = async (req, res) => {
    const teacher_id = req.user.id;

    try {
        const result = await db.query(
            `SELECT r.*, e.marks_obtained, e.total_marks, s.anonymous_id, a.title 
       FROM rechecks r
       JOIN evaluations e ON r.evaluation_id = e.id
       JOIN submissions s ON e.submission_id = s.id
       JOIN assignments a ON s.assignment_id = a.id
       WHERE a.teacher_id = $1
       ORDER BY r.created_at DESC`,
            [teacher_id]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching rechecks' });
    }
};

exports.resolveRecheck = async (req, res) => {
    const { recheck_id } = req.params;
    const { status, updated_marks, feedback } = req.body; // status: resolved, rejected
    const teacher_id = req.user.id;

    try {
        // Check ownership
        const recheckCheck = await db.query(
            `SELECT r.id, r.evaluation_id, a.teacher_id 
       FROM rechecks r
       JOIN evaluations e ON r.evaluation_id = e.id
       JOIN submissions s ON e.submission_id = s.id
       JOIN assignments a ON s.assignment_id = a.id
       WHERE r.id = $1`,
            [recheck_id]
        );

        if (recheckCheck.rows.length === 0 || recheckCheck.rows[0].teacher_id !== teacher_id) {
            return res.status(403).json({ error: 'Not authorized or recheck not found' });
        }

        const evaluation_id = recheckCheck.rows[0].evaluation_id;

        // Begin transaction for audit trace
        await db.query('BEGIN');

        const resolveResult = await db.query(
            `UPDATE rechecks SET status = $1 WHERE id = $2 RETURNING *`,
            [status, recheck_id]
        );

        if (status === 'resolved' && updated_marks !== undefined) {
            await db.query(
                `UPDATE evaluations SET marks_obtained = $1, feedback = $2 WHERE id = $3`,
                [updated_marks, feedback, evaluation_id]
            );
        }

        await db.query('COMMIT');

        res.json({ message: `Recheck ${status}`, recheck: resolveResult.rows[0] });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error resolving recheck' });
    }
};
