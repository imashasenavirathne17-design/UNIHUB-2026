import { useState, useEffect, useContext, useRef } from 'react';
import { X, Save, AlertCircle, FileUp, Sparkles, Trash2, Plus, Check, Loader2, BookOpen, Clock, BarChart, Trash, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import OnExam_GeneratedList from './OnExam_GeneratedList';
import OnExam_MCQBuilder from './OnExam_MCQBuilder';

const API = 'http://localhost:5000/api/onexam';

const OnExam_ExamForm = ({ open, onClose, onSave, editingExam }) => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        title: '',
        difficulty: 'Medium',
        duration: '',
        pdfUrl: '',
        questions: []
    });
    
    // AI Preview State
    const [generatedQuestions, setGeneratedQuestions] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [genCount, setGenCount] = useState(10);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const fileInputRef = useRef(null);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    const uploadConfig = { headers: { ...config.headers, 'Content-Type': 'multipart/form-data' } };

    useEffect(() => {
        if (editingExam) {
            setFormData({
                title: editingExam.title || editingExam.subject || '',
                difficulty: editingExam.difficulty || 'Medium',
                duration: editingExam.duration || '',
                pdfUrl: editingExam.pdfUrl || '',
                questions: editingExam.questions || []
            });
        } else {
            setFormData({
                title: '',
                difficulty: 'Medium',
                duration: '',
                pdfUrl: '',
                questions: []
            });
        }
        setGeneratedQuestions([]);
        setSelectedIds([]);
        setError(null);
        setSuccess(null);
    }, [editingExam, open]);

    if (!open) return null;

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            setError("Please upload a valid PDF file.");
            return;
        }

        try {
            setUploading(true);
            setError(null);
            setSuccess(null);
            const data = new FormData();
            data.append('pdf', file);
            const res = await axios.post(`${API}/upload-pdf`, data, uploadConfig);
            const uploadedUrl = res.data.pdfUrl;
            
            setFormData(prev => ({ ...prev, pdfUrl: uploadedUrl }));
            setSuccess("Material synchronized. Starting AI synthesis...");
            
            // Automatic generation trigger
            handleGenerate(uploadedUrl);
        } catch (err) {
            setError("Failed to process PDF. Please check file format.");
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleGenerate = async (urlOverride = null) => {
        const targetUrl = urlOverride || formData.pdfUrl;
        if (!targetUrl) {
            setError("Please upload a PDF first to generate questions.");
            return;
        }

        const isRegen = generatedQuestions.length > 0;

        try {
            setLoading(true);
            setError(null);
            setSuccess(null);
            const res = await axios.post(`${API}/generate-questions`, { 
                pdfUrl: targetUrl, 
                count: genCount,
                isRegen
            }, config);
            
            setGeneratedQuestions(res.data);
            setSelectedIds(res.data.map((_, i) => i)); 
            setSuccess(isRegen ? `Diversity Pulse: ${res.data.length} new candidates extracted!` : `Sync Complete: ${res.data.length} candidates extracted!`);
        } catch (err) {
            const msg = err.response?.data?.message || "AI Analysis failed. You can still add questions manually.";
            setError(msg);
            console.error("AI Generation Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Selection Logic
    const toggleSelection = (idx) => {
        setSelectedIds(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
    };

    const selectAll = () => {
        if (selectedIds.length === generatedQuestions.length) setSelectedIds([]);
        else setSelectedIds(generatedQuestions.map((_, i) => i));
    };

    const addSelectedQuestions = () => {
        const selected = generatedQuestions.filter((_, i) => selectedIds.includes(i));
        setFormData(prev => ({ ...prev, questions: [...prev.questions, ...selected] }));
        setGeneratedQuestions([]); // Clear preview after adding
        setSelectedIds([]);
        setSuccess(`${selected.length} questions successfully added to the bank!`);
    };

    const handleAddManualQuest = () => {
        setFormData(prev => ({
            ...prev,
            questions: [
                ...prev.questions,
                { question: '', options: ['', '', '', ''], answer: '' }
            ]
        }));
    };

    const updateBankQuestion = (index, field, value) => {
        const updated = [...formData.questions];
        if (field === 'options') {
            updated[index].options = value;
        } else {
            updated[index][field] = value;
        }
        setFormData(prev => ({ ...prev, questions: updated }));
    };

    const removeFromBank = (index) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        // MERGE LOGIC: Include currently selected AI candidates that aren't added yet
        let finalQuestions = [...formData.questions];
        if (selectedIds.length > 0 && generatedQuestions.length > 0) {
            const selectedAI = generatedQuestions.filter((_, i) => selectedIds.includes(i));
            finalQuestions = [...finalQuestions, ...selectedAI];
        }

        if (!formData.title || !formData.duration) {
            setError("Please enter a title and session duration.");
            return;
        }

        if (finalQuestions.length === 0) {
            setError("Please select at least one AI-generated question or add one manually.");
            return;
        }

        // Validate final questions
        const isValid = finalQuestions.every(q => 
            q.question && q.options.every(o => o) && q.answer && q.options.includes(q.answer)
        );

        if (!isValid) {
            setError("Each question in the bank must have text, 4 options, and a correct answer selected.");
            return;
        }

        // Dispatch correctly with merged payload
        onSave({ ...formData, questions: finalQuestions });
    };

    const hasAnyContent = formData.questions.length > 0 || selectedIds.length > 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative bg-white w-full max-w-5xl max-h-[95vh] rounded-[48px] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-xl relative z-10 shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[24px] bg-unihub-teal/10 border border-unihub-teal/20 flex items-center justify-center text-unihub-teal shadow-sm">
                            <Sparkles className="w-8 h-8 fill-unihub-teal/10" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-2xl font-black text-gray-800 tracking-tight leading-none uppercase">
                                    {editingExam ? 'Update' : 'Generate'} Practice Arena
                                </h3>
                                <div className="px-3 py-1 bg-unihub-teal text-[10px] font-black text-white rounded-full tracking-widest uppercase animate-pulse">Alpha AI</div>
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.4em]">Integrated Intelligence Engine</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 rounded-[24px] hover:bg-unihub-coral/10 hover:text-unihub-coral text-gray-400 transition-all border border-transparent hover:border-unihub-coral/20 shadow-sm hover:shadow-unihub-coral/10 group">
                        <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Form Content - Scrollable */}
                <form id="examForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-12 space-y-16 custom-scrollbar bg-gray-50/20">
                    {/* Status Feedback */}
                    {(error || success) && (
                        <div className="animate-in slide-in-from-top-4">
                             {error && (
                                <div className="flex items-center gap-4 p-6 bg-unihub-coral/5 text-unihub-coral rounded-[32px] text-sm font-black border border-unihub-coral/10 shadow-sm">
                                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-unihub-coral shadow-sm">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="uppercase tracking-widest block text-[10px] opacity-60 mb-0.5">Configuration Error</span>
                                        {error}
                                    </div>
                                </div>
                            )}
                            {success && (
                                <div className="flex items-center gap-4 p-6 bg-unihub-teal/5 text-unihub-teal rounded-[32px] text-sm font-black border border-unihub-teal/10 shadow-sm">
                                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-unihub-teal shadow-sm">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="uppercase tracking-widest block text-[10px] opacity-60 mb-0.5">Optimization Success</span>
                                        {success}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 1: Base Configuration */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-4 pb-2 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-[18px] bg-unihub-teal/10 border border-unihub-teal/20 flex items-center justify-center text-unihub-teal font-black text-sm uppercase">01</div>
                            <h4 className="text-sm font-black text-gray-800 uppercase tracking-[0.2em]">Session Blueprint</h4>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-1">Academy Title</label>
                                <div className="relative group">
                                    <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-unihub-teal transition-all" />
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full pl-16 pr-8 py-5 rounded-[28px] bg-white border border-gray-100 focus:border-unihub-teal focus:shadow-[0_12px_40px_-10px_rgba(20,184,166,0.15)] transition-all text-sm font-black text-gray-700 outline-none placeholder:text-gray-300"
                                        placeholder="e.g. Advanced Operating Systems"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-1">Difficulty</label>
                                    <div className="relative group">
                                        <BarChart className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-unihub-teal transition-all" />
                                        <select
                                            value={formData.difficulty}
                                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                            className="w-full pl-14 pr-6 py-5 rounded-[28px] bg-white border border-gray-100 focus:border-unihub-teal transition-all text-sm font-black text-gray-700 outline-none appearance-none cursor-pointer"
                                        >
                                            <option>Easy</option>
                                            <option>Medium</option>
                                            <option>Hard</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-1">Timer (Min)</label>
                                    <div className="relative group">
                                        <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-unihub-teal transition-all" />
                                        <input
                                            type="number"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                            className="w-full pl-14 pr-6 py-5 rounded-[28px] bg-white border border-gray-100 focus:border-unihub-teal transition-all text-sm font-black text-gray-700 outline-none placeholder:text-gray-300"
                                            placeholder="45"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Content Injection & AI Preview */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-4 pb-2 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-[18px] bg-unihub-teal/10 border border-unihub-teal/20 flex items-center justify-center text-unihub-teal font-black text-sm uppercase">02</div>
                            <h4 className="text-sm font-black text-gray-800 uppercase tracking-[0.2em]">Material Synthesis</h4>
                        </div>

                        <div className="p-10 rounded-[40px] bg-white border border-gray-100 shadow-xl shadow-gray-200/20 space-y-10">
                            <div className="flex flex-col md:flex-row items-center gap-10">
                                <div className="flex-1 space-y-2">
                                    <h5 className="text-lg font-black text-gray-800 uppercase tracking-tight">AI MCQ Pipeline</h5>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-loose">
                                        Inject lecture materials to prime the AI engine. Our neural parser will identify core concepts and transform them into practice candidates.
                                    </p>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf" />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    disabled={uploading}
                                    className={`group flex items-center gap-3 px-10 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] transition-all border-2 ${
                                        formData.pdfUrl 
                                            ? 'bg-unihub-teal text-white border-unihub-teal shadow-xl shadow-unihub-teal/20' 
                                            : 'bg-white text-unihub-teal border-unihub-teal/20 hover:border-unihub-teal hover:bg-gray-50'
                                    }`}
                                >
                                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : formData.pdfUrl ? <CheckCircle2 className="w-5 h-5" /> : <FileUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />}
                                    {formData.pdfUrl ? 'Material Loaded' : 'Select Core PDF'}
                                </button>
                            </div>

                            {formData.pdfUrl && (
                                <div className="pt-10 border-t border-gray-50 flex flex-col md:flex-row items-center gap-8">
                                    <div className="flex items-center gap-8 bg-gray-50/50 p-4 rounded-[32px] border border-gray-100 flex-1 w-full relative">
                                        <div className="flex items-center gap-3 px-6 shrink-0 border-r border-gray-200">
                                            <Sparkles className="w-5 h-5 text-unihub-teal fill-unihub-teal/10" />
                                            <span className="text-[10px] uppercase font-black tracking-widest text-unihub-teal/50">Target Volume:</span>
                                        </div>
                                        <div className="flex items-center gap-6 px-4">
                                            {[10, 20, 30].map(val => (
                                                <button 
                                                    key={val}
                                                    type="button"
                                                    onClick={() => setGenCount(val)}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${
                                                        genCount === val 
                                                            ? 'bg-unihub-teal text-white shadow-lg' 
                                                            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                                    }`}
                                                >
                                                    {val} MCQs
                                                </button>
                                            ))}
                                        </div>
                                        <div className="ml-auto flex flex-col items-end">
                                            <button
                                                type="button"
                                                onClick={() => handleGenerate()}
                                                disabled={loading}
                                                className="px-12 py-4 rounded-[24px] bg-unihub-teal hover:bg-[#0d857a] text-white font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-2xl shadow-unihub-teal/20 active:scale-95 disabled:opacity-50"
                                            >
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 fill-white" />}
                                                {loading ? 'Synthesizing...' : 'Re-Generate Candidates'}
                                            </button>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-3 animate-pulse">
                                                Candidates appear below automatically
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PREVIEW LIST COMPONENT */}
                            {generatedQuestions.length > 0 && (
                                <OnExam_GeneratedList 
                                    questions={generatedQuestions}
                                    selectedIds={selectedIds}
                                    onToggle={toggleSelection}
                                    onSelectAll={selectAll}
                                    onAddSelected={addSelectedQuestions}
                                    onClearAll={() => { setGeneratedQuestions([]); setSelectedIds([]); }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Step 3: Question Bank Builder */}
                    <OnExam_MCQBuilder 
                        questions={formData.questions}
                        onUpdate={(idx, field, val) => updateBankQuestion(idx, field, val)}
                        onRemove={removeFromBank}
                        onAddManual={handleAddManualQuest}
                    />

                </form>

                {/* Footer Controls */}
                <div className="p-10 border-t border-gray-100 bg-white/80 backdrop-blur-2xl shrink-0 flex justify-between items-center relative z-20">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <div className="w-12 h-12 rounded-[20px] bg-unihub-teal/10 flex items-center justify-center text-unihub-teal shadow-sm border border-unihub-teal/20 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-xl font-black text-gray-800 tracking-tighter block leading-none">
                                    {formData.questions.length + selectedIds.length}
                                </span>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Selected Items</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-10 py-5 rounded-[28px] font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 transition-all border-2 border-transparent hover:border-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            form="examForm"
                            type="submit"
                            disabled={!hasAnyContent}
                            className={`px-14 py-5 rounded-[28px] transition-all flex items-center gap-3 text-sm uppercase tracking-[0.23em] font-black ${
                                hasAnyContent 
                                    ? 'bg-unihub-teal hover:bg-[#0d857a] text-white shadow-2xl shadow-unihub-teal/30 active:scale-[0.98]' 
                                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            }`}
                        >
                            <Save className="w-5 h-5" />
                            {editingExam ? 'Apply Changes' : 'Publish Arena'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnExam_ExamForm;
