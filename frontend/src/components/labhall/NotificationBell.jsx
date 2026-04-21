import React, { useState, useEffect, useContext, useRef } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Wrench, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const API = 'http://localhost:5000/api/labhall';

const typeIcon = (type) => {
    if (type === 'maintenance') return <Wrench className="w-4 h-4 text-amber-500" />;
    if (type === 'issue') return <AlertTriangle className="w-4 h-4 text-rose-500" />;
    if (type === 'booking') return <CheckCircle className="w-4 h-4 text-indigo-500" />;
    if (type === 'recurring') return <RefreshCw className="w-4 h-4 text-purple-500" />;
    return <Bell className="w-4 h-4 text-gray-400" />;
};

// Builds local notifications from live data
const buildNotifications = (issues, bookings, rooms) => {
    const notifs = [];

    issues.filter(i => i.status === 'open' && i.priority === 'critical').forEach(i => {
        notifs.push({
            id: `issue-${i._id}`,
            type: 'issue',
            title: `🔴 Critical: ${i.roomId?.name || 'Unknown Room'}`,
            body: i.description,
            time: new Date(i.createdAt)
        });
    });

    rooms.filter(r => r.status === 'maintenance').forEach(r => {
        notifs.push({
            id: `maint-${r._id}`,
            type: 'maintenance',
            title: `🔒 ${r.name} — Under Maintenance`,
            body: `Floor ${r.floor} · ${r.type}`,
            time: new Date(r.updatedAt)
        });
    });

    const today = new Date().toISOString().split('T')[0];
    bookings.filter(b => b.date?.split('T')[0] === today && b.status === 'confirmed').slice(0, 3).forEach(b => {
        notifs.push({
            id: `book-${b._id}`,
            type: 'booking',
            title: `📅 Today: ${b.roomId?.name || 'Room'} booked`,
            body: `${b.startTime} – ${b.endTime}`,
            time: new Date(b.date)
        });
    });

    bookings.filter(b => b.recurrence === 'weekly').slice(0, 2).forEach(b => {
        notifs.push({
            id: `rec-${b._id}`,
            type: 'recurring',
            title: `🔁 Weekly series: ${b.roomId?.name || 'Room'}`,
            body: `${b.startTime} – ${b.endTime} · Every week`,
            time: new Date(b.date)
        });
    });

    return notifs.sort((a, b) => b.time - a.time).slice(0, 10);
};

const NotificationBell = () => {
    const { user } = useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [dismissed, setDismissed] = useState(() => {
        try { return JSON.parse(localStorage.getItem('labhall_dismissed_notifs') || '[]'); }
        catch { return []; }
    });
    const panelRef = useRef(null);
    const bellRef = useRef(null);
    const [panelPos, setPanelPos] = useState({ top: 0, right: 0 });
    const headers = { Authorization: `Bearer ${user.token}` };

    useEffect(() => {
        const fetchNotifs = async () => {
            try {
                const [issuesRes, bookingsRes, roomsRes] = await Promise.allSettled([
                    axios.get(`${API}/issues`, { headers }),
                    axios.get(`${API}/bookings`, { headers }),
                    axios.get(`${API}/rooms`, { headers }),
                ]);
                const issues = issuesRes.status === 'fulfilled' ? issuesRes.value.data : [];
                const bookings = bookingsRes.status === 'fulfilled' ? bookingsRes.value.data : [];
                const rooms = roomsRes.status === 'fulfilled' ? roomsRes.value.data : [];
                setNotifications(buildNotifications(issues, bookings, rooms));
            } catch (e) { console.error(e); }
        };
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (
                panelRef.current && !panelRef.current.contains(e.target) &&
                bellRef.current && !bellRef.current.contains(e.target)
            ) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleBellClick = () => {
        if (bellRef.current) {
            const rect = bellRef.current.getBoundingClientRect();
            setPanelPos({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right,
            });
        }
        setOpen(o => !o);
    };

    const dismiss = (id) => {
        const updated = [...dismissed, id];
        setDismissed(updated);
        localStorage.setItem('labhall_dismissed_notifs', JSON.stringify(updated));
    };

    const dismissAll = () => {
        const allIds = notifications.map(n => n.id);
        setDismissed(allIds);
        localStorage.setItem('labhall_dismissed_notifs', JSON.stringify(allIds));
    };

    const formatTime = (date) => {
        const d = new Date(date);
        if (isNaN(d)) return '';
        return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const visible = notifications.filter(n => !dismissed.includes(n.id));
    const unread = visible.length;

    return (
        <div className="relative">
            <button
                ref={bellRef}
                onClick={handleBellClick}
                className="relative w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center hover:border-indigo-300 transition-all"
            >
                <Bell className="w-5 h-5 text-gray-600" />
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow animate-pulse">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div
                    ref={panelRef}
                    style={{ position: 'fixed', top: panelPos.top, right: panelPos.right, zIndex: 99999 }}
                    className="w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
                        <h3 className="font-black text-gray-800 text-sm">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unread > 0 && (
                                <button onClick={dismissAll}
                                    className="text-[10px] font-black text-indigo-500 hover:underline uppercase tracking-wide">
                                    Mark all read
                                </button>
                            )}
                            {dismissed.length > 0 && unread === 0 && (
                                <button onClick={() => { setDismissed([]); localStorage.removeItem('labhall_dismissed_notifs'); }}
                                    className="text-[10px] font-black text-gray-400 hover:underline uppercase tracking-wide">
                                    Restore
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Scrollable body */}
                    <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                        {visible.length === 0 ? (
                            <div className="py-10 text-center">
                                <CheckCircle className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                <p className="text-sm text-gray-300 font-bold">All caught up!</p>
                            </div>
                        ) : (
                            visible.map(n => (
                                <div key={n.id} className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-all border-b border-gray-50 last:border-0">
                                    <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        {typeIcon(n.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-gray-800 leading-snug">{n.title}</p>
                                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">{n.body}</p>
                                        <p className="text-[10px] text-gray-300 font-medium mt-1">{formatTime(n.time)}</p>
                                    </div>
                                    <button onClick={() => dismiss(n.id)}
                                        className="p-1 rounded-lg hover:bg-gray-100 text-gray-300 hover:text-gray-500 transition-all flex-shrink-0">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
