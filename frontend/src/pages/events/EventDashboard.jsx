import { useState, useEffect, useContext } from 'react';
import { eventService } from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import EventCard from '../../components/events/EventCard';
import Swal from 'sweetalert2';
import { Search, Calendar, Zap, Globe, Filter } from 'lucide-react';
import '../../components/events/Events.css';

const EventDashboard = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [myRegistrations, setMyRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('All');

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
            await eventService.register(eventId);
            setMyRegistrations([...myRegistrations, eventId]);
            Swal.fire({
                title: 'Registration Confirmed!',
                text: 'We have registered your slot for this event.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                background: '#FFFFFF',
                color: '#2D3748'
            });
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
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[11px] font-bold text-white uppercase tracking-[0.2em] shadow-xl">
                            <Zap className="w-4 h-4 text-unihub-yellow" /> Live Ecosystem
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter font-display">
                            Ignite your campus life with <span className="text-unihub-yellow">exclusive events</span>.
                        </h1>

                        <div className="relative flex items-center max-w-2xl bg-white rounded-2xl shadow-2xl p-1.5 focus-within:ring-4 focus-within:ring-white/30 transition-all">
                            <div className="pl-4 shrink-0">
                                <Search className="w-5 h-5 text-unihub-teal" />
                            </div>
                            <input
                                type="text"
                                placeholder='Search events, workshops, sports...'
                                className="w-full py-3 px-4 bg-transparent outline-none text-unihub-text font-semibold placeholder:text-slate-400 text-sm font-display"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="bg-unihub-teal text-white px-7 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#0d857a] transition-all active:scale-95 flex-shrink-0">
                                Search
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                            <span className="text-white/60 font-bold text-xs uppercase tracking-widest">Trending:</span>
                            {['Workshop', 'Hackathon', 'Seminar'].map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSearchQuery(tag)}
                                    className="bg-white/10 hover:bg-white hover:text-unihub-teal border border-white/20 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
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
                            className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border-b-2 py-2 font-display ${
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
                    
                    <button className="btn btn-secondary px-8 py-3.5 text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 font-display flex items-center gap-3">
                        <Filter className="w-4 h-4" /> Sort Hierarchy
                    </button>
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
                                role={user?.role}
                                animationDelay={i * 100}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventDashboard;
