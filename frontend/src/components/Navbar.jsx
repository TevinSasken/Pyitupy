import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white p-4 flex gap-6">
      <Link to="/" className="hover:text-yellow-400">Dashboard</Link>
      <Link to="/upload" className="hover:text-yellow-400">Upload</Link>
      <Link to="/scores" className="hover:text-yellow-400">Scores</Link>
    </nav>
  );
}
