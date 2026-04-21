import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Mail, Lock, LogIn, Github } from 'lucide-react';
import Swal from 'sweetalert2';
import { Card, Input, Button } from '../../components/labhall/ui/CommonUI';

const LabHallLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login: setAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/labhall/auth/login', { email, password });
            setAuth(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            Swal.fire({
                title: 'Access Granted',
                text: `Authorization successful for ${res.data.name}`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                confirmButtonColor: '#4F46E5'
            });
            navigate('/facilities');
        } catch (err) {
            Swal.fire({
                title: 'Authentication Denied',
                text: err.response?.data?.message || 'Invalid credentials or network error.',
                icon: 'error',
                confirmButtonColor: '#4F46E5'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Background Decorative Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/50 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/50 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Card className="p-10">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl mx-auto mb-6 rotate-2 ring-8 ring-indigo-50 relative">
                            <LogIn className="w-8 h-8" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-300 rounded-full border-2 border-white" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight font-display uppercase">Portal <span className="text-indigo-600">Sync</span></h1>
                        <p className="text-[10px] font-black text-gray-400 mt-2 tracking-[0.25em] uppercase opacity-70">Laboratory & Hall Reservation Node</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Institutional Email"
                            icon={Mail}
                            type="email"
                            placeholder="username@university.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <div className="space-y-2">
                            <div className="flex justify-between items-center pr-1">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Access Key</label>
                                <Link to="#" className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Forgot Key?</Link>
                            </div>
                            <Input
                                icon={Lock}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                showPasswordToggle
                                onTogglePassword={() => setShowPassword(!showPassword)}
                                required
                            />
                        </div>

                        <div className="flex items-center gap-2 group cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" id="remember" />
                            <label htmlFor="remember" className="text-[11px] font-black text-gray-500 uppercase tracking-widest cursor-pointer group-hover:text-indigo-600 transition-colors">Remember identity</label>
                        </div>

                        <Button type="submit" loading={loading}>
                            {loading ? 'Authenticating...' : 'Establish Connection'}
                        </Button>
                    </form>

                    <div className="relative my-10 border-b border-gray-100 shadow-sm">
                        <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 bg-white px-4 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">External</span>
                    </div>

                    <Button variant="secondary" onClick={() => Swal.fire('Integration', 'Google Identity Sync is pending implementation.', 'info')}>
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Sign in with Google
                    </Button>

                    <div className="mt-10 text-center text-[11px] font-black text-gray-400 uppercase tracking-widest leading-loose">
                        Unregistered access?<br />
                        <Link to="/facilities/register" className="text-indigo-600 hover:text-indigo-800 transition-colors underline underline-offset-4 decoration-2">
                            Initialize Account
                        </Link>
                    </div>
                </Card>

                <p className="text-center text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mt-8">
                    &copy; 2026 Nexus Booking Architecture v4.0.2
                </p>
            </div>
        </div>
    );
};

export default LabHallLogin;
