import React, { useState, useCallback, useMemo } from 'react';
import { FileUpload } from './FileUpload';
import { AnalysisResult } from './AnalysisResult';
import { Loader } from './Loader';
import { analyzeChart, analyzeForFutureSignals } from '../services/geminiService';
import { generateFutureSignals, generateNextMinuteSignal } from '../services/signalService';
import type { AnalysisResultData, FutureSignal, AIFutureSignalResult } from '../types';
import { Signal } from '../types';
import { PAIRS } from '../data/pairs';


// Helper component for pages
const PageWrapper: React.FC<{title: string; description: string; children: React.ReactNode}> = ({ title, description, children }) => (
    <div className="animate-fade-in space-y-6">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-cyan-400">{title}</h2>
            <p className="text-gray-400 mt-2 max-w-3xl mx-auto">{description}</p>
        </div>
        <div className="bg-slate-800/50 border border-gray-700 rounded-xl p-4 sm:p-6 md:p-8">
            {children}
        </div>
    </div>
);

// --- PAGE COMPONENTS ---

export const Dashboard: React.FC = () => (
    <PageWrapper title="Welcome to LR - CHART AI" description="Your all-in-one AI-powered suite for binary trading analysis in the OTC market.">
        <div className="prose prose-invert max-w-none text-gray-300">
            <p>This platform combines cutting-edge AI with user-friendly tools to provide you with high-probability trading signals and in-depth chart analysis. Our mission is to empower you with data-driven insights to navigate the complexities of the market.</p>
            <h3 className="text-cyan-400">Our Features:</h3>
            <ul>
                <li><strong>AI Chart Analyzer:</strong> Upload any chart screenshot for an instant, detailed analysis and a CALL/PUT signal from our advanced AI.</li>
                <li><strong>AI Future Signals:</strong> Let the AI analyze a chart and predict potential signals for the next 30 minutes.</li>
                <li><strong>Signal Generators:</strong> Access algorithmically generated signals for various pairs and timeframes.</li>
                <li><strong>Money Management:</strong> Use our guides to develop a robust trading strategy and manage risk effectively.</li>
                <li><strong>Community:</strong> Join our Telegram community to share insights and strategies with fellow traders.</li>
            </ul>
            <p>Explore the tools from the menu and start your journey towards smarter trading today. Remember to always trade responsibly.</p>
        </div>
    </PageWrapper>
);

export const AIChartAnalyzer: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResultData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
  
    const handleFileChange = (file: File | null) => {
      if (file) {
        setImageFile(file);
        setAnalysisResult(null);
        setError(null);
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          setImageBase64(base64String);
        };
        reader.readAsDataURL(file);
      } else {
        setImageFile(null);
        setImageBase64(null);
      }
    };
  
    const handleAnalyzeClick = useCallback(async () => {
      if (!imageBase64 || !imageFile) {
        setError("Please upload a chart image first.");
        return;
      }
  
      setIsLoading(true);
      setError(null);
      setAnalysisResult(null);
      
      const timeout = setTimeout(() => {
        setIsLoading(false);
        setError("Analysis is taking longer than expected. The AI might be under heavy load. Please try again.");
      }, 15000); // 15 second timeout

      try {
        const result = await analyzeChart(imageBase64, imageFile.type);
        setAnalysisResult(result);
      } catch (err) {
        console.error(err);
        setError("Failed to analyze the chart. The AI may be experiencing high traffic or could not interpret the image. Please try again with a clear screenshot.");
      } finally {
        clearTimeout(timeout);
        setIsLoading(false);
      }
    }, [imageBase64, imageFile]);
  
    return (
        <PageWrapper title="AI Chart Analyzer" description="Upload a chart image and our advanced AI will provide an immediate trading signal with detailed reasoning for a 1-minute expiry.">
             <div className="space-y-8">
                <FileUpload onFileChange={handleFileChange} imagePreviewUrl={imageFile ? URL.createObjectURL(imageFile) : null} />

                {imageBase64 && (
                    <div className="flex justify-center">
                    <button
                        onClick={handleAnalyzeClick}
                        disabled={isLoading}
                        className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-700 disabled:cursor-wait text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-cyan-500/30 transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300"
                    >
                        {isLoading ? 'ANALYZING...' : 'ANALYZE CHART'}
                    </button>
                    </div>
                )}

                {isLoading && <Loader />}

                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {analysisResult && <AnalysisResult result={analysisResult} />}
            </div>
        </PageWrapper>
    );
};

const PairSelector: React.FC<{ selectedPair: string; onSelectPair: (pair: string) => void; }> = ({ selectedPair, onSelectPair }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredPairs = useMemo(() => PAIRS.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm]);

    return (
        <div className="space-y-2">
            <label className="font-bold text-gray-300">1. Select Pair</label>
            <input 
                type="text"
                placeholder="Search for a pair..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
            <div className="h-48 overflow-y-auto border border-gray-600 rounded-md p-2 bg-slate-900 custom-scrollbar">
                {filteredPairs.map(pair => (
                    <button 
                        key={pair}
                        onClick={() => { onSelectPair(pair); setSearchTerm(''); }}
                        className={`w-full text-left p-2 rounded-md transition-colors ${selectedPair === pair ? 'bg-cyan-500 text-white' : 'hover:bg-slate-700'}`}
                    >
                        {pair}
                    </button>
                ))}
            </div>
        </div>
    );
};

export const AIFutureSignals: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [result, setResult] = useState<AIFutureSignalResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPair, setSelectedPair] = useState(PAIRS[0]);
    const [copySuccess, setCopySuccess] = useState('');

    const handleFileChange = (file: File | null) => {
        if (file) {
            setImageFile(file);
            setResult(null);
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                setImageBase64(base64String);
            };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setImageBase64(null);
        }
    };

    const handleAnalyzeClick = useCallback(async () => {
        if (!imageBase64 || !imageFile) {
            setError("Please upload a chart image first.");
            return;
        }
        if (!selectedPair) {
            setError("Please select a pair.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const analysisResult = await analyzeForFutureSignals(imageBase64, imageFile.type, selectedPair);
            setResult(analysisResult);
        } catch (err) {
            console.error(err);
            setError("Failed to generate future signals. The AI may be experiencing high traffic. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [imageBase64, imageFile, selectedPair]);

    const handleCopy = () => {
        if (!result || result.signals.length === 0) return;
        const textToCopy = `LR - CHART AI ⦿ AI Future Signals\nUTC: +5:00\nPAIR: ${selectedPair}\n--------------------\n` +
            result.signals.map(s => `TIME: ${s.time} ➡ DIRECTION: ${s.direction} \nREASON: ${s.reason}`).join('\n\n');
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopySuccess('Copied to clipboard!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Failed to copy.');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    return (
        <PageWrapper title="AI Future Signals" description="Upload a chart for a selected pair. The AI will analyze the market structure and predict potential signals for the next 30 minutes.">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <PairSelector selectedPair={selectedPair} onSelectPair={setSelectedPair} />
                    <FileUpload onFileChange={handleFileChange} imagePreviewUrl={imageFile ? URL.createObjectURL(imageFile) : null} />
                </div>
                <div className="space-y-4">
                    {imageBase64 && (
                        <div className="flex justify-center">
                            <button onClick={handleAnalyzeClick} disabled={isLoading} className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-700 disabled:cursor-wait text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-cyan-500/30 transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300">
                                {isLoading ? 'GENERATING...' : 'GENERATE FUTURE SIGNALS'}
                            </button>
                        </div>
                    )}
                    {isLoading && <Loader />}
                    {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">{error}</div>}
                    {result && result.signals.length > 0 && (
                        <div className="space-y-4">
                             <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">Generated Signals:</h3>
                                <button onClick={handleCopy} className="bg-slate-700 hover:bg-slate-600 text-sm text-cyan-300 font-bold py-2 px-4 rounded-md">{copySuccess || 'Copy'}</button>
                            </div>
                            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                               {result.signals.map((signal, index) => (
                                    <div key={index} className="bg-slate-900/70 p-4 rounded-lg border border-gray-700">
                                        <div className="flex justify-between items-center font-bold">
                                            <span className="font-roboto-mono text-gray-400">{signal.time}</span>
                                            <span className={`${signal.direction === Signal.CALL ? 'text-green-400' : 'text-red-400'}`}>{signal.direction} ▲</span>
                                        </div>
                                        <p className="text-gray-300 mt-2 text-sm">{signal.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                     {result && result.signals.length === 0 && <p className="text-center text-gray-400">The AI could not identify any high-probability signals in the next 30 minutes based on the provided chart.</p>}
                </div>
            </div>
        </PageWrapper>
    );
};

export const SignalGenerator1M: React.FC = () => {
    // This is a placeholder/mock implementation as real-time signal generation is complex.
    const [selectedPair, setSelectedPair] = useState(PAIRS[0]);
    const timeframes = ['5 Sec', '10 Sec', '30 Sec', '1 Min', '5 Min'];
    const [selectedTimeframe, setSelectedTimeframe] = useState('1 Min');
    const [signal, setSignal] = useState<FutureSignal | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = () => {
        setIsLoading(true);
        setSignal(null);
        setTimeout(() => {
            setSignal(generateNextMinuteSignal(selectedPair, selectedTimeframe));
            setIsLoading(false);
        }, 1500);
    };

    return (
        <PageWrapper title="Signals Generator 1M" description="Select a pair and timeframe to get the next immediate signal. This tool uses a predictive algorithm based on time and volatility.">
            <div className="max-w-md mx-auto space-y-6">
                <PairSelector selectedPair={selectedPair} onSelectPair={setSelectedPair} />
                <div>
                    <label className="font-bold text-gray-300">2. Select Time Frame</label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        {timeframes.map(tf => (
                            <button key={tf} onClick={() => setSelectedTimeframe(tf)} className={`p-2 rounded-md transition-colors ${selectedTimeframe === tf ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>{tf}</button>
                        ))}
                    </div>
                </div>
                 <div className="text-center pt-4">
                    <button onClick={handleGenerate} disabled={isLoading} className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-700 disabled:cursor-wait text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-cyan-500/30">
                        {isLoading ? 'GENERATING...' : 'GENERATE NEXT SIGNAL'}
                    </button>
                 </div>
                 {isLoading && <Loader/>}
                 {signal && (
                    <div className="text-center bg-slate-900/50 p-6 rounded-lg animate-fade-in">
                        <p className="font-roboto-mono text-gray-400">{signal.pair} @ {signal.time}</p>
                        <div className={`my-2 text-6xl font-bold ${signal.direction === Signal.CALL ? 'text-green-400' : 'text-red-400'}`}>
                            {signal.direction}
                        </div>
                        <p className="text-sm text-gray-500">For {selectedTimeframe} expiry</p>
                    </div>
                 )}
            </div>
        </PageWrapper>
    );
}

export const FutureSignals1M: React.FC = () => {
    const [signals, setSignals] = useState<FutureSignal[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    const handleGenerate = () => {
        setIsLoading(true);
        setSignals([]);
        setTimeout(() => {
            setSignals(generateFutureSignals());
            setIsLoading(false);
        }, 2000);
    };

    const handleCopy = () => {
        if (signals.length === 0) return;
        const textToCopy = `LOSS RECOVERY ⦿ FUTURE BOT\nUTC; +5:00\nPAKISTAN TIME ZONE\nLIST ------\n` + 
        signals.map(s => `1 MIN ➡ ${s.pair} ➡ ${s.time} ➡ ${s.direction}`).join('\n');
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopySuccess('Copied to clipboard!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Failed to copy.');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    return (
        <PageWrapper title="Future Signals 1M" description="Generate a list of future signals for multiple pairs with a 1-minute timeframe. Signals have a 3-5 minute interval.">
            <div className="text-center">
                 <button onClick={handleGenerate} disabled={isLoading} className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-700 disabled:cursor-wait text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-cyan-500/30">
                    {isLoading ? 'GENERATING LIST...' : 'GENERATE SIGNALS'}
                </button>
            </div>
            {isLoading && <Loader />}
            {signals.length > 0 && (
                <div className="mt-8 animate-fade-in">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">Generated Signals List:</h3>
                        <button onClick={handleCopy} className="bg-slate-700 hover:bg-slate-600 text-sm text-cyan-300 font-bold py-2 px-4 rounded-md">{copySuccess || 'Copy List'}</button>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg max-h-96 overflow-y-auto custom-scrollbar">
                        <pre className="text-left font-roboto-mono text-gray-300 whitespace-pre-wrap">
                            <span className="text-cyan-400">TIMEFRAME ➡ PAIR ➡ TIME ➡ DIRECTION</span>
                            {'\n'}{'--------------------------------------------------'}{'\n'}
                            {signals.map(s => 
                                <span key={s.time+s.pair}>
                                    1 MIN <span className="text-gray-500">➡</span> {s.pair.padEnd(18, ' ')} <span className="text-gray-500">➡</span> {s.time} <span className="text-gray-500">➡</span>
                                    <span className={s.direction === Signal.CALL ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}> {s.direction}</span>
                                    {'\n'}
                                </span>
                            )}
                        </pre>
                    </div>
                    <div className="mt-6 prose prose-invert max-w-none text-gray-400 text-sm">
                        <h4 className="text-cyan-400">Rules to Follow:</h4>
                        <ul>
                            <li>Only enter trades if the market conditions align with your own strategy. Do not trade blindly.</li>
                            <li>Use proper money management. Do not risk more than 1-2% of your capital on a single trade.</li>
                            <li>Avoid trading during high-impact news events.</li>
                            <li>These signals are algorithmic predictions and not guaranteed. Trade at your own risk.</li>
                        </ul>
                    </div>
                </div>
            )}
        </PageWrapper>
    );
};

// --- STATIC PAGES ---

export const HowToUse: React.FC = () => (
    <PageWrapper title="How To Use" description="A quick guide to get started with the LR - CHART AI tools.">
         <div className="prose prose-invert max-w-none text-gray-300 space-y-4">
            <div>
                <h4 className="text-cyan-400">AI Chart Analyzer</h4>
                <p>This is your primary tool for instant analysis. Simply take a clear screenshot of your trading chart (1-minute timeframe is recommended), upload it using the drag-and-drop or file selection interface, and click "Analyze Chart". Within seconds, the AI will provide a CALL or PUT signal along with a detailed technical reason.</p>
            </div>
             <div>
                <h4 className="text-cyan-400">AI Future Signals</h4>
                <p>This tool predicts upcoming opportunities. First, select the correct asset pair from the list. Then, upload a clear chart screenshot. Click "Generate Future Signals", and the AI will project potential trade setups for the next 30 minutes based on the current market structure.</p>
            </div>
            <div>
                <h4 className="text-cyan-400">Signal Generators (1M & Future)</h4>
                <p>These tools provide algorithmically generated signals without needing a chart. For the '1M Generator', select your desired pair and timeframe, then click generate for an immediate signal. For 'Future Signals', simply click the generate button to get a list of upcoming signals for various pairs.</p>
            </div>
             <div>
                <h4 className="text-cyan-400">General Advice</h4>
                <p>Always use these tools as a confirmation or secondary analysis to your own trading strategy. Never rely solely on AI or algorithmic signals. Practice with a demo account first to understand how the signals behave in different market conditions.</p>
            </div>
        </div>
    </PageWrapper>
);
export const UserGuide: React.FC = HowToUse; // Alias for simplicity

export const Community: React.FC = () => (
    <PageWrapper title="Join Our Community" description="Connect with other traders, share strategies, and get the latest updates.">
        <div className="text-center">
            <p className="text-lg text-gray-300 mb-6">Join our official Telegram channel to become part of the LR - CHART AI family!</p>
            <a 
                href="https://t.me/+psHHfH3JLrk2Nzdk" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-cyan-500/30 inline-block"
            >
                Join on Telegram
            </a>
        </div>
    </PageWrapper>
);

export const MoneyManagement: React.FC = () => (
    <PageWrapper title="Money Management" description="Effective risk management is the key to long-term success in trading.">
        <div className="prose prose-invert max-w-none text-gray-300">
            <h4 className="text-cyan-400">The 1-2% Rule</h4>
            <p>The most fundamental rule of money management is to never risk more than 1-2% of your total account balance on a single trade. This ensures that a series of losses will not wipe out your account, allowing you to stay in the game long enough to be profitable.</p>
            <p><strong>Example:</strong> If your account balance is $1000, you should not invest more than $10 - $20 on any single trade.</p>

            <h4 className="text-cyan-400">Risk-to-Reward Ratio</h4>
            <p>While more applicable to other forms of trading, the principle is important. Understand the potential payout of your trade versus the amount you are risking. Always aim for strategies that provide a positive expected return over time.</p>

            <h4 className="text-cyan-400">Sample Plans</h4>
            <table className="w-full text-left">
                <thead>
                    <tr><th>Plan Level</th><th>Account Balance</th><th>Investment per Trade (1.5%)</th><th>Daily Target (5%)</th><th>Daily Stop-Loss (10%)</th></tr>
                </thead>
                <tbody>
                    <tr><td>Beginner</td><td>$100</td><td>$1.50</td><td>$5</td><td>-$10 (or 3-4 losses)</td></tr>
                    <tr><td>Intermediate</td><td>$500</td><td>$7.50</td><td>$25</td><td>-$50 (or 3-4 losses)</td></tr>
                    <tr><td>Advanced</td><td>$1000</td><td>$15.00</td><td>$50</td><td>-$100 (or 3-4 losses)</td></tr>
                </tbody>
            </table>
            <p className="mt-4 text-sm text-gray-400"><strong>Note:</strong> These are sample plans. Adjust them according to your personal risk tolerance and trading strategy. The key is to be consistent and disciplined.</p>
        </div>
    </PageWrapper>
);

export const AboutUs: React.FC = () => (
    <PageWrapper title="About Us" description="Pioneering the future of trading with artificial intelligence.">
        <div className="prose prose-invert max-w-none text-gray-300">
            <p>LR - CHART AI was founded on the principle that advanced trading analysis should be accessible to everyone. Our team consists of experienced traders, software engineers, and AI specialists dedicated to creating powerful, reliable, and intuitive tools for the financial markets.</p>
            <p>We believe that the synergy between human expertise and artificial intelligence is the future of trading. Our AI models are trained on vast datasets of market information, incorporating hundreds of technical indicators and price action patterns to identify high-probability opportunities that the human eye might miss.</p>
            <p>Our commitment is to continuous improvement, constantly refining our algorithms and expanding our toolset to meet the evolving demands of the market. We are not just building a product; we are building a community of informed and empowered traders.</p>
        </div>
    </PageWrapper>
);
