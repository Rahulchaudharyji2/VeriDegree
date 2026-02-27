"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { DeflyWalletConnect } from "@blockshake/defly-connect";
import toast from 'react-hot-toast';
import { cleanAddress } from './algorand';

const WalletContext = createContext();
const deflyWallet = new DeflyWalletConnect();

export function WalletProvider({ children }) {
    const [accountAddress, setAccountAddress] = useState(null);

    useEffect(() => {
        deflyWallet.reconnectSession().then((accounts) => {
            if (accounts.length) {
                setAccountAddress(cleanAddress(accounts[0]));
            }
        });
    }, []);

    const connect = async () => {
        try {
            const newAccounts = await deflyWallet.connect();
            const addr = cleanAddress(newAccounts[0]);
            setAccountAddress(addr);
            toast.success("Defly Wallet Connected!");
            return addr;
        } catch (error) {
            console.error(error);
            toast.error("Connection Failed");
        }
    };

    const disconnect = () => {
        deflyWallet.disconnect();
        setAccountAddress(null);
        toast.error("Wallet Disconnected");
    };

    return (
        <WalletContext.Provider value={{ accountAddress, connect, disconnect, deflyWallet }}>
            {children}
        </WalletContext.Provider>
    );
}

export const useWallet = () => useContext(WalletContext);
