import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Calendar, 
    Clock, 
    MapPin, 
    ChevronRight, 
    Zap, 
    Users, 
    Info, 
    Settings,
    UserMinus,
    UserPlus
} from 'lucide-react';
import './Events.css';

const EventCard = ({ event, isRegistered, onRegister, onUnregister, role, animationDelay = 0 }) => {
    const isDeadlinePassed = new Date() > new Date(event.registrationDeadline);
    const isFull = event.registeredCount >= event.capacity;
    const isUpcoming = event.status === 'Upcoming';

    return (
        <div 
            className={`event-card glass-card group relative overflow-hidden flex flex-col h-full transition-all duration-500 hover:border-unihub-teal/40 animate-in fade-in slide-in-from-bottom-4`} 
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            {/* Visual Header */}
            <div className="h-28 bg-gradient-to-br from-unihub-teal/10 to-unihub-coral/10 relative p-6 flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-lg flex items-center justify-center text-2xl font-black text-unihub-teal group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <span className="relative z-10">{event.title.charAt(0)}</span>
                    <div className="absolute inset-0 bg-unihub-teal/5 rounded-2xl" />
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`badge ${
                        event.status === 'Upcoming' ? 'badge-teal' :
                        event.status === 'Ongoing' ? 'badge-coral' :
                        'badge-amber'
                    } border border-white/20 shadow-sm`}>
                        {event.status.toUpperCase()}
                    </span>
                    {event.isTrending && (
                        <span className="badge bg-unihub-yellow/20 text-yellow-800 border border-unihub-yellow/20 shadow-sm flex items-center gap-1.5 animate-pulse">
                            <Zap className="w-3 h-3 fill-unihub-yellow" /> TRENDING
                        </span>
                    )}
                </div>

                {/* Decorative Flare */}
                <div className="absolute -top-10 -left-10 w-24 h-24 bg-unihub-teal/5 rounded-full blur-3xl group-hover:bg-unihub-teal/10 transition-colors" />
            </div>

            <div className="p-8 flex-1 flex flex-col">
                <div className="mb-5">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-extrabold text-unihub-text group-hover:text-unihub-teal transition-colors line-clamp-1 font-display tracking-tight">
                            {event.title}
                        </h3>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-unihub-textMuted uppercase tracking-widest opacity-80">
                        <span className="text-unihub-teal">{event.category}</span>
                        <span className="opacity-20">|</span>
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.venue}
                        </div>
                    </div>
                </div>

                <p className="text-sm text-unihub-textMuted line-clamp-2 mb-8 font-medium leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">
                    {event.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-2.5 text-xs font-bold text-unihub-text font-display">
                        <div className="w-8 h-8 rounded-lg bg-unihub-teal/10 flex items-center justify-center text-unihub-teal">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <span className="opacity-80">{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-unihub-text font-display">
                        <div className="w-8 h-8 rounded-lg bg-unihub-teal/10 flex items-center justify-center text-unihub-teal">
                            <Clock className="w-4 h-4" />
                        </div>
                        <span className="opacity-80">{event.time}</span>
                    </div>
                </div>

                <div className="mt-auto space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-1.5 font-display">
                            <span className="text-unihub-textMuted opacity-60">Reserved Slots</span>
                            <span className="text-unihub-teal flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                {event.registeredCount} / {event.capacity}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden shadow-inner">
                            <div 
                                className={`h-full bg-gradient-to-r from-unihub-teal to-unihub-tealHover rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(20,184,166,0.3)]`} 
                                style={{ width: `${(event.registeredCount / event.capacity) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-6 border-t border-black/5 items-center">
                        <Link
                            to={`/events/${event._id}`}
                            className="btn btn-glass py-3.5 text-[11px] font-black uppercase tracking-[0.2em] shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Info className="w-3.5 h-3.5" /> DETAILS
                        </Link>
                        {role === 'student' && (
                            isRegistered ? (
                                <button
                                    onClick={() => onUnregister(event._id)}
                                    className="btn btn-secondary py-3.5 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <UserMinus className="w-3.5 h-3.5" /> CANCEL
                                </button>
                            ) : (
                                <button
                                    onClick={() => onRegister(event._id)}
                                    disabled={isDeadlinePassed || isFull}
                                    className="btn btn-primary py-3.5 text-[11px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDeadlinePassed ? (
                                        'CLOSED'
                                    ) : isFull ? (
                                        'FULL'
                                    ) : (
                                        <>
                                            <UserPlus className="w-3.5 h-3.5" /> REGISTER
                                        </>
                                    )}
                                </button>
                            )
                        )}
                        {(role === 'admin' || role === 'organizer') && (
                            <Link
                                to={`/events/manage`}
                                className="btn btn-primary py-3.5 text-[11px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Settings className="w-3.5 h-3.5" /> MANAGE
                            </Link>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Visual Bottom Border */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-unihub-teal to-unihub-coral opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
    );
};

export default EventCard;
