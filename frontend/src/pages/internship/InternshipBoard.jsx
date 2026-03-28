import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { 
    Search, 
    Briefcase, 
    MapPin, 
    Calendar, 
    DollarSign, 
    Bookmark, 
    CheckCircle, 
    Globe, 
    Zap, 
    Award, 
    Filter,
    ChevronRight,
    ArrowUpRight,
    TrendingUp,
    Clock
} from 'lucide-react';

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

const MatchScore = ({ internshipSkills, userSkills }) => {
    if (!internshipSkills?.length || !userSkills?.length) return null;
    const userSkillNames = userSkills.map(s => s.name?.toLowerCase());
    const matched = internshipSkills.filter(s => userSkillNames.includes(s.toLowerCase()));
    const score = Math.round((matched.length / internshipSkills.length) * 100);

    const color = score >= 70 ? 'bg-unihub-teal' : score >= 40 ? 'bg-unihub-yellow' : 'bg-unihub-coral';
    const textColor = score >= 70 ? 'text-unihub-teal' : score >= 40 ? 'text-yellow-700' : 'text-unihub-coral';

    return (
        <div className="flex items-center gap-2.5" title={`You match ${matched.length}/${internshipSkills.length} required skills`}>
            <div className="w-14 h-1.5 bg-black/5 rounded-full overflow-hidden shadow-inner">
                <div className={`h-full rounded-full ${color} shadow-[0_0_8px] shadow-current transition-all duration-1000`} style={{ width: `${score}%` }}></div>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${textColor}`}>{score}% match</span>
        </div>
    );
};

const InternshipBoard = () => {
    const { user } = useContext(AuthContext);
    const [internships, setInternships] = useState([]);
    const [mySkills, setMySkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [savedIds, setSavedIds] = useState(new Set());

    const token = JSON.parse(localStorage.getItem('user'))?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (typeFilter) params.append('type', typeFilter);

            const internRes = await axios.get(`http://localhost:5000/api/internships?${params}`, config);
            setInternships(internRes.data);

            if (user?.role === 'student') {
                try {
                    const profileRes = await axios.get('http://localhost:5000/api/skills/me', config);
                    setMySkills(profileRes.data.gigs?.map(g => ({ name: g.title })) || []);
                    const savedRes = await axios.get('http://localhost:5000/api/internships/saved', config);
                    setSavedIds(new Set(savedRes.data.map(i => i._id)));
                } catch { /* silent */ }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch internships');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [typeFilter]);

    const handleSearch = (e) => { e.preventDefault(); fetchData(); };

    const handleBookmark = async (e, internshipId) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const { data } = await axios.post(`http://localhost:5000/api/internships/${internshipId}/bookmark`, {}, config);
            setSavedIds(prev => {
                const next = new Set(prev);
                data.saved ? next.add(internshipId) : next.delete(internshipId);
                return next;
            });
        } catch (err) {
            console.error('Bookmark error:', err.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-16">
            {/* Hero Section */}
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl mt-4 bg-gradient-to-br from-unihub-coral to-[#de3047]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-white opacity-10 blur-[120px] rounded-full mix-blend-overlay animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white opacity-5 blur-[100px] rounded-full" />
                    <Globe className="absolute -right-16 -top-16 w-80 h-80 text-white opacity-10 rotate-12" strokeWidth={0.5} />
                </div>

                <div className="px-8 md:px-16 py-14 md:py-20 relative z-10">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[11px] font-bold text-white uppercase tracking-[0.2em] shadow-xl">
                            <TrendingUp className="w-4 h-4 text-unihub-yellow" /> Global Career Hub
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter font-display">
                            Jumpstart your career with the <span className="text-unihub-yellow">perfect internship</span>.
                        </h1>

                        <div className="relative flex items-center max-w-2xl bg-white rounded-2xl shadow-2xl p-1.5 focus-within:ring-4 focus-within:ring-white/30 transition-all">
                            <div className="pl-4 shrink-0">
                                <Search className="w-5 h-5 text-unihub-coral" />
                            </div>
                            <form onSubmit={handleSearch} className="w-full flex items-center">
                                <input
                                    type="text"
                                    placeholder='Search by role, tech stack, or company...'
                                    className="w-full py-3 px-4 bg-transparent outline-none text-unihub-text font-semibold placeholder:text-slate-400 text-sm font-display"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button type="submit" className="bg-unihub-coral text-white px-7 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#de3047] transition-all active:scale-95 flex-shrink-0 mr-1">
                                    Search
                                </button>
                            </form>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                            <span className="text-white/60 font-bold text-xs uppercase tracking-widest">Popular:</span>
                            {['Software Engineer', 'Data Analyst', 'UI/UX Design', 'Marketing'].map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => { setSearch(tag); fetchData(); }}
                                    className="bg-white/10 hover:bg-white hover:text-unihub-coral border border-white/20 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Navigation Bar */}
            <div className="glass-card rounded-[28px] px-8 border border-white/40 shadow-xl scrollbar-hide">
                <div className="flex items-center py-4 gap-10 overflow-x-auto no-scrollbar">
                    {['', 'Remote', 'On-site', 'Hybrid'].map(type => (
                        <button
                            key={type}
                            onClick={() => setTypeFilter(type)}
                            className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border-b-2 py-2 font-display ${
                                typeFilter === type
                                    ? 'text-unihub-teal border-unihub-teal'
                                    : 'text-unihub-textMuted border-transparent hover:text-unihub-teal'
                            }`}
                        >
                            {type || 'CORE PORTFOLIO'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="space-y-10 px-1">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-8 bg-unihub-coral rounded-full shadow-[0_0_15px_rgba(255,107,107,0.3)]" />
                            <h2 className="text-3xl font-black text-unihub-text font-display tracking-tighter uppercase">
                                {search ? `REFINING RESULTS: "${search}"` : "CURRENT OPPORTUNITIES"}
                            </h2>
                        </div>
                        <p className="text-sm text-unihub-textMuted font-bold uppercase tracking-widest pl-6 opacity-60 font-display italic">Connecting academic excellence with industry leaders</p>
                    </div>
                    
                    <div className="flex gap-3 flex-wrap">
                        {user?.role === 'student' && (
                            <>
                                <Link to="/saved-internships" className="btn btn-glass px-6 py-3.5 text-[11px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2.5 font-display border border-white/60">
                                    <Bookmark className="w-4 h-4 text-unihub-teal" /> SAVED
                                </Link>
                                <Link to="/my-applications" className="btn btn-secondary px-6 py-3.5 text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 font-display">
                                    RECORDS
                                </Link>
                                <Link to="/cv-builder" className="btn btn-primary px-8 py-3.5 text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95 font-display flex items-center gap-2.5">
                                    <Zap className="w-4 h-4 fill-white" /> AI BUILDER
                                </Link>
                            </>
                        )}
                        {(user?.role === 'organization' || user?.role === 'admin') && (
                            <Link to="/org-dashboard" className="btn btn-primary px-8 py-4 text-[11px] font-black uppercase tracking-widest shadow-xl font-display">
                                RECRUITER PORTAL
                            </Link>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-unihub-coral/10 border border-unihub-coral/20 text-unihub-coral px-8 py-5 rounded-[24px] text-sm font-bold flex items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
                        <div className="w-10 h-10 rounded-xl bg-unihub-coral/20 flex items-center justify-center flex-shrink-0 text-lg">⚠</div>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6">
                        <div className="w-16 h-16 border-4 border-unihub-teal/20 border-t-unihub-teal rounded-full animate-spin shadow-inner" />
                        <p className="text-xs font-black text-unihub-textMuted uppercase tracking-widest animate-pulse font-display text-center">Parsing Career Data...</p>
                    </div>
                ) : internships.length === 0 ? (
                    <div className="py-32 text-center glass rounded-[40px] border-2 border-dashed border-black/5 space-y-8 max-w-4xl mx-auto shadow-sm group">
                        <div className="w-24 h-24 bg-gradient-to-br from-unihub-teal/5 to-unihub-coral/5 rounded-[32px] flex items-center justify-center mx-auto border border-black/5 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                            <Briefcase className="w-10 h-10 text-slate-300 group-hover:text-unihub-teal transition-colors" strokeWidth={1.5} />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black text-unihub-text font-display uppercase tracking-tight">Zero matches found</h3>
                            <p className="text-unihub-textMuted max-w-sm mx-auto text-base font-medium leading-relaxed italic">Adjust your search parameters to explore a broader range of professional opportunities.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {internships.map((internship, i) => {
                            const isSaved = savedIds.has(internship._id);
                            return (
                                <Link
                                    key={internship._id}
                                    to={`/internships/${internship._id}`}
                                    className="uni-card group flex flex-col h-full relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500 shadow-xl"
                                    style={{ animationDelay: `${i * 80}ms` }}
                                >
                                    {/* Visual Header Gradient */}
                                    <div className="h-28 bg-gradient-to-br from-unihub-teal/5 to-unihub-coral/5 relative p-8 flex justify-between items-start">
                                        <div className="w-16 h-16 rounded-[22px] bg-white/70 backdrop-blur-xl border border-white/80 shadow-lg flex items-center justify-center text-2xl font-black text-unihub-teal group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                            <span className="relative z-10">{internship.company.charAt(0)}</span>
                                            <div className="absolute inset-0 bg-unihub-teal/5 rounded-[22px]" />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`badge ${
                                                internship.type === 'Remote' ? 'badge-teal' :
                                                internship.type === 'On-site' ? 'badge-coral' :
                                                'badge-amber'
                                            } border border-white/20 shadow-sm uppercase tracking-widest text-[10px]`}>{internship.type}</span>
                                        </div>

                                        {/* Decorative Flare */}
                                        <div className="absolute -top-10 -left-10 w-24 h-24 bg-unihub-teal/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    <div className="px-8 pb-8 pt-2 flex-1 flex flex-col relative">
                                        {user?.role === 'student' && (
                                            <button
                                                onClick={(e) => handleBookmark(e, internship._id)}
                                                className={`absolute -top-4 right-8 z-10 w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-xl backdrop-blur-md border border-white/60 ${isSaved ? 'bg-unihub-teal text-white border-unihub-teal' : 'bg-white/60 text-slate-400 hover:text-unihub-teal hover:bg-white'}`}
                                            >
                                                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} strokeWidth={isSaved ? 0 : 2} />
                                            </button>
                                        )}
                                        <div className="mb-5">
                                            <h3 className="text-xl font-extrabold text-unihub-text group-hover:text-unihub-teal transition-colors line-clamp-1 mb-1 font-display tracking-tight">{internship.title}</h3>
                                            <div className="flex items-center gap-3 text-[11px] font-bold text-unihub-textMuted uppercase tracking-widest opacity-80">
                                                <span className="text-unihub-teal/80">{internship.company}</span>
                                                <span className="opacity-20">|</span>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5 opacity-60" />
                                                    {internship.location}
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-sm text-unihub-textMuted line-clamp-2 mb-8 leading-relaxed font-medium italic opacity-80 group-hover:opacity-100 transition-opacity">
                                            {internship.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-8">
                                            {(internship.skills || []).slice(0, 3).map(skill => (
                                                <span key={skill} className="bg-white/40 backdrop-blur-md text-unihub-textMuted text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl border border-white/60 shadow-sm group-hover:border-unihub-teal/30 transition-colors">{skill}</span>
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
                                                {user?.role === 'student' && (
                                                    <MatchScore internshipSkills={internship.skills} userSkills={mySkills} />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visual Bottom Border */}
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-unihub-teal to-unihub-coral opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InternshipBoard;
