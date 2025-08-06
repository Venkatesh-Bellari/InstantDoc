
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Feature, Message, ProcessedImage, GroundingChunk, GroundingMetadata } from '../types';
import { getAiResponse } from '../services/geminiService';
import {
  speak, 
  pauseSpeech, 
  resumeSpeech,
  cancelSpeech, 
  isSpeechSynthesisSupported,
  isSpeechActive,
  isSpeechPausedState,
  hasVoiceForLanguage,
  // startListening, // Removed
  // stopListening,   // Removed
  // isSpeechRecognitionSupported // Removed
} from '../services/speechService';
import FileUpload from './FileUpload';
import Spinner from './Spinner';
import {
  // MicrophoneIcon, // Removed
  PaperAirplaneIcon,
  UserIcon,
  BotIcon,
  PlayIcon,
  PauseIcon,
  XCircleIcon, 
  ChevronUpIcon,
  ChevronDownIcon,
  // StopIcon // Removed
} from './icons'; 

interface ChatInterfaceProps {
  feature: Feature;
  onCloseChat: () => void;
  onEmergencyAlert: (message: string) => void;
}

const SCROLL_THRESHOLD = 300; 

const LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'hi-IN', name: 'हिन्दी (Hindi)' },
  { code: 'te-IN', name: 'తెలుగు (Telugu)' },
  { code: 'es-ES', name: 'Español (Spanish)' },
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ feature, onCloseChat, onEmergencyAlert }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  // speechError state removed

  const [currentLanguage, setCurrentLanguage] = useState<string>(LANGUAGES[0].code);
  const [canSpeakCurrentLanguage, setCanSpeakCurrentLanguage] = useState<boolean>(true);

  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isSpeechPaused, setIsSpeechPaused] = useState<boolean>(false);
  const [ttsErrorForMessageId, setTtsErrorForMessageId] = useState<string | null>(null);

  // isListening state removed

  const [showScrollUpButton, setShowScrollUpButton] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null); 
  const chatContainerRef = useRef<HTMLDivElement>(null); 
  const isMountedRef = useRef<boolean>(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, []);

  const getLanguageName = (code: string) => {
    return LANGUAGES.find(lang => lang.code === code)?.name || code;
  };

  const getIntroMessageText = useCallback((feat: Feature, langCode: string, canSpeakLang: boolean): string => {
    const langName = getLanguageName(langCode);
    let speechMessagePart = '';
    if (!isSpeechSynthesisSupported()) {
        speechMessagePart = 'Speech output is not available in your browser.';
    } else if (!canSpeakLang) {
        speechMessagePart = `Speech output for ${langName} may not be fully supported on your device. Audio playback might be unavailable or use a default voice.`;
    } else {
        speechMessagePart = `Click the play icon on AI messages to hear them.`;
    }

    // Voice input message part removed
    // if (feat.requiresVoice) { ... }

    return `Interacting with: ${feat.title}. ${feat.requiresImageUpload ? 'You can upload an image.' : ''} AI will respond in ${langName}. ${speechMessagePart}`;
  }, []);


  useEffect(() => {
    isMountedRef.current = true;
    let voiceAvailable = true;
    if (isSpeechSynthesisSupported()) {
        voiceAvailable = hasVoiceForLanguage(currentLanguage);
    } else {
        voiceAvailable = false;
    }
    setCanSpeakCurrentLanguage(voiceAvailable);

    setMessages([{
      id: 'system-intro',
      sender: 'system',
      text: getIntroMessageText(feature, currentLanguage, voiceAvailable),
      timestamp: new Date(),
    }]);
    textareaRef.current?.focus(); 

    return () => {
      isMountedRef.current = false;
      console.log("ChatInterface: Cleanup (feature change or unmount). Cancelling any speech.");
      if (isSpeechSynthesisSupported()) { 
        cancelSpeech();
      }
      // stopListening() call removed
      setSpeakingMessageId(null);
      setIsSpeechPaused(false);
      setTtsErrorForMessageId(null);
      // setIsListening(false); // Removed
      // setSpeechError(null); // Removed
    };
  }, [feature, getIntroMessageText]); 

  useEffect(() => {
    if (!isMountedRef.current) return;

    if (isSpeechActive() && isSpeechSynthesisSupported()) {
      cancelSpeech();
      setSpeakingMessageId(null);
      setIsSpeechPaused(false);
    }
    
    let voiceAvailable = true;
    if (isSpeechSynthesisSupported()) {
        voiceAvailable = hasVoiceForLanguage(currentLanguage);
    } else {
        voiceAvailable = false;
    }
    setCanSpeakCurrentLanguage(voiceAvailable);
    
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === 'system-intro' 
        ? { ...msg, text: getIntroMessageText(feature, currentLanguage, voiceAvailable) }
        : msg
      )
    );
    console.log(`ChatInterface: Language changed to ${currentLanguage} (${getLanguageName(currentLanguage)}). Voice available: ${voiceAvailable}`);
    textareaRef.current?.focus(); 
    
    // Logic for stopping/restarting listening on language change removed

  }, [currentLanguage, feature, getIntroMessageText]);


  useEffect(scrollToBottom, [messages, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 120; 
      if (scrollHeight > maxHeight) {
        textareaRef.current.style.height = `${maxHeight}px`;
        textareaRef.current.style.overflowY = 'auto';
      } else {
        textareaRef.current.style.height = `${scrollHeight}px`;
        textareaRef.current.style.overflowY = 'hidden';
      }
    }
  }, [inputText]);

  const handleTogglePlayPause = async (messageId: string, textToSpeak: string) => {
    if (!isSpeechSynthesisSupported()) {
      if(isMountedRef.current) {
        setError("Speech synthesis is not supported on your browser.");
        setTtsErrorForMessageId(messageId); 
      }
      return;
    }

    if (!canSpeakCurrentLanguage) {
      if(isMountedRef.current) {
        setTtsErrorForMessageId(messageId); 
      }
      return;
    }
  
    if(isMountedRef.current && error?.includes("Speech synthesis")) setError(null);
    if(isMountedRef.current && ttsErrorForMessageId === messageId) setTtsErrorForMessageId(null);
  
    if (speakingMessageId === messageId) {
      if (isSpeechPaused) {
        resumeSpeech(); 
        if (isMountedRef.current) setIsSpeechPaused(false);
      } else {
        pauseSpeech(); 
        if (isMountedRef.current) setIsSpeechPaused(true);
      }
    } else { 
      if(isSpeechActive()) {
        cancelSpeech(); 
      }
      
      if (isMountedRef.current) {
        setIsSpeechPaused(false); 
        setSpeakingMessageId(messageId); 
      }
  
      try {
        await speak(textToSpeak, currentLanguage); 
        if (isMountedRef.current && speakingMessageId === messageId) { 
          setSpeakingMessageId(null);
          setIsSpeechPaused(false);
        }
      } catch (err: any) { 
        if (isMountedRef.current) {
            if (speakingMessageId === messageId) { 
                setSpeakingMessageId(null);
                setIsSpeechPaused(false);
            }
            if (err && (err.speechErrorCode === 'canceled' || err.speechErrorCode === 'interrupted')) {
                console.log(`ChatInterface: Speech for message ${messageId} (lang ${currentLanguage}) was ${err.speechErrorCode}. Details: ${err.message}`);
                if (ttsErrorForMessageId === messageId) {
                    setTtsErrorForMessageId(null); 
                }
            } else {
                console.error(`ChatInterface: TTS Error for message ${messageId} (lang ${currentLanguage}):`, err);
                setTtsErrorForMessageId(messageId);
            }
        } else {
            if (!(err && (err.speechErrorCode === 'canceled' || err.speechErrorCode === 'interrupted'))) {
                 console.warn("ChatInterface: TTS Error caught but component unmounted/feature changed:", err, "Original messageId:", messageId);
            } else {
                 console.log("ChatInterface: Speech cancelled/interrupted during component unmount/feature change for messageId:", messageId);
            }
        }
      }
    }
  };

  const handleSendMessage = useCallback(async (text: string, image?: ProcessedImage) => {
    if (!text.trim() && !image) {
      console.log("ChatInterface: Send message called with no text or image. Aborting.");
      return;
    }
    console.log(`ChatInterface: Sending message. Text: "${text.substring(0,50)}...", Image present: ${!!image}, Language: ${currentLanguage}`);

    if (isSpeechActive() && isSpeechSynthesisSupported()) {
        cancelSpeech();
        if(isMountedRef.current) {
            setSpeakingMessageId(null);
            setIsSpeechPaused(false);
        }
    }
    // stopListening call removed

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      imageUrl: image ? `data:${image.mimeType};base64,${image.base64}` : undefined,
      timestamp: new Date(),
    };
    if(isMountedRef.current) setMessages(prev => [...prev, userMessage]);
    if(isMountedRef.current) setInputText(''); 
    if(isMountedRef.current) setUploadedImage(null);
    if(isMountedRef.current) setError(null);
    // setSpeechError(null); // Removed
    if(isMountedRef.current) setIsLoading(true);

    const typingIndicatorMessage: Message = {
        id: `ai-typing-${Date.now()}`,
        sender: 'ai',
        isTyping: true,
        timestamp: new Date()
    };
    if(isMountedRef.current) setMessages(prev => [...prev, typingIndicatorMessage]);
    scrollToBottom();

    try {
      const aiResult = await getAiResponse(text, feature.key, currentLanguage, image);
      let aiText = aiResult.text;
      console.log(`ChatInterface: AI response received. Text (start): "${aiText.substring(0,100)}..."`);

      if (!isMountedRef.current) return;
      setMessages(prev => prev.filter(msg => msg.id !== typingIndicatorMessage.id));

      if (aiText.startsWith('EMERGENCY_ALERT:')) {
        const alertMessage = aiText.substring('EMERGENCY_ALERT:'.length).trim();
        console.log("ChatInterface: Emergency alert detected in AI response:", alertMessage);
        onEmergencyAlert(alertMessage);
        const systemAlertMessage: Message = {
            id: `system-emergency-${Date.now()}`,
            sender: 'system',
            text: `AI detected a potential emergency: "${alertMessage}". Please follow emergency procedures. The AI's full response will follow.`,
            timestamp: new Date(),
        };
        if (isMountedRef.current) setMessages(prev => [...prev, systemAlertMessage]);
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        timestamp: new Date(),
      };
      if (isMountedRef.current) setMessages(prev => [...prev, aiMessage]);
      
    } catch (err) {
      if (!isMountedRef.current) {
          console.log("ChatInterface: General error caught but component unmounted/feature changed.");
          return;
      }
      console.error("ChatInterface: Error in AI response or general handling:", err);
      let detailedErrorMsg = "An unknown error occurred.";
      if (err instanceof Error) detailedErrorMsg = err.message;
      else if (typeof err === 'string') detailedErrorMsg = err;
      else if (typeof err === 'object' && err !== null && (err as any).message && typeof (err as any).message === 'string') detailedErrorMsg = (err as any).message;
      else try {
          const stringifiedError = JSON.stringify(err);
          detailedErrorMsg = stringifiedError.substring(0, 300) + (stringifiedError.length > 300 ? '...' : '');
        } catch (e_stringify) { detailedErrorMsg = "Could not stringify the error object."; }

      setError(`Failed to process request: ${detailedErrorMsg}`);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        sender: 'system',
        text: `Error: ${detailedErrorMsg}`,
        timestamp: new Date(),
      };
      setMessages(prev => prev.filter(msg => msg.id !== typingIndicatorMessage.id));
      setMessages(prev => [...prev, errorMessage]);

    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      scrollToBottom();
    }
  }, [feature, onEmergencyAlert, scrollToBottom, currentLanguage, getIntroMessageText, uploadedImage]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; 
    if (inputText.trim() || uploadedImage) {
      handleSendMessage(inputText, uploadedImage || undefined);
       if (textareaRef.current) { 
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  const handleTextareaKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); 
      if (!isLoading && (inputText.trim() || uploadedImage)) {
        handleSendMessage(inputText, uploadedImage || undefined);
        if (textareaRef.current) { 
          textareaRef.current.style.height = 'auto';
        }
      }
    }
  };

  const handleImageUpload = (file: ProcessedImage | null) => {
    if(!isMountedRef.current) return;
    setUploadedImage(file);
    if (file) {
      textareaRef.current?.focus(); 
    }
  };

  // --- Speech Recognition Handlers Removed ---
  // onSpeechResult, onSpeechError, onSpeechEnd, handleToggleListening removed.

  const handleScroll = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop } = chatContainerRef.current;
      if(isMountedRef.current) setShowScrollUpButton(scrollTop > SCROLL_THRESHOLD);
    }
  }, []);

  const scrollToTop = useCallback(() => {
    chatContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const renderMessageContent = (message: Message) => {
    if (message.isTyping) {
      return (
        <div className="flex items-center space-x-2 py-1">
          <Spinner size="sm" color="text-textMuted" />
          <span className="text-sm text-textMuted">AI is typing...</span>
        </div>
      );
    }
    let content = message.text || '';
    const urlRegex = /(https?:\/\/[^\s<>"]+[^\s<>")!,.?ʻpunctuation])/g;
    content = content.replace(urlRegex, (url: string) => {
      if (url.includes('<a href') || url.includes('</a>')) return url; 
      if (url.includes('<') || url.includes('>')) return url; 
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">${url}</a>`;
    });
    content = content.replace(/\n/g, '<br />');

    return (
      <>
        {message.imageUrl && (
          <img src={message.imageUrl} alt="User upload" className="max-w-full sm:max-w-xs max-h-64 rounded-lg my-2 border border-gray-200" />
        )}
        <div className="prose prose-sm max-w-none break-words" dangerouslySetInnerHTML={{ __html: content }} />
      </>
    );
  };
  
  const isNetworkOrUnavailableError = (error && (
    error.toLowerCase().includes('network') ||
    error.toLowerCase().includes('unavailable') ||
    error.toLowerCase().includes('service might be temporarily unavailable')
  ));
  // speechError check removed from isNetworkOrUnavailableError

  return (
    <div className="flex flex-col h-full bg-bgLighter">
      <div className="flex-grow relative"> 
        <div 
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="absolute inset-0 p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto bg-gray-100/50"
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-xl shadow-sm ${
                msg.sender === 'user' ? 'bg-brand text-white rounded-br-none' :
                msg.sender === 'ai' ? 'bg-cardBg text-textBase rounded-bl-none border border-gray-200/80' :
                'bg-yellow-100/70 text-yellow-800 text-xs italic w-full text-center rounded-lg p-2'
              }`}>
                <div className="flex items-start space-x-2">
                  {msg.sender !== 'system' && (
                      msg.sender === 'user' ?
                      <UserIcon className="w-5 h-5 text-white flex-shrink-0 mt-0.5" /> :
                      <BotIcon className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                  )}
                  <div className={`text-sm sm:text-base leading-relaxed ${msg.sender === 'system' ? 'w-full' : 'min-w-0'}`}> 
                    {renderMessageContent(msg)}
                  </div>
                </div>
                {msg.sender !== 'system' && !msg.isTyping && (
                  <div className="flex justify-between items-center mt-1.5">
                    <p className={`text-xs ${msg.sender === 'user' ? 'text-brand-light/80' : 'text-textLight'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {msg.sender === 'ai' && msg.text && isSpeechSynthesisSupported() && (
                      <div className="flex items-center">
                        <button
                          onClick={() => handleTogglePlayPause(msg.id, msg.text!)}
                          className={`p-1 text-gray-500 hover:text-brand rounded-full hover:bg-gray-200/70 focus:outline-none focus:ring-1 focus:ring-brand-light
                                      ${!canSpeakCurrentLanguage ? 'opacity-50 cursor-not-allowed' : ''}`}
                          aria-label={
                            !canSpeakCurrentLanguage ? `Audio for ${getLanguageName(currentLanguage)} may not be supported` :
                            speakingMessageId === msg.id && !isSpeechPaused ? "Pause speech" : "Play speech"
                          }
                          disabled={!canSpeakCurrentLanguage && isSpeechSynthesisSupported()}
                          title={
                            !canSpeakCurrentLanguage && isSpeechSynthesisSupported() ? `Audio for ${getLanguageName(currentLanguage)} may not be supported on your device.` :
                            speakingMessageId === msg.id && !isSpeechPaused ? "Pause speech" : "Play speech"
                          }
                        >
                          {speakingMessageId === msg.id && !isSpeechPaused ? (
                            <PauseIcon className="w-4 h-4" />
                          ) : (
                            <PlayIcon className="w-4 h-4" />
                          )}
                        </button>
                        {ttsErrorForMessageId === msg.id && (
                            <span className="text-xs text-red-500 ml-1 italic">
                                {!canSpeakCurrentLanguage && isSpeechSynthesisSupported() ? `(Audio for ${getLanguageName(currentLanguage)} unavailable)` : '(Audio error)'}
                            </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          <div className="pt-2 pb-1 text-center">
              <button
                  onClick={onCloseChat}
                  className="text-xs text-textMuted hover:text-accent-dark underline transition-colors px-3 py-1.5 rounded-md hover:bg-gray-200/70"
                  aria-label="Close Chat"
              >
                  Close Chat
              </button>
          </div>
        </div>
        {showScrollUpButton && (
            <button
                type="button"
                onClick={scrollToTop}
                className="absolute bottom-4 right-4 z-20 p-3 bg-brand hover:bg-brand-dark text-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:ring-offset-2 transition-all hover:scale-110 active:scale-95"
                aria-label="Scroll to top"
            >
                <ChevronUpIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
        )}
      </div>

      {error && ( // speechError condition removed
        <div className="p-3 text-sm text-red-700 bg-red-100 border-t border-red-300">
          {error && (
              <>
                <p className="font-semibold">An error occurred:</p>
                <p>{error}</p>
              </>
          )}
          {/* speechError block removed */}
          {isNetworkOrUnavailableError && (
            <div className="mt-2 pt-2 border-t border-red-200">
            <p className="text-xs text-red-600 font-medium">Troubleshooting Tips:</p>
            <ul className="list-disc list-inside ml-2 mt-1 text-xs text-red-600">
                <li>Check your internet connection.</li>
                <li>Try refreshing the page or restarting your browser.</li>
                <li>Ensure your browser is up to date.</li>
                <li>The browser's speech service might be temporarily unavailable. Please try again later.</li>
            </ul>
            </div>
          )}
        </div>
      )}

      {uploadedImage && (
        <div className="p-2 border-t border-gray-200 bg-gray-50 text-xs text-green-700 flex justify-between items-center">
          <span>Attached: {uploadedImage.name}</span>
          <button onClick={() => { if(isMountedRef.current) setUploadedImage(null); }} className="ml-2 text-red-500 hover:text-red-700 font-medium">(Remove)</button>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="p-3 sm:p-4 border-t border-gray-200 bg-white flex items-end space-x-2">
        {feature.requiresImageUpload && <FileUpload onFileProcessed={handleImageUpload} />}
        
        <div className="relative flex-shrink-0">
          <select
            value={currentLanguage}
            onChange={(e) => setCurrentLanguage(e.target.value)}
            className="p-2.5 h-[46px] border border-gray-300 rounded-lg focus:ring-1 focus:ring-brand-light focus:border-transparent outline-none transition-shadow text-xs sm:text-sm bg-slate-100 text-slate-700 appearance-none pr-7"
            aria-label="Select language"
            disabled={isLoading} // isListening removed
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
          <ChevronDownIcon className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex-grow relative">
            <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => {
                if(!isMountedRef.current) return;
                setInputText(e.target.value);
                }}
                placeholder={isLoading ? "AI is responding..." : feature.promptPlaceholder} // isListening removed from placeholder
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-transparent outline-none transition-shadow text-sm sm:text-base bg-slate-100 text-slate-800 placeholder-slate-500 placeholder:text-left resize-none overflow-y-hidden"
                rows={1}
                disabled={isLoading} // isListening removed
                onKeyPress={handleTextareaKeyPress}
            />
        </div>
        
        {/* Microphone button and its conditional rendering logic removed */}

        <button
          type="submit"
          className="bg-brand hover:bg-brand-dark text-white p-3 h-[46px] w-[46px] flex items-center justify-center rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:ring-offset-1 disabled:opacity-60 transition-colors"
          disabled={isLoading || (!inputText.trim() && !uploadedImage)}  // isListening removed
          aria-label="Send message"
        >
          {isLoading ? <Spinner size="sm" color="text-white"/> : <PaperAirplaneIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;