import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { 
    Search, 
    Star, 
    CheckCircle, 
    ChevronRight, 
    Filter, 
    Globe, 
    Zap, 
    Award, 
    Heart,
    Github,
    Linkedin,
    ExternalLink,
    Plus,
    Edit3,
    Trash2,
    Calendar,
    DollarSign,
    MoreVertical,
    TrendingUp,
    X
} from 'lucide-react';

const CATEGORIES = [
    "Graphics & Design",
    "Programming & Tech",
    "Digital Marketing",
    "Video & Animation",
    "Writing & Translation",
    "Music & Audio",
    "Business",
    "Data"
];

const levelLabels = ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
const levelColors = ['bg-gray-200', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-unihub-teal', 'bg-emerald-500'];

const StarRating = ({ value, onChange, readonly = false }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
            <button 
                key={star} 
                type="button" 
                disabled={readonly}
                onClick={() => onChange && onChange(star)}
                className={`${readonly ? 'cursor-default' : 'cursor-pointer'}`}
            >
                <Star className={`w-4 h-4 ${star <= value ? 'text-unihub-yellow fill-unihub-yellow' : 'text-gray-200'} transition-colors`} />
            </button>
        ))}
    </div>
);

const GigCard = ({ gig, user, onReview, onEdit, onDelete, onView, showControls = false, isOwn: isOwnProp }) => {
    const gigUserId = gig.userId?._id || gig.userId;
    const isOwn = isOwnProp !== undefined ? isOwnProp : (gigUserId?.toString() === user?._id?.toString());
    const rating = gig.avgRating ? gig.avgRating.toFixed(1) : "0.0";
    const reviewCount = gig.reviewCount || 0;
    const ownerName = gig.userId?.name || (isOwn ? user?.name : 'Anonymous Student');

    return (
        <div 
            onClick={() => onView && onView(gig)}
            className="uni-card group flex flex-col h-full relative cursor-pointer overflow-hidden hover:-translate-y-2 hover:shadow-2xl transition-all duration-500"
        >
            {/* Visual Header */}
            <div className="h-44 bg-gradient-to-br from-unihub-teal/10 to-unihub-coral/10 relative flex items-center justify-center overflow-hidden border-b border-white/40">
                <span className="text-unihub-teal font-black text-3xl opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-700 uppercase tracking-tighter select-none">
                    {gig.category}
                </span>
                {isOwn && showControls && (
                    <div className="absolute top-4 right-4 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onEdit(gig); }} 
                            className="glass w-9 h-9 rounded-xl flex items-center justify-center border border-white/60 text-unihub-teal hover:bg-unihub-teal hover:text-white transition-all active:scale-90 shadow-lg"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(gig._id); }} 
                            className="glass w-9 h-9 rounded-xl flex items-center justify-center border border-white/60 text-unihub-coral hover:bg-unihub-coral hover:text-white transition-all active:scale-90 shadow-lg"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-unihub-teal to-unihub-coral opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-unihub-teal flex items-center justify-center text-white text-xs font-black ring-2 ring-white shadow-md">
                        {ownerName[0]}
                    </div>
                    <span className="text-xs font-black text-unihub-textMuted truncate uppercase tracking-widest">{ownerName}</span>
                </div>

                <h3 className="text-base font-black text-unihub-text group-hover:text-unihub-teal transition-colors mb-3 line-clamp-2 min-h-[48px] font-display leading-snug tracking-tight">
                    {gig.title}
                </h3>

                <div className="flex items-center gap-2 mb-4">
                    <Star className="w-4 h-4 fill-unihub-yellow text-unihub-yellow" />
                    <span className="text-sm font-black text-unihub-text">{rating}</span>
                    <span className="text-xs text-unihub-textMuted font-bold">({reviewCount} reviews)</span>
                </div>

                <div className="mt-auto pt-4 border-t border-black/5 flex items-center justify-between">
                    {!isOwn && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onReview(gig.userId?._id, gig.userId?.name); }}
                            className="text-[10px] font-black text-unihub-teal hover:text-unihub-tealHover tracking-widest uppercase transition-colors"
                        >
                            Contact
                        </button>
                    )}
                    <div className="ml-auto text-right">
                        <p className="text-[9px] font-black text-unihub-textMuted uppercase tracking-widest opacity-60 mb-0.5">Fee</p>
                        <p className="text-lg font-black text-unihub-teal leading-none font-display">{gig.price > 0 ? `LKR ${gig.price}` : 'FREE'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SkillMarketplace = () => {
    const { user } = useContext(AuthContext);
    const [gigs, setGigs] = useState([]);
    const [myProfile, setMyProfile] = useState(null);
    const [myOrders, setMyOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewOrderModal, setViewOrderModal] = useState(null);
    const [deliverModal, setDeliverModal] = useState(null);
    const [deliveryWork, setDeliveryWork] = useState('');
    const [activeTab, setActiveTab] = useState('marketplace');
    const [searchQuery, setSearchQuery] = useState('');
    const [reviewModal, setReviewModal] = useState(null);
    const [viewGigModal, setViewGigModal] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', context: '' });
    const [editProfileMode, setEditProfileMode] = useState(false);
    const [gigModal, setGigModal] = useState(null); // { mode: 'create' | 'edit', data: {} }
    const [profileForm, setProfileForm] = useState({ bio: '', githubUrl: '', linkedinUrl: '' });
    const [gigForm, setGigForm] = useState({ title: '', description: '', category: CATEGORIES[0], price: 0, deliveryTime: '3 days' });
    const [message, setMessage] = useState(null);

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const fetchData = async () => {
        try {
            const [marketRes, meRes, ordersRes] = await Promise.all([
                axios.get('http://localhost:5000/api/skills', config),
                axios.get('http://localhost:5000/api/skills/me', config),
                axios.get('http://localhost:5000/api/skills/orders/me', config),
            ]);
            setGigs(marketRes.data);
            setMyProfile(meRes.data);
            setMyOrders(ordersRes.data);
            setProfileForm({ 
                bio: meRes.data.bio || '', 
                githubUrl: meRes.data.githubUrl || '', 
                linkedinUrl: meRes.data.linkedinUrl || ''
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const popularTags = Array.from(new Set((gigs || []).map(g => g.category))).slice(0, 4);
    const filteredGigs = (gigs || []).filter(g => 
        (g.title || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || 
        (g.category || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    );

    const handleSaveProfile = async () => {
        try {
            const { data } = await axios.put('http://localhost:5000/api/skills/me', profileForm, config);
            setMyProfile(prev => ({ ...prev, ...data }));
            setEditProfileMode(false);
            setMessage({ type: 'success', text: 'Profile updated!' });
            setTimeout(() => setMessage(null), 2000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save.' });
        }
    };

    const handleSaveGig = async () => {
        try {
            if (gigModal.mode === 'create') {
                await axios.post('http://localhost:5000/api/skills/gigs', gigForm, config);
                setMessage({ type: 'success', text: 'Gig published!' });
            } else {
                await axios.put(`http://localhost:5000/api/skills/gigs/${gigModal.data._id}`, gigForm, config);
                setMessage({ type: 'success', text: 'Gig updated!' });
            }
            setGigModal(null);
            fetchData();
            setTimeout(() => setMessage(null), 2000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save gig.' });
        }
    };

    const handleDeleteGig = async (id) => {
        if (!window.confirm('Are you sure you want to delete this gig?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/skills/gigs/${id}`, config);
            fetchData();
            setMessage({ type: 'success', text: 'Gig removed!' });
            setTimeout(() => setMessage(null), 2000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete.' });
        }
    };

    const handleSubmitReview = async () => {
        try {
            await axios.post('http://localhost:5000/api/skills/review', { targetId: reviewModal.targetId, ...reviewForm }, config);
            setReviewModal(null);
            setReviewForm({ rating: 5, comment: '', context: '' });
            setMessage({ type: 'success', text: 'Review submitted!' });
            fetchData();
            setTimeout(() => setMessage(null), 2000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit review.' });
        }
    };

    const handleOrderService = async () => {
        try {
            await axios.post('http://localhost:5000/api/skills/order', {
                sellerId: viewGigModal.userId?._id || viewGigModal.userId,
                gigId: viewGigModal._id,
                type: 'order',
                message: `Order request for "${viewGigModal.title}"`,
                price: viewGigModal.price
            }, config);
            
            setMessage({ type: 'success', text: 'Service request sent to peer!' });
            setViewGigModal(null);
            fetchData();
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to order service.' });
        }
    };

    const updateOrderStatus = async (orderId, status, deliveredWork = null) => {
        try {
            await axios.patch(`http://localhost:5000/api/skills/order/${orderId}/status`, {
                status,
                deliveredWork
            }, config);
            setMessage({ type: 'success', text: `Order ${status} successfully!` });
            setDeliverModal(null);
            setDeliveryWork('');
            fetchData();
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update order.' });
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-16">
            {/* Hero */}
                <div className="relative rounded-[32px] overflow-hidden shadow-2xl bg-gradient-to-br from-unihub-teal to-[#0d857a]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-white opacity-10 blur-[120px] rounded-full mix-blend-overlay animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white opacity-5 blur-[100px] rounded-full" />
                    <Globe className="absolute -right-16 -top-16 w-80 h-80 text-white opacity-10 rotate-12" strokeWidth={0.5} />
                </div>
                
                <div className="px-8 md:px-16 py-14 md:py-20 relative z-10">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[11px] font-bold text-white uppercase tracking-[0.2em] shadow-xl">
                            <Zap className="w-4 h-4 text-unihub-yellow" /> Peer Services Exchange
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter font-display">
                            Find the perfect <span className="text-unihub-yellow">peer service</span> for your project.
                        </h1>
                        
                        <div className="relative flex items-center max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden p-1.5">
                            <Search className="w-5 h-5 text-unihub-teal ml-4 flex-shrink-0" />
                            <input 
                                type="text" 
                                placeholder='Try "Logo Design" or "Python Help"' 
                                className="w-full py-3 px-4 bg-transparent outline-none text-unihub-text font-medium placeholder:text-slate-400 text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="bg-unihub-teal text-white px-7 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex-shrink-0 hover:bg-[#0d857a] transition-all active:scale-95 mr-1">
                                Search
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                            <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Popular:</span>
                            {popularTags.map(tag => (
                                <button 
                                    key={tag} onClick={() => setSearchQuery(tag)}
                                    className="bg-white/10 hover:bg-white hover:text-unihub-teal border border-white/20 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Bar */}
            <div className="glass border border-white/60 rounded-[28px] overflow-hidden shadow-xl px-8">
                <div className="flex items-center py-5 gap-8 overflow-x-auto no-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button 
                            key={cat} onClick={() => setSearchQuery(cat)}
                            className="text-[10px] font-black text-unihub-textMuted hover:text-unihub-teal transition-all whitespace-nowrap border-b-2 border-transparent hover:border-unihub-teal pb-1 uppercase tracking-widest font-display"
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-10 px-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-unihub-teal rounded-full shadow-[0_0_15px_rgba(20,184,166,0.3)]" />
                            <h2 className="text-3xl font-black text-unihub-text font-display tracking-tighter uppercase">
                                {searchQuery ? `Results: "${searchQuery}"` : 'Peer Services Nexus'}
                            </h2>
                        </div>
                        <p className="text-sm text-unihub-textMuted font-medium italic opacity-60 pl-5">Exploring {gigs.length} active services in the community</p>
                    </div>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setActiveTab('marketplace')}
                            className={`px-8 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all shadow-xl font-display ${
                                activeTab === 'marketplace' ? 'btn btn-primary' : 'glass border border-white/60 text-unihub-textMuted hover:text-unihub-text'
                            }`}
                        >
                            MARKETPLACE
                        </button>
                        <button 
                            onClick={() => setActiveTab('my-profile')}
                            className={`px-8 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all shadow-xl font-display ${
                                activeTab === 'my-profile' ? 'btn btn-primary' : 'glass border border-white/60 text-unihub-textMuted hover:text-unihub-text'
                            }`}
                        >
                            MY PROFILE
                        </button>
                    </div>
                </div>

                {message && (
                    <div className={`glass px-8 py-5 rounded-[24px] text-[11px] font-black flex items-center gap-4 transition-all shadow-lg border ${
                        message.type === 'success' ? 'border-emerald-200 text-emerald-700' : 'border-rose-200 text-rose-700'
                    }`}>
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                        <span className="uppercase tracking-widest font-display">{message.text}</span>
                    </div>
                )}

                {activeTab === 'marketplace' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredGigs.map(gig => (
                            <GigCard 
                                key={gig._id} 
                                gig={gig} 
                                user={user} 
                                onView={setViewGigModal}
                                onReview={(id, name) => setReviewModal({ targetId: id, targetName: name })}
                            />
                        ))}
                        {filteredGigs.length === 0 && (
                            <div className="col-span-full py-20 text-center space-y-4">
                                <div className="w-20 h-20 bg-unihub-teal/5 rounded-full flex items-center justify-center mx-auto">
                                    <Search className="w-8 h-8 text-unihub-teal/20" />
                                </div>
                                <p className="text-unihub-textMuted font-medium italic">No gigs found matching your search.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'my-profile' && (
                    <div className="space-y-8">
                        {/* ... (Profile header remains same) */}
                        <div className="bg-white border border-unihub-border rounded-3xl overflow-hidden shadow-soft">
                            <div className="bg-gradient-to-r from-unihub-teal to-unihub-tealHover px-10 py-12 flex flex-col md:flex-row items-center justify-between text-white gap-8">
                                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                                    <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl font-black ring-8 ring-white/10">
                                        {user?.name?.charAt(0)}
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-black">{user?.name}</h2>
                                        <div className="flex justify-center md:justify-start gap-4 pt-2">
                                            {myProfile?.githubUrl && <a href={myProfile.githubUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-all"><Github className="w-5 h-5" /></a>}
                                            {myProfile?.linkedinUrl && <a href={myProfile.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-all"><Linkedin className="w-5 h-5" /></a>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => setEditProfileMode(!editProfileMode)} 
                                        className="bg-white text-unihub-teal px-6 py-4 rounded-xl font-black text-xs hover:shadow-lg transition-all active:scale-95"
                                    >
                                        {editProfileMode ? 'CANCEL' : 'EDIT BIO'}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setGigForm({ title: '', description: '', category: CATEGORIES[0], price: 0, deliveryTime: '3 days' });
                                            setGigModal({ mode: 'create' });
                                        }}
                                        className="bg-unihub-yellow text-unihub-text px-6 py-4 rounded-xl font-black text-xs hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> CREATE NEW GIG
                                    </button>
                                </div>
                            </div>

                            <div className="p-10">
                                {editProfileMode ? (
                                    <div className="space-y-6 max-w-2xl">
                                        <div>
                                            <label className="block text-xs font-bold text-unihub-textMuted uppercase tracking-wider mb-2">My Professional Bio</label>
                                            <textarea 
                                                rows={4} 
                                                className="w-full border border-unihub-border rounded-2xl py-4 px-5 text-sm focus:outline-none focus:ring-4 focus:ring-unihub-teal/20 bg-gray-50 transition-all font-medium" 
                                                value={profileForm.bio} 
                                                onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))} 
                                                placeholder="Tell your peers about your background..." 
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-unihub-textMuted uppercase tracking-wider mb-2">GitHub</label>
                                                <input type="text" className="w-full border border-unihub-border rounded-xl py-3 px-4 text-sm bg-gray-50" value={profileForm.githubUrl} onChange={e => setProfileForm(f => ({ ...f, githubUrl: e.target.value }))} placeholder="URL" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-unihub-textMuted uppercase tracking-wider mb-2">LinkedIn</label>
                                                <input type="text" className="w-full border border-unihub-border rounded-xl py-3 px-4 text-sm bg-gray-50" value={profileForm.linkedinUrl} onChange={e => setProfileForm(f => ({ ...f, linkedinUrl: e.target.value }))} placeholder="URL" />
                                            </div>
                                        </div>
                                        <button onClick={handleSaveProfile} className="bg-unihub-teal text-white font-black py-4 px-10 rounded-2xl shadow-lg">SAVE CHANGES</button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                        <div className="md:col-span-2 space-y-10">
                                            <div className="space-y-4">
                                                <h3 className="text-xl font-black text-unihub-text flex items-center gap-3">
                                                    <CheckCircle className="w-6 h-6 text-unihub-teal" />
                                                    About Me
                                                </h3>
                                                <p className="text-unihub-textMuted leading-relaxed text-base italic pl-9">
                                                    {myProfile?.bio || "No bio added yet."}
                                                </p>
                                            </div>
                                            
                                            <div className="space-y-6">
                                                <h3 className="text-xl font-black text-unihub-text flex items-center gap-3">
                                                    <Award className="w-6 h-6 text-unihub-teal" />
                                                    My Active Gigs
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {myProfile?.gigs?.map(gig => (
                                                        <GigCard 
                                                            key={gig._id} 
                                                            gig={gig} 
                                                            user={user} 
                                                            showControls={true}
                                                            onView={setViewGigModal}
                                                            onEdit={(g) => {
                                                                setGigForm({ title: g.title, description: g.description, category: g.category, price: g.price, deliveryTime: g.deliveryTime });
                                                                setGigModal({ mode: 'edit', data: g });
                                                            }}
                                                            onDelete={handleDeleteGig}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Performance matrix area */}
                                        <div className="space-y-6">
                                            <div className="bg-unihub-teal/5 p-8 rounded-[40px] border border-unihub-teal/10">
                                                <h3 className="font-black text-unihub-text mb-6">Performance Matrix</h3>
                                                <div className="space-y-6">
                                                    <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-soft">
                                                        <span className="text-xs font-bold text-unihub-textMuted uppercase tracking-wider">Active Gigs</span>
                                                        <span className="font-black text-unihub-text text-unihub-teal">{myProfile?.gigs?.length || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Orders Section */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-unihub-text flex items-center gap-3">
                                <TrendingUp className="w-6 h-6 text-unihub-teal" />
                                My Marketplace Activity
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white border border-unihub-border rounded-3xl p-8 shadow-soft space-y-6">
                                    <h4 className="font-black text-unihub-text text-sm uppercase tracking-wider text-unihub-teal">Services I Ordered</h4>
                                    <div className="space-y-4">
                                        {myOrders.filter(o => o.buyerId?._id === user?._id).map(order => (
                                            <div 
                                                key={order._id} 
                                                onClick={() => setViewOrderModal(order)}
                                                className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-unihub-teal/30 hover:bg-unihub-teal-light/20 transition-all cursor-pointer group"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-unihub-teal flex items-center justify-center text-white font-black group-hover:scale-110 transition-transform">
                                                    {order.sellerId?.name?.[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-unihub-text truncate group-hover:text-unihub-teal transition-colors">{order.gigId?.title || 'Direct Contact'}</p>
                                                    <p className="text-[10px] text-unihub-textMuted font-bold uppercase tracking-wider">To: {order.sellerId?.name} • {new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase block ${
                                                        order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                                                        order.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                                        order.status === 'delivered' ? 'bg-indigo-100 text-indigo-700' :
                                                        order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {myOrders.filter(o => o.buyerId?._id === user?._id).length === 0 && (
                                            <p className="text-xs text-unihub-textMuted italic">No orders sent yet.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white border border-unihub-border rounded-3xl p-8 shadow-soft space-y-6">
                                    <h4 className="font-black text-unihub-text text-sm uppercase tracking-wider text-unihub-coral">Orders I Received</h4>
                                    <div className="space-y-4">
                                        {myOrders.filter(o => o.sellerId?._id === user?._id).map(order => (
                                            <div 
                                                key={order._id} 
                                                onClick={() => setViewOrderModal(order)}
                                                className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-unihub-coral/30 hover:bg-unihub-coral/5 transition-all cursor-pointer group"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-unihub-coral flex items-center justify-center text-white font-black group-hover:scale-110 transition-transform">
                                                    {order.buyerId?.name?.[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-unihub-text truncate group-hover:text-unihub-coral transition-colors">{order.gigId?.title || 'Inquiry'}</p>
                                                    <p className="text-[10px] text-unihub-textMuted font-bold uppercase tracking-wider">From: {order.buyerId?.name} • {new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase block ${
                                                        order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                                                        order.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                                        order.status === 'delivered' ? 'bg-indigo-100 text-indigo-700' :
                                                        order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {myOrders.filter(o => o.sellerId?._id === user?._id).length === 0 && (
                                            <p className="text-xs text-unihub-textMuted italic">No orders received yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* View Gig Detailed Modal */}
            {viewGigModal && (
                <div className="fixed inset-0 bg-unihub-text/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="h-48 bg-gradient-to-r from-unihub-teal to-unihub-tealHover relative p-10 flex items-end">
                            <button onClick={() => setViewGigModal(null)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-all text-2xl font-black">
                                <X className="w-8 h-8" />
                            </button>
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center text-3xl font-black text-unihub-teal">
                                    {(viewGigModal.userId?.name || (viewGigModal.userId === user?._id ? user?.name : 'U'))[0]}
                                </div>
                                <div className="text-white">
                                    <h3 className="text-sm font-bold opacity-80 uppercase tracking-widest">{viewGigModal.category}</h3>
                                    <h2 className="text-3xl font-black leading-tight">{viewGigModal.title}</h2>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-10 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="md:col-span-2 space-y-8">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-unihub-textMuted uppercase tracking-widest">About This Service</h4>
                                    <p className="text-unihub-text text-lg leading-relaxed font-medium italic">
                                        "{viewGigModal.description}"
                                    </p>
                                </div>
                                
                                <div className="flex gap-10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-tighter">Delivery Time</p>
                                        <div className="flex items-center gap-2 text-unihub-text font-black">
                                            <Calendar className="w-4 h-4 text-unihub-teal" />
                                            {viewGigModal.deliveryTime || '3 days'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-tighter">Rating</p>
                                        <div className="flex items-center gap-2 text-unihub-text font-black">
                                            <Star className="w-4 h-4 text-unihub-yellow fill-unihub-yellow" />
                                            {viewGigModal.avgRating?.toFixed(1) || '0.0'} ({viewGigModal.reviewCount || 0})
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-unihub-section rounded-[40px] p-8 space-y-8 flex flex-col justify-between border border-unihub-borderMuted">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-unihub-textMuted uppercase">Standard Fee</span>
                                        <span className="text-2xl font-black text-unihub-teal">
                                            {viewGigModal.price > 0 ? `LKR ${viewGigModal.price}` : 'FREE'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-unihub-textMuted font-bold italic leading-tight">
                                        * Peer-to-peer service. Please contact for specific requirements.
                                    </p>
                                </div>
                                
                                <div className="space-y-3">
                                    {viewGigModal.userId?._id !== user?._id && viewGigModal.userId !== user?._id && (
                                        <>
                                            <button 
                                                onClick={handleOrderService}
                                                className="w-full bg-unihub-teal text-white font-black py-4 rounded-2xl shadow-lg hover:bg-unihub-tealHover transition-all active:scale-95"
                                            >
                                                ORDER SERVICE
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setReviewModal({ targetId: viewGigModal.userId?._id || viewGigModal.userId, targetName: viewGigModal.userId?.name || user?.name });
                                                    setViewGigModal(null);
                                                }}
                                                className="w-full bg-white border border-unihub-border text-unihub-text font-black py-4 rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
                                            >
                                                CONTACT PEER
                                            </button>
                                        </>
                                    )}
                                    {(viewGigModal.userId?._id === user?._id || viewGigModal.userId === user?._id) && (
                                        <p className="text-center text-xs font-black text-unihub-teal italic">Sharing your talents with UniHub!</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Gig Modal (Create/Edit) */}
            {gigModal && (
                <div className="fixed inset-0 bg-unihub-text/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-black text-unihub-text mb-8 flex items-center gap-3">
                            {gigModal.mode === 'create' ? <Plus className="w-7 h-7 text-unihub-teal" /> : <Edit3 className="w-7 h-7 text-unihub-teal" />}
                            {gigModal.mode === 'create' ? 'Publish a New Service' : 'Update Your Gig'}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6 md:col-span-2">
                                <div>
                                    <label className="block text-xs font-bold text-unihub-textMuted uppercase tracking-wider mb-2">Gig Title (The catchy part)</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-unihub-border rounded-xl py-4 px-5 text-sm font-bold bg-gray-50 focus:bg-white focus:ring-4 focus:ring-unihub-teal/20 outline-none transition-all" 
                                        value={gigForm.title} 
                                        onChange={e => setGigForm(f => ({ ...f, title: e.target.value }))} 
                                        placeholder="e.g. I will design your university club logo" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-unihub-textMuted uppercase tracking-wider mb-2">Description (Details of your service)</label>
                                    <textarea 
                                        rows={4} 
                                        className="w-full border border-unihub-border rounded-2xl py-4 px-5 text-sm bg-gray-50 focus:bg-white focus:ring-4 focus:ring-unihub-teal/20 outline-none transition-all font-medium" 
                                        value={gigForm.description} 
                                        onChange={e => setGigForm(f => ({ ...f, description: e.target.value }))} 
                                        placeholder="What exactly will you provide? Be specific..." 
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-unihub-textMuted uppercase tracking-wider mb-2">Category</label>
                                <select 
                                    className="w-full border border-unihub-border rounded-xl py-4 px-4 text-sm font-bold bg-gray-50 outline-none" 
                                    value={gigForm.category} 
                                    onChange={e => setGigForm(f => ({ ...f, category: e.target.value }))}
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-unihub-textMuted uppercase tracking-wider mb-2">Delivery Time</label>
                                <div className="relative">
                                    <Calendar className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" 
                                        className="w-full border border-unihub-border rounded-xl py-4 pl-12 pr-4 text-sm font-bold bg-gray-50" 
                                        value={gigForm.deliveryTime} 
                                        onChange={e => setGigForm(f => ({ ...f, deliveryTime: e.target.value }))} 
                                        placeholder="e.g. 2 days" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-unihub-textMuted uppercase tracking-wider mb-2">Service Fee (LKR - 0 for free)</label>
                                <div className="relative">
                                    <DollarSign className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="number" 
                                        className="w-full border border-unihub-border rounded-xl py-4 pl-12 pr-4 text-sm font-bold bg-gray-50" 
                                        value={gigForm.price} 
                                        onChange={e => setGigForm(f => ({ ...f, price: +e.target.value }))} 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-8">
                            <button onClick={() => setGigModal(null)} className="flex-1 font-bold py-4 text-unihub-textMuted">CANCEL</button>
                            <button onClick={handleSaveGig} className="flex-1 bg-unihub-teal text-white font-black py-4 rounded-2xl shadow-lg hover:bg-unihub-tealHover transition-all">
                                {gigModal.mode === 'create' ? 'PUBLISH GIG' : 'UPDATE GIG'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {reviewModal && (
                <div className="fixed inset-0 bg-unihub-text/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 max-w-lg w-full">
                        <div className="text-center space-y-4 mb-8">
                            <div className="w-20 h-20 bg-unihub-teal/5 text-unihub-teal rounded-full flex items-center justify-center mx-auto ring-8 ring-unihub-teal/10">
                                <Award className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-unihub-text">Contact {reviewModal.targetName}</h3>
                        </div>
                        
                        <div className="space-y-6">
                            <textarea 
                                rows={4} 
                                className="w-full border border-unihub-border rounded-2xl py-4 px-5 text-sm bg-gray-50 focus:bg-white outline-none font-medium" 
                                placeholder="Describe what you need..." 
                                value={reviewForm.comment}
                                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                            />
                            <div className="flex gap-4">
                                <button onClick={() => setReviewModal(null)} className="flex-1 font-bold py-4 rounded-2xl hover:bg-gray-100">Cancel</button>
                                <button 
                                    onClick={async () => { 
                                        try {
                                            await axios.post('http://localhost:5000/api/skills/order', {
                                                sellerId: reviewModal.targetId,
                                                type: 'contact',
                                                message: reviewForm.comment,
                                                price: 0
                                            }, config);
                                            setReviewModal(null); 
                                            setMessage({ type: 'success', text: 'Message sent!' }); 
                                            setReviewForm(f => ({ ...f, comment: '' }));
                                            fetchData();
                                            setTimeout(() => setMessage(null), 2000); 
                                        } catch (err) {
                                            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to send message.' });
                                        }
                                    }} 
                                    className="flex-1 bg-unihub-teal text-white font-black py-4 rounded-2xl shadow-lg"
                                >
                                    Send Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Deliver Work Modal */}
            {deliverModal && (
                <div className="fixed inset-0 bg-unihub-text/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 max-w-lg w-full">
                        <div className="text-center space-y-4 mb-8">
                            <div className="w-20 h-20 bg-unihub-teal/5 text-unihub-teal rounded-full flex items-center justify-center mx-auto ring-8 ring-unihub-teal/10">
                                <Globe className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-unihub-text">Deliver Your Work</h3>
                            <p className="text-xs text-unihub-textMuted">Send the completed files or access link to {deliverModal.buyerId?.name}</p>
                        </div>
                        
                        <div className="space-y-6">
                            <textarea 
                                rows={6} 
                                className="w-full border border-unihub-border rounded-2xl py-4 px-5 text-sm bg-gray-50 focus:bg-white outline-none font-medium" 
                                placeholder="Write your delivery message or paste work links here..." 
                                value={deliveryWork}
                                onChange={e => setDeliveryWork(e.target.value)}
                            />
                            <div className="flex gap-4">
                                <button onClick={() => setDeliverModal(null)} className="flex-1 font-bold py-4 rounded-2xl hover:bg-gray-100">Cancel</button>
                                <button 
                                    onClick={async () => {
                                        await updateOrderStatus(deliverModal._id, 'delivered', deliveryWork);
                                        setDeliverModal(null);
                                        setViewOrderModal(null); // Close order modal too
                                    }} 
                                    className="flex-1 bg-unihub-teal text-white font-black py-4 rounded-2xl shadow-lg"
                                >
                                    Finish & Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Order Details Modal */}
            {viewOrderModal && (
                <div className="fixed inset-0 bg-unihub-text/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl ${viewOrderModal.sellerId?._id === user?._id ? 'bg-unihub-coral' : 'bg-unihub-teal'}`}>
                                {viewOrderModal.sellerId?._id === user?._id ? viewOrderModal.buyerId?.name?.[0] : viewOrderModal.sellerId?.name?.[0]}
                            </div>
                            <button onClick={() => setViewOrderModal(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-unihub-textMuted" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-black text-unihub-text leading-tight">{viewOrderModal.gigId?.title || 'Direct Contact Request'}</h3>
                                <p className="text-xs text-unihub-textMuted font-bold uppercase tracking-wider mt-1">
                                    {viewOrderModal.sellerId?._id === user?._id ? `From: ${viewOrderModal.buyerId?.name}` : `To: ${viewOrderModal.sellerId?.name}`} • {new Date(viewOrderModal.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="flex items-center gap-4 py-4 border-y border-unihub-border">
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-unihub-textMuted uppercase mb-1">Status</p>
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase inline-block ${
                                        viewOrderModal.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                                        viewOrderModal.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                        viewOrderModal.status === 'delivered' ? 'bg-indigo-100 text-indigo-700' :
                                        viewOrderModal.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {viewOrderModal.status}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-unihub-textMuted uppercase mb-1">Service Fee</p>
                                    <p className="text-lg font-black text-unihub-teal">{viewOrderModal.price > 0 ? `LKR ${viewOrderModal.price}` : 'FREE'}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                <p className="text-[10px] font-black text-unihub-textMuted uppercase mb-2">Message from Buyer</p>
                                <p className="text-sm text-unihub-text leading-relaxed italic">"{viewOrderModal.message}"</p>
                            </div>

                            {(viewOrderModal.status === 'delivered' || viewOrderModal.status === 'completed') && viewOrderModal.deliveredWork && (
                                <div className="bg-unihub-teal-light rounded-2xl p-5 border border-unihub-teal/20">
                                    <p className="text-[10px] font-black text-unihub-teal uppercase mb-2">Delivered Work</p>
                                    <p className="text-sm text-unihub-text leading-relaxed whitespace-pre-wrap font-medium">{viewOrderModal.deliveredWork}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                {viewOrderModal.sellerId?._id === user?._id ? (
                                    <>
                                        {viewOrderModal.status === 'pending' && (
                                            <>
                                                <button 
                                                    onClick={() => { updateOrderStatus(viewOrderModal._id, 'accepted'); setViewOrderModal(null); }}
                                                    className="flex-1 bg-unihub-teal text-white font-black py-4 rounded-2xl shadow-lg hover:bg-unihub-tealHover transition-all"
                                                >
                                                    Accept Order
                                                </button>
                                                <button 
                                                    onClick={() => { updateOrderStatus(viewOrderModal._id, 'cancelled'); setViewOrderModal(null); }}
                                                    className="flex-1 bg-white border border-unihub-coral text-unihub-coral font-black py-4 rounded-2xl hover:bg-unihub-coral/5 transition-all"
                                                >
                                                    Decline
                                                </button>
                                            </>
                                        )}
                                        {viewOrderModal.status === 'accepted' && (
                                            <button 
                                                onClick={() => setDeliverModal(viewOrderModal)}
                                                className="flex-1 bg-unihub-teal text-white font-black py-4 rounded-2xl shadow-lg hover:bg-unihub-tealHover transition-all"
                                            >
                                                Deliver Work
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {viewOrderModal.status === 'delivered' && (
                                            <button 
                                                onClick={() => { updateOrderStatus(viewOrderModal._id, 'completed'); setViewOrderModal(null); }}
                                                className="flex-1 bg-unihub-teal text-white font-black py-4 rounded-2xl shadow-lg hover:bg-unihub-tealHover transition-all"
                                            >
                                                Accept Work & Complete
                                            </button>
                                        )}
                                    </>
                                )}
                                <button onClick={() => setViewOrderModal(null)} className="px-6 font-bold py-4 rounded-2xl hover:bg-gray-100">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillMarketplace;
