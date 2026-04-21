import { Trash2, Trash, Plus, Sparkles, BookOpen, AlertCircle } from 'lucide-react';

const OnExam_QuestionBank = ({ questions = [], onUpdate, onRemove, onAddManual }) => {
    return (
        <div className="space-y-8 animate-in slide-in-from-top-4 fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-unihub-teal/10 flex items-center justify-center text-unihub-teal font-black text-xs uppercase">03</div>
                    <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest leading-none">Question Bank Builder</h4>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-black p-2 rounded-xl bg-unihub-teal/10 text-unihub-teal border border-unihub-teal/20 uppercase tracking-widest px-4 shadow-sm">
                        <BookOpen className="w-3 h-3" /> {questions.length} Items Added
                    </div>
                    <button
                        type="button"
                        onClick={onAddManual}
                        className="flex items-center gap-2 text-[10px] font-black text-unihub-teal uppercase tracking-widest hover:underline transition-all"
                    >
                        <Plus className="w-3 h-3" /> Manually Add
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {questions.map((q, qIdx) => (
                    <div key={qIdx} className="group p-8 rounded-[40px] bg-white border border-gray-100 hover:border-unihub-teal/30 transition-all hover:shadow-2xl hover:shadow-unihub-teal/5">
                        <div className="flex justify-between items-start gap-4 mb-8">
                            <div className="flex items-center gap-4 flex-1">
                                <span className="w-10 h-10 rounded-2xl bg-unihub-teal/10 flex items-center justify-center text-[10px] font-black text-unihub-teal group-hover:bg-unihub-teal group-hover:text-white transition-all shadow-sm">
                                    {qIdx + 1}
                                </span>
                                <input
                                    type="text"
                                    value={q.question}
                                    onChange={(e) => onUpdate(qIdx, 'question', e.target.value)}
                                    className="flex-1 bg-transparent border-none text-base font-black text-gray-700 outline-none focus:text-unihub-teal transition-colors"
                                    placeholder="Type your question here..."
                                />
                            </div>
                            <button 
                                type="button" 
                                onClick={() => onRemove(qIdx)}
                                className="p-3 text-gray-300 hover:text-unihub-coral transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-unihub-coral/20 rounded-2xl"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="relative group/opt">
                                    <div className={`flex items-center gap-4 p-5 rounded-[24px] border-2 transition-all ${
                                        q.answer === opt && opt !== '' 
                                            ? 'border-unihub-teal bg-unihub-teal/10' 
                                            : 'border-gray-50 focus-within:border-unihub-teal/30'
                                    }`}>
                                        <div 
                                            onClick={() => onUpdate(qIdx, 'answer', opt)}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] transition-all cursor-pointer ${
                                                q.answer === opt && opt !== '' 
                                                    ? 'bg-unihub-teal text-white shadow-lg shadow-unihub-teal/20' 
                                                    : 'bg-white text-gray-300 group-hover/opt:bg-gray-100 border border-gray-100'
                                            }`}
                                        >
                                            {String.fromCharCode(65 + oIdx)}
                                        </div>
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => {
                                                const oldVal = opt;
                                                const newVal = e.target.value;
                                                const updatedOptions = [...q.options];
                                                updatedOptions[oIdx] = newVal;
                                                onUpdate(qIdx, 'options', updatedOptions);
                                                if (q.answer === oldVal) onUpdate(qIdx, 'answer', newVal);
                                            }}
                                            className="flex-1 bg-transparent border-none text-sm font-black text-gray-600 outline-none"
                                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}...`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <Sparkles className="w-3 h-3 text-unihub-teal" /> Click Index (A-D) to select the correct answer
                        </div>
                    </div>
                ))}

                {questions.length === 0 && (
                    <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-[40px] bg-gray-50/30">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-gray-300 mx-auto mb-6 shadow-sm border border-gray-100">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h5 className="text-gray-400 font-black text-sm tracking-widest uppercase mb-2">No Questions Selected</h5>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest max-w-[240px] mx-auto opacity-60">
                            Choose questions from the generated list above or add one manually to publish.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnExam_QuestionBank;
