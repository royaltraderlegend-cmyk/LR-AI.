
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 my-8">
      <div className="relative flex items-center justify-center h-16 w-16">
        <div className="absolute h-full w-full rounded-full border-2 border-cyan-500 animate-spin"></div>
        <div className="absolute h-12 w-12 rounded-full border-2 border-t-transparent border-b-transparent border-l-cyan-300 border-r-cyan-300 animate-spin-reverse"></div>
        <div className="text-cyan-400 font-roboto-mono text-sm">AI</div>
      </div>
      <p className="text-cyan-300 font-roboto-mono animate-pulse">LR - CHART AI is analyzing...</p>
      <style>{`
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-reverse {
          animation: spin-reverse 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
};
