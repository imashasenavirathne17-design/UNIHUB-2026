import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { 
    Search, Plus, MessageSquare, Bell, FileText, 
    Camera, MapPin, Calendar, Clock, Filter, 
    CheckCircle2, AlertCircle, ChevronRight, X,
    Send, User, BarChart3, TrendingUp, Package, Loader2, Trash2, Download, Gift, QrCode
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from "react-qr-code";
import { AuthContext } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import ChatWindow from '../../components/lostfound/LostFoundChatWindow.jsx';

// ----------------------------------------------------------------------
// Reporting Modal Component
// ----------------------------------------------------------------------
const ReportingModal = ({ isOpen, onClose, onReportFinished }) => {
    const fileInputRef = useRef(null);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        type: 'lost',
        category: 'electronics',
        title: '',
        description: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        status: 'open',
        bounty: '',
        image: null
    });
    const [preview, setPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setFormData({
                type: 'lost',
                category: 'electronics',
                title: '',
                description: '',
                location: '',
                date: new Date().toISOString().split('T')[0],
                status: 'open',
                bounty: '',
                image: null
            });
            setPreview(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setSubmitting(true);
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            const data = new FormData();
            
            Object.keys(formData).forEach(key => {
                if (key === 'image') {
                    if (formData[key]) data.append('image', formData[key]);
                } else {
                    data.append(key, formData[key]);
                }
            });

            await axios.post('http://localhost:5000/api/lostfound/', data, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            Swal.fire({
                title: 'Report Submitted!',
                text: `Your ${formData.type} item has been listed successfully.`,
                icon: 'success',
                confirmButtonColor: '#14B8A6'
            });
            onReportFinished();
            onClose();
        } catch (err) {
            Swal.fire('Error', 'Failed to submit report', 'error');
        } finally {
            setSubmitting(false);
        }
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
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                                        value={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
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
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="PROVIDE DISTINCT MARKS, CASE COLOR, OR IDENTIFYING FEATURES..."
                                    className="w-full bg-gray-50 border border-gray-100 p-6 rounded-2xl outline-none font-black text-unihub-text text-xs uppercase tracking-tight transition-all focus:border-unihub-teal/30 focus:bg-white shadow-sm resize-none"
                                />
                            </div>

                            <div 
                                onClick={() => fileInputRef.current.click()}
                                className="p-8 border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center bg-gray-50/50 group hover:border-unihub-teal/30 transition-all cursor-pointer relative overflow-hidden h-48"
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                    accept="image/*" 
                                />
                                {preview ? (
                                    <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-[30px]" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform duration-500">
                                            <Camera className="w-8 h-8 text-unihub-teal opacity-20 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.2em] group-hover:text-unihub-teal transition-colors">Upload Visual Verification</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-unihub-textMuted uppercase tracking-widest ml-1 opacity-60">Nexus Bounty (Optional Reward)</label>
                            <input 
                                type="text" 
                                value={formData.bounty}
                                onChange={(e) => setFormData({...formData, bounty: e.target.value})}
                                placeholder="E.G. RS. 1000 / FREE COFFEE..."
                                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none font-black text-amber-600 text-xs uppercase tracking-tight transition-all focus:border-unihub-yellow focus:bg-white shadow-sm"
                            />
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
                            onClick={() => step === 1 ? setStep(2) : handleSubmit({})}
                            disabled={submitting}
                            className="flex-[2] bg-unihub-teal text-white font-black py-5 rounded-[24px] shadow-2xl shadow-unihub-teal/20 transition-all hover:bg-unihub-tealHover active:scale-95 uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : step === 1 ? 'CONTINUE' : 'SUBMIT REPORT'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// Conversation List Component (Sidebar/Modal)
// ----------------------------------------------------------------------
const ConversationList = ({ isOpen, onClose, onSelectConversation, currentUser, filterItemId }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) fetchConversations();
    }, [isOpen]);

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            const res = await axios.get('http://localhost:5000/api/lostfound/conversations/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversations(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConversation = async (convId) => {
        const result = await Swal.fire({
            title: 'Wipe Communication Data?',
            text: "This will permanently erase all messages in this node. It cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Yes, wipe it!'
        });

        if (result.isConfirmed) {
            try {
                const token = JSON.parse(localStorage.getItem('user'))?.token;
                await axios.delete(`http://localhost:5000/api/lostfound/conversation/${convId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setConversations(prev => prev.filter(conv => conv._id !== convId));
                Swal.fire('Wiped!', 'The conversation node was securely purged.', 'success');
            } catch (err) {
                Swal.fire('Error', 'Failed to wipe conversation data.', 'error');
            }
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-end p-0 bg-unihub-text/20 backdrop-blur-sm">
            <div className="bg-white w-[340px] h-full pt-[4.5rem] shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col border-l border-unihub-border text-left">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-black text-unihub-text tracking-tight uppercase">Message <span className="text-unihub-teal">Nexus</span></h2>
                        <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-widest mt-1">Active Communication Nodes</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white transition-all shadow-sm border border-transparent hover:border-gray-100">
                        <X className="w-5 h-5 text-unihub-textMuted" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center opacity-20 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-unihub-teal" />
                        </div>
                    ) : (() => {
                        const filteredConvs = conversations
                            .filter(conv => filterItemId ? conv.itemId?._id === filterItemId : true)
                            .filter(conv => conv.lastMessage && conv.lastMessage.trim() !== '');
                        return filteredConvs.length > 0 ? (
                            filteredConvs.map((conv) => {
                                const currentUserId = currentUser?._id || currentUser?.id;
                                const otherUser = conv.members.find(m => m._id !== currentUserId && m._id?.toString() !== currentUserId?.toString());
                                const isUnread = conv.unreadCount > 0;
                                return (
                                    <button 
                                        key={conv._id}
                                        onClick={() => {
                                            onSelectConversation(conv);
                                            onClose();
                                        }}
                                        className={`relative w-[calc(100%-16px)] mx-auto p-5 rounded-[24px] transition-all duration-300 flex items-center gap-4 text-left group overflow-hidden ${isUnread ? 'bg-white shadow-[0_4px_24px_rgba(20,184,166,0.15)] border border-unihub-teal/20' : 'hover:bg-gray-50 border border-transparent hover:border-gray-100 hover:shadow-sm'}`}
                                    >
                                        {isUnread && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-unihub-teal rounded-r-full shadow-[0_0_12px_rgba(20,184,166,0.6)] animate-pulse" />
                                        )}
                                        <div className="relative">
                                            <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center transition-all duration-500 shadow-inner ${isUnread ? 'bg-unihub-teal text-white' : 'bg-gray-100 text-unihub-teal group-hover:bg-unihub-teal/10'}`}>
                                                <User className="w-6 h-6" />
                                            </div>
                                            {isUnread && (
                                                <span className="absolute -top-2 -right-2 bg-unihub-coral text-white text-[9px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-lg">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <p className={`text-[12px] uppercase truncate tracking-tight ${isUnread ? 'font-black text-unihub-teal' : 'font-bold text-gray-800'}`}>
                                                    {otherUser?.name || 'Nexus User'}
                                                </p>
                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{new Date(conv.lastUpdateTime).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 rounded-md bg-unihub-yellow/20 text-yellow-700 text-[8px] font-black uppercase tracking-[0.2em]">{conv.itemId?.title || 'System Ref'}</span>
                                            </div>
                                            <p className={`text-xs truncate italic ${isUnread ? 'font-bold text-gray-700' : 'text-gray-400 font-medium'}`}>
                                                "{conv.lastMessage}"
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2 relative z-10">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteConversation(conv._id);
                                                }}
                                                className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 absolute -left-10 top-0"
                                                title="Delete Node"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isUnread ? 'bg-unihub-teal/10 text-unihub-teal' : 'text-gray-300 group-hover:bg-gray-100 group-hover:text-unihub-teal'}`}>
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="py-20 text-center opacity-20 space-y-4">
                                <MessageSquare className="w-12 h-12 mx-auto" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No active secure channels found.</p>
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// Admin Statistics Component
// ----------------------------------------------------------------------
const AdminReports = ({ items }) => {
    const stats = [
        { label: 'Lost Items', value: items.filter(i => i.type === 'lost' && i.status !== 'resolved').length, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
        { label: 'Found Items', value: items.filter(i => i.type === 'found' && i.status !== 'resolved').length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Pending Response', value: items.filter(i => i.status === 'open' || i.status === 'pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Resolved Cases', value: items.filter(i => i.status === 'resolved').length, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-50' }
    ];

    const generateAdminReport = () => {
        const doc = new jsPDF('p', 'pt', 'a4');

        // Design: Header Block
        doc.setFillColor(20, 184, 166); // unihub-teal
        doc.rect(0, 0, 600, 100, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.text('LOST & FOUND - UNI HUB', 40, 50);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Administrative Intel & Recovery Analytics', 40, 70);

        // System Statistics Section
        doc.setTextColor(50, 50, 50);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('System Overview Statistics', 40, 140);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Items Tracked: ${items.length}`, 40, 170);
        doc.text(`Lost Items: ${stats[0].value}`, 40, 190);
        doc.text(`Found Items: ${stats[1].value}`, 40, 210);
        doc.text(`Resolved Cases: ${stats[3].value}`, 250, 190);
        doc.text(`Pending Actions: ${stats[2].value}`, 250, 210);

        // Generate Table
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('Detailed Item Ledger', 40, 260);

        const tableColumn = ["Status", "Type", "Title", "Category", "Location", "Date Posted"];
        const tableRows = items.map(item => [
            (item.status || 'open').toUpperCase(),
            item.type.toUpperCase(),
            item.title,
            item.category,
            item.location,
            new Date(item.createdAt).toLocaleDateString()
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 280,
            styles: { font: 'helvetica', fontSize: 9, cellPadding: 6 },
            headStyles: { fillColor: [20, 184, 166], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [249, 250, 251] },
        });

        const finalY = doc.lastAutoTable.finalY || 280;
        
        // Footer Signature
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Report generated by UniHub Internal Nexus • ${new Date().toLocaleString()}`, 40, finalY + 40);

        doc.save('unihub-lost-found-report.pdf');

        Swal.fire({
            title: 'Report Compiled!',
            text: 'The administrative PDF ledger has been downloaded securely.',
            icon: 'success',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
    };

    return (
        <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-soft animate-in slide-in-from-bottom duration-700 text-left">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-[22px] flex items-center justify-center text-indigo-600 shadow-inner">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight">System Trends</h2>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Administrator Retrieval Analysis</p>
                    </div>
                </div>
                <button 
                    onClick={generateAdminReport}
                    className="bg-indigo-600 text-white px-6 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95"
                >
                    <Download className="w-4 h-4" /> Download Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
        </div>
    );
};

// ----------------------------------------------------------------------
// Main Dashboard
// ----------------------------------------------------------------------
const LostFoundDashboard = () => {
    const { user } = useContext(AuthContext);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('explore'); 
    const [showReportModal, setShowReportModal] = useState(false);
    const [showConvList, setShowConvList] = useState(false);
    const [convListFilter, setConvListFilter] = useState(null);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [showMessageCenter, setShowMessageCenter] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [qrData, setQrData] = useState(null);

    useEffect(() => {
        fetchItems();
        // Add auto-refresh every 10 seconds to keep badges updated
        const interval = setInterval(fetchItems, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            const res = await axios.get('http://localhost:5000/api/lostfound/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setItems(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleContactOwner = async (item) => {
        const currentUserId = user?._id || user?.id;
        if (item.postedBy._id === currentUserId || item.postedBy._id?.toString() === currentUserId?.toString()) {
            setConvListFilter(item._id);
            setShowConvList(true);
            return;
        }

        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            const res = await axios.post('http://localhost:5000/api/lostfound/conversation', {
                receiverId: item.postedBy._id,
                itemId: item._id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedConversation(res.data);
            setShowMessageCenter(true);
            
            // Mark items as read optimistically
            setItems(prev => prev.map(i => i._id === item._id ? { ...i, unreadCount: 0 } : i));
        } catch (err) {
            Swal.fire('Error', 'Could not initiate communication signal.', 'error');
        }
    };

    const handleDeleteItem = async (itemId) => {
        const result = await Swal.fire({
            title: 'Close this case?',
            text: "This will mark your item as resolved and remove it from the active public feed.",
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#14B8A6',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, mark as resolved!'
        });

        if (result.isConfirmed) {
            try {
                const token = JSON.parse(localStorage.getItem('user'))?.token;
                await axios.put(`http://localhost:5000/api/lostfound/${itemId}/status`, 
                    { status: 'resolved' },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                // Update local state to reflect resolved status (kept for stats but hidden from feed)
                setItems(prev => prev.map(item => item._id === itemId ? { ...item, status: 'resolved', image: null } : item));
                Swal.fire('Resolved!', 'Your case has been successfully resolved and archived for system records.', 'success');
            } catch (err) {
                Swal.fire('Error', 'Failed to resolve the case. Please try again.', 'error');
            }
        }
    };

    const handleShowQR = (item) => {
        setQrData({ title: item.title, pin: item.handoverPin || '000000' });
    };

    const handleScanVerify = async (item) => {
        const { value: pin } = await Swal.fire({
            title: 'Verify Cryptographic PIN',
            input: 'text',
            inputLabel: 'Enter the 6-Digit Handover PIN provided by the original poster.',
            inputPlaceholder: 'e.g. 123456',
            showCancelButton: true,
            confirmButtonColor: '#14B8A6',
            confirmButtonText: 'Validate Handover'
        });

        if (pin) {
            try {
                const token = JSON.parse(localStorage.getItem('user'))?.token;
                await axios.put(`http://localhost:5000/api/lostfound/${item._id}/verify-handover`, 
                    { pin }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                // Update local state to reflect resolved status
                setItems(prev => prev.map(i => i._id === item._id ? { ...i, status: 'resolved', image: null } : i));
                Swal.fire('Handover Verified!', 'Transaction secured. Case has been resolved and recorded in the Nexus archive.', 'success');
            } catch (err) {
                Swal.fire('Declined', 'Invalid cryptographic PIN block.', 'error');
            }
        }
    };

    const filteredItems = items.filter(item => {
        const currentUserId = user?._id || user?.id;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.location.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (view === 'myposts') {
            return (item.postedBy._id === currentUserId || item.postedBy._id?.toString() === currentUserId?.toString()) && 
                   matchesSearch && 
                   item.status !== 'resolved';
        }
        
        // Hide resolved cases from the public Explore feed
        return matchesSearch && item.status !== 'resolved';
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10 text-left">
            {/* Header section */}
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl mt-2 bg-gradient-to-br from-unihub-teal to-[#0d857a]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-white opacity-10 blur-[120px] rounded-full mix-blend-overlay animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white opacity-5 blur-[100px] rounded-full" />
                    <Package className="absolute -right-16 -top-16 w-80 h-80 text-white opacity-10 rotate-12" strokeWidth={0.5} />
                </div>
                <div className="px-8 md:px-16 py-14 md:py-20 relative z-10">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[11px] font-bold text-white tracking-[0.2em] shadow-xl">
                            <Package className="w-4 h-4 text-unihub-yellow" /> Asset Recovery Portal
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter font-display">
                            Lost & <span className="text-unihub-yellow">Found</span>
                        </h1>
                        <p className="text-white/80 font-medium text-base max-w-xl leading-relaxed italic opacity-90">
                            Coordinate beloging recovery through secure, real-time private channels.
                        </p>
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <button
                                onClick={() => setShowReportModal(true)}
                                className="inline-flex items-center gap-2 bg-white text-unihub-teal px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-unihub-yellow hover:text-unihub-text transition-all active:scale-95">
                                <Plus className="w-5 h-5" /> New Report
                            </button>
                            <button
                                onClick={() => {
                                    setConvListFilter(null);
                                    setShowConvList(true);
                                }}
                                className="inline-flex items-center gap-2 bg-unihub-teal text-white border border-white/20 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-white hover:text-unihub-teal transition-all active:scale-95">
                                <MessageSquare className="w-5 h-5" /> All Messages
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Stats */}
            {user?.role === 'admin' && <AdminReports items={items} />}

            {/* Navigation & Search */}
            <div className="glass-card rounded-2xl p-6 flex flex-col lg:flex-row gap-6 items-center justify-between">
                <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                    <button onClick={() => setView('explore')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'explore' ? 'bg-white text-unihub-teal shadow-md' : 'text-unihub-textMuted hover:text-unihub-teal'}`}>Explore</button>
                    <button onClick={() => setView('myposts')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'myposts' ? 'bg-white text-unihub-teal shadow-md' : 'text-unihub-textMuted hover:text-unihub-teal'}`}>My Reports</button>
                </div>
                <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-unihub-teal/30" />
                    <input type="text" placeholder="SEARCH SYSTEM NODES..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-50 border border-transparent pl-12 pr-6 py-3 rounded-xl outline-none font-black text-[10px] uppercase tracking-widest focus:border-unihub-teal/20 transition-all transition-all" />
                </div>
            </div>

            {/* Item Grid */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center opacity-30 gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-unihub-teal" />
                    <p className="font-black text-[10px] uppercase tracking-widest">Scanning Campus Database...</p>
                </div>
            ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredItems.map((item) => (
                        <div key={item._id} className={`uni-card uni-card-lift group overflow-hidden flex flex-col h-full bg-white border-2 ${item.unreadCount > 0 ? 'border-red-500 shadow-red-500/20' : 'border-transparent'}`}>
                            <div className="absolute top-5 left-5 z-20 flex gap-2">
                                <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-white shadow-lg ${item.type === 'lost' ? 'bg-unihub-coral' : 'bg-unihub-teal'}`}>{item.type}</span>
                                {item.bounty && (
                                    <span className="px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#d97706] bg-unihub-yellow shadow-lg flex items-center gap-1.5">
                                        <Gift className="w-3 h-3" /> REWARD: {item.bounty}
                                    </span>
                                )}
                                {item.unreadCount > 0 && (
                                    <span className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl bg-red-600 flex items-center gap-2 animate-pulse">
                                        <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div> {item.unreadCount} NEW MESSAGE{item.unreadCount > 1 ? 'S' : ''}
                                    </span>
                                )}
                            </div>
                            <div className="aspect-video bg-gray-100 overflow-hidden relative flex items-center justify-center">
                                {item.image ? (
                                    <img src={`http://localhost:5000/${item.image}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" alt={item.title} />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-colors duration-500">
                                        <Package className="w-12 h-12 text-gray-400 opacity-50" strokeWidth={1.5} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                                <div className="absolute bottom-4 left-6 flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-white font-black text-[8px] uppercase tracking-widest"><MapPin className="w-3.5 h-3.5 text-unihub-yellow" /> {item.location}</div>
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-1">
                                <p className="text-[8px] font-black text-unihub-teal uppercase tracking-[0.2em] mb-2">{item.category}</p>
                                <h3 className="text-xl font-black text-unihub-text mb-4 uppercase truncate">{item.title}</h3>
                                <p className="text-xs text-unihub-textMuted font-medium line-clamp-2 mb-6 italic leading-relaxed">"{item.description}"</p>
                                
                                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-unihub-teal/10 flex items-center justify-center text-unihub-teal">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[7px] font-black text-unihub-textMuted uppercase tracking-widest">POSTED BY</p>
                                            <p className="text-[10px] font-black text-unihub-text uppercase">{item.postedBy.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleContactOwner(item)} className="w-12 h-12 rounded-2xl bg-gray-50 hover:bg-unihub-teal hover:text-white transition-all shadow-sm flex items-center justify-center group/chat border border-transparent hover:border-unihub-teal/20" title="Secure Comms">
                                            <MessageSquare className="w-5 h-5 transition-transform group-hover/chat:scale-110" />
                                        </button>
                                        {(() => {
                                            const currentUserId = user?._id || user?.id;
                                            const isOwner = item.postedBy._id === currentUserId || item.postedBy._id?.toString() === currentUserId?.toString();
                                            const canManage = isOwner || user?.role === 'admin';
                                            return (
                                                <>
                                                    {canManage ? (
                                                        <>
                                                            <button onClick={() => handleShowQR(item)} className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all shadow-sm flex items-center justify-center group/qr border border-transparent hover:border-indigo-500/20" title="Generate Handover PIN/QR">
                                                                <QrCode className="w-5 h-5 transition-transform group-hover/qr:scale-110" />
                                                            </button>
                                                            <button onClick={() => handleDeleteItem(item._id)} className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm flex items-center justify-center group/del border border-transparent hover:border-emerald-500/20" title="Force Resolve Base">
                                                                <CheckCircle2 className="w-5 h-5 transition-transform group-hover/del:scale-110" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button onClick={() => handleScanVerify(item)} className="w-12 h-12 rounded-2xl bg-gray-900 text-white hover:bg-black transition-all shadow-sm flex items-center justify-center group/verify border border-transparent" title="Verify Secure Handover (PIN)">
                                                            <CheckCircle2 className="w-5 h-5 transition-transform group-hover/verify:scale-110" />
                                                        </button>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center opacity-30">
                    <Package className="w-16 h-16 mx-auto mb-4" />
                    <p className="font-black text-[12px] uppercase tracking-widest">No matching assets identified in this sector.</p>
                </div>
            )}

            {/* Modals */}
            <ReportingModal 
                isOpen={showReportModal} 
                onClose={() => setShowReportModal(false)}
                onReportFinished={fetchItems}
            />
            {qrData && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-unihub-text/50 backdrop-blur-md">
                    <div className="bg-white max-w-sm w-full p-10 rounded-[32px] shadow-2xl flex flex-col items-center text-center animate-in zoom-in duration-300">
                        <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight leading-none mb-1">Handover Asset</h3>
                        <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-widest mb-8">{qrData.title}</p>
                        
                        <div className="p-4 bg-white border border-gray-100 rounded-3xl shadow-sm mb-8">
                            <QRCode value={qrData.pin} size={180} fgColor="#14B8A6" />
                        </div>
                        
                        <p className="text-xs font-bold text-gray-500 mb-2">CRYPTOGRAPHIC RECEIPT PIN:</p>
                        <div className="bg-gray-50 px-8 py-4 rounded-2xl border border-gray-100 shadow-inner mb-8">
                            <span className="text-3xl font-black tracking-[0.3em] text-indigo-600">{qrData.pin}</span>
                        </div>
                        
                        <p className="text-xs text-gray-400 font-medium mb-8 leading-relaxed">Present this QR code or 6-digit PIN to the finder to authorize handover and securely resolve this case.</p>
                        
                        <button onClick={() => setQrData(null)} className="w-full bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest py-5 rounded-2xl hover:bg-black transition-all">
                            SECURE & CLOSE
                        </button>
                    </div>
                </div>
            )}
            <ConversationList 
                isOpen={showConvList} 
                onClose={() => setShowConvList(false)}
                onSelectConversation={(conv) => {
                    setSelectedConversation(conv);
                    setShowMessageCenter(true);
                }}
                currentUser={user}
                filterItemId={convListFilter}
            />
            <ChatWindow 
                isOpen={showMessageCenter} 
                onClose={() => {
                    setShowMessageCenter(false);
                    fetchItems(); // refresh unread counts
                }} 
                conversation={selectedConversation}
                currentUser={user}
            />
        </div>
    );
};

export default LostFoundDashboard;
