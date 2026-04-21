import { 
    CheckCircle, 
    XCircle, 
    ArrowRight, 
    TrendingUp, 
    TrendingDown,
    Zap
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AutoGrading = ({ result, setActiveSection, setPracticeConfig }) => {
    if (!result) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white/50 rounded-3xl text-center h-[400px]">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">No Exam Results Yet</h2>
                <p className="text-gray-500 max-w-sm mb-6">Complete a practice exam to see your instant automated grading and performance feedback.</p>
                <button 
                    onClick={() => setActiveSection('practice')}
                    className="bg-unihub-teal text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0d857a] transition-colors"
                >
                    Take An Exam
                </button>
            </div>
        );
    }

    const { score, correctCount, total, details, examTitle, practiceConfig } = result;

    const data = [
        { name: 'Correct', value: correctCount, color: '#14B8A6' },
        { name: 'Incorrect', value: total - correctCount, color: '#FF6B6B' }
    ];

    let message = "Good effort!";
    if (score >= 90) message = "Outstanding Performance!";
    else if (score >= 75) message = "Great Job!";
    else if (score < 50) message = "Keep Practicing!";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Summary Panel */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-soft border border-white text-center">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{examTitle}</h2>
                    <p className="text-gray-800 font-bold mb-8">Exam Results</p>
                    
                    <div className="relative w-48 h-48 mx-auto mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-gray-800">{score}%</span>
                            <span className="text-xs font-bold text-gray-400">SCORE</span>
                        </div>
                    </div>

                    <h3 className="text-2xl font-black text-unihub-teal mb-2">{message}</h3>
                    <p className="text-sm font-medium text-gray-500">
                        You answered {correctCount} out of {total} questions correctly.
                    </p>

                    <div className="flex flex-col gap-3 mt-8">
                        {practiceConfig && (
                            <button 
                                onClick={() => {
                                    setPracticeConfig({ ...practiceConfig, timestamp: Date.now() });
                                    setActiveSection('practice');
                                }}
                                className="w-full flex items-center justify-center gap-2 bg-unihub-teal text-white hover:bg-[#0d857a] font-bold py-3 px-4 rounded-xl transition-colors shadow-md"
                            >
                                Retry Practice <TrendingUp className="w-4 h-4" />
                            </button>
                        )}
                        <button 
                            onClick={() => setActiveSection('analytics')}
                            className="w-full flex items-center justify-center gap-2 bg-unihub-teal/10 text-unihub-teal hover:bg-unihub-teal/20 font-bold py-3 px-4 rounded-xl transition-colors"
                        >
                            View Detailed Analytics <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-unihub-teal to-[#0d857a] rounded-3xl p-6 text-white shadow-card">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5" /> 
                        <h3 className="font-bold text-lg">AI Feedback</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                            <div className="flex items-center gap-2 text-sm font-bold text-white mb-1">
                                <TrendingUp className="w-4 h-4" /> Strengths
                            </div>
                            <p className="text-sm">Excellent understanding of core concepts. Speed was above average.</p>
                        </div>
                        <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-sm mt-2">
                            <div className="flex items-center gap-2 text-sm font-bold text-unihub-yellow mb-1">
                                <TrendingDown className="w-4 h-4" /> Weaknesses
                            </div>
                            <p className="text-sm">Struggled with scenario-based questions. Needs review on advanced topics.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Detailed Questions Review */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-soft border border-white flex flex-col h-[calc(100vh-250px)] min-h-[600px]">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Answer Review</h2>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1 text-sm font-bold text-unihub-teal"><CheckCircle className="w-4 h-4"/> Correct ({correctCount})</div>
                        <div className="flex items-center gap-1 text-sm font-bold text-unihub-coral"><XCircle className="w-4 h-4"/> Incorrect ({total - correctCount})</div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                    {details.map((q, idx) => {
                        const isSkipped = q.userAnswer === undefined;
                        return (
                            <div key={idx} className={`p-5 rounded-2xl border-l-4 ${q.isCorrect ? 'border-l-unihub-teal bg-unihub-teal/5' : 'border-l-unihub-coral bg-unihub-coral/5'} border border-gray-100`}>
                                <div className="flex items-start gap-3">
                                    <div className={`mt-0.5 ${q.isCorrect ? 'text-unihub-teal' : 'text-unihub-coral'}`}>
                                        {q.isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800 mb-3"><span className="text-gray-500 mr-2">{idx + 1}.</span>{q.question}</p>
                                        
                                        <div className="space-y-2 mt-4 text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <span className="w-20 text-gray-500">Your Answer:</span>
                                                <span className={`px-3 py-1 rounded-lg ${q.isCorrect ? 'bg-unihub-teal/10 text-unihub-teal' : 'bg-unihub-coral/10 text-unihub-coral'}`}>
                                                    {isSkipped ? 'Skipped' : q.userAnswer}
                                                </span>
                                            </div>
                                            {!q.isCorrect && (
                                                <div className="flex items-center gap-2">
                                                    <span className="w-20 text-gray-500">Correct:</span>
                                                    <span className="px-3 py-1 bg-unihub-teal/10 text-unihub-teal rounded-lg">
                                                        {q.answer}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default AutoGrading;
