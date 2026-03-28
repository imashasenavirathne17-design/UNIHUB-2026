import { useState } from 'react';
import { 
    Search, 
    Filter, 
    BookOpen, 
    PlayCircle,
    CheckCircle2
} from 'lucide-react';

const mockQuestions = [
    { id: 1, subject: 'Computer Networks', topic: 'OSI Model', difficulty: 'Easy', text: 'Which layer of the OSI model is responsible for routing?' },
    { id: 2, subject: 'Computer Networks', topic: 'TCP/IP', difficulty: 'Medium', text: 'What is the purpose of the TCP 3-way handshake?' },
    { id: 3, subject: 'Database Systems', topic: 'SQL', difficulty: 'Hard', text: 'Write a query to find the second highest salary.' },
    { id: 4, subject: 'Software Engineering', topic: 'Agile', difficulty: 'Easy', text: 'Which of the following is an Agile manifesto principle?' },
    { id: 5, subject: 'Operating Systems', topic: 'Memory Management', difficulty: 'Medium', text: 'Explain the difference between paging and segmentation.' },
    { id: 6, subject: 'Data Structures', topic: 'Trees', difficulty: 'Hard', text: 'What is the time complexity of searching in a balanced BST?' },
];

const QuestionBank = ({ setActiveSection, setPracticeConfig }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('All');
    
    const subjects = ['All', ...new Set(mockQuestions.map(q => q.subject))];

    const filteredQs = mockQuestions.filter(q => {
        const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubject = selectedSubject === 'All' || q.subject === selectedSubject;
        return matchesSearch && matchesSubject;
    });

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Search and Filter */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-soft border border-white flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search questions by keyword..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium text-gray-700"
                    />
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Filter className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select 
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="pl-12 pr-10 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:border-indigo-500 outline-none transition-all font-bold text-gray-700 appearance-none min-w-[160px]"
                        >
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Top Bar Action */}
            <div className="flex items-center justify-between px-2">
                <p className="font-bold text-gray-600">Showing {filteredQs.length} Questions</p>
                <button 
                    onClick={() => {
                        setPracticeConfig({ subject: selectedSubject, timestamp: Date.now() });
                        setActiveSection('practice');
                    }}
                    className="flex items-center gap-2 bg-indigo-100 text-indigo-700 font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-200 transition-colors cursor-pointer"
                >
                    <BookOpen className="w-4 h-4" /> Practice Selected Subject
                </button>
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredQs.map(q => (
                    <div key={q.id} className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-card hover:border-indigo-200 transition-all group flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                q.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                                {q.difficulty}
                            </span>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{q.subject}</span>
                        </div>
                        
                        <p className="text-gray-800 font-medium leading-relaxed mb-6 flex-1">
                            {q.text}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                            <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-lg">{q.topic}</span>
                            <button 
                                onClick={() => {
                                    setPracticeConfig({ topic: q.topic, subject: q.subject, timestamp: Date.now() });
                                    setActiveSection('practice');
                                }}
                                className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors group"
                            >
                                <PlayCircle className="w-5 h-5" /> Practice Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredQs.length === 0 && (
                <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-600 mb-1">No questions found</h3>
                    <p className="text-sm text-gray-400">Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
};

export default QuestionBank;
