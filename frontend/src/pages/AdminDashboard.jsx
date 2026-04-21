import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
    MapPin, Search, ChevronRight, LayoutDashboard, Database, 
    Activity, ShieldCheck, Settings, LogOut, Users, 
    Bell, CheckCircle2, AlertTriangle, TrendingUp, Cpu,
    History, Globe, Zap, Server
} from 'lucide-react';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const STATS = [
        { label: 'Network Uptime', value: '99.98%', icon: Activity, color: 'text-emerald-500' },
        { label: 'Active Users', value: '1,284', icon: Users, color: 'text-unihub-teal' },
        { label: 'Open Reports', value: '14', icon: AlertTriangle, color: 'text-unihub-yellow' },
        { label: 'Resource Load', value: '72%', icon: Cpu, color: 'text-indigo-500' }
    ];

    const AUDIT_LOGS = [
        { id: 1, action: 'Facility Locked', target: 'Lab 04', time: '2 mins ago', status: 'Success' },
        { id: 2, action: 'User Elevated', target: 'John Doe', time: '14 mins ago', status: 'Success' },
        { id: 3, action: 'Backup Initiated', target: 'DB Cluster A', time: '1 hour ago', status: 'Active' },
        { id: 4, action: 'Policy Updated', target: 'Exam Security', time: '3 hours ago', status: 'Success' }
    ];

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc]">
                 <div className="glass-card p-12 text-center max-w-md border-unihub-coral/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-unihub-coral/5 to-transparent opacity-50" />
                    <div className="w-24 h-24 bg-unihub-coral/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-unihub-coral/20 group-hover:scale-110 transition-transform duration-700">
                        <ShieldCheck className="w-12 h-12 text-unihub-coral animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black text-unihub-text font-display uppercase tracking-tighter mb-4">Tactical Lockout</h2>
                    <p className="text-unihub-textMuted font-medium leading-relaxed italic mb-8 px-4 opacity-80 text-sm">Your biometric signature does not match the Admin Registry.</p>
                    <button onClick={() => window.location.href = '/dashboard'} className="btn btn-primary w-full py-5 text-[11px] tracking-[0.25em] font-black uppercase shadow-xl active:scale-95">Relinquish Access</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] text-unihub-text font-sans">
            {/* Dynamic Background Decor */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-unihub-teal/5 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-unihub-coral/5 blur-[150px] rounded-full animate-pulse shadow-2xl" style={{ animationDelay: '2s' }} />
            </div>

            {/* Premium Header */}
            <header className="bg-white/70 backdrop-blur-3xl border-b border-black/5 sticky top-0 z-[60] shadow-sm">
                <div className="max-w-[1600px] mx-auto px-8 h-28 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="relative group cursor-pointer">
                            <div className="absolute -inset-1 bg-gradient-to-r from-unihub-teal to-unihub-coral rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative w-16 h-16 bg-white flex items-center justify-center rounded-2xl shadow-xl transition-all duration-500 border border-black/5 group-hover:rotate-6">
                                <ShieldCheck className="w-10 h-10 text-unihub-teal" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black tracking-tight uppercase font-display leading-none">Command <span className="text-unihub-teal">Nexus</span></h1>
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 border border-black/5 text-[9px] font-black uppercase tracking-widest text-unihub-textMuted shadow-inner">
                                    <Zap className="w-3 h-3 text-unihub-yellow" /> LIVE
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-unihub-textMuted uppercase tracking-[0.3em] mt-2 opacity-60">System Overlord Terminal • {currentTime.toLocaleTimeString()}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="hidden lg:flex flex-col items-end border-r border-black/5 pr-8">
                            <span className="text-sm font-black uppercase tracking-widest text-unihub-text leading-none">{user.name}</span>
                            <span className="text-[10px] font-black text-unihub-teal uppercase tracking-widest leading-none mt-2">Principal Architect</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="w-12 h-12 rounded-2xl bg-white border border-black/5 shadow-sm flex items-center justify-center hover:bg-unihub-teal/5 transition-all group relative">
                                <Bell className="w-5 h-5 text-unihub-textMuted group-hover:text-unihub-teal transition-colors" />
                                <span className="absolute top-3 right-3 w-2 h-2 bg-unihub-coral rounded-full border border-white"></span>
                            </button>
                            <button onClick={logout} className="h-12 px-6 rounded-2xl bg-unihub-text text-white hover:bg-unihub-coral flex items-center gap-3 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 group">
                                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto p-10 grid grid-cols-12 gap-10">
                {/* Left Column: Stats & Core Status (4 Cols) */}
                <div className="col-span-12 lg:col-span-4 space-y-10">
                    <div className="grid grid-cols-2 gap-5">
                        {STATS.map(stat => (
                            <div key={stat.label} className="glass-card p-6 border-white/40 shadow-xl group hover:border-unihub-teal/30 transition-all duration-500">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[8px] font-black text-emerald-500 tracking-widest">+Sync</span>
                                </div>
                                <h4 className="text-2xl font-black text-unihub-text font-display leading-none mb-1">{stat.value}</h4>
                                <p className="text-[9px] font-bold text-unihub-textMuted uppercase tracking-widest opacity-60">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Integrated System Health Widget */}
                    <div className="glass-card p-8 border-unihub-teal/20 relative overflow-hidden group">
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-unihub-teal/10 rounded-2xl flex items-center justify-center text-unihub-teal ring-4 ring-unihub-teal/5">
                                    <Cpu className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-base font-black text-unihub-text uppercase tracking-tight leading-none mb-1">Nexus Core</h4>
                                    <p className="text-[9px] font-bold text-unihub-teal uppercase tracking-widest">Running Nominal</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-unihub-textMuted">
                                        <span>Sync Status</span>
                                        <span>Synchronized</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-unihub-teal w-[94%] animate-shimmer" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-unihub-textMuted">
                                        <span>Security protocols</span>
                                        <span>v9.1 Encrypted</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-unihub-coral w-[100%]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-unihub-teal/5 rounded-full blur-3xl group-hover:bg-unihub-teal/10 transition-colors" />
                    </div>

                    <div className="glass-card p-8 border-black/5 bg-unihub-text shadow-2xl relative overflow-hidden">
                         <div className="relative z-10 space-y-4">
                             <div className="flex items-center gap-3">
                                <Server className="w-6 h-6 text-unihub-teal" />
                                <h4 className="text-sm font-black text-white uppercase tracking-widest">Cluster Status</h4>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                 <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                     <p className="text-[8px] font-black text-white/40 uppercase mb-1">Node A</p>
                                     <div className="flex items-center gap-2">
                                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                         <span className="text-[10px] font-bold text-white">Online</span>
                                     </div>
                                 </div>
                                 <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                     <p className="text-[8px] font-black text-white/40 uppercase mb-1">Node B</p>
                                     <div className="flex items-center gap-2">
                                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                         <span className="text-[10px] font-bold text-white">Online</span>
                                     </div>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Right Column: High-Level System Overview (8 Cols) */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                    {/* Live Telemetry Bar */}
                    <div className="glass-card px-8 py-5 flex items-center justify-between border-white/40 shadow-lg">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-unihub-teal rounded-full animate-pulse shadow-[0_0_10px_rgba(20,184,166,0.6)]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-unihub-text">Strategic Datastream</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-widest">Protocol: <span className="text-unihub-text">NX-2048</span></p>
                            <span className="w-px h-4 bg-black/5" />
                            <div className="flex items-center gap-1.5">
                                <Globe className="w-3.5 h-3.5 text-unihub-teal" />
                                <span className="text-[10px] font-black text-unihub-text uppercase tracking-widest leading-none">Global Reach</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Audit Feed */}
                        <div className="uni-card p-8 border-white/40 shadow-xl min-h-[500px] flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-black text-unihub-text uppercase tracking-tight flex items-center gap-3 font-display">
                                    <History className="w-5 h-5 text-unihub-teal" /> Action Audit
                                </h3>
                                <button className="text-[10px] font-black text-unihub-teal border-b border-unihub-teal hover:text-unihub-text hover:border-unihub-text transition-all tracking-widest uppercase">VIEW LOGS</button>
                            </div>
                            <div className="space-y-6 flex-1">
                                {AUDIT_LOGS.map(log => (
                                    <div key={log.id} className="flex items-start gap-4 p-4 rounded-2xl bg-black/5 border border-transparent hover:border-unihub-teal/20 transition-all group">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-unihub-teal shadow-sm group-hover:scale-110 transition-transform">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="text-sm font-bold text-unihub-text font-display">{log.action}</h4>
                                                <span className="text-[9px] font-black text-emerald-500 uppercase">{log.status}</span>
                                            </div>
                                            <p className="text-xs text-unihub-textMuted font-medium italic opacity-70">Target: {log.target}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{log.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Operational Trends */}
                        <div className="uni-card p-8 border-white/40 shadow-xl min-h-[500px]">
                            <h3 className="text-lg font-black text-unihub-text uppercase tracking-tight flex items-center gap-3 font-display mb-8">
                                <TrendingUp className="w-5 h-5 text-unihub-coral" /> Traffic Matrix
                            </h3>
                            <div className="space-y-8">
                                <div className="p-6 rounded-[24px] bg-gradient-to-br from-unihub-teal to-[#10b981] text-white shadow-xl relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Traffic Peak</p>
                                        <h4 className="text-3xl font-black font-display">12:30 PM</h4>
                                        <div className="flex items-center gap-2 mt-4 text-[10px] font-bold bg-white/20 w-fit px-3 py-1 rounded-full border border-white/20">
                                            <Globe className="w-3 h-3" /> Highest Engagement Room
                                        </div>
                                    </div>
                                    <Activity className="absolute -right-6 top-1/2 -translate-y-1/2 w-32 h-32 opacity-20 transform scale-150 rotate-12 transition-transform group-hover:scale-[1.8]" />
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <p className="text-xs font-black text-unihub-text uppercase tracking-widest font-display">System Integrity</p>
                                        <span className="text-xs font-bold text-unihub-teal">100%</span>
                                    </div>
                                    <div className="grid grid-cols-7 gap-3 h-32 items-end px-2">
                                        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                            <div key={i} className="group relative h-full flex flex-col justify-end">
                                                <div className="bg-unihub-teal/20 rounded-full w-full absolute bottom-0 h-full -z-10 group-hover:bg-unihub-teal/30 transition-colors" />
                                                <div 
                                                    className="bg-unihub-teal rounded-full w-full transition-all duration-1000 delay-300 shadow-[0_0_15px_rgba(20,184,166,0.2)] group-hover:shadow-unihub-teal/40" 
                                                    style={{ height: `${h}%` }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between px-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                        <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-10 border-white/40 shadow-2xl relative overflow-hidden group">
                         <div className="absolute inset-0 bg-gradient-to-r from-unihub-teal/5 to-transparent pointer-events-none" />
                         <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                             <div className="flex items-center gap-6">
                                 <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-unihub-teal group-hover:rotate-6 transition-transform">
                                     <ShieldCheck className="w-10 h-10" />
                                 </div>
                                 <div className="space-y-2">
                                     <h3 className="text-2xl font-black text-unihub-text font-display uppercase tracking-tight">Security Hardening</h3>
                                     <p className="text-sm font-medium text-unihub-textMuted max-w-md opacity-80">All active session tokens are being rotated every 24 hours. Advanced encryption standards are active for entire data cluster.</p>
                                 </div>
                             </div>
                             <button className="btn btn-primary px-10 py-5 text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-unihub-teal/40 transition-all active:scale-95 whitespace-nowrap">INITIATE AUDIT</button>
                         </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
