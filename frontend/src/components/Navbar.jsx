import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    Search, Bell, ChevronDown, LogOut,
    User as UserIcon, Menu, Settings, MessageSquare
} from 'lucide-react';
import axios from 'axios';
import { NotificationBadge, NotificationPanel } from './notifications/NotificationCenter';

const MessageBadge = () => {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('user'))?.token;
                if (!token) return;
                const res = await axios.get('http://localhost:5000/api/lostfound/messages/unread/count', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUnreadCount(res.data.count);
            } catch (err) {}
        };
        fetchUnread();
        
        // Polling as a fallback for pure global events (could be swapped with global socket context)
        const interval = setInterval(fetchUnread, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <button className="relative p-2 rounded-xl text-unihub-textMuted hover:bg-white/40 hover:text-unihub-teal transition-all duration-200">
            <MessageSquare className="w-5 h-5" />
            {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-unihub-coral shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" />
            )}
        </button>
    );
};

const Navbar = ({ onToggleSidebar }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };

    if (!user) return null;

    return (
        <header className="h-16 glass-nav flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4 flex-1 max-w-lg">
                <button
                    onClick={onToggleSidebar}
                    className="hidden md:flex p-2.5 rounded-xl text-unihub-textMuted hover:bg-white/40 hover:text-unihub-teal transition-all duration-200"
                >
                    <Menu className="w-5 h-5 transition-transform active:rotate-90" />
                </button>
                {/* Search Bar */}
                <div className="hidden md:flex items-center flex-1 relative group">
                    <Search className="w-4.5 h-4.5 text-unihub-textMuted absolute left-4 group-focus-within:text-unihub-teal transition-all pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search for courses, internships, or events..."
                        className="w-full bg-white/30 border border-white/20 focus:border-unihub-teal/40 focus:bg-white/60 rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:shadow-[0_0_0_4px_rgba(20,184,166,0.08)] font-medium"
                    />
                </div>
            </div>

            {/* Mobile Logo */}
            <div className="md:hidden flex items-center gap-2.5 font-bold text-unihub-text text-base font-display">
                <img src="/logo.png" alt="UniHub Logo" className="w-8 h-8 rounded-xl shadow-teal-sm object-cover" />
                Uni<span className="text-unihub-teal">Hub</span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 relative">
                <MessageBadge />
                <NotificationBadge onClick={() => setShowNotifications(!showNotifications)} />
                <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

                <div className="h-6 w-px bg-black/5 mx-1" />

                {/* Profile */}
                <div className="relative">
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/40 transition-all duration-200 select-none border border-transparent hover:border-white/30"
                    >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-unihub-teal to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {user.name?.charAt(0)}
                        </div>
                        <div className="hidden lg:block text-left">
                            <p className="text-xs font-bold text-unihub-text leading-tight font-display">{user.name}</p>
                            <p className="text-[10px] text-unihub-textMuted font-semibold uppercase tracking-wider leading-tight mt-0.5">{user.role}</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-unihub-textMuted transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showProfileMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                            <div className="absolute right-0 top-full mt-3 w-56 glass rounded-2xl shadow-xl border border-white/30 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-5 py-3 border-b border-black/5 mb-1">
                                    <p className="text-[10px] font-bold text-unihub-textMuted uppercase tracking-widest font-display">Account Overview</p>
                                </div>
                                <button className="w-full flex items-center gap-3.5 px-5 py-3 text-sm font-medium text-unihub-text hover:bg-unihub-teal/5 transition-colors group">
                                    <UserIcon className="w-4.5 h-4.5 text-slate-400 group-hover:text-unihub-teal transition-colors" />
                                    My Profile
                                </button>
                                <button className="w-full flex items-center gap-3.5 px-5 py-3 text-sm font-medium text-unihub-text hover:bg-unihub-teal/5 transition-colors group">
                                    <Settings className="w-4.5 h-4.5 text-slate-400 group-hover:text-unihub-teal transition-colors" />
                                    Settings
                                </button>
                                <div className="h-px bg-black/5 my-1.5 mx-3" />
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3.5 px-5 py-3 text-sm font-bold text-unihub-coral hover:bg-unihub-coral/5 transition-colors group"
                                >
                                    <LogOut className="w-4.5 h-4.5 transition-transform group-hover:translate-x-1" />
                                    Log Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
