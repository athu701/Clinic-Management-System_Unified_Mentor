import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { ref, push, set, onValue } from "firebase/database";
import Sidebar from "../../components/Sidebar";

export default function AddPatient() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [disease, setDisease] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  const receptionistId = localStorage.getItem("uid");

  useEffect(() => {
    const doctorsRef = ref(db, "users/");
    const unsubscribe = onValue(doctorsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data)
        .filter(([uid, value]) => value.role === "doctor")
        .map(([uid, value]) => ({ uid, name: value.name, email: value.email }));
      setDoctors(list);
    });
    return () => unsubscribe();
  }, []);

  const generateToken = async (doctorId) => {
    const doctorRef = ref(db, `patients/${doctorId}`);
    const snapshot = await new Promise((resolve) =>
      onValue(doctorRef, resolve, { onlyOnce: true })
    );
    const doctorData = snapshot.val() || {};

    const tokens = Object.values(doctorData)
      .filter((p) => p.token)
      .map((p) => p.token);
    const maxToken = tokens.length > 0 ? Math.max(...tokens) : 0;

    return maxToken + 1;
  };

  const handleAddPatient = async () => {
    if (!name || !doctorId)
      return alert("Patient name and doctor selection are required!");

    try {
      const recRef = ref(db, `users/${receptionistId}`);
      const recSnapshot = await new Promise((resolve) =>
        onValue(recRef, resolve, { onlyOnce: true })
      );
      const recData = recSnapshot.val() || {};
      const receptionistName = recData.name || "Receptionist";

      const newToken = await generateToken(doctorId);

      const patientRef = push(ref(db, `patients/${doctorId}`));
      await set(patientRef, {
        name,
        age,
        disease,
        assignedReceptionist: receptionistId,
        assignedReceptionistName: receptionistName,
        assignedDoctorName: doctorName,
        token: newToken,
        status: "waiting",
        tokenTime: Date.now(),
      });

      setToken(newToken);
      alert(`Patient added successfully! Token: ${newToken}`);
      navigate("/receptionist-dashboard");
    } catch (err) {
      console.error("Error adding patient:", err);
      alert("Failed to add patient. Try again.");
    }
  };

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.uid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDoctorSelect = (doc) => {
    setDoctorId(doc.uid);
    setDoctorName(doc.name);
    setSearchTerm(doc.name);
  };

  return (
    <div className="flex bg-[#E8F0FE] min-h-screen">
      <Sidebar role="Receptionist" />
      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">
          ➕ Add New Patient
        </h1>

        <div className="bg-white p-6 rounded-xl shadow max-w-lg">
          <label className="block text-gray-700 font-medium">
            Patient Name
          </label>
          <input
            type="text"
            placeholder="Enter patient name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-blue-300 rounded mt-2"
          />

          <label className="block text-gray-700 font-medium mt-4">Age</label>
          <input
            type="number"
            placeholder="Enter age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full p-2 border border-blue-300 rounded mt-2"
          />

          <label className="block text-gray-700 font-medium mt-4">
            Disease
          </label>
          <input
            type="text"
            placeholder="Enter disease"
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
            className="w-full p-2 border border-blue-300 rounded mt-2"
          />

          <label className="block text-gray-700 font-medium mt-4">
            Assign Doctor
          </label>
          <input
            type="text"
            placeholder="Search doctor by name or UID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-blue-300 rounded mt-2"
          />

          <div className="max-h-40 overflow-y-auto border border-blue-300 rounded mt-2">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.uid}
                className={`p-2 cursor-pointer hover:bg-blue-100 ${
                  doctorId === doc.uid ? "bg-blue-200 font-semibold" : ""
                }`}
                onClick={() => handleDoctorSelect(doc)}
              >
                {doc.name} ({doc.uid})
              </div>
            ))}
          </div>

          <button
            onClick={handleAddPatient}
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Add Patient
          </button>

          {token && (
            <div className="mt-4 p-4 bg-green-100 rounded-lg text-center">
              <h2 className="text-2xl font-bold text-green-700">
                Token: {token}
              </h2>
              <p className="text-gray-600 mt-1">Give this number to patient</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
