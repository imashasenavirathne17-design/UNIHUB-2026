import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    LayoutDashboard, Briefcase, Award, FileText,
    ClipboardCheck, Search, Calendar, Settings,
    BookOpen, MapPin, Clock, Heart, ShieldCheck, BarChart2
} from 'lucide-react';

const Sidebar = ({ isOpen }) => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    const menuGroups = [
        {
            title: 'Overview',
            links: [
                { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['student', 'lecturer', 'admin', 'organization', 'organizer', 'event organizer'] },
            ]
        },
        {
            title: 'Academic',
            links: [
                { to: '/exams', label: 'Online Exams', icon: BookOpen, roles: ['student', 'lecturer'] },
                { to: '/kuppi', label: 'Kuppi Sessions', icon: ClipboardCheck, roles: ['student', 'lecturer'] },
            ]
        },
        {
            title: 'Campus Life',
            links: [
                { to: '/lost-found', label: 'Lost & Found', icon: Search, roles: ['student', 'lecturer', 'admin', 'organizer', 'event organizer'] },
                { to: '/facilities', label: 'Facility Booking', icon: MapPin, roles: ['student', 'lecturer', 'admin', 'organizer', 'event organizer'] },
                { to: '/facilities/analytics', label: 'Analytics Engine', icon: BarChart2, roles: ['admin'] },
            ]
        },
        {
            title: 'Community',
            links: [
                { to: '/events', label: 'University Events', icon: Calendar, roles: ['student', 'lecturer', 'organizer', 'event organizer', 'organization'] },
                { to: '/events/manage', label: 'Manage Events', icon: Settings, roles: ['organizer', 'event organizer'] },
                { to: '/events/organizer-analytics', label: 'Event Analytics', icon: BarChart2, roles: ['organizer', 'event organizer'] },
                { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, roles: ['admin'] },
            ]
        },
        {
            title: 'Career Hub',
            links: [
                { to: '/internships', label: 'Internship Board', icon: Briefcase, roles: ['student', 'lecturer', 'organization'] },
                { to: '/skills', label: 'Skill Marketplace', icon: Award, roles: ['student', 'lecturer', 'organization'] },
                { to: '/cv-builder', label: 'CV Builder', icon: FileText, roles: ['student'] },
                { to: '/my-applications', label: 'My Applications', icon: ClipboardCheck, roles: ['student'] },
                { to: '/org-dashboard', label: 'Organization Dash', icon: LayoutDashboard, roles: ['organization'] },
                { to: '/saved-internships', label: 'Saved Jobs', icon: Clock, roles: ['student'] },
            ]
        }
    ];

    if (!user) return null;

    return (
        <aside className={`${isOpen ? 'w-64' : 'w-0 border-transparent'} glass-sidebar h-screen sticky top-0 overflow-hidden shrink-0 transition-all duration-300 hidden md:flex flex-col z-50`}>
            <div className="w-64 flex flex-col h-full shrink-0">
                {/* Logo */}
                <div className="p-6 border-b border-white/20">
                    <Link to="/" className="flex items-center gap-3 group">
                        <img src="/logo.png" alt="UniHub Logo" className="w-10 h-10 rounded-xl shadow-lg group-hover:scale-105 transition-transform object-cover" />
                        <span className="text-2xl font-bold text-unihub-text tracking-tight font-display">
                            Uni<span className="text-gradient">Hub</span>
                        </span>
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6 no-scrollbar">
                    {menuGroups.map((group, i) => {
                        const filteredLinks = group.links.filter(l => l.roles.includes(user.role));
                        if (filteredLinks.length === 0) return null;

                        return (
                            <div key={i}>
                                <p className="px-3 text-[10px] font-bold text-unihub-textMuted uppercase tracking-[0.2em] mb-2 font-display">
                                    {group.title}
                                </p>
                                <div className="space-y-1">
                                    {filteredLinks.map(link => {
                                        const Icon = link.icon;
                                        const isActive = location.pathname === link.to;
                                        return (
                                            <Link
                                                key={link.to}
                                                to={link.to}
                                                className={`flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                                                    isActive
                                                        ? 'bg-unihub-teal-light text-unihub-teal font-semibold'
                                                        : 'text-unihub-textMuted hover:bg-white/40 hover:text-unihub-text'
                                                }`}
                                            >
                                                {isActive && (
                                                    <div className="absolute left-0 w-1 h-6 bg-unihub-teal rounded-full" />
                                                )}
                                                <Icon className={`w-4.5 h-4.5 flex-shrink-0 transition-all duration-300 ${isActive ? 'text-unihub-teal scale-110 drop-shadow-[0_0_8px_rgba(20,184,166,0.3)]' : 'text-slate-400 group-hover:text-unihub-teal'}`} />
                                                <span className="font-display tracking-tight">{link.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/20">
                    <button className="flex items-center gap-3.5 px-3 py-3 w-full rounded-xl text-sm font-medium text-unihub-textMuted hover:bg-white/40 hover:text-unihub-text transition-all duration-200 group">
                        <Settings className="w-4.5 h-4.5 text-slate-400 group-hover:text-unihub-teal transition-all" />
                        <span className="font-display">System Settings</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
