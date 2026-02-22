const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/avault',
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
