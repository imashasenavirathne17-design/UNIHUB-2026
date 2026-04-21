import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, Shield } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            const userData = await register({ name, email, password, role });
            if (userData.role === 'admin') navigate('/admin/dashboard');
            else navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
                <div className="absolute top-[5%] right-[10%] w-[35%] h-[35%] bg-unihub-teal/10 blur-[100px] rounded-full animate-pulse" />
                <div className="absolute bottom-[5%] left-[10%] w-[35%] h-[35%] bg-unihub-coral/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
            </div>

            <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-4 mb-6 group cursor-default">
                        <img src="/logo.png" alt="UniHub Logo" className="w-14 h-14 rounded-3xl shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 object-cover" />
                        <span className="text-4xl font-black text-unihub-text tracking-tighter font-display uppercase">Uni<span className="text-unihub-teal">Hub</span></span>
                    </div>
                    <h1 className="text-3xl font-black text-unihub-text font-display tracking-tight uppercase">Join the Ecosystem</h1>
                    <p className="text-xs font-bold text-unihub-textMuted mt-3 tracking-[0.2em] uppercase opacity-70">Initialize Academic Identity • Node 2026</p>
                </div>

                <div className="glass-card p-10 border-white/40 shadow-2xl relative overflow-hidden group/card max-w-2xl mx-auto">
                    {/* Subtle Internal Glow */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-unihub-teal/5 rounded-full blur-3xl group-hover/card:bg-unihub-teal/10 transition-colors" />
                    {error && (
                        <div className="bg-unihub-coral/10 border border-unihub-coral/20 text-unihub-coral px-4 py-3.5 rounded-2xl text-sm font-medium flex items-start gap-3 mb-6 animate-in slide-in-from-top-2 duration-300">
                            <div className="w-5 h-5 rounded-full bg-unihub-coral/20 flex items-center justify-center flex-shrink-0 text-xs font-black italic">!</div>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <label className="uni-label ml-1">Full Name</label>
                            <div className="relative group/input">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-unihub-textMuted group-focus-within/input:text-unihub-teal transition-colors pointer-events-none" />
                                <input
                                    type="text"
                                    className="uni-input !pl-12 bg-white/40 border-white/20 focus:bg-white/80"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <label className="uni-label ml-1">Email Address</label>
                            <div className="relative group/input">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-unihub-textMuted group-focus-within/input:text-unihub-teal transition-colors pointer-events-none" />
                                <input
                                    type="email"
                                    className="uni-input !pl-12 bg-white/40 border-white/20 focus:bg-white/80"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="university@example.edu"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 col-span-1">
                            <label className="uni-label ml-1">Password</label>
                            <div className="relative group/input">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-unihub-textMuted group-focus-within/input:text-unihub-teal transition-colors pointer-events-none" />
                                <input
                                    type="password"
                                    className="uni-input !pl-12 bg-white/40 border-white/20 focus:bg-white/80"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min 6 chars"
                                    minLength="6"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 col-span-1">
                            <label className="uni-label ml-1">Account Type</label>
                            <div className="relative group/input">
                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-unihub-textMuted group-focus-within/input:text-unihub-teal transition-colors pointer-events-none" />
                                <select
                                    className="uni-input !pl-12 bg-white/40 border-white/20 focus:bg-white/80 appearance-none cursor-pointer"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="student">Student</option>
                                    <option value="lecturer">Lecturer</option>
                                    <option value="admin">Administrator</option>
                                    <option value="organization">Organization</option>
                                    <option value="organizer">Event Organizer</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary col-span-1 md:col-span-2 py-4 text-[13px] tracking-[0.2em] font-black uppercase shadow-xl mt-4 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <UserPlus className="w-4.5 h-4.5" />
                            )}
                            {loading ? 'INITIALIZING...' : 'CREATE IDENTITY'}
                        </button>
                    </form>

                    <div className="text-center mt-10 pt-8 border-t border-black/5 col-span-1 md:col-span-2">
                        <p className="text-xs font-bold text-unihub-textMuted uppercase tracking-widest leading-loose">
                            Already part of UniHub?<br />
                            <Link to="/login" className="text-unihub-teal font-black hover:text-unihub-tealHover transition-all underline underline-offset-8 decoration-2 decoration-unihub-teal/20 hover:decoration-unihub-teal">
                                SIGN IN TO PORTAL
                            </Link>
                        </p>
                    </div>
                </div>
                
                <p className="text-center text-[10px] font-bold text-unihub-textMuted/50 uppercase tracking-[0.3em] mt-10">
                    Registration Node: {new Date().getFullYear()} Regional Hub
                </p>
            </div>
        </div>
    );
};

export default Register;
