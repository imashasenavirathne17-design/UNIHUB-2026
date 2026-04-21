import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Globe, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-unihub-coral text-white py-24 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    {/* Brand Column */}
                    <div className="space-y-8">
                        <Link to="/" className="flex items-center gap-3 group">
                            <img src="/logo.png" alt="UniHub Logo" className="w-12 h-12 rounded-2xl bg-white p-2 shadow-xl" />
                            <span className="text-3xl font-black tracking-tighter font-display uppercase">UniHub.</span>
                        </Link>
                        <p className="text-white/80 font-medium leading-relaxed max-w-xs text-sm">
                            Revolutionizing the academic experience through modular innovation and seamless system synchronization.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Twitter, Linkedin, Instagram, Globe].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white hover:text-unihub-coral transition-all duration-300">
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-10 opacity-60">System Modules</h4>
                        <ul className="space-y-4">
                            {[
                                { name: 'Exam Arena', to: '/exams' },
                                { name: 'Career Hub', to: '/internships' },
                                { name: 'Resource Booking', to: '/facilities' },
                                { name: 'Event Management', to: '/events' },
                                { name: 'Lost & Found', to: '/lost-found' }
                            ].map((link, i) => (
                                <li key={i}>
                                    <Link to={link.to} className="text-sm font-bold text-white/80 hover:text-white hover:translate-x-2 transition-all inline-block">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-10 opacity-60">Academic Portal</h4>
                        <ul className="space-y-4">
                            {[
                                'University Guidelines', 'Examination Policy', 
                                'Research Archive', 'Campus Map', 
                                'Alumni Network'
                            ].map((link, i) => (
                                <li key={i}>
                                    <a href="#" className="text-sm font-bold text-white/80 hover:text-white hover:translate-x-2 transition-all inline-block">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-10 opacity-60">HQ Nodes</h4>
                        <ul className="space-y-6">
                            <li className="flex items-center gap-4">
                                <MapPin className="w-5 h-5 text-white/40" />
                                <span className="text-sm font-bold opacity-90">Central Campus, Sri Lanka</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Mail className="w-5 h-5 text-white/40" />
                                <span className="text-sm font-bold opacity-90">node.zero@unihub.com</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Phone className="w-5 h-5 text-white/40" />
                                <span className="text-sm font-bold opacity-90">+94 11 2026 000</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-widest">
                            &copy; 2026 UNIHUB CORE OS. 
                        </p>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                            Global Architecture Node - Sri Lanka
                        </p>
                    </div>
                    <div className="flex items-center gap-10 text-[10px] font-black uppercase tracking-widest text-white/60">
                        <a href="#" className="hover:text-white transition-colors">Privacy Shield</a>
                        <a href="#" className="hover:text-white transition-colors">Service Protocol</a>
                        <a href="#" className="hover:text-white transition-colors">Cookie Node</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

