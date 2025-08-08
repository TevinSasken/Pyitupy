import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const navLinks = [
    { name: "Dashboard", path: "/" },
    { name: "Individual KYC", path: "/upload-individual" },
    { name: "Business KYC", path: "/upload-business" },
    { name: "Scores", path: "/scores" },
    { name: "Marketplace", path: "/marketplace" },
    { name: "Loan Application", path: "/loan-application"}
  ];

  const linkBase =
    "font-medium text-blue-600 pb-2 px-2 transition-colors duration-150 border-b-2";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        
        {/* App name (blue) */}
        <Link to="/" className="text-blue-600 font-bold text-xl">
          Pyitupy
        </Link>

        {/* Nav links */}
        <div className="flex items-center space-x-4">
          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                isActive
                  ? `${linkBase} border-blue-600`
                  : `${linkBase} border-transparent hover:border-blue-600 hover:text-blue-800`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">Welcome, Client</span>
          <button
            type="button"
          className="!bg-blue-600 bg-opacity-100 hover:!bg-blue-800 text-white font-bold px-6 py-2 rounded shadow-lg border border-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
