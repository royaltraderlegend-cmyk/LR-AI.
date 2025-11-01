import { PAIRS } from '../data/pairs';
import { Signal, type FutureSignal } from '../types';

// This file mocks signal generation as real-time, high-accuracy signals are beyond front-end capabilities.

export function generateNextMinuteSignal(pair: string, timeframe: string): FutureSignal {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    return {
        pair,
        time,
        direction: Math.random() > 0.5 ? Signal.CALL : Signal.PUT,
    };
}


export function generateFutureSignals(): FutureSignal[] {
    const signals: FutureSignal[] = [];
    const now = new Date();
    const usedPairs: string[] = [];

    // Generate 10-15 signals for variety
    const numSignals = Math.floor(Math.random() * 6) + 10;
    let currentTime = now.getTime();

    for (let i = 0; i < numSignals; i++) {
        // Increment time by 3 to 5 minutes
        currentTime += (Math.floor(Math.random() * 3) + 3) * 60 * 1000;
        const signalTime = new Date(currentTime);
        
        let randomPair = PAIRS[Math.floor(Math.random() * PAIRS.length)];
        // Ensure pair variety
        while (usedPairs.slice(-5).includes(randomPair)) {
             randomPair = PAIRS[Math.floor(Math.random() * PAIRS.length)];
        }
        usedPairs.push(randomPair);

        signals.push({
            pair: randomPair,
            time: signalTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            direction: Math.random() > 0.52 ? Signal.CALL : Signal.PUT, // Slight bias
        });
    }

    return signals;
}
