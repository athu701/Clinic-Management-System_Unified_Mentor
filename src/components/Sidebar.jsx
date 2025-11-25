import { Link, useNavigate } from "react-router-dom";

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const uid = localStorage.getItem("uid");

  const handleLogout = () => {
    localStorage.removeItem("uid");
    localStorage.removeItem("role");
    navigate("/"); // redirect to home page
  };

  return (
    <div className="w-64 bg-white shadow-lg h-screen p-6 sticky top-0">
      <Link to="/">
        <h2 className="text-2xl font-bold text-blue-700 mb-10">🏥 Clinic</h2>
      </Link>

      <p className="text-gray-500 mb-6 text-sm">Logged in as: {role}</p>

      <nav className="flex flex-col gap-4 text-lg">
        {role === "Receptionist" && (
          <>
            <Link className="hover:text-blue-600" to="/receptionist-dashboard">📋 Patients</Link>
            <Link className="hover:text-blue-600" to="/add-patient">➕ Add Patient</Link>
            <Link className="hover:text-blue-600" to="/assigned-patients">🧾 Your Assigned Patients</Link>
          </>
        )}

        {role === "Doctor" && (
          <>
            <Link className="hover:text-blue-600" to="/doctor-dashboard">🧑‍⚕️ Dashboard</Link>
            <Link className="hover:text-blue-600" to="/doctor-patients">🧾 Your Patients</Link>
          </>
        )}

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-all text-left"
        >
          🚪 Logout
        </button>
      </nav>
    </div>
  );
}
