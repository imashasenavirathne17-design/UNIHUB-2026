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
    Sparkles,
    Github,
    Linkedin,
    Globe
} from 'lucide-react';

const LEVELS = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];

const CVBuilder = () => {
    const { user } = useContext(AuthContext);
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        github: '',
        linkedin: '',
        portfolio: '',
        summary: '',
        skills: [{ name: '', level: 3 }],
        experience: [{ title: '', company: '', period: '', description: '' }],
        projects: [{ title: '', role: '', period: '', description: '' }],
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
        const light = [241, 245, 249];

        let y = 20;
        const pageHeight = 290;
        
        const checkPage = (heightNeeded) => {
            if (y + heightNeeded > pageHeight) {
                doc.addPage();
                y = 20;
            }
        };

        // Header Section (Centered)
        doc.setFontSize(28);
        doc.setTextColor(...teal);
        doc.setFont('helvetica', 'bold');
        const nameText = (form.name || 'Your Name').toUpperCase();
        const nameWidth = doc.getTextWidth(nameText);
        doc.text(nameText, 105 - (nameWidth / 2), y);
        y += 8;

        doc.setFontSize(10.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...dark);
        const contactInfo = [form.phone, form.email, form.address].filter(Boolean).join('  |  ');
        if (contactInfo) {
            const contactWidth = doc.getTextWidth(contactInfo);
            doc.text(contactInfo, 105 - (contactWidth / 2), y);
            y += 6;
        }

        doc.setTextColor(...muted);
        doc.setFontSize(10);
        const linksInfo = [form.linkedin, form.github, form.portfolio].filter(Boolean).join('  |  ');
        if (linksInfo) {
            const linksWidth = doc.getTextWidth(linksInfo);
            doc.text(linksInfo, 105 - (linksWidth / 2), y);
            y += 9;
        } else {
            y += 3;
        }

        // Divider
        doc.setDrawColor(...teal);
        doc.setLineWidth(0.6);
        doc.line(14, y, 196, y);
        y += 10;

        const sectionTitle = (title) => {
            checkPage(18);
            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...teal);
            doc.text(title.toUpperCase(), 14, y);
            y += 8;
        };

        const renderBulletPoints = (str, x = 14) => {
            if (!str) return;
            const points = String(str).split('\n').filter(p => p.trim());
            
            points.forEach(p => {
                doc.setFontSize(10.5);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...dark);
                doc.text('•', x, y);
                const lines = doc.splitTextToSize(p.trim(), 196 - (x + 5));
                checkPage(lines.length * 5.5);
                doc.text(lines, x + 5, y);
                y += lines.length * 5.5 + 1;
            });
            y += 3;
        };

        const renderText = (str, x = 14, size = 10.5, isItalic = false, isBold = false, color = dark) => {
            if (!str) return;
            doc.setFontSize(size);
            const style = isBold ? (isItalic ? 'bolditalic' : 'bold') : (isItalic ? 'italic' : 'normal');
            doc.setFont('helvetica', style);
            doc.setTextColor(...color);
            const lines = doc.splitTextToSize(String(str), 196 - x);
            checkPage(lines.length * 5.5);
            doc.text(lines, x, y);
            y += lines.length * 5.5 + 1;
        };

        if (form.summary) { 
            sectionTitle('Professional Summary'); 
            renderText(form.summary, 14, 10.5); 
            y += 6; 
        }

        if (form.experience.some(e => e.title)) {
            sectionTitle('Work Experience');
            form.experience.forEach(exp => {
                if (!exp.title) return;
                checkPage(18);
                
                doc.setFontSize(11.5);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...dark);
                doc.text(exp.title, 14, y);

                if (exp.period) {
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'italic');
                    doc.setTextColor(...muted);
                    const periodWidth = doc.getTextWidth(exp.period);
                    doc.text(exp.period, 196 - periodWidth, y);
                }
                
                y += 6;
                renderText(exp.company, 14, 11, true, false, teal);
                y += 2;
                if (exp.description) {
                    renderBulletPoints(exp.description, 14);
                }
                y += 5;
            });
        }
        
        if (form.projects && form.projects.some(p => p.title)) {
            sectionTitle('Projects');
            form.projects.forEach(proj => {
                if (!proj.title) return;
                checkPage(18);
                
                doc.setFontSize(11.5);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...dark);
                doc.text(proj.title, 14, y);

                if (proj.period) {
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'italic');
                    doc.setTextColor(...muted);
                    const periodWidth = doc.getTextWidth(proj.period);
                    doc.text(proj.period, 196 - periodWidth, y);
                }
                
                y += 6;
                if (proj.role) {
                    renderText(proj.role, 14, 10.5, true, false, teal);
                    y += 2;
                }
                if (proj.description) {
                    renderBulletPoints(proj.description, 14);
                }
                y += 5;
            });
        }

        if (form.education.some(e => e.degree)) {
            sectionTitle('Education');
            form.education.forEach(edu => {
                if (!edu.degree) return;
                checkPage(15);

                doc.setFontSize(11.5);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...dark);
                doc.text(edu.degree, 14, y);

                if (edu.year) {
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'italic');
                    doc.setTextColor(...muted);
                    const yearWidth = doc.getTextWidth(edu.year);
                    doc.text(edu.year, 196 - yearWidth, y);
                }
                
                y += 6;
                renderText(edu.institution, 14, 11, true, false, teal);
                if (edu.gpa) {
                    renderText(`GPA: ${edu.gpa}`, 14, 10, false, true, muted);
                }
                y += 6;
            });
        }

        if (form.skills.some(s => s.name)) {
            sectionTitle('Skills');
            checkPage(24);
            
            const activeSkills = form.skills.filter(s => s.name);
            let skillX = 14;
            
            activeSkills.forEach((skill) => {
                const label = `${skill.name} (${LEVELS[skill.level - 1]})`;
                // Add more padding to skill pills to make them bigger
                doc.setFontSize(10);
                const width = doc.getTextWidth(label) + 12;
                
                if (skillX + width > 196) {
                    skillX = 14;
                    y += 9;
                    checkPage(12);
                }
                
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...dark);
                
                doc.setFillColor(...light);
                doc.roundedRect(skillX, y - 5, width, 7.5, 1.5, 1.5, 'F');
                doc.text(label, skillX + 6, y);
                
                skillX += width + 5;
            });
        }

        doc.save(`${form.name || 'cv'}_UniHub_Portfolio.pdf`);
    };

    const sectionClass = "bg-white p-10 border border-slate-100 shadow-soft relative overflow-hidden group mb-10 transition-all duration-500 rounded-[32px]";
    const inputClass = "w-full uni-input bg-slate-50 border-0 focus:bg-white p-4 text-sm font-semibold text-slate-700 placeholder:text-slate-300 transition-all duration-300 rounded-xl focus:ring-2 focus:ring-unihub-teal/30 focus:outline-none";
    const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1";

    return (
        <div className="max-w-7xl mx-auto py-10 px-6 space-y-12 pb-24">
            {/* Architectural Hero Section */}
            <div className="relative rounded-[40px] overflow-hidden shadow-2xl bg-gradient-to-br from-unihub-teal to-[#0d857a] group mb-12">
                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none group-hover:scale-105 transition-transform duration-[2000ms]">
                    <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-white opacity-10 blur-[120px] rounded-full mix-blend-overlay animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white opacity-5 blur-[100px] rounded-full" />
                    <FileText className="absolute -right-16 -top-16 w-80 h-80 text-white opacity-10 rotate-12 transition-all duration-700 group-hover:rotate-[20deg] group-hover:scale-110" strokeWidth={0.5} />
                </div>

                <div className="px-8 md:px-16 py-16 md:py-24 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="max-w-3xl space-y-8 text-center md:text-left">
                        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-[11px] font-bold text-white tracking-[0.2em] shadow-xl font-display mb-2">
                            <Sparkles className="w-4 h-4 text-unihub-yellow" /> AI Asset Forge
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight font-display">
                            Auto <span className="text-unihub-yellow">Portfolio Builder</span>.
                        </h1>
                        <p className="text-white/90 font-medium text-base md:text-xl max-w-xl leading-relaxed italic opacity-80">
                            {"Synthesize your professional history into a premium, high-fidelity PDF instantly. Articulate your value to industry leaders.".split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                        </p>
                    </div>

                    <button
                        onClick={generatePDF}
                        className="btn bg-white text-unihub-teal hover:bg-unihub-yellow hover:text-unihub-text px-12 py-5 rounded-[24px] font-black text-[13px] tracking-[0.2em] shadow-2xl transition-all active:scale-95 group/btn font-display uppercase flex items-center gap-4"
                    >
                        <Download className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                        Download Portfolio
                    </button>
                </div>
            </div>

            {/* Personal Info */}
            <div className={sectionClass}>
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-2 h-8 bg-unihub-teal rounded-full shadow-[0_0_15px_rgba(20,184,166,0.4)]" />
                    <h2 className="text-3xl font-black text-unihub-text font-display uppercase tracking-tight">Core Identity</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                    {[
                        ['name', 'Full Name', <User className="w-4 h-4" />],
                        ['email', 'Engagement Email', <Mail className="w-4 h-4" />],
                        ['phone', 'Direct Link (Phone)', <Phone className="w-4 h-4" />],
                        ['address', 'Physical Node (Address)', <MapPin className="w-4 h-4" />],
                        ['github', 'GitHub Repository', <Github className="w-4 h-4" />],
                        ['linkedin', 'LinkedIn Profile', <Linkedin className="w-4 h-4" />],
                        ['portfolio', 'Personal Portfolio', <Globe className="w-4 h-4" />]
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

            {/* Projects */}
            <div className={sectionClass}>
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-8 bg-unihub-teal rounded-full shadow-[0_0_15px_rgba(20,184,166,0.4)]" />
                        <h2 className="text-3xl font-black text-unihub-text font-display uppercase tracking-tight">Project Artifacts</h2>
                    </div>
                    <button onClick={() => addItem('projects', { title: '', role: '', period: '', description: '' })} className="btn btn-glass px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-slate-200 hover:border-unihub-teal">
                        <Plus className="w-4 h-4" /> ADD ARTIFACT
                    </button>
                </div>

                <div className="space-y-8 relative z-10">
                    {form.projects.map((proj, i) => (
                        <div key={i} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 relative group/entry animate-in fade-in slide-in-from-bottom-6" style={{ animationDelay: `${i * 150}ms` }}>
                            <button onClick={() => removeItem('projects', i)} className="absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-unihub-coral hover:bg-white transition-all active:scale-90">
                                <Trash2 className="w-4.5 h-4.5" />
                            </button>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-1">
                                    <label className={labelClass}>Project Identifier</label>
                                    <input className={inputClass} value={proj.title} onChange={e => updateList('projects', i, 'title', e.target.value)} placeholder="Nexus Dashboard App" />
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClass}>Primary Role / Tech Stack</label>
                                    <input className={inputClass} value={proj.role} onChange={e => updateList('projects', i, 'role', e.target.value)} placeholder="Lead Dev • React, Node.js" />
                                </div>
                                <div className="sm:col-span-2 space-y-1">
                                    <label className={labelClass}>Temporal Span (Period)</label>
                                    <input className={inputClass} value={proj.period} onChange={e => updateList('projects', i, 'period', e.target.value)} placeholder="Feb 2025" />
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <label className={labelClass}>Technical Implementation (Use Enter for Bullets)</label>
                                <textarea className={`${inputClass} min-h-[100px] leading-relaxed opacity-80`} rows={3} value={proj.description} onChange={e => updateList('projects', i, 'description', e.target.value)} placeholder="Architected the backend to support over 10K requests/min...&#10;Integrated Stripe payment gateway..." />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills */}
            <div className={sectionClass}>
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-8 bg-unihub-teal rounded-full shadow-[0_0_15px_rgba(20,184,166,0.4)]" />
                        <h2 className="text-3xl font-black text-unihub-text font-display uppercase tracking-tight">Verified Skills</h2>
                    </div>
                    <button onClick={() => addItem('skills', { name: '', level: 3 })} className="btn btn-glass px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-slate-200 hover:border-unihub-teal">
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
                                <select className={`${inputClass} font-black uppercase tracking-widest cursor-pointer px-4`} value={skill.level} onChange={e => updateList('skills', i, 'level', +e.target.value)}>
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
                        <div className="w-2 h-8 bg-unihub-teal rounded-full shadow-[0_0_15px_rgba(20,184,166,0.4)]" />
                        <h2 className="text-3xl font-black text-unihub-text font-display uppercase tracking-tight">Experience Logs</h2>
                    </div>
                    <button onClick={() => addItem('experience', { title: '', company: '', period: '', description: '' })} className="btn btn-glass px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-slate-200 hover:border-unihub-teal">
                        <Plus className="w-4 h-4" /> ADD LOG
                    </button>
                </div>

                <div className="space-y-8 relative z-10">
                    {form.experience.map((exp, i) => (
                        <div key={i} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 relative group/entry animate-in fade-in slide-in-from-bottom-6" style={{ animationDelay: `${i * 150}ms` }}>
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
                        <div className="w-2 h-8 bg-unihub-teal rounded-full shadow-[0_0_15px_rgba(20,184,166,0.4)]" />
                        <h2 className="text-3xl font-black text-unihub-text font-display uppercase tracking-tight">Academic Assets</h2>
                    </div>
                    <button onClick={() => addItem('education', { degree: '', institution: '', year: '', gpa: '' })} className="btn btn-glass px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-slate-200 hover:border-unihub-teal">
                        <Plus className="w-4 h-4" /> ADD ASSET
                    </button>
                </div>

                <div className="space-y-8 relative z-10">
                    {form.education.map((edu, i) => (
                        <div key={i} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 relative group/entry animate-in fade-in slide-in-from-bottom-6" style={{ animationDelay: `${i * 150}ms` }}>
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
