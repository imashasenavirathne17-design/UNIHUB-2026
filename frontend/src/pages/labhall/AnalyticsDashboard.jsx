import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {
    BarChart2, AlertTriangle, CheckCircle, Wrench,
    BookOpen, Users, Activity, TrendingUp, XCircle, AlertOctagon
} from 'lucide-react';

const API = 'http://localhost:5000/api/labhall';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const StatCard = ({ icon: Icon, label, value, sub, color, bg }) => (
    <div className={`glass-card rounded-2xl p-5 flex items-center gap-4 group hover:border-unihub-teal/30 transition-all cursor-default`}>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200`}>
            <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
            <p className="uni-label mb-0.5">{label}</p>
            <p className="text-2xl font-bold text-unihub-text leading-tight group-hover:text-unihub-teal transition-colors">{value ?? '—'}</p>
            {sub && <p className="text-xs text-unihub-textMuted mt-0.5">{sub}</p>}
        </div>
    </div>
);


const AnalyticsDashboard = () => {
    const { user } = useContext(AuthContext);
    const [bookingStats, setBookingStats] = useState(null);
    const [roomStats, setRoomStats] = useState(null);
    const [issueStats, setIssueStats] = useState(null);
    const [issues, setIssues] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingRoom, setUpdatingRoom] = useState(null);

    const headers = { Authorization: `Bearer ${user.token}` };

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [bStats, rStats, iStats, issuesRes, roomsRes] = await Promise.all([
                axios.get(`${API}/bookings/stats`, { headers }),
                axios.get(`${API}/rooms/stats`, { headers }),
                axios.get(`${API}/issues/stats`, { headers }),
                axios.get(`${API}/issues`, { headers }),
                axios.get(`${API}/rooms`, { headers }),
            ]);
            setBookingStats(bStats.data);
            setRoomStats(rStats.data);
            setIssueStats(iStats.data);
            setIssues(issuesRes.data);
            setRooms(roomsRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const toggleMaintenance = async (room) => {
        setUpdatingRoom(room._id);
        const newStatus = room.status === 'maintenance' ? 'available' : 'maintenance';
        try {
            await axios.put(`${API}/rooms/${room._id}`, { status: newStatus }, { headers });
            setRooms(prev => prev.map(r => r._id === room._id ? { ...r, status: newStatus } : r));
        } catch (e) {
            console.error(e);
        } finally {
            setUpdatingRoom(null);
        }
    };

    const resolveIssue = async (id) => {
        try {
            await axios.put(`${API}/issues/${id}`, { status: 'resolved' }, { headers });
            setIssues(prev => prev.map(i => i._id === id ? { ...i, status: 'resolved' } : i));
        } catch (e) {
            console.error(e);
        }
    };

    const priorityColor = (p) => ({
        critical: 'bg-red-100 text-red-600 border-red-200',
        high: 'bg-orange-100 text-orange-600 border-orange-200',
        medium: 'bg-yellow-100 text-yellow-600 border-yellow-200',
        low: 'bg-green-100 text-green-600 border-green-200',
    }[p] || 'bg-gray-100 text-gray-500');

    // Build bar chart data from bookingStats.byDay
    const dayData = DAYS.map((d, i) => {
        const found = bookingStats?.byDay?.find(b => b._id === i + 1);
        return { day: d, count: found?.count || 0 };
    });
    const maxDayCount = Math.max(...dayData.map(d => d.count), 1);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="uni-spinner" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-16">
            {/* Hero Header */}
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl bg-gradient-to-br from-unihub-teal to-[#0d857a]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-white opacity-10 blur-[120px] rounded-full mix-blend-overlay animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white opacity-5 blur-[100px] rounded-full" />
                    <BarChart2 className="absolute -right-16 -top-16 w-80 h-80 text-white opacity-10 rotate-12" strokeWidth={0.5} />
                </div>
                <div className="px-8 md:px-16 py-14 md:py-20 relative z-10">
                    <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[11px] font-bold text-white uppercase tracking-[0.2em] shadow-xl mb-4">
                        <Activity className="w-4 h-4 text-unihub-yellow" /> Facility Intelligence Hub
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tighter font-display">
                        Analytics & <span className="text-unihub-yellow">Control</span>.
                    </h1>
                    <p className="text-white/80 font-medium text-base max-w-xl leading-relaxed mt-4">
                        Occupancy insights, maintenance management, and real-time issue resolution across all campus facilities.
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={BookOpen} label="Total Bookings" value={bookingStats?.total} sub={`${bookingStats?.confirmed} confirmed`} color="bg-unihub-teal" bg="bg-unihub-teal-light" />
                <StatCard icon={XCircle} label="Cancelled" value={bookingStats?.cancelled} sub="booking cancellations" color="bg-unihub-coral" bg="bg-unihub-coral/10" />
                <StatCard icon={Wrench} label="Under Maintenance" value={roomStats?.maintenance} sub={`of ${roomStats?.total} rooms`} color="bg-amber-500" bg="bg-amber-50" />
                <StatCard icon={AlertOctagon} label="Open Issues" value={issueStats?.open} sub={`${issueStats?.critical} critical`} color="bg-rose-500" bg="bg-rose-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Bookings by Day Chart */}
                <div className="lg:col-span-2 glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <TrendingUp className="w-4 h-4 text-unihub-teal" />
                        <h2 className="text-base font-semibold text-unihub-text">Bookings by Day</h2>
                    </div>
                    <div className="flex items-end gap-2 h-36">
                        {dayData.map(({ day, count }) => (
                            <div key={day} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-[10px] font-semibold text-unihub-textMuted">{count}</span>
                                <div
                                    className="w-full bg-unihub-teal rounded-t-lg transition-all duration-700 hover:bg-unihub-tealHover"
                                    style={{ height: `${(count / maxDayCount) * 100}%`, minHeight: count ? '6px' : '3px' }}
                                />
                                <span className="text-[10px] font-semibold text-unihub-textMuted">{day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Room Type Breakdown */}
                <div className="lg:col-span-1 glass-card rounded-2xl p-6 flex flex-col justify-center gap-5">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-unihub-teal" />
                        <h2 className="text-base font-semibold text-unihub-text">Room Split</h2>
                    </div>
                    <div className="space-y-3.5">
                        <div>
                            <div className="flex justify-between text-xs font-semibold text-unihub-textMuted mb-1">
                                <span>Halls</span><span>{roomStats?.halls}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-unihub-teal rounded-full transition-all" style={{ width: `${(roomStats?.halls / roomStats?.total) * 100}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-semibold text-unihub-textMuted mb-1">
                                <span>Labs</span><span>{roomStats?.labs}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-unihub-coral rounded-full transition-all" style={{ width: `${(roomStats?.labs / roomStats?.total) * 100}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-semibold text-unihub-textMuted mb-1">
                                <span>Maintenance</span><span>{roomStats?.maintenance}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${(roomStats?.maintenance / roomStats?.total) * 100}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Issue Stats */}
                <div className="lg:col-span-2 glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <h2 className="text-base font-semibold text-unihub-text">Issue Summary</h2>
                    </div>
                    <div className="space-y-3">
                        {[
                            { label: 'Total Reported', value: issueStats?.total, color: 'text-unihub-text' },
                            { label: 'Still Open', value: issueStats?.open, color: 'text-unihub-coral' },
                            { label: 'Critical Issues', value: issueStats?.critical, color: 'text-rose-700' },
                        ].map(s => (
                            <div key={s.label} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                                <span className="text-sm font-medium text-unihub-textMuted">{s.label}</span>
                                <span className={`text-xl font-bold ${s.color}`}>{s.value ?? 0}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Maintenance Control Panel */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                    <Wrench className="w-4 h-4 text-amber-500" />
                    <h2 className="text-base font-semibold text-unihub-text">Room Maintenance Control</h2>
                    <span className="ml-auto badge badge-gray">
                        {rooms.filter(r => r.status === 'maintenance').length} locked
                    </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {rooms.map(room => (
                        <button
                            key={room._id}
                            onClick={() => toggleMaintenance(room)}
                            disabled={updatingRoom === room._id}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 font-semibold text-sm transition-all active:scale-95 disabled:opacity-60 ${
                                room.status === 'maintenance'
                                    ? 'border-amber-300 bg-amber-50 text-amber-700 shadow-amber-100 shadow-md'
                                    : 'border-gray-100 bg-gray-50 text-unihub-textMuted hover:border-unihub-teal/30 hover:bg-unihub-teal-light hover:text-unihub-teal'
                            }`}
                        >
                            <span className="text-base">{room.status === 'maintenance' ? '🔒' : '✅'}</span>
                            <span className="text-xs font-medium text-center leading-tight">{room.name}</span>
                            <span className={`badge ${
                                room.status === 'maintenance' ? 'badge-amber' : 'badge-emerald'
                            }`}>
                                {room.status === 'maintenance' ? 'Locked' : 'Open'}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Issue Management Panel */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                    <AlertTriangle className="w-4 h-4 text-unihub-coral" />
                    <h2 className="text-base font-semibold text-unihub-text">Reported Issues</h2>
                    <span className="ml-auto badge badge-coral">
                        {issues.filter(i => i.status === 'open').length} open
                    </span>
                </div>

                {issues.length === 0 ? (
                    <div className="text-center py-10 text-unihub-textMuted">
                        <CheckCircle className="w-10 h-10 mx-auto mb-3 text-unihub-teal/30" />
                        <p className="text-sm font-medium">No issues reported. All systems running smoothly!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {issues.map(issue => (
                            <div key={issue._id}
                                className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${
                                    issue.status === 'resolved'
                                        ? 'opacity-50 bg-gray-50 border-gray-100'
                                        : 'bg-white border-unihub-border hover:border-unihub-teal/30 shadow-soft'
                                }`}>
                                <span className={`badge flex-shrink-0 ${priorityColor(issue.priority)}`}>
                                    {issue.priority}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-unihub-text text-sm">{issue.roomId?.name || 'Unknown Room'}</p>
                                    <p className="text-xs text-unihub-textMuted truncate mt-0.5">{issue.description}</p>
                                    <p className="text-[10px] text-unihub-textMuted/60 mt-1">By: {issue.reportedBy?.name} · {new Date(issue.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className={`badge ${
                                        issue.status === 'open' ? 'badge-coral' :
                                        issue.status === 'in_progress' ? 'badge-indigo' :
                                        'badge-emerald'
                                    }`}>
                                        {issue.status.replace('_', ' ')}
                                    </span>
                                    {issue.status !== 'resolved' && (
                                        <button onClick={() => resolveIssue(issue._id)}
                                            className="btn btn-icon btn-secondary hover:bg-emerald-50 hover:text-emerald-600">
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
