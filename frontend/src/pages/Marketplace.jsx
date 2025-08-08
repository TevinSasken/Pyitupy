// src/pages/Marketplace.jsx
import { useState } from "react";

export default function Marketplace() {
  const [loans] = useState([
    {
      id: 1,
      borrower: "John Doe",
      amount: 500,
      rate: 12,
      duration: "6 months",
      purpose: "Expand small business",
    },
    {
      id: 2,
      borrower: "Mary Wanjiku",
      amount: 300,
      rate: 10,
      duration: "3 months",
      purpose: "School fees",
    },
  ]);

  return (
    <div className="pt-24 pb-10 max-w-6xl mx-auto px-6">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">
        Loan Marketplace
      </h1>
      <p className="text-center text-gray-600 mb-12">
        Browse available loan requests and invest directly in borrowers.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loans.map((loan) => (
          <div
            key={loan.id}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{loan.borrower}</h2>
            <p className="text-gray-700 mb-1">
              <strong>Amount:</strong> ${loan.amount}
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Rate:</strong> {loan.rate}%
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Duration:</strong> {loan.duration}
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Purpose:</strong> {loan.purpose}
            </p>
            <button className="!bg-blue-600 bg-opacity-100 hover:!bg-blue-800 text-white font-bold px-6 py-2 rounded shadow-lg border border-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              Fund Loan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
