import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { 
    Plus, 
    Search, 
    Filter, 
    Calendar,
    Video,
    BookOpen,
    Loader2,
    Clock,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import OnKuppi_SessionCard from './components/OnKuppi_SessionCard';
import OnKuppi_SessionForm from './components/OnKuppi_SessionForm';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

const API = 'http://localhost:5000/api/kuppi';

const OnKuppi_KuppiPage = () => {
    const { user } = useContext(AuthContext);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [yearFilter, setYearFilter] = useState('All Years');
    const [semesterFilter, setSemesterFilter] = useState('All Semesters');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSession, setEditingSession] = useState(null);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const res = await axios.get(API, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setSessions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleSaveSession = async (formData, id) => {
        const config = {
            headers: { 
                Authorization: `Bearer ${user.token}`,
                'Content-Type': 'multipart/form-data'
            }
        };

        if (id) {
            await axios.put(`${API}/${id}`, formData, config);
            Swal.fire('Updated!', 'Session has been updated successfully.', 'success');
        } else {
            await axios.post(API, formData, config);
            Swal.fire('Published!', 'New Kuppi session is now live.', 'success');
        }
        fetchSessions();
    };

    const handleDeleteSession = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Session?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#14B8A6',
            cancelButtonColor: '#FF6B6B',
        });

        if (result.isConfirmed) {
            await axios.delete(`${API}/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            Swal.fire('Deleted!', 'Session removed.', 'success');
            fetchSessions();
        }
    };

    const filteredSessions = sessions.filter(s => {
        const matchesSearch = s.subject.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesYear = yearFilter === 'All Years' || s.year === yearFilter;
        const matchesSemester = semesterFilter === 'All Semesters' || s.semester === semesterFilter;
        return matchesSearch && matchesYear && matchesSemester;
    });

    const upcomingSessions = filteredSessions.filter(s => new Date(s.date) >= new Date());
    const pastSessions = filteredSessions.filter(s => new Date(s.date) < new Date());

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-16 animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="relative rounded-[48px] overflow-hidden shadow-2xl bg-gradient-to-br from-unihub-teal to-[#0d857a]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-white opacity-10 blur-[120px] rounded-full animate-pulse" />
                    <Video className="absolute -right-16 -top-10 w-72 h-72 text-white opacity-10 rotate-12" />
                </div>

                <div className="px-8 md:px-16 py-14 md:py-20 relative z-10">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[11px] font-bold text-white tracking-[0.2em] shadow-xl uppercase">
                            <Clock className="w-4 h-4 text-unihub-yellow" /> Pulse Sync v1.0
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter">
                            Kuppi <span className="text-unihub-yellow">Sessions</span>.
                        </h1>
                        <p className="text-white/80 font-medium text-base max-w-2xl leading-relaxed italic opacity-90">
                            Student-led revision sessions to master complex subjects and ace your exams together.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-12">
                        <div className="relative flex-1 max-w-md group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white transition-all underline decoration-unihub-yellow underline-offset-4" />
                            <input
                                type="text"
                                placeholder="Search by subject name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-16 pr-8 py-5 rounded-[24px] bg-white/10 backdrop-blur-md border border-white/20 focus:border-white focus:bg-white/20 transition-all text-sm font-black text-white placeholder:text-white/40 outline-none"
                            />
                        </div>
                        
                        <div className="relative group">
                            <select
                                value={yearFilter}
                                onChange={(e) => setYearFilter(e.target.value)}
                                className="pl-12 pr-14 py-5 rounded-[24px] bg-white/10 backdrop-blur-md border border-white/20 focus:border-white focus:bg-white/20 transition-all text-[10px] font-black text-white uppercase tracking-widest outline-none appearance-none cursor-pointer"
                            >
                                <option className="bg-gray-800">All Years</option>
                                <option className="bg-gray-800">1st Year</option>
                                <option className="bg-gray-800">2nd Year</option>
                                <option className="bg-gray-800">3rd Year</option>
                                <option className="bg-gray-800">4th Year</option>
                            </select>
                            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-hover:text-white" />
                        </div>

                        <div className="relative group">
                            <select
                                value={semesterFilter}
                                onChange={(e) => setSemesterFilter(e.target.value)}
                                className="pl-12 pr-14 py-5 rounded-[24px] bg-white/10 backdrop-blur-md border border-white/20 focus:border-white focus:bg-white/20 transition-all text-[10px] font-black text-white uppercase tracking-widest outline-none appearance-none cursor-pointer"
                            >
                                <option className="bg-gray-800">All Semesters</option>
                                <option className="bg-gray-800">Semester 1</option>
                                <option className="bg-gray-800">Semester 2</option>
                            </select>
                            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-hover:text-white" />
                        </div>

                        <button 
                            onClick={() => { setEditingSession(null); setIsFormOpen(true); }}
                            className="bg-white hover:bg-unihub-yellow text-unihub-teal hover:text-gray-900 font-black px-10 py-5 rounded-[24px] transition-all shadow-xl hover:shadow-unihub-yellow/20 active:scale-95 flex items-center gap-3 text-[10px] uppercase tracking-widest"
                        >
                            <Plus className="w-5 h-5" /> Host Session
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-unihub-teal" />
                    <p className="font-bold text-sm tracking-widest uppercase">Synchronizing Sessions...</p>
                </div>
            ) : (
                <div className="space-y-16">
                    {/* Upcoming Sessions */}
                    <section>
                        <div className="flex items-center justify-between mb-8 px-2">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-unihub-teal/10 flex items-center justify-center text-unihub-teal font-black text-sm border border-unihub-teal/20">01</div>
                                <h2 className="text-xl font-black text-gray-800 tracking-tight uppercase">Upcoming Hotspots</h2>
                            </div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{upcomingSessions.length} Total Syncs</div>
                        </div>
                        
                        {upcomingSessions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {upcomingSessions.map(session => (
                                    <OnKuppi_SessionCard 
                                        key={session._id} 
                                        session={session} 
                                        user={user}
                                        onEdit={(s) => { setEditingSession(s); setIsFormOpen(true); }}
                                        onDelete={handleDeleteSession}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-white/40 border border-white border-dashed rounded-[40px]">
                                <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-400 font-bold text-xs tracking-widest uppercase">No upcoming sessions found</p>
                            </div>
                        )}
                    </section>

                    {/* Past Sessions */}
                    {pastSessions.length > 0 && (
                        <section className="opacity-75">
                            <div className="flex items-center justify-between mb-8 px-2 border-t border-gray-100 pt-16">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-black text-sm border border-gray-200">02</div>
                                    <h2 className="text-xl font-black text-gray-800 tracking-tight uppercase">Archived Syncs</h2>
                                </div>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{pastSessions.length} Past Items</div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {pastSessions.map(session => (
                                    <OnKuppi_SessionCard 
                                        key={session._id} 
                                        session={session} 
                                        user={user}
                                        onEdit={(s) => { setEditingSession(s); setIsFormOpen(true); }}
                                        onDelete={handleDeleteSession}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}

            {/* Form Modal */}
            <OnKuppi_SessionForm 
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSaveSession}
                editingSession={editingSession}
                user={user}
            />
        </div>
    );
};

export default OnKuppi_KuppiPage;
