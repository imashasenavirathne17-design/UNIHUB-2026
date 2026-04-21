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
import InternshipDetailModal from '../../components/internship/InternshipDetailModal';

const DeadlineCountdown = ({ deadline }) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffMs = deadlineDate - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return <span className="text-[10px] text-rose-500 font-black uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">Closed</span>;
    if (diffDays === 0) return <span className="text-[10px] text-rose-500 font-black animate-pulse uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">Closes today!</span>;
    if (diffDays <= 3) return <span className="text-[10px] text-unihub-coral font-black uppercase tracking-widest bg-unihub-coral/5 px-2 py-0.5 rounded-md border border-unihub-coral/10">⚠ {diffDays}d left</span>;
    if (diffDays <= 10) return <span className="text-[10px] text-unihub-yellow font-black uppercase tracking-widest bg-unihub-yellow/10 px-2 py-0.5 rounded-md border border-unihub-yellow/20">{diffDays}d left</span>;
    return <span className="text-[10px] text-unihub-textMuted font-bold uppercase tracking-widest bg-black/5 px-2 py-0.5 rounded-md">{diffDays}d left</span>;
};

const SavedInternships = () => {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);

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
            {/* Architectural Hero Section */}
            <div className="relative rounded-[40px] overflow-hidden shadow-2xl bg-gradient-to-br from-unihub-teal to-[#0d857a] group mb-12 mt-4">
                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none group-hover:scale-105 transition-transform duration-[2000ms]">
                    <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-white opacity-10 blur-[120px] rounded-full mix-blend-overlay animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white opacity-5 blur-[100px] rounded-full" />
                    <Bookmark className="absolute -right-16 -top-16 w-80 h-80 text-white opacity-10 rotate-12 transition-all duration-700 group-hover:rotate-[20deg] group-hover:scale-110" strokeWidth={0.5} />
                </div>

                <div className="px-8 md:px-16 py-16 md:py-24 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="max-w-3xl space-y-8 text-center md:text-left">
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[11px] font-bold text-white tracking-[0.2em] shadow-xl font-display mb-2">
                            <Bookmark className="w-4 h-4 text-unihub-yellow" /> Personal Portfolio
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight font-display">
                            Your <span className="text-unihub-yellow">Dream Portfolio</span>, Curated By You.
                        </h1>
                        <p className="text-white/90 font-medium text-base md:text-xl max-w-xl leading-relaxed italic opacity-80">
                            {"Keep track of the opportunities that excite you most. Build your future, one bookmark at a time.".split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                        </p>
                        <div className="pt-2">
                            <Link to="/internships" className="btn bg-white text-unihub-teal hover:bg-unihub-yellow hover:text-unihub-text px-12 py-5 rounded-[24px] font-black text-[13px] tracking-[0.2em] shadow-2xl transition-all active:scale-95 group/btn font-display flex items-center gap-4">
                                Discover More Roles
                                <ChevronRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    <div className="hidden lg:flex w-64 h-64 bg-white/10 backdrop-blur-3xl rounded-[40px] border border-white/20 shadow-2xl items-center justify-center relative animate-float">
                        <Bookmark className="w-24 h-24 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" strokeWidth={1.5} />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-[40px]" />
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
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-8 bg-unihub-coral rounded-full shadow-[0_0_15px_rgba(255,107,107,0.4)]" />
                            <h2 className="text-3xl font-black text-unihub-text font-display tracking-tight uppercase">Curated Selection</h2>
                        </div>
                        <span className="text-[11px] font-black text-unihub-coral bg-unihub-coral/10 border border-unihub-coral/20 px-5 py-2 rounded-2xl shadow-sm uppercase tracking-widest">{internships.length} RECORDS</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {internships.map((internship, i) => {
                            const deadlineDate = new Date(internship.deadline);
                            const daysLeft = Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24));

                            return (
                                <div
                                    key={internship._id}
                                    className="uni-card relative overflow-hidden group flex flex-col h-full animate-in fade-in slide-in-from-bottom-6 duration-500 shadow-xl"
                                    style={{ animationDelay: `${i * 80}ms` }}
                                >
                                    {/* Visual Header Gradient */}
                                    <div className="h-28 bg-gradient-to-br from-unihub-teal/5 to-unihub-coral/5 relative p-8 flex justify-between items-start">
                                        <div className="w-16 h-16 rounded-[22px] bg-white/70 backdrop-blur-xl border border-white/80 shadow-lg flex items-center justify-center text-2xl font-black text-unihub-teal group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                            <span className="relative z-10">{internship.company?.charAt(0) || 'C'}</span>
                                            <div className="absolute inset-0 bg-unihub-teal/5 rounded-[22px]" />
                                        </div>
                                        <div className="flex flex-col items-end gap-2 pr-12">
                                            <span className={`badge ${
                                                internship.type === 'Remote' ? 'badge-teal' :
                                                internship.type === 'On-site' ? 'badge-coral' :
                                                'badge-amber'
                                            } border border-white/20 shadow-sm uppercase tracking-widest text-[10px]`}>{internship.type}</span>
                                        </div>

                                        {/* Decorative Flare */}
                                        <div className="absolute -top-10 -left-10 w-24 h-24 bg-unihub-teal/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    <div onClick={() => setSelectedId(internship._id)} className="px-8 pb-8 pt-2 flex-1 flex flex-col relative group/link cursor-pointer">
                                        <button
                                            onClick={(e) => handleRemove(e, internship._id)}
                                            className="absolute -top-16 right-0 z-10 w-11 h-11 rounded-xl bg-white/60 backdrop-blur-md border border-white/60 text-slate-400 hover:bg-unihub-coral hover:text-white hover:border-unihub-coral transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95"
                                            title="Remove bookmark"
                                        >
                                            <Trash2 className="w-4.5 h-4.5" />
                                        </button>

                                        <div className="mb-5 mt-2">
                                            <h3 className="text-xl font-extrabold text-unihub-text group-hover/link:text-unihub-teal transition-colors line-clamp-1 mb-1 font-display tracking-tight">{internship.title}</h3>
                                            <div className="flex items-center gap-3 text-[11px] font-bold text-unihub-textMuted uppercase tracking-widest opacity-80">
                                                <span className="text-unihub-teal/80">{internship.company}</span>
                                                <span className="opacity-20">|</span>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5 opacity-60" />
                                                    {internship.location}
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-sm text-unihub-textMuted line-clamp-2 mb-8 leading-relaxed font-medium italic opacity-80 group-hover/link:opacity-100 transition-opacity">
                                            {internship.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-8">
                                            {(internship.skills || []).slice(0, 3).map(skill => (
                                                <span key={skill} className="bg-white/40 backdrop-blur-md text-unihub-textMuted text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl border border-white/60 shadow-sm group-hover/link:border-unihub-teal/30 transition-colors">{skill}</span>
                                            ))}
                                            {(internship.skills || []).length > 3 && (
                                                <span className="text-[10px] font-bold text-unihub-textMuted/60 pt-1.5 font-display">+{internship.skills.length - 3}</span>
                                            )}
                                        </div>

                                        <div className="mt-auto pt-8 border-t border-black/5 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <p className="uni-label mb-1 uppercase tracking-widest opacity-60">Revenue</p>
                                                <p className="text-base font-black text-unihub-text font-display tracking-tight">
                                                    {internship.stipend?.replace(/rs\.?/i, 'LKR')}
                                                </p>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-2.5">
                                                <DeadlineCountdown deadline={internship.deadline} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visual Bottom Border */}
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-unihub-teal to-unihub-coral opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {selectedId && (
                <InternshipDetailModal 
                    internshipId={selectedId} 
                    onClose={() => setSelectedId(null)} 
                    savedIds={new Set(internships.map(i => i._id))}
                    onBookmarkToggle={(id) => {
                        const fakeEvent = { preventDefault: () => {}, stopPropagation: () => {} };
                        handleRemove(fakeEvent, id);
                    }}
                />
            )}
        </div>
    );
};

export default SavedInternships;
