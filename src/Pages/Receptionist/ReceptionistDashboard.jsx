import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { ref, onValue, remove, set } from "firebase/database";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

export default function ReceptionistDashboard() {
  const [patientsByDoctor, setPatientsByDoctor] = useState({});
  const [doctors, setDoctors] = useState({});
  const [currentReceptionist, setCurrentReceptionist] = useState({});
  const receptionistId = localStorage.getItem("uid");

  // Fetch all doctors
  useEffect(() => {
    const usersRef = ref(db, "users/");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {};
      const docList = Object.entries(data)
        .filter(([uid, value]) => value.role === "doctor")
        .reduce((acc, [uid, value]) => {
          acc[uid] = value.name; // store name by UID
          return acc;
        }, {});
      setDoctors(docList);

      // Set current receptionist info
      const rec = Object.entries(data)
        .filter(([uid, value]) => uid === receptionistId)
        .map(([uid, value]) => value)[0];
      setCurrentReceptionist(rec || {});
    });

    return () => unsubscribe();
  }, [receptionistId]);

  // Fetch patients grouped by doctor
  useEffect(() => {
    const patientsRef = ref(db, "patients/");
    const unsubscribe = onValue(patientsRef, (snapshot) => {
      const data = snapshot.val() || {};
      let grouped = {};

      for (const [doctorId, doctorPatients] of Object.entries(data)) {
        for (const [patientId, patient] of Object.entries(doctorPatients)) {
          if (patient.assignedReceptionist === receptionistId) {
            if (!grouped[doctorId]) {
              grouped[doctorId] = {
                doctorName: doctors[doctorId] || "Unknown Doctor",
                patients: [],
              };
            }
            grouped[doctorId].patients.push({
              id: patientId,
              ...patient,
            });
          }
        }
      }

      // Sort patients under each doctor by token
      for (const docId in grouped) {
        grouped[docId].patients.sort((a, b) => a.token - b.token);
      }

      setPatientsByDoctor(grouped);
    });

    return () => unsubscribe();
  }, [receptionistId, doctors]);

  // Delete patient and adjust tokens
// Delete patient and adjust tokens
const handleDelete = async (patientId, doctorId) => {
  const patientRef = ref(db, `patients/${doctorId}/${patientId}`);
  const snapshot = await new Promise((resolve) =>
    onValue(patientRef, resolve, { onlyOnce: true })
  );
  const patient = snapshot.val();
  if (!patient) return;

  const tokenDeleted = patient.token;
  const status = patient.status || "waiting";

  // If token is -1, delete immediately
  if (tokenDeleted === -1) {
    await remove(patientRef);
    alert("Patient deleted successfully.");
    return;
  }

  if (status === "waiting") {
    // Remove patient first
    await remove(patientRef);

    // Adjust tokens of other waiting patients
    const allPatientsRef = ref(db, `patients/${doctorId}/`);
    const allSnapshot = await new Promise((resolve) =>
      onValue(allPatientsRef, resolve, { onlyOnce: true })
    );
    const allPatients = allSnapshot.val() || {};

    for (const [pId, p] of Object.entries(allPatients)) {
      if ((p.status || "waiting") === "waiting" && p.token > tokenDeleted) {
        await set(ref(db, `patients/${doctorId}/${pId}/token`), p.token - 1);
      }
    }
  } else if (status === "completed") {
    // Set token to -1 for completed patient
    await set(ref(db, `patients/${doctorId}/${patientId}/token`), -1);
    alert("Patient marked with token -1. You can delete now if needed.");
  }
};


  return (
    <div className="flex bg-[#E8F0FE] min-h-screen">
      <Sidebar role="Receptionist" />
      <div className="flex-1 p-8">
        <div className="mb-6 p-4 bg-white rounded-xl shadow flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-blue-700">
              👋 {currentReceptionist.name || "Receptionist"}
            </h2>
            <p className="text-gray-600">{currentReceptionist.email || "-"}</p>
            <p className="text-gray-600 font-semibold">
              Role: {currentReceptionist.role || "Receptionist"}
            </p>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-blue-700 mb-6">
          👩‍💼 Receptionist Dashboard
        </h1>

        <div className="flex justify-between mb-6">
          <Link
            to="/add-patient"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all"
          >
            ➕ Add New Patient
          </Link>
        </div>

        {/* Display patients grouped by doctor */}
        {Object.entries(patientsByDoctor).map(([doctorId, doctorData]) => (
          <div key={doctorId} className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">
              Doctor: {doctorData.doctorName} (UID: {doctorId})
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {doctorData.patients.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-all"
                >
                  <h3 className="text-xl font-semibold text-blue-700">
                    {patient.name} (Token: {patient.token})
                  </h3>
                  <p className="text-gray-600 mt-1">Age: {patient.age}</p>
                  <p className="text-gray-600">Disease: {patient.disease}</p>
                  <p className="text-gray-600">Status: {patient.status}</p>
                  
                  <p className="text-gray-600">
                    Receptionist: {currentReceptionist.name} ({currentReceptionist.email})
                  </p>

                  <div className="mt-4 flex gap-4">
                    <Link
                      to={`/edit-patient/${doctorId}/${patient.id}`}
                      className="px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      ✏ Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(patient.id, doctorId)}
                      className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
