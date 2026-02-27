"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, Github } from 'lucide-react';
import WalletConnect from './WalletConnect';

export default function Navbar() {
    const pathname = usePathname();

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Issue', href: '/issue' },
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Verify', href: '/verify' },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-gold/10">
            <div className="max-w-7xl mx-auto px-8 h-20 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 text-gold font-bold text-2xl group">
                    <GraduationCap size={32} className="group-hover:rotate-12 transition-transform" />
                    <span className="tracking-tighter">VeriDegree</span>
                </Link>

                <div className="flex items-center gap-10">
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.href} 
                                href={link.href}
                                className={`text-sm font-medium transition-colors hover:text-gold ${pathname === link.href ? 'text-gold' : 'text-gray-400'}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                    
                    <div className="h-6 w-px bg-gold/10 mx-2 hidden md:block" />

                    <div className="flex items-center gap-4">
                        <WalletConnect />
                        <a 
                            href="https://github.com" 
                            target="_blank" 
                            className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 hover:text-gold transition-all border border-white/5"
                        >
                            <Github size={20} />
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
}
