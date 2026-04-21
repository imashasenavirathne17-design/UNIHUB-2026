import { Plus, CheckSquare, Square, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import OnExam_QuestionCard from './OnExam_QuestionCard';

const OnExam_GeneratedList = ({ 
    questions = [], 
    selectedIds = [], 
    onToggle, 
    onSelectAll, 
    onAddSelected, 
    onClearAll 
}) => {
    if (!questions || questions.length === 0) return null;

    const allSelected = questions.length > 0 && selectedIds.length === questions.length;

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 fade-in h-96 overflow-y-auto pr-4 custom-scrollbar p-6 bg-white/40 border border-unihub-teal/20 border-dashed rounded-[40px]">
            <div className="flex items-center justify-between sticky top-0 z-[10] bg-white/90 backdrop-blur-xl p-4 rounded-3xl border border-unihub-teal/10 shadow-sm mb-6">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-5 h-5 text-unihub-teal fill-unihub-teal/10" />
                        <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest leading-none">AI Generated Preview</h4>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{questions.length} candidates found in content</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        type="button" 
                        onClick={onSelectAll}
                        className="flex items-center gap-2 text-[10px] font-black text-unihub-teal uppercase tracking-widest hover:text-[#0d857a] transition-all border border-transparent hover:border-unihub-teal/10 p-2 rounded-xl"
                    >
                        {allSelected ? <CheckSquare className="w-4 h-4 fill-unihub-teal/10" /> : <Square className="w-4 h-4" />}
                        {allSelected ? 'Deselect All' : 'Select All'}
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={onAddSelected}
                        disabled={selectedIds.length === 0}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${
                            selectedIds.length > 0 
                                ? 'bg-unihub-teal text-white shadow-unihub-teal/10 animate-pulse-once' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                        }`}
                    >
                        <Plus className="w-4 h-4" /> Add {selectedIds.length || ''} Selected
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions.map((q, idx) => (
                    <OnExam_QuestionCard 
                        key={idx}
                        question={q}
                        isSelected={selectedIds.includes(idx)}
                        onToggle={() => onToggle(idx)}
                    />
                ))}
            </div>

            <div className="flex items-center justify-center pt-10">
                <button 
                    type="button" 
                    onClick={onClearAll}
                    className="text-[10px] font-black text-unihub-coral/60 uppercase tracking-widest hover:text-unihub-coral hover:underline transition-all"
                >
                    Clear All Generated Previews
                </button>
            </div>
        </div>
    );
};

export default OnExam_GeneratedList;
