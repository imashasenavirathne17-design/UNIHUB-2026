import { useState, useEffect, useContext } from 'react';
import { eventService, analyticsService, eventRequestService } from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import AnalyticsCharts from '../../components/admin/AnalyticsCharts';
import Swal from 'sweetalert2';
import { LayoutDashboard, Users, Calendar, CheckCircle, BarChart2, Briefcase, MessageSquare, Send, Lightbulb, X, TrendingUp, Target, PieChart as PieChartIcon, Award, Zap } from 'lucide-react';
import '../../components/events/Events.css';

const OrganizerAnalyticsDashboard = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [registrants, setRegistrants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(false);
    const [broadcastMsg, setBroadcastMsg] = useState("");
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [overallAnalytics, setOverallAnalytics] = useState(null);
    const [viewMode, setViewMode] = useState('overall'); // 'overall' or 'drilldown'
    const [requests, setRequests] = useState([]);
    const [showRequestsModal, setShowRequestsModal] = useState(false);

    useEffect(() => {
        const initData = async () => {
            setLoading(true);
            await Promise.all([
                fetchMyEvents(),
                fetchRequests(),
                fetchOverallAnalytics()
            ]);
            setLoading(false);
        };
        initData();
    }, []);

    const fetchOverallAnalytics = async () => {
        try {
            const { data } = await analyticsService.getOrganizerAnalytics();
            setOverallAnalytics(data);
        } catch (error) {
            console.error("Failed to fetch overall analytics", error);
        }
    };

    const fetchRequests = async () => {
        try {
            const { data } = await eventRequestService.getRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch event requests", error);
        }
    };

    const fetchMyEvents = async () => {
        try {
            const { data } = await eventService.getAllEvents();
            const myFilteredEvents = user?.role === 'admin' 
                ? data 
                : data.filter(e => (e.organizer?._id || e.organizer) === user?._id);
            setEvents(myFilteredEvents);
        } catch (error) {
            Swal.fire('Error', 'Failed to fetch your events for analytics', 'error');
        }
    };

    const handleSelectEvent = async (event) => {
        setSelectedEvent(event);
        setViewMode('drilldown');
        setStatsLoading(true);
        try {
            const [analyticsRes, registrantsRes] = await Promise.all([
                analyticsService.getEventAnalytics(event._id),
                eventService.getEventRegistrants(event._id)
            ]);
            setAnalytics(analyticsRes.data);
            setRegistrants(registrantsRes.data);
        } catch (error) {
            Swal.fire('Error', 'Failed to load event analytics & attendance data', 'error');
        } finally {
            setStatsLoading(false);
        }
    };

    const handleToggleAttendance = async (userId, currentStatus) => {
        if (!selectedEvent) return;
        try {
            await eventService.toggleAttendance(selectedEvent._id, userId, !currentStatus);
            setRegistrants(prev => prev.map(reg => 
                reg.user._id === userId ? { ...reg, attended: !currentStatus } : reg
            ));
            
            // Re-fetch analytics to update pie charts smoothly
            const analyticsRes = await analyticsService.getEventAnalytics(selectedEvent._id);
            setAnalytics(analyticsRes.data);
        } catch (error) {
            Swal.fire('Error', 'Failed to record attendance', 'error');
        }
    };

    const handleBroadcastMessage = async () => {
        if (!broadcastMsg.trim()) return;
        setIsBroadcasting(true);
        try {
            const { data } = await eventService.broadcastMessage(selectedEvent._id, { 
                message: broadcastMsg,
                type: "Admin" 
            });
            Swal.fire('Broadcast Sent', data.message, 'success');
            setBroadcastMsg("");
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to send broadcast', 'error');
        } finally {
            setIsBroadcasting(false);
        }
    };

    const handleApproveRequest = async (request) => {
        try {
            await eventRequestService.updateRequestStatus(request._id, 'Approved');
            setRequests(prev => prev.filter(r => r._id !== request._id));
            Swal.fire('Approved!', 'The request has been marked as approved. You can launch it from the Event Management page.', 'success');
            if (requests.length === 1) setShowRequestsModal(false);
        } catch (error) {
            Swal.fire('Error', 'Failed to approve request', 'error');
        }
    };

    const handleRejectRequest = async (id) => {
        try {
            await eventRequestService.updateRequestStatus(id, 'Rejected');
            setRequests(prev => prev.filter(r => r._id !== id));
            Swal.fire('Rejected', 'The request has been dismissed.', 'info');
            if (requests.length === 1) setShowRequestsModal(false);
        } catch (error) {
            Swal.fire('Error', 'Failed to reject request', 'error');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-16 h-16 border-4 border-unihub-teal/20 border-t-unihub-teal rounded-full animate-spin shadow-inner" />
            <p className="text-xs font-black text-unihub-textMuted uppercase tracking-widest animate-pulse font-display">Compiling Analytics Node...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-16">
            {/* Hero Header */}
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl mt-4 bg-gradient-to-br from-unihub-teal to-[#0d857a] group">
                <div className="absolute inset-0 overflow-hidden pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-white opacity-10 blur-[120px] rounded-full mix-blend-overlay animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white opacity-5 blur-[100px] rounded-full" />
                    <BarChart2 className="absolute -right-16 -top-16 w-80 h-80 text-white opacity-10 rotate-12" strokeWidth={0.5} />
                </div>

                <div className="px-8 md:px-16 py-14 md:py-20 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div className="max-w-2xl space-y-6">
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[11px] font-bold text-white uppercase tracking-[0.2em] shadow-xl mx-auto md:mx-0">
                            <BarChart2 className="w-4 h-4 text-unihub-yellow" /> Organizer Operations
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-normal font-display">
                            Event <span className="text-unihub-yellow">Analytics</span> Dashboard.
                        </h1>
                        <p className="text-white/90 font-medium text-base md:text-lg max-w-xl leading-relaxed italic opacity-80 mx-auto md:mx-0">
                            Monitor Registration Health, Oversee Participant Attendance, and Secure Meaningful Engagement Metrics.
                        </p>
                    </div>
                    {requests.length > 0 && (
                        <div className="flex-shrink-0 mt-6 md:mt-0">
                            <button
                                onClick={() => setShowRequestsModal(true)}
                                className="inline-flex items-center justify-center gap-3 bg-unihub-yellow text-unihub-text px-8 py-4 rounded-2xl font-black text-sm tracking-normal shadow-xl hover:bg-yellow-400 transition-all active:scale-95 animate-bounce shadow-[0_0_30px_rgba(255,214,10,0.4)]"
                            >
                                <Lightbulb className="w-6 h-6 animate-pulse" /> 
                                Review Ideas ({requests.length})
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 px-1">
                {/* Left Side: Navigation & Event List */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-unihub-border shadow-soft space-y-2">
                        <button 
                            onClick={() => setViewMode('overall')}
                            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${
                                viewMode === 'overall' 
                                ? 'bg-unihub-teal text-white shadow-lg shadow-unihub-teal/20' 
                                : 'text-unihub-textMuted hover:bg-gray-50'
                            }`}
                        >
                            <LayoutDashboard className="w-4 h-4" /> Overall Performance
                        </button>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.2em] px-4">Event Drill-down</h2>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto no-scrollbar pb-6 px-1">
                            {events.length === 0 ? (
                                <div className="bg-gray-50 border border-unihub-border rounded-2xl p-6 text-center opacity-50">
                                    <p className="text-[10px] font-bold uppercase">No records</p>
                                </div>
                            ) : (
                                events.map(event => (
                                    <button
                                        key={event._id}
                                        onClick={() => handleSelectEvent(event)}
                                        className={`w-full text-left p-4 rounded-[20px] border transition-all duration-300 group ${
                                            selectedEvent?._id === event._id && viewMode === 'drilldown'
                                            ? 'bg-unihub-teal/5 border-unihub-teal text-unihub-teal shadow-md translate-x-2' 
                                            : 'bg-white border-unihub-border text-unihub-text hover:border-unihub-teal/30 hover:bg-gray-50'
                                        }`}
                                    >
                                        <h4 className="text-[11px] font-black uppercase leading-tight line-clamp-2">{event.title}</h4>
                                        <div className="flex items-center justify-between mt-3">
                                            <p className="text-[8px] font-bold uppercase opacity-60 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString()}
                                            </p>
                                            <Zap className={`w-3 h-3 transition-opacity ${selectedEvent?._id === event._id && viewMode === 'drilldown' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Dynamic Content View */}
                <div className="lg:col-span-3">
                    {viewMode === 'overall' ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Overall Metrics Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-unihub-text tracking-tight uppercase">Lifetime <span className="text-unihub-teal">Impact</span></h2>
                                    <p className="text-[10px] font-bold text-unihub-textMuted uppercase tracking-widest mt-1">Aggregate Metrics for your Event Ecosystem</p>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-unihub-teal/5 border border-unihub-teal/10 rounded-full">
                                    <Award className="w-4 h-4 text-unihub-teal" />
                                    <span className="text-[10px] font-black text-unihub-teal uppercase tracking-widest">Master Organizer</span>
                                </div>
                            </div>

                            {/* Aggregate Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[
                                    { label: 'Total Events', value: overallAnalytics?.totalEvents || 0, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
                                    { label: 'Total Reach', value: overallAnalytics?.totalRegistrations || 0, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                                    { label: 'Avg Attendance', value: `${overallAnalytics?.averageAttendanceRate || 0}%`, icon: PieChartIcon, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                    { label: 'Avg Fill Rate', value: `${overallAnalytics?.averageFillRate || 0}%`, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50' }
                                ].map((stat, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-[28px] border border-unihub-border shadow-soft flex flex-col items-center text-center group hover:border-unihub-teal/30 transition-all hover:-translate-y-1">
                                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                            <stat.icon className="w-6 h-6" />
                                        </div>
                                        <p className="text-3xl font-black text-unihub-text mb-1 tracking-tight">{stat.value}</p>
                                        <p className="text-[9px] font-black text-unihub-textMuted uppercase tracking-[0.2em]">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Overall Visual Trends */}
                            <div className="bg-white rounded-[32px] p-10 shadow-soft border border-unihub-border">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-lg font-black text-unihub-text uppercase tracking-tight flex items-center gap-3">
                                        <Target className="w-5 h-5 text-unihub-teal" /> Aggregate Portfolio Metrics
                                    </h3>
                                    <p className="text-[10px] font-bold text-unihub-textMuted uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">Historical Capacity vs Engagement</p>
                                </div>
                                <div className="h-[350px]">
                                    {overallAnalytics?.events && (
                                        <AnalyticsCharts data={overallAnalytics.events} />
                                    )}
                                </div>
                            </div>

                            {/* Recent Event Performance Table */}
                            <div className="bg-white rounded-[32px] p-8 border border-unihub-border shadow-soft overflow-hidden">
                                <h3 className="text-lg font-black text-unihub-text uppercase tracking-tight mb-8">Performance Ledger</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-50">
                                                <th className="pb-4 text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.2em]">Activity Node</th>
                                                <th className="pb-4 text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.2em]">Registrations</th>
                                                <th className="pb-4 text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.2em]">Efficiency</th>
                                                <th className="pb-4 text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.2em]">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {overallAnalytics?.events?.map((e) => (
                                                <tr key={e._id} className="group hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 pr-4">
                                                        <p className="text-[12px] font-black text-unihub-text uppercase truncate max-w-[200px]">{e.title}</p>
                                                        <p className="text-[9px] font-bold text-unihub-textMuted uppercase mt-1 opacity-60">{e.category} • {new Date(e.date).toLocaleDateString()}</p>
                                                    </td>
                                                    <td className="py-4">
                                                        <p className="text-sm font-black text-unihub-teal">{e.registeredCount} <span className="text-[10px] text-unihub-textMuted opacity-40">/ {e.capacity}</span></p>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-unihub-teal rounded-full" style={{ width: `${(e.registeredCount/e.capacity)*100}%` }} />
                                                            </div>
                                                            <span className="text-[10px] font-black text-unihub-textMuted">{((e.registeredCount/e.capacity)*100).toFixed(0)}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                                            e.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-unihub-teal/10 text-unihub-teal'
                                                        }`}>
                                                            {e.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            {statsLoading ? (
                                <div className="h-[600px] flex flex-col items-center justify-center bg-white rounded-[40px] border border-unihub-border shadow-soft gap-4">
                                    <div className="w-10 h-10 border-4 border-unihub-teal/10 border-t-unihub-teal rounded-full animate-spin" />
                                    <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-widest animate-pulse">Broadcasting Telemetry...</p>
                                </div>
                            ) : selectedEvent && analytics ? (
                                <>
                                    {/* Drill-down Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0 mr-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <button onClick={() => setViewMode('overall')} className="p-2 rounded-xl bg-gray-100 text-unihub-textMuted hover:bg-unihub-teal hover:text-white transition-all">
                                                    <LayoutDashboard className="w-4 h-4" />
                                                </button>
                                                <h2 className="text-2xl font-black text-unihub-text tracking-tight uppercase line-clamp-1">{selectedEvent.title}</h2>
                                            </div>
                                            <p className="text-[10px] font-bold text-unihub-textMuted uppercase tracking-widest flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-unihub-yellow text-unihub-text rounded-md">{selectedEvent.category}</span>
                                                • SECURE NODE ANALYTICS
                                            </p>
                                        </div>
                                    </div>

                                    {/* Key Stats Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        {[
                                            { label: 'Max Capacity', value: analytics.capacity, icon: Users, color: 'text-unihub-text' },
                                            { label: 'Registered', value: analytics.registered, icon: CheckCircle, color: 'text-unihub-teal' },
                                            { label: 'Attended', value: analytics.attended, icon: Award, color: 'text-unihub-teal' },
                                            { label: 'Drop-off Rate', value: `${(100 - analytics.attendanceRate).toFixed(1)}%`, icon: TrendingUp, color: 'text-unihub-coral' }
                                        ].map((stat, idx) => (
                                            <div key={idx} className="bg-white p-6 rounded-[28px] border border-unihub-border shadow-soft flex flex-col items-center text-center">
                                                <p className="text-[9px] font-black text-unihub-textMuted uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                                                <p className={`text-3xl font-black ${stat.color} tracking-tighter`}>{stat.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Charts Section */}
                                    <div className="bg-white rounded-[32px] p-10 shadow-soft border border-unihub-border">
                                        <h3 className="text-lg font-black text-unihub-text mb-8 uppercase tracking-tight flex items-center gap-3">
                                            <PieChartIcon className="w-5 h-5 text-unihub-teal" /> Visual Performance Tracking
                                        </h3>
                                        <div className="h-[300px]">
                                            <AnalyticsCharts data={{
                                                capacity: analytics.capacity,
                                                registeredCount: analytics.registered,
                                                attendedCount: analytics.attended
                                            }} />
                                        </div>
                                    </div>

                                    {/* Participant Communication Panel */}
                                    <div className="bg-white rounded-[32px] p-8 shadow-soft border border-unihub-border">
                                        <h3 className="text-lg font-black text-unihub-text mb-6 uppercase tracking-tight flex items-center gap-3">
                                            <MessageSquare className="w-5 h-5 text-unihub-yellow" /> Participant Communication
                                        </h3>
                                        <div className="space-y-4">
                                            <textarea
                                                className="w-full bg-gray-50 border border-unihub-border rounded-2xl p-6 text-sm font-medium focus:ring-4 focus:ring-unihub-teal/10 focus:bg-white outline-none transition-all italic leading-relaxed"
                                                rows="3"
                                                placeholder="Broadcast a secure update to all registered students..."
                                                value={broadcastMsg}
                                                onChange={(e) => setBroadcastMsg(e.target.value)}
                                            ></textarea>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <button onClick={() => setBroadcastMsg("⚠️ Venue Update: Please check the revised details for our new location!")} className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-[9px] font-black uppercase text-unihub-textMuted border border-gray-100 rounded-xl transition-all">Venue Update</button>
                                                <button onClick={() => setBroadcastMsg("⏰ Time Change: The event schedule has been adjusted. Please review.")} className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-[9px] font-black uppercase text-unihub-textMuted border border-gray-100 rounded-xl transition-all">Schedule Pulse</button>
                                                <div className="flex-1" />
                                                <button 
                                                    onClick={handleBroadcastMessage}
                                                    disabled={isBroadcasting || !broadcastMsg.trim()}
                                                    className="px-8 py-4 bg-unihub-teal hover:bg-unihub-tealHover text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-30"
                                                >
                                                    <Send className="w-4 h-4" />
                                                    {isBroadcasting ? 'SENDING...' : 'SEND BROADCAST'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Attendance List */}
                                    <div className="bg-white rounded-[32px] border border-unihub-border p-8 shadow-soft">
                                        <div className="flex justify-between items-center mb-8">
                                            <h3 className="text-lg font-black text-unihub-text uppercase tracking-tight flex items-center gap-3">
                                                <Users className="w-5 h-5 text-unihub-teal" /> Participant Roll
                                            </h3>
                                            <span className="px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-[9px] font-black text-unihub-textMuted uppercase tracking-widest">
                                                SECURED NODES: {registrants.length}
                                            </span>
                                        </div>
                                        {registrants.length === 0 ? (
                                            <div className="text-center py-20 bg-gray-50/50 rounded-[32px] border border-dashed border-gray-200">
                                                <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                                <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-widest">No Participants Detected</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {registrants.map((reg) => (
                                                    <div key={reg._id} className="flex items-center justify-between p-5 rounded-3xl border border-unihub-border hover:border-unihub-teal/40 transition-all hover:bg-gray-50/30">
                                                        <div className="flex items-center gap-4 min-w-0">
                                                            <div className="w-10 h-10 rounded-2xl bg-unihub-teal text-white flex items-center justify-center font-black text-xs shadow-md">
                                                                {reg.user?.name?.charAt(0)}
                                                            </div>
                                                            <div className="truncate">
                                                                <p className="text-xs font-black text-unihub-text uppercase truncate">{reg.user?.name}</p>
                                                                <p className="text-[8px] font-black text-unihub-textMuted uppercase tracking-widest opacity-40 truncate">{reg.user?.email}</p>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleToggleAttendance(reg.user._id, reg.attended)}
                                                            className={`ml-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${
                                                                reg.attended 
                                                                ? 'bg-unihub-teal/10 text-unihub-teal border-unihub-teal shadow-inner' 
                                                                : 'bg-white text-gray-300 border-gray-100 hover:text-unihub-coral hover:border-unihub-coral hover:bg-unihub-coral/5'
                                                            }`}
                                                        >
                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                            {reg.attended ? 'PRESENT' : 'MARK'}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>

            {/* Event Requests Modal */}
            {showRequestsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowRequestsModal(false)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-8 overflow-hidden animate-in zoom-in-95 duration-300">
                        <button onClick={() => setShowRequestsModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-unihub-coral transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-unihub-text flex items-center gap-3">
                                <Lightbulb className="w-7 h-7 text-unihub-yellow" />
                                Student Event Ideas
                            </h3>
                            <p className="text-sm font-medium text-unihub-textMuted italic mt-2">
                                Review and approve campus activities proposed directly by the student body.
                            </p>
                        </div>

                        {requests.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
                                <Lightbulb className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                                <p className="text-sm font-bold text-unihub-textMuted italic">No pending requests at this time.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                                {requests.map((req) => (
                                    <div key={req._id} className="p-6 bg-gray-50 rounded-2xl border border-unihub-border flex flex-col justify-between shadow-sm">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-lg font-black text-unihub-text">{req.title}</h4>
                                                <span className="px-3 py-1 bg-white border border-gray-200 text-unihub-textMuted text-[10px] font-bold uppercase rounded-full tracking-widest">{req.category}</span>
                                            </div>
                                            <p className="text-xs font-medium text-gray-500 italic mb-4">Proposed by: {req.requestedBy?.name}</p>
                                            <p className="text-sm text-unihub-text leading-relaxed">{req.description}</p>
                                        </div>
                                        <div className="flex gap-3 mt-6">
                                            <button 
                                                onClick={() => handleRejectRequest(req._id)}
                                                className="flex-1 py-2 rounded-xl text-center border-2 border-gray-200 hover:border-unihub-coral hover:text-unihub-coral text-xs font-bold text-unihub-textMuted transition-all"
                                            >
                                                Dismiss
                                            </button>
                                            <button 
                                                onClick={() => handleApproveRequest(req)}
                                                className="flex-1 py-2 rounded-xl bg-unihub-teal hover:bg-unihub-tealHover text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" /> Approve Idea
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="flex gap-3 pt-6 mt-4 border-t border-gray-100">
                            <button onClick={() => setShowRequestsModal(false)} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-unihub-textMuted font-bold uppercase tracking-widest text-xs rounded-xl transition-colors">
                                Close Panel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizerAnalyticsDashboard;
