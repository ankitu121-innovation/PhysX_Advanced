import React, { useState } from 'react';
import { authorizedStudents } from '../data/students';

export default function LoginScreen({ onStartExam }) {
  const [rollNo, setRollNo] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const cleanRoll = rollNo.trim().toUpperCase();

    // 1. Check karo ki roll number valid list mein hai ya nahi
    const foundStudent = authorizedStudents.find(
      (s) => s.rollNo.toUpperCase() === cleanRoll
    );

    if (!foundStudent) {
      setError("❌ Invalid Roll Number! Access Denied. Contact Physics Instructor.");
      return;
    }

    // 2. CHECK: Kya is roll number se pehle login/attempt ho chuka hai?
    const isAlreadyAttempted = localStorage.getItem(`attempted_${foundStudent.rollNo}`);
    if (isAlreadyAttempted) {
      setError("⚠️ Access Blocked: Is Roll Number se pehle hi test access kiya ja chuka hai. Dobara login allowed nahi hai!");
      return;
    }

    // 3. Jaise hi student login kare, turant lock laga do (bina submit kiye bhi)
    localStorage.setItem(`attempted_${foundStudent.rollNo}`, 'true');

    // Sab theek hai, toh test start kar do
    setError('');
    onStartExam(foundStudent);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0b2149] font-sans">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-96 border-t-4 border-amber-400">
        <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center">PhysX-CBT Secure Portal</h2>
        <p className="text-xs text-gray-500 text-center mb-6">JEE Advanced Authorized Examination</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Enter Secret Roll Number</label>
            <input
              type="text"
              value={rollNo}
              onChange={(e) => { setRollNo(e.target.value); setError(''); }}
              placeholder="e.g., PHX202801"
              className="w-full border-2 border-gray-300 p-2.5 rounded text-sm font-bold uppercase tracking-wider focus:border-blue-600 outline-none"
            />
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-300 text-rose-700 text-xs font-semibold rounded text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-lg font-bold text-sm shadow transition mt-2 uppercase tracking-wider"
          >
            Authenticate & Start Test 🚀
          </button>
        </form>
      </div>
    </div>
  );
}