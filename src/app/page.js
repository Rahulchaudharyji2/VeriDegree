"use client";
import React from 'react';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, BadgeCheck, ArrowRight, Github } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background selection:bg-gold/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gold/5 blur-[120px] rounded-full" />
        
        <div className="max-w-7xl mx-auto px-8 relative">

          <div className="max-w-3xl">
            <h1 className="text-7xl font-bold text-white leading-tight mb-8">
              The Future of <br />
              <span className="text-gold">Academic Trust</span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 leading-relaxed max-w-2xl">
              Issue, manage, and verify academic credentials with absolute certainty. 
              Powered by Algorand Soulbound Tokens and privacy-preserving Zero-Knowledge Proofs.
            </p>

            <div className="flex gap-6">
              <Link href="/dashboard" className="bg-gold hover:bg-gold-dark text-black font-bold px-8 py-4 rounded-xl flex items-center gap-3 transition-all transform hover:scale-105">
                Join as Student <ArrowRight size={20} />
              </Link>
              <Link href="/issue" className="bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-4 rounded-xl border border-white/10 transition-all">
                For Universities
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-8 py-32 border-t border-gold/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Soulbound Security</h3>
            <p className="text-gray-500 leading-relaxed">
              Degrees are issued as non-transferable ASAs on Algorand, ensuring permanent and immutable ownership.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
              <BadgeCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">ZKP Selective Disclosure</h3>
            <p className="text-gray-500 leading-relaxed">
              Students can prove they meet criteria (like CGPA &gt; 8.0) without revealing their entire academic transcript.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
              <ArrowRight size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Instant Verification</h3>
            <p className="text-gray-500 leading-relaxed">
              Recruiters can verify authenticity in seconds via the Algorand blockchain and cryptographic proof validation.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-8 py-12 border-t border-gold/5 flex justify-between items-center text-gray-600 text-sm">
        <p>&copy; 2024 VeriDegree Protocol. Built on Algorand Testnet.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-gold transition-colors">Terms</a>
          <a href="#" className="hover:text-gold transition-colors">Privacy</a>
          <a href="#" className="hover:text-gold transition-colors">Documentation</a>
        </div>
      </footer>
    </main>
  );
}
