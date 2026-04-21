import { useState, useEffect, useContext } from 'react';
import { eventService, eventRequestService } from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import EventCard from '../../components/events/EventCard';
import EventDetailModal from '../../components/events/EventDetailModal';
import Swal from 'sweetalert2';
import { Search, Calendar, Zap, Globe, Filter, Lightbulb, X } from 'lucide-react';
import '../../components/events/Events.css';

const EventDashboard = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [myRegistrations, setMyRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('All');
    const [selectedEventForDetail, setSelectedEventForDetail] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [requestForm, setRequestForm] = useState({ title: '', description: '', category: '' });
    const [isRequesting, setIsRequesting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [eventsRes, myRegRes] = await Promise.all([
                eventService.getAllEvents(),
                eventService.getMyRegistrations()
            ]);
            setEvents(eventsRes.data);
            setMyRegistrations(myRegRes.data.map(reg => reg.event._id));
        } catch (error) {
            Swal.fire('Error', 'Failed to fetch events', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (eventId) => {
        try {
            const response = await eventService.register(eventId);
            setMyRegistrations([...myRegistrations, eventId]);
            
            if (response.data.overlappingEvents && response.data.overlappingEvents.length > 0) {
                const overlappingTitles = response.data.overlappingEvents.map(e => e.title).join(', ');
                Swal.fire({
                    title: 'Registration Confirmed',
                    text: `Warning: You have overlapping events at this time (${overlappingTitles}).`,
                    icon: 'warning',
                    confirmButtonColor: '#14b8a6'
                });
            } else {
                Swal.fire({
                    title: 'Registration Confirmed!',
                    text: 'We have registered your slot for this event.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#FFFFFF',
                    color: '#2D3748'
                });
            }
            setEvents(events.map(e => e._id === eventId ? { ...e, registeredCount: (e.registeredCount || 0) + 1 } : e));
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Registration failed', 'error');
        }
    };

    const handleUnregister = async (eventId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will free up your slot for other students.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FF6B6B',
            cancelButtonColor: '#E2E8F0',
            confirmButtonText: 'Yes, cancel it!'
        });

        if (result.isConfirmed) {
            try {
                await eventService.unregister(eventId);
                setMyRegistrations(myRegistrations.filter(id => id !== eventId));
                setEvents(events.map(e => e._id === eventId ? { ...e, registeredCount: Math.max(0, (e.registeredCount || 1) - 1) } : e));
                Swal.fire('Unregistered', 'Your registration has been cancelled.', 'success');
            } catch (error) {
                Swal.fire('Error', 'Unregistration failed', 'error');
            }
        }
    };

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        setIsRequesting(true);
        try {
            await eventRequestService.createRequest(requestForm);
            Swal.fire('Pitch Submitted!', 'Your event idea has been successfully beamed to the organizers. Keep an eye out for updates.', 'success');
            setIsRequestModalOpen(false);
            setRequestForm({ title: '', description: '', category: '' });
        } catch (error) {
            Swal.fire('Deployment Failed', error.response?.data?.message || 'Failed to submit pitch', 'error');
        } finally {
            setIsRequesting(false);
        }
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             event.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!matchesSearch) return false;
        if (filter === 'All') return true;
        if (filter === 'Trending') return event.isTrending;
        if (filter === 'Registered') return myRegistrations.includes(event._id);
        return event.category === filter;
    });

    const categories = ['All', 'Trending', 'Registered', ...new Set(events.map(e => e.category))];

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="w-16 h-16 border-4 border-unihub-teal/20 border-t-unihub-teal rounded-full animate-spin shadow-inner" />
            <p className="text-xs font-black text-unihub-textMuted uppercase tracking-widest animate-pulse font-display">Igniting Campus Life...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-16">
            {/* Hero Section */}
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl mt-4 bg-gradient-to-br from-unihub-teal to-[#0d857a]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-white opacity-10 blur-[120px] rounded-full mix-blend-overlay animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white opacity-5 blur-[100px] rounded-full" />
                    <Globe className="absolute -right-16 -top-16 w-80 h-80 text-white opacity-10 rotate-12" strokeWidth={0.5} />
                </div>

                <div className="px-8 md:px-16 py-14 md:py-20 relative z-10">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[11px] font-bold text-white tracking-[0.2em] shadow-xl">
                            <Zap className="w-4 h-4 text-unihub-yellow" /> Live Ecosystem
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-normal font-display">
                            Ignite Your Campus Life With <span className="text-unihub-yellow">Exclusive Events</span>.
                        </h1>
                        <p className="text-white/90 font-medium text-base md:text-lg max-w-xl leading-relaxed italic opacity-80">
                            {"Discover Hidden Opportunities, Collaborate With High-Performance Teams, And Experience The Next Generation Of University Engagement.".split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                        </p>

                        <div className="relative flex items-center max-w-2xl bg-white rounded-2xl shadow-2xl p-1.5 focus-within:ring-4 focus-within:ring-white/30 transition-all">
                            <div className="pl-4 shrink-0">
                                <Search className="w-5 h-5 text-unihub-teal" />
                            </div>
                            <input
                                type="text"
                                placeholder='Search Events, Workshops, Sports...'
                                className="w-full py-3 px-4 bg-transparent outline-none text-unihub-text font-semibold placeholder:text-slate-400 text-sm font-display"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="bg-unihub-teal text-white px-7 py-3 rounded-xl font-black tracking-normal text-[10px] hover:bg-[#0d857a] transition-all active:scale-95 flex-shrink-0">
                                Search
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                            <span className="text-white/60 font-bold text-xs tracking-normal">Trending:</span>
                            {['Workshop', 'Hackathon', 'Seminar'].map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSearchQuery(tag)}
                                    className="bg-white/10 hover:bg-white hover:text-unihub-teal border border-white/20 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-normal transition-all"
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Navigation Bar */}
            <div className="glass-card rounded-[28px] px-8 border border-white/40 shadow-xl scrollbar-hide">
                <div className="flex items-center py-4 gap-8 overflow-x-auto no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`text-[11px] font-black tracking-[0.2em] transition-all whitespace-nowrap border-b-2 py-2 font-display ${
                                filter === cat
                                    ? 'text-unihub-teal border-unihub-teal'
                                    : 'text-unihub-textMuted border-transparent hover:text-unihub-teal'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="space-y-10 px-1">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-8 bg-unihub-coral rounded-full shadow-[0_0_15px_rgba(255,107,107,0.3)]" />
                            <h2 className="text-3xl font-black text-unihub-text font-display tracking-tighter uppercase">
                                {searchQuery ? `REFINING RESULTS: "${searchQuery}"` : "DISCOVER WHAT'S NEXT"}
                            </h2>
                        </div>
                        <p className="text-sm text-unihub-textMuted font-bold uppercase tracking-widest pl-6 opacity-60 font-display italic">Empowering your university journey through engagement</p>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setIsRequestModalOpen(true)}
                            className="bg-transparent border-2 border-unihub-teal/30 hover:border-unihub-teal text-unihub-teal px-6 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Lightbulb className="w-4 h-4" /> Request Idea
                        </button>
                        <button className="btn btn-secondary px-6 py-3.5 text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 font-display flex items-center gap-3">
                            <Filter className="w-4 h-4" /> Sort Hierarchy
                        </button>
                    </div>
                </div>

                {filteredEvents.length === 0 ? (
                    <div className="py-32 text-center glass rounded-[40px] border-2 border-dashed border-black/5 space-y-8 max-w-4xl mx-auto shadow-sm group">
                        <div className="w-24 h-24 bg-gradient-to-br from-unihub-teal/5 to-unihub-coral/5 rounded-[32px] flex items-center justify-center mx-auto border border-black/5 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                            <Calendar className="w-10 h-10 text-slate-300 group-hover:text-unihub-teal transition-colors" strokeWidth={1.5} />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black text-unihub-text font-display uppercase tracking-tight">No events found</h3>
                            <p className="text-unihub-textMuted max-w-sm mx-auto text-base font-medium leading-relaxed italic">Adjust your filters or search terms to discover new campus experiences.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEvents.map((event, i) => (
                            <EventCard 
                                key={event._id}
                                event={event}
                                isRegistered={myRegistrations.includes(event._id)}
                                onRegister={handleRegister}
                                onUnregister={handleUnregister}
                                onShowDetails={(evt) => {
                                    setSelectedEventForDetail(evt);
                                    setIsDetailModalOpen(true);
                                }}
                                role={user?.role}
                                animationDelay={i * 100}
                            />
                        ))}
                    </div>
                )}
            </div>

            <EventDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                event={selectedEventForDetail}
                onRegister={handleRegister}
                onUnregister={handleUnregister}
                isRegistered={selectedEventForDetail ? myRegistrations.includes(selectedEventForDetail._id) : false}
                role={user?.role}
            />

            {/* Glassmorphic Event Request Modal */}
            {isRequestModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsRequestModalOpen(false)} />
                    
                    <div className="relative w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-500 rounded-[32px] border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                        {/* Decorative glow gradients */}
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-unihub-teal opacity-20 blur-[80px] rounded-full pointer-events-none" />
                        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-unihub-yellow opacity-10 blur-[80px] rounded-full pointer-events-none" />
                        
                        <div className="p-8 relative z-10">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3 drop-shadow-md">
                                    <Lightbulb className="w-6 h-6 text-unihub-yellow animate-pulse" /> Request Idea
                                </h3>
                                <button onClick={() => setIsRequestModalOpen(false)} className="text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-white/70 mb-8 italic font-medium leading-relaxed">
                                Ignite campus life. Pitch your workshop, symposium, or casual meetup straight to our organizers.
                            </p>
                            
                            <form onSubmit={handleRequestSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Event Title</label>
                                    <input 
                                        type="text" required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/30 focus:border-unihub-teal/50 focus:bg-white/10 outline-none transition-all"
                                        placeholder="E.g., Next-Gen Robotics Hackathon"
                                        value={requestForm.title} onChange={e => setRequestForm({...requestForm, title: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Event Category</label>
                                        <select 
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-unihub-teal/50 focus:bg-[#1a2f33] outline-none transition-all appearance-none cursor-pointer"
                                            value={requestForm.category} onChange={e => setRequestForm({...requestForm, category: e.target.value})}
                                        >
                                            <option value="" className="text-unihub-dark">Select Category</option>
                                            <option value="Workshop" className="text-unihub-dark">Workshop</option>
                                            <option value="Seminar" className="text-unihub-dark">Seminar</option>
                                            <option value="Hackathon" className="text-unihub-dark">Hackathon</option>
                                            <option value="Cultural" className="text-unihub-dark">Cultural</option>
                                            <option value="Sport" className="text-unihub-dark">Sport</option>
                                            <option value="Other" className="text-unihub-dark">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Detailed Pitch</label>
                                    <textarea 
                                        required rows="3"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/30 focus:border-unihub-teal/50 focus:bg-white/10 outline-none resize-none transition-all italic"
                                        placeholder="What's the core goal? Who should attend? Give the organizers a reason to say yes."
                                        value={requestForm.description} onChange={e => setRequestForm({...requestForm, description: e.target.value})}
                                    ></textarea>
                                </div>
                                
                                <button 
                                    type="submit" disabled={isRequesting}
                                    className="w-full py-4 mt-6 bg-gradient-to-r from-unihub-teal to-[#109b8e] hover:from-[#0d857a] hover:to-[#0a7267] text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] active:scale-[0.98] disabled:opacity-50 border border-white/10"
                                >
                                    {isRequesting ? 'Deploying Proposal...' : 'Launch Pitch'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventDashboard;
