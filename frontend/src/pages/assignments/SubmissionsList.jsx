import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { FileText, Clock, CheckCircle, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const SubmissionsList = () => {
    const { assignment_id } = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [assignment_id]);

    const fetchData = async () => {
        try {
            const [subRes, assRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/submissions/assignment/${assignment_id}`),
                // I need an endpoint to get an assignment by ID. But I have getAssignmentByCode.
                // I'll fetch all assignments and find this one, or I'll just rely on submissions data for now.
                axios.get('http://localhost:5000/api/assignments')
            ]);
            setSubmissions(subRes.data);
            const currAssign = assRes.data.find(a => a.id === parseInt(assignment_id));
            if (currAssign) setAssignment(currAssign);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar title={assignment ? `Submissions: ${assignment.title}` : "Submissions"} />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex items-center gap-4">
                    <Link to="/teacher-dashboard" className="text-slate-500 hover:text-slate-800 transition-colors bg-white p-2 rounded-lg border border-slate-200">
                        <ChevronLeft size={20} />
                    </Link>
                    <h2 className="text-2xl font-bold text-slate-900">Student Submissions</h2>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
                ) : submissions.length === 0 ? (
                    <div className="text-center bg-white rounded-xl border border-dashed border-slate-300 p-12">
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No submissions yet</h3>
                        <p className="text-slate-500">Students haven't submitted anything for this assignment.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <ul className="divide-y divide-slate-200">
                            {submissions.map((sub, idx) => (
                                <motion.li
                                    key={sub.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="hover:bg-slate-50 transition-colors"
                                >
                                    <Link to={`/evaluate/${sub.id}`} className="flex items-center justify-between p-4 sm:px-6">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-primary-50 p-3 rounded-lg text-primary-600">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                {sub.student_name ? (
                                                    <p className="text-sm font-medium text-slate-900">{sub.student_name}</p>
                                                ) : (
                                                    <p className="text-sm font-medium text-slate-900 font-mono">ID: {sub.anonymous_id}</p>
                                                )}
                                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} /> {new Date(sub.submitted_at).toLocaleString()}
                                                    </span>
                                                    {sub.is_late && <span className="text-orange-600 font-medium">LATE</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-primary-600 font-medium text-sm flex items-center gap-1">
                                            Evaluate <ChevronLeft size={16} className="rotate-180" />
                                        </div>
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SubmissionsList;
