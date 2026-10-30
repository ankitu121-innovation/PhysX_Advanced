import React, { useState, useEffect } from 'react';
import { questionsData } from './data/questions';
import MathText from './components/MathText';
import QuestionPalette from './components/QuestionPalette';
import LoginScreen from './components/LoginScreen';

export default function App() {
  const [student, setStudent] = useState(null); // { name, rollNo }
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // 1 Hour
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const currentQ = questionsData[currentIndex];

  useEffect(() => {
    if (!student || isSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [student, timeLeft, isSubmitted]);

  useEffect(() => {
    if (student && !questionStatus[currentQ.id]) {
      setQuestionStatus(prev => ({ ...prev, [currentQ.id]: 'not_answered' }));
    }
  }, [currentIndex, student]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleMultipleSelect = (idx) => {
    const currentList = userAnswers[currentQ.id] || [];
    const updated = currentList.includes(idx)
      ? currentList.filter(i => i !== idx)
      : [...currentList, idx];
    setUserAnswers({ ...userAnswers, [currentQ.id]: updated });
  };

  const handleKeypad = (val) => {
    const currentVal = userAnswers[currentQ.id] || '';
    if (val === 'CLEAR') setUserAnswers({ ...userAnswers, [currentQ.id]: '' });
    else if (val === 'BACK') setUserAnswers({ ...userAnswers, [currentQ.id]: currentVal.slice(0, -1) });
    else setUserAnswers({ ...userAnswers, [currentQ.id]: currentVal + val });
  };

  const handleSaveAndNext = () => {
    const ans = userAnswers[currentQ.id];
    const hasAnswer = Array.isArray(ans) ? ans.length > 0 : (ans !== undefined && ans !== '');
    setQuestionStatus(prev => ({ ...prev, [currentQ.id]: hasAnswer ? 'answered' : 'not_answered' }));
    if (currentIndex < questionsData.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleMarkForReview = () => {
    const ans = userAnswers[currentQ.id];
    const hasAnswer = Array.isArray(ans) ? ans.length > 0 : (ans !== undefined && ans !== '');
    setQuestionStatus(prev => ({ ...prev, [currentQ.id]: hasAnswer ? 'answered_marked' : 'marked' }));
    if (currentIndex < questionsData.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleClearResponse = () => {
    const newAnswers = { ...userAnswers };
    delete newAnswers[currentQ.id];
    setUserAnswers(newAnswers);
    setQuestionStatus(prev => ({ ...prev, [currentQ.id]: 'not_answered' }));
  };

  const handleSubmitExam = async () => {
    let score = 0, correctCount = 0, wrongCount = 0, partialCount = 0;

    questionsData.forEach(q => {
      const uAns = userAnswers[q.id];
      if (uAns === undefined || uAns === '' || (Array.isArray(uAns) && uAns.length === 0)) return;

      if (q.type === 'single' || q.type === 'matching') {
        if (uAns === q.correctAnswer) { score += q.marks.correct; correctCount++; }
        else { score += q.marks.incorrect; wrongCount++; }
      } else if (q.type === 'numerical') {
        if (String(uAns).trim() === String(q.correctAnswer).trim()) { score += q.marks.correct; correctCount++; }
        else { score += q.marks.incorrect; wrongCount++; }
      } else if (q.type === 'multiple') {
        const correctSet = q.correctAnswers;
        const userSet = uAns || [];
        const isAnyWrong = userSet.some(opt => !correctSet.includes(opt));
        if (isAnyWrong) { score += q.marks.incorrect; wrongCount++; }
        else if (userSet.length === correctSet.length) { score += q.marks.correct; correctCount++; }
        else if (userSet.length > 0) { score += userSet.length; partialCount++; }
      }
    });

    let predictedRank = "N/A";
    const percentage = (score / 60) * 100;
    if (percentage >= 80) predictedRank = "AIR < 100";
    else if (percentage >= 65) predictedRank = "AIR 100 - 500";
    else if (percentage >= 50) predictedRank = "AIR 500 - 2000";
    else if (percentage >= 35) predictedRank = "AIR 2000 - 5000";
    else predictedRank = "AIR > 5000 / Qualified";

    // --- YAHAN APNA GOOGLE SCRIPT URL PASTE KARNA HAI ---
    const studentResultData = {
      rollNo: student.rollNo,
      name: student.name,
      score: score,
      rank: predictedRank
    };

    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx0_cb_6hz3X4w4wxUkBcJZxdY39uj1kuETocyKGpiJoNsz5Fspw-2UxShrCTbP6NTa/exec";

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentResultData),
      });
      console.log("Score successfully sent to Google Sheet!");
    } catch (error) {
      console.error("Error sending score:", error);
    }
    // ---------------------------------------------------

    setResult({ 
      totalScore: score, 
      maxScore: 60, 
      correctCount, 
      wrongCount, 
      partialCount, 
      predictedRank, 
      accuracy: Math.max(0, Math.round((correctCount / (correctCount + wrongCount)) * 100 || 0)) 
    });
    setIsSubmitted(true);
  };

  // Agar student login nahi hai, toh Login Screen dikhao
  if (!student) {
    return <LoginScreen onStartExam={(data) => setStudent(data)} />;
  }

  if (isSubmitted && result) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 font-sans">
        <div className="bg-[#0b2149] text-white p-8 rounded-xl shadow-2xl text-center border-t-4 border-amber-400">
          <h2 className="text-2xl font-bold mb-1 text-amber-300">JEE Advanced Score Card</h2>
          <p className="text-sm text-gray-300 mb-4">Student: <span className="font-bold text-white">{student.name}</span> (Roll: {student.rollNo})</p>
          <div className="text-6xl font-black my-2 text-white">{result.totalScore} <span className="text-2xl text-gray-300">/ 60</span></div>
          <div className="inline-block bg-blue-900 px-6 py-2 rounded-full font-bold text-amber-300 text-base border border-blue-600 mt-2">
            Predicted Rank: {result.predictedRank}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg">
            <div className="text-3xl font-bold text-emerald-700">{result.correctCount}</div>
            <div className="text-xs font-semibold text-gray-600 uppercase">Correct</div>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg">
            <div className="text-3xl font-bold text-amber-700">{result.partialCount}</div>
            <div className="text-xs font-semibold text-gray-600 uppercase">Partial</div>
          </div>
          <div className="p-4 bg-rose-50 border border-rose-300 rounded-lg">
            <div className="text-3xl font-bold text-rose-700">{result.wrongCount}</div>
            <div className="text-xs font-semibold text-gray-600 uppercase">Incorrect</div>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-300 rounded-lg">
            <div className="text-3xl font-bold text-blue-700">{result.accuracy}%</div>
            <div className="text-xs font-semibold text-gray-600 uppercase">Accuracy</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 font-sans select-none">
      {/* Header */}
      <header className="bg-[#0b2149] text-white px-6 py-3 flex justify-between items-center border-b-2 border-amber-500 shadow-md">
        <div>
          <h1 className="text-base font-bold">JEE (Advanced) — CBT Portal</h1>
          <span className="text-xs text-amber-300">Student: {student.name} ({student.rollNo})</span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="bg-[#14326b] px-4 py-1.5 rounded border border-blue-900 text-right">
            <span className="text-[10px] block text-gray-300 uppercase">Time Remaining</span>
            <span className="text-base font-mono font-bold text-amber-300">{formatTime(timeLeft)}</span>
          </div>
          <button
            onClick={handleSubmitExam}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded text-xs font-bold uppercase transition"
          >
            Submit Test
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 bg-white m-3 rounded-lg border border-gray-300 shadow-sm flex flex-col justify-between overflow-y-auto p-6">
          <div>
            <div className="flex justify-between items-center border-b pb-3 mb-5">
              <span className="font-bold text-sm text-[#0b2149]">Question No. {currentIndex + 1}</span>
              <span className="text-xs bg-amber-50 text-amber-900 px-3 py-1 rounded font-bold border border-amber-300">
                + {currentQ.marks.correct} Marks | - {Math.abs(currentQ.marks.incorrect || 0)} Negative
              </span>
            </div>

            <div className="text-base font-medium text-gray-900 mb-6 leading-relaxed">
              <MathText text={currentQ.question} />
            </div>

            {currentQ.type === 'numerical' ? (
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-gray-700">Answer:</span>
                  <input
                    type="text"
                    readOnly
                    value={userAnswers[currentQ.id] || ''}
                    className="border-2 border-blue-600 bg-white p-2.5 rounded w-44 text-lg font-mono text-center font-bold text-blue-900"
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 w-60 pt-2 bg-gray-50 p-3 rounded-lg border">
                  {['1','2','3','4','5','6','7','8','9','-','0','.','BACK','CLEAR'].map(key => (
                    <button
                      key={key}
                      onClick={() => handleKeypad(key)}
                      className={`p-2.5 text-xs font-bold rounded border shadow-sm transition ${
                        key === 'CLEAR' || key === 'BACK' ? 'bg-rose-600 text-white col-span-1.5' : 'bg-white hover:bg-blue-50 text-gray-800'
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = currentQ.type === 'multiple'
                    ? (userAnswers[currentQ.id] || []).includes(idx)
                    : userAnswers[currentQ.id] === idx;

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (currentQ.type === 'multiple') handleMultipleSelect(idx);
                        else setUserAnswers({ ...userAnswers, [currentQ.id]: idx });
                      }}
                      className={`p-3.5 border-2 rounded-lg cursor-pointer transition flex items-center space-x-3 ${
                        isSelected ? 'bg-blue-50 border-blue-700 font-semibold text-blue-950' : 'bg-white hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <input type={currentQ.type === 'multiple' ? 'checkbox' : 'radio'} checked={isSelected} onChange={() => {}} className="w-4 h-4 accent-blue-700" />
                      <MathText text={opt} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center border-t pt-4 mt-6">
            <div className="space-x-2">
              <button onClick={handleMarkForReview} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded text-xs font-bold shadow">
                Mark for Review & Next
              </button>
              <button onClick={handleClearResponse} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-xs font-bold shadow">
                Clear Response
              </button>
            </div>
            <button onClick={handleSaveAndNext} className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-2.5 rounded text-xs font-bold shadow uppercase">
              Save & Next
            </button>
          </div>
        </div>

        <QuestionPalette
          questions={questionsData}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          questionStatus={questionStatus}
        />
      </div>
    </div>
  );
}