import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, User, UserPlus, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';
import { Card, Input, Button } from '../../components/labhall/ui/CommonUI';

const LabHallRegister = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('student');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validateDomain = () => {
        if (role === 'student' && !email.endsWith('@sliit.lk')) {
            return 'Students must use @sliit.lk institutional email';
        }
        if (role === 'lecturer' && !email.endsWith('@gmail.com')) {
            return 'Lecturers must use @gmail.com professional email';
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const domainError = validateDomain();
        if (domainError) {
            Swal.fire({ title: 'Validation Failed', text: domainError, icon: 'warning', confirmButtonColor: '#4F46E5' });
            return;
        }

        if (password !== confirmPassword) {
            Swal.fire({ title: 'Mismatch', text: 'Passwords do not match.', icon: 'error', confirmButtonColor: '#4F46E5' });
            return;
        }

        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/labhall/auth/register', { name, email, password, role });
            Swal.fire({
                title: 'Operation Success',
                text: 'Your academic identity has been established.',
                icon: 'success',
                timer: 2500,
                showConfirmButton: false,
                confirmButtonColor: '#4F46E5'
            });
            navigate('/facilities/login');
        } catch (err) {
            Swal.fire({
                title: 'Request Failed',
                text: err.response?.data?.message || 'Failed to initialize account.',
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
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-100/50 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Card className="p-10">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl mx-auto mb-6 -rotate-2 ring-8 ring-indigo-50 relative">
                            <UserPlus className="w-8 h-8" />
                            <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-indigo-300 rounded-full border-2 border-white" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight font-display uppercase">Create <span className="text-indigo-600">Identity</span></h1>
                        <p className="text-[10px] font-black text-gray-400 mt-2 tracking-[0.25em] uppercase opacity-70">Initialize Academic Reservation Access</p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                          <Input
                              label="Full Name"
                              icon={User}
                              type="text"
                              placeholder="Academic Name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                          />
                        </div>

                        <div className="col-span-1 md:col-span-2">
                          <Input
                              label="Institutional Email"
                              icon={Mail}
                              type="email"
                              placeholder="username@sliit.lk"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                          />
                          <p className="text-[9px] font-black text-gray-300 mt-2 uppercase tracking-widest text-center">
                            Note: @sliit.lk for Student | @gmail.com for Lecturer
                          </p>
                        </div>

                        <Input
                            label="Set Key"
                            icon={Lock}
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Input
                            label="Verify Key"
                            icon={Lock}
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Academic Role</label>
                            <div className="relative group">
                              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none z-10" />
                              <select
                                className="w-full pl-12 pr-12 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-indigo-500 focus:bg-white outline-none font-bold text-gray-700 transition-all shadow-sm focus:shadow-indigo-100 appearance-none cursor-pointer"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                              >
                                <option value="student">Student (@sliit.lk)</option>
                                <option value="lecturer">Lecturer (@gmail.com)</option>
                              </select>
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 mt-4">
                          <Button type="submit" loading={loading}>
                              {loading ? 'Initializing...' : 'Establish Identity'}
                          </Button>
                        </div>
                    </form>

                    <div className="mt-10 text-center text-[11px] font-black text-gray-400 uppercase tracking-widest leading-loose">
                        Already have access?<br />
                        <Link to="/facilities/login" className="text-indigo-600 hover:text-indigo-800 transition-colors underline underline-offset-4 decoration-2">
                            Return to Portal
                        </Link>
                    </div>
                </Card>

                <p className="text-center text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mt-8">
                    Nexus Node Integration &copy; 2026 UniHub Systems
                </p>
            </div>
        </div>
    );
};

export default LabHallRegister;
