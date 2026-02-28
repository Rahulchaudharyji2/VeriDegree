"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useWallet } from '@/lib/WalletContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    GraduationCap, 
    Github, 
    LogOut, 
    User, 
    Wallet, 
    LayoutDashboard, 
    FilePlus, 
    Search,
    ShieldCheck,
    Menu,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();
    const { disconnect } = useWallet();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        if (session?.user?.role === "STUDENT") {
            disconnect();
        }
        toast.success("Signed out successfully");
        router.push("/");
    };

    const isActive = (path) => pathname === path;

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 px-6 py-4 ${isScrolled ? 'pt-4' : 'pt-6'}`}>
            <div className={`max-w-7xl mx-auto glass rounded-[2rem] px-8 h-16 flex justify-between items-center transition-all duration-500 ${isScrolled ? 'shadow-gold-glow border-gold/20 bg-black/60' : 'border-white/5'}`}>
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center border border-gold/20 group-hover:border-gold transition-all duration-500 shadow-gold-glow">
                        <GraduationCap size={22} className="text-gold group-hover:rotate-12 transition-transform" />
                    </div>
                    <span className="text-xl font-black text-white tracking-widest uppercase hidden lg:block">Veri<span className="text-gold italic">Degree</span></span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-8">
                    <Link 
                        href="/verify"
                        className={`text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${isActive('/verify') ? 'text-gold' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Search size={14} /> Verify
                    </Link>

                    {session?.user?.role === "UNIVERSITY" && (
                        <Link 
                            href="/issue"
                            className={`text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${isActive('/issue') ? 'text-gold' : 'text-gray-400 hover:text-white'}`}
                        >
                            <FilePlus size={14} /> Issue
                        </Link>
                    )}

                    {session?.user?.role === "STUDENT" && (
                        <Link 
                            href="/dashboard"
                            className={`text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${isActive('/dashboard') ? 'text-gold' : 'text-gray-400 hover:text-white'}`}
                        >
                            <LayoutDashboard size={14} /> My Vault
                        </Link>
                    )}
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">
                    <AnimatePresence mode="wait">
                        {session ? (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center gap-4"
                            >
                                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl ring-1 ring-white/5">
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${session.user.role === "UNIVERSITY" ? 'bg-blue-400' : 'bg-gold'}`} />
                                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest max-w-[100px] truncate">
                                        {session.user.role === "UNIVERSITY" ? "Institution" : (session.user.address?.slice(0, 4) + "..." + session.user.address?.slice(-4))}
                                    </span>
                                </div>

                                <button 
                                    onClick={handleSignOut}
                                    className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20 group"
                                >
                                    <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-4"
                            >
                                <Link 
                                    href="/login"
                                    className="bg-gold hover:bg-gold-dark text-black font-black px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] uppercase tracking-widest shadow-gold-glow hover:-translate-y-0.5 active:scale-95"
                                >
                                    <ShieldCheck size={16} />
                                    <span>Sign In</span>
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="h-6 w-px bg-white/10 hidden lg:block" />

                    <a 
                        href="https://github.com" 
                        target="_blank" 
                        className="p-2.5 glass text-gray-400 rounded-xl hover:text-gold hover:border-gold/30 transition-all hidden lg:flex"
                    >
                        <Github size={18} />
                    </a>
                </div>
            </div>
        </nav>
    );
}
