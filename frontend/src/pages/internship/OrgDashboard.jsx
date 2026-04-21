import { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { io } from 'socket.io-client';
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
    Globe,
    Mail,
    Pencil,
    Trash2,
    X,
    MessageCircle
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
    const [editTargetId, setEditTargetId] = useState(null);

    // Chat drawer state
    const [chatDrawer, setChatDrawer] = useState(null); // { applicant, conversationId, receiverId }
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [msgLoading, setMsgLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
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

    // Socket.io setup for real-time chat
    useEffect(() => {
        socketRef.current = io('http://localhost:5000');
        socketRef.current.on('receive_message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });
        return () => socketRef.current.disconnect();
    }, []);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const openChat = async (app) => {
        setMsgLoading(true);
        try {
            const { data: conv } = await axios.post('http://localhost:5000/api/internships/chat/conversation', {
                receiverId: app.applicantId._id,
                applicationId: app._id
            }, config);
            const { data: msgs } = await axios.get(`http://localhost:5000/api/internships/chat/messages/${conv._id}`, config);
            setMessages(msgs);
            setChatDrawer({ applicant: app.applicantId, conversationId: conv._id, receiverId: app.applicantId._id });
            socketRef.current.emit('join_conversation', conv._id);
        } catch (err) {
            console.error(err);
        } finally {
            setMsgLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !chatDrawer) return;
        const { conversationId, receiverId } = chatDrawer;
        const optimisticMsg = { _id: Date.now(), conversationId, senderId: user?._id || JSON.parse(localStorage.getItem('user'))?._id, receiverId, text: newMessage, createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, optimisticMsg]);
        const text = newMessage;
        setNewMessage('');
        try {
            const { data: saved } = await axios.post('http://localhost:5000/api/internships/chat/messages', { conversationId, receiverId, text }, config);
            socketRef.current.emit('send_message', { ...saved, conversationId });
        } catch (err) {
            console.error(err);
        }
    };

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
                title: 'Status Updated!',
                text: `Applicant status changed to ${status.toUpperCase()}`,
                icon: 'success',
                confirmButtonColor: '#14B8A6',
                timer: 2000,
                showConfirmButton: false,
                iconColor: '#14B8A6'
            });
        } catch (err) {
            Swal.fire({
                title: 'Update Failed',
                text: 'Could not update applicant status.',
                icon: 'error',
                confirmButtonColor: '#FF6B6B',
            });
            console.error(err);
        } finally {
            setUpdatingId(null);
        }
    };

    const handlePostJob = async (e) => {
        e.preventDefault();

        const today = new Date().toISOString().split('T')[0];
        if (postForm.deadline < today) {
            Swal.fire({
                title: 'Invalid Deadline',
                text: 'The temporal deadline cannot be set to a previous date.',
                icon: 'warning',
                confirmButtonColor: '#14B8A6'
            });
            return;
        }

        try {
            const payload = {
                ...postForm,
                requirements: typeof postForm.requirements === 'string' ? postForm.requirements.split(',').map(s => s.trim()).filter(s => s) : postForm.requirements,
                skills: typeof postForm.skills === 'string' ? postForm.skills.split(',').map(s => s.trim()).filter(s => s) : postForm.skills
            };

            if (editTargetId) {
                await axios.put(`http://localhost:5000/api/internships/${editTargetId}`, payload, config);
            } else {
                await axios.post('http://localhost:5000/api/internships', payload, config);
            }

            setPostModal(false);
            setEditTargetId(null);
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
                title: editTargetId ? 'Posting Updated!' : 'Strategic Posting Live!',
                text: editTargetId ? `The internship "${postForm.title}" has been updated.` : `Your internship "${postForm.title}" is now active in the repository.`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                iconColor: '#14B8A6'
            });
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to save job', 'error');
        }
    };

    const openEditModal = (job) => {
        setEditTargetId(job._id);
        setPostForm({
            title: job.title || '',
            company: job.company || user?.name || '',
            location: job.location || '',
            type: job.type || 'Remote',
            description: job.description || '',
            requirements: job.requirements ? job.requirements.join(', ') : '',
            skills: job.skills ? job.skills.join(', ') : '',
            stipend: job.stipend || '',
            duration: job.duration || '',
            deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : ''
        });
        setPostModal(true);
    };

    const handleDeleteJob = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Posting?',
            text: 'This will permanently remove the internship and all associated candidacies.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FF6B6B',
            cancelButtonColor: '#E2E8F0',
            confirmButtonText: 'Yes, Terminate',
            cancelButtonText: 'Abort'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:5000/api/internships/${id}`, config);
                if (selectedJob === id) {
                    setSelectedJob(null);
                    setApplicants([]);
                }
                fetchDashboard();
                Swal.fire({
                    title: 'Terminated',
                    text: 'The internship node was removed.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (err) {
                Swal.fire('Error', 'Failed to delete job', 'error');
            }
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
        <>
        <div className="max-w-7xl mx-auto space-y-10 pb-16">
            {/* Hero Section */}
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl mt-4 bg-gradient-to-br from-unihub-teal to-[#0d857a] group">
                <div className="absolute inset-0 overflow-hidden pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-white opacity-10 blur-[120px] rounded-full mix-blend-overlay animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white opacity-5 blur-[100px] rounded-full" />
                    <Globe className="absolute -right-16 -top-16 w-80 h-80 text-white opacity-10 rotate-12" strokeWidth={0.5} />
                </div>

                <div className="px-8 md:px-16 py-14 md:py-20 relative z-10">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[11px] font-bold text-white tracking-[0.2em] shadow-xl">
                            <Activity className="w-4 h-4 text-unihub-yellow" /> Talent Acquisition Hub
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-normal font-display">
                            Find Top <span className="text-unihub-yellow">Talent</span>.
                        </h1>
                        <p className="text-white/90 font-medium text-base md:text-lg max-w-xl leading-relaxed italic opacity-80">
                            {"Review applications, shortlist high-potential talent, and orchestrate your university internship portfolio with absolute precision.".split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                        </p>

                        <div className="pt-2">
                            <button
                                onClick={() => {
                                    setEditTargetId(null);
                                    setPostForm({ title: '', company: user?.name || '', location: '', type: 'Remote', description: '', requirements: '', skills: '', stipend: '', duration: '', deadline: '' });
                                    setPostModal(true);
                                }}
                                className="btn bg-white text-unihub-teal hover:bg-slate-50 shadow-xl"
                            >
                                <Plus className="w-4 h-4" />
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
                        onClick={() => {
                            setEditTargetId(null);
                            setPostForm({ title: '', company: user?.name || '', location: '', type: 'Remote', description: '', requirements: '', skills: '', stipend: '', duration: '', deadline: '' });
                            setPostModal(true);
                        }}
                        className="btn btn-primary"
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
                                            <div className="flex items-center gap-1.5 z-20">
                                                {!job.isActive && (
                                                    <span className="bg-unihub-coral text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg mr-2">Archived</span>
                                                )}
                                                <button onClick={(e) => { e.stopPropagation(); openEditModal(job); }} className={`p-1.5 rounded-lg active:scale-95 transition-colors ${selectedJob === job._id ? 'text-white hover:bg-white/20' : 'text-unihub-textMuted hover:text-unihub-teal hover:bg-black/5'}`} title="Edit Posting">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteJob(job._id); }} className={`p-1.5 rounded-lg active:scale-95 transition-colors ${selectedJob === job._id ? 'text-white hover:bg-white/20' : 'text-unihub-textMuted hover:text-unihub-coral hover:bg-black/5'}`} title="Delete Posting">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
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
                                                                <button
                                                                    onClick={() => openChat(app)}
                                                                    disabled={msgLoading}
                                                                    title={`Message ${app.applicantId?.name}`}
                                                                    className="btn btn-glass px-5 py-2.5 text-[10px] font-black tracking-[0.2em] uppercase flex items-center gap-2.5 border border-unihub-teal/20 text-unihub-teal shadow-sm active:scale-95 hover:bg-unihub-teal hover:text-white transition-all"
                                                                >
                                                                    <MessageCircle className="w-4 h-4" />
                                                                    Message
                                                                </button>

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
                                                                className={`btn ${app.status === s ? 'btn-primary' : 'btn-glass'} flex-1 text-[11px] uppercase tracking-wider`}
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
                                                                    placeholder="Write a private note about this applicant..."
                                                                    className="flex-1 uni-input bg-white/60 border-white/60 focus:bg-white text-xs font-bold font-display uppercase tracking-widest italic"
                                                                />
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => updateStatus(app._id, app.status, note)} className="btn btn-primary">Save Note</button>
                                                                    <button onClick={() => setNoteTarget(null)} className="btn btn-secondary">Cancel</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => { setNoteTarget(app._id); setNote(app.orgNote || ''); }}
                                                                className="flex items-center gap-3 text-[10px] font-black text-unihub-textMuted hover:text-unihub-teal transition-all uppercase tracking-[0.3em] font-display group/note-btn"
                                                            >
                                                                <Plus className="w-4 h-4 group-hover/note-btn:rotate-90 transition-transform" />
                                                                {app.orgNote ? `Private Note: "${app.orgNote}"` : 'Add Private Note'}
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-[100] p-6 pt-10 overflow-y-auto">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 relative mb-6">

                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-unihub-teal rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md flex-shrink-0">
                                    {editTargetId ? 'E' : 'I'}
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-800 leading-tight">
                                        {editTargetId ? 'Edit Posting' : 'New Posting'}
                                    </h2>
                                    <p className="text-xs text-slate-400 font-medium">
                                        {editTargetId ? 'Update internship details' : 'Create a new internship listing'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPostModal(false)}
                                className="w-9 h-9 rounded-xl bg-red-100 hover:bg-red-500 text-red-400 hover:text-white transition-all flex items-center justify-center active:scale-90 flex-shrink-0"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handlePostJob} className="space-y-4">

                            {/* Job Title */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Target Asset (Job Title)</label>
                                <div className="relative">
                                    <Target className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-unihub-teal" />
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-slate-50 border-0 rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-unihub-teal/30 transition-all"
                                        placeholder="Executive Developer Intern"
                                        value={postForm.title}
                                        onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Organization + Mode */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Origin Organization</label>
                                    <input
                                        readOnly
                                        type="text"
                                        className="w-full bg-slate-100 border-0 rounded-xl py-2.5 px-4 text-sm font-semibold text-slate-400 cursor-not-allowed"
                                        value={postForm.company}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Operation Mode</label>
                                    <select
                                        className="w-full bg-slate-50 border-0 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-unihub-teal/30 transition-all appearance-none cursor-pointer"
                                        value={postForm.type}
                                        onChange={e => setPostForm({ ...postForm, type: e.target.value })}
                                    >
                                        <option>Remote</option>
                                        <option>On-site</option>
                                        <option>Hybrid</option>
                                    </select>
                                </div>
                            </div>

                            {/* Location + Stipend */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Node Location</label>
                                    <div className="relative">
                                        <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-unihub-teal" />
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-slate-50 border-0 rounded-xl py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-unihub-teal/30 transition-all"
                                            placeholder="City, Country"
                                            value={postForm.location}
                                            onChange={e => setPostForm({ ...postForm, location: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Predicted Stipend</label>
                                    <div className="relative">
                                        <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-unihub-teal" />
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-slate-50 border-0 rounded-xl py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-unihub-teal/30 transition-all"
                                            placeholder="LKR 40,000 / Final Index"
                                            value={postForm.stipend}
                                            onChange={e => setPostForm({ ...postForm, stipend: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Duration + Deadline */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Engagement Span</label>
                                    <div className="relative">
                                        <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-unihub-teal" />
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-slate-50 border-0 rounded-xl py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-unihub-teal/30 transition-all"
                                            placeholder="e.g. 6 Cycles"
                                            value={postForm.duration}
                                            onChange={e => setPostForm({ ...postForm, duration: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Temporal Deadline</label>
                                    <div className="relative">
                                        <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-unihub-teal" />
                                    <input
                                            required
                                            type="date"
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full bg-slate-50 border-0 rounded-xl py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-unihub-teal/30 transition-all"
                                            value={postForm.deadline}
                                            onChange={e => setPostForm({ ...postForm, deadline: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Technology Matrix (Comma separated)</label>
                                <textarea
                                    required
                                    rows={2}
                                    className="w-full bg-slate-50 border-0 rounded-xl py-2.5 px-4 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-unihub-teal/30 transition-all resize-none"
                                    placeholder="React, TypeScript, Node Management..."
                                    value={postForm.skills}
                                    onChange={e => setPostForm({ ...postForm, skills: e.target.value })}
                                />
                            </div>

                            {/* Requirements */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Structural Requirements (Comma separated)</label>
                                <textarea
                                    required
                                    rows={2}
                                    className="w-full bg-slate-50 border-0 rounded-xl py-2.5 px-4 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-unihub-teal/30 transition-all resize-none"
                                    placeholder="Final Year Enrollment, GPA > 3.2..."
                                    value={postForm.requirements}
                                    onChange={e => setPostForm({ ...postForm, requirements: e.target.value })}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Engagement Narrative (Description)</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full bg-slate-50 border-0 rounded-xl py-2.5 px-4 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-unihub-teal/30 transition-all resize-none leading-relaxed"
                                    placeholder="Articulate the core mission and role impact..."
                                    value={postForm.description}
                                    onChange={e => setPostForm({ ...postForm, description: e.target.value })}
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="w-full bg-unihub-teal hover:bg-unihub-tealHover text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98] shadow-md mt-1"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                {editTargetId ? 'Sync Changes' : 'Broadcast Posting'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            
            {/* System Node Info */}
            <p className="text-center text-[10px] font-black text-unihub-textMuted opacity-20 uppercase tracking-[0.7em] pt-20">
                ORCHESTRATION NODE · REG-{user?.id?.substring(0, 12).toUpperCase() || 'SYS-NULL'}
            </p>
        </div>

        {/* Chat Drawer */}
        {chatDrawer && (
            <div className="fixed inset-0 z-[200] pointer-events-none">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto" onClick={() => setChatDrawer(null)} />

                {/* Drawer Panel */}
                <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col pointer-events-auto animate-in slide-in-from-right duration-300">
                    {/* Header */}
                    <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-unihub-teal to-teal-600">
                        <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                            {chatDrawer.applicant?.name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-black text-white text-sm leading-tight truncate">{chatDrawer.applicant?.name}</h3>
                            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest truncate">{chatDrawer.applicant?.email}</p>
                        </div>
                        <button onClick={() => setChatDrawer(null)} className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all active:scale-90">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
                                <MessageCircle className="w-12 h-12 text-slate-300" />
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Start the conversation</p>
                            </div>
                        )}
                        {messages.map((msg) => {
                            const myId = user?._id || JSON.parse(localStorage.getItem('user') || '{}')?._id;
                            const isMine = msg.senderId?.toString() === myId?.toString();
                            return (
                                <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                                        isMine 
                                        ? 'bg-unihub-teal text-white rounded-br-md' 
                                        : 'bg-white text-slate-700 border border-slate-100 rounded-bl-md'
                                    }`}>
                                        <p>{msg.text}</p>
                                        <p className={`text-[9px] font-bold mt-1 ${isMine ? 'text-white/60 text-right' : 'text-slate-400'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="px-4 py-4 border-t border-slate-100 bg-white flex items-center gap-3">
                        <input
                            type="text"
                            placeholder={`Message ${chatDrawer.applicant?.name}...`}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-unihub-teal transition-all"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!newMessage.trim()}
                            className="w-11 h-11 bg-unihub-teal text-white rounded-2xl flex items-center justify-center shadow-lg shadow-unihub-teal/30 hover:bg-teal-600 transition-all active:scale-90 disabled:opacity-40"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

const AnalyticsCard = ({ label, value, icon: Icon, color }) => {
    return (
        <div className="uni-card p-6 flex items-center gap-5 group relative overflow-hidden">
            <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center shadow-md ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="flex flex-col justify-center relative z-10">
                <p className="uni-label m-0 mb-1">{label}</p>
                <p className="text-2xl font-bold text-unihub-text leading-none">{value}</p>
            </div>
            {/* Decor */}
            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-unihub-teal/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
};

export default OrgDashboard;
