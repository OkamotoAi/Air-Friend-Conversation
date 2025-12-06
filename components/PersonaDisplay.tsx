import React from 'react';
import { PersonaConfig } from '../types';

interface PersonaDisplayProps {
  persona: PersonaConfig; // This is Left
  rightPersona?: PersonaConfig; // This is Right (Optional)
}

const PersonaDisplay: React.FC<PersonaDisplayProps> = ({ persona, rightPersona }) => {
  const getThemeClasses = (p: PersonaConfig) => {
    switch (p.type) {
      case 'TANAKA': return 'bg-slate-200 border-slate-400 text-slate-800';
      case 'SAMANTHA': return 'bg-fuchsia-100 border-fuchsia-400 text-fuchsia-900';
      case 'ALBERTO': return 'bg-emerald-900 border-emerald-500 text-emerald-100';
      case 'RINKA': return 'bg-orange-100 border-orange-400 text-orange-900';
      case 'SHINICHI': return 'bg-indigo-900 border-indigo-500 text-indigo-100';
      default: return 'bg-gray-200';
    }
  };

  if (rightPersona) {
    // Spectator Mode Header
    return (
      <div className="p-2 border-b-4 bg-gray-100 flex items-center justify-between relative overflow-hidden">
         {/* VS Background Text */}
         <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <span className="text-9xl font-black">VS</span>
         </div>

         {/* Left Persona */}
         <div className={`flex-1 flex items-center gap-2 p-2 rounded-r-full border-l-4 ${getThemeClasses(persona)}`}>
            <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center font-bold border rounded-full ${persona.avatarStyle}`}>
              {persona.avatar}
            </div>
            <div className="overflow-hidden">
               <h2 className="text-xs font-bold truncate">{persona.name}</h2>
               <p className="text-[10px] truncate opacity-80">{persona.title}</p>
            </div>
         </div>

         <div className="px-2 font-black italic text-gray-400 text-lg">VS</div>

         {/* Right Persona */}
         <div className={`flex-1 flex flex-row-reverse items-center gap-2 p-2 rounded-l-full border-r-4 ${getThemeClasses(rightPersona)}`}>
            <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center font-bold border rounded-full ${rightPersona.avatarStyle}`}>
              {rightPersona.avatar}
            </div>
            <div className="overflow-hidden text-right">
               <h2 className="text-xs font-bold truncate">{rightPersona.name}</h2>
               <p className="text-[10px] truncate opacity-80">{rightPersona.title}</p>
            </div>
         </div>
      </div>
    )
  }

  // Standard Interactive Mode
  return (
    <div className={`p-4 border-b-4 mb-4 flex items-center gap-4 transition-colors duration-500 ${getThemeClasses(persona)} ${persona.font}`}>
      <div className={`w-16 h-16 flex-shrink-0 flex items-center justify-center text-2xl font-bold border-2 backdrop-blur-sm shadow-md ${persona.avatarStyle}`}>
        {persona.avatar}
      </div>
      <div>
        <h2 className="text-xl font-bold uppercase tracking-widest">{persona.name}</h2>
        <p className="text-sm opacity-80">{persona.title}</p>
        <p className="text-xs mt-1 italic opacity-60 max-w-md">{persona.description}</p>
      </div>
    </div>
  );
};

export default PersonaDisplay;