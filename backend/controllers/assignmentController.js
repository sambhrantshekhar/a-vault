const db = require('../config/db');

const generateAccessCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

exports.createAssignment = async (req, res) => {
    const { title, description, final_submission_deadline, marks_reveal_date, allow_late_submission } = req.body;
    const teacher_id = req.user.id;

    if (!title || !final_submission_deadline || !marks_reveal_date) {
        return res.status(400).json({ error: 'Missing required assignment fields' });
    }

    try {
        let access_code;
        let isUnique = false;

        // Ensure access code is unique
        while (!isUnique) {
            access_code = generateAccessCode();
            const existCheck = await db.query('SELECT id FROM assignments WHERE access_code = $1', [access_code]);
            if (existCheck.rows.length === 0) {
                isUnique = true;
            }
        }

        const result = await db.query(
            `INSERT INTO assignments 
      (title, description, access_code, teacher_id, final_submission_deadline, marks_reveal_date, allow_late_submission) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [title, description, access_code, teacher_id, final_submission_deadline, marks_reveal_date, allow_late_submission || false]
        );

        res.status(201).json({ message: 'Assignment created successfully', assignment: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while creating assignment' });
    }
};

exports.getAssignments = async (req, res) => {
    try {
        if (req.user.role === 'teacher') {
            const result = await db.query('SELECT * FROM assignments WHERE teacher_id = $1 ORDER BY created_at DESC', [req.user.id]);
            return res.json(result.rows);
        }
        // For students: they might need to fetch by access code usually, but we could list assignments they are enrolled in if we had an enrollment table.
        // For now, if a student provides an access code in a query or param, we fetch that. Otherwise fetch all (or we expect a specific route).
        res.status(403).json({ error: 'Method restricted for this role' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while fetching assignments' });
    }
};

exports.getAssignmentByCode = async (req, res) => {
    const { code } = req.params;
    try {
        const result = await db.query(
            `SELECT id, title, description, teacher_id, final_submission_deadline, marks_reveal_date, allow_late_submission, created_at 
       FROM assignments WHERE access_code = $1`,
            [code]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
