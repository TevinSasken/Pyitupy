import { useState } from "react";
import axios from "axios";

export default function LoanApplication() {
  const [formData, setFormData] = useState({
    loanType: "",
    amount: "",
    purpose: "",
    repaymentPeriod: "",
    walletAddress: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      // Replace URL with backend endpoint
      await axios.post("http://127.0.0.1:8000/loans/apply", formData);
      setMessage("✅ Loan application submitted successfully!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to submit loan application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Apply for a Loan</h2>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded-lg p-6">
        
        {/* Loan Type */}
        <div>
          <label className="block font-medium mb-1">Loan Type</label>
          <select
            name="loanType"
            value={formData.loanType}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          >
            <option value="">Select loan type</option>
            <option value="individual">Individual Loan</option>
            <option value="business">Business Loan</option>
          </select>
        </div>

        {/* Loan Amount */}
        <div>
          <label className="block font-medium mb-1">Loan Amount Requested</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="border rounded p-2 w-full"
            placeholder="Enter amount"
          />
        </div>

        {/* Loan Purpose */}
        <div>
          <label className="block font-medium mb-1">Purpose of Loan</label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            className="border rounded p-2 w-full"
            placeholder="Briefly describe purpose"
            rows="3"
          />
        </div>

        {/* Repayment Period */}
        <div>
          <label className="block font-medium mb-1">Preferred Repayment Period</label>
          <select
            name="repaymentPeriod"
            value={formData.repaymentPeriod}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          >
            <option value="">Select period</option>
            <option value="3">3 Months</option>
            <option value="6">6 Months</option>
            <option value="12">12 Months</option>
            <option value="24">24 Months</option>
          </select>
        </div>

        {/* Wallet Address */}
        <div>
          <label className="block font-medium mb-1">Wallet Address</label>
          <input
            type="text"
            name="walletAddress"
            value={formData.walletAddress}
            onChange={handleChange}
            className="border rounded p-2 w-full"
            placeholder="Enter crypto wallet address"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-800 text-white px-6 py-2 rounded w-full"
        >
          {submitting ? "Submitting..." : "Submit Loan Application"}
        </button>

        {message && <p className="mt-4 text-center">{message}</p>}
      </form>
    </div>
  );
}
