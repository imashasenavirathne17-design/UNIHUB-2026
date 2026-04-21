import { useState, useEffect, useRef } from 'react';
import { 
    X, 
    Save, 
    AlertCircle, 
    FileUp, 
    Video, 
    BookOpen, 
    Clock, 
    Calendar,
    Loader2
} from 'lucide-react';
import axios from 'axios';

const OnKuppi_SessionForm = ({ open, onClose, onSave, editingSession, user }) => {
    const [formData, setFormData] = useState({
        subject: '',
        year: '1st Year',
        semester: 'Semester 1',
        date: '',
        time: '',
        description: '',
        teams_link: '',
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (editingSession) {
            setFormData({
                subject: editingSession.subject,
                year: editingSession.year || '1st Year',
                semester: editingSession.semester,
                date: new Date(editingSession.date).toISOString().split('T')[0],
                time: editingSession.time,
                description: editingSession.description || '',
                teams_link: editingSession.teams_link,
            });
        } else {
            setFormData({
                subject: '',
                year: '1st Year',
                semester: 'Semester 1',
                date: '',
                time: '',
                description: '',
                teams_link: '',
            });
        }
        setFile(null);
        setError(null);
    }, [editingSession, open]);

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (file) data.append('material', file);

        try {
            await onSave(data, editingSession?._id);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to sync session data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative bg-white w-full max-w-2xl max-h-[95vh] rounded-[48px] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white relative z-10 shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[24px] bg-unihub-teal/10 border border-unihub-teal/20 flex items-center justify-center text-unihub-teal shadow-sm">
                            <Video className="w-8 h-8 fill-unihub-teal/10" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-800 tracking-tight leading-none uppercase">
                                {editingSession ? 'Edit' : 'Create'} Kuppi Session
                            </h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.4em] mt-1.5">Revision Sync Engine</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 rounded-[24px] hover:bg-unihub-coral/10 hover:text-unihub-coral text-gray-400 transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                    {error && (
                        <div className="flex items-center gap-4 p-6 bg-unihub-coral/5 text-unihub-coral rounded-[32px] text-sm font-black border border-unihub-coral/10">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Subject */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Subject Name</label>
                            <div className="relative group">
                                <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-unihub-teal transition-all" />
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full pl-16 pr-8 py-5 rounded-[28px] bg-gray-50 border border-transparent focus:border-unihub-teal transition-all text-sm font-black text-gray-700 outline-none placeholder:text-gray-300"
                                    placeholder="e.g. Database Systems"
                                />
                            </div>
                        </div>

                        {/* Year */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Academic Year</label>
                            <select
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                className="w-full px-8 py-5 rounded-[28px] bg-gray-50 border border-transparent focus:border-unihub-teal transition-all text-sm font-black text-gray-700 outline-none appearance-none cursor-pointer"
                            >
                                <option>1st Year</option>
                                <option>2nd Year</option>
                                <option>3rd Year</option>
                                <option>4th Year</option>
                            </select>
                        </div>

                        {/* Semester */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Semester</label>
                            <select
                                value={formData.semester}
                                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                className="w-full px-8 py-5 rounded-[28px] bg-gray-50 border border-transparent focus:border-unihub-teal transition-all text-sm font-black text-gray-700 outline-none appearance-none cursor-pointer"
                            >
                                <option>Semester 1</option>
                                <option>Semester 2</option>
                            </select>
                        </div>

                        {/* Date */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Session Date</label>
                            <div className="relative group">
                                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-unihub-teal transition-all" />
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full pl-16 pr-8 py-5 rounded-[28px] bg-gray-50 border border-transparent focus:border-unihub-teal transition-all text-sm font-black text-gray-700 outline-none"
                                />
                            </div>
                        </div>

                        {/* Time */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Session Time</label>
                            <div className="relative group">
                                <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-unihub-teal transition-all" />
                                <input
                                    type="time"
                                    required
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full pl-16 pr-8 py-5 rounded-[28px] bg-gray-50 border border-transparent focus:border-unihub-teal transition-all text-sm font-black text-gray-700 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Microsoft Teams Link */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Microsoft Teams Link</label>
                        <div className="relative group">
                            <Video className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-unihub-teal transition-all" />
                            <input
                                type="url"
                                required
                                value={formData.teams_link}
                                onChange={(e) => setFormData({ ...formData, teams_link: e.target.value })}
                                className="w-full pl-16 pr-8 py-5 rounded-[28px] bg-gray-50 border border-transparent focus:border-unihub-teal transition-all text-sm font-black text-gray-700 outline-none placeholder:text-gray-300"
                                placeholder="https://teams.microsoft.com/l/meetup-join/..."
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Description (Optional)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-8 py-5 rounded-[28px] bg-gray-50 border border-transparent focus:border-unihub-teal transition-all text-sm font-black text-gray-700 outline-none placeholder:text-gray-300 min-h-[120px] resize-none"
                            placeholder="Briefly describe what topics will be covered..."
                        />
                    </div>

                    {/* File Upload */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Session Materials (PDF/DOCX)</label>
                        <div 
                            onClick={() => fileInputRef.current.click()}
                            className="flex flex-col items-center justify-center p-12 rounded-[40px] border-2 border-dashed border-gray-100 hover:border-unihub-teal/30 hover:bg-unihub-teal/5 transition-all cursor-pointer group"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => setFile(e.target.files[0])}
                                className="hidden"
                                accept=".pdf,.docx"
                            />
                            <div className="w-16 h-16 rounded-[24px] bg-white shadow-xl flex items-center justify-center text-unihub-teal group-hover:scale-110 transition-transform mb-4">
                                <FileUp className="w-8 h-8" />
                            </div>
                            <p className="text-sm font-black text-gray-600 uppercase tracking-widest group-hover:text-unihub-teal transition-colors">
                                {file ? file.name : 'Choose Materials'}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Max 10MB candidate extracted</p>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-8 border-t border-gray-100 bg-white shrink-0 flex justify-end gap-6 relative z-10">
                    <button
                        onClick={onClose}
                        className="px-10 py-5 rounded-[28px] font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 transition-all border-2 border-transparent hover:border-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-14 py-5 rounded-[28px] bg-unihub-teal hover:bg-[#0d857a] text-white font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-2xl shadow-unihub-teal/20 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {editingSession ? 'Update Session' : 'Publish Session'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnKuppi_SessionForm;
