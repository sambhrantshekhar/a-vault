import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isLogin) {
                const res = await axios.post('http://localhost:5000/api/auth/login', {
                    email: formData.email,
                    password: formData.password
                });
                login(res.data.user, res.data.token);
                navigate(res.data.user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
            } else {
                await axios.post('http://localhost:5000/api/auth/register', formData);
                setIsLogin(true); // Switch to login view
                setError('Registration successful! Please login.');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="bg-primary-600 p-8 text-center text-white">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4 backdrop-blur-sm">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">A-Vault</h2>
                    <p className="text-primary-100">Anonymous Academic Evaluation</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className={`p-3 mb-6 rounded-lg text-sm font-medium ${error.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text" name="name" required
                                        onChange={handleChange} value={formData.name}
                                        className="pl-10 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-colors"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email" name="email" required
                                    onChange={handleChange} value={formData.email}
                                    className="pl-10 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-colors"
                                    placeholder="you@university.edu"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password" name="password" required
                                    onChange={handleChange} value={formData.password}
                                    className="pl-10 w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                <select
                                    name="role"
                                    onChange={handleChange} value={formData.role}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-colors"
                                >
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                    {/* Admin role is usually separated but kept here for demo */}
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-primary-600 text-white font-medium py-2.5 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-100 transition-colors"
                        >
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            className="text-primary-600 font-semibold hover:underline"
                        >
                            {isLogin ? 'Register now' : 'Sign in'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
