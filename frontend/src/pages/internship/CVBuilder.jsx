import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
    Download, 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    FileText, 
    Plus, 
    Trash2, 
    GraduationCap, 
    Briefcase, 
    Zap,
    Layers,
    ChevronRight,
    Sparkles
} from 'lucide-react';

const LEVELS = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];

const CVBuilder = () => {
    const { user } = useContext(AuthContext);
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        summary: '',
        skills: [{ name: '', level: 3 }],
        experience: [{ title: '', company: '', period: '', description: '' }],
        education: [{ degree: '', institution: '', year: '', gpa: '' }],
    });

    const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const updateList = (field, index, key, value) => {
        const updated = [...form[field]];
        updated[index] = { ...updated[index], [key]: value };
        setForm(f => ({ ...f, [field]: updated }));
    };

    const addItem = (field, template) => setForm(f => ({ ...f, [field]: [...f[field], template] }));
    const removeItem = (field, index) => setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== index) }));

    const generatePDF = () => {
        const doc = new jsPDF();
        const teal = [20, 184, 166];
        const dark = [31, 41, 55];
        const muted = [107, 114, 128];

        // Header
        doc.setFillColor(...teal);
        doc.rect(0, 0, 210, 38, 'F');
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(form.name || 'Your Name', 14, 18);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text([form.email, form.phone, form.address].filter(Boolean).join('  |  '), 14, 28);

        let y = 48;
        const section = (title) => {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...teal);
            doc.text(title.toUpperCase(), 14, y);
            doc.setDrawColor(...teal);
            doc.setLineWidth(0.4);
            doc.line(14, y + 2, 196, y + 2);
            y += 8;
        };

        const text = (str, x = 14, size = 10) => {
            doc.setFontSize(size);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...dark);
            const lines = doc.splitTextToSize(str, 180);
            doc.text(lines, x, y);
            y += lines.length * 5 + 2;
        };

        if (form.summary) { section('Professional Summary'); text(form.summary); y += 4; }

        if (form.experience.some(e => e.title)) {
            section('Work Experience');
            form.experience.forEach(exp => {
                if (!exp.title) return;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(...dark);
                doc.text(exp.title, 14, y);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...muted);
                doc.text(`${exp.company}  ·  ${exp.period}`, 14, y + 5);
                y += 10;
                if (exp.description) { doc.setTextColor(...dark); text(exp.description); }
                y += 2;
            });
        }

        if (form.education.some(e => e.degree)) {
            section('Education');
            autoTable(doc, {
                startY: y,
                head: [['Degree', 'Institution', 'Year', 'GPA']],
                body: form.education.filter(e => e.degree).map(e => [e.degree, e.institution, e.year, e.gpa]),
                styles: { fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: teal, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                margin: { left: 14, right: 14 },
            });
            y = doc.lastAutoTable.finalY + 8;
        }

        if (form.skills.some(s => s.name)) {
            section('Skills');
            autoTable(doc, {
                startY: y,
                head: [['Skill', 'Proficiency Level']],
                body: form.skills.filter(s => s.name).map(s => [s.name, LEVELS[s.level - 1]]),
                styles: { fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: teal, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                margin: { left: 14, right: 14 },
            });
        }

        doc.save(`${form.name || 'cv'}_UniHub_Portfolio.pdf`);
    };

    const sectionClass = "glass-card p-10 border border-white/60 shadow-2xl relative overflow-hidden group mb-10";
    const inputClass = "w-full uni-input bg-white/40 border-white/40 focus:bg-white/80 p-4 text-sm font-medium font-display transition-all duration-300";
    const labelClass = "block text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.2em] mb-2.5 opacity-60 ml-1 font-display";

    return (
        <div className="max-w-5xl mx-auto py-10 px-6 space-y-10 pb-20">
            {/* Hero Section */}
            <div className="relative overflow-hidden py-16 md:py-24 rounded-[40px] shadow-2xl glass group mb-10">
                <div className="absolute inset-0 -z-10 group-hover:scale-110 transition-transform duration-1000">
                    <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-unihub-teal/20 blur-[100px] rounded-full" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-unihub-coral/20 blur-[100px] rounded-full" />
                </div>

                <div className="px-10 md:px-16 relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="max-w-2xl space-y-6 text-center md:text-left">
                        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-unihub-teal/10 border border-unihub-teal/20 text-[11px] font-black text-unihub-teal uppercase tracking-[0.2em] shadow-sm font-display mb-2">
                            <Sparkles className="w-4 h-4" /> AI Asset Forge
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-unihub-text leading-[1.1] tracking-tighter font-display">
                            Auto <span className="text-gradient">Portfolio Builder</span>.
                        </h1>
                        <p className="text-unihub-textMuted font-medium text-base md:text-lg max-w-xl leading-relaxed italic">
                            Synthesize your professional history into a premium, high-fidelity PDF instantly. Articulate your value to industry leaders.
                        </p>
                    </div>

                    <button
                        onClick={generatePDF}
                        className="btn btn-primary px-12 py-5 rounded-[24px] font-black text-[13px] tracking-[0.2em] shadow-2xl hover:shadow-unihub-teal/30 active:scale-95 group/btn font-display uppercase flex items-center gap-3"
                    >
                        <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                        Download Portfolio
                    </button>
                </div>
            </div>

            {/* Personal Info */}
            <div className={sectionClass}>
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-unihub-teal/10 flex items-center justify-center text-unihub-teal shadow-inner">
                        <User className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl font-black text-unihub-text font-display uppercase tracking-tighter">Core Identity</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                    {[
                        ['name', 'Full Name', <User className="w-4 h-4" />],
                        ['email', 'Engagement Email', <Mail className="w-4 h-4" />],
                        ['phone', 'Direct Link (Phone)', <Phone className="w-4 h-4" />],
                        ['address', 'Physical Node (Address)', <MapPin className="w-4 h-4" />]
                    ].map(([field, label, icon]) => (
                        <div key={field} className="space-y-1">
                            <label className={labelClass}>{label}</label>
                            <div className="relative group/input">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-unihub-teal transition-colors">
                                    {icon}
                                </div>
                                <input className={`${inputClass} pl-12`} value={form[field]} onChange={e => update(field, e.target.value)} placeholder={label} />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8 relative z-10">
                    <label className={labelClass}>Strategic Summary</label>
                    <textarea className={`${inputClass} min-h-[120px] leading-relaxed italic`} rows={4} value={form.summary} onChange={e => update('summary', e.target.value)} placeholder="Articulate your value proposition and career trajectory..." />
                </div>
                
                {/* Decor */}
                <div className="absolute top-[-10%] right-[-5%] w-32 h-32 bg-unihub-teal/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Skills */}
            <div className={sectionClass}>
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-unihub-teal/10 flex items-center justify-center text-unihub-teal shadow-inner">
                            <Zap className="w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-black text-unihub-text font-display uppercase tracking-tighter">Verified Skills</h2>
                    </div>
                    <button onClick={() => addItem('skills', { name: '', level: 3 })} className="btn btn-glass px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/60">
                        <Plus className="w-4 h-4" /> ADD ASSET
                    </button>
                </div>
                
                <div className="space-y-4 relative z-10">
                    {form.skills.map((skill, i) => (
                        <div key={i} className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${i * 100}ms` }}>
                            <div className="flex-1 relative group/input">
                                <input className={inputClass} value={skill.name} onChange={e => updateList('skills', i, 'name', e.target.value)} placeholder="e.g. React.js, Strategic Planning" />
                            </div>
                            <div className="w-48">
                                <select className="w-full uni-input bg-white/40 border-white/40 focus:bg-white/80 p-4 text-xs font-black uppercase tracking-widest cursor-pointer" value={skill.level} onChange={e => updateList('skills', i, 'level', +e.target.value)}>
                                    {LEVELS.map((l, idx) => <option key={l} value={idx + 1}>{l}</option>)}
                                </select>
                            </div>
                            <button onClick={() => removeItem('skills', i)} className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-400 hover:text-unihub-coral hover:bg-unihub-coral/10 transition-all active:scale-95">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Work Experience */}
            <div className={sectionClass}>
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-unihub-teal/10 flex items-center justify-center text-unihub-teal shadow-inner">
                            <Briefcase className="w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-black text-unihub-text font-display uppercase tracking-tighter">Experience Logs</h2>
                    </div>
                    <button onClick={() => addItem('experience', { title: '', company: '', period: '', description: '' })} className="btn btn-glass px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/60">
                        <Plus className="w-4 h-4" /> ADD LOG
                    </button>
                </div>

                <div className="space-y-8 relative z-10">
                    {form.experience.map((exp, i) => (
                        <div key={i} className="glass p-8 rounded-[32px] border border-white/40 relative group/entry animate-in fade-in slide-in-from-bottom-6" style={{ animationDelay: `${i * 150}ms` }}>
                            <button onClick={() => removeItem('experience', i)} className="absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-unihub-coral hover:bg-white transition-all active:scale-90">
                                <Trash2 className="w-4.5 h-4.5" />
                            </button>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-1">
                                    <label className={labelClass}>Professional Role</label>
                                    <input className={inputClass} value={exp.title} onChange={e => updateList('experience', i, 'title', e.target.value)} placeholder="Strategic Lead / Developer" />
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClass}>Organization</label>
                                    <input className={inputClass} value={exp.company} onChange={e => updateList('experience', i, 'company', e.target.value)} placeholder="Nexus Corporation" />
                                </div>
                                <div className="sm:col-span-2 space-y-1">
                                    <label className={labelClass}>Temporal Span (Period)</label>
                                    <input className={inputClass} value={exp.period} onChange={e => updateList('experience', i, 'period', e.target.value)} placeholder="e.g. Jan 2024 - Present" />
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <label className={labelClass}>Impact Narrative (Description)</label>
                                <textarea className={`${inputClass} min-h-[100px] leading-relaxed italic opacity-80`} rows={3} value={exp.description} onChange={e => updateList('experience', i, 'description', e.target.value)} placeholder="Detail your core contributions and strategic results..." />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Education */}
            <div className={sectionClass}>
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-unihub-teal/10 flex items-center justify-center text-unihub-teal shadow-inner">
                            <GraduationCap className="w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-black text-unihub-text font-display uppercase tracking-tighter">Academic Assets</h2>
                    </div>
                    <button onClick={() => addItem('education', { degree: '', institution: '', year: '', gpa: '' })} className="btn btn-glass px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/60">
                        <Plus className="w-4 h-4" /> ADD ASSET
                    </button>
                </div>

                <div className="space-y-8 relative z-10">
                    {form.education.map((edu, i) => (
                        <div key={i} className="glass p-8 rounded-[32px] border border-white/40 relative group/entry animate-in fade-in slide-in-from-bottom-6" style={{ animationDelay: `${i * 150}ms` }}>
                            <button onClick={() => removeItem('education', i)} className="absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-unihub-coral hover:bg-white transition-all active:scale-90">
                                <Trash2 className="w-4.5 h-4.5" />
                            </button>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className={labelClass}>Degree / Specialization</label>
                                    <input className={inputClass} value={edu.degree} onChange={e => updateList('education', i, 'degree', e.target.value)} placeholder="B.Sc. in Computer Science" />
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClass}>Institution</label>
                                    <input className={inputClass} value={edu.institution} onChange={e => updateList('education', i, 'institution', e.target.value)} placeholder="University of Nexus" />
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClass}>Fulfillment Year</label>
                                    <input className={inputClass} value={edu.year} onChange={e => updateList('education', i, 'year', e.target.value)} placeholder="2026" />
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClass}>Academic Index (GPA)</label>
                                    <input className={inputClass} value={edu.gpa} onChange={e => updateList('education', i, 'gpa', e.target.value)} placeholder="3.8 / 4.0" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-6 pt-10">
                <button 
                    onClick={generatePDF} 
                    className="btn btn-primary px-16 py-6 rounded-[28px] font-black text-[15px] tracking-[0.3em] shadow-2xl hover:shadow-unihub-teal/30 active:scale-95 group/btn font-display uppercase flex items-center justify-center gap-4"
                >
                    <Download className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    Finalize & Dispatch Portfolio
                </button>
            </div>
            
            {/* System Node Info */}
            <p className="text-center text-[10px] font-black text-unihub-textMuted opacity-20 uppercase tracking-[0.6em] pt-16">
                CV Core Node · SYNTH-v2.6
            </p>
        </div>
    );
};

export default CVBuilder;
