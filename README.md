# 🎓 VeriDegree

VeriDegree is a decentralized, privacy-preserving academic credential verification ecosystem. It leverages the Algorand blockchain to issue tamper-proof Soulbound Tokens (SBTs) representing degrees, IPFS for decentralized metadata storage, and Zero-Knowledge Proofs (zk-SNARKs) to allow students to prove their qualifications without revealing sensitive data like exact grades or CGPA.

## 🌟 Key Features

- **Immutable Credentials (SBTs):** Degrees are minted as Algorand Standard Assets (ASAs) with the `defaultFrozen` flag set to true, making them non-transferable "Soulbound" tokens tied permanently to the student's wallet.
- **Decentralized Storage:** Sensitive degree details are converted to JSON metadata and pinned to IPFS (via Pinata) ensuring permanent, immutable storage separate from the public blockchain ledger.
- **Privacy-Preserving Verification (ZK-Proofs):** Students can generate cryptographic proofs (using Circom & SnarkJS) in their browser to prove their CGPA crosses a specific threshold (e.g., ≥ 8.0) without exposing the actual number to recruiters.
- **"Trust Ecosystem" Flow:** A complete end-to-end mechanism involving University issuance, Student opt-in/claiming, Clawback token delivery, and Public/Recruiter verification.

## 🛠️ Technology Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Blockchain Integration:** Algorand SDK (`algosdk` v3), Algorand Testnet
- **Wallet Connection:** `@blockshake/defly-connect` (Defly Wallet API)
- **Decentralized Storage:** IPFS integration via Pinata API
- **Zero-Knowledge Engineering:** `circom`, `circomlib`, `snarkjs` (Groth16 zk-SNARKs computed via WebAssembly)

## 🏗️ Architecture & Workflow

1.  **University Portal (Issuance):** The University enters the student's details and CGPA. This metadata is uploaded to IPFS.
2.  **Algorand Minting:** The University mints a Soulbound Token using the IPFS URI, configuring themselves as the `clawback` and `manager` address.
3.  **Student Dashboard (Claiming):** The student receives the Asset ID and signs a 0-value "Opt-in" transaction to authorize their wallet to hold the asset.
4.  **Finalizing Transfer (Clawback):** Since the token is frozen upon creation, the University executes a Clawback transaction (`assetSender`) to bypass the freeze and successfully transfer the token to the student.
5.  **ZK-Proof Generation:** When requested by a recruiter, the student generates a ZK-Proof in their browser. `snarkjs` uses the private CGPA and public threshold, alongside the compiled WebAssembly (`.wasm`) circuit and proving key (`.zkey`), to output a downloadable `.json` proof.
6.  **Public Verifier:** A recruiter inputs the Asset ID and uploads the `.json` proof file. The system checks the Algorand Indexer to verify asset ownership, and cryptographically verifies the proof against the public signals.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- An Algorand wallet (Defly Wallet recommended) configured for the Testnet
- A Pinata account for IPFS uploads (API Key & Secret)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/veridegree.git
    cd veridegree
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env.local` file in the root directory and add your Pinata credentials:

    ```env
    NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
    NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_pinata_secret_api_key
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

5.  **Access the application:**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Zero-Knowledge Circuits

The ZK circuits are written in `circom` and located in `src/circuits/cgpa_verify.circom`. The necessary compiled artifacts (`cgpa_verify.wasm`, `cgpa_verify_0001.zkey`, and `verification_key.json`) are pre-generated and stored in `public/zk/` for immediate use by the frontend `snarkjs` implementation.

## 📄 License

This project is licensed under the MIT License.
