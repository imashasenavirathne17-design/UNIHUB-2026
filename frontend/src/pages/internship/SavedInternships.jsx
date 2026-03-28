import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
    Bookmark, 
    Heart, 
    ChevronRight, 
    Briefcase, 
    MapPin, 
    Calendar, 
    DollarSign,
    SearchX,
    Trash2,
    Zap,
    ArrowUpRight,
    Clock
} from 'lucide-react';

const SavedInternships = () => {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = JSON.parse(localStorage.getItem('user'))?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchSaved = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/internships/saved', config);
            setInternships(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSaved(); }, []);

    const handleRemove = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await axios.post(`http://localhost:5000/api/internships/${id}/bookmark`, {}, config);
            setInternships(prev => prev.filter(i => i._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-16">
            {/* Hero Section */}
            <div className="relative overflow-hidden py-14 md:py-24 rounded-[40px] shadow-2xl mt-4 glass group">
                {/* Background Decor */}
                <div className="absolute inset-0 -z-10 group-hover:scale-110 transition-transform duration-1000">
                    <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-unihub-teal/20 blur-[100px] rounded-full" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-unihub-coral/20 blur-[100px] rounded-full" />
                    <Heart className="w-96 h-96 absolute -right-20 -top-20 text-unihub-teal/5 animate-pulse rotate-12" strokeWidth={0.5} />
                    <Bookmark className="w-64 h-64 absolute left-10 bottom-10 text-unihub-coral/5 -rotate-12" strokeWidth={0.5} />
                </div>

                <div className="px-10 md:px-16 relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="max-w-2xl space-y-6 text-center md:text-left">
                        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-unihub-teal/10 border border-unihub-teal/20 text-[11px] font-black text-unihub-teal uppercase tracking-[0.2em] shadow-sm font-display">
                            <Bookmark className="w-4 h-4" /> Personal Portfolio
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-unihub-text leading-[1.1] tracking-tighter font-display">
                            Your <span className="text-gradient">Dream Portfolio</span>, curated by you.
                        </h1>
                        <p className="text-unihub-textMuted font-medium text-base md:text-lg max-w-xl leading-relaxed italic">
                            Keep track of the opportunities that excite you most. Build your future, one bookmark at a time.
                        </p>
                        <div className="pt-2">
                            <Link to="/internships" className="btn btn-primary px-10 py-4 rounded-[20px] font-black text-[12px] tracking-[0.2em] shadow-xl hover:shadow-unihub-teal/30 active:scale-95 group/btn font-display uppercase">
                                Discover More Roles
                                <ChevronRight className="w-4.5 h-4.5 group-hover:rotate-45 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    <div className="hidden lg:flex w-64 h-64 bg-white/40 backdrop-blur-3xl rounded-[40px] border border-white/60 shadow-2xl items-center justify-center relative animate-float">
                        <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-unihub-teal/20 to-transparent rounded-[40px] opacity-50" />
                        <Bookmark className="w-24 h-24 text-unihub-teal drop-shadow-2xl" strokeWidth={1.5} />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="w-16 h-16 border-4 border-unihub-teal/20 border-t-unihub-teal rounded-full animate-spin shadow-inner" />
                    <p className="text-xs font-black text-unihub-textMuted uppercase tracking-widest animate-pulse font-display">Parsing Database...</p>
                </div>
            ) : internships.length === 0 ? (
                <div className="text-center py-32 glass rounded-[40px] border-2 border-dashed border-black/5 space-y-8 max-w-4xl mx-auto shadow-sm group">
                    <div className="w-24 h-24 bg-gradient-to-br from-unihub-teal/5 to-unihub-coral/5 rounded-[32px] flex items-center justify-center mx-auto border border-black/5 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                        <Bookmark className="w-10 h-10 text-slate-300 group-hover:text-unihub-teal transition-colors" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-2xl font-black text-unihub-text font-display uppercase tracking-tight">Your vault is empty</h3>
                        <p className="text-unihub-textMuted max-w-sm mx-auto text-base font-medium leading-relaxed italic">The most ambitious journeys start with a single save. Don't let your perfect role slip away.</p>
                    </div>
                    <Link to="/internships" className="btn btn-secondary px-10 py-4 rounded-[20px] font-black text-[11px] tracking-[0.2em] shadow-lg group-hover:shadow-unihub-coral/30 font-display uppercase">
                        Explore Open Postings
                    </Link>
                </div>
            ) : (
                <div className="space-y-10">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-8 bg-unihub-coral rounded-full shadow-[0_0_15px_rgba(255,107,107,0.3)]" />
                            <h2 className="text-3xl font-black text-unihub-text font-display tracking-tighter uppercase flex items-center gap-4">
                                Curated Selection
                                <span className="bg-unihub-teal/10 text-unihub-teal border border-unihub-teal/20 px-4 py-1.5 rounded-2xl text-sm font-black shadow-sm">{internships.length}</span>
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {internships.map((internship, i) => {
                            const deadlineDate = new Date(internship.deadline);
                            const daysLeft = Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24));

                            return (
                                <div key={internship._id} className="uni-card relative overflow-hidden group flex flex-col h-full animate-in fade-in slide-in-from-bottom-6 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                    <button
                                        onClick={(e) => handleRemove(e, internship._id)}
                                        className="absolute top-5 right-5 w-11 h-11 rounded-xl bg-white/40 backdrop-blur-md border border-white/60 text-slate-400 hover:bg-unihub-coral hover:text-white hover:border-unihub-coral transition-all duration-300 z-20 flex items-center justify-center shadow-lg active:scale-95 group-hover:scale-105"
                                        title="Remove bookmark"
                                    >
                                        <Trash2 className="w-4.5 h-4.5" />
                                    </button>

                                    <Link to={`/internships/${internship._id}`} className="p-8 md:p-10 flex flex-col h-full space-y-8">
                                        <div className="flex items-start gap-5">
                                            <div className="w-16 h-16 rounded-[22px] bg-white/60 backdrop-blur-xl border border-white/80 flex items-center justify-center text-2xl font-black text-unihub-teal group-hover:scale-110 group-hover:rotate-3 transition-transform flex-shrink-0 shadow-lg relative">
                                                <div className="absolute inset-0 bg-unihub-teal/5 rounded-[22px]" />
                                                <span className="relative z-10">{internship.company.charAt(0)}</span>
                                            </div>
                                            <div className="space-y-1.5 overflow-hidden flex-1 mt-1">
                                                <h3 className="font-extrabold text-unihub-text text-xl leading-[1.2] truncate group-hover:text-primary transition-colors font-display tracking-tight">{internship.title}</h3>
                                                <p className="text-[11px] font-bold text-unihub-textMuted flex items-center gap-1.5 uppercase tracking-[0.1em] opacity-80">
                                                    <ArrowUpRight className="w-3.5 h-3.5 text-unihub-teal/60" />
                                                    {internship.company}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-5">
                                            <div className="flex flex-wrap gap-2">
                                                <span className={`badge ${
                                                    internship.type === 'Remote' ? 'badge-teal' :
                                                    internship.type === 'On-site' ? 'badge-coral' : 'badge-amber'
                                                } border border-white/20 shadow-sm`}>{internship.type}</span>
                                                <span className="badge bg-unihub-yellow/20 text-yellow-800 border border-unihub-yellow/20 shadow-sm">
                                                    <DollarSign className="w-3.5 h-3.5" />
                                                    {internship.stipend}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {(internship.skills || []).slice(0, 3).map(s => (
                                                    <span key={s} className="bg-white/40 backdrop-blur-md text-unihub-textMuted text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl border border-white/60 shadow-sm group-hover:border-unihub-teal/30 transition-colors">
                                                        {s}
                                                    </span>
                                                ))}
                                                {(internship.skills || []).length > 3 && (
                                                    <span className="text-[10px] font-bold text-unihub-textMuted/60 pt-1.5 font-display">+{internship.skills.length - 3}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-black/5 flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px] ${daysLeft <= 3 ? 'bg-rose-500 shadow-rose-500/50 animate-pulse' : 'bg-unihub-teal shadow-unihub-teal/50'}`} />
                                                <span className={`text-[11px] font-black uppercase tracking-[0.1em] font-display ${daysLeft <= 3 ? 'text-rose-500' : 'text-unihub-textMuted'}`}>
                                                    {daysLeft > 0 ? `${daysLeft} days to close` : 'Closed'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[11px] font-black text-unihub-text uppercase tracking-[0.25em] group-hover:gap-3 transition-all font-display opacity-80 group-hover:opacity-100 group-hover:text-primary">
                                                ENGAGE
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </Link>
                                    
                                    {/* Glass corner flare */}
                                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-unihub-teal/0 to-unihub-teal/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavedInternships;
