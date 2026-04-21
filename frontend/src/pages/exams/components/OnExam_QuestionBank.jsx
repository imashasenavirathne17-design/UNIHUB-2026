import { useState, useEffect, useContext } from 'react';
import { 
    Folder, 
    FileText, 
    Plus, 
    Search, 
    Download, 
    Eye, 
    Trash2, 
    MoreVertical, 
    ArrowLeft,
    Clock,
    Calendar,
    ChevronRight,
    FileUp,
    Filter,
    X,
    Loader2,
    Save,
    CheckCircle
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AuthContext } from '../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const API = 'http://localhost:5000/api/onexam';

const OnExam_QuestionBank = () => {
    const { user } = useContext(AuthContext);
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modals
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    
    const isLecturer = user?.role.toLowerCase() === 'lecturer' || user?.role.toLowerCase() === 'admin';
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    const uploadConfig = { headers: { ...config.headers, 'Content-Type': 'multipart/form-data' } };

    const fetchFolders = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/folders`, config);
            setFolders(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPapers = async (folderId) => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/papers/${folderId}`, config);
            setPapers(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFolders();
    }, []);

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        const name = e.target.folderName.value;
        try {
            await axios.post(`${API}/folders/create`, { subject_name: name }, config);
            setIsFolderModalOpen(false);
            fetchFolders();
            Swal.fire('Success', 'Subject folder created', 'success');
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to create folder', 'error');
        }
    };

    const handleDeleteFolder = async (id, e) => {
        e.stopPropagation();
        const result = await Swal.fire({
            title: 'Delete Folder?',
            text: 'This will remove all papers inside this folder.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#14B8A6',
            cancelButtonColor: '#FF6B6B'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API}/folders/${id}`, config);
                fetchFolders();
                Swal.fire('Deleted', 'Folder removed', 'success');
            } catch (error) {
                Swal.fire('Error', 'Failed to delete folder', 'error');
            }
        }
    };

    const handleUploadPaper = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('subject_folder_id', selectedFolder._id);
        formData.append('year', e.target.year.value);
        formData.append('semester', e.target.semester.value);
        formData.append('title', e.target.title.value);
        formData.append('paper', e.target.file.files[0]);

        try {
            setLoading(true);
            await axios.post(`${API}/papers/upload`, formData, uploadConfig);
            setIsUploadModalOpen(false);
            setSelectedFile(null); // Reset selection
            fetchPapers(selectedFolder._id);
            Swal.fire('Success', 'Past paper uploaded', 'success');
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Upload failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePaper = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Paper?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#14B8A6'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API}/papers/${id}`, config);
                fetchPapers(selectedFolder._id);
                Swal.fire('Deleted', 'Paper removed', 'success');
            } catch (error) {
                Swal.fire('Error', 'Failed to delete paper', 'error');
            }
        }
    };

    const filteredFolders = folders.filter(f => 
        f.subject_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/50 p-6 rounded-[40px] border border-white/50 backdrop-blur-md shadow-soft">
                <div className="flex items-center gap-4">
                    {selectedFolder && (
                        <button 
                            onClick={() => setSelectedFolder(null)}
                            className="p-3 rounded-2xl bg-white hover:bg-gray-50 text-unihub-teal transition-all shadow-sm border border-gray-100"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight uppercase">
                            {selectedFolder ? selectedFolder.subject_name : 'Question Bank'}
                        </h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
                            {selectedFolder ? 'Repository / Papers' : 'Subject Repositories'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 flex-1 max-w-xl">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-unihub-teal transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search subjects or papers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-gray-100 focus:border-unihub-teal outline-none text-sm font-bold text-gray-600 transition-all shadow-sm"
                        />
                    </div>
                    {isLecturer && !selectedFolder && (
                        <button 
                            onClick={() => setIsFolderModalOpen(true)}
                            className="bg-unihub-teal hover:bg-[#0d857a] text-white font-black px-6 py-4 rounded-2xl transition-all shadow-lg flex items-center gap-2 text-sm whitespace-nowrap active:scale-95"
                        >
                            <Plus className="w-4 h-4" /> Create Folder
                        </button>
                    )}
                    {isLecturer && selectedFolder && (
                        <button 
                            onClick={() => setIsUploadModalOpen(true)}
                            className="bg-unihub-teal hover:bg-[#0d857a] text-white font-black px-6 py-4 rounded-2xl transition-all shadow-lg flex items-center gap-2 text-sm whitespace-nowrap active:scale-95"
                        >
                            <FileUp className="w-4 h-4" /> Upload Paper
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-unihub-teal" />
                    <p className="font-bold text-sm tracking-widest uppercase">Initializing Repository...</p>
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    {!selectedFolder ? (
                        <motion.div 
                            key="folders"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {filteredFolders.map(folder => (
                                <div 
                                    key={folder._id}
                                    onClick={() => { setSelectedFolder(folder); fetchPapers(folder._id); }}
                                    className="group bg-white/80 backdrop-blur-md rounded-[40px] p-8 border border-white shadow-soft hover:shadow-card transition-all cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-2 h-full bg-unihub-teal opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="w-14 h-14 rounded-3xl bg-unihub-teal/10 flex items-center justify-center text-unihub-teal group-hover:bg-unihub-teal group-hover:text-white transition-all shadow-sm">
                                            <Folder className="w-6 h-6" />
                                        </div>
                                        {isLecturer && (
                                            <button 
                                                onClick={(e) => handleDeleteFolder(folder._id, e)}
                                                className="p-3 text-gray-300 hover:text-unihub-coral hover:bg-unihub-coral/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    
                                    <h3 className="text-xl font-black text-gray-800 leading-tight mb-2 uppercase tracking-tight group-hover:text-unihub-teal transition-colors line-clamp-2">
                                        {folder.subject_name}
                                    </h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">
                                        Managed by {folder.created_by?.name?.split(' ')[0] || 'Lecturer'}
                                    </p>
                                    
                                    <div className="flex items-center text-unihub-teal text-[10px] font-black uppercase tracking-widest gap-2">
                                        View Contents <ChevronRight className="w-3 h-3" />
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="papers"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white/80 backdrop-blur-md rounded-[40px] border border-white shadow-soft overflow-hidden"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-50">
                                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Document Title</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Year</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Semester</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Size</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50/50">
                                        {papers.map(paper => (
                                            <tr key={paper._id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-unihub-yellow/10 flex items-center justify-center text-unihub-yellow">
                                                            <FileText className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-black text-gray-700 tracking-tight">{paper.title}</div>
                                                            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Uploaded {new Date(paper.createdAt).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className="px-4 py-1.5 rounded-full bg-gray-100 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                        {paper.year}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className="text-[10px] font-black text-unihub-teal uppercase tracking-widest px-4 py-1.5 bg-unihub-teal/10 rounded-full border border-unihub-teal/10">
                                                        {paper.semester}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        {paper.file_size}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <a 
                                                            href={`http://localhost:5000${paper.file_url}`} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="p-3 text-unihub-teal hover:bg-unihub-teal/10 rounded-xl transition-all shadow-sm bg-white border border-gray-100"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </a>
                                                        <a 
                                                            href={`http://localhost:5000${paper.file_url}`} 
                                                            download 
                                                            className="p-3 text-unihub-yellow hover:bg-unihub-yellow/10 rounded-xl transition-all shadow-sm bg-white border border-gray-100"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                        {isLecturer && (
                                                            <button 
                                                                onClick={() => handleDeletePaper(paper._id)}
                                                                className="p-3 text-unihub-coral hover:bg-unihub-coral/10 rounded-xl transition-all shadow-sm bg-white border border-gray-100"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {papers.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <FileText className="w-12 h-12 text-gray-100" />
                                                        <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">No past papers found in this subject</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* MODALS */}
            {isFolderModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
                    <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={() => setIsFolderModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10">
                        <h3 className="text-2xl font-black text-gray-800 tracking-tight uppercase mb-8">New Subject Repository</h3>
                        <form onSubmit={handleCreateFolder} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Subject Name</label>
                                <input 
                                    name="folderName"
                                    type="text" 
                                    required
                                    placeholder="e.g. Distributed Systems"
                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-unihub-teal outline-none text-sm font-bold text-gray-600 transition-all"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsFolderModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 px-6 py-4 rounded-2xl bg-unihub-teal text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-unihub-teal/20 transition-all active:scale-95">Initialize Folder</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isUploadModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
                    <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={() => setIsUploadModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-[48px] shadow-2xl p-12">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Upload Past Paper</h3>
                                <p className="text-[10px] text-unihub-teal font-black uppercase tracking-widest mt-1">Repository: {selectedFolder.subject_name}</p>
                            </div>
                            <button onClick={() => { setIsUploadModalOpen(false); setSelectedFile(null); }} className="p-3 rounded-2xl hover:bg-gray-50 text-gray-400"><X /></button>
                        </div>
                        
                        <form onSubmit={handleUploadPaper} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Document Title</label>
                                <input name="title" type="text" required placeholder="e.g. 2023 End Semester Paper" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-unihub-teal outline-none text-sm font-bold" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Academic Year</label>
                                    <input name="year" type="number" required placeholder="2024" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-unihub-teal outline-none text-sm font-bold" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Semester</label>
                                    <select name="semester" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-unihub-teal outline-none text-sm font-bold cursor-pointer">
                                        <option>Semester 1</option>
                                        <option>Semester 2</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">PDF Document</label>
                                <div className="relative group cursor-pointer">
                                    <input 
                                        name="file" 
                                        type="file" 
                                        accept=".pdf" 
                                        required 
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                        onChange={(e) => setSelectedFile(e.target.files[0])}
                                    />
                                    <div className={`p-10 border-2 border-dashed rounded-[32px] flex flex-col items-center gap-3 transition-all ${selectedFile ? 'border-unihub-teal bg-unihub-teal/5' : 'border-gray-100 bg-gray-50/50 group-hover:border-unihub-teal'}`}>
                                        {selectedFile ? (
                                            <CheckCircle className="w-8 h-8 text-unihub-teal animate-in zoom-in duration-300" />
                                        ) : (
                                            <FileUp className="w-8 h-8 text-unihub-teal opacity-40 group-hover:opacity-100 group-hover:-translate-y-1 transition-all" />
                                        )}
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${selectedFile ? 'text-unihub-teal' : 'text-gray-400'}`}>
                                            {selectedFile ? `READY: ${selectedFile.name}` : 'Select PDF Candidate (Max 10MB)'}
                                        </span>
                                        {selectedFile && (
                                            <p className="text-[9px] font-bold text-unihub-teal/60 uppercase tracking-tighter">
                                                Click to swap candidate
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full py-5 rounded-[28px] bg-unihub-teal text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-unihub-teal/30 transition-all active:scale-95 flex items-center justify-center gap-3">
                                {loading ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />}
                                Sync To Repository
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OnExam_QuestionBank;
