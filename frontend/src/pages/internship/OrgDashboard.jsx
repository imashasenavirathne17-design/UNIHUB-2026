import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/AuthContext';
import {
    Briefcase,
    Users,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronRight,
    MessageSquare,
    FileText,
    MoreVertical,
    TrendingUp,
    Plus,
    Calendar,
    Search,
    DollarSign,
    MapPin,
    Target,
    Activity,
    Send,
    ShieldCheck,
    Globe
} from 'lucide-react';

const statusColors = {
    pending: 'badge-amber',
    shortlisted: 'badge-teal',
    accepted: 'badge-teal',
    rejected: 'badge-coral',
};

const OrgDashboard = () => {
    const { user } = useContext(AuthContext);
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [loadingApplicants, setLoadingApplicants] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [note, setNote] = useState('');
    const [noteTarget, setNoteTarget] = useState(null);
    const [postModal, setPostModal] = useState(false);
    const [postForm, setPostForm] = useState({
        title: '', company: user?.name || '', location: '', type: 'Remote',
        description: '', requirements: '', skills: '',
        stipend: '', duration: '', deadline: ''
    });

    const token = JSON.parse(localStorage.getItem('user'))?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchDashboard = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/internships/org/dashboard', config);
            setInternships(data);
            if (data.length > 0 && !selectedJob) loadApplicants(data[0]._id);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const loadApplicants = async (jobId) => {
        setSelectedJob(jobId);
        setLoadingApplicants(true);
        try {
            const { data } = await axios.get(`http://localhost:5000/api/internships/${jobId}/applications`, config);
            setApplicants(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingApplicants(false);
        }
    };

    const updateStatus = async (appId, status, orgNote = '') => {
        setUpdatingId(appId);
        try {
            const { data } = await axios.put(
                `http://localhost:5000/api/internships/applications/${appId}/status`,
                { status, orgNote },
                config
            );
            setApplicants(prev => prev.map(a => a._id === appId ? data : a));
            setNoteTarget(null);
            setNote('');
            Swal.fire({
                title: 'Status Updated',
                text: `Applicant status changed to ${status.toUpperCase()}`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
                background: '#ffffff',
                color: '#1e293b',
                iconColor: '#14B8A6'
            });
        } catch (err) {
            Swal.fire({
                title: 'Update Failed',
                text: 'Could not update applicant status',
                icon: 'error',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000
            });
            console.error(err);
        } finally {
            setUpdatingId(null);
        }
    };

    const handlePostJob = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/internships', {
                ...postForm,
                requirements: postForm.requirements.split(',').map(s => s.trim()).filter(s => s),
                skills: postForm.skills.split(',').map(s => s.trim()).filter(s => s)
            }, config);
            setPostModal(false);
            setPostForm({ 
                title: '', 
                company: user?.name || '', 
                location: '', 
                type: 'Remote', 
                description: '', 
                requirements: '', 
                skills: '', 
                stipend: '', 
                duration: '', 
                deadline: '' 
            });
            fetchDashboard();
            Swal.fire({
                title: 'Strategic Posting Live!',
                text: `Your internship "${postForm.title}" is now active in the repository.`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                iconColor: '#14B8A6'
            });
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to post job', 'error');
        }
    };

    const selectedJobData = internships.find(i => i._id === selectedJob);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
             <div className="w-16 h-16 border-4 border-unihub-teal/20 border-t-unihub-teal rounded-full animate-spin shadow-inner" />
             <p className="text-xs font-black text-unihub-textMuted uppercase tracking-widest animate-pulse font-display">Syncing Executive Node...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-16">
            {/* Hero */}
            <div className="relative overflow-hidden py-16 md:py-24 rounded-[40px] shadow-2xl mt-4 glass group">
                <div className="absolute inset-0 -z-10 group-hover:scale-110 transition-transform duration-1000">
                    <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-unihub-teal/20 blur-[100px] rounded-full" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-unihub-coral/20 blur-[100px] rounded-full" />
                    <Globe className="w-96 h-96 absolute -right-20 -top-20 text-unihub-teal/5 animate-pulse rotate-12" strokeWidth={0.5} />
                    <ShieldCheck className="w-64 h-64 absolute left-10 bottom-10 text-unihub-coral/5 -rotate-12" strokeWidth={0.5} />
                </div>

                <div className="px-10 md:px-16 relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="max-w-2xl space-y-8 text-center md:text-left">
                        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-unihub-teal/10 border border-unihub-teal/20 text-[11px] font-black text-unihub-teal uppercase tracking-[0.2em] shadow-sm font-display mb-2">
                            <Activity className="w-4 h-4" /> Talent Acquisition Hub
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-unihub-text leading-[1.1] tracking-tighter font-display">
                            Manage Your <span className="text-gradient">Greatest Assets</span>.
                        </h1>
                        <p className="text-unihub-textMuted font-medium text-base md:text-lg max-w-xl leading-relaxed italic">
                            Review applications, shortlist high-potential talent, and orchestrate your university internship portfolio with absolute precision.
                        </p>
                        <div className="pt-2">
                            <button
                                onClick={() => setPostModal(true)}
                                className="btn btn-primary px-10 py-4 rounded-[20px] font-black text-[12px] tracking-[0.2em] shadow-xl hover:shadow-unihub-teal/30 active:scale-95 group/btn font-display uppercase flex items-center gap-3"
                            >
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                                Initiate New Posting
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {internships.length === 0 ? (
                <div className="text-center py-32 glass rounded-[40px] border-2 border-dashed border-black/5 space-y-8 max-w-4xl mx-auto shadow-sm group">
                    <div className="w-24 h-24 bg-gradient-to-br from-unihub-teal/5 to-unihub-coral/5 rounded-[32px] flex items-center justify-center mx-auto border border-black/5 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                        <Briefcase className="w-10 h-10 text-slate-300 group-hover:text-unihub-teal transition-colors" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-2xl font-black text-unihub-text font-display uppercase tracking-tight">Postings Node Inactive</h3>
                        <p className="text-unihub-textMuted max-w-sm mx-auto text-base font-medium leading-relaxed italic">Start by projecting your first internship opportunity into the platform repository.</p>
                    </div>
                    <button
                        onClick={() => setPostModal(true)}
                        className="btn btn-secondary px-10 py-4 rounded-[20px] font-black text-[11px] tracking-[0.2em] shadow-lg group-hover:shadow-unihub-coral/30 font-display uppercase flex items-center gap-3"
                    >
                         <Plus className="w-4 h-4" /> Create First Listing
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 px-2">
                    {/* Sidebar: Your Postings */}
                    <div className="lg:col-span-1 space-y-6">
                         <div className="flex items-center gap-3 px-2">
                            <div className="w-1.5 h-6 bg-unihub-teal rounded-full shadow-[0_0_10px_rgba(20,184,166,0.3)]" />
                            <h2 className="text-[11px] font-black text-unihub-text uppercase tracking-[0.2em] font-display">Active Records ({internships.length})</h2>
                        </div>
                        <div className="space-y-4 scrollbar-hide lg:max-h-[800px] overflow-y-auto pr-2">
                            {internships.map(job => (
                                <button
                                    key={job._id}
                                    onClick={() => loadApplicants(job._id)}
                                    className={`w-full text-left p-6 rounded-[28px] border-2 transition-all group relative overflow-hidden font-display shadow-xl ${selectedJob === job._id
                                            ? 'bg-unihub-teal border-unihub-teal text-white -translate-y-1 shadow-unihub-teal/20'
                                            : 'glass border-white/60 text-unihub-text hover:border-unihub-teal/40 hover:-translate-y-0.5'
                                        }`}
                                >
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className={`font-black text-[10px] uppercase tracking-widest ${selectedJob === job._id ? 'text-white/70' : 'text-unihub-teal'}`}>
                                                {job.totalApplicants} CANDIDATES
                                            </p>
                                            {!job.isActive && (
                                                <span className="bg-unihub-coral text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">Archived</span>
                                            )}
                                        </div>
                                        <p className={`font-black text-sm leading-snug line-clamp-2 ${selectedJob === job._id ? 'text-white' : 'text-unihub-text'}`}>
                                            {job.title}
                                        </p>

                                        {/* Status Distribution Bar */}
                                        {job.totalApplicants > 0 && (
                                            <div className="flex h-1.5 rounded-full overflow-hidden mt-6 bg-black/5 shadow-inner border border-white/20">
                                                {Object.entries(job.applicantCounts).map(([s, c]) => c > 0 && (
                                                    <div key={s} className={`${s === 'accepted' ? 'bg-emerald-400' :
                                                            s === 'shortlisted' ? 'bg-blue-400' :
                                                                s === 'pending' ? 'bg-unihub-yellow' : 'bg-unihub-coral'
                                                        } shadow-[0_0_5px] shadow-current opacity-80`} style={{ width: `${(c / job.totalApplicants) * 100}%` }}></div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Decor */}
                                    <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-white/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-10">
                        {/* Job Summary Stats */}
                        {selectedJobData && (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
                                <AnalyticsCard label="Pending" value={selectedJobData.applicantCounts.pending} icon={Clock} color="bg-unihub-teal/5 text-unihub-teal" />
                                <AnalyticsCard label="Strategic List" value={selectedJobData.applicantCounts.shortlisted} icon={TrendingUp} color="bg-unihub-teal/5 text-unihub-teal" />
                                <AnalyticsCard label="Onboarded" value={selectedJobData.applicantCounts.accepted} icon={CheckCircle2} color="bg-unihub-teal/5 text-unihub-teal" />
                                <AnalyticsCard label="Yield Rate" value={Math.round((selectedJobData.applicantCounts.accepted / (selectedJobData.totalApplicants || 1)) * 100) + '%'} icon={Target} color="bg-unihub-teal/5 text-unihub-teal" />
                            </div>
                        )}

                        {/* Applicants List */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between px-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-8 bg-unihub-coral rounded-full shadow-[0_0_15px_rgba(255,107,107,0.3)]" />
                                    <h3 className="text-3xl font-black text-unihub-text font-display tracking-tighter uppercase">CANDIDATE REPOSITORY</h3>
                                </div>
                                {!loadingApplicants && (
                                    <span className="text-[11px] font-black text-unihub-textMuted bg-black/5 border border-black/5 px-4 py-1.5 rounded-full uppercase tracking-widest">{applicants.length} TOTAL RECORDS</span>
                                )}
                            </div>

                            {loadingApplicants ? (
                                <div className="space-y-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-48 glass-card rounded-[40px] animate-pulse border-white/60"></div>
                                    ))}
                                </div>
                            ) : applicants.length === 0 ? (
                                <div className="text-center py-32 glass rounded-[40px] border-2 border-dashed border-black/5 space-y-8 group">
                                    <div className="w-24 h-24 bg-gradient-to-br from-unihub-teal/5 to-unihub-coral/5 rounded-[32px] flex items-center justify-center mx-auto border border-black/5 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                                        <Users className="w-10 h-10 text-slate-300 group-hover:text-unihub-teal transition-colors" strokeWidth={1.5} />
                                    </div>
                                    <p className="text-[11px] font-black text-unihub-textMuted uppercase tracking-[0.3em] font-display opacity-60">Zero candidates identified for this node</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {applicants.map((app, i) => (
                                        <div key={app._id} className="uni-card group relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 shadow-xl" style={{ animationDelay: `${i * 100}ms` }}>
                                            <div className="p-8 md:p-10">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
                                                    <div className="flex items-start gap-8">
                                                        <div className="w-20 h-20 rounded-[24px] bg-white/60 backdrop-blur-xl border border-white/80 shadow-xl flex items-center justify-center text-3xl font-black text-unihub-teal group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 flex-shrink-0 relative">
                                                            <span className="relative z-10">{app.applicantId?.name?.[0]}</span>
                                                            <div className="absolute inset-0 bg-unihub-teal/5 rounded-[24px]" />
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div className="space-y-1">
                                                                <h4 className="text-2xl font-black text-unihub-text group-hover:text-primary transition-colors font-display tracking-tight leading-tight">{app.applicantId?.name}</h4>
                                                                <p className="text-xs font-bold text-unihub-textMuted uppercase tracking-widest opacity-60 flex items-center gap-2">
                                                                    <Mail className="w-3.5 h-3.5 text-unihub-teal/60" /> {app.applicantId?.email}
                                                                </p>
                                                            </div>
                                                            
                                                            <div className="flex flex-wrap items-center gap-4">
                                                                {app.resumeData?.url && (
                                                                    <a href={`http://localhost:5000${app.resumeData.url}`} target="_blank" rel="noopener noreferrer" 
                                                                       className="btn btn-glass px-5 py-2.5 text-[10px] font-black tracking-[0.2em] uppercase flex items-center gap-2.5 border border-white/60 shadow-sm active:scale-95 group/cv transition-all">
                                                                        <FileText className="w-4 h-4 text-unihub-teal group-hover/cv:scale-110 transition-transform" />
                                                                        Inspect CV
                                                                    </a>
                                                                )}

                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex items-center gap-2 text-[10px] font-black text-unihub-textMuted uppercase tracking-widest opacity-60">
                                                                        <Calendar className="w-4 h-4 text-unihub-teal/60" />
                                                                        {new Date(app.createdAt).toLocaleDateString()}
                                                                    </div>
                                                                    <span className={`badge ${statusColors[app.status]} shadow-sm uppercase tracking-widest text-[9px] px-3 py-1.5`}>
                                                                        {app.status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center justify-end gap-3 lg:w-72">
                                                        {['pending', 'shortlisted', 'accepted', 'rejected'].map(s => (
                                                            <button
                                                                key={s}
                                                                onClick={() => updateStatus(app._id, s)}
                                                                disabled={updatingId === app._id || app.status === s}
                                                                className={`text-[9px] font-black px-4 py-2.5 rounded-xl border-2 transition-all disabled:opacity-50 uppercase tracking-[0.2em] font-display flex-1 min-w-[120px] ${app.status === s
                                                                        ? 'bg-unihub-teal border-unihub-teal text-white shadow-lg shadow-unihub-teal/30 scale-105'
                                                                        : 'glass border-white/60 text-unihub-textMuted hover:border-unihub-teal/40 hover:text-unihub-teal hover:bg-white active:scale-95'
                                                                    }`}
                                                            >
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="mt-8 glass p-8 rounded-[32px] border border-white/40 shadow-inner group/quote relative overflow-hidden">
                                                    <MessageSquare className="absolute -top-4 left-6 w-12 h-12 text-black/5 rotate-12" />
                                                    <p className="text-base text-unihub-text leading-relaxed italic font-medium relative z-10 opacity-80 group-hover/quote:opacity-100 transition-opacity">
                                                        "{app.coverLetter}"
                                                    </p>

                                                    {/* Note Area */}
                                                    <div className="mt-8 pt-8 border-t border-black/5 relative z-10">
                                                        {noteTarget === app._id ? (
                                                            <div className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-top-4">
                                                                <input
                                                                    type="text"
                                                                    autoFocus
                                                                    value={note}
                                                                    onChange={e => setNote(e.target.value)}
                                                                    placeholder="Append private orchestration note..."
                                                                    className="flex-1 uni-input bg-white/60 border-white/60 focus:bg-white text-xs font-bold font-display uppercase tracking-widest italic"
                                                                />
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => updateStatus(app._id, app.status, note)} className="btn btn-primary px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl font-display">Sync Note</button>
                                                                    <button onClick={() => setNoteTarget(null)} className="btn btn-secondary px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest font-display">Withdraw</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => { setNoteTarget(app._id); setNote(app.orgNote || ''); }}
                                                                className="flex items-center gap-3 text-[10px] font-black text-unihub-textMuted hover:text-unihub-teal transition-all uppercase tracking-[0.3em] font-display group/note-btn"
                                                            >
                                                                <Plus className="w-4 h-4 group-hover/note-btn:rotate-90 transition-transform" />
                                                                {app.orgNote ? `Executive Note: "${app.orgNote}"` : 'Append Strategic Intel'}
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Decor */}
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-unihub-teal/5 rounded-full blur-3xl opacity-0 group-hover/quote:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                            
                                            {/* Visual Bottom Border */}
                                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-unihub-teal to-unihub-coral opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Post Job Modal */}
            {postModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
                    <div className="glass-card rounded-[48px] shadow-[0_0_100px_rgba(0,0,0,0.2)] p-12 max-w-3xl w-full max-h-[85vh] overflow-y-auto relative border border-white/60 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 no-scrollbar">
                        <button onClick={() => setPostModal(false)} className="absolute top-10 right-10 w-12 h-12 rounded-2xl bg-black/5 hover:bg-unihub-coral hover:text-white transition-all flex items-center justify-center active:scale-90 group/close">
                            <XCircle className="w-6 h-6 transition-transform group-hover:rotate-90" />
                        </button>

                        <div className="mb-12">
                            <div className="w-20 h-20 bg-unihub-teal/10 text-unihub-teal rounded-[28px] flex items-center justify-center mb-8 shadow-inner ring-8 ring-unihub-teal/5 animate-pulse">
                                <Plus className="w-10 h-10" />
                            </div>
                            <h2 className="text-4xl font-black text-unihub-text font-display tracking-tighter uppercase mb-2">Initialize Posting</h2>
                            <p className="text-sm font-bold text-unihub-textMuted uppercase tracking-widest opacity-60 italic font-display">Define the parameters for your next strategic acquisition.</p>
                        </div>

                        <form onSubmit={handlePostJob} className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-4">
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.3em] pl-2 font-display">Target Asset (Job Title)</label>
                                <div className="relative group/input">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-unihub-teal transition-colors">
                                        <Target className="w-5 h-5" />
                                    </div>
                                    <input
                                        required
                                        type="text"
                                        className="w-full uni-input pl-16 py-6 text-base font-black tracking-tight"
                                        placeholder="Executive Developer Intern"
                                        value={postForm.title}
                                        onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.3em] pl-2 font-display">Origin Organization</label>
                                <input
                                    readOnly
                                    type="text"
                                    className="w-full uni-input bg-black/5 text-slate-400 cursor-not-allowed opacity-60 font-black tracking-widest text-xs"
                                    value={postForm.company}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.3em] pl-2 font-display">Operation Mode</label>
                                <select
                                    className="w-full uni-input py-6 text-[11px] font-black uppercase tracking-widest appearance-none cursor-pointer"
                                    value={postForm.type}
                                    onChange={e => setPostForm({ ...postForm, type: e.target.value })}
                                >
                                    <option>Remote</option>
                                    <option>On-site</option>
                                    <option>Hybrid</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.3em] pl-2 font-display">Node Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <input
                                        required
                                        type="text"
                                        className="w-full uni-input pl-16 py-6"
                                        placeholder="City, Country"
                                        value={postForm.location}
                                        onChange={e => setPostForm({ ...postForm, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.3em] pl-2 font-display">Predicted Stipend</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <input
                                        required
                                        type="text"
                                        className="w-full uni-input pl-16 py-6 font-black"
                                        placeholder="LKR 40,000 / Final Index"
                                        value={postForm.stipend}
                                        onChange={e => setPostForm({ ...postForm, stipend: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.3em] pl-2 font-display">Engagement Span</label>
                                <div className="relative">
                                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <input
                                        required
                                        type="text"
                                        className="w-full uni-input pl-16 py-6 font-black"
                                        placeholder="e.g. 6 Cycles"
                                        value={postForm.duration}
                                        onChange={e => setPostForm({ ...postForm, duration: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.3em] pl-2 font-display">Temporal Deadline</label>
                                <div className="relative">
                                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <input
                                        required
                                        type="date"
                                        className="w-full uni-input pl-16 py-6 font-black uppercase tracking-widest text-xs"
                                        value={postForm.deadline}
                                        onChange={e => setPostForm({ ...postForm, deadline: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 md:col-span-2">
                                <label className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.3em] pl-2 font-display">Technology Matrix (Comma separated)</label>
                                <textarea
                                    required
                                    rows={2}
                                    className="w-full uni-input py-6 text-sm font-bold italic"
                                    placeholder="React, TypeScript, Strategic Node Management..."
                                    value={postForm.skills}
                                    onChange={e => setPostForm({ ...postForm, skills: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3 md:col-span-2">
                                <label className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.3em] pl-2 font-display">Structural Requirements (Comma separated)</label>
                                <textarea
                                    required
                                    rows={2}
                                    className="w-full uni-input py-6 text-sm font-bold italic"
                                    placeholder="Final Year Enrollment, GPA Threshold > 3.2..."
                                    value={postForm.requirements}
                                    onChange={e => setPostForm({ ...postForm, requirements: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3 md:col-span-2">
                                <label className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.3em] pl-2 font-display">Engagement Narrative (Description)</label>
                                <textarea
                                    required
                                    rows={5}
                                    className="w-full uni-input py-6 text-base font-medium italic leading-relaxed"
                                    placeholder="Articulate the core mission and strategic role impact..."
                                    value={postForm.description}
                                    onChange={e => setPostForm({ ...postForm, description: e.target.value })}
                                />
                            </div>

                            <div className="md:col-span-2 pt-10">
                                <button type="submit" className="btn btn-primary w-full py-6 text-[16px] font-black uppercase tracking-[0.4em] font-display shadow-2xl hover:shadow-unihub-teal/30 active:scale-95 flex items-center justify-center gap-4">
                                    <Send className="w-6 h-6" />
                                    Broadcast Posting
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* System Node Info */}
            <p className="text-center text-[10px] font-black text-unihub-textMuted opacity-20 uppercase tracking-[0.7em] pt-20">
                ORCHESTRATION NODE · REG-{user?.id?.substring(0, 12).toUpperCase() || 'SYS-NULL'}
            </p>
        </div>
    );
};

const AnalyticsCard = ({ label, value, icon: Icon, color }) => {
    return (
        <div className="glass p-8 rounded-[36px] border border-white/60 shadow-2xl flex items-center gap-6 group hover:translate-y-[-4px] transition-all relative overflow-hidden">
            <div className={`w-[60px] h-[60px] shrink-0 rounded-[22px] flex items-center justify-center border border-white/40 shadow-xl ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7" />
            </div>
            <div className="flex flex-col justify-center relative z-10">
                <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.3em] mb-1 font-display opacity-80">{label}</p>
                <p className="text-3xl font-black text-unihub-text leading-none font-display tracking-tighter">{value}</p>
            </div>
            {/* Decor */}
            <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-unihub-teal/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
};

export default OrgDashboard;
