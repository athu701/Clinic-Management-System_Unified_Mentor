import { Link } from "react-router-dom";

export default function Navbar({ logout }) {
  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white shadow-md sticky top-0 z-10">
      <h1 className="text-2xl font-bold text-blue-700">
        🏥 Clinic Dashboard
      </h1>

      <div className="space-x-6 text-lg">
        <Link to="/doctor-dashboard" className="hover:text-blue-500">
          Doctor
        </Link>
        <Link to="/receptionist-dashboard" className="hover:text-blue-500">
          Receptionist
        </Link>

        <button
          onClick={logout}
          className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
