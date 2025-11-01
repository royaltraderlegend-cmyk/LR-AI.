
import React from 'react';
import { Signal } from '../types';
import type { AnalysisResultData } from '../types';

interface AnalysisResultProps {
  result: AnalysisResultData;
}

const SignalPill: React.FC<{ signal: Signal }> = ({ signal }) => {
  const isCall = signal === Signal.CALL;
  const bgColor = isCall ? 'bg-green-500' : 'bg-red-500';
  const shadowColor = isCall ? 'shadow-green-500/40' : 'shadow-red-500/40';
  const icon = isCall ? '▲' : '▼';

  return (
    <div className={`text-5xl md:text-6xl font-bold text-white rounded-full px-12 py-4 inline-flex items-center gap-4 shadow-lg ${bgColor} ${shadowColor}`}>
      <span>{icon}</span>
      <span>{signal}</span>
    </div>
  );
};

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ result }) => {
  return (
    <div className="bg-slate-800/50 border border-gray-700 rounded-xl p-6 md:p-8 animate-fade-in">
      <div className="flex flex-col items-center text-center space-y-6">
        <h2 className="text-xl font-roboto-mono text-cyan-400 uppercase tracking-widest">AI Signal</h2>
        <SignalPill signal={result.signal} />
        <div>
          <h3 className="text-lg font-bold text-white mb-2">AI Reasoning:</h3>
          <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">{result.reason}</p>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
