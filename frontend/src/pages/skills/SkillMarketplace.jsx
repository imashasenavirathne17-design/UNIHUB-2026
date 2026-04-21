import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
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
    Send,
    X,
    Clock
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

const CATEGORY_IMAGES = {
    "Graphics & Design": "https://images.unsplash.com/photo-1572044162444-ad60f128bde2?auto=format&fit=crop&q=80&w=800",
    "Programming & Tech": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800",
    "Digital Marketing": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    "Video & Animation": "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&q=80&w=800",
    "Writing & Translation": "https://images.unsplash.com/photo-1455391727215-2f4749b7e79f?auto=format&fit=crop&q=80&w=800",
    "Music & Audio": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800",
    "Business": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
    "Data": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
};

const DEFAULT_GIG_IMAGE = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800";

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
            {/* Visual Header with Image */}
            <div className="h-48 relative overflow-hidden group">
                <img 
                    src={CATEGORY_IMAGES[gig.category] || DEFAULT_GIG_IMAGE} 
                    alt={gig.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                
                {/* Overlay Badge */}
                <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-lg bg-unihub-teal/90 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest border border-white/20 shadow-lg">
                        {gig.category}
                    </span>
                </div>
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
        const isCreate = gigModal.mode === 'create';
        try {
            if (isCreate) {
                await axios.post('http://localhost:5000/api/skills/gigs', gigForm, config);
            } else {
                await axios.put(`http://localhost:5000/api/skills/gigs/${gigModal.data._id}`, gigForm, config);
            }
            setGigModal(null);
            fetchData();
            Swal.fire({
                title: isCreate ? 'Gig Published!' : 'Gig Updated!',
                text: isCreate
                    ? `"${gigForm.title}" is now live in the marketplace.`
                    : `"${gigForm.title}" has been updated successfully.`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                iconColor: '#14B8A6'
            });
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: err.response?.data?.message || 'Failed to save gig.',
                icon: 'error',
                showConfirmButton: true,
                confirmButtonColor: '#FF6B6B'
            });
        }
    };

    const handleDeleteGig = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Gig?',
            text: 'This will permanently remove your gig and all associated reviews.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FF6B6B',
            cancelButtonColor: '#E2E8F0',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Abort',
            background: '#ffffff',
            color: '#0F172A',
            iconColor: '#FF6B6B',
            customClass: {
                popup: 'rounded-3xl shadow-2xl',
                title: 'font-black',
                confirmButton: 'rounded-xl font-black text-sm',
                cancelButton: 'rounded-xl font-black text-sm text-slate-500',
            }
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(`http://localhost:5000/api/skills/gigs/${id}`, config);
            fetchData();
            Swal.fire({
                title: 'Gig Removed',
                text: 'Your gig has been permanently deleted.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                iconColor: '#14B8A6'
            });
        } catch (err) {
            Swal.fire({
                title: 'Delete Failed',
                text: 'Could not remove this gig. Please try again.',
                icon: 'error',
                showConfirmButton: true,
                confirmButtonColor: '#FF6B6B'
            });
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
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[11px] font-bold text-white tracking-[0.2em] shadow-xl">
                            <Zap className="w-4 h-4 text-unihub-yellow" /> Peer Services Exchange
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-normal font-display">
                            Find The Perfect <span className="text-unihub-yellow">Peer Service</span>.
                        </h1>
                        <p className="text-white/90 font-medium text-base md:text-lg max-w-xl leading-relaxed italic opacity-80">
                            {"Explore A Diverse Ecosystem Of Student-Led Services, Collaborate With Talented Peers, And Accelerate Your Projects With Relative Ease.".split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                        </p>
                        
                        <div className="relative flex items-center max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden p-1.5 focus-within:ring-4 focus-within:ring-white/30 transition-all">
                            <Search className="w-5 h-5 text-unihub-teal ml-4 flex-shrink-0" />
                            <input 
                                type="text" 
                                placeholder='Try "Logo Design" or "Python Help"' 
                                className="w-full py-3 px-4 bg-transparent outline-none text-unihub-text font-semibold placeholder:text-slate-400 text-sm font-display"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="btn btn-primary flex-shrink-0 mr-1">
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
                            className={`btn ${activeTab === 'marketplace' ? 'btn-primary' : 'btn-glass border border-white/60'}`}
                        >
                            MARKETPLACE
                        </button>
                        <button 
                            onClick={() => setActiveTab('my-profile')}
                            className={`btn ${activeTab === 'my-profile' ? 'btn-primary' : 'btn-glass border border-white/60'}`}
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
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        {/* Unified Profile Hero Header */}
                        <div className="relative rounded-[32px] overflow-hidden shadow-2xl bg-gradient-to-br from-unihub-teal to-[#0d857a] group">
                            <div className="absolute inset-0 overflow-hidden pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                                <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-white opacity-10 blur-[120px] rounded-full mix-blend-overlay animate-pulse" />
                                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white opacity-5 blur-[100px] rounded-full" />
                                <Globe className="absolute -right-16 -top-16 w-80 h-80 text-white opacity-10 rotate-12" strokeWidth={0.5} />
                            </div>

                            <div className="px-10 py-12 relative z-10 flex flex-col md:flex-row items-center justify-between text-white gap-8">
                                <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                                    <div className="relative group/avatar">
                                        <div className="w-28 h-28 rounded-[28px] bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl font-black ring-8 ring-white/10 shadow-2xl transition-transform group-hover/avatar:scale-105 group-hover/avatar:-rotate-3 duration-500">
                                            {user?.name?.charAt(0)}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-unihub-yellow rounded-xl flex items-center justify-center shadow-lg">
                                            <Award className="w-4 h-4 text-unihub-text" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest mb-1 shadow-inner">
                                            Verified Service Provider
                                        </div>
                                        <h2 className="text-4xl font-black tracking-tight font-display leading-tight">{user?.name?.split(' ')[0]} <span className="text-unihub-yellow">{user?.name?.split(' ').slice(1).join(' ')}</span></h2>
                                        <div className="flex justify-center md:justify-start gap-5 pt-2">
                                            {myProfile?.githubUrl && (
                                                <a href={myProfile.githubUrl} target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white hover:text-unihub-teal transition-all shadow-md group/link">
                                                    <Github className="w-5 h-5 group-hover/link:scale-110 transition-transform" />
                                                </a>
                                            )}
                                            {myProfile?.linkedinUrl && (
                                                <a href={myProfile.linkedinUrl} target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white hover:text-unihub-teal transition-all shadow-md group/link">
                                                    <Linkedin className="w-5 h-5 group-hover/link:scale-110 transition-transform" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                    <button 
                                        onClick={() => setEditProfileMode(!editProfileMode)} 
                                        className="btn bg-white/10 backdrop-blur-xl border border-white/40 text-white hover:bg-white hover:text-unihub-teal px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all"
                                    >
                                        {editProfileMode ? 'Abort Edits' : 'Sync Profile Bio'}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setGigForm({ title: '', description: '', category: CATEGORIES[0], price: 0, deliveryTime: '3 days' });
                                            setGigModal({ mode: 'create' });
                                        }}
                                        className="btn bg-unihub-yellow text-unihub-text hover:bg-amber-300 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                                    >
                                        <Plus className="w-5 h-5" /> Initialize Gig
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-unihub-border rounded-[32px] overflow-hidden shadow-soft">
                            <div className="p-10">
                                {editProfileMode ? (
                                    <div className="space-y-6 max-w-2xl">
                                        <div>
                                            <label className="uni-label">My Professional Bio</label>
                                            <textarea 
                                                rows={4} 
                                                className="uni-input text-sm" 
                                                value={profileForm.bio} 
                                                onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))} 
                                                placeholder="Tell your peers about your background..." 
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="uni-label">GitHub</label>
                                                <input type="text" className="uni-input" value={profileForm.githubUrl} onChange={e => setProfileForm(f => ({ ...f, githubUrl: e.target.value }))} placeholder="URL" />
                                            </div>
                                            <div>
                                                <label className="uni-label">LinkedIn</label>
                                                <input type="text" className="uni-input" value={profileForm.linkedinUrl} onChange={e => setProfileForm(f => ({ ...f, linkedinUrl: e.target.value }))} placeholder="URL" />
                                            </div>
                                        </div>
                                        <button onClick={handleSaveProfile} className="btn btn-primary">SAVE CHANGES</button>
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
                                        
                                        <div className="space-y-6">
                                            <div className="bg-unihub-teal/5 p-8 rounded-[40px] border border-unihub-teal/10">
                                                <h3 className="font-black text-unihub-text mb-6 uppercase tracking-tighter text-sm">Performance Matrix</h3>
                                                <div className="space-y-6">
                                                    <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-soft">
                                                        <span className="text-[10px] font-black text-unihub-textMuted uppercase tracking-wider">Active Gigs</span>
                                                        <span className="font-black text-unihub-teal">{myProfile?.gigs?.length || 0}</span>
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
                                Marketplace Records
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white border border-unihub-border rounded-3xl p-8 shadow-soft space-y-6">
                                    <h4 className="font-black text-unihub-text text-xs uppercase tracking-wider text-unihub-teal">Outgoing Orders</h4>
                                    <div className="space-y-4">
                                        {myOrders.filter(o => o.buyerId?._id === user?._id).map(order => (
                                            <div 
                                                key={order._id} 
                                                onClick={() => setViewOrderModal(order)}
                                                className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-unihub-teal/30 hover:bg-unihub-teal/5 transition-all cursor-pointer group"
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
                                    <h4 className="font-black text-unihub-text text-xs uppercase tracking-wider text-unihub-coral">Incoming Orders</h4>
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
                <div className="uni-modal-overlay">
                    <div className="uni-modal max-w-2xl w-full overflow-hidden flex flex-col">
                        {/* Header Section */}
                        <div className="px-7 py-5 border-b border-slate-100 flex items-center gap-3 bg-white text-left">
                            <div className="w-10 h-10 rounded-xl bg-unihub-teal/10 flex items-center justify-center flex-shrink-0">
                                <Award className="w-5 h-5 text-unihub-teal" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-base font-bold text-unihub-text leading-tight">{viewGigModal.title}</h2>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-unihub-textMuted font-medium">{viewGigModal.userId?.name || user?.name}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    <span className="text-xs text-unihub-textMuted font-medium">{viewGigModal.category}</span>
                                </div>
                            </div>
                            <button onClick={() => setViewGigModal(null)} className="w-9 h-9 flex items-center justify-center bg-unihub-coral hover:bg-unihub-coralHover text-white rounded-xl shadow-lg shadow-unihub-coral/20 transition-all active:scale-90">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-7 space-y-8 max-h-[calc(90vh-80px)] overflow-y-auto no-scrollbar text-left">
                            {/* Action Bar */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-unihub-teal animate-pulse" />
                                    <span className="text-[10px] font-bold text-unihub-teal uppercase tracking-widest">Active Peer Service</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-unihub-teal uppercase tracking-widest px-3 py-1 bg-unihub-teal/5 rounded-lg border border-unihub-teal/10">Verified Provider</span>
                                </div>
                            </div>

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: 'Service Fee', value: viewGigModal.price > 0 ? `LKR ${viewGigModal.price}` : 'FREE', icon: DollarSign },
                                    { label: 'Category', value: viewGigModal.category, icon: Award },
                                    { label: 'Delivery', value: viewGigModal.deliveryTime || '3 days', icon: Clock },
                                    { label: 'Rating', value: `${viewGigModal.avgRating?.toFixed(1) || '0.0'} (${viewGigModal.reviewCount || 0})`, icon: Star },
                                ].map(({ label, value, icon: Icon }) => (
                                    <div key={label} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-bold text-unihub-textMuted uppercase tracking-widest mb-1">{label}</p>
                                        <p className="text-sm font-bold text-unihub-text flex items-center gap-2">
                                            <Icon className={`w-3.5 h-3.5 ${label === 'Rating' ? 'text-unihub-yellow fill-unihub-yellow' : 'text-unihub-teal'}`} />
                                            {value}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Service Description */}
                            <div>
                                <label className="uni-label">About This Service</label>
                                <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line italic text-left">
                                        "{viewGigModal.description}"
                                    </p>
                                </div>
                            </div>

                            {/* Terms of Service */}
                            <div>
                                <label className="uni-label">Service Terms</label>
                                <div className="space-y-3">
                                    {[
                                        "Direct peer-to-peer collaboration and support.",
                                        "Secure payment handling through UniHub platform.",
                                        "Guaranteed delivery within the specified timeframe."
                                    ].map((term, i) => (
                                        <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-100 group hover:border-unihub-teal/30 transition-all">
                                            <div className="w-2 h-2 rounded-full bg-unihub-teal/40 group-hover:bg-unihub-teal" />
                                            <span className="text-sm text-slate-700 font-medium">{term}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions Section */}
                            <div className="pt-4 border-t border-slate-100">
                                {(viewGigModal.userId?._id !== user?._id && viewGigModal.userId !== user?._id) ? (
                                    <div className="space-y-4">
                                        <button 
                                            onClick={handleOrderService}
                                            className="btn btn-primary w-full py-4 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 shadow-xl transition-all"
                                        >
                                            <Zap className="w-4 h-4 fill-white" />
                                            Request Service
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setReviewModal({ targetId: viewGigModal.userId?._id || viewGigModal.userId, targetName: viewGigModal.userId?.name || user?.name });
                                                setViewGigModal(null);
                                            }}
                                            className="w-full py-4 bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl border border-slate-100 hover:text-unihub-teal hover:bg-white transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <Send className="w-4 h-4" />
                                            Direct Contact Peer
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-5 bg-unihub-teal/5 rounded-2xl border border-unihub-teal/10 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                            <Award className="w-5 h-5 text-unihub-teal" />
                                        </div>
                                        <p className="text-xs font-bold text-unihub-teal uppercase tracking-widest italic">
                                            You are viewing your own service record.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-7 py-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">
                                UniHub Peer Network &copy; 2026 • Reference ID: {viewGigModal?._id?.slice(-8).toUpperCase()}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Gig Modal (Create/Edit) */}
            {gigModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative">

                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-unihub-teal rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md flex-shrink-0">
                                    {gigModal.mode === 'create' ? 'G' : (gigForm.title?.[0]?.toUpperCase() || 'G')}
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-800 leading-tight">
                                        {gigModal.mode === 'create' ? 'Create Gig' : 'Edit Gig'}
                                    </h2>
                                    <p className="text-xs text-slate-400 font-medium">
                                        {gigModal.mode === 'create' ? 'Skill Marketplace' : gigForm.category}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setGigModal(null)}
                                className="w-9 h-9 rounded-xl bg-red-100 hover:bg-red-500 text-red-400 hover:text-white transition-all flex items-center justify-center active:scale-90 flex-shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="space-y-4">

                            {/* Gig Title */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Gig Title</label>
                                <div className="relative">
                                    <Zap className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-unihub-teal" />
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border-0 rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-unihub-teal/30 transition-all"
                                        value={gigForm.title}
                                        onChange={e => setGigForm(f => ({ ...f, title: e.target.value }))}
                                        placeholder="e.g. I will design your logo"
                                    />
                                </div>
                            </div>

                            {/* Category + Delivery Time */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                                    <select
                                        className="w-full bg-slate-50 border-0 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-unihub-teal/30 transition-all appearance-none cursor-pointer"
                                        value={gigForm.category}
                                        onChange={e => setGigForm(f => ({ ...f, category: e.target.value }))}
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Delivery Time</label>
                                    <div className="relative">
                                        <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-unihub-teal" />
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border-0 rounded-xl py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-unihub-teal/30 transition-all"
                                            value={gigForm.deliveryTime}
                                            onChange={e => setGigForm(f => ({ ...f, deliveryTime: e.target.value }))}
                                            placeholder="e.g. 2 days"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Service Fee */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Service Fee</label>
                                <div className="relative">
                                    <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-unihub-teal" />
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border-0 rounded-xl py-2.5 pl-10 pr-4 text-sm font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-unihub-teal/30 transition-all"
                                        value={gigForm.price}
                                        onChange={e => setGigForm(f => ({ ...f, price: +e.target.value }))}
                                        placeholder="0 = Free"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                                <textarea
                                    rows={3}
                                    className="w-full bg-slate-50 border-0 rounded-xl py-2.5 px-4 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-unihub-teal/30 transition-all resize-none leading-relaxed"
                                    value={gigForm.description}
                                    onChange={e => setGigForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="What will you deliver? Be specific..."
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSaveGig}
                                className="w-full bg-unihub-teal hover:bg-unihub-tealHover text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98] shadow-md mt-1"
                            >
                                <CheckCircle className="w-4 h-4" />
                                {gigModal.mode === 'create' ? 'Publish Gig' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {reviewModal && (
                <div className="uni-modal-overlay">
                    <div className="uni-modal p-10">
                        <div className="text-center space-y-4 mb-8">
                            <div className="w-16 h-16 bg-unihub-teal/10 text-unihub-teal rounded-[20px] flex items-center justify-center mx-auto shadow-inner">
                                <Award className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-unihub-text font-display tracking-tight">Contact {reviewModal.targetName}</h3>
                        </div>
                        
                        <div className="space-y-5">
                            <textarea 
                                rows={4} 
                                className="uni-input text-sm" 
                                placeholder="Describe what you need..." 
                                value={reviewForm.comment}
                                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setReviewModal(null)} className="btn btn-glass flex-1 border border-black/10">Cancel</button>
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
                                    className="btn btn-primary flex-1"
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
                <div className="uni-modal-overlay">
                    <div className="uni-modal p-10">
                        <div className="text-center space-y-3 mb-8">
                            <div className="w-16 h-16 bg-unihub-teal/10 text-unihub-teal rounded-[20px] flex items-center justify-center mx-auto shadow-inner">
                                <Globe className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-unihub-text font-display tracking-tight">Deliver Your Work</h3>
                            <p className="text-sm text-unihub-textMuted font-medium">Send the completed files or access link to {deliverModal.buyerId?.name}</p>
                        </div>
                        
                        <div className="space-y-5">
                            <textarea 
                                rows={6} 
                                className="uni-input text-sm" 
                                placeholder="Write your delivery message or paste work links here..." 
                                value={deliveryWork}
                                onChange={e => setDeliveryWork(e.target.value)}
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setDeliverModal(null)} className="btn btn-glass flex-1 border border-black/10">Cancel</button>
                                <button 
                                    onClick={async () => {
                                        await updateOrderStatus(deliverModal._id, 'delivered', deliveryWork);
                                        setDeliverModal(null);
                                        setViewOrderModal(null);
                                    }} 
                                    className="btn btn-primary flex-1"
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
                <div className="uni-modal-overlay">
                    <div className="uni-modal p-10 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl ${viewOrderModal.sellerId?._id === user?._id ? 'bg-unihub-coral' : 'bg-unihub-teal'}`}>
                                {viewOrderModal.sellerId?._id === user?._id ? viewOrderModal.buyerId?.name?.[0] : viewOrderModal.sellerId?.name?.[0]}
                            </div>
                            <button onClick={() => setViewOrderModal(null)} className="w-9 h-9 rounded-xl bg-black/5 hover:bg-black/10 flex items-center justify-center transition-all active:scale-90">
                                <X className="w-5 h-5 text-unihub-textMuted" />
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

                            <div className="glass rounded-2xl p-5 border border-white/60">
                                <p className="uni-label mb-2">Message from Buyer</p>
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
                                                    className="btn btn-primary flex-1"
                                                >
                                                    Accept Order
                                                </button>
                                                <button 
                                                    onClick={() => { updateOrderStatus(viewOrderModal._id, 'cancelled'); setViewOrderModal(null); }}
                                                    className="btn btn-secondary flex-1"
                                                >
                                                    Decline
                                                </button>
                                            </>
                                        )}
                                        {viewOrderModal.status === 'accepted' && (
                                            <button 
                                                onClick={() => {
                                                    setDeliverModal(viewOrderModal);
                                                    setViewOrderModal(null);
                                                }}
                                                className="btn btn-primary flex-1"
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
                                                className="btn btn-primary flex-1"
                                            >
                                                Accept Work & Complete
                                            </button>
                                        )}
                                    </>
                                )}
                                <button onClick={() => setViewOrderModal(null)} className="btn btn-glass border border-black/10">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillMarketplace;
