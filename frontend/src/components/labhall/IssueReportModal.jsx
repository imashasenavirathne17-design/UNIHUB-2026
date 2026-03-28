import React, { useState } from 'react';
import { AlertTriangle, X, CheckCircle, Zap } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const API = 'http://localhost:5000/api/labhall';

const PRIORITIES = [
    { value: 'low', label: '🟢 Low', desc: 'Minor inconvenience' },
    { value: 'medium', label: '🟡 Medium', desc: 'Affects usability' },
    { value: 'high', label: '🟠 High', desc: 'Significant problem' },
    { value: 'critical', label: '🔴 Critical', desc: 'Room unusable!' },
];

const IssueReportModal = ({ rooms, userToken, onClose }) => {
    const [roomId, setRoomId] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!roomId || !description.trim()) return;
        setLoading(true);
        try {
            await axios.post(`${API}/issues`, { roomId, description, priority }, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            await Swal.fire({
                title: 'Issue Reported!',
                text: 'Thank you. The facilities team has been notified.',
                icon: 'success',
                confirmButtonColor: '#14B8A6',
                timer: 2500,
                showConfirmButton: false
            });
            onClose();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to report issue', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="uni-modal-overlay">
            <div className="uni-modal max-w-lg w-full overflow-hidden">
                {/* Teal header bar */}
                <div className="px-7 py-5 border-b border-unihub-borderLight flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-unihub-coral/10 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-4.5 h-4.5 text-unihub-coral" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-base font-semibold text-unihub-text">Report an Issue</h2>
                        <p className="text-xs text-unihub-textMuted mt-0.5">Help us keep facilities running smoothly</p>
                    </div>
                    <button onClick={onClose} className="btn btn-icon btn-secondary flex-shrink-0">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-7 space-y-5">
                    {/* Room Selector */}
                    <div>
                        <label className="uni-label">Affected Room</label>
                        <select value={roomId} onChange={e => setRoomId(e.target.value)} required
                            className="uni-input">
                            <option value="">Select a room...</option>
                            {rooms.map(r => (
                                <option key={r._id} value={r._id}>{r.name} (Floor {r.floor} — {r.type})</option>
                            ))}
                        </select>
                    </div>

                    {/* Priority Selector */}
                    <div>
                        <label className="uni-label">Priority Level</label>
                        <div className="grid grid-cols-2 gap-2">
                            {PRIORITIES.map(p => (
                                <button key={p.value} type="button" onClick={() => setPriority(p.value)}
                                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                                        priority === p.value
                                            ? 'border-unihub-coral bg-unihub-coral/5'
                                            : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                                    }`}>
                                    <p className="font-semibold text-sm text-unihub-text">{p.label}</p>
                                    <p className="text-xs text-unihub-textMuted">{p.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="uni-label">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} required
                            placeholder="e.g. Projector is broken, PC #14 has no keyboard..."
                            className="uni-input resize-none" />
                    </div>

                    <button type="submit" disabled={loading}
                        className="btn btn-primary btn-lg w-full">
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Zap className="w-4 h-4" />
                        )}
                        {loading ? 'Submitting...' : 'Submit Report'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default IssueReportModal;
