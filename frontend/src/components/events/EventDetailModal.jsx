import React, { useState, useEffect } from 'react';
import { 
    X, 
    Calendar, 
    Clock, 
    MapPin, 
    Users, 
    Zap, 
    Activity,
    AlertCircle,
    Building2,
    Send
} from 'lucide-react';

const EventDetailModal = ({ event, isOpen, onClose, onRegister, onUnregister, isRegistered, role }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

    useEffect(() => {
        if (!event || !isOpen) return;
        const calculateTimeLeft = () => {
            const difference = +new Date(event.date) - +new Date();
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    mins: Math.floor((difference / 1000 / 60) % 60),
                    secs: Math.floor((difference / 1000) % 60)
                });
            }
        };
        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [event, isOpen]);

    if (!isOpen || !event) return null;

    const isDeadlinePassed = new Date() > new Date(event.registrationDeadline);
    const isFull = event.registeredCount >= event.capacity;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            {/* Glass Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative w-full max-w-5xl max-h-[92vh] bg-slate-50/10 backdrop-blur-3xl rounded-[56px] border border-white/20 shadow-[0_0_120px_rgba(0,0,0,0.3)] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-500">
                <button 
                    onClick={onClose}
                    className="absolute top-8 right-8 z-[110] w-11 h-11 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center justify-center transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6 md:p-10 space-y-12">
                    {/* Hero Header Glass */}
                    <div className="glass-card rounded-[48px] border-white shadow-2xl p-10 md:p-14 text-center relative overflow-hidden bg-white/60">
                        <div className="w-28 h-28 rounded-[40px] bg-slate-50 border border-white shadow-2xl flex items-center justify-center mx-auto mb-10 text-5xl font-black text-unihub-teal">
                            {event.organizer?.name?.charAt(0) || 'E'}
                        </div>

                        <div className="space-y-8 max-w-4xl mx-auto">
                            <div className="flex justify-center flex-wrap gap-4">
                                <span className="inline-flex px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.3em] shadow-xl bg-unihub-teal/10 text-unihub-teal">
                                    {event.category}
                                </span>
                                <span className={`inline-flex px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.3em] shadow-xl ${
                                    event.status === 'Cancelled' ? 'bg-unihub-coral/10 text-unihub-coral' : 'bg-unihub-teal/10 text-unihub-teal'
                                }`}>
                                    {event.status}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-7xl font-black text-slate-900 leading-[0.95] tracking-tight font-display mb-10">
                                {event.title}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center gap-10 text-[12px] font-black text-unihub-textMuted uppercase tracking-[0.3em]">
                                <span className="flex items-center gap-3 font-display"><MapPin className="w-5 h-5 text-unihub-coral" /> {event.venue || 'Global Lab'}</span>
                                <span className="flex items-center gap-3 font-display"><Calendar className="w-5 h-5 text-unihub-teal" /> {new Date(event.date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Matrix */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-14">
                        <div className="lg:col-span-8 space-y-14">
                            <section className="bg-white/40 p-12 rounded-[48px] border border-white/60 shadow-xl space-y-8 backdrop-blur-md">
                                <h2 className="text-[11px] font-black text-unihub-textMuted flex items-center gap-3 uppercase tracking-[0.4em]">
                                    <Activity className="w-4.5 h-4.5 text-unihub-teal" /> Event Directive
                                </h2>
                                <p className="text-xl font-medium text-slate-600 leading-relaxed italic pl-8 border-l-8 border-unihub-teal/10 whitespace-pre-line">
                                    {event.description || 'No detailed instructions provided.'}
                                </p>
                            </section>

                            <section className="space-y-10">
                                <h2 className="text-[11px] font-black text-unihub-textMuted flex items-center gap-3 uppercase tracking-[0.4em] ml-4">
                                    <Clock className="w-4.5 h-4.5 text-unihub-teal" /> Timeframe Delta
                                </h2>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                    {Object.entries(timeLeft).map(([unit, value]) => (
                                        <div key={unit} className="bg-white p-8 rounded-[36px] border border-slate-100 text-center space-y-3 shadow-2xl hover:scale-[1.05] transition-transform">
                                            <p className="text-3xl font-black text-slate-800 tracking-tighter">{String(value).padStart(2, '0')}</p>
                                            <p className="text-[9px] font-black text-unihub-textMuted uppercase tracking-widest opacity-60">{unit}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <div className="p-12 rounded-[56px] border border-white bg-white/60 backdrop-blur-md flex items-center justify-between gap-10 shadow-xl">
                                <div className="flex items-center gap-8">
                                    <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center text-3xl font-black text-unihub-teal shadow-2xl border border-white">
                                        {event.organizer?.name?.charAt(0) || 'E'}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.4em] opacity-40">Session Lead</p>
                                        <h4 className="text-2xl font-black text-slate-800">{event.organizer?.name}</h4>
                                    </div>
                                </div>
                                <div className="hidden md:block text-right">
                                    <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-widest opacity-20">Verified Academic Node</p>
                                    <div className="flex items-center gap-2 justify-end mt-2">
                                        <div className="w-2 h-2 rounded-full bg-unihub-teal animate-pulse" />
                                        <span className="text-[10px] font-black uppercase text-unihub-teal tracking-widest leading-none">Status: Live</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Section - Sidebar (Logistics & Registration) */}
                        <div className="lg:col-span-4 space-y-8">
                            <section className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-[0_40px_80px_rgba(0,0,0,0.05)] space-y-10">
                                <h4 className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.5em] opacity-60">Live Enrollment</h4>
                                
                                <div className="space-y-8">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-5xl font-black text-unihub-teal tracking-tighter">{event.registeredCount}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Locked Slots</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-slate-200 tracking-tighter">{event.capacity}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                                        </div>
                                    </div>

                                    <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden shadow-inner ring-8 ring-slate-50/50">
                                        <div 
                                            className="h-full bg-gradient-to-r from-unihub-teal to-unihub-tealHover transition-all duration-1000 shadow-[0_0_20px_rgba(20,184,166,0.3)]" 
                                            style={{ width: `${(event.registeredCount / event.capacity) * 100}%` }}
                                        />
                                    </div>

                                    <div className="pt-10 border-t border-slate-50">
                                    {role === 'student' ? (
                                        <button 
                                            onClick={() => {
                                                if (isRegistered) onUnregister(event._id);
                                                else onRegister(event._id);
                                            }}
                                            disabled={(!isRegistered && (isDeadlinePassed || isFull)) || event.status !== 'Upcoming'}
                                            className={`w-full py-6 rounded-[32px] font-black text-[12px] tracking-[0.4em] shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 uppercase ${
                                                isRegistered 
                                                    ? 'bg-unihub-coral/10 text-unihub-coral border border-unihub-coral/20 hover:bg-unihub-coral hover:text-white' 
                                                    : 'bg-unihub-teal text-white hover:shadow-unihub-teal/40'
                                            }`}
                                        >
                                            {isRegistered ? 'Release My Slot' : (isDeadlinePassed ? 'Deadline Passed' : isFull ? 'Event Full' : 'Secure my slot')}
                                        </button>
                                    ) : (
                                        <div className="text-center p-8 bg-slate-50 border border-slate-100 rounded-[32px] border-dashed">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrative Control</p>
                                        </div>
                                    )}
                                    </div>
                                </div>
                            </section>

                            <div className="bg-slate-950 p-10 rounded-[48px] text-white space-y-8 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-unihub-coral/20 blur-[80px] group-hover:bg-unihub-coral/30 transition-colors" />
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Temporal Node</p>
                                    <p className="text-2xl font-black text-white tracking-tight flex items-center gap-3"><Clock className="w-6 h-6 text-unihub-teal" /> {event.time || '09:00 AM'}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Final Call</p>
                                    <p className="text-2xl font-black text-white tracking-tight flex items-center gap-3"><AlertCircle className="w-6 h-6 text-unihub-coral" /> {new Date(event.registrationDeadline).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.6em] opacity-20 pt-10 pb-4">
                        UNIHUB EVENT NODE SEC-ID · {event._id.toUpperCase()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EventDetailModal;
