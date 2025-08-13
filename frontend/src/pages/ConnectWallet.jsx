// src/pages/ConnectWallet.jsx
import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function ConnectWallet() {
  const { loanId } = useParams();
  const [searchParams] = useSearchParams();
  const amount = searchParams.get("amount");

  // Form state
  const [senderAddress, setSenderAddress] = useState("");
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const ESCROW_ADDRESS = "0xYourEscrowWalletAddress"; // TODO: Replace with actual escrow wallet

  const handleConfirmTransaction = async () => {
    if (!senderAddress || !txHash) {
      setError("Please enter your wallet address and transaction hash.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Send verification request to backend
      const res = await axios.post("http://127.0.0.1:8000/verify-payment", {
        loan_id: Number(loanId),
        sender_wallet: senderAddress,
        tx_hash: txHash,
      });

      setMessage(res.data.message || "Transaction verified successfully!");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Failed to verify transaction. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">Fund Loan Payment</h2>

      <div className="mb-6 p-4 bg-gray-100 rounded border">
        <p><strong>Escrow Wallet Address:</strong> {ESCROW_ADDRESS}</p>
        <p><strong>Amount (USDT):</strong> {amount}</p>
        <p><strong>Network:</strong> Ethereum Mainnet</p>
        <p className="mt-2 text-sm text-gray-500">
          Please send exactly the above amount to the escrow wallet.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Your Wallet Address</label>
          <input
            type="text"
            value={senderAddress}
            onChange={(e) => setSenderAddress(e.target.value)}
            placeholder="Enter the wallet you sent funds from"
            className="border rounded p-2 w-full"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Transaction Hash</label>
          <input
            type="text"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="Enter transaction hash"
            className="border rounded p-2 w-full"
          />
        </div>

        <button
          onClick={handleConfirmTransaction}
          disabled={loading}
          className="!bg-green-600 bg-opacity-100 hover:!bg-green-800 text-white font-bold px-6 py-2 rounded shadow-lg border border-green-700 transition-all disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Confirm Transaction"}
        </button>
      </div>

      {error && <p className="mt-4 text-red-600">{error}</p>}
      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}
