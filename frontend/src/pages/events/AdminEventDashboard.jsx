import { useState, useEffect } from 'react';
import { analyticsService, eventService } from '../../utils/api';
import AnalyticsCharts from '../../components/admin/AnalyticsCharts';
import RiskAlert from '../../components/admin/RiskAlert';
import Swal from 'sweetalert2';
import { LayoutDashboard, AlertTriangle, FileText, RefreshCcw } from 'lucide-react';
import '../../components/events/Events.css';

const AdminEventDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [analyticsRes, riskRes, logsRes] = await Promise.all([
                analyticsService.getGlobalEventAnalytics(),
                analyticsService.getRiskDetection(),
                analyticsService.getAuditLogs()
            ]);
            setAnalytics({ ...analyticsRes.data, riskEvents: riskRes.data });
            setAuditLogs(logsRes.data);
        } catch (error) {
            Swal.fire('Error', 'Failed to load administrative data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleTriggerReminder = async (eventId) => {
        try {
            await eventService.triggerReminders(eventId);
            Swal.fire('Triggered', 'Reminders sent to all registered students successfully.', 'success');
            fetchData();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to trigger reminders', 'error');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-16 h-16 border-4 border-unihub-teal/20 border-t-unihub-teal rounded-full animate-spin shadow-inner" />
            <p className="text-xs font-black text-unihub-textMuted uppercase tracking-widest animate-pulse font-display">Syncing Command Center...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-16">
            {/* Hero Header */}
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl mt-4 bg-gradient-to-br from-unihub-coral to-[#de3047]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-white opacity-10 blur-[120px] rounded-full mix-blend-overlay animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white opacity-5 blur-[100px] rounded-full" />
                    <LayoutDashboard className="absolute -right-16 -top-16 w-80 h-80 text-white opacity-10 rotate-12" strokeWidth={0.5} />
                </div>
                <div className="px-8 md:px-16 py-14 md:py-20 relative z-10 flex flex-col md:flex-row items-start justify-between gap-8">
                    <div className="max-w-2xl space-y-6">
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[11px] font-bold text-white uppercase tracking-[0.2em] shadow-xl">
                            <LayoutDashboard className="w-4 h-4 text-unihub-yellow" /> System Oversight
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter font-display">
                            Admin <span className="text-unihub-yellow">Command Center</span>.
                        </h1>
                        <p className="text-white/80 font-medium text-base max-w-xl leading-relaxed">
                            High-level oversight of event performance, risk detection, and system audit logs.
                        </p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95 flex-shrink-0 mt-2">
                        <RefreshCcw className="w-4 h-4 text-unihub-yellow" /> Refresh Data
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-2">
                {[
                    { id: 'overview', label: 'Performance Overview', icon: LayoutDashboard },
                    { id: 'risk', label: 'Risk Detection', icon: AlertTriangle },
                    { id: 'audit', label: 'System Audit Logs', icon: FileText }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-8 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all shadow-xl font-display flex items-center gap-2 whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'bg-unihub-coral text-white shadow-unihub-coral/30'
                                : 'bg-white border border-gray-100 text-unihub-textMuted hover:text-unihub-text hover:border-gray-200'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-8 px-1">
                {activeTab === 'overview' && analytics && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { label: 'TOTAL EVENTS', value: analytics.totalEvents, color: 'text-unihub-teal' },
                                { label: 'REGISTRATIONS', value: analytics.totalRegistrations, color: 'text-unihub-teal' },
                                { label: 'AVG FILL RATE', value: `${analytics.averageFillRate}%`, color: 'text-unihub-teal' },
                                { label: 'ACTIVE ORGANIZERS', value: analytics.uniqueOrganizers, color: 'text-unihub-coral' }
                            ].map((stat, i) => (
                                <div key={i} className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-all group">
                                    <p className="uni-label mb-1">{stat.label}</p>
                                    <p className={`text-2xl font-bold tracking-tight ${stat.color} group-hover:scale-105 transition-transform`}>{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Charts Area */}
                        <div className="bg-white rounded-[40px] p-8 shadow-soft border border-unihub-border">
                            <h3 className="text-xl font-black text-unihub-text mb-8 flex items-center gap-3 uppercase tracking-tight">
                                <span className="w-1.5 h-6 bg-unihub-teal rounded-full"></span>
                                Enrollment distribution
                            </h3>
                            <div className="h-[400px]">
                                <AnalyticsCharts data={analytics.events} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'risk' && analytics && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {analytics.riskEvents.length > 0 ? (
                                analytics.riskEvents.map(event => (
                                    <RiskAlert key={event.eventId} event={event} onTriggerReminder={handleTriggerReminder} />
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center space-y-4 bg-unihub-teal-light/30 rounded-[40px] border border-dashed border-unihub-teal/20">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                                        <AlertTriangle className="w-8 h-8 text-unihub-teal/20" />
                                    </div>
                                    <p className="text-unihub-textMuted font-bold italic">No critical risks detected in the current event cycle.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="admin-table-container shadow-soft">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="admin-table-header">
                                        <tr>
                                            <th className="px-8 py-5">ADMINISTRATOR</th>
                                            <th className="px-6 py-5">ACTION</th>
                                            <th className="px-6 py-5">TARGET RESOURCE</th>
                                            <th className="px-6 py-5">TIMESTAMP</th>
                                            <th className="px-8 py-5 text-right">METRIC</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {auditLogs.map((log) => (
                                            <tr key={log._id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-unihub-teal/10 flex items-center justify-center text-unihub-teal font-black text-xs">
                                                            {log.user?.name?.charAt(0)}
                                                        </div>
                                                        <span className="text-sm font-bold text-unihub-text">{log.user?.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${
                                                        log.action.includes('CREATE') ? 'bg-emerald-50 text-emerald-700' :
                                                        log.action.includes('DELETE') ? 'bg-rose-50 text-rose-700' :
                                                        'bg-blue-50 text-blue-700'
                                                    }`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-sm font-medium text-unihub-textMuted">{log.resource}</td>
                                                <td className="px-6 py-5 text-xs text-unihub-textMuted font-bold">{new Date(log.timestamp).toLocaleString()}</td>
                                                <td className="px-8 py-5 text-right">
                                                    {log.details?.id && <span className="text-[10px] font-black text-unihub-teal bg-unihub-teal-light px-2 py-1 rounded">UID: {log.details.id.slice(-5)}</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminEventDashboard;
