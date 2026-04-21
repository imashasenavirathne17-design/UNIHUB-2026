import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { 
    X, 
    Bookmark, 
    MapPin, 
    Calendar, 
    DollarSign, 
    Clock, 
    CheckCircle2, 
    Zap, 
    Send,
    FileText,
    Building2,
    Target,
    Activity
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
        text: `I am a highly motivated student eager to apply my academic knowledge to real-world challenges.`
    },
    {
        label: "Skills-Focused",
        text: `I am applying with a strong foundation in [skill], [skill], and [skill].`
    }
];

const SkillGapAnalyzer = ({ internshipSkills, userSkills }) => {
    if (!internshipSkills?.length) return null;
    const userSkillNames = (userSkills || []).map(s => s.name?.toLowerCase());
    const matched = internshipSkills.filter(s => userSkillNames.includes(s.toLowerCase()));
    const missing = internshipSkills.filter(s => !userSkillNames.includes(s.toLowerCase()));
    const score = internshipSkills.length ? Math.round((matched.length / internshipSkills.length) * 100) : 0;

    return (
        <div className="bg-white p-7 rounded-3xl border-l-4 border-l-unihub-teal relative overflow-hidden group shadow-md border border-slate-100">
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-unihub-teal/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-unihub-teal" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-unihub-text uppercase tracking-wider">Skill Alignment Matrix</h3>
                        <p className="text-[10px] text-unihub-textMuted mt-0.5">Your profile vs requirements</p>
                    </div>
                </div>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm ${score >= 70 ? 'bg-unihub-teal text-white' : score >= 40 ? 'bg-unihub-yellow text-yellow-900' : 'bg-unihub-coral text-white'}`}>
                    {score}% Match
                </span>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-2 mb-6 shadow-inner relative z-10 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${score >= 70 ? 'bg-unihub-teal' : score >= 40 ? 'bg-unihub-yellow' : 'bg-unihub-coral'}`} style={{ width: `${score}%` }}></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-3">
                    <p className="text-[9px] font-bold text-unihub-textMuted uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-unihub-teal" /> Matched Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {matched.map(s => <span key={s} className="bg-unihub-teal/5 text-unihub-teal text-[9px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-unihub-teal/10">{s}</span>)}
                        {matched.length === 0 && <span className="text-[10px] text-unihub-textMuted italic opacity-60">No matches found</span>}
                    </div>
                </div>
                <div className="space-y-3">
                    <p className="text-[9px] font-bold text-unihub-textMuted uppercase tracking-widest flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-unihub-coral" /> Skill Gaps
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {missing.map(s => <span key={s} className="bg-unihub-coral/5 text-unihub-coral text-[9px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-unihub-coral/10">{s}</span>)}
                        {missing.length === 0 && <span className="text-[9px] text-unihub-teal font-bold uppercase tracking-widest">Mastery Achieved</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const InternshipDetailModal = ({ internshipId, onClose, savedIds, onBookmarkToggle }) => {
    const { user: authUser } = useContext(AuthContext);
    const [internship, setInternship] = useState(null);
    const [myApplication, setMyApplication] = useState(null);
    const [mySkills, setMySkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [coverLetter, setCoverLetter] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [applying, setApplying] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);

    // Robust user/role identification
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    const user = authUser || (localUser.role ? localUser : null);
    const isStudent = user?.role === 'student';
    const token = user?.token || localUser.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const isSaved = savedIds.has(internshipId);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [internRes, skillRes, appRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/internships/${internshipId}`, config),
                    axios.get('http://localhost:5000/api/skills/me', config),
                    axios.get('http://localhost:5000/api/internships/my-applications', config)
                ]);
                setInternship(internRes.data);
                setMySkills(skillRes.data.gigs?.map(g => ({ name: g.title })) || skillRes.data.skills || []);
                
                // Find application for this internship
                const application = appRes.data.find(a => 
                    (a.internshipId._id === internshipId) || (a.internshipId === internshipId)
                );
                setMyApplication(application);
            } catch (err) {
                console.error(err);
                onClose();
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, [internshipId]);

    const handleApply = async (e) => {
        e.preventDefault();
        setApplying(true);
        try {
            const formData = new FormData();
            formData.append('coverLetter', coverLetter);
            if (resumeFile) formData.append('resume', resumeFile);

            const { data } = await axios.post(`http://localhost:5000/api/internships/${internshipId}/apply`, formData, {
                headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
            });
            
            setMyApplication(data); // Immediate UI update
            await Swal.fire({ title: 'Application Sent!', text: 'Your professional dossier has been transmitted.', icon: 'success', confirmButtonColor: '#14B8A6' });
        } catch (err) {
            Swal.fire({ title: 'Transmission Failed', text: err.response?.data?.message || 'Error occurred.', icon: 'error' });
        } finally {
            setApplying(false);
        }
    };

    const handleWithdraw = async () => {
        const result = await Swal.fire({
            title: 'Withdraw Application?',
            text: "You can re-apply until the deadline, but your current position will be lost.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FF6B6B',
            cancelButtonColor: '#64748B',
            confirmButtonText: 'Yes, Withdraw'
        });

        if (result.isConfirmed) {
            setWithdrawing(true);
            try {
                await axios.put(`http://localhost:5000/api/internships/applications/${myApplication._id}/withdraw`, {}, config);
                setMyApplication(null);
                Swal.fire('Withdrawn', 'Your application was successfully retracted.', 'success');
            } catch (err) {
                Swal.fire('Error', 'Failed to withdraw application.', 'error');
            } finally {
                setWithdrawing(false);
            }
        }
    };

    if (loading) return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl">
            <div className="w-12 h-12 border-4 border-unihub-teal/20 border-t-unihub-teal rounded-full animate-spin mb-4" />
        </div>
    );

    return (
        <div className="uni-modal-overlay">
            <div className="uni-modal max-w-2xl w-full overflow-hidden flex flex-col">
                {/* Header Section */}
                <div className="px-7 py-5 border-b border-slate-100 flex items-center gap-3 bg-white">
                    <div className="w-10 h-10 rounded-xl bg-unihub-teal/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-unihub-teal" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-base font-bold text-unihub-text leading-tight">{internship.title}</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-unihub-textMuted font-medium">{internship.company}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-xs text-unihub-textMuted font-medium">{internship.location}</span>
                            <span className={`ml-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${typeColors[internship.type]}`}>
                                {internship.type}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-unihub-coral hover:bg-unihub-coralHover text-white rounded-xl shadow-lg shadow-unihub-coral/20 transition-all active:scale-90">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-7 space-y-8 max-h-[calc(90vh-80px)] overflow-y-auto no-scrollbar">
                    {/* Action Bar (Bookmark & Application Status) */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-unihub-teal animate-pulse" />
                                <span className="text-[10px] font-bold text-unihub-teal uppercase tracking-widest">Active Opportunity</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => onBookmarkToggle(internshipId)} 
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isSaved ? 'bg-unihub-teal text-white' : 'bg-slate-50 text-slate-400 hover:text-unihub-teal border border-slate-100'}`}
                        >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
                            {isSaved ? 'Saved to Portfolio' : 'Save for later'}
                        </button>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Revenue', value: internship.stipend, icon: DollarSign },
                            { label: 'Duration', value: internship.duration, icon: Clock },
                            { label: 'Deadline', value: new Date(internship.deadline).toLocaleDateString(), icon: Calendar },
                            { label: 'Format', value: internship.type, icon: Activity },
                        ].map(({ label, value, icon: Icon }) => (
                            <div key={label} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                <p className="text-[9px] font-bold text-unihub-textMuted uppercase tracking-widest mb-1">{label}</p>
                                <p className="text-sm font-bold text-unihub-text flex items-center gap-2">
                                    <Icon className="w-3.5 h-3.5 text-unihub-teal" />
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Role Description */}
                    <div>
                        <label className="uni-label">Role Specification</label>
                        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line italic">
                                "{internship.description}"
                            </p>
                        </div>
                    </div>

                    {/* Requirements */}
                    <div>
                        <label className="uni-label">Requirements</label>
                        <div className="space-y-3">
                            {(internship.requirements || []).map((req, i) => (
                                <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-100 group hover:border-unihub-teal/30 transition-all">
                                    <div className="w-2 h-2 rounded-full bg-unihub-teal/40 group-hover:bg-unihub-teal" />
                                    <span className="text-sm text-slate-700 font-medium">{req}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Skill Analysis */}
                    {isStudent && (
                        <div>
                            <label className="uni-label">Compatibility Analysis</label>
                            <SkillGapAnalyzer internshipSkills={internship.skills} userSkills={mySkills} />
                        </div>
                    )}
 
                    {/* Application Flow Section */}
                    {isStudent && (
                        <div className="pt-4 border-t border-slate-100 pb-10">
                            {myApplication ? (
                                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                                    <div className="flex items-center justify-between">
                                        <label className="uni-label mb-0">Engagement Status</label>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-unihub-teal animate-pulse" />
                                            <span className="text-[10px] font-bold text-unihub-teal uppercase tracking-widest">Live Record</span>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100">
                                                <Activity className="w-6 h-6 text-unihub-teal" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-unihub-text uppercase tracking-wider mb-0.5">Application {myApplication.status}</p>
                                                <p className="text-[10px] text-unihub-textMuted uppercase">Submitted on {new Date(myApplication.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 w-full md:w-auto">
                                            {myApplication.status === 'pending' && (
                                                <button 
                                                    onClick={handleWithdraw}
                                                    disabled={withdrawing}
                                                    className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-unihub-coral/10 text-unihub-coral text-[10px] font-bold uppercase tracking-widest hover:bg-unihub-coral hover:text-white transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    {withdrawing ? 'Retracting...' : 'Withdraw'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-5 bg-white rounded-2xl border border-slate-100 italic text-xs text-slate-500 line-clamp-3">
                                        "{myApplication.coverLetter}"
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-unihub-teal/10 flex items-center justify-center flex-shrink-0">
                                            <Send className="w-5 h-5 text-unihub-teal" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-unihub-text">Apply Now</h3>
                                            <p className="text-[10px] text-unihub-textMuted uppercase tracking-wider mt-0.5">Submit your professional dossier for consideration</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleApply} className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <label className="uni-label mb-0 text-[10px]">Engagement Narrative</label>
                                            <div className="flex gap-4">
                                                {COVER_LETTER_TEMPLATES.map(t => (
                                                    <button key={t.label} type="button" onClick={() => setCoverLetter(t.text)} className="text-[10px] font-bold text-unihub-teal uppercase tracking-widest hover:underline">{t.label}</button>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <textarea 
                                            rows={5} 
                                            value={coverLetter} 
                                            onChange={e => setCoverLetter(e.target.value)}
                                            className="uni-input resize-none italic text-sm"
                                            placeholder="Articulate your unique value proposition..."
                                            required 
                                        />

                                        <div>
                                            <label className="uni-label text-[10px] mb-2">Resume / Portfolio PDF</label>
                                            <div className="relative group/file">
                                                <input type="file" onChange={e => setResumeFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                                <div className="w-full py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center group-hover/file:border-unihub-teal/50 transition-colors bg-slate-50">
                                                    <Send className="w-6 h-6 text-slate-300 group-hover/file:text-unihub-teal mb-2" />
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {resumeFile ? resumeFile.name : 'Select PDF Dossier'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <button type="submit" disabled={applying} className="btn btn-primary w-full py-4 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                                            {applying ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Zap className="w-4 h-4 fill-white" />
                                            )}
                                            {applying ? 'Transmitting...' : 'Submit Application'}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="px-7 py-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">
                        UniHub Career Services &copy; 2026 • Security ID: {internshipId.slice(-8).toUpperCase()}
                    </p>
                </div>
            </div>
        </div>
    );
};;

export default InternshipDetailModal;
