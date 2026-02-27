"use client";
import React, { useState } from 'react';
import { fetchAssetDetails, indexerClient } from '@/lib/algorand';
import { Search, ShieldCheck, BadgeCheck, FileUp, Loader2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { verifyCGPAProof } from '@/lib/zkEngine';

export default function VerifyPage() {
    const [assetId, setAssetId] = useState('');
    const [assetData, setAssetData] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [zkFile, setZkFile] = useState(null);
    const [isVerifyingZk, setIsVerifyingZk] = useState(false);
    const [zkResult, setZkResult] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!assetId) return;
        
        setIsSearching(true);
        setAssetData(null);
        setZkResult(null);
        try {
            const details = await fetchAssetDetails(assetId);
            if (!details || !details.params) throw new Error("Asset not found");
            
            const holders = await indexerClient.lookupAssetBalances(assetId).do();
            const holder = holders.balances.find(b => BigInt(b.amount) > 0n);

            setAssetData({
                ...details.params,
                id: assetId,
                holder: holder ? holder.address : 'Burned/None'
            });
            toast.success("Asset details fetched!");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSearching(false);
        }
    };

    const handleVerifyZK = async () => {
        if (!zkFile) return toast.error("Please upload a proof file");
        
        setIsVerifyingZk(true);
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const proofObj = JSON.parse(e.target.result);
                    
                    toast.loading("Verifying Cryptographic Proof...", { id: "zk-v" });
                    
                    const isValid = await verifyCGPAProof(proofObj.proof, proofObj.publicSignals);
                    
                    if (isValid && proofObj.publicSignals[0] === "1") {
                        setZkResult({ success: true, message: `Valid Proof: CGPA is ≥ ${proofObj.threshold || '8.0'}` });
                        toast.success("ZK-Proof Verified!", { id: "zk-v" });
                    } else {
                        setZkResult({ success: false, message: "Invalid Proof or criteria not met" });
                        toast.error("Proof Verification Failed", { id: "zk-v" });
                    }
                } catch (err) {
                    toast.error("Invalid proof file format", { id: "zk-v" });
                } finally {
                    setIsVerifyingZk(false);
                }
            };
            reader.readAsText(zkFile);
        } catch (error) {
            toast.error("Error reading file");
            setIsVerifyingZk(false);
        }
    };

    return (
        <main className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-gold mb-4 flex items-center justify-center gap-4">
                        <BadgeCheck size={56} />
                        Public Verifier
                    </h1>
                    <p className="text-gray-400 text-lg">Independently verify academic credentials and disclosure claims</p>
                </header>

                <div className="space-y-8">
                    {/* Search Section */}
                    <div className="bg-card border border-gold/20 p-8 rounded-3xl shadow-xl">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                <input 
                                    value={assetId}
                                    onChange={e => setAssetId(e.target.value)}
                                    className="w-full bg-black border border-gold/10 p-4 pl-12 rounded-xl focus:border-gold outline-none transition-all"
                                    placeholder="Enter Asset ID (e.g. 12345678)"
                                />
                            </div>
                            <button 
                                disabled={isSearching}
                                className="bg-gold hover:bg-gold-dark text-black font-bold px-8 rounded-xl transition-all flex items-center gap-2"
                            >
                                {isSearching ? <Loader2 className="animate-spin" /> : "Verify Asset"}
                            </button>
                        </form>

                        {assetData && (
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gold/10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="text-green-500" />
                                        <h3 className="text-xl font-bold text-white">Authentic Degree</h3>
                                    </div>
                                    <div className="space-y-2 opacity-80">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Asset Name:</span>
                                            <span className="text-gold font-medium">{assetData.name}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Creator (University):</span>
                                            <span className="text-gold font-mono text-xs">{assetData.creator.slice(0, 10)}...</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Current Holder:</span>
                                            <span className="text-gold font-mono text-xs">{assetData.holder.slice(0, 10)}...</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-black/50 p-6 rounded-2xl border border-gold/5">
                                    <h4 className="text-sm font-bold text-gold/60 mb-4 flex items-center gap-2">
                                        <FileUp size={16} /> SELECTIVE DISCLOSURE (ZK)
                                    </h4>
                                    <div className="space-y-4">
                                        <input 
                                            type="file" 
                                            onChange={e => setZkFile(e.target.files[0])}
                                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20"
                                        />
                                        <button 
                                            onClick={handleVerifyZK}
                                            disabled={!zkFile || isVerifyingZk}
                                            className="w-full bg-white/5 hover:bg-white/10 text-white text-sm font-bold py-2 rounded-lg border border-white/10 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isVerifyingZk ? <Loader2 className="animate-spin" size={16} /> : "Verify CGPA > 8.0 claim"}
                                        </button>

                                        {zkResult && (
                                            <div className={`mt-4 p-3 rounded-lg text-center font-bold text-sm ${zkResult.success ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                                {zkResult.success ? <BadgeCheck className="inline mr-2" size={18} /> : <XCircle className="inline mr-2" size={18} />}
                                                {zkResult.message}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 text-center text-gray-500 text-sm">
                    <p>Trust but Verify. All records are decentralized on the Algorand Blockchain.</p>
                </div>
            </div>
        </main>
    );
}
