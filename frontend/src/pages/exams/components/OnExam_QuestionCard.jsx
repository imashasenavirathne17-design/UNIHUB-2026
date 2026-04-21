import { CheckSquare, Square, CheckCircle2 } from 'lucide-react';

const OnExam_QuestionCard = ({ question, isSelected, onToggle, showCorrect = true }) => {
    return (
        <div 
            onClick={onToggle}
            className={`group p-6 rounded-[32px] border-2 transition-all cursor-pointer relative overflow-hidden ${
                isSelected 
                    ? 'border-unihub-teal bg-unihub-teal/5' 
                    : 'border-gray-50 bg-white hover:border-gray-200'
            }`}
        >
            <div className="flex items-start gap-4">
                <div className={`mt-1 transition-colors ${isSelected ? 'text-unihub-teal' : 'text-gray-300'}`}>
                    {isSelected ? <CheckSquare className="w-5 h-5 fill-unihub-teal/5" /> : <Square className="w-5 h-5" />}
                </div>
                
                <div className="flex-1 space-y-4">
                    <h5 className="text-sm font-black text-gray-800 leading-relaxed pr-8">{question.question}</h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {question.options.map((opt, idx) => {
                            const isCorrect = opt === question.answer;
                            return (
                                <div 
                                    key={idx} 
                                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between ${
                                        isCorrect && showCorrect
                                            ? 'bg-unihub-teal/10 text-unihub-teal border border-unihub-teal/20' 
                                            : 'bg-gray-50 text-gray-500 border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="opacity-40">{String.fromCharCode(65 + idx)}.</span>
                                        {opt}
                                    </div>
                                    {isCorrect && showCorrect && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {isSelected && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-unihub-teal/10 rounded-bl-[40px] flex items-start justify-end p-4">
                    <div className="w-2 h-2 rounded-full bg-unihub-teal" />
                </div>
            )}
        </div>
    );
};

export default OnExam_QuestionCard;
