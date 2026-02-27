"use client";
import React, { useState, useEffect } from 'react';
import { useWallet } from '@/lib/WalletContext';
import { fetchUserAssets, fetchAssetDetails, optInAsset, cleanAddress, algodClient, waitForConfirmation } from '@/lib/algorand';
import { ShieldCheck, Loader2, Search, PlusCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ZKProofModal from '@/components/ZKProofModal';
import CertificateCard from '@/components/CertificateCard';

export default function DashboardPage() {
    const { accountAddress, deflyWallet } = useWallet();
    const [assets, setAssets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Opt-in state
    const [claimAssetId, setClaimAssetId] = useState('');
    const [isClaiming, setIsClaiming] = useState(false);

    useEffect(() => {
        if (accountAddress) {
            loadAssets();
        } else {
            setAssets([]);
        }
    }, [accountAddress]);

    const loadAssets = async () => {
        setIsLoading(true);
        try {
            const userAssets = await fetchUserAssets(accountAddress);
            const degreeAssets = [];
            for (const asset of userAssets) {
                const details = await fetchAssetDetails(asset.assetId);
                // Check if the asset has a name and it includes "Degree"
                if (details && details.params && details.params.name && details.params.name.includes("Degree")) {
                    degreeAssets.push({
                        id: asset.assetId,
                        amount: asset.amount,
                        name: details.params.name,
                        url: details.params.url,
                        creator: details.params.creator
                    });
                }
            }
            setAssets(degreeAssets);
        } catch (error) {
            console.error("Error loading assets:", error);
            toast.error("Failed to load degrees");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenProofModal = (asset) => {
        setSelectedAsset(asset);
        setIsModalOpen(true);
    };

    const handleClaim = async (e) => {
        e.preventDefault();
        if (!claimAssetId) return;

        setIsClaiming(true);
        try {
            toast.loading("Initiating Opt-in...", { id: "claim" });
            const sAddr = cleanAddress(accountAddress);
            
            const txn = await optInAsset(sAddr, claimAssetId);

            toast.loading("Sign Opt-in Transaction...", { id: "claim" });
            const singleTxnGroups = [{ txn: txn, signers: [sAddr] }];
            const signedTxn = await deflyWallet.signTransaction([singleTxnGroups]);
            
            toast.loading("Broadcasting...", { id: "claim" });
            const { txid } = await algodClient.sendRawTransaction(signedTxn).do();
            
            toast.loading("Confirming...", { id: "claim" });
            await waitForConfirmation(algodClient, txid, 4);

            toast.success("Successfully Opted-in! Waiting for University Transfer...", { id: "claim", duration: 8000 });
            setClaimAssetId('');
            // Reload assets to show the new one with 0 balance
            loadAssets();
        } catch (error) {
            console.error(error);
            toast.error("Opt-in failed: " + (error?.message || "Ensure you are connected"), { id: "claim" });
        } finally {
            setIsClaiming(false);
        }
    };

    return (
        <main className="min-h-screen bg-background p-8">
            <div className="max-w-5xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
                    <div className="animate-in fade-in slide-in-from-left duration-700">
                        <h1 className="text-4xl font-bold text-gold flex items-center gap-3">
                            <ShieldCheck size={40} className="text-gold animate-pulse" />
                            Student Dashboard
                        </h1>
                        <p className="text-gray-400 mt-2">Manage your soulbound academic credentials</p>
                    </div>
                </header>

                {accountAddress && (
                    <div className="mb-12 bg-card border border-gold/20 p-6 rounded-3xl shadow-xl animate-in slide-in-from-top duration-500">
                        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <PlusCircle className="text-gold" />
                                    Claim New Degree
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">Enter the Asset ID provided by your University to Opt-in.</p>
                            </div>
                            <form onSubmit={handleClaim} className="flex w-full md:w-auto gap-3">
                                <input 
                                    type="number"
                                    value={claimAssetId}
                                    onChange={e => setClaimAssetId(e.target.value)}
                                    placeholder="Asset ID"
                                    className="bg-black/50 border border-white/10 p-3 rounded-xl focus:border-gold outline-none transition-all text-white w-full md:w-48"
                                    required
                                />
                                <button 
                                    disabled={isClaiming || !claimAssetId}
                                    className="bg-gold hover:bg-gold-dark disabled:opacity-50 text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all"
                                >
                                    {isClaiming ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                    Opt-in
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {!accountAddress ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-card/30 border border-gold/10 rounded-3xl backdrop-blur-sm animate-in zoom-in duration-500">
                        <Search size={64} className="text-gold/20 mb-6" />
                        <h2 className="text-2xl font-semibold text-gold/60">Connect wallet to view your degrees</h2>
                        <p className="text-gray-500 mt-2">Ensure you are on Algorand Testnet</p>
                    </div>
                ) : isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="animate-spin text-gold mb-4" size={48} />
                        <p className="text-gold/60 animate-pulse font-mono text-sm tracking-widest">FETCHING ASSETS...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
                        {assets.length > 0 ? assets.map((asset) => (
                            <CertificateCard 
                                key={asset.id} 
                                asset={asset} 
                                onGenerateProof={handleOpenProofModal} 
                            />
                        )) : (
                            <div className="col-span-full py-24 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                                <p className="text-gray-500 italic">No VeriDegree SBTs found in this wallet.</p>
                            </div>
                        )}
                        
                        <ZKProofModal 
                            isOpen={isModalOpen} 
                            onClose={() => setIsModalOpen(false)} 
                            asset={selectedAsset} 
                        />
                    </div>
                )}
            </div>
        </main>
    );
}
