import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { 
    ChevronLeft, 
    Bookmark, 
    MapPin, 
    Calendar, 
    DollarSign, 
    Clock, 
    CheckCircle2, 
    Zap, 
    Send,
    FileText,
    ArrowLeft,
    Building2,
    Target,
    Award
} from 'lucide-react';
import Swal from 'sweetalert2';

const typeColors = { 
    'Remote': 'bg-unihub-teal/10 text-unihub-teal', 
    'On-site': 'bg-unihub-coral/10 text-unihub-coral', 
    'Hybrid': 'bg-unihub-yellow/10 text-unihub-yellow' 
};

const COVER_LETTER_TEMPLATES = [
    {
        label: "Enthusiastic Student",
        text: `I am a highly motivated student eager to apply my academic knowledge to real-world challenges. I have been following [Company]'s work with great admiration and believe this internship aligns perfectly with my passion for [field].`
    },
    {
        label: "Skills-Focused",
        text: `I am applying with a strong foundation in [skill], [skill], and [skill]. Through academic projects and self-directed learning, I have developed practical experience building [what].`
    }
];

const SkillGapAnalyzer = ({ internshipSkills, userSkills }) => {
    if (!internshipSkills?.length) return null;
    const userSkillNames = (userSkills || []).map(s => s.name?.toLowerCase());
    const matched = internshipSkills.filter(s => userSkillNames.includes(s.toLowerCase()));
    const missing = internshipSkills.filter(s => !userSkillNames.includes(s.toLowerCase()));
    const score = internshipSkills.length ? Math.round((matched.length / internshipSkills.length) * 100) : 0;

    return (
        <div className="glass-card p-8 rounded-[32px] border-l-4 border-l-unihub-teal relative overflow-hidden group shadow-xl">
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-unihub-teal/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-unihub-teal" />
                    </div>
                    <h3 className="font-black text-unihub-text text-xs uppercase tracking-[0.2em] font-display">Skill Alignment Matrix</h3>
                </div>
                <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm ${score >= 70 ? 'bg-unihub-teal text-white shadow-unihub-teal/20' : score >= 40 ? 'bg-unihub-yellow text-yellow-900 shadow-unihub-yellow/20' : 'bg-unihub-coral text-white shadow-unihub-coral/20'}`}>
                    {score}% Match Rate
                </span>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-3 mb-8 shadow-inner relative z-10 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${score >= 70 ? 'bg-unihub-teal' : score >= 40 ? 'bg-unihub-yellow' : 'bg-unihub-coral'}`} style={{ width: `${score}%` }}></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-4">
                    <p className="text-[9px] font-black text-unihub-textMuted uppercase tracking-[0.3em] flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-unihub-teal" /> Verified Assets
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {matched.map(s => <span key={s} className="bg-unihub-teal/5 text-unihub-teal text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl border border-unihub-teal/10">{s}</span>)}
                        {matched.length === 0 && <span className="text-[10px] text-unihub-textMuted italic font-bold opacity-40">Zero cross-match detected</span>}
                    </div>
                </div>
                <div className="space-y-4">
                    <p className="text-[9px] font-black text-unihub-textMuted uppercase tracking-[0.3em] flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-unihub-coral" /> Strategic Gaps
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {missing.map(s => <span key={s} className="bg-unihub-coral/5 text-unihub-coral text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl border border-unihub-coral/10">{s}</span>)}
                        {missing.length === 0 && <span className="text-[9px] text-unihub-teal font-black uppercase tracking-widest">Mastery Achieved</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const InternshipDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [internship, setInternship] = useState(null);
    const [mySkills, setMySkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [coverLetter, setCoverLetter] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [showForm, setShowForm] = useState(false);
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
        setApplying(true);
        try {
            const formData = new FormData();
            formData.append('coverLetter', coverLetter);
            if (resumeFile) formData.append('resume', resumeFile);

            await axios.post(`http://localhost:5000/api/internships/${id}/apply`, formData, {
                headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
            });
            
            Swal.fire({ title: 'Success', text: 'Application transmitted successfully.', icon: 'success' });
            navigate('/my-applications');
        } catch (err) {
            Swal.fire({ title: 'Upload Failed', text: err.response?.data?.message || 'Error occurred.', icon: 'error' });
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
        <div className="flex flex-col items-center justify-center py-40">
            <div className="w-12 h-12 border-4 border-unihub-teal/20 border-t-unihub-teal rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-widest">Syncing Archives...</p>
        </div>
    );
    if (!internship) return null;

    return (
        <div className="max-w-7xl mx-auto py-12 px-6 space-y-12 pb-32">
            <button onClick={() => navigate('/internships')} className="inline-flex items-center gap-3 text-[10px] font-black text-unihub-textMuted hover:text-unihub-teal transition-all uppercase tracking-[0.3em] font-display group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Core Board
            </button>

            <div className="relative group">
                {/* Hero Card */}
                <div className="glass-card rounded-[48px] border-white shadow-2xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-white/60 backdrop-blur-3xl relative">
                    <div className="absolute top-10 right-10">
                        <button 
                            onClick={handleBookmark} 
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl backdrop-blur-md active:scale-95 group/btn ${isSaved ? 'bg-unihub-teal text-white shadow-unihub-teal/20' : 'bg-white text-slate-300 hover:text-unihub-teal'}`}
                        >
                            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-white' : ''}`} />
                        </button>
                    </div>

                    <div className="w-24 h-24 rounded-[32px] bg-slate-50 flex items-center justify-center text-4xl font-black text-unihub-teal shadow-2xl mb-8 border border-white/80">
                        {internship.company.charAt(0)}
                    </div>

                    <div className="space-y-6 max-w-3xl">
                        <div className="flex justify-center">
                            <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${typeColors[internship.type]}`}>
                                {internship.type}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tight leading-[0.95] font-display">
                            {internship.title}
                        </h1>
                        <div className="flex items-center justify-center gap-8 text-[11px] font-black text-unihub-textMuted uppercase tracking-[0.2em]">
                            <span className="flex items-center gap-2"><Building2 className="w-4 h-4" /> {internship.company}</span>
                            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {internship.location}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-12">
                        <section className="bg-white/40 p-10 rounded-[40px] border border-white/60 space-y-6 shadow-sm">
                            <h2 className="text-sm font-black text-unihub-textMuted flex items-center gap-2.5 uppercase tracking-[0.3em]">
                                <FileText className="w-4 h-4 text-unihub-teal" /> Role Specification
                            </h2>
                            <p className="text-lg font-medium text-slate-600 leading-relaxed italic pl-6 border-l-4 border-unihub-teal/20 whitespace-pre-line">
                                {internship.description}
                            </p>
                        </section>

                        <section className="space-y-8">
                            <h2 className="text-sm font-black text-unihub-textMuted flex items-center gap-2.5 uppercase tracking-[0.3em] ml-2">
                                <CheckCircle2 className="w-4 h-4 text-unihub-teal" /> Requirements
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                {(internship.requirements || []).map((req, i) => (
                                    <div key={i} className="flex items-center gap-6 p-6 rounded-[28px] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                                        <div className="w-3 h-3 rounded-full bg-unihub-teal shadow-lg shadow-unihub-teal/40 group-hover:scale-125 transition-transform shrink-0" />
                                        <span className="text-sm font-bold text-slate-700 tracking-tight">{req}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {user?.role === 'student' && (
                            <SkillGapAnalyzer internshipSkills={internship.skills} userSkills={mySkills} />
                        )}

                        {user?.role === 'student' && (
                            <section className="pt-8 border-t border-slate-100">
                                {!showForm ? (
                                    <button 
                                        onClick={() => setShowForm(true)} 
                                        className="btn btn-primary w-full py-6 rounded-[32px] text-[13px] font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-[1.01] active:scale-[0.99]"
                                    >
                                        Initiate Engagement Portfolio
                                    </button>
                                ) : (
                                    <form onSubmit={handleApply} className="bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100 space-y-10 animate-in fade-in slide-in-from-bottom-5">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase font-display">Engagement Bundle</h3>
                                            <div className="flex gap-4">
                                                {COVER_LETTER_TEMPLATES.map(t => (
                                                    <button key={t.label} type="button" onClick={() => setCoverLetter(t.text)} className="text-[10px] font-black text-unihub-teal uppercase tracking-widest hover:underline">{t.label}</button>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-unihub-textMuted uppercase tracking-widest ml-4">Strategic Narrative</label>
                                            <textarea 
                                                rows={6} 
                                                value={coverLetter} 
                                                onChange={e => setCoverLetter(e.target.value)}
                                                className="w-full p-8 rounded-[32px] bg-slate-50 border-none focus:ring-2 focus:ring-unihub-teal/20 text-slate-600 font-bold italic resize-none"
                                                placeholder="Describe your unique value..."
                                                required 
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-unihub-textMuted uppercase tracking-widest ml-4">Portfolio Manifest</label>
                                            <div className="relative group/file">
                                                <input type="file" onChange={e => setResumeFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                                <div className="w-full py-12 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center group-hover/file:border-unihub-teal/50 transition-colors">
                                                    <Send className="w-8 h-8 text-slate-300 group-hover/file:text-unihub-teal mb-4 transition-transform" />
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                                        {resumeFile ? resumeFile.name : 'Select Professional Dossier'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600">Cancel</button>
                                            <button type="submit" disabled={applying} className="btn btn-primary flex-1 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl">
                                                {applying ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                                                {applying ? 'TRANSMITTING...' : 'DISPATCH PORTFOLIO'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </section>
                        )}
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="lg:col-span-4 space-y-6">
                        {[
                            { label: 'Rev. Yield', value: internship.stipend, icon: DollarSign },
                            { label: 'Engage Per.', value: internship.duration, icon: Clock },
                            { label: 'Final Call', value: new Date(internship.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }), icon: Calendar },
                            { label: 'Originated By', value: internship.postedBy?.name, icon: Building2 },
                        ].map(({ label, value, icon: Icon }) => (
                            <div key={label} className="bg-white/60 p-8 rounded-[36px] border border-white/80 shadow-sm group hover:scale-[1.02] transition-all">
                                <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.3em] mb-3 flex items-center gap-2.5">
                                    <Icon className="w-4 h-4 text-unihub-teal" /> {label}
                                </p>
                                <p className="text-2xl font-black text-slate-800 tracking-tighter leading-none">{value}</p>
                            </div>
                        ))}

                        <div className="p-10 rounded-[40px] bg-slate-900 text-white space-y-4 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-unihub-teal/20 blur-3xl" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Status Check</p>
                            <h3 className="text-4xl font-black tracking-tighter">Active Role</h3>
                            <div className="flex items-center gap-2 pt-4">
                                <div className="w-2 h-2 rounded-full bg-unihub-teal animate-ping" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-unihub-teal">Recruiting Now</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-center text-[10px] font-black text-slate-200 uppercase tracking-[0.5em] pt-12">
                UNIHUB CAREER NODE · {id.substring(0, 8).toUpperCase()}
            </p>
        </div>
    );
};

export default InternshipDetails;
