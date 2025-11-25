import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { db } from "../../firebase";
import { ref, onValue } from "firebase/database";
import Sidebar from "../../components/Sidebar";

ChartJS.register(CategoryScale, LinearScale, BarElement);

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState({ name: "", email: "" });
  const doctorId = localStorage.getItem("uid");

  useEffect(() => {
    if (!doctorId) return;
    const userRef = ref(db, `users/${doctorId}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDoctor({ name: data.name, email: data.email });
      }
    });

    return () => unsubscribe();
  }, [doctorId]);

  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Patients",
        data: [5, 7, 3, 8, 6],
      },
    ],
  };

  return (
    <div className="flex bg-[#E8F0FE] min-h-screen">
      <Sidebar role="Doctor" />

      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">
          🧑‍⚕️ Doctor Dashboard
        </h1>

        {/* Doctor Bio */}
        <div className="mb-8 bg-white p-4 rounded-xl shadow max-w-xl">
          <h2 className="text-xl font-semibold text-blue-600">Doctor Info</h2>
          <p className="text-gray-700 mt-2">Name: {doctor.name || "-"}</p>
          <p className="text-gray-700">Email: {doctor.email || "-"}</p>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow max-w-xl">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">
            Weekly Patient Visits
          </h2>
          <Bar data={data} />
        </div>
      </div>
    </div>
  );
}
