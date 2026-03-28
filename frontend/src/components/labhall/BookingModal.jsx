import React, { useState } from 'react';
import { X, Clock, Calendar, CheckCircle, RefreshCw } from 'lucide-react';

const BookingModal = ({ room, selectedDate, onClose, onBook, loading, initialStartTime, editingBooking }) => {
    const calculateEndTime = (start) => {
        if (!start) return '09:00';
        const [hours, minutes] = start.split(':').map(Number);
        const endHours = (hours + 1).toString().padStart(2, '0');
        return `${endHours}:${minutes.toString().padStart(2, '0')}`;
    };

    const [startTime, setStartTime] = useState(
        editingBooking ? editingBooking.startTime : (initialStartTime || '08:00')
    );
    const [endTime, setEndTime] = useState(
        editingBooking ? editingBooking.endTime : calculateEndTime(initialStartTime || '08:00')
    );
    const [recurrence, setRecurrence] = useState('none');
    const [recurrenceWeeks, setRecurrenceWeeks] = useState(12);

    const handleSubmit = (e) => {
        e.preventDefault();
        onBook({ roomId: room._id, date: selectedDate, startTime, endTime, recurrence, recurrenceWeeks });
    };

    return (
        <div className="uni-modal-overlay">
            <div className="uni-modal max-w-lg w-full">
                <button onClick={onClose} className="absolute top-5 right-5 btn btn-icon btn-secondary">
                    <X className="w-4 h-4" />
                </button>

                <div className="p-8">
                    <div className="flex items-center gap-4 mb-7">
                        <div className="w-12 h-12 rounded-xl bg-unihub-teal flex items-center justify-center text-white font-bold text-xl shadow-sm">
                            {room.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-unihub-text">{editingBooking ? 'Edit' : 'Book'} {room.name}</h2>
                            <p className="text-xs text-unihub-textMuted capitalize mt-0.5">{room.type} · Floor {room.floor}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="uni-label">Start Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-unihub-teal pointer-events-none" />
                                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                                        className="uni-input pl-10" required />
                                </div>
                            </div>
                            <div>
                                <label className="uni-label">End Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-unihub-teal pointer-events-none" />
                                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                                        className="uni-input pl-10" required />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl glass-dark flex items-center gap-3">
                            <Calendar className="w-4.5 h-4.5 text-unihub-teal flex-shrink-0" />
                            <div>
                                <p className="uni-label mb-0">Selected Date</p>
                                <p className="text-sm font-medium text-unihub-text">{new Date(selectedDate).toDateString()}</p>
                            </div>
                        </div>

                        {!editingBooking && (
                            <div className="space-y-3">
                                <label className="uni-label">Recurrence</label>
                                <div className="flex gap-3">
                                    {['none', 'weekly'].map(opt => (
                                        <button key={opt} type="button" onClick={() => setRecurrence(opt)}
                                            className={`flex-1 py-2.5 rounded-xl font-medium text-sm capitalize transition-all ${
                                                recurrence === opt
                                                    ? 'btn btn-primary'
                                                    : 'btn btn-secondary'
                                            }`}>
                                            {opt === 'none' ? '🗓 One-time' : '🔁 Weekly Repeat'}
                                        </button>
                                    ))}
                                </div>
                                {recurrence === 'weekly' && (
                                    <div className="p-4 rounded-xl glass-dark flex items-center gap-3">
                                        <RefreshCw className="w-4 h-4 text-unihub-teal flex-shrink-0" style={{ animation: 'spin 3s linear infinite' }} />
                                        <div className="flex-1">
                                            <p className="uni-label mb-1">Repeat for how many weeks?</p>
                                            <input type="number" min={2} max={20} value={recurrenceWeeks}
                                                onChange={(e) => setRecurrenceWeeks(Number(e.target.value))}
                                                className="uni-input py-2" />
                                        </div>
                                        <span className="text-xs text-unihub-textMuted font-medium">{recurrenceWeeks} slots</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="btn btn-primary btn-lg w-full">
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <CheckCircle className="w-4.5 h-4.5" />
                            )}
                            {loading ? 'Processing...' : editingBooking ? 'Update Changes' : recurrence === 'weekly' ? `Book ${recurrenceWeeks} Weeks` : 'Confirm Booking'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
