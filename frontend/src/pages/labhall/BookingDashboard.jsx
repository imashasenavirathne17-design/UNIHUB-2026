import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import RoomGrid from '../../components/labhall/RoomGrid';
import BookingModal from '../../components/labhall/BookingModal';
import IssueReportModal from '../../components/labhall/IssueReportModal';
import NotificationBell from '../../components/labhall/NotificationBell';
import { Link } from 'react-router-dom';
import {
    Calendar as CalendarIcon, Info, AlertCircle, Clock,
    MapPin, Edit2, Trash2, Calendar, AlertTriangle,
    BarChart2, RefreshCw
} from 'lucide-react';
import Swal from 'sweetalert2';

const BookingDashboard = () => {
    const { user } = useContext(AuthContext);
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [activeFloor, setActiveFloor] = useState(1);
    const [activeType, setActiveType] = useState('all');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showModal, setShowModal] = useState(false);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [editingBooking, setEditingBooking] = useState(null);
    const [allRooms, setAllRooms] = useState([]);
    const [loading, setLoading] = useState(false);

    const API_URL = 'http://localhost:5000/api/labhall';
    const isStaff = user.role === 'lecturer' || user.role === 'admin';

    useEffect(() => {
        fetchRooms();
        fetchBookings();
        // Also fetch all rooms for issue reporting dropdown
        axios.get(`${API_URL}/rooms`, { headers: { Authorization: `Bearer ${user.token}` } })
            .then(r => setAllRooms(r.data)).catch(console.error);
    }, [activeFloor, selectedDate, activeType]);

    const fetchRooms = async () => {
        try {
            const url = activeType === 'all'
                ? `${API_URL}/rooms/floor/${activeFloor}`
                : `${API_URL}/rooms/floor/${activeFloor}/type/${activeType}`;
            const res = await axios.get(url, { headers: { Authorization: `Bearer ${user.token}` } });
            setRooms(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchBookings = async () => {
        try {
            const res = await axios.get(`${API_URL}/bookings`, { headers: { Authorization: `Bearer ${user.token}` } });
            const filtered = res.data.filter(b => b.date.split('T')[0] === selectedDate);
            setBookings(filtered);
        } catch (err) { console.error(err); }
    };

    const handleRoomClick = (room, slot) => {
        if (room.status === 'maintenance') {
            Swal.fire({ title: 'Under Maintenance', text: 'This room is currently locked for maintenance.', icon: 'warning', confirmButtonColor: '#14B8A6' });
            return;
        }
        if (!isStaff) {
            Swal.fire({ title: 'View Only', text: 'Only lecturers and admins can book rooms. Students can view availability and report issues.', icon: 'info', confirmButtonColor: '#14B8A6' });
            return;
        }
        setSelectedRoom(room); setSelectedSlot(slot); setEditingBooking(null); setShowModal(true);
    };

    const handleEditClick = (booking) => {
        setSelectedRoom(booking.roomId); setEditingBooking(booking); setShowModal(true);
    };

    const handleCreateOrUpdateBooking = async (bookingData) => {
        setLoading(true);
        try {
            if (editingBooking) {
                await axios.put(`${API_URL}/bookings/${editingBooking._id}`, bookingData, { headers: { Authorization: `Bearer ${user.token}` } });
                Swal.fire('Success', 'Booking updated!', 'success');
            } else {
                const res = await axios.post(`${API_URL}/bookings`, bookingData, { headers: { Authorization: `Bearer ${user.token}` } });
                const count = Array.isArray(res.data) ? res.data.length : 1;
                Swal.fire('Confirmed!', `${count > 1 ? `${count} recurring slots booked!` : 'Booking confirmed!'}`, 'success');
            }
            setShowModal(false);
            fetchBookings();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to process booking', 'error');
        } finally { setLoading(false); }
    };

    const handleDeleteBooking = async (booking) => {
        const hasSeries = booking.recurrenceGroupId;
        const confirmResult = await Swal.fire({
            title: 'Delete this booking?',
            text: hasSeries ? 'This is a recurring booking. Delete just this one or the entire series?' : "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            showDenyButton: hasSeries,
            confirmButtonColor: '#14B8A6',
            denyButtonColor: '#FF6B6B',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Just this one',
            denyButtonText: 'Delete entire series',
            cancelButtonText: 'Cancel'
        });

        if (confirmResult.isDismissed) return;

        const deleteSeries = confirmResult.isDenied;
        try {
            await axios.delete(`${API_URL}/bookings/${booking._id}?deleteSeries=${deleteSeries}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            Swal.fire('Deleted!', deleteSeries ? 'Entire series removed.' : 'Booking removed.', 'success');
            fetchBookings();
        } catch (err) {
            Swal.fire('Error', 'Failed to delete booking', 'error');
        }
    };

    const isPastDate = new Date(selectedDate) < new Date(new Date().toISOString().split('T')[0]);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {/* Hero Section */}
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl mt-2 bg-gradient-to-br from-unihub-teal to-[#0d857a]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-white opacity-10 blur-[120px] rounded-full mix-blend-overlay animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white opacity-5 blur-[100px] rounded-full" />
                    <MapPin className="absolute -right-16 -top-16 w-80 h-80 text-white opacity-10 rotate-12" strokeWidth={0.5} />
                </div>
                <div className="px-8 md:px-16 py-14 md:py-20 relative z-10">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[11px] font-bold text-white tracking-[0.2em] shadow-xl">
                            <MapPin className="w-4 h-4 text-unihub-yellow" /> Space Control v4.0
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter font-display">
                            Campus <span className="text-unihub-yellow">Booking</span>.
                        </h1>
                        <p className="text-white/80 font-medium text-base max-w-xl leading-relaxed italic opacity-90">
                            {isStaff 
                                ? "Strategic Management Of Laboratory And Hall Resources Across Campus.".split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
                                : "Transparent View Of Campus Space Utilization And Availability.".split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            {isStaff && <div className="p-2 rounded-xl bg-white/10 border border-white/20"><NotificationBell /></div>}
                            <button onClick={() => setShowIssueModal(true)}
                                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95">
                                <AlertTriangle className="w-4 h-4 text-unihub-yellow" /> Report Issue
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="glass-card rounded-2xl px-6 py-5">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                        {/* Date Picker */}
                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 hover:border-unihub-teal/30 transition-all flex-1 min-w-[180px]">
                            <CalendarIcon className="w-4 h-4 text-unihub-teal flex-shrink-0" />
                            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-transparent font-medium text-unihub-text outline-none text-sm w-full" />
                        </div>

                        {/* Floor Selector */}
                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 hover:border-unihub-teal/30 transition-all flex-1 min-w-[160px]">
                            <Info className="w-4 h-4 text-unihub-textMuted flex-shrink-0" />
                            <select value={activeFloor} onChange={(e) => setActiveFloor(Number(e.target.value))}
                                className="bg-transparent font-medium text-unihub-text outline-none text-sm appearance-none pr-2 w-full">
                                {[1, 2, 3, 4, 5, 6, 7].map(f => <option key={f} value={f}>Level {f}</option>)}
                            </select>
                        </div>

                        {/* Type Filter */}
                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 hover:border-unihub-teal/30 transition-all flex-1 min-w-[160px]">
                            <RefreshCw className="w-4 h-4 text-unihub-textMuted flex-shrink-0" />
                            <select value={activeType} onChange={(e) => setActiveType(e.target.value)}
                                className="bg-transparent font-medium text-unihub-text outline-none text-sm appearance-none pr-2 w-full">
                                <option value="all">Every Space</option>
                                <option value="hall">Halls Only</option>
                                <option value="lab">Labs Only</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Student Info Banner */}
            {!isStaff && (
                <div className="p-5 rounded-2xl glass-dark flex items-center gap-4 text-unihub-teal">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                        <Info className="w-4 h-4 text-unihub-teal" />
                    </div>
                    <p className="font-medium text-sm text-unihub-text opacity-90 leading-relaxed">You are in <span className="font-semibold text-unihub-teal">Public View</span>. Use the <span className="font-semibold">Report Issue</span> button above to notify maintenance teams of any environmental concerns.</p>
                </div>
            )}

            {/* Room Grid */}
            <div className={`transition-all duration-700 ${isPastDate ? 'grayscale opacity-40 blur-[2px] pointer-events-none' : ''}`}>
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-1.5 h-7 bg-unihub-teal rounded-full" />
                    <h2 className="text-3xl font-black text-unihub-text tracking-tighter uppercase">Level {activeFloor} Strategy <span className="text-unihub-textMuted font-medium italic lowercase tracking-tight">Layout</span></h2>
                    {isPastDate && (
                        <div className="flex items-center gap-2 text-unihub-coral font-black text-[10px] uppercase tracking-widest bg-unihub-coral/10 px-4 py-2 rounded-full border border-unihub-coral/20 shadow-sm ml-auto">
                            <AlertCircle className="w-3.5 h-3.5" /> Archival View
                        </div>
                    )}
                </div>

                {rooms.length > 0 ? (
                    <RoomGrid rooms={rooms} bookings={bookings} onRoomClick={handleRoomClick} selectedDate={selectedDate} />
                ) : (
                    <div className="h-72 flex flex-col items-center justify-center glass-card rounded-2xl border-2 border-dashed border-gray-200 group hover:border-unihub-teal/30 transition-all duration-300">
                        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-105 transition-transform">
                            <MapPin className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-unihub-textMuted font-medium text-sm">Zero Resources In This Sector</p>
                        {isStaff && (
                            <button onClick={async () => {
                                const confirm = await Swal.fire({ title: 'Re-initialize Campus Layout?', text: 'Reset all floors to the standard 7-floor layout.', icon: 'question', showCancelButton: true, confirmButtonText: 'Yes, reset!', confirmButtonColor: '#14B8A6' });
                                if (confirm.isConfirmed) {
                                    try {
                                        await axios.post(`${API_URL}/rooms/seed`, { reset: true }, { headers: { Authorization: `Bearer ${user.token}` } });
                                        fetchRooms();
                                        Swal.fire('Done!', 'Campus layout initialized.', 'success');
                                    } catch (e) { Swal.fire('Error', e.response?.data?.message || 'Seeding failed.', 'error'); }
                                }
                            }} className="mt-6 text-unihub-teal font-black text-[10px] uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Provision Layout (7 Levels)</button>
                        )}
                    </div>
                )}
            </div>

            {/* Reservations Panel (Staff) */}
            {isStaff && bookings.length > 0 && (
                <div className="mt-24 space-y-10 pb-20">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-7 bg-unihub-teal rounded-full" />
                        <h2 className="text-3xl font-black text-unihub-text tracking-tighter uppercase">Live Engagements</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {bookings.map((booking) => {
                            const today = new Date().toISOString().split('T')[0];
                            const bookingDate = booking.date.split('T')[0];
                            const endHour = parseInt(booking.endTime.split(':')[0]);
                            const currentHour = new Date().getHours();
                            const isPast = bookingDate < today || (bookingDate === today && endHour <= currentHour);
                            const isToday = bookingDate === today && !isPast;
                            
                            const currentUserId = user?._id || user?.id;
                            const isOwner = booking.userId === currentUserId || booking.userId?._id === currentUserId || user?.role === 'admin';

                            return (
                                <div key={booking._id}
                                    className={`glass-card rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col group relative overflow-hidden ${
                                        isPast
                                            ? 'opacity-50 border-gray-100 grayscale'
                                            : isToday
                                                ? 'border-unihub-teal shadow-glass ring-4 ring-unihub-teal/10'
                                                : 'border-transparent hover:border-unihub-teal/30 hover:shadow-card hover:-translate-y-1'
                                    }`}>

                                    <div className="flex justify-between items-start mb-5 relative z-10">
                                        <div>
                                            <h3 className={`text-lg font-semibold tracking-tight leading-none mb-1 group-hover:text-unihub-teal transition-colors ${isPast ? 'text-gray-400' : 'text-unihub-text'}`}>
                                                {booking.roomId?.name || 'ROOM'}
                                            </h3>
                                            <p className="text-xs text-unihub-textMuted">Floor {booking.roomId?.floor || '0'} · {booking.roomId?.type || 'Space'}</p>
                                        </div>
                                        <div className="flex flex-col gap-1.5 items-end">
                                            {booking.recurrence === 'weekly' && (
                                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-unihub-teal/10 text-unihub-teal border border-unihub-teal/20 text-[10px] font-black uppercase tracking-widest">
                                                    <RefreshCw className="w-3 h-3" /> Series
                                                </span>
                                            )}
                                            {isToday && (
                                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-unihub-yellow/10 text-unihub-yellow border border-unihub-yellow/20 text-[10px] font-black uppercase tracking-widest">
                                                    Live
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-5 flex-1 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-unihub-teal transition-all">
                                                <Calendar className={`w-3.5 h-3.5 ${isPast ? 'text-gray-200' : 'text-gray-400 group-hover:text-white'}`} />
                                            </div>
                                            <span className={`text-xs font-medium ${isPast ? 'text-gray-300' : 'text-unihub-text'}`}>
                                                {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-unihub-teal transition-all">
                                                <Clock className={`w-3.5 h-3.5 ${isPast ? 'text-gray-200' : 'text-gray-400 group-hover:text-white'}`} />
                                            </div>
                                            <span className={`text-xs font-medium ${isPast ? 'text-gray-300' : 'text-unihub-text'}`}>{booking.startTime} — {booking.endTime}</span>
                                        </div>
                                        {!isOwner && !isPast && (
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                                                    <Info className="w-3.5 h-3.5 text-indigo-400" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{booking.lecturerName || 'Another Lecturer'}</span>
                                            </div>
                                        )}
                                    </div>

                                    {isPast ? (
                                        <div className="bg-gray-50 w-full py-3 rounded-xl text-center border border-gray-100 relative z-10">
                                            <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-400 border border-gray-200 text-[10px] font-black uppercase tracking-widest">Completed</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 relative z-10">
                                            {isOwner ? (
                                                <>
                                                    <button onClick={() => handleEditClick(booking)}
                                                        className="btn btn-outline btn-sm flex-1 hover:bg-unihub-teal hover:text-white hover:border-unihub-teal transition-colors">
                                                        <Edit2 className="w-3.5 h-3.5" /> Edit
                                                    </button>
                                                    <button onClick={() => handleDeleteBooking(booking)}
                                                        className="btn py-2 px-4 rounded-xl flex-1 text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white transition-colors text-xs font-bold flex flex-row items-center justify-center gap-2">
                                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="w-full text-center py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secured Reservation</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Booking Modal */}
            {showModal && selectedRoom && (
                <BookingModal
                    room={selectedRoom}
                    selectedDate={selectedDate}
                    initialStartTime={selectedSlot}
                    editingBooking={editingBooking}
                    onClose={() => setShowModal(false)}
                    onBook={handleCreateOrUpdateBooking}
                    loading={loading}
                />
            )}

            {/* Issue Report Modal */}
            {showIssueModal && (
                <IssueReportModal
                    rooms={allRooms}
                    userToken={user.token}
                    onClose={() => setShowIssueModal(false)}
                />
            )}
        </div>
    );
};

export default BookingDashboard;
