import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
    BookOpen, Shield, ChevronRight, BarChart3,
    Clock, Database, Lock, GraduationCap,
    CreditCard, Users, Briefcase, Mail, Phone, MapPin,
    ArrowUpRight, Sparkles, CheckCircle2, Activity, Calendar
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import LandingNavbar from "../components/LandingNavbar";
import Footer from "../components/Footer";

// Magnetic Button Component
const MagneticButton = ({ children, className }) => {
    const ref = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
    };

    const reset = () => {
        setPosition({ x: 0, y: 0 });
    };

    const { x, y } = position;

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x, y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

const Landing = () => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    const fadeIn = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-100px" },
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    };

    const capabilities = [
        {
            title: "Real-time Interactions",
            desc: "Responsive and dynamic system responses for a seamless user experience.",
            icon: Sparkles,
            color: "#14B8A6"
        },
        {
            title: "Secure Authentication",
            desc: "Robust data protection and secure user authentication protocols.",
            icon: Shield,
            color: "#FF6B6B"
        },
        {
            title: "Centralized Management",
            desc: "A unified data ecosystem for students, staff, and administration.",
            icon: Database,
            color: "#FACC15"
        },
        {
            title: "Scalable Architecture",
            desc: "Built on a modern, scalable MERN stack for high-performance operations.",
            icon: ArrowUpRight,
            color: "#14B8A6"
        }
    ];

    return (
        <div className="min-h-screen bg-white selection:bg-unihub-teal/30 selection:text-unihub-teal">
            <LandingNavbar />

            {/* HERO SECTION - MODERN EDITORIAL */}
            <section id="hero" className="relative h-screen flex items-center overflow-hidden">
                {/* Background Editorial Image */}
                <div className="absolute inset-0 z-0">
                    <motion.img
                        src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop"
                        alt="Modern University"
                        className="w-full h-full object-cover grayscale-[30%] opacity-20"
                        style={{ y: y1 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
                        {/* Hero Text */}
                        <div className="flex-1 text-left">


                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                className="text-6xl md:text-8xl font-black text-unihub-text leading-[0.95] tracking-tighter font-display mb-8"
                            >
                                Comprehensive <br />
                                <span className="text-gradient">University</span> <br />
                                <span className="relative inline-block mt-2">
                                    Management Platform.
                                    <motion.div
                                        className="absolute -bottom-2 left-0 right-0 h-4 bg-unihub-yellow/30 -z-10"
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 1, delay: 1 }}
                                    />
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-unihub-text text-xl md:text-2xl font-bold max-w-2xl leading-relaxed mb-4"
                            >
                                A centralized system designed to manage academic, administrative, and student activities efficiently.
                            </motion.p>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.25 }}
                                className="text-unihub-textMuted text-lg font-medium max-w-xl leading-relaxed mb-12"
                            >
                                UNIHUB integrates exam practice, student services, event management, and internship tracking into a single platform, improving productivity and enhancing the overall university experience.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="flex flex-wrap items-center gap-8"
                            >
                                <MagneticButton>
                                    <Link to="/register" className="btn btn-primary px-12 py-5 rounded-full text-lg font-black tracking-widest group shadow-2xl">
                                        Get Started
                                        <ArrowUpRight className="w-6 h-6 ml-2 group-hover:rotate-45 transition-transform" />
                                    </Link>
                                </MagneticButton>
                                <a href="#modules" className="text-unihub-text font-black text-sm uppercase tracking-widest border-b-2 border-unihub-teal pb-1 hover:text-unihub-teal transition-colors">
                                    Explore Modules
                                </a>
                            </motion.div>
                        </div>

                        {/* Floating UI Mockup (Coded Visual) */}
                        <motion.div
                            className="hidden lg:block flex-1 relative"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            style={{ y: y2 }}
                        >
                            <div className="relative w-[500px] h-[600px] mx-auto">
                                {/* Main Multi-Module Dashboard Card */}
                                <motion.div
                                    className="absolute inset-0 glass-card p-10 rounded-[56px] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.12)] border-white/60 flex flex-col gap-10"
                                    animate={{ y: [0, -15, 0] }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <div className="flex items-center justify-between border-b border-black/5 pb-8">
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-black tracking-[0.25em] text-unihub-textMuted font-display">Activity Hub</p>
                                            <h3 className="text-3xl font-black text-unihub-text">System Sync.</h3>
                                        </div>
                                        <div className="w-14 h-14 rounded-3xl bg-unihub-teal/10 flex items-center justify-center text-unihub-teal">
                                            <Activity className="w-7 h-7" />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {[
                                            { icon: CheckCircle2, text: 'Exam Passed: Data Structures', color: 'unihub-teal', status: 'A+' },
                                            { icon: MapPin, text: 'MacBook Pro Found (Lab 4)', color: 'unihub-coral', status: 'Alert' },
                                            { icon: Briefcase, text: 'New Internship Opportunity', color: 'unihub-teal', status: 'Hiring' },
                                            { icon: Calendar, text: 'Tech Summit 2024 Starts', color: 'unihub-yellow', status: 'Now' }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-5 rounded-[24px] bg-slate-50 border border-black/5 group hover:border-unihub-teal/30 transition-all cursor-default shadow-sm hover:shadow-lg">
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-12 h-12 rounded-2xl bg-${item.color}/10 flex items-center justify-center text-${item.color}`}>
                                                        <item.icon className="w-5 h-5" />
                                                    </div>
                                                    <p className="font-bold text-unihub-text text-sm truncate max-w-[150px]">{item.text}</p>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full bg-${item.color}/10 text-${item.color} text-[9px] font-black uppercase tracking-widest`}>
                                                    {item.status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Bottom System Health */}
                                    <div className="mt-4 pt-8 border-t border-black/5 flex items-center justify-between">
                                        <div className="flex -space-x-3">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} className="w-full h-full object-cover" alt="User" />
                                                </div>
                                            ))}
                                            <div className="w-10 h-10 rounded-full border-2 border-white bg-unihub-teal text-white flex items-center justify-center text-[10px] font-black shadow-teal-lg">
                                                +8k
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-unihub-textMuted uppercase tracking-widest">Global Platform Activity</p>
                                    </div>
                                </motion.div>

                                {/* Floating Modules Badge: Booking */}
                                <motion.div
                                    className="absolute -right-20 top-1/3 glass-card p-6 rounded-[32px] shadow-2xl border-white underline-none w-[180px]"
                                    animate={{
                                        y: [0, 30, 0],
                                        x: [0, 10, 0]
                                    }}
                                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-unihub-yellow/10 flex items-center justify-center text-unihub-yellow mb-4">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.2em] mb-1">Reservation Status</p>
                                    <p className="text-sm font-black text-unihub-text">Lab 02 Reserved.</p>
                                </motion.div>

                                {/* Floating Modules Badge: Score */}
                                <motion.div
                                    className="absolute -left-12 bottom-[10%] glass-card p-6 rounded-[32px] shadow-2xl border-white underline-none w-[180px]"
                                    animate={{
                                        y: [0, -30, 0],
                                        rotate: [0, -5, 0]
                                    }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 rounded-full border-4 border-unihub-teal/20 border-t-unihub-teal animate-spin" />
                                        <p className="text-xl font-black text-unihub-teal">94%</p>
                                    </div>
                                    <p className="text-[10px] font-black text-unihub-textMuted uppercase tracking-[0.2em] mb-1">Exam Progress</p>
                                    <p className="text-sm font-black text-unihub-text">Academic High-Peak</p>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* MODULES SECTION - Z-LAYOUT CORE MODULES */}
            <section id="modules" className="py-32 bg-white relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        className="text-center max-w-3xl mx-auto mb-32"
                        {...fadeIn}
                    >
                        <h2 className="text-5xl md:text-7xl font-black text-unihub-text tracking-tighter font-display leading-[0.95] mb-8">
                            Core System <span className="text-gradient">Modules.</span>
                        </h2>
                        <p className="text-unihub-textMuted text-xl font-medium leading-relaxed">
                            A centralized ecosystem designed to manage academic, administrative, and student activities with specialized modular precision.
                        </p>
                    </motion.div>

                    <div className="space-y-48">
                        {/* Module 1: Online Exams (Text Left, UI Right) */}
                        <div className="flex flex-col lg:flex-row items-center gap-20">
                            <motion.div
                                className="flex-1"
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-unihub-teal/10 text-unihub-teal text-[10px] font-black tracking-widest uppercase mb-6">
                                    Module 01
                                </div>
                                <h3 className="text-4xl md:text-5xl font-black text-unihub-text font-display leading-tight mb-8">
                                    Online Exam Practice & <br />Performance Evaluation
                                </h3>
                                <p className="text-unihub-text text-xl font-bold leading-relaxed mb-10">
                                    Simulates real examination environments to help students improve performance, confidence, and time management.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-12">
                                    {[
                                        { t: 'Practice Timed Exams', d: 'Real-time countdown to simulate actual conditions' },
                                        { t: 'Instant Auto Grading', d: 'MCQ results and feedback immediately after submission' },
                                        { t: 'Structured Question Bank', d: 'Organized by subject and difficulty level' },
                                        { t: 'Performance Analytics', d: 'Visual reports to analyze strengths and weaknesses' }
                                    ].map((feat, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <p className="text-sm font-black text-unihub-text flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-unihub-teal" />
                                                {feat.t}
                                            </p>
                                            <p className="text-xs font-medium text-unihub-textMuted ml-3.5 leading-relaxed">{feat.d}</p>
                                        </div>
                                    ))}
                                </div>
                                <Link to="/exams" className="btn btn-primary px-10 py-5 rounded-2xl text-base font-black tracking-widest group shadow-teal-lg inline-flex items-center">
                                    Launch Exam Hub
                                    <ArrowUpRight className="w-6 h-6 ml-2 group-hover:rotate-45 transition-transform" />
                                </Link>
                            </motion.div>
                            <motion.div
                                className="flex-1 w-full"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                            >
                                <div className="p-10 rounded-[48px] bg-unihub-teal/5 border border-unihub-teal/20 relative overflow-hidden group">
                                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-unihub-teal/10 blur-[100px] opacity-50" />
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-20 h-20 rounded-3xl bg-unihub-teal shadow-xl flex items-center justify-center text-white mb-8">
                                            <BookOpen className="w-10 h-10" />
                                        </div>
                                        <div className="p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white shadow-2xl w-full">
                                            <Sparkles className="w-8 h-8 text-unihub-teal mb-4" />
                                            <p className="text-[10px] font-black text-unihub-teal uppercase tracking-[0.2em] mb-2">Unique Feature</p>
                                            <p className="text-2xl font-black text-unihub-text leading-tight">
                                                Adaptive exam system with performance-based question selection to enhance student readiness.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Module 2: Lost/Found (UI Left, Text Right) */}
                        <div className="flex flex-col lg:flex-row-reverse items-center gap-20">
                            <motion.div
                                className="flex-1"
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-unihub-coral/10 text-unihub-coral text-[10px] font-black tracking-widest uppercase mb-6">
                                    Module 02
                                </div>
                                <h3 className="text-4xl md:text-5xl font-black text-unihub-text font-display leading-tight mb-8">
                                    Lost/Found Management & <br />Hall/Lab Booking
                                </h3>
                                <p className="text-unihub-text text-xl font-bold leading-relaxed mb-10">
                                    Supports campus item recovery and efficient space booking for lectures and academic activities.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-12">
                                    {[
                                        { t: 'Lost/Found Reporting', d: 'Category, location, and image tracking' },
                                        { t: 'Direct Messaging', d: 'Secure communication between owner and finder' },
                                        { t: 'Notification Management', d: 'Real-time alerts for updates and status changes' },
                                        { t: 'Lecture Hall/Lab Booking', d: 'Live availability and scheduling system' }
                                    ].map((feat, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <p className="text-sm font-black text-unihub-text flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-unihub-coral" />
                                                {feat.t}
                                            </p>
                                            <p className="text-xs font-medium text-unihub-textMuted ml-3.5 leading-relaxed">{feat.d}</p>
                                        </div>
                                    ))}
                                </div>
                                <Link to="/lost-found" className="btn btn-secondary px-10 py-5 rounded-2xl text-base font-black tracking-widest group shadow-coral-lg inline-flex items-center">
                                    Access Services
                                    <ArrowUpRight className="w-6 h-6 ml-2 group-hover:rotate-45 transition-transform" />
                                </Link>
                            </motion.div>
                            <motion.div
                                className="flex-1 w-full"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                            >
                                <div className="p-10 rounded-[48px] bg-unihub-coral/5 border border-unihub-coral/20 relative overflow-hidden group">
                                    <div className="absolute -left-20 -top-20 w-80 h-80 bg-unihub-coral/10 blur-[100px] opacity-50" />
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-20 h-20 rounded-3xl bg-unihub-coral shadow-xl flex items-center justify-center text-white mb-8">
                                            <MapPin className="w-10 h-10" />
                                        </div>
                                        <div className="p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white shadow-2xl w-full">
                                            <Shield className="w-8 h-8 text-unihub-coral mb-4" />
                                            <p className="text-[10px] font-black text-unihub-coral uppercase tracking-[0.2em] mb-2">Unique Feature</p>
                                            <p className="text-2xl font-black text-unihub-text leading-tight">
                                                Built-in secure messaging without sharing personal contact details.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Module 3: Event Management (Text Left, UI Right) */}
                        <div className="flex flex-col lg:flex-row items-center gap-20">
                            <motion.div
                                className="flex-1"
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-unihub-yellow/10 text-unihub-yellow text-[10px] font-black tracking-widest uppercase mb-6">
                                    Module 03
                                </div>
                                <h3 className="text-4xl md:text-5xl font-black text-unihub-text font-display leading-tight mb-8">
                                    Event Management System
                                </h3>
                                <p className="text-unihub-text text-xl font-bold leading-relaxed mb-10">
                                    Manages academic and non-academic events while improving student participation.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-12">
                                    {[
                                        { t: 'Event Registration', d: 'Simplified organization and sign-up flow' },
                                        { t: 'Smart Reminder System', d: 'Automated notifications and stage-based updates' },
                                        { t: 'Event Monitoring', d: 'Detailed tracking of participation and engagement' },
                                        { t: 'Automated Boost System', d: 'Promotion for events with low registration' }
                                    ].map((feat, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <p className="text-sm font-black text-unihub-text flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-unihub-yellow" />
                                                {feat.t}
                                            </p>
                                            <p className="text-xs font-medium text-unihub-textMuted ml-3.5 leading-relaxed">{feat.d}</p>
                                        </div>
                                    ))}
                                </div>
                                <Link to="/events" className="btn px-10 py-5 rounded-2xl text-base font-black tracking-widest group shadow-lg inline-flex items-center bg-unihub-yellow text-slate-900 hover:bg-unihub-yellow/90">
                                    Explore Events
                                    <ArrowUpRight className="w-6 h-6 ml-2 group-hover:rotate-45 transition-transform" />
                                </Link>
                            </motion.div>
                            <motion.div
                                className="flex-1 w-full"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                            >
                                <div className="p-10 rounded-[48px] bg-unihub-yellow/5 border border-unihub-yellow/20 relative overflow-hidden group">
                                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-unihub-yellow/10 blur-[100px] opacity-50" />
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-20 h-20 rounded-3xl bg-unihub-yellow shadow-xl flex items-center justify-center text-white mb-8">
                                            <CreditCard className="w-10 h-10" />
                                        </div>
                                        <div className="p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white shadow-2xl w-full">
                                            <Sparkles className="w-8 h-8 text-unihub-yellow mb-4" />
                                            <p className="text-[10px] font-black text-unihub-yellow uppercase tracking-[0.2em] mb-2">Unique Feature</p>
                                            <p className="text-2xl font-black text-unihub-text leading-tight">
                                                Intelligent automation with multi-stage reminders and engagement tracking.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Module 4: Internship (UI Left, Text Right) */}
                        <div className="flex flex-col lg:flex-row-reverse items-center gap-20">
                            <motion.div
                                className="flex-1"
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-unihub-teal/10 text-unihub-teal text-[10px] font-black tracking-widest uppercase mb-6">
                                    Module 04
                                </div>
                                <h3 className="text-4xl md:text-5xl font-black text-unihub-text font-display leading-tight mb-8">
                                    Internship & Skill Management
                                </h3>
                                <p className="text-unihub-text text-xl font-bold leading-relaxed mb-10">
                                    Connects students with internship opportunities and skill-based services.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-12">
                                    {[
                                        { t: 'Internship Posting', d: 'Roles, skills, and deadline management' },
                                        { t: 'Application Tracking', d: 'Structured workflow from application to completion' },
                                        { t: 'Skill Marketplace', d: 'Offer and request services based on skills' },
                                        { t: 'Rating & Review System', d: 'Feedback and reputation tracking' }
                                    ].map((feat, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <p className="text-sm font-black text-unihub-text flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-unihub-teal" />
                                                {feat.t}
                                            </p>
                                            <p className="text-xs font-medium text-unihub-textMuted ml-3.5 leading-relaxed">{feat.d}</p>
                                        </div>
                                    ))}
                                </div>
                                <Link to="/internships" className="btn btn-primary px-10 py-5 rounded-2xl text-base font-black tracking-widest group shadow-teal-lg inline-flex items-center">
                                    Visit Marketplace
                                    <ArrowUpRight className="w-6 h-6 ml-2 group-hover:rotate-45 transition-transform" />
                                </Link>
                            </motion.div>
                            <motion.div
                                className="flex-1 w-full"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                            >
                                <div className="p-10 rounded-[48px] bg-unihub-teal/5 border border-unihub-teal/20 relative overflow-hidden group">
                                    <div className="absolute -left-20 -top-20 w-80 h-80 bg-unihub-teal/10 blur-[100px] opacity-50" />
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-20 h-20 rounded-3xl bg-unihub-teal shadow-xl flex items-center justify-center text-white mb-8">
                                            <Briefcase className="w-10 h-10" />
                                        </div>
                                        <div className="p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white shadow-2xl w-full">
                                            <GraduationCap className="w-8 h-8 text-unihub-teal mb-4" />
                                            <p className="text-[10px] font-black text-unihub-teal uppercase tracking-[0.2em] mb-2">Unique Feature</p>
                                            <p className="text-2xl font-black text-unihub-text leading-tight">
                                                Automatic CV generation system with downloadable professional templates.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ABOUT SECTION - PARALLAX MASKING */}
            <section id="about" className="py-48 bg-slate-900 text-white overflow-hidden relative">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                    <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-unihub-teal/30 blur-[150px] rounded-full" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-32">
                        <motion.div
                            className="flex-1 text-left"
                            {...fadeIn}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-black tracking-widest uppercase mb-8">
                                THE VISION
                            </div>
                            <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter font-display leading-[0.95] mb-12">
                                About <br />
                                <span className="text-gradient">UNIHUB.</span>
                            </h2>
                            <p className="text-white/60 text-xl md:text-2xl font-medium leading-relaxed mb-16 max-w-xl">
                                UNIHUB is a comprehensive university management platform developed to streamline academic and administrative operations. It reduces manual workload, enhances system efficiency, and provides a structured environment for students and staff.
                            </p>

                            <div className="grid grid-cols-2 gap-12 border-t border-white/10 pt-16">
                                <div>
                                    <p className="text-4xl font-black text-unihub-teal mb-2">2026</p>
                                    <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Engineering Launch</p>
                                </div>
                                <div>
                                    <p className="text-4xl font-black text-unihub-coral mb-2">99.9%</p>
                                    <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Uptime Standard</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="flex-1 relative"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {/* System Module Orbit System */}
                            <div className="relative w-full aspect-square max-w-[550px] mx-auto group">
                                {/* Central Core */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative group">
                                        <div className="absolute inset-[-100%] bg-unihub-teal/20 blur-[100px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[48px] bg-slate-800 border-2 border-white/20 flex items-center justify-center shadow-2xl relative z-10">
                                            <span className="text-5xl md:text-7xl font-black text-unihub-teal">U</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Outer Rotating Rings */}
                                <motion.div
                                    className="absolute inset-[10%] rounded-full border border-white/10"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.div
                                    className="absolute inset-[25%] rounded-full border border-white/5"
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                                />

                                {/* Orbiting Modules */}
                                {[
                                    { icon: BookOpen, color: 'unihub-teal', label: 'Academic', delay: 0 },
                                    { icon: MapPin, color: 'unihub-coral', label: 'Campus', delay: Math.PI / 2 },
                                    { icon: Calendar, color: 'unihub-yellow', label: 'Events', delay: Math.PI },
                                    { icon: Briefcase, color: 'unihub-teal', label: 'Careers', delay: (3 * Math.PI) / 2 }
                                ].map((mod, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-20 h-20 md:w-28 md:h-28"
                                        style={{
                                            left: '50%',
                                            top: '50%',
                                        }}
                                        animate={{
                                            x: [
                                                Math.cos(mod.delay) * 220,
                                                Math.cos(mod.delay + 2 * Math.PI) * 220
                                            ],
                                            y: [
                                                Math.sin(mod.delay) * 220,
                                                Math.sin(mod.delay + 2 * Math.PI) * 220
                                            ]
                                        }}
                                        transition={{
                                            duration: 25,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }}
                                    >
                                        <div className="relative group -translate-x-1/2 -translate-y-1/2">
                                            <div className={`absolute inset-0 bg-${mod.color}/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity`} />
                                            <div className={`w-full h-full rounded-full bg-slate-800 border-2 border-white/20 flex flex-col items-center justify-center shadow-2xl relative z-10 hover:border-${mod.color}/50 hover:scale-110 transition-all cursor-default`}>
                                                <mod.icon className={`w-6 h-6 md:w-8 md:h-8 text-${mod.color} mb-1 md:mb-2`} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{mod.label}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Floating Global Badge */}
                                <div className="absolute top-[5%] -right-4 glass-card bg-slate-800 border-white/10 p-5 md:p-6 rounded-3xl shadow-2xl animate-float">
                                    <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-unihub-yellow mb-2" />
                                    <p className="text-lg md:text-xl font-black text-white">Full-System</p>
                                    <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Architecture Sync</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CONTACT SECTION - EDITORIAL GRID */}
            <section id="contact" className="py-48 bg-white relative">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-24 items-start">
                        <motion.div
                            className="flex-1 lg:sticky lg:top-48"
                            {...fadeIn}
                        >
                            <h2 className="text-6xl md:text-7xl font-black text-unihub-text tracking-tighter font-display leading-[0.9] mb-12">
                                Contact <br />
                                <span className="text-gradient">Us.</span>
                            </h2>
                            <p className="text-unihub-textMuted text-xl font-medium leading-relaxed mb-12 max-w-md">
                                For inquiries or system support, please reach out to us:
                            </p>
                            <div className="space-y-8 pt-12 border-t border-black/5">
                                <div className="flex items-center gap-6 group cursor-default">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-unihub-teal transition-colors">
                                        <Mail className="w-5 h-5 text-unihub-text group-hover:text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-unihub-textMuted uppercase tracking-widest">Email Address</p>
                                        <p className="text-xl font-black text-unihub-text hover:text-unihub-teal transition-colors underline decoration-unihub-teal/30">support@unihub.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 group cursor-default">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-unihub-coral transition-colors">
                                        <Phone className="w-5 h-5 text-unihub-text group-hover:text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-unihub-textMuted uppercase tracking-widest">Phone Number</p>
                                        <p className="text-xl font-black text-unihub-text hover:text-unihub-coral transition-colors">+94 111 236 236</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 group cursor-default">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-unihub-yellow transition-colors">
                                        <MapPin className="w-5 h-5 text-unihub-text group-hover:text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-unihub-textMuted uppercase tracking-widest">Address</p>
                                        <p className="text-xl font-black text-unihub-text hover:text-unihub-yellow transition-colors">Sri Lanka</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="flex-1 w-full bg-slate-50 p-12 lg:p-20 rounded-[48px] border border-black/5"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                        >
                            <div className="space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="uni-label">Your Name</label>
                                        <input type="text" className="uni-input h-14" placeholder="Enter name" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="uni-label">Email Address</label>
                                        <input type="email" className="uni-input h-14" placeholder="Enter email" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="uni-label">Message</label>
                                    <textarea className="uni-input min-h-[150px] pt-4" placeholder="How can we help?"></textarea>
                                </div>
                                <MagneticButton>
                                    <button className="btn btn-primary w-full py-6 rounded-3xl text-lg font-black tracking-widest shadow-teal-lg flex items-center justify-center gap-3">
                                        Send Message
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </MagneticButton>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />

            <style>{`
                html {
                    scroll-behavior: smooth;
                    scroll-padding-top: 5rem;
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-spin-slow {
                    animation: spin 20s linear infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-30px); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .text-gradient {
                    background: linear-gradient(to right, #14B8A6, #0D9488);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .shadow-teal-lg {
                    box-shadow: 0 30px 60px -15px rgba(20, 184, 166, 0.4);
                }
            `}</style>
        </div>
    );
};

export default Landing;
