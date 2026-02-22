-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    access_code VARCHAR(50) UNIQUE NOT NULL,
    teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    final_submission_deadline TIMESTAMP NOT NULL,
    marks_reveal_date TIMESTAMP NOT NULL,
    allow_late_submission BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    anonymous_id UUID UNIQUE NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    is_late BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assignment_id, student_id)
);

-- Evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
    teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    marks_obtained DECIMAL(5,2),
    total_marks DECIMAL(5,2),
    feedback TEXT,
    ai_confidence_score DECIMAL(5,2),
    ai_suggested_marks DECIMAL(5,2),
    is_published BOOLEAN DEFAULT false,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(submission_id)
);

-- Rechecks table
CREATE TABLE IF NOT EXISTS rechecks (
    id SERIAL PRIMARY KEY,
    evaluation_id INTEGER REFERENCES evaluations(id) ON DELETE CASCADE,
    reason_category VARCHAR(100) NOT NULL,
    explanation TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
