// src/pages/Marketplace.jsx 
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Marketplace() {
  const [loans, setLoans] = useState([]);
  const navigate = useNavigate();

  // ✅ fetch loans from backend with debug logs
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        console.log("📡 Fetching loans from backend...");
        const res = await axios.get("http://127.0.0.1:8000/loans");
        console.log("✅ Loans fetched:", res.data);
        setLoans(res.data);
      } catch (err) {
        console.error("❌ Failed to load loans:", err);
      }
    };
    fetchLoans();
  }, []);

  return (
    <div className="pt-24 pb-10 max-w-6xl mx-auto px-6">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">
        Loan Marketplace
      </h1>
      <p className="text-center text-gray-600 mb-12">
        Browse available loan requests and invest directly in borrowers.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loans.length === 0 ? (
          <p className="text-center col-span-full text-gray-500">
            No loans available or failed to fetch loans.
          </p>
        ) : (
          loans.map((loan) => (
            <div
              key={loan.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">
                {loan.wallet_address}
              </h2>
              <p className="text-gray-700 mb-1">
                <strong>Amount:</strong> ${loan.amount}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Rate:</strong> {loan.rate}%
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Duration:</strong> {loan.repayment_period} months
              </p>
              <p className="text-gray-600 mb-4">
                <strong>Purpose:</strong> {loan.purpose}
              </p>
              <button 
                onClick={() => navigate(`/fund-loan/${loan.id}`)}
                className="!bg-blue-600 bg-opacity-100 hover:!bg-blue-800 text-white font-bold px-6 py-2 rounded shadow-lg border border-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Fund Loan
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
