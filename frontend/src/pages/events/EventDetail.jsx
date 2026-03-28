import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventService } from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { Clock, MapPin, Users, Calendar, ArrowLeft, Trophy } from 'lucide-react';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

    useEffect(() => {
        fetchEventDetails();
    }, [id]);

    useEffect(() => {
        if (!event) return;

        const timer = setInterval(() => {
            const now = new Date();
            const target = new Date(event.date);
            const diff = target - now;

            if (diff <= 0) {
                clearInterval(timer);
                setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
            } else {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    mins: Math.floor((diff / 1000 / 60) % 60),
                    secs: Math.floor((diff / 1000) % 60)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [event]);

    const fetchEventDetails = async () => {
        setLoading(true);
        try {
            const { data } = await eventService.getEventById(id);
            setEvent(data);
            
            // Check if user is registered (from local storage or another API call)
            const regRes = await eventService.getMyRegistrations();
            setIsRegistered(regRes.data.some(reg => reg.event._id === id));
        } catch (error) {
            Swal.fire('Error', 'Failed to load event details', 'error');
            navigate('/events');
        } finally {
            setLoading(false);
        }
    };

    const handleRegistration = async () => {
        try {
            if (isRegistered) {
                const result = await Swal.fire({
                    title: 'Unregister?',
                    text: 'Are you sure you want to cancel your registration?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, cancel it'
                });
                if (result.isConfirmed) {
                    await eventService.unregister(id);
                    setIsRegistered(false);
                    Swal.fire('Cancelled', 'Your registration has been removed.', 'success');
                }
            } else {
                await eventService.register(id);
                setIsRegistered(true);
                Swal.fire('Success!', 'You are now registered for this event.', 'success');
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Action failed', 'error');
        }
    };

    if (loading) return <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-unihub-teal mx-auto"></div></div>;
    if (!event) return null;

    const isDeadlinePassed = new Date() > new Date(event.registrationDeadline);
    const isFull = event.registeredCount >= event.capacity;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 pb-16">
            <button onClick={() => navigate(-1)} className="flex items-center text-unihub-textMuted hover:text-unihub-teal mb-8 transition-colors font-black text-xs uppercase tracking-widest">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to events
            </button>

            <div className="bg-white rounded-[40px] shadow-soft border border-unihub-border overflow-hidden lg:grid lg:grid-cols-3">
                {/* Left Content */}
                <div className="lg:col-span-2 p-8 md:p-16">
                    <div className="flex items-center gap-3 mb-8">
                        <span className="px-3 py-1 bg-unihub-teal-light text-unihub-teal border border-unihub-teal/10 rounded-full text-[10px] font-black uppercase tracking-tighter">
                            {event.category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                            event.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}>
                            {event.status}
                        </span>
                        {event.isTrending && (
                            <span className="px-3 py-1 bg-unihub-yellow text-unihub-text rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm animate-trending">
                                🔥 Trending
                            </span>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-unihub-text mb-8 tracking-tight leading-tight">
                        {event.title}
                    </h1>
                    
                    <div className="flex flex-wrap gap-10 mb-12 pb-10 border-b border-gray-50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-unihub-teal/5 flex items-center justify-center text-unihub-teal shadow-sm">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] text-unihub-textMuted font-black uppercase tracking-widest">Event Date</p>
                                <p className="font-black text-sm text-unihub-text">
                                    {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-unihub-teal/5 flex items-center justify-center text-unihub-teal shadow-sm">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] text-unihub-textMuted font-black uppercase tracking-widest">Start Time</p>
                                <p className="font-black text-sm text-unihub-text">{event.time}</p>
                            </div>
                        </div>
                    </div>

                    <div className="prose max-w-none text-unihub-textMuted mb-12 leading-relaxed text-lg">
                        <h3 className="text-unihub-text text-xl font-black mb-6 flex items-center gap-3">
                             <Trophy className="w-6 h-6 text-unihub-yellow" /> 
                             Key Highlights
                        </h3>
                        <p className="font-medium italic">
                            {event.description}
                        </p>
                    </div>

                    <div className="bg-unihub-section rounded-[32px] p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 border border-unihub-border/50 shadow-sm">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-[20px] bg-unihub-teal text-white flex items-center justify-center font-black text-2xl shadow-lg ring-8 ring-unihub-teal/5">
                                {event.organizer?.name?.charAt(0)}
                            </div>
                            <div>
                                <p className="text-[10px] text-unihub-textMuted font-black uppercase tracking-widest">Lead Organizer</p>
                                <p className="font-black text-unihub-text text-xl">{event.organizer?.name}</p>
                            </div>
                        </div>
                        <Link 
                            to={`mailto:${event.organizer?.email}`} 
                            className="px-8 py-3 bg-white border border-unihub-border text-unihub-text rounded-xl text-xs font-black shadow-sm hover:shadow-md transition-all active:scale-95 text-center"
                        >
                            ENQUIRE NOW
                        </Link>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="bg-gray-50/50 p-8 md:p-12 border-l border-unihub-border">
                    <div className="mb-12 text-center">
                        <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.2em] mb-6 opacity-60">COUNTDOWN TO LAUNCH</p>
                        <div className="grid grid-cols-4 gap-3">
                            {Object.entries(timeLeft).map(([unit, value]) => (
                                <div key={unit} className="bg-white rounded-2xl shadow-sm border border-unihub-border p-4 flex flex-col items-center">
                                    <span className="text-2xl font-black text-unihub-teal leading-none">{String(value).padStart(2, '0')}</span>
                                    <span className="text-[8px] font-black text-unihub-textMuted uppercase tracking-tighter mt-2">{unit.toUpperCase()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white rounded-3xl p-8 shadow-soft border border-unihub-border">
                            <h4 className="font-black text-unihub-text text-xs uppercase tracking-[0.15em] mb-6 opacity-40">VENUE & LOGISTICS</h4>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-unihub-coral/10 text-unihub-coral rounded-xl">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-black text-base text-unihub-text">{event.venue}</p>
                                    <p className="text-xs font-bold text-unihub-textMuted mt-1 italic leading-snug">Official University Campus Environment</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-soft border border-unihub-border">
                            <h4 className="font-black text-unihub-text text-xs uppercase tracking-[0.15em] mb-6 opacity-40">ENROLLMENT ENGINE</h4>
                            <div className="mb-6">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter mb-2">
                                    <span className="text-unihub-textMuted">CAPACITY UTILIZATION</span>
                                    <span className="text-unihub-teal">{Math.round((event.registeredCount / event.capacity) * 100)}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-unihub-teal transition-all duration-1000" style={{ width: `${(event.registeredCount / event.capacity) * 100}%` }}></div>
                                </div>
                                <div className="flex justify-between mt-3 text-[9px] font-black text-unihub-textMuted opacity-60">
                                    <span>{event.registeredCount} SECURED</span>
                                    <span>{event.capacity} TOTAL</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-8 bg-unihub-section p-3 rounded-xl border border-unihub-border/30">
                                <Zap className="w-4 h-4 text-unihub-yellow" />
                                <p className="text-[9px] text-unihub-textMuted font-black uppercase tracking-widest">
                                    DEADLINE: <span className="text-unihub-text">{new Date(event.registrationDeadline).toLocaleDateString()}</span>
                                </p>
                            </div>
                            
                            {user?.role === 'student' && (
                                <button 
                                    onClick={handleRegistration}
                                    disabled={(!isRegistered && (isDeadlinePassed || isFull)) || event.status !== 'Upcoming'}
                                    className={`w-full py-5 rounded-2xl font-black text-xs tracking-[0.2em] shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:grayscale ${
                                        isRegistered 
                                            ? 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white' 
                                            : 'bg-unihub-teal text-white hover:bg-unihub-tealHover'
                                    }`}
                                >
                                    {isRegistered ? 'CANCEL REGISTRATION' : (isDeadlinePassed ? 'DEADLINE EXPIRED' : isFull ? 'EVENT AT CAPACITY' : 'SECURE MY SLOT')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
