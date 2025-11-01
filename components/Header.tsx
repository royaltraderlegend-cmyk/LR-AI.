import React from 'react';

export type Page = 'Dashboard' | 'AI Chart Analyzer' | 'AI Future Signals' | 'Signal Generator 1M' | 'Future Signals 1M' | 'How To Use' | 'Money Management' | 'Community' | 'About Us';

interface HeaderProps {
    currentPage: Page;
    onNavClick: (page: Page) => void;
}

const NavLink: React.FC<{ page: Page; currentPage: Page; onClick: (page: Page) => void; children: React.ReactNode }> = ({ page, currentPage, onClick, children }) => {
    const isActive = currentPage === page;
    return (
        <button
            onClick={() => onClick(page)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                ? 'bg-cyan-500 text-white'
                : 'text-gray-300 hover:bg-slate-700 hover:text-white'
            }`}
        >
            {children}
        </button>
    );
};


export const Header: React.FC<HeaderProps> = ({ currentPage, onNavClick }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    
    const navItems: Page[] = ['Dashboard', 'AI Chart Analyzer', 'AI Future Signals', 'Signal Generator 1M', 'Future Signals 1M'];
    const dropdownItems: Page[] = ['How To Use', 'Money Management', 'Community', 'About Us'];

    return (
        <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 shadow-lg shadow-black/20">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                           <h1 className="text-white text-xl font-bold font-roboto-mono">LR - CHART AI</h1>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {navItems.map(item => <NavLink key={item} page={item} currentPage={currentPage} onClick={onNavClick}>{item}</NavLink>)}
                                <div className="relative">
                                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                        More ▾
                                    </button>
                                    {isMenuOpen && (
                                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-slate-800 ring-1 ring-black ring-opacity-5" onMouseLeave={() => setIsMenuOpen(false)}>
                                            {dropdownItems.map(item => (
                                                <button
                                                    key={item}
                                                    onClick={() => { onNavClick(item); setIsMenuOpen(false); }}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-700"
                                                >
                                                    {item}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            type="button"
                            className="bg-slate-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <svg className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            {isMenuOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                         {[...navItems, ...dropdownItems].map(item => (
                            <button key={item} onClick={() => { onNavClick(item); setIsMenuOpen(false); }} className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${currentPage === item ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-slate-700'}`}>{item}</button>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
};
