import { useState } from "react";
import { db } from "../../firebase";
import { ref, push, set, onValue } from "firebase/database";
import Sidebar from "../../components/Sidebar";

export default function GenerateToken() {
  const [name, setName] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [token, setToken] = useState(null);
  const receptionistId = localStorage.getItem("uid");
  const [doctors, setDoctors] = useState([]);

  // Fetch doctors
  useState(() => {
    const doctorsRef = ref(db, "users/");
    const unsubscribe = onValue(doctorsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data)
        .filter(([uid, value]) => value.role === "doctor")
        .map(([uid, value]) => ({ uid, name: value.name }));
      setDoctors(list);
    });
    return () => unsubscribe();
  }, []);

  const generate = async () => {
    if (!name || !doctorId) return alert("Enter name and doctor");

    const doc = doctors.find((d) => d.uid === doctorId);
    if (!doc) return alert("Invalid doctor UID");
    
    const newToken = Math.floor(Math.random() * 90000 + 10000);

    const patientRef = push(ref(db, "patients")); 
    await set(patientRef, {
      name,
      token: newToken,
      assignedReceptionist: receptionistId,
      assignedDoctor: doctorId,
      assignedDoctorName: doc.name, // Save doctor name for dashboard
      age: "",
      disease: "",
      tokenTime: Date.now(),
    });

    setToken(newToken);
    setName("");
    setDoctorId("");
  };

  return (
    <div className="flex bg-[#E8F0FE] min-h-screen">
      <Sidebar role="Receptionist" />
      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold text-blue-700">🎫 Generate Token</h1>

        <div className="mt-6 bg-white p-6 rounded-xl shadow max-w-lg">
          <label className="block text-gray-700 font-medium">Patient Name</label>
          <input
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-blue-300 rounded mt-2"
          />

          <label className="block text-gray-700 font-medium mt-4">Assign Doctor</label>
          <input
            type="text"
            placeholder="Enter Doctor UID"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="w-full p-2 border border-blue-300 rounded mt-2"
          />

          <button
            onClick={generate}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Generate Token
          </button>

          {token && (
            <div className="mt-4 p-4 bg-green-100 rounded-lg text-center">
              <h2 className="text-2xl font-bold text-green-700">Token: {token}</h2>
              <p className="text-gray-600 mt-1">Give this number to patient</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
