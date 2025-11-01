import React, { useState } from 'react';
import { Header, Page } from './components/Header';
import { Disclaimer } from './components/Disclaimer';
import { 
    Dashboard,
    AIChartAnalyzer,
    AIFutureSignals,
    SignalGenerator1M,
    FutureSignals1M,
    HowToUse,
    MoneyManagement,
    Community,
    AboutUs
} from './components/Pages';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('Dashboard');

    const renderPage = () => {
        switch (currentPage) {
            case 'Dashboard':
                return <Dashboard />;
            case 'AI Chart Analyzer':
                return <AIChartAnalyzer />;
            case 'AI Future Signals':
                return <AIFutureSignals />;
            case 'Signal Generator 1M':
                return <SignalGenerator1M />;
            case 'Future Signals 1M':
                return <FutureSignals1M />;
            case 'How To Use':
                return <HowToUse />;
            case 'Money Management':
                return <MoneyManagement />;
            case 'Community':
                return <Community />;
            case 'About Us':
                return <AboutUs />;
            default:
                return <Dashboard />;
        }
    };
    
    return (
        <div className="bg-slate-900 text-gray-200 min-h-screen font-sans">
            <Header currentPage={currentPage} onNavClick={setCurrentPage} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderPage()}
            </main>
            <Disclaimer />
             <style>{`
                /* Custom scrollbar for webkit browsers */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #1e293b; /* slate-800 */
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #475569; /* slate-600 */
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #64748b; /* slate-500 */
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default App;
