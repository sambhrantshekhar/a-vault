const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Mock the db connection to avoid requiring a real postgres DB for this test if it's not setup yet
jest.mock('../config/db', () => ({
    query: jest.fn()
}));

const db = require('../config/db');

describe('Auth API Validation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should register a new user successfully', async () => {
        db.query.mockResolvedValueOnce({ rows: [] }); // User exist check (none)
        db.query.mockResolvedValueOnce({
            rows: [{ id: 1, name: 'Test User', email: 'test@example.com', role: 'student' }]
        }); // Insert result

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'student'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'User registered successfully');
        expect(res.body.user.email).toEqual('test@example.com');
    });

    it('should not register if user already exists', async () => {
        db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // User exist check (exists)

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'existing@example.com',
                password: 'password123',
                role: 'student'
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'User already exists');
    });

    it('should return error if required fields are missing', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User'
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'All fields are required');
    });
});
