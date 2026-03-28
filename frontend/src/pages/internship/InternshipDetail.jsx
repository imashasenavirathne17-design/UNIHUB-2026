import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { 
    ChevronLeft, 
    Bookmark, 
    Briefcase, 
    MapPin, 
    Calendar, 
    DollarSign, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Zap, 
    Send,
    FileText,
    ArrowLeft,
    Building2,
    Target,
    Award
} from 'lucide-react';

const typeColors = { 
    'Remote': 'badge-teal', 
    'On-site': 'badge-coral', 
    'Hybrid': 'badge-amber' 
};

const COVER_LETTER_TEMPLATES = [
    {
        label: "Enthusiastic Student",
        text: `I am a highly motivated student eager to apply my academic knowledge to real-world challenges. I have been following [Company]'s work with great admiration and believe this internship aligns perfectly with my passion for [field]. I am confident that my skills in [skill] and my commitment to continuous learning will allow me to contribute meaningfully to your team.`
    },
    {
        label: "Skills-Focused",
        text: `I am applying for the [role] internship with a strong foundation in [skill], [skill], and [skill]. Through academic projects and self-directed learning, I have developed practical experience building [what]. I am excited by the opportunity to apply these skills at [Company] and grow under experienced mentorship.`
    },
    {
        label: "Brief & Direct",
        text: `I would like to express my interest in the [role] position at [Company]. My background in [field], combined with hands-on project experience, makes me a strong candidate. I am available immediately and am committed to contributing to your team's success from day one.`
    }
];

const SkillGapAnalyzer = ({ internshipSkills, userSkills }) => {
    if (!internshipSkills?.length) return null;
    const userSkillNames = (userSkills || []).map(s => s.name?.toLowerCase());
    const matched = internshipSkills.filter(s => userSkillNames.includes(s.toLowerCase()));
    const missing = internshipSkills.filter(s => !userSkillNames.includes(s.toLowerCase()));
    const score = internshipSkills.length ? Math.round((matched.length / internshipSkills.length) * 100) : 0;

    return (
        <div className="glass-card p-6 border-l-4 border-l-unihub-teal relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                    <Target className="w-5 h-5 text-unihub-teal" />
                    <h3 className="font-bold text-unihub-text text-sm uppercase tracking-widest font-display">Skill Alignment Matrix</h3>
                </div>
                <span className={`text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm ${score >= 70 ? 'bg-unihub-teal text-white shadow-unihub-teal/20' : score >= 40 ? 'bg-unihub-yellow text-yellow-800 shadow-unihub-yellow/20' : 'bg-unihub-coral text-white shadow-unihub-coral/20'}`}>
                    {score}% Match Rate
                </span>
            </div>
            
            <div className="w-full bg-black/5 rounded-full h-2.5 mb-6 shadow-inner relative z-10">
                <div className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_10px] shadow-current ${score >= 70 ? 'bg-unihub-teal' : score >= 40 ? 'bg-unihub-yellow' : 'bg-unihub-coral'}`} style={{ width: `${score}%` }}></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-3">
                    <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-unihub-teal" /> Verified Assets
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {matched.map(s => <span key={s} className="bg-unihub-teal/10 text-unihub-teal text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-unihub-teal/10">{s}</span>)}
                        {matched.length === 0 && <span className="text-xs text-unihub-textMuted italic font-medium opacity-50">Zero cross-match detected</span>}
                    </div>
                </div>
                <div className="space-y-3">
                    <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-unihub-coral" /> Strategic Gaps
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {missing.map(s => <span key={s} className="bg-unihub-coral/5 text-unihub-coral text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-unihub-coral/10">{s}</span>)}
                        {missing.length === 0 && <span className="text-[10px] text-unihub-teal font-black uppercase tracking-widest">Mastery Achieved. 🎉</span>}
                    </div>
                </div>
            </div>

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-unihub-teal/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-unihub-teal/10 transition-colors" />
        </div>
    );
};

const InternshipDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [internship, setInternship] = useState(null);
    const [mySkills, setMySkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [coverLetter, setCoverLetter] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [applying, setApplying] = useState(false);

    const token = JSON.parse(localStorage.getItem('user'))?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [internRes, skillRes, savedRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/internships/${id}`, config),
                    axios.get('http://localhost:5000/api/skills/me', config),
                    axios.get('http://localhost:5000/api/internships/saved', config),
                ]);
                setInternship(internRes.data);
                // Handle the new Gig-based profile structure or legacy skills
                setMySkills(skillRes.data.gigs?.map(g => ({ name: g.title })) || skillRes.data.skills || []);
                setIsSaved(savedRes.data.some(i => i._id === id));
            } catch (err) {
                console.error(err);
                navigate('/internships');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleApply = async (e) => {
        e.preventDefault();
        if (!coverLetter.trim()) return;
        setApplying(true);
        try {
            const formData = new FormData();
            formData.append('coverLetter', coverLetter);
            if (resumeFile) {
                formData.append('resume', resumeFile);
            }

            const multipartConfig = {
                headers: {
                    ...config.headers,
                    'Content-Type': 'multipart/form-data',
                }
            };

            await axios.post(`http://localhost:5000/api/internships/${id}/apply`, formData, multipartConfig);
            setMessage({ type: 'success', text: 'Application successfully transmitted. Redirecting to records...' });
            setTimeout(() => navigate('/my-applications'), 2000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Data transmission failed.' });
        } finally {
            setApplying(false);
        }
    };

    const handleBookmark = async () => {
        try {
            const { data } = await axios.post(`http://localhost:5000/api/internships/${id}/bookmark`, {}, config);
            setIsSaved(data.saved);
        } catch (err) { console.error(err); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 space-y-6">
            <div className="w-16 h-16 border-4 border-unihub-teal/20 border-t-unihub-teal rounded-full animate-spin shadow-inner" />
            <p className="text-xs font-black text-unihub-textMuted uppercase tracking-widest animate-pulse font-display">Syncing Career Repository...</p>
        </div>
    );
    if (!internship) return null;

    const now = new Date();
    const daysLeft = Math.ceil((new Date(internship.deadline) - now) / (1000 * 60 * 60 * 24));

    return (
        <div className="max-w-5xl mx-auto py-10 px-6 space-y-8 pb-20">
            <Link to="/internships" className="inline-flex items-center gap-2.5 text-xs font-black text-unihub-textMuted hover:text-unihub-teal transition-all uppercase tracking-[0.2em] font-display group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Core Board
            </Link>

            <div className="glass-card rounded-[40px] border border-white/60 overflow-hidden shadow-2xl relative">
                {/* Header Section */}
                <div className="relative overflow-hidden p-8 md:p-12 glass border-b border-white/40">
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-unihub-teal/10 blur-[80px] rounded-full" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-unihub-coral/10 blur-[80px] rounded-full" />
                    </div>

                    <div className="flex flex-col md:flex-row items-start justify-between gap-8 relative z-10">
                        <div className="flex items-start gap-6">
                            <div className="w-20 h-20 rounded-[24px] bg-white/60 backdrop-blur-xl border border-white/80 shadow-xl flex items-center justify-center text-3xl font-black text-unihub-teal flex-shrink-0 animate-in zoom-in duration-500">
                                <span className="relative z-10">{internship.company.charAt(0)}</span>
                                <div className="absolute inset-0 bg-unihub-teal/5 rounded-[24px]" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className={`badge ${typeColors[internship.type]} shadow-sm uppercase tracking-widest text-[10px]`}>{internship.type}</span>
                                    {daysLeft > 0 && daysLeft <= 7 && (
                                        <span className="badge bg-unihub-coral/10 text-unihub-coral border border-unihub-coral/10 animate-pulse uppercase tracking-widest text-[10px] font-black">
                                            Priority Selection
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black text-unihub-text font-display tracking-tighter leading-tight">{internship.title}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-unihub-textMuted uppercase tracking-widest opacity-80">
                                    <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-unihub-teal/60" /> {internship.company}</span>
                                    <span className="opacity-20 text-lg">|</span>
                                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-unihub-teal/60" /> {internship.location}</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={handleBookmark} 
                            className={`flex-shrink-0 w-14 h-14 rounded-[22px] flex items-center justify-center transition-all border shadow-xl backdrop-blur-md active:scale-95 group/btn ${isSaved ? 'bg-unihub-teal text-white border-unihub-teal' : 'bg-white/60 text-slate-400 border-white/80 hover:bg-white hover:text-unihub-teal'}`} 
                            title={isSaved ? 'Unsave Role' : 'Save Role'}
                        >
                            <Bookmark className={`w-6 h-6 transition-transform ${isSaved ? 'fill-white rotate-[360deg]' : 'group-hover/btn:scale-110'}`} strokeWidth={isSaved ? 0 : 2} />
                        </button>
                    </div>
                </div>

                <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-unihub-text font-display flex items-center gap-3 uppercase tracking-wider">
                                <FileText className="w-5 h-5 text-unihub-teal" /> Role Specification
                            </h2>
                            <p className="text-unihub-textMuted leading-relaxed whitespace-pre-line font-medium text-base italic pl-2 border-l-2 border-slate-100">
                                {internship.description}
                            </p>
                        </section>

                        {(internship.requirements || []).length > 0 && (
                            <section className="space-y-4">
                                <h2 className="text-xl font-bold text-unihub-text font-display uppercase tracking-wider flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-unihub-teal" /> Requirements
                                </h2>
                                <ul className="grid grid-cols-1 gap-3 pl-2">
                                    {internship.requirements.map((req, i) => (
                                        <li key={i} className="flex items-start gap-3 text-unihub-text text-sm font-semibold p-4 bg-black/5 rounded-2xl border border-black/5 hover:border-unihub-teal/20 transition-all">
                                            <div className="w-5 h-5 rounded-full bg-unihub-teal/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                                                <div className="w-1.5 h-1.5 rounded-full bg-unihub-teal" />
                                            </div> 
                                            <span className="opacity-80 leading-relaxed">{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-unihub-text font-display uppercase tracking-wider flex items-center gap-3">
                                <Award className="w-5 h-5 text-unihub-teal" /> Tech Ecosystem
                            </h2>
                            <div className="flex flex-wrap gap-3 pl-2">
                                {internship.skills.map(s => (
                                    <span key={s} className="bg-white/40 backdrop-blur-md text-unihub-textMuted text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl border border-white/60 shadow-sm">{s}</span>
                                ))}
                            </div>
                        </section>

                        {/* Skill Gap Analyzer for students */}
                        {user?.role === 'student' && (
                            <SkillGapAnalyzer internshipSkills={internship.skills} userSkills={mySkills} />
                        )}

                        {/* Apply Form */}
                        {user?.role === 'student' && (
                            <section className="pt-10 border-t border-black/5 space-y-6">
                                {message ? (
                                    <div className={`p-6 rounded-[24px] text-sm font-bold flex items-center gap-4 animate-in zoom-in duration-300 ${message.type === 'success' ? 'bg-unihub-teal/10 text-unihub-teal border border-unihub-teal/20' : 'bg-unihub-coral/10 text-unihub-coral border border-unihub-coral/20'}`}>
                                        <div className="w-10 h-10 rounded-xl bg-current bg-opacity-10 flex items-center justify-center text-lg">{message.type === 'success' ? '✓' : '!'}</div>
                                        {message.text}
                                    </div>
                                ) : !showForm ? (
                                    <button 
                                        onClick={() => setShowForm(true)} 
                                        className="btn btn-primary w-full py-5 text-[14px] font-black uppercase tracking-[0.3em] font-display shadow-2xl hover:shadow-unihub-teal/30 active:scale-[0.98]"
                                    >
                                        Initiate Engagement Portfolio
                                    </button>
                                ) : (
                                    <form onSubmit={handleApply} className="space-y-8 glass p-8 rounded-[32px] border border-white/60 shadow-inner">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <h3 className="text-xl font-black text-unihub-text font-display uppercase tracking-tighter">Strategic Narrative</h3>
                                            <div className="relative group">
                                                <button type="button" className="text-[10px] font-black text-unihub-teal uppercase tracking-widest hover:underline hover:underline-offset-4 flex items-center gap-1">
                                                    AI Templates <ChevronLeft className="w-3.5 h-3.5 rotate-[-90deg]" />
                                                </button>
                                                <div className="hidden group-hover:block absolute right-0 top-6 w-72 glass-card rounded-[24px] border border-white/60 shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                                    {COVER_LETTER_TEMPLATES.map(t => (
                                                        <button key={t.label} type="button"
                                                            onClick={() => setCoverLetter(t.text)}
                                                            className="w-full text-left px-5 py-4 hover:bg-unihub-teal/5 border-b last:border-0 border-black/5 transition-colors"
                                                        >
                                                            <div className="text-[10px] font-black text-unihub-text uppercase tracking-widest text-unihub-teal mb-1">{t.label}</div>
                                                            <div className="text-xs text-unihub-textMuted font-medium line-clamp-2 italic opacity-60 leading-normal">{t.text}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="uni-label ml-1">Engagement Narrative</label>
                                            <textarea 
                                                rows={8} 
                                                value={coverLetter} 
                                                onChange={e => setCoverLetter(e.target.value)}
                                                placeholder="Articulate your value proposition to the recruiter..."
                                                className="w-full uni-input bg-white/40 border-white/40 focus:bg-white/80 p-6 text-base font-medium leading-relaxed italic"
                                                required 
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText className="w-5 h-5 text-unihub-teal" />
                                                <h3 className="text-xl font-black text-unihub-text font-display uppercase tracking-tighter">Asset Upload</h3>
                                            </div>
                                            <div className="relative group/upload">
                                                <input 
                                                    type="file" 
                                                    accept=".pdf,.doc,.docx" 
                                                    onChange={e => setResumeFile(e.target.files[0])} 
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className="w-full border-2 border-dashed border-slate-200 rounded-[28px] p-8 text-center group-hover/upload:border-unihub-teal/40 group-hover/upload:bg-unihub-teal/5 transition-all transition-duration-300">
                                                    <div className="w-14 h-14 bg-black/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover/upload:scale-110 transition-transform">
                                                        <Send className="w-6 h-6 text-slate-400 group-hover/upload:text-unihub-teal" />
                                                    </div>
                                                    <p className="text-sm font-bold text-unihub-textMuted uppercase tracking-widest">{resumeFile ? resumeFile.name : 'Select or drop Professional Portfolio'}</p>
                                                    <p className="text-[10px] font-bold text-unihub-textMuted/40 mt-2 uppercase tracking-widest">PDF, DOC (MAX · 5MB)</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary flex-1 py-4 text-[12px] font-black uppercase tracking-widest">Withdraw</button>
                                            <button type="submit" disabled={applying} className="btn btn-primary flex-1 py-4 text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-3">
                                                {applying ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : <Send className="w-4 h-4" />}
                                                {applying ? 'TRANSMITTING...' : 'DISPATCH APPLICATION'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </section>
                        )}
                    </div>

                    {/* Meta Sidebar */}
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-700 delay-200">
                        <div className="space-y-4">
                            {[
                                { label: 'Rev. Yield', value: internship.stipend?.replace(/rs\.?/i, 'LKR'), icon: DollarSign },
                                { label: 'Engage Per.', value: internship.duration, icon: Clock },
                                { label: 'Final Call', value: new Date(internship.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }), icon: Calendar },
                                { label: 'Originated By', value: internship.postedBy?.name, icon: Building2 },
                            ].map(({ label, value, icon: Icon }) => (
                                <div key={label} className="glass border border-white/40 rounded-[28px] p-6 group hover:translate-x-1 transition-all">
                                    <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <Icon className="w-3.5 h-3.5 text-unihub-teal/60" /> {label}
                                    </p>
                                    <p className="font-bold text-unihub-text text-lg font-display tracking-tight leading-none group-hover:text-primary transition-colors">{value}</p>
                                </div>
                            ))}
                        </div>

                        <div className={`rounded-[32px] p-8 border-2 shadow-xl relative overflow-hidden group ${daysLeft <= 3 ? 'bg-unihub-coral/5 border-unihub-coral/20' : daysLeft <= 10 ? 'bg-unihub-yellow/5 border-unihub-yellow/20' : 'bg-unihub-teal/5 border-unihub-teal/20'}`}>
                            <div className="relative z-10 text-center space-y-3">
                                <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.3em]">Temporal Delta</p>
                                <p className={`font-black text-4xl font-display tracking-tighter ${daysLeft <= 3 ? 'text-unihub-coral animate-pulse' : daysLeft <= 10 ? 'text-yellow-700' : 'text-unihub-teal'}`}>
                                    {daysLeft > 0 ? `${daysLeft}d` : 'EXPIRED'}
                                </p>
                                <p className="text-[11px] font-bold text-unihub-textMuted/60 uppercase tracking-widest">to engagement close</p>
                            </div>
                            
                            {/* Decorative elements */}
                            <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-current opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.08] transition-opacity" />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* System Node Info */}
            <p className="text-center text-[10px] font-black text-unihub-textMuted opacity-30 uppercase tracking-[0.4em] pt-10">
                Data Node: SEC-ID · {id.substring(0, 12).toUpperCase()}
            </p>
        </div>
    );
};

export default InternshipDetail;
