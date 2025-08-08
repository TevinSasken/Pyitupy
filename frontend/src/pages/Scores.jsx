import { useState } from "react";
import axios from "axios";

export default function Scores() {
  const [rowId, setRowId] = useState("");
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchScore = async (type) => {
    if (!rowId) {
      alert("Please enter a Row ID from the dummy data.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/credit-score/${type}/${rowId}`);
      setScoreData(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching score. Check if backend is running.");
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Credit Scores</h1>

      <div className="mb-4">
        <label className="block font-medium">Row ID (from dummy dataset)</label>
        <input
          type="number"
          value={rowId}
          onChange={(e) => setRowId(e.target.value)}
          className="mt-1 w-full border rounded p-2"
          placeholder="Enter a row number, e.g., 0"
        />
      </div>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => fetchScore("individual")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Get Individual Score
        </button>
        <button
          onClick={() => fetchScore("business")}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Get Business Score
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {scoreData && (
        <div className="mt-6 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Score Result</h2>
          <p><strong>Type:</strong> {scoreData.borrower_type}</p>
          <p><strong>Credit Score:</strong> {scoreData.credit_score}</p>
          <p><strong>Probability of Default:</strong> {scoreData.probability_of_default}</p>
          <p><strong>Risk Level:</strong> {scoreData.risk_level}</p>
          <p><strong>Interest Rate:</strong> {scoreData.interest_rate}%</p>
          <p><strong>Max Repayment Months:</strong> {scoreData.max_repayment_months}</p>
        </div>
      )}
    </div>
  );
}
