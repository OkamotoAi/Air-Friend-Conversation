import React, { useState } from 'react';
import { PERSONAS } from '../constants';
import { PersonaConfig, PersonaType } from '../types';

interface PersonaSelectorProps {
  onSelect: (left: PersonaConfig, right?: PersonaConfig) => void;
}

const PersonaSelector: React.FC<PersonaSelectorProps> = ({ onSelect }) => {
  const [mode, setMode] = useState<'interactive' | 'spectator'>('interactive');
  const [leftSelection, setLeftSelection] = useState<PersonaConfig | null>(null);
  const [rightSelection, setRightSelection] = useState<PersonaConfig | null>(null);

  const personas = Object.values(PERSONAS);

  const getCardStyle = (type: PersonaType) => {
    switch (type) {
      case PersonaType.TANAKA:
        return "hover:border-slate-400 hover:bg-slate-50 border-slate-200 text-slate-800";
      case PersonaType.SAMANTHA:
        return "hover:border-fuchsia-400 hover:bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900 font-serif";
      case PersonaType.ALBERTO:
        return "hover:border-emerald-500 hover:bg-emerald-950 hover:text-emerald-100 border-emerald-800 text-emerald-800 bg-emerald-50 font-mono";
      case PersonaType.RINKA:
        return "hover:border-orange-400 hover:bg-orange-50 border-orange-200 text-orange-900 font-sans";
      case PersonaType.SHINICHI:
        return "hover:border-indigo-400 hover:bg-indigo-900 hover:text-indigo-100 border-indigo-800 text-indigo-900 bg-indigo-50 font-serif";
      default:
        return "border-gray-200";
    }
  };

  const handleRandom = () => {
    if (mode === 'interactive') {
      const random = personas[Math.floor(Math.random() * personas.length)];
      onSelect(random);
    } else {
      const p1 = personas[Math.floor(Math.random() * personas.length)];
      const remaining = personas.filter(p => p.type !== p1.type);
      const p2 = remaining[Math.floor(Math.random() * remaining.length)];
      onSelect(p1, p2);
    }
  };

  const handleInteractiveSelect = (persona: PersonaConfig) => {
    onSelect(persona);
  };

  const handleSpectatorSelect = (persona: PersonaConfig) => {
    if (!leftSelection) {
      setLeftSelection(persona);
    } else if (!rightSelection) {
      // Prevent selecting same persona if desired, but for now allow it or just handle logic
      if (leftSelection.type === persona.type) return; 
      setRightSelection(persona);
    } else {
      // Reset if both were selected, start over with left
      setLeftSelection(persona);
      setRightSelection(null);
    }
  };

  const startSpectator = () => {
    if (leftSelection && rightSelection) {
      onSelect(leftSelection, rightSelection);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Mode Tabs */}
      <div className="flex border-b border-gray-300 bg-white">
        <button 
          onClick={() => { setMode('interactive'); setLeftSelection(null); setRightSelection(null); }}
          className={`flex-1 py-3 text-sm font-bold tracking-widest uppercase transition-colors ${mode === 'interactive' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          Interactive Mode
        </button>
        <button 
          onClick={() => { setMode('spectator'); setLeftSelection(null); setRightSelection(null); }}
          className={`flex-1 py-3 text-sm font-bold tracking-widest uppercase transition-colors ${mode === 'spectator' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          Spectator Mode
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold tracking-widest uppercase mb-2">
            {mode === 'interactive' ? 'Select Interlocutor' : 'Select Fighters'}
          </h2>
          <p className="text-xs text-gray-500">
            {mode === 'interactive' ? '誰と不毛な時間を過ごしますか？' : '噛み合わない二人の会話を観戦します。'}
          </p>
        </div>

        {/* Spectator Selection Status */}
        {mode === 'spectator' && (
           <div className="flex justify-center items-center gap-4 mb-8">
             <div className={`w-1/3 p-4 border-2 border-dashed rounded-lg text-center ${leftSelection ? 'border-solid border-black bg-white' : 'border-gray-300'}`}>
                {leftSelection ? (
                  <>
                    <div className={`w-10 h-10 mx-auto flex items-center justify-center border rounded-full mb-2 ${leftSelection.avatarStyle}`}>{leftSelection.avatar}</div>
                    <div className="font-bold text-xs">{leftSelection.name}</div>
                  </>
                ) : <span className="text-xs text-gray-400">SELECT LEFT</span>}
             </div>
             <div className="text-xl font-black text-gray-300">VS</div>
             <div className={`w-1/3 p-4 border-2 border-dashed rounded-lg text-center ${rightSelection ? 'border-solid border-black bg-white' : 'border-gray-300'}`}>
               {rightSelection ? (
                  <>
                    <div className={`w-10 h-10 mx-auto flex items-center justify-center border rounded-full mb-2 ${rightSelection.avatarStyle}`}>{rightSelection.avatar}</div>
                    <div className="font-bold text-xs">{rightSelection.name}</div>
                  </>
                ) : <span className="text-xs text-gray-400">SELECT RIGHT</span>}
             </div>
           </div>
        )}

        <div className="space-y-4">
          {personas.map((persona) => {
             const isSelected = leftSelection?.type === persona.type || rightSelection?.type === persona.type;
             return (
              <button
                key={persona.type}
                onClick={() => mode === 'interactive' ? handleInteractiveSelect(persona) : handleSpectatorSelect(persona)}
                disabled={mode === 'spectator' && isSelected}
                className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-300 group shadow-sm flex items-center gap-4 
                  ${getCardStyle(persona.type)} 
                  ${isSelected ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
                `}
              >
                <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center text-xl font-bold border rounded-md ${persona.avatarStyle} ${!isSelected && 'group-hover:scale-110'} transition-transform`}>
                  {persona.avatar}
                </div>
                <div>
                  <div className="font-bold text-lg">{persona.name}</div>
                  <div className="text-xs opacity-70 mt-1">{persona.title}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 bg-white">
        {mode === 'interactive' ? (
          <button
            onClick={handleRandom}
            className="w-full py-4 bg-gray-900 text-white font-mono text-sm uppercase tracking-widest hover:bg-black transition-colors"
          >
            [ I'm feeling unlucky ]
            <br />
            <span className="text-[10px] normal-case opacity-70">ランダムに選択</span>
          </button>
        ) : (
          <div className="flex gap-2">
             <button
                onClick={handleRandom}
                className="w-1/3 py-4 border-2 border-gray-900 text-gray-900 font-mono text-sm font-bold uppercase hover:bg-gray-100 transition-colors"
              >
                Random
              </button>
             <button
                onClick={startSpectator}
                disabled={!leftSelection || !rightSelection}
                className="w-2/3 py-4 bg-gray-900 text-white font-mono text-sm uppercase tracking-widest hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                START MATCH
              </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonaSelector;