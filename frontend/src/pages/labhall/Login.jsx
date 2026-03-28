import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Mail, Lock, LogIn, ShieldAlert } from 'lucide-react';
import Swal from 'sweetalert2';

const LabHallLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login: setAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Domain Check
        const isStudent = email.endsWith('@gmail.com');
        const isLecturer = email.endsWith('@my.sliit.lk');

        if (!isStudent && !isLecturer) {
            Swal.fire({
                title: 'Invalid Domain',
                text: 'Students must use @gmail.com and Lecturers must use @my.sliit.lk',
                icon: 'error',
                confirmButtonColor: '#4f46e5'
            });
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/labhall/auth/login', { email, password });
            setAuth(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            Swal.fire({
                title: 'Welcome!',
                text: `Logged in as ${res.data.name}`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            navigate('/facilities');
        } catch (err) {
            Swal.fire('Login Failed', err.response?.data?.message || 'Check your credentials', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
                <div className="p-10">
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 bg-indigo-600 rounded-[22px] flex items-center justify-center text-white shadow-lg rotate-3 ring-8 ring-indigo-50">
                            <LogIn className="w-8 h-8" />
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Nexus Portal</h1>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Academic Resource Access</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">SLIIT Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="email" 
                                    placeholder="yourname@my.sliit.lk" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-indigo-500 outline-none font-bold text-gray-700 transition-all placeholder:text-gray-300"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-indigo-500 outline-none font-bold text-gray-700 transition-all placeholder:text-gray-300"
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[24px] shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? 'Authenticating...' : (
                                <>
                                    Enter Dashboard <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 p-5 rounded-3xl bg-amber-50 border border-amber-100 flex items-start gap-4">
                        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[10px] font-black text-amber-900 uppercase tracking-wider mb-1">Access Policy</p>
                            <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase">Lecturers: @my.sliit.lk<br/>Students: @gmail.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LabHallLogin;
