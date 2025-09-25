// Voice Recording Service for Premium Transaction Features

export interface VoiceRecordingResult {
  audioUrl: string;
  duration: number;
  timestamp: string;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  alternatives?: string[];
}

export interface VoiceCommandResult {
  command: 'add_transaction' | 'search' | 'filter' | 'export' | 'unknown';
  parameters: Record<string, any>;
  confidence: number;
}

class VoiceRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private recognition: any = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private isTranscribing = false;

  constructor() {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition(): void {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    this.recognition = new SpeechRecognition();

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;

    // Support multiple languages
    this.recognition.lang = 'en-US';
  }

  // Basic voice recording functionality
  async startRecording(): Promise<void> {
    if (this.isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(250); // Collect data every 250ms
      this.isRecording = true;

    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to start recording. Please check microphone permissions.');
    }
  }

  async stopRecording(): Promise<VoiceRecordingResult> {
    if (!this.isRecording || !this.mediaRecorder) {
      throw new Error('No active recording to stop');
    }

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) return reject(new Error('MediaRecorder not available'));

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm;codecs=opus' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Calculate approximate duration (this is a rough estimate)
        const duration = this.audioChunks.length * 0.25; // 250ms chunks

        const result: VoiceRecordingResult = {
          audioUrl,
          duration,
          timestamp: new Date().toISOString()
        };

        this.isRecording = false;
        this.audioChunks = [];

        // Stop all tracks to free the microphone
        if (this.mediaRecorder?.stream) {
          this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }

        resolve(result);
      };

      this.mediaRecorder.onerror = (event) => {
        reject(new Error('Recording failed'));
      };

      this.mediaRecorder.stop();
    });
  }

  // Real-time speech-to-text transcription
  startTranscription(): Promise<TranscriptionResult> {
    if (!this.recognition) {
      return Promise.reject(new Error('Speech recognition not supported'));
    }

    if (this.isTranscribing) {
      this.recognition.stop();
    }

    return new Promise((resolve, reject) => {
      if (!this.recognition) return reject(new Error('Speech recognition not available'));

      let finalTranscript = '';
      let confidence = 0;
      const alternatives: string[] = [];

      this.recognition.onstart = () => {
        this.isTranscribing = true;
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;

          if (result.isFinal) {
            finalTranscript += transcript + ' ';
            confidence = result[0].confidence;

            // Collect alternatives
            for (let j = 1; j < result.length; j++) {
              alternatives.push(result[j].transcript);
            }
          } else {
            interimTranscript += transcript;
          }
        }

        // Return interim results for real-time feedback
        if (interimTranscript) {
          // You could emit an event here for real-time updates
        }
      };

      this.recognition.onend = () => {
        this.isTranscribing = false;
        resolve({
          text: finalTranscript.trim(),
          confidence,
          alternatives: alternatives.length > 0 ? alternatives : undefined
        });
      };

      this.recognition.onerror = (event: any) => {
        this.isTranscribing = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      // Set language based on user preference (could be configurable)
      this.recognition.lang = 'en-US';
      this.recognition.start();
    });
  }

  stopTranscription(): void {
    if (this.recognition && this.isTranscribing) {
      this.recognition.stop();
    }
  }

  // Advanced: Voice command processing
  processVoiceCommand(transcript: string): VoiceCommandResult {
    const lowerTranscript = transcript.toLowerCase();

    // Transaction commands
    if (this.containsTransactionKeywords(lowerTranscript)) {
      return this.parseTransactionCommand(transcript);
    }

    // Search commands
    if (lowerTranscript.includes('search') || lowerTranscript.includes('find')) {
      return this.parseSearchCommand(transcript);
    }

    // Filter commands
    if (lowerTranscript.includes('filter') || lowerTranscript.includes('show')) {
      return this.parseFilterCommand(transcript);
    }

    // Export commands
    if (lowerTranscript.includes('export') || lowerTranscript.includes('download')) {
      return {
        command: 'export',
        parameters: { format: 'csv' },
        confidence: 0.7
      };
    }

    return {
      command: 'unknown',
      parameters: {},
      confidence: 0.0
    };
  }

  private containsTransactionKeywords(text: string): boolean {
    const transactionKeywords = [
      'add', 'record', 'spent', 'earned', 'bought', 'sold', 'paid', 'received',
      'expense', 'income', 'transaction', 'purchase', 'sale'
    ];
    return transactionKeywords.some(keyword => text.includes(keyword));
  }

  private parseTransactionCommand(transcript: string): VoiceCommandResult {
    const lowerTranscript = transcript.toLowerCase();

    // Extract amount
    const amountMatch = transcript.match(/(\d+(?:\.\d{2})?)\s*(?:ghs|cedis|ghana cedi)?/i);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : null;

    // Determine transaction type
    const incomeKeywords = ['earned', 'received', 'sold', 'income', 'revenue'];
    const expenseKeywords = ['spent', 'bought', 'paid', 'expense', 'cost'];

    let type: 'income' | 'expense' = 'expense';
    let confidence = 0.6;

    if (incomeKeywords.some(keyword => lowerTranscript.includes(keyword))) {
      type = 'income';
      confidence = 0.8;
    } else if (expenseKeywords.some(keyword => lowerTranscript.includes(keyword))) {
      confidence = 0.8;
    }

    // Extract category
    const categoryKeywords = {
      'food': ['food', 'lunch', 'dinner', 'meal', 'restaurant'],
      'transport': ['transport', 'fuel', 'gas', 'taxi', 'uber'],
      'office': ['office', 'rent', 'utilities'],
      'marketing': ['marketing', 'advertising', 'promotion'],
      'supplies': ['supplies', 'equipment', 'materials']
    };

    let category = 'other';
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerTranscript.includes(keyword))) {
        category = cat;
        break;
      }
    }

    return {
      command: 'add_transaction',
      parameters: {
        amount,
        type,
        category,
        description: transcript
      },
      confidence
    };
  }

  private parseSearchCommand(transcript: string): VoiceCommandResult {
    // Extract search terms after "search" or "find"
    const searchMatch = transcript.match(/(?:search|find)\s+(?:for\s+)?(.+)/i);
    const searchTerm = searchMatch ? searchMatch[1].trim() : '';

    return {
      command: 'search',
      parameters: { query: searchTerm },
      confidence: 0.8
    };
  }

  private parseFilterCommand(transcript: string): VoiceCommandResult {
    const lowerTranscript = transcript.toLowerCase();

    // Date filters
    if (lowerTranscript.includes('today')) {
      return {
        command: 'filter',
        parameters: { period: 'today' },
        confidence: 0.9
      };
    }

    if (lowerTranscript.includes('this week')) {
      return {
        command: 'filter',
        parameters: { period: 'week' },
        confidence: 0.9
      };
    }

    if (lowerTranscript.includes('this month')) {
      return {
        command: 'filter',
        parameters: { period: 'month' },
        confidence: 0.9
      };
    }

    // Type filters
    if (lowerTranscript.includes('income') || lowerTranscript.includes('earnings')) {
      return {
        command: 'filter',
        parameters: { type: 'income' },
        confidence: 0.8
      };
    }

    if (lowerTranscript.includes('expense') || lowerTranscript.includes('spending')) {
      return {
        command: 'filter',
        parameters: { type: 'expense' },
        confidence: 0.8
      };
    }

    return {
      command: 'filter',
      parameters: {},
      confidence: 0.5
    };
  }

  // Utility methods
  isRecordingSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  isSpeechRecognitionSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  // Advanced features for future implementation

  // Speech-to-text with cloud services (Google Cloud Speech, AWS Transcribe, etc.)
  async transcribeWithCloudService(audioBlob: Blob): Promise<TranscriptionResult> {
    // This would integrate with external speech-to-text services
    // for better accuracy and multi-language support
    throw new Error('Cloud transcription not implemented yet');
  }

  // Audio analysis and enhancement
  async enhanceAudioQuality(audioBlob: Blob): Promise<Blob> {
    // This would implement noise reduction, audio normalization, etc.
    throw new Error('Audio enhancement not implemented yet');
  }

  // Speaker identification for multi-user scenarios
  async identifySpeaker(audioBlob: Blob): Promise<string> {
    // This would implement speaker recognition
    throw new Error('Speaker identification not implemented yet');
  }

  // Cleanup method
  cleanup(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }

    if (this.recognition && this.isTranscribing) {
      this.recognition.stop();
    }

    this.audioChunks = [];
    this.isRecording = false;
    this.isTranscribing = false;
  }
}

// Export singleton instance
export const voiceRecordingService = new VoiceRecordingService();
export default voiceRecordingService;

// Type declarations for Speech Recognition API
// Simplified type declarations for Speech Recognition API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}