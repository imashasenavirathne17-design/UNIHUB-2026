import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { 
    LayoutDashboard, 
    BookOpen, 
    CheckCircle, 
    Database, 
    BarChart3, 
    Settings 
} from 'lucide-react';

import ExamsDashboard from './components/OnExam_ExamsDashboard';
import PracticeExams from './components/OnExam_PracticeExams';
import AutoGrading from './components/OnExam_AutoGrading';
import QuestionBank from './components/OnExam_QuestionBank';
import PerformanceAnalytics from './components/OnExam_PerformanceAnalytics';
import AdminView from './components/OnExam_AdminView';

const ExamsModule = () => {
    const { user } = useContext(AuthContext);
    
    // Manage active sub-section
    const [activeSection, setActiveSection] = useState('dashboard');
    
    // For passing practice exam grading results
    const [latestExamResult, setLatestExamResult] = useState(null);
    
    // config to pass when 'Practice Now' is clicked in Question Bank
    const [practiceConfig, setPracticeConfig] = useState(null);

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['student', 'lecturer', 'admin'] },
        { id: 'practice', label: 'Practice Exams', icon: BookOpen, roles: ['student', 'lecturer', 'admin'] },
        { id: 'grading', label: 'Auto Grading', icon: CheckCircle, roles: ['student', 'lecturer', 'admin'] },
        { id: 'qbank', label: 'Question Bank', icon: Database, roles: ['student', 'lecturer', 'admin'] },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['student', 'lecturer', 'admin'] },
        { id: 'admin', label: 'Lecturer/Admin', icon: Settings, roles: ['lecturer', 'admin'] },
    ];

    const filteredTabs = tabs.filter(t => t.roles.includes(user?.role || 'student'));

    const sectionVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-16">
            {/* Module Hero */}
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl bg-gradient-to-br from-unihub-teal to-[#0d857a]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-white opacity-10 blur-[120px] rounded-full mix-blend-overlay animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white opacity-5 blur-[100px] rounded-full" />
                    <BookOpen className="absolute -right-16 -top-10 w-72 h-72 text-white opacity-10 rotate-12" strokeWidth={0.5} />
                </div>

                <div className="px-8 md:px-16 py-14 md:py-20 relative z-10">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[11px] font-bold text-white tracking-[0.2em] shadow-xl">
                            <Database className="w-4 h-4 text-unihub-yellow" /> Intel Engine v2.0
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter font-display">
                            Exam Mastery <span className="text-unihub-yellow">Practice</span>.
                        </h1>
                        <p className="text-white/80 font-medium text-base max-w-2xl leading-relaxed italic opacity-90">
                            {"Master your subjects with timed MCQ practice, instant feedback, and detailed performance analytics.".split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-3 mt-10 overflow-x-auto pb-2 no-scrollbar">
                        {filteredTabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeSection === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveSection(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap font-display border ${
                                        isActive
                                            ? 'bg-white text-unihub-teal border-white shadow-lg scale-[1.02]'
                                            : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Dynamic Content Area */}
            <div className="min-h-[500px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection}
                        variants={sectionVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        {activeSection === 'dashboard' && <ExamsDashboard setActiveSection={setActiveSection} />}
                        {activeSection === 'practice' && <PracticeExams setActiveSection={setActiveSection} setLatestExamResult={setLatestExamResult} practiceConfig={practiceConfig} />}
                        {activeSection === 'grading' && <AutoGrading result={latestExamResult} setActiveSection={setActiveSection} setPracticeConfig={setPracticeConfig} />}
                        {activeSection === 'qbank' && <QuestionBank setActiveSection={setActiveSection} setPracticeConfig={setPracticeConfig} />}
                        {activeSection === 'analytics' && <PerformanceAnalytics />}
                        {activeSection === 'admin' && <AdminView />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ExamsModule;
