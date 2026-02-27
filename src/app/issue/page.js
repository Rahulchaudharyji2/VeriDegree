"use client";
import React, { useState } from 'react';
import { useWallet } from '@/lib/WalletContext';
import { algodClient, mintSBT, cleanAddress, waitForConfirmation, transferAsset } from "@/lib/algorand";
import { uploadJSONToIPFS } from '@/lib/ipfs';
import { GraduationCap, User, FileText, BarChart, Send, Loader2, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

export default function IssuePage() {
    const { accountAddress, deflyWallet } = useWallet();
    const [formData, setFormData] = useState({
        studentName: '',
        studentAddr: '',
        degree: '',
        cgpa: '',
        gradYear: (new Date()).getFullYear(),
    });
    const [isIssuing, setIsIssuing] = useState(false);
    const [mintedAssetId, setMintedAssetId] = useState(null);
    const [isTransferring, setIsTransferring] = useState(false);

    const handleTransfer = async () => {
        if (!mintedAssetId || !formData.studentAddr) return;
        setIsTransferring(true);
        try {
            toast.loading("Initiating Transfer...", { id: "transfer" });
            const sAddr = cleanAddress(formData.studentAddr);
            const cAddr = cleanAddress(accountAddress);

            const txn = await transferAsset(cAddr, sAddr, mintedAssetId);
            const singleTxnGroups = [{ txn: txn, signers: [cAddr] }];
            
            toast.loading("Sign Transfer in Defly...", { id: "transfer" });
            const signedTxn = await deflyWallet.signTransaction([singleTxnGroups]);
            
            toast.loading("Broadcasting Transfer...", { id: "transfer" });
            const { txid } = await algodClient.sendRawTransaction(signedTxn).do();
            
            toast.loading("Confirming Transfer...", { id: "transfer" });
            await waitForConfirmation(algodClient, txid, 4);

            toast.success("Degree Successfully Transferred to Student!", { id: "transfer", duration: 5000 });
            setMintedAssetId(null);
            setFormData({ studentName: '', studentAddr: '', degree: '', cgpa: '', gradYear: 2026 });
        } catch (error) {
            console.error("Transfer error:", error);
            toast.error("Transfer failed: " + (error.message || "Ensure student has opted in"), { id: "transfer" });
        } finally {
            setIsTransferring(false);
        }
    };

    const handleIssue = async (e) => {
        e.preventDefault();
        console.log("[DEBUG] handleIssue clicked. current accountAddress:", accountAddress);

        if (!accountAddress) {
            return toast.error("Connect your Defly Wallet first!");
        }
        
        setIsIssuing(true);
        try {
            // 1. Upload to IPFS
            toast.loading("Uploading metadata to IPFS...", { id: "issue" });
            const metadata = {
                ...formData,
                issuer: accountAddress,
                type: "VeriDegree SBT",
                timestamp: new Date().toISOString()
            };
            const ipfsHash = await uploadJSONToIPFS(metadata);
            const assetUrl = `ipfs://${ipfsHash}`;
            console.log("[DEBUG] IPFS Upload success:", assetUrl);

            // 2. Prepare Mint Txn
            toast.loading("Building Algorand Transaction...", { id: "issue" });
            
            if (typeof cleanAddress !== 'function') {
                console.error("[CRITICAL] cleanAddress is not a function! Scope check:", { cleanAddress });
                throw new Error("Internal Error: Wallet utility 'cleanAddress' is missing. Please refresh the page.");
            }

            const sAddr = cleanAddress(formData.studentAddr);
            const cAddr = cleanAddress(accountAddress);
            const sName = String(formData.studentName || "").trim();

            console.log("[DEBUG_V3] Cleaned Inputs:", { cAddr, sAddr, sName });

            if (!sAddr) throw new Error("Invalid student address format");
            if (!cAddr) throw new Error("Please reconnect your wallet - invalid address detected");

            const txn = await mintSBT(
                cAddr, 
                sAddr, 
                `${sName}'s Degree`, 
                assetUrl
            );

            // 3. Sign with Defly
            toast.loading("Approve in your Defly App...", { id: "issue" });
            const singleTxnGroups = [{ txn: txn, signers: [cAddr] }];
            const signedTxn = await deflyWallet.signTransaction([singleTxnGroups]);
            console.log("[DEBUG] Transaction signed successfully");
            
            // 4. Send Txn
            toast.loading("Broadcasting Transaction...", { id: "issue" });
            const { txid } = await algodClient.sendRawTransaction(signedTxn).do();
            console.log("[DEBUG] Broadcasted! TxId:", txid);
            
            // 5. Wait for Confirmation
            toast.loading("Waiting for confirmation...", { id: "issue" });
            const result = await waitForConfirmation(algodClient, txid, 4);
            const assetIndex = result.assetIndex;

            toast.success(`Minted! Asset ID: ${assetIndex}. Waiting for student opt-in.`, { id: "issue", duration: 8000 });
            setMintedAssetId(assetIndex);
            // Don't clear form data yet, we need it for the transfer step
        } catch (error) {
            console.error("[CRITICAL] handleIssue error:", error);
            toast.error("Process Failed: " + (error.message || "Unknown error"), { id: "issue" });
        } finally {
            setIsIssuing(false);
        }
    };

    return (
        <main className="min-h-screen bg-background p-8">
            <div className="max-w-2xl mx-auto">
                <header className="flex flex-col items-center mb-12 text-center">
                    <div className="bg-gold/10 p-4 rounded-full mb-4">
                        <GraduationCap size={48} className="text-gold" />
                    </div>
                    <h1 className="text-5xl font-bold text-white tracking-tight">Institution Portal</h1>
                    <p className="text-gray-400 mt-2 text-lg">Issue secure, non-transferable academic credentials</p>
                </header>

                <form onSubmit={handleIssue} className="bg-card/40 border border-white/10 p-10 rounded-[2.5rem] shadow-3xl backdrop-blur-xl animate-in fade-in zoom-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gold uppercase tracking-widest flex items-center gap-2">
                                <User size={14} /> Student Name
                            </label>
                            <input 
                                required
                                value={formData.studentName}
                                onChange={e => setFormData({...formData, studentName: e.target.value})}
                                className="w-full bg-black/50 border border-white/5 p-4 rounded-2xl focus:border-gold/50 focus:bg-black/80 outline-none transition-all text-white placeholder:text-white/20"
                                placeholder="Full name of student"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gold uppercase tracking-widest flex items-center gap-2">
                                <Wallet size={14} /> Student Address
                            </label>
                            <input 
                                required
                                value={formData.studentAddr}
                                onChange={e => setFormData({...formData, studentAddr: e.target.value})}
                                className="w-full bg-black/50 border border-white/5 p-4 rounded-2xl focus:border-gold/50 focus:bg-black/80 outline-none transition-all text-white placeholder:text-white/20 font-mono text-sm"
                                placeholder="ALGO Address..."
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gold uppercase tracking-widest flex items-center gap-2">
                                <FileText size={14} /> Degree / Major
                            </label>
                            <input 
                                required
                                value={formData.degree}
                                onChange={e => setFormData({...formData, degree: e.target.value})}
                                className="w-full bg-black/50 border border-white/5 p-4 rounded-2xl focus:border-gold/50 focus:bg-black/80 outline-none transition-all text-white placeholder:text-white/20"
                                placeholder="e.g. B.Tech Computer Science"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gold uppercase tracking-widest flex items-center gap-2">
                                <BarChart size={14} /> CGPA
                            </label>
                            <input 
                                required
                                type="number" step="0.01"
                                value={formData.cgpa}
                                onChange={e => setFormData({...formData, cgpa: e.target.value})}
                                className="w-full bg-black/50 border border-white/5 p-4 rounded-2xl focus:border-gold/50 focus:bg-black/80 outline-none transition-all text-white placeholder:text-white/20"
                                placeholder="0.00 - 10.00"
                            />
                        </div>
                    </div>

                    <div className="mt-8 space-y-3">
                        <label className="text-xs font-bold text-gold uppercase tracking-widest">Graduation Year</label>
                        <input 
                            required
                            type="number"
                            value={formData.gradYear}
                            onChange={e => setFormData({...formData, gradYear: e.target.value})}
                            className="w-full bg-black/50 border border-white/5 p-4 rounded-2xl focus:border-gold/50 focus:bg-black/80 outline-none transition-all text-white"
                        />
                    </div>

                    <button 
                        disabled={isIssuing}
                        className="w-full bg-gold hover:bg-[#D4B579] disabled:opacity-30 disabled:cursor-not-allowed text-black font-black py-5 rounded-[1.25rem] flex items-center justify-center gap-4 transition-all mt-10 shadow-[0_10px_40px_rgba(235,203,144,0.3)] hover:shadow-[0_15px_50px_rgba(235,203,144,0.4)] transform hover:-translate-y-1 active:translate-y-0 text-lg uppercase tracking-tight"
                    >
                        {isIssuing ? (
                            <>
                                <Loader2 className="animate-spin" size={24} />
                                processing...
                            </>
                        ) : (
                            <>
                                <Send size={24} />
                                Mint Soulbound Degree
                            </>
                        )}
                    </button>

                    {mintedAssetId && (
                        <div className="mt-8 p-6 bg-gold/10 border border-gold/30 rounded-2xl text-center space-y-4 animate-in slide-in-from-bottom-4">
                            <h3 className="text-xl font-bold text-gold">Asset Minted: {mintedAssetId}</h3>
                            <p className="text-sm text-gray-300">
                                Please ask the student to <strong className="text-white">Opt-in</strong> to Asset ID <strong>{mintedAssetId}</strong> from their dashboard. Once they have done so, click below to finalize the transfer.
                            </p>
                            <button
                                type="button"
                                onClick={handleTransfer}
                                disabled={isTransferring}
                                className="w-full bg-[#D4B579] hover:bg-gold disabled:opacity-50 text-black font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all"
                            >
                                {isTransferring ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <Send size={20} />
                                )}
                                Finalize Transfer to Student
                            </button>
                        </div>
                    )}
                    
                    {!accountAddress && (
                        <p className="text-center text-gold/60 text-sm mt-6 font-medium bg-gold/5 py-2 rounded-full border border-gold/10 animate-pulse italic">
                            Connect institution wallet in the top bar to proceed
                        </p>
                    )}
                </form>
            </div>
        </main>
    );
}
