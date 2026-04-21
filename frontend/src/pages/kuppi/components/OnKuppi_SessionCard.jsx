import { useState, useEffect } from 'react';
import { 
    Clock, 
    Calendar, 
    Video, 
    FileText, 
    Edit, 
    Trash2, 
    ExternalLink,
    ChevronRight,
    Download,
    User
} from 'lucide-react';
import { motion } from 'framer-motion';

const OnKuppi_SessionCard = ({ session, user, onEdit, onDelete }) => {
    const isOwner = session.created_by?._id === user?._id;
    const isAdmin = ['admin', 'lecturer'].includes(user?.role.toLowerCase());
    const canManage = isOwner || isAdmin;

    const [timeLeft, setTimeLeft] = useState('');
    const [isPast, setIsPast] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const sessionDate = new Date(session.date);
            const [hours, minutes] = session.time.split(':');
            sessionDate.setHours(hours, minutes, 0, 0);

            const difference = sessionDate - now;

            if (difference < 0) {
                setIsPast(true);
                setTimeLeft('Past Session');
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hrs = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const mins = Math.floor((difference / 1000 / 60) % 60);

            if (days > 0) setTimeLeft(`${days}d ${hrs}h Left`);
            else if (hrs > 0) setTimeLeft(`${hrs}h ${mins}m Left`);
            else setTimeLeft(`${mins}m Left`);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000);
        return () => clearInterval(timer);
    }, [session.date, session.time]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white/80 backdrop-blur-md rounded-[40px] p-8 border border-white shadow-soft hover:shadow-card transition-all flex flex-col justify-between min-h-[300px] relative overflow-hidden"
        >
            {/* Status Info */}
            <div className="flex justify-between items-start mb-8 relative z-10">
                <span className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-black tracking-[0.15em] ${
                    isPast ? 'bg-gray-100 text-gray-400' : 'bg-unihub-teal/10 text-unihub-teal'
                }`}>
                    {session.year} - {session.semester}
                </span>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    isPast ? 'bg-gray-50 text-gray-400' : 'bg-unihub-yellow/10 text-unihub-yellow'
                }`}>
                    <Clock className="w-3 h-3" /> {timeLeft}
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1">
                <h3 className="text-2xl font-black text-gray-800 leading-[1.2] mb-3 group-hover:text-unihub-teal transition-colors tracking-tight uppercase">
                    {session.subject}
                </h3>
                <div className="flex items-center gap-4 mb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(session.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl">
                        <Clock className="w-3.5 h-3.5" />
                        {session.time}
                    </div>
                </div>
                {session.description && (
                    <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-6">
                        {session.description}
                    </p>
                )}
                
                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-auto border-t border-gray-50 pt-6">
                    <div className="w-8 h-8 rounded-full bg-unihub-teal/10 flex items-center justify-center text-unihub-teal font-black border border-white shadow-sm">
                        <User className="w-4 h-4" />
                    </div>
                    <span>By {session.created_by?.name || 'Anonymous'}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-3 relative z-10">
                <a 
                    href={session.teams_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 bg-unihub-teal hover:bg-[#0d857a] text-white font-black py-4 rounded-[24px] transition-all shadow-xl hover:shadow-unihub-teal/20 active:scale-95 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest"
                >
                    <Video className="w-4 h-4" /> Join Session
                </a>
                
                {session.file_url ? (
                    <a 
                        href={`http://localhost:5000${session.file_url}`} 
                        download
                        className="p-4 rounded-[24px] bg-unihub-yellow/10 text-unihub-yellow hover:bg-unihub-yellow/20 transition-all shadow-sm border border-unihub-yellow/20"
                        title="Download Materials"
                    >
                        <FileText className="w-5 h-5 shadow-sm" />
                    </a>
                ) : (
                    <div className="p-4 rounded-[24px] bg-gray-50 text-gray-300 border border-gray-100" title="No Materials">
                        <FileText className="w-5 h-5 opacity-50" />
                    </div>
                )}
            </div>

            {/* Admin Controls */}
            {canManage && (
                <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-20">
                    <button 
                        onClick={() => onEdit(session)}
                        className="p-3 bg-white text-unihub-teal hover:bg-unihub-teal hover:text-white rounded-2xl shadow-xl border border-gray-100 transition-all active:scale-90"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => onDelete(session._id)}
                        className="p-3 bg-white text-unihub-coral hover:bg-unihub-coral hover:text-white rounded-2xl shadow-xl border border-gray-100 transition-all active:scale-90"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}
            
            {/* Background Decor */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gray-50 rounded-full opacity-0 group-hover:opacity-50 transition-opacity blur-2xl" />
        </motion.div>
    );
};

export default OnKuppi_SessionCard;
