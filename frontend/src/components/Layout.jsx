// src/components/Layout.jsx
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-20 flex justify-center">
        <div className="w-full max-w-6xl px-6">{children}</div>
      </main>
    </div>
  );
}
