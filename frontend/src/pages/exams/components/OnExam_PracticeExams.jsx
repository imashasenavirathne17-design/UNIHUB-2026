import { useState, useEffect, useContext } from 'react';
import { 
    Clock, 
    Play, 
    AlertCircle,
    CheckCircle2,
    Grid,
    ChevronLeft,
    ChevronRight,
    Flag,
    Plus,
    Edit3,
    Trash2,
    Loader2
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AuthContext } from '../../../context/AuthContext';
import OnExam_ExamForm from './OnExam_ExamForm';

const API = 'http://localhost:5000/api/onexam';

// generateMockQuestions removed - using real questions from DB
const PracticeExams = ({ setActiveSection, setLatestExamResult, practiceConfig }) => {
    const { user } = useContext(AuthContext);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeExam, setActiveExam] = useState(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flags, setFlags] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [sessionQuestions, setSessionQuestions] = useState([]);

    // Management State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingExam, setEditingExam] = useState(null);

    const isLecturer = user?.role === 'lecturer' || user?.role === 'admin';
    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    const fetchExams = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/all`, config);
            setExams(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    // Timer logic
    useEffect(() => {
        let timer;
        if (activeExam && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && activeExam) {
            handleSubmit();
        }
        return () => clearInterval(timer);
    }, [activeExam, timeLeft]);

    const startExam = (exam) => {
        const questionsToUse = exam.questions && exam.questions.length > 0 
            ? exam.questions 
            : [];
            
        if (questionsToUse.length === 0) {
            Swal.fire({
                title: 'Empty Session',
                text: 'This exam has no questions generated yet. Please contact the lecturer.',
                icon: 'info',
                confirmButtonColor: '#14B8A6'
            });
            return;
        }

        setActiveExam(exam);
        setTimeLeft(exam.duration * 60); // minutes to seconds
        setCurrentQ(0);
        setAnswers({});
        setFlags({});
        setSessionQuestions(questionsToUse);
    };

    // Auto-start exam if practiceConfig is provided
    useEffect(() => {
        if (practiceConfig) {
            const title = practiceConfig.topic 
                ? `${practiceConfig.topic} Practice` 
                : practiceConfig.subject === 'All' 
                    ? 'General Practice' 
                    : `${practiceConfig.subject} Practice`;
                    
            const exam = { 
                id: 'custom-' + practiceConfig.timestamp, 
                title: title, 
                duration: 10, 
                difficulty: 'Mixed', 
                questions: [] // Mock handled by specialized logic if needed
            };
            // For general practice via config, we'd ideally fetch random ones or keep mock
            // But since we are moving to AI, we'll suggest using a generated exam
            Swal.fire({
                title: 'AI Upgrade',
                text: 'Custom practice is being upgraded to AI sessions. Please select a generated exam from the list below.',
                icon: 'info',
                confirmButtonColor: '#14B8A6'
            });
            setActiveSection('practice'); 
        }
    }, [practiceConfig]);

    const handleSaveExam = async (formData) => {
        try {
            if (editingExam) {
                await axios.put(`${API}/update/${editingExam._id}`, formData, config);
            } else {
                await axios.post(`${API}/create`, formData, config);
            }
            setIsFormOpen(false);
            setEditingExam(null);
            fetchExams();
            
            Swal.fire({
                title: editingExam ? 'Updated!' : 'Created!',
                text: editingExam ? 'Exam modification synced successfully.' : 'New practice node initialized.',
                icon: 'success',
                confirmButtonColor: '#14B8A6',
                background: '#ffffff',
                color: '#1e293b'
            });
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to synchronize exam data.',
                icon: 'error',
                confirmButtonColor: '#FF6B6B'
            });
            console.error(error);
        }
    };

    const handleDeleteExam = async (id) => {
        const result = await Swal.fire({
            title: 'Terminate Node?',
            text: 'This action will permanently delete the practice session.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#14B8A6',
            cancelButtonColor: '#FF6B6B',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel',
            background: '#ffffff',
            color: '#1e293b'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API}/delete/${id}`, config);
                fetchExams();
                Swal.fire({
                    title: 'Deleted!',
                    text: 'The session has been removed from the repository.',
                    icon: 'success',
                    confirmButtonColor: '#14B8A6'
                });
            } catch (error) {
                Swal.fire({
                    title: 'Deletion Failed!',
                    text: 'Unable to remove the session at this time.',
                    icon: 'error',
                    confirmButtonColor: '#FF6B6B'
                });
                console.error(error);
            }
        }
    };

    const handleSelectOption = (qId, optionIdx) => {
        setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    };

    const toggleFlag = (qId) => {
        setFlags(prev => ({ ...prev, [qId]: !prev[qId] }));
    };
    const handleSubmit = () => {
        // Evaluate based on string comparison of answer
        let correctCount = 0;
        const evaluated = sessionQuestions.map((q, idx) => {
            const userChoiceText = q.options[answers[idx]];
            const isCorrect = userChoiceText === q.answer;
            if (isCorrect) correctCount++;
            return {
                ...q,
                userAnswer: userChoiceText,
                isCorrect
            };
        });

        const score = Math.round((correctCount / sessionQuestions.length) * 100);
        
        setLatestExamResult({
            score,
            correctCount,
            total: sessionQuestions.length,
            details: evaluated,
            examTitle: activeExam.title || activeExam.subject,
            practiceConfig
        });
        
        setActiveSection('grading');
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (!activeExam) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between bg-white/50 p-4 rounded-3xl border border-white/50 backdrop-blur-md">
                    <div>
                        <h2 className="text-xl font-black text-gray-800 tracking-tight">Available Practice Sessions</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
                            {exams.length} active sessions found
                        </p>
                    </div>
                    {isLecturer && (
                        <button 
                            onClick={() => { setEditingExam(null); setIsFormOpen(true); }}
                            className="bg-unihub-teal hover:bg-[#0d857a] text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg hover:shadow-unihub-teal/20 active:scale-[0.98] flex items-center gap-2 text-sm"
                        >
                            <Plus className="w-4 h-4" /> Create Practice Exam
                        </button>
                    )}
                </div>
                
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-unihub-teal" />
                        <p className="font-bold text-sm tracking-widest uppercase">Fetching Sessions...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exams.map(exam => (
                            <div key={exam._id} className="bg-white/80 backdrop-blur-md rounded-[40px] p-8 border border-white shadow-soft hover:shadow-card transition-all flex flex-col justify-between group min-h-[300px] relative overflow-hidden">
                                {isLecturer && (
                                    <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => { setEditingExam(exam); setIsFormOpen(true); }}
                                            className="p-2.5 rounded-2xl bg-white border border-gray-100 text-unihub-teal hover:bg-unihub-teal/10 hover:border-unihub-teal/20 transition-all shadow-sm"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteExam(exam._id)}
                                            className="p-2.5 rounded-2xl bg-white border border-gray-100 text-unihub-coral hover:bg-unihub-coral/10 hover:border-unihub-coral/20 transition-all shadow-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-black tracking-[0.15em] ${
                                            exam.difficulty === 'Easy' ? 'bg-unihub-teal/10 text-unihub-teal' :
                                            exam.difficulty === 'Medium' ? 'bg-unihub-yellow/10 text-unihub-yellow' :
                                            'bg-unihub-coral/10 text-unihub-coral'
                                        }`}>
                                            {exam.difficulty}
                                        </span>
                                        <div className="flex items-center text-gray-400 text-[10px] font-black uppercase tracking-widest gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                                            <Clock className="w-3 h-3" strokeWidth={3} /> {exam.duration}m
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-800 leading-[1.2] mb-3 group-hover:text-unihub-teal transition-colors tracking-tight uppercase">{exam.title}</h3>
                                    <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mb-1">{exam.questions?.length || 0} Questions Total</p>
                                    {exam.createdBy?.name && (
                                        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                                            By Lect. {exam.createdBy.name.split(' ')[0]}
                                        </p>
                                    )}
                                </div>
                                
                                <button 
                                    onClick={() => startExam(exam)}
                                    className="w-full mt-8 bg-unihub-teal/10 hover:bg-unihub-teal text-unihub-teal hover:text-white font-black py-4 rounded-3xl transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98] shadow-sm"
                                >
                                    <Play className="w-4 h-4 fill-current" /> {"Start Practice Session".split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                                </button>
                            </div>
                        ))}

                        {exams.length === 0 && (
                            <div className="lg:col-span-3 py-20 text-center bg-white/40 border border-white border-dashed rounded-[40px]">
                                <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-400 font-bold text-sm tracking-widest uppercase">No sessions currently available</p>
                            </div>
                        )}
                    </div>
                )}

                <OnExam_ExamForm 
                    open={isFormOpen} 
                    onClose={() => setIsFormOpen(false)} 
                    onSave={handleSaveExam}
                    editingExam={editingExam}
                />
            </div>
        );
    }

    const q = sessionQuestions[currentQ];
    const isAnswered = answers[currentQ] !== undefined;
    const progressPercent = (Object.keys(answers).length / sessionQuestions.length) * 100;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-250px)] min-h-[600px]">
            {/* Navigator - Same as before but with slightly refined UI */}
            <div className="bg-white/80 backdrop-blur-md border border-white rounded-[40px] p-8 shadow-soft flex flex-col">
                <div className="mb-10 space-y-6">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-28 h-28 rounded-full border-[6px] border-unihub-teal/10 relative">
                            <span className="text-3xl font-black text-unihub-teal tracking-tighter">{formatTime(timeLeft)}</span>
                            <svg className="absolute inset-[-6px] w-[calc(100%+12px)] h-[calc(100%+12px)] -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                                <circle 
                                    cx="50" cy="50" r="47" fill="none" stroke="#14B8A6" strokeWidth="6" 
                                    strokeDasharray="295" strokeDashoffset={295 - (295 * (timeLeft / (activeExam.duration * 60)))}
                                    className="transition-all duration-1000 linear"
                                />
                            </svg>
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                            <span>Completion</span>
                            <span>{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-unihub-teal h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(20,184,166,0.3)]" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex items-center gap-2 mb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Grid className="w-3 h-3 underline decoration-unihub-teal underline-offset-4" /> Navigator
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        {sessionQuestions.map((mq, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentQ(idx)}
                                className={`h-11 rounded-2xl font-black text-xs flex items-center justify-center transition-all relative ${
                                    currentQ === idx 
                                        ? 'bg-unihub-teal text-white shadow-[0_8px_16px_rgba(20,184,166,0.3)] scale-105 z-10' 
                                        : answers[idx] !== undefined
                                            ? 'bg-unihub-teal/10 text-unihub-teal border-2 border-unihub-teal/20'
                                            : 'bg-gray-50 text-gray-300 hover:bg-gray-100 hover:text-gray-500'
                                }`}
                            >
                                {idx + 1}
                                {flags[idx] && <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-unihub-yellow rounded-full border-2 border-white shadow-sm"></div>}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-8 mt-auto">
                    <button 
                        onClick={handleSubmit} 
                        className="w-full bg-unihub-teal hover:bg-[#0d857a] text-white font-black py-4 rounded-[24px] transition-all shadow-xl hover:shadow-unihub-teal/20 active:scale-95 text-sm uppercase tracking-widest"
                    >
                        Submit Session
                    </button>
                </div>
            </div>

            {/* MCQ Area - Same as before but with premium styling */}
            <div className="lg:col-span-3 bg-white/80 backdrop-blur-md border border-white rounded-[40px] p-10 shadow-soft flex flex-col relative overflow-hidden">
                <div className="flex items-center justify-between mb-10 border-b border-gray-100 pb-6">
                    <div>
                        <h3 className="text-2xl font-black text-gray-800 tracking-tight">Question {currentQ + 1} of {sessionQuestions.length}</h3>
                        <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase mt-1">Single Choice Selection</p>
                    </div>
                    <button 
                        onClick={() => toggleFlag(currentQ)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            flags[currentQ] ? 'bg-unihub-yellow/10 text-unihub-yellow border border-unihub-yellow/20 shadow-sm' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                        }`}
                    >
                        <Flag className="w-3 h-3" />
                        {flags[currentQ] ? 'Flagged For Review' : 'Flag Question'}
                    </button>
                </div>

                <div className="flex-1 max-w-4xl overflow-y-auto pr-4 custom-scrollbar">
                    <p className="text-lg text-gray-800 font-bold mb-8 leading-[1.5]">
                        {q.question}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {q.options.map((opt, idx) => {
                            const isSelected = answers[currentQ] === idx;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectOption(currentQ, idx)}
                                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between group relative overflow-hidden ${
                                        isSelected 
                                            ? 'border-unihub-teal bg-unihub-teal/10 shadow-soft' 
                                            : 'border-gray-50 hover:border-unihub-teal/30 hover:bg-gray-50/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                                            isSelected ? 'bg-unihub-teal text-white shadow-lg' : 'bg-gray-100 text-gray-400 group-hover:bg-unihub-teal/10 group-hover:text-unihub-teal'
                                        }`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className={`font-bold text-sm transition-colors ${isSelected ? 'text-unihub-teal' : 'text-gray-600'}`}>{opt}</span>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                        isSelected ? 'border-unihub-teal bg-unihub-teal shadow-sm' : 'border-gray-200 group-hover:border-unihub-teal/30'
                                    }`}>
                                        {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Nav - Fixed at bottom */}
                <div className="flex justify-between items-center mt-10 pt-8 border-t border-gray-100 bg-white/20 backdrop-blur-sm">
                    <button 
                        onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
                        disabled={currentQ === 0}
                        className="flex items-center gap-2 px-8 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest text-gray-400 bg-gray-50 hover:bg-gray-100 disabled:opacity-30 transition-all border border-transparent hover:border-gray-200"
                    >
                        <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    
                    {currentQ < sessionQuestions.length - 1 ? (
                        <button 
                            onClick={() => setCurrentQ(prev => Math.min(sessionQuestions.length - 1, prev + 1))}
                            className="flex items-center gap-2 px-10 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] text-white bg-unihub-teal hover:bg-[#0d857a] transition-all shadow-xl hover:shadow-unihub-teal/30"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit}
                            className="flex items-center gap-2 px-10 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] text-white bg-unihub-teal hover:bg-[#0d857a] transition-all shadow-xl hover:shadow-unihub-teal/30"
                        >
                            Finish Session <CheckCircle2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PracticeExams;
