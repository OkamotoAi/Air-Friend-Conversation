import React, { useState, useCallback } from 'react';
import { PersonaConfig } from './types';
import PersonaDisplay from './components/PersonaDisplay';
import ChatInterface from './components/ChatInterface';
import PersonaSelector from './components/PersonaSelector';
import { generateOpeningMessage } from './services/geminiService';

const App: React.FC = () => {
  const [leftPersona, setLeftPersona] = useState<PersonaConfig | null>(null);
  const [rightPersona, setRightPersona] = useState<PersonaConfig | null>(null); // Only set in Spectator Mode
  
  const [initialMessage, setInitialMessage] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(false);

  const startChat = useCallback(async (left: PersonaConfig, right?: PersonaConfig) => {
    setIsInitializing(true);
    setLeftPersona(null);
    setRightPersona(null);
    
    try {
        // In Spectator mode (right exists), Left starts talking.
        // In Interactive mode (right undefined), AI (Left) starts talking.
        const opening = await generateOpeningMessage(left.type);
        setInitialMessage(opening);
        
        setLeftPersona(left);
        if (right) {
          setRightPersona(right);
        }
    } catch (e) {
        console.error("Failed to init persona", e);
        setInitialMessage("システムエラー。会話は無意味です。");
        setLeftPersona(left);
        if (right) setRightPersona(right);
    } finally {
        setIsInitializing(false);
    }
  }, []);

  const resetToSelection = useCallback(() => {
    setLeftPersona(null);
    setRightPersona(null);
    setInitialMessage("");
  }, []);

  // Loading Screen
  if (isInitializing) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-100 text-gray-500 font-mono">
        <div className="animate-spin text-4xl mb-4">↻</div>
        <p>CONNECTING TO AIR FRIEND NETWORK...</p>
        <p className="text-xs mt-2 text-gray-400">Searching for indifferent peers...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-md mx-auto shadow-2xl bg-white border-x border-gray-300">
      {/* Header */}
      <header className="bg-gray-900 text-white p-3 text-center border-b-4 border-gray-500 shrink-0">
        <h1 className="text-lg font-black tracking-tighter uppercase font-mono">
          Air Friend Conversation
        </h1>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest">
          No Logs. No Empathy. No Point.
        </p>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {!leftPersona ? (
          // Selection Screen
          <PersonaSelector onSelect={startChat} />
        ) : (
          // Chat Screen
          <>
            <PersonaDisplay persona={leftPersona} rightPersona={rightPersona || undefined} />
            <ChatInterface 
                leftPersona={leftPersona}
                rightPersona={rightPersona || undefined}
                initialMessage={initialMessage}
                onReset={resetToSelection}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default App;