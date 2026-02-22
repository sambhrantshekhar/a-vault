import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { ChevronLeft, Save, Sparkles, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
// import { Worker, Viewer } from '@react-pdf-viewer/core';
// import '@react-pdf-viewer/core/lib/styles/index.css';

const EvaluationPage = () => {
    const { submission_id } = useParams();
    const { user } = useContext(AuthContext);
    const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
    const navigate = useNavigate();

    const [evaluation, setEvaluation] = useState(null);
    const [submissionData, setSubmissionData] = useState(null);
    const [formData, setFormData] = useState({ marks_obtained: '', total_marks: 100, feedback: '' });

    // AI Helper state
    const [modelAnswer, setModelAnswer] = useState('');
    const [aiResult, setAiResult] = useState(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvaluationData();
    }, [submission_id]);

    const fetchEvaluationData = async () => {
        try {
            // For student, we only fetch evaluation as GET /api/evaluations/:submission_id handles it
            const evalRes = await axios.get(`http://localhost:5000/api/evaluations/${submission_id}`);
            setEvaluation(evalRes.data);
            if (isTeacher) {
                setFormData({
                    marks_obtained: evalRes.data.marks_obtained || '',
                    total_marks: evalRes.data.total_marks || 100,
                    feedback: evalRes.data.feedback || ''
                });

                // Fetch submission file conditionally? The evaluation route currently returns evaluation data.
                // Let's assume evaluation object has some submission info or we can just fetch it.
            }
        } catch (err) {
            if (err.response?.status === 404 && isTeacher) {
                // Not evaluated yet
                setEvaluation(null);
            } else {
                console.error(err);
            }
        }

        try {
            // In a real scenario, we'd also fetch the file path to display it.
            // For now, let's pretend we have it from another endpoint or previous page.
            setIsAiLoading(false);
        } catch (err) { }

        setLoading(false);
    };

    const handleSaveEvaluation = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`http://localhost:5000/api/evaluations/evaluate/${submission_id}`, formData);
            alert('Evaluation saved successfully');
            navigate(-1);
        } catch (err) {
            console.error(err);
            alert('Failed to save evaluation');
        }
    };

    const handleAIAssist = async () => {
        if (!modelAnswer) return alert("Please provide a model answer/marking scheme");
        setIsAiLoading(true);
        setAiResult(null);

        try {
            // Hardcoded mock submission text since we aren't parsing the pdf in frontend directly here
            const res = await axios.post('http://localhost:5000/api/ai/auto-grade', {
                submission_text: "Student's essay on the topic covering mostly introduction and some body paragraphs but lacking conclusion.",
                model_answer: modelAnswer,
                max_marks: formData.total_marks
            });
            setAiResult(res.data);
        } catch (err) {
            alert("AI Analysis failed");
        } finally {
            setIsAiLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar title={isTeacher ? "Evaluate Submission" : "Evaluation Result"} />

            <main className="flex-1 w-full flex flex-col md:flex-row max-w-[1600px] mx-auto overflow-hidden h-[calc(100vh-64px)]">

                {/* Left Side: Document Viewer (Mocked for now due to complexity of actual PDF viewer setup without web workers configured) */}
                <div className="flex-1 bg-slate-200 border-r border-slate-300 relative flex flex-col items-center justify-center p-8">
                    <div className="bg-white px-8 py-16 shadow-lg border border-slate-300 max-w-2xl w-full flex flex-col items-center text-center">
                        <FileText size={64} className="text-slate-300 mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700">Student Submission Document</h3>
                        <p className="text-slate-500 mt-2">The PDF viewer would be rendered here.</p>
                        <p className="text-sm font-mono text-slate-400 mt-4 inline-flex items-center gap-2 bg-slate-50 px-3 py-1 rounded">
                            Mock File: uploads/anonymous_document.pdf
                        </p>
                    </div>
                </div>

                {/* Right Side: Grading Panel */}
                <div className="w-full md:w-96 lg:w-[450px] bg-white flex flex-col shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10 overflow-y-auto">
                    <div className="border-b border-slate-200 p-4 sticky top-0 bg-white z-10 flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-1 hover:bg-slate-100 rounded-md text-slate-500">
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className="font-bold text-lg text-slate-800">Evaluation Details</h2>
                    </div>

                    <div className="p-6 flex-1">
                        {!isTeacher ? (
                            // Student View
                            <div className="space-y-6">
                                <div className="bg-primary-50 rounded-xl p-6 text-center border border-primary-100">
                                    <h3 className="text-sm font-medium text-primary-600 uppercase tracking-wider mb-2">Total Marks Obtained</h3>
                                    <div className="text-5xl font-bold text-slate-900 flex items-baseline justify-center gap-1">
                                        {evaluation?.marks_obtained || 0}
                                        <span className="text-2xl text-slate-500 font-medium">/{evaluation?.total_marks || 100}</span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                        <FileText size={16} className="text-slate-400" /> Teacher's Feedback
                                    </h3>
                                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-slate-700 text-sm whitespace-pre-wrap min-h-[100px]">
                                        {evaluation?.feedback || "No specific feedback provided."}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-200">
                                    <button className="w-full py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                        <AlertTriangle size={16} /> Request Recheck
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Teacher View
                            <form onSubmit={handleSaveEvaluation} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Marks Obtained</label>
                                        <input
                                            type="number" step="0.1" required
                                            value={formData.marks_obtained}
                                            onChange={e => setFormData({ ...formData, marks_obtained: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-600 text-lg font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Out of (Total)</label>
                                        <input
                                            type="number" required
                                            value={formData.total_marks}
                                            onChange={e => setFormData({ ...formData, total_marks: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-600 text-lg text-slate-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Feedback / Remarks</label>
                                    <textarea
                                        rows="4"
                                        value={formData.feedback}
                                        onChange={e => setFormData({ ...formData, feedback: e.target.value })}
                                        placeholder="Provide constructive feedback here..."
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-600 resize-none"
                                    />
                                </div>

                                {/* AI Helper Section */}
                                <div className="border border-indigo-200 rounded-xl overflow-hidden bg-white">
                                    <div className="bg-indigo-50 border-b border-indigo-200 p-3 flex items-center gap-2">
                                        <Sparkles size={16} className="text-indigo-600" />
                                        <h4 className="font-semibold text-indigo-900 text-sm">AI Grader Assist</h4>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <textarea
                                            rows="2"
                                            placeholder="Paste model answer or marking scheme..."
                                            value={modelAnswer}
                                            onChange={e => setModelAnswer(e.target.value)}
                                            className="w-full px-3 py-2 border border-indigo-100 rounded-lg text-sm focus:ring-1 focus:ring-indigo-400 bg-indigo-50/30"
                                        ></textarea>

                                        <button
                                            type="button"
                                            onClick={handleAIAssist}
                                            disabled={isAiLoading || !modelAnswer}
                                            className="w-full py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
                                        >
                                            {isAiLoading ? 'Analyzing text...' : 'Generate Suggestion'}
                                        </button>

                                        {aiResult && (
                                            <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-sm border border-indigo-100 animate-in fade-in slide-in-from-top-2">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-semibold text-indigo-900">Suggested: {aiResult.suggested_marks}/{formData.total_marks}</span>
                                                    <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full font-medium">{aiResult.confidence}% confidence</span>
                                                </div>
                                                <p className="text-indigo-800/80 text-xs leading-relaxed">{aiResult.justification}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, marks_obtained: aiResult.suggested_marks })}
                                                    className="mt-3 w-full py-1.5 border border-indigo-300 text-indigo-700 rounded bg-white hover:bg-indigo-50 text-xs font-medium transition-colors"
                                                >
                                                    Apply Marks Suggestion
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 mt-6 border-t border-slate-100 flex gap-3">
                                    <button type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                                        <Save size={18} /> Save Evaluation
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EvaluationPage;
