import * as snarkjs from 'snarkjs';

/**
 * Generate a ZK-Proof that CGPA >= Threshold
 * @param {number} cgpa - The actual CGPA (e.g., 9.50)
 * @param {number} threshold - The target threshold (e.g., 8.00)
 */
export async function generateCGPAProof(cgpa, threshold) {
    // Map to integer for circuit: 9.50 -> 950, 8.00 -> 800
    const cgpaInt = Math.round(parseFloat(cgpa) * 100);
    const thresholdInt = Math.round(parseFloat(threshold) * 100);

    const wasmPath = "/zk/cgpa_verify.wasm";
    const zkeyPath = "/zk/cgpa_verify_0001.zkey";

    try {
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            { cgpa: cgpaInt, threshold: thresholdInt },
            wasmPath,
            zkeyPath
        );

        return { proof, publicSignals };
    } catch (error) {
        console.error("Error generating proof:", error);
        throw error;
    }
}

/**
 * Verify a ZK-Proof
 * @param {object} proof 
 * @param {array} publicSignals 
 */
export async function verifyCGPAProof(proof, publicSignals) {
    const vkeyPath = "/zk/verification_key.json";

    try {
        const vKeyResponse = await fetch(vkeyPath);
        const vKey = await vKeyResponse.json();

        const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
        return res;
    } catch (error) {
        console.error("Error verifying proof:", error);
        return false;
    }
}
