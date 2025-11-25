import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { ref, onValue, set } from "firebase/database";

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null); // for view details
  const doctorId = localStorage.getItem("uid"); // current logged-in doctor

  // Fetch patients for this doctor
  useEffect(() => {
    const patientsRef = ref(db, `patients/${doctorId}/`);
    const unsubscribe = onValue(patientsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const doctorPatients = Object.entries(data)
        .map(([id, p]) => ({
          id,
          name: p.name,
          disease: p.disease,
          token: p.token,
          status: p.status || "waiting",
        }))
        .sort((a, b) => a.token - b.token);

      setPatients(doctorPatients);
    });

    return () => unsubscribe();
  }, [doctorId]);

  // Mark patient as completed and adjust tokens
// Mark patient as completed and adjust tokens
const handleComplete = async (patientId, patientToken) => {
  const patientRef = ref(db, `patients/${doctorId}/${patientId}`);
  const snapshot = await new Promise((resolve) =>
    onValue(patientRef, resolve, { onlyOnce: true })
  );
  const patient = snapshot.val();
  if (!patient) return;

  // Mark this patient completed and set token to -1
  await set(ref(db, `patients/${doctorId}/${patientId}/status`), "completed");
  await set(ref(db, `patients/${doctorId}/${patientId}/token`), -1);

  // Adjust tokens of remaining waiting patients
  const doctorRef = ref(db, `patients/${doctorId}/`);
  const allSnapshot = await new Promise((resolve) =>
    onValue(doctorRef, resolve, { onlyOnce: true })
  );
  const allPatients = allSnapshot.val() || {};

  for (const [id, p] of Object.entries(allPatients)) {
    if ((p.status || "waiting") === "waiting" && p.token > patientToken) {
      await set(ref(db, `patients/${doctorId}/${id}/token`), p.token - 1);
    }
  }
};


  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">🧾 Your Patients</h1>

      {patients.length === 0 ? (
        <p className="text-gray-600">No patients assigned yet.</p>
      ) : (
        <ul className="bg-white p-6 rounded-xl shadow max-w-lg">
          {patients.map((p) => (
            <li
              key={p.id}
              className="border-b border-gray-200 py-2 flex justify-between items-center"
            >
              <div>
                <span className="font-semibold">{p.name}</span> -{" "}
                <span className="text-gray-600">{p.disease}</span> |{" "}
                <span
                  className={
                    p.status === "completed"
                      ? "text-green-600 font-semibold"
                      : "text-yellow-600 font-semibold"
                  }
                >
                  {p.status.toUpperCase()}
                </span>
              </div>

              <div className="flex gap-2">
                {/* View button */}
                <button
                  onClick={() => setSelectedPatient(p)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  View
                </button>

                {/* Complete button */}
                {p.status !== "completed" && (
                  <button
                    onClick={() => handleComplete(p.id, p.token)}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Completed
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal / details view */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl shadow max-w-md w-full">
            <h2 className="text-xl font-bold text-blue-700 mb-4">
              {selectedPatient.name} Details
            </h2>
            <p>
              <strong>Disease:</strong> {selectedPatient.disease}
            </p>
            <p>
              <strong>Token:</strong> {selectedPatient.token}
            </p>
            <p>
              <strong>Status:</strong> {selectedPatient.status.toUpperCase()}
            </p>

            <button
              onClick={() => setSelectedPatient(null)}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
