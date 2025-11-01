
import React from 'react';

export const Disclaimer: React.FC = () => {
  return (
    <footer className="w-full mt-12 text-center text-xs text-gray-500 border-t border-gray-700 pt-6">
      <p className="font-bold text-yellow-500 mb-2">
        DISCLAIMER: This is an AI-powered analysis tool and not financial advice.
      </p>
      <p>
        All trading involves risk. The signals provided by LR - CHART AI are based on algorithmic analysis of chart images and are for informational purposes only. Past performance is not indicative of future results. Accuracy is not guaranteed. Always do your own research and manage your risk.
      </p>
    </footer>
  );
};
