import { useState, useEffect, useContext } from 'react';
import { eventService, eventRequestService } from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import {
    Plus,
    Edit3,
    Trash2,
    Users,
    Calendar,
    MapPin,
    Clock,
    LayoutDashboard,
    Settings,
    X,
    Filter,
    ChevronRight,
    Zap,
    CheckCircle,
    AlertCircle,
    BarChart2,
    Lightbulb
} from 'lucide-react';
import { Link } from 'react-router-dom';
import '../../components/events/Events.css';

const EventManagement = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        capacity: 50,
        category: 'Workshop',
        registrationDeadline: '',
        manualOverride: { remindersEnabled: true, boostModeEnabled: true }
    });
    const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [registrants, setRegistrants] = useState([]);
    
    // Event Requests
    const [requests, setRequests] = useState([]);
    const [showRequestsModal, setShowRequestsModal] = useState(false);

    useEffect(() => {
        fetchMyEvents();
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data } = await eventRequestService.getRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        }
    };

    const fetchMyEvents = async () => {
        setLoading(true);
        try {
            const { data } = await eventService.getAllEvents();
            // In a real app, filter by organizer ID. For now, show all if admin/organizer
            setEvents(data);
        } catch (error) {
            Swal.fire('Error', 'Failed to fetch your events', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleOpenModal = (event = null) => {
        if (event) {
            setEditingEvent(event);
            setFormData({
                title: event.title,
                description: event.description,
                date: event.date.split('T')[0],
                time: event.time,
                venue: event.venue,
                capacity: event.capacity,
                category: event.category,
                registrationDeadline: event.registrationDeadline.split('T')[0],
                manualOverride: {
                    remindersEnabled: event.manualOverride?.remindersEnabled ?? true,
                    boostModeEnabled: event.manualOverride?.boostModeEnabled ?? true
                }
            });
        } else {
            setEditingEvent(null);
            setFormData({
                title: '',
                description: '',
                date: '',
                time: '',
                venue: '',
                capacity: 50,
                category: 'Workshop',
                registrationDeadline: '',
                manualOverride: { remindersEnabled: true, boostModeEnabled: true }
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEvent) {
                await eventService.updateEvent(editingEvent._id, formData);
                Swal.fire('Updated', 'Event updated successfully', 'success');
            } else {
                await eventService.createEvent(formData);
                Swal.fire('Created', 'Event created successfully', 'success');
            }
            setShowModal(false);
            fetchMyEvents();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Operation failed', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete this event?',
            text: 'This action cannot be undone and all registrations will be lost.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FF6B6B',
            confirmButtonText: 'Yes, delete it'
        });

        if (result.isConfirmed) {
            try {
                await eventService.deleteEvent(id);
                fetchMyEvents();
                Swal.fire('Deleted', 'Event has been removed', 'success');
            } catch (error) {
                Swal.fire('Error', 'Deletion failed', 'error');
            }
        }
    };

    const handleOpenEnrollment = async (event) => {
        setSelectedEvent(event);
        setShowEnrollmentModal(true);
        try {
            const { data } = await eventService.getEventRegistrants(event._id);
            setRegistrants(data);
        } catch (error) {
            Swal.fire('Error', 'Failed to fetch registrants', 'error');
        }
    };

    const handleToggleAttendance = async (userId, currentStatus) => {
        try {
            await eventService.toggleAttendance(selectedEvent._id, userId, !currentStatus);
            setRegistrants(prev => prev.map(reg => 
                reg.user._id === userId ? { ...reg, attended: !currentStatus } : reg
            ));
        } catch (error) {
            Swal.fire('Error', 'Failed to update attendance', 'error');
        }
    };

    const handleApproveRequest = async (request) => {
        try {
            await eventRequestService.updateRequestStatus(request._id, 'Approved');
            setRequests(requests.filter(r => r._id !== request._id));
            Swal.fire('Approved', 'Request approved. Automatically pre-filling the launch form.', 'success');
            setShowRequestsModal(false);
            
            // Open the create event modal pre-filled
            setEditingEvent(null);
            setFormData({
                title: request.title,
                description: request.description,
                date: '',
                time: '',
                venue: '',
                capacity: 50,
                category: request.category || 'Workshop',
                registrationDeadline: '',
                manualOverride: { remindersEnabled: true, boostModeEnabled: true }
            });
            setShowModal(true);
        } catch (error) {
            Swal.fire('Error', 'Failed to approve request', 'error');
        }
    };

    const handleRejectRequest = async (id) => {
        try {
            await eventRequestService.updateRequestStatus(id, 'Rejected');
            setRequests(requests.filter(r => r._id !== id));
            Swal.fire('Rejected', 'The request has been removed.', 'info');
        } catch (error) {
            Swal.fire('Error', 'Failed to reject request', 'error');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-16 h-16 border-4 border-unihub-teal/20 border-t-unihub-teal rounded-full animate-spin shadow-inner" />
            <p className="text-xs font-black text-unihub-textMuted uppercase tracking-widest animate-pulse font-display">Loading Events...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-16">
            {/* Hero Header */}
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl mt-4 bg-gradient-to-br from-unihub-teal to-[#0d857a] group">
                <div className="absolute inset-0 overflow-hidden pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-white opacity-10 blur-[120px] rounded-full mix-blend-overlay animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white opacity-5 blur-[100px] rounded-full" />
                    <Calendar className="absolute -right-16 -top-16 w-80 h-80 text-white opacity-10 rotate-12" strokeWidth={0.5} />
                </div>

                <div className="px-8 md:px-16 py-14 md:py-20 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div className="max-w-2xl space-y-6">
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[11px] font-bold text-white uppercase tracking-[0.2em] shadow-xl mx-auto md:mx-0">
                            <Settings className="w-4 h-4 text-unihub-yellow" /> Event Management Nexus
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-normal font-display">
                            Orchestrate Your <span className="text-unihub-yellow">Campus Events</span>.
                        </h1>
                        <p className="text-white/90 font-medium text-base md:text-lg max-w-xl leading-relaxed italic opacity-80 mx-auto md:mx-0">
                            Create, Monitor, And Optimize Your University Activity Portfolio With Absolute Precision And Real-Time Attendance Control.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-2 flex-shrink-0">
                        <Link 
                            to="/events/organizer-analytics"
                            className="inline-flex items-center justify-center gap-2 bg-white/20 text-white border border-white/30 px-8 py-4 rounded-2xl font-black text-xs tracking-normal shadow-xl hover:bg-white/30 transition-all active:scale-95"
                        >
                            <BarChart2 className="w-5 h-5" /> View Analytics
                        </Link>
                        {requests.length > 0 && (
                            <button
                                onClick={() => setShowRequestsModal(true)}
                                className="inline-flex items-center justify-center gap-2 bg-unihub-yellow text-unihub-text px-8 py-4 rounded-2xl font-black text-xs tracking-normal shadow-xl hover:bg-yellow-400 transition-all active:scale-95 animate-pulse"
                            >
                                <Lightbulb className="w-5 h-5" /> Pending Requests ({requests.length})
                            </button>
                        )}
                        <button
                            onClick={() => handleOpenModal()}
                            className="inline-flex items-center justify-center gap-2 bg-white text-unihub-teal px-8 py-4 rounded-2xl font-black text-xs tracking-normal shadow-xl hover:bg-unihub-yellow hover:text-unihub-text transition-all active:scale-95"
                        >
                            <Plus className="w-5 h-5" /> Launch Activity
                        </button>
                    </div>
                </div>
            </div>

            {/* Event List Table */}
            <div className="admin-table-container shadow-soft">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="admin-table-header">
                            <tr>
                                <th className="px-8 py-5 text-unihub-textMuted">EVENT DETAILS</th>
                                <th className="px-6 py-5 text-unihub-textMuted">LOGISTICS</th>
                                <th className="px-6 py-5 text-unihub-textMuted text-center">ENROLLMENT</th>
                                <th className="px-6 py-5 text-unihub-textMuted">STATUS</th>
                                <th className="px-8 py-5 text-right text-unihub-textMuted">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 uppercase tracking-tighter">
                            {events.map((event) => (
                                <tr key={event._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-unihub-teal/5 flex items-center justify-center text-unihub-teal font-black text-xl shadow-sm">
                                                {event.title.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-unihub-text line-clamp-1">{event.title}</p>
                                                <p className="text-[10px] font-bold text-unihub-textMuted">{event.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-unihub-text">
                                                <Calendar className="w-3 h-3 text-unihub-teal" /> {new Date(event.date).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-unihub-textMuted">
                                                <MapPin className="w-3 h-3" /> {event.venue}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col items-center">
                                            {event.registeredCount < (event.capacity / 2) && (
                                                <div className="flex items-center gap-1.5 mb-2 px-3 py-1 bg-unihub-coral/10 text-unihub-coral border border-unihub-coral/20 rounded-full animate-bounce shadow-sm">
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Low Traction</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-sm font-black text-unihub-text">
                                                <Users className="w-4 h-4 text-unihub-teal" />
                                                <span>{event.registeredCount} <span className="text-unihub-textMuted font-bold text-xs">/ {event.capacity}</span></span>
                                            </div>
                                            <div className="w-20 h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-700 ${event.registeredCount < (event.capacity / 2) ? 'bg-unihub-coral' : 'bg-unihub-teal'}`} 
                                                    style={{ width: `${(event.registeredCount / event.capacity) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                            event.status === 'Upcoming' ? 'bg-unihub-teal/10 text-unihub-teal border-unihub-teal/20' :
                                            event.status === 'Ongoing' ? 'bg-[#14b8a615] text-unihub-teal border-unihub-teal/20' :
                                            'bg-unihub-coral/10 text-unihub-coral border-unihub-coral/20'
                                        }`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenEnrollment(event)}
                                                className="p-2.5 rounded-xl bg-white border border-unihub-border text-unihub-yellow hover:bg-unihub-yellow hover:text-white transition-all shadow-sm active:scale-90"
                                                title="View Enrollments & Attendance"
                                            >
                                                <Users className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(event)}
                                                className="p-2.5 rounded-xl bg-white border border-unihub-border text-unihub-teal hover:bg-unihub-teal hover:text-white transition-all shadow-sm active:scale-90"
                                                title="Edit Event"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(event._id)}
                                                className="p-2.5 rounded-xl bg-white border border-unihub-border text-unihub-coral hover:bg-unihub-coral hover:text-white transition-all shadow-sm active:scale-90"
                                                title="Delete Event"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="uni-modal-overlay">
                    <div className="uni-modal max-w-2xl w-full p-8">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 btn btn-icon btn-secondary">
                            <X className="w-4 h-4" />
                        </button>

                        <h3 className="text-xl font-semibold text-unihub-text mb-6 flex items-center gap-2.5">
                            <Calendar className="w-5 h-5 text-unihub-teal" />
                            {editingEvent ? 'Refine Event Details' : 'Launch New Activity'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-black text-unihub-textMuted uppercase tracking-widest mb-2">Event Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        className="w-full border border-unihub-border rounded-xl py-4 px-5 text-sm font-bold bg-gray-50 focus:bg-white focus:ring-4 focus:ring-unihub-teal/20 outline-none transition-all"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. Annual Tech Symposium 2026"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-black text-unihub-textMuted uppercase tracking-widest mb-2">Detailed Description</label>
                                    <textarea
                                        rows={4}
                                        name="description"
                                        className="w-full border border-unihub-border rounded-2xl py-4 px-5 text-sm font-medium bg-gray-50 focus:bg-white focus:ring-4 focus:ring-unihub-teal/20 outline-none transition-all italic"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Describe the value of this event to students..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-unihub-textMuted uppercase tracking-widest mb-2">Event Date</label>
                                    <div className="relative">
                                        <Calendar className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="date" name="date" className="w-full border border-unihub-border rounded-xl py-4 pl-12 pr-4 text-sm font-bold bg-gray-50" value={formData.date} onChange={handleInputChange} required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-unihub-textMuted uppercase tracking-widest mb-2">Start Time</label>
                                    <div className="relative">
                                        <Clock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="time" name="time" className="w-full border border-unihub-border rounded-xl py-4 pl-12 pr-4 text-sm font-bold bg-gray-50" value={formData.time} onChange={handleInputChange} required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-unihub-textMuted uppercase tracking-widest mb-2">Venue / Link</label>
                                    <div className="relative">
                                        <MapPin className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="text" name="venue" className="w-full border border-unihub-border rounded-xl py-4 pl-12 pr-4 text-sm font-bold bg-gray-50" value={formData.venue} onChange={handleInputChange} required placeholder="Auditorium A" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-unihub-textMuted uppercase tracking-widest mb-2">Registration Deadline</label>
                                    <div className="relative">
                                        <Zap className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="date" name="registrationDeadline" className="w-full border border-unihub-border rounded-xl py-4 pl-12 pr-4 text-sm font-bold bg-gray-50" value={formData.registrationDeadline} onChange={handleInputChange} required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-unihub-textMuted uppercase tracking-widest mb-2">Category</label>
                                    <select name="category" className="w-full border border-unihub-border rounded-xl py-4 px-4 text-sm font-bold bg-gray-50 outline-none" value={formData.category} onChange={handleInputChange}>
                                        <option>Workshop</option>
                                        <option>Seminar</option>
                                        <option>Hackathon</option>
                                        <option>Sports</option>
                                        <option>Cultural</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-unihub-textMuted uppercase tracking-widest mb-2">Total Capacity</label>
                                    <div className="relative">
                                        <Users className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="number" name="capacity" className="w-full border border-unihub-border rounded-xl py-4 pl-12 pr-4 text-sm font-bold bg-gray-50" value={formData.capacity} onChange={handleInputChange} required />
                                    </div>
                                </div>

                                {/* Advanced System Overrides */}
                                <div className="md:col-span-2 mt-4 bg-gray-50 border border-unihub-border rounded-[20px] p-6 space-y-4">
                                    <h4 className="text-xs font-black text-unihub-text uppercase tracking-widest flex items-center gap-2">
                                        <Settings className="w-4 h-4 text-unihub-teal" /> Advanced System Overrides
                                    </h4>
                                    
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-unihub-text">Smart Reminders</p>
                                            <p className="text-[10px] font-bold text-unihub-textMuted mt-0.5">Allow system to send 3d, 1d, 3h, 30m reminders automatically.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={formData.manualOverride.remindersEnabled} onChange={(e) => setFormData({...formData, manualOverride: {...formData.manualOverride, remindersEnabled: e.target.checked}})} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-unihub-teal"></div>
                                        </label>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-unihub-text">Micro-Event Auto-Boost</p>
                                            <p className="text-[10px] font-bold text-unihub-textMuted mt-0.5">Let scheduler automatically push events with low traction.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={formData.manualOverride.boostModeEnabled} onChange={(e) => setFormData({...formData, manualOverride: {...formData.manualOverride, boostModeEnabled: e.target.checked}})} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-unihub-teal"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                        <div className="flex gap-3 pt-6">
                            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                            <button type="submit" className="btn btn-primary flex-1">
                                {editingEvent ? 'Save Changes' : 'Publish Event'}
                            </button>
                        </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Enrollment & Attendance Modal */}
            {showEnrollmentModal && selectedEvent && (
                <div className="uni-modal-overlay">
                    <div className="uni-modal max-w-3xl w-full p-8">
                        <button onClick={() => setShowEnrollmentModal(false)} className="absolute top-6 right-6 btn btn-icon btn-secondary">
                            <X className="w-4 h-4" />
                        </button>

                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-unihub-text flex items-center gap-3">
                                <Users className="w-7 h-7 text-unihub-yellow" />
                                Registrant Log
                            </h3>
                            <p className="text-sm font-medium text-unihub-textMuted italic mt-2">
                                Manage attendance for <span className="text-unihub-teal font-black">{selectedEvent.title}</span>
                            </p>
                        </div>

                        {registrants.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
                                <Users className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                                <p className="text-sm font-bold text-unihub-textMuted italic">No students have registered yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {registrants.map((reg) => (
                                    <div key={reg._id} className="flex items-center justify-between p-4 rounded-2xl border border-unihub-border hover:border-unihub-teal/30 bg-white shadow-soft transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-unihub-teal/10 flex items-center justify-center text-unihub-teal font-black text-sm">
                                                {reg.user?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-unihub-text">{reg.user?.name}</p>
                                                <p className="text-[10px] font-bold text-unihub-textMuted">{reg.user?.email}</p>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            onClick={() => handleToggleAttendance(reg.user._id, reg.attended)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                                                reg.attended 
                                                ? 'bg-unihub-teal/10 text-unihub-teal border-unihub-teal/20 shadow-sm' 
                                                : 'bg-white text-gray-400 border-gray-200 hover:bg-unihub-teal/5 hover:text-unihub-teal hover:border-unihub-teal/20'
                                            }`}
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            {reg.attended ? 'Attended' : 'Mark Attendance'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="flex gap-3 pt-6">
                            <button onClick={() => setShowEnrollmentModal(false)} className="btn btn-secondary w-full">
                                Close Log
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Event Requests Modal */}
            {showRequestsModal && (
                <div className="uni-modal-overlay">
                    <div className="uni-modal max-w-4xl w-full p-8">
                        <button onClick={() => setShowRequestsModal(false)} className="absolute top-6 right-6 btn btn-icon btn-secondary">
                            <X className="w-4 h-4" />
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
                            <button onClick={() => setShowRequestsModal(false)} className="btn btn-secondary w-full">
                                Close Panel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventManagement;
