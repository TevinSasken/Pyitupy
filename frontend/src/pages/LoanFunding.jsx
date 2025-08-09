// src/pages/LoanFunding.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoanFunding() {
  const { loanId } = useParams(); // loanId from URL
  const navigate = useNavigate();

  const [loan, setLoan] = useState(null);
  const [fundAmount, setFundAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ✅ Fetch loan details from backend
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

  const handleFunding = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await axios.post("http://127.0.0.1:8000/loans/fund", {
        loan_id: Number(loanId), // ✅ match backend naming exactly
        amount: parseFloat(fundAmount),
        lender_wallet: "0xSampleLenderWallet" // ✅ placeholder wallet
      });

      navigate("/funding-confirmation");
    } catch (err) {
      console.error(err);
      setError("Funding failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6">Loading loan details...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Fund Loan</h2>

      <div className="mb-6">
        <p><strong>Borrower Wallet:</strong> {loan.wallet_address}</p>
        <p><strong>Loan Amount Requested:</strong> ${loan.amount}</p>
        <p><strong>Purpose:</strong> {loan.purpose}</p>
        <p><strong>Repayment Period:</strong> {loan.repayment_period} months</p>
        <p><strong>Interest Rate:</strong> {loan.rate}%</p>
      </div>

      <form onSubmit={handleFunding} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Funding Amount</label>
          <input
            type="number"
            step="0.01"
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
            className="border rounded p-2 w-full"
            placeholder="Enter amount to fund"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="!bg-blue-600 bg-opacity-100 hover:!bg-blue-800 text-white font-bold px-6 py-2 rounded shadow-lg border border-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Processing..." : "Confirm Funding"}
        </button>
      </form>
    </div>
  );
}
