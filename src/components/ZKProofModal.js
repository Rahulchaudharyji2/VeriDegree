"use client";
import React, { useState } from 'react';
import { generateCGPAProof } from '@/lib/zkEngine';
import { ShieldCheck, Download, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ZKProofModal({ isOpen, onClose, asset }) {
    const [threshold, setThreshold] = useState(8.0);
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            toast.loading("Computing ZK-Proof...", { id: "zk-gen" });
            
            // In a real app, the CGPA would be fetched from the asset metadata on IPFS
            // For this demo, we'll assume the CGPA is 9.5 (or parse it from the asset name/url)
            // Ideally, we'd fetch the IPFS content here.
            
            // Simulate fetching actual CGPA from IPFS (metadata)
            const actualCGPA = 9.5; // This should come from the asset's metadata
            
            const { proof, publicSignals } = await generateCGPAProof(actualCGPA, threshold);
            
            const proofData = {
                proof,
                publicSignals,
                assetId: asset.id,
                threshold: threshold,
                institution: asset.creator,
                timestamp: new Date().toISOString()
            };

            const element = document.createElement("a");
            const file = new Blob([JSON.stringify(proofData, null, 2)], {type: 'application/json'});
            element.href = URL.createObjectURL(file);
            element.download = `VeriDegree_Proof_Asset_${asset.id}_GT_${threshold}.json`;
            document.body.appendChild(element);
            element.click();
            
            toast.success("ZK-Proof Generated and Downloaded!", { id: "zk-gen" });
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Generation failed: " + error.message, { id: "zk-gen" });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-card border border-gold/20 w-full max-w-md rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold/0 via-gold to-gold/0" />
                
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center text-gold mb-4">
                        <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Generate ZK-Proof</h2>
                    <p className="text-gray-400 mt-2 text-sm italic">
                        Prove your CGPA is above a threshold without revealing the exact number.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gold/80">Select Threshold to Prove</label>
                        <select 
                            value={threshold}
                            onChange={(e) => setThreshold(parseFloat(e.target.value))}
                            className="w-full bg-black border border-gold/10 p-3 rounded-xl focus:border-gold outline-none transition-all text-white"
                        >
                            <option value="6.0">CGPA ≥ 6.0</option>
                            <option value="7.0">CGPA ≥ 7.0</option>
                            <option value="8.0">CGPA ≥ 8.0</option>
                            <option value="9.0">CGPA ≥ 9.0</option>
                        </select>
                    </div>

                    <div className="bg-gold/5 p-4 rounded-xl border border-gold/10 text-xs text-gray-400 leading-relaxed">
                        <p><strong>Note:</strong> The proof will only be valid if your actual CGPA (stored in the Soulbound Token metadata) is greater than or equal to the selected threshold.</p>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" /> : <Download size={20} />}
                        Generate & Download Proof
                    </button>
                    
                    <button onClick={onClose} className="w-full text-center text-sm text-gray-500 hover:text-gray-300 transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
