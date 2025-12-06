import React, { useState, useEffect, useRef } from 'react';
import { Message, PersonaConfig } from '../types';
import { generateResponse } from '../services/geminiService';

interface ChatInterfaceProps {
  leftPersona: PersonaConfig;
  rightPersona?: PersonaConfig; // If present, Spectator Mode
  initialMessage: string;
  onReset: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ leftPersona, rightPersona, initialMessage, onReset }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: `init-${Date.now()}`,
      role: 'model', // Left Persona always starts as 'model'
      content: initialMessage,
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true); // Default to true for auto-start
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isSpectator = !!rightPersona;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // --- Auto-Chat Logic for Spectator Mode ---
  useEffect(() => {
    if (!isSpectator || !isAutoPlaying || isLoading) return;

    // Use a timeout to create a natural reading pause
    const timeoutId = setTimeout(async () => {
      const lastMsg = messages[messages.length - 1];
      
      // Determine whose turn it is
      // If last was 'model' (Left), next is 'user' (Right)
      // If last was 'user' (Right), next is 'model' (Left)
      const isLeftTurn = lastMsg.role === 'user'; 
      const currentSpeaker = isLeftTurn ? leftPersona : rightPersona;
      
      if (!currentSpeaker) return;

      setIsLoading(true);

      try {
        // Prepare History for API
        // Gemini API always expects "User" -> "Model" -> "User"
        // The speaker considers THEMSELVES as 'model' and the OTHER as 'user'.
        const historyForApi: Message[] = messages.slice(0, -1).map(m => {
          if (isLeftTurn) {
             // Generating for LEFT (Model). 
             // History: Left(model) -> API(model), Right(user) -> API(user)
             // No change needed.
             return m;
          } else {
             // Generating for RIGHT (acting as Model).
             // History: Left(model) -> API(user), Right(user) -> API(model)
             // We must SWAP roles.
             return {
               ...m,
               role: m.role === 'model' ? 'user' : 'model'
             };
          }
        });

        const promptContent = lastMsg.content;

        const responseText = await generateResponse(currentSpeaker.type, historyForApi, promptContent);

        const newMsg: Message = {
          id: Date.now().toString(),
          role: isLeftTurn ? 'model' : 'user',
          content: responseText,
          timestamp: Date.now()
        };

        setMessages(prev => [...prev, newMsg]);

      } catch (e) {
        console.error("Auto loop error", e);
        setIsAutoPlaying(false);
      } finally {
        setIsLoading(false);
      }

    }, 2000); // 2 seconds delay

    return () => clearTimeout(timeoutId);

  }, [messages, isAutoPlaying, isSpectator, isLoading, leftPersona, rightPersona]);


  // --- User Interaction (Interactive Mode) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSpectator) return; // Disable manual submit in spectator mode
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await generateResponse(leftPersona.type, messages, input);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Dynamic Styles ---
  
  // Helper to get style for a specific persona config
  const getPersonaBubbleStyle = (p: PersonaConfig, isLeft: boolean) => {
    let base = "";
    switch(p.type) {
      case 'TANAKA': base = "bg-slate-300 text-slate-900 border-slate-400"; break;
      case 'SAMANTHA': base = "bg-fuchsia-200 text-fuchsia-900 border-fuchsia-400 font-serif"; break;
      case 'ALBERTO': base = "bg-emerald-950 text-emerald-400 border-emerald-700 font-mono"; break;
      case 'RINKA': base = "bg-orange-200 text-orange-900 border-orange-400 rounded-br-2xl"; break;
      case 'SHINICHI': base = "bg-indigo-900 text-indigo-100 border-indigo-600 font-serif shadow-inner"; break;
      default: base = "bg-gray-200"; break;
    }
    return `${base} ${isLeft ? 'rounded-tl-none' : 'rounded-tr-none'}`;
  };

  // Determine bubble style based on message role
  const getBubbleStyle = (role: 'user' | 'model') => {
    if (isSpectator) {
      if (role === 'model') return getPersonaBubbleStyle(leftPersona, true);
      if (role === 'user' && rightPersona) return getPersonaBubbleStyle(rightPersona, false);
    }
    
    // Interactive Mode
    if (role === 'user') return "bg-white text-gray-800 border-gray-300 rounded-tr-none";
    return getPersonaBubbleStyle(leftPersona, true);
  };

  const getContainerStyle = () => {
    // If spectator, maybe a split or neutral bg? Let's use left persona's bg for now or neutral.
    if (isSpectator) return 'bg-gray-100';

    switch(leftPersona.type) {
      case 'ALBERTO': return 'bg-black';
      case 'SAMANTHA': return 'bg-indigo-50';
      case 'RINKA': return 'bg-orange-50';
      case 'SHINICHI': return 'bg-slate-900';
      default: return 'bg-gray-50';
    }
  }

  // --- Render ---

  return (
    <div className={`flex flex-col h-full ${getContainerStyle()} transition-colors duration-500`}>
      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => {
          const isUserRole = msg.role === 'user'; // In spectator, this is Right Persona
          const isModelRole = msg.role === 'model'; // In spectator, this is Left Persona
          
          return (
            <div key={msg.id} className={`flex w-full ${isUserRole ? 'justify-end' : 'justify-start'}`}>
              
              {/* Left Persona Avatar (Model Role) */}
              {isModelRole && (
                <div className="flex-shrink-0 mr-3 mt-1">
                   <div className={`w-10 h-10 flex items-center justify-center border-2 shadow-md text-lg font-bold ${leftPersona.avatarStyle}`}>
                      {leftPersona.avatar}
                   </div>
                </div>
              )}

              {/* Message Bubble */}
              <div className={`max-w-[70%] p-3 border-2 shadow-sm ${getBubbleStyle(msg.role)}`}>
                 <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                 <span className="text-[10px] opacity-50 block mt-1 text-right border-t border-current pt-1">
                   {/* Name Label */}
                   {isUserRole 
                      ? (isSpectator ? rightPersona?.name : 'YOU') 
                      : leftPersona.name
                   }
                 </span>
              </div>

              {/* Right Avatar (User Role or Right Persona) */}
              {isUserRole && (
                <div className="flex-shrink-0 ml-3 mt-1">
                   {isSpectator && rightPersona ? (
                      <div className={`w-10 h-10 flex items-center justify-center border-2 shadow-md text-lg font-bold ${rightPersona.avatarStyle}`}>
                        {rightPersona.avatar}
                      </div>
                   ) : (
                      <div className="w-10 h-10 bg-white border-2 border-gray-300 text-gray-400 rounded-full flex items-center justify-center shadow-md">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                           <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                         </svg>
                      </div>
                   )}
                </div>
              )}

            </div>
          );
        })}
        
        {isLoading && (
           <div className={`flex w-full ${messages[messages.length-1].role === 'user' ? 'justify-start' : 'justify-end'}`}>
             {/* If last was User (Right), loading is for Left (Model) -> show on left */}
             {messages[messages.length-1].role === 'user' ? (
                 <>
                   <div className="flex-shrink-0 mr-3 mt-1">
                       <div className={`w-10 h-10 flex items-center justify-center border-2 opacity-50 ${leftPersona.avatarStyle}`}>
                          <span className="animate-spin text-sm">↻</span>
                       </div>
                    </div>
                    <div className={`max-w-[70%] p-3 border-2 opacity-70 ${getPersonaBubbleStyle(leftPersona, true)}`}>
                      <span className="animate-pulse">入力中</span>
                    </div>
                 </>
             ) : (
                 // If last was Model (Left), loading is for Right (User) -> show on right (only in spectator)
                 isSpectator && rightPersona ? (
                     <>
                        <div className={`max-w-[70%] p-3 border-2 opacity-70 ${getPersonaBubbleStyle(rightPersona, false)}`}>
                          <span className="animate-pulse">入力中</span>
                        </div>
                        <div className="flex-shrink-0 ml-3 mt-1">
                           <div className={`w-10 h-10 flex items-center justify-center border-2 opacity-50 ${rightPersona.avatarStyle}`}>
                              <span className="animate-spin text-sm">↻</span>
                           </div>
                        </div>
                     </>
                 ) : null
             )}
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input / Control Area */}
      <div className="p-4 bg-white/50 border-t border-gray-300 backdrop-blur-sm">
        
        {isSpectator ? (
           <div className="flex gap-2 justify-center">
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                disabled={isLoading}
                className={`flex-1 py-3 font-bold uppercase tracking-wider border-2 transition-all 
                    ${isAutoPlaying 
                       ? 'border-red-500 text-red-600 hover:bg-red-50' 
                       : 'bg-black text-white hover:bg-gray-800'
                    }`}
              >
                {isAutoPlaying ? 'STOP CONVERSATION' : 'RESUME'}
              </button>
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="無駄な入力をここへ..."
              className={`flex-1 p-3 border-2 border-gray-400 focus:outline-none focus:border-black bg-white transition-all ${leftPersona.font}`}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 bg-black text-white font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              SEND
            </button>
          </form>
        )}
        
        <div className="mt-2 text-center">
             <button onClick={onReset} className="text-xs text-red-500 hover:text-red-700 underline decoration-dotted">
                [ 別のフレンドを選ぶ / 退出 ]
             </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;