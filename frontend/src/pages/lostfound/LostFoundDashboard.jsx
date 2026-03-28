import React, { useState, useContext } from 'react';
import { 
    Search, Plus, MessageSquare, Bell, FileText, 
    Camera, MapPin, Calendar, Clock, Filter, 
    CheckCircle2, AlertCircle, ChevronRight, X,
    Send, User, BarChart3, TrendingUp, Package
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import Swal from 'sweetalert2';

// ----------------------------------------------------------------------
// 01. Reporting Modal Component
// ----------------------------------------------------------------------
const ReportingModal = ({ isOpen, onClose, user }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        type: 'lost',
        category: 'electronics',
        title: '',
        description: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        status: 'open'
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        
        Swal.fire({
            title: 'Report Submitted!',
            text: `Your ${formData.type} item has been listed successfully. We'll notify you if any matches are found.`,
            icon: 'success',
            confirmButtonColor: '#14B8A6'
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-unihub-text/50 backdrop-blur-md text-left">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-unihub-border">
                <div className="flex justify-between items-center p-8 border-b border-gray-50 bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-unihub-text tracking-tight">Report <span className="text-unihub-teal">Item</span></h2>
                        <p className="text-unihub-textMuted text-xs font-semibold uppercase tracking-widest mt-1">Step {step} of 2 • Nexus Submission Portal</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                        <X className="w-4.5 h-4.5 text-unihub-textMuted" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    {step === 1 ? (
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-4 p-2 bg-gray-50 rounded-[24px] border border-gray-100 shadow-inner">
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, type: 'lost'})}
                                    className={`py-4 rounded-[18px] font-black text-[10px] uppercase tracking-[0.2em] transition-all ${formData.type === 'lost' ? 'bg-unihub-coral text-white shadow-xl scale-105' : 'text-unihub-textMuted hover:text-unihub-coral'}`}
                                >
                                    Lost Something
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, type: 'found'})}
                                    className={`py-4 rounded-[18px] font-black text-[10px] uppercase tracking-[0.2em] transition-all ${formData.type === 'found' ? 'bg-unihub-teal text-white shadow-xl scale-105' : 'text-unihub-textMuted hover:text-unihub-teal'}`}
                                >
                                    Found Something
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-8 text-left">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-unihub-textMuted uppercase tracking-widest ml-1 opacity-60">Category</label>
                                    <select 
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl outline-none font-black text-unihub-text text-xs uppercase tracking-tight transition-all focus:border-unihub-teal/30 focus:bg-white shadow-sm"
                                    >
                                        <option value="electronics">Electronics</option>
                                        <option value="documents">ID & Documents</option>
                                        <option value="clothing">Clothing</option>
                                        <option value="books">Stationery & Books</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-unihub-textMuted uppercase tracking-widest ml-1 opacity-60">Item Title</label>
                                    <input 
                                        type="text" 
                                        placeholder="E.G. SILVER WATER BOTTLE"
                                        className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl outline-none font-black text-unihub-text text-xs uppercase tracking-tight transition-all focus:border-unihub-teal/30 focus:bg-white shadow-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 text-left">
                                <label className="text-[10px] font-black text-unihub-textMuted uppercase tracking-widest ml-1 opacity-60">Location Details</label>
                                <div className="relative">
                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-unihub-teal opacity-40" />
                                    <input 
                                        type="text" 
                                        placeholder="SEARCH LOCATION (E.G. L101 HALL)"
                                        className="w-full bg-gray-50 border border-gray-100 pl-14 pr-6 py-5 rounded-2xl outline-none font-black text-unihub-text text-xs uppercase tracking-tight transition-all focus:border-unihub-teal/30 focus:bg-white shadow-sm"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 text-left">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-unihub-textMuted uppercase tracking-widest ml-1 opacity-60">Description Markings</label>
                                <textarea 
                                    rows="4"
                                    placeholder="PROVIDE DISTINCT MARKS, CASE COLOR, OR IDENTIFYING FEATURES..."
                                    className="w-full bg-gray-50 border border-gray-100 p-6 rounded-2xl outline-none font-black text-unihub-text text-xs uppercase tracking-tight transition-all focus:border-unihub-teal/30 focus:bg-white shadow-sm resize-none"
                                />
                            </div>

                            <div className="p-12 border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center bg-gray-50/50 group hover:border-unihub-teal/30 transition-all cursor-pointer">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform duration-500">
                                    <Camera className="w-8 h-8 text-unihub-teal opacity-20 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.2em] group-hover:text-unihub-teal transition-colors">Upload Visual Verification</p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 mt-12">
                        {step === 2 && (
                            <button 
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 bg-white border border-unihub-border text-unihub-textMuted font-black py-5 rounded-[24px] transition-all hover:text-unihub-teal uppercase tracking-widest text-[10px]"
                            >
                                BACK
                            </button>
                        )}
                        <button 
                            type="button"
                            onClick={() => step === 1 ? setStep(2) : handleSubmit({preventDefault: () => {}})}
                            className="flex-[2] bg-unihub-teal text-white font-black py-5 rounded-[24px] shadow-2xl shadow-unihub-teal/20 transition-all hover:bg-unihub-tealHover active:scale-95 uppercase tracking-[0.2em] text-[10px]"
                        >
                            {step === 1 ? 'CONTINUE' : 'SUBMIT REPORT'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 02. Message Center Component
// ----------------------------------------------------------------------
const MessageCenter = ({ isOpen, onClose, selectedItem }) => {
    const [msg, setMsg] = useState('');
    const [chat, setChat] = useState([
        { id: 1, sender: 'System', text: `Connected to retrieval thread: ${selectedItem?.title}`, time: 'Just now' }
    ]);

    if (!isOpen) return null;

    const sendMsg = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!msg.trim()) return;
        setChat([...chat, { id: Date.now(), sender: 'You', text: msg, time: '1s ago' }]);
        setMsg('');
    };

    return (
        <div className="fixed inset-y-0 right-0 z-[110] w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col text-left border-l border-unihub-border">
            <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-unihub-teal/5">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-[22px] bg-unihub-teal flex items-center justify-center text-white shadow-xl group cursor-pointer">
                        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-unihub-text tracking-tighter leading-none uppercase">Nexus <span className="text-unihub-teal">Chat</span></h3>
                        <p className="text-[9px] font-black text-unihub-textMuted uppercase tracking-widest mt-1">Ref: {selectedItem?.title}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-3 rounded-2xl hover:bg-white transition-all shadow-sm border border-transparent hover:border-gray-100">
                    <X className="w-5 h-5 text-unihub-textMuted" />
                </button>
            </div>

            <div className="flex-1 p-10 overflow-y-auto space-y-8 bg-[#fdfdfd]">
                {chat.map(c => (
                    <div key={c.id} className={`flex flex-col ${c.sender === 'You' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-5 rounded-[24px] max-w-[90%] text-sm font-bold shadow-sm leading-relaxed ${c.sender === 'You' ? 'bg-unihub-teal text-white rounded-br-none shadow-unihub-teal/20' : 'bg-white border border-unihub-border text-unihub-text rounded-bl-none'}`}>
                            {c.text}
                        </div>
                        <span className="text-[8px] font-black text-unihub-textMuted uppercase tracking-[0.2em] mt-3 px-1">{c.sender} • {c.time}</span>
                    </div>
                ))}
            </div>

            <form onSubmit={sendMsg} className="p-10 bg-white border-t border-gray-50 shadow-2xl">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="COORDINATE RETRIEVAL..."
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 pl-8 pr-16 py-5 rounded-[22px] outline-none font-black text-unihub-text text-[10px] uppercase tracking-widest transition-all focus:border-unihub-teal/30 focus:bg-white shadow-inner"
                    />
                    <button type="submit" className="absolute right-3.5 top-1/2 -translate-y-1/2 p-3.5 rounded-xl bg-unihub-teal text-white shadow-xl hover:bg-unihub-tealHover transition-all active:scale-90">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
};

// ----------------------------------------------------------------------
// 04. Admin Reports Component (Lecturer Only)
// ----------------------------------------------------------------------
const AdminReports = () => {
    const stats = [
        { label: 'Lost Items', value: '124', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
        { label: 'Claimed Items', value: '86', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Pending Response', value: '38', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Retrieval Rate', value: '69%', icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-50' }
    ];

    return (
        <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-soft animate-in slide-in-from-bottom duration-700 text-left">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-[22px] flex items-center justify-center text-indigo-600 shadow-inner">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight">System Trends</h2>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Administrator Retrieval Analysis</p>
                    </div>
                </div>
                <button className="flex items-center gap-2 bg-gray-900 text-white text-xs font-black px-6 py-3.5 rounded-2xl shadow-xl hover:scale-105 transition-all active:scale-95">
                    GENERATE REPORT <FileText className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {stats.map(s => (
                    <div key={s.label} className="p-8 rounded-[32px] border border-gray-50 bg-[#fbfcfd] hover:border-indigo-100 transition-all group shadow-sm">
                        <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <h4 className="text-3xl font-black text-gray-800 mb-1">{s.value}</h4>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="p-8 rounded-[32px] bg-indigo-50/30 border border-indigo-100 flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg ring-8 ring-indigo-50 flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-indigo-900 mb-1 leading-tight italic">"Retrieval efficiency is up by 12% this month. Laptop chargers remain the most reported lost items on the 4th floor."</p>
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-2">NEXUS AI INSIGHT • CAMPUS TRENDS</p>
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// Main Dashboard
// ----------------------------------------------------------------------
const LostFoundDashboard = () => {
    const { user } = useContext(AuthContext);
    const [view, setView] = useState('explore'); // explore, myposts
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showMessageCenter, setShowMessageCenter] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Mock Data
    const mockItems = [
        { id: 1, title: 'SLIIT Student ID', type: 'lost', category: 'documents', location: 'Level 4 Cafeteria', date: 'Mar 27', status: 'pending', postedBy: 'Student' },
        { id: 2, title: 'Precision Laptop Charger', type: 'found', category: 'electronics', location: 'L102 Hall', date: 'Mar 26', status: 'open', postedBy: 'Lecturer' },
        { id: 3, title: 'HydroFlask Bottle', type: 'lost', category: 'other', location: 'Library Area', date: 'Mar 25', status: 'resolved', postedBy: 'Student' },
        { id: 4, title: 'Macroeconomics Textbook', type: 'found', category: 'books', location: 'B401 Lab', date: 'Mar 25', status: 'open', postedBy: 'Unknown' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10 text-left cursor-default">
            {/* 03. Notification Bar (Simulated) */}
            <div className="flex items-center justify-between bg-white px-8 md:px-10 py-6 rounded-2xl shadow-sm border border-unihub-border animate-in slide-in-from-top duration-700">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-unihub-teal/10 flex items-center justify-center text-unihub-teal shadow-inner">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div className="absolute top-0 right-0 w-4 h-4 bg-unihub-coral rounded-full border-2 border-white animate-pulse shadow-md"></div>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-unihub-text tracking-tight opacity-90 leading-tight">You have <span className="text-unihub-teal font-black">2 new matches</span> for your reported items!</p>
                        <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-widest mt-1">Check the synchronization center below.</p>
                    </div>
                </div>
                <button className="p-4 rounded-2xl bg-gray-50 hover:bg-unihub-teal/10 transition-all group">
                    <ChevronRight className="w-5 h-5 text-unihub-teal group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Header section */}
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl mt-2 bg-gradient-to-br from-unihub-teal to-[#0d857a]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-white opacity-10 blur-[120px] rounded-full mix-blend-overlay animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white opacity-5 blur-[100px] rounded-full" />
                    <Package className="absolute -right-16 -top-16 w-80 h-80 text-white opacity-10 rotate-12" strokeWidth={0.5} />
                </div>
                <div className="px-8 md:px-16 py-14 md:py-20 relative z-10">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[11px] font-bold text-white uppercase tracking-[0.2em] shadow-xl">
                            <Package className="w-4 h-4 text-unihub-yellow" /> Asset Recovery Active
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter font-display">
                            Lost & <span className="text-unihub-yellow">Found</span>.
                        </h1>
                        <p className="text-white/80 font-medium text-base max-w-xl leading-relaxed">
                            A centralized platform to reconnect owners with their misplaced belongings across campus. Communicate securely and track items in real-time.
                        </p>
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <button
                                onClick={() => setShowReportModal(true)}
                                className="inline-flex items-center gap-2 bg-white text-unihub-teal px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-unihub-yellow hover:text-unihub-text transition-all active:scale-95">
                                <Plus className="w-5 h-5" /> New Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 04. Admin Management Section (Lecturer Only) */}
            {user?.role === 'lecturer' && <div className="mb-8"><AdminReports /></div>}

            {/* Sub-navigation & Filters */}
            <div className="glass-card rounded-2xl overflow-hidden px-6 py-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center p-2 bg-gray-50 rounded-[24px] border border-gray-100 self-start shadow-inner">
                        <button
                                onClick={() => setView('explore')}
                                className={`px-6 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                                    view === 'explore' ? 'bg-white text-unihub-teal shadow-md' : 'text-unihub-textMuted hover:text-unihub-teal'
                                }`}
                            >
                                Explore Items
                            </button>
                            <button
                                onClick={() => setView('myposts')}
                                className={`px-6 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                                    view === 'myposts' ? 'bg-white text-unihub-teal shadow-md' : 'text-unihub-textMuted hover:text-unihub-teal'
                                }`}
                            >
                                My Submissions
                            </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 flex-1 lg:justify-end">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-unihub-teal/40" />
                            <input
                                type="text"
                                placeholder="Search items, locations, IDs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="uni-input pl-11 py-2.5"
                            />
                        </div>
                        <button className="btn btn-outline btn-icon">
                            <Filter className="w-4 h-4 text-unihub-teal" />
                        </button>
                    </div>
                </div>

                {/* 01. Item Grid List */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
                    {mockItems.map((item) => (
                        <div key={item.id} className="uni-card uni-card-lift group overflow-hidden flex flex-col h-full relative">
                            {/* Type Badge */}
                            <div className="absolute top-4 left-4 z-10">
                                <span className={`badge ${
                                    item.type === 'lost' ? 'badge-coral' : 'badge-teal'
                                }`}>
                                    {item.type}
                                </span>
                            </div>

                            <div className="aspect-[5/4] bg-gray-100 relative overflow-hidden group/img">
                                <img 
                                    src={'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-[1500ms]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-unihub-text/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                                <div className="absolute bottom-5 left-7 right-7 flex justify-between items-center text-white">
                                    <div className="flex items-center gap-2 font-black text-[9px] uppercase tracking-widest opacity-90 group-hover:opacity-100 transition-all">
                                        <Calendar className="w-3.5 h-3.5 text-unihub-teal" /> {item.date}
                                    </div>
                                    <div className="flex items-center gap-2 font-black text-[9px] uppercase tracking-widest opacity-90 group-hover:opacity-100 transition-all">
                                        <MapPin className="w-3.5 h-3.5 text-unihub-coral" /> {item.location.split(' ')[0]}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 flex flex-col flex-1 relative">
                                <div className="mb-1 uppercase tracking-widest font-black text-unihub-teal text-[8px] opacity-60 leading-none">{item.category}</div>
                                <h3 className="font-black text-unihub-text text-xl leading-snug mb-3 group-hover:text-unihub-teal transition-colors tracking-tight uppercase">{item.title}</h3>
                                
                                <div className="flex items-center gap-2 mb-10">
                                    <div className={`w-2 h-2 rounded-full shadow-sm ${item.status === 'resolved' ? 'bg-emerald-400' : 'bg-unihub-yellow animate-pulse shadow-unihub-yellow/50'}`}></div>
                                    <span className="text-[10px] font-black text-unihub-textMuted uppercase tracking-widest pt-0.5">{item.status}</span>
                                </div>

                                <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-unihub-teal/5 border border-unihub-teal/10 flex items-center justify-center shadow-inner group-hover:bg-unihub-teal group-hover:text-white transition-all">
                                            <User className="w-4.5 h-4.5 text-unihub-teal group-hover:text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-unihub-textMuted uppercase leading-none mb-1 tracking-widest">SUBMITTED BY</p>
                                            <p className="text-[11px] font-black text-unihub-text leading-none uppercase">{item.postedBy}</p>
                                        </div>
                                    </div>
                                    {/* 02. Messaging Trigger */}
                                    <button 
                                        onClick={() => {
                                            setSelectedItem(item);
                                            setShowMessageCenter(true);
                                        }}
                                        className="p-4 rounded-[20px] bg-gray-50 text-unihub-textMuted hover:bg-unihub-teal hover:text-white transition-all shadow-sm hover:shadow-unihub-teal/30 active:scale-90"
                                        title="Message Owner"
                                    >
                                        <MessageSquare className="w-5 h-5 flex-shrink-0" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dashboard Modals & Sidebars */}
            <ReportingModal 
                isOpen={showReportModal} 
                onClose={() => setShowReportModal(false)} 
                user={user}
            />
            
            <MessageCenter 
                isOpen={showMessageCenter} 
                onClose={() => setShowMessageCenter(false)} 
                selectedItem={selectedItem}
            />
        </div>
    );
};

export default LostFoundDashboard;
