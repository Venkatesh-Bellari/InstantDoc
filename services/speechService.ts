
// SpeechRecognition related interfaces and declarations are removed.

const BrowserSpeechRecognition = null; // STT is removed

let currentUtterance: SpeechSynthesisUtterance | null = null;
// STT related variables (recognition, onResultCallback, etc.) are removed.


export const isSpeechRecognitionSupported = (): boolean => false; // STT is removed
export const isSpeechSynthesisSupported = (): boolean => typeof window !== 'undefined' && 'speechSynthesis' in window;

export const stopListening = (): void => { // STT is removed, this is a no-op
  console.log("SpeechService: stopListening called, but STT is not supported/removed.");
};

export const startListening = ( // STT is removed, this is a no-op that calls onError.
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (error: string) => void,
  onEnd: () => void,
  languageCode: string = 'en-US'
): Promise<void> => {
  const msg = "Speech recognition (voice input) is not supported.";
  console.warn("SpeechService: startListening -", msg);
  onError(msg);
  return Promise.reject(new Error(msg));
};


export const speak = (text: string, languageCode: string): Promise<void> => {
  return new Promise(async (resolve, reject) => { 
    if (!isSpeechSynthesisSupported()) {
      console.warn("SpeechService: speak - Speech synthesis not supported.");
      const err = new Error("Speech synthesis not supported.");
      (err as any).speechErrorCode = 'synthesis-unavailable';
      return reject(err);
    }
    if (!text.trim()) {
      console.warn("SpeechService: speak - Text is empty.");
      const err = new Error("Cannot speak empty text.");
      (err as any).speechErrorCode = 'invalid-argument';
      return reject(err);
    }

    if (speechSynthesis.speaking || speechSynthesis.pending) {
      console.log("SpeechService: speak - Speech is active or pending. Cancelling existing speech before starting new utterance.");
      speechSynthesis.cancel(); 
      await new Promise(r => setTimeout(r, 0)); 
    }
    currentUtterance = null; 

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageCode;

    const voices = speechSynthesis.getVoices();
    console.log("SpeechService: Total voices available for speak():", voices.length);

    let selectedVoice = voices.find(voice => voice.lang === languageCode);

    if (!selectedVoice) {
      const baseLanguage = languageCode.split('-')[0];
      const baseLangVoices = voices.filter(voice => voice.lang.startsWith(baseLanguage));
      console.log(`SpeechService: Found ${baseLangVoices.length} voices for lang "${languageCode}" (or base lang "${baseLanguage}").`);
      if (baseLangVoices.length > 0) {
        selectedVoice = baseLangVoices.find(voice => voice.default) || baseLangVoices[0];
      }
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log(`SpeechService: Using voice "${selectedVoice.name}" [${selectedVoice.lang}] for requested lang "${languageCode}".`);
    } else {
      if (voices.length > 0) {
        console.warn(`SpeechService: No specific or default voice found for lang "${languageCode}". Using browser's absolute default voice. Speech may not be in the correct language or may fail.`);
      } else {
        console.warn(`SpeechService: No voices available at all in the browser. Speech synthesis will likely fail.`);
        const err = new Error("No speech synthesis voices available in the browser.");
        (err as any).speechErrorCode = 'voice-unavailable';
        return reject(err);
      }
    }
    console.log(`SpeechService: Final Utterance Details - Lang: ${utterance.lang}, Voice: ${utterance.voice ? `${utterance.voice.name} (${utterance.voice.lang})` : 'Browser Default'}. Text (start): "${text.substring(0,50)}..."`);

    currentUtterance = utterance;

    utterance.onstart = () => {
      console.log(`SpeechService: Speech started. Lang: ${utterance.lang}, Voice: ${utterance.voice ? utterance.voice.name : 'Default'}.`);
    };
    utterance.onend = () => {
      console.log(`SpeechService: Speech ended naturally. Lang: ${utterance.lang}`);
      if (currentUtterance === utterance) currentUtterance = null;
      resolve();
    };
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      const logPrefix = `SpeechService: Speech ${event.error === 'canceled' || event.error === 'interrupted' ? 'operation' : 'error'}. Reason: ${event.error}.`;
      const logMessage = `${logPrefix} Lang: ${utterance.lang}. Text (start): "${text.substring(0, 50)}..."`;

      if (event.error === 'canceled' || event.error === 'interrupted') {
        console.log(logMessage); // Log interruptions as info
      } else {
        console.error(logMessage); // Log actual errors as errors
      }
      
      if (currentUtterance === utterance) currentUtterance = null;
      const err = new Error(`Speech error: ${event.error}`);
      (err as any).speechErrorCode = event.error; // Attach the raw error code
      reject(err);
    };
    utterance.onpause = () => {
      console.log(`SpeechService: Speech paused. Lang: ${utterance.lang}`);
    };
    utterance.onresume = () => {
      console.log(`SpeechService: Speech resumed. Lang: ${utterance.lang}`);
    };

    console.log("SpeechService: Executing speechSynthesis.speak()");
    speechSynthesis.speak(utterance);
  });
};


export const cancelSpeech = (): void => {
  if (isSpeechSynthesisSupported()) {
    console.log("SpeechService: cancelSpeech called.");
    speechSynthesis.cancel();
    currentUtterance = null; 
  }
};

export const pauseSpeech = (): void => {
  if (isSpeechSynthesisSupported() && speechSynthesis.speaking && !speechSynthesis.paused) {
    console.log("SpeechService: pauseSpeech called.");
    speechSynthesis.pause();
  }
};

export const resumeSpeech = (): void => {
  if (isSpeechSynthesisSupported() && speechSynthesis.paused) {
    console.log("SpeechService: resumeSpeech called.");
    speechSynthesis.resume();
  }
};

export const isSpeechActive = (): boolean => {
  return isSpeechSynthesisSupported() && (speechSynthesis.speaking || speechSynthesis.pending);
};
export const isSpeechPausedState = (): boolean => {
  return isSpeechSynthesisSupported() && speechSynthesis.paused;
}

export const hasVoiceForLanguage = (languageCode: string): boolean => {
  if (!isSpeechSynthesisSupported()) return false;
  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) {
    console.warn("SpeechService: hasVoiceForLanguage - speechSynthesis.getVoices() returned an empty list. Voices might still be loading or none are available.");
  }
  let found = voices.some(voice => voice.lang === languageCode);
  if (!found) {
    const baseLanguage = languageCode.split('-')[0];
    found = voices.some(voice => voice.lang.startsWith(baseLanguage));
  }
  return found;
};

if (isSpeechSynthesisSupported()) {
    if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.onvoiceschanged = () => {
            console.log("SpeechService: Voices loaded via onvoiceschanged. Count:", speechSynthesis.getVoices().length);
        };
    } else {
         console.log("SpeechService: Voices available on initial check. Count:", speechSynthesis.getVoices().length);
    }
}