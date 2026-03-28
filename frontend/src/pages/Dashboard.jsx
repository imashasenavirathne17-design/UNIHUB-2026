import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
    Briefcase,
    Award,
    Search,
    Calendar,
    BookOpen,
    MapPin,
    ChevronRight,
    TrendingUp,
    Users,
    CheckCircle2,
    Clock,
    ClipboardCheck,
    ChevronLeft,
    Heart,
    RefreshCcw
} from 'lucide-react';

const MODULES = [
    { id: 'exams', title: 'Online Exams', desc: 'Practice and evaluate your knowledge.', icon: BookOpen, color: 'badge-teal', to: '/exams', roles: ['student', 'lecturer', 'admin'] },
    { id: 'lostfound', title: 'Lost & Found', desc: 'Report or find lost items.', icon: Search, color: 'badge-coral', to: '/lost-found', roles: ['student', 'lecturer', 'admin'] },
    { id: 'facilities', title: 'Facility Booking', desc: 'Book university labs and halls.', icon: MapPin, color: 'badge-amber', to: '/facilities', roles: ['student', 'lecturer', 'admin'] },
    { id: 'events', title: 'Campus Events', desc: 'Join or organize campus events.', icon: Calendar, color: 'badge-teal', to: '/events', roles: ['student', 'lecturer', 'admin'] },
    { id: 'internships', title: 'Internships', desc: 'Find your dream internship.', icon: Briefcase, color: 'badge-coral', to: '/internships', roles: ['student', 'lecturer', 'admin', 'organization'] },
    { id: 'skills', title: 'Skill Marketplace', desc: 'Get endorsed for your expertise.', icon: Award, color: 'badge-amber', to: '/skills', roles: ['student', 'lecturer', 'admin', 'organization'] },
    { id: 'org-dashboard', title: 'Internship Mgmt', desc: 'Manage postings and applicants.', icon: Briefcase, color: 'badge-teal', to: '/org-dashboard', roles: ['organization'] },
];

const HeroSlideshow = ({ role }) => {
    const [current, setCurrent] = useState(0);
    
    const studentSlides = [
        {
            title: "Master Your Exams",
            subtitle: "Practice with MCQ question banks and track your performance instantly.",
            btn: "Start Practice",
            to: "/exams",
            bg: "bg-gradient-to-br from-unihub-teal to-[#0d857a]",
            icon: BookOpen,
            accent: "text-unihub-yellow"
        },
        {
            title: "Campus Essentials",
            subtitle: "Book university halls and labs with our new real-time facility system.",
            btn: "Book Facility",
            to: "/facilities",
            bg: "bg-gradient-to-br from-unihub-coral to-[#de3047]",
            icon: MapPin,
            accent: "text-unihub-yellow"
        },
        {
            title: "Stay Connected",
            subtitle: "Never miss a campus event again. Discover and register in seconds.",
            btn: "Explore Events",
            to: "/events",
            bg: "bg-gradient-to-br from-unihub-teal to-[#0d857a]",
            icon: Calendar,
            accent: "text-unihub-yellow"
        },
        {
            title: "Launch Your Career",
            subtitle: "Find exclusive internships and build your skill profile with endorsements.",
            btn: "Find Jobs",
            to: "/internships",
            bg: "bg-gradient-to-br from-unihub-coral to-[#de3047]",
            icon: Briefcase,
            accent: "text-unihub-yellow"
        }
    ];

    const orgSlides = [
        {
            title: "Find Top Talent",
            subtitle: "Post internship opportunities and connect with high-achieving students.",
            btn: "Post Internship",
            to: "/org-dashboard",
            bg: "bg-gradient-to-br from-unihub-teal to-[#0d857a]",
            icon: Briefcase,
            accent: "text-unihub-yellow"
        },
        {
            title: "Skill Discovery",
            subtitle: "Browse students with verified skills and review their project portfolios.",
            btn: "Browse Skills",
            to: "/skills",
            bg: "bg-gradient-to-br from-unihub-coral to-[#de3047]",
            icon: Award,
            accent: "text-unihub-yellow"
        }
    ];

    const slides = role === 'organization' ? orgSlides : studentSlides;

    useEffect(() => {
        const timer = setInterval(() => setCurrent(prev => (prev + 1) % slides.length), 7000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <section className="relative rounded-[32px] overflow-hidden h-[440px] lg:h-[500px] shadow-2xl transition-all duration-700 mt-2 group glass">
            {slides.map((slide, i) => {
                const Icon = slide.icon;
                return (
                    <div
                        key={i}
                        className={`absolute inset-0 ${slide.bg} transition-all duration-1000 flex items-center justify-start px-8 md:px-20 ${i === current ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105 pointer-events-none'}`}
                    >
                        {/* Background glowing rings/blobs */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                             <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-white opacity-10 blur-[120px] rounded-full mix-blend-overlay animate-pulse"></div>
                             <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white opacity-5 blur-[100px] rounded-full"></div>
                        </div>

                        <div className={`max-w-2xl space-y-8 relative z-10 transition-all duration-[1200ms] delay-100 ${i === current ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[11px] font-bold text-white uppercase tracking-[0.2em] shadow-xl">
                                <TrendingUp className="w-4 h-4 text-unihub-yellow" /> System Active
                            </div>
                            
                            <h2 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tighter drop-shadow-2xl font-display">
                                {slide.title.split(' ')[0]} <span className={slide.accent}>{slide.title.split(' ').slice(1).join(' ')}</span>
                            </h2>
                            
                            <p className="text-white/90 text-sm md:text-xl font-medium max-w-lg border-l-4 border-white/20 pl-6 drop-shadow-md italic">
                                {slide.subtitle}
                            </p>
                            
                            <div className="pt-6">
                                <Link to={slide.to} className="btn-glass px-12 py-5 rounded-[24px] font-bold text-[12px] tracking-[0.2em] shadow-2xl hover:bg-white/80 transition-all duration-300 inline-flex items-center group/btn active:scale-95 border border-white/40 font-display">
                                    {slide.btn.toUpperCase()}
                                    <ChevronRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-2 transition-transform" />
                                </Link>
                            </div>
                        </div>
                        
                        {/* High-Fidelity Icon Background */}
                        <div className={`absolute right-[-5%] top-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none hidden lg:block transition-all duration-[4000ms] ease-out ${i === current ? 'scale-110 rotate-[-15deg]' : 'scale-75 rotate-0'}`}>
                            <Icon className="w-[650px] h-[650px] text-white" strokeWidth={0.5} />
                        </div>
                    </div>
                );
            })}

            {/* Pagination Controls */}
            <div className="absolute bottom-10 left-8 md:left-20 z-20 flex items-center gap-2.5">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`h-2 rounded-full transition-all duration-500 shadow-lg ${i === current ? 'w-16 bg-white' : 'w-5 bg-white/20 hover:bg-white/40'}`}
                    />
                ))}
            </div>
            
            <div className="absolute bottom-8 right-8 md:right-20 z-20 flex items-center gap-4">
                <button onClick={() => setCurrent(prev => (prev - 1 + slides.length) % slides.length)} className="w-14 h-14 rounded-[24px] bg-white/10 hover:bg-white/25 backdrop-blur-2xl text-white flex items-center justify-center transition-all border border-white/20 shadow-2xl active:scale-90 group">
                    <ChevronLeft className="w-7 h-7 group-hover:-translate-x-1 transition-transform" />
                </button>
                <button onClick={() => setCurrent(prev => (prev + 1) % slides.length)} className="w-14 h-14 rounded-[24px] bg-white/10 hover:bg-white/25 backdrop-blur-2xl text-white flex items-center justify-center transition-all border border-white/20 shadow-2xl active:scale-90 group">
                    <ChevronRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </section>
    );
};

const StatCard = ({ icon: Icon, label, value, color, loading }) => (
    <div className="glass-card p-6 flex items-center gap-5 group hover:border-unihub-teal/40 transition-all duration-300 cursor-default">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} transition-all group-hover:scale-110 shadow-sm`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="uni-label mb-1.5">{label}</p>
            {loading ? (
                <div className="h-8 w-16 bg-black/5 rounded-lg animate-pulse"></div>
            ) : (
                <p className="text-3xl font-bold text-unihub-text leading-none group-hover:text-primary transition-colors font-display tracking-tight">{value ?? '0'}</p>
            )}
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentApps, setRecentApps] = useState([]);

    const token = JSON.parse(localStorage.getItem('user'))?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (user?.role === 'student') {
                    const [appsRes, internRes] = await Promise.allSettled([
                        axios.get('http://localhost:5000/api/internships/my-applications', config),
                        axios.get('http://localhost:5000/api/internships', config),
                    ]);
                    const apps = appsRes.status === 'fulfilled' ? appsRes.value.data : [];
                    const interns = internRes.status === 'fulfilled' ? internRes.value.data : [];
                    setStats({
                        total: apps.length,
                        accepted: apps.filter(a => a.status === 'accepted' || a.status === 'shortlisted').length,
                        activeJobs: interns.length,
                        pending: apps.filter(a => a.status === 'pending').length
                    });
                    setRecentApps(apps.slice(0, 4));
                } else if (user?.role === 'organization') {
                    const res = await axios.get('http://localhost:5000/api/internships/org/dashboard', config);
                    const totals = res.data.reduce((acc, j) => ({
                        postings: acc.postings + 1,
                        totalApps: acc.totalApps + (j.totalApplicants || 0)
                    }), { postings: 0, totalApps: 0 });
                    setStats(totals);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchDashboardData();
    }, [user]);

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-16">
            {/* Minimal Hero Slideshow */}
            <HeroSlideshow role={user?.role} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Modules Grid */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center gap-4 px-1">
                        <div className="w-2 h-8 bg-unihub-teal rounded-full shadow-[0_0_15px_rgba(20,184,166,0.4)]"></div>
                        <h2 className="text-3xl font-black text-unihub-text tracking-tight uppercase font-display">System Modules</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {MODULES.filter(mod => !mod.roles || mod.roles.includes(user?.role)).map(mod => {
                            const Icon = mod.icon;
                            return (
                                <Link key={mod.id} to={mod.to} className="uni-card relative p-6 overflow-hidden group flex flex-col justify-between min-h-[170px] hover:border-unihub-teal/50 active:scale-[0.98]">
                                    <div className="flex items-start justify-between relative z-10">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${mod.color} transition-all group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="w-9 h-9 rounded-xl bg-white/40 flex items-center justify-center group-hover:bg-unihub-teal group-hover:text-white transition-all duration-300 shadow-sm border border-white/50">
                                            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                                        </div>
                                    </div>
                                    <div className="mt-5 relative z-10">
                                        <h3 className="font-bold text-unihub-text text-lg font-display tracking-tight group-hover:text-unihub-teal transition-colors">{mod.title}</h3>
                                        <p className="text-sm text-unihub-textMuted line-clamp-2 mt-1 leading-relaxed font-medium">{mod.desc}</p>
                                    </div>

                                    {/* Subtle hover background highlight */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-unihub-teal/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-unihub-teal/10 transition-colors" />
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Activity Log & Support */}
                <div className="space-y-6">
                    <div className="glass-card p-8 space-y-6 h-fit border border-white/40 shadow-xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-unihub-text flex items-center gap-2.5 font-display uppercase tracking-wider">
                                <Clock className="w-5 h-5 text-unihub-teal" /> Activity Log
                            </h2>
                            <Link to="/my-applications" className="text-xs font-bold text-unihub-teal hover:underline underline-offset-4 tracking-wide font-display">HISTORY</Link>
                        </div>

                        {recentApps.length > 0 ? (
                            <div className="space-y-4">
                                {recentApps.map(app => (
                                    <div key={app._id} className="flex flex-col gap-2 border-b border-black/5 pb-4 last:border-0 last:pb-0 group">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold text-unihub-textMuted uppercase tracking-widest">{app.internshipId?.company}</p>
                                            <span className={`badge ${
                                                app.status === 'accepted' ? 'badge-teal' :
                                                app.status === 'shortlisted' ? 'badge-coral' :
                                                'badge-amber'
                                            }`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <p className="text-base font-semibold text-unihub-text truncate group-hover:text-unihub-teal transition-colors cursor-pointer font-display leading-tight">{app.internshipId?.title}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center space-y-4">
                                <div className="w-16 h-16 bg-black/5 rounded-3xl flex items-center justify-center mx-auto border border-black/5">
                                    <Clock className="w-7 h-7 text-slate-300" />
                                </div>
                                <p className="text-sm font-medium text-unihub-textMuted">No Recent Records</p>
                            </div>
                        )}

                        <button onClick={() => window.location.reload()} disabled={loading} className="btn btn-secondary w-full py-4 text-[13px] tracking-widest font-black uppercase shadow-lg active:scale-95 disabled:opacity-50">
                            {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div> : <RefreshCcw className="w-4 h-4" />}
                            {loading ? 'Syncing...' : 'Sync Database'}
                        </button>
                    </div>

                    <div className="glass-card p-8 space-y-5 border-l-4 border-l-unihub-teal shadow-xl relative overflow-hidden group">
                        <div className="w-12 h-12 rounded-2xl bg-unihub-teal/10 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Heart className="w-6 h-6 text-unihub-teal" />
                        </div>
                        <div className="space-y-2 relative z-10">
                            <h2 className="text-lg font-bold text-unihub-text font-display">Nexus Support</h2>
                            <p className="text-sm text-unihub-textMuted leading-relaxed font-medium">
                                Get technical assistance with core modules. Connect with our campus architect directly.
                            </p>
                        </div>
                        <button className="btn btn-primary w-full py-3.5 text-[12px] tracking-[0.2em] font-black uppercase group-hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all">
                            Visit Support
                        </button>

                        {/* Background decor */}
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-unihub-teal/5 rounded-full blur-2xl group-hover:bg-unihub-teal/10 transition-colors" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
