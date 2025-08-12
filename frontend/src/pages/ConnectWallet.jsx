// src/pages/ConnectWallet.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ConnectWallet() {
  const { loanId } = useParams();
  const navigate = useNavigate();

  const [loan, setLoan] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch loan details
  useEffect(() => {
    const fetchLoan = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/loans/${loanId}`);
        setLoan(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load loan details.");
      } finally {
        setLoading(false);
      }
    };
    fetchLoan();
  }, [loanId]);

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install it first.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(accounts[0]);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to connect wallet.");
    }
  };

  // Proceed to funding page
  const proceedToFunding = () => {
    navigate(`/fund-loan/${loanId}`, { state: { lenderWallet: walletAddress } });
  };

  if (loading) return <p className="p-6">Loading loan details...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>

      {loan && (
        <div className="mb-6">
          <p><strong>Borrower Wallet:</strong> {loan.wallet_address}</p>
          <p><strong>Loan Amount Requested:</strong> ${loan.amount}</p>
          <p><strong>Purpose:</strong> {loan.purpose}</p>
          <p><strong>Repayment Period:</strong> {loan.repayment_period} months</p>
          <p><strong>Interest Rate:</strong> {loan.rate}%</p>
        </div>
      )}

      {!walletAddress ? (
        <button
          onClick={connectWallet}
          className="!bg-blue-600 bg-opacity-100 hover:!bg-blue-800 text-white font-bold px-6 py-2 rounded shadow-lg border border-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Connect Wallet
        </button>
      ) : (
        <div>
          <p className="mb-4 text-green-600">
            ✅ Connected wallet: {walletAddress}
          </p>
          <button
            onClick={proceedToFunding}
            className="!bg-blue-600 bg-opacity-100 hover:!bg-blue-800 text-white font-bold px-6 py-2 rounded shadow-lg border border-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Proceed to Funding
          </button>
        </div>
      )}
    </div>
  );
}
