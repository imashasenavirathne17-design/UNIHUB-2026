import React from 'react';
import { AlertTriangle, Clock, Users } from 'lucide-react';

const RiskAlert = ({ event, onTriggerReminder }) => {
    // Note: The prop name was 'alert' in the previous version but 'event' is more consistent with our data flow
    const riskLevels = {
        High: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', badge: 'bg-rose-600', icon: 'text-rose-600' },
        Medium: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', badge: 'bg-amber-500', icon: 'text-amber-500' },
        Low: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', badge: 'bg-emerald-500', icon: 'text-emerald-500' }
    };

    const risk = event.riskLevel || 'Low';
    const style = riskLevels[risk];

    return (
        <div className={`${style.bg} ${style.border} border rounded-[32px] p-6 shadow-soft hover:shadow-card transition-all group relative overflow-hidden flex flex-col h-full`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center ${style.icon}`}>
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <span className={`${style.badge} text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm`}>
                    {risk} RISK
                </span>
            </div>

            <div className="flex-1 space-y-3">
                <h4 className="font-black text-unihub-text text-base leading-tight group-hover:text-unihub-teal transition-colors">
                    {event.title}
                </h4>
                <p className="text-xs font-medium text-unihub-textMuted italic line-clamp-2">
                    {event.alertMessage || 'Registration monitoring active for this event.'}
                </p>
                
                <div className="pt-4 flex items-center gap-6 border-t border-black/5">
                    <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-unihub-textMuted" />
                        <span className="text-[10px] font-black text-unihub-text uppercase tracking-tighter">
                            {new Date(event.registrationDeadline).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-unihub-textMuted" />
                        <span className="text-[10px] font-black text-unihub-text uppercase tracking-tighter">
                            {event.fillRate?.toFixed(0)}% FILL
                        </span>
                    </div>
                </div>
            </div>

            {onTriggerReminder && (
                <div className="pt-4 mt-4 border-t border-black/5">
                    <button 
                        onClick={() => onTriggerReminder(event.eventId)}
                        className={`w-full py-2.5 ${style.badge} text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-sm hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2`}
                    >
                        Pull Reminder Trigger
                    </button>
                </div>
            )}

            <div className={`absolute bottom-0 left-0 w-full h-1 ${style.badge} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
        </div>
    );
};

export default RiskAlert;
