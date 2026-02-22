import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Search, History, BookOpen, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const [submissions, setSubmissions] = useState([]);
    const [accessCode, setAccessCode] = useState('');
    const [searchError, setSearchError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMySubmissions();
    }, []);

    const fetchMySubmissions = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/submissions/my-submissions');
            setSubmissions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinAssignment = async (e) => {
        e.preventDefault();
        setSearchError('');
        if (!accessCode.trim()) return;

        try {
            const res = await axios.get(`http://localhost:5000/api/assignments/code/${accessCode}`);
            // Redirect to submission page for this assignment
            navigate(`/submit/${res.data.id}`);
        } catch (err) {
            setSearchError(err.response?.data?.error || 'Assignment not found');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar title="Student Dashboard" />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Join Assignment Section */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 mt-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 opacity-50"></div>

                    <div className="max-w-2xl">
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Join a New Assignment</h2>
                        <p className="text-slate-500 mb-5">Enter the access code provided by your teacher to submit your work securely and anonymously.</p>

                        <form onSubmit={handleJoinAssignment} className="flex gap-3">
                            <div className="relative flex-1 max-w-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value)}
                                    placeholder="e.g. AB12CD"
                                    className="pl-10 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-colors uppercase font-mono"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-2.5 rounded-lg transition-colors whitespace-nowrap"
                            >
                                Find & Submit
                            </button>
                        </form>
                        {searchError && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                <AlertCircle size={14} /> {searchError}
                            </p>
                        )}
                    </div>
                </section>

                {/* Previous Submissions */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <History size={20} className="text-primary-600" />
                        <h2 className="text-xl font-bold text-slate-900">Your Submissions</h2>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
                    ) : submissions.length === 0 ? (
                        <div className="text-center bg-white rounded-xl border border-dashed border-slate-300 p-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                <BookOpen size={32} className="text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No submissions yet</h3>
                            <p className="text-slate-500">When you submit assignments, they will appear here along with their evaluation status.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500 uppercase tracking-wider">
                                            <th className="px-6 py-4">Assignment</th>
                                            <th className="px-6 py-4">Submitted At</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Marks Reveal</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {submissions.map((sub) => {
                                            const revealDate = new Date(sub.marks_reveal_date);
                                            const isRevealed = new Date() >= revealDate;

                                            return (
                                                <motion.tr
                                                    key={sub.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="hover:bg-slate-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-slate-900">{sub.title}</div>
                                                        <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {sub.anonymous_id.substring(0, 8)}...</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">
                                                        {new Date(sub.submitted_at).toLocaleString()}
                                                        {sub.is_late && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">Late</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        {isRevealed ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                                <CheckCircle size={14} /> Evaluated
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                                <Clock size={14} /> Pending
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">
                                                        {revealDate.toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => isRevealed ? navigate(`/evaluate/${sub.id}`) : navigate(`/submit/${sub.assignment_id}`)}
                                                            className="text-primary-600 hover:text-primary-900 inline-flex items-center gap-1 hover:underline"
                                                        >
                                                            {isRevealed ? 'View Results' : 'Update Draft'} <ArrowRight size={16} />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default StudentDashboard;
