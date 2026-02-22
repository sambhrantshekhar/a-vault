import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Upload, AlertTriangle, FileUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SubmissionPage = () => {
    const { assignment_id } = useParams();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [aiFeedback, setAiFeedback] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage('');
        setAiFeedback('');
    };

    const handleAIPreCheck = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);

        setIsAiLoading(true);
        setAiFeedback('');

        try {
            const res = await axios.post('http://localhost:5000/api/ai/pre-submit-check', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAiFeedback(res.data.feedback);
        } catch (err) {
            setAiFeedback('Failed to generate AI feedback. Proceeding with normal submission is still possible.');
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Please select a file to submit');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('assignment_id', assignment_id);

        try {
            await axios.post('http://localhost:5000/api/submissions', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage('Assignment submitted successfully!');
            setTimeout(() => navigate('/student-dashboard'), 2000);
        } catch (err) {
            setMessage(err.response?.data?.error || 'Failed to submit assignment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar title="Submit Assignment" />

            <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-amber-50 border-b border-amber-200 p-4 flex gap-3 items-start">
                        <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                        <div>
                            <h3 className="font-semibold text-amber-800">Confidentiality Notice</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                Do not include your name, roll number, or any identifying details inside the uploaded file.
                                Your submission will be evaluated anonymously to ensure fair grading.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        <form onSubmit={handleSubmit}>
                            <div
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-primary-400 bg-primary-50' : 'border-slate-300 hover:border-slate-400 focus-within:border-primary-500'}`}
                            >
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    accept=".pdf,image/*"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                    <div className={`p-4 rounded-full mb-4 ${file ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {file ? <FileUp size={32} /> : <Upload size={32} />}
                                    </div>
                                    <span className="text-lg font-medium text-slate-900">
                                        {file ? file.name : 'Click to upload or drag & drop'}
                                    </span>
                                    <span className="text-slate-500 text-sm mt-1">
                                        Supports PDF, PNG, JPG (Max 10MB)
                                    </span>
                                </label>
                            </div>

                            {message && (
                                <div className={`mt-6 p-4 rounded-lg flex items-center gap-2 ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {message.includes('success') ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                                    {message}
                                </div>
                            )}

                            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-end border-t border-slate-100 pt-6">
                                <button
                                    type="button"
                                    onClick={handleAIPreCheck}
                                    disabled={!file || isAiLoading}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-primary-200 text-primary-700 font-medium hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Sparkles size={18} />
                                    {isAiLoading ? 'Analyzing...' : 'AI Pre-check'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !file}
                                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-medium px-8 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? 'Submitting...' : 'Final Submit'}
                                </button>
                            </div>
                        </form>

                        <AnimatePresence>
                            {aiFeedback && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-8 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden"
                                >
                                    <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center gap-2 font-medium text-slate-800">
                                        <Sparkles size={18} className="text-primary-600" /> AI Feedback
                                    </div>
                                    <div className="p-4 text-slate-700 text-sm whitespace-pre-wrap">
                                        {aiFeedback}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SubmissionPage;
