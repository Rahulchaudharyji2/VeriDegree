import { WalletProvider } from "@/lib/WalletContext";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata = {
  title: "VeriDegree | Decentralized Academic Credentials",
  description: "Secure, private, and verifiable soulbound degrees on Algorand.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground pt-20">
        <WalletProvider>
          <Navbar />
          <Toaster position="bottom-right" toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#EBCB90',
              border: '1px solid #EBCB9033',
            }
          }} />
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
