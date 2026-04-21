import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventService } from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { Clock, MapPin, Users, Calendar, ArrowLeft, Trophy, AlertCircle, Zap, Shield, Send, Activity } from 'lucide-react';

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
                    title: 'Release Slot?',
                    text: 'Are you sure you want to cancel your registration?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#FF6B6B',
                    confirmButtonText: 'Yes, release it'
                });
                if (result.isConfirmed) {
                    await eventService.unregister(id);
                    setIsRegistered(false);
                    Swal.fire('Slot Released', 'Your registration has been removed.', 'success');
                }
            } else {
                const response = await eventService.register(id);
                setIsRegistered(true);
                
                if (response.data.overlappingEvents && response.data.overlappingEvents.length > 0) {
                    const overlappingTitles = response.data.overlappingEvents.map(e => e.title).join(', ');
                    Swal.fire({
                        title: 'Registration confirmed',
                        text: `Warning: You have overlapping events at this time (${overlappingTitles}).`,
                        icon: 'warning',
                        confirmButtonColor: '#14b8a6'
                    });
                } else {
                    Swal.fire('Success!', 'Registration confirmed. See you at the event.', 'success');
                }
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Action failed', 'error');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40">
            <div className="w-12 h-12 border-4 border-unihub-teal/20 border-t-unihub-teal rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-widest">Accessing Event Node...</p>
        </div>
    );
    if (!event) return null;

    const isDeadlinePassed = new Date() > new Date(event.registrationDeadline);
    const isFull = event.registeredCount >= event.capacity;

    return (
        <div className="max-w-7xl mx-auto py-12 px-6 space-y-12 pb-32">
            <button onClick={() => navigate('/events')} className="inline-flex items-center gap-3 text-[10px] font-black text-unihub-textMuted hover:text-unihub-teal transition-all uppercase tracking-[0.3em] font-display group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Discovery Portal
            </button>

            <div className="relative group">
                {/* Hero Card */}
                <div className="glass-card rounded-[48px] border-white shadow-2xl overflow-hidden min-h-[450px] flex flex-col items-center justify-center text-center p-12 bg-white/60 backdrop-blur-3xl relative">
                    <div className="absolute top-10 right-10">
                        <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-xl backdrop-blur-md ${
                            event.status === 'Cancelled' ? 'bg-unihub-coral text-white border-unihub-coral' : 'bg-unihub-teal text-white border-unihub-teal'
                        }`}>
                            {event.status}
                        </div>
                    </div>

                    <div className="w-24 h-24 rounded-[32px] bg-slate-50 flex items-center justify-center text-4xl font-black text-unihub-teal shadow-2xl mb-8 border border-white/80">
                        {event.organizer?.name?.charAt(0)}
                    </div>

                    <div className="space-y-6 max-w-4xl">
                        <div className="flex justify-center flex-wrap gap-4">
                            <span className="px-5 py-1.5 bg-unihub-teal/10 text-unihub-teal rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                {event.category}
                            </span>
                            {event.isTrending && (
                                <span className="px-5 py-1.5 bg-unihub-yellow/20 text-unihub-yellow rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Zap className="w-3.5 h-3.5 fill-unihub-yellow" /> Viral Entry
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tight leading-[0.95] font-display">
                            {event.title}
                        </h1>
                        <div className="flex items-center justify-center gap-8 text-[11px] font-black text-unihub-textMuted uppercase tracking-[0.2em]">
                            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-unihub-coral" /> {event.venue || 'Global Lab'}</span>
                            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-unihub-teal" /> {new Date(event.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-12">
                        <section className="bg-white/40 p-10 rounded-[40px] border border-white/60 space-y-6 shadow-sm">
                            <h2 className="text-sm font-black text-unihub-textMuted flex items-center gap-2.5 uppercase tracking-[0.3em]">
                                <Activity className="w-4 h-4 text-unihub-teal" /> Event Directive
                            </h2>
                            <p className="text-lg font-medium text-slate-600 leading-relaxed italic pl-6 border-l-4 border-unihub-teal/20 whitespace-pre-line">
                                {event.description || 'No detailed instructions provided.'}
                            </p>
                        </section>

                        <section className="space-y-8">
                            <h2 className="text-sm font-black text-unihub-textMuted flex items-center gap-2.5 uppercase tracking-[0.3em] ml-2">
                                <Clock className="w-4 h-4 text-unihub-teal" /> Timeframe Delta
                            </h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {Object.entries(timeLeft).map(([unit, value]) => (
                                    <div key={unit} className="bg-white p-6 rounded-[28px] border border-slate-100 text-center space-y-2 shadow-sm">
                                        <p className="text-2xl font-black text-slate-800 tracking-tighter">{String(value).padStart(2, '0')}</p>
                                        <p className="text-[9px] font-black text-unihub-textMuted uppercase tracking-widest opacity-60">{unit}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="p-10 rounded-[40px] border border-slate-100 bg-white group hover:border-unihub-teal/20 transition-all flex items-center justify-between gap-10">
                           <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-2xl font-black text-unihub-teal shadow-xl border border-white">
                                    {event.organizer?.name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-widest opacity-60">Session Lead</p>
                                    <h4 className="text-xl font-black text-slate-800">{event.organizer?.name}</h4>
                                </div>
                           </div>
                           <div className="hidden md:block text-right">
                                <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-widest opacity-40">Verified Academic Activity</p>
                                <p className="text-[9px] font-bold text-unihub-teal uppercase tracking-widest mt-1">UniHub Auth 412.0</p>
                           </div>
                        </div>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="lg:col-span-4 space-y-6">
                        <section className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl space-y-8">
                            <h4 className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.3em] opacity-60">Live Enrollment</h4>
                            
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-4xl font-black text-unihub-teal tracking-tighter">{event.registeredCount}</p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Locked Slots</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-slate-200 tracking-tighter">{event.capacity}</p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                                    </div>
                                </div>

                                <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden shadow-inner ring-4 ring-slate-50/50">
                                    <div 
                                        className="h-full bg-gradient-to-r from-unihub-teal to-unihub-tealHover transition-all duration-1000" 
                                        style={{ width: `${(event.registeredCount / event.capacity) * 100}%` }}
                                    />
                                </div>

                                <div className="pt-6 border-t border-slate-50">
                                  {user?.role === 'student' && (
                                      <button 
                                          onClick={handleRegistration}
                                          disabled={(!isRegistered && (isDeadlinePassed || isFull)) || event.status !== 'Upcoming'}
                                          className={`w-full py-5 rounded-[24px] font-black text-[11px] tracking-[0.3em] shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 uppercase ${
                                              isRegistered 
                                                  ? 'bg-unihub-coral/10 text-unihub-coral border border-unihub-coral/20 hover:bg-unihub-coral hover:text-white' 
                                                  : 'bg-unihub-teal text-white hover:shadow-unihub-teal/30'
                                          }`}
                                      >
                                          {isRegistered ? 'Release My Slot' : (isDeadlinePassed ? 'Deadline Passed' : isFull ? 'Event Full' : 'Secure My Slot')}
                                      </button>
                                  )}
                                </div>
                            </div>
                        </section>

                        <div className="bg-slate-50/50 p-8 rounded-[36px] border border-white space-y-6">
                            {[
                                { label: 'Temporal Node', value: event.time || '09:00 AM', icon: Clock },
                                { label: 'Final Call', value: new Date(event.registrationDeadline).toLocaleDateString(), icon: AlertCircle },
                            ].map(({ label, value, icon: Icon }) => (
                                <div key={label} className="group">
                                    <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                                        <Icon className="w-3.5 h-3.5 text-unihub-teal" /> {label}
                                    </p>
                                    <p className="text-lg font-black text-slate-700 tracking-tight">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-center text-[10px] font-black text-slate-200 uppercase tracking-[0.5em] pt-12">
                UNIHUB EVENT NODE · {id.substring(0, 8).toUpperCase()}
            </p>
        </div>
    );
};

export default EventDetail;
