import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Plus, Users, Calendar, Clock, ChevronRight, FileCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
    const [assignments, setAssignments] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '', description: '', final_submission_deadline: '', marks_reveal_date: '', allow_late_submission: false
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/assignments');
            setAssignments(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/assignments', formData);
            setShowCreateModal(false);
            fetchAssignments();
            setFormData({ title: '', description: '', final_submission_deadline: '', marks_reveal_date: '', allow_late_submission: false });
        } catch (err) {
            console.error(err);
            alert('Failed to create assignment');
        }
    };

    const handlePublish = async (assignmentId) => {
        if (!window.confirm('Are you sure you want to publish marks for this assignment?')) return;
        try {
            await axios.post('http://localhost:5000/api/evaluations/publish', { assignment_id: assignmentId });
            alert('Marks published successfully');
        } catch (err) {
            console.error(err);
            alert('Failed to publish marks');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar title="Teacher Dashboard" />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Your Assignments</h2>
                        <p className="text-slate-500 mt-1">Manage and evaluate student submissions securely.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Plus size={20} />
                        Create Assignment
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
                ) : assignments.length === 0 ? (
                    <div className="text-center bg-white rounded-xl border border-dashed border-slate-300 p-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                            <FileCheck size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No assignments yet</h3>
                        <p className="text-slate-500 mb-6 max-w-sm mx-auto">Create your first assignment to start securely evaluating student work.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="text-primary-600 bg-primary-50 hover:bg-primary-100 font-medium px-4 py-2 rounded-lg transition-colors"
                        >
                            Create Now
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assignments.map(assign => (
                            <motion.div
                                key={assign.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
                            >
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{assign.title}</h3>
                                        <span className="bg-slate-100 text-slate-700 text-xs font-mono px-2 py-1 rounded border border-slate-200 ml-2 shrink-0">
                                            Code: {assign.access_code}
                                        </span>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex flex-col gap-1 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-red-500" />
                                                <span><span className="font-medium text-slate-700">Due:</span> {new Date(assign.final_submission_deadline).toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} className="text-green-500" />
                                                <span><span className="font-medium text-slate-700">Reveal:</span> {new Date(assign.marks_reveal_date).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 bg-slate-50 p-4 flex gap-3">
                                    <button
                                        onClick={() => handlePublish(assign.id)}
                                        className="flex-1 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-medium py-2 rounded-lg transition-colors inline-flex justify-center items-center gap-2"
                                        title="Publish current evaluations"
                                    >
                                        <CheckCircle2 size={16} /> Publish
                                    </button>
                                    <Link
                                        to={`/assignments/${assign.id}/submissions`}
                                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg transition-colors inline-flex justify-center items-center gap-2"
                                    >
                                        <Users size={16} /> Submissions
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setShowCreateModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="border-b border-slate-200 px-6 !py-4 flex justify-between items-center bg-slate-50">
                                <h3 className="text-lg font-bold text-slate-900">Create Assignment</h3>
                                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
                            </div>

                            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                    <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-600" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description / Task Details</label>
                                    <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-600" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Submission Deadline</label>
                                        <input type="datetime-local" required value={formData.final_submission_deadline} onChange={e => setFormData({ ...formData, final_submission_deadline: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-600" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Marks Reveal Date</label>
                                        <input type="datetime-local" required value={formData.marks_reveal_date} onChange={e => setFormData({ ...formData, marks_reveal_date: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-600" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input type="checkbox" id="allowLate" checked={formData.allow_late_submission} onChange={e => setFormData({ ...formData, allow_late_submission: e.target.checked })} className="rounded text-primary-600 focus:ring-primary-600" />
                                    <label htmlFor="allowLate" className="text-sm text-slate-700 font-medium">Allow late submissions (marked as late)</label>
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                                    <button type="submit" className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg">Create</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TeacherDashboard;
