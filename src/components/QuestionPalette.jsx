import React from 'react';

export default function QuestionPalette({ questions, currentIndex, setCurrentIndex, questionStatus }) {
  const getBadgeStyle = (id) => {
    const status = questionStatus[id];
    switch (status) {
      case 'answered':
        return 'bg-emerald-600 text-white rounded-t-lg';
      case 'not_answered':
        return 'bg-rose-600 text-white clip-path-badge rounded-b-lg';
      case 'marked':
        return 'bg-purple-700 text-white rounded-full';
      case 'answered_marked':
        return 'bg-purple-700 text-white rounded-full relative after:content-["✓"] after:absolute after:-top-1 after:-right-1 after:bg-emerald-500 after:text-white after:text-[10px] after:w-4 after:h-4 after:rounded-full after:flex after:items-center after:justify-center';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700';
    }
  };

  return (
    <div className="w-80 bg-gray-50 dark:bg-[#1f2028] border-l border-gray-300 dark:border-gray-700 p-4 flex flex-col justify-between select-none">
      <div>
        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-3 border-b pb-2">
          Question Palette (16 Qs)
        </h3>
        
        <div className="grid grid-cols-4 gap-2.5">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`w-11 h-11 text-xs font-bold transition flex items-center justify-center shadow-sm ${getBadgeStyle(q.id)} ${
                currentIndex === idx ? 'ring-2 ring-purple-500 ring-offset-2' : ''
              }`}
            >
              {q.id}
            </button>
          ))}
        </div>
      </div>

      {/* Legend Indicators */}
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-3 text-xs space-y-2 text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <span className="w-4 h-4 bg-emerald-600 rounded-t-lg inline-block"></span>
          <span>Answered</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-4 h-4 bg-rose-600 rounded-b-lg inline-block"></span>
          <span>Not Answered</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-4 h-4 bg-purple-700 rounded-full inline-block"></span>
          <span>Marked for Review</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-4 h-4 bg-purple-700 rounded-full relative inline-block after:content-['✓'] after:text-[8px] after:text-emerald-400 after:absolute after:bottom-0 after:right-0"></span>
          <span>Answered & Marked</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-4 h-4 bg-gray-100 dark:bg-gray-800 border inline-block"></span>
          <span>Not Visited</span>
        </div>
      </div>
    </div>
  );
}