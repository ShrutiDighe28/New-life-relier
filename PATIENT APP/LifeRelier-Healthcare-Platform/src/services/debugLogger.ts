export interface DebugLog {
  ocrText: string;
  geminiRequest: string;
  geminiResponse: string;
  parsedJson: string;
  timestamp: string;
}

class DebugLogger {
  private lastLog: DebugLog | null = null;

  setLog(log: DebugLog) {
    this.lastLog = log;
  }

  getLog(): DebugLog | null {
    return this.lastLog;
  }

  clear() {
    this.lastLog = null;
  }
}

export const debugLogger = new DebugLogger();
