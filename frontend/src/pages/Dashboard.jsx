import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Pyitupy Dashboard</h1>
      <p className="text-lg text-gray-700 mb-10">
        Welcome to the decentralised P2P Credit platform.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl w-full">
        {/* Borrow Crypto Section */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">Borrow Crypto</h2>
          <p className="text-gray-600 mb-6 text-center">
            Apply for a loan as an individual or a business.
          </p>
          <div className="flex flex-col gap-4 w-full">
            <button
              onClick={() => navigate("/upload-individual")}
              className="!bg-blue-600 bg-opacity-100 hover:!bg-blue-800 text-white font-bold px-6 py-2 rounded shadow-lg border border-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Borrow as Individual
            </button>
            <button
              onClick={() => navigate("/upload-business")}
              className="!bg-blue-600 bg-opacity-100 hover:!bg-blue-800 text-white font-bold px-6 py-2 rounded shadow-lg border border-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Borrow as Business
            </button>
          </div>
        </div>

        {/* Lend Crypto Section */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">Lend Crypto</h2>
          <p className="text-gray-600 mb-6 text-center">
            Browse the loan marketplace and start lending to borrowers.
          </p>
          <button
            onClick={() => navigate("/marketplace")}
            className="!bg-blue-600 bg-opacity-100 hover:!bg-blue-800 text-white font-bold px-6 py-2 rounded shadow-lg border border-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Go to Marketplace
          </button>
        </div>
      </div>
    </div>
  );
}
