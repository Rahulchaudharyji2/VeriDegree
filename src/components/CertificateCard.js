"use client";
import React from 'react';
import { GraduationCap, ShieldCheck, ChevronRight } from 'lucide-react';

export default function CertificateCard({ asset, onGenerateProof }) {
    return (
        <div className="bg-card border border-gold/20 p-6 rounded-2xl hover:border-gold/50 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShieldCheck size={80} className="text-gold" />
            </div>
            
            <div className="flex justify-between items-start mb-6 relative">
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
                    <GraduationCap size={28} />
                </div>
                <span className="text-[10px] text-gray-500 font-mono tracking-wider bg-black/40 px-2 py-1 rounded border border-gold/10">
                    ID: {asset.id}
                </span>
            </div>
            
            <div className="relative mb-6">
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-gold transition-colors">{asset.name}</h3>
                <p className="text-xs text-gold/40 font-mono truncate max-w-[200px]">{asset.url}</p>
            </div>
            
            <div className="space-y-3 relative">
                <button 
                    onClick={() => onGenerateProof(asset)}
                    className="w-full bg-gold/5 hover:bg-gold text-gold hover:text-black font-semibold py-2.5 rounded-lg border border-gold transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(235,203,144,0.3)]"
                >
                    <ShieldCheck size={16} />
                    Prove CGPA Claim
                </button>
                <a 
                    href={`https://testnet.algoexplorer.io/asset/${asset.id}`}
                    target="_blank"
                    className="w-full text-center text-[10px] uppercase font-bold tracking-widest text-gray-500 hover:text-gold flex items-center justify-center gap-1 py-1 transition-colors"
                >
                    Blockchain Record <ChevronRight size={12} />
                </a>
            </div>
        </div>
    );
}
