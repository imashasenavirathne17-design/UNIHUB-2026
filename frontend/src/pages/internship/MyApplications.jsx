import { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { io } from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';
import { 
    ClipboardCheck, 
    TrendingUp, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    RotateCcw, 
    ChevronRight, 
    Search,
    MapPin,
    Calendar,
    ArrowUpRight,
    SearchX,
    Award,
    Activity,
    Layers,
    ChevronDown,
    Trash2,
    Edit3,
    MessageCircle,
    X,
    Send
} from 'lucide-react';

const statusStyles = {
    pending: 'badge-amber',
    shortlisted: 'badge-teal',
    accepted: 'badge-teal',
    rejected: 'badge-coral',
    withdrawn: 'bg-black/5 text-slate-400 border border-black/5',
};

const statusIcons = { 
    pending: <Clock className="w-3.5 h-3.5" />, 
    shortlisted: <Search className="w-3.5 h-3.5" />, 
    accepted: <CheckCircle2 className="w-3.5 h-3.5" />, 
    rejected: <XCircle className="w-3.5 h-3.5" />, 
    withdrawn: <RotateCcw className="w-3.5 h-3.5" /> 
};

const UI_StatusBadge = ({ status }) => (
    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm border border-white/20 ${statusStyles[status]}`}>
        {statusIcons[status]}
        {status}
    </span>
);

const MyApplications = () => {
    const { user } = useContext(AuthContext);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editCoverLetter, setEditCoverLetter] = useState("");
    const [editResume, setEditResume] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    // Chat state
    const [chatDrawer, setChatDrawer] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [msgLoading, setMsgLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    const token = JSON.parse(localStorage.getItem('user'))?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchApplications = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/internships/my-applications', config);
            setApplications(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchApplications(); }, []);

    // Socket.io real-time connection
    useEffect(() => {
        socketRef.current = io('http://localhost:5000');
        socketRef.current.on('receive_message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });
        return () => socketRef.current.disconnect();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const openChat = async (app) => {
        const orgId = app.internshipId?.postedBy?._id;
        if (!orgId) return;
        setMsgLoading(true);
        try {
            const { data: conv } = await axios.post('http://localhost:5000/api/internships/chat/conversation', {
                receiverId: orgId,
                applicationId: app._id
            }, config);
            const { data: msgs } = await axios.get(`http://localhost:5000/api/internships/chat/messages/${conv._id}`, config);
            setMessages(msgs);
            setChatDrawer({ org: app.internshipId?.postedBy, company: app.internshipId?.company, conversationId: conv._id, receiverId: orgId });
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
        const myId = user?._id || JSON.parse(localStorage.getItem('user') || '{}')?._id;
        const optimisticMsg = { _id: Date.now(), conversationId, senderId: myId, receiverId, text: newMessage, createdAt: new Date().toISOString() };
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

    const handleDelete = async (appId) => {
        const result = await Swal.fire({
            title: 'Delete Application?',
            text: 'This will permanently remove your application. This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FF6B6B',
            cancelButtonColor: '#64748B',
            confirmButtonText: 'Yes, Delete It',
            cancelButtonText: 'Cancel',
        });
        if (!result.isConfirmed) return;
        setDeleteId(appId);
        try {
            await axios.delete(`http://localhost:5000/api/internships/applications/${appId}`, config);
            Swal.fire({ title: 'Deleted!', text: 'Your application has been permanently removed.', icon: 'success', confirmButtonColor: '#14B8A6' });
            fetchApplications();
        } catch (err) {
            Swal.fire({ title: 'Error', text: err.response?.data?.message || 'Failed to delete application.', icon: 'error' });
        } finally {
            setDeleteId(null);
        }
    };

    const handleUpdate = async (appId) => {
        if (!editCoverLetter.trim()) return;
        setUpdatingId(appId);
        try {
            const formData = new FormData();
            formData.append('coverLetter', editCoverLetter);
            if (editResume) {
                formData.append('resume', editResume);
            }
            
            const formDataConfig = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
            await axios.put(`http://localhost:5000/api/internships/applications/${appId}`, formData, formDataConfig);
            setEditingId(null);
            fetchApplications();
        } catch (err) {
            console.error(err);
        } finally {
            setUpdatingId(null);
        }
    };

    const counts = { pending: 0, shortlisted: 0, accepted: 0, rejected: 0, withdrawn: 0 };
    applications.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });
    const total = applications.length;

    return (
        <>
        <div className="max-w-7xl mx-auto space-y-10 pb-16">
            {/* Hero Section */}
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl mt-4 bg-gradient-to-br from-unihub-coral to-[#de3047]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-white opacity-10 blur-[120px] rounded-full mix-blend-overlay animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white opacity-5 blur-[100px] rounded-full" />
                    <ClipboardCheck className="absolute -right-16 -top-16 w-80 h-80 text-white opacity-10 rotate-12" strokeWidth={0.5} />
                </div>

                <div className="px-8 md:px-16 py-14 md:py-20 relative z-10">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[11px] font-bold text-white tracking-[0.2em] shadow-xl">
                            <Layers className="w-4 h-4 text-unihub-yellow" /> Strategic Tracking
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter font-display">
                            Track Your <span className="text-unihub-yellow">Career Growth</span>.
                        </h1>
                        <p className="text-white/80 font-medium text-base max-w-xl leading-relaxed italic opacity-90">
                            {"Monitor the live status of your internship applications and manage your professional trajectory within the UniHub ecosystem.".split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <Link to="/internships" className="inline-flex items-center gap-2 bg-white text-unihub-coral px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-unihub-yellow hover:text-unihub-text transition-all active:scale-95">
                                Browse Opportunities <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="w-16 h-16 border-4 border-unihub-teal/20 border-t-unihub-teal rounded-full animate-spin shadow-inner" />
                    <p className="text-xs font-black text-unihub-textMuted uppercase tracking-widest animate-pulse font-display text-center">Harvesting Engagement Data...</p>
                </div>
            ) : total === 0 ? (
                <div className="text-center py-32 glass rounded-[40px] border-2 border-dashed border-black/5 space-y-8 max-w-4xl mx-auto shadow-sm group">
                    <div className="w-24 h-24 bg-gradient-to-br from-unihub-teal/5 to-unihub-coral/5 rounded-[32px] flex items-center justify-center mx-auto border border-black/5 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                        <SearchX className="w-10 h-10 text-slate-300 group-hover:text-unihub-teal transition-colors" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-2xl font-black text-unihub-text font-display uppercase tracking-tight">Zero applications tracked</h3>
                        <p className="text-unihub-textMuted max-w-sm mx-auto text-base font-medium leading-relaxed italic">Your professional journey begins with the first engagement. Explore our board to find your ideal role.</p>
                    </div>
                    <Link to="/internships" className="btn btn-secondary px-10 py-4 rounded-[20px] font-black text-[11px] tracking-[0.2em] shadow-lg group-hover:shadow-unihub-coral/30 font-display uppercase">
                        Start Exploration
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 px-2">
                    {/* Performance Matrix / Summary */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="glass-card p-8 border border-white/60 shadow-2xl relative overflow-hidden group">
                            <h3 className="text-[11px] font-black text-unihub-text uppercase tracking-[0.2em] mb-10 flex items-center gap-3 font-display">
                                <TrendingUp className="w-4.5 h-4.5 text-unihub-teal" />
                                Growth Matrix
                            </h3>
                            
                            <div className="space-y-5 relative z-10">
                                {Object.entries(counts).map(([status, count]) => (
                                    <div key={status} className={`flex justify-between items-center p-4 rounded-[22px] border transition-all duration-300 ${count > 0 ? (statusStyles[status] + ' border-white/40 shadow-xl scale-[1.02]') : 'bg-black/5 border-transparent opacity-40 shadow-none'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-white/40 rounded-xl flex items-center justify-center shadow-inner">
                                                {statusIcons[status]}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
                                        </div>
                                        <span className="font-display font-black text-xl leading-none">{count}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 pt-8 border-t border-black/5 relative z-10">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-black text-unihub-textMuted uppercase tracking-widest opacity-60">Engagement Yield</span>
                                    <span className="text-sm font-black text-unihub-teal font-display">{Math.round((counts.accepted / Math.max(total - counts.withdrawn, 1)) * 100)}%</span>
                                </div>
                                <div className="h-2.5 bg-black/5 rounded-full overflow-hidden shadow-inner">
                                    <div 
                                        className="h-full bg-unihub-teal rounded-full shadow-[0_0_8px_rgba(20,184,166,0.5)] transition-all duration-1000" 
                                        style={{ width: `${(counts.accepted / Math.max(total - counts.withdrawn, 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Decor */}
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-unihub-teal/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>


                    </div>

                    {/* Applications List */}
                    <div className="lg:col-span-3 space-y-10">
                        <div className="flex items-center justify-between px-4">
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-8 bg-unihub-teal rounded-full shadow-[0_0_15px_rgba(20,184,166,0.3)]" />
                                <h2 className="text-3xl font-black text-unihub-text font-display tracking-tighter uppercase">RECENT ENGAGEMENTS</h2>
                            </div>
                            <span className="text-[11px] font-black text-unihub-teal bg-unihub-teal/10 border border-unihub-teal/20 px-4 py-1.5 rounded-2xl shadow-sm uppercase tracking-widest">{total} RECORDS</span>
                        </div>

                        <div className="space-y-6">
                            {applications.map((app, i) => {
                                const internship = app.internshipId;
                                const isExpanded = expandedId === app._id;
                                
                                return (
                                    <div key={app._id} className="uni-card group relative overflow-hidden transition-all duration-500 animate-in fade-in slide-in-from-bottom-6" style={{ animationDelay: `${i * 100}ms` }}>
                                        <div className="p-8 md:p-10">
                                            <div className="flex flex-col md:flex-row gap-8">
                                                <div className="w-20 h-20 rounded-[24px] bg-white/60 backdrop-blur-xl border border-white/80 shadow-xl flex items-center justify-center text-3xl font-black text-unihub-teal group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 flex-shrink-0 relative">
                                                    <span className="relative z-10">{internship?.company?.charAt(0) || '?'}</span>
                                                    <div className="absolute inset-0 bg-unihub-teal/5 rounded-[24px]" />
                                                </div>
                                                
                                                <div className="flex-1 space-y-5">
                                                    <div className="flex items-start justify-between flex-wrap gap-6">
                                                        <div className="space-y-3">
                                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                                                <h3 className="text-2xl font-black text-unihub-text group-hover:text-primary transition-colors font-display tracking-tight leading-tight">
                                                                    {internship?.title || 'Engagement Inactive'}
                                                                </h3>
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-slate-200 text-2xl font-thin opacity-50">/</span>
                                                                    <UI_StatusBadge status={app.status} />
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-bold text-unihub-textMuted uppercase tracking-widest opacity-70">
                                                                <span className="flex items-center gap-2"><ArrowUpRight className="w-4 h-4 text-unihub-teal/60" /> {internship?.company}</span>
                                                                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-unihub-teal/60" /> {internship?.location}</span>
                                                                <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-unihub-teal/60" /> APPLIED {new Date(app.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex gap-3">
                                                            {app.status === 'pending' && (
                                                                <button
                                                                    onClick={() => {
                                                                        if (editingId === app._id) { setEditingId(null); setEditResume(null); }
                                                                        else { setEditingId(app._id); setEditCoverLetter(app.coverLetter); setEditResume(null); }
                                                                    }}
                                                                    title="Edit Cover Letter & Resume"
                                                                    className={`w-11 h-11 rounded-xl border transition-all flex items-center justify-center active:scale-95 ${editingId === app._id ? 'bg-unihub-teal border-unihub-teal text-white shadow-lg shadow-unihub-teal/30' : 'bg-white/60 border-white/80 text-slate-400 backdrop-blur-md hover:text-unihub-teal hover:border-unihub-teal shadow-sm'}`}
                                                                >
                                                                    <Edit3 className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(app._id)}
                                                                disabled={deleteId === app._id}
                                                                title="Delete Application"
                                                                className="w-11 h-11 rounded-xl bg-white/60 backdrop-blur-md border border-rose-200 text-rose-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-sm active:scale-95 flex items-center justify-center disabled:opacity-50"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                            {app.internshipId?.postedBy?._id && (
                                                                <button
                                                                    onClick={() => openChat(app)}
                                                                    disabled={msgLoading}
                                                                    title="Message the organization"
                                                                    className="w-11 h-11 rounded-xl bg-white/60 backdrop-blur-md border border-unihub-teal/20 text-unihub-teal hover:bg-unihub-teal hover:text-white hover:border-unihub-teal transition-all shadow-sm active:scale-95 flex items-center justify-center"
                                                                >
                                                                    <MessageCircle className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                            <button 
                                                                onClick={() => setExpandedId(isExpanded ? null : app._id)}
                                                                className={`w-11 h-11 rounded-xl border transition-all flex items-center justify-center active:scale-95 ${isExpanded ? 'bg-unihub-teal border-unihub-teal text-white rotate-180 shadow-lg shadow-unihub-teal/30' : 'bg-white/60 border-white/80 text-slate-400 backdrop-blur-md hover:text-unihub-teal hover:border-unihub-teal shadow-sm'}`}
                                                            >
                                                                <ChevronDown className={`w-6 h-6 transition-transform duration-500`} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {editingId === app._id ? (
                                                        <div className="space-y-4">
                                                            <textarea
                                                                className="w-full bg-white/60 backdrop-blur-md p-6 rounded-[24px] border border-slate-200 shadow-inner text-sm font-medium leading-relaxed focus:outline-none focus:border-unihub-teal transition-all resize-none min-h-[140px]"
                                                                value={editCoverLetter}
                                                                onChange={(e) => setEditCoverLetter(e.target.value)}
                                                                placeholder="Update your cover letter..."
                                                            />
                                                            <div className="bg-white/60 backdrop-blur-md p-6 rounded-[24px] border border-slate-200 shadow-inner">
                                                                <div className="flex justify-between items-center mb-3">
                                                                    <p className="text-[10px] font-black uppercase tracking-widest text-unihub-textMuted">Update Resume/Portfolio PDF (Optional)</p>
                                                                    {app.resumeData && app.resumeData.url && (
                                                                        <a href={`http://localhost:5000${app.resumeData.url}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-unihub-teal uppercase tracking-widest flex items-center gap-1 hover:underline">
                                                                            <Layers className="w-3 h-3" /> Current PDF Link
                                                                        </a>
                                                                    )}
                                                                </div>
                                                                <input 
                                                                    type="file" 
                                                                    accept=".pdf"
                                                                    onChange={(e) => setEditResume(e.target.files[0])}
                                                                    className="w-full text-sm text-unihub-textMuted file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-unihub-teal/10 file:text-unihub-teal hover:file:bg-unihub-teal/20 transition-all"
                                                                />
                                                            </div>
                                                            <div className="flex justify-end gap-3">
                                                                <button onClick={() => setEditingId(null)} className="btn bg-white border border-slate-200 text-slate-500 px-6 py-3 rounded-[14px] font-black uppercase tracking-widest text-[10px] shadow-sm hover:border-slate-300 active:scale-95">Cancel</button>
                                                                <button onClick={() => handleUpdate(app._id)} disabled={updatingId === app._id || !editCoverLetter.trim()} className="btn bg-unihub-teal text-white px-6 py-3 rounded-[14px] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-unihub-teal/30 active:scale-95 disabled:opacity-50">
                                                                    {updatingId === app._id ? 'Saving...' : 'Update Application'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            <div className="glass p-6 rounded-[24px] border border-white/40 shadow-inner group/quote">
                                                                <p className="text-sm text-unihub-textMuted font-medium leading-relaxed italic opacity-80 group-hover/quote:opacity-100 transition-opacity whitespace-pre-wrap">
                                                                    "{app.coverLetter}"
                                                                </p>
                                                                {app.coverLetter?.length > 150 && !isExpanded && (
                                                                    <div className="absolute bottom-6 right-6 text-[10px] font-black text-unihub-teal uppercase tracking-widest">
                                                                        Expand to read full
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {app.resumeData && app.resumeData.url && (
                                                                <div className="flex">
                                                                    <a 
                                                                        href={`http://localhost:5000${app.resumeData.url}`} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2 px-4 py-2 bg-unihub-teal/5 text-unihub-teal text-[10px] font-black uppercase tracking-widest rounded-[14px] hover:bg-unihub-teal hover:text-white transition-all cursor-pointer border border-unihub-teal/10 shadow-sm"
                                                                    >
                                                                        <Layers className="w-3.5 h-3.5" />
                                                                        View Attached PDF Dossier
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status History Timeline */}
                                        {isExpanded && (app.statusHistory || []).length > 0 && (
                                            <div className="glass px-8 md:px-12 py-12 border-t border-white/40 animate-in fade-in slide-in-from-top-6 duration-500 shadow-inner">
                                                <h4 className="text-[11px] font-black text-unihub-textMuted uppercase tracking-[0.3em] mb-10 px-6 font-display opacity-60">Temporal Engagement Logs</h4>
                                                <div className="space-y-8 relative ml-6">
                                                    <div className="absolute left-[8px] top-3 bottom-3 w-[2px] bg-gradient-to-b from-unihub-teal/20 via-unihub-teal/10 to-transparent"></div>
                                                    {app.statusHistory.map((h, index) => (
                                                        <div key={index} className="flex items-start gap-8 relative z-10 transition-all hover:translate-x-1">
                                                            <div className={`w-4.5 h-4.5 rounded-full border-2 border-white shadow-lg mt-1.5 flex-shrink-0 ${statusStyles[h.status].includes('badge-') ? (h.status === 'pending' ? 'bg-unihub-yellow' : 'bg-unihub-teal') : 'bg-slate-300'}`}></div>
                                                            <div className="glass-card p-6 border border-white/60 shadow-xl flex-1 relative overflow-hidden group/log">
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10">
                                                                    <UI_StatusBadge status={h.status} />
                                                                    <div className="flex items-center gap-2 text-[10px] font-black text-unihub-textMuted uppercase tracking-widest opacity-60">
                                                                        <Clock className="w-3.5 h-3.5" />
                                                                        {new Date(h.changedAt).toLocaleString()}
                                                                    </div>
                                                                </div>
                                                                {h.note && (
                                                                    <div className="p-4 bg-white/40 rounded-[20px] border border-white/60 relative z-10">
                                                                         <p className="text-xs text-unihub-textMuted font-semibold leading-relaxed italic opacity-80">"{h.note}"</p>
                                                                    </div>
                                                                )}
                                                                <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-current opacity-[0.02] rounded-full blur-xl group-hover/log:opacity-[0.05] transition-opacity" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Visual Bottom Border */}
                                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-unihub-teal to-unihub-coral opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
            
             {/* System Node Info */}
             <p className="text-center text-[10px] font-black text-unihub-textMuted opacity-20 uppercase tracking-[0.5em] pt-16">
                Active Session Node · {user?._id?.substring(0, 12).toUpperCase() || 'SYS-NULL'}
            </p>
        </div>

        {/* Chat Drawer — student side */}
        {chatDrawer && (
            <div className="fixed inset-0 z-[200] pointer-events-none">
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto" onClick={() => setChatDrawer(null)} />
                <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col pointer-events-auto animate-in slide-in-from-right duration-300">
                    {/* Header */}
                    <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-unihub-teal to-teal-600">
                        <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                            {chatDrawer.company?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-black text-white text-sm leading-tight truncate">{chatDrawer.company}</h3>
                            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Organization</p>
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
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">No messages yet</p>
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
                            placeholder={`Reply to ${chatDrawer.company}...`}
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

export default MyApplications;
