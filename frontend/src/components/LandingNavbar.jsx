import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

const LandingNavbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const navLinks = [
        { name: "Home", href: "#hero" },
        { name: "Modules", href: "#modules" },
        { name: "About", href: "#about" },
        { name: "Contact", href: "#contact" },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-nav h-20 flex items-center">
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <img src="/logo.png" alt="UniHub Logo" className="w-10 h-10 rounded-xl shadow-lg group-hover:scale-105 transition-transform object-cover" />
                    <span className="text-2xl font-bold text-unihub-text tracking-tight font-display">
                        Uni<span className="text-gradient">Hub</span>
                    </span>
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-sm font-semibold text-unihub-textMuted hover:text-unihub-teal transition-colors font-display"
                        >
                            {link.name}
                        </a>
                    ))}
                </div>

                {/* Auth CTAs */}
                <div className="hidden md:flex items-center gap-4">
                    <Link 
                        to="/login" 
                        className="text-sm font-semibold text-unihub-text hover:text-unihub-teal transition-colors font-display"
                    >
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className="btn btn-primary px-6 py-2.5 rounded-xl shadow-teal-sm text-sm"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-unihub-text"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Scroll Progress Bar */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-unihub-teal via-unihub-yellow to-unihub-coral origin-left"
                style={{ scaleX }}
            />

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="absolute top-20 left-0 right-0 glass backdrop-blur-2xl border-b border-white/20 p-6 md:hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-base font-semibold text-unihub-text hover:text-unihub-teal transition-colors font-display"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </a>
                        ))}
                        <div className="h-px bg-black/5 my-2" />
                        <Link
                            to="/login"
                            className="text-base font-bold text-unihub-text hover:text-unihub-teal transition-colors font-display"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Log In
                        </Link>
                        <Link
                            to="/register"
                            className="btn btn-primary w-full py-3 rounded-xl shadow-teal-sm text-sm"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default LandingNavbar;
