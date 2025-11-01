export enum Signal {
  CALL = 'CALL',
  PUT = 'PUT',
}

export interface AnalysisResultData {
  signal: Signal;
  reason: string;
}

export interface FutureSignal {
  pair: string;
  time: string;
  direction: Signal;
  reason?: string;
}

export interface AIFutureSignalResult {
  signals: Required<FutureSignal>[];
}
