import { useState, useEffect } from 'react';
import { 
    Clock, 
    Play, 
    AlertCircle,
    CheckCircle2,
    Grid,
    ChevronLeft,
    ChevronRight,
    Flag
} from 'lucide-react';

const mockExams = [
    { id: 1, subject: 'Computer Networks', duration: 45, difficulty: 'Hard', questions: 30 },
    { id: 2, subject: 'Software Engineering', duration: 30, difficulty: 'Medium', questions: 20 },
    { id: 3, subject: 'Database Systems', duration: 60, difficulty: 'Easy', questions: 50 },
];

const generateMockQuestions = (count, topic) => Array.from({ length: count }).map((_, i) => ({
    id: i + 1,
    text: `Sample question ${i + 1} for ${topic || 'the selected subject'}. What is the correct answer among the following options?`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correct: Math.floor(Math.random() * 4) // For auto-grading later
}));

const PracticeExams = ({ setActiveSection, setLatestExamResult, practiceConfig }) => {
    const [activeExam, setActiveExam] = useState(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flags, setFlags] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [sessionQuestions, setSessionQuestions] = useState([]);

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
        setActiveExam(exam);
        setTimeLeft(exam.duration * 60); // minutes to seconds
        setCurrentQ(0);
        setAnswers({});
        setFlags({});
        setSessionQuestions(generateMockQuestions(exam.questions, exam.subject));
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
                subject: title, 
                duration: 10, 
                difficulty: 'Mixed', 
                questions: 5 // mock amount for custom practice
            };
            startExam(exam);
        }
    }, [practiceConfig]);

    const handleSelectOption = (qId, optionIdx) => {
        setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    };

    const toggleFlag = (qId) => {
        setFlags(prev => ({ ...prev, [qId]: !prev[qId] }));
    };

    const handleSubmit = () => {
        // Evaluate
        let correctCount = 0;
        const evaluated = sessionQuestions.map(q => {
            const isCorrect = answers[q.id] === q.correct;
            if (isCorrect) correctCount++;
            return {
                ...q,
                userAnswer: answers[q.id],
                isCorrect
            };
        });

        const score = Math.round((correctCount / sessionQuestions.length) * 100);
        
        setLatestExamResult({
            score,
            correctCount,
            total: sessionQuestions.length,
            details: evaluated,
            examTitle: activeExam.subject,
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
                <div className="flex items-center justify-between bg-white/50 p-4 rounded-2xl">
                    <h2 className="text-xl font-bold text-gray-800">Available Practice Sessions</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockExams.map(exam => (
                        <div key={exam.id} className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white shadow-soft hover:shadow-card transition-all flex flex-col justify-between h-56 group">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        exam.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                        exam.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {exam.difficulty}
                                    </span>
                                    <div className="flex items-center text-gray-500 text-xs font-bold gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                                        <Clock className="w-3 h-3" /> {exam.duration}m
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-gray-800 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">{exam.subject}</h3>
                                <p className="text-sm text-gray-500 font-medium">{exam.questions} Questions</p>
                            </div>
                            
                            <button 
                                onClick={() => startExam(exam)}
                                className="w-full mt-4 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white font-bold py-3 rounded-2xl transition-colors flex items-center justify-center gap-2"
                            >
                                <Play className="w-4 h-4" /> Start Session
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const q = sessionQuestions[currentQ];
    const isAnswered = answers[q.id] !== undefined;
    const progressPercent = (Object.keys(answers).length / sessionQuestions.length) * 100;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-250px)] min-h-[600px]">
            {/* Left Sidebar: Navigator */}
            <div className="bg-white/80 backdrop-blur-md border border-white rounded-3xl p-6 shadow-soft flex flex-col">
                <div className="mb-6 space-y-4">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-indigo-100 relative">
                            <span className="text-2xl font-black text-indigo-600">{formatTime(timeLeft)}</span>
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle 
                                    cx="50" cy="50" r="46" fill="none" stroke="#4f46e5" strokeWidth="4" 
                                    strokeDasharray="289" strokeDashoffset={289 - (289 * (timeLeft / (activeExam.duration * 60)))}
                                    className="transition-all duration-1000 linear"
                                />
                            </svg>
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                            <span>Progress</span>
                            <span>{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                    <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-700">
                        <Grid className="w-4 h-4" /> Question Navigator
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {sessionQuestions.map((mq, idx) => (
                            <button
                                key={mq.id}
                                onClick={() => setCurrentQ(idx)}
                                className={`h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-all relative ${
                                    currentQ === idx 
                                        ? 'ring-2 ring-indigo-500 bg-white text-indigo-600' 
                                        : answers[mq.id] !== undefined
                                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {idx + 1}
                                {flags[mq.id] && <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full border-2 border-white"></div>}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4 mt-auto">
                    <button 
                        onClick={handleSubmit} 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl transition-all shadow-md active:scale-95"
                    >
                        Submit Exam
                    </button>
                </div>
            </div>

            {/* Main MCQ Area */}
            <div className="lg:col-span-3 bg-white/80 backdrop-blur-md border border-white rounded-3xl p-8 shadow-soft flex flex-col relative overflow-hidden">
                <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-bold text-gray-800">Question {currentQ + 1} of {sessionQuestions.length}</h3>
                    <button 
                        onClick={() => toggleFlag(q.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                            flags[q.id] ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                        <Flag className="w-4 h-4" />
                        {flags[q.id] ? 'Flagged for Review' : 'Flag Question'}
                    </button>
                </div>

                <div className="flex-1">
                    <p className="text-lg text-gray-700 font-medium mb-8 leading-relaxed">
                        {q.text}
                    </p>

                    <div className="space-y-4">
                        {q.options.map((opt, idx) => {
                            const isSelected = answers[q.id] === idx;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectOption(q.id, idx)}
                                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                                        isSelected 
                                            ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
                                            : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className={`font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>{opt}</span>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                        isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 group-hover:border-indigo-300'
                                    }`}>
                                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Nav */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                    <button 
                        onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
                        disabled={currentQ === 0}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" /> Previous
                    </button>
                    
                    {currentQ < sessionQuestions.length - 1 ? (
                        <button 
                            onClick={() => setCurrentQ(prev => Math.min(sessionQuestions.length - 1, prev + 1))}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            Next <ChevronRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white bg-green-500 hover:bg-green-600 transition-colors shadow-sm"
                        >
                            Finish <CheckCircle2 className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PracticeExams;
